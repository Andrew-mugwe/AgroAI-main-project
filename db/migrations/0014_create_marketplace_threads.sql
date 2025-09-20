-- Threads table
CREATE TABLE threads (
  id SERIAL PRIMARY KEY,
  thread_ref TEXT UNIQUE NOT NULL,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT now()
);

-- Participants table
CREATE TABLE thread_participants (
  id SERIAL PRIMARY KEY,
  thread_id INT REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('buyer','seller')),
  created_at TIMESTAMP DEFAULT now()
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  thread_id INT REFERENCES threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
