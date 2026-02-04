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
import { CreditCard, Plus, Pencil, Trash2, Search, Eye, FileDown, DollarSign, CheckCircle2, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { mockPagos, Pago } from '../../shared/lib/mockData';
import { toast } from 'sonner';
import { useAuth } from '../../features/auth';
import { exportToExcelXLSX } from '../../shared/lib/exportUtils';

// Función para generar número de referencia único
const generateReferenceNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAY-${timestamp}-${random}`;
};

// Función para normalizar y buscar en fechas con múltiples formatos
const searchInDate = (dateStr: string, searchTerm: string): boolean => {
  const term = searchTerm.toLowerCase().trim();
  
  try {
    const date = new Date(dateStr + 'T00:00:00');
    
    // Formato DD/MM/YYYY
    const ddmmyyyy = date.toLocaleDateString('es-ES');
    if (ddmmyyyy.includes(term)) return true;
    
    // Formato DD-MM-YYYY
    const ddmmyyyyDash = ddmmyyyy.replace(/\//g, '-');
    if (ddmmyyyyDash.includes(term)) return true;
    
    // Formato YYYY-MM-DD (ISO)
    if (dateStr.includes(term)) return true;
    
    // Formato de mes en texto (ej: "diciembre", "dic")
    const monthLong = date.toLocaleDateString('es-ES', { month: 'long' });
    if (monthLong.includes(term)) return true;
    
    const monthShort = date.toLocaleDateString('es-ES', { month: 'short' });
    if (monthShort.includes(term)) return true;
    
    // Año
    const year = date.getFullYear().toString();
    if (year.includes(term)) return true;
    
    // Día
    const day = date.getDate().toString();
    if (day === term || day.padStart(2, '0') === term) return true;
    
    // Mes
    const month = (date.getMonth() + 1).toString();
    if (month === term || month.padStart(2, '0') === term) return true;
    
    return false;
  } catch {
    return false;
  }
};

export function PagosView() {
  const { user } = useAuth();
  const [pagos, setPagos] = useState<Pago[]>(mockPagos);
  const [filteredPagos, setFilteredPagos] = useState<Pago[]>(mockPagos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editingPago, setEditingPago] = useState<Pago | null>(null);
  const [viewingPago, setViewingPago] = useState<Pago | null>(null);
  const [pagoToDelete, setPagoToDelete] = useState<number | null>(null);
  const [pagoToChangeStatus, setPagoToChangeStatus] = useState<Pago | null>(null);
  const [newStatus, setNewStatus] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente');
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    monto: '',
    metodo: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia',
    fecha: '',
    referencia: '',
    estado: 'pendiente' as 'pendiente' | 'aprobado' | 'rechazado',
  });

  // Permisos basados en rol
  const isAdmin = user?.id_rol === 1;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = pagos.filter(pago => {
      // Remover # del término de búsqueda si existe para búsqueda por ID
      const cleanTerm = term.replace('#', '').trim();
      const idPago = pago.id_pago.toString();
      const monto = pago.monto.toString();
      
      // Búsqueda por ID (con o sin #)
      if (term.startsWith('#') && idPago.includes(cleanTerm)) {
        return true;
      }
      
      // Búsqueda en método de pago (efectivo, tarjeta, transferencia)
      const metodoTexto = pago.metodo === 'efectivo' ? 'efectivo' : 
                          pago.metodo === 'tarjeta' ? 'tarjeta' : 'transferencia';
      
      // Búsqueda en estado (pendiente, aprobado, rechazado)
      const estadoTexto = pago.estado === 'pendiente' ? 'pendiente' : 
                          pago.estado === 'aprobado' ? 'aprobado' : 'rechazado';
      
      return metodoTexto.includes(term) ||
             estadoTexto.includes(term) ||
             idPago.includes(cleanTerm) ||
             searchInDate(pago.fecha, term) ||
             pago.referencia?.toLowerCase().includes(term) ||
             monto.includes(term);
    });
    
    setFilteredPagos(filtered);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const handleExport = () => {
    // Preparar datos para exportación con nombres de columnas en español
    const dataToExport = pagos.map(pago => ({
      'ID': pago.id_pago,
      'Referencia': pago.referencia || 'N/A',
      'Monto': `$${pago.monto.toFixed(2)}`,
      'Método de Pago': pago.metodo === 'efectivo' ? 'Efectivo' : pago.metodo === 'tarjeta' ? 'Tarjeta' : 'Transferencia',
      'Fecha': new Date(pago.fecha + 'T00:00:00').toLocaleDateString('es-ES'),
      'Estado': pago.estado === 'aprobado' ? 'Aprobado' : pago.estado === 'rechazado' ? 'Rechazado' : 'Pendiente',
    }));

    const fechaActual = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    exportToExcelXLSX(dataToExport, `Pagos_${fechaActual}`, 'Pagos');
    
    toast.success('Archivo Excel descargado exitosamente', {
      style: { background: '#10b981', color: '#fff' }
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validar monto
    if (!formData.monto) {
      errors.monto = 'El monto es obligatorio';
    } else {
      const montoNum = parseFloat(formData.monto);
      if (isNaN(montoNum)) {
        errors.monto = 'El monto debe ser un número válido';
      } else if (montoNum <= 0) {
        errors.monto = 'El monto debe ser mayor a 0';
      } else if (montoNum > 1000000) {
        errors.monto = 'El monto excede el límite permitido ($1,000,000)';
      }
    }

    // Validar fecha
    if (!formData.fecha) {
      errors.fecha = 'La fecha es obligatoria';
    } else {
      const fechaPago = new Date(formData.fecha + 'T00:00:00');
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0);
      
      if (fechaPago > fechaActual) {
        errors.fecha = 'La fecha no puede ser futura';
      }
    }

    // Validar método de pago
    if (!formData.metodo) {
      errors.metodo = 'El método de pago es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    setEditingPago(null);
    setFormData({
      monto: '',
      metodo: 'efectivo',
      fecha: new Date().toISOString().split('T')[0],
      referencia: generateReferenceNumber(), // Generar automáticamente
      estado: 'pendiente',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEdit = (pago: Pago) => {
    setEditingPago(pago);
    setFormData({
      monto: pago.monto.toString(),
      metodo: pago.metodo,
      fecha: pago.fecha,
      referencia: pago.referencia || '',
      estado: pago.estado,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleView = (pago: Pago) => {
    setViewingPago(pago);
    setDetailsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setPagoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pagoToDelete) {
      setPagos(pagos.filter(p => p.id_pago !== pagoToDelete));
      setFilteredPagos(filteredPagos.filter(p => p.id_pago !== pagoToDelete));
      toast.success('Pago eliminado correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }
    setDeleteDialogOpen(false);
    setPagoToDelete(null);
  };

  const handleChangeStatus = (pago: Pago) => {
    setPagoToChangeStatus(pago);
    setNewStatus(pago.estado);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (pagoToChangeStatus) {
      const updated = pagos.map(p =>
        p.id_pago === pagoToChangeStatus.id_pago
          ? { ...p, estado: newStatus }
          : p
      );
      setPagos(updated);
      setFilteredPagos(updated);
      
      // Mostrar mensaje según el nuevo estado
      const statusMessages = {
        aprobado: 'Pago aprobado exitosamente',
        rechazado: 'Pago rechazado',
        pendiente: 'Pago marcado como pendiente',
      };
      
      toast.success(statusMessages[newStatus], {
        style: { background: '#10b981', color: '#fff' }
      });
    }
    setStatusDialogOpen(false);
    setPagoToChangeStatus(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (editingPago) {
      const updated = pagos.map(p =>
        p.id_pago === editingPago.id_pago
          ? {
              ...p,
              monto: parseFloat(formData.monto),
              metodo: formData.metodo,
              fecha: formData.fecha,
              referencia: formData.referencia,
              estado: formData.estado,
            }
          : p
      );
      setPagos(updated);
      setFilteredPagos(updated);
      toast.success('Pago actualizado correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    } else {
      const newPago: Pago = {
        id_pago: Math.max(...pagos.map(p => p.id_pago), 0) + 1,
        monto: parseFloat(formData.monto),
        metodo: formData.metodo,
        fecha: formData.fecha,
        referencia: formData.referencia,
        estado: formData.estado,
      };
      const updatedList = [...pagos, newPago];
      setPagos(updatedList);
      setFilteredPagos(updatedList);
      toast.success('Pago registrado exitosamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }

    setDialogOpen(false);
  };

  const getMetodoBadge = (metodo: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      efectivo: { bg: 'bg-green-600', text: 'Efectivo' },
      tarjeta: { bg: 'bg-blue-600', text: 'Tarjeta' },
      transferencia: { bg: 'bg-purple-600', text: 'Transferencia' },
    };
    
    const variant = variants[metodo] || { bg: 'bg-gray-600', text: metodo };
    
    return (
      <Badge className={variant.bg}>
        {variant.text}
      </Badge>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { bg: string; text: string; icon: any }> = {
      aprobado: { bg: 'bg-green-600', text: 'Aprobado', icon: CheckCircle2 },
      rechazado: { bg: 'bg-red-600', text: 'Rechazado', icon: XCircle },
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

  const totalPagos = filteredPagos.reduce((sum, pago) => sum + pago.monto, 0);
  const totalAprobados = filteredPagos.filter(p => p.estado === 'aprobado').reduce((sum, pago) => sum + pago.monto, 0);
  const totalPendientes = filteredPagos.filter(p => p.estado === 'pendiente').reduce((sum, pago) => sum + pago.monto, 0);

  // Paginación
  const totalPages = Math.ceil(filteredPagos.length / itemsPerPage);
  const currentPaginatedPagos = filteredPagos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Pagos
          </h1>
          <p className="text-muted-foreground">Gestiona los pagos realizados</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pago
            </Button>
          )}
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
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pagos</p>
                <p className="text-2xl font-bold text-[#D4AF37]">${totalPagos.toFixed(2)}</p>
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
                <p className="text-sm text-muted-foreground">Aprobados</p>
                <p className="text-2xl font-bold text-green-600">${totalAprobados.toFixed(2)}</p>
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
                <p className="text-2xl font-bold text-yellow-600">${totalPendientes.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Pagos</CardTitle>
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar pagos..."
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
                  <TableHead>Referencia</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPaginatedPagos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron pagos
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPaginatedPagos.map((pago) => (
                    <TableRow key={pago.id_pago}>
                      <TableCell>#{pago.id_pago}</TableCell>
                      <TableCell className="font-mono text-xs">{pago.referencia || '-'}</TableCell>
                      <TableCell className="font-medium">${pago.monto.toFixed(2)}</TableCell>
                      <TableCell>{getMetodoBadge(pago.metodo)}</TableCell>
                      <TableCell>{new Date(pago.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <button 
                          onClick={() => isAdmin && handleChangeStatus(pago)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          disabled={!isAdmin}
                        >
                          {getEstadoBadge(pago.estado)}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleView(pago)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => handleEdit(pago)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => handleDelete(pago.id_pago)}>
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
                Mostrando {filteredPagos.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPagos.length)} de {filteredPagos.length} registros
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPago ? 'Editar Pago' : 'Nuevo Pago'}</DialogTitle>
            <DialogDescription>
              {editingPago ? 'Actualiza la información del pago' : 'Registra un nuevo pago en el sistema'}
            </DialogDescription>
          </DialogHeader>
          
          {!editingPago && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Información Importante</AlertTitle>
              <AlertDescription className="text-blue-700">
                Esta aplicación es solo para gestión interna. Los pagos se registran únicamente desde nuestro establecimiento físico.
                Se ha generado automáticamente un número de referencia único.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="monto">
                  Monto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => {
                    setFormData({ ...formData, monto: e.target.value });
                    if (formErrors.monto) {
                      setFormErrors({ ...formErrors, monto: '' });
                    }
                  }}
                  className={formErrors.monto ? 'border-red-500' : ''}
                  placeholder="0.00"
                />
                {formErrors.monto && (
                  <p className="text-xs text-red-500">{formErrors.monto}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodo">
                  Método de Pago <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.metodo}
                  onValueChange={(value: any) => {
                    setFormData({ ...formData, metodo: value });
                    if (formErrors.metodo) {
                      setFormErrors({ ...formErrors, metodo: '' });
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.metodo ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.metodo && (
                  <p className="text-xs text-red-500">{formErrors.metodo}</p>
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
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="referencia">Número de Referencia</Label>
                <Input
                  id="referencia"
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  placeholder="PAY-XXXXXXXXXXXX-XXX"
                  className="font-mono"
                  readOnly={!editingPago}
                />
                <p className="text-xs text-muted-foreground">
                  {editingPago ? 'Puedes modificar el número de referencia' : 'Generado automáticamente por el sistema'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingPago ? 'Actualizar' : 'Registrar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalles */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Pago #{viewingPago?.id_pago}</DialogTitle>
            <DialogDescription>Información completa del pago registrado</DialogDescription>
          </DialogHeader>
          {viewingPago && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Pago</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">#{viewingPago.id_pago}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Número de Referencia</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-mono text-sm">{viewingPago.referencia}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Monto</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-2xl font-bold text-green-600">
                      ${viewingPago.monto.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Método de Pago</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {getMetodoBadge(viewingPago.metodo)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>
                      {new Date(viewingPago.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estado del Pago</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {getEstadoBadge(viewingPago.estado)}
                  </div>
                </div>
              </div>

              {viewingPago.estado === 'aprobado' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Pago Aprobado</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Este pago ha sido aprobado y procesado exitosamente.
                  </AlertDescription>
                </Alert>
              )}

              {viewingPago.estado === 'rechazado' && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Pago Rechazado</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Este pago ha sido rechazado. Por favor, contacta con el administrador para más información.
                  </AlertDescription>
                </Alert>
              )}

              {viewingPago.estado === 'pendiente' && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Pago Pendiente</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Este pago está pendiente de revisión y aprobación.
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
            <DialogTitle>Cambiar Estado del Pago</DialogTitle>
            <DialogDescription>
              Modifica el estado del pago #{pagoToChangeStatus?.id_pago}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <div className="p-3 bg-muted rounded-md">
                {pagoToChangeStatus && getEstadoBadge(pagoToChangeStatus.estado)}
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
                  <SelectItem value="aprobado">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Aprobado
                    </div>
                  </SelectItem>
                  <SelectItem value="rechazado">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Rechazado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'aprobado' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  El pago será marcado como aprobado y procesado.
                </AlertDescription>
              </Alert>
            )}

            {newStatus === 'rechazado' && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  El pago será rechazado. Esta acción puede requerir seguimiento.
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
              Esta acción no se puede deshacer. El pago será eliminado permanentemente del sistema.
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
