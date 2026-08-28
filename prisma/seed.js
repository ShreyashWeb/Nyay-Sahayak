const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
  {
    id: "domestic_violence",
    name: "Domestic Violence",
    hindiName: "घरेलू हिंसा",
    plainExplanation: "Issues involving physical, emotional, sexual, or economic abuse within a domestic relationship.",
    plainExplanationHindi: "घरेलू संबंधों के भीतर शारीरिक, मानसिक, यौन या आर्थिक शोषण से जुड़े मामले।",
    eligibilityNotes: "Under Section 12 of the Legal Services Authorities Act, 1987, all women and children are automatically eligible for free legal aid, regardless of their income level."
  },
  {
    id: "labor_dispute",
    name: "Labor / Wage Dispute",
    hindiName: "श्रम / मजदूरी विवाद",
    plainExplanation: "Disputes related to unpaid wages, termination, minimum wage violations, or poor working conditions.",
    plainExplanationHindi: "अवैतनिक वेतन, नौकरी से बर्खास्तगी, न्यूनतम वेतन के उल्लंघन, या काम की खराब परिस्थितियों से संबंधित विवाद।",
    eligibilityNotes: "Industrial workmen are eligible for free legal aid. Other laborers are eligible if their annual income is below ₹3,00,000 (limits vary by state)."
  },
  {
    id: "consumer_fraud",
    name: "Consumer Fraud",
    hindiName: "उपभोक्ता धोखाधड़ी",
    plainExplanation: "Scams, defective products, refund issues, or unfair trade practices by sellers or service providers.",
    plainExplanationHindi: "विक्रेताओं या सेवा प्रदाताओं द्वारा धोखाधड़ी, दोषपूर्ण उत्पाद, रिफंड के मुद्दे या अनुचित व्यापार प्रथाएं।",
    eligibilityNotes: "Free legal aid is available if the consumer's annual income is below ₹3,0,000 (varies by state) or if they belong to SC/ST categories."
  },
  {
    id: "property_dispute",
    name: "Property Dispute",
    hindiName: "संपत्ति विवाद",
    plainExplanation: "Land boundary conflicts, illegal possession, landlord-tenant issues, eviction, or inheritance/partition disputes.",
    plainExplanationHindi: "भूमि सीमा विवाद, अवैध कब्जा, मकान मालिक-किराएदार के मामले, बेदखली, या उत्तराधिकार/बंटवारे के विवाद।",
    eligibilityNotes: "Eligible for free legal aid if annual income is below ₹3,00,000 (varies by state) or if belonging to SC/ST, disabled, or other marginal categories."
  },
  {
    id: "general_harassment",
    name: "Criminal Harassment",
    hindiName: "आपराधिक उत्पीड़न",
    plainExplanation: "Cyberbullying, stalking, blackmailing, threats to safety, or ongoing nuisance by individuals.",
    plainExplanationHindi: "साइबरबुलिंग, पीछा करना, ब्लैकमेल करना, सुरक्षा को खतरा, या व्यक्तियों द्वारा किया जाने वाला लगातार उत्पीड़न।",
    eligibilityNotes: "Victims of violence, SC/ST categories, and individuals below the annual income limit are eligible."
  },
  {
    id: "other",
    name: "General / Other Issues",
    hindiName: "सामान्य / अन्य मुद्दे",
    plainExplanation: "Legal issues that do not fall directly into the pre-classified categories.",
    plainExplanationHindi: "कानूनी मुद्दे जो सीधे पूर्व-वर्गीकृत श्रेणियों में नहीं आते हैं।",
    eligibilityNotes: "Free aid eligibility is determined based on general income criteria (typically below ₹3,0,000 annual income) and category criteria."
  }
];

