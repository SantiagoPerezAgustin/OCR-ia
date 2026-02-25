import { motion } from "framer-motion";

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t border-slate-800 bg-slate-900/50"
    >
      <div className="w-full px-4 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20" />
            <span className="font-medium text-slate-300">OCR Document AI</span>
          </div>
          <p className="text-sm text-slate-500">
            Powered by Mistral 3 · PDF, facturas, contratos
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
