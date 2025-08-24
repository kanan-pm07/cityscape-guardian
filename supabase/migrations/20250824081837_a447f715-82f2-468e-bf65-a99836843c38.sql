-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create billboard reports table
CREATE TABLE public.billboard_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create violations table
CREATE TABLE public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.billboard_reports(id) ON DELETE CASCADE NOT NULL,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('size', 'location', 'structural', 'content')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  confidence_score DECIMAL(5, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create permitted billboards reference table
CREATE TABLE public.permitted_billboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_number TEXT NOT NULL UNIQUE,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT NOT NULL,
  dimensions_width DECIMAL(5, 2) NOT NULL,
  dimensions_height DECIMAL(5, 2) NOT NULL,
  permit_expiry DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create city zones table for restricted areas
CREATE TABLE public.restricted_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('heritage', 'religious', 'school', 'hospital', 'highway', 'intersection')),
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billboard_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permitted_billboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricted_zones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for billboard reports
CREATE POLICY "Users can view their own reports" ON public.billboard_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports" ON public.billboard_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON public.billboard_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for violations (read-only for users)
CREATE POLICY "Users can view violations for their reports" ON public.violations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.billboard_reports 
      WHERE billboard_reports.id = violations.report_id 
      AND billboard_reports.user_id = auth.uid()
    )
  );

-- Public read access for reference data
CREATE POLICY "Anyone can view permitted billboards" ON public.permitted_billboards
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view restricted zones" ON public.restricted_zones
  FOR SELECT USING (true);

-- Create storage bucket for billboard images
INSERT INTO storage.buckets (id, name, public) VALUES ('billboard-images', 'billboard-images', false);

-- Create storage policies
CREATE POLICY "Users can upload billboard images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'billboard-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their uploaded images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'billboard-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billboard_reports_updated_at
  BEFORE UPDATE ON public.billboard_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for restricted zones
INSERT INTO public.restricted_zones (zone_name, zone_type, location_lat, location_lng, radius_meters) VALUES
('Red Fort', 'heritage', 28.6562, 77.2410, 500),
('India Gate', 'heritage', 28.6129, 77.2295, 300),
('Jama Masjid', 'religious', 28.6507, 77.2334, 200),
('All India Institute of Medical Sciences', 'hospital', 28.5672, 77.2100, 150),
('Rajghat Primary School', 'school', 28.6418, 77.2493, 200);

-- Insert sample permitted billboards
INSERT INTO public.permitted_billboards (permit_number, location_lat, location_lng, location_address, dimensions_width, dimensions_height, permit_expiry) VALUES
('DEL2024001', 28.6304, 77.2177, 'Connaught Place Circle, New Delhi', 12.00, 20.00, '2024-12-31'),
('DEL2024002', 28.6139, 77.2090, 'Karol Bagh Main Road', 8.00, 15.00, '2024-11-30'),
('DEL2024003', 28.6289, 77.2065, 'Paharganj Main Bazaar', 10.00, 12.00, '2024-10-15');