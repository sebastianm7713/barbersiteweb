import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Scissors } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center px-0">
      {/* top back button removed; moved below register as requested */}

      <Card className="w-screen mx-0 bg-[#E6F6FF] border border-blue-300 shadow-lg rounded-none overflow-hidden">
        <div className="flex items-center gap-6 px-8 lg:px-40 py-12">
          <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
            <Scissors className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-[#D4AF37] text-2xl font-bold">Iniciar Sesión</h3>
            <p className="text-[#D4AF37] text-sm">Ingresa tus credenciales para acceder</p>
          </div>
        </div>
        <CardContent className="px-8 lg:px-40 py-12">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto w-full">
            <div>
              <Label htmlFor="email" className="text-amber-500 font-medium">Correo Electrónico</Label>
                <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                  className="mt-2 py-5 w-full text-lg bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-amber-500 font-medium">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 py-5 w-full text-lg bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm text-[#D4AF37]"
                onClick={onRecoverClick}
              >
                ¿Olvidaste tu contraseña?
              </Button>
              <div className="text-sm text-gray-700">Usuarios de prueba disponibles</div>
            </div>
            <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black py-4 text-lg rounded-md transition-transform transform hover:-translate-y-0.5 hover:scale-[1.02] shadow-md hover:shadow-lg" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
            <div className="text-center text-sm text-[#D4AF37]">
              ¿No tienes cuenta?{' '}
              <Button
                type="button"
                variant="link"
                className="px-0 text-[#D4AF37]"
                onClick={onRegisterClick}
              >
                Regístrate
              </Button>
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="ghost"
                className="text-[#D4AF37] hover:text-amber-400"
                onClick={onBackToLanding}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </div>
          </form>
          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200 text-sm text-gray-800">
            <p className="mb-2 font-medium text-gray-800">Usuarios de prueba:</p>
            <p>Admin: <span className="font-semibold text-gray-900">admin@barberia.com</span> / <span className="font-mono text-gray-700">admin123</span></p>
            <p>Barbero: <span className="font-semibold text-gray-900">carlos@barberia.com</span> / <span className="font-mono text-gray-700">barbero123</span></p>
            <p>Cliente: <span className="font-semibold text-gray-900">juan@cliente.com</span> / <span className="font-mono text-gray-700">cliente123</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
