import { createClient } from '@supabase/supabase-js'

// This file provides admin capabilities to bypass RLS
// For use during onboarding when user has no memberships yet

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Create a client that can be used with service role (should be set server-side in production)
// For demo purposes, we'll use the anon key but acknowledge RLS may block

export async function createOrganizationWithAdmin(userId: string, orgName: string, locationName: string, coords?: {lat: number, lng: number}) {
  // Try with regular client first (will work after RLS fix)
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
  
  // If RLS blocks, this will fail - we need the service role
  // For now, try the normal flow and report error clearly
  
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name: orgName })
    .select()
    .single()
    
  if (error) {
    console.error('Organization creation failed:', error)
    return { error, data: null }
  }
  
  return { data, error: null }
}

export { supabase }
