import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import Card from "../../src/components/Card";

// Mock ReactGA to avoid errors during testing
vi.mock("react-ga4", () => ({
  default: {
    event: vi.fn(),
  },
}));

describe("Card Component", () => {
  const defaultProps = {
    id: "1",
    label: "Test Label",
    content: "Test Content",
    onSave: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // The safe way to mock read-only navigator properties in JSDOM
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders label and content correctly", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("copies content and handles the timeout for setCopied(false)", async () => {
    render(<Card {...defaultProps} />);
    const contentArea = screen.getByText("Test Content");

    // Trigger the copy logic
    await act(async () => {
      fireEvent.click(contentArea);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Test Content");

    // Verify "Copied!" message appears
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    // Fast-forward 2 seconds to cover setCopied(false)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
  });

  it("returns early if content is empty (coverage for !content)", () => {
    const { container } = render(<Card {...defaultProps} content="" />);

    // Find the clickable area by class since text is empty
    const contentArea = container.querySelector(".cursor-pointer");
    if (contentArea) fireEvent.click(contentArea);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("returns early if isEditing is true (coverage for isEditing)", () => {
    render(<Card {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByTitle("Edit entry"));

    // Try to click the content (which is now a textarea)
    const textarea = screen.getByDisplayValue("Test Content");
    fireEvent.click(textarea);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("handles clipboard failure for code coverage on line 61", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (navigator.clipboard.writeText as any).mockImplementationOnce(() =>
      Promise.reject(new Error("Clipboard error")),
    );

    render(<Card {...defaultProps} />);
    const contentArea = screen.getByText("Test Content");

    await act(async () => {
      fireEvent.click(contentArea);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to copy!",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("enters editing mode and saves changes", () => {
    render(<Card {...defaultProps} />);
    fireEvent.click(screen.getByTitle("Edit entry"));

    const labelInput = screen.getByPlaceholderText("Label...");
    // Finding by display value because the field is pre-populated
    const contentInput = screen.getByDisplayValue("Test Content");

    fireEvent.change(labelInput, { target: { value: "New Label" } });
    fireEvent.change(contentInput, { target: { value: "New Content" } });

    fireEvent.click(screen.getByTitle("Save"));

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      "New Label",
      "New Content",
    );
  });

  it("cancels editing when clicking the X icon", () => {
    render(<Card {...defaultProps} />);
    fireEvent.click(screen.getByTitle("Edit entry"));
    fireEvent.click(screen.getByTitle("Cancel"));

    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("saves changes on Ctrl+Enter in textarea", () => {
    render(<Card {...defaultProps} />);
    fireEvent.click(screen.getByTitle("Edit entry"));

    const textarea = screen.getByDisplayValue("Test Content");
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });

    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it("cancels editing on Escape key", () => {
    render(<Card {...defaultProps} />);
    fireEvent.click(screen.getByTitle("Edit entry"));

    const textarea = screen.getByDisplayValue("Test Content");
    fireEvent.keyDown(textarea, { key: "Escape" });

    // Verify we are back in view mode
    expect(screen.queryByDisplayValue("Test Content")).not.toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", () => {
    render(<Card {...defaultProps} />);
    fireEvent.click(screen.getByTitle("Delete entry"));
    expect(defaultProps.onDelete).toHaveBeenCalled();
  });
});
