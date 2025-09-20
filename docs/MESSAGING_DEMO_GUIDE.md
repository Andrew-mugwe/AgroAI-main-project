# AgroAI Marketplace Messaging Demo Guide

## Overview

This guide demonstrates AgroAI's marketplace messaging system, which enables real-time communication between buyers and sellers tied to specific products and orders.

## Quick Start (2 minutes)

### 1. Access Marketplace Chat
- Navigate to `/marketplace/chat` in the AgroAI application
- You'll see a list of demo conversations on the left sidebar
- Click on any conversation to start chatting

### 2. Demo Scenarios

#### Scenario 1: Product Inquiry (Coffee Beans)
- **Thread:** `thread_demo_beans_001`
- **Participants:** Alex Johnson (buyer) ↔ Green Valley Farms (seller)
- **Topic:** 50kg coffee beans negotiation
- **Status:** Open conversation with pricing discussion

#### Scenario 2: Technical Support (Organic Seeds)
- **Thread:** `thread_demo_seeds_002`
- **Participants:** Sarah Wilson (buyer) ↔ Organic Harvest Co (seller)
- **Topic:** Organic certification for maize seeds
- **Status:** Active consultation with document sharing

#### Scenario 3: Dispute Resolution (Tools)
- **Thread:** `thread_demo_tools_003`
- **Participants:** Mike Chen (buyer) ↔ Fresh Produce Ltd (seller) ↔ NGO Support
- **Topic:** Damaged tools delivery issue
- **Status:** Escalated with NGO intervention

### 3. Key Features to Demonstrate

#### Real-time Messaging
- Messages appear instantly without page refresh
- Typing indicators show when users are composing
- Connection status indicator (🟢 connected / 🔴 disconnected)

#### Thread Management
- Automatic thread creation per product/order
- Unique thread references for easy sharing
- Thread status tracking (open, closed, escalated)

#### Escalation System
- Click "Add Additional Information" in escalated threads
- System automatically notifies NGO/admin support
- Dispute resolution workflow with mediator involvement

#### File Attachments
- Click the paperclip icon to attach files
- Supports images and PDFs up to 10MB
- Drag and drop file upload

## Demo Script for Investors

### Opening (30 seconds)
"Today I'll demonstrate AgroAI's marketplace messaging system. This enables direct communication between farmers and sellers, with built-in dispute resolution and NGO support."

### Core Features (90 seconds)

#### 1. Product Communication (30 seconds)
"Farmers can discuss products directly with sellers. Here we see Alex negotiating coffee bean prices with Green Valley Farms. The conversation is tied to the specific product listing."

**Actions:**
- Open `thread_demo_beans_001`
- Show message history
- Demonstrate real-time messaging

#### 2. Technical Support (30 seconds)
"Technical questions are common in agriculture. Here Sarah is asking about organic certification for maize seeds. The seller can share documents and provide expert advice."

**Actions:**
- Open `thread_demo_seeds_002`
- Show document sharing capability
- Highlight expert consultation

#### 3. Dispute Resolution (30 seconds)
"When issues arise, our system provides built-in escalation. This tools dispute was automatically escalated to NGO support, who can mediate between buyer and seller."

**Actions:**
- Open `thread_demo_tools_003`
- Show escalation banner
- Demonstrate NGO intervention

### Technical Highlights (30 seconds)
- "WebSocket-based real-time messaging"
- "Role-based access control"
- "Mobile-responsive design"
- "Built-in security and rate limiting"

## API Testing

### Health Check
```bash
curl http://localhost:8080/api/marketplace/health
```

### Get User Threads
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/marketplace/threads
```

### Send Message
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"body": "Hello, I am interested in your product"}' \
     http://localhost:8080/api/marketplace/thread/thread_demo_beans_001/message
```

## Database Verification

