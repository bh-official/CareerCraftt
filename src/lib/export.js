import { jsPDF } from "jspdf";

/**
 * Export analysis results to PDF
 */
export function exportAnalysisToPDF(
  analysis,
  coverLetter,
  jobTitle,
  companyName,
) {
  const doc = new jsPDF();
  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Helper function to add new page if needed
  const checkNewPage = (neededSpace) => {
    if (y + neededSpace > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("CareerCraft Analysis Report", margin, y);
  y += 15;

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  if (jobTitle || companyName) {
    doc.text([jobTitle, companyName].filter(Boolean).join(" - "), margin, y);
    y += 10;
  }
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
  y += 15;

  doc.setTextColor(0);

  // Overall Score
  if (analysis?.overallScore) {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Match Score", margin, y);
    y += 10;

    doc.setFontSize(36);
    const scoreColor =
      analysis.overallScore >= 80
        ? [34, 197, 94]
        : analysis.overallScore >= 50
          ? [234, 179, 8]
          : [239, 68, 68];
    doc.setTextColor(...scoreColor);
    doc.text(`${analysis.overallScore}%`, margin, y + 10);
    doc.setTextColor(0);
    y += 30;
  }

  // Score Breakdown
  if (analysis?.skills || analysis?.experience || analysis?.education) {
    checkNewPage(40);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Score Breakdown", margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const scores = [
      { label: "Skills Match", score: analysis.skills?.score, weight: "30%" },
      { label: "Experience", score: analysis.experience?.score, weight: "35%" },
      { label: "Education", score: analysis.education?.score, weight: "15%" },
      { label: "Keywords", score: analysis.keywords?.score, weight: "10%" },
      { label: "Additional", score: analysis.additional?.score, weight: "10%" },
    ];

    scores.forEach(({ label, score, weight }) => {
      if (score !== undefined) {
        doc.text(`${label} (${weight}): ${score}%`, margin + 5, y);
        y += 7;
      }
    });
    y += 10;
  }

  // Gap Analysis
  if (analysis?.gapAnalysis?.length > 0) {
    checkNewPage(30 + analysis.gapAnalysis.length * 15);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Gap Analysis", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    analysis.gapAnalysis.forEach((gap, index) => {
      checkNewPage(15);
      const severityColor =
        gap.severity === "critical"
          ? [220, 38, 38]
          : gap.severity === "preferred"
            ? [234, 179, 8]
            : [59, 130, 246];
      doc.setTextColor(...severityColor);
      doc.text(`• ${gap.gap} (${gap.severity})`, margin + 5, y);
      y += 5;

      doc.setTextColor(80);
      if (gap.recommendation) {
        const recLines = doc.splitTextToSize(
          `  Recommendation: ${gap.recommendation}`,
          contentWidth - 10,
        );
        doc.text(recLines, margin + 5, y);
        y += recLines.length * 5;
      }
      y += 3;
    });
    y += 10;
  }

  // Cover Letter
  if (coverLetter) {
    doc.addPage();
    y = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Generated Cover Letter", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const letterLines = doc.splitTextToSize(coverLetter, contentWidth);
    letterLines.forEach((line) => {
      checkNewPage(7);
      doc.text(line, margin, y);
      y += 5;
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | CareerCraft AI`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  return doc;
}

/**
 * Download PDF
 */
export function downloadPDF(doc, filename = "careercraft-report.pdf") {
  doc.save(filename);
}

/**
 * Export session data as JSON
 */
export function exportSessionAsJSON(data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "careercraft-session.json";
  a.click();
  URL.revokeObjectURL(url);
}

export default {
  exportAnalysisToPDF,
  downloadPDF,
  exportSessionAsJSON,
};
