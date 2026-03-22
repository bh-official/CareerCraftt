"use client";

import { useState, useEffect } from "react";
import { useAuth, SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

/**
 * SignupPage Component
 *
 * Displays Clerk SignUp component for user registration.
 * Redirects to dashboard if already signed in.
 */
export default function SignupPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/analysis");
    }
  }, [isLoaded, userId, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
      </div>
    );
  }

  // If already signed up, don't render sign up form
  if (userId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-blue-200 mt-2">
            Join CareerCraft and start optimizing your job applications
          </p>
        </div>

        {/* Clerk SignUp Component */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                formFieldInput: "border-gray-300 focus:ring-blue-500",
              },
            }}
            routing="path"
            path="/signup"
            signInUrl="/login"
            redirectUrl="/analysis"
          />
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-blue-200 hover:text-white transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
