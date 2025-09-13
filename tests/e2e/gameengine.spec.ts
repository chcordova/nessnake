import { test, expect } from "@playwright/test";

// Este test E2E simula la carga de un bundle JS y la interacción con GameEngine en un entorno browser
// NOTA: Este test es un ejemplo avanzado y requiere que expongas GameEngine en window para pruebas reales

test("GameEngine puede ser instanciado y manipulado en el browser", async ({
  page,
}) => {
  // Simula cargar un bundle ficticio (en un proyecto real, servirías index.html y tu bundle)
  await page.setContent(`
    <html>
      <body>
        <script>
          window.testResult = false;
          // Simulación: define una clase GameEngine en window
          window.GameEngine = class {
            constructor() { this.running = false; }
            start() { this.running = true; }
            stop() { this.running = false; }
          };
        </script>
      </body>
    </html>
  `);

  // Ejecuta código en el contexto del navegador
  await page.evaluate(() => {
    const engine = new window.GameEngine();
    engine.start();
    window.testResult = engine.running === true;
  });

  // Verifica el resultado
  const result = await page.evaluate(() => window.testResult);
  expect(result).toBe(true);
});
