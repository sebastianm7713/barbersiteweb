# 📦 Migración a Carpeta /src

## ✅ Archivos Ya Actualizados

He actualizado automáticamente estos archivos:
- ✅ `/index.html` - Ahora apunta a `/src/main.tsx`
- ✅ `/vite.config.ts` - Alias `@` ahora apunta a `./src`
- ✅ `/src/main.tsx` - Creado
- ✅ `/src/App.tsx` - Creado

---

## 📋 Pasos para Completar la Migración

### Paso 1: Mover Carpetas a /src

Mueve las siguientes carpetas **desde la raíz** hacia **dentro de /src**:

```bash
# Ejecuta estos comandos en la terminal desde la raíz del proyecto:

# Crear carpeta src si no existe (ya debería existir)
mkdir -p src

# Mover carpetas
mv components src/
mv features src/
mv core src/
mv shared src/
mv lib src/
mv styles src/
mv contexts src/

# Si tienes alguna de estas carpetas, también muévelas:
# mv hooks src/
# mv utils src/
# mv types src/
```

### Paso 2: Eliminar Archivos Duplicados en Raíz

Después de mover las carpetas, elimina los archivos duplicados en la raíz:

```bash
rm App.tsx
rm main.tsx
```

### Paso 3: Verificar la Nueva Estructura

Tu proyecto debería verse así:

```
/
├── src/                          ← TODO DENTRO DE SRC
│   ├── App.tsx                   ← Componente principal
│   ├── main.tsx                  ← Punto de entrada
│   ├── components/               ← Componentes UI y views
│   ├── features/                 ← Módulos por funcionalidad
│   ├── core/                     ← Layout y componentes core
│   ├── shared/                   ← Utilidades compartidas
│   ├── lib/                      ← Mock data
│   ├── styles/                   ← Estilos globales
│   └── contexts/                 ← Contextos (si existe)
│
├── index.html                    ← HTML raíz (RAÍZ)
├── vite.config.ts                ← Configuración Vite (RAÍZ)
├── tsconfig.json                 ← TypeScript config (RAÍZ)
├── package.json                  ← NPM config (RAÍZ)
└── *.md                          ← Documentación (RAÍZ)
```

### Paso 4: Reiniciar el Servidor de Desarrollo

```bash
# Detén el servidor si está corriendo (Ctrl+C)
# Luego reinicia:
npm run dev
```

---

## 🔍 Verificación

Una vez completado, verifica que:

1. ✅ La aplicación carga sin errores
2. ✅ Todas las rutas funcionan correctamente
3. ✅ Los imports se resuelven correctamente
4. ✅ No hay advertencias de módulos no encontrados

---

## 🚨 Solución de Problemas

### Error: "Cannot find module"

Si ves errores de módulos no encontrados:

1. Verifica que **todas las carpetas** estén dentro de `/src`
2. Reinicia el servidor de desarrollo
3. Si persiste, limpia la caché:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Error: "Failed to resolve import"

Verifica que `vite.config.ts` tenga:
```typescript
alias: {
  '@': path.resolve(__dirname, './src'),
}
```

---

## 📝 Notas Importantes

- ✅ **NO toques** los archivos de configuración en la raíz (package.json, tsconfig.json, etc.)
- ✅ **NO muevas** los archivos .md de documentación
- ✅ **SÍ mueve** todo el código fuente (components, features, etc.) a `/src`
- ✅ Los **imports relativos** seguirán funcionando sin cambios
- ✅ Ahora puedes usar el alias `@` para imports desde la raíz de src:
  ```typescript
  import { Button } from '@/components/ui/button';
  ```

---

## ✨ Beneficios de Usar /src

1. **Organización Clara**: Separa código fuente de configuración
2. **Estándar de la Industria**: Estructura reconocible para otros desarrolladores
3. **Alias @**: Imports más limpios con `@/` en lugar de `../../`
4. **Escalabilidad**: Más fácil agregar herramientas de build

---

¡Listo! Tu proyecto ahora usa la estructura estándar con carpeta `/src` 🎉
