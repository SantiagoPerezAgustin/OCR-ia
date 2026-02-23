import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "../components";

const API_BASES = ["http://localhost:5052", "https://localhost:7223"] as const;

interface JobOffer {
  id?: number;
  title: string;
  company: string;
  description?: string | null;
  url?: string | null;
  location?: string | null;
  matchPercentage: number;
  missingSkills: string[];
  customPitch?: string | null;
}

interface CandidateInfo {
  id: number;
  name: string;
  skillsJson?: string | null;
}

function OpportunitiesPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiBase, setApiBase] = useState<(typeof API_BASES)[number]>(API_BASES[0]);

  const baseUrl = () => apiBase;
  const displayName = candidate?.name?.trim() || "tu perfil";

  useEffect(() => {
    if (!candidateId) return;
    setLoading(true);
    setError(null);
    const tryFetch = async () => {
      for (const base of API_BASES) {
        try {
          const [recsRes, candRes] = await Promise.all([
            fetch(`${base}/api/candidates/${candidateId}/recommendations`),
            fetch(`${base}/api/candidates/${candidateId}`),
          ]);
          if (recsRes.ok) {
            const data = await recsRes.json();
            const list = Array.isArray(data)
              ? data
              : (data.recommendations ?? data.offers ?? []);
            setOffers(list);
            setApiBase(base);
            if (candRes.ok) {
              const c = await candRes.json();
              setCandidate({
                id: c.id,
                name: c.name ?? "Tu perfil",
                skillsJson: c.skillsJson ?? null,
              });
            } else {
              setCandidate({ id: Number(candidateId), name: "Tu perfil" });
            }
            return;
          }
        } catch {
          continue;
        }
      }
      setError(
        "No se pudieron cargar las ofertas. Comprueba que la aplicación esté en marcha.",
      );
      setOffers([]);
    };
    tryFetch().finally(() => setLoading(false));
  }, [candidateId]);

  const handleSearch = async () => {
    if (!candidateId) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `${baseUrl()}/api/candidates/${candidateId}/recommendations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error("Error al buscar ofertas");
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : (data.recommendations ?? data.offers ?? []);
      setOffers(list);
    } catch {
      setError("No se pudieron cargar ofertas. Inténtalo de nuevo en unos segundos.");
    } finally {
      setSearching(false);
    }
  };

  const matchLabel = (pct: number) =>
    pct >= 70 ? "Alta" : pct >= 40 ? "Media" : "Básica";
  const matchBadgeClass = (pct: number) =>
    pct >= 70
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
      : pct >= 40
        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
        : "bg-slate-500/20 text-slate-400 border-slate-500/40";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main>
        {/* Hero tipo portal de empleo */}
        <section className="relative overflow-hidden border-b border-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-6 py-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al inicio
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Ofertas recomendadas para {displayName}
            </h1>
            <p className="mt-2 max-w-xl text-slate-400">
              Empleos que encajan con tu perfil. Buscamos por ti y te mostramos el grado de afinidad con cada oferta.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Buscando ofertas…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar ofertas para mi perfil
                  </>
                )}
              </button>
              <a
                href={(() => {
                  const fallback = "developer";
                  if (!candidate?.skillsJson)
                    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(fallback)}`;
                  try {
                    const skills: string[] = JSON.parse(candidate.skillsJson);
                    const keywords = skills.filter(Boolean).slice(0, 2).join(" ") || fallback;
                    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}`;
                  } catch {
                    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(fallback)}`;
                  }
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-sky-500/50 bg-sky-600/20 px-6 py-3 text-base font-medium text-white hover:bg-sky-500/30 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Buscar en LinkedIn
              </a>
            </div>
          </div>
        </section>

        {/* Contenido principal */}
        <section className="mx-auto max-w-4xl px-6 py-10">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <span className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-4" />
              <p>Cargando ofertas…</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/30 p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50 text-slate-400">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Aún no hay ofertas mostradas
              </h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Pulsa el botón «Buscar ofertas para mi perfil» para que busquemos empleos que encajen con tu CV. Te mostraremos la afinidad con cada oferta y un enlace para postularte.
              </p>
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {searching ? "Buscando…" : "Buscar ofertas"}
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-slate-500 text-sm mb-6">
                {offers.length} oferta{offers.length !== 1 ? "s" : ""} encontrada{offers.length !== 1 ? "s" : ""}
              </p>
              <ul className="space-y-4">
                {offers.map((offer, i) => (
                  <li
                    key={offer.id ?? i}
                    className="rounded-2xl border border-slate-700/50 bg-slate-900/30 p-5 transition-colors hover:border-slate-600/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-white">
                          {offer.title}
                        </h3>
                        <p className="text-slate-400 mt-0.5">{offer.company}</p>
                        {offer.location && (
                          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {offer.location}
                          </p>
                        )}
                        {offer.customPitch && (
                          <p className="text-slate-300 text-sm mt-3 pl-3 border-l-2 border-emerald-500/50">
                            {offer.customPitch}
                          </p>
                        )}
                        {offer.missingSkills && offer.missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            <span className="text-slate-500 text-xs">Requisitos a reforzar:</span>
                            {offer.missingSkills.map((s, j) => (
                              <span
                                key={j}
                                className="rounded-md bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {offer.description && (
                          <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                            {offer.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-3">
                        <span
                          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${matchBadgeClass(offer.matchPercentage)}`}
                        >
                          {offer.matchPercentage}% afinidad · {matchLabel(offer.matchPercentage)}
                        </span>
                        {offer.url && (
                          <a
                            href={offer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                          >
                            Ver oferta
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default OpportunitiesPage;
