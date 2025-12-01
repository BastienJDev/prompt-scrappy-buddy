-- Add content column to store extracted PDF text
ALTER TABLE public.pdf_library
ADD COLUMN content TEXT,
ADD COLUMN parsed_at TIMESTAMP WITH TIME ZONE;