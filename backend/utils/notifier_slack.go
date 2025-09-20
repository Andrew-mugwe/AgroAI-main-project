package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// SlackMessage represents a Slack message payload
type SlackMessage struct {
	Text        string            `json:"text,omitempty"`
	Username    string            `json:"username,omitempty"`
	IconEmoji   string            `json:"icon_emoji,omitempty"`
	Channel     string            `json:"channel,omitempty"`
	Attachments []SlackAttachment `json:"attachments,omitempty"`
}

// SlackAttachment represents a Slack message attachment
type SlackAttachment struct {
	Color     string            `json:"color,omitempty"`
	Title     string            `json:"title,omitempty"`
	Text      string            `json:"text,omitempty"`
	Fields    []SlackField      `json:"fields,omitempty"`
	Timestamp int64             `json:"ts,omitempty"`
	Footer    string            `json:"footer,omitempty"`
	Actions   []SlackAction     `json:"actions,omitempty"`
}

// SlackField represents a field in a Slack attachment
type SlackField struct {
	Title string `json:"title"`
	Value string `json:"value"`
	Short bool   `json:"short"`
}

// SlackAction represents an action button in Slack
type SlackAction struct {
	Type  string `json:"type"`
	Text  string `json:"text"`
	URL   string `json:"url,omitempty"`
	Style string `json:"style,omitempty"`
}

// SendSlackAlert sends an alert message to Slack
func SendSlackAlert(message string) error {
	webhookURL := os.Getenv("SLACK_WEBHOOK_URL")
	if webhookURL == "" {
		return fmt.Errorf("SLACK_WEBHOOK_URL environment variable not set")
	}

	// Create Slack message
	slackMsg := SlackMessage{
		Text:      message,
		Username:  "AgroAI Bot",
		IconEmoji: ":robot_face:",
		Channel:   "#alerts",
	}

	return sendSlackMessage(webhookURL, slackMsg)
}

// SendSlackTestFailureAlert sends a test failure alert to Slack
func SendSlackTestFailureAlert(testName string, errorMsg string, buildURL string) error {
	webhookURL := os.Getenv("SLACK_WEBHOOK_URL")
	if webhookURL == "" {
		return fmt.Errorf("SLACK_WEBHOOK_URL environment variable not set")
	}

	// Create detailed Slack message with attachments
	slackMsg := SlackMessage{
		Text:      "🚨 Test Failure Alert",
		Username:  "AgroAI CI/CD",
		IconEmoji: ":x:",
		Channel:   "#alerts",
		Attachments: []SlackAttachment{
			{
				Color:     "danger",
				Title:     "Test Failure",
				Text:      fmt.Sprintf("Test `%s` has failed", testName),
				Timestamp: time.Now().Unix(),
				Footer:    "AgroAI CI/CD Pipeline",
				Fields: []SlackField{
					{
						Title: "Test Name",
						Value: testName,
						Short: true,
					},
					{
						Title: "Error Message",
						Value: errorMsg,
						Short: false,
					},
					{
						Title: "Environment",
						Value: os.Getenv("ENVIRONMENT") + " (" + os.Getenv("NODE_ENV") + ")",
						Short: true,
					},
					{
						Title: "Timestamp",
						Value: time.Now().Format("2006-01-02 15:04:05 UTC"),
						Short: true,
					},
				},
				Actions: []SlackAction{
					{
						Type:  "button",
						Text:  "View Build",
						URL:   buildURL,
						Style: "primary",
					},
				},
			},
		},
	}

	return sendSlackMessage(webhookURL, slackMsg)
}

// SendSlackDeploymentAlert sends a deployment alert to Slack
func SendSlackDeploymentAlert(status string, version string, environment string) error {
	webhookURL := os.Getenv("SLACK_WEBHOOK_URL")
	if webhookURL == "" {
		return fmt.Errorf("SLACK_WEBHOOK_URL environment variable not set")
	}

	var color, emoji, title string
	switch status {
	case "success":
		color = "good"
		emoji = ":white_check_mark:"
		title = "Deployment Successful"
	case "failure":
		color = "danger"
		emoji = ":x:"
		title = "Deployment Failed"
	case "started":
		color = "warning"
		emoji = ":rocket:"
		title = "Deployment Started"
	default:
		color = "warning"
		emoji = ":question:"
		title = "Deployment Update"
	}

	slackMsg := SlackMessage{
		Text:      fmt.Sprintf("%s %s", emoji, title),
		Username:  "AgroAI Deploy Bot",
		IconEmoji: ":rocket:",
		Channel:   "#deployments",
		Attachments: []SlackAttachment{
			{
				Color:     color,
				Title:     title,
				Text:      fmt.Sprintf("Deployment to %s environment", environment),
				Timestamp: time.Now().Unix(),
				Footer:    "AgroAI CI/CD Pipeline",
				Fields: []SlackField{
					{
						Title: "Environment",
						Value: environment,
						Short: true,
					},
					{
						Title: "Version",
						Value: version,
						Short: true,
					},
					{
						Title: "Status",
						Value: status,
						Short: true,
					},
					{
						Title: "Timestamp",
						Value: time.Now().Format("2006-01-02 15:04:05 UTC"),
						Short: true,
					},
				},
			},
		},
	}

	return sendSlackMessage(webhookURL, slackMsg)
}

// SendSlackLogsAlert sends a logs-related alert to Slack
func SendSlackLogsAlert(alertType string, message string, details map[string]interface{}) error {
	webhookURL := os.Getenv("SLACK_WEBHOOK_URL")
	if webhookURL == "" {
		return fmt.Errorf("SLACK_WEBHOOK_URL environment variable not set")
	}

	var color, emoji string
	switch alertType {
	case "error":
		color = "danger"
		emoji = ":warning:"
	case "warning":
		color = "warning"
		emoji = ":warning:"
	case "info":
		color = "good"
		emoji = ":information_source:"
	default:
		color = "warning"
		emoji = ":question:"
	}

	// Convert details to fields
	var fields []SlackField
	for key, value := range details {
		fields = append(fields, SlackField{
			Title: key,
			Value: fmt.Sprintf("%v", value),
			Short: true,
		})
	}

	slackMsg := SlackMessage{
		Text:      fmt.Sprintf("%s Logs Alert", emoji),
		Username:  "AgroAI Logs Monitor",
		IconEmoji: ":page_with_curl:",
		Channel:   "#logs",
		Attachments: []SlackAttachment{
			{
				Color:     color,
				Title:     "Activity Logs Alert",
				Text:      message,
				Timestamp: time.Now().Unix(),
				Footer:    "AgroAI Activity Logging System",
				Fields:    fields,
			},
		},
	}

	return sendSlackMessage(webhookURL, slackMsg)
}

// sendSlackMessage sends a message to Slack webhook
func sendSlackMessage(webhookURL string, message SlackMessage) error {
	// Marshal message to JSON
	jsonData, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal Slack message: %v", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", webhookURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Send request
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send Slack message: %v", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("Slack webhook returned status %d", resp.StatusCode)
	}

	return nil
}

// TestSlackConnection tests the Slack webhook connection
func TestSlackConnection() error {
	return SendSlackAlert("🧪 Slack integration test - AgroAI CI/CD system is working correctly!")
}
