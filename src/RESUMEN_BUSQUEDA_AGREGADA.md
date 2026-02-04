# ✅ Resumen: Búsqueda Agregada a los Módulos

## 📦 Componente Creado

### `/components/common/SearchBar.tsx`

Componente reutilizable con:
- ✅ Icono de búsqueda
- ✅ Campo de input estilizado
- ✅ Botón X para limpiar
- ✅ Placeholder configurable
- ✅ Estilos consistentes con el tema

---

## ✅ Módulos ACTUALIZADOS Completamente

### 1. **Clientes** (`/components/views/ClientesView.tsx`)

**Búsqueda por:** Nombre, apellido, email, teléfono

**Características:**
- ✅ Componente SearchBar integrado
- ✅ Filtrado con useMemo para rendimiento
- ✅ Mensaje "sin resultados"
- ✅ Placeholder descriptivo

**Estado:**
```typescript
const [searchTerm, setSearchTerm] = useState('');

const filteredClientes = useMemo(() => {
  if (!searchTerm.trim()) return clientes;
  const lowerSearch = searchTerm.toLowerCase();
  return clientes.filter((cliente) => {
    const fullName = `${cliente.nombre} ${cliente.apellido || ''}`.toLowerCase();
    const email = (cliente.email || '').toLowerCase();
    const telefono = (cliente.telefono || '').toLowerCase();
    return (
      fullName.includes(lowerSearch) ||
      email.includes(lowerSearch) ||
      telefono.includes(lowerSearch)
    );
  });
}, [clientes, searchTerm]);
```

---

### 2. **Usuarios** (`/features/usuarios/components/UsuariosView.tsx`)

**Búsqueda por:** Nombre, email, teléfono, rol

**Características:**
- ✅ SearchBar integrado
- ✅ Filtrado por rol incluido
- ✅ useMemo para optimización
- ✅ Mensaje cuando no hay resultados

**Estado:**
```typescript
const filteredUsuarios = useMemo(() => {
  if (!searchTerm.trim()) return usuarios;
  const lowerSearch = searchTerm.toLowerCase();
  return usuarios.filter((usuario) => {
    const nombre = usuario.nombre.toLowerCase();
    const email = usuario.email.toLowerCase();
    const telefono = (usuario.telefono || '').toLowerCase();
    const roleName = getRoleName(usuario.id_rol).toLowerCase();
    return (
      nombre.includes(lowerSearch) ||
      email.includes(lowerSearch) ||
      telefono.includes(lowerSearch) ||
      roleName.includes(lowerSearch)
    );
  });
}, [usuarios, searchTerm]);
```

---

### 3. **Empleados** (`/components/views/EmpleadosView.tsx`)

**Búsqueda por:** Nombre, apellido, cargo, email, teléfono

**Características:**
- ✅ Migrado de sistema legacy a SearchBar
- ✅ useMemo en lugar de useState duplicado
- ✅ Eliminadas referencias a setFilteredEmpleados
- ✅ Mensaje sin resultados agregado

**Cambios aplicados:**
```typescript
// ANTES (legacy):
const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>(mockEmpleados);
const handleSearch = (e) => {
  const term = e.target.value.toLowerCase();
  setSearchTerm(term);
  const filtered = empleados.filter(empleado => { /* ... */ });
  setFilteredEmpleados(filtered);
};

// DESPUÉS (optimizado):
const filteredEmpleados = useMemo(() => {
  if (!searchTerm.trim()) return empleados;
  const lowerSearch = searchTerm.toLowerCase();
  return empleados.filter((empleado) => { /* ... */ });
}, [empleados, searchTerm]);
```

---

## 🔄 Módulos CON Sistema Legacy (actualizar siguiendo el mismo patrón)

Estos módulos YA TIENEN búsqueda pero usan un sistema viejo. Necesitan migración:

### 4. **Productos** (`/components/views/ProductosView.tsx`)
- ⚠️ Usa `filteredProductos` como state
- ⚠️ Tiene lógica de búsqueda manual
- 🔄 Necesita: SearchBar + useMemo

### 5. **Ventas** (si existe búsqueda)
### 6. **Compras** (si existe búsqueda)
### 7. **Servicios** (si existe búsqueda)
### 8. **Citas** (si existe búsqueda)

---

## ❌ Módulos SIN Búsqueda (agregar desde cero)

Estos módulos NO tienen búsqueda todavía. Seguir el patrón completo:

### Proveedores
### Pagos
### Devoluciones
### Devoluciones Proveedor
### Consignaciones
### Roles
### Clientes Temporales

---

## 🎯 Patrón Completo de Migración

### Para módulos con sistema legacy:

