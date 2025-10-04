-- =====================================================
-- SCHEMA CHECK: student_progress TABLE
-- =====================================================
-- Run this in Supabase SQL Editor to identify actual column names
-- =====================================================

-- 1. Check student_progress table schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'student_progress'
ORDER BY ordinal_position;

-- 2. Check for foreign key constraints to challenges table
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name,
  confrelid::regclass AS foreign_table_name,
  af.attname AS foreign_column_name
FROM pg_constraint AS con
JOIN pg_attribute AS a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
JOIN pg_attribute AS af ON af.attrelid = con.confrelid AND af.attnum = ANY(con.confkey)
WHERE contype = 'f'
  AND conrelid::regclass::text = 'student_progress'
  AND confrelid::regclass::text = 'challenges';

-- 3. Check existing sample records structure
SELECT 
  column_name,
  pg_typeof(column_name::text) as data_type
FROM student_progress 
LIMIT 1;

-- Alternative: Show actual column names from existing data
SELECT *
FROM student_progress 
LIMIT 1;

-- 4. Check challenges table structure for reference
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'challenges'
ORDER BY ordinal_position;

-- 5. Check if objectives table still exists (legacy)
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'objectives'
ORDER BY ordinal_position;

-- =====================================================
-- POSSIBLE COLUMN NAMES TO LOOK FOR:
-- =====================================================
-- Foreign key to challenges:
--   - challenge_id
--   - objective_id (old name)
--   - challenges_id
--   - challenge_uuid
--
-- Other important columns:
--   - student_id
--   - status
--   - created_at
--   - updated_at
--   - submitted_at
--   - completed_at
--   - progress_notes
-- =====================================================


