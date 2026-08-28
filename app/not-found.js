"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto flex flex-col justify-center text-center space-y-6">
        <div className="mx-auto bg-primary/10 text-primary p-5 rounded-full w-20 h-20 flex items-center justify-center animate-pulse">
          <AlertTriangle className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">
            Page Not Found / पृष्ठ नहीं मिला
          </h1>
          <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved. Don&apos;t worry—you can return to the dashboard or access emergency assistance from the navigation bar.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-secondary text-[#FAF9F6] hover:bg-secondary-hover px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md min-h-[44px]">
              <Home className="h-4 w-4" />
              <span>Go Back Home / मुख्य पृष्ठ</span>
            </button>
          </Link>
          
          <Link href="/sos">
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-danger text-[#FAF9F6] hover:bg-danger-hover px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md min-h-[44px]">
              <span>Emergency Help / आपातकालीन सहायता</span>
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
