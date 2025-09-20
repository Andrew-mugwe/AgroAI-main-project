# CI/CD Notifications Setup Guide

This guide explains how to set up Slack and email notifications for the AgroAI CI/CD pipeline.

## Overview

The AgroAI platform includes automated notifications for:
- Test failures
- Deployment status updates
- Activity logging alerts
- System errors

## Slack Integration

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "AgroAI CI/CD")
4. Select your workspace

### 2. Configure Incoming Webhooks

1. In your app settings, go to "Incoming Webhooks"
2. Toggle "Activate Incoming Webhooks" to On
3. Click "Add New Webhook to Workspace"
4. Select the channel where you want notifications (e.g., #alerts)
5. Copy the webhook URL

### 3. Set Environment Variables

Add the webhook URL to your environment:

```bash
# In your .env file
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# In GitHub Secrets (for CI/CD)
SLACK_WEBHOOK_URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 4. Test Slack Integration

```bash
# Test from backend
cd backend
go run -c 'package main; import "github.com/Andrew-mugwe/agroai/utils"; func main() { utils.TestSlackConnection() }'
```

## Email Integration

### 1. Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use your Gmail credentials

### 2. Other SMTP Providers

The system supports any SMTP provider. Common configurations:

**Gmail:**
```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Outlook/Hotmail:**
```bash
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Custom SMTP:**
```bash
SMTP_SERVER=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

### 3. Set Environment Variables

```bash
# In your .env file
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_EMAIL_TO=admin@yourcompany.com

# In GitHub Secrets (for CI/CD)
SMTP_SERVER: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: your-email@gmail.com
SMTP_PASS: your-app-password
ALERT_EMAIL_TO: admin@yourcompany.com
```

### 4. Test Email Integration

```bash
# Test from backend
cd backend
go run -c 'package main; import "github.com/Andrew-mugwe/agroai/utils"; func main() { utils.TestEmailConnection() }'
```

## GitHub Actions Integration

### 1. Add Secrets to GitHub

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:
- `SLACK_WEBHOOK_URL`
- `SMTP_SERVER`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `ALERT_EMAIL_TO`

### 2. Workflow Configuration

The CI/CD workflow automatically sends notifications when:
- Backend tests fail
- Frontend tests fail
- Deployment fails
- Activity logging tests fail

### 3. Custom Notifications

You can add custom notifications in your workflows:

```yaml
- name: Custom notification
  if: failure()
  run: |
    if [ -n "${{ secrets.SLACK_WEBHOOK_URL }}" ]; then
      curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"Custom failure message"}' \
        ${{ secrets.SLACK_WEBHOOK_URL }}
    fi
```

## Notification Types

### 1. Test Failure Alerts

**Slack:**
- Rich message with test details
- Build URL link
- Environment information
- Timestamp

**Email:**
- Detailed error message
- Test name and error details
- Build URL
- Environment information

### 2. Deployment Alerts

**Slack:**
- Status indicator (success/failure/started)
- Environment and version info
- Deployment timestamp
- Action buttons

**Email:**
- Deployment status
- Environment details
- Version information
- Timestamp

### 3. Activity Logging Alerts

**Slack:**
- Alert type (error/warning/info)
- Detailed message
- System context
- Timestamp

**Email:**
- Alert type and message
- Detailed context
- System information
- Timestamp

## Channel Recommendations

### Slack Channels

- `#alerts` - Critical alerts and failures
- `#deployments` - Deployment status updates
- `#logs` - Activity logging alerts
- `#ci-cd` - General CI/CD notifications

### Email Recipients

- **Primary:** DevOps team lead
- **Secondary:** Development team
- **Emergency:** On-call engineer

## Troubleshooting

### Common Issues

1. **Slack webhook not working:**
   - Verify webhook URL is correct
   - Check if webhook is enabled in Slack app
   - Ensure channel permissions are correct

2. **Email not sending:**
   - Verify SMTP credentials
   - Check firewall/network restrictions
   - Ensure 2FA is enabled for Gmail
   - Use App Password, not regular password

3. **Notifications not triggering:**
   - Check GitHub Secrets are set correctly
   - Verify workflow has access to secrets
   - Check workflow syntax

### Testing

```bash
# Test Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  $SLACK_WEBHOOK_URL

# Test Email (using Go)
cd backend
go run -c 'package main; import "github.com/Andrew-mugwe/agroai/utils"; func main() { utils.TestEmailConnection() }'
```

## Security Considerations

1. **Never commit credentials to code**
2. **Use GitHub Secrets for CI/CD**
3. **Rotate credentials regularly**
4. **Use App Passwords for Gmail**
5. **Restrict webhook channels**
6. **Monitor notification logs**

## Best Practices

1. **Use appropriate channels** for different alert types
2. **Set up escalation policies** for critical alerts
3. **Monitor notification delivery** regularly
4. **Test notifications** after configuration changes
5. **Keep notification messages concise** but informative
6. **Use consistent formatting** across all notifications

## Advanced Configuration

### Custom Message Templates

You can customize notification messages by modifying the utility functions in:
- `backend/utils/notifier_slack.go`
- `backend/utils/notifier_email.go`

### Rate Limiting

The system includes built-in rate limiting to prevent notification spam:
- Maximum 10 notifications per minute per type
- Automatic retry with exponential backoff
- Graceful degradation if services are unavailable

### Monitoring

Monitor notification delivery through:
- Slack app analytics
- Email delivery reports
- GitHub Actions logs
- Application logs

## Support

For issues with notifications:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Test individual components
4. Contact the DevOps team

---

**Note:** This notification system is designed to be resilient and will not block your CI/CD pipeline if notifications fail. Always ensure your core functionality works regardless of notification status.
