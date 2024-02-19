const p = /* @__PURE__ */ new Set([
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
function k(l) {
  const t = {
    ctrl: !1,
    shift: !1,
    alt: !1,
    // Option key on Macintosh
    meta: !1,
    // Command key on Macintosh
    key: l[l.length - 1],
  };
  for (const s of l.split("-")) {
    s.length == 1
      ? (t.ctrl = s == "C" || t.ctrl,
        t.shift = s == "S" || t.shift,
        t.alt = s == "A" || t.alt,
        t.meta = s == "M" || t.meta)
      : p.has(s) && (t.key = s === "space" ? " " : s === "dash" ? "-" : s);
  }
  if (t.key === void 0 || l[l.length - 1] === "-") {
    throw Error("Invalid binding sequence.");
  }
  return l.length == 1 &&
    (t.ctrl
      ? t.key = "control"
      : t.shift
      ? t.key = "shift"
      : t.alt
      ? t.key = "alt"
      : t.meta && (t.key = "meta")),
    t;
}
function u(l) {
  if (!document) {
    throw Error("Only support browser environment.");
  }
  l || (l = document);
  const t = /* @__PURE__ */ new Map();
  let s, d = !0;
  function c(n) {
    return ["control", "shift", "alt", "meta"].includes(n.toLowerCase());
  }
  function h(n) {
    if (d) {
      if (n.type == "keyup" && !c(n.key)) {
        s = n.key.toLowerCase();
      } else if (n.type == "keydown") {
        const o = {
          ctrl: n.ctrlKey,
          shift: n.shiftKey,
          alt: n.altKey,
          meta: n.metaKey,
          key: n.key.toLowerCase(),
        };
        for (const [f, a] of t.entries()) {
          const e = a, i = e.bindings[e.level];
          i.ctrl == o.ctrl && i.shift == o.shift && i.alt == o.alt &&
            o.key == i.key
            ? e.bindings.length == 1
              ? f()
              : (e.level == 0 || e.bindings[e.level - 1].key == s) &&
                (e.level++,
                  e.onComboChange instanceof Function &&
                  e.onComboChange(e.level),
                  e.level == e.bindings.length && (f(), e.level = 0))
            : (e.onComboChange instanceof Function && e.onComboChange(0),
              e.level = 0);
        }
      }
    }
  }
  l.addEventListener("keydown", h), l.addEventListener("keyup", h);
  let r = [];
  const y = (n) => r.push(n);
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
     * on("C-s a", () => {
     *   console.log("Press Ctrl+s and release, then press a.");
     * })
     */
    on(n, o, f = null) {
      const a = n.split(" ").filter((e) => e !== "");
      t.set(o, {
        bindings: a.map(k),
        level: 0,
        callback: o,
        onComboChange: f,
      });
    },
    /**
     * Remove the callback.
     */
    off(n) {
      t.delete(n);
    },
    /**
     * Enable kikey
     */
    enable() {
      d = !0;
    },
    /**
     * Disable kikey
     */
    disable() {
      d = !1;
    },
    startRecord() {
      l.addEventListener("keydown", y), l.addEventListener("keyup", y);
    },
    stopRecord() {
      l.removeEventListener("keydown", y), l.removeEventListener("keyup", y);
      let n = [];
      for (let o = 0; o < r.length; o++) {
        const f = r[o], a = o == r.length - 1 ? null : r[o + 1];
        if (f.type == "keydown" && (a === null || a.type == "keyup")) {
          let e = "";
          e += f.ctrlKey ? "C" : "",
            e += f.shiftKey ? "S" : "",
            e += f.altKey ? "A" : "",
            e += f.metaKey ? "M" : "",
            e = e.split("").join("-");
          let i = f.key.toLowerCase();
          i == " " ? i = "space" : i == "-" ? i = "dash" : c(i) && (i = null),
            e.length > 0 && i ? e += "-" + i : e.length == 0 && (e = i),
            n.push(e);
        }
      }
      return r = [], n.join(" ");
    },
  };
}
export { k as makeBinding, u as default };
