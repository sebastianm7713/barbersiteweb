# 📋 Plan de Migración a Arquitectura por Procesos

## 🎯 Objetivo

Reorganizar la aplicación de gestión de barbería para alinearla con los **procesos de negocio** definidos, mejorando la navegación, claridad y mantenibilidad del código.

---

## 📦 Entregables

### ✅ Ya Creados:

1. **`NUEVA_ARQUITECTURA_PROCESOS.md`**
   - Documentación completa de la nueva arquitectura
   - Mapeo de permisos por rol
   - Estructura de carpetas por procesos
   - Funcionalidades por subproceso

2. **`MainLayoutPorProcesos.tsx`**
   - Nuevo layout con menús colapsables
   - Agrupación por procesos
   - Permisos granulares por rol
   - Diseño mejorado con iconos por proceso

3. **`PLAN_MIGRACION_PROCESOS.md`** (este documento)
   - Plan paso a paso
   - Checklist de tareas
   - Orden de implementación

---

## 🚀 Fases de Migración

### **FASE 1: Preparación** (1-2 horas)

#### 1.1 Revisar Documentación
- [ ] Leer `NUEVA_ARQUITECTURA_PROCESOS.md` completo
- [ ] Entender la nueva estructura de carpetas
- [ ] Revisar permisos por rol

#### 1.2 Backup del Código Actual
- [ ] Crear una copia de seguridad del proyecto
- [ ] Guardar en carpeta separada o commit en git

#### 1.3 Instalar Componente Collapsible
- [ ] Verificar que existe `/components/ui/collapsible.tsx`
- [ ] Si no existe, crearlo (es de ShadCN)

---

### **FASE 2: Implementación del Nuevo Layout** (2-3 horas)

#### 2.1 Probar el Nuevo Layout
- [ ] Abrir `/core/layout/MainLayoutPorProcesos.tsx`
- [ ] Revisar el código
- [ ] Entender la estructura de `processMenuItems`

#### 2.2 Actualizar App.tsx
- [ ] Abrir `/App.tsx`
- [ ] Cambiar import:
  ```typescript
  // ANTES:
  import { MainLayout } from './core/layout/MainLayout';
  
  // DESPUÉS:
  import { MainLayoutPorProcesos as MainLayout } from './core/layout/MainLayoutPorProcesos';
  ```

#### 2.3 Probar en el Navegador
- [ ] `npm run dev`
- [ ] Login como Admin
- [ ] Verificar que los menús se muestran agrupados por procesos
- [ ] Probar expandir/colapsar procesos
- [ ] Verificar que la navegación funciona
- [ ] Login como Barbero y verificar permisos
- [ ] Login como Cliente y verificar permisos

---

### **FASE 3: Reorganización de Carpetas** (OPCIONAL - 4-6 horas)

⚠️ **NOTA:** Esta fase es opcional. El sistema funciona perfectamente sin reorganizar carpetas.
Si decides hacerla, hazlo módulo por módulo para evitar errores.

#### 3.1 Crear Nueva Estructura de Carpetas

```bash
# En /features/, crear:
mkdir -p configuracion/roles
mkdir -p usuarios/gestion-usuarios
mkdir -p usuarios/mi-perfil
mkdir -p compras/productos
mkdir -p compras/proveedores
mkdir -p compras/gestion-compras
mkdir -p compras/devoluciones-proveedor
mkdir -p agendamiento/servicios
mkdir -p agendamiento/citas
mkdir -p ventas/clientes
mkdir -p ventas/pagos
mkdir -p ventas/gestion-ventas
mkdir -p ventas/devoluciones-cliente
mkdir -p medicion-desempeno/dashboard
```

#### 3.2 Migrar Módulos Uno por Uno

**Ejemplo: Migrar Roles**

```bash
# 1. Crear estructura
mkdir -p /features/configuracion/roles/components

# 2. Mover archivo
mv /features/roles/components/RolesView.tsx /features/configuracion/roles/components/

# 3. Crear index.tsx
# En /features/configuracion/roles/index.tsx:
export { RolesView } from './components/RolesView';

# 4. Actualizar imports en RolesView.tsx si es necesario
# (ajustar rutas relativas de ../../../components/ui/* según nueva ubicación)

# 5. Probar en navegador
npm run dev
# Navegar a Roles y verificar que funciona
```

**Repetir para cada módulo:**
- [ ] Roles
- [ ] Usuarios
- [ ] Mi Perfil
- [ ] Productos
- [ ] Proveedores
- [ ] Compras
- [ ] Devoluciones Proveedor
- [ ] Servicios
- [ ] Citas
- [ ] Clientes
- [ ] Pagos
- [ ] Ventas
- [ ] Devoluciones
- [ ] Dashboard

