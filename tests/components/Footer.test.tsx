import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import Footer from "../../src/components/Footer";
import pkg from "../../package.json";

describe("Footer Component", () => {
  it("renders the creator name and year correctly", () => {
    render(<Footer />);

    expect(screen.getByText(/Andrew Pungprakearti/i)).toBeInTheDocument();
    expect(
      screen.getByText(/while job searching in 2026/i),
    ).toBeInTheDocument();
  });

  it("contains the correct social and external links", () => {
    render(<Footer />);

    const linkedinLink = screen.getByRole("link", { name: /linkedin/i });
    const biscuitsLink = screen.getByRole("link", {
      name: /biscuits in the basket/i,
    });
    const githubProfileLink = screen.getByRole("link", { name: /github/i });

    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/andrewpungprakearti",
    );
    expect(biscuitsLink).toHaveAttribute(
      "href",
      "https://www.biscuitsinthebasket.com",
    );
    expect(githubProfileLink).toHaveAttribute(
      "href",
      "https://github.com/pungprakearti",
    );

    // Verify all external links have security attributes
    const allLinks = screen.getAllByRole("link");
    allLinks.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });
  });

  it("renders the correct version from package.json with the repository link", () => {
    render(<Footer />);

    const versionLink = screen.getByText(`Copy Deck v${pkg.version}`);

    expect(versionLink).toBeInTheDocument();
    expect(versionLink.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/pungprakearti/copy-deck",
    );
  });
});
