-- =====================================================
-- POPULATE RILEY'S CHALLENGE DATA
-- =====================================================
-- Target: 106 total challenges
-- Distribution:
--   - 6 active (3 in_progress, 3 submitted)
--   - 40 completed (approved)
--   - 60 available (not_started)
-- =====================================================

-- Riley's Student ID
-- 63a61037-19ff-48e0-b9e3-53338b46a849

-- =====================================================
-- STEP 1: Clean Slate - Delete Existing Records
-- =====================================================

DELETE FROM student_progress 
WHERE student_id = '63a61037-19ff-48e0-b9e3-53338b46a849';

-- =====================================================
-- STEP 2: Insert Active Challenges (6 total)
-- =====================================================

-- Insert 3 IN_PROGRESS challenges (sort_order 1-3)
INSERT INTO student_progress (
  student_id, 
  challenge_id, 
  status, 
  created_at, 
  updated_at,
  progress_notes
)
SELECT 
  '63a61037-19ff-48e0-b9e3-53338b46a849'::uuid,
  c.id,
  'in_progress',
  NOW() - INTERVAL '3 days',  -- Started 3 days ago
  NOW() - INTERVAL '1 day',   -- Last updated yesterday
  'Working on this challenge actively'
FROM challenges c 
WHERE c.sort_order BETWEEN 1 AND 3
ORDER BY c.sort_order;

-- Insert 3 SUBMITTED challenges (sort_order 4-6)
INSERT INTO student_progress (
  student_id, 
  challenge_id, 
  status, 
  created_at, 
  updated_at,
  submitted_at,
  progress_notes
)
SELECT 
  '63a61037-19ff-48e0-b9e3-53338b46a849'::uuid,
  c.id,
  'submitted',
  NOW() - INTERVAL '7 days',   -- Started a week ago
  NOW() - INTERVAL '2 days',   -- Submitted 2 days ago
  NOW() - INTERVAL '2 days',   -- Submitted 2 days ago
  'Evidence submitted, awaiting teacher review'
FROM challenges c 
WHERE c.sort_order BETWEEN 4 AND 6
ORDER BY c.sort_order;

-- =====================================================
-- STEP 3: Insert Completed Challenges (40 total)
-- =====================================================

-- Insert 40 APPROVED challenges (sort_order 7-46)
INSERT INTO student_progress (
  student_id, 
  challenge_id, 
  status, 
  created_at, 
  updated_at,
  submitted_at,
  completed_at,
  progress_notes
)
SELECT 
  '63a61037-19ff-48e0-b9e3-53338b46a849'::uuid,
  c.id,
  'approved',
  NOW() - INTERVAL '30 days' + (c.sort_order - 7) * INTERVAL '12 hours',  -- Spread over last 30 days
  NOW() - INTERVAL '20 days' + (c.sort_order - 7) * INTERVAL '12 hours',  -- Completed progressively
  NOW() - INTERVAL '25 days' + (c.sort_order - 7) * INTERVAL '12 hours',  -- Submitted dates
  NOW() - INTERVAL '20 days' + (c.sort_order - 7) * INTERVAL '12 hours',  -- Approved dates
  'Successfully completed and approved'
FROM challenges c 
WHERE c.sort_order BETWEEN 7 AND 46
ORDER BY c.sort_order;

-- =====================================================
-- STEP 4: Insert Available Challenges (60 total)
-- =====================================================

-- Insert 60 NOT_STARTED challenges (sort_order 47-106)
INSERT INTO student_progress (
  student_id, 
  challenge_id, 
  status, 
  created_at, 
  updated_at,
  progress_notes
)
SELECT 
  '63a61037-19ff-48e0-b9e3-53338b46a849'::uuid,
  c.id,
  'not_started',
  NOW(),                       -- Just added to Riley's list
  NOW(),
  'Available to start'
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

-- Check total count
SELECT 
  COUNT(*) as total_challenges,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN status = 'not_started' THEN 1 END) as not_started
FROM student_progress 
WHERE student_id = '63a61037-19ff-48e0-b9e3-53338b46a849';

-- Sample records from each status
SELECT 
  sp.status,
  c.title,
  c.trait,
  c.points,
  c.sort_order,
  sp.created_at,
  sp.updated_at
FROM student_progress sp
JOIN challenges c ON sp.challenge_id = c.id
WHERE sp.student_id = '63a61037-19ff-48e0-b9e3-53338b46a849'
ORDER BY c.sort_order
LIMIT 10;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- Total: 106 challenges
-- in_progress: 3 (2.8%)
-- submitted: 3 (2.8%) 
-- approved: 40 (37.7%)
-- not_started: 60 (56.6%)
-- =====================================================


