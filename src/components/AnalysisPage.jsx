"use client";

import { useState } from "react";
import { useAnalysis } from "@/context/AnalysisContext";
import FileUploader from "@/components/FileUploader";
import Tabs from "@/components/Tabs";
import ScoreCard, { OverallScoreCard } from "@/components/ScoreCard";
import GapList, { RequirementsList } from "@/components/GapList";
import CoverLetterEditor from "@/components/CoverLetterEditor";
import OptimizationTips from "@/components/OptimizationTips";
import InterviewPrep from "@/components/InterviewPrep";
import CareerDevelopment from "@/components/CareerDevelopment";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Send,
  FileText,
  Building,
  Briefcase,
} from "lucide-react";

/**
 * AnalysisPage Component
 *
 * Main analysis interface that handles job application optimization through AI.
 * Provides comprehensive tools for matching resumes to job descriptions.
 *
 * Architecture & Key Decisions:
 * - Uses AnalysisContext for centralized state management across all tabs
 * - File uploads are parsed client-side before context update
 * - Each output type (cover letter, optimization, etc.) has dedicated generation handler
 * - Tabs lazily render content based on activeTab state to reduce initial load
 * - Error handling wraps async operations with try/catch and context error state
 *
 * @component
 * @returns {JSX.Element} Main analysis interface with input forms and results tabs
 */

