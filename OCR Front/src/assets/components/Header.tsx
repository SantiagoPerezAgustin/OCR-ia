import { motion } from "framer-motion";

function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">OCR Document AI</h1>
            <p className="text-xs text-slate-400">
              Extrae, resume y clasifica con IA
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <a
            href="#features"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Características
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Cómo funciona
          </a>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
            Mistral 3
          </span>
        </nav>
      </div>
    </motion.header>
  );
}

export default Header;
