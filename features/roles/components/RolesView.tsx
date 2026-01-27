import { useState, useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, Pencil, Trash2, Shield, Eye, Search, Power } from 'lucide-react';
import { mockRoles, Role, Permiso } from '../../../shared/lib/mockData';
import { toast } from 'sonner';
import { SearchBar } from '../../../components/common/SearchBar';
import { Pagination } from '../../../components/common/Pagination';

const MODULOS = [
  'Roles',
  'Usuarios',
  'Productos',
  'Proveedores',
  'Compras',
  'DetalleCompras',
  'Devoluciones',
  'DevolucionesProveedor',
  'Consignaciones',
  'Servicios',
  'Citas',
  'Empleados',
  'Clientes',
  'Pagos',
  'Ventas',
  'VentasDetalle',
];

export function RolesView() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'activo' as 'activo' | 'inactivo',
  });
  const [permissions, setPermissions] = useState<Permiso[]>([]);

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({ nombre: '', descripcion: '', estado: 'activo' });
    // Initialize permissions with all modules set to false
    setPermissions(MODULOS.map(modulo => ({
      modulo,
      crear: false,
      leer: false,
      actualizar: false,
      eliminar: false,
    })));
    setDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      nombre: role.nombre,
      descripcion: role.descripcion || '',
      estado: role.nombre.toLowerCase() === 'admin' ? 'activo' : role.estado || 'activo',
    });
    // Ensure all modules are present in permissions
    const rolePermissions = role.permisos || [];
    const fullPermissions = MODULOS.map(modulo => {
      const existing = rolePermissions.find(p => p.modulo === modulo);
      return existing || {
        modulo,
        crear: false,
        leer: false,
        actualizar: false,
        eliminar: false,
      };
    });
    setPermissions(fullPermissions);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setRoleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      setRoles(roles.filter(r => r.id_rol !== roleToDelete));
      toast.success('Rol eliminado correctamente');
    }
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleToggleEstado = (role: Role) => {
    // No permitir cambiar estado del rol Admin
    if (role.nombre.toLowerCase() === 'admin') {
      toast.error('No se puede modificar el estado del rol Admin', {
        description: 'El rol Admin siempre debe permanecer activo para mantener la integridad del sistema',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    const newEstado = role.estado === 'activo' ? 'inactivo' : 'activo';
    setRoles(roles.map(r =>
      r.id_rol === role.id_rol
        ? { ...r, estado: newEstado }
        : r
    ));
    toast.success(
      `Rol ${newEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`,
      {
        description: `El rol "${role.nombre}" ahora está ${newEstado}`,
        style: { background: '#10b981', color: '#fff' }
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que el nombre no comience con caracteres especiales
    const nombreStartsWithSpecialChar = /^[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(formData.nombre.trim());
    
    if (nombreStartsWithSpecialChar) {
      toast.error('Error de validación', {
        description: 'El nombre del rol no puede comenzar con caracteres especiales, números o espacios. Debe comenzar con una letra.',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    // Validar que el nombre no esté vacío
    if (!formData.nombre.trim()) {
      toast.error('Error de validación', {
        description: 'El nombre del rol es obligatorio',
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }

    if (editingRole) {
      setRoles(roles.map(r =>
        r.id_rol === editingRole.id_rol
          ? { ...r, ...formData, permisos: permissions }
          : r
      ));
      toast.success('Rol actualizado correctamente');
    } else {
      const newRole: Role = {
        id_rol: Math.max(...roles.map(r => r.id_rol)) + 1,
        ...formData,
        permisos: permissions,
      };
      setRoles([...roles, newRole]);
      toast.success('Rol creado correctamente');
    }

    setDialogOpen(false);
    setFormData({ nombre: '', descripcion: '', estado: 'activo' });
    setPermissions([]);
  };

  const updatePermission = (modulo: string, tipo: 'crear' | 'leer' | 'actualizar' | 'eliminar', value: boolean) => {
    setPermissions(permissions.map(p =>
      p.modulo === modulo ? { ...p, [tipo]: value } : p
    ));
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const lowerSearch = searchTerm.toLowerCase();
      const id = role.id_rol.toString();
      const nombre = role.nombre.toLowerCase();
      const descripcion = (role.descripcion || '').toLowerCase();
      const estado = (role.nombre.toLowerCase() === 'admin' ? 'sistema' : (role.estado || 'activo')).toLowerCase();
      
      return (
        id.includes(lowerSearch) ||
        nombre.includes(lowerSearch) ||
        descripcion.includes(lowerSearch) ||
        estado.includes(lowerSearch)
      );
    });
  }, [roles, searchTerm]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const currentRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (role: Role) => {
    setViewingRole(role);
    setDetailsDialogOpen(true);
  };

  // Función para verificar si un rol puede ser eliminado (Admin no se puede eliminar)
  const canDeleteRole = (roleName: string) => {
    return roleName.toLowerCase() !== 'admin';
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Roles
          </h1>
          <p className="text-muted-foreground">
            Gestiona los roles y permisos del sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barra de búsqueda */}
          <div className="mb-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por ID, nombre, descripción o estado..."
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No se encontraron roles
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRoles.map((role) => (
                    <TableRow key={role.id_rol}>
                      <TableCell>{role.id_rol}</TableCell>
                      <TableCell className="font-medium">{role.nombre}</TableCell>
                      <TableCell>{role.descripcion || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={role.estado === 'activo' ? 'default' : 'secondary'}
                          className={role.estado === 'activo' ? 'bg-green-600' : 'bg-gray-600'}
                        >
                          {role.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(role)}
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleEstado(role)}
                            className={role.estado === 'activo' ? 'hover:bg-red-50 hover:border-red-200' : 'hover:bg-green-50 hover:border-green-200'}
                            title={role.estado === 'activo' ? 'Desactivar rol' : 'Activar rol'}
                          >
                            <Power className={`w-4 h-4 ${role.estado === 'activo' ? 'text-red-600' : 'text-green-600'}`} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(role)}
                            title="Editar rol"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {canDeleteRole(role.nombre) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(role.id_rol)}
                              title="Eliminar rol"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              title="El rol Admin no se puede eliminar"
                            >
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
          
          {/* Paginación */}
          {filteredRoles.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredRoles.length}
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Actualiza la información del rol y sus permisos'
                : 'Crea un nuevo rol y asigna sus permisos'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                  placeholder="Ej: Administrador, Vendedor, Gerente..."
                />
                <p className="text-xs text-muted-foreground">Debe comenzar con una letra</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  rows={2}
                  placeholder="Describe las responsabilidades y permisos de este rol..."
                />
                <p className="text-xs text-muted-foreground">Opcional</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => setFormData({ ...formData, estado: value as 'activo' | 'inactivo' })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Los roles inactivos no podrán ser asignados a usuarios
                </p>
              </div>
              <div className="space-y-2">
                <Label>Permisos por Módulo</Label>
                <div className="rounded-md border overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Módulo</TableHead>
                        <TableHead className="text-center w-[100px]">Crear</TableHead>
                        <TableHead className="text-center w-[100px]">Leer</TableHead>
                        <TableHead className="text-center w-[100px]">Actualizar</TableHead>
                        <TableHead className="text-center w-[100px]">Eliminar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permiso) => (
                        <TableRow key={permiso.modulo}>
                          <TableCell>{permiso.modulo}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={permiso.crear}
                                onCheckedChange={(checked) =>
                                  updatePermission(permiso.modulo, 'crear', checked as boolean)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={permiso.leer}
                                onCheckedChange={(checked) =>
                                  updatePermission(permiso.modulo, 'leer', checked as boolean)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={permiso.actualizar}
                                onCheckedChange={(checked) =>
                                  updatePermission(permiso.modulo, 'actualizar', checked as boolean)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={permiso.eliminar}
                                onCheckedChange={(checked) =>
                                  updatePermission(permiso.modulo, 'eliminar', checked as boolean)
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-4 p-3 bg-amber-50 rounded-md border border-amber-200">
              <p><span className="text-red-500">*</span> Campos obligatorios</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingRole ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El rol será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalles del Rol
            </DialogTitle>
            <DialogDescription>
              Información detallada del rol seleccionado
            </DialogDescription>
          </DialogHeader>
          {viewingRole && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={viewingRole.nombre}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={viewingRole.descripcion || ''}
                  readOnly
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Permisos por Módulo</Label>
                <div className="rounded-md border overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Módulo</TableHead>
                        <TableHead className="text-center w-[100px]">Crear</TableHead>
                        <TableHead className="text-center w-[100px]">Leer</TableHead>
                        <TableHead className="text-center w-[100px]">Actualizar</TableHead>
                        <TableHead className="text-center w-[100px]">Eliminar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingRole.permisos.map((permiso) => (
                        <TableRow key={permiso.modulo}>
                          <TableCell>{permiso.modulo}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={permiso.crear}
                                readOnly
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={permiso.leer}
                                readOnly
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={permiso.actualizar}
                                readOnly
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={permiso.eliminar}
                                readOnly
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
