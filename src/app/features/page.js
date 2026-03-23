"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import {
  ScanSearch,
  FileSearch,
  SlidersHorizontal,
  Lightbulb,
  Gauge,
  LayoutDashboard,
  CheckCircle2,
  ShieldCheck,
  Clock3,
  ArrowRight,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

const features = [
  {
    icon: ScanSearch,
    title: "Resume Analysis Scoring",
    description:
      "Get a clear match score with section-by-section breakdowns across skills, experience, education, and keywords.",
  },
  {
    icon: FileSearch,
    title: "Job Description Matching",
    description:
      "Compare role requirements against your resume and see exactly what is matched, missing, or partially aligned.",
  },
  {
    icon: SlidersHorizontal,
    title: "ATS + Readability Insights",
    description:
      "Improve keyword coverage, formatting clarity, and content quality with practical ATS-focused guidance.",
  },
  {
    icon: Lightbulb,
    title: "Tailored Recommendations",
    description:
      "Receive targeted next steps for resume improvements, messaging, and interview readiness based on your profile.",
  },
  {
    icon: Gauge,
    title: "Progress Tracking",
    description:
      "Track sessions, compare outcomes over time, and revisit previous analyses from a single workflow.",
  },
  {
    icon: LayoutDashboard,
    title: "Secure Dashboard Access",
    description:
      "Use authenticated routes for analysis history, saved artifacts, and focused workflows per user account.",
  },
];

const howItWorks = [
  {
    title: "Upload or paste job description and resume",
    text: "Use file upload or direct text input to provide role requirements and candidate context.",
  },
  {
    title: "Run AI-powered analysis",
    text: "Generate fit scoring, gap analysis, and actionable recommendations in one guided flow.",
  },
  {
    title: "Improve and iterate",
    text: "Apply recommendations, regenerate artifacts, and track progress through your dashboard.",
  },
];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Authenticated workflows",
    description:
      "User-specific sessions and protected routes keep analysis data scoped and secure.",
  },
  {
    icon: CheckCircle2,
    title: "Actionable outputs",
    description:
      "Outputs are structured for practical editing, decision-making, and iteration.",
  },
  {
    icon: Clock3,
    title: "Faster preparation",
    description:
      "Reduce manual prep time with AI-assisted matching, optimization, and planning.",
  },
];

export default function FeaturesPage() {
  const { isLoaded, userId } = useAuth();

  const primaryCtaHref = isLoaded && userId ? "/analysis" : "/signup";
  const primaryCtaLabel =
    isLoaded && userId ? "Start Analysis" : "Create Free Account";

  const secondaryCtaHref = isLoaded && userId ? "/dashboard" : "/login";
  const secondaryCtaLabel = isLoaded && userId ? "Open Dashboard" : "Sign In";

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main id="main-content" className="pt-20 pb-12" tabIndex={-1}>
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-labelledby="hero-title"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                AI Job Application Assistant
              </p>
              <h1
                id="hero-title"
                className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900"
              >
                Turn job applications into a repeatable winning workflow
              </h1>
              <p className="mt-8 text-lg text-gray-600 max-w-2xl">
               Analyze resume fit, match job descriptions, improve ATS
               readability, and take targeted next steps — all from one guided
               experience.
              </p>

             
            </div>
          </div>
        </section>

        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14"
          aria-labelledby="feature-grid-title"
        >
          <h2
            id="feature-grid-title"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
          >
            Full capability set for modern job search execution
          </h2>
          <p className="mt-2 text-gray-600">
            Each feature is built to move you from application drafting to
            confident submission faster.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm card-hover"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14"
          aria-labelledby="how-it-works-title"
        >
          <h2
            id="how-it-works-title"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
          >
            How it works
          </h2>
          <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <p className="text-sm font-semibold text-blue-700">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14"
          aria-labelledby="trust-title"
        >
          <h2
            id="trust-title"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
          >
            Why candidates trust this workflow
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustItems.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <Icon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14"
          aria-labelledby="final-cta-title"
        >
          <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 sm:p-10 text-white">
            <h2 id="final-cta-title" className="text-2xl sm:text-3xl font-bold">
              Build stronger applications with less guesswork
            </h2>
            <p className="mt-3 text-blue-100 max-w-2xl">
              Start with a single role, identify the gaps, and leave with a
              clearer path to interviews.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-blue-700 font-semibold hover:bg-blue-50 transition-colors"
              >
                {primaryCtaLabel}
              </Link>
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center gap-2 rounded-lg border border-white/50 px-5 py-3 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                {secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
