import { test, expect } from "@playwright/test";

test("el recorrido de la serpiente permanece visible después de cuatro giros", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#play-btn").click();

  for (const key of [
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowUp",
    "ArrowUp",
    "ArrowRight",
    "ArrowRight",
  ]) {
    await page.keyboard.press(key);
  }

  const bounds = await page.locator("#game").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context is unavailable");

    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    let count = 0;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const index = (y * canvas.width + x) * 4;
        const red = image.data[index] ?? 0;
        const green = image.data[index + 1] ?? 0;
        const alpha = image.data[index + 3] ?? 0;

        if (alpha > 0 && green > 100 && green > red * 1.3) {
          count += 1;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    return { count, width: maxX - minX, height: maxY - minY };
  });

  expect(bounds.count).toBeGreaterThan(100);
  expect(bounds.width).toBeGreaterThan(100);
  expect(bounds.height).toBeGreaterThan(100);
});

test("el juego se adapta al viewport móvil sin overflow horizontal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#play-btn").click();

  const layout = await page.locator("#game").evaluate((canvas) => ({
    logicalWidth: canvas.width,
    logicalHeight: canvas.height,
    renderedWidth: canvas.getBoundingClientRect().width,
    renderedHeight: canvas.getBoundingClientRect().height,
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));

  expect(layout.logicalWidth).toBe(1200);
  expect(layout.logicalHeight).toBe(800);
  expect(layout.renderedWidth).toBeLessThan(layout.logicalWidth);
  expect(layout.renderedWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.documentWidth).toBe(layout.viewportWidth);

  for (const key of [
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowUp",
    "ArrowUp",
    "ArrowRight",
    "ArrowRight",
  ]) {
    await page.keyboard.press(key);
  }

  const visibleTrace = await page.locator("#game").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context is unavailable");

    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    let greenPixels = 0;
    for (let index = 0; index < image.data.length; index += 4) {
      const red = image.data[index] ?? 0;
      const green = image.data[index + 1] ?? 0;
      const alpha = image.data[index + 3] ?? 0;
      if (alpha > 0 && green > 100 && green > red * 1.3) greenPixels += 1;
    }
    return greenPixels;
  });

  expect(visibleTrace).toBeGreaterThan(100);
});
