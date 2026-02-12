using BackOCRIa.Models;
using BackOCRIa.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackOCRIa.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IPythonService _pythonService;
    // private readonly IOcrService _ocrService;  // Ya no se usa
    // private readonly IAiService _aiService;   // Ya no se usa
    private static readonly string[] AllowedContentTypes = {
        "application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "image/avif"
    };
    private const long MaxBytes = 50 * 1024 * 1024;

    public DocumentsController(IPythonService pythonService)
    {
        _pythonService = pythonService;
    }

    [HttpPost("process")]
    [RequestSizeLimit(MaxBytes)]
    public async Task<ActionResult<ProcessDocumentResponse>> ProcessDocument(IFormFile file, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No se envió ningún archivo.");

        if (!AllowedContentTypes.Contains(file.ContentType))
            return BadRequest($"Tipo no permitido: {file.ContentType}.");

        if (file.Length > MaxBytes)
            return BadRequest("El archivo supera el límite de 50 MB.");

        await using var stream = file.OpenReadStream();
        
        // Llamar al servicio Python
        var result = await _pythonService.ProcessDocumentAsync(stream, file.FileName, file.ContentType, ct);

        // TODO: Guardar en DB si quieres persistir los resultados
        // await _dbContext.Documents.AddAsync(...);
        // await _dbContext.SaveChangesAsync(ct);

        return Ok(result);
    }
}