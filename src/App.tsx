import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Deck from "./components/Deck";
import "./App.css";
import type { AppData } from "./types/deck";

const App = () => {
  const [appData, setAppData] = useState<AppData>(() => {
    const saved = localStorage.getItem("copydeck-data");
    return saved ? JSON.parse(saved) : {};
  });

  const [activeDeckName, setActiveDeckName] = useState(
    () => Object.keys(appData)[0] || "",
  );

  useEffect(() => {
    localStorage.setItem("copydeck-data", JSON.stringify(appData));
  }, [appData]);

  const handleUpdateCard = (
    rowId: string,
    colId: string,
    newLabel: string,
    newContent: string,
  ) => {
    if (!activeDeckName) return;
    setAppData((prev) => ({
      ...prev,
      [activeDeckName]: {
        ...prev[activeDeckName],
        rows: prev[activeDeckName].rows.map((row) => {
          if (row.id !== rowId) return row;
          return {
            ...row,
            columns: row.columns.map((col) => {
              if (col.id !== colId) return col;
              return { ...col, label: newLabel, content: newContent };
            }),
          };
        }),
      },
    }));
  };

  const handleAddCard = () => {
    if (!activeDeckName) {
      const firstDeckName = "General";
      const newRow = {
        id: crypto.randomUUID(),
        columns: [{ id: crypto.randomUUID(), label: "New Label", content: "" }],
      };
      setAppData({
        [firstDeckName]: {
          id: crypto.randomUUID(),
          name: firstDeckName,
          rows: [newRow],
        },
      });
      setActiveDeckName(firstDeckName);
      return;
    }

    const newRow = {
      id: crypto.randomUUID(),
      columns: [{ id: crypto.randomUUID(), label: "New Label", content: "" }],
    };
    setAppData((prev) => ({
      ...prev,
      [activeDeckName]: {
        ...prev[activeDeckName],
        rows: [...prev[activeDeckName].rows, newRow],
      },
    }));
  };

  const handleDeleteCard = (rowId: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setAppData((prev) => ({
        ...prev,
        [activeDeckName]: {
          ...prev[activeDeckName],
          rows: prev[activeDeckName].rows.filter((row) => row.id !== rowId),
        },
      }));
    }
  };

  const handleAddDeck = () => {
    const newDeckName = `New Deck ${Object.keys(appData).length + 1}`;
    setAppData((prev) => ({
      ...prev,
      [newDeckName]: { id: crypto.randomUUID(), name: newDeckName, rows: [] },
    }));
    setActiveDeckName(newDeckName);
  };

  const handleRenameDeck = (oldName: string, newName: string) => {
    if (!newName || oldName === newName) return;
    setAppData((prev) => {
      const entries = Object.entries(prev);
      const newEntries = entries.map(([key, value]) =>
        key === oldName ? [newName, value] : [key, value],
      );
      return Object.fromEntries(newEntries);
    });
    if (activeDeckName === oldName) setActiveDeckName(newName);
  };

  const handleDeleteDeck = (name: string) => {
    if (window.confirm(`Delete "${name}" and all its cards?`)) {
      setAppData((prev) => {
        const newData = { ...prev };
        delete newData[name];
        return newData;
      });

      const remainingDecks = Object.keys(appData).filter((k) => k !== name);
      setActiveDeckName(remainingDecks[0] || "");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900">
      <div className="max-w-5xl mx-auto flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-row flex-1 overflow-hidden">
          <Sidebar
            deckNames={Object.keys(appData)}
            activeDeck={activeDeckName}
            setActiveDeck={setActiveDeckName}
            onRenameDeck={handleRenameDeck}
            onDeleteDeck={handleDeleteDeck}
            onAddDeck={handleAddDeck}
          />
          <main className="flex-1 overflow-y-auto bg-slate-800">
            <Deck
              deckData={appData[activeDeckName]?.rows || []}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onAdd={handleAddCard}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
