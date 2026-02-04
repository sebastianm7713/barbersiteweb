import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { RotateCcw, Plus, FileDown, Eye, Trash2, Search, Package, CheckCircle2, XCircle, Clock, AlertCircle, Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { mockDevoluciones, mockVentasDetalle, mockProductos, mockVentas, Devolucion } from '../../shared/lib/mockData';
import { toast } from 'sonner';
import { exportToExcelXLSX } from '../../shared/lib/exportUtils';

// Función para buscar en fechas con múltiples formatos
const searchInDate = (dateStr: string, searchTerm: string): boolean => {
  const term = searchTerm.toLowerCase().trim();
  
  try {
    const date = new Date(dateStr + 'T00:00:00');
    
    const ddmmyyyy = date.toLocaleDateString('es-ES');
    if (ddmmyyyy.includes(term)) return true;
    
    const ddmmyyyyDash = ddmmyyyy.replace(/\//g, '-');
    if (ddmmyyyyDash.includes(term)) return true;
    
    if (dateStr.includes(term)) return true;
    
    const monthLong = date.toLocaleDateString('es-ES', { month: 'long' });
    if (monthLong.includes(term)) return true;
    
    const monthShort = date.toLocaleDateString('es-ES', { month: 'short' });
    if (monthShort.includes(term)) return true;
    
    const year = date.getFullYear().toString();
    if (year.includes(term)) return true;
    
    const day = date.getDate().toString();
    if (day === term || day.padStart(2, '0') === term) return true;
    
    const month = (date.getMonth() + 1).toString();
    if (month === term || month.padStart(2, '0') === term) return true;
    
    return false;
  } catch {
    return false;
  }
};

export function DevolucionesStockView() {
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>(mockDevoluciones);
  const [filteredDevoluciones, setFilteredDevoluciones] = useState<Devolucion[]>(mockDevoluciones);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDevolucion, setEditingDevolucion] = useState<Devolucion | null>(null);
  const [viewingDevolucion, setViewingDevolucion] = useState<any | null>(null);
  const [devolucionToDelete, setDevolucionToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Formulario
  const [formData, setFormData] = useState({
    id_venta_prod_detalle: '',
    motivo: '',
    fecha: new Date().toISOString().split('T')[0],
    remitido: 'stock' as 'stock' | 'proveedor',
    estado: 'pendiente' as 'pendiente' | 'aprobada' | 'rechazada',
  });

  const getProductoInfo = (id_venta_prod_detalle?: number) => {
    if (!id_venta_prod_detalle) return { nombre: 'N/A', cantidad: 0, venta_id: 0 };
    
    const detalle = mockVentasDetalle.find(d => d.id_venta_prod_detalle === id_venta_prod_detalle);
    if (detalle) {
      const producto = mockProductos.find(p => p.id_producto === detalle.id_producto);
      return {
        nombre: producto?.nombre || 'N/A',
        cantidad: detalle.cantidad,
        venta_id: detalle.id_venta,
        precio_unitario: detalle.precio_unitario,
        subtotal: detalle.subtotal,
      };
    }
    return { nombre: 'N/A', cantidad: 0, venta_id: 0 };
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = devoluciones.filter(devolucion => {
      const cleanTerm = term.replace('#', '').trim();
      const idDevolucion = devolucion.id_devolucion.toString();
      const idVentaDetalle = devolucion.id_venta_prod_detalle?.toString() || '';
      const motivo = devolucion.motivo?.toLowerCase() || '';
      const remitido = devolucion.remitido.toLowerCase();
      const estado = devolucion.estado.toLowerCase();
      const productoInfo = getProductoInfo(devolucion.id_venta_prod_detalle);
      const productoNombre = productoInfo.nombre.toLowerCase();
      const cantidad = productoInfo.cantidad.toString();
      const ventaId = productoInfo.venta_id.toString();
      
      // Búsqueda por ID (con o sin #)
      if (term.startsWith('#') && idDevolucion.includes(cleanTerm)) {
        return true;
      }
      
      return idDevolucion.includes(cleanTerm) ||
             idVentaDetalle.includes(cleanTerm) ||
             searchInDate(devolucion.fecha, term) ||
             motivo.includes(term) ||
             remitido.includes(term) ||
             estado.includes(term) ||
             productoNombre.includes(term) ||
             cantidad.includes(term) ||
             ventaId.includes(term);
    });
    
    setFilteredDevoluciones(filtered);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const dataToExport = devoluciones.map(devolucion => {
      const productoInfo = getProductoInfo(devolucion.id_venta_prod_detalle);
      return {
        'ID': devolucion.id_devolucion,
        'Producto': productoInfo.nombre,
        'Cantidad': productoInfo.cantidad,
        'Venta': `#${productoInfo.venta_id}`,
        'Motivo': devolucion.motivo || 'N/A',
        'Fecha': new Date(devolucion.fecha + 'T00:00:00').toLocaleDateString('es-ES'),
        'Destino': devolucion.remitido === 'stock' ? 'Stock' : 'Proveedor',
        'Estado': devolucion.estado === 'aprobada' ? 'Aprobada' : devolucion.estado === 'rechazada' ? 'Rechazada' : 'Pendiente',
      };
    });

    const fechaActual = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    exportToExcelXLSX(dataToExport, `Devoluciones_Stock_${fechaActual}`, 'Devoluciones');
    
    toast.success('Archivo Excel descargado exitosamente', {
      style: { background: '#10b981', color: '#fff' }
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.id_venta_prod_detalle) {
      errors.id_venta_prod_detalle = 'Debes seleccionar un producto de venta';
    }

    if (!formData.motivo.trim()) {
      errors.motivo = 'El motivo es obligatorio';
    } else if (formData.motivo.trim().length < 10) {
      errors.motivo = 'El motivo debe tener al menos 10 caracteres';
    } else if (formData.motivo.trim().length > 500) {
      errors.motivo = 'El motivo no puede exceder 500 caracteres';
    }

    // Validar fecha
    if (!formData.fecha) {
      errors.fecha = 'La fecha es obligatoria';
    } else {
      const fechaDevolucion = new Date(formData.fecha + 'T00:00:00');
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0);
      
      if (fechaDevolucion > fechaActual) {
        errors.fecha = 'La fecha no puede ser futura';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    setEditingDevolucion(null);
    setFormData({
      id_venta_prod_detalle: '',
      motivo: '',
      fecha: new Date().toISOString().split('T')[0],
      remitido: 'stock',
      estado: 'pendiente',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEdit = (devolucion: Devolucion) => {
    setEditingDevolucion(devolucion);
    setFormData({
      id_venta_prod_detalle: devolucion.id_venta_prod_detalle?.toString() || '',
      motivo: devolucion.motivo || '',
      fecha: devolucion.fecha,
      remitido: devolucion.remitido,
      estado: devolucion.estado,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleView = (devolucion: Devolucion) => {
    const productoInfo = getProductoInfo(devolucion.id_venta_prod_detalle);
    setViewingDevolucion({ ...devolucion, productoInfo });
    setDetailsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDevolucionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (devolucionToDelete) {
      setDevoluciones(devoluciones.filter(d => d.id_devolucion !== devolucionToDelete));
      setFilteredDevoluciones(filteredDevoluciones.filter(d => d.id_devolucion !== devolucionToDelete));
      toast.success('Devolución eliminada correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }
    setDeleteDialogOpen(false);
    setDevolucionToDelete(null);
  };

  const handleStatusChange = (id: number, newStatus: 'pendiente' | 'aprobada' | 'rechazada') => {
    const updated = devoluciones.map(d =>
      d.id_devolucion === id
        ? { ...d, estado: newStatus }
        : d
    );
    setDevoluciones(updated);
    setFilteredDevoluciones(updated.filter(d => {
      // Mantener los filtros de búsqueda
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const cleanTerm = term.replace('#', '').trim();
      const idDevolucion = d.id_devolucion.toString();
      const idVentaDetalle = d.id_venta_prod_detalle?.toString() || '';
      const motivo = d.motivo?.toLowerCase() || '';
      const remitido = d.remitido.toLowerCase();
      const estado = d.estado.toLowerCase();
      const productoInfo = getProductoInfo(d.id_venta_prod_detalle);
      const productoNombre = productoInfo.nombre.toLowerCase();
      const cantidad = productoInfo.cantidad.toString();
      const ventaId = productoInfo.venta_id.toString();
      
      if (term.startsWith('#') && idDevolucion.includes(cleanTerm)) {
        return true;
      }
      
      return idDevolucion.includes(cleanTerm) ||
             idVentaDetalle.includes(cleanTerm) ||
             searchInDate(d.fecha, term) ||
             motivo.includes(term) ||
             remitido.includes(term) ||
             estado.includes(term) ||
             productoNombre.includes(term) ||
             cantidad.includes(term) ||
             ventaId.includes(term);
    }));
    
    const statusMessages = {
      aprobada: 'Devolución aprobada exitosamente',
      rechazada: 'Devolución rechazada',
      pendiente: 'Devolución marcada como pendiente',
    };
    
    toast.success(statusMessages[newStatus], {
      style: { background: '#10b981', color: '#fff' }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (editingDevolucion) {
      const updated = devoluciones.map(d =>
        d.id_devolucion === editingDevolucion.id_devolucion
          ? {
              ...d,
              id_venta_prod_detalle: parseInt(formData.id_venta_prod_detalle),
              motivo: formData.motivo,
              fecha: formData.fecha,
              remitido: formData.remitido,
              estado: formData.estado,
            }
          : d
      );
      setDevoluciones(updated);
      setFilteredDevoluciones(updated);
      toast.success('Devolución actualizada correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    } else {
      const newDevolucion: Devolucion = {
        id_devolucion: Math.max(...devoluciones.map(d => d.id_devolucion), 0) + 1,
        id_venta_prod_detalle: parseInt(formData.id_venta_prod_detalle),
        motivo: formData.motivo,
        fecha: formData.fecha,
        remitido: formData.remitido,
        estado: formData.estado,
      };
      const updatedList = [...devoluciones, newDevolucion];
      setDevoluciones(updatedList);
      setFilteredDevoluciones(updatedList);
      toast.success('Devolución registrada exitosamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }

    setDialogOpen(false);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case 'rechazada':
        return (
          <Badge className="bg-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      case 'pendiente':
        return (
          <Badge className="bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getDestinoBadge = (remitido: string) => {
    if (remitido === 'stock') {
      return (
        <Badge className="bg-blue-600">
          <Package className="w-3 h-3 mr-1" />
          Stock
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-orange-600">
          <RotateCcw className="w-3 h-3 mr-1" />
          Proveedor
        </Badge>
      );
    }
  };

  const totalDevoluciones = filteredDevoluciones.length;
  const devolucionesPendientes = filteredDevoluciones.filter(d => d.estado === 'pendiente').length;
  const devolucionesAprobadas = filteredDevoluciones.filter(d => d.estado === 'aprobada').length;
  const devolucionesRechazadas = filteredDevoluciones.filter(d => d.estado === 'rechazada').length;

  // Paginación
  const totalPages = Math.ceil(filteredDevoluciones.length / itemsPerPage);
  const currentPaginatedDevoluciones = filteredDevoluciones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <RotateCcw className="w-6 h-6" />
            Devolución al Stock
          </h1>
          <p className="text-muted-foreground">Gestiona las devoluciones de productos al inventario</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Devolución
          </Button>
          <Button onClick={handleExport} variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-blue-600">{totalDevoluciones}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-600 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{devolucionesPendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">{devolucionesAprobadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">{devolucionesRechazadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Devoluciones</CardTitle>
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por ID, producto, cantidad, estado..."
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
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPaginatedDevoluciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No se encontraron devoluciones
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPaginatedDevoluciones.map((devolucion) => {
                    const productoInfo = getProductoInfo(devolucion.id_venta_prod_detalle);
                    return (
                      <TableRow key={devolucion.id_devolucion}>
                        <TableCell>#{devolucion.id_devolucion}</TableCell>
                        <TableCell className="font-medium">{productoInfo.nombre}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{productoInfo.cantidad} unid.</Badge>
                        </TableCell>
                        <TableCell>#{productoInfo.venta_id}</TableCell>
                        <TableCell className="max-w-xs truncate">{devolucion.motivo || 'N/A'}</TableCell>
                        <TableCell>{new Date(devolucion.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{getDestinoBadge(devolucion.remitido)}</TableCell>
                        <TableCell>
                          <Select
                            value={devolucion.estado}
                            onValueChange={(value: any) => handleStatusChange(devolucion.id_devolucion, value)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue>
                                {getEstadoBadge(devolucion.estado)}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-yellow-600" />
                                  <span>Pendiente</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="aprobada">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span>Aprobada</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="rechazada">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span>Rechazada</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleView(devolucion)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(devolucion)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(devolucion.id_devolucion)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Paginador */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground px-2">
                  Página
                </span>
                <span className="text-sm font-medium px-2 py-1 bg-blue-600 text-white rounded">
                  {currentPage}
                </span>
                <span className="text-sm text-muted-foreground px-2">
                  de {totalPages || 1}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Mostrando {filteredDevoluciones.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDevoluciones.length)} de {filteredDevoluciones.length} registros
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPage" className="text-sm text-muted-foreground">
                Mostrar:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDevolucion ? 'Editar Devolución' : 'Nueva Devolución al Stock'}</DialogTitle>
            <DialogDescription>
              {editingDevolucion ? 'Actualiza la información de la devolución' : 'Registra una nueva devolución al inventario'}
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Información Importante</AlertTitle>
            <AlertDescription className="text-blue-700">
              Esta aplicación es solo para gestión interna. Las devoluciones se registran únicamente desde nuestro establecimiento físico.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="id_venta_prod_detalle">
                    Producto de Venta <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.id_venta_prod_detalle}
                    onValueChange={(value) => {
                      setFormData({ ...formData, id_venta_prod_detalle: value });
                      if (formErrors.id_venta_prod_detalle) {
                        setFormErrors({ ...formErrors, id_venta_prod_detalle: '' });
                      }
                    }}
                  >
                    <SelectTrigger className={formErrors.id_venta_prod_detalle ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona un producto vendido" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVentasDetalle.map((detalle) => {
                        const producto = mockProductos.find(p => p.id_producto === detalle.id_producto);
                        return (
                          <SelectItem key={detalle.id_venta_prod_detalle} value={detalle.id_venta_prod_detalle.toString()}>
                            Venta #{detalle.id_venta} - {producto?.nombre || 'N/A'} - {detalle.cantidad} unid. - ${detalle.precio_unitario.toFixed(2)} c/u
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {formErrors.id_venta_prod_detalle && (
                    <p className="text-xs text-red-500">{formErrors.id_venta_prod_detalle}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha">
                    Fecha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => {
                      setFormData({ ...formData, fecha: e.target.value });
                      if (formErrors.fecha) {
                        setFormErrors({ ...formErrors, fecha: '' });
                      }
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className={formErrors.fecha ? 'border-red-500' : ''}
                  />
                  {formErrors.fecha && (
                    <p className="text-xs text-red-500">{formErrors.fecha}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remitido">
                    Destino <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.remitido}
                    onValueChange={(value: any) => setFormData({ ...formData, remitido: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="proveedor">Proveedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">
                  Motivo de Devolución <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => {
                    setFormData({ ...formData, motivo: e.target.value });
                    if (formErrors.motivo) {
                      setFormErrors({ ...formErrors, motivo: '' });
                    }
                  }}
                  placeholder="Describe el motivo de la devolución (mínimo 10 caracteres)..."
                  rows={4}
                  className={formErrors.motivo ? 'border-red-500' : ''}
                />
                <div className="flex justify-between">
                  <div>
                    {formErrors.motivo && (
                      <p className="text-xs text-red-500">{formErrors.motivo}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.motivo.length} / 500 caracteres
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingDevolucion ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalles */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Devolución #{viewingDevolucion?.id_devolucion}</DialogTitle>
            <DialogDescription>Información completa de la devolución</DialogDescription>
          </DialogHeader>
          {viewingDevolucion && (
            <div className="space-y-6 py-4">
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Devolución</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">#{viewingDevolucion.id_devolucion}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {getEstadoBadge(viewingDevolucion.estado)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Producto</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{viewingDevolucion.productoInfo?.nombre}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <Badge variant="outline" className="text-base">
                      {viewingDevolucion.productoInfo?.cantidad} unidades
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Venta Original</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">#{viewingDevolucion.productoInfo?.venta_id}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>
                      {new Date(viewingDevolucion.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Destino</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {getDestinoBadge(viewingDevolucion.remitido)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Motivo de la Devolución</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <p>{viewingDevolucion.motivo || 'N/A'}</p>
                </div>
              </div>

              {/* Información del Producto */}
              {viewingDevolucion.productoInfo && (
                <div className="space-y-2">
                  <Label>Información de la Venta Original</Label>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Precio Unitario:</span>
                        <span className="font-medium">${viewingDevolucion.productoInfo.precio_unitario?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-semibold">Total Devuelto:</span>
                        <span className="font-bold text-blue-600">
                          ${viewingDevolucion.productoInfo.subtotal?.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {viewingDevolucion.estado === 'aprobada' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Devolución Aprobada</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Esta devolución ha sido aprobada y procesada correctamente.
                  </AlertDescription>
                </Alert>
              )}

              {viewingDevolucion.estado === 'rechazada' && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Devolución Rechazada</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Esta devolución ha sido rechazada y no se procesará.
                  </AlertDescription>
                </Alert>
              )}

              {viewingDevolucion.estado === 'pendiente' && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Devolución Pendiente</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Esta devolución está pendiente de revisión y aprobación.
                  </AlertDescription>
                </Alert>
              )}
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
              Esta acción no se puede deshacer. La devolución será eliminada permanentemente del sistema.
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
