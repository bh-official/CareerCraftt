import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnalysisProvider } from "@/context/AnalysisContext";
import { ClerkProvider } from "@clerk/nextjs";
import DevSignOutButton from "@/components/DevSignOutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CareerCraft - AI Job Application Assistant",
  description:
    "Intelligent job application assistant that helps you analyze job matches, generate cover letters, and prepare for interviews",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-gray-50">
          <DevSignOutButton />
          <AnalysisProvider>{children}</AnalysisProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
