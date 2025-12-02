# Sistema de Gestión de Reuniones

Sistema web para la coordinación y gestión de reuniones entre clientes y vendedores, desarrollado con Node.js, Express y PostgreSQL.

## Demo en Vivo

**URL:** [https://agenda-online-app.onrender.com/home](https://agenda-online-app.onrender.com/home)

### Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@empresa.com | admin123 |
| Vendedor | vendedor@empresa.com | vendedor123 |
| Cliente | cliente@empresa.com | cliente123 |

## Características Principales

### Clientes
- Exploración de catálogo de reuniones disponibles
- Sistema de agendamiento 1:1
- Visualización de reuniones activas y historial
- Dashboard con estadísticas personalizadas

### Vendedores
- Creación de reuniones públicas (catálogo) o privadas (asignación directa)
- Gestión completa de reuniones propias
- Reasignación de clientes
- Panel con estadísticas y próximas reuniones

### Administradores
- Gestión completa del sistema
- Métricas globales de reuniones y usuarios
- Control total sobre todas las reuniones

## Tecnologías

**Backend:** Node.js, Express.js, Sequelize, PostgreSQL, JWT, Bcrypt

**Frontend:** Handlebars, Bootstrap 5, JavaScript

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/sistema-reuniones.git
cd sistema-reuniones

# Instalar dependencias
npm install

# Configurar .env
PORT=8080
DB_NAME=nombre_base_datos
DB_USER=usuario
DB_PASSWORD=contraseña
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development

# Crear base de datos
createdb nombre_base_datos

# Iniciar servidor
npm start
```

El servidor estará disponible en `http://localhost:8080`

## Modelos de Base de Datos

### Usuario
```javascript
{
  nombre, email, password, 
  rol: 'cliente' | 'vendedor' | 'admin'
}
```

### Reunión
```javascript
{
  titulo, descripcion, fecha, hora, duracion,
  vendedorId, 
  estado: 'programada' | 'en_curso' | 'finalizada' | 'cancelada'
}
```

### UsuarioReunion (Tabla Intermedia)
```javascript
{
  usuarioId, reunionId,
  estado: 'inscrito' | 'confirmado' | 'cancelado',
  fechaInscripcion
}
```

## Relaciones

- **Usuario (vendedor) → Reunión:** 1:N (Un vendedor puede crear múltiples reuniones)
- **Usuario (cliente) ↔ Reunión:** N:M con restricción 1:1 (Cada reunión tiene máximo 1 cliente)

## Rutas Principales

### Autenticación
- `GET/POST /auth/register` - Registro
- `GET/POST /auth/login` - Inicio de sesión
- `GET /auth/logout` - Cerrar sesión

### Reuniones
- `GET /reuniones` - Catálogo disponible
- `GET /reuniones/new` - Crear reunión (Vendedor/Admin)
- `POST /reuniones` - Guardar reunión
- `GET /reuniones/:id` - Ver detalle
- `PUT /reuniones/:id` - Actualizar (Vendedor/Admin)
- `DELETE /reuniones/:id` - Eliminar (Vendedor/Admin)
- `POST /reuniones/:id/inscribirse` - Agendar (Cliente)
- `POST /reuniones/:id/cancelar` - Cancelar inscripción
- `GET /reuniones/mis-inscripciones` - Reuniones activas (Cliente)
- `GET /reuniones/gestionar` - Panel gestión (Vendedor/Admin)

### Dashboard
- `GET /home` - Página principal
- `GET /dashboard` - Panel de control personalizado

## Funcionalidades Destacadas

- **Reuniones públicas vs privadas:** Catálogo abierto o asignación directa
- **Actualización automática:** Estados se actualizan según fecha vencida
- **Sistema 1:1:** Una reunión, un cliente máximo
- **Reasignación:** Cambio de cliente con cancelación automática de inscripción anterior
- **Validación de permisos:** Vendedores solo gestionan sus reuniones
- **Seguridad:** JWT, bcrypt, HTTP-only cookies, validación de roles

## Seguridad

- Contraseñas encriptadas con bcrypt (factor 10)
- Autenticación JWT (expiración 2h)
- Cookies HTTP-only
- Validación de roles y permisos por ruta
- Sanitización de datos en servidor

## Scripts

```bash
npm start       # Iniciar servidor
npm run seed    # Crear usuarios de prueba
```

## Autor

**Jeibi - Javier Torres**

Proyecto académico - Módulo 9

## Licencia

Uso académico - Sin licencia comercial