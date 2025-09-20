# AgroAI Activity Logging & Audit Trail

## Overview

The AgroAI platform implements a comprehensive activity logging system to track user and system actions for debugging, compliance, and trust. This system provides a complete audit trail of all important activities within the platform.

## Architecture

### Database Schema

The `activity_logs` table stores all activity records:

```sql
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NULL,           -- FK to users.id, nullable for system actions
    role TEXT,                   -- User role at time of action
    action TEXT NOT NULL,        -- Action type (e.g., LOGIN, CREATE_ORDER)
    metadata JSONB,              -- Extra context data
    ip_address TEXT,             -- Client IP address
    user_agent TEXT,             -- Client user agent
    created_at TIMESTAMP DEFAULT now()
);
```

### Indexes

- `idx_activity_logs_user_id` - Fast user lookups
- `idx_activity_logs_action` - Fast action filtering
- `idx_activity_logs_created_at` - Time-based queries
- `idx_activity_logs_role` - Role-based filtering
- `idx_activity_logs_user_action` - Composite user+action queries
- `idx_activity_logs_role_created` - Composite role+time queries

## Logged Activities

### Authentication Activities

| Action | Description | Metadata |
|--------|-------------|----------|
| `LOGIN` | User login | `login_time`, `endpoint`, `success` |
| `SIGNUP` | User registration | `signup_time`, `endpoint`, `role` |
| `LOGOUT` | User logout | `logout_time`, `session_duration` |
| `LOGIN_FAILED` | Failed login attempt | `attempt_count`, `reason`, `blocked` |
| `PASSWORD_RESET` | Password reset request | `reset_token`, `email` |

### Role Management

| Action | Description | Metadata |
|--------|-------------|----------|
| `ROLE_CHANGE` | User role update | `old_role`, `new_role`, `change_time` |
| `PERMISSION_UPDATE` | Permission changes | `permissions_added`, `permissions_removed` |

### Farmer Activities

| Action | Description | Metadata |
|--------|-------------|----------|
| `FETCH_WEATHER` | Weather data request | `location`, `coordinates`, `weather_type` |
| `CROP_ADVICE` | AI crop advice request | `crop_type`, `season`, `location` |
| `UPLOAD_IMAGE` | Crop/field image upload | `file_name`, `file_size`, `image_type` |
| `CREATE_FARM` | Farm profile creation | `farm_name`, `location`, `size` |
| `UPDATE_FARM` | Farm profile update | `farm_id`, `changes` |

### Trader Activities

| Action | Description | Metadata |
|--------|-------------|----------|
| `CREATE_ORDER` | Order creation | `order_id`, `amount`, `currency`, `items` |
| `UPDATE_ORDER` | Order modification | `order_id`, `changes`, `old_status`, `new_status` |
| `CANCEL_ORDER` | Order cancellation | `order_id`, `reason`, `refund_amount` |
| `CREATE_PRODUCT` | Product listing | `product_id`, `product_name`, `category`, `price` |
| `UPDATE_PRODUCT` | Product modification | `product_id`, `changes`, `old_price`, `new_price` |
| `DELETE_PRODUCT` | Product removal | `product_id`, `product_name` |
| `VIEW_PRODUCT` | Product view | `product_id`, `view_duration` |

### NGO Activities

| Action | Description | Metadata |
|--------|-------------|----------|
| `CREATE_GROUP` | Group creation | `group_id`, `group_name`, `location`, `members` |
| `ADD_REPORT` | Report submission | `report_id`, `report_type`, `group_id` |
| `UPDATE_REPORT` | Report modification | `report_id`, `changes` |
| `ADD_MEMBER` | Member addition | `group_id`, `member_id`, `role` |
| `REMOVE_MEMBER` | Member removal | `group_id`, `member_id`, `reason` |

### System Activities

