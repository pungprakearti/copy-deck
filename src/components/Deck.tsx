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
      {deckData.map((row) => (
        <div key={row.id} className="flex flex-row gap-4 w-full">
          {row.columns.map((col) => (
            <Card
              key={col.id}
              id={col.id}
              label={col.label}
              content={col.content}
              onSave={(newLabel, newContent) =>
                onUpdateCard(row.id, col.id, newLabel, newContent)
              }
              onDelete={() => onDeleteCard(row.id)}
            />
          ))}
        </div>
      ))}
      <AddCard onAdd={onAdd} />
    </div>
  );
};

export default Deck;
