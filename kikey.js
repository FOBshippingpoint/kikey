/**
 * Special keys that the length were larger than 1.
 */
const SPECIAL_KEYS = new Set([
  "space",
  "dash",
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
]);

/**
 * @param {string} binding - key binding string, e.g. 「C-s」 or 「a」
 */
export function makeBinding(binding) {
  let ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
    key;

  for (const c of binding.split("-")) {
    if (c.length == 1) {
      ctrlKey = c == "C" || ctrlKey;
      shiftKey = c == "S" || shiftKey;
      altKey = c == "A" || altKey;
      metaKey = c == "M" || metaKey;
      key = c;
    } else if (SPECIAL_KEYS.has(c)) {
      key = c == "space" ? " " : c == "dash" ? "-" : c;
    } else {
      throw Error("Invalid binding.");
    }
  }

  if (binding.length == 1) {
    if (ctrlKey) {
      key = "control";
    } else if (shiftKey) {
      key = "shift";
    } else if (altKey) {
      key = "alt";
    } else if (metaKey) {
      key = "meta";
    }
  }

  return { ctrlKey, shiftKey, altKey, metaKey, key };
}

/**
 * @param {HTMLElement} targetElement
 */
export default function Kikey(targetElement) {
  if (!document) {
    throw Error("Only support browser environment.");
  }
  if (!targetElement) {
    targetElement = document;
  }

  const registry = new Map();

  let prevKey;
  let prevMod;
  let isEnabled = true;

  function isModifierKey(key) {
    return ["control", "shift", "alt", "meta"].includes(key.toLowerCase());
  }

  /**
   * @param {KeyboardEvent} e
   */
  function handleKeyEvent(e) {
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

  targetElement.addEventListener("keydown", handleKeyEvent);
  targetElement.addEventListener("keyup", handleKeyEvent);

  /** Event record */
  let record = [];
  /** Event handler for key sequence recording. */
  const pushEvent = (e) => record.push(e);

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
    on(sequence, callback = () => {}, onComboChange = () => {}) {
      // split by whitespace and remove empty characters
      const bindings = sequence.split(" ").filter((v) => v !== "").map(
        makeBinding,
      );
      registry.set(callback, {
        bindings,
        combo: 0,
        onComboChange,
      });
    },
    /**
     * Remove the callback.
     */
    off(callback) {
      registry.delete(callback);
    },
    /**
     * Enable kikey.
     */
    enable() {
      isEnabled = true;
    },
    /**
     * Disable kikey.
     */
    disable() {
      isEnabled = false;
    },
    /**
     * Start recording shortcut.
     */
    startRecord() {
      targetElement.addEventListener("keydown", pushEvent);
      targetElement.addEventListener("keyup", pushEvent);
    },
    /**
     * Stop recording shortcut.
     */
    stopRecord() {
      // Clean up
      targetElement.removeEventListener("keydown", pushEvent);
      targetElement.removeEventListener("keyup", pushEvent);

      const sequence = [];
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
            key = null;
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
