#!/usr/bin/env pwsh
# ============================================================
# Hospital Management System — Backend Launcher
# Usage:  .\run.ps1          (from backend/ directory)
#         .\backend\run.ps1  (from project root)
# ============================================================

Write-Host "`n  Hospital Management System — Backend" -ForegroundColor Cyan
Write-Host "  ====================================`n" -ForegroundColor Cyan

# Load .env from project root if environment variables are missing
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $projectRoot) { $projectRoot = Split-Path -Parent (Get-Location) }
$envFile = Join-Path $projectRoot ".env"

if (Test-Path $envFile) {
    Write-Host "  [*] Loading .env from $envFile" -ForegroundColor DarkGray
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim()
            # Only set if not already set in current session
            if (-not [Environment]::GetEnvironmentVariable($key, "Process")) {
                [Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
}

# Verify critical env vars
$missing = @()
@("POSTGRES_PASSWORD", "JWT_SECRET", "PATIENT_IDENTIFIER_SECRET") | ForEach-Object {
    if (-not [Environment]::GetEnvironmentVariable($_, "Process")) { $missing += $_ }
}

if ($missing.Count -gt 0) {
    Write-Host "  [!] Missing required env vars: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "  [!] Create a .env file in the project root or set them manually." -ForegroundColor Red
    exit 1
}

# Set dev defaults if not already set
if (-not $env:SPRING_PROFILES_ACTIVE) { $env:SPRING_PROFILES_ACTIVE = "dev" }
if (-not $env:HMS_ALLOW_CREDENTIALS) { $env:HMS_ALLOW_CREDENTIALS = "true" }
if (-not $env:HMS_NON_BILLING_DEMO_SEED_ENABLED) { $env:HMS_NON_BILLING_DEMO_SEED_ENABLED = "true" }

Write-Host "  [*] Profile: $env:SPRING_PROFILES_ACTIVE" -ForegroundColor Green
Write-Host "  [*] Starting Spring Boot from 'start' module...`n" -ForegroundColor Green

# Run from the start module — this is the key fix!
$backendDir = $PSScriptRoot
if (-not $backendDir) { $backendDir = Get-Location }

mvn spring-boot:run -f "$backendDir\start\pom.xml"
