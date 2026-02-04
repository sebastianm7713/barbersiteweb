# 🚀 Pasos para Instalar en Visual Studio Code

## 📋 Resumen Rápido

**¿Ya tienes el proyecto en VS Code?** → Ve a la sección "Solo Actualización"

**¿Proyecto completamente nuevo?** → Ve a la sección "Instalación Completa"

---

## 🆕 Instalación Completa (Proyecto Nuevo)

### Paso 1: Preparar la Carpeta

```bash
# Windows
cd C:\Proyectos
mkdir barberia-elite-gestion
cd barberia-elite-gestion

# Mac/Linux
cd ~/Proyectos
mkdir barberia-elite-gestion
cd barberia-elite-gestion
```

### Paso 2: Copiar TODOS los Archivos

Copia toda la estructura del proyecto a esta carpeta. Debe quedar así:

```
barberia-elite-gestion/
├── features/
├── components/
├── core/
├── shared/
├── styles/
├── App.tsx
├── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── ... (todos los archivos)
```

### Paso 3: Abrir en VS Code

```bash
# Desde la terminal
code .

# O desde VS Code:
# File → Open Folder → Selecciona "barberia-elite-gestion"
```

### Paso 4: Instalar Dependencias

```bash
# En la terminal de VS Code (Ctrl + Ñ)
npm install
```

⏳ **Espera 2-5 minutos** (solo la primera vez)

### Paso 5: Ejecutar

```bash
npm run dev
```

✅ **¡Listo!** Se abrirá en `http://localhost:3000`

---

## 🔄 Solo Actualización (Ya tienes el proyecto)

### Archivos que Necesitas Agregar/Modificar:

#### ✨ NUEVOS (Copiar):

**1. Carpeta nueva:**
```
/features/configuracion-landing/
```

**2. Archivos dentro:**
```
/features/configuracion-landing/components/ConfiguracionLandingView.tsx
/features/configuracion-landing/index.tsx
```

**3. Guía (opcional):**
```
/GUIA_CONFIGURACION_LANDING.md
```

#### 🔧 MODIFICADOS (Reemplazar):

**1. Landing Page:**
```
/components/LandingPage.tsx
```
- Ahora lee configuración de localStorage
- Soporta logo personalizado
- Usa fondos configurables

**2. Main Layout:**
```
/core/layout/MainLayout.tsx
```
- Agregado módulo "Config. Landing" al menú (línea ~27: import Settings)
- Agregado al array menuItems (última línea del array)

**3. App Principal:**
```
/App.tsx
```
- Import de ConfiguracionLandingView (línea ~24)
- Case 'configuracion-landing' en renderView()

**4. README:**
```
/README.md
```
- Actualizada la lista de funcionalidades

---

## 📝 Checklist de Verificación

### ✅ Antes de Empezar

- [ ] Node.js instalado (v18+)
- [ ] npm funcionando
- [ ] Visual Studio Code instalado

### ✅ Estructura de Carpetas

- [ ] `/features/configuracion-landing/` existe
- [ ] `/features/configuracion-landing/components/` existe
- [ ] `/features/configuracion-landing/components/ConfiguracionLandingView.tsx` existe
- [ ] `/features/configuracion-landing/index.tsx` existe

### ✅ Archivos Modificados

- [ ] `/components/LandingPage.tsx` tiene las nuevas líneas (imports, useEffect, config)
- [ ] `/core/layout/MainLayout.tsx` tiene import de Settings
- [ ] `/core/layout/MainLayout.tsx` tiene 'configuracion-landing' en menuItems
- [ ] `/App.tsx` tiene import de ConfiguracionLandingView
- [ ] `/App.tsx` tiene case 'configuracion-landing'

### ✅ Instalación

- [ ] `npm install` ejecutado sin errores
- [ ] Carpeta `node_modules/` creada
- [ ] `npm run dev` funciona
- [ ] Abre en `http://localhost:3000`

### ✅ Funcionalidad

- [ ] Login como admin funciona
- [ ] Módulo "Config. Landing" visible en el menú
- [ ] Al hacer clic en "Config. Landing" se abre la vista
- [ ] Puedo editar campos
- [ ] Botón "Guardar Cambios" funciona
- [ ] Notificación de éxito aparece
- [ ] Al cerrar sesión, la landing muestra los cambios

---

## 🎯 Método Rápido: Solo los Cambios Necesarios

Si ya tienes el proyecto funcionando, **solo haz esto**:

### 1️⃣ Crear la carpeta nueva

En VS Code, en la carpeta `/features/`:

```
Clic derecho → New Folder → "configuracion-landing"
Clic derecho en configuracion-landing → New Folder → "components"
```

### 2️⃣ Crear los archivos nuevos

**Archivo 1:** `/features/configuracion-landing/components/ConfiguracionLandingView.tsx`
- Clic derecho en `/components/` → New File
- Copia el código completo

