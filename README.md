# Sistema de Gestión de Reuniones

Sistema web para la coordinación y gestión de reuniones entre clientes y vendedores, desarrollado con Node.js, Express y PostgreSQL.

## Descripción

Plataforma diseñada para facilitar la gestión de reuniones en entornos empresariales. Permite a los vendedores crear y administrar espacios de reunión, mientras que los clientes pueden explorar, agendar y gestionar sus citas de manera eficiente.

## Características Principales

### Para Clientes
- Exploración de catálogo de reuniones disponibles
- Agendamiento de reuniones con un sistema 1 a 1
- Visualización de reuniones activas y próximas
- Historial completo de reuniones pasadas
- Cancelación y reagendamiento de citas
- Dashboard personalizado con estadísticas

### Para Vendedores
- Creación y gestión de reuniones
- Panel de administración con estadísticas detalladas
- Visualización de clientes asignados a cada reunión
- Control de estados de reunión (programada, en curso, finalizada, cancelada)
- Vista de próximas reuniones con información de clientes
- Gestión exclusiva de reuniones propias

### Para Administradores
- Gestión completa de todas las reuniones del sistema
- Panel administrativo con métricas globales
- Estadísticas de vendedores y clientes
- Control total sobre estados y participantes

## Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT para autenticación
- Bcrypt.js para encriptación de contraseñas

### Frontend
- Handlebars (Express-Handlebars)
- Bootstrap 5
- Bootstrap Icons
- CSS personalizado con animaciones

### Herramientas
- Express-JWT para validación de tokens
- Cookie-Parser para manejo de cookies
- Method-Override para métodos HTTP PUT/DELETE
- Express-Session para gestión de sesiones

## Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- NPM o Yarn

## Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sistema-reuniones.git
cd sistema-reuniones
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:
```env
PORT=8080
DB_NAME=nombre_base_datos
DB_USER=usuario
DB_PASSWORD=contraseña
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=tu_secreto_jwt
SESSION_SECRET=tu_secreto_sesion
NODE_ENV=development
```

4. Crear la base de datos
```bash
createdb nombre_base_datos
```

5. Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en `http://localhost:8080`

## Estructura del Proyecto

```
proyecto/
├── src/
│   ├── config/
│   │   └── db.js                 # Configuración de Sequelize
│   ├── controllers/
│   │   ├── authController.js     # Controlador de autenticación
│   │   ├── homeController.js     # Controlador de vistas principales
│   │   └── reunionesController.js # Controlador de reuniones
│   ├── middlewares/
│   │   └── authMiddleware.js     # Middlewares de autenticación
│   ├── models/
│   │   ├── Usuario.js            # Modelo de Usuario
│   │   ├── Reunion.js            # Modelo de Reunión
│   │   ├── UsuarioReunion.js     # Tabla intermedia
│   │   └── associations.js       # Relaciones entre modelos
│   ├── routes/
│   │   ├── auth.js               # Rutas de autenticación
│   │   ├── home.js               # Rutas principales
│   │   └── reuniones.js          # Rutas de reuniones
│   └── views/
│       ├── layouts/
│       ├── partials/
│       ├── auth/
│       ├── home/
│       └── reuniones/
├── public/
│   ├── css/
│   ├── js/
│   └── img/
├── .env
├── server.js
└── package.json
```

## Modelos de Base de Datos

### Usuario
- `id`: INTEGER (PK)
- `nombre`: STRING
- `email`: STRING (UNIQUE)
- `password`: STRING (hash)
- `rol`: ENUM ('cliente', 'vendedor', 'admin')
- `createdAt`: DATE
- `updatedAt`: DATE

### Reunión
- `id`: INTEGER (PK)
- `titulo`: STRING
- `descripcion`: TEXT
- `fecha`: DATE
- `hora`: TIME
- `duracion`: INTEGER
- `vendedorId`: INTEGER (FK → Usuario)
- `estado`: ENUM ('programada', 'en_curso', 'finalizada', 'cancelada')
- `createdAt`: DATE
- `updatedAt`: DATE

### UsuarioReunion (Tabla Intermedia)
- `id`: INTEGER (PK)
- `usuarioId`: INTEGER (FK → Usuario)
- `reunionId`: INTEGER (FK → Reunion)
- `estado`: ENUM ('inscrito', 'confirmado', 'cancelado')
- `fechaInscripcion`: DATE
- `notasCliente`: TEXT
- `notasVendedor`: TEXT
- `createdAt`: DATE
- `updatedAt`: DATE

## Relaciones

- Usuario (vendedor) → Reunion: **1:N** (Un vendedor puede tener muchas reuniones)
- Usuario (cliente) ↔ Reunion: **N:M** (Sistema de inscripción 1 a 1 gestionado)

## Rutas Principales

### Autenticación
- `GET /auth/register` - Formulario de registro
- `POST /auth/register` - Crear cuenta
- `GET /auth/login` - Formulario de login
- `POST /auth/login` - Iniciar sesión
- `GET /auth/logout` - Cerrar sesión

### Reuniones (Requieren autenticación)
- `GET /reuniones` - Catálogo de reuniones disponibles
- `GET /reuniones/new` - Crear reunión (vendedor/admin)
- `POST /reuniones` - Guardar reunión (vendedor/admin)
- `GET /reuniones/:id` - Ver detalle
- `GET /reuniones/:id/edit` - Editar reunión (vendedor/admin)
- `PUT /reuniones/:id` - Actualizar reunión (vendedor/admin)
- `DELETE /reuniones/:id` - Eliminar reunión (vendedor/admin)
- `POST /reuniones/:id/inscribirse` - Agendar reunión (cliente)
- `POST /reuniones/:id/cancelar` - Cancelar inscripción (cliente)
- `GET /reuniones/mis-inscripciones` - Ver reuniones activas (cliente)
- `GET /reuniones/historial` - Ver historial (cliente)
- `GET /reuniones/gestionar` - Panel de gestión (vendedor/admin)
- `GET /reuniones/:id/participantes` - Ver cliente asignado (vendedor/admin)

### Dashboard
- `GET /home` - Página principal
- `GET /dashboard` - Panel con estadísticas (requiere autenticación)

## Características de Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación basada en JWT
- Validación de roles y permisos
- Protección de rutas según tipo de usuario
- Cookies HTTP-only para tokens
- Validación de datos en servidor

## Scripts Disponibles

```bash
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo con nodemon
npm test           # Ejecutar tests (si están configurados)
```

## Funcionalidades Adicionales

- Sistema de helpers de Handlebars para formateo de fechas y estados
- Carrusel de testimonios en página principal
- Dashboard dinámico con estadísticas por rol
- Animaciones CSS para mejor experiencia de usuario
- Diseño responsive adaptado a móviles y tablets
- Manejo de errores y validaciones en tiempo real

## Consideraciones de Desarrollo

- El proyecto usa `alter: true` en desarrollo para sincronización automática de modelos
- En producción, se recomienda usar migraciones de Sequelize
- Las reuniones tienen un sistema de cupos de 1 cliente por reunión
- Los estados se gestionan automáticamente según las acciones de los usuarios

## Autor

Desarrollado como proyecto académico del Módulo 9

## Licencia

Este proyecto es de uso académico y no tiene licencia comercial.