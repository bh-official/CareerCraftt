"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { LogIn, UserPlus, LogOut, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

export default function AppHeader({ showAppLinks = true }) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);
  const hideAppLinksOnLanding = pathname === "/features" || pathname === "/";
  const hideSignInOnLanding = pathname === "/features" || pathname === "/";
  const canShowAppLinks = showAppLinks && !hideAppLinksOnLanding;
  const resolvedUsername =
    user?.username ||
    user?.firstName ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User";
  const profileImageUrl = user?.imageUrl || "";
  const avatarFallbackLetter = resolvedUsername.charAt(0).toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop and Mobile Header Bar */}
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 min-w-0 shrink-0 flex-shrink-0"
          >
            <Logo size="sm" showText={false} />
            <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
              CareerCraft
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary"
            className="hidden md:flex ml-auto items-center gap-2 space-x-1"
          >
            {(!isLoaded || !userId) && (
              <>
                {!hideSignInOnLanding && (
                  <Link
                    href="/login"
                    className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}
                <Link
                  href="/signup"
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}

            {isLoaded && userId && (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2 text-sm text-blue-900">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={`${resolvedUsername} profile`}
                      className="h-8 w-8 rounded-full object-cover border border-blue-200"
                    />
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-blue-800 font-semibold border border-blue-300">
                      {avatarFallbackLetter}
                    </span>
                  )}
                  <span className="whitespace-nowrap font-medium">
                    {`Hi, ${resolvedUsername}`}
                  </span>
                </div>

                {canShowAppLinks && (
                  <>
                    <Link
                      href="/analysis?new=1"
                      className="px-3 py-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-medium transition-colors"
                    >
                      Analysis
                    </Link>
                    <Link
                      href="/dashboard"
                      className="px-3 py-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {(!isLoaded || !userId) && (
                <>
                  {!hideSignInOnLanding && (
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="flex items-center gap-2 w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}

              {isLoaded && userId && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 text-blue-900 bg-blue-50 rounded-lg border border-blue-100">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={`${resolvedUsername} profile`}
                        className="h-8 w-8 rounded-full object-cover border border-blue-200"
                      />
                    ) : (
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-blue-800 font-semibold border border-blue-300">
                        {avatarFallbackLetter}
                      </span>
                    )}
                    <span className="text-sm font-medium">
                      {`Hi, ${resolvedUsername}`}
                    </span>
                  </div>

                  {canShowAppLinks && (
                    <>
                      <Link
                        href="/analysis?new=1"
                        onClick={closeMenu}
                        className="block w-full px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                      >
                        Analysis
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={closeMenu}
                        className="block w-full px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                      >
                        Dashboard
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      signOut({ redirectUrl: "/" });
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
