-- Remove the role column from the users table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users DROP COLUMN role;
        RAISE NOTICE 'Column "role" dropped from table "users".';
    ELSE
        RAISE NOTICE 'Column "role" does not exist in table "users". Skipping.';
    END IF;
END
$$;

-- Drop the check constraint if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_role' AND conrelid = 'users'::regclass) THEN
        ALTER TABLE users DROP CONSTRAINT chk_users_role;
        RAISE NOTICE 'Check constraint "chk_users_role" dropped from table "users".';
    END IF;
END
$$;

-- Drop the index if it exists
DROP INDEX IF EXISTS idx_users_role;
RAISE NOTICE 'Index "idx_users_role" dropped from "users" table.';