# AgroAI Messaging & Chat System

## Overview

The AgroAI Messaging & Chat system enables secure, role-aware communication between farmers, NGOs, traders, and administrators. It supports both direct messages and group conversations with real-time updates.

## Database Schema

### Tables

#### `conversations`
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `conversation_members`
```sql
CREATE TABLE conversation_members (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('farmer', 'ngo', 'trader', 'admin')),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);
```

#### `messages`
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'delivered' CHECK (status IN ('delivered', 'read'))
);
```

### Indexes

- `idx_messages_conversation_created_at` - For efficient message retrieval
- `idx_conversation_member_user` - For user conversation lookup
- `idx_conversation_member_conversation` - For conversation member lookup
- `idx_messages_sender` - For sender-based queries
- `idx_messages_status` - For status-based filtering

### Relationships

```
users (1) ←→ (N) conversation_members (N) ←→ (1) conversations (1) ←→ (N) messages
```

## API Endpoints

### Authentication

All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

### Base URL

```
http://localhost:8080/api/messages
```

### Endpoints

#### 1. Get User Conversations

**GET** `/api/messages/conversations`

Returns all conversations the authenticated user is a member of.

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": 1,
      "type": "direct",
      "created_at": "2024-01-15T10:30:00Z",
      "last_message": {
        "id": 123,
        "conversation_id": 1,
        "sender_id": "11111111-1111-1111-1111-111111111111",
        "body": "Hello! How can I help you?",
        "created_at": "2024-01-15T10:30:00Z",
        "status": "delivered"
      },
      "participants": [
        {
          "user_id": "11111111-1111-1111-1111-111111111111",
          "role": "farmer",
          "first_name": "John",
          "last_name": "Farmer"
        }
      ]
    }
  ]
}
```

#### 2. Get Conversation Messages

**GET** `/api/messages/{conversationId}?limit=50&after=timestamp`

Retrieves messages for a specific conversation with pagination.

**Parameters:**
- `limit` (optional): Number of messages to return (default: 50, max: 100)
- `after` (optional): ISO timestamp to fetch messages after

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 123,
      "conversation_id": 1,
      "sender_id": "11111111-1111-1111-1111-111111111111",
      "body": "Hello! How can I help you?",
      "created_at": "2024-01-15T10:30:00Z",
      "status": "delivered"
    }
  ],
  "has_more": false,
  "next_after": "2024-01-15T10:30:00Z"
}
```

#### 3. Send Message

**POST** `/api/messages/{conversationId}`

Sends a message to a specific conversation.

**Request Body:**
```json
{
  "body": "Hello! This is my message."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "message_id": 124,
  "conversation_id": 1
}
```

#### 4. Send Message (Legacy)

**POST** `/api/messages/send`

Sends a message with flexible conversation targeting.

**Request Body:**
```json
{
  "conversation_id": 1,
  "body": "Hello! This is my message."
}
```

**Alternative for direct messages:**
```json
{
  "receiver_id": "22222222-2222-2222-2222-222222222222",
  "body": "Hello! This is my message."
}
```

#### 5. Create Conversation

**POST** `/api/messages/conversations/create`

Creates a new conversation.

**Request Body:**
```json
{
  "type": "direct",
  "participant_ids": [
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222222"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "conversation_id": 5
}
```

## Usage Examples

### cURL Examples

#### Get Conversations
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/messages/conversations
```

#### Get Messages
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:8080/api/messages/1?limit=20"
```

#### Send Message
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"body": "Hello from cURL!"}' \
     http://localhost:8080/api/messages/1
```

#### Create Conversation
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "direct",
       "participant_ids": [
         "11111111-1111-1111-1111-111111111111",
         "22222222-2222-2222-2222-222222222222"
       ]
     }' \
     http://localhost:8080/api/messages/conversations/create
```

### JavaScript Examples

#### Using the Messaging Module
```typescript
import { messagingAPI } from './modules/messaging';

// Get conversations
const conversations = await messagingAPI.getConversations();

// Get messages
const messages = await messagingAPI.getConversationMessages(1, 50);

// Send message
const result = await messagingAPI.sendMessageToConversation(1, "Hello!");

// Create conversation
const newConv = await messagingAPI.createConversation('direct', [
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
]);
```

#### Using React Hook
```typescript
import { useMessaging } from './modules/messaging/useMessaging';

