"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    appName: "Nyay Sahayak",
    appSubtitle: "Justice Assistant",
    navAbout: "About",
    navContact: "Contact",
    navPrivacy: "Privacy Policy",
    navSosBtn: "Emergency Help",
    langToggle: "हिन्दी",

    // Hero Section
    heroTitle: "Nyay Sahayak",
    heroHindiBranding: "न्याय सहायक",
    heroTagline: "India's first AI-assisted legal triage and crisis-response platform",
    heroDesc: "Describe your situation in simple words (text or voice) to receive instant legal category classification, free aid eligibility checks under the Legal Services Authorities Act, 1987, and custom complaint drafts.",
    heroCta: "Describe your issue",

    // Features Section
    featuresTitle: "Platform Capabilities",
    featuresSubtitle: "Empowering citizens with immediate access to justice and crisis support",
    feat1Title: "AI Law Matching",
    feat1Desc: "Instantly maps your issue description to relevant sections of Indian law in plain language.",
    feat2Title: "Aid Eligibility",
    feat2Desc: "Checks if you qualify for free legal aid under Section 12 of the Legal Services Authorities Act, 1987.",
    feat3Title: "DLSA Finder",
    feat3Desc: "Locates the nearest District Legal Services Authority (DLSA) office with interactive mapping.",
    feat4Title: "SOS Response",
    feat4Desc: "Immediate emergency helplines, shelter locators, and silent alerts for high-risk situations.",

    // How It Works
    howTitle: "How It Works",
    howStep1Title: "1. Describe",
    howStep1Desc: "Explain your legal problem in plain language (English or Hindi) using text or voice.",
    howStep2Title: "2. Classify",
    howStep2Desc: "Our system identifies the legal category, urgency, and free aid eligibility.",
    howStep3Title: "3. Locate & Draft",
    howStep3Desc: "Find the nearest DLSA aid office and auto-generate your downloadable complaint PDF.",
    howStep4Title: "4. Resolve",
    howStep4Desc: "Submit your generated complaint to the authority or access emergency helpline support.",

    // Trust & Constitutional basis
    trustTitle: "Constitutional Basis for Free Legal Aid",
    trustText1: "Under **Article 39A** of the Constitution of India, the state is mandated to provide free legal aid to ensure that opportunities for securing justice are not denied to any citizen by reason of economic or other disabilities.",
    trustText2: "Nyay Sahayak assists in triaging cases and facilitating access to the **Legal Services Authorities Act, 1987** network, making justice accessible to everyone.",
    trustDisclaimerTitle: "Legal Disclaimer",
    trustDisclaimerText: "Nyay Sahayak is an informational guidance platform. It does not provide legal advice and is not a substitute for a licensed advocate. No attorney-client relationship is created by using this website.",

    // Footer
    footerRights: "© 2026 Nyay Sahayak. All rights reserved.",
    footerNote: "A citizen-centric legal empowerment initiative.",

    // SOS Page Placeholders
    sosTitle: "EMERGENCY ASSISTANCE (SOS MODE)",
    sosSubtitle: "If you are in immediate danger, please use the contacts below. Your safety is the priority.",
    sosHelplines: "Emergency Helplines",
    sosHelplinePolice: "Police Emergency",
    sosHelplineWomen: "Women's Helpline",
    sosShelters: "Nearest Safe Shelters & NGOs",
    sosSilentAlert: "Silent SMS Alert",
    sosSilentDesc: "Send a discreet help message with your location to emergency services.",
    sosConfirmAlert: "Trigger Silent Alert",
    sosAlertSuccess: "Silent alert initiated! Emergency contacts notified.",
    sosDisclaimer: "Calling emergency numbers directly is the fastest way to get help. Do not close this page if you are in active distress.",

    // Triage Page Placeholders
    triageTitle: "Legal Triage Wizard",
    triageSubtitle: "Describe your problem to receive legal guidance and draft a complaint."
  },
  hi: {
    // Navigation
    appName: "न्याय सहायक",
    appSubtitle: "Nyay Sahayak",
    navAbout: "हमारे बारे में",
    navContact: "संपर्क करें",
    navPrivacy: "गोपनीयता नीति",
    navSosBtn: "आपातकालीन सहायता",
    langToggle: "English",

    // Hero Section
    heroTitle: "न्याय सहायक",
    heroHindiBranding: "Nyay Sahayak",
    heroTagline: "भारत का पहला एआई-सहायता प्राप्त कानूनी सहायता और संकट-प्रतिक्रिया मंच",
    heroDesc: "कानूनी श्रेणियों के वर्गीकरण, कानूनी सेवा प्राधिकरण अधिनियम, 1987 के तहत मुफ्त सहायता पात्रता की जांच और शिकायत ड्राफ्ट प्राप्त करने के लिए अपनी समस्या को सरल शब्दों (पाठ या आवाज) में बताएं।",
    heroCta: "अपनी समस्या बताएं",

    // Features Section
    featuresTitle: "मंच की क्षमताएं",
    featuresSubtitle: "नागरिकों को न्याय और संकट सहायता तक तत्काल पहुंच प्रदान करना",
    feat1Title: "एआई कानून मिलान",
    feat1Desc: "आपकी समस्या के विवरण को सरल भाषा में प्रासंगिक भारतीय कानून की धाराओं से तुरंत मिलाता है।",
    feat2Title: "मुफ्त सहायता पात्रता",
    feat2Desc: "जांचता है कि क्या आप कानूनी सेवा प्राधिकरण अधिनियम, 1987 की धारा 12 के तहत मुफ्त कानूनी सहायता के पात्र हैं।",
    feat3Title: "डीएलएसए खोजक",
    feat3Desc: "इंटरैक्टिव मानचित्र के साथ निकटतम जिला कानूनी सेवा प्राधिकरण (DLSA) कार्यालय का पता लगाता है।",
    feat4Title: "एसओएस प्रतिक्रिया",
    feat4Desc: "उच्च जोखिम वाली स्थितियों के लिए तत्काल आपातकालीन हेल्पलाइन, सुरक्षित आश्रय स्थल और मूक (साइलेंट) अलर्ट।",

    // How It Works
    howTitle: "यह कैसे काम करता है",
    howStep1Title: "1. विवरण दें",
    howStep1Desc: "अपनी कानूनी समस्या को सरल भाषा (अंग्रेजी या हिंदी) में पाठ या आवाज के माध्यम से समझाएं।",
    howStep2Title: "2. वर्गीकृत करें",
    howStep2Desc: "हमारा सिस्टम कानूनी श्रेणी, तात्कालिकता और मुफ्त सहायता पात्रता की पहचान करता है।",
    howStep3Title: "3. खोजें और ड्राफ्ट करें",
    howStep3Desc: "निकटतम डीएलएसए सहायता कार्यालय खोजें और डाउनलोड करने योग्य शिकायत पीडीएफ का स्वतः निर्माण करें।",
    howStep4Title: "4. समाधान करें",
    howStep4Desc: "प्राधिकरण को अपनी शिकायत जमा करें या आपातकालीन हेल्पलाइन सहायता का उपयोग करें।",

    // Trust & Constitutional basis
    trustTitle: "मुफ्त कानूनी सहायता का संवैधानिक आधार",
    trustText1: "भारत के संविधान के **अनुच्छेद 39A** के तहत, राज्य का यह कर्तव्य है कि वह मुफ्त कानूनी सहायता प्रदान करे ताकि यह सुनिश्चित किया जा सके कि आर्थिक या अन्य अक्षमताओं के कारण किसी भी नागरिक को न्याय पाने से वंचित न किया जाए।",
    trustText2: "न्याय सहायक मामलों के वर्गीकरण में सहायता करता है और **कानूनी सेवा प्राधिकरण अधिनियम, 1987** नेटवर्क तक पहुंच को सुगम बनाता है, जिससे न्याय सभी के लिए सुलभ हो जाता है।",
    trustDisclaimerTitle: "कानूनी अस्वीकरण",
    trustDisclaimerText: "न्याय सहायक केवल एक सूचनात्मक मार्गदर्शन मंच है। यह कानूनी सलाह प्रदान नहीं करता है और किसी लाइसेंस प्राप्त वकील का विकल्प नहीं है। इस वेबसाइट के उपयोग से कोई वकील-मुवक्किल संबंध नहीं बनता है।",

    // Footer
    footerRights: "© 2026 न्याय सहायक। सर्वाधिकार सुरक्षित।",
    footerNote: "नागरिक केंद्रित कानूनी सशक्तिकरण पहल।",

    // SOS Page Placeholders
    sosTitle: "आपातकालीन सहायता (एसओएस मोड)",
    sosSubtitle: "यदि आप किसी तत्काल खतरे में हैं, तो कृपया नीचे दिए गए संपर्कों का उपयोग करें। आपकी सुरक्षा प्राथमिकता है।",
    sosHelplines: "आपातकालीन हेल्पलाइन",
    sosHelplinePolice: "पुलिस आपातकाल",
    sosHelplineWomen: "महिला हेल्पलाइन",
    sosShelters: "निकटतम सुरक्षित आश्रय और गैर सरकारी संगठन",
    sosSilentAlert: "मूक (साइलेंट) एसएमएस अलर्ट",
    sosSilentDesc: "आपातकालीन सेवाओं को अपने स्थान के साथ चुपचाप एक मदद संदेश भेजें।",
    sosConfirmAlert: "साइलेंट अलर्ट सक्रिय करें",
    sosAlertSuccess: "साइलेंट अलर्ट शुरू किया गया! आपातकालीन संपर्कों को सूचित कर दिया गया है।",
    sosDisclaimer: "आपातकालीन नंबरों पर सीधे कॉल करना सहायता पाने का सबसे तेज़ तरीका है। यदि आप सक्रिय संकट में हैं तो इस पृष्ठ को बंद न करें।",

    // Triage Page Placeholders
    triageTitle: "कानूनी वर्गीकरण विज़ार्ड",
    triageSubtitle: "कानूनी मार्गदर्शन प्राप्त करने और शिकायत ड्राफ्ट करने के लिए अपनी समस्या का वर्णन करें।"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  // Load language from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && (savedLang === "en" || savedLang === "hi")) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "hi" : "en";
    setLanguage(nextLang);
    localStorage.setItem("preferredLanguage", nextLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
