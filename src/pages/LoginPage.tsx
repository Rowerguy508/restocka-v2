import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Correo electrónico inválido');
const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');

type Mode = 'login' | 'signup' | 'reset' | 'reset-sent';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      setError('Por favor ingresa un correo válido');
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

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
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
            setError('Este correo ya está registrado. Intenta iniciar sesión.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: '¡Cuenta creada!',
            description: 'Ya puedes iniciar sesión.',
          });
          setMode('login');
          setPassword('');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Correo o contraseña incorrectos');
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    }

    setLoading(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Crear cuenta';
      case 'reset': return 'Recuperar contraseña';
      case 'reset-sent': return '¡Correo enviado!';
      default: return 'Iniciar sesión';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signup': return 'Ingresa tus datos para registrarte';
      case 'reset': return 'Te enviaremos un enlace para restablecer tu contraseña';
      case 'reset-sent': return `Revisa tu correo ${email}`;
      default: return 'Ingresa tu correo y contraseña';
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
          <p className="mt-1 text-muted-foreground">Control de inventario simple</p>
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
                  Haz clic en el enlace del correo para restablecer tu contraseña.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setMode('login')}
                  className="w-full"
                >
                  Volver a iniciar sesión
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@restaurante.com"
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
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
                      {mode === 'signup' ? 'Creando...' : mode === 'reset' ? 'Enviando...' : 'Entrando...'}
                    </>
                  ) : (
                    mode === 'signup' ? 'Crear cuenta' : mode === 'reset' ? 'Enviar enlace' : 'Entrar'
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
                    ¿Olvidaste tu contraseña?
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
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {mode === 'signup' || mode === 'reset'
                    ? '¿Ya tienes cuenta? Inicia sesión' 
                    : '¿No tienes cuenta? Regístrate'}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Problemas para entrar? Contacta a tu administrador.
        </p>
      </div>
    </div>
  );
}
