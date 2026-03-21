"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import ScoreCard from "@/components/ScoreCard";
import GapList from "@/components/GapList";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

// Force dynamic rendering to prevent prerender errors with useSearchParams
export const dynamic = "force-dynamic";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");

  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");

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
        setJobTitle(data.session.job_title || "");

        if (data.session.overall_score) {
          setAnalysis({
            overallScore: data.session.overall_score,
            skills: {
              score: data.session.skills_score,
              confidence: data.session.skills_confidence,
            },
            experience: {
              score: data.session.experience_score,
              confidence: data.session.experience_confidence,
            },
            education: {
              score: data.session.education_score,
              confidence: data.session.education_confidence,
            },
            keywords: {
              score: data.session.keywords_score,
              confidence: data.session.keywords_confidence,
            },
            gapAnalysis: data.session.gap_analysis
              ? JSON.parse(data.session.gap_analysis)
              : [],
            matchedRequirements: data.session.matched_requirements
              ? JSON.parse(data.session.matched_requirements)
              : [],
            unmatchedRequirements: data.session.unmatched_requirements
              ? JSON.parse(data.session.unmatched_requirements)
              : [],
          });
        }
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  const handleFileUpload = (text) => {
    setResumeText(text);
    setActiveTab("input");
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !resumeText) {
      setError("Please provide both job description and resume");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeText,
          companyName,
          jobTitle,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading skeleton while Suspense resolves */}
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              CareerCraft
            </Link>
            <span className="text-gray-500">/</span>
            <h1 className="text-xl font-semibold text-gray-900">
              Job Analysis
            </h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("upload")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "upload"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Upload Resume
            </button>
            <button
              onClick={() => setActiveTab("input")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "input"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Paste Text
            </button>
            {analysis && (
              <button
                onClick={() => setActiveTab("results")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "results"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Results
              </button>
            )}
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="bg-white rounded-lg shadow p-6">
            <FileUploader onUpload={handleFileUpload} />
          </div>
        )}

        {/* Input Tab */}
        {activeTab === "input" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name (optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title (optional)
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Senior Developer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste the job description here..."
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Your Resume</h2>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste your resume text here, or upload a file using the Upload Resume tab..."
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !jobDescription || !resumeText}
              className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing..." : "Analyze Job Match"}
            </button>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && analysis && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Overall Match Score</h2>
                <Link
                  href={`/cover-letter?sessionId=${sessionId}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Generate Cover Letter
                </Link>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={
                        analysis.overallScore >= 70
                          ? "#10b981"
                          : analysis.overallScore >= 40
                            ? "#f59e0b"
                            : "#ef4444"
                      }
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${analysis.overallScore * 2.83} 283`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">
                      {analysis.overallScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysis.skills && (
                <ScoreCard
                  title="Skills Match"
                  score={analysis.skills.score}
                  confidence={analysis.skills.confidence}
                  description="Technical skills alignment"
                />
              )}
              {analysis.experience && (
                <ScoreCard
                  title="Experience"
                  score={analysis.experience.score}
                  confidence={analysis.experience.confidence}
                  description="Work experience fit"
                />
              )}
              {analysis.education && (
                <ScoreCard
                  title="Education"
                  score={analysis.education.score}
                  confidence={analysis.education.confidence}
                  description="Educational background"
                />
              )}
              {analysis.keywords && (
                <ScoreCard
                  title="Keywords"
                  score={analysis.keywords.score}
                  confidence={analysis.keywords.confidence}
                  description="Keyword optimization"
                />
              )}
            </div>

            {/* Gap Analysis */}
            {analysis.gapAnalysis && analysis.gapAnalysis.length > 0 && (
              <GapList gaps={analysis.gapAnalysis} />
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/interview-prep?sessionId=${sessionId}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
              >
                <span className="text-2xl mb-2">🎯</span>
                <h3 className="font-semibold">Interview Prep</h3>
                <p className="text-sm text-gray-500">Prepare for interviews</p>
              </Link>
              <Link
                href={`/optimization?sessionId=${sessionId}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
              >
                <span className="text-2xl mb-2">📝</span>
                <h3 className="font-semibold">Optimize Resume</h3>
                <p className="text-sm text-gray-500">Improve your resume</p>
              </Link>
              <Link
                href={`/career?sessionId=${sessionId}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
              >
                <span className="text-2xl mb-2">📈</span>
                <h3 className="font-semibold">Career Growth</h3>
                <p className="text-sm text-gray-500">Plan your career path</p>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function AnalysisPage() {
  return (
    <Suspense fallback={<AnalysisLoading />}>
      <AnalysisContent />
    </Suspense>
  );
}

// Loading skeleton component
function AnalysisLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="h-7 w-32 bg-gray-200 animate-pulse rounded"></div>
            <span className="text-gray-500">/</span>
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </main>
    </div>
  );
}
