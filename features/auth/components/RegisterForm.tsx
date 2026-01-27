import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface RegisterFormProps {
  onBackToLogin: () => void;
  onBackToLanding: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin, onBackToLanding }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    setLoading(true);

    // El rol siempre es cliente (id 3) en el registro público
    const success = await register({
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
      id_rol: 3, // Cliente
      estado: 'activo',
    });

    if (success) {
      toast.success('Registro exitoso. Por favor inicia sesión.', {
        style: { background: '#10b981', color: '#fff' }
      });
      onBackToLogin();
    } else {
      toast.error('El correo ya está registrado', {
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
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>Completa el formulario para registrarte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="555-1234"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
            <div className="text-center">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={onBackToLogin}
              >
                Inicia sesión
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
