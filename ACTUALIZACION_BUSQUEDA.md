# 🔍 Actualización: Búsqueda en Todos los Módulos

## ✅ Módulos Actualizados

### ✨ Completado:
1. ✅ **Clientes** - Buscar por nombre, email, teléfono
2. ✅ **Usuarios** - Buscar por nombre, email, teléfono, rol

### 🔄 Pendientes (aplicar el mismo patrón):
3. Empleados
4. Productos  
5. Proveedores
6. Ventas
7. Compras
8. Servicios
9. Pagos
10. Devoluciones
11. Devoluciones Proveedor
12. Consignaciones
13. Roles
14. Citas
15. Clientes Temporales

---

## 📋 Patrón a Aplicar

Para cada vista, seguir estos pasos:

### 1️⃣ Agregar Imports

```typescript
// Cambiar:
import { useState } from 'react';

// Por:
import { useState, useMemo } from 'react';

// Agregar al final de los imports:
import { SearchBar } from '../../../components/common/SearchBar';
// O si está en /components/views/:
import { SearchBar } from '../common/SearchBar';
```

### 2️⃣ Agregar Estado de Búsqueda

```typescript
// Después de los otros useState:
const [searchTerm, setSearchTerm] = useState('');
```

### 3️⃣ Crear Función de Filtrado

```typescript
// Después de los estados, antes de las funciones:
const filteredData = useMemo(() => {
  if (!searchTerm.trim()) return data;

  const lowerSearch = searchTerm.toLowerCase();
  return data.filter((item) => {
    // Ajustar según los campos del módulo
    const nombre = item.nombre.toLowerCase();
    const descripcion = (item.descripcion || '').toLowerCase();
    
    return (
      nombre.includes(lowerSearch) ||
      descripcion.includes(lowerSearch)
    );
  });
}, [data, searchTerm]);
```

### 4️⃣ Agregar SearchBar en el CardHeader

```typescript
// Cambiar:
<CardHeader>
  <CardTitle>Lista de [Módulo]</CardTitle>
</CardHeader>

// Por:
<CardHeader>
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <CardTitle>Lista de [Módulo]</CardTitle>
    <SearchBar
      value={searchTerm}
      onChange={setSearchTerm}
      placeholder="Buscar por..."
      className="w-full md:w-96"
    />
  </div>
</CardHeader>
```

### 5️⃣ Agregar Mensaje Sin Resultados y Usar filteredData

```typescript
// Cambiar:
<CardContent>
  <div className="rounded-md border overflow-x-auto">
    <Table>
      {/* ... */}
      <TableBody>
        {data.map((item) => (
          {/* ... */}
        ))}
      </TableBody>
    </Table>
  </div>
</CardContent>

// Por:
<CardContent>
  {filteredData.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      {searchTerm ? 'No se encontraron resultados con ese criterio' : 'No hay datos registrados'}
    </div>
  ) : (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        {/* ... */}
        <TableBody>
          {filteredData.map((item) => (
            {/* ... */}
          ))}
        </TableBody>
      </Table>
    </div>
  )}
</CardContent>
```

---

## 🎯 Ejemplos por Módulo

### Empleados

**Buscar por:** nombre, apellido, cargo, email

```typescript
const filteredEmpleados = useMemo(() => {
  if (!searchTerm.trim()) return empleados;

  const lowerSearch = searchTerm.toLowerCase();
  return empleados.filter((empleado) => {
    const fullName = `${empleado.nombre} ${empleado.apellido || ''}`.toLowerCase();
    const cargo = (empleado.cargo || '').toLowerCase();
    const email = (empleado.email || '').toLowerCase();
    
    return (
      fullName.includes(lowerSearch) ||
      cargo.includes(lowerSearch) ||
      email.includes(lowerSearch)
    );
  });
}, [empleados, searchTerm]);
```

**Placeholder:**
```typescript
placeholder="Buscar por nombre, cargo o email..."
```

---

### Productos

