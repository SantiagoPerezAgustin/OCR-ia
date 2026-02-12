import os
import requests
from typing import Optional

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