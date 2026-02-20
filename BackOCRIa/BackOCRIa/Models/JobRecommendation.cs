namespace BackOCRIa.Models
{
    public class JobRecommendation
    {
        public int Id { get; set; }
        public int CandidateId { get; set; }
        public Candidate? Candidate { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Url { get; set; }
        public string? Location { get; set; }
        public int MatchPercentage { get; set; }
        public string? MissingSkillsJson { get; set; }
        public string? CustomPitch { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
