import { useState } from "react";
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from "./Icons";
import AddDeck from "./AddDeck";

interface SidebarProps {
  deckNames: string[];
  activeDeck: string;
  setActiveDeck: (name: string) => void;
  onRenameDeck: (oldName: string, newName: string) => void;
  onDeleteDeck: (name: string) => void;
  onAddDeck: () => void;
}

const Sidebar = ({
  deckNames,
  activeDeck,
  setActiveDeck,
  onRenameDeck,
  onDeleteDeck,
  onAddDeck,
}: SidebarProps) => {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  const startEditing = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setEditingName(name);
    setTempName(name);
  };

  const handleSave = (e: React.BaseSyntheticEvent, oldName: string) => {
    e.stopPropagation();
    if (tempName.trim() && tempName !== oldName) {
      onRenameDeck(oldName, tempName);
    }
    setEditingName(null);
  };

  const handleCancel = (e: React.BaseSyntheticEvent) => {
    e.stopPropagation();
    setEditingName(null);
  };

  return (
    <div className="w-64 h-full bg-slate-700 text-slate-200 font-bold flex flex-col shrink-0 border-r border-slate-800">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {deckNames.length === 0 && (
          <div className="p-6 text-slate-400 text-sm italic font-normal text-center border-b border-slate-800/50">
            No decks available.
          </div>
        )}

        {deckNames.map((name) => {
          const isActive = name === activeDeck;
          const isEditing = editingName === name;

          return (
            <div
              key={name}
              onClick={() => !isEditing && setActiveDeck(name)}
              className={`group flex items-center justify-between cursor-pointer hover:bg-slate-800 hover:text-blue-500 transition-all p-3 border-b border-slate-800/50 h-12 ${
                isActive ? "bg-slate-300 text-slate-900" : "bg-slate-600"
              }`}
            >
              <div className="flex-1 min-w-0 mr-2">
                {isEditing ? (
                  <input
                    autoFocus
                    className="bg-slate-800 text-white px-1 w-full rounded outline-none border border-blue-400 font-normal text-sm"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={(e) => handleSave(e, name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave(e, name);
                      if (e.key === "Escape") handleCancel(e);
                    }}
                  />
                ) : (
                  <span className="truncate block w-full text-sm">{name}</span>
                )}
              </div>

              <div className="flex gap-2 shrink-0 items-center">
                {isEditing ? (
                  <>
                    <button
                      onClick={(e) => handleSave(e, name)}
                      className="text-green-500 hover:scale-110 transition-transform"
                      title="Save"
                    >
                      <CheckIcon />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-red-400 hover:scale-110 transition-transform"
                      title="Cancel"
                    >
                      <XIcon />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => startEditing(e, name)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-all"
                      title="Rename deck"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDeck(name);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                      title="Delete deck"
                    >
                      <TrashIcon />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <AddDeck onAdd={onAddDeck} />
      </div>
    </div>
  );
};

export default Sidebar;
