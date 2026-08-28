"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const { language } = useLanguage();

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    subject: "feedback",
    message: ""
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, val) => {
    setFormValues((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formValues.name.trim()) tempErrors.name = "Full name is required.";
    if (!formValues.email.trim()) {
      tempErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      tempErrors.email = "Please enter a valid email address.";
    }
    if (!formValues.message.trim()) tempErrors.message = "Message details are required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormValues({
        name: "",
        email: "",
        subject: "feedback",
        message: ""
      });
    }, 1000);
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-start">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-left space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-secondary uppercase tracking-widest">
              <Phone className="h-4 w-4 text-secondary" />
              <span>{language === "hi" ? "संपर्क करें" : "Contact & Support"}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-base-dark tracking-tight">
              Get in Touch
            </h1>
            <p className="text-sm text-base-dark/60 leading-relaxed max-w-xl">
              Have feedback, suggestions, or technical inquiries? Send us a message or reach out to NALSA headquarters.
            </p>
          </div>

          {/* Back Home Link */}
          <div className="text-left">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{language === "hi" ? "मुख्य पृष्ठ पर वापस जाएं" : "Back to Home"}</span>
            </Link>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Contact Form */}
            <div className="lg:col-span-7 bg-white border border-base-dark/5 p-6 md:p-8 rounded-3xl shadow-3xs text-left">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-extrabold text-base-dark/70 uppercase">Your Name / आपका नाम</label>
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g. Shreyash Sharma"
                    className="p-3.5 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all duration-200"
                  />
                  {errors.name && <span className="text-[10px] text-danger font-bold">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-extrabold text-base-dark/70 uppercase">Email Address / ईमेल</label>
                  <input
                    type="text"
                    value={formValues.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="name@example.com"
                    className="p-3.5 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all duration-200"
                  />
                  {errors.email && <span className="text-[10px] text-danger font-bold">{errors.email}</span>}
                </div>

                {/* Subject type select */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-extrabold text-base-dark/70 uppercase">Subject / विषय</label>
                  <select
                    value={formValues.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="p-3.5 rounded-xl border border-base-dark/15 text-xs font-bold text-base-dark/85 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="feedback">General Feedback / प्रतिक्रिया</option>
                    <option value="technical">Technical Support / तकनीकी सहायता</option>
                    <option value="complaint">Report a Bug / बग रिपोर्ट करें</option>
                    <option value="other">Other Inquiry / अन्य पूछताछ</option>
                  </select>
                </div>

                {/* Message details */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-extrabold text-base-dark/70 uppercase">Message Details / संदेश</label>
                  <textarea
                    rows={5}
                    value={formValues.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Describe your suggestion or report in detail..."
                    className="p-3.5 rounded-xl border border-base-dark/15 text-xs font-semibold text-base-dark placeholder-base-dark/35 focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary resize-none transition-all duration-200"
                  />
                  {errors.message && <span className="text-[10px] text-danger font-bold">{errors.message}</span>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-primary text-[#FAF9F6] rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:bg-primary-hover transition-colors min-h-[44px]"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? "Sending..." : "Submit Feedback"}</span>
                </button>
              </form>
            </div>

            {/* Right Column: NALSA details */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Toll free hotline */}
              <div className="bg-[#E7F3F0] border border-secondary/20 rounded-3xl p-6 space-y-3">
                <span className="bg-secondary/15 text-secondary font-black text-2xs uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Free Legal Helpline
                </span>
                <h3 className="text-xl font-extrabold text-secondary flex items-center space-x-2">
                  <Phone className="h-5 w-5 animate-bounce" />
                  <span>NALSA Helpline: 15100</span>
                </h3>
                <p className="text-2xs text-secondary/80 leading-normal font-semibold">
                  Toll-free national legal assistance helpline. Connect with panel coordinators in your state 24/7.
                </p>
              </div>

              {/* NALSA Head Office details */}
              <div className="bg-white border border-base-dark/5 p-6 rounded-3xl space-y-5 shadow-2xs">
                <h2 className="text-sm font-extrabold text-base-dark uppercase tracking-wider border-b border-base-dark/5 pb-3">
                  NALSA Headquarters
                </h2>
                
                <div className="space-y-4 text-xs">
                  {/* Address */}
                  <div className="flex space-x-3 items-start">
                    <MapPin className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                    <div className="text-base-dark/85 leading-normal">
                      <strong className="block text-base-dark">National Legal Services Authority</strong>
                      <span>Jamnagar House, Shahjahan Road, New Delhi - 110011</span>
                    </div>
                  </div>

                  {/* Telephone */}
                  <div className="flex space-x-3 items-start">
                    <Phone className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                    <div className="text-base-dark/85 leading-normal">
                      <strong className="block text-base-dark">Phone Contacts</strong>
                      <span>011-23385316 / 011-23071450</span>
                    </div>
                  </div>

                  {/* Mail */}
                  <div className="flex space-x-3 items-start">
                    <Mail className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                    <div className="text-base-dark/85 leading-normal">
                      <strong className="block text-base-dark">Email Support</strong>
                      <a href="mailto:nalsa-dla@nic.in" className="text-secondary hover:underline">
                        nalsa-dla@nic.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Submission Success Modal */}
      <AnimatePresence>
        {submitted && (
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
              <div className="bg-[#E7F3F0] text-secondary p-4 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-secondary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-base-dark">
                  {language === "hi" ? "प्रतिक्रिया प्राप्त हुई!" : "Feedback Received!"}
                </h3>
                <p className="text-xs text-base-dark/60 leading-normal">
                  Thank you for helping us improve Nyay Sahayak. Your feedback helps ensure legal services remain accessible to everyone.
                </p>
              </div>

              <button
                onClick={() => setSubmitted(false)}
                className="w-full py-3 bg-secondary hover:bg-secondary-hover text-[#FAF9F6] font-bold rounded-xl text-xs transition-colors min-h-[40px]"
              >
                Close / बंद करें
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
