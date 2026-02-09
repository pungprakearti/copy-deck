interface AddCardProps {
  onAdd: () => void;
}

const AddCard = ({ onAdd }: AddCardProps) => {
  return (
    <div className="w-full">
      <button
        onClick={onAdd}
        className="w-full p-1.5 mt-4 mb-4 border-2 border-dashed border-slate-500 rounded text-center
                       text-slate-500 font-bold transition-all duration-200
                       hover:bg-slate-700 hover:text-white hover:border-slate-400"
      >
        ADD NEW CARD
      </button>
    </div>
  );
};

export default AddCard;
