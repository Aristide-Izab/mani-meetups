-- Add username column to businesses table for customer search
ALTER TABLE public.businesses 
ADD COLUMN username text UNIQUE;

-- Create index for faster username searches
CREATE INDEX idx_businesses_username ON public.businesses(username);