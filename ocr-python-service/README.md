# Servicio OCR + IA (Python)

API FastAPI que realiza:

- **OCR** (Tesseract + PyPDF2) sobre PDFs e imágenes.
- **Resumen, clasificación y extracción estructurada** de CVs con Mistral.
- **Búsqueda de ofertas** en Adzuna y **matching con IA** (porcentaje de afinidad, skills faltantes, pitch personalizado).

## Requisitos

- Python 3.10+
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) instalado (en Windows: `C:\Program Files\Tesseract-OCR\tesseract.exe`)
- Clave de API de Mistral en [console.mistral.ai](https://console.mistral.ai/)
- (Opcional) Claves de Adzuna en [developer.adzuna.com](https://developer.adzuna.com/) para la búsqueda de ofertas.

## Variables de entorno

Copia `.env.example` a `.env` y configura:

| Variable           | Descripción                          |
| ------------------ | ------------------------------------ |
| `MISTRAL_API_KEY`  | Obligatoria. API key de Mistral.     |
| `ADZUNA_APP_ID`    | Opcional. Para búsqueda de ofertas.  |
| `ADZUNA_APP_KEY`   | Opcional. Para búsqueda de ofertas.  |

Si faltan las claves de Adzuna, `POST /jobs/search` responde con `offers: []` sin error.

## Cómo probar

1. **Dependencias**
   ```bash
   cd ocr-python-service
   pip install -r requirements.txt
   ```

2. **Arrancar el servicio** (desde `ocr-python-service` para que cargue `.env` correctamente)
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend** (desde la raíz del repo)
   ```bash
   cd "OCR Front"
   npm install
   npm run dev
   ```
   Abre http://localhost:5173, sube un CV y usa **Buscar ofertas** (el flujo completo requiere el backend .NET).

## Endpoints

| Método | Ruta           | Descripción |
| ------ | -------------- | ----------- |
| `POST` | `/process`     | Sube un archivo (PDF o imagen). Devuelve texto, resumen, clasificación y `structured_data` (nombre, email, teléfono, experiencia, educación, habilidades). |
| `POST` | `/jobs/search` | Body: `{ "summary", "skills", "current_role" }`. Busca ofertas en Adzuna (query amplia) y devuelve ofertas con match por IA (porcentaje, skills faltantes, pitch). |
| `GET`  | `/health`      | Estado del servicio. |