const dlsaOffices = [
  {
    name: "DLSA Central - Tis Hazari Court",
    address: "Tis Hazari Court Complex, Near Tis Hazari Metro Station, Delhi - 110054",
    phone: "011-23971234",
    latitude: 28.6650,
    longitude: 77.2000,
    state: "Delhi",
    district: "Central"
  },
  {
    name: "DLSA South - Saket Court",
    address: "Saket District Court Complex, Sector 6, Pushp Vihar, Saket, New Delhi - 110017",
    phone: "011-29562391",
    latitude: 28.5200,
    longitude: 77.2100,
    state: "Delhi",
    district: "South"
  },
  {
    name: "DLSA East - Karkardooma Court",
    address: "Karkardooma District Court Complex, Shahdara, Delhi - 110032",
    phone: "011-22301928",
    latitude: 28.6550,
    longitude: 77.2950,
    state: "Delhi",
    district: "East"
  },
  {
    name: "DLSA West - Janakpuri Complex",
    address: "Janakpuri District Courts, Near Janakpuri West Metro, New Delhi - 110058",
    phone: "011-25501831",
    latitude: 28.6250,
    longitude: 77.0850,
    state: "Delhi",
    district: "West"
  },
  {
    name: "DLSA North - Rohini Court",
    address: "Rohini District Court Complex, Sector 14, Rohini, Delhi - 110085",
    phone: "011-27551221",
    latitude: 28.7150,
    longitude: 77.1350,
    state: "Delhi",
    district: "North"
  },
  {
    name: "DLSA Gurugram - Judicial Court",
    address: "Judicial Court Complex, Near Rajiv Chowk, Gurugram, Haryana - 122001",
    phone: "0124-2221234",
    latitude: 28.4550,
    longitude: 77.0300,
    state: "Haryana",
    district: "Gurugram"
  },
  {
    name: "DLSA Noida - District Court Surajpur",
    address: "District Court Complex Surajpur, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh - 201306",
    phone: "0120-2561932",
    latitude: 28.5350,
    longitude: 77.3900,
    state: "Uttar Pradesh",
    district: "Gautam Buddha Nagar"
  }
];

