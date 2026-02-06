import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { Row } from "../types/deck";
import AddCard from "./AddCard";
import Card from "./Card";

interface DeckProps {
  deckData: Row[];
  onUpdateCard: (
    rowId: string,
    colId: string,
    newLabel: string,
    newContent: string,
  ) => void;
  onDeleteCard: (rowId: string) => void;
  onAdd: () => void;
}

const Deck = ({ deckData, onUpdateCard, onDeleteCard, onAdd }: DeckProps) => {
  return (
    <div className="flex flex-col gap-6 p-4 bg-slate-800 h-full">
      <Droppable droppableId="deck-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col gap-4"
          >
            {deckData.map((row, index) => (
              <Draggable key={row.id} draggableId={row.id} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className="w-full"
                  >
                    {row.columns.map((col) => (
                      <Card
                        key={col.id}
                        id={col.id}
                        label={col.label}
                        content={col.content}
                        dragHandleProps={dragProvided.dragHandleProps}
                        onSave={(newLabel, newContent) =>
                          onUpdateCard(row.id, col.id, newLabel, newContent)
                        }
                        onDelete={() => onDeleteCard(row.id)}
                      />
                    ))}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <AddCard onAdd={onAdd} />
    </div>
  );
};

export default Deck;
