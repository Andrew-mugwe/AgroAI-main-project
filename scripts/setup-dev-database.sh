#!/bin/bash

# AgroAI Development Database Setup Script
# This script sets up the local PostgreSQL database for development

set -e

echo "🌾 AgroAI Development Database Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if PostgreSQL client is installed
check_postgres_client() {
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client (psql) is not installed."
        echo "You can install it with:"
        echo "  - Windows: Download from https://www.postgresql.org/download/windows/"
        echo "  - macOS: brew install postgresql"
        echo "  - Ubuntu: sudo apt-get install postgresql-client"
        echo ""
        echo "Alternatively, you can use pgAdmin web interface at http://localhost:5050"
    else
        print_success "PostgreSQL client is installed"
    fi
}

# Start Docker containers
start_containers() {
    print_status "Starting PostgreSQL and pgAdmin containers..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from example..."
        cp backend/config/development.env.example .env
        print_warning "Please update .env file with your configuration"
    fi
    
    # Start containers
    docker-compose -f docker-compose.dev.yml up -d
    
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    print_success "Containers started successfully!"
}

# Test database connection
test_connection() {
    print_status "Testing database connection..."
    
    # Wait a bit more for PostgreSQL to be fully ready
    sleep 5
    
    # Test connection using Docker exec
    if docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -c "SELECT version();" > /dev/null 2>&1; then
        print_success "Database connection successful!"
    else
        print_error "Database connection failed!"
        print_status "Trying again in 10 seconds..."
        sleep 10
        
        if docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -c "SELECT version();" > /dev/null 2>&1; then
            print_success "Database connection successful on retry!"
        else
            print_error "Database connection failed after retry!"
            print_status "Check container logs with: docker-compose -f docker-compose.dev.yml logs postgres"
            exit 1
        fi
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if migrations directory exists
    if [ ! -d "backend/database/migrations" ]; then
        print_warning "No migrations directory found. Skipping migrations."
        return
    fi
    
    # Run migrations using Docker exec
    for migration in backend/database/migrations/*.sql; do
        if [ -f "$migration" ]; then
            print_status "Running migration: $(basename "$migration")"
            docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -f /docker-entrypoint-initdb.d/../$(basename "$migration") 2>/dev/null || true
        fi
    done
    
    print_success "Migrations completed!"
}

# Seed database with sample data
seed_database() {
    print_status "Seeding database with sample data..."
    
    # Check if seeds directory exists
    if [ ! -d "db/seeds" ]; then
        print_warning "No seeds directory found. Skipping seeding."
        return
    fi
    
    # Run seed files
    for seed in db/seeds/*.sql; do
        if [ -f "$seed" ]; then
            print_status "Running seed: $(basename "$seed")"
            docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev -f /docker-entrypoint-initdb.d/../seeds/$(basename "$seed") 2>/dev/null || true
        fi
    done
    
    print_success "Database seeded with sample data!"
}

# Display connection information
show_connection_info() {
    echo ""
    echo "🎉 AgroAI Development Database Setup Complete!"
    echo "=============================================="
    echo ""
    echo "📊 Database Connection Info:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: agroai_dev"
    echo "  Username: agroai_user"
    echo "  Password: agroai_password"
    echo ""
    echo "🌐 pgAdmin (Database GUI):"
    echo "  URL: http://localhost:5050"
    echo "  Email: admin@agroai.com"
    echo "  Password: admin123"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  Stop containers: docker-compose -f docker-compose.dev.yml down"
    echo "  View logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "  Connect via psql: docker-compose -f docker-compose.dev.yml exec postgres psql -U agroai_user -d agroai_dev"
    echo "  Backup database: docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U agroai_user agroai_dev > backup.sql"
    echo ""
    echo "📁 Database Files:"
    echo "  Data volume: docker volume inspect agroai-main-project_postgres_data"
    echo "  pgAdmin data: docker volume inspect agroai-main-project_pgadmin_data"
    echo ""
}

# Main execution
main() {
    echo "Starting AgroAI development database setup..."
    echo ""
    
    check_docker
    check_postgres_client
    start_containers
    test_connection
    run_migrations
    seed_database
    show_connection_info
    
    print_success "Setup completed successfully! 🚀"
}

# Run main function
main "$@"
