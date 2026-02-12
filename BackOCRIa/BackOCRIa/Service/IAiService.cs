namespace BackOCRIa.Service
{
    public interface IAiService
    {
        Task<string> GetSummaryAsync(string text, CancellationToken ct = default);
        Task<string> ClassifyDocumentAsync(string text, CancellationToken ct = default);
    }
}
