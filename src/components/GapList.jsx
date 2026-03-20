"use client";

import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";

export default function GapList({ gaps = [] }) {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "border-red-300 bg-red-50 text-red-900";
      case "preferred":
        return "border-yellow-300 bg-yellow-50 text-yellow-900";
      case "enhancement":
        return "border-blue-300 bg-blue-50 text-blue-900";
      default:
        return "border-gray-300 bg-gray-50 text-gray-900";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "preferred":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "enhancement":
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimelineIcon = () => <Clock className="w-4 h-4" />;

  if (!gaps || gaps.length === 0) {
    return (
      <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-3" />
        <h3 className="font-semibold text-green-900">No Major Gaps Found!</h3>
        <p className="text-sm text-green-700 mt-1">
          Your qualifications align well with this position.
        </p>
      </div>
    );
  }

  // Group gaps by severity
  const criticalGaps = gaps.filter(
    (g) => g.severity?.toLowerCase() === "critical",
  );
  const preferredGaps = gaps.filter(
    (g) => g.severity?.toLowerCase() === "preferred",
  );
  const enhancementGaps = gaps.filter(
    (g) => g.severity?.toLowerCase() === "enhancement",
  );

  return (
    <div className="space-y-4">
      {criticalGaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-red-900 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Critical Gaps ({criticalGaps.length})
          </h4>
          {criticalGaps.map((gap, index) => (
            <GapItem key={index} gap={gap} />
          ))}
        </div>
      )}

      {preferredGaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-yellow-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Preferred Qualifications ({preferredGaps.length})
          </h4>
          {preferredGaps.map((gap, index) => (
            <GapItem key={index} gap={gap} />
          ))}
        </div>
      )}

      {enhancementGaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-blue-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Enhancement Opportunities ({enhancementGaps.length})
          </h4>
          {enhancementGaps.map((gap, index) => (
            <GapItem key={index} gap={gap} />
          ))}
        </div>
      )}
    </div>
  );
}

function GapItem({ gap }) {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "border-red-300 bg-red-50 text-red-900";
      case "preferred":
        return "border-yellow-300 bg-yellow-50 text-yellow-900";
      case "enhancement":
        return "border-blue-300 bg-blue-50 text-blue-900";
      default:
        return "border-gray-300 bg-gray-50 text-gray-900";
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getSeverityColor(gap.severity)}`}>
      <div className="flex items-start justify-between">
        <div>
          <h5 className="font-medium">{gap.gap}</h5>
          {gap.recommendation && (
            <p className="text-sm mt-2 opacity-80">{gap.recommendation}</p>
          )}
        </div>
        {gap.timeline && (
          <div className="flex items-center gap-1 text-sm opacity-70">
            <Clock className="w-4 h-4" />
            <span>{gap.timeline}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function RequirementsList({
  matched = [],
  unmatched = [],
  partial = [],
}) {
  return (
    <div className="space-y-4">
      {matched.length > 0 && (
        <div>
          <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Matched Requirements ({matched.length})
          </h4>
          <ul className="space-y-1">
            {matched.map((item, index) => (
              <li
                key={index}
                className="text-sm text-green-800 flex items-center gap-2"
              >
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {unmatched.length > 0 && (
        <div>
          <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Missing Requirements ({unmatched.length})
          </h4>
          <ul className="space-y-1">
            {unmatched.map((item, index) => (
              <li
                key={index}
                className="text-sm text-red-800 flex items-center gap-2"
              >
                <XCircle className="w-3 h-3 text-red-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {partial.length > 0 && (
        <div>
          <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Partial Matches ({partial.length})
          </h4>
          <ul className="space-y-1">
            {partial.map((item, index) => (
              <li
                key={index}
                className="text-sm text-yellow-800 flex items-center gap-2"
              >
                <AlertTriangle className="w-3 h-3 text-yellow-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
