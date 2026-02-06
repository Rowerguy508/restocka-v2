-- Demo Organization Seed - Pollo Vitorina
-- Run this to populate demo data for Pollo Vitorina restaurant
-- Organization ID: pollos-vitorina-demo

-- First, let's create the demo organization if it doesn't exist
DO $$
DECLARE 
    demo_org_id UUID;
    demo_user_id UUID;
    main_loc_id UUID;
BEGIN
    -- Check if demo organization exists
    SELECT id INTO demo_org_id FROM organizations WHERE slug = 'pollos-vitorina';
    
    IF demo_org_id IS NULL THEN
        -- Create demo organization
        INSERT INTO organizations (name, slug, plan, settings)
        VALUES (
            'Pollos Vitorina',
            'pollos-vitorina',
            'pro',
            '{
                "currency": "DOP",
                "timezone": "America/Santo_Domingo",
                "low_stock_threshold": 10,
                "critical_stock_threshold": 5,
                "auto_reorder_enabled": false,
                "notifications": {
                    "email": true,
                    "push": false,
                    "low_stock": true,
                    "stockouts": true,
                    "order_status": true
                }
            }'::jsonb
        )
        RETURNING id INTO demo_org_id;
        
        RAISE NOTICE 'Created demo organization: %', demo_org_id;
    ELSE
        RAISE NOTICE 'Demo organization already exists: %', demo_org_id;
    END IF;

    -- Get or create demo user (owner@test.com)
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'owner@test.com';
    
    IF demo_user_id IS NULL THEN
        RAISE WARNING 'Demo user owner@test.com not found - please create via Supabase Auth first';
    ELSE
        RAISE NOTICE 'Demo user found: %', demo_user_id;
        
        -- Create profile if not exists
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = demo_user_id) THEN
            INSERT INTO profiles (id, email, full_name, avatar_url, preferences)
            VALUES (
                demo_user_id,
                'owner@test.com',
                'Dueño Demo',
                null,
                '{}'::jsonb
            );
            RAISE NOTICE 'Created profile for demo user';
        END IF;
        
        -- Create membership if not exists
        IF NOT EXISTS (SELECT 1 FROM memberships WHERE organization_id = demo_org_id AND user_id = demo_user_id) THEN
            INSERT INTO memberships (organization_id, user_id, role, invited_at, accepted_at)
            VALUES (
                demo_org_id,
                demo_user_id,
                'owner',
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Created ownership membership';
        END IF;
    END IF;

    -- Create main location if not exists
    SELECT id INTO main_loc_id FROM locations WHERE organization_id = demo_org_id AND name = 'Main';
    
    IF main_loc_id IS NULL THEN
        INSERT INTO locations (organization_id, name, address, gps_coordinates, is_active, settings)
        VALUES (
            demo_org_id,
            'Main',
            'Av.Principal 123, Santo Domingo',
            ST_SetSRID(ST_MakePoint(-69.9312, 18.4861), 4326),
            true,
            '{
                "type": "restaurant",
                "operating_hours": {
                    "monday": {"open": "08:00", "close": "23:00"},
                    "tuesday": {"open": "08:00", "close": "23:00"},
                    "wednesday": {"open": "08:00", "close": "23:00"},
                    "thursday": {"open": "08:00", "close": "23:00"},
                    "friday": {"open": "08:00", "close": "23:00"},
                    "saturday": {"open": "09:00", "close": "22:00"},
                    "sunday": {"open": "09:00", "close": "22:00"}
                },
                "manager": null
            }'::jsonb
        )
        RETURNING id INTO main_loc_id;
        
        RAISE NOTICE 'Created main location: %', main_loc_id;
    ELSE
        RAISE NOTICE 'Main location already exists: %', main_loc_id;
    END IF;

    -- Create kitchen location
    IF NOT EXISTS (SELECT 1 FROM locations WHERE organization_id = demo_org_id AND name = 'Kitchen') THEN
        INSERT INTO locations (organization_id, name, address, gps_coordinates, is_active, settings)
        VALUES (
            demo_org_id,
            'Kitchen',
            'Cocina Principal',
            ST_SetSRID(ST_MakePoint(-69.9315, 18.4860), 4326),
            true,
            '{
                "type": "kitchen",
                "operating_hours": {}
            }'::jsonb
        );
        RAISE NOTICE 'Created Kitchen location';
    END IF;
END $$;

-- Now insert products for the demo organization
-- We'll use a CTE to get the org_id first
DO $$
DECLARE 
    demo_org_id UUID;
    main_loc_id UUID;
