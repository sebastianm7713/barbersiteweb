import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, Clock, Scissors, CheckCircle2 } from 'lucide-react';
import { mockServicios, mockEmpleados, ClienteTemporal, Cita } from '../shared/lib/mockData';
import { dataStore, addClienteTemporal, addCita, getNextClienteTemporalId, getNextCitaId } from '../shared/lib/dataStore';
import { toast } from 'sonner';

interface PublicBookingFormProps {
  open: boolean;
  onClose: () => void;
}

export function PublicBookingForm({ open, onClose }: PublicBookingFormProps) {
  const [step, setStep] = useState<'info' | 'booking' | 'success'>('info');
  const [clienteData, setClienteData] = useState({
    nombre: '',
    email: '',
    telefono: '',
  });
  const [bookingData, setBookingData] = useState({
    id_servicio: '',
    id_empleado: '',
    fecha: '',
    hora: '',
    observaciones: '',
  });

  const handleClienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar datos del cliente
    if (!clienteData.nombre || !clienteData.email || !clienteData.telefono) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clienteData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setStep('booking');
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.id_servicio || !bookingData.fecha || !bookingData.hora) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    // Guardar cliente temporal
    const newClienteTemporal: ClienteTemporal = {
      id_cliente_temporal: getNextClienteTemporalId(),
      nombre: clienteData.nombre,
      email: clienteData.email,
      telefono: clienteData.telefono,
      fecha_registro: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
    };
    addClienteTemporal(newClienteTemporal);

    // Crear cita
    const newCita: Cita = {
      id_cita: getNextCitaId(),
      id_cliente: 0, // No tiene cliente registrado
      id_cliente_temporal: newClienteTemporal.id_cliente_temporal,
      id_servicio: parseInt(bookingData.id_servicio),
      id_empleado: bookingData.id_empleado ? parseInt(bookingData.id_empleado) : undefined,
      fecha: bookingData.fecha,
      hora: bookingData.hora,
      estado: 'pendiente',
      observaciones: bookingData.observaciones,
    };
    addCita(newCita);

    setStep('success');
    toast.success('¡Cita agendada exitosamente!');
  };

  const handleClose = () => {
    setStep('info');
    setClienteData({ nombre: '', email: '', telefono: '' });
    setBookingData({ id_servicio: '', id_empleado: '', fecha: '', hora: '', observaciones: '' });
    onClose();
  };

  const getServiceName = (id: number) => {
    return mockServicios.find(s => s.id_servicio === id)?.nombre || '';
  };

  const getServicePrice = (id: number) => {
    return mockServicios.find(s => s.id_servicio === id)?.precio || 0;
  };

  // Generar horarios disponibles
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* DialogHeader siempre presente para accesibilidad */}
        <DialogHeader>
          {step === 'info' && (
            <>
              <DialogTitle className="flex items-center gap-2">
                <Scissors className="w-6 h-6 text-[#D4AF37]" />
                Reserva tu Cita
              </DialogTitle>
              <DialogDescription>
                Completa tus datos para agendar una cita. Te enviaremos un recordatorio por correo.
              </DialogDescription>
            </>
          )}
          {step === 'booking' && (
            <>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#D4AF37]" />
                Selecciona Servicio y Fecha
              </DialogTitle>
              <DialogDescription>
                Elige el servicio que deseas y la fecha/hora de tu cita
              </DialogDescription>
            </>
          )}
          {step === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-center">¡Cita Agendada Exitosamente!</DialogTitle>
              <DialogDescription className="text-center">
                Hemos enviado un correo de confirmación a <strong>{clienteData.email}</strong>
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {/* Contenido por step */}
        {step === 'info' && (
          <form onSubmit={handleClienteSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  placeholder="Juan Pérez"
                  value={clienteData.nombre}
                  onChange={(e) => setClienteData({ ...clienteData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@email.com"
                  value={clienteData.email}
                  onChange={(e) => setClienteData({ ...clienteData, email: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Te enviaremos un recordatorio de tu cita a este correo
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="555-1234"
                  value={clienteData.telefono}
                  onChange={(e) => setClienteData({ ...clienteData, telefono: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                Continuar
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'booking' && (
          <form onSubmit={handleBookingSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="servicio">Servicio *</Label>
                <Select
                  value={bookingData.id_servicio}
                  onValueChange={(value) => setBookingData({ ...bookingData, id_servicio: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockServicios.map((servicio) => (
                      <SelectItem key={servicio.id_servicio} value={servicio.id_servicio.toString()}>
                        {servicio.nombre} - ${servicio.precio.toFixed(2)} ({servicio.duracion} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="empleado">Barbero (Opcional)</Label>
                <Select
                  value={bookingData.id_empleado}
                  onValueChange={(value) => setBookingData({ ...bookingData, id_empleado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier barbero disponible" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Cualquier barbero disponible</SelectItem>
                    {mockEmpleados.map((empleado) => (
                      <SelectItem key={empleado.id_empleado} value={empleado.id_empleado.toString()}>
                        {empleado.nombre} {empleado.apellido} - {empleado.cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.fecha}
                    onChange={(e) => setBookingData({ ...bookingData, fecha: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora">Hora *</Label>
                  <Select
                    value={bookingData.hora}
                    onValueChange={(value) => setBookingData({ ...bookingData, hora: value })}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Preferencias o detalles especiales..."
                  value={bookingData.observaciones}
                  onChange={(e) => setBookingData({ ...bookingData, observaciones: e.target.value })}
                  rows={3}
                />
              </div>

              {bookingData.id_servicio && (
                <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
                  <p className="font-semibold mb-2">Resumen de tu cita:</p>
                  <p className="text-sm">
                    <strong>Servicio:</strong> {getServiceName(parseInt(bookingData.id_servicio))}
                  </p>
                  <p className="text-sm">
                    <strong>Precio:</strong> ${getServicePrice(parseInt(bookingData.id_servicio)).toFixed(2)}
                  </p>
                  {bookingData.fecha && (
                    <p className="text-sm">
                      <strong>Fecha:</strong> {new Date(bookingData.fecha + 'T00:00:00').toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                  {bookingData.hora && (
                    <p className="text-sm">
                      <strong>Hora:</strong> {bookingData.hora}
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('info')}>
                Atrás
              </Button>
              <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                Confirmar Cita
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'success' && (
          <>
            <div className="py-6">
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white p-6 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Scissors className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-300">Servicio</p>
                    <p className="font-semibold">{getServiceName(parseInt(bookingData.id_servicio))}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-300">Fecha</p>
                    <p className="font-semibold">
                      {new Date(bookingData.fecha + 'T00:00:00').toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-300">Hora</p>
                    <p className="font-semibold">{bookingData.hora}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Nota:</strong> Te enviaremos un recordatorio por correo 24 horas antes de tu cita.
                  Si necesitas cancelar o reprogramar, por favor contáctanos al (555) 123-4567.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleClose} 
                className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
