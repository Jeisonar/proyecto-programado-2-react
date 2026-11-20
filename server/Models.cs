using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace ProyectoProgramado2;

public sealed class InventarioDb(DbContextOptions<InventarioDb> options) : DbContext(options)
{
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Producto>().ToTable("PP2_Productos");
        model.Entity<Producto>().Property(p => p.Precio).HasPrecision(18, 2);
        model.Entity<Usuario>().ToTable("PP2_Usuarios");
        model.Entity<Usuario>().HasIndex(u => u.Correo).IsUnique();
    }
}
public sealed class Producto
{
    public int Id { get; set; }
    [MaxLength(120)] public required string Nombre { get; set; }
    [MaxLength(60)] public required string Categoria { get; set; }
    public decimal Precio { get; set; }
    public int Existencias { get; set; }
    [MaxLength(500)] public string Descripcion { get; set; } = "";
    public DateTime ActualizadoUtc { get; set; } = DateTime.UtcNow;
    public void Aplicar(ProductoSolicitud datos)
    {
        Nombre = datos.Nombre.Trim(); Categoria = datos.Categoria.Trim();
        Precio = datos.Precio!.Value; Existencias = datos.Existencias!.Value;
        Descripcion = datos.Descripcion?.Trim() ?? ""; ActualizadoUtc = DateTime.UtcNow;
    }
}
public sealed class Usuario
{
    public int Id { get; set; }
    [MaxLength(254)] public required string Correo { get; set; }
    [MaxLength(512)] public required string HashContrasena { get; set; }
}
public sealed record LoginSolicitud(
    [Required, EmailAddress, StringLength(254)] string Correo,
    [Required, StringLength(128)] string Contrasena);
public sealed record ProductoSolicitud(
    [Required, StringLength(120)] string Nombre,
    [Required, StringLength(60)] string Categoria,
    [Required, Range(typeof(decimal), "0.01", "999999999.99")] decimal? Precio,
    [Required, Range(0, 1000000)] int? Existencias,
    [StringLength(500)] string? Descripcion) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (Precio is decimal p && decimal.Round(p, 2) != p)
            yield return new ValidationResult("El precio admite hasta dos decimales.", [nameof(Precio)]);
    }
}
