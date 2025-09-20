# Database URL Configuration Guide

## 🔗 Database Connection URLs

### **PostgreSQL Connection String Format:**
```
postgres://username:password@host:port/database?sslmode=mode
```

### **AgroAI Development Database URLs:**

#### **1. Full Connection String:**
```
postgres://agroai_user:agroai_password@localhost:5432/agroai_dev?sslmode=disable
```

#### **2. Environment Variables (Recommended):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=agroai_user
DB_PASSWORD=agroai_password
DB_NAME=agroai_dev
DB_SSL_MODE=disable
```

#### **3. Go Connection String (Used in backend):**
```go
connStr := fmt.Sprintf(
    "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
    config.Host,    // localhost
    config.Port,    // 5432
    config.User,    // agroai_user
    config.Password, // agroai_password
    config.Database, // agroai_dev
    config.SSLMode,  // disable
)
```

## 📝 How to Configure

### **Step 1: Create Environment File**
Create `backend/.env.development`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=agroai_user
DB_PASSWORD=agroai_password
DB_NAME=agroai_dev
DB_SSL_MODE=disable

# API Configuration
API_PORT=8080
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT Configuration
JWT_SECRET=agroai_dev_jwt_secret_key_2024
JWT_EXPIRES_IN=24h
```

### **Step 2: Load Environment Variables**
The backend automatically loads these variables in `backend/config/database.dev.go`.

### **Step 3: Start Database**
```powershell
# Start PostgreSQL container
.\scripts\db-manager.ps1 start

# Or use Docker Compose
docker-compose -f docker-compose.dev.yml up -d
```

## 🔧 Different Database URLs for Different Environments

### **Development (Local Docker):**
```
postgres://agroai_user:agroai_password@localhost:5432/agroai_dev?sslmode=disable
```

### **Test Database:**
```
postgres://agroai_user:agroai_password@localhost:5432/agroai_test?sslmode=disable
```

### **Production (Example):**
```
postgres://prod_user:secure_password@prod-db.example.com:5432/agroai_prod?sslmode=require
```

## 🌐 Frontend Database URLs

### **API Base URL (Frontend):**
```env
# client/.env.development
VITE_API_URL=http://localhost:8080/api
```

### **WebSocket URL:**
```env
VITE_WS_URL=ws://localhost:8080
```

## 🛠️ Connection Testing

### **Test Database Connection:**
```powershell
# Using our script
.\scripts\db-manager.ps1 status

# Using Docker directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U agroai_user -d agroai_dev -c "SELECT version();"
```

### **Test from Go Backend:**
```go
// The backend will automatically test connection on startup
cd backend
go run main.go
```

### **Test from Frontend:**
```bash
cd client
npm run dev
# Frontend will connect to backend API at http://localhost:8080/api
```

## 🔍 Troubleshooting Connection Issues

### **1. Database Not Running:**
```powershell
# Check if containers are running
docker-compose -f docker-compose.dev.yml ps

# Start containers
.\scripts\db-manager.ps1 start
```

### **2. Wrong Port:**
```powershell
# Check what's using port 5432
netstat -ano | findstr :5432

# Change port in docker-compose.dev.yml if needed
```

### **3. Connection Refused:**
```powershell
# Check container logs
.\scripts\db-manager.ps1 logs

# Wait for PostgreSQL to be ready
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### **4. Wrong Credentials:**
```env
# Verify in backend/.env.development
DB_USER=agroai_user
DB_PASSWORD=agroai_password
DB_NAME=agroai_dev
```

## 📊 Quick Reference

### **Database Access Info:**
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `agroai_dev`
- **Username**: `agroai_user`
- **Password**: `agroai_password`
- **SSL Mode**: `disable`

### **pgAdmin Access:**
- **URL**: http://localhost:5050
- **Email**: `admin@agroai.com`
- **Password**: `admin123`

### **API Access:**
- **Backend API**: http://localhost:8080/api
- **Frontend**: http://localhost:3000

## 🚀 Quick Start Commands

```powershell
# 1. Start database
.\scripts\db-manager.ps1 start

# 2. Check status
.\scripts\db-manager.ps1 status

# 3. Start backend (uses DB_URL automatically)
cd backend && go run main.go

# 4. Start frontend
cd client && npm run dev
```

The database URL is automatically configured and used by the backend when you start it!
