using BackOCRIa.DTO;

namespace BackOCRIa.Service
{
    public interface IJobsSearchService
    {
        Task<JobSearchResponseDto> SearchJobsWithMatchAsync(JobSearchRequestDto request, CancellationToken ct = default);
    }
}
