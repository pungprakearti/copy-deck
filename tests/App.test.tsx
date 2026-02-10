import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReactGA from "react-ga4";
import App from "../src/App";

// 1. Extend TypeScript definitions for Vitest matchers
interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toBeVisible(): R;
  toHaveTextContent(text: string | RegExp): R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// 2. Mock Google Analytics
vi.mock("react-ga4", () => ({
  default: {
    initialize: vi.fn(),
    send: vi.fn(),
  },
}));

// 3. Mock Drag and Drop
let triggerDragEnd: (result: any) => void;

vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children, onDragEnd }: any) => {
    triggerDragEnd = onDragEnd;
    return <div data-testid="drag-drop-context">{children}</div>;
  },
  Droppable: ({ children }: any) =>
    children({ draggableProps: {}, innerRef: vi.fn() }, {}),
  Draggable: ({ children }: any) =>
    children(
      { draggableProps: {}, dragHandleProps: {}, innerRef: vi.fn() },
      {},
    ),
}));

// 4. Mock Sidebar
vi.mock("../src/components/Sidebar", () => ({
  default: ({
    deckNames,
    activeDeck,
    setActiveDeck,
    onRenameDeck,
    onDeleteDeck,
    onAddDeck,
  }: any) => (
    <div>
      {deckNames.map((name: string) => (
        <div key={name}>
          <span className={activeDeck === name ? "active" : ""}>{name}</span>
          <button onClick={() => setActiveDeck(name)}>Select {name}</button>
          <button
            data-testid={`rename-${name}`}
            onClick={() => {
              const newName = prompt("Enter new name");
              onRenameDeck(name, newName);
            }}
          >
            Rename {name}
          </button>
          <button
            data-testid={`delete-deck-${name}`}
            onClick={() => onDeleteDeck(name)}
          >
            Delete {name}
          </button>
        </div>
      ))}
      <button onClick={onAddDeck}>Add New Deck</button>
    </div>
  ),
}));

