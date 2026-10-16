//#region \0rolldown/runtime.js
var e = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), t = /* @__PURE__ */ e(((e) => {
	var t = Symbol.for("react.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.provider"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.iterator;
	function p(e) {
		return typeof e != "object" || !e ? null : (e = f && e[f] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var m = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, h = Object.assign, g = {};
	function _(e, t, n) {
		this.props = e, this.context = t, this.refs = g, this.updater = n || m;
	}
	_.prototype.isReactComponent = {}, _.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, _.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function v() {}
	v.prototype = _.prototype;
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = g, this.updater = n || m;
	}
	var b = y.prototype = new v();
	b.constructor = y, h(b, _.prototype), b.isPureReactComponent = !0;
	var x = Array.isArray, S = Object.prototype.hasOwnProperty, C = { current: null }, w = {
		key: !0,
		ref: !0,
		__self: !0,
		__source: !0
	};
	function T(e, n, r) {
		var i, a = {}, o = null, s = null;
		if (n != null) for (i in n.ref !== void 0 && (s = n.ref), n.key !== void 0 && (o = "" + n.key), n) S.call(n, i) && !w.hasOwnProperty(i) && (a[i] = n[i]);
		var c = arguments.length - 2;
		if (c === 1) a.children = r;
		else if (1 < c) {
			for (var l = Array(c), u = 0; u < c; u++) l[u] = arguments[u + 2];
			a.children = l;
		}
		if (e && e.defaultProps) for (i in c = e.defaultProps, c) a[i] === void 0 && (a[i] = c[i]);
		return {
			$$typeof: t,
			type: e,
			key: o,
			ref: s,
			props: a,
			_owner: C.current
		};
	}
	function E(e, n) {
		return {
			$$typeof: t,
			type: e.type,
			key: n,
			ref: e.ref,
			props: e.props,
			_owner: e._owner
		};
	}
	function D(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function O(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var k = /\/+/g;
	function ee(e, t) {
		return typeof e == "object" && e && e.key != null ? O("" + e.key) : t.toString(36);
	}
	function te(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n: c = !0;
			}
		}
		if (c) return c = e, o = o(c), e = a === "" ? "." + ee(c, 0) : a, x(o) ? (i = "", e != null && (i = e.replace(k, "$&/") + "/"), te(o, r, i, "", function(e) {
			return e;
		})) : o != null && (D(o) && (o = E(o, i + (!o.key || c && c.key === o.key ? "" : ("" + o.key).replace(k, "$&/") + "/") + e)), r.push(o)), 1;
		if (c = 0, a = a === "" ? "." : a + ":", x(e)) for (var l = 0; l < e.length; l++) {
			s = e[l];
			var u = a + ee(s, l);
			c += te(s, r, i, u, o);
		}
		else if (u = p(e), typeof u == "function") for (e = u.call(e), l = 0; !(s = e.next()).done;) s = s.value, u = a + ee(s, l++), c += te(s, r, i, u, o);
		else if (s === "object") throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		return c;
	}
	function A(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return te(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function j(e) {
		if (e._status === -1) {
			var t = e._result;
			t = t(), t.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t);
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t);
			}), e._status === -1 && (e._status = 0, e._result = t);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var M = { current: null }, ne = { transition: null }, re = {
		ReactCurrentDispatcher: M,
		ReactCurrentBatchConfig: ne,
		ReactCurrentOwner: C
	};
	function ie() {
		throw Error("act(...) is not supported in production builds of React.");
	}
	e.Children = {
		map: A,
		forEach: function(e, t, n) {
			A(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return A(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return A(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!D(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	}, e.Component = _, e.Fragment = r, e.Profiler = a, e.PureComponent = y, e.StrictMode = i, e.Suspense = l, e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = re, e.act = ie, e.cloneElement = function(e, n, r) {
		if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
		var i = h({}, e.props), a = e.key, o = e.ref, s = e._owner;
		if (n != null) {
			if (n.ref !== void 0 && (o = n.ref, s = C.current), n.key !== void 0 && (a = "" + n.key), e.type && e.type.defaultProps) var c = e.type.defaultProps;
			for (l in n) S.call(n, l) && !w.hasOwnProperty(l) && (i[l] = n[l] === void 0 && c !== void 0 ? c[l] : n[l]);
		}
		var l = arguments.length - 2;
		if (l === 1) i.children = r;
		else if (1 < l) {
			c = Array(l);
			for (var u = 0; u < l; u++) c[u] = arguments[u + 2];
			i.children = c;
		}
		return {
			$$typeof: t,
			type: e.type,
			key: a,
			ref: o,
			props: i,
			_owner: s
		};
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null,
			_defaultValue: null,
			_globalName: null
		}, e.Provider = {
			$$typeof: o,
			_context: e
		}, e.Consumer = e;
	}, e.createElement = T, e.createFactory = function(e) {
		var t = T.bind(null, e);
		return t.type = e, t;
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = D, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: j
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = function(e) {
		var t = ne.transition;
		ne.transition = {};
		try {
			e();
		} finally {
			ne.transition = t;
		}
	}, e.unstable_act = ie, e.useCallback = function(e, t) {
		return M.current.useCallback(e, t);
	}, e.useContext = function(e) {
		return M.current.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e) {
		return M.current.useDeferredValue(e);
	}, e.useEffect = function(e, t) {
		return M.current.useEffect(e, t);
	}, e.useId = function() {
		return M.current.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return M.current.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return M.current.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return M.current.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return M.current.useMemo(e, t);
	}, e.useReducer = function(e, t, n) {
		return M.current.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return M.current.useRef(e);
	}, e.useState = function(e) {
		return M.current.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return M.current.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return M.current.useTransition();
	}, e.version = "18.3.1";
})), n = /* @__PURE__ */ e(((e, n) => {
	n.exports = t();
})), r = /* @__PURE__ */ e(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = typeof setTimeout == "function" ? setTimeout : null, _ = typeof clearTimeout == "function" ? clearTimeout : null, v = typeof setImmediate < "u" ? setImmediate : null;
	typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
	function y(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function b(e) {
		if (h = !1, y(e), !m) {
			if (n(c) !== null) m = !0, A(x);
			else {
				var t = n(l);
				t !== null && j(b, t.startTime - e);
			}
		}
	}
	function x(t, i) {
		m = !1, h && (h = !1, _(w), w = -1), p = !0;
		var a = f;
		try {
			for (y(i), d = n(c); d !== null && (!(d.expirationTime > i) || t && !D());) {
				var o = d.callback;
				if (typeof o == "function") {
					d.callback = null, f = d.priorityLevel;
					var s = o(d.expirationTime <= i);
					i = e.unstable_now(), typeof s == "function" ? d.callback = s : d === n(c) && r(c), y(i);
				} else r(c);
				d = n(c);
			}
			if (d !== null) var u = !0;
			else {
				var g = n(l);
				g !== null && j(b, g.startTime - i), u = !1;
			}
			return u;
		} finally {
			d = null, f = a, p = !1;
		}
	}
	var S = !1, C = null, w = -1, T = 5, E = -1;
	function D() {
		return !(e.unstable_now() - E < T);
	}
	function O() {
		if (C !== null) {
			var t = e.unstable_now();
			E = t;
			var n = !0;
			try {
				n = C(!0, t);
			} finally {
				n ? k() : (S = !1, C = null);
			}
		} else S = !1;
	}
	var k;
	if (typeof v == "function") k = function() {
		v(O);
	};
	else if (typeof MessageChannel < "u") {
		var ee = new MessageChannel(), te = ee.port2;
		ee.port1.onmessage = O, k = function() {
			te.postMessage(null);
		};
	} else k = function() {
		g(O, 0);
	};
	function A(e) {
		C = e, S || (S = !0, k());
	}
	function j(t, n) {
		w = g(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_continueExecution = function() {
		m || p || (m = !0, A(x));
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : T = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_getFirstCallbackNode = function() {
		return n(c);
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_pauseExecution = function() {}, e.unstable_requestPaint = function() {}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (_(w), w = -1) : h = !0, j(b, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, A(x))), r;
	}, e.unstable_shouldYield = D, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), i = /* @__PURE__ */ e(((e, t) => {
	t.exports = r();
})), a = /* @__PURE__ */ e(((e) => {
	var t = n(), r = i();
	function a(e) {
		for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	var o = /* @__PURE__ */ new Set(), s = {};
	function c(e, t) {
		l(e, t), l(e + "Capture", t);
	}
	function l(e, t) {
		for (s[e] = t, e = 0; e < t.length; e++) o.add(t[e]);
	}
	var u = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, d = Object.prototype.hasOwnProperty, f = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, p = {}, m = {};
	function h(e) {
		return d.call(m, e) ? !0 : d.call(p, e) ? !1 : f.test(e) ? m[e] = !0 : (p[e] = !0, !1);
	}
	function g(e, t, n, r) {
		if (n !== null && n.type === 0) return !1;
		switch (typeof t) {
			case "function":
			case "symbol": return !0;
			case "boolean": return r ? !1 : n === null ? (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-") : !n.acceptsBooleans;
			default: return !1;
		}
	}
	function _(e, t, n, r) {
		if (t == null || g(e, t, n, r)) return !0;
		if (r) return !1;
		if (n !== null) switch (n.type) {
			case 3: return !t;
			case 4: return !1 === t;
			case 5: return isNaN(t);
			case 6: return isNaN(t) || 1 > t;
		}
		return !1;
	}
	function v(e, t, n, r, i, a, o) {
		this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = i, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = a, this.removeEmptyString = o;
	}
	var y = {};
	"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
		y[e] = new v(e, 0, !1, e, null, !1, !1);
	}), [
		["acceptCharset", "accept-charset"],
		["className", "class"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"]
	].forEach(function(e) {
		var t = e[0];
		y[t] = new v(t, 1, !1, e[1], null, !1, !1);
	}), [
		"contentEditable",
		"draggable",
		"spellCheck",
		"value"
	].forEach(function(e) {
		y[e] = new v(e, 2, !1, e.toLowerCase(), null, !1, !1);
	}), [
		"autoReverse",
		"externalResourcesRequired",
		"focusable",
		"preserveAlpha"
	].forEach(function(e) {
		y[e] = new v(e, 2, !1, e, null, !1, !1);
	}), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
		y[e] = new v(e, 3, !1, e.toLowerCase(), null, !1, !1);
	}), [
		"checked",
		"multiple",
		"muted",
		"selected"
	].forEach(function(e) {
		y[e] = new v(e, 3, !0, e, null, !1, !1);
	}), ["capture", "download"].forEach(function(e) {
		y[e] = new v(e, 4, !1, e, null, !1, !1);
	}), [
		"cols",
		"rows",
		"size",
		"span"
	].forEach(function(e) {
		y[e] = new v(e, 6, !1, e, null, !1, !1);
	}), ["rowSpan", "start"].forEach(function(e) {
		y[e] = new v(e, 5, !1, e.toLowerCase(), null, !1, !1);
	});
	var b = /[\-:]([a-z])/g;
	function x(e) {
		return e[1].toUpperCase();
	}
	"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
		var t = e.replace(b, x);
		y[t] = new v(t, 1, !1, e, null, !1, !1);
	}), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
		var t = e.replace(b, x);
		y[t] = new v(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
	}), [
		"xml:base",
		"xml:lang",
		"xml:space"
	].forEach(function(e) {
		var t = e.replace(b, x);
		y[t] = new v(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
	}), ["tabIndex", "crossOrigin"].forEach(function(e) {
		y[e] = new v(e, 1, !1, e.toLowerCase(), null, !1, !1);
	}), y.xlinkHref = new v("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), [
		"src",
		"href",
		"action",
		"formAction"
	].forEach(function(e) {
		y[e] = new v(e, 1, !1, e.toLowerCase(), null, !0, !0);
	});
	function S(e, t, n, r) {
		var i = y.hasOwnProperty(t) ? y[t] : null;
		(i === null ? r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N" : i.type !== 0) && (_(t, n, i, r) && (n = null), r || i === null ? h(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : i.mustUseProperty ? e[i.propertyName] = n === null ? i.type !== 3 && "" : n : (t = i.attributeName, r = i.attributeNamespace, n === null ? e.removeAttribute(t) : (i = i.type, n = i === 3 || i === 4 && !0 === n ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
	}
	var C = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, w = Symbol.for("react.element"), T = Symbol.for("react.portal"), E = Symbol.for("react.fragment"), D = Symbol.for("react.strict_mode"), O = Symbol.for("react.profiler"), k = Symbol.for("react.provider"), ee = Symbol.for("react.context"), te = Symbol.for("react.forward_ref"), A = Symbol.for("react.suspense"), j = Symbol.for("react.suspense_list"), M = Symbol.for("react.memo"), ne = Symbol.for("react.lazy"), re = Symbol.for("react.offscreen"), ie = Symbol.iterator;
	function ae(e) {
		return typeof e != "object" || !e ? null : (e = ie && e[ie] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var N = Object.assign, oe;
	function se(e) {
		if (oe === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			oe = t && t[1] || "";
		}
		return "\n" + oe + e;
	}
	var ce = !1;
	function le(e, t) {
		if (!e || ce) return "";
		ce = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			if (t) {
				if (t = function() {
					throw Error();
				}, Object.defineProperty(t.prototype, "props", { set: function() {
					throw Error();
				} }), typeof Reflect == "object" && Reflect.construct) {
					try {
						Reflect.construct(t, []);
					} catch (e) {
						var r = e;
					}
					Reflect.construct(e, [], t);
				} else {
					try {
						t.call();
					} catch (e) {
						r = e;
					}
					e.call(t.prototype);
				}
			} else {
				try {
					throw Error();
				} catch (e) {
					r = e;
				}
				e();
			}
		} catch (t) {
			if (t && r && typeof t.stack == "string") {
				for (var i = t.stack.split("\n"), a = r.stack.split("\n"), o = i.length - 1, s = a.length - 1; 1 <= o && 0 <= s && i[o] !== a[s];) s--;
				for (; 1 <= o && 0 <= s; o--, s--) if (i[o] !== a[s]) {
					if (o !== 1 || s !== 1) do
						if (o--, s--, 0 > s || i[o] !== a[s]) {
							var c = "\n" + i[o].replace(" at new ", " at ");
							return e.displayName && c.includes("<anonymous>") && (c = c.replace("<anonymous>", e.displayName)), c;
						}
					while (1 <= o && 0 <= s);
					break;
				}
			}
		} finally {
			ce = !1, Error.prepareStackTrace = n;
		}
		return (e = e ? e.displayName || e.name : "") ? se(e) : "";
	}
	function P(e) {
		switch (e.tag) {
			case 5: return se(e.type);
			case 16: return se("Lazy");
			case 13: return se("Suspense");
			case 19: return se("SuspenseList");
			case 0:
			case 2:
			case 15: return e = le(e.type, !1), e;
			case 11: return e = le(e.type.render, !1), e;
			case 1: return e = le(e.type, !0), e;
			default: return "";
		}
	}
	function F(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case E: return "Fragment";
			case T: return "Portal";
			case O: return "Profiler";
			case D: return "StrictMode";
			case A: return "Suspense";
			case j: return "SuspenseList";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case ee: return (e.displayName || "Context") + ".Consumer";
			case k: return (e._context.displayName || "Context") + ".Provider";
			case te:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case M: return t = e.displayName || null, t === null ? F(e.type) || "Memo" : t;
			case ne:
				t = e._payload, e = e._init;
				try {
					return F(e(t));
				} catch {}
		}
		return null;
	}
	function ue(e) {
		var t = e.type;
		switch (e.tag) {
			case 24: return "Cache";
			case 9: return (t.displayName || "Context") + ".Consumer";
			case 10: return (t._context.displayName || "Context") + ".Provider";
			case 18: return "DehydratedFragment";
			case 11: return e = t.render, e = e.displayName || e.name || "", t.displayName || (e === "" ? "ForwardRef" : "ForwardRef(" + e + ")");
			case 7: return "Fragment";
			case 5: return t;
			case 4: return "Portal";
			case 3: return "Root";
			case 6: return "Text";
			case 16: return F(t);
			case 8: return t === D ? "StrictMode" : "Mode";
			case 22: return "Offscreen";
			case 12: return "Profiler";
			case 21: return "Scope";
			case 13: return "Suspense";
			case 19: return "SuspenseList";
			case 25: return "TracingMarker";
			case 1:
			case 0:
			case 17:
			case 2:
			case 14:
			case 15:
				if (typeof t == "function") return t.displayName || t.name || null;
				if (typeof t == "string") return t;
		}
		return null;
	}
	function I(e) {
		switch (typeof e) {
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function de(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function L(e) {
		var t = de(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
		if (!e.hasOwnProperty(t) && n !== void 0 && typeof n.get == "function" && typeof n.set == "function") {
			var i = n.get, a = n.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					r = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: n.enumerable }), {
				getValue: function() {
					return r;
				},
				setValue: function(e) {
					r = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function fe(e) {
		e._valueTracker ||= L(e);
	}
	function pe(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = de(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	function R(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function me(e, t) {
		var n = t.checked;
		return N({}, t, {
			defaultChecked: void 0,
			defaultValue: void 0,
			value: void 0,
			checked: n ?? e._wrapperState.initialChecked
		});
	}
	function he(e, t) {
		var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked == null ? t.defaultChecked : t.checked;
		n = I(t.value == null ? n : t.value), e._wrapperState = {
			initialChecked: r,
			initialValue: n,
			controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null
		};
	}
	function z(e, t) {
		t = t.checked, t != null && S(e, "checked", t, !1);
	}
	function ge(e, t) {
		z(e, t);
		var n = I(t.value), r = t.type;
		if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
		else if (r === "submit" || r === "reset") {
			e.removeAttribute("value");
			return;
		}
		t.hasOwnProperty("value") ? ve(e, t.type, n) : t.hasOwnProperty("defaultValue") && ve(e, t.type, I(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
	}
	function _e(e, t, n) {
		if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
			var r = t.type;
			if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
			t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
		}
		n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
	}
	function ve(e, t, n) {
		(t !== "number" || R(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
	}
	var ye = Array.isArray;
	function be(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + I(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function xe(e, t) {
		if (t.dangerouslySetInnerHTML != null) throw Error(a(91));
		return N({}, t, {
			value: void 0,
			defaultValue: void 0,
			children: "" + e._wrapperState.initialValue
		});
	}
	function Se(e, t) {
		var n = t.value;
		if (n == null) {
			if (n = t.children, t = t.defaultValue, n != null) {
				if (t != null) throw Error(a(92));
				if (ye(n)) {
					if (1 < n.length) throw Error(a(93));
					n = n[0];
				}
				t = n;
			}
			t ??= "", n = t;
		}
		e._wrapperState = { initialValue: I(n) };
	}
	function Ce(e, t) {
		var n = I(t.value), r = I(t.defaultValue);
		n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
	}
	function we(e) {
		var t = e.textContent;
		t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
	}
	function Te(e) {
		switch (e) {
			case "svg": return "http://www.w3.org/2000/svg";
			case "math": return "http://www.w3.org/1998/Math/MathML";
			default: return "http://www.w3.org/1999/xhtml";
		}
	}
	function Ee(e, t) {
		return e == null || e === "http://www.w3.org/1999/xhtml" ? Te(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
	}
	var De, Oe = function(e) {
		return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
			MSApp.execUnsafeLocalFunction(function() {
				return e(t, n, r, i);
			});
		} : e;
	}(function(e, t) {
		if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
		else {
			for (De ||= document.createElement("div"), De.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = De.firstChild; e.firstChild;) e.removeChild(e.firstChild);
			for (; t.firstChild;) e.appendChild(t.firstChild);
		}
	});
	function ke(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Ae = {
		animationIterationCount: !0,
		aspectRatio: !0,
		borderImageOutset: !0,
		borderImageSlice: !0,
		borderImageWidth: !0,
		boxFlex: !0,
		boxFlexGroup: !0,
		boxOrdinalGroup: !0,
		columnCount: !0,
		columns: !0,
		flex: !0,
		flexGrow: !0,
		flexPositive: !0,
		flexShrink: !0,
		flexNegative: !0,
		flexOrder: !0,
		gridArea: !0,
		gridRow: !0,
		gridRowEnd: !0,
		gridRowSpan: !0,
		gridRowStart: !0,
		gridColumn: !0,
		gridColumnEnd: !0,
		gridColumnSpan: !0,
		gridColumnStart: !0,
		fontWeight: !0,
		lineClamp: !0,
		lineHeight: !0,
		opacity: !0,
		order: !0,
		orphans: !0,
		tabSize: !0,
		widows: !0,
		zIndex: !0,
		zoom: !0,
		fillOpacity: !0,
		floodOpacity: !0,
		stopOpacity: !0,
		strokeDasharray: !0,
		strokeDashoffset: !0,
		strokeMiterlimit: !0,
		strokeOpacity: !0,
		strokeWidth: !0
	}, je = [
		"Webkit",
		"ms",
		"Moz",
		"O"
	];
	Object.keys(Ae).forEach(function(e) {
		je.forEach(function(t) {
			t = t + e.charAt(0).toUpperCase() + e.substring(1), Ae[t] = Ae[e];
		});
	});
	function Me(e, t, n) {
		return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Ae.hasOwnProperty(e) && Ae[e] ? ("" + t).trim() : t + "px";
	}
	function Ne(e, t) {
		for (var n in e = e.style, t) if (t.hasOwnProperty(n)) {
			var r = n.indexOf("--") === 0, i = Me(n, t[n], r);
			n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : e[n] = i;
		}
	}
	var Pe = N({ menuitem: !0 }, {
		area: !0,
		base: !0,
		br: !0,
		col: !0,
		embed: !0,
		hr: !0,
		img: !0,
		input: !0,
		keygen: !0,
		link: !0,
		meta: !0,
		param: !0,
		source: !0,
		track: !0,
		wbr: !0
	});
	function B(e, t) {
		if (t) {
			if (Pe[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(a(137, e));
			if (t.dangerouslySetInnerHTML != null) {
				if (t.children != null) throw Error(a(60));
				if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(a(61));
			}
			if (t.style != null && typeof t.style != "object") throw Error(a(62));
		}
	}
	function Fe(e, t) {
		if (e.indexOf("-") === -1) return typeof t.is == "string";
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var Ie = null;
	function Le(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var Re = null, ze = null, Be = null;
	function Ve(e) {
		if (e = zi(e)) {
			if (typeof Re != "function") throw Error(a(280));
			var t = e.stateNode;
			t && (t = Vi(t), Re(e.stateNode, e.type, t));
		}
	}
	function He(e) {
		ze ? Be ? Be.push(e) : Be = [e] : ze = e;
	}
	function Ue() {
		if (ze) {
			var e = ze, t = Be;
			if (Be = ze = null, Ve(e), t) for (e = 0; e < t.length; e++) Ve(t[e]);
		}
	}
	function We(e, t) {
		return e(t);
	}
	function Ge() {}
	var Ke = !1;
	function qe(e, t, n) {
		if (Ke) return e(t, n);
		Ke = !0;
		try {
			return We(e, t, n);
		} finally {
			Ke = !1, (ze !== null || Be !== null) && (Ge(), Ue());
		}
	}
	function Je(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = Vi(n);
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
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
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(a(231, t, typeof n));
		return n;
	}
	var Ye = !1;
	if (u) try {
		var Xe = {};
		Object.defineProperty(Xe, "passive", { get: function() {
			Ye = !0;
		} }), window.addEventListener("test", Xe, Xe), window.removeEventListener("test", Xe, Xe);
	} catch {
		Ye = !1;
	}
	function Ze(e, t, n, r, i, a, o, s, c) {
		var l = Array.prototype.slice.call(arguments, 3);
		try {
			t.apply(n, l);
		} catch (e) {
			this.onError(e);
		}
	}
	var Qe = !1, $e = null, et = !1, tt = null, nt = { onError: function(e) {
		Qe = !0, $e = e;
	} };
	function rt(e, t, n, r, i, a, o, s, c) {
		Qe = !1, $e = null, Ze.apply(nt, arguments);
	}
	function it(e, t, n, r, i, o, s, c, l) {
		if (rt.apply(this, arguments), Qe) {
			if (Qe) {
				var u = $e;
				Qe = !1, $e = null;
			} else throw Error(a(198));
			et || (et = !0, tt = u);
		}
	}
	function at(e) {
		var t = e, n = e;
		if (e.alternate) for (; t.return;) t = t.return;
		else {
			e = t;
			do
				t = e, t.flags & 4098 && (n = t.return), e = t.return;
			while (e);
		}
		return t.tag === 3 ? n : null;
	}
	function ot(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function st(e) {
		if (at(e) !== e) throw Error(a(188));
	}
	function ct(e) {
		var t = e.alternate;
		if (!t) {
			if (t = at(e), t === null) throw Error(a(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var i = n.return;
			if (i === null) break;
			var o = i.alternate;
			if (o === null) {
				if (r = i.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (i.child === o.child) {
				for (o = i.child; o;) {
					if (o === n) return st(i), e;
					if (o === r) return st(i), t;
					o = o.sibling;
				}
				throw Error(a(188));
			}
			if (n.return !== r.return) n = i, r = o;
			else {
				for (var s = !1, c = i.child; c;) {
					if (c === n) {
						s = !0, n = i, r = o;
						break;
					}
					if (c === r) {
						s = !0, r = i, n = o;
						break;
					}
					c = c.sibling;
				}
				if (!s) {
					for (c = o.child; c;) {
						if (c === n) {
							s = !0, n = o, r = i;
							break;
						}
						if (c === r) {
							s = !0, r = o, n = i;
							break;
						}
						c = c.sibling;
					}
					if (!s) throw Error(a(189));
				}
			}
			if (n.alternate !== r) throw Error(a(190));
		}
		if (n.tag !== 3) throw Error(a(188));
		return n.stateNode.current === n ? e : t;
	}
	function lt(e) {
		return e = ct(e), e === null ? null : ut(e);
	}
	function ut(e) {
		if (e.tag === 5 || e.tag === 6) return e;
		for (e = e.child; e !== null;) {
			var t = ut(e);
			if (t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	var dt = r.unstable_scheduleCallback, ft = r.unstable_cancelCallback, pt = r.unstable_shouldYield, mt = r.unstable_requestPaint, V = r.unstable_now, ht = r.unstable_getCurrentPriorityLevel, gt = r.unstable_ImmediatePriority, _t = r.unstable_UserBlockingPriority, vt = r.unstable_NormalPriority, yt = r.unstable_LowPriority, bt = r.unstable_IdlePriority, xt = null, St = null;
	function Ct(e) {
		if (St && typeof St.onCommitFiberRoot == "function") try {
			St.onCommitFiberRoot(xt, e, void 0, (e.current.flags & 128) == 128);
		} catch {}
	}
	var wt = Math.clz32 ? Math.clz32 : Dt, Tt = Math.log, Et = Math.LN2;
	function Dt(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Tt(e) / Et | 0) | 0;
	}
	var Ot = 64, kt = 4194304;
	function At(e) {
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64:
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
			case 2097152: return e & 4194240;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
			case 67108864: return e & 130023424;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 1073741824;
			default: return e;
		}
	}
	function jt(e, t) {
		var n = e.pendingLanes;
		if (n === 0) return 0;
		var r = 0, i = e.suspendedLanes, a = e.pingedLanes, o = n & 268435455;
		if (o !== 0) {
			var s = o & ~i;
			s === 0 ? (a &= o, a !== 0 && (r = At(a))) : r = At(s);
		} else o = n & ~i, o === 0 ? a !== 0 && (r = At(a)) : r = At(o);
		if (r === 0) return 0;
		if (t !== 0 && t !== r && (t & i) === 0 && (i = r & -r, a = t & -t, i >= a || i === 16 && a & 4194240)) return t;
		if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t;) n = 31 - wt(t), i = 1 << n, r |= e[n], t &= ~i;
		return r;
	}
	function Mt(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4: return t + 250;
			case 8:
			case 16:
			case 32:
			case 64:
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
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
			case 67108864: return -1;
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function Nt(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes; 0 < a;) {
			var o = 31 - wt(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Mt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
	}
	function Pt(e) {
		return e = e.pendingLanes & -1073741825, e === 0 ? e & 1073741824 ? 1073741824 : 0 : e;
	}
	function Ft() {
		var e = Ot;
		return Ot <<= 1, !(Ot & 4194240) && (Ot = 64), e;
	}
	function It(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Lt(e, t, n) {
		e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - wt(t), e[t] = n;
	}
	function Rt(e, t) {
		var n = e.pendingLanes & ~t;
		e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
		var r = e.eventTimes;
		for (e = e.expirationTimes; 0 < n;) {
			var i = 31 - wt(n), a = 1 << i;
			t[i] = 0, r[i] = -1, e[i] = -1, n &= ~a;
		}
	}
	function zt(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - wt(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	var H = 0;
	function Bt(e) {
		return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
	}
	var Vt, Ht, Ut, Wt, Gt, Kt = !1, qt = [], Jt = null, Yt = null, Xt = null, Zt = /* @__PURE__ */ new Map(), Qt = /* @__PURE__ */ new Map(), $t = [], en = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
	function tn(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Jt = null;
				break;
			case "dragenter":
			case "dragleave":
				Yt = null;
				break;
			case "mouseover":
			case "mouseout":
				Xt = null;
				break;
			case "pointerover":
			case "pointerout":
				Zt.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": Qt.delete(t.pointerId);
		}
	}
	function nn(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = zi(t), t !== null && Ht(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function rn(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Jt = nn(Jt, e, t, n, r, i), !0;
			case "dragenter": return Yt = nn(Yt, e, t, n, r, i), !0;
			case "mouseover": return Xt = nn(Xt, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return Zt.set(a, nn(Zt.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, Qt.set(a, nn(Qt.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function an(e) {
		var t = Ri(e.target);
		if (t !== null) {
			var n = at(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = ot(n), t !== null) {
						e.blockedOn = t, Gt(e.priority, function() {
							Ut(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function on(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = _n(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Ie = r, n.target.dispatchEvent(r), Ie = null;
			} else return t = zi(n), t !== null && Ht(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function sn(e, t, n) {
		on(e) && n.delete(t);
	}
	function cn() {
		Kt = !1, Jt !== null && on(Jt) && (Jt = null), Yt !== null && on(Yt) && (Yt = null), Xt !== null && on(Xt) && (Xt = null), Zt.forEach(sn), Qt.forEach(sn);
	}
	function ln(e, t) {
		e.blockedOn === t && (e.blockedOn = null, Kt || (Kt = !0, r.unstable_scheduleCallback(r.unstable_NormalPriority, cn)));
	}
	function un(e) {
		function t(t) {
			return ln(t, e);
		}
		if (0 < qt.length) {
			ln(qt[0], e);
			for (var n = 1; n < qt.length; n++) {
				var r = qt[n];
				r.blockedOn === e && (r.blockedOn = null);
			}
		}
		for (Jt !== null && ln(Jt, e), Yt !== null && ln(Yt, e), Xt !== null && ln(Xt, e), Zt.forEach(t), Qt.forEach(t), n = 0; n < $t.length; n++) r = $t[n], r.blockedOn === e && (r.blockedOn = null);
		for (; 0 < $t.length && (n = $t[0], n.blockedOn === null);) an(n), n.blockedOn === null && $t.shift();
	}
	var dn = C.ReactCurrentBatchConfig, fn = !0;
	function pn(e, t, n, r) {
		var i = H, a = dn.transition;
		dn.transition = null;
		try {
			H = 1, hn(e, t, n, r);
		} finally {
			H = i, dn.transition = a;
		}
	}
	function mn(e, t, n, r) {
		var i = H, a = dn.transition;
		dn.transition = null;
		try {
			H = 4, hn(e, t, n, r);
		} finally {
			H = i, dn.transition = a;
		}
	}
	function hn(e, t, n, r) {
		if (fn) {
			var i = _n(e, t, n, r);
			if (i === null) ui(e, t, r, gn, n), tn(e, r);
			else if (rn(i, e, t, n, r)) r.stopPropagation();
			else if (tn(e, r), t & 4 && -1 < en.indexOf(e)) {
				for (; i !== null;) {
					var a = zi(i);
					if (a !== null && Vt(a), a = _n(e, t, n, r), a === null && ui(e, t, r, gn, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else ui(e, t, r, null, n);
		}
	}
	var gn = null;
	function _n(e, t, n, r) {
		if (gn = null, e = Le(r), e = Ri(e), e !== null) {
			if (t = at(e), t === null) e = null;
			else if (n = t.tag, n === 13) {
				if (e = ot(t), e !== null) return e;
				e = null;
			} else if (n === 3) {
				if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
				e = null;
			} else t !== e && (e = null);
		}
		return gn = e, null;
	}
	function vn(e) {
		switch (e) {
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
			case "selectstart": return 1;
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
			case "toggle":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 4;
			case "message": switch (ht()) {
				case gt: return 1;
				case _t: return 4;
				case vt:
				case yt: return 16;
				case bt: return 536870912;
				default: return 16;
			}
			default: return 16;
		}
	}
	var yn = null, bn = null, xn = null;
	function Sn() {
		if (xn) return xn;
		var e, t = bn, n = t.length, r, i = "value" in yn ? yn.value : yn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return xn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Cn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function wn() {
		return !0;
	}
	function Tn() {
		return !1;
	}
	function En(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? wn : Tn, this.isPropagationStopped = Tn, this;
		}
		return N(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = wn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = wn);
			},
			persist: function() {},
			isPersistent: wn
		}), t;
	}
	var Dn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, On = En(Dn), kn = N({}, Dn, {
		view: 0,
		detail: 0
	}), An = En(kn), jn, Mn, Nn, Pn = N({}, kn, {
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
		getModifierState: Gn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Nn && (Nn && e.type === "mousemove" ? (jn = e.screenX - Nn.screenX, Mn = e.screenY - Nn.screenY) : Mn = jn = 0, Nn = e), jn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Mn;
		}
	}), Fn = En(Pn), In = En(N({}, Pn, { dataTransfer: 0 })), Ln = En(N({}, kn, { relatedTarget: 0 })), Rn = En(N({}, Dn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), zn = En(N({}, Dn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Bn = En(N({}, Dn, { data: 0 })), Vn = {
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
		MozPrintableKey: "Unidentified"
	}, Hn = {
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
		224: "Meta"
	}, Un = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Wn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Un[e]) ? !!t[e] : !1;
	}
	function Gn() {
		return Wn;
	}
	var Kn = En(N({}, kn, {
		key: function(e) {
			if (e.key) {
				var t = Vn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Cn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Hn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: Gn,
		charCode: function(e) {
			return e.type === "keypress" ? Cn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Cn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), qn = En(N({}, Pn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), Jn = En(N({}, kn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Gn
	})), Yn = En(N({}, Dn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Xn = En(N({}, Pn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Zn = [
		9,
		13,
		27,
		32
	], Qn = u && "CompositionEvent" in window, $n = null;
	u && "documentMode" in document && ($n = document.documentMode);
	var er = u && "TextEvent" in window && !$n, tr = u && (!Qn || $n && 8 < $n && 11 >= $n), nr = " ", rr = !1;
	function ir(e, t) {
		switch (e) {
			case "keyup": return Zn.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function ar(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var or = !1;
	function sr(e, t) {
		switch (e) {
			case "compositionend": return ar(t);
			case "keypress": return t.which === 32 ? (rr = !0, nr) : null;
			case "textInput": return e = t.data, e === nr && rr ? null : e;
			default: return null;
		}
	}
	function cr(e, t) {
		if (or) return e === "compositionend" || !Qn && ir(e, t) ? (e = Sn(), xn = bn = yn = null, or = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return tr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var lr = {
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
		week: !0
	};
	function ur(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!lr[e.type] : t === "textarea";
	}
	function dr(e, t, n, r) {
		He(r), t = fi(t, "onChange"), 0 < t.length && (n = new On("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var fr = null, pr = null;
	function mr(e) {
		ai(e, 0);
	}
	function hr(e) {
		if (pe(Bi(e))) return e;
	}
	function gr(e, t) {
		if (e === "change") return t;
	}
	var _r = !1;
	if (u) {
		var vr;
		if (u) {
			var yr = "oninput" in document;
			if (!yr) {
				var br = document.createElement("div");
				br.setAttribute("oninput", "return;"), yr = typeof br.oninput == "function";
			}
			vr = yr;
		} else vr = !1;
		_r = vr && (!document.documentMode || 9 < document.documentMode);
	}
	function xr() {
		fr && (fr.detachEvent("onpropertychange", Sr), pr = fr = null);
	}
	function Sr(e) {
		if (e.propertyName === "value" && hr(pr)) {
			var t = [];
			dr(t, pr, e, Le(e)), qe(mr, t);
		}
	}
	function Cr(e, t, n) {
		e === "focusin" ? (xr(), fr = t, pr = n, fr.attachEvent("onpropertychange", Sr)) : e === "focusout" && xr();
	}
	function wr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return hr(pr);
	}
	function Tr(e, t) {
		if (e === "click") return hr(t);
	}
	function Er(e, t) {
		if (e === "input" || e === "change") return hr(t);
	}
	function Dr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Or = typeof Object.is == "function" ? Object.is : Dr;
	function kr(e, t) {
		if (Or(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!d.call(t, i) || !Or(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Ar(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function jr(e, t) {
		var n = Ar(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Ar(n);
		}
	}
	function Mr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Mr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Nr() {
		for (var e = window, t = R(); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = R(e.document);
		}
		return t;
	}
	function Pr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	function Fr(e) {
		var t = Nr(), n = e.focusedElem, r = e.selectionRange;
		if (t !== n && n && n.ownerDocument && Mr(n.ownerDocument.documentElement, n)) {
			if (r !== null && Pr(n)) {
				if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
				else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
					e = e.getSelection();
					var i = n.textContent.length, a = Math.min(r.start, i);
					r = r.end === void 0 ? a : Math.min(r.end, i), !e.extend && a > r && (i = r, r = a, a = i), i = jr(n, a);
					var o = jr(n, r);
					i && o && (e.rangeCount !== 1 || e.anchorNode !== i.node || e.anchorOffset !== i.offset || e.focusNode !== o.node || e.focusOffset !== o.offset) && (t = t.createRange(), t.setStart(i.node, i.offset), e.removeAllRanges(), a > r ? (e.addRange(t), e.extend(o.node, o.offset)) : (t.setEnd(o.node, o.offset), e.addRange(t)));
				}
			}
			for (t = [], e = n; e = e.parentNode;) e.nodeType === 1 && t.push({
				element: e,
				left: e.scrollLeft,
				top: e.scrollTop
			});
			for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
		}
	}
	var Ir = u && "documentMode" in document && 11 >= document.documentMode, Lr = null, Rr = null, zr = null, Br = !1;
	function Vr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Br || Lr == null || Lr !== R(r) || (r = Lr, "selectionStart" in r && Pr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), zr && kr(zr, r) || (zr = r, r = fi(Rr, "onSelect"), 0 < r.length && (t = new On("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Lr)));
	}
	function Hr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Ur = {
		animationend: Hr("Animation", "AnimationEnd"),
		animationiteration: Hr("Animation", "AnimationIteration"),
		animationstart: Hr("Animation", "AnimationStart"),
		transitionend: Hr("Transition", "TransitionEnd")
	}, Wr = {}, Gr = {};
	u && (Gr = document.createElement("div").style, "AnimationEvent" in window || (delete Ur.animationend.animation, delete Ur.animationiteration.animation, delete Ur.animationstart.animation), "TransitionEvent" in window || delete Ur.transitionend.transition);
	function Kr(e) {
		if (Wr[e]) return Wr[e];
		if (!Ur[e]) return e;
		var t = Ur[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Gr) return Wr[e] = t[n];
		return e;
	}
	var qr = Kr("animationend"), Jr = Kr("animationiteration"), Yr = Kr("animationstart"), Xr = Kr("transitionend"), Zr = /* @__PURE__ */ new Map(), Qr = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	function $r(e, t) {
		Zr.set(e, t), c(t, [e]);
	}
	for (var ei = 0; ei < Qr.length; ei++) {
		var ti = Qr[ei];
		$r(ti.toLowerCase(), "on" + (ti[0].toUpperCase() + ti.slice(1)));
	}
	$r(qr, "onAnimationEnd"), $r(Jr, "onAnimationIteration"), $r(Yr, "onAnimationStart"), $r("dblclick", "onDoubleClick"), $r("focusin", "onFocus"), $r("focusout", "onBlur"), $r(Xr, "onTransitionEnd"), l("onMouseEnter", ["mouseout", "mouseover"]), l("onMouseLeave", ["mouseout", "mouseover"]), l("onPointerEnter", ["pointerout", "pointerover"]), l("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var ni = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), ri = new Set("cancel close invalid load scroll toggle".split(" ").concat(ni));
	function ii(e, t, n) {
		var r = e.type || "unknown-event";
		e.currentTarget = n, it(r, t, void 0, e), e.currentTarget = null;
	}
	function ai(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					ii(i, s, l), a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					ii(i, s, l), a = c;
				}
			}
		}
		if (et) throw e = tt, et = !1, tt = null, e;
	}
	function U(e, t) {
		var n = t[Fi];
		n === void 0 && (n = t[Fi] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (li(t, e, 2, !1), n.add(r));
	}
	function oi(e, t, n) {
		var r = 0;
		t && (r |= 4), li(n, e, r, t);
	}
	var si = "_reactListening" + Math.random().toString(36).slice(2);
	function ci(e) {
		if (!e[si]) {
			e[si] = !0, o.forEach(function(t) {
				t !== "selectionchange" && (ri.has(t) || oi(t, !1, e), oi(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[si] || (t[si] = !0, oi("selectionchange", !1, t));
		}
	}
	function li(e, t, n, r) {
		switch (vn(t)) {
			case 1:
				var i = pn;
				break;
			case 4:
				i = mn;
				break;
			default: i = hn;
		}
		n = i.bind(null, t, n, e), i = void 0, !Ye || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function ui(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var o = r.tag;
			if (o === 3 || o === 4) {
				var s = r.stateNode.containerInfo;
				if (s === i || s.nodeType === 8 && s.parentNode === i) break;
				if (o === 4) for (o = r.return; o !== null;) {
					var c = o.tag;
					if ((c === 3 || c === 4) && (c = o.stateNode.containerInfo, c === i || c.nodeType === 8 && c.parentNode === i)) return;
					o = o.return;
				}
				for (; s !== null;) {
					if (o = Ri(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		qe(function() {
			var r = a, i = Le(n), o = [];
			a: {
				var s = Zr.get(e);
				if (s !== void 0) {
					var c = On, l = e;
					switch (e) {
						case "keypress": if (Cn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Kn;
							break;
						case "focusin":
							l = "focus", c = Ln;
							break;
						case "focusout":
							l = "blur", c = Ln;
							break;
						case "beforeblur":
						case "afterblur":
							c = Ln;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							c = Fn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = In;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = Jn;
							break;
						case qr:
						case Jr:
						case Yr:
							c = Rn;
							break;
						case Xr:
							c = Yn;
							break;
						case "scroll":
							c = An;
							break;
						case "wheel":
							c = Xn;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = zn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup": c = qn;
					}
					var u = !!(t & 4), d = !u && e === "scroll", f = u ? s === null ? null : s + "Capture" : s;
					u = [];
					for (var p = r, m; p !== null;) {
						m = p;
						var h = m.stateNode;
						if (m.tag === 5 && h !== null && (m = h, f !== null && (h = Je(p, f), h != null && u.push(di(p, h, m)))), d) break;
						p = p.return;
					}
					0 < u.length && (s = new c(s, l, null, n, i), o.push({
						event: s,
						listeners: u
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Ie && (l = n.relatedTarget || n.fromElement) && (Ri(l) || l[Pi])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Ri(l) : null, l !== null && (d = at(l), l !== d || l.tag !== 5 && l.tag !== 6) && (l = null)) : (c = null, l = r), c !== l)) {
						if (u = Fn, h = "onMouseLeave", f = "onMouseEnter", p = "mouse", (e === "pointerout" || e === "pointerover") && (u = qn, h = "onPointerLeave", f = "onPointerEnter", p = "pointer"), d = c == null ? s : Bi(c), m = l == null ? s : Bi(l), s = new u(h, p + "leave", c, n, i), s.target = d, s.relatedTarget = m, h = null, Ri(i) === r && (u = new u(f, p + "enter", l, n, i), u.target = m, u.relatedTarget = d, h = u), d = h, c && l) b: {
							for (u = c, f = l, p = 0, m = u; m; m = pi(m)) p++;
							for (m = 0, h = f; h; h = pi(h)) m++;
							for (; 0 < p - m;) u = pi(u), p--;
							for (; 0 < m - p;) f = pi(f), m--;
							for (; p--;) {
								if (u === f || f !== null && u === f.alternate) break b;
								u = pi(u), f = pi(f);
							}
							u = null;
						}
						else u = null;
						c !== null && mi(o, s, c, u, !1), l !== null && d !== null && mi(o, d, l, u, !0);
					}
				}
				a: {
					if (s = r ? Bi(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var g = gr;
					else if (ur(s)) {
						if (_r) g = Er;
						else {
							g = wr;
							var _ = Cr;
						}
					} else (c = s.nodeName) && c.toLowerCase() === "input" && (s.type === "checkbox" || s.type === "radio") && (g = Tr);
					if (g &&= g(e, r)) {
						dr(o, g, n, i);
						break a;
					}
					_ && _(e, s, r), e === "focusout" && (_ = s._wrapperState) && _.controlled && s.type === "number" && ve(s, "number", s.value);
				}
				switch (_ = r ? Bi(r) : window, e) {
					case "focusin":
						(ur(_) || _.contentEditable === "true") && (Lr = _, Rr = r, zr = null);
						break;
					case "focusout":
						zr = Rr = Lr = null;
						break;
					case "mousedown":
						Br = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Br = !1, Vr(o, n, i);
						break;
					case "selectionchange": if (Ir) break;
					case "keydown":
					case "keyup": Vr(o, n, i);
				}
				var v;
				if (Qn) b: {
					switch (e) {
						case "compositionstart":
							var y = "onCompositionStart";
							break b;
						case "compositionend":
							y = "onCompositionEnd";
							break b;
						case "compositionupdate":
							y = "onCompositionUpdate";
							break b;
					}
					y = void 0;
				}
				else or ? ir(e, n) && (y = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (y = "onCompositionStart");
				y && (tr && n.locale !== "ko" && (or || y !== "onCompositionStart" ? y === "onCompositionEnd" && or && (v = Sn()) : (yn = i, bn = "value" in yn ? yn.value : yn.textContent, or = !0)), _ = fi(r, y), 0 < _.length && (y = new Bn(y, e, null, n, i), o.push({
					event: y,
					listeners: _
				}), v ? y.data = v : (v = ar(n), v !== null && (y.data = v)))), (v = er ? sr(e, n) : cr(e, n)) && (r = fi(r, "onBeforeInput"), 0 < r.length && (i = new Bn("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: i,
					listeners: r
				}), i.data = v));
			}
			ai(o, t);
		});
	}
	function di(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function fi(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			i.tag === 5 && a !== null && (i = a, a = Je(e, n), a != null && r.unshift(di(e, a, i)), a = Je(e, t), a != null && r.push(di(e, a, i))), e = e.return;
		}
		return r;
	}
	function pi(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5);
		return e || null;
	}
	function mi(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (c !== null && c === r) break;
			s.tag === 5 && l !== null && (s = l, i ? (c = Je(n, a), c != null && o.unshift(di(n, c, s))) : i || (c = Je(n, a), c != null && o.push(di(n, c, s)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var hi = /\r\n?/g, gi = /\u0000|\uFFFD/g;
	function _i(e) {
		return (typeof e == "string" ? e : "" + e).replace(hi, "\n").replace(gi, "");
	}
	function vi(e, t, n) {
		if (t = _i(t), _i(e) !== t && n) throw Error(a(425));
	}
	function yi() {}
	var bi = null, xi = null;
	function Si(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var Ci = typeof setTimeout == "function" ? setTimeout : void 0, wi = typeof clearTimeout == "function" ? clearTimeout : void 0, Ti = typeof Promise == "function" ? Promise : void 0, Ei = typeof queueMicrotask == "function" ? queueMicrotask : Ti === void 0 ? Ci : function(e) {
		return Ti.resolve(null).then(e).catch(Di);
	};
	function Di(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Oi(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$") {
					if (r === 0) {
						e.removeChild(i), un(t);
						return;
					}
					r--;
				} else n !== "$" && n !== "$?" && n !== "$!" || r++;
			}
			n = i;
		} while (n);
		un(t);
	}
	function ki(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
				if (t === "/$") return null;
			}
		}
		return e;
	}
	function Ai(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?") {
					if (t === 0) return e;
					t--;
				} else n === "/$" && t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	var ji = Math.random().toString(36).slice(2), Mi = "__reactFiber$" + ji, Ni = "__reactProps$" + ji, Pi = "__reactContainer$" + ji, Fi = "__reactEvents$" + ji, Ii = "__reactListeners$" + ji, Li = "__reactHandles$" + ji;
	function Ri(e) {
		var t = e[Mi];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[Pi] || n[Mi]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Ai(e); e !== null;) {
					if (n = e[Mi]) return n;
					e = Ai(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function zi(e) {
		return e = e[Mi] || e[Pi], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
	}
	function Bi(e) {
		if (e.tag === 5 || e.tag === 6) return e.stateNode;
		throw Error(a(33));
	}
	function Vi(e) {
		return e[Ni] || null;
	}
	var Hi = [], Ui = -1;
	function Wi(e) {
		return { current: e };
	}
	function W(e) {
		0 > Ui || (e.current = Hi[Ui], Hi[Ui] = null, Ui--);
	}
	function G(e, t) {
		Ui++, Hi[Ui] = e.current, e.current = t;
	}
	var Gi = {}, Ki = Wi(Gi), qi = Wi(!1), Ji = Gi;
	function Yi(e, t) {
		var n = e.type.contextTypes;
		if (!n) return Gi;
		var r = e.stateNode;
		if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
		var i = {}, a;
		for (a in n) i[a] = t[a];
		return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = i), i;
	}
	function Xi(e) {
		return e = e.childContextTypes, e != null;
	}
	function Zi() {
		W(qi), W(Ki);
	}
	function Qi(e, t, n) {
		if (Ki.current !== Gi) throw Error(a(168));
		G(Ki, t), G(qi, n);
	}
	function $i(e, t, n) {
		var r = e.stateNode;
		if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
		for (var i in r = r.getChildContext(), r) if (!(i in t)) throw Error(a(108, ue(e) || "Unknown", i));
		return N({}, n, r);
	}
	function ea(e) {
		return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Gi, Ji = Ki.current, G(Ki, e), G(qi, qi.current), !0;
	}
	function ta(e, t, n) {
		var r = e.stateNode;
		if (!r) throw Error(a(169));
		n ? (e = $i(e, t, Ji), r.__reactInternalMemoizedMergedChildContext = e, W(qi), W(Ki), G(Ki, e)) : W(qi), G(qi, n);
	}
	var na = null, ra = !1, ia = !1;
	function aa(e) {
		na === null ? na = [e] : na.push(e);
	}
	function oa(e) {
		ra = !0, aa(e);
	}
	function sa() {
		if (!ia && na !== null) {
			ia = !0;
			var e = 0, t = H;
			try {
				var n = na;
				for (H = 1; e < n.length; e++) {
					var r = n[e];
					do
						r = r(!0);
					while (r !== null);
				}
				na = null, ra = !1;
			} catch (t) {
				throw na !== null && (na = na.slice(e + 1)), dt(gt, sa), t;
			} finally {
				H = t, ia = !1;
			}
		}
		return null;
	}
	var ca = [], la = 0, ua = null, da = 0, fa = [], pa = 0, ma = null, ha = 1, ga = "";
	function _a(e, t) {
		ca[la++] = da, ca[la++] = ua, ua = e, da = t;
	}
	function va(e, t, n) {
		fa[pa++] = ha, fa[pa++] = ga, fa[pa++] = ma, ma = e;
		var r = ha;
		e = ga;
		var i = 32 - wt(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - wt(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, ha = 1 << 32 - wt(t) + i | n << i | r, ga = a + e;
		} else ha = 1 << a | n << i | r, ga = e;
	}
	function ya(e) {
		e.return !== null && (_a(e, 1), va(e, 1, 0));
	}
	function ba(e) {
		for (; e === ua;) ua = ca[--la], ca[la] = null, da = ca[--la], ca[la] = null;
		for (; e === ma;) ma = fa[--pa], fa[pa] = null, ga = fa[--pa], fa[pa] = null, ha = fa[--pa], fa[pa] = null;
	}
	var xa = null, Sa = null, K = !1, Ca = null;
	function wa(e, t) {
		var n = Kl(5, null, null, 0);
		n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
	}
	function Ta(e, t) {
		switch (e.tag) {
			case 5:
				var n = e.type;
				return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null && (e.stateNode = t, xa = e, Sa = ki(t.firstChild), !0);
			case 6: return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null && (e.stateNode = t, xa = e, Sa = null, !0);
			case 13: return t = t.nodeType === 8 ? t : null, t !== null && (n = ma === null ? null : {
				id: ha,
				overflow: ga
			}, e.memoizedState = {
				dehydrated: t,
				treeContext: n,
				retryLane: 1073741824
			}, n = Kl(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, xa = e, Sa = null, !0);
			default: return !1;
		}
	}
	function Ea(e) {
		return !!(e.mode & 1) && !(e.flags & 128);
	}
	function Da(e) {
		if (K) {
			var t = Sa;
			if (t) {
				var n = t;
				if (!Ta(e, t)) {
					if (Ea(e)) throw Error(a(418));
					t = ki(n.nextSibling);
					var r = xa;
					t && Ta(e, t) ? wa(r, n) : (e.flags = e.flags & -4097 | 2, K = !1, xa = e);
				}
			} else {
				if (Ea(e)) throw Error(a(418));
				e.flags = e.flags & -4097 | 2, K = !1, xa = e;
			}
		}
	}
	function Oa(e) {
		for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;) e = e.return;
		xa = e;
	}
	function ka(e) {
		if (e !== xa) return !1;
		if (!K) return Oa(e), K = !0, !1;
		var t;
		if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Si(e.type, e.memoizedProps)), t &&= Sa) {
			if (Ea(e)) throw Aa(), Error(a(418));
			for (; t;) wa(e, t), t = ki(t.nextSibling);
		}
		if (Oa(e), e.tag === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(a(317));
			a: {
				for (e = e.nextSibling, t = 0; e;) {
					if (e.nodeType === 8) {
						var n = e.data;
						if (n === "/$") {
							if (t === 0) {
								Sa = ki(e.nextSibling);
								break a;
							}
							t--;
						} else n !== "$" && n !== "$!" && n !== "$?" || t++;
					}
					e = e.nextSibling;
				}
				Sa = null;
			}
		} else Sa = xa ? ki(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Aa() {
		for (var e = Sa; e;) e = ki(e.nextSibling);
	}
	function ja() {
		Sa = xa = null, K = !1;
	}
	function Ma(e) {
		Ca === null ? Ca = [e] : Ca.push(e);
	}
	var Na = C.ReactCurrentBatchConfig;
	function Pa(e, t, n) {
		if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
			if (n._owner) {
				if (n = n._owner, n) {
					if (n.tag !== 1) throw Error(a(309));
					var r = n.stateNode;
				}
				if (!r) throw Error(a(147, e));
				var i = r, o = "" + e;
				return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === o ? t.ref : (t = function(e) {
					var t = i.refs;
					e === null ? delete t[o] : t[o] = e;
				}, t._stringRef = o, t);
			}
			if (typeof e != "string") throw Error(a(284));
			if (!n._owner) throw Error(a(290, e));
		}
		return e;
	}
	function Fa(e, t) {
		throw e = Object.prototype.toString.call(t), Error(a(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
	}
	function Ia(e) {
		var t = e._init;
		return t(e._payload);
	}
	function La(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e, t) {
			for (e = /* @__PURE__ */ new Map(); t !== null;) t.key === null ? e.set(t.index, t) : e.set(t.key, t), t = t.sibling;
			return e;
		}
		function i(e, t) {
			return e = Yl(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 2, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 2), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = $l(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === E ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === ne && Ia(a) === t.type) ? (r = i(t, n.props), r.ref = Pa(e, t, n), r.return = e, r) : (r = Xl(n.type, n.key, n.props, null, e.mode, r), r.ref = Pa(e, t, n), r.return = e, r);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = eu(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = Zl(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number") return t = $l("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case w: return n = Xl(t.type, t.key, t.props, null, e.mode, n), n.ref = Pa(e, null, t), n.return = e, n;
					case T: return t = eu(t, e.mode, n), t.return = e, t;
					case ne:
						var r = t._init;
						return f(e, r(t._payload), n);
				}
				if (ye(t) || ae(t)) return t = Zl(t, e.mode, n, null), t.return = e, t;
				Fa(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case w: return n.key === i ? l(e, t, n, r) : null;
					case T: return n.key === i ? u(e, t, n, r) : null;
					case ne: return i = n._init, p(e, t, i(n._payload), r);
				}
				if (ye(n) || ae(n)) return i === null ? d(e, t, n, r, null) : null;
				Fa(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case w: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case T: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case ne:
						var a = r._init;
						return m(e, t, n, a(r._payload), i);
				}
				if (ye(r) || ae(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				Fa(t, r);
			}
			return null;
		}
		function h(i, a, s, c) {
			for (var l = null, u = null, d = a, h = a = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), a = o(_, a, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), K && _a(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return K && _a(i, h), l;
			}
			for (d = r(i, d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), K && _a(i, h), l;
		}
		function g(i, s, c, l) {
			var u = ae(c);
			if (typeof u != "function") throw Error(a(150));
			if (c = u.call(c), c == null) throw Error(a(151));
			for (var d = u = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(i, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(i, h), s = o(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(i, h), K && _a(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return K && _a(i, g), u;
			}
			for (h = r(i, h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), K && _a(i, g), u;
		}
		function _(e, r, a, o) {
			if (typeof a == "object" && a && a.type === E && a.key === null && (a = a.props.children), typeof a == "object" && a) {
				switch (a.$$typeof) {
					case w:
						a: {
							for (var c = a.key, l = r; l !== null;) {
								if (l.key === c) {
									if (c = a.type, c === E) {
										if (l.tag === 7) {
											n(e, l.sibling), r = i(l, a.props.children), r.return = e, e = r;
											break a;
										}
									} else if (l.elementType === c || typeof c == "object" && c && c.$$typeof === ne && Ia(c) === l.type) {
										n(e, l.sibling), r = i(l, a.props), r.ref = Pa(e, l, a), r.return = e, e = r;
										break a;
									}
									n(e, l);
									break;
								}
								t(e, l), l = l.sibling;
							}
							a.type === E ? (r = Zl(a.props.children, e.mode, o, a.key), r.return = e, e = r) : (o = Xl(a.type, a.key, a.props, null, e.mode, o), o.ref = Pa(e, r, a), o.return = e, e = o);
						}
						return s(e);
					case T:
						a: {
							for (l = a.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === a.containerInfo && r.stateNode.implementation === a.implementation) {
										n(e, r.sibling), r = i(r, a.children || []), r.return = e, e = r;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							r = eu(a, e.mode, o), r.return = e, e = r;
						}
						return s(e);
					case ne: return l = a._init, _(e, r, l(a._payload), o);
				}
				if (ye(a)) return h(e, r, a, o);
				if (ae(a)) return g(e, r, a, o);
				Fa(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), r = i(r, a), r.return = e, e = r) : (n(e, r), r = $l(a, e.mode, o), r.return = e, e = r), s(e)) : n(e, r);
		}
		return _;
	}
	var Ra = La(!0), za = La(!1), Ba = Wi(null), Va = null, Ha = null, Ua = null;
	function Wa() {
		Ua = Ha = Va = null;
	}
	function Ga(e) {
		var t = Ba.current;
		W(Ba), e._currentValue = t;
	}
	function Ka(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function qa(e, t) {
		Va = e, Ua = Ha = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & t) !== 0 && (Ps = !0), e.firstContext = null);
	}
	function Ja(e) {
		var t = e._currentValue;
		if (Ua !== e) {
			if (e = {
				context: e,
				memoizedValue: t,
				next: null
			}, Ha === null) {
				if (Va === null) throw Error(a(308));
				Ha = e, Va.dependencies = {
					lanes: 0,
					firstContext: e
				};
			} else Ha = Ha.next = e;
		}
		return t;
	}
	var Ya = null;
	function Xa(e) {
		Ya === null ? Ya = [e] : Ya.push(e);
	}
	function Za(e, t, n, r) {
		var i = t.interleaved;
		return i === null ? (n.next = n, Xa(t)) : (n.next = i.next, i.next = n), t.interleaved = n, Qa(e, r);
	}
	function Qa(e, t) {
		e.lanes |= t;
		var n = e.alternate;
		for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null;) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
		return n.tag === 3 ? n.stateNode : null;
	}
	var $a = !1;
	function eo(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				interleaved: null,
				lanes: 0
			},
			effects: null
		};
	}
	function to(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			effects: e.effects
		});
	}
	function no(e, t) {
		return {
			eventTime: e,
			lane: t,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function ro(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, Z & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, Qa(e, n);
		}
		return i = r.interleaved, i === null ? (t.next = t, Xa(r)) : (t.next = i.next, i.next = t), r.interleaved = t, Qa(e, n);
	}
	function io(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194240)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, zt(e, n);
		}
	}
	function ao(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						eventTime: n.eventTime,
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: n.callback,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				effects: r.effects
			}, e.updateQueue = n;
			return;
		}
		e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	function oo(e, t, n, r) {
		var i = e.updateQueue;
		$a = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane, p = s.eventTime;
				if ((r & f) === f) {
					u !== null && (u = u.next = {
						eventTime: p,
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: s.callback,
						next: null
					});
					a: {
						var m = e, h = s;
						switch (f = t, p = n, h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(p, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(p, d, f) : m, f == null) break a;
								d = N({}, d, f);
								break a;
							case 2: $a = !0;
						}
					}
					s.callback !== null && s.lane !== 0 && (e.flags |= 64, f = i.effects, f === null ? i.effects = [s] : f.push(s));
				} else p = {
					eventTime: p,
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					f = s, s = f.next, f.next = null, i.lastBaseUpdate = f, i.shared.pending = null;
				}
			} while (1);
			if (u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, t = i.shared.interleaved, t !== null) {
				i = t;
				do
					o |= i.lane, i = i.next;
				while (i !== t);
			} else a === null && (i.shared.lanes = 0);
			Yc |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function so(e, t, n) {
		if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
			var r = e[t], i = r.callback;
			if (i !== null) {
				if (r.callback = null, r = n, typeof i != "function") throw Error(a(191, i));
				i.call(r);
			}
		}
	}
	var co = {}, lo = Wi(co), uo = Wi(co), fo = Wi(co);
	function po(e) {
		if (e === co) throw Error(a(174));
		return e;
	}
	function mo(e, t) {
		switch (G(fo, t), G(uo, e), G(lo, co), e = t.nodeType, e) {
			case 9:
			case 11:
				t = (t = t.documentElement) ? t.namespaceURI : Ee(null, "");
				break;
			default: e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Ee(t, e);
		}
		W(lo), G(lo, t);
	}
	function ho() {
		W(lo), W(uo), W(fo);
	}
	function go(e) {
		po(fo.current);
		var t = po(lo.current), n = Ee(t, e.type);
		t !== n && (G(uo, e), G(lo, n));
	}
	function _o(e) {
		uo.current === e && (W(lo), W(uo));
	}
	var q = Wi(0);
	function vo(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
			} else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var yo = [];
	function bo() {
		for (var e = 0; e < yo.length; e++) yo[e]._workInProgressVersionPrimary = null;
		yo.length = 0;
	}
	var xo = C.ReactCurrentDispatcher, So = C.ReactCurrentBatchConfig, Co = 0, J = null, Y = null, wo = null, To = !1, Eo = !1, Do = 0, Oo = 0;
	function ko() {
		throw Error(a(321));
	}
	function Ao(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Or(e[n], t[n])) return !1;
		return !0;
	}
	function jo(e, t, n, r, i, o) {
		if (Co = o, J = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, xo.current = e === null || e.memoizedState === null ? ms : hs, e = n(r, i), Eo) {
			o = 0;
			do {
				if (Eo = !1, Do = 0, 25 <= o) throw Error(a(301));
				o += 1, wo = Y = null, t.updateQueue = null, xo.current = gs, e = n(r, i);
			} while (Eo);
		}
		if (xo.current = ps, t = Y !== null && Y.next !== null, Co = 0, wo = Y = J = null, To = !1, t) throw Error(a(300));
		return e;
	}
	function Mo() {
		var e = Do !== 0;
		return Do = 0, e;
	}
	function No() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return wo === null ? J.memoizedState = wo = e : wo = wo.next = e, wo;
	}
	function Po() {
		if (Y === null) {
			var e = J.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Y.next;
		var t = wo === null ? J.memoizedState : wo.next;
		if (t !== null) wo = t, Y = e;
		else {
			if (e === null) throw Error(a(310));
			Y = e, e = {
				memoizedState: Y.memoizedState,
				baseState: Y.baseState,
				baseQueue: Y.baseQueue,
				queue: Y.queue,
				next: null
			}, wo === null ? J.memoizedState = wo = e : wo = wo.next = e;
		}
		return wo;
	}
	function Fo(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function Io(e) {
		var t = Po(), n = t.queue;
		if (n === null) throw Error(a(311));
		n.lastRenderedReducer = e;
		var r = Y, i = r.baseQueue, o = n.pending;
		if (o !== null) {
			if (i !== null) {
				var s = i.next;
				i.next = o.next, o.next = s;
			}
			r.baseQueue = i = o, n.pending = null;
		}
		if (i !== null) {
			o = i.next, r = r.baseState;
			var c = s = null, l = null, u = o;
			do {
				var d = u.lane;
				if ((Co & d) === d) l !== null && (l = l.next = {
					lane: 0,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}), r = u.hasEagerState ? u.eagerState : e(r, u.action);
				else {
					var f = {
						lane: d,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					};
					l === null ? (c = l = f, s = r) : l = l.next = f, J.lanes |= d, Yc |= d;
				}
				u = u.next;
			} while (u !== null && u !== o);
			l === null ? s = r : l.next = c, Or(r, t.memoizedState) || (Ps = !0), t.memoizedState = r, t.baseState = s, t.baseQueue = l, n.lastRenderedState = r;
		}
		if (e = n.interleaved, e !== null) {
			i = e;
			do
				o = i.lane, J.lanes |= o, Yc |= o, i = i.next;
			while (i !== e);
		} else i === null && (n.lanes = 0);
		return [t.memoizedState, n.dispatch];
	}
	function Lo(e) {
		var t = Po(), n = t.queue;
		if (n === null) throw Error(a(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, o = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var s = i = i.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== i);
			Or(o, t.memoizedState) || (Ps = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function Ro() {}
	function zo(e, t) {
		var n = J, r = Po(), i = t(), o = !Or(r.memoizedState, i);
		if (o && (r.memoizedState = i, Ps = !0), r = r.queue, Zo(Ho.bind(null, n, r, e), [e]), r.getSnapshot !== t || o || wo !== null && wo.memoizedState.tag & 1) {
			if (n.flags |= 2048, Ko(9, Vo.bind(null, n, r, i, t), void 0, null), Uc === null) throw Error(a(349));
			Co & 30 || Bo(n, t, i);
		}
		return i;
	}
	function Bo(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = J.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, J.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function Vo(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Uo(t) && Wo(e);
	}
	function Ho(e, t, n) {
		return n(function() {
			Uo(t) && Wo(e);
		});
	}
	function Uo(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Or(e, n);
		} catch {
			return !0;
		}
	}
	function Wo(e) {
		var t = Qa(e, 1);
		t !== null && hl(t, e, 1, -1);
	}
	function Go(e) {
		var t = No();
		return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = {
			pending: null,
			interleaved: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Fo,
			lastRenderedState: e
		}, t.queue = e, e = e.dispatch = ls.bind(null, J, e), [t.memoizedState, e];
	}
	function Ko(e, t, n, r) {
		return e = {
			tag: e,
			create: t,
			destroy: n,
			deps: r,
			next: null
		}, t = J.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, J.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
	}
	function qo() {
		return Po().memoizedState;
	}
	function Jo(e, t, n, r) {
		var i = No();
		J.flags |= e, i.memoizedState = Ko(1 | t, n, void 0, r === void 0 ? null : r);
	}
	function Yo(e, t, n, r) {
		var i = Po();
		r = r === void 0 ? null : r;
		var a = void 0;
		if (Y !== null) {
			var o = Y.memoizedState;
			if (a = o.destroy, r !== null && Ao(r, o.deps)) {
				i.memoizedState = Ko(t, n, a, r);
				return;
			}
		}
		J.flags |= e, i.memoizedState = Ko(1 | t, n, a, r);
	}
	function Xo(e, t) {
		return Jo(8390656, 8, e, t);
	}
	function Zo(e, t) {
		return Yo(2048, 8, e, t);
	}
	function Qo(e, t) {
		return Yo(4, 2, e, t);
	}
	function $o(e, t) {
		return Yo(4, 4, e, t);
	}
	function es(e, t) {
		if (typeof t == "function") return e = e(), t(e), function() {
			t(null);
		};
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function ts(e, t, n) {
		return n = n == null ? null : n.concat([e]), Yo(4, 4, es.bind(null, t, e), n);
	}
	function ns() {}
	function rs(e, t) {
		var n = Po();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return r !== null && t !== null && Ao(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function is(e, t) {
		var n = Po();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return r !== null && t !== null && Ao(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
	}
	function as(e, t, n) {
		return Co & 21 ? (Or(n, t) || (n = Ft(), J.lanes |= n, Yc |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, Ps = !0), e.memoizedState = n);
	}
	function os(e, t) {
		var n = H;
		H = n !== 0 && 4 > n ? n : 4, e(!0);
		var r = So.transition;
		So.transition = {};
		try {
			e(!1), t();
		} finally {
			H = n, So.transition = r;
		}
	}
	function ss() {
		return Po().memoizedState;
	}
	function cs(e, t, n) {
		var r = ml(e);
		if (n = {
			lane: r,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, us(e)) ds(t, n);
		else if (n = Za(e, t, n, r), n !== null) {
			var i = pl();
			hl(n, e, r, i), fs(n, t, r);
		}
	}
	function ls(e, t, n) {
		var r = ml(e), i = {
			lane: r,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (us(e)) ds(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Or(s, o)) {
					var c = t.interleaved;
					c === null ? (i.next = i, Xa(t)) : (i.next = c.next, c.next = i), t.interleaved = i;
					return;
				}
			} catch {}
			n = Za(e, t, i, r), n !== null && (i = pl(), hl(n, e, r, i), fs(n, t, r));
		}
	}
	function us(e) {
		var t = e.alternate;
		return e === J || t !== null && t === J;
	}
	function ds(e, t) {
		Eo = To = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function fs(e, t, n) {
		if (n & 4194240) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, zt(e, n);
		}
	}
	var ps = {
		readContext: Ja,
		useCallback: ko,
		useContext: ko,
		useEffect: ko,
		useImperativeHandle: ko,
		useInsertionEffect: ko,
		useLayoutEffect: ko,
		useMemo: ko,
		useReducer: ko,
		useRef: ko,
		useState: ko,
		useDebugValue: ko,
		useDeferredValue: ko,
		useTransition: ko,
		useMutableSource: ko,
		useSyncExternalStore: ko,
		useId: ko,
		unstable_isNewReconciler: !1
	}, ms = {
		readContext: Ja,
		useCallback: function(e, t) {
			return No().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Ja,
		useEffect: Xo,
		useImperativeHandle: function(e, t, n) {
			return n = n == null ? null : n.concat([e]), Jo(4194308, 4, es.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Jo(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			return Jo(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = No();
			return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
		},
		useReducer: function(e, t, n) {
			var r = No();
			return t = n === void 0 ? t : n(t), r.memoizedState = r.baseState = t, e = {
				pending: null,
				interleaved: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: t
			}, r.queue = e, e = e.dispatch = cs.bind(null, J, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = No();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: Go,
		useDebugValue: ns,
		useDeferredValue: function(e) {
			return No().memoizedState = e;
		},
		useTransition: function() {
			var e = Go(!1), t = e[0];
			return e = os.bind(null, e[1]), No().memoizedState = e, [t, e];
		},
		useMutableSource: function() {},
		useSyncExternalStore: function(e, t, n) {
			var r = J, i = No();
			if (K) {
				if (n === void 0) throw Error(a(407));
				n = n();
			} else {
				if (n = t(), Uc === null) throw Error(a(349));
				Co & 30 || Bo(r, t, n);
			}
			i.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return i.queue = o, Xo(Ho.bind(null, r, o, e), [e]), r.flags |= 2048, Ko(9, Vo.bind(null, r, o, n, t), void 0, null), n;
		},
		useId: function() {
			var e = No(), t = Uc.identifierPrefix;
			if (K) {
				var n = ga, r = ha;
				n = (r & ~(1 << 32 - wt(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Do++, 0 < n && (t += "H" + n.toString(32)), t += ":";
			} else n = Oo++, t = ":" + t + "r" + n.toString(32) + ":";
			return e.memoizedState = t;
		},
		unstable_isNewReconciler: !1
	}, hs = {
		readContext: Ja,
		useCallback: rs,
		useContext: Ja,
		useEffect: Zo,
		useImperativeHandle: ts,
		useInsertionEffect: Qo,
		useLayoutEffect: $o,
		useMemo: is,
		useReducer: Io,
		useRef: qo,
		useState: function() {
			return Io(Fo);
		},
		useDebugValue: ns,
		useDeferredValue: function(e) {
			return as(Po(), Y.memoizedState, e);
		},
		useTransition: function() {
			return [Io(Fo)[0], Po().memoizedState];
		},
		useMutableSource: Ro,
		useSyncExternalStore: zo,
		useId: ss,
		unstable_isNewReconciler: !1
	}, gs = {
		readContext: Ja,
		useCallback: rs,
		useContext: Ja,
		useEffect: Zo,
		useImperativeHandle: ts,
		useInsertionEffect: Qo,
		useLayoutEffect: $o,
		useMemo: is,
		useReducer: Lo,
		useRef: qo,
		useState: function() {
			return Lo(Fo);
		},
		useDebugValue: ns,
		useDeferredValue: function(e) {
			var t = Po();
			return Y === null ? t.memoizedState = e : as(t, Y.memoizedState, e);
		},
		useTransition: function() {
			return [Lo(Fo)[0], Po().memoizedState];
		},
		useMutableSource: Ro,
		useSyncExternalStore: zo,
		useId: ss,
		unstable_isNewReconciler: !1
	};
	function _s(e, t) {
		if (e && e.defaultProps) {
			for (var n in t = N({}, t), e = e.defaultProps, e) t[n] === void 0 && (t[n] = e[n]);
			return t;
		}
		return t;
	}
	function vs(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : N({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var ys = {
		isMounted: function(e) {
			return (e = e._reactInternals) ? at(e) === e : !1;
		},
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = pl(), i = ml(e), a = no(r, i);
			a.payload = t, n != null && (a.callback = n), t = ro(e, a, i), t !== null && (hl(t, e, i, r), io(t, e, i));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = pl(), i = ml(e), a = no(r, i);
			a.tag = 1, a.payload = t, n != null && (a.callback = n), t = ro(e, a, i), t !== null && (hl(t, e, i, r), io(t, e, i));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = pl(), r = ml(e), i = no(n, r);
			i.tag = 2, t != null && (i.callback = t), t = ro(e, i, r), t !== null && (hl(t, e, r, n), io(t, e, r));
		}
	};
	function bs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !kr(n, r) || !kr(i, a) : !0;
	}
	function xs(e, t, n) {
		var r = !1, i = Gi, a = t.contextType;
		return typeof a == "object" && a ? a = Ja(a) : (i = Xi(t) ? Ji : Ki.current, r = t.contextTypes, a = (r = r != null) ? Yi(e, i) : Gi), t = new t(n, a), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = ys, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = i, e.__reactInternalMemoizedMaskedChildContext = a), t;
	}
	function Ss(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && ys.enqueueReplaceState(t, t.state, null);
	}
	function Cs(e, t, n, r) {
		var i = e.stateNode;
		i.props = n, i.state = e.memoizedState, i.refs = {}, eo(e);
		var a = t.contextType;
		typeof a == "object" && a ? i.context = Ja(a) : (a = Xi(t) ? Ji : Ki.current, i.context = Yi(e, a)), i.state = e.memoizedState, a = t.getDerivedStateFromProps, typeof a == "function" && (vs(e, t, a, n), i.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), t !== i.state && ys.enqueueReplaceState(i, i.state, null), oo(e, n, i, r), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.flags |= 4194308);
	}
	function ws(e, t) {
		try {
			var n = "", r = t;
			do
				n += P(r), r = r.return;
			while (r);
			var i = n;
		} catch (e) {
			i = "\nError generating stack: " + e.message + "\n" + e.stack;
		}
		return {
			value: e,
			source: t,
			stack: i,
			digest: null
		};
	}
	function Ts(e, t, n) {
		return {
			value: e,
			source: null,
			stack: n ?? null,
			digest: t ?? null
		};
	}
	function Es(e, t) {
		try {
			console.error(t.value);
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	var Ds = typeof WeakMap == "function" ? WeakMap : Map;
	function Os(e, t, n) {
		n = no(-1, n), n.tag = 3, n.payload = { element: null };
		var r = t.value;
		return n.callback = function() {
			rl || (rl = !0, il = r), Es(e, t);
		}, n;
	}
	function ks(e, t, n) {
		n = no(-1, n), n.tag = 3;
		var r = e.type.getDerivedStateFromError;
		if (typeof r == "function") {
			var i = t.value;
			n.payload = function() {
				return r(i);
			}, n.callback = function() {
				Es(e, t);
			};
		}
		var a = e.stateNode;
		return a !== null && typeof a.componentDidCatch == "function" && (n.callback = function() {
			Es(e, t), typeof r != "function" && (al === null ? al = /* @__PURE__ */ new Set([this]) : al.add(this));
			var n = t.stack;
			this.componentDidCatch(t.value, { componentStack: n === null ? "" : n });
		}), n;
	}
	function As(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Ds();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (i.add(n), e = zl.bind(null, e, t, n), t.then(e, e));
	}
	function js(e) {
		do {
			var t;
			if ((t = e.tag === 13) && (t = e.memoizedState, t = t === null || t.dehydrated !== null), t) return e;
			e = e.return;
		} while (e !== null);
		return null;
	}
	function Ms(e, t, n, r, i) {
		return e.mode & 1 ? (e.flags |= 65536, e.lanes = i, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = no(-1, 1), t.tag = 2, ro(n, t, 1))), n.lanes |= 1), e);
	}
	var Ns = C.ReactCurrentOwner, Ps = !1;
	function Fs(e, t, n, r) {
		t.child = e === null ? za(t, null, n, r) : Ra(t, e.child, n, r);
	}
	function Is(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		return qa(t, i), r = jo(e, t, n, r, a, i), n = Mo(), e !== null && !Ps ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, nc(e, t, i)) : (K && n && ya(t), t.flags |= 1, Fs(e, t, r, i), t.child);
	}
	function Ls(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ql(a) && a.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = a, Rs(e, t, a, r, i)) : (e = Xl(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, (e.lanes & i) === 0) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? kr : n, n(o, r) && e.ref === t.ref) return nc(e, t, i);
		}
		return t.flags |= 1, e = Yl(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Rs(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (kr(a, r) && e.ref === t.ref) {
				if (Ps = !1, t.pendingProps = r = a, (e.lanes & i) !== 0) e.flags & 131072 && (Ps = !0);
				else return t.lanes = e.lanes, nc(e, t, i);
			}
		}
		return Vs(e, t, n, r, i);
	}
	function zs(e, t, n) {
		var r = t.pendingProps, i = r.children, a = e === null ? null : e.memoizedState;
		if (r.mode === "hidden") {
			if (!(t.mode & 1)) t.memoizedState = {
				baseLanes: 0,
				cachePool: null,
				transitions: null
			}, G(Kc, Gc), Gc |= n;
			else {
				if (!(n & 1073741824)) return e = a === null ? n : a.baseLanes | n, t.lanes = t.childLanes = 1073741824, t.memoizedState = {
					baseLanes: e,
					cachePool: null,
					transitions: null
				}, t.updateQueue = null, G(Kc, Gc), Gc |= e, null;
				t.memoizedState = {
					baseLanes: 0,
					cachePool: null,
					transitions: null
				}, r = a === null ? n : a.baseLanes, G(Kc, Gc), Gc |= r;
			}
		} else a === null ? r = n : (r = a.baseLanes | n, t.memoizedState = null), G(Kc, Gc), Gc |= r;
		return Fs(e, t, i, n), t.child;
	}
	function Bs(e, t) {
		var n = t.ref;
		(e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
	}
	function Vs(e, t, n, r, i) {
		var a = Xi(n) ? Ji : Ki.current;
		return a = Yi(t, a), qa(t, i), n = jo(e, t, n, r, a, i), r = Mo(), e !== null && !Ps ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, nc(e, t, i)) : (K && r && ya(t), t.flags |= 1, Fs(e, t, n, i), t.child);
	}
	function Hs(e, t, n, r, i) {
		if (Xi(n)) {
			var a = !0;
			ea(t);
		} else a = !1;
		if (qa(t, i), t.stateNode === null) tc(e, t), xs(t, n, r), Cs(t, n, r, i), r = !0;
		else if (e === null) {
			var o = t.stateNode, s = t.memoizedProps;
			o.props = s;
			var c = o.context, l = n.contextType;
			typeof l == "object" && l ? l = Ja(l) : (l = Xi(n) ? Ji : Ki.current, l = Yi(t, l));
			var u = n.getDerivedStateFromProps, d = typeof u == "function" || typeof o.getSnapshotBeforeUpdate == "function";
			d || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== r || c !== l) && Ss(t, o, r, l), $a = !1;
			var f = t.memoizedState;
			o.state = f, oo(t, r, o, i), c = t.memoizedState, s !== r || f !== c || qi.current || $a ? (typeof u == "function" && (vs(t, n, u, r), c = t.memoizedState), (s = $a || bs(t, n, s, r, f, c, l)) ? (d || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = c), o.props = r, o.state = c, o.context = l, r = s) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			o = t.stateNode, to(e, t), s = t.memoizedProps, l = t.type === t.elementType ? s : _s(t.type, s), o.props = l, d = t.pendingProps, f = o.context, c = n.contextType, typeof c == "object" && c ? c = Ja(c) : (c = Xi(n) ? Ji : Ki.current, c = Yi(t, c));
			var p = n.getDerivedStateFromProps;
			(u = typeof p == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== d || f !== c) && Ss(t, o, r, c), $a = !1, f = t.memoizedState, o.state = f, oo(t, r, o, i);
			var m = t.memoizedState;
			s !== d || f !== m || qi.current || $a ? (typeof p == "function" && (vs(t, n, p, r), m = t.memoizedState), (l = $a || bs(t, n, l, r, f, m, c) || !1) ? (u || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, m, c), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, m, c)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = m), o.props = r, o.state = m, o.context = c, r = l) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return Us(e, t, n, r, a, i);
	}
	function Us(e, t, n, r, i, a) {
		Bs(e, t);
		var o = !!(t.flags & 128);
		if (!r && !o) return i && ta(t, n, !1), nc(e, t, a);
		r = t.stateNode, Ns.current = t;
		var s = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
		return t.flags |= 1, e !== null && o ? (t.child = Ra(t, e.child, null, a), t.child = Ra(t, null, s, a)) : Fs(e, t, s, a), t.memoizedState = r.state, i && ta(t, n, !0), t.child;
	}
	function Ws(e) {
		var t = e.stateNode;
		t.pendingContext ? Qi(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Qi(e, t.context, !1), mo(e, t.containerInfo);
	}
	function Gs(e, t, n, r, i) {
		return ja(), Ma(i), t.flags |= 256, Fs(e, t, n, r), t.child;
	}
	var Ks = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0
	};
	function qs(e) {
		return {
			baseLanes: e,
			cachePool: null,
			transitions: null
		};
	}
	function Js(e, t, n) {
		var r = t.pendingProps, i = q.current, a = !1, o = !!(t.flags & 128), s;
		if ((s = o) || (s = e !== null && e.memoizedState === null ? !1 : !!(i & 2)), s ? (a = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (i |= 1), G(q, i & 1), e === null) return Da(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.lanes = t.mode & 1 ? e.data === "$!" ? 8 : 1073741824 : 1, null) : (o = r.children, e = r.fallback, a ? (r = t.mode, a = t.child, o = {
			mode: "hidden",
			children: o
		}, !(r & 1) && a !== null ? (a.childLanes = 0, a.pendingProps = o) : a = Ql(o, r, 0, null), e = Zl(e, r, n, null), a.return = t, e.return = t, a.sibling = e, t.child = a, t.child.memoizedState = qs(n), t.memoizedState = Ks, e) : Ys(t, o));
		if (i = e.memoizedState, i !== null && (s = i.dehydrated, s !== null)) return Zs(e, t, o, r, s, i, n);
		if (a) {
			a = r.fallback, o = t.mode, i = e.child, s = i.sibling;
			var c = {
				mode: "hidden",
				children: r.children
			};
			return !(o & 1) && t.child !== i ? (r = t.child, r.childLanes = 0, r.pendingProps = c, t.deletions = null) : (r = Yl(i, c), r.subtreeFlags = i.subtreeFlags & 14680064), s === null ? (a = Zl(a, o, n, null), a.flags |= 2) : a = Yl(s, a), a.return = t, r.return = t, r.sibling = a, t.child = r, r = a, a = t.child, o = e.child.memoizedState, o = o === null ? qs(n) : {
				baseLanes: o.baseLanes | n,
				cachePool: null,
				transitions: o.transitions
			}, a.memoizedState = o, a.childLanes = e.childLanes & ~n, t.memoizedState = Ks, r;
		}
		return a = e.child, e = a.sibling, r = Yl(a, {
			mode: "visible",
			children: r.children
		}), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
	}
	function Ys(e, t) {
		return t = Ql({
			mode: "visible",
			children: t
		}, e.mode, 0, null), t.return = e, e.child = t;
	}
	function Xs(e, t, n, r) {
		return r !== null && Ma(r), Ra(t, e.child, null, n), e = Ys(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Zs(e, t, n, r, i, o, s) {
		if (n) return t.flags & 256 ? (t.flags &= -257, r = Ts(Error(a(422))), Xs(e, t, s, r)) : t.memoizedState === null ? (o = r.fallback, i = t.mode, r = Ql({
			mode: "visible",
			children: r.children
		}, i, 0, null), o = Zl(o, i, s, null), o.flags |= 2, r.return = t, o.return = t, r.sibling = o, t.child = r, t.mode & 1 && Ra(t, e.child, null, s), t.child.memoizedState = qs(s), t.memoizedState = Ks, o) : (t.child = e.child, t.flags |= 128, null);
		if (!(t.mode & 1)) return Xs(e, t, s, null);
		if (i.data === "$!") {
			if (r = i.nextSibling && i.nextSibling.dataset, r) var c = r.dgst;
			return r = c, o = Error(a(419)), r = Ts(o, r, void 0), Xs(e, t, s, r);
		}
		if (c = (s & e.childLanes) !== 0, Ps || c) {
			if (r = Uc, r !== null) {
				switch (s & -s) {
					case 4:
						i = 2;
						break;
					case 16:
						i = 8;
						break;
					case 64:
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
					case 4194304:
					case 8388608:
					case 16777216:
					case 33554432:
					case 67108864:
						i = 32;
						break;
					case 536870912:
						i = 268435456;
						break;
					default: i = 0;
				}
				i = (i & (r.suspendedLanes | s)) === 0 ? i : 0, i !== 0 && i !== o.retryLane && (o.retryLane = i, Qa(e, i), hl(r, e, i, -1));
			}
			return kl(), r = Ts(Error(a(421))), Xs(e, t, s, r);
		}
		return i.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Vl.bind(null, e), i._reactRetry = t, null) : (e = o.treeContext, Sa = ki(i.nextSibling), xa = t, K = !0, Ca = null, e !== null && (fa[pa++] = ha, fa[pa++] = ga, fa[pa++] = ma, ha = e.id, ga = e.overflow, ma = t), t = Ys(t, r.children), t.flags |= 4096, t);
	}
	function Qs(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Ka(e.return, t, n);
	}
	function $s(e, t, n, r, i) {
		var a = e.memoizedState;
		a === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i
		} : (a.isBackwards = t, a.rendering = null, a.renderingStartTime = 0, a.last = r, a.tail = n, a.tailMode = i);
	}
	function ec(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		if (Fs(e, t, r.children, n), r = q.current, r & 2) r = r & 1 | 2, t.flags |= 128;
		else {
			if (e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
				if (e.tag === 13) e.memoizedState !== null && Qs(e, n, t);
				else if (e.tag === 19) Qs(e, n, t);
				else if (e.child !== null) {
					e.child.return = e, e = e.child;
					continue;
				}
				if (e === t) break a;
				for (; e.sibling === null;) {
					if (e.return === null || e.return === t) break a;
					e = e.return;
				}
				e.sibling.return = e.return, e = e.sibling;
			}
			r &= 1;
		}
		if (G(q, r), !(t.mode & 1)) t.memoizedState = null;
		else switch (i) {
			case "forwards":
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && vo(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), $s(t, !1, i, n, a);
				break;
			case "backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && vo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				$s(t, !0, n, null, a);
				break;
			case "together":
				$s(t, !1, null, null, void 0);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function tc(e, t) {
		!(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
	}
	function nc(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Yc |= t.lanes, (n & t.childLanes) === 0) return null;
		if (e !== null && t.child !== e.child) throw Error(a(153));
		if (t.child !== null) {
			for (e = t.child, n = Yl(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Yl(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function rc(e, t, n) {
		switch (t.tag) {
			case 3:
				Ws(t), ja();
				break;
			case 5:
				go(t);
				break;
			case 1:
				Xi(t.type) && ea(t);
				break;
			case 4:
				mo(t, t.stateNode.containerInfo);
				break;
			case 10:
				var r = t.type._context, i = t.memoizedProps.value;
				G(Ba, r._currentValue), r._currentValue = i;
				break;
			case 13:
				if (r = t.memoizedState, r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (G(q, q.current & 1), e = nc(e, t, n), e === null ? null : e.sibling) : Js(e, t, n) : (G(q, q.current & 1), t.flags |= 128, null);
				G(q, q.current & 1);
				break;
			case 19:
				if (r = (n & t.childLanes) !== 0, e.flags & 128) {
					if (r) return ec(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), G(q, q.current), r) break;
				return null;
			case 22:
			case 23: return t.lanes = 0, zs(e, t, n);
		}
		return nc(e, t, n);
	}
	var ic = function(e, t) {
		for (var n = t.child; n !== null;) {
			if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
			else if (n.tag !== 4 && n.child !== null) {
				n.child.return = n, n = n.child;
				continue;
			}
			if (n === t) break;
			for (; n.sibling === null;) {
				if (n.return === null || n.return === t) return;
				n = n.return;
			}
			n.sibling.return = n.return, n = n.sibling;
		}
	}, ac = function(e, t, n, r) {
		var i = e.memoizedProps;
		if (i !== r) {
			e = t.stateNode, po(lo.current);
			var a = null;
			switch (n) {
				case "input":
					i = me(e, i), r = me(e, r), a = [];
					break;
				case "select":
					i = N({}, i, { value: void 0 }), r = N({}, r, { value: void 0 }), a = [];
					break;
				case "textarea":
					i = xe(e, i), r = xe(e, r), a = [];
					break;
				default: typeof i.onClick != "function" && typeof r.onClick == "function" && (e.onclick = yi);
			}
			B(n, r);
			var o;
			for (u in n = null, i) if (!r.hasOwnProperty(u) && i.hasOwnProperty(u) && i[u] != null) {
				if (u === "style") {
					var c = i[u];
					for (o in c) c.hasOwnProperty(o) && (n ||= {}, n[o] = "");
				} else u !== "dangerouslySetInnerHTML" && u !== "children" && u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && u !== "autoFocus" && (s.hasOwnProperty(u) ? a ||= [] : (a ||= []).push(u, null));
			}
			for (u in r) {
				var l = r[u];
				if (c = i?.[u], r.hasOwnProperty(u) && l !== c && (l != null || c != null)) {
					if (u === "style") {
						if (c) {
							for (o in c) !c.hasOwnProperty(o) || l && l.hasOwnProperty(o) || (n ||= {}, n[o] = "");
							for (o in l) l.hasOwnProperty(o) && c[o] !== l[o] && (n ||= {}, n[o] = l[o]);
						} else n || (a ||= [], a.push(u, n)), n = l;
					} else u === "dangerouslySetInnerHTML" ? (l = l ? l.__html : void 0, c = c ? c.__html : void 0, l != null && c !== l && (a ||= []).push(u, l)) : u === "children" ? typeof l != "string" && typeof l != "number" || (a ||= []).push(u, "" + l) : u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && (s.hasOwnProperty(u) ? (l != null && u === "onScroll" && U("scroll", e), a || c === l || (a = [])) : (a ||= []).push(u, l));
				}
			}
			n && (a ||= []).push("style", n);
			var u = a;
			(t.updateQueue = u) && (t.flags |= 4);
		}
	}, oc = function(e, t, n, r) {
		n !== r && (t.flags |= 4);
	};
	function sc(e, t) {
		if (!K) switch (e.tailMode) {
			case "hidden":
				t = e.tail;
				for (var n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
				break;
			case "collapsed":
				n = e.tail;
				for (var r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
		}
	}
	function cc(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 14680064, r |= i.flags & 14680064, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function lc(e, t, n) {
		var r = t.pendingProps;
		switch (ba(t), t.tag) {
			case 2:
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return cc(t), null;
			case 1: return Xi(t.type) && Zi(), cc(t), null;
			case 3: return r = t.stateNode, ho(), W(qi), W(Ki), bo(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (ka(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ca !== null && (yl(Ca), Ca = null))), cc(t), null;
			case 5:
				_o(t);
				var i = po(fo.current);
				if (n = t.type, e !== null && t.stateNode != null) ac(e, t, n, r, i), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(a(166));
						return cc(t), null;
					}
					if (e = po(lo.current), ka(t)) {
						r = t.stateNode, n = t.type;
						var o = t.memoizedProps;
						switch (r[Mi] = t, r[Ni] = o, e = !!(t.mode & 1), n) {
							case "dialog":
								U("cancel", r), U("close", r);
								break;
							case "iframe":
							case "object":
							case "embed":
								U("load", r);
								break;
							case "video":
							case "audio":
								for (i = 0; i < ni.length; i++) U(ni[i], r);
								break;
							case "source":
								U("error", r);
								break;
							case "img":
							case "image":
							case "link":
								U("error", r), U("load", r);
								break;
							case "details":
								U("toggle", r);
								break;
							case "input":
								he(r, o), U("invalid", r);
								break;
							case "select":
								r._wrapperState = { wasMultiple: !!o.multiple }, U("invalid", r);
								break;
							case "textarea": Se(r, o), U("invalid", r);
						}
						for (var c in B(n, o), i = null, o) if (o.hasOwnProperty(c)) {
							var l = o[c];
							c === "children" ? typeof l == "string" ? r.textContent !== l && (!0 !== o.suppressHydrationWarning && vi(r.textContent, l, e), i = ["children", l]) : typeof l == "number" && r.textContent !== "" + l && (!0 !== o.suppressHydrationWarning && vi(r.textContent, l, e), i = ["children", "" + l]) : s.hasOwnProperty(c) && l != null && c === "onScroll" && U("scroll", r);
						}
						switch (n) {
							case "input":
								fe(r), _e(r, o, !0);
								break;
							case "textarea":
								fe(r), we(r);
								break;
							case "select":
							case "option": break;
							default: typeof o.onClick == "function" && (r.onclick = yi);
						}
						r = i, t.updateQueue = r, r !== null && (t.flags |= 4);
					} else {
						c = i.nodeType === 9 ? i : i.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Te(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = c.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = c.createElement(n, { is: r.is }) : (e = c.createElement(n), n === "select" && (c = e, r.multiple ? c.multiple = !0 : r.size && (c.size = r.size))) : e = c.createElementNS(e, n), e[Mi] = t, e[Ni] = r, ic(e, t, !1, !1), t.stateNode = e;
						a: {
							switch (c = Fe(n, r), n) {
								case "dialog":
									U("cancel", e), U("close", e), i = r;
									break;
								case "iframe":
								case "object":
								case "embed":
									U("load", e), i = r;
									break;
								case "video":
								case "audio":
									for (i = 0; i < ni.length; i++) U(ni[i], e);
									i = r;
									break;
								case "source":
									U("error", e), i = r;
									break;
								case "img":
								case "image":
								case "link":
									U("error", e), U("load", e), i = r;
									break;
								case "details":
									U("toggle", e), i = r;
									break;
								case "input":
									he(e, r), i = me(e, r), U("invalid", e);
									break;
								case "option":
									i = r;
									break;
								case "select":
									e._wrapperState = { wasMultiple: !!r.multiple }, i = N({}, r, { value: void 0 }), U("invalid", e);
									break;
								case "textarea":
									Se(e, r), i = xe(e, r), U("invalid", e);
									break;
								default: i = r;
							}
							for (o in B(n, i), l = i, l) if (l.hasOwnProperty(o)) {
								var u = l[o];
								o === "style" ? Ne(e, u) : o === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Oe(e, u)) : o === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && ke(e, u) : typeof u == "number" && ke(e, "" + u) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (s.hasOwnProperty(o) ? u != null && o === "onScroll" && U("scroll", e) : u != null && S(e, o, u, c));
							}
							switch (n) {
								case "input":
									fe(e), _e(e, r, !1);
									break;
								case "textarea":
									fe(e), we(e);
									break;
								case "option":
									r.value != null && e.setAttribute("value", "" + I(r.value));
									break;
								case "select":
									e.multiple = !!r.multiple, o = r.value, o == null ? r.defaultValue != null && be(e, !!r.multiple, r.defaultValue, !0) : be(e, !!r.multiple, o, !1);
									break;
								default: typeof i.onClick == "function" && (e.onclick = yi);
							}
							switch (n) {
								case "button":
								case "input":
								case "select":
								case "textarea":
									r = !!r.autoFocus;
									break a;
								case "img":
									r = !0;
									break a;
								default: r = !1;
							}
						}
						r && (t.flags |= 4);
					}
					t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
				}
				return cc(t), null;
			case 6:
				if (e && t.stateNode != null) oc(e, t, e.memoizedProps, r);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(a(166));
					if (n = po(fo.current), po(lo.current), ka(t)) {
						if (r = t.stateNode, n = t.memoizedProps, r[Mi] = t, (o = r.nodeValue !== n) && (e = xa, e !== null)) switch (e.tag) {
							case 3:
								vi(r.nodeValue, n, !!(e.mode & 1));
								break;
							case 5: !0 !== e.memoizedProps.suppressHydrationWarning && vi(r.nodeValue, n, !!(e.mode & 1));
						}
						o && (t.flags |= 4);
					} else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Mi] = t, t.stateNode = r;
				}
				return cc(t), null;
			case 13:
				if (W(q), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (K && Sa !== null && t.mode & 1 && !(t.flags & 128)) Aa(), ja(), t.flags |= 98560, o = !1;
					else if (o = ka(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!o) throw Error(a(318));
							if (o = t.memoizedState, o = o === null ? null : o.dehydrated, !o) throw Error(a(317));
							o[Mi] = t;
						} else ja(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						cc(t), o = !1;
					} else Ca !== null && (yl(Ca), Ca = null), o = !0;
					if (!o) return t.flags & 65536 ? t : null;
				}
				return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || q.current & 1 ? qc === 0 && (qc = 3) : kl())), t.updateQueue !== null && (t.flags |= 4), cc(t), null);
			case 4: return ho(), e === null && ci(t.stateNode.containerInfo), cc(t), null;
			case 10: return Ga(t.type._context), cc(t), null;
			case 17: return Xi(t.type) && Zi(), cc(t), null;
			case 19:
				if (W(q), o = t.memoizedState, o === null) return cc(t), null;
				if (r = !!(t.flags & 128), c = o.rendering, c === null) {
					if (r) sc(o, !1);
					else {
						if (qc !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (c = vo(e), c !== null) {
								for (t.flags |= 128, sc(o, !1), r = c.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null;) o = n, e = r, o.flags &= 14680066, c = o.alternate, c === null ? (o.childLanes = 0, o.lanes = e, o.child = null, o.subtreeFlags = 0, o.memoizedProps = null, o.memoizedState = null, o.updateQueue = null, o.dependencies = null, o.stateNode = null) : (o.childLanes = c.childLanes, o.lanes = c.lanes, o.child = c.child, o.subtreeFlags = 0, o.deletions = null, o.memoizedProps = c.memoizedProps, o.memoizedState = c.memoizedState, o.updateQueue = c.updateQueue, o.type = c.type, e = c.dependencies, o.dependencies = e === null ? null : {
									lanes: e.lanes,
									firstContext: e.firstContext
								}), n = n.sibling;
								return G(q, q.current & 1 | 2), t.child;
							}
							e = e.sibling;
						}
						o.tail !== null && V() > tl && (t.flags |= 128, r = !0, sc(o, !1), t.lanes = 4194304);
					}
				} else {
					if (!r) {
						if (e = vo(c), e !== null) {
							if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), sc(o, !0), o.tail === null && o.tailMode === "hidden" && !c.alternate && !K) return cc(t), null;
						} else 2 * V() - o.renderingStartTime > tl && n !== 1073741824 && (t.flags |= 128, r = !0, sc(o, !1), t.lanes = 4194304);
					}
					o.isBackwards ? (c.sibling = t.child, t.child = c) : (n = o.last, n === null ? t.child = c : n.sibling = c, o.last = c);
				}
				return o.tail === null ? (cc(t), null) : (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = V(), t.sibling = null, n = q.current, G(q, r ? n & 1 | 2 : n & 1), t);
			case 22:
			case 23: return Tl(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Gc & 1073741824 && (cc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : cc(t), null;
			case 24: return null;
			case 25: return null;
		}
		throw Error(a(156, t.tag));
	}
	function uc(e, t) {
		switch (ba(t), t.tag) {
			case 1: return Xi(t.type) && Zi(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return ho(), W(qi), W(Ki), bo(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 5: return _o(t), null;
			case 13:
				if (W(q), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(a(340));
					ja();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return W(q), null;
			case 4: return ho(), null;
			case 10: return Ga(t.type._context), null;
			case 22:
			case 23: return Tl(), null;
			case 24: return null;
			default: return null;
		}
	}
	var dc = !1, fc = !1, pc = typeof WeakSet == "function" ? WeakSet : Set, X = null;
	function mc(e, t) {
		var n = e.ref;
		if (n !== null) {
			if (typeof n == "function") try {
				n(null);
			} catch (n) {
				$(e, t, n);
			}
			else n.current = null;
		}
	}
	function hc(e, t, n) {
		try {
			n();
		} catch (n) {
			$(e, t, n);
		}
	}
	var gc = !1;
	function _c(e, t) {
		if (bi = fn, e = Nr(), Pr(e)) {
			if ("selectionStart" in e) var n = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				n = (n = e.ownerDocument) && n.defaultView || window;
				var r = n.getSelection && n.getSelection();
				if (r && r.rangeCount !== 0) {
					n = r.anchorNode;
					var i = r.anchorOffset, o = r.focusNode;
					r = r.focusOffset;
					try {
						n.nodeType, o.nodeType;
					} catch {
						n = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== n || i !== 0 && f.nodeType !== 3 || (c = s + i), f !== o || r !== 0 && f.nodeType !== 3 || (l = s + r), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === n && ++u === i && (c = s), p === o && ++d === r && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					n = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else n = null;
			}
			n ||= {
				start: 0,
				end: 0
			};
		} else n = null;
		for (xi = {
			focusedElem: e,
			selectionRange: n
		}, fn = !1, X = t; X !== null;) if (t = X, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, X = e;
		else for (; X !== null;) {
			t = X;
			try {
				var h = t.alternate;
				if (t.flags & 1024) switch (t.tag) {
					case 0:
					case 11:
					case 15: break;
					case 1:
						if (h !== null) {
							var g = h.memoizedProps, _ = h.memoizedState, v = t.stateNode;
							v.__reactInternalSnapshotBeforeUpdate = v.getSnapshotBeforeUpdate(t.elementType === t.type ? g : _s(t.type, g), _);
						}
						break;
					case 3:
						var y = t.stateNode.containerInfo;
						y.nodeType === 1 ? y.textContent = "" : y.nodeType === 9 && y.documentElement && y.removeChild(y.documentElement);
						break;
					case 5:
					case 6:
					case 4:
					case 17: break;
					default: throw Error(a(163));
				}
			} catch (e) {
				$(t, t.return, e);
			}
			if (e = t.sibling, e !== null) {
				e.return = t.return, X = e;
				break;
			}
			X = t.return;
		}
		return h = gc, gc = !1, h;
	}
	function vc(e, t, n) {
		var r = t.updateQueue;
		if (r = r === null ? null : r.lastEffect, r !== null) {
			var i = r = r.next;
			do {
				if ((i.tag & e) === e) {
					var a = i.destroy;
					i.destroy = void 0, a !== void 0 && hc(t, n, a);
				}
				i = i.next;
			} while (i !== r);
		}
	}
	function yc(e, t) {
		if (t = t.updateQueue, t = t === null ? null : t.lastEffect, t !== null) {
			var n = t = t.next;
			do {
				if ((n.tag & e) === e) {
					var r = n.create;
					n.destroy = r();
				}
				n = n.next;
			} while (n !== t);
		}
	}
	function bc(e) {
		var t = e.ref;
		if (t !== null) {
			var n = e.stateNode;
			switch (e.tag) {
				case 5:
					e = n;
					break;
				default: e = n;
			}
			typeof t == "function" ? t(e) : t.current = e;
		}
	}
	function xc(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, xc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Mi], delete t[Ni], delete t[Fi], delete t[Ii], delete t[Li])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	function Sc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 4;
	}
	function Cc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Sc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function wc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = yi));
		else if (r !== 4 && (e = e.child, e !== null)) for (wc(e, t, n), e = e.sibling; e !== null;) wc(e, t, n), e = e.sibling;
	}
	function Tc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (e = e.child, e !== null)) for (Tc(e, t, n), e = e.sibling; e !== null;) Tc(e, t, n), e = e.sibling;
	}
	var Ec = null, Dc = !1;
	function Oc(e, t, n) {
		for (n = n.child; n !== null;) kc(e, t, n), n = n.sibling;
	}
	function kc(e, t, n) {
		if (St && typeof St.onCommitFiberUnmount == "function") try {
			St.onCommitFiberUnmount(xt, n);
		} catch {}
		switch (n.tag) {
			case 5: fc || mc(n, t);
			case 6:
				var r = Ec, i = Dc;
				Ec = null, Oc(e, t, n), Ec = r, Dc = i, Ec !== null && (Dc ? (e = Ec, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : Ec.removeChild(n.stateNode));
				break;
			case 18:
				Ec !== null && (Dc ? (e = Ec, n = n.stateNode, e.nodeType === 8 ? Oi(e.parentNode, n) : e.nodeType === 1 && Oi(e, n), un(e)) : Oi(Ec, n.stateNode));
				break;
			case 4:
				r = Ec, i = Dc, Ec = n.stateNode.containerInfo, Dc = !0, Oc(e, t, n), Ec = r, Dc = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				if (!fc && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
					i = r = r.next;
					do {
						var a = i, o = a.destroy;
						a = a.tag, o !== void 0 && (a & 2 || a & 4) && hc(n, t, o), i = i.next;
					} while (i !== r);
				}
				Oc(e, t, n);
				break;
			case 1:
				if (!fc && (mc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
					r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
				} catch (e) {
					$(n, t, e);
				}
				Oc(e, t, n);
				break;
			case 21:
				Oc(e, t, n);
				break;
			case 22:
				n.mode & 1 ? (fc = (r = fc) || n.memoizedState !== null, Oc(e, t, n), fc = r) : Oc(e, t, n);
				break;
			default: Oc(e, t, n);
		}
	}
	function Ac(e) {
		var t = e.updateQueue;
		if (t !== null) {
			e.updateQueue = null;
			var n = e.stateNode;
			n === null && (n = e.stateNode = new pc()), t.forEach(function(t) {
				var r = Hl.bind(null, e, t);
				n.has(t) || (n.add(t), t.then(r, r));
			});
		}
	}
	function jc(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			try {
				var o = e, s = t, c = s;
				a: for (; c !== null;) {
					switch (c.tag) {
						case 5:
							Ec = c.stateNode, Dc = !1;
							break a;
						case 3:
							Ec = c.stateNode.containerInfo, Dc = !0;
							break a;
						case 4:
							Ec = c.stateNode.containerInfo, Dc = !0;
							break a;
					}
					c = c.return;
				}
				if (Ec === null) throw Error(a(160));
				kc(o, s, i), Ec = null, Dc = !1;
				var l = i.alternate;
				l !== null && (l.return = null), i.return = null;
			} catch (e) {
				$(i, t, e);
			}
		}
		if (t.subtreeFlags & 12854) for (t = t.child; t !== null;) Mc(t, e), t = t.sibling;
	}
	function Mc(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (jc(t, e), Nc(e), r & 4) {
					try {
						vc(3, e, e.return), yc(3, e);
					} catch (t) {
						$(e, e.return, t);
					}
					try {
						vc(5, e, e.return);
					} catch (t) {
						$(e, e.return, t);
					}
				}
				break;
			case 1:
				jc(t, e), Nc(e), r & 512 && n !== null && mc(n, n.return);
				break;
			case 5:
				if (jc(t, e), Nc(e), r & 512 && n !== null && mc(n, n.return), e.flags & 32) {
					var i = e.stateNode;
					try {
						ke(i, "");
					} catch (t) {
						$(e, e.return, t);
					}
				}
				if (r & 4 && (i = e.stateNode, i != null)) {
					var o = e.memoizedProps, s = n === null ? o : n.memoizedProps, c = e.type, l = e.updateQueue;
					if (e.updateQueue = null, l !== null) try {
						c === "input" && o.type === "radio" && o.name != null && z(i, o), Fe(c, s);
						var u = Fe(c, o);
						for (s = 0; s < l.length; s += 2) {
							var d = l[s], f = l[s + 1];
							d === "style" ? Ne(i, f) : d === "dangerouslySetInnerHTML" ? Oe(i, f) : d === "children" ? ke(i, f) : S(i, d, f, u);
						}
						switch (c) {
							case "input":
								ge(i, o);
								break;
							case "textarea":
								Ce(i, o);
								break;
							case "select":
								var p = i._wrapperState.wasMultiple;
								i._wrapperState.wasMultiple = !!o.multiple;
								var m = o.value;
								m == null ? p !== !!o.multiple && (o.defaultValue == null ? be(i, !!o.multiple, o.multiple ? [] : "", !1) : be(i, !!o.multiple, o.defaultValue, !0)) : be(i, !!o.multiple, m, !1);
						}
						i[Ni] = o;
					} catch (t) {
						$(e, e.return, t);
					}
				}
				break;
			case 6:
				if (jc(t, e), Nc(e), r & 4) {
					if (e.stateNode === null) throw Error(a(162));
					i = e.stateNode, o = e.memoizedProps;
					try {
						i.nodeValue = o;
					} catch (t) {
						$(e, e.return, t);
					}
				}
				break;
			case 3:
				if (jc(t, e), Nc(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					un(t.containerInfo);
				} catch (t) {
					$(e, e.return, t);
				}
				break;
			case 4:
				jc(t, e), Nc(e);
				break;
			case 13:
				jc(t, e), Nc(e), i = e.child, i.flags & 8192 && (o = i.memoizedState !== null, i.stateNode.isHidden = o, !o || i.alternate !== null && i.alternate.memoizedState !== null || (el = V())), r & 4 && Ac(e);
				break;
			case 22:
				if (d = n !== null && n.memoizedState !== null, e.mode & 1 ? (fc = (u = fc) || d, jc(t, e), fc = u) : jc(t, e), Nc(e), r & 8192) {
					if (u = e.memoizedState !== null, (e.stateNode.isHidden = u) && !d && e.mode & 1) for (X = e, d = e.child; d !== null;) {
						for (f = X = d; X !== null;) {
							switch (p = X, m = p.child, p.tag) {
								case 0:
								case 11:
								case 14:
								case 15:
									vc(4, p, p.return);
									break;
								case 1:
									mc(p, p.return);
									var h = p.stateNode;
									if (typeof h.componentWillUnmount == "function") {
										r = p, n = p.return;
										try {
											t = r, h.props = t.memoizedProps, h.state = t.memoizedState, h.componentWillUnmount();
										} catch (e) {
											$(r, n, e);
										}
									}
									break;
								case 5:
									mc(p, p.return);
									break;
								case 22: if (p.memoizedState !== null) {
									Lc(f);
									continue;
								}
							}
							m === null ? Lc(f) : (m.return = p, X = m);
						}
						d = d.sibling;
					}
					a: for (d = null, f = e;;) {
						if (f.tag === 5) {
							if (d === null) {
								d = f;
								try {
									i = f.stateNode, u ? (o = i.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (c = f.stateNode, l = f.memoizedProps.style, s = l != null && l.hasOwnProperty("display") ? l.display : null, c.style.display = Me("display", s));
								} catch (t) {
									$(e, e.return, t);
								}
							}
						} else if (f.tag === 6) {
							if (d === null) try {
								f.stateNode.nodeValue = u ? "" : f.memoizedProps;
							} catch (t) {
								$(e, e.return, t);
							}
						} else if ((f.tag !== 22 && f.tag !== 23 || f.memoizedState === null || f === e) && f.child !== null) {
							f.child.return = f, f = f.child;
							continue;
						}
						if (f === e) break a;
						for (; f.sibling === null;) {
							if (f.return === null || f.return === e) break a;
							d === f && (d = null), f = f.return;
						}
						d === f && (d = null), f.sibling.return = f.return, f = f.sibling;
					}
				}
				break;
			case 19:
				jc(t, e), Nc(e), r & 4 && Ac(e);
				break;
			case 21: break;
			default: jc(t, e), Nc(e);
		}
	}
	function Nc(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				a: {
					for (var n = e.return; n !== null;) {
						if (Sc(n)) {
							var r = n;
							break a;
						}
						n = n.return;
					}
					throw Error(a(160));
				}
				switch (r.tag) {
					case 5:
						var i = r.stateNode;
						r.flags & 32 && (ke(i, ""), r.flags &= -33), Tc(e, Cc(e), i);
						break;
					case 3:
					case 4:
						var o = r.stateNode.containerInfo;
						wc(e, Cc(e), o);
						break;
					default: throw Error(a(161));
				}
			} catch (t) {
				$(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function Pc(e, t, n) {
		X = e, Fc(e, t, n);
	}
	function Fc(e, t, n) {
		for (var r = !!(e.mode & 1); X !== null;) {
			var i = X, a = i.child;
			if (i.tag === 22 && r) {
				var o = i.memoizedState !== null || dc;
				if (!o) {
					var s = i.alternate, c = s !== null && s.memoizedState !== null || fc;
					s = dc;
					var l = fc;
					if (dc = o, (fc = c) && !l) for (X = i; X !== null;) o = X, c = o.child, o.tag === 22 && o.memoizedState !== null || c === null ? Rc(i) : (c.return = o, X = c);
					for (; a !== null;) X = a, Fc(a, t, n), a = a.sibling;
					X = i, dc = s, fc = l;
				}
				Ic(e, t, n);
			} else i.subtreeFlags & 8772 && a !== null ? (a.return = i, X = a) : Ic(e, t, n);
		}
	}
	function Ic(e) {
		for (; X !== null;) {
			var t = X;
			if (t.flags & 8772) {
				var n = t.alternate;
				try {
					if (t.flags & 8772) switch (t.tag) {
						case 0:
						case 11:
						case 15:
							fc || yc(5, t);
							break;
						case 1:
							var r = t.stateNode;
							if (t.flags & 4 && !fc) {
								if (n === null) r.componentDidMount();
								else {
									var i = t.elementType === t.type ? n.memoizedProps : _s(t.type, n.memoizedProps);
									r.componentDidUpdate(i, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
								}
							}
							var o = t.updateQueue;
							o !== null && so(t, o, r);
							break;
						case 3:
							var s = t.updateQueue;
							if (s !== null) {
								if (n = null, t.child !== null) switch (t.child.tag) {
									case 5:
										n = t.child.stateNode;
										break;
									case 1: n = t.child.stateNode;
								}
								so(t, s, n);
							}
							break;
						case 5:
							var c = t.stateNode;
							if (n === null && t.flags & 4) {
								n = c;
								var l = t.memoizedProps;
								switch (t.type) {
									case "button":
									case "input":
									case "select":
									case "textarea":
										l.autoFocus && n.focus();
										break;
									case "img": l.src && (n.src = l.src);
								}
							}
							break;
						case 6: break;
						case 4: break;
						case 12: break;
						case 13:
							if (t.memoizedState === null) {
								var u = t.alternate;
								if (u !== null) {
									var d = u.memoizedState;
									if (d !== null) {
										var f = d.dehydrated;
										f !== null && un(f);
									}
								}
							}
							break;
						case 19:
						case 17:
						case 21:
						case 22:
						case 23:
						case 25: break;
						default: throw Error(a(163));
					}
					fc || t.flags & 512 && bc(t);
				} catch (e) {
					$(t, t.return, e);
				}
			}
			if (t === e) {
				X = null;
				break;
			}
			if (n = t.sibling, n !== null) {
				n.return = t.return, X = n;
				break;
			}
			X = t.return;
		}
	}
	function Lc(e) {
		for (; X !== null;) {
			var t = X;
			if (t === e) {
				X = null;
				break;
			}
			var n = t.sibling;
			if (n !== null) {
				n.return = t.return, X = n;
				break;
			}
			X = t.return;
		}
	}
	function Rc(e) {
		for (; X !== null;) {
			var t = X;
			try {
				switch (t.tag) {
					case 0:
					case 11:
					case 15:
						var n = t.return;
						try {
							yc(4, t);
						} catch (e) {
							$(t, n, e);
						}
						break;
					case 1:
						var r = t.stateNode;
						if (typeof r.componentDidMount == "function") {
							var i = t.return;
							try {
								r.componentDidMount();
							} catch (e) {
								$(t, i, e);
							}
						}
						var a = t.return;
						try {
							bc(t);
						} catch (e) {
							$(t, a, e);
						}
						break;
					case 5:
						var o = t.return;
						try {
							bc(t);
						} catch (e) {
							$(t, o, e);
						}
				}
			} catch (e) {
				$(t, t.return, e);
			}
			if (t === e) {
				X = null;
				break;
			}
			var s = t.sibling;
			if (s !== null) {
				s.return = t.return, X = s;
				break;
			}
			X = t.return;
		}
	}
	var zc = Math.ceil, Bc = C.ReactCurrentDispatcher, Vc = C.ReactCurrentOwner, Hc = C.ReactCurrentBatchConfig, Z = 0, Uc = null, Q = null, Wc = 0, Gc = 0, Kc = Wi(0), qc = 0, Jc = null, Yc = 0, Xc = 0, Zc = 0, Qc = null, $c = null, el = 0, tl = Infinity, nl = null, rl = !1, il = null, al = null, ol = !1, sl = null, cl = 0, ll = 0, ul = null, dl = -1, fl = 0;
	function pl() {
		return Z & 6 ? V() : dl === -1 ? dl = V() : dl;
	}
	function ml(e) {
		return e.mode & 1 ? Z & 2 && Wc !== 0 ? Wc & -Wc : Na.transition === null ? (e = H, e === 0 ? (e = window.event, e = e === void 0 ? 16 : vn(e.type), e) : e) : (fl === 0 && (fl = Ft()), fl) : 1;
	}
	function hl(e, t, n, r) {
		if (50 < ll) throw ll = 0, ul = null, Error(a(185));
		Lt(e, n, r), (!(Z & 2) || e !== Uc) && (e === Uc && (!(Z & 2) && (Xc |= n), qc === 4 && xl(e, Wc)), gl(e, r), n === 1 && Z === 0 && !(t.mode & 1) && (tl = V() + 500, ra && sa()));
	}
	function gl(e, t) {
		var n = e.callbackNode;
		Nt(e, t);
		var r = jt(e, e === Uc ? Wc : 0);
		if (r === 0) n !== null && ft(n), e.callbackNode = null, e.callbackPriority = 0;
		else if (t = r & -r, e.callbackPriority !== t) {
			if (n != null && ft(n), t === 1) e.tag === 0 ? oa(Sl.bind(null, e)) : aa(Sl.bind(null, e)), Ei(function() {
				!(Z & 6) && sa();
			}), n = null;
			else {
				switch (Bt(r)) {
					case 1:
						n = gt;
						break;
					case 4:
						n = _t;
						break;
					case 16:
						n = vt;
						break;
					case 536870912:
						n = bt;
						break;
					default: n = vt;
				}
				n = Wl(n, _l.bind(null, e));
			}
			e.callbackPriority = t, e.callbackNode = n;
		}
	}
	function _l(e, t) {
		if (dl = -1, fl = 0, Z & 6) throw Error(a(327));
		var n = e.callbackNode;
		if (Ll() && e.callbackNode !== n) return null;
		var r = jt(e, e === Uc ? Wc : 0);
		if (r === 0) return null;
		if (r & 30 || (r & e.expiredLanes) !== 0 || t) t = Al(e, r);
		else {
			t = r;
			var i = Z;
			Z |= 2;
			var o = Ol();
			(Uc !== e || Wc !== t) && (nl = null, tl = V() + 500, El(e, t));
			do
				try {
					Ml();
					break;
				} catch (t) {
					Dl(e, t);
				}
			while (1);
			Wa(), Bc.current = o, Z = i, Q === null ? (Uc = null, Wc = 0, t = qc) : t = 0;
		}
		if (t !== 0) {
			if (t === 2 && (i = Pt(e), i !== 0 && (r = i, t = vl(e, i))), t === 1) throw n = Jc, El(e, 0), xl(e, r), gl(e, V()), n;
			if (t === 6) xl(e, r);
			else {
				if (i = e.current.alternate, !(r & 30) && !bl(i) && (t = Al(e, r), t === 2 && (o = Pt(e), o !== 0 && (r = o, t = vl(e, o))), t === 1)) throw n = Jc, El(e, 0), xl(e, r), gl(e, V()), n;
				switch (e.finishedWork = i, e.finishedLanes = r, t) {
					case 0:
					case 1: throw Error(a(345));
					case 2:
						Fl(e, $c, nl);
						break;
					case 3:
						if (xl(e, r), (r & 130023424) === r && (t = el + 500 - V(), 10 < t)) {
							if (jt(e, 0) !== 0) break;
							if (i = e.suspendedLanes, (i & r) !== r) {
								pl(), e.pingedLanes |= e.suspendedLanes & i;
								break;
							}
							e.timeoutHandle = Ci(Fl.bind(null, e, $c, nl), t);
							break;
						}
						Fl(e, $c, nl);
						break;
					case 4:
						if (xl(e, r), (r & 4194240) === r) break;
						for (t = e.eventTimes, i = -1; 0 < r;) {
							var s = 31 - wt(r);
							o = 1 << s, s = t[s], s > i && (i = s), r &= ~o;
						}
						if (r = i, r = V() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * zc(r / 1960)) - r, 10 < r) {
							e.timeoutHandle = Ci(Fl.bind(null, e, $c, nl), r);
							break;
						}
						Fl(e, $c, nl);
						break;
					case 5:
						Fl(e, $c, nl);
						break;
					default: throw Error(a(329));
				}
			}
		}
		return gl(e, V()), e.callbackNode === n ? _l.bind(null, e) : null;
	}
	function vl(e, t) {
		var n = Qc;
		return e.current.memoizedState.isDehydrated && (El(e, t).flags |= 256), e = Al(e, t), e !== 2 && (t = $c, $c = n, t !== null && yl(t)), e;
	}
	function yl(e) {
		$c === null ? $c = e : $c.push.apply($c, e);
	}
	function bl(e) {
		for (var t = e;;) {
			if (t.flags & 16384) {
				var n = t.updateQueue;
				if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
					var i = n[r], a = i.getSnapshot;
					i = i.value;
					try {
						if (!Or(a(), i)) return !1;
					} catch {
						return !1;
					}
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function xl(e, t) {
		for (t &= ~Zc, t &= ~Xc, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t;) {
			var n = 31 - wt(t), r = 1 << n;
			e[n] = -1, t &= ~r;
		}
	}
	function Sl(e) {
		if (Z & 6) throw Error(a(327));
		Ll();
		var t = jt(e, 0);
		if (!(t & 1)) return gl(e, V()), null;
		var n = Al(e, t);
		if (e.tag !== 0 && n === 2) {
			var r = Pt(e);
			r !== 0 && (t = r, n = vl(e, r));
		}
		if (n === 1) throw n = Jc, El(e, 0), xl(e, t), gl(e, V()), n;
		if (n === 6) throw Error(a(345));
		return e.finishedWork = e.current.alternate, e.finishedLanes = t, Fl(e, $c, nl), gl(e, V()), null;
	}
	function Cl(e, t) {
		var n = Z;
		Z |= 1;
		try {
			return e(t);
		} finally {
			Z = n, Z === 0 && (tl = V() + 500, ra && sa());
		}
	}
	function wl(e) {
		sl !== null && sl.tag === 0 && !(Z & 6) && Ll();
		var t = Z;
		Z |= 1;
		var n = Hc.transition, r = H;
		try {
			if (Hc.transition = null, H = 1, e) return e();
		} finally {
			H = r, Hc.transition = n, Z = t, !(Z & 6) && sa();
		}
	}
	function Tl() {
		Gc = Kc.current, W(Kc);
	}
	function El(e, t) {
		e.finishedWork = null, e.finishedLanes = 0;
		var n = e.timeoutHandle;
		if (n !== -1 && (e.timeoutHandle = -1, wi(n)), Q !== null) for (n = Q.return; n !== null;) {
			var r = n;
			switch (ba(r), r.tag) {
				case 1:
					r = r.type.childContextTypes, r != null && Zi();
					break;
				case 3:
					ho(), W(qi), W(Ki), bo();
					break;
				case 5:
					_o(r);
					break;
				case 4:
					ho();
					break;
				case 13:
					W(q);
					break;
				case 19:
					W(q);
					break;
				case 10:
					Ga(r.type._context);
					break;
				case 22:
				case 23: Tl();
			}
			n = n.return;
		}
		if (Uc = e, Q = e = Yl(e.current, null), Wc = Gc = t, qc = 0, Jc = null, Zc = Xc = Yc = 0, $c = Qc = null, Ya !== null) {
			for (t = 0; t < Ya.length; t++) if (n = Ya[t], r = n.interleaved, r !== null) {
				n.interleaved = null;
				var i = r.next, a = n.pending;
				if (a !== null) {
					var o = a.next;
					a.next = i, r.next = o;
				}
				n.pending = r;
			}
			Ya = null;
		}
		return e;
	}
	function Dl(e, t) {
		do {
			var n = Q;
			try {
				if (Wa(), xo.current = ps, To) {
					for (var r = J.memoizedState; r !== null;) {
						var i = r.queue;
						i !== null && (i.pending = null), r = r.next;
					}
					To = !1;
				}
				if (Co = 0, wo = Y = J = null, Eo = !1, Do = 0, Vc.current = null, n === null || n.return === null) {
					qc = 1, Jc = t, Q = null;
					break;
				}
				a: {
					var o = e, s = n.return, c = n, l = t;
					if (t = Wc, c.flags |= 32768, typeof l == "object" && l && typeof l.then == "function") {
						var u = l, d = c, f = d.tag;
						if (!(d.mode & 1) && (f === 0 || f === 11 || f === 15)) {
							var p = d.alternate;
							p ? (d.updateQueue = p.updateQueue, d.memoizedState = p.memoizedState, d.lanes = p.lanes) : (d.updateQueue = null, d.memoizedState = null);
						}
						var m = js(s);
						if (m !== null) {
							m.flags &= -257, Ms(m, s, c, o, t), m.mode & 1 && As(o, u, t), t = m, l = u;
							var h = t.updateQueue;
							if (h === null) {
								var g = /* @__PURE__ */ new Set();
								g.add(l), t.updateQueue = g;
							} else h.add(l);
							break a;
						}
						if (!(t & 1)) {
							As(o, u, t), kl();
							break a;
						}
						l = Error(a(426));
					} else if (K && c.mode & 1) {
						var _ = js(s);
						if (_ !== null) {
							!(_.flags & 65536) && (_.flags |= 256), Ms(_, s, c, o, t), Ma(ws(l, c));
							break a;
						}
					}
					o = l = ws(l, c), qc !== 4 && (qc = 2), Qc === null ? Qc = [o] : Qc.push(o), o = s;
					do {
						switch (o.tag) {
							case 3:
								o.flags |= 65536, t &= -t, o.lanes |= t;
								var v = Os(o, l, t);
								ao(o, v);
								break a;
							case 1:
								c = l;
								var y = o.type, b = o.stateNode;
								if (!(o.flags & 128) && (typeof y.getDerivedStateFromError == "function" || b !== null && typeof b.componentDidCatch == "function" && (al === null || !al.has(b)))) {
									o.flags |= 65536, t &= -t, o.lanes |= t;
									var x = ks(o, c, t);
									ao(o, x);
									break a;
								}
						}
						o = o.return;
					} while (o !== null);
				}
				Pl(n);
			} catch (e) {
				t = e, Q === n && n !== null && (Q = n = n.return);
				continue;
			}
			break;
		} while (1);
	}
	function Ol() {
		var e = Bc.current;
		return Bc.current = ps, e === null ? ps : e;
	}
	function kl() {
		(qc === 0 || qc === 3 || qc === 2) && (qc = 4), Uc === null || !(Yc & 268435455) && !(Xc & 268435455) || xl(Uc, Wc);
	}
	function Al(e, t) {
		var n = Z;
		Z |= 2;
		var r = Ol();
		(Uc !== e || Wc !== t) && (nl = null, El(e, t));
		do
			try {
				jl();
				break;
			} catch (t) {
				Dl(e, t);
			}
		while (1);
		if (Wa(), Z = n, Bc.current = r, Q !== null) throw Error(a(261));
		return Uc = null, Wc = 0, qc;
	}
	function jl() {
		for (; Q !== null;) Nl(Q);
	}
	function Ml() {
		for (; Q !== null && !pt();) Nl(Q);
	}
	function Nl(e) {
		var t = Ul(e.alternate, e, Gc);
		e.memoizedProps = e.pendingProps, t === null ? Pl(e) : Q = t, Vc.current = null;
	}
	function Pl(e) {
		var t = e;
		do {
			var n = t.alternate;
			if (e = t.return, t.flags & 32768) {
				if (n = uc(n, t), n !== null) {
					n.flags &= 32767, Q = n;
					return;
				}
				if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
				else {
					qc = 6, Q = null;
					return;
				}
			} else if (n = lc(n, t, Gc), n !== null) {
				Q = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				Q = t;
				return;
			}
			Q = t = e;
		} while (t !== null);
		qc === 0 && (qc = 5);
	}
	function Fl(e, t, n) {
		var r = H, i = Hc.transition;
		try {
			Hc.transition = null, H = 1, Il(e, t, n, r);
		} finally {
			Hc.transition = i, H = r;
		}
		return null;
	}
	function Il(e, t, n, r) {
		do
			Ll();
		while (sl !== null);
		if (Z & 6) throw Error(a(327));
		n = e.finishedWork;
		var i = e.finishedLanes;
		if (n === null) return null;
		if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(a(177));
		e.callbackNode = null, e.callbackPriority = 0;
		var o = n.lanes | n.childLanes;
		if (Rt(e, o), e === Uc && (Q = Uc = null, Wc = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || ol || (ol = !0, Wl(vt, function() {
			return Ll(), null;
		})), o = !!(n.flags & 15990), n.subtreeFlags & 15990 || o) {
			o = Hc.transition, Hc.transition = null;
			var s = H;
			H = 1;
			var c = Z;
			Z |= 4, Vc.current = null, _c(e, n), Mc(n, e), Fr(xi), fn = !!bi, xi = bi = null, e.current = n, Pc(n, e, i), mt(), Z = c, H = s, Hc.transition = o;
		} else e.current = n;
		if (ol && (ol = !1, sl = e, cl = i), o = e.pendingLanes, o === 0 && (al = null), Ct(n.stateNode, r), gl(e, V()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) i = t[n], r(i.value, {
			componentStack: i.stack,
			digest: i.digest
		});
		if (rl) throw rl = !1, e = il, il = null, e;
		return cl & 1 && e.tag !== 0 && Ll(), o = e.pendingLanes, o & 1 ? e === ul ? ll++ : (ll = 0, ul = e) : ll = 0, sa(), null;
	}
	function Ll() {
		if (sl !== null) {
			var e = Bt(cl), t = Hc.transition, n = H;
			try {
				if (Hc.transition = null, H = 16 > e ? 16 : e, sl === null) var r = !1;
				else {
					if (e = sl, sl = null, cl = 0, Z & 6) throw Error(a(331));
					var i = Z;
					for (Z |= 4, X = e.current; X !== null;) {
						var o = X, s = o.child;
						if (X.flags & 16) {
							var c = o.deletions;
							if (c !== null) {
								for (var l = 0; l < c.length; l++) {
									var u = c[l];
									for (X = u; X !== null;) {
										var d = X;
										switch (d.tag) {
											case 0:
											case 11:
											case 15: vc(8, d, o);
										}
										var f = d.child;
										if (f !== null) f.return = d, X = f;
										else for (; X !== null;) {
											d = X;
											var p = d.sibling, m = d.return;
											if (xc(d), d === u) {
												X = null;
												break;
											}
											if (p !== null) {
												p.return = m, X = p;
												break;
											}
											X = m;
										}
									}
								}
								var h = o.alternate;
								if (h !== null) {
									var g = h.child;
									if (g !== null) {
										h.child = null;
										do {
											var _ = g.sibling;
											g.sibling = null, g = _;
										} while (g !== null);
									}
								}
								X = o;
							}
						}
						if (o.subtreeFlags & 2064 && s !== null) s.return = o, X = s;
						else b: for (; X !== null;) {
							if (o = X, o.flags & 2048) switch (o.tag) {
								case 0:
								case 11:
								case 15: vc(9, o, o.return);
							}
							var v = o.sibling;
							if (v !== null) {
								v.return = o.return, X = v;
								break b;
							}
							X = o.return;
						}
					}
					var y = e.current;
					for (X = y; X !== null;) {
						s = X;
						var b = s.child;
						if (s.subtreeFlags & 2064 && b !== null) b.return = s, X = b;
						else b: for (s = y; X !== null;) {
							if (c = X, c.flags & 2048) try {
								switch (c.tag) {
									case 0:
									case 11:
									case 15: yc(9, c);
								}
							} catch (e) {
								$(c, c.return, e);
							}
							if (c === s) {
								X = null;
								break b;
							}
							var x = c.sibling;
							if (x !== null) {
								x.return = c.return, X = x;
								break b;
							}
							X = c.return;
						}
					}
					if (Z = i, sa(), St && typeof St.onPostCommitFiberRoot == "function") try {
						St.onPostCommitFiberRoot(xt, e);
					} catch {}
					r = !0;
				}
				return r;
			} finally {
				H = n, Hc.transition = t;
			}
		}
		return !1;
	}
	function Rl(e, t, n) {
		t = ws(n, t), t = Os(e, t, 1), e = ro(e, t, 1), t = pl(), e !== null && (Lt(e, 1, t), gl(e, t));
	}
	function $(e, t, n) {
		if (e.tag === 3) Rl(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Rl(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (al === null || !al.has(r))) {
					e = ws(n, e), e = ks(t, e, 1), t = ro(t, e, 1), e = pl(), t !== null && (Lt(t, 1, e), gl(t, e));
					break;
				}
			}
			t = t.return;
		}
	}
	function zl(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), t = pl(), e.pingedLanes |= e.suspendedLanes & n, Uc === e && (Wc & n) === n && (qc === 4 || qc === 3 && (Wc & 130023424) === Wc && 500 > V() - el ? El(e, 0) : Zc |= n), gl(e, t);
	}
	function Bl(e, t) {
		t === 0 && (e.mode & 1 ? (t = kt, kt <<= 1, !(kt & 130023424) && (kt = 4194304)) : t = 1);
		var n = pl();
		e = Qa(e, t), e !== null && (Lt(e, t, n), gl(e, n));
	}
	function Vl(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), Bl(e, n);
	}
	function Hl(e, t) {
		var n = 0;
		switch (e.tag) {
			case 13:
				var r = e.stateNode, i = e.memoizedState;
				i !== null && (n = i.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			default: throw Error(a(314));
		}
		r !== null && r.delete(t), Bl(e, n);
	}
	var Ul = function(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps || qi.current) Ps = !0;
			else {
				if ((e.lanes & n) === 0 && !(t.flags & 128)) return Ps = !1, rc(e, t, n);
				Ps = !!(e.flags & 131072);
			}
		} else Ps = !1, K && t.flags & 1048576 && va(t, da, t.index);
		switch (t.lanes = 0, t.tag) {
			case 2:
				var r = t.type;
				tc(e, t), e = t.pendingProps;
				var i = Yi(t, Ki.current);
				qa(t, n), i = jo(null, t, r, e, i, n);
				var o = Mo();
				return t.flags |= 1, typeof i == "object" && i && typeof i.render == "function" && i.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Xi(r) ? (o = !0, ea(t)) : o = !1, t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, eo(t), i.updater = ys, t.stateNode = i, i._reactInternals = t, Cs(t, r, e, n), t = Us(null, t, r, !0, o, n)) : (t.tag = 0, K && o && ya(t), Fs(null, t, i, n), t = t.child), t;
			case 16:
				r = t.elementType;
				a: {
					switch (tc(e, t), e = t.pendingProps, i = r._init, r = i(r._payload), t.type = r, i = t.tag = Jl(r), e = _s(r, e), i) {
						case 0:
							t = Vs(null, t, r, e, n);
							break a;
						case 1:
							t = Hs(null, t, r, e, n);
							break a;
						case 11:
							t = Is(null, t, r, e, n);
							break a;
						case 14:
							t = Ls(null, t, r, _s(r.type, e), n);
							break a;
					}
					throw Error(a(306, r, ""));
				}
				return t;
			case 0: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : _s(r, i), Vs(e, t, r, i, n);
			case 1: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : _s(r, i), Hs(e, t, r, i, n);
			case 3:
				a: {
					if (Ws(t), e === null) throw Error(a(387));
					r = t.pendingProps, o = t.memoizedState, i = o.element, to(e, t), oo(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache,
							pendingSuspenseBoundaries: s.pendingSuspenseBoundaries,
							transitions: s.transitions
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							i = ws(Error(a(423)), t), t = Gs(e, t, r, n, i);
							break a;
						}
						if (r !== i) {
							i = ws(Error(a(424)), t), t = Gs(e, t, r, n, i);
							break a;
						}
						for (Sa = ki(t.stateNode.containerInfo.firstChild), xa = t, K = !0, Ca = null, n = za(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					} else {
						if (ja(), r === i) {
							t = nc(e, t, n);
							break a;
						}
						Fs(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 5: return go(t), e === null && Da(t), r = t.type, i = t.pendingProps, o = e === null ? null : e.memoizedProps, s = i.children, Si(r, i) ? s = null : o !== null && Si(r, o) && (t.flags |= 32), Bs(e, t), Fs(e, t, s, n), t.child;
			case 6: return e === null && Da(t), null;
			case 13: return Js(e, t, n);
			case 4: return mo(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Ra(t, null, r, n) : Fs(e, t, r, n), t.child;
			case 11: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : _s(r, i), Is(e, t, r, i, n);
			case 7: return Fs(e, t, t.pendingProps, n), t.child;
			case 8: return Fs(e, t, t.pendingProps.children, n), t.child;
			case 12: return Fs(e, t, t.pendingProps.children, n), t.child;
			case 10:
				a: {
					if (r = t.type._context, i = t.pendingProps, o = t.memoizedProps, s = i.value, G(Ba, r._currentValue), r._currentValue = s, o !== null) {
						if (Or(o.value, s)) {
							if (o.children === i.children && !qi.current) {
								t = nc(e, t, n);
								break a;
							}
						} else for (o = t.child, o !== null && (o.return = t); o !== null;) {
							var c = o.dependencies;
							if (c !== null) {
								s = o.child;
								for (var l = c.firstContext; l !== null;) {
									if (l.context === r) {
										if (o.tag === 1) {
											l = no(-1, n & -n), l.tag = 2;
											var u = o.updateQueue;
											if (u !== null) {
												u = u.shared;
												var d = u.pending;
												d === null ? l.next = l : (l.next = d.next, d.next = l), u.pending = l;
											}
										}
										o.lanes |= n, l = o.alternate, l !== null && (l.lanes |= n), Ka(o.return, n, t), c.lanes |= n;
										break;
									}
									l = l.next;
								}
							} else if (o.tag === 10) s = o.type === t.type ? null : o.child;
							else if (o.tag === 18) {
								if (s = o.return, s === null) throw Error(a(341));
								s.lanes |= n, c = s.alternate, c !== null && (c.lanes |= n), Ka(s, n, t), s = o.sibling;
							} else s = o.child;
							if (s !== null) s.return = o;
							else for (s = o; s !== null;) {
								if (s === t) {
									s = null;
									break;
								}
								if (o = s.sibling, o !== null) {
									o.return = s.return, s = o;
									break;
								}
								s = s.return;
							}
							o = s;
						}
					}
					Fs(e, t, i.children, n), t = t.child;
				}
				return t;
			case 9: return i = t.type, r = t.pendingProps.children, qa(t, n), i = Ja(i), r = r(i), t.flags |= 1, Fs(e, t, r, n), t.child;
			case 14: return r = t.type, i = _s(r, t.pendingProps), i = _s(r.type, i), Ls(e, t, r, i, n);
			case 15: return Rs(e, t, t.type, t.pendingProps, n);
			case 17: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : _s(r, i), tc(e, t), t.tag = 1, Xi(r) ? (e = !0, ea(t)) : e = !1, qa(t, n), xs(t, r, i), Cs(t, r, i, n), Us(null, t, r, !0, e, n);
			case 19: return ec(e, t, n);
			case 22: return zs(e, t, n);
		}
		throw Error(a(156, t.tag));
	};
	function Wl(e, t) {
		return dt(e, t);
	}
	function Gl(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Kl(e, t, n, r) {
		return new Gl(e, t, n, r);
	}
	function ql(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Jl(e) {
		if (typeof e == "function") return +!!ql(e);
		if (e != null) {
			if (e = e.$$typeof, e === te) return 11;
			if (e === M) return 14;
		}
		return 2;
	}
	function Yl(e, t) {
		var n = e.alternate;
		return n === null ? (n = Kl(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
	}
	function Xl(e, t, n, r, i, o) {
		var s = 2;
		if (r = e, typeof e == "function") ql(e) && (s = 1);
		else if (typeof e == "string") s = 5;
		else a: switch (e) {
			case E: return Zl(n.children, i, o, t);
			case D:
				s = 8, i |= 8;
				break;
			case O: return e = Kl(12, n, t, i | 2), e.elementType = O, e.lanes = o, e;
			case A: return e = Kl(13, n, t, i), e.elementType = A, e.lanes = o, e;
			case j: return e = Kl(19, n, t, i), e.elementType = j, e.lanes = o, e;
			case re: return Ql(n, i, o, t);
			default:
				if (typeof e == "object" && e) switch (e.$$typeof) {
					case k:
						s = 10;
						break a;
					case ee:
						s = 9;
						break a;
					case te:
						s = 11;
						break a;
					case M:
						s = 14;
						break a;
					case ne:
						s = 16, r = null;
						break a;
				}
				throw Error(a(130, e == null ? e : typeof e, ""));
		}
		return t = Kl(s, n, t, i), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function Zl(e, t, n, r) {
		return e = Kl(7, e, r, t), e.lanes = n, e;
	}
	function Ql(e, t, n, r) {
		return e = Kl(22, e, r, t), e.elementType = re, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
	}
	function $l(e, t, n) {
		return e = Kl(6, e, null, t), e.lanes = n, e;
	}
	function eu(e, t, n) {
		return t = Kl(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	function tu(e, t, n, r, i) {
		this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = It(0), this.expirationTimes = It(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = It(0), this.identifierPrefix = r, this.onRecoverableError = i, this.mutableSourceEagerHydrationData = null;
	}
	function nu(e, t, n, r, i, a, o, s, c) {
		return e = new tu(e, t, n, s, c), t === 1 ? (t = 1, !0 === a && (t |= 8)) : t = 0, a = Kl(3, null, null, t), e.current = a, a.stateNode = e, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: null,
			transitions: null,
			pendingSuspenseBoundaries: null
		}, eo(a), e;
	}
	function ru(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: T,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	function iu(e) {
		if (!e) return Gi;
		e = e._reactInternals;
		a: {
			if (at(e) !== e || e.tag !== 1) throw Error(a(170));
			var t = e;
			do {
				switch (t.tag) {
					case 3:
						t = t.stateNode.context;
						break a;
					case 1: if (Xi(t.type)) {
						t = t.stateNode.__reactInternalMemoizedMergedChildContext;
						break a;
					}
				}
				t = t.return;
			} while (t !== null);
			throw Error(a(171));
		}
		if (e.tag === 1) {
			var n = e.type;
			if (Xi(n)) return $i(e, n, t);
		}
		return t;
	}
	function au(e, t, n, r, i, a, o, s, c) {
		return e = nu(n, r, !0, e, i, a, o, s, c), e.context = iu(null), n = e.current, r = pl(), i = ml(n), a = no(r, i), a.callback = t ?? null, ro(n, a, i), e.current.lanes = i, Lt(e, i, r), gl(e, r), e;
	}
	function ou(e, t, n, r) {
		var i = t.current, a = pl(), o = ml(i);
		return n = iu(n), t.context === null ? t.context = n : t.pendingContext = n, t = no(a, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = ro(i, t, o), e !== null && (hl(e, i, o, a), io(e, i, o)), o;
	}
	function su(e) {
		if (e = e.current, !e.child) return null;
		switch (e.child.tag) {
			case 5: return e.child.stateNode;
			default: return e.child.stateNode;
		}
	}
	function cu(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function lu(e, t) {
		cu(e, t), (e = e.alternate) && cu(e, t);
	}
	function uu() {
		return null;
	}
	var du = typeof reportError == "function" ? reportError : function(e) {
		console.error(e);
	};
	function fu(e) {
		this._internalRoot = e;
	}
	pu.prototype.render = fu.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(a(409));
		ou(e, t, null, null);
	}, pu.prototype.unmount = fu.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			wl(function() {
				ou(null, e, null, null);
			}), t[Pi] = null;
		}
	};
	function pu(e) {
		this._internalRoot = e;
	}
	pu.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Wt();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < $t.length && t !== 0 && t < $t[n].priority; n++);
			$t.splice(n, 0, e), n === 0 && an(e);
		}
	};
	function mu(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function hu(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
	}
	function gu() {}
	function _u(e, t, n, r, i) {
		if (i) {
			if (typeof r == "function") {
				var a = r;
				r = function() {
					var e = su(o);
					a.call(e);
				};
			}
			var o = au(t, r, e, 0, null, !1, !1, "", gu);
			return e._reactRootContainer = o, e[Pi] = o.current, ci(e.nodeType === 8 ? e.parentNode : e), wl(), o;
		}
		for (; i = e.lastChild;) e.removeChild(i);
		if (typeof r == "function") {
			var s = r;
			r = function() {
				var e = su(c);
				s.call(e);
			};
		}
		var c = nu(e, 0, !1, null, null, !1, !1, "", gu);
		return e._reactRootContainer = c, e[Pi] = c.current, ci(e.nodeType === 8 ? e.parentNode : e), wl(function() {
			ou(t, c, n, r);
		}), c;
	}
	function vu(e, t, n, r, i) {
		var a = n._reactRootContainer;
		if (a) {
			var o = a;
			if (typeof i == "function") {
				var s = i;
				i = function() {
					var e = su(o);
					s.call(e);
				};
			}
			ou(t, o, e, i);
		} else o = _u(n, t, e, i, r);
		return su(o);
	}
	Vt = function(e) {
		switch (e.tag) {
			case 3:
				var t = e.stateNode;
				if (t.current.memoizedState.isDehydrated) {
					var n = At(t.pendingLanes);
					n !== 0 && (zt(t, n | 1), gl(t, V()), !(Z & 6) && (tl = V() + 500, sa()));
				}
				break;
			case 13: wl(function() {
				var t = Qa(e, 1);
				t !== null && hl(t, e, 1, pl());
			}), lu(e, 1);
		}
	}, Ht = function(e) {
		if (e.tag === 13) {
			var t = Qa(e, 134217728);
			t !== null && hl(t, e, 134217728, pl()), lu(e, 134217728);
		}
	}, Ut = function(e) {
		if (e.tag === 13) {
			var t = ml(e), n = Qa(e, t);
			n !== null && hl(n, e, t, pl()), lu(e, t);
		}
	}, Wt = function() {
		return H;
	}, Gt = function(e, t) {
		var n = H;
		try {
			return H = e, t();
		} finally {
			H = n;
		}
	}, Re = function(e, t, n) {
		switch (t) {
			case "input":
				if (ge(e, n), t = n.name, n.type === "radio" && t != null) {
					for (n = e; n.parentNode;) n = n.parentNode;
					for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + "][type=\"radio\"]"), t = 0; t < n.length; t++) {
						var r = n[t];
						if (r !== e && r.form === e.form) {
							var i = Vi(r);
							if (!i) throw Error(a(90));
							pe(r), ge(r, i);
						}
					}
				}
				break;
			case "textarea":
				Ce(e, n);
				break;
			case "select": t = n.value, t != null && be(e, !!n.multiple, t, !1);
		}
	}, We = Cl, Ge = wl;
	var yu = {
		usingClientEntryPoint: !1,
		Events: [
			zi,
			Bi,
			Vi,
			He,
			Ue,
			Cl
		]
	}, bu = {
		findFiberByHostInstance: Ri,
		bundleType: 0,
		version: "18.3.1",
		rendererPackageName: "react-dom"
	}, xu = {
		bundleType: bu.bundleType,
		version: bu.version,
		rendererPackageName: bu.rendererPackageName,
		rendererConfig: bu.rendererConfig,
		overrideHookState: null,
		overrideHookStateDeletePath: null,
		overrideHookStateRenamePath: null,
		overrideProps: null,
		overridePropsDeletePath: null,
		overridePropsRenamePath: null,
		setErrorHandler: null,
		setSuspenseHandler: null,
		scheduleUpdate: null,
		currentDispatcherRef: C.ReactCurrentDispatcher,
		findHostInstanceByFiber: function(e) {
			return e = lt(e), e === null ? null : e.stateNode;
		},
		findFiberByHostInstance: bu.findFiberByHostInstance || uu,
		findHostInstancesForRefresh: null,
		scheduleRefresh: null,
		scheduleRoot: null,
		setRefreshHandler: null,
		getCurrentFiber: null,
		reconcilerVersion: "18.3.1-next-f1338f8080-20240426"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Su = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Su.isDisabled && Su.supportsFiber) try {
			xt = Su.inject(xu), St = Su;
		} catch {}
	}
	e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = yu, e.createPortal = function(e, t) {
		var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!mu(t)) throw Error(a(200));
		return ru(e, t, null, n);
	}, e.createRoot = function(e, t) {
		if (!mu(e)) throw Error(a(299));
		var n = !1, r = "", i = du;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = nu(e, 1, !1, null, null, n, !1, r, i), e[Pi] = t.current, ci(e.nodeType === 8 ? e.parentNode : e), new fu(t);
	}, e.findDOMNode = function(e) {
		if (e == null) return null;
		if (e.nodeType === 1) return e;
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(a(188)) : (e = Object.keys(e).join(","), Error(a(268, e)));
		return e = lt(t), e = e === null ? null : e.stateNode, e;
	}, e.flushSync = function(e) {
		return wl(e);
	}, e.hydrate = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !0, n);
	}, e.hydrateRoot = function(e, t, n) {
		if (!mu(e)) throw Error(a(405));
		var r = n != null && n.hydratedSources || null, i = !1, o = "", s = du;
		if (n != null && (!0 === n.unstable_strictMode && (i = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onRecoverableError !== void 0 && (s = n.onRecoverableError)), t = au(t, null, e, 1, n ?? null, i, !1, o, s), e[Pi] = t.current, ci(e), r) for (e = 0; e < r.length; e++) n = r[e], i = n._getVersion, i = i(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, i] : t.mutableSourceEagerHydrationData.push(n, i);
		return new pu(t);
	}, e.render = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !1, n);
	}, e.unmountComponentAtNode = function(e) {
		if (!hu(e)) throw Error(a(40));
		return e._reactRootContainer ? (wl(function() {
			vu(null, null, e, !1, function() {
				e._reactRootContainer = null, e[Pi] = null;
			});
		}), !0) : !1;
	}, e.unstable_batchedUpdates = Cl, e.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
		if (!hu(n)) throw Error(a(200));
		if (e == null || e._reactInternals === void 0) throw Error(a(38));
		return vu(e, t, n, !1, r);
	}, e.version = "18.3.1-next-f1338f8080-20240426";
})), o = /* @__PURE__ */ e(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = a();
})), s = (/* @__PURE__ */ e(((e) => {
	var t = o();
	e.createRoot = t.createRoot, e.hydrateRoot = t.hydrateRoot;
})))(), c = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/, l = 10n;
function u(e) {
	if (e.length > 256) throw Error("Decimal exceeds the supported range.");
	let t = c.exec(e);
	if (!t) throw Error("Enter a finite decimal value.");
	let n = Number(t[5] ?? "0");
	if (!Number.isSafeInteger(n) || Math.abs(n) > 128) throw Error("Decimal exponent exceeds the supported range.");
	let r = t[3] ?? t[4] ?? "";
	return {
		coefficient: BigInt(`${t[1] === "-" ? "-" : ""}${t[2] ?? "0"}${r}`),
		scale: r.length - n
	};
}
function d({ coefficient: e, scale: t }) {
	if (e === 0n) return "0";
	let n = e < 0n ? "-" : "", r = (e < 0n ? -e : e).toString();
	return t <= 0 ? n + r + "0".repeat(-t) : (r = r.padStart(t + 1, "0"), (n + r.slice(0, -t) + "." + r.slice(-t)).replace(/0+$/, "").replace(/\.$/, ""));
}
function f(e) {
	return d(u(e));
}
function p(e) {
	if (typeof e != "string") return !1;
	try {
		return u(e), !0;
	} catch {
		return !1;
	}
}
function m(e) {
	if (typeof e == "number" && Number.isFinite(e)) return f(String(e));
	if (typeof e == "string") return f(e);
	throw Error("Financial values must be finite decimals.");
}
function h(e, t) {
	if (!Number.isSafeInteger(t) || Math.abs(t) > 30) throw Error("Unsupported decimal shift.");
	let n = u(e);
	return d({
		...n,
		scale: n.scale - t
	});
}
function g(e, t) {
	let n = u(e), r = u(t), i = Math.max(n.scale, r.scale), a = n.coefficient * l ** BigInt(i - n.scale), o = r.coefficient * l ** BigInt(i - r.scale);
	return a < o ? -1 : +(a > o);
}
function _(e, t) {
	try {
		return g(m(e), m(t)) === 0;
	} catch {
		return !1;
	}
}
function v(e) {
	let t = f(e), n = u(e);
	if ((n.coefficient < 0n ? -n.coefficient : n.coefficient).toString().length > 34 || g(t.startsWith("-") ? t.slice(1) : t, "1e30") > 0 || n.coefficient !== 0n && g(t.startsWith("-") ? t.slice(1) : t, "1e-30") < 0) throw Error("Financial input exceeds 34 digits or the supported range [1e-30, 1e30].");
	return t;
}
function y(e, t = 2, n = !0) {
	if (!Number.isInteger(t) || t < 0 || t > 30) throw Error("Unsupported display precision.");
	let r = u(e), i = r.coefficient < 0n, a = i ? -r.coefficient : r.coefficient;
	if (r.scale > t) {
		let e = l ** BigInt(r.scale - t), n = a % e;
		a /= e, (n * 2n > e || n * 2n === e && a % 2n == 1n) && a++;
	} else a *= l ** BigInt(t - r.scale);
	let o = a.toString().padStart(t + 1, "0"), s = t ? o.slice(0, -t) : o;
	return n && (s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",")), `${i && a !== 0n ? "-" : ""}${s}${t ? "." + o.slice(-t) : ""}`;
}
function b(e) {
	let t = "", n = !1, r = !1;
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		if (n) t += a, r ? r = !1 : a === "\\" ? r = !0 : a === "\"" && (n = !1);
		else if (a === "\"") n = !0, t += a;
		else if (a === "-" || /[0-9]/.test(a)) {
			let n = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(e.slice(i));
			if (!n) throw Error("Invalid JSON number.");
			t += JSON.stringify(n[0]), i += n[0].length - 1;
		} else t += a;
	}
	return JSON.parse(t);
}
//#endregion
//#region src/contracts.ts
var x = n(), S = [
	"gross_receipts",
	"cogs",
	"operating_expense_excl_dna_interest_comp",
	"officer_compensation",
	"depreciation",
	"amortization",
	"interest_expense",
	"section_179",
	"k1_distribution"
], C = [
	"ordinary_business_income",
	"ebitda",
	"proposed_monthly_payment",
	"proposed_annual_payment",
	"debt_service",
	"fixed_charge_service",
	"global_business_ebitda",
	"global_outside_income",
	"global_personal_debt",
	"global_cash_flow",
	"global_debt_service",
	"dscr",
	"fccr",
	"global_dscr",
	"net_working_capital_increase",
	"uca_cash_flow",
	"k1_ratio_difference",
	"k1_history"
], w = [
	"commercial_min_dscr",
	"commercial_min_fccr",
	"commercial_min_global_dscr",
	"commercial_decline_dscr",
	"commercial_decline_fccr",
	"commercial_decline_global_dscr",
	"commercial_min_uca_cash_flow",
	"consumer_review_dti",
	"consumer_decline_dti",
	"consumer_min_credit_score",
	"extraction_confidence_threshold",
	"k1_stability_band",
	"sba_global_dscr_floor_expansion",
	"sba_global_dscr_floor_acquisition"
];
function T(e, t) {
	if (!e) throw Error(`Incomplete or invalid assessment: ${t}`);
}
function E(e, t) {
	return T(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
function D(e, t) {
	return T(Array.isArray(e), t), e;
}
function O(e) {
	return typeof e == "string" && e.length > 0;
}
function k(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function ee(e) {
	return typeof e == "string" || typeof e == "boolean";
}
function te(e) {
	return typeof e == "string" && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e;
}
function A(e) {
	let t = E(e, "period");
	return T(te(t.period_start) && te(t.period_end) && t.period_start <= t.period_end, "period dates"), t;
}
var j = (e, t) => e.period_start === t.period_start && e.period_end === t.period_end;
function M(e) {
	let t = E(e, "request");
	return "schema_version" in t ? (T(["commercial-assessment-v1", "commercial-assessment-v2"].includes(String(t.schema_version)), "unsupported schema_version"), "dated") : "legacy";
}
function ne(e) {
	let t = E(e, "decision");
	T(t.vertical === "commercial" && [
		"approve",
		"review",
		"decline"
	].includes(String(t.outcome)) && p(t.score) && O(t.policy_version) && O(t.disclaimer), "decision identity");
	let n = D(t.factors, "factors");
	T(n.length === 5, "commercial factors");
	let r = [
		"dscr",
		"fccr",
		"global_dscr",
		"uca_positive",
		"k1_history"
	];
	for (let e of n) {
		let t = E(e, "factor");
		T(O(t.name) && r.includes(t.name) && ee(t.value) && (t.raw_value === null || ee(t.raw_value)) && p(t.weight) && (t.threshold === null || ee(t.threshold)) && (t.passed === null || typeof t.passed == "boolean") && O(t.source) && [
			null,
			">=",
			">",
			"<",
			"=="
		].includes(t.comparison_operator) && (t.decline_threshold === null || p(t.decline_threshold)) && (t.decline_triggered === null || typeof t.decline_triggered == "boolean"), "factor fields");
	}
	T(new Set(n.map((e) => E(e, "factor").name)).size === 5, "unique factors");
	for (let e of D(t.reasons, "reasons")) {
		let t = E(e, "reason");
		T(O(t.code) && O(t.factor) && O(t.message) && ee(t.value), "reason fields");
	}
	return t;
}
function re(e) {
	let t = E(e, "legacy input");
	T(O(t.borrower_name) && O(t.geography), "borrower");
	let n = (e, t) => {
		let n = e === void 0 ? t : e;
		return T(n !== void 0 && typeof n != "boolean", "legacy decimal input"), m(n);
	}, r = D(t.years, "years").map((e) => {
		let t = E(e, "year");
		return Object.fromEntries(S.map((e) => [e, n(t[e], ["section_179", "k1_distribution"].includes(e) ? "0" : void 0)]));
	});
	T(r.length, "years");
	let i = E(t.existing_debt, "debt"), a = E(t.proposed_loan, "loan"), o = E(t.working_capital, "working capital"), s = D(t.guarantors ?? [], "guarantors").map((e) => {
		let t = E(e, "guarantor");
		return T(t.name === void 0 || O(t.name), "guarantor name"), {
			name: String(t.name ?? "Synthetic Guarantor"),
			...Object.fromEntries([
				"ownership_percentage",
				"wages",
				"interest_dividend_income",
				"mortgage_pi_annual",
				"auto_loan_annual",
				"credit_card_min_annual"
			].map((e) => [e, n(t[e], e === "ownership_percentage" ? "1" : "0")]))
		};
	}), c = D(t.overrides ?? [], "overrides").map((e) => {
		let t = E(e, "override");
		return T(O(t.field) && O(t.rationale) && O(t.source) && (t.actor === void 0 || O(t.actor)) && (t.at === void 0 || O(t.at)) && "new_value" in t, "override fields"), {
			...t,
			actor: t.actor ?? "system",
			at: t.at ?? "Not supplied"
		};
	});
	return {
		borrower_name: t.borrower_name,
		geography: t.geography,
		years: r,
		existing_debt: {
			cpltd_annual: n(i.cpltd_annual),
			operating_lease_annual: n(i.operating_lease_annual, "0")
		},
		proposed_loan: {
			amount: n(a.amount),
			annual_rate: n(a.annual_rate),
			term_months: (() => {
				let e = typeof a.term_months == "string" && /^\d+$/.test(a.term_months) ? Number(a.term_months) : a.term_months;
				return T(Number.isSafeInteger(e), "integer term months"), e;
			})()
		},
		guarantors: s,
		working_capital: Object.fromEntries([
			"ar_increase",
			"inventory_increase",
			"ap_increase",
			"cash_taxes_paid"
		].map((e) => [e, n(o[e], "0")])),
		overrides: c
	};
}
function ie(e) {
	let t = E(e, "normalized input");
	T(t.schema_version === "commercial-assessment-v2" && te(t.assessment_as_of) && O(t.borrower_name) && O(t.geography), "dated identity");
	let n = E(t.units, "units");
	T(n.currency === "USD" && n.monetary_unit === "dollars" && n.annual_rate_unit === "decimal_nominal", "units");
	let r = D(t.years, "years");
	T(r.length >= 1 && r.length <= 10, "year count");
	let i = "";
	for (let e of r) {
		let n = E(e, "year"), r = A(n);
		T(r.period_start > i && r.period_end <= t.assessment_as_of, "year order"), i = r.period_end;
		for (let e of S) T(p(n[e]), `year ${e}`);
	}
	let a = (e, t) => {
		let n = E(e, "assumption");
		for (let e of t) T(p(n[e]), e);
		return n;
	};
	a(t.existing_debt, ["cpltd_annual", "operating_lease_annual"]);
	let o = a(t.proposed_loan, ["amount", "annual_rate"]);
	T(Number.isSafeInteger(o.term_months) && o.rate_type === "fixed" && o.repayment_type === "fully_amortizing" && o.payment_frequency === "monthly", "loan convention"), T(j(A(a(t.working_capital, [
		"ar_increase",
		"inventory_increase",
		"ap_increase",
		"cash_taxes_paid"
	])), A(r[r.length - 1])), "working capital period");
	for (let e of D(t.guarantors, "guarantors")) T(O(a(e, [
		"ownership_percentage",
		"wages",
		"interest_dividend_income",
		"mortgage_pi_annual",
		"auto_loan_annual",
		"credit_card_min_annual"
	]).name), "guarantor name");
	return t;
}
function ae(e) {
	let t = E(e, "metric");
	return T(O(t.fact_id) && O(t.unit) && (t.display_precision === null || Number.isInteger(t.display_precision) && Number(t.display_precision) >= 0 && Number(t.display_precision) <= 30) && (t.explanation === null || O(t.explanation)), "metric fields"), T(t.status === "available" ? p(t.raw_value) || t.unit === "category" && O(t.raw_value) : t.status === "not_applicable" && t.raw_value === null && O(t.explanation), "metric status/value"), T(t.status === "not_applicable" ? t.reported_value === null : t.unit === "category" ? t.reported_value === t.raw_value : p(t.reported_value), "reported metric value"), t;
}
function N(e) {
	let t = E(e, "assessment");
	T(t.schema_version === "commercial-assessment-v2" && t.calculation_version === "commercial-calculation-v2" && t.serialization_version === "assessment-json-v2" && t.coverage_basis === "current_pro_forma" && O(t.disclaimer), "versions");
	let n = ie(t.normalized_input), r = n.years[n.years.length - 1];
	T(j(A(t.selected_period), r) && t.assumptions_as_of === n.assessment_as_of, "selected period");
	let i = D(t.historical_spread, "spread");
	T(i.length === n.years.length, "spread length");
	let a = [];
	i.forEach((e, t) => {
		let r = E(e, "historical period");
		T(j(A(r), n.years[t]) && j(A(r.financials), n.years[t]), "historical period correspondence");
		let i = E(r.financials, "historical financials");
		for (let e of S) T(i[e] === n.years[t][e], "historical inputs");
		let o = E(r.reported_financials, "reported financials");
		T(j(A(o), n.years[t]), "reported period");
		for (let e of S) T(p(o[e]) && /^-?\d+\.\d{2}$/.test(o[e]), "reported source amount");
		for (let e of [
			"gross_profit",
			"ordinary_business_income",
			"ebitda",
			"k1_distribution_ratio"
		]) a.push(ae(r[e]));
	});
	let o = E(t.current_facts, "facts");
	for (let e of C) {
		let t = ae(o[e]), r = ["ordinary_business_income", "ebitda"].includes(e) ? `years.${n.years.length - 1}.${e}` : `current.${e}`;
		T(t.fact_id === r, "fact identity"), T(e === "k1_history" ? t.status === "available" && [
			"stable",
			"unstable",
			"insufficient_history"
		].includes(String(t.raw_value)) : t.raw_value === null || p(t.raw_value), "fact type"), a.push(t);
	}
	let s = D(t.guarantor_contributions, "contributions");
	T(s.length === n.guarantors.length, "contributions length"), s.forEach((e, t) => {
		let r = E(e, "contribution");
		T(r.guarantor_index === t && r.name === n.guarantors[t].name, "contribution identity");
		for (let e of [
			"business_ebitda",
			"outside_income",
			"personal_debt"
		]) a.push(ae(r[e]));
	});
	let c = D(t.k1_history_periods, "history periods").map(A);
	T(c.length >= 1 && c.length <= 2 && j(c[c.length - 1], r) && c.every((e) => n.years.some((t) => j(e, t))), "history periods");
	let l = E(t.policy_snapshot, "policy");
	T(O(l.version) && te(l.sba_sop_8_effective) && te(l.sba_sop_8_1_effective), "policy identity");
	for (let e of w) T(e === "consumer_min_credit_score" ? Number.isSafeInteger(l[e]) : p(l[e]), `policy ${e}`);
	T(D(l.consumer_required_atr_fields, "ATR fields").every(O), "ATR fields");
	let u = ne(t.decision);
	T(u.policy_version === l.version, "decision policy");
	let d = D(t.calculation_trace, "trace");
	T(d.length > 0, "trace rows");
	let f = /* @__PURE__ */ new Map();
	for (let e of d) {
		let t = E(e, "trace row"), n = ae(t);
		T(O(t.definition_id) && O(t.expression) && !f.has(n.fact_id), "trace identity"), f.set(n.fact_id, n);
		for (let e of D(t.operands, "operands")) {
			let t = E(e, "operand");
			T([
				"input",
				"fact",
				"policy"
			].includes(String(t.reference_type)) && O(t.reference) && O(t.unit) && (t.raw_value === null || k(t.raw_value) || typeof t.raw_value == "string"), "operand fields"), T(t.reported_value === null || p(t.reported_value) || Number.isSafeInteger(t.reported_value), "reported operand");
		}
	}
	for (let e of d) {
		let t = E(e, "trace row");
		for (let e of D(t.operands, "operands")) {
			let t = E(e, "operand");
			if (t.reference_type === "fact") {
				let e = f.get(String(t.reference));
				T(e && e.raw_value === t.raw_value && e.unit === t.unit, "referenced fact");
			} else {
				let e = String(t.reference).split("/").slice(1), r = t.reference_type === "policy" ? { policy_snapshot: l } : n;
				for (let t of e) T(typeof r == "object" && !!r && Object.prototype.hasOwnProperty.call(r, t), "operand input path"), r = r[t];
				T(r === t.raw_value, "operand input value");
			}
		}
	}
	for (let e of a) {
		let t = f.get(e.fact_id);
		T(t && t.raw_value === e.raw_value && t.reported_value === e.reported_value && t.status === e.status && t.unit === e.unit, "fact/trace correspondence");
	}
	for (let e of u.factors) {
		let t = e.name === "uca_positive" ? "uca_cash_flow" : e.name;
		T(e.raw_value === ae(o[t]).raw_value, "factor/fact correspondence");
	}
	let m = E(t.fingerprint, "fingerprint");
	return T(m.algorithm === "sha256" && typeof m.value == "string" && /^[0-9a-f]{64}$/.test(m.value) && m.content === "normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version", "fingerprint"), t;
}
//#endregion
//#region src/workspace.ts
var oe = {
	id: 0,
	accepted: null,
	draft: null,
	filename: "alpine_dated_v2.json",
	status: "evaluating",
	error: "",
	history: [],
	saved: null,
	action: "evaluate",
	resetPeriod: !0
};
function se(e, t) {
	if (t.type === "head") return e.id !== t.id || e.status !== "ready" || e.saved?.view.snapshot.case_id !== t.caseId || e.saved.view.snapshot.revision !== t.revision || t.headRevision < t.revision ? e : {
		...e,
		saved: {
			...e.saved,
			headRevision: t.headRevision,
			selection: t.headRevision === t.revision ? "latest" : "revision"
		}
	};
	if (t.type === "start") return t.id < e.id ? e : {
		...e,
		id: t.id,
		draft: t.draft,
		filename: t.filename,
		status: "evaluating",
		error: "",
		action: t.action ?? "evaluate"
	};
	if (t.id !== e.id || e.status === "ready") return e;
	if (t.type === "failure") return {
		...e,
		status: "unavailable",
		error: t.error
	};
	if (t.type === "stored-success") {
		let { view: n, selection: r } = t;
		return {
			...e,
			draft: null,
			filename: `Saved case ${n.snapshot.case_id}`,
			accepted: n.assessment ? {
				mode: "dated",
				input: n.assessment.normalized_input,
				result: n.assessment,
				filename: `Saved case ${n.snapshot.case_id}`
			} : null,
			saved: {
				view: n,
				selection: r,
				headRevision: r === "latest" ? n.snapshot.revision : null
			},
			history: [],
			status: "ready",
			error: "",
			resetPeriod: t.resetPeriod ?? !0
		};
	}
	let n = e.draft?.resetHistory ? [] : e.history;
	return {
		...e,
		accepted: t.accepted,
		draft: null,
		status: "ready",
		error: "",
		history: e.draft?.edit ? [...n, e.draft.edit] : n,
		saved: null,
		resetPeriod: !!e.draft?.resetHistory
	};
}
function ce(e, t) {
	let n = t.path.split("/").slice(1), r = JSON.parse(JSON.stringify(e)), i = r;
	for (let e of n.slice(0, -1)) i = i[e];
	return i[n[n.length - 1]] = t.next, r;
}
function le(e, t, n) {
	if (!/^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(t.trim())) throw Error("Enter a valid finite number.");
	let r = v(t.trim().replace(/,/g, "")), i = v(e.unit === "%" ? h(r, -2) : r), a = i;
	if (e.integer) {
		if (!/^-?\d+$/.test(i) || !Number.isSafeInteger(Number(i))) throw Error("Enter a safe whole number of months.");
		a = Number(i);
	}
	if (e.min !== void 0 && g(i, String(e.min)) < 0 || e.max !== void 0 && g(i, String(e.max)) > 0) throw Error(`Value is outside the supported range (${e.min ?? "no minimum"} to ${e.max ?? "no maximum"} in API units).`);
	if (!n.trim()) throw Error("A nonblank rationale is required.");
	if (_(a, e.value)) throw Error("Enter a changed value or cancel.");
	return a;
}
//#endregion
//#region src/caseContracts.ts
function P(e, t) {
	if (!e) throw Error(`Invalid saved-case response or command: ${t}.`);
}
function F(e, t) {
	return P(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
var ue = (e) => typeof e == "number" && Number.isFinite(e), I = (e) => typeof e == "string", de = (e) => I(e) && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(e), L = (e) => I(e) && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(e), fe = (e) => Number.isSafeInteger(e) && Number(e) >= 1, pe = (e) => I(e) && /^[0-9a-f]{64}$/.test(e), R = (e) => I(e) && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, me = (e) => I(e) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(e) && R(e.slice(0, 10)) && Number.isFinite(Date.parse(e));
function he(e, t = 0, n = 64) {
	if (P(t < n, "JSON depth"), !(e === null || I(e) || typeof e == "boolean")) {
		if (typeof e == "number") {
			P(ue(e), "finite JSON number");
			return;
		}
		P(typeof e == "object", "JSON value");
		for (let r of Object.values(e)) he(r, t + 1, n);
	}
}
function z(e, t) {
	if (e === t) return !0;
	if (!e || !t || typeof e != "object" || typeof t != "object" || Array.isArray(e) !== Array.isArray(t)) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.prototype.hasOwnProperty.call(t, n) && z(e[n], t[n]));
}
function ge(e, t) {
	P(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), "command fields");
}
function _e(e) {
	return P(I(e) && [...e].length <= 2e3 && e.trim().length > 0, "nonblank rationale, at most 2,000 characters"), e.trim();
}
var ve = {
	years: S,
	existing_debt: ["cpltd_annual", "operating_lease_annual"],
	proposed_loan: [
		"amount",
		"annual_rate",
		"term_months"
	],
	guarantors: [
		"ownership_percentage",
		"wages",
		"interest_dividend_income",
		"mortgage_pi_annual",
		"auto_loan_annual",
		"credit_card_min_annual"
	],
	working_capital: [
		"ar_increase",
		"inventory_increase",
		"ap_increase",
		"cash_taxes_paid"
	]
};
function ye(e) {
	P(I(e) && e.length <= 160 && e.startsWith("/"), "numeric field path");
	let t = e.slice(1).split("/"), n = t[0], r = t[t.length - 1];
	return P(Object.prototype.hasOwnProperty.call(ve, n) && ve[n].includes(r), "numeric field allowlist"), P(["years", "guarantors"].includes(n) ? t.length === 3 && /^(?:0|[1-9][0-9]{0,8})$/.test(t[1]) : t.length === 2, "field index"), t;
}
function be(e, t) {
	let n = ye(t), r = n[0], i = n[n.length - 1], a = e, o, s = {
		basis: "current_assumptions",
		assessment_as_of: String(a.assessment_as_of),
		period_start: null,
		period_end: null,
		guarantor_index: null,
		guarantor_name: null,
		unit: "USD dollars"
	};
	if (n.length === 3) {
		let e = a[r];
		P(Array.isArray(e) && Number(n[1]) < e.length, "existing input index"), o = F(e[Number(n[1])], "input row"), r === "guarantors" ? (s.guarantor_index = Number(n[1]), s.guarantor_name = String(o.name)) : s.basis = "annual_financials";
	} else o = F(a[r], "input group"), r === "working_capital" && (s.basis = "working_capital");
	["annual_financials", "working_capital"].includes(s.basis) && (P(R(o.period_start) && R(o.period_end), "input dates"), s.period_start = o.period_start, s.period_end = o.period_end), ["annual_rate", "ownership_percentage"].includes(i) && (s.unit = "decimal fraction"), i === "term_months" && (s.unit = "months");
	let c = o[i];
	return P(i === "term_months" ? Number.isSafeInteger(c) : p(c) || ue(c), "numeric input"), {
		value: c,
		context: s
	};
}
function xe(e) {
	let t = F(e, "create command");
	ge(t, ["input", "rationale"]);
	let n = F(t.input, "create input"), r = n.schema_version === "commercial-assessment-v1";
	if (r) {
		let e = (t, n = "") => typeof t == "number" ? n === "term_months" ? t : m(t) : Array.isArray(t) ? t.map((t) => e(t)) : t && typeof t == "object" ? Object.fromEntries(Object.entries(t).map(([t, n]) => [t, e(n, t)])) : t;
		ie({
			...F(e(n), "archived input"),
			schema_version: "commercial-assessment-v2"
		});
	}
	let i = r ? n : ie(n);
	ge(i, [
		"schema_version",
		"assessment_as_of",
		"borrower_name",
		"geography",
		"units",
		"years",
		"existing_debt",
		"proposed_loan",
		"guarantors",
		"working_capital"
	]), ge(i.units, [
		"currency",
		"monetary_unit",
		"annual_rate_unit"
	]);
	for (let e of i.years) ge(e, [
		...S,
		"period_start",
		"period_end"
	]);
	ge(i.existing_debt, ve.existing_debt), ge(i.proposed_loan, [
		...ve.proposed_loan,
		"rate_type",
		"repayment_type",
		"payment_frequency"
	]);
	for (let e of i.guarantors) ge(e, ["name", ...ve.guarantors]);
	return ge(i.working_capital, [
		...ve.working_capital,
		"period_start",
		"period_end"
	]), he(t), _e(t.rationale), t;
}
function Se(e) {
	let t = F(e, "edit command");
	return ge(t, [
		"field_path",
		"new_value",
		"rationale"
	]), ye(t.field_path), P(p(t.new_value) || ue(t.new_value), "finite edit value"), _e(t.rationale), t.field_path === "/proposed_loan/term_months" && P(ue(t.new_value) && Number.isSafeInteger(t.new_value) && t.new_value >= 12 && t.new_value <= 12e3, "whole term months"), t;
}
function Ce(e, t) {
	let n = F(e, "snapshot");
	he(n), P(n.storage_serialization_version === "case-json-v1" && L(n.case_id) && L(n.run_id) && fe(n.revision), "snapshot identity"), P(n.parent_revision === (n.revision === 1 ? null : n.revision - 1) && me(n.recorded_at), "snapshot parent/time"), P(pe(n.input_hash) && pe(n.payload_hash), "snapshot hashes"), P(t === `"case-json-v1:${n.case_id}:${n.revision}:${n.payload_hash}"`, "strong ETag");
	let r = F(n.normalized_input, "stored input"), i = F(n.assessment, "stored assessment");
	P(I(i.schema_version) && I(i.calculation_version) && I(i.serialization_version), "assessment versions");
	let a = i.schema_version === "commercial-assessment-v2" && i.calculation_version === "commercial-calculation-v2" && i.serialization_version === "assessment-json-v2", o = a ? N(i) : null;
	o && P(z(r, o.normalized_input), "outer normalized input");
	let s = F(n.event, "event"), c = F(s.context, "event context");
	if (P(s.case_id === n.case_id && s.revision === n.revision && s.run_id === n.run_id && s.recorded_at === n.recorded_at && de(s.actor), "event identity"), _e(s.rationale), P(R(c.assessment_as_of), "event as-of"), P(c.period_start === null && c.period_end === null || R(c.period_start) && R(c.period_end) && c.period_start <= c.period_end, "event period"), P(c.guarantor_index === null && c.guarantor_name === null || Number.isSafeInteger(c.guarantor_index) && Number(c.guarantor_index) >= 0 && I(c.guarantor_name), "event guarantor"), n.revision === 1) P(s.kind === "creation" && s.field_path === null && s.before === null && s.after === null && c.basis === "case_creation" && c.unit === null && c.period_start === null && c.guarantor_index === null, "creation event");
	else if (P(s.kind === "edit" && (p(s.before) || ue(s.before)) && (p(s.after) || ue(s.after)) && !_(s.before, s.after) && I(s.field_path), "edit event"), ye(s.field_path), P([
		"annual_financials",
		"working_capital",
		"current_assumptions"
	].includes(String(c.basis)) && [
		"USD dollars",
		"decimal fraction",
		"months"
	].includes(String(c.unit)), "edit context"), o) {
		let e = be(o.normalized_input, s.field_path);
		P(e.value === s.after && z(e.context, c), "server-derived edit context");
	}
	return o && P(c.assessment_as_of === o.normalized_input.assessment_as_of, "event assumptions date"), we(n.recording), {
		snapshot: n,
		etag: t,
		assessment: o,
		compatibility: a ? null : `Stored assessment definition: ${i.schema_version} / ${i.calculation_version} / ${i.serialization_version}. Original JSON is available; typed display and editing are unavailable.`
	};
}
function we(e) {
	let t = F(e, "recording metadata"), n = F(t.packages, "installed packages");
	P(I(t.python_version) && I(t.sqlite_version) && pe(t.dependency_baseline_sha256), "recording versions");
	for (let e of [
		"fastapi",
		"pydantic",
		"starlette",
		"uvicorn"
	]) P(I(n[e]) && n[e].length > 0, `installed ${e}`);
	return P(t.source_status === "development_unverified" ? t.source_revision === null : t.source_status === "build_reported" && I(t.source_revision) && /^[0-9a-f]{40}$/.test(t.source_revision), "recorded source"), t;
}
function Te(e) {
	let t = F(e, "page");
	return P(Array.isArray(t.items) && t.items.length <= 25, "bounded page items"), P(t.next_cursor === null || I(t.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(t.next_cursor), "page cursor"), t;
}
function Ee(e) {
	let t = F(e, "summary");
	return P(L(t.case_id) && L(t.run_id) && fe(t.revision) && me(t.recorded_at), "summary identity"), t;
}
function De(e) {
	let t = Te(e), n = /* @__PURE__ */ new Set();
	for (let e of t.items) {
		let t = Ee(e);
		P(I(t.borrower_name) && me(t.created_at) && !n.has(t.case_id), "case summary"), n.add(t.case_id);
	}
	return t;
}
function Oe(e, t) {
	let n = Te(e), r = Infinity;
	for (let e of n.items) {
		let n = Ee(e);
		P(n.case_id === t && n.parent_revision === (n.revision === 1 ? null : Number(n.revision) - 1) && Number(n.revision) < r, "revision summary"), _e(n.rationale), r = Number(n.revision);
	}
	return n;
}
function ke(e, t) {
	let n = F(e, "replay"), r = t.snapshot;
	return P(n.case_id === r.case_id && n.revision === r.revision && n.run_id === r.run_id && [
		"matched",
		"mismatch",
		"replay_unavailable"
	].includes(String(n.status)), "replay identity/status"), P(Array.isArray(n.differences) && n.differences.every(I) && I(n.explanation), "replay details"), P(n.status !== "matched" || n.differences.length === 0, "matched replay differences"), n;
}
//#endregion
//#region src/workspaceDom.ts
var Ae = document;
function je(e) {
	Ae = e;
}
function Me(e) {
	return Ae.querySelector(e);
}
function Ne(e) {
	let t = e.getRootNode();
	return t instanceof ShadowRoot ? t.activeElement : document.activeElement;
}
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.min.js
var Pe = /* @__PURE__ */ e(((e) => {
	var t = n(), r = Symbol.for("react.element"), i = Symbol.for("react.fragment"), a = Object.prototype.hasOwnProperty, o = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, s = {
		key: !0,
		ref: !0,
		__self: !0,
		__source: !0
	};
	function c(e, t, n) {
		var i, c = {}, l = null, u = null;
		for (i in n !== void 0 && (l = "" + n), t.key !== void 0 && (l = "" + t.key), t.ref !== void 0 && (u = t.ref), t) a.call(t, i) && !s.hasOwnProperty(i) && (c[i] = t[i]);
		if (e && e.defaultProps) for (i in t = e.defaultProps, t) c[i] === void 0 && (c[i] = t[i]);
		return {
			$$typeof: r,
			type: e,
			key: l,
			ref: u,
			props: c,
			_owner: o.current
		};
	}
	e.Fragment = i, e.jsx = c, e.jsxs = c;
})), B = (/* @__PURE__ */ e(((e, t) => {
	t.exports = Pe();
})))();
function Fe(e) {
	e?.isConnected && !(e instanceof HTMLButtonElement && e.disabled) ? e.focus() : Me("[data-focus-fallback]")?.focus();
}
function Ie({ title: e, onCancel: t, restoreFocus: n, children: r }) {
	let i = (0, x.useRef)(null);
	return (0, x.useEffect)(() => {
		let e = i.current;
		return e?.showModal(), () => {
			e?.close(), Fe(n);
		};
	}, [n]), /* @__PURE__ */ (0, B.jsx)("dialog", {
		ref: i,
		"aria-label": e,
		onCancel: (e) => {
			e.preventDefault(), t();
		},
		onKeyDown: (e) => {
			if (e.key !== "Tab") return;
			let t = Array.from(e.currentTarget.querySelectorAll("input:not(:disabled),textarea:not(:disabled),button:not(:disabled)")), n = t[0], r = t[t.length - 1];
			e.shiftKey && Ne(e.currentTarget) === n ? (e.preventDefault(), r?.focus()) : !e.shiftKey && Ne(e.currentTarget) === r && (e.preventDefault(), n?.focus());
		},
		children: r
	});
}
function Le({ input: e, onSave: t, onCancel: n, restoreFocus: r }) {
	let [i, a] = (0, x.useState)(""), [o, s] = (0, x.useState)("");
	return /* @__PURE__ */ (0, B.jsx)(Ie, {
		title: "Save dated case",
		onCancel: n,
		restoreFocus: r,
		children: /* @__PURE__ */ (0, B.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				try {
					_e(i), t(i), n();
				} catch (e) {
					s(e instanceof Error ? e.message : String(e));
				}
			},
			children: [
				/* @__PURE__ */ (0, B.jsx)("div", {
					className: "eyebrow",
					children: "SAVE ACCEPTED INPUT"
				}),
				/* @__PURE__ */ (0, B.jsx)("h2", { children: "Save dated case" }),
				/* @__PURE__ */ (0, B.jsxs)("p", { children: [
					e.borrower_name,
					" · as of ",
					e.assessment_as_of
				] }),
				/* @__PURE__ */ (0, B.jsxs)("label", { children: ["Save rationale", /* @__PURE__ */ (0, B.jsx)("textarea", {
					autoFocus: !0,
					rows: 3,
					value: i,
					onChange: (e) => a(e.target.value)
				})] }),
				/* @__PURE__ */ (0, B.jsx)("p", {
					className: "fine",
					children: "Saving assesses this accepted input under the server's current policy. The returned stored result becomes the accepted result. Earlier session edits are not added to saved history. Rationale: at most 2,000 characters."
				}),
				o && /* @__PURE__ */ (0, B.jsx)("p", {
					role: "alert",
					children: o
				}),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, B.jsx)("button", {
						type: "button",
						onClick: n,
						children: "Cancel"
					}), /* @__PURE__ */ (0, B.jsx)("button", {
						className: "primary",
						type: "submit",
						children: "Save accepted case"
					})]
				})
			]
		})
	});
}
function Re({ onDiscard: e, onCancel: t, restoreFocus: n }) {
	let [r, i] = (0, x.useState)("");
	return /* @__PURE__ */ (0, B.jsxs)(Ie, {
		title: "Discard recovery tracking",
		onCancel: t,
		restoreFocus: n,
		children: [
			/* @__PURE__ */ (0, B.jsx)("h2", { children: "Discard recovery tracking?" }),
			/* @__PURE__ */ (0, B.jsx)("p", { children: "A previous write might already be saved. Discarding this tab's tracking does not undo that write and loses its exact retry key. Check saved cases before creating another case." }),
			r && /* @__PURE__ */ (0, B.jsx)("p", {
				role: "alert",
				children: r
			}),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, B.jsx)("button", {
					autoFocus: !0,
					onClick: t,
					children: "Keep tracking"
				}), /* @__PURE__ */ (0, B.jsx)("button", {
					onClick: () => {
						try {
							e(), t();
						} catch (e) {
							i(e instanceof Error ? e.message : String(e));
						}
					},
					children: "Discard tracking"
				})]
			})
		]
	});
}
//#endregion
//#region src/EditDialog.tsx
function ze({ field: e, onCancel: t, onSubmit: n, restoreFocus: r, saved: i = !1, proposal: a }) {
	let o = (0, x.useRef)(null), [s, c] = (0, x.useState)(String(e.unit === "%" ? h(String(a?.next ?? e.value), 2) : a?.next ?? e.value)), [l, u] = (0, x.useState)(a?.rationale ?? ""), [d, f] = (0, x.useState)("");
	return (0, x.useEffect)(() => {
		let e = o.current;
		return e?.showModal(), () => {
			e?.close(), Fe(r);
		};
	}, [r]), /* @__PURE__ */ (0, B.jsx)("dialog", {
		ref: o,
		"aria-labelledby": "edit-title",
		onKeyDown: (e) => {
			if (e.key !== "Tab") return;
			let t = Array.from(e.currentTarget.querySelectorAll("input,textarea,button:not(:disabled)")), n = t[0], r = t[t.length - 1];
			e.shiftKey && Ne(e.currentTarget) === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && Ne(e.currentTarget) === r && (e.preventDefault(), n.focus());
		},
		onCancel: (e) => {
			e.preventDefault(), t();
		},
		children: /* @__PURE__ */ (0, B.jsxs)("form", {
			onSubmit: (t) => {
				t.preventDefault();
				try {
					let t = le(e, s, l);
					i && _e(l), n({
						path: e.path,
						prior: e.value,
						next: t,
						rationale: l.trim(),
						at: (/* @__PURE__ */ new Date()).toISOString()
					});
				} catch (e) {
					f(e instanceof Error ? e.message : String(e));
				}
			},
			children: [
				/* @__PURE__ */ (0, B.jsx)("div", {
					className: "eyebrow",
					children: "INPUT REVIEW"
				}),
				/* @__PURE__ */ (0, B.jsxs)("h2", {
					id: "edit-title",
					children: ["Edit ", e.label]
				}),
				/* @__PURE__ */ (0, B.jsxs)("p", { children: [
					e.period,
					" · ",
					e.unit,
					/* @__PURE__ */ (0, B.jsx)("br", {}),
					"Current value: ",
					e.unit === "%" ? h(String(e.value), 2) : e.value
				] }),
				/* @__PURE__ */ (0, B.jsxs)("label", { children: [
					"New value",
					" ",
					/* @__PURE__ */ (0, B.jsx)("input", {
						autoFocus: !0,
						value: s,
						onChange: (e) => c(e.target.value),
						inputMode: "decimal"
					})
				] }),
				/* @__PURE__ */ (0, B.jsxs)("label", { children: [
					"Rationale",
					" ",
					/* @__PURE__ */ (0, B.jsx)("textarea", {
						value: l,
						onChange: (e) => u(e.target.value),
						rows: 3
					})
				] }),
				d && /* @__PURE__ */ (0, B.jsx)("p", {
					role: "alert",
					children: d
				}),
				/* @__PURE__ */ (0, B.jsx)("p", {
					className: "fine",
					children: i ? "The edit creates a saved revision only after an accepted server receipt. It uses the server's selected policy; earlier revisions stay unchanged. Rationale: at most 2,000 characters." : "The edit is applied only after a successful backend evaluation."
				}),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, B.jsx)("button", {
						type: "button",
						onClick: t,
						children: "Cancel"
					}), /* @__PURE__ */ (0, B.jsx)("button", {
						className: "primary",
						type: "submit",
						children: i ? "Save revision" : "Evaluate edit"
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/metricDisplay.ts
function Be(e) {
	if (e.status === "not_applicable") return "Not applicable";
	let t = e.reported_value ?? e.raw_value;
	return p(t) ? `${y(t, e.display_precision ?? 0)} ${e.unit}` : String(t);
}
//#endregion
//#region src/AssessmentSummary.tsx
function Ve(e, t = !1) {
	let n = e.reported_value ?? e.raw_value;
	return e.status !== "available" || !p(n) ? "Not applicable" : t ? `$${y(n, 2)}` : `${y(n, 4)}x`;
}
function He({ assessment: e }) {
	let t = e.current_facts, n = [
		{
			label: "EBITDA",
			value: Ve(t.ebitda, !0),
			note: `Operating year ended ${e.selected_period.period_end}`
		},
		{
			label: "Proposed annual service",
			value: Ve(t.proposed_annual_payment, !0),
			note: "Fixed rate · monthly repayment"
		},
		{
			label: "Business DSCR",
			value: Ve(t.dscr),
			note: `Policy minimum ${e.policy_snapshot.commercial_min_dscr}x`
		},
		{
			label: "Global DSCR",
			value: Ve(t.global_dscr),
			note: `Policy minimum ${e.policy_snapshot.commercial_min_global_dscr}x`
		}
	];
	return /* @__PURE__ */ (0, B.jsx)("section", {
		className: "summaryGrid",
		"aria-label": "Assessment overview",
		children: n.map((e) => /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "summaryCard",
			children: [
				/* @__PURE__ */ (0, B.jsx)("span", { children: e.label }),
				/* @__PURE__ */ (0, B.jsx)("strong", { children: e.value }),
				/* @__PURE__ */ (0, B.jsx)("small", { children: e.note })
			]
		}, e.label))
	});
}
//#endregion
//#region src/authentication.ts
var Ue = /* @__PURE__ */ new Set(), We = null, Ge = 3e4;
function Ke(e, t = !1) {
	let n = new URL(e), r = [
		"localhost",
		"127.0.0.1",
		"[::1]"
	].includes(n.hostname);
	if (n.username || n.password || !t && n.search || n.hash || n.protocol !== "https:" && !(n.protocol === "http:" && r)) throw Error("Use an HTTPS API URL, or HTTP on loopback, without credentials or query parameters.");
	return n;
}
function qe(e = "") {
	for (let e of Ue) e();
}
function Je(e = "") {
	We?.controller.abort(), We = null, qe(e);
}
async function Ye(e, t, n = fetch) {
	let r = We;
	if (!r) throw Error("Connect the workspace with an API token before sending requests.");
	if (Ke(e, !0).origin !== r.origin) throw Error("The API origin changed. Reconnect before sending a credential.");
	let i = new Headers(t.headers);
	if (i.has("Authorization")) throw Error("Caller-supplied authorization is not accepted.");
	i.set("Authorization", `Bearer ${r.token}`);
	let a = [r.controller.signal, AbortSignal.timeout(Ge)];
	t.signal && a.push(t.signal);
	let o = await n(e, {
		...t,
		headers: i,
		signal: AbortSignal.any(a),
		redirect: "error",
		credentials: "omit",
		cache: "no-store",
		referrerPolicy: "no-referrer"
	});
	if (r !== We || r.controller.signal.aborted) throw await o.body?.cancel().catch(() => {}), Error("The API connection changed; review any pending write before retrying.");
	return o.status === 401 && Je("The API rejected the credential. Reconnect to review or retry pending work."), o;
}
//#endregion
//#region src/transport.ts
var Xe = "http://localhost:8000".replace(/\/$/, ""), Ze = null;
function Qe(e, t) {
	if (!/^[0-9a-f-]{36}$/.test(e)) throw Error("Invalid testing store identity");
	Xe = `streamlit:${window.location.origin}:${e}`, Ze = t;
}
function $e(e, t, n) {
	return Ze ? Ze(e, t) : Ye(`${Xe}${e}`, t, n);
}
function et() {
	try {
		let e = window.sessionStorage;
		if (!Ze) return e;
		let t = "spreadline.embedded.", n = () => Array.from({ length: e.length }, (t, n) => e.key(n)).filter((e) => e !== null && e.startsWith(t));
		return {
			get length() {
				return n().length;
			},
			key(e) {
				return n()[e]?.slice(20) ?? null;
			},
			getItem(n) {
				return e.getItem(t + n);
			},
			setItem(n, r) {
				e.setItem(t + n, r);
			},
			removeItem(n) {
				e.removeItem(t + n);
			},
			clear() {
				for (let t of n()) e.removeItem(t);
			}
		};
	} catch {
		return null;
	}
}
//#endregion
//#region src/api.ts
var tt = (e, t, n = fetch) => $e(e, t, n);
async function nt(e, t, n = fetch) {
	let r = await tt(`/commercial/${e.mode === "dated" ? "assessment" : "decision"}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: e.rawJson ?? JSON.stringify(e.payload),
		signal: t
	}, n), i;
	try {
		i = await r.json();
	} catch {
		throw Error(`Backend returned an unreadable response (${r.status}).`);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null, t = Array.isArray(e) ? e.map((e) => e && typeof e == "object" ? `${Array.isArray(e.loc) ? e.loc.join(".") : "input"}: ${String(e.msg ?? "Invalid input")}` : "Invalid input").join("; ") : typeof e == "string" ? e : `Request failed (${r.status}).`;
		throw Error(t);
	}
	return e.mode === "dated" ? (() => {
		let t = N(i);
		return {
			mode: "dated",
			input: t.normalized_input,
			result: t,
			filename: e.filename
		};
	})() : {
		mode: "legacy",
		input: re(e.payload),
		result: ne(i),
		filename: e.filename
	};
}
//#endregion
//#region src/scenarioContracts.ts
var rt = [
	"revenue_change",
	"cogs_change",
	"operating_expense_change",
	"proposed_rate_change_bps"
], it = "commercial-scenario-preview-v2", at = "scenario-preview-json-v2";
function ot(e, t) {
	P(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), "scenario fields");
}
function st(e, t) {
	P(I(e), "scenario text");
	let n = e.replace(/^[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$/gu, "");
	return P(n.length > 0 && [...n].length <= t, `nonblank scenario text, at most ${t} characters`), n;
}
function ct(e, t) {
	let n = e.trim();
	P(/^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(n), "Enter a finite decimal change");
	let r = v(h(n.replace(/,/g, ""), t ? -2 : 0));
	return P(p(r) && (!t || g(r, "-1") >= 0), "Percentage changes must be at least -100%; all changes must be finite"), r;
}
function lt(e, t = !1) {
	let n = F(e, "scenario"), r = F(n.assumptions, "shocks");
	P(I(n.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(n.scenario_key), "scenario key"), ot(r, rt);
	for (let e of rt) P((p(r[e]) || t && ue(r[e])) && (e === "proposed_rate_change_bps" || g(m(r[e]), "-1") >= 0), "finite explicit shock");
	return {
		scenario_key: n.scenario_key,
		name: st(n.name, 120),
		rationale: st(n.rationale, 2e3),
		assumptions: r
	};
}
function ut(e) {
	let t = F(e, "scenario command"), n = ["commercial-scenario-comparison-create-v1", "commercial-scenario-comparison-create-v2"].includes(String(t.schema_version)), r = String(t.schema_version).endsWith("-v1");
	P(n || t.schema_version === it || t.schema_version === "commercial-scenario-preview-v1", "scenario command version"), ot(t, [
		"schema_version",
		"baseline_run_id",
		"scenarios",
		...n ? ["expected_preview_fingerprint"] : []
	]), P(L(t.baseline_run_id) && String(t.baseline_run_id).toLowerCase() === t.baseline_run_id, "canonical baseline run"), n && P(pe(t.expected_preview_fingerprint), "reviewed preview fingerprint"), P(Array.isArray(t.scenarios) && t.scenarios.length >= 1 && t.scenarios.length <= 10, "1–10 scenarios");
	let i = /* @__PURE__ */ new Set();
	for (let e of t.scenarios) {
		ot(F(e, "scenario command row"), [
			"scenario_key",
			"name",
			"rationale",
			"assumptions"
		]);
		let t = lt(e, r);
		P(z(t, e) && !i.has(t.scenario_key), "normalized unique scenario command"), i.add(t.scenario_key);
	}
	return t;
}
function dt(e) {
	let t = F(e.baseline, "preview baseline");
	return P(Array.isArray(e.scenarios), "preview scenarios"), ut({
		schema_version: e.schema_version,
		baseline_run_id: t.run_id,
		scenarios: e.scenarios.map((t) => lt(t, e.schema_version === "commercial-scenario-preview-v1"))
	});
}
function ft(e, t) {
	return P(Array.isArray(e), t), e;
}
function pt(e) {
	return e === null || p(e);
}
function mt(e) {
	return L(e) && e.toLowerCase() === e;
}
function V(e) {
	P((e.schema_version === it && e.serialization_version === at || e.schema_version === "commercial-scenario-preview-v1" && e.serialization_version === "scenario-preview-json-v1") && e.persisted === !1 && I(e.scenario_definition_version) && I(e.calculation_version), "preview envelope versions");
	let t = F(e.baseline, "baseline evidence");
	P(mt(t.case_id) && mt(t.run_id) && fe(t.revision) && pe(t.input_hash) && pe(t.payload_hash), "baseline evidence identity");
	let n = F(t.assessment, "original assessment"), r = F(e.fingerprint, "preview fingerprint");
	P(r.algorithm === "sha256" && pe(r.value) && r.content === "baseline_identity+payload_hash+normalized_command+policy_snapshot+versions", "preview fingerprint");
	let i = F(e.selected_period, "selected operating period");
	P(R(i.period_start) && R(i.period_end) && i.period_start <= i.period_end && R(e.assumptions_as_of) && i.period_end <= e.assumptions_as_of, "preview dates"), P(z(e.selected_period, n.selected_period) && e.assumptions_as_of === n.assumptions_as_of && z(e.policy_snapshot, n.policy_snapshot), "baseline period and retained policy");
	let a = F(n.normalized_input, "baseline input");
	return P(z(e.units, a.units), "baseline units"), P(ft(e.held_fixed_assumptions, "held fixed assumptions").length > 0 && e.held_fixed_assumptions.every(I) && I(e.disclaimer), "preview explanation"), dt(e), {
		b: t,
		a: n
	};
}
function ht(e, t, n) {
	let r = F(e, "scenario preview");
	he(r, 0, 100);
	let { b: i, a } = V(r);
	P(r.schema_version === it && r.scenario_definition_version === "commercial-scenario-definition-v2" && r.calculation_version === "commercial-calculation-v2", "supported live scenario definition");
	let o = N(a);
	t && P(i.case_id === t.snapshot.case_id && i.revision === t.snapshot.revision && i.run_id === t.snapshot.run_id && i.input_hash === t.snapshot.input_hash && i.payload_hash === t.snapshot.payload_hash && z(o, t.snapshot.assessment), "selected original baseline"), n && P(z(dt(r), ut(n)), "reviewed normalized command");
	for (let e of r.scenarios) gt(e, r, o);
	return r;
}
function gt(e, t, n) {
	let r = F(e, "scenario result"), i = lt(r);
	P(z({
		scenario_key: r.scenario_key,
		name: r.name,
		rationale: r.rationale,
		assumptions: r.assumptions
	}, i) && r.coverage_basis === "stressed_latest_period_current_pro_forma", "normalized projection command/basis");
	let a = F(r.projection_inputs, "projected inputs"), o = n.normalized_input;
	ie({
		...o,
		years: [...o.years.slice(0, -1), a.operating],
		proposed_loan: a.proposed_loan,
		existing_debt: a.existing_debt,
		guarantors: a.guarantors,
		working_capital: a.working_capital
	});
	for (let e of [
		"existing_debt",
		"guarantors",
		"working_capital"
	]) P(z(a[e], o[e]), "held-fixed projected inputs");
	let s = F(a.operating, "projected operating"), c = F(a.proposed_loan, "projected loan"), l = o.years[o.years.length - 1];
	for (let e of S) [
		"gross_receipts",
		"cogs",
		"operating_expense_excl_dna_interest_comp"
	].includes(e) || P(s[e] === l[e], "held-fixed financial lines");
	P(s.period_start === l.period_start && s.period_end === l.period_end, "projected period");
	for (let e of Object.keys(o.proposed_loan)) e !== "annual_rate" && P(c[e] === o.proposed_loan[e], "held-fixed loan");
	let u = F(r.current_facts, "projected facts"), d = [];
	for (let e of C) {
		let t = ae(u[e]), r = e === "k1_history" || e === "k1_ratio_difference", i = r ? "baseline." + n.current_facts[e].fact_id : ["ordinary_business_income", "ebitda"].includes(e) ? `projection.operating.${e}` : `projection.current.${e}`;
		P(t.fact_id === i && (r ? z(t, {
			...n.current_facts[e],
			fact_id: i
		}) : pt(t.raw_value)), "projected fact identity/type/observed history"), d.push(t);
	}
	let f = ft(r.guarantor_contributions, "projected guarantors");
	P(f.length === o.guarantors.length, "guarantor count"), f.forEach((e, t) => {
		let n = F(e, "guarantor contribution");
		P(n.guarantor_index === t && n.name === o.guarantors[t].name, "guarantor identity");
		for (let e of [
			"business_ebitda",
			"outside_income",
			"personal_debt"
		]) {
			let r = ae(n[e]);
			P(r.fact_id === `projection.current.guarantors.${t}.${e}` && pt(r.raw_value), "projected guarantor fact"), d.push(r);
		}
	});
	let m = ne(r.decision);
	P(m.policy_version === n.policy_snapshot.version, "retained decision policy");
	let h = ft(r.calculation_trace, "projection trace"), g = /* @__PURE__ */ new Map();
	for (let e of h) {
		let t = F(e, "trace row"), n = ae(t);
		P(I(t.definition_id) && I(t.expression) && !g.has(n.fact_id), "trace identity"), g.set(n.fact_id, n), ft(t.operands, "trace operands");
	}
	for (let e of n.calculation_trace) {
		let t = {
			...e,
			fact_id: "baseline." + e.fact_id,
			operands: e.operands.map((e) => ({
				...e,
				reference: e.reference_type === "fact" ? "baseline." + e.reference : e.reference_type === "input" ? "/baseline/assessment/normalized_input" + e.reference : e.reference
			}))
		};
		P(z(g.get(t.fact_id), t), "retained observed trace identity");
	}
	for (let e of h) for (let n of F(e, "trace row").operands) {
		let e = F(n, "operand");
		if (P(I(e.reference) && I(e.unit) && (e.raw_value === null || ue(e.raw_value) || I(e.raw_value)), "operand value"), e.reference_type === "fact") {
			let t = g.get(e.reference);
			P(t && t.raw_value === e.raw_value && t.unit === e.unit, "referenced scenario fact");
		} else {
			P(["input", "policy"].includes(String(e.reference_type)) && e.reference.startsWith("/"), "operand reference");
			let n = {
				...r,
				baseline: t.baseline,
				policy_snapshot: t.policy_snapshot
			};
			for (let t of e.reference.slice(1).split("/")) {
				let e = _t(n);
				P(Object.prototype.hasOwnProperty.call(e, t), "scenario operand path"), n = e[t];
			}
			P(n === e.raw_value, "scenario operand value");
		}
	}
	for (let e of d) {
		let t = g.get(e.fact_id);
		P(t && [
			"fact_id",
			"raw_value",
			"reported_value",
			"unit",
			"display_precision",
			"status",
			"explanation"
		].every((n) => t[n] === e[n]), "fact/trace fields");
	}
	let _ = ft(r.comparisons, "metric comparisons");
	P(_.length === C.length - 1, "comparison count");
	let v = /* @__PURE__ */ new Set();
	for (let e of _) {
		let t = F(e, "metric comparison");
		P(I(t.metric) && C.includes(t.metric) && t.metric !== "k1_history" && !v.has(t.metric), "compared metric identity"), v.add(t.metric);
		let r = n.current_facts[t.metric], i = ae(u[t.metric]);
		P(t.baseline_fact_id === "baseline." + r.fact_id && t.projected_fact_id === i.fact_id && t.baseline_value === r.raw_value && t.projected_value === i.raw_value && t.unit === i.unit && pt(t.delta), "comparison fact links"), P(r.raw_value === null || i.raw_value === null ? t.delta === null && I(t.delta_explanation) : p(t.delta) && t.delta_explanation === null, "comparison availability");
		let a = m.factors.find((e) => e.name === (t.metric === "uca_cash_flow" ? "uca_positive" : t.metric));
		if ([
			"dscr",
			"fccr",
			"global_dscr",
			"uca_cash_flow"
		].includes(t.metric)) {
			let e = F(t.policy_headroom, "policy headroom");
			P(a && e.comparison_operator === a.comparison_operator && e.approval_threshold === a.threshold && e.decline_threshold === a.decline_threshold, "headroom policy");
			for (let t of [
				"baseline_approval",
				"projected_approval",
				"baseline_decline",
				"projected_decline"
			]) P(pt(e[t]), "finite headroom");
		} else P(t.policy_headroom === null, "non-policy headroom");
	}
	for (let e of m.factors) {
		let t = e.name === "uca_positive" ? "uca_cash_flow" : e.name, r = n.decision.factors.find((t) => t.name === e.name);
		P(e.raw_value === ae(u[t]).raw_value && r && [
			"threshold",
			"decline_threshold",
			"comparison_operator",
			"weight",
			"source"
		].every((t) => e[t] === r[t]), "scenario factor fact and retained policy"), t === "k1_history" && P(z(e, r), "held-fixed observed K-1 factor");
	}
	let y = ft(r.factor_changes, "factor changes");
	P(y.length === m.factors.length, "factor change count");
	let b = /* @__PURE__ */ new Set();
	for (let e of y) {
		let t = F(e, "factor change"), r = n.decision.factors.find((e) => e.name === t.name), i = m.factors.find((e) => e.name === t.name);
		P(I(t.name) && !b.has(t.name) && r && i && z(t.baseline, r) && z(t.projected, i) && t.changed === !z(r, i) && t.basis === (t.name === "k1_history" ? "observed_history" : "projected_current"), "factor change links"), b.add(t.name), P(t.projected_fact_id === ae(u[t.name === "uca_positive" ? "uca_cash_flow" : t.name]).fact_id, "factor projected reference");
	}
	let x = F(r.outcome_change, "outcome change");
	P(x.baseline === n.decision.outcome && x.projected === m.outcome && x.changed === (x.baseline !== x.projected), "outcome change links");
	let w = ft(r.reason_changes, "reason changes"), T = Array.from(new Set([...n.decision.reasons, ...m.reasons].map((e) => e.code))).filter((e) => !z(n.decision.reasons.find((t) => t.code === e) ?? null, m.reasons.find((t) => t.code === e) ?? null));
	P(w.length === T.length, "reason changes count");
	let E = /* @__PURE__ */ new Set();
	for (let e of w) {
		let t = F(e, "reason change"), r = n.decision.reasons.find((e) => e.code === t.code) ?? null, i = m.reasons.find((e) => e.code === t.code) ?? null;
		P(I(t.code) && T.includes(t.code) && !E.has(t.code) && z(t.baseline, r) && z(t.projected, i) && t.change === (r === null ? "added" : i === null ? "removed" : "changed"), "reason change links"), E.add(t.code);
	}
}
function _t(e) {
	return P(typeof e == "object" && !!e, "operand path object"), e;
}
function vt(e, t) {
	let n = F(e, "original comparison");
	he(n, 0, 100), P(["commercial-scenario-comparison-v1", "commercial-scenario-comparison-v2"].includes(String(n.schema_version)) && n.storage_serialization_version === "scenario-comparison-json-v1" && n.persisted === !0 && mt(n.comparison_id) && mt(n.case_id) && mt(n.baseline_run_id) && fe(n.baseline_revision) && pe(n.payload_hash), "comparison storage identity"), P(me(n.recorded_at) && /^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{6}\+00:00$/.test(n.recorded_at) && de(n.actor), "comparison recording time/actor"), we(n.recording), P(t === `"scenario-comparison-json-v1:${n.case_id}:${n.comparison_id}:${n.payload_hash}"`, "comparison ETag");
	let r = F(n.preview, "original preview"), { b: i, a } = V(r);
	P(i.case_id === n.case_id && i.revision === n.baseline_revision && i.run_id === n.baseline_run_id, "inner/outer original baseline");
	let o = r.schema_version === it && r.scenario_definition_version === "commercial-scenario-definition-v2" && r.calculation_version === "commercial-calculation-v2" && a.schema_version === "commercial-assessment-v2" && a.calculation_version === "commercial-calculation-v2" && a.serialization_version === "assessment-json-v2";
	return {
		record: n,
		etag: t,
		preview: o ? ht(r) : null,
		compatibility: o ? null : `Original definition: ${r.scenario_definition_version} / ${r.calculation_version}; baseline ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON remains available; typed projection and new preview are unavailable.`
	};
}
function yt(e, t) {
	let n = F(e, "comparison page");
	he(n, 0, 100);
	let r = ft(n.items, "comparison summaries");
	P(r.length <= 25 && (n.next_cursor === null || I(n.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(n.next_cursor)), "bounded comparison page/cursor");
	let i = /* @__PURE__ */ new Set();
	for (let e of r) {
		let n = F(e, "comparison summary");
		P(n.case_id === t && mt(n.comparison_id) && mt(n.baseline_run_id) && fe(n.baseline_revision) && me(n.recorded_at) && pe(n.preview_fingerprint) && !i.has(String(n.comparison_id)), "summary identity"), i.add(String(n.comparison_id)), P(["commercial-scenario-comparison-v1", "commercial-scenario-comparison-v2"].includes(String(n.schema_version)) && n.storage_serialization_version === "scenario-comparison-json-v1" && (n.preview_schema_version === it && n.preview_serialization_version === at || n.preview_schema_version === "commercial-scenario-preview-v1" && n.preview_serialization_version === "scenario-preview-json-v1") && I(n.policy_version) && I(n.scenario_definition_version) && I(n.calculation_version), "summary versions");
		let r = ft(n.scenarios, "scenario summaries"), a = /* @__PURE__ */ new Set();
		P(r.length >= 1 && r.length <= 10 && n.scenario_count === r.length, "scenario count");
		for (let e of r) {
			let t = F(e, "scenario summary");
			P(I(t.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(t.scenario_key) && !a.has(t.scenario_key) && st(t.name, 120) === t.name, "summary command"), a.add(t.scenario_key);
		}
	}
	return n;
}
//#endregion
//#region src/caseRecovery.ts
var bt = "spreadline.pending-write.v1", xt = "spreadline.case-selection.v1", St = 1e6, Ct = 21e5;
function wt(e, t = Xe) {
	let n = F(e, "pending write");
	if (n.version !== "scenario-comparison-write-v1") return Ot(e, t);
	P(n.kind === "comparison" && L(n.id) && n.apiBase === t && I(n.body) && Dt(n.body) <= St, "comparison recovery envelope");
	let r = ut(JSON.parse(n.body));
	P(["commercial-scenario-comparison-create-v1", "commercial-scenario-comparison-create-v2"].includes(r.schema_version) && JSON.stringify(r) === n.body && L(n.caseId) && fe(n.baselineRevision) && n.baselineRunId === r.baseline_run_id && pe(n.baselinePayloadHash), "comparison recovery identity/command");
	let i = F(n.context, "comparison recovery context");
	return P(R(i.period_start) && R(i.period_end) && R(i.assessment_as_of) && i.period_start <= i.period_end && i.period_end <= i.assessment_as_of && I(i.policy_version) && I(i.scenario_definition_version) && I(i.calculation_version), "comparison recovery dates/versions"), P(Object.keys(n).length === 10 && [
		"version",
		"kind",
		"id",
		"apiBase",
		"body",
		"caseId",
		"baselineRevision",
		"baselineRunId",
		"baselinePayloadHash",
		"context"
	].every((e) => e in n), "comparison recovery fields"), P(Object.keys(i).length === 6 && [
		"period_start",
		"period_end",
		"assessment_as_of",
		"policy_version",
		"scenario_definition_version",
		"calculation_version"
	].every((e) => e in i), "comparison context fields"), Object.freeze(i), Object.freeze(n);
}
function Tt(e) {
	let t = ht(e), n = {
		...dt(t),
		schema_version: "commercial-scenario-comparison-create-v2",
		expected_preview_fingerprint: t.fingerprint.value
	};
	return wt({
		version: "scenario-comparison-write-v1",
		kind: "comparison",
		id: crypto.randomUUID(),
		apiBase: Xe,
		body: JSON.stringify(n),
		caseId: t.baseline.case_id,
		baselineRevision: t.baseline.revision,
		baselineRunId: t.baseline.run_id,
		baselinePayloadHash: t.baseline.payload_hash,
		context: {
			...t.selected_period,
			assessment_as_of: t.assumptions_as_of,
			policy_version: t.policy_snapshot.version,
			scenario_definition_version: t.scenario_definition_version,
			calculation_version: t.calculation_version
		}
	});
}
function Et() {
	return et();
}
function Dt(e) {
	return new TextEncoder().encode(e).length;
}
function Ot(e, t = Xe) {
	let n = F(e, "recovery operation");
	P(n.version === "case-write-v1" && L(n.id) && n.apiBase === t && I(n.body) && Dt(n.body) <= St, "recovery version, backend or size");
	let r = JSON.parse(n.body);
	P(JSON.stringify(r) === n.body, "unchanged canonical browser command");
	let i = [
		"version",
		"id",
		"apiBase",
		"body",
		"kind"
	];
	if (n.kind === "create") xe(r);
	else {
		P(n.kind === "edit" && L(n.caseId) && fe(n.baseRevision), "edit recovery identity"), P(I(n.etag) && RegExp(`^"case-json-v1:${n.caseId}:${n.baseRevision}:[0-9a-f]{64}"$`).test(n.etag), "edit recovery ETag");
		let e = Se(r), t = F(n.review, "review field"), a = F(n.context, "review context");
		P(t.path === e.field_path && I(t.label) && I(t.period) && (p(t.value) || typeof t.value == "number" && Number.isFinite(t.value)) && [
			"USD",
			"%",
			"months"
		].includes(String(t.unit)), "recovery review");
		for (let e of ["min", "max"]) P(t[e] === void 0 || p(t[e]) || typeof t[e] == "number" && Number.isFinite(t[e]), "field range");
		P(t.integer === void 0 || typeof t.integer == "boolean", "field integer"), P(Object.keys(t).every((e) => [
			"path",
			"label",
			"period",
			"value",
			"unit",
			"min",
			"max",
			"integer"
		].includes(e)), "review fields");
		let o = ye(e.field_path), s = o[0], c = o[o.length - 1], l = ["annual_rate", "ownership_percentage"].includes(c) ? "decimal fraction" : c === "term_months" ? "months" : "USD dollars";
		P(R(a.assessment_as_of) && a.basis === (s === "years" ? "annual_financials" : s === "working_capital" ? "working_capital" : "current_assumptions") && a.unit === l && t.unit === (l === "decimal fraction" ? "%" : l === "months" ? "months" : "USD"), "recovery context"), P(["years", "working_capital"].includes(s) ? R(a.period_start) && R(a.period_end) && a.period_start <= a.period_end && a.period_end <= a.assessment_as_of : a.period_start === null && a.period_end === null, "recovery period"), P(s === "guarantors" ? a.guarantor_index === Number(o[1]) && I(a.guarantor_name) : a.guarantor_index === null && a.guarantor_name === null, "recovery guarantor"), P(Object.keys(a).length === 7 && [
			"basis",
			"assessment_as_of",
			"period_start",
			"period_end",
			"guarantor_index",
			"guarantor_name",
			"unit"
		].every((e) => e in a), "recovery context fields"), i.push("caseId", "baseRevision", "etag", "review", "context");
	}
	P(Object.keys(n).length === i.length && Object.keys(n).every((e) => i.includes(e)), "recovery fields");
	let a = n;
	return a.kind === "edit" && (Object.freeze(a.review), Object.freeze(a.context)), Object.freeze(a);
}
function kt(e, t) {
	let n = xe({
		input: e,
		rationale: _e(t)
	});
	return Ot({
		version: "case-write-v1",
		id: crypto.randomUUID(),
		apiBase: Xe,
		kind: "create",
		body: JSON.stringify(n)
	});
}
function At(e, t, n) {
	P(e.assessment, "supported saved assessment");
	let r = be(e.assessment.normalized_input, t.path);
	P(_(r.value, t.prior) && _(n.value, t.prior) && n.path === t.path && !_(t.next, t.prior), "reviewed base input");
	let i = Se({
		field_path: t.path,
		new_value: t.next,
		rationale: _e(t.rationale)
	});
	return Ot({
		version: "case-write-v1",
		id: crypto.randomUUID(),
		apiBase: Xe,
		kind: "edit",
		body: JSON.stringify(i),
		caseId: e.snapshot.case_id,
		baseRevision: e.snapshot.revision,
		etag: e.etag,
		review: { ...n },
		context: r.context
	});
}
function jt(e, t) {
	try {
		P(e, "browser recovery storage");
		let n = wt(t), r = e.getItem(bt);
		r && P(z(wt(JSON.parse(r)), n), "another unresolved operation");
		let i = JSON.stringify(n);
		P(Dt(i) <= Ct, "recovery journal size"), e.setItem(bt, i), P(e.getItem(bt) === i, "persisted recovery record");
	} catch {
		throw Error("This tab could not keep the write for recovery. Nothing was sent. Resolve its pending record or enable browser session storage before saving.");
	}
}
function Mt(e, t = Xe) {
	try {
		if (!e) return {
			operation: null,
			error: "This browser cannot keep a saved write for recovery. Saved reads and unsaved assessment remain available."
		};
		let n = e.getItem(bt);
		return n ? (P(Dt(n) <= Ct, "recovery size"), {
			operation: wt(JSON.parse(n), t),
			error: ""
		}) : {
			operation: null,
			error: ""
		};
	} catch {
		return {
			operation: null,
			error: "This tab has recovery tracking that cannot be safely restored for this backend. Check saved cases before discarding tracking; a previous write might already be saved."
		};
	}
}
function Nt(e, t) {
	P(e, "browser recovery storage");
	let n = e.getItem(bt);
	n && P(wt(JSON.parse(n)).id === t, "matching recovery record"), e.removeItem(bt), P(e.getItem(bt) === null, "cleared recovery record");
}
function Pt(e) {
	P(e, "browser recovery storage"), e.removeItem(bt), P(e.getItem(bt) === null, "discarded recovery record");
}
function Ft(e) {
	try {
		let t = e?.getItem(xt);
		if (!t || t.length > 500) return null;
		let n = F(JSON.parse(t), "saved selection");
		return P(n.version === "case-selection-v1" && n.apiBase === Xe && L(n.caseId) && (n.revision === "latest" || fe(n.revision)), "saved selection identity"), P(Object.keys(n).length === 4, "saved selection fields"), {
			caseId: n.caseId,
			revision: n.revision
		};
	} catch {
		return null;
	}
}
function It(e, t) {
	try {
		t ? e?.setItem(xt, JSON.stringify({
			version: "case-selection-v1",
			apiBase: Xe,
			...t
		})) : e?.removeItem(xt);
	} catch {}
}
//#endregion
//#region src/caseApi.ts
var Lt = class extends Error {
	status;
	code;
	certain;
	retryAfter;
	constructor(e, t = 0, n = "outcome_uncertain", r = !1, i = null) {
		super(e), this.status = t, this.code = n, this.certain = r, this.retryAfter = i, this.name = "CaseApiError";
	}
};
function Rt(e) {
	return e instanceof Lt ? e : new Lt(e instanceof Error ? e.message : String(e));
}
async function zt(e, t, n) {
	let r;
	try {
		r = await tt(e, t, n);
	} catch {
		throw new Lt("The response was lost or unavailable. Retry the exact saved write if one is pending.");
	}
	let i;
	try {
		i = await r.json();
	} catch {
		throw new Lt(`Saved-case service returned an unreadable response (${r.status}).`, r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null, t = "request_failed", n = `Saved-case request failed (${r.status}).`;
		throw e && typeof e == "object" && !Array.isArray(e) ? ("code" in e && typeof e.code == "string" && (t = e.code), "message" in e && typeof e.message == "string" && (n = e.message)) : typeof e == "string" ? n = e : Array.isArray(e) && (n = e.map((e) => e && typeof e == "object" ? `${Array.isArray(e.loc) ? e.loc.join(".") : "input"}: ${String(e.msg ?? "Invalid input")}` : "Invalid input").join("; ")), t === "storage_not_configured" && (n = "Saved cases are not enabled for this local workspace. You can continue with unsaved assessments."), new Lt(n, r.status, t, [
			400,
			404,
			412,
			413,
			422,
			428
		].includes(r.status), r.headers.get("Retry-After"));
	}
	return {
		response: r,
		body: i
	};
}
function H(e, t) {
	return P(L(e) && (t === "latest" || fe(t)), "requested case/revision"), `/cases/${encodeURIComponent(e)}${t === "latest" ? "" : `/revisions/${t}`}`;
}
async function Bt(e, t, n, r = fetch) {
	let { response: i, body: a } = await zt(H(e, t), { signal: n }, r), o = Ce(a, i.headers.get("ETag"));
	return P(o.snapshot.case_id === e && (t === "latest" || o.snapshot.revision === t), "requested snapshot identity"), o;
}
async function Vt(e, t, n = fetch) {
	let r = Ot(e), i = {
		"Content-Type": "application/json",
		"Idempotency-Key": r.id
	};
	r.kind === "edit" && (i["If-Match"] = r.etag);
	let { response: a, body: o } = await zt(r.kind === "create" ? "/cases" : `${H(r.caseId, "latest")}/revisions`, {
		method: "POST",
		headers: i,
		body: r.body,
		signal: t
	}, n);
	try {
		P(a.status === 201 && ["true", "false"].includes(a.headers.get("Idempotency-Replayed") ?? ""), "accepted receipt status/replay header");
		let e = Ce(o, a.headers.get("ETag")), t = e.snapshot;
		if (r.kind === "create") {
			let e = xe(JSON.parse(r.body));
			P(t.revision === 1 && t.event.kind === "creation" && t.event.rationale === e.rationale && z(t.normalized_input, e.input), "creation receipt command");
		} else {
			let e = Se(JSON.parse(r.body));
			P(t.case_id === r.caseId && t.parent_revision === r.baseRevision && t.revision === r.baseRevision + 1 && t.event.field_path === e.field_path && t.event.after === e.new_value && t.event.before === r.review.value && t.event.rationale === e.rationale && z(t.event.context, r.context), "edit receipt command"), P(be(t.normalized_input, e.field_path).value === e.new_value, "accepted edited input");
		}
		return {
			view: e,
			replayed: a.headers.get("Idempotency-Replayed") === "true"
		};
	} catch (e) {
		throw new Lt(`The write may be saved, but its receipt could not be verified: ${e instanceof Error ? e.message : String(e)}`, a.status);
	}
}
var Ht = (e) => `?${new URLSearchParams({
	limit: "25",
	...e ? { after: e } : {}
})}`;
async function Ut(e, t, n = fetch) {
	let { body: r } = await zt(`/cases${Ht(e)}`, { signal: t }, n);
	return De(r);
}
async function Wt(e, t, n, r = fetch) {
	let { body: i } = await zt(`${H(e, "latest")}/revisions${Ht(t)}`, { signal: n }, r);
	return Oe(i, e);
}
async function Gt(e, t, n = fetch) {
	let { body: r } = await zt(`${H(e.snapshot.case_id, e.snapshot.revision)}/replay`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
		signal: t
	}, n);
	return ke(r, e);
}
//#endregion
//#region src/SavedCases.tsx
function Kt(e, t, n) {
	let r = {
		key: e,
		items: [],
		next: null,
		loading: !0,
		error: ""
	}, [i, a] = (0, x.useState)(r), o = (0, x.useRef)(e);
	o.current = e;
	let s = (0, x.useRef)(t);
	s.current = t;
	let c = (0, x.useRef)(null), l = (0, x.useRef)(0), u = (0, x.useRef)(/* @__PURE__ */ new Set());
	async function d(t) {
		if (t && c.current) return;
		t || (c.current?.abort(), u.current.clear());
		let i = new AbortController();
		c.current = i;
		let d = ++l.current, f = e, p = s.current;
		a((e) => t ? {
			...e,
			loading: !0,
			error: ""
		} : r);
		try {
			let e = await p(t, i.signal);
			if (f !== o.current || d !== l.current || i.signal.aborted) return;
			if (e.next_cursor && (e.next_cursor === t || u.current.has(e.next_cursor))) throw Error("Saved pagination returned a repeated cursor. Refresh the list.");
			e.next_cursor && u.current.add(e.next_cursor), a((r) => {
				let i = new Map((t ? r.items : []).map((e) => [n(e), e]));
				for (let t of e.items) i.set(n(t), t);
				return {
					key: f,
					items: [...i.values()],
					next: e.next_cursor,
					loading: !1,
					error: ""
				};
			});
		} catch (e) {
			f === o.current && d === l.current && !i.signal.aborted && a((t) => ({
				...t,
				loading: !1,
				error: Rt(e).message
			}));
		} finally {
			c.current === i && (c.current = null);
		}
	}
	return (0, x.useEffect)(() => (d(null), () => {
		l.current++, c.current?.abort(), c.current = null;
	}), [e]), {
		...i.key === e ? i : r,
		refresh: () => void d(null),
		more: () => {
			i.next && d(i.next);
		}
	};
}
function qt({ onOpen: e, onClose: t }) {
	let n = Kt("cases", Ut, (e) => e.case_id);
	return /* @__PURE__ */ (0, B.jsxs)("section", {
		className: "panel caseList",
		"aria-label": "Saved cases",
		children: [
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h2", { children: "Saved cases" }), /* @__PURE__ */ (0, B.jsx)("p", { children: "Newest creations first · local saved assessments" })] }), /* @__PURE__ */ (0, B.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, B.jsx)("button", {
						onClick: n.refresh,
						children: "Refresh saved cases"
					}), /* @__PURE__ */ (0, B.jsx)("button", {
						onClick: t,
						children: "Close saved cases"
					})]
				})]
			}),
			n.loading && /* @__PURE__ */ (0, B.jsx)("p", {
				role: "status",
				children: "Loading saved cases…"
			}),
			n.error && /* @__PURE__ */ (0, B.jsx)("p", {
				role: "alert",
				children: n.error
			}),
			!n.loading && !n.error && !n.items.length && /* @__PURE__ */ (0, B.jsx)("p", { children: "No saved cases yet. Save an accepted dated assessment to begin." }),
			n.items.map((t) => /* @__PURE__ */ (0, B.jsxs)("article", {
				className: "caseRow",
				children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [
					/* @__PURE__ */ (0, B.jsx)("h3", { children: t.borrower_name }),
					/* @__PURE__ */ (0, B.jsx)("code", { children: t.case_id }),
					/* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Created ",
						t.created_at,
						" · Revision ",
						t.revision,
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						"Last recorded ",
						t.recorded_at
					] })
				] }), /* @__PURE__ */ (0, B.jsx)("button", {
					"aria-label": `Open ${t.borrower_name} case ${t.case_id}`,
					onClick: () => e({
						caseId: t.case_id,
						revision: "latest"
					}),
					children: "Open case"
				})]
			}, t.case_id)),
			n.next && /* @__PURE__ */ (0, B.jsx)("button", {
				disabled: n.loading,
				onClick: n.more,
				children: "Load more saved cases"
			})
		]
	});
}
function Jt({ saved: e, active: t, onOpen: n }) {
	let r = e.view.snapshot, i = t ? e.selection === "latest" ? `Revision ${r.revision} · Latest when fetched` : e.selection === "revision" ? `Historical revision ${r.revision}` : `Acknowledged revision ${r.revision} · Latest unconfirmed` : `Previous saved revision ${r.revision} (inactive)`;
	return /* @__PURE__ */ (0, B.jsxs)("section", {
		className: "savedContext",
		"aria-label": "Saved revision context",
		children: [
			/* @__PURE__ */ (0, B.jsx)("strong", { children: i }),
			/* @__PURE__ */ (0, B.jsxs)("span", { children: [
				"Case ",
				/* @__PURE__ */ (0, B.jsx)("code", { children: r.case_id }),
				" · Run ",
				/* @__PURE__ */ (0, B.jsx)("code", { children: r.run_id })
			] }),
			/* @__PURE__ */ (0, B.jsxs)("span", { children: [
				"Recorded ",
				r.recorded_at,
				" · assessment as of",
				" ",
				r.event.context.assessment_as_of,
				e.headRevision !== null && e.headRevision > r.revision ? ` · Latest known revision ${e.headRevision}` : ""
			] }),
			/* @__PURE__ */ (0, B.jsx)("button", {
				onClick: () => n({
					caseId: r.case_id,
					revision: "latest"
				}),
				children: "Open latest"
			})
		]
	});
}
function Yt({ view: e }) {
	let t = e.snapshot;
	return /* @__PURE__ */ (0, B.jsxs)("details", { children: [
		/* @__PURE__ */ (0, B.jsx)("summary", { children: "Stored run and recording metadata" }),
		/* @__PURE__ */ (0, B.jsxs)("p", { children: [
			"Original run ",
			t.run_id,
			" · recorded ",
			t.recorded_at
		] }),
		/* @__PURE__ */ (0, B.jsxs)("p", { children: [
			"Source status: ",
			t.recording.source_status,
			" ",
			t.recording.source_revision ?? "· exact build revision not supplied"
		] }),
		/* @__PURE__ */ (0, B.jsx)("p", { children: "Stored hashes are local consistency identifiers; they do not authenticate documents or people." }),
		/* @__PURE__ */ (0, B.jsx)("pre", { children: JSON.stringify({
			input_hash: t.input_hash,
			payload_hash: t.payload_hash,
			storage_serialization_version: t.storage_serialization_version,
			recording: t.recording
		}, null, 2) })
	] });
}
function Xt({ saved: e, active: t, onOpen: n }) {
	let r = e.view, i = r.snapshot, a = i.event, o = Kt(`${i.case_id}:${i.revision}`, (e, t) => Wt(i.case_id, e, t), (e) => String(e.revision)), [s, c] = (0, x.useState)({
		key: i.run_id,
		result: null,
		error: "",
		loading: !1
	}), l = (0, x.useRef)(null), u = (0, x.useRef)(i.run_id);
	u.current = i.run_id, (0, x.useEffect)(() => (c({
		key: i.run_id,
		result: null,
		error: "",
		loading: !1
	}), () => {
		l.current?.abort(), l.current = null;
	}), [i.run_id]);
	async function d() {
		if (l.current) return;
		let e = new AbortController();
		l.current = e;
		let t = i.run_id;
		c({
			key: t,
			result: null,
			error: "",
			loading: !0
		});
		try {
			let n = await Gt(r, e.signal);
			u.current === t && !e.signal.aborted && c({
				key: t,
				result: n,
				error: "",
				loading: !1
			});
		} catch (n) {
			u.current === t && !e.signal.aborted && c({
				key: t,
				result: null,
				error: Rt(n).message,
				loading: !1
			});
		} finally {
			l.current === e && (l.current = null);
		}
	}
	return /* @__PURE__ */ (0, B.jsxs)("section", {
		className: "panel memo",
		children: [
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, B.jsx)("h2", { children: "Saved revision history" }), /* @__PURE__ */ (0, B.jsx)("button", {
					onClick: o.refresh,
					children: "Refresh revisions"
				})]
			}),
			!t && /* @__PURE__ */ (0, B.jsx)("p", { children: "Previous saved selection; its recommendation is inactive." }),
			/* @__PURE__ */ (0, B.jsxs)("p", { children: [
				"Original accepted revisions and server-recorded events. Recorded actor: ",
				a.actor,
				".",
				a.actor === "prototype-demo-unverified" ? " Archived demonstration identity." : " Configured credential identity."
			] }),
			o.loading && /* @__PURE__ */ (0, B.jsx)("p", {
				role: "status",
				children: "Loading revisions…"
			}),
			o.error && /* @__PURE__ */ (0, B.jsx)("p", {
				role: "alert",
				children: o.error
			}),
			/* @__PURE__ */ (0, B.jsx)("div", {
				className: "revisionList",
				children: o.items.map((e) => /* @__PURE__ */ (0, B.jsxs)("article", {
					className: "caseRow",
					children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsxs)("strong", { children: ["Revision ", e.revision] }), /* @__PURE__ */ (0, B.jsxs)("p", { children: [
						e.rationale,
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						e.recorded_at,
						" · Run ",
						e.run_id
					] })] }), /* @__PURE__ */ (0, B.jsxs)("button", {
						"aria-label": `Open revision ${e.revision}`,
						"aria-pressed": e.revision === i.revision,
						onClick: () => n({
							caseId: i.case_id,
							revision: e.revision
						}),
						children: ["Revision ", e.revision]
					})]
				}, e.revision))
			}),
			o.next && /* @__PURE__ */ (0, B.jsx)("button", {
				disabled: o.loading,
				onClick: o.more,
				children: "Load more revisions"
			}),
			/* @__PURE__ */ (0, B.jsxs)("article", {
				className: "savedEvent",
				"aria-label": "Selected recorded event",
				children: [
					/* @__PURE__ */ (0, B.jsxs)("h3", { children: ["Selected recorded event · revision ", i.revision] }),
					/* @__PURE__ */ (0, B.jsx)("strong", { children: a.kind === "creation" ? "Case creation" : a.field_path }),
					a.kind === "edit" && /* @__PURE__ */ (0, B.jsxs)("p", { children: [
						a.before,
						" → ",
						a.after,
						" · ",
						a.context.unit
					] }),
					/* @__PURE__ */ (0, B.jsx)("p", { children: a.rationale }),
					/* @__PURE__ */ (0, B.jsxs)("p", { children: [
						a.context.basis,
						" · as of ",
						a.context.assessment_as_of,
						a.context.period_start ? ` · ${a.context.period_start} – ${a.context.period_end}` : "",
						a.context.guarantor_name === null ? "" : ` · Guarantor ${a.context.guarantor_index}: ${a.context.guarantor_name}`
					] }),
					/* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Recorded ",
						a.recorded_at,
						" · ",
						a.actor
					] })
				]
			}),
			/* @__PURE__ */ (0, B.jsx)("div", {
				className: "actions",
				children: /* @__PURE__ */ (0, B.jsx)("button", {
					disabled: s.loading,
					onClick: () => void d(),
					children: "Check replay"
				})
			}),
			s.key === i.run_id && /* @__PURE__ */ (0, B.jsx)("div", {
				className: "replayResult",
				role: "status",
				children: s.loading ? "Checking the retained policy and definition…" : s.error || (s.result ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
					/* @__PURE__ */ (0, B.jsx)("strong", { children: {
						matched: "Matched",
						mismatch: "Mismatch",
						replay_unavailable: "Replay unavailable"
					}[s.result.status] }),
					/* @__PURE__ */ (0, B.jsx)("p", { children: s.result.explanation }),
					s.result.differences.length > 0 && /* @__PURE__ */ (0, B.jsx)("ul", { children: s.result.differences.map((e) => /* @__PURE__ */ (0, B.jsx)("li", { children: e }, e)) })
				] }) : "Replay is read-only; the original result stays selected.")
			}),
			/* @__PURE__ */ (0, B.jsx)(Yt, { view: r })
		]
	});
}
function Zt({ operation: e }) {
	let t = JSON.parse(e.body);
	return e.kind === "comparison" ? /* @__PURE__ */ (0, B.jsxs)("p", { children: [
		"Proposed comparison · Case ",
		e.caseId,
		" · revision ",
		e.baselineRevision,
		/* @__PURE__ */ (0, B.jsx)("br", {}),
		"Run ",
		e.baselineRunId,
		" · as of ",
		e.context.assessment_as_of,
		/* @__PURE__ */ (0, B.jsx)("br", {}),
		t.scenarios.map((e) => `${e.name}: ${e.rationale}`).join("; ")
	] }) : e.kind === "edit" ? /* @__PURE__ */ (0, B.jsxs)("p", { children: [
		"Proposed ",
		e.review.label,
		": ",
		e.review.value,
		" →",
		" ",
		t.new_value,
		" · ",
		e.review.period,
		" · ",
		e.context.unit,
		/* @__PURE__ */ (0, B.jsx)("br", {}),
		"Rationale: ",
		t.rationale
	] }) : /* @__PURE__ */ (0, B.jsxs)("p", { children: [
		"Proposed creation: ",
		t.input.borrower_name,
		" · as of",
		" ",
		t.input.assessment_as_of,
		/* @__PURE__ */ (0, B.jsx)("br", {}),
		"Rationale: ",
		t.rationale
	] });
}
function Qt({ workspace: e, onDiscard: t, onReview: n, onOpenComparison: r }) {
	let [i, a] = (0, x.useState)("");
	return /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
		e.notice && /* @__PURE__ */ (0, B.jsx)("p", {
			className: "writeNotice",
			role: "status",
			children: e.notice
		}),
		(e.operation || e.recoveryError) && /* @__PURE__ */ (0, B.jsxs)("section", {
			className: "pending",
			"aria-label": "Saved write recovery",
			children: [
				/* @__PURE__ */ (0, B.jsx)("h2", { children: e.inFlight ? e.operation?.kind === "comparison" ? "Saving comparison" : "Saving revision" : e.operation ? "Unconfirmed saved write" : "Saved write recovery unavailable" }),
				e.operation && /* @__PURE__ */ (0, B.jsx)(Zt, { operation: e.operation }),
				/* @__PURE__ */ (0, B.jsx)("p", { children: e.recoveryError || e.writeError?.message || "This tab keeps the original command for exact retry. No new accepted event is recorded until the receipt is verified." }),
				e.writeError?.retryAfter && /* @__PURE__ */ (0, B.jsxs)("p", { children: [
					"Retry after ",
					e.writeError.retryAfter,
					" second(s)."
				] }),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "actions",
					children: [
						e.operation && /* @__PURE__ */ (0, B.jsx)("button", {
							disabled: e.inFlight || e.writeError?.status === 409 && !e.writeError.certain,
							onClick: () => {
								try {
									e.retryWrite(), a("");
								} catch (e) {
									a(e instanceof Error ? e.message : String(e));
								}
							},
							children: "Retry exact write"
						}),
						e.operation?.kind === "edit" && /* @__PURE__ */ (0, B.jsx)("button", {
							onClick: () => void e.openSaved({
								caseId: e.operation.caseId,
								revision: e.operation.baseRevision
							}),
							children: "View stored baseline"
						}),
						e.operation?.kind === "comparison" && /* @__PURE__ */ (0, B.jsx)("button", {
							onClick: () => {
								e.operation?.kind === "comparison" && e.openSaved({
									caseId: e.operation.caseId,
									revision: e.operation.baselineRevision
								});
							},
							children: "View stored baseline"
						}),
						/* @__PURE__ */ (0, B.jsx)("button", {
							disabled: e.inFlight,
							onClick: (e) => t(e.currentTarget),
							children: "Review discarding tracking"
						})
					]
				}),
				i && /* @__PURE__ */ (0, B.jsx)("p", {
					role: "alert",
					children: i
				})
			]
		}),
		e.conflict && /* @__PURE__ */ (0, B.jsxs)("section", {
			className: "pending conflict",
			"aria-label": "Conflicting saved edit",
			children: [
				/* @__PURE__ */ (0, B.jsx)("h2", { children: "Review conflicting edit" }),
				/* @__PURE__ */ (0, B.jsx)(Zt, { operation: e.conflict.operation }),
				/* @__PURE__ */ (0, B.jsx)("p", { children: "The case changed. Nothing from this proposal was accepted. Review the latest field before submitting a fresh revision." }),
				e.conflict.latest ? /* @__PURE__ */ (0, B.jsxs)("p", { children: [
					"Latest stored value:",
					" ",
					be(e.conflict.latest.snapshot.normalized_input, e.conflict.operation.review.path).value,
					" ",
					"· Revision ",
					e.conflict.latest.snapshot.revision
				] }) : /* @__PURE__ */ (0, B.jsx)("p", {
					role: "status",
					children: e.conflict.error || "Loading latest for review…"
				}),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "actions",
					children: [
						/* @__PURE__ */ (0, B.jsx)("button", {
							disabled: !e.conflict.latest || !!e.operation,
							onClick: (e) => n(e.currentTarget),
							children: "Review proposed edit"
						}),
						/* @__PURE__ */ (0, B.jsx)("button", {
							onClick: e.refreshConflict,
							children: "Refresh conflict baseline"
						}),
						/* @__PURE__ */ (0, B.jsx)("button", {
							onClick: e.cancelConflict,
							children: "Cancel proposal"
						})
					]
				})
			]
		}),
		e.rejected && /* @__PURE__ */ (0, B.jsxs)("section", {
			className: "pending",
			children: [
				/* @__PURE__ */ (0, B.jsx)("h2", { children: "Rejected saved proposal" }),
				/* @__PURE__ */ (0, B.jsx)(Zt, { operation: e.rejected }),
				/* @__PURE__ */ (0, B.jsx)("p", { children: e.writeError?.message }),
				/* @__PURE__ */ (0, B.jsx)("button", {
					onClick: e.dismissRejected,
					children: "Dismiss rejected proposal"
				})
			]
		}),
		e.offer && /* @__PURE__ */ (0, B.jsxs)("section", {
			className: "pending",
			children: [
				/* @__PURE__ */ (0, B.jsx)("h2", { children: "Write acknowledged for another selection" }),
				/* @__PURE__ */ (0, B.jsxs)("p", { children: [
					"Case ",
					e.offer.snapshot.case_id,
					" · revision",
					" ",
					e.offer.snapshot.revision,
					". The current selection was preserved."
				] }),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, B.jsx)("button", {
						onClick: () => {
							e.offer && e.openSaved({
								caseId: e.offer.snapshot.case_id,
								revision: e.offer.snapshot.revision
							}), e.dismissOffer();
						},
						children: "Open acknowledged revision"
					}), /* @__PURE__ */ (0, B.jsx)("button", {
						onClick: e.dismissOffer,
						children: "Dismiss acknowledgment"
					})]
				})
			]
		}),
		e.comparisonAck && (e.comparisonAck.scope !== e.state.id || e.comparisonAck.view.record.case_id !== e.state.saved?.view.snapshot.case_id || e.comparisonAck.view.record.baseline_revision !== e.state.saved?.view.snapshot.revision) && /* @__PURE__ */ (0, B.jsxs)("section", {
			className: "pending",
			"aria-label": "Comparison acknowledged for another selection",
			children: [
				/* @__PURE__ */ (0, B.jsx)("h2", { children: "Comparison acknowledged for another selection" }),
				/* @__PURE__ */ (0, B.jsxs)("p", { children: [
					"Original comparison ",
					e.comparisonAck.view.record.comparison_id,
					" · baseline revision ",
					e.comparisonAck.view.record.baseline_revision,
					". The current selection was preserved."
				] }),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, B.jsx)("button", {
						onClick: () => {
							e.comparisonAck && r(e.comparisonAck.view);
						},
						children: "Open acknowledged comparison"
					}), /* @__PURE__ */ (0, B.jsx)("button", {
						onClick: e.dismissComparisonAck,
						children: "Dismiss comparison acknowledgment"
					})]
				})
			]
		})
	] });
}
var $t = /* @__PURE__ */ new Set([
	"preview_changed",
	"storage_upgrade_required",
	"baseline_run_mismatch",
	"baseline_unsupported",
	"baseline_replay_mismatch",
	"baseline_replay_unavailable"
]);
function en(e) {
	return P(L(e), "comparison case locator"), `/cases/${encodeURIComponent(e)}`;
}
function tn(e, t) {
	return P(fe(t), "comparison revision locator"), `${en(e)}/revisions/${t}`;
}
async function nn(e) {
	let t = e.body?.getReader();
	if (!t) throw Error("Missing response body");
	let n = [], r = new TextDecoder("utf-8", { fatal: !0 }), i = 0;
	try {
		for (;;) {
			let { value: e, done: r } = await t.read();
			if (r) break;
			if (i += e.byteLength, i > 16777216) throw Error("Comparison response exceeds 16 MiB");
			n.push(e);
		}
	} catch (e) {
		throw await t.cancel().catch(() => {}), e;
	} finally {
		t.releaseLock();
	}
	let a = new Uint8Array(i), o = 0;
	for (let e of n) a.set(e, o), o += e.byteLength;
	return JSON.parse(r.decode(a));
}
async function rn(e, t, n) {
	let r;
	try {
		r = await tt(e, t, n);
	} catch {
		throw new Lt("The comparison response was lost or unavailable. Keep and retry the exact pending save if one exists.");
	}
	let i;
	try {
		i = await nn(r);
	} catch (e) {
		throw new Lt(`Comparison response could not be read: ${e instanceof Error ? e.message : String(e)}.`, r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null, t = "request_failed", n = `Comparison request failed (${r.status}).`, a = !1;
		e && typeof e == "object" && !Array.isArray(e) && "code" in e && typeof e.code == "string" && "message" in e && typeof e.message == "string" ? (t = e.code, n = e.message, a = !0) : Array.isArray(e) && (n = e.map((e) => e && typeof e == "object" && "msg" in e ? String(e.msg) : "Invalid scenario input").join("; "), a = !0);
		let o = a && ([
			400,
			404,
			413,
			422
		].includes(r.status) || r.status === 409 && $t.has(t));
		throw new Lt(n, r.status, t, o, r.headers.get("Retry-After"));
	}
	return {
		response: r,
		body: i
	};
}
function an(e) {
	let t = ut(e), n = JSON.stringify(t);
	return P(new TextEncoder().encode(n).length <= 1e6, "scenario request byte limit"), n;
}
async function on(e, t, n, r = fetch) {
	P(t.schema_version === "commercial-scenario-preview-v2", "preview command version");
	let { response: i, body: a } = await rn(`${tn(e.snapshot.case_id, e.snapshot.revision)}/scenarios/preview`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: an(t),
		signal: n
	}, r);
	return P(i.status === 200, "preview status"), ht(a, e, t);
}
async function sn(e, t, n = fetch) {
	let r = wt(e);
	P(r.kind === "comparison", "comparison operation kind");
	let { response: i, body: a } = await rn(`${tn(r.caseId, r.baselineRevision)}/scenario-comparisons`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Idempotency-Key": r.id
		},
		body: r.body,
		signal: t
	}, n);
	try {
		P(i.status === 201 && ["true", "false"].includes(i.headers.get("Idempotency-Replayed") ?? ""), "retained receipt status/replay");
		let e = vt(a, i.headers.get("ETag")), t = e.record, n = t.preview, o = ut(JSON.parse(r.body));
		P(t.case_id === r.caseId && t.baseline_revision === r.baselineRevision && t.baseline_run_id === r.baselineRunId && z(dt(n).scenarios, o.scenarios), "original receipt command/baseline");
		let s = n.baseline, c = n.fingerprint;
		return P(s.payload_hash === r.baselinePayloadHash && c.value === o.expected_preview_fingerprint && i.headers.get("Location") === `${en(t.case_id)}/scenario-comparisons/${t.comparison_id}`, "original receipt fingerprint/location"), {
			view: e,
			replayed: i.headers.get("Idempotency-Replayed") === "true"
		};
	} catch (e) {
		throw new Lt(`The comparison may be saved, but its receipt could not be verified: ${e instanceof Error ? e.message : String(e)}`, i.status);
	}
}
async function cn(e, t, n, r = fetch) {
	P(L(t), "comparison locator");
	let { response: i, body: a } = await rn(`${en(e)}/scenario-comparisons/${encodeURIComponent(t)}`, { signal: n }, r);
	P(i.status === 200, "original comparison status");
	let o = vt(a, i.headers.get("ETag"));
	return P(o.record.case_id === e && o.record.comparison_id === t, "requested original comparison"), o;
}
async function ln(e, t, n, r = fetch) {
	P(t === null || /^[A-Za-z0-9_-]{1,512}$/.test(t), "comparison cursor");
	let i = new URLSearchParams({
		limit: "25",
		...t ? { after: t } : {}
	}), { response: a, body: o } = await rn(`${en(e)}/scenario-comparisons?${i}`, { signal: n }, r);
	return P(a.status === 200, "comparison page status"), yt(o, e);
}
//#endregion
//#region src/scenarioSelection.ts
var un = "spreadline.comparison-selection.v1";
function dn(e) {
	try {
		let t = Et()?.getItem(un);
		if (!t || t.length > 500) return null;
		let n = JSON.parse(t);
		return Object.keys(n).length !== 4 || n.version !== "comparison-selection-v1" || n.apiBase !== Xe || n.caseId !== e || !L(n.comparisonId) ? null : n.comparisonId;
	} catch {
		return null;
	}
}
function fn(e, t) {
	try {
		let n = Et();
		t === null ? n?.removeItem(un) : L(e) && L(t) && n?.setItem(un, JSON.stringify({
			version: "comparison-selection-v1",
			apiBase: Xe,
			caseId: e,
			comparisonId: t
		}));
	} catch {}
}
//#endregion
//#region src/useScenarioWorkspace.ts
var pn = {
	revenue: {
		name: "Revenue downside",
		values: [
			"-10",
			"0",
			"0",
			"0"
		]
	},
	cogs: {
		name: "Higher COGS",
		values: [
			"0",
			"10",
			"0",
			"0"
		]
	},
	opex: {
		name: "Higher operating expenses",
		values: [
			"0",
			"0",
			"10",
			"0"
		]
	},
	combined: {
		name: "Combined downside",
		values: [
			"-10",
			"10",
			"10",
			"0"
		]
	},
	rate: {
		name: "Higher proposed rate",
		values: [
			"0",
			"0",
			"0",
			"200"
		]
	}
};
function mn(e) {
	return {
		key: crypto.randomUUID(),
		name: `Scenario ${e}`,
		rationale: "",
		preset: "custom",
		shocks: {
			revenue_change: "0",
			cogs_change: "0",
			operating_expense_change: "0",
			proposed_rate_change_bps: "0"
		}
	};
}
function hn(e) {
	let { state: t } = e, n = t.status === "ready" ? t.saved?.view ?? null : null, r = n?.snapshot, i = `${t.id}:${t.status}:${r?.case_id ?? ""}:${r?.revision ?? ""}:${r?.run_id ?? ""}:${r?.payload_hash ?? ""}`, a = (0, x.useRef)(i);
	a.current = i;
	let o = (0, x.useRef)(0), s = (0, x.useRef)(null), c = (0, x.useRef)(null), l = (0, x.useRef)(0), [u, d] = (0, x.useState)({
		context: i,
		rows: [mn(1)]
	}), [f, p] = (0, x.useState)(null), m = (0, x.useRef)(f);
	m.current = f;
	let [h, g] = (0, x.useState)(!1), [_, v] = (0, x.useState)(""), [y, b] = (0, x.useState)({
		context: i,
		loading: !1,
		error: "",
		view: null
	}), [S, C] = (0, x.useState)(0), w = (0, x.useRef)(0), T = (0, x.useRef)(null), E = (0, x.useRef)(0), D = u.context === i ? u.rows : [], O = f?.context === i ? f : null, k = y.context === i ? y : {
		context: i,
		loading: !1,
		error: "",
		view: null
	}, ee = !!n?.assessment, te = !!(e.operation || e.recoveryError || e.conflict || e.inFlight), A = e.inFlight && e.operation?.kind === "comparison", j = A || !!k.view || k.loading;
	function M() {
		o.current++, s.current?.abort(), s.current = null, m.current = null, p(null), g(!1), v(""), e.clearComparisonError();
	}
	function ne(e, t) {
		j || (M(), d((n) => ({
			context: i,
			rows: n.rows.map((n) => n.key === e ? t(n) : n)
		})));
	}
	function re() {
		if (j || D.length >= 10) return null;
		M();
		let e = mn(D.length + 1);
		return d({
			context: i,
			rows: [...D, e]
		}), e.key;
	}
	function ie(e) {
		j || D.length <= 1 || (M(), d({
			context: i,
			rows: D.filter((t) => t.key !== e)
		}));
	}
	function ae(e, t) {
		ne(e, (e) => {
			let n = pn[t];
			return n ? {
				...e,
				preset: t,
				name: n.name,
				shocks: Object.fromEntries(rt.map((e, t) => [e, n.values[t]]))
			} : {
				...e,
				preset: "custom"
			};
		});
	}
	async function N() {
		if (!n || !ee || j) return;
		M();
		let e = o.current, t = i, r = new AbortController();
		s.current = r;
		try {
			let i = ut({
				schema_version: "commercial-scenario-preview-v2",
				baseline_run_id: n.snapshot.run_id,
				scenarios: D.map((e) => ({
					scenario_key: e.key,
					name: st(e.name, 120),
					rationale: st(e.rationale, 2e3),
					assumptions: Object.fromEntries(rt.map((t) => [t, ct(e.shocks[t], t !== "proposed_rate_change_bps")]))
				}))
			});
			g(!0);
			let s = await on(n, i, r.signal);
			if (t !== a.current || e !== o.current || r.signal.aborted) return;
			let c = {
				context: t,
				generation: e,
				preview: s,
				consumed: !1
			};
			m.current = c, p(c);
		} catch (n) {
			t === a.current && e === o.current && !r.signal.aborted && v(Rt(n).message);
		} finally {
			s.current === r && (s.current = null, g(!1));
		}
	}
	function oe() {
		let t = m.current;
		if (!(!t || t.context !== a.current || t.generation !== o.current || t.consumed || te)) try {
			e.retainComparison(t.preview), T.current = t.generation;
			let n = {
				...t,
				consumed: !0
			};
			m.current = n, p(n), v("");
		} catch (e) {
			v(Rt(e).message);
		}
	}
	function se() {
		A || (M(), d({
			context: i,
			rows: [mn(1)]
		}), c.current?.abort(), l.current++, b({
			context: i,
			loading: !1,
			error: "",
			view: null
		}), r && fn(r.case_id, null));
	}
	async function ce(e) {
		if (!r) return;
		M(), c.current?.abort();
		let t = new AbortController();
		c.current = t;
		let n = ++l.current, o = i;
		b({
			context: o,
			loading: !0,
			error: "",
			view: null
		});
		try {
			let i = await cn(r.case_id, e, t.signal);
			if (o !== a.current || n !== l.current || t.signal.aborted) return;
			b({
				context: o,
				loading: !1,
				error: "",
				view: i
			}), fn(r.case_id, e);
		} catch (e) {
			o === a.current && n === l.current && !t.signal.aborted && b({
				context: o,
				loading: !1,
				error: Rt(e).message,
				view: null
			});
		} finally {
			c.current === t && (c.current = null);
		}
	}
	(0, x.useEffect)(() => {
		M(), T.current = null, E.current = o.current, d({
			context: i,
			rows: [mn(1)]
		}), b({
			context: i,
			loading: !1,
			error: "",
			view: null
		});
		let e = r && dn(r.case_id);
		return e && ce(e), () => {
			o.current++, s.current?.abort(), l.current++, c.current?.abort();
		};
	}, [i]), (0, x.useEffect)(() => {
		let n = e.comparisonAck;
		if (n && n.serial !== w.current && (w.current = n.serial, n.scope === t.id && r && n.view.record.case_id === r.case_id && n.view.record.baseline_revision === r.revision && n.view.record.baseline_run_id === r.run_id)) {
			if (o.current !== (T.current ?? E.current)) {
				e.deferComparisonAck(n.serial), C((e) => e + 1);
				return;
			}
			c.current?.abort(), l.current++, b({
				context: i,
				loading: !1,
				error: "",
				view: n.view
			}), fn(r.case_id, n.view.record.comparison_id), C((e) => e + 1);
		}
	}, [e.comparisonAck]);
	let le = e.comparisonError?.scope === t.id ? e.comparisonError : null;
	return {
		context: i,
		baseline: r,
		view: n,
		supported: ee,
		rows: D,
		busy: h,
		error: _ || le?.message || "",
		errorCode: le?.code,
		canSaveBaseline: e.canSave,
		previewConsumed: !!O?.consumed,
		frozen: A,
		fieldsDisabled: j,
		writeBlocked: te,
		previewResult: O?.preview ?? null,
		original: k,
		refreshSerial: S,
		canRetain: !!O && !O.consumed && O.generation === o.current && !te && !j,
		change: ne,
		add: re,
		remove: ie,
		preset: ae,
		preview: N,
		retain: oe,
		newDraft: se,
		open: ce
	};
}
//#endregion
//#region src/Scenarios.tsx
var gn = {
	ordinary_business_income: "Ordinary business income",
	ebitda: "EBITDA",
	proposed_monthly_payment: "Proposed monthly payment",
	proposed_annual_payment: "Proposed annual payment",
	debt_service: "Business debt service",
	fixed_charge_service: "Fixed charge service",
	global_business_ebitda: "Owned business EBITDA",
	global_outside_income: "Outside income",
	global_personal_debt: "Personal debt",
	global_cash_flow: "Global cash flow",
	global_debt_service: "Global debt service",
	dscr: "DSCR",
	fccr: "Simplified FCCR",
	global_dscr: "Global DSCR",
	net_working_capital_increase: "Working capital increase",
	uca_cash_flow: "UCA cash flow",
	k1_ratio_difference: "Observed K-1 ratio difference",
	k1_history: "Observed K-1 history",
	uca_positive: "UCA positive"
}, _n = [
	"Revenue change (%)",
	"COGS change (%)",
	"Operating expense change (%)",
	"Proposed rate change (bps)"
];
function vn({ title: e, children: t }) {
	let [n, r] = (0, x.useState)(!1);
	return /* @__PURE__ */ (0, B.jsxs)("details", {
		onToggle: (e) => r(e.currentTarget.open),
		children: [/* @__PURE__ */ (0, B.jsx)("summary", { children: e }), n && t()]
	});
}
function yn({ rows: e, render: t, label: n }) {
	let [r, i] = (0, x.useState)(0), a = Math.max(1, Math.ceil(e.length / 50));
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		"aria-label": n,
		children: [
			/* @__PURE__ */ (0, B.jsxs)("p", { children: [
				"Page ",
				r + 1,
				" of ",
				a,
				" · ",
				e.length,
				" rows · up to 50 rows per page"
			] }),
			e.slice(r * 50, (r + 1) * 50).map((e, n) => t(e, r * 50 + n)),
			a > 1 && /* @__PURE__ */ (0, B.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, B.jsxs)("button", {
					disabled: r === 0,
					onClick: () => i(r - 1),
					children: [
						"Previous ",
						n,
						" page"
					]
				}), /* @__PURE__ */ (0, B.jsxs)("button", {
					disabled: r + 1 === a,
					onClick: () => i(r + 1),
					children: [
						"Next ",
						n,
						" page"
					]
				})]
			})
		]
	});
}
function bn({ value: e }) {
	let t = (0, x.useMemo)(() => {
		let t = new TextEncoder().encode(JSON.stringify(e, null, 2)), n = [], r = new TextDecoder("utf-8", { fatal: !0 });
		for (let e = 0; e < t.length;) {
			let i = Math.min(e + 65536, t.length);
			for (; i < t.length && (t[i] & 192) == 128;) i--;
			n.push(r.decode(t.slice(e, i))), e = i;
		}
		return n;
	}, [e]), [n, r] = (0, x.useState)(0);
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "originalComparisonJson",
		children: [
			/* @__PURE__ */ (0, B.jsxs)("p", { children: [
				"Original JSON · page ",
				n + 1,
				" of ",
				t.length,
				" · up to 64 KiB of UTF-8 text per page"
			] }),
			/* @__PURE__ */ (0, B.jsx)("pre", { children: t[n] }),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, B.jsx)("button", {
					disabled: n === 0,
					onClick: () => r(n - 1),
					children: "Previous JSON page"
				}), /* @__PURE__ */ (0, B.jsx)("button", {
					disabled: n + 1 === t.length,
					onClick: () => r(n + 1),
					children: "Next JSON page"
				})]
			})
		]
	});
}
function xn({ row: e }) {
	return /* @__PURE__ */ (0, B.jsxs)("details", { children: [
		/* @__PURE__ */ (0, B.jsxs)("summary", { children: [
			e.fact_id,
			" · ",
			Be(e)
		] }),
		/* @__PURE__ */ (0, B.jsx)("strong", { children: e.definition_id }),
		/* @__PURE__ */ (0, B.jsx)("p", {
			className: "expression",
			children: e.expression
		}),
		e.operands.map((e, t) => /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "operand",
			children: [
				/* @__PURE__ */ (0, B.jsx)("code", { children: e.reference }),
				/* @__PURE__ */ (0, B.jsxs)("span", { children: [
					e.raw_value === null ? "Not applicable" : String(e.raw_value),
					" ",
					e.unit
				] }),
				/* @__PURE__ */ (0, B.jsx)("small", { children: e.reference_type })
			]
		}, t)),
		e.explanation && /* @__PURE__ */ (0, B.jsx)("p", { children: e.explanation })
	] });
}
function Sn(e) {
	return e === null ? "Not applicable" : String(e);
}
function Cn(e) {
	return e === null ? "Not applicable" : String(e);
}
function wn({ preview: e, result: t }) {
	let n = e.baseline.assessment;
	return /* @__PURE__ */ (0, B.jsxs)("article", {
		className: "scenarioResult",
		"aria-label": `Reviewed scenario ${t.name}`,
		children: [
			/* @__PURE__ */ (0, B.jsx)("h3", { children: t.name }),
			/* @__PURE__ */ (0, B.jsx)("p", { children: t.rationale }),
			/* @__PURE__ */ (0, B.jsxs)("p", {
				className: "scenarioOutcome",
				children: [
					"Baseline ",
					/* @__PURE__ */ (0, B.jsx)("strong", {
						"data-outcome": t.outcome_change.baseline,
						children: t.outcome_change.baseline.toUpperCase()
					}),
					" → Projected ",
					/* @__PURE__ */ (0, B.jsx)("strong", {
						"data-outcome": t.outcome_change.projected,
						children: t.outcome_change.projected.toUpperCase()
					}),
					" · ",
					t.outcome_change.changed ? "Outcome changed" : "Outcome unchanged"
				]
			}),
			/* @__PURE__ */ (0, B.jsxs)("p", { children: [
				"Server score ",
				t.decision.score,
				" · retained policy ",
				t.decision.policy_version
			] }),
			/* @__PURE__ */ (0, B.jsx)("div", {
				className: "tableScroll",
				children: /* @__PURE__ */ (0, B.jsxs)("table", { children: [
					/* @__PURE__ */ (0, B.jsx)("caption", { children: "Original baseline and projected current facts" }),
					/* @__PURE__ */ (0, B.jsx)("thead", { children: /* @__PURE__ */ (0, B.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, B.jsx)("th", { children: "Metric" }),
						/* @__PURE__ */ (0, B.jsx)("th", { children: "Baseline" }),
						/* @__PURE__ */ (0, B.jsx)("th", { children: "Projected" }),
						/* @__PURE__ */ (0, B.jsx)("th", { children: "Server delta" })
					] }) }),
					/* @__PURE__ */ (0, B.jsx)("tbody", { children: C.map((e) => {
						let r = t.comparisons.find((t) => t.metric === e);
						return /* @__PURE__ */ (0, B.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, B.jsx)("th", {
								scope: "row",
								children: gn[e]
							}),
							/* @__PURE__ */ (0, B.jsx)("td", {
								className: "num",
								children: Be(n.current_facts[e])
							}),
							/* @__PURE__ */ (0, B.jsx)("td", {
								className: "num",
								children: Be(t.current_facts[e])
							}),
							/* @__PURE__ */ (0, B.jsxs)("td", {
								className: "num",
								children: [r ? r.delta === null ? "Not applicable" : Be({
									...t.current_facts[e],
									raw_value: r.delta,
									reported_value: null
								}) : "Held fixed", r?.delta_explanation && /* @__PURE__ */ (0, B.jsx)("small", { children: r.delta_explanation })]
							})
						] }, e);
					}) })
				] })
			}),
			/* @__PURE__ */ (0, B.jsxs)("p", { children: [
				"K-1 history stays observed: ",
				Be(t.current_facts.k1_history),
				". Current shocks do not create a historical operating year."
			] }),
			/* @__PURE__ */ (0, B.jsx)(vn, {
				title: "Raw deltas and policy headroom",
				children: () => /* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("p", { children: "Values below are the server's raw results. Approval uses the displayed operator; decline floors apply where returned." }), t.comparisons.map((e) => /* @__PURE__ */ (0, B.jsxs)("div", {
					className: "scenarioFact",
					children: [
						/* @__PURE__ */ (0, B.jsx)("strong", { children: gn[e.metric] }),
						/* @__PURE__ */ (0, B.jsxs)("p", { children: [
							"Baseline ",
							Sn(e.baseline_value),
							" · projected ",
							Sn(e.projected_value),
							" · delta ",
							Sn(e.delta),
							" ",
							e.unit
						] }),
						/* @__PURE__ */ (0, B.jsxs)("code", { children: [
							e.baseline_fact_id,
							" → ",
							e.projected_fact_id
						] }),
						e.delta_explanation && /* @__PURE__ */ (0, B.jsx)("p", { children: e.delta_explanation }),
						e.policy_headroom && /* @__PURE__ */ (0, B.jsxs)("p", { children: [
							"Approval ",
							e.policy_headroom.comparison_operator,
							" ",
							Sn(e.policy_headroom.approval_threshold),
							" · decline floor ",
							Sn(e.policy_headroom.decline_threshold),
							/* @__PURE__ */ (0, B.jsx)("br", {}),
							"Approval headroom: baseline ",
							Cn(e.policy_headroom.baseline_approval),
							" · projected ",
							Cn(e.policy_headroom.projected_approval),
							/* @__PURE__ */ (0, B.jsx)("br", {}),
							"Decline headroom: baseline ",
							Cn(e.policy_headroom.baseline_decline),
							" · projected ",
							Cn(e.policy_headroom.projected_decline)
						] })
					]
				}, e.metric))] })
			}),
			/* @__PURE__ */ (0, B.jsx)(vn, {
				title: "Factor and reason changes",
				children: () => /* @__PURE__ */ (0, B.jsxs)("div", { children: [
					t.factor_changes.map((e) => /* @__PURE__ */ (0, B.jsxs)("div", {
						className: "scenarioFact",
						children: [/* @__PURE__ */ (0, B.jsxs)("h4", { children: [
							gn[e.name],
							" · ",
							e.changed ? "Changed" : "Unchanged"
						] }), /* @__PURE__ */ (0, B.jsxs)("p", { children: [
							"Baseline raw ",
							Sn(e.baseline.raw_value),
							" → projected raw ",
							Sn(e.projected.raw_value),
							/* @__PURE__ */ (0, B.jsx)("br", {}),
							"Pass: ",
							Sn(e.baseline.passed),
							" → ",
							Sn(e.projected.passed),
							" · decline triggered: ",
							Sn(e.baseline.decline_triggered),
							" → ",
							Sn(e.projected.decline_triggered),
							/* @__PURE__ */ (0, B.jsx)("br", {}),
							"Operator ",
							e.projected.comparison_operator ?? "Not applicable",
							" · approval ",
							Sn(e.projected.threshold),
							" · decline floor ",
							Sn(e.projected.decline_threshold),
							" · weight ",
							e.projected.weight,
							/* @__PURE__ */ (0, B.jsx)("br", {}),
							"Basis ",
							e.basis,
							" · ",
							/* @__PURE__ */ (0, B.jsx)("code", { children: e.projected_fact_id })
						] })]
					}, e.name)),
					/* @__PURE__ */ (0, B.jsx)("h4", { children: "Reason changes" }),
					t.reason_changes.length ? t.reason_changes.map((e) => /* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsxs)("strong", { children: [
						e.code,
						" · ",
						e.change
					] }), /* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Baseline: ",
						e.baseline?.message ?? "No reason",
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						"Projected: ",
						e.projected?.message ?? "No reason"
					] })] }, e.code)) : /* @__PURE__ */ (0, B.jsx)("p", { children: "No reason changes returned." }),
					/* @__PURE__ */ (0, B.jsx)("h4", { children: "Projected reasons" }),
					t.decision.reasons.length ? t.decision.reasons.map((e) => /* @__PURE__ */ (0, B.jsxs)("p", { children: [
						e.code,
						" · ",
						e.message
					] }, e.code)) : /* @__PURE__ */ (0, B.jsx)("p", { children: "No additional reasons returned." })
				] })
			}),
			/* @__PURE__ */ (0, B.jsx)(vn, {
				title: "Projected inputs and held-fixed assumptions",
				children: () => /* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("pre", { children: JSON.stringify({
					assumptions: t.assumptions,
					operating: t.projection_inputs.operating,
					proposed_loan: t.projection_inputs.proposed_loan,
					existing_debt: t.projection_inputs.existing_debt,
					working_capital: t.projection_inputs.working_capital
				}, null, 2) }), /* @__PURE__ */ (0, B.jsx)("ul", { children: e.held_fixed_assumptions.map((e, t) => /* @__PURE__ */ (0, B.jsx)("li", { children: e }, t)) })] })
			}),
			/* @__PURE__ */ (0, B.jsx)(vn, {
				title: "Projected guarantor contributions",
				children: () => /* @__PURE__ */ (0, B.jsx)(yn, {
					rows: t.guarantor_contributions,
					label: "guarantors",
					render: (e, n) => /* @__PURE__ */ (0, B.jsxs)("div", {
						className: "scenarioFact",
						children: [
							/* @__PURE__ */ (0, B.jsx)("h4", { children: e.name }),
							/* @__PURE__ */ (0, B.jsxs)("p", { children: [
								"Business EBITDA: ",
								Be(e.business_ebitda),
								/* @__PURE__ */ (0, B.jsx)("br", {}),
								"Outside income: ",
								Be(e.outside_income),
								/* @__PURE__ */ (0, B.jsx)("br", {}),
								"Personal debt: ",
								Be(e.personal_debt)
							] }),
							/* @__PURE__ */ (0, B.jsx)(vn, {
								title: `${e.name} projected inputs`,
								children: () => /* @__PURE__ */ (0, B.jsx)("pre", { children: JSON.stringify(t.projection_inputs.guarantors[n], null, 2) })
							})
						]
					}, n)
				})
			}),
			/* @__PURE__ */ (0, B.jsx)(vn, {
				title: "Calculation trace",
				children: () => /* @__PURE__ */ (0, B.jsx)(yn, {
					rows: t.calculation_trace,
					label: "trace",
					render: (e) => /* @__PURE__ */ (0, B.jsx)(xn, { row: e }, e.fact_id)
				})
			})
		]
	});
}
function Tn({ preview: e }) {
	let [t, n] = (0, x.useState)(0);
	return /* @__PURE__ */ (0, B.jsxs)("div", { children: [
		/* @__PURE__ */ (0, B.jsxs)("label", {
			className: "scenarioSelect",
			children: ["Reviewed scenario ", /* @__PURE__ */ (0, B.jsx)("select", {
				"aria-label": "Reviewed scenario",
				value: t,
				onChange: (e) => n(Number(e.target.value)),
				children: e.scenarios.map((e, t) => /* @__PURE__ */ (0, B.jsxs)("option", {
					value: t,
					children: [
						t + 1,
						". ",
						e.name
					]
				}, e.scenario_key))
			})]
		}),
		/* @__PURE__ */ (0, B.jsx)(wn, {
			preview: e,
			result: e.scenarios[t]
		}, e.scenarios[t].scenario_key),
		/* @__PURE__ */ (0, B.jsx)("p", {
			className: "fine",
			children: e.disclaimer
		})
	] });
}
function En({ view: e, onOpen: t }) {
	let n = e.record;
	return /* @__PURE__ */ (0, B.jsxs)("section", {
		className: "panel originalComparison",
		children: [
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "comparisonContext",
				children: [
					/* @__PURE__ */ (0, B.jsx)("h2", { children: "Saved comparison" }),
					/* @__PURE__ */ (0, B.jsx)("code", { children: n.comparison_id }),
					/* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Original record · Case ",
						n.case_id,
						" · baseline revision ",
						n.baseline_revision,
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						"Run ",
						n.baseline_run_id,
						" · recorded ",
						n.recorded_at
					] }),
					/* @__PURE__ */ (0, B.jsx)("button", {
						onClick: () => t({
							caseId: n.case_id,
							revision: n.baseline_revision
						}),
						children: "Open baseline revision"
					})
				]
			}),
			/* @__PURE__ */ (0, B.jsxs)("p", { children: [
				"Recorded actor: ",
				n.actor,
				" · ",
				n.actor === "prototype-demo-unverified" ? "archived demonstration identity" : "configured credential identity",
				" · source status ",
				n.recording.source_status,
				n.recording.source_revision ? ` · ${n.recording.source_revision}` : " · exact build revision not supplied"
			] }),
			e.preview ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
				/* @__PURE__ */ (0, B.jsxs)("p", { children: [
					"Operating period ",
					e.preview.selected_period.period_start,
					" – ",
					e.preview.selected_period.period_end,
					" · assumptions as of ",
					e.preview.assumptions_as_of,
					/* @__PURE__ */ (0, B.jsx)("br", {}),
					"Retained policy ",
					e.preview.policy_snapshot.version,
					" · ",
					e.preview.scenario_definition_version,
					" · ",
					e.preview.calculation_version
				] }),
				/* @__PURE__ */ (0, B.jsx)(vn, {
					title: "Baseline hashes, fingerprint and retained policy",
					children: () => /* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Input hash ",
						/* @__PURE__ */ (0, B.jsx)("code", { children: e.preview.baseline.input_hash }),
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						"Baseline payload hash ",
						/* @__PURE__ */ (0, B.jsx)("code", { children: e.preview.baseline.payload_hash }),
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						"Reviewed fingerprint ",
						/* @__PURE__ */ (0, B.jsx)("code", { children: e.preview.fingerprint.value })
					] }), /* @__PURE__ */ (0, B.jsx)("pre", { children: JSON.stringify({
						units: e.preview.units,
						policy_snapshot: e.preview.policy_snapshot,
						recording: n.recording
					}, null, 2) })] })
				}),
				/* @__PURE__ */ (0, B.jsx)(Tn, { preview: e.preview }, n.comparison_id)
			] }) : /* @__PURE__ */ (0, B.jsx)("p", {
				className: "compatibility",
				role: "status",
				children: e.compatibility
			}),
			/* @__PURE__ */ (0, B.jsx)(vn, {
				title: "Original comparison JSON",
				children: () => /* @__PURE__ */ (0, B.jsx)(bn, { value: n })
			}),
			/* @__PURE__ */ (0, B.jsxs)("p", {
				className: "fine",
				children: [
					"Payload hash ",
					n.payload_hash,
					". These local consistency identifiers do not authenticate documents or people."
				]
			})
		]
	});
}
function Dn({ caseId: e, scope: t, refresh: n, onOpen: r }) {
	let i = Kt(`${t}:${n}`, (t, n) => ln(e, t, n), (e) => e.comparison_id);
	return /* @__PURE__ */ (0, B.jsxs)("section", {
		className: "panel comparisonArchive",
		"aria-label": "Saved comparisons",
		children: [
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h2", { children: "Saved comparisons" }), /* @__PURE__ */ (0, B.jsx)("p", { children: "All baselines for this case · newest records first · 25 summaries per page" })] }), /* @__PURE__ */ (0, B.jsx)("button", {
					onClick: i.refresh,
					children: "Refresh comparisons"
				})]
			}),
			i.loading && /* @__PURE__ */ (0, B.jsx)("p", {
				role: "status",
				children: "Loading comparison summaries…"
			}),
			i.error && /* @__PURE__ */ (0, B.jsx)("p", {
				role: "alert",
				children: i.error
			}),
			!i.loading && !i.error && !i.items.length && /* @__PURE__ */ (0, B.jsx)("p", { children: "No saved comparisons yet." }),
			i.items.map((e) => /* @__PURE__ */ (0, B.jsxs)("article", {
				className: "caseRow",
				children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [
					/* @__PURE__ */ (0, B.jsx)("h3", { children: e.scenarios.map((e) => e.name).join(" · ") }),
					/* @__PURE__ */ (0, B.jsx)("code", { children: e.comparison_id }),
					/* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Baseline revision ",
						e.baseline_revision,
						" · ",
						e.scenario_count,
						" scenario(s)",
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						e.recorded_at,
						" · policy ",
						e.policy_version
					] })
				] }), /* @__PURE__ */ (0, B.jsx)("button", {
					"aria-label": `Open comparison ${e.comparison_id}`,
					onClick: () => r(e.comparison_id),
					children: "Open original comparison"
				})]
			}, e.comparison_id)),
			i.next && /* @__PURE__ */ (0, B.jsx)("button", {
				disabled: i.loading,
				onClick: i.more,
				children: "Load more comparisons"
			})
		]
	});
}
function On({ model: e, onSaveBaseline: t, onOpenBaseline: n }) {
	let r = (0, x.useRef)(null), [i, a] = (0, x.useState)(null);
	(0, x.useEffect)(() => {
		i && (Me(`[id="scenario-name-${i}"]`)?.focus(), a(null));
	}, [i]);
	let o = e.view?.assessment;
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "scenariosWorkspace",
		children: [
			/* @__PURE__ */ (0, B.jsxs)("section", {
				className: "panel scenarioComposer",
				"aria-label": "Scenario authoring",
				children: [
					/* @__PURE__ */ (0, B.jsx)("div", {
						className: "panelTitle",
						children: /* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h2", { children: "Scenario comparison" }), /* @__PURE__ */ (0, B.jsx)("p", { children: "Review current pro forma shocks against an explicit original saved baseline." })] })
					}),
					e.baseline && /* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Case ",
						/* @__PURE__ */ (0, B.jsx)("code", { children: e.baseline.case_id }),
						" · baseline revision ",
						e.baseline.revision,
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						"Run ",
						/* @__PURE__ */ (0, B.jsx)("code", { children: e.baseline.run_id }),
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						"Payload hash ",
						/* @__PURE__ */ (0, B.jsx)("code", { children: e.baseline.payload_hash })
					] }),
					o && /* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Operating period ",
						o.selected_period.period_start,
						" – ",
						o.selected_period.period_end,
						" · assumptions as of ",
						o.assumptions_as_of,
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						"Retained policy ",
						o.policy_snapshot.version,
						". The spread's selected column does not change this baseline."
					] }),
					e.view ? e.supported ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
						/* @__PURE__ */ (0, B.jsx)("p", { children: "Enter percentage changes as percentages (−10 means −10%). Enter rate changes in basis points; fractional basis points are supported. Each of the four shocks must be explicit. Presets fill the name and shocks; enter your own rationale." }),
						e.rows.map((t, n) => /* @__PURE__ */ (0, B.jsxs)("fieldset", {
							className: "scenarioRow",
							disabled: e.fieldsDisabled,
							children: [
								/* @__PURE__ */ (0, B.jsxs)("legend", { children: ["Scenario ", n + 1] }),
								/* @__PURE__ */ (0, B.jsxs)("div", {
									className: "scenarioFields",
									children: [
										/* @__PURE__ */ (0, B.jsxs)("label", { children: ["Preset", /* @__PURE__ */ (0, B.jsxs)("select", {
											"aria-label": `Scenario ${n + 1} preset`,
											value: t.preset,
											onChange: (n) => e.preset(t.key, n.target.value),
											children: [/* @__PURE__ */ (0, B.jsx)("option", {
												value: "custom",
												children: "Custom / zero shocks"
											}), Object.entries(pn).map(([e, t]) => /* @__PURE__ */ (0, B.jsx)("option", {
												value: e,
												children: t.name
											}, e))]
										})] }),
										/* @__PURE__ */ (0, B.jsxs)("label", { children: ["Name", /* @__PURE__ */ (0, B.jsx)("input", {
											id: `scenario-name-${t.key}`,
											"aria-label": `Scenario ${n + 1} name`,
											value: t.name,
											onChange: (n) => e.change(t.key, (e) => ({
												...e,
												name: n.target.value
											}))
										})] }),
										/* @__PURE__ */ (0, B.jsxs)("label", {
											className: "scenarioRationale",
											children: [
												"Rationale",
												/* @__PURE__ */ (0, B.jsx)("textarea", {
													"aria-label": `Scenario ${n + 1} rationale`,
													rows: 3,
													value: t.rationale,
													onChange: (n) => e.change(t.key, (e) => ({
														...e,
														rationale: n.target.value
													}))
												}),
												/* @__PURE__ */ (0, B.jsx)("small", { children: "Required · at most 2,000 Unicode characters after trimming; name limit 120." })
											]
										}),
										rt.map((r, i) => /* @__PURE__ */ (0, B.jsxs)("label", { children: [_n[i], /* @__PURE__ */ (0, B.jsx)("input", {
											inputMode: "decimal",
											"aria-label": `Scenario ${n + 1} ${_n[i]}`,
											value: t.shocks[r],
											onChange: (n) => e.change(t.key, (e) => ({
												...e,
												preset: "custom",
												shocks: {
													...e.shocks,
													[r]: n.target.value
												}
											}))
										})] }, r))
									]
								}),
								/* @__PURE__ */ (0, B.jsx)("button", {
									disabled: e.rows.length <= 1,
									"aria-label": `Remove scenario ${n + 1}`,
									onClick: () => {
										e.remove(t.key), r.current?.focus();
									},
									children: "Remove scenario"
								})
							]
						}, t.key)),
						/* @__PURE__ */ (0, B.jsxs)("div", {
							className: "actions",
							children: [
								/* @__PURE__ */ (0, B.jsx)("button", {
									ref: r,
									disabled: e.fieldsDisabled || e.rows.length >= 10,
									onClick: () => {
										let t = e.add();
										t && a(t);
									},
									children: "Add scenario"
								}),
								/* @__PURE__ */ (0, B.jsx)("button", {
									disabled: e.fieldsDisabled || e.busy || !e.rows.length,
									onClick: () => void e.preview(),
									children: "Preview scenarios"
								}),
								/* @__PURE__ */ (0, B.jsx)("button", {
									className: "primary",
									disabled: !e.canRetain,
									onClick: e.retain,
									children: "Save reviewed comparison"
								}),
								/* @__PURE__ */ (0, B.jsx)("button", {
									disabled: e.frozen,
									onClick: e.newDraft,
									children: "Start another comparison"
								})
							]
						}),
						/* @__PURE__ */ (0, B.jsx)("p", {
							role: "status",
							children: e.busy ? "Previewing current draft…" : e.canRetain ? "Current preview ready for review and retention." : "Preview required before a fresh save. A saved or pending batch cannot be saved twice."
						}),
						e.original.view && /* @__PURE__ */ (0, B.jsx)("p", { children: "Viewing a saved original. Choose Start another comparison to author a fresh batch." }),
						e.writeBlocked && /* @__PURE__ */ (0, B.jsx)("p", { children: "Resolve this tab's existing saved write, recovery tracking or conflicting proposal before retaining another comparison. Read-only previews remain available." })
					] }) : /* @__PURE__ */ (0, B.jsx)("p", { children: "New preview is unavailable for this baseline definition. Saved comparison summaries and original records remain available below." }) : /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [/* @__PURE__ */ (0, B.jsx)("p", { children: "Save an accepted dated case, or open an original saved revision, to author scenarios. Legacy annual assessments remain unsaved." }), /* @__PURE__ */ (0, B.jsx)("button", {
						disabled: !e.canSaveBaseline,
						onClick: (e) => t(e.currentTarget),
						children: "Save baseline case"
					})] }),
					e.error && /* @__PURE__ */ (0, B.jsx)("p", {
						role: "alert",
						children: e.error
					}),
					e.errorCode === "storage_upgrade_required" && /* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Retention requires the documented copy upgrade to a separate schema-v2 database. An operator must verify the copy and select it explicitly; opening this view performs no upgrade. See ",
						/* @__PURE__ */ (0, B.jsx)("code", { children: "docs/SCENARIO_COMPARISONS.md" }),
						"."
					] })
				]
			}),
			e.previewResult && (!e.original.view || !e.previewConsumed) && /* @__PURE__ */ (0, B.jsxs)("section", {
				className: "panel scenarioPreview",
				children: [
					/* @__PURE__ */ (0, B.jsx)("h2", { children: "Read-only preview" }),
					/* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Review the server's projected results and rationale before saving this batch.",
						/* @__PURE__ */ (0, B.jsx)("br", {}),
						"Reviewed fingerprint ",
						/* @__PURE__ */ (0, B.jsx)("code", { children: e.previewResult.fingerprint.value })
					] }),
					/* @__PURE__ */ (0, B.jsx)(Tn, { preview: e.previewResult }, e.previewResult.fingerprint.value)
				]
			}),
			e.original.loading && /* @__PURE__ */ (0, B.jsx)("p", {
				role: "status",
				children: "Loading original comparison…"
			}),
			e.original.error && /* @__PURE__ */ (0, B.jsx)("p", {
				role: "alert",
				children: e.original.error
			}),
			e.original.view && (!e.previewResult || e.previewConsumed) && /* @__PURE__ */ (0, B.jsx)(En, {
				view: e.original.view,
				onOpen: n
			}),
			e.baseline && /* @__PURE__ */ (0, B.jsx)(Dn, {
				caseId: e.baseline.case_id,
				scope: e.context,
				refresh: e.refreshSerial,
				onOpen: (t) => void e.open(t)
			})
		]
	});
}
//#endregion
//#region src/prototypeDisclaimer.ts
var kn = "Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.";
function An(e, t) {
	return `spreadline-case-${e.case_id}-r${e.revision}-${e.run_id}${t ? `-comparison-${t.comparison_id}` : ""}.json`;
}
function jn(e, t) {
	let n = e.snapshot, r = t.record, i = F(r.preview.baseline, "export comparison baseline");
	P(r.case_id === n.case_id && r.baseline_revision === n.revision && r.baseline_run_id === n.run_id && i.case_id === n.case_id && i.revision === n.revision && i.run_id === n.run_id && i.input_hash === n.input_hash && i.payload_hash === n.payload_hash && z(i.assessment, n.assessment), "retained comparison must match the selected original case, revision, run, hashes and full baseline assessment");
}
//#endregion
//#region src/reviewPackage.worker.ts?worker&inline
var Mn = "(function(){let e=/^([+-]?)(?:(\\d+)(?:\\.(\\d*))?|\\.(\\d+))(?:[eE]([+-]?\\d+))?$/,t=10n;function n(t){if(t.length>256)throw Error(`Decimal exceeds the supported range.`);let n=e.exec(t);if(!n)throw Error(`Enter a finite decimal value.`);let r=Number(n[5]??`0`);if(!Number.isSafeInteger(r)||Math.abs(r)>128)throw Error(`Decimal exponent exceeds the supported range.`);let i=n[3]??n[4]??``;return{coefficient:BigInt(`${n[1]===`-`?`-`:``}${n[2]??`0`}${i}`),scale:i.length-r}}function r({coefficient:e,scale:t}){if(e===0n)return`0`;let n=e<0n?`-`:``,r=(e<0n?-e:e).toString();return t<=0?n+r+`0`.repeat(-t):(r=r.padStart(t+1,`0`),(n+r.slice(0,-t)+`.`+r.slice(-t)).replace(/0+$/,``).replace(/\\.$/,``))}function i(e){return r(n(e))}function a(e){if(typeof e!=`string`)return!1;try{return n(e),!0}catch{return!1}}function o(e){if(typeof e==`number`&&Number.isFinite(e))return i(String(e));if(typeof e==`string`)return i(e);throw Error(`Financial values must be finite decimals.`)}function s(e,r){let i=n(e),a=n(r),o=Math.max(i.scale,a.scale),s=i.coefficient*t**BigInt(o-i.scale),c=a.coefficient*t**BigInt(o-a.scale);return s<c?-1:+(s>c)}function c(e,t){try{return s(o(e),o(t))===0}catch{return!1}}let l=[`gross_receipts`,`cogs`,`operating_expense_excl_dna_interest_comp`,`officer_compensation`,`depreciation`,`amortization`,`interest_expense`,`section_179`,`k1_distribution`],u=[`ordinary_business_income`,`ebitda`,`proposed_monthly_payment`,`proposed_annual_payment`,`debt_service`,`fixed_charge_service`,`global_business_ebitda`,`global_outside_income`,`global_personal_debt`,`global_cash_flow`,`global_debt_service`,`dscr`,`fccr`,`global_dscr`,`net_working_capital_increase`,`uca_cash_flow`,`k1_ratio_difference`,`k1_history`],d=[`commercial_min_dscr`,`commercial_min_fccr`,`commercial_min_global_dscr`,`commercial_decline_dscr`,`commercial_decline_fccr`,`commercial_decline_global_dscr`,`commercial_min_uca_cash_flow`,`consumer_review_dti`,`consumer_decline_dti`,`consumer_min_credit_score`,`extraction_confidence_threshold`,`k1_stability_band`,`sba_global_dscr_floor_expansion`,`sba_global_dscr_floor_acquisition`];function f(e,t){if(!e)throw Error(`Incomplete or invalid assessment: ${t}`)}function p(e,t){return f(typeof e==`object`&&!!e&&!Array.isArray(e),t),e}function m(e,t){return f(Array.isArray(e),t),e}function h(e){return typeof e==`string`&&e.length>0}function g(e){return typeof e==`number`&&Number.isFinite(e)}function _(e){return typeof e==`string`||typeof e==`boolean`}function v(e){return typeof e==`string`&&/^\\d{4}-\\d{2}-\\d{2}$/.test(e)&&Number.isFinite(Date.parse(e))&&new Date(e).toISOString().slice(0,10)===e}function y(e){let t=p(e,`period`);return f(v(t.period_start)&&v(t.period_end)&&t.period_start<=t.period_end,`period dates`),t}let b=(e,t)=>e.period_start===t.period_start&&e.period_end===t.period_end;function x(e){let t=p(e,`decision`);f(t.vertical===`commercial`&&[`approve`,`review`,`decline`].includes(String(t.outcome))&&a(t.score)&&h(t.policy_version)&&h(t.disclaimer),`decision identity`);let n=m(t.factors,`factors`);f(n.length===5,`commercial factors`);let r=[`dscr`,`fccr`,`global_dscr`,`uca_positive`,`k1_history`];for(let e of n){let t=p(e,`factor`);f(h(t.name)&&r.includes(t.name)&&_(t.value)&&(t.raw_value===null||_(t.raw_value))&&a(t.weight)&&(t.threshold===null||_(t.threshold))&&(t.passed===null||typeof t.passed==`boolean`)&&h(t.source)&&[null,`>=`,`>`,`<`,`==`].includes(t.comparison_operator)&&(t.decline_threshold===null||a(t.decline_threshold))&&(t.decline_triggered===null||typeof t.decline_triggered==`boolean`),`factor fields`)}f(new Set(n.map(e=>p(e,`factor`).name)).size===5,`unique factors`);for(let e of m(t.reasons,`reasons`)){let t=p(e,`reason`);f(h(t.code)&&h(t.factor)&&h(t.message)&&_(t.value),`reason fields`)}return t}function S(e){let t=p(e,`normalized input`);f(t.schema_version===`commercial-assessment-v2`&&v(t.assessment_as_of)&&h(t.borrower_name)&&h(t.geography),`dated identity`);let n=p(t.units,`units`);f(n.currency===`USD`&&n.monetary_unit===`dollars`&&n.annual_rate_unit===`decimal_nominal`,`units`);let r=m(t.years,`years`);f(r.length>=1&&r.length<=10,`year count`);let i=``;for(let e of r){let n=p(e,`year`),r=y(n);f(r.period_start>i&&r.period_end<=t.assessment_as_of,`year order`),i=r.period_end;for(let e of l)f(a(n[e]),`year ${e}`)}let o=(e,t)=>{let n=p(e,`assumption`);for(let e of t)f(a(n[e]),e);return n};o(t.existing_debt,[`cpltd_annual`,`operating_lease_annual`]);let s=o(t.proposed_loan,[`amount`,`annual_rate`]);f(Number.isSafeInteger(s.term_months)&&s.rate_type===`fixed`&&s.repayment_type===`fully_amortizing`&&s.payment_frequency===`monthly`,`loan convention`);let c=o(t.working_capital,[`ar_increase`,`inventory_increase`,`ap_increase`,`cash_taxes_paid`]);f(b(y(c),y(r[r.length-1])),`working capital period`);for(let e of m(t.guarantors,`guarantors`))f(h(o(e,[`ownership_percentage`,`wages`,`interest_dividend_income`,`mortgage_pi_annual`,`auto_loan_annual`,`credit_card_min_annual`]).name),`guarantor name`);return t}function C(e){let t=p(e,`metric`);return f(h(t.fact_id)&&h(t.unit)&&(t.display_precision===null||Number.isInteger(t.display_precision)&&Number(t.display_precision)>=0&&Number(t.display_precision)<=30)&&(t.explanation===null||h(t.explanation)),`metric fields`),f(t.status===`available`?a(t.raw_value)||t.unit===`category`&&h(t.raw_value):t.status===`not_applicable`&&t.raw_value===null&&h(t.explanation),`metric status/value`),f(t.status===`not_applicable`?t.reported_value===null:t.unit===`category`?t.reported_value===t.raw_value:a(t.reported_value),`reported metric value`),t}function w(e){let t=p(e,`assessment`);f(t.schema_version===`commercial-assessment-v2`&&t.calculation_version===`commercial-calculation-v2`&&t.serialization_version===`assessment-json-v2`&&t.coverage_basis===`current_pro_forma`&&h(t.disclaimer),`versions`);let n=S(t.normalized_input),r=n.years[n.years.length-1];f(b(y(t.selected_period),r)&&t.assumptions_as_of===n.assessment_as_of,`selected period`);let i=m(t.historical_spread,`spread`);f(i.length===n.years.length,`spread length`);let o=[];i.forEach((e,t)=>{let r=p(e,`historical period`);f(b(y(r),n.years[t])&&b(y(r.financials),n.years[t]),`historical period correspondence`);let i=p(r.financials,`historical financials`);for(let e of l)f(i[e]===n.years[t][e],`historical inputs`);let s=p(r.reported_financials,`reported financials`);f(b(y(s),n.years[t]),`reported period`);for(let e of l)f(a(s[e])&&/^-?\\d+\\.\\d{2}$/.test(s[e]),`reported source amount`);for(let e of[`gross_profit`,`ordinary_business_income`,`ebitda`,`k1_distribution_ratio`])o.push(C(r[e]))});let s=p(t.current_facts,`facts`);for(let e of u){let t=C(s[e]),r=[`ordinary_business_income`,`ebitda`].includes(e)?`years.${n.years.length-1}.${e}`:`current.${e}`;f(t.fact_id===r,`fact identity`),f(e===`k1_history`?t.status===`available`&&[`stable`,`unstable`,`insufficient_history`].includes(String(t.raw_value)):t.raw_value===null||a(t.raw_value),`fact type`),o.push(t)}let c=m(t.guarantor_contributions,`contributions`);f(c.length===n.guarantors.length,`contributions length`),c.forEach((e,t)=>{let r=p(e,`contribution`);f(r.guarantor_index===t&&r.name===n.guarantors[t].name,`contribution identity`);for(let e of[`business_ebitda`,`outside_income`,`personal_debt`])o.push(C(r[e]))});let _=m(t.k1_history_periods,`history periods`).map(y);f(_.length>=1&&_.length<=2&&b(_[_.length-1],r)&&_.every(e=>n.years.some(t=>b(e,t))),`history periods`);let w=p(t.policy_snapshot,`policy`);f(h(w.version)&&v(w.sba_sop_8_effective)&&v(w.sba_sop_8_1_effective),`policy identity`);for(let e of d)f(e===`consumer_min_credit_score`?Number.isSafeInteger(w[e]):a(w[e]),`policy ${e}`);f(m(w.consumer_required_atr_fields,`ATR fields`).every(h),`ATR fields`);let T=x(t.decision);f(T.policy_version===w.version,`decision policy`);let E=m(t.calculation_trace,`trace`);f(E.length>0,`trace rows`);let D=/* @__PURE__ */ new Map;for(let e of E){let t=p(e,`trace row`),n=C(t);f(h(t.definition_id)&&h(t.expression)&&!D.has(n.fact_id),`trace identity`),D.set(n.fact_id,n);for(let e of m(t.operands,`operands`)){let t=p(e,`operand`);f([`input`,`fact`,`policy`].includes(String(t.reference_type))&&h(t.reference)&&h(t.unit)&&(t.raw_value===null||g(t.raw_value)||typeof t.raw_value==`string`),`operand fields`),f(t.reported_value===null||a(t.reported_value)||Number.isSafeInteger(t.reported_value),`reported operand`)}}for(let e of E){let t=p(e,`trace row`);for(let e of m(t.operands,`operands`)){let t=p(e,`operand`);if(t.reference_type===`fact`){let e=D.get(String(t.reference));f(e&&e.raw_value===t.raw_value&&e.unit===t.unit,`referenced fact`)}else{let e=String(t.reference).split(`/`).slice(1),r=t.reference_type===`policy`?{policy_snapshot:w}:n;for(let t of e)f(typeof r==`object`&&!!r&&Object.prototype.hasOwnProperty.call(r,t),`operand input path`),r=r[t];f(r===t.raw_value,`operand input value`)}}}for(let e of o){let t=D.get(e.fact_id);f(t&&t.raw_value===e.raw_value&&t.reported_value===e.reported_value&&t.status===e.status&&t.unit===e.unit,`fact/trace correspondence`)}for(let e of T.factors){let t=e.name===`uca_positive`?`uca_cash_flow`:e.name;f(e.raw_value===C(s[t]).raw_value,`factor/fact correspondence`)}let O=p(t.fingerprint,`fingerprint`);return f(O.algorithm===`sha256`&&typeof O.value==`string`&&/^[0-9a-f]{64}$/.test(O.value)&&O.content===`normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version`,`fingerprint`),t}function T(e,t){if(!e)throw Error(`Invalid saved-case response or command: ${t}.`)}function E(e,t){return T(typeof e==`object`&&!!e&&!Array.isArray(e),t),e}let D=e=>typeof e==`number`&&Number.isFinite(e),O=e=>typeof e==`string`,k=e=>O(e)&&/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(e),A=e=>O(e)&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(e),j=e=>Number.isSafeInteger(e)&&Number(e)>=1,M=e=>O(e)&&/^[0-9a-f]{64}$/.test(e),N=e=>O(e)&&/^\\d{4}-\\d{2}-\\d{2}$/.test(e)&&Number.isFinite(Date.parse(e))&&new Date(e).toISOString().slice(0,10)===e,P=e=>O(e)&&/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,6})?(?:Z|\\+00:00)$/.test(e)&&N(e.slice(0,10))&&Number.isFinite(Date.parse(e));function F(e,t=0,n=64){if(T(t<n,`JSON depth`),!(e===null||O(e)||typeof e==`boolean`)){if(typeof e==`number`){T(D(e),`finite JSON number`);return}T(typeof e==`object`,`JSON value`);for(let r of Object.values(e))F(r,t+1,n)}}function I(e,t){if(e===t)return!0;if(!e||!t||typeof e!=`object`||typeof t!=`object`||Array.isArray(e)!==Array.isArray(t))return!1;let n=Object.keys(e),r=Object.keys(t);return n.length===r.length&&n.every(n=>Object.prototype.hasOwnProperty.call(t,n)&&I(e[n],t[n]))}function ee(e){return T(O(e)&&[...e].length<=2e3&&e.trim().length>0,`nonblank rationale, at most 2,000 characters`),e.trim()}let L={years:l,existing_debt:[`cpltd_annual`,`operating_lease_annual`],proposed_loan:[`amount`,`annual_rate`,`term_months`],guarantors:[`ownership_percentage`,`wages`,`interest_dividend_income`,`mortgage_pi_annual`,`auto_loan_annual`,`credit_card_min_annual`],working_capital:[`ar_increase`,`inventory_increase`,`ap_increase`,`cash_taxes_paid`]};function R(e){T(O(e)&&e.length<=160&&e.startsWith(`/`),`numeric field path`);let t=e.slice(1).split(`/`),n=t[0],r=t[t.length-1];return T(Object.prototype.hasOwnProperty.call(L,n)&&L[n].includes(r),`numeric field allowlist`),T([`years`,`guarantors`].includes(n)?t.length===3&&/^(?:0|[1-9][0-9]{0,8})$/.test(t[1]):t.length===2,`field index`),t}function te(e,t){let n=R(t),r=n[0],i=n[n.length-1],o=e,s,c={basis:`current_assumptions`,assessment_as_of:String(o.assessment_as_of),period_start:null,period_end:null,guarantor_index:null,guarantor_name:null,unit:`USD dollars`};if(n.length===3){let e=o[r];T(Array.isArray(e)&&Number(n[1])<e.length,`existing input index`),s=E(e[Number(n[1])],`input row`),r===`guarantors`?(c.guarantor_index=Number(n[1]),c.guarantor_name=String(s.name)):c.basis=`annual_financials`}else s=E(o[r],`input group`),r===`working_capital`&&(c.basis=`working_capital`);[`annual_financials`,`working_capital`].includes(c.basis)&&(T(N(s.period_start)&&N(s.period_end),`input dates`),c.period_start=s.period_start,c.period_end=s.period_end),[`annual_rate`,`ownership_percentage`].includes(i)&&(c.unit=`decimal fraction`),i===`term_months`&&(c.unit=`months`);let l=s[i];return T(i===`term_months`?Number.isSafeInteger(l):a(l)||D(l),`numeric input`),{value:l,context:c}}function ne(e,t){let n=E(e,`snapshot`);F(n),T(n.storage_serialization_version===`case-json-v1`&&A(n.case_id)&&A(n.run_id)&&j(n.revision),`snapshot identity`),T(n.parent_revision===(n.revision===1?null:n.revision-1)&&P(n.recorded_at),`snapshot parent/time`),T(M(n.input_hash)&&M(n.payload_hash),`snapshot hashes`),T(t===`\"case-json-v1:${n.case_id}:${n.revision}:${n.payload_hash}\"`,`strong ETag`);let r=E(n.normalized_input,`stored input`),i=E(n.assessment,`stored assessment`);T(O(i.schema_version)&&O(i.calculation_version)&&O(i.serialization_version),`assessment versions`);let o=i.schema_version===`commercial-assessment-v2`&&i.calculation_version===`commercial-calculation-v2`&&i.serialization_version===`assessment-json-v2`,s=o?w(i):null;s&&T(I(r,s.normalized_input),`outer normalized input`);let l=E(n.event,`event`),u=E(l.context,`event context`);if(T(l.case_id===n.case_id&&l.revision===n.revision&&l.run_id===n.run_id&&l.recorded_at===n.recorded_at&&k(l.actor),`event identity`),ee(l.rationale),T(N(u.assessment_as_of),`event as-of`),T(u.period_start===null&&u.period_end===null||N(u.period_start)&&N(u.period_end)&&u.period_start<=u.period_end,`event period`),T(u.guarantor_index===null&&u.guarantor_name===null||Number.isSafeInteger(u.guarantor_index)&&Number(u.guarantor_index)>=0&&O(u.guarantor_name),`event guarantor`),n.revision===1)T(l.kind===`creation`&&l.field_path===null&&l.before===null&&l.after===null&&u.basis===`case_creation`&&u.unit===null&&u.period_start===null&&u.guarantor_index===null,`creation event`);else if(T(l.kind===`edit`&&(a(l.before)||D(l.before))&&(a(l.after)||D(l.after))&&!c(l.before,l.after)&&O(l.field_path),`edit event`),R(l.field_path),T([`annual_financials`,`working_capital`,`current_assumptions`].includes(String(u.basis))&&[`USD dollars`,`decimal fraction`,`months`].includes(String(u.unit)),`edit context`),s){let e=te(s.normalized_input,l.field_path);T(e.value===l.after&&I(e.context,u),`server-derived edit context`)}return s&&T(u.assessment_as_of===s.normalized_input.assessment_as_of,`event assumptions date`),z(n.recording),{snapshot:n,etag:t,assessment:s,compatibility:o?null:`Stored assessment definition: ${i.schema_version} / ${i.calculation_version} / ${i.serialization_version}. Original JSON is available; typed display and editing are unavailable.`}}function z(e){let t=E(e,`recording metadata`),n=E(t.packages,`installed packages`);T(O(t.python_version)&&O(t.sqlite_version)&&M(t.dependency_baseline_sha256),`recording versions`);for(let e of[`fastapi`,`pydantic`,`starlette`,`uvicorn`])T(O(n[e])&&n[e].length>0,`installed ${e}`);return T(t.source_status===`development_unverified`?t.source_revision===null:t.source_status===`build_reported`&&O(t.source_revision)&&/^[0-9a-f]{40}$/.test(t.source_revision),`recorded source`),t}let B=[`revenue_change`,`cogs_change`,`operating_expense_change`,`proposed_rate_change_bps`],V=`commercial-scenario-preview-v2`;function H(e,t){T(Object.keys(e).length===t.length&&t.every(t=>Object.prototype.hasOwnProperty.call(e,t)),`scenario fields`)}function U(e,t){T(O(e),`scenario text`);let n=e.replace(/^[\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+|[\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+$/gu,``);return T(n.length>0&&[...n].length<=t,`nonblank scenario text, at most ${t} characters`),n}function W(e,t=!1){let n=E(e,`scenario`),r=E(n.assumptions,`shocks`);T(O(n.scenario_key)&&/^[A-Za-z0-9_-]{1,64}$/.test(n.scenario_key),`scenario key`),H(r,B);for(let e of B)T((a(r[e])||t&&D(r[e]))&&(e===`proposed_rate_change_bps`||s(o(r[e]),`-1`)>=0),`finite explicit shock`);return{scenario_key:n.scenario_key,name:U(n.name,120),rationale:U(n.rationale,2e3),assumptions:r}}function G(e){let t=E(e,`scenario command`),n=[`commercial-scenario-comparison-create-v1`,`commercial-scenario-comparison-create-v2`].includes(String(t.schema_version)),r=String(t.schema_version).endsWith(`-v1`);T(n||t.schema_version===V||t.schema_version===`commercial-scenario-preview-v1`,`scenario command version`),H(t,[`schema_version`,`baseline_run_id`,`scenarios`,...n?[`expected_preview_fingerprint`]:[]]),T(A(t.baseline_run_id)&&String(t.baseline_run_id).toLowerCase()===t.baseline_run_id,`canonical baseline run`),n&&T(M(t.expected_preview_fingerprint),`reviewed preview fingerprint`),T(Array.isArray(t.scenarios)&&t.scenarios.length>=1&&t.scenarios.length<=10,`1–10 scenarios`);let i=/* @__PURE__ */ new Set;for(let e of t.scenarios){H(E(e,`scenario command row`),[`scenario_key`,`name`,`rationale`,`assumptions`]);let t=W(e,r);T(I(t,e)&&!i.has(t.scenario_key),`normalized unique scenario command`),i.add(t.scenario_key)}return t}function K(e){let t=E(e.baseline,`preview baseline`);return T(Array.isArray(e.scenarios),`preview scenarios`),G({schema_version:e.schema_version,baseline_run_id:t.run_id,scenarios:e.scenarios.map(t=>W(t,e.schema_version===`commercial-scenario-preview-v1`))})}function q(e,t){return T(Array.isArray(e),t),e}function J(e){return e===null||a(e)}function Y(e){return A(e)&&e.toLowerCase()===e}function X(e){T((e.schema_version===V&&e.serialization_version===`scenario-preview-json-v2`||e.schema_version===`commercial-scenario-preview-v1`&&e.serialization_version===`scenario-preview-json-v1`)&&e.persisted===!1&&O(e.scenario_definition_version)&&O(e.calculation_version),`preview envelope versions`);let t=E(e.baseline,`baseline evidence`);T(Y(t.case_id)&&Y(t.run_id)&&j(t.revision)&&M(t.input_hash)&&M(t.payload_hash),`baseline evidence identity`);let n=E(t.assessment,`original assessment`),r=E(e.fingerprint,`preview fingerprint`);T(r.algorithm===`sha256`&&M(r.value)&&r.content===`baseline_identity+payload_hash+normalized_command+policy_snapshot+versions`,`preview fingerprint`);let i=E(e.selected_period,`selected operating period`);T(N(i.period_start)&&N(i.period_end)&&i.period_start<=i.period_end&&N(e.assumptions_as_of)&&i.period_end<=e.assumptions_as_of,`preview dates`),T(I(e.selected_period,n.selected_period)&&e.assumptions_as_of===n.assumptions_as_of&&I(e.policy_snapshot,n.policy_snapshot),`baseline period and retained policy`);let a=E(n.normalized_input,`baseline input`);return T(I(e.units,a.units),`baseline units`),T(q(e.held_fixed_assumptions,`held fixed assumptions`).length>0&&e.held_fixed_assumptions.every(O)&&O(e.disclaimer),`preview explanation`),K(e),{b:t,a:n}}function re(e,t,n){let r=E(e,`scenario preview`);F(r,0,100);let{b:i,a}=X(r);T(r.schema_version===V&&r.scenario_definition_version===`commercial-scenario-definition-v2`&&r.calculation_version===`commercial-calculation-v2`,`supported live scenario definition`);let o=w(a);t&&T(i.case_id===t.snapshot.case_id&&i.revision===t.snapshot.revision&&i.run_id===t.snapshot.run_id&&i.input_hash===t.snapshot.input_hash&&i.payload_hash===t.snapshot.payload_hash&&I(o,t.snapshot.assessment),`selected original baseline`),n&&T(I(K(r),G(n)),`reviewed normalized command`);for(let e of r.scenarios)ie(e,r,o);return r}function ie(e,t,n){let r=E(e,`scenario result`),i=W(r);T(I({scenario_key:r.scenario_key,name:r.name,rationale:r.rationale,assumptions:r.assumptions},i)&&r.coverage_basis===`stressed_latest_period_current_pro_forma`,`normalized projection command/basis`);let o=E(r.projection_inputs,`projected inputs`),s=n.normalized_input;S({...s,years:[...s.years.slice(0,-1),o.operating],proposed_loan:o.proposed_loan,existing_debt:o.existing_debt,guarantors:o.guarantors,working_capital:o.working_capital});for(let e of[`existing_debt`,`guarantors`,`working_capital`])T(I(o[e],s[e]),`held-fixed projected inputs`);let c=E(o.operating,`projected operating`),d=E(o.proposed_loan,`projected loan`),f=s.years[s.years.length-1];for(let e of l)[`gross_receipts`,`cogs`,`operating_expense_excl_dna_interest_comp`].includes(e)||T(c[e]===f[e],`held-fixed financial lines`);T(c.period_start===f.period_start&&c.period_end===f.period_end,`projected period`);for(let e of Object.keys(s.proposed_loan))e!==`annual_rate`&&T(d[e]===s.proposed_loan[e],`held-fixed loan`);let p=E(r.current_facts,`projected facts`),m=[];for(let e of u){let t=C(p[e]),r=e===`k1_history`||e===`k1_ratio_difference`,i=r?`baseline.`+n.current_facts[e].fact_id:[`ordinary_business_income`,`ebitda`].includes(e)?`projection.operating.${e}`:`projection.current.${e}`;T(t.fact_id===i&&(r?I(t,{...n.current_facts[e],fact_id:i}):J(t.raw_value)),`projected fact identity/type/observed history`),m.push(t)}let h=q(r.guarantor_contributions,`projected guarantors`);T(h.length===s.guarantors.length,`guarantor count`),h.forEach((e,t)=>{let n=E(e,`guarantor contribution`);T(n.guarantor_index===t&&n.name===s.guarantors[t].name,`guarantor identity`);for(let e of[`business_ebitda`,`outside_income`,`personal_debt`]){let r=C(n[e]);T(r.fact_id===`projection.current.guarantors.${t}.${e}`&&J(r.raw_value),`projected guarantor fact`),m.push(r)}});let g=x(r.decision);T(g.policy_version===n.policy_snapshot.version,`retained decision policy`);let _=q(r.calculation_trace,`projection trace`),v=/* @__PURE__ */ new Map;for(let e of _){let t=E(e,`trace row`),n=C(t);T(O(t.definition_id)&&O(t.expression)&&!v.has(n.fact_id),`trace identity`),v.set(n.fact_id,n),q(t.operands,`trace operands`)}for(let e of n.calculation_trace){let t={...e,fact_id:`baseline.`+e.fact_id,operands:e.operands.map(e=>({...e,reference:e.reference_type===`fact`?`baseline.`+e.reference:e.reference_type===`input`?`/baseline/assessment/normalized_input`+e.reference:e.reference}))};T(I(v.get(t.fact_id),t),`retained observed trace identity`)}for(let e of _)for(let n of E(e,`trace row`).operands){let e=E(n,`operand`);if(T(O(e.reference)&&O(e.unit)&&(e.raw_value===null||D(e.raw_value)||O(e.raw_value)),`operand value`),e.reference_type===`fact`){let t=v.get(e.reference);T(t&&t.raw_value===e.raw_value&&t.unit===e.unit,`referenced scenario fact`)}else{T([`input`,`policy`].includes(String(e.reference_type))&&e.reference.startsWith(`/`),`operand reference`);let n={...r,baseline:t.baseline,policy_snapshot:t.policy_snapshot};for(let t of e.reference.slice(1).split(`/`)){let e=ae(n);T(Object.prototype.hasOwnProperty.call(e,t),`scenario operand path`),n=e[t]}T(n===e.raw_value,`scenario operand value`)}}for(let e of m){let t=v.get(e.fact_id);T(t&&[`fact_id`,`raw_value`,`reported_value`,`unit`,`display_precision`,`status`,`explanation`].every(n=>t[n]===e[n]),`fact/trace fields`)}let y=q(r.comparisons,`metric comparisons`);T(y.length===u.length-1,`comparison count`);let b=/* @__PURE__ */ new Set;for(let e of y){let t=E(e,`metric comparison`);T(O(t.metric)&&u.includes(t.metric)&&t.metric!==`k1_history`&&!b.has(t.metric),`compared metric identity`),b.add(t.metric);let r=n.current_facts[t.metric],i=C(p[t.metric]);T(t.baseline_fact_id===`baseline.`+r.fact_id&&t.projected_fact_id===i.fact_id&&t.baseline_value===r.raw_value&&t.projected_value===i.raw_value&&t.unit===i.unit&&J(t.delta),`comparison fact links`),T(r.raw_value===null||i.raw_value===null?t.delta===null&&O(t.delta_explanation):a(t.delta)&&t.delta_explanation===null,`comparison availability`);let o=g.factors.find(e=>e.name===(t.metric===`uca_cash_flow`?`uca_positive`:t.metric));if([`dscr`,`fccr`,`global_dscr`,`uca_cash_flow`].includes(t.metric)){let e=E(t.policy_headroom,`policy headroom`);T(o&&e.comparison_operator===o.comparison_operator&&e.approval_threshold===o.threshold&&e.decline_threshold===o.decline_threshold,`headroom policy`);for(let t of[`baseline_approval`,`projected_approval`,`baseline_decline`,`projected_decline`])T(J(e[t]),`finite headroom`)}else T(t.policy_headroom===null,`non-policy headroom`)}for(let e of g.factors){let t=e.name===`uca_positive`?`uca_cash_flow`:e.name,r=n.decision.factors.find(t=>t.name===e.name);T(e.raw_value===C(p[t]).raw_value&&r&&[`threshold`,`decline_threshold`,`comparison_operator`,`weight`,`source`].every(t=>e[t]===r[t]),`scenario factor fact and retained policy`),t===`k1_history`&&T(I(e,r),`held-fixed observed K-1 factor`)}let w=q(r.factor_changes,`factor changes`);T(w.length===g.factors.length,`factor change count`);let k=/* @__PURE__ */ new Set;for(let e of w){let t=E(e,`factor change`),r=n.decision.factors.find(e=>e.name===t.name),i=g.factors.find(e=>e.name===t.name);T(O(t.name)&&!k.has(t.name)&&r&&i&&I(t.baseline,r)&&I(t.projected,i)&&t.changed===!I(r,i)&&t.basis===(t.name===`k1_history`?`observed_history`:`projected_current`),`factor change links`),k.add(t.name),T(t.projected_fact_id===C(p[t.name===`uca_positive`?`uca_cash_flow`:t.name]).fact_id,`factor projected reference`)}let A=E(r.outcome_change,`outcome change`);T(A.baseline===n.decision.outcome&&A.projected===g.outcome&&A.changed===(A.baseline!==A.projected),`outcome change links`);let j=q(r.reason_changes,`reason changes`),M=Array.from(new Set([...n.decision.reasons,...g.reasons].map(e=>e.code))).filter(e=>!I(n.decision.reasons.find(t=>t.code===e)??null,g.reasons.find(t=>t.code===e)??null));T(j.length===M.length,`reason changes count`);let N=/* @__PURE__ */ new Set;for(let e of j){let t=E(e,`reason change`),r=n.decision.reasons.find(e=>e.code===t.code)??null,i=g.reasons.find(e=>e.code===t.code)??null;T(O(t.code)&&M.includes(t.code)&&!N.has(t.code)&&I(t.baseline,r)&&I(t.projected,i)&&t.change===(r===null?`added`:i===null?`removed`:`changed`),`reason change links`),N.add(t.code)}}function ae(e){return T(typeof e==`object`&&!!e,`operand path object`),e}function oe(e,t){let n=E(e,`original comparison`);F(n,0,100),T([`commercial-scenario-comparison-v1`,`commercial-scenario-comparison-v2`].includes(String(n.schema_version))&&n.storage_serialization_version===`scenario-comparison-json-v1`&&n.persisted===!0&&Y(n.comparison_id)&&Y(n.case_id)&&Y(n.baseline_run_id)&&j(n.baseline_revision)&&M(n.payload_hash),`comparison storage identity`),T(P(n.recorded_at)&&/^\\d{4}-\\d\\d-\\d\\dT(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{6}\\+00:00$/.test(n.recorded_at)&&k(n.actor),`comparison recording time/actor`),z(n.recording),T(t===`\"scenario-comparison-json-v1:${n.case_id}:${n.comparison_id}:${n.payload_hash}\"`,`comparison ETag`);let r=E(n.preview,`original preview`),{b:i,a}=X(r);T(i.case_id===n.case_id&&i.revision===n.baseline_revision&&i.run_id===n.baseline_run_id,`inner/outer original baseline`);let o=r.schema_version===V&&r.scenario_definition_version===`commercial-scenario-definition-v2`&&r.calculation_version===`commercial-calculation-v2`&&a.schema_version===`commercial-assessment-v2`&&a.calculation_version===`commercial-calculation-v2`&&a.serialization_version===`assessment-json-v2`;return{record:n,etag:t,preview:o?re(r):null,compatibility:o?null:`Original definition: ${r.scenario_definition_version} / ${r.calculation_version}; baseline ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON remains available; typed projection and new preview are unavailable.`}}function se(e,t){return`spreadline-case-${e.case_id}-r${e.revision}-${e.run_id}${t?`-comparison-${t.comparison_id}`:``}.json`}function Z(e,t){let n=/* @__PURE__ */ new Set;function r(e,i){if(T(i<t,`export source JSON depth`),e===null||typeof e==`string`||typeof e==`boolean`)return e;if(typeof e==`number`)return T(Number.isFinite(e),`export finite number`),e;T(typeof e==`object`&&!!e,`export JSON value`);let a=e;T(!n.has(a),`export JSON cycle`),T(Object.getOwnPropertySymbols(a).length===0,`export JSON symbol keys`);let o=Array.isArray(a);T(o||Object.getPrototypeOf(a)===Object.prototype||Object.getPrototypeOf(a)===null,`export plain JSON object`);let s=Object.getOwnPropertyNames(a).filter(e=>!o||e!==`length`);o&&T(s.length===a.length&&s.every((e,t)=>e===String(t)),`export dense JSON array`),n.add(a);let c=o?[]:Object.create(null);for(let e of s){let t=Object.getOwnPropertyDescriptor(a,e);T(t.enumerable&&`value`in t,`export plain JSON property`),c[e]=r(t.value,i+1)}return n.delete(a),Object.freeze(c)}return r(e,0)}function ce(e,t){let n=e.snapshot,r=t.record,i=E(r.preview.baseline,`export comparison baseline`);T(r.case_id===n.case_id&&r.baseline_revision===n.revision&&r.baseline_run_id===n.run_id&&i.case_id===n.case_id&&i.revision===n.revision&&i.run_id===n.run_id&&i.input_hash===n.input_hash&&i.payload_hash===n.payload_hash&&I(i.assessment,n.assessment),`retained comparison must match the selected original case, revision, run, hashes and full baseline assessment`)}function le(e,t){let n=Z(e.snapshot,64),r=ne(n,e.etag),i=t===null?null:oe(Z(t.record,100),t.etag);i&&ce(r,i);let a=se(n,i?.record??null);return{package:Object.freeze({schema_version:`spreadline-review-package-v1`,serialization_version:`review-package-json-v1`,scope:`saved_case_revision`,case:Object.freeze({etag:r.etag,snapshot:n}),comparison:i?Object.freeze({etag:i.etag,record:i.record}):null,provenance:Object.freeze({representation:`browser_parsed_json`,actor_status:`prototype_unverified`,integrity_status:`recorded_hashes_not_verified_by_export`}),disclaimer:`Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.`}),filename:a,view:r,comparison:i}}function*Q(e){yield`\"`;for(let t=0;t<e.length;){let n=Math.min(t+4096,e.length);n<e.length&&e.charCodeAt(n-1)>=55296&&e.charCodeAt(n-1)<=56319&&e.charCodeAt(n)>=56320&&e.charCodeAt(n)<=57343&&n--,yield JSON.stringify(e.slice(t,n)).slice(1,-1),t=n}yield`\"`}function*$(e,t=0,n=/* @__PURE__ */ new Set){if(T(t<104,`export envelope JSON depth`),typeof e==`string`){yield*Q(e);return}if(e===null||typeof e==`boolean`){yield String(e);return}if(typeof e==`number`){T(Number.isFinite(e),`export finite number`),yield JSON.stringify(e);return}T(typeof e==`object`&&!!e,`export JSON value`);let r=e,i=Array.isArray(r);T(!n.has(r),`export JSON cycle`),T(Object.getOwnPropertySymbols(r).length===0&&(i||Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null),`export plain JSON object`);let a=Object.getOwnPropertyNames(r).filter(e=>!i||e!==`length`);i?T(a.length===r.length&&a.every((e,t)=>e===String(t)),`export dense JSON array`):a.sort(),n.add(r),yield i?`[`:`{`;for(let e=0;e<a.length;e++){let o=a[e],s=Object.getOwnPropertyDescriptor(r,o);T(s.enumerable&&`value`in s,`export plain JSON property`),yield`${e?`,`:``}\\n${`  `.repeat(t+1)}`,i||(yield*Q(o),yield`: `),yield*$(s.value,t+1,n)}a.length&&(yield`\\n${`  `.repeat(t)}`),yield i?`]`:`}`,n.delete(r)}async function ue(e,t){let n=new TextEncoder,r=[],i=0,a=``,o=0;function s(){if(t?.aborted)throw Error(`Export preparation cancelled.`)}function c(){s();let e=n.encode(a);if(i+e.byteLength>16777216)throw Error(`The complete review package exceeds 16 MiB. No file was prepared. Choose a case-only package explicitly, or a smaller original.`);i+=e.byteLength,o+=e.byteLength,r.push(e),a=``}s();for(let t of $(e))a+=t,a.length>=8192&&c(),o>=131072&&(await new Promise(e=>setTimeout(e,0)),o=0,s());return a+=`\n`,c(),s(),{chunks:r,size:i}}self.onmessage=async e=>{try{let t=le(e.data.view,e.data.comparison),{chunks:n,size:r}=await ue(t.package),i=n.map(e=>e.buffer);self.postMessage({filename:t.filename,buffers:i,size:r},{transfer:i})}catch(e){self.postMessage({error:e instanceof Error?e.message:`Unable to prepare the original review package.`})}}})();", Nn = typeof self < "u" && self.Blob && new Blob(["(self.URL || self.webkitURL).revokeObjectURL(self.location.href);", Mn], { type: "text/javascript;charset=utf-8" });
function Pn(e) {
	let t;
	try {
		if (t = Nn && (self.URL || self.webkitURL).createObjectURL(Nn), !t) throw "";
		let n = new Worker(t, { name: e?.name });
		return n.addEventListener("error", () => {
			(self.URL || self.webkitURL).revokeObjectURL(t);
		}), n;
	} catch {
		return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(Mn), { name: e?.name });
	}
}
//#endregion
//#region src/useReviewDownload.ts
function Fn(e) {
	let t = (0, x.useRef)(e);
	t.current = e;
	let n = (0, x.useRef)(null), r = (0, x.useRef)(null), i = (0, x.useRef)(!0), [a, o] = (0, x.useState)({
		scope: e,
		busy: !1,
		error: "",
		file: null
	});
	function s(e) {
		n.current && (e === void 0 || n.current.scope === e) && (n.current.worker.terminate(), n.current = null), r.current && (e === void 0 || r.current.scope === e) && (URL.revokeObjectURL(r.current.url), r.current = null);
	}
	(0, x.useEffect)(() => () => s(e), [e]), (0, x.useEffect)(() => (i.current = !0, () => {
		i.current = !1, s();
	}), []);
	function c(a, c) {
		if (n.current?.scope === e) return;
		s(), o({
			scope: e,
			busy: !0,
			error: "",
			file: null
		});
		let l, u = An(a.snapshot, c?.record ?? null);
		function d() {
			return i.current && t.current === e && n.current === l;
		}
		function f(t) {
			d() && (l.worker.terminate(), n.current = null, o({
				scope: e,
				busy: !1,
				error: t,
				file: null
			}));
		}
		try {
			l = {
				scope: e,
				worker: new Pn()
			}, n.current = l, l.worker.onmessage = (t) => {
				if (!d()) return;
				if (!t.data || typeof t.data != "object" || Array.isArray(t.data)) {
					f("Export preparation returned an invalid file. No download was offered.");
					return;
				}
				let i = t.data;
				if ("error" in i) {
					f(typeof i.error == "string" ? i.error : "Export preparation returned an invalid file. No download was offered.");
					return;
				}
				if (i.filename !== u || typeof i.size != "number" || !Number.isSafeInteger(i.size) || i.size < 1 || i.size > 16777216 || !Array.isArray(i.buffers) || !i.buffers.every((e) => e instanceof ArrayBuffer) || i.buffers.reduce((e, t) => e + t.byteLength, 0) !== i.size) {
					f("Export preparation returned an invalid file. No download was offered.");
					return;
				}
				try {
					let t = URL.createObjectURL(new Blob(i.buffers, { type: "application/json;charset=utf-8" })), a = {
						scope: e,
						url: t,
						filename: i.filename,
						size: i.size
					};
					r.current = a, l.worker.terminate(), n.current = null, o({
						scope: e,
						busy: !1,
						error: "",
						file: a
					});
					let s = document.createElement("a");
					s.href = t, s.download = a.filename, document.body.appendChild(s), s.click(), s.remove();
				} catch {
					s(), o({
						scope: e,
						busy: !1,
						error: "The browser could not offer the prepared file. Try an explicit download again.",
						file: null
					});
				}
			}, l.worker.onerror = (e) => {
				e.preventDefault(), f("The browser could not prepare this review package. No file was offered.");
			}, l.worker.onmessageerror = (e) => {
				e.preventDefault(), f("Export preparation returned an invalid file. No download was offered.");
			}, l.worker.postMessage({
				view: {
					snapshot: a.snapshot,
					etag: a.etag
				},
				comparison: c ? {
					record: c.record,
					etag: c.etag
				} : null
			});
		} catch {
			s(), o({
				scope: e,
				busy: !1,
				error: "The browser could not start export preparation. No file was offered.",
				file: null
			});
		}
	}
	return {
		...a.scope === e ? a : {
			busy: !1,
			error: "",
			file: null
		},
		prepare: c
	};
}
//#endregion
//#region src/Review.tsx
function In(e) {
	return typeof e == "string" ? e.length > 240 ? `${e.slice(0, 240)}…` : e : "Unavailable";
}
function Ln({ view: e, selection: t, headRevision: n, sourceScope: r, original: i, pending: a, onOpenBaseline: o }) {
	let s = i.loading || i.error ? null : i.view, c = `${r}:${e?.etag ?? ""}:${i.context}:${i.loading}:${s?.etag ?? ""}:${i.error}`, [l, u] = (0, x.useState)({
		source: c,
		included: !1
	}), d = l.source === c && l.included, f = Fn(`${c}:${d}`), p = !1;
	if (e && s) try {
		jn(e, s), p = !0;
	} catch {}
	let m = e?.assessment, h = e?.snapshot, g = s?.record, _ = s?.preview?.scenarios.length ?? (Array.isArray(g?.preview.scenarios) ? g.preview.scenarios.length : 0);
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "reviewWorkspace",
		children: [
			/* @__PURE__ */ (0, B.jsxs)("section", {
				className: "panel reviewIdentity",
				children: [
					/* @__PURE__ */ (0, B.jsx)("p", {
						className: "eyebrow",
						children: "ORIGINAL RECORD · REVIEW PACKAGE"
					}),
					/* @__PURE__ */ (0, B.jsx)("h2", { children: "Saved-run review" }),
					h ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
						/* @__PURE__ */ (0, B.jsx)("h3", { children: In(h.normalized_input.borrower_name) }),
						/* @__PURE__ */ (0, B.jsxs)("dl", {
							className: "reviewFacts",
							children: [
								/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("dt", { children: "Case" }), /* @__PURE__ */ (0, B.jsx)("dd", { children: h.case_id })] }),
								/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("dt", { children: "Selected revision / run" }), /* @__PURE__ */ (0, B.jsxs)("dd", { children: [
									h.revision,
									" / ",
									h.run_id
								] })] }),
								/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("dt", { children: "Recorded at" }), /* @__PURE__ */ (0, B.jsx)("dd", { children: h.recorded_at })] }),
								/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("dt", { children: "Selection" }), /* @__PURE__ */ (0, B.jsxs)("dd", { children: [t === "latest" ? "Latest when fetched" : "Original selected revision", n === null ? " · current head not confirmed" : ` · known head ${n}`] })] }),
								/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("dt", { children: "Financial definitions" }), /* @__PURE__ */ (0, B.jsxs)("dd", { children: [
									In(h.assessment.schema_version),
									" / ",
									In(h.assessment.calculation_version),
									" / ",
									In(h.assessment.serialization_version)
								] })] }),
								/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("dt", { children: "Recording" }), /* @__PURE__ */ (0, B.jsxs)("dd", { children: ["Actor: prototype demo, unverified · ", h.recording.source_status === "build_reported" ? "build revision reported, unverified" : "development build, unverified"] })] })
							]
						}),
						m ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
							/* @__PURE__ */ (0, B.jsxs)("p", { children: [
								"Operating period: ",
								m.selected_period.period_start,
								" – ",
								m.selected_period.period_end,
								" · assumptions as of ",
								m.assumptions_as_of,
								" · USD dollars."
							] }),
							/* @__PURE__ */ (0, B.jsxs)("p", { children: [
								"Original outcome: ",
								/* @__PURE__ */ (0, B.jsx)("strong", { children: m.decision.outcome.toUpperCase() }),
								" · policy ",
								In(m.policy_snapshot.version),
								". Current pro forma coverage; observed history remains separate."
							] }),
							/* @__PURE__ */ (0, B.jsx)("div", {
								className: "reviewMetrics",
								children: [
									["EBITDA", m.current_facts.ebitda],
									["UCA cash flow", m.current_facts.uca_cash_flow],
									["DSCR", m.current_facts.dscr],
									["FCCR", m.current_facts.fccr],
									["Global DSCR", m.current_facts.global_dscr],
									["Observed K-1 history", m.current_facts.k1_history]
								].map(([e, t]) => /* @__PURE__ */ (0, B.jsxs)("div", { children: [
									/* @__PURE__ */ (0, B.jsx)("span", { children: e }),
									/* @__PURE__ */ (0, B.jsx)("strong", { children: Be(t) }),
									t.explanation && /* @__PURE__ */ (0, B.jsx)("small", { children: In(t.explanation) })
								] }, e))
							}),
							/* @__PURE__ */ (0, B.jsxs)("p", { children: [
								"Recorded reasons: ",
								m.decision.reasons.length,
								". Inspect factors and calculations in the existing Details and Memo views."
							] })
						] }) : /* @__PURE__ */ (0, B.jsx)("p", {
							className: "warning",
							children: "Original JSON only. These financial definitions are not supported for typed conclusions. The guarded original can still be downloaded."
						})
					] }) : /* @__PURE__ */ (0, B.jsx)("p", { children: "Save or open a dated commercial revision to review and export its original evidence. Unsaved inputs, legacy decisions and incomplete case transitions cannot supply this package." })
				]
			}),
			/* @__PURE__ */ (0, B.jsxs)("section", {
				className: "panel reviewComparison",
				children: [
					/* @__PURE__ */ (0, B.jsx)("h2", { children: "Retained comparison" }),
					i.loading ? /* @__PURE__ */ (0, B.jsx)("p", {
						role: "status",
						children: "Loading the selected original comparison…"
					}) : i.error ? /* @__PURE__ */ (0, B.jsx)("p", {
						role: "alert",
						children: i.error
					}) : g ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
						/* @__PURE__ */ (0, B.jsxs)("dl", {
							className: "reviewFacts",
							children: [
								/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("dt", { children: "Comparison" }), /* @__PURE__ */ (0, B.jsx)("dd", { children: g.comparison_id })] }),
								/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("dt", { children: "Baseline revision / run" }), /* @__PURE__ */ (0, B.jsxs)("dd", { children: [
									g.baseline_revision,
									" / ",
									g.baseline_run_id
								] })] }),
								/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("dt", { children: "Recorded at" }), /* @__PURE__ */ (0, B.jsx)("dd", { children: g.recorded_at })] })
							]
						}),
						/* @__PURE__ */ (0, B.jsxs)("p", { children: [
							"Full retained batch: ",
							_,
							" ",
							_ === 1 ? "scenario" : "scenarios",
							" in original order."
						] }),
						/* @__PURE__ */ (0, B.jsx)("ul", { children: (s?.preview?.scenarios ?? g.preview.scenarios).map((e, t) => /* @__PURE__ */ (0, B.jsx)("li", { children: In(e.name) }, t)) }),
						/* @__PURE__ */ (0, B.jsxs)("p", {
							className: "reviewHash",
							children: ["Preview fingerprint: ", In(g.preview.fingerprint?.value)]
						}),
						s?.compatibility && /* @__PURE__ */ (0, B.jsx)("p", {
							className: "warning",
							children: "Original JSON only for this comparison; typed projections are unavailable."
						}),
						!p && /* @__PURE__ */ (0, B.jsx)("p", {
							className: "warning",
							children: "This retained comparison has a different original baseline. Open that explicit revision to match its evidence before inclusion."
						}),
						!p && h && g.case_id === h.case_id && /* @__PURE__ */ (0, B.jsx)("button", {
							onClick: () => o({
								caseId: g.case_id,
								revision: g.baseline_revision
							}),
							children: "Open comparison baseline revision"
						})
					] }) : /* @__PURE__ */ (0, B.jsx)("p", { children: "Open a retained original in Scenarios to include its full batch. A live preview or pending save is excluded." }),
					/* @__PURE__ */ (0, B.jsxs)("label", {
						className: "reviewInclude",
						children: [/* @__PURE__ */ (0, B.jsx)("input", {
							type: "checkbox",
							checked: d,
							disabled: !e || !p || i.loading,
							onChange: (e) => u({
								source: c,
								included: e.target.checked
							})
						}), "Include this retained comparison"]
					})
				]
			}),
			/* @__PURE__ */ (0, B.jsxs)("section", {
				className: "panel reviewExport",
				children: [
					/* @__PURE__ */ (0, B.jsx)("h2", { children: "JSON review package" }),
					/* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Includes the full selected original: financial inputs, guarantor details, assessment, policy, trace, reasons, its revision event and recording metadata",
						d ? ", plus the full matching retained comparison batch" : "",
						". This is one revision event, not the entire case history."
					] }),
					/* @__PURE__ */ (0, B.jsx)("p", { children: "Browser-parsed JSON representation; formatting and numeric spellings can differ from server bytes. Recorded hashes are carried unchanged, not verified by this export or calculated over the downloaded file." }),
					a && /* @__PURE__ */ (0, B.jsx)("p", {
						className: "warning",
						children: "Pending work is excluded. Downloading this original leaves recovery tracking unchanged."
					}),
					/* @__PURE__ */ (0, B.jsx)("button", {
						disabled: !e || f.busy || d && !p,
						onClick: () => {
							e && f.prepare(e, d ? s : null);
						},
						children: "Download JSON review package"
					}),
					/* @__PURE__ */ (0, B.jsx)("p", {
						role: "status",
						children: f.busy && h ? `Preparing ${An(h, d ? g ?? null : null)}…` : f.file ? `Prepared ${f.file.filename} (${f.file.size.toLocaleString("en-US")} bytes). The browser handles saving.` : "Maximum complete file: 16 MiB. No evidence is truncated."
					}),
					f.error && /* @__PURE__ */ (0, B.jsx)("p", {
						role: "alert",
						children: f.error
					}),
					f.file && /* @__PURE__ */ (0, B.jsx)("a", {
						className: "reviewDownload",
						href: f.file.url,
						download: f.file.filename,
						children: "Download prepared JSON"
					}),
					/* @__PURE__ */ (0, B.jsx)("p", {
						className: "fine",
						children: kn
					})
				]
			})
		]
	});
}
var Rn = {
	borrower_name: "Alpine Fabrication",
	geography: "60601",
	years: [{
		gross_receipts: 39e5,
		cogs: 257e4,
		operating_expense_excl_dna_interest_comp: 607e3,
		officer_compensation: 175e3,
		depreciation: 9e4,
		amortization: 1e4,
		interest_expense: 58e3,
		section_179: 0,
		k1_distribution: 28e4
	}, {
		gross_receipts: 42e5,
		cogs: 275e4,
		operating_expense_excl_dna_interest_comp: 64e4,
		officer_compensation: 18e4,
		depreciation: 95e3,
		amortization: 1e4,
		interest_expense: 62e3,
		section_179: 4e4,
		k1_distribution: 3e5
	}],
	existing_debt: {
		cpltd_annual: 58e3,
		operating_lease_annual: 24e3
	},
	proposed_loan: {
		amount: 5e5,
		annual_rate: .105,
		term_months: 120
	},
	guarantors: [{
		name: "Dana Alpine",
		ownership_percentage: 1,
		wages: 65e3,
		interest_dividend_income: 3e3,
		mortgage_pi_annual: 28800,
		auto_loan_annual: 7200,
		credit_card_min_annual: 3600
	}],
	working_capital: {
		ar_increase: 14e4,
		inventory_increase: 6e4,
		ap_increase: 5e4,
		cash_taxes_paid: 95e3
	},
	overrides: []
}, zn = {
	schema_version: "commercial-assessment-v2",
	assessment_as_of: "2026-10-06",
	borrower_name: "Alpine Fabrication",
	geography: "60601",
	units: {
		currency: "USD",
		monetary_unit: "dollars",
		annual_rate_unit: "decimal_nominal"
	},
	years: [{
		period_start: "2024-01-01",
		period_end: "2024-12-31",
		gross_receipts: "3900000",
		cogs: "2570000",
		operating_expense_excl_dna_interest_comp: "607000",
		officer_compensation: "175000",
		depreciation: "90000",
		amortization: "10000",
		interest_expense: "58000",
		section_179: "0",
		k1_distribution: "280000"
	}, {
		period_start: "2025-01-01",
		period_end: "2025-12-31",
		gross_receipts: "4200000",
		cogs: "2750000",
		operating_expense_excl_dna_interest_comp: "640000",
		officer_compensation: "180000",
		depreciation: "95000",
		amortization: "10000",
		interest_expense: "62000",
		section_179: "40000",
		k1_distribution: "300000"
	}],
	existing_debt: {
		cpltd_annual: "58000",
		operating_lease_annual: "24000"
	},
	proposed_loan: {
		amount: "500000",
		annual_rate: "0.105",
		term_months: 120,
		rate_type: "fixed",
		repayment_type: "fully_amortizing",
		payment_frequency: "monthly"
	},
	guarantors: [{
		name: "Dana Alpine",
		ownership_percentage: "1",
		wages: "65000",
		interest_dividend_income: "3000",
		mortgage_pi_annual: "28800",
		auto_loan_annual: "7200",
		credit_card_min_annual: "3600"
	}],
	working_capital: {
		period_start: "2025-01-01",
		period_end: "2025-12-31",
		ar_increase: "140000",
		inventory_increase: "60000",
		ap_increase: "50000",
		cash_taxes_paid: "95000"
	}
}, Bn = class {
	storage;
	transport;
	state;
	listeners = /* @__PURE__ */ new Set();
	request = null;
	constructor(e, t = fetch) {
		this.storage = e, this.transport = t;
		let n = Mt(e);
		this.state = {
			operation: n.operation,
			recoveryError: n.error,
			writeError: null,
			inFlight: !1
		};
	}
	snapshot = () => this.state;
	subscribe = (e) => (this.listeners.add(e), () => {
		this.listeners.delete(e);
	});
	update(e) {
		this.state = {
			...this.state,
			...e
		};
		for (let e of this.listeners) e();
	}
	start(e) {
		if (this.state.operation || this.state.inFlight || this.state.recoveryError) throw Error("Resolve this tab's existing saved write first.");
		return this.submit(e);
	}
	retry() {
		let e = this.state.operation;
		if (!e || this.state.inFlight || this.state.writeError?.status === 409 && !this.state.writeError.certain) throw Error("Review this pending operation before retrying.");
		return this.submit(e);
	}
	submit(e) {
		let t = wt(e);
		if (this.state.operation && !z(this.state.operation, t)) throw Error("The pending operation cannot be replaced.");
		try {
			jt(this.storage, t);
		} catch (e) {
			let t = Mt(this.storage);
			throw this.update({
				operation: t.operation,
				recoveryError: t.error
			}), e;
		}
		let n = new AbortController();
		return this.request = n, this.update({
			operation: t,
			inFlight: !0,
			writeError: null
		}), this.deliver(t, n);
	}
	clear(e) {
		try {
			Nt(this.storage, e.id), this.update({
				operation: null,
				recoveryError: ""
			});
		} catch {
			this.update({ recoveryError: "The response was received, but this tab could not clear its recovery tracking. Retrying the same operation is safe." });
		}
	}
	async deliver(e, t) {
		try {
			let n = e.kind === "comparison" ? {
				kind: "comparison",
				...await sn(e, t.signal, this.transport)
			} : {
				kind: "case",
				...await Vt(e, t.signal, this.transport)
			};
			if (t.signal.aborted) throw new Lt("The view closed before acknowledgment. Keep the original operation for exact retry.");
			return this.clear(e), n;
		} catch (t) {
			let n = Rt(t);
			throw this.update({ writeError: n }), n.certain && this.clear(e), n;
		} finally {
			this.request === t && (this.request = null, this.update({ inFlight: !1 }));
		}
	}
	discard() {
		if (this.request) throw Error("Wait for the current response before discarding tracking.");
		Pt(this.storage), this.update({
			operation: null,
			recoveryError: "",
			writeError: null
		});
	}
	clearError() {
		this.update({ writeError: null });
	}
	abort() {
		this.request?.abort();
	}
};
function Vn() {
	let [e] = (0, x.useState)(() => new Bn(Et())), t = (0, x.useSyncExternalStore)(e.subscribe, e.snapshot);
	return (0, x.useEffect)(() => () => e.abort(), [e]), {
		...t,
		controller: e
	};
}
//#endregion
//#region src/useAnalystWorkspace.ts
function Hn() {
	let [e, t] = (0, x.useReducer)(se, oe), n = (0, x.useRef)(e);
	n.current = e;
	let r = (0, x.useRef)(0), i = (0, x.useRef)(null), a = (0, x.useRef)(null), o = (0, x.useRef)(null), s = (0, x.useRef)(!1), c = Vn(), { operation: l, recoveryError: u, inFlight: d, writeError: f } = c, [p, m] = (0, x.useState)(null), [h, g] = (0, x.useState)(null), _ = (0, x.useRef)(0), [v, y] = (0, x.useState)(""), [S, C] = (0, x.useState)(null), [w, T] = (0, x.useState)(null), [E, D] = (0, x.useState)(null), O = (0, x.useRef)(E);
	O.current = E;
	function k(e, n, o = "evaluate") {
		let s = ++r.current;
		return i.current?.abort(), a.current?.abort(), i.current = null, a.current = null, t({
			type: "start",
			id: s,
			filename: e,
			draft: n,
			action: o
		}), s;
	}
	async function ee(e, n = k(e.filename, e)) {
		if (n !== r.current) return;
		t({
			type: "start",
			id: n,
			filename: e.filename,
			draft: e
		});
		let a = new AbortController();
		i.current = a;
		try {
			let i = await nt(e, a.signal);
			n === r.current && !a.signal.aborted && t({
				type: "success",
				id: n,
				accepted: i
			});
		} catch (e) {
			n === r.current && !a.signal.aborted && t({
				type: "failure",
				id: n,
				error: `Invalid fixture or unavailable backend: ${e instanceof Error ? e.message : String(e)}`
			});
		}
	}
	function te(e) {
		It(Et(), null), ee({
			mode: e,
			payload: e === "dated" ? zn : re(Rn),
			filename: e === "dated" ? "alpine_dated_v2.json" : "alpine.json",
			resetHistory: !0
		});
	}
	async function A(e) {
		if (!e) return;
		It(Et(), null);
		let n = k(e.name, null);
		try {
			if (e.size > 1e6) throw Error("Use a JSON file no larger than 1,000,000 bytes.");
			let t = await e.text();
			if (n !== r.current) return;
			let i = b(t);
			await ee({
				mode: M(i),
				payload: i,
				filename: e.name,
				rawJson: t,
				resetHistory: !0
			}, n);
		} catch (e) {
			n === r.current && t({
				type: "failure",
				id: n,
				error: `Invalid fixture: ${e instanceof Error ? e.message : String(e)}`
			});
		}
	}
	async function j(e) {
		let n = k(`Saved case ${e.caseId}`, null, "open"), a = new AbortController();
		i.current = a, It(Et(), e);
		try {
			let i = await Bt(e.caseId, e.revision, a.signal);
			n === r.current && !a.signal.aborted && t({
				type: "stored-success",
				id: n,
				view: i,
				selection: e.revision === "latest" ? "latest" : "revision"
			});
		} catch (e) {
			n === r.current && !a.signal.aborted && t({
				type: "failure",
				id: n,
				error: Rt(e).message
			});
		}
	}
	async function ne(e, n) {
		let i = new AbortController();
		a.current = i;
		try {
			let a = await Bt(e.snapshot.case_id, "latest", i.signal);
			if (n !== r.current || i.signal.aborted) return;
			if (a.snapshot.revision < e.snapshot.revision || a.snapshot.revision === e.snapshot.revision && (a.etag !== e.etag || a.snapshot.run_id !== e.snapshot.run_id)) throw Error("Latest snapshot disagrees with the acknowledged receipt.");
			t({
				type: "head",
				id: n,
				caseId: e.snapshot.case_id,
				revision: e.snapshot.revision,
				headRevision: a.snapshot.revision
			}), It(Et(), {
				caseId: e.snapshot.case_id,
				revision: a.snapshot.revision === e.snapshot.revision ? "latest" : e.snapshot.revision
			});
		} catch (e) {
			n === r.current && !i.signal.aborted && y(`Write accepted. Latest could not be confirmed; this original receipt remains read-only. ${Rt(e).message}`);
		}
	}
	async function ie(e) {
		o.current?.abort();
		let t = new AbortController();
		o.current = t;
		try {
			let n = await Bt(e.caseId, "latest", t.signal);
			if (t.signal.aborted || !s.current) return;
			if (!n.assessment || n.snapshot.revision < e.baseRevision || !z(be(n.snapshot.normalized_input, e.review.path).context, e.context)) throw Error("The latest field's definition/context cannot be reviewed with this proposal.");
			D((t) => t?.operation.id === e.id ? {
				...t,
				latest: n,
				error: ""
			} : t);
		} catch (n) {
			!t.signal.aborted && s.current && D((t) => t?.operation.id === e.id ? {
				...t,
				latest: null,
				error: Rt(n).message
			} : t);
		}
	}
	async function ae(e, n, i, a) {
		y("");
		try {
			let e = await a;
			if (e.kind !== "case") throw Error("Unexpected comparison receipt for case write");
			if (!s.current) return;
			T(null), y(`${e.replayed ? "Recovered the original" : "Saved"} revision ${e.view.snapshot.revision}.`), n === r.current ? (t({
				type: "stored-success",
				id: n,
				view: e.view,
				selection: "receipt",
				resetPeriod: i
			}), It(Et(), {
				caseId: e.view.snapshot.case_id,
				revision: e.view.snapshot.revision
			}), ne(e.view, n)) : C(e.view);
		} catch (i) {
			if (!s.current) return;
			let a = Rt(i);
			a.certain && (a.status === 412 && e.kind === "edit" ? (D({
				operation: e,
				latest: null,
				error: ""
			}), ie(e)) : T(e)), n === r.current && t({
				type: "failure",
				id: n,
				error: a.message
			});
		}
	}
	function N(e, t) {
		if (c.controller.snapshot().inFlight || c.controller.snapshot().operation || u || O.current) throw Error("Resolve this tab's existing saved write or proposal first.");
		let n = c.controller.start(e);
		T(null), C(null), ae(e, k(e.kind === "create" ? "Saving dated case" : `Saved case ${e.caseId}`, null, "write"), t, n);
	}
	function le(e) {
		let t = n.current;
		if (t.status !== "ready" || t.accepted?.mode !== "dated" || t.saved) throw Error("Open an accepted unsaved dated input before saving.");
		N(kt(t.accepted.input, e), !0);
	}
	function P(e = n.current) {
		return e.status === "ready" && !!e.accepted && (!e.saved || !c.controller.snapshot().operation && !u && !O.current && !!e.saved.view.assessment && e.saved.selection === "latest" && e.saved.headRevision === e.saved.view.snapshot.revision);
	}
	function F(e, t) {
		let r = n.current;
		if (!P(r) || !r.accepted) throw Error("Open a supported latest revision and resolve pending work before editing.");
		r.saved ? N(At(r.saved.view, e, t), !1) : ee({
			mode: r.accepted.mode,
			payload: ce(r.accepted.input, e),
			filename: r.accepted.filename,
			edit: e
		});
	}
	function ue() {
		let e = c.controller.snapshot().operation;
		if (!e || d || f?.status === 409 && !f.certain) return;
		let t = c.controller.retry();
		if (e.kind === "comparison") {
			de(e, r.current, t);
			return;
		}
		ae(e, k(e.kind === "create" ? "Recovering saved case" : `Saved case ${e.caseId}`, null, "write"), e.kind === "create", t);
	}
	function I() {
		c.controller.discard(), y("Local recovery tracking discarded. This does not undo a write that might already be saved.");
	}
	async function de(e, t, n) {
		g(null), y("");
		try {
			let r = await n;
			if (!s.current) return;
			if (r.kind !== "comparison") throw Error("Unexpected case receipt for comparison save");
			m({
				scope: t,
				view: r.view,
				operationId: e.id,
				serial: ++_.current
			}), y(`${r.replayed ? "Recovered the original" : "Saved"} comparison ${r.view.record.comparison_id}.`);
		} catch (e) {
			if (s.current) {
				let n = Rt(e);
				g({
					scope: t,
					message: n.message,
					code: n.code
				});
			}
		}
	}
	function L(e) {
		let t = n.current, i = e.baseline;
		if (t.status !== "ready" || !t.saved || O.current || t.saved.view.snapshot.case_id !== i.case_id || t.saved.view.snapshot.revision !== i.revision || t.saved.view.snapshot.run_id !== i.run_id || t.saved.view.snapshot.payload_hash !== i.payload_hash) throw Error("Review the currently selected original baseline before saving.");
		let a = Tt(e), o = c.controller.start(a);
		de(a, r.current, o);
	}
	function fe(e) {
		let n = k(`Saved case ${e.snapshot.case_id}`, null, "open");
		t({
			type: "stored-success",
			id: n,
			view: e,
			selection: "latest"
		}), It(Et(), {
			caseId: e.snapshot.case_id,
			revision: "latest"
		}), o.current?.abort(), D(null), O.current = null, c.controller.clearError();
	}
	function pe() {
		let e = O.current;
		if (!e?.latest) return null;
		let t = JSON.parse(e.operation.body), n = be(e.latest.snapshot.normalized_input, e.operation.review.path).value;
		return fe(e.latest), {
			field: {
				...e.operation.review,
				value: n
			},
			proposal: {
				path: e.operation.review.path,
				prior: n,
				next: t.new_value,
				rationale: t.rationale,
				at: "unverified proposal"
			}
		};
	}
	function R() {
		let e = O.current;
		e?.latest ? fe(e.latest) : (o.current?.abort(), D(null), O.current = null);
	}
	return (0, x.useEffect)(() => {
		s.current = !0;
		let e = c.controller.snapshot().operation;
		if (e && e.kind !== "comparison") {
			let e = k("Pending saved write", null, "write");
			t({
				type: "failure",
				id: e,
				error: "A saved write needs confirmation. Retry the exact write; no proposal is accepted locally yet."
			});
		} else {
			let t = Ft(Et());
			t ? j(t) : e?.kind === "comparison" ? j({
				caseId: e.caseId,
				revision: e.baselineRevision
			}) : te("dated");
		}
		return () => {
			s.current = !1, r.current++, i.current?.abort(), a.current?.abort(), o.current?.abort();
		};
	}, []), {
		state: e,
		submit: ee,
		upload: A,
		demo: te,
		save: le,
		edit: F,
		openSaved: j,
		operation: l,
		comparisonAck: p,
		comparisonError: h,
		retainComparison: L,
		inFlight: d,
		writeError: f,
		recoveryError: u,
		notice: v,
		offer: S,
		rejected: w,
		conflict: E,
		canEdit: P(e),
		canSave: e.status === "ready" && e.accepted?.mode === "dated" && !e.saved && !l && !u && !E,
		retryWrite: ue,
		discardTracking: I,
		reviewConflict: pe,
		cancelConflict: R,
		refreshConflict: () => {
			O.current && ie(O.current.operation);
		},
		dismissRejected: () => T(null),
		dismissOffer: () => C(null),
		dismissComparisonAck: () => m(null),
		clearComparisonError: () => g(null),
		deferComparisonAck: (e) => m((t) => t?.serial === e ? {
			...t,
			scope: null
		} : t)
	};
}
//#endregion
//#region src/App.tsx
var Un = kn, Wn = {
	gross_receipts: "Gross receipts",
	gross_profit: "Gross profit",
	cogs: "COGS",
	operating_expense_excl_dna_interest_comp: "Operating expenses",
	officer_compensation: "Officer compensation",
	depreciation: "Depreciation",
	amortization: "Amortization",
	interest_expense: "Interest expense",
	section_179: "Section 179",
	k1_distribution: "K-1 distributions",
	ordinary_business_income: "Ordinary business income",
	ebitda: "EBITDA",
	dscr: "DSCR",
	fccr: "Simplified FCCR",
	global_dscr: "Global DSCR",
	uca_positive: "UCA cash flow",
	k1_history: "K-1 distribution history",
	cpltd_annual: "Annual CPLTD",
	operating_lease_annual: "Annual operating leases",
	amount: "Proposed principal",
	annual_rate: "Annual nominal rate",
	term_months: "Loan term",
	ownership_percentage: "Ownership",
	wages: "Annual wages",
	interest_dividend_income: "Annual interest/dividend income",
	mortgage_pi_annual: "Annual mortgage P&I",
	auto_loan_annual: "Annual auto debt",
	credit_card_min_annual: "Annual card minimum",
	ar_increase: "AR increase",
	inventory_increase: "Inventory increase",
	ap_increase: "AP increase",
	cash_taxes_paid: "Cash taxes paid"
}, Gn = (e) => y(e, 2), Kn = (e, t) => e.period_start && e.period_end ? `${e.period_start} – ${e.period_end}` : `Supplied period ${t + 1}`;
function qn(e) {
	let t = e.raw_value;
	return t === null ? "Not applicable" : p(t) ? e.name === "uca_positive" ? `$${Gn(t)}` : `${y(t, 4)}x` : String(t);
}
function Jn({ metric: e, assessment: t }) {
	let n = t.calculation_trace.find((t) => t.fact_id === e.fact_id);
	return n ? /* @__PURE__ */ (0, B.jsxs)("details", { children: [
		/* @__PURE__ */ (0, B.jsxs)("summary", { children: [
			e.fact_id,
			" · ",
			Be(e)
		] }),
		/* @__PURE__ */ (0, B.jsx)("p", { children: /* @__PURE__ */ (0, B.jsx)("strong", { children: n.definition_id }) }),
		/* @__PURE__ */ (0, B.jsx)("p", {
			className: "expression",
			children: n.expression
		}),
		/* @__PURE__ */ (0, B.jsx)("h3", { children: "Actual operands" }),
		n.operands.map((e, t) => /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "operand",
			children: [
				/* @__PURE__ */ (0, B.jsx)("code", { children: e.reference }),
				/* @__PURE__ */ (0, B.jsxs)("span", { children: [
					e.raw_value === null ? "Not applicable" : String(e.raw_value),
					" ",
					e.unit
				] }),
				/* @__PURE__ */ (0, B.jsxs)("small", { children: [e.reference_type, e.reported_value !== null && ` · Reported component: ${y(String(e.reported_value), 2)} ${e.unit}`] })
			]
		}, t)),
		/* @__PURE__ */ (0, B.jsxs)("p", { children: [
			"Raw result: ",
			String(n.raw_value),
			" ",
			n.unit
		] }),
		n.explanation && /* @__PURE__ */ (0, B.jsx)("p", { children: n.explanation })
	] }) : null;
}
function Yn() {
	let e = Hn(), t = hn(e), { state: n, submit: r, demo: i, upload: a } = e, [o, s] = (0, x.useState)("spread"), [c, l] = (0, x.useState)(1), [u, d] = (0, x.useState)(null), [f, p] = (0, x.useState)(), [m, g] = (0, x.useState)(!1), [_, v] = (0, x.useState)(!1), [y, b] = (0, x.useState)(!1), C = (0, x.useRef)(null), w = n.status === "ready", T = n.accepted, E = T?.input, D = w && T?.mode === "dated" ? T.result : null, O = w && T ? T.mode === "dated" ? T.result.decision : T.result : null, k = E ? Math.min(c, E.years.length - 1) : 0;
	(0, x.useEffect)(() => {
		n.status === "evaluating" && (d(null), g(!1)), n.status === "ready" && n.resetPeriod && n.accepted && l(n.accepted.input.years.length - 1), n.status === "ready" && n.saved?.view.compatibility && s("history");
	}, [
		n.id,
		n.status,
		n.accepted,
		n.resetPeriod
	]);
	function ee(t) {
		u && (e.edit(t, u), d(null), p(void 0));
	}
	function te(t, n, r, i = "USD", a, o, s = !1, c) {
		return /* @__PURE__ */ (0, B.jsx)("button", {
			className: "rowEdit",
			disabled: !e.canEdit,
			onClick: (e) => {
				C.current = e.currentTarget, d({
					path: t,
					label: n,
					value: r,
					unit: i,
					min: a,
					max: o,
					integer: s,
					period: c ?? (E && "assessment_as_of" in E ? `Assumption as of ${E.assessment_as_of}` : "Legacy annual assumption")
				});
			},
			children: n
		});
	}
	function A(e, t, n, r) {
		return /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "panel",
			children: [/* @__PURE__ */ (0, B.jsx)("h2", { children: e }), Object.entries(n).map(([e, n]) => {
				let i = ["annual_rate", "ownership_percentage"].includes(e), a = e === "term_months", o = [
					"cpltd_annual",
					"operating_lease_annual",
					"amount",
					"annual_rate",
					"ownership_percentage",
					"mortgage_pi_annual",
					"auto_loan_annual",
					"credit_card_min_annual"
				].includes(e);
				return /* @__PURE__ */ (0, B.jsxs)("div", {
					className: "assumption",
					children: [te(`${t}/${e}`, Wn[e] ?? e, n, i ? "%" : a ? "months" : "USD", a ? T?.mode === "dated" ? 12 : 1 : o ? 0 : void 0, e === "ownership_percentage" || e === "annual_rate" && T?.mode === "dated" ? 1 : void 0, a, r), /* @__PURE__ */ (0, B.jsx)("strong", { children: i ? `${Gn(h(String(n), 2))}%` : a ? `${n} months` : `$${Gn(String(n))}` })]
				}, e);
			})]
		}, t);
	}
	return /* @__PURE__ */ (0, B.jsxs)("main", {
		className: "analystWorkspace",
		children: [
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "workspaceBrand",
				children: [/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "wordmark",
					children: [/* @__PURE__ */ (0, B.jsx)("svg", {
						viewBox: "0 0 24 24",
						width: "24",
						height: "24",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, B.jsx)("path", {
							d: "M2 5h13v4H2zm7 5h13v4H9zM2 15h13v4H2z",
							fill: "currentColor"
						})
					}), /* @__PURE__ */ (0, B.jsx)("span", { children: "Spreadline" })]
				}), /* @__PURE__ */ (0, B.jsxs)("span", {
					className: "workspaceType",
					children: ["COMMERCIAL UNDERWRITING ", /* @__PURE__ */ (0, B.jsx)("span", { children: "USD" })]
				})]
			}),
			/* @__PURE__ */ (0, B.jsxs)("header", { children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [
				/* @__PURE__ */ (0, B.jsx)("div", {
					className: "eyebrow",
					children: "SPREADLINE / CREDIT WORKSPACE"
				}),
				/* @__PURE__ */ (0, B.jsx)("h1", { children: w ? E?.borrower_name ?? (typeof n.saved?.view.snapshot.normalized_input.borrower_name == "string" ? n.saved.view.snapshot.normalized_input.borrower_name : "Saved case") : "Assessment workspace" }),
				/* @__PURE__ */ (0, B.jsx)("p", { children: w ? n.saved ? "Saved dated assessment" : T?.mode === "dated" ? "Dated assessment" : "Legacy · undated input" : n.status === "evaluating" ? n.action === "open" ? "Opening stored revision" : n.action === "write" ? "Waiting for accepted stored receipt" : "Evaluating selected draft" : "Selected input unavailable" })
			] }), /* @__PURE__ */ (0, B.jsxs)("div", {
				className: "decision",
				"data-outcome": O?.outcome ?? "unavailable",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ (0, B.jsx)("span", { children: "Illustrative decision" }),
					/* @__PURE__ */ (0, B.jsx)("strong", { children: O ? O.outcome.toUpperCase() : n.status === "evaluating" ? n.action === "open" ? "LOADING" : n.action === "write" ? "SAVING" : "CALCULATING" : "UNAVAILABLE" }),
					/* @__PURE__ */ (0, B.jsx)("small", { children: O ? `${O.policy_version} · illustrative score ${O.score}` : "A current accepted calculation is required" })
				]
			})] }),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "warning environmentWarning",
				children: [/* @__PURE__ */ (0, B.jsx)("span", { children: "Prototype use" }), /* @__PURE__ */ (0, B.jsx)("p", { children: Un })]
			}),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "uploadbar",
				children: [
					/* @__PURE__ */ (0, B.jsxs)("div", {
						className: "actions",
						children: [
							/* @__PURE__ */ (0, B.jsx)("button", {
								onClick: () => i("dated"),
								children: "Dated Alpine demo"
							}),
							/* @__PURE__ */ (0, B.jsx)("button", {
								onClick: () => i("legacy"),
								children: "Legacy Alpine demo"
							}),
							/* @__PURE__ */ (0, B.jsx)("button", {
								"data-focus-fallback": !0,
								"aria-expanded": _,
								onClick: () => v((e) => !e),
								children: "Saved cases"
							}),
							/* @__PURE__ */ (0, B.jsx)("button", {
								className: "primary",
								disabled: !e.canSave,
								onClick: (e) => {
									C.current = e.currentTarget, g(!0);
								},
								children: "Save case"
							})
						]
					}),
					/* @__PURE__ */ (0, B.jsxs)("label", { children: [
						"Import synthetic JSON",
						" ",
						/* @__PURE__ */ (0, B.jsx)("input", {
							type: "file",
							accept: ".json,application/json",
							onChange: (e) => {
								a(e.target.files?.[0]), e.target.value = "";
							}
						})
					] }),
					/* @__PURE__ */ (0, B.jsxs)("span", { children: [n.filename, " · synthetic only"] }),
					T?.mode === "legacy" && /* @__PURE__ */ (0, B.jsx)("span", { children: "Saving requires a separately imported dated assessment with explicit dates and units." })
				]
			}),
			_ && /* @__PURE__ */ (0, B.jsx)(qt, {
				onOpen: (t) => {
					v(!1), e.openSaved(t);
				},
				onClose: () => {
					v(!1), Me("[data-focus-fallback]")?.focus();
				}
			}),
			/* @__PURE__ */ (0, B.jsx)(Qt, {
				workspace: e,
				onOpenComparison: (t) => {
					let n = t.record;
					fn(n.case_id, n.comparison_id), e.openSaved({
						caseId: n.case_id,
						revision: n.baseline_revision
					}).then(() => s("scenarios")), e.dismissComparisonAck();
				},
				onDiscard: (e) => {
					C.current = e, b(!0);
				},
				onReview: (t) => {
					let n = e.reviewConflict();
					n && (C.current = t, d(n.field), p(n.proposal));
				}
			}),
			n.saved && /* @__PURE__ */ (0, B.jsx)(Jt, {
				saved: n.saved,
				active: w,
				onOpen: (t) => void e.openSaved(t)
			}),
			!w && /* @__PURE__ */ (0, B.jsxs)("div", {
				className: "pending",
				role: "status",
				children: [
					/* @__PURE__ */ (0, B.jsx)("strong", { children: n.status === "evaluating" ? n.action === "open" ? "Loading original stored assessment" : n.action === "write" ? "Waiting for saved write confirmation" : "Evaluating draft" : "No current result" }),
					n.draft && n.action === "evaluate" && /* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Submitted draft: ",
						n.draft.filename,
						" · ",
						n.draft.mode,
						" ·",
						" ",
						typeof n.draft.payload.borrower_name == "string" ? n.draft.payload.borrower_name : "Unnamed input",
						n.draft.edit && ` · ${n.draft.edit.path}: ${n.draft.edit.prior} → ${n.draft.edit.next}`
					] }),
					T && !n.saved && (n.action === "evaluate" || !e.operation) && /* @__PURE__ */ (0, B.jsxs)("p", { children: [
						"Previous accepted case: ",
						T.input.borrower_name,
						" ·",
						" ",
						T.filename,
						". Its recommendation is inactive."
					] })
				]
			}),
			n.error && /* @__PURE__ */ (0, B.jsx)("div", {
				className: "warning",
				role: "alert",
				children: n.error
			}),
			n.status === "unavailable" && /* @__PURE__ */ (0, B.jsxs)("div", {
				className: "actions",
				children: [
					n.draft && n.action === "evaluate" && /* @__PURE__ */ (0, B.jsx)("button", {
						onClick: () => void r(n.draft),
						children: "Retry submitted draft"
					}),
					T && !n.saved && (n.action === "evaluate" || !e.operation) && /* @__PURE__ */ (0, B.jsx)("button", {
						onClick: () => void r({
							mode: T.mode,
							payload: T.input,
							filename: T.filename
						}),
						children: "Re-evaluate last accepted case"
					}),
					n.saved && /* @__PURE__ */ (0, B.jsx)("button", {
						onClick: () => void e.openSaved({
							caseId: n.saved.view.snapshot.case_id,
							revision: n.saved.view.snapshot.revision
						}),
						children: "View previous stored revision"
					})
				]
			}),
			w && n.saved?.view.compatibility && o !== "review" && /* @__PURE__ */ (0, B.jsxs)("section", {
				className: "panel compatibility",
				children: [
					/* @__PURE__ */ (0, B.jsx)("h2", { children: "Original stored assessment" }),
					/* @__PURE__ */ (0, B.jsx)("p", { children: n.saved.view.compatibility }),
					/* @__PURE__ */ (0, B.jsx)("pre", { children: JSON.stringify(n.saved.view.snapshot, null, 2) })
				]
			}),
			D && /* @__PURE__ */ (0, B.jsxs)("div", {
				className: "context",
				children: [
					/* @__PURE__ */ (0, B.jsxs)("span", { children: [
						"Assessment as of: ",
						D.assumptions_as_of,
						" · USD · dollars · nominal annual rate"
					] }),
					/* @__PURE__ */ (0, B.jsxs)("span", { children: ["Coverage period: ", Kn(D.selected_period, 0)] }),
					/* @__PURE__ */ (0, B.jsx)("span", { children: "Current pro forma coverage · fixed rate · fully amortizing · monthly payments" })
				]
			}),
			D && /* @__PURE__ */ (0, B.jsx)(He, { assessment: D }),
			/* @__PURE__ */ (0, B.jsx)("nav", {
				className: "workspaceNav",
				"aria-label": "Workspace views",
				children: [
					"spread",
					"assumptions",
					"details",
					"memo",
					"history",
					"scenarios",
					"review"
				].map((e) => /* @__PURE__ */ (0, B.jsx)("button", {
					className: o === e ? "active" : "",
					"aria-pressed": o === e,
					"aria-current": o === e ? "page" : void 0,
					onClick: () => s(e),
					children: e === "scenarios" ? "Scenarios" : e === "review" ? "Review" : e
				}, e))
			}),
			o === "scenarios" && /* @__PURE__ */ (0, B.jsx)(On, {
				model: t,
				onSaveBaseline: (t) => {
					e.canSave && (C.current = t, g(!0));
				},
				onOpenBaseline: (t) => void e.openSaved(t)
			}),
			o === "review" && /* @__PURE__ */ (0, B.jsx)(Ln, {
				view: w ? n.saved?.view ?? null : null,
				selection: n.saved?.selection ?? null,
				headRevision: n.saved?.headRevision ?? null,
				sourceScope: `${n.id}:${n.status}`,
				original: t.original,
				pending: !!(e.operation || e.recoveryError || e.conflict || e.inFlight),
				onOpenBaseline: (t) => void e.openSaved(t)
			}),
			o === "spread" && /* @__PURE__ */ (0, B.jsxs)("section", {
				className: "grid",
				children: [/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "panel wide",
					children: [
						/* @__PURE__ */ (0, B.jsxs)("div", {
							className: "panelTitle",
							children: [/* @__PURE__ */ (0, B.jsx)("h2", { children: "Annual financial spread" }), /* @__PURE__ */ (0, B.jsx)("span", { children: w ? e.canEdit ? "Select a supplied input to edit · derived rows are read-only" : "Original accepted inputs · editing unavailable for this selection" : "Previous accepted inputs · editing unavailable" })]
						}),
						E ? /* @__PURE__ */ (0, B.jsx)("div", {
							className: "tableScroll",
							children: /* @__PURE__ */ (0, B.jsxs)("table", { children: [/* @__PURE__ */ (0, B.jsx)("thead", { children: /* @__PURE__ */ (0, B.jsxs)("tr", { children: [/* @__PURE__ */ (0, B.jsx)("th", { children: "Line item · USD" }), E.years.map((e, t) => /* @__PURE__ */ (0, B.jsx)("th", { children: /* @__PURE__ */ (0, B.jsx)("button", {
								"aria-pressed": k === t,
								className: k === t ? "period active" : "period",
								onClick: () => l(t),
								children: Kn(e, t)
							}) }, t))] }) }), /* @__PURE__ */ (0, B.jsxs)("tbody", { children: [S.map((t) => /* @__PURE__ */ (0, B.jsxs)("tr", { children: [/* @__PURE__ */ (0, B.jsx)("th", {
								scope: "row",
								children: Wn[t]
							}), E.years.map((n, r) => /* @__PURE__ */ (0, B.jsx)("td", {
								className: "num",
								children: /* @__PURE__ */ (0, B.jsxs)("button", {
									className: "rowEdit",
									"aria-label": `Edit ${Wn[t]} for ${Kn(n, r)}`,
									disabled: !e.canEdit,
									onClick: (e) => {
										C.current = e.currentTarget, d({
											path: `/years/${r}/${t}`,
											label: Wn[t],
											value: n[t],
											unit: "USD",
											min: t === "interest_expense" ? "0" : void 0,
											period: Kn(n, r)
										});
									},
									children: ["$", Gn(D?.historical_spread[r].reported_financials[t] ?? n[t])]
								})
							}, r))] }, t)), D && [
								"gross_profit",
								"ordinary_business_income",
								"ebitda",
								"k1_distribution_ratio"
							].map((e) => /* @__PURE__ */ (0, B.jsxs)("tr", {
								className: "derived",
								"data-fact": e,
								children: [/* @__PURE__ */ (0, B.jsxs)("th", {
									scope: "row",
									children: [
										Wn[e] ?? "K-1 distribution ratio",
										" ",
										/* @__PURE__ */ (0, B.jsx)("small", { children: "Calculated" })
									]
								}), D.historical_spread.map((t, n) => /* @__PURE__ */ (0, B.jsx)("td", {
									className: "num",
									children: Be(t[e])
								}, n))]
							}, e))] })] })
						}) : /* @__PURE__ */ (0, B.jsx)("p", { children: "No accepted inputs yet." }),
						D && /* @__PURE__ */ (0, B.jsx)("p", {
							className: "fine",
							children: "Report amounts reconcile to income totals in cents. Editing opens the original unrounded input."
						}),
						T?.mode === "legacy" && /* @__PURE__ */ (0, B.jsx)("p", {
							className: "fine",
							children: "Legacy inputs have no verified dates or dated calculation trace. Supplied period order is retained."
						})
					]
				}), /* @__PURE__ */ (0, B.jsxs)("div", {
					className: "panel",
					children: [/* @__PURE__ */ (0, B.jsx)("h2", { children: "Current coverage" }), O ? O.factors.map((e) => /* @__PURE__ */ (0, B.jsxs)("div", {
						className: "metric",
						"data-state": e.passed === null ? "review" : e.passed ? "pass" : "fail",
						children: [
							/* @__PURE__ */ (0, B.jsx)("span", { children: Wn[e.name] ?? e.name }),
							/* @__PURE__ */ (0, B.jsx)("strong", { children: qn(e) }),
							/* @__PURE__ */ (0, B.jsxs)("small", { children: [
								e.name === "uca_positive" ? `Must exceed $${Gn(String(e.threshold))}` : `Policy: ${e.comparison_operator ?? "comparison unavailable"} ${String(e.threshold)}`,
								" ",
								"·",
								" ",
								e.passed === null ? "Review required" : e.passed ? "Pass" : "Below policy",
								e.decline_threshold !== null && ` · decline below ${e.decline_threshold}x`
							] })
						]
					}, e.name)) : /* @__PURE__ */ (0, B.jsx)("p", { children: "No current results. Resolve the selected input and retry." })]
				})]
			}),
			o === "assumptions" && /* @__PURE__ */ (0, B.jsxs)("section", { children: [/* @__PURE__ */ (0, B.jsx)("p", { children: w ? "Annual assumptions used by the backend. Select an amount to propose an edit." : "Previous accepted assumptions; no active recommendation." }), E && /* @__PURE__ */ (0, B.jsxs)("div", {
				className: "assumptionsGrid",
				children: [
					A("Existing debt", "/existing_debt", E.existing_debt),
					A("Proposed fixed monthly loan", "/proposed_loan", {
						amount: E.proposed_loan.amount,
						annual_rate: E.proposed_loan.annual_rate,
						term_months: E.proposed_loan.term_months
					}),
					A("Working capital", "/working_capital", {
						ar_increase: E.working_capital.ar_increase,
						inventory_increase: E.working_capital.inventory_increase,
						ap_increase: E.working_capital.ap_increase,
						cash_taxes_paid: E.working_capital.cash_taxes_paid
					}, `Working capital for ${Kn(E.years[E.years.length - 1], E.years.length - 1)}`),
					E.guarantors.map((e, t) => A(e.name, `/guarantors/${t}`, {
						ownership_percentage: e.ownership_percentage,
						wages: e.wages,
						interest_dividend_income: e.interest_dividend_income,
						mortgage_pi_annual: e.mortgage_pi_annual,
						auto_loan_annual: e.auto_loan_annual,
						credit_card_min_annual: e.credit_card_min_annual
					})),
					E.guarantors.length === 0 && /* @__PURE__ */ (0, B.jsxs)("div", {
						className: "panel",
						children: [/* @__PURE__ */ (0, B.jsx)("h2", { children: "Business-only fallback" }), /* @__PURE__ */ (0, B.jsx)("p", { children: "No guarantors supplied. The backend uses full business EBITDA for global coverage." })]
					})
				]
			})] }),
			o === "details" && /* @__PURE__ */ (0, B.jsxs)("section", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, B.jsx)("h2", { children: "Calculation and policy details" }),
					w && n.saved && /* @__PURE__ */ (0, B.jsx)(Yt, { view: n.saved.view }),
					D ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
						/* @__PURE__ */ (0, B.jsxs)("p", { children: [
							"Policy version:",
							" ",
							/* @__PURE__ */ (0, B.jsx)("strong", { children: D.policy_snapshot.version })
						] }),
						/* @__PURE__ */ (0, B.jsxs)("p", { children: [
							"K-1 comparison periods:",
							" ",
							D.k1_history_periods.map((e, t) => Kn(e, t)).join(" / ")
						] }),
						/* @__PURE__ */ (0, B.jsx)("h3", { children: "Current facts" }),
						Object.values(D.current_facts).map((e) => /* @__PURE__ */ (0, B.jsx)(Jn, {
							metric: e,
							assessment: D
						}, e.fact_id)),
						/* @__PURE__ */ (0, B.jsxs)("h3", { children: [
							"Selected historical period:",
							" ",
							Kn(E.years[k], k)
						] }),
						[
							"gross_profit",
							"ordinary_business_income",
							"ebitda",
							"k1_distribution_ratio"
						].map((e) => /* @__PURE__ */ (0, B.jsx)(Jn, {
							metric: D.historical_spread[k][e],
							assessment: D
						}, e)),
						/* @__PURE__ */ (0, B.jsx)("h3", { children: "Guarantor contributions" }),
						D.guarantor_contributions.length ? D.guarantor_contributions.map((e) => /* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h4", { children: e.name }), [
							e.business_ebitda,
							e.outside_income,
							e.personal_debt
						].map((e) => /* @__PURE__ */ (0, B.jsx)(Jn, {
							metric: e,
							assessment: D
						}, e.fact_id))] }, e.guarantor_index)) : /* @__PURE__ */ (0, B.jsx)("p", { children: "Business-only fallback; no guarantor contributions." }),
						/* @__PURE__ */ (0, B.jsxs)("details", { children: [/* @__PURE__ */ (0, B.jsx)("summary", { children: "Complete policy snapshot" }), /* @__PURE__ */ (0, B.jsx)("pre", { children: JSON.stringify(D.policy_snapshot, null, 2) })] }),
						/* @__PURE__ */ (0, B.jsxs)("p", {
							className: "fine",
							children: [
								"Calculation: ",
								D.calculation_version,
								" · serialization:",
								" ",
								D.serialization_version,
								/* @__PURE__ */ (0, B.jsx)("br", {}),
								"Content fingerprint (not document authentication):",
								" ",
								/* @__PURE__ */ (0, B.jsx)("code", { children: D.fingerprint.value })
							]
						})
					] }) : /* @__PURE__ */ (0, B.jsx)("p", { children: w ? "Legacy mode has decision factors but no dated spread or trace." : "No current assessment is available." }),
					O && /* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h3", { children: "Raw policy comparisons" }), O.factors.map((e) => /* @__PURE__ */ (0, B.jsxs)("div", {
						className: "operand",
						children: [
							/* @__PURE__ */ (0, B.jsx)("strong", { children: Wn[e.name] }),
							/* @__PURE__ */ (0, B.jsxs)("span", { children: [
								"Raw: ",
								String(e.raw_value),
								" ",
								e.comparison_operator,
								" ",
								String(e.threshold),
								" · decline floor",
								" ",
								e.decline_threshold ?? "not applicable"
							] }),
							/* @__PURE__ */ (0, B.jsx)("small", { children: e.source })
						]
					}, e.name))] })
				]
			}),
			o === "memo" && /* @__PURE__ */ (0, B.jsxs)("section", {
				className: "panel memo",
				children: [
					/* @__PURE__ */ (0, B.jsx)("h2", { children: "Credit memo" }),
					O ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
						/* @__PURE__ */ (0, B.jsx)("h3", { children: "Recommendation" }),
						/* @__PURE__ */ (0, B.jsxs)("p", { children: [
							O.outcome[0].toUpperCase() + O.outcome.slice(1),
							" ",
							"for prototype demonstration based on the accepted inputs."
						] }),
						/* @__PURE__ */ (0, B.jsx)("h3", { children: "Primary factors considered" }),
						/* @__PURE__ */ (0, B.jsx)("ul", { children: O.factors.map((e) => /* @__PURE__ */ (0, B.jsxs)("li", { children: [
							Wn[e.name],
							": ",
							qn(e),
							" —",
							" ",
							e.passed === null ? "manual review required" : e.passed ? "meets configured policy" : "does not meet configured policy"
						] }, e.name)) }),
						/* @__PURE__ */ (0, B.jsx)("h3", { children: "Recorded reasons" }),
						O.reasons.length ? /* @__PURE__ */ (0, B.jsx)("ul", { children: O.reasons.map((e, t) => /* @__PURE__ */ (0, B.jsx)("li", { children: e.message }, t)) }) : /* @__PURE__ */ (0, B.jsx)("p", { children: "No additional reasons returned." })
					] }) : /* @__PURE__ */ (0, B.jsx)("p", { children: "No current decision is available." }),
					/* @__PURE__ */ (0, B.jsx)("p", {
						className: "fine",
						children: Un
					})
				]
			}),
			o === "history" && (n.saved ? /* @__PURE__ */ (0, B.jsx)(Xt, {
				saved: n.saved,
				active: w,
				onOpen: (t) => void e.openSaved(t)
			}) : /* @__PURE__ */ (0, B.jsxs)("section", {
				className: "panel memo",
				children: [
					/* @__PURE__ */ (0, B.jsx)("h2", { children: "Session edit history" }),
					/* @__PURE__ */ (0, B.jsx)("p", { children: "Resets on reload. Actor: demonstration analyst; timestamps are local and unverified." }),
					n.history.length === 0 ? /* @__PURE__ */ (0, B.jsx)("p", { children: "No applied edits this session." }) : n.history.map((e, t) => /* @__PURE__ */ (0, B.jsxs)("div", {
						className: "audit",
						children: [
							/* @__PURE__ */ (0, B.jsx)("strong", { children: e.path }),
							/* @__PURE__ */ (0, B.jsxs)("span", { children: [
								e.prior,
								" → ",
								e.next
							] }),
							/* @__PURE__ */ (0, B.jsxs)("small", { children: [
								e.rationale,
								" · ",
								e.at
							] })
						]
					}, t)),
					E && "overrides" in E && !!E.overrides?.length && /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [/* @__PURE__ */ (0, B.jsx)("h3", { children: "Unverified imported history" }), E.overrides.map((e, t) => /* @__PURE__ */ (0, B.jsxs)("div", {
						className: "audit imported",
						children: [
							/* @__PURE__ */ (0, B.jsx)("strong", { children: e.field }),
							/* @__PURE__ */ (0, B.jsxs)("span", { children: [
								String(e.prior_value),
								" → ",
								String(e.new_value)
							] }),
							/* @__PURE__ */ (0, B.jsxs)("small", { children: [
								e.rationale,
								" · supplied actor ",
								e.actor,
								" · ",
								e.at
							] })
						]
					}, t))] })
				]
			})),
			u && /* @__PURE__ */ (0, B.jsx)(ze, {
				restoreFocus: C.current,
				field: u,
				saved: !!n.saved,
				proposal: f,
				onCancel: () => {
					d(null), p(void 0);
				},
				onSubmit: ee
			}, `${u.path}:${n.id}`),
			m && T?.mode === "dated" && /* @__PURE__ */ (0, B.jsx)(Le, {
				input: T.input,
				restoreFocus: C.current,
				onSave: e.save,
				onCancel: () => g(!1)
			}),
			y && /* @__PURE__ */ (0, B.jsx)(Re, {
				restoreFocus: C.current,
				onDiscard: e.discardTracking,
				onCancel: () => b(!1)
			}),
			/* @__PURE__ */ (0, B.jsxs)("footer", { children: [
				"Spreadline · Synthetic analyst demonstration ·",
				" ",
				n.saved ? `Saved revisions · recorded credential ${n.saved.view.snapshot.event.actor}` : "Unsaved session workspace"
			] })
		]
	});
}
//#endregion
//#region src/embeddedTransport.ts
var Xn = 16777216, Zn = class {
	generation;
	publish;
	pending = /* @__PURE__ */ new Map();
	closed = !1;
	constructor(e, t) {
		this.generation = e, this.publish = t;
	}
	flush() {
		this.closed || this.publish(Array.from(this.pending.values(), (e) => e.command));
	}
	request = (e, t) => {
		if (this.closed) return Promise.reject(/* @__PURE__ */ Error("The embedded workspace disconnected."));
		if (this.pending.size >= 4) return Promise.reject(/* @__PURE__ */ Error("The workspace is busy. Review pending work before retrying."));
		if (t.body !== void 0 && typeof t.body != "string") return Promise.reject(/* @__PURE__ */ Error("The embedded workspace accepts raw JSON text only."));
		let n = t.body ?? "";
		if (new TextEncoder().encode(n).length > 1e6) return Promise.reject(/* @__PURE__ */ Error("Request exceeds 1,000,000 bytes."));
		let r = {};
		if (new Headers(t.headers).forEach((e, t) => {
			r[t] = e;
		}), r.authorization) return Promise.reject(/* @__PURE__ */ Error("Credentials cannot be sent through component data."));
		let i = {
			id: crypto.randomUUID(),
			generation: this.generation,
			method: t.method ?? "GET",
			path: e,
			body: n,
			headers: r
		};
		return new Promise((e, n) => {
			let r, a = () => {
				this.pending.delete(i.id), o(), this.flush(), n(/* @__PURE__ */ Error("The embedded response was cancelled or timed out. Review any pending write before retrying."));
			}, o = () => {
				clearTimeout(r), t.signal?.removeEventListener("abort", a);
			};
			if (t.signal?.aborted) {
				n(/* @__PURE__ */ Error("Request cancelled."));
				return;
			}
			r = setTimeout(a, 3e4), t.signal?.addEventListener("abort", a, { once: !0 }), this.pending.set(i.id, {
				command: i,
				resolve: e,
				reject: n,
				clean: o
			}), this.flush();
		});
	};
	accept(e) {
		if (!Array.isArray(e) || e.length > 4) return;
		let t = !1;
		for (let n of e) {
			if (!n || typeof n != "object" || typeof n.id != "string") continue;
			let e = this.pending.get(n.id);
			if (e) {
				this.pending.delete(n.id), e.clean(), t = !0;
				try {
					if (typeof n.error == "string") throw Error(n.error);
					if (!Number.isInteger(n.status) || n.status < 200 || n.status > 599 || typeof n.body != "string" || new TextEncoder().encode(n.body).length > Xn || !n.headers || typeof n.headers != "object" || Object.values(n.headers).some((e) => typeof e != "string")) throw Error("Unreadable embedded response. Review any pending write before retrying.");
					e.resolve(new Response(n.body, {
						status: n.status,
						headers: n.headers
					}));
				} catch (t) {
					e.reject(t instanceof Error ? t : /* @__PURE__ */ Error("Embedded response unavailable."));
				}
			}
		}
		t && this.flush();
	}
	dispose() {
		this.closed = !0;
		for (let e of this.pending.values()) e.clean(), e.reject(/* @__PURE__ */ Error("The embedded workspace disconnected. Review pending writes after reconnecting."));
		this.pending.clear();
	}
}, Qn = ":root,:host{color:#eef1f4;font-synthesis:none;font-variant-numeric:tabular-nums;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-6:24px;--space-8:32px;--surface:#101419;--border:#303b46;--accent:#8de0bb;--muted:#b5bfc9;background:#0b0d10;font-family:Inter,ui-sans-serif,system-ui}.reviewWorkspace{gap:18px;display:grid}.reviewWorkspace .panel{overflow-wrap:anywhere;min-width:0;margin-top:0}.reviewFacts{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px 24px;display:grid}.reviewFacts div{min-width:0}.reviewFacts dt,.reviewMetrics span{color:#b5bfc9;font-size:12px}.reviewFacts dd{margin:5px 0 0;font-size:13px}.reviewMetrics{grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px;display:grid}.reviewMetrics>div{background:#101419;border:1px solid #34424e;border-radius:10px;padding:14px}.reviewMetrics strong,.reviewMetrics small{margin-top:6px;display:block}.reviewMetrics small{color:#b5bfc9}.reviewInclude{align-items:center;gap:10px;margin-top:18px;display:flex}.reviewInclude input{flex:none;width:18px;height:18px}.reviewDownload{color:#8de0bb;overflow-wrap:anywhere;margin-bottom:12px;display:inline-block}.reviewWorkspace button{white-space:normal;max-width:100%}*{box-sizing:border-box}body{background:#0b0d10;margin:0}main{max-width:1480px;margin:auto;padding:28px}.workspaceBrand{border-bottom:1px solid var(--border);justify-content:space-between;align-items:center;gap:20px;margin-bottom:28px;padding-bottom:20px;display:flex}.wordmark{letter-spacing:-.03em;align-items:center;gap:10px;font-size:20px;font-weight:650;display:flex}.wordmark svg{color:var(--accent);flex-shrink:0}.workspaceType{color:var(--muted);letter-spacing:.12em;align-items:center;gap:16px;font-size:10px;display:flex}.workspaceType>span{border:1px solid var(--border);letter-spacing:.04em;border-radius:4px;padding:5px 7px}.hostingNotice{color:#c6d8cf;background:#112018;border-bottom:1px solid #284435;flex-wrap:wrap;justify-content:space-between;gap:8px 24px;max-width:1480px;margin:auto;padding:12px 28px;font-size:11px;line-height:1.6;display:flex}.hostingNotice>span:first-child{letter-spacing:.09em;font-weight:600}.embeddedWorkspace{color:#eef1f4;font-variant-numeric:tabular-nums;background:#0b0d10;font-family:Inter,ui-sans-serif,system-ui}header{justify-content:space-between;align-items:center;gap:28px;display:flex}header>div:first-child{flex:1;min-width:0}h1{letter-spacing:-.025em;overflow-wrap:anywhere;margin:6px 0;font-size:32px}p{color:#b5bfc9;line-height:1.6}.eyebrow{letter-spacing:.14em;color:#8de0bb;font-size:10px}.decision{overflow-wrap:anywhere;background:#111d18;border:1px solid #375447;border-radius:8px;width:280px;max-width:100%;padding:16px 20px}.decision span,.decision small{color:#b1bdc7;display:block}.decision strong{color:#8de0bb;font-size:25px;display:block}.decision span{margin-bottom:5px;font-size:12px}.decision small{margin-top:5px;font-size:11px;line-height:1.6}.decision[data-outcome=decline]{background:#211716;border-color:#69473e}.decision[data-outcome=decline] strong{color:#ffb5a7}.decision[data-outcome=review]{background:#211e14;border-color:#6a6038}.decision[data-outcome=review] strong{color:#e0d5a1}.decision[data-outcome=unavailable]{background:#141b23;border-color:#3c4f60}.decision[data-outcome=unavailable] strong{color:#b5c9df}.warning{color:#e0d5a1;overflow-wrap:anywhere;background:#18170f;border:1px solid #716539;border-radius:10px;margin:20px 0 16px;padding:12px 14px;font-size:13px}.environmentWarning{background:#161a1b;border-color:#394039 #394039 #394039 #a89c66;border-left-style:solid;border-left-width:3px;border-radius:4px;align-items:baseline;gap:14px;padding:12px 14px;display:flex}.environmentWarning>span{color:#e0d5a1;white-space:nowrap;font-size:11px;font-weight:600}.environmentWarning p{color:#c1c7c8;margin:0;font-size:11px;line-height:1.7}.uploadbar{color:#b5bfc9;background:#101419;border:1px solid #303b46;border-radius:8px;flex-wrap:wrap;align-items:center;gap:14px;margin:14px 0;padding:14px;font-size:12px;display:flex}.uploadbar>label{border-left:1px solid var(--border);margin-left:auto;padding-left:18px}.uploadbar>span{color:#a5b2bd;flex-basis:100%;font-size:11px}.uploadbar input::file-selector-button{font:inherit;color:#d4dee7;cursor:pointer;background:#18212a;border:1px solid #40515f;border-radius:4px;margin-right:8px;padding:6px 9px}.uploadbar input{max-width:100%;margin-top:8px;display:block}.uploadbar label{max-width:100%}.uploadbar span{overflow-wrap:anywhere}.actions{flex-wrap:wrap;gap:8px;display:flex}button{font:inherit;color:#d4dee7;cursor:pointer;background:#18212a;border:1px solid #40515f;border-radius:8px;padding:9px 14px}button:hover{background:#22313c}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible{outline-offset:3px;outline:2px solid #8de0bb}button:disabled{opacity:.5;cursor:not-allowed}.primary{color:#10291f;background:#8de0bb;border-color:#8de0bb;font-weight:600}.primary:hover{color:#10291f;background:#a2e8c9}.primary:disabled{color:#b8c9bf;opacity:1;background:#25382e;border-color:#3c5143}nav{flex-wrap:wrap;gap:8px;margin:20px 0;display:flex}nav button{text-transform:capitalize}.active{color:#8de0bb;border-color:#8de0bb}.workspaceNav{border-bottom:1px solid var(--border);gap:24px;margin:24px 0}.workspaceNav button{color:#aebbc7;background:0 0;border:0;border-bottom:2px solid #0000;border-radius:0;padding:12px 0;font-size:13px}.workspaceNav button:hover{color:#eef1f4;background:0 0}.workspaceNav button.active{color:var(--accent);border-bottom-color:var(--accent)}.summaryGrid{border:1px solid var(--border);background:var(--surface);border-radius:8px;grid-template-columns:repeat(4,minmax(0,1fr));margin-top:20px;display:grid;overflow:hidden}.summaryCard{flex-direction:column;gap:10px;min-width:0;padding:20px;display:flex}.summaryCard+.summaryCard{border-left:1px solid var(--border)}.summaryCard>span{color:var(--muted);font-size:12px}.summaryCard strong{letter-spacing:-.025em;overflow-wrap:anywhere;font-size:clamp(20px,2vw,27px);font-weight:600}.summaryCard small{color:#a5b2bd;font-size:10px;line-height:1.6}.grid{grid-template-columns:minmax(0,2.8fr) minmax(260px,1fr);gap:16px;display:grid}.panel{background:#101419;border:1px solid #303b46;border-radius:8px;min-width:0;padding:24px}.panelTitle{justify-content:space-between;align-items:start;gap:20px;display:flex}.accessGate{max-width:620px;padding-top:12vh}.accessGate form{gap:14px;display:grid}.accessGate input{box-sizing:border-box;color:#eef1f4;width:100%;font:inherit;background:#18212a;border:1px solid #556f82;border-radius:6px;padding:12px}.accessBar{color:#b5bfc9;border-bottom:1px solid #303b46;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:12px;padding:12px 32px;font-size:12px;display:flex}.panelTitle span{color:#a5b2bd;font-size:12px;line-height:1.5}h2{margin:0 0 14px;font-size:16px}h3{color:#8de0bb;margin-top:24px;font-size:15px}h4{font-size:14px}.tableScroll{overflow-x:auto}table{border-collapse:collapse;width:100%}th,td{text-align:left;border-bottom:1px solid #29333d;padding:13px 10px;font-size:13px}thead th{color:#a5b2bd;font-weight:500}tbody th{z-index:1;background:#101419;min-width:170px;font-weight:500;position:sticky;left:0}.num{font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}.rowEdit{font:inherit;text-align:inherit;color:inherit;text-underline-offset:4px;background:0 0;border:0;padding:3px 0;-webkit-text-decoration:underline #586c7c;text-decoration:underline #586c7c}.period{white-space:nowrap;padding:7px;font-size:12px}.derived,.derived th{background:#12191c}.derived[data-fact=ebitda],.derived[data-fact=ebitda] th{color:#bce8d2;background:#14221b}.derived small{color:#98bdaa;margin-top:4px;font-size:11px;display:block}.metric{border-bottom:1px solid #29333d;grid-template-columns:1fr auto;gap:8px;padding:16px 0;font-size:13px;display:grid}.metric strong{overflow-wrap:anywhere;font-size:19px}.metric>span:before{content:\"\";vertical-align:middle;background:#99a9ba;border-radius:50%;width:5px;height:5px;margin-right:8px;display:inline-block}.metric[data-state=pass]>span:before{background:#8de0bb}.metric[data-state=fail]>span:before{background:#ffb5a7}.metric[data-state=review]>span:before{background:#e0d5a1}.metric small{color:#b1bdc7;grid-column:1/-1;line-height:1.7}.memo{min-height:300px}.fine{overflow-wrap:anywhere;border-top:1px solid #303b46;margin-top:24px;padding-top:16px;font-size:12px}.audit{overflow-wrap:anywhere;border-bottom:1px solid #303b46;grid-template-columns:1fr auto;gap:8px;padding:16px 0;display:grid}.audit small{color:#b1bdc7;grid-column:1/-1}.pending{overflow-wrap:anywhere;background:#15222c;border:1px solid #556f82;border-radius:10px;margin:16px 0;padding:16px}.pending p{margin-bottom:0;font-size:13px}.context{color:#b5bfc9;flex-wrap:wrap;gap:8px 24px;margin-top:18px;font-size:11px;display:flex}.context>span{flex:240px;line-height:1.7}.assumptionsGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;display:grid}.assumption{border-bottom:1px solid #29333d;justify-content:space-between;align-items:start;gap:14px;padding:13px 0;font-size:13px;display:flex}.assumption strong{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}details{overflow-wrap:anywhere;border:1px solid #303b46;border-radius:8px;margin:10px 0;padding:12px;font-size:13px}summary{cursor:pointer;color:#d4dee7;line-height:1.5}.operand{overflow-wrap:anywhere;border-bottom:1px solid #303b46;grid-template-columns:1fr auto;gap:8px;margin:12px 0;padding:10px;font-size:12px;display:grid}.operand small{color:#a5b2bd;grid-column:1/-1}code{overflow-wrap:anywhere;font-family:ui-monospace,monospace}pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}.expression{font-family:ui-monospace,monospace;font-size:12px}dialog{color:#eef1f4;overflow-wrap:anywhere;background:#101419;border:1px solid #556f82;border-radius:16px;width:480px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);padding:26px;overflow-y:auto}dialog::backdrop{background:#000b}dialog label{margin:18px 0;font-size:14px;display:block}dialog input,dialog textarea{color:#eef1f4;width:100%;font:inherit;background:#18212a;border:1px solid #556f82;border-radius:7px;margin-top:9px;padding:10px;display:block}dialog [role=alert]{color:#ffb5a7;font-size:13px}footer{color:#a5b2bd;padding-top:26px;font-size:11px}.savedContext{overflow-wrap:anywhere;background:#13241c;border:1px solid #437c63;border-radius:12px;flex-direction:column;align-items:flex-start;gap:10px;margin:16px 0;padding:16px;font-size:12px;display:flex}.caseList{margin:16px 0}.caseRow{overflow-wrap:anywhere;border-bottom:1px solid #303b46;flex-wrap:wrap;align-items:center;gap:16px;padding:16px 0;display:flex}.caseRow>div{flex:1;min-width:180px}.caseRow h3{margin:0 0 8px}.caseRow p,.savedEvent p{font-size:12px}.savedEvent{overflow-wrap:anywhere;border-top:1px solid #303b46;margin:20px 0}.writeNotice{overflow-wrap:anywhere;border-left:3px solid #8de0bb;padding:10px 14px;font-size:13px}.compatibility{margin:16px 0}.scenariosWorkspace{gap:18px;min-width:0;display:grid}.scenariosWorkspace p,.scenariosWorkspace small{font-size:13px}.scenarioComposer,.originalComparison,.comparisonArchive,.scenarioResult{overflow-wrap:anywhere}.scenarioRow{border:1px solid #40515f;border-radius:10px;min-width:0;margin:20px 0;padding:16px}.scenarioRow legend{color:#8de0bb;padding:0 8px}.scenarioFields{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:16px;display:grid}.scenarioFields label,.scenarioSelect{min-width:0;font-size:13px;display:block}.scenarioFields input,.scenarioFields textarea,.scenarioFields select,.scenarioSelect select{color:#eef1f4;width:100%;min-width:0;font:inherit;background:#18212a;border:1px solid #556f82;border-radius:7px;margin:8px 0;padding:10px;display:block}.scenarioFields small{color:#a5b2bd;line-height:1.5}.scenarioRationale{grid-column:1/-1}.scenarioOutcome strong{color:#8de0bb}.scenarioOutcome [data-outcome=review]{color:#e0d5a1}.scenarioOutcome [data-outcome=decline]{color:#ffb5a7}.scenarioFact{border-bottom:1px solid #303b46;padding:8px 0}.scenarioFact h4{margin:10px 0}.scenarioResult td small{white-space:normal;max-width:200px;display:block}.scenarioResult caption{text-align:left;color:#b1bdc7;padding:12px 0;font-size:13px}.scenariosWorkspace [role=alert]{color:#ffb5a7}.originalComparisonJson pre{max-height:600px;overflow-y:auto}@media (width<=900px){.summaryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.summaryCard:nth-child(3){border-left:0}.summaryCard:nth-child(n+3){border-top:1px solid var(--border)}main{padding:20px}.grid{grid-template-columns:1fr}.panelTitle{flex-direction:column;gap:4px}}@media (width<=600px){.workspaceBrand{align-items:flex-start;gap:12px}.workspaceType{max-width:120px;font-size:9px;line-height:1.6}.workspaceType>span{display:none}.workspaceNav{gap:12px 20px}.workspaceNav button{padding:10px 0}.summaryCard{padding:16px}.summaryCard strong{font-size:20px}.environmentWarning{display:block}.environmentWarning>span{margin-bottom:5px;display:block}.uploadbar>label{border-left:0;margin-left:0;padding-left:0}.hostingNotice{padding:12px 20px}.decision{width:100%}.scenarioFields{grid-template-columns:1fr}.caseRow>div{flex-basis:100%;min-width:0}header{display:block}h1{font-size:29px}.decision{margin-top:18px}.panel{padding:16px}.assumptionsGrid,.operand,.audit{grid-template-columns:1fr}.operand small,.audit small{grid-column:1}.assumption{gap:10px}.assumption strong{white-space:normal}.uploadbar{align-items:start}.panelTitle span{margin-bottom:12px}}", $n = /* @__PURE__ */ new WeakMap(), er = ({ parentElement: e, data: t, setStateValue: n }) => {
	let r = $n.get(e);
	if (r && r.transport.generation !== t.generation && (r.root.unmount(), r.transport.dispose(), $n.delete(e), r = void 0), !r) {
		let i = e.querySelector(".react-root");
		if (!i) throw Error("Workspace mount unavailable");
		let a = document.createElement("style");
		a.textContent = Qn, e.prepend(a), je(e);
		let o = new Zn(t.generation, (e) => n("requests", e));
		Qe(t.generation, o.request);
		let c = (0, s.createRoot)(i);
		r = {
			root: c,
			transport: o
		}, $n.set(e, r), c.render(/* @__PURE__ */ (0, B.jsxs)("div", {
			className: "embeddedWorkspace",
			children: [/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "hostingNotice",
				children: [/* @__PURE__ */ (0, B.jsx)("span", { children: "TESTING WORKSPACE" }), /* @__PURE__ */ (0, B.jsx)("span", { children: "Synthetic data only · saved test cases may reset when the host restarts" })]
			}), /* @__PURE__ */ (0, B.jsx)(Yn, {})]
		}));
	}
	return r.transport.publish = (e) => n("requests", e), r.transport.accept(t.responses), () => {
		let t = $n.get(e);
		t?.root.unmount(), t?.transport.dispose(), $n.delete(e);
	};
};
//#endregion
export { er as default };
