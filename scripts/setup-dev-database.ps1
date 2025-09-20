# AgroAI Development Database Setup Script (PowerShell)
# This script sets up the local PostgreSQL database for development

param(
    [switch]$SkipDockerCheck,
    [switch]$SkipSeeding,
    [switch]$Force
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🌾 AgroAI Development Database Setup" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Function to print colored output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is installed
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        $null = Get-Command docker-compose -ErrorAction Stop
        Write-Success "Docker and Docker Compose are installed"
        return $true
    }
    catch {
        Write-Error "Docker or Docker Compose is not installed."
        Write-Host "Please install Docker Desktop from: https://docs.docker.com/get-docker/"
        Write-Host "Or install Docker Compose from: https://docs.docker.com/compose/install/"
        return $false
    }
}

# Check if PostgreSQL client is installed
function Test-PostgreSQLClient {
    try {
        $null = Get-Command psql -ErrorAction Stop
        Write-Success "PostgreSQL client (psql) is installed"
        return $true
    }
    catch {
        Write-Warning "PostgreSQL client (psql) is not installed."
        Write-Host "You can install it with:"
        Write-Host "  - Download from: https://www.postgresql.org/download/windows/"
        Write-Host "  - Or use pgAdmin web interface at http://localhost:5050"
        return $false
    }
}

# Start Docker containers
function Start-Containers {
    Write-Info "Starting PostgreSQL and pgAdmin containers..."
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-Info "Creating .env file from example..."
        Copy-Item "backend/config/development.env.example" ".env"
        Write-Warning "Please update .env file with your configuration"
    }
    
    # Start containers
    try {
        docker-compose -f docker-compose.dev.yml up -d
        Write-Success "Containers started successfully!"
    }
    catch {
        Write-Error "Failed to start containers: $_"
        throw
    }
    
    Write-Info "Waiting for PostgreSQL to be ready..."
    Start-Sleep -Seconds 10
}

# Test database connection
function Test-DatabaseConnection {
    Write-Info "Testing database connection..."
    
    # Wait a bit more for PostgreSQL to be fully ready
    Start-Sleep -Seconds 5
    
    try {
        # Test connection using Docker exec
        $result = docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -c "SELECT version();" 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database connection successful!"
        }
        else {
            throw "Connection failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-Error "Database connection failed!"
        Write-Info "Trying again in 10 seconds..."
        Start-Sleep -Seconds 10
        
        try {
            $result = docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -c "SELECT version();" 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database connection successful on retry!"
            }
            else {
                throw "Connection failed after retry with exit code $LASTEXITCODE"
            }
        }
        catch {
            Write-Error "Database connection failed after retry!"
            Write-Info "Check container logs with: docker-compose -f docker-compose.dev.yml logs postgres"
            throw
        }
    }
}

# Run database migrations
function Invoke-Migrations {
    Write-Info "Running database migrations..."
    
    # Check if migrations directory exists
    if (-not (Test-Path "backend/database/migrations")) {
        Write-Warning "No migrations directory found. Skipping migrations."
        return
    }
    
    try {
        # Run migrations using Docker exec
        Get-ChildItem "backend/database/migrations/*.sql" | ForEach-Object {
            Write-Info "Running migration: $($_.Name)"
            docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -f "/docker-entrypoint-initdb.d/../$($_.Name)" 2>$null
        }
        
        Write-Success "Migrations completed!"
    }
    catch {
        Write-Warning "Some migrations may have failed, but continuing..."
    }
}

# Seed database with sample data
function Invoke-Seeding {
    if ($SkipSeeding) {
        Write-Info "Skipping database seeding as requested"
        return
    }
    
    Write-Info "Seeding database with sample data..."
    
    # Check if seeds directory exists
    if (-not (Test-Path "db/seeds")) {
        Write-Warning "No seeds directory found. Skipping seeding."
        return
    }
    
    try {
        # Run seed files
        Get-ChildItem "db/seeds/*.sql" | ForEach-Object {
            Write-Info "Running seed: $($_.Name)"
            docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -f "/docker-entrypoint-initdb.d/../seeds/$($_.Name)" 2>$null
        }
        
        Write-Success "Database seeded with sample data!"
    }
    catch {
        Write-Warning "Some seeds may have failed, but continuing..."
    }
}

# Display connection information
function Show-ConnectionInfo {
    Write-Host ""
    Write-Host "🎉 AgroAI Development Database Setup Complete!" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Database Connection Info:" -ForegroundColor Cyan
    Write-Host "  Host: localhost"
    Write-Host "  Port: 5432"
    Write-Host "  Database: agroai_dev"
    Write-Host "  Username: agroai_user"
    Write-Host "  Password: agroai_password"
    Write-Host ""
    Write-Host "🌐 pgAdmin (Database GUI):" -ForegroundColor Cyan
    Write-Host "  URL: http://localhost:5050"
    Write-Host "  Email: admin@agroai.com"
    Write-Host "  Password: admin123"
    Write-Host ""
    Write-Host "🔧 Useful Commands:" -ForegroundColor Cyan
    Write-Host "  Stop containers: docker-compose -f docker-compose.dev.yml down"
    Write-Host "  View logs: docker-compose -f docker-compose.dev.yml logs -f"
    Write-Host "  Connect via psql: docker-compose -f docker-compose.dev.yml exec postgres psql -U agroai_user -d agroai_dev"
    Write-Host "  Backup database: docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U agroai_user agroai_dev > backup.sql"
    Write-Host ""
    Write-Host "📁 Database Files:" -ForegroundColor Cyan
    Write-Host "  Data volume: docker volume inspect agroai-main-project_postgres_data"
    Write-Host "  pgAdmin data: docker volume inspect agroai-main-project_pgadmin_data"
    Write-Host ""
}

# Main execution
function Main {
    try {
        Write-Info "Starting AgroAI development database setup..."
        Write-Host ""
        
        if (-not $SkipDockerCheck) {
            if (-not (Test-Docker)) {
                return
            }
        }
        
        Test-PostgreSQLClient
        Start-Containers
        Test-DatabaseConnection
        Invoke-Migrations
        Invoke-Seeding
        Show-ConnectionInfo
        
        Write-Success "Setup completed successfully! 🚀"
    }
    catch {
        Write-Error "Setup failed: $_"
        exit 1
    }
}

# Run main function
Main