const complaintTemplates = [
  {
    categoryId: "domestic_violence",
    template: `To,
The Protection Officer / Station House Officer,
[POLICE_STATION_NAME] Police Station,
[CITY], [STATE].

Subject: Application/Complaint under Section 12 of the Protection of Women from Domestic Violence Act, 2005

Respected Officer,

I, [USER_NAME], daughter/wife of [USER_PARENT_SPOUSE], residing at [USER_ADDRESS], contact number [USER_PHONE], hereby submit this formal complaint against [RESPONDENT_NAME], residing at [RESPONDENT_ADDRESS], for committing acts of domestic violence against me.

Facts of the Case:
[FACTS_OF_THE_CASE]

In light of these facts, I request you to register this complaint and assist me in obtaining the following relief under the DV Act, 2005:
1. Protection orders under Section 18 to prevent further violence.
2. Residence orders under Section 19 to secure safe housing.
3. Monetary relief under Section 20 to cover medical expenses and basic needs.

Yours faithfully,


_________________________
(Signature)
[USER_NAME]
Date: [CURRENT_DATE]`
  },
  {
    categoryId: "labor_dispute",
    template: `To,
The Assistant Labor Commissioner / Labor Court Authority,
Office of the Labor Commissioner,
[DLSA_DISTRICT] District, [DLSA_STATE].

Subject: Claim Statement regarding Non-Payment of Outstanding Wages under the Payment of Wages Act, 1936

Respected Authority,

I, [USER_NAME], son/daughter of [USER_PARENT_SPOUSE], residing at [USER_ADDRESS], contact number [USER_PHONE], was employed by [EMPLOYER_NAME] located at [EMPLOYER_ADDRESS] as a [USER_DESIGNATION].

Facts of the Case:
[FACTS_OF_THE_CASE]

The employer has failed to release my outstanding salary of Rs. [OUTSTANDING_AMOUNT] for the period specified above.

Therefore, I request the Labor Commissioner Office to intervene and direct the employer to:
1. Release my pending salary/wages of Rs. [OUTSTANDING_AMOUNT].
2. Provide interest on unpaid wages at the rate of 12% per annum.
3. Pay compensation for mental harassment and transport expenses.

Yours faithfully,


_________________________
(Signature)
[USER_NAME]
Date: [CURRENT_DATE]`
  },
  {
    categoryId: "consumer_fraud",
    template: `To,
The President,
District Consumer Disputes Redressal Commission,
[DLSA_DISTRICT] District, [DLSA_STATE].

Subject: Consumer Complaint under Section 35 of the Consumer Protection Act, 2019

Respected Commission,

I, [USER_NAME], son/daughter of [USER_PARENT_SPOUSE], residing at [USER_ADDRESS], contact number [USER_PHONE], hereby submit a formal complaint against the seller/service provider [SELLER_NAME], located at [SELLER_ADDRESS], for unfair trade practices and deficiency of service.

Facts of the Case:
[FACTS_OF_THE_CASE]

Due to the defective goods/services provided, I have suffered financial loss and severe mental harassment.

In light of the above facts, I pray for the following relief:
1. Direct the opposite party to refund the disputed transaction amount of Rs. [DISPUTED_AMOUNT].
2. Direct the opposite party to replace the defective product or resolve the service deficiency.
3. Order the opposite party to pay Rs. [COMPENSATION_AMOUNT] as compensation for mental agony and litigation costs.

Yours faithfully,


_________________________
(Signature)
[USER_NAME]
Date: [CURRENT_DATE]`
  },
  {
    categoryId: "property_dispute",
    template: `To,
The District Legal Services Authority (DLSA),
[DLSA_DISTRICT] District, [DLSA_STATE].

Subject: Application for Legal Aid and Mediation in a Property Dispute

Respected Secretary,

I, [USER_NAME], son/daughter of [USER_PARENT_SPOUSE], residing at [USER_ADDRESS], contact number [USER_PHONE], hereby apply for legal assistance and mediation services regarding a property dispute with [RESPONDENT_NAME], residing at [RESPONDENT_ADDRESS].

Facts of the Case:
[FACTS_OF_THE_CASE]

The dispute involves [PROPERTY_DETAILS] and requires mediation or legal representation to prevent illegal encroachment/eviction.

I request the DLSA to:
1. Assign a legal aid counsel to represent me.
2. Reference this case for pre-litigation mediation to settle the dispute amicably.

Yours faithfully,


_________________________
(Signature)
[USER_NAME]
Date: [CURRENT_DATE]`
  },
  {
    categoryId: "general_harassment",
    template: `To,
The Station House Officer (SHO),
[POLICE_STATION_NAME] Police Station,
[CITY], [STATE].

Subject: Complaint regarding Criminal Harassment and Threat to Personal Safety

Respected Officer,

I, [USER_NAME], son/daughter of [USER_PARENT_SPOUSE], residing at [USER_ADDRESS], contact number [USER_PHONE], hereby report a case of continuous harassment and safety threat committed by [RESPONDENT_NAME], residing at/contactable at [RESPONDENT_ADDRESS].

Facts of the Case:
[FACTS_OF_THE_CASE]

The perpetrator's actions have caused severe mental distress and pose a threat to my safety.

Therefore, I request the police department to:
1. Register a First Information Report (FIR) under the relevant sections of the Bharatiya Nyaya Sanhita (BNS).
2. Take immediate action to stop the harassment and provide necessary security.

Yours faithfully,


_________________________
(Signature)
[USER_NAME]
Date: [CURRENT_DATE]`
  },
  {
    categoryId: "other",
    template: `To,
The Secretary,
District Legal Services Authority (DLSA),
[DLSA_DISTRICT] District, [DLSA_STATE].

Subject: Representation for Legal Guidance and Assistance

Respected Secretary,

I, [USER_NAME], son/daughter of [USER_PARENT_SPOUSE], residing at [USER_ADDRESS], contact number [USER_PHONE], submit this representation for legal guidance under Article 39A of the Constitution.

Facts of the Case:
[FACTS_OF_THE_CASE]

I request the DLSA authority to review these facts and provide legal advice, free panel lawyer representation, or refer my dispute to the appropriate legal forum.

Yours faithfully,


_________________________
(Signature)
[USER_NAME]
Date: [CURRENT_DATE]`
  }
];

async function main() {
  console.log("Seeding started...");

  // Seed Legal Categories
  for (const cat of categories) {
    await prisma.legalCategory.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        hindiName: cat.hindiName,
        plainExplanation: cat.plainExplanation,
        plainExplanationHindi: cat.plainExplanationHindi,
        eligibilityNotes: cat.eligibilityNotes
      },
      create: cat
    });
  }
  console.log("Legal categories seeded successfully.");

  // Clear existing DLSA offices to prevent duplication in re-seeding
  await prisma.dLSAOffice.deleteMany({});
  
  // Seed DLSA Offices
  for (const office of dlsaOffices) {
    await prisma.dLSAOffice.create({
      data: office
    });
  }
  console.log("DLSA offices seeded successfully.");

  // Clear existing complaint templates to prevent duplicates
  await prisma.complaintTemplate.deleteMany({});

  // Seed Complaint Templates
  for (const t of complaintTemplates) {
    await prisma.complaintTemplate.create({
      data: t
    });
  }
  console.log("Complaint templates seeded successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeding complete.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
