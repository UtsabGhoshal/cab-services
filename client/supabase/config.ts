import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pmvtlinxqpfokacznrrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtdnRsaW54cXBmb2thY3prcnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTE2MjksImV4cCI6MjA2OTYyNzYyOX0.JTfJN3jviNs5ubHE1r3L29AtSxNwSZSdvVPEDiEovZU';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For backward compatibility with Firebase auth patterns
export const auth = supabase.auth;
export const db = supabase;

export default supabase;
