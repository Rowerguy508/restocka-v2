import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Building2, Users, CreditCard, Bell, Shield, Loader2, Copy, Check } from 'lucide-react';
import { t, getLocale } from '@/lib/i18n';

export default function SettingsPage() {
  const { user } = useAuth();
  const locale = getLocale();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
  });
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MANAGER' | 'STAFF'>('STAFF');

  const handleCopyInviteLink = async () => {
    if (!user) return;
    
    // Generate invite link
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const link = `${window.location.origin}/join/${inviteCode}`;
    
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setLoading(true);
    
    try {
      // Create invite record and send email
      const { error } = await supabase
        .from('invitations')
        .insert({
          email: inviteEmail.trim(),
          role: inviteRole,
          organization_id: user?.id, // This would need proper org lookup
          invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        });
      
      if (error) throw error;
      
      setMessage(locale === 'es' ? 'Invitación enviada' : 'Invitation sent');
      setInviteEmail('');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('settings')}</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'es' ? 'Perfil' : 'Profile'}</CardTitle>
              <CardDescription>
                {locale === 'es' 
                  ? 'Gestiona tu información personal' 
                  : 'Manage your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'es' ? 'Foto de perfil automática' : 'Automatic profile photo'}
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {locale === 'es' ? 'Nombre completo' : 'Full Name'}
                  </Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    placeholder={locale === 'es' ? 'Tu nombre' : 'Your name'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">{locale === 'es' ? 'Teléfono' : 'Phone'}</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              
              <Button disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {locale === 'es' ? 'Guardar cambios' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'es' ? 'Invitar al equipo' : 'Invite Team Members'}</CardTitle>
              <CardDescription>
                {locale === 'es' 
                  ? 'Añade miembros a tu organización' 
                  : 'Add members to your organization'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="inviteEmail">{t('email')}</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@restaurant.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">
                    {locale === 'es' ? 'Rol' : 'Role'}
                  </Label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'MANAGER' | 'STAFF')}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="MANAGER">Manager</option>
                    <option value="STAFF">Staff</option>
                  </select>
                </div>
              </div>
              
              <Button onClick={handleSendInvite} disabled={loading || !inviteEmail.trim()}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {locale === 'es' ? 'Enviar invitación' : 'Send Invitation'}
              </Button>
              
              {message && (
                <p className="text-sm text-green-600">{message}</p>
              )}
              
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">
                  {locale === 'es' ? 'O comparte un enlace' : 'Or share a link'}
                </h4>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCopyInviteLink}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {locale === 'es' ? 'Copiado' : 'Copied'}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        {locale === 'es' ? 'Copiar enlace' : 'Copy Link'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'es' ? 'Facturación' : 'Billing & Subscription'}</CardTitle>
              <CardDescription>
                {locale === 'es' 
                  ? 'Gestiona tu suscripción y pagos' 
                  : 'Manage your subscription and payments'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Free Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'es' 
                        ? '100 productos, 1 ubicación' 
                        : '100 products, 1 location'}
                    </p>
                  </div>
                  <Button asChild>
                    <a href="/pricing">{locale === 'es' ? 'Actualizar' : 'Upgrade'}</a>
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">
                  {locale === 'es' ? 'Métodos de pago' : 'Payment Methods'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {locale === 'es' 
                    ? 'Configura Stripe para gestionar pagos' 
                    : 'Set up Stripe to manage payments'}
                </p>
                <Button variant="outline" className="mt-4">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {locale === 'es' ? 'Gestionar pagos' : 'Manage Payments'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'es' ? 'Notificaciones' : 'Notifications'}</CardTitle>
              <CardDescription>
                {locale === 'es' 
                  ? 'Elige qué notificaciones recibir' 
                  : 'Choose what notifications to receive'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'lowStock', label: locale === 'es' ? 'Stock bajo' : 'Low stock alerts', default: true },
                { id: 'orders', label: locale === 'es' ? 'Pedidos' : 'Order updates', default: true },
                { id: 'team', label: locale === 'es' ? 'Actividad del equipo' : 'Team activity', default: false },
                { id: 'marketing', label: locale === 'es' ? 'Noticias y ofertas' : 'News and offers', default: false },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <Label htmlFor={item.id}>{item.label}</Label>
                  <input
                    type="checkbox"
                    id={item.id}
                    defaultChecked={item.default}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
