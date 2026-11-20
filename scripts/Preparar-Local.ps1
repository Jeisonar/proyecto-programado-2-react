param([string]$Conexion = 'Server=localhost;Database=ProyectoProgramado2;Integrated Security=True;Encrypt=True;TrustServerCertificate=True')
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    node scripts/client.mjs install
    if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar las dependencias.' }
    dotnet user-secrets set 'ConnectionStrings:Inventario' $Conexion --project server
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo guardar la conexión local.' }
    $env:PP2_CORREO = Read-Host 'Correo para el usuario de evaluación'
    $clave = Read-Host 'Contraseña de evaluación (12 a 128 caracteres)' -AsSecureString
    $env:PP2_CONTRASENA = [pscredential]::new($env:PP2_CORREO, $clave).GetNetworkCredential().Password
    dotnet run --project server -- --inicializar
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo inicializar la base. Revise el error anterior.' }
    Write-Host 'Preparación completa. Abra ProyectoProgramado2.slnx en Visual Studio y ejecute el proyecto API.'
} finally {
    Remove-Item Env:PP2_CONTRASENA -ErrorAction SilentlyContinue
    Remove-Item Env:PP2_CORREO -ErrorAction SilentlyContinue
    Pop-Location
}
