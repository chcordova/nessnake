/**
 * @jest-environment jsdom
 */

import { WebInputAdapter } from "../src/platform/web/WebInputAdapter";
import { MobileInputAdapter } from "../src/platform/mobile/MobileInputAdapter";

describe("Integración: InputAdapters multiplataforma", () => {
  describe("WebInputAdapter", () => {
    it("emite evento 'move' al presionar flechas", () => {
      const adapter = new WebInputAdapter();
      const moves = [];
      adapter.on("move", (dir) => moves.push(dir));
      const event = new window.KeyboardEvent("keydown", { key: "ArrowUp" });
      window.dispatchEvent(event);
      expect(moves).toContain("up");
      adapter.detach();
    });
    it("emite evento 'action' al presionar espacio", () => {
      const adapter = new WebInputAdapter();
      let action = false;
      adapter.on("action", () => (action = true));
      const event = new window.KeyboardEvent("keydown", { key: " " });
      window.dispatchEvent(event);
      expect(action).toBe(true);
      adapter.detach();
    });
  });

  describe("MobileInputAdapter", () => {
    it("emite evento 'move' al simular gesto", () => {
      const adapter = new MobileInputAdapter();
      const moves = [];
      adapter.on("move", (dir) => moves.push(dir));
      adapter.simulateMove("left");
      expect(moves).toContain("left");
      adapter.detach();
    });
    it("emite evento 'action' al simular tap", () => {
      const adapter = new MobileInputAdapter();
      let action = false;
      adapter.on("action", () => (action = true));
      adapter.simulateAction();
      expect(action).toBe(true);
      adapter.detach();
    });
  });
});
