using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackOCRIa.Migrations
{
    /// <inheritdoc />
    public partial class RenameExperienceJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "summary",
                table: "Candidates",
                newName: "Summary");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Summary",
                table: "Candidates",
                newName: "summary");
        }
    }
}
