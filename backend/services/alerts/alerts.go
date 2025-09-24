package alerts

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/Andrew-mugwe/agroai/utils"
	"github.com/google/uuid"
)

// AlertService handles alert rule evaluation and notification sending
type AlertService struct {
	db *sql.DB
}

// AlertRule represents a configurable alert rule
type AlertRule struct {
	ID          uuid.UUID       `json:"id"`
	RuleName    string          `json:"rule_name"`
	Description string          `json:"description"`
	Condition   json.RawMessage `json:"condition_json"`
	Channels    json.RawMessage `json:"channels"`
	Active      bool            `json:"active"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

// Alert represents a triggered alert
type Alert struct {
	ID                uuid.UUID       `json:"id"`
	RuleName          string          `json:"rule_name"`
	Severity          string          `json:"severity"`
	TriggeredAt       time.Time       `json:"triggered_at"`
	Payload           json.RawMessage `json:"payload"`
	Delivered         bool            `json:"delivered"`
	DeliveredChannels []string        `json:"delivered_channels"`
	ResolvedAt        *time.Time      `json:"resolved_at"`
	ResolvedBy        *uuid.UUID      `json:"resolved_by"`
	CreatedAt         time.Time       `json:"created_at"`
}

// AlertCondition represents the condition for triggering an alert
type AlertCondition struct {
	Metric    string  `json:"metric"`
	Threshold float64 `json:"threshold"`
	Window    string  `json:"window"`
	Operator  string  `json:"operator"` // ">", "<", ">=", "<=", "=="
}

// NewAlertService creates a new alert service
func NewAlertService(db *sql.DB) *AlertService {
	return &AlertService{db: db}
}

// EvaluateRules evaluates all active alert rules and triggers alerts if conditions are met
func (a *AlertService) EvaluateRules(ctx context.Context) error {
	// Get all active alert rules
	rules, err := a.GetActiveRules(ctx)
	if err != nil {
		return fmt.Errorf("failed to get active rules: %w", err)
	}

	for _, rule := range rules {
		triggered, severity, payload, err := a.evaluateRule(ctx, rule)
		if err != nil {
			log.Printf("Error evaluating rule %s: %v", rule.RuleName, err)
			continue
		}

		if triggered {
			// Create alert
			alert := Alert{
				ID:                uuid.New(),
				RuleName:          rule.RuleName,
				Severity:          severity,
				TriggeredAt:       time.Now(),
				Payload:           payload,
				Delivered:         false,
				DeliveredChannels: []string{},
			}

			if err := a.CreateAlert(ctx, alert); err != nil {
				log.Printf("Error creating alert for rule %s: %v", rule.RuleName, err)
				continue
			}

			// Send notifications
			if err := a.sendNotifications(ctx, rule, alert); err != nil {
				log.Printf("Error sending notifications for rule %s: %v", rule.RuleName, err)
			}
		}
	}

	return nil
}

// GetActiveRules retrieves all active alert rules
func (a *AlertService) GetActiveRules(ctx context.Context) ([]AlertRule, error) {
	query := `
		SELECT id, rule_name, description, condition_json, channels, active, created_at, updated_at
		FROM alert_rules 
		WHERE active = true
		ORDER BY created_at DESC
	`

	rows, err := a.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query alert rules: %w", err)
	}
	defer rows.Close()

	var rules []AlertRule
	for rows.Next() {
		var rule AlertRule
		err := rows.Scan(
			&rule.ID, &rule.RuleName, &rule.Description, &rule.Condition,
			&rule.Channels, &rule.Active, &rule.CreatedAt, &rule.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan alert rule: %w", err)
		}
		rules = append(rules, rule)
	}

	return rules, nil
}

// evaluateRule evaluates a single alert rule and returns whether it should trigger
func (a *AlertService) evaluateRule(ctx context.Context, rule AlertRule) (bool, string, json.RawMessage, error) {
	var condition AlertCondition
	if err := json.Unmarshal(rule.Condition, &condition); err != nil {
		return false, "", nil, fmt.Errorf("failed to unmarshal condition: %w", err)
	}

	// Get current metric value based on condition
	value, err := a.getMetricValue(ctx, condition.Metric, condition.Window)
	if err != nil {
		return false, "", nil, fmt.Errorf("failed to get metric value: %w", err)
	}

	// Evaluate condition
	triggered := false
	switch condition.Operator {
	case ">":
		triggered = value > condition.Threshold
	case "<":
		triggered = value < condition.Threshold
	case ">=":
		triggered = value >= condition.Threshold
	case "<=":
		triggered = value <= condition.Threshold
	case "==":
		triggered = value == condition.Threshold
	default:
		return false, "", nil, fmt.Errorf("unknown operator: %s", condition.Operator)
	}

	if !triggered {
		return false, "", nil, nil
	}

	// Determine severity based on how much threshold is exceeded
	severity := "medium"
	if condition.Operator == ">" || condition.Operator == ">=" {
		excess := value - condition.Threshold
		if excess > condition.Threshold*0.5 {
			severity = "high"
		}
		if excess > condition.Threshold {
			severity = "critical"
		}
	} else if condition.Operator == "<" || condition.Operator == "<=" {
		deficit := condition.Threshold - value
		if deficit > condition.Threshold*0.5 {
			severity = "high"
		}
		if deficit > condition.Threshold {
			severity = "critical"
		}
	}

	// Create payload
	payload := map[string]interface{}{
		"metric":      condition.Metric,
		"value":       value,
		"threshold":   condition.Threshold,
		"operator":    condition.Operator,
		"window":      condition.Window,
		"rule_name":   rule.RuleName,
		"description": rule.Description,
	}

	payloadJSON, _ := json.Marshal(payload)

	return true, severity, payloadJSON, nil
}

// getMetricValue retrieves the current value for a metric
func (a *AlertService) getMetricValue(ctx context.Context, metric, window string) (float64, error) {
	switch metric {
	case "payment_failure_rate":
		return a.getPaymentFailureRate(ctx, window)
	case "avg_seller_reputation":
		return a.getAvgSellerReputation(ctx, window)
	case "dispute_rate":
		return a.getDisputeRate(ctx, window)
	case "system_errors":
		return a.getSystemErrors(ctx, window)
	default:
		return 0, fmt.Errorf("unknown metric: %s", metric)
	}
}

// getPaymentFailureRate calculates payment failure rate for the given window
func (a *AlertService) getPaymentFailureRate(ctx context.Context, window string) (float64, error) {
	var total, failed float64

	// Get total payments in window
	err := a.db.QueryRowContext(ctx, `
		SELECT COUNT(*) 
		FROM payment_transactions 
		WHERE created_at >= NOW() - INTERVAL '1 hour'
	`).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("failed to get total payments: %w", err)
	}

	// Get failed payments in window
	err = a.db.QueryRowContext(ctx, `
		SELECT COUNT(*) 
		FROM payment_transactions 
		WHERE status = 'failed' AND created_at >= NOW() - INTERVAL '1 hour'
	`).Scan(&failed)
	if err != nil {
		return 0, fmt.Errorf("failed to get failed payments: %w", err)
	}

	if total == 0 {
		return 0, nil
	}

	return (failed / total) * 100, nil
}

// getAvgSellerReputation calculates average seller reputation
func (a *AlertService) getAvgSellerReputation(ctx context.Context, window string) (float64, error) {
	var avg float64
	err := a.db.QueryRowContext(ctx, `
		SELECT COALESCE(AVG(rh.score), 50) 
		FROM sellers s
		LEFT JOIN reputation_history rh ON s.id = rh.seller_id
		WHERE rh.created_at >= NOW() - INTERVAL '24 hours'
		ORDER BY rh.created_at DESC
	`).Scan(&avg)
	if err != nil {
		return 50, nil // Default value
	}
	return avg, nil
}

// getDisputeRate calculates dispute rate for the given window
func (a *AlertService) getDisputeRate(ctx context.Context, window string) (float64, error) {
	var total, disputes float64

	// Get total orders in window
	err := a.db.QueryRowContext(ctx, `
		SELECT COUNT(*) 
		FROM orders 
		WHERE created_at >= NOW() - INTERVAL '24 hours'
	`).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("failed to get total orders: %w", err)
	}

	// Get disputes in window
	err = a.db.QueryRowContext(ctx, `
		SELECT COUNT(*) 
		FROM disputes 
		WHERE created_at >= NOW() - INTERVAL '24 hours'
	`).Scan(&disputes)
	if err != nil {
		return 0, fmt.Errorf("failed to get disputes: %w", err)
	}

	if total == 0 {
		return 0, nil
	}

	return (disputes / total) * 100, nil
}

// getSystemErrors calculates system errors for the given window
func (a *AlertService) getSystemErrors(ctx context.Context, window string) (float64, error) {
	var count float64
	err := a.db.QueryRowContext(ctx, `
		SELECT COUNT(*) 
		FROM activity_logs 
		WHERE level = 'ERROR' AND created_at >= NOW() - INTERVAL '1 hour'
	`).Scan(&count)
	if err != nil {
		return 0, nil // Default to 0 if table doesn't exist
	}
	return count, nil
}

// CreateAlert creates a new alert in the database
func (a *AlertService) CreateAlert(ctx context.Context, alert Alert) error {
	query := `
		INSERT INTO alerts (id, rule_name, severity, triggered_at, payload, delivered, delivered_channels, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	channelsJSON, _ := json.Marshal(alert.DeliveredChannels)

	_, err := a.db.ExecContext(ctx, query,
		alert.ID, alert.RuleName, alert.Severity, alert.TriggeredAt,
		alert.Payload, alert.Delivered, channelsJSON, alert.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create alert: %w", err)
	}

	return nil
}

// sendNotifications sends notifications via configured channels
func (a *AlertService) sendNotifications(ctx context.Context, rule AlertRule, alert Alert) error {
	var channels map[string]bool
	if err := json.Unmarshal(rule.Channels, &channels); err != nil {
		return fmt.Errorf("failed to unmarshal channels: %w", err)
	}

	var payload map[string]interface{}
	json.Unmarshal(alert.Payload, &payload)

	message := fmt.Sprintf("🚨 Alert: %s\nSeverity: %s\nRule: %s\nValue: %.2f\nThreshold: %.2f",
		rule.Description, alert.Severity, rule.RuleName,
		payload["value"], payload["threshold"])

	var deliveredChannels []string

	// Send Slack notification
	if channels["slack"] {
		if err := utils.SendSlackAlert(message); err != nil {
			log.Printf("Failed to send Slack alert: %v", err)
		} else {
			deliveredChannels = append(deliveredChannels, "slack")
		}
	}

	// Send email notification
	if channels["email"] {
		subject := fmt.Sprintf("AgroAI Alert: %s", rule.RuleName)
		if err := utils.SendEmailAlert(subject, message); err != nil {
			log.Printf("Failed to send email alert: %v", err)
		} else {
			deliveredChannels = append(deliveredChannels, "email")
		}
	}

	// Update alert with delivery status
	if len(deliveredChannels) > 0 {
		channelsJSON, _ := json.Marshal(deliveredChannels)
		_, err := a.db.ExecContext(ctx, `
			UPDATE alerts 
			SET delivered = true, delivered_channels = $1 
			WHERE id = $2
		`, channelsJSON, alert.ID)
		if err != nil {
			log.Printf("Failed to update alert delivery status: %v", err)
		}
	}

	return nil
}

// GetRecentAlerts retrieves recent alerts with pagination
func (a *AlertService) GetRecentAlerts(ctx context.Context, limit, offset int) ([]Alert, error) {
	query := `
		SELECT id, rule_name, severity, triggered_at, payload, delivered, 
		       delivered_channels, resolved_at, resolved_by, created_at
		FROM alerts 
		ORDER BY triggered_at DESC 
		LIMIT $1 OFFSET $2
	`

	rows, err := a.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query alerts: %w", err)
	}
	defer rows.Close()

	var alerts []Alert
	for rows.Next() {
		var alert Alert
		var deliveredChannelsJSON string
		err := rows.Scan(
			&alert.ID, &alert.RuleName, &alert.Severity, &alert.TriggeredAt,
			&alert.Payload, &alert.Delivered, &deliveredChannelsJSON,
			&alert.ResolvedAt, &alert.ResolvedBy, &alert.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan alert: %w", err)
		}

		// Parse delivered channels
		json.Unmarshal([]byte(deliveredChannelsJSON), &alert.DeliveredChannels)
		alerts = append(alerts, alert)
	}

	return alerts, nil
}

// ResolveAlert marks an alert as resolved
func (a *AlertService) ResolveAlert(ctx context.Context, alertID uuid.UUID, resolvedBy uuid.UUID) error {
	query := `
		UPDATE alerts 
		SET resolved_at = NOW(), resolved_by = $1 
		WHERE id = $2
	`

	_, err := a.db.ExecContext(ctx, query, resolvedBy, alertID)
	if err != nil {
		return fmt.Errorf("failed to resolve alert: %w", err)
	}

	return nil
}