**Archivo 2:** `/features/configuracion-landing/index.tsx`
- New File en `/features/configuracion-landing/`
- Copia: `export { ConfiguracionLandingView } from './components/ConfiguracionLandingView';`

### 3️⃣ Actualizar archivos existentes

**LandingPage.tsx:** Agregar al inicio (después de imports):

```typescript
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingConfig {
  logo: string;
  businessName: string;
  heroBackground: string;
  servicesBackground: string;
  aboutBackground: string;
  // ... (copiar interface completa)
}

const defaultConfig: LandingConfig = {
  // ... (copiar objeto completo)
};
```

Dentro de `export function LandingPage({ onGetStarted })`:

```typescript
const [config, setConfig] = useState<LandingConfig>(defaultConfig);

useEffect(() => {
  const savedConfig = localStorage.getItem('landingConfig');
  if (savedConfig) {
    try {
      setConfig(JSON.parse(savedConfig));
    } catch {
      setConfig(defaultConfig);
    }
  }
}, []);
```

Cambiar todas las URLs hardcodeadas por `config.heroBackground`, `config.businessName`, etc.

**MainLayout.tsx:** Agregar al import de iconos:

```typescript
import { Settings } from 'lucide-react';
```

Al final del array `menuItems`:

```typescript
{ id: 'configuracion-landing', label: 'Config. Landing', icon: Settings, adminOnly: true },
```

**App.tsx:** Agregar al inicio:

```typescript
import { ConfiguracionLandingView } from './features/configuracion-landing';
```

En el switch de `renderView()`, antes del default:

```typescript
case 'configuracion-landing':
  return <ConfiguracionLandingView />;
```

### 4️⃣ Guardar todo y probar

```bash
# Si el servidor está corriendo, se recargará automáticamente
# Si no, ejecuta:
npm run dev
```

---

## ❓ Preguntas Frecuentes

### ¿Necesito reinstalar npm?

**No**, solo si es proyecto completamente nuevo.

Si ya tienes `node_modules/`, no necesitas volver a hacer `npm install`.

### ¿Dónde pego los códigos?

**Opción A:** Copia y pega directamente en VS Code
- Clic derecho → New File
- Pega el código
- Ctrl+S para guardar

**Opción B:** Desde archivos descargados
- Arrastra los archivos desde el explorador de Windows/Mac
- Suéltalos en la carpeta correcta de VS Code

### ¿Cómo sé que funcionó?

1. No hay errores en la terminal de VS Code
2. El navegador abre en `http://localhost:3000`
3. Ves la landing page
4. Puedes hacer login como admin
5. Ves "Config. Landing" en el menú

### ¿Puedo borrar archivos viejos?

**Cuidado:** No borres archivos a menos que estés 100% seguro.

Archivos seguros para borrar (si existen):
- `/components/views/*` (son duplicados, están en `/features/`)

Archivos que NO debes borrar:
- Nada en `/components/ui/`
- Nada en `/components/figma/`
- Nada en `/node_modules/`

---

## 🆘 Solución de Problemas

### Error: "Cannot find module 'configuracion-landing'"

**Solución:**
1. Verifica que creaste `/features/configuracion-landing/`
2. Verifica que existe `index.tsx` dentro
3. Verifica que el código de `index.tsx` es exactamente:
   ```typescript
   export { ConfiguracionLandingView } from './components/ConfiguracionLandingView';
   ```

### Error: "Property 'logo' does not exist"

**Solución:**
1. Verifica que copiaste la interface `LandingConfig` completa
2. Verifica que copiaste el objeto `defaultConfig` completo
3. Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

### La landing no muestra los cambios

**Solución:**
1. Verifica que guardaste los cambios en `LandingPage.tsx`
2. Borra localStorage: F12 → Application → Local Storage → Clear All
3. Recarga la página (Ctrl+R o F5)

### El módulo no aparece en el menú

**Solución:**
1. Verifica que agregaste `Settings` al import en `MainLayout.tsx`
2. Verifica que agregaste la línea al array `menuItems`
3. Verifica que estás logueado como **admin** (no barbero ni cliente)

---

## ✅ Verificación Final

Después de todo, ejecuta:

```bash
npm run dev
```

Deberías ver:
```
✓ VITE ready in XXX ms
➜ Local: http://localhost:3000/
```

Abre el navegador y:
1. ✅ Landing page se ve bien
2. ✅ Login funciona
3. ✅ Menu "Config. Landing" visible
4. ✅ Vista de configuración funciona
5. ✅ Guardar cambios funciona
6. ✅ Landing muestra cambios

---

## 🎉 ¡Todo Listo!

Si llegaste aquí sin errores, **¡felicidades!** 

Tu proyecto está completamente funcional con el nuevo módulo de configuración de landing page.

**Siguiente paso:** Lee `GUIA_CONFIGURACION_LANDING.md` para aprender a usar el módulo.

---

**Creado:** Noviembre 2025  
**Última actualización:** Noviembre 2025
