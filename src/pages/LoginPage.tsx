import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';
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
          if (error.message.includes('Invalid login credentials')) {
            setError(locale === 'es' ? 'Correo o contraseña incorrectos' : 'Incorrect email or password');
          } else {
            setError(error.message);
          }
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

  const getDescription = () => {
    switch (mode) {
      case 'signup': return t('signup_description');
      case 'reset': return t('reset_description');
      case 'reset-sent': return t('check_email');
      default: return t('login_description');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ReStocka</h1>
          <p className="mt-1 text-muted-foreground">{locale === 'es' ? 'Control de inventario simple' : 'Simple inventory control'}</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'reset-sent' ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
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
                  <Label htmlFor="email">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('email_placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder={t('password_placeholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      />
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder={t('password_placeholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                    className="w-full text-sm text-muted-foreground hover:text-primary hover:underline"
                  >
                    {t('forgot_password')}
                  </button>
                )}
              </form>
            )}

            {mode !== 'reset-sent' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {mode === 'signup' || mode === 'reset'
                    ? t('have_account')
                    : t('no_account')}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('problems')}
        </p>
      </div>
    </div>
  );
}
