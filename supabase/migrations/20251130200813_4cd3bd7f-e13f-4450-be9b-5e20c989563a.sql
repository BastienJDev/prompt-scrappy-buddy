-- Add url column to scraped_sites table
ALTER TABLE public.scraped_sites 
ADD COLUMN url TEXT;

-- Update existing rows to use site_name as url if needed (temporary)
UPDATE public.scraped_sites 
SET url = site_name 
WHERE url IS NULL;