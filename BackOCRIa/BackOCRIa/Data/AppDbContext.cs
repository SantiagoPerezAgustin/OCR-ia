using BackOCRIa.Models;
using Microsoft.EntityFrameworkCore;

namespace BackOCRIa.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }

        public DbSet<Candidate> Candidates { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Candidate>(e =>
            {
                e.HasKey(c => c.Id);
                e.Property(c => c.Name).HasMaxLength(200);
                e.Property(c => c.Email).HasMaxLength(200);
                e.Property(c => c.Phone).HasMaxLength(50);
                e.HasIndex(c => c.Email);
            });
        }
    }
}
