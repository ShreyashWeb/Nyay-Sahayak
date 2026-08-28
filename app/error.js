"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log the error to console or error service
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto flex flex-col justify-center text-center space-y-6">
        <div className="mx-auto bg-danger/10 text-danger p-5 rounded-full w-20 h-20 flex items-center justify-center animate-pulse">
          <AlertCircle className="h-10 w-10 text-danger" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">
            Something Went Wrong / कुछ त्रुटि हुई
          </h1>
          <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">
            The application encountered an unexpected error. Please try reloading the page, or navigate to our emergency dashboard if you require urgent legal or crisis assistance.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-secondary text-[#FAF9F6] hover:bg-secondary-hover px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md min-h-[44px]"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Try Reloading / पुनः प्रयास करें</span>
          </button>
          
          <Link href="/">
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 border border-secondary/35 text-secondary hover:bg-secondary/5 px-6 py-3.5 rounded-xl text-xs font-bold transition-all min-h-[44px]">
              <Home className="h-4 w-4" />
              <span>Back Home / मुख्य पृष्ठ</span>
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
