-- Create a table to store business gallery images
CREATE TABLE public.business_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_gallery ENABLE ROW LEVEL SECURITY;

-- Anyone can view gallery images (public portfolio)
CREATE POLICY "Anyone can view gallery images"
ON public.business_gallery
FOR SELECT
USING (true);

-- Business owners can manage their own gallery
CREATE POLICY "Business owners can insert gallery images"
ON public.business_gallery
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can delete gallery images"
ON public.business_gallery
FOR DELETE
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

-- Add phone column to profiles table if it doesn't exist (for contact info)
-- Already exists based on schema

-- Create storage bucket for business gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-gallery', 'business-gallery', true);

-- Storage policies for business gallery
CREATE POLICY "Anyone can view business gallery images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'business-gallery');

CREATE POLICY "Business owners can upload gallery images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'business-gallery' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Business owners can delete their gallery images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'business-gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);