package payments

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type MpesaProvider struct {
	consumerKey    string
	consumerSecret string
	baseURL        string
	accessToken    string
	tokenExpiry    time.Time
}

type MpesaTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
}

type MpesaSTKPushRequest struct {
	BusinessShortCode string `json:"BusinessShortCode"`
	Password          string `json:"Password"`
	Timestamp         string `json:"Timestamp"`
	TransactionType   string `json:"TransactionType"`
	Amount            int    `json:"Amount"`
	PartyA            string `json:"PartyA"`
	PartyB            string `json:"PartyB"`
	PhoneNumber       string `json:"PhoneNumber"`
	CallBackURL       string `json:"CallBackURL"`
	AccountReference  string `json:"AccountReference"`
	TransactionDesc   string `json:"TransactionDesc"`
}

type MpesaSTKPushResponse struct {
	MerchantRequestID   string `json:"MerchantRequestID"`
	CheckoutRequestID   string `json:"CheckoutRequestID"`
	ResponseCode        string `json:"ResponseCode"`
	ResponseDescription string `json:"ResponseDescription"`
	CustomerMessage     string `json:"CustomerMessage"`
}

func NewMpesaProvider() *MpesaProvider {
	consumerKey := os.Getenv("MPESA_CONSUMER_KEY")
	consumerSecret := os.Getenv("MPESA_CONSUMER_SECRET")
	
	// Use sandbox for demo
	baseURL := "https://sandbox.safaricom.co.ke"
	if consumerKey == "" || consumerSecret == "" {
		baseURL = "https://sandbox.safaricom.co.ke" // Demo mode
	}
	
	return &MpesaProvider{
		consumerKey:    consumerKey,
		consumerSecret: consumerSecret,
		baseURL:        baseURL,
	}
}

func (m *MpesaProvider) CreatePayment(amount float64, currency string, metadata map[string]string) (PaymentResponse, error) {
	// For demo purposes, simulate M-Pesa payment
	// In production, this would initiate STK Push
	
	// Generate demo transaction ID
	transactionID := fmt.Sprintf("MPESA_%d", time.Now().Unix())
	
	// Simulate processing delay
	time.Sleep(2 * time.Second)
	
	// For demo, assume payment is completed
	status := PaymentStatusCompleted
	
	// Extract phone number from metadata
	phoneNumber := "254708374149" // Default demo number
	if phone, exists := metadata["phone"]; exists {
		phoneNumber = phone
	}
	
	return PaymentResponse{
		TransactionID: transactionID,
		Status:        status,
		Amount:        amount,
		Currency:      currency,
		Provider:      "mpesa",
		Metadata: map[string]string{
			"phone_number": phoneNumber,
			"mpesa_code":   fmt.Sprintf("QAI%s", transactionID),
			"demo":         "true",
		},
	}, nil
}

func (m *MpesaProvider) RefundPayment(transactionID string, amount float64) error {
	// For demo purposes, simulate refund
	fmt.Printf("M-Pesa refund initiated: %s, Amount: %.2f\n", transactionID, amount)
	return nil
}

func (m *MpesaProvider) VerifyPayment(transactionID string) (PaymentStatus, error) {
	// For demo purposes, assume all payments are completed
	return PaymentStatusCompleted, nil
}

// getAccessToken gets M-Pesa access token
func (m *MpesaProvider) getAccessToken() (string, error) {
	// Check if token is still valid
	if m.accessToken != "" && time.Now().Before(m.tokenExpiry) {
		return m.accessToken, nil
	}
	
	// For demo, return a mock token
	if m.consumerKey == "" || m.consumerSecret == "" {
		m.accessToken = "demo_access_token"
		m.tokenExpiry = time.Now().Add(1 * time.Hour)
		return m.accessToken, nil
	}
	
	// In production, make actual API call to get token
	url := fmt.Sprintf("%s/oauth/v1/generate?grant_type=client_credentials", m.baseURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}
	
	req.SetBasicAuth(m.consumerKey, m.consumerSecret)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	
	var tokenResp MpesaTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", err
	}
	
	m.accessToken = tokenResp.AccessToken
	m.tokenExpiry = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)
	
	return m.accessToken, nil
}

// initiateSTKPush initiates STK Push payment
func (m *MpesaProvider) initiateSTKPush(amount float64, phoneNumber string, accountReference string) (*MpesaSTKPushResponse, error) {
	// For demo purposes, return mock response
	return &MpesaSTKPushResponse{
		MerchantRequestID:   fmt.Sprintf("ws_CO_%d", time.Now().Unix()),
		CheckoutRequestID:   fmt.Sprintf("ws_CO_%d", time.Now().Unix()),
		ResponseCode:        "0",
		ResponseDescription: "Success. Request accepted for processing",
		CustomerMessage:     "Success. Request accepted for processing",
	}, nil
}