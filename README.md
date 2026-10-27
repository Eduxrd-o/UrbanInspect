# UrbanInspect - EPN ESFOT
- Eduardo Ganchala

Aplicación móvil desarrollada con Ionic + Angular Standalone + Capacitor para la gestión e inspección de infraestructura urbana en Quito.

## Decisiones Técnicas
- **Servicio Meteorológico:** Open-Meteo API (R4) - Ligero, sin API key y con datos de precipitación por hora.
- **Backend Simulado:** MockAPI (R2, R3, R5, R9) - Paginación nativa mediante parámetros HTTP `page` y `limit`.
- **Persistencia Local:** `@capacitor/preferences` (R1, R8) - Manejo nativo de borradores y seguimiento local en Android.

## Ejecuta la compilación e integración final con Android:
```bash
npm install
ionic build
npx cap sync android

