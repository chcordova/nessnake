# Tests de NesSnake

Este directorio contiene los tests automatizados del proyecto, incluyendo pruebas unitarias (Jest) y E2E/UI (Playwright).

## Dependencias necesarias

- **Jest**: Para pruebas unitarias de lógica y entidades.
  - `npm install --save-dev jest ts-jest @types/jest`
- **Playwright**: Para pruebas E2E/UI en navegador.
  - `npm install --save-dev playwright @playwright/test`
  - `npx playwright install`
  - `sudo npx playwright install-deps` (Linux)

## Estructura de tests

```
tests/
├── core.*.test.ts         # Unitarios Jest para entidades y lógica
├── scenes.*.test.ts       # Unitarios Jest para escenas
├── e2e/                   # Pruebas E2E/UI Playwright
│   ├── smoke.spec.ts      # Test mínimo de entorno
│   └── gameengine.spec.ts # Test avanzado de interacción JS/browser
└── README.md              # Este archivo
```

## Cómo ejecutar los tests

- **Unitarios (Jest):**
  ```bash
  npx jest
  ```
- **E2E/UI (Playwright):**
  ```bash
  npx playwright test tests/e2e/
  ```

## Detalle de los tests existentes

### Unitarios (Jest)

- `core.smoke.test.ts`: Instanciación de GameEngine, Snake, Player y Zone.
  - **Ejemplo de salida:**
    ```
    ✓ GameEngine se puede instanciar
    ✓ Snake se puede instanciar
    ...
    ```
- `core.logic.test.ts`: Atributos y relaciones mínimas de entidades.
  - Valida que Snake tenga posición, Player pueda asociarse a Snake, Zone acepte tipo.
- `core.engine.test.ts`: Métodos de GameEngine (agregar entidades, start/stop, getState).
  - Verifica que el engine gestione entidades y estados correctamente.
- `core.snake.test.ts`: Movimiento y cambio de dirección de Snake.
  - Prueba que Snake se desplace según dirección y pueda cambiarla.
- `core.collision.test.ts`: Colisiones de Snake (bordes y consigo mismo).
  - Detecta colisión con límites y con el propio cuerpo.
- `scenes.gamescene.mock.test.ts`: Mock de GameScene, instanciación y visualización de entidades.
  - Simula una escena de juego con entidades y expone su estado.
- `integration.scenes-ui.test.ts`: Pruebas de integración para navegación entre escenas (menú, juego, game over) y renderizado de UI (HUD, NeonRibbonMenu).
  - **Ejemplo de salida:**
    ```
    ✓ flujo completo: menú → juego → game over → menú
    ✓ HUD muestra y actualiza puntaje y mensaje
    ✓ NeonRibbonMenu permite navegar y seleccionar opciones
    ```

### E2E/UI (Playwright)

- `e2e/smoke.spec.ts`: Verifica que el entorno Playwright está listo.
  - **Ejemplo de salida:**
    ```
    ✓ El entorno de Playwright está listo
    ```
- `e2e/gameengine.spec.ts`: Simula la carga de GameEngine en el browser y manipulación básica (ejemplo avanzado, útil para integración real con frontend).
  - Carga una clase GameEngine en el contexto del navegador y valida su funcionamiento.
  - **Ejemplo de salida:**
    ```
    ✓ GameEngine puede ser instanciado y manipulado en el browser
    ```

## Buenas prácticas

- Usa TDD para nuevas features críticas.
- Mantén cobertura mínima en lógica de juego y adaptadores de plataforma.
- Documenta los casos de prueba relevantes en este archivo.
- Separa los tests unitarios (Jest) de los E2E/UI (Playwright) para evitar conflictos de entorno.

---

¿Dudas? Consulta la documentación de Jest y Playwright para más ejemplos y patrones de testing.
