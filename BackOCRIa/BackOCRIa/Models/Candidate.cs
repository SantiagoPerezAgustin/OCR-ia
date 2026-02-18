namespace BackOCRIa.Models
{
    public class Candidate
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        /// <summary> JSON: lista de { role, company, period, description }</summary>
        public string? ExperinceJson { get; set; }
        /// <summary> JSON: lista de { degree, institution, period }</summary>
        public string? EducationJson { get; set; }
        /// <summary> JSON: lista de string </summary>
        public string? SkillsJson { get; set; }
        public string? ExtractedText { get; set; }
        public string? summary { get; set; }
        public string? Classification { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
