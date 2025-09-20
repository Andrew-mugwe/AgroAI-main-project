# Show AgroAI Database URL Configuration
Write-Host "🌾 AgroAI Database URL Configuration" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Database connection details
$dbHost = "localhost"
$dbPort = "5432"
$dbUser = "agroai_user"
$dbPassword = "agroai_password"
$dbName = "agroai_dev"
$sslMode = "disable"

Write-Host "📊 Database Connection Details:" -ForegroundColor Cyan
Write-Host "  Host: $dbHost"
Write-Host "  Port: $dbPort"
Write-Host "  Database: $dbName"
Write-Host "  Username: $dbUser"
Write-Host "  Password: $dbPassword"
Write-Host "  SSL Mode: $sslMode"
Write-Host ""

Write-Host "🔗 Connection URLs:" -ForegroundColor Cyan
Write-Host ""

# PostgreSQL connection string
$postgresURL = "postgres://$dbUser`:$dbPassword@$dbHost`:$dbPort/$dbName`?sslmode=$sslMode"
Write-Host "PostgreSQL URL:" -ForegroundColor Yellow
Write-Host "  $postgresURL"
Write-Host ""

# Go connection string
$goConnStr = "host=$dbHost port=$dbPort user=$dbUser password=$dbPassword dbname=$dbName sslmode=$sslMode"
Write-Host "Go Connection String:" -ForegroundColor Yellow
Write-Host "  $goConnStr"
Write-Host ""

# Environment variables
Write-Host "Environment Variables:" -ForegroundColor Yellow
Write-Host "  DB_HOST=$dbHost"
Write-Host "  DB_PORT=$dbPort"
Write-Host "  DB_USER=$dbUser"
Write-Host "  DB_PASSWORD=$dbPassword"
Write-Host "  DB_NAME=$dbName"
Write-Host "  DB_SSL_MODE=$sslMode"
Write-Host ""

Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  pgAdmin: http://localhost:5050"
Write-Host "  Backend API: http://localhost:8080/api"
Write-Host "  Frontend: http://localhost:3000"
Write-Host ""

Write-Host "🔧 Quick Commands:" -ForegroundColor Cyan
Write-Host "  Start DB: .\scripts\db-manager.ps1 start"
Write-Host "  Check Status: .\scripts\db-manager.ps1 status"
Write-Host "  Connect Shell: .\scripts\db-manager.ps1 shell"
Write-Host ""

# Check if database is running
Write-Host "📡 Database Status Check:" -ForegroundColor Cyan
try {
    $result = docker-compose -f docker-compose.dev.yml ps 2>$null
    if ($result -match "Up") {
        Write-Host "  ✅ Database containers are running" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Database containers are not running" -ForegroundColor Red
        Write-Host "  Run: .\scripts\db-manager.ps1 start" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Docker Compose not found or containers not running" -ForegroundColor Red
    Write-Host "  Run: .\scripts\db-manager.ps1 start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Configuration Files:" -ForegroundColor Cyan
Write-Host "  Backend Config: backend/config/database.dev.go"
Write-Host "  Environment: backend/.env.development (create from example)"
Write-Host "  Docker Compose: docker-compose.dev.yml"
Write-Host ""

Write-Host "The database URL is automatically configured when you start the backend!" -ForegroundColor Green