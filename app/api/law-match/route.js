import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Deterministic semantic vector fallback (768 dimensions) for offline resilience.
 */
function generateFallbackEmbedding(text) {
  const vector = new Array(768).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 768;
    vector[idx] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < 768; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }
  }
  return vector;
}

/**
 * Generates vector embedding for the input query using Gemini text-embedding models with fallback.
 */
async function generateQueryEmbedding(text, apiKey) {
  if (!apiKey) {
    return generateFallbackEmbedding(text);
  }

  const models = ["text-embedding-004", "embedding-001"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text }] }
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const data = await response.json();
        const values = data.embedding?.values;
        if (values && Array.isArray(values)) {
          if (values.length === 768) return values;
          const padded = new Array(768).fill(0);
          for (let i = 0; i < Math.min(values.length, 768); i++) padded[i] = values[i];
          return padded;
        }
      }
    } catch (e) {
      // Continue
    }
  }

  return generateFallbackEmbedding(text);
}

const RAG_GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b"
].filter(Boolean);

/**
 * Calls Gemini models with automatic cascading fallback to synthesize plain-language legal explanation.
 */
async function generateRAGExplanation(issueText, chunks, language, apiKey) {
  const sourcesContext = chunks.map((chunk, index) => (
    `[Source ${index + 1}: ${chunk.sourceLabel}]\n${chunk.content}`
  )).join("\n\n");

  const promptLanguage = language === "hi"
    ? "Provide the response in simple, clear Hindi (हिन्दी) so a common citizen can easily understand their rights."
    : "Provide the response in clear, empathetic, plain English.";

  const prompt = `You are an expert legal aid assistant for Nyay Sahayak.
Using ONLY the following retrieved statutory text and legal provisions, explain in simple, empowering language what rights this citizen has, what law applies, and what legal remedies apply to their situation.
Do NOT invent statutory sections or legal claims not present in the retrieved text.

${promptLanguage}

--- RETRIEVED LEGAL KNOWLEDGE SOURCES ---
${sourcesContext}
--- END OF SOURCES ---

Citizen Grievance Description:
"""
${issueText}
"""

Please format your response into 2 brief, well-structured sections:
1. **Applicable Legal Provisions & Your Rights**: Clear explanation of the relevant act, section, and legal entitlements.
2. **Statutory Reliefs & Free Legal Aid**: Available orders/remedies (e.g. protection, compensation, recovery, or free representation under Section 12). Note that income limits for free legal aid vary by state and should be confirmed with the nearest DLSA.`;

  let lastError = null;

  for (const model of RAG_GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2
          }
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } else {
        const errText = await response.text();
        lastError = new Error(`Model ${model} error (${response.status}): ${errText}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate RAG explanation.");
}

/**
 * Cosine similarity calculation helper for fallback search
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, entities, categoryId, language } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return Response.json({
        success: false,
        error: "Input text description is required for law matching."
      }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({
        success: false,
        error: "GEMINI_API_KEY is not configured on the server."
      }, { status: 500 });
    }

    // 1. Build composite query string including entities context if present
    let queryPayload = text;
    if (entities && typeof entities === "object") {
      const parts = [];
      if (entities.partiesMentioned?.length) parts.push(`Parties: ${entities.partiesMentioned.join(", ")}`);
      if (entities.evidenceMentioned?.length) parts.push(`Evidence: ${entities.evidenceMentioned.join(", ")}`);
      if (entities.locationContext) parts.push(`Location: ${entities.locationContext}`);
      if (parts.length) {
        queryPayload = `${text}\n[Context: ${parts.join(" | ")}]`;
      }
    }

    // 2. Generate vector embedding using text-embedding-004
    let queryEmbedding;
    try {
      queryEmbedding = await generateQueryEmbedding(queryPayload, apiKey);
    } catch (embedError) {
      console.error("Embedding generation failed in law-match route:", embedError);
      return Response.json({
        success: false,
        error: "Failed to generate vector embedding for legal query.",
        details: embedError.message
      }, { status: 500 });
    }

    // 3. Perform cosine-similarity search (pgvector native <=> or embeddingJson fallback)
    const embeddingString = `[${queryEmbedding.join(",")}]`;
    let retrievedChunks = [];

    try {
      retrievedChunks = await prisma.$queryRawUnsafe(`
        SELECT 
          "id", 
          "content", 
          "sourceCategory", 
          "sourceLabel",
          1 - ("embedding" <=> $1::vector) AS similarity
        FROM "LegalKnowledgeChunk"
        WHERE "embedding" IS NOT NULL
        ORDER BY "embedding" <=> $1::vector ASC
        LIMIT 5;
      `, embeddingString);
    } catch (dbError) {
      console.warn("Native pgvector query failed, trying embeddingJson fallback:", dbError.message);
      try {
        const rawChunks = await prisma.$queryRawUnsafe(`
          SELECT "id", "content", "sourceCategory", "sourceLabel", "embeddingJson"
          FROM "LegalKnowledgeChunk";
        `);
        if (Array.isArray(rawChunks) && rawChunks.length > 0) {
          retrievedChunks = rawChunks
            .map((c) => ({
              ...c,
              similarity: cosineSimilarity(queryEmbedding, c.embeddingJson)
            }))
            .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
            .slice(0, 5);
        }
      } catch (jsonErr) {
        console.warn("Fallback query also failed:", jsonErr.message);
      }
    }

    // 4. Fallback if vector knowledge base is unseeded or returns no chunks
    if (!retrievedChunks || retrievedChunks.length === 0) {
      // Fall back to category-based lookup if available
      const fallbackCategory = categoryId
        ? await prisma.legalCategory.findUnique({ where: { id: categoryId } })
        : null;

      const fallbackText = fallbackCategory
        ? `${fallbackCategory.plainExplanation}\n\nEligibility Notes: ${fallbackCategory.eligibilityNotes}`
        : "Under Article 39A of the Constitution of India, you are entitled to free legal aid, counsel representation, and advisory services via your District Legal Services Authority (DLSA).";

      return Response.json({
        success: true,
        isFallback: true,
        explanation: fallbackText,
        disclaimer: "This is general legal information, not legal advice for your specific case. Confirm details with your District Legal Services Authority or a qualified lawyer before taking action.",
        sources: [
          {
            id: "fallback_static",
            sourceLabel: fallbackCategory ? fallbackCategory.name : "Article 39A, Constitution of India",
            sourceCategory: categoryId || "other",
            content: fallbackText,
            similarity: 1.0
          }
        ]
      }, { status: 200 });
    }

    // 5. Generate RAG plain-language explanation using retrieved statutory chunks
    const ragExplanation = await generateRAGExplanation(
      text,
      retrievedChunks,
      language || "en",
      apiKey
    );

    return Response.json({
      success: true,
      explanation: ragExplanation,
      disclaimer: "This is general legal information, not legal advice for your specific case. Confirm details with your District Legal Services Authority or a qualified lawyer before taking action.",
      sources: retrievedChunks.map((c) => ({
        id: c.id,
        sourceLabel: c.sourceLabel,
        sourceCategory: c.sourceCategory,
        content: c.content,
        similarity: typeof c.similarity === "number" ? Number(c.similarity.toFixed(3)) : null
      }))
    }, { status: 200 });

  } catch (error) {
    console.error("Law Match API error:", error);
    return Response.json({
      success: false,
      error: "Internal server error during legal knowledge retrieval.",
      details: error.message
    }, { status: 500 });
  }
}
