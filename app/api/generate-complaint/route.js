export const dynamic = "force-dynamic";

const COMPLAINT_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b"
].filter(Boolean);

/**
 * Maps legal categories to designated statutory authorities in India.
 */
function getAuthorityHeader(categoryId, formValues) {
  switch (categoryId) {
    case "domestic_violence":
      return `BEFORE THE HON'BLE COURT OF THE LEARNED MAGISTRATE / PROTECTION OFFICER
DISTRICT: ${formValues.dlsaDistrict || "CENTRAL"} | STATE: ${formValues.dlsaState || "DELHI"}
APPLICATION UNDER SECTIONS 12, 18, 19, 20 & 22 OF THE PROTECTION OF WOMEN FROM DOMESTIC VIOLENCE ACT, 2005`;

    case "labor_dispute":
      return `BEFORE THE HON'BLE DEPUTY LABOUR COMMISSIONER / CONCILIATION OFFICER
OFFICE OF THE LABOUR COMMISSIONER
COMPLAINT UNDER PAYMENT OF WAGES ACT, 1936 & INDUSTRIAL DISPUTES ACT, 1947`;

    case "consumer_fraud":
      return `BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION (DCDRC)
DISTRICT: ${formValues.dlsaDistrict || "CENTRAL"} | STATE: ${formValues.dlsaState || "DELHI"}
COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019`;

    case "property_dispute":
      return `BEFORE THE HON'BLE COURT OF CIVIL JUDGE / DISTRICT LEGAL SERVICES AUTHORITY (DLSA)
DISTRICT: ${formValues.dlsaDistrict || "CENTRAL"} | STATE: ${formValues.dlsaState || "DELHI"}
PETITION / SUMMARY APPLICATION UNDER TRANSFER OF PROPERTY ACT, 1882 & SPECIFIC RELIEF ACT, 1963`;

    case "general_harassment":
      return `TO THE STATION HOUSE OFFICER (SHO)
POLICE STATION: ${formValues.policeStation || "LOCAL POLICE JURISDICTION"}, ${formValues.city || "DELHI"}
FORMAL COMPLAINT UNDER THE BHARATIYA NYAYA SANHITA (BNS), 2023 / INFORMATION TECHNOLOGY ACT, 2000`;

    default:
      return `BEFORE THE SECRETARY / PANEL COUNSEL HELP DESK
DISTRICT LEGAL SERVICES AUTHORITY (DLSA)
DISTRICT: ${formValues.dlsaDistrict || "CENTRAL"} | STATE: ${formValues.dlsaState || "DELHI"}
APPLICATION FOR LEGAL ASSISTANCE UNDER SECTION 12 OF LEGAL SERVICES AUTHORITIES ACT, 1987`;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { categoryId, formValues, factsOfTheCase, language } = body;

    if (!formValues || !factsOfTheCase) {
      return Response.json({
        success: false,
        error: "Missing required form fields or statement of facts."
      }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({
        success: false,
        error: "GEMINI_API_KEY is not configured on the server."
      }, { status: 500 });
    }

    const authorityHeader = getAuthorityHeader(categoryId, formValues);
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const promptLanguage = language === "hi"
      ? "Language: Formal Hindi (हिन्दी) appropriate for Indian courts and administrative authorities."
      : "Language: Formal Indian legal English.";

    const systemPrompt = `You are an expert Indian legal drafting counsel.
Draft a complete, court-ready, formal legal complaint/petition based on the user's specific submitted facts.

Guidelines:
1. Do NOT use blank placeholders like [NAME] or blanks '______'. Use the actual provided details.
2. Structure the document cleanly into standard legal complaint sections:
   - Authority Header & Jurisdiction
   - Cause Title: Complainant vs. Respondent (with names, addresses, contact details)
   - Subject Line (clear and concise)
   - Brief Background / Introduction of Parties
   - Chronological Statement of Facts & Grievance (narrated in professional numbered paragraphs 1, 2, 3...)
   - Applicable Statutory Violations
   - Prayer / Reliefs Sought (numbered specific remedies: e.g. immediate protection orders, unpaid wage recovery + compensation, refund of disputed sum, FIR registration, or free panel counsel aid)
   - Verification paragraph & Signature Space for Complainant
3. Maintain high formal legal decorum, precision, and clarity.
4. Output ONLY the raw complaint text without conversational introduction or markdown code fences.`;

    const userPrompt = `
Generate a formal complaint using the following case data:

${promptLanguage}
Date: ${currentDate}

Designated Authority:
${authorityHeader}

Category: ${categoryId}
Complainant Details:
- Full Name: ${formValues.userName || "Citizen"}
- Father's/Husband's Name: ${formValues.userParentSpouse || "N/A"}
- Phone: ${formValues.userPhone || "N/A"}
- Address: ${formValues.userAddress || "N/A"}
- DLSA District: ${formValues.dlsaDistrict || "Central"}, ${formValues.dlsaState || "Delhi"}

Opposing Party / Respondent Details:
- Name: ${formValues.respondentName || formValues.employerName || formValues.sellerName || "Opposing Party"}
- Address: ${formValues.respondentAddress || formValues.employerAddress || formValues.sellerAddress || "N/A"}
- Police Station: ${formValues.policeStation || "N/A"}
- City / State: ${formValues.city || "N/A"}, ${formValues.state || "N/A"}
- User Designation: ${formValues.userDesignation || "N/A"}
- Outstanding / Disputed Amount: Rs. ${formValues.outstandingAmount || formValues.disputedAmount || "N/A"}
- Compensation Sought: Rs. ${formValues.compensationAmount || "N/A"}
- Property Details: ${formValues.propertyDetails || "N/A"}

Statement of Facts:
"""
${factsOfTheCase}
"""`;

    let generatedText = null;
    let lastError = null;

    for (const model of COMPLAINT_MODELS) {
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
                  { text: systemPrompt },
                  { text: userPrompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2
            }
          }),
          signal: AbortSignal.timeout(18000)
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            // Strip any code fences if present
            generatedText = text.replace(/^```(?:markdown)?\s*/i, "").replace(/\s*```$/i, "").trim();
            break;
          }
        } else {
          const errBody = await response.text();
          lastError = new Error(`Model ${model} returned status ${response.status}: ${errBody}`);
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!generatedText) {
      throw lastError || new Error("Failed to generate complaint text from AI.");
    }

    return Response.json({
      success: true,
      generatedText: generatedText
    }, { status: 200 });

  } catch (error) {
    console.error("Generate Complaint API error:", error);
    return Response.json({
      success: false,
      error: error.message || "Failed to generate AI legal draft."
    }, { status: 500 });
  }
}
