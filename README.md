# Centro Psicopedagógico — Sistema de gestión

Aplicación institucional para el Centro de Atención Psicopedagógica (Programación Web II).

## Cómo ejecutar

Requisitos: Node.js 20+, MariaDB en ejecución.

1. Instalar dependencias e inicializar la base:

```bash
npm run setup
```

2. Levantar API y frontend juntos:

```bash
npm run dev
```

Abrir http://localhost:5173

Si MariaDB usa otras credenciales, editar `backend/.env`.

## Accesos de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@centro.com | Admin1234 |
| Profesional | c.ramirez@centro.com | hash123 |
| Profesional | m.gomez@centro.com | hash123 |

Los profesionales (`psicopedagoga`) acceden a evaluaciones, historial, estadísticas, configuración y turnera. El administrador además gestiona usuarios.

La contraseña de MariaDB configurada por defecto es `1234` (usuario `root`).
