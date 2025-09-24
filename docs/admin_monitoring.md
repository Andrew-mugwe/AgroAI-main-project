# Admin Monitoring & PostHog Integration

This document describes the Admin Monitoring system and PostHog analytics integration for AgroAI Marketplace.

## Overview

The Admin Monitoring system provides comprehensive platform analytics, seller management, and automated alerting capabilities. It integrates with PostHog for advanced analytics and includes an alerts engine that can notify administrators via Slack and email.

## Components

### 1. Admin Dashboard

The admin dashboard provides real-time insights into:
- Platform health metrics
- User activity and growth
- Order and payment analytics
- Seller performance and reputation
- System alerts and notifications

### 2. PostHog Analytics

PostHog integration tracks key marketplace events:

#### User Events
- `user_signed_up` - User registration
- `user_logged_in` - User authentication

#### Product Events
- `product_viewed` - Product page views
- `add_to_cart` - Add to cart actions

#### Transaction Events
- `checkout_initiated` - Checkout process started
- `payment_succeeded` - Successful payments
- `payment_failed` - Failed payment attempts

#### Seller Events
- `seller_profile_viewed` - Seller profile views
- `review_submitted` - Product reviews
- `seller_verified` - Seller verification status changes

#### Messaging Events
- `message_started` - New conversations initiated

#### Notification Events
- `notification_sent` - Notifications dispatched
- `notification_opened` - Notification views
- `notification_clicked` - Notification interactions

### 3. Alerts System

The alerts system monitors key metrics and triggers notifications when thresholds are exceeded:

#### Default Alert Rules

1. **High Payment Failure Rate**
   - Metric: Payment failure rate
   - Threshold: > 5% in 1 hour
   - Severity: High

2. **Low Seller Reputation**
   - Metric: Average seller reputation
   - Threshold: < 40
   - Severity: Medium

3. **High Dispute Rate**
   - Metric: Dispute rate
   - Threshold: > 10% in 24 hours
   - Severity: High

4. **System Error Spike**
   - Metric: System errors
   - Threshold: > 50 in 1 hour
   - Severity: Critical

#### Alert Channels

- **Slack**: Real-time notifications to configured channels
- **Email**: Email alerts via SendGrid integration

## Setup Instructions

### 1. Environment Variables

Configure the following environment variables:

```bash
# PostHog Configuration
POSTHOG_API_KEY=your_posthog_api_key
POSTHOG_API_HOST=https://app.posthog.com
POSTHOG_TEST_KEY=your_test_key_for_verification

# Alert Channels
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
SENDGRID_API_KEY=your_sendgrid_api_key

# Frontend PostHog
REACT_APP_POSTHOG_KEY=your_posthog_key
REACT_APP_POSTHOG_HOST=https://app.posthog.com
```

### 2. Database Setup

Run the monitoring migrations:

```bash
# Run migrations
psql $DATABASE_URL -f db/migrations/0018_create_monitoring_alerts_tables.sql

# Seed demo data
psql $DATABASE_URL -f db/seeds/seed_admin_posthog.sql
```

### 3. PostHog Setup

