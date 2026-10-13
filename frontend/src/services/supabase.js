/**
 * Supabase client initialization for Veyra frontend authentication.
 * Uses publishable client key and project URL.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rwmmrjahglflmybzebdk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Ag5Lr0jIbBJ7kx9p-gZbZQ_w9KUmiip'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
