import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import Sidebar from "../../src/components/Sidebar";

// Control variables for the mock state
let mockIsDragging = false;
let mockStyleValue: any = { display: "flex", width: "100px" };

vi.mock("@hello-pangea/dnd", () => ({
  Droppable: ({ children }: any) =>
    children({
      droppableProps: {},
      innerRef: vi.fn(),
      placeholder: <div data-testid="placeholder" />,
    }),
  Draggable: ({ children }: any) => {
    const dragProvided = {
      draggableProps: {
        style: mockStyleValue,
      },
      dragHandleProps: {},
      innerRef: vi.fn(),
    };
    const snapshot = { isDragging: mockIsDragging };
    return children(dragProvided, snapshot);
  },
}));

describe("Sidebar Component", () => {
  const defaultProps = {
    deckNames: ["Deck 1", "Deck 2"],
    activeDeck: "Deck 1",
    setActiveDeck: vi.fn(),
    onRenameDeck: vi.fn(),
    onDeleteDeck: vi.fn(),
    onAddDeck: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDragging = false;
    mockStyleValue = { display: "flex", width: "100px" };
  });

  it("renders a list of decks and identifies the active one", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText("Deck 1")).toBeInTheDocument();
  });

  it("shows empty state when no decks are provided", () => {
    render(<Sidebar {...defaultProps} deckNames={[]} />);
    expect(screen.getByText(/no decks available/i)).toBeInTheDocument();
  });

  it("calls setActiveDeck when a non-active deck is clicked", () => {
    render(<Sidebar {...defaultProps} />);
    fireEvent.click(screen.getByText("Deck 2"));
    expect(defaultProps.setActiveDeck).toHaveBeenCalledWith("Deck 2");
  });

  it("enters editing mode and saves a new name", () => {
    render(<Sidebar {...defaultProps} />);
    const editBtns = screen.getAllByRole("button");
    fireEvent.click(editBtns[0]);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "New Name" } });

    const saveBtn = screen.getAllByRole("button")[0];
    fireEvent.click(saveBtn);

    expect(defaultProps.onRenameDeck).toHaveBeenCalledWith(
      "Deck 1",
      "New Name",
    );
  });

  it("cancels editing when Escape is pressed", () => {
    render(<Sidebar {...defaultProps} />);
    const editBtns = screen.getAllByRole("button");
    fireEvent.click(editBtns[0]);
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("saves renaming when Enter is pressed", () => {
    render(<Sidebar {...defaultProps} />);
    const editBtns = screen.getAllByRole("button");
    fireEvent.click(editBtns[0]);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Enter Saved" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(defaultProps.onRenameDeck).toHaveBeenCalled();
  });

  it("saves on blur after value change", () => {
    render(<Sidebar {...defaultProps} />);
    const editBtns = screen.getAllByRole("button");
    fireEvent.click(editBtns[0]);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Blur Change" } });
    fireEvent.blur(input);

    expect(defaultProps.onRenameDeck).toHaveBeenCalledWith(
      "Deck 1",
      "Blur Change",
    );
  });

  it("calls onDeleteDeck when trash is clicked", () => {
    render(<Sidebar {...defaultProps} />);
    const allBtns = screen.getAllByRole("button");
    fireEvent.click(allBtns[1]);
    expect(defaultProps.onDeleteDeck).toHaveBeenCalledWith("Deck 1");
  });

  it("calls onAddDeck when Add New Deck is clicked", () => {
    render(<Sidebar {...defaultProps} />);
    const addBtn = screen.getByText(/Add/i);
    fireEvent.click(addBtn);
    expect(defaultProps.onAddDeck).toHaveBeenCalled();
  });

  it("handles dragging style width", () => {
    mockIsDragging = true;
    render(<Sidebar {...defaultProps} />);
    const item = screen.getByText("Deck 1").closest('div[class*="group"]');
    expect(item).toHaveStyle("width: 288px");
  });

  it("returns an empty object when style is undefined (Guard Clause Coverage)", () => {
    // Force the style to be undefined to hit the if (!style) return {};
    mockStyleValue = undefined;

    render(<Sidebar {...defaultProps} />);

    const item = screen.getByText("Deck 1").closest('div[class*="group"]');
    expect(item).toBeInTheDocument();
    // Since style is undefined, it should have no inline styles from getStyle
    expect(item?.getAttribute("style")).toBeNull();
  });

  it("does not call onRenameDeck if name is empty", () => {
    render(<Sidebar {...defaultProps} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(defaultProps.onRenameDeck).not.toHaveBeenCalled();
  });
});
