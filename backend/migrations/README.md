# Database Migrations

This directory contains database migrations for the AgroAI platform. Each migration has an "up" and "down" script for applying and rolling back changes.

## Migration Files

- `000002_add_user_role_column.up.sql`: Adds role column to users table (farmer, ngo, trader)
- `000002_add_user_role_column.down.sql`: Removes role column from users table

## Running Migrations

### Prerequisites

1. PostgreSQL database server running
2. Database connection details in `.env` file
3. `golang-migrate` CLI tool installed

### Commands

```bash
# Apply all pending migrations
migrate -database "postgres://user:pass@localhost:5432/agrodb?sslmode=disable" -path backend/migrations up

# Roll back last migration
migrate -database "postgres://user:pass@localhost:5432/agrodb?sslmode=disable" -path backend/migrations down 1

# Roll back all migrations
migrate -database "postgres://user:pass@localhost:5432/agrodb?sslmode=disable" -path backend/migrations down

# Force a specific version (use with caution)
migrate -database "postgres://user:pass@localhost:5432/agrodb?sslmode=disable" -path backend/migrations force VERSION
```

### Safety Notes

1. Always backup database before running migrations in production
2. Test migrations in staging environment first
3. Review migration logs for any errors
4. Consider maintenance window for production deployments

### Troubleshooting

If you encounter a "dirty" database state:

1. Check migration logs for errors
2. Fix any data inconsistencies
3. Use `force` command to set correct version
4. Re-run migrations