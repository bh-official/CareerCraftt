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
  const handleKeyDown = (event, currentIndex) => {
    const key = event.key;
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(key)) return;

    event.preventDefault();

    let nextIndex = currentIndex;
    if (key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (key === "Home") nextIndex = 0;
    if (key === "End") nextIndex = tabs.length - 1;

    const nextTabId = tabs[nextIndex].id;
    onChange(nextTabId);

    const nextButton = document.getElementById(`analysis-tab-${nextTabId}`);
    nextButton?.focus();
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav
        className="flex space-x-1 overflow-x-auto px-4"
        aria-label="Analysis result sections"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLoading = isGenerating[tab.id.replace("-", "")];
          const tabId = `analysis-tab-${tab.id}`;
          const panelId = `analysis-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`
                flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
              {isLoading && (
                <>
                  <Loader2
                    className="w-3 h-3 animate-spin text-blue-500"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Loading {tab.label} content</span>
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export { tabs };
