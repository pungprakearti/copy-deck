import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "../../src/components/Navbar";

describe("Navbar Component", () => {
  it("renders the main title and both navigation links", () => {
    render(<Navbar />);

    // Check if the main title exists
    const titleElement = screen.getByText(/COPY DECK/i);
    expect(titleElement).toBeInTheDocument();

    // Check if the Import link exists and has the correct href
    const importLink = screen.getByRole("link", { name: /import/i });
    expect(importLink).toBeInTheDocument();
    expect(importLink).toHaveAttribute("href", "#import");

    // Check if the Export link exists and has the correct href
    const exportLink = screen.getByRole("link", { name: /export/i });
    expect(exportLink).toBeInTheDocument();
    expect(exportLink).toHaveAttribute("href", "#export");
  });

  it("contains the correct layout classes for the nav element", () => {
    render(<Navbar />);

    // This ensures the actual nav tag is rendered and verified
    const navElement = screen.getByRole("navigation");
    expect(navElement).toHaveClass("grid", "grid-cols-3");
  });
});
