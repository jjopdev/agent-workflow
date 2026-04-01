# Guia de Contribucion

## Flujo de trabajo: solo mediante forks

Este proyecto **no acepta push directo a ninguna rama**, incluso para colaboradores. Toda contribucion debe llegar a traves de un fork y un Pull Request.

## Por que forks?

- Mantiene el historial del repositorio limpio y lineal.
- Garantiza que todo cambio pase por revision del dueno antes de integrarse.
- Protege la rama `main` de cambios accidentales o no revisados.

## Pasos para contribuir

1. **Fork** — Haz fork de este repositorio en tu cuenta de GitHub.
2. **Clonar** — Clona tu fork localmente:
   ```bash
   git clone https://github.com/<tu-usuario>/agent-workflow.git
   cd agent-workflow
   ```
3. **Rama** — Crea una rama descriptiva para tu cambio:
   ```bash
   git checkout -b feat/descripcion-corta
   ```
4. **Cambios** — Realiza tus modificaciones siguiendo las convenciones del proyecto.
5. **Push** — Empuja la rama a **tu fork** (no al repositorio original):
   ```bash
   git push origin feat/descripcion-corta
   ```
6. **Pull Request** — Abre un PR desde tu fork hacia `jjopdev/agent-workflow:main`.

## Requisitos del PR

- Debe pasar todas las verificaciones de estado (si las hay).
- Requiere aprobacion del dueno (`@jjopdev`) antes de poder fusionarse.
- El historial debe ser lineal — no se aceptan merge commits; usa `rebase` si es necesario.
- Las ramas se eliminan automaticamente tras el merge.

## Lo que NO esta permitido

- Push directo a `main` o cualquier otra rama del repositorio original.
- Force push sobre ramas protegidas.
- Eliminar ramas protegidas.

## Contacto

Si tienes preguntas, abre un Issue en el repositorio.
