# ✅ Checklist de Instalación y Verificación

## 📋 Pre-Instalación

- [ ] Node.js instalado (v18+)
  ```bash
  node --version
  # Debe mostrar: v18.x.x o superior
  ```

- [ ] npm instalado
  ```bash
  npm --version
  # Debe mostrar: 9.x.x o superior
  ```

- [ ] Visual Studio Code instalado
  ```bash
  code --version
  ```

## 📦 Instalación

- [ ] Proyecto descargado/clonado
- [ ] Carpeta abierta en VS Code
- [ ] Terminal integrada abierta (`Ctrl + Ñ`)
- [ ] Ejecutado: `npm install`
  - [ ] Sin errores
  - [ ] Carpeta `node_modules/` creada
  - [ ] Archivo `package-lock.json` creado

## 🚀 Ejecución

- [ ] Ejecutado: `npm run dev`
- [ ] Sin errores en terminal
- [ ] Mensaje de "ready in X ms" visible
- [ ] URL mostrada: `http://localhost:3000/`
- [ ] Navegador abierto automáticamente
- [ ] Landing page visible

## 🔐 Prueba de Login

### Admin
- [ ] Email: `admin@barberia.com`
- [ ] Password: `admin123`
- [ ] Login exitoso
- [ ] Dashboard visible
- [ ] Sidebar con todos los módulos
- [ ] Módulo "Mi Perfil" visible al inicio

### Barbero
- [ ] Email: `barbero@barberia.com`
- [ ] Password: `barbero123`
- [ ] Login exitoso
- [ ] Dashboard visible
- [ ] Módulos limitados visibles

### Cliente
- [ ] Email: `cliente@email.com`
- [ ] Password: `cliente123`
- [ ] Login exitoso
- [ ] Dashboard de catálogo visible
- [ ] Solo "Mi Perfil", "Dashboard" y "Citas" visibles

## 🎯 Verificación de Módulos (Admin)

- [ ] Mi Perfil
  - [ ] Avatar visible
  - [ ] Información del usuario
  - [ ] Botón "Editar Perfil"
  - [ ] Formulario funcional

- [ ] Dashboard
  - [ ] Estadísticas visibles
  - [ ] Gráficas renderizadas
  - [ ] Cards de resumen

- [ ] Roles
  - [ ] Lista de roles
  - [ ] Botón "Nuevo Rol"
  - [ ] Modal funcional

- [ ] Usuarios
  - [ ] Lista de usuarios
  - [ ] Paginación funcionando
  - [ ] Búsqueda funcional
  - [ ] Exportar funcional

- [ ] Productos
  - [ ] Lista de productos
  - [ ] Paginación funcionando (10 items por página)
  - [ ] Búsqueda funcional
  - [ ] Ver detalles funcional

- [ ] Proveedores
  - [ ] Lista de proveedores
  - [ ] CRUD funcional

- [ ] Compras
  - [ ] Lista de compras
  - [ ] Ver detalles funcional

- [ ] Ventas
  - [ ] Lista de ventas
  - [ ] Ver detalles funcional

- [ ] Devoluciones
  - [ ] Lista de devoluciones
  - [ ] Crear devolución funcional

- [ ] Consignaciones
  - [ ] Lista de consignaciones

- [ ] Servicios
  - [ ] Lista de servicios
  - [ ] Precios visibles

- [ ] Citas
  - [ ] Lista de citas
  - [ ] Estados visibles
  - [ ] Crear cita funcional

- [ ] Empleados
  - [ ] Lista de empleados
  - [ ] Información visible

- [ ] Clientes
  - [ ] Lista de clientes
  - [ ] Búsqueda funcional

- [ ] Pagos
  - [ ] Lista de pagos
  - [ ] Métodos de pago visibles

## 🎨 Verificación de UI/UX

- [ ] Tema negro y dorado aplicado
- [ ] Landing page premium visible
- [ ] Responsive en móvil
  - [ ] Menu hamburguesa funcional
  - [ ] Sidebar se oculta/muestra
  - [ ] Tablas responsive

- [ ] Responsive en tablet
- [ ] Responsive en desktop

## 🔧 Funcionalidades Generales

- [ ] Búsqueda funciona en todas las vistas
- [ ] Paginación funciona (ProductosView confirmado)
- [ ] Botones de acción responden
- [ ] Modales se abren/cierran
- [ ] Notificaciones (toast) funcionan
- [ ] Exportar a Excel/PDF funciona
- [ ] Logout funciona
- [ ] Navegación entre vistas funciona

## 📱 Pruebas de Permisos

- [ ] Admin ve todos los módulos
- [ ] Barbero NO ve: Roles, Usuarios, Proveedores, Compras, Consignaciones, Empleados, Pre-Registros
- [ ] Cliente solo ve: Mi Perfil, Dashboard (catálogo), Citas

## 🐛 Verificación de Errores

- [ ] No hay errores en consola del navegador (F12)
- [ ] No hay errores en terminal de VS Code
- [ ] No hay warnings críticos
- [ ] Todas las imágenes cargan correctamente

## 📊 Data Mock

- [ ] Datos de usuarios visibles
- [ ] Datos de productos visibles (50+ productos)
- [ ] Datos de servicios visibles
- [ ] Datos de empleados visibles
- [ ] Datos de clientes visibles
- [ ] Datos de citas visibles
- [ ] Datos de ventas visibles
- [ ] Datos de compras visibles

## 🎯 Features Avanzadas

- [ ] Filtros funcionan
- [ ] Ordenamiento funciona
- [ ] Detalles de items se muestran
- [ ] Estados se actualizan (pendiente/completado)
- [ ] Fechas se muestran correctamente
- [ ] Montos se formatean con $

## 📝 Código y Estructura

- [ ] Estructura de features clara
- [ ] Componentes organizados
- [ ] TypeScript sin errores
- [ ] Imports funcionando
- [ ] No hay archivos duplicados

## 🚀 Optimización

- [ ] Carga inicial rápida (< 3 segundos)
- [ ] Navegación fluida
- [ ] Sin lag en interacciones
- [ ] Imágenes optimizadas

## ✅ Final

- [ ] **TODO FUNCIONA CORRECTAMENTE** ✨
- [ ] Listo para desarrollo/personalización
- [ ] README.md leído
- [ ] Estructura entendida

---

## 📌 Si algo NO funciona:

1. ❌ Marca el checkbox que falló
2. 🔍 Revisa INSTALACION.md
3. 🐛 Busca el error específico
4. 💡 Consulta la sección de "Solución de Problemas"

## 🎉 Si todo está ✅:

**¡Felicidades! El proyecto está 100% funcional y listo para usar.**

Puedes comenzar a:
- Personalizar estilos
- Agregar funcionalidades
- Conectar a una API real
- Modificar datos mock
- Ajustar permisos
- Cambiar el tema

---

**Última actualización**: Noviembre 2025
