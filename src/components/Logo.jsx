"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

/**
 * Animated Logo Component
 *
 * CareerCraft brand logo with Framer Motion entrance animation.
 * Features a briefcase icon with a sparkle effect.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} props.showText - Whether to show "CareerCraft" text
 * @returns {JSX.Element} Animated logo
 */
export default function Logo({ size = "md", showText = true }) {
  // Size configurations
  const sizes = {
    sm: { icon: 24, text: "text-lg", container: "gap-2" },
    md: { icon: 32, text: "text-xl", container: "gap-2" },
    lg: { icon: 40, text: "text-2xl", container: "gap-3" },
    xl: { icon: 56, text: "text-4xl", container: "gap-4" },
  };

  const { icon, text, container } = sizes[size];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const iconVariants = {
    hidden: {
      scale: 0,
      rotate: -180,
      opacity: 0,
    },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const sparkleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.2, 1, 0],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut",
      },
    },
  };

  const textVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className={`flex items-center ${container}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo Icon Container */}
      <div className="relative">
        <motion.div variants={iconVariants}>
          <Briefcase size={icon} className="text-blue-600" strokeWidth={1.5} />
        </motion.div>

        {/* Sparkle Animation */}
        <motion.div
          className="absolute -top-1 -right-1"
          variants={sparkleVariants}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <svg
            width={size === "xl" ? 16 : size === "lg" ? 12 : 8}
            height={size === "xl" ? 16 : size === "lg" ? 12 : 8}
            viewBox="0 0 24 24"
            fill="none"
            className="text-amber-400"
          >
            <path
              d="M12 2L14.09 8.26L20 9.27L15.55 14.14L16.91 20L12 17.27L7.09 20L8.45 14.14L4 9.27L9.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
      </div>

      {/* Logo Text */}
      {showText && (
        <motion.span
          className={`font-bold text-gray-900 ${text}`}
          variants={textVariants}
        >
          CareerCraft
        </motion.span>
      )}
    </motion.div>
  );
}
