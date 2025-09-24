# AgroAI Production Run Script
Write-Host "🌾 Starting AgroAI Agricultural Marketplace..." -ForegroundColor Green

# Add PostgreSQL to PATH
$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"

# Set environment variables
$env:DATABASE_URL = "postgres://postgres@localhost:5432/agroai?sslmode=disable"
$env:JWT_SECRET = "agroai_production_secret_key_2025"
$env:PORT = "8080"
$env:HOST = "0.0.0.0"

Write-Host "🔧 Environment configured:" -ForegroundColor Yellow
Write-Host "   Database: $env:DATABASE_URL" -ForegroundColor Gray
Write-Host "   Server: $env:HOST:$env:PORT" -ForegroundColor Gray

Write-Host "🚀 Starting AgroAI server..." -ForegroundColor Green
Write-Host "   Access at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   API docs: http://localhost:8080/api/health" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow

# Start the application
./agroai.exe
