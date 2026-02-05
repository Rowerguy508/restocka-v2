-- Migration script: Old project data → New project
-- Old project: uofytmeqckuoqucsedlu
-- New project: zsewmpjceuomivvbyjgl
-- Note: Auth users NOT migrated (they need to sign up at restocka.app)

-- Organizations (only those with data - Empanada Empire and Shik fil a)
INSERT INTO organizations (id, name) VALUES
('11111111-1111-1111-1111-111111111111', 'Empanada Empire')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO organizations (id, name) VALUES
('47531b41-b559-4935-b173-2e9c2c9711fd', 'Shik fil a 🍗')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Locations (only for migrated orgs)
INSERT INTO locations (id, name, address, organization_id, timezone) VALUES
('22222222-2222-2222-2222-222222222222', 'Downtown Kitchen', '123 Main St', '11111111-1111-1111-1111-111111111111', 'UTC')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, organization_id = EXCLUDED.organization_id;

INSERT INTO locations (id, name, address, organization_id, timezone) VALUES
('8798d33c-00c6-42e4-be97-2b92ba120461', 'Blue Mall SD', 'Av. Winston Churchill, Santo Domingo', '47531b41-b559-4935-b173-2e9c2c9711fd', 'UTC')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, organization_id = EXCLUDED.organization_id;

INSERT INTO locations (id, name, address, organization_id, timezone) VALUES
('1f9672a4-cfaf-4b16-888f-ce6fa48d4707', 'Agora Mall', 'Av. John F. Kennedy, Santo Domingo', '47531b41-b559-4935-b173-2e9c2c9711fd', 'UTC')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, organization_id = EXCLUDED.organization_id;

INSERT INTO locations (id, name, address, organization_id, timezone) VALUES
('f5663ce8-07ae-4bbe-aa24-570c8f184cb1', 'Downtown Center', 'Av. Núñez de Cáceres, Santo Domingo', '47531b41-b559-4935-b173-2e9c2c9711fd', 'UTC')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, organization_id = EXCLUDED.organization_id;

INSERT INTO locations (id, name, address, organization_id, timezone) VALUES
('14270a97-26c2-4648-9c81-0eb0a3979f8f', 'Santiago - Metro Plaza', 'Av. Juan Pablo Duarte, Santiago', '47531b41-b559-4935-b173-2e9c2c9711fd', 'UTC')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, organization_id = EXCLUDED.organization_id;
