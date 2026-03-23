"use client";

import { CheckCircle2, XCircle, AlertCircle, MinusCircle } from "lucide-react";

export default function ScoreCard({ score, label, confidence, details }) {
  const getColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getBgColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLabel = (score) => {
    if (score >= 80) return "Strong Match";
    if (score >= 50) return "Partial Match";
    return "Needs Work";
  };

  return (
    <div className={`p-3 sm:p-4 rounded-lg border ${getColor(score)}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium opacity-75">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{score}%</p>
        </div>
        <div className="text-right flex-shrink-0">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getColor(score)}`}
          >
            {getLabel(score)}
          </span>
          {confidence !== undefined && (
            <p className="text-xs mt-1 opacity-75">{confidence}% confidence</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getBgColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Details */}
      {details && (
        <div className="mt-3 space-y-1">
          {details.matched && details.matched.length > 0 && (
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-medium">Matched:</span>
                <span className="opacity-75 ml-1">
                  {details.matched.slice(0, 3).join(", ")}
                  {details.matched.length > 3 &&
                    ` +${details.matched.length - 3} more`}
                </span>
              </div>
            </div>
          )}
          {details.missing && details.missing.length > 0 && (
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-medium">Missing:</span>
                <span className="opacity-75 ml-1">
                  {details.missing.slice(0, 3).join(", ")}
                  {details.missing.length > 3 &&
                    ` +${details.missing.length - 3} more`}
                </span>
              </div>
            </div>
          )}
          {details.partial && details.partial.length > 0 && (
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <MinusCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-medium">Partial:</span>
                <span className="opacity-75 ml-1">
                  {details.partial.slice(0, 3).join(", ")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function OverallScoreCard({ score }) {
  const getColor = (score) => {
    if (score >= 80)
      return {
        main: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        progress: "bg-green-500",
      };
    if (score >= 50)
      return {
        main: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        progress: "bg-yellow-500",
      };
    return {
      main: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      progress: "bg-red-500",
    };
  };

  const colors = getColor(score);

  // Calculate SVG circle properties
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className={`p-4 sm:p-6 rounded-xl border ${colors.bg} ${colors.border}`}>
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className={`${colors.progress} transition-all duration-1000`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl sm:text-5xl font-bold ${colors.main}`}>
              {score}%
            </span>
            <span className="text-xs sm:text-sm opacity-75 mt-1">Match Score</span>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 text-center px-2">
          <h3 className="text-base sm:text-lg font-semibold">Overall Compatibility</h3>
          <p className="text-xs sm:text-sm opacity-75 mt-1">
            {score >= 80
              ? "Great fit for this position!"
              : score >= 50
                ? "Consider addressing gaps below"
                : "Significant gaps to address"}
          </p>
        </div>
      </div>
    </div>
  );
}
