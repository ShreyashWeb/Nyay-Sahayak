"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Database, EyeOff, FileLock2, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  const { language } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-start">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-left space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-secondary uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              <span>{language === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-base-dark tracking-tight">
              Citizen Privacy & Data Protection
            </h1>
            <p className="text-sm text-base-dark/60 leading-relaxed">
              Nyay Sahayak is built with a &ldquo;Privacy by Design&rdquo; architecture, guaranteeing full anonymity and data sovereignty for citizens seeking legal aid.
            </p>
          </motion.div>

          {/* Back Home Link */}
          <motion.div variants={itemVariants} className="text-left">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{language === "hi" ? "मुख्य पृष्ठ पर वापस जाएं" : "Back to Home"}</span>
            </Link>
          </motion.div>

          {/* Core Privacy Guarantees Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Guarantee 1 */}
            <div className="bg-white border border-base-dark/5 p-5 rounded-2xl text-left space-y-2 shadow-3xs">
              <EyeOff className="h-5 w-5 text-secondary" />
              <strong className="block text-xs font-bold text-base-dark">100% Anonymous</strong>
              <p className="text-3xs text-base-dark/70 leading-normal">
                No login, password, or Aadhaar credentials are required. Citizens remain anonymous throughout the intake flow.
              </p>
            </div>

            {/* Guarantee 2 */}
            <div className="bg-white border border-base-dark/5 p-5 rounded-2xl text-left space-y-2 shadow-3xs">
              <Database className="h-5 w-5 text-secondary" />
              <strong className="block text-xs font-bold text-base-dark">Local Storage Sovereignty</strong>
              <p className="text-3xs text-base-dark/70 leading-normal">
                Your emergency SOS contacts and active case ID references are saved locally in your browser sandbox, never uploaded.
              </p>
            </div>

            {/* Guarantee 3 */}
            <div className="bg-white border border-base-dark/5 p-5 rounded-2xl text-left space-y-2 shadow-3xs">
              <FileLock2 className="h-5 w-5 text-secondary" />
              <strong className="block text-xs font-bold text-base-dark">Client-Side Petitions</strong>
              <p className="text-3xs text-base-dark/70 leading-normal">
                Legal complaint drafts are generated client-side using jsPDF. They are downloaded directly and never stored on our servers.
              </p>
            </div>
          </motion.div>

          {/* Detailed Policy Text */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-base-dark/5 p-6 md:p-8 rounded-3xl text-left space-y-6 shadow-2xs text-xs md:text-sm text-base-dark/80"
          >
            {/* Section 1 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-base-dark uppercase text-xs tracking-wider border-b border-base-dark/5 pb-2">
                1. Information Collection & Purpose
              </h3>
              <p className="leading-relaxed">
                Nyay Sahayak processes plain language descriptions, voice recordings, and eligibility categories purely for legal classification and draft compilation. We only process the personal details (Name, Address, Phone) you type into the petition builder to compile the downloadable PDF. 
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-base-dark uppercase text-xs tracking-wider border-b border-base-dark/5 pb-2">
                2. Legal Basis: DPDP Act, 2023 Compliance
              </h3>
              <p className="leading-relaxed">
                Our data processing complies with the **Digital Personal Data Protection (DPDP) Act, 2023** of India. The platform collects minimal data necessary to provide state-mandated free legal aid under the Legal Services Authorities Act, 1987.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-base-dark uppercase text-xs tracking-wider border-b border-base-dark/5 pb-2">
                3. Cookie Policy & Web Tracking
              </h3>
              <p className="leading-relaxed">
                We do not use tracking cookies, analytics trackers, or targeted advertising codes. We use standard browser local storage (`localStorage`) to remember your session ID and preferred language, ensuring the app works securely when you return.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-base-dark uppercase text-xs tracking-wider border-b border-base-dark/5 pb-2">
                4. Citizen Rights (Right to Erasure)
              </h3>
              <p className="leading-relaxed">
                Under the DPDP Act, citizens have the absolute right to erase their data. You can clear your active legal drafts and session configuration at any time by clearing your browser cache and local storage.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
