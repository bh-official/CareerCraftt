"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: "🏠" },
  { name: "Applications", href: "/dashboard/sessions", icon: "📋" },
  { name: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { name: "Team", href: "/dashboard/team", icon: "👥" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const { user } = useUser();
  const [theme, setTheme] = useState("light");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save - in real app, save to user_preferences table
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>

            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Profile</h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                  {user?.firstName?.[0] || "U"}
                </div>
                <div>
                  <div className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Profile information is managed through Clerk. Visit your Clerk
                account settings to update your name and email.
              </p>
            </div>

            {/* Appearance Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={theme === "light"}
                        onChange={(e) => setTheme(e.target.value)}
                        className="mr-2"
                      />
                      Light
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={theme === "dark"}
                        onChange={(e) => setTheme(e.target.value)}
                        className="mr-2"
                      />
                      Dark
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={theme === "system"}
                        onChange={(e) => setTheme(e.target.value)}
                        className="mr-2"
                      />
                      System
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  Email notifications for new analysis results
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  Weekly summary of your job applications
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Tips and best practices
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {saved && (
                <span className="text-green-600">
                  Settings saved successfully!
                </span>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
