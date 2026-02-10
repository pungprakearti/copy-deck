import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import AddDeck from "../../src/components/AddDeck";

describe("AddDeck Component", () => {
  it('renders with the text "Add New Deck"', () => {
    render(<AddDeck onAdd={() => {}} />);

    const element = screen.getByText(/add new deck/i);

    expect(element).toBeInTheDocument();
    // Since the text is inside a span, we verify the span is visible
    expect(element.tagName).toBe("SPAN");
  });

  it("calls onAdd when the container div is clicked", async () => {
    const onAddMock = vi.fn();
    const user = userEvent.setup();

    render(<AddDeck onAdd={onAddMock} />);

    // We find the text, but the onClick is on the parent div
    const textElement = screen.getByText(/add new deck/i);
    const containerDiv = textElement.closest("div");

    if (containerDiv) {
      await user.click(containerDiv);
    } else {
      // Fallback if structure changes, though click on text bubbles up
      await user.click(textElement);
    }

    expect(onAddMock).toHaveBeenCalledTimes(1);
  });

  it("applies the correct hover and cursor styles", () => {
    render(<AddDeck onAdd={() => {}} />);

    const textElement = screen.getByText(/add new deck/i);
    const containerDiv = textElement.closest("div");

    // Verifying the specific Tailwind classes for 100% style coverage
    expect(containerDiv).toHaveClass("cursor-pointer");
    expect(containerDiv).toHaveClass("bg-slate-600");
    expect(containerDiv).toHaveClass("hover:bg-slate-800");
  });
});
