"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Phone, ShieldAlert, Navigation, MessageSquare, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Map Skeleton Loader to allow fast page render
function MapSkeleton() {
  return (
    <div className="w-full h-80 rounded-2xl bg-base-dark/5 animate-pulse flex flex-col items-center justify-center border border-base-dark/5 text-xs text-base-dark/40 font-semibold space-y-2">
      <div className="h-8 w-8 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
      <span>Loading shelter map directory...</span>
    </div>
  );
}

// Dynamically import Leaflet Map to prevent server-side rendering crashes
const SosMap = dynamic(() => import("@/components/SosMap"), {
  ssr: false,
  loading: () => <MapSkeleton />
});

export default function SosPage() {
  const { t, language } = useLanguage();
  const [trustedContact, setTrustedContact] = useState("");
  const [smsTriggered, setSmsTriggered] = useState(false);

  // Load pre-saved trusted contact from localStorage
  useEffect(() => {
    const savedContact = localStorage.getItem("nyaySahayakTrustedContact");
    if (savedContact) {
      setTrustedContact(savedContact);
    }
  }, []);

  const handleContactChange = (e) => {
    const value = e.target.value.replace(/[^0-9+]/g, ""); // allow digits and +
    setTrustedContact(value);
    localStorage.setItem("nyaySahayakTrustedContact", value);
    setSmsTriggered(false);
  };

  const smsMessage = language === "hi" 
    ? "मुझे सहायता की आवश्यकता है। मैं संकट में हूँ। मेरा वर्तमान स्थान नई दिल्ली है। कृपया तुरंत मुझसे संपर्क करें।" 
    : "I need help. I am in danger. My current location is New Delhi. Please contact me immediately.";

  // Generate SMS URI correctly
  const smsUri = `sms:${trustedContact}?body=${encodeURIComponent(smsMessage)}`;

  return (
    <>
      {/* Pulsing Red Screen Border for Visual Urgency (disabled if prefers-reduced-motion) */}
      <div className="fixed inset-0 pointer-events-none z-50 border-[6px] md:border-[10px] border-danger/60 motion-safe:animate-[pulse_2s_infinite]" />

      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-start">
        {/* Urgent Header */}
        <div className="bg-danger/10 border border-danger/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-8 mt-4 text-center md:text-left">
          <div className="bg-danger text-[#FAF9F6] p-4 rounded-full shadow-md shrink-0">
            <ShieldAlert className="h-8 w-8 text-[#FAF9F6]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-danger tracking-tight">
              {language === "hi" ? "आपातकालीन सहायता सक्रिय" : "Emergency Assistance Active"}
            </h1>
            <p className="text-sm md:text-base text-base-dark/85 mt-2 font-medium leading-relaxed">
              {language === "hi" 
                ? "आप अकेले नहीं हैं। न्याय सहायक आपकी सुरक्षा और सहायता के लिए यहाँ मौजूद है। नीचे दिए गए नंबरों पर तुरंत संपर्क करें या निकटतम सुरक्षित आश्रय स्थल ढूंढें।"
                : "You are not alone. Nyay Sahayak is here to help you find safety and support. Please use the immediate helpline cards or locate the nearest shelter house."}
            </p>
          </div>
        </div>

        {/* Mistriage / Go back option */}
        <div className="text-left mb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{language === "hi" ? "यह कोई आपातकाल नहीं है, वापस जाएं" : "This is not an emergency, go back"}</span>
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Calling Cards & Shelters */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-base-dark flex items-center space-x-2 border-b border-base-dark/5 pb-2 text-left">
              <Phone className="h-5 w-5 text-danger animate-pulse" />
              <span>{language === "hi" ? "तत्काल हेल्पलाइन नंबर" : "Immediate Helpline Call"}</span>
            </h2>

            {/* Helpline Buttons (min 60px height) */}
            <div className="space-y-4">
              <a
                href="tel:181"
                className="w-full h-16 bg-white border border-danger/25 hover:border-danger hover:bg-danger/5 rounded-2xl flex items-center justify-between px-5 shadow-2xs transition-all duration-200"
              >
                <div className="text-left">
                  <span className="text-xs font-extrabold text-danger uppercase tracking-wider block">Women&apos;s Helpline</span>
                  <span className="text-xl font-black text-danger">181</span>
                </div>
                <div className="bg-danger text-[#FAF9F6] p-2 rounded-xl flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
              </a>

              <a
                href="tel:112"
                className="w-full h-16 bg-white border border-danger/25 hover:border-danger hover:bg-danger/5 rounded-2xl flex items-center justify-between px-5 shadow-2xs transition-all duration-200"
              >
                <div className="text-left">
                  <span className="text-xs font-extrabold text-danger uppercase tracking-wider block">Police Emergency</span>
                  <span className="text-xl font-black text-danger">112</span>
                </div>
                <div className="bg-danger text-[#FAF9F6] p-2 rounded-xl flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
              </a>
            </div>

            {/* Shelter Locator Section */}
            <div className="pt-4 space-y-4">
              <h2 className="text-lg font-bold text-base-dark flex items-center space-x-2 border-b border-base-dark/5 pb-2 text-left">
                <Navigation className="h-5 w-5 text-secondary" />
                <span>{language === "hi" ? "निकटतम आश्रय गृह और स्वयंसेवी संस्थाएं" : "Nearest Shelters & NGOs"}</span>
              </h2>

              {/* Dynamic Leaflet Map */}
              <SosMap />
            </div>
          </div>

          {/* Right Column: Silent SMS Alert Setup */}
          <div className="bg-white border border-base-dark/5 p-6 rounded-3xl shadow-2xs flex flex-col justify-between h-full">
            <div className="space-y-6 text-left">
              <h2 className="text-lg font-bold text-base-dark flex items-center space-x-2 border-b border-base-dark/5 pb-4">
                <MessageSquare className="h-5 w-5 text-danger" />
                <span>{language === "hi" ? "मूक (साइलेंट) एसएमएस अलर्ट" : "Silent SMS Alert"}</span>
              </h2>

              <p className="text-xs text-base-dark/75 leading-relaxed">
                {language === "hi"
                  ? "यदि आप फोन पर बात करने की स्थिति में नहीं हैं, तो पहले से सहेजे गए एक विश्वसनीय संपर्क को तुरंत एक पूर्व-लिखा हुआ मदद संदेश भेजें। संदेश में आपका स्थान विवरण भी शामिल होगा।"
                  : "If you cannot speak on the phone, quickly initiate an SMS draft to your trusted contact containing a pre-written distress message and your location."}
              </p>

              {/* Trusted Contact Input */}
              <div className="flex flex-col space-y-2">
                <label htmlFor="trusted-contact" className="text-2xs font-extrabold text-base-dark/65 uppercase tracking-wider">
                  {language === "hi" ? "विश्वसनीय संपर्क नंबर" : "Trusted Contact Number"}
                </label>
                <input
                  id="trusted-contact"
                  type="text"
                  value={trustedContact}
                  onChange={handleContactChange}
                  placeholder="+91 98765 43210"
                  className="w-full p-3.5 rounded-xl border border-base-dark/15 bg-base text-sm font-bold text-base-dark placeholder-base-dark/35 focus:ring-2 focus:ring-danger/10 focus:border-danger focus:outline-none transition-all duration-200"
                />
                <span className="text-[10px] text-base-dark/50 leading-tight">
                  This number is saved locally on your device in localStorage and is never uploaded.
                </span>
              </div>

              {/* Safety Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-800">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-2xs font-semibold leading-normal">
                  {language === "hi"
                    ? "चेतावनी: एसएमएस भेजना आपका मोबाइल नेटवर्क शुल्क लागू कर सकता है। संकट की स्थिति में पुलिस हेल्पलाइन (112) पर सीधे कॉल करना सबसे सुरक्षित विकल्प है।"
                    : "Caution: Triggering SMS requires carrier network services. Calling emergency dispatch (112) is the fastest way to get physical assistance."}
                </span>
              </div>
            </div>

            {/* Silent SMS Trigger Button */}
            <div className="pt-6">
              {trustedContact ? (
                <a
                  href={smsUri}
                  onClick={() => setSmsTriggered(true)}
                  className="w-full py-4 rounded-xl text-lg font-extrabold shadow-md flex items-center justify-center space-x-3 bg-danger text-[#FAF9F6] hover:bg-danger-hover transition-colors min-h-[44px]"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>{language === "hi" ? "मूक एसएमएस भेजें" : "Send Silent SMS"}</span>
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-xl text-sm font-bold bg-base-dark/10 text-base-dark/45 cursor-not-allowed flex items-center justify-center space-x-2 border border-base-dark/5 min-h-[44px]"
                >
                  <span>{language === "hi" ? "अलर्ट के लिए पहले संपर्क नंबर डालें" : "Add Number to Enable SMS Alert"}</span>
                </button>
              )}

              {smsTriggered && (
                <div className="mt-3 bg-[#E7F3F0] text-secondary border border-secondary/20 p-3 rounded-xl text-2xs font-bold text-center">
                  SMS Draft loaded. Please press send on your device&apos;s native SMS app.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
