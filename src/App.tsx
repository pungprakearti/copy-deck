import { useEffect, useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import ReactGA from "react-ga4";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Deck from "./components/Deck";
import Footer from "./components/Footer";
import { defaultAppData } from "./copy";
import type { AppData } from "./types/deck";
import "./App.css";

const App = () => {
  const [appData, setAppData] = useState<AppData>(() => {
    const saved = localStorage.getItem("copydeck-data");
    return saved ? JSON.parse(saved) : defaultAppData;
  });

  const [activeDeckName, setActiveDeckName] = useState(
    () => Object.keys(appData)[0] || "",
  );

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const minWidthForApp = 700;

  useEffect(() => {
    const GA_ID = import.meta.env.VITE_GA_ID;
    if (GA_ID) {
      ReactGA.initialize(GA_ID);
      ReactGA.send({
        hitType: "pageview",
        page: window.location.pathname + window.location.search,
      });
    }

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    const newRow = {
      id: crypto.randomUUID(),
      columns: [{ id: crypto.randomUUID(), label: "New Label", content: "" }],
    };

    if (!activeDeckName) {
      const firstDeckName = "General";
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
      [newDeckName]: {
        id: crypto.randomUUID(),
        name: newDeckName,
        rows: [],
      },
    }));
    setActiveDeckName(newDeckName);
  };

  const handleRenameDeck = (oldName: string, newName: string) => {
    if (!newName || oldName === newName) return;

    setAppData((prev) => {
      const newAppData: AppData = {};
      Object.keys(prev).forEach((key) => {
        if (key === oldName) {
          newAppData[newName] = { ...prev[oldName], name: newName };
        } else {
          newAppData[key] = prev[key];
        }
      });
      return newAppData;
    });

    if (activeDeckName === oldName) setActiveDeckName(newName);
  };

  const handleDeleteDeck = (name: string) => {
    if (window.confirm(`Delete '${name}' and all its cards?`)) {
      const deckNames = Object.keys(appData);
      const remainingDecks = deckNames.filter((k) => k !== name);

      setAppData((prev) => {
        const newData = { ...prev };
        delete newData[name];
        return newData;
      });
      setActiveDeckName(remainingDecks[0] || "");
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (
      destination.index === source.index &&
      destination.droppableId === source.droppableId
    )
      return;

    if (source.droppableId === "sidebar-decks") {
      const deckNames = Object.keys(appData);
      const newDeckNames = [...deckNames];
      const [removed] = newDeckNames.splice(source.index, 1);
      newDeckNames.splice(destination.index, 0, removed);

      const newAppData: AppData = {};
      newDeckNames.forEach((name) => {
        newAppData[name] = appData[name];
      });

      setAppData(newAppData);
      return;
    }

    if (source.droppableId === "deck-list") {
      const currentRows = [...appData[activeDeckName].rows];
      const [removed] = currentRows.splice(source.index, 1);
      currentRows.splice(destination.index, 0, removed);

      setAppData((prev) => ({
        ...prev,
        [activeDeckName]: { ...prev[activeDeckName], rows: currentRows },
      }));
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-slate-950">
        {windowWidth < minWidthForApp && (
          <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-10 text-center">
            <div className="bg-slate-800 border border-blue-500/30 p-8 rounded-xl shadow-2xl max-w-sm">
              <h2 className="text-blue-400 font-bold text-xl mb-4">
                Desktop Experience Required
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Hello! This app is specifically designed for a desktop workflow.
                Please view this on a screen wider than{" "}
                <span className="text-white font-mono">{minWidthForApp}px</span>{" "}
                for the bestest experience.
              </p>
            </div>
          </div>
        )}
        <div className="max-w-5xl mx-auto flex flex-col h-screen">
          <Navbar />
          <DragDropContext onDragEnd={onDragEnd}>
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
          </DragDropContext>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default App;
