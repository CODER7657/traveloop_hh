-- Traveloop Database Schema (Standalone PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PROFILES (replaces Supabase auth.users + profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT DEFAULT '',
  name TEXT,
  avatar_url TEXT,
  travel_style TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CITIES
CREATE TABLE IF NOT EXISTS cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT,
  cost_index INTEGER,
  popularity INTEGER DEFAULT 0,
  image_url TEXT,
  lat DECIMAL,
  lng DECIMAL
);

-- ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  cost DECIMAL DEFAULT 0,
  duration_mins INTEGER,
  description TEXT,
  image_url TEXT
);

-- TRIPS
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  cover_url TEXT,
  vibe_tag TEXT,
  is_public BOOLEAN DEFAULT false,
  slug TEXT UNIQUE,
  total_budget DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOPS
CREATE TABLE IF NOT EXISTS stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id),
  city_name TEXT,
  arrival_date DATE,
  departure_date DATE,
  order_index INTEGER DEFAULT 0,
  notes TEXT
);

-- TRIP ACTIVITIES
CREATE TABLE IF NOT EXISTS trip_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id),
  activity_name TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  cost_override DECIMAL,
  is_done BOOLEAN DEFAULT false
);

-- BUDGET ITEMS
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT,
  label TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  date DATE
);

