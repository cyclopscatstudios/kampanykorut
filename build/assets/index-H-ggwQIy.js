var TE = Object.defineProperty;
var AE = (t, a, r) =>
  a in t
    ? TE(t, a, { enumerable: !0, configurable: !0, writable: !0, value: r })
    : (t[a] = r);
var Ft = (t, a, r) => AE(t, typeof a != "symbol" ? a + "" : a, r);
(function () {
  const a = document.createElement("link").relList;
  if (a && a.supports && a.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) l(s);
  new MutationObserver((s) => {
    for (const u of s)
      if (u.type === "childList")
        for (const f of u.addedNodes)
          f.tagName === "LINK" && f.rel === "modulepreload" && l(f);
  }).observe(document, { childList: !0, subtree: !0 });
  function r(s) {
    const u = {};
    return (
      s.integrity && (u.integrity = s.integrity),
      s.referrerPolicy && (u.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === "use-credentials"
        ? (u.credentials = "include")
        : s.crossOrigin === "anonymous"
          ? (u.credentials = "omit")
          : (u.credentials = "same-origin"),
      u
    );
  }
  function l(s) {
    if (s.ep) return;
    s.ep = !0;
    const u = r(s);
    fetch(s.href, u);
  }
})();
var Bi =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
      ? window
      : typeof global < "u"
        ? global
        : typeof self < "u"
          ? self
          : {};
function Oo(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default")
    ? t.default
    : t;
}
var Gs = { exports: {} },
  ed,
  wm;
function RE() {
  if (wm) return ed;
  wm = 1;
  var t = 1e3,
    a = t * 60,
    r = a * 60,
    l = r * 24,
    s = l * 7,
    u = l * 365.25;
  ed = function (y, v) {
    v = v || {};
    var E = typeof y;
    if (E === "string" && y.length > 0) return f(y);
    if (E === "number" && isFinite(y)) return v.long ? h(y) : p(y);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" +
        JSON.stringify(y),
    );
  };
  function f(y) {
    if (((y = String(y)), !(y.length > 100))) {
      var v =
        /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
          y,
        );
      if (v) {
        var E = parseFloat(v[1]),
          w = (v[2] || "ms").toLowerCase();
        switch (w) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return E * u;
          case "weeks":
          case "week":
          case "w":
            return E * s;
          case "days":
          case "day":
          case "d":
            return E * l;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return E * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return E * a;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return E * t;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return E;
          default:
            return;
        }
      }
    }
  }
  function p(y) {
    var v = Math.abs(y);
    return v >= l
      ? Math.round(y / l) + "d"
      : v >= r
        ? Math.round(y / r) + "h"
        : v >= a
          ? Math.round(y / a) + "m"
          : v >= t
            ? Math.round(y / t) + "s"
            : y + "ms";
  }
  function h(y) {
    var v = Math.abs(y);
    return v >= l
      ? g(y, v, l, "day")
      : v >= r
        ? g(y, v, r, "hour")
        : v >= a
          ? g(y, v, a, "minute")
          : v >= t
            ? g(y, v, t, "second")
            : y + " ms";
  }
  function g(y, v, E, w) {
    var S = v >= E * 1.5;
    return Math.round(y / E) + " " + w + (S ? "s" : "");
  }
  return ed;
}
var td, Om;
function kE() {
  if (Om) return td;
  Om = 1;
  function t(a) {
    ((l.debug = l),
      (l.default = l),
      (l.coerce = g),
      (l.disable = p),
      (l.enable = u),
      (l.enabled = h),
      (l.humanize = RE()),
      (l.destroy = y),
      Object.keys(a).forEach((v) => {
        l[v] = a[v];
      }),
      (l.names = []),
      (l.skips = []),
      (l.formatters = {}));
    function r(v) {
      let E = 0;
      for (let w = 0; w < v.length; w++)
        ((E = (E << 5) - E + v.charCodeAt(w)), (E |= 0));
      return l.colors[Math.abs(E) % l.colors.length];
    }
    l.selectColor = r;
    function l(v) {
      let E,
        w = null,
        S,
        b;
      function O(...k) {
        if (!O.enabled) return;
        const L = O,
          z = Number(new Date()),
          Q = z - (E || z);
        ((L.diff = Q),
          (L.prev = E),
          (L.curr = z),
          (E = z),
          (k[0] = l.coerce(k[0])),
          typeof k[0] != "string" && k.unshift("%O"));
        let ae = 0;
        ((k[0] = k[0].replace(/%([a-zA-Z%])/g, (q, ie) => {
          if (q === "%%") return "%";
          ae++;
          const se = l.formatters[ie];
          if (typeof se == "function") {
            const ve = k[ae];
            ((q = se.call(L, ve)), k.splice(ae, 1), ae--);
          }
          return q;
        })),
          l.formatArgs.call(L, k),
          (L.log || l.log).apply(L, k));
      }
      return (
        (O.namespace = v),
        (O.useColors = l.useColors()),
        (O.color = l.selectColor(v)),
        (O.extend = s),
        (O.destroy = l.destroy),
        Object.defineProperty(O, "enabled", {
          enumerable: !0,
          configurable: !1,
          get: () =>
            w !== null
              ? w
              : (S !== l.namespaces && ((S = l.namespaces), (b = l.enabled(v))),
                b),
          set: (k) => {
            w = k;
          },
        }),
        typeof l.init == "function" && l.init(O),
        O
      );
    }
    function s(v, E) {
      const w = l(this.namespace + (typeof E > "u" ? ":" : E) + v);
      return ((w.log = this.log), w);
    }
    function u(v) {
      (l.save(v), (l.namespaces = v), (l.names = []), (l.skips = []));
      const E = (typeof v == "string" ? v : "")
        .trim()
        .replace(/\s+/g, ",")
        .split(",")
        .filter(Boolean);
      for (const w of E)
        w[0] === "-" ? l.skips.push(w.slice(1)) : l.names.push(w);
    }
    function f(v, E) {
      let w = 0,
        S = 0,
        b = -1,
        O = 0;
      for (; w < v.length; )
        if (S < E.length && (E[S] === v[w] || E[S] === "*"))
          E[S] === "*" ? ((b = S), (O = w), S++) : (w++, S++);
        else if (b !== -1) ((S = b + 1), O++, (w = O));
        else return !1;
      for (; S < E.length && E[S] === "*"; ) S++;
      return S === E.length;
    }
    function p() {
      const v = [...l.names, ...l.skips.map((E) => "-" + E)].join(",");
      return (l.enable(""), v);
    }
    function h(v) {
      for (const E of l.skips) if (f(v, E)) return !1;
      for (const E of l.names) if (f(v, E)) return !0;
      return !1;
    }
    function g(v) {
      return v instanceof Error ? v.stack || v.message : v;
    }
    function y() {
      console.warn(
        "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
      );
    }
    return (l.enable(l.load()), l);
  }
  return ((td = t), td);
}
var xm;
function DE() {
  return (
    xm ||
      ((xm = 1),
      (function (t, a) {
        var r = {};
        ((a.formatArgs = s),
          (a.save = u),
          (a.load = f),
          (a.useColors = l),
          (a.storage = p()),
          (a.destroy = (() => {
            let g = !1;
            return () => {
              g ||
                ((g = !0),
                console.warn(
                  "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
                ));
            };
          })()),
          (a.colors = [
            "#0000CC",
            "#0000FF",
            "#0033CC",
            "#0033FF",
            "#0066CC",
            "#0066FF",
            "#0099CC",
            "#0099FF",
            "#00CC00",
            "#00CC33",
            "#00CC66",
            "#00CC99",
            "#00CCCC",
            "#00CCFF",
            "#3300CC",
            "#3300FF",
            "#3333CC",
            "#3333FF",
            "#3366CC",
            "#3366FF",
            "#3399CC",
            "#3399FF",
            "#33CC00",
            "#33CC33",
            "#33CC66",
            "#33CC99",
            "#33CCCC",
            "#33CCFF",
            "#6600CC",
            "#6600FF",
            "#6633CC",
            "#6633FF",
            "#66CC00",
            "#66CC33",
            "#9900CC",
            "#9900FF",
            "#9933CC",
            "#9933FF",
            "#99CC00",
            "#99CC33",
            "#CC0000",
            "#CC0033",
            "#CC0066",
            "#CC0099",
            "#CC00CC",
            "#CC00FF",
            "#CC3300",
            "#CC3333",
            "#CC3366",
            "#CC3399",
            "#CC33CC",
            "#CC33FF",
            "#CC6600",
            "#CC6633",
            "#CC9900",
            "#CC9933",
            "#CCCC00",
            "#CCCC33",
            "#FF0000",
            "#FF0033",
            "#FF0066",
            "#FF0099",
            "#FF00CC",
            "#FF00FF",
            "#FF3300",
            "#FF3333",
            "#FF3366",
            "#FF3399",
            "#FF33CC",
            "#FF33FF",
            "#FF6600",
            "#FF6633",
            "#FF9900",
            "#FF9933",
            "#FFCC00",
            "#FFCC33",
          ]));
        function l() {
          if (
            typeof window < "u" &&
            window.process &&
            (window.process.type === "renderer" || window.process.__nwjs)
          )
            return !0;
          if (
            typeof navigator < "u" &&
            navigator.userAgent &&
            navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
          )
            return !1;
          let g;
          return (
            (typeof document < "u" &&
              document.documentElement &&
              document.documentElement.style &&
              document.documentElement.style.WebkitAppearance) ||
            (typeof window < "u" &&
              window.console &&
              (window.console.firebug ||
                (window.console.exception && window.console.table))) ||
            (typeof navigator < "u" &&
              navigator.userAgent &&
              (g = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) &&
              parseInt(g[1], 10) >= 31) ||
            (typeof navigator < "u" &&
              navigator.userAgent &&
              navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
          );
        }
        function s(g) {
          if (
            ((g[0] =
              (this.useColors ? "%c" : "") +
              this.namespace +
              (this.useColors ? " %c" : " ") +
              g[0] +
              (this.useColors ? "%c " : " ") +
              "+" +
              t.exports.humanize(this.diff)),
            !this.useColors)
          )
            return;
          const y = "color: " + this.color;
          g.splice(1, 0, y, "color: inherit");
          let v = 0,
            E = 0;
          (g[0].replace(/%[a-zA-Z%]/g, (w) => {
            w !== "%%" && (v++, w === "%c" && (E = v));
          }),
            g.splice(E, 0, y));
        }
        a.log = console.debug || console.log || (() => {});
        function u(g) {
          try {
            g ? a.storage.setItem("debug", g) : a.storage.removeItem("debug");
          } catch {}
        }
        function f() {
          let g;
          try {
            g = a.storage.getItem("debug") || a.storage.getItem("DEBUG");
          } catch {}
          return (
            !g && typeof process < "u" && "env" in process && (g = r.DEBUG),
            g
          );
        }
        function p() {
          try {
            return localStorage;
          } catch {}
        }
        t.exports = kE()(a);
        const { formatters: h } = t.exports;
        h.j = function (g) {
          try {
            return JSON.stringify(g);
          } catch (y) {
            return "[UnexpectedJSONParseError]: " + y.message;
          }
        };
      })(Gs, Gs.exports)),
    Gs.exports
  );
}
var LE = DE();
const NE = Oo(LE),
  la = NE("ladle"),
  rb = "%[a-f0-9]{2}",
  Cm = new RegExp("(" + rb + ")|([^%]+?)", "gi"),
  Tm = new RegExp("(" + rb + ")+", "gi");
function Md(t, a) {
  try {
    return [decodeURIComponent(t.join(""))];
  } catch {}
  if (t.length === 1) return t;
  a = a || 1;
  const r = t.slice(0, a),
    l = t.slice(a);
  return Array.prototype.concat.call([], Md(r), Md(l));
}
function ME(t) {
  try {
    return decodeURIComponent(t);
  } catch {
    let a = t.match(Cm) || [];
    for (let r = 1; r < a.length; r++)
      ((t = Md(a, r).join("")), (a = t.match(Cm) || []));
    return t;
  }
}
function jE(t) {
  const a = { "%FE%FF": "��", "%FF%FE": "��" };
  let r = Tm.exec(t);
  for (; r; ) {
    try {
      a[r[0]] = decodeURIComponent(r[0]);
    } catch {
      const s = ME(r[0]);
      s !== r[0] && (a[r[0]] = s);
    }
    r = Tm.exec(t);
  }
  a["%C2"] = "�";
  const l = Object.keys(a);
  for (const s of l) t = t.replace(new RegExp(s, "g"), a[s]);
  return t;
}
function zE(t) {
  if (typeof t != "string")
    throw new TypeError(
      "Expected `encodedURI` to be of type `string`, got `" + typeof t + "`",
    );
  try {
    return decodeURIComponent(t);
  } catch {
    return jE(t);
  }
}
function BE(t, a) {
  const r = {};
  if (Array.isArray(a))
    for (const l of a) {
      const s = Object.getOwnPropertyDescriptor(t, l);
      s != null && s.enumerable && Object.defineProperty(r, l, s);
    }
  else
    for (const l of Reflect.ownKeys(t)) {
      const s = Object.getOwnPropertyDescriptor(t, l);
      if (s.enumerable) {
        const u = t[l];
        a(l, u, t) && Object.defineProperty(r, l, s);
      }
    }
  return r;
}
function ib(t, a) {
  if (!(typeof t == "string" && typeof a == "string"))
    throw new TypeError("Expected the arguments to be of type `string`");
  if (t === "" || a === "") return [];
  const r = t.indexOf(a);
  return r === -1 ? [] : [t.slice(0, r), t.slice(r + a.length)];
}
const UE = (t) => t == null,
  FE = (t) =>
    encodeURIComponent(t).replaceAll(
      /[!'()*]/g,
      (a) => `%${a.charCodeAt(0).toString(16).toUpperCase()}`,
    ),
  jd = Symbol("encodeFragmentIdentifier");
function IE(t) {
  switch (t.arrayFormat) {
    case "index":
      return (a) => (r, l) => {
        const s = r.length;
        return l === void 0 ||
          (t.skipNull && l === null) ||
          (t.skipEmptyString && l === "")
          ? r
          : l === null
            ? (r.push([xt(a, t), "[", s, "]"].join("")), r)
            : (r.push([xt(a, t), "[", xt(s, t), "]=", xt(l, t)].join("")), r);
      };
    case "bracket":
      return (a) => (r, l) =>
        l === void 0 ||
        (t.skipNull && l === null) ||
        (t.skipEmptyString && l === "")
          ? r
          : l === null
            ? (r.push([xt(a, t), "[]"].join("")), r)
            : (r.push([xt(a, t), "[]=", xt(l, t)].join("")), r);
    case "colon-list-separator":
      return (a) => (r, l) =>
        l === void 0 ||
        (t.skipNull && l === null) ||
        (t.skipEmptyString && l === "")
          ? r
          : l === null
            ? (r.push([xt(a, t), ":list="].join("")), r)
            : (r.push([xt(a, t), ":list=", xt(l, t)].join("")), r);
    case "comma":
    case "separator":
    case "bracket-separator": {
      const a = t.arrayFormat === "bracket-separator" ? "[]=" : "=";
      return (r) => (l, s) =>
        s === void 0 ||
        (t.skipNull && s === null) ||
        (t.skipEmptyString && s === "")
          ? l
          : ((s = s === null ? "" : s),
            l.length === 0
              ? (l.push([xt(r, t), a, xt(s, t)].join("")), l)
              : (l.push(xt(s, t)), l));
    }
    default:
      return (a) => (r, l) =>
        l === void 0 ||
        (t.skipNull && l === null) ||
        (t.skipEmptyString && l === "")
          ? r
          : l === null
            ? (r.push(xt(a, t)), r)
            : (r.push([xt(a, t), "=", xt(l, t)].join("")), r);
  }
}
function HE(t) {
  let a;
  switch (t.arrayFormat) {
    case "index":
      return (r, l, s) => {
        if (((a = /\[(\d*)]$/.exec(r)), (r = r.replace(/\[\d*]$/, "")), !a)) {
          s[r] = l;
          return;
        }
        (s[r] === void 0 && (s[r] = {}), (s[r][a[1]] = l));
      };
    case "bracket":
      return (r, l, s) => {
        if (((a = /(\[])$/.exec(r)), (r = r.replace(/\[]$/, "")), !a)) {
          s[r] = l;
          return;
        }
        if (s[r] === void 0) {
          s[r] = [l];
          return;
        }
        if (!Array.isArray(s[r])) {
          s[r] = [s[r], l];
          return;
        }
        s[r].push(l);
      };
    case "colon-list-separator":
      return (r, l, s) => {
        if (((a = /(:list)$/.exec(r)), (r = r.replace(/:list$/, "")), !a)) {
          s[r] = l;
          return;
        }
        if (s[r] === void 0) {
          s[r] = [l];
          return;
        }
        if (!Array.isArray(s[r])) {
          s[r] = [s[r], l];
          return;
        }
        s[r].push(l);
      };
    case "comma":
    case "separator":
      return (r, l, s) => {
        const f =
          typeof l == "string" && l.includes(t.arrayFormatSeparator)
            ? l.split(t.arrayFormatSeparator).map((p) => Vr(p, t))
            : l === null
              ? l
              : Vr(l, t);
        s[r] = f;
      };
    case "bracket-separator":
      return (r, l, s) => {
        const u = /(\[])$/.test(r);
        if (((r = r.replace(/\[]$/, "")), !u)) {
          s[r] = l && Vr(l, t);
          return;
        }
        const f = l === null ? [] : Vr(l, t).split(t.arrayFormatSeparator);
        if (s[r] === void 0) {
          s[r] = f;
          return;
        }
        Array.isArray(s[r]) || (s[r] = [s[r]]);
        for (const p of f) s[r].push(p);
      };
    default:
      return (r, l, s) => {
        if (s[r] === void 0) {
          s[r] = l;
          return;
        }
        if (Array.isArray(s[r])) {
          s[r].push(l);
          return;
        }
        s[r] = [s[r], l];
      };
  }
}
function lb(t) {
  if (typeof t != "string" || t.length !== 1)
    throw new TypeError("arrayFormatSeparator must be single character string");
}
function xt(t, a) {
  return a.encode ? (a.strict ? FE(t) : encodeURIComponent(t)) : t;
}
function Vr(t, a) {
  return a.decode ? zE(t) : t;
}
function ob(t) {
  return Array.isArray(t)
    ? t.sort()
    : typeof t == "object"
      ? ob(Object.keys(t))
          .sort((a, r) => Number(a) - Number(r))
          .map((a) => t[a])
      : t;
}
function sb(t) {
  const a = t.indexOf("#");
  return (a !== -1 && (t = t.slice(0, a)), t);
}
function $E(t) {
  let a = "";
  const r = t.indexOf("#");
  return (r !== -1 && (a = t.slice(r)), a);
}
function ub(t) {
  const a = t.indexOf("?");
  return a === -1 ? t : t.slice(0, a);
}
function Am(t, a, r) {
  return r === "string" && typeof t == "string"
    ? t
    : typeof r == "function" && typeof t == "string"
      ? r(t)
      : r === "boolean" && t === null
        ? !0
        : r === "boolean" &&
            t !== null &&
            (t.toLowerCase() === "true" || t.toLowerCase() === "false")
          ? t.toLowerCase() === "true"
          : r === "boolean" &&
              t !== null &&
              (t.toLowerCase() === "1" || t.toLowerCase() === "0")
            ? t.toLowerCase() === "1"
            : r === "string[]" &&
                a.arrayFormat !== "none" &&
                typeof t == "string"
              ? [t]
              : r === "number[]" &&
                  a.arrayFormat !== "none" &&
                  !Number.isNaN(Number(t)) &&
                  typeof t == "string" &&
                  t.trim() !== ""
                ? [Number(t)]
                : r === "number" &&
                    !Number.isNaN(Number(t)) &&
                    typeof t == "string" &&
                    t.trim() !== ""
                  ? Number(t)
                  : a.parseBooleans &&
                      t !== null &&
                      (t.toLowerCase() === "true" ||
                        t.toLowerCase() === "false")
                    ? t.toLowerCase() === "true"
                    : a.parseNumbers &&
                        !Number.isNaN(Number(t)) &&
                        typeof t == "string" &&
                        t.trim() !== ""
                      ? Number(t)
                      : t;
}
function fp(t) {
  t = sb(t);
  const a = t.indexOf("?");
  return a === -1 ? "" : t.slice(a + 1);
}
function dp(t, a) {
  ((a = {
    decode: !0,
    sort: !0,
    arrayFormat: "none",
    arrayFormatSeparator: ",",
    parseNumbers: !1,
    parseBooleans: !1,
    types: Object.create(null),
    ...a,
  }),
    lb(a.arrayFormatSeparator));
  const r = HE(a),
    l = Object.create(null);
  if (typeof t != "string" || ((t = t.trim().replace(/^[?#&]/, "")), !t))
    return l;
  let s = 0;
  for (let u = 0; u <= t.length; u++) {
    if (u < t.length && t[u] !== "&") continue;
    if (u === s) {
      s = u + 1;
      continue;
    }
    const f = t.slice(s, u);
    s = u + 1;
    const p = a.decode ? f.replaceAll("+", " ") : f;
    let [h, g] = ib(p, "=");
    (h === void 0 && (h = p),
      (g =
        g === void 0
          ? null
          : ["comma", "separator", "bracket-separator"].includes(a.arrayFormat)
            ? g
            : Vr(g, a)),
      r(Vr(h, a), g, l));
  }
  for (const [u, f] of Object.entries(l))
    if (typeof f == "object" && f !== null && a.types[u] !== "string")
      for (const [p, h] of Object.entries(f)) {
        const g = a.types[u],
          y = typeof g == "function" ? g : g ? g.replace("[]", "") : void 0;
        f[p] = Am(h, a, y);
      }
    else
      typeof f == "object" && f !== null && a.types[u] === "string"
        ? (l[u] = Object.values(f).join(a.arrayFormatSeparator))
        : (l[u] = Am(f, a, a.types[u]));
  return a.sort === !1
    ? l
    : (a.sort === !0
        ? Object.keys(l).sort()
        : Object.keys(l).sort(a.sort)
      ).reduce((u, f) => {
        const p = l[f];
        return (
          (u[f] = p && typeof p == "object" && !Array.isArray(p) ? ob(p) : p),
          u
        );
      }, Object.create(null));
}
function cb(t, a) {
  if (!t) return "";
  ((a = {
    encode: !0,
    strict: !0,
    arrayFormat: "none",
    arrayFormatSeparator: ",",
    ...a,
  }),
    lb(a.arrayFormatSeparator));
  const r = (f) =>
      (a.skipNull && UE(t[f])) || (a.skipEmptyString && t[f] === ""),
    l = IE(a),
    s = {};
  for (const [f, p] of Object.entries(t)) r(f) || (s[f] = p);
  const u = Object.keys(s);
  return (
    a.sort !== !1 && u.sort(a.sort),
    u
      .map((f) => {
        let p = t[f];
        if (
          (a.replacer && ((p = a.replacer(f, p)), p === void 0)) ||
          p === void 0
        )
          return "";
        if (p === null) return xt(f, a);
        if (Array.isArray(p)) {
          if (p.length === 0 && a.arrayFormat === "bracket-separator")
            return xt(f, a) + "[]";
          let h = p;
          a.replacer &&
            (h = p
              .map((v, E) => a.replacer(`${f}[${E}]`, v))
              .filter((v) => v !== void 0));
          const g = h.reduce(l(f), []),
            y = ["comma", "separator", "bracket-separator"].includes(
              a.arrayFormat,
            )
              ? a.arrayFormatSeparator
              : "&";
          return g.join(y);
        }
        return xt(f, a) + "=" + xt(p, a);
      })
      .filter((f) => f.length > 0)
      .join("&")
  );
}
function fb(t, a) {
  a = { decode: !0, ...a };
  let [r, l] = ib(t, "#");
  return (
    r === void 0 && (r = t),
    {
      url: ub(r ?? ""),
      query: dp(fp(t), a),
      ...(a && a.parseFragmentIdentifier && l
        ? { fragmentIdentifier: Vr(l, a) }
        : {}),
    }
  );
}
function db(t, a) {
  a = { encode: !0, strict: !0, [jd]: !0, ...a };
  const r = ub(sb(t.url)) || "",
    l = fp(t.url),
    s = { ...dp(l, { sort: !1, ...a }), ...t.query };
  let u = cb(s, a);
  u && (u = `?${u}`);
  let f = $E(t.url);
  if (typeof t.fragmentIdentifier == "string") {
    const p = new URL(r);
    ((p.hash = t.fragmentIdentifier),
      (f = a[jd] ? p.hash : `#${t.fragmentIdentifier}`));
  }
  return `${r}${u}${f}`;
}
function zd(t, a, r) {
  r = { parseFragmentIdentifier: !0, [jd]: !1, ...r };
  const { url: l, query: s, fragmentIdentifier: u } = fb(t, r);
  return db({ url: l, query: BE(s, a), fragmentIdentifier: u }, r);
}
function VE(t, a, r) {
  if (Array.isArray(a)) {
    const l = new Set(a);
    return zd(t, (s) => !l.has(s), r);
  }
  return zd(t, (l, s) => !a(l, s), r);
}
const ca = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        exclude: VE,
        extract: fp,
        parse: dp,
        parseUrl: fb,
        pick: zd,
        stringify: cb,
        stringifyUrl: db,
      },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  ),
  Ui = "-",
  pb = (t, a) => ca.parse(t).story || a,
  GE = (t) => !!ca.parse(t).story,
  hb = (t) =>
    typeof t != "string" ? "" : t.charAt(0).toUpperCase() + t.slice(1),
  gb = (t) =>
    t
      ? t
          .split(`${Ui}${Ui}`)
          .reverse()
          .map((a) => hb(a.replace(/-/g, " ")))
          .join(" - ")
      : "",
  nd = (t, a, r) => {
    const l = [],
      s = (f, p, h, g) => {
        const y = p.shift();
        let v = !!r,
          E = [];
        h[0] === y && ((E = [...h.slice(1)]), (v = !0));
        const w = f.findIndex((S) => S.subId === y);
        y &&
          (w === -1 &&
            f.push({
              id: `${g}${y}`,
              subId: y,
              name: hb(y.replace(/-/g, " ")),
              isLinkable: p.length === 0,
              isExpanded: v,
              isFocused: !1,
              children: [],
            }),
          s(f[w > -1 ? w : f.length - 1].children, p, E, `${g}${y}--`));
      },
      u = a ? a.split(`${Ui}${Ui}`) : [];
    return (
      t.forEach((f) => {
        const p = f.split(`${Ui}${Ui}`);
        s(l, p, u, "");
      }),
      l
    );
  },
  PE = (t, a) => {
    const r = t.split("--"),
      l = a.split("--"),
      s = Math.min(r.length, l.length);
    for (let u = 0; u < s; u++)
      if (r[u] !== l[u])
        return !r[u + 1] && l[u + 1]
          ? 1
          : (r[u + 1] && !l[u + 1]) || [r[u], l[u]].sort()[0] === r[u]
            ? -1
            : 1;
    return 0;
  },
  yb = (t, a) => {
    const r = t.sort(PE);
    let l = [...r];
    Array.isArray(a) ? (l = a) : (l = a(r));
    const s = new Set();
    return (
      l.forEach((u) => {
        const f = u.toLowerCase();
        if (f.includes("*")) {
          const p = f.split("*")[0];
          r.forEach((h) => {
            h.startsWith(p) && s.add(h);
          });
        } else {
          if (!r.includes(f))
            throw new Error(
              `Story "${u}" does not exist in your storybook. Please check your storyOrder config.`,
            );
          s.add(f);
        }
      }),
      [...s]
    );
  };
var uo = { exports: {} };
uo.exports;
var Rm;
function qE() {
  return (
    Rm ||
      ((Rm = 1),
      (function (t, a) {
        var r = 200,
          l = "__lodash_hash_undefined__",
          s = 800,
          u = 16,
          f = 9007199254740991,
          p = "[object Arguments]",
          h = "[object Array]",
          g = "[object AsyncFunction]",
          y = "[object Boolean]",
          v = "[object Date]",
          E = "[object Error]",
          w = "[object Function]",
          S = "[object GeneratorFunction]",
          b = "[object Map]",
          O = "[object Number]",
          k = "[object Null]",
          L = "[object Object]",
          z = "[object Proxy]",
          Q = "[object RegExp]",
          ae = "[object Set]",
          re = "[object String]",
          q = "[object Undefined]",
          ie = "[object WeakMap]",
          se = "[object ArrayBuffer]",
          ve = "[object DataView]",
          Te = "[object Float32Array]",
          Y = "[object Float64Array]",
          oe = "[object Int8Array]",
          ue = "[object Int16Array]",
          de = "[object Int32Array]",
          M = "[object Uint8Array]",
          Z = "[object Uint8ClampedArray]",
          ne = "[object Uint16Array]",
          he = "[object Uint32Array]",
          fe = /[\\^$.*+?()[\]{}|]/g,
          A = /^\[object .+?Constructor\]$/,
          V = /^(?:0|[1-9]\d*)$/,
          B = {};
        ((B[Te] =
          B[Y] =
          B[oe] =
          B[ue] =
          B[de] =
          B[M] =
          B[Z] =
          B[ne] =
          B[he] =
            !0),
          (B[p] =
            B[h] =
            B[se] =
            B[y] =
            B[ve] =
            B[v] =
            B[E] =
            B[w] =
            B[b] =
            B[O] =
            B[L] =
            B[Q] =
            B[ae] =
            B[re] =
            B[ie] =
              !1));
        var ce = typeof Bi == "object" && Bi && Bi.Object === Object && Bi,
          Ce =
            typeof self == "object" && self && self.Object === Object && self,
          ge = ce || Ce || Function("return this")(),
          ke = a && !a.nodeType && a,
          We = ke && !0 && t && !t.nodeType && t,
          qe = We && We.exports === ke,
          rn = qe && ce.process,
          bt = (function () {
            try {
              var T = We && We.require && We.require("util").types;
              return T || (rn && rn.binding && rn.binding("util"));
            } catch {}
          })(),
          Dn = bt && bt.isTypedArray;
        function Ln(T, N, H) {
          switch (H.length) {
            case 0:
              return T.call(N);
            case 1:
              return T.call(N, H[0]);
            case 2:
              return T.call(N, H[0], H[1]);
            case 3:
              return T.call(N, H[0], H[1], H[2]);
          }
          return T.apply(N, H);
        }
        function _e(T, N) {
          for (var H = -1, Ee = Array(T); ++H < T; ) Ee[H] = N(H);
          return Ee;
        }
        function mn(T) {
          return function (N) {
            return T(N);
          };
        }
        function vn(T, N) {
          return T == null ? void 0 : T[N];
        }
        function Gn(T, N) {
          return function (H) {
            return T(N(H));
          };
        }
        var mr = Array.prototype,
          Ma = Function.prototype,
          Nn = Object.prototype,
          Pn = ge["__core-js_shared__"],
          qn = Ma.toString,
          bn = Nn.hasOwnProperty,
          At = (function () {
            var T = /[^.]+$/.exec((Pn && Pn.keys && Pn.keys.IE_PROTO) || "");
            return T ? "Symbol(src)_1." + T : "";
          })(),
          qr = Nn.toString,
          Yr = qn.call(Object),
          Yn = RegExp(
            "^" +
              qn
                .call(bn)
                .replace(fe, "\\$&")
                .replace(
                  /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,
                  "$1.*?",
                ) +
              "$",
          ),
          Mn = qe ? ge.Buffer : void 0,
          Zr = ge.Symbol,
          vr = ge.Uint8Array;
        Mn && Mn.allocUnsafe;
        var ja = Gn(Object.getPrototypeOf, Object),
          U = Object.create,
          G = Nn.propertyIsEnumerable,
          X = mr.splice,
          le = Zr ? Zr.toStringTag : void 0,
          be = (function () {
            try {
              var T = fl(Object, "defineProperty");
              return (T({}, "", {}), T);
            } catch {}
          })(),
          pt = Mn ? Mn.isBuffer : void 0,
          ft = Math.max,
          je = Date.now,
          pe = fl(ge, "Map"),
          ye = fl(Object, "create"),
          Se = (function () {
            function T() {}
            return function (N) {
              if (!Wn(N)) return {};
              if (U) return U(N);
              T.prototype = N;
              var H = new T();
              return ((T.prototype = void 0), H);
            };
          })();
        function me(T) {
          var N = -1,
            H = T == null ? 0 : T.length;
          for (this.clear(); ++N < H; ) {
            var Ee = T[N];
            this.set(Ee[0], Ee[1]);
          }
        }
        function Ne() {
          ((this.__data__ = ye ? ye(null) : {}), (this.size = 0));
        }
        function Ye(T) {
          var N = this.has(T) && delete this.__data__[T];
          return ((this.size -= N ? 1 : 0), N);
        }
        function st(T) {
          var N = this.__data__;
          if (ye) {
            var H = N[T];
            return H === l ? void 0 : H;
          }
          return bn.call(N, T) ? N[T] : void 0;
        }
        function $t(T) {
          var N = this.__data__;
          return ye ? N[T] !== void 0 : bn.call(N, T);
        }
        function za(T, N) {
          var H = this.__data__;
          return (
            (this.size += this.has(T) ? 0 : 1),
            (H[T] = ye && N === void 0 ? l : N),
            this
          );
        }
        ((me.prototype.clear = Ne),
          (me.prototype.delete = Ye),
          (me.prototype.get = st),
          (me.prototype.has = $t),
          (me.prototype.set = za));
        function Nt(T) {
          var N = -1,
            H = T == null ? 0 : T.length;
          for (this.clear(); ++N < H; ) {
            var Ee = T[N];
            this.set(Ee[0], Ee[1]);
          }
        }
        function rl() {
          ((this.__data__ = []), (this.size = 0));
        }
        function Ro(T) {
          var N = this.__data__,
            H = Qn(N, T);
          if (H < 0) return !1;
          var Ee = N.length - 1;
          return (H == Ee ? N.pop() : X.call(N, H, 1), --this.size, !0);
        }
        function ko(T) {
          var N = this.__data__,
            H = Qn(N, T);
          return H < 0 ? void 0 : N[H][1];
        }
        function Do(T) {
          return Qn(this.__data__, T) > -1;
        }
        function il(T, N) {
          var H = this.__data__,
            Ee = Qn(H, T);
          return (
            Ee < 0 ? (++this.size, H.push([T, N])) : (H[Ee][1] = N),
            this
          );
        }
        ((Nt.prototype.clear = rl),
          (Nt.prototype.delete = Ro),
          (Nt.prototype.get = ko),
          (Nt.prototype.has = Do),
          (Nt.prototype.set = il));
        function Zn(T) {
          var N = -1,
            H = T == null ? 0 : T.length;
          for (this.clear(); ++N < H; ) {
            var Ee = T[N];
            this.set(Ee[0], Ee[1]);
          }
        }
        function Lo() {
          ((this.size = 0),
            (this.__data__ = {
              hash: new me(),
              map: new (pe || Nt)(),
              string: new me(),
            }));
        }
        function No(T) {
          var N = da(this, T).delete(T);
          return ((this.size -= N ? 1 : 0), N);
        }
        function Xn(T) {
          return da(this, T).get(T);
        }
        function Ct(T) {
          return da(this, T).has(T);
        }
        function Vt(T, N) {
          var H = da(this, T),
            Ee = H.size;
          return (H.set(T, N), (this.size += H.size == Ee ? 0 : 1), this);
        }
        ((Zn.prototype.clear = Lo),
          (Zn.prototype.delete = No),
          (Zn.prototype.get = Xn),
          (Zn.prototype.has = Ct),
          (Zn.prototype.set = Vt));
        function ln(T) {
          var N = (this.__data__ = new Nt(T));
          this.size = N.size;
        }
        function ll() {
          ((this.__data__ = new Nt()), (this.size = 0));
        }
        function Xu(T) {
          var N = this.__data__,
            H = N.delete(T);
          return ((this.size = N.size), H);
        }
        function Ku(T) {
          return this.__data__.get(T);
        }
        function Mo(T) {
          return this.__data__.has(T);
        }
        function br(T, N) {
          var H = this.__data__;
          if (H instanceof Nt) {
            var Ee = H.__data__;
            if (!pe || Ee.length < r - 1)
              return (Ee.push([T, N]), (this.size = ++H.size), this);
            H = this.__data__ = new Zn(Ee);
          }
          return (H.set(T, N), (this.size = H.size), this);
        }
        ((ln.prototype.clear = ll),
          (ln.prototype.delete = Xu),
          (ln.prototype.get = Ku),
          (ln.prototype.has = Mo),
          (ln.prototype.set = br));
        function ol(T, N) {
          var H = Er(T),
            Ee = !H && on(T),
            Be = !H && !Ee && ha(T),
            Ze = !H && !Ee && !Be && ei(T),
            ot = H || Ee || Be || Ze,
            Ge = ot ? _e(T.length, String) : [],
            nt = Ge.length;
          for (var Mt in T)
            (ot &&
              (Mt == "length" ||
                (Be && (Mt == "offset" || Mt == "parent")) ||
                (Ze &&
                  (Mt == "buffer" ||
                    Mt == "byteLength" ||
                    Mt == "byteOffset")) ||
                pl(Mt, nt))) ||
              Ge.push(Mt);
          return Ge;
        }
        function Kn(T, N, H) {
          ((H !== void 0 && !pa(T[N], H)) || (H === void 0 && !(N in T))) &&
            Jn(T, N, H);
        }
        function Ba(T, N, H) {
          var Ee = T[N];
          (!(bn.call(T, N) && pa(Ee, H)) || (H === void 0 && !(N in T))) &&
            Jn(T, N, H);
        }
        function Qn(T, N) {
          for (var H = T.length; H--; ) if (pa(T[H][0], N)) return H;
          return -1;
        }
        function Jn(T, N, H) {
          N == "__proto__" && be
            ? be(T, N, {
                configurable: !0,
                enumerable: !0,
                value: H,
                writable: !0,
              })
            : (T[N] = H);
        }
        var St = Bo();
        function Sr(T) {
          return T == null
            ? T === void 0
              ? q
              : k
            : le && le in Object(T)
              ? Qt(T)
              : ec(T);
        }
        function sl(T) {
          return zn(T) && Sr(T) == p;
        }
        function fa(T) {
          if (!Wn(T) || Uo(T)) return !1;
          var N = Jr(T) ? Yn : A;
          return N.test(nc(T));
        }
        function Ua(T) {
          return zn(T) && Wr(T.length) && !!B[Sr(T)];
        }
        function Qu(T) {
          if (!Wn(T)) return Ia(T);
          var N = gl(T),
            H = [];
          for (var Ee in T)
            (Ee == "constructor" && (N || !bn.call(T, Ee))) || H.push(Ee);
          return H;
        }
        function ul(T, N, H, Ee, Be) {
          T !== N &&
            St(
              N,
              function (Ze, ot) {
                if ((Be || (Be = new ln()), Wn(Ze)))
                  jo(T, N, ot, H, ul, Ee, Be);
                else {
                  var Ge = Ee ? Ee(Qr(T, ot), Ze, ot + "", T, N, Be) : void 0;
                  (Ge === void 0 && (Ge = Ze), Kn(T, ot, Ge));
                }
              },
              Un,
            );
        }
        function jo(T, N, H, Ee, Be, Ze, ot) {
          var Ge = Qr(T, H),
            nt = Qr(N, H),
            Mt = ot.get(nt);
          if (Mt) {
            Kn(T, H, Mt);
            return;
          }
          var Rt = Ze ? Ze(Ge, nt, H + "", T, N, ot) : void 0,
            $a = Rt === void 0;
          if ($a) {
            var bl = Er(nt),
              Sl = !bl && ha(nt),
              Io = !bl && !Sl && ei(nt);
            ((Rt = nt),
              bl || Sl || Io
                ? Er(Ge)
                  ? (Rt = Ge)
                  : Ha(Ge)
                    ? (Rt = zo(Ge))
                    : Sl
                      ? (($a = !1), (Rt = Kr(nt)))
                      : Io
                        ? (($a = !1), (Rt = Kt(nt)))
                        : (Rt = [])
                : Bn(nt) || on(nt)
                  ? ((Rt = Ge),
                    on(Ge)
                      ? (Rt = wr(Ge))
                      : (!Wn(Ge) || Jr(Ge)) && (Rt = dl(nt)))
                  : ($a = !1));
          }
          ($a && (ot.set(nt, Rt), Be(Rt, nt, Ee, Ze, ot), ot.delete(nt)),
            Kn(T, H, Rt));
        }
        function Ju(T, N) {
          return yl(Fo(T, N, vl), T + "");
        }
        var Xr = be
          ? function (T, N) {
              return be(T, "toString", {
                configurable: !0,
                enumerable: !1,
                value: ti(N),
                writable: !0,
              });
            }
          : vl;
        function Kr(T, N) {
          return T.slice();
        }
        function jn(T) {
          var N = new T.constructor(T.byteLength);
          return (new vr(N).set(new vr(T)), N);
        }
        function Kt(T, N) {
          var H = jn(T.buffer);
          return new T.constructor(H, T.byteOffset, T.length);
        }
        function zo(T, N) {
          var H = -1,
            Ee = T.length;
          for (N || (N = Array(Ee)); ++H < Ee; ) N[H] = T[H];
          return N;
        }
        function Wu(T, N, H, Ee) {
          var Be = !H;
          H || (H = {});
          for (var Ze = -1, ot = N.length; ++Ze < ot; ) {
            var Ge = N[Ze],
              nt = void 0;
            (nt === void 0 && (nt = T[Ge]), Be ? Jn(H, Ge, nt) : Ba(H, Ge, nt));
          }
          return H;
        }
        function cl(T) {
          return Ju(function (N, H) {
            var Ee = -1,
              Be = H.length,
              Ze = Be > 1 ? H[Be - 1] : void 0,
              ot = Be > 2 ? H[2] : void 0;
            for (
              Ze =
                T.length > 3 && typeof Ze == "function" ? (Be--, Ze) : void 0,
                ot &&
                  hl(H[0], H[1], ot) &&
                  ((Ze = Be < 3 ? void 0 : Ze), (Be = 1)),
                N = Object(N);
              ++Ee < Be;
            ) {
              var Ge = H[Ee];
              Ge && T(N, Ge, Ee, Ze);
            }
            return N;
          });
        }
        function Bo(T) {
          return function (N, H, Ee) {
            for (
              var Be = -1, Ze = Object(N), ot = Ee(N), Ge = ot.length;
              Ge--;
            ) {
              var nt = ot[++Be];
              if (H(Ze[nt], nt, Ze) === !1) break;
            }
            return N;
          };
        }
        function da(T, N) {
          var H = T.__data__;
          return Fa(N) ? H[typeof N == "string" ? "string" : "hash"] : H.map;
        }
        function fl(T, N) {
          var H = vn(T, N);
          return fa(H) ? H : void 0;
        }
        function Qt(T) {
          var N = bn.call(T, le),
            H = T[le];
          try {
            T[le] = void 0;
            var Ee = !0;
          } catch {}
          var Be = qr.call(T);
          return (Ee && (N ? (T[le] = H) : delete T[le]), Be);
        }
        function dl(T) {
          return typeof T.constructor == "function" && !gl(T) ? Se(ja(T)) : {};
        }
        function pl(T, N) {
          var H = typeof T;
          return (
            (N = N ?? f),
            !!N &&
              (H == "number" || (H != "symbol" && V.test(T))) &&
              T > -1 &&
              T % 1 == 0 &&
              T < N
          );
        }
        function hl(T, N, H) {
          if (!Wn(H)) return !1;
          var Ee = typeof N;
          return (
            Ee == "number" ? _r(H) && pl(N, H.length) : Ee == "string" && N in H
          )
            ? pa(H[N], T)
            : !1;
        }
        function Fa(T) {
          var N = typeof T;
          return N == "string" ||
            N == "number" ||
            N == "symbol" ||
            N == "boolean"
            ? T !== "__proto__"
            : T === null;
        }
        function Uo(T) {
          return !!At && At in T;
        }
        function gl(T) {
          var N = T && T.constructor,
            H = (typeof N == "function" && N.prototype) || Nn;
          return T === H;
        }
        function Ia(T) {
          var N = [];
          if (T != null) for (var H in Object(T)) N.push(H);
          return N;
        }
        function ec(T) {
          return qr.call(T);
        }
        function Fo(T, N, H) {
          return (
            (N = ft(N === void 0 ? T.length - 1 : N, 0)),
            function () {
              for (
                var Ee = arguments,
                  Be = -1,
                  Ze = ft(Ee.length - N, 0),
                  ot = Array(Ze);
                ++Be < Ze;
              )
                ot[Be] = Ee[N + Be];
              Be = -1;
              for (var Ge = Array(N + 1); ++Be < N; ) Ge[Be] = Ee[Be];
              return ((Ge[N] = H(ot)), Ln(T, this, Ge));
            }
          );
        }
        function Qr(T, N) {
          if (
            !(N === "constructor" && typeof T[N] == "function") &&
            N != "__proto__"
          )
            return T[N];
        }
        var yl = tc(Xr);
        function tc(T) {
          var N = 0,
            H = 0;
          return function () {
            var Ee = je(),
              Be = u - (Ee - H);
            if (((H = Ee), Be > 0)) {
              if (++N >= s) return arguments[0];
            } else N = 0;
            return T.apply(void 0, arguments);
          };
        }
        function nc(T) {
          if (T != null) {
            try {
              return qn.call(T);
            } catch {}
            try {
              return T + "";
            } catch {}
          }
          return "";
        }
        function pa(T, N) {
          return T === N || (T !== T && N !== N);
        }
        var on = sl(
            (function () {
              return arguments;
            })(),
          )
            ? sl
            : function (T) {
                return zn(T) && bn.call(T, "callee") && !G.call(T, "callee");
              },
          Er = Array.isArray;
        function _r(T) {
          return T != null && Wr(T.length) && !Jr(T);
        }
        function Ha(T) {
          return zn(T) && _r(T);
        }
        var ha = pt || ni;
        function Jr(T) {
          if (!Wn(T)) return !1;
          var N = Sr(T);
          return N == w || N == S || N == g || N == z;
        }
        function Wr(T) {
          return typeof T == "number" && T > -1 && T % 1 == 0 && T <= f;
        }
        function Wn(T) {
          var N = typeof T;
          return T != null && (N == "object" || N == "function");
        }
        function zn(T) {
          return T != null && typeof T == "object";
        }
        function Bn(T) {
          if (!zn(T) || Sr(T) != L) return !1;
          var N = ja(T);
          if (N === null) return !0;
          var H = bn.call(N, "constructor") && N.constructor;
          return typeof H == "function" && H instanceof H && qn.call(H) == Yr;
        }
        var ei = Dn ? mn(Dn) : Ua;
        function wr(T) {
          return Wu(T, Un(T));
        }
        function Un(T) {
          return _r(T) ? ol(T) : Qu(T);
        }
        var ml = cl(function (T, N, H) {
          ul(T, N, H);
        });
        function ti(T) {
          return function () {
            return T;
          };
        }
        function vl(T) {
          return T;
        }
        function ni() {
          return !1;
        }
        t.exports = ml;
      })(uo, uo.exports)),
    uo.exports
  );
}
var YE = qE();
const ZE = Oo(YE);
var ad = { exports: {} },
  Le = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var km;
function XE() {
  if (km) return Le;
  km = 1;
  var t = Symbol.for("react.transitional.element"),
    a = Symbol.for("react.portal"),
    r = Symbol.for("react.fragment"),
    l = Symbol.for("react.strict_mode"),
    s = Symbol.for("react.profiler"),
    u = Symbol.for("react.consumer"),
    f = Symbol.for("react.context"),
    p = Symbol.for("react.forward_ref"),
    h = Symbol.for("react.suspense"),
    g = Symbol.for("react.memo"),
    y = Symbol.for("react.lazy"),
    v = Symbol.for("react.activity"),
    E = Symbol.iterator;
  function w(A) {
    return A === null || typeof A != "object"
      ? null
      : ((A = (E && A[E]) || A["@@iterator"]),
        typeof A == "function" ? A : null);
  }
  var S = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    b = Object.assign,
    O = {};
  function k(A, V, B) {
    ((this.props = A),
      (this.context = V),
      (this.refs = O),
      (this.updater = B || S));
  }
  ((k.prototype.isReactComponent = {}),
    (k.prototype.setState = function (A, V) {
      if (typeof A != "object" && typeof A != "function" && A != null)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, A, V, "setState");
    }),
    (k.prototype.forceUpdate = function (A) {
      this.updater.enqueueForceUpdate(this, A, "forceUpdate");
    }));
  function L() {}
  L.prototype = k.prototype;
  function z(A, V, B) {
    ((this.props = A),
      (this.context = V),
      (this.refs = O),
      (this.updater = B || S));
  }
  var Q = (z.prototype = new L());
  ((Q.constructor = z), b(Q, k.prototype), (Q.isPureReactComponent = !0));
  var ae = Array.isArray;
  function re() {}
  var q = { H: null, A: null, T: null, S: null },
    ie = Object.prototype.hasOwnProperty;
  function se(A, V, B) {
    var ce = B.ref;
    return {
      $$typeof: t,
      type: A,
      key: V,
      ref: ce !== void 0 ? ce : null,
      props: B,
    };
  }
  function ve(A, V) {
    return se(A.type, V, A.props);
  }
  function Te(A) {
    return typeof A == "object" && A !== null && A.$$typeof === t;
  }
  function Y(A) {
    var V = { "=": "=0", ":": "=2" };
    return (
      "$" +
      A.replace(/[=:]/g, function (B) {
        return V[B];
      })
    );
  }
  var oe = /\/+/g;
  function ue(A, V) {
    return typeof A == "object" && A !== null && A.key != null
      ? Y("" + A.key)
      : V.toString(36);
  }
  function de(A) {
    switch (A.status) {
      case "fulfilled":
        return A.value;
      case "rejected":
        throw A.reason;
      default:
        switch (
          (typeof A.status == "string"
            ? A.then(re, re)
            : ((A.status = "pending"),
              A.then(
                function (V) {
                  A.status === "pending" &&
                    ((A.status = "fulfilled"), (A.value = V));
                },
                function (V) {
                  A.status === "pending" &&
                    ((A.status = "rejected"), (A.reason = V));
                },
              )),
          A.status)
        ) {
          case "fulfilled":
            return A.value;
          case "rejected":
            throw A.reason;
        }
    }
    throw A;
  }
  function M(A, V, B, ce, Ce) {
    var ge = typeof A;
    (ge === "undefined" || ge === "boolean") && (A = null);
    var ke = !1;
    if (A === null) ke = !0;
    else
      switch (ge) {
        case "bigint":
        case "string":
        case "number":
          ke = !0;
          break;
        case "object":
          switch (A.$$typeof) {
            case t:
            case a:
              ke = !0;
              break;
            case y:
              return ((ke = A._init), M(ke(A._payload), V, B, ce, Ce));
          }
      }
    if (ke)
      return (
        (Ce = Ce(A)),
        (ke = ce === "" ? "." + ue(A, 0) : ce),
        ae(Ce)
          ? ((B = ""),
            ke != null && (B = ke.replace(oe, "$&/") + "/"),
            M(Ce, V, B, "", function (rn) {
              return rn;
            }))
          : Ce != null &&
            (Te(Ce) &&
              (Ce = ve(
                Ce,
                B +
                  (Ce.key == null || (A && A.key === Ce.key)
                    ? ""
                    : ("" + Ce.key).replace(oe, "$&/") + "/") +
                  ke,
              )),
            V.push(Ce)),
        1
      );
    ke = 0;
    var We = ce === "" ? "." : ce + ":";
    if (ae(A))
      for (var qe = 0; qe < A.length; qe++)
        ((ce = A[qe]), (ge = We + ue(ce, qe)), (ke += M(ce, V, B, ge, Ce)));
    else if (((qe = w(A)), typeof qe == "function"))
      for (A = qe.call(A), qe = 0; !(ce = A.next()).done; )
        ((ce = ce.value),
          (ge = We + ue(ce, qe++)),
          (ke += M(ce, V, B, ge, Ce)));
    else if (ge === "object") {
      if (typeof A.then == "function") return M(de(A), V, B, ce, Ce);
      throw (
        (V = String(A)),
        Error(
          "Objects are not valid as a React child (found: " +
            (V === "[object Object]"
              ? "object with keys {" + Object.keys(A).join(", ") + "}"
              : V) +
            "). If you meant to render a collection of children, use an array instead.",
        )
      );
    }
    return ke;
  }
  function Z(A, V, B) {
    if (A == null) return A;
    var ce = [],
      Ce = 0;
    return (
      M(A, ce, "", "", function (ge) {
        return V.call(B, ge, Ce++);
      }),
      ce
    );
  }
  function ne(A) {
    if (A._status === -1) {
      var V = A._result;
      ((V = V()),
        V.then(
          function (B) {
            (A._status === 0 || A._status === -1) &&
              ((A._status = 1), (A._result = B));
          },
          function (B) {
            (A._status === 0 || A._status === -1) &&
              ((A._status = 2), (A._result = B));
          },
        ),
        A._status === -1 && ((A._status = 0), (A._result = V)));
    }
    if (A._status === 1) return A._result.default;
    throw A._result;
  }
  var he =
      typeof reportError == "function"
        ? reportError
        : function (A) {
            if (
              typeof window == "object" &&
              typeof window.ErrorEvent == "function"
            ) {
              var V = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message:
                  typeof A == "object" &&
                  A !== null &&
                  typeof A.message == "string"
                    ? String(A.message)
                    : String(A),
                error: A,
              });
              if (!window.dispatchEvent(V)) return;
            } else if (
              typeof process == "object" &&
              typeof process.emit == "function"
            ) {
              process.emit("uncaughtException", A);
              return;
            }
            console.error(A);
          },
    fe = {
      map: Z,
      forEach: function (A, V, B) {
        Z(
          A,
          function () {
            V.apply(this, arguments);
          },
          B,
        );
      },
      count: function (A) {
        var V = 0;
        return (
          Z(A, function () {
            V++;
          }),
          V
        );
      },
      toArray: function (A) {
        return (
          Z(A, function (V) {
            return V;
          }) || []
        );
      },
      only: function (A) {
        if (!Te(A))
          throw Error(
            "React.Children.only expected to receive a single React element child.",
          );
        return A;
      },
    };
  return (
    (Le.Activity = v),
    (Le.Children = fe),
    (Le.Component = k),
    (Le.Fragment = r),
    (Le.Profiler = s),
    (Le.PureComponent = z),
    (Le.StrictMode = l),
    (Le.Suspense = h),
    (Le.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = q),
    (Le.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function (A) {
        return q.H.useMemoCache(A);
      },
    }),
    (Le.cache = function (A) {
      return function () {
        return A.apply(null, arguments);
      };
    }),
    (Le.cacheSignal = function () {
      return null;
    }),
    (Le.cloneElement = function (A, V, B) {
      if (A == null)
        throw Error(
          "The argument must be a React element, but you passed " + A + ".",
        );
      var ce = b({}, A.props),
        Ce = A.key;
      if (V != null)
        for (ge in (V.key !== void 0 && (Ce = "" + V.key), V))
          !ie.call(V, ge) ||
            ge === "key" ||
            ge === "__self" ||
            ge === "__source" ||
            (ge === "ref" && V.ref === void 0) ||
            (ce[ge] = V[ge]);
      var ge = arguments.length - 2;
      if (ge === 1) ce.children = B;
      else if (1 < ge) {
        for (var ke = Array(ge), We = 0; We < ge; We++)
          ke[We] = arguments[We + 2];
        ce.children = ke;
      }
      return se(A.type, Ce, ce);
    }),
    (Le.createContext = function (A) {
      return (
        (A = {
          $$typeof: f,
          _currentValue: A,
          _currentValue2: A,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (A.Provider = A),
        (A.Consumer = { $$typeof: u, _context: A }),
        A
      );
    }),
    (Le.createElement = function (A, V, B) {
      var ce,
        Ce = {},
        ge = null;
      if (V != null)
        for (ce in (V.key !== void 0 && (ge = "" + V.key), V))
          ie.call(V, ce) &&
            ce !== "key" &&
            ce !== "__self" &&
            ce !== "__source" &&
            (Ce[ce] = V[ce]);
      var ke = arguments.length - 2;
      if (ke === 1) Ce.children = B;
      else if (1 < ke) {
        for (var We = Array(ke), qe = 0; qe < ke; qe++)
          We[qe] = arguments[qe + 2];
        Ce.children = We;
      }
      if (A && A.defaultProps)
        for (ce in ((ke = A.defaultProps), ke))
          Ce[ce] === void 0 && (Ce[ce] = ke[ce]);
      return se(A, ge, Ce);
    }),
    (Le.createRef = function () {
      return { current: null };
    }),
    (Le.forwardRef = function (A) {
      return { $$typeof: p, render: A };
    }),
    (Le.isValidElement = Te),
    (Le.lazy = function (A) {
      return { $$typeof: y, _payload: { _status: -1, _result: A }, _init: ne };
    }),
    (Le.memo = function (A, V) {
      return { $$typeof: g, type: A, compare: V === void 0 ? null : V };
    }),
    (Le.startTransition = function (A) {
      var V = q.T,
        B = {};
      q.T = B;
      try {
        var ce = A(),
          Ce = q.S;
        (Ce !== null && Ce(B, ce),
          typeof ce == "object" &&
            ce !== null &&
            typeof ce.then == "function" &&
            ce.then(re, he));
      } catch (ge) {
        he(ge);
      } finally {
        (V !== null && B.types !== null && (V.types = B.types), (q.T = V));
      }
    }),
    (Le.unstable_useCacheRefresh = function () {
      return q.H.useCacheRefresh();
    }),
    (Le.use = function (A) {
      return q.H.use(A);
    }),
    (Le.useActionState = function (A, V, B) {
      return q.H.useActionState(A, V, B);
    }),
    (Le.useCallback = function (A, V) {
      return q.H.useCallback(A, V);
    }),
    (Le.useContext = function (A) {
      return q.H.useContext(A);
    }),
    (Le.useDebugValue = function () {}),
    (Le.useDeferredValue = function (A, V) {
      return q.H.useDeferredValue(A, V);
    }),
    (Le.useEffect = function (A, V) {
      return q.H.useEffect(A, V);
    }),
    (Le.useEffectEvent = function (A) {
      return q.H.useEffectEvent(A);
    }),
    (Le.useId = function () {
      return q.H.useId();
    }),
    (Le.useImperativeHandle = function (A, V, B) {
      return q.H.useImperativeHandle(A, V, B);
    }),
    (Le.useInsertionEffect = function (A, V) {
      return q.H.useInsertionEffect(A, V);
    }),
    (Le.useLayoutEffect = function (A, V) {
      return q.H.useLayoutEffect(A, V);
    }),
    (Le.useMemo = function (A, V) {
      return q.H.useMemo(A, V);
    }),
    (Le.useOptimistic = function (A, V) {
      return q.H.useOptimistic(A, V);
    }),
    (Le.useReducer = function (A, V, B) {
      return q.H.useReducer(A, V, B);
    }),
    (Le.useRef = function (A) {
      return q.H.useRef(A);
    }),
    (Le.useState = function (A) {
      return q.H.useState(A);
    }),
    (Le.useSyncExternalStore = function (A, V, B) {
      return q.H.useSyncExternalStore(A, V, B);
    }),
    (Le.useTransition = function () {
      return q.H.useTransition();
    }),
    (Le.version = "19.2.7"),
    Le
  );
}
var Dm;
function pp() {
  return (Dm || ((Dm = 1), (ad.exports = XE())), ad.exports);
}
var C = pp();
const W = Oo(C);
var rd = { exports: {} },
  ro = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Lm;
function KE() {
  if (Lm) return ro;
  Lm = 1;
  var t = Symbol.for("react.transitional.element"),
    a = Symbol.for("react.fragment");
  function r(l, s, u) {
    var f = null;
    if (
      (u !== void 0 && (f = "" + u),
      s.key !== void 0 && (f = "" + s.key),
      "key" in s)
    ) {
      u = {};
      for (var p in s) p !== "key" && (u[p] = s[p]);
    } else u = s;
    return (
      (s = u.ref),
      { $$typeof: t, type: l, key: f, ref: s !== void 0 ? s : null, props: u }
    );
  }
  return ((ro.Fragment = a), (ro.jsx = r), (ro.jsxs = r), ro);
}
var Nm;
function QE() {
  return (Nm || ((Nm = 1), (rd.exports = KE())), rd.exports);
}
var x = QE();
const JE = C.createContext(void 0),
  Mm = JE;
function Bd() {
  return (
    (Bd = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var a = 1; a < arguments.length; a++) {
            var r = arguments[a];
            for (var l in r) ({}).hasOwnProperty.call(r, l) && (t[l] = r[l]);
          }
          return t;
        }),
    Bd.apply(null, arguments)
  );
}
var mb = ["shift", "alt", "meta", "mod", "ctrl"],
  WE = {
    esc: "escape",
    return: "enter",
    ".": "period",
    ",": "comma",
    "-": "slash",
    " ": "space",
    "`": "backquote",
    "#": "backslash",
    "+": "bracketright",
    ShiftLeft: "shift",
    ShiftRight: "shift",
    AltLeft: "alt",
    AltRight: "alt",
    MetaLeft: "meta",
    MetaRight: "meta",
    OSLeft: "meta",
    OSRight: "meta",
    ControlLeft: "ctrl",
    ControlRight: "ctrl",
  };
function dr(t) {
  return ((t && WE[t]) || t || "")
    .trim()
    .toLowerCase()
    .replace(/key|digit|numpad|arrow/, "");
}
function e_(t) {
  return mb.includes(t);
}
function id(t, a) {
  return (a === void 0 && (a = ","), t.split(a));
}
function ld(t, a, r) {
  a === void 0 && (a = "+");
  var l = t
      .toLocaleLowerCase()
      .split(a)
      .map(function (f) {
        return dr(f);
      }),
    s = {
      alt: l.includes("alt"),
      ctrl: l.includes("ctrl") || l.includes("control"),
      shift: l.includes("shift"),
      meta: l.includes("meta"),
      mod: l.includes("mod"),
    },
    u = l.filter(function (f) {
      return !mb.includes(f);
    });
  return Bd({}, s, { keys: u, description: r, hotkey: t });
}
(function () {
  (typeof document < "u" &&
    (document.addEventListener("keydown", function (t) {
      t.key !== void 0 && vb([dr(t.key), dr(t.code)]);
    }),
    document.addEventListener("keyup", function (t) {
      t.key !== void 0 && bb([dr(t.key), dr(t.code)]);
    })),
    typeof window < "u" &&
      window.addEventListener("blur", function () {
        pr.clear();
      }));
})();
var pr = new Set();
function hp(t) {
  return Array.isArray(t);
}
function t_(t, a) {
  a === void 0 && (a = ",");
  var r = hp(t) ? t : t.split(a);
  return r.every(function (l) {
    return pr.has(l.trim().toLowerCase());
  });
}
function vb(t) {
  var a = Array.isArray(t) ? t : [t];
  (pr.has("meta") &&
    pr.forEach(function (r) {
      return !e_(r) && pr.delete(r.toLowerCase());
    }),
    a.forEach(function (r) {
      return pr.add(r.toLowerCase());
    }));
}
function bb(t) {
  var a = Array.isArray(t) ? t : [t];
  t === "meta"
    ? pr.clear()
    : a.forEach(function (r) {
        return pr.delete(r.toLowerCase());
      });
}
function n_(t, a, r) {
  ((typeof r == "function" && r(t, a)) || r === !0) && t.preventDefault();
}
function a_(t, a, r) {
  return typeof r == "function" ? r(t, a) : r === !0 || r === void 0;
}
function r_(t) {
  return Sb(t, ["input", "textarea", "select"]);
}
function Sb(t, a) {
  a === void 0 && (a = !1);
  var r = t.target,
    l = t.composed,
    s = null;
  return (
    i_(r) && l
      ? (s = t.composedPath()[0] && t.composedPath()[0].tagName)
      : (s = r && r.tagName),
    hp(a)
      ? !!(
          s &&
          a &&
          a.some(function (u) {
            var f;
            return (
              u.toLowerCase() === ((f = s) == null ? void 0 : f.toLowerCase())
            );
          })
        )
      : !!(s && a && a)
  );
}
function i_(t) {
  return !!t.tagName && !t.tagName.startsWith("-") && t.tagName.includes("-");
}
function l_(t, a) {
  return t.length === 0 && a
    ? (console.warn(
        'A hotkey has the "scopes" option set, however no active scopes were found. If you want to use the global scopes feature, you need to wrap your app in a <HotkeysProvider>',
      ),
      !0)
    : a
      ? t.some(function (r) {
          return a.includes(r);
        }) || t.includes("*")
      : !0;
}
var o_ = function (a, r, l) {
    l === void 0 && (l = !1);
    var s = r.alt,
      u = r.meta,
      f = r.mod,
      p = r.shift,
      h = r.ctrl,
      g = r.keys,
      y = a.key,
      v = a.code,
      E = a.ctrlKey,
      w = a.metaKey,
      S = a.shiftKey,
      b = a.altKey,
      O = dr(v),
      k = y.toLowerCase();
    if (
      !(g != null && g.includes(O)) &&
      !(g != null && g.includes(k)) &&
      !["ctrl", "control", "unknown", "meta", "alt", "shift", "os"].includes(O)
    )
      return !1;
    if (!l) {
      if ((s === !b && k !== "alt") || (p === !S && k !== "shift")) return !1;
      if (f) {
        if (!w && !E) return !1;
      } else if (
        (u === !w && k !== "meta" && k !== "os") ||
        (h === !E && k !== "ctrl" && k !== "control")
      )
        return !1;
    }
    return g && g.length === 1 && (g.includes(k) || g.includes(O))
      ? !0
      : g
        ? t_(g)
        : !g;
  },
  s_ = C.createContext(void 0),
  u_ = function () {
    return C.useContext(s_);
  };
function Eb(t, a) {
  return t && a && typeof t == "object" && typeof a == "object"
    ? Object.keys(t).length === Object.keys(a).length &&
        Object.keys(t).reduce(function (r, l) {
          return r && Eb(t[l], a[l]);
        }, !0)
    : t === a;
}
var c_ = C.createContext({
    hotkeys: [],
    enabledScopes: [],
    toggleScope: function () {},
    enableScope: function () {},
    disableScope: function () {},
  }),
  f_ = function () {
    return C.useContext(c_);
  };
function d_(t) {
  var a = C.useRef(void 0);
  return (Eb(a.current, t) || (a.current = t), a.current);
}
var jm = function (a) {
    (a.stopPropagation(), a.preventDefault(), a.stopImmediatePropagation());
  },
  p_ = typeof window < "u" ? C.useLayoutEffect : C.useEffect;
function Rn(t, a, r, l) {
  var s = C.useState(null),
    u = s[0],
    f = s[1],
    p = C.useRef(!1),
    h = r instanceof Array ? (l instanceof Array ? void 0 : l) : r,
    g = hp(t) ? t.join(h == null ? void 0 : h.splitKey) : t,
    y = r instanceof Array ? r : l instanceof Array ? l : void 0,
    v = C.useCallback(a, y ?? []),
    E = C.useRef(v);
  y ? (E.current = v) : (E.current = a);
  var w = d_(h),
    S = f_(),
    b = S.enabledScopes,
    O = u_();
  return (
    p_(
      function () {
        if (
          !(
            (w == null ? void 0 : w.enabled) === !1 ||
            !l_(b, w == null ? void 0 : w.scopes)
          )
        ) {
          var k = function (re, q) {
              var ie;
              if (
                (q === void 0 && (q = !1),
                !(r_(re) && !Sb(re, w == null ? void 0 : w.enableOnFormTags)))
              ) {
                if (u !== null) {
                  var se = u.getRootNode();
                  if (
                    (se instanceof Document || se instanceof ShadowRoot) &&
                    se.activeElement !== u &&
                    !u.contains(se.activeElement)
                  ) {
                    jm(re);
                    return;
                  }
                }
                ((ie = re.target) != null &&
                  ie.isContentEditable &&
                  !(w != null && w.enableOnContentEditable)) ||
                  id(g, w == null ? void 0 : w.splitKey).forEach(function (ve) {
                    var Te,
                      Y = ld(ve, w == null ? void 0 : w.combinationKey);
                    if (
                      o_(re, Y, w == null ? void 0 : w.ignoreModifiers) ||
                      ((Te = Y.keys) != null && Te.includes("*"))
                    ) {
                      if (
                        (w != null &&
                          w.ignoreEventWhen != null &&
                          w.ignoreEventWhen(re)) ||
                        (q && p.current)
                      )
                        return;
                      if (
                        (n_(re, Y, w == null ? void 0 : w.preventDefault),
                        !a_(re, Y, w == null ? void 0 : w.enabled))
                      ) {
                        jm(re);
                        return;
                      }
                      (E.current(re, Y), q || (p.current = !0));
                    }
                  });
              }
            },
            L = function (re) {
              re.key !== void 0 &&
                (vb(dr(re.code)),
                (((w == null ? void 0 : w.keydown) === void 0 &&
                  (w == null ? void 0 : w.keyup) !== !0) ||
                  (w != null && w.keydown)) &&
                  k(re));
            },
            z = function (re) {
              re.key !== void 0 &&
                (bb(dr(re.code)),
                (p.current = !1),
                w != null && w.keyup && k(re, !0));
            },
            Q = u || (h == null ? void 0 : h.document) || document;
          return (
            Q.addEventListener(
              "keyup",
              z,
              h == null ? void 0 : h.eventListenerOptions,
            ),
            Q.addEventListener(
              "keydown",
              L,
              h == null ? void 0 : h.eventListenerOptions,
            ),
            O &&
              id(g, w == null ? void 0 : w.splitKey).forEach(function (ae) {
                return O.addHotkey(
                  ld(
                    ae,
                    w == null ? void 0 : w.combinationKey,
                    w == null ? void 0 : w.description,
                  ),
                );
              }),
            function () {
              (Q.removeEventListener(
                "keyup",
                z,
                h == null ? void 0 : h.eventListenerOptions,
              ),
                Q.removeEventListener(
                  "keydown",
                  L,
                  h == null ? void 0 : h.eventListenerOptions,
                ),
                O &&
                  id(g, w == null ? void 0 : w.splitKey).forEach(function (ae) {
                    return O.removeHotkey(
                      ld(
                        ae,
                        w == null ? void 0 : w.combinationKey,
                        w == null ? void 0 : w.description,
                      ),
                    );
                  }));
            }
          );
        }
      },
      [u, g, w, b],
    ),
    f
  );
}
const h_ = () =>
    x.jsxs("svg", {
      width: 18,
      height: 18,
      viewBox: "0 0 24 24",
      strokeWidth: 2,
      stroke: "currentColor",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        x.jsx("path", { d: "M0 0h24v24H0z", stroke: "none" }),
        x.jsx("path", { d: "M18 6L6 18M6 6l12 12" }),
      ],
    }),
  g_ = () =>
    x.jsx("svg", {
      viewBox: "0 0 24 24",
      strokeWidth: 0.5,
      stroke: "currentColor",
      fill: "currentColor",
      width: 24,
      height: 24,
      children: x.jsx("path", {
        d: "M22 14H9V5a4 4 0 00-8 0v3a1 1 0 002 0V5a2 2 0 014 0v10a8 8 0 0016 0 1 1 0 00-1-1zm-7 7a6.01 6.01 0 01-5.917-5h11.834A6.01 6.01 0 0115 21z",
      }),
    }),
  y_ = () =>
    x.jsxs("svg", {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      strokeWidth: 2,
      stroke: "currentColor",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        x.jsx("path", { d: "M0 0h24v24H0z", stroke: "none" }),
        x.jsx("path", {
          d: "M16 4H9.5a3.5 3.5 0 000 7h.5M14 15V4M10 15V4M5 19h14M7 21l-2-2 2-2",
        }),
      ],
    }),
  m_ = () => (
    C.useEffect(
      () => (
        document.documentElement.removeAttribute("data-storyloaded"),
        () => document.documentElement.setAttribute("data-storyloaded", "")
      ),
      [],
    ),
    x.jsx("div", {
      className: "ladle-ring-wrapper",
      children: x.jsxs("div", {
        className: "ladle-ring",
        children: [
          x.jsx("div", {}),
          x.jsx("div", {}),
          x.jsx("div", {}),
          x.jsx("div", {}),
        ],
      }),
    })
  ),
  v_ = () =>
    x.jsxs("svg", {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      strokeWidth: 2,
      stroke: "currentColor",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        x.jsx("path", { d: "M0 0h24v24H0z", stroke: "none" }),
        x.jsx("path", { d: "M16 4h4v4M14 10l6-6M8 20H4v-4M4 20l6-6" }),
      ],
    }),
  b_ = () =>
    x.jsxs("svg", {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      strokeWidth: 2,
      stroke: "currentColor",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        x.jsx("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        x.jsx("path", {
          d: "M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7",
        }),
        x.jsx("path", {
          d: "M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3",
        }),
        x.jsx("line", { x1: 9.7, y1: 17, x2: 14.3, y2: 17 }),
      ],
    }),
  S_ = () =>
    x.jsx("div", {
      style: { width: "10px", marginInlineEnd: "0.5em", flexShrink: 0 },
      children: x.jsx("svg", {
        fill: "currentColor",
        viewBox: "0 0 768 1024",
        children: x.jsx("path", {
          d: "M509 64l195 218v669q0 3-4 6t-9 3H77q-5 0-9-3t-4-6V73q0-3 4-6t9-3h432zm29-64H77Q45 0 22.5 21.5T0 73v878q0 30 22.5 51.5T77 1024h614q32 0 54.5-21.5T768 951V257zm-26 256V0h-64v256q0 26 19 45t45 19h253v-64H512z",
        }),
      }),
    }),
  E_ = ({ rotate: t }) => {
    const a = "16px",
      r = "16px";
    return x.jsx("div", {
      "aria-hidden": !0,
      style: { width: a, height: r, marginInlineEnd: "0.1em" },
      children: t
        ? x.jsxs("svg", {
            style: { width: a, height: r },
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            fill: "none",
            children: [
              x.jsx("path", {
                stroke: "none",
                d: "M0 0h24v24H0z",
                fill: "none",
              }),
              x.jsx("path", { d: "M9 6l6 6l-6 6" }),
            ],
          })
        : x.jsxs("svg", {
            style: { width: a, height: r },
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            fill: "none",
            children: [
              x.jsx("path", {
                stroke: "none",
                d: "M0 0h24v24H0z",
                fill: "none",
              }),
              x.jsx("path", { d: "M6 9l6 6l6 -6" }),
            ],
          }),
    });
  },
  __ = () =>
    x.jsxs("svg", {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      strokeWidth: 2,
      stroke: "currentColor",
      fill: "none",
      children: [
        x.jsx("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        x.jsx("circle", { cx: 14, cy: 6, r: 2 }),
        x.jsx("line", { x1: 4, y1: 6, x2: 12, y2: 6 }),
        x.jsx("line", { x1: 16, y1: 6, x2: 20, y2: 6 }),
        x.jsx("circle", { cx: 8, cy: 12, r: 2 }),
        x.jsx("line", { x1: 4, y1: 12, x2: 6, y2: 12 }),
        x.jsx("line", { x1: 10, y1: 12, x2: 20, y2: 12 }),
        x.jsx("circle", { cx: 17, cy: 18, r: 2 }),
        x.jsx("line", { x1: 4, y1: 18, x2: 15, y2: 18 }),
        x.jsx("line", { x1: 19, y1: 18, x2: 20, y2: 18 }),
      ],
    }),
  w_ = () =>
    x.jsxs("svg", {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      strokeWidth: 2,
      stroke: "currentColor",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        x.jsx("path", { d: "M0 0h24v24H0z", stroke: "none" }),
        x.jsx("path", { d: "m7 8-4 4 4 4M17 8l4 4-4 4M14 4l-4 16" }),
      ],
    }),
  O_ = () =>
    x.jsxs("svg", {
      width: 24,
      height: 24,
      strokeWidth: 2,
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        x.jsx("path", { d: "M0 0h24v24H0z", stroke: "none" }),
        x.jsx("circle", { cx: 12, cy: 12, r: 9 }),
        x.jsx("path", { d: "m10 16.5 2-3 2 3m-2-3v-2l3-1m-6 0 3 1" }),
        x.jsx("circle", { cx: 12, cy: 7.5, r: 0.5, fill: "currentColor" }),
      ],
    }),
  x_ = () =>
    x.jsxs("svg", {
      width: 24,
      height: 24,
      strokeWidth: 2,
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        x.jsx("path", { d: "M0 0h24v24H0z", stroke: "none" }),
        x.jsx("rect", { x: 13, y: 8, width: 8, height: 12, rx: 1 }),
        x.jsx("path", {
          d: "M18 8V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9M16 9h2",
        }),
      ],
    }),
  C_ = () =>
    x.jsxs("svg", {
      width: 24,
      height: 24,
      strokeWidth: 2,
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        x.jsx("path", { d: "M0 0h24v24H0z", stroke: "none" }),
        x.jsx("path", {
          d: "M18 8a3 3 0 0 1 0 6M10 8v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-5",
        }),
        x.jsx("path", {
          d: "M12 8h0l4.524-3.77A.9.9 0 0 1 18 4.922v12.156a.9.9 0 0 1-1.476.692L12 14H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h8",
        }),
      ],
    });
var od = { exports: {} },
  Gt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var zm;
function T_() {
  if (zm) return Gt;
  zm = 1;
  var t = pp();
  function a(h) {
    var g = "https://react.dev/errors/" + h;
    if (1 < arguments.length) {
      g += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var y = 2; y < arguments.length; y++)
        g += "&args[]=" + encodeURIComponent(arguments[y]);
    }
    return (
      "Minified React error #" +
      h +
      "; visit " +
      g +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function r() {}
  var l = {
      d: {
        f: r,
        r: function () {
          throw Error(a(522));
        },
        D: r,
        C: r,
        L: r,
        m: r,
        X: r,
        S: r,
        M: r,
      },
      p: 0,
      findDOMNode: null,
    },
    s = Symbol.for("react.portal");
  function u(h, g, y) {
    var v =
      3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: s,
      key: v == null ? null : "" + v,
      children: h,
      containerInfo: g,
      implementation: y,
    };
  }
  var f = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function p(h, g) {
    if (h === "font") return "";
    if (typeof g == "string") return g === "use-credentials" ? g : "";
  }
  return (
    (Gt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = l),
    (Gt.createPortal = function (h, g) {
      var y =
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!g || (g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11))
        throw Error(a(299));
      return u(h, g, null, y);
    }),
    (Gt.flushSync = function (h) {
      var g = f.T,
        y = l.p;
      try {
        if (((f.T = null), (l.p = 2), h)) return h();
      } finally {
        ((f.T = g), (l.p = y), l.d.f());
      }
    }),
    (Gt.preconnect = function (h, g) {
      typeof h == "string" &&
        (g
          ? ((g = g.crossOrigin),
            (g =
              typeof g == "string"
                ? g === "use-credentials"
                  ? g
                  : ""
                : void 0))
          : (g = null),
        l.d.C(h, g));
    }),
    (Gt.prefetchDNS = function (h) {
      typeof h == "string" && l.d.D(h);
    }),
    (Gt.preinit = function (h, g) {
      if (typeof h == "string" && g && typeof g.as == "string") {
        var y = g.as,
          v = p(y, g.crossOrigin),
          E = typeof g.integrity == "string" ? g.integrity : void 0,
          w = typeof g.fetchPriority == "string" ? g.fetchPriority : void 0;
        y === "style"
          ? l.d.S(h, typeof g.precedence == "string" ? g.precedence : void 0, {
              crossOrigin: v,
              integrity: E,
              fetchPriority: w,
            })
          : y === "script" &&
            l.d.X(h, {
              crossOrigin: v,
              integrity: E,
              fetchPriority: w,
              nonce: typeof g.nonce == "string" ? g.nonce : void 0,
            });
      }
    }),
    (Gt.preinitModule = function (h, g) {
      if (typeof h == "string")
        if (typeof g == "object" && g !== null) {
          if (g.as == null || g.as === "script") {
            var y = p(g.as, g.crossOrigin);
            l.d.M(h, {
              crossOrigin: y,
              integrity: typeof g.integrity == "string" ? g.integrity : void 0,
              nonce: typeof g.nonce == "string" ? g.nonce : void 0,
            });
          }
        } else g == null && l.d.M(h);
    }),
    (Gt.preload = function (h, g) {
      if (
        typeof h == "string" &&
        typeof g == "object" &&
        g !== null &&
        typeof g.as == "string"
      ) {
        var y = g.as,
          v = p(y, g.crossOrigin);
        l.d.L(h, y, {
          crossOrigin: v,
          integrity: typeof g.integrity == "string" ? g.integrity : void 0,
          nonce: typeof g.nonce == "string" ? g.nonce : void 0,
          type: typeof g.type == "string" ? g.type : void 0,
          fetchPriority:
            typeof g.fetchPriority == "string" ? g.fetchPriority : void 0,
          referrerPolicy:
            typeof g.referrerPolicy == "string" ? g.referrerPolicy : void 0,
          imageSrcSet:
            typeof g.imageSrcSet == "string" ? g.imageSrcSet : void 0,
          imageSizes: typeof g.imageSizes == "string" ? g.imageSizes : void 0,
          media: typeof g.media == "string" ? g.media : void 0,
        });
      }
    }),
    (Gt.preloadModule = function (h, g) {
      if (typeof h == "string")
        if (g) {
          var y = p(g.as, g.crossOrigin);
          l.d.m(h, {
            as: typeof g.as == "string" && g.as !== "script" ? g.as : void 0,
            crossOrigin: y,
            integrity: typeof g.integrity == "string" ? g.integrity : void 0,
          });
        } else l.d.m(h);
    }),
    (Gt.requestFormReset = function (h) {
      l.d.r(h);
    }),
    (Gt.unstable_batchedUpdates = function (h, g) {
      return h(g);
    }),
    (Gt.useFormState = function (h, g, y) {
      return f.H.useFormState(h, g, y);
    }),
    (Gt.useFormStatus = function () {
      return f.H.useHostTransitionStatus();
    }),
    (Gt.version = "19.2.7"),
    Gt
  );
}
var Bm;
function _b() {
  if (Bm) return od.exports;
  Bm = 1;
  function t() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (a) {
        console.error(a);
      }
  }
  return (t(), (od.exports = T_()), od.exports);
}
var wb = _b();
const Um = Oo(wb);
function Ud() {
  return (
    (sa =
      Object.assign ||
      function (t) {
        for (let a = 1; a < arguments.length; a++) {
          const r = arguments[a];
          for (const l in r)
            Object.prototype.hasOwnProperty.call(r, l) && (t[l] = r[l]);
        }
        return t;
      }),
    sa.apply(this, arguments)
  );
}
function gp(t, a, r) {
  return (
    (r = {
      path: a,
      exports: {},
      require: function (l, s) {
        return A_(l, s ?? r.path);
      },
    }),
    t(r, r.exports),
    r.exports
  );
}
function A_() {
  throw new Error(
    "Dynamic requires are not currently supported by @rollup/plugin-commonjs",
  );
}
let Ii;
typeof window < "u"
  ? (Ii = window)
  : typeof self < "u"
    ? (Ii = self)
    : (Ii = {});
Ii.setTimeout;
Ii.clearTimeout;
function xo() {}
const io = Ii.performance || {};
io.now || io.mozNow || io.msNow || io.oNow || io.webkitNow;
const R_ = function (t, a) {
    let r;
    const l = toObject(t);
    let s;
    for (let u = 1; u < arguments.length; u++) {
      r = Object(arguments[u]);
      for (const f in r) hasOwnProperty.call(r, f) && (l[f] = r[f]);
      if (getOwnPropertySymbols) {
        s = getOwnPropertySymbols(r);
        for (let f = 0; f < s.length; f++)
          propIsEnumerable.call(r, s[f]) && (l[s[f]] = r[s[f]]);
      }
    }
    return l;
  },
  k_ = xb() ? C.useLayoutEffect : C.useEffect,
  Fm = {};
let Ob = xo;
Ob = function (a) {
  Fm[a] || (Fm[a] = !0);
};
function D_(t, a) {
  if (t != null)
    if (N_(t)) t(a);
    else
      try {
        t.current = a;
      } catch {
        throw new Error('Cannot assign value "' + a + '" to ref "' + t + '"');
      }
}
function xb() {
  return !!(
    typeof window < "u" &&
    window.document &&
    window.document.createElement
  );
}
function ju(t) {
  return C.forwardRef(t);
}
function L_(t) {
  return xb() ? (t ? t.ownerDocument : document) : null;
}
function N_(t) {
  return !!(t && {}.toString.call(t) == "[object Function]");
}
function M_(t) {
  return typeof t == "string";
}
let Cb = xo;
Cb = function (a) {
  const r = C.useRef(a);
  (C.useEffect(
    function () {
      return void (r.current = a);
    },
    [a],
  ),
    C.useEffect(function () {
      return Ob(r.current);
    }, []));
};
function j_() {
  const t = C.useState(Object.create(null)),
    a = t[1];
  return C.useCallback(function () {
    a(Object.create(null));
  }, []);
}
function z_() {
  for (var t = arguments.length, a = new Array(t), r = 0; r < t; r++)
    a[r] = arguments[r];
  return C.useMemo(function () {
    return a.every(function (l) {
      return l == null;
    })
      ? null
      : function (l) {
          a.forEach(function (s) {
            D_(s, l);
          });
        };
  }, [].concat(a));
}
function Ws(t, a) {
  return function (r) {
    if ((t && t(r), !r.defaultPrevented)) return a(r);
  };
}
const Tb = function (a) {
  const r = a.children,
    l = a.type,
    s = l === void 0 ? "reach-portal" : l,
    u = C.useRef(null),
    f = C.useRef(null),
    p = j_();
  return (
    k_(
      function () {
        if (!u.current) return;
        const h = u.current.ownerDocument;
        return (
          (f.current = h == null ? void 0 : h.createElement(s)),
          h.body.appendChild(f.current),
          p(),
          function () {
            f.current &&
              f.current.ownerDocument &&
              f.current.ownerDocument.body.removeChild(f.current);
          }
        );
      },
      [s, p],
    ),
    f.current
      ? wb.createPortal(r, f.current)
      : C.createElement("span", { ref: u })
  );
};
Tb.displayName = "Portal";
function B_(t, a) {
  if (t == null) return {};
  const r = {},
    l = Object.keys(t);
  let s, u;
  for (u = 0; u < l.length; u++)
    ((s = l[u]), !(a.indexOf(s) >= 0) && (r[s] = t[s]));
  return r;
}
const U_ = gp(function (t, a) {
    (function () {
      const r = typeof Symbol == "function" && Symbol.for,
        l = r ? Symbol.for("react.element") : 60103,
        s = r ? Symbol.for("react.portal") : 60106,
        u = r ? Symbol.for("react.fragment") : 60107,
        f = r ? Symbol.for("react.strict_mode") : 60108,
        p = r ? Symbol.for("react.profiler") : 60114,
        h = r ? Symbol.for("react.provider") : 60109,
        g = r ? Symbol.for("react.context") : 60110,
        y = r ? Symbol.for("react.async_mode") : 60111,
        v = r ? Symbol.for("react.concurrent_mode") : 60111,
        E = r ? Symbol.for("react.forward_ref") : 60112,
        w = r ? Symbol.for("react.suspense") : 60113,
        S = r ? Symbol.for("react.suspense_list") : 60120,
        b = r ? Symbol.for("react.memo") : 60115,
        O = r ? Symbol.for("react.lazy") : 60116,
        k = r ? Symbol.for("react.block") : 60121,
        L = r ? Symbol.for("react.fundamental") : 60117,
        z = r ? Symbol.for("react.responder") : 60118,
        Q = r ? Symbol.for("react.scope") : 60119;
      function ae(_e) {
        return (
          typeof _e == "string" ||
          typeof _e == "function" ||
          _e === u ||
          _e === v ||
          _e === p ||
          _e === f ||
          _e === w ||
          _e === S ||
          (typeof _e == "object" &&
            _e !== null &&
            (_e.$$typeof === O ||
              _e.$$typeof === b ||
              _e.$$typeof === h ||
              _e.$$typeof === g ||
              _e.$$typeof === E ||
              _e.$$typeof === L ||
              _e.$$typeof === z ||
              _e.$$typeof === Q ||
              _e.$$typeof === k))
        );
      }
      function re(_e) {
        if (typeof _e == "object" && _e !== null) {
          const Gn = _e.$$typeof;
          switch (Gn) {
            case l:
              var mn = _e.type;
              switch (mn) {
                case y:
                case v:
                case u:
                case p:
                case f:
                case w:
                  return mn;
                default:
                  var vn = mn && mn.$$typeof;
                  switch (vn) {
                    case g:
                    case E:
                    case O:
                    case b:
                    case h:
                      return vn;
                    default:
                      return Gn;
                  }
              }
            case s:
              return Gn;
          }
        }
      }
      const q = y,
        ie = v,
        se = g,
        ve = h,
        Te = l,
        Y = E,
        oe = u,
        ue = O,
        de = b,
        M = s,
        Z = p,
        ne = f,
        he = w;
      let fe = !1;
      function A(_e) {
        return (
          fe ||
            ((fe = !0),
            console.warn(
              "The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.",
            )),
          V(_e) || re(_e) === y
        );
      }
      function V(_e) {
        return re(_e) === v;
      }
      function B(_e) {
        return re(_e) === g;
      }
      function ce(_e) {
        return re(_e) === h;
      }
      function Ce(_e) {
        return typeof _e == "object" && _e !== null && _e.$$typeof === l;
      }
      function ge(_e) {
        return re(_e) === E;
      }
      function ke(_e) {
        return re(_e) === u;
      }
      function We(_e) {
        return re(_e) === O;
      }
      function qe(_e) {
        return re(_e) === b;
      }
      function rn(_e) {
        return re(_e) === s;
      }
      function bt(_e) {
        return re(_e) === p;
      }
      function Dn(_e) {
        return re(_e) === f;
      }
      function Ln(_e) {
        return re(_e) === w;
      }
      ((a.AsyncMode = q),
        (a.ConcurrentMode = ie),
        (a.ContextConsumer = se),
        (a.ContextProvider = ve),
        (a.Element = Te),
        (a.ForwardRef = Y),
        (a.Fragment = oe),
        (a.Lazy = ue),
        (a.Memo = de),
        (a.Portal = M),
        (a.Profiler = Z),
        (a.StrictMode = ne),
        (a.Suspense = he),
        (a.isAsyncMode = A),
        (a.isConcurrentMode = V),
        (a.isContextConsumer = B),
        (a.isContextProvider = ce),
        (a.isElement = Ce),
        (a.isForwardRef = ge),
        (a.isFragment = ke),
        (a.isLazy = We),
        (a.isMemo = qe),
        (a.isPortal = rn),
        (a.isProfiler = bt),
        (a.isStrictMode = Dn),
        (a.isSuspense = Ln),
        (a.isValidElementType = ae),
        (a.typeOf = re));
    })();
  }),
  Ab = gp(function (t) {
    t.exports = U_;
  }),
  F_ = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED",
  Hr = F_;
let Fd = function () {};
{
  var I_ = Hr,
    Id = {},
    H_ = Function.call.bind(Object.prototype.hasOwnProperty);
  Fd = function (t) {
    const a = "Warning: " + t;
    typeof console < "u" && console.error(a);
    try {
      throw new Error(a);
    } catch {}
  };
}
function Rb(t, a, r, l, s) {
  for (const f in t)
    if (H_(t, f)) {
      var u;
      try {
        if (typeof t[f] != "function") {
          const p = Error(
            (l || "React class") +
              ": " +
              r +
              " type `" +
              f +
              "` is invalid; it must be a function, usually from the `prop-types` package, but received `" +
              typeof t[f] +
              "`.",
          );
          throw ((p.name = "Invariant Violation"), p);
        }
        u = t[f](a, f, l, r, null, I_);
      } catch (p) {
        u = p;
      }
      if (
        (u &&
          !(u instanceof Error) &&
          Fd(
            (l || "React class") +
              ": type specification of " +
              r +
              " `" +
              f +
              "` is invalid; the type checker function must return `null` or an `Error` but returned a " +
              typeof u +
              ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).",
          ),
        u instanceof Error && !(u.message in Id))
      ) {
        Id[u.message] = !0;
        const p = s ? s() : "";
        Fd("Failed " + r + " type: " + u.message + (p ?? ""));
      }
    }
}
Rb.resetWarningCache = function () {
  Id = {};
};
const Im = Rb,
  $_ = Function.call.bind(Object.prototype.hasOwnProperty);
let co = function () {};
co = function (t) {
  const a = "Warning: " + t;
  typeof console < "u" && console.error(a);
  try {
    throw new Error(a);
  } catch {}
};
function Ps() {
  return null;
}
const V_ = function (t, a) {
    const r = typeof Symbol == "function" && Symbol.iterator,
      l = "@@iterator";
    function s(Y) {
      const oe = Y && ((r && Y[r]) || Y[l]);
      if (typeof oe == "function") return oe;
    }
    const u = "<<anonymous>>",
      f = {
        array: y("array"),
        bool: y("boolean"),
        func: y("function"),
        number: y("number"),
        object: y("object"),
        string: y("string"),
        symbol: y("symbol"),
        any: v(),
        arrayOf: E,
        element: w(),
        elementType: S(),
        instanceOf: b,
        node: z(),
        objectOf: k,
        oneOf: O,
        oneOfType: L,
        shape: Q,
        exact: ae,
      };
    function p(Y, oe) {
      return Y === oe ? Y !== 0 || 1 / Y === 1 / oe : Y !== Y && oe !== oe;
    }
    function h(Y) {
      ((this.message = Y), (this.stack = ""));
    }
    h.prototype = Error.prototype;
    function g(Y) {
      function oe(de, M, Z, ne, he, fe, A) {
        if (((ne = ne || u), (fe = fe || Z), A !== Hr)) {
          const V = new Error(
            "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types",
          );
          throw ((V.name = "Invariant Violation"), V);
        }
        return M[Z] == null
          ? de
            ? M[Z] === null
              ? new h(
                  "The " +
                    he +
                    " `" +
                    fe +
                    "` is marked as required " +
                    ("in `" + ne + "`, but its value is `null`."),
                )
              : new h(
                  "The " +
                    he +
                    " `" +
                    fe +
                    "` is marked as required in " +
                    ("`" + ne + "`, but its value is `undefined`."),
                )
            : null
          : Y(M, Z, ne, he, fe);
      }
      const ue = oe.bind(null, !1);
      return ((ue.isRequired = oe.bind(null, !0)), ue);
    }
    function y(Y) {
      function oe(ue, de, M, Z, ne, he) {
        const fe = ue[de];
        if (ie(fe) !== Y) {
          const V = se(fe);
          return new h(
            "Invalid " +
              Z +
              " `" +
              ne +
              "` of type " +
              ("`" + V + "` supplied to `" + M + "`, expected ") +
              ("`" + Y + "`."),
          );
        }
        return null;
      }
      return g(oe);
    }
    function v() {
      return g(Ps);
    }
    function E(Y) {
      function oe(ue, de, M, Z, ne) {
        if (typeof Y != "function")
          return new h(
            "Property `" +
              ne +
              "` of component `" +
              M +
              "` has invalid PropType notation inside arrayOf.",
          );
        const he = ue[de];
        if (!Array.isArray(he)) {
          const fe = ie(he);
          return new h(
            "Invalid " +
              Z +
              " `" +
              ne +
              "` of type " +
              ("`" + fe + "` supplied to `" + M + "`, expected an array."),
          );
        }
        for (let fe = 0; fe < he.length; fe++) {
          const A = Y(he, fe, M, Z, ne + "[" + fe + "]", Hr);
          if (A instanceof Error) return A;
        }
        return null;
      }
      return g(oe);
    }
    function w() {
      function Y(oe, ue, de, M, Z) {
        const ne = oe[ue];
        if (!t(ne)) {
          const he = ie(ne);
          return new h(
            "Invalid " +
              M +
              " `" +
              Z +
              "` of type " +
              ("`" +
                he +
                "` supplied to `" +
                de +
                "`, expected a single ReactElement."),
          );
        }
        return null;
      }
      return g(Y);
    }
    function S() {
      function Y(oe, ue, de, M, Z) {
        const ne = oe[ue];
        if (!Ab.isValidElementType(ne)) {
          const he = ie(ne);
          return new h(
            "Invalid " +
              M +
              " `" +
              Z +
              "` of type " +
              ("`" +
                he +
                "` supplied to `" +
                de +
                "`, expected a single ReactElement type."),
          );
        }
        return null;
      }
      return g(Y);
    }
    function b(Y) {
      function oe(ue, de, M, Z, ne) {
        if (!(ue[de] instanceof Y)) {
          const he = Y.name || u,
            fe = Te(ue[de]);
          return new h(
            "Invalid " +
              Z +
              " `" +
              ne +
              "` of type " +
              ("`" + fe + "` supplied to `" + M + "`, expected ") +
              ("instance of `" + he + "`."),
          );
        }
        return null;
      }
      return g(oe);
    }
    function O(Y) {
      if (!Array.isArray(Y))
        return (
          arguments.length > 1
            ? co(
                "Invalid arguments supplied to oneOf, expected an array, got " +
                  arguments.length +
                  " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).",
              )
            : co("Invalid argument supplied to oneOf, expected an array."),
          Ps
        );
      function oe(ue, de, M, Z, ne) {
        const he = ue[de];
        for (let A = 0; A < Y.length; A++) if (p(he, Y[A])) return null;
        const fe = JSON.stringify(Y, function (V, B) {
          return se(B) === "symbol" ? String(B) : B;
        });
        return new h(
          "Invalid " +
            Z +
            " `" +
            ne +
            "` of value `" +
            String(he) +
            "` " +
            ("supplied to `" + M + "`, expected one of " + fe + "."),
        );
      }
      return g(oe);
    }
    function k(Y) {
      function oe(ue, de, M, Z, ne) {
        if (typeof Y != "function")
          return new h(
            "Property `" +
              ne +
              "` of component `" +
              M +
              "` has invalid PropType notation inside objectOf.",
          );
        const he = ue[de],
          fe = ie(he);
        if (fe !== "object")
          return new h(
            "Invalid " +
              Z +
              " `" +
              ne +
              "` of type " +
              ("`" + fe + "` supplied to `" + M + "`, expected an object."),
          );
        for (const A in he)
          if ($_(he, A)) {
            const V = Y(he, A, M, Z, ne + "." + A, Hr);
            if (V instanceof Error) return V;
          }
        return null;
      }
      return g(oe);
    }
    function L(Y) {
      if (!Array.isArray(Y))
        return (
          co(
            "Invalid argument supplied to oneOfType, expected an instance of array.",
          ),
          Ps
        );
      for (let ue = 0; ue < Y.length; ue++) {
        const de = Y[ue];
        if (typeof de != "function")
          return (
            co(
              "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " +
                ve(de) +
                " at index " +
                ue +
                ".",
            ),
            Ps
          );
      }
      function oe(ue, de, M, Z, ne) {
        for (let he = 0; he < Y.length; he++) {
          const fe = Y[he];
          if (fe(ue, de, M, Z, ne, Hr) == null) return null;
        }
        return new h(
          "Invalid " + Z + " `" + ne + "` supplied to " + ("`" + M + "`."),
        );
      }
      return g(oe);
    }
    function z() {
      function Y(oe, ue, de, M, Z) {
        return re(oe[ue])
          ? null
          : new h(
              "Invalid " +
                M +
                " `" +
                Z +
                "` supplied to " +
                ("`" + de + "`, expected a ReactNode."),
            );
      }
      return g(Y);
    }
    function Q(Y) {
      function oe(ue, de, M, Z, ne) {
        const he = ue[de],
          fe = ie(he);
        if (fe !== "object")
          return new h(
            "Invalid " +
              Z +
              " `" +
              ne +
              "` of type `" +
              fe +
              "` " +
              ("supplied to `" + M + "`, expected `object`."),
          );
        for (const A in Y) {
          const V = Y[A];
          if (!V) continue;
          const B = V(he, A, M, Z, ne + "." + A, Hr);
          if (B) return B;
        }
        return null;
      }
      return g(oe);
    }
    function ae(Y) {
      function oe(ue, de, M, Z, ne) {
        const he = ue[de],
          fe = ie(he);
        if (fe !== "object")
          return new h(
            "Invalid " +
              Z +
              " `" +
              ne +
              "` of type `" +
              fe +
              "` " +
              ("supplied to `" + M + "`, expected `object`."),
          );
        const A = R_({}, ue[de], Y);
        for (const V in A) {
          const B = Y[V];
          if (!B)
            return new h(
              "Invalid " +
                Z +
                " `" +
                ne +
                "` key `" +
                V +
                "` supplied to `" +
                M +
                "`.\nBad object: " +
                JSON.stringify(ue[de], null, "  ") +
                `
Valid keys: ` +
                JSON.stringify(Object.keys(Y), null, "  "),
            );
          const ce = B(he, V, M, Z, ne + "." + V, Hr);
          if (ce) return ce;
        }
        return null;
      }
      return g(oe);
    }
    function re(Y) {
      switch (typeof Y) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !Y;
        case "object":
          if (Array.isArray(Y)) return Y.every(re);
          if (Y === null || t(Y)) return !0;
          var oe = s(Y);
          if (oe) {
            const ue = oe.call(Y);
            let de;
            if (oe !== Y.entries) {
              for (; !(de = ue.next()).done; ) if (!re(de.value)) return !1;
            } else
              for (; !(de = ue.next()).done; ) {
                const M = de.value;
                if (M && !re(M[1])) return !1;
              }
          } else return !1;
          return !0;
        default:
          return !1;
      }
    }
    function q(Y, oe) {
      return Y === "symbol"
        ? !0
        : oe
          ? oe["@@toStringTag"] === "Symbol" ||
            (typeof Symbol == "function" && oe instanceof Symbol)
          : !1;
    }
    function ie(Y) {
      const oe = typeof Y;
      return Array.isArray(Y)
        ? "array"
        : Y instanceof RegExp
          ? "object"
          : q(oe, Y)
            ? "symbol"
            : oe;
    }
    function se(Y) {
      if (typeof Y > "u" || Y === null) return "" + Y;
      const oe = ie(Y);
      if (oe === "object") {
        if (Y instanceof Date) return "date";
        if (Y instanceof RegExp) return "regexp";
      }
      return oe;
    }
    function ve(Y) {
      const oe = se(Y);
      switch (oe) {
        case "array":
        case "object":
          return "an " + oe;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + oe;
        default:
          return oe;
      }
    }
    function Te(Y) {
      return !Y.constructor || !Y.constructor.name ? u : Y.constructor.name;
    }
    return (
      (f.checkPropTypes = Im),
      (f.resetWarningCache = Im.resetWarningCache),
      (f.PropTypes = f),
      f
    );
  },
  Qe = gp(function (t) {
    {
      const a = Ab;
      t.exports = V_(a.isElement);
    }
  }),
  Hd = "data-focus-lock",
  kb = "data-focus-lock-disabled",
  G_ = "data-no-focus-lock",
  P_ = "data-autofocus-inside";
function q_(t, a) {
  return (typeof t == "function" ? t(a) : t && (t.current = a), t);
}
function Y_(t, a) {
  var r = C.useState(function () {
    return {
      value: t,
      callback: a,
      facade: {
        get current() {
          return r.value;
        },
        set current(l) {
          const s = r.value;
          s !== l && ((r.value = l), r.callback(l, s));
        },
      },
    };
  })[0];
  return ((r.callback = a), r.facade);
}
function Db(t, a) {
  return Y_(a, function (r) {
    return t.forEach(function (l) {
      return q_(l, r);
    });
  });
}
const sd = {
  width: "1px",
  height: "0px",
  padding: 0,
  overflow: "hidden",
  position: "fixed",
  top: "1px",
  left: "1px",
};
Qe.node;
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ var uu =
  function () {
    return (
      (uu =
        Object.assign ||
        function (a) {
          for (var r, l = 1, s = arguments.length; l < s; l++) {
            r = arguments[l];
            for (const u in r)
              Object.prototype.hasOwnProperty.call(r, u) && (a[u] = r[u]);
          }
          return a;
        }),
      uu.apply(this, arguments)
    );
  };
function Z_(t, a) {
  const r = {};
  for (var l in t)
    Object.prototype.hasOwnProperty.call(t, l) &&
      a.indexOf(l) < 0 &&
      (r[l] = t[l]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, l = Object.getOwnPropertySymbols(t); s < l.length; s++)
      a.indexOf(l[s]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(t, l[s]) &&
        (r[l[s]] = t[l[s]]);
  return r;
}
function Lb(t) {
  return t;
}
function Nb(t, a) {
  a === void 0 && (a = Lb);
  let r = [],
    l = !1;
  return {
    read: function () {
      if (l)
        throw new Error(
          "Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.",
        );
      return r.length ? r[r.length - 1] : t;
    },
    useMedium: function (u) {
      const f = a(u, l);
      return (
        r.push(f),
        function () {
          r = r.filter(function (p) {
            return p !== f;
          });
        }
      );
    },
    assignSyncMedium: function (u) {
      for (l = !0; r.length; ) {
        const f = r;
        ((r = []), f.forEach(u));
      }
      r = {
        push: function (f) {
          return u(f);
        },
        filter: function () {
          return r;
        },
      };
    },
    assignMedium: function (u) {
      l = !0;
      let f = [];
      if (r.length) {
        const g = r;
        ((r = []), g.forEach(u), (f = r));
      }
      const p = function () {
          const g = f;
          ((f = []), g.forEach(u));
        },
        h = function () {
          return Promise.resolve().then(p);
        };
      (h(),
        (r = {
          push: function (g) {
            (f.push(g), h());
          },
          filter: function (g) {
            return ((f = f.filter(g)), r);
          },
        }));
    },
  };
}
function yp(t, a) {
  return (a === void 0 && (a = Lb), Nb(t, a));
}
function Mb(t) {
  t === void 0 && (t = {});
  const a = Nb(null);
  return ((a.options = uu({ async: !0, ssr: !1 }, t)), a);
}
const jb = function (t) {
  const a = t.sideCar,
    r = Z_(t, ["sideCar"]);
  if (!a)
    throw new Error(
      "Sidecar: please provide `sideCar` property to import the right car",
    );
  const l = a.read();
  if (!l) throw new Error("Sidecar medium not found");
  return C.createElement(l, uu({}, r));
};
jb.isSideCarExport = !0;
function X_(t, a) {
  return (t.useMedium(a), jb);
}
const zb = yp({}, function (t) {
    const a = t.target,
      r = t.currentTarget;
    return { target: a, currentTarget: r };
  }),
  Bb = yp(),
  K_ = yp(),
  Q_ = Mb({ async: !0 }),
  J_ = [],
  zu = C.forwardRef(function (a, r) {
    let l;
    const s = C.useState(),
      u = s[0],
      f = s[1],
      p = C.useRef(),
      h = C.useRef(!1),
      g = C.useRef(null),
      y = a.children,
      v = a.disabled,
      E = a.noFocusGuards,
      w = a.persistentFocus,
      S = a.crossFrame,
      b = a.autoFocus,
      O = a.allowTextSelection,
      k = a.group,
      L = a.className,
      z = a.whiteList,
      Q = a.shards,
      ae = Q === void 0 ? J_ : Q,
      re = a.as,
      q = re === void 0 ? "div" : re,
      ie = a.lockProps,
      se = ie === void 0 ? {} : ie,
      ve = a.sideCar,
      Te = a.returnFocus,
      Y = a.onActivation,
      oe = a.onDeactivation,
      ue = C.useState({}),
      de = ue[0],
      M = C.useCallback(
        function () {
          ((g.current = g.current || (document && document.activeElement)),
            p.current && Y && Y(p.current),
            (h.current = !0));
        },
        [Y],
      ),
      Z = C.useCallback(
        function () {
          ((h.current = !1), oe && oe(p.current));
        },
        [oe],
      ),
      ne = C.useCallback(
        function (ge) {
          const ke = g.current;
          if (Te && ke && ke.focus) {
            const We = typeof Te == "object" ? Te : void 0;
            ((g.current = null),
              ge
                ? Promise.resolve().then(function () {
                    return ke.focus(We);
                  })
                : ke.focus(We));
          }
        },
        [Te],
      ),
      he = C.useCallback(function (ge) {
        h.current && zb.useMedium(ge);
      }, []),
      fe = Bb.useMedium,
      A = C.useCallback(function (ge) {
        p.current !== ge && ((p.current = ge), f(ge));
      }, []);
    (typeof O < "u" &&
      console.warn(
        "React-Focus-Lock: allowTextSelection is deprecated and enabled by default",
      ),
      C.useEffect(function () {
        p.current ||
          console.error("FocusLock: could not obtain ref to internal node");
      }, []));
    const V = Ud(((l = {}), (l[kb] = v && "disabled"), (l[Hd] = k), l), se),
      B = E !== !0,
      ce = B && E !== "tail",
      Ce = Db([r, A]);
    return C.createElement(
      C.Fragment,
      null,
      B && [
        C.createElement("div", {
          key: "guard-first",
          "data-focus-guard": !0,
          tabIndex: v ? -1 : 0,
          style: sd,
        }),
        C.createElement("div", {
          key: "guard-nearest",
          "data-focus-guard": !0,
          tabIndex: v ? -1 : 1,
          style: sd,
        }),
      ],
      !v &&
        C.createElement(ve, {
          id: de,
          sideCar: Q_,
          observed: u,
          disabled: v,
          persistentFocus: w,
          crossFrame: S,
          autoFocus: b,
          whiteList: z,
          shards: ae,
          onActivation: M,
          onDeactivation: Z,
          returnFocus: ne,
        }),
      C.createElement(
        q,
        Ud({ ref: Ce }, V, { className: L, onBlur: fe, onFocus: he }),
        y,
      ),
      ce &&
        C.createElement("div", {
          "data-focus-guard": !0,
          tabIndex: v ? -1 : 0,
          style: sd,
        }),
    );
  });
zu.propTypes = {
  children: Qe.node,
  disabled: Qe.bool,
  returnFocus: Qe.oneOfType([Qe.bool, Qe.object]),
  noFocusGuards: Qe.bool,
  allowTextSelection: Qe.bool,
  autoFocus: Qe.bool,
  persistentFocus: Qe.bool,
  crossFrame: Qe.bool,
  group: Qe.string,
  className: Qe.string,
  whiteList: Qe.func,
  shards: Qe.arrayOf(Qe.any),
  as: Qe.oneOfType([Qe.string, Qe.func, Qe.object]),
  lockProps: Qe.object,
  onActivation: Qe.func,
  onDeactivation: Qe.func,
  sideCar: Qe.any.isRequired,
};
zu.defaultProps = {
  children: void 0,
  disabled: !1,
  returnFocus: !1,
  noFocusGuards: !1,
  autoFocus: !0,
  persistentFocus: !1,
  crossFrame: !0,
  allowTextSelection: void 0,
  group: void 0,
  className: void 0,
  whiteList: void 0,
  shards: void 0,
  as: "div",
  lockProps: {},
  onActivation: void 0,
  onDeactivation: void 0,
};
function $d(t, a) {
  return (
    ($d =
      Object.setPrototypeOf ||
      function (l, s) {
        return ((l.__proto__ = s), l);
      }),
    $d(t, a)
  );
}
function W_(t, a) {
  ((t.prototype = Object.create(a.prototype)),
    (t.prototype.constructor = t),
    $d(t, a));
}
function ew(t, a, r) {
  return (
    a in t
      ? Object.defineProperty(t, a, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[a] = r),
    t
  );
}
function tw(t, a) {
  {
    if (typeof t != "function")
      throw new Error("Expected reducePropsToState to be a function.");
    if (typeof a != "function")
      throw new Error("Expected handleStateChangeOnClient to be a function.");
  }
  function r(l) {
    return l.displayName || l.name || "Component";
  }
  return function (s) {
    if (typeof s != "function")
      throw new Error("Expected WrappedComponent to be a React component.");
    const u = [];
    let f;
    function p() {
      ((f = t(
        u.map(function (g) {
          return g.props;
        }),
      )),
        a(f));
    }
    const h = (function (g) {
      W_(y, g);
      function y() {
        return g.apply(this, arguments) || this;
      }
      y.peek = function () {
        return f;
      };
      const v = y.prototype;
      return (
        (v.componentDidMount = function () {
          (u.push(this), p());
        }),
        (v.componentDidUpdate = function () {
          p();
        }),
        (v.componentWillUnmount = function () {
          const w = u.indexOf(this);
          (u.splice(w, 1), p());
        }),
        (v.render = function () {
          return C.createElement(s, this.props);
        }),
        y
      );
    })(C.PureComponent);
    return (ew(h, "displayName", "SideEffect(" + r(s) + ")"), h);
  };
}
const hr = function (t) {
    const a = Array(t.length);
    for (let r = 0; r < t.length; ++r) a[r] = t[r];
    return a;
  },
  Vd = function (t) {
    return Array.isArray(t) ? t : [t];
  },
  nw = function (t) {
    const a = new Set(),
      r = t.length;
    for (let l = 0; l < r; l += 1)
      for (let s = l + 1; s < r; s += 1) {
        const u = t[l].compareDocumentPosition(t[s]);
        ((u & Node.DOCUMENT_POSITION_CONTAINED_BY) > 0 && a.add(s),
          (u & Node.DOCUMENT_POSITION_CONTAINS) > 0 && a.add(l));
      }
    return t.filter(function (l, s) {
      return !a.has(s);
    });
  };
var Ub = function (t) {
  return t.parentNode ? Ub(t.parentNode) : t;
};
const mp = function (t) {
    return Vd(t)
      .filter(Boolean)
      .reduce(function (r, l) {
        const s = l.getAttribute(Hd);
        return (
          r.push.apply(
            r,
            s
              ? nw(
                  hr(
                    Ub(l).querySelectorAll(
                      "[" + Hd + '="' + s + '"]:not([' + kb + '="disabled"])',
                    ),
                  ),
                )
              : [l],
          ),
          r
        );
      }, []);
  },
  aw = function (t) {
    return !t || !t.getPropertyValue
      ? !1
      : t.getPropertyValue("display") === "none" ||
          t.getPropertyValue("visibility") === "hidden";
  };
var Fb = function (t) {
  return (
    !t ||
    t === document ||
    (t && t.nodeType === Node.DOCUMENT_NODE) ||
    (!aw(window.getComputedStyle(t, null)) &&
      Fb(
        t.parentNode && t.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE
          ? t.parentNode.host
          : t.parentNode,
      ))
  );
};
const rw = function (t) {
    return !(
      (t.tagName === "INPUT" || t.tagName === "BUTTON") &&
      (t.type === "hidden" || t.disabled)
    );
  },
  vp = function (t) {
    return !!(t && t.dataset && t.dataset.focusGuard);
  },
  cu = function (t) {
    return !vp(t);
  },
  iw = function (t) {
    return !!t;
  },
  lw = function (t, a) {
    const r = t.tabIndex - a.tabIndex,
      l = t.index - a.index;
    if (r) {
      if (!t.tabIndex) return 1;
      if (!a.tabIndex) return -1;
    }
    return r || l;
  },
  Ib = function (t, a, r) {
    return hr(t)
      .map(function (l, s) {
        return {
          node: l,
          index: s,
          tabIndex:
            r && l.tabIndex === -1
              ? (l.dataset || {}).focusGuard
                ? 0
                : -1
              : l.tabIndex,
        };
      })
      .filter(function (l) {
        return !a || l.tabIndex >= 0;
      })
      .sort(lw);
  },
  ow = [
    "button:enabled",
    "select:enabled",
    "textarea:enabled",
    "input:enabled",
    "a[href]",
    "area[href]",
    "summary",
    "iframe",
    "object",
    "embed",
    "audio[controls]",
    "video[controls]",
    "[tabindex]",
    "[contenteditable]",
    "[autofocus]",
  ],
  Gd = ow.join(","),
  sw = Gd + ", [data-focus-guard]",
  bp = function (t, a) {
    return t.reduce(function (r, l) {
      return r.concat(
        hr(l.querySelectorAll(a ? sw : Gd)),
        l.parentNode
          ? hr(l.parentNode.querySelectorAll(Gd)).filter(function (s) {
              return s === l;
            })
          : [],
      );
    }, []);
  },
  uw = function (t) {
    const a = t.querySelectorAll("[" + P_ + "]");
    return hr(a)
      .map(function (r) {
        return bp([r]);
      })
      .reduce(function (r, l) {
        return r.concat(l);
      }, []);
  },
  Sp = function (t) {
    return hr(t)
      .filter(function (a) {
        return Fb(a);
      })
      .filter(function (a) {
        return rw(a);
      });
  },
  Pd = function (t, a) {
    return Ib(Sp(bp(t, a)), !0, a);
  },
  Hm = function (t) {
    return Ib(Sp(bp(t)), !1);
  },
  cw = function (t) {
    return Sp(uw(t));
  };
var qd = function (t, a) {
  return (
    a === void 0 && (a = []),
    a.push(t),
    t.parentNode && qd(t.parentNode, a),
    a
  );
};
const ud = function (t, a) {
    const r = qd(t),
      l = qd(a);
    for (let s = 0; s < r.length; s += 1) {
      const u = r[s];
      if (l.indexOf(u) >= 0) return u;
    }
    return !1;
  },
  Hb = function (t, a, r) {
    const l = Vd(t),
      s = Vd(a),
      u = l[0];
    let f = !1;
    return (
      s.filter(Boolean).forEach(function (p) {
        ((f = ud(f || p, p) || f),
          r.filter(Boolean).forEach(function (h) {
            const g = ud(u, h);
            g && (!f || g.contains(f) ? (f = g) : (f = ud(g, f)));
          }));
      }),
      f
    );
  },
  fw = function (t) {
    return t.reduce(function (a, r) {
      return a.concat(cw(r));
    }, []);
  },
  dw = function (t) {
    const a = mp(t).filter(cu),
      r = Hb(t, t, a),
      l = Pd([r], !0),
      s = Pd(a)
        .filter(function (u) {
          const f = u.node;
          return cu(f);
        })
        .map(function (u) {
          return u.node;
        });
    return l.map(function (u) {
      const f = u.node,
        p = u.index;
      return { node: f, index: p, lockItem: s.indexOf(f) >= 0, guard: vp(f) };
    });
  },
  pw = function (t) {
    return t === document.activeElement;
  },
  hw = function (t) {
    return !!hr(t.querySelectorAll("iframe")).some(function (a) {
      return pw(a);
    });
  },
  $b = function (t) {
    const a = document && document.activeElement;
    return !a || (a.dataset && a.dataset.focusGuard)
      ? !1
      : mp(t).reduce(function (r, l) {
          return r || l.contains(a) || hw(l);
        }, !1);
  },
  gw = function () {
    return (
      document &&
      hr(document.querySelectorAll("[" + G_ + "]")).some(function (t) {
        return t.contains(document.activeElement);
      })
    );
  },
  Vb = function (t) {
    return t.tagName === "INPUT" && t.type === "radio";
  },
  yw = function (t, a) {
    return (
      a
        .filter(Vb)
        .filter(function (r) {
          return r.name === t.name;
        })
        .filter(function (r) {
          return r.checked;
        })[0] || t
    );
  },
  Ep = function (t, a) {
    return Vb(t) && t.name ? yw(t, a) : t;
  },
  mw = function (t) {
    const a = new Set();
    return (
      t.forEach(function (r) {
        return a.add(Ep(r, t));
      }),
      t.filter(function (r) {
        return a.has(r);
      })
    );
  },
  $m = function (t) {
    return t[0] && t.length > 1 ? Ep(t[0], t) : t[0];
  },
  Vm = function (t, a) {
    return t.length > 1 ? t.indexOf(Ep(t[a], t)) : a;
  },
  Gb = "NEW_FOCUS",
  vw = function (t, a, r, l) {
    const s = t.length,
      u = t[0],
      f = t[s - 1],
      p = vp(r);
    if (t.indexOf(r) >= 0) return;
    const h = a.indexOf(r),
      g = l ? a.indexOf(l) : h,
      y = l ? t.indexOf(l) : -1,
      v = h - g,
      E = a.indexOf(u),
      w = a.indexOf(f),
      S = mw(a),
      b = S.indexOf(r) - (l ? S.indexOf(l) : h),
      O = Vm(t, 0),
      k = Vm(t, s - 1);
    if (h === -1 || y === -1) return Gb;
    if (!v && y >= 0) return y;
    if (h <= E && p && Math.abs(v) > 1) return k;
    if (h >= w && p && Math.abs(v) > 1) return O;
    if (v && Math.abs(b) > 1) return y;
    if (h <= E) return k;
    if (h > w) return O;
    if (v) return Math.abs(v) > 1 ? y : (s + y + v) % s;
  },
  bw = function (t) {
    return function (a) {
      return (
        a.autofocus || (a.dataset && !!a.dataset.autofocus) || t.indexOf(a) >= 0
      );
    };
  },
  Sw = function (t, a) {
    const r = new Map();
    return (
      a.forEach(function (l) {
        return r.set(l.node, l);
      }),
      t
        .map(function (l) {
          return r.get(l);
        })
        .filter(iw)
    );
  },
  Ew = function (t, a) {
    const r = document && document.activeElement,
      l = mp(t).filter(cu),
      s = Hb(r || t, t, l),
      u = Hm(l);
    let f = Pd(l).filter(function (v) {
      const E = v.node;
      return cu(E);
    });
    if (!f[0] && ((f = u), !f[0])) return;
    const p = Hm([s]).map(function (v) {
        return v.node;
      }),
      h = Sw(p, f),
      g = h.map(function (v) {
        return v.node;
      }),
      y = vw(g, p, r, a);
    if (y === Gb) {
      const v = u
        .map(function (E) {
          return E.node;
        })
        .filter(bw(fw(l)));
      return { node: v && v.length ? $m(v) : $m(g) };
    }
    return y === void 0 ? y : h[y];
  },
  _w = function (t) {
    (t.focus(),
      "contentWindow" in t && t.contentWindow && t.contentWindow.focus());
  };
let cd = 0,
  fd = !1;
const Pb = function (t, a) {
  const r = Ew(t, a);
  if (!fd && r) {
    if (cd > 2) {
      (console.error(
        "FocusLock: focus-fighting detected. Only one focus management system could be active. See https://github.com/theKashey/focus-lock/#focus-fighting",
      ),
        (fd = !0),
        setTimeout(function () {
          fd = !1;
        }, 1));
      return;
    }
    (cd++, _w(r.node), cd--);
  }
};
function qb(t) {
  const a = window,
    r = a.setImmediate;
  typeof r < "u" ? r(t) : setTimeout(t, 1);
}
const ww = function () {
    return document && document.activeElement === document.body;
  },
  Ow = function () {
    return ww() || gw();
  };
let Hi = null,
  Fi = null,
  $i = null,
  So = !1;
const xw = function () {
    return !0;
  },
  Cw = function (a) {
    return (Hi.whiteList || xw)(a);
  },
  Tw = function (a, r) {
    $i = { observerNode: a, portaledElement: r };
  },
  Aw = function (a) {
    return $i && $i.portaledElement === a;
  };
function Gm(t, a, r, l) {
  let s = null,
    u = t;
  do {
    const f = l[u];
    if (f.guard) f.node.dataset.focusAutoGuard && (s = f);
    else if (f.lockItem) {
      if (u !== t) return;
      s = null;
    } else break;
  } while ((u += r) !== a);
  s && (s.node.tabIndex = 0);
}
const Rw = function (a) {
    return a && "current" in a ? a.current : a;
  },
  kw = function (a) {
    return a ? !!So : So === "meanwhile";
  },
  fu = function () {
    let a = !1;
    if (Hi) {
      const r = Hi,
        l = r.observed,
        s = r.persistentFocus,
        u = r.autoFocus,
        f = r.shards,
        p = r.crossFrame,
        h = l || ($i && $i.portaledElement),
        g = document && document.activeElement;
      if (h) {
        const y = [h].concat(f.map(Rw).filter(Boolean));
        if (
          ((!g || Cw(g)) &&
            (s || kw(p) || !Ow() || (!Fi && u)) &&
            (h &&
              !($b(y) || Aw(g)) &&
              (document && !Fi && g && !u
                ? (g.blur && g.blur(), document.body.focus())
                : ((a = Pb(y, Fi)), ($i = {}))),
            (So = !1),
            (Fi = document && document.activeElement)),
          document)
        ) {
          const v = document && document.activeElement,
            E = dw(y),
            w = E.map(function (S) {
              return S.node;
            }).indexOf(v);
          w > -1 &&
            (E.filter(function (S) {
              const b = S.guard,
                O = S.node;
              return b && O.dataset.focusAutoGuard;
            }).forEach(function (S) {
              return S.node.removeAttribute("tabIndex");
            }),
            Gm(w, E.length, 1, E),
            Gm(w, -1, -1, E));
        }
      }
    }
    return a;
  },
  Yb = function (a) {
    fu() && a && (a.stopPropagation(), a.preventDefault());
  },
  _p = function () {
    return qb(fu);
  },
  Dw = function (a) {
    const r = a.target,
      l = a.currentTarget;
    l.contains(r) || Tw(l, r);
  },
  Lw = function () {
    return null;
  };
Qe.node.isRequired;
const Zb = function () {
    ((So = "just"),
      setTimeout(function () {
        So = "meanwhile";
      }, 0));
  },
  Nw = function () {
    (document.addEventListener("focusin", Yb, !0),
      document.addEventListener("focusout", _p),
      window.addEventListener("blur", Zb));
  },
  Mw = function () {
    (document.removeEventListener("focusin", Yb, !0),
      document.removeEventListener("focusout", _p),
      window.removeEventListener("blur", Zb));
  };
function jw(t) {
  return t.filter(function (a) {
    return !a.disabled;
  });
}
function zw(t) {
  const a = t.slice(-1)[0];
  a && !Hi && Nw();
  const r = Hi,
    l = r && a && a.id === r.id;
  ((Hi = a),
    r &&
      !l &&
      (r.onDeactivation(),
      t.filter(function (s) {
        return s.id === r.id;
      }).length || r.returnFocus(!a)),
    a
      ? ((Fi = null),
        (!l || r.observed !== a.observed) && a.onActivation(),
        fu(),
        qb(fu))
      : (Mw(), (Fi = null)));
}
zb.assignSyncMedium(Dw);
Bb.assignMedium(_p);
K_.assignMedium(function (t) {
  return t({ moveFocusInside: Pb, focusInside: $b });
});
const Bw = tw(jw, zw)(Lw),
  Xb = C.forwardRef(function (a, r) {
    return C.createElement(zu, Ud({ sideCar: Bw, ref: r }, a));
  }),
  Kb = zu.propTypes || {};
Kb.sideCar;
const Uw = B_(Kb, ["sideCar"]);
Xb.propTypes = Uw;
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ var Vi =
  function () {
    return (
      (Vi =
        Object.assign ||
        function (a) {
          for (var r, l = 1, s = arguments.length; l < s; l++) {
            r = arguments[l];
            for (const u in r)
              Object.prototype.hasOwnProperty.call(r, u) && (a[u] = r[u]);
          }
          return a;
        }),
      Vi.apply(this, arguments)
    );
  };
function Fw(t, a) {
  const r = {};
  for (var l in t)
    Object.prototype.hasOwnProperty.call(t, l) &&
      a.indexOf(l) < 0 &&
      (r[l] = t[l]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, l = Object.getOwnPropertySymbols(t); s < l.length; s++)
      a.indexOf(l[s]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(t, l[s]) &&
        (r[l[s]] = t[l[s]]);
  return r;
}
const eu = "right-scroll-bar-position",
  tu = "width-before-scroll-bar",
  Iw = "with-scroll-bars-hidden",
  Hw = "--removed-body-scroll-bar-size",
  Qb = Mb(),
  dd = function () {},
  Bu = C.forwardRef(function (t, a) {
    const r = C.useRef(null),
      l = C.useState({
        onScrollCapture: dd,
        onWheelCapture: dd,
        onTouchMoveCapture: dd,
      }),
      s = l[0],
      u = l[1],
      f = t.forwardProps,
      p = t.children,
      h = t.className,
      g = t.removeScrollBar,
      y = t.enabled,
      v = t.shards,
      E = t.sideCar,
      w = t.noIsolation,
      S = t.inert,
      b = t.allowPinchZoom,
      O = t.as,
      k = O === void 0 ? "div" : O,
      L = Fw(t, [
        "forwardProps",
        "children",
        "className",
        "removeScrollBar",
        "enabled",
        "shards",
        "sideCar",
        "noIsolation",
        "inert",
        "allowPinchZoom",
        "as",
      ]),
      z = E,
      Q = Db([r, a]),
      ae = Vi({}, L, s);
    return C.createElement(
      C.Fragment,
      null,
      y &&
        C.createElement(z, {
          sideCar: Qb,
          removeScrollBar: g,
          shards: v,
          noIsolation: w,
          inert: S,
          setCallbacks: u,
          allowPinchZoom: !!b,
          lockRef: r,
        }),
      f
        ? C.cloneElement(C.Children.only(p), Vi({}, ae, { ref: Q }))
        : C.createElement(k, Vi({}, ae, { className: h, ref: Q }), p),
    );
  });
Bu.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
Bu.classNames = { fullWidth: tu, zeroRight: eu };
const $w = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function Vw() {
  if (!document) return null;
  const t = document.createElement("style");
  t.type = "text/css";
  const a = $w();
  return (a && t.setAttribute("nonce", a), t);
}
function Gw(t, a) {
  t.styleSheet
    ? (t.styleSheet.cssText = a)
    : t.appendChild(document.createTextNode(a));
}
function Pw(t) {
  (document.head || document.getElementsByTagName("head")[0]).appendChild(t);
}
const qw = function () {
    let t = 0,
      a = null;
    return {
      add: function (r) {
        (t == 0 && (a = Vw()) && (Gw(a, r), Pw(a)), t++);
      },
      remove: function () {
        (t--,
          !t && a && (a.parentNode && a.parentNode.removeChild(a), (a = null)));
      },
    };
  },
  Yw = function () {
    const t = qw();
    return function (a) {
      C.useEffect(function () {
        return (
          t.add(a),
          function () {
            t.remove();
          }
        );
      }, []);
    };
  },
  Jb = function () {
    const t = Yw();
    return function (r) {
      const l = r.styles;
      return (t(l), null);
    };
  },
  Zw = { left: 0, top: 0, right: 0, gap: 0 },
  pd = function (t) {
    return parseInt(t || "", 10) || 0;
  },
  Xw = function (t) {
    const a = window.getComputedStyle(document.body),
      r = a[t === "padding" ? "paddingLeft" : "marginLeft"],
      l = a[t === "padding" ? "paddingTop" : "marginTop"],
      s = a[t === "padding" ? "paddingRight" : "marginRight"];
    return [pd(r), pd(l), pd(s)];
  },
  Pm = function (t) {
    if ((t === void 0 && (t = "margin"), typeof window > "u")) return Zw;
    const a = Xw(t),
      r = document.documentElement.clientWidth,
      l = window.innerWidth;
    return {
      left: a[0],
      top: a[1],
      right: a[2],
      gap: Math.max(0, l - r + a[2] - a[0]),
    };
  },
  Kw = Jb(),
  Qw = function (t, a, r, l) {
    const s = t.left,
      u = t.top,
      f = t.right,
      p = t.gap;
    return (
      r === void 0 && (r = "margin"),
      `
  .` +
        Iw +
        ` {
   overflow: hidden ` +
        l +
        `;
   padding-right: ` +
        p +
        "px " +
        l +
        `;
  }
  body {
    overflow: hidden ` +
        l +
        `;
    ` +
        [
          a && "position: relative " + l + ";",
          r === "margin" &&
            `
    padding-left: ` +
              s +
              `px;
    padding-top: ` +
              u +
              `px;
    padding-right: ` +
              f +
              `px;
    margin-left:0;
    margin-top:0;
    margin-right: ` +
              p +
              "px " +
              l +
              `;
    `,
          r === "padding" && "padding-right: " + p + "px " + l + ";",
        ]
          .filter(Boolean)
          .join("") +
        `
  }
  
  .` +
        eu +
        ` {
    right: ` +
        p +
        "px " +
        l +
        `;
  }
  
  .` +
        tu +
        ` {
    margin-right: ` +
        p +
        "px " +
        l +
        `;
  }
  
  .` +
        eu +
        " ." +
        eu +
        ` {
    right: 0 ` +
        l +
        `;
  }
  
  .` +
        tu +
        " ." +
        tu +
        ` {
    margin-right: 0 ` +
        l +
        `;
  }
  
  body {
    ` +
        Hw +
        ": " +
        p +
        `px;
  }
`
    );
  },
  Jw = function (t) {
    const a = C.useState(Pm(t.gapMode)),
      r = a[0],
      l = a[1];
    C.useEffect(
      function () {
        l(Pm(t.gapMode));
      },
      [t.gapMode],
    );
    const s = t.noRelative,
      u = t.noImportant,
      f = t.gapMode,
      p = f === void 0 ? "margin" : f;
    return C.createElement(Kw, { styles: Qw(r, !s, p, u ? "" : "!important") });
  },
  Ww = function (t) {
    const a = window.getComputedStyle(t);
    return (
      a.overflowY !== "hidden" &&
      !(a.overflowY === a.overflowX && a.overflowY === "visible")
    );
  },
  eO = function (t) {
    const a = window.getComputedStyle(t);
    return (
      a.overflowX !== "hidden" &&
      !(a.overflowY === a.overflowX && a.overflowX === "visible")
    );
  },
  qm = function (t, a) {
    let r = a;
    do {
      if (Wb(t, r)) {
        const s = e0(t, r),
          u = s[1],
          f = s[2];
        if (u > f) return !0;
      }
      r = r.parentNode;
    } while (r && r !== document.body);
    return !1;
  },
  tO = function (t) {
    const a = t.scrollTop,
      r = t.scrollHeight,
      l = t.clientHeight;
    return [a, r, l];
  },
  nO = function (t) {
    const a = t.scrollLeft,
      r = t.scrollWidth,
      l = t.clientWidth;
    return [a, r, l];
  };
var Wb = function (t, a) {
    return t === "v" ? Ww(a) : eO(a);
  },
  e0 = function (t, a) {
    return t === "v" ? tO(a) : nO(a);
  };
const aO = function (t, a, r, l, s) {
  const u = l;
  let f = r.target;
  const p = a.contains(f);
  let h = !1;
  const g = u > 0;
  let y = 0,
    v = 0;
  do {
    const E = e0(t, f),
      w = E[0],
      S = E[1],
      b = E[2],
      O = S - b - w;
    ((w || O) && Wb(t, f) && ((y += O), (v += w)), (f = f.parentNode));
  } while ((!p && f !== document.body) || (p && (a.contains(f) || a === f)));
  return (((g && y === 0) || (!g && v === 0)) && (h = !0), h);
};
let Yd = !1;
if (typeof window < "u")
  try {
    const t = Object.defineProperty({}, "passive", {
      get: function () {
        return ((Yd = !0), !0);
      },
    });
    (window.addEventListener("test", t, t),
      window.removeEventListener("test", t, t));
  } catch {
    Yd = !1;
  }
const Li = Yd ? { passive: !1 } : !1,
  qs = function (t) {
    return "changedTouches" in t
      ? [t.changedTouches[0].clientX, t.changedTouches[0].clientY]
      : [0, 0];
  },
  Ym = function (t) {
    return [t.deltaX, t.deltaY];
  },
  Zm = function (t) {
    return t && "current" in t ? t.current : t;
  },
  rO = function (t, a) {
    return t[0] === a[0] && t[1] === a[1];
  },
  iO = function (t) {
    return (
      `
  .block-interactivity-` +
      t +
      ` {pointer-events: none;}
  .allow-interactivity-` +
      t +
      ` {pointer-events: all;}
`
    );
  };
let lO = 0,
  Ni = [];
function oO(t) {
  const a = C.useRef([]),
    r = C.useRef([0, 0]),
    l = C.useRef(),
    s = C.useState(lO++)[0],
    u = C.useState(function () {
      return Jb();
    })[0],
    f = C.useRef(t);
  (C.useEffect(
    function () {
      f.current = t;
    },
    [t],
  ),
    C.useEffect(
      function () {
        if (t.inert) {
          document.body.classList.add("block-interactivity-" + s);
          const b = [t.lockRef.current]
            .concat((t.shards || []).map(Zm))
            .filter(Boolean);
          return (
            b.forEach(function (O) {
              return O.classList.add("allow-interactivity-" + s);
            }),
            function () {
              (document.body.classList.remove("block-interactivity-" + s),
                b.forEach(function (O) {
                  return O.classList.remove("allow-interactivity-" + s);
                }));
            }
          );
        }
      },
      [t.inert, t.lockRef.current, t.shards],
    ));
  const p = C.useCallback(function (b, O) {
      if ("touches" in b && b.touches.length === 2)
        return !f.current.allowPinchZoom;
      const k = qs(b),
        L = r.current,
        z = "deltaX" in b ? b.deltaX : L[0] - k[0],
        Q = "deltaY" in b ? b.deltaY : L[1] - k[1];
      let ae;
      const re = b.target,
        q = Math.abs(z) > Math.abs(Q) ? "h" : "v";
      let ie = qm(q, re);
      if (!ie) return !0;
      if (
        (ie ? (ae = q) : ((ae = q === "v" ? "h" : "v"), (ie = qm(q, re))), !ie)
      )
        return !1;
      if (
        (!l.current && "changedTouches" in b && (z || Q) && (l.current = ae),
        !ae)
      )
        return !0;
      const se = l.current || ae;
      return aO(se, O, b, se === "h" ? z : Q);
    }, []),
    h = C.useCallback(function (b) {
      const O = b;
      if (!Ni.length || Ni[Ni.length - 1] !== u) return;
      const k = "deltaY" in O ? Ym(O) : qs(O),
        L = a.current.filter(function (z) {
          return z.name === O.type && z.target === O.target && rO(z.delta, k);
        })[0];
      if (L && L.should) {
        O.preventDefault();
        return;
      }
      if (!L) {
        const z = (f.current.shards || [])
          .map(Zm)
          .filter(Boolean)
          .filter(function (ae) {
            return ae.contains(O.target);
          });
        (z.length > 0 ? p(O, z[0]) : !f.current.noIsolation) &&
          O.preventDefault();
      }
    }, []),
    g = C.useCallback(function (b, O, k, L) {
      const z = { name: b, delta: O, target: k, should: L };
      (a.current.push(z),
        setTimeout(function () {
          a.current = a.current.filter(function (Q) {
            return Q !== z;
          });
        }, 1));
    }, []),
    y = C.useCallback(function (b) {
      ((r.current = qs(b)), (l.current = void 0));
    }, []),
    v = C.useCallback(function (b) {
      g(b.type, Ym(b), b.target, p(b, t.lockRef.current));
    }, []),
    E = C.useCallback(function (b) {
      g(b.type, qs(b), b.target, p(b, t.lockRef.current));
    }, []);
  C.useEffect(function () {
    return (
      Ni.push(u),
      t.setCallbacks({
        onScrollCapture: v,
        onWheelCapture: v,
        onTouchMoveCapture: E,
      }),
      document.addEventListener("wheel", h, Li),
      document.addEventListener("touchmove", h, Li),
      document.addEventListener("touchstart", y, Li),
      function () {
        ((Ni = Ni.filter(function (b) {
          return b !== u;
        })),
          document.removeEventListener("wheel", h, Li),
          document.removeEventListener("touchmove", h, Li),
          document.removeEventListener("touchstart", y, Li));
      }
    );
  }, []);
  const w = t.removeScrollBar,
    S = t.inert;
  return C.createElement(
    C.Fragment,
    null,
    S ? C.createElement(u, { styles: iO(s) }) : null,
    w ? C.createElement(Jw, { gapMode: "margin" }) : null,
  );
}
const sO = X_(Qb, oO),
  t0 = C.forwardRef(function (t, a) {
    return C.createElement(Bu, Vi({}, t, { ref: a, sideCar: sO }));
  });
t0.classNames = Bu.classNames;
function sa() {
  return (
    (sa =
      Object.assign ||
      function (t) {
        for (let a = 1; a < arguments.length; a++) {
          const r = arguments[a];
          for (const l in r)
            Object.prototype.hasOwnProperty.call(r, l) && (t[l] = r[l]);
        }
        return t;
      }),
    sa.apply(this, arguments)
  );
}
function Uu(t, a) {
  if (t == null) return {};
  const r = {},
    l = Object.keys(t);
  let s, u;
  for (u = 0; u < l.length; u++)
    ((s = l[u]), !(a.indexOf(s) >= 0) && (r[s] = t[s]));
  return r;
}
const n0 = {
    allowPinchZoom: Qe.bool,
    dangerouslyBypassFocusLock: Qe.bool,
    dangerouslyBypassScrollLock: Qe.bool,
    initialFocusRef: function () {
      return null;
    },
    onDismiss: Qe.func,
  },
  Zi = ju(function (a, r) {
    const l = a.as,
      s = l === void 0 ? "div" : l,
      u = a.isOpen,
      f = u === void 0 ? !0 : u,
      p = Uu(a, ["as", "isOpen"]);
    return (
      Cb("dialog"),
      C.useEffect(
        function () {
          f
            ? (window.__REACH_DISABLE_TOOLTIPS = !0)
            : window.requestAnimationFrame(function () {
                window.__REACH_DISABLE_TOOLTIPS = !1;
              });
        },
        [f],
      ),
      f
        ? C.createElement(
            Tb,
            { "data-reach-dialog-wrapper": "" },
            C.createElement(uO, sa({ ref: r, as: s }, p)),
          )
        : null
    );
  });
((Zi.displayName = "DialogOverlay"),
  (Zi.propTypes = sa({}, n0, { isOpen: Qe.bool })));
var uO = ju(function (a, r) {
  const l = a.allowPinchZoom,
    s = a.as,
    u = s === void 0 ? "div" : s,
    f = a.dangerouslyBypassFocusLock,
    p = f === void 0 ? !1 : f,
    h = a.dangerouslyBypassScrollLock,
    g = h === void 0 ? !1 : h,
    y = a.initialFocusRef,
    v = a.onClick,
    E = a.onDismiss,
    w = E === void 0 ? xo : E,
    S = a.onKeyDown,
    b = a.onMouseDown,
    O = a.unstable_lockFocusAcrossFrames,
    k = O === void 0 ? !0 : O,
    L = Uu(a, [
      "allowPinchZoom",
      "as",
      "dangerouslyBypassFocusLock",
      "dangerouslyBypassScrollLock",
      "initialFocusRef",
      "onClick",
      "onDismiss",
      "onKeyDown",
      "onMouseDown",
      "unstable_lockFocusAcrossFrames",
    ]),
    z = C.useRef(null),
    Q = C.useRef(null),
    ae = z_(Q, r),
    re = C.useCallback(
      function () {
        y && y.current && y.current.focus();
      },
      [y],
    );
  function q(ve) {
    z.current === ve.target && (ve.stopPropagation(), w(ve));
  }
  function ie(ve) {
    ve.key === "Escape" && (ve.stopPropagation(), w(ve));
  }
  function se(ve) {
    z.current = ve.target;
  }
  return (
    C.useEffect(function () {
      return Q.current ? cO(Q.current) : void 0;
    }, []),
    C.createElement(
      Xb,
      {
        autoFocus: !0,
        returnFocus: !0,
        onActivation: re,
        disabled: p,
        crossFrame: k,
      },
      C.createElement(
        t0,
        { allowPinchZoom: l, enabled: !g },
        C.createElement(
          u,
          sa({}, L, {
            ref: ae,
            "data-reach-dialog-overlay": "",
            onClick: Ws(v, q),
            onKeyDown: Ws(S, ie),
            onMouseDown: Ws(b, se),
          }),
        ),
      ),
    )
  );
});
((Zi.displayName = "DialogOverlay"), (Zi.propTypes = sa({}, n0)));
const du = ju(function (a, r) {
  const l = a.as,
    s = l === void 0 ? "div" : l,
    u = a.onClick;
  a.onKeyDown;
  const f = Uu(a, ["as", "onClick", "onKeyDown"]);
  return C.createElement(
    s,
    sa({ "aria-modal": "true", role: "dialog", tabIndex: -1 }, f, {
      ref: r,
      "data-reach-dialog-content": "",
      onClick: Ws(u, function (p) {
        p.stopPropagation();
      }),
    }),
  );
});
((du.displayName = "DialogContent"),
  (du.propTypes = { "aria-label": pu, "aria-labelledby": pu }));
const Xm = ju(function (a, r) {
  const l = a.allowPinchZoom,
    s = l === void 0 ? !1 : l,
    u = a.initialFocusRef,
    f = a.isOpen,
    p = a.onDismiss,
    h = p === void 0 ? xo : p,
    g = Uu(a, ["allowPinchZoom", "initialFocusRef", "isOpen", "onDismiss"]);
  return C.createElement(
    Zi,
    { allowPinchZoom: s, initialFocusRef: u, isOpen: f, onDismiss: h },
    C.createElement(du, sa({ ref: r }, g)),
  );
});
((Xm.displayName = "Dialog"),
  (Xm.propTypes = {
    isOpen: Qe.bool,
    onDismiss: Qe.func,
    "aria-label": pu,
    "aria-labelledby": pu,
  }));
function cO(t) {
  const a = [],
    r = [],
    l = L_(t);
  return t
    ? (Array.prototype.forEach.call(
        l.querySelectorAll("body > *"),
        function (s) {
          let u, f;
          const p =
            (u = t.parentNode) == null || (f = u.parentNode) == null
              ? void 0
              : f.parentNode;
          if (s === p) return;
          const h = s.getAttribute("aria-hidden");
          (h !== null && h !== "false") ||
            (a.push(h), r.push(s), s.setAttribute("aria-hidden", "true"));
        },
      ),
      function () {
        r.forEach(function (s, u) {
          const f = a[u];
          f === null
            ? s.removeAttribute("aria-hidden")
            : s.setAttribute("aria-hidden", f);
        });
      })
    : (console.warn(
        "A ref has not yet been attached to a dialog node when attempting to call `createAriaHider`.",
      ),
      xo);
}
function pu(t, a, r, l, s) {
  const u = `
See https://www.w3.org/TR/wai-aria/#aria-label for details.`;
  return !t["aria-label"] && !t["aria-labelledby"]
    ? new Error(
        "A <" +
          r +
          "> must have either an `aria-label` or `aria-labelledby` prop.\n      " +
          u,
      )
    : t["aria-label"] && t["aria-labelledby"]
      ? new Error(
          "You provided both `aria-label` and `aria-labelledby` props to a <" +
            r +
            ">. If the a label for this component is visible on the screen, that label's component should be given a unique ID prop, and that ID should be passed as the `aria-labelledby` prop into <" +
            r +
            ">. If the label cannot be determined programmatically from the content of the element, an alternative label should be provided as the `aria-label` prop, which will be used as an `aria-label` on the HTML tag." +
            u,
        )
      : t[a] != null && !M_(t[a])
        ? new Error(
            "Invalid prop `" +
              a +
              "` supplied to `" +
              r +
              "`. Expected `string`, received `" +
              (Array.isArray(s) ? "array" : typeof s) +
              "`.",
          )
        : null;
}
const fO = ({ children: t, onClick: a, style: r, ...l }) =>
    x.jsx("button", {
      className: "ladle-button",
      onClick: a,
      style: r,
      "aria-label": l["aria-label"],
      type: "button",
      children: t,
    }),
  Gi = ({ children: t, href: a, style: r }) =>
    x.jsx("a", { className: "ladle-link", href: a, style: r, children: t }),
  Pr = ({ children: t }) =>
    x.jsx("code", { className: "ladle-code", children: t }),
  el = ({ children: t, close: a, isOpen: r, label: l, maxWidth: s = "40em" }) =>
    x.jsx(Zi, {
      isOpen: r,
      onDismiss: () => a(),
      "data-testid": "ladle-dialog-overlay",
      children: x.jsxs(du, {
        "aria-label": l || "Modal",
        "data-testid": "ladle-dialog",
        style: { maxWidth: s },
        children: [
          x.jsx("div", {
            style: { position: "absolute", insetInlineEnd: "-6px", top: "0px" },
            children: x.jsx(fO, {
              onClick: () => a(),
              "aria-label": "Close modal",
              style: {
                height: "36px",
                width: "36px",
                borderColor: "transparent",
                boxShadow: "none",
              },
              children: x.jsx(h_, {}),
            }),
          }),
          x.jsx("div", { className: "ladle-addon-modal-body", children: t }),
        ],
      }),
    });
var Xt;
(function (t) {
  ((t.Full = "full"), (t.Preview = "preview"));
})(Xt || (Xt = {}));
var vt;
(function (t) {
  ((t.Light = "light"), (t.Dark = "dark"), (t.Auto = "auto"));
})(vt || (vt = {}));
var Ue;
(function (t) {
  ((t.Boolean = "boolean"),
    (t.String = "string"),
    (t.Number = "number"),
    (t.Complex = "complex"),
    (t.Function = "function"),
    (t.Radio = "radio"),
    (t.InlineRadio = "inline-radio"),
    (t.Select = "select"),
    (t.MultiSelect = "multi-select"),
    (t.Check = "check"),
    (t.InlineCheck = "inline-check"),
    (t.Action = "action"),
    (t.Range = "range"),
    (t.Background = "background"));
})(Ue || (Ue = {}));
var Ve;
(function (t) {
  ((t.UpdateAll = "update-all"),
    (t.UpdateMode = "update-mode"),
    (t.UpdateAction = "update-action"),
    (t.UpdateRtl = "update-rtl"),
    (t.UpdateSource = "update-source"),
    (t.UpdateStory = "update-story"),
    (t.UpdateTheme = "update-theme"),
    (t.UpdateWidth = "update-width"),
    (t.UpdateControl = "update-control"),
    (t.UpdateControlIntialized = "update-control-initialized"),
    (t.UpdateHotkeys = "update-hotkeys"));
})(Ve || (Ve = {}));
const Km = (t) => {
    switch (t) {
      case Ue.Boolean:
        return "checkbox";
      case Ue.Number:
        return "number";
      case Ue.Range:
        return "range";
      default:
        return "text";
    }
  },
  Qm = (t, a) => {
    switch (a) {
      case Ue.Boolean:
        return t.checked;
      case Ue.Number:
      case Ue.Range:
        return parseFloat(t.value);
      default:
        return t.value;
    }
  },
  hu = (t, a) =>
    a && a.some((l) => l === Number(t))
      ? Number(t)
      : t === "true" || t === "false"
        ? t !== "false"
        : t,
  dO = (t, a) => {
    const r = ca.parse(t),
      l = {};
    return Object.keys(a).length === 0
      ? a
      : (Object.keys(r).forEach((s) => {
          if (s.startsWith("arg-") && a[s.split("-")[1]]) {
            const f = s.split("-")[1],
              p = r[s],
              h = a[f].type;
            if (h !== Ue.Action) {
              let g = p;
              switch (h) {
                case Ue.String:
                  g = decodeURI(p);
                  break;
                case Ue.Boolean:
                  g = p === "true";
                  break;
                case Ue.Range:
                  g = parseFloat(p);
                  break;
                case Ue.Number:
                  g = parseInt(p, 10);
                  break;
                case Ue.Complex:
                  g = JSON.parse(decodeURI(p));
                  break;
                case Ue.Radio:
                case Ue.InlineRadio:
                case Ue.Select:
                case Ue.Background:
                  g = hu(decodeURI(p), a[f].options);
                  break;
                case Ue.InlineCheck:
                case Ue.MultiSelect:
                case Ue.Check:
                  g = hu(JSON.parse(decodeURI(p)), a[f].options);
                  break;
              }
              l[f] = {
                value: g,
                defaultValue: a[f].defaultValue,
                description: a[f].description,
                type: a[f].type,
              };
            }
          }
        }),
        l);
  },
  pO = ({ controlKey: t, globalState: a, dispatch: r }) => {
    const l = a.control[t],
      s = a.control[t].name || t;
    if (a.control[t].type === Ue.Action)
      return x.jsxs("tr", {
        children: [
          x.jsx("td", { children: s }),
          x.jsx("td", { children: "action" }),
        ],
      });
    if (a.control[t].type === Ue.Function)
      return x.jsxs("tr", {
        children: [
          x.jsx("td", { children: s }),
          x.jsx("td", { children: "function" }),
        ],
      });
    if (
      a.control[t].type === Ue.Radio ||
      a.control[t].type === Ue.InlineRadio ||
      (a.control[t].type === Ue.Background && a.control[t].options.length < 5)
    )
      return x.jsxs("tr", {
        children: [
          x.jsx("td", { children: s }),
          x.jsx("td", {
            style:
              a.control[t].type === Ue.InlineRadio ? { display: "flex" } : {},
            children: (a.control[t].options || []).map((u) => {
              const f = a.control[t].value,
                h = (a.control[t].labels || {})[u] || u,
                g = f === u || f === String(u);
              return x.jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    ...(a.control[t].type === Ue.InlineRadio
                      ? { paddingRight: "0.5em" }
                      : {}),
                  },
                  children: [
                    x.jsx("input", {
                      id: `${t}-${String(u)}`,
                      type: "radio",
                      name: t,
                      value: String(u),
                      onChange: () => {
                        r({
                          type: Ve.UpdateControl,
                          value: {
                            ...a.control,
                            [t]: {
                              ...a.control[t],
                              value: hu(String(u), a.control[t].options),
                            },
                          },
                        });
                      },
                      checked: g,
                    }),
                    x.jsx("label", {
                      htmlFor: `${t}-${String(u)}`,
                      children: String(h),
                    }),
                  ],
                },
                `${String(u)}-${t}`,
              );
            }),
          }),
        ],
      });
    if (
      a.control[t].type === Ue.Check ||
      a.control[t].type === Ue.InlineCheck ||
      a.control[t].type === Ue.MultiSelect
    )
      return x.jsxs("tr", {
        children: [
          x.jsx("td", { children: s }),
          x.jsx("td", {
            style:
              a.control[t].type === Ue.InlineCheck ? { display: "flex" } : {},
            children: (a.control[t].options || []).map((u) => {
              const f = new Set(a.control[t].value),
                h = (a.control[t].labels || {})[u] || u;
              return x.jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    ...(a.control[t].type === Ue.InlineCheck
                      ? { paddingRight: "0.5em" }
                      : {}),
                  },
                  children: [
                    x.jsx("input", {
                      id: `${t}-${String(u)}`,
                      type: "checkbox",
                      name: `${t}-${String(u)}`,
                      value: String(u),
                      checked: f.has(String(u)),
                      onChange: () => {
                        const g = String(u);
                        (f.has(g) ? f.delete(g) : f.add(g),
                          r({
                            type: Ve.UpdateControl,
                            value: {
                              ...a.control,
                              [t]: {
                                ...a.control[t],
                                value: f.size > 0 ? Array.from(f) : void 0,
                              },
                            },
                          }));
                      },
                    }),
                    x.jsx("label", {
                      htmlFor: `${t}-${String(u)}`,
                      style: { marginLeft: "0.3em" },
                      children: String(h),
                    }),
                  ],
                },
                `${String(u)}-${t}`,
              );
            }),
          }),
        ],
      });
    if (a.control[t].type === Ue.Select || a.control[t].type === Ue.Background)
      return x.jsxs("tr", {
        children: [
          x.jsx("td", {
            children: x.jsx("label", { htmlFor: t, children: s }),
          }),
          x.jsx("td", {
            children: x.jsxs("select", {
              id: t,
              value: String(a.control[t].value),
              onChange: (u) => {
                const f = a.control[t].labels || {},
                  p =
                    Object.keys(f).find((h) => f[h] === u.target.value) ||
                    u.target.value;
                r({
                  type: Ve.UpdateControl,
                  value: {
                    ...a.control,
                    [t]: {
                      ...a.control[t],
                      value: hu(p, a.control[t].options),
                    },
                  },
                });
              },
              children: [
                x.jsx("option", {
                  value: "undefined",
                  disabled: !0,
                  children: "Choose option...",
                }),
                (a.control[t].options || []).map((u) => {
                  const p = (a.control[t].labels || {})[u] || u;
                  return x.jsx("option", { children: String(p) }, `${u}-${t}`);
                }),
              ],
            }),
          }),
        ],
      });
    if (a.control[t].type === Ue.Complex) {
      let u = "";
      try {
        u = JSON.stringify(a.control[t].value);
      } catch {
        u = "Object/Array argument must be serializable.";
      }
      return x.jsxs("tr", {
        children: [
          x.jsx("td", {
            children: x.jsx("label", { htmlFor: t, children: s }),
          }),
          x.jsx("td", {
            children: x.jsx("textarea", {
              id: t,
              defaultValue: u,
              onChange: (f) => {
                let p = a.control[t].value;
                try {
                  p = JSON.parse(f.target.value);
                } catch {}
                r({
                  type: Ve.UpdateControl,
                  value: { ...a.control, [t]: { ...a.control[t], value: p } },
                });
              },
            }),
          }),
        ],
      });
    }
    if (l.type === Ue.Range) {
      const u = l.min ?? 0,
        f = l.max ?? 100;
      return x.jsxs("tr", {
        children: [
          x.jsx("td", {
            children: x.jsx("label", { htmlFor: t, children: s }),
          }),
          x.jsxs("td", {
            children: [
              u,
              x.jsx("input", {
                id: t,
                type: Km(l.type),
                value: l.value,
                min: l.min,
                max: l.max,
                step: l.step,
                onChange: (p) =>
                  r({
                    type: Ve.UpdateControl,
                    value: {
                      ...a.control,
                      [t]: { ...l, value: Qm(p.target, l.type) },
                    },
                  }),
              }),
              l.value,
              " / ",
              f,
            ],
          }),
        ],
      });
    }
    return x.jsxs("tr", {
      children: [
        x.jsx("td", { children: x.jsx("label", { htmlFor: t, children: s }) }),
        x.jsx("td", {
          children: x.jsx("input", {
            id: t,
            type: Km(a.control[t].type),
            value: a.control[t].value,
            checked:
              a.control[t].type === Ue.Boolean && a.control[t].value === !0,
            onChange: (u) =>
              r({
                type: Ve.UpdateControl,
                value: {
                  ...a.control,
                  [t]: {
                    ...a.control[t],
                    value: Qm(u.target, a.control[t].type),
                  },
                },
              }),
          }),
        }),
      ],
    });
  },
  hO = ({ globalState: t, dispatch: a }) => {
    const [r, l] = C.useState(!1);
    Rn(Oe.hotkeys.control, () => l((f) => !f), {
      enabled: t.hotkeys && Oe.addons.control.enabled,
    });
    const s = "Explore different versions of this story through controls.",
      u = Object.keys(t.control).filter(
        (f) =>
          JSON.stringify(t.control[f].value) !==
          JSON.stringify(t.control[f].defaultValue),
      );
    return x.jsx("li", {
      children: x.jsxs("button", {
        "aria-label": s,
        title: s,
        onClick: () => l(!0),
        className: r ? "ladle-active" : "",
        "data-testid": "addon-control",
        type: "button",
        children: [
          x.jsx(__, {}),
          x.jsx("span", { className: "ladle-addon-tooltip", children: s }),
          x.jsx("label", { children: "Story Controls" }),
          u.length
            ? x.jsx("div", { className: "ladle-badge", children: u.length })
            : null,
          x.jsxs(el, {
            isOpen: r,
            close: () => l(!1),
            label: "Toggle different controls to update the story.",
            children: [
              x.jsx("table", {
                className: "ladle-controls-table",
                children: x.jsx("tbody", {
                  children: Object.keys(t.control)
                    .sort()
                    .map((f) =>
                      x.jsx(
                        pO,
                        { globalState: t, dispatch: a, controlKey: f },
                        f,
                      ),
                    ),
                }),
              }),
              x.jsx("button", {
                onClick: () => {
                  const f = {};
                  (Object.keys(t.control).forEach((p) => {
                    f[p] = {
                      ...t.control[p],
                      value: t.control[p].defaultValue,
                    };
                  }),
                    a({ type: Ve.UpdateControl, value: f }));
                },
                type: "button",
                children: "Reset to defaults",
              }),
            ],
          }),
        ],
      }),
    });
  },
  gO = "modulepreload",
  yO = function (t) {
    return "/" + t;
  },
  Jm = {},
  mO = function (a, r, l) {
    let s = Promise.resolve();
    if (r && r.length > 0) {
      let f = function (g) {
        return Promise.all(
          g.map((y) =>
            Promise.resolve(y).then(
              (v) => ({ status: "fulfilled", value: v }),
              (v) => ({ status: "rejected", reason: v }),
            ),
          ),
        );
      };
      document.getElementsByTagName("link");
      const p = document.querySelector("meta[property=csp-nonce]"),
        h =
          (p == null ? void 0 : p.nonce) ||
          (p == null ? void 0 : p.getAttribute("nonce"));
      s = f(
        r.map((g) => {
          if (((g = yO(g)), g in Jm)) return;
          Jm[g] = !0;
          const y = g.endsWith(".css"),
            v = y ? '[rel="stylesheet"]' : "";
          if (document.querySelector(`link[href="${g}"]${v}`)) return;
          const E = document.createElement("link");
          if (
            ((E.rel = y ? "stylesheet" : gO),
            y || (E.as = "script"),
            (E.crossOrigin = ""),
            (E.href = g),
            h && E.setAttribute("nonce", h),
            document.head.appendChild(E),
            y)
          )
            return new Promise((w, S) => {
              (E.addEventListener("load", w),
                E.addEventListener("error", () =>
                  S(new Error(`Unable to preload CSS for ${g}`)),
                ));
            });
        }),
      );
    }
    function u(f) {
      const p = new Event("vite:preloadError", { cancelable: !0 });
      if (((p.payload = f), window.dispatchEvent(p), !p.defaultPrevented))
        throw f;
    }
    return s.then((f) => {
      for (const p of f || []) p.status === "rejected" && u(p.reason);
      return a().catch(u);
    });
  };
var Wm = {};
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */ var ev;
function vO() {
  if (ev) return Wm;
  ev = 1;
  var t;
  return (
    (function (a) {
      (function (r) {
        var l =
            typeof globalThis == "object"
              ? globalThis
              : typeof Bi == "object"
                ? Bi
                : typeof self == "object"
                  ? self
                  : typeof this == "object"
                    ? this
                    : h(),
          s = u(a);
        (typeof l.Reflect < "u" && (s = u(l.Reflect, s)),
          r(s, l),
          typeof l.Reflect > "u" && (l.Reflect = a));
        function u(g, y) {
          return function (v, E) {
            (Object.defineProperty(g, v, {
              configurable: !0,
              writable: !0,
              value: E,
            }),
              y && y(v, E));
          };
        }
        function f() {
          try {
            return Function("return this;")();
          } catch {}
        }
        function p() {
          try {
            return (0, eval)("(function() { return this; })()");
          } catch {}
        }
        function h() {
          return f() || p();
        }
      })(function (r, l) {
        var s = Object.prototype.hasOwnProperty,
          u = typeof Symbol == "function",
          f =
            u && typeof Symbol.toPrimitive < "u"
              ? Symbol.toPrimitive
              : "@@toPrimitive",
          p =
            u && typeof Symbol.iterator < "u" ? Symbol.iterator : "@@iterator",
          h = typeof Object.create == "function",
          g = { __proto__: [] } instanceof Array,
          y = !h && !g,
          v = {
            create: h
              ? function () {
                  return ja(Object.create(null));
                }
              : g
                ? function () {
                    return ja({ __proto__: null });
                  }
                : function () {
                    return ja({});
                  },
            has: y
              ? function (U, G) {
                  return s.call(U, G);
                }
              : function (U, G) {
                  return G in U;
                },
            get: y
              ? function (U, G) {
                  return s.call(U, G) ? U[G] : void 0;
                }
              : function (U, G) {
                  return U[G];
                },
          },
          E = Object.getPrototypeOf(Function),
          w =
            typeof Map == "function" &&
            typeof Map.prototype.entries == "function"
              ? Map
              : Mn(),
          S =
            typeof Set == "function" &&
            typeof Set.prototype.entries == "function"
              ? Set
              : Zr(),
          b = typeof WeakMap == "function" ? WeakMap : vr(),
          O = u ? Symbol.for("@reflect-metadata:registry") : void 0,
          k = At(),
          L = qr(k);
        function z(U, G, X, le) {
          if (B(X)) {
            if (!Dn(U)) throw new TypeError();
            if (!_e(G)) throw new TypeError();
            return oe(U, G);
          } else {
            if (!Dn(U)) throw new TypeError();
            if (!ge(G)) throw new TypeError();
            if (!ge(le) && !B(le) && !ce(le)) throw new TypeError();
            return (ce(le) && (le = void 0), (X = bt(X)), ue(U, G, X, le));
          }
        }
        r("decorate", z);
        function Q(U, G) {
          function X(le, be) {
            if (!ge(le)) throw new TypeError();
            if (!B(be) && !mn(be)) throw new TypeError();
            he(U, G, le, be);
          }
          return X;
        }
        r("metadata", Q);
        function ae(U, G, X, le) {
          if (!ge(X)) throw new TypeError();
          return (B(le) || (le = bt(le)), he(U, G, X, le));
        }
        r("defineMetadata", ae);
        function re(U, G, X) {
          if (!ge(G)) throw new TypeError();
          return (B(X) || (X = bt(X)), de(U, G, X));
        }
        r("hasMetadata", re);
        function q(U, G, X) {
          if (!ge(G)) throw new TypeError();
          return (B(X) || (X = bt(X)), M(U, G, X));
        }
        r("hasOwnMetadata", q);
        function ie(U, G, X) {
          if (!ge(G)) throw new TypeError();
          return (B(X) || (X = bt(X)), Z(U, G, X));
        }
        r("getMetadata", ie);
        function se(U, G, X) {
          if (!ge(G)) throw new TypeError();
          return (B(X) || (X = bt(X)), ne(U, G, X));
        }
        r("getOwnMetadata", se);
        function ve(U, G) {
          if (!ge(U)) throw new TypeError();
          return (B(G) || (G = bt(G)), fe(U, G));
        }
        r("getMetadataKeys", ve);
        function Te(U, G) {
          if (!ge(U)) throw new TypeError();
          return (B(G) || (G = bt(G)), A(U, G));
        }
        r("getOwnMetadataKeys", Te);
        function Y(U, G, X) {
          if (!ge(G)) throw new TypeError();
          if ((B(X) || (X = bt(X)), !ge(G))) throw new TypeError();
          B(X) || (X = bt(X));
          var le = Yn(G, X, !1);
          return B(le) ? !1 : le.OrdinaryDeleteMetadata(U, G, X);
        }
        r("deleteMetadata", Y);
        function oe(U, G) {
          for (var X = U.length - 1; X >= 0; --X) {
            var le = U[X],
              be = le(G);
            if (!B(be) && !ce(be)) {
              if (!_e(be)) throw new TypeError();
              G = be;
            }
          }
          return G;
        }
        function ue(U, G, X, le) {
          for (var be = U.length - 1; be >= 0; --be) {
            var pt = U[be],
              ft = pt(G, X, le);
            if (!B(ft) && !ce(ft)) {
              if (!ge(ft)) throw new TypeError();
              le = ft;
            }
          }
          return le;
        }
        function de(U, G, X) {
          var le = M(U, G, X);
          if (le) return !0;
          var be = qn(G);
          return ce(be) ? !1 : de(U, be, X);
        }
        function M(U, G, X) {
          var le = Yn(G, X, !1);
          return B(le) ? !1 : qe(le.OrdinaryHasOwnMetadata(U, G, X));
        }
        function Z(U, G, X) {
          var le = M(U, G, X);
          if (le) return ne(U, G, X);
          var be = qn(G);
          if (!ce(be)) return Z(U, be, X);
        }
        function ne(U, G, X) {
          var le = Yn(G, X, !1);
          if (!B(le)) return le.OrdinaryGetOwnMetadata(U, G, X);
        }
        function he(U, G, X, le) {
          var be = Yn(X, le, !0);
          be.OrdinaryDefineOwnMetadata(U, G, X, le);
        }
        function fe(U, G) {
          var X = A(U, G),
            le = qn(U);
          if (le === null) return X;
          var be = fe(le, G);
          if (be.length <= 0) return X;
          if (X.length <= 0) return be;
          for (
            var pt = new S(), ft = [], je = 0, pe = X;
            je < pe.length;
            je++
          ) {
            var ye = pe[je],
              Se = pt.has(ye);
            Se || (pt.add(ye), ft.push(ye));
          }
          for (var me = 0, Ne = be; me < Ne.length; me++) {
            var ye = Ne[me],
              Se = pt.has(ye);
            Se || (pt.add(ye), ft.push(ye));
          }
          return ft;
        }
        function A(U, G) {
          var X = Yn(U, G, !1);
          return X ? X.OrdinaryOwnMetadataKeys(U, G) : [];
        }
        function V(U) {
          if (U === null) return 1;
          switch (typeof U) {
            case "undefined":
              return 0;
            case "boolean":
              return 2;
            case "string":
              return 3;
            case "symbol":
              return 4;
            case "number":
              return 5;
            case "object":
              return U === null ? 1 : 6;
            default:
              return 6;
          }
        }
        function B(U) {
          return U === void 0;
        }
        function ce(U) {
          return U === null;
        }
        function Ce(U) {
          return typeof U == "symbol";
        }
        function ge(U) {
          return typeof U == "object" ? U !== null : typeof U == "function";
        }
        function ke(U, G) {
          switch (V(U)) {
            case 0:
              return U;
            case 1:
              return U;
            case 2:
              return U;
            case 3:
              return U;
            case 4:
              return U;
            case 5:
              return U;
          }
          var X = "string",
            le = Gn(U, f);
          if (le !== void 0) {
            var be = le.call(U, X);
            if (ge(be)) throw new TypeError();
            return be;
          }
          return We(U);
        }
        function We(U, G) {
          var X, le;
          {
            var be = U.toString;
            if (Ln(be)) {
              var le = be.call(U);
              if (!ge(le)) return le;
            }
            var X = U.valueOf;
            if (Ln(X)) {
              var le = X.call(U);
              if (!ge(le)) return le;
            }
          }
          throw new TypeError();
        }
        function qe(U) {
          return !!U;
        }
        function rn(U) {
          return "" + U;
        }
        function bt(U) {
          var G = ke(U);
          return Ce(G) ? G : rn(G);
        }
        function Dn(U) {
          return Array.isArray
            ? Array.isArray(U)
            : U instanceof Object
              ? U instanceof Array
              : Object.prototype.toString.call(U) === "[object Array]";
        }
        function Ln(U) {
          return typeof U == "function";
        }
        function _e(U) {
          return typeof U == "function";
        }
        function mn(U) {
          switch (V(U)) {
            case 3:
              return !0;
            case 4:
              return !0;
            default:
              return !1;
          }
        }
        function vn(U, G) {
          return U === G || (U !== U && G !== G);
        }
        function Gn(U, G) {
          var X = U[G];
          if (X != null) {
            if (!Ln(X)) throw new TypeError();
            return X;
          }
        }
        function mr(U) {
          var G = Gn(U, p);
          if (!Ln(G)) throw new TypeError();
          var X = G.call(U);
          if (!ge(X)) throw new TypeError();
          return X;
        }
        function Ma(U) {
          return U.value;
        }
        function Nn(U) {
          var G = U.next();
          return G.done ? !1 : G;
        }
        function Pn(U) {
          var G = U.return;
          G && G.call(U);
        }
        function qn(U) {
          var G = Object.getPrototypeOf(U);
          if (typeof U != "function" || U === E || G !== E) return G;
          var X = U.prototype,
            le = X && Object.getPrototypeOf(X);
          if (le == null || le === Object.prototype) return G;
          var be = le.constructor;
          return typeof be != "function" || be === U ? G : be;
        }
        function bn() {
          var U;
          !B(O) &&
            typeof l.Reflect < "u" &&
            !(O in l.Reflect) &&
            typeof l.Reflect.defineMetadata == "function" &&
            (U = Yr(l.Reflect));
          var G,
            X,
            le,
            be = new b(),
            pt = { registerProvider: ft, getProvider: pe, setProvider: Se };
          return pt;
          function ft(me) {
            if (!Object.isExtensible(pt))
              throw new Error("Cannot add provider to a frozen registry.");
            switch (!0) {
              case U === me:
                break;
              case B(G):
                G = me;
                break;
              case G === me:
                break;
              case B(X):
                X = me;
                break;
              case X === me:
                break;
              default:
                (le === void 0 && (le = new S()), le.add(me));
                break;
            }
          }
          function je(me, Ne) {
            if (!B(G)) {
              if (G.isProviderFor(me, Ne)) return G;
              if (!B(X)) {
                if (X.isProviderFor(me, Ne)) return G;
                if (!B(le))
                  for (var Ye = mr(le); ; ) {
                    var st = Nn(Ye);
                    if (!st) return;
                    var $t = Ma(st);
                    if ($t.isProviderFor(me, Ne)) return (Pn(Ye), $t);
                  }
              }
            }
            if (!B(U) && U.isProviderFor(me, Ne)) return U;
          }
          function pe(me, Ne) {
            var Ye = be.get(me),
              st;
            return (
              B(Ye) || (st = Ye.get(Ne)),
              B(st) &&
                ((st = je(me, Ne)),
                B(st) ||
                  (B(Ye) && ((Ye = new w()), be.set(me, Ye)), Ye.set(Ne, st))),
              st
            );
          }
          function ye(me) {
            if (B(me)) throw new TypeError();
            return G === me || X === me || (!B(le) && le.has(me));
          }
          function Se(me, Ne, Ye) {
            if (!ye(Ye)) throw new Error("Metadata provider not registered.");
            var st = pe(me, Ne);
            if (st !== Ye) {
              if (!B(st)) return !1;
              var $t = be.get(me);
              (B($t) && (($t = new w()), be.set(me, $t)), $t.set(Ne, Ye));
            }
            return !0;
          }
        }
        function At() {
          var U;
          return (
            !B(O) &&
              ge(l.Reflect) &&
              Object.isExtensible(l.Reflect) &&
              (U = l.Reflect[O]),
            B(U) && (U = bn()),
            !B(O) &&
              ge(l.Reflect) &&
              Object.isExtensible(l.Reflect) &&
              Object.defineProperty(l.Reflect, O, {
                enumerable: !1,
                configurable: !1,
                writable: !1,
                value: U,
              }),
            U
          );
        }
        function qr(U) {
          var G = new b(),
            X = {
              isProviderFor: function (ye, Se) {
                var me = G.get(ye);
                return B(me) ? !1 : me.has(Se);
              },
              OrdinaryDefineOwnMetadata: ft,
              OrdinaryHasOwnMetadata: be,
              OrdinaryGetOwnMetadata: pt,
              OrdinaryOwnMetadataKeys: je,
              OrdinaryDeleteMetadata: pe,
            };
          return (k.registerProvider(X), X);
          function le(ye, Se, me) {
            var Ne = G.get(ye),
              Ye = !1;
            if (B(Ne)) {
              if (!me) return;
              ((Ne = new w()), G.set(ye, Ne), (Ye = !0));
            }
            var st = Ne.get(Se);
            if (B(st)) {
              if (!me) return;
              if (((st = new w()), Ne.set(Se, st), !U.setProvider(ye, Se, X)))
                throw (
                  Ne.delete(Se),
                  Ye && G.delete(ye),
                  new Error("Wrong provider for target.")
                );
            }
            return st;
          }
          function be(ye, Se, me) {
            var Ne = le(Se, me, !1);
            return B(Ne) ? !1 : qe(Ne.has(ye));
          }
          function pt(ye, Se, me) {
            var Ne = le(Se, me, !1);
            if (!B(Ne)) return Ne.get(ye);
          }
          function ft(ye, Se, me, Ne) {
            var Ye = le(me, Ne, !0);
            Ye.set(ye, Se);
          }
          function je(ye, Se) {
            var me = [],
              Ne = le(ye, Se, !1);
            if (B(Ne)) return me;
            for (var Ye = Ne.keys(), st = mr(Ye), $t = 0; ; ) {
              var za = Nn(st);
              if (!za) return ((me.length = $t), me);
              var Nt = Ma(za);
              try {
                me[$t] = Nt;
              } catch (rl) {
                try {
                  Pn(st);
                } finally {
                  throw rl;
                }
              }
              $t++;
            }
          }
          function pe(ye, Se, me) {
            var Ne = le(Se, me, !1);
            if (B(Ne) || !Ne.delete(ye)) return !1;
            if (Ne.size === 0) {
              var Ye = G.get(Se);
              B(Ye) || (Ye.delete(me), Ye.size === 0 && G.delete(Ye));
            }
            return !0;
          }
        }
        function Yr(U) {
          var G = U.defineMetadata,
            X = U.hasOwnMetadata,
            le = U.getOwnMetadata,
            be = U.getOwnMetadataKeys,
            pt = U.deleteMetadata,
            ft = new b(),
            je = {
              isProviderFor: function (pe, ye) {
                var Se = ft.get(pe);
                return !B(Se) && Se.has(ye)
                  ? !0
                  : be(pe, ye).length
                    ? (B(Se) && ((Se = new S()), ft.set(pe, Se)),
                      Se.add(ye),
                      !0)
                    : !1;
              },
              OrdinaryDefineOwnMetadata: G,
              OrdinaryHasOwnMetadata: X,
              OrdinaryGetOwnMetadata: le,
              OrdinaryOwnMetadataKeys: be,
              OrdinaryDeleteMetadata: pt,
            };
          return je;
        }
        function Yn(U, G, X) {
          var le = k.getProvider(U, G);
          if (!B(le)) return le;
          if (X) {
            if (k.setProvider(U, G, L)) return L;
            throw new Error("Illegal state.");
          }
        }
        function Mn() {
          var U = {},
            G = [],
            X = (function () {
              function je(pe, ye, Se) {
                ((this._index = 0),
                  (this._keys = pe),
                  (this._values = ye),
                  (this._selector = Se));
              }
              return (
                (je.prototype["@@iterator"] = function () {
                  return this;
                }),
                (je.prototype[p] = function () {
                  return this;
                }),
                (je.prototype.next = function () {
                  var pe = this._index;
                  if (pe >= 0 && pe < this._keys.length) {
                    var ye = this._selector(this._keys[pe], this._values[pe]);
                    return (
                      pe + 1 >= this._keys.length
                        ? ((this._index = -1),
                          (this._keys = G),
                          (this._values = G))
                        : this._index++,
                      { value: ye, done: !1 }
                    );
                  }
                  return { value: void 0, done: !0 };
                }),
                (je.prototype.throw = function (pe) {
                  throw (
                    this._index >= 0 &&
                      ((this._index = -1),
                      (this._keys = G),
                      (this._values = G)),
                    pe
                  );
                }),
                (je.prototype.return = function (pe) {
                  return (
                    this._index >= 0 &&
                      ((this._index = -1),
                      (this._keys = G),
                      (this._values = G)),
                    { value: pe, done: !0 }
                  );
                }),
                je
              );
            })(),
            le = (function () {
              function je() {
                ((this._keys = []),
                  (this._values = []),
                  (this._cacheKey = U),
                  (this._cacheIndex = -2));
              }
              return (
                Object.defineProperty(je.prototype, "size", {
                  get: function () {
                    return this._keys.length;
                  },
                  enumerable: !0,
                  configurable: !0,
                }),
                (je.prototype.has = function (pe) {
                  return this._find(pe, !1) >= 0;
                }),
                (je.prototype.get = function (pe) {
                  var ye = this._find(pe, !1);
                  return ye >= 0 ? this._values[ye] : void 0;
                }),
                (je.prototype.set = function (pe, ye) {
                  var Se = this._find(pe, !0);
                  return ((this._values[Se] = ye), this);
                }),
                (je.prototype.delete = function (pe) {
                  var ye = this._find(pe, !1);
                  if (ye >= 0) {
                    for (var Se = this._keys.length, me = ye + 1; me < Se; me++)
                      ((this._keys[me - 1] = this._keys[me]),
                        (this._values[me - 1] = this._values[me]));
                    return (
                      this._keys.length--,
                      this._values.length--,
                      vn(pe, this._cacheKey) &&
                        ((this._cacheKey = U), (this._cacheIndex = -2)),
                      !0
                    );
                  }
                  return !1;
                }),
                (je.prototype.clear = function () {
                  ((this._keys.length = 0),
                    (this._values.length = 0),
                    (this._cacheKey = U),
                    (this._cacheIndex = -2));
                }),
                (je.prototype.keys = function () {
                  return new X(this._keys, this._values, be);
                }),
                (je.prototype.values = function () {
                  return new X(this._keys, this._values, pt);
                }),
                (je.prototype.entries = function () {
                  return new X(this._keys, this._values, ft);
                }),
                (je.prototype["@@iterator"] = function () {
                  return this.entries();
                }),
                (je.prototype[p] = function () {
                  return this.entries();
                }),
                (je.prototype._find = function (pe, ye) {
                  if (!vn(this._cacheKey, pe)) {
                    this._cacheIndex = -1;
                    for (var Se = 0; Se < this._keys.length; Se++)
                      if (vn(this._keys[Se], pe)) {
                        this._cacheIndex = Se;
                        break;
                      }
                  }
                  return (
                    this._cacheIndex < 0 &&
                      ye &&
                      ((this._cacheIndex = this._keys.length),
                      this._keys.push(pe),
                      this._values.push(void 0)),
                    this._cacheIndex
                  );
                }),
                je
              );
            })();
          return le;
          function be(je, pe) {
            return je;
          }
          function pt(je, pe) {
            return pe;
          }
          function ft(je, pe) {
            return [je, pe];
          }
        }
        function Zr() {
          var U = (function () {
            function G() {
              this._map = new w();
            }
            return (
              Object.defineProperty(G.prototype, "size", {
                get: function () {
                  return this._map.size;
                },
                enumerable: !0,
                configurable: !0,
              }),
              (G.prototype.has = function (X) {
                return this._map.has(X);
              }),
              (G.prototype.add = function (X) {
                return (this._map.set(X, X), this);
              }),
              (G.prototype.delete = function (X) {
                return this._map.delete(X);
              }),
              (G.prototype.clear = function () {
                this._map.clear();
              }),
              (G.prototype.keys = function () {
                return this._map.keys();
              }),
              (G.prototype.values = function () {
                return this._map.keys();
              }),
              (G.prototype.entries = function () {
                return this._map.entries();
              }),
              (G.prototype["@@iterator"] = function () {
                return this.keys();
              }),
              (G.prototype[p] = function () {
                return this.keys();
              }),
              G
            );
          })();
          return U;
        }
        function vr() {
          var U = 16,
            G = v.create(),
            X = le();
          return (function () {
            function pe() {
              this._key = le();
            }
            return (
              (pe.prototype.has = function (ye) {
                var Se = be(ye, !1);
                return Se !== void 0 ? v.has(Se, this._key) : !1;
              }),
              (pe.prototype.get = function (ye) {
                var Se = be(ye, !1);
                return Se !== void 0 ? v.get(Se, this._key) : void 0;
              }),
              (pe.prototype.set = function (ye, Se) {
                var me = be(ye, !0);
                return ((me[this._key] = Se), this);
              }),
              (pe.prototype.delete = function (ye) {
                var Se = be(ye, !1);
                return Se !== void 0 ? delete Se[this._key] : !1;
              }),
              (pe.prototype.clear = function () {
                this._key = le();
              }),
              pe
            );
          })();
          function le() {
            var pe;
            do pe = "@@WeakMap@@" + je();
            while (v.has(G, pe));
            return ((G[pe] = !0), pe);
          }
          function be(pe, ye) {
            if (!s.call(pe, X)) {
              if (!ye) return;
              Object.defineProperty(pe, X, { value: v.create() });
            }
            return pe[X];
          }
          function pt(pe, ye) {
            for (var Se = 0; Se < ye; ++Se) pe[Se] = (Math.random() * 255) | 0;
            return pe;
          }
          function ft(pe) {
            if (typeof Uint8Array == "function") {
              var ye = new Uint8Array(pe);
              return (
                typeof crypto < "u"
                  ? crypto.getRandomValues(ye)
                  : typeof msCrypto < "u"
                    ? msCrypto.getRandomValues(ye)
                    : pt(ye, pe),
                ye
              );
            }
            return pt(new Array(pe), pe);
          }
          function je() {
            var pe = ft(U);
            ((pe[6] = (pe[6] & 79) | 64), (pe[8] = (pe[8] & 191) | 128));
            for (var ye = "", Se = 0; Se < U; ++Se) {
              var me = pe[Se];
              ((Se === 4 || Se === 6 || Se === 8) && (ye += "-"),
                me < 16 && (ye += "0"),
                (ye += me.toString(16).toLowerCase()));
            }
            return ye;
          }
        }
        function ja(U) {
          return ((U.__ = void 0), delete U.__, U);
        }
      });
    })(t || (t = {})),
    Wm
  );
}
vO();
var Zd;
(function (t) {
  ((t[(t.Transient = 0)] = "Transient"),
    (t[(t.Singleton = 1)] = "Singleton"),
    (t[(t.ResolutionScoped = 2)] = "ResolutionScoped"),
    (t[(t.ContainerScoped = 3)] = "ContainerScoped"));
})(Zd || (Zd = {}));
const an = Zd;
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ var Xd =
  function (t, a) {
    return (
      (Xd =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (r, l) {
            r.__proto__ = l;
          }) ||
        function (r, l) {
          for (var s in l) l.hasOwnProperty(s) && (r[s] = l[s]);
        }),
      Xd(t, a)
    );
  };
function wp(t, a) {
  Xd(t, a);
  function r() {
    this.constructor = t;
  }
  t.prototype =
    a === null ? Object.create(a) : ((r.prototype = a.prototype), new r());
}
function bO(t, a, r, l) {
  function s(u) {
    return u instanceof r
      ? u
      : new r(function (f) {
          f(u);
        });
  }
  return new (r || (r = Promise))(function (u, f) {
    function p(y) {
      try {
        g(l.next(y));
      } catch (v) {
        f(v);
      }
    }
    function h(y) {
      try {
        g(l.throw(y));
      } catch (v) {
        f(v);
      }
    }
    function g(y) {
      y.done ? u(y.value) : s(y.value).then(p, h);
    }
    g((l = l.apply(t, [])).next());
  });
}
function SO(t, a) {
  var r = {
      label: 0,
      sent: function () {
        if (u[0] & 1) throw u[1];
        return u[1];
      },
      trys: [],
      ops: [],
    },
    l,
    s,
    u,
    f;
  return (
    (f = { next: p(0), throw: p(1), return: p(2) }),
    typeof Symbol == "function" &&
      (f[Symbol.iterator] = function () {
        return this;
      }),
    f
  );
  function p(g) {
    return function (y) {
      return h([g, y]);
    };
  }
  function h(g) {
    if (l) throw new TypeError("Generator is already executing.");
    for (; r; )
      try {
        if (
          ((l = 1),
          s &&
            (u =
              g[0] & 2
                ? s.return
                : g[0]
                  ? s.throw || ((u = s.return) && u.call(s), 0)
                  : s.next) &&
            !(u = u.call(s, g[1])).done)
        )
          return u;
        switch (((s = 0), u && (g = [g[0] & 2, u.value]), g[0])) {
          case 0:
          case 1:
            u = g;
            break;
          case 4:
            return (r.label++, { value: g[1], done: !1 });
          case 5:
            (r.label++, (s = g[1]), (g = [0]));
            continue;
          case 7:
            ((g = r.ops.pop()), r.trys.pop());
            continue;
          default:
            if (
              ((u = r.trys),
              !(u = u.length > 0 && u[u.length - 1]) &&
                (g[0] === 6 || g[0] === 2))
            ) {
              r = 0;
              continue;
            }
            if (g[0] === 3 && (!u || (g[1] > u[0] && g[1] < u[3]))) {
              r.label = g[1];
              break;
            }
            if (g[0] === 6 && r.label < u[1]) {
              ((r.label = u[1]), (u = g));
              break;
            }
            if (u && r.label < u[2]) {
              ((r.label = u[2]), r.ops.push(g));
              break;
            }
            (u[2] && r.ops.pop(), r.trys.pop());
            continue;
        }
        g = a.call(t, r);
      } catch (y) {
        ((g = [6, y]), (s = 0));
      } finally {
        l = u = 0;
      }
    if (g[0] & 5) throw g[1];
    return { value: g[0] ? g[1] : void 0, done: !0 };
  }
}
function Ys(t) {
  var a = typeof Symbol == "function" && Symbol.iterator,
    r = a && t[a],
    l = 0;
  if (r) return r.call(t);
  if (t && typeof t.length == "number")
    return {
      next: function () {
        return (
          t && l >= t.length && (t = void 0),
          { value: t && t[l++], done: !t }
        );
      },
    };
  throw new TypeError(
    a ? "Object is not iterable." : "Symbol.iterator is not defined.",
  );
}
function gu(t, a) {
  var r = typeof Symbol == "function" && t[Symbol.iterator];
  if (!r) return t;
  var l = r.call(t),
    s,
    u = [],
    f;
  try {
    for (; (a === void 0 || a-- > 0) && !(s = l.next()).done; ) u.push(s.value);
  } catch (p) {
    f = { error: p };
  } finally {
    try {
      s && !s.done && (r = l.return) && r.call(l);
    } finally {
      if (f) throw f.error;
    }
  }
  return u;
}
function $r() {
  for (var t = [], a = 0; a < arguments.length; a++)
    t = t.concat(gu(arguments[a]));
  return t;
}
var Kd = "injectionTokens";
function EO(t) {
  var a = Reflect.getMetadata("design:paramtypes", t) || [],
    r = Reflect.getOwnMetadata(Kd, t) || {};
  return (
    Object.keys(r).forEach(function (l) {
      a[+l] = r[l];
    }),
    a
  );
}
function _O(t, a) {
  return function (r, l, s) {
    var u = Reflect.getOwnMetadata(Kd, r) || {};
    ((u[s] = t), Reflect.defineMetadata(Kd, u, r));
  };
}
function a0(t) {
  return !!t.useClass;
}
function Qd(t) {
  return !!t.useFactory;
}
var r0 = (function () {
  function t(a) {
    ((this.wrap = a),
      (this.reflectMethods = [
        "get",
        "getPrototypeOf",
        "setPrototypeOf",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "set",
        "deleteProperty",
        "apply",
        "construct",
        "ownKeys",
      ]));
  }
  return (
    (t.prototype.createProxy = function (a) {
      var r = this,
        l = {},
        s = !1,
        u,
        f = function () {
          return (s || ((u = a(r.wrap())), (s = !0)), u);
        };
      return new Proxy(l, this.createHandler(f));
    }),
    (t.prototype.createHandler = function (a) {
      var r = {},
        l = function (s) {
          r[s] = function () {
            for (var u = [], f = 0; f < arguments.length; f++)
              u[f] = arguments[f];
            u[0] = a();
            var p = Reflect[s];
            return p.apply(void 0, $r(u));
          };
        };
      return (this.reflectMethods.forEach(l), r);
    }),
    t
  );
})();
function Mi(t) {
  return typeof t == "string" || typeof t == "symbol";
}
function wO(t) {
  return typeof t == "object" && "token" in t && "multiple" in t;
}
function tv(t) {
  return typeof t == "object" && "token" in t && "transform" in t;
}
function OO(t) {
  return typeof t == "function" || t instanceof r0;
}
function nu(t) {
  return !!t.useToken;
}
function au(t) {
  return t.useValue != null;
}
function xO(t) {
  return a0(t) || au(t) || nu(t) || Qd(t);
}
var Op = (function () {
    function t() {
      this._registryMap = new Map();
    }
    return (
      (t.prototype.entries = function () {
        return this._registryMap.entries();
      }),
      (t.prototype.getAll = function (a) {
        return (this.ensure(a), this._registryMap.get(a));
      }),
      (t.prototype.get = function (a) {
        this.ensure(a);
        var r = this._registryMap.get(a);
        return r[r.length - 1] || null;
      }),
      (t.prototype.set = function (a, r) {
        (this.ensure(a), this._registryMap.get(a).push(r));
      }),
      (t.prototype.setAll = function (a, r) {
        this._registryMap.set(a, r);
      }),
      (t.prototype.has = function (a) {
        return (this.ensure(a), this._registryMap.get(a).length > 0);
      }),
      (t.prototype.clear = function () {
        this._registryMap.clear();
      }),
      (t.prototype.ensure = function (a) {
        this._registryMap.has(a) || this._registryMap.set(a, []);
      }),
      t
    );
  })(),
  CO = (function (t) {
    wp(a, t);
    function a() {
      return (t !== null && t.apply(this, arguments)) || this;
    }
    return a;
  })(Op),
  Zs = (function () {
    function t() {
      this.scopedResolutions = new Map();
    }
    return t;
  })();
function TO(t, a) {
  if (t === null) return "at position #" + a;
  var r = t.split(",")[a].trim();
  return '"' + r + '" at position #' + a;
}
function AO(t, a, r) {
  return (
    r === void 0 && (r = "    "),
    $r(
      [t],
      a.message
        .split(
          `
`,
        )
        .map(function (l) {
          return r + l;
        }),
    ).join(`
`)
  );
}
function RO(t, a, r) {
  var l = gu(t.toString().match(/constructor\(([\w, ]+)\)/) || [], 2),
    s = l[1],
    u = s === void 0 ? null : s,
    f = TO(u, a);
  return AO(
    "Cannot inject the dependency " +
      f +
      ' of "' +
      t.name +
      '" constructor. Reason:',
    r,
  );
}
function kO(t) {
  if (typeof t.dispose != "function") return !1;
  var a = t.dispose;
  return !(a.length > 0);
}
var DO = (function (t) {
    wp(a, t);
    function a() {
      return (t !== null && t.apply(this, arguments)) || this;
    }
    return a;
  })(Op),
  LO = (function (t) {
    wp(a, t);
    function a() {
      return (t !== null && t.apply(this, arguments)) || this;
    }
    return a;
  })(Op),
  NO = (function () {
    function t() {
      ((this.preResolution = new DO()), (this.postResolution = new LO()));
    }
    return t;
  })(),
  i0 = new Map(),
  MO = (function () {
    function t(a) {
      ((this.parent = a),
        (this._registry = new CO()),
        (this.interceptors = new NO()),
        (this.disposed = !1),
        (this.disposables = new Set()));
    }
    return (
      (t.prototype.register = function (a, r, l) {
        (l === void 0 && (l = { lifecycle: an.Transient }),
          this.ensureNotDisposed());
        var s;
        if ((xO(r) ? (s = r) : (s = { useClass: r }), nu(s)))
          for (var u = [a], f = s; f != null; ) {
            var p = f.useToken;
            if (u.includes(p))
              throw new Error(
                "Token registration cycle detected! " + $r(u, [p]).join(" -> "),
              );
            u.push(p);
            var h = this._registry.get(p);
            h && nu(h.provider) ? (f = h.provider) : (f = null);
          }
        if (
          (l.lifecycle === an.Singleton ||
            l.lifecycle == an.ContainerScoped ||
            l.lifecycle == an.ResolutionScoped) &&
          (au(s) || Qd(s))
        )
          throw new Error(
            'Cannot use lifecycle "' +
              an[l.lifecycle] +
              '" with ValueProviders or FactoryProviders',
          );
        return (this._registry.set(a, { provider: s, options: l }), this);
      }),
      (t.prototype.registerType = function (a, r) {
        return (
          this.ensureNotDisposed(),
          Mi(r)
            ? this.register(a, { useToken: r })
            : this.register(a, { useClass: r })
        );
      }),
      (t.prototype.registerInstance = function (a, r) {
        return (this.ensureNotDisposed(), this.register(a, { useValue: r }));
      }),
      (t.prototype.registerSingleton = function (a, r) {
        if ((this.ensureNotDisposed(), Mi(a))) {
          if (Mi(r))
            return this.register(
              a,
              { useToken: r },
              { lifecycle: an.Singleton },
            );
          if (r)
            return this.register(
              a,
              { useClass: r },
              { lifecycle: an.Singleton },
            );
          throw new Error(
            'Cannot register a type name as a singleton without a "to" token',
          );
        }
        var l = a;
        return (
          r && !Mi(r) && (l = r),
          this.register(a, { useClass: l }, { lifecycle: an.Singleton })
        );
      }),
      (t.prototype.resolve = function (a, r, l) {
        (r === void 0 && (r = new Zs()),
          l === void 0 && (l = !1),
          this.ensureNotDisposed());
        var s = this.getRegistration(a);
        if (!s && Mi(a)) {
          if (l) return;
          throw new Error(
            'Attempted to resolve unregistered dependency token: "' +
              a.toString() +
              '"',
          );
        }
        if ((this.executePreResolutionInterceptor(a, "Single"), s)) {
          var u = this.resolveRegistration(s, r);
          return (this.executePostResolutionInterceptor(a, u, "Single"), u);
        }
        if (OO(a)) {
          var u = this.construct(a, r);
          return (this.executePostResolutionInterceptor(a, u, "Single"), u);
        }
        throw new Error(
          "Attempted to construct an undefined constructor. Could mean a circular dependency problem. Try using `delay` function.",
        );
      }),
      (t.prototype.executePreResolutionInterceptor = function (a, r) {
        var l, s;
        if (this.interceptors.preResolution.has(a)) {
          var u = [];
          try {
            for (
              var f = Ys(this.interceptors.preResolution.getAll(a)),
                p = f.next();
              !p.done;
              p = f.next()
            ) {
              var h = p.value;
              (h.options.frequency != "Once" && u.push(h), h.callback(a, r));
            }
          } catch (g) {
            l = { error: g };
          } finally {
            try {
              p && !p.done && (s = f.return) && s.call(f);
            } finally {
              if (l) throw l.error;
            }
          }
          this.interceptors.preResolution.setAll(a, u);
        }
      }),
      (t.prototype.executePostResolutionInterceptor = function (a, r, l) {
        var s, u;
        if (this.interceptors.postResolution.has(a)) {
          var f = [];
          try {
            for (
              var p = Ys(this.interceptors.postResolution.getAll(a)),
                h = p.next();
              !h.done;
              h = p.next()
            ) {
              var g = h.value;
              (g.options.frequency != "Once" && f.push(g), g.callback(a, r, l));
            }
          } catch (y) {
            s = { error: y };
          } finally {
            try {
              h && !h.done && (u = p.return) && u.call(p);
            } finally {
              if (s) throw s.error;
            }
          }
          this.interceptors.postResolution.setAll(a, f);
        }
      }),
      (t.prototype.resolveRegistration = function (a, r) {
        if (
          (this.ensureNotDisposed(),
          a.options.lifecycle === an.ResolutionScoped &&
            r.scopedResolutions.has(a))
        )
          return r.scopedResolutions.get(a);
        var l = a.options.lifecycle === an.Singleton,
          s = a.options.lifecycle === an.ContainerScoped,
          u = l || s,
          f;
        return (
          au(a.provider)
            ? (f = a.provider.useValue)
            : nu(a.provider)
              ? (f = u
                  ? a.instance ||
                    (a.instance = this.resolve(a.provider.useToken, r))
                  : this.resolve(a.provider.useToken, r))
              : a0(a.provider)
                ? (f = u
                    ? a.instance ||
                      (a.instance = this.construct(a.provider.useClass, r))
                    : this.construct(a.provider.useClass, r))
                : Qd(a.provider)
                  ? (f = a.provider.useFactory(this))
                  : (f = this.construct(a.provider, r)),
          a.options.lifecycle === an.ResolutionScoped &&
            r.scopedResolutions.set(a, f),
          f
        );
      }),
      (t.prototype.resolveAll = function (a, r, l) {
        var s = this;
        (r === void 0 && (r = new Zs()),
          l === void 0 && (l = !1),
          this.ensureNotDisposed());
        var u = this.getAllRegistrations(a);
        if (!u && Mi(a)) {
          if (l) return [];
          throw new Error(
            'Attempted to resolve unregistered dependency token: "' +
              a.toString() +
              '"',
          );
        }
        if ((this.executePreResolutionInterceptor(a, "All"), u)) {
          var f = u.map(function (h) {
            return s.resolveRegistration(h, r);
          });
          return (this.executePostResolutionInterceptor(a, f, "All"), f);
        }
        var p = [this.construct(a, r)];
        return (this.executePostResolutionInterceptor(a, p, "All"), p);
      }),
      (t.prototype.isRegistered = function (a, r) {
        return (
          r === void 0 && (r = !1),
          this.ensureNotDisposed(),
          this._registry.has(a) ||
            (r && (this.parent || !1) && this.parent.isRegistered(a, !0))
        );
      }),
      (t.prototype.reset = function () {
        (this.ensureNotDisposed(),
          this._registry.clear(),
          this.interceptors.preResolution.clear(),
          this.interceptors.postResolution.clear());
      }),
      (t.prototype.clearInstances = function () {
        var a, r;
        this.ensureNotDisposed();
        try {
          for (
            var l = Ys(this._registry.entries()), s = l.next();
            !s.done;
            s = l.next()
          ) {
            var u = gu(s.value, 2),
              f = u[0],
              p = u[1];
            this._registry.setAll(
              f,
              p
                .filter(function (h) {
                  return !au(h.provider);
                })
                .map(function (h) {
                  return ((h.instance = void 0), h);
                }),
            );
          }
        } catch (h) {
          a = { error: h };
        } finally {
          try {
            s && !s.done && (r = l.return) && r.call(l);
          } finally {
            if (a) throw a.error;
          }
        }
      }),
      (t.prototype.createChildContainer = function () {
        var a, r;
        this.ensureNotDisposed();
        var l = new t(this);
        try {
          for (
            var s = Ys(this._registry.entries()), u = s.next();
            !u.done;
            u = s.next()
          ) {
            var f = gu(u.value, 2),
              p = f[0],
              h = f[1];
            h.some(function (g) {
              var y = g.options;
              return y.lifecycle === an.ContainerScoped;
            }) &&
              l._registry.setAll(
                p,
                h.map(function (g) {
                  return g.options.lifecycle === an.ContainerScoped
                    ? { provider: g.provider, options: g.options }
                    : g;
                }),
              );
          }
        } catch (g) {
          a = { error: g };
        } finally {
          try {
            u && !u.done && (r = s.return) && r.call(s);
          } finally {
            if (a) throw a.error;
          }
        }
        return l;
      }),
      (t.prototype.beforeResolution = function (a, r, l) {
        (l === void 0 && (l = { frequency: "Always" }),
          this.interceptors.preResolution.set(a, { callback: r, options: l }));
      }),
      (t.prototype.afterResolution = function (a, r, l) {
        (l === void 0 && (l = { frequency: "Always" }),
          this.interceptors.postResolution.set(a, { callback: r, options: l }));
      }),
      (t.prototype.dispose = function () {
        return bO(this, void 0, void 0, function () {
          var a;
          return SO(this, function (r) {
            switch (r.label) {
              case 0:
                return (
                  (this.disposed = !0),
                  (a = []),
                  this.disposables.forEach(function (l) {
                    var s = l.dispose();
                    s && a.push(s);
                  }),
                  [4, Promise.all(a)]
                );
              case 1:
                return (r.sent(), [2]);
            }
          });
        });
      }),
      (t.prototype.getRegistration = function (a) {
        return this.isRegistered(a)
          ? this._registry.get(a)
          : this.parent
            ? this.parent.getRegistration(a)
            : null;
      }),
      (t.prototype.getAllRegistrations = function (a) {
        return this.isRegistered(a)
          ? this._registry.getAll(a)
          : this.parent
            ? this.parent.getAllRegistrations(a)
            : null;
      }),
      (t.prototype.construct = function (a, r) {
        var l = this;
        if (a instanceof r0)
          return a.createProxy(function (u) {
            return l.resolve(u, r);
          });
        var s = (function () {
          var u = i0.get(a);
          if (!u || u.length === 0) {
            if (a.length === 0) return new a();
            throw new Error('TypeInfo not known for "' + a.name + '"');
          }
          var f = u.map(l.resolveParams(r, a));
          return new (a.bind.apply(a, $r([void 0], f)))();
        })();
        return (kO(s) && this.disposables.add(s), s);
      }),
      (t.prototype.resolveParams = function (a, r) {
        var l = this;
        return function (s, u) {
          var f, p, h;
          try {
            return wO(s)
              ? tv(s)
                ? s.multiple
                  ? (f = l.resolve(s.transform)).transform.apply(
                      f,
                      $r(
                        [l.resolveAll(s.token, new Zs(), s.isOptional)],
                        s.transformArgs,
                      ),
                    )
                  : (p = l.resolve(s.transform)).transform.apply(
                      p,
                      $r(
                        [l.resolve(s.token, a, s.isOptional)],
                        s.transformArgs,
                      ),
                    )
                : s.multiple
                  ? l.resolveAll(s.token, new Zs(), s.isOptional)
                  : l.resolve(s.token, a, s.isOptional)
              : tv(s)
                ? (h = l.resolve(s.transform, a)).transform.apply(
                    h,
                    $r([l.resolve(s.token, a)], s.transformArgs),
                  )
                : l.resolve(s, a);
          } catch (g) {
            throw new Error(RO(r, u, g));
          }
        };
      }),
      (t.prototype.ensureNotDisposed = function () {
        if (this.disposed)
          throw new Error(
            "This container has been disposed, you cannot interact with a disposed container",
          );
      }),
      t
    );
  })(),
  Lt = new MO();
function Pi(t, a) {
  var r = { token: t, multiple: !1, isOptional: a };
  return _O(r);
}
function Co(t) {
  return function (a) {
    i0.set(a, EO(a));
  };
}
function yr() {
  return function (t) {
    (Co()(t), Lt.registerSingleton(t));
  };
}
if (typeof Reflect > "u" || !Reflect.getMetadata)
  throw new Error(
    `tsyringe requires a reflect polyfill. Please add 'import "reflect-metadata"' to the top of your entry point.`,
  );
const qi = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__,
  ua = globalThis,
  ho = "10.68.0";
function xp() {
  return (Cp(ua), ua);
}
function Cp(t) {
  const a = (t.__SENTRY__ = t.__SENTRY__ || {});
  return ((a.version = a.version || ho), (a[ho] = a[ho] || {}));
}
function Tp(t, a, r = ua) {
  const l = (r.__SENTRY__ = r.__SENTRY__ || {}),
    s = (l[ho] = l[ho] || {});
  return s[t] || (s[t] = a());
}
const jO = "Sentry Logger ",
  nv = {};
function l0(t) {
  if (!("console" in ua)) return t();
  const a = ua.console,
    r = {},
    l = Object.keys(nv);
  l.forEach((s) => {
    const u = nv[s];
    ((r[s] = a[s]), (a[s] = u));
  });
  try {
    return t();
  } finally {
    l.forEach((s) => {
      a[s] = r[s];
    });
  }
}
function zO() {
  Rp().enabled = !0;
}
function BO() {
  Rp().enabled = !1;
}
function o0() {
  return Rp().enabled;
}
function UO(...t) {
  Ap("log", ...t);
}
function FO(...t) {
  Ap("warn", ...t);
}
function IO(...t) {
  Ap("error", ...t);
}
function Ap(t, ...a) {
  qi &&
    o0() &&
    l0(() => {
      ua.console[t](`${jO}[${t}]:`, ...a);
    });
}
function Rp() {
  return qi ? Tp("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
}
const ru = {
    enable: zO,
    disable: BO,
    isEnabled: o0,
    log: UO,
    warn: FO,
    error: IO,
  },
  HO = Object.prototype.toString;
function $O(t, a) {
  return HO.call(t) === `[object ${a}]`;
}
function VO(t) {
  return $O(t, "Object");
}
function GO(t) {
  return !!(t != null && t.then && typeof t.then == "function");
}
function PO(t, a, r) {
  try {
    Object.defineProperty(t, a, { value: r, writable: !0, configurable: !0 });
  } catch {
    qi &&
      ru.log(
        `Failed to add non-enumerable property "${String(a)}" to object`,
        t,
      );
  }
}
let ji;
function Fu(t) {
  if (ji !== void 0) return ji ? ji(t) : t();
  const a = Symbol.for("__SENTRY_SAFE_RANDOM_ID_WRAPPER__"),
    r = ua;
  return a in r && typeof r[a] == "function"
    ? ((ji = r[a]), ji(t))
    : ((ji = null), t());
}
function Jd() {
  return Fu(() => Math.random());
}
function qO() {
  return Fu(() => Date.now());
}
function YO(t, a = 0) {
  return typeof t != "string" || a === 0 || t.length <= a
    ? t
    : `${t.slice(0, a)}...`;
}
function ZO() {
  const t = ua;
  return t.crypto || t.msCrypto;
}
let hd;
function XO() {
  return Jd() * 16;
}
function go(t = ZO()) {
  try {
    if (t != null && t.randomUUID)
      return Fu(() => t.randomUUID()).replace(/-/g, "");
  } catch {}
  return (
    hd || (hd = "10000000100040008000" + 1e11),
    hd.replace(/[018]/g, (a) => (a ^ ((XO() & 15) >> (a / 4))).toString(16))
  );
}
const s0 = 1e3;
function kp() {
  return qO() / s0;
}
function KO() {
  const { performance: t } = ua;
  if (!(t != null && t.now) || !t.timeOrigin) return kp;
  const a = t.timeOrigin;
  return () => (a + Fu(() => t.now())) / s0;
}
let av;
function QO() {
  return (av ?? (av = KO()))();
}
function JO(t, a = {}) {
  if (
    (a.user &&
      (!t.ipAddress && a.user.ip_address && (t.ipAddress = a.user.ip_address),
      !t.did &&
        !a.did &&
        (t.did = a.user.id || a.user.email || a.user.username)),
    (t.timestamp = a.timestamp || QO()),
    a.abnormal_mechanism && (t.abnormal_mechanism = a.abnormal_mechanism),
    a.ignoreDuration && (t.ignoreDuration = a.ignoreDuration),
    a.sid && (t.sid = a.sid.length === 32 ? a.sid : go()),
    a.init !== void 0 && (t.init = a.init),
    !t.did && a.did && (t.did = `${a.did}`),
    typeof a.started == "number" && (t.started = a.started),
    t.ignoreDuration)
  )
    t.duration = void 0;
  else if (typeof a.duration == "number") t.duration = a.duration;
  else {
    const r = t.timestamp - t.started;
    t.duration = r >= 0 ? r : 0;
  }
  (a.release && (t.release = a.release),
    a.environment && (t.environment = a.environment),
    !t.ipAddress && a.ipAddress && (t.ipAddress = a.ipAddress),
    !t.userAgent && a.userAgent && (t.userAgent = a.userAgent),
    typeof a.errors == "number" && (t.errors = a.errors),
    a.status && (t.status = a.status));
}
function u0(t, a, r = 2) {
  if (!a || typeof a != "object" || r <= 0) return a;
  if (t && Object.keys(a).length === 0) return t;
  const l = { ...t };
  for (const s in a)
    Object.prototype.hasOwnProperty.call(a, s) &&
      (l[s] = u0(l[s], a[s], r - 1));
  return l;
}
function rv() {
  return go();
}
function WO(t) {
  try {
    const a = ua.WeakRef;
    if (typeof a == "function") return new a(t);
  } catch {}
  return t;
}
function ex(t) {
  if (t) {
    if (typeof t == "object" && "deref" in t && typeof t.deref == "function")
      try {
        return t.deref();
      } catch {
        return;
      }
    return t;
  }
}
const Wd = "_sentrySpan";
function iv(t, a) {
  a ? PO(t, Wd, WO(a)) : delete t[Wd];
}
function lv(t) {
  return ex(t[Wd]);
}
const tx = 100;
class gr {
  constructor() {
    ((this._notifyingListeners = !1),
      (this._scopeListeners = []),
      (this._eventProcessors = []),
      (this._breadcrumbs = []),
      (this._attachments = []),
      (this._user = {}),
      (this._tags = {}),
      (this._attributes = {}),
      (this._extra = {}),
      (this._contexts = {}),
      (this._sdkProcessingMetadata = {}),
      (this._propagationContext = { traceId: rv(), sampleRand: Jd() }));
  }
  clone() {
    const a = new gr();
    return (
      (a._breadcrumbs = [...this._breadcrumbs]),
      (a._tags = { ...this._tags }),
      (a._attributes = { ...this._attributes }),
      (a._extra = { ...this._extra }),
      (a._contexts = { ...this._contexts }),
      this._contexts.flags &&
        (a._contexts.flags = { values: [...this._contexts.flags.values] }),
      (a._user = this._user),
      (a._level = this._level),
      (a._session = this._session),
      (a._transactionName = this._transactionName),
      (a._fingerprint = this._fingerprint),
      (a._eventProcessors = [...this._eventProcessors]),
      (a._attachments = [...this._attachments]),
      (a._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }),
      (a._propagationContext = { ...this._propagationContext }),
      (a._client = this._client),
      (a._lastEventId = this._lastEventId),
      (a._conversationId = this._conversationId),
      iv(a, lv(this)),
      a
    );
  }
  setClient(a) {
    this._client = a;
  }
  setLastEventId(a) {
    this._lastEventId = a;
  }
  getClient() {
    return this._client;
  }
  lastEventId() {
    return this._lastEventId;
  }
  addScopeListener(a) {
    this._scopeListeners.push(a);
  }
  addEventProcessor(a) {
    return (this._eventProcessors.push(a), this);
  }
  setUser(a) {
    return (
      (this._user = a || {
        email: void 0,
        id: void 0,
        ip_address: void 0,
        username: void 0,
      }),
      this._session && JO(this._session, { user: a }),
      this._notifyScopeListeners(),
      this
    );
  }
  getUser() {
    return this._user;
  }
  setConversationId(a) {
    return (
      (this._conversationId = a || void 0),
      this._notifyScopeListeners(),
      this
    );
  }
  setTags(a) {
    return (
      (this._tags = { ...this._tags, ...a }),
      this._notifyScopeListeners(),
      this
    );
  }
  setTag(a, r) {
    return this.setTags({ [a]: r });
  }
  setAttributes(a) {
    return (
      (this._attributes = { ...this._attributes, ...a }),
      this._notifyScopeListeners(),
      this
    );
  }
  setAttribute(a, r) {
    return this.setAttributes({ [a]: r });
  }
  removeAttribute(a) {
    return (
      a in this._attributes &&
        (delete this._attributes[a], this._notifyScopeListeners()),
      this
    );
  }
  setExtras(a) {
    return (
      (this._extra = { ...this._extra, ...a }),
      this._notifyScopeListeners(),
      this
    );
  }
  setExtra(a, r) {
    return (
      (this._extra = { ...this._extra, [a]: r }),
      this._notifyScopeListeners(),
      this
    );
  }
  setFingerprint(a) {
    return ((this._fingerprint = a), this._notifyScopeListeners(), this);
  }
  setLevel(a) {
    return ((this._level = a), this._notifyScopeListeners(), this);
  }
  setTransactionName(a) {
    return ((this._transactionName = a), this._notifyScopeListeners(), this);
  }
  setContext(a, r) {
    return (
      r === null ? delete this._contexts[a] : (this._contexts[a] = r),
      this._notifyScopeListeners(),
      this
    );
  }
  setSession(a) {
    return (
      a ? (this._session = a) : delete this._session,
      this._notifyScopeListeners(),
      this
    );
  }
  getSession() {
    return this._session;
  }
  update(a) {
    if (!a) return this;
    const r = typeof a == "function" ? a(this) : a,
      l = r instanceof gr ? r.getScopeData() : VO(r) ? a : void 0,
      {
        tags: s,
        attributes: u,
        extra: f,
        user: p,
        contexts: h,
        level: g,
        fingerprint: y = [],
        propagationContext: v,
        conversationId: E,
      } = l || {};
    return (
      (this._tags = { ...this._tags, ...s }),
      (this._attributes = { ...this._attributes, ...u }),
      (this._extra = { ...this._extra, ...f }),
      (this._contexts = { ...this._contexts, ...h }),
      p && Object.keys(p).length && (this._user = p),
      g && (this._level = g),
      y.length && (this._fingerprint = y),
      v && (this._propagationContext = v),
      E && (this._conversationId = E),
      this
    );
  }
  clear() {
    return (
      (this._breadcrumbs = []),
      (this._tags = {}),
      (this._attributes = {}),
      (this._extra = {}),
      (this._user = {}),
      (this._contexts = {}),
      (this._level = void 0),
      (this._transactionName = void 0),
      (this._fingerprint = void 0),
      (this._session = void 0),
      (this._conversationId = void 0),
      iv(this, void 0),
      (this._attachments = []),
      this.setPropagationContext({ traceId: rv(), sampleRand: Jd() }),
      this._notifyScopeListeners(),
      this
    );
  }
  addBreadcrumb(a, r) {
    var u;
    const l = typeof r == "number" ? r : tx;
    if (l <= 0) return this;
    const s = {
      timestamp: kp(),
      ...a,
      message: a.message ? YO(a.message, 2048) : a.message,
    };
    return (
      this._breadcrumbs.push(s),
      this._breadcrumbs.length > l &&
        ((this._breadcrumbs = this._breadcrumbs.slice(-l)),
        (u = this._client) == null ||
          u.recordDroppedEvent("buffer_overflow", "log_item")),
      this._notifyScopeListeners(),
      this
    );
  }
  getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1];
  }
  clearBreadcrumbs() {
    return ((this._breadcrumbs = []), this._notifyScopeListeners(), this);
  }
  addAttachment(a) {
    return (this._attachments.push(a), this);
  }
  clearAttachments() {
    return ((this._attachments = []), this);
  }
  getScopeData() {
    return {
      breadcrumbs: this._breadcrumbs,
      attachments: this._attachments,
      contexts: this._contexts,
      tags: this._tags,
      attributes: this._attributes,
      extra: this._extra,
      user: this._user,
      level: this._level,
      fingerprint: this._fingerprint || [],
      eventProcessors: this._eventProcessors,
      propagationContext: this._propagationContext,
      sdkProcessingMetadata: this._sdkProcessingMetadata,
      transactionName: this._transactionName,
      span: lv(this),
      conversationId: this._conversationId,
    };
  }
  setSDKProcessingMetadata(a) {
    return (
      (this._sdkProcessingMetadata = u0(this._sdkProcessingMetadata, a, 2)),
      this
    );
  }
  setPropagationContext(a) {
    return ((this._propagationContext = a), this);
  }
  getPropagationContext() {
    return this._propagationContext;
  }
  captureException(a, r) {
    const l = (r == null ? void 0 : r.event_id) || go();
    if (!this._client)
      return (
        qi &&
          ru.warn(
            "No client configured on scope - will not capture exception!",
          ),
        l
      );
    const s = new Error("Sentry syntheticException");
    return (
      this._client.captureException(
        a,
        { originalException: a, syntheticException: s, ...r, event_id: l },
        this,
      ),
      l
    );
  }
  captureMessage(a, r, l) {
    const s = (l == null ? void 0 : l.event_id) || go();
    if (!this._client)
      return (
        qi &&
          ru.warn("No client configured on scope - will not capture message!"),
        s
      );
    const u = (l == null ? void 0 : l.syntheticException) ?? new Error(a);
    return (
      this._client.captureMessage(
        a,
        r,
        { originalException: a, syntheticException: u, ...l, event_id: s },
        this,
      ),
      s
    );
  }
  captureEvent(a, r) {
    const l = a.event_id || (r == null ? void 0 : r.event_id) || go();
    return this._client
      ? (this._client.captureEvent(a, { ...r, event_id: l }, this), l)
      : (qi &&
          ru.warn("No client configured on scope - will not capture event!"),
        l);
  }
  _notifyScopeListeners() {
    this._notifyingListeners ||
      ((this._notifyingListeners = !0),
      this._scopeListeners.forEach((a) => {
        a(this);
      }),
      (this._notifyingListeners = !1));
  }
}
function nx() {
  return Tp("defaultCurrentScope", () => new gr());
}
function ax() {
  return Tp("defaultIsolationScope", () => new gr());
}
const ov = (t) => t instanceof Promise && !t[c0],
  c0 = Symbol("chained PromiseLike"),
  rx = (t, a, r) => {
    const l = t.then(
      (s) => (a(s), s),
      (s) => {
        throw (r(s), s);
      },
    );
    return ov(l) && ov(t) ? l : ix(t, l);
  },
  ix = (t, a) => {
    if (!a) return t;
    let r = !1;
    for (const l in t) {
      if (l in a) continue;
      r = !0;
      const s = t[l];
      typeof s == "function"
        ? Object.defineProperty(a, l, {
            value: (...u) => s.apply(t, u),
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (a[l] = s);
    }
    return (r && Object.assign(a, { [c0]: !0 }), a);
  };
class lx {
  constructor(a, r) {
    let l;
    a ? (l = a) : (l = new gr());
    let s;
    (r ? (s = r) : (s = new gr()),
      (this._stack = [{ scope: l }]),
      (this._isolationScope = s));
  }
  withScope(a) {
    const r = this._pushScope();
    let l;
    try {
      l = a(r);
    } catch (s) {
      throw (this._popScope(), s);
    }
    return GO(l)
      ? rx(
          l,
          () => this._popScope(),
          () => this._popScope(),
        )
      : (this._popScope(), l);
  }
  getClient() {
    return this.getStackTop().client;
  }
  getScope() {
    return this.getStackTop().scope;
  }
  getIsolationScope() {
    return this._isolationScope;
  }
  getStackTop() {
    return this._stack[this._stack.length - 1];
  }
  _pushScope() {
    const a = this.getScope().clone();
    return (this._stack.push({ client: this.getClient(), scope: a }), a);
  }
  _popScope() {
    return this._stack.length <= 1 ? !1 : !!this._stack.pop();
  }
}
function Xi() {
  const t = xp(),
    a = Cp(t);
  return (a.stack = a.stack || new lx(nx(), ax()));
}
function ox(t) {
  return Xi().withScope(t);
}
function sx(t, a) {
  const r = Xi();
  return r.withScope(() => ((r.getStackTop().scope = t), a(t)));
}
function sv(t) {
  return Xi().withScope(() => t(Xi().getIsolationScope()));
}
function ux() {
  return {
    withIsolationScope: sv,
    withScope: ox,
    withSetScope: sx,
    withSetIsolationScope: (t, a) => sv(a),
    getCurrentScope: () => Xi().getScope(),
    getIsolationScope: () => Xi().getIsolationScope(),
  };
}
function f0(t) {
  const a = Cp(t);
  return a.acs ? a.acs : ux();
}
function Dp() {
  const t = xp();
  return f0(t).getCurrentScope();
}
function cx() {
  const t = xp();
  return f0(t).getIsolationScope();
}
function fx() {
  return Dp().getClient();
}
function dx(t) {
  if (t)
    return px(t) ? { captureContext: t } : gx(t) ? { captureContext: t } : t;
}
function px(t) {
  return t instanceof gr || typeof t == "function";
}
const hx = [
  "user",
  "level",
  "extra",
  "contexts",
  "tags",
  "fingerprint",
  "propagationContext",
];
function gx(t) {
  return Object.keys(t).some((a) => hx.includes(a));
}
function yx(t, a) {
  return Dp().captureException(t, dx(a));
}
function mx(t, a) {
  const r = typeof a == "string" ? a : void 0,
    l = typeof a != "string" ? { captureContext: a } : void 0;
  return Dp().captureMessage(t, r, l);
}
const vx = 100;
function bx(t, a) {
  const r = fx(),
    l = cx();
  if (!r) return;
  const { beforeBreadcrumb: s = null, maxBreadcrumbs: u = vx } = r.getOptions();
  if (u <= 0) return;
  const p = { timestamp: kp(), ...t },
    h = s ? l0(() => s(p, a)) : p;
  h !== null &&
    (r.emit && r.emit("beforeAddBreadcrumb", h, a), l.addBreadcrumb(h, u));
}
const Sx = !0;
function Xs(t, a) {
  const { message: r, data: l, context: s } = a;
  if (t === "debug" && Sx) return;
  const u = `[${t.toUpperCase()}]`;
  (t === "debug"
    ? console.debug(u, r, l ?? "", s ?? "")
    : t === "info"
      ? console.info(u, r, l ?? "", s ?? "")
      : t === "warn"
        ? console.warn(u, r, l ?? "", s ?? "")
        : console.error(u, r, l ?? "", s ?? ""),
    t === "error"
      ? l instanceof Error
        ? yx(l, { extra: { message: r, ...s } })
        : mx(r, { level: "error", extra: { data: l, ...s } })
      : bx({
          category: t,
          message: r,
          level: t === "warn" ? "warning" : "info",
          data: { ...s, data: l },
        }));
}
const Ks = {
  debug(t, a, r) {
    Xs("debug", { message: t, data: a, context: r });
  },
  info(t, a, r) {
    Xs("info", { message: t, data: a, context: r });
  },
  warn(t, a, r) {
    Xs("warn", { message: t, data: a, context: r });
  },
  error(t, a, r) {
    Xs("error", { message: t, data: a, context: r });
  },
};
function qt(t) {
  return {
    debug: (a, r) => Ks.debug(`[${t}] ${a}`, r),
    info: (a, r) => Ks.info(`[${t}] ${a}`, r),
    warn: (a, r) => Ks.warn(`[${t}] ${a}`, r),
    error: (a, r) => Ks.error(`[${t}] ${a}`, r),
  };
}
var Zt = ((t) => (
  (t.UniformSwing = "uniform-swing"),
  (t.VoteAllocation = "vote-allocation"),
  (t.TurnoutChange = "turnout-change"),
  (t.DistrictVoteTransfer = "district-vote-transfer"),
  t
))(Zt || {});
const Ex = [
  {
    id: "median",
    label: "Medián",
    description:
      "A Medián egy magyarországi közvélemény-kutató intézet, amely rendszeresen készít politikai és társadalmi témájú felméréseket, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: { min: 1, max: 5 },
    bias: [{ type: "result", partyBias: { mi_hazank: -1 } }],
  },
  {
    id: "zavecz",
    label: "Závecz Research",
    description:
      "A Závecz Research egy magyarországi közvélemény-kutató intézet, amely politikai és társadalmi témájú felméréseket készít, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: { min: 1.5, max: 5.5 },
    bias: [
      { type: "result", partyBias: { fidesz: -5, ellenzeki_osszefogas: 5 } },
    ],
  },
  {
    id: "publicus",
    label: "Publicus Intézet",
    description:
      "A Publicus Intézet egy magyarországi közvélemény-kutató intézet, amely politikai és társadalmi témájú felméréseket készít, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: { min: 2, max: 6 },
    bias: [
      { type: "result", partyBias: { fidesz: -10, ellenzeki_osszefogas: 5 } },
    ],
  },
  {
    id: "nezopont",
    label: "Nézőpont Intézet",
    description:
      "A Nézőpont Intézet egy magyarországi közvélemény-kutató intézet, amely politikai és társadalmi témájú felméréseket készít, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: { min: 1.5, max: 5.5 },
    bias: [
      { type: "result", partyBias: { fidesz: 5, ellenzeki_osszefogas: -5 } },
    ],
  },
  {
    id: "alapjogokert",
    label: "Alapjogokért Központ",
    description:
      "Az Alapjogokért Központ egy magyarországi közvélemény-kutató intézet, amely politikai és társadalmi témájú felméréseket készít, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: { min: 2, max: 6 },
    bias: [
      { type: "result", partyBias: { fidesz: 10, ellenzeki_osszefogas: -10 } },
    ],
  },
];
var _x = Object.getOwnPropertyDescriptor,
  wx = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? _x(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  };
const zi = qt("PollsterEngine"),
  Ox = "aggregate";
let yu = class {
  constructor(t) {
    Ft(this, "pollsters", []);
    ((this.mandateCalculator = t), zi.debug("pollsterEngine initialized"));
  }
  configure(t) {
    const a = new Map(Ex.map((r) => [r.id, r]));
    if (t) {
      zi.debug("configuring PollsterEngine with custom pollsters", {
        customPollsters: t,
      });
      for (const r of t) r.exclude ? a.delete(r.id) : a.set(r.id, r);
    }
    this.pollsters = [...a.values()];
  }
  getPollsters() {
    return this.pollsters;
  }
  getPolls(t, a) {
    const r = this.mandateCalculator.calculate(
        t.candidateListData,
        t.partyListData,
        a,
      ),
      l = r == null ? void 0 : r.percentages;
    if (!l) {
      zi.error("cannot get polls, missing actual results percentages");
      return;
    }
    const s = Object.keys(l.candidateListResults).filter((f) => f !== "_total"),
      u = {};
    for (const f of s) {
      const p = this.pollsters.map((h) => {
        const g = this.normalizeResults(
          this.applyMarginErrors(l.candidateListResults, h),
        );
        return (
          ((g == null ? void 0 : g[f]) ?? 0) - (l.candidateListResults[f] ?? 0)
        );
      });
      u[f] = (p.reduce((h, g) => h + g, 0) / p.length) * 100;
    }
    return (
      zi.info("PollsterEngine provided poll results", { differences: u }),
      u
    );
  }
  getPollsByPollsterId(t, a, r) {
    if (t === Ox) {
      const h = this.getPolls(a, r);
      return h ? { id: t, differences: h } : void 0;
    }
    const l = this.mandateCalculator.calculate(
        a.candidateListData,
        a.partyListData,
        r,
      ),
      s = this.pollsters.find((h) => h.id === t);
    if (!s) {
      zi.error("pollster not found for id", { pollsterId: t });
      return;
    }
    const u = l == null ? void 0 : l.percentages;
    if (!u) {
      zi.error("cannot get polls, missing actual results percentages");
      return;
    }
    const f = this.normalizeResults(
        this.applyMarginErrors(u.candidateListResults, s),
      ),
      p = {};
    for (const h in f)
      h !== "_total" &&
        (p[h] = (f[h] - (u.candidateListResults[h] ?? 0)) * 100);
    return { id: t, differences: p };
  }
  normalizeResults(t) {
    if (!t) return;
    const a = { ...t },
      r = Object.values(a).reduce((l, s) => l + s, 0);
    if (r > 0) for (const l in a) a[l] /= r;
    return (
      (a._total = Object.entries(a)
        .filter(([l]) => l !== "_total")
        .reduce((l, [, s]) => l + s, 0)),
      a
    );
  }
  getBiasResults(t) {
    var a, r;
    return (
      ((r =
        (a = t.bias) == null ? void 0 : a.find((l) => l.type === "result")) ==
      null
        ? void 0
        : r.partyBias) ?? {}
    );
  }
  applyMarginErrors(t, a) {
    var u, f;
    const r = this.getBiasResults(a);
    if (!a.errorMargin) return;
    const l =
        this.getRandomMargin(
          -((u = a.errorMargin) == null ? void 0 : u.max),
          (f = a.errorMargin) == null ? void 0 : f.max,
        ) / 100,
      s = {};
    for (const p in t) {
      if (p === "_total") continue;
      const h = t[p],
        g = (r[p] ?? 0) / 100,
        y =
          this.getRandomMargin(-a.errorMargin.max / 4, a.errorMargin.max / 4) /
          100;
      let v = h;
      ((v += g), (v *= 1 + l), (v *= 1 + y), (s[p] = Math.max(0, v)));
    }
    return s;
  }
  getRandomMargin(t, a) {
    return Math.random() * (a - t) + t;
  }
};
yu = wx([Co()], yu);
const xx = [
  {
    id: "nyugati_megyek",
    label: "Nyugati megyék",
    districts: [
      { megyekod: 20, oevk: 1 },
      { megyekod: 20, oevk: 2 },
      { megyekod: 20, oevk: 3 },
      { megyekod: 18, oevk: 1 },
      { megyekod: 18, oevk: 2 },
      { megyekod: 18, oevk: 3 },
      { megyekod: 8, oevk: 1 },
      { megyekod: 8, oevk: 2 },
      { megyekod: 8, oevk: 3 },
      { megyekod: 8, oevk: 4 },
      { megyekod: 8, oevk: 5 },
    ],
  },
  {
    id: "keleti_megyek",
    label: "Keleti megyék",
    districts: [
      { megyekod: 9, oevk: 1 },
      { megyekod: 9, oevk: 2 },
      { megyekod: 9, oevk: 3 },
      { megyekod: 9, oevk: 4 },
      { megyekod: 9, oevk: 5 },
      { megyekod: 9, oevk: 6 },
      { megyekod: 16, oevk: 1 },
      { megyekod: 16, oevk: 2 },
      { megyekod: 16, oevk: 3 },
      { megyekod: 16, oevk: 4 },
      { megyekod: 16, oevk: 5 },
      { megyekod: 16, oevk: 6 },
      { megyekod: 4, oevk: 1 },
      { megyekod: 4, oevk: 2 },
      { megyekod: 4, oevk: 3 },
      { megyekod: 4, oevk: 4 },
    ],
  },
  {
    id: "eszaki_megyek",
    label: "Északi megyék",
    districts: [
      { megyekod: 5, oevk: 1 },
      { megyekod: 5, oevk: 2 },
      { megyekod: 5, oevk: 3 },
      { megyekod: 5, oevk: 4 },
      { megyekod: 5, oevk: 5 },
      { megyekod: 5, oevk: 6 },
      { megyekod: 5, oevk: 7 },
      { megyekod: 10, oevk: 1 },
      { megyekod: 10, oevk: 2 },
      { megyekod: 10, oevk: 3 },
      { megyekod: 13, oevk: 1 },
      { megyekod: 13, oevk: 2 },
    ],
  },
  {
    id: "deli_megyek",
    label: "Déli megyék",
    districts: [
      { megyekod: 2, oevk: 1 },
      { megyekod: 2, oevk: 2 },
      { megyekod: 2, oevk: 3 },
      { megyekod: 2, oevk: 4 },
      { megyekod: 15, oevk: 1 },
      { megyekod: 15, oevk: 2 },
      { megyekod: 15, oevk: 3 },
      { megyekod: 15, oevk: 4 },
      { megyekod: 17, oevk: 1 },
      { megyekod: 17, oevk: 2 },
      { megyekod: 17, oevk: 3 },
    ],
  },
  {
    id: "billego_korzetek",
    label: "Billegő körzetek",
    districts: [
      { megyekod: 14, oevk: 2 },
      { megyekod: 14, oevk: 4 },
      { megyekod: 14, oevk: 6 },
      { megyekod: 14, oevk: 10 },
      { megyekod: 14, oevk: 11 },
      { megyekod: 14, oevk: 12 },
      { megyekod: 2, oevk: 1 },
      { megyekod: 2, oevk: 2 },
      { megyekod: 6, oevk: 1 },
      { megyekod: 5, oevk: 1 },
      { megyekod: 5, oevk: 2 },
      { megyekod: 10, oevk: 1 },
      { megyekod: 10, oevk: 2 },
      { megyekod: 18, oevk: 1 },
      { megyekod: 18, oevk: 1 },
      { megyekod: 12, oevk: 2 },
      { megyekod: 7, oevk: 1 },
    ],
  },
  {
    id: "nagyvarosok",
    label: "Nagyvárosok",
    districts: [
      { megyekod: 1, oevk: 1 },
      { megyekod: 1, oevk: 2 },
      { megyekod: 1, oevk: 3 },
      { megyekod: 1, oevk: 4 },
      { megyekod: 1, oevk: 5 },
      { megyekod: 1, oevk: 6 },
      { megyekod: 1, oevk: 7 },
      { megyekod: 1, oevk: 8 },
      { megyekod: 1, oevk: 9 },
      { megyekod: 1, oevk: 10 },
      { megyekod: 1, oevk: 11 },
      { megyekod: 1, oevk: 12 },
      { megyekod: 1, oevk: 13 },
      { megyekod: 1, oevk: 14 },
      { megyekod: 1, oevk: 15 },
      { megyekod: 1, oevk: 16 },
      { megyekod: 1, oevk: 17 },
      { megyekod: 1, oevk: 18 },
      { megyekod: 6, oevk: 1 },
      { megyekod: 2, oevk: 1 },
      { megyekod: 8, oevk: 1 },
      { megyekod: 9, oevk: 1 },
      { megyekod: 5, oevk: 1 },
    ],
  },
  {
    id: "vegyes_oevk",
    label: "Vegyes jellegű OEVK-k",
    districts: [
      { megyekod: 7, oevk: 1 },
      { megyekod: 12, oevk: 1 },
      { megyekod: 9, oevk: 3 },
      { megyekod: 9, oevk: 4 },
      { megyekod: 9, oevk: 5 },
      { megyekod: 9, oevk: 6 },
      { megyekod: 5, oevk: 2 },
      { megyekod: 5, oevk: 3 },
      { megyekod: 5, oevk: 4 },
      { megyekod: 5, oevk: 6 },
      { megyekod: 5, oevk: 7 },
      { megyekod: 14, oevk: 1 },
      { megyekod: 14, oevk: 2 },
      { megyekod: 14, oevk: 3 },
      { megyekod: 14, oevk: 4 },
      { megyekod: 14, oevk: 5 },
      { megyekod: 14, oevk: 6 },
      { megyekod: 14, oevk: 7 },
      { megyekod: 14, oevk: 8 },
      { megyekod: 14, oevk: 9 },
      { megyekod: 14, oevk: 10 },
      { megyekod: 14, oevk: 11 },
      { megyekod: 14, oevk: 12 },
    ],
  },
  {
    id: "kis_telepulesek",
    label: "Kis települések",
    districts: [
      { megyekod: 13, oevk: 1 },
      { megyekod: 13, oevk: 2 },
      { megyekod: 17, oevk: 1 },
      { megyekod: 17, oevk: 2 },
      { megyekod: 17, oevk: 3 },
      { megyekod: 15, oevk: 2 },
      { megyekod: 15, oevk: 3 },
      { megyekod: 15, oevk: 4 },
      { megyekod: 16, oevk: 2 },
      { megyekod: 16, oevk: 3 },
      { megyekod: 16, oevk: 4 },
      { megyekod: 16, oevk: 5 },
      { megyekod: 16, oevk: 6 },
    ],
  },
  { id: "osszes_oevk", label: "Összes OEVK", districts: [] },
];
var Cx = Object.getOwnPropertyDescriptor,
  Tx = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? Cx(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  };
const uv = qt("DistrictGroupEngine");
let mu = class {
  constructor() {
    Ft(this, "districtGroups", []);
    Ft(this, "candidateListData", []);
    uv.debug("DistrictGroupEngine initialized");
  }
  configure(t, a) {
    const r = [...xx];
    (a &&
      (uv.debug("Configuring DistrictGroupEngine with custom district groups", {
        customGroups: a,
      }),
      (this.districtGroups = [...r, ...a])),
      (this.districtGroups = r),
      (this.candidateListData = t));
  }
  getDistrictTargetByGroupIds(t) {
    return t.map((a) => this.getDistrictsByGroupId(a));
  }
  getDistrictsByGroupId(t) {
    return t === "osszes_oevk"
      ? {
          ...(this.districtGroups.find((r) => r.id === t) ??
            this.districtGroups[0]),
          districts: this.candidateListData.map((r) => ({
            megyekod: r.megyekod,
            oevk: r.oevk,
          })),
        }
      : (this.districtGroups.find((a) => a.id === t) ?? this.districtGroups[0]);
  }
};
mu = Tx([Co()], mu);
var Ax = Object.getOwnPropertyDescriptor,
  Rx = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? Ax(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  };
const Fr = qt("EffectApplier");
let vu = class {
  constructor(t, a) {
    Ft(this, "DEFAULT_MOTIVATION_DELTA", 99);
    ((this.mandateCalculator = t),
      (this.districtGroupEngine = a),
      Fr.debug("EffectApplier initialized"));
  }
  getAppliedEffects(t, a, r, l, s, u, f, p) {
    const h = this.resolveConditionalEffects(t, l, p),
      g = [];
    h.forEach((v) => {
      switch (v.type) {
        case Zt.UniformSwing:
          g.push(this.getPartySwingShares(v.params, a));
          break;
        case Zt.VoteAllocation:
          g.push(this.getPartyShare(v.params));
          break;
        case Zt.DistrictVoteTransfer:
          g.push(this.getDistrictChange(v.params));
          break;
        case Zt.TurnoutChange:
          g.push(this.getMotivationChange(v.params));
          break;
        default:
          return this.handleEffectError(v);
      }
    });
    const y = r % 2 === 0;
    if (u && s && y) {
      const v = this.getBoosterEffect(s, f);
      if (v) return (Fr.info("Add boosterEffect to district ", s), [...g, v]);
    }
    return g;
  }
  getBoosterEffect(t, a) {
    if (!a) return null;
    const r = {
      megyekod: t.megyekod,
      oevk: t.oevk,
      amount: 500,
      from: { type: "bizonytalan" },
      targetParty: a,
    };
    return { type: Zt.DistrictVoteTransfer, target: [r] };
  }
  resolveConditionalEffects(t, a, r) {
    if (!(a != null && a.length) || !r) return t;
    let l = [...t];
    if (!(r != null && r.length))
      return (
        Fr.error("history is empty, but conditional effects are present"),
        l
      );
    for (const s of a) {
      if (
        !s.if.every((f) => {
          const p =
            r == null ? void 0 : r.find((h) => h.questionId === f.questionId);
          return (p == null ? void 0 : p.answerId) === f.answerId;
        })
      ) {
        Fr.info(`Condition not met for effects: ${JSON.stringify(s)}`);
        continue;
      }
      s.mode === "replace" ? (l = [...s.effects]) : l.push(...s.effects);
    }
    return l;
  }
  getPartySwingShares(t, a) {
    const r = this.getBaseShare(a, t),
      l = this.getTargetShare(r, t);
    return { type: Zt.UniformSwing, baseShare: r, targetShare: l };
  }
  getBaseShare(t, a) {
    const r = this.mandateCalculator.sumPartyTotals(t),
      l = this.toPercentages(this.mandateCalculator.calculatePercentages(r));
    return this.filterOutParties(a, l);
  }
  filterOutParties(t, a) {
    return Object.fromEntries(
      Object.entries(a).filter(([r]) => t[r] !== void 0),
    );
  }
  toPercentages(t) {
    return Object.fromEntries(Object.entries(t).map(([a, r]) => [a, r * 100]));
  }
  getTargetShare(t, a) {
    const r = { ...t },
      l = Object.entries(a)
        .filter(([s]) => t[s] !== void 0)
        .map(([s, u]) => ({ party: s, delta: u }));
    for (const { party: s, delta: u } of l) {
      const f = t[s] + u;
      (f < 0 && Fr.error(`PartySwing pushed ${s} below 0`), (r[s] = f));
    }
    return r;
  }
  getPartyShare(t) {
    const a = t.newVotes,
      r = t.share;
    return { type: Zt.VoteAllocation, newVotes: a, share: r };
  }
  getDistrictChange(t) {
    if (!this.isDistrictTargetGroup(t))
      return { type: Zt.DistrictVoteTransfer, target: t };
    const a = t.flatMap((r) =>
      this.districtGroupEngine
        .getDistrictTargetByGroupIds([r.groupId])
        .flatMap((l) =>
          l.districts.map((s) => ({
            megyekod: s.megyekod,
            oevk: s.oevk,
            amount: r.amount,
            targetParty: r.targetParty,
            from: r.from,
          })),
        ),
    );
    return { type: Zt.DistrictVoteTransfer, target: a };
  }
  isDistrictTargetGroup(t) {
    return t.length > 0 && "groupId" in t[0];
  }
  getMotivationChange(t) {
    const a = this.getMotivationDelta(t);
    return { type: Zt.TurnoutChange, motivationDelta: a };
  }
  getMotivationDelta(t) {
    const a = { ...t };
    for (const [r, l] of Object.entries(a))
      l !== void 0 &&
        ((a[r] = this.DEFAULT_MOTIVATION_DELTA + l),
        a[r] > 100 &&
          (Fr.warn(`delta number for ${r} cannot be bigger then 100`),
          (a[r] = 100)));
    return a;
  }
  handleEffectError(t) {
    return (
      Fr.error(
        `Provided effect type for answer to question is not a valid effect: ${t.type}`,
      ),
      null
    );
  }
};
vu = Rx([Co()], vu);
const kx = qt("ResultModifierUtils");
function Dx(t) {
  const a = Object.entries(t).filter(([s]) => s !== "_total"),
    r = a
      .map(([, s]) => s)
      .filter((s) => !Number.isNaN(s))
      .reduce((s, u) => s + u, 0),
    l = { _total: 0 };
  if (!r) return ((l._total = 0), l);
  for (const [s, u] of a) l[s] = u / r;
  return (
    (l._total = Object.values(l)
      .filter((s) => typeof s == "number")
      .reduce((s, u) => s + u, 0)),
    (Math.round(l._total) > 1 || l._total < 0) &&
      kx.error("Invalid total percentage", { total: l._total, percentages: l }),
    l
  );
}
var Lx = Object.getOwnPropertyDescriptor,
  Nx = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? Lx(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  };
const cv = qt("MandateCalculator");
let bu = class {
  constructor() {
    cv.debug("MandateCalculator initialized");
  }
  calculate(t, a, r, l) {
    if (!t || !r) {
      cv.error("Missing input data for mandate calculation");
      return;
    }
    const s = this.merge(t, a),
      u = this.calculateSeats(s),
      f = this.calculateCompensation(s),
      p = {};
    for (const O of s)
      for (const [k, L] of Object.entries(O.listVotes)) p[k] = (p[k] ?? 0) + L;
    let h = p;
    l && Object.keys(l).length > 0 && (h = l);
    const g = this.allocateListSeats(h, f.total, r),
      y = new Set([...Object.keys(u), ...Object.keys(g ?? {})]),
      v = [];
    for (const O of y) {
      const k = u[O] ?? 0,
        L = (g == null ? void 0 : g[O]) ?? 0;
      v.push({
        party: O,
        constituencySeats: k,
        listSeats: L,
        totalSeats: k + L,
      });
    }
    const E = this.sumPartyTotals(t),
      w = this.calculatePercentages(E),
      S = this.sumPartyListTotals(h),
      b = this.calculatePercentages(S);
    return {
      totals: { candidateListResults: E, partyListResults: S },
      mandates: v,
      constituencySeats: u,
      listSeats: g ?? {},
      compensation: f,
      percentages: { candidateListResults: w, partyListResults: b },
    };
  }
  sumPartyListTotals(t) {
    const a = Object.entries(t)
      .filter(([r]) => r !== "_total")
      .reduce((r, [, l]) => r + l, 0);
    return { ...t, _total: a };
  }
  sumPartyTotals(t) {
    const a = { _total: 0 };
    for (const r of t)
      for (const [l, s] of Object.entries(r.partok ?? {}))
        !l ||
          l === "undefined" ||
          (Number.isFinite(s) &&
            ((a[l] = (a[l] ?? 0) + (s ?? 0)), (a._total += s ?? 0)));
    return a;
  }
  calculatePercentages(t) {
    return Dx(t);
  }
  merge(t, a) {
    const r = new Map();
    for (const l of t) {
      const s = `${l.megyekod}-${l.oevk}`;
      r.set(s, {
        megyekod: l.megyekod,
        megye: l.megye,
        oevk: l.oevk,
        constituencyVotes: this.cleanVotes(l.partok),
        listVotes: {},
        candidates: this.cleanCandidates(l.jeloltek),
      });
    }
    if (a)
      for (const l of a) {
        const s = `${l.megyekod}-${l.oevk}`,
          u = r.get(s);
        u && (u.listVotes = this.cleanVotes(l.partok));
      }
    return [...r.values()];
  }
  cleanVotes(t) {
    const a = {};
    for (const [r, l] of Object.entries(t))
      typeof l == "number" && l > 0 && (a[r] = l);
    return a;
  }
  cleanCandidates(t) {
    const a = {};
    if (!t) return a;
    for (const [r, l] of Object.entries(t))
      Array.isArray(l) && l.length > 0 && (a[r] = l);
    return a;
  }
  calculateSeats(t) {
    const a = {};
    for (const r of t) {
      const l = Object.entries(r.constituencyVotes);
      if (!l.length) continue;
      const [s] = l.sort((u, f) => f[1] - u[1]);
      a[s[0]] = (a[s[0]] ?? 0) + 1;
    }
    return a;
  }
  calculateCompensation(t) {
    var s;
    const a = {},
      r = {};
    for (const u of t) {
      const f = Object.entries(u.constituencyVotes).sort((v, E) => E[1] - v[1]);
      if (f.length === 0) continue;
      const [p, h] = f[0],
        g = ((s = f[1]) == null ? void 0 : s[1]) ?? 0;
      for (let v = 1; v < f.length; v++) {
        const [E, w] = f[v];
        a[E] = (a[E] ?? 0) + w;
      }
      const y = h - (g + 1);
      y > 0 && (r[p] = (r[p] ?? 0) + y);
    }
    const l = {};
    for (const u of new Set([...Object.keys(a), ...Object.keys(r)]))
      l[u] = (a[u] ?? 0) + (r[u] ?? 0);
    return { losingVotes: a, winnerCompensation: r, total: l };
  }
  allocateListSeats(t, a, r) {
    const l = Object.values(t).reduce((h, g) => h + g, 0),
      s = Object.entries(t)
        .filter(([, h]) => (h / l) * 100 >= r.thresholdPercent)
        .map(([h]) => h),
      u = {};
    for (const h of s) u[h] = (t[h] ?? 0) + (a[h] ?? 0);
    const f = [];
    for (const [h, g] of Object.entries(u))
      for (let y = 1; y <= r.listSeats; y++) f.push({ party: h, value: g / y });
    f.sort((h, g) => g.value - h.value);
    const p = {};
    for (let h = 0; h < r.listSeats; h++) {
      const g = f[h];
      if (!g) break;
      p[g.party] = (p[g.party] ?? 0) + 1;
    }
    return p;
  }
};
bu = Nx([Co()], bu);
var Mx = Object.getOwnPropertyDescriptor,
  jx = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? Mx(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  };
const gd = qt("VoterEnvironment");
let Ki = class {
  constructor() {
    Ft(this, "voters", 0);
    Ft(this, "voterBases", []);
    Ft(this, "maxAvailableVoters", 0);
    gd.debug("VoterEnvironment initialized");
  }
  configure(t) {
    if (!t) {
      gd.debug("Clearing VoterEnvironment config");
      return;
    }
    (gd.debug("Configuring VoterEnvironment with config", { config: t }),
      (this.voters = this.getVoters(t.listData)),
      (this.maxAvailableVoters =
        this.calculateMaxAvailableVoters(t.eligibleVoters, t.maxTurnout) ?? 0),
      this.setVoterBase(t.listData));
  }
  getAvailableVoters() {
    return this.maxAvailableVoters - this.voters;
  }
  setVoters(t) {
    this.voters = this.getVoters(t);
  }
  getRemainingVotesInDistricts(t) {
    return t.reduce((a, r) => a + this.getRemainingVoteCount(r), 0);
  }
  getRemainingVoteCount(t) {
    var l;
    const a =
        t.valasztopolgar ??
        ((l = this.voterBases.find(
          (s) => s.id === `${t.megyekod}-${t.oevk}`,
        )) == null
          ? void 0
          : l.valasztopolgar) ??
        0,
      r = Object.values(t.partok).reduce((s, u) => (s ?? 0) + (u ?? 0), 0) ?? 0;
    return a - r;
  }
  setVoterBase(t) {
    this.voterBases = t.map((a) => ({
      id: `${a.megyekod}-${a.oevk}`,
      valasztopolgar: a.valasztopolgar ?? 0,
    }));
  }
  calculateMaxAvailableVoters(t, a) {
    return Math.floor((t * a) / 100);
  }
  getVoters(t) {
    return t.reduce((a, r) => {
      const l = Object.values(r.partok).reduce(
        (s, u) => (s ?? 0) + (u ?? 0),
        0,
      );
      return a + (l ?? 0);
    }, 0);
  }
};
Ki = jx([yr()], Ki);
var zx = Object.getOwnPropertyDescriptor,
  Bx = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? zx(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  },
  Ux = (t, a) => (r, l) => a(r, l, t);
const fv = qt("DistrictVoteTransformer");
let Eo = class {
  constructor(t) {
    this.voterEnvironment = t;
  }
  modifyDistricts(t, a, r, l) {
    const s = (y, v) => `${y}_${v}`,
      u = r ? new Map(r.map((y, v) => [s(y.megyekod, y.oevk), v])) : void 0,
      f = new Map(t.map((y, v) => [s(y.megyekod, y.oevk), v])),
      p = r ? [...r] : void 0,
      h = [...t];
    let g = l ? { ...l } : void 0;
    for (const y of a) {
      const v = s(y.megyekod, y.oevk),
        E = u == null ? void 0 : u.get(v),
        w = f.get(v);
      (r != null &&
        r.length &&
        p != null &&
        p.length &&
        (E === void 0
          ? fv.warn(
              `provided target ${JSON.stringify(y)}'s district was not found in the party data`,
            )
          : (p[E] = this.applyPartyTarget(
              p[E],
              w !== void 0 ? t[w] : void 0,
              y,
            ))),
        w !== void 0 && (h[w] = this.applyCandidateTarget(h[w], y)),
        g && (g = this.applyPartyListVotesTarget(g, y)));
    }
    return {
      newCandidateListData: h,
      newPartyListData: p,
      newPartyListVotes: g,
    };
  }
  modifyListDistricts(t, a) {
    return t.map((r) => ({ ...r, partok: { ...r.partok, ...a } }));
  }
  applyPartyTarget(t, a, r) {
    const l = r.from ?? { type: "bizonytalan" },
      s = { ...t.partok };
    let u = 0;
    l.type === "bizonytalan"
      ? (u = (a == null ? void 0 : a.valasztopolgar) ?? 0)
      : (u = s[l.party] ?? 0);
    const f = Math.max(0, Math.min(r.amount, u));
    return f === 0
      ? t
      : (l.type !== "bizonytalan" && (s[l.party] = (s[l.party] ?? 0) - f),
        (s[r.targetParty] = (s[r.targetParty] ?? 0) + f),
        { ...t, partok: s });
  }
  applyPartyListVotesTarget(t, a) {
    const r = a.from ?? { type: "bizonytalan" },
      l = { ...t };
    let s = 0;
    r.type === "bizonytalan" ? (s = a.amount) : (s = l[r.party] ?? 0);
    const u = Math.max(0, Math.min(a.amount, s));
    return u === 0
      ? t
      : (r.type !== "bizonytalan" && (l[r.party] = (l[r.party] ?? 0) - u),
        (l[a.targetParty] = (l[a.targetParty] ?? 0) + u),
        l);
  }
  applyCandidateTarget(t, a) {
    if (t.megyekod !== a.megyekod || t.oevk !== a.oevk)
      return (
        fv.warn(
          `provided target ${a}'s district was not found in the district data`,
        ),
        t
      );
    const r = a.from ?? { type: "bizonytalan" },
      l = { ...t.partok };
    let s = 0;
    r.type === "bizonytalan"
      ? (s = this.voterEnvironment.getRemainingVoteCount(t))
      : (s = l[r.party] ?? 0);
    const u = Math.max(0, Math.min(a.amount, s));
    return u === 0
      ? t
      : (r.type !== "bizonytalan" && (l[r.party] = (l[r.party] ?? 0) - u),
        (l[a.targetParty] = (l[a.targetParty] ?? 0) + u),
        { ...t, partok: l });
  }
};
Eo = Bx([yr(), Ux(0, Pi(Ki))], Eo);
const Fx = qt("NationalSwingTransform");
class Lp {
  applyUniformSwingToList(a, r, l, s) {
    return a.map((u) => {
      const f = this.getVoterCapacity(r, u),
        p = this.getAppliedSwing(l, s, u.partok, f);
      return { ...u, partok: { ...u.partok, ...p } };
    });
  }
  applyUniformSwingToDistricts(a, r, l) {
    return a.map((s) => {
      const u = this.getAppliedSwing(r, l, s.partok, s.valasztopolgar);
      return { ...s, partok: { ...s.partok, ...u } };
    });
  }
  applyUniformSwingToListVotes(a, r, l) {
    if (!l) return;
    const s = this.getDiff(a, r),
      u = this.sumVotes(l),
      f = {},
      p = new Set([...Object.keys(l), ...Object.keys(s)]);
    for (const h of p) {
      const y = (u > 0 ? ((l[h] ?? 0) / u) * 100 : 0) + (s[h] ?? 0);
      f[h] = Math.max(0, Math.round((y / 100) * u));
    }
    return f;
  }
  getAppliedSwing(a, r, l, s) {
    const u = this.getDiff(a, r),
      f = this.applyDiffToDistrict(l, u);
    return this.sumVotes(f) > s
      ? (Fx.error("swing exceeds capacity, change ignored"), l)
      : f;
  }
  getVoterCapacity(a, r) {
    var l;
    return (
      ((l = a.find((s) => s.megyekod === r.megyekod && s.oevk === r.oevk)) ==
      null
        ? void 0
        : l.valasztopolgar) ?? 0
    );
  }
  getDiff(a, r) {
    const l = {},
      s = new Set([...Object.keys(a), ...Object.keys(r)]);
    for (const u of s) {
      const f = a[u] ?? 0,
        p = r[u] ?? f;
      l[u] = p - f;
    }
    return l;
  }
  applyDiffToDistrict(a, r) {
    const l = { ...a },
      s = Object.values(a).reduce((u, f) => (u ?? 0) + (f ?? 0), 0);
    for (const u of Object.keys(r)) {
      const f = r[u];
      if (!f) continue;
      const p = Math.round((s ?? 0) * (f / 100)),
        g = (l[u] ?? 0) + p;
      l[u] = Math.max(0, g);
    }
    return l;
  }
  sumVotes(a) {
    let r = 0;
    for (const l of Object.values(a))
      typeof l == "number" && !Number.isNaN(l) && (r += l);
    return r;
  }
}
var Ix = Object.getOwnPropertyDescriptor,
  Hx = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? Ix(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  },
  $x = (t, a) => (r, l) => a(r, l, t);
let _o = class {
  constructor(t) {
    this.voterEnviroment = t;
  }
  distributeVotesByPartyShare(t, a, r, l, s = !0, u) {
    const f = this.voterEnviroment.getRemainingVotesInDistricts(t);
    if (r > f) return null;
    const p = this.distributeByCandidateList(t, r, l);
    let h = [...a];
    s && (h = this.distributeByPartyList(t, a, r, l));
    const g = this.distributeByPartyListVotes(u, r, l);
    return { candidateList: p, partyList: h, partyListVotes: g };
  }
  modifyByMotivation(t, a, r) {
    const l = t.map((u) => ({
        ...u,
        partok: Object.fromEntries(
          Object.entries(u.partok).map(([f, p]) => [
            f,
            this.applyMotivationTarget(p, f, r),
          ]),
        ),
      })),
      s = a.map((u) => ({
        ...u,
        partok: Object.fromEntries(
          Object.entries(u.partok).map(([f, p]) => [
            f,
            this.applyMotivationTarget(p, f, r),
          ]),
        ),
      }));
    return { newCandidateData: l, newPartyData: s };
  }
  distributeByPartyList(t, a, r, l) {
    let s = a.map((u) => ({ ...u, partok: { ...u.partok } }));
    for (const [u, f] of Object.entries(l)) {
      const p = Math.round(r * f);
      if (p === 0) continue;
      const h = this.getPartyWeights(s, u),
        g = this.distributeByWeights(h, p);
      s = this.applyPartyDistributionWithCapacityToList(s, t, u, g);
    }
    return s;
  }
  distributeByPartyListVotes(t, a, r) {
    if (!t) return;
    const l = { ...t };
    for (const [s, u] of Object.entries(r)) {
      const f = Math.round(a * u);
      f !== 0 && (l[s] = (l[s] ?? 0) + f);
    }
    return l;
  }
  distributeByCandidateList(t, a, r) {
    let l = t.map((s) => ({ ...s, partok: { ...s.partok } }));
    for (const [s, u] of Object.entries(r)) {
      const f = Math.round(a * u);
      if (f === 0) continue;
      const p = this.getPartyWeights(l, s),
        h = this.distributeByWeights(p, f);
      l = this.applyPartyDistributionWithCapacity(l, s, h);
    }
    return l;
  }
  applyMotivationTarget(t, a, r) {
    const l = r[a];
    if (l === void 0) return t;
    const s = Math.max(0, l / 100);
    return Math.round(t * s);
  }
  getPartyWeights(t, a) {
    return t.map((r) => r.partok[a] ?? 0);
  }
  distributeByWeights(t, a) {
    const r = t.reduce((p, h) => p + h, 0);
    if (!r || !a) return t.map(() => 0);
    const l = t.map((p) => (p / r) * a),
      s = l.map((p) => Math.floor(p)),
      u = a - s.reduce((p, h) => p + h, 0),
      f = l
        .map((p, h) => ({ i: h, frac: p - Math.floor(p) }))
        .sort((p, h) => h.frac - p.frac);
    for (let p = 0; p < u; p++) s[f[p].i]++;
    return s;
  }
  applyPartyDistributionWithCapacity(t, a, r) {
    return t.map((l, s) => {
      const u =
          Object.values(l.partok).reduce((h, g) => (h ?? 0) + (g ?? 0), 0) ?? 0,
        f = (l.valasztopolgar ?? 0) - u,
        p = Math.max(0, Math.min(r[s] ?? 0, f));
      return { ...l, partok: { ...l.partok, [a]: (l.partok[a] ?? 0) + p } };
    });
  }
  applyPartyDistributionWithCapacityToList(t, a, r, l) {
    return t.map((s, u) => {
      var y;
      const f =
          Object.values(s.partok).reduce((v, E) => (v ?? 0) + (E ?? 0), 0) ?? 0,
        h =
          (((y = this.getCapacity(a, s.megyekod, s.oevk)) == null
            ? void 0
            : y.valasztopolgar) ?? 0) - f,
        g = Math.max(0, Math.min(l[u] ?? 0, h));
      return { ...s, partok: { ...s.partok, [r]: (s.partok[r] ?? 0) + g } };
    });
  }
  getCapacity(t, a, r) {
    return t.find((l) => l.megyekod === r && l.oevk === a);
  }
};
_o = Hx([yr(), $x(0, Pi(Ki))], _o);
var Vx = Object.getOwnPropertyDescriptor,
  Gx = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? Vx(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  },
  yd = (t, a) => (r, l) => a(r, l, t);
const fr = qt("ResultModifier");
let Su = class {
  constructor(t, a, r) {
    ((this.unionSwingTransformer = t),
      (this.voterShareTransformer = a),
      (this.districtVoteTransformer = r),
      fr.debug("ResultModifier initialized"));
  }
  apply(t, a, r) {
    if (!(a != null && a.length))
      return (fr.error("No applied effects provided to ResultModifier"), null);
    let l = t;
    for (const s of a) {
      const u = this.applySingleEffect(l, s, r);
      u && (l = { ...l, ...u });
    }
    return {
      candidateListData: l.candidateListData,
      partyListData: l.partyListData,
      partyListVotes: l.partyListVotes,
    };
  }
  filterUnwantedValues(t) {
    if (t)
      return t.map((a) => ({
        ...a,
        partok: Object.fromEntries(
          Object.entries(a.partok).filter(
            ([r, l]) =>
              r !== "undefined" &&
              l !== void 0 &&
              l !== null &&
              !Number.isNaN(l),
          ),
        ),
      }));
  }
  applySingleEffect(t, a, r) {
    switch (a.type) {
      case Zt.UniformSwing:
        return this.applyPartySwing(t, a, r);
      case Zt.VoteAllocation:
        return this.applyShares(t, a);
      case Zt.DistrictVoteTransfer:
        return this.applyDistrict(t, a);
      case Zt.TurnoutChange:
        return this.applyMotivation(t, a);
      default:
        return (
          fr.error("Unknown effect type in ResultModifier", { effect: a }),
          null
        );
    }
  }
  applyPartySwing(t, a, r) {
    r || fr.info("Applying uniform swing", { appliedEffects: a });
    const l = this.unionSwingTransformer.applyUniformSwingToDistricts(
        t.candidateListData ?? [],
        a == null ? void 0 : a.baseShare,
        a == null ? void 0 : a.targetShare,
      ),
      s = this.unionSwingTransformer.applyUniformSwingToList(
        t.partyListData ?? [],
        t.candidateListData ?? [],
        a.baseShare,
        a.targetShare,
      ),
      u = this.unionSwingTransformer.applyUniformSwingToListVotes(
        a.baseShare,
        a.targetShare,
        t.partyListVotes,
      );
    return { candidateListData: l, partyListData: s, partyListVotes: u };
  }
  applyShares(t, a) {
    fr.info("Applying vote allocation", { appliedEffects: a });
    const r = this.voterShareTransformer.distributeVotesByPartyShare(
      t.candidateListData ?? [],
      t.partyListData ?? [],
      a.newVotes,
      a.share,
      !0,
      t.partyListVotes,
    );
    return r
      ? {
          candidateListData: r.candidateList,
          partyListData: r.partyList,
          partyListVotes: r.partyListVotes,
        }
      : (fr.error("No result from distributeVotesByPartyShare"), null);
  }
  applyDistrict(t, a) {
    fr.info("Applying district vote transfer", { appliedEffects: a });
    const r = this.districtVoteTransformer.modifyDistricts(
      t.candidateListData ?? [],
      a.target,
      t.partyListData,
      t.partyListVotes,
    );
    return {
      candidateListData: r.newCandidateListData,
      partyListData: r.newPartyListData,
      partyListVotes: r.newPartyListVotes,
    };
  }
  applyMotivation(t, a) {
    fr.info("Applying turnout change", { appliedEffects: a });
    const r = this.voterShareTransformer.modifyByMotivation(
      t.candidateListData ?? [],
      t.partyListData ?? [],
      a.motivationDelta,
    );
    return {
      candidateListData: r.newCandidateData,
      partyListData: r.newPartyData,
    };
  }
  modifyListDistricts(t, a) {
    return this.districtVoteTransformer.modifyListDistricts(t, a);
  }
};
Su = Gx([yd(0, Pi(Lp)), yd(1, Pi(_o)), yd(2, Pi(Eo))], Su);
const Px = qt("Emitter");
class tl {
  constructor() {
    Ft(this, "listeners", []);
  }
  subscribe(a) {
    return (
      this.listeners.push(a),
      () => {
        this.listeners = this.listeners.filter((r) => r !== a);
      }
    );
  }
  notify(a) {
    (Px.debug("Emitting event", { event: a }),
      this.listeners.forEach((r) => r(a)));
  }
}
const qx = {
  campaigns: "/assets/jsons/game_modes.json",
  quotes: "/assets/jsons/quotes.json",
  electionConfig: (t) => `/campaigns/${t}/election_config.json`,
  districtMap: (t) => `/assets/jsons/shared/${t}.json`,
  background: "/parlament_night.jpg",
};
function Yx(t, a) {
  const r = qx[t];
  if (typeof r == "function") {
    if (!a) throw new Error(`Route is required for key: ${t}`);
    return r(a);
  }
  return r;
}
async function Zx(t, a) {
  const r = Yx(t, a),
    l = await fetch(r);
  if (!l.ok) throw new Error(`Failed to load JSON: ${r}`);
  return await l.json();
}
var Xx = Object.getOwnPropertyDescriptor,
  Kx = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? Xx(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  };
const Ir = qt("ConfigEngine");
let Eu = class extends tl {
  constructor(a, r) {
    Ir.debug("ElectionConfigEngine initialized");
    super();
    Ft(this, "configured", !1);
    ((this.storage = a),
      (this.stateHandler = r),
      (this.storage.setItem = this.storage.setItem.bind(this)));
  }
  configure(a, r, l = !1) {
    if (this.configured && !l) {
      Ir.debug("ConfigEngine is already configured, skipping reconfiguration");
      return;
    }
    (Ir.debug("Configuring game with campaign config", { campaignConfig: a }),
      this.setCampaignConfig(a, r));
  }
  getCurrentElectionConfig() {
    var f;
    const a =
      (f = this.stateHandler.get("campaignConfig")) == null
        ? void 0
        : f.electionConfig;
    if (a) return a;
    const r = this.storage.getItem("currentSessionId", "localStorage"),
      l = this.storage.getItem("campaignState", "localStorage", r ?? ""),
      s = l ? JSON.parse(l) : null;
    if (!(s != null && s.activeCampaignId)) {
      Ir.error("no saved campaign id was found");
      return;
    }
    const u = this.storage.getItem(
      "campaignConfig",
      "localStorage",
      s.activeCampaignId,
    );
    return u ? JSON.parse(u) : null;
  }
  getCampaignConfig(a) {
    const r = this.stateHandler.get("campaignConfig");
    if (r) return r;
    const l = a ?? this.getActiveCampaignId() ?? "",
      s = this.storage.getItem("campaignConfig", "localStorage", l);
    return s ? JSON.parse(s) : null;
  }
  getDistrictMapByType(a) {
    const r = this.getDistrictMapNameByType(a);
    return Zx("districtMap", r);
  }
  getDistrictMapNameByType(a) {
    switch (a) {
      case "2011":
        return "oevk_2011";
      case "2024":
        return "oevk_2024";
      default:
        return (
          Ir.error("Unknown district map type", { districtMapType: a }),
          "oevk_2011"
        );
    }
  }
  getCampaignStrategies(a, r, l) {
    var f, p, h, g, y;
    const s =
        (f = a.playerSide) != null &&
        f.partyId &&
        (p = a.playerSide) != null &&
        p.candidateId
          ? (y =
              (g =
                (h = r.playableSides) == null
                  ? void 0
                  : h[a.playerSide.partyId]) == null
                ? void 0
                : g[a.playerSide.candidateId]) == null
            ? void 0
            : y.campaignStrategies
          : void 0,
      u =
        s == null
          ? void 0
          : s.filter((v) => {
              var E, w;
              return (
                v.target.party ===
                  ((E = a.playerSide) == null ? void 0 : E.partyId) &&
                v.target.candidate ===
                  ((w = a.playerSide) == null ? void 0 : w.candidateId)
              );
            });
    return u == null
      ? void 0
      : u.map((v) => {
          const E = v.conditions.filter((S) =>
              l.some(
                (b) =>
                  b.questionId === S.questionId && b.answerId === S.answerId,
              ),
            ).length,
            w = v.rewards
              .filter((S) => E >= S.minMatches)
              .reduce(
                (S, b) => (!S || b.minMatches > S.minMatches ? b : S),
                void 0,
              );
          return { ...v, isCompleted: !!w };
        });
  }
  getActiveCampaignId() {
    const a = this.storage.getItem("currentSessionId", "localStorage"),
      r = this.storage.getItem("campaignState", "localStorage", a ?? ""),
      l = r ? JSON.parse(r) : null;
    if (!l) {
      Ir.error("state was not found");
      return;
    }
    return l.activeCampaignId;
  }
  setCampaignConfig(a, r) {
    if ((this.stateHandler.set("campaignConfig", a), !r))
      return (
        Ir.debug("Clearing campaign config"),
        this.storage.clearItem("campaignConfig", "localStorage")
      );
    const l = JSON.stringify(a);
    (this.storage.setItem("campaignConfig", l, "localStorage", r),
      (this.configured = !0));
  }
};
Eu = Kx([yr()], Eu);
const It = [];
for (let t = 0; t < 256; ++t) It.push((t + 256).toString(16).slice(1));
function Qx(t, a = 0) {
  return (
    It[t[a + 0]] +
    It[t[a + 1]] +
    It[t[a + 2]] +
    It[t[a + 3]] +
    "-" +
    It[t[a + 4]] +
    It[t[a + 5]] +
    "-" +
    It[t[a + 6]] +
    It[t[a + 7]] +
    "-" +
    It[t[a + 8]] +
    It[t[a + 9]] +
    "-" +
    It[t[a + 10]] +
    It[t[a + 11]] +
    It[t[a + 12]] +
    It[t[a + 13]] +
    It[t[a + 14]] +
    It[t[a + 15]]
  ).toLowerCase();
}
const Jx = new Uint8Array(16);
function Wx() {
  return crypto.getRandomValues(Jx);
}
function ep(t, a, r) {
  return crypto.randomUUID ? crypto.randomUUID() : eC(t);
}
function eC(t, a, r) {
  var s;
  t = t || {};
  const l = t.random ?? ((s = t.rng) == null ? void 0 : s.call(t)) ?? Wx();
  if (l.length < 16) throw new Error("Random bytes length must be >= 16");
  return ((l[6] = (l[6] & 15) | 64), (l[8] = (l[8] & 63) | 128), Qx(l));
}
const tC = () => ep(),
  dv = qt("NavigationService");
class d0 {
  constructor() {
    Ft(this, "navigate", null);
  }
  setNavigate(a) {
    this.navigate = a;
  }
  go(a) {
    if (!this.navigate) {
      dv.error("Navigate function is not set");
      return;
    }
    this.navigate(a);
  }
  back() {
    if (!this.navigate) {
      dv.error("Navigate function is not set");
      return;
    }
    this.navigate(-1);
  }
  getUrlParams() {
    return new URLSearchParams(window.location.search);
  }
  isUrlParamMatch(a) {
    return window.location.pathname.includes(a);
  }
}
const De = (t) => typeof t == "string",
  lo = () => {
    let t, a;
    const r = new Promise((l, s) => {
      ((t = l), (a = s));
    });
    return ((r.resolve = t), (r.reject = a), r);
  },
  pv = (t) => (t == null ? "" : String(t)),
  nC = (t, a, r) => {
    t.forEach((l) => {
      a[l] && (r[l] = a[l]);
    });
  },
  aC = /###/g,
  hv = (t) => (t && t.includes("###") ? t.replace(aC, ".") : t),
  gv = (t) => !t || De(t),
  yo = (t, a, r) => {
    const l = De(a) ? a.split(".") : a;
    let s = 0;
    for (; s < l.length - 1; ) {
      if (gv(t)) return {};
      const u = hv(l[s]);
      (!t[u] && r && (t[u] = new r()),
        Object.prototype.hasOwnProperty.call(t, u) ? (t = t[u]) : (t = {}),
        ++s);
    }
    return gv(t) ? {} : { obj: t, k: hv(l[s]) };
  },
  yv = (t, a, r) => {
    const { obj: l, k: s } = yo(t, a, Object);
    if (l !== void 0 || a.length === 1) {
      l[s] = r;
      return;
    }
    let u = a[a.length - 1],
      f = a.slice(0, a.length - 1),
      p = yo(t, f, Object);
    for (; p.obj === void 0 && f.length; )
      ((u = `${f[f.length - 1]}.${u}`),
        (f = f.slice(0, f.length - 1)),
        (p = yo(t, f, Object)),
        p != null &&
          p.obj &&
          typeof p.obj[`${p.k}.${u}`] < "u" &&
          (p.obj = void 0));
    p.obj[`${p.k}.${u}`] = r;
  },
  rC = (t, a, r, l) => {
    const { obj: s, k: u } = yo(t, a, Object);
    ((s[u] = s[u] || []), s[u].push(r));
  },
  _u = (t, a) => {
    const { obj: r, k: l } = yo(t, a);
    if (r && Object.prototype.hasOwnProperty.call(r, l)) return r[l];
  },
  iC = (t, a, r) => {
    const l = _u(t, r);
    return l !== void 0 ? l : _u(a, r);
  },
  p0 = (t, a, r) => {
    for (const l in a)
      l !== "__proto__" &&
        l !== "constructor" &&
        (l in t
          ? De(t[l]) ||
            t[l] instanceof String ||
            De(a[l]) ||
            a[l] instanceof String
            ? r && (t[l] = a[l])
            : p0(t[l], a[l], r)
          : (t[l] = a[l]));
    return t;
  },
  ka = (t) => t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
  lC = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  },
  oC = (t) => (De(t) ? t.replace(/[&<>"'\/]/g, (a) => lC[a]) : t);
class sC {
  constructor(a) {
    ((this.capacity = a),
      (this.regExpMap = new Map()),
      (this.regExpQueue = []));
  }
  getRegExp(a) {
    const r = this.regExpMap.get(a);
    if (r !== void 0) return r;
    const l = new RegExp(a);
    return (
      this.regExpQueue.length === this.capacity &&
        this.regExpMap.delete(this.regExpQueue.shift()),
      this.regExpMap.set(a, l),
      this.regExpQueue.push(a),
      l
    );
  }
}
const uC = [" ", ",", "?", "!", ";"],
  cC = new sC(20),
  fC = (t, a, r) => {
    ((a = a || ""), (r = r || ""));
    const l = uC.filter((f) => !a.includes(f) && !r.includes(f));
    if (l.length === 0) return !0;
    const s = cC.getRegExp(
      `(${l.map((f) => (f === "?" ? "\\?" : f)).join("|")})`,
    );
    let u = !s.test(t);
    if (!u) {
      const f = t.indexOf(r);
      f > 0 && !s.test(t.substring(0, f)) && (u = !0);
    }
    return u;
  },
  tp = (t, a, r = ".") => {
    if (!t) return;
    if (t[a]) return Object.prototype.hasOwnProperty.call(t, a) ? t[a] : void 0;
    const l = a.split(r);
    let s = t;
    for (let u = 0; u < l.length; ) {
      if (!s || typeof s != "object") return;
      let f,
        p = "";
      for (let h = u; h < l.length; ++h)
        if ((h !== u && (p += r), (p += l[h]), (f = s[p]), f !== void 0)) {
          if (
            ["string", "number", "boolean"].includes(typeof f) &&
            h < l.length - 1
          )
            continue;
          u += h - u + 1;
          break;
        }
      s = f;
    }
    return s;
  },
  wo = (t) => (t == null ? void 0 : t.replace(/_/g, "-")),
  dC = {
    type: "logger",
    log(t) {
      this.output("log", t);
    },
    warn(t) {
      this.output("warn", t);
    },
    error(t) {
      this.output("error", t);
    },
    output(t, a) {
      var r, l;
      (l =
        (r = console == null ? void 0 : console[t]) == null
          ? void 0
          : r.apply) == null || l.call(r, console, a);
    },
  };
class wu {
  constructor(a, r = {}) {
    this.init(a, r);
  }
  init(a, r = {}) {
    ((this.prefix = r.prefix || "i18next:"),
      (this.logger = a || dC),
      (this.options = r),
      (this.debug = r.debug));
  }
  log(...a) {
    return this.forward(a, "log", "", !0);
  }
  warn(...a) {
    return this.forward(a, "warn", "", !0);
  }
  error(...a) {
    return this.forward(a, "error", "");
  }
  deprecate(...a) {
    return this.forward(a, "warn", "WARNING DEPRECATED: ", !0);
  }
  forward(a, r, l, s) {
    return s && !this.debug
      ? null
      : ((a = a.map((u) =>
          De(u) ? u.replace(/[\r\n\x00-\x1F\x7F]/g, " ") : u,
        )),
        De(a[0]) && (a[0] = `${l}${this.prefix} ${a[0]}`),
        this.logger[r](a));
  }
  create(a) {
    return new wu(this.logger, {
      prefix: `${this.prefix}:${a}:`,
      ...this.options,
    });
  }
  clone(a) {
    return (
      (a = a || this.options),
      (a.prefix = a.prefix || this.prefix),
      new wu(this.logger, a)
    );
  }
}
var ia = new wu();
class Iu {
  constructor() {
    this.observers = {};
  }
  on(a, r) {
    return (
      a.split(" ").forEach((l) => {
        this.observers[l] || (this.observers[l] = new Map());
        const s = this.observers[l].get(r) || 0;
        this.observers[l].set(r, s + 1);
      }),
      this
    );
  }
  off(a, r) {
    if (this.observers[a]) {
      if (!r) {
        delete this.observers[a];
        return;
      }
      this.observers[a].delete(r);
    }
  }
  once(a, r) {
    const l = (...s) => {
      (r(...s), this.off(a, l));
    };
    return (this.on(a, l), this);
  }
  emit(a, ...r) {
    (this.observers[a] &&
      Array.from(this.observers[a].entries()).forEach(([s, u]) => {
        for (let f = 0; f < u; f++) s(...r);
      }),
      this.observers["*"] &&
        Array.from(this.observers["*"].entries()).forEach(([s, u]) => {
          for (let f = 0; f < u; f++) s(a, ...r);
        }));
  }
}
class mv extends Iu {
  constructor(a, r = { ns: ["translation"], defaultNS: "translation" }) {
    (super(),
      (this.data = a || {}),
      (this.options = r),
      this.options.keySeparator === void 0 && (this.options.keySeparator = "."),
      this.options.ignoreJSONStructure === void 0 &&
        (this.options.ignoreJSONStructure = !0));
  }
  addNamespaces(a) {
    this.options.ns.includes(a) || this.options.ns.push(a);
  }
  removeNamespaces(a) {
    const r = this.options.ns.indexOf(a);
    r > -1 && this.options.ns.splice(r, 1);
  }
  getResource(a, r, l, s = {}) {
    var g, y;
    const u =
        s.keySeparator !== void 0 ? s.keySeparator : this.options.keySeparator,
      f =
        s.ignoreJSONStructure !== void 0
          ? s.ignoreJSONStructure
          : this.options.ignoreJSONStructure;
    let p;
    a.includes(".")
      ? (p = a.split("."))
      : ((p = [a, r]),
        l &&
          (Array.isArray(l)
            ? p.push(...l)
            : De(l) && u
              ? p.push(...l.split(u))
              : p.push(l)));
    const h = _u(this.data, p);
    return (
      !h &&
        !r &&
        !l &&
        a.includes(".") &&
        ((a = p[0]), (r = p[1]), (l = p.slice(2).join("."))),
      h || !f || !De(l)
        ? h
        : tp(
            (y = (g = this.data) == null ? void 0 : g[a]) == null
              ? void 0
              : y[r],
            l,
            u,
          )
    );
  }
  addResource(a, r, l, s, u = { silent: !1 }) {
    const f =
      u.keySeparator !== void 0 ? u.keySeparator : this.options.keySeparator;
    let p = [a, r];
    (l && (p = p.concat(f ? l.split(f) : l)),
      a.includes(".") && ((p = a.split(".")), (s = r), (r = p[1])),
      this.addNamespaces(r),
      yv(this.data, p, s),
      u.silent || this.emit("added", a, r, l, s));
  }
  addResources(a, r, l, s = { silent: !1 }) {
    for (const u in l)
      (De(l[u]) || Array.isArray(l[u])) &&
        this.addResource(a, r, u, l[u], { silent: !0 });
    s.silent || this.emit("added", a, r, l);
  }
  addResourceBundle(a, r, l, s, u, f = { silent: !1, skipCopy: !1 }) {
    let p = [a, r];
    (a.includes(".") && ((p = a.split(".")), (s = l), (l = r), (r = p[1])),
      this.addNamespaces(r));
    let h = _u(this.data, p) || {};
    (f.skipCopy || (l = JSON.parse(JSON.stringify(l))),
      s ? p0(h, l, u) : (h = { ...h, ...l }),
      yv(this.data, p, h),
      f.silent || this.emit("added", a, r, l));
  }
  removeResourceBundle(a, r) {
    (this.hasResourceBundle(a, r) && delete this.data[a][r],
      this.removeNamespaces(r),
      this.emit("removed", a, r));
  }
  hasResourceBundle(a, r) {
    return this.getResource(a, r) !== void 0;
  }
  getResourceBundle(a, r) {
    return (r || (r = this.options.defaultNS), this.getResource(a, r));
  }
  getDataByLanguage(a) {
    return this.data[a];
  }
  hasLanguageSomeTranslations(a) {
    const r = this.getDataByLanguage(a);
    return !!((r && Object.keys(r)) || []).find(
      (s) => r[s] && Object.keys(r[s]).length > 0,
    );
  }
  toJSON() {
    return this.data;
  }
}
var h0 = {
  processors: {},
  addPostProcessor(t) {
    this.processors[t.name] = t;
  },
  handle(t, a, r, l, s) {
    return (
      t.forEach((u) => {
        var f;
        a =
          ((f = this.processors[u]) == null ? void 0 : f.process(a, r, l, s)) ??
          a;
      }),
      a
    );
  },
};
const g0 = Symbol("i18next/PATH_KEY");
function pC() {
  const t = [],
    a = Object.create(null);
  let r;
  return (
    (a.get = (l, s) => {
      var u;
      return (
        (u = r == null ? void 0 : r.revoke) == null || u.call(r),
        s === g0 ? t : (t.push(s), (r = Proxy.revocable(l, a)), r.proxy)
      );
    }),
    Proxy.revocable(Object.create(null), a).proxy
  );
}
function Yi(t, a) {
  const { [g0]: r } = t(pC()),
    l = (a == null ? void 0 : a.keySeparator) ?? ".",
    s = (a == null ? void 0 : a.nsSeparator) ?? ":",
    u = (a == null ? void 0 : a.enableSelector) === "strict";
  if (r.length > 1 && s) {
    const f = a == null ? void 0 : a.ns,
      p = u
        ? Array.isArray(f)
          ? f
          : f
            ? [f]
            : null
        : Array.isArray(f)
          ? f
          : null;
    if (p && (u ? p : p.length > 1 ? p.slice(1) : []).includes(r[0]))
      return `${r[0]}${s}${r.slice(1).join(l)}`;
  }
  return r.join(l);
}
const md = (t) => !De(t) && typeof t != "boolean" && typeof t != "number";
class Ou extends Iu {
  constructor(a, r = {}) {
    (super(),
      nC(
        [
          "resourceStore",
          "languageUtils",
          "pluralResolver",
          "interpolator",
          "backendConnector",
          "i18nFormat",
          "utils",
        ],
        a,
        this,
      ),
      (this.options = r),
      this.options.keySeparator === void 0 && (this.options.keySeparator = "."),
      (this.logger = ia.create("translator")),
      (this.checkedLoadedFor = {}));
  }
  changeLanguage(a) {
    a && (this.language = a);
  }
  exists(a, r = { interpolation: {} }) {
    const l = { ...r };
    if (a == null) return !1;
    const s = this.resolve(a, l);
    if ((s == null ? void 0 : s.res) === void 0) return !1;
    const u = md(s.res);
    return !(l.returnObjects === !1 && u);
  }
  extractFromKey(a, r) {
    let l = r.nsSeparator !== void 0 ? r.nsSeparator : this.options.nsSeparator;
    l === void 0 && (l = ":");
    const s =
      r.keySeparator !== void 0 ? r.keySeparator : this.options.keySeparator;
    let u = r.ns || this.options.defaultNS || [];
    const f = l && a.includes(l),
      p =
        !this.options.userDefinedKeySeparator &&
        !r.keySeparator &&
        !this.options.userDefinedNsSeparator &&
        !r.nsSeparator &&
        !fC(a, l, s);
    if (f && !p) {
      const h = a.match(this.interpolator.nestingRegexp);
      if (h && h.length > 0) return { key: a, namespaces: De(u) ? [u] : u };
      const g = a.split(l);
      ((l !== s || (l === s && this.options.ns.includes(g[0]))) &&
        (u = g.shift()),
        (a = g.join(s)));
    }
    return { key: a, namespaces: De(u) ? [u] : u };
  }
  translate(a, r, l) {
    let s = typeof r == "object" ? { ...r } : r;
    if (
      (typeof s != "object" &&
        this.options.overloadTranslationOptionHandler &&
        (s = this.options.overloadTranslationOptionHandler(arguments)),
      typeof s == "object" && (s = { ...s }),
      s || (s = {}),
      a == null)
    )
      return "";
    (typeof a == "function" && (a = Yi(a, { ...this.options, ...s })),
      Array.isArray(a) || (a = [String(a)]),
      (a = a.map((oe) =>
        typeof oe == "function"
          ? Yi(oe, { ...this.options, ...s })
          : String(oe),
      )));
    const u =
        s.returnDetails !== void 0
          ? s.returnDetails
          : this.options.returnDetails,
      f =
        s.keySeparator !== void 0 ? s.keySeparator : this.options.keySeparator,
      { key: p, namespaces: h } = this.extractFromKey(a[a.length - 1], s),
      g = h[h.length - 1];
    let y = s.nsSeparator !== void 0 ? s.nsSeparator : this.options.nsSeparator;
    y === void 0 && (y = ":");
    const v = s.lng || this.language,
      E = s.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
    if ((v == null ? void 0 : v.toLowerCase()) === "cimode")
      return E
        ? u
          ? {
              res: `${g}${y}${p}`,
              usedKey: p,
              exactUsedKey: p,
              usedLng: v,
              usedNS: g,
              usedParams: this.getUsedParamsDetails(s),
            }
          : `${g}${y}${p}`
        : u
          ? {
              res: p,
              usedKey: p,
              exactUsedKey: p,
              usedLng: v,
              usedNS: g,
              usedParams: this.getUsedParamsDetails(s),
            }
          : p;
    const w = this.resolve(a, s);
    let S = w == null ? void 0 : w.res;
    const b = (w == null ? void 0 : w.usedKey) || p,
      O = (w == null ? void 0 : w.exactUsedKey) || p,
      k = ["[object Number]", "[object Function]", "[object RegExp]"],
      L = s.joinArrays !== void 0 ? s.joinArrays : this.options.joinArrays,
      z = !this.i18nFormat || this.i18nFormat.handleAsObject,
      Q = s.count !== void 0 && !De(s.count),
      ae = Ou.hasDefaultValue(s),
      re = Q ? this.pluralResolver.getSuffix(v, s.count, s) : "",
      q =
        s.ordinal && Q
          ? this.pluralResolver.getSuffix(v, s.count, { ordinal: !1 })
          : "",
      ie = Q && !s.ordinal && s.count === 0,
      se =
        (ie && s[`defaultValue${this.options.pluralSeparator}zero`]) ||
        s[`defaultValue${re}`] ||
        s[`defaultValue${q}`] ||
        s.defaultValue;
    let ve = S;
    z && !S && ae && (ve = se);
    const Te = md(ve),
      Y = Object.prototype.toString.apply(ve);
    if (z && ve && Te && !k.includes(Y) && !(De(L) && Array.isArray(ve))) {
      if (!s.returnObjects && !this.options.returnObjects) {
        this.options.returnedObjectHandler ||
          this.logger.warn(
            "accessing an object - but returnObjects options is not enabled!",
          );
        const oe = this.options.returnedObjectHandler
          ? this.options.returnedObjectHandler(b, ve, { ...s, ns: h })
          : `key '${p} (${this.language})' returned an object instead of string.`;
        return u
          ? ((w.res = oe), (w.usedParams = this.getUsedParamsDetails(s)), w)
          : oe;
      }
      if (f) {
        const oe = Array.isArray(ve),
          ue = oe ? [] : {},
          de = oe ? O : b;
        for (const M in ve)
          if (Object.prototype.hasOwnProperty.call(ve, M)) {
            const Z = `${de}${f}${M}`;
            (ae && !S
              ? (ue[M] = this.translate(Z, {
                  ...s,
                  defaultValue: md(se) ? se[M] : void 0,
                  joinArrays: !1,
                  ns: h,
                }))
              : (ue[M] = this.translate(Z, { ...s, joinArrays: !1, ns: h })),
              ue[M] === Z && (ue[M] = ve[M]));
          }
        S = ue;
      }
    } else if (z && De(L) && Array.isArray(S))
      ((S = S.join(L)), S && (S = this.extendTranslation(S, a, s, l)));
    else {
      let oe = !1,
        ue = !1;
      (!this.isValidLookup(S) && ae && ((oe = !0), (S = se)),
        this.isValidLookup(S) || ((ue = !0), (S = p)));
      const M =
          (s.missingKeyNoValueFallbackToKey ||
            this.options.missingKeyNoValueFallbackToKey) &&
          ue
            ? void 0
            : S,
        Z = ae && se !== S && this.options.updateMissing;
      if (ue || oe || Z) {
        if (
          (this.logger.log(
            Z ? "updateKey" : "missingKey",
            v,
            g,
            Q && !Z ? `${p}${this.pluralResolver.getSuffix(v, s.count, s)}` : p,
            Z ? se : S,
          ),
          f)
        ) {
          const A = this.resolve(p, { ...s, keySeparator: !1 });
          A &&
            A.res &&
            this.logger.warn(
              "Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.",
            );
        }
        let ne = [];
        const he = this.languageUtils.getFallbackCodes(
          this.options.fallbackLng,
          s.lng || this.language,
        );
        if (this.options.saveMissingTo === "fallback" && he && he[0])
          for (let A = 0; A < he.length; A++) ne.push(he[A]);
        else
          this.options.saveMissingTo === "all"
            ? (ne = this.languageUtils.toResolveHierarchy(
                s.lng || this.language,
              ))
            : ne.push(s.lng || this.language);
        const fe = (A, V, B) => {
          var Ce;
          const ce = ae && B !== S ? B : M;
          (this.options.missingKeyHandler
            ? this.options.missingKeyHandler(A, g, V, ce, Z, s)
            : (Ce = this.backendConnector) != null &&
              Ce.saveMissing &&
              this.backendConnector.saveMissing(A, g, V, ce, Z, s),
            this.emit("missingKey", A, g, V, S));
        };
        this.options.saveMissing &&
          (this.options.saveMissingPlurals && Q
            ? ne.forEach((A) => {
                const V = this.pluralResolver.getSuffixes(A, s);
                (ie &&
                  s[`defaultValue${this.options.pluralSeparator}zero`] &&
                  !V.includes(`${this.options.pluralSeparator}zero`) &&
                  V.push(`${this.options.pluralSeparator}zero`),
                  V.forEach((B) => {
                    fe([A], p + B, s[`defaultValue${B}`] || se);
                  }));
              })
            : fe(ne, p, se));
      }
      ((S = this.extendTranslation(S, a, s, w, l)),
        ue &&
          S === p &&
          this.options.appendNamespaceToMissingKey &&
          (S = `${g}${y}${p}`),
        (ue || oe) &&
          this.options.parseMissingKeyHandler &&
          (S = this.options.parseMissingKeyHandler(
            this.options.appendNamespaceToMissingKey ? `${g}${y}${p}` : p,
            oe ? S : void 0,
            s,
          )));
    }
    return u
      ? ((w.res = S), (w.usedParams = this.getUsedParamsDetails(s)), w)
      : S;
  }
  extendTranslation(a, r, l, s, u) {
    var h, g;
    if ((h = this.i18nFormat) != null && h.parse)
      a = this.i18nFormat.parse(
        a,
        { ...this.options.interpolation.defaultVariables, ...l },
        l.lng || this.language || s.usedLng,
        s.usedNS,
        s.usedKey,
        { resolved: s },
      );
    else if (!l.skipInterpolation) {
      l.interpolation &&
        this.interpolator.init({
          ...l,
          interpolation: { ...this.options.interpolation, ...l.interpolation },
        });
      const y =
        De(a) &&
        (((g = l == null ? void 0 : l.interpolation) == null
          ? void 0
          : g.skipOnVariables) !== void 0
          ? l.interpolation.skipOnVariables
          : this.options.interpolation.skipOnVariables);
      let v;
      if (y) {
        const w = a.match(this.interpolator.nestingRegexp);
        v = w && w.length;
      }
      let E = l.replace && !De(l.replace) ? l.replace : l;
      if (
        (this.options.interpolation.defaultVariables &&
          (E = { ...this.options.interpolation.defaultVariables, ...E }),
        (a = this.interpolator.interpolate(
          a,
          E,
          l.lng || this.language || s.usedLng,
          l,
        )),
        y)
      ) {
        const w = a.match(this.interpolator.nestingRegexp),
          S = w && w.length;
        v < S && (l.nest = !1);
      }
      (!l.lng && s && s.res && (l.lng = this.language || s.usedLng),
        l.nest !== !1 &&
          (a = this.interpolator.nest(
            a,
            (...w) =>
              (u == null ? void 0 : u[0]) === w[0] && !l.context
                ? (this.logger.warn(
                    `It seems you are nesting recursively key: ${w[0]} in key: ${r[0]}`,
                  ),
                  null)
                : this.translate(...w, r),
            l,
          )),
        l.interpolation && this.interpolator.reset());
    }
    const f = l.postProcess || this.options.postProcess,
      p = De(f) ? [f] : f;
    return (
      a != null &&
        p != null &&
        p.length &&
        l.applyPostProcessor !== !1 &&
        (a = h0.handle(
          p,
          a,
          r,
          this.options && this.options.postProcessPassResolved
            ? {
                i18nResolved: {
                  ...s,
                  usedParams: this.getUsedParamsDetails(l),
                },
                ...l,
              }
            : l,
          this,
        )),
      a
    );
  }
  resolve(a, r = {}) {
    let l, s, u, f, p;
    return (
      De(a) && (a = [a]),
      Array.isArray(a) &&
        (a = a.map((h) =>
          typeof h == "function" ? Yi(h, { ...this.options, ...r }) : h,
        )),
      a.forEach((h) => {
        if (this.isValidLookup(l)) return;
        const g = this.extractFromKey(h, r),
          y = g.key;
        s = y;
        let v = g.namespaces;
        this.options.fallbackNS && (v = v.concat(this.options.fallbackNS));
        const E = r.count !== void 0 && !De(r.count),
          w = E && !r.ordinal && r.count === 0,
          S =
            r.context !== void 0 &&
            (De(r.context) || typeof r.context == "number") &&
            r.context !== "",
          b = r.lngs
            ? r.lngs
            : this.languageUtils.toResolveHierarchy(
                r.lng || this.language,
                r.fallbackLng,
              );
        v.forEach((O) => {
          var k, L;
          this.isValidLookup(l) ||
            ((p = O),
            !this.checkedLoadedFor[`${b[0]}-${O}`] &&
              (k = this.utils) != null &&
              k.hasLoadedNamespace &&
              !((L = this.utils) != null && L.hasLoadedNamespace(p)) &&
              ((this.checkedLoadedFor[`${b[0]}-${O}`] = !0),
              this.logger.warn(
                `key "${s}" for languages "${b.join(", ")}" won't get resolved as namespace "${p}" was not yet loaded`,
                "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!",
              )),
            b.forEach((z) => {
              var re;
              if (this.isValidLookup(l)) return;
              f = z;
              const Q = [y];
              if ((re = this.i18nFormat) != null && re.addLookupKeys)
                this.i18nFormat.addLookupKeys(Q, y, z, O, r);
              else {
                let q;
                E && (q = this.pluralResolver.getSuffix(z, r.count, r));
                const ie = `${this.options.pluralSeparator}zero`,
                  se = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
                if (
                  (E &&
                    (r.ordinal &&
                      q.startsWith(se) &&
                      Q.push(y + q.replace(se, this.options.pluralSeparator)),
                    Q.push(y + q),
                    w && Q.push(y + ie)),
                  S)
                ) {
                  const ve = `${y}${this.options.contextSeparator || "_"}${r.context}`;
                  (Q.push(ve),
                    E &&
                      (r.ordinal &&
                        q.startsWith(se) &&
                        Q.push(
                          ve + q.replace(se, this.options.pluralSeparator),
                        ),
                      Q.push(ve + q),
                      w && Q.push(ve + ie)));
                }
              }
              let ae;
              for (; (ae = Q.pop()); )
                this.isValidLookup(l) ||
                  ((u = ae), (l = this.getResource(z, O, ae, r)));
            }));
        });
      }),
      { res: l, usedKey: s, exactUsedKey: u, usedLng: f, usedNS: p }
    );
  }
  isValidLookup(a) {
    return (
      a !== void 0 &&
      !(!this.options.returnNull && a === null) &&
      !(!this.options.returnEmptyString && a === "")
    );
  }
  getResource(a, r, l, s = {}) {
    var u;
    return (u = this.i18nFormat) != null && u.getResource
      ? this.i18nFormat.getResource(a, r, l, s)
      : this.resourceStore.getResource(a, r, l, s);
  }
  getUsedParamsDetails(a = {}) {
    const r = [
        "defaultValue",
        "ordinal",
        "context",
        "replace",
        "lng",
        "lngs",
        "fallbackLng",
        "ns",
        "keySeparator",
        "nsSeparator",
        "returnObjects",
        "returnDetails",
        "joinArrays",
        "postProcess",
        "interpolation",
      ],
      l = a.replace && !De(a.replace);
    let s = l ? a.replace : a;
    if (
      (l && typeof a.count < "u" && (s.count = a.count),
      this.options.interpolation.defaultVariables &&
        (s = { ...this.options.interpolation.defaultVariables, ...s }),
      !l)
    ) {
      s = { ...s };
      for (const u of r) delete s[u];
    }
    return s;
  }
  static hasDefaultValue(a) {
    const r = "defaultValue";
    for (const l in a)
      if (
        Object.prototype.hasOwnProperty.call(a, l) &&
        l.startsWith(r) &&
        a[l] !== void 0
      )
        return !0;
    return !1;
  }
}
class vv {
  constructor(a) {
    ((this.options = a),
      (this.supportedLngs = this.options.supportedLngs || !1),
      (this.logger = ia.create("languageUtils")));
  }
  getScriptPartFromCode(a) {
    if (((a = wo(a)), !a || !a.includes("-"))) return null;
    const r = a.split("-");
    return r.length === 2 || (r.pop(), r[r.length - 1].toLowerCase() === "x")
      ? null
      : this.formatLanguageCode(r.join("-"));
  }
  getLanguagePartFromCode(a) {
    if (((a = wo(a)), !a || !a.includes("-"))) return a;
    const r = a.split("-");
    return this.formatLanguageCode(r[0]);
  }
  formatLanguageCode(a) {
    if (De(a) && a.includes("-")) {
      let r;
      try {
        r = Intl.getCanonicalLocales(a)[0];
      } catch {}
      return (
        r && this.options.lowerCaseLng && (r = r.toLowerCase()),
        r || (this.options.lowerCaseLng ? a.toLowerCase() : a)
      );
    }
    return this.options.cleanCode || this.options.lowerCaseLng
      ? a.toLowerCase()
      : a;
  }
  isSupportedCode(a) {
    return (
      (this.options.load === "languageOnly" ||
        this.options.nonExplicitSupportedLngs) &&
        (a = this.getLanguagePartFromCode(a)),
      !this.supportedLngs ||
        !this.supportedLngs.length ||
        this.supportedLngs.includes(a)
    );
  }
  getBestMatchFromCodes(a) {
    if (!a) return null;
    let r;
    return (
      a.forEach((l) => {
        if (r) return;
        const s = this.formatLanguageCode(l);
        (!this.options.supportedLngs || this.isSupportedCode(s)) && (r = s);
      }),
      !r &&
        this.options.supportedLngs &&
        a.forEach((l) => {
          if (r) return;
          const s = this.getScriptPartFromCode(l);
          if (this.isSupportedCode(s)) return (r = s);
          const u = this.getLanguagePartFromCode(l);
          if (this.isSupportedCode(u)) return (r = u);
          r = this.options.supportedLngs.find((f) =>
            f === u
              ? !0
              : !f.includes("-") && !u.includes("-")
                ? !1
                : !!(
                    (f.includes("-") &&
                      !u.includes("-") &&
                      f.slice(0, f.indexOf("-")) === u) ||
                    (f.startsWith(u) && u.length > 1)
                  ),
          );
        }),
      r || (r = this.getFallbackCodes(this.options.fallbackLng)[0]),
      r
    );
  }
  getFallbackCodes(a, r) {
    if (!a) return [];
    if (
      (typeof a == "function" && (a = a(r)),
      De(a) && (a = [a]),
      Array.isArray(a))
    )
      return a;
    if (!r) return a.default || [];
    let l = a[r];
    return (
      l || (l = a[this.getScriptPartFromCode(r)]),
      l || (l = a[this.formatLanguageCode(r)]),
      l || (l = a[this.getLanguagePartFromCode(r)]),
      l || (l = a.default),
      l || []
    );
  }
  toResolveHierarchy(a, r) {
    const l = this.getFallbackCodes(
        (r === !1 ? [] : r) || this.options.fallbackLng || [],
        a,
      ),
      s = [],
      u = (f) => {
        f &&
          (this.isSupportedCode(f)
            ? s.push(f)
            : this.logger.warn(
                `rejecting language code not found in supportedLngs: ${f}`,
              ));
      };
    return (
      De(a) && (a.includes("-") || a.includes("_"))
        ? (this.options.load !== "languageOnly" &&
            u(this.formatLanguageCode(a)),
          this.options.load !== "languageOnly" &&
            this.options.load !== "currentOnly" &&
            u(this.getScriptPartFromCode(a)),
          this.options.load !== "currentOnly" &&
            u(this.getLanguagePartFromCode(a)))
        : De(a) && u(this.formatLanguageCode(a)),
      l.forEach((f) => {
        s.includes(f) || u(this.formatLanguageCode(f));
      }),
      s
    );
  }
}
const bv = { zero: 0, one: 1, two: 2, few: 3, many: 4, other: 5 },
  Sv = {
    select: (t) => (t === 1 ? "one" : "other"),
    resolvedOptions: () => ({ pluralCategories: ["one", "other"] }),
  };
class hC {
  constructor(a, r = {}) {
    ((this.languageUtils = a),
      (this.options = r),
      (this.logger = ia.create("pluralResolver")),
      (this.pluralRulesCache = {}));
  }
  clearCache() {
    this.pluralRulesCache = {};
  }
  getRule(a, r = {}) {
    const l = wo(a === "dev" ? "en" : a),
      s = r.ordinal ? "ordinal" : "cardinal",
      u = JSON.stringify({ cleanedCode: l, type: s });
    if (u in this.pluralRulesCache) return this.pluralRulesCache[u];
    let f;
    try {
      f = new Intl.PluralRules(l, { type: s });
    } catch {
      if (typeof Intl > "u")
        return (
          this.logger.error("No Intl support, please use an Intl polyfill!"),
          Sv
        );
      if (!a.match(/-|_/)) return Sv;
      const h = this.languageUtils.getLanguagePartFromCode(a);
      f = this.getRule(h, r);
    }
    return ((this.pluralRulesCache[u] = f), f);
  }
  needsPlural(a, r = {}) {
    let l = this.getRule(a, r);
    return (
      l || (l = this.getRule("dev", r)),
      (l == null ? void 0 : l.resolvedOptions().pluralCategories.length) > 1
    );
  }
  getPluralFormsOfKey(a, r, l = {}) {
    return this.getSuffixes(a, l).map((s) => `${r}${s}`);
  }
  getSuffixes(a, r = {}) {
    let l = this.getRule(a, r);
    return (
      l || (l = this.getRule("dev", r)),
      l
        ? l
            .resolvedOptions()
            .pluralCategories.sort((s, u) => bv[s] - bv[u])
            .map(
              (s) =>
                `${this.options.prepend}${r.ordinal ? `ordinal${this.options.prepend}` : ""}${s}`,
            )
        : []
    );
  }
  getSuffix(a, r, l = {}) {
    const s = this.getRule(a, l);
    return s
      ? `${this.options.prepend}${l.ordinal ? `ordinal${this.options.prepend}` : ""}${s.select(r)}`
      : (this.logger.warn(`no plural rule found for: ${a}`),
        this.getSuffix("dev", r, l));
  }
}
const Ev = (t, a, r, l = ".", s = !0) => {
    let u = iC(t, a, r);
    return (
      !u &&
        s &&
        De(r) &&
        ((u = tp(t, r, l)), u === void 0 && (u = tp(a, r, l))),
      u
    );
  },
  vd = (t) => t.replace(/\$/g, "$$$$");
class _v {
  constructor(a = {}) {
    var r;
    ((this.logger = ia.create("interpolator")),
      (this.options = a),
      (this.format =
        ((r = a == null ? void 0 : a.interpolation) == null
          ? void 0
          : r.format) || ((l) => l)),
      this.init(a));
  }
  init(a = {}) {
    a.interpolation || (a.interpolation = { escapeValue: !0 });
    const {
      escape: r,
      escapeValue: l,
      useRawValueToEscape: s,
      prefix: u,
      prefixEscaped: f,
      suffix: p,
      suffixEscaped: h,
      formatSeparator: g,
      unescapeSuffix: y,
      unescapePrefix: v,
      nestingPrefix: E,
      nestingPrefixEscaped: w,
      nestingSuffix: S,
      nestingSuffixEscaped: b,
      nestingOptionsSeparator: O,
      maxReplaces: k,
      alwaysFormat: L,
    } = a.interpolation;
    ((this.escape = r !== void 0 ? r : oC),
      (this.escapeValue = l !== void 0 ? l : !0),
      (this.useRawValueToEscape = s !== void 0 ? s : !1),
      (this.prefix = u ? ka(u) : f || "{{"),
      (this.suffix = p ? ka(p) : h || "}}"),
      (this.formatSeparator = g || ","),
      (this.unescapePrefix = y ? "" : v ? ka(v) : "-"),
      (this.unescapeSuffix = this.unescapePrefix ? "" : y ? ka(y) : ""),
      (this.nestingPrefix = E ? ka(E) : w || ka("$t(")),
      (this.nestingSuffix = S ? ka(S) : b || ka(")")),
      (this.nestingOptionsSeparator = O || ","),
      (this.maxReplaces = k || 1e3),
      (this.alwaysFormat = L !== void 0 ? L : !1),
      this.resetRegExp());
  }
  reset() {
    this.options && this.init(this.options);
  }
  resetRegExp() {
    const a = (r, l) =>
      (r == null ? void 0 : r.source) === l
        ? ((r.lastIndex = 0), r)
        : new RegExp(l, "g");
    ((this.regexp = a(this.regexp, `${this.prefix}(.+?)${this.suffix}`)),
      (this.regexpUnescape = a(
        this.regexpUnescape,
        `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`,
      )),
      (this.nestingRegexp = a(
        this.nestingRegexp,
        `${this.nestingPrefix}((?:[^()"']+|"[^"]*"|'[^']*'|\\((?:[^()]|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`,
      )));
  }
  interpolate(a, r, l, s) {
    var w;
    let u, f, p;
    const h =
        (this.options &&
          this.options.interpolation &&
          this.options.interpolation.defaultVariables) ||
        {},
      g = (S) => {
        if (!S.includes(this.formatSeparator)) {
          const L = Ev(
            r,
            h,
            S,
            this.options.keySeparator,
            this.options.ignoreJSONStructure,
          );
          return this.alwaysFormat
            ? this.format(L, void 0, l, { ...s, ...r, interpolationkey: S })
            : L;
        }
        const b = S.split(this.formatSeparator),
          O = b.shift().trim(),
          k = b.join(this.formatSeparator).trim();
        return this.format(
          Ev(
            r,
            h,
            O,
            this.options.keySeparator,
            this.options.ignoreJSONStructure,
          ),
          k,
          l,
          { ...s, ...r, interpolationkey: O },
        );
      };
    (this.resetRegExp(),
      !this.escapeValue &&
        typeof a == "string" &&
        /\$t\([^)]*\{[^}]*\{\{/.test(a) &&
        this.logger.warn(
          "nesting options string contains interpolated variables with escapeValue: false — if any of those values are attacker-controlled they can inject additional nesting options (e.g. redirect lng/ns). Sanitise untrusted input before passing it to t(), or keep escapeValue: true.",
        ));
    const y =
        (s == null ? void 0 : s.missingInterpolationHandler) ||
        this.options.missingInterpolationHandler,
      v =
        ((w = s == null ? void 0 : s.interpolation) == null
          ? void 0
          : w.skipOnVariables) !== void 0
          ? s.interpolation.skipOnVariables
          : this.options.interpolation.skipOnVariables;
    return (
      [
        { regex: this.regexpUnescape, safeValue: (S) => vd(S) },
        {
          regex: this.regexp,
          safeValue: (S) => (this.escapeValue ? vd(this.escape(S)) : vd(S)),
        },
      ].forEach((S) => {
        for (p = 0; (u = S.regex.exec(a)); ) {
          const b = u[1].trim();
          if (((f = g(b)), f === void 0))
            if (typeof y == "function") {
              const k = y(a, u, s);
              f = De(k) ? k : "";
            } else if (s && Object.prototype.hasOwnProperty.call(s, b)) f = "";
            else if (v) {
              f = u[0];
              continue;
            } else
              (this.logger.warn(
                `missed to pass in variable ${b} for interpolating ${a}`,
              ),
                (f = ""));
          else !De(f) && !this.useRawValueToEscape && (f = pv(f));
          const O = S.safeValue(f);
          if (
            ((a = a.replace(u[0], O)),
            v
              ? ((S.regex.lastIndex += f.length),
                (S.regex.lastIndex -= u[0].length))
              : (S.regex.lastIndex = 0),
            p++,
            p >= this.maxReplaces)
          )
            break;
        }
      }),
      a
    );
  }
  nest(a, r, l = {}) {
    let s, u, f;
    const p = (h, g) => {
      const y = this.nestingOptionsSeparator;
      if (!h.includes(y)) return h;
      const v = h.split(new RegExp(`${ka(y)}[ ]*{`));
      let E = `{${v[1]}`;
      ((h = v[0]), (E = this.interpolate(E, f)));
      const w = E.match(/'/g),
        S = E.match(/"/g);
      ((((w == null ? void 0 : w.length) ?? 0) % 2 === 0 && !S) ||
        ((S == null ? void 0 : S.length) ?? 0) % 2 !== 0) &&
        (E = E.replace(/'/g, '"'));
      try {
        ((f = JSON.parse(E)), g && (f = { ...g, ...f }));
      } catch (b) {
        return (
          this.logger.warn(
            `failed parsing options string in nesting for key ${h}`,
            b,
          ),
          `${h}${y}${E}`
        );
      }
      return (
        f.defaultValue &&
          f.defaultValue.includes(this.prefix) &&
          delete f.defaultValue,
        h
      );
    };
    for (; (s = this.nestingRegexp.exec(a)); ) {
      let h = [];
      ((f = { ...l }),
        (f = f.replace && !De(f.replace) ? f.replace : f),
        (f.applyPostProcessor = !1),
        delete f.defaultValue);
      const g = /{.*}/.test(s[1])
        ? s[1].lastIndexOf("}") + 1
        : s[1].indexOf(this.formatSeparator);
      if (
        (g !== -1 &&
          ((h = s[1]
            .slice(g)
            .split(this.formatSeparator)
            .map((y) => y.trim())
            .filter(Boolean)),
          (s[1] = s[1].slice(0, g))),
        (u = r(p.call(this, s[1].trim(), f), f)),
        u && s[0] === a && !De(u))
      )
        return u;
      (De(u) || (u = pv(u)),
        u ||
          (this.logger.warn(`missed to resolve ${s[1]} for nesting ${a}`),
          (u = "")),
        h.length &&
          (u = h.reduce(
            (y, v) =>
              this.format(y, v, l.lng, { ...l, interpolationkey: s[1].trim() }),
            u.trim(),
          )),
        (a = a.replace(s[0], u)),
        (this.regexp.lastIndex = 0));
    }
    return a;
  }
}
const gC = (t) => {
    let a = t.toLowerCase().trim();
    const r = {};
    if (t.includes("(")) {
      const l = t.split("(");
      a = l[0].toLowerCase().trim();
      const s = l[1].slice(0, -1);
      a === "currency" && !s.includes(":")
        ? r.currency || (r.currency = s.trim())
        : a === "relativetime" && !s.includes(":")
          ? r.range || (r.range = s.trim())
          : s.split(";").forEach((f) => {
              if (f) {
                const [p, ...h] = f.split(":"),
                  g = h
                    .join(":")
                    .trim()
                    .replace(/^'+|'+$/g, ""),
                  y = p.trim();
                (r[y] || (r[y] = g),
                  g === "false" && (r[y] = !1),
                  g === "true" && (r[y] = !0),
                  isNaN(g) || (r[y] = parseInt(g, 10)));
              }
            });
    }
    return { formatName: a, formatOptions: r };
  },
  wv = (t) => {
    const a = {};
    return (r, l, s) => {
      let u = s;
      s &&
        s.interpolationkey &&
        s.formatParams &&
        s.formatParams[s.interpolationkey] &&
        s[s.interpolationkey] &&
        (u = { ...u, [s.interpolationkey]: void 0 });
      const f = l + JSON.stringify(u);
      let p = a[f];
      return (p || ((p = t(wo(l), s)), (a[f] = p)), p(r));
    };
  },
  yC = (t) => (a, r, l) => t(wo(r), l)(a);
class mC {
  constructor(a = {}) {
    ((this.logger = ia.create("formatter")), (this.options = a), this.init(a));
  }
  init(a, r = { interpolation: {} }) {
    this.formatSeparator = r.interpolation.formatSeparator || ",";
    const l = r.cacheInBuiltFormats ? wv : yC;
    this.formats = {
      number: l((s, u) => {
        const f = new Intl.NumberFormat(s, { ...u });
        return (p) => f.format(p);
      }),
      currency: l((s, u) => {
        const f = new Intl.NumberFormat(s, { ...u, style: "currency" });
        return (p) => f.format(p);
      }),
      datetime: l((s, u) => {
        const f = new Intl.DateTimeFormat(s, { ...u });
        return (p) => f.format(p);
      }),
      relativetime: l((s, u) => {
        const f = new Intl.RelativeTimeFormat(s, { ...u });
        return (p) => f.format(p, u.range || "day");
      }),
      list: l((s, u) => {
        const f = new Intl.ListFormat(s, { ...u });
        return (p) => f.format(p);
      }),
    };
  }
  add(a, r) {
    this.formats[a.toLowerCase().trim()] = r;
  }
  addCached(a, r) {
    this.formats[a.toLowerCase().trim()] = wv(r);
  }
  format(a, r, l, s = {}) {
    if (!r || a == null) return a;
    const u = r.split(this.formatSeparator),
      f = [];
    for (let h = 0; h < u.length; h++) {
      let g = u[h];
      for (; g.indexOf("(") > -1 && !g.includes(")") && h + 1 < u.length; )
        g = `${g}${this.formatSeparator}${u[++h]}`;
      f.push(g);
    }
    return f.reduce((h, g) => {
      var E;
      const { formatName: y, formatOptions: v } = gC(g);
      if (this.formats[y]) {
        let w = h;
        try {
          const S =
              ((E = s == null ? void 0 : s.formatParams) == null
                ? void 0
                : E[s.interpolationkey]) || {},
            b = S.locale || S.lng || s.locale || s.lng || l;
          w = this.formats[y](h, b, { ...v, ...s, ...S });
        } catch (S) {
          this.logger.warn(S);
        }
        return w;
      } else this.logger.warn(`there was no format function for ${y}`);
      return h;
    }, a);
  }
}
const vC = (t, a) => {
  t.pending[a] !== void 0 && (delete t.pending[a], t.pendingCount--);
};
class bC extends Iu {
  constructor(a, r, l, s = {}) {
    var u, f;
    (super(),
      (this.backend = a),
      (this.store = r),
      (this.services = l),
      (this.languageUtils = l.languageUtils),
      (this.options = s),
      (this.logger = ia.create("backendConnector")),
      (this.waitingReads = []),
      (this.maxParallelReads = s.maxParallelReads || 10),
      (this.readingCalls = 0),
      (this.maxRetries = s.maxRetries >= 0 ? s.maxRetries : 5),
      (this.retryTimeout = s.retryTimeout >= 1 ? s.retryTimeout : 350),
      (this.state = {}),
      (this.queue = []),
      (f = (u = this.backend) == null ? void 0 : u.init) == null ||
        f.call(u, l, s.backend, s));
  }
  queueLoad(a, r, l, s) {
    const u = {},
      f = {},
      p = {},
      h = {};
    return (
      a.forEach((g) => {
        let y = !0;
        (r.forEach((v) => {
          const E = `${g}|${v}`;
          !l.reload && this.store.hasResourceBundle(g, v)
            ? (this.state[E] = 2)
            : this.state[E] < 0 ||
              (this.state[E] === 1
                ? f[E] === void 0 && (f[E] = !0)
                : ((this.state[E] = 1),
                  (y = !1),
                  f[E] === void 0 && (f[E] = !0),
                  u[E] === void 0 && (u[E] = !0),
                  h[v] === void 0 && (h[v] = !0)));
        }),
          y || (p[g] = !0));
      }),
      (Object.keys(u).length || Object.keys(f).length) &&
        this.queue.push({
          pending: f,
          pendingCount: Object.keys(f).length,
          loaded: {},
          errors: [],
          callback: s,
        }),
      {
        toLoad: Object.keys(u),
        pending: Object.keys(f),
        toLoadLanguages: Object.keys(p),
        toLoadNamespaces: Object.keys(h),
      }
    );
  }
  loaded(a, r, l) {
    const s = a.split("|"),
      u = s[0],
      f = s[1];
    (r && this.emit("failedLoading", u, f, r),
      !r &&
        l &&
        this.store.addResourceBundle(u, f, l, void 0, void 0, { skipCopy: !0 }),
      (this.state[a] = r ? -1 : 2),
      r && l && (this.state[a] = 0));
    const p = {};
    (this.queue.forEach((h) => {
      (rC(h.loaded, [u], f),
        vC(h, a),
        r && h.errors.push(r),
        h.pendingCount === 0 &&
          !h.done &&
          (Object.keys(h.loaded).forEach((g) => {
            p[g] || (p[g] = {});
            const y = h.loaded[g];
            y.length &&
              y.forEach((v) => {
                p[g][v] === void 0 && (p[g][v] = !0);
              });
          }),
          (h.done = !0),
          h.errors.length ? h.callback(h.errors) : h.callback()));
    }),
      this.emit("loaded", p),
      (this.queue = this.queue.filter((h) => !h.done)));
  }
  read(a, r, l, s = 0, u = this.retryTimeout, f) {
    if (!a.length) return f(null, {});
    if (this.readingCalls >= this.maxParallelReads) {
      this.waitingReads.push({
        lng: a,
        ns: r,
        fcName: l,
        tried: s,
        wait: u,
        callback: f,
      });
      return;
    }
    this.readingCalls++;
    const p = (g, y) => {
        if ((this.readingCalls--, this.waitingReads.length > 0)) {
          const v = this.waitingReads.shift();
          this.read(v.lng, v.ns, v.fcName, v.tried, v.wait, v.callback);
        }
        if (g && y && s < this.maxRetries) {
          setTimeout(() => {
            this.read(a, r, l, s + 1, u * 2, f);
          }, u);
          return;
        }
        f(g, y);
      },
      h = this.backend[l].bind(this.backend);
    if (h.length === 2) {
      try {
        const g = h(a, r);
        g && typeof g.then == "function"
          ? g.then((y) => p(null, y)).catch(p)
          : p(null, g);
      } catch (g) {
        p(g);
      }
      return;
    }
    return h(a, r, p);
  }
  prepareLoading(a, r, l = {}, s) {
    if (!this.backend)
      return (
        this.logger.warn(
          "No backend was added via i18next.use. Will not load resources.",
        ),
        s && s()
      );
    (De(a) && (a = this.languageUtils.toResolveHierarchy(a)),
      De(r) && (r = [r]));
    const u = this.queueLoad(a, r, l, s);
    if (!u.toLoad.length) return (u.pending.length || s(), null);
    u.toLoad.forEach((f) => {
      this.loadOne(f);
    });
  }
  load(a, r, l) {
    this.prepareLoading(a, r, {}, l);
  }
  reload(a, r, l) {
    this.prepareLoading(a, r, { reload: !0 }, l);
  }
  loadOne(a, r = "") {
    const l = a.split("|"),
      s = l[0],
      u = l[1];
    this.read(s, u, "read", void 0, void 0, (f, p) => {
      (f &&
        this.logger.warn(
          `${r}loading namespace ${u} for language ${s} failed`,
          f,
        ),
        !f &&
          p &&
          this.logger.log(`${r}loaded namespace ${u} for language ${s}`, p),
        this.loaded(a, f, p));
    });
  }
  saveMissing(a, r, l, s, u, f = {}, p = () => {}) {
    var h, g, y, v, E;
    if (
      (g = (h = this.services) == null ? void 0 : h.utils) != null &&
      g.hasLoadedNamespace &&
      !(
        (v = (y = this.services) == null ? void 0 : y.utils) != null &&
        v.hasLoadedNamespace(r)
      )
    ) {
      this.logger.warn(
        `did not save key "${l}" as the namespace "${r}" was not yet loaded`,
        "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!",
      );
      return;
    }
    if (!(l == null || l === "")) {
      if ((E = this.backend) != null && E.create) {
        const w = { ...f, isUpdate: u },
          S = this.backend.create.bind(this.backend);
        if (S.length < 6)
          try {
            let b;
            (S.length === 5 ? (b = S(a, r, l, s, w)) : (b = S(a, r, l, s)),
              b && typeof b.then == "function"
                ? b.then((O) => p(null, O)).catch(p)
                : p(null, b));
          } catch (b) {
            p(b);
          }
        else S(a, r, l, s, p, w);
      }
      !a || !a[0] || this.store.addResource(a[0], r, l, s);
    }
  }
}
const bd = () => ({
    debug: !1,
    initAsync: !0,
    ns: ["translation"],
    defaultNS: ["translation"],
    fallbackLng: ["dev"],
    fallbackNS: !1,
    supportedLngs: !1,
    nonExplicitSupportedLngs: !1,
    load: "all",
    preload: !1,
    keySeparator: ".",
    nsSeparator: ":",
    pluralSeparator: "_",
    contextSeparator: "_",
    enableSelector: !1,
    partialBundledLanguages: !1,
    saveMissing: !1,
    updateMissing: !1,
    saveMissingTo: "fallback",
    saveMissingPlurals: !0,
    missingKeyHandler: !1,
    missingInterpolationHandler: !1,
    postProcess: !1,
    postProcessPassResolved: !1,
    returnNull: !1,
    returnEmptyString: !0,
    returnObjects: !1,
    joinArrays: !1,
    returnedObjectHandler: !1,
    parseMissingKeyHandler: !1,
    appendNamespaceToMissingKey: !1,
    appendNamespaceToCIMode: !1,
    overloadTranslationOptionHandler: (t) => {
      let a = {};
      if (
        (typeof t[1] == "object" && (a = t[1]),
        De(t[1]) && (a.defaultValue = t[1]),
        De(t[2]) && (a.tDescription = t[2]),
        typeof t[2] == "object" || typeof t[3] == "object")
      ) {
        const r = t[3] || t[2];
        Object.keys(r).forEach((l) => {
          a[l] = r[l];
        });
      }
      return a;
    },
    interpolation: {
      escapeValue: !0,
      prefix: "{{",
      suffix: "}}",
      formatSeparator: ",",
      unescapePrefix: "-",
      nestingPrefix: "$t(",
      nestingSuffix: ")",
      nestingOptionsSeparator: ",",
      maxReplaces: 1e3,
      skipOnVariables: !0,
    },
    cacheInBuiltFormats: !0,
  }),
  Ov = (t) => (
    De(t.ns) && (t.ns = [t.ns]),
    De(t.fallbackLng) && (t.fallbackLng = [t.fallbackLng]),
    De(t.fallbackNS) && (t.fallbackNS = [t.fallbackNS]),
    t.supportedLngs &&
      !t.supportedLngs.includes("cimode") &&
      (t.supportedLngs = t.supportedLngs.concat(["cimode"])),
    t
  ),
  Qs = () => {},
  SC = (t) => {
    Object.getOwnPropertyNames(Object.getPrototypeOf(t)).forEach((r) => {
      typeof t[r] == "function" && (t[r] = t[r].bind(t));
    });
  };
class mo extends Iu {
  constructor(a = {}, r) {
    if (
      (super(),
      (this.options = Ov(a)),
      (this.services = {}),
      (this.logger = ia),
      (this.modules = { external: [] }),
      SC(this),
      r && !this.isInitialized && !a.isClone)
    ) {
      if (!this.options.initAsync) return (this.init(a, r), this);
      setTimeout(() => {
        this.init(a, r);
      }, 0);
    }
  }
  init(a = {}, r) {
    ((this.isInitializing = !0),
      typeof a == "function" && ((r = a), (a = {})),
      a.defaultNS == null &&
        a.ns &&
        (De(a.ns)
          ? (a.defaultNS = a.ns)
          : a.ns.includes("translation") || (a.defaultNS = a.ns[0])));
    const l = bd();
    ((this.options = { ...l, ...this.options, ...Ov(a) }),
      (this.options.interpolation = {
        ...l.interpolation,
        ...this.options.interpolation,
      }),
      a.keySeparator !== void 0 &&
        (this.options.userDefinedKeySeparator = a.keySeparator),
      a.nsSeparator !== void 0 &&
        (this.options.userDefinedNsSeparator = a.nsSeparator),
      typeof this.options.overloadTranslationOptionHandler != "function" &&
        (this.options.overloadTranslationOptionHandler =
          l.overloadTranslationOptionHandler));
    const s = (g) => (g ? (typeof g == "function" ? new g() : g) : null);
    if (!this.options.isClone) {
      this.modules.logger
        ? ia.init(s(this.modules.logger), this.options)
        : ia.init(null, this.options);
      let g;
      this.modules.formatter ? (g = this.modules.formatter) : (g = mC);
      const y = new vv(this.options);
      this.store = new mv(this.options.resources, this.options);
      const v = this.services;
      ((v.logger = ia),
        (v.resourceStore = this.store),
        (v.languageUtils = y),
        (v.pluralResolver = new hC(y, {
          prepend: this.options.pluralSeparator,
        })),
        g &&
          ((v.formatter = s(g)),
          v.formatter.init && v.formatter.init(v, this.options),
          (this.options.interpolation.format = v.formatter.format.bind(
            v.formatter,
          ))),
        (v.interpolator = new _v(this.options)),
        (v.utils = { hasLoadedNamespace: this.hasLoadedNamespace.bind(this) }),
        (v.backendConnector = new bC(
          s(this.modules.backend),
          v.resourceStore,
          v,
          this.options,
        )),
        v.backendConnector.on("*", (E, ...w) => {
          this.emit(E, ...w);
        }),
        this.modules.languageDetector &&
          ((v.languageDetector = s(this.modules.languageDetector)),
          v.languageDetector.init &&
            v.languageDetector.init(v, this.options.detection, this.options)),
        this.modules.i18nFormat &&
          ((v.i18nFormat = s(this.modules.i18nFormat)),
          v.i18nFormat.init && v.i18nFormat.init(this)),
        (this.translator = new Ou(this.services, this.options)),
        this.translator.on("*", (E, ...w) => {
          this.emit(E, ...w);
        }),
        this.modules.external.forEach((E) => {
          E.init && E.init(this);
        }));
    }
    if (
      ((this.format = this.options.interpolation.format),
      r || (r = Qs),
      this.options.fallbackLng &&
        !this.services.languageDetector &&
        !this.options.lng)
    ) {
      const g = this.services.languageUtils.getFallbackCodes(
        this.options.fallbackLng,
      );
      g.length > 0 && g[0] !== "dev" && (this.options.lng = g[0]);
    }
    (!this.services.languageDetector &&
      !this.options.lng &&
      this.logger.warn(
        "init: no languageDetector is used and no lng is defined",
      ),
      [
        "getResource",
        "hasResourceBundle",
        "getResourceBundle",
        "getDataByLanguage",
      ].forEach((g) => {
        this[g] = (...y) => this.store[g](...y);
      }),
      [
        "addResource",
        "addResources",
        "addResourceBundle",
        "removeResourceBundle",
      ].forEach((g) => {
        this[g] = (...y) => (this.store[g](...y), this);
      }));
    const p = lo(),
      h = () => {
        const g = (y, v) => {
          ((this.isInitializing = !1),
            this.isInitialized &&
              !this.initializedStoreOnce &&
              this.logger.warn(
                "init: i18next is already initialized. You should call init just once!",
              ),
            (this.isInitialized = !0),
            this.options.isClone ||
              this.logger.log("initialized", this.options),
            this.emit("initialized", this.options),
            p.resolve(v),
            r(y, v));
        };
        if (
          (this.languages || this.isLanguageChangingTo) &&
          !this.isInitialized
        )
          return g(null, this.t.bind(this));
        this.changeLanguage(this.options.lng, g);
      };
    return (
      this.options.resources || !this.options.initAsync
        ? h()
        : setTimeout(h, 0),
      p
    );
  }
  loadResources(a, r = Qs) {
    var u, f;
    let l = r;
    const s = De(a) ? a : this.language;
    if (
      (typeof a == "function" && (l = a),
      !this.options.resources || this.options.partialBundledLanguages)
    ) {
      if (
        (s == null ? void 0 : s.toLowerCase()) === "cimode" &&
        (!this.options.preload || this.options.preload.length === 0)
      )
        return l();
      const p = [],
        h = (g) => {
          if (!g || g === "cimode") return;
          this.services.languageUtils.toResolveHierarchy(g).forEach((v) => {
            v !== "cimode" && (p.includes(v) || p.push(v));
          });
        };
      (s
        ? h(s)
        : this.services.languageUtils
            .getFallbackCodes(this.options.fallbackLng)
            .forEach((y) => h(y)),
        (f = (u = this.options.preload) == null ? void 0 : u.forEach) == null ||
          f.call(u, (g) => h(g)),
        this.services.backendConnector.load(p, this.options.ns, (g) => {
          (!g &&
            !this.resolvedLanguage &&
            this.language &&
            this.setResolvedLanguage(this.language),
            l(g));
        }));
    } else l(null);
  }
  reloadResources(a, r, l) {
    const s = lo();
    return (
      typeof a == "function" && ((l = a), (a = void 0)),
      typeof r == "function" && ((l = r), (r = void 0)),
      a || (a = this.languages),
      r || (r = this.options.ns),
      l || (l = Qs),
      this.services.backendConnector.reload(a, r, (u) => {
        (s.resolve(), l(u));
      }),
      s
    );
  }
  use(a) {
    if (!a)
      throw new Error(
        "You are passing an undefined module! Please check the object you are passing to i18next.use()",
      );
    if (!a.type)
      throw new Error(
        "You are passing a wrong module! Please check the object you are passing to i18next.use()",
      );
    return (
      a.type === "backend" && (this.modules.backend = a),
      (a.type === "logger" || (a.log && a.warn && a.error)) &&
        (this.modules.logger = a),
      a.type === "languageDetector" && (this.modules.languageDetector = a),
      a.type === "i18nFormat" && (this.modules.i18nFormat = a),
      a.type === "postProcessor" && h0.addPostProcessor(a),
      a.type === "formatter" && (this.modules.formatter = a),
      a.type === "3rdParty" && this.modules.external.push(a),
      this
    );
  }
  setResolvedLanguage(a) {
    if (!(!a || !this.languages) && !["cimode", "dev"].includes(a)) {
      for (let r = 0; r < this.languages.length; r++) {
        const l = this.languages[r];
        if (
          !["cimode", "dev"].includes(l) &&
          this.store.hasLanguageSomeTranslations(l)
        ) {
          this.resolvedLanguage = l;
          break;
        }
      }
      !this.resolvedLanguage &&
        !this.languages.includes(a) &&
        this.store.hasLanguageSomeTranslations(a) &&
        ((this.resolvedLanguage = a), this.languages.unshift(a));
    }
  }
  changeLanguage(a, r) {
    this.isLanguageChangingTo = a;
    const l = lo();
    this.emit("languageChanging", a);
    const s = (p) => {
        ((this.language = p),
          (this.languages = this.services.languageUtils.toResolveHierarchy(p)),
          (this.resolvedLanguage = void 0),
          this.setResolvedLanguage(p));
      },
      u = (p, h) => {
        (h
          ? this.isLanguageChangingTo === a &&
            (s(h),
            this.translator.changeLanguage(h),
            (this.isLanguageChangingTo = void 0),
            this.emit("languageChanged", h),
            this.logger.log("languageChanged", h))
          : (this.isLanguageChangingTo = void 0),
          l.resolve((...g) => this.t(...g)),
          r && r(p, (...g) => this.t(...g)));
      },
      f = (p) => {
        var y, v;
        !a && !p && this.services.languageDetector && (p = []);
        const h = De(p) ? p : p && p[0],
          g = this.store.hasLanguageSomeTranslations(h)
            ? h
            : this.services.languageUtils.getBestMatchFromCodes(
                De(p) ? [p] : p,
              );
        (g &&
          (this.language || s(g),
          this.translator.language || this.translator.changeLanguage(g),
          (v =
            (y = this.services.languageDetector) == null
              ? void 0
              : y.cacheUserLanguage) == null || v.call(y, g)),
          this.loadResources(g, (E) => {
            u(E, g);
          }));
      };
    return (
      !a &&
      this.services.languageDetector &&
      !this.services.languageDetector.async
        ? f(this.services.languageDetector.detect())
        : !a &&
            this.services.languageDetector &&
            this.services.languageDetector.async
          ? this.services.languageDetector.detect.length === 0
            ? this.services.languageDetector.detect().then(f)
            : this.services.languageDetector.detect(f)
          : f(a),
      l
    );
  }
  getFixedT(a, r, l, s) {
    const u = s == null ? void 0 : s.scopeNs,
      f = (p, h, ...g) => {
        let y;
        (typeof h != "object"
          ? (y = this.options.overloadTranslationOptionHandler(
              [p, h].concat(g),
            ))
          : (y = { ...h }),
          (y.lng = y.lng || f.lng),
          (y.lngs = y.lngs || f.lngs));
        const v = y.ns !== void 0 && y.ns !== null;
        ((y.ns = y.ns || f.ns),
          y.keyPrefix !== "" &&
            (y.keyPrefix = y.keyPrefix || l || f.keyPrefix));
        const E = { ...this.options, ...y };
        (Array.isArray(u) && !v && (E.ns = u),
          typeof y.keyPrefix == "function" &&
            (y.keyPrefix = Yi(y.keyPrefix, E)));
        const w = this.options.keySeparator || ".";
        let S;
        return (
          y.keyPrefix && Array.isArray(p)
            ? (S = p.map(
                (b) => (
                  typeof b == "function" && (b = Yi(b, E)),
                  `${y.keyPrefix}${w}${b}`
                ),
              ))
            : (typeof p == "function" && (p = Yi(p, E)),
              (S = y.keyPrefix ? `${y.keyPrefix}${w}${p}` : p)),
          this.t(S, y)
        );
      };
    return (
      De(a) ? (f.lng = a) : (f.lngs = a),
      (f.ns = r),
      (f.keyPrefix = l),
      f
    );
  }
  t(...a) {
    var r;
    return (r = this.translator) == null ? void 0 : r.translate(...a);
  }
  exists(...a) {
    var r;
    return (r = this.translator) == null ? void 0 : r.exists(...a);
  }
  setDefaultNamespace(a) {
    this.options.defaultNS = a;
  }
  hasLoadedNamespace(a, r = {}) {
    if (!this.isInitialized)
      return (
        this.logger.warn(
          "hasLoadedNamespace: i18next was not initialized",
          this.languages,
        ),
        !1
      );
    if (!this.languages || !this.languages.length)
      return (
        this.logger.warn(
          "hasLoadedNamespace: i18n.languages were undefined or empty",
          this.languages,
        ),
        !1
      );
    const l = r.lng || this.resolvedLanguage || this.languages[0],
      s = this.options ? this.options.fallbackLng : !1,
      u = this.languages[this.languages.length - 1];
    if (l.toLowerCase() === "cimode") return !0;
    const f = (p, h) => {
      const g = this.services.backendConnector.state[`${p}|${h}`];
      return g === -1 || g === 0 || g === 2;
    };
    if (r.precheck) {
      const p = r.precheck(this, f);
      if (p !== void 0) return p;
    }
    return !!(
      this.hasResourceBundle(l, a) ||
      !this.services.backendConnector.backend ||
      (this.options.resources && !this.options.partialBundledLanguages) ||
      (f(l, a) && (!s || f(u, a)))
    );
  }
  loadNamespaces(a, r) {
    const l = lo();
    return this.options.ns
      ? (De(a) && (a = [a]),
        a.forEach((s) => {
          this.options.ns.includes(s) || this.options.ns.push(s);
        }),
        this.loadResources((s) => {
          (l.resolve(), r && r(s));
        }),
        l)
      : (r && r(), Promise.resolve());
  }
  loadLanguages(a, r) {
    const l = lo();
    De(a) && (a = [a]);
    const s = this.options.preload || [],
      u = a.filter(
        (f) => !s.includes(f) && this.services.languageUtils.isSupportedCode(f),
      );
    return u.length
      ? ((this.options.preload = s.concat(u)),
        this.loadResources((f) => {
          (l.resolve(), r && r(f));
        }),
        l)
      : (r && r(), Promise.resolve());
  }
  dir(a) {
    var s, u;
    if (
      (a ||
        (a =
          this.resolvedLanguage ||
          (((s = this.languages) == null ? void 0 : s.length) > 0
            ? this.languages[0]
            : this.language)),
      !a)
    )
      return "rtl";
    try {
      const f = new Intl.Locale(a);
      if (f && f.getTextInfo) {
        const p = f.getTextInfo();
        if (p && p.direction) return p.direction;
      }
    } catch {}
    const r = [
        "ar",
        "shu",
        "sqr",
        "ssh",
        "xaa",
        "yhd",
        "yud",
        "aao",
        "abh",
        "abv",
        "acm",
        "acq",
        "acw",
        "acx",
        "acy",
        "adf",
        "ads",
        "aeb",
        "aec",
        "afb",
        "ajp",
        "apc",
        "apd",
        "arb",
        "arq",
        "ars",
        "ary",
        "arz",
        "auz",
        "avl",
        "ayh",
        "ayl",
        "ayn",
        "ayp",
        "bbz",
        "pga",
        "he",
        "iw",
        "ps",
        "pbt",
        "pbu",
        "pst",
        "prp",
        "prd",
        "ug",
        "ur",
        "ydd",
        "yds",
        "yih",
        "ji",
        "yi",
        "hbo",
        "men",
        "xmn",
        "fa",
        "jpr",
        "peo",
        "pes",
        "prs",
        "dv",
        "sam",
        "ckb",
      ],
      l =
        ((u = this.services) == null ? void 0 : u.languageUtils) ||
        new vv(bd());
    return a.toLowerCase().indexOf("-latn") > 1
      ? "ltr"
      : r.includes(l.getLanguagePartFromCode(a)) ||
          a.toLowerCase().indexOf("-arab") > 1
        ? "rtl"
        : "ltr";
  }
  static createInstance(a = {}, r) {
    const l = new mo(a, r);
    return ((l.createInstance = mo.createInstance), l);
  }
  cloneInstance(a = {}, r = Qs) {
    const l = a.forkResourceStore;
    l && delete a.forkResourceStore;
    const s = { ...this.options, ...a, isClone: !0 },
      u = new mo(s);
    if (
      ((a.debug !== void 0 || a.prefix !== void 0) &&
        (u.logger = u.logger.clone(a)),
      ["store", "services", "language"].forEach((p) => {
        u[p] = this[p];
      }),
      (u.services = { ...this.services }),
      (u.services.utils = { hasLoadedNamespace: u.hasLoadedNamespace.bind(u) }),
      l)
    ) {
      const p = Object.keys(this.store.data).reduce(
        (h, g) => (
          (h[g] = { ...this.store.data[g] }),
          (h[g] = Object.keys(h[g]).reduce(
            (y, v) => ((y[v] = { ...h[g][v] }), y),
            h[g],
          )),
          h
        ),
        {},
      );
      ((u.store = new mv(p, s)), (u.services.resourceStore = u.store));
    }
    if (a.interpolation) {
      const h = {
          ...bd().interpolation,
          ...this.options.interpolation,
          ...a.interpolation,
        },
        g = { ...s, interpolation: h };
      u.services.interpolator = new _v(g);
    }
    return (
      (u.translator = new Ou(u.services, s)),
      u.translator.on("*", (p, ...h) => {
        u.emit(p, ...h);
      }),
      u.init(s, r),
      (u.translator.options = s),
      (u.translator.backendConnector.services.utils = {
        hasLoadedNamespace: u.hasLoadedNamespace.bind(u),
      }),
      u
    );
  }
  toJSON() {
    return {
      options: this.options,
      store: this.store,
      language: this.language,
      languages: this.languages,
      resolvedLanguage: this.resolvedLanguage,
    };
  }
}
const Ht = mo.createInstance();
Ht.createInstance;
Ht.dir;
Ht.init;
Ht.loadResources;
Ht.reloadResources;
Ht.use;
Ht.changeLanguage;
Ht.getFixedT;
Ht.t;
Ht.exists;
Ht.setDefaultNamespace;
Ht.hasLoadedNamespace;
Ht.loadNamespaces;
Ht.loadLanguages;
const EC =
    /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g,
  _C = {
    "&amp;": "&",
    "&#38;": "&",
    "&lt;": "<",
    "&#60;": "<",
    "&gt;": ">",
    "&#62;": ">",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": '"',
    "&#34;": '"',
    "&nbsp;": " ",
    "&#160;": " ",
    "&copy;": "©",
    "&#169;": "©",
    "&reg;": "®",
    "&#174;": "®",
    "&hellip;": "…",
    "&#8230;": "…",
    "&#x2F;": "/",
    "&#47;": "/",
  },
  wC = (t) => _C[t],
  OC = (t) => t.replace(EC, wC);
let xv = {
  bindI18n: "languageChanged",
  bindI18nStore: "",
  transEmptyNodeValue: "",
  transSupportBasicHtmlNodes: !0,
  transWrapTextNodes: "",
  transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
  useSuspense: !0,
  unescape: OC,
  transDefaultProps: void 0,
};
const xC = (t = {}) => {
    xv = { ...xv, ...t };
  },
  CC = {
    type: "3rdParty",
    init(t) {
      xC(t.options.react);
    },
  };
var TC = Object.getOwnPropertyDescriptor,
  AC = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? TC(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  };
const RC = qt("StorageEngine");
let Qi = class {
  constructor() {
    (RC.debug("StorageEngine initialized"),
      (this.getItem = this.getItem.bind(this)),
      (this.setItem = this.setItem.bind(this)),
      (this.getLocalStorageItem = this.getLocalStorageItem.bind(this)),
      (this.getPrefixedKey = this.getPrefixedKey.bind(this)));
  }
  getItem(t, a, r) {
    const l = this.getPrefixedKey(t);
    return a === "localStorage"
      ? this.getLocalStorageItem(l, r)
      : this.getSessionStorageItem(l);
  }
  setItem(t, a, r, l) {
    const s = this.getPrefixedKey(t);
    return r === "localStorage"
      ? this.setLocalStorageItem(s, a, l)
      : this.setSessionStorageItem(s, a);
  }
  clearItem(t, a) {
    const r = this.getPrefixedKey(t);
    return a === "localStorage"
      ? localStorage.removeItem(r)
      : sessionStorage.removeItem(r);
  }
  clearAll() {
    localStorage.clear();
  }
  getPrefixedKey(t) {
    return `kampanykorut_${t}`;
  }
  getKeyWithoutPrefix(t) {
    return t.replace(/^kampanykorut_/, "");
  }
  getLocalStorageItem(t, a) {
    let r = t;
    return (a && (r = `${t}-${a}`), localStorage.getItem(r));
  }
  setLocalStorageItem(t, a, r) {
    let l = t;
    return (r && (l = `${t}-${r}`), localStorage.setItem(l, a));
  }
  getSessionStorageItem(t) {
    return sessionStorage.getItem(t);
  }
  setSessionStorageItem(t, a) {
    return sessionStorage.setItem(t, a);
  }
};
Qi = AC([yr()], Qi);
const kC = {
    newGame: "New Game",
    loadGame: "Load Game",
    modMaker: "Mod Maker",
    settings: "Settings",
    about: "About",
  },
  DC = { classicMode: "Classic mode", campaignMode: "Campaign mode" },
  LC = {
    button: {
      back: "Back",
      save: "Save",
      next: "Next",
      start: "Start Game",
      cancel: "Cancel",
    },
  },
  NC = { advisorFeedback: { label: "Show advisor feedback" } },
  MC = {
    emptyLabel: "No saved game sessions found.",
    button: { load: "Load game" },
  },
  jC = { label: "Select a campaign" },
  zC = {
    party: {
      label: "Select a party",
      dropdown: "Selected party...",
      emptyState:
        "Select a party from the dropdown list — its logo and description will be displayed here.",
    },
    candidate: {
      label: "Select a candidate",
      dropdown: "Select candidate...",
      emptyState: "First select a party, then a candidate.",
    },
    badgeDisplay: {
      label: "Available badges",
      tooltipContent: "Badges for achievements available in this campaign",
    },
  },
  BC = {
    menuBar: {
      summary: "Summary",
      electionMap: "Election map",
      statistics: "Statistics",
      history: "History",
      achivements: "Achivements",
    },
    statistics: {
      menuBar: {
        overview: "Overview",
        districtDetails: "District details",
        turnoutDetails: "Turnout details",
      },
      overview: {
        constituencySeats: "Constituency seats",
        listSeats: "List seats",
        partyListResults: "Party list results",
        biggestVictories: "Biggest victories",
        biggestDefeats: "Biggest defeats",
        closestDistricts: "Closest districts",
        supportTrendLabel: "Trends in support",
      },
      turnoutDetails: {
        nationalTurnout: "National turnout",
        votesCast: "Votes cast",
        turnoutChange: "Change from previous election",
      },
    },
    turnHistory: {
      label: "Turn history",
      historyItem: { day: "Day" },
      turns: "turns",
    },
  },
  UC = {
    save: "Save game",
    laod: "Load game",
    settings: "Settings",
    quit: "Quit game",
    mapMenu: { polls: { menuLabel: "Pollsters", average: "Polling average" } },
    kampanykorut: { campaignSelector: "Campaign selector", restart: "Restart" },
  },
  FC = { label: "Empty slot" },
  IC = { buttons: { confirm: "Confirm" } },
  HC = {
    title: "Attention!",
    description: "Are you sure you want to exit the game?",
  },
  $C = {
    description: "Are you sure you want to restart the current campaign?",
  },
  VC = {
    title: "Campaign selector",
    description: "Are you sure you want to return to the campaign selector?",
  },
  GC = {
    visitDistrict: "Visit district",
    swingFactor: "Swing factor",
    population: "Population",
    k: "K",
    high: "High",
    medium: "Medium",
    low: "Low",
  },
  PC = {
    strategicDecision: {
      label: "Strategic decision",
      tooltip: "Your choice may influence how future questions unfold",
    },
  },
  qC = { buttons: { continue: "Continue", mapView: "Map view" } },
  YC = {
    title: "Advisor feedback",
    buttons: { turnOff: "Turn off advisor insights", ok: "Ok" },
    modal: {
      description: "You won’t receive strategic hints from advisors anymore.",
      buttons: { disable: "Disable" },
    },
  },
  ZC = { settingsUpdated: "Settings updated successfully!" },
  XC = {
    steps: {
      pollingStations: "POLLING STATIONS REPORTING",
      votesCollected: "VOTES COLLECTED",
      votesCounted: "VOTES COUNTED",
      dataVerification: "DATA VERIFICATION",
      resultsCompiled: "RESULTS COMPILED",
    },
    screen: {
      voteCounting: "VOTE COUNTING",
      votesCounted: "Votes are being counted...",
      processedVotes: "Processed Votes",
      pleaseWait: "Please wait",
    },
  },
  KC = {
    title: "Report a bug",
    report: "Report",
    warningText: "You'll need a GitHub account to submit a bug report.",
    palceholder: {
      title: "Briefly describe the problem",
      description: "What happened? What did you expect instead?",
      steps: `1. Go to...
2. Click...
3. See the error...`,
    },
    label: {
      title: "Title",
      description: "Description",
      steps: "Steps to reproduce",
    },
  },
  QC = {
    mainMenu: kC,
    newGameMenu: DC,
    menuList: LC,
    settingsMenu: NC,
    loadSavedGamesMenu: MC,
    gameSelectorMenhu: jC,
    sideSelector: zC,
    endResult: BC,
    gameMenuBar: UC,
    emptySlot: FC,
    modal: IC,
    exitDialog: HC,
    restartDialog: $C,
    campaignSelectorDialog: VC,
    bottomBar: GC,
    badge: PC,
    questionCard: qC,
    advisorFeedback: YC,
    toaster: ZC,
    voteCountingScreen: XC,
    bugReporter: KC,
  },
  JC = {
    newGame: "Új játék",
    loadGame: "Játék betöltése",
    modMaker: "Mod készítő",
    settings: "Beállítások",
    about: "A játékról",
  },
  WC = { classicMode: "Klasszikus mód", campaignMode: "Kampány mód" },
  eT = {
    button: {
      back: "Vissza",
      save: "Mentés",
      next: "Következő",
      start: "Játék elindítása",
      cancel: "Mégsem",
    },
  },
  tT = {
    advisorFeedback: { label: "Tanácsadói visszajelzések megjelenítése" },
  },
  nT = {
    emptyLabel: "Nem található mentett játék.",
    button: { load: "Játék betöltése" },
  },
  aT = { label: "Válassz egy kampányt" },
  rT = {
    party: {
      label: "Válassz egy pártot",
      dropdown: "Választott párt",
      emptyState:
        "Válassz pártot a legördülő listából — itt jelenik meg a párt logója és bemutatása.",
    },
    candidate: {
      label: "Válassz egy jelöltet",
      dropdown: "Választott jelölt",
      emptyState: "Előbb válassz pártot, utána jelöltet.",
    },
    badgeDisplay: {
      label: "Elérhető jelvények",
      tooltipContent: "A kampányhoz tartozó elérhető eredmények jelvényei",
    },
  },
  iT = {
    menuBar: {
      summary: "Összefoglaló",
      electionMap: "Választási térkép",
      statistics: "Statisztikák",
      history: "Előzmények",
      achivements: "Eredmények",
    },
    statistics: {
      menuBar: {
        overview: "Összefoglaló",
        districtDetails: "Körzet részletek",
        turnoutDetails: "Részvételi adatok",
      },
      overview: {
        constituencySeats: "Egyéni mandátumok",
        listSeats: "Listás mandátumok",
        partyListResults: "Pártilistás eredmények",
        biggestVictories: "Legnagyobb győzelmek",
        biggestDefeats: "Legnagyobb vereségek",
        closestDistricts: "Legszorosabb körzetek",
        supportTrendLabel: "Támogatottság alakulása",
      },
      turnoutDetails: {
        nationalTurnout: "Országos részvétel",
        votesCast: "Leadott szavazatok",
        turnoutChange: "Változás előző választáshoz képest",
      },
    },
    turnHistory: {
      label: "Előzmények",
      historyItem: { day: "Nap" },
      turns: "forduló",
    },
  },
  lT = {
    save: "Játék mentése",
    laod: "Játék visszatöltése",
    settings: "Beállítások",
    quit: "Kilépés",
    mapMenu: {
      polls: { menuLabel: "Közvélemény-kutatók", average: "Felmérések átlaga" },
    },
    kampanykorut: {
      campaignSelector: "Kampányválasztó",
      restart: "Újraindítás",
    },
  },
  oT = { label: "Szabad hely" },
  sT = { buttons: { confirm: "Megerősítés" } },
  uT = {
    title: "Figyelem!",
    description: "Biztosan ki akarsz lépni a játékból?",
  },
  cT = { description: "Biztosan újraindítod a jelenlegi kampányt?" },
  fT = {
    title: "Kampányválasztó",
    description: "Biztosan visszatérsz a kampányválasztóhoz?",
  },
  dT = {
    visitDistrict: "Látogass el a körzetbe",
    swingFactor: "Ingadozási tényező",
    population: "Lakosság",
    k: "E",
    high: "Magas",
    medium: "Közepes",
    low: "Alacsony",
  },
  pT = {
    strategicDecision: {
      label: "Stratégiai döntés",
      tooltip: "A választásod hatással lehet a jövőbeli kérdések alakulására",
    },
  },
  hT = { buttons: { continue: "Következő", mapView: "Térképnézet" } },
  gT = {
    title: "Tanácsadói visszajelzés",
    buttons: { turnOff: "Tanácsadói javaslatokat elrejtése", ok: "Rendben" },
    modal: {
      description: "Többé nem kapsz stratégiai tanácsokat a tanácsadóktól.",
      buttons: { disable: "Letiltás" },
    },
  },
  yT = { settingsUpdated: "Beállítások sikeresen frissültek!" },
  mT = {
    steps: {
      pollingStations: "SZAVAZÓKÖRÖK BEÉRKEZÉSE",
      votesCollected: "SZAVAZATOK ÖSSZEGYŰJTÉSE",
      votesCounted: "SZAVAZATOK SZÁMLÁLÁSA",
      dataVerification: "ADATOK ELLENŐRZÉSE",
      resultsCompiled: "EREDMÉNYEK ÖSSZESÍTÉSE",
    },
    screen: {
      voteCounting: "SZAVAZATSZÁMLÁLÁS",
      votesCounted: "A szavazatok összesítése folyamatban van...",
      processedVotes: "Feldolgozott szavazatok",
      pleaseWait: "Kérjük, várjon...",
    },
  },
  vT = {
    title: "Hiba bejelentése",
    report: "Jelentés",
    warningText: "A hibabejelentéshez GitHub-fiókra lesz szükséged.",
    palceholder: {
      title: "Írd le röviden a problémát",
      description: "Mi történt? Mit vártál helyette?",
      steps: `1. Menj oda...
2. Kattints a...
3. Megjelenik a hibaüzenet...`,
    },
    label: {
      title: "Cím",
      description: "Leírás",
      steps: "A hiba reprodukálásának lépései",
    },
  },
  bT = {
    mainMenu: JC,
    newGameMenu: WC,
    menuList: eT,
    settingsMenu: tT,
    loadSavedGamesMenu: nT,
    gameSelectorMenhu: aT,
    sideSelector: rT,
    endResult: iT,
    gameMenuBar: lT,
    emptySlot: oT,
    modal: sT,
    exitDialog: uT,
    restartDialog: cT,
    campaignSelectorDialog: fT,
    bottomBar: dT,
    badge: pT,
    questionCard: hT,
    advisorFeedback: gT,
    toaster: yT,
    voteCountingScreen: mT,
    bugReporter: vT,
  },
  ST = ["en", "hu"],
  y0 = "en",
  m0 = "language";
function ET(t) {
  const a = t.getItem(m0, "localStorage");
  return a && ST.includes(a) ? a : y0;
}
const v0 = Lt.resolve(Qi);
Ht.use(CC).init({
  resources: { en: { translation: QC }, hu: { translation: bT } },
  lng: ET(v0),
  fallbackLng: y0,
  interpolation: { escapeValue: !1 },
});
Ht.on("languageChanged", (t) => {
  v0.setItem(m0, t, "localStorage");
});
function _T(t) {
  Ht.changeLanguage(t);
}
var wT = Object.getOwnPropertyDescriptor,
  OT = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? wT(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  },
  xT = (t, a) => (r, l) => a(r, l, t);
const Cv = qt("SettingsEngine"),
  CT = "en",
  Tv = { showAdvisorFeedback: !0, language: CT };
let xu = class extends tl {
  constructor(t) {
    (Cv.debug("SettingsEngine initialized"),
      super(),
      (this.storage = t),
      this.init());
  }
  init() {
    const t = this.storage.getItem("settings", "localStorage"),
      a = t ? JSON.parse(t) : Tv;
    (Cv.debug("Initializing settings with: ", a), this.updateGameSettings(a));
  }
  getGameSettings() {
    const t = this.storage.getItem("settings", "localStorage");
    return t ? JSON.parse(t) : Tv;
  }
  updateGameSettings(t) {
    const r = { ...this.getGameSettings(), ...t };
    (t.language && _T(t.language),
      this.notify(r),
      this.storage.setItem("settings", JSON.stringify(r), "localStorage"));
  }
};
xu = OT([yr(), xT(0, Pi(Qi))], xu);
var TT = Object.getOwnPropertyDescriptor,
  AT = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? TT(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  };
const b0 = "default-id",
  RT = {
    campaignState: {
      activeCampaignId: b0,
      turn: 0,
      isEnded: !1,
      isBaseResultsAlreadyApplied: !1,
    },
    campaignConfig: null,
    turnDecision: null,
    history: [],
  },
  kT = qt("StateHandler");
let Cu = class extends tl {
  constructor() {
    super();
    Ft(this, "state");
    this.state = structuredClone(RT);
  }
  getState() {
    return this.state;
  }
  get(a) {
    return this.state[a];
  }
  set(a, r) {
    ((this.state[a] = r),
      this.notify(this.state),
      kT.debug("State updated", { key: a, value: r }));
  }
};
Cu = AT([yr()], Cu);
var DT = Object.getOwnPropertyDescriptor,
  LT = (t, a, r, l) => {
    for (
      var s = l > 1 ? void 0 : l ? DT(a, r) : a, u = t.length - 1, f;
      u >= 0;
      u--
    )
      (f = t[u]) && (s = f(s) || s);
    return s;
  };
const Sd = 5,
  Pt = qt("CampaignStateEngine");
let Tu = class extends tl {
  constructor(t, a, r, l, s, u, f) {
    (Pt.debug("CampaignStateEngine initialized"),
      super(),
      (this.gameConfigEngine = t),
      (this.voterEnvironment = a),
      (this.districtGroupEngine = r),
      (this.storage = l),
      (this.generateId = s),
      (this.navigation = u),
      (this.stateHandler = f),
      (this.getCampaignState = this.getCampaignState.bind(this)),
      (this.updateCampaignState = this.updateCampaignState.bind(this)),
      (this.safeStringify = this.safeStringify.bind(this)),
      (this.saveState = this.saveState.bind(this)),
      this.init());
  }
  init(t = !1) {
    if (this.shouldGenerateNewSessionId(t)) {
      const a = this.generateId();
      (Pt.debug("New session ID generated:", a), this.saveSessionId(a));
    }
  }
  getHistory() {
    const t = this.getSessionId(),
      a = this.storage.getItem("turnHistory", "localStorage", t);
    return a ? JSON.parse(a) : null;
  }
  getSavedGameSessions() {
    const t = this.storage.getItem("savedSessions", "localStorage");
    if (!t) return [];
    const a = JSON.parse(t);
    let r = !1;
    const l = a.map((s) => (s.id ? s : ((r = !0), { ...s, id: ep() })));
    return (
      r &&
        this.storage.setItem(
          "savedSessions",
          JSON.stringify(l),
          "localStorage",
        ),
      l
    );
  }
  getSessionSlots() {
    const t = this.getSavedGameSessions();
    return { usedSlots: t, availableSlots: Sd - t.length };
  }
  getCampaignState() {
    const t = this.getSessionId(),
      a = this.storage.getItem("campaignState", "localStorage", t);
    return a ? JSON.parse(a) : null;
  }
  getTurnHistory() {
    const t = this.getSessionId(),
      a = this.storage.getItem("turnHistory", "localStorage", t);
    return a ? JSON.parse(a) : null;
  }
  getSessionId() {
    const a =
      this.chechUrlParams().sessionId ||
      this.storage.getItem("currentSessionId", "localStorage");
    if (a)
      return (
        this.stateHandler.get("sessionId") !== a &&
          this.stateHandler.set("sessionId", a),
        a
      );
    const r = this.generateId();
    return (
      this.stateHandler.set("sessionId", r),
      this.storage.setItem("currentSessionId", r, "localStorage"),
      r
    );
  }
  loadState(t) {
    if (!t) {
      Pt.error("no session was provided");
      return;
    }
    const { campaignId: a, sessionId: r } = t;
    if (!a || !r) {
      Pt.error("id was not found");
      return;
    }
    if (!this.storage.getItem("turnHistory", "localStorage", r)) {
      Pt.error("history was not found");
      return;
    }
    this.saveSessionId(t.sessionId);
    const s = this.getCampaignStateById(t.sessionId);
    if (!s) {
      Pt.error("campaign state was not found");
      return;
    }
    this.stateHandler.set("campaignState", s);
    const u = `/game/${a}?sessionId=${r}`;
    if (!this.navigation.isUrlParamMatch("/game/")) {
      this.navigation.go(u);
      return;
    }
    window.location.reload();
  }
  saveState(t, a) {
    if (!this.safeStringify(a))
      return (Pt.error("no value was provided"), null);
    (t === "campaignState" && this.updateCampaignState(a),
      t === "turnHistory" && this.updateTurnHistory(a));
  }
  saveToSlot(t, a) {
    var p;
    const r = this.getSessionId(),
      l = this.storage.getItem("campaignState", "localStorage", r),
      s = l
        ? JSON.parse(l).activeCampaignId
        : (p = this.stateHandler.get("campaignState")) == null
          ? void 0
          : p.activeCampaignId;
    if (!s || s === b0) {
      Pt.error("no campaign id found, skipping slot save");
      return;
    }
    const u = this.getNormalizedDateString(),
      f = t ?? `auto-save-${s}-${u}`;
    (this.saveSessionInfo({
      id: a ?? ep(),
      sessionId: r,
      campaignId: s,
      name: f ?? "auto-save",
      lastSaved: new Date().toISOString(),
    }),
      Pt.debug("Session info updated for sessionId:", r));
  }
  cleanupUnsavedStates() {
    const t = this.getSessionKeyWithPrefix("kampanykorut_campaignState-"),
      a = this.getSessionKeyWithPrefix("kampanykorut_turnHistory-"),
      r = this.getSavedGameSessions(),
      l = new Set(r.map((f) => f.sessionId)),
      s = t.filter((f) => {
        const p = f.replace("kampanykorut_campaignState-", "");
        return !l.has(p);
      }),
      u = a.filter((f) => {
        const p = f.replace("kampanykorut_turnHistory-", "");
        return !l.has(p);
      });
    (s.forEach((f) => {
      (localStorage.removeItem(f),
        Pt.debug("Cleared orphaned state with key:", f));
    }),
      u.forEach((f) => {
        (localStorage.removeItem(f),
          Pt.debug("Cleared orphaned history with key:", f));
      }));
  }
  campaignSelectorScreen() {}
  clearGameState(t) {
    const a = this.getCurrentCampaignState();
    (this.saveState("campaignState", null),
      this.gameConfigEngine.configure(null),
      this.voterEnvironment.configure(null),
      this.districtGroupEngine.configure([]),
      t === "restart" &&
        (this.init(!0),
        window.location.reload(),
        this.saveState("campaignState", {
          activeCampaignId: a == null ? void 0 : a.activeCampaignId,
          playerSide: a == null ? void 0 : a.playerSide,
        })));
  }
  getSessionKeyWithPrefix(t) {
    const a = [];
    for (let r = 0; r < localStorage.length; r++) {
      const l = localStorage.key(r);
      l != null && l.startsWith(t) && a.push(l);
    }
    return a;
  }
  updateCampaignState(t) {
    if (!t) {
      Pt.debug("Clearing campaign session");
      const s = this.getSessionId();
      (this.stateHandler.set("campaignState", null),
        this.storage.clearItem(`campaignState-${s}`, "localStorage"));
      return;
    }
    const a = this.getSessionId(),
      l = { ...(this.getCurrentCampaignState() ?? {}), ...t };
    (this.stateHandler.set("campaignState", l),
      this.storage.setItem(
        `campaignState-${a}`,
        JSON.stringify(l),
        "localStorage",
      ),
      Pt.debug("Election state saved for sessionId:", a));
  }
  getCampaignStateById(t) {
    const a = this.storage.getItem("campaignState", "localStorage", t);
    return a ? JSON.parse(a) : null;
  }
  getCurrentCampaignState() {
    const t = this.getSessionId(),
      a = this.storage.getItem("campaignState", "localStorage", t);
    return a ? JSON.parse(a) : null;
  }
  updateTurnHistory(t) {
    const a = this.getSessionId(),
      r = this.storage.getItem("turnHistory", "localStorage", a);
    let l = [];
    (r && (l = [...JSON.parse(r)]), l.push(t));
    const s = JSON.stringify(l);
    (this.storage.setItem(`turnHistory-${a}`, s, "localStorage"),
      Pt.debug("Question history saved for sessionId:", a));
  }
  saveSessionId(t) {
    (this.stateHandler.set("sessionId", t),
      this.storage.setItem("currentSessionId", t, "localStorage"));
  }
  saveSessionInfo(t) {
    const a = this.storage.getItem("savedSessions", "localStorage");
    let r = [];
    try {
      r = a ? JSON.parse(a) : [];
    } catch {
      r = [];
    }
    const l = r.find((u) => u.id === t.id);
    let s;
    if (l) s = r.map((u) => (u.id === t.id ? t : u));
    else {
      if (r.length >= Sd) {
        Pt.error(`cannot save: max ${Sd} saved sessions reached`);
        return;
      }
      s = [...r, t];
    }
    this.storage.setItem("savedSessions", JSON.stringify(s), "localStorage");
  }
  safeStringify(t) {
    try {
      return JSON.stringify(t);
    } catch (a) {
      Pt.error("failed to stringify value to storage", a);
    }
  }
  shouldGenerateNewSessionId(t) {
    if (t) return !0;
    const { sessionId: a, pathname: r } = this.chechUrlParams();
    return !(r.includes("/game") && a);
  }
  chechUrlParams() {
    const { pathname: t } = window.location;
    return {
      sessionId: new URLSearchParams(window.location.search).get("sessionId"),
      pathname: t,
    };
  }
  getNormalizedDateString() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}T${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(t.getSeconds()).padStart(2, "0")}`;
  }
};
Tu = LT([yr()], Tu);
const NT = new tl();
Lt.registerInstance(tl, NT);
const Hu = new Qi();
Lt.registerInstance(Qi, Hu);
const $u = new Ki();
Lt.registerInstance(Ki, $u);
const S0 = new Eo($u);
Lt.registerInstance(Eo, S0);
const Np = new mu();
Lt.registerInstance(mu, Np);
const MT = new xu(Hu);
Lt.registerInstance(xu, MT);
const Mp = new Cu();
Lt.registerInstance(Cu, Mp);
const E0 = new Eu(Hu, Mp);
Lt.registerInstance(Eu, E0);
const _0 = new d0();
Lt.registerInstance(d0, _0);
const jT = new Tu(E0, $u, Np, Hu, tC, _0, Mp);
Lt.registerInstance(Tu, jT);
const w0 = new Lp();
Lt.registerInstance(Lp, w0);
const O0 = new _o($u);
Lt.registerInstance(_o, O0);
const zT = new Su(w0, O0, S0);
Lt.registerInstance(Su, zT);
const jp = new bu();
Lt.registerInstance(bu, jp);
const BT = new vu(jp, Np);
Lt.registerInstance(vu, BT);
const UT = new yu(jp);
Lt.registerInstance(yu, UT);
/**
 * react-router v7.18.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ var zp = /^(?:[a-z][a-z0-9+.-]*:|[\\/]{2})/i,
  FT = /^[\\/]{2}/;
function IT(t, a) {
  return a + t.replace(/\\/g, "/");
}
function Av(t) {
  return (
    typeof t == "object" &&
    t != null &&
    "pathname" in t &&
    "search" in t &&
    "hash" in t &&
    "state" in t &&
    "key" in t
  );
}
function HT(t = {}) {
  let { initialEntries: a = ["/"], initialIndex: r, v5Compat: l = !1 } = t,
    s;
  s = a.map((w, S) =>
    y(
      w,
      typeof w == "string" ? null : w.state,
      S === 0 ? "default" : void 0,
      typeof w == "string" ? void 0 : w.mask,
    ),
  );
  let u = h(r ?? s.length - 1),
    f = "POP",
    p = null;
  function h(w) {
    return Math.min(Math.max(w, 0), s.length - 1);
  }
  function g() {
    return s[u];
  }
  function y(w, S = null, b, O) {
    let k = VT(s ? g().pathname : "/", w, S, b, O);
    return (
      Vn(
        k.pathname.charAt(0) === "/",
        `relative pathnames are not supported in memory history: ${JSON.stringify(w)}`,
      ),
      k
    );
  }
  function v(w) {
    return typeof w == "string" ? w : Au(w);
  }
  return {
    get index() {
      return u;
    },
    get action() {
      return f;
    },
    get location() {
      return g();
    },
    createHref: v,
    createURL(w) {
      return new URL(v(w), "http://localhost");
    },
    encodeLocation(w) {
      let S = typeof w == "string" ? nl(w) : w;
      return {
        pathname: S.pathname || "",
        search: S.search || "",
        hash: S.hash || "",
      };
    },
    push(w, S) {
      f = "PUSH";
      let b = Av(w) ? w : y(w, S);
      ((u += 1),
        s.splice(u, s.length, b),
        l && p && p({ action: f, location: b, delta: 1 }));
    },
    replace(w, S) {
      f = "REPLACE";
      let b = Av(w) ? w : y(w, S);
      ((s[u] = b), l && p && p({ action: f, location: b, delta: 0 }));
    },
    go(w) {
      f = "POP";
      let S = h(u + w),
        b = s[S];
      ((u = S), p && p({ action: f, location: b, delta: w }));
    },
    listen(w) {
      return (
        (p = w),
        () => {
          p = null;
        }
      );
    },
  };
}
function Dt(t, a) {
  if (t === !1 || t === null || typeof t > "u") throw new Error(a);
}
function Vn(t, a) {
  if (!t) {
    typeof console < "u" && console.warn(a);
    try {
      throw new Error(a);
    } catch {}
  }
}
function $T() {
  return Math.random().toString(36).substring(2, 10);
}
function VT(t, a, r = null, l, s) {
  return {
    pathname: typeof t == "string" ? t : t.pathname,
    search: "",
    hash: "",
    ...(typeof a == "string" ? nl(a) : a),
    state: r,
    key: (a && a.key) || l || $T(),
    mask: s,
  };
}
function Au({ pathname: t = "/", search: a = "", hash: r = "" }) {
  return (
    a && a !== "?" && (t += a.charAt(0) === "?" ? a : "?" + a),
    r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r),
    t
  );
}
function nl(t) {
  let a = {};
  if (t) {
    let r = t.indexOf("#");
    r >= 0 && ((a.hash = t.substring(r)), (t = t.substring(0, r)));
    let l = t.indexOf("?");
    (l >= 0 && ((a.search = t.substring(l)), (t = t.substring(0, l))),
      t && (a.pathname = t));
  }
  return a;
}
function x0(t, a, r = "/") {
  return GT(t, a, r, !1);
}
function GT(t, a, r, l, s) {
  let u = typeof a == "string" ? nl(a) : a,
    f = Da(u.pathname || "/", r);
  if (f == null) return null;
  let p = PT(t),
    h = null,
    g = nA(f);
  for (let y = 0; h == null && y < p.length; ++y) h = tA(p[y], g, l);
  return h;
}
function PT(t) {
  let a = C0(t);
  return (qT(a), a);
}
function C0(t, a = [], r = [], l = "", s = !1) {
  let u = (f, p, h = s, g) => {
    let y = {
      relativePath: g === void 0 ? f.path || "" : g,
      caseSensitive: f.caseSensitive === !0,
      childrenIndex: p,
      route: f,
    };
    if (y.relativePath.startsWith("/")) {
      if (!y.relativePath.startsWith(l) && h) return;
      (Dt(
        y.relativePath.startsWith(l),
        `Absolute route path "${y.relativePath}" nested under path "${l}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`,
      ),
        (y.relativePath = y.relativePath.slice(l.length)));
    }
    let v = $n([l, y.relativePath]),
      E = r.concat(y);
    (f.children &&
      f.children.length > 0 &&
      (Dt(
        f.index !== !0,
        `Index routes must not have child routes. Please remove all child routes from route path "${v}".`,
      ),
      C0(f.children, a, E, v, h)),
      !(f.path == null && !f.index) &&
        a.push({
          path: v,
          score: WT(v, f.index),
          routesMeta: E.map((w, S) => {
            let [b, O] = R0(
              w.relativePath,
              w.caseSensitive,
              S === E.length - 1,
            );
            return { ...w, matcher: b, compiledParams: O };
          }),
        }));
  };
  return (
    t.forEach((f, p) => {
      var h;
      if (f.path === "" || !((h = f.path) != null && h.includes("?"))) u(f, p);
      else for (let g of T0(f.path)) u(f, p, !0, g);
    }),
    a
  );
}
function T0(t) {
  let a = t.split("/");
  if (a.length === 0) return [];
  let [r, ...l] = a,
    s = r.endsWith("?"),
    u = r.replace(/\?$/, "");
  if (l.length === 0) return s ? [u, ""] : [u];
  let f = T0(l.join("/")),
    p = [];
  return (
    p.push(...f.map((h) => (h === "" ? u : [u, h].join("/")))),
    s && p.push(...f),
    p.map((h) => (t.startsWith("/") && h === "" ? "/" : h))
  );
}
function qT(t) {
  t.sort((a, r) =>
    a.score !== r.score
      ? r.score - a.score
      : eA(
          a.routesMeta.map((l) => l.childrenIndex),
          r.routesMeta.map((l) => l.childrenIndex),
        ),
  );
}
var YT = /^:[\w-]+$/,
  ZT = 3,
  XT = 2,
  KT = 1,
  QT = 10,
  JT = -2,
  Rv = (t) => t === "*";
function WT(t, a) {
  let r = t.split("/"),
    l = r.length;
  return (
    r.some(Rv) && (l += JT),
    a && (l += XT),
    r
      .filter((s) => !Rv(s))
      .reduce((s, u) => s + (YT.test(u) ? ZT : u === "" ? KT : QT), l)
  );
}
function eA(t, a) {
  return t.length === a.length && t.slice(0, -1).every((l, s) => l === a[s])
    ? t[t.length - 1] - a[a.length - 1]
    : 0;
}
function tA(t, a, r = !1) {
  let { routesMeta: l } = t,
    s = {},
    u = "/",
    f = [];
  for (let p = 0; p < l.length; ++p) {
    let h = l[p],
      g = p === l.length - 1,
      y = u === "/" ? a : a.slice(u.length) || "/",
      v = { path: h.relativePath, caseSensitive: h.caseSensitive, end: g },
      E =
        h.matcher && h.compiledParams
          ? A0(v, y, h.matcher, h.compiledParams)
          : Ru(v, y),
      w = h.route;
    if (
      (!E &&
        g &&
        r &&
        !l[l.length - 1].route.index &&
        (E = Ru(
          { path: h.relativePath, caseSensitive: h.caseSensitive, end: !1 },
          y,
        )),
      !E)
    )
      return null;
    (Object.assign(s, E.params),
      f.push({
        params: s,
        pathname: $n([u, E.pathname]),
        pathnameBase: iA($n([u, E.pathnameBase])),
        route: w,
      }),
      E.pathnameBase !== "/" && (u = $n([u, E.pathnameBase])));
  }
  return f;
}
function Ru(t, a) {
  typeof t == "string" && (t = { path: t, caseSensitive: !1, end: !0 });
  let [r, l] = R0(t.path, t.caseSensitive, t.end);
  return A0(t, a, r, l);
}
function A0(t, a, r, l) {
  let s = a.match(r);
  if (!s) return null;
  let u = s[0],
    f = u.replace(/(.)\/+$/, "$1"),
    p = s.slice(1);
  return {
    params: l.reduce((g, { paramName: y, isOptional: v }, E) => {
      if (y === "*") {
        let S = p[E] || "";
        f = u.slice(0, u.length - S.length).replace(/(.)\/+$/, "$1");
      }
      const w = p[E];
      return (
        v && !w ? (g[y] = void 0) : (g[y] = (w || "").replace(/%2F/g, "/")),
        g
      );
    }, {}),
    pathname: u,
    pathnameBase: f,
    pattern: t,
  };
}
function R0(t, a = !1, r = !0) {
  Vn(
    t === "*" || !t.endsWith("*") || t.endsWith("/*"),
    `Route path "${t}" will be treated as if it were "${t.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${t.replace(/\*$/, "/*")}".`,
  );
  let l = [],
    s =
      "^" +
      t
        .replace(/\/*\*?$/, "")
        .replace(/^\/*/, "/")
        .replace(/[\\.*+^${}|()[\]]/g, "\\$&")
        .replace(/\/:([\w-]+)(\?)?/g, (f, p, h, g, y) => {
          if ((l.push({ paramName: p, isOptional: h != null }), h)) {
            let v = y.charAt(g + f.length);
            return v && v !== "/" ? "/([^\\/]*)" : "(?:/([^\\/]*))?";
          }
          return "/([^\\/]+)";
        })
        .replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
  return (
    t.endsWith("*")
      ? (l.push({ paramName: "*" }),
        (s += t === "*" || t === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
      : r
        ? (s += "\\/*$")
        : t !== "" && t !== "/" && (s += "(?:(?=\\/|$))"),
    [new RegExp(s, a ? void 0 : "i"), l]
  );
}
function nA(t) {
  try {
    return t
      .split("/")
      .map((a) => decodeURIComponent(a).replace(/\//g, "%2F"))
      .join("/");
  } catch (a) {
    return (
      Vn(
        !1,
        `The URL path "${t}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${a}).`,
      ),
      t
    );
  }
}
function Da(t, a) {
  if (a === "/") return t;
  if (!t.toLowerCase().startsWith(a.toLowerCase())) return null;
  let r = a.endsWith("/") ? a.length - 1 : a.length,
    l = t.charAt(r);
  return l && l !== "/" ? null : t.slice(r) || "/";
}
function aA(t, a = "/") {
  let {
      pathname: r,
      search: l = "",
      hash: s = "",
    } = typeof t == "string" ? nl(t) : t,
    u;
  return (
    r
      ? ((r = D0(r)),
        r.startsWith("/") ? (u = kv(r.substring(1), "/")) : (u = kv(r, a)))
      : (u = a),
    { pathname: u, search: lA(l), hash: oA(s) }
  );
}
function kv(t, a) {
  let r = ku(a).split("/");
  return (
    t.split("/").forEach((s) => {
      s === ".." ? r.length > 1 && r.pop() : s !== "." && r.push(s);
    }),
    r.length > 1 ? r.join("/") : "/"
  );
}
function Ed(t, a, r, l) {
  return `Cannot include a '${t}' character in a manually specified \`to.${a}\` field [${JSON.stringify(l)}].  Please separate it out to the \`to.${r}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function rA(t) {
  return t.filter(
    (a, r) => r === 0 || (a.route.path && a.route.path.length > 0),
  );
}
function k0(t) {
  let a = rA(t);
  return a.map((r, l) => (l === a.length - 1 ? r.pathname : r.pathnameBase));
}
function Bp(t, a, r, l = !1) {
  let s;
  typeof t == "string"
    ? (s = nl(t))
    : ((s = { ...t }),
      Dt(
        !s.pathname || !s.pathname.includes("?"),
        Ed("?", "pathname", "search", s),
      ),
      Dt(
        !s.pathname || !s.pathname.includes("#"),
        Ed("#", "pathname", "hash", s),
      ),
      Dt(!s.search || !s.search.includes("#"), Ed("#", "search", "hash", s)));
  let u = t === "" || s.pathname === "",
    f = u ? "/" : s.pathname,
    p;
  if (f == null) p = r;
  else {
    let v = a.length - 1;
    if (!l && f.startsWith("..")) {
      let E = f.split("/");
      for (; E[0] === ".."; ) (E.shift(), (v -= 1));
      s.pathname = E.join("/");
    }
    p = v >= 0 ? a[v] : "/";
  }
  let h = aA(s, p),
    g = f && f !== "/" && f.endsWith("/"),
    y = (u || f === ".") && r.endsWith("/");
  return (!h.pathname.endsWith("/") && (g || y) && (h.pathname += "/"), h);
}
var D0 = (t) => t.replace(/[\\/]{2,}/g, "/"),
  $n = (t) => D0(t.join("/")),
  ku = (t) => t.replace(/\/+$/, ""),
  iA = (t) => ku(t).replace(/^\/*/, "/"),
  lA = (t) => (!t || t === "?" ? "" : t.startsWith("?") ? t : "?" + t),
  oA = (t) => (!t || t === "#" ? "" : t.startsWith("#") ? t : "#" + t),
  sA = class {
    constructor(t, a, r, l = !1) {
      ((this.status = t),
        (this.statusText = a || ""),
        (this.internal = l),
        r instanceof Error
          ? ((this.data = r.toString()), (this.error = r))
          : (this.data = r));
    }
  };
function uA(t) {
  return (
    t != null &&
    typeof t.status == "number" &&
    typeof t.statusText == "string" &&
    typeof t.internal == "boolean" &&
    "data" in t
  );
}
function cA(t) {
  let a = t.map((r) => r.route.path).filter(Boolean);
  return $n(a) || "/";
}
var L0 =
  typeof window < "u" &&
  typeof window.document < "u" &&
  typeof window.document.createElement < "u";
function N0(t, a) {
  let r = t;
  if (typeof r != "string" || !zp.test(r))
    return { absoluteURL: void 0, isExternal: !1, to: r };
  let l = r,
    s = !1;
  if (L0)
    try {
      let u = new URL(window.location.href),
        f = FT.test(r) ? new URL(IT(r, u.protocol)) : new URL(r),
        p = Da(f.pathname, a);
      f.origin === u.origin && p != null
        ? (r = p + f.search + f.hash)
        : (s = !0);
    } catch {
      Vn(
        !1,
        `<Link to="${r}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`,
      );
    }
  return { absoluteURL: l, isExternal: s, to: r };
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var M0 = ["POST", "PUT", "PATCH", "DELETE"];
new Set(M0);
var fA = ["GET", ...M0];
new Set(fA);
var dA = [
  "about:",
  "blob:",
  "chrome:",
  "chrome-untrusted:",
  "content:",
  "data:",
  "devtools:",
  "file:",
  "filesystem:",
  "javascript:",
];
function pA(t) {
  try {
    return dA.includes(new URL(t).protocol);
  } catch {
    return !1;
  }
}
var al = C.createContext(null);
al.displayName = "DataRouter";
var Vu = C.createContext(null);
Vu.displayName = "DataRouterState";
var j0 = C.createContext(!1);
function hA() {
  return C.useContext(j0);
}
var z0 = C.createContext({ isTransitioning: !1 });
z0.displayName = "ViewTransition";
var gA = C.createContext(new Map());
gA.displayName = "Fetchers";
var yA = C.createContext(null);
yA.displayName = "Await";
var kn = C.createContext(null);
kn.displayName = "Navigation";
var Gu = C.createContext(null);
Gu.displayName = "Location";
var La = C.createContext({ outlet: null, matches: [], isDataRoute: !1 });
La.displayName = "Route";
var Up = C.createContext(null);
Up.displayName = "RouteError";
var B0 = "REACT_ROUTER_ERROR",
  mA = "REDIRECT",
  vA = "ROUTE_ERROR_RESPONSE";
function bA(t) {
  if (t.startsWith(`${B0}:${mA}:{`))
    try {
      let a = JSON.parse(t.slice(28));
      if (
        typeof a == "object" &&
        a &&
        typeof a.status == "number" &&
        typeof a.statusText == "string" &&
        typeof a.location == "string" &&
        typeof a.reloadDocument == "boolean" &&
        typeof a.replace == "boolean"
      )
        return a;
    } catch {}
}
function SA(t) {
  if (t.startsWith(`${B0}:${vA}:{`))
    try {
      let a = JSON.parse(t.slice(40));
      if (
        typeof a == "object" &&
        a &&
        typeof a.status == "number" &&
        typeof a.statusText == "string"
      )
        return new sA(a.status, a.statusText, a.data);
    } catch {}
}
function EA(t, { relative: a } = {}) {
  Dt(
    To(),
    "useHref() may be used only in the context of a <Router> component.",
  );
  let { basename: r, navigator: l } = C.useContext(kn),
    { hash: s, pathname: u, search: f } = Ao(t, { relative: a }),
    p = u;
  return (
    r !== "/" && (p = u === "/" ? r : $n([r, u])),
    l.createHref({ pathname: p, search: f, hash: s })
  );
}
function To() {
  return C.useContext(Gu) != null;
}
function Na() {
  return (
    Dt(
      To(),
      "useLocation() may be used only in the context of a <Router> component.",
    ),
    C.useContext(Gu).location
  );
}
var U0 =
  "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function F0(t) {
  C.useContext(kn).static || C.useLayoutEffect(t);
}
function _A() {
  let { isDataRoute: t } = C.useContext(La);
  return t ? jA() : wA();
}
function wA() {
  Dt(
    To(),
    "useNavigate() may be used only in the context of a <Router> component.",
  );
  let t = C.useContext(al),
    { basename: a, navigator: r } = C.useContext(kn),
    { matches: l } = C.useContext(La),
    { pathname: s } = Na(),
    u = JSON.stringify(k0(l)),
    f = C.useRef(!1);
  return (
    F0(() => {
      f.current = !0;
    }),
    C.useCallback(
      (h, g = {}) => {
        if ((Vn(f.current, U0), !f.current)) return;
        if (typeof h == "number") {
          r.go(h);
          return;
        }
        let y = Bp(h, JSON.parse(u), s, g.relative === "path");
        (t == null &&
          a !== "/" &&
          (y.pathname = y.pathname === "/" ? a : $n([a, y.pathname])),
          (g.replace ? r.replace : r.push)(y, g.state, g));
      },
      [a, r, u, s, t],
    )
  );
}
C.createContext(null);
function Ao(t, { relative: a } = {}) {
  let { matches: r } = C.useContext(La),
    { pathname: l } = Na(),
    s = JSON.stringify(k0(r));
  return C.useMemo(() => Bp(t, JSON.parse(s), l, a === "path"), [t, s, l, a]);
}
function OA(t, a, r) {
  Dt(
    To(),
    "useRoutes() may be used only in the context of a <Router> component.",
  );
  let { navigator: l } = C.useContext(kn),
    { matches: s } = C.useContext(La),
    u = s[s.length - 1],
    f = u ? u.params : {},
    p = u ? u.pathname : "/",
    h = u ? u.pathnameBase : "/",
    g = u && u.route;
  {
    let O = (g && g.path) || "";
    H0(
      p,
      !g || O.endsWith("*") || O.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${p}" (under <Route path="${O}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${O}"> to <Route path="${O === "/" ? "*" : `${O}/*`}">.`,
    );
  }
  let y = Na(),
    v;
  v = y;
  let E = v.pathname || "/",
    w = E;
  if (h !== "/") {
    let O = h.replace(/^\//, "").split("/");
    w = "/" + E.replace(/^\//, "").split("/").slice(O.length).join("/");
  }
  let S =
    r && r.state.matches.length
      ? r.state.matches.map((O) =>
          Object.assign(O, { route: r.manifest[O.route.id] || O.route }),
        )
      : x0(t, { pathname: w });
  return (
    Vn(
      g || S != null,
      `No routes matched location "${v.pathname}${v.search}${v.hash}" `,
    ),
    Vn(
      S == null ||
        S[S.length - 1].route.element !== void 0 ||
        S[S.length - 1].route.Component !== void 0 ||
        S[S.length - 1].route.lazy !== void 0,
      `Matched leaf route at location "${v.pathname}${v.search}${v.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`,
    ),
    RA(
      S &&
        S.map((O) =>
          Object.assign({}, O, {
            params: Object.assign({}, f, O.params),
            pathname: $n([
              h,
              l.encodeLocation
                ? l.encodeLocation(
                    O.pathname
                      .replace(/%/g, "%25")
                      .replace(/\?/g, "%3F")
                      .replace(/#/g, "%23"),
                  ).pathname
                : O.pathname,
            ]),
            pathnameBase:
              O.pathnameBase === "/"
                ? h
                : $n([
                    h,
                    l.encodeLocation
                      ? l.encodeLocation(
                          O.pathnameBase
                            .replace(/%/g, "%25")
                            .replace(/\?/g, "%3F")
                            .replace(/#/g, "%23"),
                        ).pathname
                      : O.pathnameBase,
                  ]),
          }),
        ),
      s,
      r,
    )
  );
}
function xA() {
  let t = MA(),
    a = uA(t)
      ? `${t.status} ${t.statusText}`
      : t instanceof Error
        ? t.message
        : JSON.stringify(t),
    r = t instanceof Error ? t.stack : null,
    l = "rgba(200,200,200, 0.5)",
    s = { padding: "0.5rem", backgroundColor: l },
    u = { padding: "2px 4px", backgroundColor: l },
    f = null;
  return (
    console.error("Error handled by React Router default ErrorBoundary:", t),
    (f = C.createElement(
      C.Fragment,
      null,
      C.createElement("p", null, "💿 Hey developer 👋"),
      C.createElement(
        "p",
        null,
        "You can provide a way better UX than this when your app throws errors by providing your own ",
        C.createElement("code", { style: u }, "ErrorBoundary"),
        " or",
        " ",
        C.createElement("code", { style: u }, "errorElement"),
        " prop on your route.",
      ),
    )),
    C.createElement(
      C.Fragment,
      null,
      C.createElement("h2", null, "Unexpected Application Error!"),
      C.createElement("h3", { style: { fontStyle: "italic" } }, a),
      r ? C.createElement("pre", { style: s }, r) : null,
      f,
    )
  );
}
var CA = C.createElement(xA, null),
  I0 = class extends C.Component {
    constructor(t) {
      (super(t),
        (this.state = {
          location: t.location,
          revalidation: t.revalidation,
          error: t.error,
        }));
    }
    static getDerivedStateFromError(t) {
      return { error: t };
    }
    static getDerivedStateFromProps(t, a) {
      return a.location !== t.location ||
        (a.revalidation !== "idle" && t.revalidation === "idle")
        ? { error: t.error, location: t.location, revalidation: t.revalidation }
        : {
            error: t.error !== void 0 ? t.error : a.error,
            location: a.location,
            revalidation: t.revalidation || a.revalidation,
          };
    }
    componentDidCatch(t, a) {
      this.props.onError
        ? this.props.onError(t, a)
        : console.error(
            "React Router caught the following error during render",
            t,
          );
    }
    render() {
      let t = this.state.error;
      if (
        this.context &&
        typeof t == "object" &&
        t &&
        "digest" in t &&
        typeof t.digest == "string"
      ) {
        const r = SA(t.digest);
        r && (t = r);
      }
      let a =
        t !== void 0
          ? C.createElement(
              La.Provider,
              { value: this.props.routeContext },
              C.createElement(Up.Provider, {
                value: t,
                children: this.props.component,
              }),
            )
          : this.props.children;
      return this.context ? C.createElement(TA, { error: t }, a) : a;
    }
  };
I0.contextType = j0;
var _d = new WeakMap();
function TA({ children: t, error: a }) {
  let { basename: r } = C.useContext(kn);
  if (
    typeof a == "object" &&
    a &&
    "digest" in a &&
    typeof a.digest == "string"
  ) {
    let l = bA(a.digest);
    if (l) {
      let s = _d.get(a);
      if (s) throw s;
      let u = N0(l.location, r),
        f = u.absoluteURL || u.to;
      if (pA(f)) throw new Error("Invalid redirect location");
      if (L0 && !_d.get(a))
        if (u.isExternal || l.reloadDocument) window.location.href = f;
        else {
          const p = Promise.resolve().then(() =>
            window.__reactRouterDataRouter.navigate(u.to, {
              replace: l.replace,
            }),
          );
          throw (_d.set(a, p), p);
        }
      return C.createElement("meta", {
        httpEquiv: "refresh",
        content: `0;url=${f}`,
      });
    }
  }
  return t;
}
function AA({ routeContext: t, match: a, children: r }) {
  let l = C.useContext(al);
  return (
    l &&
      l.static &&
      l.staticContext &&
      (a.route.errorElement || a.route.ErrorBoundary) &&
      (l.staticContext._deepestRenderedBoundaryId = a.route.id),
    C.createElement(La.Provider, { value: t }, r)
  );
}
function RA(t, a = [], r) {
  let l = r == null ? void 0 : r.state;
  if (t == null) {
    if (!l) return null;
    if (l.errors) t = l.matches;
    else if (a.length === 0 && !l.initialized && l.matches.length > 0)
      t = l.matches;
    else return null;
  }
  let s = t,
    u = l == null ? void 0 : l.errors;
  if (u != null) {
    let y = s.findIndex(
      (v) => v.route.id && (u == null ? void 0 : u[v.route.id]) !== void 0,
    );
    (Dt(
      y >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(u).join(",")}`,
    ),
      (s = s.slice(0, Math.min(s.length, y + 1))));
  }
  let f = !1,
    p = -1;
  if (r && l) {
    f = l.renderFallback;
    for (let y = 0; y < s.length; y++) {
      let v = s[y];
      if (
        ((v.route.HydrateFallback || v.route.hydrateFallbackElement) && (p = y),
        v.route.id)
      ) {
        let { loaderData: E, errors: w } = l,
          S =
            v.route.loader &&
            !E.hasOwnProperty(v.route.id) &&
            (!w || w[v.route.id] === void 0);
        if (v.route.lazy || S) {
          (r.isStatic && (f = !0),
            p >= 0 ? (s = s.slice(0, p + 1)) : (s = [s[0]]));
          break;
        }
      }
    }
  }
  let h = r == null ? void 0 : r.onError,
    g =
      l && h
        ? (y, v) => {
            var E, w;
            h(y, {
              location: l.location,
              params:
                ((w = (E = l.matches) == null ? void 0 : E[0]) == null
                  ? void 0
                  : w.params) ?? {},
              pattern: cA(l.matches),
              errorInfo: v,
            });
          }
        : void 0;
  return s.reduceRight((y, v, E) => {
    let w,
      S = !1,
      b = null,
      O = null;
    l &&
      ((w = u && v.route.id ? u[v.route.id] : void 0),
      (b = v.route.errorElement || CA),
      f &&
        (p < 0 && E === 0
          ? (H0(
              "route-fallback",
              !1,
              "No `HydrateFallback` element provided to render during initial hydration",
            ),
            (S = !0),
            (O = null))
          : p === E &&
            ((S = !0), (O = v.route.hydrateFallbackElement || null))));
    let k = a.concat(s.slice(0, E + 1)),
      L = () => {
        let z;
        return (
          w
            ? (z = b)
            : S
              ? (z = O)
              : v.route.Component
                ? (z = C.createElement(v.route.Component, null))
                : v.route.element
                  ? (z = v.route.element)
                  : (z = y),
          C.createElement(AA, {
            match: v,
            routeContext: { outlet: y, matches: k, isDataRoute: l != null },
            children: z,
          })
        );
      };
    return l && (v.route.ErrorBoundary || v.route.errorElement || E === 0)
      ? C.createElement(I0, {
          location: l.location,
          revalidation: l.revalidation,
          component: b,
          error: w,
          children: L(),
          routeContext: { outlet: null, matches: k, isDataRoute: !0 },
          onError: g,
        })
      : L();
  }, null);
}
function Fp(t) {
  return `${t} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function kA(t) {
  let a = C.useContext(al);
  return (Dt(a, Fp(t)), a);
}
function DA(t) {
  let a = C.useContext(Vu);
  return (Dt(a, Fp(t)), a);
}
function LA(t) {
  let a = C.useContext(La);
  return (Dt(a, Fp(t)), a);
}
function Ip(t) {
  let a = LA(t),
    r = a.matches[a.matches.length - 1];
  return (
    Dt(
      r.route.id,
      `${t} can only be used on routes that contain a unique "id"`,
    ),
    r.route.id
  );
}
function NA() {
  return Ip("useRouteId");
}
function MA() {
  var l;
  let t = C.useContext(Up),
    a = DA("useRouteError"),
    r = Ip("useRouteError");
  return t !== void 0 ? t : (l = a.errors) == null ? void 0 : l[r];
}
function jA() {
  let { router: t } = kA("useNavigate"),
    a = Ip("useNavigate"),
    r = C.useRef(!1);
  return (
    F0(() => {
      r.current = !0;
    }),
    C.useCallback(
      async (s, u = {}) => {
        (Vn(r.current, U0),
          r.current &&
            (typeof s == "number"
              ? await t.navigate(s)
              : await t.navigate(s, { fromRouteId: a, ...u })));
      },
      [t, a],
    )
  );
}
var Dv = {};
function H0(t, a, r) {
  !a && !Dv[t] && ((Dv[t] = !0), Vn(!1, r));
}
C.memo(zA);
function zA({
  routes: t,
  manifest: a,
  future: r,
  state: l,
  isStatic: s,
  onError: u,
}) {
  return OA(t, void 0, { manifest: a, state: l, isStatic: s, onError: u });
}
function BA({
  basename: t,
  children: a,
  initialEntries: r,
  initialIndex: l,
  useTransitions: s,
}) {
  let u = C.useRef();
  u.current == null &&
    (u.current = HT({ initialEntries: r, initialIndex: l, v5Compat: !0 }));
  let f = u.current,
    [p, h] = C.useState({ action: f.action, location: f.location }),
    g = C.useCallback(
      (y) => {
        s === !1 ? h(y) : C.startTransition(() => h(y));
      },
      [s],
    );
  return (
    C.useLayoutEffect(() => f.listen(g), [f, g]),
    C.createElement(UA, {
      basename: t,
      children: a,
      location: p.location,
      navigationType: p.action,
      navigator: f,
      useTransitions: s,
    })
  );
}
function UA({
  basename: t = "/",
  children: a = null,
  location: r,
  navigationType: l = "POP",
  navigator: s,
  static: u = !1,
  useTransitions: f,
}) {
  Dt(
    !To(),
    "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.",
  );
  let p = t.replace(/^\/*/, "/"),
    h = C.useMemo(
      () => ({
        basename: p,
        navigator: s,
        static: u,
        useTransitions: f,
        future: {},
      }),
      [p, s, u, f],
    );
  typeof r == "string" && (r = nl(r));
  let {
      pathname: g = "/",
      search: y = "",
      hash: v = "",
      state: E = null,
      key: w = "default",
      mask: S,
    } = r,
    b = C.useMemo(() => {
      let O = Da(g, p);
      return O == null
        ? null
        : {
            location: {
              pathname: O,
              search: y,
              hash: v,
              state: E,
              key: w,
              mask: S,
            },
            navigationType: l,
          };
    }, [p, g, y, v, E, w, l, S]);
  return (
    Vn(
      b != null,
      `<Router basename="${p}"> is not able to match the URL "${g}${y}${v}" because it does not start with the basename, so the <Router> won't render anything.`,
    ),
    b == null
      ? null
      : C.createElement(
          kn.Provider,
          { value: h },
          C.createElement(Gu.Provider, { children: a, value: b }),
        )
  );
}
var iu = "get",
  lu = "application/x-www-form-urlencoded";
function Pu(t) {
  return typeof HTMLElement < "u" && t instanceof HTMLElement;
}
function FA(t) {
  return Pu(t) && t.tagName.toLowerCase() === "button";
}
function IA(t) {
  return Pu(t) && t.tagName.toLowerCase() === "form";
}
function HA(t) {
  return Pu(t) && t.tagName.toLowerCase() === "input";
}
function $A(t) {
  return !!(t.metaKey || t.altKey || t.ctrlKey || t.shiftKey);
}
function VA(t, a) {
  return t.button === 0 && (!a || a === "_self") && !$A(t);
}
var Js = null;
function GA() {
  if (Js === null)
    try {
      (new FormData(document.createElement("form"), 0), (Js = !1));
    } catch {
      Js = !0;
    }
  return Js;
}
var PA = new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
]);
function wd(t) {
  return t != null && !PA.has(t)
    ? (Vn(
        !1,
        `"${t}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${lu}"`,
      ),
      null)
    : t;
}
function qA(t, a) {
  let r, l, s, u, f;
  if (IA(t)) {
    let p = t.getAttribute("action");
    ((l = p ? Da(p, a) : null),
      (r = t.getAttribute("method") || iu),
      (s = wd(t.getAttribute("enctype")) || lu),
      (u = new FormData(t)));
  } else if (FA(t) || (HA(t) && (t.type === "submit" || t.type === "image"))) {
    let p = t.form;
    if (p == null)
      throw new Error(
        'Cannot submit a <button> or <input type="submit"> without a <form>',
      );
    let h = t.getAttribute("formaction") || p.getAttribute("action");
    if (
      ((l = h ? Da(h, a) : null),
      (r = t.getAttribute("formmethod") || p.getAttribute("method") || iu),
      (s =
        wd(t.getAttribute("formenctype")) ||
        wd(p.getAttribute("enctype")) ||
        lu),
      (u = new FormData(p, t)),
      !GA())
    ) {
      let { name: g, type: y, value: v } = t;
      if (y === "image") {
        let E = g ? `${g}.` : "";
        (u.append(`${E}x`, "0"), u.append(`${E}y`, "0"));
      } else g && u.append(g, v);
    }
  } else {
    if (Pu(t))
      throw new Error(
        'Cannot submit element that is not <form>, <button>, or <input type="submit|image">',
      );
    ((r = iu), (l = null), (s = lu), (f = t));
  }
  return (
    u && s === "text/plain" && ((f = u), (u = void 0)),
    { action: l, method: r.toLowerCase(), encType: s, formData: u, body: f }
  );
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function Hp(t, a) {
  if (t === !1 || t === null || typeof t > "u") throw new Error(a);
}
function $0(t, a, r, l) {
  let s =
    typeof t == "string"
      ? new URL(
          t,
          typeof window > "u"
            ? "server://singlefetch/"
            : window.location.origin,
        )
      : t;
  return (
    r
      ? s.pathname.endsWith("/")
        ? (s.pathname = `${s.pathname}_.${l}`)
        : (s.pathname = `${s.pathname}.${l}`)
      : s.pathname === "/"
        ? (s.pathname = `_root.${l}`)
        : a && Da(s.pathname, a) === "/"
          ? (s.pathname = `${ku(a)}/_root.${l}`)
          : (s.pathname = `${ku(s.pathname)}.${l}`),
    s
  );
}
async function YA(t, a) {
  if (t.id in a) return a[t.id];
  try {
    let r = await import(t.module);
    return ((a[t.id] = r), r);
  } catch (r) {
    return (
      console.error(
        `Error loading route module \`${t.module}\`, reloading page...`,
      ),
      console.error(r),
      window.__reactRouterContext && window.__reactRouterContext.isSpaMode,
      window.location.reload(),
      new Promise(() => {})
    );
  }
}
function ZA(t) {
  return t == null
    ? !1
    : t.href == null
      ? t.rel === "preload" &&
        typeof t.imageSrcSet == "string" &&
        typeof t.imageSizes == "string"
      : typeof t.rel == "string" && typeof t.href == "string";
}
async function XA(t, a, r) {
  let l = await Promise.all(
    t.map(async (s) => {
      let u = a.routes[s.route.id];
      if (u) {
        let f = await YA(u, r);
        return f.links ? f.links() : [];
      }
      return [];
    }),
  );
  return WA(
    l
      .flat(1)
      .filter(ZA)
      .filter((s) => s.rel === "stylesheet" || s.rel === "preload")
      .map((s) =>
        s.rel === "stylesheet"
          ? { ...s, rel: "prefetch", as: "style" }
          : { ...s, rel: "prefetch" },
      ),
  );
}
function Lv(t, a, r, l, s, u) {
  let f = (h, g) => (r[g] ? h.route.id !== r[g].route.id : !0),
    p = (h, g) => {
      var y;
      return (
        r[g].pathname !== h.pathname ||
        (((y = r[g].route.path) == null ? void 0 : y.endsWith("*")) &&
          r[g].params["*"] !== h.params["*"])
      );
    };
  return u === "assets"
    ? a.filter((h, g) => f(h, g) || p(h, g))
    : u === "data"
      ? a.filter((h, g) => {
          var v;
          let y = l.routes[h.route.id];
          if (!y || !y.hasLoader) return !1;
          if (f(h, g) || p(h, g)) return !0;
          if (h.route.shouldRevalidate) {
            let E = h.route.shouldRevalidate({
              currentUrl: new URL(
                s.pathname + s.search + s.hash,
                window.origin,
              ),
              currentParams: ((v = r[0]) == null ? void 0 : v.params) || {},
              nextUrl: new URL(t, window.origin),
              nextParams: h.params,
              defaultShouldRevalidate: !0,
            });
            if (typeof E == "boolean") return E;
          }
          return !0;
        })
      : [];
}
function KA(t, a, { includeHydrateFallback: r } = {}) {
  return QA(
    t
      .map((l) => {
        let s = a.routes[l.route.id];
        if (!s) return [];
        let u = [s.module];
        return (
          s.clientActionModule && (u = u.concat(s.clientActionModule)),
          s.clientLoaderModule && (u = u.concat(s.clientLoaderModule)),
          r &&
            s.hydrateFallbackModule &&
            (u = u.concat(s.hydrateFallbackModule)),
          s.imports && (u = u.concat(s.imports)),
          u
        );
      })
      .flat(1),
  );
}
function QA(t) {
  return [...new Set(t)];
}
function JA(t) {
  let a = {},
    r = Object.keys(t).sort();
  for (let l of r) a[l] = t[l];
  return a;
}
function WA(t, a) {
  let r = new Set();
  return (
    new Set(a),
    t.reduce((l, s) => {
      let u = JSON.stringify(JA(s));
      return (r.has(u) || (r.add(u), l.push({ key: u, link: s })), l);
    }, [])
  );
}
function $p() {
  let t = C.useContext(al);
  return (
    Hp(
      t,
      "You must render this element inside a <DataRouterContext.Provider> element",
    ),
    t
  );
}
function eR() {
  let t = C.useContext(Vu);
  return (
    Hp(
      t,
      "You must render this element inside a <DataRouterStateContext.Provider> element",
    ),
    t
  );
}
var Vp = C.createContext(void 0);
Vp.displayName = "FrameworkContext";
function qu() {
  let t = C.useContext(Vp);
  return (
    Hp(t, "You must render this element inside a <HydratedRouter> element"),
    t
  );
}
function tR(t, a) {
  let r = C.useContext(Vp),
    [l, s] = C.useState(!1),
    [u, f] = C.useState(!1),
    {
      onFocus: p,
      onBlur: h,
      onMouseEnter: g,
      onMouseLeave: y,
      onTouchStart: v,
    } = a,
    E = C.useRef(null);
  (C.useEffect(() => {
    if ((t === "render" && f(!0), t === "viewport")) {
      let b = (k) => {
          k.forEach((L) => {
            f(L.isIntersecting);
          });
        },
        O = new IntersectionObserver(b, { threshold: 0.5 });
      return (
        E.current && O.observe(E.current),
        () => {
          O.disconnect();
        }
      );
    }
  }, [t]),
    C.useEffect(() => {
      if (l) {
        let b = setTimeout(() => {
          f(!0);
        }, 100);
        return () => {
          clearTimeout(b);
        };
      }
    }, [l]));
  let w = () => {
      s(!0);
    },
    S = () => {
      (s(!1), f(!1));
    };
  return r
    ? t !== "intent"
      ? [u, E, {}]
      : [
          u,
          E,
          {
            onFocus: oo(p, w),
            onBlur: oo(h, S),
            onMouseEnter: oo(g, w),
            onMouseLeave: oo(y, S),
            onTouchStart: oo(v, w),
          },
        ]
    : [!1, E, {}];
}
function oo(t, a) {
  return (r) => {
    (t && t(r), r.defaultPrevented || a(r));
  };
}
function nR({ page: t, ...a }) {
  let r = hA(),
    { nonce: l } = qu(),
    { router: s } = $p(),
    u = C.useMemo(() => x0(s.routes, t, s.basename), [s.routes, t, s.basename]);
  return u
    ? (a.nonce == null && l && (a = { ...a, nonce: l }),
      r
        ? C.createElement(rR, { page: t, matches: u, ...a })
        : C.createElement(iR, { page: t, matches: u, ...a }))
    : null;
}
function aR(t) {
  let { manifest: a, routeModules: r } = qu(),
    [l, s] = C.useState([]);
  return (
    C.useEffect(() => {
      let u = !1;
      return (
        XA(t, a, r).then((f) => {
          u || s(f);
        }),
        () => {
          u = !0;
        }
      );
    }, [t, a, r]),
    l
  );
}
function rR({ page: t, matches: a, ...r }) {
  let l = Na(),
    { future: s } = qu(),
    { basename: u } = $p(),
    f = C.useMemo(() => {
      if (t === l.pathname + l.search + l.hash) return [];
      let p = $0(t, u, s.v8_trailingSlashAwareDataRequests, "rsc"),
        h = !1,
        g = [];
      for (let y of a)
        typeof y.route.shouldRevalidate == "function"
          ? (h = !0)
          : g.push(y.route.id);
      return (
        h && g.length > 0 && p.searchParams.set("_routes", g.join(",")),
        [p.pathname + p.search]
      );
    }, [u, s.v8_trailingSlashAwareDataRequests, t, l, a]);
  return C.createElement(
    C.Fragment,
    null,
    f.map((p) =>
      C.createElement("link", {
        key: p,
        rel: "prefetch",
        as: "fetch",
        href: p,
        ...r,
      }),
    ),
  );
}
function iR({ page: t, matches: a, ...r }) {
  let l = Na(),
    { future: s, manifest: u, routeModules: f } = qu(),
    { basename: p } = $p(),
    { loaderData: h, matches: g } = eR(),
    y = C.useMemo(() => Lv(t, a, g, u, l, "data"), [t, a, g, u, l]),
    v = C.useMemo(() => Lv(t, a, g, u, l, "assets"), [t, a, g, u, l]),
    E = C.useMemo(() => {
      if (t === l.pathname + l.search + l.hash) return [];
      let b = new Set(),
        O = !1;
      if (
        (a.forEach((L) => {
          var Q;
          let z = u.routes[L.route.id];
          !z ||
            !z.hasLoader ||
            ((!y.some((ae) => ae.route.id === L.route.id) &&
              L.route.id in h &&
              (Q = f[L.route.id]) != null &&
              Q.shouldRevalidate) ||
            z.hasClientLoader
              ? (O = !0)
              : b.add(L.route.id));
        }),
        b.size === 0)
      )
        return [];
      let k = $0(t, p, s.v8_trailingSlashAwareDataRequests, "data");
      return (
        O &&
          b.size > 0 &&
          k.searchParams.set(
            "_routes",
            a
              .filter((L) => b.has(L.route.id))
              .map((L) => L.route.id)
              .join(","),
          ),
        [k.pathname + k.search]
      );
    }, [p, s.v8_trailingSlashAwareDataRequests, h, l, u, y, a, t, f]),
    w = C.useMemo(() => KA(v, u), [v, u]),
    S = aR(v);
  return C.createElement(
    C.Fragment,
    null,
    E.map((b) =>
      C.createElement("link", {
        key: b,
        rel: "prefetch",
        as: "fetch",
        href: b,
        ...r,
      }),
    ),
    w.map((b) =>
      C.createElement("link", { key: b, rel: "modulepreload", href: b, ...r }),
    ),
    S.map(({ key: b, link: O }) =>
      C.createElement("link", {
        key: b,
        nonce: r.nonce,
        ...O,
        crossOrigin: O.crossOrigin ?? r.crossOrigin,
      }),
    ),
  );
}
function lR(...t) {
  return (a) => {
    t.forEach((r) => {
      typeof r == "function" ? r(a) : r != null && (r.current = a);
    });
  };
}
var oR =
  typeof window < "u" &&
  typeof window.document < "u" &&
  typeof window.document.createElement < "u";
try {
  oR && (window.__reactRouterVersion = "7.18.0");
} catch {}
var V0 = C.forwardRef(function (
  {
    onClick: a,
    discover: r = "render",
    prefetch: l = "none",
    relative: s,
    reloadDocument: u,
    replace: f,
    mask: p,
    state: h,
    target: g,
    to: y,
    preventScrollReset: v,
    viewTransition: E,
    defaultShouldRevalidate: w,
    ...S
  },
  b,
) {
  let { basename: O, navigator: k, useTransitions: L } = C.useContext(kn),
    z = typeof y == "string" && zp.test(y),
    Q = N0(y, O);
  y = Q.to;
  let ae = EA(y, { relative: s }),
    re = Na(),
    q = null;
  if (p) {
    let de = Bp(p, [], re.mask ? re.mask.pathname : "/", !0);
    (O !== "/" &&
      (de.pathname = de.pathname === "/" ? O : $n([O, de.pathname])),
      (q = k.createHref(de)));
  }
  let [ie, se, ve] = tR(l, S),
    Te = fR(y, {
      replace: f,
      mask: p,
      state: h,
      target: g,
      preventScrollReset: v,
      relative: s,
      viewTransition: E,
      defaultShouldRevalidate: w,
      useTransitions: L,
    });
  function Y(de) {
    (a && a(de), de.defaultPrevented || Te(de));
  }
  let oe = !(Q.isExternal || u),
    ue = C.createElement("a", {
      ...S,
      ...ve,
      href: (oe ? q : void 0) || Q.absoluteURL || ae,
      onClick: oe ? Y : a,
      ref: lR(b, se),
      target: g,
      "data-discover": !z && r === "render" ? "true" : void 0,
    });
  return ie && !z
    ? C.createElement(C.Fragment, null, ue, C.createElement(nR, { page: ae }))
    : ue;
});
V0.displayName = "Link";
var sR = C.forwardRef(function (
  {
    "aria-current": a = "page",
    caseSensitive: r = !1,
    className: l = "",
    end: s = !1,
    style: u,
    to: f,
    viewTransition: p,
    children: h,
    ...g
  },
  y,
) {
  let v = Ao(f, { relative: g.relative }),
    E = Na(),
    w = C.useContext(Vu),
    { navigator: S, basename: b } = C.useContext(kn),
    O = w != null && yR(v) && p === !0,
    k = S.encodeLocation ? S.encodeLocation(v).pathname : v.pathname,
    L = E.pathname,
    z =
      w && w.navigation && w.navigation.location
        ? w.navigation.location.pathname
        : null;
  (r ||
    ((L = L.toLowerCase()),
    (z = z ? z.toLowerCase() : null),
    (k = k.toLowerCase())),
    z && b && (z = Da(z, b) || z));
  const Q = k !== "/" && k.endsWith("/") ? k.length - 1 : k.length;
  let ae = L === k || (!s && L.startsWith(k) && L.charAt(Q) === "/"),
    re =
      z != null &&
      (z === k || (!s && z.startsWith(k) && z.charAt(k.length) === "/")),
    q = { isActive: ae, isPending: re, isTransitioning: O },
    ie = ae ? a : void 0,
    se;
  typeof l == "function"
    ? (se = l(q))
    : (se = [
        l,
        ae ? "active" : null,
        re ? "pending" : null,
        O ? "transitioning" : null,
      ]
        .filter(Boolean)
        .join(" "));
  let ve = typeof u == "function" ? u(q) : u;
  return C.createElement(
    V0,
    {
      ...g,
      "aria-current": ie,
      className: se,
      ref: y,
      style: ve,
      to: f,
      viewTransition: p,
    },
    typeof h == "function" ? h(q) : h,
  );
});
sR.displayName = "NavLink";
var uR = C.forwardRef(
  (
    {
      discover: t = "render",
      fetcherKey: a,
      navigate: r,
      reloadDocument: l,
      replace: s,
      state: u,
      method: f = iu,
      action: p,
      onSubmit: h,
      relative: g,
      preventScrollReset: y,
      viewTransition: v,
      defaultShouldRevalidate: E,
      ...w
    },
    S,
  ) => {
    let { useTransitions: b } = C.useContext(kn),
      O = hR(),
      k = gR(p, { relative: g }),
      L = f.toLowerCase() === "get" ? "get" : "post",
      z = typeof p == "string" && zp.test(p),
      Q = (ae) => {
        if ((h && h(ae), ae.defaultPrevented)) return;
        ae.preventDefault();
        let re = ae.nativeEvent.submitter,
          q = (re == null ? void 0 : re.getAttribute("formmethod")) || f,
          ie = () =>
            O(re || ae.currentTarget, {
              fetcherKey: a,
              method: q,
              navigate: r,
              replace: s,
              state: u,
              relative: g,
              preventScrollReset: y,
              viewTransition: v,
              defaultShouldRevalidate: E,
            });
        b && r !== !1 ? C.startTransition(() => ie()) : ie();
      };
    return C.createElement("form", {
      ref: S,
      method: L,
      action: k,
      onSubmit: l ? h : Q,
      ...w,
      "data-discover": !z && t === "render" ? "true" : void 0,
    });
  },
);
uR.displayName = "Form";
function cR(t) {
  return `${t} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function G0(t) {
  let a = C.useContext(al);
  return (Dt(a, cR(t)), a);
}
function fR(
  t,
  {
    target: a,
    replace: r,
    mask: l,
    state: s,
    preventScrollReset: u,
    relative: f,
    viewTransition: p,
    defaultShouldRevalidate: h,
    useTransitions: g,
  } = {},
) {
  let y = _A(),
    v = Na(),
    E = Ao(t, { relative: f });
  return C.useCallback(
    (w) => {
      if (VA(w, a)) {
        w.preventDefault();
        let S = r !== void 0 ? r : Au(v) === Au(E),
          b = () =>
            y(t, {
              replace: S,
              mask: l,
              state: s,
              preventScrollReset: u,
              relative: f,
              viewTransition: p,
              defaultShouldRevalidate: h,
            });
        g ? C.startTransition(() => b()) : b();
      }
    },
    [v, y, E, r, l, s, a, t, u, f, p, h, g],
  );
}
var dR = 0,
  pR = () => `__${String(++dR)}__`;
function hR() {
  let { router: t } = G0("useSubmit"),
    { basename: a } = C.useContext(kn),
    r = NA(),
    l = t.fetch,
    s = t.navigate;
  return C.useCallback(
    async (u, f = {}) => {
      let { action: p, method: h, encType: g, formData: y, body: v } = qA(u, a);
      if (f.navigate === !1) {
        let E = f.fetcherKey || pR();
        await l(E, r, f.action || p, {
          defaultShouldRevalidate: f.defaultShouldRevalidate,
          preventScrollReset: f.preventScrollReset,
          formData: y,
          body: v,
          formMethod: f.method || h,
          formEncType: f.encType || g,
          flushSync: f.flushSync,
        });
      } else
        await s(f.action || p, {
          defaultShouldRevalidate: f.defaultShouldRevalidate,
          preventScrollReset: f.preventScrollReset,
          formData: y,
          body: v,
          formMethod: f.method || h,
          formEncType: f.encType || g,
          replace: f.replace,
          state: f.state,
          fromRouteId: r,
          flushSync: f.flushSync,
          viewTransition: f.viewTransition,
        });
    },
    [l, s, a, r],
  );
}
function gR(t, { relative: a } = {}) {
  let { basename: r } = C.useContext(kn),
    l = C.useContext(La);
  Dt(l, "useFormAction must be used inside a RouteContext");
  let [s] = l.matches.slice(-1),
    u = { ...Ao(t || ".", { relative: a }) },
    f = Na();
  if (t == null) {
    u.search = f.search;
    let p = new URLSearchParams(u.search),
      h = p.getAll("index");
    if (h.some((y) => y === "")) {
      (p.delete("index"),
        h.filter((v) => v).forEach((v) => p.append("index", v)));
      let y = p.toString();
      u.search = y ? `?${y}` : "";
    }
  }
  return (
    (!t || t === ".") &&
      s.route.index &&
      (u.search = u.search ? u.search.replace(/^\?/, "?index&") : "?index"),
    r !== "/" && (u.pathname = u.pathname === "/" ? r : $n([r, u.pathname])),
    Au(u)
  );
}
function yR(t, { relative: a } = {}) {
  let r = C.useContext(z0);
  Dt(
    r != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?",
  );
  let { basename: l } = G0("useViewTransitionState"),
    s = Ao(t, { relative: a });
  if (!r.isTransitioning) return !1;
  let u = Da(r.currentLocation.pathname, l) || r.currentLocation.pathname,
    f = Da(r.nextLocation.pathname, l) || r.nextLocation.pathname;
  return Ru(s.pathname, f) != null || Ru(s.pathname, u) != null;
}
const mR = ({ children: t }) => x.jsx(BA, { children: t });
let Ji = {},
  An = {
    stories: "src/**/*.stories.{js,jsx,ts,tsx,mdx}",
    addons: {
      control: { enabled: !0, defaultState: {} },
      theme: { enabled: !0, defaultState: "light" },
      mode: { enabled: !0, defaultState: "full" },
      rtl: { enabled: !0, defaultState: !1 },
      source: {
        enabled: !0,
        defaultState: !1,
        themeDark: {
          plain: {
            color: "#d6deeb",
            backgroundColor: "var(--ladle-bg-color-secondary)",
          },
          styles: [
            {
              types: ["changed"],
              style: { color: "rgb(162, 191, 252)", fontStyle: "italic" },
            },
            {
              types: ["deleted"],
              style: { color: "rgba(239, 83, 80, 0.56)", fontStyle: "italic" },
            },
            {
              types: ["inserted", "attr-name"],
              style: { color: "rgb(173, 219, 103)", fontStyle: "italic" },
            },
            {
              types: ["comment"],
              style: { color: "rgb(99, 119, 119)", fontStyle: "italic" },
            },
            {
              types: ["string", "url"],
              style: { color: "rgb(173, 219, 103)" },
            },
            { types: ["variable"], style: { color: "rgb(214, 222, 235)" } },
            { types: ["number"], style: { color: "rgb(247, 140, 108)" } },
            {
              types: ["builtin", "char", "constant", "function"],
              style: { color: "rgb(130, 170, 255)" },
            },
            { types: ["punctuation"], style: { color: "rgb(199, 146, 234)" } },
            {
              types: ["selector", "doctype"],
              style: { color: "rgb(199, 146, 234)", fontStyle: "italic" },
            },
            { types: ["class-name"], style: { color: "rgb(255, 203, 139)" } },
            {
              types: ["tag", "operator", "keyword"],
              style: { color: "rgb(127, 219, 202)" },
            },
            { types: ["boolean"], style: { color: "rgb(255, 88, 116)" } },
            { types: ["property"], style: { color: "rgb(128, 203, 196)" } },
            { types: ["namespace"], style: { color: "rgb(178, 204, 214)" } },
          ],
        },
        themeLight: {
          plain: {
            color: "#393A34",
            backgroundColor: "var(--ladle-bg-color-secondary)",
          },
          styles: [
            {
              types: ["comment", "prolog", "doctype", "cdata"],
              style: { color: "#999988", fontStyle: "italic" },
            },
            { types: ["namespace"], style: { opacity: 0.7 } },
            { types: ["string", "attr-value"], style: { color: "#e3116c" } },
            { types: ["punctuation", "operator"], style: { color: "#393A34" } },
            {
              types: [
                "entity",
                "url",
                "symbol",
                "number",
                "boolean",
                "variable",
                "constant",
                "property",
                "regex",
                "inserted",
              ],
              style: { color: "#36acaa" },
            },
            {
              types: ["atrule", "keyword", "attr-name", "selector"],
              style: { color: "#00a4db" },
            },
            {
              types: ["function", "deleted", "tag"],
              style: { color: "#d73a49" },
            },
            { types: ["function-variable"], style: { color: "#6f42c1" } },
            {
              types: ["tag", "selector", "keyword"],
              style: { color: "#00009f" },
            },
          ],
        },
      },
      a11y: { enabled: !1 },
      msw: { enabled: !1 },
      action: { enabled: !0, defaultState: [] },
      ladle: { enabled: !0 },
      width: {
        enabled: !0,
        options: { xsmall: 414, small: 640, medium: 768, large: 1024 },
        defaultState: 0,
      },
    },
    hotkeys: {
      search: ["/", "meta+p"],
      nextStory: ["alt+arrowright"],
      previousStory: ["alt+arrowleft"],
      nextComponent: ["alt+arrowdown"],
      previousComponent: ["alt+arrowup"],
      control: ["c"],
      darkMode: ["d"],
      fullscreen: ["f"],
      width: ["w"],
      rtl: ["r"],
      source: ["s"],
      a11y: ["a"],
    },
    i18n: {
      buildTooltip:
        '💡 Tip: Run "ladle preview" to check that the build works!',
    },
    storyOrder: "(stories) => stories",
  };
const vR = ({ path: t }) =>
  C.createElement(
    "div",
    { style: { paddingTop: "2em" } },
    C.createElement("code", { className: "ladle-code" }, t),
  );
let bR = {};
function P0(t) {
  var a,
    r,
    l = "";
  if (typeof t == "string" || typeof t == "number") l += t;
  else if (typeof t == "object")
    if (Array.isArray(t)) {
      var s = t.length;
      for (a = 0; a < s; a++)
        t[a] && (r = P0(t[a])) && (l && (l += " "), (l += r));
    } else for (r in t) t[r] && (l && (l += " "), (l += r));
  return l;
}
function q0() {
  for (var t, a, r = 0, l = "", s = arguments.length; r < s; r++)
    (t = arguments[r]) && (a = P0(t)) && (l && (l += " "), (l += a));
  return l;
}
var SR = Object.create,
  Yu = Object.defineProperty,
  ER = Object.defineProperties,
  _R = Object.getOwnPropertyDescriptor,
  wR = Object.getOwnPropertyDescriptors,
  Y0 = Object.getOwnPropertyNames,
  Du = Object.getOwnPropertySymbols,
  OR = Object.getPrototypeOf,
  Gp = Object.prototype.hasOwnProperty,
  Z0 = Object.prototype.propertyIsEnumerable,
  Nv = (t, a, r) =>
    a in t
      ? Yu(t, a, { enumerable: !0, configurable: !0, writable: !0, value: r })
      : (t[a] = r),
  oa = (t, a) => {
    for (var r in a || (a = {})) Gp.call(a, r) && Nv(t, r, a[r]);
    if (Du) for (var r of Du(a)) Z0.call(a, r) && Nv(t, r, a[r]);
    return t;
  },
  Zu = (t, a) => ER(t, wR(a)),
  X0 = (t, a) => {
    var r = {};
    for (var l in t) Gp.call(t, l) && a.indexOf(l) < 0 && (r[l] = t[l]);
    if (t != null && Du)
      for (var l of Du(t)) a.indexOf(l) < 0 && Z0.call(t, l) && (r[l] = t[l]);
    return r;
  },
  xR = (t, a) =>
    function () {
      return (
        a || (0, t[Y0(t)[0]])((a = { exports: {} }).exports, a),
        a.exports
      );
    },
  CR = (t, a) => {
    for (var r in a) Yu(t, r, { get: a[r], enumerable: !0 });
  },
  TR = (t, a, r, l) => {
    if ((a && typeof a == "object") || typeof a == "function")
      for (let s of Y0(a))
        !Gp.call(t, s) &&
          s !== r &&
          Yu(t, s, {
            get: () => a[s],
            enumerable: !(l = _R(a, s)) || l.enumerable,
          });
    return t;
  },
  AR = (t, a, r) => (
    (r = t != null ? SR(OR(t)) : {}),
    TR(
      !t || !t.__esModule ? Yu(r, "default", { value: t, enumerable: !0 }) : r,
      t,
    )
  ),
  RR = xR({
    "../../node_modules/.pnpm/prismjs@1.29.0_patch_hash=vrxx3pzkik6jpmgpayxfjunetu/node_modules/prismjs/prism.js"(
      t,
      a,
    ) {
      var r = (function () {
        var l = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,
          s = 0,
          u = {},
          f = {
            util: {
              encode: function S(b) {
                return b instanceof p
                  ? new p(b.type, S(b.content), b.alias)
                  : Array.isArray(b)
                    ? b.map(S)
                    : b
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/\u00a0/g, " ");
              },
              type: function (S) {
                return Object.prototype.toString.call(S).slice(8, -1);
              },
              objId: function (S) {
                return (
                  S.__id || Object.defineProperty(S, "__id", { value: ++s }),
                  S.__id
                );
              },
              clone: function S(b, O) {
                O = O || {};
                var k, L;
                switch (f.util.type(b)) {
                  case "Object":
                    if (((L = f.util.objId(b)), O[L])) return O[L];
                    ((k = {}), (O[L] = k));
                    for (var z in b) b.hasOwnProperty(z) && (k[z] = S(b[z], O));
                    return k;
                  case "Array":
                    return (
                      (L = f.util.objId(b)),
                      O[L]
                        ? O[L]
                        : ((k = []),
                          (O[L] = k),
                          b.forEach(function (Q, ae) {
                            k[ae] = S(Q, O);
                          }),
                          k)
                    );
                  default:
                    return b;
                }
              },
              getLanguage: function (S) {
                for (; S; ) {
                  var b = l.exec(S.className);
                  if (b) return b[1].toLowerCase();
                  S = S.parentElement;
                }
                return "none";
              },
              setLanguage: function (S, b) {
                ((S.className = S.className.replace(RegExp(l, "gi"), "")),
                  S.classList.add("language-" + b));
              },
              isActive: function (S, b, O) {
                for (var k = "no-" + b; S; ) {
                  var L = S.classList;
                  if (L.contains(b)) return !0;
                  if (L.contains(k)) return !1;
                  S = S.parentElement;
                }
                return !!O;
              },
            },
            languages: {
              plain: u,
              plaintext: u,
              text: u,
              txt: u,
              extend: function (S, b) {
                var O = f.util.clone(f.languages[S]);
                for (var k in b) O[k] = b[k];
                return O;
              },
              insertBefore: function (S, b, O, k) {
                k = k || f.languages;
                var L = k[S],
                  z = {};
                for (var Q in L)
                  if (L.hasOwnProperty(Q)) {
                    if (Q == b)
                      for (var ae in O) O.hasOwnProperty(ae) && (z[ae] = O[ae]);
                    O.hasOwnProperty(Q) || (z[Q] = L[Q]);
                  }
                var re = k[S];
                return (
                  (k[S] = z),
                  f.languages.DFS(f.languages, function (q, ie) {
                    ie === re && q != S && (this[q] = z);
                  }),
                  z
                );
              },
              DFS: function S(b, O, k, L) {
                L = L || {};
                var z = f.util.objId;
                for (var Q in b)
                  if (b.hasOwnProperty(Q)) {
                    O.call(b, Q, b[Q], k || Q);
                    var ae = b[Q],
                      re = f.util.type(ae);
                    re === "Object" && !L[z(ae)]
                      ? ((L[z(ae)] = !0), S(ae, O, null, L))
                      : re === "Array" &&
                        !L[z(ae)] &&
                        ((L[z(ae)] = !0), S(ae, O, Q, L));
                  }
              },
            },
            plugins: {},
            highlight: function (S, b, O) {
              var k = { code: S, grammar: b, language: O };
              if ((f.hooks.run("before-tokenize", k), !k.grammar))
                throw new Error(
                  'The language "' + k.language + '" has no grammar.',
                );
              return (
                (k.tokens = f.tokenize(k.code, k.grammar)),
                f.hooks.run("after-tokenize", k),
                p.stringify(f.util.encode(k.tokens), k.language)
              );
            },
            tokenize: function (S, b) {
              var O = b.rest;
              if (O) {
                for (var k in O) b[k] = O[k];
                delete b.rest;
              }
              var L = new y();
              return (v(L, L.head, S), g(S, L, b, L.head, 0), w(L));
            },
            hooks: {
              all: {},
              add: function (S, b) {
                var O = f.hooks.all;
                ((O[S] = O[S] || []), O[S].push(b));
              },
              run: function (S, b) {
                var O = f.hooks.all[S];
                if (!(!O || !O.length)) for (var k = 0, L; (L = O[k++]); ) L(b);
              },
            },
            Token: p,
          };
        function p(S, b, O, k) {
          ((this.type = S),
            (this.content = b),
            (this.alias = O),
            (this.length = (k || "").length | 0));
        }
        p.stringify = function S(b, O) {
          if (typeof b == "string") return b;
          if (Array.isArray(b)) {
            var k = "";
            return (
              b.forEach(function (re) {
                k += S(re, O);
              }),
              k
            );
          }
          var L = {
              type: b.type,
              content: S(b.content, O),
              tag: "span",
              classes: ["token", b.type],
              attributes: {},
              language: O,
            },
            z = b.alias;
          (z &&
            (Array.isArray(z)
              ? Array.prototype.push.apply(L.classes, z)
              : L.classes.push(z)),
            f.hooks.run("wrap", L));
          var Q = "";
          for (var ae in L.attributes)
            Q +=
              " " +
              ae +
              '="' +
              (L.attributes[ae] || "").replace(/"/g, "&quot;") +
              '"';
          return (
            "<" +
            L.tag +
            ' class="' +
            L.classes.join(" ") +
            '"' +
            Q +
            ">" +
            L.content +
            "</" +
            L.tag +
            ">"
          );
        };
        function h(S, b, O, k) {
          S.lastIndex = b;
          var L = S.exec(O);
          if (L && k && L[1]) {
            var z = L[1].length;
            ((L.index += z), (L[0] = L[0].slice(z)));
          }
          return L;
        }
        function g(S, b, O, k, L, z) {
          for (var Q in O)
            if (!(!O.hasOwnProperty(Q) || !O[Q])) {
              var ae = O[Q];
              ae = Array.isArray(ae) ? ae : [ae];
              for (var re = 0; re < ae.length; ++re) {
                if (z && z.cause == Q + "," + re) return;
                var q = ae[re],
                  ie = q.inside,
                  se = !!q.lookbehind,
                  ve = !!q.greedy,
                  Te = q.alias;
                if (ve && !q.pattern.global) {
                  var Y = q.pattern.toString().match(/[imsuy]*$/)[0];
                  q.pattern = RegExp(q.pattern.source, Y + "g");
                }
                for (
                  var oe = q.pattern || q, ue = k.next, de = L;
                  ue !== b.tail && !(z && de >= z.reach);
                  de += ue.value.length, ue = ue.next
                ) {
                  var M = ue.value;
                  if (b.length > S.length) return;
                  if (!(M instanceof p)) {
                    var Z = 1,
                      ne;
                    if (ve) {
                      if (
                        ((ne = h(oe, de, S, se)), !ne || ne.index >= S.length)
                      )
                        break;
                      var V = ne.index,
                        he = ne.index + ne[0].length,
                        fe = de;
                      for (fe += ue.value.length; V >= fe; )
                        ((ue = ue.next), (fe += ue.value.length));
                      if (
                        ((fe -= ue.value.length),
                        (de = fe),
                        ue.value instanceof p)
                      )
                        continue;
                      for (
                        var A = ue;
                        A !== b.tail && (fe < he || typeof A.value == "string");
                        A = A.next
                      )
                        (Z++, (fe += A.value.length));
                      (Z--, (M = S.slice(de, fe)), (ne.index -= de));
                    } else if (((ne = h(oe, 0, M, se)), !ne)) continue;
                    var V = ne.index,
                      B = ne[0],
                      ce = M.slice(0, V),
                      Ce = M.slice(V + B.length),
                      ge = de + M.length;
                    z && ge > z.reach && (z.reach = ge);
                    var ke = ue.prev;
                    (ce && ((ke = v(b, ke, ce)), (de += ce.length)),
                      E(b, ke, Z));
                    var We = new p(Q, ie ? f.tokenize(B, ie) : B, Te, B);
                    if (((ue = v(b, ke, We)), Ce && v(b, ue, Ce), Z > 1)) {
                      var qe = { cause: Q + "," + re, reach: ge };
                      (g(S, b, O, ue.prev, de, qe),
                        z && qe.reach > z.reach && (z.reach = qe.reach));
                    }
                  }
                }
              }
            }
        }
        function y() {
          var S = { value: null, prev: null, next: null },
            b = { value: null, prev: S, next: null };
          ((S.next = b), (this.head = S), (this.tail = b), (this.length = 0));
        }
        function v(S, b, O) {
          var k = b.next,
            L = { value: O, prev: b, next: k };
          return ((b.next = L), (k.prev = L), S.length++, L);
        }
        function E(S, b, O) {
          for (var k = b.next, L = 0; L < O && k !== S.tail; L++) k = k.next;
          ((b.next = k), (k.prev = b), (S.length -= L));
        }
        function w(S) {
          for (var b = [], O = S.head.next; O !== S.tail; )
            (b.push(O.value), (O = O.next));
          return b;
        }
        return f;
      })();
      ((a.exports = r), (r.default = r));
    },
  }),
  te = AR(RR());
((te.languages.markup = {
  comment: { pattern: /<!--(?:(?!<!--)[\s\S])*?-->/, greedy: !0 },
  prolog: { pattern: /<\?[\s\S]+?\?>/, greedy: !0 },
  doctype: {
    pattern:
      /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
    greedy: !0,
    inside: {
      "internal-subset": {
        pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
        lookbehind: !0,
        greedy: !0,
        inside: null,
      },
      string: { pattern: /"[^"]*"|'[^']*'/, greedy: !0 },
      punctuation: /^<!|>$|[[\]]/,
      "doctype-tag": /^DOCTYPE/i,
      name: /[^\s<>'"]+/,
    },
  },
  cdata: { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, greedy: !0 },
  tag: {
    pattern:
      /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
    greedy: !0,
    inside: {
      tag: {
        pattern: /^<\/?[^\s>\/]+/,
        inside: { punctuation: /^<\/?/, namespace: /^[^\s>\/:]+:/ },
      },
      "special-attr": [],
      "attr-value": {
        pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
        inside: {
          punctuation: [
            { pattern: /^=/, alias: "attr-equals" },
            { pattern: /^(\s*)["']|["']$/, lookbehind: !0 },
          ],
        },
      },
      punctuation: /\/?>/,
      "attr-name": {
        pattern: /[^\s>\/]+/,
        inside: { namespace: /^[^\s>\/:]+:/ },
      },
    },
  },
  entity: [
    { pattern: /&[\da-z]{1,8};/i, alias: "named-entity" },
    /&#x?[\da-f]{1,8};/i,
  ],
}),
  (te.languages.markup.tag.inside["attr-value"].inside.entity =
    te.languages.markup.entity),
  (te.languages.markup.doctype.inside["internal-subset"].inside =
    te.languages.markup),
  te.hooks.add("wrap", function (t) {
    t.type === "entity" &&
      (t.attributes.title = t.content.replace(/&amp;/, "&"));
  }),
  Object.defineProperty(te.languages.markup.tag, "addInlined", {
    value: function (t, l) {
      var r = {},
        r =
          ((r["language-" + l] = {
            pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
            lookbehind: !0,
            inside: te.languages[l],
          }),
          (r.cdata = /^<!\[CDATA\[|\]\]>$/i),
          {
            "included-cdata": {
              pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
              inside: r,
            },
          }),
        l =
          ((r["language-" + l] = {
            pattern: /[\s\S]+/,
            inside: te.languages[l],
          }),
          {});
      ((l[t] = {
        pattern: RegExp(
          /(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(
            /__/g,
            function () {
              return t;
            },
          ),
          "i",
        ),
        lookbehind: !0,
        greedy: !0,
        inside: r,
      }),
        te.languages.insertBefore("markup", "cdata", l));
    },
  }),
  Object.defineProperty(te.languages.markup.tag, "addAttribute", {
    value: function (t, a) {
      te.languages.markup.tag.inside["special-attr"].push({
        pattern: RegExp(
          /(^|["'\s])/.source +
            "(?:" +
            t +
            ")" +
            /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
          "i",
        ),
        lookbehind: !0,
        inside: {
          "attr-name": /^[^\s=]+/,
          "attr-value": {
            pattern: /=[\s\S]+/,
            inside: {
              value: {
                pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
                lookbehind: !0,
                alias: [a, "language-" + a],
                inside: te.languages[a],
              },
              punctuation: [{ pattern: /^=/, alias: "attr-equals" }, /"|'/],
            },
          },
        },
      });
    },
  }),
  (te.languages.html = te.languages.markup),
  (te.languages.mathml = te.languages.markup),
  (te.languages.svg = te.languages.markup),
  (te.languages.xml = te.languages.extend("markup", {})),
  (te.languages.ssml = te.languages.xml),
  (te.languages.atom = te.languages.xml),
  (te.languages.rss = te.languages.xml),
  (function (t) {
    var a = { pattern: /\\[\\(){}[\]^$+*?|.]/, alias: "escape" },
      r =
        /\\(?:x[\da-fA-F]{2}|u[\da-fA-F]{4}|u\{[\da-fA-F]+\}|0[0-7]{0,2}|[123][0-7]{2}|c[a-zA-Z]|.)/,
      l = "(?:[^\\\\-]|" + r.source + ")",
      l = RegExp(l + "-" + l),
      s = {
        pattern: /(<|')[^<>']+(?=[>']$)/,
        lookbehind: !0,
        alias: "variable",
      };
    t.languages.regex = {
      "char-class": {
        pattern: /((?:^|[^\\])(?:\\\\)*)\[(?:[^\\\]]|\\[\s\S])*\]/,
        lookbehind: !0,
        inside: {
          "char-class-negation": {
            pattern: /(^\[)\^/,
            lookbehind: !0,
            alias: "operator",
          },
          "char-class-punctuation": {
            pattern: /^\[|\]$/,
            alias: "punctuation",
          },
          range: {
            pattern: l,
            inside: {
              escape: r,
              "range-punctuation": { pattern: /-/, alias: "operator" },
            },
          },
          "special-escape": a,
          "char-set": {
            pattern: /\\[wsd]|\\p\{[^{}]+\}/i,
            alias: "class-name",
          },
          escape: r,
        },
      },
      "special-escape": a,
      "char-set": { pattern: /\.|\\[wsd]|\\p\{[^{}]+\}/i, alias: "class-name" },
      backreference: [
        { pattern: /\\(?![123][0-7]{2})[1-9]/, alias: "keyword" },
        {
          pattern: /\\k<[^<>']+>/,
          alias: "keyword",
          inside: { "group-name": s },
        },
      ],
      anchor: { pattern: /[$^]|\\[ABbGZz]/, alias: "function" },
      escape: r,
      group: [
        {
          pattern:
            /\((?:\?(?:<[^<>']+>|'[^<>']+'|[>:]|<?[=!]|[idmnsuxU]+(?:-[idmnsuxU]+)?:?))?/,
          alias: "punctuation",
          inside: { "group-name": s },
        },
        { pattern: /\)/, alias: "punctuation" },
      ],
      quantifier: {
        pattern: /(?:[+*?]|\{\d+(?:,\d*)?\})[?+]?/,
        alias: "number",
      },
      alternation: { pattern: /\|/, alias: "keyword" },
    };
  })(te),
  (te.languages.clike = {
    comment: [
      {
        pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
        lookbehind: !0,
        greedy: !0,
      },
      { pattern: /(^|[^\\:])\/\/.*/, lookbehind: !0, greedy: !0 },
    ],
    string: {
      pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
      greedy: !0,
    },
    "class-name": {
      pattern:
        /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
      lookbehind: !0,
      inside: { punctuation: /[.\\]/ },
    },
    keyword:
      /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
    boolean: /\b(?:false|true)\b/,
    function: /\b\w+(?=\()/,
    number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
    operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
    punctuation: /[{}[\];(),.:]/,
  }),
  (te.languages.javascript = te.languages.extend("clike", {
    "class-name": [
      te.languages.clike["class-name"],
      {
        pattern:
          /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
        lookbehind: !0,
      },
    ],
    keyword: [
      { pattern: /((?:^|\})\s*)catch\b/, lookbehind: !0 },
      {
        pattern:
          /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
        lookbehind: !0,
      },
    ],
    function:
      /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    number: {
      pattern: RegExp(
        /(^|[^\w$])/.source +
          "(?:" +
          /NaN|Infinity/.source +
          "|" +
          /0[bB][01]+(?:_[01]+)*n?/.source +
          "|" +
          /0[oO][0-7]+(?:_[0-7]+)*n?/.source +
          "|" +
          /0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
          "|" +
          /\d+(?:_\d+)*n/.source +
          "|" +
          /(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/
            .source +
          ")" +
          /(?![\w$])/.source,
      ),
      lookbehind: !0,
    },
    operator:
      /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/,
  })),
  (te.languages.javascript["class-name"][0].pattern =
    /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/),
  te.languages.insertBefore("javascript", "keyword", {
    regex: {
      pattern: RegExp(
        /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
          /\//.source +
          "(?:" +
          /(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/
            .source +
          "|" +
          /(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/
            .source +
          ")" +
          /(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/
            .source,
      ),
      lookbehind: !0,
      greedy: !0,
      inside: {
        "regex-source": {
          pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
          lookbehind: !0,
          alias: "language-regex",
          inside: te.languages.regex,
        },
        "regex-delimiter": /^\/|\/$/,
        "regex-flags": /^[a-z]+$/,
      },
    },
    "function-variable": {
      pattern:
        /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
      alias: "function",
    },
    parameter: [
      {
        pattern:
          /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
        lookbehind: !0,
        inside: te.languages.javascript,
      },
      {
        pattern:
          /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
        lookbehind: !0,
        inside: te.languages.javascript,
      },
      {
        pattern:
          /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
        lookbehind: !0,
        inside: te.languages.javascript,
      },
      {
        pattern:
          /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
        lookbehind: !0,
        inside: te.languages.javascript,
      },
    ],
    constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/,
  }),
  te.languages.insertBefore("javascript", "string", {
    hashbang: { pattern: /^#!.*/, greedy: !0, alias: "comment" },
    "template-string": {
      pattern:
        /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
      greedy: !0,
      inside: {
        "template-punctuation": { pattern: /^`|`$/, alias: "string" },
        interpolation: {
          pattern:
            /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
          lookbehind: !0,
          inside: {
            "interpolation-punctuation": {
              pattern: /^\$\{|\}$/,
              alias: "punctuation",
            },
            rest: te.languages.javascript,
          },
        },
        string: /[\s\S]+/,
      },
    },
    "string-property": {
      pattern:
        /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
      lookbehind: !0,
      greedy: !0,
      alias: "property",
    },
  }),
  te.languages.insertBefore("javascript", "operator", {
    "literal-property": {
      pattern:
        /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
      lookbehind: !0,
      alias: "property",
    },
  }),
  te.languages.markup &&
    (te.languages.markup.tag.addInlined("script", "javascript"),
    te.languages.markup.tag.addAttribute(
      /on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/
        .source,
      "javascript",
    )),
  (te.languages.js = te.languages.javascript),
  (te.languages.actionscript = te.languages.extend("javascript", {
    keyword:
      /\b(?:as|break|case|catch|class|const|default|delete|do|dynamic|each|else|extends|final|finally|for|function|get|if|implements|import|in|include|instanceof|interface|internal|is|namespace|native|new|null|override|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|use|var|void|while|with)\b/,
    operator: /\+\+|--|(?:[+\-*\/%^]|&&?|\|\|?|<<?|>>?>?|[!=]=?)=?|[~?@]/,
  })),
  (te.languages.actionscript["class-name"].alias = "function"),
  delete te.languages.actionscript.parameter,
  delete te.languages.actionscript["literal-property"],
  te.languages.markup &&
    te.languages.insertBefore("actionscript", "string", {
      xml: {
        pattern:
          /(^|[^.])<\/?\w+(?:\s+[^\s>\/=]+=("|')(?:\\[\s\S]|(?!\2)[^\\])*\2)*\s*\/?>/,
        lookbehind: !0,
        inside: te.languages.markup,
      },
    }),
  (function (t) {
    var a = /#(?!\{).+/,
      r = { pattern: /#\{[^}]+\}/, alias: "variable" };
    ((t.languages.coffeescript = t.languages.extend("javascript", {
      comment: a,
      string: [
        { pattern: /'(?:\\[\s\S]|[^\\'])*'/, greedy: !0 },
        {
          pattern: /"(?:\\[\s\S]|[^\\"])*"/,
          greedy: !0,
          inside: { interpolation: r },
        },
      ],
      keyword:
        /\b(?:and|break|by|catch|class|continue|debugger|delete|do|each|else|extend|extends|false|finally|for|if|in|instanceof|is|isnt|let|loop|namespace|new|no|not|null|of|off|on|or|own|return|super|switch|then|this|throw|true|try|typeof|undefined|unless|until|when|while|window|with|yes|yield)\b/,
      "class-member": { pattern: /@(?!\d)\w+/, alias: "variable" },
    })),
      t.languages.insertBefore("coffeescript", "comment", {
        "multiline-comment": { pattern: /###[\s\S]+?###/, alias: "comment" },
        "block-regex": {
          pattern: /\/{3}[\s\S]*?\/{3}/,
          alias: "regex",
          inside: { comment: a, interpolation: r },
        },
      }),
      t.languages.insertBefore("coffeescript", "string", {
        "inline-javascript": {
          pattern: /`(?:\\[\s\S]|[^\\`])*`/,
          inside: {
            delimiter: { pattern: /^`|`$/, alias: "punctuation" },
            script: {
              pattern: /[\s\S]+/,
              alias: "language-javascript",
              inside: t.languages.javascript,
            },
          },
        },
        "multiline-string": [
          { pattern: /'''[\s\S]*?'''/, greedy: !0, alias: "string" },
          {
            pattern: /"""[\s\S]*?"""/,
            greedy: !0,
            alias: "string",
            inside: { interpolation: r },
          },
        ],
      }),
      t.languages.insertBefore("coffeescript", "keyword", {
        property: /(?!\d)\w+(?=\s*:(?!:))/,
      }),
      delete t.languages.coffeescript["template-string"],
      (t.languages.coffee = t.languages.coffeescript));
  })(te),
  (function (t) {
    var a = (t.languages.javadoclike = {
      parameter: {
        pattern:
          /(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*@(?:arg|arguments|param)\s+)\w+/m,
        lookbehind: !0,
      },
      keyword: {
        pattern: /(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*|\{)@[a-z][a-zA-Z-]+\b/m,
        lookbehind: !0,
      },
      punctuation: /[{}]/,
    });
    (Object.defineProperty(a, "addSupport", {
      value: function (r, l) {
        (r = typeof r == "string" ? [r] : r).forEach(function (s) {
          var u = function (v) {
              (v.inside || (v.inside = {}), (v.inside.rest = l));
            },
            f = "doc-comment";
          if ((p = t.languages[s])) {
            var p,
              h = p[f];
            if (
              ((h =
                h ||
                (p = t.languages.insertBefore(s, "comment", {
                  "doc-comment": {
                    pattern: /(^|[^\\])\/\*\*[^/][\s\S]*?(?:\*\/|$)/,
                    lookbehind: !0,
                    alias: "comment",
                  },
                }))[f]) instanceof RegExp && (h = p[f] = { pattern: h }),
              Array.isArray(h))
            )
              for (var g = 0, y = h.length; g < y; g++)
                (h[g] instanceof RegExp && (h[g] = { pattern: h[g] }), u(h[g]));
            else u(h);
          }
        });
      },
    }),
      a.addSupport(["java", "javascript", "php"], a));
  })(te),
  (function (t) {
    var a =
        /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/,
      a =
        ((t.languages.css = {
          comment: /\/\*[\s\S]*?\*\//,
          atrule: {
            pattern: RegExp(
              "@[\\w-](?:" +
                /[^;{\s"']|\s+(?!\s)/.source +
                "|" +
                a.source +
                ")*?" +
                /(?:;|(?=\s*\{))/.source,
            ),
            inside: {
              rule: /^@[\w-]+/,
              "selector-function-argument": {
                pattern:
                  /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
                lookbehind: !0,
                alias: "selector",
              },
              keyword: {
                pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
                lookbehind: !0,
              },
            },
          },
          url: {
            pattern: RegExp(
              "\\burl\\((?:" +
                a.source +
                "|" +
                /(?:[^\\\r\n()"']|\\[\s\S])*/.source +
                ")\\)",
              "i",
            ),
            greedy: !0,
            inside: {
              function: /^url/i,
              punctuation: /^\(|\)$/,
              string: { pattern: RegExp("^" + a.source + "$"), alias: "url" },
            },
          },
          selector: {
            pattern: RegExp(
              `(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` +
                a.source +
                ")*(?=\\s*\\{)",
            ),
            lookbehind: !0,
          },
          string: { pattern: a, greedy: !0 },
          property: {
            pattern:
              /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
            lookbehind: !0,
          },
          important: /!important\b/i,
          function: {
            pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
            lookbehind: !0,
          },
          punctuation: /[(){};:,]/,
        }),
        (t.languages.css.atrule.inside.rest = t.languages.css),
        t.languages.markup);
    a && (a.tag.addInlined("style", "css"), a.tag.addAttribute("style", "css"));
  })(te),
  (function (t) {
    var a = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
      a =
        ((t.languages.css.selector = {
          pattern: t.languages.css.selector.pattern,
          lookbehind: !0,
          inside: (a = {
            "pseudo-element":
              /:(?:after|before|first-letter|first-line|selection)|::[-\w]+/,
            "pseudo-class": /:[-\w]+/,
            class: /\.[-\w]+/,
            id: /#[-\w]+/,
            attribute: {
              pattern: RegExp(`\\[(?:[^[\\]"']|` + a.source + ")*\\]"),
              greedy: !0,
              inside: {
                punctuation: /^\[|\]$/,
                "case-sensitivity": {
                  pattern: /(\s)[si]$/i,
                  lookbehind: !0,
                  alias: "keyword",
                },
                namespace: {
                  pattern: /^(\s*)(?:(?!\s)[-*\w\xA0-\uFFFF])*\|(?!=)/,
                  lookbehind: !0,
                  inside: { punctuation: /\|$/ },
                },
                "attr-name": {
                  pattern: /^(\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+/,
                  lookbehind: !0,
                },
                "attr-value": [
                  a,
                  {
                    pattern: /(=\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+(?=\s*$)/,
                    lookbehind: !0,
                  },
                ],
                operator: /[|~*^$]?=/,
              },
            },
            "n-th": [
              {
                pattern: /(\(\s*)[+-]?\d*[\dn](?:\s*[+-]\s*\d+)?(?=\s*\))/,
                lookbehind: !0,
                inside: { number: /[\dn]+/, operator: /[+-]/ },
              },
              { pattern: /(\(\s*)(?:even|odd)(?=\s*\))/i, lookbehind: !0 },
            ],
            combinator: />|\+|~|\|\|/,
            punctuation: /[(),]/,
          }),
        }),
        (t.languages.css.atrule.inside["selector-function-argument"].inside =
          a),
        t.languages.insertBefore("css", "property", {
          variable: {
            pattern:
              /(^|[^-\w\xA0-\uFFFF])--(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*/i,
            lookbehind: !0,
          },
        }),
        { pattern: /(\b\d+)(?:%|[a-z]+(?![\w-]))/, lookbehind: !0 }),
      r = { pattern: /(^|[^\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)/, lookbehind: !0 };
    t.languages.insertBefore("css", "function", {
      operator: { pattern: /(\s)[+\-*\/](?=\s)/, lookbehind: !0 },
      hexcode: { pattern: /\B#[\da-f]{3,8}\b/i, alias: "color" },
      color: [
        {
          pattern:
            /(^|[^\w-])(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGr[ae]y|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGr[ae]y|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGr[ae]y|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gr[ae]y|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGr[ae]y|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGr[ae]y|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|RebeccaPurple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGr[ae]y|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Transparent|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)(?![\w-])/i,
          lookbehind: !0,
        },
        {
          pattern:
            /\b(?:hsl|rgb)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:hsl|rgb)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B/i,
          inside: {
            unit: a,
            number: r,
            function: /[\w-]+(?=\()/,
            punctuation: /[(),]/,
          },
        },
      ],
      entity: /\\[\da-f]{1,8}/i,
      unit: a,
      number: r,
    });
  })(te),
  (function (t) {
    var a = /[*&][^\s[\]{},]+/,
      r =
        /!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/,
      l =
        "(?:" +
        r.source +
        "(?:[ 	]+" +
        a.source +
        ")?|" +
        a.source +
        "(?:[ 	]+" +
        r.source +
        ")?)",
      s =
        /(?:[^\s\x00-\x08\x0e-\x1f!"#%&'*,\-:>?@[\]`{|}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]|[?:-]<PLAIN>)(?:[ \t]*(?:(?![#:])<PLAIN>|:<PLAIN>))*/.source.replace(
          /<PLAIN>/g,
          function () {
            return /[^\s\x00-\x08\x0e-\x1f,[\]{}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]/
              .source;
          },
        ),
      u = /"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'/.source;
    function f(p, h) {
      h = (h || "").replace(/m/g, "") + "m";
      var g =
        /([:\-,[{]\s*(?:\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|\]|\}|(?:[\r\n]\s*)?#))/.source
          .replace(/<<prop>>/g, function () {
            return l;
          })
          .replace(/<<value>>/g, function () {
            return p;
          });
      return RegExp(g, h);
    }
    ((t.languages.yaml = {
      scalar: {
        pattern: RegExp(
          /([\-:]\s*(?:\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)\S[^\r\n]*(?:\2[^\r\n]+)*)/.source.replace(
            /<<prop>>/g,
            function () {
              return l;
            },
          ),
        ),
        lookbehind: !0,
        alias: "string",
      },
      comment: /#.*/,
      key: {
        pattern: RegExp(
          /((?:^|[:\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)<<key>>(?=\s*:\s)/.source
            .replace(/<<prop>>/g, function () {
              return l;
            })
            .replace(/<<key>>/g, function () {
              return "(?:" + s + "|" + u + ")";
            }),
        ),
        lookbehind: !0,
        greedy: !0,
        alias: "atrule",
      },
      directive: {
        pattern: /(^[ \t]*)%.+/m,
        lookbehind: !0,
        alias: "important",
      },
      datetime: {
        pattern: f(
          /\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?(?:[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?))?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?/
            .source,
        ),
        lookbehind: !0,
        alias: "number",
      },
      boolean: {
        pattern: f(/false|true/.source, "i"),
        lookbehind: !0,
        alias: "important",
      },
      null: {
        pattern: f(/null|~/.source, "i"),
        lookbehind: !0,
        alias: "important",
      },
      string: { pattern: f(u), lookbehind: !0, greedy: !0 },
      number: {
        pattern: f(
          /[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|\.inf|\.nan)/
            .source,
          "i",
        ),
        lookbehind: !0,
      },
      tag: r,
      important: a,
      punctuation: /---|[:[\]{}\-,|>?]|\.\.\./,
    }),
      (t.languages.yml = t.languages.yaml));
  })(te),
  (function (t) {
    var a = /(?:\\.|[^\\\n\r]|(?:\n|\r\n?)(?![\r\n]))/.source;
    function r(g) {
      return (
        (g = g.replace(/<inner>/g, function () {
          return a;
        })),
        RegExp(/((?:^|[^\\])(?:\\{2})*)/.source + "(?:" + g + ")")
      );
    }
    var l = /(?:\\.|``(?:[^`\r\n]|`(?!`))+``|`[^`\r\n]+`|[^\\|\r\n`])+/.source,
      s = /\|?__(?:\|__)+\|?(?:(?:\n|\r\n?)|(?![\s\S]))/.source.replace(
        /__/g,
        function () {
          return l;
        },
      ),
      u = /\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?(?:\n|\r\n?)/
        .source,
      f =
        ((t.languages.markdown = t.languages.extend("markup", {})),
        t.languages.insertBefore("markdown", "prolog", {
          "front-matter-block": {
            pattern: /(^(?:\s*[\r\n])?)---(?!.)[\s\S]*?[\r\n]---(?!.)/,
            lookbehind: !0,
            greedy: !0,
            inside: {
              punctuation: /^---|---$/,
              "front-matter": {
                pattern: /\S+(?:\s+\S+)*/,
                alias: ["yaml", "language-yaml"],
                inside: t.languages.yaml,
              },
            },
          },
          blockquote: { pattern: /^>(?:[\t ]*>)*/m, alias: "punctuation" },
          table: {
            pattern: RegExp("^" + s + u + "(?:" + s + ")*", "m"),
            inside: {
              "table-data-rows": {
                pattern: RegExp("^(" + s + u + ")(?:" + s + ")*$"),
                lookbehind: !0,
                inside: {
                  "table-data": {
                    pattern: RegExp(l),
                    inside: t.languages.markdown,
                  },
                  punctuation: /\|/,
                },
              },
              "table-line": {
                pattern: RegExp("^(" + s + ")" + u + "$"),
                lookbehind: !0,
                inside: { punctuation: /\||:?-{3,}:?/ },
              },
              "table-header-row": {
                pattern: RegExp("^" + s + "$"),
                inside: {
                  "table-header": {
                    pattern: RegExp(l),
                    alias: "important",
                    inside: t.languages.markdown,
                  },
                  punctuation: /\|/,
                },
              },
            },
          },
          code: [
            {
              pattern:
                /((?:^|\n)[ \t]*\n|(?:^|\r\n?)[ \t]*\r\n?)(?: {4}|\t).+(?:(?:\n|\r\n?)(?: {4}|\t).+)*/,
              lookbehind: !0,
              alias: "keyword",
            },
            {
              pattern: /^```[\s\S]*?^```$/m,
              greedy: !0,
              inside: {
                "code-block": {
                  pattern: /^(```.*(?:\n|\r\n?))[\s\S]+?(?=(?:\n|\r\n?)^```$)/m,
                  lookbehind: !0,
                },
                "code-language": { pattern: /^(```).+/, lookbehind: !0 },
                punctuation: /```/,
              },
            },
          ],
          title: [
            {
              pattern: /\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m,
              alias: "important",
              inside: { punctuation: /==+$|--+$/ },
            },
            {
              pattern: /(^\s*)#.+/m,
              lookbehind: !0,
              alias: "important",
              inside: { punctuation: /^#+|#+$/ },
            },
          ],
          hr: {
            pattern: /(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,
            lookbehind: !0,
            alias: "punctuation",
          },
          list: {
            pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
            lookbehind: !0,
            alias: "punctuation",
          },
          "url-reference": {
            pattern:
              /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
            inside: {
              variable: { pattern: /^(!?\[)[^\]]+/, lookbehind: !0 },
              string:
                /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
              punctuation: /^[\[\]!:]|[<>]/,
            },
            alias: "url",
          },
          bold: {
            pattern: r(
              /\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/
                .source,
            ),
            lookbehind: !0,
            greedy: !0,
            inside: {
              content: {
                pattern: /(^..)[\s\S]+(?=..$)/,
                lookbehind: !0,
                inside: {},
              },
              punctuation: /\*\*|__/,
            },
          },
          italic: {
            pattern: r(
              /\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/
                .source,
            ),
            lookbehind: !0,
            greedy: !0,
            inside: {
              content: {
                pattern: /(^.)[\s\S]+(?=.$)/,
                lookbehind: !0,
                inside: {},
              },
              punctuation: /[*_]/,
            },
          },
          strike: {
            pattern: r(/(~~?)(?:(?!~)<inner>)+\2/.source),
            lookbehind: !0,
            greedy: !0,
            inside: {
              content: {
                pattern: /(^~~?)[\s\S]+(?=\1$)/,
                lookbehind: !0,
                inside: {},
              },
              punctuation: /~~?/,
            },
          },
          "code-snippet": {
            pattern:
              /(^|[^\\`])(?:``[^`\r\n]+(?:`[^`\r\n]+)*``(?!`)|`[^`\r\n]+`(?!`))/,
            lookbehind: !0,
            greedy: !0,
            alias: ["code", "keyword"],
          },
          url: {
            pattern: r(
              /!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/
                .source,
            ),
            lookbehind: !0,
            greedy: !0,
            inside: {
              operator: /^!/,
              content: {
                pattern: /(^\[)[^\]]+(?=\])/,
                lookbehind: !0,
                inside: {},
              },
              variable: {
                pattern: /(^\][ \t]?\[)[^\]]+(?=\]$)/,
                lookbehind: !0,
              },
              url: { pattern: /(^\]\()[^\s)]+/, lookbehind: !0 },
              string: {
                pattern: /(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/,
                lookbehind: !0,
              },
            },
          },
        }),
        ["url", "bold", "italic", "strike"].forEach(function (g) {
          ["url", "bold", "italic", "strike", "code-snippet"].forEach(
            function (y) {
              g !== y &&
                (t.languages.markdown[g].inside.content.inside[y] =
                  t.languages.markdown[y]);
            },
          );
        }),
        t.hooks.add("after-tokenize", function (g) {
          (g.language !== "markdown" && g.language !== "md") ||
            (function y(v) {
              if (v && typeof v != "string")
                for (var E = 0, w = v.length; E < w; E++) {
                  var S,
                    b = v[E];
                  b.type !== "code"
                    ? y(b.content)
                    : ((S = b.content[1]),
                      (b = b.content[3]),
                      S &&
                        b &&
                        S.type === "code-language" &&
                        b.type === "code-block" &&
                        typeof S.content == "string" &&
                        ((S = S.content
                          .replace(/\b#/g, "sharp")
                          .replace(/\b\+\+/g, "pp")),
                        (S =
                          "language-" +
                          (S = (/[a-z][\w-]*/i.exec(S) || [
                            "",
                          ])[0].toLowerCase())),
                        b.alias
                          ? typeof b.alias == "string"
                            ? (b.alias = [b.alias, S])
                            : b.alias.push(S)
                          : (b.alias = [S])));
                }
            })(g.tokens);
        }),
        t.hooks.add("wrap", function (g) {
          if (g.type === "code-block") {
            for (var y = "", v = 0, E = g.classes.length; v < E; v++) {
              var w = g.classes[v],
                w = /language-(.+)/.exec(w);
              if (w) {
                y = w[1];
                break;
              }
            }
            var S,
              b = t.languages[y];
            b
              ? (g.content = t.highlight(
                  (function (O) {
                    return (
                      (O = O.replace(f, "")),
                      (O = O.replace(
                        /&(\w{1,8}|#x?[\da-f]{1,8});/gi,
                        function (k, L) {
                          var z;
                          return (L = L.toLowerCase())[0] === "#"
                            ? ((z =
                                L[1] === "x"
                                  ? parseInt(L.slice(2), 16)
                                  : Number(L.slice(1))),
                              h(z))
                            : p[L] || k;
                        },
                      ))
                    );
                  })(g.content),
                  b,
                  y,
                ))
              : y &&
                y !== "none" &&
                t.plugins.autoloader &&
                ((S =
                  "md-" +
                  new Date().valueOf() +
                  "-" +
                  Math.floor(1e16 * Math.random())),
                (g.attributes.id = S),
                t.plugins.autoloader.loadLanguages(y, function () {
                  var O = document.getElementById(S);
                  O &&
                    (O.innerHTML = t.highlight(
                      O.textContent,
                      t.languages[y],
                      y,
                    ));
                }));
          }
        }),
        RegExp(t.languages.markup.tag.pattern.source, "gi")),
      p = { amp: "&", lt: "<", gt: ">", quot: '"' },
      h = String.fromCodePoint || String.fromCharCode;
    t.languages.md = t.languages.markdown;
  })(te),
  (te.languages.graphql = {
    comment: /#.*/,
    description: {
      pattern:
        /(?:"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*")(?=\s*[a-z_])/i,
      greedy: !0,
      alias: "string",
      inside: {
        "language-markdown": {
          pattern: /(^"(?:"")?)(?!\1)[\s\S]+(?=\1$)/,
          lookbehind: !0,
          inside: te.languages.markdown,
        },
      },
    },
    string: {
      pattern: /"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*"/,
      greedy: !0,
    },
    number: /(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
    boolean: /\b(?:false|true)\b/,
    variable: /\$[a-z_]\w*/i,
    directive: { pattern: /@[a-z_]\w*/i, alias: "function" },
    "attr-name": {
      pattern: /\b[a-z_]\w*(?=\s*(?:\((?:[^()"]|"(?:\\.|[^\\"\r\n])*")*\))?:)/i,
      greedy: !0,
    },
    "atom-input": { pattern: /\b[A-Z]\w*Input\b/, alias: "class-name" },
    scalar: /\b(?:Boolean|Float|ID|Int|String)\b/,
    constant: /\b[A-Z][A-Z_\d]*\b/,
    "class-name": {
      pattern:
        /(\b(?:enum|implements|interface|on|scalar|type|union)\s+|&\s*|:\s*|\[)[A-Z_]\w*/,
      lookbehind: !0,
    },
    fragment: {
      pattern: /(\bfragment\s+|\.{3}\s*(?!on\b))[a-zA-Z_]\w*/,
      lookbehind: !0,
      alias: "function",
    },
    "definition-mutation": {
      pattern: /(\bmutation\s+)[a-zA-Z_]\w*/,
      lookbehind: !0,
      alias: "function",
    },
    "definition-query": {
      pattern: /(\bquery\s+)[a-zA-Z_]\w*/,
      lookbehind: !0,
      alias: "function",
    },
    keyword:
      /\b(?:directive|enum|extend|fragment|implements|input|interface|mutation|on|query|repeatable|scalar|schema|subscription|type|union)\b/,
    operator: /[!=|&]|\.{3}/,
    "property-query": /\w+(?=\s*\()/,
    object: /\w+(?=\s*\{)/,
    punctuation: /[!(){}\[\]:=,]/,
    property: /\w+/,
  }),
  te.hooks.add("after-tokenize", function (t) {
    if (t.language === "graphql")
      for (
        var a = t.tokens.filter(function (S) {
            return (
              typeof S != "string" &&
              S.type !== "comment" &&
              S.type !== "scalar"
            );
          }),
          r = 0;
        r < a.length;
      ) {
        var l = a[r++];
        if (l.type === "keyword" && l.content === "mutation") {
          var s = [];
          if (
            v(["definition-mutation", "punctuation"]) &&
            y(1).content === "("
          ) {
            r += 2;
            var u = E(/^\($/, /^\)$/);
            if (u === -1) continue;
            for (; r < u; r++) {
              var f = y(0);
              f.type === "variable" &&
                (w(f, "variable-input"), s.push(f.content));
            }
            r = u + 1;
          }
          if (
            v(["punctuation", "property-query"]) &&
            y(0).content === "{" &&
            (r++, w(y(0), "property-mutation"), 0 < s.length)
          ) {
            var p = E(/^\{$/, /^\}$/);
            if (p !== -1)
              for (var h = r; h < p; h++) {
                var g = a[h];
                g.type === "variable" &&
                  0 <= s.indexOf(g.content) &&
                  w(g, "variable-input");
              }
          }
        }
      }
    function y(S) {
      return a[r + S];
    }
    function v(S, b) {
      b = b || 0;
      for (var O = 0; O < S.length; O++) {
        var k = y(O + b);
        if (!k || k.type !== S[O]) return;
      }
      return 1;
    }
    function E(S, b) {
      for (var O = 1, k = r; k < a.length; k++) {
        var L = a[k],
          z = L.content;
        if (L.type === "punctuation" && typeof z == "string") {
          if (S.test(z)) O++;
          else if (b.test(z) && --O === 0) return k;
        }
      }
      return -1;
    }
    function w(S, b) {
      var O = S.alias;
      (O ? Array.isArray(O) || (S.alias = O = [O]) : (S.alias = O = []),
        O.push(b));
    }
  }),
  (te.languages.sql = {
    comment: {
      pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,
      lookbehind: !0,
    },
    variable: [
      { pattern: /@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/, greedy: !0 },
      /@[\w.$]+/,
    ],
    string: {
      pattern: /(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\]|\2\2)*\2/,
      greedy: !0,
      lookbehind: !0,
    },
    identifier: {
      pattern: /(^|[^@\\])`(?:\\[\s\S]|[^`\\]|``)*`/,
      greedy: !0,
      lookbehind: !0,
      inside: { punctuation: /^`|`$/ },
    },
    function:
      /\b(?:AVG|COUNT|FIRST|FORMAT|LAST|LCASE|LEN|MAX|MID|MIN|MOD|NOW|ROUND|SUM|UCASE)(?=\s*\()/i,
    keyword:
      /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER|SET)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:COL|_INSERT)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURN(?:ING|S)?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR)\b/i,
    boolean: /\b(?:FALSE|NULL|TRUE)\b/i,
    number: /\b0x[\da-f]+\b|\b\d+(?:\.\d*)?|\B\.\d+\b/i,
    operator:
      /[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|DIV|ILIKE|IN|IS|LIKE|NOT|OR|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,
    punctuation: /[;[\]()`,.]/,
  }),
  (function (t) {
    var a = t.languages.javascript["template-string"],
      r = a.pattern.source,
      l = a.inside.interpolation,
      s = l.inside["interpolation-punctuation"],
      u = l.pattern.source;
    function f(v, E) {
      if (t.languages[v])
        return {
          pattern: RegExp("((?:" + E + ")\\s*)" + r),
          lookbehind: !0,
          greedy: !0,
          inside: {
            "template-punctuation": { pattern: /^`|`$/, alias: "string" },
            "embedded-code": { pattern: /[\s\S]+/, alias: v },
          },
        };
    }
    function p(v, E, w) {
      return (
        (v = { code: v, grammar: E, language: w }),
        t.hooks.run("before-tokenize", v),
        (v.tokens = t.tokenize(v.code, v.grammar)),
        t.hooks.run("after-tokenize", v),
        v.tokens
      );
    }
    function h(v, E, w) {
      var O = t.tokenize(v, {
          interpolation: { pattern: RegExp(u), lookbehind: !0 },
        }),
        S = 0,
        b = {},
        O = p(
          O.map(function (L) {
            if (typeof L == "string") return L;
            for (
              var z, Q, L = L.content;
              v.indexOf(
                ((Q = S++), (z = "___" + w.toUpperCase() + "_" + Q + "___")),
              ) !== -1;
            );
            return ((b[z] = L), z);
          }).join(""),
          E,
          w,
        ),
        k = Object.keys(b);
      return (
        (S = 0),
        (function L(z) {
          for (var Q = 0; Q < z.length; Q++) {
            if (S >= k.length) return;
            var ae,
              re,
              q,
              ie,
              se,
              ve,
              Te,
              Y = z[Q];
            typeof Y == "string" || typeof Y.content == "string"
              ? ((ae = k[S]),
                (Te = (ve = typeof Y == "string" ? Y : Y.content).indexOf(
                  ae,
                )) !== -1 &&
                  (++S,
                  (re = ve.substring(0, Te)),
                  (se = b[ae]),
                  (q = void 0),
                  ((ie = {})["interpolation-punctuation"] = s),
                  (ie = t.tokenize(se, ie)).length === 3 &&
                    ((q = [1, 1]).push.apply(
                      q,
                      p(ie[1], t.languages.javascript, "javascript"),
                    ),
                    ie.splice.apply(ie, q)),
                  (q = new t.Token("interpolation", ie, l.alias, se)),
                  (ie = ve.substring(Te + ae.length)),
                  (se = []),
                  re && se.push(re),
                  se.push(q),
                  ie && (L((ve = [ie])), se.push.apply(se, ve)),
                  typeof Y == "string"
                    ? (z.splice.apply(z, [Q, 1].concat(se)),
                      (Q += se.length - 1))
                    : (Y.content = se)))
              : ((Te = Y.content), Array.isArray(Te) ? L(Te) : L([Te]));
          }
        })(O),
        new t.Token(w, O, "language-" + w, v)
      );
    }
    t.languages.javascript["template-string"] = [
      f(
        "css",
        /\b(?:styled(?:\([^)]*\))?(?:\s*\.\s*\w+(?:\([^)]*\))*)*|css(?:\s*\.\s*(?:global|resolve))?|createGlobalStyle|keyframes)/
          .source,
      ),
      f("html", /\bhtml|\.\s*(?:inner|outer)HTML\s*\+?=/.source),
      f("svg", /\bsvg/.source),
      f("markdown", /\b(?:markdown|md)/.source),
      f("graphql", /\b(?:gql|graphql(?:\s*\.\s*experimental)?)/.source),
      f("sql", /\bsql/.source),
      a,
    ].filter(Boolean);
    var g = {
      javascript: !0,
      js: !0,
      typescript: !0,
      ts: !0,
      jsx: !0,
      tsx: !0,
    };
    function y(v) {
      return typeof v == "string"
        ? v
        : Array.isArray(v)
          ? v.map(y).join("")
          : y(v.content);
    }
    t.hooks.add("after-tokenize", function (v) {
      v.language in g &&
        (function E(w) {
          for (var S = 0, b = w.length; S < b; S++) {
            var O,
              k,
              L,
              z = w[S];
            typeof z != "string" &&
              ((O = z.content),
              Array.isArray(O)
                ? z.type === "template-string"
                  ? ((z = O[1]),
                    O.length === 3 &&
                      typeof z != "string" &&
                      z.type === "embedded-code" &&
                      ((k = y(z)),
                      (z = z.alias),
                      (z = Array.isArray(z) ? z[0] : z),
                      (L = t.languages[z])) &&
                      (O[1] = h(k, L, z)))
                  : E(O)
                : typeof O != "string" && E([O]));
          }
        })(v.tokens);
    });
  })(te),
  (function (t) {
    ((t.languages.typescript = t.languages.extend("javascript", {
      "class-name": {
        pattern:
          /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,
        lookbehind: !0,
        greedy: !0,
        inside: null,
      },
      builtin:
        /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/,
    })),
      t.languages.typescript.keyword.push(
        /\b(?:abstract|declare|is|keyof|readonly|require)\b/,
        /\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,
        /\btype\b(?=\s*(?:[\{*]|$))/,
      ),
      delete t.languages.typescript.parameter,
      delete t.languages.typescript["literal-property"]);
    var a = t.languages.extend("typescript", {});
    (delete a["class-name"],
      (t.languages.typescript["class-name"].inside = a),
      t.languages.insertBefore("typescript", "function", {
        decorator: {
          pattern: /@[$\w\xA0-\uFFFF]+/,
          inside: {
            at: { pattern: /^@/, alias: "operator" },
            function: /^[\s\S]+/,
          },
        },
        "generic-function": {
          pattern:
            /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,
          greedy: !0,
          inside: {
            function:
              /^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,
            generic: { pattern: /<[\s\S]+/, alias: "class-name", inside: a },
          },
        },
      }),
      (t.languages.ts = t.languages.typescript));
  })(te),
  (function (t) {
    var a = t.languages.javascript,
      r = /\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})+\}/.source,
      l = "(@(?:arg|argument|param|property)\\s+(?:" + r + "\\s+)?)";
    ((t.languages.jsdoc = t.languages.extend("javadoclike", {
      parameter: {
        pattern: RegExp(l + /(?:(?!\s)[$\w\xA0-\uFFFF.])+(?=\s|$)/.source),
        lookbehind: !0,
        inside: { punctuation: /\./ },
      },
    })),
      t.languages.insertBefore("jsdoc", "keyword", {
        "optional-parameter": {
          pattern: RegExp(
            l + /\[(?:(?!\s)[$\w\xA0-\uFFFF.])+(?:=[^[\]]+)?\](?=\s|$)/.source,
          ),
          lookbehind: !0,
          inside: {
            parameter: {
              pattern: /(^\[)[$\w\xA0-\uFFFF\.]+/,
              lookbehind: !0,
              inside: { punctuation: /\./ },
            },
            code: {
              pattern: /(=)[\s\S]*(?=\]$)/,
              lookbehind: !0,
              inside: a,
              alias: "language-javascript",
            },
            punctuation: /[=[\]]/,
          },
        },
        "class-name": [
          {
            pattern: RegExp(
              /(@(?:augments|class|extends|interface|memberof!?|template|this|typedef)\s+(?:<TYPE>\s+)?)[A-Z]\w*(?:\.[A-Z]\w*)*/.source.replace(
                /<TYPE>/g,
                function () {
                  return r;
                },
              ),
            ),
            lookbehind: !0,
            inside: { punctuation: /\./ },
          },
          {
            pattern: RegExp("(@[a-z]+\\s+)" + r),
            lookbehind: !0,
            inside: {
              string: a.string,
              number: a.number,
              boolean: a.boolean,
              keyword: t.languages.typescript.keyword,
              operator: /=>|\.\.\.|[&|?:*]/,
              punctuation: /[.,;=<>{}()[\]]/,
            },
          },
        ],
        example: {
          pattern:
            /(@example\s+(?!\s))(?:[^@\s]|\s+(?!\s))+?(?=\s*(?:\*\s*)?(?:@\w|\*\/))/,
          lookbehind: !0,
          inside: {
            code: {
              pattern: /^([\t ]*(?:\*\s*)?)\S.*$/m,
              lookbehind: !0,
              inside: a,
              alias: "language-javascript",
            },
          },
        },
      }),
      t.languages.javadoclike.addSupport("javascript", t.languages.jsdoc));
  })(te),
  (function (t) {
    ((t.languages.flow = t.languages.extend("javascript", {})),
      t.languages.insertBefore("flow", "keyword", {
        type: [
          {
            pattern:
              /\b(?:[Bb]oolean|Function|[Nn]umber|[Ss]tring|[Ss]ymbol|any|mixed|null|void)\b/,
            alias: "class-name",
          },
        ],
      }),
      (t.languages.flow["function-variable"].pattern =
        /(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=\s*(?:function\b|(?:\([^()]*\)(?:\s*:\s*\w+)?|(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/i),
      delete t.languages.flow.parameter,
      t.languages.insertBefore("flow", "operator", {
        "flow-punctuation": { pattern: /\{\||\|\}/, alias: "punctuation" },
      }),
      Array.isArray(t.languages.flow.keyword) ||
        (t.languages.flow.keyword = [t.languages.flow.keyword]),
      t.languages.flow.keyword.unshift(
        {
          pattern: /(^|[^$]\b)(?:Class|declare|opaque|type)\b(?!\$)/,
          lookbehind: !0,
        },
        {
          pattern:
            /(^|[^$]\B)\$(?:Diff|Enum|Exact|Keys|ObjMap|PropertyType|Record|Shape|Subtype|Supertype|await)\b(?!\$)/,
          lookbehind: !0,
        },
      ));
  })(te),
  (te.languages.n4js = te.languages.extend("javascript", {
    keyword:
      /\b(?:Array|any|boolean|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|module|new|null|number|package|private|protected|public|return|set|static|string|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/,
  })),
  te.languages.insertBefore("n4js", "constant", {
    annotation: { pattern: /@+\w+/, alias: "operator" },
  }),
  (te.languages.n4jsd = te.languages.n4js),
  (function (t) {
    function a(f, p) {
      return RegExp(
        f.replace(/<ID>/g, function () {
          return /(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/
            .source;
        }),
        p,
      );
    }
    (t.languages.insertBefore("javascript", "function-variable", {
      "method-variable": {
        pattern: RegExp(
          "(\\.\\s*)" +
            t.languages.javascript["function-variable"].pattern.source,
        ),
        lookbehind: !0,
        alias: ["function-variable", "method", "function", "property-access"],
      },
    }),
      t.languages.insertBefore("javascript", "function", {
        method: {
          pattern: RegExp("(\\.\\s*)" + t.languages.javascript.function.source),
          lookbehind: !0,
          alias: ["function", "property-access"],
        },
      }),
      t.languages.insertBefore("javascript", "constant", {
        "known-class-name": [
          {
            pattern:
              /\b(?:(?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)?Array|ArrayBuffer|BigInt|Boolean|DataView|Date|Error|Function|Intl|JSON|(?:Weak)?(?:Map|Set)|Math|Number|Object|Promise|Proxy|Reflect|RegExp|String|Symbol|WebAssembly)\b/,
            alias: "class-name",
          },
          { pattern: /\b(?:[A-Z]\w*)Error\b/, alias: "class-name" },
        ],
      }),
      t.languages.insertBefore("javascript", "keyword", {
        imports: {
          pattern: a(
            /(\bimport\b\s*)(?:<ID>(?:\s*,\s*(?:\*\s*as\s+<ID>|\{[^{}]*\}))?|\*\s*as\s+<ID>|\{[^{}]*\})(?=\s*\bfrom\b)/
              .source,
          ),
          lookbehind: !0,
          inside: t.languages.javascript,
        },
        exports: {
          pattern: a(
            /(\bexport\b\s*)(?:\*(?:\s*as\s+<ID>)?(?=\s*\bfrom\b)|\{[^{}]*\})/
              .source,
          ),
          lookbehind: !0,
          inside: t.languages.javascript,
        },
      }),
      t.languages.javascript.keyword.unshift(
        { pattern: /\b(?:as|default|export|from|import)\b/, alias: "module" },
        {
          pattern:
            /\b(?:await|break|catch|continue|do|else|finally|for|if|return|switch|throw|try|while|yield)\b/,
          alias: "control-flow",
        },
        { pattern: /\bnull\b/, alias: ["null", "nil"] },
        { pattern: /\bundefined\b/, alias: "nil" },
      ),
      t.languages.insertBefore("javascript", "operator", {
        spread: { pattern: /\.{3}/, alias: "operator" },
        arrow: { pattern: /=>/, alias: "operator" },
      }),
      t.languages.insertBefore("javascript", "punctuation", {
        "property-access": {
          pattern: a(/(\.\s*)#?<ID>/.source),
          lookbehind: !0,
        },
        "maybe-class-name": {
          pattern: /(^|[^$\w\xA0-\uFFFF])[A-Z][$\w\xA0-\uFFFF]+/,
          lookbehind: !0,
        },
        dom: {
          pattern:
            /\b(?:document|(?:local|session)Storage|location|navigator|performance|window)\b/,
          alias: "variable",
        },
        console: { pattern: /\bconsole(?=\s*\.)/, alias: "class-name" },
      }));
    for (
      var r = [
          "function",
          "function-variable",
          "method",
          "method-variable",
          "property-access",
        ],
        l = 0;
      l < r.length;
      l++
    ) {
      var u = r[l],
        s = t.languages.javascript[u],
        u =
          (s =
            t.util.type(s) === "RegExp"
              ? (t.languages.javascript[u] = { pattern: s })
              : s).inside || {};
      (s.inside = u)["maybe-class-name"] = /^[A-Z][\s\S]*/;
    }
  })(te),
  (function (t) {
    var a = t.util.clone(t.languages.javascript),
      r = /(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)/.source,
      l = /(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source,
      s = /(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/.source;
    function u(h, g) {
      return (
        (h = h
          .replace(/<S>/g, function () {
            return r;
          })
          .replace(/<BRACES>/g, function () {
            return l;
          })
          .replace(/<SPREAD>/g, function () {
            return s;
          })),
        RegExp(h, g)
      );
    }
    ((s = u(s).source),
      (t.languages.jsx = t.languages.extend("markup", a)),
      (t.languages.jsx.tag.pattern = u(
        /<\/?(?:[\w.:-]+(?:<S>+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"/>=]+|<BRACES>))?|<SPREAD>))*<S>*\/?)?>/
          .source,
      )),
      (t.languages.jsx.tag.inside.tag.pattern = /^<\/?[^\s>\/]*/),
      (t.languages.jsx.tag.inside["attr-value"].pattern =
        /=(?!\{)(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s'">]+)/),
      (t.languages.jsx.tag.inside.tag.inside["class-name"] =
        /^[A-Z]\w*(?:\.[A-Z]\w*)*$/),
      (t.languages.jsx.tag.inside.comment = a.comment),
      t.languages.insertBefore(
        "inside",
        "attr-name",
        { spread: { pattern: u(/<SPREAD>/.source), inside: t.languages.jsx } },
        t.languages.jsx.tag,
      ),
      t.languages.insertBefore(
        "inside",
        "special-attr",
        {
          script: {
            pattern: u(/=<BRACES>/.source),
            alias: "language-javascript",
            inside: {
              "script-punctuation": {
                pattern: /^=(?=\{)/,
                alias: "punctuation",
              },
              rest: t.languages.jsx,
            },
          },
        },
        t.languages.jsx.tag,
      ));
    function f(h) {
      for (var g = [], y = 0; y < h.length; y++) {
        var v = h[y],
          E = !1;
        (typeof v != "string" &&
          (v.type === "tag" && v.content[0] && v.content[0].type === "tag"
            ? v.content[0].content[0].content === "</"
              ? 0 < g.length &&
                g[g.length - 1].tagName === p(v.content[0].content[1]) &&
                g.pop()
              : v.content[v.content.length - 1].content !== "/>" &&
                g.push({ tagName: p(v.content[0].content[1]), openedBraces: 0 })
            : 0 < g.length && v.type === "punctuation" && v.content === "{"
              ? g[g.length - 1].openedBraces++
              : 0 < g.length &&
                  0 < g[g.length - 1].openedBraces &&
                  v.type === "punctuation" &&
                  v.content === "}"
                ? g[g.length - 1].openedBraces--
                : (E = !0)),
          (E || typeof v == "string") &&
            0 < g.length &&
            g[g.length - 1].openedBraces === 0 &&
            ((E = p(v)),
            y < h.length - 1 &&
              (typeof h[y + 1] == "string" || h[y + 1].type === "plain-text") &&
              ((E += p(h[y + 1])), h.splice(y + 1, 1)),
            0 < y &&
              (typeof h[y - 1] == "string" || h[y - 1].type === "plain-text") &&
              ((E = p(h[y - 1]) + E), h.splice(y - 1, 1), y--),
            (h[y] = new t.Token("plain-text", E, null, E))),
          v.content && typeof v.content != "string" && f(v.content));
      }
    }
    var p = function (h) {
      return h
        ? typeof h == "string"
          ? h
          : typeof h.content == "string"
            ? h.content
            : h.content.map(p).join("")
        : "";
    };
    t.hooks.add("after-tokenize", function (h) {
      (h.language !== "jsx" && h.language !== "tsx") || f(h.tokens);
    });
  })(te),
  (function (t) {
    var a = t.util.clone(t.languages.typescript),
      a =
        ((t.languages.tsx = t.languages.extend("jsx", a)),
        delete t.languages.tsx.parameter,
        delete t.languages.tsx["literal-property"],
        t.languages.tsx.tag);
    ((a.pattern = RegExp(
      /(^|[^\w$]|(?=<\/))/.source + "(?:" + a.pattern.source + ")",
      a.pattern.flags,
    )),
      (a.lookbehind = !0));
  })(te),
  (te.languages.swift = {
    comment: {
      pattern:
        /(^|[^\\:])(?:\/\/.*|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\*\/)/,
      lookbehind: !0,
      greedy: !0,
    },
    "string-literal": [
      {
        pattern: RegExp(
          /(^|[^"#])/.source +
            "(?:" +
            /"(?:\\(?:\((?:[^()]|\([^()]*\))*\)|\r\n|[^(])|[^\\\r\n"])*"/
              .source +
            "|" +
            /"""(?:\\(?:\((?:[^()]|\([^()]*\))*\)|[^(])|[^\\"]|"(?!""))*"""/
              .source +
            ")" +
            /(?!["#])/.source,
        ),
        lookbehind: !0,
        greedy: !0,
        inside: {
          interpolation: {
            pattern: /(\\\()(?:[^()]|\([^()]*\))*(?=\))/,
            lookbehind: !0,
            inside: null,
          },
          "interpolation-punctuation": {
            pattern: /^\)|\\\($/,
            alias: "punctuation",
          },
          punctuation: /\\(?=[\r\n])/,
          string: /[\s\S]+/,
        },
      },
      {
        pattern: RegExp(
          /(^|[^"#])(#+)/.source +
            "(?:" +
            /"(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|\r\n|[^#])|[^\\\r\n])*?"/
              .source +
            "|" +
            /"""(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|[^#])|[^\\])*?"""/.source +
            ")\\2",
        ),
        lookbehind: !0,
        greedy: !0,
        inside: {
          interpolation: {
            pattern: /(\\#+\()(?:[^()]|\([^()]*\))*(?=\))/,
            lookbehind: !0,
            inside: null,
          },
          "interpolation-punctuation": {
            pattern: /^\)|\\#+\($/,
            alias: "punctuation",
          },
          string: /[\s\S]+/,
        },
      },
    ],
    directive: {
      pattern: RegExp(
        /#/.source +
          "(?:" +
          /(?:elseif|if)\b/.source +
          "(?:[ 	]*" +
          /(?:![ \t]*)?(?:\b\w+\b(?:[ \t]*\((?:[^()]|\([^()]*\))*\))?|\((?:[^()]|\([^()]*\))*\))(?:[ \t]*(?:&&|\|\|))?/
            .source +
          ")+|" +
          /(?:else|endif)\b/.source +
          ")",
      ),
      alias: "property",
      inside: {
        "directive-name": /^#\w+/,
        boolean: /\b(?:false|true)\b/,
        number: /\b\d+(?:\.\d+)*\b/,
        operator: /!|&&|\|\||[<>]=?/,
        punctuation: /[(),]/,
      },
    },
    literal: {
      pattern:
        /#(?:colorLiteral|column|dsohandle|file(?:ID|Literal|Path)?|function|imageLiteral|line)\b/,
      alias: "constant",
    },
    "other-directive": { pattern: /#\w+\b/, alias: "property" },
    attribute: { pattern: /@\w+/, alias: "atrule" },
    "function-definition": {
      pattern: /(\bfunc\s+)\w+/,
      lookbehind: !0,
      alias: "function",
    },
    label: {
      pattern:
        /\b(break|continue)\s+\w+|\b[a-zA-Z_]\w*(?=\s*:\s*(?:for|repeat|while)\b)/,
      lookbehind: !0,
      alias: "important",
    },
    keyword:
      /\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/,
    boolean: /\b(?:false|true)\b/,
    nil: { pattern: /\bnil\b/, alias: "constant" },
    "short-argument": /\$\d+\b/,
    omit: { pattern: /\b_\b/, alias: "keyword" },
    number:
      /\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,
    "class-name": /\b[A-Z](?:[A-Z_\d]*[a-z]\w*)?\b/,
    function: /\b[a-z_]\w*(?=\s*\()/i,
    constant: /\b(?:[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,
    operator: /[-+*/%=!<>&|^~?]+|\.[.\-+*/%=!<>&|^~?]+/,
    punctuation: /[{}[\]();,.:\\]/,
  }),
  te.languages.swift["string-literal"].forEach(function (t) {
    t.inside.interpolation.inside = te.languages.swift;
  }),
  (function (t) {
    ((t.languages.kotlin = t.languages.extend("clike", {
      keyword: {
        pattern:
          /(^|[^.])\b(?:abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|to|try|typealias|val|var|vararg|when|where|while)\b/,
        lookbehind: !0,
      },
      function: [
        { pattern: /(?:`[^\r\n`]+`|\b\w+)(?=\s*\()/, greedy: !0 },
        {
          pattern: /(\.)(?:`[^\r\n`]+`|\w+)(?=\s*\{)/,
          lookbehind: !0,
          greedy: !0,
        },
      ],
      number:
        /\b(?:0[xX][\da-fA-F]+(?:_[\da-fA-F]+)*|0[bB][01]+(?:_[01]+)*|\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?[fFL]?)\b/,
      operator:
        /\+[+=]?|-[-=>]?|==?=?|!(?:!|==?)?|[\/*%<>]=?|[?:]:?|\.\.|&&|\|\||\b(?:and|inv|or|shl|shr|ushr|xor)\b/,
    })),
      delete t.languages.kotlin["class-name"]);
    var a = {
      "interpolation-punctuation": {
        pattern: /^\$\{?|\}$/,
        alias: "punctuation",
      },
      expression: { pattern: /[\s\S]+/, inside: t.languages.kotlin },
    };
    (t.languages.insertBefore("kotlin", "string", {
      "string-literal": [
        {
          pattern: /"""(?:[^$]|\$(?:(?!\{)|\{[^{}]*\}))*?"""/,
          alias: "multiline",
          inside: {
            interpolation: {
              pattern: /\$(?:[a-z_]\w*|\{[^{}]*\})/i,
              inside: a,
            },
            string: /[\s\S]+/,
          },
        },
        {
          pattern: /"(?:[^"\\\r\n$]|\\.|\$(?:(?!\{)|\{[^{}]*\}))*"/,
          alias: "singleline",
          inside: {
            interpolation: {
              pattern: /((?:^|[^\\])(?:\\{2})*)\$(?:[a-z_]\w*|\{[^{}]*\})/i,
              lookbehind: !0,
              inside: a,
            },
            string: /[\s\S]+/,
          },
        },
      ],
      char: {
        pattern: /'(?:[^'\\\r\n]|\\(?:.|u[a-fA-F0-9]{0,4}))'/,
        greedy: !0,
      },
    }),
      delete t.languages.kotlin.string,
      t.languages.insertBefore("kotlin", "keyword", {
        annotation: {
          pattern: /\B@(?:\w+:)?(?:[A-Z]\w*|\[[^\]]+\])/,
          alias: "builtin",
        },
      }),
      t.languages.insertBefore("kotlin", "function", {
        label: { pattern: /\b\w+@|@\w+\b/, alias: "symbol" },
      }),
      (t.languages.kt = t.languages.kotlin),
      (t.languages.kts = t.languages.kotlin));
  })(te),
  (te.languages.c = te.languages.extend("clike", {
    comment: {
      pattern:
        /\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,
      greedy: !0,
    },
    string: { pattern: /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/, greedy: !0 },
    "class-name": {
      pattern:
        /(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,
      lookbehind: !0,
    },
    keyword:
      /\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|typeof|union|unsigned|void|volatile|while)\b/,
    function: /\b[a-z_]\w*(?=\s*\()/i,
    number:
      /(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
    operator: />>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/,
  })),
  te.languages.insertBefore("c", "string", {
    char: { pattern: /'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/, greedy: !0 },
  }),
  te.languages.insertBefore("c", "string", {
    macro: {
      pattern:
        /(^[\t ]*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im,
      lookbehind: !0,
      greedy: !0,
      alias: "property",
      inside: {
        string: [
          { pattern: /^(#\s*include\s*)<[^>]+>/, lookbehind: !0 },
          te.languages.c.string,
        ],
        char: te.languages.c.char,
        comment: te.languages.c.comment,
        "macro-name": [
          { pattern: /(^#\s*define\s+)\w+\b(?!\()/i, lookbehind: !0 },
          {
            pattern: /(^#\s*define\s+)\w+\b(?=\()/i,
            lookbehind: !0,
            alias: "function",
          },
        ],
        directive: {
          pattern: /^(#\s*)[a-z]+/,
          lookbehind: !0,
          alias: "keyword",
        },
        "directive-hash": /^#/,
        punctuation: /##|\\(?=[\r\n])/,
        expression: { pattern: /\S[\s\S]*/, inside: te.languages.c },
      },
    },
  }),
  te.languages.insertBefore("c", "function", {
    constant:
      /\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout)\b/,
  }),
  delete te.languages.c.boolean,
  (te.languages.objectivec = te.languages.extend("c", {
    string: { pattern: /@?"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/, greedy: !0 },
    keyword:
      /\b(?:asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|in|inline|int|long|register|return|self|short|signed|sizeof|static|struct|super|switch|typedef|typeof|union|unsigned|void|volatile|while)\b|(?:@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,
    operator: /-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/,
  })),
  delete te.languages.objectivec["class-name"],
  (te.languages.objc = te.languages.objectivec),
  (te.languages.reason = te.languages.extend("clike", {
    string: { pattern: /"(?:\\(?:\r\n|[\s\S])|[^\\\r\n"])*"/, greedy: !0 },
    "class-name": /\b[A-Z]\w*/,
    keyword:
      /\b(?:and|as|assert|begin|class|constraint|do|done|downto|else|end|exception|external|for|fun|function|functor|if|in|include|inherit|initializer|lazy|let|method|module|mutable|new|nonrec|object|of|open|or|private|rec|sig|struct|switch|then|to|try|type|val|virtual|when|while|with)\b/,
    operator:
      /\.{3}|:[:=]|\|>|->|=(?:==?|>)?|<=?|>=?|[|^?'#!~`]|[+\-*\/]\.?|\b(?:asr|land|lor|lsl|lsr|lxor|mod)\b/,
  })),
  te.languages.insertBefore("reason", "class-name", {
    char: {
      pattern: /'(?:\\x[\da-f]{2}|\\o[0-3][0-7][0-7]|\\\d{3}|\\.|[^'\\\r\n])'/,
      greedy: !0,
    },
    constructor: /\b[A-Z]\w*\b(?!\s*\.)/,
    label: { pattern: /\b[a-z]\w*(?=::)/, alias: "symbol" },
  }),
  delete te.languages.reason.function,
  (function (t) {
    for (
      var a = /\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\//.source, r = 0;
      r < 2;
      r++
    )
      a = a.replace(/<self>/g, function () {
        return a;
      });
    ((a = a.replace(/<self>/g, function () {
      return /[^\s\S]/.source;
    })),
      (t.languages.rust = {
        comment: [
          {
            pattern: RegExp(/(^|[^\\])/.source + a),
            lookbehind: !0,
            greedy: !0,
          },
          { pattern: /(^|[^\\:])\/\/.*/, lookbehind: !0, greedy: !0 },
        ],
        string: {
          pattern: /b?"(?:\\[\s\S]|[^\\"])*"|b?r(#*)"(?:[^"]|"(?!\1))*"\1/,
          greedy: !0,
        },
        char: {
          pattern:
            /b?'(?:\\(?:x[0-7][\da-fA-F]|u\{(?:[\da-fA-F]_*){1,6}\}|.)|[^\\\r\n\t'])'/,
          greedy: !0,
        },
        attribute: {
          pattern: /#!?\[(?:[^\[\]"]|"(?:\\[\s\S]|[^\\"])*")*\]/,
          greedy: !0,
          alias: "attr-name",
          inside: { string: null },
        },
        "closure-params": {
          pattern: /([=(,:]\s*|\bmove\s*)\|[^|]*\||\|[^|]*\|(?=\s*(?:\{|->))/,
          lookbehind: !0,
          greedy: !0,
          inside: {
            "closure-punctuation": { pattern: /^\||\|$/, alias: "punctuation" },
            rest: null,
          },
        },
        "lifetime-annotation": { pattern: /'\w+/, alias: "symbol" },
        "fragment-specifier": {
          pattern: /(\$\w+:)[a-z]+/,
          lookbehind: !0,
          alias: "punctuation",
        },
        variable: /\$\w+/,
        "function-definition": {
          pattern: /(\bfn\s+)\w+/,
          lookbehind: !0,
          alias: "function",
        },
        "type-definition": {
          pattern: /(\b(?:enum|struct|trait|type|union)\s+)\w+/,
          lookbehind: !0,
          alias: "class-name",
        },
        "module-declaration": [
          {
            pattern: /(\b(?:crate|mod)\s+)[a-z][a-z_\d]*/,
            lookbehind: !0,
            alias: "namespace",
          },
          {
            pattern:
              /(\b(?:crate|self|super)\s*)::\s*[a-z][a-z_\d]*\b(?:\s*::(?:\s*[a-z][a-z_\d]*\s*::)*)?/,
            lookbehind: !0,
            alias: "namespace",
            inside: { punctuation: /::/ },
          },
        ],
        keyword: [
          /\b(?:Self|abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,
          /\b(?:bool|char|f(?:32|64)|[ui](?:8|16|32|64|128|size)|str)\b/,
        ],
        function: /\b[a-z_]\w*(?=\s*(?:::\s*<|\())/,
        macro: { pattern: /\b\w+!/, alias: "property" },
        constant: /\b[A-Z_][A-Z_\d]+\b/,
        "class-name": /\b[A-Z]\w*\b/,
        namespace: {
          pattern: /(?:\b[a-z][a-z_\d]*\s*::\s*)*\b[a-z][a-z_\d]*\s*::(?!\s*<)/,
          inside: { punctuation: /::/ },
        },
        number:
          /\b(?:0x[\dA-Fa-f](?:_?[\dA-Fa-f])*|0o[0-7](?:_?[0-7])*|0b[01](?:_?[01])*|(?:(?:\d(?:_?\d)*)?\.)?\d(?:_?\d)*(?:[Ee][+-]?\d+)?)(?:_?(?:f32|f64|[iu](?:8|16|32|64|size)?))?\b/,
        boolean: /\b(?:false|true)\b/,
        punctuation: /->|\.\.=|\.{1,3}|::|[{}[\];(),:]/,
        operator: /[-+*\/%!^]=?|=[=>]?|&[&=]?|\|[|=]?|<<?=?|>>?=?|[@?]/,
      }),
      (t.languages.rust["closure-params"].inside.rest = t.languages.rust),
      (t.languages.rust.attribute.inside.string = t.languages.rust.string));
  })(te),
  (te.languages.go = te.languages.extend("clike", {
    string: {
      pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"|`[^`]*`/,
      lookbehind: !0,
      greedy: !0,
    },
    keyword:
      /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
    boolean: /\b(?:_|false|iota|nil|true)\b/,
    number: [
      /\b0(?:b[01_]+|o[0-7_]+)i?\b/i,
      /\b0x(?:[a-f\d_]+(?:\.[a-f\d_]*)?|\.[a-f\d_]+)(?:p[+-]?\d+(?:_\d+)*)?i?(?!\w)/i,
      /(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?[\d_]+)?i?(?!\w)/i,
    ],
    operator:
      /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,
    builtin:
      /\b(?:append|bool|byte|cap|close|complex|complex(?:64|128)|copy|delete|error|float(?:32|64)|u?int(?:8|16|32|64)?|imag|len|make|new|panic|print(?:ln)?|real|recover|rune|string|uintptr)\b/,
  })),
  te.languages.insertBefore("go", "string", {
    char: { pattern: /'(?:\\.|[^'\\\r\n]){0,10}'/, greedy: !0 },
  }),
  delete te.languages.go["class-name"],
  (function (t) {
    var a =
        /\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|char8_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|final|float|for|friend|goto|if|import|inline|int|int16_t|int32_t|int64_t|int8_t|long|module|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|uint16_t|uint32_t|uint64_t|uint8_t|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/,
      r = /\b(?!<keyword>)\w+(?:\s*\.\s*\w+)*\b/.source.replace(
        /<keyword>/g,
        function () {
          return a.source;
        },
      );
    ((t.languages.cpp = t.languages.extend("c", {
      "class-name": [
        {
          pattern: RegExp(
            /(\b(?:class|concept|enum|struct|typename)\s+)(?!<keyword>)\w+/.source.replace(
              /<keyword>/g,
              function () {
                return a.source;
              },
            ),
          ),
          lookbehind: !0,
        },
        /\b[A-Z]\w*(?=\s*::\s*\w+\s*\()/,
        /\b[A-Z_]\w*(?=\s*::\s*~\w+\s*\()/i,
        /\b\w+(?=\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>\s*::\s*\w+\s*\()/,
      ],
      keyword: a,
      number: {
        pattern:
          /(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/i,
        greedy: !0,
      },
      operator:
        />>=?|<<=?|->|--|\+\+|&&|\|\||[?:~]|<=>|[-+*/%&|^!=<>]=?|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/,
      boolean: /\b(?:false|true)\b/,
    })),
      t.languages.insertBefore("cpp", "string", {
        module: {
          pattern: RegExp(
            /(\b(?:import|module)\s+)/.source +
              "(?:" +
              /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|<[^<>\r\n]*>/.source +
              "|" +
              /<mod-name>(?:\s*:\s*<mod-name>)?|:\s*<mod-name>/.source.replace(
                /<mod-name>/g,
                function () {
                  return r;
                },
              ) +
              ")",
          ),
          lookbehind: !0,
          greedy: !0,
          inside: { string: /^[<"][\s\S]+/, operator: /:/, punctuation: /\./ },
        },
        "raw-string": {
          pattern: /R"([^()\\ ]{0,16})\([\s\S]*?\)\1"/,
          alias: "string",
          greedy: !0,
        },
      }),
      t.languages.insertBefore("cpp", "keyword", {
        "generic-function": {
          pattern:
            /\b(?!operator\b)[a-z_]\w*\s*<(?:[^<>]|<[^<>]*>)*>(?=\s*\()/i,
          inside: {
            function: /^\w+/,
            generic: {
              pattern: /<[\s\S]+/,
              alias: "class-name",
              inside: t.languages.cpp,
            },
          },
        },
      }),
      t.languages.insertBefore("cpp", "operator", {
        "double-colon": { pattern: /::/, alias: "punctuation" },
      }),
      t.languages.insertBefore("cpp", "class-name", {
        "base-clause": {
          pattern:
            /(\b(?:class|struct)\s+\w+\s*:\s*)[^;{}"'\s]+(?:\s+[^;{}"'\s]+)*(?=\s*[;{])/,
          lookbehind: !0,
          greedy: !0,
          inside: t.languages.extend("cpp", {}),
        },
      }),
      t.languages.insertBefore(
        "inside",
        "double-colon",
        { "class-name": /\b[a-z_]\w*\b(?!\s*::)/i },
        t.languages.cpp["base-clause"],
      ));
  })(te),
  (te.languages.python = {
    comment: { pattern: /(^|[^\\])#.*/, lookbehind: !0, greedy: !0 },
    "string-interpolation": {
      pattern:
        /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
      greedy: !0,
      inside: {
        interpolation: {
          pattern:
            /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
          lookbehind: !0,
          inside: {
            "format-spec": { pattern: /(:)[^:(){}]+(?=\}$)/, lookbehind: !0 },
            "conversion-option": {
              pattern: /![sra](?=[:}]$)/,
              alias: "punctuation",
            },
            rest: null,
          },
        },
        string: /[\s\S]+/,
      },
    },
    "triple-quoted-string": {
      pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
      greedy: !0,
      alias: "string",
    },
    string: {
      pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
      greedy: !0,
    },
    function: {
      pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
      lookbehind: !0,
    },
    "class-name": { pattern: /(\bclass\s+)\w+/i, lookbehind: !0 },
    decorator: {
      pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
      lookbehind: !0,
      alias: ["annotation", "punctuation"],
      inside: { punctuation: /\./ },
    },
    keyword:
      /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
    builtin:
      /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
    boolean: /\b(?:False|None|True)\b/,
    number:
      /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
    operator: /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
    punctuation: /[{}[\];(),.:]/,
  }),
  (te.languages.python[
    "string-interpolation"
  ].inside.interpolation.inside.rest = te.languages.python),
  (te.languages.py = te.languages.python),
  (te.languages.json = {
    property: {
      pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
      lookbehind: !0,
      greedy: !0,
    },
    string: {
      pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
      lookbehind: !0,
      greedy: !0,
    },
    comment: { pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/, greedy: !0 },
    number: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
    punctuation: /[{}[\],]/,
    operator: /:/,
    boolean: /\b(?:false|true)\b/,
    null: { pattern: /\bnull\b/, alias: "keyword" },
  }),
  (te.languages.webmanifest = te.languages.json));
var fo = {};
CR(fo, {
  dracula: () => DR,
  duotoneDark: () => NR,
  duotoneLight: () => jR,
  github: () => BR,
  gruvboxMaterialDark: () => dk,
  gruvboxMaterialLight: () => hk,
  jettwaveDark: () => rk,
  jettwaveLight: () => lk,
  nightOwl: () => FR,
  nightOwlLight: () => HR,
  oceanicNext: () => VR,
  okaidia: () => PR,
  oneDark: () => sk,
  oneLight: () => ck,
  palenight: () => YR,
  shadesOfPurple: () => XR,
  synthwave84: () => QR,
  ultramin: () => WR,
  vsDark: () => K0,
  vsLight: () => nk,
});
var kR = {
    plain: { color: "#F8F8F2", backgroundColor: "#282A36" },
    styles: [
      {
        types: ["prolog", "constant", "builtin"],
        style: { color: "rgb(189, 147, 249)" },
      },
      {
        types: ["inserted", "function"],
        style: { color: "rgb(80, 250, 123)" },
      },
      { types: ["deleted"], style: { color: "rgb(255, 85, 85)" } },
      { types: ["changed"], style: { color: "rgb(255, 184, 108)" } },
      {
        types: ["punctuation", "symbol"],
        style: { color: "rgb(248, 248, 242)" },
      },
      {
        types: ["string", "char", "tag", "selector"],
        style: { color: "rgb(255, 121, 198)" },
      },
      {
        types: ["keyword", "variable"],
        style: { color: "rgb(189, 147, 249)", fontStyle: "italic" },
      },
      { types: ["comment"], style: { color: "rgb(98, 114, 164)" } },
      { types: ["attr-name"], style: { color: "rgb(241, 250, 140)" } },
    ],
  },
  DR = kR,
  LR = {
    plain: { backgroundColor: "#2a2734", color: "#9a86fd" },
    styles: [
      {
        types: ["comment", "prolog", "doctype", "cdata", "punctuation"],
        style: { color: "#6c6783" },
      },
      { types: ["namespace"], style: { opacity: 0.7 } },
      { types: ["tag", "operator", "number"], style: { color: "#e09142" } },
      { types: ["property", "function"], style: { color: "#9a86fd" } },
      {
        types: ["tag-id", "selector", "atrule-id"],
        style: { color: "#eeebff" },
      },
      { types: ["attr-name"], style: { color: "#c4b9fe" } },
      {
        types: [
          "boolean",
          "string",
          "entity",
          "url",
          "attr-value",
          "keyword",
          "control",
          "directive",
          "unit",
          "statement",
          "regex",
          "atrule",
          "placeholder",
          "variable",
        ],
        style: { color: "#ffcc99" },
      },
      { types: ["deleted"], style: { textDecorationLine: "line-through" } },
      { types: ["inserted"], style: { textDecorationLine: "underline" } },
      { types: ["italic"], style: { fontStyle: "italic" } },
      { types: ["important", "bold"], style: { fontWeight: "bold" } },
      { types: ["important"], style: { color: "#c4b9fe" } },
    ],
  },
  NR = LR,
  MR = {
    plain: { backgroundColor: "#faf8f5", color: "#728fcb" },
    styles: [
      {
        types: ["comment", "prolog", "doctype", "cdata", "punctuation"],
        style: { color: "#b6ad9a" },
      },
      { types: ["namespace"], style: { opacity: 0.7 } },
      { types: ["tag", "operator", "number"], style: { color: "#063289" } },
      { types: ["property", "function"], style: { color: "#b29762" } },
      {
        types: ["tag-id", "selector", "atrule-id"],
        style: { color: "#2d2006" },
      },
      { types: ["attr-name"], style: { color: "#896724" } },
      {
        types: [
          "boolean",
          "string",
          "entity",
          "url",
          "attr-value",
          "keyword",
          "control",
          "directive",
          "unit",
          "statement",
          "regex",
          "atrule",
        ],
        style: { color: "#728fcb" },
      },
      { types: ["placeholder", "variable"], style: { color: "#93abdc" } },
      { types: ["deleted"], style: { textDecorationLine: "line-through" } },
      { types: ["inserted"], style: { textDecorationLine: "underline" } },
      { types: ["italic"], style: { fontStyle: "italic" } },
      { types: ["important", "bold"], style: { fontWeight: "bold" } },
      { types: ["important"], style: { color: "#896724" } },
    ],
  },
  jR = MR,
  zR = {
    plain: { color: "#393A34", backgroundColor: "#f6f8fa" },
    styles: [
      {
        types: ["comment", "prolog", "doctype", "cdata"],
        style: { color: "#999988", fontStyle: "italic" },
      },
      { types: ["namespace"], style: { opacity: 0.7 } },
      { types: ["string", "attr-value"], style: { color: "#e3116c" } },
      { types: ["punctuation", "operator"], style: { color: "#393A34" } },
      {
        types: [
          "entity",
          "url",
          "symbol",
          "number",
          "boolean",
          "variable",
          "constant",
          "property",
          "regex",
          "inserted",
        ],
        style: { color: "#36acaa" },
      },
      {
        types: ["atrule", "keyword", "attr-name", "selector"],
        style: { color: "#00a4db" },
      },
      { types: ["function", "deleted", "tag"], style: { color: "#d73a49" } },
      { types: ["function-variable"], style: { color: "#6f42c1" } },
      { types: ["tag", "selector", "keyword"], style: { color: "#00009f" } },
    ],
  },
  BR = zR,
  UR = {
    plain: { color: "#d6deeb", backgroundColor: "#011627" },
    styles: [
      {
        types: ["changed"],
        style: { color: "rgb(162, 191, 252)", fontStyle: "italic" },
      },
      {
        types: ["deleted"],
        style: { color: "rgba(239, 83, 80, 0.56)", fontStyle: "italic" },
      },
      {
        types: ["inserted", "attr-name"],
        style: { color: "rgb(173, 219, 103)", fontStyle: "italic" },
      },
      {
        types: ["comment"],
        style: { color: "rgb(99, 119, 119)", fontStyle: "italic" },
      },
      { types: ["string", "url"], style: { color: "rgb(173, 219, 103)" } },
      { types: ["variable"], style: { color: "rgb(214, 222, 235)" } },
      { types: ["number"], style: { color: "rgb(247, 140, 108)" } },
      {
        types: ["builtin", "char", "constant", "function"],
        style: { color: "rgb(130, 170, 255)" },
      },
      { types: ["punctuation"], style: { color: "rgb(199, 146, 234)" } },
      {
        types: ["selector", "doctype"],
        style: { color: "rgb(199, 146, 234)", fontStyle: "italic" },
      },
      { types: ["class-name"], style: { color: "rgb(255, 203, 139)" } },
      {
        types: ["tag", "operator", "keyword"],
        style: { color: "rgb(127, 219, 202)" },
      },
      { types: ["boolean"], style: { color: "rgb(255, 88, 116)" } },
      { types: ["property"], style: { color: "rgb(128, 203, 196)" } },
      { types: ["namespace"], style: { color: "rgb(178, 204, 214)" } },
    ],
  },
  FR = UR,
  IR = {
    plain: { color: "#403f53", backgroundColor: "#FBFBFB" },
    styles: [
      {
        types: ["changed"],
        style: { color: "rgb(162, 191, 252)", fontStyle: "italic" },
      },
      {
        types: ["deleted"],
        style: { color: "rgba(239, 83, 80, 0.56)", fontStyle: "italic" },
      },
      {
        types: ["inserted", "attr-name"],
        style: { color: "rgb(72, 118, 214)", fontStyle: "italic" },
      },
      {
        types: ["comment"],
        style: { color: "rgb(152, 159, 177)", fontStyle: "italic" },
      },
      {
        types: ["string", "builtin", "char", "constant", "url"],
        style: { color: "rgb(72, 118, 214)" },
      },
      { types: ["variable"], style: { color: "rgb(201, 103, 101)" } },
      { types: ["number"], style: { color: "rgb(170, 9, 130)" } },
      { types: ["punctuation"], style: { color: "rgb(153, 76, 195)" } },
      {
        types: ["function", "selector", "doctype"],
        style: { color: "rgb(153, 76, 195)", fontStyle: "italic" },
      },
      { types: ["class-name"], style: { color: "rgb(17, 17, 17)" } },
      { types: ["tag"], style: { color: "rgb(153, 76, 195)" } },
      {
        types: ["operator", "property", "keyword", "namespace"],
        style: { color: "rgb(12, 150, 155)" },
      },
      { types: ["boolean"], style: { color: "rgb(188, 84, 84)" } },
    ],
  },
  HR = IR,
  gn = {
    char: "#D8DEE9",
    comment: "#999999",
    keyword: "#c5a5c5",
    primitive: "#5a9bcf",
    string: "#8dc891",
    variable: "#d7deea",
    boolean: "#ff8b50",
    tag: "#fc929e",
    function: "#79b6f2",
    className: "#FAC863",
  },
  $R = {
    plain: { backgroundColor: "#282c34", color: "#ffffff" },
    styles: [
      { types: ["attr-name"], style: { color: gn.keyword } },
      { types: ["attr-value"], style: { color: gn.string } },
      {
        types: [
          "comment",
          "block-comment",
          "prolog",
          "doctype",
          "cdata",
          "shebang",
        ],
        style: { color: gn.comment },
      },
      {
        types: [
          "property",
          "number",
          "function-name",
          "constant",
          "symbol",
          "deleted",
        ],
        style: { color: gn.primitive },
      },
      { types: ["boolean"], style: { color: gn.boolean } },
      { types: ["tag"], style: { color: gn.tag } },
      { types: ["string"], style: { color: gn.string } },
      { types: ["punctuation"], style: { color: gn.string } },
      {
        types: ["selector", "char", "builtin", "inserted"],
        style: { color: gn.char },
      },
      { types: ["function"], style: { color: gn.function } },
      {
        types: ["operator", "entity", "url", "variable"],
        style: { color: gn.variable },
      },
      { types: ["keyword"], style: { color: gn.keyword } },
      { types: ["atrule", "class-name"], style: { color: gn.className } },
      { types: ["important"], style: { fontWeight: "400" } },
      { types: ["bold"], style: { fontWeight: "bold" } },
      { types: ["italic"], style: { fontStyle: "italic" } },
      { types: ["namespace"], style: { opacity: 0.7 } },
    ],
  },
  VR = $R,
  GR = {
    plain: { color: "#f8f8f2", backgroundColor: "#272822" },
    styles: [
      {
        types: ["changed"],
        style: { color: "rgb(162, 191, 252)", fontStyle: "italic" },
      },
      { types: ["deleted"], style: { color: "#f92672", fontStyle: "italic" } },
      {
        types: ["inserted"],
        style: { color: "rgb(173, 219, 103)", fontStyle: "italic" },
      },
      { types: ["comment"], style: { color: "#8292a2", fontStyle: "italic" } },
      { types: ["string", "url"], style: { color: "#a6e22e" } },
      { types: ["variable"], style: { color: "#f8f8f2" } },
      { types: ["number"], style: { color: "#ae81ff" } },
      {
        types: ["builtin", "char", "constant", "function", "class-name"],
        style: { color: "#e6db74" },
      },
      { types: ["punctuation"], style: { color: "#f8f8f2" } },
      {
        types: ["selector", "doctype"],
        style: { color: "#a6e22e", fontStyle: "italic" },
      },
      { types: ["tag", "operator", "keyword"], style: { color: "#66d9ef" } },
      { types: ["boolean"], style: { color: "#ae81ff" } },
      {
        types: ["namespace"],
        style: { color: "rgb(178, 204, 214)", opacity: 0.7 },
      },
      { types: ["tag", "property"], style: { color: "#f92672" } },
      { types: ["attr-name"], style: { color: "#a6e22e !important" } },
      { types: ["doctype"], style: { color: "#8292a2" } },
      { types: ["rule"], style: { color: "#e6db74" } },
    ],
  },
  PR = GR,
  qR = {
    plain: { color: "#bfc7d5", backgroundColor: "#292d3e" },
    styles: [
      {
        types: ["comment"],
        style: { color: "rgb(105, 112, 152)", fontStyle: "italic" },
      },
      { types: ["string", "inserted"], style: { color: "rgb(195, 232, 141)" } },
      { types: ["number"], style: { color: "rgb(247, 140, 108)" } },
      {
        types: ["builtin", "char", "constant", "function"],
        style: { color: "rgb(130, 170, 255)" },
      },
      {
        types: ["punctuation", "selector"],
        style: { color: "rgb(199, 146, 234)" },
      },
      { types: ["variable"], style: { color: "rgb(191, 199, 213)" } },
      {
        types: ["class-name", "attr-name"],
        style: { color: "rgb(255, 203, 107)" },
      },
      { types: ["tag", "deleted"], style: { color: "rgb(255, 85, 114)" } },
      { types: ["operator"], style: { color: "rgb(137, 221, 255)" } },
      { types: ["boolean"], style: { color: "rgb(255, 88, 116)" } },
      { types: ["keyword"], style: { fontStyle: "italic" } },
      {
        types: ["doctype"],
        style: { color: "rgb(199, 146, 234)", fontStyle: "italic" },
      },
      { types: ["namespace"], style: { color: "rgb(178, 204, 214)" } },
      { types: ["url"], style: { color: "rgb(221, 221, 221)" } },
    ],
  },
  YR = qR,
  ZR = {
    plain: { color: "#9EFEFF", backgroundColor: "#2D2A55" },
    styles: [
      { types: ["changed"], style: { color: "rgb(255, 238, 128)" } },
      { types: ["deleted"], style: { color: "rgba(239, 83, 80, 0.56)" } },
      { types: ["inserted"], style: { color: "rgb(173, 219, 103)" } },
      {
        types: ["comment"],
        style: { color: "rgb(179, 98, 255)", fontStyle: "italic" },
      },
      { types: ["punctuation"], style: { color: "rgb(255, 255, 255)" } },
      { types: ["constant"], style: { color: "rgb(255, 98, 140)" } },
      { types: ["string", "url"], style: { color: "rgb(165, 255, 144)" } },
      { types: ["variable"], style: { color: "rgb(255, 238, 128)" } },
      { types: ["number", "boolean"], style: { color: "rgb(255, 98, 140)" } },
      { types: ["attr-name"], style: { color: "rgb(255, 180, 84)" } },
      {
        types: [
          "keyword",
          "operator",
          "property",
          "namespace",
          "tag",
          "selector",
          "doctype",
        ],
        style: { color: "rgb(255, 157, 0)" },
      },
      {
        types: ["builtin", "char", "constant", "function", "class-name"],
        style: { color: "rgb(250, 208, 0)" },
      },
    ],
  },
  XR = ZR,
  KR = {
    plain: {
      backgroundColor: "linear-gradient(to bottom, #2a2139 75%, #34294f)",
      backgroundImage: "#34294f",
      color: "#f92aad",
      textShadow: "0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3",
    },
    styles: [
      {
        types: ["comment", "block-comment", "prolog", "doctype", "cdata"],
        style: { color: "#495495", fontStyle: "italic" },
      },
      { types: ["punctuation"], style: { color: "#ccc" } },
      {
        types: [
          "tag",
          "attr-name",
          "namespace",
          "number",
          "unit",
          "hexcode",
          "deleted",
        ],
        style: { color: "#e2777a" },
      },
      {
        types: ["property", "selector"],
        style: {
          color: "#72f1b8",
          textShadow: "0 0 2px #100c0f, 0 0 10px #257c5575, 0 0 35px #21272475",
        },
      },
      { types: ["function-name"], style: { color: "#6196cc" } },
      {
        types: ["boolean", "selector-id", "function"],
        style: {
          color: "#fdfdfd",
          textShadow:
            "0 0 2px #001716, 0 0 3px #03edf975, 0 0 5px #03edf975, 0 0 8px #03edf975",
        },
      },
      {
        types: ["class-name", "maybe-class-name", "builtin"],
        style: {
          color: "#fff5f6",
          textShadow:
            "0 0 2px #000, 0 0 10px #fc1f2c75, 0 0 5px #fc1f2c75, 0 0 25px #fc1f2c75",
        },
      },
      {
        types: ["constant", "symbol"],
        style: {
          color: "#f92aad",
          textShadow: "0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3",
        },
      },
      {
        types: ["important", "atrule", "keyword", "selector-class"],
        style: {
          color: "#f4eee4",
          textShadow: "0 0 2px #393a33, 0 0 8px #f39f0575, 0 0 2px #f39f0575",
        },
      },
      {
        types: ["string", "char", "attr-value", "regex", "variable"],
        style: { color: "#f87c32" },
      },
      { types: ["parameter"], style: { fontStyle: "italic" } },
      { types: ["entity", "url"], style: { color: "#67cdcc" } },
      { types: ["operator"], style: { color: "ffffffee" } },
      { types: ["important", "bold"], style: { fontWeight: "bold" } },
      { types: ["italic"], style: { fontStyle: "italic" } },
      { types: ["entity"], style: { cursor: "help" } },
      { types: ["inserted"], style: { color: "green" } },
    ],
  },
  QR = KR,
  JR = {
    plain: { color: "#282a2e", backgroundColor: "#ffffff" },
    styles: [
      { types: ["comment"], style: { color: "rgb(197, 200, 198)" } },
      {
        types: ["string", "number", "builtin", "variable"],
        style: { color: "rgb(150, 152, 150)" },
      },
      {
        types: ["class-name", "function", "tag", "attr-name"],
        style: { color: "rgb(40, 42, 46)" },
      },
    ],
  },
  WR = JR,
  ek = {
    plain: { color: "#9CDCFE", backgroundColor: "#1E1E1E" },
    styles: [
      { types: ["prolog"], style: { color: "rgb(0, 0, 128)" } },
      { types: ["comment"], style: { color: "rgb(106, 153, 85)" } },
      {
        types: ["builtin", "changed", "keyword", "interpolation-punctuation"],
        style: { color: "rgb(86, 156, 214)" },
      },
      { types: ["number", "inserted"], style: { color: "rgb(181, 206, 168)" } },
      { types: ["constant"], style: { color: "rgb(100, 102, 149)" } },
      {
        types: ["attr-name", "variable"],
        style: { color: "rgb(156, 220, 254)" },
      },
      {
        types: ["deleted", "string", "attr-value", "template-punctuation"],
        style: { color: "rgb(206, 145, 120)" },
      },
      { types: ["selector"], style: { color: "rgb(215, 186, 125)" } },
      { types: ["tag"], style: { color: "rgb(78, 201, 176)" } },
      {
        types: ["tag"],
        languages: ["markup"],
        style: { color: "rgb(86, 156, 214)" },
      },
      {
        types: ["punctuation", "operator"],
        style: { color: "rgb(212, 212, 212)" },
      },
      {
        types: ["punctuation"],
        languages: ["markup"],
        style: { color: "#808080" },
      },
      { types: ["function"], style: { color: "rgb(220, 220, 170)" } },
      { types: ["class-name"], style: { color: "rgb(78, 201, 176)" } },
      { types: ["char"], style: { color: "rgb(209, 105, 105)" } },
    ],
  },
  K0 = ek,
  tk = {
    plain: { color: "#000000", backgroundColor: "#ffffff" },
    styles: [
      { types: ["comment"], style: { color: "rgb(0, 128, 0)" } },
      { types: ["builtin"], style: { color: "rgb(0, 112, 193)" } },
      {
        types: ["number", "variable", "inserted"],
        style: { color: "rgb(9, 134, 88)" },
      },
      { types: ["operator"], style: { color: "rgb(0, 0, 0)" } },
      { types: ["constant", "char"], style: { color: "rgb(129, 31, 63)" } },
      { types: ["tag"], style: { color: "rgb(128, 0, 0)" } },
      { types: ["attr-name"], style: { color: "rgb(255, 0, 0)" } },
      { types: ["deleted", "string"], style: { color: "rgb(163, 21, 21)" } },
      {
        types: ["changed", "punctuation"],
        style: { color: "rgb(4, 81, 165)" },
      },
      { types: ["function", "keyword"], style: { color: "rgb(0, 0, 255)" } },
      { types: ["class-name"], style: { color: "rgb(38, 127, 153)" } },
    ],
  },
  nk = tk,
  ak = {
    plain: { color: "#f8fafc", backgroundColor: "#011627" },
    styles: [
      { types: ["prolog"], style: { color: "#000080" } },
      { types: ["comment"], style: { color: "#6A9955" } },
      {
        types: ["builtin", "changed", "keyword", "interpolation-punctuation"],
        style: { color: "#569CD6" },
      },
      { types: ["number", "inserted"], style: { color: "#B5CEA8" } },
      { types: ["constant"], style: { color: "#f8fafc" } },
      { types: ["attr-name", "variable"], style: { color: "#9CDCFE" } },
      {
        types: ["deleted", "string", "attr-value", "template-punctuation"],
        style: { color: "#cbd5e1" },
      },
      { types: ["selector"], style: { color: "#D7BA7D" } },
      { types: ["tag"], style: { color: "#0ea5e9" } },
      { types: ["tag"], languages: ["markup"], style: { color: "#0ea5e9" } },
      { types: ["punctuation", "operator"], style: { color: "#D4D4D4" } },
      {
        types: ["punctuation"],
        languages: ["markup"],
        style: { color: "#808080" },
      },
      { types: ["function"], style: { color: "#7dd3fc" } },
      { types: ["class-name"], style: { color: "#0ea5e9" } },
      { types: ["char"], style: { color: "#D16969" } },
    ],
  },
  rk = ak,
  ik = {
    plain: { color: "#0f172a", backgroundColor: "#f1f5f9" },
    styles: [
      { types: ["prolog"], style: { color: "#000080" } },
      { types: ["comment"], style: { color: "#6A9955" } },
      {
        types: ["builtin", "changed", "keyword", "interpolation-punctuation"],
        style: { color: "#0c4a6e" },
      },
      { types: ["number", "inserted"], style: { color: "#B5CEA8" } },
      { types: ["constant"], style: { color: "#0f172a" } },
      { types: ["attr-name", "variable"], style: { color: "#0c4a6e" } },
      {
        types: ["deleted", "string", "attr-value", "template-punctuation"],
        style: { color: "#64748b" },
      },
      { types: ["selector"], style: { color: "#D7BA7D" } },
      { types: ["tag"], style: { color: "#0ea5e9" } },
      { types: ["tag"], languages: ["markup"], style: { color: "#0ea5e9" } },
      { types: ["punctuation", "operator"], style: { color: "#475569" } },
      {
        types: ["punctuation"],
        languages: ["markup"],
        style: { color: "#808080" },
      },
      { types: ["function"], style: { color: "#0e7490" } },
      { types: ["class-name"], style: { color: "#0ea5e9" } },
      { types: ["char"], style: { color: "#D16969" } },
    ],
  },
  lk = ik,
  ok = {
    plain: {
      backgroundColor: "hsl(220, 13%, 18%)",
      color: "hsl(220, 14%, 71%)",
      textShadow: "0 1px rgba(0, 0, 0, 0.3)",
    },
    styles: [
      {
        types: ["comment", "prolog", "cdata"],
        style: { color: "hsl(220, 10%, 40%)" },
      },
      {
        types: ["doctype", "punctuation", "entity"],
        style: { color: "hsl(220, 14%, 71%)" },
      },
      {
        types: [
          "attr-name",
          "class-name",
          "maybe-class-name",
          "boolean",
          "constant",
          "number",
          "atrule",
        ],
        style: { color: "hsl(29, 54%, 61%)" },
      },
      { types: ["keyword"], style: { color: "hsl(286, 60%, 67%)" } },
      {
        types: ["property", "tag", "symbol", "deleted", "important"],
        style: { color: "hsl(355, 65%, 65%)" },
      },
      {
        types: [
          "selector",
          "string",
          "char",
          "builtin",
          "inserted",
          "regex",
          "attr-value",
        ],
        style: { color: "hsl(95, 38%, 62%)" },
      },
      {
        types: ["variable", "operator", "function"],
        style: { color: "hsl(207, 82%, 66%)" },
      },
      { types: ["url"], style: { color: "hsl(187, 47%, 55%)" } },
      { types: ["deleted"], style: { textDecorationLine: "line-through" } },
      { types: ["inserted"], style: { textDecorationLine: "underline" } },
      { types: ["italic"], style: { fontStyle: "italic" } },
      { types: ["important", "bold"], style: { fontWeight: "bold" } },
      { types: ["important"], style: { color: "hsl(220, 14%, 71%)" } },
    ],
  },
  sk = ok,
  uk = {
    plain: { backgroundColor: "hsl(230, 1%, 98%)", color: "hsl(230, 8%, 24%)" },
    styles: [
      {
        types: ["comment", "prolog", "cdata"],
        style: { color: "hsl(230, 4%, 64%)" },
      },
      {
        types: ["doctype", "punctuation", "entity"],
        style: { color: "hsl(230, 8%, 24%)" },
      },
      {
        types: [
          "attr-name",
          "class-name",
          "boolean",
          "constant",
          "number",
          "atrule",
        ],
        style: { color: "hsl(35, 99%, 36%)" },
      },
      { types: ["keyword"], style: { color: "hsl(301, 63%, 40%)" } },
      {
        types: ["property", "tag", "symbol", "deleted", "important"],
        style: { color: "hsl(5, 74%, 59%)" },
      },
      {
        types: [
          "selector",
          "string",
          "char",
          "builtin",
          "inserted",
          "regex",
          "attr-value",
          "punctuation",
        ],
        style: { color: "hsl(119, 34%, 47%)" },
      },
      {
        types: ["variable", "operator", "function"],
        style: { color: "hsl(221, 87%, 60%)" },
      },
      { types: ["url"], style: { color: "hsl(198, 99%, 37%)" } },
      { types: ["deleted"], style: { textDecorationLine: "line-through" } },
      { types: ["inserted"], style: { textDecorationLine: "underline" } },
      { types: ["italic"], style: { fontStyle: "italic" } },
      { types: ["important", "bold"], style: { fontWeight: "bold" } },
      { types: ["important"], style: { color: "hsl(230, 8%, 24%)" } },
    ],
  },
  ck = uk,
  fk = {
    plain: { color: "#ebdbb2", backgroundColor: "#292828" },
    styles: [
      {
        types: [
          "imports",
          "class-name",
          "maybe-class-name",
          "constant",
          "doctype",
          "builtin",
          "function",
        ],
        style: { color: "#d8a657" },
      },
      { types: ["property-access"], style: { color: "#7daea3" } },
      { types: ["tag"], style: { color: "#e78a4e" } },
      {
        types: ["attr-name", "char", "url", "regex"],
        style: { color: "#a9b665" },
      },
      { types: ["attr-value", "string"], style: { color: "#89b482" } },
      {
        types: ["comment", "prolog", "cdata", "operator", "inserted"],
        style: { color: "#a89984" },
      },
      {
        types: [
          "delimiter",
          "boolean",
          "keyword",
          "selector",
          "important",
          "atrule",
          "property",
          "variable",
          "deleted",
        ],
        style: { color: "#ea6962" },
      },
      { types: ["entity", "number", "symbol"], style: { color: "#d3869b" } },
    ],
  },
  dk = fk,
  pk = {
    plain: { color: "#654735", backgroundColor: "#f9f5d7" },
    styles: [
      {
        types: [
          "delimiter",
          "boolean",
          "keyword",
          "selector",
          "important",
          "atrule",
          "property",
          "variable",
          "deleted",
        ],
        style: { color: "#af2528" },
      },
      {
        types: [
          "imports",
          "class-name",
          "maybe-class-name",
          "constant",
          "doctype",
          "builtin",
        ],
        style: { color: "#b4730e" },
      },
      { types: ["string", "attr-value"], style: { color: "#477a5b" } },
      { types: ["property-access"], style: { color: "#266b79" } },
      {
        types: ["function", "attr-name", "char", "url"],
        style: { color: "#72761e" },
      },
      { types: ["tag"], style: { color: "#b94c07" } },
      {
        types: ["comment", "prolog", "cdata", "operator", "inserted"],
        style: { color: "#a89984" },
      },
      { types: ["entity", "number", "symbol"], style: { color: "#924f79" } },
    ],
  },
  hk = pk,
  gk = (t) =>
    C.useCallback(
      (a) => {
        var r = a,
          { className: l, style: s, line: u } = r,
          f = X0(r, ["className", "style", "line"]);
        const p = Zu(oa({}, f), { className: q0("token-line", l) });
        return (
          typeof t == "object" && "plain" in t && (p.style = t.plain),
          typeof s == "object" && (p.style = oa(oa({}, p.style || {}), s)),
          p
        );
      },
      [t],
    ),
  yk = (t) => {
    const a = C.useCallback(
      ({ types: r, empty: l }) => {
        if (t != null) {
          {
            if (r.length === 1 && r[0] === "plain")
              return l != null ? { display: "inline-block" } : void 0;
            if (r.length === 1 && l != null) return t[r[0]];
          }
          return Object.assign(
            l != null ? { display: "inline-block" } : {},
            ...r.map((s) => t[s]),
          );
        }
      },
      [t],
    );
    return C.useCallback(
      (r) => {
        var l = r,
          { token: s, className: u, style: f } = l,
          p = X0(l, ["token", "className", "style"]);
        const h = Zu(oa({}, p), {
          className: q0("token", ...s.types, u),
          children: s.content,
          style: a(s),
        });
        return (f != null && (h.style = oa(oa({}, h.style || {}), f)), h);
      },
      [a],
    );
  },
  mk = /\r\n|\r|\n/,
  Mv = (t) => {
    t.length === 0
      ? t.push({
          types: ["plain"],
          content: `
`,
          empty: !0,
        })
      : t.length === 1 &&
        t[0].content === "" &&
        ((t[0].content = `
`),
        (t[0].empty = !0));
  },
  jv = (t, a) => {
    const r = t.length;
    return r > 0 && t[r - 1] === a ? t : t.concat(a);
  },
  vk = (t) => {
    const a = [[]],
      r = [t],
      l = [0],
      s = [t.length];
    let u = 0,
      f = 0,
      p = [];
    const h = [p];
    for (; f > -1; ) {
      for (; (u = l[f]++) < s[f]; ) {
        let g,
          y = a[f];
        const E = r[f][u];
        if (
          (typeof E == "string"
            ? ((y = f > 0 ? y : ["plain"]), (g = E))
            : ((y = jv(y, E.type)),
              E.alias && (y = jv(y, E.alias)),
              (g = E.content)),
          typeof g != "string")
        ) {
          (f++, a.push(y), r.push(g), l.push(0), s.push(g.length));
          continue;
        }
        const w = g.split(mk),
          S = w.length;
        p.push({ types: y, content: w[0] });
        for (let b = 1; b < S; b++)
          (Mv(p), h.push((p = [])), p.push({ types: y, content: w[b] }));
      }
      (f--, a.pop(), r.pop(), l.pop(), s.pop());
    }
    return (Mv(p), h);
  },
  zv = vk,
  bk = ({ prism: t, code: a, grammar: r, language: l }) =>
    C.useMemo(() => {
      if (r == null) return zv([a]);
      const s = { code: a, grammar: r, language: l, tokens: [] };
      return (
        t.hooks.run("before-tokenize", s),
        (s.tokens = t.tokenize(a, r)),
        t.hooks.run("after-tokenize", s),
        zv(s.tokens)
      );
    }, [a, r, l, t]),
  Sk = (t, a) => {
    const { plain: r } = t,
      l = t.styles.reduce((s, u) => {
        const { languages: f, style: p } = u;
        return (
          (f && !f.includes(a)) ||
            u.types.forEach((h) => {
              const g = oa(oa({}, s[h]), p);
              s[h] = g;
            }),
          s
        );
      }, {});
    return (
      (l.root = r),
      (l.plain = Zu(oa({}, r), { backgroundColor: void 0 })),
      l
    );
  },
  Ek = Sk,
  _k = ({ children: t, language: a, code: r, theme: l, prism: s }) => {
    const u = a.toLowerCase(),
      f = Ek(l, u),
      p = gk(f),
      h = yk(f),
      g = s.languages[u],
      y = bk({ prism: s, language: u, code: r, grammar: g });
    return t({
      tokens: y,
      className: `prism-code language-${u}`,
      style: f != null ? f.root : {},
      getLineProps: p,
      getTokenProps: h,
    });
  },
  Bv = (t) =>
    C.createElement(
      _k,
      Zu(oa({}, t), {
        prism: t.prism || te,
        theme: t.theme || K0,
        code: t.code,
        language: t.language,
      }),
    );
/*! Bundled license information:

prismjs/prism.js:
  (**
   * Prism: Lightweight, robust, elegant syntax highlighting
   *
   * @license MIT <https://opensource.org/licenses/MIT>
   * @author Lea Verou <https://lea.verou.me>
   * @namespace
   * @public
   *)
*/ const Q0 = {
  stories: "src/**/*.stories.{js,jsx,ts,tsx,mdx}",
  defaultStory: "",
  storyOrder: (t) => t,
  viteConfig: void 0,
  appendToHead: "",
  disableHttp2: !1,
  noWatch: !1,
  port: 61e3,
  previewPort: 8080,
  hmrHost: void 0,
  hmrPort: void 0,
  outDir: "build",
  base: void 0,
  expandStoryTree: !1,
  hotkeys: {
    search: ["/", "meta+p"],
    nextStory: ["alt+arrowright"],
    previousStory: ["alt+arrowleft"],
    nextComponent: ["alt+arrowdown"],
    previousComponent: ["alt+arrowup"],
    control: ["c"],
    darkMode: ["d"],
    fullscreen: ["f"],
    width: ["w"],
    rtl: ["r"],
    source: ["s"],
    a11y: ["a"],
  },
  onDevServerStart: () => {},
  i18n: {
    buildTooltip: '💡 Tip: Run "ladle preview" to check that the build works!',
  },
  addons: {
    control: { enabled: !0, defaultState: {} },
    theme: { enabled: !0, defaultState: "light" },
    mode: { enabled: !0, defaultState: "full" },
    rtl: { enabled: !0, defaultState: !1 },
    source: {
      enabled: !0,
      defaultState: !1,
      themeDark: {
        ...fo.nightOwl,
        plain: {
          ...fo.nightOwl.plain,
          backgroundColor: "var(--ladle-bg-color-secondary)",
        },
      },
      themeLight: {
        ...fo.github,
        plain: {
          ...fo.github.plain,
          backgroundColor: "var(--ladle-bg-color-secondary)",
        },
      },
    },
    a11y: { enabled: !1 },
    msw: { enabled: !1 },
    action: { enabled: !0, defaultState: [] },
    ladle: { enabled: !0 },
    width: {
      enabled: !0,
      options: { xsmall: 414, small: 640, medium: 768, large: 1024 },
      defaultState: 0,
    },
  },
};
Object.keys(An).length === 0
  ? la("No custom config found.")
  : (An.storyOrder &&
      typeof An.storyOrder == "string" &&
      (An.storyOrder = new Function("return " + An.storyOrder)()),
    la("Custom config found:"),
    la(An));
var nb, ab;
(ab = (nb = An == null ? void 0 : An.addons) == null ? void 0 : nb.width) !=
  null &&
  ab.options &&
  (Q0.addons.width.options = {});
const Oe = ZE(Q0, An);
Oe.defaultStory === "" &&
  (Oe.defaultStory = yb(Object.keys(Ji), Oe.storyOrder)[0]);
Oe.hotkeys = { ...Oe.hotkeys, ...An.hotkeys };
la("Final config", Oe);
const J0 = (t) => {
    switch (ca.parse(t).theme) {
      case vt.Light:
        return vt.Light;
      case vt.Dark:
        return vt.Dark;
      case vt.Auto:
        return vt.Auto;
      default:
        return "light";
    }
  },
  wk = ({ globalState: t, dispatch: a }) => {
    const r = "Switch to dark theme.",
      l = "Switch to light theme.",
      s = () => {
        const u = t.theme === vt.Light ? vt.Dark : vt.Light;
        (document.documentElement.setAttribute("data-theme", u),
          a({ type: Ve.UpdateTheme, value: u }));
      };
    return (
      Rn(Oe.hotkeys.darkMode, s, {
        enabled: t.hotkeys && Oe.addons.mode.enabled,
      }),
      x.jsx("li", {
        children: x.jsxs("button", {
          "aria-label": t.theme === vt.Light ? r : l,
          title: t.theme === vt.Light ? r : l,
          onClick: s,
          type: "button",
          children: [
            x.jsx(b_, {}),
            x.jsx("span", {
              className: "ladle-addon-tooltip",
              children: t.theme === vt.Light ? r : l,
            }),
            x.jsxs("label", {
              children: [
                "Switch to",
                " ",
                t.theme === vt.Light ? vt.Dark : vt.Light,
                " ",
                "theme",
              ],
            }),
          ],
        }),
      })
    );
  },
  W0 = gb(pb(location.search, Oe.defaultStory));
la(`Initial document.title: ${W0}`);
document.title = `${W0} | Ladle`;
const np = J0(location.search);
la(`Initial theme state: ${np}`);
np === vt.Auto
  ? window.matchMedia("(prefers-color-scheme: dark)").matches
    ? document.documentElement.setAttribute("data-theme", vt.Dark)
    : document.documentElement.setAttribute("data-theme", vt.Light)
  : document.documentElement.setAttribute("data-theme", np);
var Od = { exports: {} },
  so = {},
  xd = { exports: {} },
  Cd = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Uv;
function Ok() {
  return (
    Uv ||
      ((Uv = 1),
      (function (t) {
        function a(M, Z) {
          var ne = M.length;
          M.push(Z);
          e: for (; 0 < ne; ) {
            var he = (ne - 1) >>> 1,
              fe = M[he];
            if (0 < s(fe, Z)) ((M[he] = Z), (M[ne] = fe), (ne = he));
            else break e;
          }
        }
        function r(M) {
          return M.length === 0 ? null : M[0];
        }
        function l(M) {
          if (M.length === 0) return null;
          var Z = M[0],
            ne = M.pop();
          if (ne !== Z) {
            M[0] = ne;
            e: for (var he = 0, fe = M.length, A = fe >>> 1; he < A; ) {
              var V = 2 * (he + 1) - 1,
                B = M[V],
                ce = V + 1,
                Ce = M[ce];
              if (0 > s(B, ne))
                ce < fe && 0 > s(Ce, B)
                  ? ((M[he] = Ce), (M[ce] = ne), (he = ce))
                  : ((M[he] = B), (M[V] = ne), (he = V));
              else if (ce < fe && 0 > s(Ce, ne))
                ((M[he] = Ce), (M[ce] = ne), (he = ce));
              else break e;
            }
          }
          return Z;
        }
        function s(M, Z) {
          var ne = M.sortIndex - Z.sortIndex;
          return ne !== 0 ? ne : M.id - Z.id;
        }
        if (
          ((t.unstable_now = void 0),
          typeof performance == "object" &&
            typeof performance.now == "function")
        ) {
          var u = performance;
          t.unstable_now = function () {
            return u.now();
          };
        } else {
          var f = Date,
            p = f.now();
          t.unstable_now = function () {
            return f.now() - p;
          };
        }
        var h = [],
          g = [],
          y = 1,
          v = null,
          E = 3,
          w = !1,
          S = !1,
          b = !1,
          O = !1,
          k = typeof setTimeout == "function" ? setTimeout : null,
          L = typeof clearTimeout == "function" ? clearTimeout : null,
          z = typeof setImmediate < "u" ? setImmediate : null;
        function Q(M) {
          for (var Z = r(g); Z !== null; ) {
            if (Z.callback === null) l(g);
            else if (Z.startTime <= M)
              (l(g), (Z.sortIndex = Z.expirationTime), a(h, Z));
            else break;
            Z = r(g);
          }
        }
        function ae(M) {
          if (((b = !1), Q(M), !S))
            if (r(h) !== null) ((S = !0), re || ((re = !0), Y()));
            else {
              var Z = r(g);
              Z !== null && de(ae, Z.startTime - M);
            }
        }
        var re = !1,
          q = -1,
          ie = 5,
          se = -1;
        function ve() {
          return O ? !0 : !(t.unstable_now() - se < ie);
        }
        function Te() {
          if (((O = !1), re)) {
            var M = t.unstable_now();
            se = M;
            var Z = !0;
            try {
              e: {
                ((S = !1), b && ((b = !1), L(q), (q = -1)), (w = !0));
                var ne = E;
                try {
                  t: {
                    for (
                      Q(M), v = r(h);
                      v !== null && !(v.expirationTime > M && ve());
                    ) {
                      var he = v.callback;
                      if (typeof he == "function") {
                        ((v.callback = null), (E = v.priorityLevel));
                        var fe = he(v.expirationTime <= M);
                        if (((M = t.unstable_now()), typeof fe == "function")) {
                          ((v.callback = fe), Q(M), (Z = !0));
                          break t;
                        }
                        (v === r(h) && l(h), Q(M));
                      } else l(h);
                      v = r(h);
                    }
                    if (v !== null) Z = !0;
                    else {
                      var A = r(g);
                      (A !== null && de(ae, A.startTime - M), (Z = !1));
                    }
                  }
                  break e;
                } finally {
                  ((v = null), (E = ne), (w = !1));
                }
                Z = void 0;
              }
            } finally {
              Z ? Y() : (re = !1);
            }
          }
        }
        var Y;
        if (typeof z == "function")
          Y = function () {
            z(Te);
          };
        else if (typeof MessageChannel < "u") {
          var oe = new MessageChannel(),
            ue = oe.port2;
          ((oe.port1.onmessage = Te),
            (Y = function () {
              ue.postMessage(null);
            }));
        } else
          Y = function () {
            k(Te, 0);
          };
        function de(M, Z) {
          q = k(function () {
            M(t.unstable_now());
          }, Z);
        }
        ((t.unstable_IdlePriority = 5),
          (t.unstable_ImmediatePriority = 1),
          (t.unstable_LowPriority = 4),
          (t.unstable_NormalPriority = 3),
          (t.unstable_Profiling = null),
          (t.unstable_UserBlockingPriority = 2),
          (t.unstable_cancelCallback = function (M) {
            M.callback = null;
          }),
          (t.unstable_forceFrameRate = function (M) {
            0 > M || 125 < M
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
                )
              : (ie = 0 < M ? Math.floor(1e3 / M) : 5);
          }),
          (t.unstable_getCurrentPriorityLevel = function () {
            return E;
          }),
          (t.unstable_next = function (M) {
            switch (E) {
              case 1:
              case 2:
              case 3:
                var Z = 3;
                break;
              default:
                Z = E;
            }
            var ne = E;
            E = Z;
            try {
              return M();
            } finally {
              E = ne;
            }
          }),
          (t.unstable_requestPaint = function () {
            O = !0;
          }),
          (t.unstable_runWithPriority = function (M, Z) {
            switch (M) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                M = 3;
            }
            var ne = E;
            E = M;
            try {
              return Z();
            } finally {
              E = ne;
            }
          }),
          (t.unstable_scheduleCallback = function (M, Z, ne) {
            var he = t.unstable_now();
            switch (
              (typeof ne == "object" && ne !== null
                ? ((ne = ne.delay),
                  (ne = typeof ne == "number" && 0 < ne ? he + ne : he))
                : (ne = he),
              M)
            ) {
              case 1:
                var fe = -1;
                break;
              case 2:
                fe = 250;
                break;
              case 5:
                fe = 1073741823;
                break;
              case 4:
                fe = 1e4;
                break;
              default:
                fe = 5e3;
            }
            return (
              (fe = ne + fe),
              (M = {
                id: y++,
                callback: Z,
                priorityLevel: M,
                startTime: ne,
                expirationTime: fe,
                sortIndex: -1,
              }),
              ne > he
                ? ((M.sortIndex = ne),
                  a(g, M),
                  r(h) === null &&
                    M === r(g) &&
                    (b ? (L(q), (q = -1)) : (b = !0), de(ae, ne - he)))
                : ((M.sortIndex = fe),
                  a(h, M),
                  S || w || ((S = !0), re || ((re = !0), Y()))),
              M
            );
          }),
          (t.unstable_shouldYield = ve),
          (t.unstable_wrapCallback = function (M) {
            var Z = E;
            return function () {
              var ne = E;
              E = Z;
              try {
                return M.apply(this, arguments);
              } finally {
                E = ne;
              }
            };
          }));
      })(Cd)),
    Cd
  );
}
var Fv;
function xk() {
  return (Fv || ((Fv = 1), (xd.exports = Ok())), xd.exports);
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Iv;
function Ck() {
  if (Iv) return so;
  Iv = 1;
  var t = xk(),
    a = pp(),
    r = _b();
  function l(e) {
    var n = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      n += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        n += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return (
      "Minified React error #" +
      e +
      "; visit " +
      n +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function s(e) {
    return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
  }
  function u(e) {
    var n = e,
      i = e;
    if (e.alternate) for (; n.return; ) n = n.return;
    else {
      e = n;
      do ((n = e), (n.flags & 4098) !== 0 && (i = n.return), (e = n.return));
      while (e);
    }
    return n.tag === 3 ? i : null;
  }
  function f(e) {
    if (e.tag === 13) {
      var n = e.memoizedState;
      if (
        (n === null && ((e = e.alternate), e !== null && (n = e.memoizedState)),
        n !== null)
      )
        return n.dehydrated;
    }
    return null;
  }
  function p(e) {
    if (e.tag === 31) {
      var n = e.memoizedState;
      if (
        (n === null && ((e = e.alternate), e !== null && (n = e.memoizedState)),
        n !== null)
      )
        return n.dehydrated;
    }
    return null;
  }
  function h(e) {
    if (u(e) !== e) throw Error(l(188));
  }
  function g(e) {
    var n = e.alternate;
    if (!n) {
      if (((n = u(e)), n === null)) throw Error(l(188));
      return n !== e ? null : e;
    }
    for (var i = e, o = n; ; ) {
      var c = i.return;
      if (c === null) break;
      var d = c.alternate;
      if (d === null) {
        if (((o = c.return), o !== null)) {
          i = o;
          continue;
        }
        break;
      }
      if (c.child === d.child) {
        for (d = c.child; d; ) {
          if (d === i) return (h(c), e);
          if (d === o) return (h(c), n);
          d = d.sibling;
        }
        throw Error(l(188));
      }
      if (i.return !== o.return) ((i = c), (o = d));
      else {
        for (var m = !1, _ = c.child; _; ) {
          if (_ === i) {
            ((m = !0), (i = c), (o = d));
            break;
          }
          if (_ === o) {
            ((m = !0), (o = c), (i = d));
            break;
          }
          _ = _.sibling;
        }
        if (!m) {
          for (_ = d.child; _; ) {
            if (_ === i) {
              ((m = !0), (i = d), (o = c));
              break;
            }
            if (_ === o) {
              ((m = !0), (o = d), (i = c));
              break;
            }
            _ = _.sibling;
          }
          if (!m) throw Error(l(189));
        }
      }
      if (i.alternate !== o) throw Error(l(190));
    }
    if (i.tag !== 3) throw Error(l(188));
    return i.stateNode.current === i ? e : n;
  }
  function y(e) {
    var n = e.tag;
    if (n === 5 || n === 26 || n === 27 || n === 6) return e;
    for (e = e.child; e !== null; ) {
      if (((n = y(e)), n !== null)) return n;
      e = e.sibling;
    }
    return null;
  }
  var v = Object.assign,
    E = Symbol.for("react.element"),
    w = Symbol.for("react.transitional.element"),
    S = Symbol.for("react.portal"),
    b = Symbol.for("react.fragment"),
    O = Symbol.for("react.strict_mode"),
    k = Symbol.for("react.profiler"),
    L = Symbol.for("react.consumer"),
    z = Symbol.for("react.context"),
    Q = Symbol.for("react.forward_ref"),
    ae = Symbol.for("react.suspense"),
    re = Symbol.for("react.suspense_list"),
    q = Symbol.for("react.memo"),
    ie = Symbol.for("react.lazy"),
    se = Symbol.for("react.activity"),
    ve = Symbol.for("react.memo_cache_sentinel"),
    Te = Symbol.iterator;
  function Y(e) {
    return e === null || typeof e != "object"
      ? null
      : ((e = (Te && e[Te]) || e["@@iterator"]),
        typeof e == "function" ? e : null);
  }
  var oe = Symbol.for("react.client.reference");
  function ue(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === oe ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case b:
        return "Fragment";
      case k:
        return "Profiler";
      case O:
        return "StrictMode";
      case ae:
        return "Suspense";
      case re:
        return "SuspenseList";
      case se:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case S:
          return "Portal";
        case z:
          return e.displayName || "Context";
        case L:
          return (e._context.displayName || "Context") + ".Consumer";
        case Q:
          var n = e.render;
          return (
            (e = e.displayName),
            e ||
              ((e = n.displayName || n.name || ""),
              (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
            e
          );
        case q:
          return (
            (n = e.displayName || null),
            n !== null ? n : ue(e.type) || "Memo"
          );
        case ie:
          ((n = e._payload), (e = e._init));
          try {
            return ue(e(n));
          } catch {}
      }
    return null;
  }
  var de = Array.isArray,
    M = a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    Z = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    ne = { pending: !1, data: null, method: null, action: null },
    he = [],
    fe = -1;
  function A(e) {
    return { current: e };
  }
  function V(e) {
    0 > fe || ((e.current = he[fe]), (he[fe] = null), fe--);
  }
  function B(e, n) {
    (fe++, (he[fe] = e.current), (e.current = n));
  }
  var ce = A(null),
    Ce = A(null),
    ge = A(null),
    ke = A(null);
  function We(e, n) {
    switch ((B(ge, n), B(Ce, e), B(ce, null), n.nodeType)) {
      case 9:
      case 11:
        e = (e = n.documentElement) && (e = e.namespaceURI) ? qy(e) : 0;
        break;
      default:
        if (((e = n.tagName), (n = n.namespaceURI)))
          ((n = qy(n)), (e = Yy(n, e)));
        else
          switch (e) {
            case "svg":
              e = 1;
              break;
            case "math":
              e = 2;
              break;
            default:
              e = 0;
          }
    }
    (V(ce), B(ce, e));
  }
  function qe() {
    (V(ce), V(Ce), V(ge));
  }
  function rn(e) {
    e.memoizedState !== null && B(ke, e);
    var n = ce.current,
      i = Yy(n, e.type);
    n !== i && (B(Ce, e), B(ce, i));
  }
  function bt(e) {
    (Ce.current === e && (V(ce), V(Ce)),
      ke.current === e && (V(ke), (eo._currentValue = ne)));
  }
  var Dn, Ln;
  function _e(e) {
    if (Dn === void 0)
      try {
        throw Error();
      } catch (i) {
        var n = i.stack.trim().match(/\n( *(at )?)/);
        ((Dn = (n && n[1]) || ""),
          (Ln =
            -1 <
            i.stack.indexOf(`
    at`)
              ? " (<anonymous>)"
              : -1 < i.stack.indexOf("@")
                ? "@unknown:0:0"
                : ""));
      }
    return (
      `
` +
      Dn +
      e +
      Ln
    );
  }
  var mn = !1;
  function vn(e, n) {
    if (!e || mn) return "";
    mn = !0;
    var i = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var o = {
        DetermineComponentFrameRoot: function () {
          try {
            if (n) {
              var ee = function () {
                throw Error();
              };
              if (
                (Object.defineProperty(ee.prototype, "props", {
                  set: function () {
                    throw Error();
                  },
                }),
                typeof Reflect == "object" && Reflect.construct)
              ) {
                try {
                  Reflect.construct(ee, []);
                } catch (P) {
                  var $ = P;
                }
                Reflect.construct(e, [], ee);
              } else {
                try {
                  ee.call();
                } catch (P) {
                  $ = P;
                }
                e.call(ee.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (P) {
                $ = P;
              }
              (ee = e()) &&
                typeof ee.catch == "function" &&
                ee.catch(function () {});
            }
          } catch (P) {
            if (P && $ && typeof P.stack == "string") return [P.stack, $.stack];
          }
          return [null, null];
        },
      };
      o.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var c = Object.getOwnPropertyDescriptor(
        o.DetermineComponentFrameRoot,
        "name",
      );
      c &&
        c.configurable &&
        Object.defineProperty(o.DetermineComponentFrameRoot, "name", {
          value: "DetermineComponentFrameRoot",
        });
      var d = o.DetermineComponentFrameRoot(),
        m = d[0],
        _ = d[1];
      if (m && _) {
        var R = m.split(`
`),
          I = _.split(`
`);
        for (
          c = o = 0;
          o < R.length && !R[o].includes("DetermineComponentFrameRoot");
        )
          o++;
        for (; c < I.length && !I[c].includes("DetermineComponentFrameRoot"); )
          c++;
        if (o === R.length || c === I.length)
          for (
            o = R.length - 1, c = I.length - 1;
            1 <= o && 0 <= c && R[o] !== I[c];
          )
            c--;
        for (; 1 <= o && 0 <= c; o--, c--)
          if (R[o] !== I[c]) {
            if (o !== 1 || c !== 1)
              do
                if ((o--, c--, 0 > c || R[o] !== I[c])) {
                  var K =
                    `
` + R[o].replace(" at new ", " at ");
                  return (
                    e.displayName &&
                      K.includes("<anonymous>") &&
                      (K = K.replace("<anonymous>", e.displayName)),
                    K
                  );
                }
              while (1 <= o && 0 <= c);
            break;
          }
      }
    } finally {
      ((mn = !1), (Error.prepareStackTrace = i));
    }
    return (i = e ? e.displayName || e.name : "") ? _e(i) : "";
  }
  function Gn(e, n) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return _e(e.type);
      case 16:
        return _e("Lazy");
      case 13:
        return e.child !== n && n !== null
          ? _e("Suspense Fallback")
          : _e("Suspense");
      case 19:
        return _e("SuspenseList");
      case 0:
      case 15:
        return vn(e.type, !1);
      case 11:
        return vn(e.type.render, !1);
      case 1:
        return vn(e.type, !0);
      case 31:
        return _e("Activity");
      default:
        return "";
    }
  }
  function mr(e) {
    try {
      var n = "",
        i = null;
      do ((n += Gn(e, i)), (i = e), (e = e.return));
      while (e);
      return n;
    } catch (o) {
      return (
        `
Error generating stack: ` +
        o.message +
        `
` +
        o.stack
      );
    }
  }
  var Ma = Object.prototype.hasOwnProperty,
    Nn = t.unstable_scheduleCallback,
    Pn = t.unstable_cancelCallback,
    qn = t.unstable_shouldYield,
    bn = t.unstable_requestPaint,
    At = t.unstable_now,
    qr = t.unstable_getCurrentPriorityLevel,
    Yr = t.unstable_ImmediatePriority,
    Yn = t.unstable_UserBlockingPriority,
    Mn = t.unstable_NormalPriority,
    Zr = t.unstable_LowPriority,
    vr = t.unstable_IdlePriority,
    ja = t.log,
    U = t.unstable_setDisableYieldValue,
    G = null,
    X = null;
  function le(e) {
    if (
      (typeof ja == "function" && U(e),
      X && typeof X.setStrictMode == "function")
    )
      try {
        X.setStrictMode(G, e);
      } catch {}
  }
  var be = Math.clz32 ? Math.clz32 : je,
    pt = Math.log,
    ft = Math.LN2;
  function je(e) {
    return ((e >>>= 0), e === 0 ? 32 : (31 - ((pt(e) / ft) | 0)) | 0);
  }
  var pe = 256,
    ye = 262144,
    Se = 4194304;
  function me(e) {
    var n = e & 42;
    if (n !== 0) return n;
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return e & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return e & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return e;
    }
  }
  function Ne(e, n, i) {
    var o = e.pendingLanes;
    if (o === 0) return 0;
    var c = 0,
      d = e.suspendedLanes,
      m = e.pingedLanes;
    e = e.warmLanes;
    var _ = o & 134217727;
    return (
      _ !== 0
        ? ((o = _ & ~d),
          o !== 0
            ? (c = me(o))
            : ((m &= _),
              m !== 0
                ? (c = me(m))
                : i || ((i = _ & ~e), i !== 0 && (c = me(i)))))
        : ((_ = o & ~d),
          _ !== 0
            ? (c = me(_))
            : m !== 0
              ? (c = me(m))
              : i || ((i = o & ~e), i !== 0 && (c = me(i)))),
      c === 0
        ? 0
        : n !== 0 &&
            n !== c &&
            (n & d) === 0 &&
            ((d = c & -c),
            (i = n & -n),
            d >= i || (d === 32 && (i & 4194048) !== 0))
          ? n
          : c
    );
  }
  function Ye(e, n) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & n) === 0;
  }
  function st(e, n) {
    switch (e) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return n + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return n + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function $t() {
    var e = Se;
    return ((Se <<= 1), (Se & 62914560) === 0 && (Se = 4194304), e);
  }
  function za(e) {
    for (var n = [], i = 0; 31 > i; i++) n.push(e);
    return n;
  }
  function Nt(e, n) {
    ((e.pendingLanes |= n),
      n !== 268435456 &&
        ((e.suspendedLanes = 0), (e.pingedLanes = 0), (e.warmLanes = 0)));
  }
  function rl(e, n, i, o, c, d) {
    var m = e.pendingLanes;
    ((e.pendingLanes = i),
      (e.suspendedLanes = 0),
      (e.pingedLanes = 0),
      (e.warmLanes = 0),
      (e.expiredLanes &= i),
      (e.entangledLanes &= i),
      (e.errorRecoveryDisabledLanes &= i),
      (e.shellSuspendCounter = 0));
    var _ = e.entanglements,
      R = e.expirationTimes,
      I = e.hiddenUpdates;
    for (i = m & ~i; 0 < i; ) {
      var K = 31 - be(i),
        ee = 1 << K;
      ((_[K] = 0), (R[K] = -1));
      var $ = I[K];
      if ($ !== null)
        for (I[K] = null, K = 0; K < $.length; K++) {
          var P = $[K];
          P !== null && (P.lane &= -536870913);
        }
      i &= ~ee;
    }
    (o !== 0 && Ro(e, o, 0),
      d !== 0 && c === 0 && e.tag !== 0 && (e.suspendedLanes |= d & ~(m & ~n)));
  }
  function Ro(e, n, i) {
    ((e.pendingLanes |= n), (e.suspendedLanes &= ~n));
    var o = 31 - be(n);
    ((e.entangledLanes |= n),
      (e.entanglements[o] = e.entanglements[o] | 1073741824 | (i & 261930)));
  }
  function ko(e, n) {
    var i = (e.entangledLanes |= n);
    for (e = e.entanglements; i; ) {
      var o = 31 - be(i),
        c = 1 << o;
      ((c & n) | (e[o] & n) && (e[o] |= n), (i &= ~c));
    }
  }
  function Do(e, n) {
    var i = n & -n;
    return (
      (i = (i & 42) !== 0 ? 1 : il(i)),
      (i & (e.suspendedLanes | n)) !== 0 ? 0 : i
    );
  }
  function il(e) {
    switch (e) {
      case 2:
        e = 1;
        break;
      case 8:
        e = 4;
        break;
      case 32:
        e = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        e = 128;
        break;
      case 268435456:
        e = 134217728;
        break;
      default:
        e = 0;
    }
    return e;
  }
  function Zn(e) {
    return (
      (e &= -e),
      2 < e ? (8 < e ? ((e & 134217727) !== 0 ? 32 : 268435456) : 8) : 2
    );
  }
  function Lo() {
    var e = Z.p;
    return e !== 0 ? e : ((e = window.event), e === void 0 ? 32 : ym(e.type));
  }
  function No(e, n) {
    var i = Z.p;
    try {
      return ((Z.p = e), n());
    } finally {
      Z.p = i;
    }
  }
  var Xn = Math.random().toString(36).slice(2),
    Ct = "__reactFiber$" + Xn,
    Vt = "__reactProps$" + Xn,
    ln = "__reactContainer$" + Xn,
    ll = "__reactEvents$" + Xn,
    Xu = "__reactListeners$" + Xn,
    Ku = "__reactHandles$" + Xn,
    Mo = "__reactResources$" + Xn,
    br = "__reactMarker$" + Xn;
  function ol(e) {
    (delete e[Ct], delete e[Vt], delete e[ll], delete e[Xu], delete e[Ku]);
  }
  function Kn(e) {
    var n = e[Ct];
    if (n) return n;
    for (var i = e.parentNode; i; ) {
      if ((n = i[ln] || i[Ct])) {
        if (
          ((i = n.alternate),
          n.child !== null || (i !== null && i.child !== null))
        )
          for (e = em(e); e !== null; ) {
            if ((i = e[Ct])) return i;
            e = em(e);
          }
        return n;
      }
      ((e = i), (i = e.parentNode));
    }
    return null;
  }
  function Ba(e) {
    if ((e = e[Ct] || e[ln])) {
      var n = e.tag;
      if (
        n === 5 ||
        n === 6 ||
        n === 13 ||
        n === 31 ||
        n === 26 ||
        n === 27 ||
        n === 3
      )
        return e;
    }
    return null;
  }
  function Qn(e) {
    var n = e.tag;
    if (n === 5 || n === 26 || n === 27 || n === 6) return e.stateNode;
    throw Error(l(33));
  }
  function Jn(e) {
    var n = e[Mo];
    return (
      n ||
        (n = e[Mo] =
          { hoistableStyles: new Map(), hoistableScripts: new Map() }),
      n
    );
  }
  function St(e) {
    e[br] = !0;
  }
  var Sr = new Set(),
    sl = {};
  function fa(e, n) {
    (Ua(e, n), Ua(e + "Capture", n));
  }
  function Ua(e, n) {
    for (sl[e] = n, e = 0; e < n.length; e++) Sr.add(n[e]);
  }
  var Qu = RegExp(
      "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$",
    ),
    ul = {},
    jo = {};
  function Ju(e) {
    return Ma.call(jo, e)
      ? !0
      : Ma.call(ul, e)
        ? !1
        : Qu.test(e)
          ? (jo[e] = !0)
          : ((ul[e] = !0), !1);
  }
  function Xr(e, n, i) {
    if (Ju(n))
      if (i === null) e.removeAttribute(n);
      else {
        switch (typeof i) {
          case "undefined":
          case "function":
          case "symbol":
            e.removeAttribute(n);
            return;
          case "boolean":
            var o = n.toLowerCase().slice(0, 5);
            if (o !== "data-" && o !== "aria-") {
              e.removeAttribute(n);
              return;
            }
        }
        e.setAttribute(n, "" + i);
      }
  }
  function Kr(e, n, i) {
    if (i === null) e.removeAttribute(n);
    else {
      switch (typeof i) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(n);
          return;
      }
      e.setAttribute(n, "" + i);
    }
  }
  function jn(e, n, i, o) {
    if (o === null) e.removeAttribute(i);
    else {
      switch (typeof o) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(i);
          return;
      }
      e.setAttributeNS(n, i, "" + o);
    }
  }
  function Kt(e) {
    switch (typeof e) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function zo(e) {
    var n = e.type;
    return (
      (e = e.nodeName) &&
      e.toLowerCase() === "input" &&
      (n === "checkbox" || n === "radio")
    );
  }
  function Wu(e, n, i) {
    var o = Object.getOwnPropertyDescriptor(e.constructor.prototype, n);
    if (
      !e.hasOwnProperty(n) &&
      typeof o < "u" &&
      typeof o.get == "function" &&
      typeof o.set == "function"
    ) {
      var c = o.get,
        d = o.set;
      return (
        Object.defineProperty(e, n, {
          configurable: !0,
          get: function () {
            return c.call(this);
          },
          set: function (m) {
            ((i = "" + m), d.call(this, m));
          },
        }),
        Object.defineProperty(e, n, { enumerable: o.enumerable }),
        {
          getValue: function () {
            return i;
          },
          setValue: function (m) {
            i = "" + m;
          },
          stopTracking: function () {
            ((e._valueTracker = null), delete e[n]);
          },
        }
      );
    }
  }
  function cl(e) {
    if (!e._valueTracker) {
      var n = zo(e) ? "checked" : "value";
      e._valueTracker = Wu(e, n, "" + e[n]);
    }
  }
  function Bo(e) {
    if (!e) return !1;
    var n = e._valueTracker;
    if (!n) return !0;
    var i = n.getValue(),
      o = "";
    return (
      e && (o = zo(e) ? (e.checked ? "true" : "false") : e.value),
      (e = o),
      e !== i ? (n.setValue(e), !0) : !1
    );
  }
  function da(e) {
    if (
      ((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u")
    )
      return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var fl = /[\n"\\]/g;
  function Qt(e) {
    return e.replace(fl, function (n) {
      return "\\" + n.charCodeAt(0).toString(16) + " ";
    });
  }
  function dl(e, n, i, o, c, d, m, _) {
    ((e.name = ""),
      m != null &&
      typeof m != "function" &&
      typeof m != "symbol" &&
      typeof m != "boolean"
        ? (e.type = m)
        : e.removeAttribute("type"),
      n != null
        ? m === "number"
          ? ((n === 0 && e.value === "") || e.value != n) &&
            (e.value = "" + Kt(n))
          : e.value !== "" + Kt(n) && (e.value = "" + Kt(n))
        : (m !== "submit" && m !== "reset") || e.removeAttribute("value"),
      n != null
        ? hl(e, m, Kt(n))
        : i != null
          ? hl(e, m, Kt(i))
          : o != null && e.removeAttribute("value"),
      c == null && d != null && (e.defaultChecked = !!d),
      c != null &&
        (e.checked = c && typeof c != "function" && typeof c != "symbol"),
      _ != null &&
      typeof _ != "function" &&
      typeof _ != "symbol" &&
      typeof _ != "boolean"
        ? (e.name = "" + Kt(_))
        : e.removeAttribute("name"));
  }
  function pl(e, n, i, o, c, d, m, _) {
    if (
      (d != null &&
        typeof d != "function" &&
        typeof d != "symbol" &&
        typeof d != "boolean" &&
        (e.type = d),
      n != null || i != null)
    ) {
      if (!((d !== "submit" && d !== "reset") || n != null)) {
        cl(e);
        return;
      }
      ((i = i != null ? "" + Kt(i) : ""),
        (n = n != null ? "" + Kt(n) : i),
        _ || n === e.value || (e.value = n),
        (e.defaultValue = n));
    }
    ((o = o ?? c),
      (o = typeof o != "function" && typeof o != "symbol" && !!o),
      (e.checked = _ ? e.checked : !!o),
      (e.defaultChecked = !!o),
      m != null &&
        typeof m != "function" &&
        typeof m != "symbol" &&
        typeof m != "boolean" &&
        (e.name = m),
      cl(e));
  }
  function hl(e, n, i) {
    (n === "number" && da(e.ownerDocument) === e) ||
      e.defaultValue === "" + i ||
      (e.defaultValue = "" + i);
  }
  function Fa(e, n, i, o) {
    if (((e = e.options), n)) {
      n = {};
      for (var c = 0; c < i.length; c++) n["$" + i[c]] = !0;
      for (i = 0; i < e.length; i++)
        ((c = n.hasOwnProperty("$" + e[i].value)),
          e[i].selected !== c && (e[i].selected = c),
          c && o && (e[i].defaultSelected = !0));
    } else {
      for (i = "" + Kt(i), n = null, c = 0; c < e.length; c++) {
        if (e[c].value === i) {
          ((e[c].selected = !0), o && (e[c].defaultSelected = !0));
          return;
        }
        n !== null || e[c].disabled || (n = e[c]);
      }
      n !== null && (n.selected = !0);
    }
  }
  function Uo(e, n, i) {
    if (
      n != null &&
      ((n = "" + Kt(n)), n !== e.value && (e.value = n), i == null)
    ) {
      e.defaultValue !== n && (e.defaultValue = n);
      return;
    }
    e.defaultValue = i != null ? "" + Kt(i) : "";
  }
  function gl(e, n, i, o) {
    if (n == null) {
      if (o != null) {
        if (i != null) throw Error(l(92));
        if (de(o)) {
          if (1 < o.length) throw Error(l(93));
          o = o[0];
        }
        i = o;
      }
      (i == null && (i = ""), (n = i));
    }
    ((i = Kt(n)),
      (e.defaultValue = i),
      (o = e.textContent),
      o === i && o !== "" && o !== null && (e.value = o),
      cl(e));
  }
  function Ia(e, n) {
    if (n) {
      var i = e.firstChild;
      if (i && i === e.lastChild && i.nodeType === 3) {
        i.nodeValue = n;
        return;
      }
    }
    e.textContent = n;
  }
  var ec = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " ",
    ),
  );
  function Fo(e, n, i) {
    var o = n.indexOf("--") === 0;
    i == null || typeof i == "boolean" || i === ""
      ? o
        ? e.setProperty(n, "")
        : n === "float"
          ? (e.cssFloat = "")
          : (e[n] = "")
      : o
        ? e.setProperty(n, i)
        : typeof i != "number" || i === 0 || ec.has(n)
          ? n === "float"
            ? (e.cssFloat = i)
            : (e[n] = ("" + i).trim())
          : (e[n] = i + "px");
  }
  function Qr(e, n, i) {
    if (n != null && typeof n != "object") throw Error(l(62));
    if (((e = e.style), i != null)) {
      for (var o in i)
        !i.hasOwnProperty(o) ||
          (n != null && n.hasOwnProperty(o)) ||
          (o.indexOf("--") === 0
            ? e.setProperty(o, "")
            : o === "float"
              ? (e.cssFloat = "")
              : (e[o] = ""));
      for (var c in n)
        ((o = n[c]), n.hasOwnProperty(c) && i[c] !== o && Fo(e, c, o));
    } else for (var d in n) n.hasOwnProperty(d) && Fo(e, d, n[d]);
  }
  function yl(e) {
    if (e.indexOf("-") === -1) return !1;
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var tc = new Map([
      ["acceptCharset", "accept-charset"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
      ["crossOrigin", "crossorigin"],
      ["accentHeight", "accent-height"],
      ["alignmentBaseline", "alignment-baseline"],
      ["arabicForm", "arabic-form"],
      ["baselineShift", "baseline-shift"],
      ["capHeight", "cap-height"],
      ["clipPath", "clip-path"],
      ["clipRule", "clip-rule"],
      ["colorInterpolation", "color-interpolation"],
      ["colorInterpolationFilters", "color-interpolation-filters"],
      ["colorProfile", "color-profile"],
      ["colorRendering", "color-rendering"],
      ["dominantBaseline", "dominant-baseline"],
      ["enableBackground", "enable-background"],
      ["fillOpacity", "fill-opacity"],
      ["fillRule", "fill-rule"],
      ["floodColor", "flood-color"],
      ["floodOpacity", "flood-opacity"],
      ["fontFamily", "font-family"],
      ["fontSize", "font-size"],
      ["fontSizeAdjust", "font-size-adjust"],
      ["fontStretch", "font-stretch"],
      ["fontStyle", "font-style"],
      ["fontVariant", "font-variant"],
      ["fontWeight", "font-weight"],
      ["glyphName", "glyph-name"],
      ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
      ["glyphOrientationVertical", "glyph-orientation-vertical"],
      ["horizAdvX", "horiz-adv-x"],
      ["horizOriginX", "horiz-origin-x"],
      ["imageRendering", "image-rendering"],
      ["letterSpacing", "letter-spacing"],
      ["lightingColor", "lighting-color"],
      ["markerEnd", "marker-end"],
      ["markerMid", "marker-mid"],
      ["markerStart", "marker-start"],
      ["overlinePosition", "overline-position"],
      ["overlineThickness", "overline-thickness"],
      ["paintOrder", "paint-order"],
      ["panose-1", "panose-1"],
      ["pointerEvents", "pointer-events"],
      ["renderingIntent", "rendering-intent"],
      ["shapeRendering", "shape-rendering"],
      ["stopColor", "stop-color"],
      ["stopOpacity", "stop-opacity"],
      ["strikethroughPosition", "strikethrough-position"],
      ["strikethroughThickness", "strikethrough-thickness"],
      ["strokeDasharray", "stroke-dasharray"],
      ["strokeDashoffset", "stroke-dashoffset"],
      ["strokeLinecap", "stroke-linecap"],
      ["strokeLinejoin", "stroke-linejoin"],
      ["strokeMiterlimit", "stroke-miterlimit"],
      ["strokeOpacity", "stroke-opacity"],
      ["strokeWidth", "stroke-width"],
      ["textAnchor", "text-anchor"],
      ["textDecoration", "text-decoration"],
      ["textRendering", "text-rendering"],
      ["transformOrigin", "transform-origin"],
      ["underlinePosition", "underline-position"],
      ["underlineThickness", "underline-thickness"],
      ["unicodeBidi", "unicode-bidi"],
      ["unicodeRange", "unicode-range"],
      ["unitsPerEm", "units-per-em"],
      ["vAlphabetic", "v-alphabetic"],
      ["vHanging", "v-hanging"],
      ["vIdeographic", "v-ideographic"],
      ["vMathematical", "v-mathematical"],
      ["vectorEffect", "vector-effect"],
      ["vertAdvY", "vert-adv-y"],
      ["vertOriginX", "vert-origin-x"],
      ["vertOriginY", "vert-origin-y"],
      ["wordSpacing", "word-spacing"],
      ["writingMode", "writing-mode"],
      ["xmlnsXlink", "xmlns:xlink"],
      ["xHeight", "x-height"],
    ]),
    nc =
      /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function pa(e) {
    return nc.test("" + e)
      ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      : e;
  }
  function on() {}
  var Er = null;
  function _r(e) {
    return (
      (e = e.target || e.srcElement || window),
      e.correspondingUseElement && (e = e.correspondingUseElement),
      e.nodeType === 3 ? e.parentNode : e
    );
  }
  var Ha = null,
    ha = null;
  function Jr(e) {
    var n = Ba(e);
    if (n && (e = n.stateNode)) {
      var i = e[Vt] || null;
      e: switch (((e = n.stateNode), n.type)) {
        case "input":
          if (
            (dl(
              e,
              i.value,
              i.defaultValue,
              i.defaultValue,
              i.checked,
              i.defaultChecked,
              i.type,
              i.name,
            ),
            (n = i.name),
            i.type === "radio" && n != null)
          ) {
            for (i = e; i.parentNode; ) i = i.parentNode;
            for (
              i = i.querySelectorAll(
                'input[name="' + Qt("" + n) + '"][type="radio"]',
              ),
                n = 0;
              n < i.length;
              n++
            ) {
              var o = i[n];
              if (o !== e && o.form === e.form) {
                var c = o[Vt] || null;
                if (!c) throw Error(l(90));
                dl(
                  o,
                  c.value,
                  c.defaultValue,
                  c.defaultValue,
                  c.checked,
                  c.defaultChecked,
                  c.type,
                  c.name,
                );
              }
            }
            for (n = 0; n < i.length; n++)
              ((o = i[n]), o.form === e.form && Bo(o));
          }
          break e;
        case "textarea":
          Uo(e, i.value, i.defaultValue);
          break e;
        case "select":
          ((n = i.value), n != null && Fa(e, !!i.multiple, n, !1));
      }
    }
  }
  var Wr = !1;
  function Wn(e, n, i) {
    if (Wr) return e(n, i);
    Wr = !0;
    try {
      var o = e(n);
      return o;
    } finally {
      if (
        ((Wr = !1),
        (Ha !== null || ha !== null) &&
          (_s(), Ha && ((n = Ha), (e = ha), (ha = Ha = null), Jr(n), e)))
      )
        for (n = 0; n < e.length; n++) Jr(e[n]);
    }
  }
  function zn(e, n) {
    var i = e.stateNode;
    if (i === null) return null;
    var o = i[Vt] || null;
    if (o === null) return null;
    i = o[n];
    e: switch (n) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        ((o = !o.disabled) ||
          ((e = e.type),
          (o = !(
            e === "button" ||
            e === "input" ||
            e === "select" ||
            e === "textarea"
          ))),
          (e = !o));
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (i && typeof i != "function") throw Error(l(231, n, typeof i));
    return i;
  }
  var Bn = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    ei = !1;
  if (Bn)
    try {
      var wr = {};
      (Object.defineProperty(wr, "passive", {
        get: function () {
          ei = !0;
        },
      }),
        window.addEventListener("test", wr, wr),
        window.removeEventListener("test", wr, wr));
    } catch {
      ei = !1;
    }
  var Un = null,
    ml = null,
    ti = null;
  function vl() {
    if (ti) return ti;
    var e,
      n = ml,
      i = n.length,
      o,
      c = "value" in Un ? Un.value : Un.textContent,
      d = c.length;
    for (e = 0; e < i && n[e] === c[e]; e++);
    var m = i - e;
    for (o = 1; o <= m && n[i - o] === c[d - o]; o++);
    return (ti = c.slice(e, 1 < o ? 1 - o : void 0));
  }
  function ni(e) {
    var n = e.keyCode;
    return (
      "charCode" in e
        ? ((e = e.charCode), e === 0 && n === 13 && (e = 13))
        : (e = n),
      e === 10 && (e = 13),
      32 <= e || e === 13 ? e : 0
    );
  }
  function T() {
    return !0;
  }
  function N() {
    return !1;
  }
  function H(e) {
    function n(i, o, c, d, m) {
      ((this._reactName = i),
        (this._targetInst = c),
        (this.type = o),
        (this.nativeEvent = d),
        (this.target = m),
        (this.currentTarget = null));
      for (var _ in e)
        e.hasOwnProperty(_) && ((i = e[_]), (this[_] = i ? i(d) : d[_]));
      return (
        (this.isDefaultPrevented = (
          d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1
        )
          ? T
          : N),
        (this.isPropagationStopped = N),
        this
      );
    }
    return (
      v(n.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var i = this.nativeEvent;
          i &&
            (i.preventDefault
              ? i.preventDefault()
              : typeof i.returnValue != "unknown" && (i.returnValue = !1),
            (this.isDefaultPrevented = T));
        },
        stopPropagation: function () {
          var i = this.nativeEvent;
          i &&
            (i.stopPropagation
              ? i.stopPropagation()
              : typeof i.cancelBubble != "unknown" && (i.cancelBubble = !0),
            (this.isPropagationStopped = T));
        },
        persist: function () {},
        isPersistent: T,
      }),
      n
    );
  }
  var Ee = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    Be = H(Ee),
    Ze = v({}, Ee, { view: 0, detail: 0 }),
    ot = H(Ze),
    Ge,
    nt,
    Mt,
    Rt = v({}, Ze, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: rc,
      button: 0,
      buttons: 0,
      relatedTarget: function (e) {
        return e.relatedTarget === void 0
          ? e.fromElement === e.srcElement
            ? e.toElement
            : e.fromElement
          : e.relatedTarget;
      },
      movementX: function (e) {
        return "movementX" in e
          ? e.movementX
          : (e !== Mt &&
              (Mt && e.type === "mousemove"
                ? ((Ge = e.screenX - Mt.screenX), (nt = e.screenY - Mt.screenY))
                : (nt = Ge = 0),
              (Mt = e)),
            Ge);
      },
      movementY: function (e) {
        return "movementY" in e ? e.movementY : nt;
      },
    }),
    $a = H(Rt),
    bl = v({}, Rt, { dataTransfer: 0 }),
    Sl = H(bl),
    Io = v({}, Ze, { relatedTarget: 0 }),
    ac = H(Io),
    RS = v({}, Ee, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    kS = H(RS),
    DS = v({}, Ee, {
      clipboardData: function (e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      },
    }),
    LS = H(DS),
    NS = v({}, Ee, { data: 0 }),
    Kp = H(NS),
    MS = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    jS = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    zS = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey",
    };
  function BS(e) {
    var n = this.nativeEvent;
    return n.getModifierState
      ? n.getModifierState(e)
      : (e = zS[e])
        ? !!n[e]
        : !1;
  }
  function rc() {
    return BS;
  }
  var US = v({}, Ze, {
      key: function (e) {
        if (e.key) {
          var n = MS[e.key] || e.key;
          if (n !== "Unidentified") return n;
        }
        return e.type === "keypress"
          ? ((e = ni(e)), e === 13 ? "Enter" : String.fromCharCode(e))
          : e.type === "keydown" || e.type === "keyup"
            ? jS[e.keyCode] || "Unidentified"
            : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: rc,
      charCode: function (e) {
        return e.type === "keypress" ? ni(e) : 0;
      },
      keyCode: function (e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function (e) {
        return e.type === "keypress"
          ? ni(e)
          : e.type === "keydown" || e.type === "keyup"
            ? e.keyCode
            : 0;
      },
    }),
    FS = H(US),
    IS = v({}, Rt, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    Qp = H(IS),
    HS = v({}, Ze, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: rc,
    }),
    $S = H(HS),
    VS = v({}, Ee, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    GS = H(VS),
    PS = v({}, Rt, {
      deltaX: function (e) {
        return "deltaX" in e
          ? e.deltaX
          : "wheelDeltaX" in e
            ? -e.wheelDeltaX
            : 0;
      },
      deltaY: function (e) {
        return "deltaY" in e
          ? e.deltaY
          : "wheelDeltaY" in e
            ? -e.wheelDeltaY
            : "wheelDelta" in e
              ? -e.wheelDelta
              : 0;
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    qS = H(PS),
    YS = v({}, Ee, { newState: 0, oldState: 0 }),
    ZS = H(YS),
    XS = [9, 13, 27, 32],
    ic = Bn && "CompositionEvent" in window,
    El = null;
  Bn && "documentMode" in document && (El = document.documentMode);
  var KS = Bn && "TextEvent" in window && !El,
    Jp = Bn && (!ic || (El && 8 < El && 11 >= El)),
    Wp = " ",
    eh = !1;
  function th(e, n) {
    switch (e) {
      case "keyup":
        return XS.indexOf(n.keyCode) !== -1;
      case "keydown":
        return n.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function nh(e) {
    return (
      (e = e.detail),
      typeof e == "object" && "data" in e ? e.data : null
    );
  }
  var ai = !1;
  function QS(e, n) {
    switch (e) {
      case "compositionend":
        return nh(n);
      case "keypress":
        return n.which !== 32 ? null : ((eh = !0), Wp);
      case "textInput":
        return ((e = n.data), e === Wp && eh ? null : e);
      default:
        return null;
    }
  }
  function JS(e, n) {
    if (ai)
      return e === "compositionend" || (!ic && th(e, n))
        ? ((e = vl()), (ti = ml = Un = null), (ai = !1), e)
        : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(n.ctrlKey || n.altKey || n.metaKey) || (n.ctrlKey && n.altKey)) {
          if (n.char && 1 < n.char.length) return n.char;
          if (n.which) return String.fromCharCode(n.which);
        }
        return null;
      case "compositionend":
        return Jp && n.locale !== "ko" ? null : n.data;
      default:
        return null;
    }
  }
  var WS = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function ah(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n === "input" ? !!WS[e.type] : n === "textarea";
  }
  function rh(e, n, i, o) {
    (Ha ? (ha ? ha.push(o) : (ha = [o])) : (Ha = o),
      (n = Rs(n, "onChange")),
      0 < n.length &&
        ((i = new Be("onChange", "change", null, i, o)),
        e.push({ event: i, listeners: n })));
  }
  var _l = null,
    wl = null;
  function e1(e) {
    Iy(e, 0);
  }
  function Ho(e) {
    var n = Qn(e);
    if (Bo(n)) return e;
  }
  function ih(e, n) {
    if (e === "change") return n;
  }
  var lh = !1;
  if (Bn) {
    var lc;
    if (Bn) {
      var oc = "oninput" in document;
      if (!oc) {
        var oh = document.createElement("div");
        (oh.setAttribute("oninput", "return;"),
          (oc = typeof oh.oninput == "function"));
      }
      lc = oc;
    } else lc = !1;
    lh = lc && (!document.documentMode || 9 < document.documentMode);
  }
  function sh() {
    _l && (_l.detachEvent("onpropertychange", uh), (wl = _l = null));
  }
  function uh(e) {
    if (e.propertyName === "value" && Ho(wl)) {
      var n = [];
      (rh(n, wl, e, _r(e)), Wn(e1, n));
    }
  }
  function t1(e, n, i) {
    e === "focusin"
      ? (sh(), (_l = n), (wl = i), _l.attachEvent("onpropertychange", uh))
      : e === "focusout" && sh();
  }
  function n1(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return Ho(wl);
  }
  function a1(e, n) {
    if (e === "click") return Ho(n);
  }
  function r1(e, n) {
    if (e === "input" || e === "change") return Ho(n);
  }
  function i1(e, n) {
    return (e === n && (e !== 0 || 1 / e === 1 / n)) || (e !== e && n !== n);
  }
  var sn = typeof Object.is == "function" ? Object.is : i1;
  function Ol(e, n) {
    if (sn(e, n)) return !0;
    if (
      typeof e != "object" ||
      e === null ||
      typeof n != "object" ||
      n === null
    )
      return !1;
    var i = Object.keys(e),
      o = Object.keys(n);
    if (i.length !== o.length) return !1;
    for (o = 0; o < i.length; o++) {
      var c = i[o];
      if (!Ma.call(n, c) || !sn(e[c], n[c])) return !1;
    }
    return !0;
  }
  function ch(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function fh(e, n) {
    var i = ch(e);
    e = 0;
    for (var o; i; ) {
      if (i.nodeType === 3) {
        if (((o = e + i.textContent.length), e <= n && o >= n))
          return { node: i, offset: n - e };
        e = o;
      }
      e: {
        for (; i; ) {
          if (i.nextSibling) {
            i = i.nextSibling;
            break e;
          }
          i = i.parentNode;
        }
        i = void 0;
      }
      i = ch(i);
    }
  }
  function dh(e, n) {
    return e && n
      ? e === n
        ? !0
        : e && e.nodeType === 3
          ? !1
          : n && n.nodeType === 3
            ? dh(e, n.parentNode)
            : "contains" in e
              ? e.contains(n)
              : e.compareDocumentPosition
                ? !!(e.compareDocumentPosition(n) & 16)
                : !1
      : !1;
  }
  function ph(e) {
    e =
      e != null &&
      e.ownerDocument != null &&
      e.ownerDocument.defaultView != null
        ? e.ownerDocument.defaultView
        : window;
    for (var n = da(e.document); n instanceof e.HTMLIFrameElement; ) {
      try {
        var i = typeof n.contentWindow.location.href == "string";
      } catch {
        i = !1;
      }
      if (i) e = n.contentWindow;
      else break;
      n = da(e.document);
    }
    return n;
  }
  function sc(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return (
      n &&
      ((n === "input" &&
        (e.type === "text" ||
          e.type === "search" ||
          e.type === "tel" ||
          e.type === "url" ||
          e.type === "password")) ||
        n === "textarea" ||
        e.contentEditable === "true")
    );
  }
  var l1 = Bn && "documentMode" in document && 11 >= document.documentMode,
    ri = null,
    uc = null,
    xl = null,
    cc = !1;
  function hh(e, n, i) {
    var o =
      i.window === i ? i.document : i.nodeType === 9 ? i : i.ownerDocument;
    cc ||
      ri == null ||
      ri !== da(o) ||
      ((o = ri),
      "selectionStart" in o && sc(o)
        ? (o = { start: o.selectionStart, end: o.selectionEnd })
        : ((o = (
            (o.ownerDocument && o.ownerDocument.defaultView) ||
            window
          ).getSelection()),
          (o = {
            anchorNode: o.anchorNode,
            anchorOffset: o.anchorOffset,
            focusNode: o.focusNode,
            focusOffset: o.focusOffset,
          })),
      (xl && Ol(xl, o)) ||
        ((xl = o),
        (o = Rs(uc, "onSelect")),
        0 < o.length &&
          ((n = new Be("onSelect", "select", null, n, i)),
          e.push({ event: n, listeners: o }),
          (n.target = ri))));
  }
  function Or(e, n) {
    var i = {};
    return (
      (i[e.toLowerCase()] = n.toLowerCase()),
      (i["Webkit" + e] = "webkit" + n),
      (i["Moz" + e] = "moz" + n),
      i
    );
  }
  var ii = {
      animationend: Or("Animation", "AnimationEnd"),
      animationiteration: Or("Animation", "AnimationIteration"),
      animationstart: Or("Animation", "AnimationStart"),
      transitionrun: Or("Transition", "TransitionRun"),
      transitionstart: Or("Transition", "TransitionStart"),
      transitioncancel: Or("Transition", "TransitionCancel"),
      transitionend: Or("Transition", "TransitionEnd"),
    },
    fc = {},
    gh = {};
  Bn &&
    ((gh = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete ii.animationend.animation,
      delete ii.animationiteration.animation,
      delete ii.animationstart.animation),
    "TransitionEvent" in window || delete ii.transitionend.transition);
  function xr(e) {
    if (fc[e]) return fc[e];
    if (!ii[e]) return e;
    var n = ii[e],
      i;
    for (i in n) if (n.hasOwnProperty(i) && i in gh) return (fc[e] = n[i]);
    return e;
  }
  var yh = xr("animationend"),
    mh = xr("animationiteration"),
    vh = xr("animationstart"),
    o1 = xr("transitionrun"),
    s1 = xr("transitionstart"),
    u1 = xr("transitioncancel"),
    bh = xr("transitionend"),
    Sh = new Map(),
    dc =
      "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
        " ",
      );
  dc.push("scrollEnd");
  function Fn(e, n) {
    (Sh.set(e, n), fa(n, [e]));
  }
  var $o =
      typeof reportError == "function"
        ? reportError
        : function (e) {
            if (
              typeof window == "object" &&
              typeof window.ErrorEvent == "function"
            ) {
              var n = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message:
                  typeof e == "object" &&
                  e !== null &&
                  typeof e.message == "string"
                    ? String(e.message)
                    : String(e),
                error: e,
              });
              if (!window.dispatchEvent(n)) return;
            } else if (
              typeof process == "object" &&
              typeof process.emit == "function"
            ) {
              process.emit("uncaughtException", e);
              return;
            }
            console.error(e);
          },
    Sn = [],
    li = 0,
    pc = 0;
  function Vo() {
    for (var e = li, n = (pc = li = 0); n < e; ) {
      var i = Sn[n];
      Sn[n++] = null;
      var o = Sn[n];
      Sn[n++] = null;
      var c = Sn[n];
      Sn[n++] = null;
      var d = Sn[n];
      if (((Sn[n++] = null), o !== null && c !== null)) {
        var m = o.pending;
        (m === null ? (c.next = c) : ((c.next = m.next), (m.next = c)),
          (o.pending = c));
      }
      d !== 0 && Eh(i, c, d);
    }
  }
  function Go(e, n, i, o) {
    ((Sn[li++] = e),
      (Sn[li++] = n),
      (Sn[li++] = i),
      (Sn[li++] = o),
      (pc |= o),
      (e.lanes |= o),
      (e = e.alternate),
      e !== null && (e.lanes |= o));
  }
  function hc(e, n, i, o) {
    return (Go(e, n, i, o), Po(e));
  }
  function Cr(e, n) {
    return (Go(e, null, null, n), Po(e));
  }
  function Eh(e, n, i) {
    e.lanes |= i;
    var o = e.alternate;
    o !== null && (o.lanes |= i);
    for (var c = !1, d = e.return; d !== null; )
      ((d.childLanes |= i),
        (o = d.alternate),
        o !== null && (o.childLanes |= i),
        d.tag === 22 &&
          ((e = d.stateNode), e === null || e._visibility & 1 || (c = !0)),
        (e = d),
        (d = d.return));
    return e.tag === 3
      ? ((d = e.stateNode),
        c &&
          n !== null &&
          ((c = 31 - be(i)),
          (e = d.hiddenUpdates),
          (o = e[c]),
          o === null ? (e[c] = [n]) : o.push(n),
          (n.lane = i | 536870912)),
        d)
      : null;
  }
  function Po(e) {
    if (50 < Yl) throw ((Yl = 0), (Of = null), Error(l(185)));
    for (var n = e.return; n !== null; ) ((e = n), (n = e.return));
    return e.tag === 3 ? e.stateNode : null;
  }
  var oi = {};
  function c1(e, n, i, o) {
    ((this.tag = e),
      (this.key = i),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.refCleanup = this.ref = null),
      (this.pendingProps = n),
      (this.dependencies =
        this.memoizedState =
        this.updateQueue =
        this.memoizedProps =
          null),
      (this.mode = o),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null));
  }
  function un(e, n, i, o) {
    return new c1(e, n, i, o);
  }
  function gc(e) {
    return ((e = e.prototype), !(!e || !e.isReactComponent));
  }
  function ga(e, n) {
    var i = e.alternate;
    return (
      i === null
        ? ((i = un(e.tag, n, e.key, e.mode)),
          (i.elementType = e.elementType),
          (i.type = e.type),
          (i.stateNode = e.stateNode),
          (i.alternate = e),
          (e.alternate = i))
        : ((i.pendingProps = n),
          (i.type = e.type),
          (i.flags = 0),
          (i.subtreeFlags = 0),
          (i.deletions = null)),
      (i.flags = e.flags & 65011712),
      (i.childLanes = e.childLanes),
      (i.lanes = e.lanes),
      (i.child = e.child),
      (i.memoizedProps = e.memoizedProps),
      (i.memoizedState = e.memoizedState),
      (i.updateQueue = e.updateQueue),
      (n = e.dependencies),
      (i.dependencies =
        n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }),
      (i.sibling = e.sibling),
      (i.index = e.index),
      (i.ref = e.ref),
      (i.refCleanup = e.refCleanup),
      i
    );
  }
  function _h(e, n) {
    e.flags &= 65011714;
    var i = e.alternate;
    return (
      i === null
        ? ((e.childLanes = 0),
          (e.lanes = n),
          (e.child = null),
          (e.subtreeFlags = 0),
          (e.memoizedProps = null),
          (e.memoizedState = null),
          (e.updateQueue = null),
          (e.dependencies = null),
          (e.stateNode = null))
        : ((e.childLanes = i.childLanes),
          (e.lanes = i.lanes),
          (e.child = i.child),
          (e.subtreeFlags = 0),
          (e.deletions = null),
          (e.memoizedProps = i.memoizedProps),
          (e.memoizedState = i.memoizedState),
          (e.updateQueue = i.updateQueue),
          (e.type = i.type),
          (n = i.dependencies),
          (e.dependencies =
            n === null
              ? null
              : { lanes: n.lanes, firstContext: n.firstContext })),
      e
    );
  }
  function qo(e, n, i, o, c, d) {
    var m = 0;
    if (((o = e), typeof e == "function")) gc(e) && (m = 1);
    else if (typeof e == "string")
      m = gE(e, i, ce.current)
        ? 26
        : e === "html" || e === "head" || e === "body"
          ? 27
          : 5;
    else
      e: switch (e) {
        case se:
          return (
            (e = un(31, i, n, c)),
            (e.elementType = se),
            (e.lanes = d),
            e
          );
        case b:
          return Tr(i.children, c, d, n);
        case O:
          ((m = 8), (c |= 24));
          break;
        case k:
          return (
            (e = un(12, i, n, c | 2)),
            (e.elementType = k),
            (e.lanes = d),
            e
          );
        case ae:
          return (
            (e = un(13, i, n, c)),
            (e.elementType = ae),
            (e.lanes = d),
            e
          );
        case re:
          return (
            (e = un(19, i, n, c)),
            (e.elementType = re),
            (e.lanes = d),
            e
          );
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case z:
                m = 10;
                break e;
              case L:
                m = 9;
                break e;
              case Q:
                m = 11;
                break e;
              case q:
                m = 14;
                break e;
              case ie:
                ((m = 16), (o = null));
                break e;
            }
          ((m = 29),
            (i = Error(l(130, e === null ? "null" : typeof e, ""))),
            (o = null));
      }
    return (
      (n = un(m, i, n, c)),
      (n.elementType = e),
      (n.type = o),
      (n.lanes = d),
      n
    );
  }
  function Tr(e, n, i, o) {
    return ((e = un(7, e, o, n)), (e.lanes = i), e);
  }
  function yc(e, n, i) {
    return ((e = un(6, e, null, n)), (e.lanes = i), e);
  }
  function wh(e) {
    var n = un(18, null, null, 0);
    return ((n.stateNode = e), n);
  }
  function mc(e, n, i) {
    return (
      (n = un(4, e.children !== null ? e.children : [], e.key, n)),
      (n.lanes = i),
      (n.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        implementation: e.implementation,
      }),
      n
    );
  }
  var Oh = new WeakMap();
  function En(e, n) {
    if (typeof e == "object" && e !== null) {
      var i = Oh.get(e);
      return i !== void 0
        ? i
        : ((n = { value: e, source: n, stack: mr(n) }), Oh.set(e, n), n);
    }
    return { value: e, source: n, stack: mr(n) };
  }
  var si = [],
    ui = 0,
    Yo = null,
    Cl = 0,
    _n = [],
    wn = 0,
    Va = null,
    ea = 1,
    ta = "";
  function ya(e, n) {
    ((si[ui++] = Cl), (si[ui++] = Yo), (Yo = e), (Cl = n));
  }
  function xh(e, n, i) {
    ((_n[wn++] = ea), (_n[wn++] = ta), (_n[wn++] = Va), (Va = e));
    var o = ea;
    e = ta;
    var c = 32 - be(o) - 1;
    ((o &= ~(1 << c)), (i += 1));
    var d = 32 - be(n) + c;
    if (30 < d) {
      var m = c - (c % 5);
      ((d = (o & ((1 << m) - 1)).toString(32)),
        (o >>= m),
        (c -= m),
        (ea = (1 << (32 - be(n) + c)) | (i << c) | o),
        (ta = d + e));
    } else ((ea = (1 << d) | (i << c) | o), (ta = e));
  }
  function vc(e) {
    e.return !== null && (ya(e, 1), xh(e, 1, 0));
  }
  function bc(e) {
    for (; e === Yo; )
      ((Yo = si[--ui]), (si[ui] = null), (Cl = si[--ui]), (si[ui] = null));
    for (; e === Va; )
      ((Va = _n[--wn]),
        (_n[wn] = null),
        (ta = _n[--wn]),
        (_n[wn] = null),
        (ea = _n[--wn]),
        (_n[wn] = null));
  }
  function Ch(e, n) {
    ((_n[wn++] = ea),
      (_n[wn++] = ta),
      (_n[wn++] = Va),
      (ea = n.id),
      (ta = n.overflow),
      (Va = e));
  }
  var jt = null,
    ut = null,
    Pe = !1,
    Ga = null,
    On = !1,
    Sc = Error(l(519));
  function Pa(e) {
    var n = Error(
      l(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1]
          ? "text"
          : "HTML",
        "",
      ),
    );
    throw (Tl(En(n, e)), Sc);
  }
  function Th(e) {
    var n = e.stateNode,
      i = e.type,
      o = e.memoizedProps;
    switch (((n[Ct] = e), (n[Vt] = o), i)) {
      case "dialog":
        (Ie("cancel", n), Ie("close", n));
        break;
      case "iframe":
      case "object":
      case "embed":
        Ie("load", n);
        break;
      case "video":
      case "audio":
        for (i = 0; i < Xl.length; i++) Ie(Xl[i], n);
        break;
      case "source":
        Ie("error", n);
        break;
      case "img":
      case "image":
      case "link":
        (Ie("error", n), Ie("load", n));
        break;
      case "details":
        Ie("toggle", n);
        break;
      case "input":
        (Ie("invalid", n),
          pl(
            n,
            o.value,
            o.defaultValue,
            o.checked,
            o.defaultChecked,
            o.type,
            o.name,
            !0,
          ));
        break;
      case "select":
        Ie("invalid", n);
        break;
      case "textarea":
        (Ie("invalid", n), gl(n, o.value, o.defaultValue, o.children));
    }
    ((i = o.children),
      (typeof i != "string" && typeof i != "number" && typeof i != "bigint") ||
      n.textContent === "" + i ||
      o.suppressHydrationWarning === !0 ||
      Gy(n.textContent, i)
        ? (o.popover != null && (Ie("beforetoggle", n), Ie("toggle", n)),
          o.onScroll != null && Ie("scroll", n),
          o.onScrollEnd != null && Ie("scrollend", n),
          o.onClick != null && (n.onclick = on),
          (n = !0))
        : (n = !1),
      n || Pa(e, !0));
  }
  function Ah(e) {
    for (jt = e.return; jt; )
      switch (jt.tag) {
        case 5:
        case 31:
        case 13:
          On = !1;
          return;
        case 27:
        case 3:
          On = !0;
          return;
        default:
          jt = jt.return;
      }
  }
  function ci(e) {
    if (e !== jt) return !1;
    if (!Pe) return (Ah(e), (Pe = !0), !1);
    var n = e.tag,
      i;
    if (
      ((i = n !== 3 && n !== 27) &&
        ((i = n === 5) &&
          ((i = e.type),
          (i =
            !(i !== "form" && i !== "button") || Ff(e.type, e.memoizedProps))),
        (i = !i)),
      i && ut && Pa(e),
      Ah(e),
      n === 13)
    ) {
      if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
        throw Error(l(317));
      ut = Wy(e);
    } else if (n === 31) {
      if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
        throw Error(l(317));
      ut = Wy(e);
    } else
      n === 27
        ? ((n = ut), ir(e.type) ? ((e = Gf), (Gf = null), (ut = e)) : (ut = n))
        : (ut = jt ? Cn(e.stateNode.nextSibling) : null);
    return !0;
  }
  function Ar() {
    ((ut = jt = null), (Pe = !1));
  }
  function Ec() {
    var e = Ga;
    return (
      e !== null &&
        (tn === null ? (tn = e) : tn.push.apply(tn, e), (Ga = null)),
      e
    );
  }
  function Tl(e) {
    Ga === null ? (Ga = [e]) : Ga.push(e);
  }
  var _c = A(null),
    Rr = null,
    ma = null;
  function qa(e, n, i) {
    (B(_c, n._currentValue), (n._currentValue = i));
  }
  function va(e) {
    ((e._currentValue = _c.current), V(_c));
  }
  function wc(e, n, i) {
    for (; e !== null; ) {
      var o = e.alternate;
      if (
        ((e.childLanes & n) !== n
          ? ((e.childLanes |= n), o !== null && (o.childLanes |= n))
          : o !== null && (o.childLanes & n) !== n && (o.childLanes |= n),
        e === i)
      )
        break;
      e = e.return;
    }
  }
  function Oc(e, n, i, o) {
    var c = e.child;
    for (c !== null && (c.return = e); c !== null; ) {
      var d = c.dependencies;
      if (d !== null) {
        var m = c.child;
        d = d.firstContext;
        e: for (; d !== null; ) {
          var _ = d;
          d = c;
          for (var R = 0; R < n.length; R++)
            if (_.context === n[R]) {
              ((d.lanes |= i),
                (_ = d.alternate),
                _ !== null && (_.lanes |= i),
                wc(d.return, i, e),
                o || (m = null));
              break e;
            }
          d = _.next;
        }
      } else if (c.tag === 18) {
        if (((m = c.return), m === null)) throw Error(l(341));
        ((m.lanes |= i),
          (d = m.alternate),
          d !== null && (d.lanes |= i),
          wc(m, i, e),
          (m = null));
      } else m = c.child;
      if (m !== null) m.return = c;
      else
        for (m = c; m !== null; ) {
          if (m === e) {
            m = null;
            break;
          }
          if (((c = m.sibling), c !== null)) {
            ((c.return = m.return), (m = c));
            break;
          }
          m = m.return;
        }
      c = m;
    }
  }
  function fi(e, n, i, o) {
    e = null;
    for (var c = n, d = !1; c !== null; ) {
      if (!d) {
        if ((c.flags & 524288) !== 0) d = !0;
        else if ((c.flags & 262144) !== 0) break;
      }
      if (c.tag === 10) {
        var m = c.alternate;
        if (m === null) throw Error(l(387));
        if (((m = m.memoizedProps), m !== null)) {
          var _ = c.type;
          sn(c.pendingProps.value, m.value) ||
            (e !== null ? e.push(_) : (e = [_]));
        }
      } else if (c === ke.current) {
        if (((m = c.alternate), m === null)) throw Error(l(387));
        m.memoizedState.memoizedState !== c.memoizedState.memoizedState &&
          (e !== null ? e.push(eo) : (e = [eo]));
      }
      c = c.return;
    }
    (e !== null && Oc(n, e, i, o), (n.flags |= 262144));
  }
  function Zo(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!sn(e.context._currentValue, e.memoizedValue)) return !0;
      e = e.next;
    }
    return !1;
  }
  function kr(e) {
    ((Rr = e),
      (ma = null),
      (e = e.dependencies),
      e !== null && (e.firstContext = null));
  }
  function zt(e) {
    return Rh(Rr, e);
  }
  function Xo(e, n) {
    return (Rr === null && kr(e), Rh(e, n));
  }
  function Rh(e, n) {
    var i = n._currentValue;
    if (((n = { context: n, memoizedValue: i, next: null }), ma === null)) {
      if (e === null) throw Error(l(308));
      ((ma = n),
        (e.dependencies = { lanes: 0, firstContext: n }),
        (e.flags |= 524288));
    } else ma = ma.next = n;
    return i;
  }
  var f1 =
      typeof AbortController < "u"
        ? AbortController
        : function () {
            var e = [],
              n = (this.signal = {
                aborted: !1,
                addEventListener: function (i, o) {
                  e.push(o);
                },
              });
            this.abort = function () {
              ((n.aborted = !0),
                e.forEach(function (i) {
                  return i();
                }));
            };
          },
    d1 = t.unstable_scheduleCallback,
    p1 = t.unstable_NormalPriority,
    Et = {
      $$typeof: z,
      Consumer: null,
      Provider: null,
      _currentValue: null,
      _currentValue2: null,
      _threadCount: 0,
    };
  function xc() {
    return { controller: new f1(), data: new Map(), refCount: 0 };
  }
  function Al(e) {
    (e.refCount--,
      e.refCount === 0 &&
        d1(p1, function () {
          e.controller.abort();
        }));
  }
  var Rl = null,
    Cc = 0,
    di = 0,
    pi = null;
  function h1(e, n) {
    if (Rl === null) {
      var i = (Rl = []);
      ((Cc = 0),
        (di = kf()),
        (pi = {
          status: "pending",
          value: void 0,
          then: function (o) {
            i.push(o);
          },
        }));
    }
    return (Cc++, n.then(kh, kh), n);
  }
  function kh() {
    if (--Cc === 0 && Rl !== null) {
      pi !== null && (pi.status = "fulfilled");
      var e = Rl;
      ((Rl = null), (di = 0), (pi = null));
      for (var n = 0; n < e.length; n++) (0, e[n])();
    }
  }
  function g1(e, n) {
    var i = [],
      o = {
        status: "pending",
        value: null,
        reason: null,
        then: function (c) {
          i.push(c);
        },
      };
    return (
      e.then(
        function () {
          ((o.status = "fulfilled"), (o.value = n));
          for (var c = 0; c < i.length; c++) (0, i[c])(n);
        },
        function (c) {
          for (o.status = "rejected", o.reason = c, c = 0; c < i.length; c++)
            (0, i[c])(void 0);
        },
      ),
      o
    );
  }
  var Dh = M.S;
  M.S = function (e, n) {
    ((hy = At()),
      typeof n == "object" &&
        n !== null &&
        typeof n.then == "function" &&
        h1(e, n),
      Dh !== null && Dh(e, n));
  };
  var Dr = A(null);
  function Tc() {
    var e = Dr.current;
    return e !== null ? e : lt.pooledCache;
  }
  function Ko(e, n) {
    n === null ? B(Dr, Dr.current) : B(Dr, n.pool);
  }
  function Lh() {
    var e = Tc();
    return e === null ? null : { parent: Et._currentValue, pool: e };
  }
  var hi = Error(l(460)),
    Ac = Error(l(474)),
    Qo = Error(l(542)),
    Jo = { then: function () {} };
  function Nh(e) {
    return ((e = e.status), e === "fulfilled" || e === "rejected");
  }
  function Mh(e, n, i) {
    switch (
      ((i = e[i]),
      i === void 0 ? e.push(n) : i !== n && (n.then(on, on), (n = i)),
      n.status)
    ) {
      case "fulfilled":
        return n.value;
      case "rejected":
        throw ((e = n.reason), zh(e), e);
      default:
        if (typeof n.status == "string") n.then(on, on);
        else {
          if (((e = lt), e !== null && 100 < e.shellSuspendCounter))
            throw Error(l(482));
          ((e = n),
            (e.status = "pending"),
            e.then(
              function (o) {
                if (n.status === "pending") {
                  var c = n;
                  ((c.status = "fulfilled"), (c.value = o));
                }
              },
              function (o) {
                if (n.status === "pending") {
                  var c = n;
                  ((c.status = "rejected"), (c.reason = o));
                }
              },
            ));
        }
        switch (n.status) {
          case "fulfilled":
            return n.value;
          case "rejected":
            throw ((e = n.reason), zh(e), e);
        }
        throw ((Nr = n), hi);
    }
  }
  function Lr(e) {
    try {
      var n = e._init;
      return n(e._payload);
    } catch (i) {
      throw i !== null && typeof i == "object" && typeof i.then == "function"
        ? ((Nr = i), hi)
        : i;
    }
  }
  var Nr = null;
  function jh() {
    if (Nr === null) throw Error(l(459));
    var e = Nr;
    return ((Nr = null), e);
  }
  function zh(e) {
    if (e === hi || e === Qo) throw Error(l(483));
  }
  var gi = null,
    kl = 0;
  function Wo(e) {
    var n = kl;
    return ((kl += 1), gi === null && (gi = []), Mh(gi, e, n));
  }
  function Dl(e, n) {
    ((n = n.props.ref), (e.ref = n !== void 0 ? n : null));
  }
  function es(e, n) {
    throw n.$$typeof === E
      ? Error(l(525))
      : ((e = Object.prototype.toString.call(n)),
        Error(
          l(
            31,
            e === "[object Object]"
              ? "object with keys {" + Object.keys(n).join(", ") + "}"
              : e,
          ),
        ));
  }
  function Bh(e) {
    function n(j, D) {
      if (e) {
        var F = j.deletions;
        F === null ? ((j.deletions = [D]), (j.flags |= 16)) : F.push(D);
      }
    }
    function i(j, D) {
      if (!e) return null;
      for (; D !== null; ) (n(j, D), (D = D.sibling));
      return null;
    }
    function o(j) {
      for (var D = new Map(); j !== null; )
        (j.key !== null ? D.set(j.key, j) : D.set(j.index, j), (j = j.sibling));
      return D;
    }
    function c(j, D) {
      return ((j = ga(j, D)), (j.index = 0), (j.sibling = null), j);
    }
    function d(j, D, F) {
      return (
        (j.index = F),
        e
          ? ((F = j.alternate),
            F !== null
              ? ((F = F.index), F < D ? ((j.flags |= 67108866), D) : F)
              : ((j.flags |= 67108866), D))
          : ((j.flags |= 1048576), D)
      );
    }
    function m(j) {
      return (e && j.alternate === null && (j.flags |= 67108866), j);
    }
    function _(j, D, F, J) {
      return D === null || D.tag !== 6
        ? ((D = yc(F, j.mode, J)), (D.return = j), D)
        : ((D = c(D, F)), (D.return = j), D);
    }
    function R(j, D, F, J) {
      var Ae = F.type;
      return Ae === b
        ? K(j, D, F.props.children, J, F.key)
        : D !== null &&
            (D.elementType === Ae ||
              (typeof Ae == "object" &&
                Ae !== null &&
                Ae.$$typeof === ie &&
                Lr(Ae) === D.type))
          ? ((D = c(D, F.props)), Dl(D, F), (D.return = j), D)
          : ((D = qo(F.type, F.key, F.props, null, j.mode, J)),
            Dl(D, F),
            (D.return = j),
            D);
    }
    function I(j, D, F, J) {
      return D === null ||
        D.tag !== 4 ||
        D.stateNode.containerInfo !== F.containerInfo ||
        D.stateNode.implementation !== F.implementation
        ? ((D = mc(F, j.mode, J)), (D.return = j), D)
        : ((D = c(D, F.children || [])), (D.return = j), D);
    }
    function K(j, D, F, J, Ae) {
      return D === null || D.tag !== 7
        ? ((D = Tr(F, j.mode, J, Ae)), (D.return = j), D)
        : ((D = c(D, F)), (D.return = j), D);
    }
    function ee(j, D, F) {
      if (
        (typeof D == "string" && D !== "") ||
        typeof D == "number" ||
        typeof D == "bigint"
      )
        return ((D = yc("" + D, j.mode, F)), (D.return = j), D);
      if (typeof D == "object" && D !== null) {
        switch (D.$$typeof) {
          case w:
            return (
              (F = qo(D.type, D.key, D.props, null, j.mode, F)),
              Dl(F, D),
              (F.return = j),
              F
            );
          case S:
            return ((D = mc(D, j.mode, F)), (D.return = j), D);
          case ie:
            return ((D = Lr(D)), ee(j, D, F));
        }
        if (de(D) || Y(D))
          return ((D = Tr(D, j.mode, F, null)), (D.return = j), D);
        if (typeof D.then == "function") return ee(j, Wo(D), F);
        if (D.$$typeof === z) return ee(j, Xo(j, D), F);
        es(j, D);
      }
      return null;
    }
    function $(j, D, F, J) {
      var Ae = D !== null ? D.key : null;
      if (
        (typeof F == "string" && F !== "") ||
        typeof F == "number" ||
        typeof F == "bigint"
      )
        return Ae !== null ? null : _(j, D, "" + F, J);
      if (typeof F == "object" && F !== null) {
        switch (F.$$typeof) {
          case w:
            return F.key === Ae ? R(j, D, F, J) : null;
          case S:
            return F.key === Ae ? I(j, D, F, J) : null;
          case ie:
            return ((F = Lr(F)), $(j, D, F, J));
        }
        if (de(F) || Y(F)) return Ae !== null ? null : K(j, D, F, J, null);
        if (typeof F.then == "function") return $(j, D, Wo(F), J);
        if (F.$$typeof === z) return $(j, D, Xo(j, F), J);
        es(j, F);
      }
      return null;
    }
    function P(j, D, F, J, Ae) {
      if (
        (typeof J == "string" && J !== "") ||
        typeof J == "number" ||
        typeof J == "bigint"
      )
        return ((j = j.get(F) || null), _(D, j, "" + J, Ae));
      if (typeof J == "object" && J !== null) {
        switch (J.$$typeof) {
          case w:
            return (
              (j = j.get(J.key === null ? F : J.key) || null),
              R(D, j, J, Ae)
            );
          case S:
            return (
              (j = j.get(J.key === null ? F : J.key) || null),
              I(D, j, J, Ae)
            );
          case ie:
            return ((J = Lr(J)), P(j, D, F, J, Ae));
        }
        if (de(J) || Y(J))
          return ((j = j.get(F) || null), K(D, j, J, Ae, null));
        if (typeof J.then == "function") return P(j, D, F, Wo(J), Ae);
        if (J.$$typeof === z) return P(j, D, F, Xo(D, J), Ae);
        es(D, J);
      }
      return null;
    }
    function we(j, D, F, J) {
      for (
        var Ae = null, Xe = null, xe = D, ze = (D = 0), $e = null;
        xe !== null && ze < F.length;
        ze++
      ) {
        xe.index > ze ? (($e = xe), (xe = null)) : ($e = xe.sibling);
        var Ke = $(j, xe, F[ze], J);
        if (Ke === null) {
          xe === null && (xe = $e);
          break;
        }
        (e && xe && Ke.alternate === null && n(j, xe),
          (D = d(Ke, D, ze)),
          Xe === null ? (Ae = Ke) : (Xe.sibling = Ke),
          (Xe = Ke),
          (xe = $e));
      }
      if (ze === F.length) return (i(j, xe), Pe && ya(j, ze), Ae);
      if (xe === null) {
        for (; ze < F.length; ze++)
          ((xe = ee(j, F[ze], J)),
            xe !== null &&
              ((D = d(xe, D, ze)),
              Xe === null ? (Ae = xe) : (Xe.sibling = xe),
              (Xe = xe)));
        return (Pe && ya(j, ze), Ae);
      }
      for (xe = o(xe); ze < F.length; ze++)
        (($e = P(xe, j, ze, F[ze], J)),
          $e !== null &&
            (e &&
              $e.alternate !== null &&
              xe.delete($e.key === null ? ze : $e.key),
            (D = d($e, D, ze)),
            Xe === null ? (Ae = $e) : (Xe.sibling = $e),
            (Xe = $e)));
      return (
        e &&
          xe.forEach(function (cr) {
            return n(j, cr);
          }),
        Pe && ya(j, ze),
        Ae
      );
    }
    function Re(j, D, F, J) {
      if (F == null) throw Error(l(151));
      for (
        var Ae = null,
          Xe = null,
          xe = D,
          ze = (D = 0),
          $e = null,
          Ke = F.next();
        xe !== null && !Ke.done;
        ze++, Ke = F.next()
      ) {
        xe.index > ze ? (($e = xe), (xe = null)) : ($e = xe.sibling);
        var cr = $(j, xe, Ke.value, J);
        if (cr === null) {
          xe === null && (xe = $e);
          break;
        }
        (e && xe && cr.alternate === null && n(j, xe),
          (D = d(cr, D, ze)),
          Xe === null ? (Ae = cr) : (Xe.sibling = cr),
          (Xe = cr),
          (xe = $e));
      }
      if (Ke.done) return (i(j, xe), Pe && ya(j, ze), Ae);
      if (xe === null) {
        for (; !Ke.done; ze++, Ke = F.next())
          ((Ke = ee(j, Ke.value, J)),
            Ke !== null &&
              ((D = d(Ke, D, ze)),
              Xe === null ? (Ae = Ke) : (Xe.sibling = Ke),
              (Xe = Ke)));
        return (Pe && ya(j, ze), Ae);
      }
      for (xe = o(xe); !Ke.done; ze++, Ke = F.next())
        ((Ke = P(xe, j, ze, Ke.value, J)),
          Ke !== null &&
            (e &&
              Ke.alternate !== null &&
              xe.delete(Ke.key === null ? ze : Ke.key),
            (D = d(Ke, D, ze)),
            Xe === null ? (Ae = Ke) : (Xe.sibling = Ke),
            (Xe = Ke)));
      return (
        e &&
          xe.forEach(function (CE) {
            return n(j, CE);
          }),
        Pe && ya(j, ze),
        Ae
      );
    }
    function it(j, D, F, J) {
      if (
        (typeof F == "object" &&
          F !== null &&
          F.type === b &&
          F.key === null &&
          (F = F.props.children),
        typeof F == "object" && F !== null)
      ) {
        switch (F.$$typeof) {
          case w:
            e: {
              for (var Ae = F.key; D !== null; ) {
                if (D.key === Ae) {
                  if (((Ae = F.type), Ae === b)) {
                    if (D.tag === 7) {
                      (i(j, D.sibling),
                        (J = c(D, F.props.children)),
                        (J.return = j),
                        (j = J));
                      break e;
                    }
                  } else if (
                    D.elementType === Ae ||
                    (typeof Ae == "object" &&
                      Ae !== null &&
                      Ae.$$typeof === ie &&
                      Lr(Ae) === D.type)
                  ) {
                    (i(j, D.sibling),
                      (J = c(D, F.props)),
                      Dl(J, F),
                      (J.return = j),
                      (j = J));
                    break e;
                  }
                  i(j, D);
                  break;
                } else n(j, D);
                D = D.sibling;
              }
              F.type === b
                ? ((J = Tr(F.props.children, j.mode, J, F.key)),
                  (J.return = j),
                  (j = J))
                : ((J = qo(F.type, F.key, F.props, null, j.mode, J)),
                  Dl(J, F),
                  (J.return = j),
                  (j = J));
            }
            return m(j);
          case S:
            e: {
              for (Ae = F.key; D !== null; ) {
                if (D.key === Ae)
                  if (
                    D.tag === 4 &&
                    D.stateNode.containerInfo === F.containerInfo &&
                    D.stateNode.implementation === F.implementation
                  ) {
                    (i(j, D.sibling),
                      (J = c(D, F.children || [])),
                      (J.return = j),
                      (j = J));
                    break e;
                  } else {
                    i(j, D);
                    break;
                  }
                else n(j, D);
                D = D.sibling;
              }
              ((J = mc(F, j.mode, J)), (J.return = j), (j = J));
            }
            return m(j);
          case ie:
            return ((F = Lr(F)), it(j, D, F, J));
        }
        if (de(F)) return we(j, D, F, J);
        if (Y(F)) {
          if (((Ae = Y(F)), typeof Ae != "function")) throw Error(l(150));
          return ((F = Ae.call(F)), Re(j, D, F, J));
        }
        if (typeof F.then == "function") return it(j, D, Wo(F), J);
        if (F.$$typeof === z) return it(j, D, Xo(j, F), J);
        es(j, F);
      }
      return (typeof F == "string" && F !== "") ||
        typeof F == "number" ||
        typeof F == "bigint"
        ? ((F = "" + F),
          D !== null && D.tag === 6
            ? (i(j, D.sibling), (J = c(D, F)), (J.return = j), (j = J))
            : (i(j, D), (J = yc(F, j.mode, J)), (J.return = j), (j = J)),
          m(j))
        : i(j, D);
    }
    return function (j, D, F, J) {
      try {
        kl = 0;
        var Ae = it(j, D, F, J);
        return ((gi = null), Ae);
      } catch (xe) {
        if (xe === hi || xe === Qo) throw xe;
        var Xe = un(29, xe, null, j.mode);
        return ((Xe.lanes = J), (Xe.return = j), Xe);
      } finally {
      }
    };
  }
  var Mr = Bh(!0),
    Uh = Bh(!1),
    Ya = !1;
  function Rc(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null,
    };
  }
  function kc(e, n) {
    ((e = e.updateQueue),
      n.updateQueue === e &&
        (n.updateQueue = {
          baseState: e.baseState,
          firstBaseUpdate: e.firstBaseUpdate,
          lastBaseUpdate: e.lastBaseUpdate,
          shared: e.shared,
          callbacks: null,
        }));
  }
  function Za(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function Xa(e, n, i) {
    var o = e.updateQueue;
    if (o === null) return null;
    if (((o = o.shared), (Je & 2) !== 0)) {
      var c = o.pending;
      return (
        c === null ? (n.next = n) : ((n.next = c.next), (c.next = n)),
        (o.pending = n),
        (n = Po(e)),
        Eh(e, null, i),
        n
      );
    }
    return (Go(e, o, n, i), Po(e));
  }
  function Ll(e, n, i) {
    if (
      ((n = n.updateQueue), n !== null && ((n = n.shared), (i & 4194048) !== 0))
    ) {
      var o = n.lanes;
      ((o &= e.pendingLanes), (i |= o), (n.lanes = i), ko(e, i));
    }
  }
  function Dc(e, n) {
    var i = e.updateQueue,
      o = e.alternate;
    if (o !== null && ((o = o.updateQueue), i === o)) {
      var c = null,
        d = null;
      if (((i = i.firstBaseUpdate), i !== null)) {
        do {
          var m = {
            lane: i.lane,
            tag: i.tag,
            payload: i.payload,
            callback: null,
            next: null,
          };
          (d === null ? (c = d = m) : (d = d.next = m), (i = i.next));
        } while (i !== null);
        d === null ? (c = d = n) : (d = d.next = n);
      } else c = d = n;
      ((i = {
        baseState: o.baseState,
        firstBaseUpdate: c,
        lastBaseUpdate: d,
        shared: o.shared,
        callbacks: o.callbacks,
      }),
        (e.updateQueue = i));
      return;
    }
    ((e = i.lastBaseUpdate),
      e === null ? (i.firstBaseUpdate = n) : (e.next = n),
      (i.lastBaseUpdate = n));
  }
  var Lc = !1;
  function Nl() {
    if (Lc) {
      var e = pi;
      if (e !== null) throw e;
    }
  }
  function Ml(e, n, i, o) {
    Lc = !1;
    var c = e.updateQueue;
    Ya = !1;
    var d = c.firstBaseUpdate,
      m = c.lastBaseUpdate,
      _ = c.shared.pending;
    if (_ !== null) {
      c.shared.pending = null;
      var R = _,
        I = R.next;
      ((R.next = null), m === null ? (d = I) : (m.next = I), (m = R));
      var K = e.alternate;
      K !== null &&
        ((K = K.updateQueue),
        (_ = K.lastBaseUpdate),
        _ !== m &&
          (_ === null ? (K.firstBaseUpdate = I) : (_.next = I),
          (K.lastBaseUpdate = R)));
    }
    if (d !== null) {
      var ee = c.baseState;
      ((m = 0), (K = I = R = null), (_ = d));
      do {
        var $ = _.lane & -536870913,
          P = $ !== _.lane;
        if (P ? (He & $) === $ : (o & $) === $) {
          ($ !== 0 && $ === di && (Lc = !0),
            K !== null &&
              (K = K.next =
                {
                  lane: 0,
                  tag: _.tag,
                  payload: _.payload,
                  callback: null,
                  next: null,
                }));
          e: {
            var we = e,
              Re = _;
            $ = n;
            var it = i;
            switch (Re.tag) {
              case 1:
                if (((we = Re.payload), typeof we == "function")) {
                  ee = we.call(it, ee, $);
                  break e;
                }
                ee = we;
                break e;
              case 3:
                we.flags = (we.flags & -65537) | 128;
              case 0:
                if (
                  ((we = Re.payload),
                  ($ = typeof we == "function" ? we.call(it, ee, $) : we),
                  $ == null)
                )
                  break e;
                ee = v({}, ee, $);
                break e;
              case 2:
                Ya = !0;
            }
          }
          (($ = _.callback),
            $ !== null &&
              ((e.flags |= 64),
              P && (e.flags |= 8192),
              (P = c.callbacks),
              P === null ? (c.callbacks = [$]) : P.push($)));
        } else
          ((P = {
            lane: $,
            tag: _.tag,
            payload: _.payload,
            callback: _.callback,
            next: null,
          }),
            K === null ? ((I = K = P), (R = ee)) : (K = K.next = P),
            (m |= $));
        if (((_ = _.next), _ === null)) {
          if (((_ = c.shared.pending), _ === null)) break;
          ((P = _),
            (_ = P.next),
            (P.next = null),
            (c.lastBaseUpdate = P),
            (c.shared.pending = null));
        }
      } while (!0);
      (K === null && (R = ee),
        (c.baseState = R),
        (c.firstBaseUpdate = I),
        (c.lastBaseUpdate = K),
        d === null && (c.shared.lanes = 0),
        (er |= m),
        (e.lanes = m),
        (e.memoizedState = ee));
    }
  }
  function Fh(e, n) {
    if (typeof e != "function") throw Error(l(191, e));
    e.call(n);
  }
  function Ih(e, n) {
    var i = e.callbacks;
    if (i !== null)
      for (e.callbacks = null, e = 0; e < i.length; e++) Fh(i[e], n);
  }
  var yi = A(null),
    ts = A(0);
  function Hh(e, n) {
    ((e = Ta), B(ts, e), B(yi, n), (Ta = e | n.baseLanes));
  }
  function Nc() {
    (B(ts, Ta), B(yi, yi.current));
  }
  function Mc() {
    ((Ta = ts.current), V(yi), V(ts));
  }
  var cn = A(null),
    xn = null;
  function Ka(e) {
    var n = e.alternate;
    (B(yt, yt.current & 1),
      B(cn, e),
      xn === null &&
        (n === null || yi.current !== null || n.memoizedState !== null) &&
        (xn = e));
  }
  function jc(e) {
    (B(yt, yt.current), B(cn, e), xn === null && (xn = e));
  }
  function $h(e) {
    e.tag === 22
      ? (B(yt, yt.current), B(cn, e), xn === null && (xn = e))
      : Qa();
  }
  function Qa() {
    (B(yt, yt.current), B(cn, cn.current));
  }
  function fn(e) {
    (V(cn), xn === e && (xn = null), V(yt));
  }
  var yt = A(0);
  function ns(e) {
    for (var n = e; n !== null; ) {
      if (n.tag === 13) {
        var i = n.memoizedState;
        if (i !== null && ((i = i.dehydrated), i === null || $f(i) || Vf(i)))
          return n;
      } else if (
        n.tag === 19 &&
        (n.memoizedProps.revealOrder === "forwards" ||
          n.memoizedProps.revealOrder === "backwards" ||
          n.memoizedProps.revealOrder === "unstable_legacy-backwards" ||
          n.memoizedProps.revealOrder === "together")
      ) {
        if ((n.flags & 128) !== 0) return n;
      } else if (n.child !== null) {
        ((n.child.return = n), (n = n.child));
        continue;
      }
      if (n === e) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === e) return null;
        n = n.return;
      }
      ((n.sibling.return = n.return), (n = n.sibling));
    }
    return null;
  }
  var ba = 0,
    Me = null,
    at = null,
    _t = null,
    as = !1,
    mi = !1,
    jr = !1,
    rs = 0,
    jl = 0,
    vi = null,
    y1 = 0;
  function ht() {
    throw Error(l(321));
  }
  function zc(e, n) {
    if (n === null) return !1;
    for (var i = 0; i < n.length && i < e.length; i++)
      if (!sn(e[i], n[i])) return !1;
    return !0;
  }
  function Bc(e, n, i, o, c, d) {
    return (
      (ba = d),
      (Me = n),
      (n.memoizedState = null),
      (n.updateQueue = null),
      (n.lanes = 0),
      (M.H = e === null || e.memoizedState === null ? xg : Jc),
      (jr = !1),
      (d = i(o, c)),
      (jr = !1),
      mi && (d = Gh(n, i, o, c)),
      Vh(e),
      d
    );
  }
  function Vh(e) {
    M.H = Ul;
    var n = at !== null && at.next !== null;
    if (((ba = 0), (_t = at = Me = null), (as = !1), (jl = 0), (vi = null), n))
      throw Error(l(300));
    e === null ||
      wt ||
      ((e = e.dependencies), e !== null && Zo(e) && (wt = !0));
  }
  function Gh(e, n, i, o) {
    Me = e;
    var c = 0;
    do {
      if ((mi && (vi = null), (jl = 0), (mi = !1), 25 <= c))
        throw Error(l(301));
      if (((c += 1), (_t = at = null), e.updateQueue != null)) {
        var d = e.updateQueue;
        ((d.lastEffect = null),
          (d.events = null),
          (d.stores = null),
          d.memoCache != null && (d.memoCache.index = 0));
      }
      ((M.H = Cg), (d = n(i, o)));
    } while (mi);
    return d;
  }
  function m1() {
    var e = M.H,
      n = e.useState()[0];
    return (
      (n = typeof n.then == "function" ? zl(n) : n),
      (e = e.useState()[0]),
      (at !== null ? at.memoizedState : null) !== e && (Me.flags |= 1024),
      n
    );
  }
  function Uc() {
    var e = rs !== 0;
    return ((rs = 0), e);
  }
  function Fc(e, n, i) {
    ((n.updateQueue = e.updateQueue), (n.flags &= -2053), (e.lanes &= ~i));
  }
  function Ic(e) {
    if (as) {
      for (e = e.memoizedState; e !== null; ) {
        var n = e.queue;
        (n !== null && (n.pending = null), (e = e.next));
      }
      as = !1;
    }
    ((ba = 0), (_t = at = Me = null), (mi = !1), (jl = rs = 0), (vi = null));
  }
  function Yt() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null,
    };
    return (_t === null ? (Me.memoizedState = _t = e) : (_t = _t.next = e), _t);
  }
  function mt() {
    if (at === null) {
      var e = Me.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = at.next;
    var n = _t === null ? Me.memoizedState : _t.next;
    if (n !== null) ((_t = n), (at = e));
    else {
      if (e === null)
        throw Me.alternate === null ? Error(l(467)) : Error(l(310));
      ((at = e),
        (e = {
          memoizedState: at.memoizedState,
          baseState: at.baseState,
          baseQueue: at.baseQueue,
          queue: at.queue,
          next: null,
        }),
        _t === null ? (Me.memoizedState = _t = e) : (_t = _t.next = e));
    }
    return _t;
  }
  function is() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function zl(e) {
    var n = jl;
    return (
      (jl += 1),
      vi === null && (vi = []),
      (e = Mh(vi, e, n)),
      (n = Me),
      (_t === null ? n.memoizedState : _t.next) === null &&
        ((n = n.alternate),
        (M.H = n === null || n.memoizedState === null ? xg : Jc)),
      e
    );
  }
  function ls(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return zl(e);
      if (e.$$typeof === z) return zt(e);
    }
    throw Error(l(438, String(e)));
  }
  function Hc(e) {
    var n = null,
      i = Me.updateQueue;
    if ((i !== null && (n = i.memoCache), n == null)) {
      var o = Me.alternate;
      o !== null &&
        ((o = o.updateQueue),
        o !== null &&
          ((o = o.memoCache),
          o != null &&
            (n = {
              data: o.data.map(function (c) {
                return c.slice();
              }),
              index: 0,
            })));
    }
    if (
      (n == null && (n = { data: [], index: 0 }),
      i === null && ((i = is()), (Me.updateQueue = i)),
      (i.memoCache = n),
      (i = n.data[n.index]),
      i === void 0)
    )
      for (i = n.data[n.index] = Array(e), o = 0; o < e; o++) i[o] = ve;
    return (n.index++, i);
  }
  function Sa(e, n) {
    return typeof n == "function" ? n(e) : n;
  }
  function os(e) {
    var n = mt();
    return $c(n, at, e);
  }
  function $c(e, n, i) {
    var o = e.queue;
    if (o === null) throw Error(l(311));
    o.lastRenderedReducer = i;
    var c = e.baseQueue,
      d = o.pending;
    if (d !== null) {
      if (c !== null) {
        var m = c.next;
        ((c.next = d.next), (d.next = m));
      }
      ((n.baseQueue = c = d), (o.pending = null));
    }
    if (((d = e.baseState), c === null)) e.memoizedState = d;
    else {
      n = c.next;
      var _ = (m = null),
        R = null,
        I = n,
        K = !1;
      do {
        var ee = I.lane & -536870913;
        if (ee !== I.lane ? (He & ee) === ee : (ba & ee) === ee) {
          var $ = I.revertLane;
          if ($ === 0)
            (R !== null &&
              (R = R.next =
                {
                  lane: 0,
                  revertLane: 0,
                  gesture: null,
                  action: I.action,
                  hasEagerState: I.hasEagerState,
                  eagerState: I.eagerState,
                  next: null,
                }),
              ee === di && (K = !0));
          else if ((ba & $) === $) {
            ((I = I.next), $ === di && (K = !0));
            continue;
          } else
            ((ee = {
              lane: 0,
              revertLane: I.revertLane,
              gesture: null,
              action: I.action,
              hasEagerState: I.hasEagerState,
              eagerState: I.eagerState,
              next: null,
            }),
              R === null ? ((_ = R = ee), (m = d)) : (R = R.next = ee),
              (Me.lanes |= $),
              (er |= $));
          ((ee = I.action),
            jr && i(d, ee),
            (d = I.hasEagerState ? I.eagerState : i(d, ee)));
        } else
          (($ = {
            lane: ee,
            revertLane: I.revertLane,
            gesture: I.gesture,
            action: I.action,
            hasEagerState: I.hasEagerState,
            eagerState: I.eagerState,
            next: null,
          }),
            R === null ? ((_ = R = $), (m = d)) : (R = R.next = $),
            (Me.lanes |= ee),
            (er |= ee));
        I = I.next;
      } while (I !== null && I !== n);
      if (
        (R === null ? (m = d) : (R.next = _),
        !sn(d, e.memoizedState) && ((wt = !0), K && ((i = pi), i !== null)))
      )
        throw i;
      ((e.memoizedState = d),
        (e.baseState = m),
        (e.baseQueue = R),
        (o.lastRenderedState = d));
    }
    return (c === null && (o.lanes = 0), [e.memoizedState, o.dispatch]);
  }
  function Vc(e) {
    var n = mt(),
      i = n.queue;
    if (i === null) throw Error(l(311));
    i.lastRenderedReducer = e;
    var o = i.dispatch,
      c = i.pending,
      d = n.memoizedState;
    if (c !== null) {
      i.pending = null;
      var m = (c = c.next);
      do ((d = e(d, m.action)), (m = m.next));
      while (m !== c);
      (sn(d, n.memoizedState) || (wt = !0),
        (n.memoizedState = d),
        n.baseQueue === null && (n.baseState = d),
        (i.lastRenderedState = d));
    }
    return [d, o];
  }
  function Ph(e, n, i) {
    var o = Me,
      c = mt(),
      d = Pe;
    if (d) {
      if (i === void 0) throw Error(l(407));
      i = i();
    } else i = n();
    var m = !sn((at || c).memoizedState, i);
    if (
      (m && ((c.memoizedState = i), (wt = !0)),
      (c = c.queue),
      qc(Zh.bind(null, o, c, e), [e]),
      c.getSnapshot !== n || m || (_t !== null && _t.memoizedState.tag & 1))
    ) {
      if (
        ((o.flags |= 2048),
        bi(9, { destroy: void 0 }, Yh.bind(null, o, c, i, n), null),
        lt === null)
      )
        throw Error(l(349));
      d || (ba & 127) !== 0 || qh(o, n, i);
    }
    return i;
  }
  function qh(e, n, i) {
    ((e.flags |= 16384),
      (e = { getSnapshot: n, value: i }),
      (n = Me.updateQueue),
      n === null
        ? ((n = is()), (Me.updateQueue = n), (n.stores = [e]))
        : ((i = n.stores), i === null ? (n.stores = [e]) : i.push(e)));
  }
  function Yh(e, n, i, o) {
    ((n.value = i), (n.getSnapshot = o), Xh(n) && Kh(e));
  }
  function Zh(e, n, i) {
    return i(function () {
      Xh(n) && Kh(e);
    });
  }
  function Xh(e) {
    var n = e.getSnapshot;
    e = e.value;
    try {
      var i = n();
      return !sn(e, i);
    } catch {
      return !0;
    }
  }
  function Kh(e) {
    var n = Cr(e, 2);
    n !== null && nn(n, e, 2);
  }
  function Gc(e) {
    var n = Yt();
    if (typeof e == "function") {
      var i = e;
      if (((e = i()), jr)) {
        le(!0);
        try {
          i();
        } finally {
          le(!1);
        }
      }
    }
    return (
      (n.memoizedState = n.baseState = e),
      (n.queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Sa,
        lastRenderedState: e,
      }),
      n
    );
  }
  function Qh(e, n, i, o) {
    return ((e.baseState = i), $c(e, at, typeof o == "function" ? o : Sa));
  }
  function v1(e, n, i, o, c) {
    if (cs(e)) throw Error(l(485));
    if (((e = n.action), e !== null)) {
      var d = {
        payload: c,
        action: e,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function (m) {
          d.listeners.push(m);
        },
      };
      (M.T !== null ? i(!0) : (d.isTransition = !1),
        o(d),
        (i = n.pending),
        i === null
          ? ((d.next = n.pending = d), Jh(n, d))
          : ((d.next = i.next), (n.pending = i.next = d)));
    }
  }
  function Jh(e, n) {
    var i = n.action,
      o = n.payload,
      c = e.state;
    if (n.isTransition) {
      var d = M.T,
        m = {};
      M.T = m;
      try {
        var _ = i(c, o),
          R = M.S;
        (R !== null && R(m, _), Wh(e, n, _));
      } catch (I) {
        Pc(e, n, I);
      } finally {
        (d !== null && m.types !== null && (d.types = m.types), (M.T = d));
      }
    } else
      try {
        ((d = i(c, o)), Wh(e, n, d));
      } catch (I) {
        Pc(e, n, I);
      }
  }
  function Wh(e, n, i) {
    i !== null && typeof i == "object" && typeof i.then == "function"
      ? i.then(
          function (o) {
            eg(e, n, o);
          },
          function (o) {
            return Pc(e, n, o);
          },
        )
      : eg(e, n, i);
  }
  function eg(e, n, i) {
    ((n.status = "fulfilled"),
      (n.value = i),
      tg(n),
      (e.state = i),
      (n = e.pending),
      n !== null &&
        ((i = n.next),
        i === n ? (e.pending = null) : ((i = i.next), (n.next = i), Jh(e, i))));
  }
  function Pc(e, n, i) {
    var o = e.pending;
    if (((e.pending = null), o !== null)) {
      o = o.next;
      do ((n.status = "rejected"), (n.reason = i), tg(n), (n = n.next));
      while (n !== o);
    }
    e.action = null;
  }
  function tg(e) {
    e = e.listeners;
    for (var n = 0; n < e.length; n++) (0, e[n])();
  }
  function ng(e, n) {
    return n;
  }
  function ag(e, n) {
    if (Pe) {
      var i = lt.formState;
      if (i !== null) {
        e: {
          var o = Me;
          if (Pe) {
            if (ut) {
              t: {
                for (var c = ut, d = On; c.nodeType !== 8; ) {
                  if (!d) {
                    c = null;
                    break t;
                  }
                  if (((c = Cn(c.nextSibling)), c === null)) {
                    c = null;
                    break t;
                  }
                }
                ((d = c.data), (c = d === "F!" || d === "F" ? c : null));
              }
              if (c) {
                ((ut = Cn(c.nextSibling)), (o = c.data === "F!"));
                break e;
              }
            }
            Pa(o);
          }
          o = !1;
        }
        o && (n = i[0]);
      }
    }
    return (
      (i = Yt()),
      (i.memoizedState = i.baseState = n),
      (o = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: ng,
        lastRenderedState: n,
      }),
      (i.queue = o),
      (i = _g.bind(null, Me, o)),
      (o.dispatch = i),
      (o = Gc(!1)),
      (d = Qc.bind(null, Me, !1, o.queue)),
      (o = Yt()),
      (c = { state: n, dispatch: null, action: e, pending: null }),
      (o.queue = c),
      (i = v1.bind(null, Me, c, d, i)),
      (c.dispatch = i),
      (o.memoizedState = e),
      [n, i, !1]
    );
  }
  function rg(e) {
    var n = mt();
    return ig(n, at, e);
  }
  function ig(e, n, i) {
    if (
      ((n = $c(e, n, ng)[0]),
      (e = os(Sa)[0]),
      typeof n == "object" && n !== null && typeof n.then == "function")
    )
      try {
        var o = zl(n);
      } catch (m) {
        throw m === hi ? Qo : m;
      }
    else o = n;
    n = mt();
    var c = n.queue,
      d = c.dispatch;
    return (
      i !== n.memoizedState &&
        ((Me.flags |= 2048),
        bi(9, { destroy: void 0 }, b1.bind(null, c, i), null)),
      [o, d, e]
    );
  }
  function b1(e, n) {
    e.action = n;
  }
  function lg(e) {
    var n = mt(),
      i = at;
    if (i !== null) return ig(n, i, e);
    (mt(), (n = n.memoizedState), (i = mt()));
    var o = i.queue.dispatch;
    return ((i.memoizedState = e), [n, o, !1]);
  }
  function bi(e, n, i, o) {
    return (
      (e = { tag: e, create: i, deps: o, inst: n, next: null }),
      (n = Me.updateQueue),
      n === null && ((n = is()), (Me.updateQueue = n)),
      (i = n.lastEffect),
      i === null
        ? (n.lastEffect = e.next = e)
        : ((o = i.next), (i.next = e), (e.next = o), (n.lastEffect = e)),
      e
    );
  }
  function og() {
    return mt().memoizedState;
  }
  function ss(e, n, i, o) {
    var c = Yt();
    ((Me.flags |= e),
      (c.memoizedState = bi(
        1 | n,
        { destroy: void 0 },
        i,
        o === void 0 ? null : o,
      )));
  }
  function us(e, n, i, o) {
    var c = mt();
    o = o === void 0 ? null : o;
    var d = c.memoizedState.inst;
    at !== null && o !== null && zc(o, at.memoizedState.deps)
      ? (c.memoizedState = bi(n, d, i, o))
      : ((Me.flags |= e), (c.memoizedState = bi(1 | n, d, i, o)));
  }
  function sg(e, n) {
    ss(8390656, 8, e, n);
  }
  function qc(e, n) {
    us(2048, 8, e, n);
  }
  function S1(e) {
    Me.flags |= 4;
    var n = Me.updateQueue;
    if (n === null) ((n = is()), (Me.updateQueue = n), (n.events = [e]));
    else {
      var i = n.events;
      i === null ? (n.events = [e]) : i.push(e);
    }
  }
  function ug(e) {
    var n = mt().memoizedState;
    return (
      S1({ ref: n, nextImpl: e }),
      function () {
        if ((Je & 2) !== 0) throw Error(l(440));
        return n.impl.apply(void 0, arguments);
      }
    );
  }
  function cg(e, n) {
    return us(4, 2, e, n);
  }
  function fg(e, n) {
    return us(4, 4, e, n);
  }
  function dg(e, n) {
    if (typeof n == "function") {
      e = e();
      var i = n(e);
      return function () {
        typeof i == "function" ? i() : n(null);
      };
    }
    if (n != null)
      return (
        (e = e()),
        (n.current = e),
        function () {
          n.current = null;
        }
      );
  }
  function pg(e, n, i) {
    ((i = i != null ? i.concat([e]) : null), us(4, 4, dg.bind(null, n, e), i));
  }
  function Yc() {}
  function hg(e, n) {
    var i = mt();
    n = n === void 0 ? null : n;
    var o = i.memoizedState;
    return n !== null && zc(n, o[1]) ? o[0] : ((i.memoizedState = [e, n]), e);
  }
  function gg(e, n) {
    var i = mt();
    n = n === void 0 ? null : n;
    var o = i.memoizedState;
    if (n !== null && zc(n, o[1])) return o[0];
    if (((o = e()), jr)) {
      le(!0);
      try {
        e();
      } finally {
        le(!1);
      }
    }
    return ((i.memoizedState = [o, n]), o);
  }
  function Zc(e, n, i) {
    return i === void 0 || ((ba & 1073741824) !== 0 && (He & 261930) === 0)
      ? (e.memoizedState = n)
      : ((e.memoizedState = i), (e = yy()), (Me.lanes |= e), (er |= e), i);
  }
  function yg(e, n, i, o) {
    return sn(i, n)
      ? i
      : yi.current !== null
        ? ((e = Zc(e, i, o)), sn(e, n) || (wt = !0), e)
        : (ba & 42) === 0 || ((ba & 1073741824) !== 0 && (He & 261930) === 0)
          ? ((wt = !0), (e.memoizedState = i))
          : ((e = yy()), (Me.lanes |= e), (er |= e), n);
  }
  function mg(e, n, i, o, c) {
    var d = Z.p;
    Z.p = d !== 0 && 8 > d ? d : 8;
    var m = M.T,
      _ = {};
    ((M.T = _), Qc(e, !1, n, i));
    try {
      var R = c(),
        I = M.S;
      if (
        (I !== null && I(_, R),
        R !== null && typeof R == "object" && typeof R.then == "function")
      ) {
        var K = g1(R, o);
        Bl(e, n, K, hn(e));
      } else Bl(e, n, o, hn(e));
    } catch (ee) {
      Bl(e, n, { then: function () {}, status: "rejected", reason: ee }, hn());
    } finally {
      ((Z.p = d),
        m !== null && _.types !== null && (m.types = _.types),
        (M.T = m));
    }
  }
  function E1() {}
  function Xc(e, n, i, o) {
    if (e.tag !== 5) throw Error(l(476));
    var c = vg(e).queue;
    mg(
      e,
      c,
      n,
      ne,
      i === null
        ? E1
        : function () {
            return (bg(e), i(o));
          },
    );
  }
  function vg(e) {
    var n = e.memoizedState;
    if (n !== null) return n;
    n = {
      memoizedState: ne,
      baseState: ne,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Sa,
        lastRenderedState: ne,
      },
      next: null,
    };
    var i = {};
    return (
      (n.next = {
        memoizedState: i,
        baseState: i,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Sa,
          lastRenderedState: i,
        },
        next: null,
      }),
      (e.memoizedState = n),
      (e = e.alternate),
      e !== null && (e.memoizedState = n),
      n
    );
  }
  function bg(e) {
    var n = vg(e);
    (n.next === null && (n = e.alternate.memoizedState),
      Bl(e, n.next.queue, {}, hn()));
  }
  function Kc() {
    return zt(eo);
  }
  function Sg() {
    return mt().memoizedState;
  }
  function Eg() {
    return mt().memoizedState;
  }
  function _1(e) {
    for (var n = e.return; n !== null; ) {
      switch (n.tag) {
        case 24:
        case 3:
          var i = hn();
          e = Za(i);
          var o = Xa(n, e, i);
          (o !== null && (nn(o, n, i), Ll(o, n, i)),
            (n = { cache: xc() }),
            (e.payload = n));
          return;
      }
      n = n.return;
    }
  }
  function w1(e, n, i) {
    var o = hn();
    ((i = {
      lane: o,
      revertLane: 0,
      gesture: null,
      action: i,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
      cs(e)
        ? wg(n, i)
        : ((i = hc(e, n, i, o)), i !== null && (nn(i, e, o), Og(i, n, o))));
  }
  function _g(e, n, i) {
    var o = hn();
    Bl(e, n, i, o);
  }
  function Bl(e, n, i, o) {
    var c = {
      lane: o,
      revertLane: 0,
      gesture: null,
      action: i,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    };
    if (cs(e)) wg(n, c);
    else {
      var d = e.alternate;
      if (
        e.lanes === 0 &&
        (d === null || d.lanes === 0) &&
        ((d = n.lastRenderedReducer), d !== null)
      )
        try {
          var m = n.lastRenderedState,
            _ = d(m, i);
          if (((c.hasEagerState = !0), (c.eagerState = _), sn(_, m)))
            return (Go(e, n, c, 0), lt === null && Vo(), !1);
        } catch {
        } finally {
        }
      if (((i = hc(e, n, c, o)), i !== null))
        return (nn(i, e, o), Og(i, n, o), !0);
    }
    return !1;
  }
  function Qc(e, n, i, o) {
    if (
      ((o = {
        lane: 2,
        revertLane: kf(),
        gesture: null,
        action: o,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      cs(e))
    ) {
      if (n) throw Error(l(479));
    } else ((n = hc(e, i, o, 2)), n !== null && nn(n, e, 2));
  }
  function cs(e) {
    var n = e.alternate;
    return e === Me || (n !== null && n === Me);
  }
  function wg(e, n) {
    mi = as = !0;
    var i = e.pending;
    (i === null ? (n.next = n) : ((n.next = i.next), (i.next = n)),
      (e.pending = n));
  }
  function Og(e, n, i) {
    if ((i & 4194048) !== 0) {
      var o = n.lanes;
      ((o &= e.pendingLanes), (i |= o), (n.lanes = i), ko(e, i));
    }
  }
  var Ul = {
    readContext: zt,
    use: ls,
    useCallback: ht,
    useContext: ht,
    useEffect: ht,
    useImperativeHandle: ht,
    useLayoutEffect: ht,
    useInsertionEffect: ht,
    useMemo: ht,
    useReducer: ht,
    useRef: ht,
    useState: ht,
    useDebugValue: ht,
    useDeferredValue: ht,
    useTransition: ht,
    useSyncExternalStore: ht,
    useId: ht,
    useHostTransitionStatus: ht,
    useFormState: ht,
    useActionState: ht,
    useOptimistic: ht,
    useMemoCache: ht,
    useCacheRefresh: ht,
  };
  Ul.useEffectEvent = ht;
  var xg = {
      readContext: zt,
      use: ls,
      useCallback: function (e, n) {
        return ((Yt().memoizedState = [e, n === void 0 ? null : n]), e);
      },
      useContext: zt,
      useEffect: sg,
      useImperativeHandle: function (e, n, i) {
        ((i = i != null ? i.concat([e]) : null),
          ss(4194308, 4, dg.bind(null, n, e), i));
      },
      useLayoutEffect: function (e, n) {
        return ss(4194308, 4, e, n);
      },
      useInsertionEffect: function (e, n) {
        ss(4, 2, e, n);
      },
      useMemo: function (e, n) {
        var i = Yt();
        n = n === void 0 ? null : n;
        var o = e();
        if (jr) {
          le(!0);
          try {
            e();
          } finally {
            le(!1);
          }
        }
        return ((i.memoizedState = [o, n]), o);
      },
      useReducer: function (e, n, i) {
        var o = Yt();
        if (i !== void 0) {
          var c = i(n);
          if (jr) {
            le(!0);
            try {
              i(n);
            } finally {
              le(!1);
            }
          }
        } else c = n;
        return (
          (o.memoizedState = o.baseState = c),
          (e = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: e,
            lastRenderedState: c,
          }),
          (o.queue = e),
          (e = e.dispatch = w1.bind(null, Me, e)),
          [o.memoizedState, e]
        );
      },
      useRef: function (e) {
        var n = Yt();
        return ((e = { current: e }), (n.memoizedState = e));
      },
      useState: function (e) {
        e = Gc(e);
        var n = e.queue,
          i = _g.bind(null, Me, n);
        return ((n.dispatch = i), [e.memoizedState, i]);
      },
      useDebugValue: Yc,
      useDeferredValue: function (e, n) {
        var i = Yt();
        return Zc(i, e, n);
      },
      useTransition: function () {
        var e = Gc(!1);
        return (
          (e = mg.bind(null, Me, e.queue, !0, !1)),
          (Yt().memoizedState = e),
          [!1, e]
        );
      },
      useSyncExternalStore: function (e, n, i) {
        var o = Me,
          c = Yt();
        if (Pe) {
          if (i === void 0) throw Error(l(407));
          i = i();
        } else {
          if (((i = n()), lt === null)) throw Error(l(349));
          (He & 127) !== 0 || qh(o, n, i);
        }
        c.memoizedState = i;
        var d = { value: i, getSnapshot: n };
        return (
          (c.queue = d),
          sg(Zh.bind(null, o, d, e), [e]),
          (o.flags |= 2048),
          bi(9, { destroy: void 0 }, Yh.bind(null, o, d, i, n), null),
          i
        );
      },
      useId: function () {
        var e = Yt(),
          n = lt.identifierPrefix;
        if (Pe) {
          var i = ta,
            o = ea;
          ((i = (o & ~(1 << (32 - be(o) - 1))).toString(32) + i),
            (n = "_" + n + "R_" + i),
            (i = rs++),
            0 < i && (n += "H" + i.toString(32)),
            (n += "_"));
        } else ((i = y1++), (n = "_" + n + "r_" + i.toString(32) + "_"));
        return (e.memoizedState = n);
      },
      useHostTransitionStatus: Kc,
      useFormState: ag,
      useActionState: ag,
      useOptimistic: function (e) {
        var n = Yt();
        n.memoizedState = n.baseState = e;
        var i = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: null,
          lastRenderedState: null,
        };
        return (
          (n.queue = i),
          (n = Qc.bind(null, Me, !0, i)),
          (i.dispatch = n),
          [e, n]
        );
      },
      useMemoCache: Hc,
      useCacheRefresh: function () {
        return (Yt().memoizedState = _1.bind(null, Me));
      },
      useEffectEvent: function (e) {
        var n = Yt(),
          i = { impl: e };
        return (
          (n.memoizedState = i),
          function () {
            if ((Je & 2) !== 0) throw Error(l(440));
            return i.impl.apply(void 0, arguments);
          }
        );
      },
    },
    Jc = {
      readContext: zt,
      use: ls,
      useCallback: hg,
      useContext: zt,
      useEffect: qc,
      useImperativeHandle: pg,
      useInsertionEffect: cg,
      useLayoutEffect: fg,
      useMemo: gg,
      useReducer: os,
      useRef: og,
      useState: function () {
        return os(Sa);
      },
      useDebugValue: Yc,
      useDeferredValue: function (e, n) {
        var i = mt();
        return yg(i, at.memoizedState, e, n);
      },
      useTransition: function () {
        var e = os(Sa)[0],
          n = mt().memoizedState;
        return [typeof e == "boolean" ? e : zl(e), n];
      },
      useSyncExternalStore: Ph,
      useId: Sg,
      useHostTransitionStatus: Kc,
      useFormState: rg,
      useActionState: rg,
      useOptimistic: function (e, n) {
        var i = mt();
        return Qh(i, at, e, n);
      },
      useMemoCache: Hc,
      useCacheRefresh: Eg,
    };
  Jc.useEffectEvent = ug;
  var Cg = {
    readContext: zt,
    use: ls,
    useCallback: hg,
    useContext: zt,
    useEffect: qc,
    useImperativeHandle: pg,
    useInsertionEffect: cg,
    useLayoutEffect: fg,
    useMemo: gg,
    useReducer: Vc,
    useRef: og,
    useState: function () {
      return Vc(Sa);
    },
    useDebugValue: Yc,
    useDeferredValue: function (e, n) {
      var i = mt();
      return at === null ? Zc(i, e, n) : yg(i, at.memoizedState, e, n);
    },
    useTransition: function () {
      var e = Vc(Sa)[0],
        n = mt().memoizedState;
      return [typeof e == "boolean" ? e : zl(e), n];
    },
    useSyncExternalStore: Ph,
    useId: Sg,
    useHostTransitionStatus: Kc,
    useFormState: lg,
    useActionState: lg,
    useOptimistic: function (e, n) {
      var i = mt();
      return at !== null
        ? Qh(i, at, e, n)
        : ((i.baseState = e), [e, i.queue.dispatch]);
    },
    useMemoCache: Hc,
    useCacheRefresh: Eg,
  };
  Cg.useEffectEvent = ug;
  function Wc(e, n, i, o) {
    ((n = e.memoizedState),
      (i = i(o, n)),
      (i = i == null ? n : v({}, n, i)),
      (e.memoizedState = i),
      e.lanes === 0 && (e.updateQueue.baseState = i));
  }
  var ef = {
    enqueueSetState: function (e, n, i) {
      e = e._reactInternals;
      var o = hn(),
        c = Za(o);
      ((c.payload = n),
        i != null && (c.callback = i),
        (n = Xa(e, c, o)),
        n !== null && (nn(n, e, o), Ll(n, e, o)));
    },
    enqueueReplaceState: function (e, n, i) {
      e = e._reactInternals;
      var o = hn(),
        c = Za(o);
      ((c.tag = 1),
        (c.payload = n),
        i != null && (c.callback = i),
        (n = Xa(e, c, o)),
        n !== null && (nn(n, e, o), Ll(n, e, o)));
    },
    enqueueForceUpdate: function (e, n) {
      e = e._reactInternals;
      var i = hn(),
        o = Za(i);
      ((o.tag = 2),
        n != null && (o.callback = n),
        (n = Xa(e, o, i)),
        n !== null && (nn(n, e, i), Ll(n, e, i)));
    },
  };
  function Tg(e, n, i, o, c, d, m) {
    return (
      (e = e.stateNode),
      typeof e.shouldComponentUpdate == "function"
        ? e.shouldComponentUpdate(o, d, m)
        : n.prototype && n.prototype.isPureReactComponent
          ? !Ol(i, o) || !Ol(c, d)
          : !0
    );
  }
  function Ag(e, n, i, o) {
    ((e = n.state),
      typeof n.componentWillReceiveProps == "function" &&
        n.componentWillReceiveProps(i, o),
      typeof n.UNSAFE_componentWillReceiveProps == "function" &&
        n.UNSAFE_componentWillReceiveProps(i, o),
      n.state !== e && ef.enqueueReplaceState(n, n.state, null));
  }
  function zr(e, n) {
    var i = n;
    if ("ref" in n) {
      i = {};
      for (var o in n) o !== "ref" && (i[o] = n[o]);
    }
    if ((e = e.defaultProps)) {
      i === n && (i = v({}, i));
      for (var c in e) i[c] === void 0 && (i[c] = e[c]);
    }
    return i;
  }
  function Rg(e) {
    $o(e);
  }
  function kg(e) {
    console.error(e);
  }
  function Dg(e) {
    $o(e);
  }
  function fs(e, n) {
    try {
      var i = e.onUncaughtError;
      i(n.value, { componentStack: n.stack });
    } catch (o) {
      setTimeout(function () {
        throw o;
      });
    }
  }
  function Lg(e, n, i) {
    try {
      var o = e.onCaughtError;
      o(i.value, {
        componentStack: i.stack,
        errorBoundary: n.tag === 1 ? n.stateNode : null,
      });
    } catch (c) {
      setTimeout(function () {
        throw c;
      });
    }
  }
  function tf(e, n, i) {
    return (
      (i = Za(i)),
      (i.tag = 3),
      (i.payload = { element: null }),
      (i.callback = function () {
        fs(e, n);
      }),
      i
    );
  }
  function Ng(e) {
    return ((e = Za(e)), (e.tag = 3), e);
  }
  function Mg(e, n, i, o) {
    var c = i.type.getDerivedStateFromError;
    if (typeof c == "function") {
      var d = o.value;
      ((e.payload = function () {
        return c(d);
      }),
        (e.callback = function () {
          Lg(n, i, o);
        }));
    }
    var m = i.stateNode;
    m !== null &&
      typeof m.componentDidCatch == "function" &&
      (e.callback = function () {
        (Lg(n, i, o),
          typeof c != "function" &&
            (tr === null ? (tr = new Set([this])) : tr.add(this)));
        var _ = o.stack;
        this.componentDidCatch(o.value, {
          componentStack: _ !== null ? _ : "",
        });
      });
  }
  function O1(e, n, i, o, c) {
    if (
      ((i.flags |= 32768),
      o !== null && typeof o == "object" && typeof o.then == "function")
    ) {
      if (
        ((n = i.alternate),
        n !== null && fi(n, i, c, !0),
        (i = cn.current),
        i !== null)
      ) {
        switch (i.tag) {
          case 31:
          case 13:
            return (
              xn === null ? ws() : i.alternate === null && gt === 0 && (gt = 3),
              (i.flags &= -257),
              (i.flags |= 65536),
              (i.lanes = c),
              o === Jo
                ? (i.flags |= 16384)
                : ((n = i.updateQueue),
                  n === null ? (i.updateQueue = new Set([o])) : n.add(o),
                  Tf(e, o, c)),
              !1
            );
          case 22:
            return (
              (i.flags |= 65536),
              o === Jo
                ? (i.flags |= 16384)
                : ((n = i.updateQueue),
                  n === null
                    ? ((n = {
                        transitions: null,
                        markerInstances: null,
                        retryQueue: new Set([o]),
                      }),
                      (i.updateQueue = n))
                    : ((i = n.retryQueue),
                      i === null ? (n.retryQueue = new Set([o])) : i.add(o)),
                  Tf(e, o, c)),
              !1
            );
        }
        throw Error(l(435, i.tag));
      }
      return (Tf(e, o, c), ws(), !1);
    }
    if (Pe)
      return (
        (n = cn.current),
        n !== null
          ? ((n.flags & 65536) === 0 && (n.flags |= 256),
            (n.flags |= 65536),
            (n.lanes = c),
            o !== Sc && ((e = Error(l(422), { cause: o })), Tl(En(e, i))))
          : (o !== Sc && ((n = Error(l(423), { cause: o })), Tl(En(n, i))),
            (e = e.current.alternate),
            (e.flags |= 65536),
            (c &= -c),
            (e.lanes |= c),
            (o = En(o, i)),
            (c = tf(e.stateNode, o, c)),
            Dc(e, c),
            gt !== 4 && (gt = 2)),
        !1
      );
    var d = Error(l(520), { cause: o });
    if (
      ((d = En(d, i)),
      ql === null ? (ql = [d]) : ql.push(d),
      gt !== 4 && (gt = 2),
      n === null)
    )
      return !0;
    ((o = En(o, i)), (i = n));
    do {
      switch (i.tag) {
        case 3:
          return (
            (i.flags |= 65536),
            (e = c & -c),
            (i.lanes |= e),
            (e = tf(i.stateNode, o, e)),
            Dc(i, e),
            !1
          );
        case 1:
          if (
            ((n = i.type),
            (d = i.stateNode),
            (i.flags & 128) === 0 &&
              (typeof n.getDerivedStateFromError == "function" ||
                (d !== null &&
                  typeof d.componentDidCatch == "function" &&
                  (tr === null || !tr.has(d)))))
          )
            return (
              (i.flags |= 65536),
              (c &= -c),
              (i.lanes |= c),
              (c = Ng(c)),
              Mg(c, e, i, o),
              Dc(i, c),
              !1
            );
      }
      i = i.return;
    } while (i !== null);
    return !1;
  }
  var nf = Error(l(461)),
    wt = !1;
  function Bt(e, n, i, o) {
    n.child = e === null ? Uh(n, null, i, o) : Mr(n, e.child, i, o);
  }
  function jg(e, n, i, o, c) {
    i = i.render;
    var d = n.ref;
    if ("ref" in o) {
      var m = {};
      for (var _ in o) _ !== "ref" && (m[_] = o[_]);
    } else m = o;
    return (
      kr(n),
      (o = Bc(e, n, i, m, d, c)),
      (_ = Uc()),
      e !== null && !wt
        ? (Fc(e, n, c), Ea(e, n, c))
        : (Pe && _ && vc(n), (n.flags |= 1), Bt(e, n, o, c), n.child)
    );
  }
  function zg(e, n, i, o, c) {
    if (e === null) {
      var d = i.type;
      return typeof d == "function" &&
        !gc(d) &&
        d.defaultProps === void 0 &&
        i.compare === null
        ? ((n.tag = 15), (n.type = d), Bg(e, n, d, o, c))
        : ((e = qo(i.type, null, o, n, n.mode, c)),
          (e.ref = n.ref),
          (e.return = n),
          (n.child = e));
    }
    if (((d = e.child), !ff(e, c))) {
      var m = d.memoizedProps;
      if (
        ((i = i.compare), (i = i !== null ? i : Ol), i(m, o) && e.ref === n.ref)
      )
        return Ea(e, n, c);
    }
    return (
      (n.flags |= 1),
      (e = ga(d, o)),
      (e.ref = n.ref),
      (e.return = n),
      (n.child = e)
    );
  }
  function Bg(e, n, i, o, c) {
    if (e !== null) {
      var d = e.memoizedProps;
      if (Ol(d, o) && e.ref === n.ref)
        if (((wt = !1), (n.pendingProps = o = d), ff(e, c)))
          (e.flags & 131072) !== 0 && (wt = !0);
        else return ((n.lanes = e.lanes), Ea(e, n, c));
    }
    return af(e, n, i, o, c);
  }
  function Ug(e, n, i, o) {
    var c = o.children,
      d = e !== null ? e.memoizedState : null;
    if (
      (e === null &&
        n.stateNode === null &&
        (n.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null,
        }),
      o.mode === "hidden")
    ) {
      if ((n.flags & 128) !== 0) {
        if (((d = d !== null ? d.baseLanes | i : i), e !== null)) {
          for (o = n.child = e.child, c = 0; o !== null; )
            ((c = c | o.lanes | o.childLanes), (o = o.sibling));
          o = c & ~d;
        } else ((o = 0), (n.child = null));
        return Fg(e, n, d, i, o);
      }
      if ((i & 536870912) !== 0)
        ((n.memoizedState = { baseLanes: 0, cachePool: null }),
          e !== null && Ko(n, d !== null ? d.cachePool : null),
          d !== null ? Hh(n, d) : Nc(),
          $h(n));
      else
        return (
          (o = n.lanes = 536870912),
          Fg(e, n, d !== null ? d.baseLanes | i : i, i, o)
        );
    } else
      d !== null
        ? (Ko(n, d.cachePool), Hh(n, d), Qa(), (n.memoizedState = null))
        : (e !== null && Ko(n, null), Nc(), Qa());
    return (Bt(e, n, c, i), n.child);
  }
  function Fl(e, n) {
    return (
      (e !== null && e.tag === 22) ||
        n.stateNode !== null ||
        (n.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null,
        }),
      n.sibling
    );
  }
  function Fg(e, n, i, o, c) {
    var d = Tc();
    return (
      (d = d === null ? null : { parent: Et._currentValue, pool: d }),
      (n.memoizedState = { baseLanes: i, cachePool: d }),
      e !== null && Ko(n, null),
      Nc(),
      $h(n),
      e !== null && fi(e, n, o, !0),
      (n.childLanes = c),
      null
    );
  }
  function ds(e, n) {
    return (
      (n = hs({ mode: n.mode, children: n.children }, e.mode)),
      (n.ref = e.ref),
      (e.child = n),
      (n.return = e),
      n
    );
  }
  function Ig(e, n, i) {
    return (
      Mr(n, e.child, null, i),
      (e = ds(n, n.pendingProps)),
      (e.flags |= 2),
      fn(n),
      (n.memoizedState = null),
      e
    );
  }
  function x1(e, n, i) {
    var o = n.pendingProps,
      c = (n.flags & 128) !== 0;
    if (((n.flags &= -129), e === null)) {
      if (Pe) {
        if (o.mode === "hidden")
          return ((e = ds(n, o)), (n.lanes = 536870912), Fl(null, e));
        if (
          (jc(n),
          (e = ut)
            ? ((e = Jy(e, On)),
              (e = e !== null && e.data === "&" ? e : null),
              e !== null &&
                ((n.memoizedState = {
                  dehydrated: e,
                  treeContext: Va !== null ? { id: ea, overflow: ta } : null,
                  retryLane: 536870912,
                  hydrationErrors: null,
                }),
                (i = wh(e)),
                (i.return = n),
                (n.child = i),
                (jt = n),
                (ut = null)))
            : (e = null),
          e === null)
        )
          throw Pa(n);
        return ((n.lanes = 536870912), null);
      }
      return ds(n, o);
    }
    var d = e.memoizedState;
    if (d !== null) {
      var m = d.dehydrated;
      if ((jc(n), c))
        if (n.flags & 256) ((n.flags &= -257), (n = Ig(e, n, i)));
        else if (n.memoizedState !== null)
          ((n.child = e.child), (n.flags |= 128), (n = null));
        else throw Error(l(558));
      else if (
        (wt || fi(e, n, i, !1), (c = (i & e.childLanes) !== 0), wt || c)
      ) {
        if (
          ((o = lt),
          o !== null && ((m = Do(o, i)), m !== 0 && m !== d.retryLane))
        )
          throw ((d.retryLane = m), Cr(e, m), nn(o, e, m), nf);
        (ws(), (n = Ig(e, n, i)));
      } else
        ((e = d.treeContext),
          (ut = Cn(m.nextSibling)),
          (jt = n),
          (Pe = !0),
          (Ga = null),
          (On = !1),
          e !== null && Ch(n, e),
          (n = ds(n, o)),
          (n.flags |= 4096));
      return n;
    }
    return (
      (e = ga(e.child, { mode: o.mode, children: o.children })),
      (e.ref = n.ref),
      (n.child = e),
      (e.return = n),
      e
    );
  }
  function ps(e, n) {
    var i = n.ref;
    if (i === null) e !== null && e.ref !== null && (n.flags |= 4194816);
    else {
      if (typeof i != "function" && typeof i != "object") throw Error(l(284));
      (e === null || e.ref !== i) && (n.flags |= 4194816);
    }
  }
  function af(e, n, i, o, c) {
    return (
      kr(n),
      (i = Bc(e, n, i, o, void 0, c)),
      (o = Uc()),
      e !== null && !wt
        ? (Fc(e, n, c), Ea(e, n, c))
        : (Pe && o && vc(n), (n.flags |= 1), Bt(e, n, i, c), n.child)
    );
  }
  function Hg(e, n, i, o, c, d) {
    return (
      kr(n),
      (n.updateQueue = null),
      (i = Gh(n, o, i, c)),
      Vh(e),
      (o = Uc()),
      e !== null && !wt
        ? (Fc(e, n, d), Ea(e, n, d))
        : (Pe && o && vc(n), (n.flags |= 1), Bt(e, n, i, d), n.child)
    );
  }
  function $g(e, n, i, o, c) {
    if ((kr(n), n.stateNode === null)) {
      var d = oi,
        m = i.contextType;
      (typeof m == "object" && m !== null && (d = zt(m)),
        (d = new i(o, d)),
        (n.memoizedState =
          d.state !== null && d.state !== void 0 ? d.state : null),
        (d.updater = ef),
        (n.stateNode = d),
        (d._reactInternals = n),
        (d = n.stateNode),
        (d.props = o),
        (d.state = n.memoizedState),
        (d.refs = {}),
        Rc(n),
        (m = i.contextType),
        (d.context = typeof m == "object" && m !== null ? zt(m) : oi),
        (d.state = n.memoizedState),
        (m = i.getDerivedStateFromProps),
        typeof m == "function" && (Wc(n, i, m, o), (d.state = n.memoizedState)),
        typeof i.getDerivedStateFromProps == "function" ||
          typeof d.getSnapshotBeforeUpdate == "function" ||
          (typeof d.UNSAFE_componentWillMount != "function" &&
            typeof d.componentWillMount != "function") ||
          ((m = d.state),
          typeof d.componentWillMount == "function" && d.componentWillMount(),
          typeof d.UNSAFE_componentWillMount == "function" &&
            d.UNSAFE_componentWillMount(),
          m !== d.state && ef.enqueueReplaceState(d, d.state, null),
          Ml(n, o, d, c),
          Nl(),
          (d.state = n.memoizedState)),
        typeof d.componentDidMount == "function" && (n.flags |= 4194308),
        (o = !0));
    } else if (e === null) {
      d = n.stateNode;
      var _ = n.memoizedProps,
        R = zr(i, _);
      d.props = R;
      var I = d.context,
        K = i.contextType;
      ((m = oi), typeof K == "object" && K !== null && (m = zt(K)));
      var ee = i.getDerivedStateFromProps;
      ((K =
        typeof ee == "function" ||
        typeof d.getSnapshotBeforeUpdate == "function"),
        (_ = n.pendingProps !== _),
        K ||
          (typeof d.UNSAFE_componentWillReceiveProps != "function" &&
            typeof d.componentWillReceiveProps != "function") ||
          ((_ || I !== m) && Ag(n, d, o, m)),
        (Ya = !1));
      var $ = n.memoizedState;
      ((d.state = $),
        Ml(n, o, d, c),
        Nl(),
        (I = n.memoizedState),
        _ || $ !== I || Ya
          ? (typeof ee == "function" &&
              (Wc(n, i, ee, o), (I = n.memoizedState)),
            (R = Ya || Tg(n, i, R, o, $, I, m))
              ? (K ||
                  (typeof d.UNSAFE_componentWillMount != "function" &&
                    typeof d.componentWillMount != "function") ||
                  (typeof d.componentWillMount == "function" &&
                    d.componentWillMount(),
                  typeof d.UNSAFE_componentWillMount == "function" &&
                    d.UNSAFE_componentWillMount()),
                typeof d.componentDidMount == "function" &&
                  (n.flags |= 4194308))
              : (typeof d.componentDidMount == "function" &&
                  (n.flags |= 4194308),
                (n.memoizedProps = o),
                (n.memoizedState = I)),
            (d.props = o),
            (d.state = I),
            (d.context = m),
            (o = R))
          : (typeof d.componentDidMount == "function" && (n.flags |= 4194308),
            (o = !1)));
    } else {
      ((d = n.stateNode),
        kc(e, n),
        (m = n.memoizedProps),
        (K = zr(i, m)),
        (d.props = K),
        (ee = n.pendingProps),
        ($ = d.context),
        (I = i.contextType),
        (R = oi),
        typeof I == "object" && I !== null && (R = zt(I)),
        (_ = i.getDerivedStateFromProps),
        (I =
          typeof _ == "function" ||
          typeof d.getSnapshotBeforeUpdate == "function") ||
          (typeof d.UNSAFE_componentWillReceiveProps != "function" &&
            typeof d.componentWillReceiveProps != "function") ||
          ((m !== ee || $ !== R) && Ag(n, d, o, R)),
        (Ya = !1),
        ($ = n.memoizedState),
        (d.state = $),
        Ml(n, o, d, c),
        Nl());
      var P = n.memoizedState;
      m !== ee ||
      $ !== P ||
      Ya ||
      (e !== null && e.dependencies !== null && Zo(e.dependencies))
        ? (typeof _ == "function" && (Wc(n, i, _, o), (P = n.memoizedState)),
          (K =
            Ya ||
            Tg(n, i, K, o, $, P, R) ||
            (e !== null && e.dependencies !== null && Zo(e.dependencies)))
            ? (I ||
                (typeof d.UNSAFE_componentWillUpdate != "function" &&
                  typeof d.componentWillUpdate != "function") ||
                (typeof d.componentWillUpdate == "function" &&
                  d.componentWillUpdate(o, P, R),
                typeof d.UNSAFE_componentWillUpdate == "function" &&
                  d.UNSAFE_componentWillUpdate(o, P, R)),
              typeof d.componentDidUpdate == "function" && (n.flags |= 4),
              typeof d.getSnapshotBeforeUpdate == "function" &&
                (n.flags |= 1024))
            : (typeof d.componentDidUpdate != "function" ||
                (m === e.memoizedProps && $ === e.memoizedState) ||
                (n.flags |= 4),
              typeof d.getSnapshotBeforeUpdate != "function" ||
                (m === e.memoizedProps && $ === e.memoizedState) ||
                (n.flags |= 1024),
              (n.memoizedProps = o),
              (n.memoizedState = P)),
          (d.props = o),
          (d.state = P),
          (d.context = R),
          (o = K))
        : (typeof d.componentDidUpdate != "function" ||
            (m === e.memoizedProps && $ === e.memoizedState) ||
            (n.flags |= 4),
          typeof d.getSnapshotBeforeUpdate != "function" ||
            (m === e.memoizedProps && $ === e.memoizedState) ||
            (n.flags |= 1024),
          (o = !1));
    }
    return (
      (d = o),
      ps(e, n),
      (o = (n.flags & 128) !== 0),
      d || o
        ? ((d = n.stateNode),
          (i =
            o && typeof i.getDerivedStateFromError != "function"
              ? null
              : d.render()),
          (n.flags |= 1),
          e !== null && o
            ? ((n.child = Mr(n, e.child, null, c)),
              (n.child = Mr(n, null, i, c)))
            : Bt(e, n, i, c),
          (n.memoizedState = d.state),
          (e = n.child))
        : (e = Ea(e, n, c)),
      e
    );
  }
  function Vg(e, n, i, o) {
    return (Ar(), (n.flags |= 256), Bt(e, n, i, o), n.child);
  }
  var rf = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null,
  };
  function lf(e) {
    return { baseLanes: e, cachePool: Lh() };
  }
  function of(e, n, i) {
    return ((e = e !== null ? e.childLanes & ~i : 0), n && (e |= pn), e);
  }
  function Gg(e, n, i) {
    var o = n.pendingProps,
      c = !1,
      d = (n.flags & 128) !== 0,
      m;
    if (
      ((m = d) ||
        (m =
          e !== null && e.memoizedState === null ? !1 : (yt.current & 2) !== 0),
      m && ((c = !0), (n.flags &= -129)),
      (m = (n.flags & 32) !== 0),
      (n.flags &= -33),
      e === null)
    ) {
      if (Pe) {
        if (
          (c ? Ka(n) : Qa(),
          (e = ut)
            ? ((e = Jy(e, On)),
              (e = e !== null && e.data !== "&" ? e : null),
              e !== null &&
                ((n.memoizedState = {
                  dehydrated: e,
                  treeContext: Va !== null ? { id: ea, overflow: ta } : null,
                  retryLane: 536870912,
                  hydrationErrors: null,
                }),
                (i = wh(e)),
                (i.return = n),
                (n.child = i),
                (jt = n),
                (ut = null)))
            : (e = null),
          e === null)
        )
          throw Pa(n);
        return (Vf(e) ? (n.lanes = 32) : (n.lanes = 536870912), null);
      }
      var _ = o.children;
      return (
        (o = o.fallback),
        c
          ? (Qa(),
            (c = n.mode),
            (_ = hs({ mode: "hidden", children: _ }, c)),
            (o = Tr(o, c, i, null)),
            (_.return = n),
            (o.return = n),
            (_.sibling = o),
            (n.child = _),
            (o = n.child),
            (o.memoizedState = lf(i)),
            (o.childLanes = of(e, m, i)),
            (n.memoizedState = rf),
            Fl(null, o))
          : (Ka(n), sf(n, _))
      );
    }
    var R = e.memoizedState;
    if (R !== null && ((_ = R.dehydrated), _ !== null)) {
      if (d)
        n.flags & 256
          ? (Ka(n), (n.flags &= -257), (n = uf(e, n, i)))
          : n.memoizedState !== null
            ? (Qa(), (n.child = e.child), (n.flags |= 128), (n = null))
            : (Qa(),
              (_ = o.fallback),
              (c = n.mode),
              (o = hs({ mode: "visible", children: o.children }, c)),
              (_ = Tr(_, c, i, null)),
              (_.flags |= 2),
              (o.return = n),
              (_.return = n),
              (o.sibling = _),
              (n.child = o),
              Mr(n, e.child, null, i),
              (o = n.child),
              (o.memoizedState = lf(i)),
              (o.childLanes = of(e, m, i)),
              (n.memoizedState = rf),
              (n = Fl(null, o)));
      else if ((Ka(n), Vf(_))) {
        if (((m = _.nextSibling && _.nextSibling.dataset), m)) var I = m.dgst;
        ((m = I),
          (o = Error(l(419))),
          (o.stack = ""),
          (o.digest = m),
          Tl({ value: o, source: null, stack: null }),
          (n = uf(e, n, i)));
      } else if (
        (wt || fi(e, n, i, !1), (m = (i & e.childLanes) !== 0), wt || m)
      ) {
        if (
          ((m = lt),
          m !== null && ((o = Do(m, i)), o !== 0 && o !== R.retryLane))
        )
          throw ((R.retryLane = o), Cr(e, o), nn(m, e, o), nf);
        ($f(_) || ws(), (n = uf(e, n, i)));
      } else
        $f(_)
          ? ((n.flags |= 192), (n.child = e.child), (n = null))
          : ((e = R.treeContext),
            (ut = Cn(_.nextSibling)),
            (jt = n),
            (Pe = !0),
            (Ga = null),
            (On = !1),
            e !== null && Ch(n, e),
            (n = sf(n, o.children)),
            (n.flags |= 4096));
      return n;
    }
    return c
      ? (Qa(),
        (_ = o.fallback),
        (c = n.mode),
        (R = e.child),
        (I = R.sibling),
        (o = ga(R, { mode: "hidden", children: o.children })),
        (o.subtreeFlags = R.subtreeFlags & 65011712),
        I !== null ? (_ = ga(I, _)) : ((_ = Tr(_, c, i, null)), (_.flags |= 2)),
        (_.return = n),
        (o.return = n),
        (o.sibling = _),
        (n.child = o),
        Fl(null, o),
        (o = n.child),
        (_ = e.child.memoizedState),
        _ === null
          ? (_ = lf(i))
          : ((c = _.cachePool),
            c !== null
              ? ((R = Et._currentValue),
                (c = c.parent !== R ? { parent: R, pool: R } : c))
              : (c = Lh()),
            (_ = { baseLanes: _.baseLanes | i, cachePool: c })),
        (o.memoizedState = _),
        (o.childLanes = of(e, m, i)),
        (n.memoizedState = rf),
        Fl(e.child, o))
      : (Ka(n),
        (i = e.child),
        (e = i.sibling),
        (i = ga(i, { mode: "visible", children: o.children })),
        (i.return = n),
        (i.sibling = null),
        e !== null &&
          ((m = n.deletions),
          m === null ? ((n.deletions = [e]), (n.flags |= 16)) : m.push(e)),
        (n.child = i),
        (n.memoizedState = null),
        i);
  }
  function sf(e, n) {
    return (
      (n = hs({ mode: "visible", children: n }, e.mode)),
      (n.return = e),
      (e.child = n)
    );
  }
  function hs(e, n) {
    return ((e = un(22, e, null, n)), (e.lanes = 0), e);
  }
  function uf(e, n, i) {
    return (
      Mr(n, e.child, null, i),
      (e = sf(n, n.pendingProps.children)),
      (e.flags |= 2),
      (n.memoizedState = null),
      e
    );
  }
  function Pg(e, n, i) {
    e.lanes |= n;
    var o = e.alternate;
    (o !== null && (o.lanes |= n), wc(e.return, n, i));
  }
  function cf(e, n, i, o, c, d) {
    var m = e.memoizedState;
    m === null
      ? (e.memoizedState = {
          isBackwards: n,
          rendering: null,
          renderingStartTime: 0,
          last: o,
          tail: i,
          tailMode: c,
          treeForkCount: d,
        })
      : ((m.isBackwards = n),
        (m.rendering = null),
        (m.renderingStartTime = 0),
        (m.last = o),
        (m.tail = i),
        (m.tailMode = c),
        (m.treeForkCount = d));
  }
  function qg(e, n, i) {
    var o = n.pendingProps,
      c = o.revealOrder,
      d = o.tail;
    o = o.children;
    var m = yt.current,
      _ = (m & 2) !== 0;
    if (
      (_ ? ((m = (m & 1) | 2), (n.flags |= 128)) : (m &= 1),
      B(yt, m),
      Bt(e, n, o, i),
      (o = Pe ? Cl : 0),
      !_ && e !== null && (e.flags & 128) !== 0)
    )
      e: for (e = n.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && Pg(e, i, n);
        else if (e.tag === 19) Pg(e, i, n);
        else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === n) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === n) break e;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    switch (c) {
      case "forwards":
        for (i = n.child, c = null; i !== null; )
          ((e = i.alternate),
            e !== null && ns(e) === null && (c = i),
            (i = i.sibling));
        ((i = c),
          i === null
            ? ((c = n.child), (n.child = null))
            : ((c = i.sibling), (i.sibling = null)),
          cf(n, !1, c, i, d, o));
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (i = null, c = n.child, n.child = null; c !== null; ) {
          if (((e = c.alternate), e !== null && ns(e) === null)) {
            n.child = c;
            break;
          }
          ((e = c.sibling), (c.sibling = i), (i = c), (c = e));
        }
        cf(n, !0, i, null, d, o);
        break;
      case "together":
        cf(n, !1, null, null, void 0, o);
        break;
      default:
        n.memoizedState = null;
    }
    return n.child;
  }
  function Ea(e, n, i) {
    if (
      (e !== null && (n.dependencies = e.dependencies),
      (er |= n.lanes),
      (i & n.childLanes) === 0)
    )
      if (e !== null) {
        if ((fi(e, n, i, !1), (i & n.childLanes) === 0)) return null;
      } else return null;
    if (e !== null && n.child !== e.child) throw Error(l(153));
    if (n.child !== null) {
      for (
        e = n.child, i = ga(e, e.pendingProps), n.child = i, i.return = n;
        e.sibling !== null;
      )
        ((e = e.sibling),
          (i = i.sibling = ga(e, e.pendingProps)),
          (i.return = n));
      i.sibling = null;
    }
    return n.child;
  }
  function ff(e, n) {
    return (e.lanes & n) !== 0
      ? !0
      : ((e = e.dependencies), !!(e !== null && Zo(e)));
  }
  function C1(e, n, i) {
    switch (n.tag) {
      case 3:
        (We(n, n.stateNode.containerInfo),
          qa(n, Et, e.memoizedState.cache),
          Ar());
        break;
      case 27:
      case 5:
        rn(n);
        break;
      case 4:
        We(n, n.stateNode.containerInfo);
        break;
      case 10:
        qa(n, n.type, n.memoizedProps.value);
        break;
      case 31:
        if (n.memoizedState !== null) return ((n.flags |= 128), jc(n), null);
        break;
      case 13:
        var o = n.memoizedState;
        if (o !== null)
          return o.dehydrated !== null
            ? (Ka(n), (n.flags |= 128), null)
            : (i & n.child.childLanes) !== 0
              ? Gg(e, n, i)
              : (Ka(n), (e = Ea(e, n, i)), e !== null ? e.sibling : null);
        Ka(n);
        break;
      case 19:
        var c = (e.flags & 128) !== 0;
        if (
          ((o = (i & n.childLanes) !== 0),
          o || (fi(e, n, i, !1), (o = (i & n.childLanes) !== 0)),
          c)
        ) {
          if (o) return qg(e, n, i);
          n.flags |= 128;
        }
        if (
          ((c = n.memoizedState),
          c !== null &&
            ((c.rendering = null), (c.tail = null), (c.lastEffect = null)),
          B(yt, yt.current),
          o)
        )
          break;
        return null;
      case 22:
        return ((n.lanes = 0), Ug(e, n, i, n.pendingProps));
      case 24:
        qa(n, Et, e.memoizedState.cache);
    }
    return Ea(e, n, i);
  }
  function Yg(e, n, i) {
    if (e !== null)
      if (e.memoizedProps !== n.pendingProps) wt = !0;
      else {
        if (!ff(e, i) && (n.flags & 128) === 0) return ((wt = !1), C1(e, n, i));
        wt = (e.flags & 131072) !== 0;
      }
    else ((wt = !1), Pe && (n.flags & 1048576) !== 0 && xh(n, Cl, n.index));
    switch (((n.lanes = 0), n.tag)) {
      case 16:
        e: {
          var o = n.pendingProps;
          if (((e = Lr(n.elementType)), (n.type = e), typeof e == "function"))
            gc(e)
              ? ((o = zr(e, o)), (n.tag = 1), (n = $g(null, n, e, o, i)))
              : ((n.tag = 0), (n = af(null, n, e, o, i)));
          else {
            if (e != null) {
              var c = e.$$typeof;
              if (c === Q) {
                ((n.tag = 11), (n = jg(null, n, e, o, i)));
                break e;
              } else if (c === q) {
                ((n.tag = 14), (n = zg(null, n, e, o, i)));
                break e;
              }
            }
            throw ((n = ue(e) || e), Error(l(306, n, "")));
          }
        }
        return n;
      case 0:
        return af(e, n, n.type, n.pendingProps, i);
      case 1:
        return ((o = n.type), (c = zr(o, n.pendingProps)), $g(e, n, o, c, i));
      case 3:
        e: {
          if ((We(n, n.stateNode.containerInfo), e === null))
            throw Error(l(387));
          o = n.pendingProps;
          var d = n.memoizedState;
          ((c = d.element), kc(e, n), Ml(n, o, null, i));
          var m = n.memoizedState;
          if (
            ((o = m.cache),
            qa(n, Et, o),
            o !== d.cache && Oc(n, [Et], i, !0),
            Nl(),
            (o = m.element),
            d.isDehydrated)
          )
            if (
              ((d = { element: o, isDehydrated: !1, cache: m.cache }),
              (n.updateQueue.baseState = d),
              (n.memoizedState = d),
              n.flags & 256)
            ) {
              n = Vg(e, n, o, i);
              break e;
            } else if (o !== c) {
              ((c = En(Error(l(424)), n)), Tl(c), (n = Vg(e, n, o, i)));
              break e;
            } else {
              switch (((e = n.stateNode.containerInfo), e.nodeType)) {
                case 9:
                  e = e.body;
                  break;
                default:
                  e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
              }
              for (
                ut = Cn(e.firstChild),
                  jt = n,
                  Pe = !0,
                  Ga = null,
                  On = !0,
                  i = Uh(n, null, o, i),
                  n.child = i;
                i;
              )
                ((i.flags = (i.flags & -3) | 4096), (i = i.sibling));
            }
          else {
            if ((Ar(), o === c)) {
              n = Ea(e, n, i);
              break e;
            }
            Bt(e, n, o, i);
          }
          n = n.child;
        }
        return n;
      case 26:
        return (
          ps(e, n),
          e === null
            ? (i = rm(n.type, null, n.pendingProps, null))
              ? (n.memoizedState = i)
              : Pe ||
                ((i = n.type),
                (e = n.pendingProps),
                (o = ks(ge.current).createElement(i)),
                (o[Ct] = n),
                (o[Vt] = e),
                Ut(o, i, e),
                St(o),
                (n.stateNode = o))
            : (n.memoizedState = rm(
                n.type,
                e.memoizedProps,
                n.pendingProps,
                e.memoizedState,
              )),
          null
        );
      case 27:
        return (
          rn(n),
          e === null &&
            Pe &&
            ((o = n.stateNode = tm(n.type, n.pendingProps, ge.current)),
            (jt = n),
            (On = !0),
            (c = ut),
            ir(n.type) ? ((Gf = c), (ut = Cn(o.firstChild))) : (ut = c)),
          Bt(e, n, n.pendingProps.children, i),
          ps(e, n),
          e === null && (n.flags |= 4194304),
          n.child
        );
      case 5:
        return (
          e === null &&
            Pe &&
            ((c = o = ut) &&
              ((o = nE(o, n.type, n.pendingProps, On)),
              o !== null
                ? ((n.stateNode = o),
                  (jt = n),
                  (ut = Cn(o.firstChild)),
                  (On = !1),
                  (c = !0))
                : (c = !1)),
            c || Pa(n)),
          rn(n),
          (c = n.type),
          (d = n.pendingProps),
          (m = e !== null ? e.memoizedProps : null),
          (o = d.children),
          Ff(c, d) ? (o = null) : m !== null && Ff(c, m) && (n.flags |= 32),
          n.memoizedState !== null &&
            ((c = Bc(e, n, m1, null, null, i)), (eo._currentValue = c)),
          ps(e, n),
          Bt(e, n, o, i),
          n.child
        );
      case 6:
        return (
          e === null &&
            Pe &&
            ((e = i = ut) &&
              ((i = aE(i, n.pendingProps, On)),
              i !== null
                ? ((n.stateNode = i), (jt = n), (ut = null), (e = !0))
                : (e = !1)),
            e || Pa(n)),
          null
        );
      case 13:
        return Gg(e, n, i);
      case 4:
        return (
          We(n, n.stateNode.containerInfo),
          (o = n.pendingProps),
          e === null ? (n.child = Mr(n, null, o, i)) : Bt(e, n, o, i),
          n.child
        );
      case 11:
        return jg(e, n, n.type, n.pendingProps, i);
      case 7:
        return (Bt(e, n, n.pendingProps, i), n.child);
      case 8:
        return (Bt(e, n, n.pendingProps.children, i), n.child);
      case 12:
        return (Bt(e, n, n.pendingProps.children, i), n.child);
      case 10:
        return (
          (o = n.pendingProps),
          qa(n, n.type, o.value),
          Bt(e, n, o.children, i),
          n.child
        );
      case 9:
        return (
          (c = n.type._context),
          (o = n.pendingProps.children),
          kr(n),
          (c = zt(c)),
          (o = o(c)),
          (n.flags |= 1),
          Bt(e, n, o, i),
          n.child
        );
      case 14:
        return zg(e, n, n.type, n.pendingProps, i);
      case 15:
        return Bg(e, n, n.type, n.pendingProps, i);
      case 19:
        return qg(e, n, i);
      case 31:
        return x1(e, n, i);
      case 22:
        return Ug(e, n, i, n.pendingProps);
      case 24:
        return (
          kr(n),
          (o = zt(Et)),
          e === null
            ? ((c = Tc()),
              c === null &&
                ((c = lt),
                (d = xc()),
                (c.pooledCache = d),
                d.refCount++,
                d !== null && (c.pooledCacheLanes |= i),
                (c = d)),
              (n.memoizedState = { parent: o, cache: c }),
              Rc(n),
              qa(n, Et, c))
            : ((e.lanes & i) !== 0 && (kc(e, n), Ml(n, null, null, i), Nl()),
              (c = e.memoizedState),
              (d = n.memoizedState),
              c.parent !== o
                ? ((c = { parent: o, cache: o }),
                  (n.memoizedState = c),
                  n.lanes === 0 &&
                    (n.memoizedState = n.updateQueue.baseState = c),
                  qa(n, Et, o))
                : ((o = d.cache),
                  qa(n, Et, o),
                  o !== c.cache && Oc(n, [Et], i, !0))),
          Bt(e, n, n.pendingProps.children, i),
          n.child
        );
      case 29:
        throw n.pendingProps;
    }
    throw Error(l(156, n.tag));
  }
  function _a(e) {
    e.flags |= 4;
  }
  function df(e, n, i, o, c) {
    if (((n = (e.mode & 32) !== 0) && (n = !1), n)) {
      if (((e.flags |= 16777216), (c & 335544128) === c))
        if (e.stateNode.complete) e.flags |= 8192;
        else if (Sy()) e.flags |= 8192;
        else throw ((Nr = Jo), Ac);
    } else e.flags &= -16777217;
  }
  function Zg(e, n) {
    if (n.type !== "stylesheet" || (n.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (((e.flags |= 16777216), !um(n)))
      if (Sy()) e.flags |= 8192;
      else throw ((Nr = Jo), Ac);
  }
  function gs(e, n) {
    (n !== null && (e.flags |= 4),
      e.flags & 16384 &&
        ((n = e.tag !== 22 ? $t() : 536870912), (e.lanes |= n), (wi |= n)));
  }
  function Il(e, n) {
    if (!Pe)
      switch (e.tailMode) {
        case "hidden":
          n = e.tail;
          for (var i = null; n !== null; )
            (n.alternate !== null && (i = n), (n = n.sibling));
          i === null ? (e.tail = null) : (i.sibling = null);
          break;
        case "collapsed":
          i = e.tail;
          for (var o = null; i !== null; )
            (i.alternate !== null && (o = i), (i = i.sibling));
          o === null
            ? n || e.tail === null
              ? (e.tail = null)
              : (e.tail.sibling = null)
            : (o.sibling = null);
      }
  }
  function ct(e) {
    var n = e.alternate !== null && e.alternate.child === e.child,
      i = 0,
      o = 0;
    if (n)
      for (var c = e.child; c !== null; )
        ((i |= c.lanes | c.childLanes),
          (o |= c.subtreeFlags & 65011712),
          (o |= c.flags & 65011712),
          (c.return = e),
          (c = c.sibling));
    else
      for (c = e.child; c !== null; )
        ((i |= c.lanes | c.childLanes),
          (o |= c.subtreeFlags),
          (o |= c.flags),
          (c.return = e),
          (c = c.sibling));
    return ((e.subtreeFlags |= o), (e.childLanes = i), n);
  }
  function T1(e, n, i) {
    var o = n.pendingProps;
    switch ((bc(n), n.tag)) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return (ct(n), null);
      case 1:
        return (ct(n), null);
      case 3:
        return (
          (i = n.stateNode),
          (o = null),
          e !== null && (o = e.memoizedState.cache),
          n.memoizedState.cache !== o && (n.flags |= 2048),
          va(Et),
          qe(),
          i.pendingContext &&
            ((i.context = i.pendingContext), (i.pendingContext = null)),
          (e === null || e.child === null) &&
            (ci(n)
              ? _a(n)
              : e === null ||
                (e.memoizedState.isDehydrated && (n.flags & 256) === 0) ||
                ((n.flags |= 1024), Ec())),
          ct(n),
          null
        );
      case 26:
        var c = n.type,
          d = n.memoizedState;
        return (
          e === null
            ? (_a(n),
              d !== null ? (ct(n), Zg(n, d)) : (ct(n), df(n, c, null, o, i)))
            : d
              ? d !== e.memoizedState
                ? (_a(n), ct(n), Zg(n, d))
                : (ct(n), (n.flags &= -16777217))
              : ((e = e.memoizedProps),
                e !== o && _a(n),
                ct(n),
                df(n, c, e, o, i)),
          null
        );
      case 27:
        if (
          (bt(n),
          (i = ge.current),
          (c = n.type),
          e !== null && n.stateNode != null)
        )
          e.memoizedProps !== o && _a(n);
        else {
          if (!o) {
            if (n.stateNode === null) throw Error(l(166));
            return (ct(n), null);
          }
          ((e = ce.current),
            ci(n) ? Th(n) : ((e = tm(c, o, i)), (n.stateNode = e), _a(n)));
        }
        return (ct(n), null);
      case 5:
        if ((bt(n), (c = n.type), e !== null && n.stateNode != null))
          e.memoizedProps !== o && _a(n);
        else {
          if (!o) {
            if (n.stateNode === null) throw Error(l(166));
            return (ct(n), null);
          }
          if (((d = ce.current), ci(n))) Th(n);
          else {
            var m = ks(ge.current);
            switch (d) {
              case 1:
                d = m.createElementNS("http://www.w3.org/2000/svg", c);
                break;
              case 2:
                d = m.createElementNS("http://www.w3.org/1998/Math/MathML", c);
                break;
              default:
                switch (c) {
                  case "svg":
                    d = m.createElementNS("http://www.w3.org/2000/svg", c);
                    break;
                  case "math":
                    d = m.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      c,
                    );
                    break;
                  case "script":
                    ((d = m.createElement("div")),
                      (d.innerHTML = "<script><\/script>"),
                      (d = d.removeChild(d.firstChild)));
                    break;
                  case "select":
                    ((d =
                      typeof o.is == "string"
                        ? m.createElement("select", { is: o.is })
                        : m.createElement("select")),
                      o.multiple
                        ? (d.multiple = !0)
                        : o.size && (d.size = o.size));
                    break;
                  default:
                    d =
                      typeof o.is == "string"
                        ? m.createElement(c, { is: o.is })
                        : m.createElement(c);
                }
            }
            ((d[Ct] = n), (d[Vt] = o));
            e: for (m = n.child; m !== null; ) {
              if (m.tag === 5 || m.tag === 6) d.appendChild(m.stateNode);
              else if (m.tag !== 4 && m.tag !== 27 && m.child !== null) {
                ((m.child.return = m), (m = m.child));
                continue;
              }
              if (m === n) break e;
              for (; m.sibling === null; ) {
                if (m.return === null || m.return === n) break e;
                m = m.return;
              }
              ((m.sibling.return = m.return), (m = m.sibling));
            }
            n.stateNode = d;
            e: switch ((Ut(d, c, o), c)) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                o = !!o.autoFocus;
                break e;
              case "img":
                o = !0;
                break e;
              default:
                o = !1;
            }
            o && _a(n);
          }
        }
        return (
          ct(n),
          df(n, n.type, e === null ? null : e.memoizedProps, n.pendingProps, i),
          null
        );
      case 6:
        if (e && n.stateNode != null) e.memoizedProps !== o && _a(n);
        else {
          if (typeof o != "string" && n.stateNode === null) throw Error(l(166));
          if (((e = ge.current), ci(n))) {
            if (
              ((e = n.stateNode),
              (i = n.memoizedProps),
              (o = null),
              (c = jt),
              c !== null)
            )
              switch (c.tag) {
                case 27:
                case 5:
                  o = c.memoizedProps;
              }
            ((e[Ct] = n),
              (e = !!(
                e.nodeValue === i ||
                (o !== null && o.suppressHydrationWarning === !0) ||
                Gy(e.nodeValue, i)
              )),
              e || Pa(n, !0));
          } else
            ((e = ks(e).createTextNode(o)), (e[Ct] = n), (n.stateNode = e));
        }
        return (ct(n), null);
      case 31:
        if (((i = n.memoizedState), e === null || e.memoizedState !== null)) {
          if (((o = ci(n)), i !== null)) {
            if (e === null) {
              if (!o) throw Error(l(318));
              if (
                ((e = n.memoizedState),
                (e = e !== null ? e.dehydrated : null),
                !e)
              )
                throw Error(l(557));
              e[Ct] = n;
            } else
              (Ar(),
                (n.flags & 128) === 0 && (n.memoizedState = null),
                (n.flags |= 4));
            (ct(n), (e = !1));
          } else
            ((i = Ec()),
              e !== null &&
                e.memoizedState !== null &&
                (e.memoizedState.hydrationErrors = i),
              (e = !0));
          if (!e) return n.flags & 256 ? (fn(n), n) : (fn(n), null);
          if ((n.flags & 128) !== 0) throw Error(l(558));
        }
        return (ct(n), null);
      case 13:
        if (
          ((o = n.memoizedState),
          e === null ||
            (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
        ) {
          if (((c = ci(n)), o !== null && o.dehydrated !== null)) {
            if (e === null) {
              if (!c) throw Error(l(318));
              if (
                ((c = n.memoizedState),
                (c = c !== null ? c.dehydrated : null),
                !c)
              )
                throw Error(l(317));
              c[Ct] = n;
            } else
              (Ar(),
                (n.flags & 128) === 0 && (n.memoizedState = null),
                (n.flags |= 4));
            (ct(n), (c = !1));
          } else
            ((c = Ec()),
              e !== null &&
                e.memoizedState !== null &&
                (e.memoizedState.hydrationErrors = c),
              (c = !0));
          if (!c) return n.flags & 256 ? (fn(n), n) : (fn(n), null);
        }
        return (
          fn(n),
          (n.flags & 128) !== 0
            ? ((n.lanes = i), n)
            : ((i = o !== null),
              (e = e !== null && e.memoizedState !== null),
              i &&
                ((o = n.child),
                (c = null),
                o.alternate !== null &&
                  o.alternate.memoizedState !== null &&
                  o.alternate.memoizedState.cachePool !== null &&
                  (c = o.alternate.memoizedState.cachePool.pool),
                (d = null),
                o.memoizedState !== null &&
                  o.memoizedState.cachePool !== null &&
                  (d = o.memoizedState.cachePool.pool),
                d !== c && (o.flags |= 2048)),
              i !== e && i && (n.child.flags |= 8192),
              gs(n, n.updateQueue),
              ct(n),
              null)
        );
      case 4:
        return (qe(), e === null && Mf(n.stateNode.containerInfo), ct(n), null);
      case 10:
        return (va(n.type), ct(n), null);
      case 19:
        if ((V(yt), (o = n.memoizedState), o === null)) return (ct(n), null);
        if (((c = (n.flags & 128) !== 0), (d = o.rendering), d === null))
          if (c) Il(o, !1);
          else {
            if (gt !== 0 || (e !== null && (e.flags & 128) !== 0))
              for (e = n.child; e !== null; ) {
                if (((d = ns(e)), d !== null)) {
                  for (
                    n.flags |= 128,
                      Il(o, !1),
                      e = d.updateQueue,
                      n.updateQueue = e,
                      gs(n, e),
                      n.subtreeFlags = 0,
                      e = i,
                      i = n.child;
                    i !== null;
                  )
                    (_h(i, e), (i = i.sibling));
                  return (
                    B(yt, (yt.current & 1) | 2),
                    Pe && ya(n, o.treeForkCount),
                    n.child
                  );
                }
                e = e.sibling;
              }
            o.tail !== null &&
              At() > Ss &&
              ((n.flags |= 128), (c = !0), Il(o, !1), (n.lanes = 4194304));
          }
        else {
          if (!c)
            if (((e = ns(d)), e !== null)) {
              if (
                ((n.flags |= 128),
                (c = !0),
                (e = e.updateQueue),
                (n.updateQueue = e),
                gs(n, e),
                Il(o, !0),
                o.tail === null &&
                  o.tailMode === "hidden" &&
                  !d.alternate &&
                  !Pe)
              )
                return (ct(n), null);
            } else
              2 * At() - o.renderingStartTime > Ss &&
                i !== 536870912 &&
                ((n.flags |= 128), (c = !0), Il(o, !1), (n.lanes = 4194304));
          o.isBackwards
            ? ((d.sibling = n.child), (n.child = d))
            : ((e = o.last),
              e !== null ? (e.sibling = d) : (n.child = d),
              (o.last = d));
        }
        return o.tail !== null
          ? ((e = o.tail),
            (o.rendering = e),
            (o.tail = e.sibling),
            (o.renderingStartTime = At()),
            (e.sibling = null),
            (i = yt.current),
            B(yt, c ? (i & 1) | 2 : i & 1),
            Pe && ya(n, o.treeForkCount),
            e)
          : (ct(n), null);
      case 22:
      case 23:
        return (
          fn(n),
          Mc(),
          (o = n.memoizedState !== null),
          e !== null
            ? (e.memoizedState !== null) !== o && (n.flags |= 8192)
            : o && (n.flags |= 8192),
          o
            ? (i & 536870912) !== 0 &&
              (n.flags & 128) === 0 &&
              (ct(n), n.subtreeFlags & 6 && (n.flags |= 8192))
            : ct(n),
          (i = n.updateQueue),
          i !== null && gs(n, i.retryQueue),
          (i = null),
          e !== null &&
            e.memoizedState !== null &&
            e.memoizedState.cachePool !== null &&
            (i = e.memoizedState.cachePool.pool),
          (o = null),
          n.memoizedState !== null &&
            n.memoizedState.cachePool !== null &&
            (o = n.memoizedState.cachePool.pool),
          o !== i && (n.flags |= 2048),
          e !== null && V(Dr),
          null
        );
      case 24:
        return (
          (i = null),
          e !== null && (i = e.memoizedState.cache),
          n.memoizedState.cache !== i && (n.flags |= 2048),
          va(Et),
          ct(n),
          null
        );
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(l(156, n.tag));
  }
  function A1(e, n) {
    switch ((bc(n), n.tag)) {
      case 1:
        return (
          (e = n.flags),
          e & 65536 ? ((n.flags = (e & -65537) | 128), n) : null
        );
      case 3:
        return (
          va(Et),
          qe(),
          (e = n.flags),
          (e & 65536) !== 0 && (e & 128) === 0
            ? ((n.flags = (e & -65537) | 128), n)
            : null
        );
      case 26:
      case 27:
      case 5:
        return (bt(n), null);
      case 31:
        if (n.memoizedState !== null) {
          if ((fn(n), n.alternate === null)) throw Error(l(340));
          Ar();
        }
        return (
          (e = n.flags),
          e & 65536 ? ((n.flags = (e & -65537) | 128), n) : null
        );
      case 13:
        if (
          (fn(n), (e = n.memoizedState), e !== null && e.dehydrated !== null)
        ) {
          if (n.alternate === null) throw Error(l(340));
          Ar();
        }
        return (
          (e = n.flags),
          e & 65536 ? ((n.flags = (e & -65537) | 128), n) : null
        );
      case 19:
        return (V(yt), null);
      case 4:
        return (qe(), null);
      case 10:
        return (va(n.type), null);
      case 22:
      case 23:
        return (
          fn(n),
          Mc(),
          e !== null && V(Dr),
          (e = n.flags),
          e & 65536 ? ((n.flags = (e & -65537) | 128), n) : null
        );
      case 24:
        return (va(Et), null);
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Xg(e, n) {
    switch ((bc(n), n.tag)) {
      case 3:
        (va(Et), qe());
        break;
      case 26:
      case 27:
      case 5:
        bt(n);
        break;
      case 4:
        qe();
        break;
      case 31:
        n.memoizedState !== null && fn(n);
        break;
      case 13:
        fn(n);
        break;
      case 19:
        V(yt);
        break;
      case 10:
        va(n.type);
        break;
      case 22:
      case 23:
        (fn(n), Mc(), e !== null && V(Dr));
        break;
      case 24:
        va(Et);
    }
  }
  function Hl(e, n) {
    try {
      var i = n.updateQueue,
        o = i !== null ? i.lastEffect : null;
      if (o !== null) {
        var c = o.next;
        i = c;
        do {
          if ((i.tag & e) === e) {
            o = void 0;
            var d = i.create,
              m = i.inst;
            ((o = d()), (m.destroy = o));
          }
          i = i.next;
        } while (i !== c);
      }
    } catch (_) {
      tt(n, n.return, _);
    }
  }
  function Ja(e, n, i) {
    try {
      var o = n.updateQueue,
        c = o !== null ? o.lastEffect : null;
      if (c !== null) {
        var d = c.next;
        o = d;
        do {
          if ((o.tag & e) === e) {
            var m = o.inst,
              _ = m.destroy;
            if (_ !== void 0) {
              ((m.destroy = void 0), (c = n));
              var R = i,
                I = _;
              try {
                I();
              } catch (K) {
                tt(c, R, K);
              }
            }
          }
          o = o.next;
        } while (o !== d);
      }
    } catch (K) {
      tt(n, n.return, K);
    }
  }
  function Kg(e) {
    var n = e.updateQueue;
    if (n !== null) {
      var i = e.stateNode;
      try {
        Ih(n, i);
      } catch (o) {
        tt(e, e.return, o);
      }
    }
  }
  function Qg(e, n, i) {
    ((i.props = zr(e.type, e.memoizedProps)), (i.state = e.memoizedState));
    try {
      i.componentWillUnmount();
    } catch (o) {
      tt(e, n, o);
    }
  }
  function $l(e, n) {
    try {
      var i = e.ref;
      if (i !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var o = e.stateNode;
            break;
          case 30:
            o = e.stateNode;
            break;
          default:
            o = e.stateNode;
        }
        typeof i == "function" ? (e.refCleanup = i(o)) : (i.current = o);
      }
    } catch (c) {
      tt(e, n, c);
    }
  }
  function na(e, n) {
    var i = e.ref,
      o = e.refCleanup;
    if (i !== null)
      if (typeof o == "function")
        try {
          o();
        } catch (c) {
          tt(e, n, c);
        } finally {
          ((e.refCleanup = null),
            (e = e.alternate),
            e != null && (e.refCleanup = null));
        }
      else if (typeof i == "function")
        try {
          i(null);
        } catch (c) {
          tt(e, n, c);
        }
      else i.current = null;
  }
  function Jg(e) {
    var n = e.type,
      i = e.memoizedProps,
      o = e.stateNode;
    try {
      e: switch (n) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          i.autoFocus && o.focus();
          break e;
        case "img":
          i.src ? (o.src = i.src) : i.srcSet && (o.srcset = i.srcSet);
      }
    } catch (c) {
      tt(e, e.return, c);
    }
  }
  function pf(e, n, i) {
    try {
      var o = e.stateNode;
      (K1(o, e.type, i, n), (o[Vt] = n));
    } catch (c) {
      tt(e, e.return, c);
    }
  }
  function Wg(e) {
    return (
      e.tag === 5 ||
      e.tag === 3 ||
      e.tag === 26 ||
      (e.tag === 27 && ir(e.type)) ||
      e.tag === 4
    );
  }
  function hf(e) {
    e: for (;;) {
      for (; e.sibling === null; ) {
        if (e.return === null || Wg(e.return)) return null;
        e = e.return;
      }
      for (
        e.sibling.return = e.return, e = e.sibling;
        e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
      ) {
        if (
          (e.tag === 27 && ir(e.type)) ||
          e.flags & 2 ||
          e.child === null ||
          e.tag === 4
        )
          continue e;
        ((e.child.return = e), (e = e.child));
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function gf(e, n, i) {
    var o = e.tag;
    if (o === 5 || o === 6)
      ((e = e.stateNode),
        n
          ? (i.nodeType === 9
              ? i.body
              : i.nodeName === "HTML"
                ? i.ownerDocument.body
                : i
            ).insertBefore(e, n)
          : ((n =
              i.nodeType === 9
                ? i.body
                : i.nodeName === "HTML"
                  ? i.ownerDocument.body
                  : i),
            n.appendChild(e),
            (i = i._reactRootContainer),
            i != null || n.onclick !== null || (n.onclick = on)));
    else if (
      o !== 4 &&
      (o === 27 && ir(e.type) && ((i = e.stateNode), (n = null)),
      (e = e.child),
      e !== null)
    )
      for (gf(e, n, i), e = e.sibling; e !== null; )
        (gf(e, n, i), (e = e.sibling));
  }
  function ys(e, n, i) {
    var o = e.tag;
    if (o === 5 || o === 6)
      ((e = e.stateNode), n ? i.insertBefore(e, n) : i.appendChild(e));
    else if (
      o !== 4 &&
      (o === 27 && ir(e.type) && (i = e.stateNode), (e = e.child), e !== null)
    )
      for (ys(e, n, i), e = e.sibling; e !== null; )
        (ys(e, n, i), (e = e.sibling));
  }
  function ey(e) {
    var n = e.stateNode,
      i = e.memoizedProps;
    try {
      for (var o = e.type, c = n.attributes; c.length; )
        n.removeAttributeNode(c[0]);
      (Ut(n, o, i), (n[Ct] = e), (n[Vt] = i));
    } catch (d) {
      tt(e, e.return, d);
    }
  }
  var wa = !1,
    Ot = !1,
    yf = !1,
    ty = typeof WeakSet == "function" ? WeakSet : Set,
    kt = null;
  function R1(e, n) {
    if (((e = e.containerInfo), (Bf = Bs), (e = ph(e)), sc(e))) {
      if ("selectionStart" in e)
        var i = { start: e.selectionStart, end: e.selectionEnd };
      else
        e: {
          i = ((i = e.ownerDocument) && i.defaultView) || window;
          var o = i.getSelection && i.getSelection();
          if (o && o.rangeCount !== 0) {
            i = o.anchorNode;
            var c = o.anchorOffset,
              d = o.focusNode;
            o = o.focusOffset;
            try {
              (i.nodeType, d.nodeType);
            } catch {
              i = null;
              break e;
            }
            var m = 0,
              _ = -1,
              R = -1,
              I = 0,
              K = 0,
              ee = e,
              $ = null;
            t: for (;;) {
              for (
                var P;
                ee !== i || (c !== 0 && ee.nodeType !== 3) || (_ = m + c),
                  ee !== d || (o !== 0 && ee.nodeType !== 3) || (R = m + o),
                  ee.nodeType === 3 && (m += ee.nodeValue.length),
                  (P = ee.firstChild) !== null;
              )
                (($ = ee), (ee = P));
              for (;;) {
                if (ee === e) break t;
                if (
                  ($ === i && ++I === c && (_ = m),
                  $ === d && ++K === o && (R = m),
                  (P = ee.nextSibling) !== null)
                )
                  break;
                ((ee = $), ($ = ee.parentNode));
              }
              ee = P;
            }
            i = _ === -1 || R === -1 ? null : { start: _, end: R };
          } else i = null;
        }
      i = i || { start: 0, end: 0 };
    } else i = null;
    for (
      Uf = { focusedElem: e, selectionRange: i }, Bs = !1, kt = n;
      kt !== null;
    )
      if (
        ((n = kt), (e = n.child), (n.subtreeFlags & 1028) !== 0 && e !== null)
      )
        ((e.return = n), (kt = e));
      else
        for (; kt !== null; ) {
          switch (((n = kt), (d = n.alternate), (e = n.flags), n.tag)) {
            case 0:
              if (
                (e & 4) !== 0 &&
                ((e = n.updateQueue),
                (e = e !== null ? e.events : null),
                e !== null)
              )
                for (i = 0; i < e.length; i++)
                  ((c = e[i]), (c.ref.impl = c.nextImpl));
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((e & 1024) !== 0 && d !== null) {
                ((e = void 0),
                  (i = n),
                  (c = d.memoizedProps),
                  (d = d.memoizedState),
                  (o = i.stateNode));
                try {
                  var we = zr(i.type, c);
                  ((e = o.getSnapshotBeforeUpdate(we, d)),
                    (o.__reactInternalSnapshotBeforeUpdate = e));
                } catch (Re) {
                  tt(i, i.return, Re);
                }
              }
              break;
            case 3:
              if ((e & 1024) !== 0) {
                if (
                  ((e = n.stateNode.containerInfo), (i = e.nodeType), i === 9)
                )
                  Hf(e);
                else if (i === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      Hf(e);
                      break;
                    default:
                      e.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((e & 1024) !== 0) throw Error(l(163));
          }
          if (((e = n.sibling), e !== null)) {
            ((e.return = n.return), (kt = e));
            break;
          }
          kt = n.return;
        }
  }
  function ny(e, n, i) {
    var o = i.flags;
    switch (i.tag) {
      case 0:
      case 11:
      case 15:
        (xa(e, i), o & 4 && Hl(5, i));
        break;
      case 1:
        if ((xa(e, i), o & 4))
          if (((e = i.stateNode), n === null))
            try {
              e.componentDidMount();
            } catch (m) {
              tt(i, i.return, m);
            }
          else {
            var c = zr(i.type, n.memoizedProps);
            n = n.memoizedState;
            try {
              e.componentDidUpdate(c, n, e.__reactInternalSnapshotBeforeUpdate);
            } catch (m) {
              tt(i, i.return, m);
            }
          }
        (o & 64 && Kg(i), o & 512 && $l(i, i.return));
        break;
      case 3:
        if ((xa(e, i), o & 64 && ((e = i.updateQueue), e !== null))) {
          if (((n = null), i.child !== null))
            switch (i.child.tag) {
              case 27:
              case 5:
                n = i.child.stateNode;
                break;
              case 1:
                n = i.child.stateNode;
            }
          try {
            Ih(e, n);
          } catch (m) {
            tt(i, i.return, m);
          }
        }
        break;
      case 27:
        n === null && o & 4 && ey(i);
      case 26:
      case 5:
        (xa(e, i), n === null && o & 4 && Jg(i), o & 512 && $l(i, i.return));
        break;
      case 12:
        xa(e, i);
        break;
      case 31:
        (xa(e, i), o & 4 && iy(e, i));
        break;
      case 13:
        (xa(e, i),
          o & 4 && ly(e, i),
          o & 64 &&
            ((e = i.memoizedState),
            e !== null &&
              ((e = e.dehydrated),
              e !== null && ((i = U1.bind(null, i)), rE(e, i)))));
        break;
      case 22:
        if (((o = i.memoizedState !== null || wa), !o)) {
          ((n = (n !== null && n.memoizedState !== null) || Ot), (c = wa));
          var d = Ot;
          ((wa = o),
            (Ot = n) && !d ? Ca(e, i, (i.subtreeFlags & 8772) !== 0) : xa(e, i),
            (wa = c),
            (Ot = d));
        }
        break;
      case 30:
        break;
      default:
        xa(e, i);
    }
  }
  function ay(e) {
    var n = e.alternate;
    (n !== null && ((e.alternate = null), ay(n)),
      (e.child = null),
      (e.deletions = null),
      (e.sibling = null),
      e.tag === 5 && ((n = e.stateNode), n !== null && ol(n)),
      (e.stateNode = null),
      (e.return = null),
      (e.dependencies = null),
      (e.memoizedProps = null),
      (e.memoizedState = null),
      (e.pendingProps = null),
      (e.stateNode = null),
      (e.updateQueue = null));
  }
  var dt = null,
    Jt = !1;
  function Oa(e, n, i) {
    for (i = i.child; i !== null; ) (ry(e, n, i), (i = i.sibling));
  }
  function ry(e, n, i) {
    if (X && typeof X.onCommitFiberUnmount == "function")
      try {
        X.onCommitFiberUnmount(G, i);
      } catch {}
    switch (i.tag) {
      case 26:
        (Ot || na(i, n),
          Oa(e, n, i),
          i.memoizedState
            ? i.memoizedState.count--
            : i.stateNode && ((i = i.stateNode), i.parentNode.removeChild(i)));
        break;
      case 27:
        Ot || na(i, n);
        var o = dt,
          c = Jt;
        (ir(i.type) && ((dt = i.stateNode), (Jt = !1)),
          Oa(e, n, i),
          Ql(i.stateNode),
          (dt = o),
          (Jt = c));
        break;
      case 5:
        Ot || na(i, n);
      case 6:
        if (
          ((o = dt),
          (c = Jt),
          (dt = null),
          Oa(e, n, i),
          (dt = o),
          (Jt = c),
          dt !== null)
        )
          if (Jt)
            try {
              (dt.nodeType === 9
                ? dt.body
                : dt.nodeName === "HTML"
                  ? dt.ownerDocument.body
                  : dt
              ).removeChild(i.stateNode);
            } catch (d) {
              tt(i, n, d);
            }
          else
            try {
              dt.removeChild(i.stateNode);
            } catch (d) {
              tt(i, n, d);
            }
        break;
      case 18:
        dt !== null &&
          (Jt
            ? ((e = dt),
              Ky(
                e.nodeType === 9
                  ? e.body
                  : e.nodeName === "HTML"
                    ? e.ownerDocument.body
                    : e,
                i.stateNode,
              ),
              Di(e))
            : Ky(dt, i.stateNode));
        break;
      case 4:
        ((o = dt),
          (c = Jt),
          (dt = i.stateNode.containerInfo),
          (Jt = !0),
          Oa(e, n, i),
          (dt = o),
          (Jt = c));
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        (Ja(2, i, n), Ot || Ja(4, i, n), Oa(e, n, i));
        break;
      case 1:
        (Ot ||
          (na(i, n),
          (o = i.stateNode),
          typeof o.componentWillUnmount == "function" && Qg(i, n, o)),
          Oa(e, n, i));
        break;
      case 21:
        Oa(e, n, i);
        break;
      case 22:
        ((Ot = (o = Ot) || i.memoizedState !== null), Oa(e, n, i), (Ot = o));
        break;
      default:
        Oa(e, n, i);
    }
  }
  function iy(e, n) {
    if (
      n.memoizedState === null &&
      ((e = n.alternate), e !== null && ((e = e.memoizedState), e !== null))
    ) {
      e = e.dehydrated;
      try {
        Di(e);
      } catch (i) {
        tt(n, n.return, i);
      }
    }
  }
  function ly(e, n) {
    if (
      n.memoizedState === null &&
      ((e = n.alternate),
      e !== null &&
        ((e = e.memoizedState), e !== null && ((e = e.dehydrated), e !== null)))
    )
      try {
        Di(e);
      } catch (i) {
        tt(n, n.return, i);
      }
  }
  function k1(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var n = e.stateNode;
        return (n === null && (n = e.stateNode = new ty()), n);
      case 22:
        return (
          (e = e.stateNode),
          (n = e._retryCache),
          n === null && (n = e._retryCache = new ty()),
          n
        );
      default:
        throw Error(l(435, e.tag));
    }
  }
  function ms(e, n) {
    var i = k1(e);
    n.forEach(function (o) {
      if (!i.has(o)) {
        i.add(o);
        var c = F1.bind(null, e, o);
        o.then(c, c);
      }
    });
  }
  function Wt(e, n) {
    var i = n.deletions;
    if (i !== null)
      for (var o = 0; o < i.length; o++) {
        var c = i[o],
          d = e,
          m = n,
          _ = m;
        e: for (; _ !== null; ) {
          switch (_.tag) {
            case 27:
              if (ir(_.type)) {
                ((dt = _.stateNode), (Jt = !1));
                break e;
              }
              break;
            case 5:
              ((dt = _.stateNode), (Jt = !1));
              break e;
            case 3:
            case 4:
              ((dt = _.stateNode.containerInfo), (Jt = !0));
              break e;
          }
          _ = _.return;
        }
        if (dt === null) throw Error(l(160));
        (ry(d, m, c),
          (dt = null),
          (Jt = !1),
          (d = c.alternate),
          d !== null && (d.return = null),
          (c.return = null));
      }
    if (n.subtreeFlags & 13886)
      for (n = n.child; n !== null; ) (oy(n, e), (n = n.sibling));
  }
  var In = null;
  function oy(e, n) {
    var i = e.alternate,
      o = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        (Wt(n, e),
          en(e),
          o & 4 && (Ja(3, e, e.return), Hl(3, e), Ja(5, e, e.return)));
        break;
      case 1:
        (Wt(n, e),
          en(e),
          o & 512 && (Ot || i === null || na(i, i.return)),
          o & 64 &&
            wa &&
            ((e = e.updateQueue),
            e !== null &&
              ((o = e.callbacks),
              o !== null &&
                ((i = e.shared.hiddenCallbacks),
                (e.shared.hiddenCallbacks = i === null ? o : i.concat(o))))));
        break;
      case 26:
        var c = In;
        if (
          (Wt(n, e),
          en(e),
          o & 512 && (Ot || i === null || na(i, i.return)),
          o & 4)
        ) {
          var d = i !== null ? i.memoizedState : null;
          if (((o = e.memoizedState), i === null))
            if (o === null)
              if (e.stateNode === null) {
                e: {
                  ((o = e.type),
                    (i = e.memoizedProps),
                    (c = c.ownerDocument || c));
                  t: switch (o) {
                    case "title":
                      ((d = c.getElementsByTagName("title")[0]),
                        (!d ||
                          d[br] ||
                          d[Ct] ||
                          d.namespaceURI === "http://www.w3.org/2000/svg" ||
                          d.hasAttribute("itemprop")) &&
                          ((d = c.createElement(o)),
                          c.head.insertBefore(
                            d,
                            c.querySelector("head > title"),
                          )),
                        Ut(d, o, i),
                        (d[Ct] = e),
                        St(d),
                        (o = d));
                      break e;
                    case "link":
                      var m = om("link", "href", c).get(o + (i.href || ""));
                      if (m) {
                        for (var _ = 0; _ < m.length; _++)
                          if (
                            ((d = m[_]),
                            d.getAttribute("href") ===
                              (i.href == null || i.href === ""
                                ? null
                                : i.href) &&
                              d.getAttribute("rel") ===
                                (i.rel == null ? null : i.rel) &&
                              d.getAttribute("title") ===
                                (i.title == null ? null : i.title) &&
                              d.getAttribute("crossorigin") ===
                                (i.crossOrigin == null ? null : i.crossOrigin))
                          ) {
                            m.splice(_, 1);
                            break t;
                          }
                      }
                      ((d = c.createElement(o)),
                        Ut(d, o, i),
                        c.head.appendChild(d));
                      break;
                    case "meta":
                      if (
                        (m = om("meta", "content", c).get(
                          o + (i.content || ""),
                        ))
                      ) {
                        for (_ = 0; _ < m.length; _++)
                          if (
                            ((d = m[_]),
                            d.getAttribute("content") ===
                              (i.content == null ? null : "" + i.content) &&
                              d.getAttribute("name") ===
                                (i.name == null ? null : i.name) &&
                              d.getAttribute("property") ===
                                (i.property == null ? null : i.property) &&
                              d.getAttribute("http-equiv") ===
                                (i.httpEquiv == null ? null : i.httpEquiv) &&
                              d.getAttribute("charset") ===
                                (i.charSet == null ? null : i.charSet))
                          ) {
                            m.splice(_, 1);
                            break t;
                          }
                      }
                      ((d = c.createElement(o)),
                        Ut(d, o, i),
                        c.head.appendChild(d));
                      break;
                    default:
                      throw Error(l(468, o));
                  }
                  ((d[Ct] = e), St(d), (o = d));
                }
                e.stateNode = o;
              } else sm(c, e.type, e.stateNode);
            else e.stateNode = lm(c, o, e.memoizedProps);
          else
            d !== o
              ? (d === null
                  ? i.stateNode !== null &&
                    ((i = i.stateNode), i.parentNode.removeChild(i))
                  : d.count--,
                o === null
                  ? sm(c, e.type, e.stateNode)
                  : lm(c, o, e.memoizedProps))
              : o === null &&
                e.stateNode !== null &&
                pf(e, e.memoizedProps, i.memoizedProps);
        }
        break;
      case 27:
        (Wt(n, e),
          en(e),
          o & 512 && (Ot || i === null || na(i, i.return)),
          i !== null && o & 4 && pf(e, e.memoizedProps, i.memoizedProps));
        break;
      case 5:
        if (
          (Wt(n, e),
          en(e),
          o & 512 && (Ot || i === null || na(i, i.return)),
          e.flags & 32)
        ) {
          c = e.stateNode;
          try {
            Ia(c, "");
          } catch (we) {
            tt(e, e.return, we);
          }
        }
        (o & 4 &&
          e.stateNode != null &&
          ((c = e.memoizedProps), pf(e, c, i !== null ? i.memoizedProps : c)),
          o & 1024 && (yf = !0));
        break;
      case 6:
        if ((Wt(n, e), en(e), o & 4)) {
          if (e.stateNode === null) throw Error(l(162));
          ((o = e.memoizedProps), (i = e.stateNode));
          try {
            i.nodeValue = o;
          } catch (we) {
            tt(e, e.return, we);
          }
        }
        break;
      case 3:
        if (
          ((Ns = null),
          (c = In),
          (In = Ds(n.containerInfo)),
          Wt(n, e),
          (In = c),
          en(e),
          o & 4 && i !== null && i.memoizedState.isDehydrated)
        )
          try {
            Di(n.containerInfo);
          } catch (we) {
            tt(e, e.return, we);
          }
        yf && ((yf = !1), sy(e));
        break;
      case 4:
        ((o = In),
          (In = Ds(e.stateNode.containerInfo)),
          Wt(n, e),
          en(e),
          (In = o));
        break;
      case 12:
        (Wt(n, e), en(e));
        break;
      case 31:
        (Wt(n, e),
          en(e),
          o & 4 &&
            ((o = e.updateQueue),
            o !== null && ((e.updateQueue = null), ms(e, o))));
        break;
      case 13:
        (Wt(n, e),
          en(e),
          e.child.flags & 8192 &&
            (e.memoizedState !== null) !=
              (i !== null && i.memoizedState !== null) &&
            (bs = At()),
          o & 4 &&
            ((o = e.updateQueue),
            o !== null && ((e.updateQueue = null), ms(e, o))));
        break;
      case 22:
        c = e.memoizedState !== null;
        var R = i !== null && i.memoizedState !== null,
          I = wa,
          K = Ot;
        if (
          ((wa = I || c),
          (Ot = K || R),
          Wt(n, e),
          (Ot = K),
          (wa = I),
          en(e),
          o & 8192)
        )
          e: for (
            n = e.stateNode,
              n._visibility = c ? n._visibility & -2 : n._visibility | 1,
              c && (i === null || R || wa || Ot || Br(e)),
              i = null,
              n = e;
            ;
          ) {
            if (n.tag === 5 || n.tag === 26) {
              if (i === null) {
                R = i = n;
                try {
                  if (((d = R.stateNode), c))
                    ((m = d.style),
                      typeof m.setProperty == "function"
                        ? m.setProperty("display", "none", "important")
                        : (m.display = "none"));
                  else {
                    _ = R.stateNode;
                    var ee = R.memoizedProps.style,
                      $ =
                        ee != null && ee.hasOwnProperty("display")
                          ? ee.display
                          : null;
                    _.style.display =
                      $ == null || typeof $ == "boolean" ? "" : ("" + $).trim();
                  }
                } catch (we) {
                  tt(R, R.return, we);
                }
              }
            } else if (n.tag === 6) {
              if (i === null) {
                R = n;
                try {
                  R.stateNode.nodeValue = c ? "" : R.memoizedProps;
                } catch (we) {
                  tt(R, R.return, we);
                }
              }
            } else if (n.tag === 18) {
              if (i === null) {
                R = n;
                try {
                  var P = R.stateNode;
                  c ? Qy(P, !0) : Qy(R.stateNode, !1);
                } catch (we) {
                  tt(R, R.return, we);
                }
              }
            } else if (
              ((n.tag !== 22 && n.tag !== 23) ||
                n.memoizedState === null ||
                n === e) &&
              n.child !== null
            ) {
              ((n.child.return = n), (n = n.child));
              continue;
            }
            if (n === e) break e;
            for (; n.sibling === null; ) {
              if (n.return === null || n.return === e) break e;
              (i === n && (i = null), (n = n.return));
            }
            (i === n && (i = null),
              (n.sibling.return = n.return),
              (n = n.sibling));
          }
        o & 4 &&
          ((o = e.updateQueue),
          o !== null &&
            ((i = o.retryQueue),
            i !== null && ((o.retryQueue = null), ms(e, i))));
        break;
      case 19:
        (Wt(n, e),
          en(e),
          o & 4 &&
            ((o = e.updateQueue),
            o !== null && ((e.updateQueue = null), ms(e, o))));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        (Wt(n, e), en(e));
    }
  }
  function en(e) {
    var n = e.flags;
    if (n & 2) {
      try {
        for (var i, o = e.return; o !== null; ) {
          if (Wg(o)) {
            i = o;
            break;
          }
          o = o.return;
        }
        if (i == null) throw Error(l(160));
        switch (i.tag) {
          case 27:
            var c = i.stateNode,
              d = hf(e);
            ys(e, d, c);
            break;
          case 5:
            var m = i.stateNode;
            i.flags & 32 && (Ia(m, ""), (i.flags &= -33));
            var _ = hf(e);
            ys(e, _, m);
            break;
          case 3:
          case 4:
            var R = i.stateNode.containerInfo,
              I = hf(e);
            gf(e, I, R);
            break;
          default:
            throw Error(l(161));
        }
      } catch (K) {
        tt(e, e.return, K);
      }
      e.flags &= -3;
    }
    n & 4096 && (e.flags &= -4097);
  }
  function sy(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var n = e;
        (sy(n),
          n.tag === 5 && n.flags & 1024 && n.stateNode.reset(),
          (e = e.sibling));
      }
  }
  function xa(e, n) {
    if (n.subtreeFlags & 8772)
      for (n = n.child; n !== null; ) (ny(e, n.alternate, n), (n = n.sibling));
  }
  function Br(e) {
    for (e = e.child; e !== null; ) {
      var n = e;
      switch (n.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          (Ja(4, n, n.return), Br(n));
          break;
        case 1:
          na(n, n.return);
          var i = n.stateNode;
          (typeof i.componentWillUnmount == "function" && Qg(n, n.return, i),
            Br(n));
          break;
        case 27:
          Ql(n.stateNode);
        case 26:
        case 5:
          (na(n, n.return), Br(n));
          break;
        case 22:
          n.memoizedState === null && Br(n);
          break;
        case 30:
          Br(n);
          break;
        default:
          Br(n);
      }
      e = e.sibling;
    }
  }
  function Ca(e, n, i) {
    for (i = i && (n.subtreeFlags & 8772) !== 0, n = n.child; n !== null; ) {
      var o = n.alternate,
        c = e,
        d = n,
        m = d.flags;
      switch (d.tag) {
        case 0:
        case 11:
        case 15:
          (Ca(c, d, i), Hl(4, d));
          break;
        case 1:
          if (
            (Ca(c, d, i),
            (o = d),
            (c = o.stateNode),
            typeof c.componentDidMount == "function")
          )
            try {
              c.componentDidMount();
            } catch (I) {
              tt(o, o.return, I);
            }
          if (((o = d), (c = o.updateQueue), c !== null)) {
            var _ = o.stateNode;
            try {
              var R = c.shared.hiddenCallbacks;
              if (R !== null)
                for (c.shared.hiddenCallbacks = null, c = 0; c < R.length; c++)
                  Fh(R[c], _);
            } catch (I) {
              tt(o, o.return, I);
            }
          }
          (i && m & 64 && Kg(d), $l(d, d.return));
          break;
        case 27:
          ey(d);
        case 26:
        case 5:
          (Ca(c, d, i), i && o === null && m & 4 && Jg(d), $l(d, d.return));
          break;
        case 12:
          Ca(c, d, i);
          break;
        case 31:
          (Ca(c, d, i), i && m & 4 && iy(c, d));
          break;
        case 13:
          (Ca(c, d, i), i && m & 4 && ly(c, d));
          break;
        case 22:
          (d.memoizedState === null && Ca(c, d, i), $l(d, d.return));
          break;
        case 30:
          break;
        default:
          Ca(c, d, i);
      }
      n = n.sibling;
    }
  }
  function mf(e, n) {
    var i = null;
    (e !== null &&
      e.memoizedState !== null &&
      e.memoizedState.cachePool !== null &&
      (i = e.memoizedState.cachePool.pool),
      (e = null),
      n.memoizedState !== null &&
        n.memoizedState.cachePool !== null &&
        (e = n.memoizedState.cachePool.pool),
      e !== i && (e != null && e.refCount++, i != null && Al(i)));
  }
  function vf(e, n) {
    ((e = null),
      n.alternate !== null && (e = n.alternate.memoizedState.cache),
      (n = n.memoizedState.cache),
      n !== e && (n.refCount++, e != null && Al(e)));
  }
  function Hn(e, n, i, o) {
    if (n.subtreeFlags & 10256)
      for (n = n.child; n !== null; ) (uy(e, n, i, o), (n = n.sibling));
  }
  function uy(e, n, i, o) {
    var c = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        (Hn(e, n, i, o), c & 2048 && Hl(9, n));
        break;
      case 1:
        Hn(e, n, i, o);
        break;
      case 3:
        (Hn(e, n, i, o),
          c & 2048 &&
            ((e = null),
            n.alternate !== null && (e = n.alternate.memoizedState.cache),
            (n = n.memoizedState.cache),
            n !== e && (n.refCount++, e != null && Al(e))));
        break;
      case 12:
        if (c & 2048) {
          (Hn(e, n, i, o), (e = n.stateNode));
          try {
            var d = n.memoizedProps,
              m = d.id,
              _ = d.onPostCommit;
            typeof _ == "function" &&
              _(
                m,
                n.alternate === null ? "mount" : "update",
                e.passiveEffectDuration,
                -0,
              );
          } catch (R) {
            tt(n, n.return, R);
          }
        } else Hn(e, n, i, o);
        break;
      case 31:
        Hn(e, n, i, o);
        break;
      case 13:
        Hn(e, n, i, o);
        break;
      case 23:
        break;
      case 22:
        ((d = n.stateNode),
          (m = n.alternate),
          n.memoizedState !== null
            ? d._visibility & 2
              ? Hn(e, n, i, o)
              : Vl(e, n)
            : d._visibility & 2
              ? Hn(e, n, i, o)
              : ((d._visibility |= 2),
                Si(e, n, i, o, (n.subtreeFlags & 10256) !== 0 || !1)),
          c & 2048 && mf(m, n));
        break;
      case 24:
        (Hn(e, n, i, o), c & 2048 && vf(n.alternate, n));
        break;
      default:
        Hn(e, n, i, o);
    }
  }
  function Si(e, n, i, o, c) {
    for (
      c = c && ((n.subtreeFlags & 10256) !== 0 || !1), n = n.child;
      n !== null;
    ) {
      var d = e,
        m = n,
        _ = i,
        R = o,
        I = m.flags;
      switch (m.tag) {
        case 0:
        case 11:
        case 15:
          (Si(d, m, _, R, c), Hl(8, m));
          break;
        case 23:
          break;
        case 22:
          var K = m.stateNode;
          (m.memoizedState !== null
            ? K._visibility & 2
              ? Si(d, m, _, R, c)
              : Vl(d, m)
            : ((K._visibility |= 2), Si(d, m, _, R, c)),
            c && I & 2048 && mf(m.alternate, m));
          break;
        case 24:
          (Si(d, m, _, R, c), c && I & 2048 && vf(m.alternate, m));
          break;
        default:
          Si(d, m, _, R, c);
      }
      n = n.sibling;
    }
  }
  function Vl(e, n) {
    if (n.subtreeFlags & 10256)
      for (n = n.child; n !== null; ) {
        var i = e,
          o = n,
          c = o.flags;
        switch (o.tag) {
          case 22:
            (Vl(i, o), c & 2048 && mf(o.alternate, o));
            break;
          case 24:
            (Vl(i, o), c & 2048 && vf(o.alternate, o));
            break;
          default:
            Vl(i, o);
        }
        n = n.sibling;
      }
  }
  var Gl = 8192;
  function Ei(e, n, i) {
    if (e.subtreeFlags & Gl)
      for (e = e.child; e !== null; ) (cy(e, n, i), (e = e.sibling));
  }
  function cy(e, n, i) {
    switch (e.tag) {
      case 26:
        (Ei(e, n, i),
          e.flags & Gl &&
            e.memoizedState !== null &&
            yE(i, In, e.memoizedState, e.memoizedProps));
        break;
      case 5:
        Ei(e, n, i);
        break;
      case 3:
      case 4:
        var o = In;
        ((In = Ds(e.stateNode.containerInfo)), Ei(e, n, i), (In = o));
        break;
      case 22:
        e.memoizedState === null &&
          ((o = e.alternate),
          o !== null && o.memoizedState !== null
            ? ((o = Gl), (Gl = 16777216), Ei(e, n, i), (Gl = o))
            : Ei(e, n, i));
        break;
      default:
        Ei(e, n, i);
    }
  }
  function fy(e) {
    var n = e.alternate;
    if (n !== null && ((e = n.child), e !== null)) {
      n.child = null;
      do ((n = e.sibling), (e.sibling = null), (e = n));
      while (e !== null);
    }
  }
  function Pl(e) {
    var n = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (n !== null)
        for (var i = 0; i < n.length; i++) {
          var o = n[i];
          ((kt = o), py(o, e));
        }
      fy(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; ) (dy(e), (e = e.sibling));
  }
  function dy(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        (Pl(e), e.flags & 2048 && Ja(9, e, e.return));
        break;
      case 3:
        Pl(e);
        break;
      case 12:
        Pl(e);
        break;
      case 22:
        var n = e.stateNode;
        e.memoizedState !== null &&
        n._visibility & 2 &&
        (e.return === null || e.return.tag !== 13)
          ? ((n._visibility &= -3), vs(e))
          : Pl(e);
        break;
      default:
        Pl(e);
    }
  }
  function vs(e) {
    var n = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (n !== null)
        for (var i = 0; i < n.length; i++) {
          var o = n[i];
          ((kt = o), py(o, e));
        }
      fy(e);
    }
    for (e = e.child; e !== null; ) {
      switch (((n = e), n.tag)) {
        case 0:
        case 11:
        case 15:
          (Ja(8, n, n.return), vs(n));
          break;
        case 22:
          ((i = n.stateNode),
            i._visibility & 2 && ((i._visibility &= -3), vs(n)));
          break;
        default:
          vs(n);
      }
      e = e.sibling;
    }
  }
  function py(e, n) {
    for (; kt !== null; ) {
      var i = kt;
      switch (i.tag) {
        case 0:
        case 11:
        case 15:
          Ja(8, i, n);
          break;
        case 23:
        case 22:
          if (i.memoizedState !== null && i.memoizedState.cachePool !== null) {
            var o = i.memoizedState.cachePool.pool;
            o != null && o.refCount++;
          }
          break;
        case 24:
          Al(i.memoizedState.cache);
      }
      if (((o = i.child), o !== null)) ((o.return = i), (kt = o));
      else
        e: for (i = e; kt !== null; ) {
          o = kt;
          var c = o.sibling,
            d = o.return;
          if ((ay(o), o === i)) {
            kt = null;
            break e;
          }
          if (c !== null) {
            ((c.return = d), (kt = c));
            break e;
          }
          kt = d;
        }
    }
  }
  var D1 = {
      getCacheForType: function (e) {
        var n = zt(Et),
          i = n.data.get(e);
        return (i === void 0 && ((i = e()), n.data.set(e, i)), i);
      },
      cacheSignal: function () {
        return zt(Et).controller.signal;
      },
    },
    L1 = typeof WeakMap == "function" ? WeakMap : Map,
    Je = 0,
    lt = null,
    Fe = null,
    He = 0,
    et = 0,
    dn = null,
    Wa = !1,
    _i = !1,
    bf = !1,
    Ta = 0,
    gt = 0,
    er = 0,
    Ur = 0,
    Sf = 0,
    pn = 0,
    wi = 0,
    ql = null,
    tn = null,
    Ef = !1,
    bs = 0,
    hy = 0,
    Ss = 1 / 0,
    Es = null,
    tr = null,
    Tt = 0,
    nr = null,
    Oi = null,
    Aa = 0,
    _f = 0,
    wf = null,
    gy = null,
    Yl = 0,
    Of = null;
  function hn() {
    return (Je & 2) !== 0 && He !== 0 ? He & -He : M.T !== null ? kf() : Lo();
  }
  function yy() {
    if (pn === 0)
      if ((He & 536870912) === 0 || Pe) {
        var e = ye;
        ((ye <<= 1), (ye & 3932160) === 0 && (ye = 262144), (pn = e));
      } else pn = 536870912;
    return ((e = cn.current), e !== null && (e.flags |= 32), pn);
  }
  function nn(e, n, i) {
    (((e === lt && (et === 2 || et === 9)) || e.cancelPendingCommit !== null) &&
      (xi(e, 0), ar(e, He, pn, !1)),
      Nt(e, i),
      ((Je & 2) === 0 || e !== lt) &&
        (e === lt &&
          ((Je & 2) === 0 && (Ur |= i), gt === 4 && ar(e, He, pn, !1)),
        aa(e)));
  }
  function my(e, n, i) {
    if ((Je & 6) !== 0) throw Error(l(327));
    var o = (!i && (n & 127) === 0 && (n & e.expiredLanes) === 0) || Ye(e, n),
      c = o ? j1(e, n) : Cf(e, n, !0),
      d = o;
    do {
      if (c === 0) {
        _i && !o && ar(e, n, 0, !1);
        break;
      } else {
        if (((i = e.current.alternate), d && !N1(i))) {
          ((c = Cf(e, n, !1)), (d = !1));
          continue;
        }
        if (c === 2) {
          if (((d = n), e.errorRecoveryDisabledLanes & d)) var m = 0;
          else
            ((m = e.pendingLanes & -536870913),
              (m = m !== 0 ? m : m & 536870912 ? 536870912 : 0));
          if (m !== 0) {
            n = m;
            e: {
              var _ = e;
              c = ql;
              var R = _.current.memoizedState.isDehydrated;
              if ((R && (xi(_, m).flags |= 256), (m = Cf(_, m, !1)), m !== 2)) {
                if (bf && !R) {
                  ((_.errorRecoveryDisabledLanes |= d), (Ur |= d), (c = 4));
                  break e;
                }
                ((d = tn),
                  (tn = c),
                  d !== null &&
                    (tn === null ? (tn = d) : tn.push.apply(tn, d)));
              }
              c = m;
            }
            if (((d = !1), c !== 2)) continue;
          }
        }
        if (c === 1) {
          (xi(e, 0), ar(e, n, 0, !0));
          break;
        }
        e: {
          switch (((o = e), (d = c), d)) {
            case 0:
            case 1:
              throw Error(l(345));
            case 4:
              if ((n & 4194048) !== n) break;
            case 6:
              ar(o, n, pn, !Wa);
              break e;
            case 2:
              tn = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(l(329));
          }
          if ((n & 62914560) === n && ((c = bs + 300 - At()), 10 < c)) {
            if ((ar(o, n, pn, !Wa), Ne(o, 0, !0) !== 0)) break e;
            ((Aa = n),
              (o.timeoutHandle = Zy(
                vy.bind(
                  null,
                  o,
                  i,
                  tn,
                  Es,
                  Ef,
                  n,
                  pn,
                  Ur,
                  wi,
                  Wa,
                  d,
                  "Throttled",
                  -0,
                  0,
                ),
                c,
              )));
            break e;
          }
          vy(o, i, tn, Es, Ef, n, pn, Ur, wi, Wa, d, null, -0, 0);
        }
      }
      break;
    } while (!0);
    aa(e);
  }
  function vy(e, n, i, o, c, d, m, _, R, I, K, ee, $, P) {
    if (
      ((e.timeoutHandle = -1),
      (ee = n.subtreeFlags),
      ee & 8192 || (ee & 16785408) === 16785408)
    ) {
      ((ee = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: on,
      }),
        cy(n, d, ee));
      var we =
        (d & 62914560) === d ? bs - At() : (d & 4194048) === d ? hy - At() : 0;
      if (((we = mE(ee, we)), we !== null)) {
        ((Aa = d),
          (e.cancelPendingCommit = we(
            Cy.bind(null, e, n, d, i, o, c, m, _, R, K, ee, null, $, P),
          )),
          ar(e, d, m, !I));
        return;
      }
    }
    Cy(e, n, d, i, o, c, m, _, R);
  }
  function N1(e) {
    for (var n = e; ; ) {
      var i = n.tag;
      if (
        (i === 0 || i === 11 || i === 15) &&
        n.flags & 16384 &&
        ((i = n.updateQueue), i !== null && ((i = i.stores), i !== null))
      )
        for (var o = 0; o < i.length; o++) {
          var c = i[o],
            d = c.getSnapshot;
          c = c.value;
          try {
            if (!sn(d(), c)) return !1;
          } catch {
            return !1;
          }
        }
      if (((i = n.child), n.subtreeFlags & 16384 && i !== null))
        ((i.return = n), (n = i));
      else {
        if (n === e) break;
        for (; n.sibling === null; ) {
          if (n.return === null || n.return === e) return !0;
          n = n.return;
        }
        ((n.sibling.return = n.return), (n = n.sibling));
      }
    }
    return !0;
  }
  function ar(e, n, i, o) {
    ((n &= ~Sf),
      (n &= ~Ur),
      (e.suspendedLanes |= n),
      (e.pingedLanes &= ~n),
      o && (e.warmLanes |= n),
      (o = e.expirationTimes));
    for (var c = n; 0 < c; ) {
      var d = 31 - be(c),
        m = 1 << d;
      ((o[d] = -1), (c &= ~m));
    }
    i !== 0 && Ro(e, i, n);
  }
  function _s() {
    return (Je & 6) === 0 ? (Zl(0), !1) : !0;
  }
  function xf() {
    if (Fe !== null) {
      if (et === 0) var e = Fe.return;
      else ((e = Fe), (ma = Rr = null), Ic(e), (gi = null), (kl = 0), (e = Fe));
      for (; e !== null; ) (Xg(e.alternate, e), (e = e.return));
      Fe = null;
    }
  }
  function xi(e, n) {
    var i = e.timeoutHandle;
    (i !== -1 && ((e.timeoutHandle = -1), W1(i)),
      (i = e.cancelPendingCommit),
      i !== null && ((e.cancelPendingCommit = null), i()),
      (Aa = 0),
      xf(),
      (lt = e),
      (Fe = i = ga(e.current, null)),
      (He = n),
      (et = 0),
      (dn = null),
      (Wa = !1),
      (_i = Ye(e, n)),
      (bf = !1),
      (wi = pn = Sf = Ur = er = gt = 0),
      (tn = ql = null),
      (Ef = !1),
      (n & 8) !== 0 && (n |= n & 32));
    var o = e.entangledLanes;
    if (o !== 0)
      for (e = e.entanglements, o &= n; 0 < o; ) {
        var c = 31 - be(o),
          d = 1 << c;
        ((n |= e[c]), (o &= ~d));
      }
    return ((Ta = n), Vo(), i);
  }
  function by(e, n) {
    ((Me = null),
      (M.H = Ul),
      n === hi || n === Qo
        ? ((n = jh()), (et = 3))
        : n === Ac
          ? ((n = jh()), (et = 4))
          : (et =
              n === nf
                ? 8
                : n !== null &&
                    typeof n == "object" &&
                    typeof n.then == "function"
                  ? 6
                  : 1),
      (dn = n),
      Fe === null && ((gt = 1), fs(e, En(n, e.current))));
  }
  function Sy() {
    var e = cn.current;
    return e === null
      ? !0
      : (He & 4194048) === He
        ? xn === null
        : (He & 62914560) === He || (He & 536870912) !== 0
          ? e === xn
          : !1;
  }
  function Ey() {
    var e = M.H;
    return ((M.H = Ul), e === null ? Ul : e);
  }
  function _y() {
    var e = M.A;
    return ((M.A = D1), e);
  }
  function ws() {
    ((gt = 4),
      Wa || ((He & 4194048) !== He && cn.current !== null) || (_i = !0),
      ((er & 134217727) === 0 && (Ur & 134217727) === 0) ||
        lt === null ||
        ar(lt, He, pn, !1));
  }
  function Cf(e, n, i) {
    var o = Je;
    Je |= 2;
    var c = Ey(),
      d = _y();
    ((lt !== e || He !== n) && ((Es = null), xi(e, n)), (n = !1));
    var m = gt;
    e: do
      try {
        if (et !== 0 && Fe !== null) {
          var _ = Fe,
            R = dn;
          switch (et) {
            case 8:
              (xf(), (m = 6));
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              cn.current === null && (n = !0);
              var I = et;
              if (((et = 0), (dn = null), Ci(e, _, R, I), i && _i)) {
                m = 0;
                break e;
              }
              break;
            default:
              ((I = et), (et = 0), (dn = null), Ci(e, _, R, I));
          }
        }
        (M1(), (m = gt));
        break;
      } catch (K) {
        by(e, K);
      }
    while (!0);
    return (
      n && e.shellSuspendCounter++,
      (ma = Rr = null),
      (Je = o),
      (M.H = c),
      (M.A = d),
      Fe === null && ((lt = null), (He = 0), Vo()),
      m
    );
  }
  function M1() {
    for (; Fe !== null; ) wy(Fe);
  }
  function j1(e, n) {
    var i = Je;
    Je |= 2;
    var o = Ey(),
      c = _y();
    lt !== e || He !== n
      ? ((Es = null), (Ss = At() + 500), xi(e, n))
      : (_i = Ye(e, n));
    e: do
      try {
        if (et !== 0 && Fe !== null) {
          n = Fe;
          var d = dn;
          t: switch (et) {
            case 1:
              ((et = 0), (dn = null), Ci(e, n, d, 1));
              break;
            case 2:
            case 9:
              if (Nh(d)) {
                ((et = 0), (dn = null), Oy(n));
                break;
              }
              ((n = function () {
                ((et !== 2 && et !== 9) || lt !== e || (et = 7), aa(e));
              }),
                d.then(n, n));
              break e;
            case 3:
              et = 7;
              break e;
            case 4:
              et = 5;
              break e;
            case 7:
              Nh(d)
                ? ((et = 0), (dn = null), Oy(n))
                : ((et = 0), (dn = null), Ci(e, n, d, 7));
              break;
            case 5:
              var m = null;
              switch (Fe.tag) {
                case 26:
                  m = Fe.memoizedState;
                case 5:
                case 27:
                  var _ = Fe;
                  if (m ? um(m) : _.stateNode.complete) {
                    ((et = 0), (dn = null));
                    var R = _.sibling;
                    if (R !== null) Fe = R;
                    else {
                      var I = _.return;
                      I !== null ? ((Fe = I), Os(I)) : (Fe = null);
                    }
                    break t;
                  }
              }
              ((et = 0), (dn = null), Ci(e, n, d, 5));
              break;
            case 6:
              ((et = 0), (dn = null), Ci(e, n, d, 6));
              break;
            case 8:
              (xf(), (gt = 6));
              break e;
            default:
              throw Error(l(462));
          }
        }
        z1();
        break;
      } catch (K) {
        by(e, K);
      }
    while (!0);
    return (
      (ma = Rr = null),
      (M.H = o),
      (M.A = c),
      (Je = i),
      Fe !== null ? 0 : ((lt = null), (He = 0), Vo(), gt)
    );
  }
  function z1() {
    for (; Fe !== null && !qn(); ) wy(Fe);
  }
  function wy(e) {
    var n = Yg(e.alternate, e, Ta);
    ((e.memoizedProps = e.pendingProps), n === null ? Os(e) : (Fe = n));
  }
  function Oy(e) {
    var n = e,
      i = n.alternate;
    switch (n.tag) {
      case 15:
      case 0:
        n = Hg(i, n, n.pendingProps, n.type, void 0, He);
        break;
      case 11:
        n = Hg(i, n, n.pendingProps, n.type.render, n.ref, He);
        break;
      case 5:
        Ic(n);
      default:
        (Xg(i, n), (n = Fe = _h(n, Ta)), (n = Yg(i, n, Ta)));
    }
    ((e.memoizedProps = e.pendingProps), n === null ? Os(e) : (Fe = n));
  }
  function Ci(e, n, i, o) {
    ((ma = Rr = null), Ic(n), (gi = null), (kl = 0));
    var c = n.return;
    try {
      if (O1(e, c, n, i, He)) {
        ((gt = 1), fs(e, En(i, e.current)), (Fe = null));
        return;
      }
    } catch (d) {
      if (c !== null) throw ((Fe = c), d);
      ((gt = 1), fs(e, En(i, e.current)), (Fe = null));
      return;
    }
    n.flags & 32768
      ? (Pe || o === 1
          ? (e = !0)
          : _i || (He & 536870912) !== 0
            ? (e = !1)
            : ((Wa = e = !0),
              (o === 2 || o === 9 || o === 3 || o === 6) &&
                ((o = cn.current),
                o !== null && o.tag === 13 && (o.flags |= 16384))),
        xy(n, e))
      : Os(n);
  }
  function Os(e) {
    var n = e;
    do {
      if ((n.flags & 32768) !== 0) {
        xy(n, Wa);
        return;
      }
      e = n.return;
      var i = T1(n.alternate, n, Ta);
      if (i !== null) {
        Fe = i;
        return;
      }
      if (((n = n.sibling), n !== null)) {
        Fe = n;
        return;
      }
      Fe = n = e;
    } while (n !== null);
    gt === 0 && (gt = 5);
  }
  function xy(e, n) {
    do {
      var i = A1(e.alternate, e);
      if (i !== null) {
        ((i.flags &= 32767), (Fe = i));
        return;
      }
      if (
        ((i = e.return),
        i !== null &&
          ((i.flags |= 32768), (i.subtreeFlags = 0), (i.deletions = null)),
        !n && ((e = e.sibling), e !== null))
      ) {
        Fe = e;
        return;
      }
      Fe = e = i;
    } while (e !== null);
    ((gt = 6), (Fe = null));
  }
  function Cy(e, n, i, o, c, d, m, _, R) {
    e.cancelPendingCommit = null;
    do xs();
    while (Tt !== 0);
    if ((Je & 6) !== 0) throw Error(l(327));
    if (n !== null) {
      if (n === e.current) throw Error(l(177));
      if (
        ((d = n.lanes | n.childLanes),
        (d |= pc),
        rl(e, i, d, m, _, R),
        e === lt && ((Fe = lt = null), (He = 0)),
        (Oi = n),
        (nr = e),
        (Aa = i),
        (_f = d),
        (wf = c),
        (gy = o),
        (n.subtreeFlags & 10256) !== 0 || (n.flags & 10256) !== 0
          ? ((e.callbackNode = null),
            (e.callbackPriority = 0),
            I1(Mn, function () {
              return (Dy(), null);
            }))
          : ((e.callbackNode = null), (e.callbackPriority = 0)),
        (o = (n.flags & 13878) !== 0),
        (n.subtreeFlags & 13878) !== 0 || o)
      ) {
        ((o = M.T), (M.T = null), (c = Z.p), (Z.p = 2), (m = Je), (Je |= 4));
        try {
          R1(e, n, i);
        } finally {
          ((Je = m), (Z.p = c), (M.T = o));
        }
      }
      ((Tt = 1), Ty(), Ay(), Ry());
    }
  }
  function Ty() {
    if (Tt === 1) {
      Tt = 0;
      var e = nr,
        n = Oi,
        i = (n.flags & 13878) !== 0;
      if ((n.subtreeFlags & 13878) !== 0 || i) {
        ((i = M.T), (M.T = null));
        var o = Z.p;
        Z.p = 2;
        var c = Je;
        Je |= 4;
        try {
          oy(n, e);
          var d = Uf,
            m = ph(e.containerInfo),
            _ = d.focusedElem,
            R = d.selectionRange;
          if (
            m !== _ &&
            _ &&
            _.ownerDocument &&
            dh(_.ownerDocument.documentElement, _)
          ) {
            if (R !== null && sc(_)) {
              var I = R.start,
                K = R.end;
              if ((K === void 0 && (K = I), "selectionStart" in _))
                ((_.selectionStart = I),
                  (_.selectionEnd = Math.min(K, _.value.length)));
              else {
                var ee = _.ownerDocument || document,
                  $ = (ee && ee.defaultView) || window;
                if ($.getSelection) {
                  var P = $.getSelection(),
                    we = _.textContent.length,
                    Re = Math.min(R.start, we),
                    it = R.end === void 0 ? Re : Math.min(R.end, we);
                  !P.extend && Re > it && ((m = it), (it = Re), (Re = m));
                  var j = fh(_, Re),
                    D = fh(_, it);
                  if (
                    j &&
                    D &&
                    (P.rangeCount !== 1 ||
                      P.anchorNode !== j.node ||
                      P.anchorOffset !== j.offset ||
                      P.focusNode !== D.node ||
                      P.focusOffset !== D.offset)
                  ) {
                    var F = ee.createRange();
                    (F.setStart(j.node, j.offset),
                      P.removeAllRanges(),
                      Re > it
                        ? (P.addRange(F), P.extend(D.node, D.offset))
                        : (F.setEnd(D.node, D.offset), P.addRange(F)));
                  }
                }
              }
            }
            for (ee = [], P = _; (P = P.parentNode); )
              P.nodeType === 1 &&
                ee.push({ element: P, left: P.scrollLeft, top: P.scrollTop });
            for (
              typeof _.focus == "function" && _.focus(), _ = 0;
              _ < ee.length;
              _++
            ) {
              var J = ee[_];
              ((J.element.scrollLeft = J.left), (J.element.scrollTop = J.top));
            }
          }
          ((Bs = !!Bf), (Uf = Bf = null));
        } finally {
          ((Je = c), (Z.p = o), (M.T = i));
        }
      }
      ((e.current = n), (Tt = 2));
    }
  }
  function Ay() {
    if (Tt === 2) {
      Tt = 0;
      var e = nr,
        n = Oi,
        i = (n.flags & 8772) !== 0;
      if ((n.subtreeFlags & 8772) !== 0 || i) {
        ((i = M.T), (M.T = null));
        var o = Z.p;
        Z.p = 2;
        var c = Je;
        Je |= 4;
        try {
          ny(e, n.alternate, n);
        } finally {
          ((Je = c), (Z.p = o), (M.T = i));
        }
      }
      Tt = 3;
    }
  }
  function Ry() {
    if (Tt === 4 || Tt === 3) {
      ((Tt = 0), bn());
      var e = nr,
        n = Oi,
        i = Aa,
        o = gy;
      (n.subtreeFlags & 10256) !== 0 || (n.flags & 10256) !== 0
        ? (Tt = 5)
        : ((Tt = 0), (Oi = nr = null), ky(e, e.pendingLanes));
      var c = e.pendingLanes;
      if (
        (c === 0 && (tr = null),
        Zn(i),
        (n = n.stateNode),
        X && typeof X.onCommitFiberRoot == "function")
      )
        try {
          X.onCommitFiberRoot(G, n, void 0, (n.current.flags & 128) === 128);
        } catch {}
      if (o !== null) {
        ((n = M.T), (c = Z.p), (Z.p = 2), (M.T = null));
        try {
          for (var d = e.onRecoverableError, m = 0; m < o.length; m++) {
            var _ = o[m];
            d(_.value, { componentStack: _.stack });
          }
        } finally {
          ((M.T = n), (Z.p = c));
        }
      }
      ((Aa & 3) !== 0 && xs(),
        aa(e),
        (c = e.pendingLanes),
        (i & 261930) !== 0 && (c & 42) !== 0
          ? e === Of
            ? Yl++
            : ((Yl = 0), (Of = e))
          : (Yl = 0),
        Zl(0));
    }
  }
  function ky(e, n) {
    (e.pooledCacheLanes &= n) === 0 &&
      ((n = e.pooledCache), n != null && ((e.pooledCache = null), Al(n)));
  }
  function xs() {
    return (Ty(), Ay(), Ry(), Dy());
  }
  function Dy() {
    if (Tt !== 5) return !1;
    var e = nr,
      n = _f;
    _f = 0;
    var i = Zn(Aa),
      o = M.T,
      c = Z.p;
    try {
      ((Z.p = 32 > i ? 32 : i), (M.T = null), (i = wf), (wf = null));
      var d = nr,
        m = Aa;
      if (((Tt = 0), (Oi = nr = null), (Aa = 0), (Je & 6) !== 0))
        throw Error(l(331));
      var _ = Je;
      if (
        ((Je |= 4),
        dy(d.current),
        uy(d, d.current, m, i),
        (Je = _),
        Zl(0, !1),
        X && typeof X.onPostCommitFiberRoot == "function")
      )
        try {
          X.onPostCommitFiberRoot(G, d);
        } catch {}
      return !0;
    } finally {
      ((Z.p = c), (M.T = o), ky(e, n));
    }
  }
  function Ly(e, n, i) {
    ((n = En(i, n)),
      (n = tf(e.stateNode, n, 2)),
      (e = Xa(e, n, 2)),
      e !== null && (Nt(e, 2), aa(e)));
  }
  function tt(e, n, i) {
    if (e.tag === 3) Ly(e, e, i);
    else
      for (; n !== null; ) {
        if (n.tag === 3) {
          Ly(n, e, i);
          break;
        } else if (n.tag === 1) {
          var o = n.stateNode;
          if (
            typeof n.type.getDerivedStateFromError == "function" ||
            (typeof o.componentDidCatch == "function" &&
              (tr === null || !tr.has(o)))
          ) {
            ((e = En(i, e)),
              (i = Ng(2)),
              (o = Xa(n, i, 2)),
              o !== null && (Mg(i, o, n, e), Nt(o, 2), aa(o)));
            break;
          }
        }
        n = n.return;
      }
  }
  function Tf(e, n, i) {
    var o = e.pingCache;
    if (o === null) {
      o = e.pingCache = new L1();
      var c = new Set();
      o.set(n, c);
    } else ((c = o.get(n)), c === void 0 && ((c = new Set()), o.set(n, c)));
    c.has(i) ||
      ((bf = !0), c.add(i), (e = B1.bind(null, e, n, i)), n.then(e, e));
  }
  function B1(e, n, i) {
    var o = e.pingCache;
    (o !== null && o.delete(n),
      (e.pingedLanes |= e.suspendedLanes & i),
      (e.warmLanes &= ~i),
      lt === e &&
        (He & i) === i &&
        (gt === 4 || (gt === 3 && (He & 62914560) === He && 300 > At() - bs)
          ? (Je & 2) === 0 && xi(e, 0)
          : (Sf |= i),
        wi === He && (wi = 0)),
      aa(e));
  }
  function Ny(e, n) {
    (n === 0 && (n = $t()), (e = Cr(e, n)), e !== null && (Nt(e, n), aa(e)));
  }
  function U1(e) {
    var n = e.memoizedState,
      i = 0;
    (n !== null && (i = n.retryLane), Ny(e, i));
  }
  function F1(e, n) {
    var i = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var o = e.stateNode,
          c = e.memoizedState;
        c !== null && (i = c.retryLane);
        break;
      case 19:
        o = e.stateNode;
        break;
      case 22:
        o = e.stateNode._retryCache;
        break;
      default:
        throw Error(l(314));
    }
    (o !== null && o.delete(n), Ny(e, i));
  }
  function I1(e, n) {
    return Nn(e, n);
  }
  var Cs = null,
    Ti = null,
    Af = !1,
    Ts = !1,
    Rf = !1,
    rr = 0;
  function aa(e) {
    (e !== Ti &&
      e.next === null &&
      (Ti === null ? (Cs = Ti = e) : (Ti = Ti.next = e)),
      (Ts = !0),
      Af || ((Af = !0), $1()));
  }
  function Zl(e, n) {
    if (!Rf && Ts) {
      Rf = !0;
      do
        for (var i = !1, o = Cs; o !== null; ) {
          if (e !== 0) {
            var c = o.pendingLanes;
            if (c === 0) var d = 0;
            else {
              var m = o.suspendedLanes,
                _ = o.pingedLanes;
              ((d = (1 << (31 - be(42 | e) + 1)) - 1),
                (d &= c & ~(m & ~_)),
                (d = d & 201326741 ? (d & 201326741) | 1 : d ? d | 2 : 0));
            }
            d !== 0 && ((i = !0), By(o, d));
          } else
            ((d = He),
              (d = Ne(
                o,
                o === lt ? d : 0,
                o.cancelPendingCommit !== null || o.timeoutHandle !== -1,
              )),
              (d & 3) === 0 || Ye(o, d) || ((i = !0), By(o, d)));
          o = o.next;
        }
      while (i);
      Rf = !1;
    }
  }
  function H1() {
    My();
  }
  function My() {
    Ts = Af = !1;
    var e = 0;
    rr !== 0 && J1() && (e = rr);
    for (var n = At(), i = null, o = Cs; o !== null; ) {
      var c = o.next,
        d = jy(o, n);
      (d === 0
        ? ((o.next = null),
          i === null ? (Cs = c) : (i.next = c),
          c === null && (Ti = i))
        : ((i = o), (e !== 0 || (d & 3) !== 0) && (Ts = !0)),
        (o = c));
    }
    ((Tt !== 0 && Tt !== 5) || Zl(e), rr !== 0 && (rr = 0));
  }
  function jy(e, n) {
    for (
      var i = e.suspendedLanes,
        o = e.pingedLanes,
        c = e.expirationTimes,
        d = e.pendingLanes & -62914561;
      0 < d;
    ) {
      var m = 31 - be(d),
        _ = 1 << m,
        R = c[m];
      (R === -1
        ? ((_ & i) === 0 || (_ & o) !== 0) && (c[m] = st(_, n))
        : R <= n && (e.expiredLanes |= _),
        (d &= ~_));
    }
    if (
      ((n = lt),
      (i = He),
      (i = Ne(
        e,
        e === n ? i : 0,
        e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
      )),
      (o = e.callbackNode),
      i === 0 ||
        (e === n && (et === 2 || et === 9)) ||
        e.cancelPendingCommit !== null)
    )
      return (
        o !== null && o !== null && Pn(o),
        (e.callbackNode = null),
        (e.callbackPriority = 0)
      );
    if ((i & 3) === 0 || Ye(e, i)) {
      if (((n = i & -i), n === e.callbackPriority)) return n;
      switch ((o !== null && Pn(o), Zn(i))) {
        case 2:
        case 8:
          i = Yn;
          break;
        case 32:
          i = Mn;
          break;
        case 268435456:
          i = vr;
          break;
        default:
          i = Mn;
      }
      return (
        (o = zy.bind(null, e)),
        (i = Nn(i, o)),
        (e.callbackPriority = n),
        (e.callbackNode = i),
        n
      );
    }
    return (
      o !== null && o !== null && Pn(o),
      (e.callbackPriority = 2),
      (e.callbackNode = null),
      2
    );
  }
  function zy(e, n) {
    if (Tt !== 0 && Tt !== 5)
      return ((e.callbackNode = null), (e.callbackPriority = 0), null);
    var i = e.callbackNode;
    if (xs() && e.callbackNode !== i) return null;
    var o = He;
    return (
      (o = Ne(
        e,
        e === lt ? o : 0,
        e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
      )),
      o === 0
        ? null
        : (my(e, o, n),
          jy(e, At()),
          e.callbackNode != null && e.callbackNode === i
            ? zy.bind(null, e)
            : null)
    );
  }
  function By(e, n) {
    if (xs()) return null;
    my(e, n, !0);
  }
  function $1() {
    eE(function () {
      (Je & 6) !== 0 ? Nn(Yr, H1) : My();
    });
  }
  function kf() {
    if (rr === 0) {
      var e = di;
      (e === 0 && ((e = pe), (pe <<= 1), (pe & 261888) === 0 && (pe = 256)),
        (rr = e));
    }
    return rr;
  }
  function Uy(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean"
      ? null
      : typeof e == "function"
        ? e
        : pa("" + e);
  }
  function Fy(e, n) {
    var i = n.ownerDocument.createElement("input");
    return (
      (i.name = n.name),
      (i.value = n.value),
      e.id && i.setAttribute("form", e.id),
      n.parentNode.insertBefore(i, n),
      (e = new FormData(e)),
      i.parentNode.removeChild(i),
      e
    );
  }
  function V1(e, n, i, o, c) {
    if (n === "submit" && i && i.stateNode === c) {
      var d = Uy((c[Vt] || null).action),
        m = o.submitter;
      m &&
        ((n = (n = m[Vt] || null)
          ? Uy(n.formAction)
          : m.getAttribute("formAction")),
        n !== null && ((d = n), (m = null)));
      var _ = new Be("action", "action", null, o, c);
      e.push({
        event: _,
        listeners: [
          {
            instance: null,
            listener: function () {
              if (o.defaultPrevented) {
                if (rr !== 0) {
                  var R = m ? Fy(c, m) : new FormData(c);
                  Xc(
                    i,
                    { pending: !0, data: R, method: c.method, action: d },
                    null,
                    R,
                  );
                }
              } else
                typeof d == "function" &&
                  (_.preventDefault(),
                  (R = m ? Fy(c, m) : new FormData(c)),
                  Xc(
                    i,
                    { pending: !0, data: R, method: c.method, action: d },
                    d,
                    R,
                  ));
            },
            currentTarget: c,
          },
        ],
      });
    }
  }
  for (var Df = 0; Df < dc.length; Df++) {
    var Lf = dc[Df],
      G1 = Lf.toLowerCase(),
      P1 = Lf[0].toUpperCase() + Lf.slice(1);
    Fn(G1, "on" + P1);
  }
  (Fn(yh, "onAnimationEnd"),
    Fn(mh, "onAnimationIteration"),
    Fn(vh, "onAnimationStart"),
    Fn("dblclick", "onDoubleClick"),
    Fn("focusin", "onFocus"),
    Fn("focusout", "onBlur"),
    Fn(o1, "onTransitionRun"),
    Fn(s1, "onTransitionStart"),
    Fn(u1, "onTransitionCancel"),
    Fn(bh, "onTransitionEnd"),
    Ua("onMouseEnter", ["mouseout", "mouseover"]),
    Ua("onMouseLeave", ["mouseout", "mouseover"]),
    Ua("onPointerEnter", ["pointerout", "pointerover"]),
    Ua("onPointerLeave", ["pointerout", "pointerover"]),
    fa(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " ",
      ),
    ),
    fa(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " ",
      ),
    ),
    fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    fa(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" "),
    ),
    fa(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" "),
    ),
    fa(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
    ));
  var Xl =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " ",
      ),
    q1 = new Set(
      "beforetoggle cancel close invalid load scroll scrollend toggle"
        .split(" ")
        .concat(Xl),
    );
  function Iy(e, n) {
    n = (n & 4) !== 0;
    for (var i = 0; i < e.length; i++) {
      var o = e[i],
        c = o.event;
      o = o.listeners;
      e: {
        var d = void 0;
        if (n)
          for (var m = o.length - 1; 0 <= m; m--) {
            var _ = o[m],
              R = _.instance,
              I = _.currentTarget;
            if (((_ = _.listener), R !== d && c.isPropagationStopped()))
              break e;
            ((d = _), (c.currentTarget = I));
            try {
              d(c);
            } catch (K) {
              $o(K);
            }
            ((c.currentTarget = null), (d = R));
          }
        else
          for (m = 0; m < o.length; m++) {
            if (
              ((_ = o[m]),
              (R = _.instance),
              (I = _.currentTarget),
              (_ = _.listener),
              R !== d && c.isPropagationStopped())
            )
              break e;
            ((d = _), (c.currentTarget = I));
            try {
              d(c);
            } catch (K) {
              $o(K);
            }
            ((c.currentTarget = null), (d = R));
          }
      }
    }
  }
  function Ie(e, n) {
    var i = n[ll];
    i === void 0 && (i = n[ll] = new Set());
    var o = e + "__bubble";
    i.has(o) || (Hy(n, e, 2, !1), i.add(o));
  }
  function Nf(e, n, i) {
    var o = 0;
    (n && (o |= 4), Hy(i, e, o, n));
  }
  var As = "_reactListening" + Math.random().toString(36).slice(2);
  function Mf(e) {
    if (!e[As]) {
      ((e[As] = !0),
        Sr.forEach(function (i) {
          i !== "selectionchange" && (q1.has(i) || Nf(i, !1, e), Nf(i, !0, e));
        }));
      var n = e.nodeType === 9 ? e : e.ownerDocument;
      n === null || n[As] || ((n[As] = !0), Nf("selectionchange", !1, n));
    }
  }
  function Hy(e, n, i, o) {
    switch (ym(n)) {
      case 2:
        var c = SE;
        break;
      case 8:
        c = EE;
        break;
      default:
        c = Xf;
    }
    ((i = c.bind(null, n, i, e)),
      (c = void 0),
      !ei ||
        (n !== "touchstart" && n !== "touchmove" && n !== "wheel") ||
        (c = !0),
      o
        ? c !== void 0
          ? e.addEventListener(n, i, { capture: !0, passive: c })
          : e.addEventListener(n, i, !0)
        : c !== void 0
          ? e.addEventListener(n, i, { passive: c })
          : e.addEventListener(n, i, !1));
  }
  function jf(e, n, i, o, c) {
    var d = o;
    if ((n & 1) === 0 && (n & 2) === 0 && o !== null)
      e: for (;;) {
        if (o === null) return;
        var m = o.tag;
        if (m === 3 || m === 4) {
          var _ = o.stateNode.containerInfo;
          if (_ === c) break;
          if (m === 4)
            for (m = o.return; m !== null; ) {
              var R = m.tag;
              if ((R === 3 || R === 4) && m.stateNode.containerInfo === c)
                return;
              m = m.return;
            }
          for (; _ !== null; ) {
            if (((m = Kn(_)), m === null)) return;
            if (((R = m.tag), R === 5 || R === 6 || R === 26 || R === 27)) {
              o = d = m;
              continue e;
            }
            _ = _.parentNode;
          }
        }
        o = o.return;
      }
    Wn(function () {
      var I = d,
        K = _r(i),
        ee = [];
      e: {
        var $ = Sh.get(e);
        if ($ !== void 0) {
          var P = Be,
            we = e;
          switch (e) {
            case "keypress":
              if (ni(i) === 0) break e;
            case "keydown":
            case "keyup":
              P = FS;
              break;
            case "focusin":
              ((we = "focus"), (P = ac));
              break;
            case "focusout":
              ((we = "blur"), (P = ac));
              break;
            case "beforeblur":
            case "afterblur":
              P = ac;
              break;
            case "click":
              if (i.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              P = $a;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              P = Sl;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              P = $S;
              break;
            case yh:
            case mh:
            case vh:
              P = kS;
              break;
            case bh:
              P = GS;
              break;
            case "scroll":
            case "scrollend":
              P = ot;
              break;
            case "wheel":
              P = qS;
              break;
            case "copy":
            case "cut":
            case "paste":
              P = LS;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              P = Qp;
              break;
            case "toggle":
            case "beforetoggle":
              P = ZS;
          }
          var Re = (n & 4) !== 0,
            it = !Re && (e === "scroll" || e === "scrollend"),
            j = Re ? ($ !== null ? $ + "Capture" : null) : $;
          Re = [];
          for (var D = I, F; D !== null; ) {
            var J = D;
            if (
              ((F = J.stateNode),
              (J = J.tag),
              (J !== 5 && J !== 26 && J !== 27) ||
                F === null ||
                j === null ||
                ((J = zn(D, j)), J != null && Re.push(Kl(D, J, F))),
              it)
            )
              break;
            D = D.return;
          }
          0 < Re.length &&
            (($ = new P($, we, null, i, K)),
            ee.push({ event: $, listeners: Re }));
        }
      }
      if ((n & 7) === 0) {
        e: {
          if (
            (($ = e === "mouseover" || e === "pointerover"),
            (P = e === "mouseout" || e === "pointerout"),
            $ &&
              i !== Er &&
              (we = i.relatedTarget || i.fromElement) &&
              (Kn(we) || we[ln]))
          )
            break e;
          if (
            (P || $) &&
            (($ =
              K.window === K
                ? K
                : ($ = K.ownerDocument)
                  ? $.defaultView || $.parentWindow
                  : window),
            P
              ? ((we = i.relatedTarget || i.toElement),
                (P = I),
                (we = we ? Kn(we) : null),
                we !== null &&
                  ((it = u(we)),
                  (Re = we.tag),
                  we !== it || (Re !== 5 && Re !== 27 && Re !== 6)) &&
                  (we = null))
              : ((P = null), (we = I)),
            P !== we)
          ) {
            if (
              ((Re = $a),
              (J = "onMouseLeave"),
              (j = "onMouseEnter"),
              (D = "mouse"),
              (e === "pointerout" || e === "pointerover") &&
                ((Re = Qp),
                (J = "onPointerLeave"),
                (j = "onPointerEnter"),
                (D = "pointer")),
              (it = P == null ? $ : Qn(P)),
              (F = we == null ? $ : Qn(we)),
              ($ = new Re(J, D + "leave", P, i, K)),
              ($.target = it),
              ($.relatedTarget = F),
              (J = null),
              Kn(K) === I &&
                ((Re = new Re(j, D + "enter", we, i, K)),
                (Re.target = F),
                (Re.relatedTarget = it),
                (J = Re)),
              (it = J),
              P && we)
            )
              t: {
                for (Re = Y1, j = P, D = we, F = 0, J = j; J; J = Re(J)) F++;
                J = 0;
                for (var Ae = D; Ae; Ae = Re(Ae)) J++;
                for (; 0 < F - J; ) ((j = Re(j)), F--);
                for (; 0 < J - F; ) ((D = Re(D)), J--);
                for (; F--; ) {
                  if (j === D || (D !== null && j === D.alternate)) {
                    Re = j;
                    break t;
                  }
                  ((j = Re(j)), (D = Re(D)));
                }
                Re = null;
              }
            else Re = null;
            (P !== null && $y(ee, $, P, Re, !1),
              we !== null && it !== null && $y(ee, it, we, Re, !0));
          }
        }
        e: {
          if (
            (($ = I ? Qn(I) : window),
            (P = $.nodeName && $.nodeName.toLowerCase()),
            P === "select" || (P === "input" && $.type === "file"))
          )
            var Xe = ih;
          else if (ah($))
            if (lh) Xe = r1;
            else {
              Xe = n1;
              var xe = t1;
            }
          else
            ((P = $.nodeName),
              !P ||
              P.toLowerCase() !== "input" ||
              ($.type !== "checkbox" && $.type !== "radio")
                ? I && yl(I.elementType) && (Xe = ih)
                : (Xe = a1));
          if (Xe && (Xe = Xe(e, I))) {
            rh(ee, Xe, i, K);
            break e;
          }
          (xe && xe(e, $, I),
            e === "focusout" &&
              I &&
              $.type === "number" &&
              I.memoizedProps.value != null &&
              hl($, "number", $.value));
        }
        switch (((xe = I ? Qn(I) : window), e)) {
          case "focusin":
            (ah(xe) || xe.contentEditable === "true") &&
              ((ri = xe), (uc = I), (xl = null));
            break;
          case "focusout":
            xl = uc = ri = null;
            break;
          case "mousedown":
            cc = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            ((cc = !1), hh(ee, i, K));
            break;
          case "selectionchange":
            if (l1) break;
          case "keydown":
          case "keyup":
            hh(ee, i, K);
        }
        var ze;
        if (ic)
          e: {
            switch (e) {
              case "compositionstart":
                var $e = "onCompositionStart";
                break e;
              case "compositionend":
                $e = "onCompositionEnd";
                break e;
              case "compositionupdate":
                $e = "onCompositionUpdate";
                break e;
            }
            $e = void 0;
          }
        else
          ai
            ? th(e, i) && ($e = "onCompositionEnd")
            : e === "keydown" &&
              i.keyCode === 229 &&
              ($e = "onCompositionStart");
        ($e &&
          (Jp &&
            i.locale !== "ko" &&
            (ai || $e !== "onCompositionStart"
              ? $e === "onCompositionEnd" && ai && (ze = vl())
              : ((Un = K),
                (ml = "value" in Un ? Un.value : Un.textContent),
                (ai = !0))),
          (xe = Rs(I, $e)),
          0 < xe.length &&
            (($e = new Kp($e, e, null, i, K)),
            ee.push({ event: $e, listeners: xe }),
            ze
              ? ($e.data = ze)
              : ((ze = nh(i)), ze !== null && ($e.data = ze)))),
          (ze = KS ? QS(e, i) : JS(e, i)) &&
            (($e = Rs(I, "onBeforeInput")),
            0 < $e.length &&
              ((xe = new Kp("onBeforeInput", "beforeinput", null, i, K)),
              ee.push({ event: xe, listeners: $e }),
              (xe.data = ze))),
          V1(ee, e, I, i, K));
      }
      Iy(ee, n);
    });
  }
  function Kl(e, n, i) {
    return { instance: e, listener: n, currentTarget: i };
  }
  function Rs(e, n) {
    for (var i = n + "Capture", o = []; e !== null; ) {
      var c = e,
        d = c.stateNode;
      if (
        ((c = c.tag),
        (c !== 5 && c !== 26 && c !== 27) ||
          d === null ||
          ((c = zn(e, i)),
          c != null && o.unshift(Kl(e, c, d)),
          (c = zn(e, n)),
          c != null && o.push(Kl(e, c, d))),
        e.tag === 3)
      )
        return o;
      e = e.return;
    }
    return [];
  }
  function Y1(e) {
    if (e === null) return null;
    do e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function $y(e, n, i, o, c) {
    for (var d = n._reactName, m = []; i !== null && i !== o; ) {
      var _ = i,
        R = _.alternate,
        I = _.stateNode;
      if (((_ = _.tag), R !== null && R === o)) break;
      ((_ !== 5 && _ !== 26 && _ !== 27) ||
        I === null ||
        ((R = I),
        c
          ? ((I = zn(i, d)), I != null && m.unshift(Kl(i, I, R)))
          : c || ((I = zn(i, d)), I != null && m.push(Kl(i, I, R)))),
        (i = i.return));
    }
    m.length !== 0 && e.push({ event: n, listeners: m });
  }
  var Z1 = /\r\n?/g,
    X1 = /\u0000|\uFFFD/g;
  function Vy(e) {
    return (typeof e == "string" ? e : "" + e)
      .replace(
        Z1,
        `
`,
      )
      .replace(X1, "");
  }
  function Gy(e, n) {
    return ((n = Vy(n)), Vy(e) === n);
  }
  function rt(e, n, i, o, c, d) {
    switch (i) {
      case "children":
        typeof o == "string"
          ? n === "body" || (n === "textarea" && o === "") || Ia(e, o)
          : (typeof o == "number" || typeof o == "bigint") &&
            n !== "body" &&
            Ia(e, "" + o);
        break;
      case "className":
        Kr(e, "class", o);
        break;
      case "tabIndex":
        Kr(e, "tabindex", o);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Kr(e, i, o);
        break;
      case "style":
        Qr(e, o, d);
        break;
      case "data":
        if (n !== "object") {
          Kr(e, "data", o);
          break;
        }
      case "src":
      case "href":
        if (o === "" && (n !== "a" || i !== "href")) {
          e.removeAttribute(i);
          break;
        }
        if (
          o == null ||
          typeof o == "function" ||
          typeof o == "symbol" ||
          typeof o == "boolean"
        ) {
          e.removeAttribute(i);
          break;
        }
        ((o = pa("" + o)), e.setAttribute(i, o));
        break;
      case "action":
      case "formAction":
        if (typeof o == "function") {
          e.setAttribute(
            i,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')",
          );
          break;
        } else
          typeof d == "function" &&
            (i === "formAction"
              ? (n !== "input" && rt(e, n, "name", c.name, c, null),
                rt(e, n, "formEncType", c.formEncType, c, null),
                rt(e, n, "formMethod", c.formMethod, c, null),
                rt(e, n, "formTarget", c.formTarget, c, null))
              : (rt(e, n, "encType", c.encType, c, null),
                rt(e, n, "method", c.method, c, null),
                rt(e, n, "target", c.target, c, null)));
        if (o == null || typeof o == "symbol" || typeof o == "boolean") {
          e.removeAttribute(i);
          break;
        }
        ((o = pa("" + o)), e.setAttribute(i, o));
        break;
      case "onClick":
        o != null && (e.onclick = on);
        break;
      case "onScroll":
        o != null && Ie("scroll", e);
        break;
      case "onScrollEnd":
        o != null && Ie("scrollend", e);
        break;
      case "dangerouslySetInnerHTML":
        if (o != null) {
          if (typeof o != "object" || !("__html" in o)) throw Error(l(61));
          if (((i = o.__html), i != null)) {
            if (c.children != null) throw Error(l(60));
            e.innerHTML = i;
          }
        }
        break;
      case "multiple":
        e.multiple = o && typeof o != "function" && typeof o != "symbol";
        break;
      case "muted":
        e.muted = o && typeof o != "function" && typeof o != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (
          o == null ||
          typeof o == "function" ||
          typeof o == "boolean" ||
          typeof o == "symbol"
        ) {
          e.removeAttribute("xlink:href");
          break;
        }
        ((i = pa("" + o)),
          e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", i));
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        o != null && typeof o != "function" && typeof o != "symbol"
          ? e.setAttribute(i, "" + o)
          : e.removeAttribute(i);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        o && typeof o != "function" && typeof o != "symbol"
          ? e.setAttribute(i, "")
          : e.removeAttribute(i);
        break;
      case "capture":
      case "download":
        o === !0
          ? e.setAttribute(i, "")
          : o !== !1 &&
              o != null &&
              typeof o != "function" &&
              typeof o != "symbol"
            ? e.setAttribute(i, o)
            : e.removeAttribute(i);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        o != null &&
        typeof o != "function" &&
        typeof o != "symbol" &&
        !isNaN(o) &&
        1 <= o
          ? e.setAttribute(i, o)
          : e.removeAttribute(i);
        break;
      case "rowSpan":
      case "start":
        o == null || typeof o == "function" || typeof o == "symbol" || isNaN(o)
          ? e.removeAttribute(i)
          : e.setAttribute(i, o);
        break;
      case "popover":
        (Ie("beforetoggle", e), Ie("toggle", e), Xr(e, "popover", o));
        break;
      case "xlinkActuate":
        jn(e, "http://www.w3.org/1999/xlink", "xlink:actuate", o);
        break;
      case "xlinkArcrole":
        jn(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", o);
        break;
      case "xlinkRole":
        jn(e, "http://www.w3.org/1999/xlink", "xlink:role", o);
        break;
      case "xlinkShow":
        jn(e, "http://www.w3.org/1999/xlink", "xlink:show", o);
        break;
      case "xlinkTitle":
        jn(e, "http://www.w3.org/1999/xlink", "xlink:title", o);
        break;
      case "xlinkType":
        jn(e, "http://www.w3.org/1999/xlink", "xlink:type", o);
        break;
      case "xmlBase":
        jn(e, "http://www.w3.org/XML/1998/namespace", "xml:base", o);
        break;
      case "xmlLang":
        jn(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", o);
        break;
      case "xmlSpace":
        jn(e, "http://www.w3.org/XML/1998/namespace", "xml:space", o);
        break;
      case "is":
        Xr(e, "is", o);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < i.length) ||
          (i[0] !== "o" && i[0] !== "O") ||
          (i[1] !== "n" && i[1] !== "N")) &&
          ((i = tc.get(i) || i), Xr(e, i, o));
    }
  }
  function zf(e, n, i, o, c, d) {
    switch (i) {
      case "style":
        Qr(e, o, d);
        break;
      case "dangerouslySetInnerHTML":
        if (o != null) {
          if (typeof o != "object" || !("__html" in o)) throw Error(l(61));
          if (((i = o.__html), i != null)) {
            if (c.children != null) throw Error(l(60));
            e.innerHTML = i;
          }
        }
        break;
      case "children":
        typeof o == "string"
          ? Ia(e, o)
          : (typeof o == "number" || typeof o == "bigint") && Ia(e, "" + o);
        break;
      case "onScroll":
        o != null && Ie("scroll", e);
        break;
      case "onScrollEnd":
        o != null && Ie("scrollend", e);
        break;
      case "onClick":
        o != null && (e.onclick = on);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!sl.hasOwnProperty(i))
          e: {
            if (
              i[0] === "o" &&
              i[1] === "n" &&
              ((c = i.endsWith("Capture")),
              (n = i.slice(2, c ? i.length - 7 : void 0)),
              (d = e[Vt] || null),
              (d = d != null ? d[i] : null),
              typeof d == "function" && e.removeEventListener(n, d, c),
              typeof o == "function")
            ) {
              (typeof d != "function" &&
                d !== null &&
                (i in e
                  ? (e[i] = null)
                  : e.hasAttribute(i) && e.removeAttribute(i)),
                e.addEventListener(n, o, c));
              break e;
            }
            i in e
              ? (e[i] = o)
              : o === !0
                ? e.setAttribute(i, "")
                : Xr(e, i, o);
          }
    }
  }
  function Ut(e, n, i) {
    switch (n) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        (Ie("error", e), Ie("load", e));
        var o = !1,
          c = !1,
          d;
        for (d in i)
          if (i.hasOwnProperty(d)) {
            var m = i[d];
            if (m != null)
              switch (d) {
                case "src":
                  o = !0;
                  break;
                case "srcSet":
                  c = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(l(137, n));
                default:
                  rt(e, n, d, m, i, null);
              }
          }
        (c && rt(e, n, "srcSet", i.srcSet, i, null),
          o && rt(e, n, "src", i.src, i, null));
        return;
      case "input":
        Ie("invalid", e);
        var _ = (d = m = c = null),
          R = null,
          I = null;
        for (o in i)
          if (i.hasOwnProperty(o)) {
            var K = i[o];
            if (K != null)
              switch (o) {
                case "name":
                  c = K;
                  break;
                case "type":
                  m = K;
                  break;
                case "checked":
                  R = K;
                  break;
                case "defaultChecked":
                  I = K;
                  break;
                case "value":
                  d = K;
                  break;
                case "defaultValue":
                  _ = K;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (K != null) throw Error(l(137, n));
                  break;
                default:
                  rt(e, n, o, K, i, null);
              }
          }
        pl(e, d, _, R, I, m, c, !1);
        return;
      case "select":
        (Ie("invalid", e), (o = m = d = null));
        for (c in i)
          if (i.hasOwnProperty(c) && ((_ = i[c]), _ != null))
            switch (c) {
              case "value":
                d = _;
                break;
              case "defaultValue":
                m = _;
                break;
              case "multiple":
                o = _;
              default:
                rt(e, n, c, _, i, null);
            }
        ((n = d),
          (i = m),
          (e.multiple = !!o),
          n != null ? Fa(e, !!o, n, !1) : i != null && Fa(e, !!o, i, !0));
        return;
      case "textarea":
        (Ie("invalid", e), (d = c = o = null));
        for (m in i)
          if (i.hasOwnProperty(m) && ((_ = i[m]), _ != null))
            switch (m) {
              case "value":
                o = _;
                break;
              case "defaultValue":
                c = _;
                break;
              case "children":
                d = _;
                break;
              case "dangerouslySetInnerHTML":
                if (_ != null) throw Error(l(91));
                break;
              default:
                rt(e, n, m, _, i, null);
            }
        gl(e, o, c, d);
        return;
      case "option":
        for (R in i)
          if (i.hasOwnProperty(R) && ((o = i[R]), o != null))
            switch (R) {
              case "selected":
                e.selected =
                  o && typeof o != "function" && typeof o != "symbol";
                break;
              default:
                rt(e, n, R, o, i, null);
            }
        return;
      case "dialog":
        (Ie("beforetoggle", e),
          Ie("toggle", e),
          Ie("cancel", e),
          Ie("close", e));
        break;
      case "iframe":
      case "object":
        Ie("load", e);
        break;
      case "video":
      case "audio":
        for (o = 0; o < Xl.length; o++) Ie(Xl[o], e);
        break;
      case "image":
        (Ie("error", e), Ie("load", e));
        break;
      case "details":
        Ie("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        (Ie("error", e), Ie("load", e));
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (I in i)
          if (i.hasOwnProperty(I) && ((o = i[I]), o != null))
            switch (I) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(l(137, n));
              default:
                rt(e, n, I, o, i, null);
            }
        return;
      default:
        if (yl(n)) {
          for (K in i)
            i.hasOwnProperty(K) &&
              ((o = i[K]), o !== void 0 && zf(e, n, K, o, i, void 0));
          return;
        }
    }
    for (_ in i)
      i.hasOwnProperty(_) && ((o = i[_]), o != null && rt(e, n, _, o, i, null));
  }
  function K1(e, n, i, o) {
    switch (n) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var c = null,
          d = null,
          m = null,
          _ = null,
          R = null,
          I = null,
          K = null;
        for (P in i) {
          var ee = i[P];
          if (i.hasOwnProperty(P) && ee != null)
            switch (P) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                R = ee;
              default:
                o.hasOwnProperty(P) || rt(e, n, P, null, o, ee);
            }
        }
        for (var $ in o) {
          var P = o[$];
          if (((ee = i[$]), o.hasOwnProperty($) && (P != null || ee != null)))
            switch ($) {
              case "type":
                d = P;
                break;
              case "name":
                c = P;
                break;
              case "checked":
                I = P;
                break;
              case "defaultChecked":
                K = P;
                break;
              case "value":
                m = P;
                break;
              case "defaultValue":
                _ = P;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (P != null) throw Error(l(137, n));
                break;
              default:
                P !== ee && rt(e, n, $, P, o, ee);
            }
        }
        dl(e, m, _, R, I, K, d, c);
        return;
      case "select":
        P = m = _ = $ = null;
        for (d in i)
          if (((R = i[d]), i.hasOwnProperty(d) && R != null))
            switch (d) {
              case "value":
                break;
              case "multiple":
                P = R;
              default:
                o.hasOwnProperty(d) || rt(e, n, d, null, o, R);
            }
        for (c in o)
          if (
            ((d = o[c]),
            (R = i[c]),
            o.hasOwnProperty(c) && (d != null || R != null))
          )
            switch (c) {
              case "value":
                $ = d;
                break;
              case "defaultValue":
                _ = d;
                break;
              case "multiple":
                m = d;
              default:
                d !== R && rt(e, n, c, d, o, R);
            }
        ((n = _),
          (i = m),
          (o = P),
          $ != null
            ? Fa(e, !!i, $, !1)
            : !!o != !!i &&
              (n != null ? Fa(e, !!i, n, !0) : Fa(e, !!i, i ? [] : "", !1)));
        return;
      case "textarea":
        P = $ = null;
        for (_ in i)
          if (
            ((c = i[_]),
            i.hasOwnProperty(_) && c != null && !o.hasOwnProperty(_))
          )
            switch (_) {
              case "value":
                break;
              case "children":
                break;
              default:
                rt(e, n, _, null, o, c);
            }
        for (m in o)
          if (
            ((c = o[m]),
            (d = i[m]),
            o.hasOwnProperty(m) && (c != null || d != null))
          )
            switch (m) {
              case "value":
                $ = c;
                break;
              case "defaultValue":
                P = c;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (c != null) throw Error(l(91));
                break;
              default:
                c !== d && rt(e, n, m, c, o, d);
            }
        Uo(e, $, P);
        return;
      case "option":
        for (var we in i)
          if (
            (($ = i[we]),
            i.hasOwnProperty(we) && $ != null && !o.hasOwnProperty(we))
          )
            switch (we) {
              case "selected":
                e.selected = !1;
                break;
              default:
                rt(e, n, we, null, o, $);
            }
        for (R in o)
          if (
            (($ = o[R]),
            (P = i[R]),
            o.hasOwnProperty(R) && $ !== P && ($ != null || P != null))
          )
            switch (R) {
              case "selected":
                e.selected =
                  $ && typeof $ != "function" && typeof $ != "symbol";
                break;
              default:
                rt(e, n, R, $, o, P);
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var Re in i)
          (($ = i[Re]),
            i.hasOwnProperty(Re) &&
              $ != null &&
              !o.hasOwnProperty(Re) &&
              rt(e, n, Re, null, o, $));
        for (I in o)
          if (
            (($ = o[I]),
            (P = i[I]),
            o.hasOwnProperty(I) && $ !== P && ($ != null || P != null))
          )
            switch (I) {
              case "children":
              case "dangerouslySetInnerHTML":
                if ($ != null) throw Error(l(137, n));
                break;
              default:
                rt(e, n, I, $, o, P);
            }
        return;
      default:
        if (yl(n)) {
          for (var it in i)
            (($ = i[it]),
              i.hasOwnProperty(it) &&
                $ !== void 0 &&
                !o.hasOwnProperty(it) &&
                zf(e, n, it, void 0, o, $));
          for (K in o)
            (($ = o[K]),
              (P = i[K]),
              !o.hasOwnProperty(K) ||
                $ === P ||
                ($ === void 0 && P === void 0) ||
                zf(e, n, K, $, o, P));
          return;
        }
    }
    for (var j in i)
      (($ = i[j]),
        i.hasOwnProperty(j) &&
          $ != null &&
          !o.hasOwnProperty(j) &&
          rt(e, n, j, null, o, $));
    for (ee in o)
      (($ = o[ee]),
        (P = i[ee]),
        !o.hasOwnProperty(ee) ||
          $ === P ||
          ($ == null && P == null) ||
          rt(e, n, ee, $, o, P));
  }
  function Py(e) {
    switch (e) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function Q1() {
    if (typeof performance.getEntriesByType == "function") {
      for (
        var e = 0, n = 0, i = performance.getEntriesByType("resource"), o = 0;
        o < i.length;
        o++
      ) {
        var c = i[o],
          d = c.transferSize,
          m = c.initiatorType,
          _ = c.duration;
        if (d && _ && Py(m)) {
          for (m = 0, _ = c.responseEnd, o += 1; o < i.length; o++) {
            var R = i[o],
              I = R.startTime;
            if (I > _) break;
            var K = R.transferSize,
              ee = R.initiatorType;
            K &&
              Py(ee) &&
              ((R = R.responseEnd), (m += K * (R < _ ? 1 : (_ - I) / (R - I))));
          }
          if ((--o, (n += (8 * (d + m)) / (c.duration / 1e3)), e++, 10 < e))
            break;
        }
      }
      if (0 < e) return n / e / 1e6;
    }
    return navigator.connection &&
      ((e = navigator.connection.downlink), typeof e == "number")
      ? e
      : 5;
  }
  var Bf = null,
    Uf = null;
  function ks(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function qy(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Yy(e, n) {
    if (e === 0)
      switch (n) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return e === 1 && n === "foreignObject" ? 0 : e;
  }
  function Ff(e, n) {
    return (
      e === "textarea" ||
      e === "noscript" ||
      typeof n.children == "string" ||
      typeof n.children == "number" ||
      typeof n.children == "bigint" ||
      (typeof n.dangerouslySetInnerHTML == "object" &&
        n.dangerouslySetInnerHTML !== null &&
        n.dangerouslySetInnerHTML.__html != null)
    );
  }
  var If = null;
  function J1() {
    var e = window.event;
    return e && e.type === "popstate"
      ? e === If
        ? !1
        : ((If = e), !0)
      : ((If = null), !1);
  }
  var Zy = typeof setTimeout == "function" ? setTimeout : void 0,
    W1 = typeof clearTimeout == "function" ? clearTimeout : void 0,
    Xy = typeof Promise == "function" ? Promise : void 0,
    eE =
      typeof queueMicrotask == "function"
        ? queueMicrotask
        : typeof Xy < "u"
          ? function (e) {
              return Xy.resolve(null).then(e).catch(tE);
            }
          : Zy;
  function tE(e) {
    setTimeout(function () {
      throw e;
    });
  }
  function ir(e) {
    return e === "head";
  }
  function Ky(e, n) {
    var i = n,
      o = 0;
    do {
      var c = i.nextSibling;
      if ((e.removeChild(i), c && c.nodeType === 8))
        if (((i = c.data), i === "/$" || i === "/&")) {
          if (o === 0) {
            (e.removeChild(c), Di(n));
            return;
          }
          o--;
        } else if (
          i === "$" ||
          i === "$?" ||
          i === "$~" ||
          i === "$!" ||
          i === "&"
        )
          o++;
        else if (i === "html") Ql(e.ownerDocument.documentElement);
        else if (i === "head") {
          ((i = e.ownerDocument.head), Ql(i));
          for (var d = i.firstChild; d; ) {
            var m = d.nextSibling,
              _ = d.nodeName;
            (d[br] ||
              _ === "SCRIPT" ||
              _ === "STYLE" ||
              (_ === "LINK" && d.rel.toLowerCase() === "stylesheet") ||
              i.removeChild(d),
              (d = m));
          }
        } else i === "body" && Ql(e.ownerDocument.body);
      i = c;
    } while (i);
    Di(n);
  }
  function Qy(e, n) {
    var i = e;
    e = 0;
    do {
      var o = i.nextSibling;
      if (
        (i.nodeType === 1
          ? n
            ? ((i._stashedDisplay = i.style.display),
              (i.style.display = "none"))
            : ((i.style.display = i._stashedDisplay || ""),
              i.getAttribute("style") === "" && i.removeAttribute("style"))
          : i.nodeType === 3 &&
            (n
              ? ((i._stashedText = i.nodeValue), (i.nodeValue = ""))
              : (i.nodeValue = i._stashedText || "")),
        o && o.nodeType === 8)
      )
        if (((i = o.data), i === "/$")) {
          if (e === 0) break;
          e--;
        } else (i !== "$" && i !== "$?" && i !== "$~" && i !== "$!") || e++;
      i = o;
    } while (i);
  }
  function Hf(e) {
    var n = e.firstChild;
    for (n && n.nodeType === 10 && (n = n.nextSibling); n; ) {
      var i = n;
      switch (((n = n.nextSibling), i.nodeName)) {
        case "HTML":
        case "HEAD":
        case "BODY":
          (Hf(i), ol(i));
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (i.rel.toLowerCase() === "stylesheet") continue;
      }
      e.removeChild(i);
    }
  }
  function nE(e, n, i, o) {
    for (; e.nodeType === 1; ) {
      var c = i;
      if (e.nodeName.toLowerCase() !== n.toLowerCase()) {
        if (!o && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
      } else if (o) {
        if (!e[br])
          switch (n) {
            case "meta":
              if (!e.hasAttribute("itemprop")) break;
              return e;
            case "link":
              if (
                ((d = e.getAttribute("rel")),
                d === "stylesheet" && e.hasAttribute("data-precedence"))
              )
                break;
              if (
                d !== c.rel ||
                e.getAttribute("href") !==
                  (c.href == null || c.href === "" ? null : c.href) ||
                e.getAttribute("crossorigin") !==
                  (c.crossOrigin == null ? null : c.crossOrigin) ||
                e.getAttribute("title") !== (c.title == null ? null : c.title)
              )
                break;
              return e;
            case "style":
              if (e.hasAttribute("data-precedence")) break;
              return e;
            case "script":
              if (
                ((d = e.getAttribute("src")),
                (d !== (c.src == null ? null : c.src) ||
                  e.getAttribute("type") !== (c.type == null ? null : c.type) ||
                  e.getAttribute("crossorigin") !==
                    (c.crossOrigin == null ? null : c.crossOrigin)) &&
                  d &&
                  e.hasAttribute("async") &&
                  !e.hasAttribute("itemprop"))
              )
                break;
              return e;
            default:
              return e;
          }
      } else if (n === "input" && e.type === "hidden") {
        var d = c.name == null ? null : "" + c.name;
        if (c.type === "hidden" && e.getAttribute("name") === d) return e;
      } else return e;
      if (((e = Cn(e.nextSibling)), e === null)) break;
    }
    return null;
  }
  function aE(e, n, i) {
    if (n === "") return null;
    for (; e.nodeType !== 3; )
      if (
        ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") &&
          !i) ||
        ((e = Cn(e.nextSibling)), e === null)
      )
        return null;
    return e;
  }
  function Jy(e, n) {
    for (; e.nodeType !== 8; )
      if (
        ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") &&
          !n) ||
        ((e = Cn(e.nextSibling)), e === null)
      )
        return null;
    return e;
  }
  function $f(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function Vf(e) {
    return (
      e.data === "$!" ||
      (e.data === "$?" && e.ownerDocument.readyState !== "loading")
    );
  }
  function rE(e, n) {
    var i = e.ownerDocument;
    if (e.data === "$~") e._reactRetry = n;
    else if (e.data !== "$?" || i.readyState !== "loading") n();
    else {
      var o = function () {
        (n(), i.removeEventListener("DOMContentLoaded", o));
      };
      (i.addEventListener("DOMContentLoaded", o), (e._reactRetry = o));
    }
  }
  function Cn(e) {
    for (; e != null; e = e.nextSibling) {
      var n = e.nodeType;
      if (n === 1 || n === 3) break;
      if (n === 8) {
        if (
          ((n = e.data),
          n === "$" ||
            n === "$!" ||
            n === "$?" ||
            n === "$~" ||
            n === "&" ||
            n === "F!" ||
            n === "F")
        )
          break;
        if (n === "/$" || n === "/&") return null;
      }
    }
    return e;
  }
  var Gf = null;
  function Wy(e) {
    e = e.nextSibling;
    for (var n = 0; e; ) {
      if (e.nodeType === 8) {
        var i = e.data;
        if (i === "/$" || i === "/&") {
          if (n === 0) return Cn(e.nextSibling);
          n--;
        } else
          (i !== "$" && i !== "$!" && i !== "$?" && i !== "$~" && i !== "&") ||
            n++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function em(e) {
    e = e.previousSibling;
    for (var n = 0; e; ) {
      if (e.nodeType === 8) {
        var i = e.data;
        if (i === "$" || i === "$!" || i === "$?" || i === "$~" || i === "&") {
          if (n === 0) return e;
          n--;
        } else (i !== "/$" && i !== "/&") || n++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  function tm(e, n, i) {
    switch (((n = ks(i)), e)) {
      case "html":
        if (((e = n.documentElement), !e)) throw Error(l(452));
        return e;
      case "head":
        if (((e = n.head), !e)) throw Error(l(453));
        return e;
      case "body":
        if (((e = n.body), !e)) throw Error(l(454));
        return e;
      default:
        throw Error(l(451));
    }
  }
  function Ql(e) {
    for (var n = e.attributes; n.length; ) e.removeAttributeNode(n[0]);
    ol(e);
  }
  var Tn = new Map(),
    nm = new Set();
  function Ds(e) {
    return typeof e.getRootNode == "function"
      ? e.getRootNode()
      : e.nodeType === 9
        ? e
        : e.ownerDocument;
  }
  var Ra = Z.d;
  Z.d = { f: iE, r: lE, D: oE, C: sE, L: uE, m: cE, X: dE, S: fE, M: pE };
  function iE() {
    var e = Ra.f(),
      n = _s();
    return e || n;
  }
  function lE(e) {
    var n = Ba(e);
    n !== null && n.tag === 5 && n.type === "form" ? bg(n) : Ra.r(e);
  }
  var Ai = typeof document > "u" ? null : document;
  function am(e, n, i) {
    var o = Ai;
    if (o && typeof n == "string" && n) {
      var c = Qt(n);
      ((c = 'link[rel="' + e + '"][href="' + c + '"]'),
        typeof i == "string" && (c += '[crossorigin="' + i + '"]'),
        nm.has(c) ||
          (nm.add(c),
          (e = { rel: e, crossOrigin: i, href: n }),
          o.querySelector(c) === null &&
            ((n = o.createElement("link")),
            Ut(n, "link", e),
            St(n),
            o.head.appendChild(n))));
    }
  }
  function oE(e) {
    (Ra.D(e), am("dns-prefetch", e, null));
  }
  function sE(e, n) {
    (Ra.C(e, n), am("preconnect", e, n));
  }
  function uE(e, n, i) {
    Ra.L(e, n, i);
    var o = Ai;
    if (o && e && n) {
      var c = 'link[rel="preload"][as="' + Qt(n) + '"]';
      n === "image" && i && i.imageSrcSet
        ? ((c += '[imagesrcset="' + Qt(i.imageSrcSet) + '"]'),
          typeof i.imageSizes == "string" &&
            (c += '[imagesizes="' + Qt(i.imageSizes) + '"]'))
        : (c += '[href="' + Qt(e) + '"]');
      var d = c;
      switch (n) {
        case "style":
          d = Ri(e);
          break;
        case "script":
          d = ki(e);
      }
      Tn.has(d) ||
        ((e = v(
          {
            rel: "preload",
            href: n === "image" && i && i.imageSrcSet ? void 0 : e,
            as: n,
          },
          i,
        )),
        Tn.set(d, e),
        o.querySelector(c) !== null ||
          (n === "style" && o.querySelector(Jl(d))) ||
          (n === "script" && o.querySelector(Wl(d))) ||
          ((n = o.createElement("link")),
          Ut(n, "link", e),
          St(n),
          o.head.appendChild(n)));
    }
  }
  function cE(e, n) {
    Ra.m(e, n);
    var i = Ai;
    if (i && e) {
      var o = n && typeof n.as == "string" ? n.as : "script",
        c =
          'link[rel="modulepreload"][as="' + Qt(o) + '"][href="' + Qt(e) + '"]',
        d = c;
      switch (o) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          d = ki(e);
      }
      if (
        !Tn.has(d) &&
        ((e = v({ rel: "modulepreload", href: e }, n)),
        Tn.set(d, e),
        i.querySelector(c) === null)
      ) {
        switch (o) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (i.querySelector(Wl(d))) return;
        }
        ((o = i.createElement("link")),
          Ut(o, "link", e),
          St(o),
          i.head.appendChild(o));
      }
    }
  }
  function fE(e, n, i) {
    Ra.S(e, n, i);
    var o = Ai;
    if (o && e) {
      var c = Jn(o).hoistableStyles,
        d = Ri(e);
      n = n || "default";
      var m = c.get(d);
      if (!m) {
        var _ = { loading: 0, preload: null };
        if ((m = o.querySelector(Jl(d)))) _.loading = 5;
        else {
          ((e = v({ rel: "stylesheet", href: e, "data-precedence": n }, i)),
            (i = Tn.get(d)) && Pf(e, i));
          var R = (m = o.createElement("link"));
          (St(R),
            Ut(R, "link", e),
            (R._p = new Promise(function (I, K) {
              ((R.onload = I), (R.onerror = K));
            })),
            R.addEventListener("load", function () {
              _.loading |= 1;
            }),
            R.addEventListener("error", function () {
              _.loading |= 2;
            }),
            (_.loading |= 4),
            Ls(m, n, o));
        }
        ((m = { type: "stylesheet", instance: m, count: 1, state: _ }),
          c.set(d, m));
      }
    }
  }
  function dE(e, n) {
    Ra.X(e, n);
    var i = Ai;
    if (i && e) {
      var o = Jn(i).hoistableScripts,
        c = ki(e),
        d = o.get(c);
      d ||
        ((d = i.querySelector(Wl(c))),
        d ||
          ((e = v({ src: e, async: !0 }, n)),
          (n = Tn.get(c)) && qf(e, n),
          (d = i.createElement("script")),
          St(d),
          Ut(d, "link", e),
          i.head.appendChild(d)),
        (d = { type: "script", instance: d, count: 1, state: null }),
        o.set(c, d));
    }
  }
  function pE(e, n) {
    Ra.M(e, n);
    var i = Ai;
    if (i && e) {
      var o = Jn(i).hoistableScripts,
        c = ki(e),
        d = o.get(c);
      d ||
        ((d = i.querySelector(Wl(c))),
        d ||
          ((e = v({ src: e, async: !0, type: "module" }, n)),
          (n = Tn.get(c)) && qf(e, n),
          (d = i.createElement("script")),
          St(d),
          Ut(d, "link", e),
          i.head.appendChild(d)),
        (d = { type: "script", instance: d, count: 1, state: null }),
        o.set(c, d));
    }
  }
  function rm(e, n, i, o) {
    var c = (c = ge.current) ? Ds(c) : null;
    if (!c) throw Error(l(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof i.precedence == "string" && typeof i.href == "string"
          ? ((n = Ri(i.href)),
            (i = Jn(c).hoistableStyles),
            (o = i.get(n)),
            o ||
              ((o = { type: "style", instance: null, count: 0, state: null }),
              i.set(n, o)),
            o)
          : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (
          i.rel === "stylesheet" &&
          typeof i.href == "string" &&
          typeof i.precedence == "string"
        ) {
          e = Ri(i.href);
          var d = Jn(c).hoistableStyles,
            m = d.get(e);
          if (
            (m ||
              ((c = c.ownerDocument || c),
              (m = {
                type: "stylesheet",
                instance: null,
                count: 0,
                state: { loading: 0, preload: null },
              }),
              d.set(e, m),
              (d = c.querySelector(Jl(e))) &&
                !d._p &&
                ((m.instance = d), (m.state.loading = 5)),
              Tn.has(e) ||
                ((i = {
                  rel: "preload",
                  as: "style",
                  href: i.href,
                  crossOrigin: i.crossOrigin,
                  integrity: i.integrity,
                  media: i.media,
                  hrefLang: i.hrefLang,
                  referrerPolicy: i.referrerPolicy,
                }),
                Tn.set(e, i),
                d || hE(c, e, i, m.state))),
            n && o === null)
          )
            throw Error(l(528, ""));
          return m;
        }
        if (n && o !== null) throw Error(l(529, ""));
        return null;
      case "script":
        return (
          (n = i.async),
          (i = i.src),
          typeof i == "string" &&
          n &&
          typeof n != "function" &&
          typeof n != "symbol"
            ? ((n = ki(i)),
              (i = Jn(c).hoistableScripts),
              (o = i.get(n)),
              o ||
                ((o = {
                  type: "script",
                  instance: null,
                  count: 0,
                  state: null,
                }),
                i.set(n, o)),
              o)
            : { type: "void", instance: null, count: 0, state: null }
        );
      default:
        throw Error(l(444, e));
    }
  }
  function Ri(e) {
    return 'href="' + Qt(e) + '"';
  }
  function Jl(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function im(e) {
    return v({}, e, { "data-precedence": e.precedence, precedence: null });
  }
  function hE(e, n, i, o) {
    e.querySelector('link[rel="preload"][as="style"][' + n + "]")
      ? (o.loading = 1)
      : ((n = e.createElement("link")),
        (o.preload = n),
        n.addEventListener("load", function () {
          return (o.loading |= 1);
        }),
        n.addEventListener("error", function () {
          return (o.loading |= 2);
        }),
        Ut(n, "link", i),
        St(n),
        e.head.appendChild(n));
  }
  function ki(e) {
    return '[src="' + Qt(e) + '"]';
  }
  function Wl(e) {
    return "script[async]" + e;
  }
  function lm(e, n, i) {
    if ((n.count++, n.instance === null))
      switch (n.type) {
        case "style":
          var o = e.querySelector('style[data-href~="' + Qt(i.href) + '"]');
          if (o) return ((n.instance = o), St(o), o);
          var c = v({}, i, {
            "data-href": i.href,
            "data-precedence": i.precedence,
            href: null,
            precedence: null,
          });
          return (
            (o = (e.ownerDocument || e).createElement("style")),
            St(o),
            Ut(o, "style", c),
            Ls(o, i.precedence, e),
            (n.instance = o)
          );
        case "stylesheet":
          c = Ri(i.href);
          var d = e.querySelector(Jl(c));
          if (d) return ((n.state.loading |= 4), (n.instance = d), St(d), d);
          ((o = im(i)),
            (c = Tn.get(c)) && Pf(o, c),
            (d = (e.ownerDocument || e).createElement("link")),
            St(d));
          var m = d;
          return (
            (m._p = new Promise(function (_, R) {
              ((m.onload = _), (m.onerror = R));
            })),
            Ut(d, "link", o),
            (n.state.loading |= 4),
            Ls(d, i.precedence, e),
            (n.instance = d)
          );
        case "script":
          return (
            (d = ki(i.src)),
            (c = e.querySelector(Wl(d)))
              ? ((n.instance = c), St(c), c)
              : ((o = i),
                (c = Tn.get(d)) && ((o = v({}, i)), qf(o, c)),
                (e = e.ownerDocument || e),
                (c = e.createElement("script")),
                St(c),
                Ut(c, "link", o),
                e.head.appendChild(c),
                (n.instance = c))
          );
        case "void":
          return null;
        default:
          throw Error(l(443, n.type));
      }
    else
      n.type === "stylesheet" &&
        (n.state.loading & 4) === 0 &&
        ((o = n.instance), (n.state.loading |= 4), Ls(o, i.precedence, e));
    return n.instance;
  }
  function Ls(e, n, i) {
    for (
      var o = i.querySelectorAll(
          'link[rel="stylesheet"][data-precedence],style[data-precedence]',
        ),
        c = o.length ? o[o.length - 1] : null,
        d = c,
        m = 0;
      m < o.length;
      m++
    ) {
      var _ = o[m];
      if (_.dataset.precedence === n) d = _;
      else if (d !== c) break;
    }
    d
      ? d.parentNode.insertBefore(e, d.nextSibling)
      : ((n = i.nodeType === 9 ? i.head : i), n.insertBefore(e, n.firstChild));
  }
  function Pf(e, n) {
    (e.crossOrigin == null && (e.crossOrigin = n.crossOrigin),
      e.referrerPolicy == null && (e.referrerPolicy = n.referrerPolicy),
      e.title == null && (e.title = n.title));
  }
  function qf(e, n) {
    (e.crossOrigin == null && (e.crossOrigin = n.crossOrigin),
      e.referrerPolicy == null && (e.referrerPolicy = n.referrerPolicy),
      e.integrity == null && (e.integrity = n.integrity));
  }
  var Ns = null;
  function om(e, n, i) {
    if (Ns === null) {
      var o = new Map(),
        c = (Ns = new Map());
      c.set(i, o);
    } else ((c = Ns), (o = c.get(i)), o || ((o = new Map()), c.set(i, o)));
    if (o.has(e)) return o;
    for (
      o.set(e, null), i = i.getElementsByTagName(e), c = 0;
      c < i.length;
      c++
    ) {
      var d = i[c];
      if (
        !(
          d[br] ||
          d[Ct] ||
          (e === "link" && d.getAttribute("rel") === "stylesheet")
        ) &&
        d.namespaceURI !== "http://www.w3.org/2000/svg"
      ) {
        var m = d.getAttribute(n) || "";
        m = e + m;
        var _ = o.get(m);
        _ ? _.push(d) : o.set(m, [d]);
      }
    }
    return o;
  }
  function sm(e, n, i) {
    ((e = e.ownerDocument || e),
      e.head.insertBefore(
        i,
        n === "title" ? e.querySelector("head > title") : null,
      ));
  }
  function gE(e, n, i) {
    if (i === 1 || n.itemProp != null) return !1;
    switch (e) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (
          typeof n.precedence != "string" ||
          typeof n.href != "string" ||
          n.href === ""
        )
          break;
        return !0;
      case "link":
        if (
          typeof n.rel != "string" ||
          typeof n.href != "string" ||
          n.href === "" ||
          n.onLoad ||
          n.onError
        )
          break;
        switch (n.rel) {
          case "stylesheet":
            return (
              (e = n.disabled),
              typeof n.precedence == "string" && e == null
            );
          default:
            return !0;
        }
      case "script":
        if (
          n.async &&
          typeof n.async != "function" &&
          typeof n.async != "symbol" &&
          !n.onLoad &&
          !n.onError &&
          n.src &&
          typeof n.src == "string"
        )
          return !0;
    }
    return !1;
  }
  function um(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function yE(e, n, i, o) {
    if (
      i.type === "stylesheet" &&
      (typeof o.media != "string" || matchMedia(o.media).matches !== !1) &&
      (i.state.loading & 4) === 0
    ) {
      if (i.instance === null) {
        var c = Ri(o.href),
          d = n.querySelector(Jl(c));
        if (d) {
          ((n = d._p),
            n !== null &&
              typeof n == "object" &&
              typeof n.then == "function" &&
              (e.count++, (e = Ms.bind(e)), n.then(e, e)),
            (i.state.loading |= 4),
            (i.instance = d),
            St(d));
          return;
        }
        ((d = n.ownerDocument || n),
          (o = im(o)),
          (c = Tn.get(c)) && Pf(o, c),
          (d = d.createElement("link")),
          St(d));
        var m = d;
        ((m._p = new Promise(function (_, R) {
          ((m.onload = _), (m.onerror = R));
        })),
          Ut(d, "link", o),
          (i.instance = d));
      }
      (e.stylesheets === null && (e.stylesheets = new Map()),
        e.stylesheets.set(i, n),
        (n = i.state.preload) &&
          (i.state.loading & 3) === 0 &&
          (e.count++,
          (i = Ms.bind(e)),
          n.addEventListener("load", i),
          n.addEventListener("error", i)));
    }
  }
  var Yf = 0;
  function mE(e, n) {
    return (
      e.stylesheets && e.count === 0 && zs(e, e.stylesheets),
      0 < e.count || 0 < e.imgCount
        ? function (i) {
            var o = setTimeout(function () {
              if ((e.stylesheets && zs(e, e.stylesheets), e.unsuspend)) {
                var d = e.unsuspend;
                ((e.unsuspend = null), d());
              }
            }, 6e4 + n);
            0 < e.imgBytes && Yf === 0 && (Yf = 62500 * Q1());
            var c = setTimeout(
              function () {
                if (
                  ((e.waitingForImages = !1),
                  e.count === 0 &&
                    (e.stylesheets && zs(e, e.stylesheets), e.unsuspend))
                ) {
                  var d = e.unsuspend;
                  ((e.unsuspend = null), d());
                }
              },
              (e.imgBytes > Yf ? 50 : 800) + n,
            );
            return (
              (e.unsuspend = i),
              function () {
                ((e.unsuspend = null), clearTimeout(o), clearTimeout(c));
              }
            );
          }
        : null
    );
  }
  function Ms() {
    if (
      (this.count--,
      this.count === 0 && (this.imgCount === 0 || !this.waitingForImages))
    ) {
      if (this.stylesheets) zs(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        ((this.unsuspend = null), e());
      }
    }
  }
  var js = null;
  function zs(e, n) {
    ((e.stylesheets = null),
      e.unsuspend !== null &&
        (e.count++,
        (js = new Map()),
        n.forEach(vE, e),
        (js = null),
        Ms.call(e)));
  }
  function vE(e, n) {
    if (!(n.state.loading & 4)) {
      var i = js.get(e);
      if (i) var o = i.get(null);
      else {
        ((i = new Map()), js.set(e, i));
        for (
          var c = e.querySelectorAll(
              "link[data-precedence],style[data-precedence]",
            ),
            d = 0;
          d < c.length;
          d++
        ) {
          var m = c[d];
          (m.nodeName === "LINK" || m.getAttribute("media") !== "not all") &&
            (i.set(m.dataset.precedence, m), (o = m));
        }
        o && i.set(null, o);
      }
      ((c = n.instance),
        (m = c.getAttribute("data-precedence")),
        (d = i.get(m) || o),
        d === o && i.set(null, c),
        i.set(m, c),
        this.count++,
        (o = Ms.bind(this)),
        c.addEventListener("load", o),
        c.addEventListener("error", o),
        d
          ? d.parentNode.insertBefore(c, d.nextSibling)
          : ((e = e.nodeType === 9 ? e.head : e),
            e.insertBefore(c, e.firstChild)),
        (n.state.loading |= 4));
    }
  }
  var eo = {
    $$typeof: z,
    Provider: null,
    Consumer: null,
    _currentValue: ne,
    _currentValue2: ne,
    _threadCount: 0,
  };
  function bE(e, n, i, o, c, d, m, _, R) {
    ((this.tag = 1),
      (this.containerInfo = e),
      (this.pingCache = this.current = this.pendingChildren = null),
      (this.timeoutHandle = -1),
      (this.callbackNode =
        this.next =
        this.pendingContext =
        this.context =
        this.cancelPendingCommit =
          null),
      (this.callbackPriority = 0),
      (this.expirationTimes = za(-1)),
      (this.entangledLanes =
        this.shellSuspendCounter =
        this.errorRecoveryDisabledLanes =
        this.expiredLanes =
        this.warmLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = za(0)),
      (this.hiddenUpdates = za(null)),
      (this.identifierPrefix = o),
      (this.onUncaughtError = c),
      (this.onCaughtError = d),
      (this.onRecoverableError = m),
      (this.pooledCache = null),
      (this.pooledCacheLanes = 0),
      (this.formState = R),
      (this.incompleteTransitions = new Map()));
  }
  function cm(e, n, i, o, c, d, m, _, R, I, K, ee) {
    return (
      (e = new bE(e, n, i, m, R, I, K, ee, _)),
      (n = 1),
      d === !0 && (n |= 24),
      (d = un(3, null, null, n)),
      (e.current = d),
      (d.stateNode = e),
      (n = xc()),
      n.refCount++,
      (e.pooledCache = n),
      n.refCount++,
      (d.memoizedState = { element: o, isDehydrated: i, cache: n }),
      Rc(d),
      e
    );
  }
  function fm(e) {
    return e ? ((e = oi), e) : oi;
  }
  function dm(e, n, i, o, c, d) {
    ((c = fm(c)),
      o.context === null ? (o.context = c) : (o.pendingContext = c),
      (o = Za(n)),
      (o.payload = { element: i }),
      (d = d === void 0 ? null : d),
      d !== null && (o.callback = d),
      (i = Xa(e, o, n)),
      i !== null && (nn(i, e, n), Ll(i, e, n)));
  }
  function pm(e, n) {
    if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
      var i = e.retryLane;
      e.retryLane = i !== 0 && i < n ? i : n;
    }
  }
  function Zf(e, n) {
    (pm(e, n), (e = e.alternate) && pm(e, n));
  }
  function hm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var n = Cr(e, 67108864);
      (n !== null && nn(n, e, 67108864), Zf(e, 67108864));
    }
  }
  function gm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var n = hn();
      n = il(n);
      var i = Cr(e, n);
      (i !== null && nn(i, e, n), Zf(e, n));
    }
  }
  var Bs = !0;
  function SE(e, n, i, o) {
    var c = M.T;
    M.T = null;
    var d = Z.p;
    try {
      ((Z.p = 2), Xf(e, n, i, o));
    } finally {
      ((Z.p = d), (M.T = c));
    }
  }
  function EE(e, n, i, o) {
    var c = M.T;
    M.T = null;
    var d = Z.p;
    try {
      ((Z.p = 8), Xf(e, n, i, o));
    } finally {
      ((Z.p = d), (M.T = c));
    }
  }
  function Xf(e, n, i, o) {
    if (Bs) {
      var c = Kf(o);
      if (c === null) (jf(e, n, o, Us, i), mm(e, o));
      else if (wE(c, e, n, i, o)) o.stopPropagation();
      else if ((mm(e, o), n & 4 && -1 < _E.indexOf(e))) {
        for (; c !== null; ) {
          var d = Ba(c);
          if (d !== null)
            switch (d.tag) {
              case 3:
                if (((d = d.stateNode), d.current.memoizedState.isDehydrated)) {
                  var m = me(d.pendingLanes);
                  if (m !== 0) {
                    var _ = d;
                    for (_.pendingLanes |= 2, _.entangledLanes |= 2; m; ) {
                      var R = 1 << (31 - be(m));
                      ((_.entanglements[1] |= R), (m &= ~R));
                    }
                    (aa(d), (Je & 6) === 0 && ((Ss = At() + 500), Zl(0)));
                  }
                }
                break;
              case 31:
              case 13:
                ((_ = Cr(d, 2)), _ !== null && nn(_, d, 2), _s(), Zf(d, 2));
            }
          if (((d = Kf(o)), d === null && jf(e, n, o, Us, i), d === c)) break;
          c = d;
        }
        c !== null && o.stopPropagation();
      } else jf(e, n, o, null, i);
    }
  }
  function Kf(e) {
    return ((e = _r(e)), Qf(e));
  }
  var Us = null;
  function Qf(e) {
    if (((Us = null), (e = Kn(e)), e !== null)) {
      var n = u(e);
      if (n === null) e = null;
      else {
        var i = n.tag;
        if (i === 13) {
          if (((e = f(n)), e !== null)) return e;
          e = null;
        } else if (i === 31) {
          if (((e = p(n)), e !== null)) return e;
          e = null;
        } else if (i === 3) {
          if (n.stateNode.current.memoizedState.isDehydrated)
            return n.tag === 3 ? n.stateNode.containerInfo : null;
          e = null;
        } else n !== e && (e = null);
      }
    }
    return ((Us = e), null);
  }
  function ym(e) {
    switch (e) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (qr()) {
          case Yr:
            return 2;
          case Yn:
            return 8;
          case Mn:
          case Zr:
            return 32;
          case vr:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var Jf = !1,
    lr = null,
    or = null,
    sr = null,
    to = new Map(),
    no = new Map(),
    ur = [],
    _E =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
        " ",
      );
  function mm(e, n) {
    switch (e) {
      case "focusin":
      case "focusout":
        lr = null;
        break;
      case "dragenter":
      case "dragleave":
        or = null;
        break;
      case "mouseover":
      case "mouseout":
        sr = null;
        break;
      case "pointerover":
      case "pointerout":
        to.delete(n.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        no.delete(n.pointerId);
    }
  }
  function ao(e, n, i, o, c, d) {
    return e === null || e.nativeEvent !== d
      ? ((e = {
          blockedOn: n,
          domEventName: i,
          eventSystemFlags: o,
          nativeEvent: d,
          targetContainers: [c],
        }),
        n !== null && ((n = Ba(n)), n !== null && hm(n)),
        e)
      : ((e.eventSystemFlags |= o),
        (n = e.targetContainers),
        c !== null && n.indexOf(c) === -1 && n.push(c),
        e);
  }
  function wE(e, n, i, o, c) {
    switch (n) {
      case "focusin":
        return ((lr = ao(lr, e, n, i, o, c)), !0);
      case "dragenter":
        return ((or = ao(or, e, n, i, o, c)), !0);
      case "mouseover":
        return ((sr = ao(sr, e, n, i, o, c)), !0);
      case "pointerover":
        var d = c.pointerId;
        return (to.set(d, ao(to.get(d) || null, e, n, i, o, c)), !0);
      case "gotpointercapture":
        return (
          (d = c.pointerId),
          no.set(d, ao(no.get(d) || null, e, n, i, o, c)),
          !0
        );
    }
    return !1;
  }
  function vm(e) {
    var n = Kn(e.target);
    if (n !== null) {
      var i = u(n);
      if (i !== null) {
        if (((n = i.tag), n === 13)) {
          if (((n = f(i)), n !== null)) {
            ((e.blockedOn = n),
              No(e.priority, function () {
                gm(i);
              }));
            return;
          }
        } else if (n === 31) {
          if (((n = p(i)), n !== null)) {
            ((e.blockedOn = n),
              No(e.priority, function () {
                gm(i);
              }));
            return;
          }
        } else if (n === 3 && i.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = i.tag === 3 ? i.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Fs(e) {
    if (e.blockedOn !== null) return !1;
    for (var n = e.targetContainers; 0 < n.length; ) {
      var i = Kf(e.nativeEvent);
      if (i === null) {
        i = e.nativeEvent;
        var o = new i.constructor(i.type, i);
        ((Er = o), i.target.dispatchEvent(o), (Er = null));
      } else return ((n = Ba(i)), n !== null && hm(n), (e.blockedOn = i), !1);
      n.shift();
    }
    return !0;
  }
  function bm(e, n, i) {
    Fs(e) && i.delete(n);
  }
  function OE() {
    ((Jf = !1),
      lr !== null && Fs(lr) && (lr = null),
      or !== null && Fs(or) && (or = null),
      sr !== null && Fs(sr) && (sr = null),
      to.forEach(bm),
      no.forEach(bm));
  }
  function Is(e, n) {
    e.blockedOn === n &&
      ((e.blockedOn = null),
      Jf ||
        ((Jf = !0),
        t.unstable_scheduleCallback(t.unstable_NormalPriority, OE)));
  }
  var Hs = null;
  function Sm(e) {
    Hs !== e &&
      ((Hs = e),
      t.unstable_scheduleCallback(t.unstable_NormalPriority, function () {
        Hs === e && (Hs = null);
        for (var n = 0; n < e.length; n += 3) {
          var i = e[n],
            o = e[n + 1],
            c = e[n + 2];
          if (typeof o != "function") {
            if (Qf(o || i) === null) continue;
            break;
          }
          var d = Ba(i);
          d !== null &&
            (e.splice(n, 3),
            (n -= 3),
            Xc(d, { pending: !0, data: c, method: i.method, action: o }, o, c));
        }
      }));
  }
  function Di(e) {
    function n(R) {
      return Is(R, e);
    }
    (lr !== null && Is(lr, e),
      or !== null && Is(or, e),
      sr !== null && Is(sr, e),
      to.forEach(n),
      no.forEach(n));
    for (var i = 0; i < ur.length; i++) {
      var o = ur[i];
      o.blockedOn === e && (o.blockedOn = null);
    }
    for (; 0 < ur.length && ((i = ur[0]), i.blockedOn === null); )
      (vm(i), i.blockedOn === null && ur.shift());
    if (((i = (e.ownerDocument || e).$$reactFormReplay), i != null))
      for (o = 0; o < i.length; o += 3) {
        var c = i[o],
          d = i[o + 1],
          m = c[Vt] || null;
        if (typeof d == "function") m || Sm(i);
        else if (m) {
          var _ = null;
          if (d && d.hasAttribute("formAction")) {
            if (((c = d), (m = d[Vt] || null))) _ = m.formAction;
            else if (Qf(c) !== null) continue;
          } else _ = m.action;
          (typeof _ == "function" ? (i[o + 1] = _) : (i.splice(o, 3), (o -= 3)),
            Sm(i));
        }
      }
  }
  function Em() {
    function e(d) {
      d.canIntercept &&
        d.info === "react-transition" &&
        d.intercept({
          handler: function () {
            return new Promise(function (m) {
              return (c = m);
            });
          },
          focusReset: "manual",
          scroll: "manual",
        });
    }
    function n() {
      (c !== null && (c(), (c = null)), o || setTimeout(i, 20));
    }
    function i() {
      if (!o && !navigation.transition) {
        var d = navigation.currentEntry;
        d &&
          d.url != null &&
          navigation.navigate(d.url, {
            state: d.getState(),
            info: "react-transition",
            history: "replace",
          });
      }
    }
    if (typeof navigation == "object") {
      var o = !1,
        c = null;
      return (
        navigation.addEventListener("navigate", e),
        navigation.addEventListener("navigatesuccess", n),
        navigation.addEventListener("navigateerror", n),
        setTimeout(i, 100),
        function () {
          ((o = !0),
            navigation.removeEventListener("navigate", e),
            navigation.removeEventListener("navigatesuccess", n),
            navigation.removeEventListener("navigateerror", n),
            c !== null && (c(), (c = null)));
        }
      );
    }
  }
  function Wf(e) {
    this._internalRoot = e;
  }
  (($s.prototype.render = Wf.prototype.render =
    function (e) {
      var n = this._internalRoot;
      if (n === null) throw Error(l(409));
      var i = n.current,
        o = hn();
      dm(i, o, e, n, null, null);
    }),
    ($s.prototype.unmount = Wf.prototype.unmount =
      function () {
        var e = this._internalRoot;
        if (e !== null) {
          this._internalRoot = null;
          var n = e.containerInfo;
          (dm(e.current, 2, null, e, null, null), _s(), (n[ln] = null));
        }
      }));
  function $s(e) {
    this._internalRoot = e;
  }
  $s.prototype.unstable_scheduleHydration = function (e) {
    if (e) {
      var n = Lo();
      e = { blockedOn: null, target: e, priority: n };
      for (var i = 0; i < ur.length && n !== 0 && n < ur[i].priority; i++);
      (ur.splice(i, 0, e), i === 0 && vm(e));
    }
  };
  var _m = a.version;
  if (_m !== "19.2.7") throw Error(l(527, _m, "19.2.7"));
  Z.findDOMNode = function (e) {
    var n = e._reactInternals;
    if (n === void 0)
      throw typeof e.render == "function"
        ? Error(l(188))
        : ((e = Object.keys(e).join(",")), Error(l(268, e)));
    return (
      (e = g(n)),
      (e = e !== null ? y(e) : null),
      (e = e === null ? null : e.stateNode),
      e
    );
  };
  var xE = {
    bundleType: 0,
    version: "19.2.7",
    rendererPackageName: "react-dom",
    currentDispatcherRef: M,
    reconcilerVersion: "19.2.7",
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Vs = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Vs.isDisabled && Vs.supportsFiber)
      try {
        ((G = Vs.inject(xE)), (X = Vs));
      } catch {}
  }
  return (
    (so.createRoot = function (e, n) {
      if (!s(e)) throw Error(l(299));
      var i = !1,
        o = "",
        c = Rg,
        d = kg,
        m = Dg;
      return (
        n != null &&
          (n.unstable_strictMode === !0 && (i = !0),
          n.identifierPrefix !== void 0 && (o = n.identifierPrefix),
          n.onUncaughtError !== void 0 && (c = n.onUncaughtError),
          n.onCaughtError !== void 0 && (d = n.onCaughtError),
          n.onRecoverableError !== void 0 && (m = n.onRecoverableError)),
        (n = cm(e, 1, !1, null, null, i, o, null, c, d, m, Em)),
        (e[ln] = n.current),
        Mf(e),
        new Wf(n)
      );
    }),
    (so.hydrateRoot = function (e, n, i) {
      if (!s(e)) throw Error(l(299));
      var o = !1,
        c = "",
        d = Rg,
        m = kg,
        _ = Dg,
        R = null;
      return (
        i != null &&
          (i.unstable_strictMode === !0 && (o = !0),
          i.identifierPrefix !== void 0 && (c = i.identifierPrefix),
          i.onUncaughtError !== void 0 && (d = i.onUncaughtError),
          i.onCaughtError !== void 0 && (m = i.onCaughtError),
          i.onRecoverableError !== void 0 && (_ = i.onRecoverableError),
          i.formState !== void 0 && (R = i.formState)),
        (n = cm(e, 1, !0, n, i ?? null, o, c, R, d, m, _, Em)),
        (n.context = fm(null)),
        (i = n.current),
        (o = hn()),
        (o = il(o)),
        (c = Za(o)),
        (c.callback = null),
        Xa(i, c, o),
        (i = o),
        (n.current.lanes = i),
        Nt(n, i),
        aa(n),
        (e[ln] = n.current),
        Mf(e),
        new $s(n)
      );
    }),
    (so.version = "19.2.7"),
    so
  );
}
var Hv;
function Tk() {
  if (Hv) return Od.exports;
  Hv = 1;
  function t() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (a) {
        console.error(a);
      }
  }
  return (t(), (Od.exports = Ck()), Od.exports);
}
var Ak = Tk();
const ap = {},
  eS = W.createContext(ap);
function Rk(t) {
  const a = W.useContext(eS);
  return W.useMemo(
    function () {
      return typeof t == "function" ? t(a) : { ...a, ...t };
    },
    [a, t],
  );
}
function kk(t) {
  let a;
  return (
    t.disableParentContext
      ? (a =
          typeof t.components == "function"
            ? t.components(ap)
            : t.components || ap)
      : (a = Rk(t.components)),
    W.createElement(eS.Provider, { value: a }, t.children)
  );
}
let tS, nS;
typeof document < "u" && (tS = document);
typeof window < "u" && (nS = window);
const aS = W.createContext({ document: tS, window: nS }),
  Dk = () => C.useContext(aS),
  { Provider: Lk, Consumer: uD } = aS;
class Nk extends C.Component {
  componentDidMount() {
    this.props.contentDidMount && this.props.contentDidMount();
  }
  componentDidUpdate() {
    this.props.contentDidUpdate && this.props.contentDidUpdate();
  }
  render() {
    return W.Children.only(this.props.children);
  }
}
class rS extends C.Component {
  constructor(r) {
    super(r);
    Ft(this, "_isMounted", !1);
    Ft(this, "nodeRef", W.createRef());
    Ft(this, "setRef", (r) => {
      this.nodeRef.current = r;
      const { forwardedRef: l } = this.props;
      typeof l == "function" ? l(r) : l && (l.current = r);
    });
    Ft(this, "handleLoad", () => {
      this.setState({ iframeLoaded: !0 });
    });
    this.state = { iframeLoaded: !1 };
  }
  componentDidMount() {
    var l;
    this._isMounted = !0;
    const r = this.getDoc();
    r && r.readyState === "complete"
      ? this.forceUpdate()
      : (l = this.nodeRef.current) == null ||
        l.addEventListener("load", this.handleLoad);
  }
  componentWillUnmount() {
    var r;
    ((this._isMounted = !1),
      (r = this.nodeRef.current) == null ||
        r.removeEventListener("load", this.handleLoad));
  }
  getDoc() {
    return this.nodeRef.current ? this.nodeRef.current.contentDocument : null;
  }
  getMountTarget() {
    const r = this.getDoc();
    return this.props.mountTarget
      ? r == null
        ? void 0
        : r.querySelector(this.props.mountTarget)
      : r == null
        ? void 0
        : r.body.children[0];
  }
  renderFrameContents() {
    if (!this._isMounted) return null;
    const r = this.getDoc();
    if (!r) return null;
    const l = this.props.contentDidMount,
      s = this.props.contentDidUpdate,
      u = r.defaultView || r.parentView,
      f = x.jsx(Nk, {
        contentDidMount: l,
        contentDidUpdate: s,
        children: x.jsx(Lk, {
          value: { document: r, window: u },
          children: x.jsx("div", {
            className: "frame-content",
            children: this.props.children,
          }),
        }),
      }),
      p = this.getMountTarget();
    return [
      Um.createPortal(this.props.head, this.getDoc().head),
      Um.createPortal(f, p),
    ];
  }
  render() {
    const r = {
      ...this.props,
      srcDoc: this.props.initialContent,
      children: void 0,
    };
    return (
      delete r.head,
      delete r.initialContent,
      delete r.mountTarget,
      delete r.contentDidMount,
      delete r.contentDidUpdate,
      delete r.forwardedRef,
      x.jsx("iframe", {
        ...r,
        ref: this.setRef,
        onLoad: this.handleLoad,
        children: this.state.iframeLoaded && this.renderFrameContents(),
      })
    );
  }
}
Ft(rS, "defaultProps", {
  style: {},
  head: null,
  children: void 0,
  mountTarget: void 0,
  contentDidMount: () => {},
  contentDidUpdate: () => {},
  initialContent:
    '<!DOCTYPE html><html><head></head><body><div class="frame-root"></div></body></html>',
});
const Mk = W.forwardRef((t, a) => x.jsx(rS, { ...t, forwardedRef: a })),
  jk = (t) => t.altKey || t.ctrlKey || t.shiftKey || t.metaKey,
  iS = (t) => {
    const a = t.target || {};
    return !!(
      !t.key ||
      a.isContentEditable ||
      (["INPUT", "TEXTAREA"].includes(a.nodeName) && !jk(t))
    );
  },
  $v = (t) => {
    if (iS(t)) return;
    const a = new KeyboardEvent("keydown", {
      key: t.key,
      code: t.code,
      keyCode: t.keyCode,
      altKey: t.altKey,
      ctrlKey: t.ctrlKey,
      shiftKey: t.shiftKey,
      metaKey: t.metaKey,
    });
    document.dispatchEvent(a);
  },
  Vv = (t) => {
    if (iS(t)) return;
    const a = new KeyboardEvent("keyup", {
      key: t.key,
      code: t.code,
      keyCode: t.keyCode,
      altKey: t.altKey,
      ctrlKey: t.ctrlKey,
      shiftKey: t.shiftKey,
      metaKey: t.metaKey,
    });
    document.dispatchEvent(a);
  },
  rp = "data-debug-css";
function Gv(t, a, r) {
  const l = a.head.querySelectorAll(`style[${rp}]`),
    s = a.createElement("style");
  return (
    s.setAttribute(rp, "true"),
    s.appendChild(a.createTextNode(t)),
    r && l[r] ? (l[r].after(s), r + 1) : (a.head.appendChild(s), l.length)
  );
}
function Pv(t, a) {
  const r = t.head.querySelectorAll(`style[${rp}]`);
  a != null && r[a] && r[a].remove();
}
const zk = ({ active: t, children: a, rtl: r, width: l }) => {
  const { window: s, document: u } = Dk(),
    f = () => {
      s &&
        (s.document.documentElement.setAttribute("dir", r ? "rtl" : "ltr"),
        [...document.head.children].forEach((p) => {
          if (
            p.tagName === "STYLE" ||
            (p.tagName === "LINK" &&
              (p.getAttribute("type") === "text/css" ||
                p.getAttribute("rel") === "stylesheet"))
          ) {
            if (
              [...s.document.head.children].some((g) =>
                g.tagName === "LINK"
                  ? g.getAttribute("href") === p.getAttribute("href")
                  : g.tagName === "STYLE"
                    ? g.innerHTML === p.innerHTML
                    : !1,
              )
            )
              return;
            s.document.head.appendChild(p.cloneNode(!0));
          }
        }));
    };
  return (
    C.useEffect(() => {
      const p = window.CSSStyleSheet.prototype.insertRule,
        h = window.CSSStyleSheet.prototype.deleteRule;
      return (
        (window.CSSStyleSheet.prototype.insertRule = function (g, y) {
          const v = Gv(g, document, y);
          return t && u ? Gv(g, u, y) : v;
        }),
        (window.CSSStyleSheet.prototype.deleteRule = function (g) {
          (Pv(document, g), t && u && Pv(u, g));
        }),
        () => {
          ((window.CSSStyleSheet.prototype.insertRule = p),
            (window.CSSStyleSheet.prototype.deleteRule = h));
        }
      );
    }, []),
    C.useEffect(() => {
      if (t) {
        (f(),
          u == null || u.addEventListener("keydown", $v),
          u == null || u.addEventListener("keyup", Vv));
        const p = new MutationObserver(() => f());
        return (
          document.documentElement.setAttribute("data-iframed", `${l}`),
          p.observe(document.head, {
            subtree: !0,
            characterData: !0,
            childList: !0,
          }),
          () => {
            (p && p.disconnect(),
              u == null || u.removeEventListener("keydown", $v),
              u == null || u.removeEventListener("keyup", Vv));
          }
        );
      }
    }, [t, r, u]),
    a
  );
};
class Bk extends C.Component {
  constructor(a) {
    (super(a), (this.state = { hasError: !1 }));
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidCatch() {}
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
const Uk = ({ activeStory: t }) =>
    x.jsxs("div", {
      className: "ladle-error-content",
      children: [
        x.jsx("h1", { children: "Story not found" }),
        x.jsxs("p", {
          children: [
            "The story id ",
            x.jsx(Pr, { children: t }),
            " you are trying to open does not exist. Typo?",
          ],
        }),
        x.jsx("p", {
          children: x.jsx(Gi, { href: "/", children: "Back to home" }),
        }),
        x.jsx("p", {
          children: x.jsx(Gi, {
            href: "https://github.com/tajo/ladle",
            children: "GitHub",
          }),
        }),
        x.jsx("p", {
          children: x.jsx(Gi, {
            href: "https://www.ladle.dev",
            children: "Docs",
          }),
        }),
      ],
    }),
  Fk = (t) => {
    const a = ca.parse(t).source;
    return a === "true"
      ? !0
      : a === "false"
        ? !1
        : Oe.addons.source.defaultState;
  },
  lS = ({
    children: t,
    theme: a,
    language: r = "tsx",
    locStart: l,
    locEnd: s,
    className: u,
  }) => {
    const f = typeof l < "u" && typeof s < "u",
      p = /language-(\w+)/.exec(u || "");
    return p
      ? ((r = p[1]),
        x.jsx(Bv, {
          code: t.trim(),
          language: r,
          theme:
            a === "dark"
              ? Oe.addons.source.themeDark
              : Oe.addons.source.themeLight,
          children: ({ className: h, style: g, tokens: y, getTokenProps: v }) =>
            x.jsx("div", {
              className: h,
              style: {
                ...g,
                textAlign: "left",
                margin: "0.5em 0 1em 0",
                padding: "1em",
              },
              children: y.map((E, w) =>
                x.jsx(
                  "div",
                  {
                    children: E.map((S, b) =>
                      x.jsx("span", { ...v({ token: S }) }, b),
                    ),
                  },
                  w,
                ),
              ),
            }),
        }))
      : f
        ? x.jsx(Bv, {
            code: t.trim(),
            language: r,
            theme:
              a === "dark"
                ? Oe.addons.source.themeDark
                : Oe.addons.source.themeLight,
            children: ({
              className: h,
              style: g,
              tokens: y,
              getLineProps: v,
              getTokenProps: E,
            }) =>
              x.jsx("pre", {
                className: h,
                style: {
                  ...g,
                  textAlign: "left",
                  margin: "0.5em 0 1em 0",
                  padding: "1em 0",
                  overflow: "auto",
                  maxHeight: "50vh",
                },
                children: y.map((w, S) =>
                  x.jsxs(
                    "div",
                    {
                      id: `ladle_loc_${S + 1}`,
                      ...v({ line: w, key: S }),
                      style: { display: "table-row" },
                      children: [
                        x.jsx("span", {
                          className: "ladle-addon-source-lineno",
                          style:
                            S + 1 >= l && S + 1 <= s
                              ? {
                                  backgroundColor: "var(--ladle-color-accent)",
                                  color: "#FFF",
                                }
                              : void 0,
                          children: S + 1,
                        }),
                        x.jsx("div", {
                          style: {
                            display: "table-cell",
                            paddingLeft: "0.5em",
                          },
                          children: w.map((b, O) =>
                            x.jsx("span", { ...E({ token: b, key: O }) }, O),
                          ),
                        }),
                      ],
                    },
                    S,
                  ),
                ),
              }),
          })
        : x.jsx("code", { children: t });
  },
  Ik = ({ globalState: t }) => {
    if (!Ji[t.story])
      return x.jsx(x.Fragment, { children: "There is no story loaded." });
    const { entry: a, locStart: r, locEnd: l } = Ji[t.story];
    return (
      C.useEffect(() => {
        ((window.location.hash = ""),
          (window.location.hash = `ladle_loc_${r}`));
      }, [r]),
      x.jsxs(x.Fragment, {
        children: [
          x.jsx(vR, { path: a, locStart: r, locEnd: l }),
          x.jsx(lS, {
            theme: t.theme,
            language: "tsx",
            locEnd: l,
            locStart: r,
            children: decodeURIComponent(bR[t.story]),
          }),
        ],
      })
    );
  },
  Hk = ({ globalState: t, dispatch: a }) => {
    const r = "Show the story source code.";
    return (
      Rn(
        Oe.hotkeys.source,
        () => {
          a({ type: Ve.UpdateSource, value: !t.source });
        },
        { enabled: t.hotkeys && Oe.addons.source.enabled },
      ),
      x.jsx("li", {
        children: x.jsxs("button", {
          "aria-label": r,
          "data-testid": "addon-source",
          title: r,
          onClick: () => {
            a({ type: Ve.UpdateSource, value: !t.source });
          },
          className: t.source ? "source-active" : "",
          type: "button",
          children: [
            x.jsx(w_, {}),
            x.jsx("span", { className: "ladle-addon-tooltip", children: r }),
            x.jsx("label", { children: "Story Source Code" }),
            x.jsx(el, {
              isOpen: t.source,
              close: () => a({ type: Ve.UpdateSource, value: !1 }),
              label: "Dialog with the story source code.",
              children: x.jsx(Ik, { globalState: t }),
            }),
          ],
        }),
      })
    );
  },
  ra = Date;
let ip = null;
const Wi = class extends ra {
  constructor(a, r, l, s, u, f, p) {
    super();
    let h;
    switch (arguments.length) {
      case 0:
        ip !== null ? (h = new ra(ip.valueOf())) : (h = new ra());
        break;
      case 1:
        h = new ra(a);
        break;
      default:
        ((l = typeof l > "u" ? 1 : l),
          (s = s || 0),
          (u = u || 0),
          (f = f || 0),
          (p = p || 0),
          (h = new ra(a, r, l, s, u, f, p)));
        break;
    }
    return h;
  }
  static [Symbol.hasInstance](a) {
    return a instanceof ra;
  }
};
Wi.UTC = ra.UTC;
Wi.now = function () {
  return new Wi().valueOf();
};
Wi.parse = function (t) {
  return ra.parse(t);
};
Wi.toString = function () {
  return ra.toString();
};
function $k(t) {
  const a = new Date(t.valueOf());
  if (isNaN(a.getTime()))
    throw new TypeError("mockdate: The time set is an invalid date: " + t);
  ((Date = Wi), (ip = a.valueOf()));
}
function Vk() {
  Date = ra;
}
const Gk = ({ children: t, active: a, width: r, story: l, mode: s }) =>
    (!a && r === 0) || s === Xt.Preview
      ? t
      : x.jsx(Mk, {
          title: `Story ${l}`,
          initialContent:
            '<!DOCTYPE html><html><head><base target="_parent" /></head><body style="margin:0"><div id="root"></div></body></html>',
          mountTarget: "#root",
          className: "ladle-iframe",
          style: { width: r || "100%" },
          children: t,
        }),
  qv = ({ globalState: t, dispatch: a }) => {
    var g;
    const r = Ji[t.story],
      l = t.width,
      s = (g = r == null ? void 0 : r.meta) == null ? void 0 : g.meta,
      u = s ? s.hotkeys : !0,
      f = s ? s.mockDate : void 0,
      p = r && s ? s.iframed : !1;
    let h = r && s ? s.width : 0;
    return (
      Object.keys(Oe.addons.width.options).forEach((y) => {
        y === h && (h = Oe.addons.width.options[y]);
      }),
      C.useEffect(() => {
        f ? $k(f) : Vk();
      }, [f]),
      C.useEffect(() => {
        typeof u < "u" &&
          u !== t.hotkeys &&
          a({ type: Ve.UpdateHotkeys, value: u });
      }, [u]),
      C.useEffect(() => {
        if (h && h !== 0) {
          a({ type: Ve.UpdateWidth, value: h });
          return;
        }
        Oe.addons.width.defaultState !== 0 &&
          a({ type: Ve.UpdateWidth, value: Oe.addons.width.defaultState });
      }, [h, t.story]),
      C.useEffect(() => {
        t.mode !== Xt.Preview && (p || l)
          ? document.documentElement.setAttribute("data-iframed", `${l}`)
          : document.documentElement.removeAttribute("data-iframed");
      }, [p, t.story, t.mode, t.width]),
      t.story
        ? x.jsx(Bk, {
            children: x.jsx(C.Suspense, {
              fallback: x.jsx(m_, {}),
              children: x.jsx(Gk, {
                active: p,
                story: t.story,
                width: l,
                mode: t.mode,
                children: x.jsx(zk, {
                  active: (p || l > 0) && t.mode !== Xt.Preview,
                  rtl: t.rtl,
                  width: l,
                  children: x.jsx(kk, {
                    components: {
                      code: (y) => x.jsx(lS, { ...y, theme: t.theme }),
                    },
                    children: x.jsx(mR, {
                      config: Oe,
                      globalState: t,
                      dispatch: a,
                      storyMeta: s,
                      children: r
                        ? C.createElement(r.component)
                        : x.jsx(Uk, { activeStory: t.story }),
                    }),
                  }),
                }),
              }),
            }),
          })
        : null
    );
  },
  Pk = () =>
    x.jsxs("div", {
      className: "ladle-error-content",
      children: [
        x.jsx("h1", { children: "No stories found" }),
        x.jsxs("p", {
          children: [
            "The configured glob pattern for stories is: ",
            x.jsx(Pr, { children: An.stories }),
            ".",
          ],
        }),
        x.jsxs("p", {
          children: [
            "It can be changed through the",
            " ",
            x.jsx(Gi, {
              href: "https://www.ladle.dev/docs/config#story-filenames",
              children: "configuration file",
            }),
            " ",
            "or CLI flag ",
            x.jsx(Pr, { children: "--stories=your-glob" }),
            ".",
          ],
        }),
        x.jsx("p", {
          children: x.jsx(Gi, {
            href: "https://github.com/tajo/ladle",
            children: "GitHub",
          }),
        }),
        x.jsx("p", {
          children: x.jsx(Gi, {
            href: "https://www.ladle.dev",
            children: "Docs",
          }),
        }),
      ],
    });
var Td = { exports: {} };
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/ var Yv;
function qk() {
  return (
    Yv ||
      ((Yv = 1),
      (function (t) {
        (function () {
          var a = {}.hasOwnProperty;
          function r() {
            for (var u = "", f = 0; f < arguments.length; f++) {
              var p = arguments[f];
              p && (u = s(u, l(p)));
            }
            return u;
          }
          function l(u) {
            if (typeof u == "string" || typeof u == "number") return u;
            if (typeof u != "object") return "";
            if (Array.isArray(u)) return r.apply(null, u);
            if (
              u.toString !== Object.prototype.toString &&
              !u.toString.toString().includes("[native code]")
            )
              return u.toString();
            var f = "";
            for (var p in u) a.call(u, p) && u[p] && (f = s(f, p));
            return f;
          }
          function s(u, f) {
            return f ? (u ? u + " " + f : u + f) : u;
          }
          t.exports
            ? ((r.default = r), (t.exports = r))
            : (window.classNames = r);
        })();
      })(Td)),
    Td.exports
  );
}
var Yk = qk();
const oS = Oo(Yk);
function Lu() {
  return (
    (Lu = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var a = 1; a < arguments.length; a++) {
            var r = arguments[a];
            for (var l in r) ({}).hasOwnProperty.call(r, l) && (t[l] = r[l]);
          }
          return t;
        }),
    Lu.apply(null, arguments)
  );
}
var Gr;
(function (t) {
  ((t.Pop = "POP"), (t.Push = "PUSH"), (t.Replace = "REPLACE"));
})(Gr || (Gr = {}));
var Zv = function (t) {
    return t;
  },
  Xv = "beforeunload",
  Zk = "popstate";
function Xk(t) {
  t === void 0 && (t = {});
  var a = t,
    r = a.window,
    l = r === void 0 ? document.defaultView : r,
    s = l.history;
  function u() {
    var q = l.location,
      ie = q.pathname,
      se = q.search,
      ve = q.hash,
      Te = s.state || {};
    return [
      Te.idx,
      Zv({
        pathname: ie,
        search: se,
        hash: ve,
        state: Te.usr || null,
        key: Te.key || "default",
      }),
    ];
  }
  var f = null;
  function p() {
    if (f) (w.call(f), (f = null));
    else {
      var q = Gr.Pop,
        ie = u(),
        se = ie[0],
        ve = ie[1];
      if (w.length) {
        if (se != null) {
          var Te = y - se;
          Te &&
            ((f = {
              action: q,
              location: ve,
              retry: function () {
                ae(Te * -1);
              },
            }),
            ae(Te));
        }
      } else L(q);
    }
  }
  l.addEventListener(Zk, p);
  var h = Gr.Pop,
    g = u(),
    y = g[0],
    v = g[1],
    E = Qv(),
    w = Qv();
  y == null && ((y = 0), s.replaceState(Lu({}, s.state, { idx: y }), ""));
  function S(q) {
    return typeof q == "string" ? q : Qk(q);
  }
  function b(q, ie) {
    return (
      ie === void 0 && (ie = null),
      Zv(
        Lu(
          { pathname: v.pathname, hash: "", search: "" },
          typeof q == "string" ? Jk(q) : q,
          { state: ie, key: Kk() },
        ),
      )
    );
  }
  function O(q, ie) {
    return [{ usr: q.state, key: q.key, idx: ie }, S(q)];
  }
  function k(q, ie, se) {
    return !w.length || (w.call({ action: q, location: ie, retry: se }), !1);
  }
  function L(q) {
    h = q;
    var ie = u();
    ((y = ie[0]), (v = ie[1]), E.call({ action: h, location: v }));
  }
  function z(q, ie) {
    var se = Gr.Push,
      ve = b(q, ie);
    function Te() {
      z(q, ie);
    }
    if (k(se, ve, Te)) {
      var Y = O(ve, y + 1),
        oe = Y[0],
        ue = Y[1];
      try {
        s.pushState(oe, "", ue);
      } catch {
        l.location.assign(ue);
      }
      L(se);
    }
  }
  function Q(q, ie) {
    var se = Gr.Replace,
      ve = b(q, ie);
    function Te() {
      Q(q, ie);
    }
    if (k(se, ve, Te)) {
      var Y = O(ve, y),
        oe = Y[0],
        ue = Y[1];
      (s.replaceState(oe, "", ue), L(se));
    }
  }
  function ae(q) {
    s.go(q);
  }
  var re = {
    get action() {
      return h;
    },
    get location() {
      return v;
    },
    createHref: S,
    push: z,
    replace: Q,
    go: ae,
    back: function () {
      ae(-1);
    },
    forward: function () {
      ae(1);
    },
    listen: function (ie) {
      return E.push(ie);
    },
    block: function (ie) {
      var se = w.push(ie);
      return (
        w.length === 1 && l.addEventListener(Xv, Kv),
        function () {
          (se(), w.length || l.removeEventListener(Xv, Kv));
        }
      );
    },
  };
  return re;
}
function Kv(t) {
  (t.preventDefault(), (t.returnValue = ""));
}
function Qv() {
  var t = [];
  return {
    get length() {
      return t.length;
    },
    push: function (r) {
      return (
        t.push(r),
        function () {
          t = t.filter(function (l) {
            return l !== r;
          });
        }
      );
    },
    call: function (r) {
      t.forEach(function (l) {
        return l && l(r);
      });
    },
  };
}
function Kk() {
  return Math.random().toString(36).substr(2, 8);
}
function Qk(t) {
  var a = t.pathname,
    r = a === void 0 ? "/" : a,
    l = t.search,
    s = l === void 0 ? "" : l,
    u = t.hash,
    f = u === void 0 ? "" : u;
  return (
    s && s !== "?" && (r += s.charAt(0) === "?" ? s : "?" + s),
    f && f !== "#" && (r += f.charAt(0) === "#" ? f : "#" + f),
    r
  );
}
function Jk(t) {
  var a = {};
  if (t) {
    var r = t.indexOf("#");
    r >= 0 && ((a.hash = t.substr(r)), (t = t.substr(0, r)));
    var l = t.indexOf("?");
    (l >= 0 && ((a.search = t.substr(l)), (t = t.substr(0, l))),
      t && (a.pathname = t));
  }
  return a;
}
const Pp = Xk(),
  Wk = () => {
    Pp.push(vo({}));
  },
  sS = (t) => {
    Object.keys(t).forEach((a) => {
      const r = t[a],
        l = Oe.addons[a] ? Oe.addons[a].defaultState : "$$LADLE_unknown";
      r === l && delete t[a];
    });
  },
  Ad = (t) => {
    if (!t.controlInitialized) return;
    const a = ca.parse(location.search),
      r = {};
    Object.keys(a).forEach((s) => {
      s.startsWith("arg-") || (r[s] = a[s]);
    });
    const l = {
      ...r,
      mode: t.mode,
      rtl: t.rtl,
      source: t.source,
      story: t.story,
      theme: t.theme,
      width: t.width,
      control: t.control,
    };
    (sS(l),
      location.search !== vo(l) &&
        (la(`Updating URL to ${vo(l)}`), Pp.push(vo(l))));
  },
  vo = (t) => {
    sS(t);
    const a = {};
    return (
      Object.keys(t).forEach((r) => {
        r === "control"
          ? Object.keys(t[r]).forEach((l) => {
              const s = t[r][l];
              if (s.type === Ue.Action) return;
              let u = s.value,
                f = !1;
              u = encodeURI(
                typeof s.value == "string" ? s.value : JSON.stringify(s.value),
              );
              try {
                ((f =
                  JSON.stringify(s.value) === JSON.stringify(s.defaultValue)),
                  !f &&
                    JSON.stringify(u) !== JSON.stringify(s.defaultValue) &&
                    (a[`arg-${l}`] = u));
              } catch {}
            })
          : (a[r] = t[r]);
      }),
      `?${ca.stringify(a)}`
    );
  },
  uS = (t) =>
    t.isExpanded && t.children && t.children.length
      ? uS(t.children[t.children.length - 1])
      : t.id,
  cS = (t, a, r) => {
    for (let l = 0; l < t.length; l++) {
      if (t[l].id === a) return r;
      if (t[l].isExpanded && t[l].children && t[l].children.length) {
        const s = cS(t[l].children, a, t[l].id);
        if (s) return s;
      }
    }
    return null;
  },
  fS = (t, a, r) => {
    for (let l = 0; l < t.length; l++) {
      if (t[l].id === a) return l === 0 ? r : uS(t[l - 1]);
      if (t[l].isExpanded && t[l].children && t[l].children.length) {
        const s = fS(t[l].children, a, t[l].id);
        if (s) return s;
      }
    }
    return null;
  },
  dS = (t, a) => {
    for (let r = 0; r < t.length; r++) {
      if (t[r].id === a) return t[r].children;
      const l = dS(t[r].children, a);
      if (l.length) return l;
    }
    return [];
  },
  pS = (t, a) => (t[0].isLinkable ? t[0] : pS(t[0].children)),
  hS = (t, a) => {
    for (let r = 0; r < t.length; r++) {
      if (
        t[r].id === a &&
        t[r].isExpanded &&
        t[r].children &&
        t[r].children.length
      )
        return t[r].children[0].id;
      if (t[r].isExpanded && t[r].children && t[r].children.length) {
        const l = hS(t[r].children, a);
        if (l) return l;
      }
    }
    return null;
  },
  gS = (t, a, r) => {
    for (let l = 0; l < t.length; l++) {
      if (t[l].id === a)
        return t[l].isExpanded && t[l].children && t[l].children.length
          ? t[l].children[0].id
          : t[l + 1]
            ? t[l + 1].id
            : r;
      if (t[l].isExpanded && t[l].children && t[l].children.length) {
        const s = gS(t[l].children, a, t[l + 1] ? t[l + 1].id : r);
        if (s) return s;
      }
    }
    return null;
  },
  yS = (t) => {
    const a = t[t.length - 1];
    return a.isExpanded && a.children && a.children.length
      ? yS(a.children)
      : a.id;
  },
  po = (t, a) =>
    t.map((r, l) => {
      const s = { ...r };
      return (
        s.id === a.id && (s.isExpanded = !s.isExpanded),
        a.id === "+" && l === 0 && (s.isExpanded = !0),
        a.id === "-" && (s.isExpanded = !1),
        s.children &&
          s.children.length &&
          (s.children = po(
            s.children,
            s.id === a.id ? { id: s.isExpanded ? "+" : "-" } : a,
          )),
        s
      );
    });
function e2(t, a) {
  let r;
  return function (...l) {
    (r !== void 0 && clearTimeout(r),
      (r = window.setTimeout(() => {
        (t.apply(this, l), (r = void 0));
      }, a)));
  };
}
const t2 = ({
    stories: t,
    story: a,
    updateStory: r,
    allExpanded: l,
    searchRef: s,
    setTreeRootRef: u,
    hotkeys: f,
  }) => {
    const p = C.useRef({}),
      [h, g] = C.useState(nd(t, a, l));
    C.useEffect(() => {
      g(nd(t, a, l));
    }, [t.join(",")]);
    const [y, v] = C.useState(h.length ? h[0].id : null),
      E = (b) => {
        var O;
        (b && p && p.current[b] && ((O = p.current[b]) == null || O.focus()),
          v(b || h[0].id),
          !b && s.current.focus());
      },
      w = (b) => {
        b && (r(b), g(nd(t, b, l)), setTimeout(() => E(b), 1));
      };
    (Rn(
      Oe.hotkeys.nextStory,
      () => {
        const b = t.findIndex((O) => O === a);
        w(t[b + 1]);
      },
      { preventDefault: !0, enableOnFormTags: !0, enabled: f },
    ),
      Rn(
        Oe.hotkeys.previousStory,
        () => {
          const b = t.findIndex((O) => O === a);
          w(t[b - 1]);
        },
        { preventDefault: !0, enableOnFormTags: !0, enabled: f },
      ),
      Rn(
        Oe.hotkeys.nextComponent,
        () => {
          const b = t.findIndex((L) => L === a),
            O = t[b].split("--"),
            k = O[O.length - 2];
          for (let L = b + 1; L < t.length; L++) {
            const z = t[L].split("--");
            if (z[z.length - 2] !== k) {
              w(t[L]);
              return;
            }
          }
        },
        { preventDefault: !0, enableOnFormTags: !0, enabled: f },
      ),
      Rn(
        Oe.hotkeys.previousComponent,
        () => {
          const b = t.findIndex((L) => L === a),
            O = t[b].split("--"),
            k = O[O.length - 2];
          for (let L = b - 1; L >= 0; L--) {
            const z = t[L].split("--"),
              Q = L > 0 ? t[L - 1].split("--") : ["", ""];
            if (z[z.length - 2] !== k && Q[Q.length - 2] !== z[z.length - 2]) {
              w(t[L]);
              return;
            }
          }
        },
        { preventDefault: !0, enableOnFormTags: !0, enabled: f },
      ));
    const S = (b, O) => {
      if (!(b.metaKey || b.ctrlKey || b.altKey))
        switch (b.key) {
          case "ArrowRight":
            (b.preventDefault(),
              b.stopPropagation(),
              O.isExpanded ? E(hS(h, O.id)) : g(po(h, O)));
            break;
          case "ArrowLeft":
            (b.preventDefault(),
              b.stopPropagation(),
              O.isExpanded ? g(po(h, O)) : E(cS(h, O.id, null)));
            break;
          case "ArrowUp":
            (b.preventDefault(), b.stopPropagation(), E(fS(h, O.id, null)));
            break;
          case "ArrowDown": {
            (b.preventDefault(), b.stopPropagation());
            const k = gS(h, O.id, null);
            k && E(k);
            break;
          }
          case " ":
          case "Enter":
            b.target.href ||
              (b.preventDefault(), b.stopPropagation(), g(po(h, O)));
            break;
          case "Home":
            (b.preventDefault(), b.stopPropagation(), h.length && E(h[0].id));
            break;
          case "End":
            (b.preventDefault(), b.stopPropagation(), E(yS(h)));
            break;
        }
    };
    return x.jsx("ul", {
      role: "tree",
      style: { marginInlineStart: "-6px" },
      ref: (b) => u(b),
      children: x.jsx(mS, {
        tree: h,
        fullTree: h,
        story: a,
        updateStory: r,
        onItemClick: (b) => {
          const O = po(h, b),
            k = pS(dS(O, b.id), b.id);
          (k && a !== k.id && k.isExpanded && r(k.id), g(O));
        },
        selectedItemId: y,
        onKeyDownFn: S,
        treeItemRefs: p,
      }),
    });
  },
  mS = ({
    tree: t,
    fullTree: a,
    story: r,
    updateStory: l,
    onItemClick: s,
    onKeyDownFn: u,
    selectedItemId: f,
    treeItemRefs: p,
  }) =>
    x.jsx(C.Fragment, {
      children: t.map((h) =>
        x.jsxs(
          "li",
          {
            onDragStart: (g) => g.preventDefault(),
            onKeyDown: (g) => u(g, h),
            "aria-expanded": h.isExpanded,
            title: h.name,
            tabIndex: h.id === f && !h.isLinkable ? 0 : -1,
            ref: h.isLinkable ? void 0 : (g) => (p.current[h.id] = g),
            role: "treeitem",
            className: oS({
              "ladle-linkable": h.isLinkable,
              "ladle-active": h.id === r,
            }),
            style: h.isLinkable ? {} : { marginTop: "0.5em" },
            children: [
              h.isLinkable
                ? x.jsxs("div", {
                    style: { display: "flex" },
                    children: [
                      x.jsx(S_, {}),
                      x.jsx("a", {
                        tabIndex: h.id === f ? 0 : -1,
                        ref: (g) => (p.current[h.id] = g),
                        href: vo({ story: h.id }),
                        onKeyDown: (g) => r !== h.id && u(g, h),
                        onClick: (g) => {
                          !g.ctrlKey &&
                            !g.metaKey &&
                            (g.preventDefault(), r !== h.id && l(h.id));
                        },
                        children: h.name,
                      }),
                    ],
                  })
                : x.jsxs("div", {
                    style: { display: "flex", cursor: "pointer" },
                    title: h.name,
                    onClick: () => s(h),
                    children: [
                      x.jsx(E_, { rotate: !h.isExpanded }),
                      x.jsx("div", {
                        style: {
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        },
                        children: h.name,
                      }),
                    ],
                  }),
              Object.keys(h.children).length > 0 &&
                h.isExpanded &&
                x.jsx("ul", {
                  role: "group",
                  children: x.jsx(mS, {
                    tree: h.children,
                    fullTree: a,
                    story: r,
                    updateStory: l,
                    selectedItemId: f,
                    onKeyDownFn: u,
                    onItemClick: s,
                    treeItemRefs: p,
                  }),
                }),
            ],
          },
          h.id,
        ),
      ),
    }),
  vS = "a268b4",
  lp = `ladle-settings-${vS}`,
  bS = { appId: vS },
  n2 = (t) => {
    const a = localStorage.getItem(lp);
    let r = bS;
    try {
      a && (r = JSON.parse(a));
    } catch {}
    localStorage.setItem(lp, JSON.stringify({ ...r, ...t }));
  },
  a2 = () => {
    const t = localStorage.getItem(lp);
    let a = bS;
    try {
      t && (a = JSON.parse(t));
    } catch {}
    return a;
  },
  r2 = 240,
  Rd = 192,
  kd = 920,
  Dd = e2(n2, 250),
  i2 = ({
    stories: t,
    story: a,
    updateStory: r,
    hotkeys: l,
    search: s,
    setSearch: u,
  }) => {
    const [f, p] = C.useState(a2().sidebarWidth || r2),
      [h, g] = C.useState(!1),
      y = C.useRef(null),
      v = C.useRef(null),
      E = C.useRef(null);
    (C.useEffect(() => {
      window
        .getComputedStyle(y.current.parentElement)
        .getPropertyValue("flex-direction") === "row-reverse" &&
        document.documentElement.setAttribute("data-reversed", "");
    }, []),
      C.useEffect(() => {
        const O = (L) => {
            h &&
              p((z) => {
                const Q = document.documentElement.hasAttribute("data-reversed")
                  ? z + L.movementX
                  : z - L.movementX;
                return Q < Rd
                  ? (Dd({ sidebarWidth: Rd }), Rd)
                  : Q > kd
                    ? (Dd({ sidebarWidth: kd }), kd)
                    : (Dd({ sidebarWidth: Q }), Q);
              });
          },
          k = () => {
            h && ((document.body.style.cursor = "auto"), g(!1));
          };
        return (
          window.addEventListener("mousemove", O),
          window.addEventListener("mouseup", k),
          () => {
            (window.removeEventListener("mousemove", O),
              window.removeEventListener("mouseup", k));
          }
        );
      }, [h, g, p, y.current]),
      Rn(
        Oe.hotkeys.search,
        () => {
          var O;
          return (O = v.current) == null ? void 0 : O.focus();
        },
        { preventDefault: !0, enabled: l },
      ));
    const w = s.toLocaleLowerCase().replace(new RegExp("\\s+", "g"), "-"),
      S = t.filter((O) => O.includes(w)),
      b = (O) => {
        var k;
        O.key === "ArrowDown" &&
          (k = E.current) != null &&
          k.firstChild &&
          E.current.firstChild.focus();
      };
    return x.jsxs(x.Fragment, {
      children: [
        x.jsx("div", {
          role: "separator",
          "aria-orientation": "vertical",
          ref: y,
          className: oS("ladle-resize-handle", { "ladle-resize-active": h }),
          onDragStart: (O) => O.preventDefault(),
          onDragEnd: (O) => O.preventDefault(),
          onDrop: (O) => O.preventDefault(),
          onDragOver: (O) => O.preventDefault(),
          onDragEnter: (O) => O.preventDefault(),
          onDragLeave: (O) => O.preventDefault(),
          onMouseDown: (O) => {
            (O.preventDefault(),
              h || ((document.body.style.cursor = "col-resize"), g(!0)));
          },
        }),
        x.jsxs("nav", {
          role: "navigation",
          className: "ladle-aside",
          style: { minWidth: `${f}px` },
          children: [
            x.jsx("input", {
              placeholder: "Search",
              "aria-label": "Search stories",
              value: s,
              ref: v,
              onKeyDown: b,
              onChange: (O) => u(O.target.value),
            }),
            x.jsx(t2, {
              searchRef: v,
              stories: S,
              story: a,
              hotkeys: l,
              updateStory: r,
              allExpanded: s !== "" || Oe.expandStoryTree,
              setTreeRootRef: (O) => (E.current = O),
            }),
          ],
        }),
      ],
    });
  },
  l2 = (t) => {
    switch (ca.parse(t).mode) {
      case Xt.Full:
        return Xt.Full;
      case Xt.Preview:
        return Xt.Preview;
      default:
        return Oe.addons.mode.defaultState;
    }
  },
  o2 = ({ dispatch: t }) => {
    const a = `Open fullscreen mode. Can be toggled by pressing ${Oe.hotkeys.fullscreen.join(" or ")}.`;
    return x.jsx("li", {
      children: x.jsxs("button", {
        "aria-label": a,
        title: a,
        onClick: () => t({ type: Ve.UpdateMode, value: Xt.Preview }),
        type: "button",
        children: [
          x.jsx(v_, {}),
          x.jsx("span", { className: "ladle-addon-tooltip", children: a }),
          x.jsx("label", { children: "Open fullscreen mode" }),
        ],
      }),
    });
  };
var s2 = Object.create,
  qp = Object.defineProperty,
  u2 = Object.getOwnPropertyDescriptor,
  SS = Object.getOwnPropertyNames,
  c2 = Object.getPrototypeOf,
  f2 = Object.prototype.hasOwnProperty,
  Yp = (t, a) =>
    function () {
      return (
        a || (0, t[SS(t)[0]])((a = { exports: {} }).exports, a),
        a.exports
      );
    },
  d2 = (t, a) => {
    for (var r in a) qp(t, r, { get: a[r], enumerable: !0 });
  },
  p2 = (t, a, r, l) => {
    if ((a && typeof a == "object") || typeof a == "function")
      for (let s of SS(a))
        !f2.call(t, s) &&
          s !== r &&
          qp(t, s, {
            get: () => a[s],
            enumerable: !(l = u2(a, s)) || l.enumerable,
          });
    return t;
  },
  h2 = (t, a, r) => (
    (r = t != null ? s2(c2(t)) : {}),
    p2(
      !t || !t.__esModule ? qp(r, "default", { value: t, enumerable: !0 }) : r,
      t,
    )
  ),
  g2 = Yp({
    "node_modules/is-object/index.js"(t, a) {
      a.exports = function (l) {
        return typeof l == "object" && l !== null;
      };
    },
  }),
  y2 = Yp({
    "node_modules/is-window/index.js"(t, a) {
      a.exports = function (r) {
        if (r == null) return !1;
        var l = Object(r);
        return l === l.window;
      };
    },
  }),
  m2 = Yp({
    "node_modules/is-dom/index.js"(t, a) {
      var r = g2(),
        l = y2();
      function s(u) {
        return !r(u) || !l(window) || typeof window.Node != "function"
          ? !1
          : typeof u.nodeType == "number" && typeof u.nodeName == "string";
      }
      a.exports = s;
    },
  }),
  Nu = {};
d2(Nu, { chromeDark: () => ES, chromeLight: () => _S });
var ES = {
    BASE_FONT_FAMILY: "Menlo, monospace",
    BASE_FONT_SIZE: "11px",
    BASE_LINE_HEIGHT: 1.2,
    BASE_BACKGROUND_COLOR: "rgb(36, 36, 36)",
    BASE_COLOR: "rgb(213, 213, 213)",
    OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES: 10,
    OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES: 5,
    OBJECT_NAME_COLOR: "rgb(227, 110, 236)",
    OBJECT_VALUE_NULL_COLOR: "rgb(127, 127, 127)",
    OBJECT_VALUE_UNDEFINED_COLOR: "rgb(127, 127, 127)",
    OBJECT_VALUE_REGEXP_COLOR: "rgb(233, 63, 59)",
    OBJECT_VALUE_STRING_COLOR: "rgb(233, 63, 59)",
    OBJECT_VALUE_SYMBOL_COLOR: "rgb(233, 63, 59)",
    OBJECT_VALUE_NUMBER_COLOR: "hsl(252, 100%, 75%)",
    OBJECT_VALUE_BOOLEAN_COLOR: "hsl(252, 100%, 75%)",
    OBJECT_VALUE_FUNCTION_PREFIX_COLOR: "rgb(85, 106, 242)",
    HTML_TAG_COLOR: "rgb(93, 176, 215)",
    HTML_TAGNAME_COLOR: "rgb(93, 176, 215)",
    HTML_TAGNAME_TEXT_TRANSFORM: "lowercase",
    HTML_ATTRIBUTE_NAME_COLOR: "rgb(155, 187, 220)",
    HTML_ATTRIBUTE_VALUE_COLOR: "rgb(242, 151, 102)",
    HTML_COMMENT_COLOR: "rgb(137, 137, 137)",
    HTML_DOCTYPE_COLOR: "rgb(192, 192, 192)",
    ARROW_COLOR: "rgb(145, 145, 145)",
    ARROW_MARGIN_RIGHT: 3,
    ARROW_FONT_SIZE: 12,
    ARROW_ANIMATION_DURATION: "0",
    TREENODE_FONT_FAMILY: "Menlo, monospace",
    TREENODE_FONT_SIZE: "11px",
    TREENODE_LINE_HEIGHT: 1.2,
    TREENODE_PADDING_LEFT: 12,
    TABLE_BORDER_COLOR: "rgb(85, 85, 85)",
    TABLE_TH_BACKGROUND_COLOR: "rgb(44, 44, 44)",
    TABLE_TH_HOVER_COLOR: "rgb(48, 48, 48)",
    TABLE_SORT_ICON_COLOR: "black",
    TABLE_DATA_BACKGROUND_IMAGE:
      "linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0) 50%, rgba(51, 139, 255, 0.0980392) 50%, rgba(51, 139, 255, 0.0980392))",
    TABLE_DATA_BACKGROUND_SIZE: "128px 32px",
  },
  _S = {
    BASE_FONT_FAMILY: "Menlo, monospace",
    BASE_FONT_SIZE: "11px",
    BASE_LINE_HEIGHT: 1.2,
    BASE_BACKGROUND_COLOR: "white",
    BASE_COLOR: "black",
    OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES: 10,
    OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES: 5,
    OBJECT_NAME_COLOR: "rgb(136, 19, 145)",
    OBJECT_VALUE_NULL_COLOR: "rgb(128, 128, 128)",
    OBJECT_VALUE_UNDEFINED_COLOR: "rgb(128, 128, 128)",
    OBJECT_VALUE_REGEXP_COLOR: "rgb(196, 26, 22)",
    OBJECT_VALUE_STRING_COLOR: "rgb(196, 26, 22)",
    OBJECT_VALUE_SYMBOL_COLOR: "rgb(196, 26, 22)",
    OBJECT_VALUE_NUMBER_COLOR: "rgb(28, 0, 207)",
    OBJECT_VALUE_BOOLEAN_COLOR: "rgb(28, 0, 207)",
    OBJECT_VALUE_FUNCTION_PREFIX_COLOR: "rgb(13, 34, 170)",
    HTML_TAG_COLOR: "rgb(168, 148, 166)",
    HTML_TAGNAME_COLOR: "rgb(136, 18, 128)",
    HTML_TAGNAME_TEXT_TRANSFORM: "lowercase",
    HTML_ATTRIBUTE_NAME_COLOR: "rgb(153, 69, 0)",
    HTML_ATTRIBUTE_VALUE_COLOR: "rgb(26, 26, 166)",
    HTML_COMMENT_COLOR: "rgb(35, 110, 37)",
    HTML_DOCTYPE_COLOR: "rgb(192, 192, 192)",
    ARROW_COLOR: "#6e6e6e",
    ARROW_MARGIN_RIGHT: 3,
    ARROW_FONT_SIZE: 12,
    ARROW_ANIMATION_DURATION: "0",
    TREENODE_FONT_FAMILY: "Menlo, monospace",
    TREENODE_FONT_SIZE: "11px",
    TREENODE_LINE_HEIGHT: 1.2,
    TREENODE_PADDING_LEFT: 12,
    TABLE_BORDER_COLOR: "#aaa",
    TABLE_TH_BACKGROUND_COLOR: "#eee",
    TABLE_TH_HOVER_COLOR: "hsla(0, 0%, 90%, 1)",
    TABLE_SORT_ICON_COLOR: "#6e6e6e",
    TABLE_DATA_BACKGROUND_IMAGE:
      "linear-gradient(to bottom, white, white 50%, rgb(234, 243, 255) 50%, rgb(234, 243, 255))",
    TABLE_DATA_BACKGROUND_SIZE: "128px 32px",
  },
  wS = C.createContext([{}, () => {}]),
  Ld = {
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    KhtmlUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    OUserSelect: "none",
    userSelect: "none",
  },
  ou = (t) => ({
    DOMNodePreview: {
      htmlOpenTag: {
        base: { color: t.HTML_TAG_COLOR },
        tagName: {
          color: t.HTML_TAGNAME_COLOR,
          textTransform: t.HTML_TAGNAME_TEXT_TRANSFORM,
        },
        htmlAttributeName: { color: t.HTML_ATTRIBUTE_NAME_COLOR },
        htmlAttributeValue: { color: t.HTML_ATTRIBUTE_VALUE_COLOR },
      },
      htmlCloseTag: {
        base: { color: t.HTML_TAG_COLOR },
        offsetLeft: { marginLeft: -t.TREENODE_PADDING_LEFT },
        tagName: {
          color: t.HTML_TAGNAME_COLOR,
          textTransform: t.HTML_TAGNAME_TEXT_TRANSFORM,
        },
      },
      htmlComment: { color: t.HTML_COMMENT_COLOR },
      htmlDoctype: { color: t.HTML_DOCTYPE_COLOR },
    },
    ObjectPreview: {
      objectDescription: { fontStyle: "italic" },
      preview: { fontStyle: "italic" },
      arrayMaxProperties: t.OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES,
      objectMaxProperties: t.OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES,
    },
    ObjectName: {
      base: { color: t.OBJECT_NAME_COLOR },
      dimmed: { opacity: 0.6 },
    },
    ObjectValue: {
      objectValueNull: { color: t.OBJECT_VALUE_NULL_COLOR },
      objectValueUndefined: { color: t.OBJECT_VALUE_UNDEFINED_COLOR },
      objectValueRegExp: { color: t.OBJECT_VALUE_REGEXP_COLOR },
      objectValueString: { color: t.OBJECT_VALUE_STRING_COLOR },
      objectValueSymbol: { color: t.OBJECT_VALUE_SYMBOL_COLOR },
      objectValueNumber: { color: t.OBJECT_VALUE_NUMBER_COLOR },
      objectValueBoolean: { color: t.OBJECT_VALUE_BOOLEAN_COLOR },
      objectValueFunctionPrefix: {
        color: t.OBJECT_VALUE_FUNCTION_PREFIX_COLOR,
        fontStyle: "italic",
      },
      objectValueFunctionName: { fontStyle: "italic" },
    },
    TreeView: {
      treeViewOutline: { padding: 0, margin: 0, listStyleType: "none" },
    },
    TreeNode: {
      treeNodeBase: {
        color: t.BASE_COLOR,
        backgroundColor: t.BASE_BACKGROUND_COLOR,
        lineHeight: t.TREENODE_LINE_HEIGHT,
        cursor: "default",
        boxSizing: "border-box",
        listStyle: "none",
        fontFamily: t.TREENODE_FONT_FAMILY,
        fontSize: t.TREENODE_FONT_SIZE,
      },
      treeNodePreviewContainer: {},
      treeNodePlaceholder: {
        whiteSpace: "pre",
        fontSize: t.ARROW_FONT_SIZE,
        marginRight: t.ARROW_MARGIN_RIGHT,
        ...Ld,
      },
      treeNodeArrow: {
        base: {
          color: t.ARROW_COLOR,
          display: "inline-block",
          fontSize: t.ARROW_FONT_SIZE,
          marginRight: t.ARROW_MARGIN_RIGHT,
          ...(parseFloat(t.ARROW_ANIMATION_DURATION) > 0
            ? { transition: `transform ${t.ARROW_ANIMATION_DURATION} ease 0s` }
            : {}),
          ...Ld,
        },
        expanded: {
          WebkitTransform: "rotateZ(90deg)",
          MozTransform: "rotateZ(90deg)",
          transform: "rotateZ(90deg)",
        },
        collapsed: {
          WebkitTransform: "rotateZ(0deg)",
          MozTransform: "rotateZ(0deg)",
          transform: "rotateZ(0deg)",
        },
      },
      treeNodeChildNodesContainer: {
        margin: 0,
        paddingLeft: t.TREENODE_PADDING_LEFT,
      },
    },
    TableInspector: {
      base: {
        color: t.BASE_COLOR,
        position: "relative",
        border: `1px solid ${t.TABLE_BORDER_COLOR}`,
        fontFamily: t.BASE_FONT_FAMILY,
        fontSize: t.BASE_FONT_SIZE,
        lineHeight: "120%",
        boxSizing: "border-box",
        cursor: "default",
      },
    },
    TableInspectorHeaderContainer: {
      base: { top: 0, height: "17px", left: 0, right: 0, overflowX: "hidden" },
      table: {
        tableLayout: "fixed",
        borderSpacing: 0,
        borderCollapse: "separate",
        height: "100%",
        width: "100%",
        margin: 0,
      },
    },
    TableInspectorDataContainer: {
      tr: { display: "table-row" },
      td: {
        boxSizing: "border-box",
        border: "none",
        height: "16px",
        verticalAlign: "top",
        padding: "1px 4px",
        WebkitUserSelect: "text",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        lineHeight: "14px",
      },
      div: {
        position: "static",
        top: "17px",
        bottom: 0,
        overflowY: "overlay",
        transform: "translateZ(0)",
        left: 0,
        right: 0,
        overflowX: "hidden",
      },
      table: {
        positon: "static",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        borderTop: "0 none transparent",
        margin: 0,
        backgroundImage: t.TABLE_DATA_BACKGROUND_IMAGE,
        backgroundSize: t.TABLE_DATA_BACKGROUND_SIZE,
        tableLayout: "fixed",
        borderSpacing: 0,
        borderCollapse: "separate",
        width: "100%",
        fontSize: t.BASE_FONT_SIZE,
        lineHeight: "120%",
      },
    },
    TableInspectorTH: {
      base: {
        position: "relative",
        height: "auto",
        textAlign: "left",
        backgroundColor: t.TABLE_TH_BACKGROUND_COLOR,
        borderBottom: `1px solid ${t.TABLE_BORDER_COLOR}`,
        fontWeight: "normal",
        verticalAlign: "middle",
        padding: "0 4px",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        lineHeight: "14px",
        ":hover": { backgroundColor: t.TABLE_TH_HOVER_COLOR },
      },
      div: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        fontSize: t.BASE_FONT_SIZE,
        lineHeight: "120%",
      },
    },
    TableInspectorLeftBorder: {
      none: { borderLeft: "none" },
      solid: { borderLeft: `1px solid ${t.TABLE_BORDER_COLOR}` },
    },
    TableInspectorSortIcon: {
      display: "block",
      marginRight: 3,
      width: 8,
      height: 7,
      marginTop: -7,
      color: t.TABLE_SORT_ICON_COLOR,
      fontSize: 12,
      ...Ld,
    },
  }),
  op = "chromeLight",
  OS = C.createContext(ou(Nu[op])),
  yn = (t) => C.useContext(OS)[t],
  Zp =
    (t) =>
    ({ theme: r = op, ...l }) => {
      const s = C.useMemo(() => {
        switch (Object.prototype.toString.call(r)) {
          case "[object String]":
            return ou(Nu[r]);
          case "[object Object]":
            return ou(r);
          default:
            return ou(Nu[op]);
        }
      }, [r]);
      return W.createElement(
        OS.Provider,
        { value: s },
        W.createElement(t, { ...l }),
      );
    },
  v2 = ({ expanded: t, styles: a }) =>
    W.createElement(
      "span",
      { style: { ...a.base, ...(t ? a.expanded : a.collapsed) } },
      "▶",
    ),
  b2 = C.memo((t) => {
    t = {
      expanded: !0,
      nodeRenderer: ({ name: y }) => W.createElement("span", null, y),
      onClick: () => {},
      shouldShowArrow: !1,
      shouldShowPlaceholder: !0,
      ...t,
    };
    const {
        expanded: a,
        onClick: r,
        children: l,
        nodeRenderer: s,
        title: u,
        shouldShowArrow: f,
        shouldShowPlaceholder: p,
      } = t,
      h = yn("TreeNode"),
      g = s;
    return W.createElement(
      "li",
      { "aria-expanded": a, role: "treeitem", style: h.treeNodeBase, title: u },
      W.createElement(
        "div",
        { style: h.treeNodePreviewContainer, onClick: r },
        f || C.Children.count(l) > 0
          ? W.createElement(v2, { expanded: a, styles: h.treeNodeArrow })
          : p && W.createElement("span", { style: h.treeNodePlaceholder }, " "),
        W.createElement(g, { ...t }),
      ),
      W.createElement(
        "ol",
        { role: "group", style: h.treeNodeChildNodesContainer },
        a ? l : void 0,
      ),
    );
  }),
  Mu = "$",
  Jv = "*";
function su(t, a) {
  return !a(t).next().done;
}
var S2 = (t) =>
    Array.from({ length: t }, (a, r) =>
      [Mu].concat(Array.from({ length: r }, () => "*")).join("."),
    ),
  E2 = (t, a, r, l, s) => {
    const u = []
        .concat(S2(l))
        .concat(r)
        .filter((p) => typeof p == "string"),
      f = [];
    return (
      u.forEach((p) => {
        const h = p.split("."),
          g = (y, v, E) => {
            if (E === h.length) {
              f.push(v);
              return;
            }
            const w = h[E];
            if (E === 0) su(y, a) && (w === Mu || w === Jv) && g(y, Mu, E + 1);
            else if (w === Jv)
              for (const { name: S, data: b } of a(y))
                su(b, a) && g(b, `${v}.${S}`, E + 1);
            else {
              const S = y[w];
              su(S, a) && g(S, `${v}.${w}`, E + 1);
            }
          };
        g(t, "", 0);
      }),
      f.reduce((p, h) => ((p[h] = !0), p), { ...s })
    );
  },
  xS = C.memo((t) => {
    const { data: a, dataIterator: r, path: l, depth: s, nodeRenderer: u } = t,
      [f, p] = C.useContext(wS),
      h = su(a, r),
      g = !!f[l],
      y = C.useCallback(() => h && p((v) => ({ ...v, [l]: !g })), [h, p, l, g]);
    return W.createElement(
      b2,
      {
        expanded: g,
        onClick: y,
        shouldShowArrow: h,
        shouldShowPlaceholder: s > 0,
        nodeRenderer: u,
        ...t,
      },
      g
        ? [...r(a)].map(({ name: v, data: E, ...w }) =>
            W.createElement(xS, {
              name: v,
              data: E,
              depth: s + 1,
              path: `${l}.${v}`,
              key: v,
              dataIterator: r,
              nodeRenderer: u,
              ...w,
            }),
          )
        : null,
    );
  }),
  CS = C.memo(
    ({
      name: t,
      data: a,
      dataIterator: r,
      nodeRenderer: l,
      expandPaths: s,
      expandLevel: u,
    }) => {
      const f = yn("TreeView"),
        p = C.useState({}),
        [, h] = p;
      return (
        C.useLayoutEffect(() => h((g) => E2(a, r, s, u, g)), [a, r, s, u]),
        W.createElement(
          wS.Provider,
          { value: p },
          W.createElement(
            "ol",
            { role: "tree", style: f.treeViewOutline },
            W.createElement(xS, {
              name: t,
              data: a,
              dataIterator: r,
              depth: 0,
              path: Mu,
              nodeRenderer: l,
            }),
          ),
        )
      );
    },
  ),
  Xp = ({ name: t, dimmed: a = !1, styles: r = {} }) => {
    const l = yn("ObjectName"),
      s = { ...l.base, ...(a ? l.dimmed : {}), ...r };
    return W.createElement("span", { style: s }, t);
  },
  bo = ({ object: t, styles: a }) => {
    const r = yn("ObjectValue"),
      l = (s) => ({ ...r[s], ...a });
    switch (typeof t) {
      case "bigint":
        return W.createElement(
          "span",
          { style: l("objectValueNumber") },
          String(t),
          "n",
        );
      case "number":
        return W.createElement(
          "span",
          { style: l("objectValueNumber") },
          String(t),
        );
      case "string":
        return W.createElement(
          "span",
          { style: l("objectValueString") },
          '"',
          t,
          '"',
        );
      case "boolean":
        return W.createElement(
          "span",
          { style: l("objectValueBoolean") },
          String(t),
        );
      case "undefined":
        return W.createElement(
          "span",
          { style: l("objectValueUndefined") },
          "undefined",
        );
      case "object":
        return t === null
          ? W.createElement("span", { style: l("objectValueNull") }, "null")
          : t instanceof Date
            ? W.createElement("span", null, t.toString())
            : t instanceof RegExp
              ? W.createElement(
                  "span",
                  { style: l("objectValueRegExp") },
                  t.toString(),
                )
              : Array.isArray(t)
                ? W.createElement("span", null, `Array(${t.length})`)
                : t.constructor
                  ? typeof t.constructor.isBuffer == "function" &&
                    t.constructor.isBuffer(t)
                    ? W.createElement("span", null, `Buffer[${t.length}]`)
                    : W.createElement("span", null, t.constructor.name)
                  : W.createElement("span", null, "Object");
      case "function":
        return W.createElement(
          "span",
          null,
          W.createElement(
            "span",
            { style: l("objectValueFunctionPrefix") },
            "ƒ ",
          ),
          W.createElement(
            "span",
            { style: l("objectValueFunctionName") },
            t.name,
            "()",
          ),
        );
      case "symbol":
        return W.createElement(
          "span",
          { style: l("objectValueSymbol") },
          t.toString(),
        );
      default:
        return W.createElement("span", null);
    }
  },
  TS = Object.prototype.hasOwnProperty,
  _2 = Object.prototype.propertyIsEnumerable;
function sp(t, a) {
  const r = Object.getOwnPropertyDescriptor(t, a);
  if (r.get)
    try {
      return r.get();
    } catch {
      return r.get;
    }
  return t[a];
}
function Wv(t, a) {
  return t.length === 0
    ? []
    : t.slice(1).reduce((r, l) => r.concat([a, l]), [t[0]]);
}
var up = ({ data: t }) => {
    const a = yn("ObjectPreview"),
      r = t;
    if (
      typeof r != "object" ||
      r === null ||
      r instanceof Date ||
      r instanceof RegExp
    )
      return W.createElement(bo, { object: r });
    if (Array.isArray(r)) {
      const l = a.arrayMaxProperties,
        s = r
          .slice(0, l)
          .map((f, p) => W.createElement(bo, { key: p, object: f }));
      r.length > l && s.push(W.createElement("span", { key: "ellipsis" }, "…"));
      const u = r.length;
      return W.createElement(
        W.Fragment,
        null,
        W.createElement(
          "span",
          { style: a.objectDescription },
          u === 0 ? "" : `(${u}) `,
        ),
        W.createElement("span", { style: a.preview }, "[", Wv(s, ", "), "]"),
      );
    } else {
      const l = a.objectMaxProperties,
        s = [];
      for (const f in r)
        if (TS.call(r, f)) {
          let p;
          s.length === l - 1 &&
            Object.keys(r).length > l &&
            (p = W.createElement("span", { key: "ellipsis" }, "…"));
          const h = sp(r, f);
          if (
            (s.push(
              W.createElement(
                "span",
                { key: f },
                W.createElement(Xp, { name: f || '""' }),
                ": ",
                W.createElement(bo, { object: h }),
                p,
              ),
            ),
            p)
          )
            break;
        }
      const u = r.constructor ? r.constructor.name : "Object";
      return W.createElement(
        W.Fragment,
        null,
        W.createElement(
          "span",
          { style: a.objectDescription },
          u === "Object" ? "" : `${u} `,
        ),
        W.createElement("span", { style: a.preview }, "{", Wv(s, ", "), "}"),
      );
    }
  },
  w2 = ({ name: t, data: a }) =>
    typeof t == "string"
      ? W.createElement(
          "span",
          null,
          W.createElement(Xp, { name: t }),
          W.createElement("span", null, ": "),
          W.createElement(up, { data: a }),
        )
      : W.createElement(up, { data: a }),
  O2 = ({ name: t, data: a, isNonenumerable: r = !1 }) => {
    const l = a;
    return W.createElement(
      "span",
      null,
      typeof t == "string"
        ? W.createElement(Xp, { name: t, dimmed: r })
        : W.createElement(up, { data: t }),
      W.createElement("span", null, ": "),
      W.createElement(bo, { object: l }),
    );
  },
  x2 = (t, a) =>
    function* (l) {
      if (!((typeof l == "object" && l !== null) || typeof l == "function"))
        return;
      const u = Array.isArray(l);
      if (!u && l[Symbol.iterator]) {
        let f = 0;
        for (const p of l) {
          if (Array.isArray(p) && p.length === 2) {
            const [h, g] = p;
            yield { name: h, data: g };
          } else yield { name: f.toString(), data: p };
          f++;
        }
      } else {
        const f = Object.getOwnPropertyNames(l);
        a === !0 && !u ? f.sort() : typeof a == "function" && f.sort(a);
        for (const p of f)
          if (_2.call(l, p)) {
            const h = sp(l, p);
            yield { name: p || '""', data: h };
          } else if (t) {
            let h;
            try {
              h = sp(l, p);
            } catch {}
            h !== void 0 && (yield { name: p, data: h, isNonenumerable: !0 });
          }
        t &&
          l !== Object.prototype &&
          (yield {
            name: "__proto__",
            data: Object.getPrototypeOf(l),
            isNonenumerable: !0,
          });
      }
    },
  C2 = ({ depth: t, name: a, data: r, isNonenumerable: l }) =>
    t === 0
      ? W.createElement(w2, { name: a, data: r })
      : W.createElement(O2, { name: a, data: r, isNonenumerable: l }),
  T2 = ({
    showNonenumerable: t = !1,
    sortObjectKeys: a,
    nodeRenderer: r,
    ...l
  }) => {
    const s = x2(t, a),
      u = r || C2;
    return W.createElement(CS, { nodeRenderer: u, dataIterator: s, ...l });
  },
  A2 = Zp(T2);
function R2(t) {
  if (typeof t == "object") {
    let a = [];
    if (Array.isArray(t)) {
      const l = t.length;
      a = [...Array(l).keys()];
    } else t !== null && (a = Object.keys(t));
    const r = a.reduce((l, s) => {
      const u = t[s];
      return (
        typeof u == "object" &&
          u !== null &&
          Object.keys(u).reduce((p, h) => (p.includes(h) || p.push(h), p), l),
        l
      );
    }, []);
    return { rowHeaders: a, colHeaders: r };
  }
}
var k2 = ({ rows: t, columns: a, rowsData: r }) => {
    const l = yn("TableInspectorDataContainer"),
      s = yn("TableInspectorLeftBorder");
    return W.createElement(
      "div",
      { style: l.div },
      W.createElement(
        "table",
        { style: l.table },
        W.createElement("colgroup", null),
        W.createElement(
          "tbody",
          null,
          t.map((u, f) =>
            W.createElement(
              "tr",
              { key: u, style: l.tr },
              W.createElement("td", { style: { ...l.td, ...s.none } }, u),
              a.map((p) => {
                const h = r[f];
                return typeof h == "object" && h !== null && TS.call(h, p)
                  ? W.createElement(
                      "td",
                      { key: p, style: { ...l.td, ...s.solid } },
                      W.createElement(bo, { object: h[p] }),
                    )
                  : W.createElement("td", {
                      key: p,
                      style: { ...l.td, ...s.solid },
                    });
              }),
            ),
          ),
        ),
      ),
    );
  },
  D2 = (t) =>
    W.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: 1,
          right: 0,
          bottom: 1,
          display: "flex",
          alignItems: "center",
        },
      },
      t.children,
    ),
  L2 = ({ sortAscending: t }) => {
    const a = yn("TableInspectorSortIcon"),
      r = t ? "▲" : "▼";
    return W.createElement("div", { style: a }, r);
  },
  eb = ({
    sortAscending: t = !1,
    sorted: a = !1,
    onClick: r = void 0,
    borderStyle: l = {},
    children: s,
    ...u
  }) => {
    const f = yn("TableInspectorTH"),
      [p, h] = C.useState(!1),
      g = C.useCallback(() => h(!0), []),
      y = C.useCallback(() => h(!1), []);
    return W.createElement(
      "th",
      {
        ...u,
        style: { ...f.base, ...l, ...(p ? f.base[":hover"] : {}) },
        onMouseEnter: g,
        onMouseLeave: y,
        onClick: r,
      },
      W.createElement("div", { style: f.div }, s),
      a && W.createElement(D2, null, W.createElement(L2, { sortAscending: t })),
    );
  },
  N2 = ({
    indexColumnText: t = "(index)",
    columns: a = [],
    sorted: r,
    sortIndexColumn: l,
    sortColumn: s,
    sortAscending: u,
    onTHClick: f,
    onIndexTHClick: p,
  }) => {
    const h = yn("TableInspectorHeaderContainer"),
      g = yn("TableInspectorLeftBorder");
    return W.createElement(
      "div",
      { style: h.base },
      W.createElement(
        "table",
        { style: h.table },
        W.createElement(
          "tbody",
          null,
          W.createElement(
            "tr",
            null,
            W.createElement(
              eb,
              {
                borderStyle: g.none,
                sorted: r && l,
                sortAscending: u,
                onClick: p,
              },
              t,
            ),
            a.map((y) =>
              W.createElement(
                eb,
                {
                  borderStyle: g.solid,
                  key: y,
                  sorted: r && s === y,
                  sortAscending: u,
                  onClick: f.bind(null, y),
                },
                y,
              ),
            ),
          ),
        ),
      ),
    );
  },
  M2 = ({ data: t, columns: a }) => {
    const r = yn("TableInspector"),
      [{ sorted: l, sortIndexColumn: s, sortColumn: u, sortAscending: f }, p] =
        C.useState({
          sorted: !1,
          sortIndexColumn: !1,
          sortColumn: void 0,
          sortAscending: !1,
        }),
      h = C.useCallback(() => {
        p(({ sortIndexColumn: S, sortAscending: b }) => ({
          sorted: !0,
          sortIndexColumn: !0,
          sortColumn: void 0,
          sortAscending: S ? !b : !0,
        }));
      }, []),
      g = C.useCallback((S) => {
        p(({ sortColumn: b, sortAscending: O }) => ({
          sorted: !0,
          sortIndexColumn: !1,
          sortColumn: S,
          sortAscending: S === b ? !O : !0,
        }));
      }, []);
    if (typeof t != "object" || t === null) return W.createElement("div", null);
    let { rowHeaders: y, colHeaders: v } = R2(t);
    a !== void 0 && (v = a);
    let E = y.map((S) => t[S]),
      w;
    if (
      (u !== void 0
        ? (w = E.map((S, b) =>
            typeof S == "object" && S !== null ? [S[u], b] : [void 0, b],
          ))
        : s && (w = y.map((S, b) => [y[b], b])),
      w !== void 0)
    ) {
      const S = (O, k) => (L, z) => {
          const Q = O(L),
            ae = O(z),
            re = typeof Q,
            q = typeof ae,
            ie = (ve, Te) => (ve < Te ? -1 : ve > Te ? 1 : 0);
          let se;
          if (re === q) se = ie(Q, ae);
          else {
            const ve = {
              string: 0,
              number: 1,
              object: 2,
              symbol: 3,
              boolean: 4,
              undefined: 5,
              function: 6,
            };
            se = ie(ve[re], ve[q]);
          }
          return (k || (se = -se), se);
        },
        b = w.sort(S((O) => O[0], f)).map((O) => O[1]);
      ((y = b.map((O) => y[O])), (E = b.map((O) => E[O])));
    }
    return W.createElement(
      "div",
      { style: r.base },
      W.createElement(N2, {
        columns: v,
        sorted: l,
        sortIndexColumn: s,
        sortColumn: u,
        sortAscending: f,
        onTHClick: g,
        onIndexTHClick: h,
      }),
      W.createElement(k2, { rows: y, columns: v, rowsData: E }),
    );
  },
  j2 = Zp(M2),
  z2 = 80,
  AS = (t) =>
    t.childNodes.length === 0 ||
    (t.childNodes.length === 1 &&
      t.childNodes[0].nodeType === Node.TEXT_NODE &&
      t.textContent.length < z2),
  B2 = ({ tagName: t, attributes: a, styles: r }) =>
    W.createElement(
      "span",
      { style: r.base },
      "<",
      W.createElement("span", { style: r.tagName }, t),
      (() => {
        if (a) {
          const l = [];
          for (let s = 0; s < a.length; s++) {
            const u = a[s];
            l.push(
              W.createElement(
                "span",
                { key: s },
                " ",
                W.createElement("span", { style: r.htmlAttributeName }, u.name),
                '="',
                W.createElement(
                  "span",
                  { style: r.htmlAttributeValue },
                  u.value,
                ),
                '"',
              ),
            );
          }
          return l;
        }
      })(),
      ">",
    ),
  tb = ({ tagName: t, isChildNode: a = !1, styles: r }) =>
    W.createElement(
      "span",
      { style: Object.assign({}, r.base, a && r.offsetLeft) },
      "</",
      W.createElement("span", { style: r.tagName }, t),
      ">",
    ),
  U2 = {
    1: "ELEMENT_NODE",
    3: "TEXT_NODE",
    7: "PROCESSING_INSTRUCTION_NODE",
    8: "COMMENT_NODE",
    9: "DOCUMENT_NODE",
    10: "DOCUMENT_TYPE_NODE",
    11: "DOCUMENT_FRAGMENT_NODE",
  },
  F2 = ({ isCloseTag: t, data: a, expanded: r }) => {
    const l = yn("DOMNodePreview");
    if (t)
      return W.createElement(tb, {
        styles: l.htmlCloseTag,
        isChildNode: !0,
        tagName: a.tagName,
      });
    switch (a.nodeType) {
      case Node.ELEMENT_NODE:
        return W.createElement(
          "span",
          null,
          W.createElement(B2, {
            tagName: a.tagName,
            attributes: a.attributes,
            styles: l.htmlOpenTag,
          }),
          AS(a) ? a.textContent : !r && "…",
          !r &&
            W.createElement(tb, { tagName: a.tagName, styles: l.htmlCloseTag }),
        );
      case Node.TEXT_NODE:
        return W.createElement("span", null, a.textContent);
      case Node.CDATA_SECTION_NODE:
        return W.createElement(
          "span",
          null,
          "<![CDATA[" + a.textContent + "]]>",
        );
      case Node.COMMENT_NODE:
        return W.createElement(
          "span",
          { style: l.htmlComment },
          "<!--",
          a.textContent,
          "-->",
        );
      case Node.PROCESSING_INSTRUCTION_NODE:
        return W.createElement("span", null, a.nodeName);
      case Node.DOCUMENT_TYPE_NODE:
        return W.createElement(
          "span",
          { style: l.htmlDoctype },
          "<!DOCTYPE ",
          a.name,
          a.publicId ? ` PUBLIC "${a.publicId}"` : "",
          !a.publicId && a.systemId ? " SYSTEM" : "",
          a.systemId ? ` "${a.systemId}"` : "",
          ">",
        );
      case Node.DOCUMENT_NODE:
        return W.createElement("span", null, a.nodeName);
      case Node.DOCUMENT_FRAGMENT_NODE:
        return W.createElement("span", null, a.nodeName);
      default:
        return W.createElement("span", null, U2[a.nodeType]);
    }
  },
  I2 = function* (t) {
    if (t && t.childNodes) {
      if (AS(t)) return;
      for (let r = 0; r < t.childNodes.length; r++) {
        const l = t.childNodes[r];
        (l.nodeType === Node.TEXT_NODE && l.textContent.trim().length === 0) ||
          (yield { name: `${l.tagName}[${r}]`, data: l });
      }
      t.tagName &&
        (yield {
          name: "CLOSE_TAG",
          data: { tagName: t.tagName },
          isCloseTag: !0,
        });
    }
  },
  H2 = (t) => W.createElement(CS, { nodeRenderer: F2, dataIterator: I2, ...t }),
  $2 = Zp(H2),
  V2 = h2(m2()),
  G2 = ({ table: t = !1, data: a, ...r }) =>
    t
      ? W.createElement(j2, { data: a, ...r })
      : (0, V2.default)(a)
        ? W.createElement($2, { data: a, ...r })
        : W.createElement(A2, { data: a, ...r });
const P2 = ({ dispatch: t, globalState: a }) => {
    const [r, l] = C.useState(!1),
      s = "Log of events triggered by user.";
    return x.jsx("li", {
      children: x.jsxs("button", {
        "aria-label": s,
        title: s,
        onClick: () => l(!0),
        className: r ? "ladle-active" : "",
        "data-testid": "addon-action",
        type: "button",
        children: [
          x.jsx(C_, {}),
          x.jsx("span", { className: "ladle-addon-tooltip", children: s }),
          x.jsx("label", { children: "Actions" }),
          a.action.length
            ? x.jsx("div", {
                className: "ladle-badge",
                children: a.action.length,
              })
            : null,
          x.jsxs(el, {
            maxWidth: "60em",
            isOpen: r,
            close: () => l(!1),
            label: "Dialog with a log of events triggered by user.",
            children: [
              a.action.map((u, f) =>
                x.jsx(
                  G2,
                  {
                    table: !1,
                    sortObjectKeys: !0,
                    theme: {
                      ...(a.theme === vt.Light ? _S : ES),
                      BASE_BACKGROUND_COLOR: "var(--ladle-bg-color-secondary)",
                    },
                    showNonenumerable: !1,
                    name: u.name,
                    data: u.event,
                  },
                  f,
                ),
              ),
              x.jsx("button", {
                onClick: () => {
                  t({ type: Ve.UpdateAction, clear: !0, value: void 0 });
                },
                type: "button",
                children: "Clear actions",
              }),
            ],
          }),
        ],
      }),
    });
  },
  q2 = (t) => {
    const a = ca.parse(t).rtl;
    return a === "true" ? !0 : a === "false" ? !1 : Oe.addons.rtl.defaultState;
  },
  Y2 = ({ dispatch: t, globalState: a }) => {
    const r = "Switch text direction to right to left.",
      l = "Switch text direction to left to right.";
    return (
      Rn(Oe.hotkeys.rtl, () => t({ type: Ve.UpdateRtl, value: !a.rtl }), {
        enabled: a.hotkeys && Oe.addons.rtl.enabled,
      }),
      x.jsx("li", {
        children: x.jsxs("button", {
          "aria-label": a.rtl ? l : r,
          title: a.rtl ? l : r,
          className: a.rtl ? "ladle-active" : "",
          onClick: () => t({ type: Ve.UpdateRtl, value: !a.rtl }),
          type: "button",
          children: [
            x.jsx(y_, {}),
            x.jsx("span", {
              className: "ladle-addon-tooltip",
              children: a.rtl ? l : r,
            }),
            x.jsx("label", { children: "Right to left" }),
          ],
        }),
      })
    );
  },
  Z2 = {
    fullscreen: "Toggle fullscreen mode",
    search: "Focus search input in the sidebar",
    nextStory: "Go to the next story",
    previousStory: "Go to the previous story",
    nextComponent: "Go to the next component",
    previousComponent: "Go to the previous component",
    control: "Toggle controls addon",
    darkMode: "Toggle dark mode",
    width: "Toggle width addon",
    rtl: "Toggle right-to-left mode",
    a11y: "Toggle accessibility addon",
    source: "Toggle story source addon",
  },
  X2 = ({ children: t }) => (
    navigator.platform.toLowerCase().includes("mac")
      ? (t = t.replace(/alt/g, "⌥ opt").replace(/meta/g, "⌘ cmd"))
      : navigator.platform.toLowerCase().includes("win") &&
        (t = t.replace(/meta/g, "⊞ win")),
    (t = t.replace(/shift/g, "⇧ shift")),
    (t = t
      .replace(/arrowright/g, "→")
      .replace(/arrowleft/g, "←")
      .replace(/arrowup/g, "↑")
      .replace(/arrowdown/g, "↓")
      .replace(/\+/g, " ＋ ")),
    x.jsx(Pr, { children: t })
  ),
  K2 = ({ globalState: t }) => {
    const [a, r] = C.useState(!1),
      l = "Get more information about Ladle.";
    return x.jsx("li", {
      children: x.jsxs("button", {
        "aria-label": l,
        title: l,
        onClick: () => r(!0),
        className: a ? "ladle-active" : "",
        type: "button",
        children: [
          x.jsx(g_, {}),
          x.jsx("span", { className: "ladle-addon-tooltip", children: l }),
          x.jsx("label", { children: "About Ladle" }),
          x.jsxs(el, {
            isOpen: a,
            close: () => r(!1),
            label: "Dialog with information about Ladle.",
            children: [
              x.jsx("h3", { children: "Hotkeys" }),
              t.hotkeys
                ? x.jsxs(x.Fragment, {
                    children: [
                      x.jsx("ul", {
                        style: {
                          listStyle: "none",
                          marginLeft: 0,
                          paddingLeft: 0,
                        },
                        children: Object.keys(Oe.hotkeys).map((s) =>
                          Oe.hotkeys[s].length
                            ? x.jsxs(
                                "li",
                                {
                                  children: [
                                    x.jsx("span", {
                                      style: {
                                        display: "inline-block",
                                        width: "200px",
                                      },
                                      children: Oe.hotkeys[s].map((u, f) =>
                                        x.jsxs(
                                          "span",
                                          {
                                            children: [
                                              x.jsx(X2, { children: u }),
                                              Oe.hotkeys[s].length > f + 1
                                                ? " or "
                                                : "",
                                            ],
                                          },
                                          u,
                                        ),
                                      ),
                                    }),
                                    x.jsx("span", {
                                      style: { display: "inline-block" },
                                      children: Z2[s],
                                    }),
                                  ],
                                },
                                s,
                              )
                            : null,
                        ),
                      }),
                      x.jsxs("p", {
                        children: [
                          "Hotkeys can be disabled through",
                          " ",
                          x.jsx(Pr, {
                            children: "Story.meta = { hotkeys: false }",
                          }),
                          ".",
                        ],
                      }),
                    ],
                  })
                : x.jsxs("p", {
                    children: [
                      "Hotkeys are disabled for this story by",
                      " ",
                      x.jsx(Pr, { children: "meta.hotkeys = false" }),
                      ".",
                    ],
                  }),
              x.jsxs("p", {
                children: [
                  "Ladle is a modern and fast playground for React components powered by Vite. For more information visit",
                  " ",
                  x.jsx("a", {
                    href: "https://www.ladle.dev/",
                    children: "ladle.dev",
                  }),
                  " or our",
                  " ",
                  x.jsx("a", {
                    href: "https://discord.gg/H6FSHjyW7e",
                    children: "discord",
                  }),
                  ".",
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  Q2 = async (t, a, r) => {
    const l = await mO(() => import("./empty-module-BIHI7g3E.js"), []);
    try {
      const s = await l.default.run(document.getElementsByTagName("main"));
      (t(s.violations), a(!0));
    } catch {}
  },
  J2 = ({ violation: t }) => {
    const [a, r] = C.useState(!1);
    return x.jsxs("li", {
      children: [
        t.help,
        " (",
        t.nodes.length,
        ").",
        " ",
        a
          ? x.jsxs(x.Fragment, {
              children: [
                x.jsxs("ul", {
                  children: [
                    x.jsxs("li", { children: ["ID: ", t.id] }),
                    x.jsxs("li", { children: ["Impact: ", t.impact] }),
                    x.jsxs("li", {
                      children: ["Description: ", t.description],
                    }),
                    x.jsx("li", {
                      children: x.jsx("a", {
                        href: t.helpUrl,
                        children: "Documentation",
                      }),
                    }),
                  ],
                }),
                x.jsx("p", { children: "Violating nodes:" }),
                x.jsx("ul", {
                  children: t.nodes.map((l) =>
                    x.jsx(
                      "li",
                      { children: x.jsx(Pr, { children: l.html }) },
                      l.html,
                    ),
                  ),
                }),
                x.jsx("p", {
                  children: x.jsx("a", {
                    href: "#",
                    onClick: () => r(!1),
                    children: "Hide details",
                  }),
                }),
              ],
            })
          : x.jsx("a", {
              href: "#",
              onClick: () => r(!0),
              children: "Show details",
            }),
      ],
    });
  },
  W2 = ({ reportFinished: t, violations: a }) =>
    t
      ? a.length === 0
        ? x.jsxs("p", {
            children: [
              "There are no ",
              x.jsx("a", {
                href: "https://github.com/dequelabs/axe-core",
                children: "axe",
              }),
              " ",
              "accessibility violations. Good job!",
            ],
          })
        : x.jsxs(x.Fragment, {
            children: [
              x.jsxs("h3", {
                children: [
                  "There are ",
                  a.length,
                  " ",
                  x.jsx("a", {
                    href: "https://github.com/dequelabs/axe-core",
                    children: "axe",
                  }),
                  " accessibility violations",
                ],
              }),
              x.jsx("ul", {
                children: a.map((r) => x.jsx(J2, { violation: r }, r.id)),
              }),
            ],
          })
      : x.jsx("p", { children: "Report is loading..." }),
  eD = ({ globalState: t }) => {
    const [a, r] = C.useState(!1),
      [l, s] = C.useState(!1),
      [u, f] = C.useState([]);
    C.useEffect(() => {}, []);
    const p = "Show accessibility report.",
      h = () => {
        (Q2(f, s, null).catch(console.error), setTimeout(() => r(!a), 100));
      };
    return (
      Rn(Oe.hotkeys.a11y, () => (a ? r(!1) : h()), {
        enabled: t.hotkeys && Oe.addons.a11y.enabled,
      }),
      x.jsx("li", {
        children: x.jsxs("button", {
          "aria-label": p,
          "data-testid": "addon-a11y",
          title: p,
          onClick: h,
          className: a ? "a11y-active" : "",
          type: "button",
          children: [
            x.jsx(O_, {}),
            x.jsx("span", { className: "ladle-addon-tooltip", children: p }),
            x.jsx("label", { children: "Accessibility report" }),
            u.length
              ? x.jsx("div", { className: "ladle-badge", children: u.length })
              : null,
            x.jsx(el, {
              isOpen: a,
              close: () => r(!1),
              label: "Dialog with the story accessibility report.",
              children: x.jsx(W2, { reportFinished: l, violations: u }),
            }),
          ],
        }),
      })
    );
  },
  tD = (t) => {
    const a = ca.parse(t).width;
    let r = 0;
    return (
      Object.keys(Oe.addons.width.options).forEach((l) => {
        (l === a || parseInt(a, 10) === Oe.addons.width.options[l]) &&
          (r = Oe.addons.width.options[l]);
      }),
      r !== 0 ? r : Oe.addons.width.defaultState
    );
  },
  nD = ({ globalState: t, dispatch: a }) => {
    const r = "Change the story viewport.",
      [l, s] = C.useState(!1);
    Rn(Oe.hotkeys.width, () => s((h) => !h), {
      enabled: t.hotkeys && Oe.addons.width.enabled,
    });
    const u = Ji[t.story];
    let f = u && u.meta ? u.meta.meta.width : 0,
      p = Oe.addons.width.options;
    return (
      Object.keys(p).forEach((h) => {
        h === f && (f = p[h]);
      }),
      f && !Object.values(p).includes(f) && (p = { custom: f, ...p }),
      x.jsx("li", {
        children: x.jsxs("button", {
          "aria-label": r,
          "data-testid": "addon-width",
          title: r,
          onClick: () => s(!0),
          className: l ? "width-active" : "",
          type: "button",
          children: [
            x.jsx(x_, {}),
            x.jsx("span", { className: "ladle-addon-tooltip", children: r }),
            x.jsx("label", { children: "Set story width" }),
            x.jsxs(el, {
              isOpen: l,
              close: () => s(!1),
              label: "Dialog with the story width selector.",
              children: [
                x.jsx("p", { children: "Select story width" }),
                x.jsxs("div", {
                  children: [
                    x.jsx("input", {
                      onChange: () => a({ type: Ve.UpdateWidth, value: 0 }),
                      type: "radio",
                      id: "width-unset",
                      name: "width",
                      value: 0,
                      checked: t.width === 0,
                    }),
                    x.jsx("label", {
                      htmlFor: "width-unset",
                      style: { paddingLeft: "8px" },
                      children: "unset",
                    }),
                  ],
                }),
                Object.keys(p).map((h) =>
                  x.jsxs(
                    "div",
                    {
                      children: [
                        x.jsx("input", {
                          onChange: () =>
                            a({ type: Ve.UpdateWidth, value: p[h] }),
                          type: "radio",
                          id: `width-${h}`,
                          name: "width",
                          value: p[h],
                          checked: t.width === p[h],
                        }),
                        x.jsxs("label", {
                          htmlFor: `width-${h}`,
                          style: { paddingLeft: "8px" },
                          children: [p[h], "px - ", h],
                        }),
                      ],
                    },
                    h,
                  ),
                ),
                x.jsx("p", {}),
              ],
            }),
          ],
        }),
      })
    );
  },
  aD = ({ globalState: t, dispatch: a }) =>
    Object.keys(Oe.addons).every((r) => Oe.addons[r].enabled === !1)
      ? null
      : x.jsx("header", {
          role: "banner",
          className: "ladle-addons",
          children: x.jsxs("ul", {
            children: [
              Oe.addons.control.enabled &&
                Object.keys(t.control).length > 0 &&
                x.jsx(hO, { globalState: t, dispatch: a }),
              Oe.addons.theme.enabled &&
                x.jsx(wk, { globalState: t, dispatch: a }),
              Oe.addons.mode.enabled &&
                x.jsx(o2, { globalState: t, dispatch: a }),
              Oe.addons.width.enabled &&
                x.jsx(nD, { globalState: t, dispatch: a }),
              Oe.addons.rtl.enabled &&
                x.jsx(Y2, { globalState: t, dispatch: a }),
              Oe.addons.source.enabled &&
                x.jsx(Hk, { globalState: t, dispatch: a }),
              Oe.addons.a11y.enabled &&
                x.jsx(eD, { globalState: t, dispatch: a }),
              Oe.addons.ladle.enabled &&
                x.jsx(K2, { globalState: t, dispatch: a }),
              Oe.addons.control.enabled &&
                t.action.length > 0 &&
                x.jsx(P2, { globalState: t, dispatch: a }),
            ],
          }),
        }),
  rD = (t, a) => {
    switch ((la("Action dispatched", a), a.type)) {
      case Ve.UpdateAll:
        return { ...t, ...a.value };
      case Ve.UpdateMode:
        return { ...t, mode: a.value };
      case Ve.UpdateAction: {
        const r = { ...t };
        return (
          a.clear && (r.action = []),
          a.value ? { ...t, action: [...r.action, a.value] } : r
        );
      }
      case Ve.UpdateRtl:
        return { ...t, rtl: a.value };
      case Ve.UpdateSource:
        return { ...t, source: a.value };
      case Ve.UpdateStory:
        return {
          ...t,
          story: a.value,
          control: {},
          controlInitialized: !1,
          width: 0,
          action: [],
        };
      case Ve.UpdateTheme:
        return { ...t, theme: a.value };
      case Ve.UpdateWidth:
        return { ...t, width: a.value };
      case Ve.UpdateControl:
        return { ...t, control: a.value, controlInitialized: !0 };
      case Ve.UpdateControlIntialized:
        return { ...t, controlInitialized: a.value };
      case Ve.UpdateHotkeys:
        return { ...t, hotkeys: a.value };
      default:
        return t;
    }
  },
  cp = yb(Object.keys(Ji), Oe.storyOrder);
la("Stories found", cp);
const Nd = (t, a) => ({
    theme: J0(t),
    mode: l2(t),
    story: pb(t, Oe.defaultStory),
    rtl: q2(t),
    source: Fk(t),
    width: tD(t),
    control: dO(t, a ? a.control : {}),
    action: [],
    controlInitialized: !1,
    hotkeys: !0,
  }),
  iD = () => {
    const t = Nd(location.search),
      [a, r] = C.useReducer(rD, t),
      l = C.useRef({}),
      [s, u] = C.useState("");
    let f = "";
    (a.control &&
      Object.keys(a.control).forEach((h) => {
        a.control[h].type === "background" && (f = a.control[h].value || "");
      }),
      Rn(
        Oe.hotkeys.fullscreen,
        () => {
          r({
            type: Ve.UpdateMode,
            value: a.mode === Xt.Full ? Xt.Preview : Xt.Full,
          });
        },
        { preventDefault: !0, enabled: a.hotkeys && Oe.addons.mode.enabled },
      ),
      C.useEffect(() => {
        document.getElementsByClassName(
          "ladle-background",
        )[0].style.background = f;
      }, [f]),
      C.useEffect(() => {
        l.current = a;
      }),
      C.useEffect(() => {
        window.ladleDispatch = r;
      }, []));
    const p = l.current;
    return (
      C.useEffect(() => {
        var h, g;
        (la("Global state update", a),
          GE(location.search) || Ad(a),
          Ad(a),
          a.story !== p.story && (document.title = `${gb(a.story)} | Ladle`),
          a.theme !== p.theme &&
            document.documentElement.setAttribute("data-theme", a.theme),
          a.rtl !== p.rtl &&
            (a.rtl
              ? document.documentElement.setAttribute("dir", "rtl")
              : document.documentElement.removeAttribute("dir")),
          a.mode !== p.mode &&
            (document.documentElement.setAttribute("data-mode", a.mode),
            a.mode === Xt.Preview
              ? (h = document.getElementById("ladle-root")) == null ||
                h.removeAttribute("class")
              : (g = document.getElementById("ladle-root")) == null ||
                g.setAttribute("class", "ladle-wrapper")));
      }, [a]),
      C.useEffect(() => {
        const h = Pp.listen(({ location: g, action: y }) => {
          if (y === Gr.Pop) {
            const v = {};
            Object.keys(a.control).forEach((w) => {
              const S = Nd(g.search, a).control[w];
              v[w] = {
                ...a.control[w],
                value: S ? S.value : a.control[w].defaultValue,
              };
            });
            const E = Nd(g.search, a);
            r({
              type: Ve.UpdateAll,
              value: {
                ...E,
                control: v,
                controlInitialized: a.story === E.story,
              },
            });
          }
        });
        return () => h();
      }, [a]),
      a.mode === Xt.Preview
        ? x.jsx(Mm.Provider, {
            value: { globalState: a, dispatch: r },
            children: x.jsx(qv, { globalState: a, dispatch: r }),
          })
        : x.jsxs(Mm.Provider, {
            value: { globalState: a, dispatch: r },
            children: [
              x.jsx("main", {
                className: "ladle-main",
                children:
                  cp.length > 0
                    ? x.jsx(qv, { globalState: a, dispatch: r })
                    : x.jsx(Pk, {}),
              }),
              x.jsx(i2, {
                search: s,
                setSearch: u,
                stories: cp,
                hotkeys: a.hotkeys,
                story: a.story,
                updateStory: (h) => {
                  (Wk(),
                    Ad({ ...a, story: h, control: {} }),
                    r({ type: Ve.UpdateStory, value: h }));
                },
              }),
              x.jsx(aD, { globalState: a, dispatch: r }),
            ],
          })
    );
  },
  lD = document.getElementById("ladle-root"),
  oD = Ak.createRoot(lD);
oD.render(x.jsx(iD, {}));
