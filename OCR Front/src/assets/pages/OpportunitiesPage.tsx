import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

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

function OpportunitiesPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiBase, setApiBase] = useState<(typeof API_BASES)[number]>(API_BASES[0]);

  const baseUrl = () => apiBase;

  useEffect(() => {
    if (!candidateId) return;
    setLoading(true);
    setError(null);
    const tryFetch = async () => {
      for (const base of API_BASES) {
        try {
          const res = await fetch(
            `${base}/api/candidates/${candidateId}/recommendations`,
          );
          if (res.ok) {
            const data = await res.json();
            setOffers(
              Array.isArray(data)
                ? data
                : (data.recommendations ?? data.offers ?? []),
            );
            setApiBase(base);
            return;
          }
        } catch {
          continue;
        }
      }
      setError(
        "No se pudieron cargar las ofertas. ¿Está corriendo la API .NET?",
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
      setOffers(
        Array.isArray(data)
          ? data
          : (data.recommendations ?? data.offers ?? []),
      );
    } catch {
      setError("No se pudieron buscar ofertas.");
    } finally {
      setSearching(false);
    }
  };

  const matchColor = (pct: number) =>
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-slate-500";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          to="/"
          className="inline-block text-slate-400 hover:text-white text-sm mb-6"
        >
          ← Volver al inicio
        </Link>
        <h1 className="text-2xl font-bold mb-2">Ofertas recomendadas</h1>
        <p className="text-slate-400 text-sm mb-6">
          Candidato ID: {candidateId}
        </p>

        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="mb-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {searching ? "Buscando…" : "Buscar ofertas"}
        </button>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Cargando…</p>
        ) : offers.length === 0 ? (
          <p className="text-slate-500">
            Aún no hay ofertas. Pulsa «Buscar ofertas» para recomendar ofertas
            para este candidato.
          </p>
        ) : (
          <ul className="space-y-6">
            {offers.map((offer, i) => (
              <li
                key={offer.id ?? i}
                className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{offer.title}</h3>
                    <p className="text-slate-400 text-sm">{offer.company}</p>
                    {offer.location && (
                      <p className="text-slate-500 text-xs mt-1">
                        {offer.location}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 w-24 text-right">
                    <span className="text-lg font-bold text-white">
                      {offer.matchPercentage}%
                    </span>
                    <div className="h-2 rounded-full bg-slate-700 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${matchColor(offer.matchPercentage)}`}
                        style={{
                          width: `${Math.min(100, offer.matchPercentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                {offer.customPitch && (
                  <p className="text-slate-300 text-sm mt-3 border-l-2 border-emerald-500/50 pl-3">
                    {offer.customPitch}
                  </p>
                )}
                {offer.missingSkills && offer.missingSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="text-slate-500 text-xs">Faltan:</span>
                    {offer.missingSkills.map((s, j) => (
                      <span
                        key={j}
                        className="rounded bg-slate-700/80 px-2 py-0.5 text-xs text-slate-400"
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
                {offer.url && (
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-emerald-400 hover:underline"
                  >
                    Ver oferta →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default OpportunitiesPage;