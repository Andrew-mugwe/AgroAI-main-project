# AgroAI Analytics CI/CD

## 🎯 Demo Guide
**For investors, NGOs, and partners:** See our comprehensive [Demo Guide](docs/DEMO_GUIDE.md) for running professional demonstrations of the Pest & Disease Detection feature.

## GitHub Actions Secrets

The following secrets need to be configured in your GitHub repository settings for the analytics CI/CD pipeline:

```
STAGING_DATABASE_URL=postgresql://user:pass@host:5432/dbname
STAGING_API_URL=https://api-staging.agroai.com
STAGING_JWT_TOKEN=<jwt-token-for-api-tests>
CYPRESS_BASE_URL=https://staging.agroai.com
VPS_SSH_KEY=<ssh-private-key>
GHCR_TOKEN=<github-container-registry-token>
```

## Local Development

### Running Analytics Migrations

To run analytics migrations locally:

```bash
export DATABASE_URL=postgresql://localhost:5432/agroai
./scripts/ci/migrate_analytics.sh
```

### Seeding Demo Data

To seed demo analytics data locally:

```bash
export DATABASE_URL=postgresql://localhost:5432/agroai
go run scripts/ci/seed_analytics_demo.go
```

### Running Analytics Tests

Backend tests:
```bash
cd backend
go test ./services/analytics ./handlers/analytics -v -cover
```

Frontend tests:
```bash
cd client
npm test -- --coverage --testPathPattern="analytics"
```

## 💬 Messaging & Chat System

### Quick Start

The AgroAI Messaging system enables secure, role-aware communication between farmers, NGOs, traders, and administrators.

#### Setup
```bash
# Run migrations and seed demo data
make setup-db

# Start development server
make dev

# Run messaging tests
make test-messaging
```

#### Local Verification
```bash
# Quick local verification (Linux/Mac)
chmod +x scripts/verify-messages-local.sh
./scripts/verify-messages-local.sh

# Quick local verification (Windows PowerShell)
.\scripts\verify-messages-local-simple.ps1
```

This will:
- ✅ Run Go unit/integration tests
- ✅ Check Postgres for seeded messages
- ✅ Generate MESSAGING_REPORT.md
- ✅ Verify API endpoints and JSON structure

#### API Endpoints
- `GET /api/messages/conversations` - List user conversations
- `GET /api/messages/{conversationId}` - Fetch conversation messages
- `POST /api/messages/{conversationId}` - Send message
- `POST /api/messages/conversations/create` - Create conversation

#### Demo Data
The system includes 5 conversations with 17 messages across different user roles:
- Farmer ↔ NGO: Crop rotation advice
- Group: Sustainable farming training
- Trader ↔ NGO: Partnership discussion
- Trader ↔ Farmer: Maize sale negotiation
- NGO ↔ Trader: Farmers market invitation

#### Frontend Integration
```typescript
import { useMessaging } from './modules/messaging/useMessaging';

const { conversations, messages, sendMessage } = useMessaging({
  autoPoll: true,
  pollInterval: 5000
});
```

#### Configuration
```bash
# Environment variables
ENABLE_MESSAGING=true
MAX_MESSAGE_LENGTH=500
MESSAGING_POLLING_INTERVAL=5000
```

For detailed documentation, see [docs/messaging.md](docs/messaging.md).

## 🐛 Pest & Disease Detection System

### Quick Start

The AgroAI Pest Detection system provides AI-powered identification of agricultural pests and diseases through image analysis.

#### Setup
```bash
# Run migrations and seed demo data
make setup-db

# Start development server
make dev

# Run pest detection tests
make test-pests
```

#### Local Verification
```bash
# Quick local verification (Linux/Mac)
chmod +x scripts/verify-pests.sh
./scripts/verify-pests.sh --report

# Quick local verification (Windows PowerShell)
.\scripts\verify-pests-mock.ps1
```

