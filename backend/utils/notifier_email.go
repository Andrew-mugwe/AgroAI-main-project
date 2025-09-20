package utils

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"strings"
	"time"
)

// EmailConfig holds email configuration
type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	ToEmail      string
}

// EmailMessage represents an email message
type EmailMessage struct {
	To      []string
	Subject string
	Body    string
	HTML    string
}

// GetEmailConfig loads email configuration from environment variables
func GetEmailConfig() (*EmailConfig, error) {
	config := &EmailConfig{
		SMTPHost:     os.Getenv("SMTP_SERVER"),
		SMTPPort:     os.Getenv("SMTP_PORT"),
		SMTPUsername: os.Getenv("SMTP_USER"),
		SMTPPassword: os.Getenv("SMTP_PASS"),
		FromEmail:    os.Getenv("SMTP_USER"),
		ToEmail:      os.Getenv("ALERT_EMAIL_TO"),
	}

	// Validate required fields
	if config.SMTPHost == "" {
		return nil, fmt.Errorf("SMTP_SERVER environment variable not set")
	}
	if config.SMTPPort == "" {
		config.SMTPPort = "587" // Default SMTP port
	}
	if config.SMTPUsername == "" {
		return nil, fmt.Errorf("SMTP_USER environment variable not set")
	}
	if config.SMTPPassword == "" {
		return nil, fmt.Errorf("SMTP_PASS environment variable not set")
	}
	if config.ToEmail == "" {
		return nil, fmt.Errorf("ALERT_EMAIL_TO environment variable not set")
	}

	return config, nil
}

// SendEmailAlert sends an alert email
func SendEmailAlert(subject string, body string) error {
	config, err := GetEmailConfig()
	if err != nil {
		return err
	}

	message := &EmailMessage{
		To:      []string{config.ToEmail},
		Subject: subject,
		Body:    body,
	}

	return sendEmail(config, message)
}

// SendEmailTestFailureAlert sends a test failure alert email
func SendEmailTestFailureAlert(testName string, errorMsg string, buildURL string) error {
	config, err := GetEmailConfig()
	if err != nil {
		return err
	}

	subject := fmt.Sprintf("🚨 AgroAI Test Failure: %s", testName)
	
	body := fmt.Sprintf(`
AgroAI Test Failure Alert

Test Name: %s
Error Message: %s
Build URL: %s
Environment: %s
Timestamp: %s

Please investigate this test failure as soon as possible.

Best regards,
AgroAI CI/CD System
`, testName, errorMsg, buildURL, os.Getenv("ENVIRONMENT"), time.Now().Format("2006-01-02 15:04:05 UTC"))

	message := &EmailMessage{
		To:      []string{config.ToEmail},
		Subject: subject,
		Body:    body,
	}

	return sendEmail(config, message)
}

// SendEmailDeploymentAlert sends a deployment alert email
func SendEmailDeploymentAlert(status string, version string, environment string) error {
	config, err := GetEmailConfig()
	if err != nil {
		return err
	}

	var emoji, title string
	switch status {
	case "success":
		emoji = "✅"
		title = "Deployment Successful"
	case "failure":
		emoji = "❌"
		title = "Deployment Failed"
	case "started":
		emoji = "🚀"
		title = "Deployment Started"
	default:
		emoji = "❓"
		title = "Deployment Update"
	}

	subject := fmt.Sprintf("%s AgroAI Deployment: %s", emoji, title)
	
	body := fmt.Sprintf(`
AgroAI Deployment Alert

Status: %s
Environment: %s
Version: %s
Timestamp: %s

Deployment to %s environment has %s.

Best regards,
AgroAI CI/CD System
`, status, environment, version, time.Now().Format("2006-01-02 15:04:05 UTC"), environment, status)

	message := &EmailMessage{
		To:      []string{config.ToEmail},
		Subject: subject,
		Body:    body,
	}

	return sendEmail(config, message)
}

// SendEmailLogsAlert sends a logs-related alert email
func SendEmailLogsAlert(alertType string, message string, details map[string]interface{}) error {
	config, err := GetEmailConfig()
	if err != nil {
		return err
	}

	var emoji, title string
	switch alertType {
	case "error":
		emoji = "🚨"
		title = "Logs Error Alert"
	case "warning":
		emoji = "⚠️"
		title = "Logs Warning Alert"
	case "info":
		emoji = "ℹ️"
		title = "Logs Info Alert"
	default:
		emoji = "❓"
		title = "Logs Alert"
	}

	subject := fmt.Sprintf("%s AgroAI Logs: %s", emoji, title)
	
	// Build details section
	detailsText := ""
	for key, value := range details {
		detailsText += fmt.Sprintf("%s: %v\n", key, value)
	}
	
	body := fmt.Sprintf(`
AgroAI Activity Logs Alert

Alert Type: %s
Message: %s

Details:
%s

Timestamp: %s

Best regards,
AgroAI Activity Logging System
`, alertType, message, detailsText, time.Now().Format("2006-01-02 15:04:05 UTC"))

	emailMessage := &EmailMessage{
		To:      []string{config.ToEmail},
		Subject: subject,
		Body:    body,
	}

	return sendEmail(config, emailMessage)
}

// sendEmail sends an email using SMTP
func sendEmail(config *EmailConfig, message *EmailMessage) error {
	// Create authentication
	auth := smtp.PlainAuth("", config.SMTPUsername, config.SMTPPassword, config.SMTPHost)

	// Create TLS configuration
	tlsConfig := &tls.Config{
		InsecureSkipVerify: false,
		ServerName:         config.SMTPHost,
	}

	// Connect to server
	conn, err := tls.Dial("tcp", config.SMTPHost+":"+config.SMTPPort, tlsConfig)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %v", err)
	}
	defer conn.Close()

	// Create SMTP client
	client, err := smtp.NewClient(conn, config.SMTPHost)
	if err != nil {
		return fmt.Errorf("failed to create SMTP client: %v", err)
	}
	defer client.Quit()

	// Authenticate
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("failed to authenticate: %v", err)
	}

	// Set sender
	if err = client.Mail(config.FromEmail); err != nil {
		return fmt.Errorf("failed to set sender: %v", err)
	}

	// Set recipients
	for _, to := range message.To {
		if err = client.Rcpt(to); err != nil {
			return fmt.Errorf("failed to set recipient %s: %v", to, err)
		}
	}

	// Send email data
	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to get data writer: %v", err)
	}
	defer writer.Close()

	// Write email headers and body
	emailData := fmt.Sprintf("From: %s\r\n", config.FromEmail)
	emailData += fmt.Sprintf("To: %s\r\n", strings.Join(message.To, ", "))
	emailData += fmt.Sprintf("Subject: %s\r\n", message.Subject)
	emailData += "MIME-Version: 1.0\r\n"
	emailData += "Content-Type: text/plain; charset=UTF-8\r\n"
	emailData += "\r\n"
	emailData += message.Body

	_, err = writer.Write([]byte(emailData))
	if err != nil {
		return fmt.Errorf("failed to write email data: %v", err)
	}

	return nil
}

// TestEmailConnection tests the email configuration
func TestEmailConnection() error {
	return SendEmailAlert("🧪 Email Integration Test", "AgroAI CI/CD email system is working correctly!")
}
