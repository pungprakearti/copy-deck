import pkg from "../../package.json";

const Footer = () => {
  return (
    <footer className="mt-auto p-4 bg-slate-900 flex flex-col items-center gap-1">
      <p className="text-slate-400 text-xs font-normal">
        Copy Deck created by{" "}
        <span className="text-slate-200 font-semibold">
          Andrew Pungprakearti
        </span>
        , while job searching in 2026.
      </p>

      <div className="flex gap-8">
        <a
          href="https://www.linkedin.com/in/andrewpungprakearti"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
        >
          LinkedIn
        </a>
        <a
          href="https://www.biscuitsinthebasket.com"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
        >
          Biscuits in the Basket
        </a>
        <a
          href="https://github.com/pungprakearti"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
        >
          GitHub
        </a>
      </div>
      <a
        href="https://github.com/pungprakearti/copy-deck"
        target="_blank"
        rel="noreferrer"
        className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
      >
        Copy Deck v{pkg.version}
      </a>
    </footer>
  );
};

export default Footer;
