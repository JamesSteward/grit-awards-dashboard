-- =====================================================
-- POPULATE PROGRESS DATA FOR 12 STUDENTS
-- =====================================================
-- Creates realistic varied progress for all students except Riley
-- Riley already has 106 challenges populated
-- =====================================================

-- =====================================================
-- STEP 1: GET ALL STUDENT IDS (EXCLUDE RILEY)
-- =====================================================
-- Run this first to see the student IDs we'll work with:

SELECT 
  id,
  first_name,
  last_name,
  year_level,
  current_award,
  progress_percentage
FROM students 
WHERE first_name != 'Riley' OR last_name != 'Johnson'
ORDER BY year_level, last_name;

-- =====================================================
-- STEP 2: CLEAR EXISTING PROGRESS DATA
-- =====================================================
-- Delete existing progress records for all students except Riley

DELETE FROM student_progress 
WHERE student_id IN (
  SELECT id FROM students 
  WHERE first_name != 'Riley' OR last_name != 'Johnson'
);

-- =====================================================
-- STEP 3: POPULATE PROGRESS DATA
-- =====================================================

DO $$
DECLARE
    student_record RECORD;
    challenge_record RECORD;
    total_challenges INTEGER;
    progress_percentage INTEGER;
    approved_count INTEGER;
    in_progress_count INTEGER;
    submitted_count INTEGER;
    not_started_count INTEGER;
    challenge_ids INTEGER[];
    selected_challenge_id UUID;
    i INTEGER;
    base_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get total number of challenges
    SELECT COUNT(*) INTO total_challenges FROM challenges;
    
    -- Process each student (excluding Riley)
    FOR student_record IN 
        SELECT id, first_name, last_name, year_level, current_award
        FROM students 
        WHERE first_name != 'Riley' OR last_name != 'Johnson'
        ORDER BY year_level, last_name
    LOOP
        RAISE NOTICE 'Processing student: % % (Year %)', 
            student_record.first_name, student_record.last_name, student_record.year_level;
        
        -- Determine progress based on year level and award
        -- Higher year levels and awards = higher progress
        CASE 
            WHEN student_record.year_level = 6 AND student_record.current_award IN ('generals', 'field_marshals') THEN
                progress_percentage := 70 + (RANDOM() * 20)::INTEGER; -- 70-90%
            WHEN student_record.year_level >= 5 AND student_record.current_award IN ('major_generals', 'lt_generals', 'generals') THEN
                progress_percentage := 60 + (RANDOM() * 20)::INTEGER; -- 60-80%
            WHEN student_record.year_level >= 4 AND student_record.current_award IN ('captains', 'majors', 'lt_colonels') THEN
                progress_percentage := 40 + (RANDOM() * 20)::INTEGER; -- 40-60%
            WHEN student_record.year_level = 3 AND student_record.current_award IN ('cadets', 'second_lieutenants') THEN
                progress_percentage := 20 + (RANDOM() * 20)::INTEGER; -- 20-40%
            ELSE
                progress_percentage := 5 + (RANDOM() * 15)::INTEGER; -- 5-20%
        END CASE;
        
        -- Calculate challenge counts based on progress percentage
        approved_count := (total_challenges * progress_percentage / 100)::INTEGER;
        in_progress_count := GREATEST(1, (RANDOM() * 4)::INTEGER); -- 1-4 active
        submitted_count := GREATEST(0, (RANDOM() * 3)::INTEGER); -- 0-3 submitted
        not_started_count := total_challenges - approved_count - in_progress_count - submitted_count;
        
        -- Ensure not_started_count is not negative
        IF not_started_count < 0 THEN
            not_started_count := 0;
            approved_count := total_challenges - in_progress_count - submitted_count;
        END IF;
        
        RAISE NOTICE '  Progress: %%, Approved: %, In Progress: %, Submitted: %, Not Started: %', 
            progress_percentage, approved_count, in_progress_count, submitted_count, not_started_count;
        
        -- Get random challenge IDs
        SELECT ARRAY_AGG(id ORDER BY RANDOM()) INTO challenge_ids
        FROM challenges;
        
        -- Insert APPROVED challenges (completed)
        FOR i IN 1..approved_count LOOP
            selected_challenge_id := challenge_ids[i];
            base_date := NOW() - INTERVAL '60 days' + (RANDOM() * INTERVAL '50 days');
            
            INSERT INTO student_progress (
                student_id,
                objective_id, -- Using objective_id (legacy column name)
                status,
                created_at,
                updated_at,
                completed_at
            ) VALUES (
                student_record.id,
                selected_challenge_id,
                'approved',
                base_date,
                base_date + INTERVAL '1 hour',
                base_date + INTERVAL '2 hours'
            );
        END LOOP;
        
        -- Insert IN_PROGRESS challenges (active)
        FOR i IN (approved_count + 1)..(approved_count + in_progress_count) LOOP
            selected_challenge_id := challenge_ids[i];
            base_date := NOW() - INTERVAL '7 days' + (RANDOM() * INTERVAL '5 days');
            
            INSERT INTO student_progress (
                student_id,
                objective_id,
                status,
                created_at,
                updated_at
            ) VALUES (
                student_record.id,
                selected_challenge_id,
                'in_progress',
                base_date,
                NOW() - INTERVAL '1 day'
            );
        END LOOP;
        
        -- Insert SUBMITTED challenges (pending review)
        FOR i IN (approved_count + in_progress_count + 1)..(approved_count + in_progress_count + submitted_count) LOOP
            selected_challenge_id := challenge_ids[i];
            base_date := NOW() - INTERVAL '3 days' + (RANDOM() * INTERVAL '2 days');
            
            INSERT INTO student_progress (
                student_id,
                objective_id,
                status,
                created_at,
                updated_at
            ) VALUES (
                student_record.id,
                selected_challenge_id,
                'submitted',
                base_date,
                NOW() - INTERVAL '1 hour'
            );
        END LOOP;
        
        -- Insert NOT_STARTED challenges (available)
        FOR i IN (approved_count + in_progress_count + submitted_count + 1)..total_challenges LOOP
            selected_challenge_id := challenge_ids[i];
            
            INSERT INTO student_progress (
                student_id,
                objective_id,
                status,
                created_at,
                updated_at
            ) VALUES (
                student_record.id,
                selected_challenge_id,
                'not_started',
                NOW(),
                NOW()
            );
        END LOOP;
        
    END LOOP;
    
    RAISE NOTICE 'Progress data populated for all students!';
