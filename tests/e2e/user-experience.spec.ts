import { test, expect } from "@playwright/test";

test.describe("Experiencia de usuario - MVP", () => {
  test("flujo completo: menú → juego → game over → menú", async ({ page }) => {
    // Suponiendo que el juego se sirve en localhost:3000
    await page.goto("http://localhost:3000");

    // Espera que el menú principal esté visible
    await expect(page.locator("#play-btn")).toBeVisible();

    // Inicia el juego
    await page.click("#play-btn");

    // Espera que el HUD esté visible (indica que el juego está activo)
    await expect(page.locator("#hud")).toBeVisible();
    await expect(page.locator("#game")).toBeVisible(); // Canvas del juego

    // Simula movimiento suficiente para trigger game over
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowLeft");

    // Espera pantalla de game over
    await expect(page.locator("text=Game Over")).toBeVisible();

    // Vuelve al menú
    await page.click("#menu-btn");
    await expect(page.locator("#play-btn")).toBeVisible();
  });
});
