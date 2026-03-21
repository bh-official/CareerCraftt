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

export default function TeamPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">
              Team Collaboration
            </h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-xl font-semibold mb-2">
                Team Features Coming Soon
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Share your job application sessions with teammates, collaborate
                on cover letters, and track team-wide application metrics.
              </p>
            </div>

            {/* Placeholder for future team features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-2">Invite Team Members</h3>
                <p className="text-sm text-gray-500">
                  Share your sessions with colleagues
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-2">Shared Library</h3>
                <p className="text-sm text-gray-500">
                  Access team-wide resume templates
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
