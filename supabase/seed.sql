-- ============================================
-- POLLO VITORINA - Demo Seed Data
-- ============================================
-- Run this via: supabase db push --include-seed
-- Or via Supabase Dashboard SQL Editor

-- Create demo user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
SELECT 'demo-user-001', 'demo@pollovitorina.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@pollovitorina.com');

-- Create organization
INSERT INTO organizations (id, name, plan_tier, created_at)
SELECT 'pollo-vitorina-org', 'Pollo Vitorina', 'pro', NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 'pollo-vitorina-org');

-- Create locations
INSERT INTO locations (id, organization_id, name, address, latitude, longitude, created_at)
VALUES 
  ('loc-sd', 'pollo-vitorina-org', 'Sucursal Santo Domingo Centro', 'Av. Winston Churchill 45, Santo Domingo', 18.4861, -69.9312, NOW()),
  ('loc-st', 'pollo-vitorina-org', 'Sucursal Santiago', 'Av. Libertad 123, Santiago', 19.4517, -70.6970, NOW()),
  ('loc-pc', 'pollo-vitorina-org', 'Sucursal Punta Cana', 'Boulevard Turístico del Este, Punta Cana', 18.5600, -68.3725, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create suppliers
INSERT INTO suppliers (id, organization_id, name, whatsapp_phone, email, lead_time_hours, rating, created_at)
VALUES 
  ('sup-001', 'pollo-vitorina-org', 'Pollos Don Juan', '+1-809-555-0101', 'pedidos@pollosdonjuan.com', 24, 4.8, NOW()),
  ('sup-002', 'pollo-vitorina-org', 'Vegetables RD', '+1-809-555-0102', 'ventas@vegetablesrd.com', 12, 4.5, NOW()),
  ('sup-003', 'pollo-vitorina-org', 'Cocinas y Salsas', '+1-809-555-0103', 'ordenes@cocinasysalsas.com', 48, 4.7, NOW()),
  ('sup-004', 'pollo-vitorina-org', 'Bebidas del Caribe', '+1-809-555-0104', 'pedidos@bebidascaribe.com', 6, 4.9, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create products
INSERT INTO products (id, organization_id, name, category, unit, active, created_at)
VALUES 
  ('prod-001', 'pollo-vitorina-org', 'Pollo Entero Fresco', 'Pollos', 'libra', true, NOW()),
  ('prod-002', 'pollo-vitorina-org', 'Alitas de Pollo', 'Pollos', 'libra', true, NOW()),
  ('prod-003', 'pollo-vitorina-org', 'Pechugas de Pollo', 'Pollos', 'libra', true, NOW()),
  ('prod-004', 'pollo-vitorina-org', 'Muslos de Pollo', 'Pollos', 'libra', true, NOW()),
  ('prod-005', 'pollo-vitorina-org', 'Papas Dominicanas', 'Vegetales', 'libra', true, NOW()),
  ('prod-006', 'pollo-vitorina-org', 'Yucas', 'Vegetales', 'libra', true, NOW()),
  ('prod-007', 'pollo-vitorina-org', 'Mangú (Plátanos)', 'Vegetales', 'unidad', true, NOW()),
  ('prod-008', 'pollo-vitorina-org', 'Cebolla Roja', 'Vegetales', 'libra', true, NOW()),
  ('prod-009', 'pollo-vitorina-org', 'Ajo', 'Vegetales', 'libra', true, NOW()),
  ('prod-010', 'pollo-vitorina-org', 'Pimentones', 'Vegetales', 'libra', true, NOW()),
  ('prod-011', 'pollo-vitorina-org', 'Limones', 'Vegetales', 'libra', true, NOW()),
  ('prod-012', 'pollo-vitorina-org', 'Sazón Adobo', 'Especias', 'onza', true, NOW()),
  ('prod-013', 'pollo-vitorina-org', 'Oregano Seco', 'Especias', 'onza', true, NOW()),
  ('prod-014', 'pollo-vitorina-org', 'Salsa de Soja', 'Salsas', 'botella', true, NOW()),
  ('prod-015', 'pollo-vitorina-org', 'Refresco Cola', 'Bebidas', 'unidad', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create memberships
INSERT INTO memberships (id, user_id, organization_id, role, created_at)
SELECT 'mem-001', 'demo-user-001', 'pollo-vitorina-org', 'OWNER', NOW()
WHERE NOT EXISTS (SELECT 1 FROM memberships WHERE user_id = 'demo-user-001');

-- Create profiles
INSERT INTO profiles (id, email, full_name, created_at)
SELECT 'demo-user-001', 'demo@pollovitorina.com', 'Carlos Vitorina', NOW()
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = 'demo-user-001');

-- Create stock levels (Santo Domingo)
INSERT INTO stock_levels (id, product_id, location_id, quantity, status, last_updated)
VALUES 
  ('stk-sd-001', 'prod-001', 'loc-sd', 150, 'OK', NOW()),
  ('stk-sd-002', 'prod-002', 'loc-sd', 25, 'LOW', NOW()),
  ('stk-sd-003', 'prod-003', 'loc-sd', 100, 'OK', NOW()),
  ('stk-sd-004', 'prod-004', 'loc-sd', 45, 'OK', NOW()),
  ('stk-sd-005', 'prod-005', 'loc-sd', 200, 'OK', NOW()),
  ('stk-sd-006', 'prod-006', 'loc-sd', 5, 'CRITICAL', NOW()),
  ('stk-sd-007', 'prod-007', 'loc-sd', 80, 'OK', NOW()),
  ('stk-sd-008', 'prod-008', 'loc-sd', 40, 'OK', NOW()),
  ('stk-sd-009', 'prod-009', 'loc-sd', 15, 'LOW', NOW()),
  ('stk-sd-010', 'prod-010', 'loc-sd', 35, 'OK', NOW()),
  ('stk-sd-011', 'prod-011', 'loc-sd', 8, 'CRITICAL', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create stock levels (Santiago)
INSERT INTO stock_levels (id, product_id, location_id, quantity, status, last_updated)
VALUES 
  ('stk-st-001', 'prod-001', 'loc-st', 100, 'OK', NOW()),
  ('stk-st-002', 'prod-002', 'loc-st', 60, 'OK', NOW()),
  ('stk-st-003', 'prod-003', 'loc-st', 70, 'OK', NOW()),
  ('stk-st-004', 'prod-004', 'loc-st', 30, 'OK', NOW()),
  ('stk-st-005', 'prod-005', 'loc-st', 120, 'OK', NOW()),
  ('stk-st-006', 'prod-006', 'loc-st', 25, 'LOW', NOW()),
  ('stk-st-007', 'prod-007', 'loc-st', 50, 'OK', NOW()),
  ('stk-st-008', 'prod-008', 'loc-st', 28, 'OK', NOW()),
  ('stk-st-009', 'prod-009', 'loc-st', 10, 'LOW', NOW()),
  ('stk-st-010', 'prod-010', 'loc-st', 22, 'OK', NOW()),
  ('stk-st-011', 'prod-011', 'loc-st', 5, 'CRITICAL', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create stock levels (Punta Cana)
INSERT INTO stock_levels (id, product_id, location_id, quantity, status, last_updated)
VALUES 
  ('stk-pc-001', 'prod-001', 'loc-pc', 60, 'OK', NOW()),
  ('stk-pc-002', 'prod-002', 'loc-pc', 40, 'OK', NOW()),
  ('stk-pc-003', 'prod-003', 'loc-pc', 45, 'OK', NOW()),
  ('stk-pc-004', 'prod-004', 'loc-pc', 20, 'LOW', NOW()),
  ('stk-pc-005', 'prod-005', 'loc-pc', 70, 'OK', NOW()),
  ('stk-pc-006', 'prod-006', 'loc-pc', 15, 'LOW', NOW()),
  ('stk-pc-007', 'prod-007', 'loc-pc', 35, 'OK', NOW()),
  ('stk-pc-008', 'prod-008', 'loc-pc', 18, 'LOW', NOW()),
  ('stk-pc-009', 'prod-009', 'loc-pc', 8, 'CRITICAL', NOW()),
  ('stk-pc-010', 'prod-010', 'loc-pc', 14, 'LOW', NOW()),
  ('stk-pc-011', 'prod-011', 'loc-pc', 3, 'CRITICAL', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create usage rates
INSERT INTO usage_rates (id, organization_id, product_id, location_id, daily_usage, unit_cost, last_updated)
VALUES 
  ('use-001', 'pollo-vitorina-org', 'prod-001', 'loc-sd', 25, 3.50, NOW()),
  ('use-002', 'pollo-vitorina-org', 'prod-002', 'loc-sd', 8, 5.50, NOW()),
  ('use-003', 'pollo-vitorina-org', 'prod-005', 'loc-sd', 12, 1.80, NOW()),
  ('use-004', 'pollo-vitorina-org', 'prod-006', 'loc-sd', 6, 2.20, NOW()),
  ('use-005', 'pollo-vitorina-org', 'prod-001', 'loc-st', 18, 3.50, NOW()),
  ('use-006', 'pollo-vitorina-org', 'prod-002', 'loc-st', 5, 5.50, NOW()),
  ('use-007', 'pollo-vitorina-org', 'prod-001', 'loc-pc', 12, 3.50, NOW()),
  ('use-008', 'pollo-vitorina-org', 'prod-002', 'loc-pc', 4, 5.50, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create reorder rules
INSERT INTO reorder_rules (id, organization_id, product_id, location_id, supplier_id, safety_days, reorder_qty, automation_mode, created_at)
VALUES 
  ('rule-001', 'pollo-vitorina-org', 'prod-001', 'loc-sd', 'sup-001', 3, 100, 'ASSISTED', NOW()),
  ('rule-002', 'pollo-vitorina-org', 'prod-002', 'loc-sd', 'sup-001', 2, 30, 'AUTO', NOW()),
  ('rule-003', 'pollo-vitorina-org', 'prod-006', 'loc-sd', 'sup-002', 2, 25, 'MANUAL', NOW()),
  ('rule-004', 'pollo-vitorina-org', 'prod-001', 'loc-st', 'sup-001', 3, 80, 'ASSISTED', NOW()),
  ('rule-005', 'pollo-vitorina-org', 'prod-001', 'loc-pc', 'sup-001', 2, 50, 'AUTO', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create alerts
INSERT INTO alerts (id, organization_id, location_id, type, message, resolved, created_at)
VALUES 
  ('alert-001', 'pollo-vitorina-org', 'loc-sd', 'CRITICAL_STOCK', 'Yucas agotándose en Sucursal Santo Domingo', false, NOW()),
  ('alert-002', 'pollo-vitorina-org', 'loc-sd', 'CRITICAL_STOCK', 'Limones críticamente bajos en Santo Domingo', false, NOW()),
  ('alert-003', 'pollo-vitorina-org', 'loc-st', 'CRITICAL_STOCK', 'Limones críticamente bajos en Santiago', false, NOW()),
  ('alert-004', 'pollo-vitorina-org', 'loc-pc', 'CRITICAL_STOCK', 'Ajo agotándose en Punta Cana', false, NOW()),
  ('alert-005', 'pollo-vitorina-org', 'loc-pc', 'CRITICAL_STOCK', 'Limones críticamente bajos en Punta Cana', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create manager user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
SELECT 'demo-user-002', 'gerente@pollovitorina.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gerente@pollovitorina.com');

INSERT INTO memberships (id, user_id, organization_id, role, location_id, created_at)
SELECT 'mem-002', 'demo-user-002', 'pollo-vitorina-org', 'MANAGER', 'loc-sd', NOW()
WHERE NOT EXISTS (SELECT 1 FROM memberships WHERE user_id = 'demo-user-002');

INSERT INTO profiles (id, email, full_name, created_at)
SELECT 'demo-user-002', 'gerente@pollovitorina.com', 'María González', NOW()
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = 'demo-user-002');

SELECT 'Pollo Vitorina demo data created successfully!' as status;