**Buscar por:** nombre, código, categoría

```typescript
const filteredProductos = useMemo(() => {
  if (!searchTerm.trim()) return productos;

  const lowerSearch = searchTerm.toLowerCase();
  return productos.filter((producto) => {
    const nombre = producto.nombre.toLowerCase();
    const codigo = (producto.codigo || '').toLowerCase();
    const categoria = (producto.categoria || '').toLowerCase();
    
    return (
      nombre.includes(lowerSearch) ||
      codigo.includes(lowerSearch) ||
      categoria.includes(lowerSearch)
    );
  });
}, [productos, searchTerm]);
```

**Placeholder:**
```typescript
placeholder="Buscar por nombre, código o categoría..."
```

---

### Proveedores

**Buscar por:** nombre, empresa, email, teléfono

```typescript
const filteredProveedores = useMemo(() => {
  if (!searchTerm.trim()) return proveedores;

  const lowerSearch = searchTerm.toLowerCase();
  return proveedores.filter((proveedor) => {
    const nombre = proveedor.nombre.toLowerCase();
    const empresa = (proveedor.empresa || '').toLowerCase();
    const email = (proveedor.email || '').toLowerCase();
    const telefono = (proveedor.telefono || '').toLowerCase();
    
    return (
      nombre.includes(lowerSearch) ||
      empresa.includes(lowerSearch) ||
      email.includes(lowerSearch) ||
      telefono.includes(lowerSearch)
    );
  });
}, [proveedores, searchTerm]);
```

**Placeholder:**
```typescript
placeholder="Buscar por nombre, empresa, email o teléfono..."
```

---

### Ventas

**Buscar por:** ID, cliente, fecha, monto

```typescript
const filteredVentas = useMemo(() => {
  if (!searchTerm.trim()) return ventas;

  const lowerSearch = searchTerm.toLowerCase();
  return ventas.filter((venta) => {
    const id = venta.id_venta.toString();
    const cliente = (venta.nombre_cliente || '').toLowerCase();
    const fecha = venta.fecha.toLowerCase();
    const monto = venta.monto_total.toString();
    
    return (
      id.includes(lowerSearch) ||
      cliente.includes(lowerSearch) ||
      fecha.includes(lowerSearch) ||
      monto.includes(lowerSearch)
    );
  });
}, [ventas, searchTerm]);
```

**Placeholder:**
```typescript
placeholder="Buscar por ID, cliente, fecha o monto..."
```

---

### Compras

**Buscar por:** ID, proveedor, fecha

```typescript
const filteredCompras = useMemo(() => {
  if (!searchTerm.trim()) return compras;

  const lowerSearch = searchTerm.toLowerCase();
  return compras.filter((compra) => {
    const id = compra.id_compra.toString();
    const proveedor = (compra.nombre_proveedor || '').toLowerCase();
    const fecha = compra.fecha.toLowerCase();
    
    return (
      id.includes(lowerSearch) ||
      proveedor.includes(lowerSearch) ||
      fecha.includes(lowerSearch)
    );
  });
}, [compras, searchTerm]);
```

**Placeholder:**
```typescript
placeholder="Buscar por ID, proveedor o fecha..."
```

---

### Servicios

**Buscar por:** nombre, descripción, precio

```typescript
const filteredServicios = useMemo(() => {
  if (!searchTerm.trim()) return servicios;

  const lowerSearch = searchTerm.toLowerCase();
  return servicios.filter((servicio) => {
    const nombre = servicio.nombre.toLowerCase();
    const descripcion = (servicio.descripcion || '').toLowerCase();
    const precio = servicio.precio.toString();
    
    return (
      nombre.includes(lowerSearch) ||
      descripcion.includes(lowerSearch) ||
      precio.includes(lowerSearch)
    );
  });
}, [servicios, searchTerm]);
```

**Placeholder:**
```typescript
placeholder="Buscar por nombre, descripción o precio..."
```

---

### Pagos

**Buscar por:** ID, cliente, método, monto