END $$;

-- =====================================================
-- STEP 4: VERIFICATION QUERIES
-- =====================================================

-- Check progress distribution by student
SELECT 
    s.first_name,
    s.last_name,
    s.year_level,
    s.current_award,
    COUNT(sp.id) as total_challenges,
    COUNT(CASE WHEN sp.status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN sp.status = 'in_progress' THEN 1 END) as in_progress,
    COUNT(CASE WHEN sp.status = 'submitted' THEN 1 END) as submitted,
    COUNT(CASE WHEN sp.status = 'not_started' THEN 1 END) as not_started,
    ROUND(
        COUNT(CASE WHEN sp.status = 'approved' THEN 1 END) * 100.0 / COUNT(sp.id), 
        1
    ) as progress_percentage
FROM students s
LEFT JOIN student_progress sp ON s.id = sp.student_id
WHERE s.first_name != 'Riley' OR s.last_name != 'Johnson'
GROUP BY s.id, s.first_name, s.last_name, s.year_level, s.current_award
ORDER BY s.year_level, s.last_name;

-- Check overall statistics
SELECT 
    'Total Students' as metric,
    COUNT(DISTINCT s.id) as count
FROM students s
WHERE s.first_name != 'Riley' OR s.last_name != 'Johnson'

UNION ALL

SELECT 
    'Total Progress Records' as metric,
    COUNT(*) as count
FROM student_progress sp
JOIN students s ON sp.student_id = s.id
WHERE s.first_name != 'Riley' OR s.last_name != 'Johnson'

UNION ALL

SELECT 
    'Average Progress %' as metric,
    ROUND(AVG(
        CASE WHEN sp.status = 'approved' THEN 1 ELSE 0 END * 100.0 / 
        COUNT(sp.id) OVER (PARTITION BY sp.student_id)
    ), 1) as count
FROM student_progress sp
JOIN students s ON sp.student_id = s.id
WHERE s.first_name != 'Riley' OR s.last_name != 'Johnson';

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- 12 students with varied progress:
-- - 2-3 high performers (60-80%)
-- - 4-5 average students (30-50%) 
-- - 3-4 lower progress (10-25%)
-- - 1-2 just starting (0-5%)
-- 
-- Each student gets 106 challenges with realistic status distribution
-- =====================================================







