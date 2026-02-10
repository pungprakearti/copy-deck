import { useState } from "react";
import { PencilIcon, TrashIcon, CheckIcon, XIcon, GripIcon } from "./Icons";
import AddDeck from "./AddDeck";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { DraggableStyle, DraggableStateSnapshot } from "@hello-pangea/dnd";

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
  const sidebarWidth = 72;
  const sidebarWidthPX = `${sidebarWidth * 4}px`;

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

  const getStyle = (
    style: DraggableStyle | undefined,
    snapshot: DraggableStateSnapshot,
  ): React.CSSProperties => {
    if (!style) return {};

    if (snapshot.isDragging) {
      return {
        ...style,
        width: sidebarWidthPX,
      } as React.CSSProperties;
    }
    return style as React.CSSProperties;
  };

  return (
    <div
      className={`w-${sidebarWidth} h-full bg-slate-700 text-slate-200 font-bold flex flex-col shrink-0 border-r border-slate-800`}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {deckNames.length === 0 && (
          <div className="p-6 text-slate-400 text-sm italic font-normal text-center border-b border-slate-800/50">
            No decks available.
          </div>
        )}

        <Droppable droppableId="sidebar-decks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col"
              style={{ minHeight: "1px" }}
            >
              {deckNames.map((name, index) => {
                const isActive = name === activeDeck;
                const isEditing = editingName === name;

                return (
                  <Draggable key={name} draggableId={name} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        onClick={() => !isEditing && setActiveDeck(name)}
                        className={`group flex items-center justify-between p-3 border-b
                                      border-slate-800/50 h-12 box-border outline-none
                          ${
                            isActive
                              ? "bg-slate-300 text-slate-900"
                              : "bg-slate-600 text-slate-200 hover:bg-slate-800 hover:text-blue-500"
                          }
                          ${
                            snapshot.isDragging
                              ? "transition-none bg-slate-500 shadow-xl"
                              : "transition-colors"
                          }
                        `}
                        style={getStyle(
                          dragProvided.draggableProps.style,
                          snapshot,
                        )}
                      >
                        <div className="flex items-center flex-1 min-w-0 mr-2">
                          {!isEditing && (
                            <div
                              {...dragProvided.dragHandleProps}
                              className="mr-2 opacity-0 group-hover:opacity-40 hover:opacity-100 text-slate-400
                                            hover:text-blue-500 transition-opacity p-1"
                              title="Drag to reorder"
                            >
                              <GripIcon />
                            </div>
                          )}

                          {isEditing ? (
                            <input
                              autoFocus
                              className="bg-slate-800 text-white px-1 w-full rounded outline-none border
                                            border-blue-400 font-normal text-sm h-6"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onBlur={(e) => handleSave(e, name)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave(e, name);
                                if (e.key === "Escape") handleCancel(e);
                              }}
                            />
                          ) : (
                            <span className="truncate block w-full text-sm select-none">
                              {name}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0 items-center">
                          {isEditing ? (
                            <>
                              <button
                                onClick={(e) => handleSave(e, name)}
                                className="text-green-500"
                              >
                                <CheckIcon />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="text-red-400"
                              >
                                <XIcon />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => startEditing(e, name)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-all p-1"
                              >
                                <PencilIcon />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteDeck(name);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                              >
                                <TrashIcon />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <AddDeck onAdd={onAddDeck} />
      </div>
    </div>
  );
};

export default Sidebar;
