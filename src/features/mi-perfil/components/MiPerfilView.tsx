import { useState, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { User, Mail, Phone, Lock, Save, Camera, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth';
import { toast } from 'sonner';

export function MiPerfilView() {
  const { user, updateUser, roleName } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande (máximo 2MB)', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateUser({ avatar: base64String });
      setIsUploading(false);
      toast.success('Foto de perfil actualizada', {
        style: { background: '#10b981', color: '#fff' }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    // Update user data
    const updatedData: any = {
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
    };

    if (formData.password) {
      updatedData.password = formData.password;
    }

    updateUser(updatedData);
    toast.success('Perfil actualizado exitosamente', {
      style: { background: '#10b981', color: '#fff' }
    });
    setIsEditing(false);
    setFormData({ ...formData, password: '', confirmPassword: '' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1>Mi Perfil</h1>
        <p className="text-muted-foreground">
          Administra tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Tu foto y datos de identificación</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Avatar className="w-32 h-32 border-4 border-primary/10 transition-all duration-300 group-hover:border-primary/30">
                <AvatarImage src={user?.avatar} className="object-cover" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {user?.nombre ? getInitials(user.nombre) : 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={handleImageClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </Button>
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleImageClick}
              >
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center w-full space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{user?.nombre}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{roleName}</span>
              </div>

              {user?.telefono && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{user.telefono}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Datos de la Cuenta</CardTitle>
                <CardDescription>Actualiza tu información personal</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre Completo
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Rol
                  </Label>
                  <Input
                    id="rol"
                    value={roleName || ''}
                    disabled
                  />
                </div>
              </div>

              {isEditing && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Cambiar Contraseña (Opcional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Nueva Contraseña</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Dejar en blanco para no cambiar"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirma la nueva contraseña"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          nombre: user?.nombre || '',
                          email: user?.email || '',
                          telefono: user?.telefono || '',
                          password: '',
                          confirmPassword: '',
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

