# AgroAI Database Setup Script
Write-Host "🚀 Setting up AgroAI Database..." -ForegroundColor Green

# Add PostgreSQL to PATH
$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"

# Database configuration
$DB_NAME = "agroai"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"

Write-Host "📊 Creating database: $DB_NAME" -ForegroundColor Yellow

# Create database (will prompt for password)
Write-Host "Please enter PostgreSQL password when prompted..." -ForegroundColor Cyan
createdb -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created successfully!" -ForegroundColor Green
    
    # Set environment variables
    $env:DATABASE_URL = "postgres://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"
    $env:JWT_SECRET = "agroai_production_secret_key_2025"
    
    Write-Host "🔧 Environment variables set:" -ForegroundColor Yellow
    Write-Host "   DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Gray
    Write-Host "   JWT_SECRET: $env:JWT_SECRET" -ForegroundColor Gray
    
    Write-Host "🚀 Ready to run AgroAI!" -ForegroundColor Green
    Write-Host "Run: ./agroai.exe" -ForegroundColor Cyan
} else {
    Write-Host "❌ Database creation failed. Please check PostgreSQL installation." -ForegroundColor Red
}
