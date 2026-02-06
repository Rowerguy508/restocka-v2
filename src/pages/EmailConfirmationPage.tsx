import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function EmailConfirmationPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'tu correo';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Confirma tu correo electrónico
        </h1>

        {/* Message */}
        <p className="text-zinc-400 text-center mb-6">
          Hemos enviado un enlace de confirmación a <br/>
          <span className="text-white font-medium">{email}</span>
        </p>

        {/* Steps */}
        <div className="bg-zinc-900 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-white mb-3">Próximos pasos:</h2>
          <ol className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs">1</span>
              Revisa tu bandeja de entrada
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs">2</span>
              Busca el correo de ReStocka
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs">3</span>
              Haz clic en el enlace de confirmación
            </li>
          </ol>
        </div>

        {/* No email? */}
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-3">¿No recibiste el correo?</p>
          
          <button
            onClick={() => {
              setResending(true);
              // Simulate resend (actual implementation would call Supabase)
              setTimeout(() => {
                setResending(false);
                setResent(true);
              }, 1500);
            }}
            disabled={resending || resent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {resending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : resent ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                ¡Enviado!
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Reenviar correo
              </>
            )}
          </button>
        </div>

        {/* Back to login */}
        <div className="mt-8 text-center">
          <Link 
            to="/login" 
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
