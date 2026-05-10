-- USERS (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  email TEXT,
  travel_style TEXT, -- Override: Adventure, Relaxation, Food, Budget, Luxury
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CITIES (seed data — not user-created)
CREATE TABLE cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT,
  cost_index INTEGER,              -- 1=cheap, 5=expensive
  popularity INTEGER DEFAULT 0,   -- search ranking
  image_url TEXT,
  lat DECIMAL,
  lng DECIMAL
);

-- ACTIVITIES (seed data per city)
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,                       -- sightseeing | food | adventure | culture | nightlife
  cost DECIMAL DEFAULT 0,
  duration_mins INTEGER,
  description TEXT,
  image_url TEXT
);

-- TRIPS (user created)
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  cover_url TEXT,
  vibe_tag TEXT,                   -- adventure | relaxation | food | budget | luxury
  is_public BOOLEAN DEFAULT false,
  slug TEXT UNIQUE,                -- for public share URL
  total_budget DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOPS (cities within a trip, ordered)
CREATE TABLE stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id),
  city_name TEXT,                  -- denormalized for speed
  arrival_date DATE,
  departure_date DATE,
  order_index INTEGER DEFAULT 0,
  notes TEXT
);

-- TRIP ACTIVITIES (activities assigned to stops)
CREATE TABLE trip_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id),
  activity_name TEXT,             -- denormalized
  scheduled_date DATE,
  scheduled_time TIME,
  cost_override DECIMAL,          -- user can override default cost
  is_done BOOLEAN DEFAULT false
);

-- BUDGET ITEMS
CREATE TABLE budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT,                   -- transport | stay | activities | meals | misc
  label TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  date DATE
);

-- CHECKLIST ITEMS
CREATE TABLE checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  category TEXT,                   -- clothing | documents | electronics | toiletries | misc
  is_packed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- NOTES / JOURNAL
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
