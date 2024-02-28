import { describe, expect, test, vi } from "vitest";
import { makeBinding } from "./kikey";
import kikey from "./kikey";

describe("makeBinding", () => {
  test("pass illegal sequence", () => {
    expect(() => makeBinding("")).toThrow();
    expect(() => makeBinding("A--")).toThrow();
    expect(() => makeBinding("--")).toThrow();
  });
  test("pass legal sequence", () => {
    expect(makeBinding("C-s")).toEqual({
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      key: "s",
    });
    expect(makeBinding("C-S-s")).toEqual({
      ctrlKey: true,
      shiftKey: true,
      altKey: false,
      metaKey: false,
      key: "s",
    });
    expect(makeBinding("space")).toEqual({
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      key: " ",
    });
    expect(makeBinding("dash")).toEqual({
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      key: "-",
    });
    expect(makeBinding("A-M-dash")).toEqual({
      ctrlKey: false,
      shiftKey: false,
      altKey: true,
      metaKey: true,
      key: "-",
    });
    expect(makeBinding("escape")).toEqual({
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      key: "escape",
    });
  });
});

describe("keykey", () => {
  // helper
  function fire(type, { c = false, s = false, a = false, m = false, k }) {
    document.dispatchEvent(
      new KeyboardEvent(type, {
        ctrlKey: c,
        shiftKey: s,
        altKey: a,
        metaKey: m,
        key: k,
      }),
    );
  }
  function keydown(...args) {
    fire("keydown", ...args);
  }
  function keyup(...args) {
    fire("keyup", ...args);
  }

  const k = kikey();
  let callback;
  describe("single binding", () => {
    test("simple", () => {
      callback = vi.fn();
      k.on("C-s", callback);
      keydown({ c: true, k: "s" });
      expect(callback).toHaveBeenCalled();
      k.off(callback);
      keydown({ c: true, k: "s" });
      expect(callback).toHaveBeenCalledTimes(1);
    });
    test("symbol", () => {
      callback = vi.fn();
      k.on("`", callback);
      keydown({ k: "`" });
      expect(callback).toHaveBeenCalled();

      callback = vi.fn();
      k.on("space", callback);
      keydown({ k: " " });
      expect(callback).toHaveBeenCalled();
    });
    describe("special keys", () => {
      const SPECIAL_KEYS = [
        "arrowleft",
        "arrowright",
        "arrowup",
        "arrowdown",
        "backspace",
        "enter",
        "escape",
        "capslock",
        "tab",
        "home",
        "pageup",
        "pagedown",
        "end",
        "f1",
        "f2",
        "f3",
        "f4",
        "f5",
        "f6",
        "f7",
        "f8",
        "f9",
        "f10",
        "f11",
        "f12",
      ];
      for (const special of SPECIAL_KEYS) {
        test(special, () => {
          callback = vi.fn();
          k.on(special, callback);
          keydown({ k: special });
          expect(callback).toHaveBeenCalled();
        });
      }
    });
  });
  test("single modifier only binding", () => {
    callback = vi.fn();
    k.on("A", callback);
    keydown({ a: true, k: "alt" });
    expect(callback).toHaveBeenCalled();
  });
  test("double bindings", () => {
    callback = vi.fn();
    k.on("S-A-s a", callback);
    keydown({ s: true, a: true, k: "s" });
    keyup({ k: "s" });
    expect(callback).not.toHaveBeenCalled();
    keydown({ k: "a" });
    expect(callback).toHaveBeenCalled();

    callback = vi.fn();
    k.on("C a", callback);
    keydown({ c: true, k: "control" });
    keyup({ k: "control" });
    expect(callback).not.toHaveBeenCalled();
    keydown({ k: "a" });
    expect(callback).toHaveBeenCalled();

    callback = vi.fn();
    k.on("S S", callback);
    keydown({ s: true, k: "shift" });
    keyup({ k: "shift" });
    expect(callback).not.toHaveBeenCalled();
    keydown({ s: true, k: "shift" });
    expect(callback).toHaveBeenCalled();
  });
  test("triple bindings", () => {
    callback = vi.fn();
    k.on("a b c", callback);
    keydown({ k: "a" });
    keyup({ k: "a" });
    keydown({ k: "b" });
    keyup({ k: "b" });
    keydown({ k: "c" });
    keyup({ k: "c" });
    expect(callback).toHaveBeenCalled();

    callback = vi.fn();
    k.on("a b c", callback);
    keydown({ k: "a" });
    keydown({ k: "b" });
    keydown({ k: "c" });
    expect(callback).not.toHaveBeenCalled();
  });
});
