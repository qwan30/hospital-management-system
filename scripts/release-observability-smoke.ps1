[CmdletBinding()]
param(
  [switch]$SkipComposeUp,
  [int]$TimeoutSeconds = 240
)

$ErrorActionPreference = "Stop"

$prometheusPort = if ($env:HMS_PROMETHEUS_HOST_PORT) { $env:HMS_PROMETHEUS_HOST_PORT } else { "9090" }
$grafanaPort = if ($env:HMS_GRAFANA_HOST_PORT) { $env:HMS_GRAFANA_HOST_PORT } else { "3001" }
$tempoPort = if ($env:HMS_TEMPO_HOST_PORT) { $env:HMS_TEMPO_HOST_PORT } else { "3200" }
$lokiPort = if ($env:HMS_LOKI_HOST_PORT) { $env:HMS_LOKI_HOST_PORT } else { "3100" }
$backendPort = if ($env:HMS_BACKEND_HOST_PORT) { $env:HMS_BACKEND_HOST_PORT } else { "8081" }
$frontendPort = if ($env:HMS_FRONTEND_HOST_PORT) { $env:HMS_FRONTEND_HOST_PORT } else { "3000" }

$prometheusUrl = "http://127.0.0.1:$prometheusPort"
$grafanaUrl = "http://127.0.0.1:$grafanaPort"
$tempoUrl = "http://127.0.0.1:$tempoPort"
$lokiUrl = "http://127.0.0.1:$lokiPort"
$backendUrl = "http://127.0.0.1:$backendPort"
$frontendUrl = "http://127.0.0.1:$frontendPort"
$requestId = "hms-release-smoke-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"

$summary = [ordered]@{
  generatedAt = [DateTimeOffset]::UtcNow.ToString("o")
  requestId = $requestId
  passed = $false
  checks = [ordered]@{}
  errors = @()
}

function Add-Check($Name, $Status, $Detail = "") {
  $summary.checks[$Name] = [ordered]@{
    status = $Status
    detail = $Detail
  }
}

function Add-Error($Message) {
  $summary.errors += $Message
}

function Invoke-Json($Uri) {
  try {
    return Invoke-RestMethod -Uri $Uri -TimeoutSec 15
  } catch {
    Add-Error "$Uri failed: $($_.Exception.Message)"
    return $null
  }
}

function Wait-Http($Name, $Uri) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    try {
      Invoke-WebRequest -Uri $Uri -TimeoutSec 10 | Out-Null
      Add-Check $Name "PASS" $Uri
      return $true
    } catch {
      Start-Sleep -Seconds 3
    }
  } while ((Get-Date) -lt $deadline)

  Add-Check $Name "FAIL" $Uri
  Add-Error "$Name did not become ready at $Uri"
  return $false
}

if (-not $SkipComposeUp) {
  docker compose -f infra/docker-compose.yml -f infra/docker-compose.observability.yml up -d --build
  Add-Check "compose_up" "PASS" "docker compose overlay started"
}

Wait-Http "prometheus_ready" "$prometheusUrl/-/ready" | Out-Null
Wait-Http "grafana_ready" "$grafanaUrl/api/health" | Out-Null
Wait-Http "tempo_ready" "$tempoUrl/ready" | Out-Null
Wait-Http "loki_ready" "$lokiUrl/ready" | Out-Null
Wait-Http "frontend_ready" $frontendUrl | Out-Null

try {
  Invoke-WebRequest `
    -Uri "$backendUrl/api/v1/departments" `
    -Headers @{ "X-Request-Id" = $requestId } `
    -TimeoutSec 15 | Out-Null
  Add-Check "synthetic_backend_request" "PASS" "/api/v1/departments"
} catch {
  Add-Check "synthetic_backend_request" "FAIL" $_.Exception.Message
  Add-Error "Synthetic backend request failed: $($_.Exception.Message)"
}

Start-Sleep -Seconds 10

$targetQuery = [uri]::EscapeDataString('up{job="hms-backend"}')
$targetResult = Invoke-Json "$prometheusUrl/api/v1/query?query=$targetQuery"
$backendUp = $targetResult -and $targetResult.data.result.Count -gt 0 -and $targetResult.data.result[0].value[1] -eq "1"
Add-Check "prometheus_backend_target" $(if ($backendUp) { "PASS" } else { "FAIL" }) "up{job=`"hms-backend`"}"
if (-not $backendUp) {
  Add-Error "Prometheus backend target is not UP"
}

$metricQuery = [uri]::EscapeDataString('hms_http_server_requests_seconds_count')
$metricResult = Invoke-Json "$prometheusUrl/api/v1/query?query=$metricQuery"
$hasRequestMetric = $metricResult -and $metricResult.data.result.Count -gt 0
Add-Check "prometheus_http_metric" $(if ($hasRequestMetric) { "PASS" } else { "FAIL" }) "hms_http_server_requests_seconds_count"
if (-not $hasRequestMetric) {
  Add-Error "Prometheus did not return HMS HTTP metrics"
}

$lokiQuery = [uri]::EscapeDataString("{service=`"backend`"} |= `"$requestId`"")
$lokiResult = Invoke-Json "$lokiUrl/loki/api/v1/query_range?query=$lokiQuery&limit=5"
$hasLog = $lokiResult -and $lokiResult.data.result.Count -gt 0
Add-Check "loki_request_log" $(if ($hasLog) { "PASS" } else { "WARN" }) "requestId=$requestId"

$tempoResult = Invoke-Json "$tempoUrl/api/search?tags=service.name%3Dhms-backend&limit=20"
$hasTrace = $tempoResult -and $tempoResult.traces -and $tempoResult.traces.Count -gt 0
Add-Check "tempo_trace_search" $(if ($hasTrace) { "PASS" } else { "WARN" }) "service.name=hms-backend"

$summary.passed = $summary.errors.Count -eq 0
$summary | ConvertTo-Json -Depth 8

if (-not $summary.passed) {
  exit 1
}
