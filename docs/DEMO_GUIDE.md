# AgroAI Marketplace Demo Guide

## Quick Start (5 minutes)

### Prerequisites
- Database running with demo data
- Backend server on port 8080
- Frontend on port 3000

## Demo Scenarios

### 1. Seller Profile Exploration
1. Navigate to `/sellers/660e8400-e29b-41d4-a716-446655440001` (Mary Kenya)
2. **Show:** Complete profile with verification badge, 5.0 rating, 95.5 reputation
3. **Click:** "Message Seller" to show messaging integration

### 2. Product Card Trust Signals
1. Navigate to `/marketplace`
2. **Show:** Enhanced ProductCard with seller links, verification badges, star ratings
3. **Click:** Seller name to navigate to profile

### 3. Admin Dashboard
1. Navigate to `/admin/monitoring` (admin access required)
2. **Show:** Platform metrics, seller management, analytics
3. **Demonstrate:** Seller verification and reputation recalculation

## Demo Data

| Name | Country | Verified | Rating | Reputation |
|------|---------|----------|--------|------------|
| Mary Kenya | Kenya | ✅ | 5.0 | 95.5 |
| John Uganda | Uganda | ✅ | 3.5 | 78.2 |
| Nairobi Trader | Kenya | ❌ | 3.0 | 45.8 |
| Dodoma NGO | Tanzania | ✅ | 5.0 | 92.3 |

## API Testing

```bash
# Get seller profile
curl http://localhost:8080/api/sellers/660e8400-e29b-41d4-a716-446655440001

# Get platform overview
curl http://localhost:8080/api/admin/monitoring/overview
```

**Demo completed successfully!** 🎉