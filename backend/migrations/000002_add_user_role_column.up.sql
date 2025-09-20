-- Add role column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20);
        RAISE NOTICE 'Column "role" added to table "users".';
    ELSE
        RAISE NOTICE 'Column "role" already exists in table "users". Skipping.';
    END IF;
END
$$;

-- Add a temporary check constraint to ensure existing data is valid before adding NOT NULL
-- This step is crucial if there's existing data that might violate the new constraint.
ALTER TABLE users
ADD CONSTRAINT chk_users_role_temp CHECK (role IS NULL OR role IN ('farmer', 'ngo', 'trader'));
RAISE NOTICE 'Temporary check constraint "chk_users_role_temp" added.';

-- Update any existing NULL roles to a default or specific value if necessary
-- For example, setting existing NULL roles to 'farmer'
-- UPDATE users SET role = 'farmer' WHERE role IS NULL;
-- RAISE NOTICE 'Existing NULL roles updated to ''farmer''.';

-- Drop the temporary constraint and add the final NOT NULL constraint
ALTER TABLE users
DROP CONSTRAINT chk_users_role_temp,
ALTER COLUMN role SET NOT NULL,
ADD CONSTRAINT chk_users_role CHECK (role IN ('farmer', 'ngo', 'trader'));
RAISE NOTICE 'Final NOT NULL constraint and check constraint "chk_users_role" added to "role" column.';

-- Add an index for faster lookups on the role column
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
RAISE NOTICE 'Index "idx_users_role" created on "users" table.';