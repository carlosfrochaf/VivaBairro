param(
  [string]$ApiUrl = 'http://127.0.0.1:3001',
  [string]$DeviceId,
  [switch]$Install
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$uri = [Uri]$ApiUrl
if ($uri.Scheme -ne 'https' -and $ApiUrl -ne 'http://127.0.0.1:3001') {
  throw 'Use uma API HTTPS ou http://127.0.0.1:3001 para teste por USB.'
}
& (Join-Path $PSScriptRoot 'flutter.ps1') build apk --debug --split-per-abi "--dart-define=API_URL=$ApiUrl"
if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar os APKs.' }
if (-not $Install) { Write-Output 'APKs em mobile/build/app/outputs/flutter-apk/.'; exit 0 }
if (-not $DeviceId) { throw 'Informe -DeviceId para instalar; nunca escolher um aparelho automaticamente.' }
$sdkRoot = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$adb = Join-Path $sdkRoot 'platform-tools\adb.exe'
if (-not (Test-Path -LiteralPath $adb)) { throw 'adb não encontrado. Configure ANDROID_HOME.' }
if ($ApiUrl -eq 'http://127.0.0.1:3001') {
  & $adb -s $DeviceId reverse tcp:3001 tcp:3001
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao configurar conexão USB. Confira autorização no aparelho.' }
}
$abi = (& $adb -s $DeviceId shell getprop ro.product.cpu.abi).Trim()
if ($abi -notin @('arm64-v8a', 'armeabi-v7a', 'x86_64')) { throw "Arquitetura não suportada: $abi" }
$apk = Join-Path $projectRoot "mobile/build/app/outputs/flutter-apk/app-$abi-debug.apk"
& $adb -s $DeviceId install -r $apk
if ($LASTEXITCODE -ne 0) { throw 'Falha na instalação. Não desinstale sem salvar os dados locais.' }
& $adb -s $DeviceId shell am start -n br.com.vivabairro.vivabairro/.MainActivity
