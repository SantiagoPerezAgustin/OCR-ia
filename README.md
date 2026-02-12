# OCR con IA

Aplicación full stack para procesar documentos (PDF e imágenes) con OCR, resumen automático y clasificación usando IA (Mistral).

## Estructura del proyecto

- **OCR Front** – Frontend en React (Vite + TypeScript) con subida de archivos y visualización de resultados.
- **ocr-python-service** – Microservicio en Python (FastAPI) que realiza OCR (Tesseract, PyPDF2) y llama a la API de Mistral para resumen y clasificación.
- **BackOCRIa** – API en .NET (ASP.NET Core 8) opcional; puede actuar como gateway y persistir en base de datos.

## Funcionalidades

- **Extracción de texto (OCR)** – PDFs con texto nativo (PyPDF2) e imágenes (Tesseract).
- **Resumen** – Resumen del contenido con Mistral.
- **Clasificación** – Clasificación del documento (factura, contrato, informe, carta, CV, otro).

## Requisitos

- **Python 3.10+** (para el servicio OCR/IA)
- **Node.js 18+** (para el frontend)
- **Tesseract OCR** instalado ([descarga Windows](https://github.com/UB-Mannheim/tesseract/wiki))
- **API Key de Mistral** ([mistral.ai](https://www.mistral.ai))

## Configuración

### 1. Servicio Python (OCR + IA)

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
```

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

2. Abre en el navegador la URL del frontend (ej. `http://localhost:5173`), sube un PDF o imagen y pulsa **Procesar documento**.

## Stack

| Parte        | Tecnologías                                                |
| ------------ | ---------------------------------------------------------- |
| Frontend     | React, TypeScript, Vite, Tailwind, Framer Motion           |
| Servicio IA  | Python, FastAPI, Tesseract, PyPDF2, Mistral API            |
| API          | .NET 8, ASP.NET Core                                       |

## Licencia

MIT
