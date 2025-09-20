# AgroAI Backend Verification Script for Windows PowerShell
param(
    [switch]$SkipTests = $false,
    [switch]$SkipLint = $false
)

Write-Host "START: AgroAI Backend Verification" -ForegroundColor Green

$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location "$RootDir\backend"

Write-Host "Step 1: go.mod tidy..." -ForegroundColor Yellow
go mod tidy
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: go mod tidy failed" -ForegroundColor Red
    exit 1
}

Write-Host "Step 2: Building all packages..." -ForegroundColor Yellow
go build ./...
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}

if (-not $SkipTests) {
    Write-Host "Step 3: Running tests..." -ForegroundColor Yellow
    if (-not $env:DATABASE_URL) {
        Write-Host "WARNING: DATABASE_URL not set. Running tests without DB integration." -ForegroundColor Yellow
    } else {
        Write-Host "INFO: DATABASE_URL detected, running full test suite." -ForegroundColor Green
    }
    
    go test ./... -v
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Tests failed" -ForegroundColor Red
        exit 1
    }
}

if (-not $SkipLint) {
    Write-Host "Step 4: Linting..." -ForegroundColor Yellow
    if (Get-Command golangci-lint -ErrorAction SilentlyContinue) {
        golangci-lint run ./...
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Linting failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "WARNING: golangci-lint not installed. Skipping lint step." -ForegroundColor Yellow
    }
}

Write-Host "SUCCESS: AgroAI Backend Verification completed" -ForegroundColor Green