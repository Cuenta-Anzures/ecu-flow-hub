# ECU Track Pro

Consideraciones adicionales para el MVP

El flujo del sistema inicia cuando el cliente llega físicamente al mostrador con una ECU. A partir de ese momento, el personal de recepción captura la información necesaria para comenzar el proceso de reparación.

El objetivo de la captura de datos es registrar la información mínima necesaria para dar seguimiento a la ECU durante todo su ciclo de vida. El formulario de recepción debe ser práctico y rápido para el personal.

Registro del cliente

El CRM debe almacenar únicamente la información necesaria para identificar y contactar al cliente.

Para el MVP se considera indispensable:

 Nombre del cliente.

 Número de teléfono (preferentemente el mismo que utiliza para WhatsApp).

 Correo electrónico (opcional).

 Empresa (opcional).

 Observaciones (opcional).

La información debe permitir localizar al cliente fácilmente durante el proceso y mantener un historial de sus reparaciones.

Registro de recepción de la ECU

Además de los datos del cliente, la recepción debe registrar la información relacionada con la visita al taller.

Como mínimo:

 Folio generado automáticamente.

 Cliente.

 Modelo de la ECU.

 Año (si aplica).

 Número de parte (opcional).

 Motivo de la visita.

 Descripción de la falla reportada por el cliente.

 Observaciones adicionales.

 Fecha y hora de ingreso.

 Usuario responsable de la recepción.

Este registro será el punto de inicio del flujo de trabajo descrito en el documento funcional.

Inventario

El taller maneja aproximadamente 50 ECUs, por lo que el inventario del MVP debe enfocarse en el control operativo de cada unidad y en su estado dentro del proceso de reparación, más que en un sistema complejo de almacén.

Infraestructura

El proyecto se desplegará utilizando EasyPanel como plataforma de administración de los servicios.

Para el MVP se considera la siguiente infraestructura:

 Base de datos PostgreSQL.

 Aplicación desplegada en EasyPanel.

 Dominio propio.

 Arquitectura preparada para crecer en futuras versiones.

Automatizaciones

El sistema deberá estar preparado para integrarse con n8n, pero n8n no forma parte del desarrollo del CRM ni de la lógica principal del sistema.

La aplicación únicamente deberá permitir emitir eventos (por ejemplo mediante Webhooks) cuando ocurran cambios importantes en el flujo de reparación.

Las automatizaciones, como el envío de mensajes de WhatsApp o futuras integraciones, serán responsabilidad de n8n y estarán desacopladas de la aplicación principal.

no te preocupes tanto por n8n los eventos se activan al notar cambios en la BD 
tendremos en la db estas tablas sql(posgres sql) (no es seguro al 100% pero es un acercamiento)
clientes

usuarios

registros_ecu

historial_estados

diagnosticos

notificaciones (opcional)

modelos_ecu (opcional)

Esto te lo digo como dato a tener en cuenta en mi proyecto y muy importante un login bonito que solo considere email y contraseña (seran datos ficticios osea email invnetado y contra inventada esos me debes decir para este mvp cuales osn als credenciales de acceso) el login debe ser bonito y pues es para un taller de computo y tecnologia asi que valla a corde

This project was built with [Suralogic](https://suralogic.dev).

## Build with Suralogic

Continue developing this project in the [Suralogic editor](https://suralogic.dev/projects/eedfd795-bbac-4d0f-a074-ee4df6a5c85c).

- **Ship faster**: describe what you want to build and Suralogic handles the code.
- **Stay in sync**: every change made in Suralogic is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Suralogic, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
