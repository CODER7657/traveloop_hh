-- ============================================================
-- TRAVELOOP — Corrected City Images (verified Unsplash photo IDs)
-- Run this in Supabase SQL Editor → New Query
-- ============================================================

-- ALREADY CORRECT (keep these)
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop' WHERE name = 'Tokyo';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop' WHERE name = 'Paris';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop' WHERE name = 'New York';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop' WHERE name = 'London';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop' WHERE name = 'Bali';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&h=400&fit=crop' WHERE name = 'Rome';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop' WHERE name = 'Dubai';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&h=400&fit=crop' WHERE name = 'Prague';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=400&fit=crop' WHERE name = 'Barcelona';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600&h=400&fit=crop' WHERE name = 'Amsterdam';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop' WHERE name = 'Santorini';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop' WHERE name = 'Maldives';

-- FIXES — wrong photos replaced with correct iconic shots
-- Istanbul → Hagia Sophia / Bosphorus skyline (NOT Taj Mahal)
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=400&fit=crop' WHERE name = 'Istanbul';

-- Singapore → Marina Bay Sands skyline (NOT a diner)
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop' WHERE name = 'Singapore';

-- Sydney → Sydney Opera House + Harbour Bridge
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=400&fit=crop' WHERE name = 'Sydney';

-- Bangkok → Grand Palace / Wat Arun temples at sunset
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&h=400&fit=crop' WHERE name = 'Bangkok';

-- Kyoto → Fushimi Inari torii gates / bamboo grove
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop' WHERE name = 'Kyoto';

-- Cape Town → Table Mountain aerial
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&h=400&fit=crop' WHERE name = 'Cape Town';

-- New Delhi → India Gate
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=400&fit=crop' WHERE name = 'New Delhi';

-- Mexico City → Zócalo / colourful architecture
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&h=400&fit=crop' WHERE name = 'Mexico City';

-- Seoul → N Seoul Tower / skyline
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=400&fit=crop' WHERE name = 'Seoul';

-- Vienna → Schönbrunn Palace / city centre
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1516550135131-fe3dcb5bedc0?w=600&h=400&fit=crop' WHERE name = 'Vienna';

-- Miami → South Beach / Ocean Drive
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=600&h=400&fit=crop' WHERE name = 'Miami';

-- Los Angeles → Hollywood Hills / downtown
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=600&h=400&fit=crop' WHERE name = 'Los Angeles';

-- For any remaining cities still without images, use picsum with the city name as seed
UPDATE cities
SET image_url = 'https://picsum.photos/seed/' || LOWER(REPLACE(name, ' ', '')) || '/600/400'
WHERE image_url IS NULL OR image_url = '';

-- Verify all cities now have images
SELECT name, country, image_url IS NOT NULL AS has_image
FROM cities
ORDER BY popularity DESC;
