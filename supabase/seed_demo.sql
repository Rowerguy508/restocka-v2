-- ============================================
-- DEMO DATA SEED - POLLO VITORINA
-- ============================================
-- Run this in Supabase Dashboard SQL Editor
-- https://zsewmpjceuomivvbyjgl.supabase.co

-- Step 1: Create demo organization
INSERT INTO organizations (name, slug, plan, settings)
VALUES (
    'Pollos Vitorina',
    'pollos-vitorina',
    'pro',
    '{"currency": "DOP", "timezone": "America/Santo_Domingo", "low_stock_threshold": 10, "critical_stock_threshold": 5}'
)
ON CONFLICT DO NOTHING;

-- Get the org ID
DO $$
DECLARE demo_org_id UUID;
BEGIN
    SELECT id INTO demo_org_id FROM organizations WHERE slug = 'pollos-vitorina';

    -- Step 2: Create main location
    INSERT INTO locations (organization_id, name, address, gps_coordinates, is_active)
    VALUES (
        demo_org_id,
        'Main',
        'Av.Principal 123, Santo Domingo',
        ST_SetSRID(ST_MakePoint(-69.9312, 18.4861), 4326),
        true
    )
    ON CONFLICT DO NOTHING;

    -- Step 3: Create products
    -- Proteins
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price)
    VALUES
        (demo_org_id, 'Pollo Entero', 'POL-001', 'Proteínas', 'lb', 3.50, 5.99),
        (demo_org_id, 'Pechuga de Pollo', 'POL-002', 'Proteínas', 'lb', 4.50, 7.99),
        (demo_org_id, 'Muslos de Pollo', 'POL-003', 'Proteínas', 'lb', 3.00, 5.49)
    ON CONFLICT (organization_id, sku) DO NOTHING;

    -- Sides
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price)
    VALUES
        (demo_org_id, 'Papas Fritas', 'SID-001', 'Acompañamientos', 'lb', 1.20, 3.49),
        (demo_org_id, 'Arroz Blanco', 'SID-002', 'Acompañamientos', 'lb', 0.80, 2.49),
        (demo_org_id, 'Habichuelas', 'SID-003', 'Acompañamientos', 'lb', 1.00, 2.99),
        (demo_org_id, 'Ensalada Verde', 'SID-004', 'Acompañamientos', 'portion', 0.60, 2.49)
    ON CONFLICT (organization_id, sku) DO NOTHING;

    -- Sauces
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price)
    VALUES
        (demo_org_id, 'Salsa BBQ', 'SAC-001', 'Salsas', 'gal', 8.00, 15.99),
        (demo_org_id, 'Salsa Picante', 'SAC-002', 'Salsas', 'gal', 6.00, 12.99),
        (demo_org_id, 'Ketchup', 'SAC-003', 'Salsas', 'gal', 4.00, 8.99)
    ON CONFLICT (organization_id, sku) DO NOTHING;

    -- Beverages
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price)
    VALUES
        (demo_org_id, 'Refresco Cola', 'BEV-001', 'Bebidas', 'can', 0.50, 1.49),
        (demo_org_id, 'Agua Natural', 'BEV-002', 'Bebidas', 'bottle', 0.30, 1.00),
        (demo_org_id, 'Limonada Natural', 'BEV-003', 'Bebidas', 'glass', 0.40, 2.49)
    ON CONFLICT (organization_id, sku) DO NOTHING;

    -- Desserts
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price)
    VALUES
        (demo_org_id, 'Flan de Queso', 'DES-001', 'Postres', 'portion', 0.80, 3.49),
        (demo_org_id, 'Pastel de Naranja', 'DES-002', 'Postres', 'slice', 0.90, 3.99)
    ON CONFLICT (organization_id, sku) DO NOTHING;

    -- Step 4: Create stock levels
    INSERT INTO stock_levels (location_id, product_id, quantity, min_stock, max_stock, status, usage_rate_per_day)
    SELECT 
        l.id, p.id,
        CASE p.sku
            WHEN 'POL-001' THEN 25 WHEN 'POL-002' THEN 45 WHEN 'POL-003' THEN 60
            WHEN 'SID-001' THEN 15 WHEN 'SID-002' THEN 80 WHEN 'SID-003' THEN 40
            WHEN 'SID-004' THEN 8  WHEN 'SAC-001' THEN 3  WHEN 'SAC-002' THEN 12
            WHEN 'SAC-003' THEN 6  WHEN 'BEV-001' THEN 200 WHEN 'BEV-002' THEN 150
            WHEN 'BEV-003' THEN 30 WHEN 'DES-001' THEN 18 WHEN 'DES-002' THEN 22
        END,
        15, 100,
        CASE 
            WHEN p.sku IN ('SID-004', 'SAC-001', 'SAC-003') THEN 'CRITICAL'
            WHEN p.sku IN ('POL-001', 'SID-001', 'SAC-002', 'DES-001') THEN 'LOW'
            ELSE 'NORMAL'
        END,
        CASE p.sku
            WHEN 'POL-001' THEN 8.5 WHEN 'POL-002' THEN 5.2 WHEN 'POL-003' THEN 7.8
            WHEN 'SID-001' THEN 6.0 WHEN 'SID-002' THEN 12.5 WHEN 'SID-003' THEN 4.5
            WHEN 'SID-004' THEN 3.2 WHEN 'SAC-001' THEN 0.8 WHEN 'SAC-002' THEN 1.5
            WHEN 'SAC-003' THEN 1.2 WHEN 'BEV-001' THEN 15.0 WHEN 'BEV-002' THEN 8.0
            WHEN 'BEV-003' THEN 5.5 WHEN 'DES-001' THEN 2.8 WHEN 'DES-002' THEN 3.2
        END
    FROM locations l, products p
    WHERE l.organization_id = demo_org_id AND l.name = 'Main'
    AND p.organization_id = demo_org_id
    ON CONFLICT (location_id, product_id) DO NOTHING;

    RAISE NOTICE 'Demo data created!';
END $$;

-- Verify
SELECT 
    o.name as org,
    COUNT(DISTINCT l.id) as locations,
    COUNT(DISTINCT p.id) as products,
    COUNT(DISTINCT sl.id) as stock_items,
    COUNT(CASE WHEN sl.status = 'CRITICAL' THEN 1 END) as critical,
    COUNT(CASE WHEN sl.status = 'LOW' THEN 1 END) as low_stock
FROM organizations o
LEFT JOIN locations l ON l.organization_id = o.id
LEFT JOIN products p ON p.organization_id = o.id
LEFT JOIN stock_levels sl ON sl.location_id = l.id AND sl.product_id = p.id
WHERE o.slug = 'pollos-vitorina'
GROUP BY o.name;
