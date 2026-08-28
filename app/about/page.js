"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Scale, MapPin, ShieldAlert, FileText, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const { language } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-start">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-left space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-secondary uppercase tracking-widest">
              <BookOpen className="h-4 w-4" />
              <span>{language === "hi" ? "हमारे बारे में" : "About the Platform"}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-base-dark tracking-tight">
              Nyay Sahayak (न्याय सहायक)
            </h1>
            <p className="text-sm md:text-base text-base-dark/65 max-w-2xl">
              India&apos;s first AI-assisted legal triage and crisis-response platform, designed to make access to justice simple, instant, and free.
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

          {/* Constitutional Mandate Callout */}
          <motion.div
            variants={itemVariants}
            className="bg-secondary/5 border border-secondary/15 rounded-3xl p-6 md:p-8 text-left space-y-4"
          >
            <div className="flex items-center space-x-3 text-secondary">
              <Landmark className="h-6 w-6 shrink-0" />
              <h2 className="text-lg font-black uppercase tracking-wider">
                {language === "hi" ? "संवैधानिक जनादेश: अनुच्छेद 39A" : "Constitutional Mandate: Article 39A"}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm text-base-dark/85 leading-relaxed font-medium">
              <div className="space-y-2">
                <span className="text-2xs font-extrabold text-secondary uppercase block">English</span>
                <p>
                  &ldquo;The State shall secure that the operation of the legal system promotes justice on a basis of equal opportunity, and shall in particular, provide free legal aid, by suitable legislation or schemes... to ensure that opportunities for securing justice are not denied to any citizen by reason of economic or other disabilities.&rdquo;
                </p>
              </div>
              <div className="space-y-2 border-t md:border-t-0 md:border-l border-base-dark/5 pt-4 md:pt-0 md:pl-6">
                <span className="text-2xs font-extrabold text-secondary uppercase block">Hindi / हिंदी</span>
                <p className="font-hindi leading-loose">
                  &ldquo;राज्य यह सुनिश्चित करेगा कि कानूनी प्रणाली का संचालन समान अवसर के आधार पर न्याय को बढ़ावा दे, और विशेष रूप से, उपयुक्त विधान या योजनाओं द्वारा मुफ्त कानूनी सहायता प्रदान करेगा... यह सुनिश्चित करने के लिए कि आर्थिक या अन्य अक्षमताओं के कारण किसी भी नागरिक को न्याय प्राप्त करने के अवसरों से वंचित न किया जाए।&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Platform Core Features Pillars Grid */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-xl font-extrabold text-base-dark border-b border-base-dark/5 pb-2 text-left">
              {language === "hi" ? "प्लेटफॉर्म के चार मुख्य स्तंभ" : "The Four Pillars of Nyay Sahayak"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pillar 1 */}
              <div className="bg-white border border-base-dark/5 p-6 rounded-3xl text-left space-y-3 shadow-2xs">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl w-max">
                  <Scale className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-base-dark text-base">
                  {language === "hi" ? "आवाज और पाठ विश्लेषण" : "Plain Language Triage"}
                </h3>
                <p className="text-xs text-base-dark/70 leading-relaxed">
                  Citizens write or speak in English, Hindi, or Hinglish. Our rule-based matching engine categorizes their dispute (domestic violence, wage conflicts, consumer scams) and extracts safety risks instantly.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white border border-base-dark/5 p-6 rounded-3xl text-left space-y-3 shadow-2xs">
                <div className="bg-secondary/10 text-secondary p-3 rounded-2xl w-max">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-base-dark text-base">
                  {language === "hi" ? "भौगोलिक डीएलएसए लोकेटर" : "Geospatial Office Mapping"}
                </h3>
                <p className="text-xs text-base-dark/70 leading-relaxed">
                  Using geolocation browser coordinates, our PostGIS database queries calculate exact Earth-surface distances to map, rank, and locate the nearest District Legal Services Authority (DLSA) desks.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white border border-base-dark/5 p-6 rounded-3xl text-left space-y-3 shadow-2xs">
                <div className="bg-danger/10 text-danger p-3 rounded-2xl w-max">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-base-dark text-base">
                  {language === "hi" ? "संकटकालीन प्रतिक्रिया (SOS)" : "SOS Mode & Silent Alerts"}
                </h3>
                <p className="text-xs text-base-dark/70 leading-relaxed">
                  High-risk triage matches trigger SOS Mode instantly, presenting women/police helplines, shelter locators, and silent SMS notification options for users facing immediate danger.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white border border-base-dark/5 p-6 rounded-3xl text-left space-y-3 shadow-2xs">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl w-max">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-base-dark text-base">
                  {language === "hi" ? "मुफ्त कानूनी मसौदा" : "Automatic Petition Compilers"}
                </h3>
                <p className="text-xs text-base-dark/70 leading-relaxed">
                  Pulls category-specific legal drafts from database templates, binds Complainant details in real-time, and compiles downloadable, court-ready petition documents client-side using jsPDF.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
