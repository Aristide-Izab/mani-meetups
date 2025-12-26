-- Create a trigger function to create a business record when a business user signs up
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $function$
BEGIN
  -- Only create business record if user_type is 'business'
  IF NEW.raw_user_meta_data->>'user_type' = 'business' THEN
    INSERT INTO public.businesses (owner_id, business_name, username, description)
    VALUES (
      NEW.id,
      TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'surname', '') || '''s Nails'),
      NEW.raw_user_meta_data->>'business_username',
      'Professional nail services'
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Create the trigger on auth.users table (after insert, after the profile is created)
CREATE TRIGGER on_auth_user_created_business
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_business();

-- Insert business records for existing business users who don't have one
INSERT INTO public.businesses (owner_id, business_name, username, description)
SELECT 
  p.id,
  COALESCE(p.full_name, 'Unnamed') || '''s Nails',
  LOWER(REPLACE(COALESCE(p.full_name, 'business_' || LEFT(p.id::text, 8)), ' ', '_')),
  'Professional nail services'
FROM public.profiles p
WHERE p.user_type = 'business'
AND NOT EXISTS (
  SELECT 1 FROM public.businesses b WHERE b.owner_id = p.id
);