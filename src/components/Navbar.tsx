const Navbar = () => {
  return (
    <nav className="w-full bg-slate-400 text-slate-700 p-4 font-orbitron-black tracking-tighter grid grid-cols-3 items-center">
      <div />
      <div className="text-center text-4xl uppercase">Copy Deck</div>
      <div className="flex flex-col items-end text-sm tracking-normal font-sans font-bold text-slate-600">
        <a href="#import" className="hover:text-slate-900 transition-colors">
          Import
        </a>
        <a href="#export" className="hover:text-slate-900 transition-colors">
          Export
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
