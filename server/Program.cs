using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using ProyectoProgramado2;

var inicializar = args.Contains("--inicializar");
var clienteLocal = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "dist"));
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args.Where(a => a != "--inicializar").ToArray(),
    WebRootPath = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development" && Directory.Exists(clienteLocal) ? clienteLocal : null
});
var conexion = builder.Configuration.GetConnectionString("Inventario")
    ?? throw new InvalidOperationException("Configure ConnectionStrings:Inventario mediante secretos de usuario o variables de entorno.");
builder.Services.AddDbContext<InventarioDb>(o => o.UseSqlServer(conexion));
builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();
builder.Services.AddAuthentication(BearerTokenDefaults.AuthenticationScheme)
    .AddBearerToken(o => o.BearerTokenExpiration = TimeSpan.FromHours(1));
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddOpenApi(o => { o.AddDocumentTransformer<SeguridadOpenApi>(); o.AddOperationTransformer<SeguridadOpenApi>(); });
builder.Services.AddProblemDetails(o => o.CustomizeProblemDetails = c =>
{
    if (c.ProblemDetails.Status >= 500) c.ProblemDetails.Title = "No se pudo completar la operación. Verifique la conexión con SQL Server o contacte al administrador.";
});
var origenes = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(origenes).AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = 429;
    o.AddPolicy("login", c => RateLimitPartition.GetFixedWindowLimiter(c.Connection.RemoteIpAddress?.ToString() ?? "local",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));
});
var app = builder.Build();
if (inicializar)
{
    await Inicializacion.Ejecutar(app.Services);
    return;
}
app.UseExceptionHandler();
if (!app.Environment.IsDevelopment()) { app.UseHsts(); app.UseHttpsRedirection(); }
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    if (ctx.Request.Path.StartsWithSegments("/api")) ctx.Response.Headers.CacheControl = "no-store";
    await next();
});
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting(); app.UseCors(); app.UseRateLimiter(); app.UseAuthentication(); app.UseAuthorization();
app.MapOpenApi();
app.UseSwaggerUI(o => { o.SwaggerEndpoint("/openapi/v1.json", "Proyecto programado 2 · API de productos"); o.DocumentTitle = "API de productos"; });
app.MapControllers();
app.MapGet("/api/salud", async (InventarioDb db, CancellationToken ct) =>
{
    await db.Productos.AsNoTracking().Select(p => p.Id).Take(1).ToListAsync(ct);
    return Results.Ok(new { estado = "Disponible", baseDatos = "SQL Server" });
});
app.MapFallbackToFile("index.html");
await app.RunAsync();
