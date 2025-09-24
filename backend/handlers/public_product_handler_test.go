package handlers

// Flow14.1.1

import "testing"

func TestParseInt64Ptr(t *testing.T) {
	if v := parseInt64Ptr(""); v != nil {
		t.Fatalf("expected nil for empty string")
	}
	if v := parseInt64Ptr("abc"); v != nil {
		t.Fatalf("expected nil for invalid int")
	}
	if v := parseInt64Ptr("123"); v == nil || *v != 123 {
		t.Fatalf("expected 123 got %v", v)
	}
}
