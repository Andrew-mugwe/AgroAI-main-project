-- Migration: Create messaging tables
-- Created: 2025-01-15
-- Description: Flow 12 - Messaging & Chat system

-- Create conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create conversation_members table
CREATE TABLE conversation_members (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('farmer', 'ngo', 'trader', 'admin')),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'delivered' CHECK (status IN ('delivered', 'read'))
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_member_user ON conversation_members(user_id);
CREATE INDEX idx_conversation_member_conversation ON conversation_members(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_status ON messages(status);

-- Add comments for documentation
COMMENT ON TABLE conversations IS 'Chat conversations (direct or group)';
COMMENT ON TABLE conversation_members IS 'Users participating in conversations';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
