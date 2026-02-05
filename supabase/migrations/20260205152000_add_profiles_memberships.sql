-- Create profiles for migrated users first (id only)
INSERT INTO profiles (id) VALUES
('b3a15540-e47b-4094-8b24-7c7e7db1e5e5'),
('c0eec6d8-1bf2-49ab-8f1b-4b4e1dbe4958'),
('59f31277-095c-4dc9-b5fb-7029da57b33d'),
('3a04d91e-5b35-407c-bab6-58cd6f84e38d');

-- Then create memberships
INSERT INTO memberships (user_id, organization_id, role) VALUES
('b3a15540-e47b-4094-8b24-7c7e7db1e5e5', '11111111-1111-1111-1111-111111111111', 'OWNER'),
('3a04d91e-5b35-407c-bab6-58cd6f84e38d', '47531b41-b559-4935-b173-2e9c2c9711fd', 'OWNER');