-- CHECKLIST ITEMS
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  category TEXT,
  is_packed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- NOTES
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED DATA: Indian Cities
-- ============================================
INSERT INTO cities (name, country, continent, cost_index, popularity, lat, lng, image_url) VALUES
('Mumbai', 'India', 'Asia', 3, 95, 19.0760, 72.8777, 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800'),
('Delhi', 'India', 'Asia', 2, 93, 28.7041, 77.1025, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'),
('Bangalore', 'India', 'Asia', 3, 90, 12.9716, 77.5946, 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800'),
('Kolkata', 'India', 'Asia', 2, 85, 22.5726, 88.3639, 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800'),
('Chennai', 'India', 'Asia', 2, 82, 13.0827, 80.2707, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'),
('Hyderabad', 'India', 'Asia', 2, 84, 17.3850, 78.4867, 'https://images.unsplash.com/photo-1572620360785-6f09f6a3d2a0?w=800'),
('Jaipur', 'India', 'Asia', 2, 88, 26.9124, 75.7873, 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'),
('Goa', 'India', 'Asia', 3, 92, 15.2993, 74.1240, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800'),
('Varanasi', 'India', 'Asia', 1, 86, 25.3176, 82.9739, 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800'),
('Agra', 'India', 'Asia', 1, 91, 27.1767, 78.0081, 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'),
('Udaipur', 'India', 'Asia', 2, 87, 24.5854, 73.7125, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800'),
('Jodhpur', 'India', 'Asia', 1, 80, 26.2389, 73.0243, 'https://images.unsplash.com/photo-1599831013079-a8e7aaa56cb9?w=800'),
('Kochi', 'India', 'Asia', 2, 78, 9.9312, 76.2673, 'https://images.unsplash.com/photo-1602158978674-0e3ee7070cd5?w=800'),
('Rishikesh', 'India', 'Asia', 1, 83, 30.0869, 78.2676, 'https://images.unsplash.com/photo-1600250395566-ff37fe4db3b7?w=800'),
('Manali', 'India', 'Asia', 2, 85, 32.2396, 77.1887, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800'),
('Shimla', 'India', 'Asia', 2, 79, 31.1048, 77.1734, 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800'),
('Darjeeling', 'India', 'Asia', 1, 77, 27.0360, 88.2627, 'https://images.unsplash.com/photo-1622308644420-f7746a4a56f6?w=800'),
('Amritsar', 'India', 'Asia', 1, 81, 31.6340, 74.8723, 'https://images.unsplash.com/photo-1609947017136-9daa5e3b22e4?w=800'),
('Pune', 'India', 'Asia', 2, 76, 18.5204, 73.8567, 'https://images.unsplash.com/photo-1572782252655-9c8771392601?w=800'),
('Ahmedabad', 'India', 'Asia', 2, 74, 23.0225, 72.5714, 'https://images.unsplash.com/photo-1627894006066-b45b61a90274?w=800'),
('Mysore', 'India', 'Asia', 1, 75, 12.2958, 76.6394, 'https://images.unsplash.com/photo-1600100397608-89768ab06770?w=800'),
('Leh', 'India', 'Asia', 3, 84, 34.1526, 77.5771, 'https://images.unsplash.com/photo-1626015365107-26ce4337a8e3?w=800'),
('Jaisalmer', 'India', 'Asia', 1, 79, 26.9157, 70.9083, 'https://images.unsplash.com/photo-1626613684268-3b89d1c4a775?w=800'),
('Pondicherry', 'India', 'Asia', 2, 78, 11.9416, 79.8083, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'),
('Ooty', 'India', 'Asia', 1, 73, 11.4102, 76.6950, 'https://images.unsplash.com/photo-1623684227221-5e3b0c78e01f?w=800'),
('Munnar', 'India', 'Asia', 1, 76, 10.0889, 77.0595, 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800'),
('Hampi', 'India', 'Asia', 1, 74, 15.3350, 76.4600, 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'),
('Alleppey', 'India', 'Asia', 2, 77, 9.4981, 76.3388, 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800'),
('Khajuraho', 'India', 'Asia', 1, 70, 24.8318, 79.9199, 'https://images.unsplash.com/photo-1609948543911-7613a0e9a0ea?w=800'),
('Lucknow', 'India', 'Asia', 1, 72, 26.8467, 80.9462, 'https://images.unsplash.com/photo-1572782261349-7bfd56a48157?w=800')
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: Activities
-- ============================================
INSERT INTO activities (city_id, name, type, cost, duration_mins, description)
SELECT id, 'Cycling around the beaches', 'adventure', 15.00, 120, 'Rent a cycle and explore the serene coastal roads.'
FROM cities WHERE name = 'Goa';

INSERT INTO activities (city_id, name, type, cost, duration_mins, description)
SELECT id, 'Scuba Diving', 'adventure', 50.00, 180, 'Discover marine life with guided scuba diving.'
FROM cities WHERE name = 'Goa';

INSERT INTO activities (city_id, name, type, cost, duration_mins, description)
SELECT id, 'Sunset Cruise', 'sightseeing', 20.00, 90, 'Relax on a boat cruise as the sun sets over the Arabian Sea.'
FROM cities WHERE name = 'Goa';

INSERT INTO activities (city_id, name, type, cost, duration_mins, description)
SELECT id, 'Amer Fort Tour', 'culture', 10.00, 240, 'Guided walking tour of the historic Amer Fort.'
FROM cities WHERE name = 'Jaipur';

INSERT INTO activities (city_id, name, type, cost, duration_mins, description)
SELECT id, 'Local Food Walk', 'food', 12.00, 150, 'Taste authentic local snacks and sweets.'
FROM cities WHERE name = 'Jaipur';

INSERT INTO activities (city_id, name, type, cost, duration_mins, description)
SELECT id, 'Gateway of India Visit', 'sightseeing', 0.00, 60, 'Visit the iconic arch monument in Mumbai.'
FROM cities WHERE name = 'Mumbai';

INSERT INTO activities (city_id, name, type, cost, duration_mins, description)
SELECT id, 'Bollywood Studio Tour', 'culture', 30.00, 180, 'Behind the scenes look at the Indian film industry.'
FROM cities WHERE name = 'Mumbai';

INSERT INTO activities (city_id, name, type, cost, duration_mins, description)
SELECT id, 'Ganga Aarti', 'culture', 0.00, 90, 'Witness the spectacular evening prayer on the banks of the Ganges.'
FROM cities WHERE name = 'Varanasi';

INSERT INTO activities (city_id, name, type, cost, duration_mins, description)
SELECT id, 'Taj Mahal Sunrise Visit', 'sightseeing', 20.00, 180, 'Experience the Taj Mahal at dawn.'
FROM cities WHERE name = 'Agra';
