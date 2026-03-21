"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

// Force dynamic rendering to prevent prerender errors with useSearchParams
export const dynamic = "force-dynamic";

function CoverLetterContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  const loadSession = async (id) => {
    try {
      const response = await fetch(`/api/session?id=${id}`);
      const data = await response.json();

      if (data.success && data.session) {
        setJobDescription(data.session.job_description || "");
        setResumeText(data.session.resume_text || "");
        setCompanyName(data.session.company_name || "");
        setPositionTitle(data.session.job_title || "");

        if (data.session.cover_letter) {
          setCoverLetter({ content: data.session.cover_letter });
        }
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription || !resumeText) {
      setError("Please provide job description and resume");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeText,
          companyName,
          positionTitle,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCoverLetter({
          content: data.coverLetter,
          keyPoints: data.keyPoints,
        });
      } else {
        setError(data.error || "Failed to generate cover letter");
      }
    } catch (err) {
      setError("Failed to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (coverLetter?.content) {
      navigator.clipboard.writeText(coverLetter.content);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              CareerCraft
            </Link>
            <span className="text-gray-500">/</span>
            <h1 className="text-xl font-semibold text-gray-900">
              Cover Letter
            </h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!coverLetter ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Title
                  </label>
                  <input
                    type="text"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Senior Developer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste the job description here..."
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Your Resume</h2>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your resume text here..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !jobDescription || !resumeText}
              className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Cover Letter"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your Cover Letter</h2>
                <div className="space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Copy
                  </button>
                  <Link
                    href="/analysis"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    New Analysis
                  </Link>
                </div>
              </div>
              <div className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
                {coverLetter.content}
              </div>
            </div>

            {coverLetter.keyPoints && coverLetter.keyPoints.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-3">Key Points Covered</h3>
                <ul className="space-y-2">
                  {coverLetter.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function CoverLetterPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CoverLetterContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-7 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </main>
    </div>
  );
}
