namespace BackOCRIa.Service
{
    public interface IOcrService
    {
        Task<string> ExtractTextAsync(Stream fileStream, string contentType, CancellationToken ct = default);
    }
}
