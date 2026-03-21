import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnalysisProvider } from "@/context/AnalysisContext";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://careercraft.app"),
  title: {
    default: "CareerCraft - AI Job Application Assistant",
    template: "%s | CareerCraft",
  },
  description:
    "CareerCraft - Craft your path to the perfect job. AI-powered job application assistant that analyzes job descriptions, generates cover letters, optimizes resumes, and prepares you for interviews.",
  keywords: [
    "job search",
    "career assistant",
    "resume optimizer",
    "cover letter generator",
    "interview preparation",
    "AI career coach",
    "job application tracker",
    "ATS optimization",
    "career development",
    "job matching",
  ],
  authors: [{ name: "CareerCraft" }],
  creator: "CareerCraft",
  publisher: "CareerCraft",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://careercraft.app",
    siteName: "CareerCraft",
    title: "CareerCraft - AI Job Application Assistant",
    description:
      "Craft your path to the perfect job. AI-powered career assistant that analyzes job descriptions, generates cover letters, and prepares you for interviews.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "CareerCraft - AI Job Application Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerCraft - AI Job Application Assistant",
    description:
      "Craft your path to the perfect job. AI-powered career assistant.",
    images: ["/og-image.svg"],
    creator: "@careercraft",
  },
  alternates: {
    canonical: "https://careercraft.app",
    languages: {
      en: "https://careercraft.app",
    },
  },
  category: "technology",
  classification: "Career & Job Search Tools",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-gray-50">
          <AnalysisProvider>{children}</AnalysisProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
