"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function CareerPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [career, setCareer] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("skills");

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

        if (data.session.suggested_skills) {
          setCareer({
            certifications: JSON.parse(
              data.session.suggested_certifications || "[]",
            ),
            skillsToDevelop: JSON.parse(data.session.suggested_skills || "[]"),
            learningResources: JSON.parse(
              data.session.learning_resources || "[]",
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
      const response = await fetch("/api/career", {
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
        setCareer({
          certifications: data.certifications,
          skillsToDevelop: data.skillsToDevelop,
          learningResources: data.learningResources,
          networkingSuggestions: data.networkingSuggestions,
          emergingSkills: data.emergingSkills,
        });
      } else {
        setError(data.error || "Failed to generate career suggestions");
      }
    } catch (err) {
      setError("Failed to generate career suggestions. Please try again.");
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
              Career Development
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

        {!career ? (
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
              {loading ? "Generating..." : "Get Career Suggestions"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("skills")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "skills"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Skills to Develop
                </button>
                <button
                  onClick={() => setActiveTab("certifications")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "certifications"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Certifications
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "resources"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Learning Resources
                </button>
                <button
                  onClick={() => setActiveTab("networking")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "networking"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Networking
                </button>
              </nav>
            </div>

            {/* Skills to Develop */}
            {activeTab === "skills" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Skills to Develop</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {career.skillsToDevelop?.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 bg-blue-50 rounded-lg"
                    >
                      <span className="text-blue-600 mr-3 text-xl">🎯</span>
                      <span className="font-medium">{skill}</span>
                    </div>
                  ))}
                </div>
                {career.emergingSkills && career.emergingSkills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">
                      Emerging Skills to Watch
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {career.emergingSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Certifications */}
            {activeTab === "certifications" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">
                  Recommended Certifications
                </h2>
                <div className="space-y-4">
                  {career.certifications?.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 border border-gray-200 rounded-lg"
                    >
                      <span className="text-green-600 mr-3 text-xl">🏆</span>
                      <span className="font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Resources */}
            {activeTab === "resources" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Learning Resources</h2>
                <div className="space-y-4">
                  {career.learningResources?.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-yellow-50 rounded-lg"
                    >
                      <span className="text-yellow-600 mr-3 text-xl">📚</span>
                      <div>
                        <h3 className="font-semibold">{resource.title}</h3>
                        <p className="text-sm text-gray-600">
                          Type: {resource.type}
                        </p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Visit Resource →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Networking */}
            {activeTab === "networking" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">
                  Networking Suggestions
                </h2>
                <div className="space-y-4">
                  {career.networkingSuggestions?.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-green-50 rounded-lg"
                    >
                      <span className="text-green-600 mr-3 text-xl">🤝</span>
                      <span className="font-medium">{suggestion}</span>
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
