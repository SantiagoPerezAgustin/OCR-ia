using System.Text.Json;
using BackOCRIa.Data;
using BackOCRIa.DTO;
using BackOCRIa.Models;
using BackOCRIa.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackOCRIa.Controllers;

[ApiController]
[Route("api/candidates/{candidateId:int}/recommendations")]
public class JobRecommendationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJobsSearchService _jobsSearch;

    public JobRecommendationsController(AppDbContext db, IJobsSearchService jobsSearch)
    {
        _db = db;
        _jobsSearch = jobsSearch;
    }

    /// <summary>Lista las ofertas recomendadas guardadas para el candidato.</summary>
    [HttpGet]
    public async Task<ActionResult<List<RecommendationItemDto>>> GetAll(int candidateId, CancellationToken ct = default)
    {
        var list = await _db.JobRecommendations
            .Where(j => j.CandidateId == candidateId)
            .OrderByDescending(j => j.MatchPercentage)
            .ToListAsync(ct);
        var dtos = list.Select(j => new RecommendationItemDto
        {
            Id = j.Id,
            Title = j.Title,
            Company = j.Company,
            Description = j.Description,
            Url = j.Url,
            Location = j.Location,
            MatchPercentage = j.MatchPercentage,
            MissingSkills = ParseJsonList(j.MissingSkillsJson),
            CustomPitch = j.CustomPitch,
        }).ToList();
        return Ok(dtos);
    }

    /// <summary>Busca ofertas con Python, las guarda y las devuelve.</summary>
    [HttpPost]
    public async Task<ActionResult<List<RecommendationItemDto>>> SearchAndSave(int candidateId, CancellationToken ct = default)
    {
        var candidate = await _db.Candidates.FindAsync(new object[] { candidateId }, ct);
        if (candidate == null)
            return NotFound();

        var skills = ParseJsonList(candidate.SkillsJson);
        var request = new JobSearchRequestDto
        {
            Summary = candidate.Summary ?? "",
            Skills = skills,
            CurrentRole = null,
        };
        var response = await _jobsSearch.SearchJobsWithMatchAsync(request, ct);
        if (response.Offers == null || response.Offers.Count == 0)
            return Ok(new List<RecommendationItemDto>());

        foreach (var offer in response.Offers)
        {
            var rec = new JobRecommendation
            {
                CandidateId = candidateId,
                Title = offer.Title ?? "",
                Company = offer.Company ?? "",
                Description = offer.Description,
                Url = offer.Url,
                Location = offer.Location,
                MatchPercentage = offer.MatchPercentage,
                MissingSkillsJson = offer.MissingSkills == null || offer.MissingSkills.Count == 0
                    ? null
                    : JsonSerializer.Serialize(offer.MissingSkills),
                CustomPitch = offer.CustomPitch,
            };
            _db.JobRecommendations.Add(rec);
        }
        await _db.SaveChangesAsync(ct);

        var saved = await _db.JobRecommendations
            .Where(j => j.CandidateId == candidateId)
            .OrderByDescending(j => j.CreatedAt)
            .Take(response.Offers.Count)
            .ToListAsync(ct);
        var result = saved.Select(j => new RecommendationItemDto
        {
            Id = j.Id,
            Title = j.Title,
            Company = j.Company,
            Description = j.Description,
            Url = j.Url,
            Location = j.Location,
            MatchPercentage = j.MatchPercentage,
            MissingSkills = ParseJsonList(j.MissingSkillsJson),
            CustomPitch = j.CustomPitch,
        }).ToList();
        return Ok(result);
    }

    private static List<string> ParseJsonList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try
        {
            var list = JsonSerializer.Deserialize<List<string>>(json);
            return list ?? new List<string>();
        }
        catch { return new List<string>(); }
    }
}