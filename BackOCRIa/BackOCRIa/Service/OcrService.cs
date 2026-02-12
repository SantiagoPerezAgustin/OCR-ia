using Tesseract;
using Microsoft.AspNetCore.Hosting;
using UglyToad.PdfPig;

namespace BackOCRIa.Service
{
    public class OcrService : IOcrService
    {
        private static readonly string[] PdfContentTypes = { "application/pdf" };
        private readonly string _tessDataPath;

        public OcrService(IWebHostEnvironment env)
        {
            _tessDataPath = Path.Combine(env.ContentRootPath, "tessdata");
        }

        public async Task<string> ExtractTextAsync(Stream fileStream, string contentType, CancellationToken ct = default)
        {
            await using var ms = new MemoryStream();
            await fileStream.CopyToAsync(ms, ct);
            ms.Position = 0;

            if (PdfContentTypes.Contains(contentType?.ToLowerInvariant()))
                return ExtractTextFromPdf(ms);

            return await ExtractTextFromImage(ms);
        }

        private static string ExtractTextFromPdf(MemoryStream ms)
        {
            try
            {
                byte[] bytes = ms.ToArray();
                using var doc = PdfDocument.Open(bytes, null);
                var text = string.Join("\n", doc.GetPages().Select(p => p.Text));
                return string.IsNullOrWhiteSpace(text) ? "[PDF sin texto seleccionable (escaneado). Prueba con una imagen.]" : text.Trim();
            }
            catch (Exception ex)
            {
                return $"[Error leyendo PDF: {ex.Message}]";
            }
        }

        private async Task<string> ExtractTextFromImage(Stream imageStream)
        {
            if (!Directory.Exists(_tessDataPath))
                return "[Configura tessdata: crea la carpeta 'tessdata' en la raíz del proyecto y añade eng.traineddata (y opcionalmente spa.traineddata). Descarga desde https://github.com/tesseract-ocr/tessdata.]";

            imageStream.Position = 0;
            var tempPath = Path.Combine(Path.GetTempPath(), $"ocr_{Guid.NewGuid()}.tmp");
            try
            {
                await using (var fs = File.Create(tempPath))
                    await imageStream.CopyToAsync(fs);

                using var engine = new TesseractEngine(_tessDataPath, "eng+spa", EngineMode.Default);
                using var img = Pix.LoadFromFile(tempPath);
                using var page = engine.Process(img);
                return page.GetText()?.Trim() ?? "";
            }
            finally
            {
                if (File.Exists(tempPath))
                    File.Delete(tempPath);
            }
        }
    }
}
