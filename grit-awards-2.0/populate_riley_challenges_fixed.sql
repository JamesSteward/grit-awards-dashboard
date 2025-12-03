-- =====================================================
-- POPULATE RILEY'S CHALLENGE DATA (SCHEMA-FIXED)
-- =====================================================
-- This version handles the most likely column names
-- based on GRIT 2.0 refactoring history
-- =====================================================

-- =====================================================
-- STEP 0: SCHEMA DETECTION
-- =====================================================
-- Run this first to identify the correct column name:

-- Check student_progress table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'student_progress'
ORDER BY ordinal_position;

-- Check existing Riley records to see structure
SELECT *
FROM student_progress 
WHERE student_id = '63a61037-19ff-48e0-b9e3-53338b46a849'
LIMIT 1;

-- =====================================================
-- OPTION A: If column is named 'objective_id'
-- =====================================================
-- Use this version if the foreign key column is 'objective_id'

-- Delete existing records
DELETE FROM student_progress 
WHERE student_id = '63a61037-19ff-48e0-b9e3-53338b46a849';

-- Insert 3 IN_PROGRESS challenges (sort_order 1-3)
INSERT INTO student_progress (
  student_id, 
  objective_id,  -- Using objective_id instead of challenge_id
  status, 
  created_at, 
  updated_at
)
SELECT 
  '63a61037-19ff-48e0-b9e3-53338b46a849'::uuid,
  c.id,
  'in_progress',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day'
FROM challenges c 
WHERE c.sort_order BETWEEN 1 AND 3
ORDER BY c.sort_order;

-- Insert 3 SUBMITTED challenges (sort_order 4-6)
INSERT INTO student_progress (
  student_id, 
  objective_id,  -- Using objective_id instead of challenge_id
  status, 
  created_at, 
  updated_at
)
SELECT 
  '63a61037-19ff-48e0-b9e3-53338b46a849'::uuid,
  c.id,
  'submitted',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '2 days'
FROM challenges c 
WHERE c.sort_order BETWEEN 4 AND 6
ORDER BY c.sort_order;

-- Insert 40 APPROVED challenges (sort_order 7-46)
INSERT INTO student_progress (
  student_id, 
  objective_id,  -- Using objective_id instead of challenge_id
  status, 
  created_at, 
  updated_at
)
SELECT 
  '63a61037-19ff-48e0-b9e3-53338b46a849'::uuid,
  c.id,
  'approved',
  NOW() - INTERVAL '30 days' + (c.sort_order - 7) * INTERVAL '12 hours',
  NOW() - INTERVAL '20 days' + (c.sort_order - 7) * INTERVAL '12 hours'
FROM challenges c 
WHERE c.sort_order BETWEEN 7 AND 46
ORDER BY c.sort_order;

-- Insert 60 NOT_STARTED challenges (sort_order 47-106)
INSERT INTO student_progress (
  student_id, 
  objective_id,  -- Using objective_id instead of challenge_id
  status, 
  created_at, 
  updated_at
)
SELECT 
  '63a61037-19ff-48e0-b9e3-53338b46a849'::uuid,
  c.id,
  'not_started',
  NOW(),
  NOW()
FROM challenges c 
WHERE c.sort_order BETWEEN 47 AND 106
ORDER BY c.sort_order;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check total count and status distribution
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM student_progress 
WHERE student_id = '63a61037-19ff-48e0-b9e3-53338b46a849'
GROUP BY status
ORDER BY 
  CASE status 
    WHEN 'in_progress' THEN 1
    WHEN 'submitted' THEN 2  
    WHEN 'approved' THEN 3
    WHEN 'not_started' THEN 4
  END;

-- Check join with challenges table works
SELECT 
  sp.status,
  c.title,
  c.trait,
  c.points,
  c.sort_order,
  sp.created_at
FROM student_progress sp
JOIN challenges c ON sp.objective_id = c.id  -- Using objective_id
WHERE sp.student_id = '63a61037-19ff-48e0-b9e3-53338b46a849'
ORDER BY c.sort_order
LIMIT 10;

-- =====================================================
-- OPTION B: If column is named 'challenge_id'
-- =====================================================
-- If the schema check shows 'challenge_id', replace all 
-- instances of 'objective_id' with 'challenge_id' above

-- =====================================================
-- TROUBLESHOOTING QUERIES
-- =====================================================

-- If you get foreign key errors, check:
-- 1. Does challenges table exist?
SELECT COUNT(*) as challenge_count FROM challenges;

-- 2. Do challenge IDs exist for sort_order 1-106?
SELECT 
  MIN(sort_order) as min_sort, 
  MAX(sort_order) as max_sort,
  COUNT(*) as total_challenges
FROM challenges;

-- 3. What's the actual foreign key column name?
SELECT 
  conname AS constraint_name,
  a.attname AS column_name,
  confrelid::regclass AS foreign_table_name
FROM pg_constraint AS con
JOIN pg_attribute AS a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
WHERE contype = 'f'
  AND conrelid::regclass::text = 'student_progress';

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- Total: 106 challenges
-- in_progress: 3 (2.8%)
-- submitted: 3 (2.8%) 
-- approved: 40 (37.7%)
-- not_started: 60 (56.6%)
-- =====================================================







