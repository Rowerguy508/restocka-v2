/**
 * Demo Data Seeder - Browser-friendly version
 * 
 * Run this in the browser console on restocka.app/app after logging in as owner
 * OR paste the data into Supabase Dashboard directly
 */

const DEMO_DATA = {
  // Demo user to create in Supabase Dashboard
  user: {
    email: 'demo@restocka.app',
    password: 'Demo123!@#'
  },
  
  organization: {
    name: 'La Casa del Sabor - Demo'
  },
  
  location: {
    name: 'Casa Matriz - Santo Domingo',
    address: 'Av. Winston Churchill #123, Santo Domingo'
  },
  
  // SQL to run in Supabase Dashboard → SQL Editor
  sql: `
-- ============================================
-- DEMO DATA FOR RESTOCKA
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Create demo user (or create manually in Authentication)
-- Skip this if user already exists

-- 2. Create demo organization
INSERT INTO organizations (name, created_at, updated_at)
VALUES ('La Casa del Sabor - Demo', NOW(), NOW())
RETURNING id;

-- 3. Get the org ID and use it for the remaining inserts
-- Let's assume org_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

-- 4. Create location
INSERT INTO locations (organization_id, name, address, is_default, created_at, updated_at)
VALUES (
  'ORG_ID_HERE',  -- Replace with actual org ID
  'Casa Matriz - Santo Domingo', 
  'Av. Winston Churchill #123, Santo Domingo',
  true,
  NOW(),
  NOW()
);

-- 5. Create membership for demo user
INSERT INTO memberships (user_id, organization_id, role, status, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- Replace with user ID from Authentication tab
  'ORG_ID_HERE',
  'OWNER',
  'ACTIVE',
  NOW(),
  NOW()
);

-- 6. Create suppliers
INSERT INTO suppliers (organization_id, name, phone, email, category, created_at, updated_at)
VALUES 
('ORG_ID_HERE', 'Distribuidora del Caribe', '809-555-0101', 'ventas@caribe.do', 'General', NOW(), NOW()),
('ORG_ID_HERE', 'Carnes Premium', '809-555-0202', 'pedidos@carnespremium.com', 'Proteínas', NOW(), NOW()),
('ORG_ID_HERE', 'Bebidas del Norte', '809-555-0303', 'ordenes@bebidasnorte.com', 'Bebidas', NOW(), NOW()),
('ORG_ID_HERE', 'Verduras Frescas', '809-555-0404', 'entregas@verdurasfrescas.com', 'Vegetales', NOW(), NOW());

-- 7. Create products
INSERT INTO products (organization_id, name, category, unit, cost_price, created_at, updated_at)
VALUES 
('ORG_ID_HERE', 'Pollo Entero', 'Proteínas', 'UNIT', 85, NOW(), NOW()),
('ORG_ID_HERE', 'Pechuga de Pollo', 'Proteínas', 'KG', 180, NOW(), NOW()),
('ORG_ID_HERE', 'Muslos de Pollo', 'Proteínas', 'KG', 120, NOW(), NOW()),
('ORG_ID_HERE', 'Chuleta Ahumada', 'Proteínas', 'KG', 350, NOW(), NOW()),
('ORG_ID_HERE', 'Bistec de Res', 'Proteínas', 'KG', 450, NOW(), NOW()),
('ORG_ID_HERE', 'Papas Fritas', 'Acompañamientos', 'KG', 45, NOW(), NOW()),
('ORG_ID_HERE', 'Arroz Blanco', 'Acompañamientos', 'KG', 35, NOW(), NOW()),
('ORG_ID_HERE', 'Habichuelas Guisadas', 'Acompañamientos', 'GALON', 120, NOW(), NOW()),
('ORG_ID_HERE', 'Ensalada Verde', 'Acompañamientos', 'KG', 80, NOW(), NOW()),
('ORG_ID_HERE', 'Mangu', 'Acompañamientos', 'KG', 60, NOW(), NOW()),
('ORG_ID_HERE', 'Salsa BBQ', 'Salsas', 'LITRO', 150, NOW(), NOW()),
('ORG_ID_HERE', 'Salsa Picante', 'Salsas', 'LITRO', 80, NOW(), NOW()),
('ORG_ID_HERE', 'Ketchup', 'Salsas', 'LITRO', 60, NOW(), NOW()),
('ORG_ID_HERE', 'Mayonesa', 'Salsas', 'LITRO', 95, NOW(), NOW()),
('ORG_ID_HERE', 'Refresco Cola', 'Bebidas', 'LATA', 25, NOW(), NOW()),
('ORG_ID_HERE', 'Agua Natural 500ml', 'Bebidas', 'UNIT', 15, NOW(), NOW()),
('ORG_ID_HERE', 'Limonada Natural', 'Bebidas', 'LITRO', 40, NOW(), NOW()),
('ORG_ID_HERE', 'Cerveza Nacional', 'Bebidas', 'UNIT', 55, NOW(), NOW()),
('ORG_ID_HERE', 'Flan de Queso', 'Postres', 'UNIT', 35, NOW(), NOW()),
('ORG_ID_HERE', 'Pastel de Naranja', 'Postres', 'UNIT', 45, NOW(), NOW()),
('ORG_ID_HERE', 'Brownie con Helado', 'Postres', 'UNIT', 65, NOW(), NOW());

-- 8. Create inventory (mix of CRITICAL, LOW, NORMAL)
INSERT INTO inventory (organization_id, location_id, product_id, quantity, status, last_checked, created_at, updated_at)
SELECT 
  'ORG_ID_HERE',
  (SELECT id FROM locations WHERE organization_id = 'ORG_ID_HERE' LIMIT 1),
  id,
  CASE name
    WHEN 'Pollo Entero' THEN 0
    WHEN 'Bistec de Res' THEN 1.5
    WHEN 'Muslos de Pollo' THEN 4
    WHEN 'Papas Fritas' THEN 3
    WHEN 'Salsa BBQ' THEN 2
    WHEN 'Cerveza Nacional' THEN 8
    ELSE 15
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
  NOW(),
  NOW(),
  NOW()
FROM products WHERE organization_id = 'ORG_ID_HERE';

-- 9. Create alerts
INSERT INTO alerts (organization_id, type, product_id, message, resolved, created_at, updated_at)
VALUES 
('ORG_ID_HERE', 'STOCK_CRITICAL', (SELECT id FROM products WHERE name = 'Pollo Entero'), 'Pollo Entero agotado - 无法 servir platos principales', false, NOW(), NOW()),
('ORG_ID_HERE', 'STOCK_LOW', (SELECT id FROM products WHERE name = 'Muslos de Pollo'), 'Muslos de Pollo bajo - Solo quedan 4 kg', false, NOW(), NOW()),
('ORG_ID_HERE', 'STOCK_CRITICAL', (SELECT id FROM products WHERE name = 'Bistec de Res'), 'Bistec crítico - Solo 1.5 kg restantes', false, NOW(), NOW()),
('ORG_ID_HERE', 'ORDER_DELAYED', NULL, 'Orden #PO-2026-001 con Carnes Premium retrasada', false, NOW(), NOW()),
('ORG_ID_HERE', 'PRICE_CHANGE', (SELECT id FROM products WHERE name = 'Bistec de Res'), 'Bistec de Res aumentó de RD$420 a RD$450', false, NOW(), NOW());

-- 10. Get supplier IDs for purchase orders
SELECT id, name FROM suppliers WHERE organization_id = 'ORG_ID_HERE';

-- 11. Create purchase orders (run after getting supplier IDs)
-- Replace SUPPLIER_ID_X with actual supplier IDs from step 10

INSERT INTO purchase_orders (organization_id, supplier_id, status, created_at, updated_at)
VALUES 
('ORG_ID_HERE', 'SUPPLIER_ID_1', 'DRAFT', NOW(), NOW()),
('ORG_ID_HERE', 'SUPPLIER_ID_2', 'PENDING', NOW() - INTERVAL '1 day', NOW()),
('ORG_ID_HERE', 'SUPPLIER_ID_3', 'APPROVED', NOW() - INTERVAL '2 days', NOW());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check inventory status
SELECT status, COUNT(*) as count 
FROM inventory 
WHERE organization_id = 'ORG_ID_HERE' 
GROUP BY status;

-- Check all alerts
SELECT * FROM alerts 
WHERE organization_id = 'ORG_ID_HERE' 
ORDER BY created_at DESC;
  `
};

console.log('='.repeat(60));
console.log('🌱 RESTOCKA DEMO DATA');
console.log('='.repeat(60));
console.log('\n📋 To set up demo data, run the SQL below in:');
console.log('   Supabase Dashboard → SQL Editor\n');
console.log(DEMO_DATA.sql);
console.log('='.repeat(60));
