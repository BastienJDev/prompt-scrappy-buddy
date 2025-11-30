-- Create table for scraped sites
CREATE TABLE public.scraped_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  site_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scraped_sites ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to select (public data)
CREATE POLICY "Anyone can view scraped sites"
ON public.scraped_sites
FOR SELECT
USING (true);

-- Policy to allow anyone to insert sites
CREATE POLICY "Anyone can insert scraped sites"
ON public.scraped_sites
FOR INSERT
WITH CHECK (true);

-- Policy to allow anyone to delete sites
CREATE POLICY "Anyone can delete scraped sites"
ON public.scraped_sites
FOR DELETE
USING (true);

-- Create index for better performance
CREATE INDEX idx_scraped_sites_category ON public.scraped_sites(category);
CREATE INDEX idx_scraped_sites_created_at ON public.scraped_sites(created_at DESC);