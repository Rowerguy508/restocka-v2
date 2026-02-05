-- Migration: Products from old project
-- Old project: uofytmeqckuoqucsedlu
-- Schema: New project has simplified products table

INSERT INTO products (id, organization_id, name, unit, category, active) VALUES
-- Empanada Empire products
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Flour (5kg)', 'PACK', 'General', true),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Beef Mince', 'KG', 'General', true)
ON CONFLICT (id) DO UPDATE SET 
  organization_id = EXCLUDED.organization_id,
  name = EXCLUDED.name,
  unit = EXCLUDED.unit,
  category = EXCLUDED.category,
  active = EXCLUDED.active;

-- Shik fil a products
INSERT INTO products (id, organization_id, name, unit, category, active) VALUES
('181529ff-995a-43da-835b-cd3365c02c4b', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Pechuga de Pollo Especial', 'KG', 'Proteínas', true),
('ac968088-94ad-4848-b964-190d283674fa', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Pan Brioche (Docena)', 'PACK', 'Panadería', true),
('a410291f-d5ff-4a63-9796-e8fb67def9c7', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Aceite Soya 5G', 'LITER', 'Grasas', true),
('ca73f766-be0a-46ef-90ef-19d2ca63658b', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Papas Corte Recto (Caja)', 'CASE', 'Congelados', true),
('9f479531-e100-47e6-b3fc-d474111b3ba4', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Caja Coca-Cola 12oz', 'CASE', 'Bebidas', true),
('5517fd19-5d20-4f44-b755-59c662c800f1', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Gas Pro Propagas', 'UNIT', 'Varios', true)
ON CONFLICT (id) DO UPDATE SET 
  organization_id = EXCLUDED.organization_id,
  name = EXCLUDED.name,
  unit = EXCLUDED.unit,
  category = EXCLUDED.category,
  active = EXCLUDED.active;
