using BackOCRIa.Data;
using BackOCRIa.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackOCRIa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CandidatesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CandidatesController(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Guarda un candidato en la base de datos (datos extraídos del CV).
        /// </summary>
        
        [HttpPost]
        public async Task<ActionResult<Candidate>> Post([FromBody] CandidateInput input, CancellationToken ct = default)
        {
            var candidate = new Candidate
            {
                Name = input.Name ?? "",
                Email = input.Email,
                Phone = input.Phone,
                ExperinceJson = input.ExperinceJson,
                EducationJson = input.EducationJson,
                SkillsJson = input.SkillsJson,
                ExtractedText = input.ExtractedText,
                Summary = input.Summary,
                Classification = input.Classification
            };
            _db.Candidates.Add(candidate);
            await _db.SaveChangesAsync(ct);
            return CreatedAtAction(nameof(GetById), new { id = candidate.Id }, candidate);

        }


        /// <summary>
        /// Obtiene un candidato por Id.
        /// </summary>
        
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Candidate>> GetById(int id, CancellationToken ct = default)
        {
            var c = await _db.Candidates.FindAsync([id], ct);
            if (c == null) return NotFound();
            return Ok(c);
        }

        /// <summary>
        /// Lista todos los candidatos (más recientes primero).
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<Candidate>>> GetAll(CancellationToken ct = default)
        {
            var list = await _db.Candidates
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync(ct);
            return Ok(list);
        }

        /// <summary>
        /// Elimina un candidato por Id.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id, CancellationToken ct = default)
        {
            var c = await _db.Candidates.FindAsync([id], ct);
            if (c == null) return NotFound();
            _db.Candidates.Remove(c);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }
    }
}
