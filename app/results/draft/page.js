"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowLeft, Download, ShieldAlert, CheckCircle2, ChevronRight, Edit3, HelpCircle, FileCheck, AlertCircle, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Draft Editor Skeleton Loader
function DraftSkeleton() {
  return (
    <div className="space-y-6 animate-pulse mt-4">
      {/* Back Link Skeleton */}
      <div className="h-4 bg-base-dark/10 rounded w-24" />
      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="h-7 bg-base-dark/10 rounded-lg w-1/3" />
        <div className="h-4 bg-base-dark/5 rounded-lg w-1/2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Form fields skeleton */}
        <div className="lg:col-span-6 bg-white border border-base-dark/5 p-6 rounded-3xl space-y-4">
          <div className="h-5 bg-base-dark/10 rounded w-1/3 mb-2" />
          <div className="space-y-3">
            <div className="h-10 bg-base-dark/5 rounded-xl w-full" />
            <div className="h-10 bg-base-dark/5 rounded-xl w-full" />
            <div className="h-10 bg-base-dark/5 rounded-xl w-full" />
            <div className="h-24 bg-base-dark/5 rounded-xl w-full" />
          </div>
        </div>

        {/* Right Column Preview Panel skeleton */}
        <div className="lg:col-span-6 bg-base-dark/5 border border-base-dark/10 p-6 rounded-3xl space-y-4 min-h-[400px]">
          <div className="h-5 bg-base-dark/10 rounded w-1/4" />
          <div className="space-y-2.5 pt-4">
            <div className="h-3.5 bg-base-dark/10 rounded w-1/2 mx-auto" />
            <div className="h-3 bg-base-dark/5 rounded w-1/3 mx-auto" />
            <div className="h-3 bg-base-dark/5 rounded w-full pt-4" />
            <div className="h-3 bg-base-dark/5 rounded w-full" />
            <div className="h-3 bg-base-dark/5 rounded w-5/6" />
            <div className="h-3 bg-base-dark/5 rounded w-full pt-4" />
            <div className="h-3 bg-base-dark/5 rounded w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [caseData, setCaseData] = useState(null);
  const [templateText, setTemplateText] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("edit"); // "edit" or "preview" (for mobile)
  
  // Form input values
  const [formValues, setFormValues] = useState({
    userName: "",
    userParentSpouse: "",
    userPhone: "",
    userAddress: "",
    respondentName: "",
    respondentAddress: "",
    factsOfTheCase: "",
    // Category specific
    policeStation: "",
    city: "",
    state: "",
    employerName: "",
    employerAddress: "",
    userDesignation: "",
    outstandingAmount: "",
    sellerName: "",
    sellerAddress: "",
    disputedAmount: "",
    compensationAmount: "",
    propertyDetails: "",
    dlsaDistrict: "Central",
    dlsaState: "Delhi"
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [downloaded, setDownloaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImg, setSignatureImg] = useState(null);

  // Drawing Canvas handlers for mouse and touch inputs
  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault();
    const canvas = document.getElementById("signature-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1A1A1A";

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = document.getElementById("signature-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const saveSignature = () => {
    const canvas = document.getElementById("signature-canvas");
    if (!canvas) return;
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      setSignatureImg(null);
    } else {
      setSignatureImg(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = document.getElementById("signature-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImg(null);
  };

  // Fetch Case Data & Template on mount
  const fetchCaseAndTemplate = useCallback(async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      setErrorMsg("");
      // 1. Fetch Case details
      const caseResponse = await fetch(`/api/cases/${caseId}`);
      const caseResult = await caseResponse.json();
      
      if (caseResult.success) {
        const fetchedCase = caseResult.case;
        setCaseData(fetchedCase);

        // Prefill facts with the citizen's original statement text
        const initialFacts = fetchedCase.drafts && fetchedCase.drafts[0]
          ? fetchedCase.drafts[0].draftData?.text || ""
          : "";

        setFormValues((prev) => ({
          ...prev,
          factsOfTheCase: initialFacts
        }));

        // 2. Fetch Category Template
        const templateResponse = await fetch(`/api/templates/${fetchedCase.categoryId}`);
        const templateResult = await templateResponse.json();
        
        if (templateResult.success) {
          setTemplateText(templateResult.template.template);
        } else {
          setErrorMsg("Failed to load legal template.");
        }
      } else {
        setErrorMsg("Failed to load case details.");
      }
    } catch (err) {
      console.error("Fetch case & template error:", err);
      setErrorMsg("Failed to reach template API.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCaseAndTemplate();
  }, [fetchCaseAndTemplate]);

  // Handle Form Change
  const handleInputChange = (field, val) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: val
    }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Compile complaint draft dynamically replacing placeholders
  const compileComplaintText = () => {
    if (!templateText) return "";

    let compiled = templateText;
    const replacements = {
      "[USER_NAME]": formValues.userName || "___________________",
      "[USER_PARENT_SPOUSE]": formValues.userParentSpouse || "___________________",
      "[USER_PHONE]": formValues.userPhone || "___________________",
      "[USER_ADDRESS]": formValues.userAddress || "___________________",
      "[RESPONDENT_NAME]": formValues.respondentName || "___________________",
      "[RESPONDENT_ADDRESS]": formValues.respondentAddress || "___________________",
      "[FACTS_OF_THE_CASE]": formValues.factsOfTheCase || "___________________",
      "[POLICE_STATION_NAME]": formValues.policeStation || "___________________",
      "[CITY]": formValues.city || "___________________",
      "[STATE]": formValues.state || "___________________",
      "[EMPLOYER_NAME]": formValues.employerName || "___________________",
      "[EMPLOYER_ADDRESS]": formValues.employerAddress || "___________________",
      "[USER_DESIGNATION]": formValues.userDesignation || "___________________",
      "[OUTSTANDING_AMOUNT]": formValues.outstandingAmount || "___________________",
      "[SELLER_NAME]": formValues.sellerName || "___________________",
      "[SELLER_ADDRESS]": formValues.sellerAddress || "___________________",
      "[DISPUTED_AMOUNT]": formValues.disputedAmount || "___________________",
      "[COMPENSATION_AMOUNT]": formValues.compensationAmount || "___________________",
      "[PROPERTY_DETAILS]": formValues.propertyDetails || "___________________",
      "[DLSA_DISTRICT]": formValues.dlsaDistrict || "___________________",
      "[DLSA_STATE]": formValues.dlsaState || "___________________",
      "[CURRENT_DATE]": new Date().toLocaleDateString()
    };

    Object.keys(replacements).forEach((placeholder) => {
      compiled = compiled.replaceAll(placeholder, replacements[placeholder]);
    });

    return compiled;
  };

  // Run Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formValues.userName.trim()) errors.userName = "Full name is required.";
    if (!formValues.userPhone.trim()) errors.userPhone = "Phone number is required.";
    if (!formValues.userAddress.trim()) errors.userAddress = "Residential address is required.";
    if (!formValues.factsOfTheCase.trim()) errors.factsOfTheCase = "Facts details are required.";

    // Category specific validation
    if (caseData?.categoryId === "domestic_violence") {
      if (!formValues.respondentName.trim()) errors.respondentName = "Respondent's name is required.";
    } else if (caseData?.categoryId === "labor_dispute") {
      if (!formValues.employerName.trim()) errors.employerName = "Employer's name is required.";
      if (!formValues.outstandingAmount.trim()) errors.outstandingAmount = "Pending wages amount is required.";
    } else if (caseData?.categoryId === "consumer_fraud") {
      if (!formValues.sellerName.trim()) errors.sellerName = "Seller's name is required.";
      if (!formValues.disputedAmount.trim()) errors.disputedAmount = "Disputed amount is required.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Compile jsPDF and download client-side
  const handleDownloadPdf = async () => {
    if (!validateForm()) {
      // Focus on the first error or switch back tab on mobile
      setActiveTab("edit");
      return;
    }

    try {
      // Dynamically import jsPDF to keep Initial Bundle Size thin
      const { default: jsPDF } = await import("jspdf");
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const text = compileComplaintText();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);

      // Split text into line widths conforming to A4 dimensions
      const lines = doc.splitTextToSize(text, maxLineWidth);
      let cursorY = margin;
      const lineHeight = 6.5; // mm

      lines.forEach((line) => {
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
      });

      if (signatureImg) {
        const sigWidth = 40; // mm
        const sigHeight = 15; // mm
        if (cursorY + sigHeight + 10 > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        } else {
          cursorY += 4;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("Digitally Signed:", margin, cursorY + 2);
        cursorY += 5;
        doc.addImage(signatureImg, "PNG", margin, cursorY, sigWidth, sigHeight);
      }

      doc.save(`Nyay_Sahayak_Complaint_${caseId.substring(0, 8)}.pdf`);
      setDownloaded(true);
    } catch (err) {
      console.error("PDF Compilation error:", err);
    }
  };

  if (loading) {
    return <DraftSkeleton />;
  }

  if (errorMsg || !caseData) {
    return (
      <div className="bg-white border border-danger/15 rounded-3xl p-8 shadow-sm text-center space-y-6 max-w-lg mx-auto mt-8">
        <div className="mx-auto bg-danger/10 text-danger p-4 rounded-full w-16 h-16 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-danger animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            {language === "hi" ? "दस्तावेज़ संपादक लोड करने में विफल" : "Failed to Load Complaint Editor"}
          </h2>
          <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">
            {language === "hi"
              ? "हम इस शिकायत श्रेणी के लिए कानूनी ड्राफ्ट टेम्पलेट पुनर्प्राप्त नहीं कर सके। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।"
              : "We couldn't retrieve the legal draft template for this complaint category. Please check your internet connection and try again."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fetchCaseAndTemplate()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-secondary text-[#FAF9F6] hover:bg-secondary-hover px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md min-h-[44px]"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>{language === "hi" ? "पुनः प्रयास करें" : "Retry Loading"}</span>
          </button>
          <Link href={caseId ? `/results?caseId=${caseId}` : "/"}>
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 border border-secondary/35 text-secondary hover:bg-secondary/5 px-6 py-3.5 rounded-xl text-xs font-bold transition-all min-h-[44px]">
              <ArrowLeft className="h-4 w-4" />
              <span>{language === "hi" ? "परिणाम पृष्ठ" : "Back to Results"}</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const compiledPreview = compileComplaintText();

  return (
    <div className="space-y-6 mt-4">
      {/* Back to Triage Results */}
      <div className="text-left mb-2">
        <Link
          href={`/results?caseId=${caseId}`}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Triage Results</span>
        </Link>
      </div>

      {/* Title */}
      <div className="text-left space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-base-dark tracking-tight">
          Complaint Draft Generator
        </h1>
        <p className="text-sm text-base-dark/60 leading-relaxed max-w-2xl">
          Flesh out the fields below. As you enter information, the legal document compiles automatically in the live preview.
        </p>
      </div>

      {/* Mobile Tab Toggle (hidden on desktop) */}
      <div className="flex lg:hidden bg-base border border-base-dark/5 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-grow py-2.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "edit" ? "bg-white text-secondary shadow-3xs" : "text-base-dark/60 hover:text-base-dark"
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit Details</span>
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-grow py-2.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "preview" ? "bg-white text-secondary shadow-3xs" : "text-base-dark/60 hover:text-base-dark"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Side by side layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Edit */}
        <div className={`lg:col-span-6 space-y-6 ${activeTab === "edit" ? "block" : "hidden lg:block"}`}>
          <div className="bg-white border border-base-dark/5 p-6 rounded-3xl shadow-3xs text-left space-y-5">
            <h2 className="text-sm font-extrabold text-secondary uppercase tracking-wider border-b border-base-dark/5 pb-3">
              1. Your Information (Complainant)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label htmlFor="comp-name" className="text-[10px] font-bold text-base-dark/70 uppercase">Full Name / पूरा नाम *</label>
                <input
                  id="comp-name"
                  type="text"
                  value={formValues.userName}
                  onChange={(e) => handleInputChange("userName", e.target.value)}
                  placeholder="e.g. Shreyash Sharma"
                  className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                />
                {validationErrors.userName && (
                  <span className="text-[10px] text-danger font-bold">{validationErrors.userName}</span>
                )}
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="comp-spouse" className="text-[10px] font-bold text-base-dark/70 uppercase">Father&apos;s / Husband&apos;s Name</label>
                <input
                  id="comp-spouse"
                  type="text"
                  value={formValues.userParentSpouse}
                  onChange={(e) => handleInputChange("userParentSpouse", e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label htmlFor="comp-phone" className="text-[10px] font-bold text-base-dark/70 uppercase">Contact Phone / फोन नंबर *</label>
                <input
                  id="comp-phone"
                  type="text"
                  value={formValues.userPhone}
                  onChange={(e) => handleInputChange("userPhone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                />
                {validationErrors.userPhone && (
                  <span className="text-[10px] text-danger font-bold">{validationErrors.userPhone}</span>
                )}
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="comp-dlsa" className="text-[10px] font-bold text-base-dark/70 uppercase">DLSA Jurisdiction District</label>
                <input
                  id="comp-dlsa"
                  type="text"
                  value={formValues.dlsaDistrict}
                  onChange={(e) => handleInputChange("dlsaDistrict", e.target.value)}
                  placeholder="e.g. Central Delhi"
                  className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="comp-address" className="text-[10px] font-bold text-base-dark/70 uppercase">Residential Address / पता *</label>
              <textarea
                id="comp-address"
                rows={2}
                value={formValues.userAddress}
                onChange={(e) => handleInputChange("userAddress", e.target.value)}
                placeholder="House No., Street, City, Pin Code"
                className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none resize-none"
              />
              {validationErrors.userAddress && (
                <span className="text-[10px] text-danger font-bold">{validationErrors.userAddress}</span>
              )}
            </div>
          </div>

          {/* Category-Specific Form Sections */}
          <div className="bg-white border border-base-dark/5 p-6 rounded-3xl shadow-3xs text-left space-y-5">
            <h2 className="text-sm font-extrabold text-secondary uppercase tracking-wider border-b border-base-dark/5 pb-3">
              2. Opposing Party & Details (Respondent)
            </h2>

            {/* Domestic Violence Specific */}
            {caseData?.categoryId === "domestic_violence" && (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-base-dark/70 uppercase">Respondent/Husband Name *</label>
                  <input
                    type="text"
                    value={formValues.respondentName}
                    onChange={(e) => handleInputChange("respondentName", e.target.value)}
                    placeholder="e.g. Sunil Sharma"
                    className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                  />
                  {validationErrors.respondentName && (
                    <span className="text-[10px] text-danger font-bold">{validationErrors.respondentName}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-base-dark/70 uppercase">Respondent Address</label>
                  <input
                    type="text"
                    value={formValues.respondentAddress}
                    onChange={(e) => handleInputChange("respondentAddress", e.target.value)}
                    placeholder="Residential address of respondent"
                    className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-base-dark/70 uppercase">Police Station Name</label>
                    <input
                      type="text"
                      value={formValues.policeStation}
                      onChange={(e) => handleInputChange("policeStation", e.target.value)}
                      placeholder="e.g. Rohini Sector 4"
                      className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-base-dark/70 uppercase">City / State</label>
                    <input
                      type="text"
                      value={formValues.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="e.g. New Delhi"
                      className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Labor Dispute Specific */}
            {caseData?.categoryId === "labor_dispute" && (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-base-dark/70 uppercase">Employer/Company Name *</label>
                  <input
                    type="text"
                    value={formValues.employerName}
                    onChange={(e) => handleInputChange("employerName", e.target.value)}
                    placeholder="e.g. ABC construction Ltd."
                    className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                  />
                  {validationErrors.employerName && (
                    <span className="text-[10px] text-danger font-bold">{validationErrors.employerName}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-base-dark/70 uppercase">Your Designation</label>
                    <input
                      type="text"
                      value={formValues.userDesignation}
                      onChange={(e) => handleInputChange("userDesignation", e.target.value)}
                      placeholder="e.g. Site Supervisor"
                      className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-base-dark/70 uppercase">Outstanding Wages (Rs.) *</label>
                    <input
                      type="text"
                      value={formValues.outstandingAmount}
                      onChange={(e) => handleInputChange("outstandingAmount", e.target.value)}
                      placeholder="e.g. 45000"
                      className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                    />
                    {validationErrors.outstandingAmount && (
                      <span className="text-[10px] text-danger font-bold">{validationErrors.outstandingAmount}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-base-dark/70 uppercase">Employer Address</label>
                  <input
                    type="text"
                    value={formValues.employerAddress}
                    onChange={(e) => handleInputChange("employerAddress", e.target.value)}
                    placeholder="Company physical address"
                    className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Consumer Fraud Specific */}
            {caseData?.categoryId === "consumer_fraud" && (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-base-dark/70 uppercase">Seller / Service Provider Name *</label>
                  <input
                    type="text"
                    value={formValues.sellerName}
                    onChange={(e) => handleInputChange("sellerName", e.target.value)}
                    placeholder="e.g. E-Commerce Seller Corp"
                    className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                  />
                  {validationErrors.sellerName && (
                    <span className="text-[10px] text-danger font-bold">{validationErrors.sellerName}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-base-dark/70 uppercase">Disputed Value (Rs.) *</label>
                    <input
                      type="text"
                      value={formValues.disputedAmount}
                      onChange={(e) => handleInputChange("disputedAmount", e.target.value)}
                      placeholder="e.g. 15000"
                      className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                    />
                    {validationErrors.disputedAmount && (
                      <span className="text-[10px] text-danger font-bold">{validationErrors.disputedAmount}</span>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-base-dark/70 uppercase">Compensation Sought (Rs.)</label>
                    <input
                      type="text"
                      value={formValues.compensationAmount}
                      onChange={(e) => handleInputChange("compensationAmount", e.target.value)}
                      placeholder="e.g. 10000"
                      className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-base-dark/70 uppercase">Seller Address</label>
                  <input
                    type="text"
                    value={formValues.sellerAddress}
                    onChange={(e) => handleInputChange("sellerAddress", e.target.value)}
                    placeholder="Registered business address"
                    className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Other / Fallback categories */}
            {(caseData?.categoryId === "property_dispute" || caseData?.categoryId === "general_harassment" || caseData?.categoryId === "other") && (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-base-dark/70 uppercase">Opposing Party Name / प्रतिवादी का नाम</label>
                  <input
                    type="text"
                    value={formValues.respondentName}
                    onChange={(e) => handleInputChange("respondentName", e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                  />
                </div>

                {caseData?.categoryId === "property_dispute" && (
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-base-dark/70 uppercase">Property Details / संपत्ति का विवरण</label>
                    <input
                      type="text"
                      value={formValues.propertyDetails}
                      onChange={(e) => handleInputChange("propertyDetails", e.target.value)}
                      placeholder="e.g. House No. 25, Block B, Rohini Sector 11"
                      className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                    />
                  </div>
                )}

                {caseData?.categoryId === "general_harassment" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-base-dark/70 uppercase">Police Station Jurisdiction</label>
                      <input
                        type="text"
                        value={formValues.policeStation}
                        onChange={(e) => handleInputChange("policeStation", e.target.value)}
                        placeholder="e.g. Rohini Central"
                        className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-base-dark/70 uppercase">City / State</label>
                      <input
                        type="text"
                        value={formValues.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="e.g. Delhi"
                        className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-base-dark/70 uppercase">Opposing Party Address / पता</label>
                  <input
                    type="text"
                    value={formValues.respondentAddress}
                    onChange={(e) => handleInputChange("respondentAddress", e.target.value)}
                    placeholder="Residential address of respondent"
                    className="p-3 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-base-dark/5 p-6 rounded-3xl shadow-3xs text-left space-y-4">
            <h2 className="text-sm font-extrabold text-secondary uppercase tracking-wider border-b border-base-dark/5 pb-3">
              3. Statement of Facts
            </h2>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-base-dark/70 uppercase">Facts & Chronology / घटना का विवरण *</label>
              <textarea
                rows={6}
                value={formValues.factsOfTheCase}
                onChange={(e) => handleInputChange("factsOfTheCase", e.target.value)}
                placeholder="Detail what happened, including dates, sequence of events, and specific violations..."
                className="p-4 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:outline-none leading-relaxed"
              />
              {validationErrors.factsOfTheCase && (
                <span className="text-[10px] text-danger font-bold">{validationErrors.factsOfTheCase}</span>
              )}
            </div>
          </div>

          {/* 4. Digital Signature Drawing Card */}
          <div className="bg-white border border-base-dark/5 p-6 rounded-3xl shadow-3xs text-left space-y-4">
            <h2 className="text-sm font-extrabold text-secondary uppercase tracking-wider border-b border-base-dark/5 pb-3 flex items-center justify-between">
              <span>4. Digital Signature / डिजिटल हस्ताक्षर</span>
              {signatureImg && (
                <span className="bg-[#E7F3F0] text-secondary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Signed / हस्ताक्षरित
                </span>
              )}
            </h2>

            <div className="flex flex-col space-y-2">
              <label htmlFor="signature-canvas" className="text-[10px] font-bold text-base-dark/70 uppercase">
                Draw Your Signature / अपने हस्ताक्षर ड्रा करें
              </label>
              <div className="relative border border-base-dark/15 rounded-2xl bg-base overflow-hidden">
                <canvas
                  id="signature-canvas"
                  width={500}
                  height={150}
                  className="w-full h-[150px] cursor-crosshair touch-none bg-[#FAF9F6]"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <p className="text-[10px] text-base-dark/50 leading-normal">
                Use your mouse or finger on touch screens to sign inside the box above.
              </p>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-4 py-2 border border-base-dark/20 hover:bg-base-dark/5 text-xs font-bold rounded-xl text-base-dark/80 transition-colors min-h-[40px]"
                >
                  Clear Signature / साफ़ करें
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Compilation Preview */}
        <div className={`lg:col-span-6 space-y-6 ${activeTab === "preview" ? "block" : "hidden lg:block"}`}>
          {/* Preview Container simulating A4 paper sheet */}
          <div className="bg-white border border-base-dark/10 p-8 rounded-2xl shadow-sm text-left flex flex-col justify-between h-[640px] relative overflow-hidden">
            
            {/* Header watermarks */}
            <div className="absolute top-2 right-4 flex items-center space-x-1.5 opacity-40 select-none">
              <FileCheck className="h-4 w-4 text-secondary" />
              <span className="text-[8px] font-extrabold tracking-widest text-secondary uppercase">DRAFT PREVIEW</span>
            </div>

            {/* Scrollable Document area */}
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 font-serif text-xs md:text-sm text-base-dark leading-relaxed whitespace-pre-line border-b border-base-dark/5 pb-4">
              {compiledPreview ? (
                <div className="space-y-4">
                  <div>{compiledPreview}</div>
                  {signatureImg && (
                    <div className="mt-4 flex flex-col items-start border-t border-base-dark/10 pt-4">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-base-dark/50 mb-1.5">Digitally Signed:</p>
                      <div className="bg-[#FAF9F6] border border-base-dark/10 rounded-xl p-2 max-w-[200px]">
                        <img src={signatureImg} alt="Drawn Signature" className="h-10 object-contain mx-auto" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                "A waiting template will load here after fetching details."
              )}
            </div>

            {/* Downloader trigger action bar */}
            <div className="pt-4 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <div className="text-left text-2xs text-base-dark/50 leading-tight">
                This compiles client-side under Article 39A guidance guidelines.
              </div>
              <button
                onClick={handleDownloadPdf}
                className="flex items-center space-x-2 bg-primary text-[#FAF9F6] px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-primary-hover transition-colors min-h-[44px] shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF Draft</span>
              </button>
            </div>
          </div>

          {/* 5. What Happens Next Panel (progressive reveal) */}
          <AnimatePresence>
            {downloaded && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#E7F3F0] border border-secondary/20 rounded-3xl p-6 md:p-8 text-left space-y-4"
              >
                <h3 className="text-lg font-black text-secondary flex items-center space-x-2">
                  <CheckCircle2 className="h-6 w-6 text-secondary shrink-0" />
                  <span>Draft Downloaded! What Happens Next?</span>
                </h3>

                <div className="space-y-4 text-xs md:text-sm text-base-dark/85 leading-relaxed pt-2">
                  <div className="flex space-x-3 items-start">
                    <span className="bg-secondary text-[#FAF9F6] px-2 py-0.5 rounded-md font-extrabold">1</span>
                    <div>
                      <strong className="block text-secondary font-bold">Print and Sign the Document</strong>
                      <span>Print out this PDF on standard A4 paper. Sign your name at the bottom in the Complainant signature space.</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 items-start">
                    <span className="bg-secondary text-[#FAF9F6] px-2 py-0.5 rounded-md font-extrabold">2</span>
                    <div>
                      <strong className="block text-secondary font-bold">Visit Your Local DLSA Helpdesk</strong>
                      <span>Take the signed copy to your nearest District Legal Services Authority desk:</span>
                      
                      {/* Show seeded DLSA location guidance */}
                      <div className="bg-white border border-secondary/10 p-4 rounded-xl mt-2 space-y-1.5">
                        <strong className="block text-base-dark">DLSA Central Helpdesk</strong>
                        <p className="text-2xs text-base-dark/75">Tis Hazari Court Complex, Near Tis Hazari Metro Station, Delhi - 110054</p>
                        <p className="text-2xs text-secondary font-bold">Call: 011-23971234</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 items-start">
                    <span className="bg-secondary text-[#FAF9F6] px-2 py-0.5 rounded-md font-extrabold">3</span>
                    <div>
                      <strong className="block text-secondary font-bold">Assign Panel Lawyer Advocate</strong>
                      <span>Upon submission, the DLSA front desk receptionist will record your case file reference and instantly assign a free panel counsel advocate to represent you.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function DraftPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Suspense fallback={
          <div className="bg-white border border-base-dark/5 rounded-3xl p-8 shadow-xs text-center space-y-4 mt-8">
            <div className="h-8 w-8 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin mx-auto" />
            <p className="text-sm text-base-dark/60 font-semibold">Loading draft compiler...</p>
          </div>
        }>
          <DraftContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
