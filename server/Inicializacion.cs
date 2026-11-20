using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ProyectoProgramado2;
public static class Inicializacion
{
    public static async Task Ejecutar(IServiceProvider servicios)
    {
        var correo = Environment.GetEnvironmentVariable("PP2_CORREO")?.Trim().ToLowerInvariant();
        var clave = Environment.GetEnvironmentVariable("PP2_CONTRASENA");
        if (string.IsNullOrWhiteSpace(correo) || !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(correo) || clave is null || clave.Length is < 12 or > 128)
            throw new InvalidOperationException("Defina PP2_CORREO y PP2_CONTRASENA (12 a 128 caracteres) antes de inicializar.");
        using var scope = servicios.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<InventarioDb>();
        await db.Database.EnsureCreatedAsync();
        if (!await db.Usuarios.AnyAsync(u => u.Correo == correo))
        {
            var usuario = new Usuario { Correo = correo, HashContrasena = "" };
            usuario.HashContrasena = scope.ServiceProvider.GetRequiredService<IPasswordHasher<Usuario>>().HashPassword(usuario, clave);
            db.Usuarios.Add(usuario);
        }
        if (!await db.Productos.AnyAsync()) db.Productos.AddRange(
            new Producto { Nombre = "Cuaderno de puntos A5", Categoria = "Papelería", Precio = 4500, Existencias = 32, Descripcion = "80 hojas, tapa dura y papel de 90 g." },
            new Producto { Nombre = "Lámpara de escritorio", Categoria = "Hogar", Precio = 18900, Existencias = 12, Descripcion = "Luz LED regulable con brazo articulado." },
            new Producto { Nombre = "Audífonos inalámbricos", Categoria = "Tecnología", Precio = 24900, Existencias = 8, Descripcion = "Conexión Bluetooth y estuche de carga." },
            new Producto { Nombre = "Botella térmica 750 ml", Categoria = "Accesorios", Precio = 12500, Existencias = 24, Descripcion = "Acero inoxidable, color verde." },
            new Producto { Nombre = "Bolígrafos de gel · 6 unidades", Categoria = "Papelería", Precio = 3200, Existencias = 45 },
            new Producto { Nombre = "Teclado compacto", Categoria = "Tecnología", Precio = 22500, Existencias = 4, Descripcion = "Distribución en español y conexión USB." },
            new Producto { Nombre = "Organizador de escritorio", Categoria = "Hogar", Precio = 8900, Existencias = 0 },
            new Producto { Nombre = "Bolso de tela", Categoria = "Accesorios", Precio = 6500, Existencias = 18 });
        await db.SaveChangesAsync();
        Console.WriteLine("Base SQL Server inicializada. Usuario creado si no existía; no se modificaron contraseñas ni productos existentes.");
    }
}
