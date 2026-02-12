import { useState, useCallback } from "react";
import { motion } from "framer-motion";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
];

const ACCEPTED_EXTENSIONS = ".pdf,.png,.jpg,.jpeg,.webp,.avif";

interface DocumentUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

function DocumentUploader({
  onFileSelected,
  disabled = false,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Tipo no soportado: ${file.name}. Usa PDF o imágenes (PNG, JPG, WebP).`;
    }
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return `Archivo muy grande: ${file.name}. Máximo 50 MB.`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (!file) return;
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          group relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center
          rounded-2xl border-2 border-dashed px-8 py-12 transition-all duration-200
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
          ${
            isDragging
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50"
          }
        `}
      >
        <input
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 transition-colors group-hover:bg-emerald-500/20 group-hover:text-emerald-400"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </motion.div>
        <p className="mb-1 text-center text-lg font-medium text-slate-200">
          Arrastra tu archivo aquí o haz clic
        </p>
        <p className="text-center text-sm text-slate-500">
          PDF, PNG, JPG, WebP, AVIF — hasta 50 MB
        </p>
      </label>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-red-400"
        >
          <svg
            className="h-5 w-5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">{error}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default DocumentUploader;