BEGIN
    SELECT id INTO demo_org_id FROM organizations WHERE slug = 'pollos-vitorina';
    SELECT id INTO main_loc_id FROM locations WHERE organization_id = demo_org_id AND name = 'Main';
    
    IF demo_org_id IS NULL THEN
        RAISE EXCEPTION 'Demo organization not found. Run the org creation part first.';
    END IF;

    -- Insert demo products (only if they don't exist)
    -- Proteins
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Pollo Entero', 'POL-001', 'Proteínas', 'lb', 3.50, 5.99, NULL, 'Pollo entero de granja', NULL, '{"barcode": "1234567890123"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'POL-001');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Pechuga de Pollo', 'POL-002', 'Proteínas', 'lb', 4.50, 7.99, NULL, 'Pechuga sin hueso', NULL, '{"barcode": "1234567890124"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'POL-002');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Muslos de Pollo', 'POL-003', 'Proteínas', 'lb', 3.00, 5.49, NULL, 'Muslos con hueso', NULL, '{"barcode": "1234567890125"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'POL-003');

    -- Sides
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Papas Fritas', 'SID-001', 'Acompañamientos', 'lb', 1.20, 3.49, NULL, 'Papas fritas crujientes', NULL, '{"barcode": "2234567890123"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'SID-001');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Arroz Blanco', 'SID-002', 'Acompañamientos', 'lb', 0.80, 2.49, NULL, 'Arroz jasmine飘香', NULL, '{"barcode": "2234567890124"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'SID-002');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Habichuelas', 'SID-003', 'Acompañamientos', 'lb', 1.00, 2.99, NULL, 'Habichuelas rojas', NULL, '{"barcode": "2234567890125"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'SID-003');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Ensalada Verde', 'SID-004', 'Acompañamientos', 'portion', 0.60, 2.49, NULL, 'Lechuga, tomate, pepino', NULL, '{"barcode": "2234567890126"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'SID-004');

    -- Sauces
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Salsa BBQ', 'SAC-001', 'Salsas', 'gal', 8.00, 15.99, NULL, 'Salsa barbacoa casera', NULL, '{"barcode": "3234567890123"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'SAC-001');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Salsa Picante', 'SAC-002', 'Salsas', 'gal', 6.00, 12.99, NULL, 'Ají suave dominican', NULL, '{"barcode": "3234567890124"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'SAC-002');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Ketchup', 'SAC-003', 'Salsas', 'gal', 4.00, 8.99, NULL, 'Ketchup clásico', NULL, '{"barcode": "3234567890125"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'SAC-003');

    -- Beverages
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Refresco Cola', 'BEV-001', 'Bebidas', 'can', 0.50, 1.49, NULL, 'Lata 12oz', NULL, '{"barcode": "4234567890123"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'BEV-001');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Agua Natural', 'BEV-002', 'Bebidas', 'bottle', 0.30, 1.00, NULL, 'Botella 500ml', NULL, '{"barcode": "4234567890124"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'BEV-002');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Limonada Natural', 'BEV-003', 'Bebidas', 'glass', 0.40, 2.49, NULL, 'Limonada casera', NULL, '{"barcode": "4234567890125"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'BEV-003');

    -- Desserts
    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Flan de Queso', 'DES-001', 'Postres', 'portion', 0.80, 3.49, NULL, 'Flan casero', NULL, '{"barcode": "5234567890123"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'DES-001');

    INSERT INTO products (organization_id, name, sku, category, unit, cost_price, selling_price, supplier_id, description, image_url, settings)
    SELECT demo_org_id, 'Pastel de Naranja', 'DES-002', 'Postres', 'slice', 0.90, 3.99, NULL, 'Pastel húmedo', NULL, '{"barcode": "5234567890124"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE organization_id = demo_org_id AND sku = 'DES-002');

    RAISE NOTICE 'Products created successfully';
END $$;

-- Now create stock levels for the demo organization
DO $$
DECLARE 
    demo_org_id UUID;
    main_loc_id UUID;
BEGIN
    SELECT id, (SELECT id FROM locations WHERE slug = 'main') INTO demo_org_id, main_loc_id 
    FROM organizations WHERE slug = 'pollos-vitorina';
    
    IF demo_org_id IS NULL OR main_loc_id IS NULL THEN
        RAISE EXCEPTION 'Organization or location not found';
    END IF;

    -- Create stock levels with varying quantities (some low, some normal)
    INSERT INTO stock_levels (location_id, product_id, quantity, min_stock, max_stock, status, last_restocked_at, usage_rate_per_day)
    SELECT 
        main_loc_id,
        p.id,
        CASE p.sku
            WHEN 'POL-001' THEN 25  -- LOW - Need reorder
            WHEN 'POL-002' THEN 45  -- Normal
            WHEN 'POL-003' THEN 60  -- Good
            WHEN 'SID-001' THEN 15  -- LOW - Need reorder
            WHEN 'SID-002' THEN 80  -- Good
            WHEN 'SID-003' THEN 40  -- Normal
            WHEN 'SID-004' THEN 8   -- CRITICAL - Urgent
            WHEN 'SAC-001' THEN 3   -- CRITICAL - Urgent
            WHEN 'SAC-002' THEN 12  -- LOW
            WHEN 'SAC-003' THEN 6   -- CRITICAL
            WHEN 'BEV-001' THEN 200 -- Good
            WHEN 'BEV-002' THEN 150 -- Good
            WHEN 'BEV-003' THEN 30 -- Normal
            WHEN 'DES-001' THEN 18  -- LOW
            WHEN 'DES-002' THEN 22  -- Normal
        END,
        CASE p.sku
            WHEN 'POL-001' THEN 30
            WHEN 'POL-002' THEN 20
            WHEN 'POL-003' THEN 30
            WHEN 'SID-001' THEN 20
            WHEN 'SID-002' THEN 40
            WHEN 'SID-003' THEN 20
            WHEN 'SID-004' THEN 15
            WHEN 'SAC-001' THEN 5
            WHEN 'SAC-002' THEN 10
            WHEN 'SAC-003' THEN 8
            WHEN 'BEV-001' THEN 50
            WHEN 'BEV-002' THEN 50
            WHEN 'BEV-003' THEN 15
            WHEN 'DES-001' THEN 10
            WHEN 'DES-002' THEN 10
        END,
        CASE p.sku
            WHEN 'POL-001' THEN 100
            WHEN 'POL-002' THEN 80
            WHEN 'POL-003' THEN 100
            WHEN 'SID-001' THEN 60
            WHEN 'SID-002' THEN 150
            WHEN 'SID-003' THEN 60
            WHEN 'SID-004' THEN 40
            WHEN 'SAC-001' THEN 20
            WHEN 'SAC-002' THEN 30
            WHEN 'SAC-003' THEN 25
            WHEN 'BEV-001' THEN 300
            WHEN 'BEV-002' THEN 200
            WHEN 'BEV-003' THEN 50
            WHEN 'DES-001' THEN 30
            WHEN 'DES-002' THEN 30
        END,
        CASE 
            WHEN CASE p.sku
                WHEN 'POL-001' THEN 25
                WHEN 'POL-002' THEN 45
                WHEN 'POL-003' THEN 60
                WHEN 'SID-001' THEN 15
                WHEN 'SID-002' THEN 80
                WHEN 'SID-003' THEN 40
                WHEN 'SID-004' THEN 8
                WHEN 'SAC-001' THEN 3
                WHEN 'SAC-002' THEN 12
                WHEN 'SAC-003' THEN 6
                WHEN 'BEV-001' THEN 200
                WHEN 'BEV-002' THEN 150
                WHEN 'BEV-003' THEN 30
                WHEN 'DES-001' THEN 18
                WHEN 'DES-002' THEN 22
            END <= 10 THEN 'CRITICAL'
            WHEN CASE p.sku
                WHEN 'POL-001' THEN 25
                WHEN 'POL-002' THEN 45
                WHEN 'POL-003' THEN 60
                WHEN 'SID-001' THEN 15
                WHEN 'SID-002' THEN 80
                WHEN 'SID-003' THEN 40
                WHEN 'SID-004' THEN 8
                WHEN 'SAC-001' THEN 3
                WHEN 'SAC-002' THEN 12
                WHEN 'SAC-003' THEN 6
                WHEN 'BEV-001' THEN 200
                WHEN 'BEV-002' THEN 150
                WHEN 'BEV-003' THEN 30
                WHEN 'DES-001' THEN 18
                WHEN 'DES-002' THEN 22
            END <= 20 THEN 'LOW'
            ELSE 'NORMAL'
        END,
        NOW() - INTERVAL '2 days',
        CASE p.sku
            WHEN 'POL-001' THEN 8.5
            WHEN 'POL-002' THEN 5.2
            WHEN 'POL-003' THEN 7.8
            WHEN 'SID-001' THEN 6.0
            WHEN 'SID-002' THEN 12.5
            WHEN 'SID-003' THEN 4.5
            WHEN 'SID-004' THEN 3.2
            WHEN 'SAC-001' THEN 0.8
            WHEN 'SAC-002' THEN 1.5
            WHEN 'SAC-003' THEN 1.2
            WHEN 'BEV-001' THEN 15.0
            WHEN 'BEV-002' THEN 8.0
            WHEN 'BEV-003' THEN 5.5
            WHEN 'DES-001' THEN 2.8
            WHEN 'DES-002' THEN 3.2
        END
    FROM products p
    WHERE p.organization_id = demo_org_id
    ON CONFLICT (location_id, product_id) DO NOTHING;

    RAISE NOTICE 'Stock levels created successfully';
END $$;

-- Verify the demo data
SELECT 
    o.name as organization,
    l.name as location,
    COUNT(p.id) as products,
    COUNT(sl.id) as stock_entries,
    COUNT(CASE WHEN sl.status = 'CRITICAL' THEN 1 END) as critical_items,
    COUNT(CASE WHEN sl.status = 'LOW' THEN 1 END) as low_items
FROM organizations o
CROSS JOIN LATERAL (SELECT id FROM locations WHERE organization_id = o.id AND name = 'Main') l
LEFT JOIN products p ON p.organization_id = o.id
LEFT JOIN stock_levels sl ON sl.location_id = l.id AND sl.product_id = p.id
WHERE o.slug = 'pollos-vitorina'
GROUP BY o.name, l.name;
