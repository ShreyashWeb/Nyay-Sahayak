/**
 * One-time Seed Script: Knowledge Base & Vector Embedding Engine
 *
 * 1. Enables pgvector extension in PostgreSQL / Neon Lakebase (or JSON fallback).
 * 2. Ensures the LegalKnowledgeChunk table exists.
 * 3. Chunks the Phase 4 legal content and statutory provisions.
 * 4. Generates 768-dimensional vector embeddings using Google Gemini (text-embedding-004 / embedding-001 with offline vector fallback).
 * 5. Stores chunks with embeddings in the database for RAG retrieval.
 *
 * Run with: node scripts/seedKnowledgeBase.js
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env.local or .env if not loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function loadEnvFile(filePath, override = false) {
  if (fs.existsSync(filePath)) {
    const envConfig = fs.readFileSync(filePath, "utf-8");
    for (const line of envConfig.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex !== -1) {
        const key = trimmed.substring(0, equalsIndex).trim();
        let value = trimmed.substring(equalsIndex + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        if (override || !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile(path.join(rootDir, ".env"), false);
loadEnvFile(path.join(rootDir, ".env.local"), true);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Phase 4 Legal Knowledge Content
 */
export const LEGAL_KNOWLEDGE_CHUNKS = [
  // 1. Free Legal Aid Eligibility (Section 12, Legal Services Authorities Act, 1987)
  {
    id: "chunk_eligibility_automatic",
    sourceCategory: "other",
    sourceLabel: "Legal Services Authorities Act, 1987 - Section 12 (Automatic Free Legal Aid)",
    content: `Free legal aid eligibility under Section 12 of the Legal Services Authorities Act, 1987:
Automatically eligible regardless of income:
- Women (any case)
- Children, until age 18
- Members of Scheduled Castes / Scheduled Tribes (SC/ST)
- Victims of trafficking or forced labour (Article 23 of Constitution)
- Victims of mass disaster, ethnic violence, caste atrocity, flood, drought, earthquake, or industrial disaster
- Persons with disabilities
- Persons in custody`
  },
  {
    id: "chunk_eligibility_income",
    sourceCategory: "other",
    sourceLabel: "Legal Services Authorities Act, 1987 - Section 12(h) (Income-Based Eligibility Criteria)",
    content: `Income-based free legal aid eligibility:
Everyone else is eligible if annual income is below the limit set by their State Government (for cases outside the Supreme Court), or below ₹5 lakh for Supreme Court cases. Income limits vary by state and are revised periodically. Limits should be confirmed with the nearest District Legal Services Authority (DLSA).`
  },

  // 2. Domestic Violence
  {
    id: "chunk_domestic_violence",
    sourceCategory: "domestic_violence",
    sourceLabel: "Protection of Women from Domestic Violence Act, 2005",
    content: `Domestic Violence Law & Protections:
Law: Protection of Women from Domestic Violence Act, 2005.
Explanation: Right to protection from physical, emotional, sexual, or economic abuse by a partner or family member, regardless of marital status. Aggrieved persons can obtain a protection order prohibiting violence/entry/communication, secure the right to stay in the shared household without illegal eviction, and claim maintenance and monetary relief — without needing to file a criminal case first.
Eligibility: Automatically eligible for free legal aid as a woman.`
  },

  // 3. Labor / Wage Dispute
  {
    id: "chunk_labor_dispute",
    sourceCategory: "labor_dispute",
    sourceLabel: "Payment of Wages Act, 1936 & Industrial Disputes Act, 1947",
    content: `Labor & Wage Dispute Protections:
Law: Payment of Wages Act, 1936 and Industrial Disputes Act, 1947.
Explanation: Employers must pay agreed wages on time and cannot make unauthorized deductions. If denied wages, terminated unfairly, or not paid overtime owed, workers can file a complaint with the Labour Commissioner's office or raise an industrial dispute before the Conciliation Officer / Labour Court.
Eligibility: Income-based (under state ceiling), or automatic categories (e.g. SC/ST, disabled, women, custody).`
  },

  // 4. Consumer Fraud
  {
    id: "chunk_consumer_fraud",
    sourceCategory: "consumer_fraud",
    sourceLabel: "Consumer Protection Act, 2019",
    content: `Consumer Rights & Fraud Redressal:
Law: Consumer Protection Act, 2019.
Explanation: Right to file a complaint against defective goods, deficient services, unfair trade practices, misleading ads, or overcharging — through a District Consumer Disputes Redressal Commission (DCDRC) or e-Daakhil online portal, without needing a lawyer for smaller claims. Commissions can order refund, replacement, and compensation.
Eligibility: Income-based (under state ceiling), or automatic categories.`
  },

  // 5. Property Dispute
  {
    id: "chunk_property_dispute",
    sourceCategory: "property_dispute",
    sourceLabel: "Transfer of Property Act, 1882 & State Tenancy / Revenue Laws",
    content: `Property & Tenancy Protections:
Law: Transfer of Property Act, 1882 (plus relevant state tenancy and revenue laws).
Explanation: Covers disputes over property ownership, illegal possession/dispossession, tenancy rights, eviction notice requirements, or inheritance/partition. Documentation (sale deed, registration papers, electricity bills, mutation records) matters a lot — gather these before your DLSA visit.
Eligibility: Income-based (under state ceiling), or automatic categories.`
  },

  // 6. General Harassment
  {
    id: "chunk_general_harassment",
    sourceCategory: "general_harassment",
    sourceLabel: "Bharatiya Nyaya Sanhita, 2023 (Criminal Intimidation & Stalking)",
    content: `Criminal Harassment Protections:
Law: Bharatiya Nyaya Sanhita (BNS), 2023 (relevant sections on criminal intimidation, stalking, and harassment — varies by specific conduct).
Explanation: Covers threats, stalking, or intimidation that don't rise to an immediate safety risk (if it does, that should have triggered SOS Mode already). Citizens can file a police complaint (FIR) or approach the DLSA for guidance and free panel lawyer representation.
Eligibility: Income-based (under state ceiling), or automatic categories.`
  }
];

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
 * Calls Gemini text-embedding API with multiple endpoints and fallback.
 */
