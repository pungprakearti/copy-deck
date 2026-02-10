import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import Navbar from "../../src/components/Navbar";

describe("Navbar Component", () => {
  it("renders the branding title correctly", () => {
    render(<Navbar />);

    const titleElement = screen.getByText(/COPY DECK/i);
    expect(titleElement).toBeInTheDocument();
  });

  it("contains the correct styling classes for branding", () => {
    render(<Navbar />);

    const navbarContainer = screen.getByText(/COPY DECK/i);

    // Verifying the specific Orbitron font and tracking for 100% style coverage
    expect(navbarContainer).toHaveClass("font-orbitron-black");
    expect(navbarContainer).toHaveClass("tracking-tighter");
    expect(navbarContainer).toHaveClass("bg-slate-400");
  });
});