```typescript
const filteredPagos = useMemo(() => {
  if (!searchTerm.trim()) return pagos;

  const lowerSearch = searchTerm.toLowerCase();
  return pagos.filter((pago) => {
    const id = pago.id_pago.toString();
    const cliente = (pago.nombre_cliente || '').toLowerCase();
    const metodo = pago.metodo_pago.toLowerCase();
    const monto = pago.monto.toString();
    
    return (
      id.includes(lowerSearch) ||
      cliente.includes(lowerSearch) ||
      metodo.includes(lowerSearch) ||
      monto.includes(lowerSearch)
    );
  });
}, [pagos, searchTerm]);
```

**Placeholder:**
```typescript
placeholder="Buscar por ID, cliente, método o monto..."
```

---

### Citas

**Buscar por:** cliente, barbero, servicio, fecha

```typescript
const filteredCitas = useMemo(() => {
  if (!searchTerm.trim()) return citas;

  const lowerSearch = searchTerm.toLowerCase();
  return citas.filter((cita) => {
    const cliente = (cita.nombre_cliente || '').toLowerCase();
    const barbero = (cita.nombre_empleado || '').toLowerCase();
    const servicio = (cita.nombre_servicio || '').toLowerCase();
    const fecha = cita.fecha.toLowerCase();
    
    return (
      cliente.includes(lowerSearch) ||
      barbero.includes(lowerSearch) ||
      servicio.includes(lowerSearch) ||
      fecha.includes(lowerSearch)
    );
  });
}, [citas, searchTerm]);
```

**Placeholder:**
```typescript
placeholder="Buscar por cliente, barbero, servicio o fecha..."
```

---

### Roles

**Buscar por:** nombre, descripción

```typescript
const filteredRoles = useMemo(() => {
  if (!searchTerm.trim()) return roles;

  const lowerSearch = searchTerm.toLowerCase();
  return roles.filter((rol) => {
    const nombre = rol.nombre.toLowerCase();
    const descripcion = (rol.descripcion || '').toLowerCase();
    
    return (
      nombre.includes(lowerSearch) ||
      descripcion.includes(lowerSearch)
    );
  });
}, [roles, searchTerm]);
```

**Placeholder:**
```typescript
placeholder="Buscar por nombre o descripción..."
```

---

## 📝 Checklist de Implementación

Para cada módulo, verificar:

- [ ] Import de `useMemo`
- [ ] Import de `SearchBar`
- [ ] Estado `searchTerm` agregado
- [ ] Función `filteredData` creada con lógica correcta
- [ ] `SearchBar` agregado en `CardHeader`
- [ ] Placeholder apropiado en `SearchBar`
- [ ] Mensaje "sin resultados" agregado
- [ ] `data.map()` cambiado por `filteredData.map()`
- [ ] Probado en el navegador

---

## 🚀 Orden de Prioridad

Aplicar en este orden (más usados primero):

1. ✅ Clientes (HECHO)
2. ✅ Usuarios (HECHO)
3. Empleados
4. Productos
5. Ventas
6. Servicios
7. Citas
8. Proveedores
9. Compras
10. Pagos
11. Devoluciones
12. Devoluciones Proveedor
13. Consignaciones
14. Roles
15. Clientes Temporales

---

## 📁 Ubicación de Archivos

```
/components/views/[Módulo]View.tsx
/features/[módulo]/components/[Módulo]View.tsx
```

**Nota:** Algunos módulos pueden tener doble ubicación (legacy). Actualizar ambos o solo el de `/features/`.

---

## ✅ Verificación Final

Después de actualizar todos los módulos:

1. Login como admin
2. Visitar cada módulo
3. Verificar que aparece la barra de búsqueda
4. Probar búsqueda con diferentes términos
5. Verificar que filtra correctamente
6. Probar el botón X para limpiar
7. Verificar mensaje "sin resultados"

---

¡Listo! Con este patrón puedes actualizar todos los módulos restantes 🚀
