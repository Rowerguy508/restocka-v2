import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // First create the exec_sql function using raw query
  // Since we can't call exec_sql directly, let's try a different approach
  
  // Create the policies directly using SQL
  const policies = [
    `CREATE POLICY IF NOT EXISTS "Allow signup org insert" ON organizations FOR INSERT TO authenticated WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "Allow signup loc insert" ON locations FOR INSERT TO authenticated WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "Allow signup mem insert" ON memberships FOR INSERT TO authenticated WITH CHECK (true)`
  ]
  
  const results = []
  for (const sql of policies) {
    // Try to create each policy
    const { error } = await supabase.from('organizations').select('*').limit(1)
    results.push({ sql: sql.substring(0, 50), error: 'Cannot execute SQL via REST without exec_sql function' })
  }
  
  // Actually, let's create the function using graphql or another method
  return new Response(JSON.stringify({ 
    message: 'Cannot execute SQL. Need to create exec_sql function first via Supabase Dashboard.',
    sql_to_run: policies.join('; ')
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
