// Mock data for all entities
export interface Role {
  id_rol: number;
  nombre: string;
  descripcion?: string;
  estado: 'activo' | 'inactivo';
}

export interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  avatar?: string;
  estado: 'activo' | 'inactivo';
}

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  codigo?: string;
  imagen?: string;
  estado?: 'activo' | 'inactivo';
}

export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface Compra {
  id_compra: number;
  id_proveedor: number;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
}

export interface DetalleCompra {
  id_detalle_compra: number;
  id_compra: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Devolucion {
  id_devolucion: number;
  id_venta_prod_detalle?: number;
  motivo?: string;
  fecha: string;
  remitido: 'stock' | 'proveedor';
}

export interface DevolucionProveedor {
  id_dev_prov: number;
  id_detalle_compra: number;
  id_proveedor: number;
  fecha: string;
  motivo?: string;
  cantidad_devuelta: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
}

export interface ConsignacionProveedor {
  id_consignacion: number;
  id_proveedor: number;
  id_producto: number;
  cantidad_recibida: number;
  cantidad_vendida: number;
  precio_proveedor: number;
  precio_venta: number;
  fecha_entrega: string;
  fecha_pago?: string;
  estado: 'pendiente' | 'pagado' | 'devuelto';
  observaciones?: string;
}

export interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion?: number; // in minutes
  imagen?: string;
}

export interface Cita {
  id_cita: number;
  id_cliente: number;
  id_servicio: number;
  id_empleado?: number;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  observaciones?: string;
}

export interface Empleado {
  id_empleado: number;
  id_usuario?: number;
  nombre: string;
  apellido: string;
  cargo: string;
  telefono?: string;
  email?: string;
  fecha_contratacion: string;
  salario?: number;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fecha_registro: string;
  estado?: 'activo' | 'inactivo';
}

export interface Pago {
  id_pago: number;
  id_venta?: number;
  monto: number;
  metodo: 'efectivo' | 'tarjeta' | 'transferencia';
  fecha: string;
  referencia?: string;
}

export interface Venta {
  id_venta: number;
  id_cliente?: number;
  id_usuario: number;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'pagada' | 'cancelada';
}

