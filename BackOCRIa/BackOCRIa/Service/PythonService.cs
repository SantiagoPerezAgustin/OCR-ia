using System.Net.Http.Json;
using BackOCRIa.Models;

namespace BackOCRIa.Services;

public class PythonService : IPythonService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly string _pythonServiceUrl;

    public PythonService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
        _pythonServiceUrl = config["PythonService:BaseUrl"] ?? "http://localhost:8000";
    }

    public async Task<ProcessDocumentResponse> ProcessDocumentAsync(
        Stream fileStream, 
        string fileName, 
        string contentType, 
        CancellationToken ct = default)
    {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);
        streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
        content.Add(streamContent, "file", fileName);

        var response = await _httpClient.PostAsync($"{_pythonServiceUrl}/process", content, ct);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ProcessDocumentResponse>(ct);
        return result ?? throw new InvalidOperationException("Respuesta vacía del servicio Python");
    }
}