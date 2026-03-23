"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth, SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"
          aria-label="Loading"
          role="status"
        >
          <span className="sr-only">Loading</span>
        </div>
      </div>
    );
  }

  if (userId) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                formFieldInput: "border-gray-300 focus:ring-blue-500",
              },
            }}
            routing="path"
            path="/login"
            signUpUrl="/signup"
            redirectUrl="/dashboard"
          />
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-blue-200 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
