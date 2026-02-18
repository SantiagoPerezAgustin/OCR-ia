import os
import requests
from typing import Optional
import json

class AiService:
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY")
        if not self.api_key:
            raise ValueError("MISTRAL_API_KEY no configurada en variables de entorno")
        self.base_url = "https://api.mistral.ai/v1"
    
    async def get_summary_async(self, text: str) -> str:
        """
        Obtiene resumen del texto usando Mistral
        """
        if not text or len(text.strip()) < 20:
            return "Texto insuficiente para resumir."
        
        # Limitar texto a ~4000 caracteres
        text_to_summarize = text[:4000] if len(text) > 4000 else text
        
        payload = {
            "model": "mistral-small-latest",
            "messages": [
                {
                    "role": "user",
                    "content": f"Resume de forma breve y clara el siguiente texto:\n\n{text_to_summarize}"
                }
            ],
            "max_tokens": 500
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    async def classify_document_async(self, text: str) -> str:
        """
        Clasifica el documento usando Mistral
        """
        if not text or len(text.strip()) < 10:
            return "desconocido"
        
        text_sample = text[:2000] if len(text) > 2000 else text
        
        payload = {
            "model": "mistral-small-latest",
            "messages": [
                {
                    "role": "user",
                    "content": f"Clasifica este documento en UNA palabra: factura, contrato, informe, carta, cv, otro. Solo responde la palabra.\n\n{text_sample}"
                }
            ],
            "max_tokens": 20
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        
        result = response.json()
        classification = result["choices"][0]["message"]["content"].strip().lower()
        
        # Validar que sea una clasificación válida
        valid = ["factura", "contrato", "informe", "carta", "cv", "otro"]
        if classification in valid:
            return classification
        return "otro"
    
    async def extract_structured_cv_async(self, text: str) -> dict:
        """
        Pide a Mistral que extraiga del texto del CV un JSON con nombre, email, teléfono,
        experiencia, educación y habilidades. Devuelve un diccionario (dict).
        """

        if not text or len(text.strip()) < 20:
            return {}

        text_sample = text[:6000] if len(text) > 6000 else text

        prompt = """Extrae del siguiente texto de un CV/currículum y devuelve ÚNICAMENTE un JSON válido, sin markdown ni texto extra.
El JSON debe tener exactamente estas claves (usa null si no hay dato):
- "name": string (nombre completo)
- "email": string
- "phone": string
- "experience": array de objetos con "role", "company", "period", "description"
- "education": array de objetos con "title", "institution", "period"
- "skills": array de strings

Texto del CV:
"""
        payload = {
            "model": "mistral-small-latest",
            "messages": [
                {
                    "role": "user",
                    "content": prompt + text_sample
                }
            ],
            "max_tokens": 1500
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]