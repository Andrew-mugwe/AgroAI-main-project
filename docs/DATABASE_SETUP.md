# AgroAI Database Setup Guide

This guide will help you set up a local PostgreSQL database for AgroAI development, complete with a GUI interface similar to MongoDB Compass.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Windows PowerShell
.\scripts\setup-dev-database.ps1

# Linux/macOS
./scripts/setup-dev-database.sh
```

### Option 2: Manual Setup
```bash
# Start containers
docker-compose -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
docker-compose -f docker-compose.dev.yml logs -f postgres
```

## 📊 What You Get

### 1. PostgreSQL Database
- **Host**: `localhost:5432`
- **Database**: `agroai_dev`
- **Username**: `agroai_user`
- **Password**: `agroai_password`

### 2. pgAdmin (Database GUI)
- **URL**: http://localhost:5050
- **Email**: `admin@agroai.com`
- **Password**: `admin123`

### 3. Redis Cache (Optional)
- **Host**: `localhost:6379`
- **Password**: `agroai_redis_password`

## 🔧 Database Management

### Using the Database Manager Script
```powershell
# Start database
.\scripts\db-manager.ps1 start

# Check status
.\scripts\db-manager.ps1 status

# View logs
.\scripts\db-manager.ps1 logs

# Create backup
.\scripts\db-manager.ps1 backup

# Restore from backup
.\scripts\db-manager.ps1 restore -BackupFile backups/mybackup.sql

# Reset database (destructive!)
.\scripts\db-manager.ps1 reset

# Run migrations
.\scripts\db-manager.ps1 migrate

# Seed with sample data
.\scripts\db-manager.ps1 seed

# Open PostgreSQL shell
.\scripts\db-manager.ps1 shell

# Stop database
.\scripts\db-manager.ps1 stop
```

### Using Docker Commands
```bash
# Start containers
docker-compose -f docker-compose.dev.yml up -d

# Stop containers
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Connect to PostgreSQL
docker-compose -f docker-compose.dev.yml exec postgres psql -U agroai_user -d agroai_dev

# Create backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U agroai_user agroai_dev > backup.sql

# Restore from backup
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U agroai_user -d agroai_dev < backup.sql
```

## 🌐 pgAdmin Setup

### First Time Setup
1. Open http://localhost:5050 in your browser
2. Login with:
   - **Email**: `admin@agroai.com`
   - **Password**: `admin123`

### Adding Server Connection
The AgroAI servers are pre-configured, but you can add them manually:

1. Right-click "Servers" → "Create" → "Server"
2. **General Tab**:
   - Name: `AgroAI Development`
3. **Connection Tab**:
   - Host: `postgres` (or `localhost` if connecting from outside Docker)
   - Port: `5432`
   - Database: `agroai_dev`
   - Username: `agroai_user`
   - Password: `agroai_password`

### pgAdmin Features
- **Query Tool**: Write and execute SQL queries
- **Database Browser**: Navigate tables, views, functions
- **Import/Export**: Import CSV files, export query results
- **Backup/Restore**: GUI-based database backup and restore
- **User Management**: Manage database users and permissions
- **Performance Monitoring**: View query performance and statistics

## 📁 File Structure

```
├── docker-compose.dev.yml          # Docker Compose configuration
├── db/
│   ├── init/
│   │   └── 01-init-database.sql   # Database initialization
│   ├── pgadmin/
│   │   └── servers.json           # pgAdmin server configuration
│   ├── migrations/                # Database migrations
│   └── seeds/                     # Sample data
├── scripts/
│   ├── setup-dev-database.ps1     # Windows setup script
│   ├── setup-dev-database.sh      # Linux/macOS setup script
│   └── db-manager.ps1             # Database management script
└── backend/
    └── config/
        ├── database.dev.go         # Development database config
        └── development.env.example # Environment variables template
```

## 🔐 Environment Configuration

### Backend Environment Variables
Create `backend/.env.development` from the example:
```bash
cp backend/config/development.env.example backend/.env.development
```

### Key Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=agroai_user
DB_PASSWORD=agroai_password
DB_NAME=agroai_dev

# API
API_PORT=8080
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT
JWT_SECRET=agroai_dev_jwt_secret_key_2024
```

## 🗄️ Database Schemas

### Available Databases
- **agroai_dev**: Main development database
- **agroai_test**: Test database for running tests
- **agroai_staging**: Staging environment database

### Key Tables
- `users` - User accounts and authentication
- `products` - Marketplace products
- `orders` - Customer orders
- `payments` - Payment transactions
- `escrows` - Escrow transactions
- `disputes` - Dispute records
- `sellers` - Seller profiles
- `ratings` - Product and seller ratings
- `messages` - Marketplace messaging

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# Stop conflicting services or change ports in docker-compose.dev.yml
```

#### 2. Container Won't Start
```bash
# Check Docker is running
docker --version

# Check container logs
docker-compose -f docker-compose.dev.yml logs postgres

# Rebuild containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

#### 3. Connection Refused
```bash
# Wait for PostgreSQL to be ready
docker-compose -f docker-compose.dev.yml logs -f postgres

# Test connection
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U agroai_user -d agroai_dev
```

#### 4. Permission Denied
```bash
# Check file permissions (Linux/macOS)
chmod +x scripts/*.sh

# Run as administrator (Windows)
# Right-click PowerShell → "Run as Administrator"
```

### Reset Everything
```bash
# Stop and remove all containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove all Docker volumes (WARNING: This deletes all data!)
docker volume prune -f

# Start fresh
.\scripts\setup-dev-database.ps1
```

## 📈 Performance Tips

### Database Optimization
```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Connection Pooling
The development setup includes connection pooling:
- **Max Connections**: 20
- **Min Connections**: 5
- **Connection Lifetime**: 1 hour
- **Idle Timeout**: 30 minutes

## 🔄 Backup & Restore

### Automated Backups
```powershell
# Create timestamped backup
.\scripts\db-manager.ps1 backup

# Restore from backup
.\scripts\db-manager.ps1 restore -BackupFile backups/backup_20241201_143022.sql
```

### Manual Backups
```bash
# Full database backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U agroai_user agroai_dev > full_backup.sql

# Schema only backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U agroai_user -s agroai_dev > schema_only.sql

# Data only backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U agroai_user -a agroai_dev > data_only.sql
```

## 🎯 Next Steps

1. **Start the database**: `.\scripts\db-manager.ps1 start`
2. **Open pgAdmin**: http://localhost:5050
3. **Run migrations**: `.\scripts\db-manager.ps1 migrate`
4. **Seed sample data**: `.\scripts\db-manager.ps1 seed`
5. **Start your backend**: `cd backend && go run main.go`
6. **Start your frontend**: `cd client && npm run dev`

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose -f docker-compose.dev.yml logs`
3. Verify Docker is running and has sufficient resources
4. Ensure ports 5432 and 5050 are available

---

**Happy coding! 🚀**