| Action | Description | Metadata |
|--------|-------------|----------|
| `SYSTEM_STARTUP` | System initialization | `startup_time`, `version`, `environment` |
| `DATABASE_BACKUP` | Database backup | `backup_size`, `duration`, `status` |
| `CACHE_CLEANUP` | Cache maintenance | `cleaned_keys`, `freed_memory` |
| `API_ERROR` | API error occurrence | `error_code`, `error_message`, `endpoint` |
| `SECURITY_ALERT` | Security event | `alert_type`, `severity`, `details` |

## Implementation

### Logger Service

The `ActivityLogger` service provides the core logging functionality:

```go
// Log a user action
err := activityLogger.LogAction(&userID, "farmer", "LOGIN", metadata, ip, userAgent)

// Log a system action
err := activityLogger.LogAction(nil, "SYSTEM", "DATABASE_BACKUP", metadata, ip, userAgent)
```

### Middleware Integration

The `ActivityLoggerMiddleware` provides convenient methods for common activities:

```go
// Log login
middleware.LogLogin(userID, role, request)

// Log signup
middleware.LogSignup(userID, role, request)

// Log role change
middleware.LogRoleChange(userID, oldRole, newRole, request)
```

### Handler Integration

Handlers automatically log activities:

```go
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
    // ... login logic ...
    
    // Log login activity
    if h.activityLogger != nil && response.User != nil {
        userID, err := uuid.Parse(response.User.ID)
        if err == nil {
            h.activityLogger.LogLogin(userID, response.User.Role, r)
        }
    }
    
    // ... response ...
}
```

## Querying Activity Logs

### Basic Queries

```sql
-- Get all activities for a user
SELECT * FROM activity_logs 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' 
ORDER BY created_at DESC;

-- Get all login activities
SELECT * FROM activity_logs 
WHERE action = 'LOGIN' 
ORDER BY created_at DESC;

-- Get activities in the last 24 hours
SELECT * FROM activity_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours' 
ORDER BY created_at DESC;
```

### Advanced Queries

```sql
-- Get failed login attempts
SELECT * FROM activity_logs 
WHERE action = 'LOGIN_FAILED' 
ORDER BY created_at DESC;

-- Get activities by IP address (security monitoring)
SELECT * FROM activity_logs 
WHERE ip_address = '192.168.1.100' 
ORDER BY created_at DESC;

-- Get system activities
SELECT * FROM activity_logs 
WHERE role = 'SYSTEM' 
ORDER BY created_at DESC;

-- Get trader order activities
SELECT * FROM activity_logs 
WHERE role = 'trader' AND action LIKE '%ORDER%' 
ORDER BY created_at DESC;
```

### Metadata Queries

```sql
-- Find orders with specific amount range
SELECT * FROM activity_logs 
WHERE action = 'CREATE_ORDER' 
AND metadata->>'amount'::numeric > 1000;

-- Find activities in specific location
SELECT * FROM activity_logs 
WHERE metadata->>'location' = 'Nairobi, Kenya';

-- Find activities with specific error codes
SELECT * FROM activity_logs 
WHERE action = 'API_ERROR' 
AND metadata->>'error_code' = 'VALIDATION_ERROR';
```

## Security & Privacy

### Data Protection

- **IP Addresses**: Stored for security monitoring but can be anonymized
- **User Agents**: Stored for debugging but can be truncated
- **Metadata**: Sensitive data should be excluded or encrypted
- **Retention**: Logs are automatically cleaned up after configurable period

### Access Control

- **Admin Access**: Full access to all activity logs
- **User Access**: Users can only view their own activities
- **System Access**: System logs are restricted to administrators

### Compliance

- **GDPR**: Users can request their activity data
- **Audit Requirements**: Complete audit trail for compliance
- **Data Retention**: Configurable retention policies

## Monitoring & Analytics

### Key Metrics

- **Login Success Rate**: `LOGIN` vs `LOGIN_FAILED` ratio
- **User Activity**: Actions per user per day
- **System Health**: Error rates and system activities
- **Security Events**: Failed logins and suspicious activities

