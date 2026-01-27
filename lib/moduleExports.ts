import { exportData } from './exportUtils';
import { toast } from 'sonner';

// Proveedores
export const exportProveedores = (proveedores: any[]) => {
  const columns = [
    { header: 'ID', dataKey: 'id_proveedor' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'NIT', dataKey: 'nit' },
    { header: 'Contacto', dataKey: 'contacto' },
    { header: 'Teléfono', dataKey: 'telefono' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Dirección', dataKey: 'direccion' },
    { header: 'Estado', dataKey: 'estado' },
  ];

  const results = exportData(proveedores, columns, 'proveedores', 'Lista de Proveedores', 'both');
  
  if (results.excel && results.pdf) {
    toast.success('Archivos exportados correctamente (Excel y PDF)');
  } else if (results.excel) {
    toast.success('Archivo Excel exportado correctamente');
  } else if (results.pdf) {
    toast.success('Archivo PDF exportado correctamente');
  } else {
    toast.error('Error al exportar archivos');
  }
};

// Clientes
export const exportClientes = (clientes: any[]) => {
  const columns = [
    { header: 'ID', dataKey: 'id_cliente' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Apellido', dataKey: 'apellido' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Teléfono', dataKey: 'telefono' },
    { header: 'Dirección', dataKey: 'direccion' },
    { header: 'Fecha Registro', dataKey: 'fecha_registro' },
  ];

  const results = exportData(clientes, columns, 'clientes', 'Lista de Clientes', 'both');
  
  if (results.excel && results.pdf) {
    toast.success('Archivos exportados correctamente (Excel y PDF)');
  } else {
    toast.error('Error al exportar archivos');
  }
};

// Empleados
export const exportEmpleados = (empleados: any[]) => {
  const columns = [
    { header: 'ID', dataKey: 'id_empleado' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Apellido', dataKey: 'apellido' },
    { header: 'Cargo', dataKey: 'cargo' },
    { header: 'Teléfono', dataKey: 'telefono' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Fecha Contratación', dataKey: 'fecha_contratacion' },
    { header: 'Salario', dataKey: 'salario' },
  ];

  const results = exportData(empleados, columns, 'empleados', 'Lista de Empleados', 'both');
  
  if (results.excel && results.pdf) {
    toast.success('Archivos exportados correctamente (Excel y PDF)');
  } else {
    toast.error('Error al exportar archivos');
  }
};

// Ventas
export const exportVentas = (ventas: any[], getClienteName: (id: number) => string, getUsuarioName: (id: number) => string) => {
  const ventasFormatted = ventas.map(v => ({
    ...v,
    cliente: getClienteName(v.id_cliente),
    usuario: getUsuarioName(v.id_usuario),
  }));

  const columns = [
    { header: 'ID', dataKey: 'id_venta' },
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Usuario', dataKey: 'usuario' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Total', dataKey: 'total' },
    { header: 'Estado', dataKey: 'estado' },
  ];

  const results = exportData(ventasFormatted, columns, 'ventas', 'Lista de Ventas', 'both');
  
  if (results.excel && results.pdf) {
    toast.success('Archivos exportados correctamente (Excel y PDF)');
  } else {
    toast.error('Error al exportar archivos');
  }
};

// Compras
export const exportCompras = (compras: any[], getProveedorName: (id: number) => string) => {
  const comprasFormatted = compras.map(c => ({
    ...c,
    proveedor: getProveedorName(c.id_proveedor),
  }));

  const columns = [
    { header: 'ID', dataKey: 'id_compra' },
    { header: 'Proveedor', dataKey: 'proveedor' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Total', dataKey: 'total' },
    { header: 'Estado', dataKey: 'estado' },
  ];

  const results = exportData(comprasFormatted, columns, 'compras', 'Lista de Compras', 'both');
  
  if (results.excel && results.pdf) {
    toast.success('Archivos exportados correctamente (Excel y PDF)');
  } else {
    toast.error('Error al exportar archivos');
  }
};

// Pagos
export const exportPagos = (pagos: any[]) => {
  const columns = [
    { header: 'ID', dataKey: 'id_pago' },
    { header: 'ID Venta', dataKey: 'id_venta' },
    { header: 'Monto', dataKey: 'monto' },
    { header: 'Método', dataKey: 'metodo' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Referencia', dataKey: 'referencia' },
    { header: 'Estado', dataKey: 'estado' },
  ];

  const results = exportData(pagos, columns, 'pagos', 'Lista de Pagos', 'both');
  
  if (results.excel && results.pdf) {
    toast.success('Archivos exportados correctamente (Excel y PDF)');
  } else {
    toast.error('Error al exportar archivos');
  }
};

// Devoluciones
export const exportDevoluciones = (devoluciones: any[]) => {
  const columns = [
    { header: 'ID', dataKey: 'id_devolucion' },
    { header: 'ID Venta', dataKey: 'id_venta' },
    { header: 'Motivo', dataKey: 'motivo' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Monto', dataKey: 'monto' },
    { header: 'Estado', dataKey: 'estado' },
  ];

  const results = exportData(devoluciones, columns, 'devoluciones', 'Lista de Devoluciones', 'both');
  
  if (results.excel && results.pdf) {
    toast.success('Archivos exportados correctamente (Excel y PDF)');
  } else {
    toast.error('Error al exportar archivos');
  }
};

// Consignaciones
export const exportConsignaciones = (consignaciones: any[], getProveedorName: (id: number) => string, getProductoName: (id: number) => string) => {
  const consignacionesFormatted = consignaciones.map(c => ({
    ...c,
    proveedor: getProveedorName(c.id_proveedor),
    producto: getProductoName(c.id_producto),
  }));

  const columns = [
    { header: 'ID', dataKey: 'id_consignacion' },
    { header: 'Proveedor', dataKey: 'proveedor' },
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Cantidad Recibida', dataKey: 'cantidad_recibida' },
    { header: 'Cantidad Vendida', dataKey: 'cantidad_vendida' },
    { header: 'Precio Proveedor', dataKey: 'precio_proveedor' },
    { header: 'Precio Venta', dataKey: 'precio_venta' },
    { header: 'Fecha Entrega', dataKey: 'fecha_entrega' },
    { header: 'Estado', dataKey: 'estado' },
  ];

  const results = exportData(consignacionesFormatted, columns, 'consignaciones', 'Lista de Consignaciones', 'both');
  
  if (results.excel && results.pdf) {
    toast.success('Archivos exportados correctamente (Excel y PDF)');
  } else {
    toast.error('Error al exportar archivos');
  }
};

