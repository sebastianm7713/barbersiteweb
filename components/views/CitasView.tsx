import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Plus, Pencil, Trash2, Search, Eye, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { mockServicios, mockEmpleados, mockClientes, Cita } from '../../shared/lib/mockData';
import { dataStore } from '../../shared/lib/dataStore';
import { useAuth } from '../../features/auth';
import { toast } from 'sonner';

export function CitasView() {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>(dataStore.citas);
  const [filteredCitas, setFilteredCitas] = useState<Cita[]>(dataStore.citas);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [viewingCita, setViewingCita] = useState<Cita | null>(null);
  const [citaToDelete, setCitaToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_servicio: '',
    id_empleado: '',
    fecha: '',
    hora: '',
    estado: 'pendiente' as 'pendiente' | 'confirmada' | 'completada' | 'cancelada',
    observaciones: '',
  });

  // Permisos basados en rol
  const isAdmin = user?.id_rol === 1;
  const isBarbero = user?.id_rol === 2;
  const isCliente = user?.id_rol === 3;

  // Filtrar citas según el rol
  const getFilteredCitasByRole = () => {
    if (isCliente) {
      // Cliente solo ve sus propias citas
      const clienteRecord = dataStore.clientes.find(c => c.email === user?.email);
      return citas.filter(c => c.id_cliente === clienteRecord?.id_cliente);
    }
    return citas;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const roleCitas = getFilteredCitasByRole();
    const filtered = roleCitas.filter(cita => {
      const clienteName = getClienteName(cita.id_cliente, cita.id_cliente_temporal).toLowerCase();
      const servicioName = getServicioName(cita.id_servicio).toLowerCase();
      const empleadoName = getEmpleadoName(cita.id_empleado).toLowerCase();
      const idCita = cita.id_cita.toString();
      const estado = cita.estado.toLowerCase();
      
      return clienteName.includes(term) ||
             servicioName.includes(term) ||
             empleadoName.includes(term) ||
             idCita.includes(term) ||
             cita.fecha.includes(term) ||
             cita.hora.includes(term) ||
             estado.includes(term);
    });
    setFilteredCitas(filtered);
  };

  const handleCreate = () => {
    if (isCliente) {
      // Cliente puede crear citas para sí mismo
      const clienteRecord = dataStore.clientes.find(c => c.email === user?.email);
      if (!clienteRecord) {
        toast.error('No se encontró el registro de cliente');
        return;
      }
      setEditingCita(null);
      setFormData({
        id_cliente: clienteRecord.id_cliente.toString(),
        id_servicio: '',
        id_empleado: '',
        fecha: '',
        hora: '',
        estado: 'pendiente',
        observaciones: '',
      });
      setDialogOpen(true);
      return;
    }
    
    setEditingCita(null);
    setFormData({
      id_cliente: '',
      id_servicio: '',
      id_empleado: '',
      fecha: '',
      hora: '',
      estado: 'pendiente',
      observaciones: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (cita: Cita) => {
    if (isCliente) {
      toast.error('No tienes permisos para editar citas');
      return;
    }
    setEditingCita(cita);
    setFormData({
      id_cliente: cita.id_cliente.toString(),
      id_servicio: cita.id_servicio.toString(),
      id_empleado: cita.id_empleado?.toString() || '',
      fecha: cita.fecha,
      hora: cita.hora,
      estado: cita.estado,
      observaciones: cita.observaciones || '',
    });
    setDialogOpen(true);
  };

  const handleViewDetails = (cita: Cita) => {
    setViewingCita(cita);
    setDetailsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (isCliente) {
      toast.error('No tienes permisos para eliminar citas');
      return;
    }
    setCitaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (citaToDelete) {
      const index = dataStore.citas.findIndex(c => c.id_cita === citaToDelete);
      if (index !== -1) {
        dataStore.citas.splice(index, 1);
      }
      setCitas([...dataStore.citas]);
      setFilteredCitas([...dataStore.citas]);
      toast.success('Cita eliminada correctamente');
    }
    setDeleteDialogOpen(false);
    setCitaToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCita) {
      const index = dataStore.citas.findIndex(c => c.id_cita === editingCita.id_cita);
      if (index !== -1) {
        dataStore.citas[index] = {
          ...dataStore.citas[index],
          id_cliente: parseInt(formData.id_cliente),
          id_servicio: parseInt(formData.id_servicio),
          id_empleado: formData.id_empleado ? parseInt(formData.id_empleado) : undefined,
          fecha: formData.fecha,
          hora: formData.hora,
          estado: formData.estado,
          observaciones: formData.observaciones,
        };
      }
      setCitas([...dataStore.citas]);
      setFilteredCitas([...dataStore.citas]);
      toast.success('Cita actualizada correctamente');
    } else {
      const newCita: Cita = {
        id_cita: Math.max(...dataStore.citas.map(c => c.id_cita), 0) + 1,
        id_cliente: parseInt(formData.id_cliente),
        id_servicio: parseInt(formData.id_servicio),
        id_empleado: formData.id_empleado ? parseInt(formData.id_empleado) : undefined,
        fecha: formData.fecha,
        hora: formData.hora,
        estado: formData.estado,
        observaciones: formData.observaciones,
      };
      dataStore.citas.push(newCita);
      setCitas([...dataStore.citas]);
      setFilteredCitas([...dataStore.citas]);
      toast.success('Cita creada correctamente');
    }

    setDialogOpen(false);
  };

  const handleConfirm = (id: number) => {
    const index = dataStore.citas.findIndex(c => c.id_cita === id);
    if (index !== -1) {
      dataStore.citas[index].estado = 'confirmada';
      setCitas([...dataStore.citas]);
      setFilteredCitas([...dataStore.citas]);
      toast.success('Cita confirmada');
    }
  };

  const handleComplete = (id: number) => {
    const index = dataStore.citas.findIndex(c => c.id_cita === id);
    if (index !== -1) {
      dataStore.citas[index].estado = 'completada';
      setCitas([...dataStore.citas]);
      setFilteredCitas([...dataStore.citas]);
      toast.success('Cita completada');
    }
  };

  const handleCancel = (id: number) => {
    const index = dataStore.citas.findIndex(c => c.id_cita === id);
    if (index !== -1) {
      dataStore.citas[index].estado = 'cancelada';
      setCitas([...dataStore.citas]);
      setFilteredCitas([...dataStore.citas]);
      toast.success('Cita cancelada');
    }
  };

  const getClienteName = (id_cliente: number, id_cliente_temporal?: number) => {
    if (id_cliente_temporal) {
      const clienteTemporal = dataStore.clientesTemporales.find(c => c.id_cliente_temporal === id_cliente_temporal);
      return clienteTemporal ? `${clienteTemporal.nombre} (Temporal)` : 'N/A';
    }
    const cliente = dataStore.clientes.find(c => c.id_cliente === id_cliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido || ''}` : 'N/A';
  };

  const getClienteEmail = (id_cliente: number, id_cliente_temporal?: number) => {
    if (id_cliente_temporal) {
      return dataStore.clientesTemporales.find(c => c.id_cliente_temporal === id_cliente_temporal)?.email || '';
    }
    return dataStore.clientes.find(c => c.id_cliente === id_cliente)?.email || '';
  };

  const getClienteTelefono = (id_cliente: number, id_cliente_temporal?: number) => {
    if (id_cliente_temporal) {
      return dataStore.clientesTemporales.find(c => c.id_cliente_temporal === id_cliente_temporal)?.telefono || '';
    }
    return dataStore.clientes.find(c => c.id_cliente === id_cliente)?.telefono || '';
  };

  const getServicioName = (id: number) => {
    return mockServicios.find(s => s.id_servicio === id)?.nombre || 'N/A';
  };

  const getServicioPrice = (id: number) => {
    return mockServicios.find(s => s.id_servicio === id)?.precio || 0;
  };

  const getEmpleadoName = (id?: number) => {
    if (!id) return 'Por asignar';
    const empleado = mockEmpleados.find(e => e.id_empleado === id);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : 'N/A';
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  const displayCitas = getFilteredCitasByRole();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Citas
          </h1>
          <p className="text-muted-foreground">
            {isCliente ? 'Gestiona tus citas' : 'Gestiona las citas programadas'}
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Estadísticas rápidas para Admin y Barbero */}
      {(isAdmin || isBarbero) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold">{displayCitas.filter(c => c.estado === 'pendiente').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confirmadas</p>
                  <p className="text-2xl font-bold">{displayCitas.filter(c => c.estado === 'confirmada').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold">{displayCitas.filter(c => c.estado === 'completada').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Canceladas</p>
                  <p className="text-2xl font-bold">{displayCitas.filter(c => c.estado === 'cancelada').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Citas</CardTitle>
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar citas..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Barbero</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(searchTerm ? filteredCitas : displayCitas).map((cita) => (
                  <TableRow key={cita.id_cita}>
                    <TableCell>#{cita.id_cita}</TableCell>
                    <TableCell>{getClienteName(cita.id_cliente, cita.id_cliente_temporal)}</TableCell>
                    <TableCell>{getServicioName(cita.id_servicio)}</TableCell>
                    <TableCell>{getEmpleadoName(cita.id_empleado)}</TableCell>
                    <TableCell>{new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>{cita.hora}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          cita.estado === 'completada' ? 'default' :
                          cita.estado === 'confirmada' ? 'secondary' :
                          cita.estado === 'cancelada' ? 'destructive' : 'outline'
                        }
                        className={
                          cita.estado === 'completada' ? 'bg-green-600' :
                          cita.estado === 'confirmada' ? 'bg-blue-600' :
                          cita.estado === 'pendiente' ? 'bg-yellow-600' : ''
                        }
                      >
                        {cita.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(cita)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!isCliente && (
                          <>
                            {cita.estado === 'pendiente' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleConfirm(cita.id_cita)}
                                className="bg-blue-50 hover:bg-blue-100"
                              >
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                              </Button>
                            )}
                            {cita.estado === 'confirmada' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleComplete(cita.id_cita)}
                                className="bg-green-50 hover:bg-green-100"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleEdit(cita)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCancel(cita.id_cita)}
                              disabled={cita.estado === 'cancelada' || cita.estado === 'completada'}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(cita.id_cita)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar cita */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCita ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
            <DialogDescription>
              {editingCita ? 'Actualiza la información de la cita' : 'Registra una nueva cita'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {!isCliente && (
                <div className="space-y-2">
                  <Label htmlFor="id_cliente">Cliente *</Label>
                  <Select
                    value={formData.id_cliente}
                    onValueChange={(value) => setFormData({ ...formData, id_cliente: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClientes.map((cliente) => (
                        <SelectItem key={cliente.id_cliente} value={cliente.id_cliente.toString()}>
                          {cliente.nombre} {cliente.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="id_servicio">Servicio *</Label>
                <Select
                  value={formData.id_servicio}
                  onValueChange={(value) => setFormData({ ...formData, id_servicio: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockServicios.map((servicio) => (
                      <SelectItem key={servicio.id_servicio} value={servicio.id_servicio.toString()}>
                        {servicio.nombre} - ${servicio.precio.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_empleado">Barbero</Label>
                <Select
                  value={formData.id_empleado}
                  onValueChange={(value) => setFormData({ ...formData, id_empleado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin asignar</SelectItem>
                    {mockEmpleados.map((empleado) => (
                      <SelectItem key={empleado.id_empleado} value={empleado.id_empleado.toString()}>
                        {empleado.nombre} {empleado.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!isCliente && (
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">Hora *</Label>
                <Select
                  value={formData.hora}
                  onValueChange={(value) => setFormData({ ...formData, hora: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                {editingCita ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalles */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita #{viewingCita?.id_cita}</DialogTitle>
            <DialogDescription>
              Información completa de la cita programada
            </DialogDescription>
          </DialogHeader>
          {viewingCita && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{getClienteName(viewingCita.id_cliente, viewingCita.id_cliente_temporal)}</p>
                    {viewingCita.id_cliente_temporal && (
                      <Badge variant="outline" className="mt-1">Reserva Web</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contacto</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{getClienteEmail(viewingCita.id_cliente, viewingCita.id_cliente_temporal)}</p>
                    <p className="text-sm">{getClienteTelefono(viewingCita.id_cliente, viewingCita.id_cliente_temporal)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Servicio</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{getServicioName(viewingCita.id_servicio)}</p>
                    <p className="text-sm text-muted-foreground">${getServicioPrice(viewingCita.id_servicio).toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Barbero</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{getEmpleadoName(viewingCita.id_empleado)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fecha y Hora</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{new Date(viewingCita.fecha + 'T00:00:00').toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p className="text-sm text-muted-foreground">{viewingCita.hora}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <Badge 
                      variant={
                        viewingCita.estado === 'completada' ? 'default' :
                        viewingCita.estado === 'confirmada' ? 'secondary' :
                        viewingCita.estado === 'cancelada' ? 'destructive' : 'outline'
                      }
                      className={
                        viewingCita.estado === 'completada' ? 'bg-green-600' :
                        viewingCita.estado === 'confirmada' ? 'bg-blue-600' :
                        viewingCita.estado === 'pendiente' ? 'bg-yellow-600' : ''
                      }
                    >
                      {viewingCita.estado}
                    </Badge>
                  </div>
                </div>
              </div>
              {viewingCita.observaciones && (
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>{viewingCita.observaciones}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cita será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
