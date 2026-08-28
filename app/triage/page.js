"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, MicOff, MessageSquare, Scale, AlertCircle, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TriagePage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [languageInput, setLanguageInput] = useState("en"); // "en", "hi", "hinglish"
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const recognitionRef = useRef(null);

  // Stop recording on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const wordCount = description.trim() === "" ? 0 : description.trim().split(/\s+/).filter(Boolean).length;

  const handleLanguageSelect = (lang) => {
    setLanguageInput(lang);
    if (recording) {
      stopRecording();
    }
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Voice input is not supported by your browser. Please type your description instead.");
      return;
    }

    try {
      setErrorMsg("");
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      // Select speech model language based on input selection
      if (languageInput === "hi") {
        rec.lang = "hi-IN";
      } else if (languageInput === "en") {
        rec.lang = "en-IN";
      } else {
        // Hinglish phonetic input utilizes the Hindi acoustic model
        rec.lang = "hi-IN";
      }

      rec.onstart = () => {
        setRecording(true);
      };

      rec.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setDescription((prev) => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone permission denied. Please allow microphone access in your browser settings.");
        } else {
          setErrorMsg(`Voice input error: ${event.error}. Please try typing.`);
        }
        setRecording(false);
      };

      rec.onend = () => {
        setRecording(false);
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to start speech recognition. Please type your description.");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (recording) {
      stopRecording();
    }

    if (wordCount < 10) {
      setErrorMsg("Please describe your legal issue in more detail (minimum 10 words). This helps our engine classify it correctly.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const storedUserId = localStorage.getItem("nyaySahayakUserId");

      // Calming loading pause for exactly 1.5 seconds
      const [response] = await Promise.all([
        fetch("/api/classify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: description,
            language: languageInput,
            userId: storedUserId || null,
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 1500)), // Calming animation delay
      ]);

      const data = await response.json();

      if (data.success) {
        // Save user ID to localStorage for session tracking
        localStorage.setItem("nyaySahayakUserId", data.userId);
        localStorage.setItem("nyaySahayakActiveCaseId", data.caseId);

        // Redirect based on risk assessment
        if (data.highRisk) {
          router.push("/sos");
        } else {
          router.push(`/results?caseId=${data.caseId}`);
        }
      } else {
        setErrorMsg(data.error || "Failed to process your description. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setErrorMsg("A network error occurred. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col justify-start">
        {/* Breadcrumb / Progress steps */}
        <div className="w-full mb-8 mt-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-secondary uppercase tracking-widest mb-3">
            <span>Step 1 of 3</span>
            <span>•</span>
            <span className="text-primary">Intake & Description</span>
          </div>
          <div className="w-full bg-secondary/15 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-1/3 rounded-full transition-all duration-300" />
          </div>
        </div>

        {/* Back Link */}
        <div className="text-left mb-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-base-dark/5 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="text-left mb-6 space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-base-dark tracking-tight">
              Describe Your Legal Problem
            </h1>
            <p className="text-sm text-base-dark/60 leading-relaxed">
              Tell us what happened in plain language. You can speak or type in English, Hindi, or Hinglish.
            </p>
          </div>          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Selection Bar */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-extrabold text-base-dark/70 uppercase tracking-wider text-left">
                Input Language
              </label>
              <div className="flex space-x-2">
                {[
                  { id: "en", label: "English / अंग्रेजी" },
                  { id: "hi", label: "Hindi / हिंदी" },
                  { id: "hinglish", label: "Hinglish / हिंग्लिश" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleLanguageSelect(lang.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 min-h-[40px] flex-grow ${
                      languageInput === lang.id
                        ? "bg-secondary text-[#FAF9F6] border-secondary"
                        : "bg-base text-base-dark/70 border-base-dark/10 hover:bg-base-dark/5"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Text Area with mic toggle */}
            <div className="flex flex-col space-y-2 relative">
              <label htmlFor="triage-statement" className="text-xs font-extrabold text-base-dark/70 uppercase tracking-wider text-left">
                Your Statement / आपकी समस्या का विवरण
              </label>
              <div className="relative">
                <textarea
                  id="triage-statement"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder={
                    languageInput === "hi"
                      ? "अपनी समस्या यहाँ विस्तार से लिखें (उदा. मुझे पिछले 3 महीने से मेरी पगार नहीं मिली है...)"
                      : languageInput === "hinglish"
                      ? "Apni problem yahan batayein (e.g. Mere landlord mujhe bina notice ke ghar से nikal rahe hain...)"
                      : "Describe your situation in detail (e.g. My employer terminated my contract without notice and hasn't paid my salary...)"
                  }
                  rows={8}
                  className="w-full p-4 rounded-2xl border border-base-dark/10 bg-base text-base-dark placeholder-base-dark/60 font-medium text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none pr-14"
                />

                {/* Speech Microphone Toggle Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  aria-label={recording ? "Stop recording voice input" : "Start recording voice input"}
                  className={`absolute right-3 bottom-3 p-3 rounded-xl flex items-center justify-center transition-all duration-300 min-w-[44px] min-h-[44px] shadow-sm ${
                    recording
                      ? "bg-danger text-[#FAF9F6] animate-pulse"
                      : "bg-primary text-[#FAF9F6] hover:bg-primary-hover"
                  }`}
                  title={recording ? "Stop Recording" : "Voice Input (Speak)"}
                >
                  {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>

            {/* Status indicators under the input */}
            <div className="flex justify-between items-center text-xs text-base-dark/60 font-semibold px-1">
              <span>
                Words: <strong className={wordCount >= 10 ? "text-[#0F6E56]" : "text-danger"}>{wordCount}</strong> / 10 min
              </span>
              {recording && (
                <span className="flex items-center space-x-1 text-danger font-bold">
                  <span className="h-2 w-2 rounded-full bg-danger animate-ping" />
                  <span>Listening ({languageInput === "hi" ? "Hindi" : "English"})...</span>
                </span>
              )}
            </div>
          </div>

            {/* Error notifications */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-danger/5 border border-danger/20 rounded-xl p-4 flex items-start space-x-3 text-left text-danger"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold leading-normal">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Triage Flow */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-lg font-bold shadow-md flex items-center justify-center space-x-2 min-h-[44px] transition-colors ${
                  wordCount < 10 || loading
                    ? "bg-base-dark/10 text-base-dark/40 cursor-not-allowed"
                    : "bg-primary text-[#FAF9F6] hover:bg-primary-hover"
                }`}
              >
                <span>Analyze & Find Help</span>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </motion.button>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {/* Calming Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-base-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-6"
            >
              {/* Morphed Calming Icon representation */}
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.05, 0.95, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  className="bg-secondary text-[#FAF9F6] p-5 rounded-full flex items-center justify-center relative z-10 shadow-md"
                >
                  <Scale className="h-10 w-10 text-[#FAF9F6]" />
                </motion.div>

                {/* Pulse circles in the background */}
                <motion.div
                  animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-secondary/30 rounded-full"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-base-dark flex items-center justify-center space-x-1.5">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <span>Analyzing Statement...</span>
                </h3>
                <p className="text-xs text-base-dark/60 leading-normal">
                  Evaluating category matching & risk criteria under the Legal Services Act...
                </p>
              </div>

              {/* Progress bar visual indicator */}
              <div className="w-full bg-base border border-base-dark/5 h-2 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="bg-primary h-full rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
