import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Pencil, Trash2, UserCog, Eye, FileDown, Mail, Phone, Calendar } from 'lucide-react';
import { mockEmpleados, Empleado } from '../../shared/lib/mockData';
import { toast } from 'sonner';
import { SearchBar } from '../common/SearchBar';

export function EmpleadosView() {
  const [empleados, setEmpleados] = useState<Empleado[]>(mockEmpleados);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [viewingEmpleado, setViewingEmpleado] = useState<Empleado | null>(null);
  const [empleadoToDelete, setEmpleadoToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cargo: '',
    telefono: '',
    email: '',
    fecha_contratacion: '',
    salario: '',
  });

  // Filtrar empleados por término de búsqueda
  const filteredEmpleados = useMemo(() => {
    if (!searchTerm.trim()) return empleados;

    const lowerSearch = searchTerm.toLowerCase();
    return empleados.filter((empleado) => {
      const fullName = `${empleado.nombre} ${empleado.apellido}`.toLowerCase();
      const cargo = empleado.cargo.toLowerCase();
      const email = (empleado.email || '').toLowerCase();
      const telefono = (empleado.telefono || '').toLowerCase();
      
      return (
        fullName.includes(lowerSearch) ||
        cargo.includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        telefono.includes(lowerSearch)
      );
    });
  }, [empleados, searchTerm]);

  const handleExport = () => {
    toast.success('Exportando a Excel...', {
      style: { background: '#10b981', color: '#fff' }
    });
    console.log('Exportando empleados:', empleados);
  };

  const handleCreate = () => {
    setEditingEmpleado(null);
    setFormData({
      nombre: '',
      apellido: '',
      cargo: '',
      telefono: '',
      email: '',
      fecha_contratacion: '',
      salario: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      cargo: empleado.cargo,
      telefono: empleado.telefono || '',
      email: empleado.email || '',
      fecha_contratacion: empleado.fecha_contratacion,
      salario: empleado.salario?.toString() || '',
    });
    setDialogOpen(true);
  };

  const handleView = (empleado: Empleado) => {
    setViewingEmpleado(empleado);
    setDetailsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setEmpleadoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (empleadoToDelete) {
      setEmpleados(empleados.filter(e => e.id_empleado !== empleadoToDelete));
      toast.success('Empleado eliminado correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }
    setDeleteDialogOpen(false);
    setEmpleadoToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEmpleado) {
      const updated = empleados.map(emp =>
        emp.id_empleado === editingEmpleado.id_empleado
          ? {
              ...emp,
              ...formData,
              salario: formData.salario ? parseFloat(formData.salario) : undefined,
            }
          : emp
      );
      setEmpleados(updated);
      toast.success('Empleado actualizado correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    } else {
      const newEmpleado: Empleado = {
        id_empleado: Math.max(...empleados.map(e => e.id_empleado), 0) + 1,
        ...formData,
        salario: formData.salario ? parseFloat(formData.salario) : undefined,
      };
      setEmpleados([...empleados, newEmpleado]);
      toast.success('Empleado creado correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }

    setDialogOpen(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <UserCog className="w-6 h-6" />
            Empleados
          </h1>
          <p className="text-muted-foreground">Gestiona los empleados del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Empleado
          </Button>
          <Button onClick={handleExport}>
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Empleados</CardTitle>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nombre, cargo, email o teléfono..."
              className="w-full md:w-96"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredEmpleados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron empleados con ese criterio' : 'No hay empleados registrados'}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Fecha Contratación</TableHead>
                  <TableHead>Salario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpleados.map((empleado) => (
                  <TableRow key={empleado.id_empleado}>
                    <TableCell>{empleado.nombre} {empleado.apellido}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{empleado.cargo}</Badge>
                    </TableCell>
                    <TableCell>{empleado.email || '-'}</TableCell>
                    <TableCell>{empleado.telefono || '-'}</TableCell>
                    <TableCell>{new Date(empleado.fecha_contratacion + 'T00:00:00').toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>{empleado.salario ? `$${empleado.salario.toFixed(2)}` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(empleado)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(empleado)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(empleado.id_empleado)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
            <DialogDescription>
              {editingEmpleado ? 'Actualiza la información del empleado' : 'Registra un nuevo empleado'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_contratacion">Fecha Contratación *</Label>
                <Input
                  id="fecha_contratacion"
                  type="date"
                  value={formData.fecha_contratacion}
                  onChange={(e) => setFormData({ ...formData, fecha_contratacion: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salario">Salario</Label>
                <Input
                  id="salario"
                  type="number"
                  step="0.01"
                  value={formData.salario}
                  onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingEmpleado ? 'Actualizar' : 'Crear'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalles */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Empleado</DialogTitle>
            <DialogDescription>Información completa del empleado</DialogDescription>
          </DialogHeader>
          {viewingEmpleado && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">
                      {viewingEmpleado.nombre} {viewingEmpleado.apellido}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <Badge variant="outline">{viewingEmpleado.cargo}</Badge>
                  </div>
                </div>
                {viewingEmpleado.email && (
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p>{viewingEmpleado.email}</p>
                    </div>
                  </div>
                )}
                {viewingEmpleado.telefono && (
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p>{viewingEmpleado.telefono}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Fecha de Contratación</Label>
                  <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p>
                      {new Date(viewingEmpleado.fecha_contratacion + 'T00:00:00').toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {viewingEmpleado.salario && (
                  <div className="space-y-2">
                    <Label>Salario</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="font-medium text-green-600">
                        ${viewingEmpleado.salario.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El empleado será eliminado permanentemente.
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
