# 🏗️ Nueva Arquitectura Basada en Procesos

## 📋 Estructura de Procesos y Subprocesos

### 1️⃣ PROCESO DE CONFIGURACIÓN

#### Subproceso: Gestión de Roles
- **Módulo:** `roles`
- **Permisos:** Solo Admin
- **Funcionalidades:** 
  - ✅ Registrar roles
  - ✅ Consultar roles
  - ✅ Actualizar roles
  - ✅ Cambiar estado de roles
  - ✅ Gestionar permisos asociados

---

### 2️⃣ PROCESO DE USUARIOS

#### Subproceso: Gestión de Usuarios
- **Módulo:** `usuarios`
- **Permisos:** Solo Admin
- **Funcionalidades:**
  - ✅ Registrar usuarios
  - ✅ Consultar usuarios
  - ✅ Actualizar usuarios
  - ✅ Cambiar estado de usuarios
  - ✅ Generar reportes de usuarios

#### Subproceso: Gestión de Acceso
- **Módulos:** `auth` (login, recuperar contraseña, logout)
- **Permisos:** Todos los roles
- **Funcionalidades:**
  - ✅ Login
  - ✅ Recuperar contraseña
  - ✅ Cerrar sesión

#### Subproceso: Mi Perfil (adicional)
- **Módulo:** `mi-perfil`
- **Permisos:** Todos los roles
- **Funcionalidades:**
  - ✅ Ver perfil
  - ✅ Actualizar datos personales

---

### 3️⃣ PROCESO DE COMPRAS

#### Subproceso: Gestión de Productos
- **Módulo:** `productos`
- **Permisos:** Admin, Barbero
- **Funcionalidades:**
  - ✅ Registrar productos
  - ✅ Consultar productos
  - ✅ Actualizar productos
  - ✅ Eliminar productos
  - 🆕 **Dar de baja** (uso interno del negocio)
  - ✅ Búsqueda de productos

#### Subproceso: Gestión de Proveedores
- **Módulo:** `proveedores`
- **Permisos:** Admin, Barbero
- **Funcionalidades:**
  - ✅ Registrar proveedores
  - ✅ Consultar proveedores
  - ✅ Actualizar proveedores
  - ✅ Desactivar proveedores
  - ✅ Ver historial de compras
  - ✅ Búsqueda de proveedores

#### Subproceso: Gestión de Compras
- **Módulo:** `compras`
- **Permisos:** Admin, Barbero
- **Funcionalidades:**
  - ✅ Crear órdenes de compra
  - ✅ Validar productos recibidos
  - ✅ Control de cantidades
  - ✅ Control de costos
  - ✅ Control de fechas de entrega
  - ✅ Generar reportes de compras
  - 🔄 Actualizar inventario automáticamente
  - ✅ Búsqueda de compras

#### Subproceso: Devoluciones a Proveedor
- **Módulo:** `devoluciones-proveedor`
- **Permisos:** Admin, Barbero
- **Funcionalidades:**
  - ✅ Registrar devoluciones
  - ✅ Control de intercambio de producto
  - ✅ Razón de devolución
  - ✅ Monto reembolsado
  - ✅ Método utilizado
  - ✅ Autorización
  - ✅ Búsqueda de devoluciones

---

### 4️⃣ PROCESO DE AGENDAMIENTO

#### Subproceso: Gestión de Servicios
- **Módulo:** `servicios`
- **Permisos:** Admin, Barbero
- **Funcionalidades:**
  - ✅ Registrar servicios
  - ✅ Editar servicios
  - ✅ Eliminar servicios
  - ✅ Asignar barberos a servicios
  - ✅ Definir precios
  - ✅ Descripción de servicios
  - ✅ Búsqueda de servicios

#### Subproceso: Gestión Agendamiento de Citas
- **Módulo:** `citas`
- **Permisos:** Admin, Barbero, Cliente
- **Funcionalidades:**
  - ✅ Agendar citas (Cliente)
  - ✅ Ver disponibilidad (horarios, servicios, barberos)
  - ✅ Confirmar citas (Admin, Barbero)
  - ✅ Cancelar citas
  - 🆕 Recordatorios automáticos (WhatsApp, email)
  - ✅ Búsqueda de citas

---

### 5️⃣ PROCESO DE VENTAS

