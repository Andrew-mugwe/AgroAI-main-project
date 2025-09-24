# Simple AgroAI Database Setup
Write-Host "🚀 Setting up AgroAI Database..." -ForegroundColor Green

# Add PostgreSQL to PATH
$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"

Write-Host "📊 Creating database: agroai" -ForegroundColor Yellow
Write-Host "Please enter PostgreSQL password when prompted..." -ForegroundColor Cyan

# Create database
createdb -U postgres agroai

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created successfully!" -ForegroundColor Green
    
    # Set environment variables
    $env:DATABASE_URL = "postgres://postgres@localhost:5432/agroai?sslmode=disable"
    $env:JWT_SECRET = "agroai_production_secret_key_2025"
    
    Write-Host "🔧 Environment variables set" -ForegroundColor Yellow
    Write-Host "🚀 Ready to run AgroAI!" -ForegroundColor Green
} else {
    Write-Host "❌ Database creation failed" -ForegroundColor Red
}

