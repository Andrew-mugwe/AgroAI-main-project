-- Flow 13: Pest & Disease Detection Sample Data
-- This file contains sample pest reports for demo purposes

-- Ensure we have the required demo users (create if not exists)
INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'farmer1@agroai.com', '$2a$10$hashedpassword', 'farmer', 'John', 'Farmer') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('22222222-2222-2222-2222-222222222222', 'ngo1@agroai.com', '$2a$10$hashedpassword', 'ngo', 'Sarah', 'NGO') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('33333333-3333-3333-3333-333333333333', 'trader1@agroai.com', '$2a$10$hashedpassword', 'trader', 'Mike', 'Trader') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
  ('44444444-4444-4444-4444-444444444444', 'farmer2@agroai.com', '$2a$10$hashedpassword', 'farmer', 'Jane', 'Farmer') ON CONFLICT (id) DO NOTHING;

-- Insert sample pest reports
INSERT INTO pest_reports (user_id, image_url, pest_name, confidence, notes, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'assets/seeds/fall_armyworm.png', 'Fall Armyworm', 87.5, 'Detected on maize leaves in the northern field. Heavy infestation observed.', NOW() - INTERVAL '2 days'),
  
  ('11111111-1111-1111-1111-111111111111', 'assets/seeds/leaf_rust.png', 'Leaf Rust', 92.3, 'Found in wheat regions. Early detection allows for timely treatment.', NOW() - INTERVAL '1 day'),
  
  ('44444444-4444-4444-4444-444444444444', 'assets/seeds/aphids.png', 'Aphids', 75.8, 'Common in vegetable gardens. Affecting tomato plants primarily.', NOW() - INTERVAL '3 days'),
  
  ('11111111-1111-1111-1111-111111111111', 'assets/seeds/stemborer.png', 'Stem Borer', 80.2, 'Found in sorghum fields. Requires immediate attention to prevent crop loss.', NOW() - INTERVAL '4 days'),
  
  ('44444444-4444-4444-4444-444444444444', 'assets/seeds/fall_armyworm.png', 'Fall Armyworm', 89.1, 'Second detection in the same field. Spreading rapidly.', NOW() - INTERVAL '1 day'),
  
  ('22222222-2222-2222-2222-222222222222', 'assets/seeds/leaf_rust.png', 'Leaf Rust', 94.7, 'Regional outbreak detected. NGO monitoring for early intervention.', NOW() - INTERVAL '2 days'),
  
  ('11111111-1111-1111-1111-111111111111', 'assets/seeds/aphids.png', 'Aphids', 71.3, 'Minor infestation on cabbage plants. Monitoring for spread.', NOW() - INTERVAL '5 days'),
  
  ('44444444-4444-4444-4444-444444444444', 'assets/seeds/stemborer.png', 'Stem Borer', 83.6, 'Detected in maize field. Implementing integrated pest management.', NOW() - INTERVAL '3 days');

-- Update sequences
SELECT setval('pest_reports_id_seq', (SELECT MAX(id) FROM pest_reports));
