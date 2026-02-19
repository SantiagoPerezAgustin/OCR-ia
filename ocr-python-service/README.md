# Servicio OCR + IA (Python)

API FastAPI que hace OCR (Tesseract + PyPDF2), resumen, clasificación y extracción estructurada de CVs con Mistral.

## Requisitos

- Python 3.10+
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) instalado (en Windows: `C:\Program Files\Tesseract-OCR\tesseract.exe`)
- Clave de API de Mistral en [console.mistral.ai](https://console.mistral.ai/)

## Cómo probar (sin .NET)

1. **Variables de entorno**
   - Copia `.env.example` a `.env`
   - Rellena `MISTRAL_API_KEY` en `.env`

2. **Dependencias**
   ```bash
   cd ocr-python-service
   pip install -r requirements.txt
   ```

3. **Arrancar el servicio**
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Arrancar el frontend**
   - En otra terminal, desde la raíz del repo:
   ```bash
   cd "OCR Front"
   npm install
   npm run dev
   ```
   - Abre http://localhost:5173 y sube un PDF o imagen de un CV.

El botón **"Guardar candidato"** llama a la API .NET; cuando tengas el backend .NET levantado, funcionará sin cambios.

## Endpoints

- `POST /process`: sube un archivo (PDF o imagen), devuelve texto, resumen, clasificación y `structured_data` (nombre, email, teléfono, experiencia, educación, habilidades).
- `GET /health`: estado del servicio.
