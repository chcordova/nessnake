import { test, expect } from "@playwright/test";

test("El entorno de Playwright está listo", async ({ page }) => {
  // Test mínimo: abrir una página en blanco
  await page.goto("about:blank");
  expect(page).toBeDefined();
});
