"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function AuthLoadingScreen() {
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

export default function AuthLayout({
  children,
  backHref = "/",
  backLabel = "← Back to Home",
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6">{children}</div>

        <div className="text-center mt-6">
          <Link
            href={backHref}
            className="text-blue-200 hover:text-white transition-colors"
          >
            {backLabel}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
