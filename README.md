# NesSnake (NS)

¡La evolución del clásico Snake! Un juego competitivo, multiplataforma (Web y Mobile), con estética pixel-art, controles táctiles y de teclado, y mecánicas innovadoras para partidas rápidas y profundas.

---

## Concepto

- **Simplicidad adictiva con profundidad competitiva:** NesSnake retoma la esencia de Snake y la lleva al siguiente nivel, ideal para duelos rápidos y torneos eSports.
- **Estilo retro con toque moderno:** Gráficos pixel art inspirados en la era NES, interfaz limpia y atractiva.
- **Diseñado para cualquier pantalla:** Experiencia fluida y optimizada en móvil y web.

---

## Características principales

- Duelos 1v1 en tiempo real.
- Mecánicas avanzadas: zonas dinámicas, ráfagas, ecos, colisiones y power-ups.
- UI/UX innovadora: menú "Cinta de Neón", feedback visual y sonoro.
- Multiplataforma: Web (Phaser 3 + TypeScript), Mobile (CapacitorJS).
- Backend opcional: Node.js/Express o Firebase para ecos y leaderboards.

---

## Fases de desarrollo

El desarrollo se organiza en fases iterativas:

1. **Preparación del entorno:** Estructura inicial, contenedor dev, README, build mínimo.
2. **MVP jugable:** Motor de trazado, colisiones, HUD básico, partida local 1v1.
3. **UI/UX y feedback:** Menú Neon Ribbon, animaciones, SFX, medidor de trazado.
4. **Mecánicas avanzadas:** Zonas de flujo dinámico, power-ups, IA para eventos.
5. **Multiplataforma y despliegue:** Empaquetado móvil, CI/CD, pruebas y publicación.

Más detalles en [`docs/Plan-and-phases.md`](docs/Plan-and-phases.md).

---

## Mecánicas innovadoras

- **Zonas de Flujo Dinámico:** Áreas que alteran reglas de movimiento (aceleración, ralentización, fantasma, bloqueo, eco-línea).
- **Interfaz Cinta de Neón:** Menú y navegación mediante trazos, integrando la mecánica central desde el inicio.
- **Eco-Puntaje Dinámico y Glitch Armónico:** Feedback visual y sonoro para eventos clave.

Consulta [`docs/Research.md`](docs/Research.md) y [`docs/kickoff.md`](docs/kickoff.md) para más ideas.

---

## Stack tecnológico

- **Frontend:** Phaser 3 + TypeScript, HTML5 Canvas, WebAudio, Spritesheets.
- **Mobile:** CapacitorJS (Android/iOS).
- **Backend:** Node.js + Express o Firebase (Firestore/Auth).
- **CI/CD:** GitHub Actions, Vercel/Netlify.
- **Arte/SFX:** Aseprite, Piskel, Bfxr, Chiptone.

Ver detalles en [`docs/Tech-stack.md`](docs/Tech-stack.md) y [`docs/Stack-tecnologico.md`](docs/Stack-tecnologico.md).

---

## Estructura del repositorio

```
nessnake/
├── .devcontainer/         # Entorno de desarrollo (VSCode, Docker)
├── docs/                  # Documentación, propuestas, fases, stack
├── src/                   # Código fuente principal (TypeScript, Phaser)
├── test_gemini.py         # Script de prueba para Gemini API
├── .env                   # Variables de entorno (API keys, etc.)
├── .gitignore             # Exclusiones de git
└── README.md              # Este archivo
```

---

## Cómo empezar

1. Clona el repositorio y entra al directorio:
   ```bash
   git clone <repo-url>
   cd nessnake
   ```
2. Instala dependencias y prepara el entorno (según stack elegido).
3. Usa el contenedor dev para desarrollo consistente.
4. Ejecuta el build/test/start según instrucciones del stack.

---

## Créditos y licencias

Desarrollado por chcordova y colaboradores. Consulta cada archivo para licencias y créditos específicos.

---

## Referencias

- [`docs/Plan-and-phases.md`](docs/Plan-and-phases.md)
- [`docs/Research.md`](docs/Research.md)
- [`docs/Tech-stack.md`](docs/Tech-stack.md)
- [`docs/Stack-tecnologico.md`](docs/Stack-tecnologico.md)
- [`docs/kickoff.md`](docs/kickoff.md)