#### Subproceso: Gestión de Clientes
- **Módulo:** `clientes`
- **Permisos:** Admin, Barbero
- **Funcionalidades:**
  - ✅ Registrar clientes
  - ✅ Actualizar información
  - ✅ Ver historial de servicios
  - ✅ Ver historial de compras
  - ✅ Métodos de contacto
  - ✅ Atención personalizada
  - ✅ Búsqueda de clientes

#### Subproceso: Gestión Catálogo de Productos
- **Módulo:** `productos` (vista de catálogo)
- **Permisos:** Admin, Barbero, Cliente (solo lectura)
- **Funcionalidades:**
  - ✅ Ver catálogo de productos
  - ✅ Descripciones
  - ✅ Precios
  - ✅ Categorías
  - ✅ Stock disponible
  - ✅ Búsqueda de productos

**Nota:** Este subproceso usa el mismo módulo de "Gestión de Productos" pero con permisos de solo lectura para clientes.

#### Subproceso: Gestión de Pagos
- **Módulo:** `pagos`
- **Permisos:** Admin, Barbero
- **Funcionalidades:**
  - ✅ Registrar pagos
  - ✅ Consultar pagos
  - ✅ Métodos de pago (efectivo, tarjeta, transferencia)
  - ✅ Generar recibos/comprobantes
  - ✅ Búsqueda de pagos

#### Subproceso: Gestión de Ventas
- **Módulo:** `ventas`
- **Permisos:** Admin, Barbero
- **Funcionalidades:**
  - ✅ Registrar ventas de servicios
  - ✅ Tipo de servicio prestado
  - ✅ Barbero que realizó el servicio
  - ✅ Valor recibido
  - ✅ Verificar pago efectuado
  - ✅ Historial de ventas
  - ✅ Reportes por fechas
  - ✅ Reportes por servicios
  - ✅ Reportes por barberos
  - ✅ Control de ingresos
  - ✅ Búsqueda de ventas

#### Subproceso: Devoluciones a Clientes
- **Módulo:** `devoluciones` (renombrar de `devoluciones-cliente`)
- **Permisos:** Admin, Barbero
- **Funcionalidades:**
  - ✅ Registrar devoluciones
  - ✅ Control de intercambio de producto
  - ✅ Razón de devolución
  - ✅ Monto reembolsado
  - ✅ Método utilizado
  - ✅ Autorización
  - ✅ Búsqueda de devoluciones

---

### 6️⃣ PROCESO DE MEDICIÓN DE DESEMPEÑO

#### Subproceso: Dashboard / Medición de Desempeño
- **Módulo:** `dashboard`
- **Permisos:** Admin (completo), Barbero (limitado), Cliente (personal)
- **Funcionalidades:**

**Para Admin:**
- ✅ Número total de citas agendadas
- ✅ Número total de citas atendidas
- ✅ Número total de citas canceladas
- ✅ Porcentaje de productos vendidos por mes
- ✅ Servicios más solicitados
- ✅ Barberos con más solicitudes
- ✅ Total de ingresos por ventas de productos
- ✅ Total de ingresos por ventas de servicios
- ✅ Gráficas de rendimiento
- ✅ Reportes exportables

**Para Barbero:**
- ✅ Mis citas del día
- ✅ Mis servicios realizados
- ✅ Mis ingresos generados
- ✅ Mis estadísticas personales

**Para Cliente:**
- ✅ Mis citas próximas
- ✅ Historial de servicios
- ✅ Mis pagos

---

## 🗂️ Nueva Estructura de Carpetas

