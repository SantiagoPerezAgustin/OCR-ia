using BackOCRIa.Models;

namespace BackOCRIa.Services;

public interface IPythonService
{
    Task<ProcessDocumentResponse> ProcessDocumentAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
}