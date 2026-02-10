import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import Deck from "../../src/components/Deck";

// 1. Mock the drag and drop library to just render children
vi.mock("@hello-pangea/dnd", () => ({
  Droppable: ({ children }: any) =>
    children({
      draggableProps: {},
      innerRef: vi.fn(),
      placeholder: <div data-testid="placeholder" />,
    }),
  Draggable: ({ children }: any) =>
    children({
      draggableProps: {},
      dragHandleProps: {},
      innerRef: vi.fn(),
    }),
}));

// 2. Mock Google Analytics since Card is a child of Deck
vi.mock("react-ga4", () => ({
  default: {
    event: vi.fn(),
  },
}));

describe("Deck Component", () => {
  const mockDeckData = [
    {
      id: "row-1",
      columns: [{ id: "col-1", label: "Card Label", content: "Card Content" }],
    },
  ];

  const defaultProps = {
    deckData: mockDeckData,
    onUpdateCard: vi.fn(),
    onDeleteCard: vi.fn(),
    onAdd: vi.fn(),
  };

  it("renders cards and the placeholder", () => {
    render(<Deck {...defaultProps} />);

    expect(screen.getByText("Card Label")).toBeInTheDocument();
    expect(screen.getByText("Card Content")).toBeInTheDocument();
    expect(screen.getByTestId("placeholder")).toBeInTheDocument();
  });

  it("calls onUpdateCard when a child card is saved", () => {
    render(<Deck {...defaultProps} />);

    // Find the edit button inside the Card child
    const editBtn = screen.getByTitle("Edit entry");
    fireEvent.click(editBtn);

    // Update label and content
    const labelInput = screen.getByPlaceholderText("Label...");
    const contentInput = screen.getByDisplayValue("Card Content");

    fireEvent.change(labelInput, { target: { value: "New Label" } });
    fireEvent.change(contentInput, { target: { value: "New Content" } });

    // Save
    const saveBtn = screen.getByTitle("Save");
    fireEvent.click(saveBtn);

    expect(defaultProps.onUpdateCard).toHaveBeenCalledWith(
      "row-1",
      "col-1",
      "New Label",
      "New Content",
    );
  });

  it("calls onDeleteCard when a child card is deleted", () => {
    render(<Deck {...defaultProps} />);

    const deleteBtn = screen.getByTitle("Delete entry");
    fireEvent.click(deleteBtn);

    expect(defaultProps.onDeleteCard).toHaveBeenCalledWith("row-1");
  });

  it("calls onAdd when the ADD NEW CARD button is clicked", () => {
    render(<Deck {...defaultProps} />);

    const addBtn = screen.getByText(/add new card/i);
    fireEvent.click(addBtn);

    expect(defaultProps.onAdd).toHaveBeenCalled();
  });
});
