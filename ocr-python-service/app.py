from multiprocessing import current_process
from turtle import title
from services.jobs_service import JobsService
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.ocr_service import OcrService
from services.ai_service import AiService
import io
from typing import Optional, List
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
jobs_service = JobsService()

class ExperienceItem(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None

class EducationItem(BaseModel):
    title: Optional[str] = None
    institution: Optional[str] = None
    period: Optional[str] = None

class StructuredCvData(BaseModel):
    """Datos extraidos del cv en formato estructurado."""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    skills: List[str] = []
    
class ProcessResponse(BaseModel):
    extracted_text: str
    summary: str
    classification: str
    structured_data: StructuredCvData

class JobsSearchRequest(BaseModel):
    summary: str
    skills: List[str] = []
    current_role: Optional[str] = None

class JobsMatchResult(BaseModel):
    match_percentage: int = 0
    missing_skills: List[str] = []
    custom_pitch: str = ""

class JobsOfferWithMatch(BaseModel):
    title: str
    company: str
    description: str
    url: str
    location: str
    match_percentage: int = 0
    missing_skills: List[str] = []
    custom_pitch: str = ""

class JobsSearchResponse(BaseModel):
    offers: List[JobsOfferWithMatch]

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

        # Extraer datos estructurados del CV
        structured_dict = await ia_service.extract_structured_cv_async(extracted_text)
        try:
            # Normalizar: listas None -> [] para que Pydantic no falle
            if not isinstance(structured_dict, dict):
                structured_dict = {}
            structured_dict = {k: (v if v is not None else ([] if k in ("experience", "education", "skills") else None))
                              for k, v in structured_dict.items()}
            structured_data = StructuredCvData(**structured_dict)
        except Exception:
            structured_data = StructuredCvData()

        return ProcessResponse(
            extracted_text=extracted_text,
            summary=summary,
            classification=classification,
            structured_data=structured_data,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ocr-python-service"}

@app.post("/jobs/search", response_model=JobsSearchResponse)
async def search_jobs(req: JobsSearchRequest):
    """Busca trabajos en Adzuna."""
    try:
        query = " ".join(req.skills) if req.skills else ""
        if req.current_role:
            query = f"{req.current_role} {query}".strip()
        if not query.strip():
            query = "developer"
        jobs = jobs_service.search_jobs(query, max_results=10)
        if not jobs:
            return JobsSearchResponse(offers=[])
        offers: List[JobsOfferWithMatch] = []
        for job in jobs:
            match = await ia_service.match_cv_to_job_async(
                cv_summary=req.summary,
                cv_skills=req.skills,
                job_title=job.get("title", ""),
                job_description=job.get("description", ""),
            )
            offers.append(JobsOfferWithMatch(
                title=job.get("title", ""),
                company=job.get("company", ""),
                description=job.get("description", ""),
                url=job.get("url", ""),
                location=job.get("location", ""),
                match_percentage=match.get("match_percentage", 0),
                missing_skills=match.get("missing_skills") or [],
                custom_pitch=match.get("custom_pitch", ""),
            ))
        return JobsSearchResponse(offers=offers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
