import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'

export default function DemoSetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const setupDemo = async () => {
    setLoading(true)
    setMessage('Setting up Pollo Vitorina demo...')
    
    try {
      // This would require service role - for now show instructions
      setMessage('Demo setup requires Supabase Dashboard SQL execution.')
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-4">Pollo Vitorina Demo Setup</h1>
        
        {message ? (
          <div className="p-4 bg-muted rounded-lg mb-4">
            <p className="text-sm">{message}</p>
          </div>
        ) : (
          <button
            onClick={setupDemo}
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Setup Demo'}
          </button>
        )}
        
        <a href="/login" className="block text-center text-sm text-primary mt-4">
          Go to Login
        </a>
      </div>
    </div>
  )
}
