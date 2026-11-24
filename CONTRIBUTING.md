# Cómo trabajar en AquaCheck

## Ramas
| Rama | Para qué |
|---|---|
| `main` | Producción (Vercel publica al recibir cambios). Solo se actualiza desde `develop` con un pull request. |
| `develop` | Integración. Aquí se juntan y se prueban las mejoras. |
| `feature/nombre` | Funciones nuevas. Salen de `develop`. |
| `fix/nombre` | Correcciones. Salen de `develop`. |
| `docs/nombre` | Documentación. |
| `chore/nombre` | Tareas de mantenimiento (CI, dependencias). |

## Pasos para un cambio
1. `git switch develop && git pull`
2. `git switch -c feature/nombre-corto`
3. Hacer cambios pequeños y commits con prefijo: `feat:`, `fix:`, `docs:`, `chore:`.
4. `npm run build` debe compilar sin errores.
5. Abrir un pull request hacia `develop` con la plantilla.
6. Cuando `develop` esté probado (incluida la prueba en celular real), pull request de `develop` a `main`.

## Reglas
- No subir claves, contraseñas, archivos `.env` ni QR con clave de hogares (están en la carpeta `_privado/`, que Git ignora; nunca usar `git add -f` con ella).
- No afirmar lo que no está hecho: no certificado, no auditado, intervalos referenciales.
- Los datos ficticios no se presentan como datos de familias reales.