function ChatComponent() {
  const {
    conversations,
    messages,
    currentConversationId,
    loading,
    error,
    sendMessage,
    selectConversation,
    loadMoreMessages
  } = useMessaging({
    autoPoll: true,
    pollInterval: 5000
  });

  const handleSendMessage = async (body: string) => {
    const success = await sendMessage(body);
    if (success) {
      console.log('Message sent successfully');
    }
  };

  return (
    <div>
      {/* Chat UI */}
    </div>
  );
}
```

## Configuration

### Environment Variables

```bash
# Messaging Configuration
ENABLE_MESSAGING=true
MAX_MESSAGE_LENGTH=500
MESSAGING_POLLING_INTERVAL=5000
MESSAGE_CACHE_TTL=300
```

### Frontend Configuration

```typescript
// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Polling Configuration
const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_MESSAGE_LENGTH = 500;
```

## Security

### Authentication
- All endpoints require valid JWT tokens
- User context is extracted from JWT claims
- Role-based access control is enforced

### Authorization
- Users can only access conversations they're members of
- Message sending is restricted to conversation participants
- Admin users have broader access rights

### Validation
- Message content is validated for length (max 500 characters)
- Malicious content is filtered out
- SQL injection protection is implemented
- XSS prevention through content sanitization

### Rate Limiting
- Message sending is rate-limited (configurable)
- API endpoints have request throttling
- Polling frequency is controlled

## Performance

### Database Optimization
- Proper indexing for fast queries
- Pagination for large message sets
- Connection pooling for scalability

### Caching
- Redis caching for frequently accessed data
- Message caching with TTL
- Conversation metadata caching

### Real-time Updates
- Polling-based updates (5-second intervals)
- Efficient change detection
- Minimal data transfer

## Local Development

### Prerequisites
- PostgreSQL 13+
- Go 1.19+
- Node.js 18+
- Redis (optional, for caching)

### Setup

1. **Database Setup**
```bash
# Run migrations
make migrate

# Seed demo data
make seed

# Or run both
make setup-db
```

2. **Backend Development**
```bash
cd backend
go run main.go
```

3. **Frontend Development**
```bash
cd client
npm install
npm start
```

4. **Testing**
```bash
# Run messaging tests
make test-messaging

# Run all tests
make test
```

### Development Commands

```bash
# Database operations
make migrate          # Run migrations
make seed             # Seed demo data
make setup-db         # Run migrations and seed
make clean-db         # Clean database (WARNING: removes all data)

# Testing
make test-messaging   # Run messaging verification tests
make test             # Run all tests

# Development
make dev              # Start development server
make build            # Build application
```

## Demo Data

The system includes comprehensive demo data with:

- **5 conversations** across different user types
- **17 messages** with realistic content
- **6 demo users** (2 farmers, 2 NGOs, 2 traders)
- **Role-specific conversations**:
  - Farmer ↔ NGO: Crop rotation advice
  - Group: Sustainable farming training
  - Trader ↔ NGO: Partnership discussion
  - Trader ↔ Farmer: Maize sale negotiation
  - NGO ↔ Trader: Farmers market invitation

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Authentication Errors**
   - Check JWT token validity
   - Verify token in Authorization header
   - Ensure user exists in database

3. **Message Validation Errors**
   - Check message length (max 500 characters)
   - Ensure message content is valid
   - Verify conversation access permissions

4. **Polling Issues**
   - Check network connectivity
   - Verify API endpoint availability
   - Review browser console for errors

### Debug Mode

Enable debug logging:
```bash
export DEBUG=true
export LOG_LEVEL=debug
```

### Logs

Check application logs for detailed error information:
```bash
# Backend logs
tail -f backend/logs/app.log

# Database logs
tail -f /var/log/postgresql/postgresql.log
```

## API Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

## Rate Limits

- **Message sending**: 10 messages per minute per user
- **API requests**: 100 requests per minute per user
- **Polling**: 1 request per 5 seconds per user

## Monitoring

### Metrics
- Message delivery rate
- API response times
- Database query performance
- User engagement metrics

### Alerts
- High error rates
- Slow response times
- Database connection issues
- Authentication failures

---

*This documentation is auto-generated and updated with each deployment.*
