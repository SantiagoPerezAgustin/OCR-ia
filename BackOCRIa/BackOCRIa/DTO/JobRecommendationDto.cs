namespace BackOCRIa.DTO
{
    public class JobSearchRequestDto
    {
        public string Summary { get; set; } = "";
        public List<string> Skills { get; set; } = new();
        public string? CurrentRole { get; set; }
    }
    public class JobRecommendationDto
    {
        public string Summary { get; set; } = "";
        public List<string> Skills { get; set; } = new();
        public string? CurrentRole { get; set; }
    }

    public class JobOfferWithMatchDto
    {
        public string Title { get; set; } = "";
        public string Company { get; set; } = "";
        public string? Description { get; set; }
        public string? Url { get; set; }
        public string? Location { get; set; }
        public int MatchPercentage { get; set; }
        public List<string> MissingSkills { get; set; } = new();
        public string? CustomPitch { get; set; }
    }

    public class JobSearchResponseDto
    {
        public List<JobOfferWithMatchDto> Offers { get; set; } = new();
    }

    /// <summary>Recomendación guardada (para GET de la API).</summary>
    public class RecommendationItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Company { get; set; } = "";
        public string? Description { get; set; }
        public string? Url { get; set; }
        public string? Location { get; set; }
        public int MatchPercentage { get; set; }
        public List<string> MissingSkills { get; set; } = new();
        public string? CustomPitch { get; set; }
    }
}
