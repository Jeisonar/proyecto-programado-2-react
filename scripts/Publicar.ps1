param([switch]$Autocontenida)
$ErrorActionPreference = 'Stop'
$raizProyecto = Split-Path $PSScriptRoot -Parent
Push-Location $raizProyecto
try {
    $destino = Join-Path $raizProyecto 'artifacts/hosting'
    # Use a new folder on each publish so stale assets never reach the server.
    if (Test-Path -LiteralPath $destino) {
        $resuelto = (Resolve-Path -LiteralPath $destino).Path
        $permitido = Join-Path $raizProyecto 'artifacts'
        if (-not $resuelto.StartsWith($permitido + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Ruta de publicación fuera de artifacts.' }
        Remove-Item -LiteralPath $resuelto -Recurse -Force
    }
    $argumentos = @('publish', 'server/ProyectoProgramado2.Api.csproj', '-c', 'Release', '-o', $destino)
    if ($Autocontenida) { $argumentos += @('-r', 'win-x64', '--self-contained', 'true') }
    dotnet @argumentos
    if ($LASTEXITCODE -ne 0) { throw 'La publicación no compiló.' }
    if (-not (Test-Path -LiteralPath (Join-Path $destino 'wwwroot/index.html'))) { throw 'Falta la compilación de React en wwwroot.' }
    $archivo = Join-Path $raizProyecto 'artifacts/proyecto-programado-2-hosting.zip'
    Compress-Archive -Path (Join-Path $destino '*') -DestinationPath $archivo -Force
    Write-Host "Paquete listo: $archivo"
} finally { Pop-Location }
