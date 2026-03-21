"use client";

import { useState, useEffect } from "react";
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

export default function AnalyticsPage() {
  const pathname = usePathname();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions?limit=100");
      const data = await response.json();

      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const avgScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) /
            sessions.length,
        )
      : 0;

  const scoreDistribution = {
    high: sessions.filter((s) => s.overall_score >= 70).length,
    medium: sessions.filter(
      (s) => s.overall_score >= 40 && s.overall_score < 70,
    ).length,
    low: sessions.filter((s) => s.overall_score < 40 && s.overall_score > 0)
      .length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
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
        <div className="flex-1">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading analytics...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">
                  Total Applications
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {sessions.length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">
                  Average Match Score
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {avgScore || "--"}%
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">Success Rate</div>
                <div className="text-3xl font-bold text-gray-900">
                  {sessions.length > 0
                    ? Math.round(
                        (scoreDistribution.high / sessions.length) * 100,
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Score Distribution</h2>
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No data available. Start analyzing jobs to see your analytics.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        High Match (70-100%)
                      </span>
                      <span className="text-sm text-gray-500">
                        {scoreDistribution.high}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(scoreDistribution.high / sessions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        Medium Match (40-69%)
                      </span>
                      <span className="text-sm text-gray-500">
                        {scoreDistribution.medium}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${(scoreDistribution.medium / sessions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        Low Match (0-39%)
                      </span>
                      <span className="text-sm text-gray-500">
                        {scoreDistribution.low}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(scoreDistribution.low / sessions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Insights</h3>
              {sessions.length === 0 ? (
                <p className="text-blue-700">
                  Complete some job analyses to receive personalized insights
                  about your applications.
                </p>
              ) : avgScore >= 70 ? (
                <p className="text-blue-700">
                  Great job! Your applications are consistently well-matched.
                  Keep up the good work!
                </p>
              ) : avgScore >= 40 ? (
                <p className="text-blue-700">
                  Your match scores are moderate. Consider tailoring your resume
                  more specifically to each job description.
                </p>
              ) : (
                <p className="text-blue-700">
                  Your match scores could be improved. Review the job analysis
                  feedback and update your resume accordingly.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
