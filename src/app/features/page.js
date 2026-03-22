"use client";

import Link from "next/link";
import {
  Sparkles,
  FileText,
  ScanText,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

const features = [
  {
    icon: ScanText,
    title: "AI Resume Match Analysis",
    description:
      "Compare your resume against job descriptions with clear scoring, requirement matching, and actionable insights.",
  },
  {
    icon: FileText,
    title: "Targeted Cover Letters",
    description:
      "Generate tailored cover letters aligned to role expectations, company context, and your background.",
  },
  {
    icon: Sparkles,
    title: "Resume Optimization Tips",
    description:
      "Get prioritized improvements for keywords, structure, impact statements, and ATS compatibility.",
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description:
      "Prepare with role-specific interview questions, model answers, and talking points based on your resume.",
  },
  {
    icon: Briefcase,
    title: "Career Development Guidance",
    description:
      "Receive practical guidance for skills progression, role targeting, and next-step career planning.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main id="main-content" className="pt-20 pb-12" tabIndex={-1}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              CareerCraft Features
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to prepare stronger applications, faster.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
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

          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Go to Current Landing Experience
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
