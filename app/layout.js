import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "700"],
  variable: "--font-devanagari",
});

export const metadata = {
  title: "Nyay Sahayak (न्याय सहायक) - Legal Services & Aid Portal",
  description: "Citizen legal-aid triage and SOS assistance portal in India.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${notoSansDevanagari.variable} font-sans antialiased bg-base text-base-dark min-h-screen flex flex-col`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
