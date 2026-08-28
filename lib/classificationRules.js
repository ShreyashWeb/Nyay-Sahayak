export const categoryKeywords = {
  domestic_violence: [
    "domestic violence", "husband", "wife", "marriage", "beaten", "beat", "abuse", "slapped", "slap", "torture", "dowry", "harassment by husband", "marital", "assaulted", "hit me",
    "घरेलू हिंसा", "पति", "पत्नी", "मारपीट", "दहेज", "प्रताड़ित", "गाली", "मारा", "ससुराल", "मारता है", "पीटता", "हिंसा", "सताना",
    "marpit", "pati", "patni", "dahej", "marta hai", "peetata", "gharelu hinsa"
  ],
  labor_dispute: [
    "salary", "wage", "wages", "unpaid", "boss", "employer", "work", "worker", "contract", "dismissed", "fired", "termination", "minimum wage", "pf", "provident fund", "gratuity", "overtime",
    "वेतन", "मजदूरी", "तनख्वाह", "मालिक", "कर्मचारी", "नौकरी", "निकाल दिया", "मजदूर", "भत्ता", "काम का समय", "पगार", "सैलरी",
    "salary", "tankhah", "majdoori", "maalik", "nokri", "nikal diya", "pagar"
  ],
  consumer_fraud: [
    "fraud", "scam", "defective", "refund", "consumer court", "cheat", "cheated", "online scam", "product defect", "warranty", "fake product", "overcharged", "shopkeeper", "bill",
    "ठगी", "धोखा", "रिफंड", "नकली सामान", "उपभोक्ता", "वारंटी", "दुकानदार", "बिल", "धोखाधड़ी", "पैसे ठग", "सड़ा हुआ", "खराब माल",
    "dhokhadhadi", "scam", "refund", "nakli", "dukaandar", "thagi", "paise thag liye"
  ],
  property_dispute: [
    "property", "land", "boundary", "landlord", "tenant", "eviction", "title", "registry", "encroachment", "lease", "rent", "agreement", "will", "inheritance", "partition", "possession",
    "जमीन", "संपत्ति", "मकान मालिक", "किराएदार", "कब्जा", "रजिस्ट्री", "विवाद", "किराया", "बंटवारा", "उत्तराधिकार", "वसियत", "दुकान कब्जा",
    "jameen", "zameen", "makan malik", "kirayedar", "kabza", "registry", "batwara", "kiraya"
  ],
  general_harassment: [
    "harassment", "harassed", "cyberbullying", "stalking", "threats", "threatened", "blackmail", "abuse", "bully", "stalk", "eve teasing", "online abuse",
    "उत्पीड़न", "परेशान", "ब्लैकमेल", "धमकी", "पीछा", "तंग करना", "गाली गलौज", "डराना", "धमकाना",
    "pareshan", "threat", "dhamki", "blackmail", "picha karna", "tang karna"
  ]
};

export const riskKeywords = [
  "danger", "unsafe", "kill me", "threat to life", "beating me", "hitting me", "immediate help", "he has a weapon", "weapon", "abuse now", "locked inside", "cannot escape", "sos", "emergency", "he is here", "ongoing violence",
  "खतरा", "असुरक्षित", "जान से मारने", "मार रहा है", "बचाओ", "हथियार", "ताला बंद", "भाग नहीं", "आपातकाल", "पुलिस बुलाओ",
  "khatra", "bachao", "unsafe", "maar raha hai", "dhamki de raha hai", "police bulao", "emergency"
];

export function classifyText(text) {
  if (!text) {
    return { category: "other", highRisk: false };
  }

  const normalizedText = text.toLowerCase();

  // 1. Detect High Risk
  const isHighRisk = riskKeywords.some(keyword => normalizedText.includes(keyword.toLowerCase()));

  // 2. Count matches for each category
  const matches = {};
  let maxCount = 0;
  let bestCategory = "other";

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let count = 0;
    keywords.forEach(keyword => {
      if (normalizedText.includes(keyword.toLowerCase())) {
        count++;
      }
    });
    matches[category] = count;
    if (count > maxCount) {
      maxCount = count;
      bestCategory = category;
    }
  }

  // If no keywords match, it falls back to "other"
  if (maxCount === 0) {
    bestCategory = "other";
  }

  return {
    category: bestCategory,
    highRisk: isHighRisk,
    scores: matches
  };
}
