"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, PhoneCall, Scale } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { toggleLanguage, language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Detect scroll to apply sticky styles
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: t("navAbout"), href: "/about" },
    { name: t("navContact"), href: "/contact" },
    { name: t("navPrivacy"), href: "/privacy" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base/95 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-secondary text-base p-2 rounded-xl flex items-center justify-center shadow-sm"
            >
              <Scale className="h-6 w-6 text-[#FAF9F6]" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-base-dark tracking-tight leading-none group-hover:text-primary transition-colors">
                {t("appName")}
              </span>
              <span className="text-xs text-secondary font-medium tracking-wide">
                {t("appSubtitle")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary border-b-2 border-primary pb-1" : "text-base-dark/80"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Language Switcher */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-secondary/30 text-secondary text-sm font-semibold hover:bg-secondary/5 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>{t("langToggle")}</span>
            </motion.button>

            {/* Pulsing Emergency SOS Button */}
            <Link href="/sos">
              <motion.button
                animate={shouldReduceMotion ? {} : {
                  boxShadow: [
                    "0 0 0 0 rgba(163, 45, 45, 0.4)",
                    "0 0 0 10px rgba(163, 45, 45, 0)",
                  ],
                }}
                transition={shouldReduceMotion ? {} : {
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-danger text-[#FAF9F6] px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-danger-hover transition-colors"
              >
                <PhoneCall className={`h-4 w-4 ${shouldReduceMotion ? "" : "animate-bounce"}`} />
                <span>{t("navSosBtn")}</span>
              </motion.button>
            </Link>
          </div>

          {/* Mobile Right Controls (Language + Emergency + Hamburger) */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Language Toggler for Mobile */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl text-secondary border border-secondary/20 bg-secondary/5 flex items-center justify-center"
              aria-label="Toggle language"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-bold ml-1">{language === "en" ? "HI" : "EN"}</span>
            </button>

            {/* SOS Button always visible on Mobile */}
            <Link href="/sos">
              <motion.button
                animate={shouldReduceMotion ? {} : {
                  scale: [1, 1.03, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(163, 45, 45, 0.4)",
                    "0 0 0 6px rgba(163, 45, 45, 0)",
                  ],
                }}
                transition={shouldReduceMotion ? {} : {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-danger text-[#FAF9F6] p-2.5 rounded-xl flex items-center justify-center shadow-md hover:bg-danger-hover"
                aria-label={t("navSosBtn")}
              >
                <PhoneCall className="h-4 w-4 text-[#FAF9F6]" />
              </motion.button>
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-base-dark/80 hover:bg-base-dark/5 flex items-center justify-center transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-base border-b border-base-dark/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-base-dark/70 hover:bg-base-dark/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
