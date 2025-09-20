# AgroAI Database Manager Script
# Comprehensive database management for development

param(
    [Parameter(Position=0, Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "backup", "restore", "reset", "seed", "migrate", "shell", "help")]
    [string]$Action,
    
    [string]$BackupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "🌾 AgroAI Database Manager" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
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

# Start database containers
function Start-Database {
    Write-Info "Starting AgroAI database containers..."
    
    try {
        docker-compose -f docker-compose.dev.yml up -d
        Write-Success "Database containers started successfully!"
        
        Write-Info "Waiting for PostgreSQL to be ready..."
        Start-Sleep -Seconds 10
        
        # Test connection
        $result = docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -c "SELECT 1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL is ready and accepting connections!"
        }
        else {
            Write-Warning "PostgreSQL may still be starting up..."
        }
    }
    catch {
        Write-Error "Failed to start database containers: $_"
        throw
    }
}

# Stop database containers
function Stop-Database {
    Write-Info "Stopping AgroAI database containers..."
    
    try {
        docker-compose -f docker-compose.dev.yml down
        Write-Success "Database containers stopped successfully!"
    }
    catch {
        Write-Error "Failed to stop database containers: $_"
        throw
    }
}

# Restart database containers
function Restart-Database {
    Write-Info "Restarting AgroAI database containers..."
    Stop-Database
    Start-Sleep -Seconds 5
    Start-Database
}

# Show database status
function Show-Status {
    Write-Info "Checking AgroAI database status..."
    
    try {
        # Check if containers are running
        $containers = docker-compose -f docker-compose.dev.yml ps
        Write-Host "Container Status:" -ForegroundColor Cyan
        Write-Host $containers
        
        Write-Host ""
        
        # Test database connection
        $result = docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -c "SELECT 'Connection successful' as status, version() as version;" 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database connection: OK"
            Write-Host "Database Info:" -ForegroundColor Cyan
            Write-Host $result
        }
        else {
            Write-Error "Database connection: FAILED"
        }
        
        Write-Host ""
        Write-Host "Access URLs:" -ForegroundColor Cyan
        Write-Host "  pgAdmin: http://localhost:5050"
        Write-Host "  PostgreSQL: localhost:5432"
    }
    catch {
        Write-Error "Failed to check database status: $_"
    }
}

# Show container logs
function Show-Logs {
    Write-Info "Showing AgroAI database logs..."
    
    try {
        docker-compose -f docker-compose.dev.yml logs -f --tail=50
    }
    catch {
        Write-Error "Failed to show logs: $_"
    }
}

# Backup database
function Backup-Database {
    param([string]$BackupFile)
    
    Write-Info "Creating database backup: $BackupFile"
    
    try {
        # Create backup directory if it doesn't exist
        $backupDir = "backups"
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        }
        
        $backupPath = Join-Path $backupDir $BackupFile
        
        # Create backup
        docker-compose -f docker-compose.dev.yml exec -T postgres pg_dump -U agroai_user -d agroai_dev > $backupPath
        
        if (Test-Path $backupPath) {
            $fileSize = (Get-Item $backupPath).Length
            Write-Success "Backup created successfully: $backupPath ($([math]::Round($fileSize/1KB, 2)) KB)"
        }
        else {
            throw "Backup file was not created"
        }
    }
    catch {
        Write-Error "Failed to create backup: $_"
        throw
    }
}

# Restore database
function Restore-Database {
    param([string]$BackupFile)
    
    if (-not $BackupFile) {
        Write-Error "Backup file path is required for restore operation"
        return
    }
    
    if (-not (Test-Path $BackupFile)) {
        Write-Error "Backup file not found: $BackupFile"
        return
    }
    
    if (-not $Force) {
        Write-Warning "This will replace all data in the database!"
        $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
        if ($confirmation -ne "yes") {
            Write-Info "Restore operation cancelled"
            return
        }
    }
    
    Write-Info "Restoring database from: $BackupFile"
    
    try {
        # Drop and recreate database
        Write-Info "Recreating database..."
        docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -c "DROP DATABASE IF EXISTS agroai_dev;"
        docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -c "CREATE DATABASE agroai_dev;"
        
        # Restore from backup
        Get-Content $BackupFile | docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev
        
        Write-Success "Database restored successfully from: $BackupFile"
    }
    catch {
        Write-Error "Failed to restore database: $_"
        throw
    }
}

