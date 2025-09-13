import { test, expect } from "@playwright/test";

test.describe("Experiencia de usuario - MVP", () => {
  test("flujo completo: menú → juego → game over → menú", async ({ page }) => {
    // Suponiendo que el juego se sirve en localhost:3000
    await page.goto("http://localhost:3000");
    // Espera que el menú principal esté visible
    await expect(page.locator("text=Jugar")).toBeVisible();
    // Inicia el juego
    await page.click("text=Jugar");
    // Espera que el HUD y la Snake estén visibles
    await expect(page.locator("#hud")).toBeVisible();
    await expect(page.locator("#snake")).toBeVisible();
    // Simula movimiento y colisión para terminar el juego
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    // ...más acciones según lógica real...
    // Espera pantalla de game over
    await expect(page.locator("text=Game Over")).toBeVisible();
    // Vuelve al menú
    await page.click("text=Volver al menú");
    await expect(page.locator("text=Jugar")).toBeVisible();
  });
});
