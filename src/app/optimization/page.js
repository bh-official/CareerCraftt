"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

// Force dynamic rendering to prevent prerender errors with useSearchParams
export const dynamic = "force-dynamic";

function OptimizationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("resume");

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

        if (data.session.resume_improvements) {
          setOptimization({
            resumeImprovements: JSON.parse(
              data.session.resume_improvements || "[]",
            ),
            atsRecommendations: JSON.parse(
              data.session.ats_recommendations || "[]",
            ),
            keywordSuggestions: JSON.parse(
              data.session.keyword_suggestions || "{}",
            ),
          });
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
      const response = await fetch("/api/optimization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeText,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOptimization({
          resumeImprovements: data.resumeImprovements,
          atsRecommendations: data.atsRecommendations,
          keywordSuggestions: data.keywordSuggestions,
          contentSuggestions: data.contentSuggestions,
        });
      } else {
        setError(data.error || "Failed to generate optimization tips");
      }
    } catch (err) {
      setError("Failed to generate optimization tips. Please try again.");
    } finally {
      setLoading(false);
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
              Resume Optimization
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

        {!optimization ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Job Details</h2>
              <div className="mb-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Resume
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste your resume text here..."
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !jobDescription || !resumeText}
              className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Get Optimization Tips"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("resume")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "resume"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Resume Improvements
                </button>
                <button
                  onClick={() => setActiveTab("ats")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "ats"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  ATS Tips
                </button>
                <button
                  onClick={() => setActiveTab("keywords")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "keywords"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Keywords
                </button>
              </nav>
            </div>

            {/* Resume Improvements */}
            {activeTab === "resume" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Resume Improvements</h2>
                <div className="space-y-4">
                  {optimization.resumeImprovements?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-yellow-50 rounded-lg"
                    >
                      <span className="text-yellow-600 mr-3 text-xl">💡</span>
                      <div>
                        <h3 className="font-semibold">{item}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ATS Tips */}
            {activeTab === "ats" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">ATS Recommendations</h2>
                <div className="space-y-4">
                  {optimization.atsRecommendations?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-green-50 rounded-lg"
                    >
                      <span className="text-green-600 mr-3 text-xl">✓</span>
                      <div>
                        <h3 className="font-semibold">{item}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {activeTab === "keywords" && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Required Keywords</h2>
                  <div className="flex flex-wrap gap-2">
                    {optimization.keywordSuggestions?.required?.map(
                      (kw, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                        >
                          {kw}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Optional Keywords</h2>
                  <div className="flex flex-wrap gap-2">
                    {optimization.keywordSuggestions?.optional?.map(
                      (kw, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {kw}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Keywords to Avoid</h2>
                  <div className="flex flex-wrap gap-2">
                    {optimization.keywordSuggestions?.avoid?.map(
                      (kw, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium line-through"
                        >
                          {kw}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Link
                href="/analysis"
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Back to Analysis
              </Link>
              <Link
                href="/interview-prep"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Interview Prep
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function OptimizationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OptimizationContent />
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
