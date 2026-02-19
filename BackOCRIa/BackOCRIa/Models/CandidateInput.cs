namespace BackOCRIa.Models
{
    public class CandidateInput
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? ExperinceJson { get; set; }
        public string? EducationJson { get; set; }
        public string? SkillsJson { get; set; }
        public string? ExtractedText { get; set; }
        public string? Summary { get; set; }
        public string? Classification { get; set; }
    }
}
