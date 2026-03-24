"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
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
    <TabsPrimitive.Root value={activeTab} onValueChange={onChange}>
      <div className="border-b border-gray-200 bg-white sticky top-16 z-40 overflow-x-auto">
        <TabsPrimitive.List
          className="flex space-x-1 overflow-x-auto px-2 sm:px-4 min-w-min sm:min-w-0 scrollbar-hide"
          aria-label="Analysis result sections"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLoading = isGenerating[tab.id.replace("-", "")];
            const tabId = `analysis-tab-${tab.id}`;
            const panelId = `analysis-panel-${tab.id}`;

            return (
              <TabsPrimitive.Trigger
                key={tab.id}
                id={tabId}
                value={tab.id}
                aria-controls={panelId}
                className={`
                  flex items-center gap-1 sm:gap-2 py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0
                  ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="inline sm:hidden text-xs">
                  {tab.label.split(" ")[0]}
                </span>
                {isLoading && (
                  <>
                    <Loader2
                      className="w-3 h-3 animate-spin text-blue-500"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Loading {tab.label} content</span>
                  </>
                )}
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>
      </div>
    </TabsPrimitive.Root>
  );
}

export { tabs };
