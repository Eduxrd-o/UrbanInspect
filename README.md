# UrbanInspect · Inspección de Infraestructura Urbana
**Escuela Politécnica Nacional (EPN) · ESFOT**  
**Asignatura:** Desarrollo de Aplicaciones Móviles  
**Estudiante:** Eduardo Ganchala  
**Tecnología:** Ionic Framework + Angular Standalone + Capacitor + TypeScript  

---

## 1. Descripción del Proyecto
UrbanInspect es una solución móvil diseñada para inspectores del Municipio del Distrito Metropolitano de Quito. Permite documentar en campo hallazgos e incidencias en la infraestructura urbana (baches, luminarias, señalización, alcantarillado, parques), capturar evidencia fotográfica, registrar coordenadas GPS, consultar condiciones climáticas en tiempo real para evaluar condiciones de mantenimiento, gestionar estados de atención técnica y conservar listas personales de seguimiento sin conexión a la oficina central.

---

## 2. Matriz de Cumplimiento de Requisitos (R1 - R10)

| Requisito | Descripción | Implementación Técnica | Ubicación en el Código |
| :--- | :--- | :--- | :--- |
| **R1. Seguimiento Local** (0.8 pts) | Marcar/desmarcar incidencias para seguimiento personal. Persiste localmente al cerrar la app y no se envía a la API. | Almacenamiento en `@capacitor/preferences` mediante clave `incidencias_seguimiento`. Filtro dedicado en el listado y acceso directo desde el menú inferior. | `src/app/services/storage.ts`<br>`src/app/pages/incidents-list/` |
| **R2. Consulta de Incidencias** (1.6 pts) | Visualización completa de los 8 campos: Código, Tipo, Descripción, Dirección, Sector, Fecha, Estado y Fotografía (o thumbnail). Manejo de estados de carga, listas vacías y fallos de red. | Componentes reactivos, tarjetas optimizadas para campo con previsualización fotográfica o iconografía temática, pipes de fecha y estados de error con reintento. | `src/app/pages/incidents-list/`<br>`src/app/pages/incident-detail/` |
| **R3. Carga Progresiva** (1.6 pts) | Paginación remota de 5 en 5 elementos (`?page=X&limit=5`). No descarga todo al teléfono. Se desactiva automáticamente al agotarse los datos. | `ion-infinite-scroll` con verificación de fin de registros (`hasMoreData = false`). | `src/app/services/incidents.ts`<br>`src/app/pages/incidents-list/` |
| **R4. Condiciones Meteorológicas** (0.8 pts) | Consulta de API meteorológica externa real mediante coordenadas. Muestra temperatura, precipitación de la última hora (mm) y condición. Advertencia si lluvia > 5 mm/h. Permite continuar si la API falla. | Integración con Open-Meteo Forecast API (`temperature_2m`, `precipitation`, `weather_code`). Mapeo de códigos WMO y manejo de contingencia sin bloqueo. | `src/app/services/weather.ts`<br>`src/app/pages/registro/` |
| **R5. Registro de Incidencias** (1.6 pts) | Formulario con tipo, descripción, dirección, sector y prioridad (baja, media, alta). Validación reactiva de campos obligatorios. En prioridad alta se exige fotografía. | Formulario reactivo (`FormGroup`, `Validators.required`) con validación explícita previa al envío HTTP POST hacia MockAPI. | `src/app/pages/registro/` |
| **R6. Evidencia Fotográfica** (1.6 pts) | Captura de foto con cámara y previsualización antes de guardar. Opción de eliminar fotografía. Si se cancela, los demás datos permanecen intactos. | `@capacitor/camera` con modo directo `CameraSource.Camera` y compatibilidad web mediante `@ionic/pwa-elements`. | `src/app/pages/registro/` |
| **R7. Ubicación de la Incidencia** (1.2 pts) | Obtención de GPS actual y consulta meteorológica asociada. En baches, la ubicación es obligatoria; si falla GPS, permite ingreso manual de coordenadas válidas. | `@capacitor/geolocation` con fallback a diálogo modal `AlertController` para ingreso manual de latitud y longitud. | `src/app/pages/registro/` |
| **R8. Recuperación de Borrador** (1.2 pts) | Si el inspector abandona el formulario o se cierra la app, al volver se ofrece continuar o descartar el borrador recuperando los datos. | Guardado reactivo continuo en `@capacitor/preferences` (`formulario_borrador`) y consulta modal en el ciclo de vida `ionViewWillEnter`. | `src/app/pages/registro/`<br>`src/app/services/storage.ts` |
| **R9. Actualización y Reglas de Estado** (1.6 pts) | Transición de *pendiente* a *en proceso* o *resuelta*; de *en proceso* a *resuelta*. Una resuelta no puede revertirse. Para resolver es obligatorio ingresar observación. Persistencia en la API. | Validación en `incident-detail.page.ts` y consumo HTTP PUT hacia MockAPI. Modal de resolución bloqueante si la observación está vacía. | `src/app/pages/incident-detail/`<br>`src/app/services/incidents.ts` |
| **R10. Navegación e Instalable** (0.8 pts) | Inicio con indicadores (KPIs), listado, seguimiento, detalle y registro. Reflejo inmediato de cambios y APK funcional. | Arquitectura basada en Angular Standalone con actualización reactiva en `ionViewWillEnter` y ordenamiento de MockAPI por fecha descendente. | `src/app/home/`<br>`src/app/app.routes.ts` |