# Reset database (drop and recreate)
function Reset-Database {
    if (-not $Force) {
        Write-Warning "This will permanently delete all data in the database!"
        $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
        if ($confirmation -ne "yes") {
            Write-Info "Reset operation cancelled"
            return
        }
    }
    
    Write-Info "Resetting AgroAI database..."
    
    try {
        # Drop and recreate database
        docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -c "DROP DATABASE IF EXISTS agroai_dev;"
        docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -c "CREATE DATABASE agroai_dev;"
        
        Write-Success "Database reset successfully!"
        
        # Run migrations if they exist
        if (Test-Path "backend/database/migrations") {
            Write-Info "Running migrations..."
            Get-ChildItem "backend/database/migrations/*.sql" | ForEach-Object {
                Write-Info "Running migration: $($_.Name)"
                docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -f "/docker-entrypoint-initdb.d/../$($_.Name)" 2>$null
            }
        }
    }
    catch {
        Write-Error "Failed to reset database: $_"
        throw
    }
}

# Seed database with sample data
function Seed-Database {
    Write-Info "Seeding database with sample data..."
    
    if (-not (Test-Path "db/seeds")) {
        Write-Warning "No seeds directory found. Skipping seeding."
        return
    }
    
    try {
        Get-ChildItem "db/seeds/*.sql" | ForEach-Object {
            Write-Info "Running seed: $($_.Name)"
            docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -f "/docker-entrypoint-initdb.d/../seeds/$($_.Name)" 2>$null
        }
        
        Write-Success "Database seeded successfully!"
    }
    catch {
        Write-Warning "Some seeds may have failed, but continuing..."
    }
}

# Run database migrations
function Invoke-Migrations {
    Write-Info "Running database migrations..."
    
    if (-not (Test-Path "backend/database/migrations")) {
        Write-Warning "No migrations directory found. Skipping migrations."
        return
    }
    
    try {
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

# Open database shell
function Open-DatabaseShell {
    Write-Info "Opening PostgreSQL shell..."
    Write-Host "Type '\q' to exit the shell" -ForegroundColor Yellow
    
    try {
        docker-compose -f docker-compose.dev.yml exec postgres psql -U agroai_user -d agroai_dev
    }
    catch {
        Write-Error "Failed to open database shell: $_"
    }
}

# Show help
function Show-Help {
    Write-Host "AgroAI Database Manager - Usage Examples:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Basic Operations:" -ForegroundColor Yellow
    Write-Host "  .\scripts\db-manager.ps1 start          # Start database containers"
    Write-Host "  .\scripts\db-manager.ps1 stop           # Stop database containers"
    Write-Host "  .\scripts\db-manager.ps1 restart        # Restart database containers"
    Write-Host "  .\scripts\db-manager.ps1 status         # Show database status"
    Write-Host "  .\scripts\db-manager.ps1 logs           # Show container logs"
    Write-Host ""
    Write-Host "Database Operations:" -ForegroundColor Yellow
    Write-Host "  .\scripts\db-manager.ps1 backup         # Create database backup"
    Write-Host "  .\scripts\db-manager.ps1 backup -BackupFile mybackup.sql"
    Write-Host "  .\scripts\db-manager.ps1 restore -BackupFile mybackup.sql"
    Write-Host "  .\scripts\db-manager.ps1 reset          # Reset database (destructive)"
    Write-Host "  .\scripts\db-manager.ps1 reset -Force   # Reset without confirmation"
    Write-Host ""
    Write-Host "Development Operations:" -ForegroundColor Yellow
    Write-Host "  .\scripts\db-manager.ps1 migrate        # Run database migrations"
    Write-Host "  .\scripts\db-manager.ps1 seed           # Seed with sample data"
    Write-Host "  .\scripts\db-manager.ps1 shell          # Open PostgreSQL shell"
    Write-Host ""
    Write-Host "Access Information:" -ForegroundColor Yellow
    Write-Host "  pgAdmin: http://localhost:5050 (admin@agroai.com / admin123)"
    Write-Host "  PostgreSQL: localhost:5432 (agroai_user / agroai_password)"
    Write-Host ""
}

# Main execution
try {
    switch ($Action) {
        "start" { Start-Database }
        "stop" { Stop-Database }
        "restart" { Restart-Database }
        "status" { Show-Status }
        "logs" { Show-Logs }
        "backup" { Backup-Database -BackupFile $BackupFile }
        "restore" { Restore-Database -BackupFile $BackupFile }
        "reset" { Reset-Database }
        "seed" { Seed-Database }
        "migrate" { Invoke-Migrations }
        "shell" { Open-DatabaseShell }
        "help" { Show-Help }
        default { 
            Write-Error "Unknown action: $Action"
            Show-Help
        }
    }
}
catch {
    Write-Error "Operation failed: $_"
    exit 1
}
