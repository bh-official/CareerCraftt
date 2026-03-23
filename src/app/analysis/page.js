import { Suspense } from "react";
import AnalysisClientPage from "./AnalysisClientPage";

export const dynamic = "force-dynamic";

function AnalysisLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="h-7 w-32 bg-gray-200 animate-pulse rounded" />
            <span className="text-gray-500">/</span>
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </main>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<AnalysisLoading />}>
      <AnalysisClientPage />
    </Suspense>
  );
}
