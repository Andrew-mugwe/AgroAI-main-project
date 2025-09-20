package tests

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/Andrew-mugwe/agroai/utils"
)

func TestAlertSystem(t *testing.T) {
	// Set up test environment variables
	originalEnv := make(map[string]string)
	testEnvVars := map[string]string{
		"SLACK_WEBHOOK_URL": "https://hooks.slack.com/test/webhook",
		"SMTP_SERVER":       "smtp.test.com",
		"SMTP_PORT":         "587",
		"SMTP_USER":         "test@test.com",
		"SMTP_PASS":         "testpass",
		"ALERT_EMAIL_TO":    "admin@test.com",
	}

	// Backup original environment variables
	for key := range testEnvVars {
		originalEnv[key] = os.Getenv(key)
	}

	// Set test environment variables
	for key, value := range testEnvVars {
		os.Setenv(key, value)
	}

	// Restore original environment variables after test
	defer func() {
		for key, value := range originalEnv {
			if value == "" {
				os.Unsetenv(key)
			} else {
				os.Setenv(key, value)
			}
		}
	}()

	t.Run("Slack Alert System Test", func(t *testing.T) {
		// Test Slack webhook configuration
		webhookURL := os.Getenv("SLACK_WEBHOOK_URL")
		assert.NotEmpty(t, webhookURL, "SLACK_WEBHOOK_URL should be set for testing")
		assert.Contains(t, webhookURL, "hooks.slack.com", "Should be a valid Slack webhook URL")

		// Test Slack alert function (will fail with test URL, but that's expected)
		err := utils.SendSlackAlert("Test alert from Flow 10 verification")
		// We expect this to fail with test credentials, but the function should execute
		assert.Error(t, err, "Should fail with test webhook URL")
		assert.Contains(t, err.Error(), "Slack webhook returned status", "Should attempt to send to Slack")

		// Test test failure alert
		err = utils.SendSlackTestFailureAlert(
			"Flow 10 verification test",
			"Mock test failure for verification",
			"https://github.com/test/repo/actions/runs/123",
		)
		assert.Error(t, err, "Should fail with test webhook URL")
		assert.Contains(t, err.Error(), "Slack webhook returned status", "Should attempt to send test failure alert")

		// Test deployment alert
		err = utils.SendSlackDeploymentAlert("failure", "v1.0.0", "test")
		assert.Error(t, err, "Should fail with test webhook URL")
		assert.Contains(t, err.Error(), "Slack webhook returned status", "Should attempt to send deployment alert")

		// Test logs alert
		err = utils.SendSlackLogsAlert("error", "Test logs alert", map[string]interface{}{
			"component": "test",
			"severity":  "high",
		})
		assert.Error(t, err, "Should fail with test webhook URL")
		assert.Contains(t, err.Error(), "Slack webhook returned status", "Should attempt to send logs alert")
	})

	t.Run("Email Alert System Test", func(t *testing.T) {
		// Test email configuration
		smtpServer := os.Getenv("SMTP_SERVER")
		smtpUser := os.Getenv("SMTP_USER")
		alertEmail := os.Getenv("ALERT_EMAIL_TO")

		assert.NotEmpty(t, smtpServer, "SMTP_SERVER should be set for testing")
		assert.NotEmpty(t, smtpUser, "SMTP_USER should be set for testing")
		assert.NotEmpty(t, alertEmail, "ALERT_EMAIL_TO should be set for testing")

		// Test email alert function (will fail with test credentials, but that's expected)
		err := utils.SendEmailAlert("Test Alert", "This is a test alert from Flow 10 verification")
		// We expect this to fail with test credentials, but the function should execute
		assert.Error(t, err, "Should fail with test SMTP credentials")
		assert.Contains(t, err.Error(), "failed to connect to SMTP server", "Should attempt to connect to SMTP")

		// Test test failure email
		err = utils.SendEmailTestFailureAlert(
			"Flow 10 verification test",
			"Mock test failure for verification",
			"https://github.com/test/repo/actions/runs/123",
		)
		assert.Error(t, err, "Should fail with test SMTP credentials")
		assert.Contains(t, err.Error(), "failed to connect to SMTP server", "Should attempt to send test failure email")

		// Test deployment email
		err = utils.SendEmailDeploymentAlert("failure", "v1.0.0", "test")
		assert.Error(t, err, "Should fail with test SMTP credentials")
		assert.Contains(t, err.Error(), "failed to connect to SMTP server", "Should attempt to send deployment email")

		// Test logs email
		err = utils.SendEmailLogsAlert("error", "Test logs alert", map[string]interface{}{
			"component": "test",
			"severity":  "high",
		})
		assert.Error(t, err, "Should fail with test SMTP credentials")
		assert.Contains(t, err.Error(), "failed to connect to SMTP server", "Should attempt to send logs email")
	})

	t.Run("Alert Configuration Validation", func(t *testing.T) {
		// Test that all required environment variables are set
		requiredVars := []string{
			"SLACK_WEBHOOK_URL",
			"SMTP_SERVER",
			"SMTP_PORT",
			"SMTP_USER",
			"SMTP_PASS",
			"ALERT_EMAIL_TO",
		}

		for _, varName := range requiredVars {
			value := os.Getenv(varName)
			assert.NotEmpty(t, value, "Environment variable %s should be set", varName)
		}

		// Test email configuration loading
		config, err := utils.GetEmailConfig()
		require.NoError(t, err, "Should be able to load email configuration")
		assert.Equal(t, "smtp.test.com", config.SMTPHost)
		assert.Equal(t, "587", config.SMTPPort)
		assert.Equal(t, "test@test.com", config.SMTPUsername)
		assert.Equal(t, "admin@test.com", config.ToEmail)
	})

	t.Run("Mock Log Write Failure Simulation", func(t *testing.T) {
		// Simulate a log write failure scenario
		t.Log("Simulating log write failure...")

		// This would normally trigger alerts in a real scenario
		// We're testing that the alert functions are callable and configured correctly

		// Simulate different types of failures
		failureScenarios := []struct {
			name     string
			testName string
			errorMsg string
			buildURL string
		}{
			{
				name:     "Database Connection Failure",
				testName: "TestDatabaseConnection",
				errorMsg: "Failed to connect to database: connection refused",
				buildURL: "https://github.com/test/repo/actions/runs/123",
			},
			{
				name:     "Log Write Failure",
				testName: "TestLogWrite",
				errorMsg: "Failed to write log entry: disk full",
				buildURL: "https://github.com/test/repo/actions/runs/124",
			},
			{
				name:     "Authentication Failure",
				testName: "TestAuthentication",
				errorMsg: "Invalid credentials: access denied",
				buildURL: "https://github.com/test/repo/actions/runs/125",
			},
		}

		for _, scenario := range failureScenarios {
			t.Run(scenario.name, func(t *testing.T) {
				// Test Slack alert for this failure
				err := utils.SendSlackTestFailureAlert(scenario.testName, scenario.errorMsg, scenario.buildURL)
				assert.Error(t, err, "Should fail with test webhook URL")
				t.Logf("Slack alert attempted for %s: %v", scenario.name, err)

				// Test email alert for this failure
				err = utils.SendEmailTestFailureAlert(scenario.testName, scenario.errorMsg, scenario.buildURL)
				assert.Error(t, err, "Should fail with test SMTP credentials")
				t.Logf("Email alert attempted for %s: %v", scenario.name, err)
			})
		}

		t.Log("Alert system test completed - all alert functions executed successfully")
	})

	t.Run("Alert System Integration Test", func(t *testing.T) {
		// Test that the alert system can be called from the notification utilities
		t.Log("Testing alert system integration...")

		// Test Slack connection test
		err := utils.TestSlackConnection()
		assert.Error(t, err, "Should fail with test webhook URL")
		assert.Contains(t, err.Error(), "Slack webhook returned status", "Should attempt to test Slack connection")

		// Test email connection test
		err = utils.TestEmailConnection()
		assert.Error(t, err, "Should fail with test SMTP credentials")
		assert.Contains(t, err.Error(), "failed to connect to SMTP server", "Should attempt to test email connection")

		t.Log("Alert system integration test completed")
	})
}

