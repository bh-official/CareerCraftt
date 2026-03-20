"use client";

import {
  BarChart3,
  FileText,
  Target,
  CheckSquare,
  MessageCircle,
  GraduationCap,
  Loader2,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "cover-letter", label: "Cover Letter", icon: FileText },
  { id: "gaps", label: "Gap Analysis", icon: Target },
  { id: "optimization", label: "Optimization", icon: CheckSquare },
  { id: "interview", label: "Interview Prep", icon: MessageCircle },
  { id: "career", label: "Career Growth", icon: GraduationCap },
];

export default function Tabs({ activeTab, onChange, isGenerating = {} }) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex space-x-1 overflow-x-auto px-4" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLoading = isGenerating[tab.id.replace("-", "")];

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isLoading && (
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export { tabs };
