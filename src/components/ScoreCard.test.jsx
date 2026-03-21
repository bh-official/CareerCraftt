import { render, screen } from "@testing-library/react";
import ScoreCard from "@/components/ScoreCard";

describe("ScoreCard", () => {
  const mockProps = {
    title: "Skills Match",
    score: 85,
    confidence: 90,
    description: "Your skills match well with the job requirements",
  };

  it("renders the title correctly", () => {
    render(<ScoreCard {...mockProps} />);
    expect(screen.getByText("Skills Match")).toBeInTheDocument();
  });

  it("renders the score correctly", () => {
    render(<ScoreCard {...mockProps} />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<ScoreCard {...mockProps} />);
    expect(
      screen.getByText("Your skills match well with the job requirements"),
    ).toBeInTheDocument();
  });

  it("displays confidence when provided", () => {
    render(<ScoreCard {...mockProps} />);
    expect(screen.getByText("Confidence: 90%")).toBeInTheDocument();
  });

  it("handles low scores correctly", () => {
    render(<ScoreCard {...mockProps} score={25} />);
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("handles missing confidence", () => {
    const propsWithoutConfidence = { ...mockProps, confidence: undefined };
    render(<ScoreCard {...propsWithoutConfidence} />);
    expect(screen.queryByText(/Confidence:/)).not.toBeInTheDocument();
  });
});
