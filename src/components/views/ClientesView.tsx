import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, UserCircle, CheckCircle, XCircle, Eye, FileDown, Search, AlertCircle, Users, UserCheck, UserX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { mockClientes, Cliente } from '../../lib/mockData';
import { toast } from 'sonner';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';
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

// Validación de caracteres especiales permitidos
const validateName = (value: string): boolean => {
  // Permitir letras (incluyendo acentos), espacios, guiones y apóstrofes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  return nameRegex.test(value) || value === '';
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Permitir números, espacios, guiones, paréntesis y el símbolo +
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) || phone === '';
};

const validateAddress = (address: string): boolean => {
  // Permitir letras, números, espacios y caracteres especiales comunes en direcciones
  const addressRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#°'-]+$/;
  return addressRegex.test(address) || address === '';
};

export function ClientesView() {
  const [clientes, setClientes] = useState<Cliente[]>(
    mockClientes.map(c => ({ ...c, estado: c.estado || 'activo' }))
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    email_confirmacion: '',
    telefono: '',
    direccion: '',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  // Filtrar clientes por término de búsqueda - TODOS LOS CAMPOS incluyendo ID y fecha
  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientes;

    const lowerSearch = searchTerm.toLowerCase();
    const cleanSearch = lowerSearch.replace('#', '').trim();
    
    return clientes.filter((cliente) => {
      const idCliente = cliente.id_cliente.toString();
      const fullName = `${cliente.nombre} ${cliente.apellido || ''}`.toLowerCase();
      const email = (cliente.email || '').toLowerCase();
      const telefono = (cliente.telefono || '').toLowerCase();
      const direccion = (cliente.direccion || '').toLowerCase();
      const estado = (cliente.estado || 'activo').toLowerCase();
      
      // Búsqueda por ID (con o sin #)
      if (lowerSearch.startsWith('#') && idCliente.includes(cleanSearch)) {
        return true;
      }
      
      return (
        idCliente.includes(cleanSearch) ||
        fullName.includes(lowerSearch) ||
        cliente.nombre.toLowerCase().includes(lowerSearch) ||
        (cliente.apellido || '').toLowerCase().includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        telefono.includes(lowerSearch) ||
        direccion.includes(lowerSearch) ||
        searchInDate(cliente.fecha_registro || '', lowerSearch) ||
        estado.includes(lowerSearch)
      );
    });
  }, [clientes, searchTerm]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (!validateName(formData.nombre)) {
      errors.nombre = 'El nombre solo puede contener letras, espacios, guiones y apóstrofes';
    }

    // Validar apellido
    if (formData.apellido && !validateName(formData.apellido)) {
      errors.apellido = 'El apellido solo puede contener letras, espacios, guiones y apóstrofes';
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'El formato del email no es válido';
    }

    // Validar confirmación de email (solo al crear)
    if (!editingCliente) {
      if (!formData.email_confirmacion.trim()) {
        errors.email_confirmacion = 'Debes confirmar el email';
      } else if (formData.email !== formData.email_confirmacion) {
        errors.email_confirmacion = 'Los emails no coinciden';
      }
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (!validatePhone(formData.telefono)) {
      errors.telefono = 'El teléfono solo puede contener números, espacios, guiones, paréntesis y el símbolo +';
    } else if (formData.telefono.replace(/\D/g, '').length < 7) {
      errors.telefono = 'El teléfono debe tener al menos 7 dígitos';
    }

    // Validar dirección
    if (formData.direccion && !validateAddress(formData.direccion)) {
      errors.direccion = 'La dirección contiene caracteres no permitidos';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    setEditingCliente(null);
    setFormData({ 
      nombre: '', 
      apellido: '', 
      email: '', 
      email_confirmacion: '',
      telefono: '', 
      direccion: '', 
      estado: 'activo' 
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      apellido: cliente.apellido || '',
      email: cliente.email || '',
      email_confirmacion: '', // No necesario al editar
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      estado: cliente.estado as 'activo' | 'inactivo',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setClienteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clienteToDelete) {
      setClientes(clientes.filter(c => c.id_cliente !== clienteToDelete));
      toast.success('Cliente eliminado correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    }
    setDeleteDialogOpen(false);
    setClienteToDelete(null);
  };

  const handleStatusChange = (id: number, newStatus: 'activo' | 'inactivo') => {
    setClientes(clientes.map(c =>
      c.id_cliente === id
        ? { ...c, estado: newStatus }
        : c
    ));
    
    const statusMessages = {
      activo: 'Cliente activado exitosamente',
      inactivo: 'Cliente desactivado',
    };
    
    toast.success(statusMessages[newStatus], {
      style: { background: '#10b981', color: '#fff' }
    });
  };

  const handleExport = () => {
    const dataToExport = clientes.map(cliente => ({
      'ID': cliente.id_cliente,
      'Nombre': cliente.nombre,
      'Apellido': cliente.apellido || '',
      'Email': cliente.email || '',
      'Teléfono': cliente.telefono || '',
      'Dirección': cliente.direccion || '',
      'Estado': cliente.estado === 'activo' ? 'Activo' : 'Inactivo',
      'Fecha Registro': cliente.fecha_registro ? new Date(cliente.fecha_registro + 'T00:00:00').toLocaleDateString('es-ES') : '',
    }));

    const fechaActual = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    exportToExcelXLSX(dataToExport, `Clientes_${fechaActual}`, 'Clientes');
    
    toast.success('Archivo Excel descargado exitosamente', {
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

    if (editingCliente) {
      setClientes(clientes.map(c =>
        c.id_cliente === editingCliente.id_cliente
          ? { 
              ...c, 
              nombre: formData.nombre,
              apellido: formData.apellido,
              email: formData.email,
              telefono: formData.telefono,
              direccion: formData.direccion,
              estado: formData.estado,
            }
          : c
      ));
      toast.success('Cliente actualizado correctamente', {
        style: { background: '#10b981', color: '#fff' }
      });
    } else {
      // ID automático: siguiente número
      const nextId = Math.max(...clientes.map(c => c.id_cliente), 0) + 1;
      
      const newCliente: Cliente = {
        id_cliente: nextId,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        estado: formData.estado,
        fecha_registro: new Date().toISOString().split('T')[0],
      };
      
      // Agregar al inicio del listado
      setClientes([newCliente, ...clientes]);
      
      toast.success('Cliente creado correctamente', {
        description: `ID asignado: #${nextId}`,
        style: { background: '#10b981', color: '#fff' }
      });
    }

    setDialogOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClientes.slice(indexOfFirstItem, indexOfLastItem);

  // Estadísticas
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c.estado === 'activo').length;
  const clientesInactivos = clientes.filter(c => c.estado === 'inactivo').length;

  // Paginación
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <UserCircle className="w-6 h-6" />
            Clientes
          </h1>
          <p className="text-muted-foreground">Gestiona la base de clientes de la barbería</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
          <Button onClick={handleExport} variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold text-blue-600">{totalClientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-600">{clientesActivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-lg">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">{clientesInactivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por ID, nombre, email, teléfono, fecha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((cliente) => (
                    <TableRow key={cliente.id_cliente}>
                      <TableCell className="font-medium">#{cliente.id_cliente}</TableCell>
                      <TableCell>{cliente.nombre} {cliente.apellido}</TableCell>
                      <TableCell>{cliente.email || '-'}</TableCell>
                      <TableCell>{cliente.telefono || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{cliente.direccion || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={cliente.estado || 'activo'}
                          onValueChange={(value: any) => handleStatusChange(cliente.id_cliente, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue>
                              {(cliente.estado || 'activo') === 'activo' ? (
                                <Badge className="bg-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Activo
                                </Badge>
                              ) : (
                                <Badge className="bg-red-600">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Inactivo
                                </Badge>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="activo">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Activo</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="inactivo">
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span>Inactivo</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {cliente.fecha_registro ? new Date(cliente.fecha_registro + 'T00:00:00').toLocaleDateString('es-ES') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { 
                              setViewingCliente(cliente); 
                              setDetailsDialogOpen(true); 
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(cliente.id_cliente)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Paginador Personalizado */}
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
                    Mostrando {filteredClientes.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredClientes.length)} de {filteredClientes.length} registros
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            <DialogDescription>
              {editingCliente ? 'Actualiza la información del cliente' : 'Agrega un nuevo cliente al sistema'}
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Información</AlertTitle>
            <AlertDescription className="text-blue-700">
              {editingCliente 
                ? 'Actualiza los datos del cliente. El ID no puede ser modificado.'
                : 'El ID del cliente se asignará automáticamente y el nuevo cliente aparecerá al inicio del listado.'}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {editingCliente && (
                <div className="space-y-2 md:col-span-2">
                  <Label>ID del Cliente</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">#{editingCliente.id_cliente}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="nombre" 
                  value={formData.nombre} 
                  onChange={(e) => {
                    setFormData({ ...formData, nombre: e.target.value });
                    if (formErrors.nombre) {
                      setFormErrors({ ...formErrors, nombre: '' });
                    }
                  }}
                  className={formErrors.nombre ? 'border-red-500' : ''}
                  placeholder="Juan"
                />
                {formErrors.nombre && (
                  <p className="text-xs text-red-500">{formErrors.nombre}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Solo letras, espacios, guiones y apóstrofes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input 
                  id="apellido" 
                  value={formData.apellido} 
                  onChange={(e) => {
                    setFormData({ ...formData, apellido: e.target.value });
                    if (formErrors.apellido) {
                      setFormErrors({ ...formErrors, apellido: '' });
                    }
                  }}
                  className={formErrors.apellido ? 'border-red-500' : ''}
                  placeholder="Pérez García"
                />
                {formErrors.apellido && (
                  <p className="text-xs text-red-500">{formErrors.apellido}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) {
                      setFormErrors({ ...formErrors, email: '' });
                    }
                  }}
                  className={formErrors.email ? 'border-red-500' : ''}
                  placeholder="juan.perez@ejemplo.com"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>

              {!editingCliente && (
                <div className="space-y-2">
                  <Label htmlFor="email_confirmacion">
                    Confirmar Email <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="email_confirmacion" 
                    type="email" 
                    value={formData.email_confirmacion} 
                    onChange={(e) => {
                      setFormData({ ...formData, email_confirmacion: e.target.value });
                      if (formErrors.email_confirmacion) {
                        setFormErrors({ ...formErrors, email_confirmacion: '' });
                      }
                    }}
                    className={formErrors.email_confirmacion ? 'border-red-500' : ''}
                    placeholder="juan.perez@ejemplo.com"
                  />
                  {formErrors.email_confirmacion && (
                    <p className="text-xs text-red-500">{formErrors.email_confirmacion}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="telefono" 
                  type="tel"
                  value={formData.telefono} 
                  onChange={(e) => {
                    setFormData({ ...formData, telefono: e.target.value });
                    if (formErrors.telefono) {
                      setFormErrors({ ...formErrors, telefono: '' });
                    }
                  }}
                  className={formErrors.telefono ? 'border-red-500' : ''}
                  placeholder="+57 300 123 4567"
                />
                {formErrors.telefono && (
                  <p className="text-xs text-red-500">{formErrors.telefono}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Números, espacios, +, -, ()
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input 
                  id="direccion" 
                  value={formData.direccion} 
                  onChange={(e) => {
                    setFormData({ ...formData, direccion: e.target.value });
                    if (formErrors.direccion) {
                      setFormErrors({ ...formErrors, direccion: '' });
                    }
                  }}
                  className={formErrors.direccion ? 'border-red-500' : ''}
                  placeholder="Calle 123 #45-67, Barrio Centro"
                />
                {formErrors.direccion && (
                  <p className="text-xs text-red-500">{formErrors.direccion}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Letras, números, espacios, . , # ° ' -
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => setFormData({ ...formData, estado: value as 'activo' | 'inactivo' })}
                >
                  <SelectTrigger>
                    <SelectValue>{formData.estado === 'activo' ? 'Activo' : 'Inactivo'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingCliente ? 'Actualizar' : 'Crear Cliente'}
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
              <UserCircle className="w-5 h-5 text-blue-600" />
              Detalles del Cliente
            </DialogTitle>
            <DialogDescription>Información completa del cliente</DialogDescription>
          </DialogHeader>
          {viewingCliente && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Cliente</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">#{viewingCliente.id_cliente}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {(viewingCliente.estado || 'activo') === 'activo' ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">
                      {viewingCliente.nombre} {viewingCliente.apellido}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>{viewingCliente.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>{viewingCliente.telefono || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Registro</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>
                      {viewingCliente.fecha_registro 
                        ? new Date(viewingCliente.fecha_registro + 'T00:00:00').toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Dirección</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>{viewingCliente.direccion || 'N/A'}</p>
                  </div>
                </div>
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
              Esta acción no se puede deshacer. El cliente será eliminado permanentemente del sistema.
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