### Check Demo Data
```sql
-- View all demo threads
SELECT thread_ref, status, created_at 
FROM marketplace_threads 
WHERE thread_ref LIKE 'thread_demo_%'
ORDER BY created_at DESC;

-- View thread participants
SELECT mt.thread_ref, u.name, mtp.role
FROM marketplace_threads mt
JOIN marketplace_thread_participants mtp ON mt.id = mtp.thread_id
JOIN users u ON mtp.user_id = u.id
WHERE mt.thread_ref LIKE 'thread_demo_%'
ORDER BY mt.thread_ref, mtp.role;

-- View message counts per thread
SELECT mt.thread_ref, COUNT(mm.id) as message_count
FROM marketplace_threads mt
LEFT JOIN marketplace_messages mm ON mt.id = mm.thread_id
WHERE mt.thread_ref LIKE 'thread_demo_%'
GROUP BY mt.thread_ref
ORDER BY message_count DESC;
```

## Troubleshooting

### Common Issues

#### WebSocket Connection Failed
- Check if the server is running on port 8080
- Verify WebSocket endpoint: `ws://localhost:8080/ws/marketplace`
- Check browser console for connection errors

#### Messages Not Appearing
- Verify authentication token is valid
- Check if user is a participant in the thread
- Ensure WebSocket connection is established

#### Thread Not Found
- Verify thread reference exists in database
- Check if user has access to the thread
- Ensure proper URL format: `/marketplace/chat/{threadRef}`

### Debug Commands

#### Check Server Status
```bash
curl http://localhost:8080/health
```

#### Test WebSocket Connection
```bash
wscat -c "ws://localhost:8080/ws/marketplace?user_id=789e0123-e89b-12d3-a456-426614174002"
```

#### Verify Database Connection
```bash
PGPASSWORD=agroai_password psql -h localhost -U agroai_user -d agroai_db -c "SELECT COUNT(*) FROM marketplace_threads;"
```

## Performance Metrics

### Expected Performance
- **Message Delivery:** < 100ms via WebSocket
- **Thread Loading:** < 500ms for 50 messages
- **Concurrent Users:** 1000+ simultaneous connections
- **Message Throughput:** 10,000+ messages per minute

### Monitoring Points
- WebSocket connection count
- Message delivery latency
- Thread creation rate
- Escalation frequency
- User engagement metrics

## Security Features

### Authentication & Authorization
- JWT-based authentication required
- Role-based access control (buyer, seller, NGO, admin)
- Thread membership verification
- Rate limiting on message sending

### Data Protection
- Message content sanitization
- File upload validation
- SQL injection prevention
- XSS protection in message display

### Privacy Controls
- Messages only visible to thread participants
- Admin access for moderation purposes
- Message retention policies
- GDPR compliance features

## Business Impact

### For Farmers
- Direct access to sellers for product information
- Negotiation capabilities for better pricing
- Technical support and consultation
- Dispute resolution assistance

### For Traders
- Customer relationship management
- Sales support and upselling opportunities
- Order fulfillment coordination
- Quality issue resolution

### For Platform
- Reduced support ticket volume
- Higher transaction completion rates
- Improved user satisfaction scores
- Better dispute resolution outcomes

## Next Steps

### Immediate (Next Sprint)
- Mobile app integration
- Push notifications
- Message search functionality
- File sharing with cloud storage

### Medium Term (Next Quarter)
- AI-powered response suggestions
- Automated escalation triggers
- Analytics dashboard
- Multi-language support

### Long Term (Next Year)
- Voice message support
- Video call integration
- Machine learning for dispute prediction
- Advanced analytics and insights

## Support

For technical support or questions about the marketplace messaging system:
- **Documentation:** `/docs/messaging.md`
- **API Reference:** `/docs/api/marketplace-messaging.md`
- **Issues:** Create GitHub issue with label `messaging`
- **Contact:** tech@agroai.com

---

*Last updated: January 2024*
*Version: 1.0.0*
