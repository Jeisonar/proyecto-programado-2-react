# Publicación de React, API y SQL Server

La aplicación está preparada para publicarse como un único sitio ASP.NET Core: la API atiende `/api`, React se sirve desde `wwwroot` y Swagger está en `/swagger`. El sitio público y la API comparten dominio; no es necesario un proxy externo ni CORS.

## Alojamiento seleccionado

MonsterASP.NET ofrece alojamiento de ASP.NET Core y una base Microsoft SQL Server en su plan gratuito. La cuenta y la activación corresponden al propietario del proyecto. Verifique las condiciones vigentes en el [sitio oficial](https://www.monsterasp.net/) y la [documentación](https://help.monsterasp.net/).

## Publicación de esta entrega

La dirección principal es **https://estante-proyecto2.tryasp.net/** y la documentación de la API está en **https://estante-proyecto2.tryasp.net/swagger/**. Se usa ASP.NET Core 10 con una base SQL Server 2025 del mismo alojamiento, tablas `PP2_Productos` y `PP2_Usuarios`, y la conexión `ConnectionStrings__Inventario` configurada en las variables privadas del servidor. La conexión SQL utiliza TLS con validación del certificado.

La base se inicializó desde el editor T-SQL del panel, con el esquema de la aplicación, ocho productos de ejemplo y la contraseña de evaluación como hash de ASP.NET Core Identity. El ZIP compilado se subió fuera de la carpeta pública y se extrajo en `/wwwroot`; React queda en la subcarpeta `wwwroot` del paquete ASP.NET Core. No es necesario subir las credenciales de SQL en el ZIP.

El dominio gratuito alternativo `tryasp.net` permite acceder desde la red de desarrollo, cuyo DNS no resuelve `runasp.net`. El estado y las pruebas realizadas se detallan en [VERIFICACION.md](VERIFICACION.md).

## Pasos

1. Cree y active una cuenta del alojamiento. Cree un sitio para ASP.NET Core 10 y una base **SQL Server vacía**, dedicada a este proyecto.
2. Obtenga la cadena de conexión desde el panel. Manténgala fuera del repositorio. Use TLS con validación del certificado del proveedor.
3. Inicialice la base remota desde su PC, con el acceso remoto autorizado por el proveedor. En PowerShell, desde la raíz:

   ```powershell
   $env:ConnectionStrings__Inventario = Read-Host 'Cadena de conexión de la base remota'
   $env:PP2_CORREO = Read-Host 'Correo del usuario de evaluación'
   $clave = Read-Host 'Contraseña de evaluación' -AsSecureString
   $env:PP2_CONTRASENA = [pscredential]::new($env:PP2_CORREO, $clave).GetNetworkCredential().Password
   try {
       dotnet run --project server -- --inicializar
       if ($LASTEXITCODE -ne 0) { throw 'La inicialización falló.' }
   } finally {
       Remove-Item Env:PP2_CONTRASENA
       Remove-Item Env:ConnectionStrings__Inventario
   }
   ```

   La variable de entorno tiene prioridad sobre la conexión local de los secretos de usuario. No se reemplazan los datos existentes.

4. Ejecute `./scripts/Publicar.ps1`. Si el proveedor no ofrece el runtime .NET 10, y permite aplicaciones IIS de 64 bits, use `./scripts/Publicar.ps1 -Autocontenida`.
5. Configure `ConnectionStrings__Inventario` como variable de entorno del sitio. Si el panel no permite variables, agregue `<environmentVariables><environmentVariable name="ConnectionStrings__Inventario" value="CADENA_DEL_PROVEEDOR" /></environmentVariables>` dentro del elemento `aspNetCore` del **web.config publicado**, conservando los atributos generados. Escape los caracteres XML al insertar la cadena. No guarde esa copia con credenciales en Git.
6. Suba **el contenido** de `artifacts/hosting/` a la raíz de la aplicación del sitio, o importe el perfil Web Deploy del proveedor en Visual Studio. Conserve ese perfil fuera de Git. No suba el código fuente como sustituto del paquete compilado.
7. Active HTTPS desde el panel del alojamiento. Mantenga `ASPNETCORE_ENVIRONMENT=Production` (valor predeterminado).
8. Abra la aplicación pública y `/swagger`. Ejecute el verificador contra la URL HTTPS y pruebe las seis funcionalidades desde la interfaz publicada. Comparta la cuenta de evaluación, nunca las credenciales de SQL Server o del alojamiento.

## React publicado por separado

Si se usa otro host para React, defina `VITE_API_URL=https://DOMINIO_API` antes de `npm run build` y publique `dist/` como SPA. La API debe configurar `Cors__Origins__0=https://DOMINIO_REACT` y conservar HTTPS. Las variables `VITE_*` son públicas: no incluya contraseñas ni cadenas SQL en ellas.

## Elementos de entrega

- URL pública HTTPS de React.
- URL base de la API y enlace a Swagger.
- Repositorio de GitHub y rama, o ZIP de código fuente.
- Correo y contraseña del usuario de evaluación, por separado.
- Instrucciones locales en el README y evidencia real en VERIFICACION.md.

El desarrollo local y la generación del paquete no verifican el funcionamiento del sitio publicado. Esa comprobación debe hacerse después de configurar y desplegar el alojamiento.
