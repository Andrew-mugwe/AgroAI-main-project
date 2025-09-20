-- Seed data for notifications table
-- Created: 2025-01-15
-- Description: Flow 11 - Sample notifications for testing

-- Sample notifications for each role

-- Sample notifications for all roles with exact messages as specified

-- Farmer notifications
INSERT INTO notifications (user_id, type, message, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alert', 'Rain expected in your region tomorrow.', 'unread');

-- NGO notifications  
INSERT INTO notifications (user_id, type, message, status) VALUES
  ('22222222-2222-2222-2222-222222222222', 'info', '3 new farmers joined your project group.', 'unread');

-- Trader notifications
INSERT INTO notifications (user_id, type, message, status) VALUES
  ('33333333-3333-3333-3333-333333333333', 'info', 'Market price for maize increased by 5%.', 'unread');

-- Flow 12: Messaging & Chat Demo Data

-- Create additional sample users for messaging demo
INSERT INTO users (id, email, password_hash, role) VALUES
  ('44444444-4444-4444-4444-444444444444', 'farmer2@example.com', 'hashedpassword', 'farmer') ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, password_hash, role) VALUES
  ('55555555-5555-5555-5555-555555555555', 'farmer3@example.com', 'hashedpassword', 'farmer') ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, password_hash, role) VALUES
  ('66666666-6666-6666-6666-666666666666', 'ngo2@example.com', 'hashedpassword', 'ngo') ON CONFLICT (id) DO NOTHING;

-- Create conversations
INSERT INTO conversations (id, type, created_at) VALUES
  (1, 'direct', NOW() - INTERVAL '2 days'),
  (2, 'group', NOW() - INTERVAL '1 day'),
  (3, 'direct', NOW() - INTERVAL '6 hours');

-- Add conversation members
-- Direct conversation: Farmer (11111111) ↔ Trader (33333333)
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES
  (1, '11111111-1111-1111-1111-111111111111', 'farmer', NOW() - INTERVAL '2 days'),
  (1, '33333333-3333-3333-3333-333333333333', 'trader', NOW() - INTERVAL '2 days');

-- Group conversation: NGO (22222222) with 3 farmers
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES
  (2, '22222222-2222-2222-2222-222222222222', 'ngo', NOW() - INTERVAL '1 day'),
  (2, '11111111-1111-1111-1111-111111111111', 'farmer', NOW() - INTERVAL '1 day'),
  (2, '44444444-4444-4444-4444-444444444444', 'farmer', NOW() - INTERVAL '1 day'),
  (2, '55555555-5555-5555-5555-555555555555', 'farmer', NOW() - INTERVAL '1 day');

-- Direct conversation: Trader (33333333) ↔ NGO (66666666)
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES
  (3, '33333333-3333-3333-3333-333333333333', 'trader', NOW() - INTERVAL '6 hours'),
  (3, '66666666-6666-6666-6666-666666666666', 'ngo', NOW() - INTERVAL '6 hours');

-- Insert messages for direct conversation (Farmer ↔ Trader)
INSERT INTO messages (conversation_id, sender_id, body, created_at, status) VALUES
  (1, '11111111-1111-1111-1111-111111111111', 'Hi! I have 50kg of fresh maize ready for sale. Are you interested?', NOW() - INTERVAL '2 days', 'read'),
  (1, '33333333-3333-3333-3333-333333333333', 'Yes, I am interested! What is your asking price per kg?', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes', 'read'),
  (1, '11111111-1111-1111-1111-111111111111', 'I am asking 2.50 USD per kg. The maize is organic and freshly harvested.', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', 'read'),
  (1, '33333333-3333-3333-3333-333333333333', 'That sounds good! I can offer 2.30 USD per kg. When can you deliver?', NOW() - INTERVAL '1 day', 'delivered');

-- Insert messages for group conversation (NGO → Farmers)
INSERT INTO messages (conversation_id, sender_id, body, created_at, status) VALUES
  (2, '22222222-2222-2222-2222-222222222222', 'Good morning farmers! We have a new training session on sustainable farming practices next week. Who is interested?', NOW() - INTERVAL '1 day', 'read'),
  (2, '11111111-1111-1111-1111-111111111111', 'I am interested! What time and where will it be held?', NOW() - INTERVAL '1 day' + INTERVAL '2 hours', 'read'),
  (2, '22222222-2222-2222-2222-222222222222', 'It will be on Tuesday at 10 AM in the community center. We will cover crop rotation and soil health.', NOW() - INTERVAL '1 day' + INTERVAL '3 hours', 'read'),
  (2, '44444444-4444-4444-4444-444444444444', 'Count me in! I have been struggling with soil fertility.', NOW() - INTERVAL '1 day' + INTERVAL '4 hours', 'read'),
  (2, '55555555-5555-5555-5555-555555555555', 'I will also attend. Can we discuss pest management too?', NOW() - INTERVAL '1 day' + INTERVAL '5 hours', 'delivered');

-- Insert messages for direct conversation (Trader ↔ NGO)
INSERT INTO messages (conversation_id, sender_id, body, created_at, status) VALUES
  (3, '33333333-3333-3333-3333-333333333333', 'Hello! I would like to partner with your NGO to supply quality seeds to farmers in your program.', NOW() - INTERVAL '6 hours', 'read'),
  (3, '66666666-6666-6666-6666-666666666666', 'That sounds like a great partnership opportunity! We work with over 200 farmers in the region. What seeds do you specialize in?', NOW() - INTERVAL '5 hours', 'delivered');

