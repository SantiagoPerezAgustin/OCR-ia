using BackOCRIa.DTO;
using System.Text.Json;

namespace BackOCRIa.Service
{
    public class JobsSearchService : IJobsSearchService
    {
        private readonly HttpClient _httpClient;
        private static readonly JsonSerializerOptions SnakeCase = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            PropertyNameCaseInsensitive = true
        };

        public JobsSearchService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<JobSearchResponseDto> SearchJobsWithMatchAsync(JobSearchRequestDto request, CancellationToken ct = default)
        {
            var response = await _httpClient.PostAsJsonAsync("jobs/search", request, SnakeCase, ct);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<JobSearchResponseDto>(SnakeCase, ct);
            return result ?? new JobSearchResponseDto();
        }
    }
}