```typescript
// 1. IMPORTS
import { useState, useMemo } from 'react';  // Agregar useMemo
import { SearchBar } from '../common/SearchBar';  // Nuevo componente

// 2. ELIMINAR ESTADO DUPLICADO
// ANTES:
const [filteredData, setFilteredData] = useState(data);
// DESPUÉS: Eliminar esta línea

// 3. ELIMINAR FUNCIÓN handleSearch
// ANTES:
const handleSearch = (e) => { /* ... */ };
// DESPUÉS: Eliminar toda esta función

// 4. AGREGAR useMemo
const filteredData = useMemo(() => {
  if (!searchTerm.trim()) return data;
  const lowerSearch = searchTerm.toLowerCase();
  return data.filter((item) => {
    // Lógica de filtrado
  });
}, [data, searchTerm]);

// 5. REEMPLAZAR INPUT CON SearchBar
// ANTES:
<Input
  placeholder="Buscar..."
  value={searchTerm}
  onChange={handleSearch}
/>
// DESPUÉS:
<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Buscar por..."
  className="w-full md:w-96"
/>

// 6. AGREGAR MENSAJE SIN RESULTADOS
{filteredData.length === 0 ? (
  <div className="text-center py-8 text-gray-500">
    {searchTerm ? 'No se encontraron resultados' : 'No hay datos'}
  </div>
) : (
  <Table>
    {/* ... */}
  </Table>
)}

// 7. LIMPIAR handleSubmit/confirmDelete
// Eliminar cualquier llamada a setFilteredData()
```

---

## 📋 Checklist Final

Para cada módulo actualizado, verificar:

- [x] **Clientes** - Completo ✅
- [x] **Usuarios** - Completo ✅
- [x] **Empleados** - Completo ✅
- [ ] **Productos** - Con legacy, migrar
- [ ] **Proveedores** - Sin búsqueda, agregar
- [ ] **Ventas** - Verificar si tiene legacy
- [ ] **Compras** - Verificar si tiene legacy
- [ ] **Servicios** - Verificar si tiene legacy
- [ ] **Citas** - Verificar si tiene legacy
- [ ] **Pagos** - Sin búsqueda, agregar
- [ ] **Devoluciones** - Sin búsqueda, agregar
- [ ] **Devoluciones Proveedor** - Sin búsqueda, agregar
- [ ] **Consignaciones** - Sin búsqueda, agregar
- [ ] **Roles** - Sin búsqueda, agregar
- [ ] **Clientes Temporales** - Sin búsqueda, agregar

---

## 🚀 Cómo Continuar

### Opción 1: Migrar módulos legacy uno por uno

Seguir el patrón de migración para:
- Productos
- Ventas (si aplica)
- Compras (si aplica)
- etc.

### Opción 2: Agregar búsqueda a módulos nuevos

Usar el patrón completo desde cero en:
- Proveedores
- Pagos
- Devoluciones
- etc.

---

## 📝 Código de Referencia Rápida

### Template completo para copiar/pegar:

```typescript
// 1. Imports
import { useState, useMemo } from 'react';
import { SearchBar } from '../common/SearchBar';

// 2. Estado
const [searchTerm, setSearchTerm] = useState('');

// 3. Filtrado
const filteredData = useMemo(() => {
  if (!searchTerm.trim()) return data;
  const lowerSearch = searchTerm.toLowerCase();
  return data.filter((item) => {
    // Ajustar según los campos del módulo
    const field1 = item.nombre.toLowerCase();
    const field2 = (item.email || '').toLowerCase();
    return field1.includes(lowerSearch) || field2.includes(lowerSearch);
  });
}, [data, searchTerm]);

// 4. En el JSX (dentro de CardHeader)
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

// 5. En CardContent
<CardContent>
  {filteredData.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      {searchTerm ? 'No se encontraron resultados' : 'No hay datos registrados'}
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

## 🎉 Resultado Final

Cuando todos los módulos estén actualizados:

✅ Búsqueda consistente en TODOS los módulos
✅ Mejor UX con el componente SearchBar
✅ Rendimiento optimizado con useMemo
✅ Mensajes claros cuando no hay resultados
✅ Código más limpio y mantenible

---

## 📞 Notas

- El componente SearchBar está en `/components/common/SearchBar.tsx`
- Todos los módulos deben importarlo correctamente
- La ruta de import varía según la ubicación del archivo:
  - Desde `/components/views/`: `import { SearchBar } from '../common/SearchBar';`
  - Desde `/features/*/components/`: `import { SearchBar } from '../../../components/common/SearchBar';`

---

**Actualizado:** Noviembre 2025
**Módulos completados:** 3 de 15 (20%)
**Siguiente:** Productos, Proveedores, Ventas