async function generateEmbedding(text) {
  if (!GEMINI_API_KEY) {
    return generateFallbackEmbedding(text);
  }

  const models = ["text-embedding-004", "embedding-001"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text }] }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const values = data.embedding?.values;
        if (values && Array.isArray(values)) {
          // If 768 dimensions, return as is; if 768 pad/trim
          if (values.length === 768) return values;
          const padded = new Array(768).fill(0);
          for (let i = 0; i < Math.min(values.length, 768); i++) padded[i] = values[i];
          return padded;
        }
      }
    } catch (e) {
      // Continue to next model
    }
  }

  // Graceful offline fallback
  return generateFallbackEmbedding(text);
}

/**
 * Main seeding workflow.
 */
async function main() {
  console.log("==================================================");
  console.log(" Nyay Sahayak Phase 4 Knowledge Base Vector Seeder");
  console.log("==================================================");

  console.log("1. Checking pgvector extension and table schema...");
  let hasPgVector = false;

  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    hasPgVector = true;
    console.log("   ✅ pgvector extension enabled.");
  } catch (e) {
    console.warn("   ℹ️ pgvector extension not present in local engine. Using JSON fallback for embeddings.");
  }

  try {
    if (hasPgVector) {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "LegalKnowledgeChunk" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "content" TEXT NOT NULL,
          "sourceCategory" TEXT NOT NULL,
          "sourceLabel" TEXT NOT NULL,
          "embedding" vector(768),
          "embeddingJson" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "LegalKnowledgeChunk" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "content" TEXT NOT NULL,
          "sourceCategory" TEXT NOT NULL,
          "sourceLabel" TEXT NOT NULL,
          "embeddingJson" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    console.log("   ✅ LegalKnowledgeChunk table verified.");
  } catch (dbErr) {
    console.error("   ❌ Database initialization error:", dbErr.message);
    process.exit(1);
  }

  console.log(`\n2. Generating embeddings and inserting ${LEGAL_KNOWLEDGE_CHUNKS.length} Phase 4 chunks...`);

  let count = 0;
  for (const chunk of LEGAL_KNOWLEDGE_CHUNKS) {
    try {
      console.log(`   Embedding [${chunk.sourceCategory}]: "${chunk.sourceLabel}"`);
      
      const embedding = await generateEmbedding(`${chunk.sourceLabel}\n\n${chunk.content}`);
      const embeddingString = `[${embedding.join(",")}]`;
      const embeddingJsonString = JSON.stringify(embedding);

      if (hasPgVector) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "LegalKnowledgeChunk" ("id", "content", "sourceCategory", "sourceLabel", "embedding", "embeddingJson", "createdAt")
           VALUES ($1, $2, $3, $4, $5::vector, $6::jsonb, NOW())
           ON CONFLICT ("id") DO UPDATE SET
             "content" = EXCLUDED."content",
             "sourceCategory" = EXCLUDED."sourceCategory",
             "sourceLabel" = EXCLUDED."sourceLabel",
             "embedding" = EXCLUDED."embedding",
             "embeddingJson" = EXCLUDED."embeddingJson";`,
          chunk.id,
          chunk.content,
          chunk.sourceCategory,
          chunk.sourceLabel,
          embeddingString,
          embeddingJsonString
        );
      } else {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "LegalKnowledgeChunk" ("id", "content", "sourceCategory", "sourceLabel", "embeddingJson", "createdAt")
           VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
           ON CONFLICT ("id") DO UPDATE SET
             "content" = EXCLUDED."content",
             "sourceCategory" = EXCLUDED."sourceCategory",
             "sourceLabel" = EXCLUDED."sourceLabel",
             "embeddingJson" = EXCLUDED."embeddingJson";`,
          chunk.id,
          chunk.content,
          chunk.sourceCategory,
          chunk.sourceLabel,
          embeddingJsonString
        );
      }

      count++;
    } catch (err) {
      console.error(`   ❌ Failed to process chunk ${chunk.sourceLabel}:`, err.message);
    }
  }

  console.log(`\n✅ Successfully seeded ${count}/${LEGAL_KNOWLEDGE_CHUNKS.length} knowledge chunks into database.`);
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Fatal seed error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
