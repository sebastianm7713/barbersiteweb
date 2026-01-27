import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface LoginFormProps {
  onRegisterClick: () => void;
  onRecoverClick: () => void;
  onBackToLanding: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onRegisterClick, onRecoverClick, onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      toast.success('Inicio de sesión exitoso', {
        style: { background: '#10b981', color: '#fff' }
      });
    } else {
      toast.error('Credenciales incorrectas', {
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
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={onRecoverClick}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
            <div className="text-center">
              <span className="text-muted-foreground">¿No tienes cuenta? </span>
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={onRegisterClick}
              >
                Regístrate
              </Button>
            </div>
          </form>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-2">Usuarios de prueba:</p>
            <p className="text-xs">Admin: admin@barberia.com / admin123</p>
            <p className="text-xs">Barbero: carlos@barberia.com / barbero123</p>
            <p className="text-xs">Cliente: juan@cliente.com / cliente123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