func TestAlertSystemWithoutCredentials(t *testing.T) {
	// Test alert system behavior when credentials are not set
	originalEnv := make(map[string]string)
	envVars := []string{
		"SLACK_WEBHOOK_URL",
		"SMTP_SERVER",
		"SMTP_USER",
		"SMTP_PASS",
		"ALERT_EMAIL_TO",
	}

	// Backup and clear environment variables
	for _, key := range envVars {
		originalEnv[key] = os.Getenv(key)
		os.Unsetenv(key)
	}

	// Restore after test
	defer func() {
		for key, value := range originalEnv {
			if value == "" {
				os.Unsetenv(key)
			} else {
				os.Setenv(key, value)
			}
		}
	}()

	t.Run("Slack Alert Without Credentials", func(t *testing.T) {
		err := utils.SendSlackAlert("Test alert without credentials")
		assert.Error(t, err, "Should fail when SLACK_WEBHOOK_URL is not set")
		assert.Contains(t, err.Error(), "SLACK_WEBHOOK_URL environment variable not set")
	})

	t.Run("Email Alert Without Credentials", func(t *testing.T) {
		err := utils.SendEmailAlert("Test Alert", "Test message without credentials")
		assert.Error(t, err, "Should fail when SMTP credentials are not set")
		assert.Contains(t, err.Error(), "SMTP_SERVER environment variable not set")
	})

	t.Run("Email Config Without Credentials", func(t *testing.T) {
		_, err := utils.GetEmailConfig()
		assert.Error(t, err, "Should fail to get email config without credentials")
		assert.Contains(t, err.Error(), "SMTP_SERVER environment variable not set")
	})
}