#### 3.3 Eliminar Carpetas Antiguas
- [ ] Verificar que todos los módulos funcionan
- [ ] Eliminar `/features/roles/` (antiguo)
- [ ] Eliminar `/features/usuarios/components/` (antiguo)
- [ ] etc.

---

### **FASE 4: Completar Funcionalidad de Búsqueda** (3-4 horas)

Siguiendo el patrón de `RESUMEN_BUSQUEDA_AGREGADA.md`:

#### 4.1 Módulos con Sistema Legacy (migrar)
- [ ] Productos
- [ ] Ventas
- [ ] Compras
- [ ] Servicios
- [ ] Citas

#### 4.2 Módulos Sin Búsqueda (agregar desde cero)
- [ ] Proveedores
- [ ] Pagos
- [ ] Devoluciones
- [ ] Devoluciones Proveedor
- [ ] Consignaciones
- [ ] Roles
- [ ] Clientes Temporales

#### Patrón a seguir para cada módulo:

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
    // Lógica específica del módulo
  });
}, [data, searchTerm]);

// 4. JSX - SearchBar en CardHeader
<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Buscar por..."
  className="w-full md:w-96"
/>

// 5. JSX - Mensaje sin resultados
{filteredData.length === 0 ? (
  <div className="text-center py-8 text-gray-500">
    {searchTerm ? 'No se encontraron resultados' : 'No hay datos'}
  </div>
) : (
  <Table>{/* ... */}</Table>
)}
```

---

### **FASE 5: Nuevas Funcionalidades** (6-8 horas)

#### 5.1 Dar de Baja Productos (Uso Interno)

**Ubicación:** `/components/views/ProductosView.tsx` (o `/features/compras/productos/`)

**Implementación:**

```typescript
// 1. Agregar estado
const [bajaDialogOpen, setBajaDialogOpen] = useState(false);
const [productoBaja, setProductoBaja] = useState<Producto | null>(null);
const [motivoBaja, setMotivoBaja] = useState('');
const [cantidadBaja, setCantidadBaja] = useState(1);

// 2. Función para dar de baja
const handleDarBaja = (producto: Producto) => {
  setProductoBaja(producto);
  setMotivoBaja('Uso interno del negocio');
  setCantidadBaja(1);
  setBajaDialogOpen(true);
};

const confirmDarBaja = () => {
  if (productoBaja && cantidadBaja > 0) {
    // Reducir stock
    setProductos(productos.map(p =>
      p.id_producto === productoBaja.id_producto
        ? { ...p, stock: p.stock - cantidadBaja }
        : p
    ));
    
    // Registrar en historial (mock)
    console.log('Registro de baja:', {
      producto: productoBaja.nombre,
      cantidad: cantidadBaja,
      motivo: motivoBaja,
      fecha: new Date().toISOString(),
      usuario: user?.nombre
    });
    
    toast.success(`${cantidadBaja} unidad(es) dada(s) de baja correctamente`);
  }
  setBajaDialogOpen(false);
};

// 3. Botón en la tabla
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => handleDarBaja(producto)}
  title="Dar de baja (uso interno)"
>
  <MinusCircle className="w-4 h-4" />
</Button>

