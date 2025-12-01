-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false);

-- Create table for PDF metadata
CREATE TABLE public.pdf_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pdf_library ENABLE ROW LEVEL SECURITY;

-- RLS policies for pdf_library (public access for now since no auth)
CREATE POLICY "Anyone can view PDFs"
ON public.pdf_library
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert PDFs"
ON public.pdf_library
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete PDFs"
ON public.pdf_library
FOR DELETE
USING (true);

-- Storage policies for pdfs bucket
CREATE POLICY "Anyone can view PDFs in storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pdfs');

CREATE POLICY "Anyone can upload PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'pdfs');

CREATE POLICY "Anyone can delete PDFs from storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'pdfs');