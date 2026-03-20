"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Edit3,
} from "lucide-react";

export default function OptimizationTips({
  resumeImprovements = [],
  atsRecommendations = [],
  keywordSuggestions = {},
  contentSuggestions = [],
}) {
  const [openSections, setOpenSections] = useState({
    improvements: true,
    ats: false,
    keywords: false,
    content: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Resume Improvements */}
      <SectionCard
        title="Resume Improvements"
        icon={<FileText className="w-5 h-5" />}
        isOpen={openSections.improvements}
        onToggle={() => toggleSection("improvements")}
        count={resumeImprovements.length}
      >
        {resumeImprovements.length > 0 ? (
          <div className="space-y-3">
            {resumeImprovements.map((item, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                    {item.category}
                  </span>
                </div>
                <h5 className="font-medium text-blue-900 mt-2">{item.issue}</h5>
                <p className="text-sm text-blue-800 mt-1">{item.suggestion}</p>
                {item.example && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-100">
                    <p className="text-xs font-medium text-blue-700 mb-1">
                      Example:
                    </p>
                    <p className="text-sm text-blue-900">{item.example}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No improvements suggested yet.</p>
        )}
      </SectionCard>

      {/* ATS Recommendations */}
      <SectionCard
        title="ATS Optimization"
        icon={<Search className="w-5 h-5" />}
        isOpen={openSections.ats}
        onToggle={() => toggleSection("ats")}
        count={atsRecommendations.length}
      >
        {atsRecommendations.length > 0 ? (
          <div className="space-y-2">
            {atsRecommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  rec.priority === "high"
                    ? "bg-red-50"
                    : rec.priority === "medium"
                      ? "bg-yellow-50"
                      : "bg-gray-50"
                }`}
              >
                {rec.priority === "high" ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm text-gray-900">{rec.tip}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      rec.priority === "high"
                        ? "bg-red-200 text-red-800"
                        : rec.priority === "medium"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {rec.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No ATS recommendations yet.</p>
        )}
      </SectionCard>

      {/* Keyword Suggestions */}
      {keywordSuggestions && Object.keys(keywordSuggestions).length > 0 && (
        <SectionCard
          title="Keyword Analysis"
          icon={<Lightbulb className="w-5 h-5" />}
          isOpen={openSections.keywords}
          onToggle={() => toggleSection("keywords")}
        >
          {keywordSuggestions.missing &&
            keywordSuggestions.missing.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-red-800 mb-2">
                  Missing Keywords
                </h5>
                <div className="flex flex-wrap gap-2">
                  {keywordSuggestions.missing.map((kw, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {keywordSuggestions.suggestedAdditions &&
            keywordSuggestions.suggestedAdditions.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-green-800 mb-2">
                  Suggested Additions
                </h5>
                <div className="flex flex-wrap gap-2">
                  {keywordSuggestions.suggestedAdditions.map((kw, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {keywordSuggestions.density && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-1">
                Keyword Density
              </h5>
              <p className="text-sm text-gray-700">
                {keywordSuggestions.density}
              </p>
            </div>
          )}

          {!keywordSuggestions.missing?.length &&
            !keywordSuggestions.suggestedAdditions?.length &&
            !keywordSuggestions.density && (
              <p className="text-gray-500">No keyword analysis available.</p>
            )}
        </SectionCard>
      )}

      {/* Content Suggestions */}
      <SectionCard
        title="Content Improvements"
        icon={<Edit3 className="w-5 h-5" />}
        isOpen={openSections.content}
        onToggle={() => toggleSection("content")}
        count={contentSuggestions.length}
      >
        {contentSuggestions.length > 0 ? (
          <div className="space-y-3">
            {contentSuggestions.map((item, index) => (
              <div key={index} className="p-4 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-900 mb-2">
                  {item.section}
                </h5>
                {item.current && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-purple-700">
                      Current:
                    </p>
                    <p className="text-sm text-purple-800 line-through opacity-70">
                      {item.current}
                    </p>
                  </div>
                )}
                {item.improved && (
                  <div>
                    <p className="text-xs font-medium text-purple-700">
                      Improved:
                    </p>
                    <p className="text-sm text-purple-900 font-medium">
                      {item.improved}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No content suggestions yet.</p>
        )}
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, icon, isOpen, onToggle, count, children }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-sm">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </button>
      {isOpen && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  );
}
