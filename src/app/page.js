"use client";

import dynamic from "next/dynamic";

const AnalysisPage = dynamic(() => import("@/components/AnalysisPage"), {
  ssr: false,
});

export default function Home() {
  return <AnalysisPage />;
}