```
/features/
├── 📁 configuracion/              ← PROCESO DE CONFIGURACIÓN
│   └── 📁 roles/
│       ├── components/
│       │   └── RolesView.tsx
│       └── index.tsx
│
├── 📁 usuarios/                   ← PROCESO DE USUARIOS
│   ├── 📁 gestion-usuarios/
│   │   ├── components/
│   │   │   └── UsuariosView.tsx
│   │   └── index.tsx
│   ├── 📁 gestion-acceso/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── RecoverPasswordForm.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   └── index.tsx
│   └── 📁 mi-perfil/
│       ├── components/
│       │   └── MiPerfilView.tsx
│       └── index.tsx
│
├── 📁 compras/                    ← PROCESO DE COMPRAS
│   ├── 📁 productos/
│   │   ├── components/
│   │   │   └── ProductosView.tsx
│   │   └── index.tsx
│   ├── 📁 proveedores/
│   │   ├── components/
│   │   │   └── ProveedoresView.tsx
│   │   └── index.tsx
│   ├── 📁 gestion-compras/
│   │   ├── components/
│   │   │   └── ComprasView.tsx
│   │   └── index.tsx
│   └── 📁 devoluciones-proveedor/
│       ├── components/
│       │   └── DevolucionesProveedorView.tsx
│       └── index.tsx
│
├── 📁 agendamiento/               ← PROCESO DE AGENDAMIENTO
│   ├── 📁 servicios/
│   │   ├── components/
│   │   │   └── ServiciosView.tsx
│   │   └── index.tsx
│   └── 📁 citas/
│       ├── components/
│       │   └── CitasView.tsx
│       └── index.tsx
│
├── 📁 ventas/                     ← PROCESO DE VENTAS
│   ├── 📁 clientes/
│   │   ├── components/
│   │   │   └── ClientesView.tsx
│   │   └── index.tsx
│   ├── 📁 pagos/
│   │   ├── components/
│   │   │   └── PagosView.tsx
│   │   └── index.tsx
│   ├── 📁 gestion-ventas/
│   │   ├── components/
│   │   │   └── VentasView.tsx
│   │   └── index.tsx
│   └── 📁 devoluciones-cliente/
│       ├── components/
│       │   └── DevolucionesView.tsx
│       └── index.tsx
│
└── 📁 medicion-desempeno/         ← PROCESO DE MEDICIÓN
    └── 📁 dashboard/
        ├── components/
        │   ├── DashboardAdmin.tsx
        │   ├── DashboardBarbero.tsx
        │   └── DashboardCliente.tsx
        └── index.tsx
```

---

## 🎯 Mapeo de Permisos por Proceso

### Admin (acceso total)
```typescript
✅ Configuración
   ✅ Gestión de Roles

✅ Usuarios
   ✅ Gestión de Usuarios
   ✅ Gestión de Acceso
   ✅ Mi Perfil

✅ Compras
   ✅ Gestión de Productos
   ✅ Gestión de Proveedores
   ✅ Gestión de Compras
   ✅ Devoluciones a Proveedor

✅ Agendamiento
   ✅ Gestión de Servicios
   ✅ Gestión de Citas

✅ Ventas
   ✅ Gestión de Clientes
   ✅ Gestión Catálogo de Productos
   ✅ Gestión de Pagos
   ✅ Gestión de Ventas
   ✅ Devoluciones a Clientes

✅ Medición de Desempeño
   ✅ Dashboard Completo
```

### Barbero (acceso limitado)
```typescript
❌ Configuración
   ❌ Gestión de Roles

❌ Usuarios
   ❌ Gestión de Usuarios
   ✅ Gestión de Acceso
   ✅ Mi Perfil

✅ Compras
   ✅ Gestión de Productos
   ✅ Gestión de Proveedores (solo lectura)
   ✅ Gestión de Compras (solo registro)
   ✅ Devoluciones a Proveedor

✅ Agendamiento
   ✅ Gestión de Servicios (solo lectura)
   ✅ Gestión de Citas

✅ Ventas
   ✅ Gestión de Clientes
   ✅ Gestión Catálogo de Productos (solo lectura)
   ✅ Gestión de Pagos
   ✅ Gestión de Ventas
   ✅ Devoluciones a Clientes

✅ Medición de Desempeño
   ✅ Dashboard Personal
```

### Cliente (acceso muy limitado)
```typescript
❌ Configuración
   ❌ Gestión de Roles

❌ Usuarios
   ❌ Gestión de Usuarios
   ✅ Gestión de Acceso
   ✅ Mi Perfil

❌ Compras
   ❌ Gestión de Productos
   ❌ Gestión de Proveedores
   ❌ Gestión de Compras
   ❌ Devoluciones a Proveedor

✅ Agendamiento
   ✅ Gestión de Servicios (solo lectura)
   ✅ Gestión de Citas (solo agendar propias)

❌ Ventas
   ❌ Gestión de Clientes
   ✅ Gestión Catálogo de Productos (solo lectura)
   ❌ Gestión de Pagos
   ❌ Gestión de Ventas
   ❌ Devoluciones a Clientes

✅ Medición de Desempeño
   ✅ Dashboard Personal (mis citas y servicios)
```

---

## 📱 Navegación del Sistema por Rol

