const v = /* @__PURE__ */ new Set([
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
  "f12"
]);
function L(n) {
  let r = !1, a = !1, y = !1, l = !1, s = "";
  for (const t of n.split("-"))
    if (t.length == 1)
      r = t == "C" || r, a = t == "S" || a, y = t == "A" || y, l = t == "M" || l, s = t;
    else if (v.has(t))
      s = t == "space" ? " " : t == "dash" ? "-" : t;
    else
      throw Error("Invalid binding.");
  return n.length == 1 && (r ? s = "control" : a ? s = "shift" : y ? s = "alt" : l && (s = "meta")), { ctrlKey: r, shiftKey: a, altKey: y, metaKey: l, key: s };
}
function C(n) {
  if (typeof document > "u")
    throw Error("Only support browser environment.");
  n || (n = document);
  const r = /* @__PURE__ */ new Map();
  let a = "", y = "", l = !0;
  function s(e) {
    return ["control", "shift", "alt", "meta"].includes(e.toLowerCase());
  }
  function t(e) {
    if (l) {
      if (e.type == "keyup" && !s(e.key))
        a = e.key.toLowerCase();
      else if (e.type == "keydown") {
        const { ctrlKey: c, shiftKey: d, altKey: p, metaKey: f } = e, o = e.key.toLowerCase();
        for (const [i, u] of r.entries()) {
          const { onComboChange: m, combo: h, bindings: b } = u, w = b[h];
          w.ctrlKey == c && w.shiftKey == d && w.altKey == p && w.metaKey == f && w.key == o && (h == 0 || b[h - 1].key == a || b[h - 1].key == y) ? (u.combo++, m instanceof Function && m(u.combo), u.combo == b.length && (i(), u.combo = 0)) : (m(h), u.combo = 0);
        }
        s(e.key) && (y = e.key);
      }
    }
  }
  n.addEventListener(
    "keydown",
    t
  ), n.addEventListener("keyup", t);
  let k = [];
  const K = (e) => {
    k.push(e);
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
    on(e, c = () => {
    }, d = () => {
    }) {
      const p = e.split(" ").filter((f) => f !== "").map(L);
      r.set(c, {
        bindings: p,
        combo: 0,
        onComboChange: d
      });
    },
    /**
     * Remove the callback.
     */
    off(e) {
      r.delete(e);
    },
    /**
     * Enable kikey.
     */
    enable() {
      l = !0;
    },
    /**
     * Disable kikey.
     */
    disable() {
      l = !1;
    },
    /**
     * Start recording shortcut.
     */
    startRecord() {
      n.addEventListener(
        "keydown",
        K
      ), n.addEventListener("keyup", K);
    },
    /**
     * Stop recording shortcut.
     */
    stopRecord() {
      var p;
      n.removeEventListener(
        "keydown",
        K
      ), n.removeEventListener(
        "keyup",
        K
      );
      const e = [];
      let c = 0, d = 1;
      for (; c < k.length; ) {
        const f = k[c];
        if (f.type == "keydown" && ((p = k.at(d)) == null ? void 0 : p.type) == "keyup") {
          let o = f.ctrlKey ? "C" : "";
          o += f.shiftKey ? "S" : "", o += f.altKey ? "A" : "", o += f.metaKey ? "M" : "", o = o.split("").join("-");
          let i = f.key.toLowerCase();
          i == " " ? i = "space" : i == "-" ? i = "dash" : s(i) && (i = ""), o.length > 0 && i ? o += "-" + i : o.length == 0 && (o = i), e.push(o);
        }
        c++, d++;
      }
      return k = [], e.join(" ");
    }
  };
}
export {
  C as default
};
