-- Add RNC column to suppliers
ALTER TABLE public.suppliers ADD COLUMN rnc text;
COMMENT ON COLUMN public.suppliers.rnc IS 'Dominican Republic RNC (Tax ID)';
