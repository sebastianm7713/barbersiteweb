import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Package, Users, Search, Scissors, Mail, Phone, Calendar } from 'lucide-react';
import { mockProductos, mockEmpleados, mockServicios } from '../../shared/lib/mockData';

interface ClienteDashboardProps {
  onReservarCita?: (empleadoId?: number, servicioId?: number) => void;
}

export function ClienteDashboard({ onReservarCita }: ClienteDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProductos, setFilteredProductos] = useState(mockProductos);
  const [filteredBarberos, setFilteredBarberos] = useState(mockEmpleados);

  const handleSearchProductos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = mockProductos.filter(producto => {
      return producto.nombre.toLowerCase().includes(term) ||
             producto.categoria?.toLowerCase().includes(term) ||
             producto.descripcion?.toLowerCase().includes(term);
    });
    setFilteredProductos(filtered);
  };

  const handleSearchBarberos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = mockEmpleados.filter(empleado => {
      return empleado.nombre.toLowerCase().includes(term) ||
             empleado.apellido.toLowerCase().includes(term) ||
             empleado.cargo.toLowerCase().includes(term);
    });
    setFilteredBarberos(filtered);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="flex items-center gap-2">
          <Scissors className="w-6 h-6" />
          Catálogo
        </h1>
        <p className="text-muted-foreground">Explora nuestros productos y conoce a nuestro equipo</p>
      </div>

      <Tabs defaultValue="productos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="productos">
            <Package className="w-4 h-4 mr-2" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="barberos">
            <Users className="w-4 h-4 mr-2" />
            Barberos
          </TabsTrigger>
          <TabsTrigger value="servicios">
            <Scissors className="w-4 h-4 mr-2" />
            Servicios
          </TabsTrigger>
        </TabsList>

        {/* Tab de Productos */}
        <TabsContent value="productos" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearchProductos}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProductos.map((producto) => (
              <Card key={producto.id_producto} className="hover:shadow-lg transition-shadow overflow-hidden">
                {producto.imagen && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{producto.categoria}</p>
                    </div>
                    <Badge variant={producto.estado === 'activo' ? 'default' : 'secondary'} className="bg-[#D4AF37] text-black">
                      ${producto.precio.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{producto.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      <span className="font-medium">Stock:</span> {producto.stock} unidades
                    </span>
                    {producto.estado === 'activo' ? (
                      <Badge className="bg-green-600">Disponible</Badge>
                    ) : (
                      <Badge variant="destructive">Agotado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Código: {producto.codigo}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProductos.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          )}
        </TabsContent>

        {/* Tab de Barberos */}
        <TabsContent value="barberos" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar barberos..."
                value={searchTerm}
                onChange={handleSearchBarberos}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBarberos.map((barbero) => (
              <Card key={barbero.id_empleado} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{barbero.nombre} {barbero.apellido}</CardTitle>
                      <Badge variant="outline" className="mt-1">{barbero.cargo}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {barbero.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{barbero.email}</span>
                    </div>
                  )}
                  {barbero.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{barbero.telefono}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-3">
                      Miembro desde: {new Date(barbero.fecha_contratacion + 'T00:00:00').toLocaleDateString('es-ES')}
                    </p>
                    {onReservarCita && (
                      <Button 
                        onClick={() => onReservarCita(barbero.id_empleado)} 
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Reservar Cita
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBarberos.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No se encontraron barberos</p>
            </div>
          )}
        </TabsContent>

        {/* Tab de Servicios */}
        <TabsContent value="servicios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockServicios.map((servicio) => (
              <Card key={servicio.id_servicio} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{servicio.nombre}</CardTitle>
                      <Badge className="bg-[#D4AF37] text-black mt-1">
                        ${servicio.precio.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{servicio.descripcion}</p>
                  {servicio.duracion && (
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="font-medium">Duración:</span>
                      <span>{servicio.duracion} minutos</span>
                    </div>
                  )}
                  {onReservarCita && (
                    <Button 
                      onClick={() => onReservarCita(undefined, servicio.id_servicio)} 
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Reservar Cita
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Nota informativa */}
      <Card className="bg-gradient-to-r from-[#D4AF37]/10 to-[#B8941F]/10 border-[#D4AF37]">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Información</h3>
              <p className="text-sm text-muted-foreground">
                Los productos mostrados están disponibles en nuestro establecimiento. 
                Para adquirirlos, por favor visítanos o contáctanos directamente. 
                Las compras en línea no están habilitadas en este momento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}