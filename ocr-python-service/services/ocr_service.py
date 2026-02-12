import pytesseract
from PIL import Image
import io
import PyPDF2

class OcrService:
    def __init__(self):
        # Configurar ruta de Tesseract si es necesario (Windows)
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

    async def extract_text_async(self, file_bytes: bytes, content_type: str) -> str:
        """
        Extrae texto de un archivo
        """
        if content_type == "application/pdf":
            return await self._extract_text_from_pdf(file_bytes)
        else:
            return await self._extract_from_image(file_bytes)

    async def _extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """
        Extrae texto de PDF. Solo funciona con PDFs que tienen texto seleccionable.
        Para PDFs escaneados, el usuario debería subir una imagen directamente.
        """
        try:
            # Intentar extraer texto nativo del PDF
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""

            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

            # Si hay texto suficiente, devolverlo
            if text.strip() and len(text.strip()) > 50:
                return text.strip()
            
            # Si no hay texto suficiente, es probablemente un PDF escaneado
            return "[PDF escaneado detectado. Por favor, convierte el PDF a imagen (PNG/JPG) y súbelo como imagen para usar OCR.]"
        
        except Exception as e:
            raise Exception(f"Error al extraer texto del PDF: {str(e)}")

    async def _extract_from_image(self, image_bytes: bytes) -> str:
        """
        Extrae texto de imagen usando Tesseract
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image, lang='eng+spa')
            return text.strip()
        except Exception as e:
            raise Exception(f"Error procesando imagen: {str(e)}")