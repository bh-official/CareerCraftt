"use client";

import Link from "next/link";
import { useAuth, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { LogIn, UserPlus, LogOut } from "lucide-react";
import Logo from "@/components/Logo";

export default function AppHeader() {
  const { isLoaded, userId } = useAuth();
  const { signOut } = useClerk();
  const pathname = usePathname();

  const isFeaturesPage = pathname === "/features";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 min-w-0 shrink-0">
            <Logo size="sm" showText={false} />
            <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
              CareerCraft
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="ml-auto flex items-center gap-2 sm:gap-3 whitespace-nowrap"
          >
            {!isFeaturesPage && (
              <Link
                href="/features"
                className="px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </Link>
            )}

            {(!isLoaded || !userId) && (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            )}

            {isLoaded && userId && (
              <>
                <Link
                  href="/"
                  className="px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/analysis"
                  className="px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
