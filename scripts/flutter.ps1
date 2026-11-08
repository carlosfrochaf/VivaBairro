# Usa o SDK existente sem modificar PATH nem instalar Android Studio.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$candidates = @(
    (Join-Path $projectRoot '.fvm\flutter_sdk\bin\flutter.bat'),
    (Join-Path $projectRoot '.tools\flutter\bin\flutter.bat'),
    (Join-Path $env:USERPROFILE 'development\flutter\bin\flutter.bat')
)
if ($env:FLUTTER_ROOT) { $candidates = @((Join-Path $env:FLUTTER_ROOT 'bin\flutter.bat')) + $candidates }
$flutterExecutable = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $flutterExecutable) { throw 'Flutter SDK não encontrado. Use a versão de .fvmrc e configure FLUTTER_ROOT ou .tools/flutter.' }
Push-Location (Join-Path $projectRoot 'mobile')
try { & $flutterExecutable @args; $result = $LASTEXITCODE } finally { Pop-Location }
exit $result
