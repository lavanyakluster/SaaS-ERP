$ErrorActionPreference = "Stop"

$SourceDir = $PSScriptRoot
$DeployDir = Join-Path $SourceDir "deploy"
$StandaloneDir = Join-Path $SourceDir ".next\standalone"
$PublicDir = Join-Path $SourceDir "public"
$StaticDir = Join-Path $SourceDir ".next\static"

# Clean existing deploy directory
if (Test-Path $DeployDir) {
    Remove-Item $DeployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $DeployDir | Out-Null

Write-Host "Copying standalone build..."
# Correctly target the nested server directory to flatten the output
$StandaloneSource = Join-Path $StandaloneDir "smartbook\SaaS-ERP"
if (Test-Path $StandaloneSource) {
    Copy-Item -Path "$StandaloneSource\*" -Destination $DeployDir -Recurse -Force
} else {
    Write-Warning "Nested standalone directory not found at $StandaloneSource. Copying root standalone."
    Copy-Item -Path "$StandaloneDir\*" -Destination $DeployDir -Recurse -Force
}

Write-Host "Copying public assets..."
$DestPublic = Join-Path $DeployDir "public"
if (Test-Path $PublicDir) {
    Copy-Item -Path $PublicDir -Destination $DeployDir -Recurse -Force
}

Write-Host "Copying .next/static assets..."
$DestStatic = Join-Path $DeployDir ".next\static"
# Ensure .next directory exists in deploy
$DestNext = Join-Path $DeployDir ".next"
if (-not (Test-Path $DestNext)) {
    New-Item -ItemType Directory -Path $DestNext | Out-Null
}
if (Test-Path $StaticDir) {
    Copy-Item -Path $StaticDir -Destination $DestNext -Recurse -Force
}

Write-Host "Copying web.config..."
Copy-Item -Path (Join-Path $SourceDir "web.config") -Destination $DeployDir -Force

Write-Host "Deployment preparation complete. Files are in '$DeployDir'."
