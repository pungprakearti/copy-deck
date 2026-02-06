interface AddDeckProps {
  onAdd: () => void;
}

const AddDeck = ({ onAdd }: AddDeckProps) => {
  return (
    <div
      onClick={onAdd}
      className="w-full h-12 flex items-center justify-center bg-slate-600 text-slate-400 hover:bg-slate-800 hover:text-blue-500 transition-all cursor-pointer font-bold border-t border-slate-700 mt-auto"
    >
      <span className="text-sm uppercase tracking-wider">Add New Deck</span>
    </div>
  );
};

export default AddDeck;
