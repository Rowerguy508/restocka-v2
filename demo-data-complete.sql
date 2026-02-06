-- ============================================
-- RESTOCKA DEMO DATA SEED
-- Complete with demo user, restaurant, inventory, orders
-- 
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/zsewmpjceuomivvbyjgl
-- 2. Click: SQL Editor (left sidebar)
-- 3. Click: New query
-- 4. Paste this entire script
-- 5. Click: Run
-- ============================================

-- STEP 1: Create demo user (run once)
-- This uses the service role to create a confirmed user
-- You may need to run this separately if table is locked

-- Uncomment and run first time only:
-- SELECT auth.users.count();

-- For first time setup, create user manually:
-- Go to Authentication → Users → Add User
-- Email: demo@restocka.app
-- Password: Demo123!@#
-- Email confirmed: YES

-- ============================================
-- STEP 2: Create all demo data
-- Run this entire script after user is created
-- ============================================

-- Create demo organization
INSERT INTO public.organizations (name, created_at, updated_at)
VALUES ('La Casa del Sabor - Demo', NOW(), NOW())
RETURNING id as org_id;

-- NOTE: Copy the org_id from the result above and replace all 'ORG_ID_HERE' below
-- For this script, we'll use a placeholder - replace manually

-- For quick setup, let's get the org_id we just created:
DO $$
DECLARE 
  demo_org_id uuid;
  demo_loc_id uuid;
  demo_user_id uuid;
BEGIN
  -- Get or create the demo organization
  SELECT id INTO demo_org_id 
  FROM public.organizations 
  WHERE name = 'La Casa del Sabor - Demo';
  
  IF demo_org_id IS NULL THEN
    INSERT INTO public.organizations (name, created_at, updated_at)
    VALUES ('La Casa del Sabor - Demo', NOW(), NOW())
    RETURNING id INTO demo_org_id;
  END IF;
  
  -- Get demo user (create if not exists - you must do this in Authentication tab)
  -- For now, we'll use a placeholder user_id
  demo_user_id := '00000000-0000-0000-0000-000000000000';  -- REPLACE with actual user ID
  
  RAISE NOTICE 'Demo org created/found: %', demo_org_id;
  RAISE NOTICE 'Please create user demo@restocka.app in Authentication tab';
  RAISE NOTICE 'Then update the membership insert below with actual user ID';
END $$;

-- ============================================
-- ALTERNATIVE: Manual setup instructions
-- ============================================

-- 1. Create user in Supabase Dashboard → Authentication → Users
--    Email: demo@restocka.app
--    Password: Demo123!@#
--    Email confirmed: YES

-- 2. Copy the user ID from the user you just created

-- 3. Run this script to create all data

-- ============================================
-- COMPLETE SCRIPT (run after user is created)
-- ============================================

-- Variables - REPLACE with actual IDs from steps above
DO $$
DECLARE 
  v_org_id uuid := 'REPLACE_WITH_ORG_ID';  -- From organizations table
  v_user_id uuid := 'REPLACE_WITH_USER_ID';  -- From auth.users table
  v_loc_id uuid;
  v_sup1_id uuid;
  v_sup2_id uuid;
  v_sup3_id uuid;
  v_sup4_id uuid;
