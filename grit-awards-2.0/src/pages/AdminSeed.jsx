import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const availableAvatars = [
  'avatar-astronaut-001.svg', 'avatar-astronaut-002.svg', 'avatar-astronaut-003.svg',
  'avatar-diver-001.svg', 'avatar-diver-002.svg', 'avatar-diver-003.svg',
  'avatar-pilot-001.svg', 'avatar-pilot-002.svg',
  'avatar-sailor-001.svg', 'avatar-sailor-002.svg', 'avatar-sailor-003.svg',
  'avatar-soldier-001.svg', 'avatar-soldier-002.svg', 'avatar-soldier-003.svg'
];

export default function AdminSeed() {
  const [result, setResult] = useState('');
  
  const updateRileyAvatar = async () => {
    setResult('Updating Riley avatar...');
    const { error } = await supabase.from('students').update({ avatar: 'avatar-pilot-001.svg' }).eq('first_name', 'Riley').eq('last_name', 'Johnson');
    if (error) setResult(`Error: ${error.message}`);
    else setResult('Updated Riley avatar to pilot');
  };
  
  const updateRiley = async () => {
    setResult('Updating Riley...');
    const { error } = await supabase.from('students').update({ current_award: 'captains' }).eq('first_name', 'Riley').eq('last_name', 'Johnson');
    
    if (error) {
      setResult(`Error updating Riley: ${error.message}`);
    } else {
      setResult('Updated Riley to captains award');
    }
  };
  
  const checkConstraint = async () => {
    setResult('Checking constraint...');
    // Try inserting a test row with a known good value
    const testStudent = {
      first_name: 'Test',
      last_name: 'Student',
      year_level: 3,
      progress_percentage: 0,
      current_streak: 0,
      total_badges: 0,
      current_award: 'captains',
      family_user_id: null,
      school_id: '550e8400-e29b-41d4-a716-446655440000'
    };
    
    const { error } = await supabase.from('students').insert(testStudent);
    
    if (error) {
      setResult(`Constraint info: ${error.message}. Try checking Supabase table constraints for allowed current_award values.`);
    } else {
      setResult('captains worked! Now delete the test student and try other ranks.');
      // Delete test student
      await supabase.from('students').delete().eq('first_name', 'Test').eq('last_name', 'Student');
    }
  };
  
  const handleSeed = async () => {
    setResult('Seeding...');
    
    const { data: users } = await supabase.from('users').select('*');
    const familyUser = users?.find(u => u.email === 'sarah.johnson@email.com');
    const schoolId = '550e8400-e29b-41d4-a716-446655440000';

    const newStudents = [
      // Year 3 students
      { first_name: 'Emma', last_name: 'Thompson', year_level: 3, progress_percentage: 25, current_streak: 5, total_badges: 4, current_award: 'cadets', family_user_id: null, school_id: schoolId, avatar: availableAvatars[0] },
      { first_name: 'Lucas', last_name: 'Chen', year_level: 3, progress_percentage: 58, current_streak: 8, total_badges: 8, current_award: 'second_lieutenants', family_user_id: null, school_id: schoolId, avatar: availableAvatars[1] },
      { first_name: 'Amelia', last_name: 'Davies', year_level: 3, progress_percentage: 89, current_streak: 15, total_badges: 12, current_award: 'lieutenants', family_user_id: null, school_id: schoolId, avatar: availableAvatars[2] },
      // Year 4 students
      { first_name: 'Oliver', last_name: 'Brown', year_level: 4, progress_percentage: 42, current_streak: 6, total_badges: 6, current_award: 'captains', family_user_id: null, school_id: schoolId, avatar: availableAvatars[3] },
      { first_name: 'Isla', last_name: 'Wilson', year_level: 4, progress_percentage: 71, current_streak: 11, total_badges: 10, current_award: 'majors', family_user_id: null, school_id: schoolId, avatar: availableAvatars[4] },
      { first_name: 'Noah', last_name: 'Taylor', year_level: 4, progress_percentage: 95, current_streak: 18, total_badges: 14, current_award: 'lt_colonels', family_user_id: null, school_id: schoolId, avatar: availableAvatars[5] },
      // Year 5 students
      { first_name: 'Sophia', last_name: 'Williams', year_level: 5, progress_percentage: 38, current_streak: 4, total_badges: 7, current_award: 'colonels', family_user_id: null, school_id: schoolId, avatar: availableAvatars[6] },
      { first_name: 'Harry', last_name: 'Evans', year_level: 5, progress_percentage: 64, current_streak: 9, total_badges: 11, current_award: 'brigadiers', family_user_id: null, school_id: schoolId, avatar: availableAvatars[7] },
      { first_name: 'Ava', last_name: 'Roberts', year_level: 5, progress_percentage: 88, current_streak: 16, total_badges: 13, current_award: 'major_generals', family_user_id: null, school_id: schoolId, avatar: availableAvatars[8] },
      // Year 6 students
      { first_name: 'Jack', last_name: 'Jones', year_level: 6, progress_percentage: 45, current_streak: 7, total_badges: 9, current_award: 'lt_generals', family_user_id: null, school_id: schoolId, avatar: availableAvatars[9] },
      { first_name: 'Mia', last_name: 'Thomas', year_level: 6, progress_percentage: 76, current_streak: 13, total_badges: 12, current_award: 'generals', family_user_id: null, school_id: schoolId, avatar: availableAvatars[10] },
      { first_name: 'George', last_name: 'Anderson', year_level: 6, progress_percentage: 100, current_streak: 25, total_badges: 15, current_award: 'field_marshals', family_user_id: null, school_id: schoolId, avatar: availableAvatars[11] }
    ];

    const { data, error } = await supabase.from('students').insert(newStudents).select();
    
    if (error) {
      setResult(`Error: ${error.message}`);
    } else {
      setResult(`Success! Added ${data.length} students`);
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Database Seed Tool</h1>
        
        <button onClick={checkConstraint} className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 mr-2 mb-4">
          Test Award Constraint
        </button>
        
        <button onClick={updateRiley} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 mr-2 mb-4">
          Update Riley to Captains
        </button>
        
        <button onClick={updateRileyAvatar} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 mr-2 mb-4">
          Update Riley Avatar
        </button>
        
        <button onClick={handleSeed} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mb-4">
          Seed Database with 12 Students
        </button>
        
        {result && <p className="mt-4 text-gray-700 whitespace-pre-wrap">{result}</p>}
        
        <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">
            Note: The current_award field has a check constraint. You may need to check your Supabase table settings to see what values are allowed.
            Common options might be: "Captain's Award", "Major's Award", "Lieutenant Colonel's Award" (with apostrophes and "Award" suffix).
          </p>
        </div>
      </div>
    </div>
  );
}