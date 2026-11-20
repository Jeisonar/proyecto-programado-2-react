using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace ProyectoProgramado2;

[ApiController, Route("api/auth")]
public sealed class AuthController(InventarioDb db, IPasswordHasher<Usuario> hasher) : ControllerBase
{
    [HttpPost("login"), EnableRateLimiting("login")]
    [ProducesResponseType<AccessTokenResponse>(200), ProducesResponseType(401)]
    public async Task<IActionResult> Login(LoginSolicitud solicitud, CancellationToken ct)
    {
        var correo = solicitud.Correo.Trim().ToLowerInvariant();
        var usuario = await db.Usuarios.AsNoTracking().SingleOrDefaultAsync(u => u.Correo == correo, ct);
        if (usuario is null || hasher.VerifyHashedPassword(usuario, usuario.HashContrasena, solicitud.Contrasena) == PasswordVerificationResult.Failed)
            return Unauthorized(new { mensaje = "El correo o la contraseña son incorrectos." });
        return SignIn(new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()), new Claim(ClaimTypes.Name, correo)], BearerTokenDefaults.AuthenticationScheme)), BearerTokenDefaults.AuthenticationScheme);
    }
}

[ApiController, Authorize, Route("api/productos")]
public sealed class ProductosController(InventarioDb db) : ControllerBase
{
    [HttpGet]
    public async Task<List<Producto>> Listar(CancellationToken ct) => await db.Productos.AsNoTracking().OrderBy(p => p.Id).ToListAsync(ct);
    [HttpGet("{id:int}"), ProducesResponseType<Producto>(200), ProducesResponseType(404)]
    public async Task<ActionResult<Producto>> Consultar(int id, CancellationToken ct)
    {
        var producto = await db.Productos.AsNoTracking().SingleOrDefaultAsync(p => p.Id == id, ct);
        return producto is null ? NotFound(new { mensaje = $"No existe un producto con el identificador {id}." }) : Ok(producto);
    }
    [HttpPost, ProducesResponseType<Producto>(201), ProducesResponseType(400)]
    public async Task<ActionResult<Producto>> Crear(ProductoSolicitud solicitud, CancellationToken ct)
    {
        var producto = new Producto { Nombre = "", Categoria = "" }; producto.Aplicar(solicitud);
        db.Productos.Add(producto); await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Consultar), new { id = producto.Id }, producto);
    }
    [HttpPut("{id:int}"), ProducesResponseType<Producto>(200), ProducesResponseType(404)]
    public async Task<ActionResult<Producto>> Actualizar(int id, ProductoSolicitud solicitud, CancellationToken ct)
    {
        var producto = await db.Productos.FindAsync([id], ct);
        if (producto is null) return NotFound(new { mensaje = "El producto ya no existe. Actualice el listado." });
        producto.Aplicar(solicitud);
        try { await db.SaveChangesAsync(ct); } catch (DbUpdateConcurrencyException) { return NotFound(new { mensaje = "El producto fue eliminado durante la edición." }); }
        return Ok(producto);
    }
    [HttpDelete("{id:int}"), ProducesResponseType(204), ProducesResponseType(404)]
    public async Task<IActionResult> Eliminar(int id, CancellationToken ct)
        => await db.Productos.Where(p => p.Id == id).ExecuteDeleteAsync(ct) == 0
            ? NotFound(new { mensaje = "El producto ya no existe." }) : NoContent();
}
