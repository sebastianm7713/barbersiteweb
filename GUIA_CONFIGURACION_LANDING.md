# 🎨 Guía de Configuración de Landing Page

## 📋 Descripción

El módulo **Config. Landing** permite al administrador personalizar completamente la apariencia de la landing page sin tocar código.

## 🔐 Acceso

1. Inicia sesión como **Administrador**:
   - Email: `admin@barberia.com`
   - Password: `admin123`

2. En el menú lateral, busca el módulo **"Config. Landing"** (con ícono de engranaje)

## ✨ Funcionalidades

### 1️⃣ Logo y Marca

**Logo Personalizado:**
- Pega la URL de tu logo (PNG, JPG, SVG)
- Si dejas el campo vacío, se usará el ícono de tijeras por defecto
- Vista previa instantánea del logo

**Ejemplo de URLs para probar:**
```
https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200
https://i.imgur.com/tuimagen.png
```

**Nombre del Negocio:**
- Cambia "Barbería Elite" por el nombre de tu negocio
- Se muestra en el header y footer

### 2️⃣ Imágenes de Fondo

Puedes personalizar 3 fondos diferentes:

**A) Fondo Hero (Sección Principal):**
- La imagen grande de la primera sección
- Recomendado: Imagen de barbería, sillas, ambiente
- Vista previa disponible

**B) Fondo Servicios:**
- Imagen de fondo para la sección de servicios
- Recomendado: Herramientas, productos, ambiente profesional

**C) Fondo Nosotros:**
- Imagen de fondo para la sección "Sobre Nosotros"
- Recomendado: Equipo, instalaciones, ambiente

**Fuentes de Imágenes Gratuitas:**
- Unsplash: https://unsplash.com/s/photos/barbershop
- Pexels: https://www.pexels.com/search/barber/
- Pixabay: https://pixabay.com/images/search/barbershop/

### 3️⃣ Textos de la Sección Hero

**Subtítulo (Badge):**
- Texto pequeño arriba del título principal
- Predeterminado: "Estilo • Elegancia • Excelencia"

**Título Principal:**
- El texto grande de bienvenida
- Predeterminado: "El Arte de la Barbería Clásica"
- Tip: Las últimas 2 palabras se muestran en dorado

**Descripción:**
- Texto descriptivo debajo del título
- Explica tu propuesta de valor

### 4️⃣ Información de Contacto

**Teléfono:**
- Formato: +1 (555) 123-4567
- Se muestra en la sección de contacto

**Email:**
- Email de contacto del negocio
- Se muestra en la sección de contacto

**Dirección:**
- Dirección física de tu barbería
- Usa saltos de línea si es necesario

### 5️⃣ Estadísticas

**Años de Experiencia:**
- Ejemplo: "10+", "15+", "20+"
- Se muestra en la sección "Sobre Nosotros"

**Clientes Satisfechos:**
- Ejemplo: "5000+", "10K+", "15000+"
- Se muestra en la sección "Sobre Nosotros"

## 💾 Guardar Cambios

### Opción 1: Guardar Durante la Edición
- Haz clic en **"Guardar Cambios"** (botón dorado arriba a la derecha)
- Los cambios se guardan en el navegador (localStorage)
- Verás una notificación de confirmación

### Opción 2: Guardar al Final
- Haz todos tus cambios
- Haz clic en **"Guardar Todos los Cambios"** (botón dorado al final)

## 🔄 Restaurar Valores por Defecto

Si quieres volver a la configuración original:

1. Haz clic en **"Restaurar"** o **"Restaurar Valores por Defecto"**
2. Confirma la acción
3. Los valores originales se restaurarán

## 👀 Ver los Cambios

1. Después de guardar, cierra sesión
2. Verás la landing page con tus cambios aplicados
3. También puedes abrir en modo incógnito para ver la landing

## 📝 Notas Importantes

### ✅ Formato de URLs de Imágenes

Las URLs deben comenzar con `http://` o `https://`

**Correcto:**
```
https://images.unsplash.com/photo-123456?w=1600
https://ejemplo.com/mi-imagen.jpg
```

**Incorrecto:**
```
www.ejemplo.com/imagen.jpg  ❌
ejemplo.com/imagen.jpg      ❌
/imagenes/foto.jpg          ❌
```

### ✅ Imágenes Recomendadas

**Tamaño:**
- Hero: 1920x1080px o mayor
- Servicios/Nosotros: 1600x900px o mayor

**Formato:**
- JPG, PNG, WebP
- Evita GIF animados para fondos

**Peso:**
- Idealmente menos de 500KB
- Usa herramientas de compresión si es necesario

### ✅ Persistencia de Datos

- Los cambios se guardan en `localStorage` del navegador
- Si borras los datos del navegador, se perderán los cambios
- Para producción, considera guardar en una base de datos

## 🎯 Ejemplo Completo

```javascript
Logo: https://i.imgur.com/milogo.png
Nombre: Mi Barbería Moderna

Hero Background: https://images.unsplash.com/photo-1667539916671-b9e7039ccee5?w=1600
Services Background: https://images.unsplash.com/photo-1656921350183-7935040cf7fb?w=1600
About Background: https://images.unsplash.com/photo-1674287146797-87c893c7407a?w=1600

Hero Subtitle: Estilo • Profesionalismo • Tradición
Hero Title: La Mejor Barbería de la Ciudad
Hero Description: Más de 15 años brindando el mejor servicio de barbería con profesionales certificados.

Contact Phone: +52 (55) 1234-5678
Contact Email: contacto@mibarberia.com
Contact Address: Av. Principal 456, Col. Centro, Ciudad

Years Experience: 15+
Happy Clients: 8000+
```

## 🚀 Tips Pro

1. **Usa imágenes de calidad:** La primera impresión cuenta
2. **Mantén coherencia:** Usa imágenes con estilo similar
3. **Prueba en móvil:** Verifica que se vea bien en todos los dispositivos
4. **Actualiza regularmente:** Cambia imágenes por temporadas o promociones
5. **Guarda las URLs:** Anota las URLs que funcionen bien

## ❓ Troubleshooting

**Problema: La imagen no se muestra**
- Verifica que la URL sea correcta
- Asegúrate de que comience con https://
- Prueba la URL en otra pestaña del navegador
- Verifica que la imagen sea pública

**Problema: Los cambios no se guardan**
- Haz clic en "Guardar Cambios"
- Verifica la notificación de éxito
- Recarga la página de configuración

**Problema: Quiero volver atrás**
- Usa el botón "Restaurar Valores por Defecto"
- O edita manualmente los campos

## 📞 Soporte

Si tienes problemas con la configuración:
1. Verifica la consola del navegador (F12)
2. Prueba en modo incógnito
3. Limpia el caché del navegador

---

¡Listo! Ahora puedes personalizar tu landing page completamente sin tocar código 🎉
