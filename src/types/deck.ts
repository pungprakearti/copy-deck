export interface CardData {
  id: string;
  label: string;
  content: string;
}

export type Column = CardData;

export interface Row {
  id: string;
  columns: Column[];
}

export interface Deck {
  id: string;
  name: string;
  rows: Row[];
}

export type AppData = Record<string, Deck>;
