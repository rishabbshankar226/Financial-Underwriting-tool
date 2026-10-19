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
	var x = Array.isArray, S = Object.prototype.hasOwnProperty, C = { current: null }, ee = {
		key: !0,
		ref: !0,
		__self: !0,
		__source: !0
	};
	function w(e, n, r) {
		var i, a = {}, o = null, s = null;
		if (n != null) for (i in n.ref !== void 0 && (s = n.ref), n.key !== void 0 && (o = "" + n.key), n) S.call(n, i) && !ee.hasOwnProperty(i) && (a[i] = n[i]);
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
	function te(e, n) {
		return {
			$$typeof: t,
			type: e.type,
			key: n,
			ref: e.ref,
			props: e.props,
			_owner: e._owner
		};
	}
	function ne(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function T(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var E = /\/+/g;
	function D(e, t) {
		return typeof e == "object" && e && e.key != null ? T("" + e.key) : t.toString(36);
	}
	function O(e, r, i, a, o) {
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
		if (c) return c = e, o = o(c), e = a === "" ? "." + D(c, 0) : a, x(o) ? (i = "", e != null && (i = e.replace(E, "$&/") + "/"), O(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ne(o) && (o = te(o, i + (!o.key || c && c.key === o.key ? "" : ("" + o.key).replace(E, "$&/") + "/") + e)), r.push(o)), 1;
		if (c = 0, a = a === "" ? "." : a + ":", x(e)) for (var l = 0; l < e.length; l++) {
			s = e[l];
			var u = a + D(s, l);
			c += O(s, r, i, u, o);
		}
		else if (u = p(e), typeof u == "function") for (e = u.call(e), l = 0; !(s = e.next()).done;) s = s.value, u = a + D(s, l++), c += O(s, r, i, u, o);
		else if (s === "object") throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		return c;
	}
	function k(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return O(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function re(e) {
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
	var A = { current: null }, ie = { transition: null }, j = {
		ReactCurrentDispatcher: A,
		ReactCurrentBatchConfig: ie,
		ReactCurrentOwner: C
	};
	function ae() {
		throw Error("act(...) is not supported in production builds of React.");
	}
	e.Children = {
		map: k,
		forEach: function(e, t, n) {
			k(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return k(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return k(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ne(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	}, e.Component = _, e.Fragment = r, e.Profiler = a, e.PureComponent = y, e.StrictMode = i, e.Suspense = l, e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = j, e.act = ae, e.cloneElement = function(e, n, r) {
		if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
		var i = h({}, e.props), a = e.key, o = e.ref, s = e._owner;
		if (n != null) {
			if (n.ref !== void 0 && (o = n.ref, s = C.current), n.key !== void 0 && (a = "" + n.key), e.type && e.type.defaultProps) var c = e.type.defaultProps;
			for (l in n) S.call(n, l) && !ee.hasOwnProperty(l) && (i[l] = n[l] === void 0 && c !== void 0 ? c[l] : n[l]);
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
	}, e.createElement = w, e.createFactory = function(e) {
		var t = w.bind(null, e);
		return t.type = e, t;
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = ne, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: re
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = function(e) {
		var t = ie.transition;
		ie.transition = {};
		try {
			e();
		} finally {
			ie.transition = t;
		}
	}, e.unstable_act = ae, e.useCallback = function(e, t) {
		return A.current.useCallback(e, t);
	}, e.useContext = function(e) {
		return A.current.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e) {
		return A.current.useDeferredValue(e);
	}, e.useEffect = function(e, t) {
		return A.current.useEffect(e, t);
	}, e.useId = function() {
		return A.current.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return A.current.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return A.current.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return A.current.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return A.current.useMemo(e, t);
	}, e.useReducer = function(e, t, n) {
		return A.current.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return A.current.useRef(e);
	}, e.useState = function(e) {
		return A.current.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return A.current.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return A.current.useTransition();
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
			if (n(c) !== null) m = !0, k(x);
			else {
				var t = n(l);
				t !== null && re(b, t.startTime - e);
			}
		}
	}
	function x(t, i) {
		m = !1, h && (h = !1, _(ee), ee = -1), p = !0;
		var a = f;
		try {
			for (y(i), d = n(c); d !== null && (!(d.expirationTime > i) || t && !ne());) {
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
				g !== null && re(b, g.startTime - i), u = !1;
			}
			return u;
		} finally {
			d = null, f = a, p = !1;
		}
	}
	var S = !1, C = null, ee = -1, w = 5, te = -1;
	function ne() {
		return !(e.unstable_now() - te < w);
	}
	function T() {
		if (C !== null) {
			var t = e.unstable_now();
			te = t;
			var n = !0;
			try {
				n = C(!0, t);
			} finally {
				n ? E() : (S = !1, C = null);
			}
		} else S = !1;
	}
	var E;
	if (typeof v == "function") E = function() {
		v(T);
	};
	else if (typeof MessageChannel < "u") {
		var D = new MessageChannel(), O = D.port2;
		D.port1.onmessage = T, E = function() {
			O.postMessage(null);
		};
	} else E = function() {
		g(T, 0);
	};
	function k(e) {
		C = e, S || (S = !0, E());
	}
	function re(t, n) {
		ee = g(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_continueExecution = function() {
		m || p || (m = !0, k(x));
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : w = 0 < e ? Math.floor(1e3 / e) : 5;
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (_(ee), ee = -1) : h = !0, re(b, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, k(x))), r;
	}, e.unstable_shouldYield = ne, e.unstable_wrapCallback = function(e) {
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
	var C = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, ee = Symbol.for("react.element"), w = Symbol.for("react.portal"), te = Symbol.for("react.fragment"), ne = Symbol.for("react.strict_mode"), T = Symbol.for("react.profiler"), E = Symbol.for("react.provider"), D = Symbol.for("react.context"), O = Symbol.for("react.forward_ref"), k = Symbol.for("react.suspense"), re = Symbol.for("react.suspense_list"), A = Symbol.for("react.memo"), ie = Symbol.for("react.lazy"), j = Symbol.for("react.offscreen"), ae = Symbol.iterator;
	function oe(e) {
		return typeof e != "object" || !e ? null : (e = ae && e[ae] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var M = Object.assign, se;
	function ce(e) {
		if (se === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			se = t && t[1] || "";
		}
		return "\n" + se + e;
	}
	var le = !1;
	function ue(e, t) {
		if (!e || le) return "";
		le = !0;
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
			le = !1, Error.prepareStackTrace = n;
		}
		return (e = e ? e.displayName || e.name : "") ? ce(e) : "";
	}
	function de(e) {
		switch (e.tag) {
			case 5: return ce(e.type);
			case 16: return ce("Lazy");
			case 13: return ce("Suspense");
			case 19: return ce("SuspenseList");
			case 0:
			case 2:
			case 15: return e = ue(e.type, !1), e;
			case 11: return e = ue(e.type.render, !1), e;
			case 1: return e = ue(e.type, !0), e;
			default: return "";
		}
	}
	function fe(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case te: return "Fragment";
			case w: return "Portal";
			case T: return "Profiler";
			case ne: return "StrictMode";
			case k: return "Suspense";
			case re: return "SuspenseList";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case D: return (e.displayName || "Context") + ".Consumer";
			case E: return (e._context.displayName || "Context") + ".Provider";
			case O:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case A: return t = e.displayName || null, t === null ? fe(e.type) || "Memo" : t;
			case ie:
				t = e._payload, e = e._init;
				try {
					return fe(e(t));
				} catch {}
		}
		return null;
	}
	function pe(e) {
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
			case 16: return fe(t);
			case 8: return t === ne ? "StrictMode" : "Mode";
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
	function me(e) {
		switch (typeof e) {
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function he(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function ge(e) {
		var t = he(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
	function _e(e) {
		e._valueTracker ||= ge(e);
	}
	function ve(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = he(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	function ye(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function be(e, t) {
		var n = t.checked;
		return M({}, t, {
			defaultChecked: void 0,
			defaultValue: void 0,
			value: void 0,
			checked: n ?? e._wrapperState.initialChecked
		});
	}
	function xe(e, t) {
		var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked == null ? t.defaultChecked : t.checked;
		n = me(t.value == null ? n : t.value), e._wrapperState = {
			initialChecked: r,
			initialValue: n,
			controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null
		};
	}
	function Se(e, t) {
		t = t.checked, t != null && S(e, "checked", t, !1);
	}
	function Ce(e, t) {
		Se(e, t);
		var n = me(t.value), r = t.type;
		if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
		else if (r === "submit" || r === "reset") {
			e.removeAttribute("value");
			return;
		}
		t.hasOwnProperty("value") ? Te(e, t.type, n) : t.hasOwnProperty("defaultValue") && Te(e, t.type, me(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
	}
	function we(e, t, n) {
		if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
			var r = t.type;
			if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
			t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
		}
		n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
	}
	function Te(e, t, n) {
		(t !== "number" || ye(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
	}
	var Ee = Array.isArray;
	function N(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + me(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function P(e, t) {
		if (t.dangerouslySetInnerHTML != null) throw Error(a(91));
		return M({}, t, {
			value: void 0,
			defaultValue: void 0,
			children: "" + e._wrapperState.initialValue
		});
	}
	function De(e, t) {
		var n = t.value;
		if (n == null) {
			if (n = t.children, t = t.defaultValue, n != null) {
				if (t != null) throw Error(a(92));
				if (Ee(n)) {
					if (1 < n.length) throw Error(a(93));
					n = n[0];
				}
				t = n;
			}
			t ??= "", n = t;
		}
		e._wrapperState = { initialValue: me(n) };
	}
	function F(e, t) {
		var n = me(t.value), r = me(t.defaultValue);
		n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
	}
	function Oe(e) {
		var t = e.textContent;
		t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
	}
	function ke(e) {
		switch (e) {
			case "svg": return "http://www.w3.org/2000/svg";
			case "math": return "http://www.w3.org/1998/Math/MathML";
			default: return "http://www.w3.org/1999/xhtml";
		}
	}
	function Ae(e, t) {
		return e == null || e === "http://www.w3.org/1999/xhtml" ? ke(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
	}
	var je, Me = function(e) {
		return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
			MSApp.execUnsafeLocalFunction(function() {
				return e(t, n, r, i);
			});
		} : e;
	}(function(e, t) {
		if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
		else {
			for (je ||= document.createElement("div"), je.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = je.firstChild; e.firstChild;) e.removeChild(e.firstChild);
			for (; t.firstChild;) e.appendChild(t.firstChild);
		}
	});
	function Ne(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Pe = {
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
	}, Fe = [
		"Webkit",
		"ms",
		"Moz",
		"O"
	];
	Object.keys(Pe).forEach(function(e) {
		Fe.forEach(function(t) {
			t = t + e.charAt(0).toUpperCase() + e.substring(1), Pe[t] = Pe[e];
		});
	});
	function Ie(e, t, n) {
		return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Pe.hasOwnProperty(e) && Pe[e] ? ("" + t).trim() : t + "px";
	}
	function Le(e, t) {
		for (var n in e = e.style, t) if (t.hasOwnProperty(n)) {
			var r = n.indexOf("--") === 0, i = Ie(n, t[n], r);
			n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : e[n] = i;
		}
	}
	var Re = M({ menuitem: !0 }, {
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
	function ze(e, t) {
		if (t) {
			if (Re[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(a(137, e));
			if (t.dangerouslySetInnerHTML != null) {
				if (t.children != null) throw Error(a(60));
				if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(a(61));
			}
			if (t.style != null && typeof t.style != "object") throw Error(a(62));
		}
	}
	function Be(e, t) {
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
	var Ve = null;
	function He(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var Ue = null, We = null, Ge = null;
	function Ke(e) {
		if (e = Li(e)) {
			if (typeof Ue != "function") throw Error(a(280));
			var t = e.stateNode;
			t && (t = zi(t), Ue(e.stateNode, e.type, t));
		}
	}
	function qe(e) {
		We ? Ge ? Ge.push(e) : Ge = [e] : We = e;
	}
	function Je() {
		if (We) {
			var e = We, t = Ge;
			if (Ge = We = null, Ke(e), t) for (e = 0; e < t.length; e++) Ke(t[e]);
		}
	}
	function Ye(e, t) {
		return e(t);
	}
	function Xe() {}
	var Ze = !1;
	function Qe(e, t, n) {
		if (Ze) return e(t, n);
		Ze = !0;
		try {
			return Ye(e, t, n);
		} finally {
			Ze = !1, (We !== null || Ge !== null) && (Xe(), Je());
		}
	}
	function $e(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = zi(n);
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
	var et = !1;
	if (u) try {
		var tt = {};
		Object.defineProperty(tt, "passive", { get: function() {
			et = !0;
		} }), window.addEventListener("test", tt, tt), window.removeEventListener("test", tt, tt);
	} catch {
		et = !1;
	}
	function nt(e, t, n, r, i, a, o, s, c) {
		var l = Array.prototype.slice.call(arguments, 3);
		try {
			t.apply(n, l);
		} catch (e) {
			this.onError(e);
		}
	}
	var rt = !1, it = null, at = !1, ot = null, st = { onError: function(e) {
		rt = !0, it = e;
	} };
	function ct(e, t, n, r, i, a, o, s, c) {
		rt = !1, it = null, nt.apply(st, arguments);
	}
	function lt(e, t, n, r, i, o, s, c, l) {
		if (ct.apply(this, arguments), rt) {
			if (rt) {
				var u = it;
				rt = !1, it = null;
			} else throw Error(a(198));
			at || (at = !0, ot = u);
		}
	}
	function ut(e) {
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
	function dt(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function ft(e) {
		if (ut(e) !== e) throw Error(a(188));
	}
	function pt(e) {
		var t = e.alternate;
		if (!t) {
			if (t = ut(e), t === null) throw Error(a(188));
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
					if (o === n) return ft(i), e;
					if (o === r) return ft(i), t;
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
	function mt(e) {
		return e = pt(e), e === null ? null : ht(e);
	}
	function ht(e) {
		if (e.tag === 5 || e.tag === 6) return e;
		for (e = e.child; e !== null;) {
			var t = ht(e);
			if (t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	var gt = r.unstable_scheduleCallback, _t = r.unstable_cancelCallback, vt = r.unstable_shouldYield, yt = r.unstable_requestPaint, bt = r.unstable_now, xt = r.unstable_getCurrentPriorityLevel, St = r.unstable_ImmediatePriority, Ct = r.unstable_UserBlockingPriority, wt = r.unstable_NormalPriority, Tt = r.unstable_LowPriority, Et = r.unstable_IdlePriority, Dt = null, Ot = null;
	function kt(e) {
		if (Ot && typeof Ot.onCommitFiberRoot == "function") try {
			Ot.onCommitFiberRoot(Dt, e, void 0, (e.current.flags & 128) == 128);
		} catch {}
	}
	var At = Math.clz32 ? Math.clz32 : Nt, jt = Math.log, Mt = Math.LN2;
	function Nt(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (jt(e) / Mt | 0) | 0;
	}
	var I = 64, L = 4194304;
	function Pt(e) {
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
	function R(e, t) {
		var n = e.pendingLanes;
		if (n === 0) return 0;
		var r = 0, i = e.suspendedLanes, a = e.pingedLanes, o = n & 268435455;
		if (o !== 0) {
			var s = o & ~i;
			s === 0 ? (a &= o, a !== 0 && (r = Pt(a))) : r = Pt(s);
		} else o = n & ~i, o === 0 ? a !== 0 && (r = Pt(a)) : r = Pt(o);
		if (r === 0) return 0;
		if (t !== 0 && t !== r && (t & i) === 0 && (i = r & -r, a = t & -t, i >= a || i === 16 && a & 4194240)) return t;
		if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t;) n = 31 - At(t), i = 1 << n, r |= e[n], t &= ~i;
		return r;
	}
	function Ft(e, t) {
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
	function It(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes; 0 < a;) {
			var o = 31 - At(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Ft(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
	}
	function Lt(e) {
		return e = e.pendingLanes & -1073741825, e === 0 ? e & 1073741824 ? 1073741824 : 0 : e;
	}
	function Rt() {
		var e = I;
		return I <<= 1, !(I & 4194240) && (I = 64), e;
	}
	function zt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Bt(e, t, n) {
		e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - At(t), e[t] = n;
	}
	function Vt(e, t) {
		var n = e.pendingLanes & ~t;
		e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
		var r = e.eventTimes;
		for (e = e.expirationTimes; 0 < n;) {
			var i = 31 - At(n), a = 1 << i;
			t[i] = 0, r[i] = -1, e[i] = -1, n &= ~a;
		}
	}
	function z(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - At(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	var B = 0;
	function Ht(e) {
		return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
	}
	var Ut, Wt, Gt, Kt, qt, Jt = !1, Yt = [], Xt = null, Zt = null, Qt = null, $t = /* @__PURE__ */ new Map(), en = /* @__PURE__ */ new Map(), tn = [], nn = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
	function rn(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Xt = null;
				break;
			case "dragenter":
			case "dragleave":
				Zt = null;
				break;
			case "mouseover":
			case "mouseout":
				Qt = null;
				break;
			case "pointerover":
			case "pointerout":
				$t.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": en.delete(t.pointerId);
		}
	}
	function an(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Li(t), t !== null && Wt(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function on(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Xt = an(Xt, e, t, n, r, i), !0;
			case "dragenter": return Zt = an(Zt, e, t, n, r, i), !0;
			case "mouseover": return Qt = an(Qt, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return $t.set(a, an($t.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, en.set(a, an(en.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function sn(e) {
		var t = Ii(e.target);
		if (t !== null) {
			var n = ut(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = dt(n), t !== null) {
						e.blockedOn = t, qt(e.priority, function() {
							Gt(n);
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
	function cn(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = yn(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Ve = r, n.target.dispatchEvent(r), Ve = null;
			} else return t = Li(n), t !== null && Wt(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function ln(e, t, n) {
		cn(e) && n.delete(t);
	}
	function un() {
		Jt = !1, Xt !== null && cn(Xt) && (Xt = null), Zt !== null && cn(Zt) && (Zt = null), Qt !== null && cn(Qt) && (Qt = null), $t.forEach(ln), en.forEach(ln);
	}
	function dn(e, t) {
		e.blockedOn === t && (e.blockedOn = null, Jt || (Jt = !0, r.unstable_scheduleCallback(r.unstable_NormalPriority, un)));
	}
	function fn(e) {
		function t(t) {
			return dn(t, e);
		}
		if (0 < Yt.length) {
			dn(Yt[0], e);
			for (var n = 1; n < Yt.length; n++) {
				var r = Yt[n];
				r.blockedOn === e && (r.blockedOn = null);
			}
		}
		for (Xt !== null && dn(Xt, e), Zt !== null && dn(Zt, e), Qt !== null && dn(Qt, e), $t.forEach(t), en.forEach(t), n = 0; n < tn.length; n++) r = tn[n], r.blockedOn === e && (r.blockedOn = null);
		for (; 0 < tn.length && (n = tn[0], n.blockedOn === null);) sn(n), n.blockedOn === null && tn.shift();
	}
	var pn = C.ReactCurrentBatchConfig, mn = !0;
	function hn(e, t, n, r) {
		var i = B, a = pn.transition;
		pn.transition = null;
		try {
			B = 1, _n(e, t, n, r);
		} finally {
			B = i, pn.transition = a;
		}
	}
	function gn(e, t, n, r) {
		var i = B, a = pn.transition;
		pn.transition = null;
		try {
			B = 4, _n(e, t, n, r);
		} finally {
			B = i, pn.transition = a;
		}
	}
	function _n(e, t, n, r) {
		if (mn) {
			var i = yn(e, t, n, r);
			if (i === null) di(e, t, r, vn, n), rn(e, r);
			else if (on(i, e, t, n, r)) r.stopPropagation();
			else if (rn(e, r), t & 4 && -1 < nn.indexOf(e)) {
				for (; i !== null;) {
					var a = Li(i);
					if (a !== null && Ut(a), a = yn(e, t, n, r), a === null && di(e, t, r, vn, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else di(e, t, r, null, n);
		}
	}
	var vn = null;
	function yn(e, t, n, r) {
		if (vn = null, e = He(r), e = Ii(e), e !== null) {
			if (t = ut(e), t === null) e = null;
			else if (n = t.tag, n === 13) {
				if (e = dt(t), e !== null) return e;
				e = null;
			} else if (n === 3) {
				if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
				e = null;
			} else t !== e && (e = null);
		}
		return vn = e, null;
	}
	function bn(e) {
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
			case "message": switch (xt()) {
				case St: return 1;
				case Ct: return 4;
				case wt:
				case Tt: return 16;
				case Et: return 536870912;
				default: return 16;
			}
			default: return 16;
		}
	}
	var xn = null, Sn = null, Cn = null;
	function wn() {
		if (Cn) return Cn;
		var e, t = Sn, n = t.length, r, i = "value" in xn ? xn.value : xn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return Cn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Tn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function En() {
		return !0;
	}
	function Dn() {
		return !1;
	}
	function On(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? En : Dn, this.isPropagationStopped = Dn, this;
		}
		return M(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = En);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = En);
			},
			persist: function() {},
			isPersistent: En
		}), t;
	}
	var kn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, An = On(kn), jn = M({}, kn, {
		view: 0,
		detail: 0
	}), Mn = On(jn), Nn, Pn, Fn, In = M({}, jn, {
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
		getModifierState: qn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Fn && (Fn && e.type === "mousemove" ? (Nn = e.screenX - Fn.screenX, Pn = e.screenY - Fn.screenY) : Pn = Nn = 0, Fn = e), Nn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Pn;
		}
	}), Ln = On(In), Rn = On(M({}, In, { dataTransfer: 0 })), zn = On(M({}, jn, { relatedTarget: 0 })), Bn = On(M({}, kn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Vn = On(M({}, kn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Hn = On(M({}, kn, { data: 0 })), Un = {
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
	}, Wn = {
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
	}, Gn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Kn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Gn[e]) ? !!t[e] : !1;
	}
	function qn() {
		return Kn;
	}
	var Jn = On(M({}, jn, {
		key: function(e) {
			if (e.key) {
				var t = Un[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Tn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Wn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: qn,
		charCode: function(e) {
			return e.type === "keypress" ? Tn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Tn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Yn = On(M({}, In, {
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
	})), V = On(M({}, jn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: qn
	})), Xn = On(M({}, kn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Zn = On(M({}, In, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Qn = [
		9,
		13,
		27,
		32
	], $n = u && "CompositionEvent" in window, er = null;
	u && "documentMode" in document && (er = document.documentMode);
	var tr = u && "TextEvent" in window && !er, nr = u && (!$n || er && 8 < er && 11 >= er), rr = " ", ir = !1;
	function ar(e, t) {
		switch (e) {
			case "keyup": return Qn.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function or(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var sr = !1;
	function cr(e, t) {
		switch (e) {
			case "compositionend": return or(t);
			case "keypress": return t.which === 32 ? (ir = !0, rr) : null;
			case "textInput": return e = t.data, e === rr && ir ? null : e;
			default: return null;
		}
	}
	function lr(e, t) {
		if (sr) return e === "compositionend" || !$n && ar(e, t) ? (e = wn(), Cn = Sn = xn = null, sr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return nr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var ur = {
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
	function dr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!ur[e.type] : t === "textarea";
	}
	function fr(e, t, n, r) {
		qe(r), t = pi(t, "onChange"), 0 < t.length && (n = new An("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var pr = null, mr = null;
	function hr(e) {
		oi(e, 0);
	}
	function gr(e) {
		if (ve(Ri(e))) return e;
	}
	function _r(e, t) {
		if (e === "change") return t;
	}
	var vr = !1;
	if (u) {
		var yr;
		if (u) {
			var br = "oninput" in document;
			if (!br) {
				var xr = document.createElement("div");
				xr.setAttribute("oninput", "return;"), br = typeof xr.oninput == "function";
			}
			yr = br;
		} else yr = !1;
		vr = yr && (!document.documentMode || 9 < document.documentMode);
	}
	function Sr() {
		pr && (pr.detachEvent("onpropertychange", Cr), mr = pr = null);
	}
	function Cr(e) {
		if (e.propertyName === "value" && gr(mr)) {
			var t = [];
			fr(t, mr, e, He(e)), Qe(hr, t);
		}
	}
	function wr(e, t, n) {
		e === "focusin" ? (Sr(), pr = t, mr = n, pr.attachEvent("onpropertychange", Cr)) : e === "focusout" && Sr();
	}
	function Tr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return gr(mr);
	}
	function Er(e, t) {
		if (e === "click") return gr(t);
	}
	function Dr(e, t) {
		if (e === "input" || e === "change") return gr(t);
	}
	function Or(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var kr = typeof Object.is == "function" ? Object.is : Or;
	function Ar(e, t) {
		if (kr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!d.call(t, i) || !kr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function jr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Mr(e, t) {
		var n = jr(e);
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
			n = jr(n);
		}
	}
	function Nr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Nr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Pr() {
		for (var e = window, t = ye(); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = ye(e.document);
		}
		return t;
	}
	function Fr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	function Ir(e) {
		var t = Pr(), n = e.focusedElem, r = e.selectionRange;
		if (t !== n && n && n.ownerDocument && Nr(n.ownerDocument.documentElement, n)) {
			if (r !== null && Fr(n)) {
				if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
				else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
					e = e.getSelection();
					var i = n.textContent.length, a = Math.min(r.start, i);
					r = r.end === void 0 ? a : Math.min(r.end, i), !e.extend && a > r && (i = r, r = a, a = i), i = Mr(n, a);
					var o = Mr(n, r);
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
	var Lr = u && "documentMode" in document && 11 >= document.documentMode, Rr = null, zr = null, Br = null, Vr = !1;
	function Hr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Vr || Rr == null || Rr !== ye(r) || (r = Rr, "selectionStart" in r && Fr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Br && Ar(Br, r) || (Br = r, r = pi(zr, "onSelect"), 0 < r.length && (t = new An("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Rr)));
	}
	function Ur(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Wr = {
		animationend: Ur("Animation", "AnimationEnd"),
		animationiteration: Ur("Animation", "AnimationIteration"),
		animationstart: Ur("Animation", "AnimationStart"),
		transitionend: Ur("Transition", "TransitionEnd")
	}, Gr = {}, Kr = {};
	u && (Kr = document.createElement("div").style, "AnimationEvent" in window || (delete Wr.animationend.animation, delete Wr.animationiteration.animation, delete Wr.animationstart.animation), "TransitionEvent" in window || delete Wr.transitionend.transition);
	function qr(e) {
		if (Gr[e]) return Gr[e];
		if (!Wr[e]) return e;
		var t = Wr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Kr) return Gr[e] = t[n];
		return e;
	}
	var Jr = qr("animationend"), Yr = qr("animationiteration"), Xr = qr("animationstart"), Zr = qr("transitionend"), Qr = /* @__PURE__ */ new Map(), $r = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	function ei(e, t) {
		Qr.set(e, t), c(t, [e]);
	}
	for (var ti = 0; ti < $r.length; ti++) {
		var ni = $r[ti];
		ei(ni.toLowerCase(), "on" + (ni[0].toUpperCase() + ni.slice(1)));
	}
	ei(Jr, "onAnimationEnd"), ei(Yr, "onAnimationIteration"), ei(Xr, "onAnimationStart"), ei("dblclick", "onDoubleClick"), ei("focusin", "onFocus"), ei("focusout", "onBlur"), ei(Zr, "onTransitionEnd"), l("onMouseEnter", ["mouseout", "mouseover"]), l("onMouseLeave", ["mouseout", "mouseover"]), l("onPointerEnter", ["pointerout", "pointerover"]), l("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var ri = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), ii = new Set("cancel close invalid load scroll toggle".split(" ").concat(ri));
	function ai(e, t, n) {
		var r = e.type || "unknown-event";
		e.currentTarget = n, lt(r, t, void 0, e), e.currentTarget = null;
	}
	function oi(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					ai(i, s, l), a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					ai(i, s, l), a = c;
				}
			}
		}
		if (at) throw e = ot, at = !1, ot = null, e;
	}
	function H(e, t) {
		var n = t[Ni];
		n === void 0 && (n = t[Ni] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (ui(t, e, 2, !1), n.add(r));
	}
	function si(e, t, n) {
		var r = 0;
		t && (r |= 4), ui(n, e, r, t);
	}
	var ci = "_reactListening" + Math.random().toString(36).slice(2);
	function li(e) {
		if (!e[ci]) {
			e[ci] = !0, o.forEach(function(t) {
				t !== "selectionchange" && (ii.has(t) || si(t, !1, e), si(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[ci] || (t[ci] = !0, si("selectionchange", !1, t));
		}
	}
	function ui(e, t, n, r) {
		switch (bn(t)) {
			case 1:
				var i = hn;
				break;
			case 4:
				i = gn;
				break;
			default: i = _n;
		}
		n = i.bind(null, t, n, e), i = void 0, !et || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function di(e, t, n, r, i) {
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
					if (o = Ii(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		Qe(function() {
			var r = a, i = He(n), o = [];
			a: {
				var s = Qr.get(e);
				if (s !== void 0) {
					var c = An, l = e;
					switch (e) {
						case "keypress": if (Tn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Jn;
							break;
						case "focusin":
							l = "focus", c = zn;
							break;
						case "focusout":
							l = "blur", c = zn;
							break;
						case "beforeblur":
						case "afterblur":
							c = zn;
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
							c = Ln;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Rn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = V;
							break;
						case Jr:
						case Yr:
						case Xr:
							c = Bn;
							break;
						case Zr:
							c = Xn;
							break;
						case "scroll":
							c = Mn;
							break;
						case "wheel":
							c = Zn;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Vn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup": c = Yn;
					}
					var u = !!(t & 4), d = !u && e === "scroll", f = u ? s === null ? null : s + "Capture" : s;
					u = [];
					for (var p = r, m; p !== null;) {
						m = p;
						var h = m.stateNode;
						if (m.tag === 5 && h !== null && (m = h, f !== null && (h = $e(p, f), h != null && u.push(fi(p, h, m)))), d) break;
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
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Ve && (l = n.relatedTarget || n.fromElement) && (Ii(l) || l[Mi])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Ii(l) : null, l !== null && (d = ut(l), l !== d || l.tag !== 5 && l.tag !== 6) && (l = null)) : (c = null, l = r), c !== l)) {
						if (u = Ln, h = "onMouseLeave", f = "onMouseEnter", p = "mouse", (e === "pointerout" || e === "pointerover") && (u = Yn, h = "onPointerLeave", f = "onPointerEnter", p = "pointer"), d = c == null ? s : Ri(c), m = l == null ? s : Ri(l), s = new u(h, p + "leave", c, n, i), s.target = d, s.relatedTarget = m, h = null, Ii(i) === r && (u = new u(f, p + "enter", l, n, i), u.target = m, u.relatedTarget = d, h = u), d = h, c && l) b: {
							for (u = c, f = l, p = 0, m = u; m; m = mi(m)) p++;
							for (m = 0, h = f; h; h = mi(h)) m++;
							for (; 0 < p - m;) u = mi(u), p--;
							for (; 0 < m - p;) f = mi(f), m--;
							for (; p--;) {
								if (u === f || f !== null && u === f.alternate) break b;
								u = mi(u), f = mi(f);
							}
							u = null;
						}
						else u = null;
						c !== null && hi(o, s, c, u, !1), l !== null && d !== null && hi(o, d, l, u, !0);
					}
				}
				a: {
					if (s = r ? Ri(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var g = _r;
					else if (dr(s)) {
						if (vr) g = Dr;
						else {
							g = Tr;
							var _ = wr;
						}
					} else (c = s.nodeName) && c.toLowerCase() === "input" && (s.type === "checkbox" || s.type === "radio") && (g = Er);
					if (g &&= g(e, r)) {
						fr(o, g, n, i);
						break a;
					}
					_ && _(e, s, r), e === "focusout" && (_ = s._wrapperState) && _.controlled && s.type === "number" && Te(s, "number", s.value);
				}
				switch (_ = r ? Ri(r) : window, e) {
					case "focusin":
						(dr(_) || _.contentEditable === "true") && (Rr = _, zr = r, Br = null);
						break;
					case "focusout":
						Br = zr = Rr = null;
						break;
					case "mousedown":
						Vr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Vr = !1, Hr(o, n, i);
						break;
					case "selectionchange": if (Lr) break;
					case "keydown":
					case "keyup": Hr(o, n, i);
				}
				var v;
				if ($n) b: {
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
				else sr ? ar(e, n) && (y = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (y = "onCompositionStart");
				y && (nr && n.locale !== "ko" && (sr || y !== "onCompositionStart" ? y === "onCompositionEnd" && sr && (v = wn()) : (xn = i, Sn = "value" in xn ? xn.value : xn.textContent, sr = !0)), _ = pi(r, y), 0 < _.length && (y = new Hn(y, e, null, n, i), o.push({
					event: y,
					listeners: _
				}), v ? y.data = v : (v = or(n), v !== null && (y.data = v)))), (v = tr ? cr(e, n) : lr(e, n)) && (r = pi(r, "onBeforeInput"), 0 < r.length && (i = new Hn("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: i,
					listeners: r
				}), i.data = v));
			}
			oi(o, t);
		});
	}
	function fi(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function pi(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			i.tag === 5 && a !== null && (i = a, a = $e(e, n), a != null && r.unshift(fi(e, a, i)), a = $e(e, t), a != null && r.push(fi(e, a, i))), e = e.return;
		}
		return r;
	}
	function mi(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5);
		return e || null;
	}
	function hi(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (c !== null && c === r) break;
			s.tag === 5 && l !== null && (s = l, i ? (c = $e(n, a), c != null && o.unshift(fi(n, c, s))) : i || (c = $e(n, a), c != null && o.push(fi(n, c, s)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var gi = /\r\n?/g, _i = /\u0000|\uFFFD/g;
	function vi(e) {
		return (typeof e == "string" ? e : "" + e).replace(gi, "\n").replace(_i, "");
	}
	function yi(e, t, n) {
		if (t = vi(t), vi(e) !== t && n) throw Error(a(425));
	}
	function bi() {}
	var xi = null, Si = null;
	function Ci(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var wi = typeof setTimeout == "function" ? setTimeout : void 0, Ti = typeof clearTimeout == "function" ? clearTimeout : void 0, Ei = typeof Promise == "function" ? Promise : void 0, Di = typeof queueMicrotask == "function" ? queueMicrotask : Ei === void 0 ? wi : function(e) {
		return Ei.resolve(null).then(e).catch(Oi);
	};
	function Oi(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function U(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$") {
					if (r === 0) {
						e.removeChild(i), fn(t);
						return;
					}
					r--;
				} else n !== "$" && n !== "$?" && n !== "$!" || r++;
			}
			n = i;
		} while (n);
		fn(t);
	}
	function W(e) {
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
	function ki(e) {
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
	var G = Math.random().toString(36).slice(2), Ai = "__reactFiber$" + G, ji = "__reactProps$" + G, Mi = "__reactContainer$" + G, Ni = "__reactEvents$" + G, Pi = "__reactListeners$" + G, Fi = "__reactHandles$" + G;
	function Ii(e) {
		var t = e[Ai];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[Mi] || n[Ai]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ki(e); e !== null;) {
					if (n = e[Ai]) return n;
					e = ki(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Li(e) {
		return e = e[Ai] || e[Mi], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
	}
	function Ri(e) {
		if (e.tag === 5 || e.tag === 6) return e.stateNode;
		throw Error(a(33));
	}
	function zi(e) {
		return e[ji] || null;
	}
	var Bi = [], Vi = -1;
	function Hi(e) {
		return { current: e };
	}
	function K(e) {
		0 > Vi || (e.current = Bi[Vi], Bi[Vi] = null, Vi--);
	}
	function q(e, t) {
		Vi++, Bi[Vi] = e.current, e.current = t;
	}
	var Ui = {}, Wi = Hi(Ui), Gi = Hi(!1), Ki = Ui;
	function qi(e, t) {
		var n = e.type.contextTypes;
		if (!n) return Ui;
		var r = e.stateNode;
		if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
		var i = {}, a;
		for (a in n) i[a] = t[a];
		return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = i), i;
	}
	function Ji(e) {
		return e = e.childContextTypes, e != null;
	}
	function Yi() {
		K(Gi), K(Wi);
	}
	function Xi(e, t, n) {
		if (Wi.current !== Ui) throw Error(a(168));
		q(Wi, t), q(Gi, n);
	}
	function Zi(e, t, n) {
		var r = e.stateNode;
		if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
		for (var i in r = r.getChildContext(), r) if (!(i in t)) throw Error(a(108, pe(e) || "Unknown", i));
		return M({}, n, r);
	}
	function Qi(e) {
		return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Ui, Ki = Wi.current, q(Wi, e), q(Gi, Gi.current), !0;
	}
	function $i(e, t, n) {
		var r = e.stateNode;
		if (!r) throw Error(a(169));
		n ? (e = Zi(e, t, Ki), r.__reactInternalMemoizedMergedChildContext = e, K(Gi), K(Wi), q(Wi, e)) : K(Gi), q(Gi, n);
	}
	var ea = null, ta = !1, na = !1;
	function ra(e) {
		ea === null ? ea = [e] : ea.push(e);
	}
	function ia(e) {
		ta = !0, ra(e);
	}
	function aa() {
		if (!na && ea !== null) {
			na = !0;
			var e = 0, t = B;
			try {
				var n = ea;
				for (B = 1; e < n.length; e++) {
					var r = n[e];
					do
						r = r(!0);
					while (r !== null);
				}
				ea = null, ta = !1;
			} catch (t) {
				throw ea !== null && (ea = ea.slice(e + 1)), gt(St, aa), t;
			} finally {
				B = t, na = !1;
			}
		}
		return null;
	}
	var oa = [], sa = 0, ca = null, la = 0, ua = [], da = 0, fa = null, pa = 1, ma = "";
	function ha(e, t) {
		oa[sa++] = la, oa[sa++] = ca, ca = e, la = t;
	}
	function ga(e, t, n) {
		ua[da++] = pa, ua[da++] = ma, ua[da++] = fa, fa = e;
		var r = pa;
		e = ma;
		var i = 32 - At(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - At(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, pa = 1 << 32 - At(t) + i | n << i | r, ma = a + e;
		} else pa = 1 << a | n << i | r, ma = e;
	}
	function _a(e) {
		e.return !== null && (ha(e, 1), ga(e, 1, 0));
	}
	function va(e) {
		for (; e === ca;) ca = oa[--sa], oa[sa] = null, la = oa[--sa], oa[sa] = null;
		for (; e === fa;) fa = ua[--da], ua[da] = null, ma = ua[--da], ua[da] = null, pa = ua[--da], ua[da] = null;
	}
	var ya = null, ba = null, J = !1, xa = null;
	function Sa(e, t) {
		var n = Kl(5, null, null, 0);
		n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
	}
	function Ca(e, t) {
		switch (e.tag) {
			case 5:
				var n = e.type;
				return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null && (e.stateNode = t, ya = e, ba = W(t.firstChild), !0);
			case 6: return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null && (e.stateNode = t, ya = e, ba = null, !0);
			case 13: return t = t.nodeType === 8 ? t : null, t !== null && (n = fa === null ? null : {
				id: pa,
				overflow: ma
			}, e.memoizedState = {
				dehydrated: t,
				treeContext: n,
				retryLane: 1073741824
			}, n = Kl(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, ya = e, ba = null, !0);
			default: return !1;
		}
	}
	function wa(e) {
		return !!(e.mode & 1) && !(e.flags & 128);
	}
	function Ta(e) {
		if (J) {
			var t = ba;
			if (t) {
				var n = t;
				if (!Ca(e, t)) {
					if (wa(e)) throw Error(a(418));
					t = W(n.nextSibling);
					var r = ya;
					t && Ca(e, t) ? Sa(r, n) : (e.flags = e.flags & -4097 | 2, J = !1, ya = e);
				}
			} else {
				if (wa(e)) throw Error(a(418));
				e.flags = e.flags & -4097 | 2, J = !1, ya = e;
			}
		}
	}
	function Ea(e) {
		for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;) e = e.return;
		ya = e;
	}
	function Da(e) {
		if (e !== ya) return !1;
		if (!J) return Ea(e), J = !0, !1;
		var t;
		if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Ci(e.type, e.memoizedProps)), t &&= ba) {
			if (wa(e)) throw Oa(), Error(a(418));
			for (; t;) Sa(e, t), t = W(t.nextSibling);
		}
		if (Ea(e), e.tag === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(a(317));
			a: {
				for (e = e.nextSibling, t = 0; e;) {
					if (e.nodeType === 8) {
						var n = e.data;
						if (n === "/$") {
							if (t === 0) {
								ba = W(e.nextSibling);
								break a;
							}
							t--;
						} else n !== "$" && n !== "$!" && n !== "$?" || t++;
					}
					e = e.nextSibling;
				}
				ba = null;
			}
		} else ba = ya ? W(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Oa() {
		for (var e = ba; e;) e = W(e.nextSibling);
	}
	function ka() {
		ba = ya = null, J = !1;
	}
	function Aa(e) {
		xa === null ? xa = [e] : xa.push(e);
	}
	var ja = C.ReactCurrentBatchConfig;
	function Ma(e, t, n) {
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
	function Na(e, t) {
		throw e = Object.prototype.toString.call(t), Error(a(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
	}
	function Pa(e) {
		var t = e._init;
		return t(e._payload);
	}
	function Fa(e) {
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
			return a === te ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === ie && Pa(a) === t.type) ? (r = i(t, n.props), r.ref = Ma(e, t, n), r.return = e, r) : (r = Xl(n.type, n.key, n.props, null, e.mode, r), r.ref = Ma(e, t, n), r.return = e, r);
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
					case ee: return n = Xl(t.type, t.key, t.props, null, e.mode, n), n.ref = Ma(e, null, t), n.return = e, n;
					case w: return t = eu(t, e.mode, n), t.return = e, t;
					case ie:
						var r = t._init;
						return f(e, r(t._payload), n);
				}
				if (Ee(t) || oe(t)) return t = Zl(t, e.mode, n, null), t.return = e, t;
				Na(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case ee: return n.key === i ? l(e, t, n, r) : null;
					case w: return n.key === i ? u(e, t, n, r) : null;
					case ie: return i = n._init, p(e, t, i(n._payload), r);
				}
				if (Ee(n) || oe(n)) return i === null ? d(e, t, n, r, null) : null;
				Na(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case ee: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case w: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case ie:
						var a = r._init;
						return m(e, t, n, a(r._payload), i);
				}
				if (Ee(r) || oe(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				Na(t, r);
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
			if (h === s.length) return n(i, d), J && ha(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return J && ha(i, h), l;
			}
			for (d = r(i, d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), J && ha(i, h), l;
		}
		function g(i, s, c, l) {
			var u = oe(c);
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
			if (v.done) return n(i, h), J && ha(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return J && ha(i, g), u;
			}
			for (h = r(i, h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), J && ha(i, g), u;
		}
		function _(e, r, a, o) {
			if (typeof a == "object" && a && a.type === te && a.key === null && (a = a.props.children), typeof a == "object" && a) {
				switch (a.$$typeof) {
					case ee:
						a: {
							for (var c = a.key, l = r; l !== null;) {
								if (l.key === c) {
									if (c = a.type, c === te) {
										if (l.tag === 7) {
											n(e, l.sibling), r = i(l, a.props.children), r.return = e, e = r;
											break a;
										}
									} else if (l.elementType === c || typeof c == "object" && c && c.$$typeof === ie && Pa(c) === l.type) {
										n(e, l.sibling), r = i(l, a.props), r.ref = Ma(e, l, a), r.return = e, e = r;
										break a;
									}
									n(e, l);
									break;
								}
								t(e, l), l = l.sibling;
							}
							a.type === te ? (r = Zl(a.props.children, e.mode, o, a.key), r.return = e, e = r) : (o = Xl(a.type, a.key, a.props, null, e.mode, o), o.ref = Ma(e, r, a), o.return = e, e = o);
						}
						return s(e);
					case w:
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
					case ie: return l = a._init, _(e, r, l(a._payload), o);
				}
				if (Ee(a)) return h(e, r, a, o);
				if (oe(a)) return g(e, r, a, o);
				Na(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), r = i(r, a), r.return = e, e = r) : (n(e, r), r = $l(a, e.mode, o), r.return = e, e = r), s(e)) : n(e, r);
		}
		return _;
	}
	var Ia = Fa(!0), La = Fa(!1), Ra = Hi(null), za = null, Ba = null, Va = null;
	function Ha() {
		Va = Ba = za = null;
	}
	function Ua(e) {
		var t = Ra.current;
		K(Ra), e._currentValue = t;
	}
	function Wa(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Ga(e, t) {
		za = e, Va = Ba = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & t) !== 0 && (Ms = !0), e.firstContext = null);
	}
	function Ka(e) {
		var t = e._currentValue;
		if (Va !== e) {
			if (e = {
				context: e,
				memoizedValue: t,
				next: null
			}, Ba === null) {
				if (za === null) throw Error(a(308));
				Ba = e, za.dependencies = {
					lanes: 0,
					firstContext: e
				};
			} else Ba = Ba.next = e;
		}
		return t;
	}
	var qa = null;
	function Ja(e) {
		qa === null ? qa = [e] : qa.push(e);
	}
	function Ya(e, t, n, r) {
		var i = t.interleaved;
		return i === null ? (n.next = n, Ja(t)) : (n.next = i.next, i.next = n), t.interleaved = n, Xa(e, r);
	}
	function Xa(e, t) {
		e.lanes |= t;
		var n = e.alternate;
		for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null;) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
		return n.tag === 3 ? n.stateNode : null;
	}
	var Za = !1;
	function Qa(e) {
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
	function $a(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			effects: e.effects
		});
	}
	function eo(e, t) {
		return {
			eventTime: e,
			lane: t,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function to(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, $ & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, Xa(e, n);
		}
		return i = r.interleaved, i === null ? (t.next = t, Ja(r)) : (t.next = i.next, i.next = t), r.interleaved = t, Xa(e, n);
	}
	function no(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194240)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, z(e, n);
		}
	}
	function ro(e, t) {
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
	function io(e, t, n, r) {
		var i = e.updateQueue;
		Za = !1;
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
								d = M({}, d, f);
								break a;
							case 2: Za = !0;
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
			Jc |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function ao(e, t, n) {
		if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
			var r = e[t], i = r.callback;
			if (i !== null) {
				if (r.callback = null, r = n, typeof i != "function") throw Error(a(191, i));
				i.call(r);
			}
		}
	}
	var oo = {}, so = Hi(oo), co = Hi(oo), lo = Hi(oo);
	function uo(e) {
		if (e === oo) throw Error(a(174));
		return e;
	}
	function fo(e, t) {
		switch (q(lo, t), q(co, e), q(so, oo), e = t.nodeType, e) {
			case 9:
			case 11:
				t = (t = t.documentElement) ? t.namespaceURI : Ae(null, "");
				break;
			default: e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Ae(t, e);
		}
		K(so), q(so, t);
	}
	function po() {
		K(so), K(co), K(lo);
	}
	function mo(e) {
		uo(lo.current);
		var t = uo(so.current), n = Ae(t, e.type);
		t !== n && (q(co, e), q(so, n));
	}
	function ho(e) {
		co.current === e && (K(so), K(co));
	}
	var Y = Hi(0);
	function go(e) {
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
	var _o = [];
	function vo() {
		for (var e = 0; e < _o.length; e++) _o[e]._workInProgressVersionPrimary = null;
		_o.length = 0;
	}
	var yo = C.ReactCurrentDispatcher, bo = C.ReactCurrentBatchConfig, xo = 0, X = null, Z = null, So = null, Co = !1, wo = !1, To = 0, Eo = 0;
	function Do() {
		throw Error(a(321));
	}
	function Oo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!kr(e[n], t[n])) return !1;
		return !0;
	}
	function ko(e, t, n, r, i, o) {
		if (xo = o, X = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, yo.current = e === null || e.memoizedState === null ? fs : ps, e = n(r, i), wo) {
			o = 0;
			do {
				if (wo = !1, To = 0, 25 <= o) throw Error(a(301));
				o += 1, So = Z = null, t.updateQueue = null, yo.current = ms, e = n(r, i);
			} while (wo);
		}
		if (yo.current = ds, t = Z !== null && Z.next !== null, xo = 0, So = Z = X = null, Co = !1, t) throw Error(a(300));
		return e;
	}
	function Ao() {
		var e = To !== 0;
		return To = 0, e;
	}
	function jo() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return So === null ? X.memoizedState = So = e : So = So.next = e, So;
	}
	function Mo() {
		if (Z === null) {
			var e = X.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Z.next;
		var t = So === null ? X.memoizedState : So.next;
		if (t !== null) So = t, Z = e;
		else {
			if (e === null) throw Error(a(310));
			Z = e, e = {
				memoizedState: Z.memoizedState,
				baseState: Z.baseState,
				baseQueue: Z.baseQueue,
				queue: Z.queue,
				next: null
			}, So === null ? X.memoizedState = So = e : So = So.next = e;
		}
		return So;
	}
	function No(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function Po(e) {
		var t = Mo(), n = t.queue;
		if (n === null) throw Error(a(311));
		n.lastRenderedReducer = e;
		var r = Z, i = r.baseQueue, o = n.pending;
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
				if ((xo & d) === d) l !== null && (l = l.next = {
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
					l === null ? (c = l = f, s = r) : l = l.next = f, X.lanes |= d, Jc |= d;
				}
				u = u.next;
			} while (u !== null && u !== o);
			l === null ? s = r : l.next = c, kr(r, t.memoizedState) || (Ms = !0), t.memoizedState = r, t.baseState = s, t.baseQueue = l, n.lastRenderedState = r;
		}
		if (e = n.interleaved, e !== null) {
			i = e;
			do
				o = i.lane, X.lanes |= o, Jc |= o, i = i.next;
			while (i !== e);
		} else i === null && (n.lanes = 0);
		return [t.memoizedState, n.dispatch];
	}
	function Fo(e) {
		var t = Mo(), n = t.queue;
		if (n === null) throw Error(a(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, o = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var s = i = i.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== i);
			kr(o, t.memoizedState) || (Ms = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function Io() {}
	function Lo(e, t) {
		var n = X, r = Mo(), i = t(), o = !kr(r.memoizedState, i);
		if (o && (r.memoizedState = i, Ms = !0), r = r.queue, Yo(Bo.bind(null, n, r, e), [e]), r.getSnapshot !== t || o || So !== null && So.memoizedState.tag & 1) {
			if (n.flags |= 2048, Wo(9, zo.bind(null, n, r, i, t), void 0, null), Vc === null) throw Error(a(349));
			xo & 30 || Ro(n, t, i);
		}
		return i;
	}
	function Ro(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = X.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, X.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function zo(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Vo(t) && Ho(e);
	}
	function Bo(e, t, n) {
		return n(function() {
			Vo(t) && Ho(e);
		});
	}
	function Vo(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !kr(e, n);
		} catch {
			return !0;
		}
	}
	function Ho(e) {
		var t = Xa(e, 1);
		t !== null && ml(t, e, 1, -1);
	}
	function Uo(e) {
		var t = jo();
		return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = {
			pending: null,
			interleaved: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: No,
			lastRenderedState: e
		}, t.queue = e, e = e.dispatch = ss.bind(null, X, e), [t.memoizedState, e];
	}
	function Wo(e, t, n, r) {
		return e = {
			tag: e,
			create: t,
			destroy: n,
			deps: r,
			next: null
		}, t = X.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, X.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
	}
	function Go() {
		return Mo().memoizedState;
	}
	function Ko(e, t, n, r) {
		var i = jo();
		X.flags |= e, i.memoizedState = Wo(1 | t, n, void 0, r === void 0 ? null : r);
	}
	function qo(e, t, n, r) {
		var i = Mo();
		r = r === void 0 ? null : r;
		var a = void 0;
		if (Z !== null) {
			var o = Z.memoizedState;
			if (a = o.destroy, r !== null && Oo(r, o.deps)) {
				i.memoizedState = Wo(t, n, a, r);
				return;
			}
		}
		X.flags |= e, i.memoizedState = Wo(1 | t, n, a, r);
	}
	function Jo(e, t) {
		return Ko(8390656, 8, e, t);
	}
	function Yo(e, t) {
		return qo(2048, 8, e, t);
	}
	function Xo(e, t) {
		return qo(4, 2, e, t);
	}
	function Zo(e, t) {
		return qo(4, 4, e, t);
	}
	function Qo(e, t) {
		if (typeof t == "function") return e = e(), t(e), function() {
			t(null);
		};
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function $o(e, t, n) {
		return n = n == null ? null : n.concat([e]), qo(4, 4, Qo.bind(null, t, e), n);
	}
	function es() {}
	function ts(e, t) {
		var n = Mo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return r !== null && t !== null && Oo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function ns(e, t) {
		var n = Mo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return r !== null && t !== null && Oo(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
	}
	function rs(e, t, n) {
		return xo & 21 ? (kr(n, t) || (n = Rt(), X.lanes |= n, Jc |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, Ms = !0), e.memoizedState = n);
	}
	function is(e, t) {
		var n = B;
		B = n !== 0 && 4 > n ? n : 4, e(!0);
		var r = bo.transition;
		bo.transition = {};
		try {
			e(!1), t();
		} finally {
			B = n, bo.transition = r;
		}
	}
	function as() {
		return Mo().memoizedState;
	}
	function os(e, t, n) {
		var r = pl(e);
		if (n = {
			lane: r,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, cs(e)) ls(t, n);
		else if (n = Ya(e, t, n, r), n !== null) {
			var i = fl();
			ml(n, e, r, i), us(n, t, r);
		}
	}
	function ss(e, t, n) {
		var r = pl(e), i = {
			lane: r,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (cs(e)) ls(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, kr(s, o)) {
					var c = t.interleaved;
					c === null ? (i.next = i, Ja(t)) : (i.next = c.next, c.next = i), t.interleaved = i;
					return;
				}
			} catch {}
			n = Ya(e, t, i, r), n !== null && (i = fl(), ml(n, e, r, i), us(n, t, r));
		}
	}
	function cs(e) {
		var t = e.alternate;
		return e === X || t !== null && t === X;
	}
	function ls(e, t) {
		wo = Co = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function us(e, t, n) {
		if (n & 4194240) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, z(e, n);
		}
	}
	var ds = {
		readContext: Ka,
		useCallback: Do,
		useContext: Do,
		useEffect: Do,
		useImperativeHandle: Do,
		useInsertionEffect: Do,
		useLayoutEffect: Do,
		useMemo: Do,
		useReducer: Do,
		useRef: Do,
		useState: Do,
		useDebugValue: Do,
		useDeferredValue: Do,
		useTransition: Do,
		useMutableSource: Do,
		useSyncExternalStore: Do,
		useId: Do,
		unstable_isNewReconciler: !1
	}, fs = {
		readContext: Ka,
		useCallback: function(e, t) {
			return jo().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Ka,
		useEffect: Jo,
		useImperativeHandle: function(e, t, n) {
			return n = n == null ? null : n.concat([e]), Ko(4194308, 4, Qo.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Ko(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			return Ko(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = jo();
			return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
		},
		useReducer: function(e, t, n) {
			var r = jo();
			return t = n === void 0 ? t : n(t), r.memoizedState = r.baseState = t, e = {
				pending: null,
				interleaved: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: t
			}, r.queue = e, e = e.dispatch = os.bind(null, X, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = jo();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: Uo,
		useDebugValue: es,
		useDeferredValue: function(e) {
			return jo().memoizedState = e;
		},
		useTransition: function() {
			var e = Uo(!1), t = e[0];
			return e = is.bind(null, e[1]), jo().memoizedState = e, [t, e];
		},
		useMutableSource: function() {},
		useSyncExternalStore: function(e, t, n) {
			var r = X, i = jo();
			if (J) {
				if (n === void 0) throw Error(a(407));
				n = n();
			} else {
				if (n = t(), Vc === null) throw Error(a(349));
				xo & 30 || Ro(r, t, n);
			}
			i.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return i.queue = o, Jo(Bo.bind(null, r, o, e), [e]), r.flags |= 2048, Wo(9, zo.bind(null, r, o, n, t), void 0, null), n;
		},
		useId: function() {
			var e = jo(), t = Vc.identifierPrefix;
			if (J) {
				var n = ma, r = pa;
				n = (r & ~(1 << 32 - At(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = To++, 0 < n && (t += "H" + n.toString(32)), t += ":";
			} else n = Eo++, t = ":" + t + "r" + n.toString(32) + ":";
			return e.memoizedState = t;
		},
		unstable_isNewReconciler: !1
	}, ps = {
		readContext: Ka,
		useCallback: ts,
		useContext: Ka,
		useEffect: Yo,
		useImperativeHandle: $o,
		useInsertionEffect: Xo,
		useLayoutEffect: Zo,
		useMemo: ns,
		useReducer: Po,
		useRef: Go,
		useState: function() {
			return Po(No);
		},
		useDebugValue: es,
		useDeferredValue: function(e) {
			return rs(Mo(), Z.memoizedState, e);
		},
		useTransition: function() {
			return [Po(No)[0], Mo().memoizedState];
		},
		useMutableSource: Io,
		useSyncExternalStore: Lo,
		useId: as,
		unstable_isNewReconciler: !1
	}, ms = {
		readContext: Ka,
		useCallback: ts,
		useContext: Ka,
		useEffect: Yo,
		useImperativeHandle: $o,
		useInsertionEffect: Xo,
		useLayoutEffect: Zo,
		useMemo: ns,
		useReducer: Fo,
		useRef: Go,
		useState: function() {
			return Fo(No);
		},
		useDebugValue: es,
		useDeferredValue: function(e) {
			var t = Mo();
			return Z === null ? t.memoizedState = e : rs(t, Z.memoizedState, e);
		},
		useTransition: function() {
			return [Fo(No)[0], Mo().memoizedState];
		},
		useMutableSource: Io,
		useSyncExternalStore: Lo,
		useId: as,
		unstable_isNewReconciler: !1
	};
	function hs(e, t) {
		if (e && e.defaultProps) {
			for (var n in t = M({}, t), e = e.defaultProps, e) t[n] === void 0 && (t[n] = e[n]);
			return t;
		}
		return t;
	}
	function gs(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : M({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var _s = {
		isMounted: function(e) {
			return (e = e._reactInternals) ? ut(e) === e : !1;
		},
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = fl(), i = pl(e), a = eo(r, i);
			a.payload = t, n != null && (a.callback = n), t = to(e, a, i), t !== null && (ml(t, e, i, r), no(t, e, i));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = fl(), i = pl(e), a = eo(r, i);
			a.tag = 1, a.payload = t, n != null && (a.callback = n), t = to(e, a, i), t !== null && (ml(t, e, i, r), no(t, e, i));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = fl(), r = pl(e), i = eo(n, r);
			i.tag = 2, t != null && (i.callback = t), t = to(e, i, r), t !== null && (ml(t, e, r, n), no(t, e, r));
		}
	};
	function vs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Ar(n, r) || !Ar(i, a) : !0;
	}
	function ys(e, t, n) {
		var r = !1, i = Ui, a = t.contextType;
		return typeof a == "object" && a ? a = Ka(a) : (i = Ji(t) ? Ki : Wi.current, r = t.contextTypes, a = (r = r != null) ? qi(e, i) : Ui), t = new t(n, a), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = _s, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = i, e.__reactInternalMemoizedMaskedChildContext = a), t;
	}
	function bs(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && _s.enqueueReplaceState(t, t.state, null);
	}
	function xs(e, t, n, r) {
		var i = e.stateNode;
		i.props = n, i.state = e.memoizedState, i.refs = {}, Qa(e);
		var a = t.contextType;
		typeof a == "object" && a ? i.context = Ka(a) : (a = Ji(t) ? Ki : Wi.current, i.context = qi(e, a)), i.state = e.memoizedState, a = t.getDerivedStateFromProps, typeof a == "function" && (gs(e, t, a, n), i.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), t !== i.state && _s.enqueueReplaceState(i, i.state, null), io(e, n, i, r), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.flags |= 4194308);
	}
	function Ss(e, t) {
		try {
			var n = "", r = t;
			do
				n += de(r), r = r.return;
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
	function Cs(e, t, n) {
		return {
			value: e,
			source: null,
			stack: n ?? null,
			digest: t ?? null
		};
	}
	function ws(e, t) {
		try {
			console.error(t.value);
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	var Ts = typeof WeakMap == "function" ? WeakMap : Map;
	function Es(e, t, n) {
		n = eo(-1, n), n.tag = 3, n.payload = { element: null };
		var r = t.value;
		return n.callback = function() {
			nl || (nl = !0, rl = r), ws(e, t);
		}, n;
	}
	function Ds(e, t, n) {
		n = eo(-1, n), n.tag = 3;
		var r = e.type.getDerivedStateFromError;
		if (typeof r == "function") {
			var i = t.value;
			n.payload = function() {
				return r(i);
			}, n.callback = function() {
				ws(e, t);
			};
		}
		var a = e.stateNode;
		return a !== null && typeof a.componentDidCatch == "function" && (n.callback = function() {
			ws(e, t), typeof r != "function" && (il === null ? il = /* @__PURE__ */ new Set([this]) : il.add(this));
			var n = t.stack;
			this.componentDidCatch(t.value, { componentStack: n === null ? "" : n });
		}), n;
	}
	function Os(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Ts();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (i.add(n), e = zl.bind(null, e, t, n), t.then(e, e));
	}
	function ks(e) {
		do {
			var t;
			if ((t = e.tag === 13) && (t = e.memoizedState, t = t === null || t.dehydrated !== null), t) return e;
			e = e.return;
		} while (e !== null);
		return null;
	}
	function As(e, t, n, r, i) {
		return e.mode & 1 ? (e.flags |= 65536, e.lanes = i, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = eo(-1, 1), t.tag = 2, to(n, t, 1))), n.lanes |= 1), e);
	}
	var js = C.ReactCurrentOwner, Ms = !1;
	function Ns(e, t, n, r) {
		t.child = e === null ? La(t, null, n, r) : Ia(t, e.child, n, r);
	}
	function Ps(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		return Ga(t, i), r = ko(e, t, n, r, a, i), n = Ao(), e !== null && !Ms ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, ec(e, t, i)) : (J && n && _a(t), t.flags |= 1, Ns(e, t, r, i), t.child);
	}
	function Fs(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ql(a) && a.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = a, Is(e, t, a, r, i)) : (e = Xl(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, (e.lanes & i) === 0) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Ar : n, n(o, r) && e.ref === t.ref) return ec(e, t, i);
		}
		return t.flags |= 1, e = Yl(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Is(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Ar(a, r) && e.ref === t.ref) {
				if (Ms = !1, t.pendingProps = r = a, (e.lanes & i) !== 0) e.flags & 131072 && (Ms = !0);
				else return t.lanes = e.lanes, ec(e, t, i);
			}
		}
		return zs(e, t, n, r, i);
	}
	function Ls(e, t, n) {
		var r = t.pendingProps, i = r.children, a = e === null ? null : e.memoizedState;
		if (r.mode === "hidden") {
			if (!(t.mode & 1)) t.memoizedState = {
				baseLanes: 0,
				cachePool: null,
				transitions: null
			}, q(Gc, Wc), Wc |= n;
			else {
				if (!(n & 1073741824)) return e = a === null ? n : a.baseLanes | n, t.lanes = t.childLanes = 1073741824, t.memoizedState = {
					baseLanes: e,
					cachePool: null,
					transitions: null
				}, t.updateQueue = null, q(Gc, Wc), Wc |= e, null;
				t.memoizedState = {
					baseLanes: 0,
					cachePool: null,
					transitions: null
				}, r = a === null ? n : a.baseLanes, q(Gc, Wc), Wc |= r;
			}
		} else a === null ? r = n : (r = a.baseLanes | n, t.memoizedState = null), q(Gc, Wc), Wc |= r;
		return Ns(e, t, i, n), t.child;
	}
	function Rs(e, t) {
		var n = t.ref;
		(e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
	}
	function zs(e, t, n, r, i) {
		var a = Ji(n) ? Ki : Wi.current;
		return a = qi(t, a), Ga(t, i), n = ko(e, t, n, r, a, i), r = Ao(), e !== null && !Ms ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, ec(e, t, i)) : (J && r && _a(t), t.flags |= 1, Ns(e, t, n, i), t.child);
	}
	function Bs(e, t, n, r, i) {
		if (Ji(n)) {
			var a = !0;
			Qi(t);
		} else a = !1;
		if (Ga(t, i), t.stateNode === null) $s(e, t), ys(t, n, r), xs(t, n, r, i), r = !0;
		else if (e === null) {
			var o = t.stateNode, s = t.memoizedProps;
			o.props = s;
			var c = o.context, l = n.contextType;
			typeof l == "object" && l ? l = Ka(l) : (l = Ji(n) ? Ki : Wi.current, l = qi(t, l));
			var u = n.getDerivedStateFromProps, d = typeof u == "function" || typeof o.getSnapshotBeforeUpdate == "function";
			d || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== r || c !== l) && bs(t, o, r, l), Za = !1;
			var f = t.memoizedState;
			o.state = f, io(t, r, o, i), c = t.memoizedState, s !== r || f !== c || Gi.current || Za ? (typeof u == "function" && (gs(t, n, u, r), c = t.memoizedState), (s = Za || vs(t, n, s, r, f, c, l)) ? (d || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = c), o.props = r, o.state = c, o.context = l, r = s) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			o = t.stateNode, $a(e, t), s = t.memoizedProps, l = t.type === t.elementType ? s : hs(t.type, s), o.props = l, d = t.pendingProps, f = o.context, c = n.contextType, typeof c == "object" && c ? c = Ka(c) : (c = Ji(n) ? Ki : Wi.current, c = qi(t, c));
			var p = n.getDerivedStateFromProps;
			(u = typeof p == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== d || f !== c) && bs(t, o, r, c), Za = !1, f = t.memoizedState, o.state = f, io(t, r, o, i);
			var m = t.memoizedState;
			s !== d || f !== m || Gi.current || Za ? (typeof p == "function" && (gs(t, n, p, r), m = t.memoizedState), (l = Za || vs(t, n, l, r, f, m, c) || !1) ? (u || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, m, c), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, m, c)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = m), o.props = r, o.state = m, o.context = c, r = l) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return Vs(e, t, n, r, a, i);
	}
	function Vs(e, t, n, r, i, a) {
		Rs(e, t);
		var o = !!(t.flags & 128);
		if (!r && !o) return i && $i(t, n, !1), ec(e, t, a);
		r = t.stateNode, js.current = t;
		var s = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
		return t.flags |= 1, e !== null && o ? (t.child = Ia(t, e.child, null, a), t.child = Ia(t, null, s, a)) : Ns(e, t, s, a), t.memoizedState = r.state, i && $i(t, n, !0), t.child;
	}
	function Hs(e) {
		var t = e.stateNode;
		t.pendingContext ? Xi(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Xi(e, t.context, !1), fo(e, t.containerInfo);
	}
	function Us(e, t, n, r, i) {
		return ka(), Aa(i), t.flags |= 256, Ns(e, t, n, r), t.child;
	}
	var Ws = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0
	};
	function Gs(e) {
		return {
			baseLanes: e,
			cachePool: null,
			transitions: null
		};
	}
	function Ks(e, t, n) {
		var r = t.pendingProps, i = Y.current, a = !1, o = !!(t.flags & 128), s;
		if ((s = o) || (s = e !== null && e.memoizedState === null ? !1 : !!(i & 2)), s ? (a = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (i |= 1), q(Y, i & 1), e === null) return Ta(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.lanes = t.mode & 1 ? e.data === "$!" ? 8 : 1073741824 : 1, null) : (o = r.children, e = r.fallback, a ? (r = t.mode, a = t.child, o = {
			mode: "hidden",
			children: o
		}, !(r & 1) && a !== null ? (a.childLanes = 0, a.pendingProps = o) : a = Ql(o, r, 0, null), e = Zl(e, r, n, null), a.return = t, e.return = t, a.sibling = e, t.child = a, t.child.memoizedState = Gs(n), t.memoizedState = Ws, e) : qs(t, o));
		if (i = e.memoizedState, i !== null && (s = i.dehydrated, s !== null)) return Ys(e, t, o, r, s, i, n);
		if (a) {
			a = r.fallback, o = t.mode, i = e.child, s = i.sibling;
			var c = {
				mode: "hidden",
				children: r.children
			};
			return !(o & 1) && t.child !== i ? (r = t.child, r.childLanes = 0, r.pendingProps = c, t.deletions = null) : (r = Yl(i, c), r.subtreeFlags = i.subtreeFlags & 14680064), s === null ? (a = Zl(a, o, n, null), a.flags |= 2) : a = Yl(s, a), a.return = t, r.return = t, r.sibling = a, t.child = r, r = a, a = t.child, o = e.child.memoizedState, o = o === null ? Gs(n) : {
				baseLanes: o.baseLanes | n,
				cachePool: null,
				transitions: o.transitions
			}, a.memoizedState = o, a.childLanes = e.childLanes & ~n, t.memoizedState = Ws, r;
		}
		return a = e.child, e = a.sibling, r = Yl(a, {
			mode: "visible",
			children: r.children
		}), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
	}
	function qs(e, t) {
		return t = Ql({
			mode: "visible",
			children: t
		}, e.mode, 0, null), t.return = e, e.child = t;
	}
	function Js(e, t, n, r) {
		return r !== null && Aa(r), Ia(t, e.child, null, n), e = qs(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Ys(e, t, n, r, i, o, s) {
		if (n) return t.flags & 256 ? (t.flags &= -257, r = Cs(Error(a(422))), Js(e, t, s, r)) : t.memoizedState === null ? (o = r.fallback, i = t.mode, r = Ql({
			mode: "visible",
			children: r.children
		}, i, 0, null), o = Zl(o, i, s, null), o.flags |= 2, r.return = t, o.return = t, r.sibling = o, t.child = r, t.mode & 1 && Ia(t, e.child, null, s), t.child.memoizedState = Gs(s), t.memoizedState = Ws, o) : (t.child = e.child, t.flags |= 128, null);
		if (!(t.mode & 1)) return Js(e, t, s, null);
		if (i.data === "$!") {
			if (r = i.nextSibling && i.nextSibling.dataset, r) var c = r.dgst;
			return r = c, o = Error(a(419)), r = Cs(o, r, void 0), Js(e, t, s, r);
		}
		if (c = (s & e.childLanes) !== 0, Ms || c) {
			if (r = Vc, r !== null) {
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
				i = (i & (r.suspendedLanes | s)) === 0 ? i : 0, i !== 0 && i !== o.retryLane && (o.retryLane = i, Xa(e, i), ml(r, e, i, -1));
			}
			return Ol(), r = Cs(Error(a(421))), Js(e, t, s, r);
		}
		return i.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Vl.bind(null, e), i._reactRetry = t, null) : (e = o.treeContext, ba = W(i.nextSibling), ya = t, J = !0, xa = null, e !== null && (ua[da++] = pa, ua[da++] = ma, ua[da++] = fa, pa = e.id, ma = e.overflow, fa = t), t = qs(t, r.children), t.flags |= 4096, t);
	}
	function Xs(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Wa(e.return, t, n);
	}
	function Zs(e, t, n, r, i) {
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
	function Qs(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		if (Ns(e, t, r.children, n), r = Y.current, r & 2) r = r & 1 | 2, t.flags |= 128;
		else {
			if (e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
				if (e.tag === 13) e.memoizedState !== null && Xs(e, n, t);
				else if (e.tag === 19) Xs(e, n, t);
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
		if (q(Y, r), !(t.mode & 1)) t.memoizedState = null;
		else switch (i) {
			case "forwards":
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && go(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), Zs(t, !1, i, n, a);
				break;
			case "backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && go(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				Zs(t, !0, n, null, a);
				break;
			case "together":
				Zs(t, !1, null, null, void 0);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function $s(e, t) {
		!(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
	}
	function ec(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Jc |= t.lanes, (n & t.childLanes) === 0) return null;
		if (e !== null && t.child !== e.child) throw Error(a(153));
		if (t.child !== null) {
			for (e = t.child, n = Yl(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Yl(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function tc(e, t, n) {
		switch (t.tag) {
			case 3:
				Hs(t), ka();
				break;
			case 5:
				mo(t);
				break;
			case 1:
				Ji(t.type) && Qi(t);
				break;
			case 4:
				fo(t, t.stateNode.containerInfo);
				break;
			case 10:
				var r = t.type._context, i = t.memoizedProps.value;
				q(Ra, r._currentValue), r._currentValue = i;
				break;
			case 13:
				if (r = t.memoizedState, r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (q(Y, Y.current & 1), e = ec(e, t, n), e === null ? null : e.sibling) : Ks(e, t, n) : (q(Y, Y.current & 1), t.flags |= 128, null);
				q(Y, Y.current & 1);
				break;
			case 19:
				if (r = (n & t.childLanes) !== 0, e.flags & 128) {
					if (r) return Qs(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), q(Y, Y.current), r) break;
				return null;
			case 22:
			case 23: return t.lanes = 0, Ls(e, t, n);
		}
		return ec(e, t, n);
	}
	var nc = function(e, t) {
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
	}, rc = function(e, t, n, r) {
		var i = e.memoizedProps;
		if (i !== r) {
			e = t.stateNode, uo(so.current);
			var a = null;
			switch (n) {
				case "input":
					i = be(e, i), r = be(e, r), a = [];
					break;
				case "select":
					i = M({}, i, { value: void 0 }), r = M({}, r, { value: void 0 }), a = [];
					break;
				case "textarea":
					i = P(e, i), r = P(e, r), a = [];
					break;
				default: typeof i.onClick != "function" && typeof r.onClick == "function" && (e.onclick = bi);
			}
			ze(n, r);
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
					} else u === "dangerouslySetInnerHTML" ? (l = l ? l.__html : void 0, c = c ? c.__html : void 0, l != null && c !== l && (a ||= []).push(u, l)) : u === "children" ? typeof l != "string" && typeof l != "number" || (a ||= []).push(u, "" + l) : u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && (s.hasOwnProperty(u) ? (l != null && u === "onScroll" && H("scroll", e), a || c === l || (a = [])) : (a ||= []).push(u, l));
				}
			}
			n && (a ||= []).push("style", n);
			var u = a;
			(t.updateQueue = u) && (t.flags |= 4);
		}
	}, ic = function(e, t, n, r) {
		n !== r && (t.flags |= 4);
	};
	function ac(e, t) {
		if (!J) switch (e.tailMode) {
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
	function oc(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 14680064, r |= i.flags & 14680064, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function sc(e, t, n) {
		var r = t.pendingProps;
		switch (va(t), t.tag) {
			case 2:
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return oc(t), null;
			case 1: return Ji(t.type) && Yi(), oc(t), null;
			case 3: return r = t.stateNode, po(), K(Gi), K(Wi), vo(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Da(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, xa !== null && (vl(xa), xa = null))), oc(t), null;
			case 5:
				ho(t);
				var i = uo(lo.current);
				if (n = t.type, e !== null && t.stateNode != null) rc(e, t, n, r, i), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(a(166));
						return oc(t), null;
					}
					if (e = uo(so.current), Da(t)) {
						r = t.stateNode, n = t.type;
						var o = t.memoizedProps;
						switch (r[Ai] = t, r[ji] = o, e = !!(t.mode & 1), n) {
							case "dialog":
								H("cancel", r), H("close", r);
								break;
							case "iframe":
							case "object":
							case "embed":
								H("load", r);
								break;
							case "video":
							case "audio":
								for (i = 0; i < ri.length; i++) H(ri[i], r);
								break;
							case "source":
								H("error", r);
								break;
							case "img":
							case "image":
							case "link":
								H("error", r), H("load", r);
								break;
							case "details":
								H("toggle", r);
								break;
							case "input":
								xe(r, o), H("invalid", r);
								break;
							case "select":
								r._wrapperState = { wasMultiple: !!o.multiple }, H("invalid", r);
								break;
							case "textarea": De(r, o), H("invalid", r);
						}
						for (var c in ze(n, o), i = null, o) if (o.hasOwnProperty(c)) {
							var l = o[c];
							c === "children" ? typeof l == "string" ? r.textContent !== l && (!0 !== o.suppressHydrationWarning && yi(r.textContent, l, e), i = ["children", l]) : typeof l == "number" && r.textContent !== "" + l && (!0 !== o.suppressHydrationWarning && yi(r.textContent, l, e), i = ["children", "" + l]) : s.hasOwnProperty(c) && l != null && c === "onScroll" && H("scroll", r);
						}
						switch (n) {
							case "input":
								_e(r), we(r, o, !0);
								break;
							case "textarea":
								_e(r), Oe(r);
								break;
							case "select":
							case "option": break;
							default: typeof o.onClick == "function" && (r.onclick = bi);
						}
						r = i, t.updateQueue = r, r !== null && (t.flags |= 4);
					} else {
						c = i.nodeType === 9 ? i : i.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = ke(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = c.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = c.createElement(n, { is: r.is }) : (e = c.createElement(n), n === "select" && (c = e, r.multiple ? c.multiple = !0 : r.size && (c.size = r.size))) : e = c.createElementNS(e, n), e[Ai] = t, e[ji] = r, nc(e, t, !1, !1), t.stateNode = e;
						a: {
							switch (c = Be(n, r), n) {
								case "dialog":
									H("cancel", e), H("close", e), i = r;
									break;
								case "iframe":
								case "object":
								case "embed":
									H("load", e), i = r;
									break;
								case "video":
								case "audio":
									for (i = 0; i < ri.length; i++) H(ri[i], e);
									i = r;
									break;
								case "source":
									H("error", e), i = r;
									break;
								case "img":
								case "image":
								case "link":
									H("error", e), H("load", e), i = r;
									break;
								case "details":
									H("toggle", e), i = r;
									break;
								case "input":
									xe(e, r), i = be(e, r), H("invalid", e);
									break;
								case "option":
									i = r;
									break;
								case "select":
									e._wrapperState = { wasMultiple: !!r.multiple }, i = M({}, r, { value: void 0 }), H("invalid", e);
									break;
								case "textarea":
									De(e, r), i = P(e, r), H("invalid", e);
									break;
								default: i = r;
							}
							for (o in ze(n, i), l = i, l) if (l.hasOwnProperty(o)) {
								var u = l[o];
								o === "style" ? Le(e, u) : o === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Me(e, u)) : o === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && Ne(e, u) : typeof u == "number" && Ne(e, "" + u) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (s.hasOwnProperty(o) ? u != null && o === "onScroll" && H("scroll", e) : u != null && S(e, o, u, c));
							}
							switch (n) {
								case "input":
									_e(e), we(e, r, !1);
									break;
								case "textarea":
									_e(e), Oe(e);
									break;
								case "option":
									r.value != null && e.setAttribute("value", "" + me(r.value));
									break;
								case "select":
									e.multiple = !!r.multiple, o = r.value, o == null ? r.defaultValue != null && N(e, !!r.multiple, r.defaultValue, !0) : N(e, !!r.multiple, o, !1);
									break;
								default: typeof i.onClick == "function" && (e.onclick = bi);
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
				return oc(t), null;
			case 6:
				if (e && t.stateNode != null) ic(e, t, e.memoizedProps, r);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(a(166));
					if (n = uo(lo.current), uo(so.current), Da(t)) {
						if (r = t.stateNode, n = t.memoizedProps, r[Ai] = t, (o = r.nodeValue !== n) && (e = ya, e !== null)) switch (e.tag) {
							case 3:
								yi(r.nodeValue, n, !!(e.mode & 1));
								break;
							case 5: !0 !== e.memoizedProps.suppressHydrationWarning && yi(r.nodeValue, n, !!(e.mode & 1));
						}
						o && (t.flags |= 4);
					} else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Ai] = t, t.stateNode = r;
				}
				return oc(t), null;
			case 13:
				if (K(Y), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (J && ba !== null && t.mode & 1 && !(t.flags & 128)) Oa(), ka(), t.flags |= 98560, o = !1;
					else if (o = Da(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!o) throw Error(a(318));
							if (o = t.memoizedState, o = o === null ? null : o.dehydrated, !o) throw Error(a(317));
							o[Ai] = t;
						} else ka(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						oc(t), o = !1;
					} else xa !== null && (vl(xa), xa = null), o = !0;
					if (!o) return t.flags & 65536 ? t : null;
				}
				return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || Y.current & 1 ? Kc === 0 && (Kc = 3) : Ol())), t.updateQueue !== null && (t.flags |= 4), oc(t), null);
			case 4: return po(), e === null && li(t.stateNode.containerInfo), oc(t), null;
			case 10: return Ua(t.type._context), oc(t), null;
			case 17: return Ji(t.type) && Yi(), oc(t), null;
			case 19:
				if (K(Y), o = t.memoizedState, o === null) return oc(t), null;
				if (r = !!(t.flags & 128), c = o.rendering, c === null) {
					if (r) ac(o, !1);
					else {
						if (Kc !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (c = go(e), c !== null) {
								for (t.flags |= 128, ac(o, !1), r = c.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null;) o = n, e = r, o.flags &= 14680066, c = o.alternate, c === null ? (o.childLanes = 0, o.lanes = e, o.child = null, o.subtreeFlags = 0, o.memoizedProps = null, o.memoizedState = null, o.updateQueue = null, o.dependencies = null, o.stateNode = null) : (o.childLanes = c.childLanes, o.lanes = c.lanes, o.child = c.child, o.subtreeFlags = 0, o.deletions = null, o.memoizedProps = c.memoizedProps, o.memoizedState = c.memoizedState, o.updateQueue = c.updateQueue, o.type = c.type, e = c.dependencies, o.dependencies = e === null ? null : {
									lanes: e.lanes,
									firstContext: e.firstContext
								}), n = n.sibling;
								return q(Y, Y.current & 1 | 2), t.child;
							}
							e = e.sibling;
						}
						o.tail !== null && bt() > el && (t.flags |= 128, r = !0, ac(o, !1), t.lanes = 4194304);
					}
				} else {
					if (!r) {
						if (e = go(c), e !== null) {
							if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), ac(o, !0), o.tail === null && o.tailMode === "hidden" && !c.alternate && !J) return oc(t), null;
						} else 2 * bt() - o.renderingStartTime > el && n !== 1073741824 && (t.flags |= 128, r = !0, ac(o, !1), t.lanes = 4194304);
					}
					o.isBackwards ? (c.sibling = t.child, t.child = c) : (n = o.last, n === null ? t.child = c : n.sibling = c, o.last = c);
				}
				return o.tail === null ? (oc(t), null) : (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = bt(), t.sibling = null, n = Y.current, q(Y, r ? n & 1 | 2 : n & 1), t);
			case 22:
			case 23: return wl(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Wc & 1073741824 && (oc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : oc(t), null;
			case 24: return null;
			case 25: return null;
		}
		throw Error(a(156, t.tag));
	}
	function cc(e, t) {
		switch (va(t), t.tag) {
			case 1: return Ji(t.type) && Yi(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return po(), K(Gi), K(Wi), vo(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 5: return ho(t), null;
			case 13:
				if (K(Y), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(a(340));
					ka();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return K(Y), null;
			case 4: return po(), null;
			case 10: return Ua(t.type._context), null;
			case 22:
			case 23: return wl(), null;
			case 24: return null;
			default: return null;
		}
	}
	var lc = !1, uc = !1, dc = typeof WeakSet == "function" ? WeakSet : Set, Q = null;
	function fc(e, t) {
		var n = e.ref;
		if (n !== null) {
			if (typeof n == "function") try {
				n(null);
			} catch (n) {
				Rl(e, t, n);
			}
			else n.current = null;
		}
	}
	function pc(e, t, n) {
		try {
			n();
		} catch (n) {
			Rl(e, t, n);
		}
	}
	var mc = !1;
	function hc(e, t) {
		if (xi = mn, e = Pr(), Fr(e)) {
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
		for (Si = {
			focusedElem: e,
			selectionRange: n
		}, mn = !1, Q = t; Q !== null;) if (t = Q, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, Q = e;
		else for (; Q !== null;) {
			t = Q;
			try {
				var h = t.alternate;
				if (t.flags & 1024) switch (t.tag) {
					case 0:
					case 11:
					case 15: break;
					case 1:
						if (h !== null) {
							var g = h.memoizedProps, _ = h.memoizedState, v = t.stateNode;
							v.__reactInternalSnapshotBeforeUpdate = v.getSnapshotBeforeUpdate(t.elementType === t.type ? g : hs(t.type, g), _);
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
				Rl(t, t.return, e);
			}
			if (e = t.sibling, e !== null) {
				e.return = t.return, Q = e;
				break;
			}
			Q = t.return;
		}
		return h = mc, mc = !1, h;
	}
	function gc(e, t, n) {
		var r = t.updateQueue;
		if (r = r === null ? null : r.lastEffect, r !== null) {
			var i = r = r.next;
			do {
				if ((i.tag & e) === e) {
					var a = i.destroy;
					i.destroy = void 0, a !== void 0 && pc(t, n, a);
				}
				i = i.next;
			} while (i !== r);
		}
	}
	function _c(e, t) {
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
	function vc(e) {
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
	function yc(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, yc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Ai], delete t[ji], delete t[Ni], delete t[Pi], delete t[Fi])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	function bc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 4;
	}
	function xc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || bc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Sc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = bi));
		else if (r !== 4 && (e = e.child, e !== null)) for (Sc(e, t, n), e = e.sibling; e !== null;) Sc(e, t, n), e = e.sibling;
	}
	function Cc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (e = e.child, e !== null)) for (Cc(e, t, n), e = e.sibling; e !== null;) Cc(e, t, n), e = e.sibling;
	}
	var wc = null, Tc = !1;
	function Ec(e, t, n) {
		for (n = n.child; n !== null;) Dc(e, t, n), n = n.sibling;
	}
	function Dc(e, t, n) {
		if (Ot && typeof Ot.onCommitFiberUnmount == "function") try {
			Ot.onCommitFiberUnmount(Dt, n);
		} catch {}
		switch (n.tag) {
			case 5: uc || fc(n, t);
			case 6:
				var r = wc, i = Tc;
				wc = null, Ec(e, t, n), wc = r, Tc = i, wc !== null && (Tc ? (e = wc, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : wc.removeChild(n.stateNode));
				break;
			case 18:
				wc !== null && (Tc ? (e = wc, n = n.stateNode, e.nodeType === 8 ? U(e.parentNode, n) : e.nodeType === 1 && U(e, n), fn(e)) : U(wc, n.stateNode));
				break;
			case 4:
				r = wc, i = Tc, wc = n.stateNode.containerInfo, Tc = !0, Ec(e, t, n), wc = r, Tc = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				if (!uc && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
					i = r = r.next;
					do {
						var a = i, o = a.destroy;
						a = a.tag, o !== void 0 && (a & 2 || a & 4) && pc(n, t, o), i = i.next;
					} while (i !== r);
				}
				Ec(e, t, n);
				break;
			case 1:
				if (!uc && (fc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
					r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
				} catch (e) {
					Rl(n, t, e);
				}
				Ec(e, t, n);
				break;
			case 21:
				Ec(e, t, n);
				break;
			case 22:
				n.mode & 1 ? (uc = (r = uc) || n.memoizedState !== null, Ec(e, t, n), uc = r) : Ec(e, t, n);
				break;
			default: Ec(e, t, n);
		}
	}
	function Oc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			e.updateQueue = null;
			var n = e.stateNode;
			n === null && (n = e.stateNode = new dc()), t.forEach(function(t) {
				var r = Hl.bind(null, e, t);
				n.has(t) || (n.add(t), t.then(r, r));
			});
		}
	}
	function kc(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			try {
				var o = e, s = t, c = s;
				a: for (; c !== null;) {
					switch (c.tag) {
						case 5:
							wc = c.stateNode, Tc = !1;
							break a;
						case 3:
							wc = c.stateNode.containerInfo, Tc = !0;
							break a;
						case 4:
							wc = c.stateNode.containerInfo, Tc = !0;
							break a;
					}
					c = c.return;
				}
				if (wc === null) throw Error(a(160));
				Dc(o, s, i), wc = null, Tc = !1;
				var l = i.alternate;
				l !== null && (l.return = null), i.return = null;
			} catch (e) {
				Rl(i, t, e);
			}
		}
		if (t.subtreeFlags & 12854) for (t = t.child; t !== null;) Ac(t, e), t = t.sibling;
	}
	function Ac(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (kc(t, e), jc(e), r & 4) {
					try {
						gc(3, e, e.return), _c(3, e);
					} catch (t) {
						Rl(e, e.return, t);
					}
					try {
						gc(5, e, e.return);
					} catch (t) {
						Rl(e, e.return, t);
					}
				}
				break;
			case 1:
				kc(t, e), jc(e), r & 512 && n !== null && fc(n, n.return);
				break;
			case 5:
				if (kc(t, e), jc(e), r & 512 && n !== null && fc(n, n.return), e.flags & 32) {
					var i = e.stateNode;
					try {
						Ne(i, "");
					} catch (t) {
						Rl(e, e.return, t);
					}
				}
				if (r & 4 && (i = e.stateNode, i != null)) {
					var o = e.memoizedProps, s = n === null ? o : n.memoizedProps, c = e.type, l = e.updateQueue;
					if (e.updateQueue = null, l !== null) try {
						c === "input" && o.type === "radio" && o.name != null && Se(i, o), Be(c, s);
						var u = Be(c, o);
						for (s = 0; s < l.length; s += 2) {
							var d = l[s], f = l[s + 1];
							d === "style" ? Le(i, f) : d === "dangerouslySetInnerHTML" ? Me(i, f) : d === "children" ? Ne(i, f) : S(i, d, f, u);
						}
						switch (c) {
							case "input":
								Ce(i, o);
								break;
							case "textarea":
								F(i, o);
								break;
							case "select":
								var p = i._wrapperState.wasMultiple;
								i._wrapperState.wasMultiple = !!o.multiple;
								var m = o.value;
								m == null ? p !== !!o.multiple && (o.defaultValue == null ? N(i, !!o.multiple, o.multiple ? [] : "", !1) : N(i, !!o.multiple, o.defaultValue, !0)) : N(i, !!o.multiple, m, !1);
						}
						i[ji] = o;
					} catch (t) {
						Rl(e, e.return, t);
					}
				}
				break;
			case 6:
				if (kc(t, e), jc(e), r & 4) {
					if (e.stateNode === null) throw Error(a(162));
					i = e.stateNode, o = e.memoizedProps;
					try {
						i.nodeValue = o;
					} catch (t) {
						Rl(e, e.return, t);
					}
				}
				break;
			case 3:
				if (kc(t, e), jc(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					fn(t.containerInfo);
				} catch (t) {
					Rl(e, e.return, t);
				}
				break;
			case 4:
				kc(t, e), jc(e);
				break;
			case 13:
				kc(t, e), jc(e), i = e.child, i.flags & 8192 && (o = i.memoizedState !== null, i.stateNode.isHidden = o, !o || i.alternate !== null && i.alternate.memoizedState !== null || ($c = bt())), r & 4 && Oc(e);
				break;
			case 22:
				if (d = n !== null && n.memoizedState !== null, e.mode & 1 ? (uc = (u = uc) || d, kc(t, e), uc = u) : kc(t, e), jc(e), r & 8192) {
					if (u = e.memoizedState !== null, (e.stateNode.isHidden = u) && !d && e.mode & 1) for (Q = e, d = e.child; d !== null;) {
						for (f = Q = d; Q !== null;) {
							switch (p = Q, m = p.child, p.tag) {
								case 0:
								case 11:
								case 14:
								case 15:
									gc(4, p, p.return);
									break;
								case 1:
									fc(p, p.return);
									var h = p.stateNode;
									if (typeof h.componentWillUnmount == "function") {
										r = p, n = p.return;
										try {
											t = r, h.props = t.memoizedProps, h.state = t.memoizedState, h.componentWillUnmount();
										} catch (e) {
											Rl(r, n, e);
										}
									}
									break;
								case 5:
									fc(p, p.return);
									break;
								case 22: if (p.memoizedState !== null) {
									Fc(f);
									continue;
								}
							}
							m === null ? Fc(f) : (m.return = p, Q = m);
						}
						d = d.sibling;
					}
					a: for (d = null, f = e;;) {
						if (f.tag === 5) {
							if (d === null) {
								d = f;
								try {
									i = f.stateNode, u ? (o = i.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (c = f.stateNode, l = f.memoizedProps.style, s = l != null && l.hasOwnProperty("display") ? l.display : null, c.style.display = Ie("display", s));
								} catch (t) {
									Rl(e, e.return, t);
								}
							}
						} else if (f.tag === 6) {
							if (d === null) try {
								f.stateNode.nodeValue = u ? "" : f.memoizedProps;
							} catch (t) {
								Rl(e, e.return, t);
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
				kc(t, e), jc(e), r & 4 && Oc(e);
				break;
			case 21: break;
			default: kc(t, e), jc(e);
		}
	}
	function jc(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				a: {
					for (var n = e.return; n !== null;) {
						if (bc(n)) {
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
						r.flags & 32 && (Ne(i, ""), r.flags &= -33), Cc(e, xc(e), i);
						break;
					case 3:
					case 4:
						var o = r.stateNode.containerInfo;
						Sc(e, xc(e), o);
						break;
					default: throw Error(a(161));
				}
			} catch (t) {
				Rl(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function Mc(e, t, n) {
		Q = e, Nc(e, t, n);
	}
	function Nc(e, t, n) {
		for (var r = !!(e.mode & 1); Q !== null;) {
			var i = Q, a = i.child;
			if (i.tag === 22 && r) {
				var o = i.memoizedState !== null || lc;
				if (!o) {
					var s = i.alternate, c = s !== null && s.memoizedState !== null || uc;
					s = lc;
					var l = uc;
					if (lc = o, (uc = c) && !l) for (Q = i; Q !== null;) o = Q, c = o.child, o.tag === 22 && o.memoizedState !== null || c === null ? Ic(i) : (c.return = o, Q = c);
					for (; a !== null;) Q = a, Nc(a, t, n), a = a.sibling;
					Q = i, lc = s, uc = l;
				}
				Pc(e, t, n);
			} else i.subtreeFlags & 8772 && a !== null ? (a.return = i, Q = a) : Pc(e, t, n);
		}
	}
	function Pc(e) {
		for (; Q !== null;) {
			var t = Q;
			if (t.flags & 8772) {
				var n = t.alternate;
				try {
					if (t.flags & 8772) switch (t.tag) {
						case 0:
						case 11:
						case 15:
							uc || _c(5, t);
							break;
						case 1:
							var r = t.stateNode;
							if (t.flags & 4 && !uc) {
								if (n === null) r.componentDidMount();
								else {
									var i = t.elementType === t.type ? n.memoizedProps : hs(t.type, n.memoizedProps);
									r.componentDidUpdate(i, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
								}
							}
							var o = t.updateQueue;
							o !== null && ao(t, o, r);
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
								ao(t, s, n);
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
										f !== null && fn(f);
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
					uc || t.flags & 512 && vc(t);
				} catch (e) {
					Rl(t, t.return, e);
				}
			}
			if (t === e) {
				Q = null;
				break;
			}
			if (n = t.sibling, n !== null) {
				n.return = t.return, Q = n;
				break;
			}
			Q = t.return;
		}
	}
	function Fc(e) {
		for (; Q !== null;) {
			var t = Q;
			if (t === e) {
				Q = null;
				break;
			}
			var n = t.sibling;
			if (n !== null) {
				n.return = t.return, Q = n;
				break;
			}
			Q = t.return;
		}
	}
	function Ic(e) {
		for (; Q !== null;) {
			var t = Q;
			try {
				switch (t.tag) {
					case 0:
					case 11:
					case 15:
						var n = t.return;
						try {
							_c(4, t);
						} catch (e) {
							Rl(t, n, e);
						}
						break;
					case 1:
						var r = t.stateNode;
						if (typeof r.componentDidMount == "function") {
							var i = t.return;
							try {
								r.componentDidMount();
							} catch (e) {
								Rl(t, i, e);
							}
						}
						var a = t.return;
						try {
							vc(t);
						} catch (e) {
							Rl(t, a, e);
						}
						break;
					case 5:
						var o = t.return;
						try {
							vc(t);
						} catch (e) {
							Rl(t, o, e);
						}
				}
			} catch (e) {
				Rl(t, t.return, e);
			}
			if (t === e) {
				Q = null;
				break;
			}
			var s = t.sibling;
			if (s !== null) {
				s.return = t.return, Q = s;
				break;
			}
			Q = t.return;
		}
	}
	var Lc = Math.ceil, Rc = C.ReactCurrentDispatcher, zc = C.ReactCurrentOwner, Bc = C.ReactCurrentBatchConfig, $ = 0, Vc = null, Hc = null, Uc = 0, Wc = 0, Gc = Hi(0), Kc = 0, qc = null, Jc = 0, Yc = 0, Xc = 0, Zc = null, Qc = null, $c = 0, el = Infinity, tl = null, nl = !1, rl = null, il = null, al = !1, ol = null, sl = 0, cl = 0, ll = null, ul = -1, dl = 0;
	function fl() {
		return $ & 6 ? bt() : ul === -1 ? ul = bt() : ul;
	}
	function pl(e) {
		return e.mode & 1 ? $ & 2 && Uc !== 0 ? Uc & -Uc : ja.transition === null ? (e = B, e === 0 ? (e = window.event, e = e === void 0 ? 16 : bn(e.type), e) : e) : (dl === 0 && (dl = Rt()), dl) : 1;
	}
	function ml(e, t, n, r) {
		if (50 < cl) throw cl = 0, ll = null, Error(a(185));
		Bt(e, n, r), (!($ & 2) || e !== Vc) && (e === Vc && (!($ & 2) && (Yc |= n), Kc === 4 && bl(e, Uc)), hl(e, r), n === 1 && $ === 0 && !(t.mode & 1) && (el = bt() + 500, ta && aa()));
	}
	function hl(e, t) {
		var n = e.callbackNode;
		It(e, t);
		var r = R(e, e === Vc ? Uc : 0);
		if (r === 0) n !== null && _t(n), e.callbackNode = null, e.callbackPriority = 0;
		else if (t = r & -r, e.callbackPriority !== t) {
			if (n != null && _t(n), t === 1) e.tag === 0 ? ia(xl.bind(null, e)) : ra(xl.bind(null, e)), Di(function() {
				!($ & 6) && aa();
			}), n = null;
			else {
				switch (Ht(r)) {
					case 1:
						n = St;
						break;
					case 4:
						n = Ct;
						break;
					case 16:
						n = wt;
						break;
					case 536870912:
						n = Et;
						break;
					default: n = wt;
				}
				n = Wl(n, gl.bind(null, e));
			}
			e.callbackPriority = t, e.callbackNode = n;
		}
	}
	function gl(e, t) {
		if (ul = -1, dl = 0, $ & 6) throw Error(a(327));
		var n = e.callbackNode;
		if (Il() && e.callbackNode !== n) return null;
		var r = R(e, e === Vc ? Uc : 0);
		if (r === 0) return null;
		if (r & 30 || (r & e.expiredLanes) !== 0 || t) t = kl(e, r);
		else {
			t = r;
			var i = $;
			$ |= 2;
			var o = Dl();
			(Vc !== e || Uc !== t) && (tl = null, el = bt() + 500, Tl(e, t));
			do
				try {
					jl();
					break;
				} catch (t) {
					El(e, t);
				}
			while (1);
			Ha(), Rc.current = o, $ = i, Hc === null ? (Vc = null, Uc = 0, t = Kc) : t = 0;
		}
		if (t !== 0) {
			if (t === 2 && (i = Lt(e), i !== 0 && (r = i, t = _l(e, i))), t === 1) throw n = qc, Tl(e, 0), bl(e, r), hl(e, bt()), n;
			if (t === 6) bl(e, r);
			else {
				if (i = e.current.alternate, !(r & 30) && !yl(i) && (t = kl(e, r), t === 2 && (o = Lt(e), o !== 0 && (r = o, t = _l(e, o))), t === 1)) throw n = qc, Tl(e, 0), bl(e, r), hl(e, bt()), n;
				switch (e.finishedWork = i, e.finishedLanes = r, t) {
					case 0:
					case 1: throw Error(a(345));
					case 2:
						Pl(e, Qc, tl);
						break;
					case 3:
						if (bl(e, r), (r & 130023424) === r && (t = $c + 500 - bt(), 10 < t)) {
							if (R(e, 0) !== 0) break;
							if (i = e.suspendedLanes, (i & r) !== r) {
								fl(), e.pingedLanes |= e.suspendedLanes & i;
								break;
							}
							e.timeoutHandle = wi(Pl.bind(null, e, Qc, tl), t);
							break;
						}
						Pl(e, Qc, tl);
						break;
					case 4:
						if (bl(e, r), (r & 4194240) === r) break;
						for (t = e.eventTimes, i = -1; 0 < r;) {
							var s = 31 - At(r);
							o = 1 << s, s = t[s], s > i && (i = s), r &= ~o;
						}
						if (r = i, r = bt() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Lc(r / 1960)) - r, 10 < r) {
							e.timeoutHandle = wi(Pl.bind(null, e, Qc, tl), r);
							break;
						}
						Pl(e, Qc, tl);
						break;
					case 5:
						Pl(e, Qc, tl);
						break;
					default: throw Error(a(329));
				}
			}
		}
		return hl(e, bt()), e.callbackNode === n ? gl.bind(null, e) : null;
	}
	function _l(e, t) {
		var n = Zc;
		return e.current.memoizedState.isDehydrated && (Tl(e, t).flags |= 256), e = kl(e, t), e !== 2 && (t = Qc, Qc = n, t !== null && vl(t)), e;
	}
	function vl(e) {
		Qc === null ? Qc = e : Qc.push.apply(Qc, e);
	}
	function yl(e) {
		for (var t = e;;) {
			if (t.flags & 16384) {
				var n = t.updateQueue;
				if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
					var i = n[r], a = i.getSnapshot;
					i = i.value;
					try {
						if (!kr(a(), i)) return !1;
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
	function bl(e, t) {
		for (t &= ~Xc, t &= ~Yc, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t;) {
			var n = 31 - At(t), r = 1 << n;
			e[n] = -1, t &= ~r;
		}
	}
	function xl(e) {
		if ($ & 6) throw Error(a(327));
		Il();
		var t = R(e, 0);
		if (!(t & 1)) return hl(e, bt()), null;
		var n = kl(e, t);
		if (e.tag !== 0 && n === 2) {
			var r = Lt(e);
			r !== 0 && (t = r, n = _l(e, r));
		}
		if (n === 1) throw n = qc, Tl(e, 0), bl(e, t), hl(e, bt()), n;
		if (n === 6) throw Error(a(345));
		return e.finishedWork = e.current.alternate, e.finishedLanes = t, Pl(e, Qc, tl), hl(e, bt()), null;
	}
	function Sl(e, t) {
		var n = $;
		$ |= 1;
		try {
			return e(t);
		} finally {
			$ = n, $ === 0 && (el = bt() + 500, ta && aa());
		}
	}
	function Cl(e) {
		ol !== null && ol.tag === 0 && !($ & 6) && Il();
		var t = $;
		$ |= 1;
		var n = Bc.transition, r = B;
		try {
			if (Bc.transition = null, B = 1, e) return e();
		} finally {
			B = r, Bc.transition = n, $ = t, !($ & 6) && aa();
		}
	}
	function wl() {
		Wc = Gc.current, K(Gc);
	}
	function Tl(e, t) {
		e.finishedWork = null, e.finishedLanes = 0;
		var n = e.timeoutHandle;
		if (n !== -1 && (e.timeoutHandle = -1, Ti(n)), Hc !== null) for (n = Hc.return; n !== null;) {
			var r = n;
			switch (va(r), r.tag) {
				case 1:
					r = r.type.childContextTypes, r != null && Yi();
					break;
				case 3:
					po(), K(Gi), K(Wi), vo();
					break;
				case 5:
					ho(r);
					break;
				case 4:
					po();
					break;
				case 13:
					K(Y);
					break;
				case 19:
					K(Y);
					break;
				case 10:
					Ua(r.type._context);
					break;
				case 22:
				case 23: wl();
			}
			n = n.return;
		}
		if (Vc = e, Hc = e = Yl(e.current, null), Uc = Wc = t, Kc = 0, qc = null, Xc = Yc = Jc = 0, Qc = Zc = null, qa !== null) {
			for (t = 0; t < qa.length; t++) if (n = qa[t], r = n.interleaved, r !== null) {
				n.interleaved = null;
				var i = r.next, a = n.pending;
				if (a !== null) {
					var o = a.next;
					a.next = i, r.next = o;
				}
				n.pending = r;
			}
			qa = null;
		}
		return e;
	}
	function El(e, t) {
		do {
			var n = Hc;
			try {
				if (Ha(), yo.current = ds, Co) {
					for (var r = X.memoizedState; r !== null;) {
						var i = r.queue;
						i !== null && (i.pending = null), r = r.next;
					}
					Co = !1;
				}
				if (xo = 0, So = Z = X = null, wo = !1, To = 0, zc.current = null, n === null || n.return === null) {
					Kc = 1, qc = t, Hc = null;
					break;
				}
				a: {
					var o = e, s = n.return, c = n, l = t;
					if (t = Uc, c.flags |= 32768, typeof l == "object" && l && typeof l.then == "function") {
						var u = l, d = c, f = d.tag;
						if (!(d.mode & 1) && (f === 0 || f === 11 || f === 15)) {
							var p = d.alternate;
							p ? (d.updateQueue = p.updateQueue, d.memoizedState = p.memoizedState, d.lanes = p.lanes) : (d.updateQueue = null, d.memoizedState = null);
						}
						var m = ks(s);
						if (m !== null) {
							m.flags &= -257, As(m, s, c, o, t), m.mode & 1 && Os(o, u, t), t = m, l = u;
							var h = t.updateQueue;
							if (h === null) {
								var g = /* @__PURE__ */ new Set();
								g.add(l), t.updateQueue = g;
							} else h.add(l);
							break a;
						}
						if (!(t & 1)) {
							Os(o, u, t), Ol();
							break a;
						}
						l = Error(a(426));
					} else if (J && c.mode & 1) {
						var _ = ks(s);
						if (_ !== null) {
							!(_.flags & 65536) && (_.flags |= 256), As(_, s, c, o, t), Aa(Ss(l, c));
							break a;
						}
					}
					o = l = Ss(l, c), Kc !== 4 && (Kc = 2), Zc === null ? Zc = [o] : Zc.push(o), o = s;
					do {
						switch (o.tag) {
							case 3:
								o.flags |= 65536, t &= -t, o.lanes |= t;
								var v = Es(o, l, t);
								ro(o, v);
								break a;
							case 1:
								c = l;
								var y = o.type, b = o.stateNode;
								if (!(o.flags & 128) && (typeof y.getDerivedStateFromError == "function" || b !== null && typeof b.componentDidCatch == "function" && (il === null || !il.has(b)))) {
									o.flags |= 65536, t &= -t, o.lanes |= t;
									var x = Ds(o, c, t);
									ro(o, x);
									break a;
								}
						}
						o = o.return;
					} while (o !== null);
				}
				Nl(n);
			} catch (e) {
				t = e, Hc === n && n !== null && (Hc = n = n.return);
				continue;
			}
			break;
		} while (1);
	}
	function Dl() {
		var e = Rc.current;
		return Rc.current = ds, e === null ? ds : e;
	}
	function Ol() {
		(Kc === 0 || Kc === 3 || Kc === 2) && (Kc = 4), Vc === null || !(Jc & 268435455) && !(Yc & 268435455) || bl(Vc, Uc);
	}
	function kl(e, t) {
		var n = $;
		$ |= 2;
		var r = Dl();
		(Vc !== e || Uc !== t) && (tl = null, Tl(e, t));
		do
			try {
				Al();
				break;
			} catch (t) {
				El(e, t);
			}
		while (1);
		if (Ha(), $ = n, Rc.current = r, Hc !== null) throw Error(a(261));
		return Vc = null, Uc = 0, Kc;
	}
	function Al() {
		for (; Hc !== null;) Ml(Hc);
	}
	function jl() {
		for (; Hc !== null && !vt();) Ml(Hc);
	}
	function Ml(e) {
		var t = Ul(e.alternate, e, Wc);
		e.memoizedProps = e.pendingProps, t === null ? Nl(e) : Hc = t, zc.current = null;
	}
	function Nl(e) {
		var t = e;
		do {
			var n = t.alternate;
			if (e = t.return, t.flags & 32768) {
				if (n = cc(n, t), n !== null) {
					n.flags &= 32767, Hc = n;
					return;
				}
				if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
				else {
					Kc = 6, Hc = null;
					return;
				}
			} else if (n = sc(n, t, Wc), n !== null) {
				Hc = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				Hc = t;
				return;
			}
			Hc = t = e;
		} while (t !== null);
		Kc === 0 && (Kc = 5);
	}
	function Pl(e, t, n) {
		var r = B, i = Bc.transition;
		try {
			Bc.transition = null, B = 1, Fl(e, t, n, r);
		} finally {
			Bc.transition = i, B = r;
		}
		return null;
	}
	function Fl(e, t, n, r) {
		do
			Il();
		while (ol !== null);
		if ($ & 6) throw Error(a(327));
		n = e.finishedWork;
		var i = e.finishedLanes;
		if (n === null) return null;
		if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(a(177));
		e.callbackNode = null, e.callbackPriority = 0;
		var o = n.lanes | n.childLanes;
		if (Vt(e, o), e === Vc && (Hc = Vc = null, Uc = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || al || (al = !0, Wl(wt, function() {
			return Il(), null;
		})), o = !!(n.flags & 15990), n.subtreeFlags & 15990 || o) {
			o = Bc.transition, Bc.transition = null;
			var s = B;
			B = 1;
			var c = $;
			$ |= 4, zc.current = null, hc(e, n), Ac(n, e), Ir(Si), mn = !!xi, Si = xi = null, e.current = n, Mc(n, e, i), yt(), $ = c, B = s, Bc.transition = o;
		} else e.current = n;
		if (al && (al = !1, ol = e, sl = i), o = e.pendingLanes, o === 0 && (il = null), kt(n.stateNode, r), hl(e, bt()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) i = t[n], r(i.value, {
			componentStack: i.stack,
			digest: i.digest
		});
		if (nl) throw nl = !1, e = rl, rl = null, e;
		return sl & 1 && e.tag !== 0 && Il(), o = e.pendingLanes, o & 1 ? e === ll ? cl++ : (cl = 0, ll = e) : cl = 0, aa(), null;
	}
	function Il() {
		if (ol !== null) {
			var e = Ht(sl), t = Bc.transition, n = B;
			try {
				if (Bc.transition = null, B = 16 > e ? 16 : e, ol === null) var r = !1;
				else {
					if (e = ol, ol = null, sl = 0, $ & 6) throw Error(a(331));
					var i = $;
					for ($ |= 4, Q = e.current; Q !== null;) {
						var o = Q, s = o.child;
						if (Q.flags & 16) {
							var c = o.deletions;
							if (c !== null) {
								for (var l = 0; l < c.length; l++) {
									var u = c[l];
									for (Q = u; Q !== null;) {
										var d = Q;
										switch (d.tag) {
											case 0:
											case 11:
											case 15: gc(8, d, o);
										}
										var f = d.child;
										if (f !== null) f.return = d, Q = f;
										else for (; Q !== null;) {
											d = Q;
											var p = d.sibling, m = d.return;
											if (yc(d), d === u) {
												Q = null;
												break;
											}
											if (p !== null) {
												p.return = m, Q = p;
												break;
											}
											Q = m;
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
								Q = o;
							}
						}
						if (o.subtreeFlags & 2064 && s !== null) s.return = o, Q = s;
						else b: for (; Q !== null;) {
							if (o = Q, o.flags & 2048) switch (o.tag) {
								case 0:
								case 11:
								case 15: gc(9, o, o.return);
							}
							var v = o.sibling;
							if (v !== null) {
								v.return = o.return, Q = v;
								break b;
							}
							Q = o.return;
						}
					}
					var y = e.current;
					for (Q = y; Q !== null;) {
						s = Q;
						var b = s.child;
						if (s.subtreeFlags & 2064 && b !== null) b.return = s, Q = b;
						else b: for (s = y; Q !== null;) {
							if (c = Q, c.flags & 2048) try {
								switch (c.tag) {
									case 0:
									case 11:
									case 15: _c(9, c);
								}
							} catch (e) {
								Rl(c, c.return, e);
							}
							if (c === s) {
								Q = null;
								break b;
							}
							var x = c.sibling;
							if (x !== null) {
								x.return = c.return, Q = x;
								break b;
							}
							Q = c.return;
						}
					}
					if ($ = i, aa(), Ot && typeof Ot.onPostCommitFiberRoot == "function") try {
						Ot.onPostCommitFiberRoot(Dt, e);
					} catch {}
					r = !0;
				}
				return r;
			} finally {
				B = n, Bc.transition = t;
			}
		}
		return !1;
	}
	function Ll(e, t, n) {
		t = Ss(n, t), t = Es(e, t, 1), e = to(e, t, 1), t = fl(), e !== null && (Bt(e, 1, t), hl(e, t));
	}
	function Rl(e, t, n) {
		if (e.tag === 3) Ll(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Ll(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (il === null || !il.has(r))) {
					e = Ss(n, e), e = Ds(t, e, 1), t = to(t, e, 1), e = fl(), t !== null && (Bt(t, 1, e), hl(t, e));
					break;
				}
			}
			t = t.return;
		}
	}
	function zl(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), t = fl(), e.pingedLanes |= e.suspendedLanes & n, Vc === e && (Uc & n) === n && (Kc === 4 || Kc === 3 && (Uc & 130023424) === Uc && 500 > bt() - $c ? Tl(e, 0) : Xc |= n), hl(e, t);
	}
	function Bl(e, t) {
		t === 0 && (e.mode & 1 ? (t = L, L <<= 1, !(L & 130023424) && (L = 4194304)) : t = 1);
		var n = fl();
		e = Xa(e, t), e !== null && (Bt(e, t, n), hl(e, n));
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
			if (e.memoizedProps !== t.pendingProps || Gi.current) Ms = !0;
			else {
				if ((e.lanes & n) === 0 && !(t.flags & 128)) return Ms = !1, tc(e, t, n);
				Ms = !!(e.flags & 131072);
			}
		} else Ms = !1, J && t.flags & 1048576 && ga(t, la, t.index);
		switch (t.lanes = 0, t.tag) {
			case 2:
				var r = t.type;
				$s(e, t), e = t.pendingProps;
				var i = qi(t, Wi.current);
				Ga(t, n), i = ko(null, t, r, e, i, n);
				var o = Ao();
				return t.flags |= 1, typeof i == "object" && i && typeof i.render == "function" && i.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Ji(r) ? (o = !0, Qi(t)) : o = !1, t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, Qa(t), i.updater = _s, t.stateNode = i, i._reactInternals = t, xs(t, r, e, n), t = Vs(null, t, r, !0, o, n)) : (t.tag = 0, J && o && _a(t), Ns(null, t, i, n), t = t.child), t;
			case 16:
				r = t.elementType;
				a: {
					switch ($s(e, t), e = t.pendingProps, i = r._init, r = i(r._payload), t.type = r, i = t.tag = Jl(r), e = hs(r, e), i) {
						case 0:
							t = zs(null, t, r, e, n);
							break a;
						case 1:
							t = Bs(null, t, r, e, n);
							break a;
						case 11:
							t = Ps(null, t, r, e, n);
							break a;
						case 14:
							t = Fs(null, t, r, hs(r.type, e), n);
							break a;
					}
					throw Error(a(306, r, ""));
				}
				return t;
			case 0: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : hs(r, i), zs(e, t, r, i, n);
			case 1: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : hs(r, i), Bs(e, t, r, i, n);
			case 3:
				a: {
					if (Hs(t), e === null) throw Error(a(387));
					r = t.pendingProps, o = t.memoizedState, i = o.element, $a(e, t), io(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache,
							pendingSuspenseBoundaries: s.pendingSuspenseBoundaries,
							transitions: s.transitions
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							i = Ss(Error(a(423)), t), t = Us(e, t, r, n, i);
							break a;
						}
						if (r !== i) {
							i = Ss(Error(a(424)), t), t = Us(e, t, r, n, i);
							break a;
						}
						for (ba = W(t.stateNode.containerInfo.firstChild), ya = t, J = !0, xa = null, n = La(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					} else {
						if (ka(), r === i) {
							t = ec(e, t, n);
							break a;
						}
						Ns(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 5: return mo(t), e === null && Ta(t), r = t.type, i = t.pendingProps, o = e === null ? null : e.memoizedProps, s = i.children, Ci(r, i) ? s = null : o !== null && Ci(r, o) && (t.flags |= 32), Rs(e, t), Ns(e, t, s, n), t.child;
			case 6: return e === null && Ta(t), null;
			case 13: return Ks(e, t, n);
			case 4: return fo(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Ia(t, null, r, n) : Ns(e, t, r, n), t.child;
			case 11: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : hs(r, i), Ps(e, t, r, i, n);
			case 7: return Ns(e, t, t.pendingProps, n), t.child;
			case 8: return Ns(e, t, t.pendingProps.children, n), t.child;
			case 12: return Ns(e, t, t.pendingProps.children, n), t.child;
			case 10:
				a: {
					if (r = t.type._context, i = t.pendingProps, o = t.memoizedProps, s = i.value, q(Ra, r._currentValue), r._currentValue = s, o !== null) {
						if (kr(o.value, s)) {
							if (o.children === i.children && !Gi.current) {
								t = ec(e, t, n);
								break a;
							}
						} else for (o = t.child, o !== null && (o.return = t); o !== null;) {
							var c = o.dependencies;
							if (c !== null) {
								s = o.child;
								for (var l = c.firstContext; l !== null;) {
									if (l.context === r) {
										if (o.tag === 1) {
											l = eo(-1, n & -n), l.tag = 2;
											var u = o.updateQueue;
											if (u !== null) {
												u = u.shared;
												var d = u.pending;
												d === null ? l.next = l : (l.next = d.next, d.next = l), u.pending = l;
											}
										}
										o.lanes |= n, l = o.alternate, l !== null && (l.lanes |= n), Wa(o.return, n, t), c.lanes |= n;
										break;
									}
									l = l.next;
								}
							} else if (o.tag === 10) s = o.type === t.type ? null : o.child;
							else if (o.tag === 18) {
								if (s = o.return, s === null) throw Error(a(341));
								s.lanes |= n, c = s.alternate, c !== null && (c.lanes |= n), Wa(s, n, t), s = o.sibling;
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
					Ns(e, t, i.children, n), t = t.child;
				}
				return t;
			case 9: return i = t.type, r = t.pendingProps.children, Ga(t, n), i = Ka(i), r = r(i), t.flags |= 1, Ns(e, t, r, n), t.child;
			case 14: return r = t.type, i = hs(r, t.pendingProps), i = hs(r.type, i), Fs(e, t, r, i, n);
			case 15: return Is(e, t, t.type, t.pendingProps, n);
			case 17: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : hs(r, i), $s(e, t), t.tag = 1, Ji(r) ? (e = !0, Qi(t)) : e = !1, Ga(t, n), ys(t, r, i), xs(t, r, i, n), Vs(null, t, r, !0, e, n);
			case 19: return Qs(e, t, n);
			case 22: return Ls(e, t, n);
		}
		throw Error(a(156, t.tag));
	};
	function Wl(e, t) {
		return gt(e, t);
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
			if (e = e.$$typeof, e === O) return 11;
			if (e === A) return 14;
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
			case te: return Zl(n.children, i, o, t);
			case ne:
				s = 8, i |= 8;
				break;
			case T: return e = Kl(12, n, t, i | 2), e.elementType = T, e.lanes = o, e;
			case k: return e = Kl(13, n, t, i), e.elementType = k, e.lanes = o, e;
			case re: return e = Kl(19, n, t, i), e.elementType = re, e.lanes = o, e;
			case j: return Ql(n, i, o, t);
			default:
				if (typeof e == "object" && e) switch (e.$$typeof) {
					case E:
						s = 10;
						break a;
					case D:
						s = 9;
						break a;
					case O:
						s = 11;
						break a;
					case A:
						s = 14;
						break a;
					case ie:
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
		return e = Kl(22, e, r, t), e.elementType = j, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
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
		this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = zt(0), this.expirationTimes = zt(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = zt(0), this.identifierPrefix = r, this.onRecoverableError = i, this.mutableSourceEagerHydrationData = null;
	}
	function nu(e, t, n, r, i, a, o, s, c) {
		return e = new tu(e, t, n, s, c), t === 1 ? (t = 1, !0 === a && (t |= 8)) : t = 0, a = Kl(3, null, null, t), e.current = a, a.stateNode = e, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: null,
			transitions: null,
			pendingSuspenseBoundaries: null
		}, Qa(a), e;
	}
	function ru(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: w,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	function iu(e) {
		if (!e) return Ui;
		e = e._reactInternals;
		a: {
			if (ut(e) !== e || e.tag !== 1) throw Error(a(170));
			var t = e;
			do {
				switch (t.tag) {
					case 3:
						t = t.stateNode.context;
						break a;
					case 1: if (Ji(t.type)) {
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
			if (Ji(n)) return Zi(e, n, t);
		}
		return t;
	}
	function au(e, t, n, r, i, a, o, s, c) {
		return e = nu(n, r, !0, e, i, a, o, s, c), e.context = iu(null), n = e.current, r = fl(), i = pl(n), a = eo(r, i), a.callback = t ?? null, to(n, a, i), e.current.lanes = i, Bt(e, i, r), hl(e, r), e;
	}
	function ou(e, t, n, r) {
		var i = t.current, a = fl(), o = pl(i);
		return n = iu(n), t.context === null ? t.context = n : t.pendingContext = n, t = eo(a, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = to(i, t, o), e !== null && (ml(e, i, o, a), no(e, i, o)), o;
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
			Cl(function() {
				ou(null, e, null, null);
			}), t[Mi] = null;
		}
	};
	function pu(e) {
		this._internalRoot = e;
	}
	pu.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Kt();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < tn.length && t !== 0 && t < tn[n].priority; n++);
			tn.splice(n, 0, e), n === 0 && sn(e);
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
			return e._reactRootContainer = o, e[Mi] = o.current, li(e.nodeType === 8 ? e.parentNode : e), Cl(), o;
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
		return e._reactRootContainer = c, e[Mi] = c.current, li(e.nodeType === 8 ? e.parentNode : e), Cl(function() {
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
	Ut = function(e) {
		switch (e.tag) {
			case 3:
				var t = e.stateNode;
				if (t.current.memoizedState.isDehydrated) {
					var n = Pt(t.pendingLanes);
					n !== 0 && (z(t, n | 1), hl(t, bt()), !($ & 6) && (el = bt() + 500, aa()));
				}
				break;
			case 13: Cl(function() {
				var t = Xa(e, 1);
				t !== null && ml(t, e, 1, fl());
			}), lu(e, 1);
		}
	}, Wt = function(e) {
		if (e.tag === 13) {
			var t = Xa(e, 134217728);
			t !== null && ml(t, e, 134217728, fl()), lu(e, 134217728);
		}
	}, Gt = function(e) {
		if (e.tag === 13) {
			var t = pl(e), n = Xa(e, t);
			n !== null && ml(n, e, t, fl()), lu(e, t);
		}
	}, Kt = function() {
		return B;
	}, qt = function(e, t) {
		var n = B;
		try {
			return B = e, t();
		} finally {
			B = n;
		}
	}, Ue = function(e, t, n) {
		switch (t) {
			case "input":
				if (Ce(e, n), t = n.name, n.type === "radio" && t != null) {
					for (n = e; n.parentNode;) n = n.parentNode;
					for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + "][type=\"radio\"]"), t = 0; t < n.length; t++) {
						var r = n[t];
						if (r !== e && r.form === e.form) {
							var i = zi(r);
							if (!i) throw Error(a(90));
							ve(r), Ce(r, i);
						}
					}
				}
				break;
			case "textarea":
				F(e, n);
				break;
			case "select": t = n.value, t != null && N(e, !!n.multiple, t, !1);
		}
	}, Ye = Sl, Xe = Cl;
	var yu = {
		usingClientEntryPoint: !1,
		Events: [
			Li,
			Ri,
			zi,
			qe,
			Je,
			Sl
		]
	}, bu = {
		findFiberByHostInstance: Ii,
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
			return e = mt(e), e === null ? null : e.stateNode;
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
			Dt = Su.inject(xu), Ot = Su;
		} catch {}
	}
	e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = yu, e.createPortal = function(e, t) {
		var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!mu(t)) throw Error(a(200));
		return ru(e, t, null, n);
	}, e.createRoot = function(e, t) {
		if (!mu(e)) throw Error(a(299));
		var n = !1, r = "", i = du;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = nu(e, 1, !1, null, null, n, !1, r, i), e[Mi] = t.current, li(e.nodeType === 8 ? e.parentNode : e), new fu(t);
	}, e.findDOMNode = function(e) {
		if (e == null) return null;
		if (e.nodeType === 1) return e;
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(a(188)) : (e = Object.keys(e).join(","), Error(a(268, e)));
		return e = mt(t), e = e === null ? null : e.stateNode, e;
	}, e.flushSync = function(e) {
		return Cl(e);
	}, e.hydrate = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !0, n);
	}, e.hydrateRoot = function(e, t, n) {
		if (!mu(e)) throw Error(a(405));
		var r = n != null && n.hydratedSources || null, i = !1, o = "", s = du;
		if (n != null && (!0 === n.unstable_strictMode && (i = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onRecoverableError !== void 0 && (s = n.onRecoverableError)), t = au(t, null, e, 1, n ?? null, i, !1, o, s), e[Mi] = t.current, li(e), r) for (e = 0; e < r.length; e++) n = r[e], i = n._getVersion, i = i(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, i] : t.mutableSourceEagerHydrationData.push(n, i);
		return new pu(t);
	}, e.render = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !1, n);
	}, e.unmountComponentAtNode = function(e) {
		if (!hu(e)) throw Error(a(40));
		return e._reactRootContainer ? (Cl(function() {
			vu(null, null, e, !1, function() {
				e._reactRootContainer = null, e[Mi] = null;
			});
		}), !0) : !1;
	}, e.unstable_batchedUpdates = Sl, e.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
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
})), s = /* @__PURE__ */ e(((e) => {
	var t = o();
	e.createRoot = t.createRoot, e.hydrateRoot = t.hydrateRoot;
})), c = n(), l = s();
function u(e, t) {
	let n = e.saved;
	if (n) {
		let e = n.view.snapshot.revision;
		return t ? n.selection === "latest" ? `Saved · revision ${e} · latest` : n.selection === "receipt" ? `Saved · revision ${e} · latest unconfirmed` : `Historical revision ${e} (read-only)` : `Previous saved revision ${e} (inactive)`;
	}
	return t && e.accepted ? "Draft — not saved" : null;
}
function d(e, t) {
	let n = e.accepted;
	if (!t || n?.mode !== "dated") return null;
	let r = n.result.fingerprint.value, i = n.input.years, a = e.saved?.view.snapshot;
	return a ? {
		key: `saved:${a.case_id}:${a.revision}:${r}`,
		fingerprint: r,
		years: i,
		source: {
			kind: "saved",
			caseId: a.case_id,
			revision: a.revision
		}
	} : {
		key: `stateless:${r}`,
		fingerprint: r,
		years: i,
		source: {
			kind: "stateless",
			input: n.input
		}
	};
}
function f(e, t) {
	let n = e.status === "ready", r = e.accepted, i = r?.input, a = n && r?.mode === "dated" ? r.result : null, o = n && r ? r.mode === "dated" ? r.result.decision : r.result : null, s = e.saved?.view.snapshot.normalized_input.borrower_name, c = e.status === "evaluating", l = r ? r.mode === "dated" ? r.result.decision : r.result : null;
	return {
		ready: n,
		accepted: r,
		input: i,
		assessment: a,
		decision: o,
		title: n ? i?.borrower_name ?? (typeof s == "string" ? s : "Saved case") : "Assessment workspace",
		subtitle: n ? e.saved ? "Saved dated assessment" : r?.mode === "dated" ? "Dated assessment" : "Legacy · undated input" : c ? e.action === "open" ? "Opening stored revision" : e.action === "write" ? "Waiting for accepted stored receipt" : "Evaluating selected draft" : "Selected input unavailable",
		modeLabel: n && r ? r.mode === "dated" ? "Dated assessment" : "Legacy · undated input" : null,
		statusChip: u(e, n),
		decisionWord: o ? o.outcome.toUpperCase() : c ? e.action === "open" ? "LOADING" : e.action === "write" ? "SAVING" : "CALCULATING" : "UNAVAILABLE",
		decisionNote: o ? `${o.policy_version} · illustrative score ${o.score}` : "A current accepted calculation is required",
		pendingTitle: c ? e.action === "open" ? "Loading original stored assessment" : e.action === "write" ? "Waiting for saved write confirmation" : "Evaluating draft" : "No current result",
		previousAccepted: r && !e.saved && (e.action === "evaluate" || !t) ? r : null,
		previous: !n && e.draft?.edit && l ? l.outcome : null,
		analysisSubject: d(e, n)
	};
}
//#endregion
//#region src/useEditController.ts
function p(e, t) {
	let [n, r] = (0, c.useState)(null), [i, a] = (0, c.useState)();
	function o() {
		r(null), a(void 0);
	}
	return {
		editing: n,
		proposal: i,
		open(t, n) {
			e.current = n, r(t);
		},
		review(t, n, i) {
			e.current = i, r(t), a(n);
		},
		dismiss() {
			r(null);
		},
		cancel: o,
		submit(e) {
			n && (t(e, n), o());
		}
	};
}
//#endregion
//#region src/decimal.ts
var m = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/, h = 10n;
function g(e) {
	if (e.length > 256) throw Error("Decimal exceeds the supported range.");
	let t = m.exec(e);
	if (!t) throw Error("Enter a finite decimal value.");
	let n = Number(t[5] ?? "0");
	if (!Number.isSafeInteger(n) || Math.abs(n) > 128) throw Error("Decimal exponent exceeds the supported range.");
	let r = t[3] ?? t[4] ?? "";
	return {
		coefficient: BigInt(`${t[1] === "-" ? "-" : ""}${t[2] ?? "0"}${r}`),
		scale: r.length - n
	};
}
function _({ coefficient: e, scale: t }) {
	if (e === 0n) return "0";
	let n = e < 0n ? "-" : "", r = (e < 0n ? -e : e).toString();
	return t <= 0 ? n + r + "0".repeat(-t) : (r = r.padStart(t + 1, "0"), (n + r.slice(0, -t) + "." + r.slice(-t)).replace(/0+$/, "").replace(/\.$/, ""));
}
function v(e) {
	return _(g(e));
}
function y(e) {
	if (typeof e != "string") return !1;
	try {
		return g(e), !0;
	} catch {
		return !1;
	}
}
function b(e) {
	if (typeof e == "number" && Number.isFinite(e)) return v(String(e));
	if (typeof e == "string") return v(e);
	throw Error("Financial values must be finite decimals.");
}
function x(e, t) {
	if (!Number.isSafeInteger(t) || Math.abs(t) > 30) throw Error("Unsupported decimal shift.");
	let n = g(e);
	return _({
		...n,
		scale: n.scale - t
	});
}
function S(e, t) {
	let n = g(e), r = g(t), i = Math.max(n.scale, r.scale), a = n.coefficient * h ** BigInt(i - n.scale), o = r.coefficient * h ** BigInt(i - r.scale);
	return a < o ? -1 : +(a > o);
}
function C(e, t) {
	try {
		return S(b(e), b(t)) === 0;
	} catch {
		return !1;
	}
}
function ee(e) {
	let t = v(e), n = g(e);
	if ((n.coefficient < 0n ? -n.coefficient : n.coefficient).toString().length > 34 || S(t.startsWith("-") ? t.slice(1) : t, "1e30") > 0 || n.coefficient !== 0n && S(t.startsWith("-") ? t.slice(1) : t, "1e-30") < 0) throw Error("Financial input exceeds 34 digits or the supported range [1e-30, 1e30].");
	return t;
}
function w(e, t = 2, n = !0) {
	if (!Number.isInteger(t) || t < 0 || t > 30) throw Error("Unsupported display precision.");
	let r = g(e), i = r.coefficient < 0n, a = i ? -r.coefficient : r.coefficient;
	if (r.scale > t) {
		let e = h ** BigInt(r.scale - t), n = a % e;
		a /= e, (n * 2n > e || n * 2n === e && a % 2n == 1n) && a++;
	} else a *= h ** BigInt(t - r.scale);
	let o = a.toString().padStart(t + 1, "0"), s = t ? o.slice(0, -t) : o;
	return n && (s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",")), `${i && a !== 0n ? "-" : ""}${s}${t ? "." + o.slice(-t) : ""}`;
}
var te = {
	units: 0,
	thousands: 3,
	millions: 6
};
function ne(e, t) {
	return x(e, -te[t]);
}
function T(e) {
	let [t, n] = v(e).split("."), r = t.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return n === void 0 ? r : `${r}.${n}`;
}
function E(e, t = {}) {
	let n = w(ne(e, t.scale ?? "units"), t.places ?? 0, t.group ?? !0), r = n.startsWith("-"), i = (t.currency ? "$" : "") + (r ? n.slice(1) : n);
	return r ? (t.negative ?? "parentheses") === "parentheses" ? `(${i})` : `-${i}` : i;
}
function D(e, t = 1, n = {}) {
	let r = w(x(e, 2), t, !0);
	return r.startsWith("-") ? (n.negative ?? "minus") === "parentheses" ? `(${r.slice(1)}%)` : `${r}%` : `${n.signed && !/^0(?:\.0+)?$/.test(r) ? "+" : ""}${r}%`;
}
function O(e, t, n, r) {
	let i = S(e, t);
	for (let a = n; a < r; a++) if (S(w(e, a, !1), t) === i) return a;
	return r;
}
function k(e, t = {}) {
	let n = t.places ?? 2;
	return `${w(e, t.threshold === void 0 ? n : O(e, t.threshold, n, Math.max(n, t.maxPlaces ?? 4)), !0)}x`;
}
function re(e, t, n) {
	if (!Number.isSafeInteger(n) || n < 1 || n > 1e4) throw Error("Unsupported drawing units.");
	let r = g(e), i = g(t), a = Math.max(r.scale, i.scale), o = (e) => e < 0n ? -e : e, s = o(r.coefficient) * h ** BigInt(a - r.scale) * BigInt(n), c = o(i.coefficient) * h ** BigInt(a - i.scale);
	if (c === 0n) return 0n;
	let l = s / c, u = s % c;
	return (u * 2n > c || u * 2n === c && l % 2n == 1n) && l++, l > BigInt(n) && (l = BigInt(n)), r.coefficient < 0n ? -l : l;
}
var A = {
	empty: "Enter an amount.",
	invalid: "Enter a finite number such as 1,250,000, (1,250,000) or -1,250,000.",
	suffix: "Enter the full amount; K, M and B suffixes are not supported.",
	exponent: "Enter the full amount without scientific notation.",
	grouping: "Use commas only between groups of three digits, such as 1,250,000.",
	sign: "Use either a minus sign or parentheses for a negative amount, not both.",
	parentheses: "Close the parentheses around a negative amount, such as (58,000).",
	percent: "Enter an amount without a percent sign.",
	digits: "Use at most 34 significant digits.",
	range: "Enter zero or an amount whose magnitude is from 1e-30 to 1e30.",
	negative: "Enter zero or a positive amount."
}, ie = /^[\s   ]+|[\s   ]+$/g;
function j(e, t = A[e]) {
	return {
		ok: !1,
		code: e,
		message: t
	};
}
function ae(e, t = {}) {
	let n = e.replace(/−/g, "-").replace(ie, "");
	if (!n) return j("empty");
	if (/%/.test(n)) return j("percent");
	if (/\d/.test(n) && /[kmb]{1,2}\)?$/i.test(n)) return j("suffix");
	if (/\d/.test(n) && /e/i.test(n)) return j("exponent");
	if ((n.match(/-/g) ?? []).length > 1 || /-\s*\(|\(\s*-/.test(n)) return j("sign");
	if ((n.match(/\(/g) ?? []).length !== (n.match(/\)/g) ?? []).length) return j("parentheses");
	if ((n.match(/\$/g) ?? []).length > (t.currency === !1 ? 0 : 1)) return j("invalid");
	let r = /^\$?(\()?(-)?\$?(\d[\d,]*(?:\.\d*)?|\.\d+)\)?$/.exec(n);
	if (!r) return j("invalid");
	let [i] = r[3].split(".");
	if (i.includes(",") && !/^\d{1,3}(?:,\d{3})+$/.test(i)) return j("grouping");
	let a = !!r[1] || !!r[2], o = r[3].replace(/,/g, ""), s = (a ? "-" : "") + (o.startsWith(".") ? "0" + o : o);
	if (o.replace(".", "").replace(/^0+(?=\d)/, "").length > 34) return j("digits");
	let c;
	try {
		c = ee(s);
	} catch {
		return j("range");
	}
	return t.allowNegative === !1 && S(c, "0") < 0 ? j("negative") : {
		ok: !0,
		value: c
	};
}
var oe = "Enter a finite percentage such as 12.5 or 12.5%.";
function M(e, t = {}) {
	let n = e.replace(/−/g, "-").replace(ie, "");
	if (!n) return j("empty", "Enter a percentage.");
	if (/\$/.test(n)) return j("invalid", oe);
	let r = /^(.*?)\s*%(\)?)$/.exec(n);
	if (r && (n = r[1] + r[2]), /%/.test(n)) return j("percent", "Use one percent sign, such as 12.5%.");
	let i = ae(n, {
		allowNegative: t.allowNegative,
		currency: !1
	});
	if (!i.ok) return i.code === "invalid" ? j("invalid", oe) : i;
	try {
		return {
			ok: !0,
			value: ee(x(i.value, -2))
		};
	} catch {
		return j("range");
	}
}
var se = "Enter a whole number, such as 120.";
function ce(e) {
	if (/[$%]/.test(e)) return j("invalid", se);
	let t = ae(e, { currency: !1 });
	return t.ok ? /^-?\d+$/.test(t.value) ? t : j("invalid", se) : j(t.code, se);
}
function le(e) {
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
//#region src/format.ts
var ue = {
	scale: "units",
	cents: !1
}, de = (e) => e.scale === "millions" ? 1 : e.scale === "thousands" ? 0 : e.cents ? 2 : 0;
function fe(e, t = ue, n = {}) {
	return E(e, {
		scale: t.scale,
		places: de(t),
		currency: n.currency ?? !0
	});
}
function pe(e, t, n = ue, r) {
	if (e.status !== "available") return "Not applicable";
	let i = e.reported_value ?? e.raw_value;
	if (t === "category" || !y(i)) return String(i);
	let a = y(e.raw_value) ? e.raw_value : i;
	return t === "money" ? fe(de(n) - (n.scale === "thousands" ? 3 : n.scale === "millions" ? 6 : 0) < (e.display_precision ?? 0) ? a : i, n) : t === "percent" ? D(a, 1) : k(a, { threshold: r });
}
var me = {
	scale: "units",
	cents: !0
};
function he(e, t) {
	return k(e, { places: t.reduce((t, n) => y(n) ? Math.max(t, O(e, n, 2, 4)) : t, 2) });
}
function ge(e, t = ue) {
	return fe(e.startsWith("-") ? e.slice(1) : e, t);
}
function _e(e, t) {
	if (e.status !== "available" || !y(e.raw_value)) return "Not applicable";
	let n = e.raw_value, r = S(n, "0") > 0;
	return t === "money" ? `${r ? "+" : ""}${fe(n)}` : `${r ? "+" : ""}${k(n, { threshold: "0" })}`;
}
function ve(e) {
	let t = e.raw_value;
	return t === null ? "Not applicable" : y(t) ? e.name === "uca_positive" ? fe(t) : he(t, [e.threshold, e.decline_threshold]) : String(t);
}
function ye(e, t = 1) {
	return e.status !== "available" || !y(e.raw_value) ? "Not applicable" : D(e.raw_value, t);
}
function be(e, t) {
	return t === "%" ? x(String(e), 2) : String(e);
}
function xe(e, t) {
	return t === "%" ? `${w(x(String(e), 2), 2)}%` : t === "months" ? `${e} months` : fe(String(e));
}
new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC"
}), new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short"
});
var Se = (e) => w(e, 2);
function Ce(e) {
	let t = e.raw_value;
	return t === null ? "Not applicable" : y(t) ? e.name === "uca_positive" ? `$${Se(t)}` : `${w(t, 4)}x` : String(t);
}
//#endregion
//#region src/contracts.ts
var we = [
	"gross_receipts",
	"cogs",
	"operating_expense_excl_dna_interest_comp",
	"officer_compensation",
	"depreciation",
	"amortization",
	"interest_expense",
	"section_179",
	"k1_distribution"
], Te = [
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
], Ee = [
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
function N(e, t) {
	if (!e) throw Error(`Incomplete or invalid assessment: ${t}`);
}
function P(e, t) {
	return N(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
function De(e, t) {
	return N(Array.isArray(e), t), e;
}
function F(e) {
	return typeof e == "string" && e.length > 0;
}
function Oe(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function ke(e) {
	return typeof e == "string" || typeof e == "boolean";
}
function Ae(e) {
	return typeof e == "string" && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e;
}
function je(e) {
	let t = P(e, "period");
	return N(Ae(t.period_start) && Ae(t.period_end) && t.period_start <= t.period_end, "period dates"), t;
}
var Me = (e, t) => e.period_start === t.period_start && e.period_end === t.period_end;
function Ne(e) {
	let t = P(e, "request");
	return "schema_version" in t ? (N(["commercial-assessment-v1", "commercial-assessment-v2"].includes(String(t.schema_version)), "unsupported schema_version"), "dated") : "legacy";
}
function Pe(e) {
	let t = P(e, "decision");
	N(t.vertical === "commercial" && [
		"approve",
		"review",
		"decline"
	].includes(String(t.outcome)) && y(t.score) && F(t.policy_version) && F(t.disclaimer), "decision identity");
	let n = De(t.factors, "factors");
	N(n.length === 5, "commercial factors");
	let r = [
		"dscr",
		"fccr",
		"global_dscr",
		"uca_positive",
		"k1_history"
	];
	for (let e of n) {
		let t = P(e, "factor");
		N(F(t.name) && r.includes(t.name) && ke(t.value) && (t.raw_value === null || ke(t.raw_value)) && y(t.weight) && (t.threshold === null || ke(t.threshold)) && (t.passed === null || typeof t.passed == "boolean") && F(t.source) && [
			null,
			">=",
			">",
			"<",
			"=="
		].includes(t.comparison_operator) && (t.decline_threshold === null || y(t.decline_threshold)) && (t.decline_triggered === null || typeof t.decline_triggered == "boolean"), "factor fields");
	}
	N(new Set(n.map((e) => P(e, "factor").name)).size === 5, "unique factors");
	for (let e of De(t.reasons, "reasons")) {
		let t = P(e, "reason");
		N(F(t.code) && F(t.factor) && F(t.message) && ke(t.value), "reason fields");
	}
	return t;
}
function Fe(e) {
	let t = P(e, "legacy input");
	N(F(t.borrower_name) && F(t.geography), "borrower");
	let n = (e, t) => {
		let n = e === void 0 ? t : e;
		return N(n !== void 0 && typeof n != "boolean", "legacy decimal input"), b(n);
	}, r = De(t.years, "years").map((e) => {
		let t = P(e, "year");
		return Object.fromEntries(we.map((e) => [e, n(t[e], ["section_179", "k1_distribution"].includes(e) ? "0" : void 0)]));
	});
	N(r.length, "years");
	let i = P(t.existing_debt, "debt"), a = P(t.proposed_loan, "loan"), o = P(t.working_capital, "working capital"), s = De(t.guarantors ?? [], "guarantors").map((e) => {
		let t = P(e, "guarantor");
		return N(t.name === void 0 || F(t.name), "guarantor name"), {
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
	}), c = De(t.overrides ?? [], "overrides").map((e) => {
		let t = P(e, "override");
		return N(F(t.field) && F(t.rationale) && F(t.source) && (t.actor === void 0 || F(t.actor)) && (t.at === void 0 || F(t.at)) && "new_value" in t, "override fields"), {
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
				return N(Number.isSafeInteger(e), "integer term months"), e;
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
function Ie(e) {
	let t = P(e, "normalized input");
	N(t.schema_version === "commercial-assessment-v2" && Ae(t.assessment_as_of) && F(t.borrower_name) && F(t.geography), "dated identity");
	let n = P(t.units, "units");
	N(n.currency === "USD" && n.monetary_unit === "dollars" && n.annual_rate_unit === "decimal_nominal", "units");
	let r = De(t.years, "years");
	N(r.length >= 1 && r.length <= 10, "year count");
	let i = "";
	for (let e of r) {
		let n = P(e, "year"), r = je(n);
		N(r.period_start > i && r.period_end <= t.assessment_as_of, "year order"), i = r.period_end;
		for (let e of we) N(y(n[e]), `year ${e}`);
	}
	let a = (e, t) => {
		let n = P(e, "assumption");
		for (let e of t) N(y(n[e]), e);
		return n;
	};
	a(t.existing_debt, ["cpltd_annual", "operating_lease_annual"]);
	let o = a(t.proposed_loan, ["amount", "annual_rate"]);
	N(Number.isSafeInteger(o.term_months) && o.rate_type === "fixed" && o.repayment_type === "fully_amortizing" && o.payment_frequency === "monthly", "loan convention"), N(Me(je(a(t.working_capital, [
		"ar_increase",
		"inventory_increase",
		"ap_increase",
		"cash_taxes_paid"
	])), je(r[r.length - 1])), "working capital period");
	for (let e of De(t.guarantors, "guarantors")) N(F(a(e, [
		"ownership_percentage",
		"wages",
		"interest_dividend_income",
		"mortgage_pi_annual",
		"auto_loan_annual",
		"credit_card_min_annual"
	]).name), "guarantor name");
	return t;
}
function Le(e) {
	let t = P(e, "metric");
	return N(F(t.fact_id) && F(t.unit) && (t.display_precision === null || Number.isInteger(t.display_precision) && Number(t.display_precision) >= 0 && Number(t.display_precision) <= 30) && (t.explanation === null || F(t.explanation)), "metric fields"), N(t.status === "available" ? y(t.raw_value) || t.unit === "category" && F(t.raw_value) : t.status === "not_applicable" && t.raw_value === null && F(t.explanation), "metric status/value"), N(t.status === "not_applicable" ? t.reported_value === null : t.unit === "category" ? t.reported_value === t.raw_value : y(t.reported_value), "reported metric value"), t;
}
function Re(e) {
	let t = P(e, "assessment");
	N(t.schema_version === "commercial-assessment-v2" && t.calculation_version === "commercial-calculation-v2" && t.serialization_version === "assessment-json-v2" && t.coverage_basis === "current_pro_forma" && F(t.disclaimer), "versions");
	let n = Ie(t.normalized_input), r = n.years[n.years.length - 1];
	N(Me(je(t.selected_period), r) && t.assumptions_as_of === n.assessment_as_of, "selected period");
	let i = De(t.historical_spread, "spread");
	N(i.length === n.years.length, "spread length");
	let a = [];
	i.forEach((e, t) => {
		let r = P(e, "historical period");
		N(Me(je(r), n.years[t]) && Me(je(r.financials), n.years[t]), "historical period correspondence");
		let i = P(r.financials, "historical financials");
		for (let e of we) N(i[e] === n.years[t][e], "historical inputs");
		let o = P(r.reported_financials, "reported financials");
		N(Me(je(o), n.years[t]), "reported period");
		for (let e of we) N(y(o[e]) && /^-?\d+\.\d{2}$/.test(o[e]), "reported source amount");
		for (let e of [
			"gross_profit",
			"ordinary_business_income",
			"ebitda",
			"k1_distribution_ratio"
		]) a.push(Le(r[e]));
	});
	let o = P(t.current_facts, "facts");
	for (let e of Te) {
		let t = Le(o[e]), r = ["ordinary_business_income", "ebitda"].includes(e) ? `years.${n.years.length - 1}.${e}` : `current.${e}`;
		N(t.fact_id === r, "fact identity"), N(e === "k1_history" ? t.status === "available" && [
			"stable",
			"unstable",
			"insufficient_history"
		].includes(String(t.raw_value)) : t.raw_value === null || y(t.raw_value), "fact type"), a.push(t);
	}
	let s = De(t.guarantor_contributions, "contributions");
	N(s.length === n.guarantors.length, "contributions length"), s.forEach((e, t) => {
		let r = P(e, "contribution");
		N(r.guarantor_index === t && r.name === n.guarantors[t].name, "contribution identity");
		for (let e of [
			"business_ebitda",
			"outside_income",
			"personal_debt"
		]) a.push(Le(r[e]));
	});
	let c = De(t.k1_history_periods, "history periods").map(je);
	N(c.length >= 1 && c.length <= 2 && Me(c[c.length - 1], r) && c.every((e) => n.years.some((t) => Me(e, t))), "history periods");
	let l = P(t.policy_snapshot, "policy");
	N(F(l.version) && Ae(l.sba_sop_8_effective) && Ae(l.sba_sop_8_1_effective), "policy identity");
	for (let e of Ee) N(e === "consumer_min_credit_score" ? Number.isSafeInteger(l[e]) : y(l[e]), `policy ${e}`);
	N(De(l.consumer_required_atr_fields, "ATR fields").every(F), "ATR fields");
	let u = Pe(t.decision);
	N(u.policy_version === l.version, "decision policy");
	let d = De(t.calculation_trace, "trace");
	N(d.length > 0, "trace rows");
	let f = /* @__PURE__ */ new Map();
	for (let e of d) {
		let t = P(e, "trace row"), n = Le(t);
		N(F(t.definition_id) && F(t.expression) && !f.has(n.fact_id), "trace identity"), f.set(n.fact_id, n);
		for (let e of De(t.operands, "operands")) {
			let t = P(e, "operand");
			N([
				"input",
				"fact",
				"policy"
			].includes(String(t.reference_type)) && F(t.reference) && F(t.unit) && (t.raw_value === null || Oe(t.raw_value) || typeof t.raw_value == "string"), "operand fields"), N(t.reported_value === null || y(t.reported_value) || Number.isSafeInteger(t.reported_value), "reported operand");
		}
	}
	for (let e of d) {
		let t = P(e, "trace row");
		for (let e of De(t.operands, "operands")) {
			let t = P(e, "operand");
			if (t.reference_type === "fact") {
				let e = f.get(String(t.reference));
				N(e && e.raw_value === t.raw_value && e.unit === t.unit, "referenced fact");
			} else {
				let e = String(t.reference).split("/").slice(1), r = t.reference_type === "policy" ? { policy_snapshot: l } : n;
				for (let t of e) N(typeof r == "object" && !!r && Object.prototype.hasOwnProperty.call(r, t), "operand input path"), r = r[t];
				N(r === t.raw_value, "operand input value");
			}
		}
	}
	for (let e of a) {
		let t = f.get(e.fact_id);
		N(t && t.raw_value === e.raw_value && t.reported_value === e.reported_value && t.status === e.status && t.unit === e.unit, "fact/trace correspondence");
	}
	for (let e of u.factors) {
		let t = e.name === "uca_positive" ? "uca_cash_flow" : e.name;
		N(e.raw_value === Le(o[t]).raw_value, "factor/fact correspondence");
	}
	let p = P(t.fingerprint, "fingerprint");
	return N(p.algorithm === "sha256" && typeof p.value == "string" && /^[0-9a-f]{64}$/.test(p.value) && p.content === "normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version", "fingerprint"), t;
}
//#endregion
//#region src/fieldCatalog.ts
var ze = {
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
}, Be = {
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
	uca_positive: "UCA cash flow"
}, Ve = {
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
}, He = ["annual_rate", "ownership_percentage"], Ue = [
	"cpltd_annual",
	"operating_lease_annual",
	"amount",
	"annual_rate",
	"ownership_percentage",
	"mortgage_pi_annual",
	"auto_loan_annual",
	"credit_card_min_annual"
], We = [
	"gross_profit",
	"ordinary_business_income",
	"ebitda",
	"k1_distribution_ratio"
], Ge = (e, t) => e.period_start && e.period_end ? `${e.period_start} – ${e.period_end}` : `Supplied period ${t + 1}`;
function Ke(e) {
	return "assessment_as_of" in e ? `Assumption as of ${e.assessment_as_of}` : "Legacy annual assumption";
}
function qe(e) {
	let t = e.years.length - 1;
	return `Working capital for ${Ge(e.years[t], t)}`;
}
function Je(e, t, n) {
	let r = e.years[t];
	return {
		path: `/years/${t}/${n}`,
		label: ze[n],
		value: r[n],
		unit: "USD",
		min: n === "interest_expense" ? "0" : void 0,
		period: Ge(r, t)
	};
}
function Ye(e, t, n, r, i, a) {
	let o = He.includes(r), s = r === "term_months";
	return {
		path: `${n}/${r}`,
		label: ze[r] ?? r,
		value: i,
		unit: o ? "%" : s ? "months" : "USD",
		min: s ? t === "dated" ? 12 : 1 : Ue.includes(r) ? 0 : void 0,
		max: r === "ownership_percentage" || r === "annual_rate" && t === "dated" ? 1 : void 0,
		integer: s,
		period: a ?? Ke(e)
	};
}
var Xe = {
	schema_version: "Schema version",
	assessment_as_of: "Assessment date",
	borrower_name: "Borrower name",
	geography: "Geography",
	units: "Units",
	currency: "Currency",
	monetary_unit: "Monetary unit",
	annual_rate_unit: "Rate unit",
	years: "Fiscal periods",
	period_start: "Period start",
	period_end: "Period end",
	existing_debt: "Existing debt",
	proposed_loan: "Proposed loan",
	rate_type: "Rate type",
	repayment_type: "Repayment type",
	payment_frequency: "Payment frequency",
	guarantors: "Guarantors",
	name: "Guarantor name",
	working_capital: "Working capital",
	overrides: "Imported overrides"
}, Ze = (e) => e.replace(/~1/g, "/").replace(/~0/g, "~"), Qe = (e) => {
	let t = e.replace(/_/g, " ");
	return t.charAt(0).toUpperCase() + t.slice(1);
}, $e = (e) => ze[e] ?? Xe[e] ?? Qe(e);
function et(e) {
	if (e === "") return "The case file";
	let t = e.split("/").slice(1).map(Ze), [n, r, i] = t, a = /^\d+$/.test(r ?? "") ? Number(r) : null;
	if ((n === "years" || n === "guarantors") && a !== null) {
		let e = n === "years" ? `period ${a + 1}` : `guarantor ${a + 1}`;
		return i === void 0 ? `${Qe(n === "years" ? "period" : "guarantor")} ${a + 1}` : `${$e(t[t.length - 1])} (${e})`;
	}
	return n === "working_capital" && (r === "period_start" || r === "period_end") ? `Working capital ${Xe[r].toLowerCase()}` : $e(t[t.length - 1]);
}
function tt(e) {
	return Array.isArray(e) ? (e[0] === "body" ? e.slice(1) : e).map((e) => `/${String(e).replace(/~/g, "~0").replace(/\//g, "~1")}`).join("") : "";
}
function nt(e, t, n) {
	let [r, i, a, ...o] = n.split("/").slice(1), s = Number(i);
	if (r === "years" && o.length === 0 && we.includes(a) && Number.isInteger(s) && s >= 0 && s < e.years.length) return Je(e, s, a);
	if (r === "guarantors" && o.length === 0 && Ve.guarantors.includes(a) && Number.isInteger(s) && s >= 0 && s < e.guarantors.length) {
		let n = e.guarantors[s];
		return Ye(e, t, `/guarantors/${s}`, a, n[a]);
	}
	if ((r === "existing_debt" || r === "proposed_loan" || r === "working_capital") && a === void 0 && Ve[r].includes(i)) {
		let n = e[r];
		return Ye(e, t, `/${r}`, i, n[i], r === "working_capital" ? qe(e) : void 0);
	}
	throw Error(`Unsupported editable input path: ${n}`);
}
//#endregion
//#region src/memoryStorage.ts
function rt() {
	let e = /* @__PURE__ */ new Map();
	return {
		get length() {
			return e.size;
		},
		key: (t) => [...e.keys()][t] ?? null,
		getItem: (t) => e.get(t) ?? null,
		setItem: (t, n) => {
			e.set(String(t), String(n));
		},
		removeItem: (t) => {
			e.delete(t);
		},
		clear: () => e.clear()
	};
}
var it = rt(), at = rt();
function ot() {
	for (let e = it.length - 1; e >= 0; e--) {
		let t = it.key(e);
		t && !t.endsWith("spreadline.pending-write.v1") && it.removeItem(t);
	}
}
//#endregion
//#region src/authentication.ts
var st = /* @__PURE__ */ new Set(), ct = null, lt = 3e4;
function ut(e, t = !1) {
	let n = new URL(e), r = [
		"localhost",
		"127.0.0.1",
		"[::1]"
	].includes(n.hostname);
	if (n.username || n.password || !t && n.search || n.hash || n.protocol !== "https:" && !(n.protocol === "http:" && r)) throw Error("Use an HTTPS API URL, or HTTP on loopback, without credentials or query parameters.");
	return n;
}
function dt(e = "") {
	for (let e of st) e();
}
function ft(e = "") {
	ct?.controller.abort(), ct = null, ot(), dt(e);
}
async function pt(e, t, n = fetch) {
	let r = ct;
	if (!r) throw Error("Connect the workspace with an API token before sending requests.");
	if (ut(e, !0).origin !== r.origin) throw Error("The API origin changed. Reconnect before sending a credential.");
	let i = new Headers(t.headers);
	if (i.has("Authorization")) throw Error("Caller-supplied authorization is not accepted.");
	i.set("Authorization", `Bearer ${r.token}`);
	let a = [r.controller.signal, AbortSignal.timeout(lt)];
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
	if (r !== ct || r.controller.signal.aborted) throw await o.body?.cancel().catch(() => {}), Error("The API connection changed; review any pending write before retrying.");
	return o.status === 401 && ft("The API rejected the credential. Reconnect to review or retry pending work."), o;
}
//#endregion
//#region src/requestActivity.ts
var mt = /* @__PURE__ */ new Map(), ht = /* @__PURE__ */ new Set(), gt = {
	count: 0,
	startedAt: null
};
function _t() {
	gt = {
		count: mt.size,
		startedAt: mt.size ? Math.min(...mt.values()) : null
	}, ht.forEach((e) => e());
}
var vt = () => gt, yt = (e) => (ht.add(e), () => {
	ht.delete(e);
});
async function bt(e) {
	let t = Symbol();
	mt.set(t, Date.now()), _t();
	try {
		return await e();
	} finally {
		mt.delete(t), _t();
	}
}
//#endregion
//#region src/transport.ts
var xt = "http://localhost:8000".replace(/\/$/, ""), St = null;
function Ct(e, t) {
	if (!/^[0-9a-f-]{36}$/.test(e)) throw Error("Invalid testing store identity");
	xt = `streamlit:${window.location.origin}:${e}`, St = t;
}
function wt() {
	return St !== null;
}
function Tt(e, t, n) {
	return bt(() => St ? St(e, t) : pt(`${xt}${e}`, t, n));
}
var Et = "spreadline.embedded.";
function Dt(e, t) {
	let n = () => Array.from({ length: e.length }, (t, n) => e.key(n)).filter((e) => e !== null && e.startsWith(t));
	return {
		get length() {
			return n().length;
		},
		key(e) {
			return n()[e]?.slice(t.length) ?? null;
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
}
function Ot() {
	return St ? Dt(it, Et) : it;
}
function kt() {
	return St ? Dt(at, Et) : at;
}
//#endregion
//#region src/api.ts
var At = (e, t, n = fetch) => Tt(e, t, n), jt = class extends Error {
	kind;
	status;
	fieldErrors;
	detail;
	constructor(e, t, n = 0, r = [], i = null) {
		super(e), this.kind = t, this.status = n, this.fieldErrors = r, this.detail = i, this.name = "EvaluationError";
	}
};
function Mt(e, t) {
	let n = e && typeof e == "object" && "errors" in e ? e.errors : null;
	if (n && typeof n == "object" && n.version === "field-errors-v1") {
		let e = n.items;
		if (Array.isArray(e)) return e.flatMap((e) => e && typeof e == "object" && typeof e.pointer == "string" && typeof e.message == "string" ? [{
			pointer: e.pointer,
			code: typeof e.code == "string" ? e.code : "invalid_value",
			message: e.message,
			limit: typeof e.limit == "string" ? e.limit : null
		}] : []);
	}
	return Array.isArray(t) ? t.flatMap((e) => e && typeof e == "object" && "loc" in e ? [{
		pointer: tt(e.loc),
		code: "invalid_value",
		message: String(e.msg ?? "Invalid input"),
		limit: null
	}] : []) : [];
}
async function Nt(e, t, n = fetch) {
	let r;
	try {
		r = await At(`/commercial/${e.mode === "dated" ? "assessment" : "decision"}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: e.rawJson ?? JSON.stringify(e.payload),
			signal: t
		}, n);
	} catch (e) {
		let t = e instanceof Error ? e.message : String(e);
		throw new jt(t, "unavailable", 0, [], e instanceof DOMException && e.name === "TimeoutError" ? "timeout" : e instanceof TypeError ? null : t);
	}
	let i;
	try {
		i = await r.json();
	} catch {
		throw new jt(`Backend returned an unreadable response (${r.status}).`, "unreadable", r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null;
		throw new jt(Array.isArray(e) ? e.map((e) => e && typeof e == "object" ? `${Array.isArray(e.loc) ? e.loc.join(".") : "input"}: ${String(e.msg ?? "Invalid input")}` : "Invalid input").join("; ") : typeof e == "string" ? e : `Request failed (${r.status}).`, r.status < 500 ? "rejected" : "unavailable", r.status, Mt(i, e), typeof e == "string" ? e : null);
	}
	return e.mode === "dated" ? (() => {
		let t = Re(i);
		return {
			mode: "dated",
			input: t.normalized_input,
			result: t,
			filename: e.filename
		};
	})() : {
		mode: "legacy",
		input: Fe(e.payload),
		result: Pe(i),
		filename: e.filename
	};
}
//#endregion
//#region src/caseContracts.ts
function I(e, t) {
	if (!e) throw Error(`Invalid saved-case response or command: ${t}.`);
}
function L(e, t) {
	return I(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
var Pt = (e) => typeof e == "number" && Number.isFinite(e), R = (e) => typeof e == "string", Ft = (e) => R(e) && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(e), It = (e) => R(e) && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(e), Lt = (e) => Number.isSafeInteger(e) && Number(e) >= 1, Rt = (e) => R(e) && /^[0-9a-f]{64}$/.test(e), zt = (e) => R(e) && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, Bt = (e) => R(e) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(e) && zt(e.slice(0, 10)) && Number.isFinite(Date.parse(e));
function Vt(e, t = 0, n = 64) {
	if (I(t < n, "JSON depth"), !(e === null || R(e) || typeof e == "boolean")) {
		if (typeof e == "number") {
			I(Pt(e), "finite JSON number");
			return;
		}
		I(typeof e == "object", "JSON value");
		for (let r of Object.values(e)) Vt(r, t + 1, n);
	}
}
function z(e, t) {
	if (e === t) return !0;
	if (!e || !t || typeof e != "object" || typeof t != "object" || Array.isArray(e) !== Array.isArray(t)) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.prototype.hasOwnProperty.call(t, n) && z(e[n], t[n]));
}
function B(e, t) {
	I(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), "command fields");
}
function Ht(e) {
	return I(R(e) && [...e].length <= 2e3 && e.trim().length > 0, "nonblank rationale, at most 2,000 characters"), e.trim();
}
var Ut = {
	years: we,
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
function Wt(e) {
	I(R(e) && e.length <= 160 && e.startsWith("/"), "numeric field path");
	let t = e.slice(1).split("/"), n = t[0], r = t[t.length - 1];
	return I(Object.prototype.hasOwnProperty.call(Ut, n) && Ut[n].includes(r), "numeric field allowlist"), I(["years", "guarantors"].includes(n) ? t.length === 3 && /^(?:0|[1-9][0-9]{0,8})$/.test(t[1]) : t.length === 2, "field index"), t;
}
function Gt(e, t) {
	let n = Wt(t), r = n[0], i = n[n.length - 1], a = e, o, s = {
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
		I(Array.isArray(e) && Number(n[1]) < e.length, "existing input index"), o = L(e[Number(n[1])], "input row"), r === "guarantors" ? (s.guarantor_index = Number(n[1]), s.guarantor_name = String(o.name)) : s.basis = "annual_financials";
	} else o = L(a[r], "input group"), r === "working_capital" && (s.basis = "working_capital");
	["annual_financials", "working_capital"].includes(s.basis) && (I(zt(o.period_start) && zt(o.period_end), "input dates"), s.period_start = o.period_start, s.period_end = o.period_end), ["annual_rate", "ownership_percentage"].includes(i) && (s.unit = "decimal fraction"), i === "term_months" && (s.unit = "months");
	let c = o[i];
	return I(i === "term_months" ? Number.isSafeInteger(c) : y(c) || Pt(c), "numeric input"), {
		value: c,
		context: s
	};
}
function Kt(e) {
	let t = L(e, "create command");
	B(t, ["input", "rationale"]);
	let n = L(t.input, "create input"), r = n.schema_version === "commercial-assessment-v1";
	if (r) {
		let e = (t, n = "") => typeof t == "number" ? n === "term_months" ? t : b(t) : Array.isArray(t) ? t.map((t) => e(t)) : t && typeof t == "object" ? Object.fromEntries(Object.entries(t).map(([t, n]) => [t, e(n, t)])) : t;
		Ie({
			...L(e(n), "archived input"),
			schema_version: "commercial-assessment-v2"
		});
	}
	let i = r ? n : Ie(n);
	B(i, [
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
	]), B(i.units, [
		"currency",
		"monetary_unit",
		"annual_rate_unit"
	]);
	for (let e of i.years) B(e, [
		...we,
		"period_start",
		"period_end"
	]);
	B(i.existing_debt, Ut.existing_debt), B(i.proposed_loan, [
		...Ut.proposed_loan,
		"rate_type",
		"repayment_type",
		"payment_frequency"
	]);
	for (let e of i.guarantors) B(e, ["name", ...Ut.guarantors]);
	return B(i.working_capital, [
		...Ut.working_capital,
		"period_start",
		"period_end"
	]), Vt(t), Ht(t.rationale), t;
}
function qt(e) {
	let t = L(e, "edit command");
	return B(t, [
		"field_path",
		"new_value",
		"rationale"
	]), Wt(t.field_path), I(y(t.new_value) || Pt(t.new_value), "finite edit value"), Ht(t.rationale), t.field_path === "/proposed_loan/term_months" && I(Pt(t.new_value) && Number.isSafeInteger(t.new_value) && t.new_value >= 12 && t.new_value <= 12e3, "whole term months"), t;
}
function Jt(e, t) {
	let n = L(e, "snapshot");
	Vt(n), I(n.storage_serialization_version === "case-json-v1" && It(n.case_id) && It(n.run_id) && Lt(n.revision), "snapshot identity"), I(n.parent_revision === (n.revision === 1 ? null : n.revision - 1) && Bt(n.recorded_at), "snapshot parent/time"), I(Rt(n.input_hash) && Rt(n.payload_hash), "snapshot hashes"), I(t === `"case-json-v1:${n.case_id}:${n.revision}:${n.payload_hash}"`, "strong ETag");
	let r = L(n.normalized_input, "stored input"), i = L(n.assessment, "stored assessment");
	I(R(i.schema_version) && R(i.calculation_version) && R(i.serialization_version), "assessment versions");
	let a = i.schema_version === "commercial-assessment-v2" && i.calculation_version === "commercial-calculation-v2" && i.serialization_version === "assessment-json-v2", o = a ? Re(i) : null;
	o && I(z(r, o.normalized_input), "outer normalized input");
	let s = L(n.event, "event"), c = L(s.context, "event context");
	if (I(s.case_id === n.case_id && s.revision === n.revision && s.run_id === n.run_id && s.recorded_at === n.recorded_at && Ft(s.actor), "event identity"), Ht(s.rationale), I(zt(c.assessment_as_of), "event as-of"), I(c.period_start === null && c.period_end === null || zt(c.period_start) && zt(c.period_end) && c.period_start <= c.period_end, "event period"), I(c.guarantor_index === null && c.guarantor_name === null || Number.isSafeInteger(c.guarantor_index) && Number(c.guarantor_index) >= 0 && R(c.guarantor_name), "event guarantor"), n.revision === 1) I(s.kind === "creation" && s.field_path === null && s.before === null && s.after === null && c.basis === "case_creation" && c.unit === null && c.period_start === null && c.guarantor_index === null, "creation event");
	else if (I(s.kind === "edit" && (y(s.before) || Pt(s.before)) && (y(s.after) || Pt(s.after)) && !C(s.before, s.after) && R(s.field_path), "edit event"), Wt(s.field_path), I([
		"annual_financials",
		"working_capital",
		"current_assumptions"
	].includes(String(c.basis)) && [
		"USD dollars",
		"decimal fraction",
		"months"
	].includes(String(c.unit)), "edit context"), o) {
		let e = Gt(o.normalized_input, s.field_path);
		I(e.value === s.after && z(e.context, c), "server-derived edit context");
	}
	return o && I(c.assessment_as_of === o.normalized_input.assessment_as_of, "event assumptions date"), Yt(n.recording), {
		snapshot: n,
		etag: t,
		assessment: o,
		compatibility: a ? null : `Stored assessment definition: ${i.schema_version} / ${i.calculation_version} / ${i.serialization_version}. Original JSON is available; typed display and editing are unavailable.`
	};
}
function Yt(e) {
	let t = L(e, "recording metadata"), n = L(t.packages, "installed packages");
	I(R(t.python_version) && R(t.sqlite_version) && Rt(t.dependency_baseline_sha256), "recording versions");
	for (let e of [
		"fastapi",
		"pydantic",
		"starlette",
		"uvicorn"
	]) I(R(n[e]) && n[e].length > 0, `installed ${e}`);
	return I(t.source_status === "development_unverified" ? t.source_revision === null : t.source_status === "build_reported" && R(t.source_revision) && /^[0-9a-f]{40}$/.test(t.source_revision), "recorded source"), t;
}
function Xt(e) {
	let t = L(e, "page");
	return I(Array.isArray(t.items) && t.items.length <= 25, "bounded page items"), I(t.next_cursor === null || R(t.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(t.next_cursor), "page cursor"), t;
}
function Zt(e) {
	let t = L(e, "summary");
	return I(It(t.case_id) && It(t.run_id) && Lt(t.revision) && Bt(t.recorded_at), "summary identity"), t;
}
function Qt(e) {
	let t = Xt(e);
	I(t.listing_version === void 0 || t.listing_version === "case-listing-v2", "listing version");
	let n = /* @__PURE__ */ new Set();
	for (let e of t.items) {
		let r = Zt(e);
		I(R(r.borrower_name) && Bt(r.created_at) && !n.has(r.case_id), "case summary"), n.add(r.case_id), t.listing_version === "case-listing-v2" && (I(typeof r.definition_supported == "boolean", "summary definition support"), I(r.definition_supported ? [
			"approve",
			"review",
			"decline"
		].includes(String(r.outcome)) && (r.dscr === null || y(r.dscr)) && y(r.requested_amount) && zt(r.assessment_as_of) : r.outcome === null && r.dscr === null && r.requested_amount === null && r.assessment_as_of === null, "summary financial values"));
	}
	return t;
}
function $t(e, t) {
	let n = Xt(e), r = Infinity;
	for (let e of n.items) {
		let n = Zt(e);
		I(n.case_id === t && n.parent_revision === (n.revision === 1 ? null : Number(n.revision) - 1) && Number(n.revision) < r, "revision summary"), Ht(n.rationale), r = Number(n.revision);
	}
	return n;
}
function en(e, t) {
	let n = L(e, "replay"), r = t.snapshot;
	return I(n.case_id === r.case_id && n.revision === r.revision && n.run_id === r.run_id && [
		"matched",
		"mismatch",
		"replay_unavailable"
	].includes(String(n.status)), "replay identity/status"), I(Array.isArray(n.differences) && n.differences.every(R) && R(n.explanation), "replay details"), I(n.status !== "matched" || n.differences.length === 0, "matched replay differences"), n;
}
//#endregion
//#region src/scenarioContracts.ts
var tn = [
	"revenue_change",
	"cogs_change",
	"operating_expense_change",
	"proposed_rate_change_bps"
], nn = "commercial-scenario-preview-v2", rn = "scenario-preview-json-v2";
function an(e, t) {
	I(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), "scenario fields");
}
function on(e, t) {
	I(R(e), "scenario text");
	let n = e.replace(/^[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$/gu, "");
	return I(n.length > 0 && [...n].length <= t, `nonblank scenario text, at most ${t} characters`), n;
}
function sn(e, t) {
	let n = t ? M(e) : ae(e, { currency: !1 });
	I(n.ok, "Enter a finite decimal change");
	let r = n.ok ? n.value : "";
	return I(!t || S(r, "-1") >= 0, "Percentage changes must be at least -100%; all changes must be finite"), r;
}
function cn(e, t = !1) {
	let n = L(e, "scenario"), r = L(n.assumptions, "shocks");
	I(R(n.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(n.scenario_key), "scenario key"), an(r, tn);
	for (let e of tn) I((y(r[e]) || t && Pt(r[e])) && (e === "proposed_rate_change_bps" || S(b(r[e]), "-1") >= 0), "finite explicit shock");
	return {
		scenario_key: n.scenario_key,
		name: on(n.name, 120),
		rationale: on(n.rationale, 2e3),
		assumptions: r
	};
}
function ln(e) {
	let t = L(e, "scenario command"), n = ["commercial-scenario-comparison-create-v1", "commercial-scenario-comparison-create-v2"].includes(String(t.schema_version)), r = String(t.schema_version).endsWith("-v1");
	I(n || t.schema_version === nn || t.schema_version === "commercial-scenario-preview-v1", "scenario command version"), an(t, [
		"schema_version",
		"baseline_run_id",
		"scenarios",
		...n ? ["expected_preview_fingerprint"] : []
	]), I(It(t.baseline_run_id) && String(t.baseline_run_id).toLowerCase() === t.baseline_run_id, "canonical baseline run"), n && I(Rt(t.expected_preview_fingerprint), "reviewed preview fingerprint"), I(Array.isArray(t.scenarios) && t.scenarios.length >= 1 && t.scenarios.length <= 10, "1–10 scenarios");
	let i = /* @__PURE__ */ new Set();
	for (let e of t.scenarios) {
		an(L(e, "scenario command row"), [
			"scenario_key",
			"name",
			"rationale",
			"assumptions"
		]);
		let t = cn(e, r);
		I(z(t, e) && !i.has(t.scenario_key), "normalized unique scenario command"), i.add(t.scenario_key);
	}
	return t;
}
function un(e) {
	let t = L(e.baseline, "preview baseline");
	return I(Array.isArray(e.scenarios), "preview scenarios"), ln({
		schema_version: e.schema_version,
		baseline_run_id: t.run_id,
		scenarios: e.scenarios.map((t) => cn(t, e.schema_version === "commercial-scenario-preview-v1"))
	});
}
function dn(e, t) {
	return I(Array.isArray(e), t), e;
}
function fn(e) {
	return e === null || y(e);
}
function pn(e) {
	return It(e) && e.toLowerCase() === e;
}
function mn(e) {
	I((e.schema_version === nn && e.serialization_version === rn || e.schema_version === "commercial-scenario-preview-v1" && e.serialization_version === "scenario-preview-json-v1") && e.persisted === !1 && R(e.scenario_definition_version) && R(e.calculation_version), "preview envelope versions");
	let t = L(e.baseline, "baseline evidence");
	I(pn(t.case_id) && pn(t.run_id) && Lt(t.revision) && Rt(t.input_hash) && Rt(t.payload_hash), "baseline evidence identity");
	let n = L(t.assessment, "original assessment"), r = L(e.fingerprint, "preview fingerprint");
	I(r.algorithm === "sha256" && Rt(r.value) && r.content === "baseline_identity+payload_hash+normalized_command+policy_snapshot+versions", "preview fingerprint");
	let i = L(e.selected_period, "selected operating period");
	I(zt(i.period_start) && zt(i.period_end) && i.period_start <= i.period_end && zt(e.assumptions_as_of) && i.period_end <= e.assumptions_as_of, "preview dates"), I(z(e.selected_period, n.selected_period) && e.assumptions_as_of === n.assumptions_as_of && z(e.policy_snapshot, n.policy_snapshot), "baseline period and retained policy");
	let a = L(n.normalized_input, "baseline input");
	return I(z(e.units, a.units), "baseline units"), I(dn(e.held_fixed_assumptions, "held fixed assumptions").length > 0 && e.held_fixed_assumptions.every(R) && R(e.disclaimer), "preview explanation"), un(e), {
		b: t,
		a: n
	};
}
function hn(e, t, n) {
	let r = L(e, "scenario preview");
	Vt(r, 0, 100);
	let { b: i, a } = mn(r);
	I(r.schema_version === nn && r.scenario_definition_version === "commercial-scenario-definition-v2" && r.calculation_version === "commercial-calculation-v2", "supported live scenario definition");
	let o = Re(a);
	t && I(i.case_id === t.snapshot.case_id && i.revision === t.snapshot.revision && i.run_id === t.snapshot.run_id && i.input_hash === t.snapshot.input_hash && i.payload_hash === t.snapshot.payload_hash && z(o, t.snapshot.assessment), "selected original baseline"), n && I(z(un(r), ln(n)), "reviewed normalized command");
	for (let e of r.scenarios) gn(e, r, o);
	return r;
}
function gn(e, t, n) {
	let r = L(e, "scenario result"), i = cn(r);
	I(z({
		scenario_key: r.scenario_key,
		name: r.name,
		rationale: r.rationale,
		assumptions: r.assumptions
	}, i) && r.coverage_basis === "stressed_latest_period_current_pro_forma", "normalized projection command/basis");
	let a = L(r.projection_inputs, "projected inputs"), o = n.normalized_input;
	Ie({
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
	]) I(z(a[e], o[e]), "held-fixed projected inputs");
	let s = L(a.operating, "projected operating"), c = L(a.proposed_loan, "projected loan"), l = o.years[o.years.length - 1];
	for (let e of we) [
		"gross_receipts",
		"cogs",
		"operating_expense_excl_dna_interest_comp"
	].includes(e) || I(s[e] === l[e], "held-fixed financial lines");
	I(s.period_start === l.period_start && s.period_end === l.period_end, "projected period");
	for (let e of Object.keys(o.proposed_loan)) e !== "annual_rate" && I(c[e] === o.proposed_loan[e], "held-fixed loan");
	let u = L(r.current_facts, "projected facts"), d = [];
	for (let e of Te) {
		let t = Le(u[e]), r = e === "k1_history" || e === "k1_ratio_difference", i = r ? "baseline." + n.current_facts[e].fact_id : ["ordinary_business_income", "ebitda"].includes(e) ? `projection.operating.${e}` : `projection.current.${e}`;
		I(t.fact_id === i && (r ? z(t, {
			...n.current_facts[e],
			fact_id: i
		}) : fn(t.raw_value)), "projected fact identity/type/observed history"), d.push(t);
	}
	let f = dn(r.guarantor_contributions, "projected guarantors");
	I(f.length === o.guarantors.length, "guarantor count"), f.forEach((e, t) => {
		let n = L(e, "guarantor contribution");
		I(n.guarantor_index === t && n.name === o.guarantors[t].name, "guarantor identity");
		for (let e of [
			"business_ebitda",
			"outside_income",
			"personal_debt"
		]) {
			let r = Le(n[e]);
			I(r.fact_id === `projection.current.guarantors.${t}.${e}` && fn(r.raw_value), "projected guarantor fact"), d.push(r);
		}
	});
	let p = Pe(r.decision);
	I(p.policy_version === n.policy_snapshot.version, "retained decision policy");
	let m = dn(r.calculation_trace, "projection trace"), h = /* @__PURE__ */ new Map();
	for (let e of m) {
		let t = L(e, "trace row"), n = Le(t);
		I(R(t.definition_id) && R(t.expression) && !h.has(n.fact_id), "trace identity"), h.set(n.fact_id, n), dn(t.operands, "trace operands");
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
		I(z(h.get(t.fact_id), t), "retained observed trace identity");
	}
	for (let e of m) for (let n of L(e, "trace row").operands) {
		let e = L(n, "operand");
		if (I(R(e.reference) && R(e.unit) && (e.raw_value === null || Pt(e.raw_value) || R(e.raw_value)), "operand value"), e.reference_type === "fact") {
			let t = h.get(e.reference);
			I(t && t.raw_value === e.raw_value && t.unit === e.unit, "referenced scenario fact");
		} else {
			I(["input", "policy"].includes(String(e.reference_type)) && e.reference.startsWith("/"), "operand reference");
			let n = {
				...r,
				baseline: t.baseline,
				policy_snapshot: t.policy_snapshot
			};
			for (let t of e.reference.slice(1).split("/")) {
				let e = _n(n);
				I(Object.prototype.hasOwnProperty.call(e, t), "scenario operand path"), n = e[t];
			}
			I(n === e.raw_value, "scenario operand value");
		}
	}
	for (let e of d) {
		let t = h.get(e.fact_id);
		I(t && [
			"fact_id",
			"raw_value",
			"reported_value",
			"unit",
			"display_precision",
			"status",
			"explanation"
		].every((n) => t[n] === e[n]), "fact/trace fields");
	}
	let g = dn(r.comparisons, "metric comparisons");
	I(g.length === Te.length - 1, "comparison count");
	let _ = /* @__PURE__ */ new Set();
	for (let e of g) {
		let t = L(e, "metric comparison");
		I(R(t.metric) && Te.includes(t.metric) && t.metric !== "k1_history" && !_.has(t.metric), "compared metric identity"), _.add(t.metric);
		let r = n.current_facts[t.metric], i = Le(u[t.metric]);
		I(t.baseline_fact_id === "baseline." + r.fact_id && t.projected_fact_id === i.fact_id && t.baseline_value === r.raw_value && t.projected_value === i.raw_value && t.unit === i.unit && fn(t.delta), "comparison fact links"), I(r.raw_value === null || i.raw_value === null ? t.delta === null && R(t.delta_explanation) : y(t.delta) && t.delta_explanation === null, "comparison availability");
		let a = p.factors.find((e) => e.name === (t.metric === "uca_cash_flow" ? "uca_positive" : t.metric));
		if ([
			"dscr",
			"fccr",
			"global_dscr",
			"uca_cash_flow"
		].includes(t.metric)) {
			let e = L(t.policy_headroom, "policy headroom");
			I(a && e.comparison_operator === a.comparison_operator && e.approval_threshold === a.threshold && e.decline_threshold === a.decline_threshold, "headroom policy");
			for (let t of [
				"baseline_approval",
				"projected_approval",
				"baseline_decline",
				"projected_decline"
			]) I(fn(e[t]), "finite headroom");
		} else I(t.policy_headroom === null, "non-policy headroom");
	}
	for (let e of p.factors) {
		let t = e.name === "uca_positive" ? "uca_cash_flow" : e.name, r = n.decision.factors.find((t) => t.name === e.name);
		I(e.raw_value === Le(u[t]).raw_value && r && [
			"threshold",
			"decline_threshold",
			"comparison_operator",
			"weight",
			"source"
		].every((t) => e[t] === r[t]), "scenario factor fact and retained policy"), t === "k1_history" && I(z(e, r), "held-fixed observed K-1 factor");
	}
	let v = dn(r.factor_changes, "factor changes");
	I(v.length === p.factors.length, "factor change count");
	let b = /* @__PURE__ */ new Set();
	for (let e of v) {
		let t = L(e, "factor change"), r = n.decision.factors.find((e) => e.name === t.name), i = p.factors.find((e) => e.name === t.name);
		I(R(t.name) && !b.has(t.name) && r && i && z(t.baseline, r) && z(t.projected, i) && t.changed === !z(r, i) && t.basis === (t.name === "k1_history" ? "observed_history" : "projected_current"), "factor change links"), b.add(t.name), I(t.projected_fact_id === Le(u[t.name === "uca_positive" ? "uca_cash_flow" : t.name]).fact_id, "factor projected reference");
	}
	let x = L(r.outcome_change, "outcome change");
	I(x.baseline === n.decision.outcome && x.projected === p.outcome && x.changed === (x.baseline !== x.projected), "outcome change links");
	let S = dn(r.reason_changes, "reason changes"), C = Array.from(new Set([...n.decision.reasons, ...p.reasons].map((e) => e.code))).filter((e) => !z(n.decision.reasons.find((t) => t.code === e) ?? null, p.reasons.find((t) => t.code === e) ?? null));
	I(S.length === C.length, "reason changes count");
	let ee = /* @__PURE__ */ new Set();
	for (let e of S) {
		let t = L(e, "reason change"), r = n.decision.reasons.find((e) => e.code === t.code) ?? null, i = p.reasons.find((e) => e.code === t.code) ?? null;
		I(R(t.code) && C.includes(t.code) && !ee.has(t.code) && z(t.baseline, r) && z(t.projected, i) && t.change === (r === null ? "added" : i === null ? "removed" : "changed"), "reason change links"), ee.add(t.code);
	}
}
function _n(e) {
	return I(typeof e == "object" && !!e, "operand path object"), e;
}
function vn(e, t) {
	let n = L(e, "original comparison");
	Vt(n, 0, 100), I(["commercial-scenario-comparison-v1", "commercial-scenario-comparison-v2"].includes(String(n.schema_version)) && n.storage_serialization_version === "scenario-comparison-json-v1" && n.persisted === !0 && pn(n.comparison_id) && pn(n.case_id) && pn(n.baseline_run_id) && Lt(n.baseline_revision) && Rt(n.payload_hash), "comparison storage identity"), I(Bt(n.recorded_at) && /^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{6}\+00:00$/.test(n.recorded_at) && Ft(n.actor), "comparison recording time/actor"), Yt(n.recording), I(t === `"scenario-comparison-json-v1:${n.case_id}:${n.comparison_id}:${n.payload_hash}"`, "comparison ETag");
	let r = L(n.preview, "original preview"), { b: i, a } = mn(r);
	I(i.case_id === n.case_id && i.revision === n.baseline_revision && i.run_id === n.baseline_run_id, "inner/outer original baseline");
	let o = r.schema_version === nn && r.scenario_definition_version === "commercial-scenario-definition-v2" && r.calculation_version === "commercial-calculation-v2" && a.schema_version === "commercial-assessment-v2" && a.calculation_version === "commercial-calculation-v2" && a.serialization_version === "assessment-json-v2";
	return {
		record: n,
		etag: t,
		preview: o ? hn(r) : null,
		compatibility: o ? null : `Original definition: ${r.scenario_definition_version} / ${r.calculation_version}; baseline ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON remains available; typed projection and new preview are unavailable.`
	};
}
function yn(e, t) {
	let n = L(e, "comparison page");
	Vt(n, 0, 100);
	let r = dn(n.items, "comparison summaries");
	I(r.length <= 25 && (n.next_cursor === null || R(n.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(n.next_cursor)), "bounded comparison page/cursor");
	let i = /* @__PURE__ */ new Set();
	for (let e of r) {
		let n = L(e, "comparison summary");
		I(n.case_id === t && pn(n.comparison_id) && pn(n.baseline_run_id) && Lt(n.baseline_revision) && Bt(n.recorded_at) && Rt(n.preview_fingerprint) && !i.has(String(n.comparison_id)), "summary identity"), i.add(String(n.comparison_id)), I(["commercial-scenario-comparison-v1", "commercial-scenario-comparison-v2"].includes(String(n.schema_version)) && n.storage_serialization_version === "scenario-comparison-json-v1" && (n.preview_schema_version === nn && n.preview_serialization_version === rn || n.preview_schema_version === "commercial-scenario-preview-v1" && n.preview_serialization_version === "scenario-preview-json-v1") && R(n.policy_version) && R(n.scenario_definition_version) && R(n.calculation_version), "summary versions");
		let r = dn(n.scenarios, "scenario summaries"), a = /* @__PURE__ */ new Set();
		I(r.length >= 1 && r.length <= 10 && n.scenario_count === r.length, "scenario count");
		for (let e of r) {
			let t = L(e, "scenario summary");
			I(R(t.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(t.scenario_key) && !a.has(t.scenario_key) && on(t.name, 120) === t.name, "summary command"), a.add(t.scenario_key);
		}
	}
	return n;
}
//#endregion
//#region src/caseRecovery.ts
var bn = "spreadline.pending-write.v1", xn = "spreadline.case-selection.v1", Sn = 1e6, Cn = 21e5;
function wn(e, t = xt) {
	let n = L(e, "pending write");
	if (n.version !== "scenario-comparison-write-v1") return On(e, t);
	I(n.kind === "comparison" && It(n.id) && n.apiBase === t && R(n.body) && Dn(n.body) <= Sn, "comparison recovery envelope");
	let r = ln(JSON.parse(n.body));
	I(["commercial-scenario-comparison-create-v1", "commercial-scenario-comparison-create-v2"].includes(r.schema_version) && JSON.stringify(r) === n.body && It(n.caseId) && Lt(n.baselineRevision) && n.baselineRunId === r.baseline_run_id && Rt(n.baselinePayloadHash), "comparison recovery identity/command");
	let i = L(n.context, "comparison recovery context");
	return I(zt(i.period_start) && zt(i.period_end) && zt(i.assessment_as_of) && i.period_start <= i.period_end && i.period_end <= i.assessment_as_of && R(i.policy_version) && R(i.scenario_definition_version) && R(i.calculation_version), "comparison recovery dates/versions"), I(Object.keys(n).length === 10 && [
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
	].every((e) => e in n), "comparison recovery fields"), I(Object.keys(i).length === 6 && [
		"period_start",
		"period_end",
		"assessment_as_of",
		"policy_version",
		"scenario_definition_version",
		"calculation_version"
	].every((e) => e in i), "comparison context fields"), Object.freeze(i), Object.freeze(n);
}
function Tn(e) {
	let t = hn(e), n = {
		...un(t),
		schema_version: "commercial-scenario-comparison-create-v2",
		expected_preview_fingerprint: t.fingerprint.value
	};
	return wn({
		version: "scenario-comparison-write-v1",
		kind: "comparison",
		id: crypto.randomUUID(),
		apiBase: xt,
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
function En() {
	return Ot();
}
function Dn(e) {
	return new TextEncoder().encode(e).length;
}
function On(e, t = xt) {
	let n = L(e, "recovery operation");
	I(n.version === "case-write-v1" && It(n.id) && n.apiBase === t && R(n.body) && Dn(n.body) <= Sn, "recovery version, backend or size");
	let r = JSON.parse(n.body);
	I(JSON.stringify(r) === n.body, "unchanged canonical browser command");
	let i = [
		"version",
		"id",
		"apiBase",
		"body",
		"kind"
	];
	if (n.kind === "create") Kt(r);
	else {
		I(n.kind === "edit" && It(n.caseId) && Lt(n.baseRevision), "edit recovery identity"), I(R(n.etag) && RegExp(`^"case-json-v1:${n.caseId}:${n.baseRevision}:[0-9a-f]{64}"$`).test(n.etag), "edit recovery ETag");
		let e = qt(r), t = L(n.review, "review field"), a = L(n.context, "review context");
		I(t.path === e.field_path && R(t.label) && R(t.period) && (y(t.value) || typeof t.value == "number" && Number.isFinite(t.value)) && [
			"USD",
			"%",
			"months"
		].includes(String(t.unit)), "recovery review");
		for (let e of ["min", "max"]) I(t[e] === void 0 || y(t[e]) || typeof t[e] == "number" && Number.isFinite(t[e]), "field range");
		I(t.integer === void 0 || typeof t.integer == "boolean", "field integer"), I(Object.keys(t).every((e) => [
			"path",
			"label",
			"period",
			"value",
			"unit",
			"min",
			"max",
			"integer"
		].includes(e)), "review fields");
		let o = Wt(e.field_path), s = o[0], c = o[o.length - 1], l = ["annual_rate", "ownership_percentage"].includes(c) ? "decimal fraction" : c === "term_months" ? "months" : "USD dollars";
		I(zt(a.assessment_as_of) && a.basis === (s === "years" ? "annual_financials" : s === "working_capital" ? "working_capital" : "current_assumptions") && a.unit === l && t.unit === (l === "decimal fraction" ? "%" : l === "months" ? "months" : "USD"), "recovery context"), I(["years", "working_capital"].includes(s) ? zt(a.period_start) && zt(a.period_end) && a.period_start <= a.period_end && a.period_end <= a.assessment_as_of : a.period_start === null && a.period_end === null, "recovery period"), I(s === "guarantors" ? a.guarantor_index === Number(o[1]) && R(a.guarantor_name) : a.guarantor_index === null && a.guarantor_name === null, "recovery guarantor"), I(Object.keys(a).length === 7 && [
			"basis",
			"assessment_as_of",
			"period_start",
			"period_end",
			"guarantor_index",
			"guarantor_name",
			"unit"
		].every((e) => e in a), "recovery context fields"), i.push("caseId", "baseRevision", "etag", "review", "context");
	}
	I(Object.keys(n).length === i.length && Object.keys(n).every((e) => i.includes(e)), "recovery fields");
	let a = n;
	return a.kind === "edit" && (Object.freeze(a.review), Object.freeze(a.context)), Object.freeze(a);
}
function kn(e, t) {
	let n = Kt({
		input: e,
		rationale: Ht(t)
	});
	return On({
		version: "case-write-v1",
		id: crypto.randomUUID(),
		apiBase: xt,
		kind: "create",
		body: JSON.stringify(n)
	});
}
function An(e, t, n) {
	I(e.assessment, "supported saved assessment");
	let r = Gt(e.assessment.normalized_input, t.path);
	I(C(r.value, t.prior) && C(n.value, t.prior) && n.path === t.path && !C(t.next, t.prior), "reviewed base input");
	let i = qt({
		field_path: t.path,
		new_value: t.next,
		rationale: Ht(t.rationale)
	});
	return On({
		version: "case-write-v1",
		id: crypto.randomUUID(),
		apiBase: xt,
		kind: "edit",
		body: JSON.stringify(i),
		caseId: e.snapshot.case_id,
		baseRevision: e.snapshot.revision,
		etag: e.etag,
		review: { ...n },
		context: r.context
	});
}
function jn(e, t) {
	try {
		I(e, "browser recovery storage");
		let n = wn(t), r = e.getItem(bn);
		r && I(z(wn(JSON.parse(r)), n), "another unresolved operation");
		let i = JSON.stringify(n);
		I(Dn(i) <= Cn, "recovery journal size"), e.setItem(bn, i), I(e.getItem(bn) === i, "retained in-page recovery record");
	} catch {
		throw Error("This tab could not keep the write for recovery. Nothing was sent. Resolve its pending record or restore in-page recovery tracking before saving.");
	}
}
function Mn(e, t = xt) {
	try {
		if (!e) return {
			operation: null,
			error: "This browser cannot keep a saved write for recovery. Saved reads and unsaved assessment remain available."
		};
		let n = e.getItem(bn);
		return n ? (I(Dn(n) <= Cn, "recovery size"), {
			operation: wn(JSON.parse(n), t),
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
function Nn(e, t) {
	I(e, "browser recovery storage");
	let n = e.getItem(bn);
	n && I(wn(JSON.parse(n)).id === t, "matching recovery record"), e.removeItem(bn), I(e.getItem(bn) === null, "cleared recovery record");
}
function Pn(e) {
	I(e, "browser recovery storage"), e.removeItem(bn), I(e.getItem(bn) === null, "discarded recovery record");
}
function Fn(e) {
	try {
		let t = e?.getItem(xn);
		if (!t || t.length > 500) return null;
		let n = L(JSON.parse(t), "saved selection");
		return I(n.version === "case-selection-v1" && n.apiBase === xt && It(n.caseId) && (n.revision === "latest" || Lt(n.revision)), "saved selection identity"), I(Object.keys(n).length === 4, "saved selection fields"), {
			caseId: n.caseId,
			revision: n.revision
		};
	} catch {
		return null;
	}
}
function In(e, t) {
	try {
		t ? e?.setItem(xn, JSON.stringify({
			version: "case-selection-v1",
			apiBase: xt,
			...t
		})) : e?.removeItem(xn);
	} catch {}
}
//#endregion
//#region src/workspace.ts
var Ln = {
	id: 0,
	accepted: null,
	draft: null,
	filename: "",
	status: "idle",
	error: "",
	history: [],
	saved: null,
	action: "evaluate",
	resetPeriod: !0
}, Rn = "A saved write needs confirmation. Retry the exact write; no proposal is accepted locally yet.";
function zn(e) {
	let t = Mn(e).operation;
	if (t && t.kind !== "comparison") return {
		...Ln,
		status: "unavailable",
		action: "write",
		filename: "Pending saved write",
		error: Rn
	};
	let n = Fn(e)?.caseId ?? (t?.kind === "comparison" ? t.caseId : null);
	return n ? {
		...Ln,
		status: "evaluating",
		action: "open",
		filename: `Saved case ${n}`
	} : Ln;
}
function Bn(e, t) {
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
function Vn(e, t) {
	let n = t.path.split("/").slice(1), r = JSON.parse(JSON.stringify(e)), i = r;
	for (let e of n.slice(0, -1)) i = i[e];
	return i[n[n.length - 1]] = t.next, r;
}
function Hn(e, t) {
	return t === "%" ? `${x(String(e), 2)}%` : t === "months" ? `${e} month${String(e) === "1" ? "" : "s"}` : `$${T(String(e))}`;
}
function Un(e) {
	let { min: t, max: n, unit: r } = e;
	return t !== void 0 && n !== void 0 ? `${Hn(t, r)} to ${Hn(n, r)}` : t === void 0 ? `up to ${Hn(n, r)}` : `${Hn(t, r)} or more`;
}
function Wn(e, t, n, r = {}) {
	let i = e.unit === "%" ? M(t) : e.integer ? ce(t) : ae(t);
	if (!i.ok) throw Error(i.message);
	let a = i.value, o = a;
	if (e.integer) {
		if (!Number.isSafeInteger(Number(a))) throw Error("Enter a safe whole number of months.");
		o = Number(a);
	}
	if (e.min !== void 0 && S(a, String(e.min)) < 0 || e.max !== void 0 && S(a, String(e.max)) > 0) throw Error(`Value is outside the allowed range: ${Un(e)}.`);
	if ((r.requireRationale ?? !0) && !n.trim()) throw Error("A nonblank rationale is required.");
	if (C(o, e.value)) throw Error("Enter a changed value or cancel.");
	return o;
}
//#endregion
//#region src/workspaceDom.ts
var Gn = document;
function Kn(e) {
	Gn = e;
}
function qn(e) {
	return Gn.querySelector(e);
}
function Jn(e) {
	let t = e.getRootNode();
	return t instanceof ShadowRoot ? t.activeElement : document.activeElement;
}
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.min.js
var Yn = /* @__PURE__ */ e(((e) => {
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
})), V = (/* @__PURE__ */ e(((e, t) => {
	t.exports = Yn();
})))();
function Xn(e) {
	e?.isConnected && !(e instanceof HTMLButtonElement && e.disabled) ? e.focus() : qn("[data-focus-fallback]")?.focus();
}
function Zn({ title: e, onCancel: t, restoreFocus: n, children: r }) {
	let i = (0, c.useRef)(null);
	return (0, c.useEffect)(() => {
		let e = i.current;
		return e?.showModal(), () => {
			e?.close(), Xn(n);
		};
	}, [n]), /* @__PURE__ */ (0, V.jsx)("dialog", {
		ref: i,
		"aria-label": e,
		onCancel: (e) => {
			e.preventDefault(), t();
		},
		onKeyDown: (e) => {
			if (e.key !== "Tab") return;
			let t = Array.from(e.currentTarget.querySelectorAll("input:not(:disabled),textarea:not(:disabled),button:not(:disabled)")), n = t[0], r = t[t.length - 1];
			e.shiftKey && Jn(e.currentTarget) === n ? (e.preventDefault(), r?.focus()) : !e.shiftKey && Jn(e.currentTarget) === r && (e.preventDefault(), n?.focus());
		},
		children: r
	});
}
function Qn({ input: e, onSave: t, onCancel: n, restoreFocus: r }) {
	let [i, a] = (0, c.useState)(""), [o, s] = (0, c.useState)("");
	return /* @__PURE__ */ (0, V.jsx)(Zn, {
		title: "Save dated case",
		onCancel: n,
		restoreFocus: r,
		children: /* @__PURE__ */ (0, V.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				try {
					Ht(i), t(i), n();
				} catch (e) {
					s(e instanceof Error ? e.message : String(e));
				}
			},
			children: [
				/* @__PURE__ */ (0, V.jsx)("div", {
					className: "eyebrow",
					children: "SAVE ACCEPTED INPUT"
				}),
				/* @__PURE__ */ (0, V.jsx)("h2", { children: "Save dated case" }),
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					e.borrower_name,
					" · as of ",
					e.assessment_as_of
				] }),
				/* @__PURE__ */ (0, V.jsxs)("label", { children: ["Save rationale", /* @__PURE__ */ (0, V.jsx)("textarea", {
					autoFocus: !0,
					rows: 3,
					value: i,
					onChange: (e) => a(e.target.value)
				})] }),
				/* @__PURE__ */ (0, V.jsx)("p", {
					className: "fine",
					children: "Saving assesses this accepted input under the server's current policy. The returned stored result becomes the accepted result. Earlier session edits are not added to saved history. Rationale: at most 2,000 characters."
				}),
				o && /* @__PURE__ */ (0, V.jsx)("p", {
					role: "alert",
					children: o
				}),
				/* @__PURE__ */ (0, V.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, V.jsx)("button", {
						type: "button",
						onClick: n,
						children: "Cancel"
					}), /* @__PURE__ */ (0, V.jsx)("button", {
						className: "primary",
						type: "submit",
						children: "Save accepted case"
					})]
				})
			]
		})
	});
}
function $n({ onDiscard: e, onCancel: t, restoreFocus: n }) {
	let [r, i] = (0, c.useState)("");
	return /* @__PURE__ */ (0, V.jsxs)(Zn, {
		title: "Discard recovery tracking",
		onCancel: t,
		restoreFocus: n,
		children: [
			/* @__PURE__ */ (0, V.jsx)("h2", { children: "Discard recovery tracking?" }),
			/* @__PURE__ */ (0, V.jsx)("p", { children: "A previous write might already be saved. Discarding this tab's tracking does not undo that write and loses its exact retry key. Check saved cases before creating another case." }),
			r && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "alert",
				children: r
			}),
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, V.jsx)("button", {
					autoFocus: !0,
					onClick: t,
					children: "Keep tracking"
				}), /* @__PURE__ */ (0, V.jsx)("button", {
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
function er({ field: e, onCancel: t, onSubmit: n, restoreFocus: r, saved: i = !1, proposal: a }) {
	let o = (0, c.useRef)(null), [s, l] = (0, c.useState)(be(a?.next ?? e.value, e.unit)), [u, d] = (0, c.useState)(a?.rationale ?? ""), [f, p] = (0, c.useState)("");
	function m(t) {
		try {
			return Wn(e, t, "", { requireRationale: !1 }), "";
		} catch (e) {
			return e instanceof Error ? e.message : "Review this value.";
		}
	}
	return (0, c.useEffect)(() => {
		let e = o.current;
		return e?.showModal(), () => {
			e?.close(), Xn(r);
		};
	}, [r]), /* @__PURE__ */ (0, V.jsx)("dialog", {
		ref: o,
		"aria-labelledby": "edit-title",
		onKeyDown: (e) => {
			if (e.key !== "Tab") return;
			let t = Array.from(e.currentTarget.querySelectorAll("input,textarea,button:not(:disabled)")), n = t[0], r = t[t.length - 1];
			e.shiftKey && Jn(e.currentTarget) === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && Jn(e.currentTarget) === r && (e.preventDefault(), n.focus());
		},
		onCancel: (e) => {
			e.preventDefault(), t();
		},
		children: /* @__PURE__ */ (0, V.jsxs)("form", {
			onSubmit: (t) => {
				t.preventDefault();
				try {
					let t = Wn(e, s, u);
					i && Ht(u), n({
						path: e.path,
						prior: e.value,
						next: t,
						rationale: u.trim(),
						at: (/* @__PURE__ */ new Date()).toISOString()
					});
				} catch (e) {
					p(e instanceof Error ? e.message : String(e));
				}
			},
			children: [
				/* @__PURE__ */ (0, V.jsx)("div", {
					className: "eyebrow",
					children: "INPUT REVIEW"
				}),
				/* @__PURE__ */ (0, V.jsxs)("h2", {
					id: "edit-title",
					children: ["Edit ", e.label]
				}),
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					e.period,
					" · ",
					e.unit,
					/* @__PURE__ */ (0, V.jsx)("br", {}),
					"Current value: ",
					be(e.value, e.unit)
				] }),
				/* @__PURE__ */ (0, V.jsxs)("label", { children: [
					"New value",
					" ",
					/* @__PURE__ */ (0, V.jsx)("input", {
						autoFocus: !0,
						value: s,
						placeholder: e.unit === "%" ? "10.5%" : e.integer ? "120" : "500000.00",
						"aria-describedby": "edit-value-help",
						onBlur: () => p(m(s)),
						onChange: (e) => {
							l(e.target.value), m(e.target.value) || p("");
						},
						inputMode: "decimal"
					})
				] }),
				/* @__PURE__ */ (0, V.jsxs)("small", {
					id: "edit-value-help",
					children: [
						e.unit === "%" ? "Percentage · converted once to a decimal fraction" : e.integer ? "Integer months" : "USD decimal · up to 34 significant digits",
						e.min === void 0 ? "" : ` · minimum ${be(e.min, e.unit)}`,
						e.max === void 0 ? "" : ` · maximum ${be(e.max, e.unit)}`
					]
				}),
				/* @__PURE__ */ (0, V.jsxs)("label", { children: [
					"Rationale",
					" ",
					/* @__PURE__ */ (0, V.jsx)("textarea", {
						value: u,
						placeholder: "Explain the source or reason for this edit",
						onChange: (e) => {
							d(e.target.value), e.target.value.trim() && p("");
						},
						rows: 3
					})
				] }),
				f && /* @__PURE__ */ (0, V.jsx)("p", {
					role: "alert",
					children: f
				}),
				/* @__PURE__ */ (0, V.jsx)("p", {
					className: "fine",
					children: i ? "The edit creates a saved revision only after an accepted server receipt. It uses the server's selected policy; earlier revisions stay unchanged. Rationale: at most 2,000 characters." : "The edit is applied only after a successful backend evaluation."
				}),
				/* @__PURE__ */ (0, V.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, V.jsx)("button", {
						type: "button",
						onClick: t,
						children: "Cancel"
					}), /* @__PURE__ */ (0, V.jsx)("button", {
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
//#region src/components/PagedJson.tsx
function tr({ value: e, className: t, title: n, noun: r }) {
	let i = (0, c.useMemo)(() => {
		let t = new TextEncoder().encode(JSON.stringify(e, null, 2)), n = [], r = new TextDecoder("utf-8", { fatal: !0 });
		for (let e = 0; e < t.length;) {
			let i = Math.min(e + 65536, t.length);
			for (; i < t.length && (t[i] & 192) == 128;) i--;
			n.push(r.decode(t.slice(e, i))), e = i;
		}
		return n;
	}, [e]), [a, o] = (0, c.useState)(0);
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: t,
		children: [
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				n,
				" · page ",
				a + 1,
				" of ",
				i.length,
				" · up to 64 KiB of UTF-8 text per page"
			] }),
			/* @__PURE__ */ (0, V.jsx)("pre", { children: i[a] }),
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, V.jsxs)("button", {
					disabled: a === 0,
					onClick: () => o(a - 1),
					children: [
						"Previous ",
						r,
						" page"
					]
				}), /* @__PURE__ */ (0, V.jsxs)("button", {
					disabled: a + 1 === i.length,
					onClick: () => o(a + 1),
					children: [
						"Next ",
						r,
						" page"
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/metricDisplay.ts
function nr(e) {
	if (e.status === "not_applicable") return "Not applicable";
	let t = e.reported_value ?? e.raw_value;
	return y(t) ? `${w(t, e.display_precision ?? 0)} ${e.unit}` : String(t);
}
//#endregion
//#region src/storageAvailability.ts
var rr = /* @__PURE__ */ new Set(), ir = !1;
function ar(e) {
	ir !== !e && (ir = !e, rr.forEach((e) => e()));
}
var or = () => ir, sr = (e) => (rr.add(e), () => {
	rr.delete(e);
}), cr = class extends Error {
	status;
	code;
	certain;
	retryAfter;
	fieldErrors;
	constructor(e, t = 0, n = "outcome_uncertain", r = !1, i = null, a = []) {
		super(e), this.status = t, this.code = n, this.certain = r, this.retryAfter = i, this.fieldErrors = a, this.name = "CaseApiError";
	}
};
function lr(e) {
	return e instanceof cr ? e : new cr(e instanceof Error ? e.message : String(e));
}
async function ur(e, t, n) {
	let r;
	try {
		r = await At(e, t, n);
	} catch {
		throw new cr("The response was lost or unavailable. Retry the exact saved write if one is pending.");
	}
	let i;
	try {
		i = await r.json();
	} catch {
		throw new cr(`Saved-case service returned an unreadable response (${r.status}).`, r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null, t = "request_failed", n = `Saved-case request failed (${r.status}).`;
		throw e && typeof e == "object" && !Array.isArray(e) ? ("code" in e && typeof e.code == "string" && (t = e.code), "message" in e && typeof e.message == "string" && (n = e.message)) : typeof e == "string" ? n = e : Array.isArray(e) && (n = e.map((e) => e && typeof e == "object" ? `${Array.isArray(e.loc) ? e.loc.join(".") : "input"}: ${String(e.msg ?? "Invalid input")}` : "Invalid input").join("; ")), t === "storage_not_configured" && ar(!1), t === "storage_not_configured" && (n = "Saved cases are not enabled for this local workspace. You can continue with unsaved assessments."), new cr(n, r.status, t, [
			400,
			404,
			412,
			413,
			422,
			428
		].includes(r.status), r.headers.get("Retry-After"), Mt(i, e));
	}
	return ar(!0), {
		response: r,
		body: i
	};
}
function dr(e, t) {
	return I(It(e) && (t === "latest" || Lt(t)), "requested case/revision"), `/cases/${encodeURIComponent(e)}${t === "latest" ? "" : `/revisions/${t}`}`;
}
async function fr(e, t, n, r = fetch) {
	let { response: i, body: a } = await ur(dr(e, t), { signal: n }, r), o = Jt(a, i.headers.get("ETag"));
	return I(o.snapshot.case_id === e && (t === "latest" || o.snapshot.revision === t), "requested snapshot identity"), o;
}
async function pr(e, t, n = fetch) {
	let r = On(e), i = {
		"Content-Type": "application/json",
		"Idempotency-Key": r.id
	};
	r.kind === "edit" && (i["If-Match"] = r.etag);
	let { response: a, body: o } = await ur(r.kind === "create" ? "/cases" : `${dr(r.caseId, "latest")}/revisions`, {
		method: "POST",
		headers: i,
		body: r.body,
		signal: t
	}, n);
	try {
		I(a.status === 201 && ["true", "false"].includes(a.headers.get("Idempotency-Replayed") ?? ""), "accepted receipt status/replay header");
		let e = Jt(o, a.headers.get("ETag")), t = e.snapshot;
		if (r.kind === "create") {
			let e = Kt(JSON.parse(r.body));
			I(t.revision === 1 && t.event.kind === "creation" && t.event.rationale === e.rationale && z(t.normalized_input, e.input), "creation receipt command");
		} else {
			let e = qt(JSON.parse(r.body));
			I(t.case_id === r.caseId && t.parent_revision === r.baseRevision && t.revision === r.baseRevision + 1 && t.event.field_path === e.field_path && t.event.after === e.new_value && t.event.before === r.review.value && t.event.rationale === e.rationale && z(t.event.context, r.context), "edit receipt command"), I(Gt(t.normalized_input, e.field_path).value === e.new_value, "accepted edited input");
		}
		return {
			view: e,
			replayed: a.headers.get("Idempotency-Replayed") === "true"
		};
	} catch (e) {
		throw new cr(`The write may be saved, but its receipt could not be verified: ${e instanceof Error ? e.message : String(e)}`, a.status);
	}
}
var mr = (e) => `?${new URLSearchParams({
	limit: "25",
	...e ? { after: e } : {}
})}`;
async function hr(e, t, n = fetch, r = {}) {
	let { body: i } = await ur(`/cases?${new URLSearchParams({
		limit: "25",
		...e ? { after: e } : {},
		...r.q ? { q: r.q } : {},
		...r.outcome ? { outcome: r.outcome } : {},
		...r.sort && r.sort !== "created" ? { sort: r.sort } : {}
	})}`, { signal: t }, n);
	return Qt(i);
}
async function gr(e, t, n, r = fetch) {
	let { body: i } = await ur(`${dr(e, "latest")}/revisions${mr(t)}`, { signal: n }, r);
	return $t(i, e);
}
async function _r(e, t, n = fetch) {
	let { body: r } = await ur(`${dr(e.snapshot.case_id, e.snapshot.revision)}/replay`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
		signal: t
	}, n);
	return en(r, e);
}
//#endregion
//#region src/SavedCases.tsx
function vr(e, t, n) {
	let r = {
		key: e,
		items: [],
		next: null,
		loading: !0,
		error: ""
	}, [i, a] = (0, c.useState)(r), o = (0, c.useRef)(e);
	o.current = e;
	let s = (0, c.useRef)(t);
	s.current = t;
	let l = (0, c.useRef)(null), u = (0, c.useRef)(0), d = (0, c.useRef)(/* @__PURE__ */ new Set());
	async function f(t) {
		if (t && l.current) return;
		t || (l.current?.abort(), d.current.clear());
		let i = new AbortController();
		l.current = i;
		let c = ++u.current, f = e, p = s.current;
		a((e) => t ? {
			...e,
			loading: !0,
			error: ""
		} : r);
		try {
			let e = await p(t, i.signal);
			if (f !== o.current || c !== u.current || i.signal.aborted) return;
			if (e.next_cursor && (e.next_cursor === t || d.current.has(e.next_cursor))) throw Error("Saved pagination returned a repeated cursor. Refresh the list.");
			e.next_cursor && d.current.add(e.next_cursor), a((r) => {
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
			f === o.current && c === u.current && !i.signal.aborted && a((t) => ({
				...t,
				loading: !1,
				error: lr(e).message
			}));
		} finally {
			l.current === i && (l.current = null);
		}
	}
	return (0, c.useEffect)(() => (f(null), () => {
		u.current++, l.current?.abort(), l.current = null;
	}), [e]), {
		...i.key === e ? i : r,
		refresh: () => void f(null),
		more: () => {
			i.next && f(i.next);
		}
	};
}
function yr({ onOpen: e, onClose: t }) {
	let [n, r] = (0, c.useState)(""), [i, a] = (0, c.useState)(""), [o, s] = (0, c.useState)(""), [l, u] = (0, c.useState)("created");
	(0, c.useEffect)(() => {
		let e = setTimeout(() => a(n.trim()), 200);
		return () => clearTimeout(e);
	}, [n]);
	let d = !!(i || o || l !== "created"), f = vr(`cases:${i}:${o}:${l}`, (e, t) => hr(e, t, fetch, {
		q: i,
		outcome: o,
		sort: l
	}), (e) => e.case_id);
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel caseList",
		"aria-label": "Saved cases",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Saved cases" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "Newest creations first · local saved assessments" })] }), /* @__PURE__ */ (0, V.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, V.jsx)("button", {
						onClick: f.refresh,
						children: "Refresh saved cases"
					}), /* @__PURE__ */ (0, V.jsx)("button", {
						onClick: t,
						children: "Close saved cases"
					})]
				})]
			}),
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "caseFilters",
				children: [
					/* @__PURE__ */ (0, V.jsxs)("label", { children: [
						"Search saved cases",
						/* @__PURE__ */ (0, V.jsx)("input", {
							"aria-label": "Search saved cases",
							value: n,
							maxLength: 120,
							placeholder: "Borrower name",
							onChange: (e) => r(e.target.value)
						}),
						/* @__PURE__ */ (0, V.jsx)("small", { children: "Literal borrower-name search · ASCII case-insensitive" })
					] }),
					/* @__PURE__ */ (0, V.jsxs)("label", { children: ["Filter by outcome", /* @__PURE__ */ (0, V.jsxs)("select", {
						"aria-label": "Filter by outcome",
						value: o,
						onChange: (e) => s(e.target.value),
						children: [
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "",
								children: "All outcomes"
							}),
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "approve",
								children: "Approve"
							}),
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "review",
								children: "Review"
							}),
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "decline",
								children: "Decline"
							})
						]
					})] }),
					/* @__PURE__ */ (0, V.jsxs)("label", { children: ["Sort saved cases", /* @__PURE__ */ (0, V.jsxs)("select", {
						"aria-label": "Sort saved cases",
						value: l,
						onChange: (e) => u(e.target.value),
						children: [/* @__PURE__ */ (0, V.jsx)("option", {
							value: "created",
							children: "Newest creation"
						}), /* @__PURE__ */ (0, V.jsx)("option", {
							value: "updated",
							children: "Latest update"
						})]
					})] })
				]
			}),
			f.loading && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "status",
				children: "Loading saved cases…"
			}),
			f.error && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "alert",
				children: f.error
			}),
			!f.loading && !f.error && !f.items.length && /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("p", { children: d ? "No saved cases match these filters." : "No saved cases yet. Save an accepted dated assessment to begin." }), d && /* @__PURE__ */ (0, V.jsx)("button", {
				type: "button",
				onClick: () => {
					r(""), a(""), s(""), u("created");
				},
				children: "Clear filters"
			})] }),
			f.items.map((t) => /* @__PURE__ */ (0, V.jsxs)("article", {
				className: "caseRow",
				children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [
					/* @__PURE__ */ (0, V.jsx)("h3", { children: t.borrower_name }),
					/* @__PURE__ */ (0, V.jsx)("code", { children: t.case_id }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Created ",
						t.created_at,
						" · Revision ",
						t.revision,
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Last recorded ",
						t.recorded_at
					] }),
					t.definition_supported !== void 0 && /* @__PURE__ */ (0, V.jsx)("p", { children: t.definition_supported ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
						t.outcome?.toUpperCase(),
						" · DSCR",
						" ",
						t.dscr ?? "Unavailable",
						" · requested",
						" ",
						t.requested_amount === null || t.requested_amount === void 0 ? "Unavailable" : `$${w(t.requested_amount, 2)}`,
						" ",
						"· as of ",
						t.assessment_as_of
					] }) : "Archived definition · original JSON only" })
				] }), /* @__PURE__ */ (0, V.jsx)("button", {
					"aria-label": `Open ${t.borrower_name} case ${t.case_id}`,
					onClick: () => e({
						caseId: t.case_id,
						revision: "latest"
					}),
					children: "Open case"
				})]
			}, t.case_id)),
			f.next && /* @__PURE__ */ (0, V.jsx)("button", {
				disabled: f.loading,
				onClick: f.more,
				children: "Load more saved cases"
			})
		]
	});
}
function br({ saved: e, active: t, onOpen: n }) {
	let r = e.view.snapshot, i = t ? e.selection === "latest" ? `Revision ${r.revision} · Latest when fetched` : e.selection === "revision" ? `Historical revision ${r.revision}` : `Acknowledged revision ${r.revision} · Latest unconfirmed` : `Previous saved revision ${r.revision} (inactive)`;
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "savedContext",
		"aria-label": "Saved revision context",
		children: [
			/* @__PURE__ */ (0, V.jsx)("strong", { children: i }),
			/* @__PURE__ */ (0, V.jsxs)("span", { children: [
				"Case ",
				/* @__PURE__ */ (0, V.jsx)("code", { children: r.case_id }),
				" · Run ",
				/* @__PURE__ */ (0, V.jsx)("code", { children: r.run_id })
			] }),
			/* @__PURE__ */ (0, V.jsxs)("span", { children: [
				"Recorded ",
				r.recorded_at,
				" · assessment as of",
				" ",
				r.event.context.assessment_as_of,
				e.headRevision !== null && e.headRevision > r.revision ? ` · Latest known revision ${e.headRevision}` : ""
			] }),
			/* @__PURE__ */ (0, V.jsx)("button", {
				onClick: () => n({
					caseId: r.case_id,
					revision: "latest"
				}),
				children: "Open latest"
			})
		]
	});
}
function xr({ view: e }) {
	let t = e.snapshot;
	return /* @__PURE__ */ (0, V.jsxs)("details", { children: [
		/* @__PURE__ */ (0, V.jsx)("summary", { children: "Stored run and recording metadata" }),
		/* @__PURE__ */ (0, V.jsxs)("p", { children: [
			"Original run ",
			t.run_id,
			" · recorded ",
			t.recorded_at
		] }),
		/* @__PURE__ */ (0, V.jsxs)("p", { children: [
			"Source status: ",
			t.recording.source_status,
			" ",
			t.recording.source_revision ?? "· exact build revision not supplied"
		] }),
		/* @__PURE__ */ (0, V.jsx)("p", { children: "Stored hashes are local consistency identifiers; they do not authenticate documents or people." }),
		/* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify({
			input_hash: t.input_hash,
			payload_hash: t.payload_hash,
			storage_serialization_version: t.storage_serialization_version,
			recording: t.recording
		}, null, 2) })
	] });
}
function Sr({ saved: e, active: t, onOpen: n }) {
	let r = e.view, i = r.snapshot, a = i.event, o = vr(`${i.case_id}:${i.revision}`, (e, t) => gr(i.case_id, e, t), (e) => String(e.revision)), [s, l] = (0, c.useState)({
		key: i.run_id,
		result: null,
		error: "",
		loading: !1
	}), u = (0, c.useRef)(null), d = (0, c.useRef)(i.run_id);
	d.current = i.run_id, (0, c.useEffect)(() => (l({
		key: i.run_id,
		result: null,
		error: "",
		loading: !1
	}), () => {
		u.current?.abort(), u.current = null;
	}), [i.run_id]);
	async function f() {
		if (u.current) return;
		let e = new AbortController();
		u.current = e;
		let t = i.run_id;
		l({
			key: t,
			result: null,
			error: "",
			loading: !0
		});
		try {
			let n = await _r(r, e.signal);
			d.current === t && !e.signal.aborted && l({
				key: t,
				result: n,
				error: "",
				loading: !1
			});
		} catch (n) {
			d.current === t && !e.signal.aborted && l({
				key: t,
				result: null,
				error: lr(n).message,
				loading: !1
			});
		} finally {
			u.current === e && (u.current = null);
		}
	}
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel historyPanel",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Saved revision history" }), /* @__PURE__ */ (0, V.jsx)("button", {
					onClick: o.refresh,
					children: "Refresh revisions"
				})]
			}),
			!t && /* @__PURE__ */ (0, V.jsx)("p", { children: "Previous saved selection; its recommendation is inactive." }),
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				"Original accepted revisions and server-recorded events. Recorded actor:",
				" ",
				a.actor,
				".",
				a.actor === "prototype-demo-unverified" ? " Archived demonstration identity." : " Configured credential identity."
			] }),
			o.loading && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "status",
				children: "Loading revisions…"
			}),
			o.error && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "alert",
				children: o.error
			}),
			/* @__PURE__ */ (0, V.jsx)("div", {
				className: "revisionList",
				children: o.items.map((e) => /* @__PURE__ */ (0, V.jsxs)("article", {
					className: "caseRow",
					children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsxs)("strong", { children: ["Revision ", e.revision] }), /* @__PURE__ */ (0, V.jsxs)("p", { children: [
						e.rationale,
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						e.recorded_at,
						" · Run ",
						e.run_id
					] })] }), /* @__PURE__ */ (0, V.jsxs)("button", {
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
			o.next && /* @__PURE__ */ (0, V.jsx)("button", {
				disabled: o.loading,
				onClick: o.more,
				children: "Load more revisions"
			}),
			/* @__PURE__ */ (0, V.jsxs)("article", {
				className: "savedEvent",
				"aria-label": "Selected recorded event",
				children: [
					/* @__PURE__ */ (0, V.jsxs)("h3", { children: ["Selected recorded event · revision ", i.revision] }),
					/* @__PURE__ */ (0, V.jsx)("strong", { children: a.kind === "creation" ? "Case creation" : a.field_path }),
					a.kind === "edit" && /* @__PURE__ */ (0, V.jsxs)("p", { children: [
						a.before,
						" → ",
						a.after,
						" · ",
						a.context.unit
					] }),
					/* @__PURE__ */ (0, V.jsx)("p", { children: a.rationale }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						a.context.basis,
						" · as of ",
						a.context.assessment_as_of,
						a.context.period_start ? ` · ${a.context.period_start} – ${a.context.period_end}` : "",
						a.context.guarantor_name === null ? "" : ` · Guarantor ${a.context.guarantor_index}: ${a.context.guarantor_name}`
					] }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Recorded ",
						a.recorded_at,
						" · ",
						a.actor
					] })
				]
			}),
			/* @__PURE__ */ (0, V.jsx)("div", {
				className: "actions",
				children: /* @__PURE__ */ (0, V.jsx)("button", {
					disabled: s.loading,
					onClick: () => void f(),
					children: "Check replay"
				})
			}),
			s.key === i.run_id && /* @__PURE__ */ (0, V.jsx)("div", {
				className: "replayResult",
				role: "status",
				children: s.loading ? "Checking the retained policy and definition…" : s.error || (s.result ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
					/* @__PURE__ */ (0, V.jsx)("strong", { children: {
						matched: "Matched",
						mismatch: "Mismatch",
						replay_unavailable: "Replay unavailable"
					}[s.result.status] }),
					/* @__PURE__ */ (0, V.jsx)("p", { children: s.result.explanation }),
					s.result.differences.length > 0 && /* @__PURE__ */ (0, V.jsx)("ul", { children: s.result.differences.map((e) => /* @__PURE__ */ (0, V.jsx)("li", { children: e }, e)) })
				] }) : "Replay is read-only; the original result stays selected.")
			}),
			/* @__PURE__ */ (0, V.jsx)(xr, { view: r })
		]
	});
}
function Cr({ operation: e }) {
	let t = JSON.parse(e.body);
	return e.kind === "comparison" ? /* @__PURE__ */ (0, V.jsxs)("p", { children: [
		"Proposed comparison · Case ",
		e.caseId,
		" · revision",
		" ",
		e.baselineRevision,
		/* @__PURE__ */ (0, V.jsx)("br", {}),
		"Run ",
		e.baselineRunId,
		" · as of",
		" ",
		e.context.assessment_as_of,
		/* @__PURE__ */ (0, V.jsx)("br", {}),
		t.scenarios.map((e) => `${e.name}: ${e.rationale}`).join("; ")
	] }) : e.kind === "edit" ? /* @__PURE__ */ (0, V.jsxs)("p", { children: [
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
		/* @__PURE__ */ (0, V.jsx)("br", {}),
		"Rationale: ",
		t.rationale
	] }) : /* @__PURE__ */ (0, V.jsxs)("p", { children: [
		"Proposed creation: ",
		t.input.borrower_name,
		" · as of",
		" ",
		t.input.assessment_as_of,
		/* @__PURE__ */ (0, V.jsx)("br", {}),
		"Rationale: ",
		t.rationale
	] });
}
function wr({ workspace: e, onDiscard: t, onReview: n, onOpenComparison: r }) {
	let [i, a] = (0, c.useState)("");
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
		e.notice && /* @__PURE__ */ (0, V.jsx)("p", {
			className: "writeNotice",
			role: "status",
			children: e.notice
		}),
		(e.operation || e.recoveryError) && /* @__PURE__ */ (0, V.jsxs)("section", {
			className: "pending",
			"aria-label": "Saved write recovery",
			children: [
				/* @__PURE__ */ (0, V.jsx)("h2", { children: e.inFlight ? e.operation?.kind === "comparison" ? "Saving comparison" : "Saving revision" : e.operation ? "Unconfirmed saved write" : "Saved write recovery unavailable" }),
				!e.inFlight && e.operation && /* @__PURE__ */ (0, V.jsxs)("p", {
					className: "recoveryState",
					children: [/* @__PURE__ */ (0, V.jsx)("strong", { children: e.writeError?.status === 409 ? "Conflicting operation key (409)" : "Unresolved browser tracking" }), e.writeError?.status === 409 ? " · Inspect saved records before explicitly discarding or creating a new operation key." : " · A timeout, network drop, or credential rejection does not prove the write rolled back."]
				}),
				e.operation && /* @__PURE__ */ (0, V.jsx)(Cr, { operation: e.operation }),
				e.operation && /* @__PURE__ */ (0, V.jsxs)("details", { children: [
					/* @__PURE__ */ (0, V.jsx)("summary", { children: "Inspect pending payload" }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Exact operation UUID: ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.operation.id }),
						e.operation.kind === "edit" && /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Original strong ETag: ",
							/* @__PURE__ */ (0, V.jsx)("code", { children: e.operation.etag })
						] })
					] }),
					/* @__PURE__ */ (0, V.jsx)(tr, {
						value: JSON.parse(e.operation.body),
						title: "Pending command JSON",
						noun: "payload",
						className: "pendingPayload"
					})
				] }),
				/* @__PURE__ */ (0, V.jsx)("p", {
					className: "fine",
					children: "Tracking is held only in page memory. Reloading or closing this page loses the exact retry key; inspect saved records before making another write."
				}),
				/* @__PURE__ */ (0, V.jsx)("p", { children: e.recoveryError || e.writeError?.message || "This tab keeps the original command for exact retry. No new accepted event is recorded until the receipt is verified." }),
				e.writeError?.retryAfter && /* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Retry after ",
					e.writeError.retryAfter,
					" second(s)."
				] }),
				/* @__PURE__ */ (0, V.jsxs)("div", {
					className: "actions",
					children: [
						e.operation && /* @__PURE__ */ (0, V.jsx)("button", {
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
						e.operation?.kind === "edit" && /* @__PURE__ */ (0, V.jsx)("button", {
							onClick: () => void e.openSaved({
								caseId: e.operation.caseId,
								revision: e.operation.baseRevision
							}),
							children: "View stored baseline"
						}),
						e.operation?.kind === "comparison" && /* @__PURE__ */ (0, V.jsx)("button", {
							onClick: () => {
								e.operation?.kind === "comparison" && e.openSaved({
									caseId: e.operation.caseId,
									revision: e.operation.baselineRevision
								});
							},
							children: "View stored baseline"
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							disabled: e.inFlight,
							onClick: (e) => t(e.currentTarget),
							children: "Review discarding tracking"
						})
					]
				}),
				i && /* @__PURE__ */ (0, V.jsx)("p", {
					role: "alert",
					children: i
				})
			]
		}),
		e.conflict && /* @__PURE__ */ (0, V.jsxs)("section", {
			className: "pending conflict",
			"aria-label": "Conflicting saved edit",
			children: [
				/* @__PURE__ */ (0, V.jsx)("h2", { children: "Review conflicting edit" }),
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [/* @__PURE__ */ (0, V.jsx)("strong", { children: "Stale strong ETag (412)" }), " · The stored revision changed before this new operation was accepted."] }),
				/* @__PURE__ */ (0, V.jsx)(Cr, { operation: e.conflict.operation }),
				/* @__PURE__ */ (0, V.jsx)("p", { children: "The case changed. Nothing from this proposal was accepted. Review the latest field before submitting a fresh revision." }),
				e.conflict.latest ? /* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Latest stored value:",
					" ",
					Gt(e.conflict.latest.snapshot.normalized_input, e.conflict.operation.review.path).value,
					" ",
					"· Revision ",
					e.conflict.latest.snapshot.revision
				] }) : /* @__PURE__ */ (0, V.jsx)("p", {
					role: "status",
					children: e.conflict.error || "Loading latest for review…"
				}),
				/* @__PURE__ */ (0, V.jsxs)("details", { children: [
					/* @__PURE__ */ (0, V.jsx)("summary", { children: "Inspect pending edits vs. latest revision" }),
					/* @__PURE__ */ (0, V.jsx)(Cr, { operation: e.conflict.operation }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Latest revision:",
						" ",
						e.conflict.latest?.snapshot.revision ?? "Not loaded",
						". Latest field:",
						" ",
						e.conflict.latest ? String(Gt(e.conflict.latest.snapshot.normalized_input, e.conflict.operation.review.path).value) : "Unavailable"
					] })
				] }),
				/* @__PURE__ */ (0, V.jsxs)("div", {
					className: "actions",
					children: [
						/* @__PURE__ */ (0, V.jsx)("button", {
							disabled: !e.conflict.latest || !!e.operation,
							onClick: (e) => n(e.currentTarget),
							children: "Review proposed edit"
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							onClick: e.refreshConflict,
							children: "Refresh conflict baseline"
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							onClick: () => {
								e.conflict && e.openSaved({
									caseId: e.conflict.operation.caseId,
									revision: "latest"
								});
							},
							children: "Reload latest revision"
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							onClick: e.cancelConflict,
							children: "Cancel proposal"
						})
					]
				})
			]
		}),
		e.rejected && /* @__PURE__ */ (0, V.jsxs)("section", {
			className: "pending",
			children: [
				/* @__PURE__ */ (0, V.jsx)("h2", { children: "Rejected saved proposal" }),
				/* @__PURE__ */ (0, V.jsx)(Cr, { operation: e.rejected }),
				/* @__PURE__ */ (0, V.jsx)("p", { children: e.writeError?.message }),
				/* @__PURE__ */ (0, V.jsx)("button", {
					onClick: e.dismissRejected,
					children: "Dismiss rejected proposal"
				})
			]
		}),
		e.offer && /* @__PURE__ */ (0, V.jsxs)("section", {
			className: "pending",
			children: [
				/* @__PURE__ */ (0, V.jsx)("h2", { children: "Write acknowledged for another selection" }),
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Case ",
					e.offer.snapshot.case_id,
					" · revision",
					" ",
					e.offer.snapshot.revision,
					". The current selection was preserved."
				] }),
				/* @__PURE__ */ (0, V.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, V.jsx)("button", {
						onClick: () => {
							e.offer && e.openSaved({
								caseId: e.offer.snapshot.case_id,
								revision: e.offer.snapshot.revision
							}), e.dismissOffer();
						},
						children: "Open acknowledged revision"
					}), /* @__PURE__ */ (0, V.jsx)("button", {
						onClick: e.dismissOffer,
						children: "Dismiss acknowledgment"
					})]
				})
			]
		}),
		e.comparisonAck && (e.comparisonAck.scope !== e.state.id || e.comparisonAck.view.record.case_id !== e.state.saved?.view.snapshot.case_id || e.comparisonAck.view.record.baseline_revision !== e.state.saved?.view.snapshot.revision) && /* @__PURE__ */ (0, V.jsxs)("section", {
			className: "pending",
			"aria-label": "Comparison acknowledged for another selection",
			children: [
				/* @__PURE__ */ (0, V.jsx)("h2", { children: "Comparison acknowledged for another selection" }),
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Original comparison ",
					e.comparisonAck.view.record.comparison_id,
					" · baseline revision ",
					e.comparisonAck.view.record.baseline_revision,
					". The current selection was preserved."
				] }),
				/* @__PURE__ */ (0, V.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, V.jsx)("button", {
						onClick: () => {
							e.comparisonAck && r(e.comparisonAck.view);
						},
						children: "Open acknowledged comparison"
					}), /* @__PURE__ */ (0, V.jsx)("button", {
						onClick: e.dismissComparisonAck,
						children: "Dismiss comparison acknowledgment"
					})]
				})
			]
		})
	] });
}
var Tr = /* @__PURE__ */ new Set([
	"preview_changed",
	"storage_upgrade_required",
	"baseline_run_mismatch",
	"baseline_unsupported",
	"baseline_replay_mismatch",
	"baseline_replay_unavailable"
]);
function Er(e) {
	return I(It(e), "comparison case locator"), `/cases/${encodeURIComponent(e)}`;
}
function Dr(e, t) {
	return I(Lt(t), "comparison revision locator"), `${Er(e)}/revisions/${t}`;
}
async function Or(e, t = "Comparison") {
	let n = e.body?.getReader();
	if (!n) throw Error("Missing response body");
	let r = [], i = new TextDecoder("utf-8", { fatal: !0 }), a = 0;
	try {
		for (;;) {
			let { value: e, done: i } = await n.read();
			if (i) break;
			if (a += e.byteLength, a > 16777216) throw Error(`${t} response exceeds 16 MiB`);
			r.push(e);
		}
	} catch (e) {
		throw await n.cancel().catch(() => {}), e;
	} finally {
		n.releaseLock();
	}
	let o = new Uint8Array(a), s = 0;
	for (let e of r) o.set(e, s), s += e.byteLength;
	return JSON.parse(i.decode(o));
}
async function kr(e, t, n) {
	let r;
	try {
		r = await At(e, t, n);
	} catch {
		throw new cr("The comparison response was lost or unavailable. Keep and retry the exact pending save if one exists.");
	}
	let i;
	try {
		i = await Or(r);
	} catch (e) {
		throw new cr(`Comparison response could not be read: ${e instanceof Error ? e.message : String(e)}.`, r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null, t = "request_failed", n = `Comparison request failed (${r.status}).`, a = !1;
		e && typeof e == "object" && !Array.isArray(e) && "code" in e && typeof e.code == "string" && "message" in e && typeof e.message == "string" ? (t = e.code, n = e.message, a = !0) : Array.isArray(e) && (n = e.map((e) => e && typeof e == "object" && "msg" in e ? String(e.msg) : "Invalid scenario input").join("; "), a = !0);
		let o = a && ([
			400,
			404,
			413,
			422
		].includes(r.status) || r.status === 409 && Tr.has(t));
		throw new cr(n, r.status, t, o, r.headers.get("Retry-After"), Mt(i, e));
	}
	return {
		response: r,
		body: i
	};
}
function Ar(e) {
	let t = ln(e), n = JSON.stringify(t);
	return I(new TextEncoder().encode(n).length <= 1e6, "scenario request byte limit"), n;
}
async function jr(e, t, n, r = fetch) {
	I(t.schema_version === "commercial-scenario-preview-v2", "preview command version");
	let { response: i, body: a } = await kr(`${Dr(e.snapshot.case_id, e.snapshot.revision)}/scenarios/preview`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: Ar(t),
		signal: n
	}, r);
	return I(i.status === 200, "preview status"), hn(a, e, t);
}
async function Mr(e, t, n = fetch) {
	let r = wn(e);
	I(r.kind === "comparison", "comparison operation kind");
	let { response: i, body: a } = await kr(`${Dr(r.caseId, r.baselineRevision)}/scenario-comparisons`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Idempotency-Key": r.id
		},
		body: r.body,
		signal: t
	}, n);
	try {
		I(i.status === 201 && ["true", "false"].includes(i.headers.get("Idempotency-Replayed") ?? ""), "retained receipt status/replay");
		let e = vn(a, i.headers.get("ETag")), t = e.record, n = t.preview, o = ln(JSON.parse(r.body));
		I(t.case_id === r.caseId && t.baseline_revision === r.baselineRevision && t.baseline_run_id === r.baselineRunId && z(un(n).scenarios, o.scenarios), "original receipt command/baseline");
		let s = n.baseline, c = n.fingerprint;
		return I(s.payload_hash === r.baselinePayloadHash && c.value === o.expected_preview_fingerprint && i.headers.get("Location") === `${Er(t.case_id)}/scenario-comparisons/${t.comparison_id}`, "original receipt fingerprint/location"), {
			view: e,
			replayed: i.headers.get("Idempotency-Replayed") === "true"
		};
	} catch (e) {
		throw new cr(`The comparison may be saved, but its receipt could not be verified: ${e instanceof Error ? e.message : String(e)}`, i.status);
	}
}
async function Nr(e, t, n, r = fetch) {
	I(It(t), "comparison locator");
	let { response: i, body: a } = await kr(`${Er(e)}/scenario-comparisons/${encodeURIComponent(t)}`, { signal: n }, r);
	I(i.status === 200, "original comparison status");
	let o = vn(a, i.headers.get("ETag"));
	return I(o.record.case_id === e && o.record.comparison_id === t, "requested original comparison"), o;
}
async function Pr(e, t, n, r = fetch) {
	I(t === null || /^[A-Za-z0-9_-]{1,512}$/.test(t), "comparison cursor");
	let i = new URLSearchParams({
		limit: "25",
		...t ? { after: t } : {}
	}), { response: a, body: o } = await kr(`${Er(e)}/scenario-comparisons?${i}`, { signal: n }, r);
	return I(a.status === 200, "comparison page status"), yn(o, e);
}
//#endregion
//#region src/scenarioSelection.ts
var Fr = "spreadline.comparison-selection.v1";
function Ir(e) {
	try {
		let t = En()?.getItem(Fr);
		if (!t || t.length > 500) return null;
		let n = JSON.parse(t);
		return Object.keys(n).length !== 4 || n.version !== "comparison-selection-v1" || n.apiBase !== xt || n.caseId !== e || !It(n.comparisonId) ? null : n.comparisonId;
	} catch {
		return null;
	}
}
function Lr(e, t) {
	try {
		let n = En();
		t === null ? n?.removeItem(Fr) : It(e) && It(t) && n?.setItem(Fr, JSON.stringify({
			version: "comparison-selection-v1",
			apiBase: xt,
			caseId: e,
			comparisonId: t
		}));
	} catch {}
}
//#endregion
//#region src/useScenarioWorkspace.ts
var Rr = {
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
function zr(e) {
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
function Br(e) {
	let { state: t } = e, n = t.status === "ready" ? t.saved?.view ?? null : null, r = n?.snapshot, i = `${t.id}:${t.status}:${r?.case_id ?? ""}:${r?.revision ?? ""}:${r?.run_id ?? ""}:${r?.payload_hash ?? ""}`, a = (0, c.useRef)(i);
	a.current = i;
	let o = (0, c.useRef)(0), s = (0, c.useRef)(null), l = (0, c.useRef)(null), u = (0, c.useRef)(0), [d, f] = (0, c.useState)({
		context: i,
		rows: [zr(1)]
	}), [p, m] = (0, c.useState)(null), h = (0, c.useRef)(p);
	h.current = p;
	let [g, _] = (0, c.useState)(!1), [v, y] = (0, c.useState)(""), [b, x] = (0, c.useState)([]), [S, C] = (0, c.useState)({
		context: i,
		loading: !1,
		error: "",
		view: null
	}), [ee, w] = (0, c.useState)(0), te = (0, c.useRef)(0), ne = (0, c.useRef)(null), T = (0, c.useRef)(0), E = d.context === i ? d.rows : [], D = p?.context === i ? p : null, O = S.context === i ? S : {
		context: i,
		loading: !1,
		error: "",
		view: null
	}, k = !!n?.assessment, re = !!(e.operation || e.recoveryError || e.conflict || e.inFlight), A = e.inFlight && e.operation?.kind === "comparison", ie = A || !!O.view || O.loading;
	function j() {
		o.current++, s.current?.abort(), s.current = null, h.current = null, m(null), _(!1), y(""), x([]), e.clearComparisonError();
	}
	function ae(e, t) {
		ie || (j(), f((n) => ({
			context: i,
			rows: n.rows.map((n) => n.key === e ? t(n) : n)
		})));
	}
	function oe() {
		if (ie || E.length >= 10) return null;
		j();
		let e = zr(E.length + 1);
		return f({
			context: i,
			rows: [...E, e]
		}), e.key;
	}
	function M(e) {
		ie || E.length <= 1 || (j(), f({
			context: i,
			rows: E.filter((t) => t.key !== e)
		}));
	}
	function se(e, t) {
		ae(e, (e) => {
			let n = Rr[t];
			return n ? {
				...e,
				preset: t,
				name: n.name,
				shocks: Object.fromEntries(tn.map((e, t) => [e, n.values[t]]))
			} : {
				...e,
				preset: "custom"
			};
		});
	}
	async function ce() {
		if (!n || !k || ie) return;
		j();
		let e = o.current, t = i, r = new AbortController();
		s.current = r;
		try {
			let i = ln({
				schema_version: "commercial-scenario-preview-v2",
				baseline_run_id: n.snapshot.run_id,
				scenarios: E.map((e) => ({
					scenario_key: e.key,
					name: on(e.name, 120),
					rationale: on(e.rationale, 2e3),
					assumptions: Object.fromEntries(tn.map((t) => [t, sn(e.shocks[t], t !== "proposed_rate_change_bps")]))
				}))
			});
			_(!0);
			let s = await jr(n, i, r.signal);
			if (t !== a.current || e !== o.current || r.signal.aborted) return;
			let c = {
				context: t,
				generation: e,
				preview: s,
				consumed: !1
			};
			h.current = c, m(c);
		} catch (n) {
			t === a.current && e === o.current && !r.signal.aborted && (y(lr(n).message), x(lr(n).fieldErrors));
		} finally {
			s.current === r && (s.current = null, _(!1));
		}
	}
	function le() {
		let t = h.current;
		if (!(!t || t.context !== a.current || t.generation !== o.current || t.consumed || re)) try {
			e.retainComparison(t.preview), ne.current = t.generation;
			let n = {
				...t,
				consumed: !0
			};
			h.current = n, m(n), y("");
		} catch (e) {
			y(lr(e).message);
		}
	}
	function ue() {
		A || (j(), f({
			context: i,
			rows: [zr(1)]
		}), l.current?.abort(), u.current++, C({
			context: i,
			loading: !1,
			error: "",
			view: null
		}), r && Lr(r.case_id, null));
	}
	async function de(e) {
		if (!r) return;
		j(), l.current?.abort();
		let t = new AbortController();
		l.current = t;
		let n = ++u.current, o = i;
		C({
			context: o,
			loading: !0,
			error: "",
			view: null
		});
		try {
			let i = await Nr(r.case_id, e, t.signal);
			if (o !== a.current || n !== u.current || t.signal.aborted) return;
			C({
				context: o,
				loading: !1,
				error: "",
				view: i
			}), Lr(r.case_id, e);
		} catch (e) {
			o === a.current && n === u.current && !t.signal.aborted && C({
				context: o,
				loading: !1,
				error: lr(e).message,
				view: null
			});
		} finally {
			l.current === t && (l.current = null);
		}
	}
	(0, c.useEffect)(() => {
		j(), ne.current = null, T.current = o.current, f({
			context: i,
			rows: [zr(1)]
		}), C({
			context: i,
			loading: !1,
			error: "",
			view: null
		});
		let e = r && Ir(r.case_id);
		return e && de(e), () => {
			o.current++, s.current?.abort(), u.current++, l.current?.abort();
		};
	}, [i]), (0, c.useEffect)(() => {
		let n = e.comparisonAck;
		if (n && n.serial !== te.current && (te.current = n.serial, n.scope === t.id && r && n.view.record.case_id === r.case_id && n.view.record.baseline_revision === r.revision && n.view.record.baseline_run_id === r.run_id)) {
			if (o.current !== (ne.current ?? T.current)) {
				e.deferComparisonAck(n.serial), w((e) => e + 1);
				return;
			}
			l.current?.abort(), u.current++, C({
				context: i,
				loading: !1,
				error: "",
				view: n.view
			}), Lr(r.case_id, n.view.record.comparison_id), w((e) => e + 1);
		}
	}, [e.comparisonAck]);
	let fe = e.comparisonError?.scope === t.id ? e.comparisonError : null;
	return {
		context: i,
		baseline: r,
		view: n,
		supported: k,
		rows: E,
		busy: g,
		fieldErrors: b,
		error: v || fe?.message || "",
		errorCode: fe?.code,
		canSaveBaseline: e.canSave,
		previewConsumed: !!D?.consumed,
		frozen: A,
		fieldsDisabled: ie,
		writeBlocked: re,
		previewResult: D?.preview ?? null,
		original: O,
		refreshSerial: ee,
		canRetain: !!D && !D.consumed && D.generation === o.current && !re && !ie,
		change: ae,
		add: oe,
		remove: M,
		preset: se,
		preview: ce,
		retain: le,
		newDraft: ue,
		open: de
	};
}
//#endregion
//#region src/formContracts.ts
var Vr = (e) => JSON.parse(JSON.stringify(e));
function Hr(e) {
	return !e.startsWith("/") || /~(?![01])/.test(e) ? [] : e.slice(1).split("/").map((e) => e.replace(/~1/g, "/").replace(/~0/g, "~"));
}
function Ur(e, t) {
	let n = e;
	for (let e of Hr(t)) {
		if (!n || typeof n != "object" || !Object.prototype.hasOwnProperty.call(n, e)) return "";
		n = n[e];
	}
	return n;
}
function Wr(e, t, n) {
	let r = Vr(e), i = Hr(t);
	if (!i.length || i.some((e) => [
		"__proto__",
		"constructor",
		"prototype"
	].includes(e))) throw Error("Unsupported form field path.");
	let a = r;
	for (let e of i.slice(0, -1)) {
		if (!Object.prototype.hasOwnProperty.call(a, e) || !a[e] || typeof a[e] != "object") throw Error("The parent form group is unavailable.");
		a = a[e];
	}
	return i.length && (a[i[i.length - 1]] = n), r;
}
function Gr(e, t) {
	let n = typeof t == "string" || typeof t == "number" ? String(t) : "";
	if (e.optional && !n.trim()) return null;
	if (!n.trim()) throw Error("Enter a value for this field.");
	if (e.kind === "text") return n;
	if (e.kind === "date") {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(n) || !Number.isFinite(Date.parse(n)) || new Date(n).toISOString().slice(0, 10) !== n) throw Error("Enter a valid calendar date, for example 2025-12-31.");
		return n;
	}
	let r = e.kind === "integer" ? ce(n) : ae(n, { currency: e.kind === "money" });
	if (!r.ok) throw Error(r.message);
	if (e.min !== void 0 && S(r.value, e.min) < 0 || e.max !== void 0 && S(r.value, e.max) > 0) throw Error(`Use ${e.min ?? "the supported minimum"} through ${e.max ?? "the supported maximum"}.`);
	if (e.kind !== "integer") return r.value;
	let i = Number(r.value);
	if (!Number.isSafeInteger(i)) throw Error("Enter an exact safe integer.");
	return i;
}
function Kr(e) {
	return e;
}
function qr(e) {
	if (e.schema_version !== "commercial-assessment-v2") return [];
	let t = e.years, n = (e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, r = t.every((e) => {
		if (!n(e.period_start) || !n(e.period_end) || !e.period_start.endsWith("-01")) return !1;
		let t = /* @__PURE__ */ new Date(`${e.period_start}T00:00:00Z`), r = new Date(t);
		return r.setUTCFullYear(t.getUTCFullYear() + 1, t.getUTCMonth(), 0), r.toISOString().slice(0, 10) === e.period_end;
	}), i = t.every((e, r) => n(e.period_start) && n(e.period_end) && (r === 0 || e.period_start > t[r - 1].period_end)), a = Kr(e.working_capital), o = t[t.length - 1];
	return [
		{
			label: "Complete fiscal years",
			valid: r
		},
		{
			label: "Ordered, non-overlapping periods",
			valid: i
		},
		{
			label: "Working capital matches latest period",
			valid: !!o?.period_end && a.period_start === o.period_start && a.period_end === o.period_end
		}
	];
}
//#endregion
//#region src/components/GuidedForm.tsx
function Jr(e, t) {
	let n = t?.querySelectorAll("[data-pointer]") ?? qn(".guidedForm")?.querySelectorAll("[data-pointer]"), r = e.startsWith("/input/") ? e.slice(6) : e, i = Array.from(n ?? []), a = i.find((e) => e.dataset.pointer === r) ?? i.find((e) => e.dataset.pointer?.startsWith(`${r}/`));
	if (!a) return;
	let o = a.parentElement;
	for (; o;) o instanceof HTMLDetailsElement && (o.open = !0), o = o.parentElement;
	a.focus(), a.scrollIntoView({
		block: "center",
		behavior: "instant"
	});
}
function Yr(e) {
	let [t, n] = (0, c.useState)(e), [r, i] = (0, c.useState)([]), [a, o] = (0, c.useState)(0), s = (0, c.useRef)(null);
	(0, c.useEffect)(() => {
		a && r.length && Jr(r[0].pointer, s.current);
	}, [a]);
	function l(e) {
		n(Vr(e)), i([]);
	}
	function u(e, t) {
		n((n) => Wr(n, e.pointer, t));
		try {
			Gr(e, t), i((t) => t.filter((t) => t.pointer !== e.pointer));
		} catch {}
	}
	function d(e) {
		try {
			Gr(e, Ur(t, e.pointer));
		} catch (t) {
			i((n) => [...n.filter((t) => t.pointer !== e.pointer), {
				pointer: e.pointer,
				code: "invalid_input",
				message: t instanceof Error ? t.message : "Review this field.",
				limit: null
			}]);
		}
	}
	function f(e) {
		i(e), o((e) => e + 1);
	}
	function p(e) {
		let n = Vr(t), r = [];
		for (let i of e) try {
			n = Wr(n, i.pointer, Gr(i, Ur(t, i.pointer)));
		} catch (e) {
			r.push({
				pointer: i.pointer,
				code: "invalid_input",
				message: e instanceof Error ? e.message : "Review this field.",
				limit: null
			});
		}
		return r.length ? (f(r), null) : (i([]), n);
	}
	return {
		values: t,
		setValues: n,
		errors: r,
		root: s,
		replace: l,
		change: u,
		blur: d,
		reject: f,
		prepare: p
	};
}
function Xr({ form: e, specs: t }) {
	return e.errors.length ? /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "validationSummary",
		role: "region",
		"aria-label": "Validation summary",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, V.jsxs)("h2", { children: [
			"Review ",
			e.errors.length,
			" input",
			" ",
			e.errors.length === 1 ? "issue" : "issues"
		] }), /* @__PURE__ */ (0, V.jsx)("ul", { children: e.errors.map((n, r) => /* @__PURE__ */ (0, V.jsxs)("li", { children: [/* @__PURE__ */ (0, V.jsxs)("button", {
			type: "button",
			onClick: () => Jr(n.pointer, e.root.current),
			children: [
				t.find((e) => e.pointer === n.pointer)?.label ?? (n.pointer || "Complete document"),
				": ",
				n.message
			]
		}), /* @__PURE__ */ (0, V.jsxs)("small", { children: [n.code, n.limit === null ? "" : ` · limit ${n.limit}`] })] }, `${n.pointer}:${r}`)) })]
	}) : null;
}
var Zr = {
	money: "500000.00",
	rate: "0.105",
	integer: "120",
	text: "Enter name or reference",
	date: "2025-12-31"
}, Qr = {
	money: "USD decimal · up to 34 significant digits",
	rate: "Rate [0, 1] · decimal fraction",
	integer: "Integer",
	text: "Text",
	date: "ISO calendar date · YYYY-MM-DD"
};
function $r({ form: e, spec: t }) {
	let n = (0, c.useId)(), r = e.errors.find((e) => e.pointer === t.pointer);
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "formField",
		children: [
			/* @__PURE__ */ (0, V.jsx)("label", {
				htmlFor: n,
				children: t.label
			}),
			/* @__PURE__ */ (0, V.jsx)("input", {
				id: n,
				"data-pointer": t.pointer,
				type: "text",
				inputMode: ["money", "rate"].includes(t.kind) ? "decimal" : t.kind === "integer" ? "numeric" : "text",
				value: String(Ur(e.values, t.pointer) ?? ""),
				placeholder: t.placeholder ?? Zr[t.kind],
				"aria-invalid": r ? "true" : void 0,
				"aria-describedby": `${n}-help${r ? ` ${n}-error` : ""}`,
				onBlur: () => e.blur(t),
				onChange: (n) => e.change(t, n.target.value)
			}),
			/* @__PURE__ */ (0, V.jsx)("small", {
				id: `${n}-help`,
				children: t.helper ?? `${Qr[t.kind]}${t.min === void 0 ? "" : ` · minimum ${t.min}`}${t.max === void 0 ? "" : ` · maximum ${t.max}`}`
			}),
			r && /* @__PURE__ */ (0, V.jsxs)("span", {
				id: `${n}-error`,
				className: "fieldError",
				children: [r.message, r.limit === null ? "" : ` · limit ${r.limit}`]
			})
		]
	});
}
//#endregion
//#region src/Scenarios.tsx
var ei = [
	"Revenue change (%)",
	"COGS change (%)",
	"Operating expense change (%)",
	"Proposed rate change (bps)"
];
function ti({ title: e, children: t }) {
	let [n, r] = (0, c.useState)(!1);
	return /* @__PURE__ */ (0, V.jsxs)("details", {
		onToggle: (e) => r(e.currentTarget.open),
		children: [/* @__PURE__ */ (0, V.jsx)("summary", { children: e }), n && t()]
	});
}
function ni({ rows: e, render: t, label: n }) {
	let [r, i] = (0, c.useState)(0), a = Math.max(1, Math.ceil(e.length / 50));
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		"aria-label": n,
		children: [
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				"Page ",
				r + 1,
				" of ",
				a,
				" · ",
				e.length,
				" rows · up to 50 rows per page"
			] }),
			e.slice(r * 50, (r + 1) * 50).map((e, n) => t(e, r * 50 + n)),
			a > 1 && /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, V.jsxs)("button", {
					disabled: r === 0,
					onClick: () => i(r - 1),
					children: [
						"Previous ",
						n,
						" page"
					]
				}), /* @__PURE__ */ (0, V.jsxs)("button", {
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
function ri({ value: e }) {
	return /* @__PURE__ */ (0, V.jsx)(tr, {
		value: e,
		className: "originalComparisonJson",
		title: "Original JSON",
		noun: "JSON"
	});
}
function ii({ row: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("details", { children: [
		/* @__PURE__ */ (0, V.jsxs)("summary", { children: [
			e.fact_id,
			" · ",
			nr(e)
		] }),
		/* @__PURE__ */ (0, V.jsx)("strong", { children: e.definition_id }),
		/* @__PURE__ */ (0, V.jsx)("p", {
			className: "expression",
			children: e.expression
		}),
		e.operands.map((e, t) => /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "operand",
			children: [
				/* @__PURE__ */ (0, V.jsx)("code", { children: e.reference }),
				/* @__PURE__ */ (0, V.jsxs)("span", { children: [
					e.raw_value === null ? "Not applicable" : String(e.raw_value),
					" ",
					e.unit
				] }),
				/* @__PURE__ */ (0, V.jsx)("small", { children: e.reference_type })
			]
		}, t)),
		e.explanation && /* @__PURE__ */ (0, V.jsx)("p", { children: e.explanation })
	] });
}
function ai(e) {
	return e === null ? "Not applicable" : String(e);
}
function oi(e) {
	return e === null ? "Not applicable" : String(e);
}
function H({ preview: e, result: t }) {
	let n = e.baseline.assessment;
	return /* @__PURE__ */ (0, V.jsxs)("article", {
		className: "scenarioResult",
		"aria-label": `Reviewed scenario ${t.name}`,
		children: [
			/* @__PURE__ */ (0, V.jsx)("h3", { children: t.name }),
			/* @__PURE__ */ (0, V.jsx)("p", { children: t.rationale }),
			/* @__PURE__ */ (0, V.jsxs)("p", {
				className: "scenarioOutcome",
				children: [
					"Baseline",
					" ",
					/* @__PURE__ */ (0, V.jsx)("strong", {
						"data-outcome": t.outcome_change.baseline,
						children: t.outcome_change.baseline.toUpperCase()
					}),
					" ",
					"→ Projected",
					" ",
					/* @__PURE__ */ (0, V.jsx)("strong", {
						"data-outcome": t.outcome_change.projected,
						children: t.outcome_change.projected.toUpperCase()
					}),
					" ",
					"·",
					" ",
					t.outcome_change.changed ? "Outcome changed" : "Outcome unchanged"
				]
			}),
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				"Server score ",
				t.decision.score,
				" · retained policy",
				" ",
				t.decision.policy_version
			] }),
			/* @__PURE__ */ (0, V.jsx)("div", {
				className: "tableScroll",
				children: /* @__PURE__ */ (0, V.jsxs)("table", { children: [
					/* @__PURE__ */ (0, V.jsx)("caption", { children: "Original baseline and projected current facts" }),
					/* @__PURE__ */ (0, V.jsx)("thead", { children: /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, V.jsx)("th", { children: "Metric" }),
						/* @__PURE__ */ (0, V.jsx)("th", { children: "Baseline" }),
						/* @__PURE__ */ (0, V.jsx)("th", { children: "Projected" }),
						/* @__PURE__ */ (0, V.jsx)("th", { children: "Server delta" })
					] }) }),
					/* @__PURE__ */ (0, V.jsx)("tbody", { children: Te.map((e) => {
						let r = t.comparisons.find((t) => t.metric === e);
						return /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, V.jsx)("th", {
								scope: "row",
								children: Be[e]
							}),
							/* @__PURE__ */ (0, V.jsx)("td", {
								className: "num",
								children: nr(n.current_facts[e])
							}),
							/* @__PURE__ */ (0, V.jsx)("td", {
								className: "num",
								children: nr(t.current_facts[e])
							}),
							/* @__PURE__ */ (0, V.jsxs)("td", {
								className: "num",
								children: [r ? r.delta === null ? "Not applicable" : nr({
									...t.current_facts[e],
									raw_value: r.delta,
									reported_value: null
								}) : "Held fixed", r?.delta_explanation && /* @__PURE__ */ (0, V.jsx)("small", { children: r.delta_explanation })]
							})
						] }, e);
					}) })
				] })
			}),
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				"K-1 history stays observed:",
				" ",
				nr(t.current_facts.k1_history),
				". Current shocks do not create a historical operating year."
			] }),
			/* @__PURE__ */ (0, V.jsx)(ti, {
				title: "Raw deltas and policy headroom",
				children: () => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("p", { children: "Values below are the server's raw results. Approval uses the displayed operator; decline floors apply where returned." }), t.comparisons.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
					className: "scenarioFact",
					children: [
						/* @__PURE__ */ (0, V.jsx)("strong", { children: Be[e.metric] }),
						/* @__PURE__ */ (0, V.jsxs)("p", { children: [
							"Baseline ",
							ai(e.baseline_value),
							" · projected",
							" ",
							ai(e.projected_value),
							" · delta ",
							ai(e.delta),
							" ",
							e.unit
						] }),
						/* @__PURE__ */ (0, V.jsxs)("code", { children: [
							e.baseline_fact_id,
							" → ",
							e.projected_fact_id
						] }),
						e.delta_explanation && /* @__PURE__ */ (0, V.jsx)("p", { children: e.delta_explanation }),
						e.policy_headroom && /* @__PURE__ */ (0, V.jsxs)("p", { children: [
							"Approval ",
							e.policy_headroom.comparison_operator,
							" ",
							ai(e.policy_headroom.approval_threshold),
							" · decline floor ",
							ai(e.policy_headroom.decline_threshold),
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Approval headroom: baseline",
							" ",
							oi(e.policy_headroom.baseline_approval),
							" · projected",
							" ",
							oi(e.policy_headroom.projected_approval),
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Decline headroom: baseline",
							" ",
							oi(e.policy_headroom.baseline_decline),
							" · projected",
							" ",
							oi(e.policy_headroom.projected_decline)
						] })
					]
				}, e.metric))] })
			}),
			/* @__PURE__ */ (0, V.jsx)(ti, {
				title: "Factor and reason changes",
				children: () => /* @__PURE__ */ (0, V.jsxs)("div", { children: [
					t.factor_changes.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
						className: "scenarioFact",
						children: [/* @__PURE__ */ (0, V.jsxs)("h4", { children: [
							Be[e.name],
							" ·",
							" ",
							e.changed ? "Changed" : "Unchanged"
						] }), /* @__PURE__ */ (0, V.jsxs)("p", { children: [
							"Baseline raw ",
							ai(e.baseline.raw_value),
							" → projected raw",
							" ",
							ai(e.projected.raw_value),
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Pass: ",
							ai(e.baseline.passed),
							" →",
							" ",
							ai(e.projected.passed),
							" · decline triggered:",
							" ",
							ai(e.baseline.decline_triggered),
							" →",
							" ",
							ai(e.projected.decline_triggered),
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Operator",
							" ",
							e.projected.comparison_operator ?? "Not applicable",
							" · approval ",
							ai(e.projected.threshold),
							" · decline floor",
							" ",
							ai(e.projected.decline_threshold),
							" · weight",
							" ",
							e.projected.weight,
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Basis ",
							e.basis,
							" · ",
							/* @__PURE__ */ (0, V.jsx)("code", { children: e.projected_fact_id })
						] })]
					}, e.name)),
					/* @__PURE__ */ (0, V.jsx)("h4", { children: "Reason changes" }),
					t.reason_changes.length ? t.reason_changes.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsxs)("strong", { children: [
						e.code,
						" · ",
						e.change
					] }), /* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Baseline: ",
						e.baseline?.message ?? "No reason",
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Projected: ",
						e.projected?.message ?? "No reason"
					] })] }, e.code)) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No reason changes returned." }),
					/* @__PURE__ */ (0, V.jsx)("h4", { children: "Projected reasons" }),
					t.decision.reasons.length ? t.decision.reasons.map((e) => /* @__PURE__ */ (0, V.jsxs)("p", { children: [
						e.code,
						" · ",
						e.message
					] }, e.code)) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No additional reasons returned." })
				] })
			}),
			/* @__PURE__ */ (0, V.jsx)(ti, {
				title: "Projected inputs and held-fixed assumptions",
				children: () => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify({
					assumptions: t.assumptions,
					operating: t.projection_inputs.operating,
					proposed_loan: t.projection_inputs.proposed_loan,
					existing_debt: t.projection_inputs.existing_debt,
					working_capital: t.projection_inputs.working_capital
				}, null, 2) }), /* @__PURE__ */ (0, V.jsx)("ul", { children: e.held_fixed_assumptions.map((e, t) => /* @__PURE__ */ (0, V.jsx)("li", { children: e }, t)) })] })
			}),
			/* @__PURE__ */ (0, V.jsx)(ti, {
				title: "Projected guarantor contributions",
				children: () => /* @__PURE__ */ (0, V.jsx)(ni, {
					rows: t.guarantor_contributions,
					label: "guarantors",
					render: (e, n) => /* @__PURE__ */ (0, V.jsxs)("div", {
						className: "scenarioFact",
						children: [
							/* @__PURE__ */ (0, V.jsx)("h4", { children: e.name }),
							/* @__PURE__ */ (0, V.jsxs)("p", { children: [
								"Business EBITDA: ",
								nr(e.business_ebitda),
								/* @__PURE__ */ (0, V.jsx)("br", {}),
								"Outside income: ",
								nr(e.outside_income),
								/* @__PURE__ */ (0, V.jsx)("br", {}),
								"Personal debt: ",
								nr(e.personal_debt)
							] }),
							/* @__PURE__ */ (0, V.jsx)(ti, {
								title: `${e.name} projected inputs`,
								children: () => /* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify(t.projection_inputs.guarantors[n], null, 2) })
							})
						]
					}, n)
				})
			}),
			/* @__PURE__ */ (0, V.jsx)(ti, {
				title: "Calculation trace",
				children: () => /* @__PURE__ */ (0, V.jsx)(ni, {
					rows: t.calculation_trace,
					label: "trace",
					render: (e) => /* @__PURE__ */ (0, V.jsx)(ii, { row: e }, e.fact_id)
				})
			})
		]
	});
}
function si({ preview: e }) {
	let [t, n] = (0, c.useState)(0);
	return /* @__PURE__ */ (0, V.jsxs)("div", { children: [
		/* @__PURE__ */ (0, V.jsxs)("label", {
			className: "scenarioSelect",
			children: [
				"Reviewed scenario",
				" ",
				/* @__PURE__ */ (0, V.jsx)("select", {
					"aria-label": "Reviewed scenario",
					value: t,
					onChange: (e) => n(Number(e.target.value)),
					children: e.scenarios.map((e, t) => /* @__PURE__ */ (0, V.jsxs)("option", {
						value: t,
						children: [
							t + 1,
							". ",
							e.name
						]
					}, e.scenario_key))
				})
			]
		}),
		/* @__PURE__ */ (0, V.jsx)(H, {
			preview: e,
			result: e.scenarios[t]
		}, e.scenarios[t].scenario_key),
		/* @__PURE__ */ (0, V.jsx)("p", {
			className: "fine",
			children: e.disclaimer
		})
	] });
}
function ci({ view: e, onOpen: t }) {
	let n = e.record;
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel originalComparison",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "comparisonContext",
				children: [
					/* @__PURE__ */ (0, V.jsx)("h2", { children: "Saved comparison" }),
					/* @__PURE__ */ (0, V.jsx)("code", { children: n.comparison_id }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Original record · Case ",
						n.case_id,
						" · baseline revision",
						" ",
						n.baseline_revision,
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Run ",
						n.baseline_run_id,
						" · recorded ",
						n.recorded_at
					] }),
					/* @__PURE__ */ (0, V.jsx)("button", {
						onClick: () => t({
							caseId: n.case_id,
							revision: n.baseline_revision
						}),
						children: "Open baseline revision"
					})
				]
			}),
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				"Recorded actor: ",
				n.actor,
				" ·",
				" ",
				n.actor === "prototype-demo-unverified" ? "archived demonstration identity" : "configured credential identity",
				" ",
				"· source status ",
				n.recording.source_status,
				n.recording.source_revision ? ` · ${n.recording.source_revision}` : " · exact build revision not supplied"
			] }),
			e.preview ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Operating period ",
					e.preview.selected_period.period_start,
					" –",
					" ",
					e.preview.selected_period.period_end,
					" · assumptions as of",
					" ",
					e.preview.assumptions_as_of,
					/* @__PURE__ */ (0, V.jsx)("br", {}),
					"Retained policy ",
					e.preview.policy_snapshot.version,
					" ·",
					" ",
					e.preview.scenario_definition_version,
					" ·",
					" ",
					e.preview.calculation_version
				] }),
				/* @__PURE__ */ (0, V.jsx)(ti, {
					title: "Baseline hashes, fingerprint and retained policy",
					children: () => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Input hash ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.preview.baseline.input_hash }),
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Baseline payload hash",
						" ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.preview.baseline.payload_hash }),
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Reviewed fingerprint",
						" ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.preview.fingerprint.value })
					] }), /* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify({
						units: e.preview.units,
						policy_snapshot: e.preview.policy_snapshot,
						recording: n.recording
					}, null, 2) })] })
				}),
				/* @__PURE__ */ (0, V.jsx)(si, { preview: e.preview }, n.comparison_id)
			] }) : /* @__PURE__ */ (0, V.jsx)("p", {
				className: "compatibility",
				role: "status",
				children: e.compatibility
			}),
			/* @__PURE__ */ (0, V.jsx)(ti, {
				title: "Original comparison JSON",
				children: () => /* @__PURE__ */ (0, V.jsx)(ri, { value: n })
			}),
			/* @__PURE__ */ (0, V.jsxs)("p", {
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
function li({ caseId: e, scope: t, refresh: n, onOpen: r }) {
	let i = vr(`${t}:${n}`, (t, n) => Pr(e, t, n), (e) => e.comparison_id);
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel comparisonArchive",
		"aria-label": "Saved comparisons",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Saved comparisons" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "All baselines for this case · newest records first · 25 summaries per page" })] }), /* @__PURE__ */ (0, V.jsx)("button", {
					onClick: i.refresh,
					children: "Refresh comparisons"
				})]
			}),
			i.loading && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "status",
				children: "Loading comparison summaries…"
			}),
			i.error && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "alert",
				children: i.error
			}),
			!i.loading && !i.error && !i.items.length && /* @__PURE__ */ (0, V.jsx)("p", { children: "No saved comparisons yet." }),
			i.items.map((e) => /* @__PURE__ */ (0, V.jsxs)("article", {
				className: "caseRow",
				children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [
					/* @__PURE__ */ (0, V.jsx)("h3", { children: e.scenarios.map((e) => e.name).join(" · ") }),
					/* @__PURE__ */ (0, V.jsx)("code", { children: e.comparison_id }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Baseline revision ",
						e.baseline_revision,
						" ·",
						" ",
						e.scenario_count,
						" scenario(s)",
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						e.recorded_at,
						" · policy ",
						e.policy_version
					] })
				] }), /* @__PURE__ */ (0, V.jsx)("button", {
					"aria-label": `Open comparison ${e.comparison_id}`,
					onClick: () => r(e.comparison_id),
					children: "Open original comparison"
				})]
			}, e.comparison_id)),
			i.next && /* @__PURE__ */ (0, V.jsx)("button", {
				disabled: i.loading,
				onClick: i.more,
				children: "Load more comparisons"
			})
		]
	});
}
function ui({ model: e, onSaveBaseline: t, onOpenBaseline: n }) {
	let r = (0, c.useRef)(null), [i, a] = (0, c.useState)(null), o = (0, c.useRef)(null), [s, l] = (0, c.useState)([]), [u, d] = (0, c.useState)(0);
	(0, c.useEffect)(() => {
		e.fieldErrors.length && (l(e.fieldErrors), d((e) => e + 1));
	}, [e.fieldErrors]), (0, c.useEffect)(() => {
		u && s.length && Jr(s[0].pointer, o.current);
	}, [u]);
	let f = (e, t) => `/scenarios/${e}/${t === "name" || t === "rationale" ? t : `assumptions/${t}`}`, p = (e, t) => {
		try {
			return e === "name" || e === "rationale" ? on(t, e === "name" ? 120 : 2e3) : sn(t, e !== "proposed_rate_change_bps"), "";
		} catch (e) {
			return e instanceof Error ? e.message : "Review this field.";
		}
	};
	function m(e, t, n) {
		p(t, n) || l((n) => n.filter((n) => n.pointer !== f(e, t)));
	}
	function h(e, t, n) {
		let r = p(t, n);
		r && l((n) => [...n.filter((n) => n.pointer !== f(e, t)), {
			pointer: f(e, t),
			code: "invalid_input",
			message: r,
			limit: null
		}]);
	}
	function g() {
		let t = [];
		e.rows.forEach((e, n) => {
			for (let r of [
				"name",
				"rationale",
				...tn
			]) {
				let i = p(r, r === "name" ? e.name : r === "rationale" ? e.rationale : e.shocks[r]);
				i && t.push({
					pointer: f(n, r),
					code: "invalid_input",
					message: i,
					limit: null
				});
			}
		}), l(t), t.length && d((e) => e + 1), e.preview();
	}
	(0, c.useEffect)(() => {
		i && (qn(`[id="scenario-name-${i}"]`)?.focus(), a(null));
	}, [i]);
	let _ = e.view?.assessment;
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "scenariosWorkspace",
		ref: o,
		children: [
			/* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel scenarioComposer",
				"aria-label": "Scenario authoring",
				children: [
					/* @__PURE__ */ (0, V.jsx)("div", {
						className: "panelTitle",
						children: /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Scenario comparison" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "Review current pro forma shocks against an explicit original saved baseline." })] })
					}),
					e.baseline && /* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Case ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.baseline.case_id }),
						" · baseline revision",
						" ",
						e.baseline.revision,
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Run ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.baseline.run_id }),
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Payload hash ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.baseline.payload_hash })
					] }),
					_ && /* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Operating period ",
						_.selected_period.period_start,
						" –",
						" ",
						_.selected_period.period_end,
						" · assumptions as of",
						" ",
						_.assumptions_as_of,
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Retained policy ",
						_.policy_snapshot.version,
						". The spread's selected column does not change this baseline."
					] }),
					e.view ? e.supported ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
						/* @__PURE__ */ (0, V.jsx)("p", { children: "Enter percentage changes as percentages (−10 means −10%). Enter rate changes in basis points; fractional basis points are supported. Each of the four shocks must be explicit. Presets fill the name and shocks; enter your own rationale." }),
						s.length > 0 && /* @__PURE__ */ (0, V.jsxs)("section", {
							className: "validationSummary",
							"aria-label": "Scenario validation summary",
							role: "region",
							children: [/* @__PURE__ */ (0, V.jsx)("h3", { children: "Review scenario inputs" }), /* @__PURE__ */ (0, V.jsx)("ul", { children: s.map((e, t) => /* @__PURE__ */ (0, V.jsxs)("li", { children: [/* @__PURE__ */ (0, V.jsxs)("button", {
								type: "button",
								onClick: () => Jr(e.pointer, o.current),
								children: [
									e.pointer,
									": ",
									e.message
								]
							}), /* @__PURE__ */ (0, V.jsxs)("small", { children: [e.code, e.limit === null ? "" : ` · limit ${e.limit}`] })] }, t)) })]
						}),
						e.rows.map((t, n) => /* @__PURE__ */ (0, V.jsxs)("fieldset", {
							className: "scenarioRow",
							disabled: e.fieldsDisabled,
							children: [
								/* @__PURE__ */ (0, V.jsxs)("legend", { children: ["Scenario ", n + 1] }),
								/* @__PURE__ */ (0, V.jsxs)("div", {
									className: "scenarioFields",
									children: [
										/* @__PURE__ */ (0, V.jsxs)("label", { children: ["Preset", /* @__PURE__ */ (0, V.jsxs)("select", {
											"aria-label": `Scenario ${n + 1} preset`,
											value: t.preset,
											onChange: (n) => e.preset(t.key, n.target.value),
											children: [/* @__PURE__ */ (0, V.jsx)("option", {
												value: "custom",
												children: "Custom / zero shocks"
											}), Object.entries(Rr).map(([e, t]) => /* @__PURE__ */ (0, V.jsx)("option", {
												value: e,
												children: t.name
											}, e))]
										})] }),
										/* @__PURE__ */ (0, V.jsxs)("label", { children: [
											"Name",
											/* @__PURE__ */ (0, V.jsx)("input", {
												id: `scenario-name-${t.key}`,
												"data-pointer": f(n, "name"),
												"aria-invalid": s.some((e) => e.pointer === f(n, "name")) || void 0,
												"aria-label": `Scenario ${n + 1} name`,
												placeholder: "Revenue downside",
												value: t.name,
												onBlur: (e) => h(n, "name", e.target.value),
												onChange: (r) => {
													m(n, "name", r.target.value), e.change(t.key, (e) => ({
														...e,
														name: r.target.value
													}));
												}
											}),
											/* @__PURE__ */ (0, V.jsx)("small", { children: "Text · at most 120 Unicode characters after trimming" })
										] }),
										/* @__PURE__ */ (0, V.jsxs)("label", {
											className: "scenarioRationale",
											children: [
												"Rationale",
												/* @__PURE__ */ (0, V.jsx)("textarea", {
													"data-pointer": f(n, "rationale"),
													"aria-invalid": s.some((e) => e.pointer === f(n, "rationale")) || void 0,
													"aria-label": `Scenario ${n + 1} rationale`,
													rows: 3,
													placeholder: "Explain the assumption being tested",
													value: t.rationale,
													onBlur: (e) => h(n, "rationale", e.target.value),
													onChange: (r) => {
														m(n, "rationale", r.target.value), e.change(t.key, (e) => ({
															...e,
															rationale: r.target.value
														}));
													}
												}),
												/* @__PURE__ */ (0, V.jsx)("small", { children: "Required · at most 2,000 Unicode characters after trimming; name limit 120." })
											]
										}),
										tn.map((r, i) => /* @__PURE__ */ (0, V.jsxs)("label", { children: [
											ei[i],
											/* @__PURE__ */ (0, V.jsx)("input", {
												inputMode: "decimal",
												"data-pointer": f(n, r),
												"aria-invalid": s.some((e) => e.pointer === f(n, r)) || void 0,
												placeholder: r === "proposed_rate_change_bps" ? "100" : "-10",
												"aria-label": `Scenario ${n + 1} ${ei[i]}`,
												value: t.shocks[r],
												onBlur: (e) => h(n, r, e.target.value),
												onChange: (i) => {
													m(n, r, i.target.value), e.change(t.key, (e) => ({
														...e,
														preset: "custom",
														shocks: {
															...e.shocks,
															[r]: i.target.value
														}
													}));
												}
											}),
											/* @__PURE__ */ (0, V.jsx)("small", { children: r === "proposed_rate_change_bps" ? "Basis points · fractional values supported" : "Percentage change · minimum -100%" })
										] }, r))
									]
								}),
								/* @__PURE__ */ (0, V.jsx)("div", {
									className: "scenarioChips",
									role: "group",
									"aria-label": `Scenario ${n + 1} quick-fill shocks`,
									children: [
										{
											label: "+100 bps",
											field: "proposed_rate_change_bps",
											value: "100"
										},
										{
											label: "+250 bps",
											field: "proposed_rate_change_bps",
											value: "250"
										},
										{
											label: "Revenue −10%",
											field: "revenue_change",
											value: "-10"
										},
										{
											label: "Revenue −20%",
											field: "revenue_change",
											value: "-20"
										},
										{
											label: "Operating expense +10%",
											field: "operating_expense_change",
											value: "10"
										}
									].map((r) => /* @__PURE__ */ (0, V.jsx)("button", {
										type: "button",
										onClick: () => {
											m(n, r.field, r.value), e.change(t.key, (e) => ({
												...e,
												preset: "custom",
												shocks: {
													...e.shocks,
													[r.field]: r.value
												}
											}));
										},
										children: r.label
									}, r.label))
								}),
								/* @__PURE__ */ (0, V.jsx)("button", {
									disabled: e.rows.length <= 1,
									"aria-label": `Remove scenario ${n + 1}`,
									onClick: () => {
										e.remove(t.key), r.current?.focus();
									},
									children: "Remove scenario"
								})
							]
						}, t.key)),
						/* @__PURE__ */ (0, V.jsxs)("div", {
							className: "actions",
							children: [
								/* @__PURE__ */ (0, V.jsx)("button", {
									ref: r,
									disabled: e.fieldsDisabled || e.rows.length >= 10,
									onClick: () => {
										let t = e.add();
										t && a(t);
									},
									children: "Add scenario"
								}),
								/* @__PURE__ */ (0, V.jsx)("button", {
									disabled: e.fieldsDisabled || e.busy || !e.rows.length,
									onClick: g,
									children: "Preview scenarios"
								}),
								/* @__PURE__ */ (0, V.jsx)("button", {
									className: "primary",
									disabled: !e.canRetain,
									onClick: e.retain,
									children: "Save reviewed comparison"
								}),
								/* @__PURE__ */ (0, V.jsx)("button", {
									disabled: e.frozen,
									onClick: e.newDraft,
									children: "Start another comparison"
								})
							]
						}),
						/* @__PURE__ */ (0, V.jsx)("p", {
							role: "status",
							children: e.busy ? "Previewing current draft…" : e.canRetain ? "Current preview ready for review and retention." : "Preview required before a fresh save. A saved or pending batch cannot be saved twice."
						}),
						e.original.view && /* @__PURE__ */ (0, V.jsx)("p", { children: "Viewing a saved original. Choose Start another comparison to author a fresh batch." }),
						e.writeBlocked && /* @__PURE__ */ (0, V.jsx)("p", { children: "Resolve this tab's existing saved write, recovery tracking or conflicting proposal before retaining another comparison. Read-only previews remain available." })
					] }) : /* @__PURE__ */ (0, V.jsx)("p", { children: "New preview is unavailable for this baseline definition. Saved comparison summaries and original records remain available below." }) : /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)("p", { children: "Save an accepted dated case, or open an original saved revision, to author scenarios. Legacy annual assessments remain unsaved." }), /* @__PURE__ */ (0, V.jsx)("button", {
						disabled: !e.canSaveBaseline,
						onClick: (e) => t(e.currentTarget),
						children: "Save baseline case"
					})] }),
					e.error && /* @__PURE__ */ (0, V.jsx)("p", {
						role: "alert",
						children: e.error
					}),
					e.errorCode === "storage_upgrade_required" && /* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Retention requires the documented copy upgrade to a separate schema-v2 database. An operator must verify the copy and select it explicitly; opening this view performs no upgrade. See",
						" ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: "docs/SCENARIO_COMPARISONS.md" }),
						"."
					] })
				]
			}),
			e.previewResult && (!e.original.view || !e.previewConsumed) && /* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel scenarioPreview",
				children: [
					/* @__PURE__ */ (0, V.jsx)("h2", { children: "Read-only preview" }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Review the server's projected results and rationale before saving this batch.",
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Reviewed fingerprint",
						" ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.previewResult.fingerprint.value })
					] }),
					/* @__PURE__ */ (0, V.jsx)(si, { preview: e.previewResult }, e.previewResult.fingerprint.value)
				]
			}),
			e.original.loading && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "status",
				children: "Loading original comparison…"
			}),
			e.original.error && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "alert",
				children: e.original.error
			}),
			e.original.view && (!e.previewResult || e.previewConsumed) && /* @__PURE__ */ (0, V.jsx)(ci, {
				view: e.original.view,
				onOpen: n
			}),
			e.baseline && /* @__PURE__ */ (0, V.jsx)(li, {
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
var di = "Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.";
function fi(e, t) {
	return `spreadline-case-${e.case_id}-r${e.revision}-${e.run_id}${t ? `-comparison-${t.comparison_id}` : ""}.json`;
}
function pi(e, t) {
	let n = e.snapshot, r = t.record, i = L(r.preview.baseline, "export comparison baseline");
	I(r.case_id === n.case_id && r.baseline_revision === n.revision && r.baseline_run_id === n.run_id && i.case_id === n.case_id && i.revision === n.revision && i.run_id === n.run_id && i.input_hash === n.input_hash && i.payload_hash === n.payload_hash && z(i.assessment, n.assessment), "retained comparison must match the selected original case, revision, run, hashes and full baseline assessment");
}
//#endregion
//#region src/reviewPackage.worker.ts?worker&inline
var mi = "(function(){let e=/^([+-]?)(?:(\\d+)(?:\\.(\\d*))?|\\.(\\d+))(?:[eE]([+-]?\\d+))?$/,t=10n;function n(t){if(t.length>256)throw Error(`Decimal exceeds the supported range.`);let n=e.exec(t);if(!n)throw Error(`Enter a finite decimal value.`);let r=Number(n[5]??`0`);if(!Number.isSafeInteger(r)||Math.abs(r)>128)throw Error(`Decimal exponent exceeds the supported range.`);let i=n[3]??n[4]??``;return{coefficient:BigInt(`${n[1]===`-`?`-`:``}${n[2]??`0`}${i}`),scale:i.length-r}}function r({coefficient:e,scale:t}){if(e===0n)return`0`;let n=e<0n?`-`:``,r=(e<0n?-e:e).toString();return t<=0?n+r+`0`.repeat(-t):(r=r.padStart(t+1,`0`),(n+r.slice(0,-t)+`.`+r.slice(-t)).replace(/0+$/,``).replace(/\\.$/,``))}function i(e){return r(n(e))}function a(e){if(typeof e!=`string`)return!1;try{return n(e),!0}catch{return!1}}function o(e){if(typeof e==`number`&&Number.isFinite(e))return i(String(e));if(typeof e==`string`)return i(e);throw Error(`Financial values must be finite decimals.`)}function s(e,r){let i=n(e),a=n(r),o=Math.max(i.scale,a.scale),s=i.coefficient*t**BigInt(o-i.scale),c=a.coefficient*t**BigInt(o-a.scale);return s<c?-1:+(s>c)}function c(e,t){try{return s(o(e),o(t))===0}catch{return!1}}let l=[`gross_receipts`,`cogs`,`operating_expense_excl_dna_interest_comp`,`officer_compensation`,`depreciation`,`amortization`,`interest_expense`,`section_179`,`k1_distribution`],u=[`ordinary_business_income`,`ebitda`,`proposed_monthly_payment`,`proposed_annual_payment`,`debt_service`,`fixed_charge_service`,`global_business_ebitda`,`global_outside_income`,`global_personal_debt`,`global_cash_flow`,`global_debt_service`,`dscr`,`fccr`,`global_dscr`,`net_working_capital_increase`,`uca_cash_flow`,`k1_ratio_difference`,`k1_history`],d=[`commercial_min_dscr`,`commercial_min_fccr`,`commercial_min_global_dscr`,`commercial_decline_dscr`,`commercial_decline_fccr`,`commercial_decline_global_dscr`,`commercial_min_uca_cash_flow`,`consumer_review_dti`,`consumer_decline_dti`,`consumer_min_credit_score`,`extraction_confidence_threshold`,`k1_stability_band`,`sba_global_dscr_floor_expansion`,`sba_global_dscr_floor_acquisition`];function f(e,t){if(!e)throw Error(`Incomplete or invalid assessment: ${t}`)}function p(e,t){return f(typeof e==`object`&&!!e&&!Array.isArray(e),t),e}function m(e,t){return f(Array.isArray(e),t),e}function h(e){return typeof e==`string`&&e.length>0}function g(e){return typeof e==`number`&&Number.isFinite(e)}function _(e){return typeof e==`string`||typeof e==`boolean`}function v(e){return typeof e==`string`&&/^\\d{4}-\\d{2}-\\d{2}$/.test(e)&&Number.isFinite(Date.parse(e))&&new Date(e).toISOString().slice(0,10)===e}function y(e){let t=p(e,`period`);return f(v(t.period_start)&&v(t.period_end)&&t.period_start<=t.period_end,`period dates`),t}let b=(e,t)=>e.period_start===t.period_start&&e.period_end===t.period_end;function x(e){let t=p(e,`decision`);f(t.vertical===`commercial`&&[`approve`,`review`,`decline`].includes(String(t.outcome))&&a(t.score)&&h(t.policy_version)&&h(t.disclaimer),`decision identity`);let n=m(t.factors,`factors`);f(n.length===5,`commercial factors`);let r=[`dscr`,`fccr`,`global_dscr`,`uca_positive`,`k1_history`];for(let e of n){let t=p(e,`factor`);f(h(t.name)&&r.includes(t.name)&&_(t.value)&&(t.raw_value===null||_(t.raw_value))&&a(t.weight)&&(t.threshold===null||_(t.threshold))&&(t.passed===null||typeof t.passed==`boolean`)&&h(t.source)&&[null,`>=`,`>`,`<`,`==`].includes(t.comparison_operator)&&(t.decline_threshold===null||a(t.decline_threshold))&&(t.decline_triggered===null||typeof t.decline_triggered==`boolean`),`factor fields`)}f(new Set(n.map(e=>p(e,`factor`).name)).size===5,`unique factors`);for(let e of m(t.reasons,`reasons`)){let t=p(e,`reason`);f(h(t.code)&&h(t.factor)&&h(t.message)&&_(t.value),`reason fields`)}return t}function S(e){let t=p(e,`normalized input`);f(t.schema_version===`commercial-assessment-v2`&&v(t.assessment_as_of)&&h(t.borrower_name)&&h(t.geography),`dated identity`);let n=p(t.units,`units`);f(n.currency===`USD`&&n.monetary_unit===`dollars`&&n.annual_rate_unit===`decimal_nominal`,`units`);let r=m(t.years,`years`);f(r.length>=1&&r.length<=10,`year count`);let i=``;for(let e of r){let n=p(e,`year`),r=y(n);f(r.period_start>i&&r.period_end<=t.assessment_as_of,`year order`),i=r.period_end;for(let e of l)f(a(n[e]),`year ${e}`)}let o=(e,t)=>{let n=p(e,`assumption`);for(let e of t)f(a(n[e]),e);return n};o(t.existing_debt,[`cpltd_annual`,`operating_lease_annual`]);let s=o(t.proposed_loan,[`amount`,`annual_rate`]);f(Number.isSafeInteger(s.term_months)&&s.rate_type===`fixed`&&s.repayment_type===`fully_amortizing`&&s.payment_frequency===`monthly`,`loan convention`);let c=o(t.working_capital,[`ar_increase`,`inventory_increase`,`ap_increase`,`cash_taxes_paid`]);f(b(y(c),y(r[r.length-1])),`working capital period`);for(let e of m(t.guarantors,`guarantors`))f(h(o(e,[`ownership_percentage`,`wages`,`interest_dividend_income`,`mortgage_pi_annual`,`auto_loan_annual`,`credit_card_min_annual`]).name),`guarantor name`);return t}function C(e){let t=p(e,`metric`);return f(h(t.fact_id)&&h(t.unit)&&(t.display_precision===null||Number.isInteger(t.display_precision)&&Number(t.display_precision)>=0&&Number(t.display_precision)<=30)&&(t.explanation===null||h(t.explanation)),`metric fields`),f(t.status===`available`?a(t.raw_value)||t.unit===`category`&&h(t.raw_value):t.status===`not_applicable`&&t.raw_value===null&&h(t.explanation),`metric status/value`),f(t.status===`not_applicable`?t.reported_value===null:t.unit===`category`?t.reported_value===t.raw_value:a(t.reported_value),`reported metric value`),t}function w(e){let t=p(e,`assessment`);f(t.schema_version===`commercial-assessment-v2`&&t.calculation_version===`commercial-calculation-v2`&&t.serialization_version===`assessment-json-v2`&&t.coverage_basis===`current_pro_forma`&&h(t.disclaimer),`versions`);let n=S(t.normalized_input),r=n.years[n.years.length-1];f(b(y(t.selected_period),r)&&t.assumptions_as_of===n.assessment_as_of,`selected period`);let i=m(t.historical_spread,`spread`);f(i.length===n.years.length,`spread length`);let o=[];i.forEach((e,t)=>{let r=p(e,`historical period`);f(b(y(r),n.years[t])&&b(y(r.financials),n.years[t]),`historical period correspondence`);let i=p(r.financials,`historical financials`);for(let e of l)f(i[e]===n.years[t][e],`historical inputs`);let s=p(r.reported_financials,`reported financials`);f(b(y(s),n.years[t]),`reported period`);for(let e of l)f(a(s[e])&&/^-?\\d+\\.\\d{2}$/.test(s[e]),`reported source amount`);for(let e of[`gross_profit`,`ordinary_business_income`,`ebitda`,`k1_distribution_ratio`])o.push(C(r[e]))});let s=p(t.current_facts,`facts`);for(let e of u){let t=C(s[e]),r=[`ordinary_business_income`,`ebitda`].includes(e)?`years.${n.years.length-1}.${e}`:`current.${e}`;f(t.fact_id===r,`fact identity`),f(e===`k1_history`?t.status===`available`&&[`stable`,`unstable`,`insufficient_history`].includes(String(t.raw_value)):t.raw_value===null||a(t.raw_value),`fact type`),o.push(t)}let c=m(t.guarantor_contributions,`contributions`);f(c.length===n.guarantors.length,`contributions length`),c.forEach((e,t)=>{let r=p(e,`contribution`);f(r.guarantor_index===t&&r.name===n.guarantors[t].name,`contribution identity`);for(let e of[`business_ebitda`,`outside_income`,`personal_debt`])o.push(C(r[e]))});let _=m(t.k1_history_periods,`history periods`).map(y);f(_.length>=1&&_.length<=2&&b(_[_.length-1],r)&&_.every(e=>n.years.some(t=>b(e,t))),`history periods`);let w=p(t.policy_snapshot,`policy`);f(h(w.version)&&v(w.sba_sop_8_effective)&&v(w.sba_sop_8_1_effective),`policy identity`);for(let e of d)f(e===`consumer_min_credit_score`?Number.isSafeInteger(w[e]):a(w[e]),`policy ${e}`);f(m(w.consumer_required_atr_fields,`ATR fields`).every(h),`ATR fields`);let T=x(t.decision);f(T.policy_version===w.version,`decision policy`);let E=m(t.calculation_trace,`trace`);f(E.length>0,`trace rows`);let D=/* @__PURE__ */ new Map;for(let e of E){let t=p(e,`trace row`),n=C(t);f(h(t.definition_id)&&h(t.expression)&&!D.has(n.fact_id),`trace identity`),D.set(n.fact_id,n);for(let e of m(t.operands,`operands`)){let t=p(e,`operand`);f([`input`,`fact`,`policy`].includes(String(t.reference_type))&&h(t.reference)&&h(t.unit)&&(t.raw_value===null||g(t.raw_value)||typeof t.raw_value==`string`),`operand fields`),f(t.reported_value===null||a(t.reported_value)||Number.isSafeInteger(t.reported_value),`reported operand`)}}for(let e of E){let t=p(e,`trace row`);for(let e of m(t.operands,`operands`)){let t=p(e,`operand`);if(t.reference_type===`fact`){let e=D.get(String(t.reference));f(e&&e.raw_value===t.raw_value&&e.unit===t.unit,`referenced fact`)}else{let e=String(t.reference).split(`/`).slice(1),r=t.reference_type===`policy`?{policy_snapshot:w}:n;for(let t of e)f(typeof r==`object`&&!!r&&Object.prototype.hasOwnProperty.call(r,t),`operand input path`),r=r[t];f(r===t.raw_value,`operand input value`)}}}for(let e of o){let t=D.get(e.fact_id);f(t&&t.raw_value===e.raw_value&&t.reported_value===e.reported_value&&t.status===e.status&&t.unit===e.unit,`fact/trace correspondence`)}for(let e of T.factors){let t=e.name===`uca_positive`?`uca_cash_flow`:e.name;f(e.raw_value===C(s[t]).raw_value,`factor/fact correspondence`)}let O=p(t.fingerprint,`fingerprint`);return f(O.algorithm===`sha256`&&typeof O.value==`string`&&/^[0-9a-f]{64}$/.test(O.value)&&O.content===`normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version`,`fingerprint`),t}function T(e,t){if(!e)throw Error(`Invalid saved-case response or command: ${t}.`)}function E(e,t){return T(typeof e==`object`&&!!e&&!Array.isArray(e),t),e}let D=e=>typeof e==`number`&&Number.isFinite(e),O=e=>typeof e==`string`,k=e=>O(e)&&/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(e),A=e=>O(e)&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(e),j=e=>Number.isSafeInteger(e)&&Number(e)>=1,M=e=>O(e)&&/^[0-9a-f]{64}$/.test(e),N=e=>O(e)&&/^\\d{4}-\\d{2}-\\d{2}$/.test(e)&&Number.isFinite(Date.parse(e))&&new Date(e).toISOString().slice(0,10)===e,P=e=>O(e)&&/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,6})?(?:Z|\\+00:00)$/.test(e)&&N(e.slice(0,10))&&Number.isFinite(Date.parse(e));function F(e,t=0,n=64){if(T(t<n,`JSON depth`),!(e===null||O(e)||typeof e==`boolean`)){if(typeof e==`number`){T(D(e),`finite JSON number`);return}T(typeof e==`object`,`JSON value`);for(let r of Object.values(e))F(r,t+1,n)}}function I(e,t){if(e===t)return!0;if(!e||!t||typeof e!=`object`||typeof t!=`object`||Array.isArray(e)!==Array.isArray(t))return!1;let n=Object.keys(e),r=Object.keys(t);return n.length===r.length&&n.every(n=>Object.prototype.hasOwnProperty.call(t,n)&&I(e[n],t[n]))}function ee(e){return T(O(e)&&[...e].length<=2e3&&e.trim().length>0,`nonblank rationale, at most 2,000 characters`),e.trim()}let L={years:l,existing_debt:[`cpltd_annual`,`operating_lease_annual`],proposed_loan:[`amount`,`annual_rate`,`term_months`],guarantors:[`ownership_percentage`,`wages`,`interest_dividend_income`,`mortgage_pi_annual`,`auto_loan_annual`,`credit_card_min_annual`],working_capital:[`ar_increase`,`inventory_increase`,`ap_increase`,`cash_taxes_paid`]};function R(e){T(O(e)&&e.length<=160&&e.startsWith(`/`),`numeric field path`);let t=e.slice(1).split(`/`),n=t[0],r=t[t.length-1];return T(Object.prototype.hasOwnProperty.call(L,n)&&L[n].includes(r),`numeric field allowlist`),T([`years`,`guarantors`].includes(n)?t.length===3&&/^(?:0|[1-9][0-9]{0,8})$/.test(t[1]):t.length===2,`field index`),t}function te(e,t){let n=R(t),r=n[0],i=n[n.length-1],o=e,s,c={basis:`current_assumptions`,assessment_as_of:String(o.assessment_as_of),period_start:null,period_end:null,guarantor_index:null,guarantor_name:null,unit:`USD dollars`};if(n.length===3){let e=o[r];T(Array.isArray(e)&&Number(n[1])<e.length,`existing input index`),s=E(e[Number(n[1])],`input row`),r===`guarantors`?(c.guarantor_index=Number(n[1]),c.guarantor_name=String(s.name)):c.basis=`annual_financials`}else s=E(o[r],`input group`),r===`working_capital`&&(c.basis=`working_capital`);[`annual_financials`,`working_capital`].includes(c.basis)&&(T(N(s.period_start)&&N(s.period_end),`input dates`),c.period_start=s.period_start,c.period_end=s.period_end),[`annual_rate`,`ownership_percentage`].includes(i)&&(c.unit=`decimal fraction`),i===`term_months`&&(c.unit=`months`);let l=s[i];return T(i===`term_months`?Number.isSafeInteger(l):a(l)||D(l),`numeric input`),{value:l,context:c}}function ne(e,t){let n=E(e,`snapshot`);F(n),T(n.storage_serialization_version===`case-json-v1`&&A(n.case_id)&&A(n.run_id)&&j(n.revision),`snapshot identity`),T(n.parent_revision===(n.revision===1?null:n.revision-1)&&P(n.recorded_at),`snapshot parent/time`),T(M(n.input_hash)&&M(n.payload_hash),`snapshot hashes`),T(t===`\"case-json-v1:${n.case_id}:${n.revision}:${n.payload_hash}\"`,`strong ETag`);let r=E(n.normalized_input,`stored input`),i=E(n.assessment,`stored assessment`);T(O(i.schema_version)&&O(i.calculation_version)&&O(i.serialization_version),`assessment versions`);let o=i.schema_version===`commercial-assessment-v2`&&i.calculation_version===`commercial-calculation-v2`&&i.serialization_version===`assessment-json-v2`,s=o?w(i):null;s&&T(I(r,s.normalized_input),`outer normalized input`);let l=E(n.event,`event`),u=E(l.context,`event context`);if(T(l.case_id===n.case_id&&l.revision===n.revision&&l.run_id===n.run_id&&l.recorded_at===n.recorded_at&&k(l.actor),`event identity`),ee(l.rationale),T(N(u.assessment_as_of),`event as-of`),T(u.period_start===null&&u.period_end===null||N(u.period_start)&&N(u.period_end)&&u.period_start<=u.period_end,`event period`),T(u.guarantor_index===null&&u.guarantor_name===null||Number.isSafeInteger(u.guarantor_index)&&Number(u.guarantor_index)>=0&&O(u.guarantor_name),`event guarantor`),n.revision===1)T(l.kind===`creation`&&l.field_path===null&&l.before===null&&l.after===null&&u.basis===`case_creation`&&u.unit===null&&u.period_start===null&&u.guarantor_index===null,`creation event`);else if(T(l.kind===`edit`&&(a(l.before)||D(l.before))&&(a(l.after)||D(l.after))&&!c(l.before,l.after)&&O(l.field_path),`edit event`),R(l.field_path),T([`annual_financials`,`working_capital`,`current_assumptions`].includes(String(u.basis))&&[`USD dollars`,`decimal fraction`,`months`].includes(String(u.unit)),`edit context`),s){let e=te(s.normalized_input,l.field_path);T(e.value===l.after&&I(e.context,u),`server-derived edit context`)}return s&&T(u.assessment_as_of===s.normalized_input.assessment_as_of,`event assumptions date`),z(n.recording),{snapshot:n,etag:t,assessment:s,compatibility:o?null:`Stored assessment definition: ${i.schema_version} / ${i.calculation_version} / ${i.serialization_version}. Original JSON is available; typed display and editing are unavailable.`}}function z(e){let t=E(e,`recording metadata`),n=E(t.packages,`installed packages`);T(O(t.python_version)&&O(t.sqlite_version)&&M(t.dependency_baseline_sha256),`recording versions`);for(let e of[`fastapi`,`pydantic`,`starlette`,`uvicorn`])T(O(n[e])&&n[e].length>0,`installed ${e}`);return T(t.source_status===`development_unverified`?t.source_revision===null:t.source_status===`build_reported`&&O(t.source_revision)&&/^[0-9a-f]{40}$/.test(t.source_revision),`recorded source`),t}let B=[`revenue_change`,`cogs_change`,`operating_expense_change`,`proposed_rate_change_bps`],V=`commercial-scenario-preview-v2`;function H(e,t){T(Object.keys(e).length===t.length&&t.every(t=>Object.prototype.hasOwnProperty.call(e,t)),`scenario fields`)}function U(e,t){T(O(e),`scenario text`);let n=e.replace(/^[\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+|[\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+$/gu,``);return T(n.length>0&&[...n].length<=t,`nonblank scenario text, at most ${t} characters`),n}function W(e,t=!1){let n=E(e,`scenario`),r=E(n.assumptions,`shocks`);T(O(n.scenario_key)&&/^[A-Za-z0-9_-]{1,64}$/.test(n.scenario_key),`scenario key`),H(r,B);for(let e of B)T((a(r[e])||t&&D(r[e]))&&(e===`proposed_rate_change_bps`||s(o(r[e]),`-1`)>=0),`finite explicit shock`);return{scenario_key:n.scenario_key,name:U(n.name,120),rationale:U(n.rationale,2e3),assumptions:r}}function G(e){let t=E(e,`scenario command`),n=[`commercial-scenario-comparison-create-v1`,`commercial-scenario-comparison-create-v2`].includes(String(t.schema_version)),r=String(t.schema_version).endsWith(`-v1`);T(n||t.schema_version===V||t.schema_version===`commercial-scenario-preview-v1`,`scenario command version`),H(t,[`schema_version`,`baseline_run_id`,`scenarios`,...n?[`expected_preview_fingerprint`]:[]]),T(A(t.baseline_run_id)&&String(t.baseline_run_id).toLowerCase()===t.baseline_run_id,`canonical baseline run`),n&&T(M(t.expected_preview_fingerprint),`reviewed preview fingerprint`),T(Array.isArray(t.scenarios)&&t.scenarios.length>=1&&t.scenarios.length<=10,`1–10 scenarios`);let i=/* @__PURE__ */ new Set;for(let e of t.scenarios){H(E(e,`scenario command row`),[`scenario_key`,`name`,`rationale`,`assumptions`]);let t=W(e,r);T(I(t,e)&&!i.has(t.scenario_key),`normalized unique scenario command`),i.add(t.scenario_key)}return t}function K(e){let t=E(e.baseline,`preview baseline`);return T(Array.isArray(e.scenarios),`preview scenarios`),G({schema_version:e.schema_version,baseline_run_id:t.run_id,scenarios:e.scenarios.map(t=>W(t,e.schema_version===`commercial-scenario-preview-v1`))})}function q(e,t){return T(Array.isArray(e),t),e}function J(e){return e===null||a(e)}function Y(e){return A(e)&&e.toLowerCase()===e}function X(e){T((e.schema_version===V&&e.serialization_version===`scenario-preview-json-v2`||e.schema_version===`commercial-scenario-preview-v1`&&e.serialization_version===`scenario-preview-json-v1`)&&e.persisted===!1&&O(e.scenario_definition_version)&&O(e.calculation_version),`preview envelope versions`);let t=E(e.baseline,`baseline evidence`);T(Y(t.case_id)&&Y(t.run_id)&&j(t.revision)&&M(t.input_hash)&&M(t.payload_hash),`baseline evidence identity`);let n=E(t.assessment,`original assessment`),r=E(e.fingerprint,`preview fingerprint`);T(r.algorithm===`sha256`&&M(r.value)&&r.content===`baseline_identity+payload_hash+normalized_command+policy_snapshot+versions`,`preview fingerprint`);let i=E(e.selected_period,`selected operating period`);T(N(i.period_start)&&N(i.period_end)&&i.period_start<=i.period_end&&N(e.assumptions_as_of)&&i.period_end<=e.assumptions_as_of,`preview dates`),T(I(e.selected_period,n.selected_period)&&e.assumptions_as_of===n.assumptions_as_of&&I(e.policy_snapshot,n.policy_snapshot),`baseline period and retained policy`);let a=E(n.normalized_input,`baseline input`);return T(I(e.units,a.units),`baseline units`),T(q(e.held_fixed_assumptions,`held fixed assumptions`).length>0&&e.held_fixed_assumptions.every(O)&&O(e.disclaimer),`preview explanation`),K(e),{b:t,a:n}}function re(e,t,n){let r=E(e,`scenario preview`);F(r,0,100);let{b:i,a}=X(r);T(r.schema_version===V&&r.scenario_definition_version===`commercial-scenario-definition-v2`&&r.calculation_version===`commercial-calculation-v2`,`supported live scenario definition`);let o=w(a);t&&T(i.case_id===t.snapshot.case_id&&i.revision===t.snapshot.revision&&i.run_id===t.snapshot.run_id&&i.input_hash===t.snapshot.input_hash&&i.payload_hash===t.snapshot.payload_hash&&I(o,t.snapshot.assessment),`selected original baseline`),n&&T(I(K(r),G(n)),`reviewed normalized command`);for(let e of r.scenarios)ie(e,r,o);return r}function ie(e,t,n){let r=E(e,`scenario result`),i=W(r);T(I({scenario_key:r.scenario_key,name:r.name,rationale:r.rationale,assumptions:r.assumptions},i)&&r.coverage_basis===`stressed_latest_period_current_pro_forma`,`normalized projection command/basis`);let o=E(r.projection_inputs,`projected inputs`),s=n.normalized_input;S({...s,years:[...s.years.slice(0,-1),o.operating],proposed_loan:o.proposed_loan,existing_debt:o.existing_debt,guarantors:o.guarantors,working_capital:o.working_capital});for(let e of[`existing_debt`,`guarantors`,`working_capital`])T(I(o[e],s[e]),`held-fixed projected inputs`);let c=E(o.operating,`projected operating`),d=E(o.proposed_loan,`projected loan`),f=s.years[s.years.length-1];for(let e of l)[`gross_receipts`,`cogs`,`operating_expense_excl_dna_interest_comp`].includes(e)||T(c[e]===f[e],`held-fixed financial lines`);T(c.period_start===f.period_start&&c.period_end===f.period_end,`projected period`);for(let e of Object.keys(s.proposed_loan))e!==`annual_rate`&&T(d[e]===s.proposed_loan[e],`held-fixed loan`);let p=E(r.current_facts,`projected facts`),m=[];for(let e of u){let t=C(p[e]),r=e===`k1_history`||e===`k1_ratio_difference`,i=r?`baseline.`+n.current_facts[e].fact_id:[`ordinary_business_income`,`ebitda`].includes(e)?`projection.operating.${e}`:`projection.current.${e}`;T(t.fact_id===i&&(r?I(t,{...n.current_facts[e],fact_id:i}):J(t.raw_value)),`projected fact identity/type/observed history`),m.push(t)}let h=q(r.guarantor_contributions,`projected guarantors`);T(h.length===s.guarantors.length,`guarantor count`),h.forEach((e,t)=>{let n=E(e,`guarantor contribution`);T(n.guarantor_index===t&&n.name===s.guarantors[t].name,`guarantor identity`);for(let e of[`business_ebitda`,`outside_income`,`personal_debt`]){let r=C(n[e]);T(r.fact_id===`projection.current.guarantors.${t}.${e}`&&J(r.raw_value),`projected guarantor fact`),m.push(r)}});let g=x(r.decision);T(g.policy_version===n.policy_snapshot.version,`retained decision policy`);let _=q(r.calculation_trace,`projection trace`),v=/* @__PURE__ */ new Map;for(let e of _){let t=E(e,`trace row`),n=C(t);T(O(t.definition_id)&&O(t.expression)&&!v.has(n.fact_id),`trace identity`),v.set(n.fact_id,n),q(t.operands,`trace operands`)}for(let e of n.calculation_trace){let t={...e,fact_id:`baseline.`+e.fact_id,operands:e.operands.map(e=>({...e,reference:e.reference_type===`fact`?`baseline.`+e.reference:e.reference_type===`input`?`/baseline/assessment/normalized_input`+e.reference:e.reference}))};T(I(v.get(t.fact_id),t),`retained observed trace identity`)}for(let e of _)for(let n of E(e,`trace row`).operands){let e=E(n,`operand`);if(T(O(e.reference)&&O(e.unit)&&(e.raw_value===null||D(e.raw_value)||O(e.raw_value)),`operand value`),e.reference_type===`fact`){let t=v.get(e.reference);T(t&&t.raw_value===e.raw_value&&t.unit===e.unit,`referenced scenario fact`)}else{T([`input`,`policy`].includes(String(e.reference_type))&&e.reference.startsWith(`/`),`operand reference`);let n={...r,baseline:t.baseline,policy_snapshot:t.policy_snapshot};for(let t of e.reference.slice(1).split(`/`)){let e=ae(n);T(Object.prototype.hasOwnProperty.call(e,t),`scenario operand path`),n=e[t]}T(n===e.raw_value,`scenario operand value`)}}for(let e of m){let t=v.get(e.fact_id);T(t&&[`fact_id`,`raw_value`,`reported_value`,`unit`,`display_precision`,`status`,`explanation`].every(n=>t[n]===e[n]),`fact/trace fields`)}let y=q(r.comparisons,`metric comparisons`);T(y.length===u.length-1,`comparison count`);let b=/* @__PURE__ */ new Set;for(let e of y){let t=E(e,`metric comparison`);T(O(t.metric)&&u.includes(t.metric)&&t.metric!==`k1_history`&&!b.has(t.metric),`compared metric identity`),b.add(t.metric);let r=n.current_facts[t.metric],i=C(p[t.metric]);T(t.baseline_fact_id===`baseline.`+r.fact_id&&t.projected_fact_id===i.fact_id&&t.baseline_value===r.raw_value&&t.projected_value===i.raw_value&&t.unit===i.unit&&J(t.delta),`comparison fact links`),T(r.raw_value===null||i.raw_value===null?t.delta===null&&O(t.delta_explanation):a(t.delta)&&t.delta_explanation===null,`comparison availability`);let o=g.factors.find(e=>e.name===(t.metric===`uca_cash_flow`?`uca_positive`:t.metric));if([`dscr`,`fccr`,`global_dscr`,`uca_cash_flow`].includes(t.metric)){let e=E(t.policy_headroom,`policy headroom`);T(o&&e.comparison_operator===o.comparison_operator&&e.approval_threshold===o.threshold&&e.decline_threshold===o.decline_threshold,`headroom policy`);for(let t of[`baseline_approval`,`projected_approval`,`baseline_decline`,`projected_decline`])T(J(e[t]),`finite headroom`)}else T(t.policy_headroom===null,`non-policy headroom`)}for(let e of g.factors){let t=e.name===`uca_positive`?`uca_cash_flow`:e.name,r=n.decision.factors.find(t=>t.name===e.name);T(e.raw_value===C(p[t]).raw_value&&r&&[`threshold`,`decline_threshold`,`comparison_operator`,`weight`,`source`].every(t=>e[t]===r[t]),`scenario factor fact and retained policy`),t===`k1_history`&&T(I(e,r),`held-fixed observed K-1 factor`)}let w=q(r.factor_changes,`factor changes`);T(w.length===g.factors.length,`factor change count`);let k=/* @__PURE__ */ new Set;for(let e of w){let t=E(e,`factor change`),r=n.decision.factors.find(e=>e.name===t.name),i=g.factors.find(e=>e.name===t.name);T(O(t.name)&&!k.has(t.name)&&r&&i&&I(t.baseline,r)&&I(t.projected,i)&&t.changed===!I(r,i)&&t.basis===(t.name===`k1_history`?`observed_history`:`projected_current`),`factor change links`),k.add(t.name),T(t.projected_fact_id===C(p[t.name===`uca_positive`?`uca_cash_flow`:t.name]).fact_id,`factor projected reference`)}let A=E(r.outcome_change,`outcome change`);T(A.baseline===n.decision.outcome&&A.projected===g.outcome&&A.changed===(A.baseline!==A.projected),`outcome change links`);let j=q(r.reason_changes,`reason changes`),M=Array.from(new Set([...n.decision.reasons,...g.reasons].map(e=>e.code))).filter(e=>!I(n.decision.reasons.find(t=>t.code===e)??null,g.reasons.find(t=>t.code===e)??null));T(j.length===M.length,`reason changes count`);let N=/* @__PURE__ */ new Set;for(let e of j){let t=E(e,`reason change`),r=n.decision.reasons.find(e=>e.code===t.code)??null,i=g.reasons.find(e=>e.code===t.code)??null;T(O(t.code)&&M.includes(t.code)&&!N.has(t.code)&&I(t.baseline,r)&&I(t.projected,i)&&t.change===(r===null?`added`:i===null?`removed`:`changed`),`reason change links`),N.add(t.code)}}function ae(e){return T(typeof e==`object`&&!!e,`operand path object`),e}function oe(e,t){let n=E(e,`original comparison`);F(n,0,100),T([`commercial-scenario-comparison-v1`,`commercial-scenario-comparison-v2`].includes(String(n.schema_version))&&n.storage_serialization_version===`scenario-comparison-json-v1`&&n.persisted===!0&&Y(n.comparison_id)&&Y(n.case_id)&&Y(n.baseline_run_id)&&j(n.baseline_revision)&&M(n.payload_hash),`comparison storage identity`),T(P(n.recorded_at)&&/^\\d{4}-\\d\\d-\\d\\dT(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{6}\\+00:00$/.test(n.recorded_at)&&k(n.actor),`comparison recording time/actor`),z(n.recording),T(t===`\"scenario-comparison-json-v1:${n.case_id}:${n.comparison_id}:${n.payload_hash}\"`,`comparison ETag`);let r=E(n.preview,`original preview`),{b:i,a}=X(r);T(i.case_id===n.case_id&&i.revision===n.baseline_revision&&i.run_id===n.baseline_run_id,`inner/outer original baseline`);let o=r.schema_version===V&&r.scenario_definition_version===`commercial-scenario-definition-v2`&&r.calculation_version===`commercial-calculation-v2`&&a.schema_version===`commercial-assessment-v2`&&a.calculation_version===`commercial-calculation-v2`&&a.serialization_version===`assessment-json-v2`;return{record:n,etag:t,preview:o?re(r):null,compatibility:o?null:`Original definition: ${r.scenario_definition_version} / ${r.calculation_version}; baseline ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON remains available; typed projection and new preview are unavailable.`}}function se(e,t){return`spreadline-case-${e.case_id}-r${e.revision}-${e.run_id}${t?`-comparison-${t.comparison_id}`:``}.json`}function Z(e,t){let n=/* @__PURE__ */ new Set;function r(e,i){if(T(i<t,`export source JSON depth`),e===null||typeof e==`string`||typeof e==`boolean`)return e;if(typeof e==`number`)return T(Number.isFinite(e),`export finite number`),e;T(typeof e==`object`&&!!e,`export JSON value`);let a=e;T(!n.has(a),`export JSON cycle`),T(Object.getOwnPropertySymbols(a).length===0,`export JSON symbol keys`);let o=Array.isArray(a);T(o||Object.getPrototypeOf(a)===Object.prototype||Object.getPrototypeOf(a)===null,`export plain JSON object`);let s=Object.getOwnPropertyNames(a).filter(e=>!o||e!==`length`);o&&T(s.length===a.length&&s.every((e,t)=>e===String(t)),`export dense JSON array`),n.add(a);let c=o?[]:Object.create(null);for(let e of s){let t=Object.getOwnPropertyDescriptor(a,e);T(t.enumerable&&`value`in t,`export plain JSON property`),c[e]=r(t.value,i+1)}return n.delete(a),Object.freeze(c)}return r(e,0)}function ce(e,t){let n=e.snapshot,r=t.record,i=E(r.preview.baseline,`export comparison baseline`);T(r.case_id===n.case_id&&r.baseline_revision===n.revision&&r.baseline_run_id===n.run_id&&i.case_id===n.case_id&&i.revision===n.revision&&i.run_id===n.run_id&&i.input_hash===n.input_hash&&i.payload_hash===n.payload_hash&&I(i.assessment,n.assessment),`retained comparison must match the selected original case, revision, run, hashes and full baseline assessment`)}function le(e,t){let n=Z(e.snapshot,64),r=ne(n,e.etag),i=t===null?null:oe(Z(t.record,100),t.etag);i&&ce(r,i);let a=se(n,i?.record??null);return{package:Object.freeze({schema_version:`spreadline-review-package-v1`,serialization_version:`review-package-json-v1`,scope:`saved_case_revision`,case:Object.freeze({etag:r.etag,snapshot:n}),comparison:i?Object.freeze({etag:i.etag,record:i.record}):null,provenance:Object.freeze({representation:`browser_parsed_json`,actor_status:`prototype_unverified`,integrity_status:`recorded_hashes_not_verified_by_export`}),disclaimer:`Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.`}),filename:a,view:r,comparison:i}}function*Q(e){yield`\"`;for(let t=0;t<e.length;){let n=Math.min(t+4096,e.length);n<e.length&&e.charCodeAt(n-1)>=55296&&e.charCodeAt(n-1)<=56319&&e.charCodeAt(n)>=56320&&e.charCodeAt(n)<=57343&&n--,yield JSON.stringify(e.slice(t,n)).slice(1,-1),t=n}yield`\"`}function*$(e,t=0,n=/* @__PURE__ */ new Set){if(T(t<104,`export envelope JSON depth`),typeof e==`string`){yield*Q(e);return}if(e===null||typeof e==`boolean`){yield String(e);return}if(typeof e==`number`){T(Number.isFinite(e),`export finite number`),yield JSON.stringify(e);return}T(typeof e==`object`&&!!e,`export JSON value`);let r=e,i=Array.isArray(r);T(!n.has(r),`export JSON cycle`),T(Object.getOwnPropertySymbols(r).length===0&&(i||Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null),`export plain JSON object`);let a=Object.getOwnPropertyNames(r).filter(e=>!i||e!==`length`);i?T(a.length===r.length&&a.every((e,t)=>e===String(t)),`export dense JSON array`):a.sort(),n.add(r),yield i?`[`:`{`;for(let e=0;e<a.length;e++){let o=a[e],s=Object.getOwnPropertyDescriptor(r,o);T(s.enumerable&&`value`in s,`export plain JSON property`),yield`${e?`,`:``}\\n${`  `.repeat(t+1)}`,i||(yield*Q(o),yield`: `),yield*$(s.value,t+1,n)}a.length&&(yield`\\n${`  `.repeat(t)}`),yield i?`]`:`}`,n.delete(r)}async function ue(e,t){let n=new TextEncoder,r=[],i=0,a=``,o=0;function s(){if(t?.aborted)throw Error(`Export preparation cancelled.`)}function c(){s();let e=n.encode(a);if(i+e.byteLength>16777216)throw Error(`The complete review package exceeds 16 MiB. No file was prepared. Choose a case-only package explicitly, or a smaller original.`);i+=e.byteLength,o+=e.byteLength,r.push(e),a=``}s();for(let t of $(e))a+=t,a.length>=8192&&c(),o>=131072&&(await new Promise(e=>setTimeout(e,0)),o=0,s());return a+=`\n`,c(),s(),{chunks:r,size:i}}self.onmessage=async e=>{try{let t=le(e.data.view,e.data.comparison),{chunks:n,size:r}=await ue(t.package),i=n.map(e=>e.buffer);self.postMessage({filename:t.filename,buffers:i,size:r},{transfer:i})}catch(e){self.postMessage({error:e instanceof Error?e.message:`Unable to prepare the original review package.`})}}})();", hi = typeof self < "u" && self.Blob && new Blob(["(self.URL || self.webkitURL).revokeObjectURL(self.location.href);", mi], { type: "text/javascript;charset=utf-8" });
function gi(e) {
	let t;
	try {
		if (t = hi && (self.URL || self.webkitURL).createObjectURL(hi), !t) throw "";
		let n = new Worker(t, { name: e?.name });
		return n.addEventListener("error", () => {
			(self.URL || self.webkitURL).revokeObjectURL(t);
		}), n;
	} catch {
		return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(mi), { name: e?.name });
	}
}
//#endregion
//#region src/useReviewDownload.ts
function _i(e) {
	let t = (0, c.useRef)(e);
	t.current = e;
	let n = (0, c.useRef)(null), r = (0, c.useRef)(null), i = (0, c.useRef)(!0), [a, o] = (0, c.useState)({
		scope: e,
		busy: !1,
		error: "",
		file: null
	});
	function s(e) {
		n.current && (e === void 0 || n.current.scope === e) && (n.current.worker.terminate(), n.current = null), r.current && (e === void 0 || r.current.scope === e) && (URL.revokeObjectURL(r.current.url), r.current = null);
	}
	(0, c.useEffect)(() => () => s(e), [e]), (0, c.useEffect)(() => (i.current = !0, () => {
		i.current = !1, s();
	}), []);
	function l(a, c) {
		if (n.current?.scope === e) return;
		s(), o({
			scope: e,
			busy: !0,
			error: "",
			file: null
		});
		let l, u = fi(a.snapshot, c?.record ?? null);
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
				worker: new gi()
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
		prepare: l
	};
}
//#endregion
//#region src/Review.tsx
function vi(e) {
	return typeof e == "string" ? e.length > 240 ? `${e.slice(0, 240)}…` : e : "Unavailable";
}
function yi({ view: e, selection: t, headRevision: n, sourceScope: r, original: i, pending: a, onOpenBaseline: o }) {
	let s = i.loading || i.error ? null : i.view, l = `${r}:${e?.etag ?? ""}:${i.context}:${i.loading}:${s?.etag ?? ""}:${i.error}`, [u, d] = (0, c.useState)({
		source: l,
		included: !1
	}), f = u.source === l && u.included, p = _i(`${l}:${f}`), m = !1;
	if (e && s) try {
		pi(e, s), m = !0;
	} catch {}
	let h = e?.assessment, g = e?.snapshot, _ = s?.record, v = s?.preview?.scenarios.length ?? (Array.isArray(_?.preview.scenarios) ? _.preview.scenarios.length : 0);
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "reviewWorkspace",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel reviewIdentity",
				children: [
					/* @__PURE__ */ (0, V.jsx)("p", {
						className: "eyebrow",
						children: "ORIGINAL RECORD · REVIEW PACKAGE"
					}),
					/* @__PURE__ */ (0, V.jsx)("h2", { children: "Saved-run review" }),
					g ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
						/* @__PURE__ */ (0, V.jsx)("h3", { children: vi(g.normalized_input.borrower_name) }),
						/* @__PURE__ */ (0, V.jsxs)("dl", {
							className: "reviewFacts",
							children: [
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Case" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: g.case_id })] }),
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Selected revision / run" }), /* @__PURE__ */ (0, V.jsxs)("dd", { children: [
									g.revision,
									" / ",
									g.run_id
								] })] }),
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Recorded at" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: g.recorded_at })] }),
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Selection" }), /* @__PURE__ */ (0, V.jsxs)("dd", { children: [t === "latest" ? "Latest when fetched" : "Original selected revision", n === null ? " · current head not confirmed" : ` · known head ${n}`] })] }),
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Financial definitions" }), /* @__PURE__ */ (0, V.jsxs)("dd", { children: [
									vi(g.assessment.schema_version),
									" /",
									" ",
									vi(g.assessment.calculation_version),
									" /",
									" ",
									vi(g.assessment.serialization_version)
								] })] }),
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Recording" }), /* @__PURE__ */ (0, V.jsxs)("dd", { children: [
									"Actor: prototype demo, unverified ·",
									" ",
									g.recording.source_status === "build_reported" ? "build revision reported, unverified" : "development build, unverified"
								] })] })
							]
						}),
						h ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
							/* @__PURE__ */ (0, V.jsxs)("p", { children: [
								"Operating period: ",
								h.selected_period.period_start,
								" –",
								" ",
								h.selected_period.period_end,
								" · assumptions as of",
								" ",
								h.assumptions_as_of,
								" · USD dollars."
							] }),
							/* @__PURE__ */ (0, V.jsxs)("p", { children: [
								"Original outcome:",
								" ",
								/* @__PURE__ */ (0, V.jsx)("strong", { children: h.decision.outcome.toUpperCase() }),
								" · policy ",
								vi(h.policy_snapshot.version),
								". Current pro forma coverage; observed history remains separate."
							] }),
							/* @__PURE__ */ (0, V.jsx)("div", {
								className: "reviewMetrics",
								children: [
									["EBITDA", h.current_facts.ebitda],
									["UCA cash flow", h.current_facts.uca_cash_flow],
									["DSCR", h.current_facts.dscr],
									["FCCR", h.current_facts.fccr],
									["Global DSCR", h.current_facts.global_dscr],
									["Observed K-1 history", h.current_facts.k1_history]
								].map(([e, t]) => /* @__PURE__ */ (0, V.jsxs)("div", { children: [
									/* @__PURE__ */ (0, V.jsx)("span", { children: e }),
									/* @__PURE__ */ (0, V.jsx)("strong", { children: nr(t) }),
									t.explanation && /* @__PURE__ */ (0, V.jsx)("small", { children: vi(t.explanation) })
								] }, e))
							}),
							/* @__PURE__ */ (0, V.jsxs)("p", { children: [
								"Recorded reasons: ",
								h.decision.reasons.length,
								". Factors and calculations are in Calculation details above and in the Credit Memo."
							] })
						] }) : /* @__PURE__ */ (0, V.jsx)("p", {
							className: "warning",
							children: "Original JSON only. These financial definitions are not supported for typed conclusions. The guarded original can still be downloaded."
						})
					] }) : /* @__PURE__ */ (0, V.jsx)("p", { children: "Save or open a dated commercial revision to review and export its original evidence. Unsaved inputs, legacy decisions and incomplete case transitions cannot supply this package." })
				]
			}),
			/* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel reviewComparison",
				children: [
					/* @__PURE__ */ (0, V.jsx)("h2", { children: "Retained comparison" }),
					i.loading ? /* @__PURE__ */ (0, V.jsx)("p", {
						role: "status",
						children: "Loading the selected original comparison…"
					}) : i.error ? /* @__PURE__ */ (0, V.jsx)("p", {
						role: "alert",
						children: i.error
					}) : _ ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
						/* @__PURE__ */ (0, V.jsxs)("dl", {
							className: "reviewFacts",
							children: [
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Comparison" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: _.comparison_id })] }),
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Baseline revision / run" }), /* @__PURE__ */ (0, V.jsxs)("dd", { children: [
									_.baseline_revision,
									" / ",
									_.baseline_run_id
								] })] }),
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Recorded at" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: _.recorded_at })] })
							]
						}),
						/* @__PURE__ */ (0, V.jsxs)("p", { children: [
							"Full retained batch: ",
							v,
							" ",
							v === 1 ? "scenario" : "scenarios",
							" in original order."
						] }),
						/* @__PURE__ */ (0, V.jsx)("ul", { children: (s?.preview?.scenarios ?? _.preview.scenarios).map((e, t) => /* @__PURE__ */ (0, V.jsx)("li", { children: vi(e.name) }, t)) }),
						/* @__PURE__ */ (0, V.jsxs)("p", {
							className: "reviewHash",
							children: [
								"Preview fingerprint:",
								" ",
								vi(_.preview.fingerprint?.value)
							]
						}),
						s?.compatibility && /* @__PURE__ */ (0, V.jsx)("p", {
							className: "warning",
							children: "Original JSON only for this comparison; typed projections are unavailable."
						}),
						!m && /* @__PURE__ */ (0, V.jsx)("p", {
							className: "warning",
							children: "This retained comparison has a different original baseline. Open that explicit revision to match its evidence before inclusion."
						}),
						!m && g && _.case_id === g.case_id && /* @__PURE__ */ (0, V.jsx)("button", {
							onClick: () => o({
								caseId: _.case_id,
								revision: _.baseline_revision
							}),
							children: "Open comparison baseline revision"
						})
					] }) : /* @__PURE__ */ (0, V.jsx)("p", { children: "Open a retained original in Stress Tests to include its full batch. A live preview or pending save is excluded." }),
					/* @__PURE__ */ (0, V.jsxs)("label", {
						className: "reviewInclude",
						children: [/* @__PURE__ */ (0, V.jsx)("input", {
							type: "checkbox",
							checked: f,
							disabled: !e || !m || i.loading,
							onChange: (e) => d({
								source: l,
								included: e.target.checked
							})
						}), "Include this retained comparison"]
					})
				]
			}),
			/* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel reviewExport",
				children: [
					/* @__PURE__ */ (0, V.jsx)("h2", { children: "JSON review package" }),
					/* @__PURE__ */ (0, V.jsx)("p", {
						className: "provenanceNotice",
						children: "Contains parsed originals and recorded hashes with explicit unverified provenance; does not claim original server bytes or independently verified hashes."
					}),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Includes the full selected original: financial inputs, guarantor details, assessment, policy, trace, reasons, its revision event and recording metadata",
						f ? ", plus the full matching retained comparison batch" : "",
						". This is one revision event, not the entire case history."
					] }),
					/* @__PURE__ */ (0, V.jsx)("p", { children: "Browser-parsed JSON representation; formatting and numeric spellings can differ from server bytes. Recorded hashes are carried unchanged, not verified by this export or calculated over the downloaded file." }),
					a && /* @__PURE__ */ (0, V.jsx)("p", {
						className: "warning",
						children: "Pending work is excluded. Downloading this original leaves recovery tracking unchanged."
					}),
					/* @__PURE__ */ (0, V.jsx)("button", {
						disabled: !e || p.busy || f && !m,
						onClick: () => {
							e && p.prepare(e, f ? s : null);
						},
						children: "Download JSON review package"
					}),
					/* @__PURE__ */ (0, V.jsx)("p", {
						role: "status",
						children: p.busy && g ? `Preparing ${fi(g, f ? _ ?? null : null)}…` : p.file ? `Prepared ${p.file.filename} (${p.file.size.toLocaleString("en-US")} bytes). The browser handles saving.` : "Maximum complete file: 16 MiB. No evidence is truncated."
					}),
					p.error && /* @__PURE__ */ (0, V.jsx)("p", {
						role: "alert",
						children: p.error
					}),
					p.file && /* @__PURE__ */ (0, V.jsx)("a", {
						className: "reviewDownload",
						href: p.file.url,
						download: p.file.filename,
						children: "Download prepared JSON"
					}),
					/* @__PURE__ */ (0, V.jsx)("p", {
						className: "fine",
						children: di
					})
				]
			})
		]
	});
}
//#endregion
//#region src/analysisContracts.ts
var bi = class extends Error {
	kind;
	constructor(e, t) {
		super(e), this.kind = t, this.name = "AnalysisContractError";
	}
}, xi = [
	"dscr",
	"fccr",
	"global_dscr"
], Si = [
	...we,
	"gross_profit",
	"ordinary_business_income",
	"ebitda"
], Ci = [
	"approve",
	"review",
	"decline"
], wi = [
	"meets_approval",
	"review_band",
	"below_decline_floor",
	"not_applicable"
], Ti = [
	"coverage_meets_approval",
	"uca_meets_approval",
	"k1_history_stable",
	"coverage_below_decline_floor"
], Ei = [
	"approve_all_conditions",
	"review_k1_history",
	"decline_coverage_floor",
	"review_otherwise"
], Di = [
	"dscr",
	"fccr",
	"global_dscr",
	"k1_history",
	"uca_positive"
];
function Oi(e, t) {
	throw new bi(`Analysis outside the display contract: ${t}`, e);
}
function U(e, t) {
	e || Oi("invalid", t);
}
function W(e, t) {
	return U(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
function ki(e, t, n = 0, r = Infinity) {
	return U(Array.isArray(e) && e.length >= n && e.length <= r, t), e;
}
var G = (e) => typeof e == "string" && e.trim().length > 0, Ai = (e) => typeof e == "string" && y(e), ji = (e) => e === null || Ai(e), Mi = (e) => typeof e == "string" && /^\d{4}-\d{2}-\d{2}$/.test(e), Ni = (e, t) => e.period_start === t.period_start && e.period_end === t.period_end;
function Pi(e, t) {
	let n = W(e, "analysis");
	(n.schema_version !== "commercial-analysis-v1" || n.definition_version !== "commercial-analysis-definition-v1" || n.serialization_version !== "analysis-json-v1") && Oi("unsupported", "versions");
	let r = W(n.assessment_fingerprint, "fingerprint");
	r.value !== t.fingerprint && Oi("mismatch", "assessment fingerprint");
	let i = ki(n.periods, "periods", 1, 10);
	(i.length !== t.years.length || i.some((e, n) => !Ni(W(e, "period"), t.years[n]) || W(e, "period").period_index !== n) || !Ni(W(n.selected_period, "selected period"), t.years[t.years.length - 1])) && Oi("mismatch", "periods"), U(r.algorithm === "sha256" && typeof r.content == "string" && G(n.calculation_version) && n.persisted === !1 && G(n.policy_version) && Mi(n.assumptions_as_of) && G(n.disclaimer), "identity"), U(n.source === "stateless_request" ? n.baseline === null : n.source === "saved_revision" && Fi(n.baseline), "source and baseline");
	let a = [], o = (e, t, n = !0) => {
		let r;
		try {
			r = Le(e);
		} catch {
			Oi("invalid", t);
		}
		return U(r.fact_id === t, t), n && a.push(r), r;
	}, s = (e, t) => {
		let n = W(e, t);
		U(Object.keys(n).length === Si.length, t);
		for (let e of Si) o(n[e], `${t}.${e}`);
	};
	i.forEach((e, n) => {
		let r = W(e, "period");
		if (s(r.common_size, `analysis.periods.${n}.common_size`), r.prior_period === null) U(r.prior_period_adjacent === null && r.change_vs_prior === null, "first period");
		else {
			let e = W(r.prior_period, "prior period");
			U(n > 0 && Ni(e, t.years[n - 1]) && typeof r.prior_period_adjacent == "boolean", "prior period"), s(r.change_vs_prior, `analysis.periods.${n}.change_vs_prior`);
		}
	});
	let c = W(n.debt_capacity, "debt capacity"), l = ki(c.constraints, "constraints", 3, 3).map((e) => W(e, "constraint"));
	U(c.basis === "latest_period_current_pro_forma" && xi.every((e) => l.filter((t) => t.constraint === e).length === 1) && xi.includes(c.binding_constraint) && typeof c.has_capacity == "boolean", "debt capacity");
	for (let e of l) U(Ai(e.approval_minimum), "approval minimum"), o(e.max_annual_payment, `analysis.debt_capacity.${String(e.constraint)}.max_annual_payment`);
	for (let e of [
		"max_annual_payment",
		"max_monthly_payment",
		"max_principal",
		"requested_principal",
		"principal_headroom"
	]) o(c[e], `analysis.debt_capacity.${e}`);
	let u = W(n.breakevens, "breakevens");
	o(u.ownership_weight, "analysis.breakevens.ownership_weight");
	let d = ki(u.rows, "breakeven rows", 6, 6).map((e) => W(e, "breakeven"));
	for (let e of xi) for (let t of ["approval_minimum", "decline_floor"]) U(d.filter((n) => n.constraint === e && n.threshold_kind === t).length === 1, "breakeven rows");
	for (let e of d) {
		U(Ai(e.threshold), "breakeven threshold");
		for (let t of [
			"ebitda_breakeven",
			"ebitda_cushion",
			"revenue_cushion"
		]) o(e[t], `analysis.breakevens.${String(e.constraint)}.${String(e.threshold_kind)}.${t}`);
	}
	for (let e of ["binding_approval_constraint", "binding_decline_constraint"]) U(u[e] === null || xi.includes(u[e]), e);
	Ii(W(n.amortization, "amortization")), Li(W(n.sensitivity, "sensitivity"), o);
	let f = W(n.explanation, "explanation");
	U(Ci.includes(f.outcome) && Ei.includes(f.matched_rule) && G(f.headline) && ki(f.rules, "rules", 1).every(G), "explanation");
	let p = ki(f.conditions, "conditions", 4, 4).map((e) => W(e, "condition"));
	U(Ti.every((e) => p.filter((t) => t.condition_id === e).length === 1) && p.every((e) => G(e.description) && typeof e.satisfied == "boolean"), "conditions");
	let m = ki(f.factors, "factors", 5, 5).map((e) => W(e, "factor"));
	U(Di.every((e) => m.filter((t) => t.name === e).length === 1), "factor names");
	for (let e of m) U(G(e.label) && wi.includes(e.status) && G(e.summary) && (e.comparison_operator === null || typeof e.comparison_operator == "string") && (typeof e.value == "string" || typeof e.value == "boolean") && [e.raw_value, e.threshold].every((e) => e === null || typeof e == "string" || typeof e == "boolean") && ji(e.decline_threshold) && Ai(e.weight) && Ai(e.score_contribution) && typeof e.blocks_approval == "boolean" && typeof e.triggers_decline == "boolean", "factor"), o(e.approval_cushion, `analysis.explanation.${String(e.name)}.approval_cushion`), o(e.decline_cushion, `analysis.explanation.${String(e.name)}.decline_cushion`);
	let h = W(f.score, "score");
	U([
		"passed_weight",
		"total_weight",
		"raw_score",
		"reported_score"
	].every((e) => Ai(h[e])) && G(h.note), "score");
	let g = /* @__PURE__ */ new Map();
	for (let e of ki(n.calculation_trace, "trace", 1)) {
		let t = W(e, "trace row"), n;
		try {
			n = Le(t);
		} catch {
			Oi("invalid", "trace row");
		}
		U(n.fact_id.startsWith("analysis.") && !g.has(n.fact_id) && G(t.definition_id) && G(t.expression) && ki(t.operands, "operands").every((e) => {
			let t = W(e, "operand");
			return [
				"input",
				"fact",
				"policy"
			].includes(t.reference_type) && G(t.reference) && G(t.unit);
		}), "trace row"), g.set(n.fact_id, n);
	}
	for (let e of a) {
		let t = g.get(e.fact_id);
		e.status === "available" && U(t, `trace for ${e.fact_id}`), t && U(t.raw_value === e.raw_value && t.reported_value === e.reported_value && t.status === e.status && t.unit === e.unit, `trace for ${e.fact_id}`);
	}
	return n;
}
function Fi(e) {
	let t = W(e, "baseline");
	return G(t.case_id) && Number.isSafeInteger(t.revision) && t.revision >= 1 && G(t.run_id) && G(t.input_hash) && G(t.payload_hash);
}
function Ii(e) {
	let t = [
		"schedule_principal",
		"principal_rounding_difference",
		"scheduled_payment",
		"final_payment",
		"final_payment_adjustment",
		"total_payments",
		"total_interest",
		"total_principal"
	], n = ki(e.annual_rows, "annual rows", 0, 1e3), r = ki(e.monthly_rows, "monthly rows", 0, 360);
	if (U(typeof e.monthly_rows_truncated == "boolean", "schedule truncation"), e.status === "not_applicable") {
		U(G(e.explanation) && t.every((t) => e[t] === null) && e.payment_count === null && e.early_payoff === null && e.reconciliation === null && !n.length && !r.length, "unavailable schedule");
		return;
	}
	U(e.status === "available" && t.every((t) => Ai(e[t])) && Number.isSafeInteger(e.payment_count) && typeof e.early_payoff == "boolean" && n.length > 0 && r.length > 0, "available schedule");
	for (let e of n) {
		let t = W(e, "annual row");
		U(Number.isSafeInteger(t.loan_year) && Number.isSafeInteger(t.months) && [
			"payments",
			"interest",
			"principal",
			"ending_balance"
		].every((e) => Ai(t[e])), "annual row");
	}
	for (let e of r) {
		let t = W(e, "monthly row");
		U(Number.isSafeInteger(t.month) && [
			"payment",
			"interest",
			"principal",
			"ending_balance"
		].every((e) => Ai(t[e])), "monthly row");
	}
	let i = W(e.reconciliation, "reconciliation");
	U([
		"annuity_monthly_payment",
		"scheduled_monthly_payment",
		"monthly_rounding_difference",
		"coverage_annual_payment",
		"first_loan_year_payments",
		"first_loan_year_difference"
	].every((e) => Ai(i[e])) && G(i.explanation), "reconciliation");
}
function Li(e, t) {
	let n = ki(e.revenue_changes, "revenue changes"), r = ki(e.rate_changes_bps, "rate changes"), i = ki(e.cells, "cells", 0, 20);
	U((e.status === "available" || e.status === "not_applicable") && e.scenario_definition_version === "commercial-scenario-definition-v2" && e.coverage_basis === "stressed_latest_period_current_pro_forma" && ki(e.definition_ids, "definition ids").every(G) && ki(e.held_fixed_assumptions, "held fixed").every(G) && n.every(Ai) && r.every(Ai) && (e.status === "available" ? e.explanation === null && i.length === n.length * r.length : G(e.explanation) && !i.length), "sensitivity grid"), i.forEach((e, i) => {
		let a = W(e, "cell"), o = Math.floor(i / r.length), s = i % r.length;
		U(a.revenue_change === n[o] && a.proposed_rate_change_bps === r[s] && (a.status === "available" ? a.explanation === null && Ai(a.resulting_annual_rate) && Ci.includes(a.outcome) : a.status === "not_applicable" && G(a.explanation) && a.outcome === null && ji(a.resulting_annual_rate)), "sensitivity cell");
		for (let e of [
			"dscr",
			"fccr",
			"global_dscr"
		]) t(a[e], `analysis.sensitivity.${o}.${s}.${e}`, !1);
	});
}
//#endregion
//#region src/analysisApi.ts
var Ri = {
	unavailable: "Analysis unavailable on this server. The assessment above is unaffected.",
	mismatch: "The analysis did not match this assessment, so it is not shown.",
	unsupported: "This analysis version is not supported by this workspace, so it is not shown.",
	invalid: "The analysis response was incomplete or inconsistent, so it is not shown.",
	unreachable: "The analysis service could not be reached."
}, zi = class extends Error {
	kind;
	status;
	constructor(e, t, n = 0) {
		super(e), this.kind = t, this.status = n, this.name = "AnalysisError";
	}
};
function Bi(e) {
	let t = e && typeof e == "object" && "detail" in e ? e.detail : null;
	return t && typeof t == "object" && !Array.isArray(t) ? {
		code: "code" in t && typeof t.code == "string" ? t.code : null,
		message: "message" in t && typeof t.message == "string" ? t.message : null
	} : {
		code: null,
		message: typeof t == "string" && t !== "Not Found" ? t : null
	};
}
async function Vi(e, t, n = fetch) {
	let { source: r } = e;
	if (r.kind === "saved" && !(It(r.caseId) && Lt(r.revision))) throw new zi(Ri.invalid, "failed");
	let i = r.kind === "saved" ? `/cases/${encodeURIComponent(r.caseId)}/revisions/${r.revision}/analysis` : "/commercial/analysis", a;
	try {
		a = await At(i, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: r.kind === "saved" ? "{}" : JSON.stringify(r.input),
			signal: t
		}, n);
	} catch (e) {
		throw t.aborted ? e : new zi(Ri.unreachable, "failed");
	}
	let o;
	try {
		o = await Or(a, "Analysis");
	} catch (e) {
		throw t.aborted ? e : a.status === 404 ? new zi(Ri.unavailable, "unavailable", 404) : new zi(`The analysis response could not be read (${a.status}).`, "failed", a.status);
	}
	if (!a.ok) {
		let { code: e, message: t } = Bi(o);
		throw a.status === 404 && !e ? new zi(Ri.unavailable, "unavailable", 404) : new zi(t ?? `The analysis request failed (${a.status}).`, "failed", a.status);
	}
	try {
		return Pi(o, e);
	} catch (e) {
		throw e instanceof bi ? new zi(Ri[e.kind], e.kind === "invalid" ? "failed" : e.kind, a.status) : e;
	}
}
//#endregion
//#region src/requestPriority.ts
var Hi = /* @__PURE__ */ new Set();
function K(e) {
	return Hi.add(e), () => {
		Hi.delete(e);
	};
}
function q() {
	let e = [...Hi];
	Hi.clear();
	for (let t of e) t.abort();
}
//#endregion
//#region src/useAnalysis.ts
var Ui = 4, Wi = (0, c.createContext)({
	state: { status: "none" },
	retry: () => {}
});
function Gi({ subject: e, paused: t, children: n }) {
	let r = (0, c.useRef)(/* @__PURE__ */ new Map()), i = (0, c.useRef)(null), [a, o] = (0, c.useState)(0), s = e?.key ?? null;
	(0, c.useEffect)(() => {
		let n = i.current;
		if (n && (n.key !== s || n.controller.signal.aborted) && (n.controller.abort(), i.current = null), !e || t || i.current) return;
		let a = r.current.get(e.key);
		if (a) {
			r.current.delete(e.key), r.current.set(e.key, a);
			return;
		}
		let c = {
			key: e.key,
			controller: new AbortController()
		};
		i.current = c;
		let l = K(c.controller), u = (e) => {
			for (r.current.delete(c.key), r.current.set(c.key, e); r.current.size > Ui;) r.current.delete(r.current.keys().next().value);
		};
		Vi(e, c.controller.signal).then((e) => u({
			status: "ready",
			analysis: e
		}), (e) => {
			c.controller.signal.aborted || u(e instanceof zi ? {
				status: "error",
				kind: e.kind,
				message: e.message
			} : {
				status: "error",
				kind: "failed",
				message: e instanceof Error ? e.message : String(e)
			});
		}).finally(() => {
			l(), i.current === c && (i.current = null, o((e) => e + 1));
		});
	}, [
		s,
		t,
		a
	]), (0, c.useEffect)(() => () => {
		i.current?.controller.abort(), i.current = null;
	}, []);
	let l = s ? r.current.get(s) : void 0, u = e ? l ?? (t ? { status: "waiting" } : { status: "loading" }) : { status: "none" };
	return (0, c.createElement)(Wi.Provider, { value: {
		state: u,
		retry: () => {
			s && r.current.get(s)?.status === "error" && (r.current.delete(s), o((e) => e + 1));
		}
	} }, n);
}
function Ki() {
	return (0, c.useContext)(Wi);
}
//#endregion
//#region src/components/Tabs.tsx
function qi({ label: e, tabs: t, selected: n, onSelect: r, children: i }) {
	let a = (0, c.useId)(), o = (0, c.useRef)(/* @__PURE__ */ new Map()), s = (e) => `${a}tab-${e}`, l = `${a}panel`;
	function u(e) {
		r(e);
		let t = o.current.get(e);
		t?.focus(), t?.scrollIntoView?.({
			block: "nearest",
			inline: "nearest"
		});
	}
	function d(e) {
		let r = t.findIndex((e) => e.key === n), i = e.key === "ArrowRight" ? (r + 1) % t.length : e.key === "ArrowLeft" ? (r - 1 + t.length) % t.length : e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : null;
		i !== null && (e.preventDefault(), u(t[i].key));
	}
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)("div", {
		className: "workspaceTabs",
		role: "tablist",
		"aria-label": e,
		onKeyDown: d,
		children: t.map((e) => {
			let t = e.key === n;
			return /* @__PURE__ */ (0, V.jsx)("button", {
				ref: (t) => {
					t ? o.current.set(e.key, t) : o.current.delete(e.key);
				},
				type: "button",
				role: "tab",
				id: s(e.key),
				"aria-selected": t,
				"aria-controls": t ? l : void 0,
				tabIndex: t ? 0 : -1,
				onClick: () => r(e.key),
				children: e.label
			}, e.key);
		})
	}), /* @__PURE__ */ (0, V.jsx)("div", {
		className: "tabPanel",
		role: "tabpanel",
		id: l,
		"aria-labelledby": s(n),
		tabIndex: 0,
		children: i
	})] });
}
//#endregion
//#region src/components/DisclosureMenu.tsx
function Ji({ label: e, panelLabel: t, className: n, children: r }) {
	let [i, a] = (0, c.useState)(!1), o = (0, c.useRef)(null), s = (0, c.useRef)(null), l = (0, c.useId)();
	return (0, c.useEffect)(() => {
		if (!i) return;
		let e = (e) => {
			o.current && !e.composedPath().includes(o.current) && a(!1);
		}, t = o.current?.ownerDocument;
		return t?.addEventListener("pointerdown", e), () => t?.removeEventListener("pointerdown", e);
	}, [i]), /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "disclosureMenu",
		ref: o,
		onKeyDown: (e) => {
			e.key === "Escape" && i && (e.preventDefault(), e.stopPropagation(), a(!1), s.current?.focus());
		},
		onBlur: (e) => {
			let t = e.relatedTarget;
			i && t instanceof Node && !e.currentTarget.contains(t) && a(!1);
		},
		children: [/* @__PURE__ */ (0, V.jsxs)("button", {
			ref: s,
			type: "button",
			className: "menuToggle",
			"aria-expanded": i,
			"aria-controls": i ? l : void 0,
			onClick: () => a((e) => !e),
			children: [e, /* @__PURE__ */ (0, V.jsx)("svg", {
				viewBox: "0 0 12 12",
				width: "12",
				height: "12",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, V.jsx)("path", {
					d: "M2.5 4.5 6 8l3.5-3.5",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.5"
				})
			})]
		}), i && /* @__PURE__ */ (0, V.jsx)("div", {
			className: n,
			id: l,
			role: "group",
			"aria-label": t,
			children: r(() => a(!1))
		})]
	});
}
//#endregion
//#region src/ThemeRoot.tsx
var Yi = "spreadline.theme.v1";
function Xi() {
	try {
		return kt()?.getItem(Yi) === "dark" ? "dark" : "light";
	} catch {
		return "light";
	}
}
function Zi(e) {
	try {
		kt()?.setItem(Yi, e);
	} catch {}
}
var Qi = (0, c.createContext)(null);
function $i({ children: e }) {
	let [t, n] = (0, c.useState)(Xi);
	(0, c.useLayoutEffect)(() => {
		wt() || (document.documentElement.dataset.theme = t);
	}, [t]);
	function r(e) {
		Zi(e), n(e);
	}
	return /* @__PURE__ */ (0, V.jsx)(Qi.Provider, {
		value: {
			theme: t,
			setTheme: r
		},
		children: /* @__PURE__ */ (0, V.jsx)("div", {
			className: "themeRoot",
			"data-theme": t,
			children: e
		})
	});
}
function ea() {
	let e = (0, c.useContext)(Qi);
	if (!e) throw Error("useTheme must be used inside ThemeRoot");
	return e;
}
//#endregion
//#region src/views/WorkspaceHeader.tsx
function ta({ children: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "workspaceBrand",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "wordmark",
				children: [/* @__PURE__ */ (0, V.jsx)("svg", {
					viewBox: "0 0 24 24",
					width: "24",
					height: "24",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, V.jsx)("path", {
						d: "M2 5h13v4H2zm7 5h13v4H9zM2 15h13v4H2z",
						fill: "currentColor"
					})
				}), /* @__PURE__ */ (0, V.jsx)("span", { children: "Spreadline" })]
			}),
			/* @__PURE__ */ (0, V.jsxs)("span", {
				className: "workspaceType",
				children: ["Commercial underwriting ", /* @__PURE__ */ (0, V.jsx)("span", { children: "USD" })]
			}),
			/* @__PURE__ */ (0, V.jsx)("div", {
				className: "brandActions",
				children: e
			})
		]
	});
}
function na({ showCases: e, canSave: t, onToggleCases: n, onSave: r }) {
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)("button", {
		type: "button",
		"data-focus-fallback": !0,
		"aria-expanded": e,
		onClick: n,
		children: "Open case"
	}), /* @__PURE__ */ (0, V.jsx)("button", {
		type: "button",
		className: "primary",
		disabled: !t,
		onClick: (e) => r(e.currentTarget),
		children: "Save case"
	})] });
}
function ra({ onExample: e, onImport: t, onDisconnect: n }) {
	let { theme: r, setTheme: i } = ea();
	return /* @__PURE__ */ (0, V.jsx)(Ji, {
		label: "More",
		panelLabel: "More actions",
		className: "moreMenu",
		children: (a) => /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "menuGroup",
				children: [
					/* @__PURE__ */ (0, V.jsx)("button", {
						type: "button",
						onClick: () => {
							a(), e("dated");
						},
						children: "Load example case"
					}),
					/* @__PURE__ */ (0, V.jsx)("button", {
						type: "button",
						onClick: () => {
							a(), e("legacy");
						},
						children: "Load legacy example case"
					}),
					/* @__PURE__ */ (0, V.jsx)("button", {
						type: "button",
						onClick: () => {
							a(), t();
						},
						children: "Import case file (JSON)"
					})
				]
			}),
			/* @__PURE__ */ (0, V.jsx)("div", {
				className: "menuGroup",
				children: /* @__PURE__ */ (0, V.jsx)("button", {
					type: "button",
					className: "themeToggle",
					"aria-pressed": r === "dark",
					onClick: () => i(r === "dark" ? "light" : "dark"),
					children: "Dark theme"
				})
			}),
			n && /* @__PURE__ */ (0, V.jsx)("div", {
				className: "menuGroup",
				children: /* @__PURE__ */ (0, V.jsx)("button", {
					type: "button",
					onClick: () => {
						a(), n();
					},
					children: "Disconnect workspace"
				})
			})
		] })
	});
}
function ia({ view: e, filename: t, legacy: n }) {
	return /* @__PURE__ */ (0, V.jsxs)("header", {
		className: "caseHeader",
		children: [
			/* @__PURE__ */ (0, V.jsx)("h1", { children: e.title }),
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "caseMeta",
				children: [
					e.modeLabel ? /* @__PURE__ */ (0, V.jsx)("span", {
						className: "modeBadge",
						children: e.modeLabel
					}) : /* @__PURE__ */ (0, V.jsx)("span", {
						className: "pendingNote",
						children: e.subtitle
					}),
					e.statusChip && /* @__PURE__ */ (0, V.jsx)("span", {
						className: "statusChip",
						"data-saved": e.statusChip.startsWith("Draft") ? "false" : "true",
						children: e.statusChip
					}),
					/* @__PURE__ */ (0, V.jsxs)("span", {
						className: "caseSource",
						children: [t, " · synthetic only"]
					})
				]
			}),
			n && /* @__PURE__ */ (0, V.jsx)("p", {
				className: "legacyNote",
				children: "Saving requires a separately imported dated assessment with explicit dates and units."
			})
		]
	});
}
//#endregion
//#region src/views/StartScreen.tsx
function aa({ showCases: e, onExample: t, onToggleCases: n, onImport: r }) {
	let i = (0, c.useId)(), a = [
		{
			key: "example",
			title: "Try the example case",
			detail: "Alpine Fabrication: two fiscal years and a $500,000 ten-year term loan request.",
			onClick: t
		},
		{
			key: "open",
			title: "Open saved case",
			detail: "Reopen a case saved on this server, at its latest or an earlier revision.",
			onClick: n
		},
		{
			key: "import",
			title: "Import case file (JSON)",
			detail: "A dated or legacy assessment request of up to 1,000,000 bytes.",
			onClick: r
		}
	];
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "startScreen",
		"aria-labelledby": `${i}title`,
		children: [
			/* @__PURE__ */ (0, V.jsx)("h1", {
				id: `${i}title`,
				children: "Start a credit analysis"
			}),
			/* @__PURE__ */ (0, V.jsx)("p", {
				className: "startLead",
				children: "Spread the borrower's statements, check coverage against the illustrative policy, and size the loan. Use synthetic data only."
			}),
			/* @__PURE__ */ (0, V.jsx)("div", {
				className: "startOptions",
				children: a.map((t) => /* @__PURE__ */ (0, V.jsxs)("button", {
					type: "button",
					className: "startOption",
					"aria-label": t.title,
					"aria-describedby": `${i}${t.key}`,
					"data-focus-fallback": t.key === "open" ? "" : void 0,
					"aria-expanded": t.key === "open" ? e : void 0,
					onClick: t.onClick,
					children: [/* @__PURE__ */ (0, V.jsx)("span", {
						className: "startOptionTitle",
						children: t.title
					}), /* @__PURE__ */ (0, V.jsx)("span", {
						className: "startOptionDetail",
						id: `${i}${t.key}`,
						children: t.detail
					})]
				}, t.key))
			})
		]
	});
}
//#endregion
//#region src/views/PrototypeNotice.tsx
function oa() {
	let [e, t] = (0, c.useState)(!1), n = (0, c.useId)();
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "warning environmentWarning",
		children: [
			/* @__PURE__ */ (0, V.jsx)("span", { children: "Prototype" }),
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				"Synthetic data only. Not validated for lending decisions.",
				" ",
				/* @__PURE__ */ (0, V.jsx)("button", {
					type: "button",
					className: "linkButton",
					"aria-expanded": e,
					"aria-controls": e ? n : void 0,
					onClick: () => t((e) => !e),
					children: "Read full notice"
				})
			] }),
			e && /* @__PURE__ */ (0, V.jsx)("p", {
				className: "noticeDetail",
				id: n,
				children: "Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice."
			})
		]
	});
}
//#endregion
//#region src/views/DecisionBar.tsx
function sa(e, t) {
	if (!e.decision) return e.pendingTitle;
	if (e.accepted?.mode === "legacy") return "Legacy decision from its policy factors. A dated assessment adds the plain-language explanation.";
	switch (t.status) {
		case "ready": return t.analysis.explanation.headline;
		case "error": return t.message;
		case "waiting": return "The explanation loads after the saved write is confirmed.";
		default: return "Preparing the plain-language explanation…";
	}
}
function ca({ view: e }) {
	let { state: t } = Ki();
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "decision",
		"data-outcome": e.decision?.outcome ?? "unavailable",
		"aria-label": "Illustrative decision",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, V.jsxs)("div", {
			className: "decisionStatus",
			children: [/* @__PURE__ */ (0, V.jsx)("span", { children: "Illustrative decision" }), /* @__PURE__ */ (0, V.jsx)("strong", { children: e.decisionWord })]
		}), /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "decisionReason",
			children: [
				/* @__PURE__ */ (0, V.jsx)("p", { children: sa(e, t) }),
				/* @__PURE__ */ (0, V.jsx)("small", { children: e.decisionNote }),
				e.previous && /* @__PURE__ */ (0, V.jsxs)("small", {
					className: "previousResult",
					children: [
						"Previous result: ",
						e.previous.toUpperCase(),
						" (inactive)"
					]
				})
			]
		})]
	});
}
//#endregion
//#region src/views/KpiTiles.tsx
var la = {
	meets_approval: "Meets approval",
	review_band: "Review band",
	below_decline_floor: "Below decline floor",
	not_applicable: "Not applicable"
}, ua = {
	meets_approval: "Above approval breakeven",
	review_band: "Below approval breakeven",
	below_decline_floor: "Below decline breakeven",
	not_applicable: "Not applicable"
}, da = {
	meets_approval: "pass",
	review_band: "review",
	below_decline_floor: "fail",
	not_applicable: "na"
}, fa = {
	dscr: "DSCR",
	fccr: "FCCR",
	global_dscr: "global DSCR"
};
function pa(e) {
	if (!e.has_capacity) return "none";
	let t = e.principal_headroom.raw_value;
	return y(t) && S(t, "0") >= 0 ? "fits" : "over";
}
var ma = {
	fits: "Within capacity",
	over: "Over capacity",
	none: "No capacity"
};
function ha(e, t, n) {
	let r = n?.explanation.factors.find((t) => t.name === e);
	if (r) return r.status;
	let i = t.decision.factors.find((t) => t.name === e);
	return i.passed === null ? "not_applicable" : i.passed ? "meets_approval" : i.decline_triggered ? "below_decline_floor" : "review_band";
}
function ga(e, t, n, r) {
	let i = e?.explanation.factors.find((e) => e.name === t);
	return i ? i.approval_cushion.status === "available" ? `Cushion ${_e(i.approval_cushion, n)}` : "No cushion: not applicable" : r;
}
function _a(e, t, n, r, i, a, o, s) {
	let c = ha(t, a, o);
	return {
		label: e,
		value: n.status === "available" && y(n.raw_value) ? he(n.raw_value, [r, i]) : "Not applicable",
		state: da[c],
		status: la[c],
		lines: [`Minimum ${k(r)}, decline below ${k(i)}`],
		cushion: ga(o, t, "multiple", s)
	};
}
function va({ assessment: e }) {
	let { state: t } = Ki(), n = t.status === "ready" ? t.analysis : null, r = t.status === "error" ? "Cushion unavailable" : "Cushion pending", i = e.current_facts, a = e.policy_snapshot, o = ha("uca_positive", e, n), s = n?.debt_capacity, c = s ? pa(s) : null, l = n?.breakevens.binding_approval_constraint, u = l ? n?.breakevens.rows.find((e) => e.constraint === l && e.threshold_kind === "approval_minimum") : void 0, d = l ? ha(l, e, n) : null, f = [
		_a("Business DSCR", "dscr", i.dscr, a.commercial_min_dscr, a.commercial_decline_dscr, e, n, r),
		_a("Global DSCR", "global_dscr", i.global_dscr, a.commercial_min_global_dscr, a.commercial_decline_global_dscr, e, n, r),
		_a("FCCR", "fccr", i.fccr, a.commercial_min_fccr, a.commercial_decline_fccr, e, n, r),
		{
			label: "UCA cash flow",
			value: pe(i.uca_cash_flow, "money"),
			state: da[o],
			status: la[o],
			lines: [`Must exceed ${fe(a.commercial_min_uca_cash_flow)}`],
			cushion: ga(n, "uca_positive", "money", r)
		},
		{
			label: "EBITDA",
			value: pe(i.ebitda, "money"),
			state: d ? da[d] : "info",
			status: d ? ua[d] : null,
			lines: [`Year ended ${e.selected_period.period_end}`, ...u && l ? [`Approval breakeven ${pe(u.ebitda_breakeven, "money")} (${fa[l]})`] : []],
			cushion: u?.ebitda_cushion.status === "available" ? `Cushion ${ye(u.ebitda_cushion)} of EBITDA` : n ? "No cushion: not applicable" : r
		},
		{
			label: "Annual debt service",
			value: pe(i.debt_service, "money"),
			state: c ? c === "fits" ? "pass" : "fail" : "info",
			status: c ? ma[c] : null,
			lines: [`Includes proposed ${pe(i.proposed_annual_payment, "money")} a year`, ...s ? [`New payments up to ${pe(s.max_annual_payment, "money")} a year (${fa[s.binding_constraint]})`] : []],
			cushion: s ? c === "fits" ? `Principal headroom ${pe(s.principal_headroom, "money")}` : `Principal shortfall ${ge(s.principal_headroom.raw_value ?? "0")}` : r
		}
	];
	return /* @__PURE__ */ (0, V.jsx)("section", {
		className: "kpiTiles",
		"aria-label": "Assessment overview",
		children: f.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "kpiTile",
			"data-state": e.state,
			children: [
				/* @__PURE__ */ (0, V.jsx)("span", {
					className: "kpiLabel",
					children: e.label
				}),
				/* @__PURE__ */ (0, V.jsx)("strong", { children: e.value }),
				e.status && /* @__PURE__ */ (0, V.jsx)("span", {
					className: "kpiStatus",
					children: e.status
				}),
				e.lines.map((e) => /* @__PURE__ */ (0, V.jsx)("small", { children: e }, e)),
				/* @__PURE__ */ (0, V.jsx)("small", {
					className: "kpiCushion",
					children: e.cushion
				})
			]
		}, e.label))
	});
}
//#endregion
//#region src/views/WorkspaceStatus.tsx
function ya({ state: e, view: t, onSubmit: n, onOpen: r }) {
	let { draft: i, saved: a } = e, o = t.previousAccepted;
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
		!t.ready && /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "pending",
			role: "status",
			children: [
				/* @__PURE__ */ (0, V.jsx)("strong", { children: t.pendingTitle }),
				i && e.action === "evaluate" && /* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Submitted draft: ",
					i.filename,
					" · ",
					i.mode,
					" ·",
					" ",
					typeof i.payload.borrower_name == "string" ? i.payload.borrower_name : "Unnamed input",
					i.edit && ` · ${i.edit.path}: ${i.edit.prior} → ${i.edit.next}`
				] }),
				o && /* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Previous accepted case: ",
					o.input.borrower_name,
					" ·",
					" ",
					o.filename,
					". Its recommendation is inactive."
				] })
			]
		}),
		e.error && /* @__PURE__ */ (0, V.jsx)("div", {
			className: "warning",
			role: "alert",
			children: e.error
		}),
		e.status === "unavailable" && /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "actions",
			children: [
				i && e.action === "evaluate" && /* @__PURE__ */ (0, V.jsx)("button", {
					onClick: () => n(i),
					children: "Retry submitted draft"
				}),
				o && /* @__PURE__ */ (0, V.jsx)("button", {
					onClick: () => n({
						mode: o.mode,
						payload: o.input,
						filename: o.filename
					}),
					children: "Re-evaluate last accepted case"
				}),
				a && /* @__PURE__ */ (0, V.jsx)("button", {
					onClick: () => r({
						caseId: a.view.snapshot.case_id,
						revision: a.view.snapshot.revision
					}),
					children: "View previous stored revision"
				})
			]
		})
	] });
}
function ba({ view: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel compatibility",
		children: [
			/* @__PURE__ */ (0, V.jsx)("h2", { children: "Original stored assessment" }),
			String(e.snapshot.assessment.schema_version).endsWith("-v1") && /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "modelScope",
				role: "status",
				children: [/* @__PURE__ */ (0, V.jsx)("strong", { children: "Archived v1 Record — Read-Only (replay_unavailable)" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "Original JSON facts, hashes, and receipts are preserved and remain available for storage integrity verification. V2 calculation replay and editing are disabled. Browser export carries recorded hashes without independently verifying them." })]
			}),
			/* @__PURE__ */ (0, V.jsx)("p", { children: e.compatibility }),
			/* @__PURE__ */ (0, V.jsx)(tr, {
				value: e.snapshot,
				className: "compatibilityJson",
				title: "Original stored JSON",
				noun: "record"
			})
		]
	});
}
function J({ assessment: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "context",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("span", { children: [
				"Assessment as of: ",
				e.assumptions_as_of,
				" · USD · dollars · nominal annual rate"
			] }),
			/* @__PURE__ */ (0, V.jsxs)("span", { children: ["Coverage period: ", Ge(e.selected_period, 0)] }),
			/* @__PURE__ */ (0, V.jsx)("span", { children: "Current pro forma coverage · fixed rate · fully amortizing · monthly payments" })
		]
	});
}
//#endregion
//#region src/views/workspaceTabs.ts
var xa = [
	{
		key: "spread",
		label: "Spread"
	},
	{
		key: "overview",
		label: "Overview"
	},
	{
		key: "debt",
		label: "Debt & Loan"
	},
	{
		key: "global",
		label: "Global Cash Flow"
	},
	{
		key: "stress",
		label: "Stress Tests"
	},
	{
		key: "memo",
		label: "Credit Memo"
	},
	{
		key: "audit",
		label: "History & Audit"
	}
];
//#endregion
//#region src/views/EditButton.tsx
function Sa({ field: e, canEdit: t, onEdit: n, label: r, children: i }) {
	return /* @__PURE__ */ (0, V.jsx)("button", {
		className: "rowEdit",
		"aria-label": r,
		disabled: !t,
		onClick: (t) => n(e, t.currentTarget),
		children: i
	});
}
//#endregion
//#region src/TraceInspector.tsx
var Ca = {
	"gross-profit-v2": "Gross profit = receipts − COGS",
	"ordinary-business-income-v2": "Ordinary income = gross profit − operating expense − officer compensation − depreciation − amortization − existing interest − Section 179",
	"ebitda-v2": "EBITDA = ordinary income + existing interest + depreciation + amortization + Section 179",
	"amortized-payment-v2": "Monthly payment = P × r / (1 − (1 + r)^−n), where r = annual nominal rate / 12; at zero rate, P / n.",
	"annualized-payment-v2": "Proposed annual service = 12 unrounded monthly payments",
	"annual-debt-service-v2": "Business service = existing interest + annual CPLTD + proposed annual service",
	"dscr-v2": "DSCR = EBITDA / business service",
	"fccr-v2": "Simplified FCCR = EBITDA / (business service + operating leases)",
	"global-dscr-v2": "Global DSCR = (ownership-weighted EBITDA + outside income) / (business service + personal service). Empty guarantors use 100% of business EBITDA. K-1 distributions are never added a second time.",
	"uca-cash-flow-v2": "Simplified UCA = EBITDA − cash taxes − (AR increase + inventory increase − AP increase)"
}, wa = {
	"gross-profit-v2": ["+", "−"],
	"ordinary-business-income-v2": [
		"+",
		"−",
		"−",
		"−",
		"−",
		"−",
		"−"
	],
	"ebitda-v2": [
		"+",
		"+",
		"+",
		"+",
		"+"
	],
	"annual-debt-service-v2": [
		"+",
		"+",
		"+"
	],
	"uca-cash-flow-v2": [
		"+",
		"−",
		"−"
	],
	"fixed-charge-service-v2": ["+", "+"],
	"guarantor-outside-income-v2": ["+", "+"],
	"guarantor-personal-debt-v2": [
		"+",
		"+",
		"+"
	],
	"global-cash-flow-v2": ["+", "+"],
	"global-debt-service-v2": ["+", "+"],
	"net-working-capital-v2": [
		"+",
		"+",
		"−"
	]
}, Ta = (e, t) => e === null ? "Unavailable" : y(String(e)) ? t.startsWith("USD") ? E(String(e), {
	places: 2,
	currency: !0
}) : t === "ratio" ? w(String(e), 4) : String(e) : String(e);
function Ea({ data: e, onClose: t }) {
	let n = (0, c.useRef)(null);
	(0, c.useEffect)(() => {
		n.current?.focus();
	}, [e.title, e.trace?.fact_id]);
	let r = e.trace, i = r ? wa[r.definition_id] ?? ([
		"global-business-ebitda-v2",
		"global-outside-income-v2",
		"global-personal-debt-v2"
	].includes(r.definition_id) ? r.operands.map(() => "+") : void 0) : void 0;
	return /* @__PURE__ */ (0, V.jsxs)("aside", {
		className: "panel traceInspector",
		role: "region",
		"aria-label": "Calculation inspector",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, V.jsx)("h2", {
					tabIndex: -1,
					ref: n,
					children: e.title
				}), /* @__PURE__ */ (0, V.jsx)("button", {
					type: "button",
					onClick: t,
					children: "Close inspector"
				})]
			}),
			/* @__PURE__ */ (0, V.jsx)("h3", { children: "Exact methodology" }),
			/* @__PURE__ */ (0, V.jsx)("p", { children: e.formula ?? (r ? Ca[r.definition_id] ?? r.expression : "Methodology unavailable") }),
			r && /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
				/* @__PURE__ */ (0, V.jsxs)("p", {
					className: "fine",
					children: [
						"Definition ",
						r.definition_id,
						" · ",
						r.fact_id
					]
				}),
				/* @__PURE__ */ (0, V.jsx)("p", {
					className: "expression",
					children: r.expression
				}),
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "Contextual reported operands" }),
				/* @__PURE__ */ (0, V.jsx)("ol", {
					className: "traceOperands",
					children: r.operands.map((e, t) => {
						let n = e.unit.startsWith("USD") && e.raw_value !== null && e.reported_value !== null && w(String(e.raw_value), 2, !1) !== w(String(e.reported_value), 2, !1);
						return /* @__PURE__ */ (0, V.jsxs)("li", {
							"data-allocated": n,
							children: [
								/* @__PURE__ */ (0, V.jsx)("code", { children: e.reference }),
								/* @__PURE__ */ (0, V.jsxs)("strong", { children: [
									i?.[t] ?? "Operand",
									" ",
									Ta(e.reported_value ?? e.raw_value, e.unit)
								] }),
								/* @__PURE__ */ (0, V.jsxs)("small", { children: [
									"Raw ",
									String(e.raw_value),
									" ",
									e.unit,
									" ·",
									" ",
									e.reference_type
								] }),
								n && /* @__PURE__ */ (0, V.jsx)("span", {
									className: "allocationBadge",
									children: "Residual cents allocated by server"
								})
							]
						}, t);
					})
				}),
				i && r.operands.every((e) => e.reported_value !== null) && /* @__PURE__ */ (0, V.jsxs)("p", {
					className: "reconciliationEquation",
					"aria-label": "Server reported reconciliation",
					children: [
						r.operands.map((e, t) => `${t ? `${i[t]} ` : ""}${Ta(e.reported_value, e.unit)}`).join(" "),
						" ",
						"= ",
						Ta(r.reported_value, r.unit),
						/* @__PURE__ */ (0, V.jsx)("small", { children: "Server-recorded signed reconciliation · displayed from recorded operands; no browser sum is recalculated." })
					]
				}),
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Reported result:",
					" ",
					/* @__PURE__ */ (0, V.jsx)("strong", { children: Ta(r.reported_value, r.unit) }),
					/* @__PURE__ */ (0, V.jsx)("br", {}),
					"Raw result: ",
					/* @__PURE__ */ (0, V.jsx)("code", { children: r.raw_value ?? "Unavailable" })
				] }),
				r.explanation && /* @__PURE__ */ (0, V.jsx)("p", { children: r.explanation }),
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "ROUND_HALF_EVEN reporting" }),
				/* @__PURE__ */ (0, V.jsx)("p", { children: "Money uses cents; ratios use four decimal places. Additive residual cents follow the largest signed rounding residual, with input order breaking ties. Raw values and policy decisions are never altered by reporting rounding." })
			] }),
			e.supplied && /* @__PURE__ */ (0, V.jsx)("dl", {
				className: "traceSupplied",
				children: e.supplied.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: e.label }), /* @__PURE__ */ (0, V.jsx)("dd", { children: e.value })] }, e.label))
			}),
			e.note && /* @__PURE__ */ (0, V.jsx)("p", { children: e.note }),
			/* @__PURE__ */ (0, V.jsx)("h3", { children: "Policy factor verdict" }),
			e.factor ? /* @__PURE__ */ (0, V.jsxs)("p", { children: [
				/* @__PURE__ */ (0, V.jsx)("strong", {
					className: "statusBadge",
					children: e.factor.passed === null ? "Unavailable" : e.factor.passed ? "Pass" : "Fail"
				}),
				" ",
				"· Server comparison ",
				e.factor.comparison_operator ?? "unavailable",
				" ",
				y(e.factor.threshold) && e.factor.name.includes("dti") ? D(e.factor.threshold, 2) : String(e.factor.threshold ?? "unavailable"),
				".",
				" ",
				e.factor.raw_value === null && "A zero coverage denominator cannot pass a policy factor."
			] }) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No separate policy factor is returned for this fact. Zero coverage denominators are unavailable and cannot pass a policy factor." })
		]
	});
}
//#endregion
//#region src/views/SpreadView.tsx
function Da({ ready: e, canEdit: t, input: n, legacy: r, assessment: i, decision: a, index: o, onSelectPeriod: s, onEdit: l }) {
	let [u, d] = (0, c.useState)("reported"), [f, p] = (0, c.useState)(null), m = (0, c.useRef)(null), h = Ki().state, g = i?.calculation_trace.find((e) => e.fact_id === f), _ = i && Object.entries(i.current_facts).find(([, e]) => e.fact_id === f)?.[0], v = a?.factors.find((e) => e.name === _ || e.name === "uca_positive" && _ === "uca_cash_flow");
	function b(e, t) {
		m.current = t, p(e.fact_id);
	}
	function x(e, t, n, r) {
		if (u === "raw") return r?.status === "not_applicable" ? "Unavailable" : y(r?.raw_value ?? n) ? T(r?.raw_value ?? n) : String(r?.raw_value ?? n);
		if (u === "common" || u === "change") {
			if (h.status !== "ready") return "Analysis unavailable";
			let n = h.analysis.periods[t], r = (u === "common" ? n.common_size : n.change_vs_prior)?.[e];
			return r?.status === "available" && y(r.raw_value) ? D(r.raw_value, 2) : u === "change" && !n.prior_period ? "No prior period" : "Unavailable";
		}
		return r ? nr(r) : `$${w(n, 2)}`;
	}
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "grid",
		children: [/* @__PURE__ */ (0, V.jsxs)("div", {
			className: "panel wide",
			children: [
				/* @__PURE__ */ (0, V.jsxs)("div", {
					className: "panelTitle",
					children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Annual financial spread" }), /* @__PURE__ */ (0, V.jsx)("span", { children: e ? t ? "Select a supplied input to edit · derived rows are read-only" : "Original accepted inputs · editing unavailable for this selection" : "Previous accepted inputs · editing unavailable" })]
				}),
				/* @__PURE__ */ (0, V.jsxs)("label", {
					className: "spreadMode",
					children: ["Spread presentation", /* @__PURE__ */ (0, V.jsxs)("select", {
						"aria-label": "Spread presentation",
						value: u,
						onChange: (e) => d(e.target.value),
						children: [
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "raw",
								children: "Accepted Raw Inputs"
							}),
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "reported",
								children: "ROUND_HALF_EVEN Reported Amounts"
							}),
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "common",
								children: "Common-Size (%)"
							}),
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "change",
								children: "YoY Change"
							})
						]
					})]
				}),
				u === "raw" && /* @__PURE__ */ (0, V.jsx)("p", {
					className: "fine",
					children: "Exact accepted source inputs and server raw calculated facts. No digits are discarded."
				}),
				(u === "common" || u === "change") && /* @__PURE__ */ (0, V.jsx)("p", {
					className: "fine",
					children: "Server analysis only. Unavailable or non-comparable prior values are shown explicitly; no change is calculated by the browser."
				}),
				n ? /* @__PURE__ */ (0, V.jsx)("div", {
					className: "tableScroll",
					children: /* @__PURE__ */ (0, V.jsxs)("table", { children: [/* @__PURE__ */ (0, V.jsx)("thead", { children: /* @__PURE__ */ (0, V.jsxs)("tr", { children: [/* @__PURE__ */ (0, V.jsx)("th", { children: "Line item · USD" }), n.years.map((e, t) => /* @__PURE__ */ (0, V.jsx)("th", { children: /* @__PURE__ */ (0, V.jsx)("button", {
						"aria-pressed": o === t,
						className: o === t ? "period active" : "period",
						onClick: () => s(t),
						children: Ge(e, t)
					}) }, t))] }) }), /* @__PURE__ */ (0, V.jsxs)("tbody", { children: [we.map((e) => /* @__PURE__ */ (0, V.jsxs)("tr", { children: [/* @__PURE__ */ (0, V.jsx)("th", {
						scope: "row",
						children: ze[e]
					}), n.years.map((r, a) => /* @__PURE__ */ (0, V.jsx)("td", {
						className: "num",
						children: /* @__PURE__ */ (0, V.jsx)(Sa, {
							field: Je(n, a, e),
							canEdit: t,
							onEdit: l,
							label: `Edit ${ze[e]} for ${Ge(r, a)}`,
							children: x(e, a, u === "reported" ? i?.historical_spread[a].reported_financials[e] ?? r[e] : r[e])
						})
					}, a))] }, e)), i && We.map((e) => /* @__PURE__ */ (0, V.jsxs)("tr", {
						className: "derived",
						"data-fact": e,
						children: [/* @__PURE__ */ (0, V.jsxs)("th", {
							scope: "row",
							children: [
								ze[e] ?? "K-1 distribution ratio",
								" ",
								/* @__PURE__ */ (0, V.jsx)("small", { children: "Calculated" })
							]
						}), i.historical_spread.map((t, n) => /* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: /* @__PURE__ */ (0, V.jsx)("button", {
								type: "button",
								className: "traceLink",
								"aria-label": `Inspect ${ze[e] ?? "K-1 distribution ratio"} for ${Ge(t, n)}`,
								onClick: (n) => b(t[e], n.currentTarget),
								children: x(e, n, t[e].raw_value ?? "", t[e])
							})
						}, n))]
					}, e))] })] })
				}) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No accepted inputs yet." }),
				i && /* @__PURE__ */ (0, V.jsx)("p", {
					className: "fine",
					children: "Report amounts reconcile to income totals in cents. Editing opens the original unrounded input."
				}),
				r && /* @__PURE__ */ (0, V.jsx)("p", {
					className: "fine",
					children: "Legacy inputs have no verified dates or dated calculation trace. Supplied period order is retained."
				})
			]
		}), /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "contextPane",
			children: [/* @__PURE__ */ (0, V.jsx)(Oa, {
				decision: a,
				assessment: i,
				onInspect: b
			}), g && /* @__PURE__ */ (0, V.jsx)(Ea, {
				data: {
					title: ze[g.fact_id.split(".").slice(-1)[0] ?? ""] ?? Be[g.fact_id.split(".").slice(-1)[0] ?? ""] ?? g.fact_id,
					trace: g,
					factor: v
				},
				onClose: () => {
					p(null), m.current?.focus();
				}
			})]
		})]
	});
}
function Oa({ decision: e, assessment: t, onInspect: n }) {
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ (0, V.jsx)("h2", { children: "Current coverage" }),
			e ? e.factors.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "metric",
				"data-state": e.passed === null ? "review" : e.passed ? "pass" : "fail",
				children: [
					/* @__PURE__ */ (0, V.jsx)("span", { children: t ? /* @__PURE__ */ (0, V.jsx)("button", {
						type: "button",
						className: "traceLink",
						onClick: (r) => {
							let i = t.current_facts[e.name === "uca_positive" ? "uca_cash_flow" : e.name];
							i && n(i, r.currentTarget);
						},
						children: ze[e.name] ?? e.name
					}) : ze[e.name] ?? e.name }),
					/* @__PURE__ */ (0, V.jsx)("strong", { children: ve(e) }),
					/* @__PURE__ */ (0, V.jsxs)("small", { children: [
						e.name === "uca_positive" && y(e.threshold) ? `Must exceed ${fe(e.threshold)}` : `Policy: ${e.comparison_operator ?? "comparison unavailable"} ${y(e.threshold) ? k(e.threshold) : String(e.threshold)}`,
						" ",
						"·",
						" ",
						e.passed === null ? "Review required" : e.passed ? "Pass" : "Below policy",
						e.decline_threshold !== null && ` · decline below ${k(e.decline_threshold)}`
					] })
				]
			}, e.name)) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No current results. Resolve the selected input and retry." }),
			t && /* @__PURE__ */ (0, V.jsxs)("details", { children: [/* @__PURE__ */ (0, V.jsx)("summary", { children: "Inspect current calculated facts" }), [
				"proposed_monthly_payment",
				"proposed_annual_payment",
				"debt_service",
				"fixed_charge_service",
				"global_cash_flow",
				"global_debt_service",
				"uca_cash_flow"
			].map((e) => /* @__PURE__ */ (0, V.jsx)("button", {
				type: "button",
				className: "traceFact",
				onClick: (r) => n(t.current_facts[e], r.currentTarget),
				children: Be[e]
			}, e))] })
		]
	});
}
//#endregion
//#region src/trendGeometry.ts
var ka = 40, Aa = (e) => e.startsWith("-") ? e.slice(1) : e;
function ja(e, t) {
	let n = e.filter((e) => e !== null), r = n.some((e) => S(e, "0") < 0) ? Math.floor(t.height / 2) : t.height, i = n.reduce((e, t) => S(Aa(t), e) > 0 ? Aa(t) : e, "0"), a = e.length, o = a ? Math.max(1, Math.min(ka, Math.floor((t.width - t.gap * (a - 1)) / a))) : 0;
	return {
		baseline: r,
		bars: e.map((e, n) => {
			if (e === null) return null;
			let a = re(e, i, r), s = a < 0n, c = s ? -a : a;
			return {
				x: n * (o + t.gap),
				width: o,
				y: (s ? BigInt(r) : BigInt(r) - c).toString(),
				height: c.toString(),
				negative: s
			};
		})
	};
}
//#endregion
//#region src/views/TrendChart.tsx
var Ma = {
	width: 240,
	height: 64,
	gap: 8
};
function Na({ title: e, points: t }) {
	let n = ja(t.map((e) => e.value), Ma), r = `${e}: ${t.map((e) => `${e.text} for ${e.label}`).join("; ")}`;
	return /* @__PURE__ */ (0, V.jsxs)("figure", {
		className: "trendChart",
		children: [
			/* @__PURE__ */ (0, V.jsx)("figcaption", { children: e }),
			/* @__PURE__ */ (0, V.jsxs)("svg", {
				viewBox: `0 0 ${Ma.width} ${Ma.height}`,
				preserveAspectRatio: "none",
				role: "img",
				"aria-label": r,
				children: [/* @__PURE__ */ (0, V.jsx)("line", {
					className: "trendBaseline",
					x1: "0",
					x2: Ma.width,
					y1: n.baseline,
					y2: n.baseline
				}), n.bars.map((e, t) => e ? /* @__PURE__ */ (0, V.jsx)("rect", {
					className: e.negative ? "trendBar negative" : "trendBar",
					x: e.x,
					y: e.y,
					width: e.width,
					height: e.height
				}, t) : null)]
			}),
			/* @__PURE__ */ (0, V.jsx)("ol", {
				className: "trendLegend",
				"aria-hidden": "true",
				children: t.map((e) => /* @__PURE__ */ (0, V.jsxs)("li", { children: [/* @__PURE__ */ (0, V.jsx)("span", { children: e.short }), /* @__PURE__ */ (0, V.jsx)("strong", { children: e.text })] }, e.label))
			})
		]
	});
}
//#endregion
//#region src/views/OverviewView.tsx
var Pa = [
	"approve_all_conditions",
	"review_k1_history",
	"decline_coverage_floor",
	"review_otherwise"
], Fa = {
	dscr: "Business DSCR",
	fccr: "FCCR",
	global_dscr: "Global DSCR"
};
function Ia({ title: e, className: t, children: n }) {
	let r = (0, c.useId)();
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: `panel ${t ?? ""}`,
		"aria-labelledby": r,
		children: [/* @__PURE__ */ (0, V.jsx)("h2", {
			id: r,
			children: e
		}), n]
	});
}
function La({ state: e, retry: t }) {
	return e.status === "error" ? /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "analysisNotice",
		role: "status",
		children: [/* @__PURE__ */ (0, V.jsx)("p", { children: e.message }), t && e.kind === "failed" && /* @__PURE__ */ (0, V.jsx)("button", {
			type: "button",
			onClick: t,
			children: "Retry analysis"
		})]
	}) : /* @__PURE__ */ (0, V.jsx)("p", {
		className: "analysisNotice",
		role: "status",
		children: e.status === "waiting" ? "The analysis resumes after the saved write is confirmed." : "Preparing the analysis…"
	});
}
function Ra(e, t) {
	return e.status === "available" ? _e(e, t) : "not applicable";
}
function za({ analysis: e }) {
	let { explanation: t } = e, n = t.rules[Pa.indexOf(t.matched_rule)];
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
		/* @__PURE__ */ (0, V.jsx)("p", {
			className: "overviewHeadline",
			children: t.headline
		}),
		n && /* @__PURE__ */ (0, V.jsxs)("p", { children: ["Rule applied: ", n] }),
		/* @__PURE__ */ (0, V.jsx)("h3", { children: "Outcome conditions" }),
		/* @__PURE__ */ (0, V.jsx)("ul", {
			className: "conditionList",
			children: t.conditions.map((e) => /* @__PURE__ */ (0, V.jsxs)("li", {
				"data-satisfied": e.satisfied,
				children: [/* @__PURE__ */ (0, V.jsx)("span", { children: e.description }), /* @__PURE__ */ (0, V.jsx)("strong", { children: e.satisfied ? "Yes" : "No" })]
			}, e.condition_id))
		}),
		/* @__PURE__ */ (0, V.jsx)("h3", { children: "Policy factors" }),
		/* @__PURE__ */ (0, V.jsx)("ul", {
			className: "factorList",
			children: t.factors.map((e) => {
				let t = e.name === "uca_positive" ? "money" : "multiple";
				return /* @__PURE__ */ (0, V.jsxs)("li", {
					"data-status": e.status,
					children: [
						/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("strong", { children: e.label }), /* @__PURE__ */ (0, V.jsx)("span", {
							className: "factorStatus",
							children: la[e.status]
						})] }),
						/* @__PURE__ */ (0, V.jsx)("p", { children: e.summary }),
						e.name !== "k1_history" && /* @__PURE__ */ (0, V.jsxs)("small", { children: [
							"Approval cushion ",
							Ra(e.approval_cushion, t),
							e.name !== "uca_positive" && `, decline cushion ${Ra(e.decline_cushion, t)}`
						] })
					]
				}, e.name);
			})
		}),
		/* @__PURE__ */ (0, V.jsxs)("p", {
			className: "fine",
			children: [
				"Illustrative score ",
				t.score.reported_score,
				". ",
				t.score.note
			]
		})
	] });
}
function Ba({ analysis: e, assessment: t }) {
	let n = e.debt_capacity, r = t.normalized_input.proposed_loan, i = (t) => {
		let n = t === "approval_minimum" ? e.breakevens.binding_approval_constraint : e.breakevens.binding_decline_constraint, r = n && e.breakevens.rows.find((e) => e.constraint === n && e.threshold_kind === t);
		return r && n ? {
			binding: n,
			row: r
		} : null;
	}, a = i("approval_minimum"), o = i("decline_floor"), s = pa(n);
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
		/* @__PURE__ */ (0, V.jsxs)("p", { children: [
			s === "fits" ? "The requested principal fits within the illustrative coverage minimums." : s === "over" ? "The requested principal is larger than the illustrative coverage minimums support." : "Existing obligations leave no room for new payments at the illustrative coverage minimums.",
			" ",
			Fa[n.binding_constraint],
			" binds first."
		] }),
		/* @__PURE__ */ (0, V.jsxs)("dl", {
			className: "capacityFacts",
			children: [
				/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Binding constraint" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: Fa[n.binding_constraint] })] }),
				/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsxs)("dt", { children: [
					"Maximum principal at ",
					xe(r.annual_rate, "%"),
					" for ",
					xe(r.term_months, "months")
				] }), /* @__PURE__ */ (0, V.jsx)("dd", { children: pe(n.max_principal, "money", me) })] }),
				/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Requested principal" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: pe(n.requested_principal, "money", me) })] }),
				/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: s === "fits" ? "Principal headroom" : "Principal shortfall" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: s === "fits" ? pe(n.principal_headroom, "money", me) : ge(n.principal_headroom.raw_value ?? "0", me) })] }),
				/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Largest new payment" }), /* @__PURE__ */ (0, V.jsxs)("dd", { children: [
					pe(n.max_annual_payment, "money", me),
					" a year (",
					pe(n.max_monthly_payment, "money", me),
					" a month)"
				] })] }),
				a && /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsxs)("dt", { children: [
					"Revenue cushion to the ",
					fa[a.binding],
					" approval minimum"
				] }), /* @__PURE__ */ (0, V.jsx)("dd", { children: ye(a.row.revenue_cushion, 2) })] }),
				o && /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsxs)("dt", { children: [
					"Revenue cushion to the ",
					fa[o.binding],
					" decline floor"
				] }), /* @__PURE__ */ (0, V.jsx)("dd", { children: ye(o.row.revenue_cushion, 2) })] })
			]
		}),
		/* @__PURE__ */ (0, V.jsx)("h3", { children: "New annual payment allowed by each minimum" }),
		/* @__PURE__ */ (0, V.jsx)("ul", {
			className: "constraintList",
			children: n.constraints.map((e) => /* @__PURE__ */ (0, V.jsxs)("li", {
				"data-binding": e.constraint === n.binding_constraint,
				children: [/* @__PURE__ */ (0, V.jsxs)("span", { children: [
					Fa[e.constraint],
					" at ",
					k(e.approval_minimum),
					e.constraint === n.binding_constraint && " (binding)"
				] }), /* @__PURE__ */ (0, V.jsx)("strong", { children: pe(e.max_annual_payment, "money", me) })]
			}, e.constraint))
		}),
		/* @__PURE__ */ (0, V.jsx)("p", {
			className: "fine",
			children: "Policy arithmetic at the approval minimums, holding every other input fixed. It is not a credit approval."
		})
	] });
}
function Va({ assessment: e }) {
	let t = e.historical_spread, n = (e, n, r) => ({
		label: Ge(t[e], e),
		short: t[e].period_end,
		value: n,
		text: r
	});
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "trendGrid",
		children: [/* @__PURE__ */ (0, V.jsx)(Na, {
			title: "Gross receipts",
			points: t.map((e, t) => n(t, e.financials.gross_receipts, fe(e.financials.gross_receipts)))
		}), /* @__PURE__ */ (0, V.jsx)(Na, {
			title: "EBITDA",
			points: t.map((e, t) => n(t, e.ebitda.status === "available" ? e.ebitda.raw_value : null, pe(e.ebitda, "money")))
		})]
	});
}
function Ha({ view: e }) {
	let { state: t, retry: n } = Ki(), { assessment: r } = e;
	if (e.ready && e.accepted?.mode === "legacy") return /* @__PURE__ */ (0, V.jsx)(Ia, {
		title: "Overview",
		children: /* @__PURE__ */ (0, V.jsx)("p", { children: "Legacy decisions have policy factor results only. The explanation, debt capacity and trends need a dated assessment." })
	});
	if (!r) return /* @__PURE__ */ (0, V.jsx)(Ia, {
		title: "Overview",
		children: /* @__PURE__ */ (0, V.jsx)("p", { children: "No current assessment is available. Resolve or choose a case to see its explanation." })
	});
	let i = t.status === "ready" ? t.analysis : null;
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "overviewGrid",
		children: [
			/* @__PURE__ */ (0, V.jsx)(Ia, {
				title: "Why this decision",
				className: "overviewExplanation",
				children: i ? /* @__PURE__ */ (0, V.jsx)(za, { analysis: i }) : /* @__PURE__ */ (0, V.jsx)(La, {
					state: t,
					retry: n
				})
			}),
			/* @__PURE__ */ (0, V.jsx)(Ia, {
				title: "Debt capacity",
				className: "overviewCapacity",
				children: i ? /* @__PURE__ */ (0, V.jsx)(Ba, {
					analysis: i,
					assessment: r
				}) : /* @__PURE__ */ (0, V.jsx)(La, { state: t })
			}),
			/* @__PURE__ */ (0, V.jsx)(Ia, {
				title: "Trends",
				className: "overviewTrends",
				children: /* @__PURE__ */ (0, V.jsx)(Va, { assessment: r })
			})
		]
	});
}
//#endregion
//#region src/views/AssumptionsView.tsx
function Ua({ title: e, prefix: t, values: n, period: r, input: i, mode: a, canEdit: o, onEdit: s }) {
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "panel",
		children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: e }), Object.entries(n).map(([e, n]) => {
			let c = Ye(i, a, t, e, n, r);
			return /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "assumption",
				children: [/* @__PURE__ */ (0, V.jsx)(Sa, {
					field: c,
					canEdit: o,
					onEdit: s,
					children: c.label
				}), /* @__PURE__ */ (0, V.jsx)("strong", { children: c.unit === "%" ? `${Se(x(String(n), 2))}%` : c.unit === "months" ? `${n} months` : `$${Se(String(n))}` })]
			}, e);
		})]
	});
}
function Wa({ ready: e, accepted: t, canEdit: n, onEdit: r }) {
	let i = t?.input;
	return /* @__PURE__ */ (0, V.jsxs)("section", { children: [/* @__PURE__ */ (0, V.jsx)("p", { children: e ? "Annual assumptions used by the backend. Select an amount to propose an edit." : "Previous accepted assumptions; no active recommendation." }), t && i && /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "assumptionsGrid",
		children: [
			/* @__PURE__ */ (0, V.jsx)(Ua, {
				title: "Existing debt",
				prefix: "/existing_debt",
				values: i.existing_debt,
				input: i,
				mode: t.mode,
				canEdit: n,
				onEdit: r
			}),
			/* @__PURE__ */ (0, V.jsx)(Ua, {
				title: "Proposed fixed monthly loan",
				prefix: "/proposed_loan",
				values: {
					amount: i.proposed_loan.amount,
					annual_rate: i.proposed_loan.annual_rate,
					term_months: i.proposed_loan.term_months
				},
				input: i,
				mode: t.mode,
				canEdit: n,
				onEdit: r
			}),
			/* @__PURE__ */ (0, V.jsx)(Ua, {
				title: "Working capital",
				prefix: "/working_capital",
				values: {
					ar_increase: i.working_capital.ar_increase,
					inventory_increase: i.working_capital.inventory_increase,
					ap_increase: i.working_capital.ap_increase,
					cash_taxes_paid: i.working_capital.cash_taxes_paid
				},
				period: qe(i),
				input: i,
				mode: t.mode,
				canEdit: n,
				onEdit: r
			})
		]
	})] });
}
function Ga({ ready: e, accepted: t, canEdit: n, onEdit: r }) {
	let i = t?.input;
	return /* @__PURE__ */ (0, V.jsxs)("section", { children: [/* @__PURE__ */ (0, V.jsx)("p", { children: e ? "Guarantor income and personal debt used for global coverage. Select an amount to propose an edit." : "Previous accepted guarantors; no active recommendation." }), t && i && /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "assumptionsGrid",
		children: [i.guarantors.map((e, a) => /* @__PURE__ */ (0, V.jsx)(Ua, {
			title: e.name,
			prefix: `/guarantors/${a}`,
			values: {
				ownership_percentage: e.ownership_percentage,
				wages: e.wages,
				interest_dividend_income: e.interest_dividend_income,
				mortgage_pi_annual: e.mortgage_pi_annual,
				auto_loan_annual: e.auto_loan_annual,
				credit_card_min_annual: e.credit_card_min_annual
			},
			input: i,
			mode: t.mode,
			canEdit: n,
			onEdit: r
		}, a)), i.guarantors.length === 0 && /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "panel",
			children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Business-only fallback" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "No guarantors supplied. The backend uses full business EBITDA for global coverage." })]
		})]
	})] });
}
//#endregion
//#region src/views/DetailsView.tsx
function Ka({ ready: e, input: t, assessment: n, decision: r, index: i }) {
	let a = (0, c.useId)();
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel",
		"aria-labelledby": a,
		children: [
			/* @__PURE__ */ (0, V.jsx)("h2", {
				id: a,
				children: "Calculation details"
			}),
			n ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Policy version:",
					" ",
					/* @__PURE__ */ (0, V.jsx)("strong", { children: n.policy_snapshot.version })
				] }),
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"K-1 comparison periods:",
					" ",
					n.k1_history_periods.map((e, t) => Ge(e, t)).join(" / ")
				] }),
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "Current facts" }),
				Object.values(n.current_facts).map((e) => /* @__PURE__ */ (0, V.jsx)(qa, {
					metric: e,
					assessment: n
				}, e.fact_id)),
				/* @__PURE__ */ (0, V.jsxs)("h3", { children: [
					"Selected historical period:",
					" ",
					Ge(t.years[i], i)
				] }),
				We.map((e) => /* @__PURE__ */ (0, V.jsx)(qa, {
					metric: n.historical_spread[i][e],
					assessment: n
				}, e)),
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "Guarantor contributions" }),
				n.guarantor_contributions.length ? n.guarantor_contributions.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h4", { children: e.name }), [
					e.business_ebitda,
					e.outside_income,
					e.personal_debt
				].map((e) => /* @__PURE__ */ (0, V.jsx)(qa, {
					metric: e,
					assessment: n
				}, e.fact_id))] }, e.guarantor_index)) : /* @__PURE__ */ (0, V.jsx)("p", { children: "Business-only fallback; no guarantor contributions." }),
				/* @__PURE__ */ (0, V.jsxs)("details", { children: [/* @__PURE__ */ (0, V.jsx)("summary", { children: "Complete policy snapshot" }), /* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify(n.policy_snapshot, null, 2) })] }),
				/* @__PURE__ */ (0, V.jsxs)("p", {
					className: "fine",
					children: [
						"Calculation: ",
						n.calculation_version,
						" · serialization:",
						" ",
						n.serialization_version,
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Content fingerprint (not document authentication):",
						" ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: n.fingerprint.value })
					]
				})
			] }) : /* @__PURE__ */ (0, V.jsx)("p", { children: e ? "Legacy mode has decision factors but no dated spread or trace." : "No current assessment is available." }),
			r && /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h3", { children: "Raw policy comparisons" }), r.factors.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "operand",
				children: [
					/* @__PURE__ */ (0, V.jsx)("strong", { children: ze[e.name] }),
					/* @__PURE__ */ (0, V.jsxs)("span", { children: [
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
					/* @__PURE__ */ (0, V.jsx)("small", { children: e.source })
				]
			}, e.name))] })
		]
	});
}
function qa({ metric: e, assessment: t }) {
	let n = t.calculation_trace.find((t) => t.fact_id === e.fact_id);
	return n ? /* @__PURE__ */ (0, V.jsxs)("details", { children: [
		/* @__PURE__ */ (0, V.jsxs)("summary", { children: [
			e.fact_id,
			" · ",
			nr(e)
		] }),
		/* @__PURE__ */ (0, V.jsx)("p", { children: /* @__PURE__ */ (0, V.jsx)("strong", { children: n.definition_id }) }),
		/* @__PURE__ */ (0, V.jsx)("p", {
			className: "expression",
			children: n.expression
		}),
		/* @__PURE__ */ (0, V.jsx)("h3", { children: "Actual operands" }),
		n.operands.map((e, t) => /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "operand",
			children: [
				/* @__PURE__ */ (0, V.jsx)("code", { children: e.reference }),
				/* @__PURE__ */ (0, V.jsxs)("span", { children: [
					e.raw_value === null ? "Not applicable" : String(e.raw_value),
					" ",
					e.unit
				] }),
				/* @__PURE__ */ (0, V.jsxs)("small", { children: [e.reference_type, e.reported_value !== null && ` · Reported component: ${w(String(e.reported_value), 2)} ${e.unit}`] })
			]
		}, t)),
		/* @__PURE__ */ (0, V.jsxs)("p", { children: [
			"Raw result: ",
			String(n.raw_value),
			" ",
			n.unit
		] }),
		n.explanation && /* @__PURE__ */ (0, V.jsx)("p", { children: n.explanation })
	] }) : null;
}
//#endregion
//#region src/views/MemoView.tsx
function Ja({ decision: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel memo",
		children: [
			/* @__PURE__ */ (0, V.jsx)("h2", { children: "Credit memo" }),
			e ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "Recommendation" }),
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					e.outcome[0].toUpperCase() + e.outcome.slice(1),
					" ",
					"for prototype demonstration based on the accepted inputs."
				] }),
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "Primary factors considered" }),
				/* @__PURE__ */ (0, V.jsx)("ul", { children: e.factors.map((e) => /* @__PURE__ */ (0, V.jsxs)("li", { children: [
					ze[e.name],
					": ",
					Ce(e),
					" —",
					" ",
					e.passed === null ? "manual review required" : e.passed ? "meets configured policy" : "does not meet configured policy"
				] }, e.name)) }),
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "Recorded reasons" }),
				e.reasons.length ? /* @__PURE__ */ (0, V.jsx)("ul", { children: e.reasons.map((e, t) => /* @__PURE__ */ (0, V.jsx)("li", { children: e.message }, t)) }) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No additional reasons returned." })
			] }) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No current decision is available." }),
			/* @__PURE__ */ (0, V.jsx)("p", {
				className: "fine",
				children: di
			})
		]
	});
}
//#endregion
//#region src/views/HistoryView.tsx
function Ya({ saved: e, ready: t, history: n, input: r, onOpen: i }) {
	return e ? /* @__PURE__ */ (0, V.jsx)(Sr, {
		saved: e,
		active: t,
		onOpen: i
	}) : /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel historyPanel",
		children: [
			/* @__PURE__ */ (0, V.jsx)("h2", { children: "Session edit history" }),
			/* @__PURE__ */ (0, V.jsx)("p", { children: "Resets on reload. Actor: demonstration analyst; timestamps are local and unverified." }),
			n.length === 0 ? /* @__PURE__ */ (0, V.jsx)("p", { children: "No applied edits this session." }) : n.map((e, t) => /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "audit",
				children: [
					/* @__PURE__ */ (0, V.jsx)("strong", { children: e.path }),
					/* @__PURE__ */ (0, V.jsxs)("span", { children: [
						e.prior,
						" → ",
						e.next
					] }),
					/* @__PURE__ */ (0, V.jsxs)("small", { children: [
						e.rationale,
						" · ",
						e.at
					] })
				]
			}, t)),
			r && "overrides" in r && !!r.overrides?.length && /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)("h3", { children: "Unverified imported history" }), r.overrides.map((e, t) => /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "audit imported",
				children: [
					/* @__PURE__ */ (0, V.jsx)("strong", { children: e.field }),
					/* @__PURE__ */ (0, V.jsxs)("span", { children: [
						String(e.prior_value),
						" → ",
						String(e.new_value)
					] }),
					/* @__PURE__ */ (0, V.jsxs)("small", { children: [
						e.rationale,
						" · supplied actor ",
						e.actor,
						" · ",
						e.at
					] })
				]
			}, t))] })
		]
	});
}
//#endregion
//#region src/sampleCases.ts
var Xa = {
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
}, Za = {
	borrower_name: "Alpine Fabrication",
	geography: "60601",
	years: [{
		gross_receipts: "3900000.0",
		cogs: "2570000.0",
		operating_expense_excl_dna_interest_comp: "607000.0",
		officer_compensation: "175000.0",
		depreciation: "90000.0",
		amortization: "10000.0",
		interest_expense: "58000.0",
		section_179: "0.0",
		k1_distribution: "280000.0"
	}, {
		gross_receipts: "4200000.0",
		cogs: "2750000.0",
		operating_expense_excl_dna_interest_comp: "640000.0",
		officer_compensation: "180000.0",
		depreciation: "95000.0",
		amortization: "10000.0",
		interest_expense: "62000.0",
		section_179: "40000.0",
		k1_distribution: "300000.0"
	}],
	existing_debt: {
		cpltd_annual: "58000.0",
		operating_lease_annual: "24000.0"
	},
	proposed_loan: {
		amount: "500000.0",
		annual_rate: "0.105",
		term_months: 120
	},
	guarantors: [{
		name: "Dana Alpine",
		ownership_percentage: "1.0",
		wages: "65000.0",
		interest_dividend_income: "3000.0",
		mortgage_pi_annual: "28800.0",
		auto_loan_annual: "7200.0",
		credit_card_min_annual: "3600.0"
	}],
	working_capital: {
		ar_increase: "140000.0",
		inventory_increase: "60000.0",
		ap_increase: "50000.0",
		cash_taxes_paid: "95000.0"
	},
	overrides: []
}, Qa = "The server could not evaluate this case", $a = 3;
function eo(e) {
	if (e.status === 413) return "This case is larger than the 1,000,000-byte request limit, so it was not evaluated.";
	let t = e.fieldErrors.filter((e) => e.pointer !== "");
	if (!t.length) return `${Qa}: ${e.detail ?? e.fieldErrors[0]?.message ?? e.message}`;
	let n = t.slice(0, $a).map((e) => `${et(e.pointer)}: ${e.message}`), r = t.length - n.length;
	return `${Qa}. ${n.join(" ")}${r > 0 ? ` …and ${r} more.` : ""}`;
}
function to(e) {
	if (e instanceof jt) return e.kind === "rejected" ? eo(e) : e.kind === "unreadable" ? `The calculation service sent an unreadable response (${e.status}). Nothing was recalculated; retry when it is available.` : e.status ? `The calculation service is unavailable (${e.status}). Nothing was recalculated; retry shortly.` : e.detail === "timeout" ? "The calculation service did not respond within 30 seconds. Nothing was recalculated; retry when it is available." : e.detail ? `The request was not completed: ${e.detail}` : "The calculation service could not be reached. Nothing was recalculated; check the connection, then retry.";
	let t = e instanceof Error ? e.message : String(e), n = /^Incomplete or invalid assessment: (.+)$/.exec(t);
	return n ? `The calculation service returned an incomplete result (${n[1]}), so it was not used. Retry, or check the server version.` : t;
}
function no(e) {
	let t = e instanceof Error ? e.message : String(e);
	return `This file can't be imported: ${e instanceof SyntaxError || t === "Invalid JSON number." ? "it is not valid JSON." : t.endsWith("unsupported schema_version") ? "its schema version is not supported." : /^Incomplete or invalid assessment: request$/.test(t) ? "it does not contain a case object." : `${t.charAt(0).toLowerCase()}${t.slice(1)}`}`;
}
//#endregion
//#region src/useSavedWrite.ts
var ro = class {
	storage;
	transport;
	state;
	listeners = /* @__PURE__ */ new Set();
	request = null;
	constructor(e, t = fetch) {
		this.storage = e, this.transport = t;
		let n = Mn(e);
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
		return q(), this.submit(e);
	}
	retry() {
		let e = this.state.operation;
		if (!e || this.state.inFlight || this.state.writeError?.status === 409 && !this.state.writeError.certain) throw Error("Review this pending operation before retrying.");
		return q(), this.submit(e);
	}
	submit(e) {
		let t = wn(e);
		if (this.state.operation && !z(this.state.operation, t)) throw Error("The pending operation cannot be replaced.");
		try {
			jn(this.storage, t);
		} catch (e) {
			let t = Mn(this.storage);
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
			Nn(this.storage, e.id), this.update({
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
				...await Mr(e, t.signal, this.transport)
			} : {
				kind: "case",
				...await pr(e, t.signal, this.transport)
			};
			if (t.signal.aborted) throw new cr("The view closed before acknowledgment. Keep the original operation for exact retry.");
			return this.clear(e), n;
		} catch (t) {
			let n = lr(t);
			throw this.update({ writeError: n }), n.certain && this.clear(e), n;
		} finally {
			this.request === t && (this.request = null, this.update({ inFlight: !1 }));
		}
	}
	discard() {
		if (this.request) throw Error("Wait for the current response before discarding tracking.");
		Pn(this.storage), this.update({
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
function io() {
	let [e] = (0, c.useState)(() => new ro(En())), t = (0, c.useSyncExternalStore)(e.subscribe, e.snapshot);
	return (0, c.useEffect)(() => () => e.abort(), [e]), {
		...t,
		controller: e
	};
}
//#endregion
//#region src/useAnalystWorkspace.ts
function ao() {
	let [e, t] = (0, c.useReducer)(Bn, null, () => zn(En())), n = (0, c.useRef)(e);
	n.current = e;
	let r = (0, c.useRef)(0), i = (0, c.useRef)(null), a = (0, c.useRef)(null), o = (0, c.useRef)(null), s = (0, c.useRef)(!1), l = io(), { operation: u, recoveryError: d, inFlight: f, writeError: p } = l, [m, h] = (0, c.useState)(null), [g, _] = (0, c.useState)(null), v = (0, c.useRef)(0), [y, b] = (0, c.useState)(""), [x, S] = (0, c.useState)([]), [C, ee] = (0, c.useState)(null), [w, te] = (0, c.useState)(null), [ne, T] = (0, c.useState)(null), E = (0, c.useRef)(ne);
	E.current = ne;
	function D(e, n, o = "evaluate") {
		let s = ++r.current;
		return i.current?.abort(), a.current?.abort(), i.current = null, a.current = null, t({
			type: "start",
			id: s,
			filename: e,
			draft: n,
			action: o
		}), S([]), s;
	}
	async function O(e, n = D(e.filename, e)) {
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
			let i = await Nt(e, a.signal);
			if (n === r.current && !a.signal.aborted) return t({
				type: "success",
				id: n,
				accepted: i
			}), i;
		} catch (e) {
			n === r.current && !a.signal.aborted && (S(e instanceof jt ? e.fieldErrors : []), t({
				type: "failure",
				id: n,
				error: to(e)
			}));
		}
	}
	function k(e) {
		In(En(), null), O({
			mode: e,
			payload: e === "dated" ? Xa : Fe(Za),
			filename: e === "dated" ? "alpine_dated_v2.json" : "alpine.json",
			resetHistory: !0
		});
	}
	async function re(e) {
		if (!e) return;
		In(En(), null);
		let n = D(e.name, null);
		try {
			if (e.size > 1e6) throw Error("Use a JSON file no larger than 1,000,000 bytes.");
			let t = await e.text();
			if (n !== r.current) return;
			let i = le(t);
			await O({
				mode: Ne(i),
				payload: i,
				filename: e.name,
				rawJson: t,
				resetHistory: !0
			}, n);
		} catch (e) {
			n === r.current && t({
				type: "failure",
				id: n,
				error: no(e)
			});
		}
	}
	async function A(e) {
		let n = D(`Saved case ${e.caseId}`, null, "open"), a = new AbortController();
		i.current = a, In(En(), e);
		try {
			let i = await fr(e.caseId, e.revision, a.signal);
			if (n === r.current && !a.signal.aborted && t({
				type: "stored-success",
				id: n,
				view: i,
				selection: e.revision === "latest" ? "latest" : "revision"
			}), n === r.current && !a.signal.aborted) return i;
		} catch (e) {
			n === r.current && !a.signal.aborted && t({
				type: "failure",
				id: n,
				error: lr(e).message
			});
		}
	}
	async function ie(e, n) {
		let i = new AbortController();
		a.current = i;
		try {
			let a = await fr(e.snapshot.case_id, "latest", i.signal);
			if (n !== r.current || i.signal.aborted) return;
			if (a.snapshot.revision < e.snapshot.revision || a.snapshot.revision === e.snapshot.revision && (a.etag !== e.etag || a.snapshot.run_id !== e.snapshot.run_id)) throw Error("Latest snapshot disagrees with the acknowledged receipt.");
			t({
				type: "head",
				id: n,
				caseId: e.snapshot.case_id,
				revision: e.snapshot.revision,
				headRevision: a.snapshot.revision
			}), In(En(), {
				caseId: e.snapshot.case_id,
				revision: a.snapshot.revision === e.snapshot.revision ? "latest" : e.snapshot.revision
			});
		} catch (e) {
			n === r.current && !i.signal.aborted && b(`Write accepted. Latest could not be confirmed; this original receipt remains read-only. ${lr(e).message}`);
		}
	}
	async function j(e) {
		o.current?.abort();
		let t = new AbortController();
		o.current = t;
		try {
			let n = await fr(e.caseId, "latest", t.signal);
			if (t.signal.aborted || !s.current) return;
			if (!n.assessment || n.snapshot.revision < e.baseRevision || !z(Gt(n.snapshot.normalized_input, e.review.path).context, e.context)) throw Error("The latest field's definition/context cannot be reviewed with this proposal.");
			T((t) => t?.operation.id === e.id ? {
				...t,
				latest: n,
				error: ""
			} : t);
		} catch (n) {
			!t.signal.aborted && s.current && T((t) => t?.operation.id === e.id ? {
				...t,
				latest: null,
				error: lr(n).message
			} : t);
		}
	}
	async function ae(e, n, i, a) {
		b("");
		try {
			let e = await a;
			if (e.kind !== "case") throw Error("Unexpected comparison receipt for case write");
			if (!s.current) return;
			te(null), b(`${e.replayed ? "Recovered the original" : "Saved"} revision ${e.view.snapshot.revision}.`), n === r.current ? (t({
				type: "stored-success",
				id: n,
				view: e.view,
				selection: "receipt",
				resetPeriod: i
			}), In(En(), {
				caseId: e.view.snapshot.case_id,
				revision: e.view.snapshot.revision
			}), ie(e.view, n)) : ee(e.view);
		} catch (i) {
			if (!s.current) return;
			let a = lr(i);
			a.certain && (a.status === 412 && e.kind === "edit" ? (T({
				operation: e,
				latest: null,
				error: ""
			}), j(e)) : te(e)), n === r.current && t({
				type: "failure",
				id: n,
				error: a.message
			});
		}
	}
	function oe(e, t) {
		if (l.controller.snapshot().inFlight || l.controller.snapshot().operation || d || E.current) throw Error("Resolve this tab's existing saved write or proposal first.");
		let n = l.controller.start(e);
		te(null), ee(null), ae(e, D(e.kind === "create" ? "Saving dated case" : `Saved case ${e.caseId}`, null, "write"), t, n);
	}
	function M(e) {
		let t = n.current;
		if (t.status !== "ready" || t.accepted?.mode !== "dated" || t.saved) throw Error("Open an accepted unsaved dated input before saving.");
		oe(kn(t.accepted.input, e), !0);
	}
	function se(e = n.current) {
		return e.status === "ready" && !!e.accepted && (!e.saved || !l.controller.snapshot().operation && !d && !E.current && !!e.saved.view.assessment && e.saved.selection === "latest" && e.saved.headRevision === e.saved.view.snapshot.revision);
	}
	function ce(e, t) {
		let r = n.current;
		if (!se(r) || !r.accepted) throw Error("Open a supported latest revision and resolve pending work before editing.");
		r.saved ? oe(An(r.saved.view, e, t), !1) : O({
			mode: r.accepted.mode,
			payload: Vn(r.accepted.input, e),
			filename: r.accepted.filename,
			edit: e
		});
	}
	function ue() {
		let e = l.controller.snapshot().operation;
		if (!e || f || p?.status === 409 && !p.certain) return;
		let t = l.controller.retry();
		if (e.kind === "comparison") {
			fe(e, r.current, t);
			return;
		}
		ae(e, D(e.kind === "create" ? "Recovering saved case" : `Saved case ${e.caseId}`, null, "write"), e.kind === "create", t);
	}
	function de() {
		l.controller.discard(), b("Local recovery tracking discarded. This does not undo a write that might already be saved.");
	}
	async function fe(e, t, n) {
		_(null), b("");
		try {
			let r = await n;
			if (!s.current) return;
			if (r.kind !== "comparison") throw Error("Unexpected case receipt for comparison save");
			h({
				scope: t,
				view: r.view,
				operationId: e.id,
				serial: ++v.current
			}), b(`${r.replayed ? "Recovered the original" : "Saved"} comparison ${r.view.record.comparison_id}.`);
		} catch (e) {
			if (s.current) {
				let n = lr(e);
				_({
					scope: t,
					message: n.message,
					code: n.code
				});
			}
		}
	}
	function pe(e) {
		let t = n.current, i = e.baseline;
		if (t.status !== "ready" || !t.saved || E.current || t.saved.view.snapshot.case_id !== i.case_id || t.saved.view.snapshot.revision !== i.revision || t.saved.view.snapshot.run_id !== i.run_id || t.saved.view.snapshot.payload_hash !== i.payload_hash) throw Error("Review the currently selected original baseline before saving.");
		let a = Tn(e), o = l.controller.start(a);
		fe(a, r.current, o);
	}
	function me(e) {
		let n = D(`Saved case ${e.snapshot.case_id}`, null, "open");
		t({
			type: "stored-success",
			id: n,
			view: e,
			selection: "latest"
		}), In(En(), {
			caseId: e.snapshot.case_id,
			revision: "latest"
		}), o.current?.abort(), T(null), E.current = null, l.controller.clearError();
	}
	function he() {
		let e = E.current;
		if (!e?.latest) return null;
		let t = JSON.parse(e.operation.body), n = Gt(e.latest.snapshot.normalized_input, e.operation.review.path).value;
		return me(e.latest), {
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
	function ge() {
		let e = E.current;
		e?.latest ? me(e.latest) : (o.current?.abort(), T(null), E.current = null);
	}
	async function _e(e, n) {
		let i = w;
		if (i?.kind !== "edit") return null;
		let a = r.current, s = new AbortController();
		o.current?.abort(), o.current = s;
		let c = await fr(i.caseId, "latest", s.signal);
		if (s.signal.aborted || a !== r.current || !c.assessment) return null;
		let l = Gt(c.assessment.normalized_input, i.review.path);
		if (!z(l.context, i.context)) throw Error("The latest field has a different context. Review the complete original before changing it.");
		let u = D(`Saved case ${i.caseId}`, null, "open");
		return t({
			type: "stored-success",
			id: u,
			view: c,
			selection: "latest"
		}), In(En(), {
			caseId: i.caseId,
			revision: "latest"
		}), te(null), {
			field: {
				...i.review,
				value: l.value
			},
			proposal: {
				path: i.review.path,
				prior: l.value,
				next: e,
				rationale: n,
				at: "unverified proposal"
			}
		};
	}
	return (0, c.useEffect)(() => {
		s.current = !0;
		let e = l.controller.snapshot().operation;
		if (!e || e.kind === "comparison") {
			let t = Fn(En());
			t ? A(t) : e?.kind === "comparison" && A({
				caseId: e.caseId,
				revision: e.baselineRevision
			});
		}
		return () => {
			s.current = !1, r.current++, i.current?.abort(), a.current?.abort(), o.current?.abort();
		};
	}, []), {
		state: e,
		fieldErrors: x,
		submit: O,
		upload: re,
		demo: k,
		save: M,
		edit: ce,
		openSaved: A,
		operation: u,
		comparisonAck: m,
		comparisonError: g,
		retainComparison: pe,
		inFlight: f,
		writeError: p,
		recoveryError: d,
		notice: y,
		offer: C,
		rejected: w,
		conflict: ne,
		canEdit: se(e),
		canSave: e.status === "ready" && e.accepted?.mode === "dated" && !e.saved && !u && !d && !ne,
		retryWrite: ue,
		discardTracking: de,
		reviewConflict: he,
		reviewRejected: _e,
		cancelConflict: ge,
		refreshConflict: () => {
			E.current && j(E.current.operation);
		},
		dismissRejected: () => te(null),
		dismissOffer: () => ee(null),
		dismissComparisonAck: () => h(null),
		clearComparisonError: () => _(null),
		deferComparisonAck: (e) => h((t) => t?.serial === e ? {
			...t,
			scope: null
		} : t)
	};
}
//#endregion
//#region src/components/SessionStatus.tsx
function oo({ startedAt: e }) {
	let [t, n] = (0, c.useState)(Date.now());
	if ((0, c.useEffect)(() => {
		if (e === null) return;
		n(Date.now());
		let t = setInterval(() => n(Date.now()), 250);
		return () => clearInterval(t);
	}, [e]), e === null) return null;
	let r = Math.max(0, t - e);
	return /* @__PURE__ */ (0, V.jsxs)("span", {
		className: "requestDeadline",
		"aria-busy": "true",
		children: [r >= 100 && /* @__PURE__ */ (0, V.jsxs)("span", { children: [
			"Request active · ",
			Math.max(0, 30 - Math.floor(r / 1e3)),
			"s until deadline"
		] }), r >= 1e3 && /* @__PURE__ */ (0, V.jsx)("span", {
			className: "requestSkeleton",
			"aria-hidden": "true"
		})]
	});
}
function so({ actor: e }) {
	let t = (0, c.useSyncExternalStore)(yt, vt), n = (0, c.useSyncExternalStore)(sr, or);
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsxs)("div", {
		className: "sessionStatus",
		"aria-label": "Connection status",
		children: [
			/* @__PURE__ */ (0, V.jsx)("span", {
				className: "connectionBadge",
				children: wt() ? "Testing host connected" : "API access verified"
			}),
			/* @__PURE__ */ (0, V.jsxs)("span", { children: ["Active operator identity unavailable", e ? ` · selected record attributed to ${e}` : ""] }),
			/* @__PURE__ */ (0, V.jsx)("span", { children: "Page memory only · reload clears drafts and retry tracking" }),
			/* @__PURE__ */ (0, V.jsx)(oo, { startedAt: t.startedAt })
		]
	}), n && /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "modelScope",
		role: "status",
		children: [/* @__PURE__ */ (0, V.jsx)("strong", { children: "Stateless Mode Active" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "Case persistence is disabled. Commercial assessments and decisions, Consumer Decision, and SBA Screen remain usable through the standalone API. The Streamlit testing bridge supports commercial workflows only." })]
	})] });
}
//#endregion
//#region src/CommercialComposer.tsx
function co(e) {
	let t = Vr(e === "dated" ? Xa : Za), n = (e, t = "") => Array.isArray(e) ? t === "guarantors" ? [] : e.slice(0, 1).map((e) => n(e)) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).map(([e, t]) => [e, n(t, e)])) : [
		"schema_version",
		"currency",
		"monetary_unit",
		"annual_rate_unit",
		"rate_type",
		"repayment_type",
		"payment_frequency"
	].includes(t) ? e : "";
	return n(t);
}
var lo = (e, t, n, r = {}) => ({
	pointer: e,
	label: t,
	kind: n,
	...r
});
function uo({ mode: e, initial: t, serverErrors: n, serverMessage: r, busy: i, onEvaluate: a, onClose: o }) {
	let s = Yr(t ? Vr(t) : co(e)), [l, u] = (0, c.useState)(""), d = s.values.years, f = s.values.guarantors;
	(0, c.useEffect)(() => {
		n.length && s.reject(n);
	}, [n]);
	let p = [
		lo("/borrower_name", "Borrower name", "text"),
		lo("/geography", "Geography", "text", {
			placeholder: "60601",
			helper: "ZIP code or supplied geographic reference"
		}),
		...e === "dated" ? [lo("/assessment_as_of", "Assessment as of", "date")] : []
	], m = d.map((t, n) => [...e === "dated" ? [lo(`/years/${n}/period_start`, `Period start · Period ${n + 1}`, "date"), lo(`/years/${n}/period_end`, `Period end · Period ${n + 1}`, "date")] : [], ...we.map((e) => lo(`/years/${n}/${e}`, `${ze[e]} · Period ${n + 1}`, "money", e === "interest_expense" ? { min: "0" } : {}))]), h = [
		lo("/existing_debt/cpltd_annual", "Annual CPLTD", "money", { min: "0" }),
		lo("/existing_debt/operating_lease_annual", "Annual operating lease", "money", { min: "0" }),
		lo("/proposed_loan/amount", "Requested principal", "money", { min: "0" }),
		lo("/proposed_loan/annual_rate", "Annual nominal rate", "rate", {
			min: "0",
			max: "1"
		}),
		lo("/proposed_loan/term_months", "Loan term", "integer", {
			min: e === "dated" ? "12" : "1",
			max: "12000",
			helper: e === "dated" ? "Months 12–12,000 · integer" : "Positive whole months · integer"
		})
	], g = [...e === "dated" ? [lo("/working_capital/period_start", "Working capital period start", "date"), lo("/working_capital/period_end", "Working capital period end", "date")] : [], ...[
		"ar_increase",
		"inventory_increase",
		"ap_increase",
		"cash_taxes_paid"
	].map((e) => lo(`/working_capital/${e}`, ze[e] ?? e, "money"))], _ = f.map((e, t) => [
		lo(`/guarantors/${t}/name`, `Guarantor ${t + 1} name`, "text"),
		lo(`/guarantors/${t}/ownership_percentage`, `Guarantor ${t + 1} ownership`, "rate", {
			min: "0",
			max: "1",
			helper: "Ownership [0, 1] · combined ownership validated by server"
		}),
		...[
			"wages",
			"interest_dividend_income",
			"mortgage_pi_annual",
			"auto_loan_annual",
			"credit_card_min_annual"
		].map((e) => lo(`/guarantors/${t}/${e}`, `Guarantor ${t + 1} ${ze[e] ?? e.replace(/_/g, " ")}`, "money", ["wages", "interest_dividend_income"].includes(e) ? {} : { min: "0" }))
	]), v = [
		...p,
		...m.flat(),
		...h,
		...g,
		..._.flat()
	], y = (e) => /* @__PURE__ */ (0, V.jsx)("div", {
		className: "formGrid",
		children: e.map((e) => /* @__PURE__ */ (0, V.jsx)($r, {
			form: s,
			spec: e
		}, e.pointer))
	});
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel composerPanel",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h1", { children: e === "dated" ? "Build a dated assessment" : "Build an undated decision" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "Enter source facts. The server calculates every financial result and policy verdict." })] }), /* @__PURE__ */ (0, V.jsx)("button", {
					type: "button",
					onClick: o,
					children: "Return to workspace"
				})]
			}),
			/* @__PURE__ */ (0, V.jsxs)("label", {
				className: "sampleSelector",
				children: ["Load sample case", /* @__PURE__ */ (0, V.jsxs)("select", {
					"aria-label": "Load sample case",
					value: l,
					onChange: (t) => {
						let n = t.target.value;
						u(n), n && s.replace(e === "dated" ? Xa : Za);
					},
					children: [/* @__PURE__ */ (0, V.jsx)("option", {
						value: "",
						children: "Choose a synthetic preset"
					}), /* @__PURE__ */ (0, V.jsx)("option", {
						value: e === "dated" ? "dated" : "legacy",
						children: e === "dated" ? "Alpine · Dated v2 · exact decimal strings" : "Alpine · Undated commercial decision"
					})]
				})]
			}),
			/* @__PURE__ */ (0, V.jsxs)("form", {
				ref: s.root,
				className: "guidedForm",
				noValidate: !0,
				onSubmit: (t) => {
					if (t.preventDefault(), i) return;
					let n = s.prepare(v);
					n && a({
						mode: e,
						payload: n,
						filename: "Analyst-entered case",
						resetHistory: !0
					});
				},
				children: [
					/* @__PURE__ */ (0, V.jsx)(Xr, {
						form: s,
						specs: v
					}),
					r && /* @__PURE__ */ (0, V.jsx)("p", {
						role: "alert",
						children: r
					}),
					/* @__PURE__ */ (0, V.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, V.jsx)("legend", { children: "Case identity" }), y(p)] }),
					e === "dated" && /* @__PURE__ */ (0, V.jsxs)("div", {
						className: "structuralHints",
						"aria-label": "Fiscal-period structural hints",
						children: [qr(s.values).map((e) => /* @__PURE__ */ (0, V.jsxs)("span", {
							"data-valid": e.valid,
							children: [
								e.valid ? "Ready" : "Review",
								" · ",
								e.label
							]
						}, e.label)), /* @__PURE__ */ (0, V.jsx)("p", {
							className: "fine",
							children: "Structural hints are non-blocking. The server validates fiscal dates and working capital."
						})]
					}),
					m.map((e, t) => /* @__PURE__ */ (0, V.jsxs)("details", {
						open: !0,
						children: [
							/* @__PURE__ */ (0, V.jsxs)("summary", { children: ["Financial period ", t + 1] }),
							y(e),
							d.length > 1 && /* @__PURE__ */ (0, V.jsxs)("button", {
								type: "button",
								onClick: () => s.setValues((e) => ({
									...e,
									years: d.filter((e, n) => n !== t)
								})),
								children: ["Remove period ", t + 1]
							})
						]
					}, t)),
					/* @__PURE__ */ (0, V.jsx)("button", {
						type: "button",
						onClick: () => {
							d.length < 10 && s.setValues((e) => ({
								...e,
								years: [...d, Object.fromEntries(Object.keys(d[0]).map((e) => [e, ""]))]
							}));
						},
						children: "Add financial period"
					}),
					/* @__PURE__ */ (0, V.jsxs)("details", {
						open: !0,
						children: [
							/* @__PURE__ */ (0, V.jsx)("summary", { children: "Debt and proposed loan" }),
							y(h),
							e === "dated" && /* @__PURE__ */ (0, V.jsx)("p", {
								className: "fine",
								children: "Fixed rate · fully amortizing · monthly payments. These conventions remain explicit in the request."
							})
						]
					}),
					/* @__PURE__ */ (0, V.jsxs)("details", { children: [/* @__PURE__ */ (0, V.jsx)("summary", { children: "Working capital and cash taxes" }), y(g)] }),
					/* @__PURE__ */ (0, V.jsxs)("details", { children: [
						/* @__PURE__ */ (0, V.jsxs)("summary", { children: [
							"Guarantors (",
							f.length,
							")"
						] }),
						!f.length && /* @__PURE__ */ (0, V.jsx)("p", { children: "Business-only fallback; the backend uses full business EBITDA when guarantors are empty." }),
						_.map((e, t) => /* @__PURE__ */ (0, V.jsxs)("fieldset", { children: [
							/* @__PURE__ */ (0, V.jsxs)("legend", { children: ["Guarantor ", t + 1] }),
							y(e),
							/* @__PURE__ */ (0, V.jsxs)("button", {
								type: "button",
								onClick: () => s.setValues((e) => ({
									...e,
									guarantors: f.filter((e, n) => n !== t)
								})),
								children: ["Remove guarantor ", t + 1]
							})
						] }, t)),
						/* @__PURE__ */ (0, V.jsx)("button", {
							type: "button",
							onClick: () => s.setValues((e) => ({
								...e,
								guarantors: [...f, Object.fromEntries(Object.keys(Xa.guarantors[0]).map((e) => [e, ""]))]
							})),
							children: "Add guarantor"
						})
					] }),
					/* @__PURE__ */ (0, V.jsx)("p", {
						className: "fine",
						children: "Drafts remain in page memory. Evaluation replaces the unsaved selection; saving a case is a separate reviewed action."
					}),
					/* @__PURE__ */ (0, V.jsx)("button", {
						className: "primary",
						type: "submit",
						"aria-busy": i,
						children: i ? "Evaluating assessment…" : e === "dated" ? "Evaluate assessment" : "Evaluate decision"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/domainContracts.ts
function fo(e, t) {
	if (!e) throw Error(`The ${t} response is incomplete or unsupported. It was not used.`);
}
function po(e, t) {
	return fo(e && typeof e == "object" && !Array.isArray(e), t), e;
}
function mo(e, t, n) {
	fo(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), n);
}
var ho = (e) => typeof e == "string" && e.length > 0 && e.length <= 2e4, Y = (e) => typeof e == "string" && y(e), go = (e) => typeof e == "boolean" || ho(e), _o = (e) => typeof e == "string" && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e;
function vo(e) {
	let t = po(e, "consumer");
	mo(t, [
		"vertical",
		"outcome",
		"score",
		"factors",
		"reasons",
		"policy_version",
		"disclaimer"
	], "consumer"), fo(t.vertical === "consumer" && [
		"approve",
		"review",
		"decline"
	].includes(String(t.outcome)) && Y(t.score) && S(t.score, "0") >= 0 && S(t.score, "1") <= 0 && ho(t.policy_version) && ho(t.disclaimer), "consumer");
	let n = [
		"back_end_dti",
		"atr_documentation",
		"synthetic_credit_score",
		"back_end_dti_review"
	];
	fo(Array.isArray(t.factors) && t.factors.length === 4, "consumer factors");
	let r = /* @__PURE__ */ new Set();
	for (let e of t.factors) {
		let t = po(e, "consumer factor");
		mo(t, [
			"name",
			"value",
			"raw_value",
			"weight",
			"threshold",
			"passed",
			"source",
			"comparison_operator",
			"decline_threshold",
			"decline_triggered"
		], "consumer factor"), fo(typeof t.name == "string" && n.includes(t.name) && !r.has(t.name) && go(t.value) && (t.raw_value === null || go(t.raw_value)) && Y(t.weight) && (t.threshold === null || go(t.threshold)) && (t.passed === null || typeof t.passed == "boolean") && ho(t.source) && [
			null,
			">=",
			">",
			"<",
			"=="
		].includes(t.comparison_operator) && (t.decline_threshold === null || Y(t.decline_threshold)) && (t.decline_triggered === null || typeof t.decline_triggered == "boolean"), "consumer factor"), (t.name === "back_end_dti" || t.name === "back_end_dti_review") && fo(Y(t.raw_value) && Y(t.value) && Y(t.threshold), "consumer DTI"), t.name === "atr_documentation" && fo(typeof t.value == "boolean" && typeof t.raw_value == "boolean" && typeof t.threshold == "boolean", "consumer documentation"), r.add(t.name);
	}
	fo(Array.isArray(t.reasons) && t.reasons.length <= 20, "consumer reasons");
	for (let e of t.reasons) {
		let t = po(e, "consumer reason");
		mo(t, [
			"code",
			"factor",
			"message",
			"value"
		], "consumer reason"), fo(ho(t.code) && typeof t.factor == "string" && r.has(t.factor) && ho(t.message) && go(t.value), "consumer reason");
	}
	return t;
}
function yo(e) {
	let t = po(e, "SBA");
	mo(t, [
		"schema_version",
		"borrower",
		"assessment_as_of",
		"sop_version",
		"size_eligible",
		"size_reason",
		"size_evidence",
		"size_standard_source",
		"policy_version",
		"credit_elsewhere",
		"global_dscr",
		"configured_global_dscr_floor",
		"coverage_pass",
		"outcome",
		"eligibility_status",
		"unresolved_requirements",
		"disclaimer"
	], "SBA"), fo(t.schema_version === "sba-screen-result-v2" && ho(t.borrower) && _o(t.assessment_as_of) && ["8", "8.1"].includes(String(t.sop_version)) && typeof t.size_eligible == "boolean" && ho(t.size_reason) && ho(t.policy_version) && Y(t.global_dscr) && Y(t.configured_global_dscr_floor) && typeof t.coverage_pass == "boolean" && ["review_required", "screen_failed"].includes(String(t.outcome)) && t.eligibility_status === "incomplete" && ho(t.disclaimer), "SBA");
	let n = po(t.size_evidence, "SBA evidence");
	mo(n, [
		"basis",
		"period_start",
		"period_end",
		"affiliates",
		"source_reference"
	], "SBA evidence"), fo([
		"receipts_three_completed_fiscal_year_average",
		"receipts_five_completed_fiscal_year_average",
		"employees_24_month_pay_period_average_ceiling"
	].includes(String(n.basis)) && _o(n.period_start) && _o(n.period_end) && ["included", "none"].includes(String(n.affiliates)) && ho(n.source_reference), "SBA evidence");
	let r = po(t.size_standard_source, "SBA source");
	mo(r, [
		"effective_date",
		"verified_through",
		"url",
		"sha256",
		"row",
		"synthetic_test_only"
	], "SBA source"), fo(_o(r.effective_date) && (r.verified_through === null || _o(r.verified_through)) && (r.url === null || ho(r.url)) && (r.sha256 === null || typeof r.sha256 == "string" && /^[a-f0-9]{64}$/.test(r.sha256)) && (r.row === null || typeof r.row == "number" && Number.isSafeInteger(r.row) && r.row >= 1) && typeof r.synthetic_test_only == "boolean", "SBA source");
	let i = po(t.credit_elsewhere, "SBA credit elsewhere");
	mo(i, [
		"applied",
		"passes",
		"reason",
		"excess_liquid_resources",
		"resource_indicator_below_requested"
	], "SBA credit elsewhere"), fo(typeof i.applied == "boolean" && i.passes === null && ho(i.reason) && (i.excess_liquid_resources === null || Y(i.excess_liquid_resources)) && (i.resource_indicator_below_requested === null || typeof i.resource_indicator_below_requested == "boolean"), "SBA credit elsewhere");
	let a = [
		"lender_credit_elsewhere_determination",
		"industry_selection_and_affiliation_review",
		"alternative_size_standards_and_program_eligibility",
		"approved_lender_credit_policy"
	];
	return fo(Array.isArray(t.unresolved_requirements) && t.unresolved_requirements.length > 0 && t.unresolved_requirements.every((e) => typeof e == "string" && a.includes(e)) && new Set(t.unresolved_requirements).size === t.unresolved_requirements.length, "SBA unresolved requirements"), t;
}
//#endregion
//#region src/DomainWorkflows.tsx
var bo = {
	applicant_name: "Synthetic consumer",
	geography: "60601",
	gross_monthly_income: "8000",
	proposed_housing_pi: "1800",
	proposed_housing_tax_ins: "400",
	other_monthly_debt: "500",
	synthetic_credit_score: 720,
	atr_documentation: {
		income: !0,
		assets: !0,
		debts: !0
	}
}, xo = {
	schema_version: "sba-screen-v2",
	borrower_name: "Synthetic dated SBA screen",
	assessment_as_of: "2026-10-14",
	naics: "541611",
	annual_receipts_millions: "24.5",
	requested_loan: "500000",
	global_dscr: "1.31",
	sop_version: "8.1",
	transaction_type: "expansion",
	owner_liquid_resources: "0",
	retirement_allowance: "0",
	college_allowance: "0",
	medical_allowance: "0",
	size_evidence: {
		basis: "receipts_three_completed_fiscal_year_average",
		period_start: "2023-01-01",
		period_end: "2025-12-31",
		affiliates: "included",
		source_reference: "Synthetic consolidated tax-return review"
	}
}, X = {
	...xo,
	naics: "332710",
	employees: 100,
	size_evidence: {
		basis: "employees_24_month_pay_period_average_ceiling",
		period_start: "2024-10-01",
		period_end: "2026-09-30",
		affiliates: "included",
		source_reference: "Synthetic 24-month payroll-period review"
	}
};
delete X.annual_receipts_millions;
var Z = (e, t, n, r = {}) => ({
	pointer: e,
	label: t,
	kind: n,
	...r
}), So = {
	back_end_dti: "Total DTI · approval rule",
	back_end_dti_review: "Total DTI · review rule",
	atr_documentation: "Ability-to-repay documentation",
	synthetic_credit_score: "Synthetic credit score"
};
function Co(e, t) {
	let [n, r] = (0, c.useState)(null), [i, a] = (0, c.useState)(!1), [o, s] = (0, c.useState)(""), l = (0, c.useRef)(null), u = JSON.stringify(e.values), d = (0, c.useRef)(u);
	d.current = u, (0, c.useEffect)(() => {
		l.current?.abort(), r(null), a(!1), s("");
	}, [u]), (0, c.useEffect)(() => () => l.current?.abort(), []);
	async function f(n, o) {
		if (i) return;
		let c = e.prepare(o);
		if (!c) return;
		if (wt()) {
			s("This testing host does not expose Consumer or SBA routes. Use the standalone workspace connected to the existing API.");
			return;
		}
		let f = new AbortController();
		l.current?.abort(), l.current = f, a(!0), s(""), r(null);
		try {
			let i = await At(n, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(c),
				signal: f.signal
			}), a = await Or(i, "Domain evaluation");
			if (f.signal.aborted || d.current !== u) return;
			if (!i.ok) {
				let t = a && typeof a == "object" && "detail" in a ? a.detail : null;
				throw e.reject(Mt(a, t)), Error(i.status === 422 ? "The server rejected these inputs. Review the highlighted fields; your draft is preserved." : `The evaluation could not be completed (${i.status}). Your draft is preserved.`);
			}
			let o = t(a);
			!f.signal.aborted && d.current === u && r({
				context: u,
				value: o
			});
		} catch (e) {
			f.signal.aborted || s(e instanceof Error ? e.message : "The evaluation could not be completed. Your draft is preserved.");
		} finally {
			l.current === f && a(!1);
		}
	}
	return {
		result: n?.context === u ? n.value : null,
		busy: i,
		error: o,
		send: f
	};
}
function wo({ form: e, pointer: t, label: n, helper: r, options: i, onChange: a }) {
	let o = `choice${t.replace(/\//g, "-")}`, s = e.errors.find((e) => e.pointer === t);
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "formField",
		children: [
			/* @__PURE__ */ (0, V.jsx)("label", {
				htmlFor: o,
				children: n
			}),
			/* @__PURE__ */ (0, V.jsx)("select", {
				id: o,
				"data-pointer": t,
				value: String(Ur(e.values, t)),
				"aria-invalid": s ? "true" : void 0,
				"aria-describedby": `${o}-help`,
				onChange: (r) => a ? a(r.target.value) : e.change(Z(t, n, "text"), r.target.value),
				children: i.map((e) => /* @__PURE__ */ (0, V.jsx)("option", {
					value: e.value,
					children: e.label
				}, e.value))
			}),
			/* @__PURE__ */ (0, V.jsx)("small", {
				id: `${o}-help`,
				children: r
			}),
			s && /* @__PURE__ */ (0, V.jsx)("span", {
				className: "fieldError",
				children: s.message
			})
		]
	});
}
function To() {
	return wt() ? /* @__PURE__ */ (0, V.jsx)("p", {
		className: "analysisNotice",
		children: "The private Streamlit host is synthetic data only. Its existing bridge supports commercial workflows; this screen requires the standalone API connection."
	}) : null;
}
function Eo() {
	let e = Yr({
		...bo,
		applicant_name: "",
		geography: "",
		gross_monthly_income: "",
		proposed_housing_pi: "",
		proposed_housing_tax_ins: "",
		other_monthly_debt: "",
		synthetic_credit_score: "",
		atr_documentation: {
			income: !1,
			assets: !1,
			debts: !1
		}
	}), t = Co(e, vo), [n, r] = (0, c.useState)(""), [i, a] = (0, c.useState)(null), o = (0, c.useRef)(null);
	(0, c.useEffect)(() => a(null), [t.result]);
	let s = [
		Z("/applicant_name", "Applicant name", "text"),
		Z("/geography", "Consumer geography", "text", { placeholder: "60601" }),
		Z("/gross_monthly_income", "Gross monthly income", "money", { min: "0" }),
		Z("/proposed_housing_pi", "Monthly housing principal and interest", "money", { min: "0" }),
		Z("/proposed_housing_tax_ins", "Monthly housing tax and insurance", "money", { min: "0" }),
		Z("/other_monthly_debt", "Other monthly debt", "money", { min: "0" }),
		Z("/synthetic_credit_score", "Synthetic credit score", "integer", {
			min: "300",
			max: "850",
			optional: !0,
			placeholder: "720",
			helper: "Integer 300–850 · optional; synthetic input, no bureau connection"
		})
	], l = t.result?.factors.find((e) => e.name === "back_end_dti");
	function u(t, n) {
		o.current = n, a({
			title: t ? "Housing DTI" : "Total DTI",
			factor: t ? void 0 : l,
			formula: t ? "Housing DTI = (monthly housing principal and interest + monthly housing tax and insurance) / gross monthly income" : "Total DTI = (monthly housing principal and interest + monthly housing tax and insurance + other monthly debt) / gross monthly income",
			supplied: s.filter((e) => e.kind === "money").map((t) => ({
				label: t.label,
				value: String(Ur(e.values, t.pointer))
			})),
			note: t ? "The existing consumer decision endpoint does not return housing DTI or a housing factor. No housing ratio or sum is calculated in the browser." : `Server total DTI: ${l && typeof l.value == "string" ? D(l.value, 4) : "Unavailable"}. The endpoint returns the policy factor, but no additive trace or housing ratio. Inputs shown above are supplied facts; the browser does not reconstruct financial results.`
		});
	}
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "domainWorkspace",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("header", {
				className: "caseHeader",
				children: [/* @__PURE__ */ (0, V.jsx)("h1", { children: "Consumer DTI review" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "Review supplied income, debt and documentation under the server's illustrative policy." })]
			}),
			/* @__PURE__ */ (0, V.jsx)(To, {}),
			/* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, V.jsxs)("label", {
					className: "sampleSelector",
					children: ["Load sample case", /* @__PURE__ */ (0, V.jsxs)("select", {
						"aria-label": "Load sample case",
						value: n,
						onChange: (t) => {
							r(t.target.value), t.target.value && e.replace(bo);
						},
						children: [/* @__PURE__ */ (0, V.jsx)("option", {
							value: "",
							children: "Choose a synthetic preset"
						}), /* @__PURE__ */ (0, V.jsx)("option", {
							value: "consumer",
							children: "Consumer · complete DTI and documentation"
						})]
					})]
				}), /* @__PURE__ */ (0, V.jsxs)("form", {
					ref: e.root,
					className: "guidedForm",
					noValidate: !0,
					onSubmit: (e) => {
						e.preventDefault(), t.send("/consumer/decision", s);
					},
					children: [
						/* @__PURE__ */ (0, V.jsx)(Xr, {
							form: e,
							specs: s
						}),
						/* @__PURE__ */ (0, V.jsx)("div", {
							className: "formGrid",
							children: s.map((t) => /* @__PURE__ */ (0, V.jsx)($r, {
								form: e,
								spec: t
							}, t.pointer))
						}),
						/* @__PURE__ */ (0, V.jsxs)("fieldset", { children: [
							/* @__PURE__ */ (0, V.jsx)("legend", { children: "Ability-to-repay documentation" }),
							[
								"income",
								"assets",
								"debts"
							].map((t) => /* @__PURE__ */ (0, V.jsxs)("label", {
								className: "checkboxField",
								children: [
									/* @__PURE__ */ (0, V.jsx)("input", {
										type: "checkbox",
										"data-pointer": `/atr_documentation/${t}`,
										checked: Ur(e.values, `/atr_documentation/${t}`) === !0,
										onChange: (n) => e.setValues((e) => Wr(e, `/atr_documentation/${t}`, n.target.checked))
									}),
									"Verified ",
									t,
									" evidence"
								]
							}, t)),
							/* @__PURE__ */ (0, V.jsx)("p", {
								className: "fine",
								children: "These are analyst attestations. The application does not independently verify documents."
							})
						] }),
						t.error && /* @__PURE__ */ (0, V.jsx)("p", {
							role: "alert",
							children: t.error
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							className: "primary",
							type: "submit",
							"aria-busy": t.busy,
							children: t.busy ? "Evaluating consumer…" : "Evaluate consumer"
						})
					]
				})]
			}),
			t.result && /* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel",
				role: "region",
				"aria-label": "Consumer result",
				children: [
					/* @__PURE__ */ (0, V.jsxs)("h2", { children: ["Consumer result · ", t.result.outcome.toUpperCase()] }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Policy ",
						t.result.policy_version,
						" · weighted-rule score",
						" ",
						t.result.score,
						". The score is not a probability of default."
					] }),
					/* @__PURE__ */ (0, V.jsxs)("div", {
						className: "domainMetrics",
						children: [/* @__PURE__ */ (0, V.jsxs)("article", { children: [
							/* @__PURE__ */ (0, V.jsx)("h3", { children: "Total DTI" }),
							/* @__PURE__ */ (0, V.jsx)("strong", { children: l && typeof l.value == "string" ? D(l.value, 4) : "Unavailable" }),
							/* @__PURE__ */ (0, V.jsx)("button", {
								type: "button",
								onClick: (e) => u(!1, e.currentTarget),
								children: "Inspect Total DTI"
							})
						] }), /* @__PURE__ */ (0, V.jsxs)("article", { children: [
							/* @__PURE__ */ (0, V.jsx)("h3", { children: "Housing DTI" }),
							/* @__PURE__ */ (0, V.jsx)("p", { children: "Unavailable from this endpoint" }),
							/* @__PURE__ */ (0, V.jsx)("button", {
								type: "button",
								onClick: (e) => u(!0, e.currentTarget),
								children: "Inspect Housing DTI"
							})
						] })]
					}),
					/* @__PURE__ */ (0, V.jsx)("ul", {
						className: "factorList",
						children: t.result.factors.map((e) => /* @__PURE__ */ (0, V.jsx)("li", { children: /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("strong", { children: So[e.name] ?? e.name.replace(/_/g, " ") }), /* @__PURE__ */ (0, V.jsxs)("span", { children: [
							e.passed === null ? "Unavailable" : e.passed ? "Pass" : "Fail",
							" ",
							"·",
							" ",
							typeof e.value == "boolean" ? String(e.value) : e.name.includes("dti") ? D(e.value, 4) : e.value
						] })] }) }, e.name))
					}),
					t.result.reasons.map((e) => /* @__PURE__ */ (0, V.jsx)("p", { children: e.message }, e.code)),
					/* @__PURE__ */ (0, V.jsxs)("p", {
						className: "fine",
						children: [t.result.disclaimer, " DTI boundaries are illustrative policy settings, not a claim about legal lending ceilings."]
					})
				]
			}),
			i && /* @__PURE__ */ (0, V.jsx)(Ea, {
				data: i,
				onClose: () => {
					a(null), o.current?.focus();
				}
			})
		]
	});
}
var Do = {
	lender_credit_elsewhere_determination: "Lender credit elsewhere determination",
	industry_selection_and_affiliation_review: "Industry selection and affiliation review",
	alternative_size_standards_and_program_eligibility: "Alternative size standards and program eligibility",
	approved_lender_credit_policy: "Approved lender credit policy"
};
function Oo() {
	let e = Yr({
		...xo,
		borrower_name: "",
		naics: "",
		annual_receipts_millions: "",
		requested_loan: "",
		global_dscr: "",
		size_evidence: {
			basis: "receipts_three_completed_fiscal_year_average",
			period_start: "",
			period_end: "",
			affiliates: "included",
			source_reference: ""
		}
	}), t = Co(e, yo), [n, r] = (0, c.useState)(""), i = String(Ur(e.values, "/size_evidence/basis")).startsWith("employees"), a = [
		Z("/borrower_name", "SBA borrower name", "text"),
		Z("/assessment_as_of", "SBA assessment as of", "date", { helper: "Pinned source verified through 2026-10-15; later dates are rejected" }),
		Z("/naics", "NAICS code", "text", {
			placeholder: "541611",
			helper: "Six-digit NAICS · ambiguous or unsupported rows require manual review"
		}),
		Z("/requested_loan", "SBA requested loan", "money", { min: "0" }),
		Z("/global_dscr", "Supplied global DSCR", "money", {
			helper: "Exact coverage ratio · supplied evidence; not recomputed by the screen",
			placeholder: "1.31"
		}),
		i ? Z("/employees", "Employee average ceiling", "integer", {
			min: "0",
			placeholder: "100",
			helper: "Integer ceiling of the 24-month pay-period average · no rounding down"
		}) : Z("/annual_receipts_millions", "Average annual receipts", "money", {
			min: "0",
			placeholder: "24.5",
			helper: "USD millions · completed 3- or 5-fiscal-year average, including affiliates"
		}),
		Z("/size_evidence/period_start", "Measurement period start", "date"),
		Z("/size_evidence/period_end", "Measurement period end", "date"),
		Z("/size_evidence/source_reference", "Measurement source reference", "text", {
			placeholder: "Consolidated tax-return review",
			helper: "Required evidence reference · at most 500 characters"
		}),
		...[
			"owner_liquid_resources",
			"retirement_allowance",
			"college_allowance",
			"medical_allowance"
		].map((e) => Z(`/${e}`, e.replace(/_/g, " "), "money", {
			min: "0",
			helper: "USD decimal · supplied evidence only; no legal entitlement is inferred"
		}))
	];
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "domainWorkspace",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("header", {
				className: "caseHeader",
				children: [/* @__PURE__ */ (0, V.jsx)("h1", { children: "SBA eligibility screen" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "Selected size and coverage screens with explicit unresolved lender requirements." })]
			}),
			/* @__PURE__ */ (0, V.jsx)(To, {}),
			/* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel sourceNotice",
				children: [
					/* @__PURE__ */ (0, V.jsx)("h2", { children: "Pinned workbook" }),
					/* @__PURE__ */ (0, V.jsx)("p", { children: "Effective March 17, 2023 · verified through October 15, 2026 · 850 supported unambiguous rows · 128 refused rows with footnotes, industry exceptions, or unsupported measures." }),
					/* @__PURE__ */ (0, V.jsx)("p", {
						className: "fine",
						children: "A passing size screen does not establish complete SBA eligibility. Later source dates and unsupported rows require a separately reviewed source update."
					})
				]
			}),
			/* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, V.jsxs)("label", {
					className: "sampleSelector",
					children: ["Load sample case", /* @__PURE__ */ (0, V.jsxs)("select", {
						"aria-label": "Load sample case",
						value: n,
						onChange: (t) => {
							let n = t.target.value;
							r(n), n && e.replace(n === "sba-employees" ? X : xo);
						},
						children: [
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "",
								children: "Choose a synthetic preset"
							}),
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "sba-receipts",
								children: "SBA · three-year receipts evidence"
							}),
							/* @__PURE__ */ (0, V.jsx)("option", {
								value: "sba-employees",
								children: "SBA · 24-month employee evidence"
							})
						]
					})]
				}), /* @__PURE__ */ (0, V.jsxs)("form", {
					ref: e.root,
					className: "guidedForm",
					noValidate: !0,
					onSubmit: (e) => {
						e.preventDefault(), t.send("/sba/evaluate", a);
					},
					children: [
						/* @__PURE__ */ (0, V.jsx)(Xr, {
							form: e,
							specs: a
						}),
						/* @__PURE__ */ (0, V.jsxs)("div", {
							className: "formGrid",
							children: [
								/* @__PURE__ */ (0, V.jsx)(wo, {
									form: e,
									pointer: "/size_evidence/basis",
									label: "Measurement basis",
									helper: "Completed 3- or 5-fiscal-year receipts average, or latest completed 24-month pay-period employee average ceiling",
									options: [
										{
											value: "receipts_three_completed_fiscal_year_average",
											label: "Receipts · 3 complete fiscal years"
										},
										{
											value: "receipts_five_completed_fiscal_year_average",
											label: "Receipts · 5 complete fiscal years"
										},
										{
											value: "employees_24_month_pay_period_average_ceiling",
											label: "Employees · 24-month average ceiling"
										}
									],
									onChange: (t) => {
										e.setValues((e) => {
											let n = Wr(e, "/size_evidence/basis", t);
											return delete n.employees, delete n.annual_receipts_millions, n[t.startsWith("employees") ? "employees" : "annual_receipts_millions"] = "", n;
										});
									}
								}),
								/* @__PURE__ */ (0, V.jsx)(wo, {
									form: e,
									pointer: "/size_evidence/affiliates",
									label: "Affiliate treatment",
									helper: "Include affiliates in the supplied measure, or attest that there are none",
									options: [{
										value: "included",
										label: "Affiliates included"
									}, {
										value: "none",
										label: "No affiliates"
									}]
								}),
								/* @__PURE__ */ (0, V.jsx)(wo, {
									form: e,
									pointer: "/sop_version",
									label: "SOP version",
									helper: "SOP 8 from June 1, 2025; SOP 8.1 from October 1, 2026 within verified dates",
									options: [{
										value: "8",
										label: "SOP 8"
									}, {
										value: "8.1",
										label: "SOP 8.1"
									}]
								}),
								/* @__PURE__ */ (0, V.jsx)(wo, {
									form: e,
									pointer: "/transaction_type",
									label: "Transaction type",
									helper: "Server-configured transaction coverage floor",
									options: [
										"expansion",
										"acquisition",
										"buyout",
										"esop"
									].map((e) => ({
										value: e,
										label: e
									}))
								}),
								a.map((t) => /* @__PURE__ */ (0, V.jsx)($r, {
									form: e,
									spec: t
								}, t.pointer))
							]
						}),
						/* @__PURE__ */ (0, V.jsx)("p", { children: "Owner-resource arithmetic never establishes credit elsewhere. Allowances require documented lender review." }),
						t.error && /* @__PURE__ */ (0, V.jsx)("p", {
							role: "alert",
							children: t.error
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							className: "primary",
							type: "submit",
							"aria-busy": t.busy,
							children: t.busy ? "Evaluating SBA screen…" : "Evaluate SBA screen"
						})
					]
				})]
			}),
			t.result && /* @__PURE__ */ (0, V.jsxs)("section", {
				className: "panel incompleteEligibility",
				role: "region",
				"aria-label": "SBA result",
				children: [
					/* @__PURE__ */ (0, V.jsx)("h2", { children: "Incomplete Eligibility — Manual Underwriter Review Required" }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Server outcome:",
						" ",
						/* @__PURE__ */ (0, V.jsx)("strong", { children: t.result.outcome === "review_required" ? "Review required" : "Screen failed" }),
						" ",
						"· eligibility_status: incomplete"
					] }),
					/* @__PURE__ */ (0, V.jsxs)("ul", { children: [/* @__PURE__ */ (0, V.jsxs)("li", { children: [
						"Size screen:",
						" ",
						/* @__PURE__ */ (0, V.jsx)("strong", { children: t.result.size_eligible ? "Pass" : "Fail" }),
						" ",
						"· ",
						t.result.size_reason
					] }), /* @__PURE__ */ (0, V.jsxs)("li", { children: [
						"Coverage screen:",
						" ",
						/* @__PURE__ */ (0, V.jsx)("strong", { children: t.result.coverage_pass ? "Pass" : "Fail" }),
						" ",
						"· supplied DSCR ",
						t.result.global_dscr,
						" · configured floor",
						" ",
						t.result.configured_global_dscr_floor
					] })] }),
					/* @__PURE__ */ (0, V.jsx)("h3", { children: "Unresolved eligibility requirements" }),
					/* @__PURE__ */ (0, V.jsx)("ul", { children: t.result.unresolved_requirements.map((e) => /* @__PURE__ */ (0, V.jsx)("li", { children: Do[e] }, e)) }),
					/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Owner-resource arithmetic never establishes credit elsewhere.",
						" ",
						t.result.credit_elsewhere.reason
					] }),
					/* @__PURE__ */ (0, V.jsxs)("dl", {
						className: "reviewFacts",
						children: [
							/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Policy" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: t.result.policy_version })] }),
							/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Source workbook row" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: t.result.size_standard_source.row ?? "Unavailable" })] }),
							/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Source effective / verified through" }), /* @__PURE__ */ (0, V.jsxs)("dd", { children: [
								t.result.size_standard_source.effective_date,
								" /",
								" ",
								t.result.size_standard_source.verified_through ?? "Unavailable"
							] })] }),
							/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Recorded workbook SHA-256" }), /* @__PURE__ */ (0, V.jsx)("dd", { children: t.result.size_standard_source.sha256 ?? "Unavailable" })] })
						]
					}),
					/* @__PURE__ */ (0, V.jsx)("p", {
						className: "fine",
						children: t.result.disclaimer
					})
				]
			})
		]
	});
}
//#endregion
//#region src/views/AnalysisPanels.tsx
function ko() {
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "modelScope",
		"aria-label": "Model scope and policy limitations",
		children: [/* @__PURE__ */ (0, V.jsxs)("p", { children: [
			/* @__PURE__ */ (0, V.jsx)("strong", { children: "Capacity is policy arithmetic, not a credit approval." }),
			" ",
			"Default rules are illustrative and require institutional validation. The weighted-rule score is not a probability of default."
		] }), /* @__PURE__ */ (0, V.jsxs)("details", { children: [
			/* @__PURE__ */ (0, V.jsx)("summary", { children: "Methodology scope" }),
			/* @__PURE__ */ (0, V.jsx)("p", { children: "FCCR and UCA use simplified definitions. LTV, debt yield, IRR, and NPV are not implemented." }),
			/* @__PURE__ */ (0, V.jsx)("p", { children: "The assessment's displayed monthly payment is an indicative rounded amount. Coverage annual proposed service uses 12 unrounded monthly payments. The analysis service's proposed-loan schedule rounds principal, interest and payments to cents, so first-year scheduled payments can differ from coverage service." })
		] })]
	});
}
function Ao({ kind: e }) {
	let { state: t, retry: n } = Ki(), [r, i] = (0, c.useState)(!1), [a, o] = (0, c.useState)(!0), s = e === "schedule" ? "Cent-rounded proposed-loan schedule" : e === "grid" ? "Coverage grid" : "Policy breakevens", l = t.status === "ready" ? t.analysis : null;
	return /* @__PURE__ */ (0, V.jsxs)("details", {
		className: "panel analysisPanel",
		onToggle: (e) => i(e.currentTarget.open),
		children: [/* @__PURE__ */ (0, V.jsx)("summary", { children: s }), r && /* @__PURE__ */ (0, V.jsx)(V.Fragment, { children: l ? e === "schedule" ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsxs)("p", { children: [
			"Server-generated cents ·",
			" ",
			l.amortization.status === "available" ? `${l.amortization.payment_count} payments` : l.amortization.explanation
		] }), l.amortization.status === "available" && /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
			/* @__PURE__ */ (0, V.jsxs)("label", {
				className: "sampleSelector",
				children: ["Schedule granularity", /* @__PURE__ */ (0, V.jsxs)("select", {
					value: a ? "monthly" : "annual",
					onChange: (e) => o(e.target.value === "monthly"),
					children: [/* @__PURE__ */ (0, V.jsx)("option", {
						value: "monthly",
						children: "Monthly · first 360 months"
					}), /* @__PURE__ */ (0, V.jsx)("option", {
						value: "annual",
						children: "Annual · full loan term"
					})]
				})]
			}),
			/* @__PURE__ */ (0, V.jsx)("div", {
				className: "tableScroll scheduleScroll",
				tabIndex: 0,
				role: "region",
				"aria-label": "Scrollable loan schedule",
				children: /* @__PURE__ */ (0, V.jsxs)("table", { children: [
					/* @__PURE__ */ (0, V.jsx)("caption", { children: "Server-calculated loan schedule" }),
					/* @__PURE__ */ (0, V.jsx)("thead", { children: /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, V.jsx)("th", { children: a ? "Month" : "Loan year" }),
						/* @__PURE__ */ (0, V.jsx)("th", {
							className: "num",
							children: "Payments · USD"
						}),
						/* @__PURE__ */ (0, V.jsx)("th", {
							className: "num",
							children: "Interest · USD"
						}),
						/* @__PURE__ */ (0, V.jsx)("th", {
							className: "num",
							children: "Principal · USD"
						}),
						/* @__PURE__ */ (0, V.jsx)("th", {
							className: "num",
							children: "Ending balance · USD"
						})
					] }) }),
					/* @__PURE__ */ (0, V.jsx)("tbody", { children: a ? l.amortization.monthly_rows.map((e) => /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, V.jsx)("th", {
							scope: "row",
							children: e.month
						}),
						/* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: w(e.payment, 2)
						}),
						/* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: w(e.interest, 2)
						}),
						/* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: w(e.principal, 2)
						}),
						/* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: w(e.ending_balance, 2)
						})
					] }, e.month)) : l.amortization.annual_rows.map((e) => /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, V.jsxs)("th", {
							scope: "row",
							children: [
								e.loan_year,
								" · ",
								e.months,
								" months"
							]
						}),
						/* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: w(e.payments, 2)
						}),
						/* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: w(e.interest, 2)
						}),
						/* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: w(e.principal, 2)
						}),
						/* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: w(e.ending_balance, 2)
						})
					] }, e.loan_year)) })
				] })
			}),
			a && l.amortization.monthly_rows_truncated && /* @__PURE__ */ (0, V.jsx)("p", { children: "Monthly detail ends after 360 months. Annual rows cover the full term." }),
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				"Final payment ",
				l.amortization.final_payment,
				" USD · final adjustment",
				" ",
				l.amortization.final_payment_adjustment,
				" USD",
				l.amortization.early_payoff ? " · Early payoff reported by server" : ""
			] }),
			l.amortization.reconciliation && /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "reconciliationNote",
				children: [/* @__PURE__ */ (0, V.jsx)("p", { children: l.amortization.reconciliation.explanation }), /* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Coverage annual service:",
					" ",
					l.amortization.reconciliation.coverage_annual_payment,
					" ",
					"USD",
					/* @__PURE__ */ (0, V.jsx)("br", {}),
					"First loan-year payments:",
					" ",
					l.amortization.reconciliation.first_loan_year_payments,
					" ",
					"USD",
					/* @__PURE__ */ (0, V.jsx)("br", {}),
					"Server reconciliation difference:",
					" ",
					l.amortization.reconciliation.first_loan_year_difference,
					" ",
					"USD"
				] })]
			})
		] })] }) : e === "grid" ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
			/* @__PURE__ */ (0, V.jsx)("p", { children: "Server outcomes under the retained policy · projected latest period · observed history held fixed." }),
			l.sensitivity.status === "not_applicable" ? /* @__PURE__ */ (0, V.jsxs)("p", { children: ["Unavailable · ", l.sensitivity.explanation] }) : /* @__PURE__ */ (0, V.jsx)("div", {
				className: "tableScroll",
				tabIndex: 0,
				role: "region",
				"aria-label": "Scrollable coverage grid",
				children: /* @__PURE__ */ (0, V.jsxs)("table", { children: [
					/* @__PURE__ */ (0, V.jsx)("caption", { children: "Revenue and rate coverage grid" }),
					/* @__PURE__ */ (0, V.jsx)("thead", { children: /* @__PURE__ */ (0, V.jsxs)("tr", { children: [/* @__PURE__ */ (0, V.jsx)("th", { children: "Revenue change" }), l.sensitivity.rate_changes_bps.map((e) => /* @__PURE__ */ (0, V.jsxs)("th", {
						className: "num",
						children: [
							"+",
							e,
							" bps"
						]
					}, e))] }) }),
					/* @__PURE__ */ (0, V.jsx)("tbody", { children: l.sensitivity.revenue_changes.map((e) => /* @__PURE__ */ (0, V.jsxs)("tr", { children: [/* @__PURE__ */ (0, V.jsx)("th", {
						scope: "row",
						children: D(e, 0)
					}), l.sensitivity.rate_changes_bps.map((t) => {
						let n = l.sensitivity.cells.find((n) => n.revenue_change === e && n.proposed_rate_change_bps === t);
						return /* @__PURE__ */ (0, V.jsx)("td", {
							className: "gridCell",
							children: !n || n.status === "not_applicable" ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)("strong", {
								className: "statusBadge",
								children: "Unavailable"
							}), /* @__PURE__ */ (0, V.jsx)("p", { children: n?.explanation ?? "No cell returned" })] }) : /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
								/* @__PURE__ */ (0, V.jsxs)("strong", {
									className: "statusBadge",
									"data-outcome": n.outcome,
									children: [
										n.outcome === "approve" ? "Pass" : n.outcome === "decline" ? "Fail" : "Review",
										" ",
										"· ",
										n.outcome?.toUpperCase()
									]
								}),
								/* @__PURE__ */ (0, V.jsxs)("span", { children: ["DSCR ", nr(n.dscr)] }),
								/* @__PURE__ */ (0, V.jsxs)("span", { children: ["FCCR ", nr(n.fccr)] }),
								/* @__PURE__ */ (0, V.jsxs)("span", { children: ["Global ", nr(n.global_dscr)] })
							] })
						}, t);
					})] }, e)) })
				] })
			}),
			/* @__PURE__ */ (0, V.jsx)("ul", { children: l.sensitivity.held_fixed_assumptions.map((e, t) => /* @__PURE__ */ (0, V.jsx)("li", { children: e }, t)) })
		] }) : /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)("p", { children: "Each threshold and cushion is calculated by the server. Negative cushions indicate an existing breach." }), /* @__PURE__ */ (0, V.jsx)("div", {
			className: "tableScroll",
			children: /* @__PURE__ */ (0, V.jsxs)("table", { children: [
				/* @__PURE__ */ (0, V.jsx)("caption", { children: "Server-calculated policy breakevens" }),
				/* @__PURE__ */ (0, V.jsx)("thead", { children: /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, V.jsx)("th", { children: "Constraint" }),
					/* @__PURE__ */ (0, V.jsx)("th", { children: "Threshold type" }),
					/* @__PURE__ */ (0, V.jsx)("th", {
						className: "num",
						children: "Threshold"
					}),
					/* @__PURE__ */ (0, V.jsx)("th", {
						className: "num",
						children: "EBITDA breakeven"
					}),
					/* @__PURE__ */ (0, V.jsx)("th", {
						className: "num",
						children: "Revenue cushion"
					})
				] }) }),
				/* @__PURE__ */ (0, V.jsx)("tbody", { children: l.breakevens.rows.map((e) => /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, V.jsx)("th", {
						scope: "row",
						children: e.constraint.toUpperCase()
					}),
					/* @__PURE__ */ (0, V.jsx)("td", { children: e.threshold_kind.replace(/_/g, " ") }),
					/* @__PURE__ */ (0, V.jsx)("td", {
						className: "num",
						children: e.threshold
					}),
					/* @__PURE__ */ (0, V.jsx)("td", {
						className: "num",
						children: nr(e.ebitda_breakeven)
					}),
					/* @__PURE__ */ (0, V.jsx)("td", {
						className: "num",
						children: e.revenue_cushion.status === "available" && e.revenue_cushion.raw_value !== null ? D(e.revenue_cushion.raw_value, 2) : "Unavailable"
					})
				] }, `${e.constraint}:${e.threshold_kind}`)) })
			] })
		})] }) : /* @__PURE__ */ (0, V.jsxs)("div", {
			role: "status",
			children: [/* @__PURE__ */ (0, V.jsx)("p", { children: t.status === "error" ? t.message : t.status === "none" ? "A current dated assessment is required." : "Preparing server analysis…" }), t.status === "error" && /* @__PURE__ */ (0, V.jsx)("button", {
				type: "button",
				onClick: n,
				children: "Retry analysis"
			})]
		}) })]
	});
}
//#endregion
//#region src/RejectedInputFields.tsx
function jo({ draft: e, errors: t, savedField: n, rationale: r, onEvaluate: i, onReviewSaved: a }) {
	let o = Yr({
		...Vr(e.payload),
		...n ? { rationale: r ?? "" } : {}
	}), [s, l] = (0, c.useState)(""), u = t.map((e) => ({
		...e,
		pointer: e.pointer.startsWith("/input/") ? e.pointer.slice(6) : e.pointer
	}));
	(0, c.useEffect)(() => {
		o.reject(u);
	}, [t]);
	let d = [.../* @__PURE__ */ new Set([
		...u.map((e) => e.pointer),
		...typeof Ur(o.values, "/proposed_loan/term_months") == "string" ? ["/proposed_loan/term_months"] : [],
		...n ? [n, "/rationale"] : []
	])].flatMap((t) => {
		if (!t || Hr(t).some((e) => [
			"__proto__",
			"constructor",
			"prototype"
		].includes(e))) return [];
		try {
			let n = nt(e.payload, e.mode, t);
			return n.path === t ? [{
				pointer: t,
				label: et(t),
				kind: n.integer ? "integer" : n.unit === "%" ? "rate" : "money",
				min: n.min === void 0 ? void 0 : String(n.min),
				max: n.max === void 0 ? void 0 : String(n.max)
			}] : [];
		} catch {
			return /^\/(assessment_as_of|borrower_name|geography|rationale)$/.test(t) || /^\/(years\/(?:0|[1-9]\d*)|working_capital)\/period_(start|end)$/.test(t) ? [{
				pointer: t,
				label: et(t),
				kind: /period_(start|end)$|assessment_as_of$/.test(t) ? "date" : "text"
			}] : [];
		}
	});
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel rejectedInputFields",
		"aria-label": "Correct rejected inputs",
		children: [
			/* @__PURE__ */ (0, V.jsx)("h2", { children: "Review rejected inputs" }),
			/* @__PURE__ */ (0, V.jsx)("p", { children: "Your complete draft is preserved. A saved edit requires review against the latest stored revision before a fresh operation can be sent." }),
			/* @__PURE__ */ (0, V.jsxs)("form", {
				ref: o.root,
				className: "guidedForm",
				noValidate: !0,
				onSubmit: (t) => {
					t.preventDefault();
					let r = o.prepare(d);
					if (r && d.length) {
						if (n && a) {
							let e = Ur(r, n);
							if (typeof e != "string" && typeof e != "number") return;
							let i = t.currentTarget.querySelector("button[type=submit]");
							i && a(e, String(r.rationale), i).catch((e) => l(e instanceof Error ? e.message : "The latest revision could not be reviewed. Your correction is preserved."));
						} else {
							let t = e.edit ? {
								...e.edit,
								next: Ur(r, e.edit.path)
							} : void 0;
							i({
								...e,
								payload: r,
								rawJson: void 0,
								edit: t
							});
						}
					}
				},
				children: [
					/* @__PURE__ */ (0, V.jsx)(Xr, {
						form: o,
						specs: d
					}),
					/* @__PURE__ */ (0, V.jsx)("div", {
						className: "formGrid",
						children: d.map((e) => /* @__PURE__ */ (0, V.jsx)($r, {
							form: o,
							spec: e
						}, e.pointer))
					}),
					d.length ? /* @__PURE__ */ (0, V.jsx)("button", {
						type: "submit",
						className: "primary",
						children: n ? "Review corrected revision" : "Evaluate corrected draft"
					}) : /* @__PURE__ */ (0, V.jsx)("p", { children: "These errors require a corrected complete case file. The original rejection and field locations remain above." }),
					s && /* @__PURE__ */ (0, V.jsx)("p", {
						role: "alert",
						children: s
					})
				]
			})
		]
	});
}
//#endregion
//#region src/App.tsx
function Mo({ onDisconnect: e }) {
	let t = ao(), n = Br(t), { state: r, submit: i, demo: a, upload: o } = t, [s, l] = (0, c.useState)("spread"), [u, d] = (0, c.useState)("commercial"), [m, h] = (0, c.useState)(!1), [g, _] = (0, c.useState)("dated"), [v, y] = (0, c.useState)(1), [b, x] = (0, c.useState)(!1), [S, C] = (0, c.useState)(!1), [ee, w] = (0, c.useState)(!1), te = (0, c.useRef)(null), ne = (0, c.useRef)(null), T = p(te, t.edit), E = f(r, !!t.operation), { ready: D, accepted: O, input: k, assessment: re, decision: A } = E, ie = k ? Math.min(v, k.years.length - 1) : 0, j = r.status === "idle";
	(0, c.useEffect)(() => {
		r.status === "evaluating" && (T.dismiss(), x(!1)), r.status === "ready" && r.resetPeriod && r.accepted && y(r.accepted.input.years.length - 1), r.status === "ready" && r.saved?.view.compatibility && l("audit");
	}, [
		r.id,
		r.status,
		r.accepted,
		r.resetPeriod
	]);
	let ae = () => {
		d("commercial"), h(!1), ne.current?.click();
	}, oe = (e) => void t.openSaved(e), M = t.rejected, se = M ? JSON.parse(M.body) : null, ce = r.status === "unavailable" ? r.draft ?? (r.action === "write" ? M?.kind === "create" && se?.input ? {
		mode: "dated",
		payload: se.input,
		filename: "Rejected saved creation",
		resetHistory: !0
	} : M?.kind === "edit" && O && r.saved?.view.snapshot.case_id === M.caseId && se?.new_value !== void 0 ? {
		mode: O.mode,
		payload: Vn(O.input, {
			path: M.review.path,
			prior: M.review.value,
			next: se.new_value,
			rationale: se.rationale,
			at: "unverified proposal"
		}),
		filename: "Rejected saved edit"
	} : null : null) : null, le = r.draft ? t.fieldErrors : t.writeError?.fieldErrors ?? [];
	return /* @__PURE__ */ (0, V.jsx)(Gi, {
		subject: E.analysisSubject,
		paused: t.inFlight,
		children: /* @__PURE__ */ (0, V.jsxs)("main", {
			className: "analystWorkspace",
			children: [
				/* @__PURE__ */ (0, V.jsxs)(ta, { children: [!j && u === "commercial" && !m && /* @__PURE__ */ (0, V.jsx)(na, {
					showCases: S,
					canSave: t.canSave,
					onToggleCases: () => C((e) => !e),
					onSave: (e) => {
						te.current = e, x(!0);
					}
				}), /* @__PURE__ */ (0, V.jsx)(ra, {
					onExample: (e) => {
						d("commercial"), h(!1), a(e);
					},
					onImport: ae,
					onDisconnect: e
				})] }),
				/* @__PURE__ */ (0, V.jsx)(so, { actor: r.saved?.view.snapshot.event.actor }),
				/* @__PURE__ */ (0, V.jsxs)("nav", {
					className: "primaryNavigation",
					"aria-label": "Underwriting workflows",
					children: [
						/* @__PURE__ */ (0, V.jsx)("button", {
							type: "button",
							"aria-current": u === "commercial" && g === "dated" ? "page" : void 0,
							onClick: () => {
								d("commercial"), _("dated"), h(!0), C(!1);
							},
							children: "Commercial Assessment"
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							type: "button",
							"aria-current": u === "commercial" && g === "legacy" ? "page" : void 0,
							onClick: () => {
								d("commercial"), _("legacy"), h(!0), C(!1);
							},
							children: "Commercial Decision"
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							type: "button",
							"aria-current": u === "consumer" ? "page" : void 0,
							onClick: () => {
								d("consumer"), C(!1);
							},
							children: "Consumer Decision"
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							type: "button",
							"aria-current": u === "sba" ? "page" : void 0,
							onClick: () => {
								d("sba"), C(!1);
							},
							children: "SBA Screen"
						}),
						/* @__PURE__ */ (0, V.jsx)("button", {
							type: "button",
							"aria-expanded": S,
							onClick: () => {
								d("commercial"), h(!1), C(!0);
							},
							children: "Saved Cases"
						})
					]
				}),
				u === "consumer" ? /* @__PURE__ */ (0, V.jsx)(Eo, {}) : u === "sba" ? /* @__PURE__ */ (0, V.jsx)(Oo, {}) : m ? /* @__PURE__ */ (0, V.jsx)(uo, {
					mode: g,
					initial: O?.mode === g ? O.input : void 0,
					serverErrors: t.fieldErrors,
					serverMessage: r.status === "unavailable" ? r.error : "",
					busy: r.status === "evaluating",
					onClose: () => h(!1),
					onEvaluate: async (e) => {
						let t = await i(e);
						return t && (h(!1), l("spread")), t;
					}
				}, g) : j ? /* @__PURE__ */ (0, V.jsx)(aa, {
					showCases: S,
					onExample: () => a("dated"),
					onToggleCases: () => C((e) => !e),
					onImport: ae
				}) : /* @__PURE__ */ (0, V.jsx)(ia, {
					view: E,
					filename: r.filename,
					legacy: O?.mode === "legacy"
				}),
				/* @__PURE__ */ (0, V.jsx)(oa, {}),
				S && u === "commercial" && /* @__PURE__ */ (0, V.jsx)(yr, {
					onOpen: (e) => {
						C(!1), oe(e);
					},
					onClose: () => {
						C(!1), qn("[data-focus-fallback]")?.focus();
					}
				}),
				/* @__PURE__ */ (0, V.jsx)(wr, {
					workspace: t,
					onOpenComparison: (e) => {
						let n = e.record;
						Lr(n.case_id, n.comparison_id), t.openSaved({
							caseId: n.case_id,
							revision: n.baseline_revision
						}).then(() => l("stress")), t.dismissComparisonAck();
					},
					onDiscard: (e) => {
						te.current = e, w(!0);
					},
					onReview: (e) => {
						let n = t.reviewConflict();
						n && T.review(n.field, n.proposal, e);
					}
				}),
				!m && ce && le.length > 0 && /* @__PURE__ */ (0, V.jsx)(jo, {
					draft: ce,
					errors: le,
					savedField: M?.kind === "edit" ? M.review.path : void 0,
					rationale: se?.rationale,
					onEvaluate: (e) => void i(e),
					onReviewSaved: async (e, n, r) => {
						let i = await t.reviewRejected(e, n);
						i && T.review(i.field, i.proposal, r);
					}
				}, `${r.id}:${M?.id ?? "draft"}`),
				u === "commercial" && !m && !j && /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
					O && /* @__PURE__ */ (0, V.jsx)("button", {
						type: "button",
						className: "editCompleteDraft",
						onClick: () => {
							_(O.mode), h(!0);
						},
						children: "Edit complete draft"
					}),
					r.saved && /* @__PURE__ */ (0, V.jsx)(br, {
						saved: r.saved,
						active: D,
						onOpen: oe
					}),
					/* @__PURE__ */ (0, V.jsx)(ya, {
						state: r,
						view: E,
						onSubmit: (e) => void i(e),
						onOpen: oe
					}),
					/* @__PURE__ */ (0, V.jsx)(ca, { view: E }),
					re && /* @__PURE__ */ (0, V.jsx)(va, { assessment: re }),
					re && /* @__PURE__ */ (0, V.jsx)(J, { assessment: re }),
					re && /* @__PURE__ */ (0, V.jsx)(ko, {}),
					D && r.saved?.view.compatibility && /* @__PURE__ */ (0, V.jsx)(ba, { view: r.saved.view }),
					/* @__PURE__ */ (0, V.jsxs)(qi, {
						label: "Workspace views",
						tabs: xa,
						selected: s,
						onSelect: l,
						children: [
							s === "spread" && /* @__PURE__ */ (0, V.jsx)(Da, {
								ready: D,
								canEdit: t.canEdit,
								input: k,
								legacy: O?.mode === "legacy",
								assessment: re,
								decision: A,
								index: ie,
								onSelectPeriod: y,
								onEdit: T.open
							}),
							s === "overview" && /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)(Ha, { view: E }), /* @__PURE__ */ (0, V.jsx)(Ao, { kind: "breakevens" })] }),
							s === "debt" && /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)(Wa, {
								ready: D,
								accepted: O,
								canEdit: t.canEdit,
								onEdit: T.open
							}), /* @__PURE__ */ (0, V.jsx)(Ao, { kind: "schedule" })] }),
							s === "global" && /* @__PURE__ */ (0, V.jsx)(Ga, {
								ready: D,
								accepted: O,
								canEdit: t.canEdit,
								onEdit: T.open
							}),
							s === "stress" && /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)(Ao, { kind: "grid" }), /* @__PURE__ */ (0, V.jsx)(ui, {
								model: n,
								onSaveBaseline: (e) => {
									t.canSave && (te.current = e, x(!0));
								},
								onOpenBaseline: oe
							})] }),
							s === "memo" && /* @__PURE__ */ (0, V.jsx)(Ja, { decision: A }),
							s === "audit" && /* @__PURE__ */ (0, V.jsxs)("div", {
								className: "historyAudit",
								children: [
									/* @__PURE__ */ (0, V.jsx)(Ya, {
										saved: r.saved,
										ready: D,
										history: r.history,
										input: k,
										onOpen: oe
									}),
									/* @__PURE__ */ (0, V.jsx)(Ka, {
										ready: D,
										input: k,
										assessment: re,
										decision: A,
										index: ie
									}),
									/* @__PURE__ */ (0, V.jsx)(yi, {
										view: D ? r.saved?.view ?? null : null,
										selection: r.saved?.selection ?? null,
										headRevision: r.saved?.headRevision ?? null,
										sourceScope: `${r.id}:${r.status}`,
										original: n.original,
										pending: !!(t.operation || t.recoveryError || t.conflict || t.inFlight),
										onOpenBaseline: oe
									})
								]
							})
						]
					})
				] }),
				/* @__PURE__ */ (0, V.jsx)("input", {
					ref: ne,
					type: "file",
					accept: ".json,application/json",
					hidden: !0,
					onChange: (e) => {
						o(e.target.files?.[0]), e.target.value = "";
					}
				}),
				T.editing && /* @__PURE__ */ (0, V.jsx)(er, {
					restoreFocus: te.current,
					field: T.editing,
					saved: !!r.saved,
					proposal: T.proposal,
					onCancel: T.cancel,
					onSubmit: T.submit
				}, `${T.editing.path}:${r.id}`),
				b && O?.mode === "dated" && /* @__PURE__ */ (0, V.jsx)(Qn, {
					input: O.input,
					restoreFocus: te.current,
					onSave: t.save,
					onCancel: () => x(!1)
				}),
				ee && /* @__PURE__ */ (0, V.jsx)($n, {
					restoreFocus: te.current,
					onDiscard: t.discardTracking,
					onCancel: () => w(!1)
				}),
				/* @__PURE__ */ (0, V.jsxs)("footer", { children: [
					"Spreadline · Synthetic analyst demonstration ·",
					" ",
					r.saved ? `Saved revisions · recorded credential ${r.saved.view.snapshot.event.actor}` : "Unsaved session workspace"
				] })
			]
		})
	});
}
//#endregion
//#region src/embeddedTransport.ts
var No = 16777216, Po = class {
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
					if (!Number.isInteger(n.status) || n.status < 200 || n.status > 599 || typeof n.body != "string" || new TextEncoder().encode(n.body).length > No || !n.headers || typeof n.headers != "object" || Object.values(n.headers).some((e) => typeof e != "string")) throw Error("Unreadable embedded response. Review any pending write before retrying.");
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
}, Fo = ":root,.themeRoot{--fs-12:12px;--fs-13:14px;--fs-14:14px;--fs-16:16px;--fs-20:20px;--fs-24:24px;--fs-28:28px;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:20px;--space-6:24px;--space-7:28px;--space-8:32px;--radius-sm:4px;--radius:8px;--radius-lg:12px;--font-sans:Inter, ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;--font-mono:ui-monospace, \"SF Mono\", Menlo, Consolas, monospace;--lightningcss-light:initial;--lightningcss-dark: ;--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;--canvas:#f3f6f4;--surface:#fff;--raised:#fff;--sunken:#eef3f0;--band:#f3f8f5;--text:#14201b;--muted:#4d5b54;--subtle:#56645d;--border:#d3dcd7;--rule:#e1e8e4;--rule-strong:#9fb0a7;--border-strong:#7b8b83;--control:#fff;--control-hover:#eaf1ed;--control-border:#b4c1ba;--control-text:#14201b;--input-bg:#fff;--input-border:#7b8b83;--disabled-bg:#eef2f0;--disabled-text:#5f6c66;--disabled-border:#d3dcd7;--edit-underline:#8a9c93;--accent:#0d6845;--accent-hover:#0a5538;--on-accent:#fff;--accent-soft:#e5f2ea;--accent-border:#93c4aa;--on-accent-soft:#0d6845;--positive:#0d6845;--positive-soft:#e5f2ea;--positive-border:#93c4aa;--positive-muted:#3b5f4f;--caution:#7f5300;--caution-soft:#fbf1da;--caution-border:#d9b86d;--caution-muted:#6a5326;--negative:#a3301c;--negative-soft:#fbebe6;--negative-border:#df9f90;--negative-muted:#7c4136;--info:#2c5683;--info-soft:#e9f0f7;--info-border:#a7bfd9;--info-muted:#3f5671;--focus:#0d6845;--selection:#cbe6d6;--derived:#eef3f0;--derived-label:#3b5f4f;--ebitda-bg:#e5f2ea;--ebitda-text:#0d6845;--shadow-dialog:0 16px 40px #14201b2e, 0 2px 6px #14201b14;--backdrop:#14201b73}@media screen{:root[data-theme=dark],.themeRoot[data-theme=dark]{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--canvas:#0b0d10;--surface:#101419;--raised:#151b22;--sunken:#12191c;--band:#131a20;--text:#eef1f4;--muted:#b5bfc9;--subtle:#a5b2bd;--border:#303b46;--rule:#29333d;--rule-strong:#4a5a68;--border-strong:#556f82;--control:#18212a;--control-hover:#22313c;--control-border:#40515f;--control-text:#d4dee7;--input-bg:#18212a;--input-border:#556f82;--disabled-bg:#141a20;--disabled-text:#8c98a3;--disabled-border:#29333d;--edit-underline:#586c7c;--accent:#8de0bb;--accent-hover:#a2e8c9;--on-accent:#10291f;--accent-soft:#13241c;--accent-border:#437c63;--on-accent-soft:#c6d8cf;--positive:#8de0bb;--positive-soft:#111d18;--positive-border:#375447;--positive-muted:#a9c4b6;--caution:#e0d5a1;--caution-soft:#1d1b12;--caution-border:#6e6339;--caution-muted:#c9c1a0;--negative:#ffb5a7;--negative-soft:#211716;--negative-border:#69473e;--negative-muted:#d6b2aa;--info:#b5c9df;--info-soft:#15202a;--info-border:#4a6074;--info-muted:#aebccb;--focus:#8de0bb;--selection:#2b5543;--derived:#12191c;--derived-label:#98bdaa;--ebitda-bg:#14221b;--ebitda-text:#bce8d2;--shadow-dialog:0 16px 40px #00000080;--backdrop:#000000b8}}*{box-sizing:border-box}body{background:var(--canvas);color:var(--text);margin:0}.themeRoot{font-family:var(--font-sans);font-synthesis:none;font-variant-numeric:tabular-nums;color:var(--text);background:var(--canvas);accent-color:var(--accent);caret-color:var(--accent);scrollbar-color:var(--border-strong) transparent}.themeRoot ::selection{background:var(--selection);color:var(--text)}main{max-width:1280px;padding:var(--space-7);margin:auto}h1{font-size:var(--fs-28);margin:var(--space-1) 0 var(--space-2);letter-spacing:-.025em;overflow-wrap:anywhere}h2{margin:0 0 var(--space-3);font-size:var(--fs-16)}h3{font-size:var(--fs-14);color:var(--accent);margin-top:var(--space-6)}h4{font-size:var(--fs-14)}p{color:var(--muted);line-height:1.6}small{font-size:var(--fs-12)}a{color:var(--accent);text-underline-offset:3px}code{font-family:var(--font-mono);overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}.eyebrow{font-size:var(--fs-12);letter-spacing:.1em;color:var(--accent);font-weight:500}.fine{border-top:1px solid var(--border);margin-top:var(--space-6);padding-top:var(--space-4);font-size:var(--fs-12);overflow-wrap:anywhere}.accessGate{max-width:620px;padding-top:12vh}.accessGate form{gap:var(--space-3);display:grid}.hostingNotice{justify-content:space-between;gap:var(--space-2) var(--space-6);max-width:1280px;padding:var(--space-3) var(--space-7);color:var(--on-accent-soft);background:var(--accent-soft);border-bottom:1px solid var(--accent-border);font-size:var(--fs-12);flex-wrap:wrap;margin:auto;line-height:1.6;display:flex}.hostingNotice>span:first-child{letter-spacing:.08em;font-weight:600}.workspaceBrand{align-items:center;gap:var(--space-3) var(--space-5);padding-bottom:var(--space-4);margin-bottom:var(--space-6);border-bottom:1px solid var(--border);flex-wrap:wrap;display:flex}.wordmark{align-items:center;gap:var(--space-2);font-size:var(--fs-20);letter-spacing:-.03em;font-weight:600;display:flex}.wordmark svg{color:var(--accent);flex-shrink:0}.workspaceType{align-items:center;gap:var(--space-3);color:var(--muted);font-size:var(--fs-13);display:flex}.workspaceType>span{border:1px solid var(--border);border-radius:var(--radius-sm);padding:0 var(--space-2);font-size:var(--fs-12);letter-spacing:.04em}.brandActions{align-items:center;gap:var(--space-2);flex-wrap:wrap;margin-left:auto;display:flex}.caseHeader{margin-bottom:var(--space-4)}.caseHeader h1{margin:0 0 var(--space-2)}.caseMeta{align-items:center;gap:var(--space-2) var(--space-3);font-size:var(--fs-13);color:var(--muted);flex-wrap:wrap;display:flex}.modeBadge,.statusChip{min-height:24px;padding:0 var(--space-2);border-radius:var(--radius-sm);font-size:var(--fs-12);white-space:nowrap;align-items:center;font-weight:600;display:inline-flex}.modeBadge{color:var(--on-accent-soft);background:var(--accent-soft);border:1px solid var(--accent-border)}.statusChip{color:var(--caution);background:var(--caution-soft);border:1px solid var(--caution-border)}.statusChip[data-saved=true]{color:var(--info);background:var(--info-soft);border-color:var(--info-border)}.pendingNote{color:var(--info);font-weight:600}.caseSource{color:var(--subtle);font-size:var(--fs-12);overflow-wrap:anywhere;min-width:0}.legacyNote{margin:var(--space-2) 0 0;font-size:var(--fs-12)}.startScreen{padding:var(--space-4) 0 var(--space-2);margin-bottom:var(--space-6)}.startScreen h1{margin:0 0 var(--space-2)}.startLead{max-width:68ch;margin:0 0 var(--space-6)}.startOptions{gap:var(--space-4);grid-template-columns:repeat(3,minmax(0,1fr));display:grid}.startOption{align-items:flex-start;gap:var(--space-2);min-height:132px;padding:var(--space-5);text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);flex-direction:column;display:flex}@media (hover:hover){.startOption:hover{background:var(--surface);border-color:var(--accent)}}.startOption[aria-expanded=true]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}.startOptionTitle{font-size:var(--fs-16);color:var(--text);font-weight:600}.startOptionDetail{font-size:var(--fs-13);color:var(--muted);line-height:1.6}.disclosureMenu{position:relative}.menuToggle{align-items:center;gap:var(--space-2);display:inline-flex}.menuToggle svg{transition:transform .12s ease-out}.menuToggle[aria-expanded=true] svg{transform:rotate(180deg)}.moreMenu{right:0;top:calc(100% + var(--space-1));z-index:20;width:244px;max-width:calc(100vw - 32px);padding:var(--space-1) 0;background:var(--raised);border:1px solid var(--border-strong);border-radius:var(--radius);box-shadow:var(--shadow-dialog);position:absolute}.menuGroup{padding:var(--space-1) 0;display:grid}.menuGroup+.menuGroup{border-top:1px solid var(--rule)}.moreMenu button{text-align:left;width:100%;padding:var(--space-2) var(--space-4);font-size:var(--fs-13);background:0 0;border:0;border-radius:0}@media (hover:hover){.moreMenu button:hover{background:var(--control-hover)}}.moreMenu button:focus-visible{outline-offset:-2px}.workspaceTabs{gap:var(--space-6);margin:var(--space-6) 0 var(--space-5);border-bottom:1px solid var(--border);scrollbar-width:thin;display:flex;overflow-x:auto}.workspaceTabs [role=tab]{padding:var(--space-3) 0;color:var(--muted);font-size:var(--fs-14);white-space:nowrap;background:0 0;border:0;border-bottom:2px solid #0000;border-radius:0;flex:none}@media (hover:hover){.workspaceTabs [role=tab]:hover{color:var(--text);background:0 0}}.workspaceTabs [role=tab][aria-selected=true]{color:var(--accent);border-bottom-color:var(--accent);font-weight:600}.workspaceTabs [role=tab]:focus-visible{outline-offset:-2px}.tabPanel:focus-visible{outline:2px solid var(--focus);outline-offset:4px;border-radius:var(--radius-sm)}.context{gap:var(--space-2) var(--space-6);font-size:var(--fs-12);color:var(--muted);margin-top:var(--space-4);flex-wrap:wrap;display:flex}.context>span{flex:240px;line-height:1.7}footer{padding-top:var(--space-6);color:var(--subtle);font-size:var(--fs-12)}.actions{gap:var(--space-2);flex-wrap:wrap;display:flex}button{font:inherit;background:var(--control);border:1px solid var(--control-border);color:var(--control-text);padding:var(--space-2) var(--space-4);border-radius:var(--radius);cursor:pointer;transition:opacity .12s ease-out}@media (hover:hover){button:hover{background:var(--control-hover)}}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible{outline:2px solid var(--focus);outline-offset:3px}button:disabled{background:var(--disabled-bg);border-color:var(--disabled-border);color:var(--disabled-text);cursor:not-allowed}.primary{background:var(--accent);color:var(--on-accent);border-color:var(--accent);font-weight:600}@media (hover:hover){.primary:hover{color:var(--on-accent);background:var(--accent-hover);border-color:var(--accent-hover)}}.primary:disabled{color:var(--disabled-text);background:var(--disabled-bg);border-color:var(--disabled-border)}.active{color:var(--accent);border-color:var(--accent)}.themeToggle{align-items:center;gap:var(--space-2);display:flex}.themeToggle:before{content:\"\";border:2px solid;border-radius:50%;width:10px;height:10px}.themeToggle[aria-pressed=true]{color:var(--accent)}.linkButton{color:var(--accent);font-size:inherit;text-underline-offset:3px;background:0 0;border:0;padding:0;text-decoration:underline;display:inline}@media (hover:hover){.linkButton:hover{color:var(--accent-hover);background:0 0}}.themeToggle[aria-pressed=true]:before{background:currentColor}.accessGate input,dialog input,dialog textarea,.scenarioFields input,.scenarioFields textarea,.scenarioFields select,.scenarioSelect select{width:100%;min-width:0;padding:var(--space-2) var(--space-3);color:var(--text);background:var(--input-bg);border:1px solid var(--input-border);border-radius:var(--radius);font:inherit;display:block}.accessGate input{padding:var(--space-3)}.warning{margin:var(--space-5) 0 var(--space-4);padding:var(--space-3) var(--space-4);border:1px solid var(--caution-border);background:var(--caution-soft);color:var(--caution);border-radius:var(--radius);font-size:var(--fs-13);overflow-wrap:anywhere}.environmentWarning{align-items:baseline;gap:var(--space-1) var(--space-3);margin:0 0 var(--space-4);padding:var(--space-2) var(--space-4);background:var(--sunken);border-color:var(--border);flex-wrap:wrap;display:flex}.environmentWarning .noticeDetail{flex-basis:100%}.environmentWarning>span{font-size:var(--fs-12);color:var(--caution);white-space:nowrap;font-weight:600}.environmentWarning p{color:var(--muted);font-size:var(--fs-12);margin:0;line-height:1.7}.pending{padding:var(--space-4);border:1px solid var(--info-border);border-radius:var(--radius);margin:var(--space-4) 0;background:var(--info-soft);overflow-wrap:anywhere}.pending p{font-size:var(--fs-13);color:var(--info-muted);margin-bottom:0}.writeNotice{border:1px solid var(--accent-border);border-radius:var(--radius);background:var(--accent-soft);color:var(--text);padding:var(--space-2) var(--space-3);font-size:var(--fs-13);overflow-wrap:anywhere}.compatibility{margin:var(--space-4) 0}.decision{align-items:stretch;gap:var(--space-2) var(--space-6);margin:var(--space-4) 0 0;padding:var(--space-4) var(--space-5);border:1px solid var(--positive-border);border-radius:var(--radius);background:var(--positive-soft);overflow-wrap:anywhere;border-left-width:6px;display:flex}.decisionStatus{flex:none;min-width:168px}.decision span,.decision small{color:var(--positive-muted);display:block}.decisionStatus span{font-size:var(--fs-12);margin-bottom:var(--space-1)}.decision strong{font-size:var(--fs-28);letter-spacing:.02em;color:var(--positive);font-weight:600;line-height:1.1;display:block}.decisionReason{flex:1;align-self:center;min-width:0}.decisionReason p{font-size:var(--fs-16);color:var(--text);max-width:70ch;margin:0;line-height:1.5}.decision small{font-size:var(--fs-12);margin-top:var(--space-1);line-height:1.6}.decision .previousResult{font-weight:600}.decision[data-outcome=review]{background:var(--caution-soft);border-color:var(--caution-border)}.decision[data-outcome=review] strong{color:var(--caution)}.decision[data-outcome=review] span,.decision[data-outcome=review] small{color:var(--caution-muted)}.decision[data-outcome=decline]{background:var(--negative-soft);border-color:var(--negative-border)}.decision[data-outcome=decline] strong{color:var(--negative)}.decision[data-outcome=decline] span,.decision[data-outcome=decline] small{color:var(--negative-muted)}.decision[data-outcome=unavailable]{background:var(--info-soft);border-color:var(--info-border)}.decision[data-outcome=unavailable] strong{color:var(--info)}.decision[data-outcome=unavailable] span,.decision[data-outcome=unavailable] small{color:var(--info-muted)}.kpiTiles{margin-top:var(--space-4);border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);grid-template-columns:repeat(6,minmax(0,1fr));display:grid;overflow:hidden}.kpiTile{gap:var(--space-1);min-width:0;padding:var(--space-4);border-left:1px solid var(--border);flex-direction:column;display:flex}.kpiTile:first-child{border-left:0}.kpiLabel{font-size:var(--fs-13);color:var(--muted)}.kpiTile strong{font-size:var(--fs-24);letter-spacing:-.02em;overflow-wrap:anywhere;font-weight:600}.kpiStatus{align-items:flex-start;gap:var(--space-2);font-size:var(--fs-12);color:var(--muted);font-weight:600;display:flex}.kpiStatus:before{content:\"\";background:var(--subtle);border-radius:50%;flex:none;width:8px;height:8px;margin-top:.4em}.kpiTile[data-state=pass] .kpiStatus{color:var(--positive)}.kpiTile[data-state=pass] .kpiStatus:before{background:var(--positive)}.kpiTile[data-state=review] .kpiStatus{color:var(--caution)}.kpiTile[data-state=review] .kpiStatus:before{background:var(--caution)}.kpiTile[data-state=fail] .kpiStatus{color:var(--negative)}.kpiTile[data-state=fail] .kpiStatus:before{background:var(--negative)}.kpiTile small{font-size:var(--fs-12);color:var(--subtle);line-height:1.5}.kpiTile .kpiCushion{padding-top:var(--space-1);color:var(--text);font-variant-numeric:tabular-nums;margin-top:auto}.grid{gap:var(--space-4);grid-template-columns:minmax(0,2.8fr) minmax(260px,1fr);display:grid}.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);min-width:0;padding:var(--space-6)}.panelTitle{justify-content:space-between;align-items:start;gap:var(--space-5);display:flex}.panelTitle span{font-size:var(--fs-12);color:var(--subtle);line-height:1.5}.memo{min-height:300px}.tableScroll{border:1px solid var(--border);border-radius:var(--radius-sm);max-width:100%;overflow-x:auto}.tableScroll:has(tbody th){scroll-padding-inline-start:170px}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:var(--space-3);border-bottom:1px solid var(--rule);font-size:var(--fs-13)}thead th{color:var(--subtle);font-weight:500}tbody th{z-index:1;background:var(--surface);min-width:170px;font-weight:500;position:sticky;left:0}tbody tr:nth-child(2n):not(.derived)>*{background:var(--band)}.num{font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}.rowEdit{font:inherit;text-align:inherit;border-radius:var(--radius-sm);padding:var(--space-1) 0;color:inherit;text-decoration:underline;-webkit-text-decoration-color:var(--edit-underline);text-decoration-color:var(--edit-underline);text-underline-offset:4px;background:0 0;border:0}@media (hover:hover){.rowEdit:hover{background:var(--control-hover);-webkit-text-decoration-color:var(--accent);text-decoration-color:var(--accent)}}.rowEdit:disabled{color:inherit;cursor:default;background:0 0;text-decoration:none}.period{font-size:var(--fs-12);white-space:nowrap;padding:var(--space-2)}.period.active{background:var(--accent-soft)}.derived,.derived th{background:var(--derived)}tbody tr:not(.derived)+.derived>*{border-top:2px solid var(--rule-strong)}.derived[data-fact=ebitda],.derived[data-fact=ebitda] th{background:var(--ebitda-bg);color:var(--ebitda-text)}.derived small{color:var(--derived-label);font-size:var(--fs-12);margin-top:var(--space-1);display:block}.metric{gap:var(--space-2);border-bottom:1px solid var(--rule);padding:var(--space-4) 0;font-size:var(--fs-13);grid-template-columns:1fr auto;display:grid}.metric strong{font-size:var(--fs-20);overflow-wrap:anywhere}.metric>span:before{content:\"\";width:6px;height:6px;margin-right:var(--space-2);background:var(--subtle);vertical-align:middle;border-radius:50%;display:inline-block}.metric[data-state=pass]>span:before{background:var(--positive)}.metric[data-state=fail]>span:before{background:var(--negative)}.metric[data-state=review]>span:before{background:var(--caution)}.metric small{color:var(--muted);grid-column:1/-1;line-height:1.7}.assumptionsGrid{gap:var(--space-4);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.assumption{justify-content:space-between;align-items:start;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid var(--rule);font-size:var(--fs-13);display:flex}.assumption strong{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}details{border:1px solid var(--border);border-radius:var(--radius);margin:var(--space-2) 0;padding:var(--space-3);font-size:var(--fs-13);overflow-wrap:anywhere}summary{cursor:pointer;color:var(--text);line-height:1.5}.operand{gap:var(--space-2);margin:var(--space-3) 0;padding:var(--space-2);border-bottom:1px solid var(--rule);font-size:var(--fs-12);overflow-wrap:anywhere;grid-template-columns:1fr auto;display:grid}.operand small{color:var(--subtle);grid-column:1/-1}.expression{font-family:var(--font-mono);font-size:var(--fs-12)}.audit{gap:var(--space-2);padding:var(--space-4) 0;border-bottom:1px solid var(--rule);overflow-wrap:anywhere;grid-template-columns:1fr auto;display:grid}.audit small{color:var(--muted);grid-column:1/-1}.overviewGrid{gap:var(--space-4);grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);display:grid}.overviewTrends{grid-column:1/-1}.overviewHeadline{font-size:var(--fs-16);color:var(--text);margin-top:0;font-weight:600}.conditionList,.factorList,.constraintList{margin:0;padding:0;list-style:none}.conditionList li,.constraintList li{justify-content:space-between;align-items:baseline;gap:var(--space-4);padding:var(--space-2) 0;border-bottom:1px solid var(--rule);font-size:var(--fs-13);display:flex}.conditionList strong,.constraintList strong{white-space:nowrap;font-variant-numeric:tabular-nums}.constraintList li[data-binding=true]{font-weight:600}.factorList li{padding:var(--space-3) 0;border-bottom:1px solid var(--rule)}.factorList li>div{justify-content:space-between;gap:var(--space-1) var(--space-3);flex-wrap:wrap;display:flex}.factorList p{margin:var(--space-1) 0;font-size:var(--fs-13)}.factorList small{color:var(--subtle)}.factorStatus{font-size:var(--fs-12);color:var(--muted);font-weight:600}.factorList [data-status=meets_approval] .factorStatus{color:var(--positive)}.factorList [data-status=review_band] .factorStatus{color:var(--caution)}.factorList [data-status=below_decline_floor] .factorStatus{color:var(--negative)}.capacityFacts{gap:var(--space-3);margin:0;display:grid}.capacityFacts dt{font-size:var(--fs-12);color:var(--muted)}.capacityFacts dd{margin:var(--space-1) 0 0;font-size:var(--fs-16);font-variant-numeric:tabular-nums;font-weight:600}.analysisNotice{font-size:var(--fs-13)}.analysisNotice p{margin-top:0}.trendGrid{gap:var(--space-6);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.trendChart{min-width:0;margin:0}.trendChart figcaption{font-size:var(--fs-13);margin-bottom:var(--space-2);font-weight:600}.trendChart svg{width:100%;height:64px;display:block}.trendBar{fill:var(--accent)}.trendBar.negative{fill:var(--negative)}.trendBaseline{stroke:var(--rule-strong);stroke-width:1px;vector-effect:non-scaling-stroke}.trendLegend{gap:var(--space-1) var(--space-5);margin:var(--space-2) 0 0;font-size:var(--fs-12);color:var(--muted);flex-wrap:wrap;padding:0;list-style:none;display:flex}.trendLegend strong{margin-left:var(--space-2);color:var(--text);font-variant-numeric:tabular-nums}.historyAudit{gap:var(--space-4);display:grid}.compatibilityJson pre{max-height:600px;overflow-y:auto}.savedContext{align-items:flex-start;gap:var(--space-2);margin:var(--space-4) 0;padding:var(--space-4);border:1px solid var(--accent-border);border-radius:var(--radius);background:var(--accent-soft);font-size:var(--fs-12);overflow-wrap:anywhere;flex-direction:column;display:flex}.caseList{margin:var(--space-4) 0}.caseRow{align-items:center;gap:var(--space-4);padding:var(--space-4) 0;border-bottom:1px solid var(--rule);overflow-wrap:anywhere;flex-wrap:wrap;display:flex}.caseRow>div{flex:1;min-width:180px}.caseRow h3{margin:0 0 var(--space-2)}.caseRow p,.savedEvent p{font-size:var(--fs-12)}.savedEvent{overflow-wrap:anywhere;margin:var(--space-5) 0;border-top:1px solid var(--border)}.scenariosWorkspace{gap:var(--space-4);min-width:0;display:grid}.scenariosWorkspace p,.scenariosWorkspace small{font-size:var(--fs-13)}.scenarioComposer,.originalComparison,.comparisonArchive,.scenarioResult{overflow-wrap:anywhere}.scenarioRow{margin:var(--space-5) 0;padding:var(--space-4);border:1px solid var(--control-border);border-radius:var(--radius);min-width:0}.scenarioRow legend{color:var(--accent);padding:0 var(--space-2)}.scenarioFields{gap:var(--space-4);margin-bottom:var(--space-4);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.scenarioFields label,.scenarioSelect{min-width:0;font-size:var(--fs-13);display:block}.scenarioFields input,.scenarioFields textarea,.scenarioFields select,.scenarioSelect select{margin:var(--space-2) 0}.scenarioFields small{color:var(--subtle);line-height:1.5}.scenarioRationale{grid-column:1/-1}.scenarioOutcome strong{color:var(--positive)}.scenarioOutcome [data-outcome=review]{color:var(--caution)}.scenarioOutcome [data-outcome=decline]{color:var(--negative)}.scenarioFact{padding:var(--space-2) 0;border-bottom:1px solid var(--rule)}.scenarioFact h4{margin:var(--space-2) 0}.scenarioResult td small{white-space:normal;max-width:200px;display:block}.scenarioResult caption{text-align:left;font-size:var(--fs-13);color:var(--muted);padding:var(--space-3) 0}.scenariosWorkspace [role=alert]{color:var(--negative)}.originalComparisonJson pre{max-height:600px;overflow-y:auto}.reviewWorkspace{gap:var(--space-4);display:grid}.reviewWorkspace .panel{overflow-wrap:anywhere;min-width:0;margin-top:0}.reviewFacts{gap:var(--space-3) var(--space-6);grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));display:grid}.reviewFacts div{min-width:0}.reviewFacts dt,.reviewMetrics span{color:var(--muted);font-size:var(--fs-12)}.reviewFacts dd{margin:var(--space-1) 0 0;font-size:var(--fs-13)}.reviewMetrics{gap:var(--space-3);grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));display:grid}.reviewMetrics>div{padding:var(--space-4);border-radius:var(--radius);background:var(--sunken)}.reviewMetrics strong,.reviewMetrics small{margin-top:var(--space-2);display:block}.reviewMetrics small{color:var(--muted)}.reviewInclude{align-items:center;gap:var(--space-2);min-height:44px;margin-top:var(--space-4);display:flex}.reviewInclude input{flex:none;width:18px;height:18px}.reviewDownload{min-width:44px;min-height:44px;color:var(--accent);margin-bottom:var(--space-3);overflow-wrap:anywhere;align-items:center;display:inline-flex}.reviewWorkspace button{white-space:normal;max-width:100%}dialog{color:var(--text);background:var(--raised);border:1px solid var(--border-strong);border-radius:var(--radius-lg);box-shadow:var(--shadow-dialog);padding:var(--space-6);overflow-wrap:anywhere;width:480px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);overflow-y:auto}dialog::backdrop{background:var(--backdrop,#090e0c99)}dialog label{font-size:var(--fs-14);margin:var(--space-4) 0;display:block}dialog input,dialog textarea{margin-top:var(--space-2)}dialog [role=alert]{color:var(--negative);font-size:var(--fs-13)}@media (width<=1200px){.kpiTiles{grid-template-columns:repeat(3,minmax(0,1fr))}.kpiTile:nth-child(4){border-left:0}.kpiTile:nth-child(n+4){border-top:1px solid var(--border)}}@media (width<=900px){main{padding:var(--space-5)}.grid,.overviewGrid,.startOptions{grid-template-columns:1fr}.startOption{min-height:0}.panelTitle{gap:var(--space-1);flex-direction:column}}@media (width<=600px){.workspaceBrand{gap:var(--space-3)}.workspaceType{display:none}.brandActions{width:100%;margin-left:0}.brandActions>.disclosureMenu{margin-left:auto}.workspaceTabs{gap:var(--space-5)}.kpiTiles{grid-template-columns:repeat(2,minmax(0,1fr))}.kpiTile:nth-child(n){border-left:1px solid var(--border);border-top:1px solid var(--border)}.kpiTile:nth-child(odd){border-left:0}.kpiTile:nth-child(-n+2){border-top:0}.kpiTile{padding:var(--space-3)}.kpiTile strong{font-size:var(--fs-20)}.decision{padding:var(--space-4);flex-direction:column}.decision strong{font-size:var(--fs-24)}.trendGrid{grid-template-columns:1fr}.hostingNotice{padding:var(--space-3) var(--space-5)}.scenarioFields{grid-template-columns:1fr}.caseRow>div{flex-basis:100%;min-width:0}h1{font-size:var(--fs-24)}.panel{padding:var(--space-4)}.assumptionsGrid,.operand,.audit{grid-template-columns:1fr}.operand small,.audit small{grid-column:1}.assumption{gap:var(--space-2)}.assumption strong{white-space:normal}.panelTitle span{margin-bottom:var(--space-3)}}@media print{@page{margin:14mm}:root,.themeRoot{--canvas:var(--surface)}.themeRoot{-webkit-print-color-adjust:exact;print-color-adjust:exact}main{max-width:none;padding:0}.brandActions,.workspaceTabs,.moreMenu,.startOptions,.reviewInclude,.reviewDownload,button:not(.period,.rowEdit),dialog{display:none}.period,.rowEdit{color:inherit;background:0 0;border:0;padding:0;text-decoration:none}.panel{margin-top:var(--space-6);border:0;padding:0}.grid,.overviewGrid{grid-template-columns:1fr}.tableScroll{overflow:visible}tbody th{position:static}thead{display:table-header-group}tr,.metric,.assumption,.audit,.decision,.kpiTile,.trendChart{break-inside:avoid}h2,h3{break-after:avoid}}@media (prefers-reduced-motion:reduce){*,:before,:after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}:root,.themeRoot{--space-5:24px;--space-7:32px;--space-9:48px;--space-10:64px;--control-border:#7b8b83;--border:#7b8b83}@media screen{:root[data-theme=dark],.themeRoot[data-theme=dark]{--control-border:#7d8d9a;--input-border:#7d8d9a;--border:#7d8d9a}}h1,h2,h3,h4,strong,b,summary{font-weight:600}p{max-width:70ch}button,select,input:not([type=checkbox]),summary{min-height:44px}button{min-width:44px}input[type=checkbox]{flex-shrink:0;width:24px;height:24px}select,input,textarea{font-variant-numeric:tabular-nums}.primaryNavigation{gap:var(--space-2);margin:var(--space-6) 0;flex-wrap:wrap;display:flex}.primaryNavigation button{font-size:var(--fs-14);flex:160px}.primaryNavigation [aria-current=page]{color:var(--on-accent);background:var(--accent);border-color:var(--accent)}.sessionStatus{align-items:center;gap:var(--space-2) var(--space-4);font-size:var(--fs-12);padding:var(--space-3) 0;color:var(--muted);overflow-wrap:anywhere;flex-wrap:wrap;display:flex}.connectionBadge,.statusBadge,.allocationBadge{border:1px solid var(--border);border-radius:var(--radius-sm);padding:var(--space-1) var(--space-2);color:var(--text);background:var(--sunken);font-size:var(--fs-12);font-weight:600;display:inline-block}.requestDeadline{min-width:0;font-size:var(--fs-12);display:block}.requestSkeleton{background:var(--border);width:180px;max-width:100%;height:8px;margin-top:var(--space-1);opacity:.5;display:block}.composerPanel,.domainWorkspace,.contextPane,.analystWorkspace>*,.formField{min-width:0}.composerPanel h1{font-size:var(--fs-24)}.guidedForm{gap:var(--space-6);display:grid}.guidedForm fieldset{min-width:0;padding:var(--space-4);border:1px solid var(--border);border-radius:var(--radius);margin:0}.guidedForm legend{font-size:var(--fs-14);padding:0 var(--space-2);font-weight:600}.guidedForm details{border:1px solid var(--border);padding:var(--space-4);border-radius:var(--radius)}.guidedForm summary{cursor:pointer;align-items:center;display:flex}.guidedForm details[open]>summary{margin-bottom:var(--space-4)}.formGrid{gap:var(--space-4) var(--space-6);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.formField{align-content:start;gap:var(--space-2);display:grid}.formField label,.sampleSelector,.spreadMode{font-size:var(--fs-14);font-weight:500}.formField input,.formField select,.sampleSelector select,.spreadMode select,.caseFilters input,.caseFilters select{width:100%;min-width:0;padding:var(--space-2) var(--space-3);color:var(--text);background:var(--input-bg);border:1px solid var(--input-border);border-radius:var(--radius-sm);font:inherit;display:block}.formField small{color:var(--muted);font-size:var(--fs-12)}.formField input[aria-invalid=true],.formField select[aria-invalid=true]{border:2px solid var(--negative)}.fieldError{font-size:var(--fs-14);color:var(--negative)}.sampleSelector,.spreadMode{gap:var(--space-2);max-width:540px;margin-bottom:var(--space-6);display:grid}.structuralHints{gap:var(--space-2);flex-wrap:wrap;display:flex}.structuralHints>span{font-size:var(--fs-12);border:1px solid var(--border);padding:var(--space-2);border-radius:var(--radius-sm)}.structuralHints [data-valid=true]{background:var(--accent-soft)}.validationSummary{border:2px solid var(--negative);border-radius:var(--radius);padding:var(--space-4);background:var(--surface)}.validationSummary ul{padding-left:var(--space-6);margin-bottom:0}.validationSummary li small{font-size:var(--fs-12);display:block}.validationSummary button{text-align:left;overflow-wrap:anywhere;background:0 0;border:0;padding-left:0;text-decoration:underline}.checkboxField{align-items:center;gap:var(--space-3);min-height:44px;font-size:var(--fs-14);display:flex}.domainMetrics{gap:var(--space-4);margin:var(--space-6) 0;grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.domainMetrics article{border:1px solid var(--border);padding:var(--space-4);border-radius:var(--radius)}.domainMetrics article h3{margin-top:0}.domainMetrics article>strong{font-size:var(--fs-24);margin-bottom:var(--space-4);display:block}.domainWorkspace{gap:var(--space-6);overflow-wrap:anywhere;display:grid}.modelScope{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:var(--space-4);margin:var(--space-4) 0;font-size:var(--fs-14)}.modelScope p{margin-top:0}.modelScope>p{max-width:70ch}.analysisPanel{margin-top:var(--space-6)}.analysisPanel>summary{cursor:pointer;align-items:center;display:flex}.analysisPanel .tableScroll{margin-top:var(--space-4)}.scheduleScroll{max-height:480px;overflow:auto}.scheduleScroll thead th{z-index:2;background:var(--surface);position:sticky;top:0}.analysisPanel table{min-width:700px}.analysisPanel caption{text-align:left;padding:var(--space-3);font-size:var(--fs-14);font-weight:600}.gridCell{vertical-align:top;min-width:180px}.gridCell>span{font-size:var(--fs-14);text-align:right;margin-top:var(--space-2);display:block}.traceLink{color:inherit;text-underline-offset:3px;font:inherit;padding:var(--space-2) var(--space-1);background:0 0;border:0;text-decoration:underline}.traceFact{margin:var(--space-2) 0;text-align:left;width:100%;display:block}.contextPane{align-content:start;gap:var(--space-4);display:grid}.traceInspector{top:var(--space-4);overflow-wrap:anywhere;max-height:calc(100vh - 32px);position:sticky;overflow:auto}.traceInspector .panelTitle{align-items:flex-start}.traceOperands{padding:0;list-style:none}.traceOperands li{gap:var(--space-2);padding:var(--space-3) 0;border-bottom:1px solid var(--border);display:grid}.traceOperands strong{text-align:right;font-variant-numeric:tabular-nums}.traceOperands code,.traceOperands small{font-size:var(--fs-12)}.traceOperands [data-allocated=true]{background:var(--accent-soft);padding:var(--space-3)}.traceSupplied div{gap:var(--space-3);padding:var(--space-2) 0;grid-template-columns:1fr 1fr;display:grid}.traceSupplied dd{text-align:right;overflow-wrap:anywhere;margin:0}.reconciliationEquation{padding:var(--space-3);background:var(--sunken);border:1px solid var(--border)}.reconciliationEquation small{font-size:var(--fs-12);margin-top:var(--space-2);display:block}.editCompleteDraft{margin-bottom:var(--space-4)}.caseFilters{gap:var(--space-4);margin-bottom:var(--space-6);grid-template-columns:2fr 1fr 1fr;display:grid}.caseFilters label{gap:var(--space-2);font-size:var(--fs-14);min-width:0;display:grid}.scenarioChips{gap:var(--space-2);margin:var(--space-4) 0;flex-wrap:wrap;display:flex}.pendingPayload{white-space:pre-wrap;overflow-wrap:anywhere;max-height:360px;overflow:auto}@media (width<=900px){.traceInspector{max-height:none;position:static}}@media (width<=600px){main{padding:var(--space-4)}.formGrid,.caseFilters,.domainMetrics{grid-template-columns:minmax(0,1fr)}.primaryNavigation button{padding-inline:var(--space-2);flex-basis:calc(50% - 8px)}.composerPanel .panelTitle{flex-direction:column}.traceSupplied div{grid-template-columns:minmax(0,1fr)}}@media print{.primaryNavigation,.sessionStatus,.spreadMode,.editCompleteDraft{display:none}}", Io = /* @__PURE__ */ new WeakMap(), Lo = ({ parentElement: e, data: t, setStateValue: n }) => {
	let r = Io.get(e);
	if (r && r.transport.generation !== t.generation && (r.root.unmount(), r.transport.dispose(), Io.delete(e), r = void 0), !r) {
		let i = e.querySelector(".react-root");
		if (!i) throw Error("Workspace mount unavailable");
		let a = document.createElement("style");
		a.textContent = Fo, e.prepend(a), Kn(e);
		let o = new Po(t.generation, (e) => n("requests", e));
		Ct(t.generation, o.request);
		let s = (0, l.createRoot)(i);
		r = {
			root: s,
			transport: o
		}, Io.set(e, r), s.render(/* @__PURE__ */ (0, V.jsx)($i, { children: /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "embeddedWorkspace",
			children: [/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "hostingNotice",
				children: [/* @__PURE__ */ (0, V.jsx)("span", { children: "TESTING WORKSPACE" }), /* @__PURE__ */ (0, V.jsx)("span", { children: "Synthetic data only · saved test cases may reset when the host restarts" })]
			}), /* @__PURE__ */ (0, V.jsx)(Mo, {})]
		}) }));
	}
	return r.transport.publish = (e) => n("requests", e), r.transport.accept(t.responses), () => {
		let t = Io.get(e);
		t?.root.unmount(), t?.transport.dispose(), Io.delete(e);
	};
};
//#endregion
export { Lo as default };
