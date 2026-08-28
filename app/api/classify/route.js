import prisma from "@/lib/prisma";
import { classifyText } from "@/lib/classificationRules";

export const dynamic = "force-dynamic";

const categoryDetails = {
  domestic_violence: {
    name: "Domestic Violence",
    hindiName: "घरेलू हिंसा",
    plainExplanation: "Issues involving physical, emotional, sexual, or economic abuse within a domestic relationship.",
    plainExplanationHindi: "घरेलू संबंधों के भीतर शारीरिक, मानसिक, यौन या आर्थिक शोषण से जुड़े मामले।",
    eligibilityNotes: "Under Section 12 of the Legal Services Authorities Act, 1987, all women and children are automatically eligible for free legal aid, regardless of their income level."
  },
  labor_dispute: {
    name: "Labor / Wage Dispute",
    hindiName: "श्रम / मजदूरी विवाद",
    plainExplanation: "Disputes related to unpaid wages, termination, minimum wage violations, or poor working conditions.",
    plainExplanationHindi: "अवैतनिक वेतन, नौकरी से बर्खास्तगी, न्यूनतम वेतन के उल्लंघन, या काम की खराब परिस्थितियों से संबंधित विवाद।",
    eligibilityNotes: "Industrial workmen are eligible for free legal aid. Other laborers are eligible if their annual income is below ₹3,00,000 (limits vary by state)."
  },
  consumer_fraud: {
    name: "Consumer Fraud",
    hindiName: "उपभोक्ता धोखाधड़ी",
    plainExplanation: "Scams, defective products, refund issues, or unfair trade practices by sellers or service providers.",
    plainExplanationHindi: "विक्रेताओं या सेवा प्रदाताओं द्वारा धोखाधड़ी, दोषपूर्ण उत्पाद, रिफंड के मुद्दे या अनुचित व्यापार प्रथाएं।",
    eligibilityNotes: "Free legal aid is available if the consumer's annual income is below ₹3,00,000 (varies by state) or if they belong to SC/ST categories."
  },
  property_dispute: {
    name: "Property Dispute",
    hindiName: "संपत्ति विवाद",
    plainExplanation: "Land boundary conflicts, illegal possession, landlord-tenant issues, eviction, or inheritance/partition disputes.",
    plainExplanationHindi: "भूमि सीमा विवाद, अवैध कब्जा, मकान मालिक-किराएदार के मामले, बेदखली, या उत्तराधिकार/बंटवारे के विवाद।",
    eligibilityNotes: "Eligible for free legal aid if annual income is below ₹3,00,000 (varies by state) or if belonging to SC/ST, disabled, or other marginal categories."
  },
  general_harassment: {
    name: "Criminal Harassment",
    hindiName: "आपराधिक उत्पीड़न",
    plainExplanation: "Cyberbullying, stalking, blackmailing, threats to safety, or ongoing nuisance by individuals.",
    plainExplanationHindi: "साइबरबुलिंग, पीछा करना, ब्लैकमेल करना, सुरक्षा को खतरा, या व्यक्तियों द्वारा किया जाने वाला लगातार उत्पीड़न।",
    eligibilityNotes: "Victims of violence, SC/ST categories, and individuals below the annual income limit are eligible."
  },
  other: {
    name: "General / Other Issues",
    hindiName: "सामान्य / अन्य मुद्दे",
    plainExplanation: "Legal issues that do not fall directly into the pre-classified categories.",
    plainExplanationHindi: "कानूनी मुद्दे जो सीधे पूर्व-वर्गीकृत श्रेणियों में नहीं आते हैं।",
    eligibilityNotes: "Free aid eligibility is determined based on general income criteria (typically below ₹3,00,000 annual income) and category criteria."
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, language, userId } = body;

    if (!text || text.trim().split(/\s+/).length < 10) {
      return Response.json({
        success: false,
        error: "Text description must be at least 10 words long."
      }, { status: 400 });
    }

    // 1. Run rule-based classification
    const classification = classifyText(text);
    const { category, highRisk } = classification;

    // 2. Resolve User (create if not exist or missing)
    let dbUser;
    if (userId) {
      dbUser = await prisma.user.findUnique({ where: { id: userId } });
    }

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          language: language || "en"
        }
      });
    }

    // 3. Upsert LegalCategory dynamically to guarantee Fkey constraints
    const details = categoryDetails[category] || categoryDetails.other;
    const dbCategory = await prisma.legalCategory.upsert({
      where: { name: details.name },
      update: {},
      create: {
        id: category, // Use the readable category string as primary key ID
        name: details.name,
        hindiName: details.hindiName,
        plainExplanation: details.plainExplanation,
        plainExplanationHindi: details.plainExplanationHindi,
        eligibilityNotes: details.eligibilityNotes
      }
    });

    // 4. Create the Case
    const dbCase = await prisma.case.create({
      data: {
        userId: dbUser.id,
        categoryId: dbCategory.id,
        status: "DRAFT",
        urgency: highRisk ? "SOS" : "LOW"
      }
    });

    // 5. Create linked ComplaintDraft storing raw description text
    const dbDraft = await prisma.complaintDraft.create({
      data: {
        caseId: dbCase.id,
        draftData: {
          rawDescription: text,
          language: language || "en",
          categoryName: dbCategory.name,
          urgency: highRisk ? "SOS" : "LOW",
          generatedAt: new Date().toISOString()
        }
      }
    });

    return Response.json({
      success: true,
      caseId: dbCase.id,
      userId: dbUser.id,
      category: category,
      highRisk: highRisk,
      categoryName: dbCategory.name,
      draftId: dbDraft.id
    }, { status: 200 });

  } catch (error) {
    console.error("Classification API error:", error);
    return Response.json({
      success: false,
      error: "Internal server error during classification.",
      details: error.message
    }, { status: 500 });
  }
}
