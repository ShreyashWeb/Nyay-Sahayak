"use client";

import React from "react";
import Link from "next/link";
import { Scale } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary text-[#FAF9F6] mt-auto border-t border-secondary-hover">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Branding & Philosophy */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-[#FAF9F6] text-secondary p-1.5 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">{t("appName")}</span>
            </div>
            <p className="text-sm text-[#FAF9F6]/80 max-w-sm leading-relaxed">
              {t("heroTagline")} — {t("footerNote")}
            </p>
          </div>

          {/* Column 2: Legal Foundations */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FAF9F6]/90">
              {t("trustTitle")}
            </h3>
            <p className="text-xs text-[#FAF9F6]/70 leading-relaxed">
              Article 39A mandates free legal aid to ensure that justice is accessible to all, regardless of economic or social standing.
            </p>
          </div>

          {/* Column 3: Site Navigation */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FAF9F6]/90">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-[#FAF9F6]/75">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t("navAbout")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  {t("navContact")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  {t("navPrivacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Section */}
        <div className="mt-8 pt-8 border-t border-[#FAF9F6]/10">
          <div className="bg-[#FAF9F6]/5 rounded-xl p-4 md:p-6 border border-[#FAF9F6]/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              {t("trustDisclaimerTitle")}
            </h4>
            <p className="text-xs text-[#FAF9F6]/75 leading-relaxed">
              {t("trustDisclaimerText")}
            </p>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#FAF9F6]/60 space-y-4 md:space-y-0">
          <span>{t("footerRights")}</span>
          <span className="flex items-center space-x-1">
            <span>Powered by the Legal Services Authorities Act, 1987</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
