-- Insert key Bhubaneswar locations as restricted zones with valid zone types
INSERT INTO public.restricted_zones (zone_name, zone_type, location_lat, location_lng, radius_meters)
VALUES 
    ('Lingaraj Temple', 'religious', 20.23833, 85.83361, 500),
    ('KIIT University', 'school', 20.3019, 85.8197, 1000),
    ('SOA University (Siksha O Anusandhan)', 'school', 20.2590372, 85.79181, 1000),
    ('Odisha Vidhan Sabha (Legislative Assembly)', 'heritage', 20.2961, 85.8245, 800);