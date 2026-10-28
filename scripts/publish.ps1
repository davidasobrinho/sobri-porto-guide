# Manual publish, only needed if Cloudflare's automatic publishing from GitHub is down.
# Uploads site/ to the Cloudflare Worker "sobri-porto-guide".
# Needs a Cloudflare API token saved as the Windows user variable CLOUDFLARE_API_TOKEN.
# The token is never printed.

$ErrorActionPreference = "Stop"
$token = [Environment]::GetEnvironmentVariable("CLOUDFLARE_API_TOKEN", "User")
if (-not $token) { Write-Host "No CLOUDFLARE_API_TOKEN saved for this Windows user."; exit 1 }
$env:CLOUDFLARE_API_TOKEN = $token
$env:CLOUDFLARE_ACCOUNT_ID = "56c4875b81ed2399abf7559bc05f00b3"   # from the dashboard address, not a secret

Set-Location (Split-Path -Parent $PSScriptRoot)
npx.cmd -y wrangler@4 deploy
