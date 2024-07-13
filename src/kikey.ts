import { makeBinding } from "./makeBinding";

/**
 * The key binding.
 * 
 * For example, `Ctrl + S` or `Alt + Shift + K`.
 */
export interface KeyBinding {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  key: string;
}

interface KeyBindingRegistry {
  bindings: KeyBinding[];
  combo: number;
  onComboChange: (combo: number) => void;
}

interface KikeyInstance {
  on: (
    sequence: string,
    callback?: () => void,
    onComboChange?: (combo: number) => void,
  ) => void;
  off: (callback: () => void) => void;
  enable: () => void;
  disable: () => void;
  startRecord: () => void;
  stopRecord: () => string;
}

/**
 * @param {HTMLElement} targetElement
 */
export default function Kikey(
  targetElement?: HTMLElement | Document,
): KikeyInstance {
  if (typeof document === "undefined") {
    throw Error("Only support browser environment.");
  }
  if (!targetElement) {
    targetElement = document;
  }

  const registry = new Map<() => void, KeyBindingRegistry>();

  let prevKey = "";
  let prevMod = "";
  let isEnabled = true;

  function isModifierKey(key: string): boolean {
    return ["control", "shift", "alt", "meta"].includes(key.toLowerCase());
  }

  function handleKeyEvent(e: KeyboardEvent): void {
    if (!isEnabled) return;

    if (e.type == "keyup" && !isModifierKey(e.key)) {
      prevKey = e.key.toLowerCase();
    } else if (e.type == "keydown") {
      const { ctrlKey, shiftKey, altKey, metaKey } = e;
      const key = e.key.toLowerCase();

      for (const [callback, binding] of registry.entries()) {
        const { onComboChange, combo, bindings } = binding;
        const b = bindings[combo];
        if (
          b.ctrlKey == ctrlKey &&
          b.shiftKey == shiftKey &&
          b.altKey == altKey &&
          b.metaKey == metaKey &&
          b.key == key &&
          (combo == 0 ||
            bindings[combo - 1].key == prevKey ||
            bindings[combo - 1].key == prevMod)
        ) {
          binding.combo++;
          onComboChange instanceof Function && onComboChange(binding.combo);
          if (binding.combo == bindings.length) {
            callback();
            binding.combo = 0;
          }
        } else {
          // Reset binding combo to zero because it breaks the order.
          onComboChange(combo);
          binding.combo = 0;
        }
      }

      if (isModifierKey(e.key)) {
        prevMod = e.key;
      }
    }
  }

  targetElement.addEventListener(
    "keydown",
    handleKeyEvent as (e: Event) => void,
  );
  targetElement.addEventListener("keyup", handleKeyEvent as (e: Event) => void);

  /** Event record */
  let record: KeyboardEvent[] = [];
  /** Event handler for key sequence recording. */
  const pushEvent = (e: KeyboardEvent) => {
    record.push(e);
  };

  return {
    /**
     * Listen on certain key sequence.
     *
     * Key sequence can be a single key, or combination of keys deliminated by '-' (dash).
     *
     * @param {string} sequence - Key sequence.
     * @param {Function} callback - The callback function.
     * @param {Function} onComboChange - The progress callback function.
     *
     * @example
     * kikey.on("C-s a", () => {
     *   console.log("Press Ctrl+s and release, then press a.");
     * })
     */
    on(
      sequence: string,
      callback: () => void = () => {},
      onComboChange: (combo: number) => void = () => {},
    ): void {
      // split by whitespace and remove empty characters
      const bindings = sequence
        .split(" ")
        .filter((v) => v !== "")
        .map(makeBinding);
      registry.set(callback, {
        bindings,
        combo: 0,
        onComboChange,
      });
    },
    /**
     * Remove the callback.
     */
    off(callback: () => void): void {
      registry.delete(callback);
    },
    /**
     * Enable kikey.
     */
    enable(): void {
      isEnabled = true;
    },
    /**
     * Disable kikey.
     */
    disable(): void {
      isEnabled = false;
    },
    /**
     * Start recording shortcut.
     */
    startRecord(): void {
      targetElement!.addEventListener(
        "keydown",
        pushEvent as (e: Event) => void,
      );
      targetElement!.addEventListener("keyup", pushEvent as (e: Event) => void);
    },
    /**
     * Stop recording shortcut.
     */
    stopRecord(): string {
      // Clean up
      targetElement!.removeEventListener(
        "keydown",
        pushEvent as (e: Event) => void,
      );
      targetElement!.removeEventListener(
        "keyup",
        pushEvent as (e: Event) => void,
      );

      const sequence: string[] = [];
      let slow = 0;
      let fast = 1;
      while (slow < record.length) {
        const slowKey = record[slow];
        if (slowKey.type == "keydown" && record.at(fast)?.type == "keyup") {
          let b = slowKey.ctrlKey ? "C" : "";
          b += slowKey.shiftKey ? "S" : "";
          b += slowKey.altKey ? "A" : "";
          b += slowKey.metaKey ? "M" : "";
          b = b.split("").join("-");

          let key = slowKey.key.toLowerCase();

          if (key == " ") {
            key = "space";
          } else if (key == "-") {
            key = "dash";
          } else if (isModifierKey(key)) {
            key = "";
          }
          if (b.length > 0 && key) {
            // Combination
            b += "-" + key;
          } else if (b.length == 0) {
            // Single key
            b = key;
          }
          sequence.push(b);
        }
        slow++;
        fast++;
      }
      record = [];
      return sequence.join(" ");
    },
  };
}
