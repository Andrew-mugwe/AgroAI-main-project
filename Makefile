# AgroAI Makefile
# Database and development operations

.PHONY: help migrate seed test-messaging clean-db setup-db test-pests verify-pests-local

# Default target
help:
	@echo "AgroAI Development Commands:"
	@echo "  make migrate                - Run database migrations"
	@echo "  make seed                   - Seed database with demo data"
	@echo "  make setup-db               - Run migrations and seed data"
	@echo "  make test-messaging         - Run messaging verification tests"
	@echo "  make verify-messaging-local - Quick local messaging verification"
	@echo "  make test-pests             - Run pest detection verification tests"
	@echo "  make verify-pests-local     - Quick local pest detection verification"
	@echo "  make clean-db               - Clean database (WARNING: removes all data)"
	@echo "  make help                   - Show this help message"

# Database operations
migrate:
	@echo "🔄 Running database migrations..."
	@if [ -f .env ]; then \
		source .env && psql $$DATABASE_URL -f ./db/migrations/001_create_notifications_table.sql; \
		source .env && psql $$DATABASE_URL -f ./db/migrations/002_create_messaging_tables.sql; \
		source .env && psql $$DATABASE_URL -f ./db/migrations/003_create_pest_reports_table.sql; \
		echo "✅ Migrations completed successfully"; \
	else \
		echo "❌ .env file not found. Please create one with DATABASE_URL"; \
		exit 1; \
	fi

seed:
	@echo "🌱 Seeding database with demo data..."
	@if [ -f .env ]; then \
		source .env && psql $$DATABASE_URL -f ./db/seeds/seed.sql; \
		source .env && psql $$DATABASE_URL -f ./db/seeds/seed_messages.sql; \
		source .env && psql $$DATABASE_URL -f ./db/seeds/pest_samples.sql; \
		echo "✅ Database seeded successfully"; \
	else \
		echo "❌ .env file not found. Please create one with DATABASE_URL"; \
		exit 1; \
	fi

setup-db: migrate seed
	@echo "🎉 Database setup completed!"

# Messaging tests
test-messaging:
	@echo "🧪 Running messaging verification tests..."
	@if [ -f .env ]; then \
		chmod +x scripts/verify-messages.sh && ./scripts/verify-messages.sh; \
	else \
		echo "❌ .env file not found. Please create one with DATABASE_URL"; \
		exit 1; \
	fi

# Local messaging verification (quick)
verify-messaging-local:
	@echo "🔍 Running local messaging verification..."
	@if [ -f .env ]; then \
		chmod +x scripts/verify-messages-local.sh && ./scripts/verify-messages-local.sh; \
	else \
		echo "❌ .env file not found. Please create one with DATABASE_URL"; \
		exit 1; \
	fi

# Pest detection tests
test-pests:
	@echo "🐛 Running pest detection verification tests..."
	@if [ -f .env ]; then \
		chmod +x scripts/verify-pests.sh && ./scripts/verify-pests.sh; \
	else \
		echo "❌ .env file not found. Please create one with DATABASE_URL"; \
		exit 1; \
	fi

# Local pest detection verification (quick)
verify-pests-local:
	@echo "🔍 Running local pest detection verification..."
	@if [ -f .env ]; then \
		chmod +x scripts/verify-pests.sh && ./scripts/verify-pests.sh --report; \
	else \
		echo "❌ .env file not found. Please create one with DATABASE_URL"; \
		exit 1; \
	fi

# Clean database (WARNING: removes all data)
clean-db:
	@echo "⚠️  WARNING: This will remove all data from the database!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@if [ -f .env ]; then \
		source .env && psql $$DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; \
		echo "✅ Database cleaned"; \
	else \
		echo "❌ .env file not found. Please create one with DATABASE_URL"; \
		exit 1; \
	fi

# Development server
dev:
	@echo "🚀 Starting development server..."
	@cd backend && go run main.go

# Build
build:
	@echo "🔨 Building application..."
	@cd backend && go build -o agroai main.go
	@echo "✅ Build completed"

# Test all
test:
	@echo "🧪 Running all tests..."
	@cd backend && go test ./... -v
	@echo "✅ All tests completed"