### Menú Admin
```
🏠 Dashboard
📊 Medición de Desempeño

⚙️ CONFIGURACIÓN
├── Roles

👥 USUARIOS
├── Gestión de Usuarios
└── Mi Perfil

🛒 COMPRAS
├── Productos
├── Proveedores
├── Compras
└── Devoluciones a Proveedor

📅 AGENDAMIENTO
├── Servicios
└── Citas

💰 VENTAS
├── Clientes
├── Catálogo
├── Pagos
├── Ventas
└── Devoluciones a Clientes

🚪 Cerrar Sesión
```

### Menú Barbero
```
🏠 Dashboard

🛒 COMPRAS
├── Productos
├── Proveedores
├── Compras
└── Devoluciones a Proveedor

📅 AGENDAMIENTO
├── Servicios
└── Citas

💰 VENTAS
├── Clientes
├── Catálogo
├── Pagos
├── Ventas
└── Devoluciones a Clientes

👤 Mi Perfil
🚪 Cerrar Sesión
```

### Menú Cliente
```
🏠 Mis Citas

📅 AGENDAMIENTO
├── Ver Servicios
└── Agendar Cita

🛍️ Catálogo de Productos

👤 Mi Perfil
🚪 Cerrar Sesión
```

---

## 🆕 Nuevas Funcionalidades a Implementar

### 1. Dar de Baja Productos (Uso Interno)
**Ubicación:** `compras/productos/`

```typescript
// Botón adicional en ProductosView
<Button onClick={() => handleUsarProducto(producto)}>
  Dar de Baja (Uso Interno)
</Button>

// Lógica
const handleUsarProducto = (producto: Producto) => {
  // Reducir stock
  // Registrar en historial
  // Motivo: "Uso interno del negocio"
};
```

### 2. Recordatorios Automáticos
**Ubicación:** `agendamiento/citas/`

```typescript
// Configuración de recordatorios
interface Recordatorio {
  tipo: 'whatsapp' | 'email' | 'notificacion';
  tiempo_anticipacion: number; // horas antes
  mensaje: string;
}
```

### 3. Actualización Automática de Inventario
**Ubicación:** `compras/gestion-compras/`

```typescript
// Al confirmar compra
const confirmarCompra = (compra: Compra) => {
  // Actualizar stock de productos
  compra.detalles.forEach(detalle => {
    actualizarStock(detalle.id_producto, detalle.cantidad);
  });
};
```

---

## 📋 Checklist de Migración

### Fase 1: Reorganización de Carpetas
- [ ] Crear estructura `/features/` por procesos
- [ ] Mover módulos a sus respectivos procesos
- [ ] Actualizar imports en todos los archivos

### Fase 2: Actualización de Menús
- [ ] Crear `MainLayoutPorProcesos.tsx`
- [ ] Agrupar menús por proceso
- [ ] Agregar iconos por proceso

### Fase 3: Permisos Granulares
- [ ] Actualizar tabla de permisos
- [ ] Implementar permisos por proceso/subproceso
- [ ] Validar accesos en cada vista

### Fase 4: Nuevas Funcionalidades
- [ ] Implementar "Dar de Baja" en Productos
- [ ] Implementar Recordatorios en Citas
- [ ] Implementar Actualización Automática de Inventario
- [ ] Mejorar Dashboard con métricas solicitadas

### Fase 5: Búsqueda
- [ ] Completar búsqueda en todos los módulos restantes

---

## 🎨 Diseño del Menú por Procesos

Menú lateral con secciones colapsables:

```
┌─────────────────────────┐
│  🏠 Dashboard           │
├─────────────────────────┤
│  ⚙️ CONFIGURACIÓN ▼    │
│    • Roles             │
├─────────────────────────┤
│  👥 USUARIOS ▼         │
│    • Usuarios          │
│    • Mi Perfil         │
├─────────────────────────┤
│  🛒 COMPRAS ▼          │
│    • Productos         │
│    • Proveedores       │
│    • Compras           │
│    • Devoluciones      │
├─────────────────────────┤
│  📅 AGENDAMIENTO ▼     │
│    • Servicios         │
│    • Citas             │
├─────────────────────────┤
│  💰 VENTAS ▼           │
│    • Clientes          │
│    • Catálogo          │
│    • Pagos             │
│    • Ventas            │
│    • Devoluciones      │
├─────────────────────────┤
│  📊 MEDICIÓN ▼         │
│    • Dashboard         │
│    • Reportes          │
└─────────────────────────┘
```

---

¡Con esta nueva arquitectura, el sistema estará perfectamente alineado con los procesos de negocio de la barbería! 🚀
