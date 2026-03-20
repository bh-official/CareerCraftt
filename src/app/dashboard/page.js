import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            CareerCraft Dashboard
          </h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/analysis"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Job Analysis
            </h2>
            <p className="text-gray-600">
              Analyze job descriptions against your resume
            </p>
          </Link>

          <Link
            href="/cover-letter"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Cover Letter
            </h2>
            <p className="text-gray-600">Generate professional cover letters</p>
          </Link>

          <Link
            href="/interview-prep"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Interview Prep
            </h2>
            <p className="text-gray-600">Prepare for your interviews</p>
          </Link>

          <Link
            href="/optimization"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Resume Optimization
            </h2>
            <p className="text-gray-600">Get tips to improve your resume</p>
          </Link>

          <Link
            href="/career"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Career Development
            </h2>
            <p className="text-gray-600">Explore career growth opportunities</p>
          </Link>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Applications
          </h2>
          <p className="text-gray-500">
            No recent applications. Start a new analysis to see your history
            here.
          </p>
        </div>
      </main>
    </div>
  );
}