export interface VentaProductoDetalle {
  id_venta_prod_detalle: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// Mock Data
export const mockRoles: Role[] = [
  { id_rol: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema', estado: 'activo' },
  { id_rol: 2, nombre: 'Vendedor', descripcion: 'Gestión de ventas y clientes', estado: 'activo' },
  { id_rol: 3, nombre: 'Almacén', descripcion: 'Gestión de inventario y productos', estado: 'activo' },
  { id_rol: 4, nombre: 'Compras', descripcion: 'Gestión de compras y proveedores', estado: 'activo' },
];

export const mockUsuarios: Usuario[] = [
  {
    id_usuario: 1,
    id_rol: 1,
    nombre: 'Admin User',
    email: 'admin@sistema.com',
    password: 'admin123',
    telefono: '555-0001',
    estado: 'activo',
  },
  {
    id_usuario: 2,
    id_rol: 2,
    nombre: 'Juan Vendedor',
    email: 'vendedor@sistema.com',
    password: 'vend123',
    telefono: '555-0002',
    estado: 'activo',
  },
  {
    id_usuario: 3,
    id_rol: 3,
    nombre: 'María Almacén',
    email: 'almacen@sistema.com',
    password: 'alma123',
    telefono: '555-0003',
    estado: 'activo',
  },
];

export const mockProductos: Producto[] = [
  {
    id_producto: 1,
    nombre: 'Pomada para Cabello',
    descripcion: 'Pomada de fijación fuerte',
    precio: 15.99,
    stock: 25,
    categoria: 'Cuidado Capilar',
    codigo: 'POM001',
    imagen: 'https://images.unsplash.com/photo-1542818279-04aa19d54f06?w=400',
    estado: 'activo',
  },
  {
    id_producto: 2,
    nombre: 'Gel Fijador',
    descripcion: 'Gel fijación extrema',
    precio: 12.99,
    stock: 30,
    categoria: 'Cuidado Capilar',
    codigo: 'GEL001',
    imagen: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400',
    estado: 'activo',
  },
  {
    id_producto: 3,
    nombre: 'Aceite para Barba',
    descripcion: 'Aceite hidratante para barba',
    precio: 18.50,
    stock: 20,
    categoria: 'Cuidado de Barba',
    codigo: 'ACE001',
    imagen: 'https://images.unsplash.com/photo-1643123158602-c5e19b5c96ca?w=400',
    estado: 'activo',
  },
  {
    id_producto: 4,
    nombre: 'Bálsamo para Barba',
    descripcion: 'Bálsamo suavizante',
    precio: 16.99,
    stock: 8,
    categoria: 'Cuidado de Barba',
    codigo: 'BAL001',
    imagen: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400',
    estado: 'activo',
  },
  {
    id_producto: 5,
    nombre: 'Tijeras Profesionales',
    descripcion: 'Tijeras de acero inoxidable para corte',
    precio: 65.00,
    stock: 5,
    categoria: 'Herramientas',
    codigo: 'TIJ001',
    imagen: 'https://images.unsplash.com/photo-1656921350183-7935040cf7fb?w=400',
    estado: 'activo',
  },
  {
    id_producto: 6,
    nombre: 'Coca Cola 500ml',
    descripcion: 'Refresco de cola',
    precio: 1.50,
    stock: 60,
    categoria: 'Bebidas',
    codigo: 'COC001',
    imagen: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    estado: 'activo',
  },
  {
    id_producto: 7,
    nombre: 'Agua Mineral 600ml',
    descripcion: 'Agua embotellada',
    precio: 1.00,
    stock: 80,
    categoria: 'Bebidas',
    codigo: 'AGU001',
    imagen: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
    estado: 'activo',
  },
  {
    id_producto: 8,
    nombre: 'Papas Fritas',
    descripcion: 'Bolsa de papas fritas',
    precio: 3.00,
    stock: 45,
    categoria: 'Snacks',
    codigo: 'PAP001',
    imagen: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    estado: 'activo',
  },
];

export const mockProveedores: Proveedor[] = [
  {
    id_proveedor: 1,
    nombre: 'Distribuidora Barbería Pro',
    contacto: 'Carlos Pérez',
    telefono: '555-1001',
    email: 'ventas@barberiapro.com',
    direccion: 'Av. Principal 123',
  },
  {
    id_proveedor: 2,
    nombre: 'Suministros La Navaja',
    contacto: 'Ana García',
    telefono: '555-1002',
    email: 'contacto@lanavaja.com',
    direccion: 'Calle Comercio 456',
  },
  {
    id_proveedor: 3,
    nombre: 'Bebidas y Snacks SA',
    contacto: 'Luis Rodríguez',
    telefono: '555-1003',
    email: 'ventas@bebidasysnacks.com',
    direccion: 'Zona Industrial 789',
  },
];

export const mockCompras: Compra[] = [
  {
    id_compra: 1,
    id_proveedor: 1,
    fecha: '2025-11-01',
    total: 5000.00,
    estado: 'completada',
  },
  {
    id_compra: 2,
    id_proveedor: 2,
    fecha: '2025-11-05',
    total: 3200.00,
    estado: 'pendiente',
  },
];

export const mockDetalleCompras: DetalleCompra[] = [
  {
    id_detalle_compra: 1,
    id_compra: 1,
    id_producto: 1,
    cantidad: 10,
    precio_unitario: 500.00,
    subtotal: 5000.00,
  },
];

export const mockDevoluciones: Devolucion[] = [
  {
    id_devolucion: 1,
    id_venta_prod_detalle: 1,
    motivo: 'Producto defectuoso',
    fecha: '2025-11-06',
    remitido: 'stock',
  },
];

export const mockDevolucionesProveedor: DevolucionProveedor[] = [
  {
    id_dev_prov: 1,
    id_detalle_compra: 1,
    id_proveedor: 1,
    fecha: '2025-11-07',
    motivo: 'Producto dañado en tránsito',
    cantidad_devuelta: 2,
    estado: 'pendiente',
  },
];

export const mockConsignaciones: ConsignacionProveedor[] = [
  {
    id_consignacion: 1,
    id_proveedor: 1,
    id_producto: 1,
    cantidad_recibida: 20,
    cantidad_vendida: 5,
    precio_proveedor: 450.00,
    precio_venta: 799.99,
    fecha_entrega: '2025-10-15',
    estado: 'pendiente',
  },
];

export const mockServicios: Servicio[] = [
  {
    id_servicio: 1,
    nombre: 'Corte de cabello',
    descripcion: 'Corte clásico para hombre',
    precio: 15.00,
    duracion: 30,
    imagen: 'https://images.unsplash.com/photo-1654097801176-cb1795fd0c5e?w=400',
  },
  {
    id_servicio: 2,
    nombre: 'Corte + Barba',
    descripcion: 'Corte y perfilado de barba',
    precio: 25.00,
    duracion: 45,
    imagen: 'https://images.unsplash.com/photo-1654097803253-d481b6751f29?w=400',
  },
  {
    id_servicio: 3,
    nombre: 'Barba',
    descripcion: 'Perfilado de barba',
    precio: 12.00,
    duracion: 20,
    imagen: 'https://images.unsplash.com/photo-1654097803253-d481b6751f29?w=400',
  },
  {
    id_servicio: 4,
    nombre: 'Afeitado completo',
    descripcion: 'Afeitado al ras con toalla caliente',
    precio: 18.00,
    duracion: 25,
    imagen: 'https://images.unsplash.com/photo-1593702233354-259d1f794ed1?w=400',
  },
  {
    id_servicio: 5,
    nombre: 'Tinte',
    descripcion: 'Tinte de cabello',
    precio: 35.00,
    duracion: 60,
    imagen: 'https://images.unsplash.com/photo-1712213396688-c6f2d536671f?w=400',
  },
  {
    id_servicio: 6,
    nombre: 'Tratamiento Capilar',
    descripcion: 'Tratamiento hidratante para cabello',
    precio: 40.00,
    duracion: 45,
    imagen: 'https://images.unsplash.com/photo-1617606795870-bd2aa4633ebd?w=400',
  },
  {
    id_servicio: 7,
    nombre: 'Diseño de Barba',
    descripcion: 'Diseño y esculpido de barba personalizado',
    precio: 20.00,
    duracion: 35,
    imagen: 'https://images.unsplash.com/photo-1654097803253-d481b6751f29?w=400',
  },
];

export const mockCitas: Cita[] = [
  {
    id_cita: 1,
    id_cliente: 1,
    id_servicio: 1,
    id_empleado: 1,
    fecha: '2025-11-10',
    hora: '10:00',
    estado: 'confirmada',
    observaciones: 'Cliente prefiere fade bajo',
  },
];

export const mockEmpleados: Empleado[] = [
  {
    id_empleado: 1,
    id_usuario: 1,
    nombre: 'Pedro',
    apellido: 'Martínez',
    cargo: 'Barbero Senior',
    telefono: '555-2001',
    email: 'pedro@barberia.com',
    fecha_contratacion: '2024-01-15',
    salario: 1800.00,
  },
  {
    id_empleado: 2,
    nombre: 'Carlos',
    apellido: 'Ruiz',
    cargo: 'Barbero',
    telefono: '555-2002',
    email: 'carlos@barberia.com',
    fecha_contratacion: '2024-06-10',
    salario: 1500.00,
  },
];

export const mockClientes: Cliente[] = [
  {
    id_cliente: 1,
    nombre: 'Roberto',
    apellido: 'Sánchez',
    email: 'roberto@email.com',
    telefono: '555-3001',
    direccion: 'Calle 123',
    fecha_registro: '2025-10-01',
    estado: 'activo',
  },
  {
    id_cliente: 2,
    nombre: 'Laura',
    apellido: 'Gómez',
    email: 'laura@email.com',
    telefono: '555-3002',
    direccion: 'Av. 456',
    fecha_registro: '2025-10-15',
    estado: 'activo',
  },
];

export const mockPagos: Pago[] = [
  {
    id_pago: 1,
    id_venta: 1,
    monto: 829.98,
    metodo: 'tarjeta',
    fecha: '2025-11-05',
    referencia: 'REF-001',
  },
];

export const mockVentas: Venta[] = [
  {
    id_venta: 1,
    id_cliente: 1,
    id_usuario: 2,
    fecha: '2025-11-05',
    total: 829.98,
    estado: 'pagada',
  },
  {
    id_venta: 2,
    id_cliente: 2,
    id_usuario: 2,
    fecha: '2025-11-06',
    total: 119.98,
    estado: 'pendiente',
  },
];

export const mockVentasDetalle: VentaProductoDetalle[] = [
  {
    id_venta_prod_detalle: 1,
    id_venta: 1,
    id_producto: 1,
    cantidad: 1,
    precio_unitario: 799.99,
    subtotal: 799.99,
  },
  {
    id_venta_prod_detalle: 2,
    id_venta: 1,
    id_producto: 2,
    cantidad: 1,
    precio_unitario: 29.99,
    subtotal: 29.99,
  },
];