### Alerts

- **Multiple Failed Logins**: Alert on repeated `LOGIN_FAILED`
- **Unusual Activity**: Alert on unexpected action patterns
- **System Errors**: Alert on high `API_ERROR` rates
- **Security Events**: Alert on `SECURITY_ALERT` actions

### Dashboards

- **User Activity Dashboard**: User engagement metrics
- **Security Dashboard**: Security events and alerts
- **System Health Dashboard**: System performance metrics
- **Compliance Dashboard**: Audit trail and compliance metrics

## Performance Considerations

### Database Optimization

- **Indexes**: Optimized for common query patterns
- **Partitioning**: Consider partitioning by date for large datasets
- **Archiving**: Move old logs to archive tables
- **Cleanup**: Regular cleanup of old logs

### Async Logging

- **Non-blocking**: Logging doesn't block request processing
- **Batch Processing**: Batch multiple logs for efficiency
- **Error Handling**: Graceful degradation if logging fails

### Storage Management

- **Compression**: Compress old logs to save space
- **Retention**: Configurable retention policies
- **Backup**: Regular backup of activity logs

## Testing

### Unit Tests

- **Logger Service**: Test all logging functions
- **Middleware**: Test middleware integration
- **Handlers**: Test handler logging integration
- **Error Handling**: Test graceful error handling

### Integration Tests

- **Database**: Test database operations
- **End-to-End**: Test complete logging flow
- **Performance**: Test logging performance impact
- **Security**: Test security and privacy features

## Configuration

### Environment Variables

```bash
# Database connection
DATABASE_URL=postgres://user:pass@localhost:5432/agroai

# Logging configuration
LOG_LEVEL=info
LOG_RETENTION_DAYS=90
LOG_CLEANUP_INTERVAL=24h

# Security
LOG_SENSITIVE_DATA=false
LOG_IP_ADDRESSES=true
LOG_USER_AGENTS=true
```

### Log Levels

- **DEBUG**: Detailed debugging information
- **INFO**: General information about activities
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **FATAL**: Fatal conditions

## Future Enhancements

### Planned Features

- **Real-time Monitoring**: Live activity monitoring dashboard
- **Machine Learning**: Anomaly detection for security
- **Advanced Analytics**: User behavior analysis
- **Integration**: Third-party logging services (Splunk, ELK)

### Scalability

- **Distributed Logging**: Support for multiple database instances
- **Message Queues**: Async logging with message queues
- **Microservices**: Service-specific logging
- **Cloud Integration**: Cloud-based logging services

## Troubleshooting

### Common Issues

1. **Logging Failures**: Check database connectivity
2. **Performance Impact**: Monitor database performance
3. **Storage Issues**: Check disk space and cleanup policies
4. **Security Concerns**: Review access controls and data sensitivity

### Debug Commands

```sql
-- Check recent activity
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;

-- Check system health
SELECT action, COUNT(*) FROM activity_logs 
WHERE created_at >= NOW() - INTERVAL '1 hour' 
GROUP BY action;

-- Check for errors
SELECT * FROM activity_logs 
WHERE action = 'API_ERROR' 
ORDER BY created_at DESC LIMIT 10;
```

## Best Practices

### Development

- **Consistent Naming**: Use consistent action names
- **Meaningful Metadata**: Include relevant context
- **Error Handling**: Always handle logging errors gracefully
- **Testing**: Test logging in all scenarios

### Operations

- **Monitoring**: Monitor logging system health
- **Backup**: Regular backup of activity logs
- **Cleanup**: Regular cleanup of old logs
- **Security**: Regular security reviews

### Compliance

- **Data Minimization**: Only log necessary data
- **Retention**: Follow data retention policies
- **Access Control**: Implement proper access controls
- **Audit**: Regular audit of logging practices
