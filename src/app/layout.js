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
        <body
          suppressHydrationWarning
          className="min-h-full flex flex-col bg-gray-50"
          style={{ position: "relative" }}
        >
          {/* Temporary signout button for development - remove in production */}
          {process.env.NODE_ENV === "development" && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 1000,
              }}
            >
              <button
                onClick={() =>
                  fetch("/api/signout", { method: "POST" }).then(() =>
                    window.location.reload(),
                  )
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Sign Out (Dev)
              </button>
            </div>
          )}
          <AnalysisProvider>{children}</AnalysisProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
