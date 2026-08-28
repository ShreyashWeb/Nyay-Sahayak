"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, CheckCircle2, AlertCircle, MapPin, ChevronDown, ChevronUp, Search, Compass, Phone, FileText, ArrowRight, ArrowLeft, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Map Skeleton Loader
function MapSkeleton() {
  return (
    <div className="w-full h-96 rounded-2xl bg-base-dark/10 animate-pulse flex flex-col items-center justify-center border border-base-dark/5 text-xs text-base-dark/60 font-semibold space-y-2">
      <div className="h-6 w-6 rounded-full border-2 border-secondary/20 border-t-secondary animate-spin" />
      <span>Loading DLSA directory map... / नक्शा लोड हो रहा है...</span>
    </div>
  );
}

// Results Content Skeleton Loader
function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse mt-4">
      {/* Case Header Skeleton */}
      <div className="bg-white border border-base-dark/5 rounded-3xl p-6 md:p-8 space-y-3">
        <div className="h-6 bg-base-dark/10 rounded-lg w-1/3" />
        <div className="h-4 bg-base-dark/5 rounded-lg w-2/3" />
        <div className="h-10 bg-base-dark/5 rounded-xl w-48 mt-2" />
      </div>

      {/* Law Card Skeleton */}
      <div className="bg-white border border-base-dark/5 rounded-3xl p-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 w-1/2">
          <div className="h-6 w-6 bg-base-dark/10 rounded-full" />
          <div className="h-4 bg-base-dark/10 rounded-lg w-2/3" />
        </div>
        <div className="h-4 w-4 bg-base-dark/10 rounded-full" />
      </div>

      {/* NALSA Checker Skeleton */}
      <div className="bg-white border border-base-dark/5 rounded-3xl p-6 md:p-8 space-y-4">
        <div className="h-6 bg-base-dark/10 rounded-lg w-1/4" />
        <div className="h-4 bg-base-dark/5 rounded-lg w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-20 bg-base-dark/5 rounded-2xl" />
          <div className="h-20 bg-base-dark/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// Dynamically import Leaflet Map
const ResultsMap = dynamic(() => import("@/components/ResultsMap"), {
  ssr: false,
  loading: () => <MapSkeleton />
});

// Categories list for correction dropdown
const categoriesList = [
  { id: "domestic_violence", label: "Domestic Violence / घरेलू हिंसा" },
  { id: "labor_dispute", label: "Labor / Wage Dispute / श्रम विवाद" },
  { id: "consumer_fraud", label: "Consumer Fraud / उपभोक्ता धोखाधड़ी" },
  { id: "property_dispute", label: "Property Dispute / संपत्ति विवाद" },
  { id: "general_harassment", label: "Criminal Harassment / आपराधिक उत्पीड़न" },
  { id: "other", label: "General / Other Issues / अन्य मुद्दे" }
];

function ResultsContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [caseData, setCaseData] = useState(null);
  const [loadingCase, setLoadingCase] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [lawExpanded, setLawExpanded] = useState(false);

  // NALSA Form State
  const [nalsaProfile, setNalsaProfile] = useState({
    demographic: "woman_child", // "woman_child", "sc_st", "disabled", "workman", "custody", "general"
    incomeBracket: "under_3l" // "under_3l", "over_3l"
  });

  // DLSA Locator State
  const [dlsaOffices, setDlsaOffices] = useState([]);
  const [loadingDlsa, setLoadingDlsa] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCase = useCallback(async () => {
    if (!caseId) return;
    try {
      setLoadingCase(true);
      setErrorMsg("");
      const response = await fetch(`/api/cases/${caseId}`);
      const data = await response.json();
      if (data.success) {
        setCaseData(data.case);
        setActiveCategory(data.case.categoryId);
      } else {
        setErrorMsg("Failed to load case data.");
      }
    } catch (err) {
      console.error("Fetch case error:", err);
      setErrorMsg("Failed to reach case API.");
    } finally {
      setLoadingCase(false);
    }
  }, [caseId]);

  // Fetch Case Data on mount
  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  // Fetch DLSA offices (initially without location coordinates)
  useEffect(() => {
    const fetchDlsas = async () => {
      try {
        setLoadingDlsa(true);
        let url = "/api/dlsa";
        const params = [];
        if (selectedState) params.push(`state=${encodeURIComponent(selectedState)}`);
        if (searchQuery) params.push(`query=${encodeURIComponent(searchQuery)}`);
        if (params.length > 0) url += `?${params.join("&")}`;

        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          setDlsaOffices(data.offices);
        }
      } catch (err) {
        console.error("Fetch DLSAs error:", err);
      } finally {
        setLoadingDlsa(false);
      }
    };

    fetchDlsas();
  }, [selectedState, searchQuery]);

  // Trigger Category Update PATCH request
  const handleCategoryChange = async (e) => {
    const newCatId = e.target.value;
    setActiveCategory(newCatId);

    try {
      setLoadingCase(true);
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: newCatId })
      });
      const data = await response.json();
      if (data.success) {
        setCaseData(data.case);
      } else {
        setErrorMsg("Failed to update case category.");
      }
    } catch (err) {
      console.error("Update category error:", err);
      setErrorMsg("Failed to connect to category update API.");
    } finally {
      setLoadingCase(false);
    }
  };

  // Get User Coordinates via Browser Geolocation API
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords([lat, lng]);

        // Query PostGIS distance sorted DLSAs
        try {
          setLoadingDlsa(true);
          const response = await fetch(`/api/dlsa?lat=${lat}&lng=${lng}`);
          const data = await response.json();
          if (data.success) {
            setDlsaOffices(data.offices);
          }
        } catch (err) {
          console.error("Geolocation fetch error:", err);
        } finally {
          setLoadingDlsa(false);
          setLocatingUser(false);
        }
      },
      (error) => {
        console.warn("Geolocation permission error:", error);
        setErrorMsg("Could not access your location. Showing default listings.");
        setLocatingUser(false);
      }
    );
  };

  // Calculate NALSA Free Legal Aid Eligibility
  const checkNalsaEligibility = () => {
    const { demographic, incomeBracket } = nalsaProfile;
    // Section 12 list: Women/Children, SC/ST, Disabled, Workman, Custody are automatically eligible regardless of income
    if (demographic !== "general") {
      return {
        status: "eligible",
        message: language === "hi"
          ? "आप निःशुल्क कानूनी सहायता के लिए पात्र हैं! (धारा 12 के तहत विशेष श्रेणी)"
          : "You are Eligible for Free Legal Aid! (Special category under Section 12)"
      };
    }

    // General category requires income check
    if (incomeBracket === "under_3l") {
      return {
        status: "eligible",
        message: language === "hi"
          ? "आप निःशुल्क कानूनी सहायता के लिए पात्र हैं! (आय ₹3 लाख से कम है)"
          : "You are Eligible for Free Legal Aid! (Annual income is under ₹3 Lakhs)"
      };
    }

    // Over 3 Lakhs General Category
    return {
      status: "verify",
      message: language === "hi"
        ? "आपकी पात्रता की जांच डीएलएसए कार्यालय द्वारा की जानी चाहिए। (आय सीमा भिन्न हो सकती है)"
        : "You may need to verify eligibility. Contact your nearest DLSA (income limits vary by state)."
    };
  };

  const eligibility = checkNalsaEligibility();

  if (loadingCase && !caseData) {
    return <ResultsSkeleton />;
  }

  if (errorMsg || !caseData) {
    return (
      <div className="bg-white border border-danger/15 rounded-3xl p-8 shadow-sm text-center space-y-6 max-w-lg mx-auto mt-8">
        <div className="mx-auto bg-danger/10 text-danger p-4 rounded-full w-16 h-16 flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            {language === "hi" ? "केस विवरण लोड नहीं हो सका" : "Could Not Load Case Details"}
          </h2>
          <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">
            {language === "hi"
              ? "हम आपका केस सारांश पुनर्प्राप्त नहीं कर सके। आपका इनपुट अभी भी सत्र में सुरक्षित है।"
              : "We couldn't retrieve your legal aid summary. Your case input is still safe in your session."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fetchCase()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-secondary text-[#FAF9F6] hover:bg-secondary-hover px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md min-h-[44px]"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>{language === "hi" ? "पुनः प्रयास करें" : "Retry Loading"}</span>
          </button>
          <Link href="/">
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 border border-secondary/35 text-secondary hover:bg-secondary/5 px-6 py-3.5 rounded-xl text-xs font-bold transition-all min-h-[44px]">
              <ArrowLeft className="h-4 w-4" />
              <span>{language === "hi" ? "मुख्य पृष्ठ" : "Back to Home"}</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryExplanation = language === "hi" 
    ? caseData?.category?.plainExplanationHindi 
    : caseData?.category?.plainExplanation;

  return (
    <div className="space-y-8">
      {/* 1. Case Classification Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-base-dark/5 rounded-3xl p-6 md:p-8 shadow-xs text-left"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="space-y-1">
            <span className="bg-secondary/10 text-secondary font-bold text-2xs uppercase tracking-widest px-2.5 py-1 rounded-full">
              Automated Triage Result
            </span>
            <h1 className="text-2xl font-extrabold text-base-dark tracking-tight pt-1">
              {language === "hi" ? "वर्गीकरण परिणाम" : "Analysis & Results"}
            </h1>
            <p className="text-sm text-base-dark/75">
              {language === "hi" ? "हमारा एआई इंजन इस मामले को इस प्रकार वर्गीकृत करता है:" : "Our engine classifies your issue as:"}
            </p>
            <strong className="text-lg font-bold text-primary block pt-1">
              {language === "hi" ? caseData?.category?.hindiName : caseData?.category?.name}
            </strong>
          </div>

          {/* Classification Correction Select menu */}
          <div className="flex flex-col space-y-1.5 w-full md:w-64">
            <label htmlFor="category-correction" className="text-[10px] font-extrabold text-base-dark/60 uppercase tracking-wider">
              {language === "hi" ? "यदि वर्गीकरण गलत है, तो बदलें" : "Correct if classification is wrong"}
            </label>
            <select
              id="category-correction"
              value={activeCategory}
              onChange={handleCategoryChange}
              className="w-full p-3 rounded-xl border border-base-dark/15 bg-base text-xs font-bold text-base-dark/80 focus:ring-2 focus:ring-secondary/15 focus:outline-none"
            >
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
 
      {/* 2. Collapsible Applicable Law Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-base-dark/5 rounded-3xl p-6 shadow-xs text-left"
      >
        <button
          onClick={() => setLawExpanded(!lawExpanded)}
          aria-expanded={lawExpanded}
          aria-controls="law-details-panel"
          aria-label="Toggle legal rights and statutory explanation"
          className="w-full flex items-center justify-between font-bold text-[#1A1A1A]"
        >
          <div className="flex items-center space-x-2.5">
            <Scale className="h-5 w-5 text-secondary" />
            <span className="text-[#1A1A1A] md:text-lg">
              {language === "hi" ? "लागू होने वाले कानून और आपके अधिकार" : "Applicable Law & Your Rights"}
            </span>
          </div>
          {lawExpanded ? <ChevronUp className="h-5 w-5 text-base-dark/60" /> : <ChevronDown className="h-5 w-5 text-base-dark/60" />}
        </button>

        <AnimatePresence>
          {lawExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-base-dark/5 mt-4 space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-secondary uppercase tracking-wider mb-1">
                    Plain-Language Explanation
                  </h4>
                  <p className="text-sm text-base-dark/80 leading-relaxed">
                    {categoryExplanation}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-secondary uppercase tracking-wider mb-1">
                    Free Aid Statutory Notes
                  </h4>
                  <p className="text-sm text-base-dark/75 leading-relaxed">
                    {caseData?.category?.eligibilityNotes}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 3. NALSA Free Legal Aid Eligibility Triage Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white border border-base-dark/5 rounded-3xl p-6 md:p-8 shadow-xs text-left grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-lg font-bold text-base-dark flex items-center space-x-2 border-b border-base-dark/5 pb-3">
            <CheckCircle2 className="h-5 w-5 text-secondary" />
            <span>{language === "hi" ? "मुफ्त कानूनी सहायता पात्रता" : "Check Legal Aid Eligibility"}</span>
          </h2>
          <p className="text-xs text-base-dark/70 leading-relaxed">
            Free legal aid is mandated under Article 39A and facilitated by the National Legal Services Authority (NALSA) for qualified citizens. Check your eligibility below:
          </p>

          <form className="space-y-4 pt-2">
            {/* Demographic Category Select */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="nalsa-demographic" className="text-3xs font-extrabold text-base-dark/70 uppercase tracking-wider">
                Select Category / श्रेणी चुनें
              </label>
              <select
                id="nalsa-demographic"
                value={nalsaProfile.demographic}
                onChange={(e) => setNalsaProfile({ ...nalsaProfile, demographic: e.target.value })}
                className="p-3 rounded-xl border border-base-dark/15 bg-base text-xs font-semibold text-base-dark/80 focus:outline-none"
              >
                <option value="woman_child">Woman or Child / महिला या बच्चा</option>
                <option value="sc_st">SC or ST / अनुसूचित जाति या जनजाति</option>
                <option value="disabled">Disabled / दिव्यांग</option>
                <option value="workman">Industrial Workman / औद्योगिक श्रमिक</option>
                <option value="custody">In Custody / हिरासत में</option>
                <option value="general">General Category / सामान्य वर्ग</option>
              </select>
            </div>

            {/* Income Bracket Select */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="nalsa-income" className="text-3xs font-extrabold text-base-dark/70 uppercase tracking-wider">
                Annual Income / वार्षिक आय
              </label>
              <select
                id="nalsa-income"
                value={nalsaProfile.incomeBracket}
                onChange={(e) => setNalsaProfile({ ...nalsaProfile, incomeBracket: e.target.value })}
                className="p-3 rounded-xl border border-base-dark/15 bg-base text-xs font-semibold text-base-dark/80 focus:outline-none"
              >
                <option value="under_3l">Under ₹3 Lakhs / ₹3 लाख से कम</option>
                <option value="over_3l">Over ₹3 Lakhs / ₹3 लाख से अधिक</option>
              </select>
            </div>
          </form>
        </div>

        {/* Dynamic Eligibility Output Panel */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <div className={`w-full p-6 rounded-2xl border text-center space-y-3 ${
            eligibility.status === "eligible"
              ? "bg-[#E7F3F0] border-secondary/20 text-secondary"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <Scale className="h-10 w-10 mx-auto" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              {language === "hi" ? "पात्रता स्थिति" : "Eligibility Status"}
            </h3>
            <p className="text-xs font-bold leading-relaxed">{eligibility.message}</p>
          </div>
        </div>
      </motion.div>

      {/* 4. Nearest DLSA Office Map Locator */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-base-dark/5 rounded-3xl p-6 md:p-8 shadow-xs text-left space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-base-dark/5 pb-4 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-lg font-bold text-base-dark flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-secondary" />
              <span>{language === "hi" ? "निकटतम डीएलएसए सहायता कार्यालय" : "Nearest DLSA Offices"}</span>
            </h2>
            <p className="text-3xs text-base-dark/65 mt-1">Locate the District Legal Services Authority desk near you.</p>
          </div>

          {/* Browser Geolocation trigger button */}
          <button
            onClick={handleLocateUser}
            disabled={locatingUser}
            className="flex items-center space-x-2 bg-secondary text-[#FAF9F6] px-4 py-2 text-xs font-bold rounded-xl shadow-sm hover:bg-secondary-hover transition-colors min-h-[40px] max-w-max"
          >
            <Compass className={`h-4 w-4 ${locatingUser ? "animate-spin" : ""}`} />
            <span>{locatingUser ? "Locating..." : "Use My Location"}</span>
          </button>
        </div>

        {/* Filters and List View layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* List and Search Filter Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search Input bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search district / court name..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-base-dark/15 bg-base text-xs font-semibold text-base-dark focus:outline-none"
              />
              <Search className="h-4 w-4 text-base-dark/45 absolute left-3.5 top-3.5" />
            </div>

            {/* List entries */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {loadingDlsa ? (
                <div className="text-center py-6 text-xs text-base-dark/55">Querying directory...</div>
              ) : dlsaOffices.length === 0 ? (
                <div className="text-center py-6 text-xs text-base-dark/55">No offices match your search criteria.</div>
              ) : (
                dlsaOffices.map((office) => (
                  <div key={office.id} className="bg-base border border-base-dark/5 p-4 rounded-xl space-y-2 text-left">
                    <h3 className="font-extrabold text-xs text-base-dark leading-tight">{office.name}</h3>
                    <p className="text-3xs text-base-dark/65 leading-tight">{office.address}</p>
                    <div className="flex justify-between items-center pt-1">
                      {office.distance !== undefined && office.distance !== null && (
                        <span className="text-[10px] text-secondary font-extrabold bg-[#E7F3F0] px-2 py-0.5 rounded-md">
                          {office.distance.toFixed(1)} km away
                        </span>
                      )}
                      <a
                        href={`tel:${office.phone}`}
                        className="flex items-center space-x-1 text-xs text-secondary hover:text-primary font-bold transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{office.phone}</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Map Column */}
          <div className="lg:col-span-7">
            <ResultsMap offices={dlsaOffices} userCoords={userCoords} />
          </div>
        </div>
      </motion.div>

      {/* 5. Action Bottom Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center pt-2"
      >
        <Link href={`/results/draft?caseId=${caseId}`}>
          <button className="flex items-center space-x-3 bg-primary text-[#FAF9F6] px-10 py-4 rounded-xl text-lg font-bold shadow-md hover:bg-primary-hover transition-colors min-h-[44px]">
            <FileText className="h-5 w-5" />
            <span>{language === "hi" ? "शिकायत ड्राफ्ट जनरेट करें" : "Generate Complaint Draft"}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Suspense fallback={
          <div className="bg-white border border-base-dark/5 rounded-3xl p-8 shadow-xs text-center space-y-4 mt-8">
            <div className="h-8 w-8 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin mx-auto" />
            <p className="text-sm text-base-dark/60 font-semibold">Loading results data...</p>
          </div>
        }>
          <ResultsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
