using System.Text.Json;
using static System.Net.Mime.MediaTypeNames;
using static System.Net.WebRequestMethods;

namespace BackOCRIa.Service
{
    public class MistralAiService : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string BaseUrl = "https://api.mistral.ai/v1";

        public MistralAiService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["Mistral:ApiKey"] ?? throw new InvalidOperationException("Mistral:ApiKey no configurada.");
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        }

        public async Task<string> GetSummaryAsync(string text, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(text)) return "Sin texto para resumir.";
            var payload = new
            {
                model = "mistral-small-latest",
                messages = new[]
                {
                    new { role = "user", content = $"Resume de forma breve y clara el siguiente texto:\n\n{text}" }
                },
                max_tokens = 500
            };
            var response = await _httpClient.PostAsJsonAsync($"{BaseUrl}/chat/completions", payload, ct);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
            return json.GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";
        }

        public async Task<string> ClassifyDocumentAsync(string text, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(text)) return "Desconocido";
            var payload = new
            {
                model = "mistral-small-latest",
                messages = new[]
                {
                new { role = "user", content = $"Clasifica este documento en UNA palabra: factura, contrato, informe, carta, otro. Solo responde la palabra.\n\n{text.Substring(0, Math.Min(2000, text.Length))}" }
            },
                max_tokens = 20
            };
            var response = await _httpClient.PostAsJsonAsync($"{BaseUrl}/chat/completions", payload, ct);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
            return json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()?.Trim() ?? "otro";
        }
    }
}
