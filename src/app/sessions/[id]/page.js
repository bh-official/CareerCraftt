"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";

/**
 * Dynamic Session Page
 *
 * Displays a specific analysis session by ID.
 * Uses Next.js dynamic route parameters.
 */
const AnalysisPage = dynamic(() => import("@/components/AnalysisPage"), {
  ssr: false,
});

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id;
  const { loadSession } = useAnalysis();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/session?id=${sessionId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to load session");
        }

        setSession(data.session);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;

    const parseJSON = (value, fallback) => {
      if (value == null) return fallback;
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      }
      return value;
    };

    const hasAnalysis = session.overall_score != null;

    loadSession({
      jobDescription: session.job_description || "",
      resumeText: session.resume_text || "",
      companyName: session.company_name || "",
      jobTitle: session.job_title || "",
      sessionId: session.id,
      analysis: hasAnalysis
        ? {
            overallScore: Number(session.overall_score) || 0,
            skills: {
              score: Number(session.skills_score) || 0,
            },
            experience: {
              score: Number(session.experience_score) || 0,
            },
            education: {
              score: Number(session.education_score) || 0,
            },
            keywords: {
              score: Number(session.keywords_score) || 0,
            },
            gapAnalysis: parseJSON(session.gap_analysis, []),
            matchedRequirements: parseJSON(session.matched_requirements, []),
            unmatchedRequirements: parseJSON(
              session.unmatched_requirements,
              [],
            ),
            partialMatches: parseJSON(session.partial_matches, []),
          }
        : null,
      coverLetter: session.cover_letter || "",
      optimization:
        session.resume_improvements ||
        session.ats_recommendations ||
        session.keyword_suggestions
          ? {
              resumeImprovements: parseJSON(session.resume_improvements, []),
              atsRecommendations: parseJSON(session.ats_recommendations, []),
              keywordSuggestions: parseJSON(session.keyword_suggestions, {}),
              contentSuggestions: [],
            }
          : null,
      interviewPrep:
        session.technical_questions ||
        session.behavioral_questions ||
        session.cultural_fit_talk_points
          ? {
              technicalQuestions: parseJSON(session.technical_questions, []),
              behavioralQuestions: parseJSON(session.behavioral_questions, []),
              culturalFitPoints: parseJSON(
                session.cultural_fit_talk_points,
                [],
              ),
              questionsToAsk: [],
              salaryPrep: {},
              weaknessStrategies: [],
            }
          : null,
      careerDevelopment:
        session.suggested_certifications ||
        session.suggested_skills ||
        session.learning_resources
          ? {
              certifications: parseJSON(session.suggested_certifications, []),
              skillsToDevelop: parseJSON(session.suggested_skills, []),
              learningResources: parseJSON(session.learning_resources, []),
              networkingSuggestions: [],
              emergingSkills: [],
            }
          : null,
      activeTab: "overview",
      error: null,
    });
  }, [session, loadSession]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md p-6"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Session
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Session found - initialize context and render AnalysisPage
  if (session) {
    return (
      <div>
        {/* Session Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-gray-200 px-4 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {session.name || "Analysis Session"}
                </h1>
                {session.company_name && session.job_title && (
                  <p className="text-sm text-gray-500">
                    {session.job_title} at {session.company_name}
                  </p>
                )}
              </div>
            </div>
            {session.overall_score && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Score:</span>
                <span
                  className={`text-lg font-bold ${
                    session.overall_score >= 80
                      ? "text-green-600"
                      : session.overall_score >= 60
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {session.overall_score}%
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Analysis Content */}
        <AnalysisPage />
      </div>
    );
  }

  return null;
}
