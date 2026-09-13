/**
 * AI Legal Classifier for Nyay Sahayak
 * Uses Google Gemini API (gemini-1.5-flash) or Groq API as intelligent classification engine
 * with strict JSON response parsing, contextual threat reasoning, and automatic error bubbling.
 */

const VALID_CATEGORIES = new Set([
  "domestic_violence",
  "labor_dispute",
  "consumer_fraud",
  "property_dispute",
  "general_harassment",
  "other"
]);

const SYSTEM_PROMPT = `You are an expert Indian legal triage and categorization AI assistant for Nyay Sahayak.
Analyze the citizen grievance or legal issue statement provided (which may be in English, Hindi, Hinglish, or mixed Indian regional language).

Your task:
1. Classify the issue into EXACTLY ONE of the following categories:
   - "domestic_violence": Physical, emotional, sexual, or economic abuse within domestic/marital relationship, dowry harassment, cruelty by spouse/in-laws.
   - "labor_dispute": Unpaid salary/wages, wrongful termination, gratuity/PF disputes, employer exploitation, minimum wage violations.
   - "consumer_fraud": Defective products, e-commerce scams, billing frauds, warranty refusal, unfair trade practices by sellers or providers.
   - "property_dispute": Land boundary disputes, illegal possession/encroachment, landlord-tenant conflicts, eviction, inheritance/partition disputes.
   - "general_harassment": Stalking, cyberbullying, blackmail, threats to personal safety by neighbors/strangers/acquaintances, criminal nuisance.
   - "other": Legal issues that do not fall into any of the above 5 categories.

2. Contextual High-Risk Assessment:
   Set highRisk to TRUE if there is an active, ongoing, or imminent safety threat requiring immediate intervention (reason contextually, not merely by looking for specific threat words; statements like "he's never done this before but I'm scared of tonight" or "he is standing outside with people" must be marked as true). Set to false otherwise.

3. Entity & Metadata Extraction:
   Extract mentioned parties, location context (city/locality/state if present), timeframe, and any evidence referenced (documents, bills, recordings, messages, CCTV).

Respond ONLY with a valid, parseable JSON object matching this exact schema:
{
  "category": "domestic_violence" | "labor_dispute" | "consumer_fraud" | "property_dispute" | "general_harassment" | "other",
  "confidence": 0.95,
  "urgency": "low" | "medium" | "high",
  "highRisk": true | false,
  "entities": {
    "partiesMentioned": ["string"],
    "locationContext": "string or null",
    "timeframe": "string or null",
    "evidenceMentioned": ["string"]
  },
  "reasoning": "one-sentence plain-language explanation"
}`;

/**
 * Strips markdown code fences (```json ... ```) and extracts the valid JSON object string.
 */
function cleanJsonString(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Invalid or empty response text received from AI");
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // If there is surrounding text, locate the outermost JSON boundaries
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Calls Gemini or Groq API to perform contextual legal classification.
 * Throws an error on API failure, timeout, or schema mismatch so the caller can fall back.
 *
 * @param {string} text - Citizen's grievance statement
 * @returns {Promise<{
 *   category: string,
 *   confidence: number,
 *   urgency: "low" | "medium" | "high",
 *   highRisk: boolean,
 *   entities: {
 *     partiesMentioned: string[],
 *     locationContext: string | null,
 *     timeframe: string | null,
 *     evidenceMentioned: string[]
 *   },
 *   reasoning: string
 * }>}
 */
// Multi-model Gemini fallback sequence
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL, // Custom model if defined by user
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b"
].filter(Boolean);

/**
 * Calls Gemini API with automatic model cascading across multiple models.
 */
async function callGeminiCascade(userPrompt, apiKey) {
  let lastError = null;

  for (const model of GEMINI_MODELS) {
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
              parts: [
                { text: SYSTEM_PROMPT },
                { text: userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } else {
        const errBody = await response.text();
        lastError = new Error(`Model ${model} error (${response.status}): ${errBody}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed in cascade.");
}

export async function classifyWithAI(text) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }

  const userPrompt = `Citizen grievance statement:\n"""\n${text}\n"""`;
  const rawResponseText = await callGeminiCascade(userPrompt, geminiApiKey);

  if (!rawResponseText) {
    throw new Error("No response content received from AI provider.");
  }

  // Parse and strip markdown code fences
  const cleanedJson = cleanJsonString(rawResponseText);
  let parsed;
  try {
    parsed = JSON.parse(cleanedJson);
  } catch (parseError) {
    throw new Error(`Failed to parse AI JSON response: ${parseError.message}`);
  }

  // Validate response shape
  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI response did not return a valid JSON object.");
  }

  if (!parsed.category || !VALID_CATEGORIES.has(parsed.category)) {
    throw new Error(`AI returned invalid category: "${parsed.category}". Expected one of: ${Array.from(VALID_CATEGORIES).join(", ")}`);
  }

  if (typeof parsed.highRisk !== "boolean") {
    throw new Error(`AI returned non-boolean highRisk field: ${typeof parsed.highRisk}`);
  }

  // Normalize and return typed structure
  return {
    category: parsed.category,
    confidence: typeof parsed.confidence === "number" ? Math.min(Math.max(parsed.confidence, 0), 1) : 0.9,
    urgency: ["low", "medium", "high"].includes(parsed.urgency) ? parsed.urgency : (parsed.highRisk ? "high" : "low"),
    highRisk: parsed.highRisk,
    entities: {
      partiesMentioned: Array.isArray(parsed.entities?.partiesMentioned) ? parsed.entities.partiesMentioned : [],
      locationContext: typeof parsed.entities?.locationContext === "string" ? parsed.entities.locationContext : null,
      timeframe: typeof parsed.entities?.timeframe === "string" ? parsed.entities.timeframe : null,
      evidenceMentioned: Array.isArray(parsed.entities?.evidenceMentioned) ? parsed.entities.evidenceMentioned : []
    },
    reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : ""
  };
}
