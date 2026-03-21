"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: "🏠" },
  { name: "Applications", href: "/dashboard/sessions", icon: "📋" },
  { name: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { name: "Team", href: "/dashboard/team", icon: "👥" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function OverviewPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            CareerCraft
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Welcome to CareerCraft!
              </h2>
              <p className="opacity-90">
                Your AI-powered job application assistant. Start analyzing job
                descriptions, generate cover letters, and prepare for
                interviews.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">
                  Total Applications
                </div>
                <div className="text-3xl font-bold text-gray-900">0</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">
                  Avg. Match Score
                </div>
                <div className="text-3xl font-bold text-gray-900">--</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">
                  Interviews Scheduled
                </div>
                <div className="text-3xl font-bold text-gray-900">0</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/analysis"
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl mb-2">📊</span>
                  <span className="font-medium">Analyze Job</span>
                </Link>
                <Link
                  href="/cover-letter"
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl mb-2">✉️</span>
                  <span className="font-medium">Cover Letter</span>
                </Link>
                <Link
                  href="/interview-prep"
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl mb-2">🎯</span>
                  <span className="font-medium">Interview Prep</span>
                </Link>
                <Link
                  href="/optimization"
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl mb-2">📝</span>
                  <span className="font-medium">Optimize Resume</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <p className="text-gray-500 text-center py-8">
                No recent activity. Start your first job analysis to see your
                history here.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
