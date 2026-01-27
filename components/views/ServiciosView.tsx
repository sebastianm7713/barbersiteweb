import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, Scissors, Search, CheckCircle, XCircle, Eye, Clock, DollarSign, FileText } from 'lucide-react';
import { mockServicios, Servicio } from '../../shared/lib/mockData';
import { toast } from 'sonner';
import { Pagination } from '../common/Pagination';
import { useAuth } from '../../features/auth';

export function ServiciosView() {
  const { user } = useAuth();
  const isCliente = user?.id_rol === 3;
  const [servicios, setServicios] = useState<Servicio[]>(mockServicios.map(s => ({ ...s, estado: s.estado || 'activo' })));
  const [filteredServicios, setFilteredServicios] = useState<Servicio[]>(servicios);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [viewingServicio, setViewingServicio] = useState<Servicio | null>(null);
  const [servicioToDelete, setServicioToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: 0,
    precio: 0,
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredServicios(servicios);
      return;
    }
    
    const filtered = servicios.filter(servicio => {
      const idServicio = servicio.id_servicio.toString().toLowerCase();
      const precio = servicio.precio.toString().toLowerCase();
      const duracion = servicio.duracion?.toString().toLowerCase() || '';
      
      return servicio.nombre.toLowerCase().includes(term) ||
             idServicio.includes(term) ||
             servicio.descripcion?.toLowerCase().includes(term) ||
             precio.includes(term) ||
             duracion.includes(term);
    });
    setFilteredServicios(filtered);
  };

  const handleCreate = () => {
    setEditingServicio(null);
    setFormData({ nombre: '', descripcion: '', precio: 0, duracion: 0, estado: 'activo' });
    setDialogOpen(true);
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precio: servicio.precio,
      duracion: servicio.duracion || 0,
      estado: servicio.estado as 'activo' | 'inactivo',
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setServicioToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (servicioToDelete) {
      const updated = servicios.filter(s => s.id_servicio !== servicioToDelete);
      setServicios(updated);
      setFilteredServicios(updated);
      toast.success('Servicio eliminado correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }
    setDeleteDialogOpen(false);
    setServicioToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('Error de validación', {
        description: 'El nombre del servicio es obligatorio',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (formData.nombre.trim().length < 3) {
      toast.error('Error de validación', {
        description: 'El nombre debe tener al menos 3 caracteres',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (formData.nombre.trim().length > 100) {
      toast.error('Error de validación', {
        description: 'El nombre no puede exceder 100 caracteres',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    const precio = parseFloat(formData.precio.toString());
    if (isNaN(precio) || precio <= 0) {
      toast.error('Error de validación', {
        description: 'El precio debe ser mayor a $0.00',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (precio > 10000) {
      toast.error('Error de validación', {
        description: 'El precio no puede exceder $10,000.00',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    const duracion = parseInt(formData.duracion.toString());
    if (isNaN(duracion) || duracion <= 0) {
      toast.error('Error de validación', {
        description: 'La duración debe ser mayor a 0 minutos',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (duracion < 5) {
      toast.error('Error de validación', {
        description: 'La duración mínima es de 5 minutos',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (duracion > 480) {
      toast.error('Error de validación', {
        description: 'La duración no puede exceder 480 minutos (8 horas)',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      toast.error('Error de validación', {
        description: 'La descripción no puede exceder 500 caracteres',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    // Validar que no exista otro servicio con el mismo nombre (excepto al editar)
    const nombreExiste = servicios.some(s => 
      s.nombre.toLowerCase() === formData.nombre.trim().toLowerCase() && 
      (!editingServicio || s.id_servicio !== editingServicio.id_servicio)
    );

    if (nombreExiste) {
      toast.error('Error de validación', {
        description: 'Ya existe un servicio con este nombre',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (editingServicio) {
      const updated = servicios.map(s =>
        s.id_servicio === editingServicio.id_servicio
          ? { 
              ...s, 
              nombre: formData.nombre.trim(),
              descripcion: formData.descripcion.trim(),
              precio: parseFloat(formData.precio.toString()),
              duracion: formData.duracion ? parseInt(formData.duracion.toString()) : undefined,
              estado: formData.estado,
            }
          : s
      );
      setServicios(updated);
      setFilteredServicios(updated);
      toast.success('Servicio actualizado exitosamente', {
        description: `${formData.nombre} ha sido actualizado correctamente`,
        style: { background: '#10b981', color: '#fff' }
      });
    } else {
      const newServicio: Servicio = {
        id_servicio: Math.max(...servicios.map(s => s.id_servicio)) + 1,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio.toString()),
        duracion: formData.duracion ? parseInt(formData.duracion.toString()) : undefined,
        estado: formData.estado,
      };
      const updated = [...servicios, newServicio];
      setServicios(updated);
      setFilteredServicios(updated);
      toast.success('Servicio creado exitosamente', {
        description: `${formData.nombre} ha sido agregado al catálogo`,
        style: { background: '#10b981', color: '#fff' }
      });
    }

    setDialogOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServicios.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Scissors className="w-6 h-6" />
            Servicios
          </h1>
          <p className="text-muted-foreground">
            {isCliente ? 'Consulta nuestro catálogo de servicios' : 'Gestiona los servicios ofrecidos'}
          </p>
        </div>
        {!isCliente && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Servicio
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Servicios</CardTitle>
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar servicios..."
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Duración (min)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((servicio) => (
                  <TableRow key={servicio.id_servicio}>
                    <TableCell>{servicio.nombre}</TableCell>
                    <TableCell>{servicio.descripcion || '-'}</TableCell>
                    <TableCell>${servicio.precio.toFixed(2)}</TableCell>
                    <TableCell>{servicio.duracion || '-'}</TableCell>
                    <TableCell>
                      {servicio.estado === 'activo' ? (
                        <Badge className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setViewingServicio(servicio); setDetailsDialogOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!isCliente && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(servicio)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(servicio.id_servicio)}>
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
        <Pagination
          totalItems={filteredServicios.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
            <DialogDescription>
              {editingServicio ? 'Actualiza la información del servicio' : 'Agrega un nuevo servicio al catálogo'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                  ℹ️ Información Importante
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Todos los campos marcados con * son obligatorios. El servicio estará disponible para reservas de citas.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Servicio <span className="text-red-500">*</span></Label>
                <Input 
                  id="nombre" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                  placeholder="Ej: Corte de cabello clásico"
                  maxLength={100}
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  {formData.nombre.length}/100 caracteres | Mínimo 3 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  value={formData.descripcion} 
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                  placeholder="Describe el servicio que ofreces..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.descripcion.length}/500 caracteres
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      id="precio" 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      max="10000"
                      value={formData.precio} 
                      onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })} 
                      className="pl-7"
                      placeholder="0.00"
                      required 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rango: $0.01 - $10,000.00
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración (minutos) <span className="text-red-500">*</span></Label>
                  <Input 
                    id="duracion" 
                    type="number" 
                    min="5"
                    max="480"
                    value={formData.duracion} 
                    onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 0 })} 
                    placeholder="30"
                    required 
                  />
                  <p className="text-xs text-muted-foreground">
                    Rango: 5 min - 480 min (8 horas)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado del Servicio <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => setFormData({ ...formData, estado: value as 'activo' | 'inactivo' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Activo
                      </div>
                    </SelectItem>
                    <SelectItem value="inactivo">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Inactivo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.estado === 'activo' 
                    ? '✓ Los clientes podrán reservar este servicio' 
                    : '✗ Este servicio no estará disponible para reservas'}
                </p>
              </div>

              {/* Vista previa del cálculo */}
              {formData.precio > 0 && formData.duracion > 0 && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Precio por minuto</p>
                        <p className="font-bold text-green-600">
                          ${(formData.precio / formData.duracion).toFixed(2)}/min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Duración total</p>
                        <p className="font-bold">{formData.duracion} minutos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Nota de validación */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">⚠️ Nota:</span> El nombre del servicio debe ser único. Se validará que no exista otro servicio con el mismo nombre.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                <Scissors className="w-4 h-4 mr-2" />
                {editingServicio ? 'Actualizar Servicio' : 'Crear Servicio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalles */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-orange-600" />
              Detalles del Servicio
            </DialogTitle>
            <DialogDescription>
              Información completa del servicio seleccionado
            </DialogDescription>
          </DialogHeader>
          
          {viewingServicio && (
            <div className="space-y-6 py-4">
              {/* Card Principal con Info General */}
              <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Nombre del Servicio</p>
                      <p className="text-2xl font-bold text-orange-600">{viewingServicio.nombre}</p>
                    </div>
                    <div>
                      {viewingServicio.estado === 'activo' ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Precio</p>
                        <p className="text-xl font-bold">${viewingServicio.precio.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duración</p>
                        <p className="text-xl font-bold">{viewingServicio.duracion || '-'} min</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Descripción */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-base">Descripción</Label>
                </div>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-muted-foreground">
                      {viewingServicio.descripcion || 'Sin descripción disponible'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Información Adicional */}
              <div className="space-y-2">
                <Label className="text-base">Información del Servicio</Label>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">ID del Servicio</span>
                      <Badge variant="outline">#{viewingServicio.id_servicio}</Badge>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">Precio por minuto</span>
                      <span className="font-medium">
                        ${viewingServicio.duracion ? (viewingServicio.precio / viewingServicio.duracion).toFixed(2) : '0.00'}/min
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estado del Servicio</span>
                      <span className="font-medium capitalize">{viewingServicio.estado || 'activo'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Nota Informativa */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">💡 Nota:</span> Este servicio puede ser reservado por los clientes a través del sistema de citas.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Cerrar
            </Button>
            {!isCliente && (
              <Button onClick={() => {
                setDetailsDialogOpen(false);
                if (viewingServicio) {
                  handleEdit(viewingServicio);
                }
              }}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar Servicio
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
