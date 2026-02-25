import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
const NET_API_CANDIDATES = ["http://localhost:5052", "https://localhost:7223"] as const;

// Interfaces para el JSON estructurado
interface ExperienceItem {
  role?: string;
  company?: string;
  period?: string;
  description?: string;
}

interface EducationItem {
  title?: string;
  institution?: string;
  period?: string;
}

interface StructuredData {
  name?: string;
  email?: string;
  phone?: string;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  skills?: string[];
}

interface ProcessResult {
  extracted_text: string;
  summary: string;
  classification: string;
  structured_data?: StructuredData;
}

// Candidato guardado en la API .NET (la API puede devolver PascalCase: Id, Name, etc.)
interface Candidate {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  summary?: string | null;
  classification?: string | null;
  createdAt: string;
}

function normalizeCandidate(raw: Record<string, unknown>): Candidate {
  return {
    id: (raw.id ?? raw.Id) as number,
    name: (raw.name ?? raw.Name ?? "") as string,
    email: (raw.email ?? raw.Email) as string | null | undefined,
    phone: (raw.phone ?? raw.Phone) as string | null | undefined,
    summary: (raw.summary ?? raw.Summary) as string | null | undefined,
    classification: (raw.classification ?? raw.Classification) as string | null | undefined,
    createdAt: (raw.createdAt ?? raw.CreatedAt ?? "") as string,
  };
}

function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setCandidatesError(null);
    const basesToTry = apiBaseUrl ? [apiBaseUrl] : [...NET_API_CANDIDATES];
    for (const base of basesToTry) {
      try {
        const res = await fetch(`${base}/api/candidates`);
        if (!res.ok) continue;
        const data: unknown[] = await res.json();
        setCandidates(data.map((raw) => normalizeCandidate(raw as Record<string, unknown>)));
        setApiBaseUrl(base);
        setCandidatesLoading(false);
        return;
      } catch {
        continue;
      }
    }
    setCandidatesLoading(false);
    setCandidatesError("No se pudieron cargar los candidatos. ¿Está corriendo la API .NET en 5052 o 7223?");
    setCandidates([]);
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const getApiBase = () => apiBaseUrl ?? NET_API_CANDIDATES[0];

  const deleteCandidate = async (id: number) => {
    if (id == null || Number.isNaN(Number(id))) return;
    try {
      const res = await fetch(`${getApiBase()}/api/candidates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setCandidatesError("No se pudo eliminar el candidato.");
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setSaveMessage(null);
  };
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setSaveMessage(null);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSaveMessage(null);
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

  const saveCandidate = async () => {
    if (!result) return;
    setSaveMessage(null);
    try {
      const structured = result.structured_data;
      const body = {
        Name: structured?.name ?? "",
        Email: structured?.email ?? null,
        Phone: structured?.phone ?? null,
        ExperinceJson: structured?.experience
          ? JSON.stringify(structured.experience)
          : null,
        EducationJson: structured?.education
          ? JSON.stringify(structured.education)
          : null,
        SkillsJson: structured?.skills
          ? JSON.stringify(structured.skills)
          : null,
        ExtractedText: result.extracted_text,
        Summary: result.summary,
        Classification: result.classification,
      };
      const res = await fetch(`${getApiBase()}/api/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setSaveMessage({
        type: "success",
        text: "Candidato guardado correctamente.",
      });
      fetchCandidates();
    } catch {
      setSaveMessage({
        type: "error",
        text: "No se pudo guardar. ¿Está corriendo la API .NET?",
      });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-950 overflow-x-hidden">
      <Header />

      <main className="min-h-screen w-full max-w-full overflow-x-hidden">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden border-b border-slate-800/50"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
          <div className="relative w-full px-4 py-20 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Procesa tus documentos con IA
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-400">
              Sube un PDF o imagen. Extraemos el texto con OCR, lo resumimos y
              lo clasificamos automáticamente.
            </p>
          </div>
        </motion.section>

        <section className="w-full px-4 py-16">
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
                  <p className="whitespace-pre-wrap text-sm text-slate-300 max-h-40 overflow-y-auto">
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

                  {result.structured_data && (
                    <>
                      <h4 className="text-sm font-medium uppercase text-slate-500 pt-2 border-t border-slate-700/50 mt-4">
                        Datos estructurados
                      </h4>
                      <div className="grid gap-2 text-sm text-slate-300">
                        {result.structured_data.name != null && result.structured_data.name !== "" && (
                          <p><span className="text-slate-500">Nombre:</span> {result.structured_data.name}</p>
                        )}
                        {result.structured_data.email != null && result.structured_data.email !== "" && (
                          <p><span className="text-slate-500">Email:</span> {result.structured_data.email}</p>
                        )}
                        {result.structured_data.phone != null && result.structured_data.phone !== "" && (
                          <p><span className="text-slate-500">Teléfono:</span> {result.structured_data.phone}</p>
                        )}
                        {result.structured_data.skills != null && result.structured_data.skills.length > 0 && (
                          <p><span className="text-slate-500">Habilidades:</span> {result.structured_data.skills.join(", ")}</p>
                        )}
                      </div>
                      {result.structured_data.experience != null && result.structured_data.experience.length > 0 && (
                        <>
                          <p className="text-slate-500 text-sm font-medium">Experiencia</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                            {result.structured_data.experience.map((exp, i) => (
                              <li key={i}>{exp.role ?? "—"} {exp.company ? `en ${exp.company}` : ""} {exp.period ? `(${exp.period})` : ""}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {result.structured_data.education != null && result.structured_data.education.length > 0 && (
                        <>
                          <p className="text-slate-500 text-sm font-medium">Educación</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                            {result.structured_data.education.map((edu, i) => (
                              <li key={i}>{edu.title ?? "—"} {edu.institution ? `- ${edu.institution}` : ""} {edu.period ? `(${edu.period})` : ""}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={saveCandidate}
                        className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                      >
                        Guardar candidato
                      </button>
                    </>
                  )}

                  {saveMessage && (
                    <p className={`text-sm mt-2 ${saveMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                      {saveMessage.text}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </section>

        <section className="w-full px-4 py-12 border-t border-slate-800/50">
          <h3 className="text-xl font-bold text-white mb-4">Candidatos guardados</h3>
          {candidatesLoading ? (
            <p className="text-slate-500 text-sm">Cargando candidatos…</p>
          ) : candidatesError ? (
            <p className="text-red-400 text-sm">{candidatesError}</p>
          ) : candidates.length === 0 ? (
            <p className="text-slate-500 text-sm">Aún no hay candidatos guardados. Procesa un CV y pulsa «Guardar candidato».</p>
          ) : (
            <ul className="space-y-4">
              {candidates.map((c) => (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-900/30 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{c.name || "Sin nombre"}</p>
                    {c.email && <p className="text-sm text-slate-400 truncate">{c.email}</p>}
                    {c.summary && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.summary}</p>}
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(c.createdAt).toLocaleDateString("es-ES", { dateStyle: "short" })}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-wrap gap-2">
                    <Link
                      to={`/candidates/${c.id}/opportunities`}
                      className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      Ver oportunidades
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteCandidate(c.id)}
                      className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        <section
          id="features"
          className="border-t border-slate-800/50 bg-slate-900/20 py-16"
        >
          <div className="w-full px-4">
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
          <div className="w-full px-4">
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
