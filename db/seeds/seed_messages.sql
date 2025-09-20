-- Flow 12: Messaging & Chat Demo Data
-- This file contains role-specific conversations and messages for demo purposes

-- Ensure we have the required demo users (create if not exists)
INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'farmer1@agroai.com', '$2a$10$hashedpassword', 'farmer', 'John', 'Farmer') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('22222222-2222-2222-2222-222222222222', 'ngo1@agroai.com', '$2a$10$hashedpassword', 'ngo', 'Sarah', 'NGO') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('33333333-3333-3333-3333-333333333333', 'trader1@agroai.com', '$2a$10$hashedpassword', 'trader', 'Mike', 'Trader') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('44444444-4444-4444-4444-444444444444', 'farmer2@agroai.com', '$2a$10$hashedpassword', 'farmer', 'Jane', 'Farmer') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('55555555-5555-5555-5555-555555555555', 'farmer3@agroai.com', '$2a$10$hashedpassword', 'farmer', 'Peter', 'Farmer') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('66666666-6666-6666-6666-666666666666', 'ngo2@agroai.com', '$2a$10$hashedpassword', 'ngo', 'Lisa', 'NGO') ON CONFLICT (id) DO NOTHING;

-- Create conversations
INSERT INTO conversations (id, type, created_at) VALUES
  (1, 'direct', NOW() - INTERVAL '2 days'),
  (2, 'group', NOW() - INTERVAL '1 day'),
  (3, 'direct', NOW() - INTERVAL '6 hours'),
  (4, 'direct', NOW() - INTERVAL '1 day'),
  (5, 'direct', NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Add conversation members
-- Conversation 1: Farmer ↔ NGO (John ↔ Sarah)
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES
  (1, '11111111-1111-1111-1111-111111111111', 'farmer', NOW() - INTERVAL '2 days'),
  (1, '22222222-2222-2222-2222-222222222222', 'ngo', NOW() - INTERVAL '2 days')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Conversation 2: Group conversation (NGO with 3 farmers)
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES
  (2, '22222222-2222-2222-2222-222222222222', 'ngo', NOW() - INTERVAL '1 day'),
  (2, '11111111-1111-1111-1111-111111111111', 'farmer', NOW() - INTERVAL '1 day'),
  (2, '44444444-4444-4444-4444-444444444444', 'farmer', NOW() - INTERVAL '1 day'),
  (2, '55555555-5555-5555-5555-555555555555', 'farmer', NOW() - INTERVAL '1 day')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Conversation 3: Trader ↔ NGO (Mike ↔ Sarah)
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES
  (3, '33333333-3333-3333-3333-333333333333', 'trader', NOW() - INTERVAL '6 hours'),
  (3, '22222222-2222-2222-2222-222222222222', 'ngo', NOW() - INTERVAL '6 hours')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Conversation 4: Trader ↔ Farmer (Mike ↔ John)
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES
  (4, '33333333-3333-3333-3333-333333333333', 'trader', NOW() - INTERVAL '1 day'),
  (4, '11111111-1111-1111-1111-111111111111', 'farmer', NOW() - INTERVAL '1 day')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Conversation 5: NGO ↔ Trader (Lisa ↔ Mike)
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES
  (5, '66666666-6666-6666-6666-666666666666', 'ngo', NOW() - INTERVAL '3 hours'),
  (5, '33333333-3333-3333-3333-333333333333', 'trader', NOW() - INTERVAL '3 hours')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Insert messages for Conversation 1 (Farmer ↔ NGO)
INSERT INTO messages (conversation_id, sender_id, body, created_at, status) VALUES
  (1, '11111111-1111-1111-1111-111111111111', 'Hello Sarah! I need advice on crop rotation for my maize field. What do you recommend?', NOW() - INTERVAL '2 days', 'read'),
  (1, '22222222-2222-2222-2222-222222222222', 'Hi John! For maize, I recommend rotating with legumes like beans or groundnuts. This helps with nitrogen fixation and soil health.', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes', 'read'),
  (1, '11111111-1111-1111-1111-111111111111', 'That sounds great! When is the best time to plant the legumes after harvesting maize?', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', 'read'),
  (1, '22222222-2222-2222-2222-222222222222', 'Plant legumes 2-3 weeks after maize harvest, during the short rains. This gives the soil time to recover and the legumes will benefit from the residual nutrients.', NOW() - INTERVAL '1 day', 'delivered');

-- Insert messages for Conversation 2 (Group: NGO → Farmers)
INSERT INTO messages (conversation_id, sender_id, body, created_at, status) VALUES
  (2, '22222222-2222-2222-2222-222222222222', 'Good morning farmers! We have a new training session on sustainable farming practices next week. Who is interested?', NOW() - INTERVAL '1 day', 'read'),
  (2, '11111111-1111-1111-1111-111111111111', 'I am interested! What time and where will it be held?', NOW() - INTERVAL '1 day' + INTERVAL '2 hours', 'read'),
  (2, '22222222-2222-2222-2222-222222222222', 'It will be on Tuesday at 10 AM in the community center. We will cover crop rotation, soil health, and pest management.', NOW() - INTERVAL '1 day' + INTERVAL '3 hours', 'read'),
  (2, '44444444-4444-4444-4444-444444444444', 'Count me in! I have been struggling with soil fertility in my fields.', NOW() - INTERVAL '1 day' + INTERVAL '4 hours', 'read'),
  (2, '55555555-5555-5555-5555-555555555555', 'I will also attend. Can we discuss organic fertilizers too?', NOW() - INTERVAL '1 day' + INTERVAL '5 hours', 'delivered');

-- Insert messages for Conversation 3 (Trader ↔ NGO)
INSERT INTO messages (conversation_id, sender_id, body, created_at, status) VALUES
  (3, '33333333-3333-3333-3333-333333333333', 'Hello Sarah! I would like to partner with your NGO to supply quality seeds to farmers in your program.', NOW() - INTERVAL '6 hours', 'read'),
  (3, '22222222-2222-2222-2222-222222222222', 'That sounds like a great partnership opportunity! We work with over 200 farmers in the region. What seeds do you specialize in?', NOW() - INTERVAL '5 hours', 'delivered');

-- Insert messages for Conversation 4 (Trader ↔ Farmer)
INSERT INTO messages (conversation_id, sender_id, body, created_at, status) VALUES
  (4, '33333333-3333-3333-3333-333333333333', 'Hi John! I have 50kg of fresh maize ready for sale. Are you interested?', NOW() - INTERVAL '1 day', 'read'),
  (4, '11111111-1111-1111-1111-111111111111', 'Yes, I am interested! What is your asking price per kg?', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 'read'),
  (4, '33333333-3333-3333-3333-333333333333', 'I am asking 2.50 USD per kg. The maize is organic and freshly harvested.', NOW() - INTERVAL '1 day' + INTERVAL '1 hour', 'read'),
  (4, '11111111-1111-1111-1111-111111111111', 'That sounds good! I can offer 2.30 USD per kg. When can you deliver?', NOW() - INTERVAL '1 day' + INTERVAL '2 hours', 'delivered');

-- Insert messages for Conversation 5 (NGO ↔ Trader)
INSERT INTO messages (conversation_id, sender_id, body, created_at, status) VALUES
  (5, '66666666-6666-6666-6666-666666666666', 'Hello Mike! We are organizing a farmers market next month. Would you like to participate as a vendor?', NOW() - INTERVAL '3 hours', 'read'),
  (5, '33333333-3333-3333-3333-333333333333', 'Absolutely! That sounds like a great opportunity. What are the requirements and fees?', NOW() - INTERVAL '2 hours', 'delivered');

-- Update conversation sequences to avoid conflicts
SELECT setval('conversations_id_seq', (SELECT MAX(id) FROM conversations));
SELECT setval('conversation_members_id_seq', (SELECT MAX(id) FROM conversation_members));
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));