---

## 3. Justificación de Decisiones Técnicas y Dependencias

1. **Angular Standalone Components:**  
   Se utiliza la arquitectura moderna de Angular sin `NgModule`, reduciendo el tamaño del bundle, agilizando el arranque en dispositivos móviles y facilitando la importación explícita de componentes Ionic.

2. **Backend Simulado con MockAPI:**  
   Se configuró un endpoint REST (`https://6ae10789be3bc8fead982fed.mockapi.io/api/v1/Incidents`) que implementa operaciones CRUD nativas y soporte para paginación remota (`?page=1&limit=5`) y ordenamiento (`?sortBy=fecha&order=desc`), cumpliendo fielmente con R2, R3, R5 y R9.

3. **Servicio Meteorológico con Open-Meteo:**  
   Se seleccionó Open-Meteo por ser un servicio meteorológico real, libre de claves privadas (cumpliendo con la prohibición de publicar credenciales en el repositorio), con soporte de latitud/longitud en alta resolución, precipitación por hora y códigos de condición WMO.

4. **Persistencia Local con `@capacitor/preferences`:**  
   Reemplaza al `localStorage` tradicional del navegador, asegurando que tanto los IDs de seguimiento (R1) como los borradores incompletos (R8) se almacenen de manera duradera y segura en el almacenamiento nativo de Android (SharedPreferences).

5. **Captura con `@capacitor/camera` y `@ionic/pwa-elements`:**  
   Garantiza acceso directo al hardware de cámara en Android con compresión adecuada (Base64 JPEG) para trabajo en campo, proveyendo a su vez compatibilidad con la webcam en entornos web de depuración.

---

## 4. Instrucciones de Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 20 o superior recomendada)
- Ionic CLI (`npm install -g @ionic/cli`)
- Android Studio con SDK configurado (para generación y prueba del APK)

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd UrbanInspect
npm install
```

### 2. Ejecutar en modo desarrollo local (Navegador)
```bash
ionic serve
```
La aplicación se abrirá en `http://localhost:8100`.

### 3. Compilación y sincronización con Android
```bash
npm run build
npx cap sync android
```

### 4. Abrir en Android Studio y generar el APK
```bash
npx cap open android
```
Desde Android Studio:
1. Ir a **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Una vez generado, localizar el archivo en `android/app/build/outputs/apk/debug/app-debug.apk` e instalarlo en el dispositivo o emulador mediante:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```


