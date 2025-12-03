-- =====================================================
-- ADD total_grit_points COLUMN TO students TABLE
-- =====================================================
-- This column tracks cumulative GRIT points earned by students
-- including both challenge points and GRIT Bit points
-- =====================================================

-- 1. Add the column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS total_grit_points INTEGER DEFAULT 0;

-- 2. Update existing students to have 0 points if null
UPDATE students 
SET total_grit_points = 0 
WHERE total_grit_points IS NULL;

-- 3. Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'students'
  AND column_name = 'total_grit_points';

-- 4. Optionally: Calculate and populate points from existing approved challenges
-- This will backfill points for students who already have approved challenges
DO $$
DECLARE
    student_record RECORD;
    total_points INTEGER;
BEGIN
    FOR student_record IN 
        SELECT DISTINCT student_id FROM student_progress WHERE status = 'approved'
    LOOP
        -- Calculate total points from approved challenges
        SELECT COALESCE(SUM(c.points), 0) INTO total_points
        FROM student_progress sp
        JOIN challenges c ON sp.objective_id = c.id
        WHERE sp.student_id = student_record.student_id
          AND sp.status = 'approved';
        
        -- Update student's total points
        UPDATE students
        SET total_grit_points = total_points
        WHERE id = student_record.student_id;
        
        RAISE NOTICE 'Updated student % with % points', student_record.student_id, total_points;
    END LOOP;
END $$;

-- 5. Verify some sample data
SELECT 
    first_name,
    last_name,
    year_level,
    current_award,
    progress_percentage,
    total_grit_points
FROM students
ORDER BY total_grit_points DESC
LIMIT 10;

-- =====================================================
-- NOTES:
-- =====================================================
-- - Run this in Supabase SQL Editor
-- - The column will be added with DEFAULT 0 for existing rows
-- - Step 4 (optional) will backfill points from existing challenges
-- - After running this, GRIT Bit approvals will work correctly
-- =====================================================