export default function AnalysisPage() {
  const {
    jobDescription,
    resumeText,
    companyName,
    jobTitle,
    setInput,
    runAnalysis,
    generateCoverLetter,
    generateOptimization,
    generateInterviewPrep,
    generateCareerDevelopment,
    analysis,
    coverLetter,
    optimization,
    interviewPrep,
    careerDevelopment,
    isAnalyzing,
    isGenerating,
    error,
    activeTab,
    setActiveTab,
  } = useAnalysis();

  const [jobFile, setJobFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  /**
   * Handles job description file selection.
   * Extracts text content from uploaded file and updates context.
   * @param {Object} file - File object with text property from FileUploader
   */
  const handleJobFileSelect = (file) => {
    setJobFile(file);
    if (file) {
      setInput({ jobDescription: file.text });
    }
  };

  /**
   * Handles resume file selection.
   * Extracts text content from uploaded file and updates context.
   * @param {Object} file - File object with text property from FileUploader
   */
  const handleResumeFileSelect = (file) => {
    setResumeFile(file);
    if (file) {
      setInput({ resumeText: file.text });
    }
  };

  const handleAnalyze = async () => {
    try {
      await runAnalysis();
    } catch (err) {
      console.error("Analysis failed:", err);
    }
  };

  const handleGenerateCoverLetter = async () => {
    try {
      await generateCoverLetter();
    } catch (err) {
      console.error("Cover letter generation failed:", err);
    }
  };

  const handleGenerateOptimization = async () => {
    try {
      await generateOptimization();
    } catch (err) {
      console.error("Optimization generation failed:", err);
    }
  };

  const handleGenerateInterview = async () => {
    try {
      await generateInterviewPrep();
    } catch (err) {
      console.error("Interview prep generation failed:", err);
    }
  };

  const handleGenerateCareer = async () => {
    try {
      await generateCareerDevelopment();
    } catch (err) {
      console.error("Career development generation failed:", err);
    }
  };

  // Validation constants
  const MIN_CONTENT_LENGTH = 50;

  // Validation states for real-time feedback
  const jobDescriptionValid = jobDescription.length >= MIN_CONTENT_LENGTH;
  const resumeValid = resumeText.length >= MIN_CONTENT_LENGTH;
  const canAnalyze = jobDescriptionValid && resumeValid;

  // Helper function to get character count color
  const getCharCountColor = (length, min) => {
    if (length === 0) return "text-gray-400";
    if (length < min) return "text-amber-600";
    return "text-green-600";
  };

  // Helper function for validation message
  const getValidationMessage = (length, min) => {
    if (length === 0) return `${min} characters minimum required`;
    if (length < min) return `${min - length} more characters needed`;
    return "Good length";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 py-6"
        role="main"
        tabIndex="-1"
      >
        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Job Description Input */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Job Description</h2>
            </div>

            <FileUploader
              onFileSelect={handleJobFileSelect}
              label="Upload Job Description"
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or paste job description
                <span className="ml-2 text-xs text-gray-500">(required)</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setInput({ jobDescription: e.target.value })}
                placeholder="Paste the job description here..."
                aria-describedby="job-description-hint"
                className={`w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  jobDescription.length > 0 && !jobDescriptionValid
                    ? "border-amber-300 bg-amber-50"
                    : jobDescriptionValid
                      ? "border-green-300"
                      : "border-gray-300"
                }`}
                required
                minLength={MIN_CONTENT_LENGTH}
              />
              <div className="mt-1 flex items-center justify-between">
                <span
                  id="job-description-hint"
                  className={`text-xs ${getCharCountColor(jobDescription.length, MIN_CONTENT_LENGTH)}`}
                >
                  {getValidationMessage(
                    jobDescription.length,
                    MIN_CONTENT_LENGTH,
                  )}
                </span>
                <span className="text-xs text-gray-400">
                  {jobDescription.length}/{MIN_CONTENT_LENGTH} characters
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setInput({ companyName: e.target.value })}
                  placeholder="e.g., Google"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setInput({ jobTitle: e.target.value })}
                  placeholder="e.g., Software Engineer"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Resume Input */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-900">Your Resume/CV</h2>
            </div>

            <FileUploader
              onFileSelect={handleResumeFileSelect}
              label="Upload Resume/CV"
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or paste resume content
                <span className="ml-2 text-xs text-gray-500">(required)</span>
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setInput({ resumeText: e.target.value })}
                placeholder="Paste your resume content here..."
                aria-describedby="resume-hint"
                className={`w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  resumeText.length > 0 && !resumeValid
                    ? "border-amber-300 bg-amber-50"
                    : resumeValid
                      ? "border-green-300"
                      : "border-gray-300"
                }`}
                required
                minLength={MIN_CONTENT_LENGTH}
              />
              <div className="mt-1 flex items-center justify-between">
                <span
                  id="resume-hint"
                  className={`text-xs ${getCharCountColor(resumeText.length, MIN_CONTENT_LENGTH)}`}
                >
                  {getValidationMessage(resumeText.length, MIN_CONTENT_LENGTH)}
                </span>
                <span className="text-xs text-gray-400">
                  {resumeText.length}/{MIN_CONTENT_LENGTH} characters
                </span>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Match
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <>
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              isGenerating={isGenerating}
            />

            <div className="mt-6">
              {/*
               * Tab Content Rendering Pattern:
               * Each tab follows a consistent three-state pattern:
               * 1. Empty state with generate button (initial state)
               * 2. Loading state with spinner (during generation)
               * 3. Content display (after successful generation)
               */}

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <OverallScoreCard score={analysis.overallScore} />

                    <div className="space-y-4">
                      <ScoreCard
                        score={analysis.skills?.score || 0}
                        label="Skills Match"
                        confidence={analysis.skills?.confidence}
                        details={analysis.skills}
                      />
                      <ScoreCard
                        score={analysis.experience?.score || 0}
                        label="Experience Relevance"
                        confidence={analysis.experience?.confidence}
                      />
                      <ScoreCard
                        score={analysis.education?.score || 0}
                        label="Education Fit"
                        confidence={analysis.education?.confidence}
                      />
                      <ScoreCard
                        score={analysis.keywords?.score || 0}
                        label="Keyword Coverage"
                        confidence={analysis.keywords?.confidence}
                      />
                    </div>
                  </div>

                  {/* Requirements Summary */}
                  {(analysis.matchedRequirements?.length > 0 ||
                    analysis.unmatchedRequirements?.length > 0 ||
                    analysis.partialMatches?.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="font-semibold text-lg mb-4">
                        Requirements Breakdown
                      </h3>
                      <RequirementsList
                        matched={analysis.matchedRequirements}
                        unmatched={analysis.unmatchedRequirements}
                        partial={analysis.partialMatches}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Cover Letter Tab */}
              {activeTab === "cover-letter" && (
                <div>
                  {!coverLetter && !isGenerating.coverLetter && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">
                        No Cover Letter Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Generate a personalized cover letter based on your
                        analysis
                      </p>
                      <button
                        onClick={handleGenerateCoverLetter}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Cover Letter
                      </button>
                    </div>
                  )}

                  {isGenerating.coverLetter && (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                      <p className="mt-2 text-gray-600">
                        Generating cover letter...
                      </p>
                    </div>
                  )}

                  {coverLetter && (
                    <CoverLetterEditor
                      initialContent={coverLetter}
                      onSave={(content) => console.log("Saved:", content)}
                    />
                  )}
                </div>
              )}

              {/* Gap Analysis Tab */}
              {activeTab === "gaps" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    Skill Gap Analysis
                  </h3>
                  <GapList gaps={analysis.gapAnalysis} />
                </div>
              )}

              {/* Optimization Tab */}
              {activeTab === "optimization" && (
                <div>
                  {!optimization && !isGenerating.optimization && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">
                        No Optimization Tips Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Get personalized recommendations to improve your
                        application
                      </p>
                      <button
                        onClick={handleGenerateOptimization}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Tips
                      </button>
                    </div>
                  )}

                  {isGenerating.optimization && (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                      <p className="mt-2 text-gray-600">
                        Generating optimization tips...
                      </p>
                    </div>
                  )}

                  {optimization && <OptimizationTips {...optimization} />}
                </div>
              )}

              {/* Interview Prep Tab */}
              {activeTab === "interview" && (
                <div>
                  {!interviewPrep && !isGenerating.interview && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">
                        No Interview Prep Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Get interview questions and preparation tips
                      </p>
                      <button
                        onClick={handleGenerateInterview}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Interview Prep
                      </button>
                    </div>
                  )}

                  {isGenerating.interview && (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                      <p className="mt-2 text-gray-600">
                        Generating interview prep...
                      </p>
                    </div>
                  )}

                  {interviewPrep && <InterviewPrep {...interviewPrep} />}
                </div>
              )}

              {/* Career Growth Tab */}
              {activeTab === "career" && (
                <div>
                  {!careerDevelopment && !isGenerating.career && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">
                        No Career Suggestions Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Get personalized career development recommendations
                      </p>
                      <button
                        onClick={handleGenerateCareer}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Career Suggestions
                      </button>
                    </div>
                  )}

                  {isGenerating.career && (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                      <p className="mt-2 text-gray-600">
                        Generating career suggestions...
                      </p>
                    </div>
                  )}

                  {careerDevelopment && (
                    <CareerDevelopment {...careerDevelopment} />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
