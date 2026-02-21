# OCR con IA

Aplicación full stack para procesar CVs (PDF e imágenes) con OCR, resumen automático, clasificación y **búsqueda de ofertas** usando IA (Mistral) y Adzuna.

## Estructura del proyecto

- **OCR Front** – Frontend en React (Vite + TypeScript) con subida de archivos, listado de candidatos y búsqueda de ofertas recomendadas.
- **ocr-python-service** – Microservicio en Python (FastAPI): OCR (Tesseract, PyPDF2), Mistral (resumen, clasificación, extracción de CV, matching con ofertas) y búsqueda en Adzuna.
- **BackOCRIa** – API en .NET (ASP.NET Core 8) que actúa como gateway, persiste candidatos y ofertas y orquesta las llamadas al servicio Python.

## Funcionalidades

- **Extracción de texto (OCR)** – PDFs con texto nativo (PyPDF2) e imágenes (Tesseract).
- **Resumen y clasificación** – Resumen del contenido y clasificación del documento (factura, contrato, CV, etc.) con Mistral.
- **Extracción estructurada de CV** – Nombre, email, teléfono, experiencia, educación y habilidades.
- **Búsqueda de ofertas** – A partir del CV del candidato se buscan ofertas en Adzuna (búsqueda amplia) y se calcula el match con IA (porcentaje, skills faltantes, pitch personalizado).

## Requisitos

- **Python 3.10+** (para el servicio OCR/IA)
- **Node.js 18+** (para el frontend)
- **Tesseract OCR** instalado ([descarga Windows](https://github.com/UB-Mannheim/tesseract/wiki))
- **API Key de Mistral** ([mistral.ai](https://www.mistral.ai))
- **Claves de Adzuna** (opcional, para búsqueda de ofertas): [developer.adzuna.com](https://developer.adzuna.com/)

## Configuración

### 1. Servicio Python (OCR + IA + ofertas)

```bash
cd ocr-python-service
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
```

Crea un archivo `.env` en `ocr-python-service/` con:

```
MISTRAL_API_KEY=tu_api_key_aqui
ADZUNA_APP_ID=tu_app_id
ADZUNA_APP_KEY=tu_app_key
```

Sin `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` el resto del flujo funciona; la búsqueda de ofertas devolverá lista vacía.

En Windows, si Tesseract no está en el PATH, configura la ruta en `services/ocr_service.py` (línea `tesseract_cmd`).

### 2. Frontend

```bash
cd "OCR Front"
npm install
npm run dev
```

El frontend llama por defecto a `http://localhost:8000` (servicio Python). No es necesario levantar .NET para probar.

### 3. (Opcional) API .NET

```bash
cd BackOCRIa/BackOCRIa
dotnet run
```

Configura `PythonService:BaseUrl` en `appsettings.Development.json` si usas el backend .NET como intermediario.

## Cómo ejecutar

1. **Solo frontend + Python** (recomendado para desarrollo):

   ```bash
   # Terminal 1 – Servicio Python
   cd ocr-python-service && venv\Scripts\activate && uvicorn app:app --reload --host 0.0.0.0 --port 8000

   # Terminal 2 – Frontend
   cd "OCR Front" && npm run dev
   ```

2. Abre en el navegador la URL del frontend (ej. `http://localhost:5173`), sube un PDF o imagen y pulsa **Procesar documento**. Desde la ficha del candidato puedes usar **Buscar ofertas** para obtener recomendaciones con match por IA.

## Stack

| Parte        | Tecnologías                                                |
| ------------ | ---------------------------------------------------------- |
| Frontend     | React, TypeScript, Vite, Tailwind, Framer Motion           |
| Servicio IA  | Python, FastAPI, Tesseract, PyPDF2, Mistral API, Adzuna    |
| API          | .NET 8, ASP.NET Core                                       |

## Licencia

MIT
