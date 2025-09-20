# AgroAI Backend

## 🚀 Quick Start

### Prerequisites
- Go 1.23+
- PostgreSQL 15+
- Docker (optional)

### Environment Setup
1. Copy `env.example` to `.env` and configure:
```bash
cp ../env.example .env
```

2. Set up database:
```bash
# Option 1: Using Docker (recommended for development)
../scripts/prep_local_db.sh

# Option 2: Local PostgreSQL
createdb agroai_dev
```

3. Run migrations:
```bash
go run main.go migrate
```

4. Start the server:
```bash
go run main.go
```

## 🔍 Verification & CI

### Local Verification

#### Linux/macOS:
```bash
cd backend
make deps
make verify
```

#### Windows:
```powershell
# Using PowerShell script
powershell -ExecutionPolicy Bypass -File ..\scripts\verify-backend.ps1

# Or using individual commands
cd backend
go mod tidy
go build ./...
go test ./... -v
```

### Git Hook Setup
```bash
cp ../scripts/pre-push.sample .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

### CI/CD
Every push/PR runs `.github/workflows/verify.yml`

Includes PostgreSQL service for DB tests

## 📁 Project Structure

```
backend/
├── cmd/           # Application entrypoints
├── internal/      # Private application code
├── migrations/    # Database migrations
├── scripts/       # Utility scripts
├── main.go        # Main application
├── Makefile       # Build targets
└── README.md      # This file
```

## 🛠️ Development

### Available Make Targets
- `make build` - Build all packages
- `make test` - Run tests
- `make lint` - Run linter
- `make verify` - Run full verification suite
- `make deps` - Install development tools

### Database Migrations
```bash
# Create new migration
go run main.go migrate create <migration_name>

# Run migrations
go run main.go migrate up

# Rollback migrations
go run main.go migrate down
```

## 🧪 Testing

### Unit Tests
```bash
go test ./...
```

### Integration Tests
```bash
DATABASE_URL="postgres://user:pass@localhost/agroai_test?sslmode=disable" go test ./...
```

### Test Coverage
```bash
go test -cover ./...
```

## 📦 Dependencies

### Core Dependencies
- `github.com/gin-gonic/gin` - Web framework
- `github.com/lib/pq` - PostgreSQL driver
- `github.com/golang-migrate/migrate/v4` - Database migrations
- `github.com/joho/godotenv` - Environment variables

### Development Dependencies
- `github.com/golangci/golangci-lint` - Linter
- `github.com/stretchr/testify` - Testing utilities

## 🚀 Deployment

### Production Build
```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .
```

### Docker
```bash
docker build -t agroai-backend .
docker run -p 8080:8080 agroai-backend
```

## 📋 API Documentation

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Marketplace
- `GET /api/marketplace/products` - List products
- `POST /api/marketplace/products` - Create product
- `GET /api/marketplace/sellers` - List sellers
- `POST /api/marketplace/sellers` - Create seller profile

### Messaging
- `GET /api/messaging/threads` - List message threads
- `POST /api/messaging/threads` - Create new thread
- `GET /api/messaging/threads/:id/messages` - Get thread messages
- `POST /api/messaging/threads/:id/messages` - Send message

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 8080)
- `GIN_MODE` - Gin mode (debug/release)

### Database Configuration
- Host: localhost
- Port: 5432
- Database: agroai_dev
- Username: agroai
- Password: agroai

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL is correct
   - Ensure database exists

2. **Migration Errors**
   - Check migration files are valid
   - Verify database permissions
   - Check for conflicting migrations

3. **Build Failures**
   - Run `go mod tidy`
   - Check Go version compatibility
   - Verify all dependencies are installed

### Debug Mode
```bash
GIN_MODE=debug go run main.go
```

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Check GitHub issues
- Contact the development team

---

## ✅ Verification Checklist

- [ ] `chmod +x scripts/verify-backend.sh scripts/prep_local_db.sh scripts/pre-push.sample`
- [ ] Run `cd backend && make verify`
- [ ] Push → GitHub Actions verifies automatically with Postgres
