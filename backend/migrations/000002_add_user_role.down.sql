-- Remove the role column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users DROP COLUMN role;
        RAISE NOTICE 'Dropped role column from users table';
    END IF;
END
$$;

-- Drop the role type if it exists
DROP TYPE IF EXISTS user_role;
