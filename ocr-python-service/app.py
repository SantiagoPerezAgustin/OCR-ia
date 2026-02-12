from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.ocr_service import OcrService
from services.ai_service import AiService
import io
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="OCR & AI Processing Service")

# CORS para permitir llamadas desde .NET

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ocr_service = OcrService()
ia_service = AiService()

class ProcessResponse(BaseModel):
    extracted_text: str
    summary: str
    classification: str

@app.post("/process", response_model=ProcessResponse)
async def process_document(file: UploadFile = File(...)):
    """
    Procesa un documento: OCR + Resumen + Clasificación
    """

    try:
        #leer el archivo
        contents = await file.read()
        content_type = file.content_type

        #OCR
        extracted_text = await ocr_service.extract_text_async(contents, content_type or "")
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="No se pudo extraer texto del documento.")
            
        #resumen 
        summary = await ia_service.get_summary_async(extracted_text)

        # Clasificación con Mistral AI
        classification = await ia_service.classify_document_async(extracted_text)

        return ProcessResponse(
            extracted_text=extracted_text,
            summary=summary,
            classification=classification,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ocr-python-service"}
