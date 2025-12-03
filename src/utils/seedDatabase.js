import { supabase } from '../lib/supabaseClient';

export const seedStudents = async () => {
  const { data: users } = await supabase.from('users').select('*');
  const familyUser = users.find(u => u.email === 'sarah.johnson@email.com');
  const schoolId = '550e8400-e29b-41d4-a716-446655440000';

  const newStudents = [
    // Year 3 students
    {
      first_name: 'Emma',
      last_name: 'Thompson',
      year_level: 3,
      progress_percentage: 25,
      current_streak: 5,
      current_award: 'Cadet',
      family_user_id: null,
      school_id: schoolId
    },
    {
      first_name: 'Lucas',
      last_name: 'Chen',
      year_level: 3,
      progress_percentage: 58,
      current_streak: 8,
      current_award: 'Second Lieutenant',
      family_user_id: null,
      school_id: schoolId
    },
    {
      first_name: 'Amelia',
      last_name: 'Davies',
      year_level: 3,
      progress_percentage: 89,
      current_streak: 15,
      current_award: 'Lieutenant',
      family_user_id: null,
      school_id: schoolId
    },
    // Year 4 students (Riley's year)
    {
      first_name: 'Oliver',
      last_name: 'Brown',
      year_level: 4,
      progress_percentage: 42,
      current_streak: 6,
      current_award: 'Captain',
      family_user_id: null,
      school_id: schoolId
    },
    {
      first_name: 'Isla',
      last_name: 'Wilson',
      year_level: 4,
      progress_percentage: 71,
      current_streak: 11,
      current_award: 'Major',
      family_user_id: null,
      school_id: schoolId
    },
    {
      first_name: 'Noah',
      last_name: 'Taylor',
      year_level: 4,
      progress_percentage: 95,
      current_streak: 18,
      current_award: 'Lieutenant Colonel',
      family_user_id: null,
      school_id: schoolId
    },
    // Year 5 students
    {
      first_name: 'Sophia',
      last_name: 'Williams',
      year_level: 5,
      progress_percentage: 38,
      current_streak: 4,
      current_award: 'Colonel',
      family_user_id: null,
      school_id: schoolId
    },
    {
      first_name: 'Harry',
      last_name: 'Evans',
      year_level: 5,
      progress_percentage: 64,
      current_streak: 9,
      current_award: 'Brigadier',
      family_user_id: null,
      school_id: schoolId
    },
    {
      first_name: 'Ava',
      last_name: 'Roberts',
      year_level: 5,
      progress_percentage: 88,
      current_streak: 16,
      current_award: 'Major General',
      family_user_id: null,
      school_id: schoolId
    },
    // Year 6 students
    {
      first_name: 'Jack',
      last_name: 'Jones',
      year_level: 6,
      progress_percentage: 45,
      current_streak: 7,
      current_award: 'Lieutenant General',
      family_user_id: null,
      school_id: schoolId
    },
    {
      first_name: 'Mia',
      last_name: 'Thomas',
      year_level: 6,
      progress_percentage: 76,
      current_streak: 13,
      current_award: 'General',
      family_user_id: null,
      school_id: schoolId
    },
    {
      first_name: 'George',
      last_name: 'Anderson',
      year_level: 6,
      progress_percentage: 100,
      current_streak: 25,
      current_award: 'Field Marshal',
      family_user_id: null,
      school_id: schoolId
    }
  ];

  const { data, error } = await supabase.from('students').insert(newStudents).select();
  if (error) console.error('Error seeding:', error);
  else console.log('Added 12 students:', data.length);
  return { data, error };
};
