(function (r, y) {
  typeof exports == "object" && typeof module < "u"
    ? y(exports)
    : typeof define == "function" && define.amd
    ? define(["exports"], y)
    : (r = typeof globalThis < "u" ? globalThis : r || self, y(r.kikey = {}));
})(this, function (r) {
  "use strict";
  const y = new Set([
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
  function h(i) {
    const t = { ctrl: !1, shift: !1, alt: !1, meta: !1, key: i[i.length - 1] };
    for (const s of i.split("-")) {
      s.length == 1
        ? (t.ctrl = s == "C" || t.ctrl,
          t.shift = s == "S" || t.shift,
          t.alt = s == "A" || t.alt,
          t.meta = s == "M" || t.meta)
        : y.has(s) && (t.key = s === "space" ? " " : s === "dash" ? "-" : s);
    }
    if (t.key === void 0 || i[i.length - 1] === "-") {
      throw Error("Invalid binding sequence.");
    }
    return i.length == 1 &&
      (t.ctrl
        ? t.key = "control"
        : t.shift
        ? t.key = "shift"
        : t.alt
        ? t.key = "alt"
        : t.meta && (t.key = "meta")),
      t;
  }
  function b(i) {
    if (!document) throw Error("Only support browser environment.");
    i || (i = document);
    const t = new Map();
    let s, u = !0;
    function p(n) {
      return ["control", "shift", "alt", "meta"].includes(n.toLowerCase());
    }
    function k(n) {
      if (u) {
        if (n.type == "keyup" && !p(n.key)) s = n.key.toLowerCase();
        else if (n.type == "keydown") {
          const o = {
            ctrl: n.ctrlKey,
            shift: n.shiftKey,
            alt: n.altKey,
            meta: n.metaKey,
            key: n.key.toLowerCase(),
          };
          for (const [f, d] of t.entries()) {
            const e = d, l = e.bindings[e.level];
            l.ctrl == o.ctrl && l.shift == o.shift && l.alt == o.alt &&
              o.key == l.key
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
    i.addEventListener("keydown", k), i.addEventListener("keyup", k);
    let a = [];
    const c = (n) => a.push(n);
    return {
      on(n, o, f = null) {
        const d = n.split(" ").filter((e) => e !== "");
        t.set(o, {
          bindings: d.map(h),
          level: 0,
          callback: o,
          onComboChange: f,
        });
      },
      off(n) {
        t.delete(n);
      },
      enable() {
        u = !0;
      },
      disable() {
        u = !1;
      },
      startRecord() {
        i.addEventListener("keydown", c), i.addEventListener("keyup", c);
      },
      stopRecord() {
        i.removeEventListener("keydown", c), i.removeEventListener("keyup", c);
        let n = [];
        for (let o = 0; o < a.length; o++) {
          const f = a[o], d = o == a.length - 1 ? null : a[o + 1];
          if (f.type == "keydown" && (d === null || d.type == "keyup")) {
            let e = "";
            e += f.ctrlKey ? "C" : "",
              e += f.shiftKey ? "S" : "",
              e += f.altKey ? "A" : "",
              e += f.metaKey ? "M" : "",
              e = e.split("").join("-");
            let l = f.key.toLowerCase();
            l == " " ? l = "space" : l == "-" ? l = "dash" : p(l) && (l = null),
              e.length > 0 && l ? e += "-" + l : e.length == 0 && (e = l),
              n.push(e);
          }
        }
        return a = [], n.join(" ");
      },
    };
  }
  r.default = b,
    r.makeBinding = h,
    Object.defineProperties(r, {
      __esModule: { value: !0 },
      [Symbol.toStringTag]: { value: "Module" },
    });
});
