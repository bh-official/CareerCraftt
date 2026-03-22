"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AppHeader from "@/components/AppHeader";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LandingPage Component
 *
 * Shows animated logo splash screen before loading the main AnalysisPage.
 * Creates a polished first impression with brand animation.
 */
const AnalysisPage = dynamic(() => import("@/components/AnalysisPage"), {
  ssr: false,
  loading: () => null,
});

export default function LandingPage() {
  const [showContent, setShowContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show landing animation for 2.5 seconds
    const timer = setTimeout(() => {
      setShowContent(true);
      // Hide loading after animation completes
      setTimeout(() => setIsLoading(false), 800);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        // Landing/Splash Screen
        <motion.div
          key="landing"
          className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)",
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Large Animated Logo */}
            <Logo size="xl" />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-6 text-blue-200 text-lg md:text-xl font-medium"
            >
              Craft your path to the perfect job
            </motion.p>

            {/* Loading Indicator */}
            <motion.div
              className="mt-12 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-blue-400 rounded-full"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Background Pattern */}
          <motion.div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: 0.5 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)`,
              }}
            />
          </motion.div>
        </motion.div>
      ) : (
        // Main Content with Nav
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AppHeader />
          <div className="pt-16">
            <AnalysisPage />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