BEGIN
  -- Create location
  INSERT INTO public.locations (organization_id, name, address, is_default, created_at, updated_at)
  VALUES (v_org_id, 'Casa Matriz - Santo Domingo', 'Av. Winston Churchill #123, Santo Domingo', true, NOW(), NOW())
  RETURNING id INTO v_loc_id;
  
  -- Create membership
  INSERT INTO public.memberships (user_id, organization_id, role, status, created_at, updated_at)
  VALUES (v_user_id, v_org_id, 'OWNER', 'ACTIVE', NOW(), NOW());
  
  -- Create suppliers
  INSERT INTO public.suppliers (organization_id, name, phone, email, category, created_at, updated_at)
  VALUES 
  (v_org_id, 'Distribuidora del Caribe', '809-555-0101', 'ventas@caribe.do', 'General', NOW(), NOW()),
  (v_org_id, 'Carnes Premium', '809-555-0202', 'pedidos@carnespremium.com', 'Proteínas', NOW(), NOW()),
  (v_org_id, 'Bebidas del Norte', '809-555-0303', 'ordenes@bebidasnorte.com', 'Bebidas', NOW(), NOW()),
  (v_org_id, 'Verduras Frescas', '809-555-0404', 'entregas@verdurasfrescas.com', 'Vegetales', NOW(), NOW())
  RETURNING id INTO v_sup1_id;
  
  -- Create products
  INSERT INTO public.products (organization_id, name, category, unit, cost_price, created_at, updated_at)
  VALUES 
  (v_org_id, 'Pollo Entero', 'Proteínas', 'UNIT', 85, NOW(), NOW()),
  (v_org_id, 'Pechuga de Pollo', 'Proteínas', 'KG', 180, NOW(), NOW()),
  (v_org_id, 'Muslos de Pollo', 'Proteínas', 'KG', 120, NOW(), NOW()),
  (v_org_id, 'Chuleta Ahumada', 'Proteínas', 'KG', 350, NOW(), NOW()),
  (v_org_id, 'Bistec de Res', 'Proteínas', 'KG', 450, NOW(), NOW()),
  (v_org_id, 'Papas Fritas', 'Acompañamientos', 'KG', 45, NOW(), NOW()),
  (v_org_id, 'Arroz Blanco', 'Acompañamientos', 'KG', 35, NOW(), NOW()),
  (v_org_id, 'Habichuelas Guisadas', 'Acompañamientos', 'GALON', 120, NOW(), NOW()),
  (v_org_id, 'Ensalada Verde', 'Acompañamientos', 'KG', 80, NOW(), NOW()),
  (v_org_id, 'Mangu', 'Acompañamientos', 'KG', 60, NOW(), NOW()),
  (v_org_id, 'Salsa BBQ', 'Salsas', 'LITRO', 150, NOW(), NOW()),
  (v_org_id, 'Salsa Picante', 'Salsas', 'LITRO', 80, NOW(), NOW()),
  (v_org_id, 'Ketchup', 'Salsas', 'LITRO', 60, NOW(), NOW()),
  (v_org_id, 'Mayonesa', 'Salsas', 'LITRO', 95, NOW(), NOW()),
  (v_org_id, 'Refresco Cola', 'Bebidas', 'LATA', 25, NOW(), NOW()),
  (v_org_id, 'Agua Natural 500ml', 'Bebidas', 'UNIT', 15, NOW(), NOW()),
  (v_org_id, 'Limonada Natural', 'Bebidas', 'LITRO', 40, NOW(), NOW()),
  (v_org_id, 'Cerveza Nacional', 'Bebidas', 'UNIT', 55, NOW(), NOW()),
  (v_org_id, 'Flan de Queso', 'Postres', 'UNIT', 35, NOW(), NOW()),
  (v_org_id, 'Pastel de Naranja', 'Postres', 'UNIT', 45, NOW(), NOW()),
  (v_org_id, 'Brownie con Helado', 'Postres', 'UNIT', 65, NOW(), NOW());
  
  -- Create inventory with realistic stock levels
  INSERT INTO public.inventory (organization_id, location_id, product_id, quantity, status, last_checked, created_at, updated_at)
  SELECT 
    v_org_id,
    v_loc_id,
    id,
    CASE name
      WHEN 'Pollo Entero' THEN 0  -- CRITICAL
      WHEN 'Bistec de Res' THEN 1.5  -- CRITICAL
      WHEN 'Muslos de Pollo' THEN 4  -- LOW
      WHEN 'Papas Fritas' THEN 3  -- LOW
      WHEN 'Salsa BBQ' THEN 2  -- LOW
      WHEN 'Cerveza Nacional' THEN 8  -- LOW
      ELSE 15 + (random() * 30)::int  -- NORMAL
    END,
    CASE name
      WHEN 'Pollo Entero' THEN 'CRITICAL'
      WHEN 'Bistec de Res' THEN 'CRITICAL'
      WHEN 'Muslos de Pollo' THEN 'LOW'
      WHEN 'Papas Fritas' THEN 'LOW'
      WHEN 'Salsa BBQ' THEN 'LOW'
      WHEN 'Cerveza Nacional' THEN 'LOW'
      ELSE 'NORMAL'
    END,
    NOW() - (random() * 7)::int * INTERVAL '1 day',  -- Random last check within 7 days
    NOW(),
    NOW()
  FROM public.products WHERE organization_id = v_org_id;
  
  -- Create alerts
  INSERT INTO public.alerts (organization_id, type, product_id, message, resolved, created_at, updated_at)
  SELECT 
    v_org_id,
    'STOCK_CRITICAL',
    id,
    'Producto agotado - 无法 servir este plato',
    false,
    NOW() - (random() * 3)::int * INTERVAL '1 day',
    NOW()
  FROM public.products WHERE name = 'Pollo Entero' AND organization_id = v_org_id
  
  UNION ALL
  
  SELECT v_org_id, 'STOCK_LOW', id, 'Stock bajo - Considera reorderar pronto', false, NOW(), NOW()
  FROM public.products WHERE name = 'Muslos de Pollo' AND organization_id = v_org_id
  
  UNION ALL
  
  SELECT v_org_id, 'ORDER_DELAYED', NULL, 'Orden con Carnes Premium retrasada 2 días', false, NOW() - INTERVAL '1 day', NOW();
  
  RAISE NOTICE 'Demo data created successfully!';
  RAISE NOTICE 'Location ID: %', v_loc_id;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check inventory status summary
-- SELECT status, COUNT(*) as count FROM inventory GROUP BY status;

-- Check all products
-- SELECT * FROM products ORDER BY category, name;

-- Check alerts
-- SELECT * FROM alerts ORDER BY created_at DESC;