// 5. Mock Deck
vi.mock("../src/components/Deck", () => ({
  default: ({ deckData, onUpdateCard, onDeleteCard, onAdd }: any) => (
    <div>
      <button
        data-testid="force-update-btn"
        onClick={() => onUpdateCard("fake-row", "fake-col", "test", "test")}
      >
        Force Update
      </button>
      {deckData.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {row.columns.map((col: any) => (
            <div key={col.id}>
              <input
                data-testid={`label-${col.id}`}
                value={col.label}
                onChange={(e) =>
                  onUpdateCard(row.id, col.id, e.target.value, col.content)
                }
              />
            </div>
          ))}
          <button
            data-testid={`delete-card-${row.id}`}
            onClick={() => onDeleteCard(row.id)}
          >
            Delete Card
          </button>
        </div>
      ))}
      <button data-testid="add-card-btn" onClick={onAdd}>
        ADD NEW CARD
      </button>
    </div>
  ),
}));

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, "crypto", {
      value: { randomUUID: () => "test-uuid-" + Math.random() },
      writable: true,
    });

    const mockStorage: Record<string, string> = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value;
        },
        clear: () => {
          Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
        },
        removeItem: (key: string) => {
          delete mockStorage[key];
        },
        length: 0,
        key: (index: number) => Object.keys(mockStorage)[index] || null,
      },
      writable: true,
      configurable: true,
    });

    window.localStorage.clear();

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event("resize"));

    vi.stubEnv("VITE_GA_ID", "UA-12345");
  });

  describe("Initialization", () => {
    it("initializes GA when ID is present", () => {
      vi.stubEnv("VITE_GA_ID", "UA-TEST-123");
      render(<App />);
      expect(ReactGA.initialize).toHaveBeenCalledWith("UA-TEST-123");
    });

    it("does not initialize GA when ID is missing", () => {
      vi.stubEnv("VITE_GA_ID", "");
      render(<App />);
      expect(ReactGA.initialize).not.toHaveBeenCalled();
    });
  });

  it("adds a card to an existing active deck", async () => {
    const testData = { General: { id: "1", name: "General", rows: [] } };
    window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
    render(<App />);
    fireEvent.click(screen.getByTestId("add-card-btn"));
    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem("copydeck-data") || "{}",
      );
      expect(stored.General.rows.length).toBe(1);
    });
  });

  describe("Deletion Logic", () => {
    it("deletes a card from the deck when confirmed", async () => {
      const testData = {
        General: {
          id: "1",
          name: "General",
          rows: [
            { id: "row-1", columns: [{ id: "c1", label: "Del", content: "" }] },
          ],
        },
      };
      window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
      window.confirm = vi.fn().mockReturnValue(true);
      render(<App />);
      fireEvent.click(await screen.findByTestId("delete-card-row-1"));
      await waitFor(() => {
        const stored = JSON.parse(
          window.localStorage.getItem("copydeck-data") || "{}",
        );
        expect(stored.General.rows.length).toBe(0);
      });
    });

    it("deletes a card: does nothing if cancelled", async () => {
      const testData = {
        General: {
          id: "1",
          name: "General",
          rows: [
            {
              id: "row-1",
              columns: [{ id: "c1", label: "Keep", content: "" }],
            },
          ],
        },
      };
      window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
      window.confirm = vi.fn().mockReturnValue(false);
      render(<App />);
      fireEvent.click(await screen.findByTestId("delete-card-row-1"));
      const stored = JSON.parse(
        window.localStorage.getItem("copydeck-data") || "{}",
      );
      expect(stored.General.rows.length).toBe(1);
    });

    it("deletes a deck when confirmed", async () => {
      const testData = { "Deck 1": { id: "1", name: "Deck 1", rows: [] } };
      window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
      window.confirm = vi.fn().mockReturnValue(true);
      render(<App />);
      fireEvent.click(await screen.findByTestId("delete-deck-Deck 1"));
      expect(screen.queryByText("Deck 1")).not.toBeInTheDocument();
    });

    it("deletes a deck: does nothing if cancelled", async () => {
      const testData = { "Deck 1": { id: "1", name: "Deck 1", rows: [] } };
      window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
      window.confirm = vi.fn().mockReturnValue(false);
      render(<App />);
      fireEvent.click(await screen.findByTestId("delete-deck-Deck 1"));
      expect(screen.getByText("Deck 1")).toBeInTheDocument();
    });
  });

  it("adds a new deck and sets it as active", async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Add New Deck/i));
    expect(await screen.findByText("New Deck 1")).toBeInTheDocument();
  });

  it("renames a deck successfully", async () => {
    const testData = { Old: { id: "1", name: "Old", rows: [] } };
    window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
    window.prompt = vi.fn().mockReturnValue("New");
    render(<App />);
    fireEvent.click(await screen.findByTestId("rename-Old"));
    expect(await screen.findByText("New")).toBeInTheDocument();
  });

  it("updates a card label and content", async () => {
    const testData = {
      General: {
        id: "1",
        name: "General",
        rows: [
          { id: "r1", columns: [{ id: "c1", label: "Orig", content: "" }] },
        ],
      },
    };
    window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
    render(<App />);
    fireEvent.change(await screen.findByTestId("label-c1"), {
      target: { value: "Updated" },
    });
    expect(screen.getByDisplayValue("Updated")).toBeInTheDocument();
  });

  describe("Drag and Drop Logic", () => {
    it("onDragEnd: returns early if destination is null", async () => {
      render(<App />);
      const setItemSpy = vi.spyOn(window.localStorage, "setItem");
      act(() => {
        triggerDragEnd({
          destination: null,
          source: { index: 0, droppableId: "sidebar-decks" },
        });
      });
      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it("onDragEnd: returns early if dropped in the same position", async () => {
      const testData = { General: { id: "1", name: "General", rows: [] } };
      window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
      render(<App />);
      const setItemSpy = vi.spyOn(window.localStorage, "setItem");
      act(() => {
        triggerDragEnd({
          destination: { index: 0, droppableId: "sidebar-decks" },
          source: { index: 0, droppableId: "sidebar-decks" },
        });
      });
      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it("onDragEnd: reorders decks in the sidebar (droppableId === sidebar-decks)", async () => {
      const testData = {
        "Deck A": { id: "a", name: "Deck A", rows: [] },
        "Deck B": { id: "b", name: "Deck B", rows: [] },
      };
      window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
      render(<App />);
      act(() => {
        triggerDragEnd({
          destination: { index: 1, droppableId: "sidebar-decks" },
          source: { index: 0, droppableId: "sidebar-decks" },
        });
      });
      await waitFor(() => {
        const stored = JSON.parse(
          window.localStorage.getItem("copydeck-data") || "{}",
        );
        expect(Object.keys(stored)[0]).toBe("Deck B");
      });
    });

    it("onDragEnd: reorders cards within a deck (droppableId === deck-list)", async () => {
      const testData = {
        General: {
          id: "d1",
          name: "General",
          rows: [
            { id: "row-1", columns: [] },
            { id: "row-2", columns: [] },
          ],
        },
      };
      window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
      render(<App />);

      act(() => {
        triggerDragEnd({
          destination: { index: 1, droppableId: "deck-list" },
          source: { index: 0, droppableId: "deck-list" },
        });
      });

      await waitFor(() => {
        const stored = JSON.parse(
          window.localStorage.getItem("copydeck-data") || "{}",
        );
        expect(stored.General.rows[0].id).toBe("row-2");
        expect(stored.General.rows[1].id).toBe("row-1");
      });
    });

    it("onDragEnd: returns early for unknown droppableId", async () => {
      const testData = { General: { id: "1", name: "General", rows: [] } };
      window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
      render(<App />);
      const setItemSpy = vi.spyOn(window.localStorage, "setItem");

      act(() => {
        triggerDragEnd({
          destination: { index: 1, droppableId: "unknown-id" },
          source: { index: 0, droppableId: "unknown-id" },
        });
      });

      // Since it's not sidebar-decks or deck-list, no setAppData happens
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  it("updates windowWidth and shows overlay on resize", async () => {
    render(<App />);
    act(() => {
      window.innerWidth = 500;
      window.dispatchEvent(new Event("resize"));
    });
    expect(
      screen.getByText(/Desktop Experience Required/i),
    ).toBeInTheDocument();
    act(() => {
      window.innerWidth = 1024;
      window.dispatchEvent(new Event("resize"));
    });
    expect(
      screen.queryByText(/Desktop Experience Required/i),
    ).not.toBeInTheDocument();
  });

  it("handleUpdateCard: returns early if no active deck name exists", async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("force-update-btn"));
    const stored = JSON.parse(
      window.localStorage.getItem("copydeck-data") || "{}",
    );
    expect(stored).toEqual({});
  });

  it("updates the correct row and column when multiple exist", async () => {
    const testData = {
      General: {
        id: "1",
        name: "General",
        rows: [
          { id: "r1", columns: [{ id: "c1", label: "L", content: "" }] },
          {
            id: "r2",
            columns: [
              { id: "c2", label: "R", content: "" },
              { id: "c3", label: "Other", content: "" },
            ],
          },
        ],
      },
    };
    window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
    render(<App />);
    fireEvent.change(await screen.findByTestId("label-c3"), {
      target: { value: "New Val" },
    });
    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem("copydeck-data") || "{}",
      );
      expect(stored.General.rows[1].columns[1].label).toBe("New Val");
      expect(stored.General.rows[0].columns[0].label).toBe("L");
      expect(stored.General.rows[1].columns[0].label).toBe("R");
    });
  });

  it("handleAddCard: creates a General deck if no decks exist", async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("add-card-btn"));
    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem("copydeck-data") || "{}",
      );
      expect(stored.General.name).toBe("General");
    });
  });

  it("handleRenameDeck: returns early if name is empty or unchanged", async () => {
    const testData = { General: { id: "1", name: "General", rows: [] } };
    window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
    render(<App />);
    const renameBtn = await screen.findByTestId("rename-General");
    window.prompt = vi.fn().mockReturnValue("");
    fireEvent.click(renameBtn);
    window.prompt = vi.fn().mockReturnValue("General");
    fireEvent.click(renameBtn);
    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("handleRenameDeck: preserves other decks when renaming one", async () => {
    const testData = {
      Stay: { id: "1", name: "Stay", rows: [] },
      Change: { id: "2", name: "Change", rows: [] },
    };
    window.localStorage.setItem("copydeck-data", JSON.stringify(testData));
    window.prompt = vi.fn().mockReturnValue("NewName");
    render(<App />);
    fireEvent.click(await screen.findByTestId("rename-Change"));
    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem("copydeck-data") || "{}",
      );
      expect(stored.Stay).toBeDefined();
      expect(stored.NewName).toBeDefined();
    });
  });
});
