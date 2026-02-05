-- Migration: Suppliers from old project
-- Old project: uofytmeqckuoqucsedlu
-- Schema: New project has lead_time_hours (not days), no rnc

INSERT INTO suppliers (id, organization_id, name, email, lead_time_hours, whatsapp_phone) VALUES
-- Empanada Empire supplier
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Global Foods', 'orders@globalfoods.com', 24, NULL)
ON CONFLICT (id) DO UPDATE SET 
  organization_id = EXCLUDED.organization_id,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  lead_time_hours = EXCLUDED.lead_time_hours,
  whatsapp_phone = EXCLUDED.whatsapp_phone;

-- Shik fil a suppliers
INSERT INTO suppliers (id, organization_id, name, email, lead_time_hours, whatsapp_phone) VALUES
('36968821-679b-42df-8363-e6acd31e26ee', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Corporación Avícola (Pollo Cibao)', 'ventas@pollocibao.com', 12, '+18095551234'),
('2ba23e0d-c50b-408a-b0de-3ba066747385', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Molinos Modernos', 'pedidos@molinos.com', 24, '+18095555678'),
('6babd7c7-a9b3-4bff-b8ff-0b0ce10eba26', '47531b41-b559-4935-b173-2e9c2c9711fd', 'MercaSID', 'ventas@mercasid.com.do', 48, '+18095559012'),
('b793de51-d8c4-49bf-af1b-5ba00720dcac', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Bepensa Dominicana (Coca-Cola)', NULL, 24, NULL),
('454ae43e-00ea-4b3b-b0e2-8166e99d2de3', '47531b41-b559-4935-b173-2e9c2c9711fd', 'Propagas', NULL, 6, NULL)
ON CONFLICT (id) DO UPDATE SET 
  organization_id = EXCLUDED.organization_id,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  lead_time_hours = EXCLUDED.lead_time_hours,
  whatsapp_phone = EXCLUDED.whatsapp_phone;
