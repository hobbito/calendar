# Sistema de Gestión de Vacaciones

Sistema de calendario para controlar las vacaciones de los trabajadores de la empresa.

## Funcionalidades

### Gestión de Usuarios

- Dos roles: Admin y Empleado (pueden tener ambos roles)
- Perfil simple: email y teléfono

### Gestión de Vacaciones

- Cada usuario tiene asignado un número de días de vacaciones anuales (22 días por defecto)
- El administrador puede personalizar el número de días para cada empleado
- Al solicitar vacaciones para un rango de fechas, el sistema muestra los días laborables y festivos incluidos
- Opción para incluir/excluir fines de semana del cálculo de días de vacaciones
- Opción para incluir/excluir festivos del cálculo de días de vacaciones
- Flexibilidad para empleados que trabajan en días festivos o fines de semana
- El sistema calcula automáticamente los días efectivos según las opciones seleccionadas
- Seguimiento de días utilizados y disponibles
- Periodos de vacaciones definidos
- Alertas sobre políticas (no restricciones obligatorias)
- Solicitud y aprobación de vacaciones

### Calendario

- Vista mensual única
- Múltiples calendarios de festivos disponibles (integración con API)
- El administrador asigna a cada usuario el calendario de festivos que debe seguir
- Posibilidad de añadir festivos personalizados a cada calendario (festivos locales)
- El calendario será principalmente una visualización (no interactivo)
- Botón "Pedir vacaciones" que abrirá un modal para realizar la solicitud

### Notificaciones

- Alertas sobre solicitudes y aprobaciones

## Tecnologías

### Stack Tecnológico

- **Framework**: Astro con islas de interactividad
- **Componentes Reactivos**: Utilizaremos islas reactivas para:
  - Modal de solicitud de vacaciones
  - Formularios de administración
  - Navegación entre meses del calendario
- **Calendario**: Desarrollo propio (no se usarán bibliotecas externas)
- **Hosting**: Vercel
- **Base de datos**: Por definir (se buscará una opción gratuita)
- **API de Festivos**: Integración con API externa para obtener festivos por país/región

### Diseño

- Interfaz limpia y minimalista
- Diseño responsive para dispositivos móviles
- Código de colores para diferentes estados (aprobado, pendiente, rechazado)

## Próximos pasos

1. Configuración inicial del proyecto con Astro
2. Definición de modelos de datos
3. Implementación de autenticación
4. Desarrollo del componente de calendario
5. Implementación de la gestión de vacaciones
6. Configuración de calendarios de festivos
7. Desarrollo del panel de administración
