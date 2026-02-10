import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import AddCard from "../../src/components/AddCard";

describe("AddCard Component", () => {
  it("renders the button with correct text", () => {
    // We pass a dummy function since we are only testing the render here
    render(<AddCard onAdd={() => {}} />);

    const button = screen.getByRole("button", { name: /add new card/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("ADD NEW CARD");
  });

  it("triggers the onAdd callback when clicked", async () => {
    // Create a mock function to track calls
    const onAddMock = vi.fn();
    const user = userEvent.setup();

    render(<AddCard onAdd={onAddMock} />);

    const button = screen.getByRole("button", { name: /add new card/i });

    // Simulate the user clicking the button
    await user.click(button);

    // Verify the function was called exactly once
    expect(onAddMock).toHaveBeenCalledTimes(1);
  });

  it("has the correct styling classes for the dashed border", () => {
    render(<AddCard onAdd={() => {}} />);

    const button = screen.getByRole("button", { name: /add new card/i });

    // Testing specific classes ensures your Tailwind design remains intact
    expect(button).toHaveClass("border-dashed");
    expect(button).toHaveClass("border-slate-500");
  });
});
