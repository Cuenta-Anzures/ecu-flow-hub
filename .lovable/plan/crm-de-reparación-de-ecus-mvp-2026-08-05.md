# CRM de reparación de ECUs — MVP

Sistema para taller de cómputo/tecnología: recepción de ECUs en mostrador, seguimiento del ciclo de reparación, CRM de clientes, inventario operativo (~50 unidades) y dashboard.

## Fase 1 de este plan (lo que construyo ahora)

1. **Login** (pantalla de acceso) — solo email + contraseña, diseño oscuro "taller técnico": fondo grafito con textura de circuito, acento ámbar/cian, tipografía técnica, tarjeta flotante con marca del taller. Sin registro público: los usuarios los crea el administrador.
2. **Recepción de ECU** — el formulario central del mostrador, en un solo paso:
   - Buscar cliente existente (nombre / teléfono) o dar de alta uno nuevo en el mismo formulario.
   - Datos de la ECU: folio automático, modelo, año (opcional), número de parte (opcional), motivo de visita, falla reportada, observaciones, fecha/hora de ingreso automática, usuario que recibe.
   - Al guardar: estado inicial `Recibida`.
3. **Listado / tablero de ECUs** — búsqueda rápida por folio, cliente, teléfono, modelo o número de parte; filtro por estado; vista de detalle con historial.
4. **Flujo de estados con bitácora** — Recibida → En prueba de simulador → (No reparable) / Pendiente de asignación → Asignada a técnico → En revisión → Reparada / No reparada → Pendiente de entrega → Completada. Cada cambio guarda fecha, hora, usuario y motivo/observaciones; nada se borra.
5. **CRM de clientes** — expediente único con número de cliente autogenerado, nombre, empresa (opcional), teléfono (WhatsApp), correo, dirección, municipio, fecha de alta y observaciones; historial completo de reparaciones exitosas y no exitosas con fechas, técnico, modelo, comentarios y folios relacionados.
6. **Inventario operativo en tiempo real** — contadores de ECUs disponibles para venta, en reparación, reparadas pendientes de entrega y entregadas, con acceso al historial de movimientos de cada unidad.
7. **Diagnóstico del técnico** — al entrar En revisión: diagnóstico, observaciones, tiempo invertido y resultado (reparada con reparaciones realizadas y recomendaciones, o no reparada con motivo).
8. **Dashboard gerencial (indicadores base)** — reparaciones del día/mes/año, no reparadas mensual/anual, top 3 modelos más reparados y top 3 con más fallas, y los contadores de inventario.

## Fases siguientes (no en esta entrega)

- Módulo de ventas y sus indicadores (ventas diarias, semanales, mensuales, anuales, comparativo mensual, histórico anual, top 3 mejores meses).
- Notificaciones con contenido configurable por plantilla y envío real por WhatsApp/SMS vía n8n. En esta entrega solo se registran los eventos de notificación (ECU no reparable, reparada, lista para recoger) en la tabla `notificaciones`.
- Permisos por rol aplicados a cada pantalla (Administrador, Recepción, Técnico, Ventas). En esta entrega los roles se almacenan y se muestran, con restricciones básicas.
- Evidencias fotográficas en el diagnóstico.
- Exportación de reportes a Excel y PDF.


## Credenciales del MVP (ficticias)

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@ecutech.mx` | `EcuTaller2026!` |
| Recepción | `recepcion@ecutech.mx` | `Mostrador2026!` |
| Técnico | `tecnico@ecutech.mx` | `Taller2026!` |

Se crean como usuarios reales con confirmación automática, listos para entrar sin correo.

## Detalles técnicos

- **Base de datos PostgreSQL** en Lovable Cloud (Postgres administrado + autenticación). Tablas: `clientes`, `perfiles_usuario` + `roles_usuario`, `modelos_ecu`, `registros_ecu`, `historial_estados`, `diagnosticos`, `notificaciones`. Los roles van en tabla aparte por seguridad; RLS y permisos por tabla en cada migración.
- Folio consecutivo generado por secuencia en la base de datos (formato `ECU-2026-0001`).
- `historial_estados` es solo-inserción: es la bitácora inmutable y la fuente de los eventos que n8n leerá desde la base de datos. No implemento webhooks en la app.
- **Portabilidad a EasyPanel**: todo el esquema se escribe como SQL estándar de Postgres, sin dependencias exclusivas del proveedor fuera de la autenticación, para poder migrar la base a tu Postgres en EasyPanel más adelante. El despliegue en EasyPanel y el dominio propio quedan fuera de lo que puedo ejecutar aquí; la app se publica en Lovable y luego se migra.
- Interfaz responsiva (mostrador con PC y consulta desde móvil), en español.
