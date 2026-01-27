import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Receipt, Plus, Pencil, Trash2, Search, Eye, FileDown, ShoppingCart, TrendingUp, CheckCircle2, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { mockVentas, mockClientes, mockUsuarios, mockVentasDetalle, mockProductos, Venta, VentaProductoDetalle } from '../../shared/lib/mockData';
import { toast } from 'sonner';
import { useAuth } from '../../features/auth';
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

interface ProductoVenta {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export function VentasView() {
  const { user } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>(mockVentas);
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>(mockVentas);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);
  const [viewingVenta, setViewingVenta] = useState<any | null>(null);
  const [ventaToDelete, setVentaToDelete] = useState<number | null>(null);
  const [ventaToChangeStatus, setVentaToChangeStatus] = useState<Venta | null>(null);
  const [newStatus, setNewStatus] = useState<'pendiente' | 'pagada' | 'cancelada'>('pendiente');
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Formulario de venta
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_usuario: user?.id_usuario.toString() || '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente' as 'pendiente' | 'pagada' | 'cancelada',
  });

  // Productos en la venta
  const [productosVenta, setProductosVenta] = useState<ProductoVenta[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState('1');

  // Permisos basados en rol
  const isAdmin = user?.id_rol === 1;

  const getClienteName = (id?: number) => {
    if (!id) return 'Cliente General';
    const cliente = mockClientes.find(c => c.id_cliente === id);
    return cliente ? `${cliente.nombre} ${cliente.apellido || ''}` : 'N/A';
  };

  const getUsuarioName = (id: number) => {
    const usuario = mockUsuarios.find(u => u.id_usuario === id);
    return usuario?.nombre || 'N/A';
  };

  const getVentaDetalle = (id_venta: number) => {
    const detalles = mockVentasDetalle.filter(d => d.id_venta === id_venta);
    return detalles.map(d => {
      const producto = mockProductos.find(p => p.id_producto === d.id_producto);
      return { ...d, producto: producto?.nombre || 'N/A' };
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = ventas.filter(venta => {
      const cleanTerm = term.replace('#', '').trim();
      const idVenta = venta.id_venta.toString();
      const total = venta.total.toString();
      const clienteName = getClienteName(venta.id_cliente).toLowerCase();
      const usuarioName = getUsuarioName(venta.id_usuario).toLowerCase();
      const estadoTexto = venta.estado.toLowerCase();
      
      // Búsqueda por ID (con o sin #)
      if (term.startsWith('#') && idVenta.includes(cleanTerm)) {
        return true;
      }
      
      return idVenta.includes(cleanTerm) ||
             searchInDate(venta.fecha, term) ||
             clienteName.includes(term) ||
             usuarioName.includes(term) ||
             estadoTexto.includes(term) ||
             total.includes(term);
    });
    
    setFilteredVentas(filtered);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const dataToExport = ventas.map(venta => ({
      'ID': venta.id_venta,
      'Cliente': getClienteName(venta.id_cliente),
      'Vendedor': getUsuarioName(venta.id_usuario),
      'Fecha': new Date(venta.fecha + 'T00:00:00').toLocaleDateString('es-ES'),
      'Total': `$${venta.total.toFixed(2)}`,
      'Estado': venta.estado === 'pagada' ? 'Pagada' : venta.estado === 'cancelada' ? 'Cancelada' : 'Pendiente',
    }));

    const fechaActual = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    exportToExcelXLSX(dataToExport, `Ventas_${fechaActual}`, 'Ventas');
    
    toast.success('Archivo Excel descargado exitosamente', {
      style: { background: '#10b981', color: '#fff' }
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validar fecha
    if (!formData.fecha) {
      errors.fecha = 'La fecha es obligatoria';
    } else {
      const fechaVenta = new Date(formData.fecha + 'T00:00:00');
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0);
      
      if (fechaVenta > fechaActual) {
        errors.fecha = 'La fecha no puede ser futura';
      }
    }

    // Validar productos
    if (productosVenta.length === 0) {
      errors.productos = 'Debe agregar al menos un producto a la venta';
    }

    // Validar caracteres especiales en cliente (si está seleccionado)
    if (formData.id_cliente) {
      const idCliente = parseInt(formData.id_cliente);
      if (isNaN(idCliente)) {
        errors.id_cliente = 'ID de cliente inválido';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    setEditingVenta(null);
    setFormData({
      id_cliente: '',
      id_usuario: user?.id_usuario.toString() || '',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
    });
    setProductosVenta([]);
    setProductoSeleccionado('');
    setCantidadProducto('1');
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEdit = (venta: Venta) => {
    setEditingVenta(venta);
    setFormData({
      id_cliente: venta.id_cliente?.toString() || '',
      id_usuario: venta.id_usuario.toString(),
      fecha: venta.fecha,
      estado: venta.estado,
    });
    
    // Cargar los productos de la venta
    const detalles = getVentaDetalle(venta.id_venta);
    const productos = detalles.map(d => ({
      id_producto: mockProductos.find(p => p.nombre === d.producto)?.id_producto || 0,
      nombre: d.producto,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal: d.cantidad * d.precio_unitario,
    }));
    setProductosVenta(productos);
    setProductoSeleccionado('');
    setCantidadProducto('1');
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleView = (venta: Venta) => {
    const detalles = getVentaDetalle(venta.id_venta);
    setViewingVenta({ ...venta, detalles });
    setDetailsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setVentaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (ventaToDelete) {
      setVentas(ventas.filter(v => v.id_venta !== ventaToDelete));
      setFilteredVentas(filteredVentas.filter(v => v.id_venta !== ventaToDelete));
      toast.success('Venta eliminada correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }
    setDeleteDialogOpen(false);
    setVentaToDelete(null);
  };

  const handleChangeStatus = (venta: Venta) => {
    setVentaToChangeStatus(venta);
    setNewStatus(venta.estado);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (ventaToChangeStatus) {
      const updated = ventas.map(v =>
        v.id_venta === ventaToChangeStatus.id_venta
          ? { ...v, estado: newStatus }
          : v
      );
      setVentas(updated);
      setFilteredVentas(updated);
      
      const statusMessages = {
        pagada: 'Venta marcada como pagada',
        cancelada: 'Venta cancelada',
        pendiente: 'Venta marcada como pendiente',
      };
      
      toast.success(statusMessages[newStatus], {
        style: { background: '#10b981', color: '#fff' }
      });
    }
    setStatusDialogOpen(false);
    setVentaToChangeStatus(null);
  };

  const handleAgregarProducto = () => {
    if (!productoSeleccionado) {
      toast.error('Selecciona un producto', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    const cantidad = parseInt(cantidadProducto);
    if (isNaN(cantidad) || cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    const producto = mockProductos.find(p => p.id_producto === parseInt(productoSeleccionado));
    if (!producto) return;

    // Verificar si el producto ya está en la lista
    const existeProducto = productosVenta.find(p => p.id_producto === producto.id_producto);
    if (existeProducto) {
      toast.error('Este producto ya está agregado. Edita la cantidad desde la tabla.', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    const nuevoProducto: ProductoVenta = {
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      cantidad: cantidad,
      precio_unitario: producto.precio,
      subtotal: cantidad * producto.precio,
    };

    setProductosVenta([...productosVenta, nuevoProducto]);
    setProductoSeleccionado('');
    setCantidadProducto('1');
    
    // Limpiar error de productos si existía
    if (formErrors.productos) {
      setFormErrors({ ...formErrors, productos: '' });
    }
  };

  const handleEliminarProducto = (id_producto: number) => {
    setProductosVenta(productosVenta.filter(p => p.id_producto !== id_producto));
  };

  const handleCantidadChange = (id_producto: number, nuevaCantidad: string) => {
    const cantidad = parseInt(nuevaCantidad);
    if (isNaN(cantidad) || cantidad <= 0) return;

    setProductosVenta(productosVenta.map(p =>
      p.id_producto === id_producto
        ? { ...p, cantidad, subtotal: cantidad * p.precio_unitario }
        : p
    ));
  };

  const calcularTotal = (): number => {
    return productosVenta.reduce((sum, p) => sum + p.subtotal, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    const total = calcularTotal();

    if (editingVenta) {
      const updated = ventas.map(v =>
        v.id_venta === editingVenta.id_venta
          ? {
              ...v,
              id_cliente: formData.id_cliente ? parseInt(formData.id_cliente) : undefined,
              id_usuario: parseInt(formData.id_usuario),
              fecha: formData.fecha,
              total: total,
              estado: formData.estado,
            }
          : v
      );
      setVentas(updated);
      setFilteredVentas(updated);
      toast.success('Venta actualizada correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    } else {
      const newVenta: Venta = {
        id_venta: Math.max(...ventas.map(v => v.id_venta), 0) + 1,
        id_cliente: formData.id_cliente ? parseInt(formData.id_cliente) : undefined,
        id_usuario: parseInt(formData.id_usuario),
        fecha: formData.fecha,
        total: total,
        estado: formData.estado,
      };
      const updatedList = [...ventas, newVenta];
      setVentas(updatedList);
      setFilteredVentas(updatedList);
      toast.success('Venta registrada exitosamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }

    setDialogOpen(false);
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { bg: string; text: string; icon: any }> = {
      pagada: { bg: 'bg-green-600', text: 'Pagada', icon: CheckCircle2 },
      cancelada: { bg: 'bg-red-600', text: 'Cancelada', icon: XCircle },
      pendiente: { bg: 'bg-yellow-600', text: 'Pendiente', icon: Clock },
    };
    
    const variant = variants[estado] || { bg: 'bg-gray-600', text: estado, icon: AlertCircle };
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.bg}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.text}
      </Badge>
    );
  };

  const totalVentas = filteredVentas.reduce((sum, venta) => sum + venta.total, 0);
  const ventasPagadas = filteredVentas.filter(v => v.estado === 'pagada').length;
  const ventasPendientes = filteredVentas.filter(v => v.estado === 'pendiente').length;

  // Paginación
  const totalPages = Math.ceil(filteredVentas.length / itemsPerPage);
  const currentPaginatedVentas = filteredVentas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            Ventas
          </h1>
          <p className="text-muted-foreground">Gestiona las ventas realizadas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate} className="bg-[#D4AF37] hover:bg-[#B8941F]">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </Button>
          <Button onClick={handleExport} variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-[#D4AF37]/10 to-[#B8941F]/10 border-[#D4AF37]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#D4AF37] rounded-lg">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-[#D4AF37]">${totalVentas.toFixed(2)}</p>
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
                <p className="text-sm text-muted-foreground">Ventas Pagadas</p>
                <p className="text-2xl font-bold text-green-600">{ventasPagadas}</p>
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
                <p className="text-sm text-muted-foreground">Ventas Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{ventasPendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Ventas</CardTitle>
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar ventas..."
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
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPaginatedVentas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron ventas
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPaginatedVentas.map((venta) => (
                    <TableRow key={venta.id_venta}>
                      <TableCell>#{venta.id_venta}</TableCell>
                      <TableCell>{getClienteName(venta.id_cliente)}</TableCell>
                      <TableCell>{getUsuarioName(venta.id_usuario)}</TableCell>
                      <TableCell>{new Date(venta.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="font-medium">${venta.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <button 
                          onClick={() => isAdmin && handleChangeStatus(venta)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          disabled={!isAdmin}
                        >
                          {getEstadoBadge(venta.estado)}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleView(venta)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => handleEdit(venta)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => handleDelete(venta.id_venta)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
                <span className="text-sm font-medium px-2 py-1 bg-[#D4AF37] text-white rounded">
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
                Mostrando {filteredVentas.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredVentas.length)} de {filteredVentas.length} registros
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVenta ? 'Editar Venta' : 'Nueva Venta'}</DialogTitle>
            <DialogDescription>
              {editingVenta ? 'Actualiza la información de la venta' : 'Registra una nueva venta en el sistema'}
            </DialogDescription>
          </DialogHeader>
          
          {!editingVenta && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Información Importante</AlertTitle>
              <AlertDescription className="text-blue-700">
                Esta aplicación es solo para gestión interna. Las ventas se registran únicamente desde nuestro establecimiento físico.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_cliente">Cliente</Label>
                  <Select
                    value={formData.id_cliente || '0'}
                    onValueChange={(value) => setFormData({ ...formData, id_cliente: value === '0' ? '' : value })}
                  >
                    <SelectTrigger className={formErrors.id_cliente ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Cliente General" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Cliente General</SelectItem>
                      {mockClientes.map((cliente) => (
                        <SelectItem key={cliente.id_cliente} value={cliente.id_cliente.toString()}>
                          {cliente.nombre} {cliente.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.id_cliente && (
                    <p className="text-xs text-red-500">{formErrors.id_cliente}</p>
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
                  <Label htmlFor="id_usuario">
                    Vendedor <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.id_usuario}
                    onValueChange={(value) => setFormData({ ...formData, id_usuario: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsuarios.map((usuario) => (
                        <SelectItem key={usuario.id_usuario} value={usuario.id_usuario.toString()}>
                          {usuario.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagada">Pagada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Agregar Productos */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold">Agregar Productos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="producto">Producto</Label>
                    <Select
                      value={productoSeleccionado}
                      onValueChange={setProductoSeleccionado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProductos.map((producto) => (
                          <SelectItem key={producto.id_producto} value={producto.id_producto.toString()}>
                            {producto.nombre} - ${producto.precio.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cantidad"
                        type="number"
                        min="1"
                        value={cantidadProducto}
                        onChange={(e) => setCantidadProducto(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAgregarProducto}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {formErrors.productos && (
                  <p className="text-xs text-red-500">{formErrors.productos}</p>
                )}
              </div>

              {/* Lista de Productos */}
              {productosVenta.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Productos en la Venta</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Precio Unit.</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productosVenta.map((producto) => (
                          <TableRow key={producto.id_producto}>
                            <TableCell>{producto.nombre}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={producto.cantidad}
                                onChange={(e) => handleCantidadChange(producto.id_producto, e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>${producto.precio_unitario.toFixed(2)}</TableCell>
                            <TableCell className="font-medium">${producto.subtotal.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEliminarProducto(producto.id_producto)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Total */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between items-center py-2 border-t-2 border-[#D4AF37]">
                        <span className="font-semibold text-lg">Total:</span>
                        <span className="font-bold text-2xl text-[#D4AF37]">
                          ${calcularTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8941F]">
                {editingVenta ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalles */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta #{viewingVenta?.id_venta}</DialogTitle>
            <DialogDescription>Información completa de la venta</DialogDescription>
          </DialogHeader>
          {viewingVenta && (
            <div className="space-y-6 py-4">
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Venta</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">#{viewingVenta.id_venta}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{getClienteName(viewingVenta.id_cliente)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Vendedor</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{getUsuarioName(viewingVenta.id_usuario)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>
                      {new Date(viewingVenta.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {getEstadoBadge(viewingVenta.estado)}
                  </div>
                </div>
              </div>

              {/* Detalles de Productos */}
              <div className="space-y-3">
                <h3 className="font-semibold">Productos</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingVenta.detalles?.map((detalle: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{detalle.producto}</TableCell>
                          <TableCell>{detalle.cantidad}</TableCell>
                          <TableCell>${detalle.precio_unitario.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between items-center py-2 border-t-2 border-[#D4AF37]">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-bold text-2xl text-[#D4AF37]">
                      ${viewingVenta.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alertas según estado */}
              {viewingVenta.estado === 'pagada' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Venta Pagada</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Esta venta ha sido pagada exitosamente.
                  </AlertDescription>
                </Alert>
              )}

              {viewingVenta.estado === 'cancelada' && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Venta Cancelada</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Esta venta ha sido cancelada.
                  </AlertDescription>
                </Alert>
              )}

              {viewingVenta.estado === 'pendiente' && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Venta Pendiente</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Esta venta está pendiente de pago.
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

      {/* Dialog Cambiar Estado */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de la Venta</DialogTitle>
            <DialogDescription>
              Modifica el estado de la venta #{ventaToChangeStatus?.id_venta}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <div className="p-3 bg-muted rounded-md">
                {ventaToChangeStatus && getEstadoBadge(ventaToChangeStatus.estado)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newStatus">
                Nuevo Estado <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newStatus}
                onValueChange={(value: any) => setNewStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      Pendiente
                    </div>
                  </SelectItem>
                  <SelectItem value="pagada">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Pagada
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelada">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Cancelada
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'pagada' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  La venta será marcada como pagada.
                </AlertDescription>
              </Alert>
            )}

            {newStatus === 'cancelada' && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  La venta será cancelada. Esta acción puede requerir seguimiento.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={confirmStatusChange}>
              Confirmar Cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La venta será eliminada permanentemente del sistema.
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