This will:
- ✅ Run database migrations for pest_reports table
- ✅ Seed sample pest data
- ✅ Verify API endpoints
- ✅ Generate PEST_REPORT.md
- ✅ Check frontend components

#### API Endpoints
- `POST /api/pests/report` - Upload image for pest detection
- `GET /api/pests/reports` - Get user's pest reports
- `GET /api/pests/analytics` - Get pest detection analytics

#### Sample Data
The system includes 4 sample pest detections:
- Fall Armyworm (87% confidence) - Detected on maize
- Leaf Rust (92% confidence) - Found in wheat regions
- Aphids (75% confidence) - Common in vegetables
- Stem Borer (80% confidence) - Found in sorghum

#### Frontend Integration
```typescript
import PestDetectionPage from './pages/pest/PestDetectionPage';

// Route: /pest-detection
<PestDetectionPage />
```

#### Configuration
```bash
# Environment variables
MAX_MESSAGE_LENGTH=500
# Pest detection uses same JWT auth as messaging
```

For detailed documentation, see [docs/messaging.md](docs/messaging.md).

### 🔍 Local Notifications Verification

1. Start Postgres locally (Docker or installed service).
2. Add `DATABASE_URL` in `.env` (e.g. `postgres://user:password@localhost:5432/agroai`).
3. Run `chmod +x scripts/verify-db.sh && ./scripts/verify-db.sh`.
4. ✅ Success → Push your code. ❌ Failure → Fix before pushing.

### Running E2E Tests

```bash
cd client
npm run cypress:open
# Then select analytics/* specs
```

## CI/CD Pipeline

The analytics CI/CD pipeline consists of:

1. **Unit & Integration Tests**
   - Runs on every PR and push to main/dev
   - Tests analytics-specific code only
   - Uploads coverage reports

2. **Staging Deployment** (on dev branch)
   - Runs migrations
   - Seeds demo data
   - Verifies analytics endpoints
   - Uploads summary report

3. **E2E Tests** (manual trigger)
   - Run Cypress tests for analytics flows
   - Uses seeded demo data

## Adding New Analytics Events

1. Add event type constant in `models/analytics.go`
2. Update seed script if demo data needed
3. Add corresponding test cases
4. Update CI workflow if new paths need coverage

## 🔔 Flow 11 Local Verification

### Prerequisites

1. **PostgreSQL Database**: Run local Postgres (Docker or installed)
2. **Environment Setup**: Add `DATABASE_URL` to `.env` file

Example `.env` configuration:
```bash
DATABASE_URL=postgres://user:pass@localhost:5432/agroai
JWT_SECRET=your_jwt_secret_here
```

### Running Verification

1. **Basic Verification**:
   ```bash
   chmod +x scripts/verify-db.sh
   ./scripts/verify-db.sh
   ```

2. **Generate Report**:
   ```bash
   ./scripts/verify-db.sh --report
   ```
   This creates `NOTIFICATIONS_REPORT.md` with detailed verification results.

### What the Verification Does

- ✅ Creates notifications table with proper schema
- ✅ Inserts sample data (5+ notifications)
- ✅ Verifies table structure and indexes
- ✅ Checks enum types (ALERT, REMINDER, SYSTEM)
- ✅ Validates foreign key relationships
- ✅ Generates comprehensive report

### API Endpoints

After verification, these endpoints are ready:

- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/{id}/mark-read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/stats` - Get statistics

### Troubleshooting

**Common Issues**:

1. **Database Connection**: Ensure PostgreSQL is running and `DATABASE_URL` is correct
2. **Permissions**: Make sure the script is executable (`chmod +x scripts/verify-db.sh`)
3. **Dependencies**: Install `postgresql-client` if not available
4. **Users Table**: The script creates a minimal users table for foreign key constraints

**Error Messages**:
- `❌ .env file not found` → Create `.env` file with `DATABASE_URL`
- `❌ notifications table does not exist` → Check migration script execution
- `❌ Verification failed - no data found` → Check seed script execution