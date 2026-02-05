-- Create the onboarding_templates table
CREATE TABLE IF NOT EXISTS public.onboarding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    data JSONB NOT NULL, -- Contains products, suppliers, and default rule settings
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for templates (Read-only for all authenticated users)
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates are viewable by all" ON public.onboarding_templates FOR SELECT USING (true);

-- Seed with a Pizza Shop template
INSERT INTO public.onboarding_templates (name, category, description, data)
VALUES (
    'Pizza Shop Standard',
    'Restaurant',
    'Standard setup for a pizza shop including flour, cheese, sauce, and cardboard boxes.',
    '{
        "products": [
            {"name": "Harina 00 (Saco 25kg)", "unit": "kg", "initial_qty": 50, "min_qty": 20, "reorder_qty": 50, "safety_days": 5},
            {"name": "Mozzarella (Bloque)", "unit": "unidad", "initial_qty": 10, "min_qty": 4, "reorder_qty": 10, "safety_days": 3},
            {"name": "Salsa Tomate (Caja)", "unit": "caja", "initial_qty": 5, "min_qty": 2, "reorder_qty": 5, "safety_days": 4},
            {"name": "Cajas de Pizza 12\"", "unit": "unidad", "initial_qty": 200, "min_qty": 50, "reorder_qty": 200, "safety_days": 7}
        ],
        "suppliers": [
            {"name": "Distribuidora Italiana", "lead_time_hours": 48}
        ],
        "settings": {
            "currency": "RD$",
            "automation_default": "ASSISTED"
        }
    }'::jsonb
) ON CONFLICT (name) DO NOTHING;
