-- AgroAI Marketplace Messaging & Chat Migration
-- Migration: 0015_create_marketplace_threads.sql
-- Description: Creates marketplace-specific chat threads tied to products and orders

-- Create marketplace threads table
CREATE TABLE IF NOT EXISTS marketplace_threads (
    id SERIAL PRIMARY KEY,
    thread_ref VARCHAR(64) UNIQUE NOT NULL,
    product_id UUID REFERENCES marketplace_products(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'escalated')),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    -- Ensure unique thread per product/order for buyer-seller pair
    CONSTRAINT unique_thread_per_product UNIQUE (product_id, buyer_id, seller_id),
    CONSTRAINT unique_thread_per_order UNIQUE (order_id, buyer_id, seller_id)
);

-- Create thread participants table
CREATE TABLE IF NOT EXISTS marketplace_thread_participants (
    id SERIAL PRIMARY KEY,
    thread_id INT NOT NULL REFERENCES marketplace_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('buyer', 'seller', 'ngo', 'admin')),
    joined_at TIMESTAMP DEFAULT now(),
    last_read_at TIMESTAMP DEFAULT now(),
    
    -- Ensure unique participant per thread
    UNIQUE(thread_id, user_id)
);

-- Create marketplace messages table (extends existing messages concept)
CREATE TABLE IF NOT EXISTS marketplace_messages (
    id SERIAL PRIMARY KEY,
    thread_id INT NOT NULL REFERENCES marketplace_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_threads_product ON marketplace_threads(product_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_threads_order ON marketplace_threads(order_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_threads_buyer ON marketplace_threads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_threads_seller ON marketplace_threads(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_threads_status ON marketplace_threads(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_threads_updated ON marketplace_threads(updated_at);

CREATE INDEX IF NOT EXISTS idx_marketplace_thread_participants_thread ON marketplace_thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_thread_participants_user ON marketplace_thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_thread_participants_role ON marketplace_thread_participants(role);

CREATE INDEX IF NOT EXISTS idx_marketplace_messages_thread_created ON marketplace_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_sender ON marketplace_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_type ON marketplace_messages(message_type);

-- Create function to generate thread references
CREATE OR REPLACE FUNCTION generate_thread_ref()
RETURNS TEXT AS $$
DECLARE
    thread_ref TEXT;
BEGIN
    -- Generate a unique thread reference: "thread_" + random string
    thread_ref := 'thread_' || substr(md5(random()::text), 1, 12);
    
    -- Ensure uniqueness by checking existing threads
    WHILE EXISTS (SELECT 1 FROM marketplace_threads WHERE marketplace_threads.thread_ref = thread_ref) LOOP
        thread_ref := 'thread_' || substr(md5(random()::text), 1, 12);
    END LOOP;
    
    RETURN thread_ref;
END;
$$ LANGUAGE plpgsql;

-- Create function to update thread updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_marketplace_threads_updated_at
    BEFORE UPDATE ON marketplace_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_marketplace_thread_updated_at();

-- Create function to update message updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_message_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update message updated_at timestamp
CREATE TRIGGER update_marketplace_messages_updated_at
    BEFORE UPDATE ON marketplace_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_marketplace_message_updated_at();

-- Create view for thread summary with latest message
CREATE OR REPLACE VIEW marketplace_thread_summary AS
SELECT 
    mt.id,
    mt.thread_ref,
    mt.product_id,
    mt.order_id,
    mt.buyer_id,
    mt.seller_id,
    mt.status,
    mt.created_at,
    mt.updated_at,
    
    -- Product info
    mp.name as product_name,
    mp.price as product_price,
    
    -- Order info
    o.quantity as order_quantity,
    o.total_price as order_total,
    o.status as order_status,
    
    -- User info
    buyer.name as buyer_name,
    seller.name as seller_name,
    
    -- Latest message
    latest_msg.body as latest_message_body,
    latest_msg.created_at as latest_message_at,
    latest_msg.sender_id as latest_message_sender,
    sender.name as latest_message_sender_name,
    
    -- Participant counts
    (SELECT COUNT(*) FROM marketplace_thread_participants mtp WHERE mtp.thread_id = mt.id) as participant_count,
    
    -- Unread count per participant
    (SELECT COUNT(*) FROM marketplace_messages mm 
     WHERE mm.thread_id = mt.id 
     AND mm.created_at > COALESCE(mtp.last_read_at, mt.created_at)) as unread_count
     
FROM marketplace_threads mt
LEFT JOIN marketplace_products mp ON mt.product_id = mp.id
LEFT JOIN orders o ON mt.order_id = o.id
LEFT JOIN users buyer ON mt.buyer_id = buyer.id
LEFT JOIN users seller ON mt.seller_id = seller.id
LEFT JOIN LATERAL (
    SELECT mm.body, mm.created_at, mm.sender_id
    FROM marketplace_messages mm
    WHERE mm.thread_id = mt.id
    ORDER BY mm.created_at DESC
    LIMIT 1
) latest_msg ON true
LEFT JOIN users sender ON latest_msg.sender_id = sender.id
LEFT JOIN marketplace_thread_participants mtp ON mtp.thread_id = mt.id;

-- Create function to create or get existing thread
CREATE OR REPLACE FUNCTION create_or_get_marketplace_thread(
    p_product_id UUID DEFAULT NULL,
    p_order_id UUID DEFAULT NULL,
    p_buyer_id UUID,
    p_seller_id UUID
)
RETURNS TEXT AS $$
DECLARE
    thread_ref TEXT;
    thread_id INT;
BEGIN
    -- Check if thread already exists
    IF p_product_id IS NOT NULL THEN
        SELECT mt.thread_ref INTO thread_ref
        FROM marketplace_threads mt
        WHERE mt.product_id = p_product_id 
        AND mt.buyer_id = p_buyer_id 
        AND mt.seller_id = p_seller_id;
    ELSIF p_order_id IS NOT NULL THEN
        SELECT mt.thread_ref INTO thread_ref
        FROM marketplace_threads mt
        WHERE mt.order_id = p_order_id 
        AND mt.buyer_id = p_buyer_id 
        AND mt.seller_id = p_seller_id;
    END IF;
    
    -- If thread exists, return it
    IF thread_ref IS NOT NULL THEN
        RETURN thread_ref;
    END IF;
    
    -- Create new thread
    thread_ref := generate_thread_ref();
    
    INSERT INTO marketplace_threads (thread_ref, product_id, order_id, buyer_id, seller_id)
    VALUES (thread_ref, p_product_id, p_order_id, p_buyer_id, p_seller_id)
    RETURNING id INTO thread_id;
    
    -- Add buyer and seller as participants
    INSERT INTO marketplace_thread_participants (thread_id, user_id, role)
    VALUES 
        (thread_id, p_buyer_id, 'buyer'),
        (thread_id, p_seller_id, 'seller');
    
    RETURN thread_ref;
END;
$$ LANGUAGE plpgsql;

-- Insert sample marketplace threads for demo
INSERT INTO marketplace_threads (thread_ref, product_id, buyer_id, seller_id, status, created_at) VALUES
    ('thread_demo_beans_001', (SELECT id FROM marketplace_products LIMIT 1), 
     '789e0123-e89b-12d3-a456-426614174002', '890e1234-e89b-12d3-a456-426614174003', 'open', NOW() - INTERVAL '2 days'),
    ('thread_demo_seeds_002', (SELECT id FROM marketplace_products LIMIT 1 OFFSET 1), 
     '890e1234-e89b-12d3-a456-426614174006', '901e2345-e89b-12d3-a456-426614174007', 'open', NOW() - INTERVAL '1 day'),
    ('thread_demo_tools_003', (SELECT id FROM marketplace_products LIMIT 1 OFFSET 2), 
     '901e2345-e89b-12d3-a456-426614174010', '012e3456-e89b-12d3-a456-426614174011', 'escalated', NOW() - INTERVAL '3 hours');

-- Add participants to demo threads
INSERT INTO marketplace_thread_participants (thread_id, user_id, role, joined_at) 
SELECT 
    mt.id,
    CASE 
        WHEN mt.thread_ref = 'thread_demo_beans_001' THEN '789e0123-e89b-12d3-a456-426614174002'
        WHEN mt.thread_ref = 'thread_demo_seeds_002' THEN '890e1234-e89b-12d3-a456-426614174006'
        WHEN mt.thread_ref = 'thread_demo_tools_003' THEN '901e2345-e89b-12d3-a456-426614174010'
    END,
    'buyer',
    mt.created_at
FROM marketplace_threads mt
WHERE mt.thread_ref LIKE 'thread_demo_%'

UNION ALL

SELECT 
    mt.id,
    CASE 
        WHEN mt.thread_ref = 'thread_demo_beans_001' THEN '890e1234-e89b-12d3-a456-426614174003'
        WHEN mt.thread_ref = 'thread_demo_seeds_002' THEN '901e2345-e89b-12d3-a456-426614174007'
        WHEN mt.thread_ref = 'thread_demo_tools_003' THEN '012e3456-e89b-12d3-a456-426614174011'
    END,
    'seller',
    mt.created_at
FROM marketplace_threads mt
WHERE mt.thread_ref LIKE 'thread_demo_%';

-- Add NGO participant to escalated thread
INSERT INTO marketplace_thread_participants (thread_id, user_id, role, joined_at)
SELECT mt.id, '456e7890-e89b-12d3-a456-426614174020', 'ngo', NOW() - INTERVAL '1 hour'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_tools_003';

-- Insert sample messages
INSERT INTO marketplace_messages (thread_id, sender_id, body, message_type, created_at) 
SELECT 
    mt.id,
    '789e0123-e89b-12d3-a456-426614174002',
    'Hi! I''m interested in your 50kg beans. What''s the best price you can offer?',
    'text',
    NOW() - INTERVAL '2 days'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_beans_001'

UNION ALL

SELECT 
    mt.id,
    '890e1234-e89b-12d3-a456-426614174003',
    'Hello! For 50kg, I can offer $2.50 per kg. That would be $125 total.',
    'text',
    NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_beans_001'

UNION ALL

SELECT 
    mt.id,
    '789e0123-e89b-12d3-a456-426614174002',
    'That sounds good! When can you deliver?',
    'text',
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_beans_001'

UNION ALL

SELECT 
    mt.id,
    '890e1234-e89b-12d3-a456-426614174003',
    'I can deliver within 2-3 days. Would you like to proceed with the order?',
    'text',
    NOW() - INTERVAL '1 day' + INTERVAL '3 hours'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_beans_001'

UNION ALL

-- Messages for seeds thread
SELECT 
    mt.id,
    '890e1234-e89b-12d3-a456-426614174006',
    'Is pesticide X safe for maize? I''m concerned about organic certification.',
    'text',
    NOW() - INTERVAL '1 day'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_seeds_002'

UNION ALL

SELECT 
    mt.id,
    '901e2345-e89b-12d3-a456-426614174007',
    'Yes, pesticide X is certified organic and safe for maize. I can provide the certification documents.',
    'text',
    NOW() - INTERVAL '1 day' + INTERVAL '1 hour'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_seeds_002'

UNION ALL

SELECT 
    mt.id,
    '890e1234-e89b-12d3-a456-426614174006',
    'Perfect! Please send the documents and I''ll place the order.',
    'text',
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_seeds_002'

UNION ALL

-- Messages for escalated tools thread
SELECT 
    mt.id,
    '901e2345-e89b-12d3-a456-426614174010',
    'The tools I received are damaged and not as described. This is unacceptable!',
    'text',
    NOW() - INTERVAL '3 hours'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_tools_003'

UNION ALL

SELECT 
    mt.id,
    '012e3456-e89b-12d3-a456-426614174011',
    'I apologize for the issue. Let me check the shipment and get back to you.',
    'text',
    NOW() - INTERVAL '3 hours' + INTERVAL '30 minutes'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_tools_003'

UNION ALL

SELECT 
    mt.id,
    '456e7890-e89b-12d3-a456-426614174020',
    'I''ve joined this thread to help resolve the dispute. Let me review the case.',
    'text',
    NOW() - INTERVAL '1 hour'
FROM marketplace_threads mt
WHERE mt.thread_ref = 'thread_demo_tools_003';

-- Add comments for documentation
COMMENT ON TABLE marketplace_threads IS 'Marketplace chat threads tied to products or orders';
COMMENT ON TABLE marketplace_thread_participants IS 'Users participating in marketplace threads';
COMMENT ON TABLE marketplace_messages IS 'Messages within marketplace threads';
COMMENT ON VIEW marketplace_thread_summary IS 'Summary view of marketplace threads with latest messages';
