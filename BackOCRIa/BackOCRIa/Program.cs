using BackOCRIa.Data;
using BackOCRIa.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://localhost:7223")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Servicio Python (cliente HTTP)
builder.Services.AddHttpClient<IPythonService, PythonService>(client =>
{
    var baseUrl = builder.Configuration["PythonService:BaseUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromMinutes(5); // OCR puede tardar
});

// Ya no necesitas estos servicios si todo va a Python:
// builder.Services.AddScoped<IOcrService, OcrService>();
// builder.Services.AddHttpClient<IAiService, MistralAiService>();

var app = builder.Build();

// Preflight (OPTIONS): responder aquí con 204 + CORS para que NADA más toque la petición (evita redirect).
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Method == "OPTIONS" && ctx.Request.Path.StartsWithSegments("/api"))
    {
        var origin = ctx.Request.Headers.Origin;
        if (origin == "http://localhost:5173" || origin == "http://localhost:3000" || origin == "https://localhost:7223")
            ctx.Response.Headers.Append("Access-Control-Allow-Origin", origin);
        ctx.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        ctx.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Authorization");
        ctx.Response.Headers.Append("Access-Control-Max-Age", "86400");
        ctx.Response.StatusCode = 204;
        return;
    }
    await next();
});

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Redirección HTTPS desactivada: con ella, el preflight (OPTIONS) recibe 307 y el navegador bloquea CORS.
// app.UseHttpsRedirection();

app.UseAuthorization();

// OPTIONS (preflight) antes de MapControllers para que el navegador reciba 204 + CORS sin redirección.
app.MapMethods("/api/{*path}", new[] { "OPTIONS" }, () => Results.NoContent()).AllowAnonymous();
app.MapControllers();

app.Run();