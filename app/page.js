"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, CheckCircle2, ShieldAlert, MapPin, FileText, ArrowRight, BookOpen, HeartHandshake } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const { t, language } = useLanguage();

  // Container variants for staggered card entry
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  // 4 Features
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: t("feat1Title"),
      desc: t("feat1Desc"),
    },
    {
      icon: <CheckCircle2 className="h-8 w-8 text-[#0F6E56]" />, // Secondary deep teal
      title: t("feat2Title"),
      desc: t("feat2Desc"),
    },
    {
      icon: <MapPin className="h-8 w-8 text-secondary" />,
      title: t("feat3Title"),
      desc: t("feat3Desc"),
    },
    {
      icon: <ShieldAlert className="h-8 w-8 text-danger" />,
      title: t("feat4Title"),
      desc: t("feat4Desc"),
      highlight: true,
    },
  ];

  // 4 Steps
  const steps = [
    {
      number: "1",
      title: t("howStep1Title"),
      desc: t("howStep1Desc"),
      icon: <FileText className="h-5 w-5" />,
    },
    {
      number: "2",
      title: t("howStep2Title"),
      desc: t("howStep2Desc"),
      icon: <Scale className="h-5 w-5" />,
    },
    {
      number: "3",
      title: t("howStep3Title"),
      desc: t("howStep3Desc"),
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      number: "4",
      title: t("howStep4Title"),
      desc: t("howStep4Desc"),
      icon: <ArrowRight className="h-5 w-5" />,
    },
  ];

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy */}
            <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
              {/* Dual-language badges */}
              <div className="flex items-center space-x-2">
                <span className="bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full">
                  FREE LEGAL AID / निःशुल्क कानूनी सहायता
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-base-dark tracking-tight leading-tight">
                {language === "hi" ? (
                  <>
                    <span className="text-primary block font-sans">{t("heroTitle")}</span>
                    <span className="text-2xl text-secondary font-medium block mt-2">
                      {t("heroHindiBranding")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-primary block font-sans">{t("heroTitle")}</span>
                    <span className="text-2xl text-secondary font-medium block mt-2">
                      {t("heroHindiBranding")}
                    </span>
                  </>
                )}
              </h1>

              <p className="text-lg md:text-xl font-semibold text-secondary leading-normal">
                {t("heroTagline")}
              </p>

              <p className="text-base-dark/80 text-base md:text-lg max-w-2xl leading-relaxed">
                {t("heroDesc")}
              </p>

              {/* Action Button */}
              <div className="pt-4">
                <Link href="/triage">
                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-3 bg-primary text-[#FAF9F6] px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-primary-hover transition-all duration-200 min-h-[44px]"
                  >
                    <span>{t("heroCta")}</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Right Column: Decorative Graphic/Illustration */}
            <div className="lg:col-span-5 hidden lg:flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-secondary/5 border border-secondary/10 rounded-3xl p-8 relative flex flex-col space-y-6 shadow-sm"
              >
                {/* Visual indicator of triage portal */}
                <div className="flex items-center space-x-3 border-b border-secondary/10 pb-4">
                  <div className="bg-[#FAF9F6] p-2 rounded-xl text-secondary shadow-sm">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base-dark leading-none">Nyay Sahayak Portal</h3>
                    <span className="text-xs text-secondary">Verified Aid Directory</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-[#FAF9F6] rounded-xl shadow-xs border border-secondary/5">
                    <div className="p-1 rounded-lg bg-primary/10 text-primary mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-base-dark">Article 39A Compliant</h4>
                      <p className="text-2xs text-base-dark/70 leading-normal">Facilitating constitutional directives of state justice accessibility.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-[#FAF9F6] rounded-xl shadow-xs border border-secondary/5">
                    <div className="p-1 rounded-lg bg-secondary/10 text-secondary mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-base-dark">District Level Services</h4>
                      <p className="text-2xs text-base-dark/70 leading-normal">Locate all State and District Legal Services (DLSA) offices across India.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4 flex items-center space-x-3">
                  <ShieldAlert className="h-6 w-6 text-danger shrink-0 animate-pulse" />
                  <div className="text-left">
                    <h4 className="text-xs font-extrabold text-danger uppercase tracking-wider leading-none">SOS Response Activated</h4>
                    <p className="text-2xs text-danger/80 mt-1 leading-normal">surfacing emergency police & women helplines instantly.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="bg-white border-y border-base-dark/5 px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-base-dark tracking-tight">
              {t("featuresTitle")}
            </h2>
            <p className="mt-3 text-lg text-base-dark/70 max-w-2xl mx-auto">
              {t("featuresSubtitle")}
            </p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feat, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className={`bg-base rounded-card p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all duration-300 border ${
                    feat.highlight ? "border-danger/20 ring-1 ring-danger/10" : "border-base-dark/5"
                  }`}
                >
                  <div className="p-3 bg-white rounded-xl shadow-xs mb-5 flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-base-dark mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-base-dark/70 leading-relaxed">
                    {feat.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* "How It Works" Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-base-dark tracking-tight">
            {t("howTitle")}
          </h2>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative group">
                {/* Step circle indicator */}
                <div className="relative flex items-center justify-center z-10">
                  <div className="h-12 w-12 rounded-full bg-secondary text-[#FAF9F6] font-extrabold text-lg flex items-center justify-center shadow-md">
                    {step.number}
                  </div>
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-[#FAF9F6] text-3xs font-bold rounded-full flex items-center justify-center shadow-sm">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-base-dark mt-6 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-base-dark/70 leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Constitutional Basis & Trust Section */}
        <section className="bg-secondary/5 border-t border-base-dark/5 px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center space-y-6">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
              <HeartHandshake className="h-10 w-10" />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-base-dark tracking-tight">
              {t("trustTitle")}
            </h2>

            <p
              className="text-base md:text-lg text-base-dark/85 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: t("trustText1").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />

            <p className="text-sm md:text-base text-base-dark/75 leading-relaxed">
              {t("trustText2")}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
