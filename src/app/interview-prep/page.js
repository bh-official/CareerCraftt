"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

// Force dynamic rendering to prevent prerender errors with useSearchParams
export const dynamic = "force-dynamic";

function InterviewPrepContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [prep, setPrep] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("technical");

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

        if (data.session.technical_questions) {
          setPrep({
            technicalQuestions: JSON.parse(
              data.session.technical_questions || "[]",
            ),
            behavioralQuestions: JSON.parse(
              data.session.behavioral_questions || "[]",
            ),
            culturalFitPoints: JSON.parse(
              data.session.cultural_fit_talk_points || "[]",
            ),
            questionsToAsk: JSON.parse(data.session.questions_to_ask || "[]"),
            salaryPrep: JSON.parse(data.session.salary_prep || "{}"),
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
      const response = await fetch("/api/interview", {
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
        setPrep({
          technicalQuestions: data.technicalQuestions,
          behavioralQuestions: data.behavioralQuestions,
          culturalFitPoints: data.culturalFitPoints,
          questionsToAsk: data.questionsToAsk,
          salaryPrep: data.salaryPrep,
        });
      } else {
        setError(data.error || "Failed to generate interview prep");
      }
    } catch (err) {
      setError("Failed to generate interview prep. Please try again.");
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
              Interview Prep
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

        {!prep ? (
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
              {loading ? "Generating..." : "Generate Interview Prep"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("technical")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "technical"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Technical Questions
                </button>
                <button
                  onClick={() => setActiveTab("behavioral")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "behavioral"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Behavioral Questions
                </button>
                <button
                  onClick={() => setActiveTab("cultural")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "cultural"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Cultural Fit
                </button>
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "questions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Questions to Ask
                </button>
              </nav>
            </div>

            {/* Technical Questions */}
            {activeTab === "technical" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Technical Questions</h2>
                <div className="space-y-4">
                  {prep.technicalQuestions?.map((q, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {q.question}
                      </h3>
                      {q.answer && (
                        <p className="mt-2 text-gray-600">{q.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Behavioral Questions */}
            {activeTab === "behavioral" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Behavioral Questions</h2>
                <div className="space-y-4">
                  {prep.behavioralQuestions?.map((q, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {q.question}
                      </h3>
                      {q.tips && <p className="mt-2 text-gray-600">{q.tips}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Fit */}
            {activeTab === "cultural" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">
                  Cultural Fit Talk Points
                </h2>
                <div className="space-y-4">
                  {prep.culturalFitPoints?.map((point, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <h3 className="font-semibold text-gray-900">{point}</h3>
                    </div>
                  ))}
                </div>
                {prep.salaryPrep && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Salary Preparation
                    </h3>
                    <p className="text-blue-800">
                      Market Range: {prep.salaryPrep.marketRange}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Questions to Ask */}
            {activeTab === "questions" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">
                  Questions to Ask the Interviewer
                </h2>
                <div className="space-y-4">
                  {prep.questionsToAsk?.map((q, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <h3 className="font-semibold text-gray-900">{q}</h3>
                    </div>
                  ))}
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
                href="/cover-letter"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate Cover Letter
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function InterviewPrepPage() {
  return (
    <Suspense fallback={<Loading />}>
      <InterviewPrepContent />
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
