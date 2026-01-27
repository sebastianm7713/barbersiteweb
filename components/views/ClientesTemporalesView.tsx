import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Search, Eye, UserCheck, Trash2, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { ClienteTemporal, Usuario } from '../../shared/lib/mockData';
import { dataStore } from '../../shared/lib/dataStore';
import { toast } from 'sonner';

export function ClientesTemporalesView() {
  const [clientesTemporales, setClientesTemporales] = useState<ClienteTemporal[]>(dataStore.clientesTemporales);
  const [filteredClientesTemporales, setFilteredClientesTemporales] = useState<ClienteTemporal[]>(dataStore.clientesTemporales);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewingCliente, setViewingCliente] = useState<ClienteTemporal | null>(null);
  const [convertingCliente, setConvertingCliente] = useState<ClienteTemporal | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [convertFormData, setConvertFormData] = useState({
    apellido: '',
    direccion: '',
    password: '',
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = clientesTemporales.filter(cliente => {
      const idCliente = cliente.id_cliente_temporal.toString();
      
      return cliente.nombre.toLowerCase().includes(term) ||
             idCliente.includes(term) ||
             cliente.email.toLowerCase().includes(term) ||
             cliente.telefono.includes(term);
    });
    setFilteredClientesTemporales(filtered);
  };

  const handleViewDetails = (cliente: ClienteTemporal) => {
    setViewingCliente(cliente);
    setDetailsDialogOpen(true);
  };

  const handleConvertToUser = (cliente: ClienteTemporal) => {
    setConvertingCliente(cliente);
    setConvertFormData({
      apellido: '',
      direccion: '',
      password: '',
    });
    setConvertDialogOpen(true);
  };

  const confirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!convertingCliente) return;

    // Crear nuevo cliente permanente
    const newCliente = {
      id_cliente: Math.max(...dataStore.clientes.map(c => c.id_cliente), 0) + 1,
      nombre: convertingCliente.nombre.split(' ')[0],
      apellido: convertFormData.apellido || convertingCliente.nombre.split(' ').slice(1).join(' '),
      email: convertingCliente.email,
      telefono: convertingCliente.telefono,
      direccion: convertFormData.direccion,
      fecha_registro: new Date().toISOString().split('T')[0],
    };
    dataStore.clientes.push(newCliente);

    // Crear nuevo usuario
    const newUsuario: Usuario = {
      id_usuario: Math.max(...dataStore.usuarios.map(u => u.id_usuario), 0) + 1,
      id_rol: 3, // Rol de cliente
      nombre: convertingCliente.nombre,
      email: convertingCliente.email,
      password: convertFormData.password,
      telefono: convertingCliente.telefono,
      estado: 'activo',
    };
    dataStore.usuarios.push(newUsuario);

    // Actualizar citas con el nuevo id_cliente
    dataStore.citas.forEach(cita => {
      if (cita.id_cliente_temporal === convertingCliente.id_cliente_temporal) {
        cita.id_cliente = newCliente.id_cliente;
        cita.id_cliente_temporal = undefined;
      }
    });

    // Marcar cliente temporal como registrado
    const index = dataStore.clientesTemporales.findIndex(c => c.id_cliente_temporal === convertingCliente.id_cliente_temporal);
    if (index !== -1) {
      dataStore.clientesTemporales[index].estado = 'registrado';
    }

    setClientesTemporales([...dataStore.clientesTemporales]);
    setFilteredClientesTemporales([...dataStore.clientesTemporales]);
    setConvertDialogOpen(false);
    toast.success('Cliente convertido a usuario registrado exitosamente');
  };

  const handleDelete = (id: number) => {
    setClienteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clienteToDelete) {
      // Verificar si tiene citas activas
      const tienesCitas = dataStore.citas.some(c => 
        c.id_cliente_temporal === clienteToDelete && 
        (c.estado === 'pendiente' || c.estado === 'confirmada')
      );
      
      if (tienesCitas) {
        toast.error('No se puede eliminar: el cliente tiene citas activas');
        setDeleteDialogOpen(false);
        return;
      }

      const index = dataStore.clientesTemporales.findIndex(c => c.id_cliente_temporal === clienteToDelete);
      if (index !== -1) {
        dataStore.clientesTemporales.splice(index, 1);
      }
      setClientesTemporales([...dataStore.clientesTemporales]);
      setFilteredClientesTemporales([...dataStore.clientesTemporales]);
      toast.success('Cliente temporal eliminado');
    }
    setDeleteDialogOpen(false);
    setClienteToDelete(null);
  };

  const getCitasCount = (id: number) => {
    return dataStore.citas.filter(c => c.id_cliente_temporal === id).length;
  };

  const getCitasPendientes = (id: number) => {
    return dataStore.citas.filter(c => 
      c.id_cliente_temporal === id && 
      (c.estado === 'pendiente' || c.estado === 'confirmada')
    ).length;
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Clientes Temporales
          </h1>
          <p className="text-muted-foreground">Gestiona los pre-registros de la web</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{clientesTemporales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{clientesTemporales.filter(c => c.estado === 'pendiente').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registrados</p>
                <p className="text-2xl font-bold">{clientesTemporales.filter(c => c.estado === 'registrado').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Clientes Temporales</CardTitle>
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar clientes..."
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Citas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(searchTerm ? filteredClientesTemporales : clientesTemporales).map((cliente) => (
                  <TableRow key={cliente.id_cliente_temporal}>
                    <TableCell>#{cliente.id_cliente_temporal}</TableCell>
                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {cliente.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {cliente.telefono}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(cliente.fecha_registro + 'T00:00:00').toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline">{getCitasCount(cliente.id_cliente_temporal)} total</Badge>
                        {getCitasPendientes(cliente.id_cliente_temporal) > 0 && (
                          <Badge className="bg-yellow-600">{getCitasPendientes(cliente.id_cliente_temporal)} activas</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={cliente.estado === 'registrado' ? 'default' : 'outline'}
                        className={cliente.estado === 'registrado' ? 'bg-green-600' : 'bg-yellow-600'}
                      >
                        {cliente.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(cliente)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {cliente.estado === 'pendiente' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleConvertToUser(cliente)}
                            className="bg-green-50 hover:bg-green-100"
                          >
                            <UserCheck className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(cliente.id_cliente_temporal)}
                          disabled={getCitasPendientes(cliente.id_cliente_temporal) > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalles */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente Temporal</DialogTitle>
            <DialogDescription>
              Información completa del pre-registro
            </DialogDescription>
          </DialogHeader>
          {viewingCliente && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{viewingCliente.nombre}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p>{viewingCliente.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p>{viewingCliente.telefono}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Registro</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>{new Date(viewingCliente.fecha_registro + 'T00:00:00').toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <Badge 
                      variant={viewingCliente.estado === 'registrado' ? 'default' : 'outline'}
                      className={viewingCliente.estado === 'registrado' ? 'bg-green-600' : 'bg-yellow-600'}
                    >
                      {viewingCliente.estado}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Citas</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{getCitasCount(viewingCliente.id_cliente_temporal)} citas registradas</p>
                    {getCitasPendientes(viewingCliente.id_cliente_temporal) > 0 && (
                      <p className="text-sm text-muted-foreground">{getCitasPendientes(viewingCliente.id_cliente_temporal)} activas</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mostrar citas */}
              {getCitasCount(viewingCliente.id_cliente_temporal) > 0 && (
                <div className="space-y-2">
                  <Label>Historial de Citas</Label>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Servicio</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataStore.citas
                          .filter(c => c.id_cliente_temporal === viewingCliente.id_cliente_temporal)
                          .map((cita) => (
                            <TableRow key={cita.id_cita}>
                              <TableCell>{dataStore.servicios.find(s => s.id_servicio === cita.id_servicio)?.nombre}</TableCell>
                              <TableCell>{cita.fecha} {cita.hora}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{cita.estado}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
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

      {/* Dialog para convertir a usuario */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convertir a Usuario Registrado</DialogTitle>
            <DialogDescription>
              Completa la información adicional para crear una cuenta de usuario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={confirmConvert}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email (no editable)</Label>
                <Input value={convertingCliente?.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido (opcional)</Label>
                <Input
                  id="apellido"
                  value={convertFormData.apellido}
                  onChange={(e) => setConvertFormData({ ...convertFormData, apellido: e.target.value })}
                  placeholder="Si el nombre no incluye apellido"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección (opcional)</Label>
                <Input
                  id="direccion"
                  value={convertFormData.direccion}
                  onChange={(e) => setConvertFormData({ ...convertFormData, direccion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Temporal *</Label>
                <Input
                  id="password"
                  type="password"
                  value={convertFormData.password}
                  onChange={(e) => setConvertFormData({ ...convertFormData, password: e.target.value })}
                  required
                  placeholder="El usuario podrá cambiarla después"
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-900">
                  Se creará una cuenta de usuario con rol "Cliente" y todas las citas se vincularán al nuevo usuario.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConvertDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                <UserCheck className="w-4 h-4 mr-2" />
                Convertir
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cliente temporal será eliminado permanentemente.
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
