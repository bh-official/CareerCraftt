"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import for the full-featured AnalysisPage component
// ssr: false prevents prerender errors with useSearchParams
const AnalysisPage = dynamic(() => import("@/components/AnalysisPage"), {
  ssr: false,
  loading: () => <AnalysisLoading />,
});

function AnalysisLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
          </div>

          {/* Input section skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPageWrapper() {
  return (
    <Suspense fallback={<AnalysisLoading />}>
      <AnalysisPage />
    </Suspense>
  );
}
