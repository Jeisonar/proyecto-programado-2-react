# Proyecto programado 2 · Estante

Aplicación de inventario de productos desarrollada en **React y TypeScript**, con una **API REST en ASP.NET Core 10**, Entity Framework Core y **Microsoft SQL Server**. La solución se abre en Visual Studio. El repositorio es independiente de los proyectos anteriores.

Repositorio: [Jeisonar/proyecto-programado-2-react](https://github.com/Jeisonar/proyecto-programado-2-react), rama `main`.

- Aplicación React: https://estante-proyecto2.tryasp.net/
- API utilizada: https://estante-proyecto2.tryasp.net/api/productos
- Swagger: https://estante-proyecto2.tryasp.net/swagger/
- Salud de la API y SQL Server: https://estante-proyecto2.tryasp.net/api/salud

El alojamiento de esta entrega es MonsterASP.NET. React y la API se publican juntos; la base SQL Server remota es independiente de la base de desarrollo local. Las credenciales de evaluación se entregan por separado.

## Funcionalidades

- Inicio de sesión validado por `POST /api/auth/login`, con contraseña almacenada como hash y token de una hora.
- Listado de todos los productos y consulta individual por identificador.
- Formularios para agregar y editar nombre, categoría, precio en colones, existencias y descripción opcional.
- Eliminación con confirmación explícita en un diálogo que identifica el producto.
- Validaciones en React y en la API. Mensajes de éxito, credenciales inválidas, sesión vencida, producto inexistente, problemas de conexión y errores de SQL Server.
- Búsqueda dentro del listado, filtro de categorías y resumen del inventario. Diseño adaptable a teléfonos y escritorio.

**Los productos se guardan en SQL Server.** React realiza todas las consultas y modificaciones mediante solicitudes HTTP a la API. `sessionStorage` conserva únicamente la sesión de la pestaña, nunca el catálogo.

## Requisitos

- Visual Studio 2026 (o una versión compatible con .NET 10 y `.slnx`), con desarrollo web de ASP.NET.
- .NET SDK 10, SQL Server y Node.js 22.13 o posterior con npm.
- En este PC, `scripts/client.mjs` también reconoce npm incluido con Visual Studio 18 Community.

## Instalar y ejecutar localmente

1. Abra una terminal PowerShell en la raíz del repositorio y ejecute:

   ```powershell
   ./scripts/Preparar-Local.ps1
   ```

   El script instala las dependencias de React, guarda la conexión local en los secretos de usuario de .NET y solicita un correo y una contraseña de prueba de al menos 12 caracteres. Crea la base **ProyectoProgramado2**, sus tablas y ocho productos de ejemplo si no existen. Requiere permisos para crear la base en SQL Server. No sobrescribe usuarios ni productos existentes.

2. Abra **ProyectoProgramado2.slnx** en Visual Studio. El proyecto de inicio es `ProyectoProgramado2.Api`. Ejecute con **F5** o **Ctrl+F5**. La compilación incluye React automáticamente.

   Alternativamente:

   ```powershell
   dotnet run --project server
   ```

3. Abra [la aplicación local](http://localhost:5082). La API y [Swagger](http://localhost:5082/swagger) están en el mismo servidor. Ingrese con el usuario creado en el paso 1.

Para una instancia distinta de SQL Server:

```powershell
./scripts/Preparar-Local.ps1 -Conexion 'Server=.\SQLEXPRESS;Database=ProyectoProgramado2;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
```

La confianza en el certificado del ejemplo se limita al SQL Server local de desarrollo. Para producción use la cadena segura que entregue el proveedor, con TLS y validación del certificado.

## Desarrollo de React con recarga automática

Mantenga la API en `http://localhost:5082`. En otra terminal:

```powershell
npm ci
npm run dev
```

Abra [Vite](http://127.0.0.1:5173). Vite reenvía `/api` a ASP.NET Core. En este PC, si npm no está en PATH, use `node scripts/client.mjs install` y `node scripts/client.mjs dev`.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/login` | Validar `{ correo, contrasena }`; devuelve `accessToken` y `expiresIn`. |
| GET | `/api/productos` | Listar todos los productos. |
| GET | `/api/productos/{id}` | Consultar por identificador; 404 si no existe. |
| POST | `/api/productos` | Agregar; devuelve 201 y el producto con su ID. |
| PUT | `/api/productos/{id}` | Actualizar; devuelve 200. |
| DELETE | `/api/productos/{id}` | Eliminar; devuelve 204. |
| GET | `/api/salud` | Verificar disponibilidad de API y acceso a la tabla en SQL Server. |

Todos los endpoints de productos requieren `Authorization: Bearer <accessToken>`. Solicitud de alta y edición:

```json
{
  "nombre": "Cuaderno A5",
  "categoria": "Papelería",
  "precio": 4500.50,
  "existencias": 20,
  "descripcion": "80 hojas, tapa dura"
}
```

Nombre: obligatorio, hasta 120 caracteres. Categoría: obligatoria, hasta 60. Precio: de 0.01 a 999999999.99, hasta dos decimales. Existencias: entero de 0 a 1000000. Descripción: opcional, hasta 500 caracteres. Los textos obligatorios no aceptan espacios en blanco. La API devuelve 400 ante valores inválidos, 401 sin autenticación válida y 429 ante más de diez intentos de acceso por minuto desde la misma IP.

## Compilar y publicar

```powershell
./scripts/Publicar.ps1
```

Genera `artifacts/hosting/` y `artifacts/proyecto-programado-2-hosting.zip`, con la API y la aplicación React compilada. Consulte [PUBLICACION.md](docs/PUBLICACION.md) para configurar el alojamiento y la base remota. Las contraseñas, la conexión y los perfiles de publicación con credenciales se excluyen de Git.

Puede publicar React por separado definiendo `VITE_API_URL` antes de compilar y agregando su origen HTTPS a `Cors:Origins` en el servidor. La publicación conjunta funciona en el mismo origen y no requiere CORS.

## Verificación

```powershell
$env:PP2_URL = 'http://localhost:5082'
$env:PP2_CORREO = Read-Host 'Correo de prueba'
$clave = Read-Host 'Contraseña de prueba' -AsSecureString
$env:PP2_CONTRASENA = [pscredential]::new($env:PP2_CORREO, $clave).GetNetworkCredential().Password
try { node scripts/test-api.mjs }
finally { Remove-Item Env:PP2_CONTRASENA }
```

El verificador hace login, revisa validaciones y acceso protegido, crea un producto temporal, lo consulta y actualiza, comprueba la persistencia en nuevas solicitudes y lo elimina. No altera los productos existentes. La verificación de interfaz y el estado real de publicación se registran en [VERIFICACION.md](docs/VERIFICACION.md).

## Estructura

```text
ProyectoProgramado2.slnx   Solución para Visual Studio
client/src/               Interfaz React, validación y cliente HTTP
server/                   API, autenticación y modelo SQL Server
scripts/                  Instalación, compilación y verificador
docs/                     Publicación y evidencias
dist/                     React compilado (generado, excluido de Git)
```

Credenciales de evaluación: se entregan por separado. `docs/ACCESO-PRUEBAS.local.txt` es un archivo local excluido del repositorio y de los ZIP de código fuente.
