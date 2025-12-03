import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
// You can find these in your Supabase project settings
const supabaseUrl = 'https://kcyzzduhzmcfjclkdgjd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjeXp6ZHVoem1jZmpjbGtkZ2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDA0MjksImV4cCI6MjA3NDgxNjQyOX0.yZXXFXjOfwUMsAYX74yQIwx-xsh4agk_1vd5qGVVrv0'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Example usage:
// import { supabase } from './lib/supabaseClient'
// 
// // Sign up a new user
// const { data, error } = await supabase.auth.signUp({
//   email: 'example@email.com',
//   password: 'example-password',
// })
//
// // Sign in an existing user
// const { data, error } = await supabase.auth.signInWithPassword({
//   email: 'example@email.com',
//   password: 'example-password',
// })
//
// // Sign out
// const { error } = await supabase.auth.signOut()
//
// // Get the current user
// const { data: { user } } = await supabase.auth.getUser()
//
// // Query data
// const { data, error } = await supabase
//   .from('your_table')
//   .select('*')
//
// // Insert data
// const { data, error } = await supabase
//   .from('your_table')
//   .insert([{ column: 'value' }])
//
// // Update data
// const { data, error } = await supabase
//   .from('your_table')
//   .update({ column: 'new_value' })
//   .eq('id', 1)
//
// // Delete data
// const { data, error } = await supabase
//   .from('your_table')
//   .delete()
//   .eq('id', 1)







