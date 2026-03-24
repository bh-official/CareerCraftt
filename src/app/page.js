"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/Logo";
import FeaturesPage from "./features/page";

export default function HomePage() {
  const [showContent, setShowContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      setTimeout(() => setIsLoading(false), 700);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="intro"
          className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="text-center"
          >
            <Logo size="xl" />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.45 }}
              className="mt-6 text-blue-200 text-lg md:text-xl font-medium"
            >
              Craft your path to the perfect job
            </motion.p>
            <motion.div
              className="mt-10 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-blue-400 rounded-full"
                    animate={{ y: [0, -10, 0] }}
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
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {showContent && <FeaturesPage />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