1. Create a PostHog account at [posthog.com](https://posthog.com)
2. Create a new project
3. Copy the API key to your environment variables
4. Configure event tracking as needed

### 4. Slack Integration

1. Create a Slack app in your workspace
2. Enable incoming webhooks
3. Create a webhook URL for your alerts channel
4. Add the webhook URL to your environment variables

### 5. SendGrid Integration

1. Create a SendGrid account
2. Generate an API key
3. Configure email templates for alerts
4. Add the API key to your environment variables

## Usage

### Admin Dashboard

Access the admin dashboard at `/admin/monitoring` (requires admin role).

#### Features:
- **Overview Tab**: Platform metrics and health indicators
- **Sellers Tab**: Seller management with verification controls
- **Alerts Tab**: Active alerts and resolution tools
- **Analytics Tab**: PostHog dashboard integration

### Alert Management

#### Viewing Alerts
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/admin/alerts
```

#### Resolving Alerts
```bash
curl -X PATCH -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8080/api/admin/alerts/{alert_id}/resolve
```

### Running Alerts Worker

Start the alerts evaluation worker:

```bash
cd backend
go run cmd/alerts_worker.go -interval=1m
```

The worker will:
- Evaluate alert rules every minute
- Trigger alerts when conditions are met
- Send notifications via configured channels
- Update alert status in the database

## API Endpoints

### Monitoring Overview
```
GET /api/admin/monitoring/overview
```
Returns platform health metrics including user counts, order volumes, and reputation scores.

### Seller Management
```
GET /api/admin/sellers
PATCH /api/admin/sellers/{id}/verify
POST /api/admin/sellers/{id}/recalculate-reputation
```

### Alerts Management
```
GET /api/admin/alerts
POST /api/admin/alerts
PATCH /api/admin/alerts/{id}/resolve
```

### Analytics Data
```
GET /api/admin/monitoring/reputation-distribution
GET /api/admin/monitoring/disputes-over-time
```

## PostHog Dashboard Setup

### 1. Create Dashboards

Create PostHog dashboards for:
- User acquisition and retention
- Product performance metrics
- Payment success rates
- Seller performance tracking

### 2. Set Up Funnels

Configure conversion funnels for:
- User registration → First purchase
- Product view → Add to cart → Purchase
- Seller registration → First sale

### 3. Configure Cohorts

Set up user cohorts based on:
- Registration date
- Purchase behavior
- Geographic location
- User role (buyer/seller)

## Monitoring Best Practices

### 1. Alert Tuning

- Start with conservative thresholds
- Monitor alert frequency and adjust as needed
- Set up escalation policies for critical alerts
- Regular review and cleanup of resolved alerts

### 2. Dashboard Usage

- Monitor key metrics daily
- Set up automated reports for stakeholders
- Use PostHog insights for product decisions
- Track performance trends over time

### 3. Maintenance

- Regular database cleanup of old alerts
- Monitor PostHog quota usage
- Review and update alert rules quarterly
- Test alert channels regularly

## Troubleshooting

### Common Issues

1. **Alerts not triggering**
   - Check alert rules are active
   - Verify database connectivity
   - Check alert worker is running

2. **PostHog events not appearing**
   - Verify API key configuration
   - Check network connectivity
   - Review browser console for errors

3. **Notifications not sending**
   - Test Slack webhook URL
   - Verify SendGrid API key
   - Check alert delivery status

### Verification Script

Run the monitoring verification script:

```bash
./scripts/verify-monitoring.sh
```

This script will:
- Test backend compilation and tests
- Verify PostHog connectivity
- Check API endpoints
- Validate database tables
- Test alert system components

## Security Considerations

### 1. Access Control

- Admin endpoints require admin role
- API keys stored as environment variables
- Webhook URLs kept secure

### 2. Data Privacy

- No PII sent to PostHog
- User IDs hashed or anonymized
- Compliance with data protection regulations

### 3. Rate Limiting

- PostHog API calls are rate-limited
- Alert notifications have backoff logic
- Database queries optimized for performance

## Performance Optimization

### 1. Database Indexing

- Indexes on alert timestamps
- Composite indexes for complex queries
- Regular maintenance and optimization

### 2. Caching

- Cache frequently accessed metrics
- Use Redis for session data
- Implement query result caching

### 3. Monitoring

- Monitor alert evaluation performance
- Track PostHog API response times
- Set up performance alerts

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Machine learning insights
   - Predictive analytics
   - Custom dashboard builder

2. **Enhanced Alerting**
   - Dynamic threshold adjustment
   - Multi-channel notifications
   - Alert correlation and grouping

3. **Integration Improvements**
   - Additional analytics providers
   - Enhanced PostHog features
   - Mobile app analytics

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Run the verification script
4. Contact the development team

## Related Documentation

- [PostHog Documentation](https://posthog.com/docs)
- [Slack API Documentation](https://api.slack.com/)
- [SendGrid API Documentation](https://sendgrid.com/docs/)
- [AgroAI Marketplace Documentation](./marketplace.md)

