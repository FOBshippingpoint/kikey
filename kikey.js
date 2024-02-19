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
 * @param {string} sequence - key sequence, e.g. 「C-s」 or 「a」
 */
export function makeBinding(sequence) {
  const b = {
    ctrl: false,
    shift: false,
    alt: false, // Option key on Macintosh
    meta: false, // Command key on Macintosh
    key: sequence[sequence.length - 1],
  };

  for (const c of sequence.split("-")) {
    if (c.length == 1) {
      b.ctrl = c == "C" || b.ctrl;
      b.shift = c == "S" || b.shift;
      b.alt = c == "A" || b.alt;
      b.meta = c == "M" || b.meta;
    } else if (SPECIAL_KEYS.has(c)) {
      b.key = c === "space" ? " " : c === "dash" ? "-" : c;
    }
  }

  if (b.key === undefined || sequence[sequence.length - 1] === "-") {
    throw Error("Invalid binding sequence.");
  }

  if (sequence.length == 1) {
    if (b.ctrl) {
      b.key = "control";
    } else if (b.shift) {
      b.key = "shift";
    } else if (b.alt) {
      b.key = "alt";
    } else if (b.meta) {
      b.key = "meta";
    }
  }

  return b;
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
  let isEnabled = true;

  /**
   * @param {KeyboardEvent} e
   */
  function handleKeyEvent(e) {
    if (!isEnabled) {
      return;
    }

    if (e.type == "keyup") {
      prevKey = e.key.toLowerCase();
    } else if (e.type == "keydown") {
      const key = {
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
        key: e.key.toLowerCase(),
      };

      for (const [callback, binding] of registry.entries()) {
        const bd = binding;
        const b = bd.bindings[bd.level];
        if (
          b.ctrl == key.ctrl &&
          b.shift == key.shift &&
          b.alt == key.alt &&
          key.key == b.key
        ) {
          if (bd.bindings.length == 1) {
            callback();
          } else if (
            bd.level == 0 ||
            bd.bindings[bd.level - 1].key == prevKey
          ) {
            bd.level++;
            if (bd.level == binding.bindings.length) {
              callback();
              bd.level = 0;
            }
          }
        } else {
          // Reset binding level to zero because it breaks the order.
          bd.level = 0;
        }
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
     *
     * @example
     * on("C-s a", () => {
     *   console.log("Press Ctrl+s and release, then press a.");
     * })
     */
    on(sequence, callback) {
      // split by whitespace and remove empty characters
      const bindings = sequence.split(" ").filter((v) => v !== "");
      registry.set(callback, {
        bindings: bindings.map(makeBinding),
        level: 0,
        callback,
      });
    },
    /**
     * Remove the callback.
     */
    off(callback) {
      registry.delete(callback);
    },
    /**
     * Enable kikey
     */
    enable() {
      isEnabled = true;
    },
    /**
     * Disable kikey
     */
    disable() {
      isEnabled = false;
    },
    startRecord() {
      targetElement.addEventListener("keydown", pushEvent);
      targetElement.addEventListener("keyup", pushEvent);
    },
    stopRecord() {
      // Clean up
      targetElement.removeEventListener("keydown", pushEvent);
      targetElement.removeEventListener("keyup", pushEvent);

      let sequence = [];
      for (let i = 0; i < record.length; i++) {
        const slow = record[i];
        const fast = i == record.length - 1 ? null : record[i + 1];
        if (slow.type == "keydown" && (fast === null || fast.type == "keyup")) {
          let b = "";
          b += slow.ctrlKey ? "C" : "";
          b += slow.shiftKey ? "S" : "";
          b += slow.altKey ? "A" : "";
          b += slow.metaKey ? "M" : "";
          b = b.split("").join("-");

          let key = slow.key.toLowerCase();
          if (key == " ") {
            key = "space";
          } else if (key == "-") {
            key = "dash";
          } else if (["control", "shift", "alt", "meta"].includes(key)) {
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
      }
      record = [];
      return sequence.join(" ");
    },
  };
}
