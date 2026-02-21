import os
import requests
from typing import List
from pathlib import Path
from dotenv import load_dotenv

# Cargar .env de la carpeta del proyecto (ocr-python-service) aunque uvicorn se ejecute desde otra ruta
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

class JobsService:
    def __init__(self):
        self.adzuna_app_id = os.getenv("ADZUNA_APP_ID", "")
        self.adzuna_app_key = os.getenv("ADZUNA_APP_KEY", "")
        self.base_url = "https://api.adzuna.com/v1/api/jobs"

    def search_jobs(self, query: str, country: str = "gb", max_results: int = 10) -> List[dict]:
        """Busca trabajos en Adzuna. query = 'python developer' o skills."""
        if not self.adzuna_app_id or not self.adzuna_app_key:
            print("ADVERTENCIA: ADZUNA_APP_ID o ADZUNA_APP_KEY no configurados. No se buscan ofertas.")
            return []
        url = f"{self.base_url}/{country}/search/1"
        params = {
            "app_id": self.adzuna_app_id,
            "app_key": self.adzuna_app_key,
            "what": query,
            "results_per_page": max_results,
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        return [
            {
                "title": r.get("title", ""),
                "company": r.get("company", {}).get("display_name", "") if isinstance(r.get("company"), dict) else str(r.get("company", "")),
                "description": r.get("description", ""),
                "url": r.get("redirect_url", r.get("url", "")),
                "location": r.get("location", {}).get("display_name", "") if isinstance(r.get("location"), dict) else str(r.get("location", "")),
            }
            for r in results
        ]