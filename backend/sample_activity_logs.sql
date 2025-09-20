-- Sample Activity Logs for AgroAI Platform
-- This file demonstrates the types of activities that will be logged

-- Sample user activities
INSERT INTO activity_logs (user_id, role, action, metadata, ip_address, user_agent, created_at) VALUES
-- Authentication activities
('550e8400-e29b-41d4-a716-446655440001', 'farmer', 'LOGIN', 
 '{"login_time": 1705320000, "endpoint": "/api/auth/login", "success": true}', 
 '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '1 hour'),

('550e8400-e29b-41d4-a716-446655440002', 'trader', 'SIGNUP', 
 '{"signup_time": 1705316400, "endpoint": "/api/auth/signup", "role": "trader"}', 
 '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 
 NOW() - INTERVAL '2 hours'),

-- Role change activities
('550e8400-e29b-41d4-a716-446655440001', 'trader', 'ROLE_CHANGE', 
 '{"old_role": "farmer", "new_role": "trader", "change_time": 1705312800, "endpoint": "/api/user/role"}', 
 '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '3 hours'),

-- Farmer activities
('550e8400-e29b-41d4-a716-446655440003', 'farmer', 'FETCH_WEATHER', 
 '{"location": "Nairobi, Kenya", "coordinates": {"lat": -1.2921, "lng": 36.8219}, "action_time": 1705309200}', 
 '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 
 NOW() - INTERVAL '4 hours'),

('550e8400-e29b-41d4-a716-446655440003', 'farmer', 'CROP_ADVICE', 
 '{"crop_type": "maize", "season": "rainy", "location": "Nairobi", "action_time": 1705305600}', 
 '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 
 NOW() - INTERVAL '5 hours'),

-- Trader activities
('550e8400-e29b-41d4-a716-446655440002', 'trader', 'CREATE_ORDER', 
 '{"order_id": "ORD-2024-001", "amount": 1500.00, "currency": "KES", "items": ["maize", "beans"], "action_time": 1705302000}', 
 '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 
 NOW() - INTERVAL '6 hours'),

('550e8400-e29b-41d4-a716-446655440002', 'trader', 'UPDATE_PRODUCT', 
 '{"product_id": "PROD-001", "old_price": 50.00, "new_price": 55.00, "action_time": 1705298400}', 
 '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 
 NOW() - INTERVAL '7 hours'),

-- NGO activities
('550e8400-e29b-41d4-a716-446655440004', 'ngo', 'CREATE_GROUP', 
 '{"group_id": "GROUP-001", "group_name": "Sustainable Farming Initiative", "location": "Kisumu", "action_time": 1705294800}', 
 '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', 
 NOW() - INTERVAL '8 hours'),

('550e8400-e29b-41d4-a716-446655440004', 'ngo', 'ADD_REPORT', 
 '{"report_id": "RPT-001", "report_type": "sustainability", "group_id": "GROUP-001", "action_time": 1705291200}', 
 '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', 
 NOW() - INTERVAL '9 hours'),

-- System activities
(NULL, 'SYSTEM', 'DATABASE_BACKUP', 
 '{"backup_size": "2.5GB", "duration": "15 minutes", "status": "success", "system_time": 1705287600}', 
 '127.0.0.1', 'PostgreSQL Backup System', 
 NOW() - INTERVAL '10 hours'),

(NULL, 'SYSTEM', 'CACHE_CLEANUP', 
 '{"cleaned_keys": 1500, "freed_memory": "256MB", "system_time": 1705284000}', 
 '127.0.0.1', 'Redis Cache Manager', 
 NOW() - INTERVAL '11 hours'),

-- Multiple login attempts (for security monitoring)
('550e8400-e29b-41d4-a716-446655440005', 'farmer', 'LOGIN_FAILED', 
 '{"attempt_count": 3, "reason": "invalid_password", "endpoint": "/api/auth/login", "blocked": false}', 
 '192.168.1.104', 'Mozilla/5.0 (Android 12; Mobile; rv:91.0) Gecko/91.0 Firefox/91.0', 
 NOW() - INTERVAL '12 hours'),

-- API usage tracking
('550e8400-e29b-41d4-a716-446655440001', 'trader', 'API_CALL', 
 '{"endpoint": "/api/trader/analytics", "method": "GET", "response_time": 150, "status_code": 200}', 
 '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '13 hours'),

-- File upload activities
('550e8400-e29b-41d4-a716-446655440003', 'farmer', 'UPLOAD_IMAGE', 
 '{"file_name": "crop_photo_001.jpg", "file_size": 2048576, "upload_time": 1705276800}', 
 '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 
 NOW() - INTERVAL '14 hours'),

-- Marketplace activities
('550e8400-e29b-41d4-a716-446655440002', 'trader', 'VIEW_PRODUCT', 
 '{"product_id": "PROD-002", "view_duration": 45, "action_time": 1705273200}', 
 '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 
 NOW() - INTERVAL '15 hours'),

-- Error tracking
('550e8400-e29b-41d4-a716-446655440001', 'trader', 'API_ERROR', 
 '{"error_code": "VALIDATION_ERROR", "error_message": "Invalid product data", "endpoint": "/api/trader/products", "action_time": 1705269600}', 
 '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '16 hours');

-- Query examples for testing the activity logs
-- 
-- Get all login activities in the last 24 hours:
-- SELECT * FROM activity_logs WHERE action = 'LOGIN' AND created_at >= NOW() - INTERVAL '24 hours';
--
-- Get all activities for a specific user:
-- SELECT * FROM activity_logs WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' ORDER BY created_at DESC;
--
-- Get system activities:
-- SELECT * FROM activity_logs WHERE role = 'SYSTEM' ORDER BY created_at DESC;
--
-- Get failed login attempts:
-- SELECT * FROM activity_logs WHERE action = 'LOGIN_FAILED' ORDER BY created_at DESC;
--
-- Get activities by IP address (for security monitoring):
-- SELECT * FROM activity_logs WHERE ip_address = '192.168.1.100' ORDER BY created_at DESC;
