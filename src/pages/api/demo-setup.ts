import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    // Check if demo already exists
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', 'Pollo Vitorina')
      .single()

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'Demo already exists! Login with demo@pollovitorina.com / Demo123!' 
      })
    }

    // Note: Creating users requires elevated permissions
    // This is a simplified demo setup
    return NextResponse.json({
      success: false,
      message: 'Demo setup requires Supabase Dashboard. Please run the SQL from /Users/claudio/.openclaw/workspace/seed.sql'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
