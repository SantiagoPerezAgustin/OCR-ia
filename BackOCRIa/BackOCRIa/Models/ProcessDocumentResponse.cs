using System.Text.Json.Serialization;

namespace BackOCRIa.Models
{
    public class ProcessDocumentResponse
    {
        [JsonPropertyName("extracted_text")]
        public string ExtractedText { get; set; } = string.Empty;
        [JsonPropertyName("summary")]
        public string Summary { get; set; } = string.Empty;
        [JsonPropertyName("classification")]
        public string Classification { get; set; } = string.Empty;
        [JsonPropertyName("structured_data")]
        public StructuredCvDataDto? StructuredData { get; set; }
    }

    /// <summary>
/// Espejo del JSON que devuelve Python (structured_data).
/// </summary>

    public class StructuredCvDataDto
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }
        [JsonPropertyName("email")]
        public string? Email { get; set; }
        [JsonPropertyName("phone")]
        public string? Phone { get; set; }
        [JsonPropertyName("experience")]
        public List<ExperienceItemDto>? Experiences { get; set; }
        [JsonPropertyName("education")]
        public List<EducationItemDto>? Education { get; set; }
        [JsonPropertyName("skills")]
        public List<string>? Skills { get; set; }
    }

    public class ExperienceItemDto
    {
        [JsonPropertyName("role")] public string? Role { get; set; }
        [JsonPropertyName("company")] public string? Company { get; set; }
        [JsonPropertyName("period")] public string? Period { get; set; }
        [JsonPropertyName("description")] public string? Description { get; set; }
    }

    public class EducationItemDto
    {
        [JsonPropertyName("title")] public string? Title { get; set; }
        [JsonPropertyName("institution")] public string? Institution { get; set; }
        [JsonPropertyName("period")] public string? Period { get; set; }
    }
}
