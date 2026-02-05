import { useState, useEffect, useMemo } from 'react';
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
    id_servicios: [] as string[],
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
        id_servicios: [],
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
      id_servicios: [],
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
      id_servicio: (cita as any).id_servicio ? (cita as any).id_servicio.toString() : '',
      id_servicios: (cita as any).id_servicios ? (cita as any).id_servicios.map((s: number) => s.toString()) : ((cita as any).id_servicio ? [(cita as any).id_servicio.toString()] : []),
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
    // Validar disponibilidad antes de crear o actualizar
    // Si es cliente, debe seleccionar un barbero
    if (isCliente && (!formData.id_empleado || formData.id_empleado === '0')) {
      toast.error('Selecciona un barbero antes de reservar');
      return;
    }
    const empleadoId = formData.id_empleado ? parseInt(formData.id_empleado) : undefined;
    if (hasConflict(empleadoId, formData.fecha, formData.hora, editingCita?.id_cita)) {
      toast.error('El barbero no está disponible en la fecha y hora seleccionadas');
      return;
    }

    if (editingCita) {
      const index = dataStore.citas.findIndex(c => c.id_cita === editingCita.id_cita);
      if (index !== -1) {
        dataStore.citas[index] = {
          ...dataStore.citas[index],
          id_cliente: parseInt(formData.id_cliente),
            id_servicio: (formData.id_servicios || []).length ? parseInt((formData.id_servicios || [])[0]) : (formData.id_servicio ? parseInt(formData.id_servicio) : undefined),
            id_servicios: (formData.id_servicios || []).length ? (formData.id_servicios || []).map(s => parseInt(s)) : (formData.id_servicio ? [parseInt(formData.id_servicio)] : []),
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
        id_servicio: (formData.id_servicios || []).length ? parseInt((formData.id_servicios || [])[0]) : (formData.id_servicio ? parseInt(formData.id_servicio) : undefined),
        id_servicios: (formData.id_servicios || []).length ? (formData.id_servicios || []).map(s => parseInt(s)) : (formData.id_servicio ? [parseInt(formData.id_servicio)] : []),
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

  const formatServicios = (cita: any) => {
    const ids: number[] = cita.id_servicios?.length ? cita.id_servicios : (cita.id_servicio ? [cita.id_servicio] : []);
    if (ids.length === 0) return 'N/A';
    return ids.map(id => mockServicios.find(s => s.id_servicio === id)?.nombre || 'N/A').join(', ');
  };

  const computeServiciosPrice = (cita: any) => {
    const ids: number[] = cita.id_servicios?.length ? cita.id_servicios : (cita.id_servicio ? [cita.id_servicio] : []);
    return ids.reduce((sum, id) => sum + (mockServicios.find(s => s.id_servicio === id)?.precio || 0), 0);
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

  // Calendario
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [calendarEmpleadoFilter, setCalendarEmpleadoFilter] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('calendarEmpleadoFilter');
      return saved || 'all';
    } catch (e) {
      return 'all';
    }
  });

  // Si el usuario es cliente, por defecto mostrar el barbero con más citas previas del cliente
  useEffect(() => {
    if (!isCliente) return;
    const clienteRecord = dataStore.clientes.find(c => c.email === user?.email);
    if (!clienteRecord) return;
    const counts: Record<number, number> = {};
    dataStore.citas.forEach(c => {
      if (c.id_cliente === clienteRecord.id_cliente && c.id_empleado) {
        counts[c.id_empleado] = (counts[c.id_empleado] || 0) + 1;
      }
    });
    const entries = Object.entries(counts);
    if (entries.length === 0) return;
    entries.sort((a, b) => b[1] - a[1]);
    const topEmpleado = entries[0][0];
    // Only set default if user hasn't stored a preference
    try {
      const saved = localStorage.getItem('calendarEmpleadoFilter');
      if (!saved) setCalendarEmpleadoFilter(topEmpleado.toString());
    } catch (e) {
      setCalendarEmpleadoFilter(topEmpleado.toString());
    }
  }, [isCliente, user?.email]);

  // Check for a prefill request from ClienteDashboard (stored in localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('prefillReserva');
      if (!raw) return;
      const payload = JSON.parse(raw || '{}');
      const clienteRecord = dataStore.clientes.find(c => c.email === user?.email);
      if (clienteRecord) {
        setFormData(prev => ({
          ...prev,
          id_cliente: clienteRecord.id_cliente.toString(),
          id_empleado: payload.empleadoId ? String(payload.empleadoId) : prev.id_empleado || '',
          id_servicios: payload.servicioId ? [String(payload.servicioId)] : prev.id_servicios || [],
        }));
        setEditingCita(null);
        // open dialog after microtask to avoid render ordering issues
        setTimeout(() => setDialogOpen(true), 0);
      }
      localStorage.removeItem('prefillReserva');
    } catch (e) {
      // ignore parse errors
      // eslint-disable-next-line no-console
      console.error('Error reading prefillReserva', e);
    }
  }, [user?.email]);

  // Persist filter selection
  useEffect(() => {
    try {
      localStorage.setItem('calendarEmpleadoFilter', calendarEmpleadoFilter);
    } catch (e) {
      // ignore storage errors
    }
  }, [calendarEmpleadoFilter]);

  const citasVisible = useMemo(() => {
    if (isCliente) {
      const clienteRecord = dataStore.clientes.find(c => c.email === user?.email);
      return dataStore.citas.filter(c => c.id_cliente === clienteRecord?.id_cliente);
    }
    if (isBarbero) {
      return dataStore.citas.filter(c => c.id_empleado === user?.id_empleado);
    }
    // Admin or others
    return dataStore.citas;
  }, [user?.email, user?.id_empleado]);

  const citasPorDia = useMemo(() => {
    const map: Record<string, number> = {};
    citasVisible.forEach(c => {
      map[c.fecha] = (map[c.fecha] || 0) + 1;
    });
    return map;
  }, [citasVisible]);

  const monthDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ day: number; dateStr: string; disabled?: boolean }> = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ day: i, dateStr });
    }
    return { firstDay, days };
  }, [calendarMonth, citasPorDia]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const hasConflict = (empleadoId: number | undefined, fecha: string, hora: string, excludingId?: number) => {
    if (!empleadoId) return false;
    // default to overlap check with 30min if durations not provided
    const start = parseTimeToMinutes(hora);
    const duration = computeSelectedServicesDuration();
    const end = start + duration;
    return dataStore.citas.some(c => {
      if (c.id_empleado !== empleadoId || c.fecha !== fecha || c.id_cita === excludingId) return false;
      const cStart = parseTimeToMinutes(c.hora);
      const cDuration = computeServiciosDuration(c);
      const cEnd = cStart + cDuration;
      return start < cEnd && cStart < end;
    });
  };

  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getCitasForDate = (dateStr?: string) => {
    if (!dateStr) return [] as Cita[];
    let list = dataStore.citas.filter(c => c.fecha === dateStr);
    if (calendarEmpleadoFilter && calendarEmpleadoFilter !== 'all') {
      const empId = parseInt(calendarEmpleadoFilter);
      list = list.filter(c => c.id_empleado === empId);
    }
    if (isCliente) {
      const clienteRecord = dataStore.clientes.find(c => c.email === user?.email);
      list = list.filter(c => c.id_cliente === clienteRecord?.id_cliente);
    }
    if (isBarbero) {
      list = list.filter(c => c.id_empleado === user?.id_empleado);
    }
    return list;
  };

  const getOccupiedTimes = (fecha?: string, empleadoId?: number, excludingId?: number) => {
    if (!fecha || !empleadoId) return [] as string[];
    const desiredDuration = computeSelectedServicesDuration();
    return timeSlots.filter(slot => {
      const start = parseTimeToMinutes(slot);
      const end = start + desiredDuration;
      // check overlap with any existing cita
      return dataStore.citas.some(c => {
        if (c.id_empleado !== empleadoId || c.fecha !== fecha || c.id_cita === excludingId) return false;
        const cStart = parseTimeToMinutes(c.hora);
        const cDuration = computeServiciosDuration(c);
        const cEnd = cStart + cDuration;
        return start < cEnd && cStart < end;
      });
    });
  };

  const parseTimeToMinutes = (time: string) => {
    const [hh, mm] = time.split(':').map(Number);
    return hh * 60 + mm;
  };

  const computeServiciosDuration = (cita: any) => {
    const ids: number[] = cita.id_servicios?.length ? cita.id_servicios : (cita.id_servicio ? [cita.id_servicio] : []);
    if (ids.length === 0) return 30; // default 30 minutes
    return ids.reduce((sum, id) => sum + (mockServicios.find(s => s.id_servicio === id)?.duracion || 30), 0);
  };

  const computeSelectedServicesDuration = () => {
    const selectedIds = (formData.id_servicios || []);
    const ids = selectedIds.length ? selectedIds.map(s => parseInt(s)) : (formData.id_servicio ? [parseInt(formData.id_servicio)] : []);
    if (ids.length === 0) return 30;
    return ids.reduce((sum, id) => sum + (mockServicios.find(s => s.id_servicio === id)?.duracion || 30), 0);
  };

  const computeSelectedServicesDurationDisplay = () => {
    const selectedIds = (formData.id_servicios || []);
    const ids = selectedIds.length ? selectedIds.map(s => parseInt(s)) : (formData.id_servicio ? [parseInt(formData.id_servicio)] : []);
    if (ids.length === 0) return 0;
    return ids.reduce((sum, id) => sum + (mockServicios.find(s => s.id_servicio === id)?.duracion || 30), 0);
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0 min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

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

      {/* Calendario sencillo */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Calendario</CardTitle>
            <div className="flex items-center gap-2">
              <div>
                <Label className="text-xs mb-1">Filtrar Barbero</Label>
                <Select value={calendarEmpleadoFilter} onValueChange={(v) => setCalendarEmpleadoFilter(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los barberos</SelectItem>
                    {mockEmpleados.map(e => (
                      <SelectItem key={e.id_empleado} value={e.id_empleado.toString()}>{e.nombre} {e.apellido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  const d = new Date(calendarMonth);
                  d.setMonth(d.getMonth() - 1);
                  setCalendarMonth(d);
                }}>‹</Button>
                <div className="font-medium">{calendarMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</div>
                <Button size="sm" variant="outline" onClick={() => {
                  const d = new Date(calendarMonth);
                  d.setMonth(d.getMonth() + 1);
                  setCalendarMonth(d);
                }}>›</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%' }}>
            <div
              className="grid"
              style={{
                height: 'min(72vh, 640px)',
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gridTemplateRows: 'auto repeat(6, 1fr)',
                gap: '8px'
              }}
            >
              {/* headers (first row) */}
              {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
                <div key={d} className="text-center text-sm font-medium text-gray-700">{d}</div>
              ))}

              {/* 42 cells */}
              {(() => {
                const totalCells = 42;
                const cells: Array<{ day?: number; dateStr?: string } | null> = [];
                for (let i = 0; i < monthDays.firstDay; i++) cells.push(null);
                monthDays.days.forEach(d => cells.push({ day: d.day, dateStr: d.dateStr }));
                while (cells.length < totalCells) cells.push(null);

                return cells.map((cell, idx) => {
                  if (!cell) return (
                    <div key={`cell-${idx}`} className="border rounded-md bg-gray-50" style={{ padding: 8 }} />
                  );

                  const { day, dateStr } = cell as { day: number; dateStr: string };
                  const citasDay = getCitasForDate(dateStr);
                  const shown = citasDay.slice(0, 3);
                  const more = Math.max(0, citasDay.length - shown.length);
                  const isToday = dateStr === todayStr;

                  return (
                    <div key={dateStr} className="border rounded-md bg-white p-2 flex flex-col" style={{ minHeight: 0 }}>
                      <div className="flex items-start justify-between">
                        <div className="text-sm font-medium text-gray-800">{day}</div>
                        {citasDay.length > 0 && <div className="text-xs text-muted-foreground">{citasDay.length}</div>}
                      </div>
                      <div className="mt-2 text-[13px] text-muted-foreground overflow-hidden flex-1" style={{ minHeight: 0 }}>
                        <div className="flex flex-col gap-1" style={{ maxHeight: '100%', overflow: 'hidden' }}>
                          {shown.map(c => (
                            <div key={c.id_cita} className="truncate">{c.hora} • {getServicioName(c.id_servicio)}</div>
                          ))}
                        </div>
                        {more > 0 && <div className="text-xs text-muted-foreground mt-1">+{more} más</div>}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog que muestra citas del día seleccionado */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Citas del {selectedDate}</DialogTitle>
            <DialogDescription>
              Lista de citas para la fecha seleccionada
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {getCitasForDate(selectedDate).length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No hay citas en esta fecha.</div>
            ) : (
              <div className="space-y-2">
                {getCitasForDate(selectedDate).map(cita => (
                  <Card key={cita.id_cita}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{cita.hora} — {getServicioName(cita.id_servicio)}</div>
                        <div className="text-sm text-muted-foreground">{getClienteName(cita.id_cliente, cita.id_cliente_temporal)} • {getEmpleadoName(cita.id_empleado)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { handleViewDetails(cita); setDayDialogOpen(false); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!isCliente && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => { handleEdit(cita); setDayDialogOpen(false); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { handleDelete(cita.id_cita); setDayDialogOpen(false); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const emp = calendarEmpleadoFilter && calendarEmpleadoFilter !== 'all' ? calendarEmpleadoFilter : formData.id_empleado;
              setFormData({ ...formData, fecha: selectedDate || '', id_empleado: emp || '' });
              setDayDialogOpen(false);
              setDialogOpen(true);
            }} className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">Nueva Cita</Button>
            <Button onClick={() => setDayDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    <TableCell>{formatServicios(cita)}</TableCell>
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

              <div className="space-y-2 md:col-span-2">
                <Label>Servicios *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded">
                  {mockServicios.map(servicio => {
                    const checked = (formData.id_servicios || []).includes(servicio.id_servicio.toString());
                    return (
                      <label key={servicio.id_servicio} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set((formData.id_servicios || []));
                            if (e.target.checked) next.add(servicio.id_servicio.toString()); else next.delete(servicio.id_servicio.toString());
                            setFormData({ ...formData, id_servicios: Array.from(next) });
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{servicio.nombre}</div>
                          <div className="text-xs text-muted-foreground">${servicio.precio.toFixed(2)}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Duración total: <span className="font-medium text-white">{formatDuration(computeSelectedServicesDurationDisplay())}</span></div>
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
                    onValueChange={(value) => {
                      setFormData({ ...formData, hora: value });
                      const empleadoId = formData.id_empleado ? parseInt(formData.id_empleado) : undefined;
                      if (hasConflict(empleadoId, formData.fecha, value, editingCita?.id_cita)) {
                        toast.error('El barbero no está disponible en la fecha y hora seleccionadas');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const empleadoId = formData.id_empleado ? parseInt(formData.id_empleado) : undefined;
                        const occupied = getOccupiedTimes(formData.fecha, empleadoId, editingCita?.id_cita) || [];
                        return timeSlots.map((time) => (
                          <SelectItem
                            key={time}
                            value={time}
                            disabled={occupied.includes(time)}
                            className={occupied.includes(time) ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            {time}{occupied.includes(time) ? ' — ocupado' : ''}
                          </SelectItem>
                        ));
                      })()}
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
                    <p className="font-medium">{formatServicios(viewingCita)}</p>
                    <p className="text-sm text-muted-foreground">${computeServiciosPrice(viewingCita).toFixed(2)}</p>
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