// 4. Dialog para confirmar baja
<Dialog open={bajaDialogOpen} onOpenChange={setBajaDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dar de Baja Producto</DialogTitle>
      <DialogDescription>
        Registra el uso interno del producto
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>Producto</Label>
        <Input value={productoBaja?.nombre || ''} disabled />
      </div>
      <div>
        <Label>Stock Actual</Label>
        <Input value={productoBaja?.stock || 0} disabled />
      </div>
      <div>
        <Label>Cantidad a dar de baja</Label>
        <Input 
          type="number" 
          min="1" 
          max={productoBaja?.stock || 0}
          value={cantidadBaja}
          onChange={(e) => setCantidadBaja(parseInt(e.target.value))}
        />
      </div>
      <div>
        <Label>Motivo</Label>
        <Textarea 
          value={motivoBaja}
          onChange={(e) => setMotivoBaja(e.target.value)}
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setBajaDialogOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={confirmDarBaja}>
        Confirmar Baja
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Checklist:**
- [ ] Agregar icono `MinusCircle` a imports de lucide-react
- [ ] Implementar estado y funciones
- [ ] Agregar botón "Dar de Baja" en la tabla
- [ ] Crear Dialog de confirmación
- [ ] Probar funcionalidad
- [ ] Verificar que reduce el stock correctamente

---

#### 5.2 Recordatorios Automáticos para Citas

**Ubicación:** `/components/views/CitasView.tsx` (o `/features/agendamiento/citas/`)

**Implementación:**

```typescript
// 1. Agregar al formulario de cita
const [recordatorios, setRecordatorios] = useState({
  whatsapp: false,
  email: false,
  notificacion: true,
  horasAntes: 24
});

// 2. En el formulario de crear/editar cita
<div className="space-y-2">
  <Label>Recordatorios</Label>
  <div className="space-y-2 pl-2">
    <div className="flex items-center gap-2">
      <Checkbox 
        checked={recordatorios.whatsapp}
        onCheckedChange={(checked) => 
          setRecordatorios({...recordatorios, whatsapp: !!checked})
        }
      />
      <Label>WhatsApp</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox 
        checked={recordatorios.email}
        onCheckedChange={(checked) => 
          setRecordatorios({...recordatorios, email: !!checked})
        }
      />
      <Label>Email</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox 
        checked={recordatorios.notificacion}
        onCheckedChange={(checked) => 
          setRecordatorios({...recordatorios, notificacion: !!checked})
        }
      />
      <Label>Notificación en el sistema</Label>
    </div>
  </div>
</div>

<div className="space-y-2">
  <Label>Enviar recordatorio</Label>
  <Select 
    value={recordatorios.horasAntes.toString()}
    onValueChange={(val) => 
      setRecordatorios({...recordatorios, horasAntes: parseInt(val)})
    }
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1">1 hora antes</SelectItem>
      <SelectItem value="2">2 horas antes</SelectItem>
      <SelectItem value="6">6 horas antes</SelectItem>
      <SelectItem value="12">12 horas antes</SelectItem>
      <SelectItem value="24">24 horas antes</SelectItem>
      <SelectItem value="48">48 horas antes</SelectItem>
    </SelectContent>
  </Select>
</div>

// 3. Función mock para enviar recordatorios
const enviarRecordatorio = (cita: Cita) => {
  console.log('Enviando recordatorio:', {
    cita: cita.id_cita,
    cliente: cita.nombre_cliente,
    fecha: cita.fecha,
    hora: cita.hora,
    canales: {
      whatsapp: recordatorios.whatsapp,
      email: recordatorios.email,
      notificacion: recordatorios.notificacion
    }
  });
  
  if (recordatorios.whatsapp) {
    toast.success('Recordatorio enviado por WhatsApp');
  }
  if (recordatorios.email) {
    toast.success('Recordatorio enviado por Email');
  }
  if (recordatorios.notificacion) {
    toast.success('Notificación programada');
  }
};
```

**Checklist:**
- [ ] Agregar campos de recordatorios al estado
- [ ] Agregar checkboxes en el formulario
- [ ] Agregar select de "horas antes"
- [ ] Implementar función mock de envío
- [ ] Guardar configuración con la cita
- [ ] Mostrar indicador si tiene recordatorios activos
- [ ] Probar funcionalidad

---

#### 5.3 Actualización Automática de Inventario

**Ubicación:** `/components/views/ComprasView.tsx` (o `/features/compras/gestion-compras/`)

**Implementación:**

```typescript
// En la función de confirmar compra
const confirmarCompra = (compra: Compra) => {
  // 1. Actualizar estado de la compra
  setCompras(compras.map(c =>
    c.id_compra === compra.id_compra
      ? { ...c, estado: 'recibida' }
      : c
  ));
  
  // 2. Actualizar inventario automáticamente
  if (compra.detalles && compra.detalles.length > 0) {
    // Obtener productos actuales
    const productosActualizados = productos.map(producto => {
      // Buscar si hay detalles de compra para este producto
      const detalle = compra.detalles.find(d => d.id_producto === producto.id_producto);
      
      if (detalle) {
        // Incrementar stock
        return {
          ...producto,
          stock: producto.stock + detalle.cantidad
        };
      }
      
      return producto;
    });
    
    // Actualizar estado de productos (necesitarás acceso global o context)
    // setProductos(productosActualizados);
    
    toast.success('Compra confirmada e inventario actualizado', {
      description: `Se agregaron ${compra.detalles.reduce((sum, d) => sum + d.cantidad, 0)} unidades al inventario`,
      style: { background: '#10b981', color: '#fff' }
    });
  }
};

// Botón en la tabla de compras
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => confirmarCompra(compra)}
  disabled={compra.estado === 'recibida'}
>
  {compra.estado === 'recibida' ? 'Recibida' : 'Confirmar Recepción'}
</Button>
```

**Checklist:**
- [ ] Agregar campo `estado` a compras ('pendiente', 'recibida')
- [ ] Agregar botón "Confirmar Recepción"
- [ ] Implementar lógica de actualización de inventario
- [ ] Considerar usar Context o estado global para productos
- [ ] Mostrar resumen de unidades agregadas
- [ ] Deshabilitar botón si ya está confirmada
- [ ] Agregar badge de estado en la tabla
- [ ] Probar funcionalidad completa

---

#### 5.4 Mejorar Dashboard con Nuevas Métricas

**Ubicación:** `/features/dashboard/components/Dashboard.tsx`

**Métricas a agregar:**

```typescript
// 1. Calcular métricas
const metrics = {
  // Citas
  totalCitasAgendadas: citas.length,
  citasAtendidas: citas.filter(c => c.estado === 'completada').length,
  citasCanceladas: citas.filter(c => c.estado === 'cancelada').length,
  
  // Productos
  productosVendidosMes: ventas
    .filter(v => isCurrentMonth(v.fecha))
    .reduce((sum, v) => sum + (v.productos?.length || 0), 0),
  
  porcentajeProductosVendidos: calculatePercentage(
    productosVendidosMes,
    totalProductosDisponibles
  ),
  
  // Servicios
  serviciosMasSolicitados: getTopServices(ventas, 5),
  
  // Barberos
  barberosConMasSolicitudes: getTopBarbers(citas, 5),
  
  // Ingresos
  ingresosProductos: ventas
    .filter(v => isCurrentMonth(v.fecha))
    .reduce((sum, v) => sum + (v.totalProductos || 0), 0),
  
  ingresosServicios: ventas
    .filter(v => isCurrentMonth(v.fecha))
    .reduce((sum, v) => sum + (v.totalServicios || 0), 0),
  
  ingresosTotal: ingresosProductos + ingresosServicios
};

// 2. Componentes de visualización
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <MetricCard
    title="Citas Agendadas"
    value={metrics.totalCitasAgendadas}
    icon={Calendar}
    color="blue"
  />
  <MetricCard
    title="Citas Atendidas"
    value={metrics.citasAtendidas}
    icon={CheckCircle}
    color="green"
  />
  <MetricCard
    title="Citas Canceladas"
    value={metrics.citasCanceladas}
    icon={XCircle}
    color="red"
  />
  <MetricCard
    title="% Productos Vendidos"
    value={`${metrics.porcentajeProductosVendidos}%`}
    icon={Package}
    color="amber"
  />
</div>

// 3. Gráficas
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  {/* Servicios más solicitados */}
  <Card>
    <CardHeader>
      <CardTitle>Servicios Más Solicitados</CardTitle>
    </CardHeader>
    <CardContent>
      <BarChart data={metrics.serviciosMasSolicitados} />
    </CardContent>
  </Card>
  
  {/* Barberos con más citas */}
  <Card>
    <CardHeader>
      <CardTitle>Barberos con Más Solicitudes</CardTitle>
    </CardHeader>
    <CardContent>
      <BarChart data={metrics.barberosConMasSolicitudes} />
    </CardContent>
  </Card>
</div>

// 4. Ingresos
<Card className="mt-6">
  <CardHeader>
    <CardTitle>Total de Ingresos del Mes</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-sm text-gray-500">Productos</p>
        <p className="text-2xl font-bold text-green-500">
          ${metrics.ingresosProductos.toFixed(2)}
        </p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">Servicios</p>
        <p className="text-2xl font-bold text-blue-500">
          ${metrics.ingresosServicios.toFixed(2)}
        </p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-2xl font-bold text-amber-500">
          ${metrics.ingresosTotal.toFixed(2)}
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

**Checklist:**
- [ ] Crear funciones helper para cálculos
- [ ] Implementar cards de métricas
- [ ] Agregar gráficas con recharts
- [ ] Mostrar top 5 servicios más solicitados
- [ ] Mostrar top 5 barberos con más citas
- [ ] Calcular ingresos por productos y servicios
- [ ] Agregar filtro por fecha (mes, semana, año)
- [ ] Hacer responsive
- [ ] Probar con diferentes roles

---

### **FASE 6: Testing y Ajustes** (2-3 horas)

#### 6.1 Testing por Rol

**Como Admin:**
- [ ] Verificar acceso a todos los procesos
- [ ] Probar todas las funcionalidades CRUD
- [ ] Verificar búsquedas
- [ ] Probar "Dar de Baja" productos
- [ ] Verificar recordatorios de citas
- [ ] Confirmar actualización de inventario
- [ ] Revisar dashboard completo

**Como Barbero:**
- [ ] Verificar procesos permitidos
- [ ] Confirmar que NO ve Configuración ni Usuarios
- [ ] Probar gestión de productos (solo lectura donde corresponde)
- [ ] Probar ventas y pagos
- [ ] Verificar citas
- [ ] Revisar dashboard personal

**Como Cliente:**
- [ ] Verificar que solo ve Agendamiento y Perfil
- [ ] Probar agendar cita
- [ ] Ver catálogo de productos (lectura)
- [ ] Revisar dashboard personal (mis citas)

#### 6.2 Testing de Navegación
- [ ] Expandir/colapsar todos los procesos
- [ ] Navegar entre todos los módulos
- [ ] Verificar breadcrumbs (si existen)
- [ ] Probar navegación en mobile
- [ ] Verificar que sidebar se cierra en mobile al navegar

#### 6.3 Testing de Búsqueda
- [ ] Probar búsqueda en todos los módulos
- [ ] Verificar que filtra correctamente
- [ ] Probar con términos vacíos
- [ ] Probar botón X de limpiar
- [ ] Verificar mensaje "sin resultados"

#### 6.4 Ajustes Finales
- [ ] Corregir errores encontrados
- [ ] Ajustar estilos inconsistentes
- [ ] Optimizar rendimiento si es necesario
- [ ] Verificar que no hay warnings en consola
- [ ] Revisar responsive en todos los tamaños

---

## 📊 Progreso General

### Resumen de Tareas

| Fase | Tareas | Tiempo Estimado | Estado |
|------|--------|----------------|--------|
| 1. Preparación | 3 | 1-2 horas | ⏳ Pendiente |
| 2. Nuevo Layout | 3 | 2-3 horas | ⏳ Pendiente |
| 3. Reorganización Carpetas | 15 | 4-6 horas | ⚠️ Opcional |
| 4. Búsqueda | 12 | 3-4 horas | 🔄 3 de 15 completados |
| 5. Nuevas Funcionalidades | 4 | 6-8 horas | ⏳ Pendiente |
| 6. Testing | 4 | 2-3 horas | ⏳ Pendiente |

**Total:** ~18-26 horas (excluyendo reorganización de carpetas)

---

## 🎯 Recomendación de Implementación

### Enfoque Gradual (Recomendado)

**DÍA 1: Layout y Navegación (3-4 horas)**
1. Implementar nuevo layout (Fase 2)
2. Probar con los 3 roles
3. Ajustar permisos si es necesario

**DÍA 2: Búsqueda (3-4 horas)**
1. Completar búsqueda en módulos restantes (Fase 4)
2. Testing de búsquedas

**DÍA 3: Funcionalidad "Dar de Baja" (2-3 horas)**
1. Implementar en Productos (Fase 5.1)
2. Testing

**DÍA 4: Recordatorios de Citas (2-3 horas)**
1. Implementar en Citas (Fase 5.2)
2. Testing

**DÍA 5: Inventario Automático y Dashboard (3-4 horas)**
1. Implementar actualización de inventario (Fase 5.3)
2. Mejorar dashboard (Fase 5.4)
3. Testing completo (Fase 6)

**TOTAL: 5 días (13-18 horas)**

---

## ✅ Criterios de Aceptación

El proyecto estará completo cuando:

- [ ] El nuevo layout está implementado y funciona correctamente
- [ ] Los menús se agrupan por procesos de negocio
- [ ] Todos los roles tienen los permisos correctos
- [ ] La búsqueda funciona en todos los módulos
- [ ] La funcionalidad "Dar de Baja" está implementada
- [ ] Los recordatorios de citas están implementados
- [ ] La actualización automática de inventario funciona
- [ ] El dashboard muestra todas las métricas solicitadas
- [ ] No hay errores en consola
- [ ] La aplicación es responsive
- [ ] Todo ha sido probado con los 3 roles

---

## 📝 Notas Importantes

1. **No es necesario reorganizar carpetas** - El sistema funciona perfectamente sin hacerlo. Solo reorganiza si quieres una estructura más limpia a largo plazo.

2. **Hazlo gradualmente** - No intentes hacer todo de una vez. Implementa fase por fase y prueba cada cambio.

3. **Backup antes de cambios grandes** - Siempre ten una copia de seguridad antes de mover archivos.

4. **Prueba con los 3 roles** - Cada cambio debe probarse con Admin, Barbero y Cliente.

5. **Los mock data son suficientes** - No necesitas base de datos real para demostrar la funcionalidad.

---

¡Éxito con la migración! 🚀
