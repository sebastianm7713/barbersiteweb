import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface RecoverPasswordFormProps {
  onBackToLogin: () => void;
  onBackToLanding: () => void;
}

export const RecoverPasswordForm: React.FC<RecoverPasswordFormProps> = ({ onBackToLogin, onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await resetPassword(email);

    if (success) {
      toast.success('Se ha enviado un correo con instrucciones para recuperar tu contraseña', {
        style: { background: '#10b981', color: '#fff' }
      });
      setTimeout(() => onBackToLogin(), 2000);
    } else {
      toast.error('No se encontró una cuenta con ese correo', {
        style: { background: '#ef4444', color: '#fff' }
      });
    }

    setLoading(false);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        className="absolute -top-16 left-0 text-white hover:text-amber-400 hover:bg-white/10"
        onClick={onBackToLanding}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al Inicio
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar Contraseña</CardTitle>
          <CardDescription>Ingresa tu correo para recibir instrucciones</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Instrucciones'}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={onBackToLogin}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
