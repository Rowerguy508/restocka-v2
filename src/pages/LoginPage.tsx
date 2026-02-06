import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Loader2, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { t, getLocale } from '@/lib/i18n';

const emailSchema = z.string().email();

type Mode = 'login' | 'signup' | 'reset' | 'reset-sent';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const locale = getLocale();

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailResult = emailSchema.safeParse(email.trim());
    if (!emailResult.success) {
      setError(t('invalid_email'));
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      setLoading(false);
      
      if (error) {
        setError(error.message);
      } else {
        setMode('reset-sent');
      }
      return;
    }

    if (password.length < 6) {
      setError(t('password_min'));
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('passwords_not_match'));
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setError(locale === 'es' ? 'Este correo ya está registrado. Intenta iniciar sesión.' : 'This email is already registered. Try signing in.');
          } else {
            setError(error.message);
          }
        } else {
          navigate('/onboarding');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          console.error('Login error:', error); // Debug log
          if (error.message.includes('Invalid login credentials')) {
            setError(locale === 'es' ? 'Correo o contraseña incorrectos' : 'Incorrect email or password');
          } else if (error.message.includes('Email not confirmed')) {
            setError(locale === 'es' ? 'Por favor confirma tu correo electrónico' : 'Please confirm your email');
          } else if (error.message.includes('User not found')) {
            setError(locale === 'es' ? 'Usuario no encontrado. ¿Necesitas crear una cuenta?' : 'User not found. Need to create an account?');
          } else {
            setError(error.message);
          }
        } else {
          // Success - navigate will happen via useEffect
          console.log('Login successful, waiting for redirect...');
        }
      }
    } catch (err) {
      setError(locale === 'es' ? 'Error de conexión. Intenta de nuevo.' : 'Connection error. Try again.');
    }

    setLoading(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return t('signup');
      case 'reset': return t('reset_password');
      case 'reset-sent': return t('reset_sent');
      default: return t('login');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src="/login_logo.png" alt="ReStocka" className="mx-auto mb-4 h-16 w-auto" />
          <h1 className="text-3xl font-bold text-foreground">ReStocka</h1>
          <p className="mt-1 text-muted-foreground">
            {locale === 'es' ? 'Control de inventario simple' : 'Simple inventory control'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border p-8 rounded-xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">{getTitle()}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'signup' 
                ? locale === 'es' ? 'Crea tu cuenta' : 'Create your account'
                : mode === 'reset' 
                  ? locale === 'es' ? 'Recibe un enlace para resetear tu contraseña' : 'Receive a link to reset your password'
                  : locale === 'es' ? 'Ingresa a tu cuenta' : 'Sign in to your account'
              }
            </p>
          </div>

          {mode === 'reset-sent' ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {locale === 'es' ? `Revisa tu correo ${email}` : `Check your email ${email}`}
              </p>
              <Button
                variant="outline"
                onClick={() => setMode('login')}
                className="w-full"
              >
                {t('back_to_login')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  required
                  autoComplete="email"
                />
              </div>

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">{t('password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">{t('confirm_password')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('password_placeholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {mode === 'signup' ? t('creating_account') : mode === 'reset' ? t('sending_link') : t('signing_in')}
                  </>
                ) : (
                  mode === 'signup' ? t('signup') : mode === 'reset' ? t('send_link') : t('login')
                )}
              </Button>

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError('');
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-green-400 transition-colors"
                >
                  {t('forgot_password')}
                </button>
              )}
            </form>
          )}

          {mode !== 'reset-sent' && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                {mode === 'signup' || mode === 'reset'
                  ? t('have_account')
                  : t('no_account')}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t('problems')}
        </p>
      </div>
    </div>
  );
}
