namespace BackOCRIa.Models
{
    public class ProcessDocumentResponse
    {
        public string ExtractedText { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Classification { get; set; } = string.Empty;
    }
}
