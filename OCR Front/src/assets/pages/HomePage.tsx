import { useState } from "react";
import {
  DocumentUploader,
  FilePreview,
  FeatureCard,
  Footer,
  Header,
} from "../components";
import { motion } from "framer-motion";

const SCAN_ICON = (
  <svg
    className="h-6 w-6"
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
);

const SUMMARY_ICON = (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16m-7 6h7"
    />
  </svg>
);

const CLASSIFY_ICON = (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const PYTHON_API_URL = "http://localhost:8000";

interface ProcessResult {
  extracted_text: string;
  summary: string;
  classification: string;
}

function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${PYTHON_API_URL}/process`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? "Error al procesar");
      }
      const data: ProcessResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar el documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main>
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden border-b border-slate-800/50"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
          <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Procesa tus documentos con IA
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-400">
              Sube un PDF o imagen. Extraemos el texto con OCR, lo resumimos y
              lo clasificamos automáticamente.
            </p>
          </div>
        </motion.section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          <DocumentUploader onFileSelected={handleFileSelected} />

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 space-y-6 rounded-2xl border border-slate-700/50 bg-slate-900/30 p-6"
            >
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Archivo listo para procesar
              </h3>
              <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
              <motion.button
                type="button"
                onClick={handleProcess}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-colors hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
              >
                {loading ? "Procesando…" : "Procesar documento"}
              </motion.button>

              {error && (
                <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 text-left"
                >
                  <h4 className="text-sm font-medium uppercase text-slate-500">
                    Texto extraído
                  </h4>
                  <p className="whitespace-pre-wrap text-sm text-slate-300">
                    {result.extracted_text}
                  </p>
                  <h4 className="text-sm font-medium uppercase text-slate-500">
                    Resumen
                  </h4>
                  <p className="text-sm text-slate-300">{result.summary}</p>
                  <h4 className="text-sm font-medium uppercase text-slate-500">
                    Clasificación
                  </h4>
                  <p className="text-sm text-emerald-400">{result.classification}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </section>

        <section
          id="features"
          className="border-t border-slate-800/50 bg-slate-900/20 py-16"
        >
          <div className="mx-auto max-w-5xl px-6">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-10 text-center text-2xl font-bold text-white"
            >
              ¿Qué puedes hacer?
            </motion.h3>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <FeatureCard
                icon={SCAN_ICON}
                title="Extracción OCR"
                description="Lee texto de PDFs e imágenes escaneadas con alta precisión."
                index={0}
              />
              <FeatureCard
                icon={SUMMARY_ICON}
                title="Resumen automático"
                description="Obtén un resumen ejecutivo de contratos o informes largos."
                index={1}
              />
              <FeatureCard
                icon={CLASSIFY_ICON}
                title="Clasificación"
                description="Detecta facturas, contratos y otros tipos de documento."
                index={2}
              />
            </motion.div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-slate-800/50 py-16"
        >
          <div className="mx-auto max-w-3xl px-6">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-10 text-center text-2xl font-bold text-white"
            >
              Cómo funciona
            </motion.h3>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-8 md:flex-row md:justify-between"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
                  1
                </div>
                <p className="font-medium text-white">Sube tu archivo</p>
                <p className="text-sm text-slate-500">
                  PDF o imagen hasta 50 MB
                </p>
              </div>
              <div className="hidden flex-1 self-center border-t-2 border-dashed border-slate-700 md:block" />
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
                  2
                </div>
                <p className="font-medium text-white">Procesamos con IA</p>
                <p className="text-sm text-slate-500">OCR + Mistral 3</p>
              </div>
              <div className="hidden flex-1 self-center border-t-2 border-dashed border-slate-700 md:block" />
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
                  3
                </div>
                <p className="font-medium text-white">Obtén resultados</p>
                <p className="text-sm text-slate-500">
                  Texto, resumen y clasificación
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

export default HomePage;
