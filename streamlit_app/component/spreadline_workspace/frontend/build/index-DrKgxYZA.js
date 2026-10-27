// \0rolldown/runtime.js
var e = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), t = /* @__PURE__ */ e(((e) => {
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
	function te(e, n, r) {
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
	function w(e, n) {
		return {
			$$typeof: t,
			type: e.type,
			key: n,
			ref: e.ref,
			props: e.props,
			_owner: e._owner
		};
	}
	function T(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function ne(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var re = /\/+/g;
	function E(e, t) {
		return typeof e == "object" && e && e.key != null ? ne("" + e.key) : t.toString(36);
	}
	function D(e, r, i, a, o) {
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
		if (c) return c = e, o = o(c), e = a === "" ? "." + E(c, 0) : a, x(o) ? (i = "", e != null && (i = e.replace(re, "$&/") + "/"), D(o, r, i, "", function(e) {
			return e;
		})) : o != null && (T(o) && (o = w(o, i + (!o.key || c && c.key === o.key ? "" : ("" + o.key).replace(re, "$&/") + "/") + e)), r.push(o)), 1;
		if (c = 0, a = a === "" ? "." : a + ":", x(e)) for (var l = 0; l < e.length; l++) {
			s = e[l];
			var u = a + E(s, l);
			c += D(s, r, i, u, o);
		}
		else if (u = p(e), typeof u == "function") for (e = u.call(e), l = 0; !(s = e.next()).done;) s = s.value, u = a + E(s, l++), c += D(s, r, i, u, o);
		else if (s === "object") throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		return c;
	}
	function O(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return D(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ie(e) {
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
	var k = { current: null }, A = { transition: null }, ae = {
		ReactCurrentDispatcher: k,
		ReactCurrentBatchConfig: A,
		ReactCurrentOwner: C
	};
	function oe() {
		throw Error("act(...) is not supported in production builds of React.");
	}
	e.Children = {
		map: O,
		forEach: function(e, t, n) {
			O(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return O(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return O(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!T(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	}, e.Component = _, e.Fragment = r, e.Profiler = a, e.PureComponent = y, e.StrictMode = i, e.Suspense = l, e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ae, e.act = oe, e.cloneElement = function(e, n, r) {
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
	}, e.createElement = te, e.createFactory = function(e) {
		var t = te.bind(null, e);
		return t.type = e, t;
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = T, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: ie
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = function(e) {
		var t = A.transition;
		A.transition = {};
		try {
			e();
		} finally {
			A.transition = t;
		}
	}, e.unstable_act = oe, e.useCallback = function(e, t) {
		return k.current.useCallback(e, t);
	}, e.useContext = function(e) {
		return k.current.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e) {
		return k.current.useDeferredValue(e);
	}, e.useEffect = function(e, t) {
		return k.current.useEffect(e, t);
	}, e.useId = function() {
		return k.current.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return k.current.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return k.current.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return k.current.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return k.current.useMemo(e, t);
	}, e.useReducer = function(e, t, n) {
		return k.current.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return k.current.useRef(e);
	}, e.useState = function(e) {
		return k.current.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return k.current.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return k.current.useTransition();
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
			if (n(c) !== null) m = !0, O(x);
			else {
				var t = n(l);
				t !== null && ie(b, t.startTime - e);
			}
		}
	}
	function x(t, i) {
		m = !1, h && (h = !1, _(ee), ee = -1), p = !0;
		var a = f;
		try {
			for (y(i), d = n(c); d !== null && (!(d.expirationTime > i) || t && !T());) {
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
				g !== null && ie(b, g.startTime - i), u = !1;
			}
			return u;
		} finally {
			d = null, f = a, p = !1;
		}
	}
	var S = !1, C = null, ee = -1, te = 5, w = -1;
	function T() {
		return !(e.unstable_now() - w < te);
	}
	function ne() {
		if (C !== null) {
			var t = e.unstable_now();
			w = t;
			var n = !0;
			try {
				n = C(!0, t);
			} finally {
				n ? re() : (S = !1, C = null);
			}
		} else S = !1;
	}
	var re;
	if (typeof v == "function") re = function() {
		v(ne);
	};
	else if (typeof MessageChannel < "u") {
		var E = new MessageChannel(), D = E.port2;
		E.port1.onmessage = ne, re = function() {
			D.postMessage(null);
		};
	} else re = function() {
		g(ne, 0);
	};
	function O(e) {
		C = e, S || (S = !0, re());
	}
	function ie(t, n) {
		ee = g(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_continueExecution = function() {
		m || p || (m = !0, O(x));
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : te = 0 < e ? Math.floor(1e3 / e) : 5;
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (_(ee), ee = -1) : h = !0, ie(b, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, O(x))), r;
	}, e.unstable_shouldYield = T, e.unstable_wrapCallback = function(e) {
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
	var C = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, ee = Symbol.for("react.element"), te = Symbol.for("react.portal"), w = Symbol.for("react.fragment"), T = Symbol.for("react.strict_mode"), ne = Symbol.for("react.profiler"), re = Symbol.for("react.provider"), E = Symbol.for("react.context"), D = Symbol.for("react.forward_ref"), O = Symbol.for("react.suspense"), ie = Symbol.for("react.suspense_list"), k = Symbol.for("react.memo"), A = Symbol.for("react.lazy"), ae = Symbol.for("react.offscreen"), oe = Symbol.iterator;
	function se(e) {
		return typeof e != "object" || !e ? null : (e = oe && e[oe] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var j = Object.assign, ce;
	function le(e) {
		if (ce === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			ce = t && t[1] || "";
		}
		return "\n" + ce + e;
	}
	var ue = !1;
	function de(e, t) {
		if (!e || ue) return "";
		ue = !0;
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
			ue = !1, Error.prepareStackTrace = n;
		}
		return (e = e ? e.displayName || e.name : "") ? le(e) : "";
	}
	function fe(e) {
		switch (e.tag) {
			case 5: return le(e.type);
			case 16: return le("Lazy");
			case 13: return le("Suspense");
			case 19: return le("SuspenseList");
			case 0:
			case 2:
			case 15: return e = de(e.type, !1), e;
			case 11: return e = de(e.type.render, !1), e;
			case 1: return e = de(e.type, !0), e;
			default: return "";
		}
	}
	function M(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case w: return "Fragment";
			case te: return "Portal";
			case ne: return "Profiler";
			case T: return "StrictMode";
			case O: return "Suspense";
			case ie: return "SuspenseList";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case E: return (e.displayName || "Context") + ".Consumer";
			case re: return (e._context.displayName || "Context") + ".Provider";
			case D:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case k: return t = e.displayName || null, t === null ? M(e.type) || "Memo" : t;
			case A:
				t = e._payload, e = e._init;
				try {
					return M(e(t));
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
			case 16: return M(t);
			case 8: return t === T ? "StrictMode" : "Mode";
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
	function N(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function he(e) {
		var t = N(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
	function ge(e) {
		e._valueTracker ||= he(e);
	}
	function P(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = N(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	function _e(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function ve(e, t) {
		var n = t.checked;
		return j({}, t, {
			defaultChecked: void 0,
			defaultValue: void 0,
			value: void 0,
			checked: n ?? e._wrapperState.initialChecked
		});
	}
	function ye(e, t) {
		var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked == null ? t.defaultChecked : t.checked;
		n = me(t.value == null ? n : t.value), e._wrapperState = {
			initialChecked: r,
			initialValue: n,
			controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null
		};
	}
	function be(e, t) {
		t = t.checked, t != null && S(e, "checked", t, !1);
	}
	function xe(e, t) {
		be(e, t);
		var n = me(t.value), r = t.type;
		if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
		else if (r === "submit" || r === "reset") {
			e.removeAttribute("value");
			return;
		}
		t.hasOwnProperty("value") ? Ce(e, t.type, n) : t.hasOwnProperty("defaultValue") && Ce(e, t.type, me(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
	}
	function Se(e, t, n) {
		if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
			var r = t.type;
			if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
			t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
		}
		n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
	}
	function Ce(e, t, n) {
		(t !== "number" || _e(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
	}
	var we = Array.isArray;
	function Te(e, t, n, r) {
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
	function Ee(e, t) {
		if (t.dangerouslySetInnerHTML != null) throw Error(a(91));
		return j({}, t, {
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
				if (we(n)) {
					if (1 < n.length) throw Error(a(93));
					n = n[0];
				}
				t = n;
			}
			t ??= "", n = t;
		}
		e._wrapperState = { initialValue: me(n) };
	}
	function Oe(e, t) {
		var n = me(t.value), r = me(t.defaultValue);
		n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
	}
	function ke(e) {
		var t = e.textContent;
		t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
	}
	function Ae(e) {
		switch (e) {
			case "svg": return "http://www.w3.org/2000/svg";
			case "math": return "http://www.w3.org/1998/Math/MathML";
			default: return "http://www.w3.org/1999/xhtml";
		}
	}
	function je(e, t) {
		return e == null || e === "http://www.w3.org/1999/xhtml" ? Ae(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
	}
	var Me, Ne = function(e) {
		return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
			MSApp.execUnsafeLocalFunction(function() {
				return e(t, n, r, i);
			});
		} : e;
	}(function(e, t) {
		if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
		else {
			for (Me ||= document.createElement("div"), Me.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = Me.firstChild; e.firstChild;) e.removeChild(e.firstChild);
			for (; t.firstChild;) e.appendChild(t.firstChild);
		}
	});
	function Pe(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Fe = {
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
	}, Ie = [
		"Webkit",
		"ms",
		"Moz",
		"O"
	];
	Object.keys(Fe).forEach(function(e) {
		Ie.forEach(function(t) {
			t = t + e.charAt(0).toUpperCase() + e.substring(1), Fe[t] = Fe[e];
		});
	});
	function Le(e, t, n) {
		return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Fe.hasOwnProperty(e) && Fe[e] ? ("" + t).trim() : t + "px";
	}
	function Re(e, t) {
		for (var n in e = e.style, t) if (t.hasOwnProperty(n)) {
			var r = n.indexOf("--") === 0, i = Le(n, t[n], r);
			n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : e[n] = i;
		}
	}
	var ze = j({ menuitem: !0 }, {
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
	function Be(e, t) {
		if (t) {
			if (ze[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(a(137, e));
			if (t.dangerouslySetInnerHTML != null) {
				if (t.children != null) throw Error(a(60));
				if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(a(61));
			}
			if (t.style != null && typeof t.style != "object") throw Error(a(62));
		}
	}
	function Ve(e, t) {
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
	var He = null;
	function Ue(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var We = null, Ge = null, Ke = null;
	function qe(e) {
		if (e = Fi(e)) {
			if (typeof We != "function") throw Error(a(280));
			var t = e.stateNode;
			t && (t = Li(t), We(e.stateNode, e.type, t));
		}
	}
	function Je(e) {
		Ge ? Ke ? Ke.push(e) : Ke = [e] : Ge = e;
	}
	function Ye() {
		if (Ge) {
			var e = Ge, t = Ke;
			if (Ke = Ge = null, qe(e), t) for (e = 0; e < t.length; e++) qe(t[e]);
		}
	}
	function Xe(e, t) {
		return e(t);
	}
	function F() {}
	var I = !1;
	function Ze(e, t, n) {
		if (I) return e(t, n);
		I = !0;
		try {
			return Xe(e, t, n);
		} finally {
			I = !1, (Ge !== null || Ke !== null) && (F(), Ye());
		}
	}
	function L(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = Li(n);
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
	var Qe = !1;
	if (u) try {
		var $e = {};
		Object.defineProperty($e, "passive", { get: function() {
			Qe = !0;
		} }), window.addEventListener("test", $e, $e), window.removeEventListener("test", $e, $e);
	} catch {
		Qe = !1;
	}
	function et(e, t, n, r, i, a, o, s, c) {
		var l = Array.prototype.slice.call(arguments, 3);
		try {
			t.apply(n, l);
		} catch (e) {
			this.onError(e);
		}
	}
	var tt = !1, nt = null, rt = !1, it = null, at = { onError: function(e) {
		tt = !0, nt = e;
	} };
	function ot(e, t, n, r, i, a, o, s, c) {
		tt = !1, nt = null, et.apply(at, arguments);
	}
	function st(e, t, n, r, i, o, s, c, l) {
		if (ot.apply(this, arguments), tt) {
			if (tt) {
				var u = nt;
				tt = !1, nt = null;
			} else throw Error(a(198));
			rt || (rt = !0, it = u);
		}
	}
	function ct(e) {
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
	function lt(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function ut(e) {
		if (ct(e) !== e) throw Error(a(188));
	}
	function dt(e) {
		var t = e.alternate;
		if (!t) {
			if (t = ct(e), t === null) throw Error(a(188));
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
					if (o === n) return ut(i), e;
					if (o === r) return ut(i), t;
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
	function ft(e) {
		return e = dt(e), e === null ? null : pt(e);
	}
	function pt(e) {
		if (e.tag === 5 || e.tag === 6) return e;
		for (e = e.child; e !== null;) {
			var t = pt(e);
			if (t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	var mt = r.unstable_scheduleCallback, ht = r.unstable_cancelCallback, gt = r.unstable_shouldYield, _t = r.unstable_requestPaint, vt = r.unstable_now, yt = r.unstable_getCurrentPriorityLevel, bt = r.unstable_ImmediatePriority, xt = r.unstable_UserBlockingPriority, St = r.unstable_NormalPriority, Ct = r.unstable_LowPriority, wt = r.unstable_IdlePriority, Tt = null, Et = null;
	function Dt(e) {
		if (Et && typeof Et.onCommitFiberRoot == "function") try {
			Et.onCommitFiberRoot(Tt, e, void 0, (e.current.flags & 128) == 128);
		} catch {}
	}
	var Ot = Math.clz32 ? Math.clz32 : R, kt = Math.log, At = Math.LN2;
	function R(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (kt(e) / At | 0) | 0;
	}
	var z = 64, jt = 4194304;
	function B(e) {
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
	function Mt(e, t) {
		var n = e.pendingLanes;
		if (n === 0) return 0;
		var r = 0, i = e.suspendedLanes, a = e.pingedLanes, o = n & 268435455;
		if (o !== 0) {
			var s = o & ~i;
			s === 0 ? (a &= o, a !== 0 && (r = B(a))) : r = B(s);
		} else o = n & ~i, o === 0 ? a !== 0 && (r = B(a)) : r = B(o);
		if (r === 0) return 0;
		if (t !== 0 && t !== r && (t & i) === 0 && (i = r & -r, a = t & -t, i >= a || i === 16 && a & 4194240)) return t;
		if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t;) n = 31 - Ot(t), i = 1 << n, r |= e[n], t &= ~i;
		return r;
	}
	function Nt(e, t) {
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
	function Pt(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes; 0 < a;) {
			var o = 31 - Ot(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Nt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
	}
	function Ft(e) {
		return e = e.pendingLanes & -1073741825, e === 0 ? e & 1073741824 ? 1073741824 : 0 : e;
	}
	function It() {
		var e = z;
		return z <<= 1, !(z & 4194240) && (z = 64), e;
	}
	function Lt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Rt(e, t, n) {
		e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Ot(t), e[t] = n;
	}
	function V(e, t) {
		var n = e.pendingLanes & ~t;
		e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
		var r = e.eventTimes;
		for (e = e.expirationTimes; 0 < n;) {
			var i = 31 - Ot(n), a = 1 << i;
			t[i] = 0, r[i] = -1, e[i] = -1, n &= ~a;
		}
	}
	function zt(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Ot(n), i = 1 << r;
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
		}, t !== null && (t = Fi(t), t !== null && Ht(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
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
		var t = Pi(e.target);
		if (t !== null) {
			var n = ct(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = lt(n), t !== null) {
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
				He = r, n.target.dispatchEvent(r), He = null;
			} else return t = Fi(n), t !== null && Ht(t), e.blockedOn = n, !1;
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
			if (i === null) li(e, t, r, gn, n), tn(e, r);
			else if (rn(i, e, t, n, r)) r.stopPropagation();
			else if (tn(e, r), t & 4 && -1 < en.indexOf(e)) {
				for (; i !== null;) {
					var a = Fi(i);
					if (a !== null && Vt(a), a = _n(e, t, n, r), a === null && li(e, t, r, gn, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else li(e, t, r, null, n);
		}
	}
	var gn = null;
	function _n(e, t, n, r) {
		if (gn = null, e = Ue(r), e = Pi(e), e !== null) {
			if (t = ct(e), t === null) e = null;
			else if (n = t.tag, n === 13) {
				if (e = lt(t), e !== null) return e;
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
			case "message": switch (yt()) {
				case bt: return 1;
				case xt: return 4;
				case St:
				case Ct: return 16;
				case wt: return 536870912;
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
		return j(t.prototype, {
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
	}, On = En(Dn), kn = j({}, Dn, {
		view: 0,
		detail: 0
	}), An = En(kn), jn, Mn, Nn, Pn = j({}, kn, {
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
	}), Fn = En(Pn), In = En(j({}, Pn, { dataTransfer: 0 })), Ln = En(j({}, kn, { relatedTarget: 0 })), Rn = En(j({}, Dn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), zn = En(j({}, Dn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Bn = En(j({}, Dn, { data: 0 })), Vn = {
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
	var Kn = En(j({}, kn, {
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
	})), U = En(j({}, Pn, {
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
	})), qn = En(j({}, kn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Gn
	})), Jn = En(j({}, Dn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Yn = En(j({}, Pn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Xn = [
		9,
		13,
		27,
		32
	], Zn = u && "CompositionEvent" in window, Qn = null;
	u && "documentMode" in document && (Qn = document.documentMode);
	var $n = u && "TextEvent" in window && !Qn, er = u && (!Zn || Qn && 8 < Qn && 11 >= Qn), tr = " ", nr = !1;
	function rr(e, t) {
		switch (e) {
			case "keyup": return Xn.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function ir(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var ar = !1;
	function or(e, t) {
		switch (e) {
			case "compositionend": return ir(t);
			case "keypress": return t.which === 32 ? (nr = !0, tr) : null;
			case "textInput": return e = t.data, e === tr && nr ? null : e;
			default: return null;
		}
	}
	function sr(e, t) {
		if (ar) return e === "compositionend" || !Zn && rr(e, t) ? (e = Sn(), xn = bn = yn = null, ar = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return er && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var cr = {
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
	function lr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!cr[e.type] : t === "textarea";
	}
	function ur(e, t, n, r) {
		Je(r), t = di(t, "onChange"), 0 < t.length && (n = new On("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var dr = null, fr = null;
	function pr(e) {
		ii(e, 0);
	}
	function mr(e) {
		if (P(Ii(e))) return e;
	}
	function hr(e, t) {
		if (e === "change") return t;
	}
	var gr = !1;
	if (u) {
		var _r;
		if (u) {
			var vr = "oninput" in document;
			if (!vr) {
				var yr = document.createElement("div");
				yr.setAttribute("oninput", "return;"), vr = typeof yr.oninput == "function";
			}
			_r = vr;
		} else _r = !1;
		gr = _r && (!document.documentMode || 9 < document.documentMode);
	}
	function br() {
		dr && (dr.detachEvent("onpropertychange", xr), fr = dr = null);
	}
	function xr(e) {
		if (e.propertyName === "value" && mr(fr)) {
			var t = [];
			ur(t, fr, e, Ue(e)), Ze(pr, t);
		}
	}
	function Sr(e, t, n) {
		e === "focusin" ? (br(), dr = t, fr = n, dr.attachEvent("onpropertychange", xr)) : e === "focusout" && br();
	}
	function Cr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return mr(fr);
	}
	function wr(e, t) {
		if (e === "click") return mr(t);
	}
	function Tr(e, t) {
		if (e === "input" || e === "change") return mr(t);
	}
	function Er(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Dr = typeof Object.is == "function" ? Object.is : Er;
	function Or(e, t) {
		if (Dr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!d.call(t, i) || !Dr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function kr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Ar(e, t) {
		var n = kr(e);
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
			n = kr(n);
		}
	}
	function jr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? jr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Mr() {
		for (var e = window, t = _e(); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = _e(e.document);
		}
		return t;
	}
	function Nr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	function Pr(e) {
		var t = Mr(), n = e.focusedElem, r = e.selectionRange;
		if (t !== n && n && n.ownerDocument && jr(n.ownerDocument.documentElement, n)) {
			if (r !== null && Nr(n)) {
				if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
				else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
					e = e.getSelection();
					var i = n.textContent.length, a = Math.min(r.start, i);
					r = r.end === void 0 ? a : Math.min(r.end, i), !e.extend && a > r && (i = r, r = a, a = i), i = Ar(n, a);
					var o = Ar(n, r);
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
	var Fr = u && "documentMode" in document && 11 >= document.documentMode, Ir = null, Lr = null, Rr = null, zr = !1;
	function Br(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		zr || Ir == null || Ir !== _e(r) || (r = Ir, "selectionStart" in r && Nr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Rr && Or(Rr, r) || (Rr = r, r = di(Lr, "onSelect"), 0 < r.length && (t = new On("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Ir)));
	}
	function Vr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Hr = {
		animationend: Vr("Animation", "AnimationEnd"),
		animationiteration: Vr("Animation", "AnimationIteration"),
		animationstart: Vr("Animation", "AnimationStart"),
		transitionend: Vr("Transition", "TransitionEnd")
	}, Ur = {}, Wr = {};
	u && (Wr = document.createElement("div").style, "AnimationEvent" in window || (delete Hr.animationend.animation, delete Hr.animationiteration.animation, delete Hr.animationstart.animation), "TransitionEvent" in window || delete Hr.transitionend.transition);
	function Gr(e) {
		if (Ur[e]) return Ur[e];
		if (!Hr[e]) return e;
		var t = Hr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Wr) return Ur[e] = t[n];
		return e;
	}
	var Kr = Gr("animationend"), qr = Gr("animationiteration"), Jr = Gr("animationstart"), Yr = Gr("transitionend"), Xr = /* @__PURE__ */ new Map(), Zr = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	function Qr(e, t) {
		Xr.set(e, t), c(t, [e]);
	}
	for (var $r = 0; $r < Zr.length; $r++) {
		var ei = Zr[$r];
		Qr(ei.toLowerCase(), "on" + (ei[0].toUpperCase() + ei.slice(1)));
	}
	Qr(Kr, "onAnimationEnd"), Qr(qr, "onAnimationIteration"), Qr(Jr, "onAnimationStart"), Qr("dblclick", "onDoubleClick"), Qr("focusin", "onFocus"), Qr("focusout", "onBlur"), Qr(Yr, "onTransitionEnd"), l("onMouseEnter", ["mouseout", "mouseover"]), l("onMouseLeave", ["mouseout", "mouseover"]), l("onPointerEnter", ["pointerout", "pointerover"]), l("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var ti = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), ni = new Set("cancel close invalid load scroll toggle".split(" ").concat(ti));
	function ri(e, t, n) {
		var r = e.type || "unknown-event";
		e.currentTarget = n, st(r, t, void 0, e), e.currentTarget = null;
	}
	function ii(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					ri(i, s, l), a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					ri(i, s, l), a = c;
				}
			}
		}
		if (rt) throw e = it, rt = !1, it = null, e;
	}
	function W(e, t) {
		var n = t[ji];
		n === void 0 && (n = t[ji] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (ci(t, e, 2, !1), n.add(r));
	}
	function ai(e, t, n) {
		var r = 0;
		t && (r |= 4), ci(n, e, r, t);
	}
	var oi = "_reactListening" + Math.random().toString(36).slice(2);
	function si(e) {
		if (!e[oi]) {
			e[oi] = !0, o.forEach(function(t) {
				t !== "selectionchange" && (ni.has(t) || ai(t, !1, e), ai(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[oi] || (t[oi] = !0, ai("selectionchange", !1, t));
		}
	}
	function ci(e, t, n, r) {
		switch (vn(t)) {
			case 1:
				var i = pn;
				break;
			case 4:
				i = mn;
				break;
			default: i = hn;
		}
		n = i.bind(null, t, n, e), i = void 0, !Qe || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function li(e, t, n, r, i) {
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
					if (o = Pi(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		Ze(function() {
			var r = a, i = Ue(n), o = [];
			a: {
				var s = Xr.get(e);
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
							c = qn;
							break;
						case Kr:
						case qr:
						case Jr:
							c = Rn;
							break;
						case Yr:
							c = Jn;
							break;
						case "scroll":
							c = An;
							break;
						case "wheel":
							c = Yn;
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
						case "pointerup": c = U;
					}
					var u = !!(t & 4), d = !u && e === "scroll", f = u ? s === null ? null : s + "Capture" : s;
					u = [];
					for (var p = r, m; p !== null;) {
						m = p;
						var h = m.stateNode;
						if (m.tag === 5 && h !== null && (m = h, f !== null && (h = L(p, f), h != null && u.push(ui(p, h, m)))), d) break;
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
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== He && (l = n.relatedTarget || n.fromElement) && (Pi(l) || l[Ai])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Pi(l) : null, l !== null && (d = ct(l), l !== d || l.tag !== 5 && l.tag !== 6) && (l = null)) : (c = null, l = r), c !== l)) {
						if (u = Fn, h = "onMouseLeave", f = "onMouseEnter", p = "mouse", (e === "pointerout" || e === "pointerover") && (u = U, h = "onPointerLeave", f = "onPointerEnter", p = "pointer"), d = c == null ? s : Ii(c), m = l == null ? s : Ii(l), s = new u(h, p + "leave", c, n, i), s.target = d, s.relatedTarget = m, h = null, Pi(i) === r && (u = new u(f, p + "enter", l, n, i), u.target = m, u.relatedTarget = d, h = u), d = h, c && l) b: {
							for (u = c, f = l, p = 0, m = u; m; m = fi(m)) p++;
							for (m = 0, h = f; h; h = fi(h)) m++;
							for (; 0 < p - m;) u = fi(u), p--;
							for (; 0 < m - p;) f = fi(f), m--;
							for (; p--;) {
								if (u === f || f !== null && u === f.alternate) break b;
								u = fi(u), f = fi(f);
							}
							u = null;
						}
						else u = null;
						c !== null && pi(o, s, c, u, !1), l !== null && d !== null && pi(o, d, l, u, !0);
					}
				}
				a: {
					if (s = r ? Ii(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var g = hr;
					else if (lr(s)) {
						if (gr) g = Tr;
						else {
							g = Cr;
							var _ = Sr;
						}
					} else (c = s.nodeName) && c.toLowerCase() === "input" && (s.type === "checkbox" || s.type === "radio") && (g = wr);
					if (g &&= g(e, r)) {
						ur(o, g, n, i);
						break a;
					}
					_ && _(e, s, r), e === "focusout" && (_ = s._wrapperState) && _.controlled && s.type === "number" && Ce(s, "number", s.value);
				}
				switch (_ = r ? Ii(r) : window, e) {
					case "focusin":
						(lr(_) || _.contentEditable === "true") && (Ir = _, Lr = r, Rr = null);
						break;
					case "focusout":
						Rr = Lr = Ir = null;
						break;
					case "mousedown":
						zr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						zr = !1, Br(o, n, i);
						break;
					case "selectionchange": if (Fr) break;
					case "keydown":
					case "keyup": Br(o, n, i);
				}
				var v;
				if (Zn) b: {
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
				else ar ? rr(e, n) && (y = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (y = "onCompositionStart");
				y && (er && n.locale !== "ko" && (ar || y !== "onCompositionStart" ? y === "onCompositionEnd" && ar && (v = Sn()) : (yn = i, bn = "value" in yn ? yn.value : yn.textContent, ar = !0)), _ = di(r, y), 0 < _.length && (y = new Bn(y, e, null, n, i), o.push({
					event: y,
					listeners: _
				}), v ? y.data = v : (v = ir(n), v !== null && (y.data = v)))), (v = $n ? or(e, n) : sr(e, n)) && (r = di(r, "onBeforeInput"), 0 < r.length && (i = new Bn("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: i,
					listeners: r
				}), i.data = v));
			}
			ii(o, t);
		});
	}
	function ui(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function di(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			i.tag === 5 && a !== null && (i = a, a = L(e, n), a != null && r.unshift(ui(e, a, i)), a = L(e, t), a != null && r.push(ui(e, a, i))), e = e.return;
		}
		return r;
	}
	function fi(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5);
		return e || null;
	}
	function pi(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (c !== null && c === r) break;
			s.tag === 5 && l !== null && (s = l, i ? (c = L(n, a), c != null && o.unshift(ui(n, c, s))) : i || (c = L(n, a), c != null && o.push(ui(n, c, s)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var mi = /\r\n?/g, hi = /\u0000|\uFFFD/g;
	function gi(e) {
		return (typeof e == "string" ? e : "" + e).replace(mi, "\n").replace(hi, "");
	}
	function _i(e, t, n) {
		if (t = gi(t), gi(e) !== t && n) throw Error(a(425));
	}
	function vi() {}
	var yi = null, bi = null;
	function xi(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var Si = typeof setTimeout == "function" ? setTimeout : void 0, Ci = typeof clearTimeout == "function" ? clearTimeout : void 0, wi = typeof Promise == "function" ? Promise : void 0, Ti = typeof queueMicrotask == "function" ? queueMicrotask : wi === void 0 ? Si : function(e) {
		return wi.resolve(null).then(e).catch(G);
	};
	function G(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function K(e, t) {
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
	function Ei(e) {
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
	function q(e) {
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
	var Di = Math.random().toString(36).slice(2), Oi = "__reactFiber$" + Di, ki = "__reactProps$" + Di, Ai = "__reactContainer$" + Di, ji = "__reactEvents$" + Di, Mi = "__reactListeners$" + Di, Ni = "__reactHandles$" + Di;
	function Pi(e) {
		var t = e[Oi];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[Ai] || n[Oi]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = q(e); e !== null;) {
					if (n = e[Oi]) return n;
					e = q(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Fi(e) {
		return e = e[Oi] || e[Ai], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
	}
	function Ii(e) {
		if (e.tag === 5 || e.tag === 6) return e.stateNode;
		throw Error(a(33));
	}
	function Li(e) {
		return e[ki] || null;
	}
	var Ri = [], zi = -1;
	function Bi(e) {
		return { current: e };
	}
	function J(e) {
		0 > zi || (e.current = Ri[zi], Ri[zi] = null, zi--);
	}
	function Y(e, t) {
		zi++, Ri[zi] = e.current, e.current = t;
	}
	var Vi = {}, Hi = Bi(Vi), Ui = Bi(!1), Wi = Vi;
	function Gi(e, t) {
		var n = e.type.contextTypes;
		if (!n) return Vi;
		var r = e.stateNode;
		if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
		var i = {}, a;
		for (a in n) i[a] = t[a];
		return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = i), i;
	}
	function Ki(e) {
		return e = e.childContextTypes, e != null;
	}
	function qi() {
		J(Ui), J(Hi);
	}
	function Ji(e, t, n) {
		if (Hi.current !== Vi) throw Error(a(168));
		Y(Hi, t), Y(Ui, n);
	}
	function Yi(e, t, n) {
		var r = e.stateNode;
		if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
		for (var i in r = r.getChildContext(), r) if (!(i in t)) throw Error(a(108, pe(e) || "Unknown", i));
		return j({}, n, r);
	}
	function Xi(e) {
		return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Vi, Wi = Hi.current, Y(Hi, e), Y(Ui, Ui.current), !0;
	}
	function Zi(e, t, n) {
		var r = e.stateNode;
		if (!r) throw Error(a(169));
		n ? (e = Yi(e, t, Wi), r.__reactInternalMemoizedMergedChildContext = e, J(Ui), J(Hi), Y(Hi, e)) : J(Ui), Y(Ui, n);
	}
	var Qi = null, $i = !1, ea = !1;
	function ta(e) {
		Qi === null ? Qi = [e] : Qi.push(e);
	}
	function na(e) {
		$i = !0, ta(e);
	}
	function ra() {
		if (!ea && Qi !== null) {
			ea = !0;
			var e = 0, t = H;
			try {
				var n = Qi;
				for (H = 1; e < n.length; e++) {
					var r = n[e];
					do
						r = r(!0);
					while (r !== null);
				}
				Qi = null, $i = !1;
			} catch (t) {
				throw Qi !== null && (Qi = Qi.slice(e + 1)), mt(bt, ra), t;
			} finally {
				H = t, ea = !1;
			}
		}
		return null;
	}
	var ia = [], aa = 0, oa = null, sa = 0, ca = [], la = 0, ua = null, da = 1, fa = "";
	function pa(e, t) {
		ia[aa++] = sa, ia[aa++] = oa, oa = e, sa = t;
	}
	function ma(e, t, n) {
		ca[la++] = da, ca[la++] = fa, ca[la++] = ua, ua = e;
		var r = da;
		e = fa;
		var i = 32 - Ot(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Ot(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, da = 1 << 32 - Ot(t) + i | n << i | r, fa = a + e;
		} else da = 1 << a | n << i | r, fa = e;
	}
	function ha(e) {
		e.return !== null && (pa(e, 1), ma(e, 1, 0));
	}
	function ga(e) {
		for (; e === oa;) oa = ia[--aa], ia[aa] = null, sa = ia[--aa], ia[aa] = null;
		for (; e === ua;) ua = ca[--la], ca[la] = null, fa = ca[--la], ca[la] = null, da = ca[--la], ca[la] = null;
	}
	var _a = null, va = null, X = !1, ya = null;
	function ba(e, t) {
		var n = Kl(5, null, null, 0);
		n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
	}
	function xa(e, t) {
		switch (e.tag) {
			case 5:
				var n = e.type;
				return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null && (e.stateNode = t, _a = e, va = Ei(t.firstChild), !0);
			case 6: return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null && (e.stateNode = t, _a = e, va = null, !0);
			case 13: return t = t.nodeType === 8 ? t : null, t !== null && (n = ua === null ? null : {
				id: da,
				overflow: fa
			}, e.memoizedState = {
				dehydrated: t,
				treeContext: n,
				retryLane: 1073741824
			}, n = Kl(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, _a = e, va = null, !0);
			default: return !1;
		}
	}
	function Sa(e) {
		return !!(e.mode & 1) && !(e.flags & 128);
	}
	function Ca(e) {
		if (X) {
			var t = va;
			if (t) {
				var n = t;
				if (!xa(e, t)) {
					if (Sa(e)) throw Error(a(418));
					t = Ei(n.nextSibling);
					var r = _a;
					t && xa(e, t) ? ba(r, n) : (e.flags = e.flags & -4097 | 2, X = !1, _a = e);
				}
			} else {
				if (Sa(e)) throw Error(a(418));
				e.flags = e.flags & -4097 | 2, X = !1, _a = e;
			}
		}
	}
	function wa(e) {
		for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;) e = e.return;
		_a = e;
	}
	function Ta(e) {
		if (e !== _a) return !1;
		if (!X) return wa(e), X = !0, !1;
		var t;
		if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !xi(e.type, e.memoizedProps)), t &&= va) {
			if (Sa(e)) throw Ea(), Error(a(418));
			for (; t;) ba(e, t), t = Ei(t.nextSibling);
		}
		if (wa(e), e.tag === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(a(317));
			a: {
				for (e = e.nextSibling, t = 0; e;) {
					if (e.nodeType === 8) {
						var n = e.data;
						if (n === "/$") {
							if (t === 0) {
								va = Ei(e.nextSibling);
								break a;
							}
							t--;
						} else n !== "$" && n !== "$!" && n !== "$?" || t++;
					}
					e = e.nextSibling;
				}
				va = null;
			}
		} else va = _a ? Ei(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Ea() {
		for (var e = va; e;) e = Ei(e.nextSibling);
	}
	function Da() {
		va = _a = null, X = !1;
	}
	function Oa(e) {
		ya === null ? ya = [e] : ya.push(e);
	}
	var ka = C.ReactCurrentBatchConfig;
	function Aa(e, t, n) {
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
	function ja(e, t) {
		throw e = Object.prototype.toString.call(t), Error(a(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
	}
	function Ma(e) {
		var t = e._init;
		return t(e._payload);
	}
	function Na(e) {
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
			return a === w ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === A && Ma(a) === t.type) ? (r = i(t, n.props), r.ref = Aa(e, t, n), r.return = e, r) : (r = Xl(n.type, n.key, n.props, null, e.mode, r), r.ref = Aa(e, t, n), r.return = e, r);
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
					case ee: return n = Xl(t.type, t.key, t.props, null, e.mode, n), n.ref = Aa(e, null, t), n.return = e, n;
					case te: return t = eu(t, e.mode, n), t.return = e, t;
					case A:
						var r = t._init;
						return f(e, r(t._payload), n);
				}
				if (we(t) || se(t)) return t = Zl(t, e.mode, n, null), t.return = e, t;
				ja(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case ee: return n.key === i ? l(e, t, n, r) : null;
					case te: return n.key === i ? u(e, t, n, r) : null;
					case A: return i = n._init, p(e, t, i(n._payload), r);
				}
				if (we(n) || se(n)) return i === null ? d(e, t, n, r, null) : null;
				ja(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case ee: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case te: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case A:
						var a = r._init;
						return m(e, t, n, a(r._payload), i);
				}
				if (we(r) || se(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				ja(t, r);
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
			if (h === s.length) return n(i, d), X && pa(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return X && pa(i, h), l;
			}
			for (d = r(i, d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), X && pa(i, h), l;
		}
		function g(i, s, c, l) {
			var u = se(c);
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
			if (v.done) return n(i, h), X && pa(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return X && pa(i, g), u;
			}
			for (h = r(i, h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), X && pa(i, g), u;
		}
		function _(e, r, a, o) {
			if (typeof a == "object" && a && a.type === w && a.key === null && (a = a.props.children), typeof a == "object" && a) {
				switch (a.$$typeof) {
					case ee:
						a: {
							for (var c = a.key, l = r; l !== null;) {
								if (l.key === c) {
									if (c = a.type, c === w) {
										if (l.tag === 7) {
											n(e, l.sibling), r = i(l, a.props.children), r.return = e, e = r;
											break a;
										}
									} else if (l.elementType === c || typeof c == "object" && c && c.$$typeof === A && Ma(c) === l.type) {
										n(e, l.sibling), r = i(l, a.props), r.ref = Aa(e, l, a), r.return = e, e = r;
										break a;
									}
									n(e, l);
									break;
								}
								t(e, l), l = l.sibling;
							}
							a.type === w ? (r = Zl(a.props.children, e.mode, o, a.key), r.return = e, e = r) : (o = Xl(a.type, a.key, a.props, null, e.mode, o), o.ref = Aa(e, r, a), o.return = e, e = o);
						}
						return s(e);
					case te:
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
					case A: return l = a._init, _(e, r, l(a._payload), o);
				}
				if (we(a)) return h(e, r, a, o);
				if (se(a)) return g(e, r, a, o);
				ja(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), r = i(r, a), r.return = e, e = r) : (n(e, r), r = $l(a, e.mode, o), r.return = e, e = r), s(e)) : n(e, r);
		}
		return _;
	}
	var Pa = Na(!0), Fa = Na(!1), Ia = Bi(null), La = null, Ra = null, za = null;
	function Ba() {
		za = Ra = La = null;
	}
	function Va(e) {
		var t = Ia.current;
		J(Ia), e._currentValue = t;
	}
	function Ha(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Ua(e, t) {
		La = e, za = Ra = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & t) !== 0 && (Ms = !0), e.firstContext = null);
	}
	function Wa(e) {
		var t = e._currentValue;
		if (za !== e) {
			if (e = {
				context: e,
				memoizedValue: t,
				next: null
			}, Ra === null) {
				if (La === null) throw Error(a(308));
				Ra = e, La.dependencies = {
					lanes: 0,
					firstContext: e
				};
			} else Ra = Ra.next = e;
		}
		return t;
	}
	var Ga = null;
	function Ka(e) {
		Ga === null ? Ga = [e] : Ga.push(e);
	}
	function qa(e, t, n, r) {
		var i = t.interleaved;
		return i === null ? (n.next = n, Ka(t)) : (n.next = i.next, i.next = n), t.interleaved = n, Ja(e, r);
	}
	function Ja(e, t) {
		e.lanes |= t;
		var n = e.alternate;
		for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null;) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
		return n.tag === 3 ? n.stateNode : null;
	}
	var Ya = !1;
	function Xa(e) {
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
	function Za(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			effects: e.effects
		});
	}
	function Qa(e, t) {
		return {
			eventTime: e,
			lane: t,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function $a(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, $ & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, Ja(e, n);
		}
		return i = r.interleaved, i === null ? (t.next = t, Ka(r)) : (t.next = i.next, i.next = t), r.interleaved = t, Ja(e, n);
	}
	function eo(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194240)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, zt(e, n);
		}
	}
	function to(e, t) {
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
		} else e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	function no(e, t, n, r) {
		var i = e.updateQueue;
		Ya = !1;
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
								d = j({}, d, f);
								break a;
							case 2: Ya = !0;
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
	function ro(e, t, n) {
		if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
			var r = e[t], i = r.callback;
			if (i !== null) {
				if (r.callback = null, r = n, typeof i != "function") throw Error(a(191, i));
				i.call(r);
			}
		}
	}
	var io = {}, ao = Bi(io), oo = Bi(io), so = Bi(io);
	function co(e) {
		if (e === io) throw Error(a(174));
		return e;
	}
	function lo(e, t) {
		switch (Y(so, t), Y(oo, e), Y(ao, io), e = t.nodeType, e) {
			case 9:
			case 11:
				t = (t = t.documentElement) ? t.namespaceURI : je(null, "");
				break;
			default: e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = je(t, e);
		}
		J(ao), Y(ao, t);
	}
	function uo() {
		J(ao), J(oo), J(so);
	}
	function fo(e) {
		co(so.current);
		var t = co(ao.current), n = je(t, e.type);
		t !== n && (Y(oo, e), Y(ao, n));
	}
	function po(e) {
		oo.current === e && (J(ao), J(oo));
	}
	var Z = Bi(0);
	function mo(e) {
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
	var ho = [];
	function go() {
		for (var e = 0; e < ho.length; e++) ho[e]._workInProgressVersionPrimary = null;
		ho.length = 0;
	}
	var _o = C.ReactCurrentDispatcher, vo = C.ReactCurrentBatchConfig, yo = 0, bo = null, xo = null, So = null, Co = !1, wo = !1, To = 0, Eo = 0;
	function Do() {
		throw Error(a(321));
	}
	function Oo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Dr(e[n], t[n])) return !1;
		return !0;
	}
	function ko(e, t, n, r, i, o) {
		if (yo = o, bo = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, _o.current = e === null || e.memoizedState === null ? fs : ps, e = n(r, i), wo) {
			o = 0;
			do {
				if (wo = !1, To = 0, 25 <= o) throw Error(a(301));
				o += 1, So = xo = null, t.updateQueue = null, _o.current = ms, e = n(r, i);
			} while (wo);
		}
		if (_o.current = ds, t = xo !== null && xo.next !== null, yo = 0, So = xo = bo = null, Co = !1, t) throw Error(a(300));
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
		return So === null ? bo.memoizedState = So = e : So = So.next = e, So;
	}
	function Mo() {
		if (xo === null) {
			var e = bo.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = xo.next;
		var t = So === null ? bo.memoizedState : So.next;
		if (t !== null) So = t, xo = e;
		else {
			if (e === null) throw Error(a(310));
			xo = e, e = {
				memoizedState: xo.memoizedState,
				baseState: xo.baseState,
				baseQueue: xo.baseQueue,
				queue: xo.queue,
				next: null
			}, So === null ? bo.memoizedState = So = e : So = So.next = e;
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
		var r = xo, i = r.baseQueue, o = n.pending;
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
				if ((yo & d) === d) l !== null && (l = l.next = {
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
					l === null ? (c = l = f, s = r) : l = l.next = f, bo.lanes |= d, Jc |= d;
				}
				u = u.next;
			} while (u !== null && u !== o);
			l === null ? s = r : l.next = c, Dr(r, t.memoizedState) || (Ms = !0), t.memoizedState = r, t.baseState = s, t.baseQueue = l, n.lastRenderedState = r;
		}
		if (e = n.interleaved, e !== null) {
			i = e;
			do
				o = i.lane, bo.lanes |= o, Jc |= o, i = i.next;
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
			Dr(o, t.memoizedState) || (Ms = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function Io() {}
	function Lo(e, t) {
		var n = bo, r = Mo(), i = t(), o = !Dr(r.memoizedState, i);
		if (o && (r.memoizedState = i, Ms = !0), r = r.queue, Yo(Bo.bind(null, n, r, e), [e]), r.getSnapshot !== t || o || So !== null && So.memoizedState.tag & 1) {
			if (n.flags |= 2048, Wo(9, zo.bind(null, n, r, i, t), void 0, null), Vc === null) throw Error(a(349));
			yo & 30 || Ro(n, t, i);
		}
		return i;
	}
	function Ro(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = bo.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, bo.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
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
			return !Dr(e, n);
		} catch {
			return !0;
		}
	}
	function Ho(e) {
		var t = Ja(e, 1);
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
		}, t.queue = e, e = e.dispatch = ss.bind(null, bo, e), [t.memoizedState, e];
	}
	function Wo(e, t, n, r) {
		return e = {
			tag: e,
			create: t,
			destroy: n,
			deps: r,
			next: null
		}, t = bo.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, bo.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
	}
	function Go() {
		return Mo().memoizedState;
	}
	function Ko(e, t, n, r) {
		var i = jo();
		bo.flags |= e, i.memoizedState = Wo(1 | t, n, void 0, r === void 0 ? null : r);
	}
	function qo(e, t, n, r) {
		var i = Mo();
		r = r === void 0 ? null : r;
		var a = void 0;
		if (xo !== null) {
			var o = xo.memoizedState;
			if (a = o.destroy, r !== null && Oo(r, o.deps)) {
				i.memoizedState = Wo(t, n, a, r);
				return;
			}
		}
		bo.flags |= e, i.memoizedState = Wo(1 | t, n, a, r);
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
		return yo & 21 ? (Dr(n, t) || (n = It(), bo.lanes |= n, Jc |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, Ms = !0), e.memoizedState = n);
	}
	function is(e, t) {
		var n = H;
		H = n !== 0 && 4 > n ? n : 4, e(!0);
		var r = vo.transition;
		vo.transition = {};
		try {
			e(!1), t();
		} finally {
			H = n, vo.transition = r;
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
		else if (n = qa(e, t, n, r), n !== null) {
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
				if (i.hasEagerState = !0, i.eagerState = s, Dr(s, o)) {
					var c = t.interleaved;
					c === null ? (i.next = i, Ka(t)) : (i.next = c.next, c.next = i), t.interleaved = i;
					return;
				}
			} catch {}
			n = qa(e, t, i, r), n !== null && (i = fl(), ml(n, e, r, i), us(n, t, r));
		}
	}
	function cs(e) {
		var t = e.alternate;
		return e === bo || t !== null && t === bo;
	}
	function ls(e, t) {
		wo = Co = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function us(e, t, n) {
		if (n & 4194240) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, zt(e, n);
		}
	}
	var ds = {
		readContext: Wa,
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
		readContext: Wa,
		useCallback: function(e, t) {
			return jo().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Wa,
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
			}, r.queue = e, e = e.dispatch = os.bind(null, bo, e), [r.memoizedState, e];
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
			var r = bo, i = jo();
			if (X) {
				if (n === void 0) throw Error(a(407));
				n = n();
			} else {
				if (n = t(), Vc === null) throw Error(a(349));
				yo & 30 || Ro(r, t, n);
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
			if (X) {
				var n = fa, r = da;
				n = (r & ~(1 << 32 - Ot(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = To++, 0 < n && (t += "H" + n.toString(32)), t += ":";
			} else n = Eo++, t = ":" + t + "r" + n.toString(32) + ":";
			return e.memoizedState = t;
		},
		unstable_isNewReconciler: !1
	}, ps = {
		readContext: Wa,
		useCallback: ts,
		useContext: Wa,
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
			return rs(Mo(), xo.memoizedState, e);
		},
		useTransition: function() {
			return [Po(No)[0], Mo().memoizedState];
		},
		useMutableSource: Io,
		useSyncExternalStore: Lo,
		useId: as,
		unstable_isNewReconciler: !1
	}, ms = {
		readContext: Wa,
		useCallback: ts,
		useContext: Wa,
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
			return xo === null ? t.memoizedState = e : rs(t, xo.memoizedState, e);
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
			for (var n in t = j({}, t), e = e.defaultProps, e) t[n] === void 0 && (t[n] = e[n]);
			return t;
		}
		return t;
	}
	function gs(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : j({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var _s = {
		isMounted: function(e) {
			return (e = e._reactInternals) ? ct(e) === e : !1;
		},
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = fl(), i = pl(e), a = Qa(r, i);
			a.payload = t, n != null && (a.callback = n), t = $a(e, a, i), t !== null && (ml(t, e, i, r), eo(t, e, i));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = fl(), i = pl(e), a = Qa(r, i);
			a.tag = 1, a.payload = t, n != null && (a.callback = n), t = $a(e, a, i), t !== null && (ml(t, e, i, r), eo(t, e, i));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = fl(), r = pl(e), i = Qa(n, r);
			i.tag = 2, t != null && (i.callback = t), t = $a(e, i, r), t !== null && (ml(t, e, r, n), eo(t, e, r));
		}
	};
	function vs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Or(n, r) || !Or(i, a) : !0;
	}
	function ys(e, t, n) {
		var r = !1, i = Vi, a = t.contextType;
		return typeof a == "object" && a ? a = Wa(a) : (i = Ki(t) ? Wi : Hi.current, r = t.contextTypes, a = (r = r != null) ? Gi(e, i) : Vi), t = new t(n, a), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = _s, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = i, e.__reactInternalMemoizedMaskedChildContext = a), t;
	}
	function bs(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && _s.enqueueReplaceState(t, t.state, null);
	}
	function xs(e, t, n, r) {
		var i = e.stateNode;
		i.props = n, i.state = e.memoizedState, i.refs = {}, Xa(e);
		var a = t.contextType;
		typeof a == "object" && a ? i.context = Wa(a) : (a = Ki(t) ? Wi : Hi.current, i.context = Gi(e, a)), i.state = e.memoizedState, a = t.getDerivedStateFromProps, typeof a == "function" && (gs(e, t, a, n), i.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), t !== i.state && _s.enqueueReplaceState(i, i.state, null), no(e, n, i, r), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.flags |= 4194308);
	}
	function Ss(e, t) {
		try {
			var n = "", r = t;
			do
				n += fe(r), r = r.return;
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
		n = Qa(-1, n), n.tag = 3, n.payload = { element: null };
		var r = t.value;
		return n.callback = function() {
			nl || (nl = !0, rl = r), ws(e, t);
		}, n;
	}
	function Ds(e, t, n) {
		n = Qa(-1, n), n.tag = 3;
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
		return e.mode & 1 ? (e.flags |= 65536, e.lanes = i, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = Qa(-1, 1), t.tag = 2, $a(n, t, 1))), n.lanes |= 1), e);
	}
	var js = C.ReactCurrentOwner, Ms = !1;
	function Ns(e, t, n, r) {
		t.child = e === null ? Fa(t, null, n, r) : Pa(t, e.child, n, r);
	}
	function Ps(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		return Ua(t, i), r = ko(e, t, n, r, a, i), n = Ao(), e !== null && !Ms ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, ec(e, t, i)) : (X && n && ha(t), t.flags |= 1, Ns(e, t, r, i), t.child);
	}
	function Fs(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ql(a) && a.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = a, Is(e, t, a, r, i)) : (e = Xl(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, (e.lanes & i) === 0) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Or : n, n(o, r) && e.ref === t.ref) return ec(e, t, i);
		}
		return t.flags |= 1, e = Yl(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Is(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Or(a, r) && e.ref === t.ref) {
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
			}, Y(Gc, Wc), Wc |= n;
			else {
				if (!(n & 1073741824)) return e = a === null ? n : a.baseLanes | n, t.lanes = t.childLanes = 1073741824, t.memoizedState = {
					baseLanes: e,
					cachePool: null,
					transitions: null
				}, t.updateQueue = null, Y(Gc, Wc), Wc |= e, null;
				t.memoizedState = {
					baseLanes: 0,
					cachePool: null,
					transitions: null
				}, r = a === null ? n : a.baseLanes, Y(Gc, Wc), Wc |= r;
			}
		} else a === null ? r = n : (r = a.baseLanes | n, t.memoizedState = null), Y(Gc, Wc), Wc |= r;
		return Ns(e, t, i, n), t.child;
	}
	function Rs(e, t) {
		var n = t.ref;
		(e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
	}
	function zs(e, t, n, r, i) {
		var a = Ki(n) ? Wi : Hi.current;
		return a = Gi(t, a), Ua(t, i), n = ko(e, t, n, r, a, i), r = Ao(), e !== null && !Ms ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, ec(e, t, i)) : (X && r && ha(t), t.flags |= 1, Ns(e, t, n, i), t.child);
	}
	function Bs(e, t, n, r, i) {
		if (Ki(n)) {
			var a = !0;
			Xi(t);
		} else a = !1;
		if (Ua(t, i), t.stateNode === null) $s(e, t), ys(t, n, r), xs(t, n, r, i), r = !0;
		else if (e === null) {
			var o = t.stateNode, s = t.memoizedProps;
			o.props = s;
			var c = o.context, l = n.contextType;
			typeof l == "object" && l ? l = Wa(l) : (l = Ki(n) ? Wi : Hi.current, l = Gi(t, l));
			var u = n.getDerivedStateFromProps, d = typeof u == "function" || typeof o.getSnapshotBeforeUpdate == "function";
			d || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== r || c !== l) && bs(t, o, r, l), Ya = !1;
			var f = t.memoizedState;
			o.state = f, no(t, r, o, i), c = t.memoizedState, s !== r || f !== c || Ui.current || Ya ? (typeof u == "function" && (gs(t, n, u, r), c = t.memoizedState), (s = Ya || vs(t, n, s, r, f, c, l)) ? (d || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = c), o.props = r, o.state = c, o.context = l, r = s) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			o = t.stateNode, Za(e, t), s = t.memoizedProps, l = t.type === t.elementType ? s : hs(t.type, s), o.props = l, d = t.pendingProps, f = o.context, c = n.contextType, typeof c == "object" && c ? c = Wa(c) : (c = Ki(n) ? Wi : Hi.current, c = Gi(t, c));
			var p = n.getDerivedStateFromProps;
			(u = typeof p == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== d || f !== c) && bs(t, o, r, c), Ya = !1, f = t.memoizedState, o.state = f, no(t, r, o, i);
			var m = t.memoizedState;
			s !== d || f !== m || Ui.current || Ya ? (typeof p == "function" && (gs(t, n, p, r), m = t.memoizedState), (l = Ya || vs(t, n, l, r, f, m, c) || !1) ? (u || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, m, c), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, m, c)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = m), o.props = r, o.state = m, o.context = c, r = l) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return Vs(e, t, n, r, a, i);
	}
	function Vs(e, t, n, r, i, a) {
		Rs(e, t);
		var o = !!(t.flags & 128);
		if (!r && !o) return i && Zi(t, n, !1), ec(e, t, a);
		r = t.stateNode, js.current = t;
		var s = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
		return t.flags |= 1, e !== null && o ? (t.child = Pa(t, e.child, null, a), t.child = Pa(t, null, s, a)) : Ns(e, t, s, a), t.memoizedState = r.state, i && Zi(t, n, !0), t.child;
	}
	function Hs(e) {
		var t = e.stateNode;
		t.pendingContext ? Ji(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Ji(e, t.context, !1), lo(e, t.containerInfo);
	}
	function Us(e, t, n, r, i) {
		return Da(), Oa(i), t.flags |= 256, Ns(e, t, n, r), t.child;
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
		var r = t.pendingProps, i = Z.current, a = !1, o = !!(t.flags & 128), s;
		if ((s = o) || (s = e !== null && e.memoizedState === null ? !1 : !!(i & 2)), s ? (a = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (i |= 1), Y(Z, i & 1), e === null) return Ca(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.lanes = t.mode & 1 ? e.data === "$!" ? 8 : 1073741824 : 1, null) : (o = r.children, e = r.fallback, a ? (r = t.mode, a = t.child, o = {
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
		return r !== null && Oa(r), Pa(t, e.child, null, n), e = qs(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Ys(e, t, n, r, i, o, s) {
		if (n) return t.flags & 256 ? (t.flags &= -257, r = Cs(Error(a(422))), Js(e, t, s, r)) : t.memoizedState === null ? (o = r.fallback, i = t.mode, r = Ql({
			mode: "visible",
			children: r.children
		}, i, 0, null), o = Zl(o, i, s, null), o.flags |= 2, r.return = t, o.return = t, r.sibling = o, t.child = r, t.mode & 1 && Pa(t, e.child, null, s), t.child.memoizedState = Gs(s), t.memoizedState = Ws, o) : (t.child = e.child, t.flags |= 128, null);
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
				i = (i & (r.suspendedLanes | s)) === 0 ? i : 0, i !== 0 && i !== o.retryLane && (o.retryLane = i, Ja(e, i), ml(r, e, i, -1));
			}
			return Ol(), r = Cs(Error(a(421))), Js(e, t, s, r);
		}
		return i.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Vl.bind(null, e), i._reactRetry = t, null) : (e = o.treeContext, va = Ei(i.nextSibling), _a = t, X = !0, ya = null, e !== null && (ca[la++] = da, ca[la++] = fa, ca[la++] = ua, da = e.id, fa = e.overflow, ua = t), t = qs(t, r.children), t.flags |= 4096, t);
	}
	function Xs(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Ha(e.return, t, n);
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
		if (Ns(e, t, r.children, n), r = Z.current, r & 2) r = r & 1 | 2, t.flags |= 128;
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
		if (Y(Z, r), !(t.mode & 1)) t.memoizedState = null;
		else switch (i) {
			case "forwards":
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && mo(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), Zs(t, !1, i, n, a);
				break;
			case "backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && mo(e) === null) {
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
				Hs(t), Da();
				break;
			case 5:
				fo(t);
				break;
			case 1:
				Ki(t.type) && Xi(t);
				break;
			case 4:
				lo(t, t.stateNode.containerInfo);
				break;
			case 10:
				var r = t.type._context, i = t.memoizedProps.value;
				Y(Ia, r._currentValue), r._currentValue = i;
				break;
			case 13:
				if (r = t.memoizedState, r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (Y(Z, Z.current & 1), e = ec(e, t, n), e === null ? null : e.sibling) : Ks(e, t, n) : (Y(Z, Z.current & 1), t.flags |= 128, null);
				Y(Z, Z.current & 1);
				break;
			case 19:
				if (r = (n & t.childLanes) !== 0, e.flags & 128) {
					if (r) return Qs(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Y(Z, Z.current), r) break;
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
			e = t.stateNode, co(ao.current);
			var a = null;
			switch (n) {
				case "input":
					i = ve(e, i), r = ve(e, r), a = [];
					break;
				case "select":
					i = j({}, i, { value: void 0 }), r = j({}, r, { value: void 0 }), a = [];
					break;
				case "textarea":
					i = Ee(e, i), r = Ee(e, r), a = [];
					break;
				default: typeof i.onClick != "function" && typeof r.onClick == "function" && (e.onclick = vi);
			}
			Be(n, r);
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
					} else u === "dangerouslySetInnerHTML" ? (l = l ? l.__html : void 0, c = c ? c.__html : void 0, l != null && c !== l && (a ||= []).push(u, l)) : u === "children" ? typeof l != "string" && typeof l != "number" || (a ||= []).push(u, "" + l) : u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && (s.hasOwnProperty(u) ? (l != null && u === "onScroll" && W("scroll", e), a || c === l || (a = [])) : (a ||= []).push(u, l));
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
		if (!X) switch (e.tailMode) {
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
		switch (ga(t), t.tag) {
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
			case 1: return Ki(t.type) && qi(), oc(t), null;
			case 3: return r = t.stateNode, uo(), J(Ui), J(Hi), go(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Ta(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, ya !== null && (vl(ya), ya = null))), oc(t), null;
			case 5:
				po(t);
				var i = co(so.current);
				if (n = t.type, e !== null && t.stateNode != null) rc(e, t, n, r, i), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(a(166));
						return oc(t), null;
					}
					if (e = co(ao.current), Ta(t)) {
						r = t.stateNode, n = t.type;
						var o = t.memoizedProps;
						switch (r[Oi] = t, r[ki] = o, e = !!(t.mode & 1), n) {
							case "dialog":
								W("cancel", r), W("close", r);
								break;
							case "iframe":
							case "object":
							case "embed":
								W("load", r);
								break;
							case "video":
							case "audio":
								for (i = 0; i < ti.length; i++) W(ti[i], r);
								break;
							case "source":
								W("error", r);
								break;
							case "img":
							case "image":
							case "link":
								W("error", r), W("load", r);
								break;
							case "details":
								W("toggle", r);
								break;
							case "input":
								ye(r, o), W("invalid", r);
								break;
							case "select":
								r._wrapperState = { wasMultiple: !!o.multiple }, W("invalid", r);
								break;
							case "textarea": De(r, o), W("invalid", r);
						}
						for (var c in Be(n, o), i = null, o) if (o.hasOwnProperty(c)) {
							var l = o[c];
							c === "children" ? typeof l == "string" ? r.textContent !== l && (!0 !== o.suppressHydrationWarning && _i(r.textContent, l, e), i = ["children", l]) : typeof l == "number" && r.textContent !== "" + l && (!0 !== o.suppressHydrationWarning && _i(r.textContent, l, e), i = ["children", "" + l]) : s.hasOwnProperty(c) && l != null && c === "onScroll" && W("scroll", r);
						}
						switch (n) {
							case "input":
								ge(r), Se(r, o, !0);
								break;
							case "textarea":
								ge(r), ke(r);
								break;
							case "select":
							case "option": break;
							default: typeof o.onClick == "function" && (r.onclick = vi);
						}
						r = i, t.updateQueue = r, r !== null && (t.flags |= 4);
					} else {
						c = i.nodeType === 9 ? i : i.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Ae(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = c.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = c.createElement(n, { is: r.is }) : (e = c.createElement(n), n === "select" && (c = e, r.multiple ? c.multiple = !0 : r.size && (c.size = r.size))) : e = c.createElementNS(e, n), e[Oi] = t, e[ki] = r, nc(e, t, !1, !1), t.stateNode = e;
						a: {
							switch (c = Ve(n, r), n) {
								case "dialog":
									W("cancel", e), W("close", e), i = r;
									break;
								case "iframe":
								case "object":
								case "embed":
									W("load", e), i = r;
									break;
								case "video":
								case "audio":
									for (i = 0; i < ti.length; i++) W(ti[i], e);
									i = r;
									break;
								case "source":
									W("error", e), i = r;
									break;
								case "img":
								case "image":
								case "link":
									W("error", e), W("load", e), i = r;
									break;
								case "details":
									W("toggle", e), i = r;
									break;
								case "input":
									ye(e, r), i = ve(e, r), W("invalid", e);
									break;
								case "option":
									i = r;
									break;
								case "select":
									e._wrapperState = { wasMultiple: !!r.multiple }, i = j({}, r, { value: void 0 }), W("invalid", e);
									break;
								case "textarea":
									De(e, r), i = Ee(e, r), W("invalid", e);
									break;
								default: i = r;
							}
							for (o in Be(n, i), l = i, l) if (l.hasOwnProperty(o)) {
								var u = l[o];
								o === "style" ? Re(e, u) : o === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Ne(e, u)) : o === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && Pe(e, u) : typeof u == "number" && Pe(e, "" + u) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (s.hasOwnProperty(o) ? u != null && o === "onScroll" && W("scroll", e) : u != null && S(e, o, u, c));
							}
							switch (n) {
								case "input":
									ge(e), Se(e, r, !1);
									break;
								case "textarea":
									ge(e), ke(e);
									break;
								case "option":
									r.value != null && e.setAttribute("value", "" + me(r.value));
									break;
								case "select":
									e.multiple = !!r.multiple, o = r.value, o == null ? r.defaultValue != null && Te(e, !!r.multiple, r.defaultValue, !0) : Te(e, !!r.multiple, o, !1);
									break;
								default: typeof i.onClick == "function" && (e.onclick = vi);
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
					if (n = co(so.current), co(ao.current), Ta(t)) {
						if (r = t.stateNode, n = t.memoizedProps, r[Oi] = t, (o = r.nodeValue !== n) && (e = _a, e !== null)) switch (e.tag) {
							case 3:
								_i(r.nodeValue, n, !!(e.mode & 1));
								break;
							case 5: !0 !== e.memoizedProps.suppressHydrationWarning && _i(r.nodeValue, n, !!(e.mode & 1));
						}
						o && (t.flags |= 4);
					} else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Oi] = t, t.stateNode = r;
				}
				return oc(t), null;
			case 13:
				if (J(Z), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (X && va !== null && t.mode & 1 && !(t.flags & 128)) Ea(), Da(), t.flags |= 98560, o = !1;
					else if (o = Ta(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!o) throw Error(a(318));
							if (o = t.memoizedState, o = o === null ? null : o.dehydrated, !o) throw Error(a(317));
							o[Oi] = t;
						} else Da(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						oc(t), o = !1;
					} else ya !== null && (vl(ya), ya = null), o = !0;
					if (!o) return t.flags & 65536 ? t : null;
				}
				return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || Z.current & 1 ? Kc === 0 && (Kc = 3) : Ol())), t.updateQueue !== null && (t.flags |= 4), oc(t), null);
			case 4: return uo(), e === null && si(t.stateNode.containerInfo), oc(t), null;
			case 10: return Va(t.type._context), oc(t), null;
			case 17: return Ki(t.type) && qi(), oc(t), null;
			case 19:
				if (J(Z), o = t.memoizedState, o === null) return oc(t), null;
				if (r = !!(t.flags & 128), c = o.rendering, c === null) {
					if (r) ac(o, !1);
					else {
						if (Kc !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (c = mo(e), c !== null) {
								for (t.flags |= 128, ac(o, !1), r = c.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null;) o = n, e = r, o.flags &= 14680066, c = o.alternate, c === null ? (o.childLanes = 0, o.lanes = e, o.child = null, o.subtreeFlags = 0, o.memoizedProps = null, o.memoizedState = null, o.updateQueue = null, o.dependencies = null, o.stateNode = null) : (o.childLanes = c.childLanes, o.lanes = c.lanes, o.child = c.child, o.subtreeFlags = 0, o.deletions = null, o.memoizedProps = c.memoizedProps, o.memoizedState = c.memoizedState, o.updateQueue = c.updateQueue, o.type = c.type, e = c.dependencies, o.dependencies = e === null ? null : {
									lanes: e.lanes,
									firstContext: e.firstContext
								}), n = n.sibling;
								return Y(Z, Z.current & 1 | 2), t.child;
							}
							e = e.sibling;
						}
						o.tail !== null && vt() > el && (t.flags |= 128, r = !0, ac(o, !1), t.lanes = 4194304);
					}
				} else {
					if (!r) {
						if (e = mo(c), e !== null) {
							if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), ac(o, !0), o.tail === null && o.tailMode === "hidden" && !c.alternate && !X) return oc(t), null;
						} else 2 * vt() - o.renderingStartTime > el && n !== 1073741824 && (t.flags |= 128, r = !0, ac(o, !1), t.lanes = 4194304);
					}
					o.isBackwards ? (c.sibling = t.child, t.child = c) : (n = o.last, n === null ? t.child = c : n.sibling = c, o.last = c);
				}
				return o.tail === null ? (oc(t), null) : (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = vt(), t.sibling = null, n = Z.current, Y(Z, r ? n & 1 | 2 : n & 1), t);
			case 22:
			case 23: return wl(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Wc & 1073741824 && (oc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : oc(t), null;
			case 24: return null;
			case 25: return null;
		}
		throw Error(a(156, t.tag));
	}
	function cc(e, t) {
		switch (ga(t), t.tag) {
			case 1: return Ki(t.type) && qi(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return uo(), J(Ui), J(Hi), go(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 5: return po(t), null;
			case 13:
				if (J(Z), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(a(340));
					Da();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return J(Z), null;
			case 4: return uo(), null;
			case 10: return Va(t.type._context), null;
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
		if (yi = fn, e = Mr(), Nr(e)) {
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
		for (bi = {
			focusedElem: e,
			selectionRange: n
		}, fn = !1, Q = t; Q !== null;) if (t = Q, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, Q = e;
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
		t !== null && (e.alternate = null, yc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Oi], delete t[ki], delete t[ji], delete t[Mi], delete t[Ni])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
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
		if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = vi));
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
		if (Et && typeof Et.onCommitFiberUnmount == "function") try {
			Et.onCommitFiberUnmount(Tt, n);
		} catch {}
		switch (n.tag) {
			case 5: uc || fc(n, t);
			case 6:
				var r = wc, i = Tc;
				wc = null, Ec(e, t, n), wc = r, Tc = i, wc !== null && (Tc ? (e = wc, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : wc.removeChild(n.stateNode));
				break;
			case 18:
				wc !== null && (Tc ? (e = wc, n = n.stateNode, e.nodeType === 8 ? K(e.parentNode, n) : e.nodeType === 1 && K(e, n), un(e)) : K(wc, n.stateNode));
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
						Pe(i, "");
					} catch (t) {
						Rl(e, e.return, t);
					}
				}
				if (r & 4 && (i = e.stateNode, i != null)) {
					var o = e.memoizedProps, s = n === null ? o : n.memoizedProps, c = e.type, l = e.updateQueue;
					if (e.updateQueue = null, l !== null) try {
						c === "input" && o.type === "radio" && o.name != null && be(i, o), Ve(c, s);
						var u = Ve(c, o);
						for (s = 0; s < l.length; s += 2) {
							var d = l[s], f = l[s + 1];
							d === "style" ? Re(i, f) : d === "dangerouslySetInnerHTML" ? Ne(i, f) : d === "children" ? Pe(i, f) : S(i, d, f, u);
						}
						switch (c) {
							case "input":
								xe(i, o);
								break;
							case "textarea":
								Oe(i, o);
								break;
							case "select":
								var p = i._wrapperState.wasMultiple;
								i._wrapperState.wasMultiple = !!o.multiple;
								var m = o.value;
								m == null ? p !== !!o.multiple && (o.defaultValue == null ? Te(i, !!o.multiple, o.multiple ? [] : "", !1) : Te(i, !!o.multiple, o.defaultValue, !0)) : Te(i, !!o.multiple, m, !1);
						}
						i[ki] = o;
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
					un(t.containerInfo);
				} catch (t) {
					Rl(e, e.return, t);
				}
				break;
			case 4:
				kc(t, e), jc(e);
				break;
			case 13:
				kc(t, e), jc(e), i = e.child, i.flags & 8192 && (o = i.memoizedState !== null, i.stateNode.isHidden = o, !o || i.alternate !== null && i.alternate.memoizedState !== null || ($c = vt())), r & 4 && Oc(e);
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
									i = f.stateNode, u ? (o = i.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (c = f.stateNode, l = f.memoizedProps.style, s = l != null && l.hasOwnProperty("display") ? l.display : null, c.style.display = Le("display", s));
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
						r.flags & 32 && (Pe(i, ""), r.flags &= -33), Cc(e, xc(e), i);
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
							o !== null && ro(t, o, r);
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
								ro(t, s, n);
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
	var Lc = Math.ceil, Rc = C.ReactCurrentDispatcher, zc = C.ReactCurrentOwner, Bc = C.ReactCurrentBatchConfig, $ = 0, Vc = null, Hc = null, Uc = 0, Wc = 0, Gc = Bi(0), Kc = 0, qc = null, Jc = 0, Yc = 0, Xc = 0, Zc = null, Qc = null, $c = 0, el = Infinity, tl = null, nl = !1, rl = null, il = null, al = !1, ol = null, sl = 0, cl = 0, ll = null, ul = -1, dl = 0;
	function fl() {
		return $ & 6 ? vt() : ul === -1 ? ul = vt() : ul;
	}
	function pl(e) {
		return e.mode & 1 ? $ & 2 && Uc !== 0 ? Uc & -Uc : ka.transition === null ? (e = H, e === 0 && (e = window.event, e = e === void 0 ? 16 : vn(e.type)), e) : (dl === 0 && (dl = It()), dl) : 1;
	}
	function ml(e, t, n, r) {
		if (50 < cl) throw cl = 0, ll = null, Error(a(185));
		Rt(e, n, r), $ & 2 && e === Vc || (e === Vc && (!($ & 2) && (Yc |= n), Kc === 4 && bl(e, Uc)), hl(e, r), n === 1 && $ === 0 && !(t.mode & 1) && (el = vt() + 500, $i && ra()));
	}
	function hl(e, t) {
		var n = e.callbackNode;
		Pt(e, t);
		var r = Mt(e, e === Vc ? Uc : 0);
		if (r === 0) n !== null && ht(n), e.callbackNode = null, e.callbackPriority = 0;
		else if (t = r & -r, e.callbackPriority !== t) {
			if (n != null && ht(n), t === 1) e.tag === 0 ? na(xl.bind(null, e)) : ta(xl.bind(null, e)), Ti(function() {
				!($ & 6) && ra();
			}), n = null;
			else {
				switch (Bt(r)) {
					case 1:
						n = bt;
						break;
					case 4:
						n = xt;
						break;
					case 16:
						n = St;
						break;
					case 536870912:
						n = wt;
						break;
					default: n = St;
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
		var r = Mt(e, e === Vc ? Uc : 0);
		if (r === 0) return null;
		if (r & 30 || (r & e.expiredLanes) !== 0 || t) t = kl(e, r);
		else {
			t = r;
			var i = $;
			$ |= 2;
			var o = Dl();
			(Vc !== e || Uc !== t) && (tl = null, el = vt() + 500, Tl(e, t));
			do
				try {
					jl();
					break;
				} catch (t) {
					El(e, t);
				}
			while (1);
			Ba(), Rc.current = o, $ = i, Hc === null ? (Vc = null, Uc = 0, t = Kc) : t = 0;
		}
		if (t !== 0) {
			if (t === 2 && (i = Ft(e), i !== 0 && (r = i, t = _l(e, i))), t === 1) throw n = qc, Tl(e, 0), bl(e, r), hl(e, vt()), n;
			if (t === 6) bl(e, r);
			else {
				if (i = e.current.alternate, !(r & 30) && !yl(i) && (t = kl(e, r), t === 2 && (o = Ft(e), o !== 0 && (r = o, t = _l(e, o))), t === 1)) throw n = qc, Tl(e, 0), bl(e, r), hl(e, vt()), n;
				switch (e.finishedWork = i, e.finishedLanes = r, t) {
					case 0:
					case 1: throw Error(a(345));
					case 2:
						Pl(e, Qc, tl);
						break;
					case 3:
						if (bl(e, r), (r & 130023424) === r && (t = $c + 500 - vt(), 10 < t)) {
							if (Mt(e, 0) !== 0) break;
							if (i = e.suspendedLanes, (i & r) !== r) {
								fl(), e.pingedLanes |= e.suspendedLanes & i;
								break;
							}
							e.timeoutHandle = Si(Pl.bind(null, e, Qc, tl), t);
							break;
						}
						Pl(e, Qc, tl);
						break;
					case 4:
						if (bl(e, r), (r & 4194240) === r) break;
						for (t = e.eventTimes, i = -1; 0 < r;) {
							var s = 31 - Ot(r);
							o = 1 << s, s = t[s], s > i && (i = s), r &= ~o;
						}
						if (r = i, r = vt() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Lc(r / 1960)) - r, 10 < r) {
							e.timeoutHandle = Si(Pl.bind(null, e, Qc, tl), r);
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
		return hl(e, vt()), e.callbackNode === n ? gl.bind(null, e) : null;
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
						if (!Dr(a(), i)) return !1;
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
			var n = 31 - Ot(t), r = 1 << n;
			e[n] = -1, t &= ~r;
		}
	}
	function xl(e) {
		if ($ & 6) throw Error(a(327));
		Il();
		var t = Mt(e, 0);
		if (!(t & 1)) return hl(e, vt()), null;
		var n = kl(e, t);
		if (e.tag !== 0 && n === 2) {
			var r = Ft(e);
			r !== 0 && (t = r, n = _l(e, r));
		}
		if (n === 1) throw n = qc, Tl(e, 0), bl(e, t), hl(e, vt()), n;
		if (n === 6) throw Error(a(345));
		return e.finishedWork = e.current.alternate, e.finishedLanes = t, Pl(e, Qc, tl), hl(e, vt()), null;
	}
	function Sl(e, t) {
		var n = $;
		$ |= 1;
		try {
			return e(t);
		} finally {
			$ = n, $ === 0 && (el = vt() + 500, $i && ra());
		}
	}
	function Cl(e) {
		ol !== null && ol.tag === 0 && !($ & 6) && Il();
		var t = $;
		$ |= 1;
		var n = Bc.transition, r = H;
		try {
			if (Bc.transition = null, H = 1, e) return e();
		} finally {
			H = r, Bc.transition = n, $ = t, !($ & 6) && ra();
		}
	}
	function wl() {
		Wc = Gc.current, J(Gc);
	}
	function Tl(e, t) {
		e.finishedWork = null, e.finishedLanes = 0;
		var n = e.timeoutHandle;
		if (n !== -1 && (e.timeoutHandle = -1, Ci(n)), Hc !== null) for (n = Hc.return; n !== null;) {
			var r = n;
			switch (ga(r), r.tag) {
				case 1:
					r = r.type.childContextTypes, r != null && qi();
					break;
				case 3:
					uo(), J(Ui), J(Hi), go();
					break;
				case 5:
					po(r);
					break;
				case 4:
					uo();
					break;
				case 13:
					J(Z);
					break;
				case 19:
					J(Z);
					break;
				case 10:
					Va(r.type._context);
					break;
				case 22:
				case 23: wl();
			}
			n = n.return;
		}
		if (Vc = e, Hc = e = Yl(e.current, null), Uc = Wc = t, Kc = 0, qc = null, Xc = Yc = Jc = 0, Qc = Zc = null, Ga !== null) {
			for (t = 0; t < Ga.length; t++) if (n = Ga[t], r = n.interleaved, r !== null) {
				n.interleaved = null;
				var i = r.next, a = n.pending;
				if (a !== null) {
					var o = a.next;
					a.next = i, r.next = o;
				}
				n.pending = r;
			}
			Ga = null;
		}
		return e;
	}
	function El(e, t) {
		do {
			var n = Hc;
			try {
				if (Ba(), _o.current = ds, Co) {
					for (var r = bo.memoizedState; r !== null;) {
						var i = r.queue;
						i !== null && (i.pending = null), r = r.next;
					}
					Co = !1;
				}
				if (yo = 0, So = xo = bo = null, wo = !1, To = 0, zc.current = null, n === null || n.return === null) {
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
					} else if (X && c.mode & 1) {
						var _ = ks(s);
						if (_ !== null) {
							!(_.flags & 65536) && (_.flags |= 256), As(_, s, c, o, t), Oa(Ss(l, c));
							break a;
						}
					}
					o = l = Ss(l, c), Kc !== 4 && (Kc = 2), Zc === null ? Zc = [o] : Zc.push(o), o = s;
					do {
						switch (o.tag) {
							case 3:
								o.flags |= 65536, t &= -t, o.lanes |= t;
								var v = Es(o, l, t);
								to(o, v);
								break a;
							case 1:
								c = l;
								var y = o.type, b = o.stateNode;
								if (!(o.flags & 128) && (typeof y.getDerivedStateFromError == "function" || b !== null && typeof b.componentDidCatch == "function" && (il === null || !il.has(b)))) {
									o.flags |= 65536, t &= -t, o.lanes |= t;
									var x = Ds(o, c, t);
									to(o, x);
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
		if (Ba(), $ = n, Rc.current = r, Hc !== null) throw Error(a(261));
		return Vc = null, Uc = 0, Kc;
	}
	function Al() {
		for (; Hc !== null;) Ml(Hc);
	}
	function jl() {
		for (; Hc !== null && !gt();) Ml(Hc);
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
		var r = H, i = Bc.transition;
		try {
			Bc.transition = null, H = 1, Fl(e, t, n, r);
		} finally {
			Bc.transition = i, H = r;
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
		if (V(e, o), e === Vc && (Hc = Vc = null, Uc = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || al || (al = !0, Wl(St, function() {
			return Il(), null;
		})), o = !!(n.flags & 15990), n.subtreeFlags & 15990 || o) {
			o = Bc.transition, Bc.transition = null;
			var s = H;
			H = 1;
			var c = $;
			$ |= 4, zc.current = null, hc(e, n), Ac(n, e), Pr(bi), fn = !!yi, bi = yi = null, e.current = n, Mc(n, e, i), _t(), $ = c, H = s, Bc.transition = o;
		} else e.current = n;
		if (al && (al = !1, ol = e, sl = i), o = e.pendingLanes, o === 0 && (il = null), Dt(n.stateNode, r), hl(e, vt()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) i = t[n], r(i.value, {
			componentStack: i.stack,
			digest: i.digest
		});
		if (nl) throw nl = !1, e = rl, rl = null, e;
		return sl & 1 && e.tag !== 0 && Il(), o = e.pendingLanes, o & 1 ? e === ll ? cl++ : (cl = 0, ll = e) : cl = 0, ra(), null;
	}
	function Il() {
		if (ol !== null) {
			var e = Bt(sl), t = Bc.transition, n = H;
			try {
				if (Bc.transition = null, H = 16 > e ? 16 : e, ol === null) var r = !1;
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
					if ($ = i, ra(), Et && typeof Et.onPostCommitFiberRoot == "function") try {
						Et.onPostCommitFiberRoot(Tt, e);
					} catch {}
					r = !0;
				}
				return r;
			} finally {
				H = n, Bc.transition = t;
			}
		}
		return !1;
	}
	function Ll(e, t, n) {
		t = Ss(n, t), t = Es(e, t, 1), e = $a(e, t, 1), t = fl(), e !== null && (Rt(e, 1, t), hl(e, t));
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
					e = Ss(n, e), e = Ds(t, e, 1), t = $a(t, e, 1), e = fl(), t !== null && (Rt(t, 1, e), hl(t, e));
					break;
				}
			}
			t = t.return;
		}
	}
	function zl(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), t = fl(), e.pingedLanes |= e.suspendedLanes & n, Vc === e && (Uc & n) === n && (Kc === 4 || Kc === 3 && (Uc & 130023424) === Uc && 500 > vt() - $c ? Tl(e, 0) : Xc |= n), hl(e, t);
	}
	function Bl(e, t) {
		t === 0 && (e.mode & 1 ? (t = jt, jt <<= 1, !(jt & 130023424) && (jt = 4194304)) : t = 1);
		var n = fl();
		e = Ja(e, t), e !== null && (Rt(e, t, n), hl(e, n));
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
			if (e.memoizedProps !== t.pendingProps || Ui.current) Ms = !0;
			else {
				if ((e.lanes & n) === 0 && !(t.flags & 128)) return Ms = !1, tc(e, t, n);
				Ms = !!(e.flags & 131072);
			}
		} else Ms = !1, X && t.flags & 1048576 && ma(t, sa, t.index);
		switch (t.lanes = 0, t.tag) {
			case 2:
				var r = t.type;
				$s(e, t), e = t.pendingProps;
				var i = Gi(t, Hi.current);
				Ua(t, n), i = ko(null, t, r, e, i, n);
				var o = Ao();
				return t.flags |= 1, typeof i == "object" && i && typeof i.render == "function" && i.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Ki(r) ? (o = !0, Xi(t)) : o = !1, t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, Xa(t), i.updater = _s, t.stateNode = i, i._reactInternals = t, xs(t, r, e, n), t = Vs(null, t, r, !0, o, n)) : (t.tag = 0, X && o && ha(t), Ns(null, t, i, n), t = t.child), t;
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
					r = t.pendingProps, o = t.memoizedState, i = o.element, Za(e, t), no(t, r, null, n);
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
						for (va = Ei(t.stateNode.containerInfo.firstChild), _a = t, X = !0, ya = null, n = Fa(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					} else {
						if (Da(), r === i) {
							t = ec(e, t, n);
							break a;
						}
						Ns(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 5: return fo(t), e === null && Ca(t), r = t.type, i = t.pendingProps, o = e === null ? null : e.memoizedProps, s = i.children, xi(r, i) ? s = null : o !== null && xi(r, o) && (t.flags |= 32), Rs(e, t), Ns(e, t, s, n), t.child;
			case 6: return e === null && Ca(t), null;
			case 13: return Ks(e, t, n);
			case 4: return lo(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Pa(t, null, r, n) : Ns(e, t, r, n), t.child;
			case 11: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : hs(r, i), Ps(e, t, r, i, n);
			case 7: return Ns(e, t, t.pendingProps, n), t.child;
			case 8: return Ns(e, t, t.pendingProps.children, n), t.child;
			case 12: return Ns(e, t, t.pendingProps.children, n), t.child;
			case 10:
				a: {
					if (r = t.type._context, i = t.pendingProps, o = t.memoizedProps, s = i.value, Y(Ia, r._currentValue), r._currentValue = s, o !== null) {
						if (Dr(o.value, s)) {
							if (o.children === i.children && !Ui.current) {
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
											l = Qa(-1, n & -n), l.tag = 2;
											var u = o.updateQueue;
											if (u !== null) {
												u = u.shared;
												var d = u.pending;
												d === null ? l.next = l : (l.next = d.next, d.next = l), u.pending = l;
											}
										}
										o.lanes |= n, l = o.alternate, l !== null && (l.lanes |= n), Ha(o.return, n, t), c.lanes |= n;
										break;
									}
									l = l.next;
								}
							} else if (o.tag === 10) s = o.type === t.type ? null : o.child;
							else if (o.tag === 18) {
								if (s = o.return, s === null) throw Error(a(341));
								s.lanes |= n, c = s.alternate, c !== null && (c.lanes |= n), Ha(s, n, t), s = o.sibling;
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
			case 9: return i = t.type, r = t.pendingProps.children, Ua(t, n), i = Wa(i), r = r(i), t.flags |= 1, Ns(e, t, r, n), t.child;
			case 14: return r = t.type, i = hs(r, t.pendingProps), i = hs(r.type, i), Fs(e, t, r, i, n);
			case 15: return Is(e, t, t.type, t.pendingProps, n);
			case 17: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : hs(r, i), $s(e, t), t.tag = 1, Ki(r) ? (e = !0, Xi(t)) : e = !1, Ua(t, n), ys(t, r, i), xs(t, r, i, n), Vs(null, t, r, !0, e, n);
			case 19: return Qs(e, t, n);
			case 22: return Ls(e, t, n);
		}
		throw Error(a(156, t.tag));
	};
	function Wl(e, t) {
		return mt(e, t);
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
			if (e = e.$$typeof, e === D) return 11;
			if (e === k) return 14;
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
			case w: return Zl(n.children, i, o, t);
			case T:
				s = 8, i |= 8;
				break;
			case ne: return e = Kl(12, n, t, i | 2), e.elementType = ne, e.lanes = o, e;
			case O: return e = Kl(13, n, t, i), e.elementType = O, e.lanes = o, e;
			case ie: return e = Kl(19, n, t, i), e.elementType = ie, e.lanes = o, e;
			case ae: return Ql(n, i, o, t);
			default:
				if (typeof e == "object" && e) switch (e.$$typeof) {
					case re:
						s = 10;
						break a;
					case E:
						s = 9;
						break a;
					case D:
						s = 11;
						break a;
					case k:
						s = 14;
						break a;
					case A:
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
		return e = Kl(22, e, r, t), e.elementType = ae, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
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
		this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Lt(0), this.expirationTimes = Lt(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Lt(0), this.identifierPrefix = r, this.onRecoverableError = i, this.mutableSourceEagerHydrationData = null;
	}
	function nu(e, t, n, r, i, a, o, s, c) {
		return e = new tu(e, t, n, s, c), t === 1 ? (t = 1, !0 === a && (t |= 8)) : t = 0, a = Kl(3, null, null, t), e.current = a, a.stateNode = e, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: null,
			transitions: null,
			pendingSuspenseBoundaries: null
		}, Xa(a), e;
	}
	function ru(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: te,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	function iu(e) {
		if (!e) return Vi;
		e = e._reactInternals;
		a: {
			if (ct(e) !== e || e.tag !== 1) throw Error(a(170));
			var t = e;
			do {
				switch (t.tag) {
					case 3:
						t = t.stateNode.context;
						break a;
					case 1: if (Ki(t.type)) {
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
			if (Ki(n)) return Yi(e, n, t);
		}
		return t;
	}
	function au(e, t, n, r, i, a, o, s, c) {
		return e = nu(n, r, !0, e, i, a, o, s, c), e.context = iu(null), n = e.current, r = fl(), i = pl(n), a = Qa(r, i), a.callback = t ?? null, $a(n, a, i), e.current.lanes = i, Rt(e, i, r), hl(e, r), e;
	}
	function ou(e, t, n, r) {
		var i = t.current, a = fl(), o = pl(i);
		return n = iu(n), t.context === null ? t.context = n : t.pendingContext = n, t = Qa(a, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = $a(i, t, o), e !== null && (ml(e, i, o, a), eo(e, i, o)), o;
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
			}), t[Ai] = null;
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
			return e._reactRootContainer = o, e[Ai] = o.current, si(e.nodeType === 8 ? e.parentNode : e), Cl(), o;
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
		return e._reactRootContainer = c, e[Ai] = c.current, si(e.nodeType === 8 ? e.parentNode : e), Cl(function() {
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
					var n = B(t.pendingLanes);
					n !== 0 && (zt(t, n | 1), hl(t, vt()), !($ & 6) && (el = vt() + 500, ra()));
				}
				break;
			case 13: Cl(function() {
				var t = Ja(e, 1);
				t !== null && ml(t, e, 1, fl());
			}), lu(e, 1);
		}
	}, Ht = function(e) {
		if (e.tag === 13) {
			var t = Ja(e, 134217728);
			t !== null && ml(t, e, 134217728, fl()), lu(e, 134217728);
		}
	}, Ut = function(e) {
		if (e.tag === 13) {
			var t = pl(e), n = Ja(e, t);
			n !== null && ml(n, e, t, fl()), lu(e, t);
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
	}, We = function(e, t, n) {
		switch (t) {
			case "input":
				if (xe(e, n), t = n.name, n.type === "radio" && t != null) {
					for (n = e; n.parentNode;) n = n.parentNode;
					for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + "][type=\"radio\"]"), t = 0; t < n.length; t++) {
						var r = n[t];
						if (r !== e && r.form === e.form) {
							var i = Li(r);
							if (!i) throw Error(a(90));
							P(r), xe(r, i);
						}
					}
				}
				break;
			case "textarea":
				Oe(e, n);
				break;
			case "select": t = n.value, t != null && Te(e, !!n.multiple, t, !1);
		}
	}, Xe = Sl, F = Cl;
	var yu = {
		usingClientEntryPoint: !1,
		Events: [
			Fi,
			Ii,
			Li,
			Je,
			Ye,
			Sl
		]
	}, bu = {
		findFiberByHostInstance: Pi,
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
			return e = ft(e), e === null ? null : e.stateNode;
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
			Tt = Su.inject(xu), Et = Su;
		} catch {}
	}
	e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = yu, e.createPortal = function(e, t) {
		var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!mu(t)) throw Error(a(200));
		return ru(e, t, null, n);
	}, e.createRoot = function(e, t) {
		if (!mu(e)) throw Error(a(299));
		var n = !1, r = "", i = du;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = nu(e, 1, !1, null, null, n, !1, r, i), e[Ai] = t.current, si(e.nodeType === 8 ? e.parentNode : e), new fu(t);
	}, e.findDOMNode = function(e) {
		if (e == null) return null;
		if (e.nodeType === 1) return e;
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(a(188)) : (e = Object.keys(e).join(","), Error(a(268, e)));
		return e = ft(t), e = e === null ? null : e.stateNode, e;
	}, e.flushSync = function(e) {
		return Cl(e);
	}, e.hydrate = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !0, n);
	}, e.hydrateRoot = function(e, t, n) {
		if (!mu(e)) throw Error(a(405));
		var r = n != null && n.hydratedSources || null, i = !1, o = "", s = du;
		if (n != null && (!0 === n.unstable_strictMode && (i = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onRecoverableError !== void 0 && (s = n.onRecoverableError)), t = au(t, null, e, 1, n ?? null, i, !1, o, s), e[Ai] = t.current, si(e), r) for (e = 0; e < r.length; e++) n = r[e], i = n._getVersion, i = i(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, i] : t.mutableSourceEagerHydrationData.push(n, i);
		return new pu(t);
	}, e.render = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !1, n);
	}, e.unmountComponentAtNode = function(e) {
		if (!hu(e)) throw Error(a(40));
		return e._reactRootContainer ? (Cl(function() {
			vu(null, null, e, !1, function() {
				e._reactRootContainer = null, e[Ai] = null;
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
})), s = (/* @__PURE__ */ e(((e) => {
	var t = o();
	e.createRoot = t.createRoot, e.hydrateRoot = t.hydrateRoot;
})))();
function c() {
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
var l = c(), u = c();
function d() {
	for (let e = l.length - 1; e >= 0; e--) {
		let t = l.key(e);
		t && !t.endsWith("spreadline.pending-write.v1") && l.removeItem(t);
	}
}
// src/authentication.ts
var f = /* @__PURE__ */ new Set(), p = null, m = 3e4;
function h(e, t = !1) {
	let n = new URL(e), r = [
		"localhost",
		"127.0.0.1",
		"[::1]"
	].includes(n.hostname);
	if (n.username || n.password || !t && n.search || n.hash || n.protocol !== "https:" && !(n.protocol === "http:" && r)) throw Error("Use an HTTPS API URL, or HTTP on loopback, without credentials or query parameters.");
	return n;
}
function g(e = "") {
	for (let e of f) e();
}
function _(e = "") {
	p?.controller.abort(), p = null, d(), g(e);
}
async function v(e, t, n = fetch) {
	let r = p;
	if (!r) throw Error("Connect the workspace with an API token before sending requests.");
	if (h(e, !0).origin !== r.origin) throw Error("The API origin changed. Reconnect before sending a credential.");
	let i = new Headers(t.headers);
	if (i.has("Authorization")) throw Error("Caller-supplied authorization is not accepted.");
	i.set("Authorization", `Bearer ${r.token}`);
	let a = [r.controller.signal, AbortSignal.timeout(m)];
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
	if (r !== p || r.controller.signal.aborted) throw await o.body?.cancel().catch(() => {}), Error("The API connection changed; review any pending write before retrying.");
	return o.status === 401 && _("The API rejected the credential. Reconnect to review or retry pending work."), o;
}
// src/requestActivity.ts
var y = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Set(), x = {
	count: 0,
	startedAt: null
};
function S() {
	x = {
		count: y.size,
		startedAt: y.size ? Math.min(...y.values()) : null
	}, b.forEach((e) => e());
}
var C = () => x, ee = (e) => (b.add(e), () => {
	b.delete(e);
});
async function te(e) {
	let t = Symbol();
	y.set(t, Date.now()), S();
	try {
		return await e();
	} finally {
		y.delete(t), S();
	}
}
// src/transport.ts
var w = "http://localhost:8000".replace(/\/$/, ""), T = null;
function ne(e, t) {
	if (!/^[0-9a-f-]{36}$/.test(e)) throw Error("Invalid testing store identity");
	w = `streamlit:${window.location.origin}:${e}`, T = t;
}
function re() {
	return T !== null;
}
function E(e, t, n) {
	return te(() => T ? T(e, t) : v(`${w}${e}`, t, n));
}
var D = "spreadline.embedded.";
function O(e, t) {
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
function ie() {
	return T ? O(l, D) : l;
}
function k() {
	return T ? O(u, D) : u;
}
// src/workspaceSelectors.ts
var A = n();
function ae(e, t) {
	let n = e.saved;
	if (n) {
		let e = n.view.snapshot.revision;
		return t ? n.selection === "latest" ? `Saved · revision ${e} · latest` : n.selection === "receipt" ? `Saved · revision ${e} · latest unconfirmed` : `Historical revision ${e} (read-only)` : `Previous saved revision ${e} (inactive)`;
	}
	return t && e.accepted ? "Draft — not saved" : null;
}
function oe(e, t) {
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
function se(e, t) {
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
		statusChip: ae(e, n),
		decisionWord: o ? o.outcome.toUpperCase() : c ? e.action === "open" ? "LOADING" : e.action === "write" ? "SAVING" : "CALCULATING" : "UNAVAILABLE",
		decisionNote: o ? `${o.policy_version} · illustrative score ${o.score}` : c && e.action !== "open" && e.action !== "write" ? "The decision appears with its figures." : "A current accepted calculation is required",
		pendingTitle: c ? e.action === "open" ? "Loading original stored assessment" : e.action === "write" ? "Waiting for saved write confirmation" : "Evaluating draft" : "No current result",
		previousAccepted: r && !e.saved && (e.action === "evaluate" || !t) ? r : null,
		previous: !n && e.draft?.edit && l ? l.outcome : null,
		analysisSubject: oe(e, n)
	};
}
// src/useEditController.ts
function j(e, t) {
	let [n, r] = (0, A.useState)(null), [i, a] = (0, A.useState)();
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
// src/decimal.ts
var ce = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/, le = 10n;
function ue(e) {
	if (e.length > 256) throw Error("Decimal exceeds the supported range.");
	let t = ce.exec(e);
	if (!t) throw Error("Enter a finite decimal value.");
	let n = Number(t[5] ?? "0");
	if (!Number.isSafeInteger(n) || Math.abs(n) > 128) throw Error("Decimal exponent exceeds the supported range.");
	let r = t[3] ?? t[4] ?? "";
	return {
		coefficient: BigInt(`${t[1] === "-" ? "-" : ""}${t[2] ?? "0"}${r}`),
		scale: r.length - n
	};
}
function de({ coefficient: e, scale: t }) {
	if (e === 0n) return "0";
	let n = e < 0n ? "-" : "", r = (e < 0n ? -e : e).toString();
	return t <= 0 ? n + r + "0".repeat(-t) : (r = r.padStart(t + 1, "0"), (n + r.slice(0, -t) + "." + r.slice(-t)).replace(/0+$/, "").replace(/\.$/, ""));
}
function fe(e) {
	return de(ue(e));
}
function M(e) {
	if (typeof e != "string") return !1;
	try {
		return ue(e), !0;
	} catch {
		return !1;
	}
}
function pe(e) {
	if (typeof e == "number" && Number.isFinite(e)) return fe(String(e));
	if (typeof e == "string") return fe(e);
	throw Error("Financial values must be finite decimals.");
}
function me(e, t) {
	if (!Number.isSafeInteger(t) || Math.abs(t) > 30) throw Error("Unsupported decimal shift.");
	let n = ue(e);
	return de({
		...n,
		scale: n.scale - t
	});
}
function N(e, t) {
	let n = ue(e), r = ue(t), i = Math.max(n.scale, r.scale), a = n.coefficient * le ** BigInt(i - n.scale), o = r.coefficient * le ** BigInt(i - r.scale);
	return a < o ? -1 : +(a > o);
}
function he(e, t) {
	try {
		return N(pe(e), pe(t)) === 0;
	} catch {
		return !1;
	}
}
function ge(e) {
	let t = fe(e), n = ue(e);
	if ((n.coefficient < 0n ? -n.coefficient : n.coefficient).toString().length > 34 || N(t.startsWith("-") ? t.slice(1) : t, "1e30") > 0 || n.coefficient !== 0n && N(t.startsWith("-") ? t.slice(1) : t, "1e-30") < 0) throw Error("Financial input exceeds 34 digits or the supported range [1e-30, 1e30].");
	return t;
}
function P(e, t = 2, n = !0) {
	if (!Number.isInteger(t) || t < 0 || t > 30) throw Error("Unsupported display precision.");
	let r = ue(e), i = r.coefficient < 0n, a = i ? -r.coefficient : r.coefficient;
	if (r.scale > t) {
		let e = le ** BigInt(r.scale - t), n = a % e;
		a /= e, (n * 2n > e || n * 2n === e && a % 2n == 1n) && a++;
	} else a *= le ** BigInt(t - r.scale);
	let o = a.toString().padStart(t + 1, "0"), s = t ? o.slice(0, -t) : o;
	return n && (s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",")), `${i && a !== 0n ? "-" : ""}${s}${t ? "." + o.slice(-t) : ""}`;
}
var _e = {
	units: 0,
	thousands: 3,
	millions: 6
};
function ve(e, t) {
	return me(e, -_e[t]);
}
function ye(e) {
	let [t, n] = fe(e).split("."), r = t.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return n === void 0 ? r : `${r}.${n}`;
}
function be(e, t = {}) {
	let n = P(ve(e, t.scale ?? "units"), t.places ?? 0, t.group ?? !0), r = n.startsWith("-"), i = (t.currency ? "$" : "") + (r ? n.slice(1) : n);
	return r ? (t.negative ?? "parentheses") === "parentheses" ? `(${i})` : `-${i}` : i;
}
function xe(e, t = 1, n = {}) {
	let r = P(me(e, 2), t, !0);
	return r.startsWith("-") ? (n.negative ?? "minus") === "parentheses" ? `(${r.slice(1)}%)` : `${r}%` : `${n.signed && !/^0(?:\.0+)?$/.test(r) ? "+" : ""}${r}%`;
}
function Se(e, t, n, r) {
	let i = N(e, t);
	for (let a = n; a < r; a++) if (N(P(e, a, !1), t) === i) return a;
	return r;
}
function Ce(e, t = {}) {
	let n = t.places ?? 2;
	return `${P(e, t.threshold === void 0 ? n : Se(e, t.threshold, n, Math.max(n, t.maxPlaces ?? 4)), !0)}x`;
}
function we(e, t, n) {
	if (!Number.isSafeInteger(n) || n < 1 || n > 1e4) throw Error("Unsupported drawing units.");
	let r = ue(e), i = ue(t), a = Math.max(r.scale, i.scale), o = (e) => e < 0n ? -e : e, s = o(r.coefficient) * le ** BigInt(a - r.scale) * BigInt(n), c = o(i.coefficient) * le ** BigInt(a - i.scale);
	if (c === 0n) return 0n;
	let l = s / c, u = s % c;
	return (u * 2n > c || u * 2n === c && l % 2n == 1n) && l++, l > BigInt(n) && (l = BigInt(n)), r.coefficient < 0n ? -l : l;
}
var Te = {
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
}, Ee = /^[\s   ]+|[\s   ]+$/g;
function De(e, t = Te[e]) {
	return {
		ok: !1,
		code: e,
		message: t
	};
}
function Oe(e, t = {}) {
	let n = e.replace(/−/g, "-").replace(Ee, "");
	if (!n) return De("empty");
	if (/%/.test(n)) return De("percent");
	if (/\d/.test(n) && /[kmb]{1,2}\)?$/i.test(n)) return De("suffix");
	if (/\d/.test(n) && /e/i.test(n)) return De("exponent");
	if ((n.match(/-/g) ?? []).length > 1 || /-\s*\(|\(\s*-/.test(n)) return De("sign");
	if ((n.match(/\(/g) ?? []).length !== (n.match(/\)/g) ?? []).length) return De("parentheses");
	if ((n.match(/\$/g) ?? []).length > (t.currency === !1 ? 0 : 1)) return De("invalid");
	let r = /^\$?(\()?(-)?\$?(\d[\d,]*(?:\.\d*)?|\.\d+)\)?$/.exec(n);
	if (!r) return De("invalid");
	let [i] = r[3].split(".");
	if (i.includes(",") && !/^\d{1,3}(?:,\d{3})+$/.test(i)) return De("grouping");
	let a = !!r[1] || !!r[2], o = r[3].replace(/,/g, ""), s = (a ? "-" : "") + (o.startsWith(".") ? "0" + o : o);
	if (o.replace(".", "").replace(/^0+(?=\d)/, "").length > 34) return De("digits");
	let c;
	try {
		c = ge(s);
	} catch {
		return De("range");
	}
	return t.allowNegative === !1 && N(c, "0") < 0 ? De("negative") : {
		ok: !0,
		value: c
	};
}
var ke = "Enter a finite percentage such as 12.5 or 12.5%.";
function Ae(e, t = {}) {
	let n = e.replace(/−/g, "-").replace(Ee, "");
	if (!n) return De("empty", "Enter a percentage.");
	if (/\$/.test(n)) return De("invalid", ke);
	let r = /^(.*?)\s*%(\)?)$/.exec(n);
	if (r && (n = r[1] + r[2]), /%/.test(n)) return De("percent", "Use one percent sign, such as 12.5%.");
	let i = Oe(n, {
		allowNegative: t.allowNegative,
		currency: !1
	});
	if (!i.ok) return i.code === "invalid" ? De("invalid", ke) : i;
	try {
		return {
			ok: !0,
			value: ge(me(i.value, -2))
		};
	} catch {
		return De("range");
	}
}
var je = "Enter a whole number, such as 120.";
function Me(e) {
	if (/[$%]/.test(e)) return De("invalid", je);
	let t = Oe(e, { currency: !1 });
	return t.ok ? /^-?\d+$/.test(t.value) ? t : De("invalid", je) : De(t.code, je);
}
function Ne(e) {
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
// src/format.ts
var Pe = {
	scale: "units",
	cents: !1
}, Fe = (e) => e.scale === "millions" ? 1 : e.scale === "thousands" ? 0 : e.cents ? 2 : 0;
function Ie(e, t = Pe, n = {}) {
	return be(e, {
		scale: t.scale,
		places: Fe(t),
		currency: n.currency ?? !0
	});
}
function Le(e, t, n = Pe, r) {
	if (e.status !== "available") return "Not applicable";
	let i = e.reported_value ?? e.raw_value;
	if (t === "category" || !M(i)) return String(i);
	let a = M(e.raw_value) ? e.raw_value : i;
	return t === "money" ? Ie(Fe(n) - (n.scale === "thousands" ? 3 : n.scale === "millions" ? 6 : 0) < (e.display_precision ?? 0) ? a : i, n) : t === "percent" ? xe(a, 1) : Ce(a, { threshold: r });
}
var Re = {
	scale: "units",
	cents: !0
};
function ze(e, t) {
	return Ce(e, { places: t.reduce((t, n) => M(n) ? Math.max(t, Se(e, n, 2, 4)) : t, 2) });
}
function Be(e, t = Pe) {
	return Ie(e.startsWith("-") ? e.slice(1) : e, t);
}
function Ve(e, t) {
	if (e.status !== "available" || !M(e.raw_value)) return "Not applicable";
	let n = e.raw_value, r = N(n, "0") > 0;
	return t === "money" ? `${r ? "+" : ""}${Ie(n)}` : `${r ? "+" : ""}${Ce(n, { threshold: "0" })}`;
}
function He(e) {
	let t = e.raw_value;
	return t === null ? "Not applicable" : M(t) ? e.name === "uca_positive" ? Ie(t) : ze(t, [e.threshold, e.decline_threshold]) : String(t);
}
function Ue(e, t = 1) {
	return e.status !== "available" || !M(e.raw_value) ? "Not applicable" : xe(e.raw_value, t);
}
function We(e, t) {
	return t === "%" ? me(String(e), 2) : String(e);
}
function Ge(e, t) {
	return t === "%" ? `${P(me(String(e), 2), 2)}%` : t === "months" ? `${e} months` : Ie(String(e));
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
var Ke = (e) => P(e, 2);
function qe(e) {
	let t = e.raw_value;
	return t === null ? "Not applicable" : M(t) ? e.name === "uca_positive" ? `$${Ke(t)}` : `${P(t, 4)}x` : String(t);
}
// src/contracts.ts
var Je = [
	"gross_receipts",
	"cogs",
	"operating_expense_excl_dna_interest_comp",
	"officer_compensation",
	"depreciation",
	"amortization",
	"interest_expense",
	"section_179",
	"k1_distribution"
], Ye = [
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
], Xe = [
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
function F(e, t) {
	if (!e) throw Error(`Incomplete or invalid assessment: ${t}`);
}
function I(e, t) {
	return F(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
function Ze(e, t) {
	return F(Array.isArray(e), t), e;
}
function L(e) {
	return typeof e == "string" && e.length > 0;
}
function Qe(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function $e(e) {
	return typeof e == "string" || typeof e == "boolean";
}
function et(e) {
	return typeof e == "string" && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e;
}
function tt(e) {
	let t = I(e, "period");
	return F(et(t.period_start) && et(t.period_end) && t.period_start <= t.period_end, "period dates"), t;
}
var nt = (e, t) => e.period_start === t.period_start && e.period_end === t.period_end;
function rt(e) {
	let t = I(e, "request");
	return "schema_version" in t ? (F(["commercial-assessment-v1", "commercial-assessment-v2"].includes(String(t.schema_version)), "unsupported schema_version"), "dated") : "legacy";
}
function it(e) {
	let t = I(e, "decision");
	F(t.vertical === "commercial" && [
		"approve",
		"review",
		"decline"
	].includes(String(t.outcome)) && M(t.score) && L(t.policy_version) && L(t.disclaimer), "decision identity");
	let n = Ze(t.factors, "factors");
	F(n.length === 5, "commercial factors");
	let r = [
		"dscr",
		"fccr",
		"global_dscr",
		"uca_positive",
		"k1_history"
	];
	for (let e of n) {
		let t = I(e, "factor");
		F(L(t.name) && r.includes(t.name) && $e(t.value) && (t.raw_value === null || $e(t.raw_value)) && M(t.weight) && (t.threshold === null || $e(t.threshold)) && (t.passed === null || typeof t.passed == "boolean") && L(t.source) && [
			null,
			">=",
			">",
			"<",
			"=="
		].includes(t.comparison_operator) && (t.decline_threshold === null || M(t.decline_threshold)) && (t.decline_triggered === null || typeof t.decline_triggered == "boolean"), "factor fields");
	}
	F(new Set(n.map((e) => I(e, "factor").name)).size === 5, "unique factors");
	for (let e of Ze(t.reasons, "reasons")) {
		let t = I(e, "reason");
		F(L(t.code) && L(t.factor) && L(t.message) && $e(t.value), "reason fields");
	}
	return t;
}
function at(e) {
	let t = I(e, "legacy input");
	F(L(t.borrower_name) && L(t.geography), "borrower");
	let n = (e, t) => {
		let n = e === void 0 ? t : e;
		return F(n !== void 0 && typeof n != "boolean", "legacy decimal input"), pe(n);
	}, r = Ze(t.years, "years").map((e) => {
		let t = I(e, "year");
		return Object.fromEntries(Je.map((e) => [e, n(t[e], ["section_179", "k1_distribution"].includes(e) ? "0" : void 0)]));
	});
	F(r.length, "years");
	let i = I(t.existing_debt, "debt"), a = I(t.proposed_loan, "loan"), o = I(t.working_capital, "working capital"), s = Ze(t.guarantors ?? [], "guarantors").map((e) => {
		let t = I(e, "guarantor");
		return F(t.name === void 0 || L(t.name), "guarantor name"), {
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
	}), c = Ze(t.overrides ?? [], "overrides").map((e) => {
		let t = I(e, "override");
		return F(L(t.field) && L(t.rationale) && L(t.source) && (t.actor === void 0 || L(t.actor)) && (t.at === void 0 || L(t.at)) && "new_value" in t, "override fields"), {
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
				return F(Number.isSafeInteger(e), "integer term months"), e;
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
function ot(e) {
	let t = I(e, "normalized input");
	F(t.schema_version === "commercial-assessment-v2" && et(t.assessment_as_of) && L(t.borrower_name) && L(t.geography), "dated identity");
	let n = I(t.units, "units");
	F(n.currency === "USD" && n.monetary_unit === "dollars" && n.annual_rate_unit === "decimal_nominal", "units");
	let r = Ze(t.years, "years");
	F(r.length >= 1 && r.length <= 10, "year count");
	let i = "";
	for (let e of r) {
		let n = I(e, "year"), r = tt(n);
		F(r.period_start > i && r.period_end <= t.assessment_as_of, "year order"), i = r.period_end;
		for (let e of Je) F(M(n[e]), `year ${e}`);
	}
	let a = (e, t) => {
		let n = I(e, "assumption");
		for (let e of t) F(M(n[e]), e);
		return n;
	};
	a(t.existing_debt, ["cpltd_annual", "operating_lease_annual"]);
	let o = a(t.proposed_loan, ["amount", "annual_rate"]);
	F(Number.isSafeInteger(o.term_months) && o.rate_type === "fixed" && o.repayment_type === "fully_amortizing" && o.payment_frequency === "monthly", "loan convention"), F(nt(tt(a(t.working_capital, [
		"ar_increase",
		"inventory_increase",
		"ap_increase",
		"cash_taxes_paid"
	])), tt(r[r.length - 1])), "working capital period");
	for (let e of Ze(t.guarantors, "guarantors")) F(L(a(e, [
		"ownership_percentage",
		"wages",
		"interest_dividend_income",
		"mortgage_pi_annual",
		"auto_loan_annual",
		"credit_card_min_annual"
	]).name), "guarantor name");
	return t;
}
function st(e) {
	let t = I(e, "metric");
	return F(L(t.fact_id) && L(t.unit) && (t.display_precision === null || Number.isInteger(t.display_precision) && Number(t.display_precision) >= 0 && Number(t.display_precision) <= 30) && (t.explanation === null || L(t.explanation)), "metric fields"), F(t.status === "available" ? M(t.raw_value) || t.unit === "category" && L(t.raw_value) : t.status === "not_applicable" && t.raw_value === null && L(t.explanation), "metric status/value"), F(t.status === "not_applicable" ? t.reported_value === null : t.unit === "category" ? t.reported_value === t.raw_value : M(t.reported_value), "reported metric value"), t;
}
function ct(e) {
	let t = I(e, "assessment");
	F(t.schema_version === "commercial-assessment-v2" && t.calculation_version === "commercial-calculation-v2" && t.serialization_version === "assessment-json-v2" && t.coverage_basis === "current_pro_forma" && L(t.disclaimer), "versions");
	let n = ot(t.normalized_input), r = n.years[n.years.length - 1];
	F(nt(tt(t.selected_period), r) && t.assumptions_as_of === n.assessment_as_of, "selected period");
	let i = Ze(t.historical_spread, "spread");
	F(i.length === n.years.length, "spread length");
	let a = [];
	i.forEach((e, t) => {
		let r = I(e, "historical period");
		F(nt(tt(r), n.years[t]) && nt(tt(r.financials), n.years[t]), "historical period correspondence");
		let i = I(r.financials, "historical financials");
		for (let e of Je) F(i[e] === n.years[t][e], "historical inputs");
		let o = I(r.reported_financials, "reported financials");
		F(nt(tt(o), n.years[t]), "reported period");
		for (let e of Je) F(M(o[e]) && /^-?\d+\.\d{2}$/.test(o[e]), "reported source amount");
		for (let e of [
			"gross_profit",
			"ordinary_business_income",
			"ebitda",
			"k1_distribution_ratio"
		]) a.push(st(r[e]));
	});
	let o = I(t.current_facts, "facts");
	for (let e of Ye) {
		let t = st(o[e]), r = ["ordinary_business_income", "ebitda"].includes(e) ? `years.${n.years.length - 1}.${e}` : `current.${e}`;
		F(t.fact_id === r, "fact identity"), F(e === "k1_history" ? t.status === "available" && [
			"stable",
			"unstable",
			"insufficient_history"
		].includes(String(t.raw_value)) : t.raw_value === null || M(t.raw_value), "fact type"), a.push(t);
	}
	let s = Ze(t.guarantor_contributions, "contributions");
	F(s.length === n.guarantors.length, "contributions length"), s.forEach((e, t) => {
		let r = I(e, "contribution");
		F(r.guarantor_index === t && r.name === n.guarantors[t].name, "contribution identity");
		for (let e of [
			"business_ebitda",
			"outside_income",
			"personal_debt"
		]) a.push(st(r[e]));
	});
	let c = Ze(t.k1_history_periods, "history periods").map(tt);
	F(c.length >= 1 && c.length <= 2 && nt(c[c.length - 1], r) && c.every((e) => n.years.some((t) => nt(e, t))), "history periods");
	let l = I(t.policy_snapshot, "policy");
	F(L(l.version) && et(l.sba_sop_8_effective) && et(l.sba_sop_8_1_effective), "policy identity");
	for (let e of Xe) F(e === "consumer_min_credit_score" ? Number.isSafeInteger(l[e]) : M(l[e]), `policy ${e}`);
	F(Ze(l.consumer_required_atr_fields, "ATR fields").every(L), "ATR fields");
	let u = it(t.decision);
	F(u.policy_version === l.version, "decision policy");
	let d = Ze(t.calculation_trace, "trace");
	F(d.length > 0, "trace rows");
	let f = /* @__PURE__ */ new Map();
	for (let e of d) {
		let t = I(e, "trace row"), n = st(t);
		F(L(t.definition_id) && L(t.expression) && !f.has(n.fact_id), "trace identity"), f.set(n.fact_id, n);
		for (let e of Ze(t.operands, "operands")) {
			let t = I(e, "operand");
			F([
				"input",
				"fact",
				"policy"
			].includes(String(t.reference_type)) && L(t.reference) && L(t.unit) && (t.raw_value === null || Qe(t.raw_value) || typeof t.raw_value == "string"), "operand fields"), F(t.reported_value === null || M(t.reported_value) || Number.isSafeInteger(t.reported_value), "reported operand");
		}
	}
	for (let e of d) {
		let t = I(e, "trace row");
		for (let e of Ze(t.operands, "operands")) {
			let t = I(e, "operand");
			if (t.reference_type === "fact") {
				let e = f.get(String(t.reference));
				F(e && e.raw_value === t.raw_value && e.unit === t.unit, "referenced fact");
			} else {
				let e = String(t.reference).split("/").slice(1), r = t.reference_type === "policy" ? { policy_snapshot: l } : n;
				for (let t of e) F(typeof r == "object" && !!r && Object.prototype.hasOwnProperty.call(r, t), "operand input path"), r = r[t];
				F(r === t.raw_value, "operand input value");
			}
		}
	}
	for (let e of a) {
		let t = f.get(e.fact_id);
		F(t && t.raw_value === e.raw_value && t.reported_value === e.reported_value && t.status === e.status && t.unit === e.unit, "fact/trace correspondence");
	}
	for (let e of u.factors) {
		let t = e.name === "uca_positive" ? "uca_cash_flow" : e.name;
		F(e.raw_value === st(o[t]).raw_value, "factor/fact correspondence");
	}
	let p = I(t.fingerprint, "fingerprint");
	return F(p.algorithm === "sha256" && typeof p.value == "string" && /^[0-9a-f]{64}$/.test(p.value) && p.content === "normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version", "fingerprint"), t;
}
// src/fieldCatalog.ts
var lt = {
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
	dscr: "Business DSCR",
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
}, ut = {
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
	dscr: "Business DSCR",
	fccr: "Simplified FCCR",
	global_dscr: "Global DSCR",
	net_working_capital_increase: "Working capital increase",
	uca_cash_flow: "UCA cash flow",
	k1_ratio_difference: "Observed K-1 ratio difference",
	k1_history: "Observed K-1 history",
	uca_positive: "UCA cash flow"
}, dt = {
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
}, ft = ["annual_rate", "ownership_percentage"], pt = [
	"cpltd_annual",
	"operating_lease_annual",
	"amount",
	"annual_rate",
	"ownership_percentage",
	"mortgage_pi_annual",
	"auto_loan_annual",
	"credit_card_min_annual"
], mt = [
	"gross_profit",
	"ordinary_business_income",
	"ebitda",
	"k1_distribution_ratio"
], ht = (e, t) => e.period_start && e.period_end ? `${e.period_start} – ${e.period_end}` : `Supplied period ${t + 1}`;
function gt(e) {
	return "assessment_as_of" in e ? `Assumption as of ${e.assessment_as_of}` : "Legacy annual assumption";
}
function _t(e) {
	let t = e.years.length - 1;
	return `Working capital for ${ht(e.years[t], t)}`;
}
function vt(e, t, n) {
	let r = e.years[t];
	return {
		path: `/years/${t}/${n}`,
		label: lt[n],
		value: r[n],
		unit: "USD",
		min: n === "interest_expense" ? "0" : void 0,
		period: ht(r, t)
	};
}
function yt(e, t, n, r, i, a) {
	let o = ft.includes(r), s = r === "term_months";
	return {
		path: `${n}/${r}`,
		label: lt[r] ?? r,
		value: i,
		unit: o ? "%" : s ? "months" : "USD",
		min: s ? t === "dated" ? 12 : 1 : pt.includes(r) ? 0 : void 0,
		max: r === "ownership_percentage" || r === "annual_rate" && t === "dated" ? 1 : void 0,
		integer: s,
		period: a ?? gt(e)
	};
}
var bt = {
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
}, xt = (e) => e.replace(/~1/g, "/").replace(/~0/g, "~"), St = (e) => {
	let t = e.replace(/_/g, " ");
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Ct = (e) => lt[e] ?? bt[e] ?? St(e);
function wt(e) {
	if (e === "") return "The case file";
	let t = e.split("/").slice(1).map(xt), [n, r, i] = t, a = /^\d+$/.test(r ?? "") ? Number(r) : null;
	if ((n === "years" || n === "guarantors") && a !== null) {
		let e = n === "years" ? `period ${a + 1}` : `guarantor ${a + 1}`;
		return i === void 0 ? `${St(n === "years" ? "period" : "guarantor")} ${a + 1}` : `${Ct(t[t.length - 1])} (${e})`;
	}
	return n === "working_capital" && (r === "period_start" || r === "period_end") ? `Working capital ${bt[r].toLowerCase()}` : Ct(t[t.length - 1]);
}
function Tt(e) {
	return Array.isArray(e) ? (e[0] === "body" ? e.slice(1) : e).map((e) => `/${String(e).replace(/~/g, "~0").replace(/\//g, "~1")}`).join("") : "";
}
function Et(e, t, n) {
	let [r, i, a, ...o] = n.split("/").slice(1), s = Number(i);
	if (r === "years" && o.length === 0 && Je.includes(a) && Number.isInteger(s) && s >= 0 && s < e.years.length) return vt(e, s, a);
	if (r === "guarantors" && o.length === 0 && dt.guarantors.includes(a) && Number.isInteger(s) && s >= 0 && s < e.guarantors.length) {
		let n = e.guarantors[s];
		return yt(e, t, `/guarantors/${s}`, a, n[a]);
	}
	if ((r === "existing_debt" || r === "proposed_loan" || r === "working_capital") && a === void 0 && dt[r].includes(i)) {
		let n = e[r];
		return yt(e, t, `/${r}`, i, n[i], r === "working_capital" ? _t(e) : void 0);
	}
	throw Error(`Unsupported editable input path: ${n}`);
}
// src/api.ts
var Dt = (e, t, n = fetch) => E(e, t, n), Ot = class extends Error {
	kind;
	status;
	fieldErrors;
	detail;
	constructor(e, t, n = 0, r = [], i = null) {
		super(e), this.kind = t, this.status = n, this.fieldErrors = r, this.detail = i, this.name = "EvaluationError";
	}
};
function kt(e, t) {
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
		pointer: Tt(e.loc),
		code: "invalid_value",
		message: String(e.msg ?? "Invalid input"),
		limit: null
	}] : []) : [];
}
async function At(e, t, n = fetch) {
	let r;
	try {
		r = await Dt(`/commercial/${e.mode === "dated" ? "assessment" : "decision"}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: e.rawJson ?? JSON.stringify(e.payload),
			signal: t
		}, n);
	} catch (e) {
		let t = e instanceof Error ? e.message : String(e);
		throw new Ot(t, "unavailable", 0, [], e instanceof DOMException && e.name === "TimeoutError" ? "timeout" : e instanceof TypeError ? null : t);
	}
	let i;
	try {
		i = await r.json();
	} catch {
		throw new Ot(`Backend returned an unreadable response (${r.status}).`, "unreadable", r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null;
		throw new Ot(Array.isArray(e) ? e.map((e) => e && typeof e == "object" ? `${Array.isArray(e.loc) ? e.loc.join(".") : "input"}: ${String(e.msg ?? "Invalid input")}` : "Invalid input").join("; ") : typeof e == "string" ? e : `Request failed (${r.status}).`, r.status < 500 ? "rejected" : "unavailable", r.status, kt(i, e), typeof e == "string" ? e : null);
	}
	return e.mode === "dated" ? (() => {
		let t = ct(i);
		return {
			mode: "dated",
			input: t.normalized_input,
			result: t,
			filename: e.filename
		};
	})() : {
		mode: "legacy",
		input: at(e.payload),
		result: it(i),
		filename: e.filename
	};
}
// src/caseContracts.ts
function R(e, t) {
	if (!e) throw Error(`Invalid saved-case response or command: ${t}.`);
}
function z(e, t) {
	return R(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
var jt = (e) => typeof e == "number" && Number.isFinite(e), B = (e) => typeof e == "string", Mt = (e) => B(e) && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(e), Nt = (e) => B(e) && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(e), Pt = (e) => Number.isSafeInteger(e) && Number(e) >= 1, Ft = (e) => B(e) && /^[0-9a-f]{64}$/.test(e), It = (e) => B(e) && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, Lt = (e) => B(e) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(e) && It(e.slice(0, 10)) && Number.isFinite(Date.parse(e));
function Rt(e, t = 0, n = 64) {
	if (R(t < n, "JSON depth"), !(e === null || B(e) || typeof e == "boolean")) {
		if (typeof e == "number") R(jt(e), "finite JSON number");
		else {
			R(typeof e == "object", "JSON value");
			for (let r of Object.values(e)) Rt(r, t + 1, n);
		}
	}
}
function V(e, t) {
	if (e === t) return !0;
	if (!e || !t || typeof e != "object" || typeof t != "object" || Array.isArray(e) !== Array.isArray(t)) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.prototype.hasOwnProperty.call(t, n) && V(e[n], t[n]));
}
function zt(e, t) {
	R(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), "command fields");
}
function H(e) {
	return R(B(e) && [...e].length <= 2e3 && e.trim().length > 0, "nonblank rationale, at most 2,000 characters"), e.trim();
}
var Bt = {
	years: Je,
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
function Vt(e) {
	R(B(e) && e.length <= 160 && e.startsWith("/"), "numeric field path");
	let t = e.slice(1).split("/"), n = t[0], r = t[t.length - 1];
	return R(Object.prototype.hasOwnProperty.call(Bt, n) && Bt[n].includes(r), "numeric field allowlist"), R(["years", "guarantors"].includes(n) ? t.length === 3 && /^(?:0|[1-9][0-9]{0,8})$/.test(t[1]) : t.length === 2, "field index"), t;
}
function Ht(e, t) {
	let n = Vt(t), r = n[0], i = n[n.length - 1], a = e, o, s = {
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
		R(Array.isArray(e) && Number(n[1]) < e.length, "existing input index"), o = z(e[Number(n[1])], "input row"), r === "guarantors" ? (s.guarantor_index = Number(n[1]), s.guarantor_name = String(o.name)) : s.basis = "annual_financials";
	} else o = z(a[r], "input group"), r === "working_capital" && (s.basis = "working_capital");
	["annual_financials", "working_capital"].includes(s.basis) && (R(It(o.period_start) && It(o.period_end), "input dates"), s.period_start = o.period_start, s.period_end = o.period_end), ["annual_rate", "ownership_percentage"].includes(i) && (s.unit = "decimal fraction"), i === "term_months" && (s.unit = "months");
	let c = o[i];
	return R(i === "term_months" ? Number.isSafeInteger(c) : M(c) || jt(c), "numeric input"), {
		value: c,
		context: s
	};
}
function Ut(e) {
	let t = z(e, "create command");
	zt(t, ["input", "rationale"]);
	let n = z(t.input, "create input"), r = n.schema_version === "commercial-assessment-v1";
	if (r) {
		let e = (t, n = "") => typeof t == "number" ? n === "term_months" ? t : pe(t) : Array.isArray(t) ? t.map((t) => e(t)) : t && typeof t == "object" ? Object.fromEntries(Object.entries(t).map(([t, n]) => [t, e(n, t)])) : t;
		ot({
			...z(e(n), "archived input"),
			schema_version: "commercial-assessment-v2"
		});
	}
	let i = r ? n : ot(n);
	zt(i, [
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
	]), zt(i.units, [
		"currency",
		"monetary_unit",
		"annual_rate_unit"
	]);
	for (let e of i.years) zt(e, [
		...Je,
		"period_start",
		"period_end"
	]);
	zt(i.existing_debt, Bt.existing_debt), zt(i.proposed_loan, [
		...Bt.proposed_loan,
		"rate_type",
		"repayment_type",
		"payment_frequency"
	]);
	for (let e of i.guarantors) zt(e, ["name", ...Bt.guarantors]);
	return zt(i.working_capital, [
		...Bt.working_capital,
		"period_start",
		"period_end"
	]), Rt(t), H(t.rationale), t;
}
function Wt(e) {
	let t = z(e, "edit command");
	return zt(t, [
		"field_path",
		"new_value",
		"rationale"
	]), Vt(t.field_path), R(M(t.new_value) || jt(t.new_value), "finite edit value"), H(t.rationale), t.field_path === "/proposed_loan/term_months" && R(jt(t.new_value) && Number.isSafeInteger(t.new_value) && t.new_value >= 12 && t.new_value <= 12e3, "whole term months"), t;
}
function Gt(e, t) {
	let n = z(e, "snapshot");
	Rt(n), R(n.storage_serialization_version === "case-json-v1" && Nt(n.case_id) && Nt(n.run_id) && Pt(n.revision), "snapshot identity"), R(n.parent_revision === (n.revision === 1 ? null : n.revision - 1) && Lt(n.recorded_at), "snapshot parent/time"), R(Ft(n.input_hash) && Ft(n.payload_hash), "snapshot hashes"), R(t === `"case-json-v1:${n.case_id}:${n.revision}:${n.payload_hash}"`, "strong ETag");
	let r = z(n.normalized_input, "stored input"), i = z(n.assessment, "stored assessment");
	R(B(i.schema_version) && B(i.calculation_version) && B(i.serialization_version), "assessment versions");
	let a = i.schema_version === "commercial-assessment-v2" && i.calculation_version === "commercial-calculation-v2" && i.serialization_version === "assessment-json-v2", o = a ? ct(i) : null;
	o && R(V(r, o.normalized_input), "outer normalized input");
	let s = z(n.event, "event"), c = z(s.context, "event context");
	if (R(s.case_id === n.case_id && s.revision === n.revision && s.run_id === n.run_id && s.recorded_at === n.recorded_at && Mt(s.actor), "event identity"), H(s.rationale), R(It(c.assessment_as_of), "event as-of"), R(c.period_start === null && c.period_end === null || It(c.period_start) && It(c.period_end) && c.period_start <= c.period_end, "event period"), R(c.guarantor_index === null && c.guarantor_name === null || Number.isSafeInteger(c.guarantor_index) && Number(c.guarantor_index) >= 0 && B(c.guarantor_name), "event guarantor"), n.revision === 1) R(s.kind === "creation" && s.field_path === null && s.before === null && s.after === null && c.basis === "case_creation" && c.unit === null && c.period_start === null && c.guarantor_index === null, "creation event");
	else if (R(s.kind === "edit" && (M(s.before) || jt(s.before)) && (M(s.after) || jt(s.after)) && !he(s.before, s.after) && B(s.field_path), "edit event"), Vt(s.field_path), R([
		"annual_financials",
		"working_capital",
		"current_assumptions"
	].includes(String(c.basis)) && [
		"USD dollars",
		"decimal fraction",
		"months"
	].includes(String(c.unit)), "edit context"), o) {
		let e = Ht(o.normalized_input, s.field_path);
		R(e.value === s.after && V(e.context, c), "server-derived edit context");
	}
	return o && R(c.assessment_as_of === o.normalized_input.assessment_as_of, "event assumptions date"), Kt(n.recording), {
		snapshot: n,
		etag: t,
		assessment: o,
		compatibility: a ? null : `Stored assessment definition: ${i.schema_version} / ${i.calculation_version} / ${i.serialization_version}. Original JSON is available; typed display and editing are unavailable.`
	};
}
function Kt(e) {
	let t = z(e, "recording metadata"), n = z(t.packages, "installed packages");
	R(B(t.python_version) && B(t.sqlite_version) && Ft(t.dependency_baseline_sha256), "recording versions");
	for (let e of [
		"fastapi",
		"pydantic",
		"starlette",
		"uvicorn"
	]) R(B(n[e]) && n[e].length > 0, `installed ${e}`);
	return R(t.source_status === "development_unverified" ? t.source_revision === null : t.source_status === "build_reported" && B(t.source_revision) && /^[0-9a-f]{40}$/.test(t.source_revision), "recorded source"), t;
}
function qt(e) {
	let t = z(e, "page");
	return R(Array.isArray(t.items) && t.items.length <= 25, "bounded page items"), R(t.next_cursor === null || B(t.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(t.next_cursor), "page cursor"), t;
}
function Jt(e) {
	let t = z(e, "summary");
	return R(Nt(t.case_id) && Nt(t.run_id) && Pt(t.revision) && Lt(t.recorded_at), "summary identity"), t;
}
function Yt(e) {
	let t = qt(e);
	R(t.listing_version === void 0 || t.listing_version === "case-listing-v2", "listing version");
	let n = /* @__PURE__ */ new Set();
	for (let e of t.items) {
		let r = Jt(e);
		R(B(r.borrower_name) && Lt(r.created_at) && !n.has(r.case_id), "case summary"), n.add(r.case_id), t.listing_version === "case-listing-v2" && (R(typeof r.definition_supported == "boolean", "summary definition support"), R(r.definition_supported ? [
			"approve",
			"review",
			"decline"
		].includes(String(r.outcome)) && (r.dscr === null || M(r.dscr)) && M(r.requested_amount) && It(r.assessment_as_of) : r.outcome === null && r.dscr === null && r.requested_amount === null && r.assessment_as_of === null, "summary financial values"));
	}
	return t;
}
function Xt(e, t) {
	let n = qt(e), r = Infinity;
	for (let e of n.items) {
		let n = Jt(e);
		R(n.case_id === t && n.parent_revision === (n.revision === 1 ? null : Number(n.revision) - 1) && Number(n.revision) < r, "revision summary"), H(n.rationale), r = Number(n.revision);
	}
	return n;
}
function Zt(e, t) {
	let n = z(e, "replay"), r = t.snapshot;
	return R(n.case_id === r.case_id && n.revision === r.revision && n.run_id === r.run_id && [
		"matched",
		"mismatch",
		"replay_unavailable"
	].includes(String(n.status)), "replay identity/status"), R(Array.isArray(n.differences) && n.differences.every(B) && B(n.explanation), "replay details"), R(n.status !== "matched" || n.differences.length === 0, "matched replay differences"), n;
}
// src/scenarioContracts.ts
var Qt = [
	"revenue_change",
	"cogs_change",
	"operating_expense_change",
	"proposed_rate_change_bps"
], $t = "commercial-scenario-preview-v2", en = "scenario-preview-json-v2";
function tn(e, t) {
	R(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), "scenario fields");
}
function nn(e, t) {
	R(B(e), "scenario text");
	let n = e.replace(/^[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$/gu, "");
	return R(n.length > 0 && [...n].length <= t, `nonblank scenario text, at most ${t} characters`), n;
}
function rn(e, t) {
	let n = t ? Ae(e) : Oe(e, { currency: !1 });
	R(n.ok, "Enter a finite decimal change");
	let r = n.ok ? n.value : "";
	return R(!t || N(r, "-1") >= 0, "Percentage changes must be at least -100%; all changes must be finite"), r;
}
function an(e, t = !1) {
	let n = z(e, "scenario"), r = z(n.assumptions, "shocks");
	R(B(n.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(n.scenario_key), "scenario key"), tn(r, Qt);
	for (let e of Qt) R((M(r[e]) || t && jt(r[e])) && (e === "proposed_rate_change_bps" || N(pe(r[e]), "-1") >= 0), "finite explicit shock");
	return {
		scenario_key: n.scenario_key,
		name: nn(n.name, 120),
		rationale: nn(n.rationale, 2e3),
		assumptions: r
	};
}
function on(e) {
	let t = z(e, "scenario command"), n = ["commercial-scenario-comparison-create-v1", "commercial-scenario-comparison-create-v2"].includes(String(t.schema_version)), r = String(t.schema_version).endsWith("-v1");
	R(n || t.schema_version === $t || t.schema_version === "commercial-scenario-preview-v1", "scenario command version"), tn(t, [
		"schema_version",
		"baseline_run_id",
		"scenarios",
		...n ? ["expected_preview_fingerprint"] : []
	]), R(Nt(t.baseline_run_id) && String(t.baseline_run_id).toLowerCase() === t.baseline_run_id, "canonical baseline run"), n && R(Ft(t.expected_preview_fingerprint), "reviewed preview fingerprint"), R(Array.isArray(t.scenarios) && t.scenarios.length >= 1 && t.scenarios.length <= 10, "1–10 scenarios");
	let i = /* @__PURE__ */ new Set();
	for (let e of t.scenarios) {
		tn(z(e, "scenario command row"), [
			"scenario_key",
			"name",
			"rationale",
			"assumptions"
		]);
		let t = an(e, r);
		R(V(t, e) && !i.has(t.scenario_key), "normalized unique scenario command"), i.add(t.scenario_key);
	}
	return t;
}
function sn(e) {
	let t = z(e.baseline, "preview baseline");
	return R(Array.isArray(e.scenarios), "preview scenarios"), on({
		schema_version: e.schema_version,
		baseline_run_id: t.run_id,
		scenarios: e.scenarios.map((t) => an(t, e.schema_version === "commercial-scenario-preview-v1"))
	});
}
function cn(e, t) {
	return R(Array.isArray(e), t), e;
}
function ln(e) {
	return e === null || M(e);
}
function un(e) {
	return Nt(e) && e.toLowerCase() === e;
}
function dn(e) {
	R((e.schema_version === $t && e.serialization_version === en || e.schema_version === "commercial-scenario-preview-v1" && e.serialization_version === "scenario-preview-json-v1") && e.persisted === !1 && B(e.scenario_definition_version) && B(e.calculation_version), "preview envelope versions");
	let t = z(e.baseline, "baseline evidence");
	R(un(t.case_id) && un(t.run_id) && Pt(t.revision) && Ft(t.input_hash) && Ft(t.payload_hash), "baseline evidence identity");
	let n = z(t.assessment, "original assessment"), r = z(e.fingerprint, "preview fingerprint");
	R(r.algorithm === "sha256" && Ft(r.value) && r.content === "baseline_identity+payload_hash+normalized_command+policy_snapshot+versions", "preview fingerprint");
	let i = z(e.selected_period, "selected operating period");
	R(It(i.period_start) && It(i.period_end) && i.period_start <= i.period_end && It(e.assumptions_as_of) && i.period_end <= e.assumptions_as_of, "preview dates"), R(V(e.selected_period, n.selected_period) && e.assumptions_as_of === n.assumptions_as_of && V(e.policy_snapshot, n.policy_snapshot), "baseline period and retained policy");
	let a = z(n.normalized_input, "baseline input");
	return R(V(e.units, a.units), "baseline units"), R(cn(e.held_fixed_assumptions, "held fixed assumptions").length > 0 && e.held_fixed_assumptions.every(B) && B(e.disclaimer), "preview explanation"), sn(e), {
		b: t,
		a: n
	};
}
function fn(e, t, n) {
	let r = z(e, "scenario preview");
	Rt(r, 0, 100);
	let { b: i, a } = dn(r);
	R(r.schema_version === $t && r.scenario_definition_version === "commercial-scenario-definition-v2" && r.calculation_version === "commercial-calculation-v2", "supported live scenario definition");
	let o = ct(a);
	t && R(i.case_id === t.snapshot.case_id && i.revision === t.snapshot.revision && i.run_id === t.snapshot.run_id && i.input_hash === t.snapshot.input_hash && i.payload_hash === t.snapshot.payload_hash && V(o, t.snapshot.assessment), "selected original baseline"), n && R(V(sn(r), on(n)), "reviewed normalized command");
	for (let e of r.scenarios) pn(e, r, o);
	return r;
}
function pn(e, t, n) {
	let r = z(e, "scenario result"), i = an(r);
	R(V({
		scenario_key: r.scenario_key,
		name: r.name,
		rationale: r.rationale,
		assumptions: r.assumptions
	}, i) && r.coverage_basis === "stressed_latest_period_current_pro_forma", "normalized projection command/basis");
	let a = z(r.projection_inputs, "projected inputs"), o = n.normalized_input;
	ot({
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
	]) R(V(a[e], o[e]), "held-fixed projected inputs");
	let s = z(a.operating, "projected operating"), c = z(a.proposed_loan, "projected loan"), l = o.years[o.years.length - 1];
	for (let e of Je) [
		"gross_receipts",
		"cogs",
		"operating_expense_excl_dna_interest_comp"
	].includes(e) || R(s[e] === l[e], "held-fixed financial lines");
	R(s.period_start === l.period_start && s.period_end === l.period_end, "projected period");
	for (let e of Object.keys(o.proposed_loan)) e !== "annual_rate" && R(c[e] === o.proposed_loan[e], "held-fixed loan");
	let u = z(r.current_facts, "projected facts"), d = [];
	for (let e of Ye) {
		let t = st(u[e]), r = e === "k1_history" || e === "k1_ratio_difference", i = r ? "baseline." + n.current_facts[e].fact_id : ["ordinary_business_income", "ebitda"].includes(e) ? `projection.operating.${e}` : `projection.current.${e}`;
		R(t.fact_id === i && (r ? V(t, {
			...n.current_facts[e],
			fact_id: i
		}) : ln(t.raw_value)), "projected fact identity/type/observed history"), d.push(t);
	}
	let f = cn(r.guarantor_contributions, "projected guarantors");
	R(f.length === o.guarantors.length, "guarantor count"), f.forEach((e, t) => {
		let n = z(e, "guarantor contribution");
		R(n.guarantor_index === t && n.name === o.guarantors[t].name, "guarantor identity");
		for (let e of [
			"business_ebitda",
			"outside_income",
			"personal_debt"
		]) {
			let r = st(n[e]);
			R(r.fact_id === `projection.current.guarantors.${t}.${e}` && ln(r.raw_value), "projected guarantor fact"), d.push(r);
		}
	});
	let p = it(r.decision);
	R(p.policy_version === n.policy_snapshot.version, "retained decision policy");
	let m = cn(r.calculation_trace, "projection trace"), h = /* @__PURE__ */ new Map();
	for (let e of m) {
		let t = z(e, "trace row"), n = st(t);
		R(B(t.definition_id) && B(t.expression) && !h.has(n.fact_id), "trace identity"), h.set(n.fact_id, n), cn(t.operands, "trace operands");
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
		R(V(h.get(t.fact_id), t), "retained observed trace identity");
	}
	for (let e of m) for (let n of z(e, "trace row").operands) {
		let e = z(n, "operand");
		if (R(B(e.reference) && B(e.unit) && (e.raw_value === null || jt(e.raw_value) || B(e.raw_value)), "operand value"), e.reference_type === "fact") {
			let t = h.get(e.reference);
			R(t && t.raw_value === e.raw_value && t.unit === e.unit, "referenced scenario fact");
		} else {
			R(["input", "policy"].includes(String(e.reference_type)) && e.reference.startsWith("/"), "operand reference");
			let n = {
				...r,
				baseline: t.baseline,
				policy_snapshot: t.policy_snapshot
			};
			for (let t of e.reference.slice(1).split("/")) {
				let e = mn(n);
				R(Object.prototype.hasOwnProperty.call(e, t), "scenario operand path"), n = e[t];
			}
			R(n === e.raw_value, "scenario operand value");
		}
	}
	for (let e of d) {
		let t = h.get(e.fact_id);
		R(t && [
			"fact_id",
			"raw_value",
			"reported_value",
			"unit",
			"display_precision",
			"status",
			"explanation"
		].every((n) => t[n] === e[n]), "fact/trace fields");
	}
	let g = cn(r.comparisons, "metric comparisons");
	R(g.length === Ye.length - 1, "comparison count");
	let _ = /* @__PURE__ */ new Set();
	for (let e of g) {
		let t = z(e, "metric comparison");
		R(B(t.metric) && Ye.includes(t.metric) && t.metric !== "k1_history" && !_.has(t.metric), "compared metric identity"), _.add(t.metric);
		let r = n.current_facts[t.metric], i = st(u[t.metric]);
		R(t.baseline_fact_id === "baseline." + r.fact_id && t.projected_fact_id === i.fact_id && t.baseline_value === r.raw_value && t.projected_value === i.raw_value && t.unit === i.unit && ln(t.delta), "comparison fact links"), R(r.raw_value === null || i.raw_value === null ? t.delta === null && B(t.delta_explanation) : M(t.delta) && t.delta_explanation === null, "comparison availability");
		let a = p.factors.find((e) => e.name === (t.metric === "uca_cash_flow" ? "uca_positive" : t.metric));
		if ([
			"dscr",
			"fccr",
			"global_dscr",
			"uca_cash_flow"
		].includes(t.metric)) {
			let e = z(t.policy_headroom, "policy headroom");
			R(a && e.comparison_operator === a.comparison_operator && e.approval_threshold === a.threshold && e.decline_threshold === a.decline_threshold, "headroom policy");
			for (let t of [
				"baseline_approval",
				"projected_approval",
				"baseline_decline",
				"projected_decline"
			]) R(ln(e[t]), "finite headroom");
		} else R(t.policy_headroom === null, "non-policy headroom");
	}
	for (let e of p.factors) {
		let t = e.name === "uca_positive" ? "uca_cash_flow" : e.name, r = n.decision.factors.find((t) => t.name === e.name);
		R(e.raw_value === st(u[t]).raw_value && r && [
			"threshold",
			"decline_threshold",
			"comparison_operator",
			"weight",
			"source"
		].every((t) => e[t] === r[t]), "scenario factor fact and retained policy"), t === "k1_history" && R(V(e, r), "held-fixed observed K-1 factor");
	}
	let v = cn(r.factor_changes, "factor changes");
	R(v.length === p.factors.length, "factor change count");
	let y = /* @__PURE__ */ new Set();
	for (let e of v) {
		let t = z(e, "factor change"), r = n.decision.factors.find((e) => e.name === t.name), i = p.factors.find((e) => e.name === t.name);
		R(B(t.name) && !y.has(t.name) && r && i && V(t.baseline, r) && V(t.projected, i) && t.changed === !V(r, i) && t.basis === (t.name === "k1_history" ? "observed_history" : "projected_current"), "factor change links"), y.add(t.name), R(t.projected_fact_id === st(u[t.name === "uca_positive" ? "uca_cash_flow" : t.name]).fact_id, "factor projected reference");
	}
	let b = z(r.outcome_change, "outcome change");
	R(b.baseline === n.decision.outcome && b.projected === p.outcome && b.changed === (b.baseline !== b.projected), "outcome change links");
	let x = cn(r.reason_changes, "reason changes"), S = Array.from(new Set([...n.decision.reasons, ...p.reasons].map((e) => e.code))).filter((e) => !V(n.decision.reasons.find((t) => t.code === e) ?? null, p.reasons.find((t) => t.code === e) ?? null));
	R(x.length === S.length, "reason changes count");
	let C = /* @__PURE__ */ new Set();
	for (let e of x) {
		let t = z(e, "reason change"), r = n.decision.reasons.find((e) => e.code === t.code) ?? null, i = p.reasons.find((e) => e.code === t.code) ?? null;
		R(B(t.code) && S.includes(t.code) && !C.has(t.code) && V(t.baseline, r) && V(t.projected, i) && t.change === (r === null ? "added" : i === null ? "removed" : "changed"), "reason change links"), C.add(t.code);
	}
}
function mn(e) {
	return R(typeof e == "object" && !!e, "operand path object"), e;
}
function hn(e, t) {
	let n = z(e, "original comparison");
	Rt(n, 0, 100), R(["commercial-scenario-comparison-v1", "commercial-scenario-comparison-v2"].includes(String(n.schema_version)) && n.storage_serialization_version === "scenario-comparison-json-v1" && n.persisted === !0 && un(n.comparison_id) && un(n.case_id) && un(n.baseline_run_id) && Pt(n.baseline_revision) && Ft(n.payload_hash), "comparison storage identity"), R(Lt(n.recorded_at) && /^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{6}\+00:00$/.test(n.recorded_at) && Mt(n.actor), "comparison recording time/actor"), Kt(n.recording), R(t === `"scenario-comparison-json-v1:${n.case_id}:${n.comparison_id}:${n.payload_hash}"`, "comparison ETag");
	let r = z(n.preview, "original preview"), { b: i, a } = dn(r);
	R(i.case_id === n.case_id && i.revision === n.baseline_revision && i.run_id === n.baseline_run_id, "inner/outer original baseline");
	let o = r.schema_version === $t && r.scenario_definition_version === "commercial-scenario-definition-v2" && r.calculation_version === "commercial-calculation-v2" && a.schema_version === "commercial-assessment-v2" && a.calculation_version === "commercial-calculation-v2" && a.serialization_version === "assessment-json-v2";
	return {
		record: n,
		etag: t,
		preview: o ? fn(r) : null,
		compatibility: o ? null : `Original definition: ${r.scenario_definition_version} / ${r.calculation_version}; baseline ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON remains available; typed projection and new preview are unavailable.`
	};
}
function gn(e, t) {
	let n = z(e, "comparison page");
	Rt(n, 0, 100);
	let r = cn(n.items, "comparison summaries");
	R(r.length <= 25 && (n.next_cursor === null || B(n.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(n.next_cursor)), "bounded comparison page/cursor");
	let i = /* @__PURE__ */ new Set();
	for (let e of r) {
		let n = z(e, "comparison summary");
		R(n.case_id === t && un(n.comparison_id) && un(n.baseline_run_id) && Pt(n.baseline_revision) && Lt(n.recorded_at) && Ft(n.preview_fingerprint) && !i.has(String(n.comparison_id)), "summary identity"), i.add(String(n.comparison_id)), R(["commercial-scenario-comparison-v1", "commercial-scenario-comparison-v2"].includes(String(n.schema_version)) && n.storage_serialization_version === "scenario-comparison-json-v1" && (n.preview_schema_version === $t && n.preview_serialization_version === en || n.preview_schema_version === "commercial-scenario-preview-v1" && n.preview_serialization_version === "scenario-preview-json-v1") && B(n.policy_version) && B(n.scenario_definition_version) && B(n.calculation_version), "summary versions");
		let r = cn(n.scenarios, "scenario summaries"), a = /* @__PURE__ */ new Set();
		R(r.length >= 1 && r.length <= 10 && n.scenario_count === r.length, "scenario count");
		for (let e of r) {
			let t = z(e, "scenario summary");
			R(B(t.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(t.scenario_key) && !a.has(t.scenario_key) && nn(t.name, 120) === t.name, "summary command"), a.add(t.scenario_key);
		}
	}
	return n;
}
// src/caseRecovery.ts
var _n = "spreadline.pending-write.v1", vn = "spreadline.case-selection.v1", yn = 1e6, bn = 21e5;
function xn(e, t = w) {
	let n = z(e, "pending write");
	if (n.version !== "scenario-comparison-write-v1") return Tn(e, t);
	R(n.kind === "comparison" && Nt(n.id) && n.apiBase === t && B(n.body) && wn(n.body) <= yn, "comparison recovery envelope");
	let r = on(JSON.parse(n.body));
	R(["commercial-scenario-comparison-create-v1", "commercial-scenario-comparison-create-v2"].includes(r.schema_version) && JSON.stringify(r) === n.body && Nt(n.caseId) && Pt(n.baselineRevision) && n.baselineRunId === r.baseline_run_id && Ft(n.baselinePayloadHash), "comparison recovery identity/command");
	let i = z(n.context, "comparison recovery context");
	return R(It(i.period_start) && It(i.period_end) && It(i.assessment_as_of) && i.period_start <= i.period_end && i.period_end <= i.assessment_as_of && B(i.policy_version) && B(i.scenario_definition_version) && B(i.calculation_version), "comparison recovery dates/versions"), R(Object.keys(n).length === 10 && [
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
	].every((e) => e in n), "comparison recovery fields"), R(Object.keys(i).length === 6 && [
		"period_start",
		"period_end",
		"assessment_as_of",
		"policy_version",
		"scenario_definition_version",
		"calculation_version"
	].every((e) => e in i), "comparison context fields"), Object.freeze(i), Object.freeze(n);
}
function Sn(e) {
	let t = fn(e), n = {
		...sn(t),
		schema_version: "commercial-scenario-comparison-create-v2",
		expected_preview_fingerprint: t.fingerprint.value
	};
	return xn({
		version: "scenario-comparison-write-v1",
		kind: "comparison",
		id: crypto.randomUUID(),
		apiBase: w,
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
function Cn() {
	return ie();
}
function wn(e) {
	return new TextEncoder().encode(e).length;
}
function Tn(e, t = w) {
	let n = z(e, "recovery operation");
	R(n.version === "case-write-v1" && Nt(n.id) && n.apiBase === t && B(n.body) && wn(n.body) <= yn, "recovery version, backend or size");
	let r = JSON.parse(n.body);
	R(JSON.stringify(r) === n.body, "unchanged canonical browser command");
	let i = [
		"version",
		"id",
		"apiBase",
		"body",
		"kind"
	];
	if (n.kind === "create") Ut(r);
	else {
		R(n.kind === "edit" && Nt(n.caseId) && Pt(n.baseRevision), "edit recovery identity"), R(B(n.etag) && RegExp(`^"case-json-v1:${n.caseId}:${n.baseRevision}:[0-9a-f]{64}"$`).test(n.etag), "edit recovery ETag");
		let e = Wt(r), t = z(n.review, "review field"), a = z(n.context, "review context");
		R(t.path === e.field_path && B(t.label) && B(t.period) && (M(t.value) || typeof t.value == "number" && Number.isFinite(t.value)) && [
			"USD",
			"%",
			"months"
		].includes(String(t.unit)), "recovery review");
		for (let e of ["min", "max"]) R(t[e] === void 0 || M(t[e]) || typeof t[e] == "number" && Number.isFinite(t[e]), "field range");
		R(t.integer === void 0 || typeof t.integer == "boolean", "field integer"), R(Object.keys(t).every((e) => [
			"path",
			"label",
			"period",
			"value",
			"unit",
			"min",
			"max",
			"integer"
		].includes(e)), "review fields");
		let o = Vt(e.field_path), s = o[0], c = o[o.length - 1], l = ["annual_rate", "ownership_percentage"].includes(c) ? "decimal fraction" : c === "term_months" ? "months" : "USD dollars";
		R(It(a.assessment_as_of) && a.basis === (s === "years" ? "annual_financials" : s === "working_capital" ? "working_capital" : "current_assumptions") && a.unit === l && t.unit === (l === "decimal fraction" ? "%" : l === "months" ? "months" : "USD"), "recovery context"), R(["years", "working_capital"].includes(s) ? It(a.period_start) && It(a.period_end) && a.period_start <= a.period_end && a.period_end <= a.assessment_as_of : a.period_start === null && a.period_end === null, "recovery period"), R(s === "guarantors" ? a.guarantor_index === Number(o[1]) && B(a.guarantor_name) : a.guarantor_index === null && a.guarantor_name === null, "recovery guarantor"), R(Object.keys(a).length === 7 && [
			"basis",
			"assessment_as_of",
			"period_start",
			"period_end",
			"guarantor_index",
			"guarantor_name",
			"unit"
		].every((e) => e in a), "recovery context fields"), i.push("caseId", "baseRevision", "etag", "review", "context");
	}
	R(Object.keys(n).length === i.length && Object.keys(n).every((e) => i.includes(e)), "recovery fields");
	let a = n;
	return a.kind === "edit" && (Object.freeze(a.review), Object.freeze(a.context)), Object.freeze(a);
}
function En(e, t) {
	let n = Ut({
		input: e,
		rationale: H(t)
	});
	return Tn({
		version: "case-write-v1",
		id: crypto.randomUUID(),
		apiBase: w,
		kind: "create",
		body: JSON.stringify(n)
	});
}
function Dn(e, t, n) {
	R(e.assessment, "supported saved assessment");
	let r = Ht(e.assessment.normalized_input, t.path);
	R(he(r.value, t.prior) && he(n.value, t.prior) && n.path === t.path && !he(t.next, t.prior), "reviewed base input");
	let i = Wt({
		field_path: t.path,
		new_value: t.next,
		rationale: H(t.rationale)
	});
	return Tn({
		version: "case-write-v1",
		id: crypto.randomUUID(),
		apiBase: w,
		kind: "edit",
		body: JSON.stringify(i),
		caseId: e.snapshot.case_id,
		baseRevision: e.snapshot.revision,
		etag: e.etag,
		review: { ...n },
		context: r.context
	});
}
function On(e, t) {
	try {
		R(e, "browser recovery storage");
		let n = xn(t), r = e.getItem(_n);
		r && R(V(xn(JSON.parse(r)), n), "another unresolved operation");
		let i = JSON.stringify(n);
		R(wn(i) <= bn, "recovery journal size"), e.setItem(_n, i), R(e.getItem(_n) === i, "retained in-page recovery record");
	} catch {
		throw Error("This tab could not keep the write for recovery. Nothing was sent. Resolve its pending record or restore in-page recovery tracking before saving.");
	}
}
function kn(e, t = w) {
	try {
		if (!e) return {
			operation: null,
			error: "This browser cannot keep a saved write for recovery. Saved reads and unsaved assessment remain available."
		};
		let n = e.getItem(_n);
		return n ? (R(wn(n) <= bn, "recovery size"), {
			operation: xn(JSON.parse(n), t),
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
function An(e, t) {
	R(e, "browser recovery storage");
	let n = e.getItem(_n);
	n && R(xn(JSON.parse(n)).id === t, "matching recovery record"), e.removeItem(_n), R(e.getItem(_n) === null, "cleared recovery record");
}
function jn(e) {
	R(e, "browser recovery storage"), e.removeItem(_n), R(e.getItem(_n) === null, "discarded recovery record");
}
function Mn(e) {
	try {
		let t = e?.getItem(vn);
		if (!t || t.length > 500) return null;
		let n = z(JSON.parse(t), "saved selection");
		return R(n.version === "case-selection-v1" && n.apiBase === w && Nt(n.caseId) && (n.revision === "latest" || Pt(n.revision)), "saved selection identity"), R(Object.keys(n).length === 4, "saved selection fields"), {
			caseId: n.caseId,
			revision: n.revision
		};
	} catch {
		return null;
	}
}
function Nn(e, t) {
	try {
		t ? e?.setItem(vn, JSON.stringify({
			version: "case-selection-v1",
			apiBase: w,
			...t
		})) : e?.removeItem(vn);
	} catch {}
}
// src/workspace.ts
var Pn = {
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
}, Fn = "A saved write needs confirmation. Retry the exact write; no proposal is accepted locally yet.";
function In(e) {
	let t = kn(e).operation;
	if (t && t.kind !== "comparison") return {
		...Pn,
		status: "unavailable",
		action: "write",
		filename: "Pending saved write",
		error: Fn
	};
	let n = Mn(e)?.caseId ?? (t?.kind === "comparison" ? t.caseId : null);
	return n ? {
		...Pn,
		status: "evaluating",
		action: "open",
		filename: `Saved case ${n}`
	} : Pn;
}
function Ln(e, t) {
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
function Rn(e, t) {
	let n = t.path.split("/").slice(1), r = JSON.parse(JSON.stringify(e)), i = r;
	for (let e of n.slice(0, -1)) i = i[e];
	return i[n[n.length - 1]] = t.next, r;
}
function zn(e, t) {
	return t === "%" ? `${me(String(e), 2)}%` : t === "months" ? `${e} month${String(e) === "1" ? "" : "s"}` : `$${ye(String(e))}`;
}
function Bn(e) {
	let { min: t, max: n, unit: r } = e;
	return t !== void 0 && n !== void 0 ? `${zn(t, r)} to ${zn(n, r)}` : t === void 0 ? `up to ${zn(n, r)}` : `${zn(t, r)} or more`;
}
function Vn(e, t, n, r = {}) {
	let i = e.unit === "%" ? Ae(t) : e.integer ? Me(t) : Oe(t);
	if (!i.ok) throw Error(i.message);
	let a = i.value, o = a;
	if (e.integer) {
		if (!Number.isSafeInteger(Number(a))) throw Error("Enter a safe whole number of months.");
		o = Number(a);
	}
	if (e.min !== void 0 && N(a, String(e.min)) < 0 || e.max !== void 0 && N(a, String(e.max)) > 0) throw Error(`Value is outside the allowed range: ${Bn(e)}.`);
	if ((r.requireRationale ?? !0) && !n.trim()) throw Error("A nonblank rationale is required.");
	if (he(o, e.value)) throw Error("Enter a changed value or cancel.");
	return o;
}
// src/workspaceDom.ts
var Hn = document;
function Un(e) {
	Hn = e;
}
function Wn(e) {
	return Hn.querySelector(e);
}
function Gn(e) {
	let t = e.getRootNode();
	return t instanceof ShadowRoot ? t.activeElement : document.activeElement;
}
// node_modules/react/cjs/react-jsx-runtime.production.min.js
var Kn = /* @__PURE__ */ e(((e) => {
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
})), U = (/* @__PURE__ */ e(((e, t) => {
	t.exports = Kn();
})))();
function qn(e) {
	e?.isConnected && !(e instanceof HTMLButtonElement && e.disabled) ? e.focus() : Wn("[data-focus-fallback]")?.focus();
}
function Jn({ title: e, onCancel: t, restoreFocus: n, children: r }) {
	let i = (0, A.useRef)(null);
	return (0, A.useEffect)(() => {
		let e = i.current;
		return e?.showModal(), () => {
			e?.close(), qn(n);
		};
	}, [n]), /* @__PURE__ */ (0, U.jsx)("dialog", {
		ref: i,
		"aria-label": e,
		onCancel: (e) => {
			e.preventDefault(), t();
		},
		onKeyDown: (e) => {
			if (e.key !== "Tab") return;
			let t = Array.from(e.currentTarget.querySelectorAll("input:not(:disabled),textarea:not(:disabled),button:not(:disabled)")), n = t[0], r = t[t.length - 1];
			e.shiftKey && Gn(e.currentTarget) === n ? (e.preventDefault(), r?.focus()) : !e.shiftKey && Gn(e.currentTarget) === r && (e.preventDefault(), n?.focus());
		},
		children: r
	});
}
function Yn({ input: e, onSave: t, onCancel: n, restoreFocus: r }) {
	let [i, a] = (0, A.useState)(""), [o, s] = (0, A.useState)("");
	return /* @__PURE__ */ (0, U.jsx)(Jn, {
		title: "Save case",
		onCancel: n,
		restoreFocus: r,
		children: /* @__PURE__ */ (0, U.jsxs)("form", {
			onSubmit: (e) => {
				if (e.preventDefault(), !i.trim()) s("Enter a rationale for this save (up to 2,000 characters).");
				else try {
					H(i), t(i), n();
				} catch (e) {
					s(e instanceof Error ? e.message : String(e));
				}
			},
			children: [
				/* @__PURE__ */ (0, U.jsx)("h2", { children: "Save case" }),
				/* @__PURE__ */ (0, U.jsxs)("p", { children: [
					e.borrower_name,
					" · as of ",
					e.assessment_as_of
				] }),
				/* @__PURE__ */ (0, U.jsxs)("label", { children: ["Save rationale", /* @__PURE__ */ (0, U.jsx)("textarea", {
					autoFocus: !0,
					rows: 3,
					value: i,
					onChange: (e) => a(e.target.value)
				})] }),
				/* @__PURE__ */ (0, U.jsx)("p", {
					className: "fine",
					children: "Saving re-checks this case under the current policy and stores it as a saved revision. Edits made before saving are not listed separately in its history. Rationale: up to 2,000 characters."
				}),
				o && /* @__PURE__ */ (0, U.jsx)("p", {
					role: "alert",
					children: o
				}),
				/* @__PURE__ */ (0, U.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, U.jsx)("button", {
						type: "button",
						onClick: n,
						children: "Cancel"
					}), /* @__PURE__ */ (0, U.jsx)("button", {
						className: "primary",
						type: "submit",
						children: "Save"
					})]
				})
			]
		})
	});
}
function Xn({ onDiscard: e, onCancel: t, restoreFocus: n }) {
	let [r, i] = (0, A.useState)("");
	return /* @__PURE__ */ (0, U.jsxs)(Jn, {
		title: "Discard recovery tracking",
		onCancel: t,
		restoreFocus: n,
		children: [
			/* @__PURE__ */ (0, U.jsx)("h2", { children: "Discard recovery tracking?" }),
			/* @__PURE__ */ (0, U.jsx)("p", { children: "A previous write might already be saved. Discarding this tab's tracking does not undo that write and loses its exact retry key. Check saved cases before creating another case." }),
			r && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "alert",
				children: r
			}),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, U.jsx)("button", {
					className: "primary",
					autoFocus: !0,
					onClick: t,
					children: "Keep tracking"
				}), /* @__PURE__ */ (0, U.jsx)("button", {
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
// src/EditDialog.tsx
function Zn({ field: e, onCancel: t, onSubmit: n, restoreFocus: r, saved: i = !1, proposal: a }) {
	let o = (0, A.useRef)(null), [s, c] = (0, A.useState)(We(a?.next ?? e.value, e.unit)), [l, u] = (0, A.useState)(a?.rationale ?? ""), [d, f] = (0, A.useState)("");
	function p(t) {
		try {
			return Vn(e, t, "", { requireRationale: !1 }), "";
		} catch (e) {
			return e instanceof Error ? e.message : "Review this value.";
		}
	}
	return (0, A.useEffect)(() => {
		let e = o.current;
		return e?.showModal(), () => {
			e?.close(), qn(r);
		};
	}, [r]), /* @__PURE__ */ (0, U.jsx)("dialog", {
		ref: o,
		"aria-labelledby": "edit-title",
		onKeyDown: (e) => {
			if (e.key !== "Tab") return;
			let t = Array.from(e.currentTarget.querySelectorAll("input,textarea,button:not(:disabled)")), n = t[0], r = t[t.length - 1];
			e.shiftKey && Gn(e.currentTarget) === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && Gn(e.currentTarget) === r && (e.preventDefault(), n.focus());
		},
		onCancel: (e) => {
			e.preventDefault(), t();
		},
		children: /* @__PURE__ */ (0, U.jsxs)("form", {
			onSubmit: (t) => {
				t.preventDefault();
				try {
					let t = Vn(e, s, l, { requireRationale: i });
					i && H(l), n({
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
				/* @__PURE__ */ (0, U.jsxs)("h2", {
					id: "edit-title",
					children: ["Edit ", e.label]
				}),
				/* @__PURE__ */ (0, U.jsxs)("p", { children: [
					e.period,
					" · ",
					e.unit,
					/* @__PURE__ */ (0, U.jsx)("br", {}),
					"Current value: ",
					We(e.value, e.unit)
				] }),
				/* @__PURE__ */ (0, U.jsxs)("label", { children: [
					"New value",
					" ",
					/* @__PURE__ */ (0, U.jsx)("input", {
						autoFocus: !0,
						value: s,
						placeholder: e.unit === "%" ? "10.5%" : e.integer ? "120" : "500000.00",
						"aria-describedby": "edit-value-help",
						onBlur: () => f(p(s)),
						onChange: (e) => {
							c(e.target.value), p(e.target.value) || f("");
						},
						inputMode: "decimal"
					})
				] }),
				/* @__PURE__ */ (0, U.jsxs)("small", {
					id: "edit-value-help",
					children: [
						e.unit === "%" ? "Percentage, such as 10.5" : e.integer ? "Whole months, such as 120" : "Dollar amount, such as 600,000",
						e.min === void 0 ? "" : ` · minimum ${We(e.min, e.unit)}`,
						e.max === void 0 ? "" : ` · maximum ${We(e.max, e.unit)}`
					]
				}),
				/* @__PURE__ */ (0, U.jsxs)("label", { children: [
					i ? "Rationale" : "Rationale (optional)",
					" ",
					/* @__PURE__ */ (0, U.jsx)("textarea", {
						value: l,
						placeholder: "Explain the source or reason for this edit",
						onChange: (e) => {
							u(e.target.value), e.target.value.trim() && f("");
						},
						rows: 3
					})
				] }),
				d && /* @__PURE__ */ (0, U.jsx)("p", {
					role: "alert",
					children: d
				}),
				/* @__PURE__ */ (0, U.jsx)("p", {
					className: "fine",
					children: i ? "The edit creates a saved revision only after an accepted server receipt. It uses the server's selected policy; earlier revisions stay unchanged. Rationale: at most 2,000 characters." : "The edit is applied only after a successful backend evaluation."
				}),
				/* @__PURE__ */ (0, U.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, U.jsx)("button", {
						type: "button",
						onClick: t,
						children: "Cancel"
					}), /* @__PURE__ */ (0, U.jsx)("button", {
						className: "primary",
						type: "submit",
						children: i ? "Save revision" : "Evaluate edit"
					})]
				})
			]
		})
	});
}
// src/components/PagedJson.tsx
function Qn({ value: e, className: t, title: n, noun: r }) {
	let i = (0, A.useMemo)(() => {
		let t = new TextEncoder().encode(JSON.stringify(e, null, 2)), n = [], r = new TextDecoder("utf-8", { fatal: !0 });
		for (let e = 0; e < t.length;) {
			let i = Math.min(e + 65536, t.length);
			for (; i < t.length && (t[i] & 192) == 128;) i--;
			n.push(r.decode(t.slice(e, i))), e = i;
		}
		return n;
	}, [e]), [a, o] = (0, A.useState)(0);
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: t,
		children: [
			/* @__PURE__ */ (0, U.jsxs)("p", { children: [
				n,
				" · page ",
				a + 1,
				" of ",
				i.length,
				" · up to 64 KiB of UTF-8 text per page"
			] }),
			/* @__PURE__ */ (0, U.jsx)("pre", { children: i[a] }),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, U.jsxs)("button", {
					disabled: a === 0,
					onClick: () => o(a - 1),
					children: [
						"Previous ",
						r,
						" page"
					]
				}), /* @__PURE__ */ (0, U.jsxs)("button", {
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
// src/metricDisplay.ts
function $n(e) {
	if (e.status === "not_applicable") return "Not applicable";
	let t = e.reported_value ?? e.raw_value;
	return M(t) ? `${P(t, e.display_precision ?? 0)} ${e.unit}` : String(t);
}
// src/storageAvailability.ts
var er = /* @__PURE__ */ new Set(), tr = !1;
function nr(e) {
	tr !== !e && (tr = !e, er.forEach((e) => e()));
}
var rr = () => tr, ir = (e) => (er.add(e), () => {
	er.delete(e);
}), ar = class extends Error {
	status;
	code;
	certain;
	retryAfter;
	fieldErrors;
	constructor(e, t = 0, n = "outcome_uncertain", r = !1, i = null, a = []) {
		super(e), this.status = t, this.code = n, this.certain = r, this.retryAfter = i, this.fieldErrors = a, this.name = "CaseApiError";
	}
};
function or(e) {
	return e instanceof ar ? e : new ar(e instanceof Error ? e.message : String(e));
}
async function sr(e, t, n) {
	let r;
	try {
		r = await Dt(e, t, n);
	} catch {
		throw new ar("The response was lost or unavailable. Retry the exact saved write if one is pending.");
	}
	let i;
	try {
		i = await r.json();
	} catch {
		throw new ar(`Saved-case service returned an unreadable response (${r.status}).`, r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null, t = "request_failed", n = `Saved-case request failed (${r.status}).`;
		throw e && typeof e == "object" && !Array.isArray(e) ? ("code" in e && typeof e.code == "string" && (t = e.code), "message" in e && typeof e.message == "string" && (n = e.message)) : typeof e == "string" ? n = e : Array.isArray(e) && (n = e.map((e) => e && typeof e == "object" ? `${Array.isArray(e.loc) ? e.loc.join(".") : "input"}: ${String(e.msg ?? "Invalid input")}` : "Invalid input").join("; ")), t === "storage_not_configured" && nr(!1), t === "storage_not_configured" && (n = "Saved cases are not enabled for this local workspace. You can continue with unsaved assessments."), new ar(n, r.status, t, [
			400,
			404,
			412,
			413,
			422,
			428
		].includes(r.status), r.headers.get("Retry-After"), kt(i, e));
	}
	return nr(!0), {
		response: r,
		body: i
	};
}
function cr(e, t) {
	return R(Nt(e) && (t === "latest" || Pt(t)), "requested case/revision"), `/cases/${encodeURIComponent(e)}${t === "latest" ? "" : `/revisions/${t}`}`;
}
async function lr(e, t, n, r = fetch) {
	let { response: i, body: a } = await sr(cr(e, t), { signal: n }, r), o = Gt(a, i.headers.get("ETag"));
	return R(o.snapshot.case_id === e && (t === "latest" || o.snapshot.revision === t), "requested snapshot identity"), o;
}
async function ur(e, t, n = fetch) {
	let r = Tn(e), i = {
		"Content-Type": "application/json",
		"Idempotency-Key": r.id
	};
	r.kind === "edit" && (i["If-Match"] = r.etag);
	let { response: a, body: o } = await sr(r.kind === "create" ? "/cases" : `${cr(r.caseId, "latest")}/revisions`, {
		method: "POST",
		headers: i,
		body: r.body,
		signal: t
	}, n);
	try {
		R(a.status === 201 && ["true", "false"].includes(a.headers.get("Idempotency-Replayed") ?? ""), "accepted receipt status/replay header");
		let e = Gt(o, a.headers.get("ETag")), t = e.snapshot;
		if (r.kind === "create") {
			let e = Ut(JSON.parse(r.body));
			R(t.revision === 1 && t.event.kind === "creation" && t.event.rationale === e.rationale && V(t.normalized_input, e.input), "creation receipt command");
		} else {
			let e = Wt(JSON.parse(r.body));
			R(t.case_id === r.caseId && t.parent_revision === r.baseRevision && t.revision === r.baseRevision + 1 && t.event.field_path === e.field_path && t.event.after === e.new_value && t.event.before === r.review.value && t.event.rationale === e.rationale && V(t.event.context, r.context), "edit receipt command"), R(Ht(t.normalized_input, e.field_path).value === e.new_value, "accepted edited input");
		}
		return {
			view: e,
			replayed: a.headers.get("Idempotency-Replayed") === "true"
		};
	} catch (e) {
		throw new ar(`The write may be saved, but its receipt could not be verified: ${e instanceof Error ? e.message : String(e)}`, a.status);
	}
}
var dr = (e) => `?${new URLSearchParams({
	limit: "25",
	...e ? { after: e } : {}
})}`;
async function fr(e, t, n = fetch, r = {}) {
	let { body: i } = await sr(`/cases?${new URLSearchParams({
		limit: "25",
		...e ? { after: e } : {},
		...r.q ? { q: r.q } : {},
		...r.outcome ? { outcome: r.outcome } : {},
		...r.sort && r.sort !== "created" ? { sort: r.sort } : {}
	})}`, { signal: t }, n);
	return Yt(i);
}
async function pr(e, t, n, r = fetch) {
	let { body: i } = await sr(`${cr(e, "latest")}/revisions${dr(t)}`, { signal: n }, r);
	return Xt(i, e);
}
async function mr(e, t, n = fetch) {
	let { body: r } = await sr(`${cr(e.snapshot.case_id, e.snapshot.revision)}/replay`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
		signal: t
	}, n);
	return Zt(r, e);
}
// src/SavedCases.tsx
function hr(e, t, n) {
	let r = {
		key: e,
		items: [],
		next: null,
		loading: !0,
		error: ""
	}, [i, a] = (0, A.useState)(r), o = (0, A.useRef)(e);
	o.current = e;
	let s = (0, A.useRef)(t);
	s.current = t;
	let c = (0, A.useRef)(null), l = (0, A.useRef)(0), u = (0, A.useRef)(/* @__PURE__ */ new Set());
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
				error: or(e).message
			}));
		} finally {
			c.current === i && (c.current = null);
		}
	}
	return (0, A.useEffect)(() => (d(null), () => {
		l.current++, c.current?.abort(), c.current = null;
	}), [e]), {
		...i.key === e ? i : r,
		refresh: () => void d(null),
		more: () => {
			i.next && d(i.next);
		}
	};
}
function gr({ onOpen: e, onClose: t }) {
	let [n, r] = (0, A.useState)(""), [i, a] = (0, A.useState)(""), [o, s] = (0, A.useState)(""), [c, l] = (0, A.useState)("created");
	(0, A.useEffect)(() => {
		let e = setTimeout(() => a(n.trim()), 200);
		return () => clearTimeout(e);
	}, [n]);
	let u = !!(i || o || c !== "created"), d = hr(`cases:${i}:${o}:${c}`, (e, t) => fr(e, t, fetch, {
		q: i,
		outcome: o,
		sort: c
	}), (e) => e.case_id);
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel caseList",
		"aria-label": "Saved cases",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("h2", { children: "Saved cases" }), /* @__PURE__ */ (0, U.jsx)("p", { children: "Newest creations first · local saved assessments" })] }), /* @__PURE__ */ (0, U.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, U.jsx)("button", {
						onClick: d.refresh,
						children: "Refresh saved cases"
					}), /* @__PURE__ */ (0, U.jsx)("button", {
						onClick: t,
						children: "Close saved cases"
					})]
				})]
			}),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "caseFilters",
				children: [
					/* @__PURE__ */ (0, U.jsxs)("label", { children: [
						"Search saved cases",
						/* @__PURE__ */ (0, U.jsx)("input", {
							"aria-label": "Search saved cases",
							value: n,
							maxLength: 120,
							placeholder: "Borrower name",
							onChange: (e) => r(e.target.value)
						}),
						/* @__PURE__ */ (0, U.jsx)("small", { children: "Literal borrower-name search · ASCII case-insensitive" })
					] }),
					/* @__PURE__ */ (0, U.jsxs)("label", { children: ["Filter by outcome", /* @__PURE__ */ (0, U.jsxs)("select", {
						"aria-label": "Filter by outcome",
						value: o,
						onChange: (e) => s(e.target.value),
						children: [
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "",
								children: "All outcomes"
							}),
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "approve",
								children: "Approve"
							}),
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "review",
								children: "Review"
							}),
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "decline",
								children: "Decline"
							})
						]
					})] }),
					/* @__PURE__ */ (0, U.jsxs)("label", { children: ["Sort saved cases", /* @__PURE__ */ (0, U.jsxs)("select", {
						"aria-label": "Sort saved cases",
						value: c,
						onChange: (e) => l(e.target.value),
						children: [/* @__PURE__ */ (0, U.jsx)("option", {
							value: "created",
							children: "Newest creation"
						}), /* @__PURE__ */ (0, U.jsx)("option", {
							value: "updated",
							children: "Latest update"
						})]
					})] })
				]
			}),
			d.loading && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "status",
				children: "Loading saved cases…"
			}),
			d.error && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "alert",
				children: d.error
			}),
			!d.loading && !d.error && !d.items.length && /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("p", { children: u ? "No saved cases match these filters." : "No saved cases yet. Save an accepted dated assessment to begin." }), u && /* @__PURE__ */ (0, U.jsx)("button", {
				type: "button",
				onClick: () => {
					r(""), a(""), s(""), l("created");
				},
				children: "Clear filters"
			})] }),
			d.items.map((t) => /* @__PURE__ */ (0, U.jsxs)("article", {
				className: "caseRow",
				children: [/* @__PURE__ */ (0, U.jsxs)("div", { children: [
					/* @__PURE__ */ (0, U.jsx)("h3", { children: t.borrower_name }),
					/* @__PURE__ */ (0, U.jsx)("code", { children: t.case_id }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Created ",
						t.created_at,
						" · Revision ",
						t.revision,
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						"Last recorded ",
						t.recorded_at
					] }),
					t.definition_supported !== void 0 && /* @__PURE__ */ (0, U.jsx)("p", { children: t.definition_supported ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
						t.outcome?.toUpperCase(),
						" · DSCR",
						" ",
						t.dscr ?? "Unavailable",
						" · requested",
						" ",
						t.requested_amount === null || t.requested_amount === void 0 ? "Unavailable" : `$${P(t.requested_amount, 2)}`,
						" ",
						"· as of ",
						t.assessment_as_of
					] }) : "Archived definition · original JSON only" })
				] }), /* @__PURE__ */ (0, U.jsx)("button", {
					"aria-label": `Open ${t.borrower_name} case ${t.case_id}`,
					onClick: () => e({
						caseId: t.case_id,
						revision: "latest"
					}),
					children: "Open case"
				})]
			}, t.case_id)),
			d.next && /* @__PURE__ */ (0, U.jsx)("button", {
				disabled: d.loading,
				onClick: d.more,
				children: "Load more saved cases"
			})
		]
	});
}
function _r({ saved: e, active: t, onOpen: n }) {
	let r = e.view.snapshot, i = t ? e.selection === "latest" ? `Revision ${r.revision} · Latest when last refreshed` : e.selection === "revision" ? `Historical revision ${r.revision}` : `Acknowledged revision ${r.revision} · Latest unconfirmed` : `Previous saved revision ${r.revision} (inactive)`;
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "savedContext",
		"aria-label": "Saved revision context",
		children: [
			/* @__PURE__ */ (0, U.jsx)("strong", { children: i }),
			/* @__PURE__ */ (0, U.jsxs)("details", {
				className: "recordDetails",
				children: [
					/* @__PURE__ */ (0, U.jsx)("summary", { children: "Record details" }),
					/* @__PURE__ */ (0, U.jsxs)("span", { children: [
						"Case ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: r.case_id }),
						" · Run ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: r.run_id })
					] }),
					/* @__PURE__ */ (0, U.jsxs)("span", { children: [
						"Recorded ",
						r.recorded_at,
						" · assessment as of",
						" ",
						r.event.context.assessment_as_of,
						e.headRevision !== null && e.headRevision > r.revision ? ` · Latest known revision ${e.headRevision}` : ""
					] })
				]
			}),
			/* @__PURE__ */ (0, U.jsx)("button", {
				onClick: () => n({
					caseId: r.case_id,
					revision: "latest"
				}),
				children: "Open latest"
			})
		]
	});
}
function vr({ view: e }) {
	let t = e.snapshot;
	return /* @__PURE__ */ (0, U.jsxs)("details", { children: [
		/* @__PURE__ */ (0, U.jsx)("summary", { children: "Stored run and recording metadata" }),
		/* @__PURE__ */ (0, U.jsxs)("p", { children: [
			"Original run ",
			t.run_id,
			" · recorded ",
			t.recorded_at
		] }),
		/* @__PURE__ */ (0, U.jsxs)("p", { children: [
			"Source status: ",
			t.recording.source_status,
			" ",
			t.recording.source_revision ?? "· exact build revision not supplied"
		] }),
		/* @__PURE__ */ (0, U.jsx)("p", { children: "Stored hashes are local consistency identifiers; they do not authenticate documents or people." }),
		/* @__PURE__ */ (0, U.jsx)("pre", { children: JSON.stringify({
			input_hash: t.input_hash,
			payload_hash: t.payload_hash,
			storage_serialization_version: t.storage_serialization_version,
			recording: t.recording
		}, null, 2) })
	] });
}
function yr({ saved: e, active: t, onOpen: n }) {
	let r = e.view, i = r.snapshot, a = i.event, o = hr(`${i.case_id}:${i.revision}`, (e, t) => pr(i.case_id, e, t), (e) => String(e.revision)), [s, c] = (0, A.useState)({
		key: i.run_id,
		result: null,
		error: "",
		loading: !1
	}), l = (0, A.useRef)(null), u = (0, A.useRef)(i.run_id);
	u.current = i.run_id, (0, A.useEffect)(() => (c({
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
			let n = await mr(r, e.signal);
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
				error: or(n).message,
				loading: !1
			});
		} finally {
			l.current === e && (l.current = null);
		}
	}
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel historyPanel",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, U.jsx)("h2", { children: "Saved revision history" }), /* @__PURE__ */ (0, U.jsx)("button", {
					onClick: o.refresh,
					children: "Refresh revisions"
				})]
			}),
			!t && /* @__PURE__ */ (0, U.jsx)("p", { children: "Previous saved selection; its recommendation is inactive." }),
			/* @__PURE__ */ (0, U.jsxs)("p", { children: [
				"Original accepted revisions and server-recorded events. Recorded actor:",
				" ",
				a.actor,
				".",
				a.actor === "prototype-demo-unverified" ? " Archived demonstration identity." : " Configured credential identity."
			] }),
			o.loading && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "status",
				children: "Loading revisions…"
			}),
			o.error && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "alert",
				children: o.error
			}),
			/* @__PURE__ */ (0, U.jsx)("div", {
				className: "revisionList",
				children: o.items.map((e) => /* @__PURE__ */ (0, U.jsxs)("article", {
					className: "caseRow",
					children: [/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsxs)("strong", { children: ["Revision ", e.revision] }), /* @__PURE__ */ (0, U.jsxs)("p", { children: [
						e.rationale,
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						e.recorded_at,
						" · Run ",
						e.run_id
					] })] }), /* @__PURE__ */ (0, U.jsxs)("button", {
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
			o.next && /* @__PURE__ */ (0, U.jsx)("button", {
				disabled: o.loading,
				onClick: o.more,
				children: "Load more revisions"
			}),
			/* @__PURE__ */ (0, U.jsxs)("article", {
				className: "savedEvent",
				"aria-label": "Selected recorded event",
				children: [
					/* @__PURE__ */ (0, U.jsxs)("h3", { children: ["Selected recorded event · revision ", i.revision] }),
					/* @__PURE__ */ (0, U.jsx)("strong", { children: a.kind === "creation" ? "Case creation" : a.field_path }),
					a.kind === "edit" && /* @__PURE__ */ (0, U.jsxs)("p", { children: [
						a.before,
						" → ",
						a.after,
						" · ",
						a.context.unit
					] }),
					/* @__PURE__ */ (0, U.jsx)("p", { children: a.rationale }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						a.context.basis,
						" · as of ",
						a.context.assessment_as_of,
						a.context.period_start ? ` · ${a.context.period_start} – ${a.context.period_end}` : "",
						a.context.guarantor_name === null ? "" : ` · Guarantor ${a.context.guarantor_index}: ${a.context.guarantor_name}`
					] }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Recorded ",
						a.recorded_at,
						" · ",
						a.actor
					] })
				]
			}),
			/* @__PURE__ */ (0, U.jsx)("div", {
				className: "actions",
				children: /* @__PURE__ */ (0, U.jsx)("button", {
					disabled: s.loading,
					onClick: () => void d(),
					children: "Replay this revision (read-only)"
				})
			}),
			s.key === i.run_id && /* @__PURE__ */ (0, U.jsx)("div", {
				className: "replayResult",
				role: "status",
				children: s.loading ? "Checking the retained policy and definition…" : s.error || (s.result ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
					/* @__PURE__ */ (0, U.jsx)("strong", { children: {
						matched: "Matched",
						mismatch: "Mismatch",
						replay_unavailable: "Replay unavailable"
					}[s.result.status] }),
					/* @__PURE__ */ (0, U.jsx)("p", { children: s.result.explanation }),
					s.result.differences.length > 0 && /* @__PURE__ */ (0, U.jsx)("ul", { children: s.result.differences.map((e) => /* @__PURE__ */ (0, U.jsx)("li", { children: e }, e)) })
				] }) : "Replay is read-only; the original result stays selected.")
			}),
			/* @__PURE__ */ (0, U.jsx)(vr, { view: r })
		]
	});
}
function br({ operation: e }) {
	let t = JSON.parse(e.body);
	return e.kind === "comparison" ? /* @__PURE__ */ (0, U.jsxs)("p", { children: [
		"Proposed comparison · Case ",
		e.caseId,
		" · revision",
		" ",
		e.baselineRevision,
		/* @__PURE__ */ (0, U.jsx)("br", {}),
		"Run ",
		e.baselineRunId,
		" · as of",
		" ",
		e.context.assessment_as_of,
		/* @__PURE__ */ (0, U.jsx)("br", {}),
		t.scenarios.map((e) => `${e.name}: ${e.rationale}`).join("; ")
	] }) : e.kind === "edit" ? /* @__PURE__ */ (0, U.jsxs)("p", { children: [
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
		/* @__PURE__ */ (0, U.jsx)("br", {}),
		"Rationale: ",
		t.rationale
	] }) : /* @__PURE__ */ (0, U.jsxs)("p", { children: [
		"Proposed creation: ",
		t.input.borrower_name,
		" · as of",
		" ",
		t.input.assessment_as_of,
		/* @__PURE__ */ (0, U.jsx)("br", {}),
		"Rationale: ",
		t.rationale
	] });
}
function xr({ workspace: e, onDiscard: t, onReview: n, onOpenComparison: r }) {
	let [i, a] = (0, A.useState)("");
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		e.notice && /* @__PURE__ */ (0, U.jsx)("p", {
			className: "writeNotice",
			role: "status",
			children: e.notice
		}),
		(e.operation || e.recoveryError) && /* @__PURE__ */ (0, U.jsxs)("section", {
			className: "pending",
			"aria-label": "Saved write recovery",
			children: [
				/* @__PURE__ */ (0, U.jsx)("h2", { children: e.inFlight ? e.operation?.kind === "comparison" ? "Saving comparison" : "Saving revision" : e.operation ? "Unconfirmed saved write" : "Saved write recovery unavailable" }),
				!e.inFlight && e.operation && /* @__PURE__ */ (0, U.jsxs)("p", {
					className: "recoveryState",
					children: [/* @__PURE__ */ (0, U.jsx)("strong", { children: e.writeError?.status === 409 ? "Conflicting operation key (409)" : "Not confirmed by the server" }), e.writeError?.status === 409 ? " · Inspect saved records before explicitly discarding or creating a new operation key." : " · A timeout, network drop or rejected credential does not mean the write was undone."]
				}),
				e.operation && /* @__PURE__ */ (0, U.jsx)(br, { operation: e.operation }),
				e.operation && /* @__PURE__ */ (0, U.jsxs)("details", { children: [
					/* @__PURE__ */ (0, U.jsx)("summary", { children: "Inspect pending payload" }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Exact operation UUID: ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: e.operation.id }),
						e.operation.kind === "edit" && /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
							/* @__PURE__ */ (0, U.jsx)("br", {}),
							"Original strong ETag: ",
							/* @__PURE__ */ (0, U.jsx)("code", { children: e.operation.etag })
						] })
					] }),
					/* @__PURE__ */ (0, U.jsx)(Qn, {
						value: JSON.parse(e.operation.body),
						title: "Pending command JSON",
						noun: "payload",
						className: "pendingPayload"
					})
				] }),
				/* @__PURE__ */ (0, U.jsx)("p", {
					className: "fine",
					children: "Tracking is held only in page memory. Reloading or closing this page loses the exact retry key; inspect saved records before making another write."
				}),
				/* @__PURE__ */ (0, U.jsx)("p", { children: e.recoveryError || e.writeError?.message || "This tab keeps the original command for exact retry. No new accepted event is recorded until the receipt is verified." }),
				e.writeError?.retryAfter && /* @__PURE__ */ (0, U.jsxs)("p", { children: [
					"Retry after ",
					e.writeError.retryAfter,
					" second(s)."
				] }),
				/* @__PURE__ */ (0, U.jsxs)("div", {
					className: "actions",
					children: [
						e.operation && /* @__PURE__ */ (0, U.jsx)("button", {
							className: "primary",
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
						e.operation?.kind === "edit" && /* @__PURE__ */ (0, U.jsx)("button", {
							onClick: () => void e.openSaved({
								caseId: e.operation.caseId,
								revision: e.operation.baseRevision
							}),
							children: "View stored baseline"
						}),
						e.operation?.kind === "comparison" && /* @__PURE__ */ (0, U.jsx)("button", {
							onClick: () => {
								e.operation?.kind === "comparison" && e.openSaved({
									caseId: e.operation.caseId,
									revision: e.operation.baselineRevision
								});
							},
							children: "View stored baseline"
						}),
						/* @__PURE__ */ (0, U.jsx)("button", {
							disabled: e.inFlight,
							onClick: (e) => t(e.currentTarget),
							children: "Stop tracking this unconfirmed write…"
						})
					]
				}),
				i && /* @__PURE__ */ (0, U.jsx)("p", {
					role: "alert",
					children: i
				})
			]
		}),
		e.conflict && /* @__PURE__ */ (0, U.jsxs)("section", {
			className: "pending conflict",
			"aria-label": "Conflicting saved edit",
			children: [
				/* @__PURE__ */ (0, U.jsx)("h2", { children: "Review conflicting edit" }),
				/* @__PURE__ */ (0, U.jsxs)("p", { children: [/* @__PURE__ */ (0, U.jsx)("strong", { children: "Stale strong ETag (412)" }), " · The stored revision changed before this new operation was accepted."] }),
				/* @__PURE__ */ (0, U.jsx)(br, { operation: e.conflict.operation }),
				/* @__PURE__ */ (0, U.jsx)("p", { children: "The case changed. Nothing from this proposal was accepted. Review the latest field before submitting a fresh revision." }),
				e.conflict.latest ? /* @__PURE__ */ (0, U.jsxs)("p", { children: [
					"Latest stored value:",
					" ",
					Ht(e.conflict.latest.snapshot.normalized_input, e.conflict.operation.review.path).value,
					" ",
					"· Revision ",
					e.conflict.latest.snapshot.revision
				] }) : /* @__PURE__ */ (0, U.jsx)("p", {
					role: "status",
					children: e.conflict.error || "Loading latest for review…"
				}),
				/* @__PURE__ */ (0, U.jsxs)("details", { children: [
					/* @__PURE__ */ (0, U.jsx)("summary", { children: "Inspect pending edits vs. latest revision" }),
					/* @__PURE__ */ (0, U.jsx)(br, { operation: e.conflict.operation }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Latest revision:",
						" ",
						e.conflict.latest?.snapshot.revision ?? "Not loaded",
						". Latest field:",
						" ",
						e.conflict.latest ? String(Ht(e.conflict.latest.snapshot.normalized_input, e.conflict.operation.review.path).value) : "Unavailable"
					] })
				] }),
				/* @__PURE__ */ (0, U.jsxs)("div", {
					className: "actions",
					children: [
						/* @__PURE__ */ (0, U.jsx)("button", {
							disabled: !e.conflict.latest || !!e.operation,
							onClick: (e) => n(e.currentTarget),
							children: "Review proposed edit"
						}),
						/* @__PURE__ */ (0, U.jsx)("button", {
							onClick: e.refreshConflict,
							children: "Refresh conflict baseline"
						}),
						/* @__PURE__ */ (0, U.jsx)("button", {
							onClick: () => {
								e.conflict && e.openSaved({
									caseId: e.conflict.operation.caseId,
									revision: "latest"
								});
							},
							children: "Reload latest revision"
						}),
						/* @__PURE__ */ (0, U.jsx)("button", {
							onClick: e.cancelConflict,
							children: "Cancel proposal"
						})
					]
				})
			]
		}),
		e.rejected && /* @__PURE__ */ (0, U.jsxs)("section", {
			className: "pending",
			children: [
				/* @__PURE__ */ (0, U.jsx)("h2", { children: "Rejected saved proposal" }),
				/* @__PURE__ */ (0, U.jsx)(br, { operation: e.rejected }),
				/* @__PURE__ */ (0, U.jsx)("p", { children: e.writeError?.message }),
				/* @__PURE__ */ (0, U.jsx)("button", {
					onClick: e.dismissRejected,
					children: "Dismiss rejected proposal"
				})
			]
		}),
		e.offer && /* @__PURE__ */ (0, U.jsxs)("section", {
			className: "pending",
			children: [
				/* @__PURE__ */ (0, U.jsx)("h2", { children: "Write acknowledged for another selection" }),
				/* @__PURE__ */ (0, U.jsxs)("p", { children: [
					"Case ",
					e.offer.snapshot.case_id,
					" · revision",
					" ",
					e.offer.snapshot.revision,
					". The current selection was preserved."
				] }),
				/* @__PURE__ */ (0, U.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, U.jsx)("button", {
						onClick: () => {
							e.offer && e.openSaved({
								caseId: e.offer.snapshot.case_id,
								revision: e.offer.snapshot.revision
							}), e.dismissOffer();
						},
						children: "Open acknowledged revision"
					}), /* @__PURE__ */ (0, U.jsx)("button", {
						onClick: e.dismissOffer,
						children: "Dismiss acknowledgment"
					})]
				})
			]
		}),
		e.comparisonAck && (e.comparisonAck.scope !== e.state.id || e.comparisonAck.view.record.case_id !== e.state.saved?.view.snapshot.case_id || e.comparisonAck.view.record.baseline_revision !== e.state.saved?.view.snapshot.revision) && /* @__PURE__ */ (0, U.jsxs)("section", {
			className: "pending",
			"aria-label": "Comparison acknowledged for another selection",
			children: [
				/* @__PURE__ */ (0, U.jsx)("h2", { children: "Comparison acknowledged for another selection" }),
				/* @__PURE__ */ (0, U.jsxs)("p", { children: [
					"Original comparison ",
					e.comparisonAck.view.record.comparison_id,
					" · baseline revision ",
					e.comparisonAck.view.record.baseline_revision,
					". The current selection was preserved."
				] }),
				/* @__PURE__ */ (0, U.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, U.jsx)("button", {
						onClick: () => {
							e.comparisonAck && r(e.comparisonAck.view);
						},
						children: "Open acknowledged comparison"
					}), /* @__PURE__ */ (0, U.jsx)("button", {
						onClick: e.dismissComparisonAck,
						children: "Dismiss comparison acknowledgment"
					})]
				})
			]
		})
	] });
}
var Sr = /* @__PURE__ */ new Set([
	"preview_changed",
	"storage_upgrade_required",
	"baseline_run_mismatch",
	"baseline_unsupported",
	"baseline_replay_mismatch",
	"baseline_replay_unavailable"
]);
function Cr(e) {
	return R(Nt(e), "comparison case locator"), `/cases/${encodeURIComponent(e)}`;
}
function wr(e, t) {
	return R(Pt(t), "comparison revision locator"), `${Cr(e)}/revisions/${t}`;
}
async function Tr(e, t = "Comparison") {
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
async function Er(e, t, n) {
	let r;
	try {
		r = await Dt(e, t, n);
	} catch {
		throw new ar("The comparison response was lost or unavailable. Keep and retry the exact pending save if one exists.");
	}
	let i;
	try {
		i = await Tr(r);
	} catch (e) {
		throw new ar(`Comparison response could not be read: ${e instanceof Error ? e.message : String(e)}.`, r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null, t = "request_failed", n = `Comparison request failed (${r.status}).`, a = !1;
		e && typeof e == "object" && !Array.isArray(e) && "code" in e && typeof e.code == "string" && "message" in e && typeof e.message == "string" ? (t = e.code, n = e.message, a = !0) : Array.isArray(e) && (n = e.map((e) => e && typeof e == "object" && "msg" in e ? String(e.msg) : "Invalid scenario input").join("; "), a = !0);
		let o = a && ([
			400,
			404,
			413,
			422
		].includes(r.status) || r.status === 409 && Sr.has(t));
		throw new ar(n, r.status, t, o, r.headers.get("Retry-After"), kt(i, e));
	}
	return {
		response: r,
		body: i
	};
}
function Dr(e) {
	let t = on(e), n = JSON.stringify(t);
	return R(new TextEncoder().encode(n).length <= 1e6, "scenario request byte limit"), n;
}
async function Or(e, t, n, r = fetch) {
	R(t.schema_version === "commercial-scenario-preview-v2", "preview command version");
	let { response: i, body: a } = await Er(`${wr(e.snapshot.case_id, e.snapshot.revision)}/scenarios/preview`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: Dr(t),
		signal: n
	}, r);
	return R(i.status === 200, "preview status"), fn(a, e, t);
}
async function kr(e, t, n = fetch) {
	let r = xn(e);
	R(r.kind === "comparison", "comparison operation kind");
	let { response: i, body: a } = await Er(`${wr(r.caseId, r.baselineRevision)}/scenario-comparisons`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Idempotency-Key": r.id
		},
		body: r.body,
		signal: t
	}, n);
	try {
		R(i.status === 201 && ["true", "false"].includes(i.headers.get("Idempotency-Replayed") ?? ""), "retained receipt status/replay");
		let e = hn(a, i.headers.get("ETag")), t = e.record, n = t.preview, o = on(JSON.parse(r.body));
		R(t.case_id === r.caseId && t.baseline_revision === r.baselineRevision && t.baseline_run_id === r.baselineRunId && V(sn(n).scenarios, o.scenarios), "original receipt command/baseline");
		let s = n.baseline, c = n.fingerprint;
		return R(s.payload_hash === r.baselinePayloadHash && c.value === o.expected_preview_fingerprint && i.headers.get("Location") === `${Cr(t.case_id)}/scenario-comparisons/${t.comparison_id}`, "original receipt fingerprint/location"), {
			view: e,
			replayed: i.headers.get("Idempotency-Replayed") === "true"
		};
	} catch (e) {
		throw new ar(`The comparison may be saved, but its receipt could not be verified: ${e instanceof Error ? e.message : String(e)}`, i.status);
	}
}
async function Ar(e, t, n, r = fetch) {
	R(Nt(t), "comparison locator");
	let { response: i, body: a } = await Er(`${Cr(e)}/scenario-comparisons/${encodeURIComponent(t)}`, { signal: n }, r);
	R(i.status === 200, "original comparison status");
	let o = hn(a, i.headers.get("ETag"));
	return R(o.record.case_id === e && o.record.comparison_id === t, "requested original comparison"), o;
}
async function jr(e, t, n, r = fetch) {
	R(t === null || /^[A-Za-z0-9_-]{1,512}$/.test(t), "comparison cursor");
	let i = new URLSearchParams({
		limit: "25",
		...t ? { after: t } : {}
	}), { response: a, body: o } = await Er(`${Cr(e)}/scenario-comparisons?${i}`, { signal: n }, r);
	return R(a.status === 200, "comparison page status"), gn(o, e);
}
// src/scenarioSelection.ts
var Mr = "spreadline.comparison-selection.v1";
function Nr(e) {
	try {
		let t = Cn()?.getItem(Mr);
		if (!t || t.length > 500) return null;
		let n = JSON.parse(t);
		return Object.keys(n).length !== 4 || n.version !== "comparison-selection-v1" || n.apiBase !== w || n.caseId !== e || !Nt(n.comparisonId) ? null : n.comparisonId;
	} catch {
		return null;
	}
}
function Pr(e, t) {
	try {
		let n = Cn();
		t === null ? n?.removeItem(Mr) : Nt(e) && Nt(t) && n?.setItem(Mr, JSON.stringify({
			version: "comparison-selection-v1",
			apiBase: w,
			caseId: e,
			comparisonId: t
		}));
	} catch {}
}
// src/useScenarioWorkspace.ts
var Fr = {
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
function Ir(e) {
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
function Lr(e) {
	let { state: t } = e, n = t.status === "ready" ? t.saved?.view ?? null : null, r = n?.snapshot, i = `${t.id}:${t.status}:${r?.case_id ?? ""}:${r?.revision ?? ""}:${r?.run_id ?? ""}:${r?.payload_hash ?? ""}`, a = (0, A.useRef)(i);
	a.current = i;
	let o = (0, A.useRef)(0), s = (0, A.useRef)(null), c = (0, A.useRef)(null), l = (0, A.useRef)(0), [u, d] = (0, A.useState)({
		context: i,
		rows: [Ir(1)]
	}), [f, p] = (0, A.useState)(null), m = (0, A.useRef)(f);
	m.current = f;
	let [h, g] = (0, A.useState)(!1), [_, v] = (0, A.useState)(""), [y, b] = (0, A.useState)([]), [x, S] = (0, A.useState)({
		context: i,
		loading: !1,
		error: "",
		view: null
	}), [C, ee] = (0, A.useState)(0), te = (0, A.useRef)(0), w = (0, A.useRef)(null), T = (0, A.useRef)(0), ne = u.context === i ? u.rows : [], re = f?.context === i ? f : null, E = x.context === i ? x : {
		context: i,
		loading: !1,
		error: "",
		view: null
	}, D = !!n?.assessment, O = !!(e.operation || e.recoveryError || e.conflict || e.inFlight), ie = e.inFlight && e.operation?.kind === "comparison", k = ie || !!E.view || E.loading;
	function ae() {
		o.current++, s.current?.abort(), s.current = null, m.current = null, p(null), g(!1), v(""), b([]), e.clearComparisonError();
	}
	function oe(e, t) {
		k || (ae(), d((n) => ({
			context: i,
			rows: n.rows.map((n) => n.key === e ? t(n) : n)
		})));
	}
	function se() {
		if (k || ne.length >= 10) return null;
		ae();
		let e = Ir(ne.length + 1);
		return d({
			context: i,
			rows: [...ne, e]
		}), e.key;
	}
	function j(e) {
		k || ne.length <= 1 || (ae(), d({
			context: i,
			rows: ne.filter((t) => t.key !== e)
		}));
	}
	function ce(e, t) {
		oe(e, (e) => {
			let n = Fr[t];
			return n ? {
				...e,
				preset: t,
				name: n.name,
				shocks: Object.fromEntries(Qt.map((e, t) => [e, n.values[t]]))
			} : {
				...e,
				preset: "custom"
			};
		});
	}
	async function le() {
		if (!n || !D || k) return;
		ae();
		let e = o.current, t = i, r = new AbortController();
		s.current = r;
		try {
			let i = on({
				schema_version: "commercial-scenario-preview-v2",
				baseline_run_id: n.snapshot.run_id,
				scenarios: ne.map((e) => ({
					scenario_key: e.key,
					name: nn(e.name, 120),
					rationale: nn(e.rationale, 2e3),
					assumptions: Object.fromEntries(Qt.map((t) => [t, rn(e.shocks[t], t !== "proposed_rate_change_bps")]))
				}))
			});
			g(!0);
			let s = await Or(n, i, r.signal);
			if (t !== a.current || e !== o.current || r.signal.aborted) return;
			let c = {
				context: t,
				generation: e,
				preview: s,
				consumed: !1
			};
			m.current = c, p(c);
		} catch (n) {
			t === a.current && e === o.current && !r.signal.aborted && (v(or(n).message), b(or(n).fieldErrors));
		} finally {
			s.current === r && (s.current = null, g(!1));
		}
	}
	function ue() {
		let t = m.current;
		if (!(!t || t.context !== a.current || t.generation !== o.current || t.consumed || O)) try {
			e.retainComparison(t.preview), w.current = t.generation;
			let n = {
				...t,
				consumed: !0
			};
			m.current = n, p(n), v("");
		} catch (e) {
			v(or(e).message);
		}
	}
	function de() {
		ie || (ae(), d({
			context: i,
			rows: [Ir(1)]
		}), c.current?.abort(), l.current++, S({
			context: i,
			loading: !1,
			error: "",
			view: null
		}), r && Pr(r.case_id, null));
	}
	async function fe(e) {
		if (!r) return;
		ae(), c.current?.abort();
		let t = new AbortController();
		c.current = t;
		let n = ++l.current, o = i;
		S({
			context: o,
			loading: !0,
			error: "",
			view: null
		});
		try {
			let i = await Ar(r.case_id, e, t.signal);
			if (o !== a.current || n !== l.current || t.signal.aborted) return;
			S({
				context: o,
				loading: !1,
				error: "",
				view: i
			}), Pr(r.case_id, e);
		} catch (e) {
			o === a.current && n === l.current && !t.signal.aborted && S({
				context: o,
				loading: !1,
				error: or(e).message,
				view: null
			});
		} finally {
			c.current === t && (c.current = null);
		}
	}
	(0, A.useEffect)(() => {
		ae(), w.current = null, T.current = o.current, d({
			context: i,
			rows: [Ir(1)]
		}), S({
			context: i,
			loading: !1,
			error: "",
			view: null
		});
		let e = r && Nr(r.case_id);
		return e && fe(e), () => {
			o.current++, s.current?.abort(), l.current++, c.current?.abort();
		};
	}, [i]), (0, A.useEffect)(() => {
		let n = e.comparisonAck;
		n && n.serial !== te.current && (te.current = n.serial, n.scope === t.id && r && n.view.record.case_id === r.case_id && n.view.record.baseline_revision === r.revision && n.view.record.baseline_run_id === r.run_id && (o.current === (w.current ?? T.current) ? (c.current?.abort(), l.current++, S({
			context: i,
			loading: !1,
			error: "",
			view: n.view
		}), Pr(r.case_id, n.view.record.comparison_id), ee((e) => e + 1)) : (e.deferComparisonAck(n.serial), ee((e) => e + 1))));
	}, [e.comparisonAck]);
	let M = e.comparisonError?.scope === t.id ? e.comparisonError : null;
	return {
		context: i,
		baseline: r,
		view: n,
		supported: D,
		rows: ne,
		busy: h,
		fieldErrors: y,
		error: _ || M?.message || "",
		errorCode: M?.code,
		canSaveBaseline: e.canSave,
		previewConsumed: !!re?.consumed,
		frozen: ie,
		fieldsDisabled: k,
		writeBlocked: O,
		previewResult: re?.preview ?? null,
		original: E,
		refreshSerial: C,
		canRetain: !!re && !re.consumed && re.generation === o.current && !O && !k,
		change: oe,
		add: se,
		remove: j,
		preset: ce,
		preview: le,
		retain: ue,
		newDraft: de,
		open: fe
	};
}
// src/formContracts.ts
var Rr = (e) => JSON.parse(JSON.stringify(e));
function zr(e) {
	return !e.startsWith("/") || /~(?![01])/.test(e) ? [] : e.slice(1).split("/").map((e) => e.replace(/~1/g, "/").replace(/~0/g, "~"));
}
function Br(e, t) {
	let n = e;
	for (let e of zr(t)) {
		if (!n || typeof n != "object" || !Object.prototype.hasOwnProperty.call(n, e)) return "";
		n = n[e];
	}
	return n;
}
function Vr(e, t, n) {
	let r = Rr(e), i = zr(t);
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
function Hr(e, t) {
	let n = typeof t == "string" || typeof t == "number" ? String(t) : "";
	if (e.optional && !n.trim()) return null;
	if (!n.trim()) throw Error("Enter a value for this field.");
	if (e.kind === "text") return n;
	if (e.kind === "date") {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(n) || !Number.isFinite(Date.parse(n)) || new Date(n).toISOString().slice(0, 10) !== n) throw Error("Enter a valid calendar date, for example 2025-12-31.");
		return n;
	}
	let r = e.kind === "integer" ? Me(n) : Oe(n, { currency: e.kind === "money" });
	if (!r.ok) throw Error(r.message);
	if (e.min !== void 0 && N(r.value, e.min) < 0 || e.max !== void 0 && N(r.value, e.max) > 0) throw Error(`Use ${e.min ?? "the supported minimum"} through ${e.max ?? "the supported maximum"}.`);
	if (e.kind !== "integer") return r.value;
	let i = Number(r.value);
	if (!Number.isSafeInteger(i)) throw Error("Enter an exact safe integer.");
	return i;
}
function Ur(e) {
	return e;
}
function Wr(e) {
	if (e.schema_version !== "commercial-assessment-v2") return [];
	let t = e.years, n = (e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, r = t.every((e) => {
		if (!n(e.period_start) || !n(e.period_end) || !e.period_start.endsWith("-01")) return !1;
		let t = /* @__PURE__ */ new Date(`${e.period_start}T00:00:00Z`), r = new Date(t);
		return r.setUTCFullYear(t.getUTCFullYear() + 1, t.getUTCMonth(), 0), r.toISOString().slice(0, 10) === e.period_end;
	}), i = t.every((e, r) => n(e.period_start) && n(e.period_end) && (r === 0 || e.period_start > t[r - 1].period_end)), a = Ur(e.working_capital), o = t[t.length - 1];
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
// src/components/GuidedForm.tsx
function Gr(e, t) {
	let n = t?.querySelectorAll("[data-pointer]") ?? Wn(".guidedForm")?.querySelectorAll("[data-pointer]"), r = e.startsWith("/input/") ? e.slice(6) : e, i = Array.from(n ?? []), a = i.find((e) => e.dataset.pointer === r) ?? i.find((e) => e.dataset.pointer?.startsWith(`${r}/`));
	if (!a) return;
	let o = a.parentElement;
	for (; o;) o instanceof HTMLDetailsElement && (o.open = !0), o = o.parentElement;
	a.focus(), a.scrollIntoView({
		block: "center",
		behavior: "instant"
	});
}
function Kr(e) {
	let [t, n] = (0, A.useState)(e), [r, i] = (0, A.useState)([]), [a, o] = (0, A.useState)(0), s = (0, A.useRef)(null);
	(0, A.useEffect)(() => {
		a && r.length && Gr(r[0].pointer, s.current);
	}, [a]);
	function c(e) {
		n(Rr(e)), i([]);
	}
	function l(e, t) {
		n((n) => Vr(n, e.pointer, t));
		try {
			Hr(e, t), i((t) => t.filter((t) => t.pointer !== e.pointer));
		} catch {}
	}
	function u(e) {
		try {
			Hr(e, Br(t, e.pointer));
		} catch (t) {
			i((n) => [...n.filter((t) => t.pointer !== e.pointer), {
				pointer: e.pointer,
				code: "invalid_input",
				message: t instanceof Error ? t.message : "Review this field.",
				limit: null
			}]);
		}
	}
	function d(e) {
		i(e), o((e) => e + 1);
	}
	function f(e) {
		let n = Rr(t), r = [];
		for (let i of e) try {
			n = Vr(n, i.pointer, Hr(i, Br(t, i.pointer)));
		} catch (e) {
			r.push({
				pointer: i.pointer,
				code: "invalid_input",
				message: e instanceof Error ? e.message : "Review this field.",
				limit: null
			});
		}
		return r.length ? (d(r), null) : (i([]), n);
	}
	return {
		values: t,
		setValues: n,
		errors: r,
		root: s,
		replace: c,
		change: l,
		blur: u,
		reject: d,
		prepare: f
	};
}
function qr({ form: e, specs: t }) {
	return e.errors.length ? /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "validationSummary",
		role: "region",
		"aria-label": "Validation summary",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, U.jsxs)("h2", { children: [
			"Review ",
			e.errors.length,
			" input",
			" ",
			e.errors.length === 1 ? "issue" : "issues"
		] }), /* @__PURE__ */ (0, U.jsx)("ul", { children: e.errors.map((n, r) => /* @__PURE__ */ (0, U.jsxs)("li", { children: [/* @__PURE__ */ (0, U.jsxs)("button", {
			type: "button",
			onClick: () => Gr(n.pointer, e.root.current),
			children: [
				t.find((e) => e.pointer === n.pointer)?.label ?? (n.pointer || "Complete document"),
				": ",
				n.message
			]
		}), /* @__PURE__ */ (0, U.jsxs)("small", { children: [n.code, n.limit === null ? "" : ` · limit ${n.limit}`] })] }, `${n.pointer}:${r}`)) })]
	}) : null;
}
var Jr = {
	money: "500000.00",
	rate: "0.105",
	integer: "120",
	text: "Enter name or reference",
	date: "2025-12-31"
}, Yr = {
	money: "USD decimal · up to 34 significant digits",
	rate: "Rate [0, 1] · decimal fraction",
	integer: "Integer",
	text: "Text",
	date: "ISO calendar date · YYYY-MM-DD"
};
function Xr({ form: e, spec: t }) {
	let n = (0, A.useId)(), r = e.errors.find((e) => e.pointer === t.pointer);
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "formField",
		children: [
			/* @__PURE__ */ (0, U.jsx)("label", {
				htmlFor: n,
				children: t.label
			}),
			/* @__PURE__ */ (0, U.jsx)("input", {
				id: n,
				"data-pointer": t.pointer,
				type: "text",
				inputMode: ["money", "rate"].includes(t.kind) ? "decimal" : t.kind === "integer" ? "numeric" : "text",
				value: String(Br(e.values, t.pointer) ?? ""),
				placeholder: t.placeholder ?? Jr[t.kind],
				"aria-invalid": r ? "true" : void 0,
				"aria-describedby": `${n}-help${r ? ` ${n}-error` : ""}`,
				onBlur: () => e.blur(t),
				onChange: (n) => e.change(t, n.target.value)
			}),
			/* @__PURE__ */ (0, U.jsx)("small", {
				id: `${n}-help`,
				children: t.helper ?? `${Yr[t.kind]}${t.min === void 0 ? "" : ` · minimum ${t.min}`}${t.max === void 0 ? "" : ` · maximum ${t.max}`}`
			}),
			r && /* @__PURE__ */ (0, U.jsxs)("span", {
				id: `${n}-error`,
				className: "fieldError",
				children: [r.message, r.limit === null ? "" : ` · limit ${r.limit}`]
			})
		]
	});
}
// src/Scenarios.tsx
var Zr = [
	"Revenue change (%)",
	"COGS change (%)",
	"Operating expense change (%)",
	"Proposed rate change (bps)"
];
function Qr({ title: e, children: t }) {
	let [n, r] = (0, A.useState)(!1);
	return /* @__PURE__ */ (0, U.jsxs)("details", {
		onToggle: (e) => r(e.currentTarget.open),
		children: [/* @__PURE__ */ (0, U.jsx)("summary", { children: e }), n && t()]
	});
}
function $r({ rows: e, render: t, label: n }) {
	let [r, i] = (0, A.useState)(0), a = Math.max(1, Math.ceil(e.length / 50));
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		"aria-label": n,
		children: [
			/* @__PURE__ */ (0, U.jsxs)("p", { children: [
				"Page ",
				r + 1,
				" of ",
				a,
				" · ",
				e.length,
				" rows · up to 50 rows per page"
			] }),
			e.slice(r * 50, (r + 1) * 50).map((e, n) => t(e, r * 50 + n)),
			a > 1 && /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, U.jsxs)("button", {
					disabled: r === 0,
					onClick: () => i(r - 1),
					children: [
						"Previous ",
						n,
						" page"
					]
				}), /* @__PURE__ */ (0, U.jsxs)("button", {
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
function ei({ value: e }) {
	return /* @__PURE__ */ (0, U.jsx)(Qn, {
		value: e,
		className: "originalComparisonJson",
		title: "Original JSON",
		noun: "JSON"
	});
}
function ti({ row: e }) {
	return /* @__PURE__ */ (0, U.jsxs)("details", { children: [
		/* @__PURE__ */ (0, U.jsxs)("summary", { children: [
			e.fact_id,
			" · ",
			$n(e)
		] }),
		/* @__PURE__ */ (0, U.jsx)("strong", { children: e.definition_id }),
		/* @__PURE__ */ (0, U.jsx)("p", {
			className: "expression",
			children: e.expression
		}),
		e.operands.map((e, t) => /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "operand",
			children: [
				/* @__PURE__ */ (0, U.jsx)("code", { children: e.reference }),
				/* @__PURE__ */ (0, U.jsxs)("span", { children: [
					e.raw_value === null ? "Not applicable" : String(e.raw_value),
					" ",
					e.unit
				] }),
				/* @__PURE__ */ (0, U.jsx)("small", { children: e.reference_type })
			]
		}, t)),
		e.explanation && /* @__PURE__ */ (0, U.jsx)("p", { children: e.explanation })
	] });
}
function ni(e) {
	return e === null ? "Not applicable" : String(e);
}
function ri(e) {
	return e === null ? "Not applicable" : String(e);
}
function ii({ preview: e, result: t }) {
	let n = e.baseline.assessment;
	return /* @__PURE__ */ (0, U.jsxs)("article", {
		className: "scenarioResult",
		"aria-label": `Reviewed scenario ${t.name}`,
		children: [
			/* @__PURE__ */ (0, U.jsx)("h3", { children: t.name }),
			/* @__PURE__ */ (0, U.jsx)("p", { children: t.rationale }),
			/* @__PURE__ */ (0, U.jsxs)("p", {
				className: "scenarioOutcome",
				children: [
					"Baseline",
					" ",
					/* @__PURE__ */ (0, U.jsx)("strong", {
						"data-outcome": t.outcome_change.baseline,
						children: t.outcome_change.baseline.toUpperCase()
					}),
					" ",
					"→ Projected",
					" ",
					/* @__PURE__ */ (0, U.jsx)("strong", {
						"data-outcome": t.outcome_change.projected,
						children: t.outcome_change.projected.toUpperCase()
					}),
					" ",
					"·",
					" ",
					t.outcome_change.changed ? "Outcome changed" : "Outcome unchanged"
				]
			}),
			/* @__PURE__ */ (0, U.jsxs)("p", { children: [
				"Server score ",
				t.decision.score,
				" · retained policy",
				" ",
				t.decision.policy_version
			] }),
			/* @__PURE__ */ (0, U.jsx)("div", {
				className: "tableScroll",
				children: /* @__PURE__ */ (0, U.jsxs)("table", { children: [
					/* @__PURE__ */ (0, U.jsx)("caption", { children: "Original baseline and projected current facts" }),
					/* @__PURE__ */ (0, U.jsx)("thead", { children: /* @__PURE__ */ (0, U.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, U.jsx)("th", { children: "Metric" }),
						/* @__PURE__ */ (0, U.jsx)("th", { children: "Baseline" }),
						/* @__PURE__ */ (0, U.jsx)("th", { children: "Projected" }),
						/* @__PURE__ */ (0, U.jsx)("th", { children: "Server delta" })
					] }) }),
					/* @__PURE__ */ (0, U.jsx)("tbody", { children: Ye.map((e) => {
						let r = t.comparisons.find((t) => t.metric === e);
						return /* @__PURE__ */ (0, U.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, U.jsx)("th", {
								scope: "row",
								children: ut[e]
							}),
							/* @__PURE__ */ (0, U.jsx)("td", {
								className: "num",
								children: $n(n.current_facts[e])
							}),
							/* @__PURE__ */ (0, U.jsx)("td", {
								className: "num",
								children: $n(t.current_facts[e])
							}),
							/* @__PURE__ */ (0, U.jsxs)("td", {
								className: "num",
								children: [r ? r.delta === null ? "Not applicable" : $n({
									...t.current_facts[e],
									raw_value: r.delta,
									reported_value: null
								}) : "Held fixed", r?.delta_explanation && /* @__PURE__ */ (0, U.jsx)("small", { children: r.delta_explanation })]
							})
						] }, e);
					}) })
				] })
			}),
			/* @__PURE__ */ (0, U.jsxs)("p", { children: [
				"K-1 history stays observed:",
				" ",
				$n(t.current_facts.k1_history),
				". Current shocks do not create a historical operating year."
			] }),
			/* @__PURE__ */ (0, U.jsx)(Qr, {
				title: "Raw deltas and policy headroom",
				children: () => /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("p", { children: "Values below are the server's raw results. Approval uses the displayed operator; decline floors apply where returned." }), t.comparisons.map((e) => /* @__PURE__ */ (0, U.jsxs)("div", {
					className: "scenarioFact",
					children: [
						/* @__PURE__ */ (0, U.jsx)("strong", { children: ut[e.metric] }),
						/* @__PURE__ */ (0, U.jsxs)("p", { children: [
							"Baseline ",
							ni(e.baseline_value),
							" · projected",
							" ",
							ni(e.projected_value),
							" · delta ",
							ni(e.delta),
							" ",
							e.unit
						] }),
						/* @__PURE__ */ (0, U.jsxs)("code", { children: [
							e.baseline_fact_id,
							" → ",
							e.projected_fact_id
						] }),
						e.delta_explanation && /* @__PURE__ */ (0, U.jsx)("p", { children: e.delta_explanation }),
						e.policy_headroom && /* @__PURE__ */ (0, U.jsxs)("p", { children: [
							"Approval ",
							e.policy_headroom.comparison_operator,
							" ",
							ni(e.policy_headroom.approval_threshold),
							" · decline floor ",
							ni(e.policy_headroom.decline_threshold),
							/* @__PURE__ */ (0, U.jsx)("br", {}),
							"Approval headroom: baseline",
							" ",
							ri(e.policy_headroom.baseline_approval),
							" · projected",
							" ",
							ri(e.policy_headroom.projected_approval),
							/* @__PURE__ */ (0, U.jsx)("br", {}),
							"Decline headroom: baseline",
							" ",
							ri(e.policy_headroom.baseline_decline),
							" · projected",
							" ",
							ri(e.policy_headroom.projected_decline)
						] })
					]
				}, e.metric))] })
			}),
			/* @__PURE__ */ (0, U.jsx)(Qr, {
				title: "Factor and reason changes",
				children: () => /* @__PURE__ */ (0, U.jsxs)("div", { children: [
					t.factor_changes.map((e) => /* @__PURE__ */ (0, U.jsxs)("div", {
						className: "scenarioFact",
						children: [/* @__PURE__ */ (0, U.jsxs)("h4", { children: [
							ut[e.name],
							" ·",
							" ",
							e.changed ? "Changed" : "Unchanged"
						] }), /* @__PURE__ */ (0, U.jsxs)("p", { children: [
							"Baseline raw ",
							ni(e.baseline.raw_value),
							" → projected raw",
							" ",
							ni(e.projected.raw_value),
							/* @__PURE__ */ (0, U.jsx)("br", {}),
							"Pass: ",
							ni(e.baseline.passed),
							" →",
							" ",
							ni(e.projected.passed),
							" · decline triggered:",
							" ",
							ni(e.baseline.decline_triggered),
							" →",
							" ",
							ni(e.projected.decline_triggered),
							/* @__PURE__ */ (0, U.jsx)("br", {}),
							"Operator",
							" ",
							e.projected.comparison_operator ?? "Not applicable",
							" · approval ",
							ni(e.projected.threshold),
							" · decline floor",
							" ",
							ni(e.projected.decline_threshold),
							" · weight",
							" ",
							e.projected.weight,
							/* @__PURE__ */ (0, U.jsx)("br", {}),
							"Basis ",
							e.basis,
							" · ",
							/* @__PURE__ */ (0, U.jsx)("code", { children: e.projected_fact_id })
						] })]
					}, e.name)),
					/* @__PURE__ */ (0, U.jsx)("h4", { children: "Reason changes" }),
					t.reason_changes.length ? t.reason_changes.map((e) => /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsxs)("strong", { children: [
						e.code,
						" · ",
						e.change
					] }), /* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Baseline: ",
						e.baseline?.message ?? "No reason",
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						"Projected: ",
						e.projected?.message ?? "No reason"
					] })] }, e.code)) : /* @__PURE__ */ (0, U.jsx)("p", { children: "No reason changes returned." }),
					/* @__PURE__ */ (0, U.jsx)("h4", { children: "Projected reasons" }),
					t.decision.reasons.length ? t.decision.reasons.map((e) => /* @__PURE__ */ (0, U.jsxs)("p", { children: [
						e.code,
						" · ",
						e.message
					] }, e.code)) : /* @__PURE__ */ (0, U.jsx)("p", { children: "No additional reasons returned." })
				] })
			}),
			/* @__PURE__ */ (0, U.jsx)(Qr, {
				title: "Projected inputs and held-fixed assumptions",
				children: () => /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("pre", { children: JSON.stringify({
					assumptions: t.assumptions,
					operating: t.projection_inputs.operating,
					proposed_loan: t.projection_inputs.proposed_loan,
					existing_debt: t.projection_inputs.existing_debt,
					working_capital: t.projection_inputs.working_capital
				}, null, 2) }), /* @__PURE__ */ (0, U.jsx)("ul", { children: e.held_fixed_assumptions.map((e, t) => /* @__PURE__ */ (0, U.jsx)("li", { children: e }, t)) })] })
			}),
			/* @__PURE__ */ (0, U.jsx)(Qr, {
				title: "Projected guarantor contributions",
				children: () => /* @__PURE__ */ (0, U.jsx)($r, {
					rows: t.guarantor_contributions,
					label: "guarantors",
					render: (e, n) => /* @__PURE__ */ (0, U.jsxs)("div", {
						className: "scenarioFact",
						children: [
							/* @__PURE__ */ (0, U.jsx)("h4", { children: e.name }),
							/* @__PURE__ */ (0, U.jsxs)("p", { children: [
								"Business EBITDA: ",
								$n(e.business_ebitda),
								/* @__PURE__ */ (0, U.jsx)("br", {}),
								"Outside income: ",
								$n(e.outside_income),
								/* @__PURE__ */ (0, U.jsx)("br", {}),
								"Personal debt: ",
								$n(e.personal_debt)
							] }),
							/* @__PURE__ */ (0, U.jsx)(Qr, {
								title: `${e.name} projected inputs`,
								children: () => /* @__PURE__ */ (0, U.jsx)("pre", { children: JSON.stringify(t.projection_inputs.guarantors[n], null, 2) })
							})
						]
					}, n)
				})
			}),
			/* @__PURE__ */ (0, U.jsx)(Qr, {
				title: "Calculation trace",
				children: () => /* @__PURE__ */ (0, U.jsx)($r, {
					rows: t.calculation_trace,
					label: "trace",
					render: (e) => /* @__PURE__ */ (0, U.jsx)(ti, { row: e }, e.fact_id)
				})
			})
		]
	});
}
function W({ preview: e }) {
	let [t, n] = (0, A.useState)(0);
	return /* @__PURE__ */ (0, U.jsxs)("div", { children: [
		/* @__PURE__ */ (0, U.jsxs)("label", {
			className: "scenarioSelect",
			children: [
				"Reviewed scenario",
				" ",
				/* @__PURE__ */ (0, U.jsx)("select", {
					"aria-label": "Reviewed scenario",
					value: t,
					onChange: (e) => n(Number(e.target.value)),
					children: e.scenarios.map((e, t) => /* @__PURE__ */ (0, U.jsxs)("option", {
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
		/* @__PURE__ */ (0, U.jsx)(ii, {
			preview: e,
			result: e.scenarios[t]
		}, e.scenarios[t].scenario_key),
		/* @__PURE__ */ (0, U.jsx)("p", {
			className: "fine",
			children: e.disclaimer
		})
	] });
}
function ai({ view: e, onOpen: t }) {
	let n = e.record;
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel originalComparison",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "comparisonContext",
				children: [
					/* @__PURE__ */ (0, U.jsx)("h2", { children: "Saved comparison" }),
					/* @__PURE__ */ (0, U.jsx)("code", { children: n.comparison_id }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Original record · Case ",
						n.case_id,
						" · baseline revision",
						" ",
						n.baseline_revision,
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						"Run ",
						n.baseline_run_id,
						" · recorded ",
						n.recorded_at
					] }),
					/* @__PURE__ */ (0, U.jsx)("button", {
						onClick: () => t({
							caseId: n.case_id,
							revision: n.baseline_revision
						}),
						children: "Open baseline revision"
					})
				]
			}),
			/* @__PURE__ */ (0, U.jsxs)("p", { children: [
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
			e.preview ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
				/* @__PURE__ */ (0, U.jsxs)("p", { children: [
					"Operating period ",
					e.preview.selected_period.period_start,
					" –",
					" ",
					e.preview.selected_period.period_end,
					" · assumptions as of",
					" ",
					e.preview.assumptions_as_of,
					/* @__PURE__ */ (0, U.jsx)("br", {}),
					"Retained policy ",
					e.preview.policy_snapshot.version,
					" ·",
					" ",
					e.preview.scenario_definition_version,
					" ·",
					" ",
					e.preview.calculation_version
				] }),
				/* @__PURE__ */ (0, U.jsx)(Qr, {
					title: "Baseline hashes, fingerprint and retained policy",
					children: () => /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Input hash ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: e.preview.baseline.input_hash }),
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						"Baseline payload hash",
						" ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: e.preview.baseline.payload_hash }),
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						"Reviewed fingerprint",
						" ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: e.preview.fingerprint.value })
					] }), /* @__PURE__ */ (0, U.jsx)("pre", { children: JSON.stringify({
						units: e.preview.units,
						policy_snapshot: e.preview.policy_snapshot,
						recording: n.recording
					}, null, 2) })] })
				}),
				/* @__PURE__ */ (0, U.jsx)(W, { preview: e.preview }, n.comparison_id)
			] }) : /* @__PURE__ */ (0, U.jsx)("p", {
				className: "compatibility",
				role: "status",
				children: e.compatibility
			}),
			/* @__PURE__ */ (0, U.jsx)(Qr, {
				title: "Original comparison JSON",
				children: () => /* @__PURE__ */ (0, U.jsx)(ei, { value: n })
			}),
			/* @__PURE__ */ (0, U.jsxs)("p", {
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
function oi({ caseId: e, scope: t, refresh: n, onOpen: r }) {
	let i = hr(`${t}:${n}`, (t, n) => jr(e, t, n), (e) => e.comparison_id);
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel comparisonArchive",
		"aria-label": "Saved comparisons",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("h2", { children: "Saved comparisons" }), /* @__PURE__ */ (0, U.jsx)("p", { children: "All baselines for this case · newest records first · 25 summaries per page" })] }), /* @__PURE__ */ (0, U.jsx)("button", {
					onClick: i.refresh,
					children: "Refresh comparisons"
				})]
			}),
			i.loading && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "status",
				children: "Loading comparison summaries…"
			}),
			i.error && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "alert",
				children: i.error
			}),
			!i.loading && !i.error && !i.items.length && /* @__PURE__ */ (0, U.jsx)("p", { children: "No saved comparisons yet." }),
			i.items.map((e) => /* @__PURE__ */ (0, U.jsxs)("article", {
				className: "caseRow",
				children: [/* @__PURE__ */ (0, U.jsxs)("div", { children: [
					/* @__PURE__ */ (0, U.jsx)("h3", { children: e.scenarios.map((e) => e.name).join(" · ") }),
					/* @__PURE__ */ (0, U.jsx)("code", { children: e.comparison_id }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Baseline revision ",
						e.baseline_revision,
						" ·",
						" ",
						e.scenario_count,
						" scenario(s)",
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						e.recorded_at,
						" · policy ",
						e.policy_version
					] })
				] }), /* @__PURE__ */ (0, U.jsx)("button", {
					"aria-label": `Open comparison ${e.comparison_id}`,
					onClick: () => r(e.comparison_id),
					children: "Open original comparison"
				})]
			}, e.comparison_id)),
			i.next && /* @__PURE__ */ (0, U.jsx)("button", {
				disabled: i.loading,
				onClick: i.more,
				children: "Load more comparisons"
			})
		]
	});
}
function si({ model: e, onSaveBaseline: t, onOpenBaseline: n }) {
	let r = (0, A.useRef)(null), [i, a] = (0, A.useState)(null), o = (0, A.useRef)(null), [s, c] = (0, A.useState)([]), [l, u] = (0, A.useState)(0);
	(0, A.useEffect)(() => {
		e.fieldErrors.length && (c(e.fieldErrors), u((e) => e + 1));
	}, [e.fieldErrors]), (0, A.useEffect)(() => {
		l && s.length && Gr(s[0].pointer, o.current);
	}, [l]);
	let d = (e, t) => `/scenarios/${e}/${t === "name" || t === "rationale" ? t : `assumptions/${t}`}`, f = (e, t) => {
		try {
			return e === "name" || e === "rationale" ? nn(t, e === "name" ? 120 : 2e3) : rn(t, e !== "proposed_rate_change_bps"), "";
		} catch (e) {
			return e instanceof Error ? e.message : "Review this field.";
		}
	};
	function p(e, t, n) {
		f(t, n) || c((n) => n.filter((n) => n.pointer !== d(e, t)));
	}
	function m(e, t, n) {
		let r = f(t, n);
		r && c((n) => [...n.filter((n) => n.pointer !== d(e, t)), {
			pointer: d(e, t),
			code: "invalid_input",
			message: r,
			limit: null
		}]);
	}
	function h() {
		let t = [];
		e.rows.forEach((e, n) => {
			for (let r of [
				"name",
				"rationale",
				...Qt
			]) {
				let i = f(r, r === "name" ? e.name : r === "rationale" ? e.rationale : e.shocks[r]);
				i && t.push({
					pointer: d(n, r),
					code: "invalid_input",
					message: i,
					limit: null
				});
			}
		}), c(t), t.length && u((e) => e + 1), e.preview();
	}
	(0, A.useEffect)(() => {
		i && (Wn(`[id="scenario-name-${i}"]`)?.focus(), a(null));
	}, [i]);
	let g = e.view?.assessment;
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "scenariosWorkspace",
		ref: o,
		children: [
			/* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel scenarioComposer",
				"aria-label": "Scenario authoring",
				children: [
					/* @__PURE__ */ (0, U.jsx)("div", {
						className: "panelTitle",
						children: /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("h2", { children: "Scenario comparison" }), /* @__PURE__ */ (0, U.jsx)("p", { children: "Review current pro forma shocks against an explicit original saved baseline." })] })
					}),
					e.baseline && /* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Case ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: e.baseline.case_id }),
						" · baseline revision",
						" ",
						e.baseline.revision,
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						"Run ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: e.baseline.run_id }),
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						"Payload hash ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: e.baseline.payload_hash })
					] }),
					g && /* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Operating period ",
						g.selected_period.period_start,
						" –",
						" ",
						g.selected_period.period_end,
						" · assumptions as of",
						" ",
						g.assumptions_as_of,
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						"Retained policy ",
						g.policy_snapshot.version,
						". The spread's selected column does not change this baseline."
					] }),
					e.view ? e.supported ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
						/* @__PURE__ */ (0, U.jsx)("p", { children: "Enter percentage changes as percentages (−10 means −10%). Enter rate changes in basis points; fractional basis points are supported. Each of the four shocks must be explicit. Presets fill the name and shocks; enter your own rationale." }),
						s.length > 0 && /* @__PURE__ */ (0, U.jsxs)("section", {
							className: "validationSummary",
							"aria-label": "Scenario validation summary",
							role: "region",
							children: [/* @__PURE__ */ (0, U.jsx)("h3", { children: "Review scenario inputs" }), /* @__PURE__ */ (0, U.jsx)("ul", { children: s.map((e, t) => /* @__PURE__ */ (0, U.jsxs)("li", { children: [/* @__PURE__ */ (0, U.jsxs)("button", {
								type: "button",
								onClick: () => Gr(e.pointer, o.current),
								children: [
									e.pointer,
									": ",
									e.message
								]
							}), /* @__PURE__ */ (0, U.jsxs)("small", { children: [e.code, e.limit === null ? "" : ` · limit ${e.limit}`] })] }, t)) })]
						}),
						e.rows.map((t, n) => /* @__PURE__ */ (0, U.jsxs)("fieldset", {
							className: "scenarioRow",
							disabled: e.fieldsDisabled,
							children: [
								/* @__PURE__ */ (0, U.jsxs)("legend", { children: ["Scenario ", n + 1] }),
								/* @__PURE__ */ (0, U.jsxs)("div", {
									className: "scenarioFields",
									children: [
										/* @__PURE__ */ (0, U.jsxs)("label", { children: ["Preset", /* @__PURE__ */ (0, U.jsxs)("select", {
											"aria-label": `Scenario ${n + 1} preset`,
											value: t.preset,
											onChange: (n) => e.preset(t.key, n.target.value),
											children: [/* @__PURE__ */ (0, U.jsx)("option", {
												value: "custom",
												children: "Custom / zero shocks"
											}), Object.entries(Fr).map(([e, t]) => /* @__PURE__ */ (0, U.jsx)("option", {
												value: e,
												children: t.name
											}, e))]
										})] }),
										/* @__PURE__ */ (0, U.jsxs)("label", { children: [
											"Name",
											/* @__PURE__ */ (0, U.jsx)("input", {
												id: `scenario-name-${t.key}`,
												"data-pointer": d(n, "name"),
												"aria-invalid": s.some((e) => e.pointer === d(n, "name")) || void 0,
												"aria-label": `Scenario ${n + 1} name`,
												placeholder: "Revenue downside",
												value: t.name,
												onBlur: (e) => m(n, "name", e.target.value),
												onChange: (r) => {
													p(n, "name", r.target.value), e.change(t.key, (e) => ({
														...e,
														name: r.target.value
													}));
												}
											}),
											/* @__PURE__ */ (0, U.jsx)("small", { children: "Text · at most 120 Unicode characters after trimming" })
										] }),
										/* @__PURE__ */ (0, U.jsxs)("label", {
											className: "scenarioRationale",
											children: [
												"Rationale",
												/* @__PURE__ */ (0, U.jsx)("textarea", {
													"data-pointer": d(n, "rationale"),
													"aria-invalid": s.some((e) => e.pointer === d(n, "rationale")) || void 0,
													"aria-label": `Scenario ${n + 1} rationale`,
													rows: 3,
													placeholder: "Explain the assumption being tested",
													value: t.rationale,
													onBlur: (e) => m(n, "rationale", e.target.value),
													onChange: (r) => {
														p(n, "rationale", r.target.value), e.change(t.key, (e) => ({
															...e,
															rationale: r.target.value
														}));
													}
												}),
												/* @__PURE__ */ (0, U.jsx)("small", { children: "Required · at most 2,000 Unicode characters after trimming; name limit 120." })
											]
										}),
										Qt.map((r, i) => /* @__PURE__ */ (0, U.jsxs)("label", { children: [
											Zr[i],
											/* @__PURE__ */ (0, U.jsx)("input", {
												inputMode: "decimal",
												"data-pointer": d(n, r),
												"aria-invalid": s.some((e) => e.pointer === d(n, r)) || void 0,
												placeholder: r === "proposed_rate_change_bps" ? "100" : "-10",
												"aria-label": `Scenario ${n + 1} ${Zr[i]}`,
												value: t.shocks[r],
												onBlur: (e) => m(n, r, e.target.value),
												onChange: (i) => {
													p(n, r, i.target.value), e.change(t.key, (e) => ({
														...e,
														preset: "custom",
														shocks: {
															...e.shocks,
															[r]: i.target.value
														}
													}));
												}
											}),
											/* @__PURE__ */ (0, U.jsx)("small", { children: r === "proposed_rate_change_bps" ? "Basis points · fractional values supported" : "Percentage change · minimum -100%" })
										] }, r))
									]
								}),
								/* @__PURE__ */ (0, U.jsx)("div", {
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
									].map((r) => /* @__PURE__ */ (0, U.jsx)("button", {
										type: "button",
										onClick: () => {
											p(n, r.field, r.value), e.change(t.key, (e) => ({
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
								/* @__PURE__ */ (0, U.jsx)("button", {
									disabled: e.rows.length <= 1,
									"aria-label": `Remove scenario ${n + 1}`,
									onClick: () => {
										e.remove(t.key), r.current?.focus();
									},
									children: "Remove scenario"
								})
							]
						}, t.key)),
						/* @__PURE__ */ (0, U.jsxs)("div", {
							className: "actions",
							children: [
								/* @__PURE__ */ (0, U.jsx)("button", {
									ref: r,
									disabled: e.fieldsDisabled || e.rows.length >= 10,
									onClick: () => {
										let t = e.add();
										t && a(t);
									},
									children: "Add scenario"
								}),
								/* @__PURE__ */ (0, U.jsx)("button", {
									className: e.canRetain ? void 0 : "primary",
									disabled: e.fieldsDisabled || e.busy || !e.rows.length,
									onClick: h,
									children: "Preview scenarios"
								}),
								/* @__PURE__ */ (0, U.jsx)("button", {
									className: e.canRetain ? "primary" : void 0,
									disabled: !e.canRetain,
									onClick: e.retain,
									children: "Save reviewed comparison"
								}),
								/* @__PURE__ */ (0, U.jsx)("button", {
									disabled: e.frozen,
									onClick: e.newDraft,
									children: "Start another comparison"
								})
							]
						}),
						/* @__PURE__ */ (0, U.jsx)("p", {
							role: "status",
							children: e.busy ? "Previewing current draft…" : e.canRetain ? "Current preview ready for review and retention." : "Preview required before a fresh save. A saved or pending batch cannot be saved twice."
						}),
						e.original.view && /* @__PURE__ */ (0, U.jsx)("p", { children: "Viewing a saved original. Choose Start another comparison to author a fresh batch." }),
						e.writeBlocked && /* @__PURE__ */ (0, U.jsx)("p", { children: "Resolve this tab's existing saved write, recovery tracking or conflicting proposal before retaining another comparison. Read-only previews remain available." })
					] }) : /* @__PURE__ */ (0, U.jsx)("p", { children: "New preview is unavailable for this baseline definition. Saved comparison summaries and original records remain available below." }) : /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)("p", { children: "Save an accepted dated case, or open an original saved revision, to author scenarios. Legacy annual assessments remain unsaved." }), /* @__PURE__ */ (0, U.jsx)("button", {
						disabled: !e.canSaveBaseline,
						onClick: (e) => t(e.currentTarget),
						children: "Save baseline case"
					})] }),
					e.error && /* @__PURE__ */ (0, U.jsx)("p", {
						role: "alert",
						children: e.error
					}),
					e.errorCode === "storage_upgrade_required" && /* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Retention requires the documented copy upgrade to a separate schema-v2 database. An operator must verify the copy and select it explicitly; opening this view performs no upgrade. See",
						" ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: "docs/SCENARIO_COMPARISONS.md" }),
						"."
					] })
				]
			}),
			e.previewResult && (!e.original.view || !e.previewConsumed) && /* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel scenarioPreview",
				children: [
					/* @__PURE__ */ (0, U.jsx)("h2", { children: "Read-only preview" }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Review the server's projected results and rationale before saving this batch.",
						/* @__PURE__ */ (0, U.jsx)("br", {}),
						"Reviewed fingerprint",
						" ",
						/* @__PURE__ */ (0, U.jsx)("code", { children: e.previewResult.fingerprint.value })
					] }),
					/* @__PURE__ */ (0, U.jsx)(W, { preview: e.previewResult }, e.previewResult.fingerprint.value)
				]
			}),
			e.original.loading && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "status",
				children: "Loading original comparison…"
			}),
			e.original.error && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "alert",
				children: e.original.error
			}),
			e.original.view && (!e.previewResult || e.previewConsumed) && /* @__PURE__ */ (0, U.jsx)(ai, {
				view: e.original.view,
				onOpen: n
			}),
			e.baseline && /* @__PURE__ */ (0, U.jsx)(oi, {
				caseId: e.baseline.case_id,
				scope: e.context,
				refresh: e.refreshSerial,
				onOpen: (t) => void e.open(t)
			})
		]
	});
}
// src/prototypeDisclaimer.ts
var ci = "Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.";
function li(e, t) {
	return `spreadline-case-${e.case_id}-r${e.revision}-${e.run_id}${t ? `-comparison-${t.comparison_id}` : ""}.json`;
}
function ui(e, t) {
	let n = e.snapshot, r = t.record, i = z(r.preview.baseline, "export comparison baseline");
	R(r.case_id === n.case_id && r.baseline_revision === n.revision && r.baseline_run_id === n.run_id && i.case_id === n.case_id && i.revision === n.revision && i.run_id === n.run_id && i.input_hash === n.input_hash && i.payload_hash === n.payload_hash && V(i.assessment, n.assessment), "retained comparison must match the selected original case, revision, run, hashes and full baseline assessment");
}
// src/reviewPackage.worker.ts?worker&inline
var di = "(function(){let e=/^([+-]?)(?:(\\d+)(?:\\.(\\d*))?|\\.(\\d+))(?:[eE]([+-]?\\d+))?$/,t=10n;function n(t){if(t.length>256)throw Error(`Decimal exceeds the supported range.`);let n=e.exec(t);if(!n)throw Error(`Enter a finite decimal value.`);let r=Number(n[5]??`0`);if(!Number.isSafeInteger(r)||Math.abs(r)>128)throw Error(`Decimal exponent exceeds the supported range.`);let i=n[3]??n[4]??``;return{coefficient:BigInt(`${n[1]===`-`?`-`:``}${n[2]??`0`}${i}`),scale:i.length-r}}function r({coefficient:e,scale:t}){if(e===0n)return`0`;let n=e<0n?`-`:``,r=(e<0n?-e:e).toString();return t<=0?n+r+`0`.repeat(-t):(r=r.padStart(t+1,`0`),(n+r.slice(0,-t)+`.`+r.slice(-t)).replace(/0+$/,``).replace(/\\.$/,``))}function i(e){return r(n(e))}function a(e){if(typeof e!=`string`)return!1;try{return n(e),!0}catch{return!1}}function o(e){if(typeof e==`number`&&Number.isFinite(e))return i(String(e));if(typeof e==`string`)return i(e);throw Error(`Financial values must be finite decimals.`)}function s(e,r){let i=n(e),a=n(r),o=Math.max(i.scale,a.scale),s=i.coefficient*t**BigInt(o-i.scale),c=a.coefficient*t**BigInt(o-a.scale);return s<c?-1:+(s>c)}function c(e,t){try{return s(o(e),o(t))===0}catch{return!1}}let l=[`gross_receipts`,`cogs`,`operating_expense_excl_dna_interest_comp`,`officer_compensation`,`depreciation`,`amortization`,`interest_expense`,`section_179`,`k1_distribution`],u=[`ordinary_business_income`,`ebitda`,`proposed_monthly_payment`,`proposed_annual_payment`,`debt_service`,`fixed_charge_service`,`global_business_ebitda`,`global_outside_income`,`global_personal_debt`,`global_cash_flow`,`global_debt_service`,`dscr`,`fccr`,`global_dscr`,`net_working_capital_increase`,`uca_cash_flow`,`k1_ratio_difference`,`k1_history`],d=[`commercial_min_dscr`,`commercial_min_fccr`,`commercial_min_global_dscr`,`commercial_decline_dscr`,`commercial_decline_fccr`,`commercial_decline_global_dscr`,`commercial_min_uca_cash_flow`,`consumer_review_dti`,`consumer_decline_dti`,`consumer_min_credit_score`,`extraction_confidence_threshold`,`k1_stability_band`,`sba_global_dscr_floor_expansion`,`sba_global_dscr_floor_acquisition`];function f(e,t){if(!e)throw Error(`Incomplete or invalid assessment: ${t}`)}function p(e,t){return f(typeof e==`object`&&!!e&&!Array.isArray(e),t),e}function m(e,t){return f(Array.isArray(e),t),e}function h(e){return typeof e==`string`&&e.length>0}function g(e){return typeof e==`number`&&Number.isFinite(e)}function _(e){return typeof e==`string`||typeof e==`boolean`}function v(e){return typeof e==`string`&&/^\\d{4}-\\d{2}-\\d{2}$/.test(e)&&Number.isFinite(Date.parse(e))&&new Date(e).toISOString().slice(0,10)===e}function y(e){let t=p(e,`period`);return f(v(t.period_start)&&v(t.period_end)&&t.period_start<=t.period_end,`period dates`),t}let b=(e,t)=>e.period_start===t.period_start&&e.period_end===t.period_end;function x(e){let t=p(e,`decision`);f(t.vertical===`commercial`&&[`approve`,`review`,`decline`].includes(String(t.outcome))&&a(t.score)&&h(t.policy_version)&&h(t.disclaimer),`decision identity`);let n=m(t.factors,`factors`);f(n.length===5,`commercial factors`);let r=[`dscr`,`fccr`,`global_dscr`,`uca_positive`,`k1_history`];for(let e of n){let t=p(e,`factor`);f(h(t.name)&&r.includes(t.name)&&_(t.value)&&(t.raw_value===null||_(t.raw_value))&&a(t.weight)&&(t.threshold===null||_(t.threshold))&&(t.passed===null||typeof t.passed==`boolean`)&&h(t.source)&&[null,`>=`,`>`,`<`,`==`].includes(t.comparison_operator)&&(t.decline_threshold===null||a(t.decline_threshold))&&(t.decline_triggered===null||typeof t.decline_triggered==`boolean`),`factor fields`)}f(new Set(n.map(e=>p(e,`factor`).name)).size===5,`unique factors`);for(let e of m(t.reasons,`reasons`)){let t=p(e,`reason`);f(h(t.code)&&h(t.factor)&&h(t.message)&&_(t.value),`reason fields`)}return t}function S(e){let t=p(e,`normalized input`);f(t.schema_version===`commercial-assessment-v2`&&v(t.assessment_as_of)&&h(t.borrower_name)&&h(t.geography),`dated identity`);let n=p(t.units,`units`);f(n.currency===`USD`&&n.monetary_unit===`dollars`&&n.annual_rate_unit===`decimal_nominal`,`units`);let r=m(t.years,`years`);f(r.length>=1&&r.length<=10,`year count`);let i=``;for(let e of r){let n=p(e,`year`),r=y(n);f(r.period_start>i&&r.period_end<=t.assessment_as_of,`year order`),i=r.period_end;for(let e of l)f(a(n[e]),`year ${e}`)}let o=(e,t)=>{let n=p(e,`assumption`);for(let e of t)f(a(n[e]),e);return n};o(t.existing_debt,[`cpltd_annual`,`operating_lease_annual`]);let s=o(t.proposed_loan,[`amount`,`annual_rate`]);f(Number.isSafeInteger(s.term_months)&&s.rate_type===`fixed`&&s.repayment_type===`fully_amortizing`&&s.payment_frequency===`monthly`,`loan convention`);let c=o(t.working_capital,[`ar_increase`,`inventory_increase`,`ap_increase`,`cash_taxes_paid`]);f(b(y(c),y(r[r.length-1])),`working capital period`);for(let e of m(t.guarantors,`guarantors`))f(h(o(e,[`ownership_percentage`,`wages`,`interest_dividend_income`,`mortgage_pi_annual`,`auto_loan_annual`,`credit_card_min_annual`]).name),`guarantor name`);return t}function C(e){let t=p(e,`metric`);return f(h(t.fact_id)&&h(t.unit)&&(t.display_precision===null||Number.isInteger(t.display_precision)&&Number(t.display_precision)>=0&&Number(t.display_precision)<=30)&&(t.explanation===null||h(t.explanation)),`metric fields`),f(t.status===`available`?a(t.raw_value)||t.unit===`category`&&h(t.raw_value):t.status===`not_applicable`&&t.raw_value===null&&h(t.explanation),`metric status/value`),f(t.status===`not_applicable`?t.reported_value===null:t.unit===`category`?t.reported_value===t.raw_value:a(t.reported_value),`reported metric value`),t}function w(e){let t=p(e,`assessment`);f(t.schema_version===`commercial-assessment-v2`&&t.calculation_version===`commercial-calculation-v2`&&t.serialization_version===`assessment-json-v2`&&t.coverage_basis===`current_pro_forma`&&h(t.disclaimer),`versions`);let n=S(t.normalized_input),r=n.years[n.years.length-1];f(b(y(t.selected_period),r)&&t.assumptions_as_of===n.assessment_as_of,`selected period`);let i=m(t.historical_spread,`spread`);f(i.length===n.years.length,`spread length`);let o=[];i.forEach((e,t)=>{let r=p(e,`historical period`);f(b(y(r),n.years[t])&&b(y(r.financials),n.years[t]),`historical period correspondence`);let i=p(r.financials,`historical financials`);for(let e of l)f(i[e]===n.years[t][e],`historical inputs`);let s=p(r.reported_financials,`reported financials`);f(b(y(s),n.years[t]),`reported period`);for(let e of l)f(a(s[e])&&/^-?\\d+\\.\\d{2}$/.test(s[e]),`reported source amount`);for(let e of[`gross_profit`,`ordinary_business_income`,`ebitda`,`k1_distribution_ratio`])o.push(C(r[e]))});let s=p(t.current_facts,`facts`);for(let e of u){let t=C(s[e]),r=[`ordinary_business_income`,`ebitda`].includes(e)?`years.${n.years.length-1}.${e}`:`current.${e}`;f(t.fact_id===r,`fact identity`),f(e===`k1_history`?t.status===`available`&&[`stable`,`unstable`,`insufficient_history`].includes(String(t.raw_value)):t.raw_value===null||a(t.raw_value),`fact type`),o.push(t)}let c=m(t.guarantor_contributions,`contributions`);f(c.length===n.guarantors.length,`contributions length`),c.forEach((e,t)=>{let r=p(e,`contribution`);f(r.guarantor_index===t&&r.name===n.guarantors[t].name,`contribution identity`);for(let e of[`business_ebitda`,`outside_income`,`personal_debt`])o.push(C(r[e]))});let _=m(t.k1_history_periods,`history periods`).map(y);f(_.length>=1&&_.length<=2&&b(_[_.length-1],r)&&_.every(e=>n.years.some(t=>b(e,t))),`history periods`);let w=p(t.policy_snapshot,`policy`);f(h(w.version)&&v(w.sba_sop_8_effective)&&v(w.sba_sop_8_1_effective),`policy identity`);for(let e of d)f(e===`consumer_min_credit_score`?Number.isSafeInteger(w[e]):a(w[e]),`policy ${e}`);f(m(w.consumer_required_atr_fields,`ATR fields`).every(h),`ATR fields`);let T=x(t.decision);f(T.policy_version===w.version,`decision policy`);let E=m(t.calculation_trace,`trace`);f(E.length>0,`trace rows`);let D=/* @__PURE__ */ new Map;for(let e of E){let t=p(e,`trace row`),n=C(t);f(h(t.definition_id)&&h(t.expression)&&!D.has(n.fact_id),`trace identity`),D.set(n.fact_id,n);for(let e of m(t.operands,`operands`)){let t=p(e,`operand`);f([`input`,`fact`,`policy`].includes(String(t.reference_type))&&h(t.reference)&&h(t.unit)&&(t.raw_value===null||g(t.raw_value)||typeof t.raw_value==`string`),`operand fields`),f(t.reported_value===null||a(t.reported_value)||Number.isSafeInteger(t.reported_value),`reported operand`)}}for(let e of E){let t=p(e,`trace row`);for(let e of m(t.operands,`operands`)){let t=p(e,`operand`);if(t.reference_type===`fact`){let e=D.get(String(t.reference));f(e&&e.raw_value===t.raw_value&&e.unit===t.unit,`referenced fact`)}else{let e=String(t.reference).split(`/`).slice(1),r=t.reference_type===`policy`?{policy_snapshot:w}:n;for(let t of e)f(typeof r==`object`&&!!r&&Object.prototype.hasOwnProperty.call(r,t),`operand input path`),r=r[t];f(r===t.raw_value,`operand input value`)}}}for(let e of o){let t=D.get(e.fact_id);f(t&&t.raw_value===e.raw_value&&t.reported_value===e.reported_value&&t.status===e.status&&t.unit===e.unit,`fact/trace correspondence`)}for(let e of T.factors){let t=e.name===`uca_positive`?`uca_cash_flow`:e.name;f(e.raw_value===C(s[t]).raw_value,`factor/fact correspondence`)}let O=p(t.fingerprint,`fingerprint`);return f(O.algorithm===`sha256`&&typeof O.value==`string`&&/^[0-9a-f]{64}$/.test(O.value)&&O.content===`normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version`,`fingerprint`),t}function T(e,t){if(!e)throw Error(`Invalid saved-case response or command: ${t}.`)}function E(e,t){return T(typeof e==`object`&&!!e&&!Array.isArray(e),t),e}let D=e=>typeof e==`number`&&Number.isFinite(e),O=e=>typeof e==`string`,k=e=>O(e)&&/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(e),A=e=>O(e)&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(e),j=e=>Number.isSafeInteger(e)&&Number(e)>=1,M=e=>O(e)&&/^[0-9a-f]{64}$/.test(e),N=e=>O(e)&&/^\\d{4}-\\d{2}-\\d{2}$/.test(e)&&Number.isFinite(Date.parse(e))&&new Date(e).toISOString().slice(0,10)===e,P=e=>O(e)&&/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,6})?(?:Z|\\+00:00)$/.test(e)&&N(e.slice(0,10))&&Number.isFinite(Date.parse(e));function F(e,t=0,n=64){if(T(t<n,`JSON depth`),!(e===null||O(e)||typeof e==`boolean`)){if(typeof e==`number`)T(D(e),`finite JSON number`);else{T(typeof e==`object`,`JSON value`);for(let r of Object.values(e))F(r,t+1,n)}}}function I(e,t){if(e===t)return!0;if(!e||!t||typeof e!=`object`||typeof t!=`object`||Array.isArray(e)!==Array.isArray(t))return!1;let n=Object.keys(e),r=Object.keys(t);return n.length===r.length&&n.every(n=>Object.prototype.hasOwnProperty.call(t,n)&&I(e[n],t[n]))}function ee(e){return T(O(e)&&[...e].length<=2e3&&e.trim().length>0,`nonblank rationale, at most 2,000 characters`),e.trim()}let L={years:l,existing_debt:[`cpltd_annual`,`operating_lease_annual`],proposed_loan:[`amount`,`annual_rate`,`term_months`],guarantors:[`ownership_percentage`,`wages`,`interest_dividend_income`,`mortgage_pi_annual`,`auto_loan_annual`,`credit_card_min_annual`],working_capital:[`ar_increase`,`inventory_increase`,`ap_increase`,`cash_taxes_paid`]};function R(e){T(O(e)&&e.length<=160&&e.startsWith(`/`),`numeric field path`);let t=e.slice(1).split(`/`),n=t[0],r=t[t.length-1];return T(Object.prototype.hasOwnProperty.call(L,n)&&L[n].includes(r),`numeric field allowlist`),T([`years`,`guarantors`].includes(n)?t.length===3&&/^(?:0|[1-9][0-9]{0,8})$/.test(t[1]):t.length===2,`field index`),t}function te(e,t){let n=R(t),r=n[0],i=n[n.length-1],o=e,s,c={basis:`current_assumptions`,assessment_as_of:String(o.assessment_as_of),period_start:null,period_end:null,guarantor_index:null,guarantor_name:null,unit:`USD dollars`};if(n.length===3){let e=o[r];T(Array.isArray(e)&&Number(n[1])<e.length,`existing input index`),s=E(e[Number(n[1])],`input row`),r===`guarantors`?(c.guarantor_index=Number(n[1]),c.guarantor_name=String(s.name)):c.basis=`annual_financials`}else s=E(o[r],`input group`),r===`working_capital`&&(c.basis=`working_capital`);[`annual_financials`,`working_capital`].includes(c.basis)&&(T(N(s.period_start)&&N(s.period_end),`input dates`),c.period_start=s.period_start,c.period_end=s.period_end),[`annual_rate`,`ownership_percentage`].includes(i)&&(c.unit=`decimal fraction`),i===`term_months`&&(c.unit=`months`);let l=s[i];return T(i===`term_months`?Number.isSafeInteger(l):a(l)||D(l),`numeric input`),{value:l,context:c}}function ne(e,t){let n=E(e,`snapshot`);F(n),T(n.storage_serialization_version===`case-json-v1`&&A(n.case_id)&&A(n.run_id)&&j(n.revision),`snapshot identity`),T(n.parent_revision===(n.revision===1?null:n.revision-1)&&P(n.recorded_at),`snapshot parent/time`),T(M(n.input_hash)&&M(n.payload_hash),`snapshot hashes`),T(t===`\"case-json-v1:${n.case_id}:${n.revision}:${n.payload_hash}\"`,`strong ETag`);let r=E(n.normalized_input,`stored input`),i=E(n.assessment,`stored assessment`);T(O(i.schema_version)&&O(i.calculation_version)&&O(i.serialization_version),`assessment versions`);let o=i.schema_version===`commercial-assessment-v2`&&i.calculation_version===`commercial-calculation-v2`&&i.serialization_version===`assessment-json-v2`,s=o?w(i):null;s&&T(I(r,s.normalized_input),`outer normalized input`);let l=E(n.event,`event`),u=E(l.context,`event context`);if(T(l.case_id===n.case_id&&l.revision===n.revision&&l.run_id===n.run_id&&l.recorded_at===n.recorded_at&&k(l.actor),`event identity`),ee(l.rationale),T(N(u.assessment_as_of),`event as-of`),T(u.period_start===null&&u.period_end===null||N(u.period_start)&&N(u.period_end)&&u.period_start<=u.period_end,`event period`),T(u.guarantor_index===null&&u.guarantor_name===null||Number.isSafeInteger(u.guarantor_index)&&Number(u.guarantor_index)>=0&&O(u.guarantor_name),`event guarantor`),n.revision===1)T(l.kind===`creation`&&l.field_path===null&&l.before===null&&l.after===null&&u.basis===`case_creation`&&u.unit===null&&u.period_start===null&&u.guarantor_index===null,`creation event`);else if(T(l.kind===`edit`&&(a(l.before)||D(l.before))&&(a(l.after)||D(l.after))&&!c(l.before,l.after)&&O(l.field_path),`edit event`),R(l.field_path),T([`annual_financials`,`working_capital`,`current_assumptions`].includes(String(u.basis))&&[`USD dollars`,`decimal fraction`,`months`].includes(String(u.unit)),`edit context`),s){let e=te(s.normalized_input,l.field_path);T(e.value===l.after&&I(e.context,u),`server-derived edit context`)}return s&&T(u.assessment_as_of===s.normalized_input.assessment_as_of,`event assumptions date`),z(n.recording),{snapshot:n,etag:t,assessment:s,compatibility:o?null:`Stored assessment definition: ${i.schema_version} / ${i.calculation_version} / ${i.serialization_version}. Original JSON is available; typed display and editing are unavailable.`}}function z(e){let t=E(e,`recording metadata`),n=E(t.packages,`installed packages`);T(O(t.python_version)&&O(t.sqlite_version)&&M(t.dependency_baseline_sha256),`recording versions`);for(let e of[`fastapi`,`pydantic`,`starlette`,`uvicorn`])T(O(n[e])&&n[e].length>0,`installed ${e}`);return T(t.source_status===`development_unverified`?t.source_revision===null:t.source_status===`build_reported`&&O(t.source_revision)&&/^[0-9a-f]{40}$/.test(t.source_revision),`recorded source`),t}let B=[`revenue_change`,`cogs_change`,`operating_expense_change`,`proposed_rate_change_bps`],V=`commercial-scenario-preview-v2`;function H(e,t){T(Object.keys(e).length===t.length&&t.every(t=>Object.prototype.hasOwnProperty.call(e,t)),`scenario fields`)}function U(e,t){T(O(e),`scenario text`);let n=e.replace(/^[\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+|[\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+$/gu,``);return T(n.length>0&&[...n].length<=t,`nonblank scenario text, at most ${t} characters`),n}function W(e,t=!1){let n=E(e,`scenario`),r=E(n.assumptions,`shocks`);T(O(n.scenario_key)&&/^[A-Za-z0-9_-]{1,64}$/.test(n.scenario_key),`scenario key`),H(r,B);for(let e of B)T((a(r[e])||t&&D(r[e]))&&(e===`proposed_rate_change_bps`||s(o(r[e]),`-1`)>=0),`finite explicit shock`);return{scenario_key:n.scenario_key,name:U(n.name,120),rationale:U(n.rationale,2e3),assumptions:r}}function G(e){let t=E(e,`scenario command`),n=[`commercial-scenario-comparison-create-v1`,`commercial-scenario-comparison-create-v2`].includes(String(t.schema_version)),r=String(t.schema_version).endsWith(`-v1`);T(n||t.schema_version===V||t.schema_version===`commercial-scenario-preview-v1`,`scenario command version`),H(t,[`schema_version`,`baseline_run_id`,`scenarios`,...n?[`expected_preview_fingerprint`]:[]]),T(A(t.baseline_run_id)&&String(t.baseline_run_id).toLowerCase()===t.baseline_run_id,`canonical baseline run`),n&&T(M(t.expected_preview_fingerprint),`reviewed preview fingerprint`),T(Array.isArray(t.scenarios)&&t.scenarios.length>=1&&t.scenarios.length<=10,`1–10 scenarios`);let i=/* @__PURE__ */ new Set;for(let e of t.scenarios){H(E(e,`scenario command row`),[`scenario_key`,`name`,`rationale`,`assumptions`]);let t=W(e,r);T(I(t,e)&&!i.has(t.scenario_key),`normalized unique scenario command`),i.add(t.scenario_key)}return t}function K(e){let t=E(e.baseline,`preview baseline`);return T(Array.isArray(e.scenarios),`preview scenarios`),G({schema_version:e.schema_version,baseline_run_id:t.run_id,scenarios:e.scenarios.map(t=>W(t,e.schema_version===`commercial-scenario-preview-v1`))})}function q(e,t){return T(Array.isArray(e),t),e}function J(e){return e===null||a(e)}function Y(e){return A(e)&&e.toLowerCase()===e}function X(e){T((e.schema_version===V&&e.serialization_version===`scenario-preview-json-v2`||e.schema_version===`commercial-scenario-preview-v1`&&e.serialization_version===`scenario-preview-json-v1`)&&e.persisted===!1&&O(e.scenario_definition_version)&&O(e.calculation_version),`preview envelope versions`);let t=E(e.baseline,`baseline evidence`);T(Y(t.case_id)&&Y(t.run_id)&&j(t.revision)&&M(t.input_hash)&&M(t.payload_hash),`baseline evidence identity`);let n=E(t.assessment,`original assessment`),r=E(e.fingerprint,`preview fingerprint`);T(r.algorithm===`sha256`&&M(r.value)&&r.content===`baseline_identity+payload_hash+normalized_command+policy_snapshot+versions`,`preview fingerprint`);let i=E(e.selected_period,`selected operating period`);T(N(i.period_start)&&N(i.period_end)&&i.period_start<=i.period_end&&N(e.assumptions_as_of)&&i.period_end<=e.assumptions_as_of,`preview dates`),T(I(e.selected_period,n.selected_period)&&e.assumptions_as_of===n.assumptions_as_of&&I(e.policy_snapshot,n.policy_snapshot),`baseline period and retained policy`);let a=E(n.normalized_input,`baseline input`);return T(I(e.units,a.units),`baseline units`),T(q(e.held_fixed_assumptions,`held fixed assumptions`).length>0&&e.held_fixed_assumptions.every(O)&&O(e.disclaimer),`preview explanation`),K(e),{b:t,a:n}}function re(e,t,n){let r=E(e,`scenario preview`);F(r,0,100);let{b:i,a}=X(r);T(r.schema_version===V&&r.scenario_definition_version===`commercial-scenario-definition-v2`&&r.calculation_version===`commercial-calculation-v2`,`supported live scenario definition`);let o=w(a);t&&T(i.case_id===t.snapshot.case_id&&i.revision===t.snapshot.revision&&i.run_id===t.snapshot.run_id&&i.input_hash===t.snapshot.input_hash&&i.payload_hash===t.snapshot.payload_hash&&I(o,t.snapshot.assessment),`selected original baseline`),n&&T(I(K(r),G(n)),`reviewed normalized command`);for(let e of r.scenarios)ie(e,r,o);return r}function ie(e,t,n){let r=E(e,`scenario result`),i=W(r);T(I({scenario_key:r.scenario_key,name:r.name,rationale:r.rationale,assumptions:r.assumptions},i)&&r.coverage_basis===`stressed_latest_period_current_pro_forma`,`normalized projection command/basis`);let o=E(r.projection_inputs,`projected inputs`),s=n.normalized_input;S({...s,years:[...s.years.slice(0,-1),o.operating],proposed_loan:o.proposed_loan,existing_debt:o.existing_debt,guarantors:o.guarantors,working_capital:o.working_capital});for(let e of[`existing_debt`,`guarantors`,`working_capital`])T(I(o[e],s[e]),`held-fixed projected inputs`);let c=E(o.operating,`projected operating`),d=E(o.proposed_loan,`projected loan`),f=s.years[s.years.length-1];for(let e of l)[`gross_receipts`,`cogs`,`operating_expense_excl_dna_interest_comp`].includes(e)||T(c[e]===f[e],`held-fixed financial lines`);T(c.period_start===f.period_start&&c.period_end===f.period_end,`projected period`);for(let e of Object.keys(s.proposed_loan))e!==`annual_rate`&&T(d[e]===s.proposed_loan[e],`held-fixed loan`);let p=E(r.current_facts,`projected facts`),m=[];for(let e of u){let t=C(p[e]),r=e===`k1_history`||e===`k1_ratio_difference`,i=r?`baseline.`+n.current_facts[e].fact_id:[`ordinary_business_income`,`ebitda`].includes(e)?`projection.operating.${e}`:`projection.current.${e}`;T(t.fact_id===i&&(r?I(t,{...n.current_facts[e],fact_id:i}):J(t.raw_value)),`projected fact identity/type/observed history`),m.push(t)}let h=q(r.guarantor_contributions,`projected guarantors`);T(h.length===s.guarantors.length,`guarantor count`),h.forEach((e,t)=>{let n=E(e,`guarantor contribution`);T(n.guarantor_index===t&&n.name===s.guarantors[t].name,`guarantor identity`);for(let e of[`business_ebitda`,`outside_income`,`personal_debt`]){let r=C(n[e]);T(r.fact_id===`projection.current.guarantors.${t}.${e}`&&J(r.raw_value),`projected guarantor fact`),m.push(r)}});let g=x(r.decision);T(g.policy_version===n.policy_snapshot.version,`retained decision policy`);let _=q(r.calculation_trace,`projection trace`),v=/* @__PURE__ */ new Map;for(let e of _){let t=E(e,`trace row`),n=C(t);T(O(t.definition_id)&&O(t.expression)&&!v.has(n.fact_id),`trace identity`),v.set(n.fact_id,n),q(t.operands,`trace operands`)}for(let e of n.calculation_trace){let t={...e,fact_id:`baseline.`+e.fact_id,operands:e.operands.map(e=>({...e,reference:e.reference_type===`fact`?`baseline.`+e.reference:e.reference_type===`input`?`/baseline/assessment/normalized_input`+e.reference:e.reference}))};T(I(v.get(t.fact_id),t),`retained observed trace identity`)}for(let e of _)for(let n of E(e,`trace row`).operands){let e=E(n,`operand`);if(T(O(e.reference)&&O(e.unit)&&(e.raw_value===null||D(e.raw_value)||O(e.raw_value)),`operand value`),e.reference_type===`fact`){let t=v.get(e.reference);T(t&&t.raw_value===e.raw_value&&t.unit===e.unit,`referenced scenario fact`)}else{T([`input`,`policy`].includes(String(e.reference_type))&&e.reference.startsWith(`/`),`operand reference`);let n={...r,baseline:t.baseline,policy_snapshot:t.policy_snapshot};for(let t of e.reference.slice(1).split(`/`)){let e=ae(n);T(Object.prototype.hasOwnProperty.call(e,t),`scenario operand path`),n=e[t]}T(n===e.raw_value,`scenario operand value`)}}for(let e of m){let t=v.get(e.fact_id);T(t&&[`fact_id`,`raw_value`,`reported_value`,`unit`,`display_precision`,`status`,`explanation`].every(n=>t[n]===e[n]),`fact/trace fields`)}let y=q(r.comparisons,`metric comparisons`);T(y.length===u.length-1,`comparison count`);let b=/* @__PURE__ */ new Set;for(let e of y){let t=E(e,`metric comparison`);T(O(t.metric)&&u.includes(t.metric)&&t.metric!==`k1_history`&&!b.has(t.metric),`compared metric identity`),b.add(t.metric);let r=n.current_facts[t.metric],i=C(p[t.metric]);T(t.baseline_fact_id===`baseline.`+r.fact_id&&t.projected_fact_id===i.fact_id&&t.baseline_value===r.raw_value&&t.projected_value===i.raw_value&&t.unit===i.unit&&J(t.delta),`comparison fact links`),T(r.raw_value===null||i.raw_value===null?t.delta===null&&O(t.delta_explanation):a(t.delta)&&t.delta_explanation===null,`comparison availability`);let o=g.factors.find(e=>e.name===(t.metric===`uca_cash_flow`?`uca_positive`:t.metric));if([`dscr`,`fccr`,`global_dscr`,`uca_cash_flow`].includes(t.metric)){let e=E(t.policy_headroom,`policy headroom`);T(o&&e.comparison_operator===o.comparison_operator&&e.approval_threshold===o.threshold&&e.decline_threshold===o.decline_threshold,`headroom policy`);for(let t of[`baseline_approval`,`projected_approval`,`baseline_decline`,`projected_decline`])T(J(e[t]),`finite headroom`)}else T(t.policy_headroom===null,`non-policy headroom`)}for(let e of g.factors){let t=e.name===`uca_positive`?`uca_cash_flow`:e.name,r=n.decision.factors.find(t=>t.name===e.name);T(e.raw_value===C(p[t]).raw_value&&r&&[`threshold`,`decline_threshold`,`comparison_operator`,`weight`,`source`].every(t=>e[t]===r[t]),`scenario factor fact and retained policy`),t===`k1_history`&&T(I(e,r),`held-fixed observed K-1 factor`)}let w=q(r.factor_changes,`factor changes`);T(w.length===g.factors.length,`factor change count`);let k=/* @__PURE__ */ new Set;for(let e of w){let t=E(e,`factor change`),r=n.decision.factors.find(e=>e.name===t.name),i=g.factors.find(e=>e.name===t.name);T(O(t.name)&&!k.has(t.name)&&r&&i&&I(t.baseline,r)&&I(t.projected,i)&&t.changed===!I(r,i)&&t.basis===(t.name===`k1_history`?`observed_history`:`projected_current`),`factor change links`),k.add(t.name),T(t.projected_fact_id===C(p[t.name===`uca_positive`?`uca_cash_flow`:t.name]).fact_id,`factor projected reference`)}let A=E(r.outcome_change,`outcome change`);T(A.baseline===n.decision.outcome&&A.projected===g.outcome&&A.changed===(A.baseline!==A.projected),`outcome change links`);let j=q(r.reason_changes,`reason changes`),M=Array.from(new Set([...n.decision.reasons,...g.reasons].map(e=>e.code))).filter(e=>!I(n.decision.reasons.find(t=>t.code===e)??null,g.reasons.find(t=>t.code===e)??null));T(j.length===M.length,`reason changes count`);let N=/* @__PURE__ */ new Set;for(let e of j){let t=E(e,`reason change`),r=n.decision.reasons.find(e=>e.code===t.code)??null,i=g.reasons.find(e=>e.code===t.code)??null;T(O(t.code)&&M.includes(t.code)&&!N.has(t.code)&&I(t.baseline,r)&&I(t.projected,i)&&t.change===(r===null?`added`:i===null?`removed`:`changed`),`reason change links`),N.add(t.code)}}function ae(e){return T(typeof e==`object`&&!!e,`operand path object`),e}function oe(e,t){let n=E(e,`original comparison`);F(n,0,100),T([`commercial-scenario-comparison-v1`,`commercial-scenario-comparison-v2`].includes(String(n.schema_version))&&n.storage_serialization_version===`scenario-comparison-json-v1`&&n.persisted===!0&&Y(n.comparison_id)&&Y(n.case_id)&&Y(n.baseline_run_id)&&j(n.baseline_revision)&&M(n.payload_hash),`comparison storage identity`),T(P(n.recorded_at)&&/^\\d{4}-\\d\\d-\\d\\dT(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{6}\\+00:00$/.test(n.recorded_at)&&k(n.actor),`comparison recording time/actor`),z(n.recording),T(t===`\"scenario-comparison-json-v1:${n.case_id}:${n.comparison_id}:${n.payload_hash}\"`,`comparison ETag`);let r=E(n.preview,`original preview`),{b:i,a}=X(r);T(i.case_id===n.case_id&&i.revision===n.baseline_revision&&i.run_id===n.baseline_run_id,`inner/outer original baseline`);let o=r.schema_version===V&&r.scenario_definition_version===`commercial-scenario-definition-v2`&&r.calculation_version===`commercial-calculation-v2`&&a.schema_version===`commercial-assessment-v2`&&a.calculation_version===`commercial-calculation-v2`&&a.serialization_version===`assessment-json-v2`;return{record:n,etag:t,preview:o?re(r):null,compatibility:o?null:`Original definition: ${r.scenario_definition_version} / ${r.calculation_version}; baseline ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON remains available; typed projection and new preview are unavailable.`}}function se(e,t){return`spreadline-case-${e.case_id}-r${e.revision}-${e.run_id}${t?`-comparison-${t.comparison_id}`:``}.json`}function Z(e,t){let n=/* @__PURE__ */ new Set;function r(e,i){if(T(i<t,`export source JSON depth`),e===null||typeof e==`string`||typeof e==`boolean`)return e;if(typeof e==`number`)return T(Number.isFinite(e),`export finite number`),e;T(typeof e==`object`&&!!e,`export JSON value`);let a=e;T(!n.has(a),`export JSON cycle`),T(Object.getOwnPropertySymbols(a).length===0,`export JSON symbol keys`);let o=Array.isArray(a);T(o||Object.getPrototypeOf(a)===Object.prototype||Object.getPrototypeOf(a)===null,`export plain JSON object`);let s=Object.getOwnPropertyNames(a).filter(e=>!o||e!==`length`);o&&T(s.length===a.length&&s.every((e,t)=>e===String(t)),`export dense JSON array`),n.add(a);let c=o?[]:Object.create(null);for(let e of s){let t=Object.getOwnPropertyDescriptor(a,e);T(t.enumerable&&`value`in t,`export plain JSON property`),c[e]=r(t.value,i+1)}return n.delete(a),Object.freeze(c)}return r(e,0)}function ce(e,t){let n=e.snapshot,r=t.record,i=E(r.preview.baseline,`export comparison baseline`);T(r.case_id===n.case_id&&r.baseline_revision===n.revision&&r.baseline_run_id===n.run_id&&i.case_id===n.case_id&&i.revision===n.revision&&i.run_id===n.run_id&&i.input_hash===n.input_hash&&i.payload_hash===n.payload_hash&&I(i.assessment,n.assessment),`retained comparison must match the selected original case, revision, run, hashes and full baseline assessment`)}function le(e,t){let n=Z(e.snapshot,64),r=ne(n,e.etag),i=t===null?null:oe(Z(t.record,100),t.etag);i&&ce(r,i);let a=se(n,i?.record??null);return{package:Object.freeze({schema_version:`spreadline-review-package-v1`,serialization_version:`review-package-json-v1`,scope:`saved_case_revision`,case:Object.freeze({etag:r.etag,snapshot:n}),comparison:i?Object.freeze({etag:i.etag,record:i.record}):null,provenance:Object.freeze({representation:`browser_parsed_json`,actor_status:`prototype_unverified`,integrity_status:`recorded_hashes_not_verified_by_export`}),disclaimer:`Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.`}),filename:a,view:r,comparison:i}}function*Q(e){yield`\"`;for(let t=0;t<e.length;){let n=Math.min(t+4096,e.length);n<e.length&&e.charCodeAt(n-1)>=55296&&e.charCodeAt(n-1)<=56319&&e.charCodeAt(n)>=56320&&e.charCodeAt(n)<=57343&&n--,yield JSON.stringify(e.slice(t,n)).slice(1,-1),t=n}yield`\"`}function*$(e,t=0,n=/* @__PURE__ */ new Set){if(T(t<104,`export envelope JSON depth`),typeof e==`string`){yield*Q(e);return}if(e===null||typeof e==`boolean`){yield String(e);return}if(typeof e==`number`){T(Number.isFinite(e),`export finite number`),yield JSON.stringify(e);return}T(typeof e==`object`&&!!e,`export JSON value`);let r=e,i=Array.isArray(r);T(!n.has(r),`export JSON cycle`),T(Object.getOwnPropertySymbols(r).length===0&&(i||Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null),`export plain JSON object`);let a=Object.getOwnPropertyNames(r).filter(e=>!i||e!==`length`);i?T(a.length===r.length&&a.every((e,t)=>e===String(t)),`export dense JSON array`):a.sort(),n.add(r),yield i?`[`:`{`;for(let e=0;e<a.length;e++){let o=a[e],s=Object.getOwnPropertyDescriptor(r,o);T(s.enumerable&&`value`in s,`export plain JSON property`),yield`${e?`,`:``}\\n${`  `.repeat(t+1)}`,i||(yield*Q(o),yield`: `),yield*$(s.value,t+1,n)}a.length&&(yield`\\n${`  `.repeat(t)}`),yield i?`]`:`}`,n.delete(r)}async function ue(e,t){let n=new TextEncoder,r=[],i=0,a=``,o=0;function s(){if(t?.aborted)throw Error(`Export preparation cancelled.`)}function c(){s();let e=n.encode(a);if(i+e.byteLength>16777216)throw Error(`The complete review package exceeds 16 MiB. No file was prepared. Choose a case-only package explicitly, or a smaller original.`);i+=e.byteLength,o+=e.byteLength,r.push(e),a=``}s();for(let t of $(e))a+=t,a.length>=8192&&c(),o>=131072&&(await new Promise(e=>setTimeout(e,0)),o=0,s());return a+=`\n`,c(),s(),{chunks:r,size:i}}self.onmessage=async e=>{try{let t=le(e.data.view,e.data.comparison),{chunks:n,size:r}=await ue(t.package),i=n.map(e=>e.buffer);self.postMessage({filename:t.filename,buffers:i,size:r},{transfer:i})}catch(e){self.postMessage({error:e instanceof Error?e.message:`Unable to prepare the original review package.`})}}})();", fi = typeof self < "u" && self.Blob && new Blob(["(self.URL || self.webkitURL).revokeObjectURL(self.location.href);", di], { type: "text/javascript;charset=utf-8" });
function pi(e) {
	let t;
	try {
		if (t = fi && (self.URL || self.webkitURL).createObjectURL(fi), !t) throw "";
		let n = new Worker(t, { name: e?.name });
		return n.addEventListener("error", () => {
			(self.URL || self.webkitURL).revokeObjectURL(t);
		}), n;
	} catch {
		return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(di), { name: e?.name });
	}
}
// src/useReviewDownload.ts
function mi(e) {
	let t = (0, A.useRef)(e);
	t.current = e;
	let n = (0, A.useRef)(null), r = (0, A.useRef)(null), i = (0, A.useRef)(!0), [a, o] = (0, A.useState)({
		scope: e,
		busy: !1,
		error: "",
		file: null
	});
	function s(e) {
		n.current && (e === void 0 || n.current.scope === e) && (n.current.worker.terminate(), n.current = null), r.current && (e === void 0 || r.current.scope === e) && (URL.revokeObjectURL(r.current.url), r.current = null);
	}
	(0, A.useEffect)(() => () => s(e), [e]), (0, A.useEffect)(() => (i.current = !0, () => {
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
		let l, u = li(a.snapshot, c?.record ?? null);
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
				worker: new pi()
			}, n.current = l, l.worker.onmessage = (t) => {
				if (!d()) return;
				if (!t.data || typeof t.data != "object" || Array.isArray(t.data)) {
					f("Export preparation returned an invalid file. No download was offered.");
					return;
				}
				let i = t.data;
				if ("error" in i) f(typeof i.error == "string" ? i.error : "Export preparation returned an invalid file. No download was offered.");
				else if (i.filename !== u || typeof i.size != "number" || !Number.isSafeInteger(i.size) || i.size < 1 || i.size > 16777216 || !Array.isArray(i.buffers) || !i.buffers.every((e) => e instanceof ArrayBuffer) || i.buffers.reduce((e, t) => e + t.byteLength, 0) !== i.size) f("Export preparation returned an invalid file. No download was offered.");
				else try {
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
// src/Review.tsx
function hi(e) {
	return typeof e == "string" ? e.length > 240 ? `${e.slice(0, 240)}…` : e : "Unavailable";
}
function gi({ view: e, selection: t, headRevision: n, sourceScope: r, original: i, pending: a, onOpenBaseline: o }) {
	let s = i.loading || i.error ? null : i.view, c = `${r}:${e?.etag ?? ""}:${i.context}:${i.loading}:${s?.etag ?? ""}:${i.error}`, [l, u] = (0, A.useState)({
		source: c,
		included: !1
	}), d = l.source === c && l.included, f = mi(`${c}:${d}`), p = !1;
	if (e && s) try {
		ui(e, s), p = !0;
	} catch {}
	let m = e?.assessment, h = e?.snapshot, g = s?.record, _ = s?.preview?.scenarios.length ?? (Array.isArray(g?.preview.scenarios) ? g.preview.scenarios.length : 0);
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "reviewWorkspace",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel reviewIdentity",
				children: [
					/* @__PURE__ */ (0, U.jsx)("p", {
						className: "eyebrow",
						children: "ORIGINAL RECORD · REVIEW PACKAGE"
					}),
					/* @__PURE__ */ (0, U.jsx)("h2", { children: "Saved-run review" }),
					h ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
						/* @__PURE__ */ (0, U.jsx)("h3", { children: hi(h.normalized_input.borrower_name) }),
						/* @__PURE__ */ (0, U.jsxs)("dl", {
							className: "reviewFacts",
							children: [
								/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Case" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: h.case_id })] }),
								/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Selected revision / run" }), /* @__PURE__ */ (0, U.jsxs)("dd", { children: [
									h.revision,
									" / ",
									h.run_id
								] })] }),
								/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Recorded at" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: h.recorded_at })] }),
								/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Selection" }), /* @__PURE__ */ (0, U.jsxs)("dd", { children: [t === "latest" ? "Latest when last refreshed" : "Original selected revision", n === null ? " · current head not confirmed" : ` · known head ${n}`] })] }),
								/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Financial definitions" }), /* @__PURE__ */ (0, U.jsxs)("dd", { children: [
									hi(h.assessment.schema_version),
									" /",
									" ",
									hi(h.assessment.calculation_version),
									" /",
									" ",
									hi(h.assessment.serialization_version)
								] })] }),
								/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Recording" }), /* @__PURE__ */ (0, U.jsxs)("dd", { children: [
									"Actor: prototype demo, unverified ·",
									" ",
									h.recording.source_status === "build_reported" ? "build revision reported, unverified" : "development build, unverified"
								] })] })
							]
						}),
						m ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
							/* @__PURE__ */ (0, U.jsxs)("p", { children: [
								"Operating period: ",
								m.selected_period.period_start,
								" –",
								" ",
								m.selected_period.period_end,
								" · assumptions as of",
								" ",
								m.assumptions_as_of,
								" · USD dollars."
							] }),
							/* @__PURE__ */ (0, U.jsxs)("p", { children: [
								"Original outcome:",
								" ",
								/* @__PURE__ */ (0, U.jsx)("strong", { children: m.decision.outcome.toUpperCase() }),
								" · policy ",
								hi(m.policy_snapshot.version),
								". Current pro forma coverage; observed history remains separate."
							] }),
							/* @__PURE__ */ (0, U.jsx)("div", {
								className: "reviewMetrics",
								children: [
									["EBITDA", m.current_facts.ebitda],
									["UCA cash flow", m.current_facts.uca_cash_flow],
									["DSCR", m.current_facts.dscr],
									["FCCR", m.current_facts.fccr],
									["Global DSCR", m.current_facts.global_dscr],
									["Observed K-1 history", m.current_facts.k1_history]
								].map(([e, t]) => /* @__PURE__ */ (0, U.jsxs)("div", { children: [
									/* @__PURE__ */ (0, U.jsx)("span", { children: e }),
									/* @__PURE__ */ (0, U.jsx)("strong", { children: $n(t) }),
									t.explanation && /* @__PURE__ */ (0, U.jsx)("small", { children: hi(t.explanation) })
								] }, e))
							}),
							/* @__PURE__ */ (0, U.jsxs)("p", { children: [
								"Recorded reasons: ",
								m.decision.reasons.length,
								". Factors and calculations are in Calculation details above and in the Credit Memo."
							] })
						] }) : /* @__PURE__ */ (0, U.jsx)("p", {
							className: "warning",
							children: "Original JSON only. These financial definitions are not supported for typed conclusions. The guarded original can still be downloaded."
						})
					] }) : /* @__PURE__ */ (0, U.jsx)("p", { children: "Save or open a dated commercial revision to review and export its original evidence. Unsaved inputs, legacy decisions and incomplete case transitions cannot supply this package." })
				]
			}),
			/* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel reviewComparison",
				children: [
					/* @__PURE__ */ (0, U.jsx)("h2", { children: "Retained comparison" }),
					i.loading ? /* @__PURE__ */ (0, U.jsx)("p", {
						role: "status",
						children: "Loading the selected original comparison…"
					}) : i.error ? /* @__PURE__ */ (0, U.jsx)("p", {
						role: "alert",
						children: i.error
					}) : g ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
						/* @__PURE__ */ (0, U.jsxs)("dl", {
							className: "reviewFacts",
							children: [
								/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Comparison" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: g.comparison_id })] }),
								/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Baseline revision / run" }), /* @__PURE__ */ (0, U.jsxs)("dd", { children: [
									g.baseline_revision,
									" / ",
									g.baseline_run_id
								] })] }),
								/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Recorded at" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: g.recorded_at })] })
							]
						}),
						/* @__PURE__ */ (0, U.jsxs)("p", { children: [
							"Full retained batch: ",
							_,
							" ",
							_ === 1 ? "scenario" : "scenarios",
							" in original order."
						] }),
						/* @__PURE__ */ (0, U.jsx)("ul", { children: (s?.preview?.scenarios ?? g.preview.scenarios).map((e, t) => /* @__PURE__ */ (0, U.jsx)("li", { children: hi(e.name) }, t)) }),
						/* @__PURE__ */ (0, U.jsxs)("p", {
							className: "reviewHash",
							children: [
								"Preview fingerprint:",
								" ",
								hi(g.preview.fingerprint?.value)
							]
						}),
						s?.compatibility && /* @__PURE__ */ (0, U.jsx)("p", {
							className: "warning",
							children: "Original JSON only for this comparison; typed projections are unavailable."
						}),
						!p && /* @__PURE__ */ (0, U.jsx)("p", {
							className: "warning",
							children: "This retained comparison has a different original baseline. Open that explicit revision to match its evidence before inclusion."
						}),
						!p && h && g.case_id === h.case_id && /* @__PURE__ */ (0, U.jsx)("button", {
							onClick: () => o({
								caseId: g.case_id,
								revision: g.baseline_revision
							}),
							children: "Open comparison baseline revision"
						})
					] }) : /* @__PURE__ */ (0, U.jsx)("p", { children: "Open a retained original in Stress Tests to include its full batch. A live preview or pending save is excluded." }),
					/* @__PURE__ */ (0, U.jsxs)("label", {
						className: "reviewInclude",
						children: [/* @__PURE__ */ (0, U.jsx)("input", {
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
			/* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel reviewExport",
				children: [
					/* @__PURE__ */ (0, U.jsx)("h2", { children: "JSON review package" }),
					/* @__PURE__ */ (0, U.jsx)("p", {
						className: "provenanceNotice",
						children: "Contains parsed originals and recorded hashes with explicit unverified provenance; does not claim original server bytes or independently verified hashes."
					}),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Includes the full selected original: financial inputs, guarantor details, assessment, policy, trace, reasons, its revision event and recording metadata",
						d ? ", plus the full matching retained comparison batch" : "",
						". This is one revision event, not the entire case history."
					] }),
					/* @__PURE__ */ (0, U.jsx)("p", { children: "Browser-parsed JSON representation; formatting and numeric spellings can differ from server bytes. Recorded hashes are carried unchanged, not verified by this export or calculated over the downloaded file." }),
					a && /* @__PURE__ */ (0, U.jsx)("p", {
						className: "warning",
						children: "Pending work is excluded. Downloading this original leaves recovery tracking unchanged."
					}),
					/* @__PURE__ */ (0, U.jsx)("button", {
						disabled: !e || f.busy || d && !p,
						onClick: () => {
							e && f.prepare(e, d ? s : null);
						},
						children: "Download JSON review package"
					}),
					/* @__PURE__ */ (0, U.jsx)("p", {
						role: "status",
						children: f.busy && h ? `Preparing ${li(h, d ? g ?? null : null)}…` : f.file ? `Prepared ${f.file.filename} (${f.file.size.toLocaleString("en-US")} bytes). The browser handles saving.` : "Maximum complete file: 16 MiB. No evidence is truncated."
					}),
					f.error && /* @__PURE__ */ (0, U.jsx)("p", {
						role: "alert",
						children: f.error
					}),
					f.file && /* @__PURE__ */ (0, U.jsx)("a", {
						className: "reviewDownload",
						href: f.file.url,
						download: f.file.filename,
						children: "Download prepared JSON"
					}),
					/* @__PURE__ */ (0, U.jsx)("p", {
						className: "fine",
						children: ci
					})
				]
			})
		]
	});
}
// src/analysisContracts.ts
var _i = class extends Error {
	kind;
	constructor(e, t) {
		super(e), this.kind = t, this.name = "AnalysisContractError";
	}
}, vi = [
	"dscr",
	"fccr",
	"global_dscr"
], yi = [
	...Je,
	"gross_profit",
	"ordinary_business_income",
	"ebitda"
], bi = [
	"approve",
	"review",
	"decline"
], xi = [
	"meets_approval",
	"review_band",
	"below_decline_floor",
	"not_applicable"
], Si = [
	"coverage_meets_approval",
	"uca_meets_approval",
	"k1_history_stable",
	"coverage_below_decline_floor"
], Ci = [
	"approve_all_conditions",
	"review_k1_history",
	"decline_coverage_floor",
	"review_otherwise"
], wi = [
	"dscr",
	"fccr",
	"global_dscr",
	"k1_history",
	"uca_positive"
];
function Ti(e, t) {
	throw new _i(`Analysis outside the display contract: ${t}`, e);
}
function G(e, t) {
	e || Ti("invalid", t);
}
function K(e, t) {
	return G(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
function Ei(e, t, n = 0, r = Infinity) {
	return G(Array.isArray(e) && e.length >= n && e.length <= r, t), e;
}
var q = (e) => typeof e == "string" && e.trim().length > 0, Di = (e) => typeof e == "string" && M(e), Oi = (e) => e === null || Di(e), ki = (e) => typeof e == "string" && /^\d{4}-\d{2}-\d{2}$/.test(e), Ai = (e, t) => e.period_start === t.period_start && e.period_end === t.period_end;
function ji(e, t) {
	let n = K(e, "analysis");
	(n.schema_version !== "commercial-analysis-v1" || n.definition_version !== "commercial-analysis-definition-v1" || n.serialization_version !== "analysis-json-v1") && Ti("unsupported", "versions");
	let r = K(n.assessment_fingerprint, "fingerprint");
	r.value !== t.fingerprint && Ti("mismatch", "assessment fingerprint");
	let i = Ei(n.periods, "periods", 1, 10);
	(i.length !== t.years.length || i.some((e, n) => !Ai(K(e, "period"), t.years[n]) || K(e, "period").period_index !== n) || !Ai(K(n.selected_period, "selected period"), t.years[t.years.length - 1])) && Ti("mismatch", "periods"), G(r.algorithm === "sha256" && typeof r.content == "string" && q(n.calculation_version) && n.persisted === !1 && q(n.policy_version) && ki(n.assumptions_as_of) && q(n.disclaimer), "identity"), G(n.source === "stateless_request" ? n.baseline === null : n.source === "saved_revision" && Mi(n.baseline), "source and baseline");
	let a = [], o = (e, t, n = !0) => {
		let r;
		try {
			r = st(e);
		} catch {
			Ti("invalid", t);
		}
		return G(r.fact_id === t, t), n && a.push(r), r;
	}, s = (e, t) => {
		let n = K(e, t);
		G(Object.keys(n).length === yi.length, t);
		for (let e of yi) o(n[e], `${t}.${e}`);
	};
	i.forEach((e, n) => {
		let r = K(e, "period");
		if (s(r.common_size, `analysis.periods.${n}.common_size`), r.prior_period === null) G(r.prior_period_adjacent === null && r.change_vs_prior === null, "first period");
		else {
			let e = K(r.prior_period, "prior period");
			G(n > 0 && Ai(e, t.years[n - 1]) && typeof r.prior_period_adjacent == "boolean", "prior period"), s(r.change_vs_prior, `analysis.periods.${n}.change_vs_prior`);
		}
	});
	let c = K(n.debt_capacity, "debt capacity"), l = Ei(c.constraints, "constraints", 3, 3).map((e) => K(e, "constraint"));
	G(c.basis === "latest_period_current_pro_forma" && vi.every((e) => l.filter((t) => t.constraint === e).length === 1) && vi.includes(c.binding_constraint) && typeof c.has_capacity == "boolean", "debt capacity");
	for (let e of l) G(Di(e.approval_minimum), "approval minimum"), o(e.max_annual_payment, `analysis.debt_capacity.${String(e.constraint)}.max_annual_payment`);
	for (let e of [
		"max_annual_payment",
		"max_monthly_payment",
		"max_principal",
		"requested_principal",
		"principal_headroom"
	]) o(c[e], `analysis.debt_capacity.${e}`);
	let u = K(n.breakevens, "breakevens");
	o(u.ownership_weight, "analysis.breakevens.ownership_weight");
	let d = Ei(u.rows, "breakeven rows", 6, 6).map((e) => K(e, "breakeven"));
	for (let e of vi) for (let t of ["approval_minimum", "decline_floor"]) G(d.filter((n) => n.constraint === e && n.threshold_kind === t).length === 1, "breakeven rows");
	for (let e of d) {
		G(Di(e.threshold), "breakeven threshold");
		for (let t of [
			"ebitda_breakeven",
			"ebitda_cushion",
			"revenue_cushion"
		]) o(e[t], `analysis.breakevens.${String(e.constraint)}.${String(e.threshold_kind)}.${t}`);
	}
	for (let e of ["binding_approval_constraint", "binding_decline_constraint"]) G(u[e] === null || vi.includes(u[e]), e);
	Ni(K(n.amortization, "amortization")), Pi(K(n.sensitivity, "sensitivity"), o);
	let f = K(n.explanation, "explanation");
	G(bi.includes(f.outcome) && Ci.includes(f.matched_rule) && q(f.headline) && Ei(f.rules, "rules", 1).every(q), "explanation");
	let p = Ei(f.conditions, "conditions", 4, 4).map((e) => K(e, "condition"));
	G(Si.every((e) => p.filter((t) => t.condition_id === e).length === 1) && p.every((e) => q(e.description) && typeof e.satisfied == "boolean"), "conditions");
	let m = Ei(f.factors, "factors", 5, 5).map((e) => K(e, "factor"));
	G(wi.every((e) => m.filter((t) => t.name === e).length === 1), "factor names");
	for (let e of m) G(q(e.label) && xi.includes(e.status) && q(e.summary) && (e.comparison_operator === null || typeof e.comparison_operator == "string") && (typeof e.value == "string" || typeof e.value == "boolean") && [e.raw_value, e.threshold].every((e) => e === null || typeof e == "string" || typeof e == "boolean") && Oi(e.decline_threshold) && Di(e.weight) && Di(e.score_contribution) && typeof e.blocks_approval == "boolean" && typeof e.triggers_decline == "boolean", "factor"), o(e.approval_cushion, `analysis.explanation.${String(e.name)}.approval_cushion`), o(e.decline_cushion, `analysis.explanation.${String(e.name)}.decline_cushion`);
	let h = K(f.score, "score");
	G([
		"passed_weight",
		"total_weight",
		"raw_score",
		"reported_score"
	].every((e) => Di(h[e])) && q(h.note), "score");
	let g = /* @__PURE__ */ new Map();
	for (let e of Ei(n.calculation_trace, "trace", 1)) {
		let t = K(e, "trace row"), n;
		try {
			n = st(t);
		} catch {
			Ti("invalid", "trace row");
		}
		G(n.fact_id.startsWith("analysis.") && !g.has(n.fact_id) && q(t.definition_id) && q(t.expression) && Ei(t.operands, "operands").every((e) => {
			let t = K(e, "operand");
			return [
				"input",
				"fact",
				"policy"
			].includes(t.reference_type) && q(t.reference) && q(t.unit);
		}), "trace row"), g.set(n.fact_id, n);
	}
	for (let e of a) {
		let t = g.get(e.fact_id);
		e.status === "available" && G(t, `trace for ${e.fact_id}`), t && G(t.raw_value === e.raw_value && t.reported_value === e.reported_value && t.status === e.status && t.unit === e.unit, `trace for ${e.fact_id}`);
	}
	return n;
}
function Mi(e) {
	let t = K(e, "baseline");
	return q(t.case_id) && Number.isSafeInteger(t.revision) && t.revision >= 1 && q(t.run_id) && q(t.input_hash) && q(t.payload_hash);
}
function Ni(e) {
	let t = [
		"schedule_principal",
		"principal_rounding_difference",
		"scheduled_payment",
		"final_payment",
		"final_payment_adjustment",
		"total_payments",
		"total_interest",
		"total_principal"
	], n = Ei(e.annual_rows, "annual rows", 0, 1e3), r = Ei(e.monthly_rows, "monthly rows", 0, 360);
	if (G(typeof e.monthly_rows_truncated == "boolean", "schedule truncation"), e.status === "not_applicable") {
		G(q(e.explanation) && t.every((t) => e[t] === null) && e.payment_count === null && e.early_payoff === null && e.reconciliation === null && !n.length && !r.length, "unavailable schedule");
		return;
	}
	G(e.status === "available" && t.every((t) => Di(e[t])) && Number.isSafeInteger(e.payment_count) && typeof e.early_payoff == "boolean" && n.length > 0 && r.length > 0, "available schedule");
	for (let e of n) {
		let t = K(e, "annual row");
		G(Number.isSafeInteger(t.loan_year) && Number.isSafeInteger(t.months) && [
			"payments",
			"interest",
			"principal",
			"ending_balance"
		].every((e) => Di(t[e])), "annual row");
	}
	for (let e of r) {
		let t = K(e, "monthly row");
		G(Number.isSafeInteger(t.month) && [
			"payment",
			"interest",
			"principal",
			"ending_balance"
		].every((e) => Di(t[e])), "monthly row");
	}
	let i = K(e.reconciliation, "reconciliation");
	G([
		"annuity_monthly_payment",
		"scheduled_monthly_payment",
		"monthly_rounding_difference",
		"coverage_annual_payment",
		"first_loan_year_payments",
		"first_loan_year_difference"
	].every((e) => Di(i[e])) && q(i.explanation), "reconciliation");
}
function Pi(e, t) {
	let n = Ei(e.revenue_changes, "revenue changes"), r = Ei(e.rate_changes_bps, "rate changes"), i = Ei(e.cells, "cells", 0, 20);
	G((e.status === "available" || e.status === "not_applicable") && e.scenario_definition_version === "commercial-scenario-definition-v2" && e.coverage_basis === "stressed_latest_period_current_pro_forma" && Ei(e.definition_ids, "definition ids").every(q) && Ei(e.held_fixed_assumptions, "held fixed").every(q) && n.every(Di) && r.every(Di) && (e.status === "available" ? e.explanation === null && i.length === n.length * r.length : q(e.explanation) && !i.length), "sensitivity grid"), i.forEach((e, i) => {
		let a = K(e, "cell"), o = Math.floor(i / r.length), s = i % r.length;
		G(a.revenue_change === n[o] && a.proposed_rate_change_bps === r[s] && (a.status === "available" ? a.explanation === null && Di(a.resulting_annual_rate) && bi.includes(a.outcome) : a.status === "not_applicable" && q(a.explanation) && a.outcome === null && Oi(a.resulting_annual_rate)), "sensitivity cell");
		for (let e of [
			"dscr",
			"fccr",
			"global_dscr"
		]) t(a[e], `analysis.sensitivity.${o}.${s}.${e}`, !1);
	});
}
// src/analysisApi.ts
var Fi = {
	unavailable: "Analysis unavailable on this server. The assessment above is unaffected.",
	mismatch: "The analysis did not match this assessment, so it is not shown.",
	unsupported: "This analysis version is not supported by this workspace, so it is not shown.",
	invalid: "The analysis response was incomplete or inconsistent, so it is not shown.",
	unreachable: "The analysis service could not be reached."
}, Ii = class extends Error {
	kind;
	status;
	constructor(e, t, n = 0) {
		super(e), this.kind = t, this.status = n, this.name = "AnalysisError";
	}
};
function Li(e) {
	let t = e && typeof e == "object" && "detail" in e ? e.detail : null;
	return t && typeof t == "object" && !Array.isArray(t) ? {
		code: "code" in t && typeof t.code == "string" ? t.code : null,
		message: "message" in t && typeof t.message == "string" ? t.message : null
	} : {
		code: null,
		message: typeof t == "string" && t !== "Not Found" ? t : null
	};
}
async function Ri(e, t, n = fetch) {
	let { source: r } = e;
	if (r.kind === "saved" && !(Nt(r.caseId) && Pt(r.revision))) throw new Ii(Fi.invalid, "failed");
	let i = r.kind === "saved" ? `/cases/${encodeURIComponent(r.caseId)}/revisions/${r.revision}/analysis` : "/commercial/analysis", a;
	try {
		a = await Dt(i, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: r.kind === "saved" ? "{}" : JSON.stringify(r.input),
			signal: t
		}, n);
	} catch (e) {
		throw t.aborted ? e : new Ii(Fi.unreachable, "failed");
	}
	let o;
	try {
		o = await Tr(a, "Analysis");
	} catch (e) {
		throw t.aborted ? e : a.status === 404 ? new Ii(Fi.unavailable, "unavailable", 404) : new Ii(`The analysis response could not be read (${a.status}).`, "failed", a.status);
	}
	if (!a.ok) {
		let { code: e, message: t } = Li(o);
		throw a.status === 404 && !e ? new Ii(Fi.unavailable, "unavailable", 404) : new Ii(t ?? `The analysis request failed (${a.status}).`, "failed", a.status);
	}
	try {
		return ji(o, e);
	} catch (e) {
		throw e instanceof _i ? new Ii(Fi[e.kind], e.kind === "invalid" ? "failed" : e.kind, a.status) : e;
	}
}
// src/requestPriority.ts
var zi = /* @__PURE__ */ new Set();
function Bi(e) {
	return zi.add(e), () => {
		zi.delete(e);
	};
}
function J() {
	let e = [...zi];
	zi.clear();
	for (let t of e) t.abort();
}
// src/useAnalysis.ts
var Y = 4, Vi = (0, A.createContext)({
	state: { status: "none" },
	retry: () => {}
});
function Hi({ subject: e, paused: t, children: n }) {
	let r = (0, A.useRef)(/* @__PURE__ */ new Map()), i = (0, A.useRef)(null), [a, o] = (0, A.useState)(0), s = e?.key ?? null;
	(0, A.useEffect)(() => {
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
		let l = Bi(c.controller), u = (e) => {
			for (r.current.delete(c.key), r.current.set(c.key, e); r.current.size > Y;) r.current.delete(r.current.keys().next().value);
		};
		Ri(e, c.controller.signal).then((e) => u({
			status: "ready",
			analysis: e
		}), (e) => {
			c.controller.signal.aborted || u(e instanceof Ii ? {
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
	]), (0, A.useEffect)(() => () => {
		i.current?.controller.abort(), i.current = null;
	}, []);
	let c = s ? r.current.get(s) : void 0, l = e ? c ?? (t ? { status: "waiting" } : { status: "loading" }) : { status: "none" };
	return (0, A.createElement)(Vi.Provider, { value: {
		state: l,
		retry: () => {
			s && r.current.get(s)?.status === "error" && (r.current.delete(s), o((e) => e + 1));
		}
	} }, n);
}
function Ui() {
	return (0, A.useContext)(Vi);
}
// src/components/Tabs.tsx
function Wi({ label: e, tabs: t, selected: n, onSelect: r, children: i }) {
	let a = (0, A.useId)(), o = (0, A.useRef)(/* @__PURE__ */ new Map()), s = (e) => `${a}tab-${e}`, c = `${a}panel`;
	function l(e) {
		r(e);
		let t = o.current.get(e);
		t?.focus(), t?.scrollIntoView?.({
			block: "nearest",
			inline: "nearest"
		});
	}
	function u(e) {
		let r = t.findIndex((e) => e.key === n), i = e.key === "ArrowRight" ? (r + 1) % t.length : e.key === "ArrowLeft" ? (r - 1 + t.length) % t.length : e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : null;
		i !== null && (e.preventDefault(), l(t[i].key));
	}
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)("div", {
		className: "workspaceTabs",
		role: "tablist",
		"aria-label": e,
		onKeyDown: u,
		children: t.map((e) => {
			let t = e.key === n;
			return /* @__PURE__ */ (0, U.jsx)("button", {
				ref: (t) => {
					t ? o.current.set(e.key, t) : o.current.delete(e.key);
				},
				type: "button",
				role: "tab",
				id: s(e.key),
				"aria-selected": t,
				"aria-controls": t ? c : void 0,
				tabIndex: t ? 0 : -1,
				onClick: () => r(e.key),
				children: e.label
			}, e.key);
		})
	}), /* @__PURE__ */ (0, U.jsx)("div", {
		className: "tabPanel",
		role: "tabpanel",
		id: c,
		"aria-labelledby": s(n),
		tabIndex: 0,
		children: i
	})] });
}
// src/components/DisclosureMenu.tsx
function Gi({ label: e, panelLabel: t, className: n, children: r }) {
	let [i, a] = (0, A.useState)(!1), o = (0, A.useRef)(null), s = (0, A.useRef)(null), c = (0, A.useId)();
	return (0, A.useEffect)(() => {
		if (!i) return;
		let e = (e) => {
			o.current && !e.composedPath().includes(o.current) && a(!1);
		}, t = o.current?.ownerDocument;
		return t?.addEventListener("pointerdown", e), () => t?.removeEventListener("pointerdown", e);
	}, [i]), /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "disclosureMenu",
		ref: o,
		onKeyDown: (e) => {
			e.key === "Escape" && i && (e.preventDefault(), e.stopPropagation(), a(!1), s.current?.focus());
		},
		onBlur: (e) => {
			let t = e.relatedTarget;
			i && t instanceof Node && !e.currentTarget.contains(t) && a(!1);
		},
		children: [/* @__PURE__ */ (0, U.jsxs)("button", {
			ref: s,
			type: "button",
			className: "menuToggle",
			"aria-expanded": i,
			"aria-controls": i ? c : void 0,
			onClick: () => a((e) => !e),
			children: [e, /* @__PURE__ */ (0, U.jsx)("svg", {
				viewBox: "0 0 12 12",
				width: "12",
				height: "12",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, U.jsx)("path", {
					d: "M2.5 4.5 6 8l3.5-3.5",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.5"
				})
			})]
		}), i && /* @__PURE__ */ (0, U.jsx)("div", {
			className: n,
			id: c,
			role: "group",
			"aria-label": t,
			children: r(() => a(!1))
		})]
	});
}
// src/ThemeRoot.tsx
var Ki = "spreadline.theme.v1";
function qi() {
	try {
		return k()?.getItem(Ki) === "dark" ? "dark" : "light";
	} catch {
		return "light";
	}
}
function Ji(e) {
	try {
		k()?.setItem(Ki, e);
	} catch {}
}
var Yi = (0, A.createContext)(null);
function Xi({ children: e }) {
	let [t, n] = (0, A.useState)(qi);
	(0, A.useLayoutEffect)(() => {
		re() || (document.documentElement.dataset.theme = t);
	}, [t]);
	function r(e) {
		Ji(e), n(e);
	}
	return /* @__PURE__ */ (0, U.jsx)(Yi.Provider, {
		value: {
			theme: t,
			setTheme: r
		},
		children: /* @__PURE__ */ (0, U.jsx)("div", {
			className: "themeRoot",
			"data-theme": t,
			children: e
		})
	});
}
function Zi() {
	let e = (0, A.useContext)(Yi);
	if (!e) throw Error("useTheme must be used inside ThemeRoot");
	return e;
}
// src/views/WorkspaceHeader.tsx
function Qi({ children: e }) {
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "workspaceBrand",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "wordmark",
				children: [/* @__PURE__ */ (0, U.jsx)("svg", {
					viewBox: "0 0 24 24",
					width: "24",
					height: "24",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, U.jsx)("path", {
						d: "M2 5h13v4H2zm7 5h13v4H9zM2 15h13v4H2z",
						fill: "currentColor"
					})
				}), /* @__PURE__ */ (0, U.jsx)("span", { children: "Spreadline" })]
			}),
			/* @__PURE__ */ (0, U.jsxs)("span", {
				className: "workspaceType",
				children: ["Commercial underwriting ", /* @__PURE__ */ (0, U.jsx)("span", { children: "USD" })]
			}),
			/* @__PURE__ */ (0, U.jsx)("div", {
				className: "brandActions",
				children: e
			})
		]
	});
}
function $i({ showCases: e, canSave: t, onToggleCases: n, onSave: r }) {
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)("button", {
		type: "button",
		"data-focus-fallback": !0,
		"aria-expanded": e,
		onClick: n,
		children: "Open case"
	}), /* @__PURE__ */ (0, U.jsx)("button", {
		type: "button",
		className: "primary",
		disabled: !t,
		onClick: (e) => r(e.currentTarget),
		children: "Save case"
	})] });
}
function ea({ onEditDraft: e, onExample: t, onImport: n, onDisconnect: r }) {
	let { theme: i, setTheme: a } = Zi();
	return /* @__PURE__ */ (0, U.jsx)(Gi, {
		label: "More",
		panelLabel: "More actions",
		className: "moreMenu",
		children: (o) => /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
			e && /* @__PURE__ */ (0, U.jsx)("div", {
				className: "menuGroup",
				children: /* @__PURE__ */ (0, U.jsx)("button", {
					type: "button",
					onClick: () => {
						o(), e();
					},
					children: "Edit complete draft"
				})
			}),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "menuGroup",
				children: [
					/* @__PURE__ */ (0, U.jsx)("button", {
						type: "button",
						onClick: () => {
							o(), t("dated");
						},
						children: "Load example case"
					}),
					/* @__PURE__ */ (0, U.jsx)("button", {
						type: "button",
						onClick: () => {
							o(), t("legacy");
						},
						children: "Load legacy example case"
					}),
					/* @__PURE__ */ (0, U.jsx)("button", {
						type: "button",
						onClick: () => {
							o(), n();
						},
						children: "Import case file (JSON)"
					})
				]
			}),
			/* @__PURE__ */ (0, U.jsx)("div", {
				className: "menuGroup",
				children: /* @__PURE__ */ (0, U.jsx)("button", {
					type: "button",
					className: "themeToggle",
					"aria-pressed": i === "dark",
					onClick: () => a(i === "dark" ? "light" : "dark"),
					children: "Dark theme"
				})
			}),
			r && /* @__PURE__ */ (0, U.jsx)("div", {
				className: "menuGroup",
				children: /* @__PURE__ */ (0, U.jsx)("button", {
					type: "button",
					onClick: () => {
						o(), r();
					},
					children: "Disconnect workspace"
				})
			})
		] })
	});
}
function ta({ view: e, filename: t, legacy: n }) {
	return /* @__PURE__ */ (0, U.jsxs)("header", {
		className: "caseHeader",
		children: [
			/* @__PURE__ */ (0, U.jsx)("h1", { children: e.title }),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "caseMeta",
				children: [
					e.modeLabel ? /* @__PURE__ */ (0, U.jsx)("span", {
						className: "modeBadge",
						children: e.modeLabel
					}) : /* @__PURE__ */ (0, U.jsx)("span", {
						className: "pendingNote",
						children: e.subtitle
					}),
					e.statusChip && /* @__PURE__ */ (0, U.jsx)("span", {
						className: "statusChip",
						"data-saved": e.statusChip.startsWith("Draft") ? "false" : "true",
						children: e.statusChip
					}),
					/* @__PURE__ */ (0, U.jsxs)("span", {
						className: "caseSource",
						children: [t, " · synthetic only"]
					})
				]
			}),
			n && /* @__PURE__ */ (0, U.jsx)("p", {
				className: "legacyNote",
				children: "Saving requires a separately imported dated assessment with explicit dates and units."
			})
		]
	});
}
// src/views/StartScreen.tsx
function na({ showCases: e, onExample: t, onToggleCases: n, onImport: r, onExcel: i }) {
	let a = (0, A.useId)(), o = [
		{
			key: "example",
			title: "Try the example case",
			detail: "Alpine Fabrication: two fiscal years and a $500,000 ten-year term loan request.",
			onClick: t
		},
		{
			key: "excel",
			title: "Import Excel workbook",
			detail: "Download the standard template, review its inputs and evaluate a commercial assessment.",
			onClick: i
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
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "startScreen",
		"aria-labelledby": `${a}title`,
		children: [
			/* @__PURE__ */ (0, U.jsx)("h1", {
				id: `${a}title`,
				children: "Start a credit analysis"
			}),
			/* @__PURE__ */ (0, U.jsx)("p", {
				className: "startLead",
				children: "Spread the borrower's statements, check coverage against the illustrative policy, and size the loan. Use synthetic data only."
			}),
			/* @__PURE__ */ (0, U.jsx)("div", {
				className: "startOptions",
				children: o.map((t) => /* @__PURE__ */ (0, U.jsxs)("button", {
					type: "button",
					className: t.key === "example" ? "startOption primary" : "startOption",
					"aria-label": t.title,
					"aria-describedby": `${a}${t.key}`,
					"data-focus-fallback": t.key === "open" ? "" : void 0,
					"aria-expanded": t.key === "open" ? e : void 0,
					onClick: t.onClick,
					children: [/* @__PURE__ */ (0, U.jsx)("span", {
						className: "startOptionTitle",
						children: t.title
					}), /* @__PURE__ */ (0, U.jsx)("span", {
						className: "startOptionDetail",
						id: `${a}${t.key}`,
						children: t.detail
					})]
				}, t.key))
			})
		]
	});
}
// src/views/PrototypeNotice.tsx
function ra() {
	let [e, t] = (0, A.useState)(!1), n = (0, A.useId)();
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "warning environmentWarning",
		children: [
			/* @__PURE__ */ (0, U.jsx)("span", { children: "Prototype" }),
			/* @__PURE__ */ (0, U.jsxs)("p", { children: [
				"Synthetic data only. Not validated for lending decisions.",
				" ",
				/* @__PURE__ */ (0, U.jsx)("button", {
					type: "button",
					className: "linkButton",
					"aria-expanded": e,
					"aria-controls": e ? n : void 0,
					onClick: () => t((e) => !e),
					children: "Read full notice"
				})
			] }),
			e && /* @__PURE__ */ (0, U.jsx)("p", {
				className: "noticeDetail",
				id: n,
				children: "Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice."
			})
		]
	});
}
// src/views/DecisionBar.tsx
function ia(e, t) {
	if (!e.decision) return e.pendingTitle;
	if (e.accepted?.mode === "legacy") return "Legacy decision from its policy factors. A dated assessment adds the plain-language explanation.";
	switch (t.status) {
		case "ready": return t.analysis.explanation.headline;
		case "error": return t.message;
		case "waiting": return "The explanation loads after the saved write is confirmed.";
		default: return "Preparing the plain-language explanation…";
	}
}
function aa({ view: e }) {
	let { state: t } = Ui();
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "decision",
		"data-outcome": e.decision?.outcome ?? "unavailable",
		"aria-label": "Illustrative decision",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, U.jsxs)("div", {
			className: "decisionStatus",
			children: [/* @__PURE__ */ (0, U.jsx)("span", { children: "Illustrative decision" }), /* @__PURE__ */ (0, U.jsx)("strong", { children: e.decisionWord })]
		}), /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "decisionReason",
			children: [
				/* @__PURE__ */ (0, U.jsx)("p", { children: ia(e, t) }),
				/* @__PURE__ */ (0, U.jsx)("small", { children: e.decisionNote }),
				e.previous && /* @__PURE__ */ (0, U.jsxs)("small", {
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
// src/views/KpiTiles.tsx
var oa = {
	meets_approval: "Meets approval",
	review_band: "Review band",
	below_decline_floor: "Below decline floor",
	not_applicable: "Not applicable"
}, sa = {
	meets_approval: "Above approval breakeven",
	review_band: "Below approval breakeven",
	below_decline_floor: "Below decline breakeven",
	not_applicable: "Not applicable"
}, ca = {
	meets_approval: "pass",
	review_band: "review",
	below_decline_floor: "fail",
	not_applicable: "na"
}, la = {
	dscr: "DSCR",
	fccr: "FCCR",
	global_dscr: "global DSCR"
};
function ua(e) {
	if (!e.has_capacity) return "none";
	let t = e.principal_headroom.raw_value;
	return M(t) && N(t, "0") >= 0 ? "fits" : "over";
}
var da = {
	fits: "Within capacity",
	over: "Over capacity",
	none: "No capacity"
};
function fa(e, t, n) {
	let r = n?.explanation.factors.find((t) => t.name === e);
	if (r) return r.status;
	let i = t.decision.factors.find((t) => t.name === e);
	return i.passed === null ? "not_applicable" : i.passed ? "meets_approval" : i.decline_triggered ? "below_decline_floor" : "review_band";
}
function pa(e, t, n, r) {
	let i = e?.explanation.factors.find((e) => e.name === t);
	return i ? i.approval_cushion.status === "available" ? `Cushion ${Ve(i.approval_cushion, n)}` : "No cushion: not applicable" : r;
}
function ma(e, t, n, r, i, a, o, s) {
	let c = fa(t, a, o);
	return {
		label: e,
		value: n.status === "available" && M(n.raw_value) ? ze(n.raw_value, [r, i]) : "Not applicable",
		state: ca[c],
		status: oa[c],
		lines: [`Minimum ${Ce(r)}, decline below ${Ce(i)}`],
		cushion: pa(o, t, "multiple", s)
	};
}
var ha = {
	"Business DSCR": "EBITDA divided by annual debt service: existing interest, annual CPLTD and the proposed loan's annual payments.",
	"Global DSCR": "Owner-weighted business EBITDA plus guarantors' wages and interest or dividend income, divided by business debt service plus guarantors' mortgage, auto and card payments.",
	FCCR: "EBITDA divided by annual debt service plus annual operating leases.",
	"UCA cash flow": "EBITDA minus cash taxes paid minus the net increase in working capital (receivables plus inventory minus payables).",
	EBITDA: "Ordinary business income with interest, depreciation, amortization and Section 179 added back.",
	"Annual debt service": "Existing interest plus annual CPLTD plus the proposed loan's annual payments."
};
function ga({ assessment: e }) {
	let { state: t } = Ui(), n = t.status === "ready" ? t.analysis : null, r = t.status === "error" ? "Cushion unavailable" : "Cushion pending", i = e.current_facts, a = e.policy_snapshot, o = fa("uca_positive", e, n), s = n?.debt_capacity, c = s ? ua(s) : null, l = n?.breakevens.binding_approval_constraint, u = l ? n?.breakevens.rows.find((e) => e.constraint === l && e.threshold_kind === "approval_minimum") : void 0, d = l ? fa(l, e, n) : null, f = [
		ma("Business DSCR", "dscr", i.dscr, a.commercial_min_dscr, a.commercial_decline_dscr, e, n, r),
		ma("Global DSCR", "global_dscr", i.global_dscr, a.commercial_min_global_dscr, a.commercial_decline_global_dscr, e, n, r),
		ma("FCCR", "fccr", i.fccr, a.commercial_min_fccr, a.commercial_decline_fccr, e, n, r),
		{
			label: "UCA cash flow",
			value: Le(i.uca_cash_flow, "money"),
			state: ca[o],
			status: oa[o],
			lines: [`Must exceed ${Ie(a.commercial_min_uca_cash_flow)}`],
			cushion: pa(n, "uca_positive", "money", r)
		},
		{
			label: "EBITDA",
			value: Le(i.ebitda, "money"),
			state: d ? ca[d] : "info",
			status: d ? sa[d] : null,
			lines: [`Year ended ${e.selected_period.period_end}`, ...u && l ? [`Approval breakeven ${Le(u.ebitda_breakeven, "money")} (${la[l]})`] : []],
			cushion: u?.ebitda_cushion.status === "available" ? `Cushion ${Ue(u.ebitda_cushion)} of EBITDA` : n ? "No cushion: not applicable" : r
		},
		{
			label: "Annual debt service",
			value: Le(i.debt_service, "money"),
			state: c ? c === "fits" ? "pass" : "fail" : "info",
			status: c ? da[c] : null,
			lines: [`Includes proposed ${Le(i.proposed_annual_payment, "money")} a year`, ...s ? [`New payments up to ${Le(s.max_annual_payment, "money")} a year (${la[s.binding_constraint]})`] : []],
			cushion: s ? c === "fits" ? `Principal headroom ${Le(s.principal_headroom, "money")}` : `Principal shortfall ${Be(s.principal_headroom.raw_value ?? "0")}` : r
		}
	];
	return /* @__PURE__ */ (0, U.jsx)("section", {
		className: "kpiTiles",
		"aria-label": "Assessment overview",
		children: f.map((e) => /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "kpiTile",
			"data-state": e.state,
			children: [
				/* @__PURE__ */ (0, U.jsx)("span", {
					className: "kpiLabel",
					title: ha[e.label],
					children: e.label
				}),
				/* @__PURE__ */ (0, U.jsx)("strong", { children: e.value }),
				e.status && /* @__PURE__ */ (0, U.jsx)("span", {
					className: "kpiStatus",
					children: e.status
				}),
				e.lines.map((e) => /* @__PURE__ */ (0, U.jsx)("small", { children: e }, e)),
				/* @__PURE__ */ (0, U.jsx)("small", {
					className: "kpiCushion",
					children: e.cushion
				})
			]
		}, e.label))
	});
}
// src/views/WorkspaceStatus.tsx
function _a({ state: e, view: t, preparing: n = !1, onSubmit: r, onOpen: i }) {
	let { draft: a, saved: o } = e, s = t.previousAccepted, c = n && !s && e.action === "evaluate";
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		!t.ready && !c && /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "pending",
			role: "status",
			children: [
				/* @__PURE__ */ (0, U.jsx)("strong", { children: t.pendingTitle }),
				a && e.action === "evaluate" && /* @__PURE__ */ (0, U.jsxs)("p", { children: [
					"Submitted draft: ",
					a.filename,
					" · ",
					a.mode,
					" ·",
					" ",
					typeof a.payload.borrower_name == "string" ? a.payload.borrower_name : "Unnamed input",
					a.edit && ` · ${a.edit.path}: ${a.edit.prior} → ${a.edit.next}`
				] }),
				s && /* @__PURE__ */ (0, U.jsxs)("p", { children: [
					"Previous accepted case: ",
					s.input.borrower_name,
					" ·",
					" ",
					s.filename,
					". Its recommendation is inactive."
				] })
			]
		}),
		e.error && /* @__PURE__ */ (0, U.jsx)("div", {
			className: "warning",
			role: "alert",
			children: e.error
		}),
		e.status === "unavailable" && /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "actions",
			children: [
				a && e.action === "evaluate" && /* @__PURE__ */ (0, U.jsx)("button", {
					className: "primary",
					onClick: () => r(a),
					children: "Retry submitted draft"
				}),
				s && /* @__PURE__ */ (0, U.jsx)("button", {
					onClick: () => r({
						mode: s.mode,
						payload: s.input,
						filename: s.filename
					}),
					children: "Re-evaluate last accepted case"
				}),
				o && /* @__PURE__ */ (0, U.jsx)("button", {
					onClick: () => i({
						caseId: o.view.snapshot.case_id,
						revision: o.view.snapshot.revision
					}),
					children: "View previous stored revision"
				})
			]
		})
	] });
}
function va({ view: e }) {
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel compatibility",
		children: [
			/* @__PURE__ */ (0, U.jsx)("h2", { children: "Original stored assessment" }),
			String(e.snapshot.assessment.schema_version).endsWith("-v1") && /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "modelScope",
				role: "status",
				children: [/* @__PURE__ */ (0, U.jsx)("strong", { children: "Archived v1 Record — Read-Only (replay_unavailable)" }), /* @__PURE__ */ (0, U.jsx)("p", { children: "Original JSON facts, hashes, and receipts are preserved and remain available for storage integrity verification. V2 calculation replay and editing are disabled. Browser export carries recorded hashes without independently verifying them." })]
			}),
			/* @__PURE__ */ (0, U.jsx)("p", { children: e.compatibility }),
			/* @__PURE__ */ (0, U.jsx)(Qn, {
				value: e.snapshot,
				className: "compatibilityJson",
				title: "Original stored JSON",
				noun: "record"
			})
		]
	});
}
function X({ assessment: e }) {
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "context",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("span", { children: [
				"Assessment as of: ",
				e.assumptions_as_of,
				" · USD · dollars · nominal annual rate"
			] }),
			/* @__PURE__ */ (0, U.jsxs)("span", { children: ["Coverage period: ", ht(e.selected_period, 0)] }),
			/* @__PURE__ */ (0, U.jsx)("span", { children: "Current pro forma coverage · fixed rate · fully amortizing · monthly payments" })
		]
	});
}
// src/views/workspaceTabs.ts
var ya = [
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
// src/views/EditButton.tsx
function ba({ field: e, canEdit: t, onEdit: n, label: r, children: i }) {
	return /* @__PURE__ */ (0, U.jsx)("button", {
		className: "rowEdit",
		"aria-label": r,
		disabled: !t,
		onClick: (t) => n(e, t.currentTarget),
		children: i
	});
}
// src/TraceInspector.tsx
var xa = {
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
}, Sa = {
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
}, Ca = (e, t) => e === null ? "Unavailable" : M(String(e)) ? t.startsWith("USD") ? be(String(e), {
	places: 2,
	currency: !0
}) : t === "ratio" ? P(String(e), 4) : String(e) : String(e);
function wa({ data: e, onClose: t }) {
	let n = (0, A.useRef)(null);
	(0, A.useEffect)(() => {
		n.current?.focus(), n.current?.scrollIntoView({
			block: "center",
			inline: "nearest",
			behavior: "instant"
		});
	}, [e.title, e.trace?.fact_id]);
	let r = e.trace, i = r ? Sa[r.definition_id] ?? ([
		"global-business-ebitda-v2",
		"global-outside-income-v2",
		"global-personal-debt-v2"
	].includes(r.definition_id) ? r.operands.map(() => "+") : void 0) : void 0;
	return /* @__PURE__ */ (0, U.jsxs)("aside", {
		className: "panel traceInspector",
		role: "region",
		"aria-label": "Calculation inspector",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, U.jsx)("h2", {
					tabIndex: -1,
					ref: n,
					children: e.title
				}), /* @__PURE__ */ (0, U.jsx)("button", {
					type: "button",
					onClick: t,
					children: "Close inspector"
				})]
			}),
			/* @__PURE__ */ (0, U.jsx)("h3", { children: "Exact methodology" }),
			/* @__PURE__ */ (0, U.jsx)("p", { children: e.formula ?? (r ? xa[r.definition_id] ?? r.expression : "Methodology unavailable") }),
			r && /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
				/* @__PURE__ */ (0, U.jsxs)("p", {
					className: "fine",
					children: [
						"Definition ",
						r.definition_id,
						" · ",
						r.fact_id
					]
				}),
				/* @__PURE__ */ (0, U.jsx)("p", {
					className: "expression",
					children: r.expression
				}),
				/* @__PURE__ */ (0, U.jsx)("h3", { children: "Contextual reported operands" }),
				/* @__PURE__ */ (0, U.jsx)("ol", {
					className: "traceOperands",
					children: r.operands.map((e, t) => {
						let n = e.unit.startsWith("USD") && e.raw_value !== null && e.reported_value !== null && P(String(e.raw_value), 2, !1) !== P(String(e.reported_value), 2, !1);
						return /* @__PURE__ */ (0, U.jsxs)("li", {
							"data-allocated": n,
							children: [
								/* @__PURE__ */ (0, U.jsx)("code", { children: e.reference }),
								/* @__PURE__ */ (0, U.jsxs)("strong", { children: [
									i?.[t] ?? "Operand",
									" ",
									Ca(e.reported_value ?? e.raw_value, e.unit)
								] }),
								/* @__PURE__ */ (0, U.jsxs)("small", { children: [
									"Raw ",
									String(e.raw_value),
									" ",
									e.unit,
									" ·",
									" ",
									e.reference_type
								] }),
								n && /* @__PURE__ */ (0, U.jsx)("span", {
									className: "allocationBadge",
									children: "Residual cents allocated by server"
								})
							]
						}, t);
					})
				}),
				i && r.operands.every((e) => e.reported_value !== null) && /* @__PURE__ */ (0, U.jsxs)("p", {
					className: "reconciliationEquation",
					"aria-label": "Server reported reconciliation",
					children: [
						r.operands.map((e, t) => `${t ? `${i[t]} ` : ""}${Ca(e.reported_value, e.unit)}`).join(" "),
						" ",
						"= ",
						Ca(r.reported_value, r.unit),
						/* @__PURE__ */ (0, U.jsx)("small", { children: "Server-recorded signed reconciliation · displayed from recorded operands; no browser sum is recalculated." })
					]
				}),
				/* @__PURE__ */ (0, U.jsxs)("p", { children: [
					"Reported result:",
					" ",
					/* @__PURE__ */ (0, U.jsx)("strong", { children: Ca(r.reported_value, r.unit) }),
					/* @__PURE__ */ (0, U.jsx)("br", {}),
					"Raw result: ",
					/* @__PURE__ */ (0, U.jsx)("code", { children: r.raw_value ?? "Unavailable" })
				] }),
				r.explanation && /* @__PURE__ */ (0, U.jsx)("p", { children: r.explanation }),
				/* @__PURE__ */ (0, U.jsx)("h3", { children: "ROUND_HALF_EVEN reporting" }),
				/* @__PURE__ */ (0, U.jsx)("p", { children: "Money uses cents; ratios use four decimal places. Additive residual cents follow the largest signed rounding residual, with input order breaking ties. Raw values and policy decisions are never altered by reporting rounding." })
			] }),
			e.supplied && /* @__PURE__ */ (0, U.jsx)("dl", {
				className: "traceSupplied",
				children: e.supplied.map((e) => /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: e.label }), /* @__PURE__ */ (0, U.jsx)("dd", { children: e.value })] }, e.label))
			}),
			e.note && /* @__PURE__ */ (0, U.jsx)("p", { children: e.note }),
			/* @__PURE__ */ (0, U.jsx)("h3", { children: "Policy factor verdict" }),
			e.factor ? /* @__PURE__ */ (0, U.jsxs)("p", { children: [
				/* @__PURE__ */ (0, U.jsx)("strong", {
					className: "statusBadge",
					children: e.factor.passed === null ? "Unavailable" : e.factor.passed ? "Pass" : "Fail"
				}),
				" ",
				"· Server comparison ",
				e.factor.comparison_operator ?? "unavailable",
				" ",
				M(e.factor.threshold) && e.factor.name.includes("dti") ? xe(e.factor.threshold, 2) : String(e.factor.threshold ?? "unavailable"),
				".",
				" ",
				e.factor.raw_value === null && "A zero coverage denominator cannot pass a policy factor."
			] }) : /* @__PURE__ */ (0, U.jsx)("p", { children: "No separate policy factor is returned for this fact. Zero coverage denominators are unavailable and cannot pass a policy factor." })
		]
	});
}
// src/views/SpreadView.tsx
function Ta({ ready: e, canEdit: t, input: n, legacy: r, assessment: i, decision: a, index: o, onSelectPeriod: s, onEdit: c }) {
	let [l, u] = (0, A.useState)("reported"), [d, f] = (0, A.useState)(null), p = (0, A.useRef)(null), m = Ui().state, h = i?.calculation_trace.find((e) => e.fact_id === d), g = i && Object.entries(i.current_facts).find(([, e]) => e.fact_id === d)?.[0], _ = a?.factors.find((e) => e.name === g || e.name === "uca_positive" && g === "uca_cash_flow");
	function v(e, t) {
		p.current = t, f(e.fact_id);
	}
	function y(e, t, n, r) {
		if (l === "raw") return r?.status === "not_applicable" ? "Unavailable" : M(r?.raw_value ?? n) ? ye(r?.raw_value ?? n) : String(r?.raw_value ?? n);
		if (l === "common" || l === "change") {
			if (m.status !== "ready") return "Analysis unavailable";
			let n = m.analysis.periods[t], r = (l === "common" ? n.common_size : n.change_vs_prior)?.[e];
			return r?.status === "available" && M(r.raw_value) ? xe(r.raw_value, 2) : l === "change" && !n.prior_period ? "No prior period" : "Unavailable";
		}
		return r ? $n(r) : `$${P(n, 2)}`;
	}
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "grid",
		children: [/* @__PURE__ */ (0, U.jsxs)("div", {
			className: "panel wide",
			children: [
				/* @__PURE__ */ (0, U.jsxs)("div", {
					className: "panelTitle",
					children: [/* @__PURE__ */ (0, U.jsx)("h2", { children: "Annual financial spread" }), /* @__PURE__ */ (0, U.jsx)("span", { children: e ? t ? "Select a supplied input to edit · derived rows are read-only" : "Original accepted inputs · editing unavailable for this selection" : "Previous accepted inputs · editing unavailable" })]
				}),
				/* @__PURE__ */ (0, U.jsxs)("label", {
					className: "spreadMode",
					children: ["Spread presentation", /* @__PURE__ */ (0, U.jsxs)("select", {
						"aria-label": "Spread presentation",
						value: l,
						onChange: (e) => u(e.target.value),
						children: [
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "raw",
								children: "Accepted raw inputs"
							}),
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "reported",
								children: "Reported amounts (rounded half to even)"
							}),
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "common",
								children: "Common-size (%)"
							}),
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "change",
								children: "Year-over-year change"
							})
						]
					})]
				}),
				l === "raw" && /* @__PURE__ */ (0, U.jsx)("p", {
					className: "fine",
					children: "Exact accepted source inputs and server raw calculated facts. No digits are discarded."
				}),
				(l === "common" || l === "change") && /* @__PURE__ */ (0, U.jsx)("p", {
					className: "fine",
					children: "Server analysis only. Unavailable or non-comparable prior values are shown explicitly; no change is calculated by the browser."
				}),
				n ? /* @__PURE__ */ (0, U.jsx)("div", {
					className: "tableScroll",
					children: /* @__PURE__ */ (0, U.jsxs)("table", { children: [/* @__PURE__ */ (0, U.jsx)("thead", { children: /* @__PURE__ */ (0, U.jsxs)("tr", { children: [/* @__PURE__ */ (0, U.jsx)("th", { children: "Line item · USD" }), n.years.map((e, t) => /* @__PURE__ */ (0, U.jsx)("th", { children: /* @__PURE__ */ (0, U.jsx)("button", {
						"aria-pressed": o === t,
						className: o === t ? "period active" : "period",
						onClick: () => s(t),
						children: ht(e, t)
					}) }, t))] }) }), /* @__PURE__ */ (0, U.jsxs)("tbody", { children: [Je.map((e) => /* @__PURE__ */ (0, U.jsxs)("tr", { children: [/* @__PURE__ */ (0, U.jsx)("th", {
						scope: "row",
						children: lt[e]
					}), n.years.map((r, a) => /* @__PURE__ */ (0, U.jsx)("td", {
						className: "num",
						children: /* @__PURE__ */ (0, U.jsx)(ba, {
							field: vt(n, a, e),
							canEdit: t,
							onEdit: c,
							label: `Edit ${lt[e]} for ${ht(r, a)}`,
							children: y(e, a, l === "reported" ? i?.historical_spread[a].reported_financials[e] ?? r[e] : r[e])
						})
					}, a))] }, e)), i && mt.map((e) => /* @__PURE__ */ (0, U.jsxs)("tr", {
						className: "derived",
						"data-fact": e,
						children: [/* @__PURE__ */ (0, U.jsxs)("th", {
							scope: "row",
							children: [
								lt[e] ?? "K-1 distribution ratio",
								" ",
								/* @__PURE__ */ (0, U.jsx)("small", { children: "Calculated" })
							]
						}), i.historical_spread.map((t, n) => /* @__PURE__ */ (0, U.jsx)("td", {
							className: "num",
							children: /* @__PURE__ */ (0, U.jsx)("button", {
								type: "button",
								className: "traceLink",
								"aria-label": `Inspect ${lt[e] ?? "K-1 distribution ratio"} for ${ht(t, n)}`,
								onClick: (n) => v(t[e], n.currentTarget),
								children: y(e, n, t[e].raw_value ?? "", t[e])
							})
						}, n))]
					}, e))] })] })
				}) : /* @__PURE__ */ (0, U.jsx)("p", { children: "No accepted inputs yet." }),
				i && /* @__PURE__ */ (0, U.jsx)("p", {
					className: "fine",
					children: "Report amounts reconcile to income totals in cents. Editing opens the original unrounded input."
				}),
				r && /* @__PURE__ */ (0, U.jsx)("p", {
					className: "fine",
					children: "Legacy inputs have no verified dates or dated calculation trace. Supplied period order is retained."
				})
			]
		}), /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "contextPane",
			children: [/* @__PURE__ */ (0, U.jsx)(Ea, {
				decision: a,
				assessment: i,
				onInspect: v
			}), h && /* @__PURE__ */ (0, U.jsx)(wa, {
				data: {
					title: lt[h.fact_id.split(".").slice(-1)[0] ?? ""] ?? ut[h.fact_id.split(".").slice(-1)[0] ?? ""] ?? h.fact_id,
					trace: h,
					factor: _
				},
				onClose: () => {
					f(null), p.current?.focus();
				}
			})]
		})]
	});
}
function Ea({ decision: e, assessment: t, onInspect: n }) {
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ (0, U.jsx)("h2", { children: "Current coverage" }),
			e ? e.factors.map((e) => /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "metric",
				"data-state": e.passed === null ? "review" : e.passed ? "pass" : "fail",
				children: [
					/* @__PURE__ */ (0, U.jsx)("span", { children: t ? /* @__PURE__ */ (0, U.jsx)("button", {
						type: "button",
						className: "traceLink",
						onClick: (r) => {
							let i = t.current_facts[e.name === "uca_positive" ? "uca_cash_flow" : e.name];
							i && n(i, r.currentTarget);
						},
						children: lt[e.name] ?? e.name
					}) : lt[e.name] ?? e.name }),
					/* @__PURE__ */ (0, U.jsx)("strong", { children: He(e) }),
					/* @__PURE__ */ (0, U.jsxs)("small", { children: [
						e.name === "uca_positive" && M(e.threshold) ? `Must exceed ${Ie(e.threshold)}` : `Policy: ${e.comparison_operator ?? "comparison unavailable"} ${M(e.threshold) ? Ce(e.threshold) : String(e.threshold)}`,
						" ",
						"·",
						" ",
						e.passed === null ? "Review required" : e.passed ? "Pass" : "Below policy",
						e.decline_threshold !== null && ` · decline below ${Ce(e.decline_threshold)}`
					] })
				]
			}, e.name)) : /* @__PURE__ */ (0, U.jsx)("p", { children: "No current results. Resolve the selected input and retry." }),
			t && /* @__PURE__ */ (0, U.jsxs)("details", { children: [/* @__PURE__ */ (0, U.jsx)("summary", { children: "Inspect current calculated facts" }), [
				"proposed_monthly_payment",
				"proposed_annual_payment",
				"debt_service",
				"fixed_charge_service",
				"global_cash_flow",
				"global_debt_service",
				"uca_cash_flow"
			].map((e) => /* @__PURE__ */ (0, U.jsx)("button", {
				type: "button",
				className: "traceFact",
				onClick: (r) => n(t.current_facts[e], r.currentTarget),
				children: ut[e]
			}, e))] })
		]
	});
}
// src/trendGeometry.ts
var Da = 40, Oa = (e) => e.startsWith("-") ? e.slice(1) : e;
function ka(e, t) {
	let n = e.filter((e) => e !== null), r = n.some((e) => N(e, "0") < 0) ? Math.floor(t.height / 2) : t.height, i = n.reduce((e, t) => N(Oa(t), e) > 0 ? Oa(t) : e, "0"), a = e.length, o = a ? Math.max(1, Math.min(Da, Math.floor((t.width - t.gap * (a - 1)) / a))) : 0;
	return {
		baseline: r,
		bars: e.map((e, n) => {
			if (e === null) return null;
			let a = we(e, i, r), s = a < 0n, c = s ? -a : a;
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
// src/views/TrendChart.tsx
var Aa = {
	width: 240,
	height: 64,
	gap: 8
};
function ja({ title: e, points: t }) {
	let n = ka(t.map((e) => e.value), Aa), r = `${e}: ${t.map((e) => `${e.text} for ${e.label}`).join("; ")}`;
	return /* @__PURE__ */ (0, U.jsxs)("figure", {
		className: "trendChart",
		children: [
			/* @__PURE__ */ (0, U.jsx)("figcaption", { children: e }),
			/* @__PURE__ */ (0, U.jsxs)("svg", {
				viewBox: `0 0 ${Aa.width} ${Aa.height}`,
				preserveAspectRatio: "none",
				role: "img",
				"aria-label": r,
				children: [/* @__PURE__ */ (0, U.jsx)("line", {
					className: "trendBaseline",
					x1: "0",
					x2: Aa.width,
					y1: n.baseline,
					y2: n.baseline
				}), n.bars.map((e, t) => e ? /* @__PURE__ */ (0, U.jsx)("rect", {
					className: e.negative ? "trendBar negative" : "trendBar",
					x: e.x,
					y: e.y,
					width: e.width,
					height: e.height
				}, t) : null)]
			}),
			/* @__PURE__ */ (0, U.jsx)("ol", {
				className: "trendLegend",
				"aria-hidden": "true",
				children: t.map((e) => /* @__PURE__ */ (0, U.jsxs)("li", { children: [/* @__PURE__ */ (0, U.jsx)("span", { children: e.short }), /* @__PURE__ */ (0, U.jsx)("strong", { children: e.text })] }, e.label))
			})
		]
	});
}
// src/views/OverviewView.tsx
var Ma = [
	"approve_all_conditions",
	"review_k1_history",
	"decline_coverage_floor",
	"review_otherwise"
], Na = {
	dscr: "Business DSCR",
	fccr: "FCCR",
	global_dscr: "Global DSCR"
};
function Pa({ title: e, className: t, children: n }) {
	let r = (0, A.useId)();
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: `panel ${t ?? ""}`,
		"aria-labelledby": r,
		children: [/* @__PURE__ */ (0, U.jsx)("h2", {
			id: r,
			children: e
		}), n]
	});
}
function Fa({ state: e, retry: t }) {
	return e.status === "error" ? /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "analysisNotice",
		role: "status",
		children: [/* @__PURE__ */ (0, U.jsx)("p", { children: e.message }), t && e.kind === "failed" && /* @__PURE__ */ (0, U.jsx)("button", {
			type: "button",
			onClick: t,
			children: "Retry analysis"
		})]
	}) : /* @__PURE__ */ (0, U.jsx)("p", {
		className: "analysisNotice",
		role: "status",
		children: e.status === "waiting" ? "The analysis resumes after the saved write is confirmed." : "Preparing the analysis…"
	});
}
function Ia(e, t) {
	return e.status === "available" ? Ve(e, t) : "not applicable";
}
function La({ analysis: e }) {
	let { explanation: t } = e, n = t.rules[Ma.indexOf(t.matched_rule)];
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		/* @__PURE__ */ (0, U.jsx)("p", {
			className: "overviewHeadline",
			children: t.headline
		}),
		n && /* @__PURE__ */ (0, U.jsxs)("p", { children: ["Rule applied: ", n] }),
		/* @__PURE__ */ (0, U.jsx)("h3", { children: "Outcome conditions" }),
		/* @__PURE__ */ (0, U.jsx)("ul", {
			className: "conditionList",
			children: t.conditions.map((e) => /* @__PURE__ */ (0, U.jsxs)("li", {
				"data-satisfied": e.satisfied,
				children: [/* @__PURE__ */ (0, U.jsx)("span", { children: e.description }), /* @__PURE__ */ (0, U.jsx)("strong", { children: e.satisfied ? "Yes" : "No" })]
			}, e.condition_id))
		}),
		/* @__PURE__ */ (0, U.jsx)("h3", { children: "Policy factors" }),
		/* @__PURE__ */ (0, U.jsx)("ul", {
			className: "factorList",
			children: t.factors.map((e) => {
				let t = e.name === "uca_positive" ? "money" : "multiple";
				return /* @__PURE__ */ (0, U.jsxs)("li", {
					"data-status": e.status,
					children: [
						/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("strong", { children: e.label }), /* @__PURE__ */ (0, U.jsx)("span", {
							className: "factorStatus",
							children: oa[e.status]
						})] }),
						/* @__PURE__ */ (0, U.jsx)("p", { children: e.summary }),
						e.name !== "k1_history" && /* @__PURE__ */ (0, U.jsxs)("small", { children: [
							"Approval cushion ",
							Ia(e.approval_cushion, t),
							e.name !== "uca_positive" && `, decline cushion ${Ia(e.decline_cushion, t)}`
						] })
					]
				}, e.name);
			})
		}),
		/* @__PURE__ */ (0, U.jsxs)("p", {
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
function Ra({ analysis: e, assessment: t }) {
	let n = e.debt_capacity, r = t.normalized_input.proposed_loan, i = (t) => {
		let n = t === "approval_minimum" ? e.breakevens.binding_approval_constraint : e.breakevens.binding_decline_constraint, r = n && e.breakevens.rows.find((e) => e.constraint === n && e.threshold_kind === t);
		return r && n ? {
			binding: n,
			row: r
		} : null;
	}, a = i("approval_minimum"), o = i("decline_floor"), s = ua(n);
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		/* @__PURE__ */ (0, U.jsxs)("p", { children: [
			s === "fits" ? "The requested principal fits within the illustrative coverage minimums." : s === "over" ? "The requested principal is larger than the illustrative coverage minimums support." : "Existing obligations leave no room for new payments at the illustrative coverage minimums.",
			" ",
			Na[n.binding_constraint],
			" binds first."
		] }),
		/* @__PURE__ */ (0, U.jsxs)("dl", {
			className: "capacityFacts",
			children: [
				/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Binding constraint" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: Na[n.binding_constraint] })] }),
				/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsxs)("dt", { children: [
					"Maximum principal at ",
					Ge(r.annual_rate, "%"),
					" for ",
					Ge(r.term_months, "months")
				] }), /* @__PURE__ */ (0, U.jsx)("dd", { children: Le(n.max_principal, "money", Re) })] }),
				/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Requested principal" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: Le(n.requested_principal, "money", Re) })] }),
				/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: s === "fits" ? "Principal headroom" : "Principal shortfall" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: s === "fits" ? Le(n.principal_headroom, "money", Re) : Be(n.principal_headroom.raw_value ?? "0", Re) })] }),
				/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Largest new payment" }), /* @__PURE__ */ (0, U.jsxs)("dd", { children: [
					Le(n.max_annual_payment, "money", Re),
					" a year (",
					Le(n.max_monthly_payment, "money", Re),
					" a month)"
				] })] }),
				a && /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsxs)("dt", { children: [
					"Revenue cushion to the ",
					la[a.binding],
					" approval minimum"
				] }), /* @__PURE__ */ (0, U.jsx)("dd", { children: Ue(a.row.revenue_cushion, 2) })] }),
				o && /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsxs)("dt", { children: [
					"Revenue cushion to the ",
					la[o.binding],
					" decline floor"
				] }), /* @__PURE__ */ (0, U.jsx)("dd", { children: Ue(o.row.revenue_cushion, 2) })] })
			]
		}),
		/* @__PURE__ */ (0, U.jsx)("h3", { children: "New annual payment allowed by each minimum" }),
		/* @__PURE__ */ (0, U.jsx)("ul", {
			className: "constraintList",
			children: n.constraints.map((e) => /* @__PURE__ */ (0, U.jsxs)("li", {
				"data-binding": e.constraint === n.binding_constraint,
				children: [/* @__PURE__ */ (0, U.jsxs)("span", { children: [
					Na[e.constraint],
					" at ",
					Ce(e.approval_minimum),
					e.constraint === n.binding_constraint && " (binding)"
				] }), /* @__PURE__ */ (0, U.jsx)("strong", { children: Le(e.max_annual_payment, "money", Re) })]
			}, e.constraint))
		}),
		/* @__PURE__ */ (0, U.jsx)("p", {
			className: "fine",
			children: "Policy arithmetic at the approval minimums, holding every other input fixed. It is not a credit approval."
		})
	] });
}
function za({ assessment: e }) {
	let t = e.historical_spread, n = (e, n, r) => ({
		label: ht(t[e], e),
		short: t[e].period_end,
		value: n,
		text: r
	});
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "trendGrid",
		children: [/* @__PURE__ */ (0, U.jsx)(ja, {
			title: "Gross receipts",
			points: t.map((e, t) => n(t, e.financials.gross_receipts, Ie(e.financials.gross_receipts)))
		}), /* @__PURE__ */ (0, U.jsx)(ja, {
			title: "EBITDA",
			points: t.map((e, t) => n(t, e.ebitda.status === "available" ? e.ebitda.raw_value : null, Le(e.ebitda, "money")))
		})]
	});
}
function Ba({ view: e }) {
	let { state: t, retry: n } = Ui(), { assessment: r } = e;
	if (e.ready && e.accepted?.mode === "legacy") return /* @__PURE__ */ (0, U.jsx)(Pa, {
		title: "Overview",
		children: /* @__PURE__ */ (0, U.jsx)("p", { children: "Legacy decisions have policy factor results only. The explanation, debt capacity and trends need a dated assessment." })
	});
	if (!r) return /* @__PURE__ */ (0, U.jsx)(Pa, {
		title: "Overview",
		children: /* @__PURE__ */ (0, U.jsx)("p", { children: "No current assessment is available. Resolve or choose a case to see its explanation." })
	});
	let i = t.status === "ready" ? t.analysis : null;
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "overviewGrid",
		children: [
			/* @__PURE__ */ (0, U.jsx)(Pa, {
				title: "Why this decision",
				className: "overviewExplanation",
				children: i ? /* @__PURE__ */ (0, U.jsx)(La, { analysis: i }) : /* @__PURE__ */ (0, U.jsx)(Fa, {
					state: t,
					retry: n
				})
			}),
			/* @__PURE__ */ (0, U.jsx)(Pa, {
				title: "Debt capacity",
				className: "overviewCapacity",
				children: i ? /* @__PURE__ */ (0, U.jsx)(Ra, {
					analysis: i,
					assessment: r
				}) : /* @__PURE__ */ (0, U.jsx)(Fa, { state: t })
			}),
			/* @__PURE__ */ (0, U.jsx)(Pa, {
				title: "Trends",
				className: "overviewTrends",
				children: /* @__PURE__ */ (0, U.jsx)(za, { assessment: r })
			})
		]
	});
}
// src/views/AssumptionsView.tsx
function Va({ title: e, prefix: t, values: n, period: r, input: i, mode: a, canEdit: o, onEdit: s }) {
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "panel",
		children: [/* @__PURE__ */ (0, U.jsx)("h2", { children: e }), Object.entries(n).map(([e, n]) => {
			let c = yt(i, a, t, e, n, r);
			return /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "assumption",
				children: [/* @__PURE__ */ (0, U.jsx)(ba, {
					field: c,
					canEdit: o,
					onEdit: s,
					children: c.label
				}), /* @__PURE__ */ (0, U.jsx)("strong", { children: c.unit === "%" ? `${Ke(me(String(n), 2))}%` : c.unit === "months" ? `${n} months` : `$${Ke(String(n))}` })]
			}, e);
		})]
	});
}
function Ha({ ready: e, accepted: t, canEdit: n, onEdit: r }) {
	let i = t?.input;
	return /* @__PURE__ */ (0, U.jsxs)("section", { children: [/* @__PURE__ */ (0, U.jsx)("p", { children: e ? "Annual assumptions used by the backend. Select an amount to propose an edit." : "Previous accepted assumptions; no active recommendation." }), t && i && /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "assumptionsGrid",
		children: [
			/* @__PURE__ */ (0, U.jsx)(Va, {
				title: "Existing debt",
				prefix: "/existing_debt",
				values: i.existing_debt,
				input: i,
				mode: t.mode,
				canEdit: n,
				onEdit: r
			}),
			/* @__PURE__ */ (0, U.jsx)(Va, {
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
			/* @__PURE__ */ (0, U.jsx)(Va, {
				title: "Working capital",
				prefix: "/working_capital",
				values: {
					ar_increase: i.working_capital.ar_increase,
					inventory_increase: i.working_capital.inventory_increase,
					ap_increase: i.working_capital.ap_increase,
					cash_taxes_paid: i.working_capital.cash_taxes_paid
				},
				period: _t(i),
				input: i,
				mode: t.mode,
				canEdit: n,
				onEdit: r
			})
		]
	})] });
}
function Ua({ ready: e, accepted: t, canEdit: n, onEdit: r }) {
	let i = t?.input;
	return /* @__PURE__ */ (0, U.jsxs)("section", { children: [/* @__PURE__ */ (0, U.jsx)("p", { children: e ? "Guarantor income and personal debt used for global coverage. Select an amount to propose an edit." : "Previous accepted guarantors; no active recommendation." }), t && i && /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "assumptionsGrid",
		children: [i.guarantors.map((e, a) => /* @__PURE__ */ (0, U.jsx)(Va, {
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
		}, a)), i.guarantors.length === 0 && /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "panel",
			children: [/* @__PURE__ */ (0, U.jsx)("h2", { children: "Business-only fallback" }), /* @__PURE__ */ (0, U.jsx)("p", { children: "No guarantors supplied. The backend uses full business EBITDA for global coverage." })]
		})]
	})] });
}
// src/views/DetailsView.tsx
function Wa({ ready: e, input: t, assessment: n, decision: r, index: i }) {
	let a = (0, A.useId)(), o = (0, A.useId)(), [s, c] = (0, A.useState)(!1);
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel",
		"aria-labelledby": a,
		children: [
			/* @__PURE__ */ (0, U.jsx)("h2", {
				id: a,
				children: "Calculation details"
			}),
			!n && /* @__PURE__ */ (0, U.jsx)("p", { children: e ? "Legacy mode has decision factors but no dated spread or trace." : "No current assessment is available." }),
			(n || r) && /* @__PURE__ */ (0, U.jsx)("button", {
				type: "button",
				className: "detailsToggle",
				"aria-expanded": s,
				"aria-controls": o,
				onClick: () => c((e) => !e),
				children: "Definitions, operands and policy snapshot"
			}),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				id: o,
				hidden: !s,
				children: [n ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Policy version:",
						" ",
						/* @__PURE__ */ (0, U.jsx)("strong", { children: n.policy_snapshot.version })
					] }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"K-1 comparison periods:",
						" ",
						n.k1_history_periods.map((e, t) => ht(e, t)).join(" / ")
					] }),
					/* @__PURE__ */ (0, U.jsx)("h3", { children: "Current facts" }),
					Object.values(n.current_facts).map((e) => /* @__PURE__ */ (0, U.jsx)(Ga, {
						metric: e,
						assessment: n
					}, e.fact_id)),
					/* @__PURE__ */ (0, U.jsxs)("h3", { children: [
						"Selected historical period:",
						" ",
						ht(t.years[i], i)
					] }),
					mt.map((e) => /* @__PURE__ */ (0, U.jsx)(Ga, {
						metric: n.historical_spread[i][e],
						assessment: n
					}, e)),
					/* @__PURE__ */ (0, U.jsx)("h3", { children: "Guarantor contributions" }),
					n.guarantor_contributions.length ? n.guarantor_contributions.map((e) => /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("h4", { children: e.name }), [
						e.business_ebitda,
						e.outside_income,
						e.personal_debt
					].map((e) => /* @__PURE__ */ (0, U.jsx)(Ga, {
						metric: e,
						assessment: n
					}, e.fact_id))] }, e.guarantor_index)) : /* @__PURE__ */ (0, U.jsx)("p", { children: "Business-only fallback; no guarantor contributions." }),
					/* @__PURE__ */ (0, U.jsxs)("details", { children: [/* @__PURE__ */ (0, U.jsx)("summary", { children: "Complete policy snapshot" }), /* @__PURE__ */ (0, U.jsx)("pre", { children: JSON.stringify(n.policy_snapshot, null, 2) })] }),
					/* @__PURE__ */ (0, U.jsxs)("p", {
						className: "fine",
						children: [
							"Calculation: ",
							n.calculation_version,
							" · serialization:",
							" ",
							n.serialization_version,
							/* @__PURE__ */ (0, U.jsx)("br", {}),
							"Content fingerprint (not document authentication):",
							" ",
							/* @__PURE__ */ (0, U.jsx)("code", { children: n.fingerprint.value })
						]
					})
				] }) : null, r && /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("h3", { children: "Raw policy comparisons" }), r.factors.map((e) => /* @__PURE__ */ (0, U.jsxs)("div", {
					className: "operand",
					children: [
						/* @__PURE__ */ (0, U.jsx)("strong", { children: lt[e.name] }),
						/* @__PURE__ */ (0, U.jsxs)("span", { children: [
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
						/* @__PURE__ */ (0, U.jsx)("small", { children: e.source })
					]
				}, e.name))] })]
			})
		]
	});
}
function Ga({ metric: e, assessment: t }) {
	let n = t.calculation_trace.find((t) => t.fact_id === e.fact_id);
	return n ? /* @__PURE__ */ (0, U.jsxs)("details", { children: [
		/* @__PURE__ */ (0, U.jsxs)("summary", { children: [
			e.fact_id,
			" · ",
			$n(e)
		] }),
		/* @__PURE__ */ (0, U.jsx)("p", { children: /* @__PURE__ */ (0, U.jsx)("strong", { children: n.definition_id }) }),
		/* @__PURE__ */ (0, U.jsx)("p", {
			className: "expression",
			children: n.expression
		}),
		/* @__PURE__ */ (0, U.jsx)("h3", { children: "Actual operands" }),
		n.operands.map((e, t) => /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "operand",
			children: [
				/* @__PURE__ */ (0, U.jsx)("code", { children: e.reference }),
				/* @__PURE__ */ (0, U.jsxs)("span", { children: [
					e.raw_value === null ? "Not applicable" : String(e.raw_value),
					" ",
					e.unit
				] }),
				/* @__PURE__ */ (0, U.jsxs)("small", { children: [e.reference_type, e.reported_value !== null && ` · Reported component: ${P(String(e.reported_value), 2)} ${e.unit}`] })
			]
		}, t)),
		/* @__PURE__ */ (0, U.jsxs)("p", { children: [
			"Raw result: ",
			String(n.raw_value),
			" ",
			n.unit
		] }),
		n.explanation && /* @__PURE__ */ (0, U.jsx)("p", { children: n.explanation })
	] }) : null;
}
// src/views/MemoView.tsx
function Ka({ decision: e }) {
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel memo",
		children: [
			/* @__PURE__ */ (0, U.jsx)("h2", { children: "Credit memo" }),
			e ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
				/* @__PURE__ */ (0, U.jsx)("h3", { children: "Recommendation" }),
				/* @__PURE__ */ (0, U.jsxs)("p", { children: [
					e.outcome[0].toUpperCase() + e.outcome.slice(1),
					" ",
					"for prototype demonstration based on the accepted inputs."
				] }),
				/* @__PURE__ */ (0, U.jsx)("h3", { children: "Primary factors considered" }),
				/* @__PURE__ */ (0, U.jsx)("ul", { children: e.factors.map((e) => /* @__PURE__ */ (0, U.jsxs)("li", { children: [
					lt[e.name],
					": ",
					qe(e),
					" —",
					" ",
					e.passed === null ? "manual review required" : e.passed ? "meets configured policy" : "does not meet configured policy"
				] }, e.name)) }),
				/* @__PURE__ */ (0, U.jsx)("h3", { children: "Recorded reasons" }),
				e.reasons.length ? /* @__PURE__ */ (0, U.jsx)("ul", { children: e.reasons.map((e, t) => /* @__PURE__ */ (0, U.jsx)("li", { children: e.message }, t)) }) : /* @__PURE__ */ (0, U.jsx)("p", { children: "No additional reasons returned." })
			] }) : /* @__PURE__ */ (0, U.jsx)("p", { children: "No current decision is available." }),
			/* @__PURE__ */ (0, U.jsx)("p", {
				className: "fine",
				children: ci
			})
		]
	});
}
// src/views/HistoryView.tsx
function qa({ saved: e, ready: t, history: n, input: r, onOpen: i }) {
	return e ? /* @__PURE__ */ (0, U.jsx)(yr, {
		saved: e,
		active: t,
		onOpen: i
	}) : /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel historyPanel",
		children: [
			/* @__PURE__ */ (0, U.jsx)("h2", { children: "Session edit history" }),
			/* @__PURE__ */ (0, U.jsx)("p", { children: "Resets on reload. Actor: demonstration analyst; timestamps are local and unverified." }),
			n.length === 0 ? /* @__PURE__ */ (0, U.jsx)("p", { children: "No applied edits this session." }) : n.map((e, t) => /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "audit",
				children: [
					/* @__PURE__ */ (0, U.jsx)("strong", { children: e.path }),
					/* @__PURE__ */ (0, U.jsxs)("span", { children: [
						e.prior,
						" → ",
						e.next
					] }),
					/* @__PURE__ */ (0, U.jsxs)("small", { children: [
						e.rationale || "No rationale given",
						" · ",
						e.at
					] })
				]
			}, t)),
			r && "overrides" in r && !!r.overrides?.length && /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)("h3", { children: "Unverified imported history" }), r.overrides.map((e, t) => /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "audit imported",
				children: [
					/* @__PURE__ */ (0, U.jsx)("strong", { children: e.field }),
					/* @__PURE__ */ (0, U.jsxs)("span", { children: [
						String(e.prior_value),
						" → ",
						String(e.new_value)
					] }),
					/* @__PURE__ */ (0, U.jsxs)("small", { children: [
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
// src/sampleCases.ts
var Ja = {
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
}, Ya = {
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
}, Xa = "The server could not evaluate this case", Za = 3;
function Qa(e) {
	if (e.status === 413) return "This case is larger than the 1,000,000-byte request limit, so it was not evaluated.";
	let t = e.fieldErrors.filter((e) => e.pointer !== "");
	if (!t.length) return `${Xa}: ${e.detail ?? e.fieldErrors[0]?.message ?? e.message}`;
	let n = t.slice(0, Za).map((e) => `${wt(e.pointer)}: ${e.message}`), r = t.length - n.length;
	return `${Xa}. ${n.join(" ")}${r > 0 ? ` …and ${r} more.` : ""}`;
}
function $a(e) {
	if (e instanceof Ot) return e.kind === "rejected" ? Qa(e) : e.kind === "unreadable" ? `The calculation service sent an unreadable response (${e.status}). Nothing was recalculated; retry when it is available.` : e.status ? `The calculation service is unavailable (${e.status}). Nothing was recalculated; retry shortly.` : e.detail === "timeout" ? "The calculation service did not respond within 30 seconds. Nothing was recalculated; retry when it is available." : e.detail ? `The request was not completed: ${e.detail}` : "The calculation service could not be reached. Nothing was recalculated; check the connection, then retry.";
	let t = e instanceof Error ? e.message : String(e), n = /^Incomplete or invalid assessment: (.+)$/.exec(t);
	return n ? `The calculation service returned an incomplete result (${n[1]}), so it was not used. Retry, or check the server version.` : t;
}
function eo(e) {
	let t = e instanceof Error ? e.message : String(e);
	return `This file can't be imported: ${e instanceof SyntaxError || t === "Invalid JSON number." ? "it is not valid JSON." : t.endsWith("unsupported schema_version") ? "its schema version is not supported." : /^Incomplete or invalid assessment: request$/.test(t) ? "it does not contain a case object." : `${t.charAt(0).toLowerCase()}${t.slice(1)}`}`;
}
// src/decisionPreparation.ts
var to = 5e3;
async function no(e, t) {
	let n = to - (performance.now() - e);
	n <= 0 || t.aborted || await new Promise((e) => {
		let r = () => {
			clearTimeout(i), t.removeEventListener("abort", r), e();
		}, i = setTimeout(r, n);
		t.addEventListener("abort", r, { once: !0 });
	});
}
// src/useSavedWrite.ts
var ro = class {
	storage;
	transport;
	state;
	listeners = /* @__PURE__ */ new Set();
	request = null;
	constructor(e, t = fetch) {
		this.storage = e, this.transport = t;
		let n = kn(e);
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
		return J(), this.submit(e);
	}
	retry() {
		let e = this.state.operation;
		if (!e || this.state.inFlight || this.state.writeError?.status === 409 && !this.state.writeError.certain) throw Error("Review this pending operation before retrying.");
		return J(), this.submit(e);
	}
	submit(e) {
		let t = xn(e);
		if (this.state.operation && !V(this.state.operation, t)) throw Error("The pending operation cannot be replaced.");
		try {
			On(this.storage, t);
		} catch (e) {
			let t = kn(this.storage);
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
			An(this.storage, e.id), this.update({
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
				...await kr(e, t.signal, this.transport)
			} : {
				kind: "case",
				...await ur(e, t.signal, this.transport)
			};
			if (t.signal.aborted) throw new ar("The view closed before acknowledgment. Keep the original operation for exact retry.");
			return this.clear(e), n;
		} catch (t) {
			let n = or(t);
			throw this.update({ writeError: n }), n.certain && this.clear(e), n;
		} finally {
			this.request === t && (this.request = null, this.update({ inFlight: !1 }));
		}
	}
	discard() {
		if (this.request) throw Error("Wait for the current response before discarding tracking.");
		jn(this.storage), this.update({
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
	let [e] = (0, A.useState)(() => new ro(Cn())), t = (0, A.useSyncExternalStore)(e.subscribe, e.snapshot);
	return (0, A.useEffect)(() => () => e.abort(), [e]), {
		...t,
		controller: e
	};
}
// src/useAnalystWorkspace.ts
function ao() {
	let [e, t] = (0, A.useReducer)(Ln, null, () => In(Cn())), n = (0, A.useRef)(e);
	n.current = e;
	let r = (0, A.useRef)(0), i = (0, A.useRef)(null), a = (0, A.useRef)(null), o = (0, A.useRef)(null), s = (0, A.useRef)(!1), c = io(), { operation: l, recoveryError: u, inFlight: d, writeError: f } = c, [p, m] = (0, A.useState)(null), [h, g] = (0, A.useState)(null), _ = (0, A.useRef)(0), [v, y] = (0, A.useState)(""), [b, x] = (0, A.useState)([]), [S, C] = (0, A.useState)(null), [ee, te] = (0, A.useState)(null), [w, T] = (0, A.useState)(null), [ne, re] = (0, A.useState)(null), E = (0, A.useRef)(ne);
	E.current = ne;
	function D(e, n, o = "evaluate") {
		let s = ++r.current;
		return i.current?.abort(), a.current?.abort(), i.current = null, a.current = null, t({
			type: "start",
			id: s,
			filename: e,
			draft: n,
			action: o
		}), x([]), C(null), s;
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
		let o = performance.now(), s = !e.edit;
		s && C({
			id: n,
			received: !1
		});
		try {
			let i = await At(e, a.signal);
			if (n !== r.current || a.signal.aborted) return;
			if (s && (C({
				id: n,
				received: !0
			}), await no(o, a.signal)), n === r.current && !a.signal.aborted) return t({
				type: "success",
				id: n,
				accepted: i
			}), i;
		} catch (e) {
			n === r.current && !a.signal.aborted && (x(e instanceof Ot ? e.fieldErrors : []), t({
				type: "failure",
				id: n,
				error: $a(e)
			}));
		}
	}
	function ie(e) {
		if (d || l || u || E.current) throw Error("Resolve saved-write recovery before evaluating this import.");
		return Nn(Cn(), null), O(e);
	}
	function k(e) {
		Nn(Cn(), null), O({
			mode: e,
			payload: e === "dated" ? Ja : at(Ya),
			filename: e === "dated" ? "alpine_dated_v2.json" : "alpine.json",
			resetHistory: !0
		});
	}
	async function ae(e) {
		if (!e) return;
		Nn(Cn(), null);
		let n = D(e.name, null);
		try {
			if (e.size > 1e6) throw Error("Use a JSON file no larger than 1,000,000 bytes.");
			let t = await e.text();
			if (n !== r.current) return;
			let i = Ne(t);
			await O({
				mode: rt(i),
				payload: i,
				filename: e.name,
				rawJson: t,
				resetHistory: !0
			}, n);
		} catch (e) {
			n === r.current && t({
				type: "failure",
				id: n,
				error: eo(e)
			});
		}
	}
	async function oe(e) {
		let n = D(`Saved case ${e.caseId}`, null, "open"), a = new AbortController();
		i.current = a, Nn(Cn(), e);
		try {
			let i = await lr(e.caseId, e.revision, a.signal);
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
				error: or(e).message
			});
		}
	}
	async function se(e, n) {
		let i = new AbortController();
		a.current = i;
		try {
			let a = await lr(e.snapshot.case_id, "latest", i.signal);
			if (n !== r.current || i.signal.aborted) return;
			if (a.snapshot.revision < e.snapshot.revision || a.snapshot.revision === e.snapshot.revision && (a.etag !== e.etag || a.snapshot.run_id !== e.snapshot.run_id)) throw Error("Latest snapshot disagrees with the acknowledged receipt.");
			t({
				type: "head",
				id: n,
				caseId: e.snapshot.case_id,
				revision: e.snapshot.revision,
				headRevision: a.snapshot.revision
			}), Nn(Cn(), {
				caseId: e.snapshot.case_id,
				revision: a.snapshot.revision === e.snapshot.revision ? "latest" : e.snapshot.revision
			});
		} catch (e) {
			n === r.current && !i.signal.aborted && y(`Write accepted. Latest could not be confirmed; this original receipt remains read-only. ${or(e).message}`);
		}
	}
	async function j(e) {
		o.current?.abort();
		let t = new AbortController();
		o.current = t;
		try {
			let n = await lr(e.caseId, "latest", t.signal);
			if (t.signal.aborted || !s.current) return;
			if (!n.assessment || n.snapshot.revision < e.baseRevision || !V(Ht(n.snapshot.normalized_input, e.review.path).context, e.context)) throw Error("The latest field's definition/context cannot be reviewed with this proposal.");
			re((t) => t?.operation.id === e.id ? {
				...t,
				latest: n,
				error: ""
			} : t);
		} catch (n) {
			!t.signal.aborted && s.current && re((t) => t?.operation.id === e.id ? {
				...t,
				latest: null,
				error: or(n).message
			} : t);
		}
	}
	async function ce(e, n, i, a) {
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
			}), Nn(Cn(), {
				caseId: e.view.snapshot.case_id,
				revision: e.view.snapshot.revision
			}), se(e.view, n)) : te(e.view);
		} catch (i) {
			if (!s.current) return;
			let a = or(i);
			a.certain && (a.status === 412 && e.kind === "edit" ? (re({
				operation: e,
				latest: null,
				error: ""
			}), j(e)) : T(e)), n === r.current && t({
				type: "failure",
				id: n,
				error: a.message
			});
		}
	}
	function le(e, t) {
		if (c.controller.snapshot().inFlight || c.controller.snapshot().operation || u || E.current) throw Error("Resolve this tab's existing saved write or proposal first.");
		let n = c.controller.start(e);
		T(null), te(null), ce(e, D(e.kind === "create" ? "Saving dated case" : `Saved case ${e.caseId}`, null, "write"), t, n);
	}
	function ue(e) {
		let t = n.current;
		if (t.status !== "ready" || t.accepted?.mode !== "dated" || t.saved) throw Error("Open an accepted unsaved dated input before saving.");
		le(En(t.accepted.input, e), !0);
	}
	function de(e = n.current) {
		return e.status === "ready" && !!e.accepted && (!e.saved || !c.controller.snapshot().operation && !u && !E.current && !!e.saved.view.assessment && e.saved.selection === "latest" && e.saved.headRevision === e.saved.view.snapshot.revision);
	}
	function fe(e, t) {
		let r = n.current;
		if (!de(r) || !r.accepted) throw Error("Open a supported latest revision and resolve pending work before editing.");
		r.saved ? le(Dn(r.saved.view, e, t), !1) : O({
			mode: r.accepted.mode,
			payload: Rn(r.accepted.input, e),
			filename: r.accepted.filename,
			edit: e
		});
	}
	function M() {
		let e = c.controller.snapshot().operation;
		if (!e || d || f?.status === 409 && !f.certain) return;
		let t = c.controller.retry();
		e.kind === "comparison" ? me(e, r.current, t) : ce(e, D(e.kind === "create" ? "Recovering saved case" : `Saved case ${e.caseId}`, null, "write"), e.kind === "create", t);
	}
	function pe() {
		c.controller.discard(), y("Local recovery tracking discarded. This does not undo a write that might already be saved.");
	}
	async function me(e, t, n) {
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
				let n = or(e);
				g({
					scope: t,
					message: n.message,
					code: n.code
				});
			}
		}
	}
	function N(e) {
		let t = n.current, i = e.baseline;
		if (t.status !== "ready" || !t.saved || E.current || t.saved.view.snapshot.case_id !== i.case_id || t.saved.view.snapshot.revision !== i.revision || t.saved.view.snapshot.run_id !== i.run_id || t.saved.view.snapshot.payload_hash !== i.payload_hash) throw Error("Review the currently selected original baseline before saving.");
		let a = Sn(e), o = c.controller.start(a);
		me(a, r.current, o);
	}
	function he(e) {
		let n = D(`Saved case ${e.snapshot.case_id}`, null, "open");
		t({
			type: "stored-success",
			id: n,
			view: e,
			selection: "latest"
		}), Nn(Cn(), {
			caseId: e.snapshot.case_id,
			revision: "latest"
		}), o.current?.abort(), re(null), E.current = null, c.controller.clearError();
	}
	function ge() {
		let e = E.current;
		if (!e?.latest) return null;
		let t = JSON.parse(e.operation.body), n = Ht(e.latest.snapshot.normalized_input, e.operation.review.path).value;
		return he(e.latest), {
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
	function P() {
		let e = E.current;
		e?.latest ? he(e.latest) : (o.current?.abort(), re(null), E.current = null);
	}
	async function _e(e, n) {
		let i = w;
		if (i?.kind !== "edit") return null;
		let a = r.current, s = new AbortController();
		o.current?.abort(), o.current = s;
		let c = await lr(i.caseId, "latest", s.signal);
		if (s.signal.aborted || a !== r.current || !c.assessment) return null;
		let l = Ht(c.assessment.normalized_input, i.review.path);
		if (!V(l.context, i.context)) throw Error("The latest field has a different context. Review the complete original before changing it.");
		let u = D(`Saved case ${i.caseId}`, null, "open");
		return t({
			type: "stored-success",
			id: u,
			view: c,
			selection: "latest"
		}), Nn(Cn(), {
			caseId: i.caseId,
			revision: "latest"
		}), T(null), {
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
	return (0, A.useEffect)(() => {
		s.current = !0;
		let e = c.controller.snapshot().operation;
		if (!e || e.kind === "comparison") {
			let t = Mn(Cn());
			t ? oe(t) : e?.kind === "comparison" && oe({
				caseId: e.caseId,
				revision: e.baselineRevision
			});
		}
		return () => {
			s.current = !1, r.current++, i.current?.abort(), a.current?.abort(), o.current?.abort();
		};
	}, []), {
		state: e,
		preparation: e.status === "evaluating" && e.action === "evaluate" && S?.id === e.id ? S : null,
		fieldErrors: b,
		submit: O,
		submitImport: ie,
		upload: ae,
		demo: k,
		save: ue,
		edit: fe,
		openSaved: oe,
		operation: l,
		comparisonAck: p,
		comparisonError: h,
		retainComparison: N,
		inFlight: d,
		writeError: f,
		recoveryError: u,
		notice: v,
		offer: ee,
		rejected: w,
		conflict: ne,
		canEdit: de(e),
		canSave: e.status === "ready" && e.accepted?.mode === "dated" && !e.saved && !l && !u && !ne,
		retryWrite: M,
		discardTracking: pe,
		reviewConflict: ge,
		reviewRejected: _e,
		cancelConflict: P,
		refreshConflict: () => {
			E.current && j(E.current.operation);
		},
		dismissRejected: () => T(null),
		dismissOffer: () => te(null),
		dismissComparisonAck: () => m(null),
		clearComparisonError: () => g(null),
		deferComparisonAck: (e) => m((t) => t?.serial === e ? {
			...t,
			scope: null
		} : t)
	};
}
// src/components/SessionStatus.tsx
function oo({ startedAt: e }) {
	let [t, n] = (0, A.useState)(Date.now());
	if ((0, A.useEffect)(() => {
		if (e === null) return;
		n(Date.now());
		let t = setInterval(() => n(Date.now()), 250);
		return () => clearInterval(t);
	}, [e]), e === null) return null;
	let r = Math.max(0, t - e);
	return /* @__PURE__ */ (0, U.jsxs)("span", {
		className: "requestDeadline",
		"aria-busy": "true",
		children: [r >= 100 && /* @__PURE__ */ (0, U.jsxs)("span", { children: [
			"Request active · ",
			Math.max(0, 30 - Math.floor(r / 1e3)),
			"s until deadline"
		] }), r >= 1e3 && /* @__PURE__ */ (0, U.jsx)("span", {
			className: "requestSkeleton",
			"aria-hidden": "true"
		})]
	});
}
function so({ actor: e }) {
	let t = (0, A.useSyncExternalStore)(ee, C), n = (0, A.useSyncExternalStore)(ir, rr);
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsxs)("div", {
		className: "sessionStatus",
		"aria-label": "Connection status",
		children: [
			/* @__PURE__ */ (0, U.jsx)("span", {
				className: "connectionBadge",
				children: re() ? "Testing host connected" : "API access verified"
			}),
			/* @__PURE__ */ (0, U.jsxs)("span", { children: ["Operator identity not provided", e ? ` · selected record attributed to ${e}` : ""] }),
			/* @__PURE__ */ (0, U.jsx)("span", { children: "Reload clears drafts and retry tracking" }),
			/* @__PURE__ */ (0, U.jsx)(oo, { startedAt: t.startedAt })
		]
	}), n && /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "modelScope",
		role: "status",
		children: [/* @__PURE__ */ (0, U.jsx)("strong", { children: "Stateless Mode Active" }), /* @__PURE__ */ (0, U.jsx)("p", { children: "Case persistence is disabled. Commercial assessments and decisions, Consumer Decision, and SBA Screen remain usable through the standalone API. The Streamlit testing bridge supports commercial workflows only." })]
	})] });
}
// src/CommercialComposer.tsx
function co(e) {
	let t = Rr(e === "dated" ? Ja : Ya), n = (e, t = "") => Array.isArray(e) ? t === "guarantors" ? [] : e.slice(0, 1).map((e) => n(e)) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).map(([e, t]) => [e, n(t, e)])) : [
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
	let s = Kr(t ? Rr(t) : co(e)), [c, l] = (0, A.useState)(""), u = s.values.years, d = s.values.guarantors;
	(0, A.useEffect)(() => {
		n.length && s.reject(n);
	}, [n]);
	let f = [
		lo("/borrower_name", "Borrower name", "text"),
		lo("/geography", "Geography", "text", {
			placeholder: "60601",
			helper: "ZIP code or supplied geographic reference"
		}),
		...e === "dated" ? [lo("/assessment_as_of", "Assessment as of", "date")] : []
	], p = u.map((t, n) => [...e === "dated" ? [lo(`/years/${n}/period_start`, `Period start · Period ${n + 1}`, "date"), lo(`/years/${n}/period_end`, `Period end · Period ${n + 1}`, "date")] : [], ...Je.map((e) => lo(`/years/${n}/${e}`, `${lt[e]} · Period ${n + 1}`, "money", e === "interest_expense" ? { min: "0" } : {}))]), m = [
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
	], h = [...e === "dated" ? [lo("/working_capital/period_start", "Working capital period start", "date"), lo("/working_capital/period_end", "Working capital period end", "date")] : [], ...[
		"ar_increase",
		"inventory_increase",
		"ap_increase",
		"cash_taxes_paid"
	].map((e) => lo(`/working_capital/${e}`, lt[e] ?? e, "money"))], g = d.map((e, t) => [
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
		].map((e) => lo(`/guarantors/${t}/${e}`, `Guarantor ${t + 1} ${lt[e] ?? e.replace(/_/g, " ")}`, "money", ["wages", "interest_dividend_income"].includes(e) ? {} : { min: "0" }))
	]), _ = [
		...f,
		...p.flat(),
		...m,
		...h,
		...g.flat()
	], v = (e) => /* @__PURE__ */ (0, U.jsx)("div", {
		className: "formGrid",
		children: e.map((e) => /* @__PURE__ */ (0, U.jsx)(Xr, {
			form: s,
			spec: e
		}, e.pointer))
	});
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel composerPanel",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("h1", { children: e === "dated" ? "Build a dated assessment" : "Build an undated decision" }), /* @__PURE__ */ (0, U.jsx)("p", { children: "Enter source facts. The server calculates every financial result and policy verdict." })] }), /* @__PURE__ */ (0, U.jsx)("button", {
					type: "button",
					onClick: o,
					children: "Return to workspace"
				})]
			}),
			/* @__PURE__ */ (0, U.jsxs)("label", {
				className: "sampleSelector",
				children: ["Load sample case", /* @__PURE__ */ (0, U.jsxs)("select", {
					"aria-label": "Load sample case",
					value: c,
					onChange: (t) => {
						let n = t.target.value;
						l(n), n && s.replace(e === "dated" ? Ja : Ya);
					},
					children: [/* @__PURE__ */ (0, U.jsx)("option", {
						value: "",
						children: "Choose a synthetic preset"
					}), /* @__PURE__ */ (0, U.jsx)("option", {
						value: e === "dated" ? "dated" : "legacy",
						children: e === "dated" ? "Alpine · Dated v2 · exact decimal strings" : "Alpine · Undated commercial decision"
					})]
				})]
			}),
			/* @__PURE__ */ (0, U.jsxs)("form", {
				ref: s.root,
				className: "guidedForm",
				noValidate: !0,
				onSubmit: (t) => {
					if (t.preventDefault(), i) return;
					let n = s.prepare(_);
					n && a({
						mode: e,
						payload: n,
						filename: "Analyst-entered case",
						resetHistory: !0
					});
				},
				children: [
					/* @__PURE__ */ (0, U.jsx)(qr, {
						form: s,
						specs: _
					}),
					r && /* @__PURE__ */ (0, U.jsx)("p", {
						role: "alert",
						children: r
					}),
					/* @__PURE__ */ (0, U.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, U.jsx)("legend", { children: "Case identity" }), v(f)] }),
					e === "dated" && /* @__PURE__ */ (0, U.jsxs)("div", {
						className: "structuralHints",
						"aria-label": "Fiscal-period structural hints",
						children: [Wr(s.values).map((e) => /* @__PURE__ */ (0, U.jsxs)("span", {
							"data-valid": e.valid,
							children: [
								e.valid ? "Ready" : "Review",
								" · ",
								e.label
							]
						}, e.label)), /* @__PURE__ */ (0, U.jsx)("p", {
							className: "fine",
							children: "Structural hints are non-blocking. The server validates fiscal dates and working capital."
						})]
					}),
					p.map((e, t) => /* @__PURE__ */ (0, U.jsxs)("details", {
						open: !0,
						children: [
							/* @__PURE__ */ (0, U.jsxs)("summary", { children: ["Financial period ", t + 1] }),
							v(e),
							u.length > 1 && /* @__PURE__ */ (0, U.jsxs)("button", {
								type: "button",
								onClick: () => s.setValues((e) => ({
									...e,
									years: u.filter((e, n) => n !== t)
								})),
								children: ["Remove period ", t + 1]
							})
						]
					}, t)),
					/* @__PURE__ */ (0, U.jsx)("button", {
						type: "button",
						onClick: () => {
							u.length < 10 && s.setValues((e) => ({
								...e,
								years: [...u, Object.fromEntries(Object.keys(u[0]).map((e) => [e, ""]))]
							}));
						},
						children: "Add financial period"
					}),
					/* @__PURE__ */ (0, U.jsxs)("details", {
						open: !0,
						children: [
							/* @__PURE__ */ (0, U.jsx)("summary", { children: "Debt and proposed loan" }),
							v(m),
							e === "dated" && /* @__PURE__ */ (0, U.jsx)("p", {
								className: "fine",
								children: "Fixed rate · fully amortizing · monthly payments. These conventions remain explicit in the request."
							})
						]
					}),
					/* @__PURE__ */ (0, U.jsxs)("details", { children: [/* @__PURE__ */ (0, U.jsx)("summary", { children: "Working capital and cash taxes" }), v(h)] }),
					/* @__PURE__ */ (0, U.jsxs)("details", { children: [
						/* @__PURE__ */ (0, U.jsxs)("summary", { children: [
							"Guarantors (",
							d.length,
							")"
						] }),
						!d.length && /* @__PURE__ */ (0, U.jsx)("p", { children: "Business-only fallback; the backend uses full business EBITDA when guarantors are empty." }),
						g.map((e, t) => /* @__PURE__ */ (0, U.jsxs)("fieldset", { children: [
							/* @__PURE__ */ (0, U.jsxs)("legend", { children: ["Guarantor ", t + 1] }),
							v(e),
							/* @__PURE__ */ (0, U.jsxs)("button", {
								type: "button",
								onClick: () => s.setValues((e) => ({
									...e,
									guarantors: d.filter((e, n) => n !== t)
								})),
								children: ["Remove guarantor ", t + 1]
							})
						] }, t)),
						/* @__PURE__ */ (0, U.jsx)("button", {
							type: "button",
							onClick: () => s.setValues((e) => ({
								...e,
								guarantors: [...d, Object.fromEntries(Object.keys(Ja.guarantors[0]).map((e) => [e, ""]))]
							})),
							children: "Add guarantor"
						})
					] }),
					/* @__PURE__ */ (0, U.jsx)("p", {
						className: "fine",
						children: "Drafts remain in page memory. Evaluation replaces the unsaved selection; saving a case is a separate reviewed action."
					}),
					/* @__PURE__ */ (0, U.jsx)("button", {
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
// src/domainContracts.ts
function fo(e, t) {
	if (!e) throw Error(`The ${t} response is incomplete or unsupported. It was not used.`);
}
function po(e, t) {
	return fo(e && typeof e == "object" && !Array.isArray(e), t), e;
}
function Z(e, t, n) {
	fo(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), n);
}
var mo = (e) => typeof e == "string" && e.length > 0 && e.length <= 2e4, ho = (e) => typeof e == "string" && M(e), go = (e) => typeof e == "boolean" || mo(e), _o = (e) => typeof e == "string" && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e;
function vo(e) {
	let t = po(e, "consumer");
	Z(t, [
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
	].includes(String(t.outcome)) && ho(t.score) && N(t.score, "0") >= 0 && N(t.score, "1") <= 0 && mo(t.policy_version) && mo(t.disclaimer), "consumer");
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
		Z(t, [
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
		], "consumer factor"), fo(typeof t.name == "string" && n.includes(t.name) && !r.has(t.name) && go(t.value) && (t.raw_value === null || go(t.raw_value)) && ho(t.weight) && (t.threshold === null || go(t.threshold)) && (t.passed === null || typeof t.passed == "boolean") && mo(t.source) && [
			null,
			">=",
			">",
			"<",
			"=="
		].includes(t.comparison_operator) && (t.decline_threshold === null || ho(t.decline_threshold)) && (t.decline_triggered === null || typeof t.decline_triggered == "boolean"), "consumer factor"), (t.name === "back_end_dti" || t.name === "back_end_dti_review") && fo(ho(t.raw_value) && ho(t.value) && ho(t.threshold), "consumer DTI"), t.name === "atr_documentation" && fo(typeof t.value == "boolean" && typeof t.raw_value == "boolean" && typeof t.threshold == "boolean", "consumer documentation"), r.add(t.name);
	}
	fo(Array.isArray(t.reasons) && t.reasons.length <= 20, "consumer reasons");
	for (let e of t.reasons) {
		let t = po(e, "consumer reason");
		Z(t, [
			"code",
			"factor",
			"message",
			"value"
		], "consumer reason"), fo(mo(t.code) && typeof t.factor == "string" && r.has(t.factor) && mo(t.message) && go(t.value), "consumer reason");
	}
	return t;
}
function yo(e) {
	let t = po(e, "SBA");
	Z(t, [
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
	], "SBA"), fo(t.schema_version === "sba-screen-result-v2" && mo(t.borrower) && _o(t.assessment_as_of) && ["8", "8.1"].includes(String(t.sop_version)) && typeof t.size_eligible == "boolean" && mo(t.size_reason) && mo(t.policy_version) && ho(t.global_dscr) && ho(t.configured_global_dscr_floor) && typeof t.coverage_pass == "boolean" && ["review_required", "screen_failed"].includes(String(t.outcome)) && t.eligibility_status === "incomplete" && mo(t.disclaimer), "SBA");
	let n = po(t.size_evidence, "SBA evidence");
	Z(n, [
		"basis",
		"period_start",
		"period_end",
		"affiliates",
		"source_reference"
	], "SBA evidence"), fo([
		"receipts_three_completed_fiscal_year_average",
		"receipts_five_completed_fiscal_year_average",
		"employees_24_month_pay_period_average_ceiling"
	].includes(String(n.basis)) && _o(n.period_start) && _o(n.period_end) && ["included", "none"].includes(String(n.affiliates)) && mo(n.source_reference), "SBA evidence");
	let r = po(t.size_standard_source, "SBA source");
	Z(r, [
		"effective_date",
		"verified_through",
		"url",
		"sha256",
		"row",
		"synthetic_test_only"
	], "SBA source"), fo(_o(r.effective_date) && (r.verified_through === null || _o(r.verified_through)) && (r.url === null || mo(r.url)) && (r.sha256 === null || typeof r.sha256 == "string" && /^[a-f0-9]{64}$/.test(r.sha256)) && (r.row === null || typeof r.row == "number" && Number.isSafeInteger(r.row) && r.row >= 1) && typeof r.synthetic_test_only == "boolean", "SBA source");
	let i = po(t.credit_elsewhere, "SBA credit elsewhere");
	Z(i, [
		"applied",
		"passes",
		"reason",
		"excess_liquid_resources",
		"resource_indicator_below_requested"
	], "SBA credit elsewhere"), fo(typeof i.applied == "boolean" && i.passes === null && mo(i.reason) && (i.excess_liquid_resources === null || ho(i.excess_liquid_resources)) && (i.resource_indicator_below_requested === null || typeof i.resource_indicator_below_requested == "boolean"), "SBA credit elsewhere");
	let a = [
		"lender_credit_elsewhere_determination",
		"industry_selection_and_affiliation_review",
		"alternative_size_standards_and_program_eligibility",
		"approved_lender_credit_policy"
	];
	return fo(Array.isArray(t.unresolved_requirements) && t.unresolved_requirements.length > 0 && t.unresolved_requirements.every((e) => typeof e == "string" && a.includes(e)) && new Set(t.unresolved_requirements).size === t.unresolved_requirements.length, "SBA unresolved requirements"), t;
}
// src/DomainWorkflows.tsx
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
}, So = {
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
delete So.annual_receipts_millions;
var Co = (e, t, n, r = {}) => ({
	pointer: e,
	label: t,
	kind: n,
	...r
}), wo = {
	back_end_dti: "Total DTI · approval rule",
	back_end_dti_review: "Total DTI · review rule",
	atr_documentation: "Ability-to-repay documentation",
	synthetic_credit_score: "Synthetic credit score"
};
function To(e, t) {
	let [n, r] = (0, A.useState)(null), [i, a] = (0, A.useState)(!1), [o, s] = (0, A.useState)(""), c = (0, A.useRef)(null), l = JSON.stringify(e.values), u = (0, A.useRef)(l);
	u.current = l, (0, A.useEffect)(() => {
		c.current?.abort(), r(null), a(!1), s("");
	}, [l]), (0, A.useEffect)(() => () => c.current?.abort(), []);
	async function d(n, o) {
		if (i) return;
		let d = e.prepare(o);
		if (!d) return;
		if (re()) {
			s("This testing host does not expose Consumer or SBA routes. Use the standalone workspace connected to the existing API.");
			return;
		}
		let f = new AbortController();
		c.current?.abort(), c.current = f, a(!0), s(""), r(null);
		try {
			let i = await Dt(n, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(d),
				signal: f.signal
			}), a = await Tr(i, "Domain evaluation");
			if (f.signal.aborted || u.current !== l) return;
			if (!i.ok) {
				let t = a && typeof a == "object" && "detail" in a ? a.detail : null;
				throw e.reject(kt(a, t)), Error(i.status === 422 ? "The server rejected these inputs. Review the highlighted fields; your draft is preserved." : `The evaluation could not be completed (${i.status}). Your draft is preserved.`);
			}
			let o = t(a);
			!f.signal.aborted && u.current === l && r({
				context: l,
				value: o
			});
		} catch (e) {
			f.signal.aborted || s(e instanceof Error ? e.message : "The evaluation could not be completed. Your draft is preserved.");
		} finally {
			c.current === f && a(!1);
		}
	}
	return {
		result: n?.context === l ? n.value : null,
		busy: i,
		error: o,
		send: d
	};
}
function Eo({ form: e, pointer: t, label: n, helper: r, options: i, onChange: a }) {
	let o = `choice${t.replace(/\//g, "-")}`, s = e.errors.find((e) => e.pointer === t);
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "formField",
		children: [
			/* @__PURE__ */ (0, U.jsx)("label", {
				htmlFor: o,
				children: n
			}),
			/* @__PURE__ */ (0, U.jsx)("select", {
				id: o,
				"data-pointer": t,
				value: String(Br(e.values, t)),
				"aria-invalid": s ? "true" : void 0,
				"aria-describedby": `${o}-help`,
				onChange: (r) => a ? a(r.target.value) : e.change(Co(t, n, "text"), r.target.value),
				children: i.map((e) => /* @__PURE__ */ (0, U.jsx)("option", {
					value: e.value,
					children: e.label
				}, e.value))
			}),
			/* @__PURE__ */ (0, U.jsx)("small", {
				id: `${o}-help`,
				children: r
			}),
			s && /* @__PURE__ */ (0, U.jsx)("span", {
				className: "fieldError",
				children: s.message
			})
		]
	});
}
function Do() {
	return re() ? /* @__PURE__ */ (0, U.jsx)("p", {
		className: "analysisNotice",
		children: "The private Streamlit host is synthetic data only. Its existing bridge supports commercial workflows; this screen requires the standalone API connection."
	}) : null;
}
function Oo() {
	let e = Kr({
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
	}), t = To(e, vo), [n, r] = (0, A.useState)(""), [i, a] = (0, A.useState)(null), o = (0, A.useRef)(null);
	(0, A.useEffect)(() => a(null), [t.result]);
	let s = [
		Co("/applicant_name", "Applicant name", "text"),
		Co("/geography", "Consumer geography", "text", { placeholder: "60601" }),
		Co("/gross_monthly_income", "Gross monthly income", "money", { min: "0" }),
		Co("/proposed_housing_pi", "Monthly housing principal and interest", "money", { min: "0" }),
		Co("/proposed_housing_tax_ins", "Monthly housing tax and insurance", "money", { min: "0" }),
		Co("/other_monthly_debt", "Other monthly debt", "money", { min: "0" }),
		Co("/synthetic_credit_score", "Synthetic credit score", "integer", {
			min: "300",
			max: "850",
			optional: !0,
			placeholder: "720",
			helper: "Integer 300–850 · optional; synthetic input, no bureau connection"
		})
	], c = t.result?.factors.find((e) => e.name === "back_end_dti");
	function l(t, n) {
		o.current = n, a({
			title: t ? "Housing DTI" : "Total DTI",
			factor: t ? void 0 : c,
			formula: t ? "Housing DTI = (monthly housing principal and interest + monthly housing tax and insurance) / gross monthly income" : "Total DTI = (monthly housing principal and interest + monthly housing tax and insurance + other monthly debt) / gross monthly income",
			supplied: s.filter((e) => e.kind === "money").map((t) => ({
				label: t.label,
				value: String(Br(e.values, t.pointer))
			})),
			note: t ? "The existing consumer decision endpoint does not return housing DTI or a housing factor. No housing ratio or sum is calculated in the browser." : `Server total DTI: ${c && typeof c.value == "string" ? xe(c.value, 4) : "Unavailable"}. The endpoint returns the policy factor, but no additive trace or housing ratio. Inputs shown above are supplied facts; the browser does not reconstruct financial results.`
		});
	}
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "domainWorkspace",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("header", {
				className: "caseHeader",
				children: [/* @__PURE__ */ (0, U.jsx)("h1", { children: "Consumer DTI review" }), /* @__PURE__ */ (0, U.jsx)("p", { children: "Review supplied income, debt and documentation under the server's illustrative policy." })]
			}),
			/* @__PURE__ */ (0, U.jsx)(Do, {}),
			/* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, U.jsxs)("label", {
					className: "sampleSelector",
					children: ["Load sample case", /* @__PURE__ */ (0, U.jsxs)("select", {
						"aria-label": "Load sample case",
						value: n,
						onChange: (t) => {
							r(t.target.value), t.target.value && e.replace(bo);
						},
						children: [/* @__PURE__ */ (0, U.jsx)("option", {
							value: "",
							children: "Choose a synthetic preset"
						}), /* @__PURE__ */ (0, U.jsx)("option", {
							value: "consumer",
							children: "Consumer · complete DTI and documentation"
						})]
					})]
				}), /* @__PURE__ */ (0, U.jsxs)("form", {
					ref: e.root,
					className: "guidedForm",
					noValidate: !0,
					onSubmit: (e) => {
						e.preventDefault(), t.send("/consumer/decision", s);
					},
					children: [
						/* @__PURE__ */ (0, U.jsx)(qr, {
							form: e,
							specs: s
						}),
						/* @__PURE__ */ (0, U.jsx)("div", {
							className: "formGrid",
							children: s.map((t) => /* @__PURE__ */ (0, U.jsx)(Xr, {
								form: e,
								spec: t
							}, t.pointer))
						}),
						/* @__PURE__ */ (0, U.jsxs)("fieldset", { children: [
							/* @__PURE__ */ (0, U.jsx)("legend", { children: "Ability-to-repay documentation" }),
							[
								"income",
								"assets",
								"debts"
							].map((t) => /* @__PURE__ */ (0, U.jsxs)("label", {
								className: "checkboxField",
								children: [
									/* @__PURE__ */ (0, U.jsx)("input", {
										type: "checkbox",
										"data-pointer": `/atr_documentation/${t}`,
										checked: Br(e.values, `/atr_documentation/${t}`) === !0,
										onChange: (n) => e.setValues((e) => Vr(e, `/atr_documentation/${t}`, n.target.checked))
									}),
									"Verified ",
									t,
									" evidence"
								]
							}, t)),
							/* @__PURE__ */ (0, U.jsx)("p", {
								className: "fine",
								children: "These are analyst attestations. The application does not independently verify documents."
							})
						] }),
						t.error && /* @__PURE__ */ (0, U.jsx)("p", {
							role: "alert",
							children: t.error
						}),
						/* @__PURE__ */ (0, U.jsx)("button", {
							className: "primary",
							type: "submit",
							"aria-busy": t.busy,
							children: t.busy ? "Evaluating consumer…" : "Evaluate consumer"
						})
					]
				})]
			}),
			t.result && /* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel",
				role: "region",
				"aria-label": "Consumer result",
				children: [
					/* @__PURE__ */ (0, U.jsxs)("h2", { children: ["Consumer result · ", t.result.outcome.toUpperCase()] }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Policy ",
						t.result.policy_version,
						" · weighted-rule score",
						" ",
						t.result.score,
						". The score is not a probability of default."
					] }),
					/* @__PURE__ */ (0, U.jsxs)("div", {
						className: "domainMetrics",
						children: [/* @__PURE__ */ (0, U.jsxs)("article", { children: [
							/* @__PURE__ */ (0, U.jsx)("h3", { children: "Total DTI" }),
							/* @__PURE__ */ (0, U.jsx)("strong", { children: c && typeof c.value == "string" ? xe(c.value, 4) : "Unavailable" }),
							/* @__PURE__ */ (0, U.jsx)("button", {
								type: "button",
								onClick: (e) => l(!1, e.currentTarget),
								children: "Inspect Total DTI"
							})
						] }), /* @__PURE__ */ (0, U.jsxs)("article", { children: [
							/* @__PURE__ */ (0, U.jsx)("h3", { children: "Housing DTI" }),
							/* @__PURE__ */ (0, U.jsx)("p", { children: "Unavailable from this endpoint" }),
							/* @__PURE__ */ (0, U.jsx)("button", {
								type: "button",
								onClick: (e) => l(!0, e.currentTarget),
								children: "Inspect Housing DTI"
							})
						] })]
					}),
					/* @__PURE__ */ (0, U.jsx)("ul", {
						className: "factorList",
						children: t.result.factors.map((e) => /* @__PURE__ */ (0, U.jsx)("li", { children: /* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("strong", { children: wo[e.name] ?? e.name.replace(/_/g, " ") }), /* @__PURE__ */ (0, U.jsxs)("span", { children: [
							e.passed === null ? "Unavailable" : e.passed ? "Pass" : "Fail",
							" ",
							"·",
							" ",
							typeof e.value == "boolean" ? String(e.value) : e.name.includes("dti") ? xe(e.value, 4) : e.value
						] })] }) }, e.name))
					}),
					t.result.reasons.map((e) => /* @__PURE__ */ (0, U.jsx)("p", { children: e.message }, e.code)),
					/* @__PURE__ */ (0, U.jsxs)("p", {
						className: "fine",
						children: [t.result.disclaimer, " DTI boundaries are illustrative policy settings, not a claim about legal lending ceilings."]
					})
				]
			}),
			i && /* @__PURE__ */ (0, U.jsx)(wa, {
				data: i,
				onClose: () => {
					a(null), o.current?.focus();
				}
			})
		]
	});
}
var ko = {
	lender_credit_elsewhere_determination: "Lender credit elsewhere determination",
	industry_selection_and_affiliation_review: "Industry selection and affiliation review",
	alternative_size_standards_and_program_eligibility: "Alternative size standards and program eligibility",
	approved_lender_credit_policy: "Approved lender credit policy"
};
function Ao() {
	let e = Kr({
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
	}), t = To(e, yo), [n, r] = (0, A.useState)(""), i = String(Br(e.values, "/size_evidence/basis")).startsWith("employees"), a = [
		Co("/borrower_name", "SBA borrower name", "text"),
		Co("/assessment_as_of", "SBA assessment as of", "date", { helper: "Pinned source verified through 2026-10-15; later dates are rejected" }),
		Co("/naics", "NAICS code", "text", {
			placeholder: "541611",
			helper: "Six-digit NAICS · ambiguous or unsupported rows require manual review"
		}),
		Co("/requested_loan", "SBA requested loan", "money", { min: "0" }),
		Co("/global_dscr", "Supplied global DSCR", "money", {
			helper: "Exact coverage ratio · supplied evidence; not recomputed by the screen",
			placeholder: "1.31"
		}),
		i ? Co("/employees", "Employee average ceiling", "integer", {
			min: "0",
			placeholder: "100",
			helper: "Integer ceiling of the 24-month pay-period average · no rounding down"
		}) : Co("/annual_receipts_millions", "Average annual receipts", "money", {
			min: "0",
			placeholder: "24.5",
			helper: "USD millions · completed 3- or 5-fiscal-year average, including affiliates"
		}),
		Co("/size_evidence/period_start", "Measurement period start", "date"),
		Co("/size_evidence/period_end", "Measurement period end", "date"),
		Co("/size_evidence/source_reference", "Measurement source reference", "text", {
			placeholder: "Consolidated tax-return review",
			helper: "Required evidence reference · at most 500 characters"
		}),
		...[
			"owner_liquid_resources",
			"retirement_allowance",
			"college_allowance",
			"medical_allowance"
		].map((e) => Co(`/${e}`, e.replace(/_/g, " "), "money", {
			min: "0",
			helper: "USD decimal · supplied evidence only; no legal entitlement is inferred"
		}))
	];
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "domainWorkspace",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("header", {
				className: "caseHeader",
				children: [/* @__PURE__ */ (0, U.jsx)("h1", { children: "SBA eligibility screen" }), /* @__PURE__ */ (0, U.jsx)("p", { children: "Selected size and coverage screens with explicit unresolved lender requirements." })]
			}),
			/* @__PURE__ */ (0, U.jsx)(Do, {}),
			/* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel sourceNotice",
				children: [
					/* @__PURE__ */ (0, U.jsx)("h2", { children: "Pinned workbook" }),
					/* @__PURE__ */ (0, U.jsx)("p", { children: "Effective March 17, 2023 · verified through October 15, 2026 · 850 supported unambiguous rows · 128 refused rows with footnotes, industry exceptions, or unsupported measures." }),
					/* @__PURE__ */ (0, U.jsx)("p", {
						className: "fine",
						children: "A passing size screen does not establish complete SBA eligibility. Later source dates and unsupported rows require a separately reviewed source update."
					})
				]
			}),
			/* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, U.jsxs)("label", {
					className: "sampleSelector",
					children: ["Load sample case", /* @__PURE__ */ (0, U.jsxs)("select", {
						"aria-label": "Load sample case",
						value: n,
						onChange: (t) => {
							let n = t.target.value;
							r(n), n && e.replace(n === "sba-employees" ? So : xo);
						},
						children: [
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "",
								children: "Choose a synthetic preset"
							}),
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "sba-receipts",
								children: "SBA · three-year receipts evidence"
							}),
							/* @__PURE__ */ (0, U.jsx)("option", {
								value: "sba-employees",
								children: "SBA · 24-month employee evidence"
							})
						]
					})]
				}), /* @__PURE__ */ (0, U.jsxs)("form", {
					ref: e.root,
					className: "guidedForm",
					noValidate: !0,
					onSubmit: (e) => {
						e.preventDefault(), t.send("/sba/evaluate", a);
					},
					children: [
						/* @__PURE__ */ (0, U.jsx)(qr, {
							form: e,
							specs: a
						}),
						/* @__PURE__ */ (0, U.jsxs)("div", {
							className: "formGrid",
							children: [
								/* @__PURE__ */ (0, U.jsx)(Eo, {
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
											let n = Vr(e, "/size_evidence/basis", t);
											return delete n.employees, delete n.annual_receipts_millions, n[t.startsWith("employees") ? "employees" : "annual_receipts_millions"] = "", n;
										});
									}
								}),
								/* @__PURE__ */ (0, U.jsx)(Eo, {
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
								/* @__PURE__ */ (0, U.jsx)(Eo, {
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
								/* @__PURE__ */ (0, U.jsx)(Eo, {
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
								a.map((t) => /* @__PURE__ */ (0, U.jsx)(Xr, {
									form: e,
									spec: t
								}, t.pointer))
							]
						}),
						/* @__PURE__ */ (0, U.jsx)("p", { children: "Owner-resource arithmetic never establishes credit elsewhere. Allowances require documented lender review." }),
						t.error && /* @__PURE__ */ (0, U.jsx)("p", {
							role: "alert",
							children: t.error
						}),
						/* @__PURE__ */ (0, U.jsx)("button", {
							className: "primary",
							type: "submit",
							"aria-busy": t.busy,
							children: t.busy ? "Evaluating SBA screen…" : "Evaluate SBA screen"
						})
					]
				})]
			}),
			t.result && /* @__PURE__ */ (0, U.jsxs)("section", {
				className: "panel incompleteEligibility",
				role: "region",
				"aria-label": "SBA result",
				children: [
					/* @__PURE__ */ (0, U.jsx)("h2", { children: "Incomplete Eligibility — Manual Underwriter Review Required" }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Server outcome:",
						" ",
						/* @__PURE__ */ (0, U.jsx)("strong", { children: t.result.outcome === "review_required" ? "Review required" : "Screen failed" }),
						" ",
						"· eligibility_status: incomplete"
					] }),
					/* @__PURE__ */ (0, U.jsxs)("ul", { children: [/* @__PURE__ */ (0, U.jsxs)("li", { children: [
						"Size screen:",
						" ",
						/* @__PURE__ */ (0, U.jsx)("strong", { children: t.result.size_eligible ? "Pass" : "Fail" }),
						" ",
						"· ",
						t.result.size_reason
					] }), /* @__PURE__ */ (0, U.jsxs)("li", { children: [
						"Coverage screen:",
						" ",
						/* @__PURE__ */ (0, U.jsx)("strong", { children: t.result.coverage_pass ? "Pass" : "Fail" }),
						" ",
						"· supplied DSCR ",
						t.result.global_dscr,
						" · configured floor",
						" ",
						t.result.configured_global_dscr_floor
					] })] }),
					/* @__PURE__ */ (0, U.jsx)("h3", { children: "Unresolved eligibility requirements" }),
					/* @__PURE__ */ (0, U.jsx)("ul", { children: t.result.unresolved_requirements.map((e) => /* @__PURE__ */ (0, U.jsx)("li", { children: ko[e] }, e)) }),
					/* @__PURE__ */ (0, U.jsxs)("p", { children: [
						"Owner-resource arithmetic never establishes credit elsewhere.",
						" ",
						t.result.credit_elsewhere.reason
					] }),
					/* @__PURE__ */ (0, U.jsxs)("dl", {
						className: "reviewFacts",
						children: [
							/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Policy" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: t.result.policy_version })] }),
							/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Source workbook row" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: t.result.size_standard_source.row ?? "Unavailable" })] }),
							/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Source effective / verified through" }), /* @__PURE__ */ (0, U.jsxs)("dd", { children: [
								t.result.size_standard_source.effective_date,
								" /",
								" ",
								t.result.size_standard_source.verified_through ?? "Unavailable"
							] })] }),
							/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("dt", { children: "Recorded workbook SHA-256" }), /* @__PURE__ */ (0, U.jsx)("dd", { children: t.result.size_standard_source.sha256 ?? "Unavailable" })] })
						]
					}),
					/* @__PURE__ */ (0, U.jsx)("p", {
						className: "fine",
						children: t.result.disclaimer
					})
				]
			})
		]
	});
}
// src/views/AnalysisPanels.tsx
function jo() {
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "modelScope",
		"aria-label": "Model scope and policy limitations",
		children: [/* @__PURE__ */ (0, U.jsxs)("p", { children: [
			/* @__PURE__ */ (0, U.jsx)("strong", { children: "Capacity is policy arithmetic, not a credit approval." }),
			" ",
			"Default rules are illustrative and require institutional validation. The weighted-rule score is not a probability of default."
		] }), /* @__PURE__ */ (0, U.jsxs)("details", { children: [
			/* @__PURE__ */ (0, U.jsx)("summary", { children: "Methodology scope" }),
			/* @__PURE__ */ (0, U.jsx)("p", { children: "FCCR and UCA use simplified definitions. LTV, debt yield, IRR, and NPV are not implemented." }),
			/* @__PURE__ */ (0, U.jsx)("p", { children: "The assessment's displayed monthly payment is an indicative rounded amount. Coverage annual proposed service uses 12 unrounded monthly payments. The analysis service's proposed-loan schedule rounds principal, interest and payments to cents, so first-year scheduled payments can differ from coverage service." })
		] })]
	});
}
function Mo({ kind: e }) {
	let { state: t, retry: n } = Ui(), [r, i] = (0, A.useState)(!1), [a, o] = (0, A.useState)(!0), s = e === "schedule" ? "Cent-rounded proposed-loan schedule" : e === "grid" ? "Coverage grid" : "Policy breakevens", c = t.status === "ready" ? t.analysis : null;
	return /* @__PURE__ */ (0, U.jsxs)("details", {
		className: "panel analysisPanel",
		onToggle: (e) => i(e.currentTarget.open),
		children: [/* @__PURE__ */ (0, U.jsx)("summary", { children: s }), r && /* @__PURE__ */ (0, U.jsx)(U.Fragment, { children: c ? e === "schedule" ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsxs)("p", { children: [
			"Server-generated cents ·",
			" ",
			c.amortization.status === "available" ? `${c.amortization.payment_count} payments` : c.amortization.explanation
		] }), c.amortization.status === "available" && /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
			/* @__PURE__ */ (0, U.jsxs)("label", {
				className: "sampleSelector",
				children: ["Schedule granularity", /* @__PURE__ */ (0, U.jsxs)("select", {
					value: a ? "monthly" : "annual",
					onChange: (e) => o(e.target.value === "monthly"),
					children: [/* @__PURE__ */ (0, U.jsx)("option", {
						value: "monthly",
						children: "Monthly · first 360 months"
					}), /* @__PURE__ */ (0, U.jsx)("option", {
						value: "annual",
						children: "Annual · full loan term"
					})]
				})]
			}),
			/* @__PURE__ */ (0, U.jsx)("div", {
				className: "tableScroll scheduleScroll",
				tabIndex: 0,
				role: "region",
				"aria-label": "Scrollable loan schedule",
				children: /* @__PURE__ */ (0, U.jsxs)("table", { children: [
					/* @__PURE__ */ (0, U.jsx)("caption", { children: "Server-calculated loan schedule" }),
					/* @__PURE__ */ (0, U.jsx)("thead", { children: /* @__PURE__ */ (0, U.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, U.jsx)("th", { children: a ? "Month" : "Loan year" }),
						/* @__PURE__ */ (0, U.jsx)("th", {
							className: "num",
							children: "Payments · USD"
						}),
						/* @__PURE__ */ (0, U.jsx)("th", {
							className: "num",
							children: "Interest · USD"
						}),
						/* @__PURE__ */ (0, U.jsx)("th", {
							className: "num",
							children: "Principal · USD"
						}),
						/* @__PURE__ */ (0, U.jsx)("th", {
							className: "num",
							children: "Ending balance · USD"
						})
					] }) }),
					/* @__PURE__ */ (0, U.jsx)("tbody", { children: a ? c.amortization.monthly_rows.map((e) => /* @__PURE__ */ (0, U.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, U.jsx)("th", {
							scope: "row",
							children: e.month
						}),
						/* @__PURE__ */ (0, U.jsx)("td", {
							className: "num",
							children: P(e.payment, 2)
						}),
						/* @__PURE__ */ (0, U.jsx)("td", {
							className: "num",
							children: P(e.interest, 2)
						}),
						/* @__PURE__ */ (0, U.jsx)("td", {
							className: "num",
							children: P(e.principal, 2)
						}),
						/* @__PURE__ */ (0, U.jsx)("td", {
							className: "num",
							children: P(e.ending_balance, 2)
						})
					] }, e.month)) : c.amortization.annual_rows.map((e) => /* @__PURE__ */ (0, U.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, U.jsxs)("th", {
							scope: "row",
							children: [
								e.loan_year,
								" · ",
								e.months,
								" months"
							]
						}),
						/* @__PURE__ */ (0, U.jsx)("td", {
							className: "num",
							children: P(e.payments, 2)
						}),
						/* @__PURE__ */ (0, U.jsx)("td", {
							className: "num",
							children: P(e.interest, 2)
						}),
						/* @__PURE__ */ (0, U.jsx)("td", {
							className: "num",
							children: P(e.principal, 2)
						}),
						/* @__PURE__ */ (0, U.jsx)("td", {
							className: "num",
							children: P(e.ending_balance, 2)
						})
					] }, e.loan_year)) })
				] })
			}),
			a && c.amortization.monthly_rows_truncated && /* @__PURE__ */ (0, U.jsx)("p", { children: "Monthly detail ends after 360 months. Annual rows cover the full term." }),
			/* @__PURE__ */ (0, U.jsxs)("p", { children: [
				"Final payment ",
				c.amortization.final_payment,
				" USD · final adjustment",
				" ",
				c.amortization.final_payment_adjustment,
				" USD",
				c.amortization.early_payoff ? " · Early payoff reported by server" : ""
			] }),
			c.amortization.reconciliation && /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "reconciliationNote",
				children: [/* @__PURE__ */ (0, U.jsx)("p", { children: c.amortization.reconciliation.explanation }), /* @__PURE__ */ (0, U.jsxs)("p", { children: [
					"Coverage annual service:",
					" ",
					c.amortization.reconciliation.coverage_annual_payment,
					" ",
					"USD",
					/* @__PURE__ */ (0, U.jsx)("br", {}),
					"First loan-year payments:",
					" ",
					c.amortization.reconciliation.first_loan_year_payments,
					" ",
					"USD",
					/* @__PURE__ */ (0, U.jsx)("br", {}),
					"Server reconciliation difference:",
					" ",
					c.amortization.reconciliation.first_loan_year_difference,
					" ",
					"USD"
				] })]
			})
		] })] }) : e === "grid" ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
			/* @__PURE__ */ (0, U.jsx)("p", { children: "Server outcomes under the retained policy · projected latest period · observed history held fixed." }),
			c.sensitivity.status === "not_applicable" ? /* @__PURE__ */ (0, U.jsxs)("p", { children: ["Unavailable · ", c.sensitivity.explanation] }) : /* @__PURE__ */ (0, U.jsx)("div", {
				className: "tableScroll",
				tabIndex: 0,
				role: "region",
				"aria-label": "Scrollable coverage grid",
				children: /* @__PURE__ */ (0, U.jsxs)("table", { children: [
					/* @__PURE__ */ (0, U.jsx)("caption", { children: "Revenue and rate coverage grid" }),
					/* @__PURE__ */ (0, U.jsx)("thead", { children: /* @__PURE__ */ (0, U.jsxs)("tr", { children: [/* @__PURE__ */ (0, U.jsx)("th", { children: "Revenue change" }), c.sensitivity.rate_changes_bps.map((e) => /* @__PURE__ */ (0, U.jsxs)("th", {
						className: "num",
						children: [
							"+",
							e,
							" bps"
						]
					}, e))] }) }),
					/* @__PURE__ */ (0, U.jsx)("tbody", { children: c.sensitivity.revenue_changes.map((e) => /* @__PURE__ */ (0, U.jsxs)("tr", { children: [/* @__PURE__ */ (0, U.jsx)("th", {
						scope: "row",
						children: xe(e, 0)
					}), c.sensitivity.rate_changes_bps.map((t) => {
						let n = c.sensitivity.cells.find((n) => n.revenue_change === e && n.proposed_rate_change_bps === t);
						return /* @__PURE__ */ (0, U.jsx)("td", {
							className: "gridCell",
							children: !n || n.status === "not_applicable" ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)("strong", {
								className: "statusBadge",
								children: "Unavailable"
							}), /* @__PURE__ */ (0, U.jsx)("p", { children: n?.explanation ?? "No cell returned" })] }) : /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
								/* @__PURE__ */ (0, U.jsxs)("strong", {
									className: "statusBadge",
									"data-outcome": n.outcome,
									children: [
										n.outcome === "approve" ? "Pass" : n.outcome === "decline" ? "Fail" : "Review",
										" ",
										"· ",
										n.outcome?.toUpperCase()
									]
								}),
								/* @__PURE__ */ (0, U.jsxs)("span", { children: ["DSCR ", $n(n.dscr)] }),
								/* @__PURE__ */ (0, U.jsxs)("span", { children: ["FCCR ", $n(n.fccr)] }),
								/* @__PURE__ */ (0, U.jsxs)("span", { children: ["Global ", $n(n.global_dscr)] })
							] })
						}, t);
					})] }, e)) })
				] })
			}),
			/* @__PURE__ */ (0, U.jsx)("ul", { children: c.sensitivity.held_fixed_assumptions.map((e, t) => /* @__PURE__ */ (0, U.jsx)("li", { children: e }, t)) })
		] }) : /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)("p", { children: "Each threshold and cushion is calculated by the server. Negative cushions indicate an existing breach." }), /* @__PURE__ */ (0, U.jsx)("div", {
			className: "tableScroll",
			children: /* @__PURE__ */ (0, U.jsxs)("table", { children: [
				/* @__PURE__ */ (0, U.jsx)("caption", { children: "Server-calculated policy breakevens" }),
				/* @__PURE__ */ (0, U.jsx)("thead", { children: /* @__PURE__ */ (0, U.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, U.jsx)("th", { children: "Constraint" }),
					/* @__PURE__ */ (0, U.jsx)("th", { children: "Threshold type" }),
					/* @__PURE__ */ (0, U.jsx)("th", {
						className: "num",
						children: "Threshold"
					}),
					/* @__PURE__ */ (0, U.jsx)("th", {
						className: "num",
						children: "EBITDA breakeven"
					}),
					/* @__PURE__ */ (0, U.jsx)("th", {
						className: "num",
						children: "Revenue cushion"
					})
				] }) }),
				/* @__PURE__ */ (0, U.jsx)("tbody", { children: c.breakevens.rows.map((e) => /* @__PURE__ */ (0, U.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, U.jsx)("th", {
						scope: "row",
						children: e.constraint.toUpperCase()
					}),
					/* @__PURE__ */ (0, U.jsx)("td", { children: e.threshold_kind.replace(/_/g, " ") }),
					/* @__PURE__ */ (0, U.jsx)("td", {
						className: "num",
						children: e.threshold
					}),
					/* @__PURE__ */ (0, U.jsx)("td", {
						className: "num",
						children: $n(e.ebitda_breakeven)
					}),
					/* @__PURE__ */ (0, U.jsx)("td", {
						className: "num",
						children: e.revenue_cushion.status === "available" && e.revenue_cushion.raw_value !== null ? xe(e.revenue_cushion.raw_value, 2) : "Unavailable"
					})
				] }, `${e.constraint}:${e.threshold_kind}`)) })
			] })
		})] }) : /* @__PURE__ */ (0, U.jsxs)("div", {
			role: "status",
			children: [/* @__PURE__ */ (0, U.jsx)("p", { children: t.status === "error" ? t.message : t.status === "none" ? "A current dated assessment is required." : "Preparing server analysis…" }), t.status === "error" && /* @__PURE__ */ (0, U.jsx)("button", {
				type: "button",
				onClick: n,
				children: "Retry analysis"
			})]
		}) })]
	});
}
// src/RejectedInputFields.tsx
function No({ draft: e, errors: t, savedField: n, rationale: r, onEvaluate: i, onReviewSaved: a }) {
	let o = Kr({
		...Rr(e.payload),
		...n ? { rationale: r ?? "" } : {}
	}), [s, c] = (0, A.useState)(""), l = t.map((e) => ({
		...e,
		pointer: e.pointer.startsWith("/input/") ? e.pointer.slice(6) : e.pointer
	}));
	(0, A.useEffect)(() => {
		o.reject(l);
	}, [t]);
	let u = [.../* @__PURE__ */ new Set([
		...l.map((e) => e.pointer),
		...typeof Br(o.values, "/proposed_loan/term_months") == "string" ? ["/proposed_loan/term_months"] : [],
		...n ? [n, "/rationale"] : []
	])].flatMap((t) => {
		if (!t || zr(t).some((e) => [
			"__proto__",
			"constructor",
			"prototype"
		].includes(e))) return [];
		try {
			let n = Et(e.payload, e.mode, t);
			return n.path === t ? [{
				pointer: t,
				label: wt(t),
				kind: n.integer ? "integer" : n.unit === "%" ? "rate" : "money",
				min: n.min === void 0 ? void 0 : String(n.min),
				max: n.max === void 0 ? void 0 : String(n.max)
			}] : [];
		} catch {
			return /^\/(assessment_as_of|borrower_name|geography|rationale)$/.test(t) || /^\/(years\/(?:0|[1-9]\d*)|working_capital)\/period_(start|end)$/.test(t) ? [{
				pointer: t,
				label: wt(t),
				kind: /period_(start|end)$|assessment_as_of$/.test(t) ? "date" : "text"
			}] : [];
		}
	});
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "panel rejectedInputFields",
		"aria-label": "Correct rejected inputs",
		children: [
			/* @__PURE__ */ (0, U.jsx)("h2", { children: "Review rejected inputs" }),
			/* @__PURE__ */ (0, U.jsx)("p", { children: "Your complete draft is preserved. A saved edit requires review against the latest stored revision before a fresh operation can be sent." }),
			/* @__PURE__ */ (0, U.jsxs)("form", {
				ref: o.root,
				className: "guidedForm",
				noValidate: !0,
				onSubmit: (t) => {
					t.preventDefault();
					let r = o.prepare(u);
					if (r && u.length) {
						if (n && a) {
							let e = Br(r, n);
							if (typeof e != "string" && typeof e != "number") return;
							let i = t.currentTarget.querySelector("button[type=submit]");
							i && a(e, String(r.rationale), i).catch((e) => c(e instanceof Error ? e.message : "The latest revision could not be reviewed. Your correction is preserved."));
						} else {
							let t = e.edit ? {
								...e.edit,
								next: Br(r, e.edit.path)
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
					/* @__PURE__ */ (0, U.jsx)(qr, {
						form: o,
						specs: u
					}),
					/* @__PURE__ */ (0, U.jsx)("div", {
						className: "formGrid",
						children: u.map((e) => /* @__PURE__ */ (0, U.jsx)(Xr, {
							form: o,
							spec: e
						}, e.pointer))
					}),
					u.length ? /* @__PURE__ */ (0, U.jsx)("button", {
						type: "submit",
						className: "primary",
						children: n ? "Review corrected revision" : "Evaluate corrected draft"
					}) : /* @__PURE__ */ (0, U.jsx)("p", { children: "These errors require a corrected complete case file. The original rejection and field locations remain above." }),
					s && /* @__PURE__ */ (0, U.jsx)("p", {
						role: "alert",
						children: s
					})
				]
			})
		]
	});
}
// src/excel/workbook.worker.ts?worker&inline
var Po = "(function(){var e={},t=(function(t,n,r,i,a){var o=new Worker(e[n]||(e[n]=URL.createObjectURL(new Blob([t+`;addEventListener(\"error\",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})`],{type:`text/javascript`}))));return o.onmessage=function(e){var t=e.data,n=t.$e$;if(n){var r=Error(n[0]);r.code=n[1],r.stack=n[2],a(r,null)}else a(null,t)},o.postMessage(r,i),o}),n=Uint8Array,r=Uint16Array,i=Int32Array,a=new n([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),o=new n([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),s=new n([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),c=function(e,t){for(var n=new r(31),a=0;a<31;++a)n[a]=t+=1<<e[a-1];for(var o=new i(n[30]),a=1;a<30;++a)for(var s=n[a];s<n[a+1];++s)o[s]=s-n[a]<<5|a;return{b:n,r:o}},l=c(a,2),u=l.b,d=l.r;u[28]=258,d[258]=28;for(var f=c(o,0),p=f.b,m=f.r,h=new r(32768),g=0;g<32768;++g){var _=(g&43690)>>1|(g&21845)<<1;_=(_&52428)>>2|(_&13107)<<2,_=(_&61680)>>4|(_&3855)<<4,h[g]=((_&65280)>>8|(_&255)<<8)>>1}for(var v=(function(e,t,n){for(var i=e.length,a=0,o=new r(t);a<i;++a)e[a]&&++o[e[a]-1];var s=new r(t);for(a=1;a<t;++a)s[a]=s[a-1]+o[a-1]<<1;var c;if(n){c=new r(1<<t);var l=15-t;for(a=0;a<i;++a)if(e[a])for(var u=a<<4|e[a],d=t-e[a],f=s[e[a]-1]++<<d,p=f|(1<<d)-1;f<=p;++f)c[h[f]>>l]=u}else for(c=new r(i),a=0;a<i;++a)e[a]&&(c[a]=h[s[e[a]-1]++]>>15-e[a]);return c}),y=new n(288),g=0;g<144;++g)y[g]=8;for(var g=144;g<256;++g)y[g]=9;for(var g=256;g<280;++g)y[g]=7;for(var g=280;g<288;++g)y[g]=8;for(var b=new n(32),g=0;g<32;++g)b[g]=5;var x=/*#__PURE__*/ v(y,9,0),S=/*#__PURE__*/ v(y,9,1),C=/*#__PURE__*/ v(b,5,0),w=/*#__PURE__*/ v(b,5,1),ee=function(e){for(var t=e[0],n=1;n<e.length;++n)e[n]>t&&(t=e[n]);return t},T=function(e,t,n){var r=t/8|0;return(e[r]|e[r+1]<<8)>>(t&7)&n},E=function(e,t){var n=t/8|0;return(e[n]|e[n+1]<<8|e[n+2]<<16)>>(t&7)},D=function(e){return(e+7)/8|0},O=function(e,t,r){return(t==null||t<0)&&(t=0),(r==null||r>e.length)&&(r=e.length),new n(e.subarray(t,r))},k=[`unexpected EOF`,`invalid block type`,`invalid length/literal`,`invalid distance`,`stream finished`,`no stream handler`,,`no callback`,`invalid UTF-8 data`,`extra field too long`,`date not in range 1980-2099`,`filename too long`,`stream finishing`,`invalid zip data`],A=function(e,t,n){var r=Error(t||k[e]);if(r.code=e,Error.captureStackTrace&&Error.captureStackTrace(r,A),!n)throw r;return r},j=function(e,t,r,i){var c=e.length,l=i?i.length:0;if(!c||t.f&&!t.l)return r||new n(0);var d=!r,f=d||t.i!=2,m=t.i;d&&(r=new n(c*3));var h=function(e){var t=r.length;if(e>t){var i=new n(Math.max(t*2,e));i.set(r),r=i}},g=t.f||0,_=t.p||0,y=t.b||0,b=t.l,x=t.d,C=t.m,k=t.n,j=c*8;do{if(!b){g=T(e,_,1);var M=T(e,_+1,3);if(_+=3,!M){var N=D(_)+4,P=e[N-4]|e[N-3]<<8,F=N+P;if(F>c){m&&A(0);break}f&&h(y+P),r.set(e.subarray(N,F),y),t.b=y+=P,t.p=_=F*8,t.f=g;continue}if(M==1)b=S,x=w,C=9,k=5;else if(M==2){var I=T(e,_,31)+257,L=T(e,_+10,15)+4,R=I+T(e,_+5,31)+1;_+=14;for(var z=new n(R),B=new n(19),V=0;V<L;++V)B[s[V]]=T(e,_+V*3,7);_+=L*3;for(var H=ee(B),te=(1<<H)-1,U=v(B,H,1),V=0;V<R;){var W=U[T(e,_,te)];_+=W&15;var N=W>>4;if(N<16)z[V++]=N;else{var G=0,K=0;for(N==16?(K=3+T(e,_,3),_+=2,G=z[V-1]):N==17?(K=3+T(e,_,7),_+=3):N==18&&(K=11+T(e,_,127),_+=7);K--;)z[V++]=G}}var q=z.subarray(0,I),ne=z.subarray(I);C=ee(q),k=ee(ne),b=v(q,C,1),x=v(ne,k,1)}else A(1);if(_>j){m&&A(0);break}}f&&h(y+131072);for(var re=(1<<C)-1,ie=(1<<k)-1,J=_;;J=_){var G=b[E(e,_)&re],ae=G>>4;if(_+=G&15,_>j){m&&A(0);break}if(G||A(2),ae<256)r[y++]=ae;else if(ae==256){J=_,b=null;break}else{var oe=ae-254;if(ae>264){var V=ae-257,Y=a[V];oe=T(e,_,(1<<Y)-1)+u[V],_+=Y}var X=x[E(e,_)&ie],se=X>>4;X||A(3),_+=X&15;var ne=p[se];if(se>3){var Y=o[se];ne+=E(e,_)&(1<<Y)-1,_+=Y}if(_>j){m&&A(0);break}f&&h(y+131072);var Z=y+oe;if(y<ne){var ce=l-ne,le=Math.min(ne,Z);for(ce+y<0&&A(3);y<le;++y)r[y]=i[ce+y]}for(;y<Z;++y)r[y]=r[y-ne]}}t.l=b,t.p=J,t.b=y,t.f=g,b&&(g=1,t.m=C,t.d=x,t.n=k)}while(!g);return y!=r.length&&d?O(r,0,y):r.subarray(0,y)},M=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8},N=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8,e[r+2]|=n>>16},P=function(e,t){for(var i=[],a=0;a<e.length;++a)e[a]&&i.push({s:a,f:e[a]});var o=i.length,s=i.slice();if(!o)return{t:V,l:0};if(o==1){var c=new n(i[0].s+1);return c[i[0].s]=1,{t:c,l:1}}i.sort(function(e,t){return e.f-t.f}),i.push({s:-1,f:25001});var l=i[0],u=i[1],d=0,f=1,p=2;for(i[0]={s:-1,f:l.f+u.f,l,r:u};f!=o-1;)l=i[i[d].f<i[p].f?d++:p++],u=i[d!=f&&i[d].f<i[p].f?d++:p++],i[f++]={s:-1,f:l.f+u.f,l,r:u};for(var m=s[0].s,a=1;a<o;++a)s[a].s>m&&(m=s[a].s);var h=new r(m+1),g=F(i[f-1],h,0);if(g>t){var a=0,_=0,v=g-t,y=1<<v;for(s.sort(function(e,t){return h[t.s]-h[e.s]||e.f-t.f});a<o;++a){var b=s[a].s;if(h[b]>t)_+=y-(1<<g-h[b]),h[b]=t;else break}for(_>>=v;_>0;){var x=s[a].s;h[x]<t?_-=1<<t-h[x]++-1:++a}for(;a>=0&&_;--a){var S=s[a].s;h[S]==t&&(--h[S],++_)}g=t}return{t:new n(h),l:g}},F=function(e,t,n){return e.s==-1?Math.max(F(e.l,t,n+1),F(e.r,t,n+1)):t[e.s]=n},I=function(e){for(var t=e.length;t&&!e[--t];);for(var n=new r(++t),i=0,a=e[0],o=1,s=function(e){n[i++]=e},c=1;c<=t;++c)if(e[c]==a&&c!=t)++o;else{if(!a&&o>2){for(;o>138;o-=138)s(32754);o>2&&(s(o>10?o-11<<5|28690:o-3<<5|12305),o=0)}else if(o>3){for(s(a),--o;o>6;o-=6)s(8304);o>2&&(s(o-3<<5|8208),o=0)}for(;o--;)s(a);o=1,a=e[c]}return{c:n.subarray(0,i),n:t}},L=function(e,t){for(var n=0,r=0;r<t.length;++r)n+=e[r]*t[r];return n},R=function(e,t,n){var r=n.length,i=D(t+2);e[i]=r&255,e[i+1]=r>>8,e[i+2]=e[i]^255,e[i+3]=e[i+1]^255;for(var a=0;a<r;++a)e[i+a+4]=n[a];return(i+4+r)*8},z=function(e,t,n,i,c,l,u,d,f,p,m){M(t,m++,n),++c[256];for(var h=P(c,15),g=h.t,_=h.l,S=P(l,15),w=S.t,ee=S.l,T=I(g),E=T.c,D=T.n,O=I(w),k=O.c,A=O.n,j=new r(19),F=0;F<E.length;++F)++j[E[F]&31];for(var F=0;F<k.length;++F)++j[k[F]&31];for(var z=P(j,7),B=z.t,V=z.l,H=19;H>4&&!B[s[H-1]];--H);var te=p+5<<3,U=L(c,y)+L(l,b)+u,W=L(c,g)+L(l,w)+u+14+3*H+L(j,B)+2*j[16]+3*j[17]+7*j[18];if(f>=0&&te<=U&&te<=W)return R(t,m,e.subarray(f,f+p));var G,K,q,ne;if(M(t,m,1+(W<U)),m+=2,W<U){G=v(g,_,0),K=g,q=v(w,ee,0),ne=w;var re=v(B,V,0);M(t,m,D-257),M(t,m+5,A-1),M(t,m+10,H-4),m+=14;for(var F=0;F<H;++F)M(t,m+3*F,B[s[F]]);m+=3*H;for(var ie=[E,k],J=0;J<2;++J)for(var ae=ie[J],F=0;F<ae.length;++F){var oe=ae[F]&31;M(t,m,re[oe]),m+=B[oe],oe>15&&(M(t,m,ae[F]>>5&127),m+=ae[F]>>12)}}else G=x,K=y,q=C,ne=b;for(var F=0;F<d;++F){var Y=i[F];if(Y>255){var oe=Y>>18&31;N(t,m,G[oe+257]),m+=K[oe+257],oe>7&&(M(t,m,Y>>23&31),m+=a[oe]);var X=Y&31;N(t,m,q[X]),m+=ne[X],X>3&&(N(t,m,Y>>5&8191),m+=o[X])}else N(t,m,G[Y]),m+=K[Y]}return N(t,m,G[256]),m+K[256]},B=/*#__PURE__*/ new i([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),V=/*#__PURE__*/ new n(0),H=function(e,t,s,c,l,u){var f=u.z||e.length,p=new n(c+f+5*(1+Math.ceil(f/7e3))+l),h=p.subarray(c,p.length-l),g=u.l,_=(u.r||0)&7;if(t){_&&(h[0]=u.r>>3);for(var v=B[t-1],y=v>>13,b=v&8191,x=(1<<s)-1,S=u.p||new r(32768),C=u.h||new r(x+1),w=Math.ceil(s/3),ee=2*w,T=function(t){return(e[t]^e[t+1]<<w^e[t+2]<<ee)&x},E=new i(25e3),k=new r(288),A=new r(32),j=0,M=0,N=u.i||0,P=0,F=u.w||0,I=0;N+2<f;++N){var L=T(N),V=N&32767,H=C[L];if(S[V]=H,C[L]=V,F<=N){var te=f-N;if((j>7e3||P>24576)&&(te>423||!g)){_=z(e,h,0,E,k,A,M,P,I,N-I,_),P=j=M=0,I=N;for(var U=0;U<286;++U)k[U]=0;for(var U=0;U<30;++U)A[U]=0}var W=2,G=0,K=b,q=V-H&32767;if(te>2&&L==T(N-q))for(var ne=Math.min(y,te)-1,re=Math.min(32767,N),ie=Math.min(258,te);q<=re&&--K&&V!=H;){if(e[N+W]==e[N+W-q]){for(var J=0;J<ie&&e[N+J]==e[N+J-q];++J);if(J>W){if(W=J,G=q,J>ne)break;for(var ae=Math.min(q,J-2),oe=0,U=0;U<ae;++U){var Y=N-q+U&32767,X=Y-S[Y]&32767;X>oe&&(oe=X,H=Y)}}}V=H,H=S[V],q+=V-H&32767}if(G){E[P++]=268435456|d[W]<<18|m[G];var se=d[W]&31,Z=m[G]&31;M+=a[se]+o[Z],++k[257+se],++A[Z],F=N+W,++j}else E[P++]=e[N],++k[e[N]]}}for(N=Math.max(N,F);N<f;++N)E[P++]=e[N],++k[e[N]];_=z(e,h,g,E,k,A,M,P,I,N-I,_),g||(u.r=_&7|h[_/8|0]<<3,_-=7,u.h=C,u.p=S,u.i=N,u.w=F)}else{for(var N=u.w||0;N<f+g;N+=65535){var ce=N+65535;ce>=f&&(h[_/8|0]=g,ce=f),_=R(h,_+1,e.subarray(N,ce))}u.i=f}return O(p,0,c+D(_)+l)},te=/*#__PURE__*/ (function(){for(var e=/* @__PURE__ */ new Int32Array(256),t=0;t<256;++t){for(var n=t,r=9;--r;)n=(n&1&&-306674912)^n>>>1;e[t]=n}return e})(),U=function(){var e=-1;return{p:function(t){for(var n=e,r=0;r<t.length;++r)n=te[n&255^t[r]]^n>>>8;e=n},d:function(){return~e}}},W=function(e,t,r,i,a){if(!a&&(a={l:1},t.dictionary)){var o=t.dictionary.subarray(-32768),s=new n(o.length+e.length);s.set(o),s.set(e,o.length),e=s,a.w=o.length}return H(e,t.level==null?6:t.level,t.mem==null?a.l?Math.ceil(Math.max(8,Math.min(13,Math.log(e.length)))*1.5):20:12+t.mem,r,i,a)},G=function(e,t){var n={};for(var r in e)n[r]=e[r];for(var r in t)n[r]=t[r];return n},K=function(e,t,n){for(var r=e(),i=e.toString(),a=i.slice(i.indexOf(`[`)+1,i.lastIndexOf(`]`)).replace(/\\s+/g,``).split(`,`),o=0;o<r.length;++o){var s=r[o],c=a[o];if(typeof s==`function`){t+=`;`+c+`=`;var l=s.toString();if(s.prototype){if(l.indexOf(`[native code]`)!=-1){var u=l.indexOf(` `,8)+1;t+=l.slice(u,l.indexOf(`(`,u))}else for(var d in t+=l,s.prototype)t+=`;`+c+`.prototype.`+d+`=`+s.prototype[d].toString()}else t+=l}else n[c]=s}return t},q=[],ne=function(e){var t=[];for(var n in e)e[n].buffer&&t.push((e[n]=new e[n].constructor(e[n])).buffer);return t},re=function(e,n,r,i){if(!q[r]){for(var a=``,o={},s=e.length-1,c=0;c<s;++c)a=K(e[c],a,o);q[r]={c:K(e[s],a,o),e:o}}var l=G({},q[r].e);return t(q[r].c+`;onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=`+n.toString()+`}`,r,l,ne(l),i)},ie=function(){return[n,r,i,a,o,s,u,p,S,w,h,k,v,ee,T,E,D,O,A,j,de,J,ae]},J=function(e){return postMessage(e,[e.buffer])},ae=function(e){return e&&{out:e.size&&new n(e.size),dictionary:e.dictionary}},oe=function(e,t,n,r,i,a){var o=re(n,r,i,function(e,t){o.terminate(),a(e,t)});return o.postMessage([e,t],t.consume?[e.buffer]:[]),function(){o.terminate()}},Y=function(e,t){return e[t]|e[t+1]<<8},X=function(e,t){return(e[t]|e[t+1]<<8|e[t+2]<<16|e[t+3]<<24)>>>0},se=function(e,t){return X(e,t)+X(e,t+4)*4294967296},Z=function(e,t,n){for(;n;++t)e[t]=n,n>>>=8};function ce(e,t){return W(e,t||{},0,0)}var le=/* @__PURE__ */ function(){function e(e,t){typeof e==`function`&&(t=e,e={}),this.ondata=t;var r=e&&e.dictionary&&e.dictionary.subarray(-32768);this.s={i:0,b:r?r.length:0},this.o=new n(32768),this.p=new n(0),r&&this.o.set(r)}return e.prototype.e=function(e){if(this.ondata||A(5),this.d&&A(4),!this.p.length)this.p=e;else if(e.length){var t=new n(this.p.length+e.length);t.set(this.p),t.set(e,this.p.length),this.p=t}},e.prototype.c=function(e){this.s.i=+(this.d=e||!1);var t=this.s.b,n=j(this.p,this.s,this.o);this.ondata(O(n,t,this.s.b),this.d),this.o=O(n,this.s.b-32768),this.s.b=this.o.length,this.p=O(this.p,this.s.p/8|0),this.s.p&=7},e.prototype.push=function(e,t){this.e(e),this.c(t)},e}();function ue(e,t,n){return n||(n=t,t={}),typeof n!=`function`&&A(7),oe(e,t,[ie],function(e){return J(de(e.data[0],ae(e.data[1])))},1,n)}function de(e,t){return j(e,{i:2},t&&t.out,t&&t.dictionary)}var fe=function(e,t,r,i){for(var a in e){var o=e[a],s=t+a,c=i;Array.isArray(o)&&(c=G(i,o[1]),o=o[0]),ArrayBuffer.isView(o)?r[s]=[o,c]:(r[s+=`/`]=[new n(0),c],fe(o,s,r,i))}},pe=typeof TextEncoder<`u`&&/*#__PURE__*/ new TextEncoder,me=typeof TextDecoder<`u`&&/*#__PURE__*/ new TextDecoder;try{me.decode(V,{stream:!0})}catch{}var he=function(e){for(var t=``,n=0;;){var r=e[n++],i=(r>127)+(r>223)+(r>239);if(n+i>e.length)return{s:t,r:O(e,n-1)};i?i==3?(r=((r&15)<<18|(e[n++]&63)<<12|(e[n++]&63)<<6|e[n++]&63)-65536,t+=String.fromCharCode(55296|r>>10,56320|r&1023)):i&1?t+=String.fromCharCode((r&31)<<6|e[n++]&63):t+=String.fromCharCode((r&15)<<12|(e[n++]&63)<<6|e[n++]&63):t+=String.fromCharCode(r)}};function ge(e,t){if(t){for(var r=new n(e.length),i=0;i<e.length;++i)r[i]=e.charCodeAt(i);return r}if(pe)return pe.encode(e);for(var a=e.length,o=new n(e.length+(e.length>>1)),s=0,c=function(e){o[s++]=e},i=0;i<a;++i){if(s+5>o.length){var l=new n(s+8+(a-i<<1));l.set(o),o=l}var u=e.charCodeAt(i);u<128||t?c(u):u<2048?(c(192|u>>6),c(128|u&63)):u>55295&&u<57344?(u=65536+(u&1047552)|e.charCodeAt(++i)&1023,c(240|u>>18),c(128|u>>12&63),c(128|u>>6&63),c(128|u&63)):(c(224|u>>12),c(128|u>>6&63),c(128|u&63))}return O(o,0,s)}function _e(e,t){if(t){for(var n=``,r=0;r<e.length;r+=16384)n+=String.fromCharCode.apply(null,e.subarray(r,r+16384));return n}if(me)return me.decode(e);var i=he(e),a=i.s,n=i.r;return n.length&&A(8),a}var ve=function(e,t){return t+30+Y(e,t+26)+Y(e,t+28)},ye=function(e,t,n){var r=Y(e,t+28),i=Y(e,t+30),a=_e(e.subarray(t+46,t+46+r),!(Y(e,t+8)&2048)),o=t+46+r,s=be(e,o,i,n,X(e,t+20),X(e,t+24),X(e,t+42)),c=s[0],l=s[1],u=s[2];return[Y(e,t+10),c,l,a,o+i+Y(e,t+32),u]},be=function(e,t,n,r,i,a,o){var s=i==4294967295,c=a==4294967295,l=o==4294967295,u=t+n,d=s+c+l;if(r&&d){for(;t+4<u;t+=4+Y(e,t+2))if(Y(e,t)==1)return[s?se(e,t+4+8*c):i,c?se(e,t+4):a,l?se(e,t+4+8*(c+s)):o,1];r<2&&A(13)}return[i,a,o,0]},xe=function(e){var t=0;if(e)for(var n in e){var r=e[n].length;r>65535&&A(9),t+=r+4}return t},Se=function(e,t,n,r,i,a,o,s){var c=r.length,l=n.extra,u=s&&s.length,d=xe(l);Z(e,t,o==null?67324752:33639248),t+=4,o!=null&&(e[t++]=20,e[t++]=n.os),e[t]=20,t+=2,e[t++]=n.flag<<1|(a<0&&8),e[t++]=i&&8,e[t++]=n.compression&255,e[t++]=n.compression>>8;var f=new Date(n.mtime==null?Date.now():n.mtime),p=f.getFullYear()-1980;if((p<0||p>119)&&A(10),Z(e,t,p<<25|f.getMonth()+1<<21|f.getDate()<<16|f.getHours()<<11|f.getMinutes()<<5|f.getSeconds()>>1),t+=4,a!=-1&&(Z(e,t,n.crc),Z(e,t+4,a<0?-a-2:a),Z(e,t+8,n.size)),Z(e,t+12,c),Z(e,t+14,d),t+=16,o!=null&&(Z(e,t,u),Z(e,t+6,n.attrs),Z(e,t+10,o),t+=14),e.set(r,t),t+=c,d)for(var m in l){var h=l[m],g=h.length;Z(e,t,+m),Z(e,t+2,g),e.set(h,t+4),t+=4+g}return u&&(e.set(s,t),t+=u),t},Ce=function(e,t,n,r,i){Z(e,t,101010256),Z(e,t+8,n),Z(e,t+10,n),Z(e,t+12,r),Z(e,t+16,i)};function we(e,t){t||={};var r={},i=[];fe(e,``,r,t);var a=0,o=0;for(var s in r){var c=r[s],l=c[0],u=c[1],d=u.level==0?0:8,f=ge(s),p=f.length,m=u.comment,h=m&&ge(m),g=h&&h.length,_=xe(u.extra);p>65535&&A(11);var v=d?ce(l,u):l,y=v.length,b=U();b.p(l),i.push(G(u,{size:l.length,crc:b.d(),c:v,f,m:h,u:p!=s.length||h&&m.length!=g,o:a,compression:d})),a+=30+p+_+y,o+=76+2*(p+_)+(g||0)+y}for(var x=new n(o+22),S=a,C=o-a,w=0;w<i.length;++w){var f=i[w];Se(x,f.o,f,f.f,f.u,f.c.length);var ee=30+f.f.length+xe(f.extra);x.set(f.c,f.o+ee),Se(x,a,f,f.f,f.u,f.c.length,f.o,f.m),a+=16+ee+(f.m?f.m.length:0)}return Ce(x,a,i.length,C,S),x}var Te=/* @__PURE__ */ function(){function e(){}return e.prototype.push=function(e,t){this.ondata(null,e,t)},e.compression=0,e}(),Ee=/* @__PURE__ */ function(){function e(){var e=this;this.i=new le(function(t,n){e.ondata(null,t,n)})}return e.prototype.push=function(e,t){try{this.i.push(e,t)}catch(e){this.ondata(e,null,t)}},e.compression=8,e}(),De=/* @__PURE__ */ function(){function e(e){this.onfile=e,this.k=[],this.o={0:Te},this.p=V}return e.prototype.push=function(e,t){var r=this;if(this.onfile||A(5),this.p||A(4),this.c>0){var i=Math.min(this.c,e.length),a=e.subarray(0,i);if(this.c-=i,this.d?this.d.push(a,!this.c):this.k[0].push(a),e=e.subarray(i),e.length)return this.push(e,t)}else{var o=0,s=0,c=void 0,l=void 0;this.p.length?e.length?(l=new n(this.p.length+e.length),l.set(this.p),l.set(e,this.p.length)):l=this.p:l=e;for(var u=l.length,d=this.c,f=d&&this.d,p=function(){var e=X(l,s);if(e==67324752){o=1,c=s,m.d=null,m.c=0;var t=Y(l,s+6),n=Y(l,s+8),i=t&2048,a=t&8,f=Y(l,s+26),p=Y(l,s+28);if(u>s+30+f+p){var h=[];m.k.unshift(h),o=2;var g=X(l,s+18),_=X(l,s+22),v=_e(l.subarray(s+30,s+=30+f),!i),y=be(l,s,p,2,g,_,0),b=y[0],x=y[1],S=y[3];a&&(b=-1-S),s+=p,m.c=b;var C,w={name:v,compression:n,start:function(){if(w.ondata||A(5),!b)w.ondata(null,V,!0);else{var e=r.o[n];e||w.ondata(A(14,`unknown compression type `+n,1),null,!1),C=b<0?new e(v):new e(v,b,x),C.ondata=function(e,t,n){w.ondata(e,t,n)};for(var t=0,i=h;t<i.length;t++){var a=i[t];C.push(a,!1)}r.k[0]==h&&r.c?r.d=C:C.push(V,!0)}},terminate:function(){C&&C.terminate&&C.terminate()}};b>=0&&(w.size=b,w.originalSize=x),m.onfile(w)}return`break`}if(d){if(e==134695760)return c=s+=12+(d==-2&&8),o=3,m.c=0,`break`;if(e==33639248)return c=s-=4,o=3,m.c=0,`break`}},m=this;s<u-4&&p()!==`break`;++s);if(this.p=V,d<0){var h=o?l.subarray(0,c-12-(d==-2&&8)-(X(l,c-16)==134695760&&4)):l.subarray(0,s);f?f.push(h,!!o):this.k[+(o==2)].push(h)}if(o&2)return this.push(l.subarray(s),t);this.p=l.subarray(s)}t&&(this.c&&A(13),this.p=null)},e.prototype.register=function(e){this.o[e.compression]=e},e}(),Oe=typeof queueMicrotask==`function`?queueMicrotask:typeof setTimeout==`function`?setTimeout:function(e){e()};function ke(e,t,r){r||(r=t,t={}),typeof r!=`function`&&A(7);var i=[],a=function(){for(var e=0;e<i.length;++e)i[e]()},o={},s=function(e,t){Oe(function(){r(e,t)})};Oe(function(){s=r});for(var c=e.length-22;X(e,c)!=101010256;--c)if(!c||e.length-c>65558)return s(A(13,0,1),null),a;var l=Y(e,c+8);if(l){var u=l,d=X(e,c+16),f=X(e,c-20)==117853008;if(f){var p=X(e,c-12);f=X(e,p)==101075792,f&&(u=l=X(e,p+32),d=X(e,p+48))}for(var m=t&&t.filter,h=function(t){var r=ye(e,d,f),c=r[0],u=r[1],p=r[2],h=r[3],g=r[4],_=r[5],v=ve(e,_);d=g;var y=function(e,t){e?(a(),s(e,null)):(t&&(o[h]=t),--l||s(null,o))};if(!m||m({name:h,size:u,originalSize:p,compression:c})){if(!c)y(null,O(e,v,v+u));else if(c==8){var b=e.subarray(v,v+u);if(p<524288||u>.8*p)try{y(null,de(b,{out:new n(p)}))}catch(e){y(e,null)}else i.push(ue(b,{size:p},y))}else y(A(14,`unknown compression type `+c,1),null)}else y(null,null)},g=0;g<u;++g)h(g)}else s(null,{});return a}function Ae(e){\"@babel/helpers - typeof\";return Ae=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Ae(e)}function je(e){var t=String.fromCharCode,n=Object.prototype.hasOwnProperty,r=/&#(\\d+);|&#x([0-9a-f]+);|&(\\w+);/gi,i={amp:`&`,apos:`'`,gt:`>`,lt:`<`,quot:`\"`};Object.keys(i).forEach(function(e){i[e.toUpperCase()]=i[e]});function a(e,r,a,o){return o?n.call(i,o)?i[o]:`&`+o+`;`:t(r||parseInt(a,16))}function o(e){return e.length>3&&e.indexOf(`&`)!==-1?e.replace(r,a):e}var s=`non-whitespace outside of root node`;function c(e){return Error(e)}function l(e){return`missing namespace for prefix <`+e+`>`}function u(e){return{get:e,enumerable:!0}}function d(e){var t={},n;for(n in e)t[n]=e[n];return t}var f=Symbol(`nameCache`);function p(e){return e+`$uri`}function m(e){var t={},n,r;for(n in e)r=e[n],t[r]=r,t[p(r)]=n;return t}function h(){return{line:0,column:0}}function g(e){throw e}function _(e){if(!this)return new _(e);var t=e&&e.proxy,n,r,i,a,v=g,y,b,x,S,C=h,w=!1,ee=!1,T=``,E=!1,D=!1,O=null,k=!1,A,j,M,N;function P(e){e instanceof Error||(e=c(e)),O=e,v(e,C)}function F(e){y&&(e instanceof Error||(e=c(e)),y(e,C))}this.on=function(e,t){if(typeof t!=`function`)throw c(`required args <name, cb>`);switch(e){case`openTag`:r=t;break;case`text`:n=t;break;case`closeTag`:i=t;break;case`error`:v=t;break;case`warn`:y=t;break;case`cdata`:a=t;break;case`attention`:S=t;break;case`question`:x=t;break;case`comment`:b=t;break;default:throw c(`unsupported event: `+e)}return this},this.ns=function(e){if(e===void 0&&(e={}),Ae(e)!==`object`)throw c(`required args <nsMap={}>`);var t={},n;for(n in e)t[n]=e[n];return D=!0,N=t,this};function I(){A=D?[]:null,j=D?m(N):null,M=[],C=h,k=!1,O=null,ee=!1,T=``}this.parse=function(e){if(typeof e!=`string`)throw c(`required args <xml=string>`);if(w)throw c(`parse during stream; call end() first`);return I(),L(e),C=h,k=!1,O},this.write=function(e){if(typeof e!=`string`)throw c(`required args <xml=string>`);return w||=(I(),!0),O||(T=L(T+e,!0)||``),this},this.end=function(){return w||I(),w=!1,O||L(T),T=``,C=h,k=!1,O},this.stop=function(){k=!0};function L(e){var c=arguments.length>1&&arguments[1]!==void 0&&arguments[1],m=null,h=null,g,_=0,v=!1,y=!1,w=0,T=0,O,I,L,R,z,B,V,H,te,U=``,W=0,G;function K(e,t){var n=e.indexOf(`:`);if(n===-1)return e;var r=j[e.substring(0,n)];return r?t===r?e.substr(n+1):r+e.substr(n):(F(l(e.substring(0,n))),null)}function q(){if(G!==null)return G;var e,t,n=D&&j.xmlns,r=D&&E?[]:null,i=W,a=U,s=a.length,c,l,u,f,m,h={},g=/* @__PURE__ */ new Set,v,y,b;parseAttr:for(;i<s;i++)if(v=!1,y=a.charCodeAt(i),!(y===32||y<14&&y>8)){for((y<65||y>122||y>90&&y<97)&&y!==95&&y!==58&&(F(`illegal first char attribute name`),v=!0),b=i+1;b<s;b++)if(y=a.charCodeAt(b),!(y>96&&y<123||y>64&&y<91||y>47&&y<59||y===46||y===45||y===95)){if(y===32||y<14&&y>8){F(`missing attribute value`),i=b;continue parseAttr}if(y===61)break;F(`illegal attribute name char`),v=!0}if(m=a.substring(i,b),m===`xmlns:xmlns`&&(F(`illegal declaration of xmlns`),v=!0),y=a.charCodeAt(b+1),y===34)b=a.indexOf(`\"`,i=b+2),b===-1&&(b=a.indexOf(`'`,i),b!==-1&&(F(`attribute value quote missmatch`),v=!0));else if(y===39)b=a.indexOf(`'`,i=b+2),b===-1&&(b=a.indexOf(`\"`,i),b!==-1&&(F(`attribute value quote missmatch`),v=!0));else for(F(`missing attribute value quotes`),v=!0,b+=1;b<s&&(y=a.charCodeAt(b+1),!(y===32||y<14&&y>8));b++);for(b===-1&&(F(`missing closing quotes`),b=s,v=!0),v||(u=a.substring(i,b)),i=b;b+1<s&&(y=a.charCodeAt(b+1),!(y===32||y<14&&y>8));b++)i===b&&(F(`illegal character after attribute end`),v=!0);if(i=b+1,v)continue parseAttr;if(g.has(m))F(`attribute <`+m+`> already defined`);else if(g.add(m),!D)h[m]=u;else if(E){if(l=m===`xmlns`?`xmlns`:m.charCodeAt(0)===120&&m.substr(0,6)===`xmlns:`?m.substr(6):null,l!==null){if(e=o(u),t=p(l),f=N[e],!f){if(l===`xmlns`||t in j&&j[t]!==e)do f=`ns`+_++;while(j[f]!==void 0);else f=l;N[e]=f}j[l]!==f&&(c||=(j=d(j),!0),j[l]=f,l===`xmlns`&&(j[p(f)]=e,n=f),j[t]=e),h[m]=u;continue}r.push(m,u)}else m=K(m,n),m!==null&&(h[m]=u)}if(E)for(i=0,s=r.length;i<s;i++)m=K(r[i++],n),u=r[i],m!==null&&(h[m]=u);return G=h}function ne(){for(var t=/(\\r\\n|\\r|\\n)/g,n=0,r=0,i=0,a=T,o,s;w>=i&&(o=t.exec(e),!(!o||(a=o[0].length+o.index,a>w)));)n+=1,i=a;return w==-1?(r=a,s=e.substring(T)):T===0?s=e.substring(T,w):(r=w-i,s=T==-1?e.substring(w):e.substring(w,T+1)),{data:s,line:n,column:r}}for(C=ne,t&&(te=Object.create({},{name:u(function(){return V}),originalName:u(function(){return H}),attrs:u(q),ns:u(function(){return j})}));T!==-1;){if(w=e.charCodeAt(T)===60?T:e.indexOf(`<`,T),w===-1){if(c)return e.substring(T);if(M.length)return P(`unexpected end of file`);if(!ee)return P(`missing start tag`);T<e.length&&e.substring(T).trim()&&F(s);return}if(ee||=!0,T!==w){if(M.length){if(n&&(n(e.substring(T,w),o,C),k))return}else if(e.substring(T,w).trim()&&(F(s),k))return}if(R=e.charCodeAt(w+1),R===33){if(L=e.charCodeAt(w+2),L===91&&e.substr(w+3,6)===`CDATA[`){if(T=e.indexOf(`]]>`,w),T===-1)return c?e.substring(w):P(`unclosed cdata`);if(a&&(a(e.substring(w+9,T),C),k))return;T+=3;continue}if(L===45&&e.charCodeAt(w+3)===45){if(T=e.indexOf(`-->`,w),T===-1)return c?e.substring(w):P(`unclosed comment`);if(b&&(b(e.substring(w+4,T),o,C),k))return;T+=3;continue}}if(R===63){if(T=e.indexOf(`?>`,w),T===-1)return c?e.substring(w):P(`unclosed question`);if(x&&(x(e.substring(w,T+2),C),k))return;T+=2}else{for(O=w+1;;O++){if(z=e.charCodeAt(O),isNaN(z))return c?e.substring(w):(T=-1,P(`unclosed tag`));if(z===34)L=e.indexOf(`\"`,O+1),O=L===-1?O:L;else if(z===39)L=e.indexOf(`'`,O+1),O=L===-1?O:L;else if(z===62){T=O;break}}if(R===33){if(S&&(S(e.substring(w,T+1),o,C),k))return;T+=1}else{if(G={},R===47){if(v=!1,y=!0,!M.length)return P(`missing open tag`);if(O=V=M.pop(),L=w+2+O.length,e.substring(w+2,L)!==O)return P(`closing tag mismatch`);for(;L<T;L++)if(R=e.charCodeAt(L),!(R===32||R>8&&R<14))return P(`close tag`)}else{if(e.charCodeAt(T-1)===47?(O=V=e.substring(w+1,T-1),v=!0,y=!0):(O=V=e.substring(w+1,T),v=!0,y=!1),!(R>96&&R<123||R>64&&R<91||R===95||R===58))return P(`illegal first char nodeName`);for(L=1,I=O.length;L<I;L++)if(R=O.charCodeAt(L),!(R>96&&R<123||R>64&&R<91||R>47&&R<59||R===45||R===95||R==46)){if(R===32||R<14&&R>8){V=O.substring(0,L),G=null;break}return P(`invalid nodeName`)}y||M.push(V)}if(D){g=j,v&&(y||A.push(g),G===null&&(E=O.indexOf(`xmlns`,L)!==-1)&&(W=L,U=O,q(),E=!1)),H=V,h!==j&&(m=j[f],m===void 0&&(m=j[f]={}),h=j);var re=m[V];if(re!==void 0)V=re;else{if(R=V.indexOf(`:`),R!==-1){if(B=j[V.substring(0,R)],!B)return P(`missing namespace on <`+H+`>`);V=V.substr(R+1)}else B=j.xmlns;B&&(V=B+`:`+V),m[H]=V}}if(v&&(W=L,U=O,r&&(t?r(te,o,y,C):r(V,q,o,y,C),k)))return;if(y){if(i&&(i(t?te:V,o,v,C),k))return;D&&(j=v?g:A.pop())}T+=1}}}}}return new _(e)}function Me(e,t,n,r){var i=!1,a=function(){if(i)throw Error(`Errored`)},o,s=new je;return{promise:new Promise(function(a,c){o=a,s.on(`error`,function(e){throw i=!0,e}),s.on(`text`,function(t,n){r&&r(n(t),e)}),s.on(`openTag`,function(n,r,i,a,o){if(t){var s=r();for(var c in s)s[Ne(c,!0)]=i(s[c]);t(Ne(n),s,e)}}),s.on(`closeTag`,function(t){n&&n(Ne(t),e)})}),write:function(e){a(),s.write(e)},end:function(){a(),s.end(),o()}}}function Ne(e,t){for(var n=0;n<e.length;){if(e[n]===`:`&&!(t&&n===5&&e.slice(0,5)===`xmlns`))return e.slice(n+1);n++}return e}function Pe(e){\"@babel/helpers - typeof\";return Pe=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Pe(e)}function Fe(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,`value`in r&&(r.writable=!0),Object.defineProperty(e,Le(r.key),r)}}function Ie(e,t,n){return t&&Fe(e.prototype,t),n&&Fe(e,n),Object.defineProperty(e,\"prototype\",{writable:!1}),e}function Le(e){var t=Re(e,`string`);return Pe(t)===`symbol`?t:String(t)}function Re(e,t){if(Pe(e)!==`object`||e===null)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(Pe(r)!==`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function ze(e,t){if(!(e instanceof t))throw TypeError(`Cannot call a class as a function`)}function Be(e,t){if(typeof t!=`function`&&t!==null)throw TypeError(`Super expression must either be null or a function`);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,\"prototype\",{writable:!1}),t&&Je(e,t)}function Ve(e){var t=Ke();return function(){var n=Ye(e),r;if(t){var i=Ye(this).constructor;r=Reflect.construct(n,arguments,i)}else r=n.apply(this,arguments);return He(this,r)}}function He(e,t){if(t&&(Pe(t)===`object`||typeof t==`function`))return t;if(t!==void 0)throw TypeError(`Derived constructors may only return object or undefined`);return Ue(e)}function Ue(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function We(e){var t=typeof Map==`function`?/* @__PURE__ */ new Map:void 0;return We=function(e){if(e===null||!qe(e))return e;if(typeof e!=`function`)throw TypeError(`Super expression must either be null or a function`);if(t!==void 0){if(t.has(e))return t.get(e);t.set(e,n)}function n(){return Ge(e,arguments,Ye(this).constructor)}return n.prototype=Object.create(e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),Je(n,e)},We(e)}function Ge(e,t,n){return Ge=Ke()?Reflect.construct.bind():function(e,t,n){var r=[null];r.push.apply(r,t);var i=new(Function.bind.apply(e,r));return n&&Je(i,n.prototype),i},Ge.apply(null,arguments)}function Ke(){if(typeof Reflect>`u`||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy==`function`)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}function qe(e){return Function.toString.call(e).indexOf(`[native code]`)!==-1}function Je(e,t){return Je=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},Je(e,t)}function Ye(e){return Ye=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},Ye(e)}var Xe=/*#__PURE__*/ function(e){Be(n,e);var t=Ve(n);function n(e){var r;return ze(this,n),r=t.call(this,e),r.name=`InvalidSpreadsheetError`,r}return Ie(n)}(/*#__PURE__*/ We(Error));function Ze(e,t,n,r,i,a){var o=Me(t,n,r,i);return a?s(o,e,a):(o.write(e),o.end()),o.promise.then(function(e){return e},function(e){var t=new Xe(e.message);throw t.stack=e.stack,t.cause=e,t});function s(e,t,n,r){var i=65536,a=0,o=i,s=function(){a++;var r=Date.now();if(t.length>o){e.write(t.slice(0,o)),n&&n(!1),t=t.slice(o);var i=Date.now()-r;return i<3.5?o*=2:i>7&&(o/=2),!0}return e.write(t),e.end(),n&&n(!0),!1};(function e(){s()&&(r?typeof setImmediate<`u`?setImmediate(e):setTimeout(e,0):e())})()}}function Qe(e){\"@babel/helpers - typeof\";return Qe=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Qe(e)}function $e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,`value`in r&&(r.writable=!0),Object.defineProperty(e,tt(r.key),r)}}function et(e,t,n){return t&&$e(e.prototype,t),n&&$e(e,n),Object.defineProperty(e,\"prototype\",{writable:!1}),e}function tt(e){var t=nt(e,`string`);return Qe(t)===`symbol`?t:String(t)}function nt(e,t){if(Qe(e)!==`object`||e===null)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(Qe(r)!==`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function rt(e,t){if(!(e instanceof t))throw TypeError(`Cannot call a class as a function`)}function it(e,t){if(typeof t!=`function`&&t!==null)throw TypeError(`Super expression must either be null or a function`);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,\"prototype\",{writable:!1}),t&&ft(e,t)}function at(e){var t=ut();return function(){var n=pt(e),r;if(t){var i=pt(this).constructor;r=Reflect.construct(n,arguments,i)}else r=n.apply(this,arguments);return ot(this,r)}}function ot(e,t){if(t&&(Qe(t)===`object`||typeof t==`function`))return t;if(t!==void 0)throw TypeError(`Derived constructors may only return object or undefined`);return st(e)}function st(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function ct(e){var t=typeof Map==`function`?/* @__PURE__ */ new Map:void 0;return ct=function(e){if(e===null||!dt(e))return e;if(typeof e!=`function`)throw TypeError(`Super expression must either be null or a function`);if(t!==void 0){if(t.has(e))return t.get(e);t.set(e,n)}function n(){return lt(e,arguments,pt(this).constructor)}return n.prototype=Object.create(e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),ft(n,e)},ct(e)}function lt(e,t,n){return lt=ut()?Reflect.construct.bind():function(e,t,n){var r=[null];r.push.apply(r,t);var i=new(Function.bind.apply(e,r));return n&&ft(i,n.prototype),i},lt.apply(null,arguments)}function ut(){if(typeof Reflect>`u`||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy==`function`)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}function dt(e){return Function.toString.call(e).indexOf(`[native code]`)!==-1}function ft(e,t){return ft=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},ft(e,t)}function pt(e){return pt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},pt(e)}var mt=/*#__PURE__*/ function(e){it(n,e);var t=at(n);function n(){return rt(this,n),t.apply(this,arguments)}return et(n)}(/*#__PURE__*/ ct(Error));function ht(e){var t=new mt(e.message);return e.stack&&(t.stack=e.stack),Error.captureStackTrace&&Error.captureStackTrace(t,ht),t.cause=e,t}function gt(e,t){return _t(e,t,vt,!0)}function _t(e){var t=(arguments.length>1&&arguments[1]!==void 0?arguments[1]:{}).filter,n=arguments.length>2?arguments[2]:void 0;return arguments.length>3&&arguments[3],n(new Uint8Array(e),{filter:function(e){return!t||t({path:e.name})}}).then(function(e){return e},function(e){throw yt(e)?ht(e):e})}function vt(e){return new Promise(function(t,n){ke(e,function(e,r){e?n(e):t(r)})})}function yt(e){return typeof e.code==`number`}function bt(e){\"@babel/helpers - typeof\";return bt=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},bt(e)}function xt(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,`value`in r&&(r.writable=!0),Object.defineProperty(e,Ct(r.key),r)}}function St(e,t,n){return t&&xt(e.prototype,t),n&&xt(e,n),Object.defineProperty(e,\"prototype\",{writable:!1}),e}function Ct(e){var t=wt(e,`string`);return bt(t)===`symbol`?t:String(t)}function wt(e,t){if(bt(e)!==`object`||e===null)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(bt(r)!==`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function Tt(e,t){if(!(e instanceof t))throw TypeError(`Cannot call a class as a function`)}function Et(e,t){if(typeof t!=`function`&&t!==null)throw TypeError(`Super expression must either be null or a function`);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,\"prototype\",{writable:!1}),t&&Pt(e,t)}function Dt(e){var t=Mt();return function(){var n=Ft(e),r;if(t){var i=Ft(this).constructor;r=Reflect.construct(n,arguments,i)}else r=n.apply(this,arguments);return Ot(this,r)}}function Ot(e,t){if(t&&(bt(t)===`object`||typeof t==`function`))return t;if(t!==void 0)throw TypeError(`Derived constructors may only return object or undefined`);return kt(e)}function kt(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function At(e){var t=typeof Map==`function`?/* @__PURE__ */ new Map:void 0;return At=function(e){if(e===null||!Nt(e))return e;if(typeof e!=`function`)throw TypeError(`Super expression must either be null or a function`);if(t!==void 0){if(t.has(e))return t.get(e);t.set(e,n)}function n(){return jt(e,arguments,Ft(this).constructor)}return n.prototype=Object.create(e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),Pt(n,e)},At(e)}function jt(e,t,n){return jt=Mt()?Reflect.construct.bind():function(e,t,n){var r=[null];r.push.apply(r,t);var i=new(Function.bind.apply(e,r));return n&&Pt(i,n.prototype),i},jt.apply(null,arguments)}function Mt(){if(typeof Reflect>`u`||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy==`function`)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}function Nt(e){return Function.toString.call(e).indexOf(`[native code]`)!==-1}function Pt(e,t){return Pt=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},Pt(e,t)}function Ft(e){return Ft=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},Ft(e)}var It={XLS_FILE_NOT_SUPPORTED:\"You passed a legacy `.xls` file. Only `.xlsx` files are supported\",FILE_NOT_SUPPORTED:\"Doesn't look like an `.xlsx` file\",INVALID_ZIP:\"Couldn't unzip `.xlsx` file contents\",NO_DATA:`No data`},Lt=/*#__PURE__*/ function(e){Et(n,e);var t=Dt(n);function n(e,r){var i;return Tt(this,n),i=t.call(this,It[e]||e),i.code=e,i.name=`InvalidInputError`,i.cause=r,i}return St(n)}(/*#__PURE__*/ At(Error));function Rt(e){var t=e.path;return t.endsWith(`.xml`)||t.endsWith(`.xml.rels`)}var zt=[80,75],Bt=[208,207,17,224],Vt=[zt,Bt];Vt.indexOf(zt);var Ht=Vt.indexOf(Bt);function Ut(){var e,t=Wt(Vt),n=0;return function(r){if(isNaN(e)){var i;t=t.filter(function(e){if(r===Vt[e][n])return Vt[e].length===n+1&&(i=e),!0}),t.length===1?e=i:t.length===0&&(e=-1)}return n++,e}}function Wt(e){for(var t=[],n=0;n<e.length;)t.push(n),n++;return t}function Gt(e,t){var n=typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n)return(n=n.call(e)).next.bind(n);if(Array.isArray(e)||(n=Kt(e))||t&&e&&typeof e.length==`number`){n&&(e=n);var r=0;return function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}}}throw TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Kt(e,t){if(e){if(typeof e==`string`)return qt(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);if(n===`Object`&&e.constructor&&(n=e.constructor.name),n===`Map`||n===`Set`)return Array.from(e);if(n===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return qt(e,t)}}function qt(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function Jt(e){for(var t=Ut(),n=Gt(e),r;!(r=n()).done;){var i=r.value;if(Yt(i,t))return}Xt(e.length)}function Yt(e,t){var n=t(e);if(n!==void 0){if(n===Ht)throw new Lt(`XLS_FILE_NOT_SUPPORTED`);if(n<0)throw new Lt(`FILE_NOT_SUPPORTED`);return!0}}function Xt(e){throw new Lt(e===0?`NO_DATA`:`FILE_NOT_SUPPORTED`)}var Zt;function Qt(e){var t=Date.now();(typeof global<`u`?global.READ_EXCEL_FILE_CHECKPOINTS:typeof window<`u`&&window.READ_EXCEL_FILE_CHECKPOINTS)&&(Zt&&console.log(`  -`,t-Zt,`ms`),console.log(`*`,e)),Zt=t}function $t(){Zt=void 0}function en(e){return $t(),Qt(`unpack files`),tn(e).then(function(e){return Jt(new Uint8Array(e)),gt(e,{filter:Rt}).then(function(e){return e},function(e){throw e instanceof mt?new Lt(`INVALID_ZIP`,e.cause):e})})}function tn(e){if(e instanceof Blob)return e.arrayBuffer();if(e instanceof ArrayBuffer)return Promise.resolve(e);throw new Lt(`INPUT_TYPE_NOT_SUPPORTED`)}function nn(e,t){var n=r();return t(e,n,a,null,null).then(function(){return i(n)});function r(){return{workbookPr:void 0,sheets:[]}}function i(e){return{epoch1904:e.workbookPr?e.workbookPr.epoch1904:!1,sheets:e.sheets}}function a(e,t,n){e===`workbookPr`?n.workbookPr||={epoch1904:t.date1904===`1`}:e===`sheet`&&t.name&&n.sheets.push({id:Number(t.sheetId),name:t.name,relationId:t.id})}}function rn(e,t){var n=`http://schemas.openxmlformats.org/officeDocument/2006/relationships/`,r=`http://purl.oclc.org/ooxml/officeDocument/relationships/`,i=a();return t(e,i,s,null,null).then(function(){return o(i)});function a(){return{sheets:{},sharedStrings:void 0,styles:void 0}}function o(e){return e}function s(e,t,n){e===`Relationship`&&c(n,t.Id,t.Type,t.Target)}function c(e,t,i,a){switch(i){case n+`styles`:case r+`styles`:e.styles=l(a);break;case n+`sharedStrings`:case r+`sharedStrings`:e.sharedStrings=l(a);break;case n+`worksheet`:case r+`worksheet`:e.sheets[t]=l(a)}}function l(e){return e[0]===`/`?e.slice(1):`xl/`+e}}function an(e){\"@babel/helpers - typeof\";return an=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},an(e)}var on=[`xfId`];function sn(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function cn(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?sn(Object(n),!0).forEach(function(t){ln(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):sn(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function ln(e,t,n){return t=un(t),t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function un(e){var t=dn(e,`string`);return an(t)===`symbol`?t:String(t)}function dn(e,t){if(an(e)!==`object`||e===null)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(an(r)!==`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function fn(e,t){if(e==null)return{};var n=pn(e,t),r,i;if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)r=a[i],!(t.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}function pn(e,t){if(e==null)return{};for(var n={},r=Object.keys(e),i,a=0;a<r.length;a++)i=r[a],!(t.indexOf(i)>=0)&&(n[i]=e[i]);return n}function mn(e,t){var n=r();return t(e,n,a,o,null).then(function(){return i(n)});function r(){return{numberFormats:[],baseStyles:[],styles:[],cellStyleXfs:!1,cellXfs:!1}}function i(e){return e.styles.map(function(t){if(t.xfId){var n=t.xfId,r=fn(t,on);return cn(cn({},e.baseStyles[n]),r)}return t})}function a(e,t,n){if(e===`numFmt`){var r=Number(t.numFmtId),i={id:r};r>=100&&(i.template=t.formatCode),n.numberFormats[r]=i}else if(e===`cellStyleXfs`)n.cellStyleXfs=!0;else if(e===`cellXfs`)n.cellXfs=!0;else if(e===`xf`){if(n.cellStyleXfs)n.baseStyles.push(s(t));else if(n.cellXfs){var a=s(t,n.numberFormats);t.xfId&&(a.xfId=Number(t.xfId)),n.styles.push(a)}}}function o(e,t){e===`cellStyleXfs`?t.cellStyleXfs=!1:e===`cellXfs`&&(t.cellXfs=!1)}function s(e,t){var n={};if(e.numFmtId){var r=Number(e.numFmtId);n.numberFormat=t&&t[r]?t[r]:{id:r}}return n}}function hn(e,t){var n=r();return t(e,n,a,o,s).then(function(){return i(n)});function r(){return{si:void 0,strings:[]}}function i(e){return e.strings}function a(e,t,n){e===`si`?n.si=c():n.si&&l(e,t,n.si)}function o(e,t){e===`si`?(t.strings.push(t.si.string),t.si=void 0):t.si&&u(e,t.si)}function s(e,t){t.si&&d(e,t.si)}function c(){return{t:!1,r:!1,rPh:!1,string:``}}function l(e,t,n){e===`t`?n.t=!0:e===`r`?n.r=!0:e===`rPh`&&(n.rPh=!0)}function u(e,t){e===`t`?t.t=!1:e===`r`?t.r=!1:e===`rPh`&&(t.rPh=!1)}function d(e,t){t.rPh||t.t&&(t.r?t.string+=e:t.string=e)}}function gn(e,t){var n=17,r=1,i=1,a=864e5,o=365;t&&(e+=4*o+r+i);var s=r+i+70*o+n;return Math.floor((e-s)*a)}var _n=/;@$/,vn=/[^a-z0#\\?%]+/;function yn(e,t,n){var r=n[e];return r===void 0?n[e]=bn(t):r}function bn(e){return e=e.toLowerCase(),e=e.replace(_n,``),e=e.replace(/\\\\./g,` `),e.split(`;`).some(t);function t(e){e=e.replace(/\"[^\"]*\"/g,` `),e=e.replace(/(\\[?[smhd]{1,2}\\]?)[\\.\\,]00?0?/g,`$1`),e=e.replace(/\\[([smhd]{1,2})\\]/g,`$1`),e=e.replace(/\\[[^\\]]*\\]/g,``);var t=e.split(vn).filter(function(e){return e});return t.length!==0&&t.every(function(e){return xn.indexOf(e)>=0})}}var xn=/* @__PURE__ */ `s.ss.m.mm.h.hh.am.pm.a.p.d.dd.ddd.dddd.aaa.aaaa.aaaaa.m.mm.mmm.mmmm.mmmmm.y.yy.yyyy.e.ee.eeee`.split(`.`);function Sn(e,t,n,r){return e.numberFormat?!!(En.indexOf(e.numberFormat.id)>=0||t&&e.numberFormat.template===t||n&&e.numberFormat.template&&yn(e.numberFormat.id,e.numberFormat.template,r)):!1}var Cn=[14,15,16,17,18,19,20,21,22,45,46,47],wn=[27,28,29,30,31,32,33,34,35,36,50,51,52,53,54,55,56,57,58],Tn=[27,28,29,30,31,32,33,34,35,36,50,51,52,53,54,55,56,57,58],En=Cn.concat(wn).concat(Tn.filter(function(e){return wn.indexOf(e)<0})).concat([71,72,73,74,75,76,77,78,79,80,81].filter(function(e){return wn.indexOf(e)<0}).filter(function(e){return Tn.indexOf(e)<0}));function Dn(e,t){return Mn(e)||jn(e,t)||kn(e,t)||On()}function On(){throw TypeError(`Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function kn(e,t){if(e){if(typeof e==`string`)return An(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);if(n===`Object`&&e.constructor&&(n=e.constructor.name),n===`Map`||n===`Set`)return Array.from(e);if(n===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return An(e,t)}}function An(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function jn(e,t){var n=e==null?null:typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n!=null){var r,i,a,o,s=[],c=!0,l=!1;try{if(a=(n=n.call(e)).next,t===0){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=a.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){l=!0,i=e}finally{try{if(!c&&n.return!=null&&(o=n.return(),Object(o)!==o))return}finally{if(l)throw i}}return s}}function Mn(e){if(Array.isArray(e))return e}var Nn=[null,null];function Pn(e,t,n,r,i){var a=Dn(i,7),o=a[0],s=a[1],c=a[2],l=a[3],u=a[4],d=a[5],f=a[6];switch(e||`n`){case`str`:return n===void 0?`VALUE_MISSING`:n?[`s`,n]:Nn;case`inlineStr`:return r===void 0?`VALUE_MISSING`:[`s`,r];case`s`:if(!n)return`VALUE_MISSING`;var p=Number(n);return isNaN(p)||o[p]===void 0?`VALUE_INVALID`:[`s`,o[p]];case`b`:return n?n===`1`?[`b`,!0]:n===`0`?[`b`,!1]:`VALUE_INVALID`:`VALUE_MISSING`;case`e`:return n?[`e`,n]:`VALUE_MISSING`;case`d`:if(!n)return Nn;var m=new Date(n);return isNaN(m.valueOf())?`VALUE_INVALID`:[`d`,m.getTime()];case`n`:if(!n)return Nn;if(t){var h=Number(t);if(isNaN(h)||s[h]===void 0)return`FORMAT_INVALID`;if(Sn(s[h],u,d,l)){var g=Number(n);return isNaN(g)?`VALUE_INVALID`:[`d`,gn(g,c)]}}if(f)return[`n`,n];var _=Number(n);return isNaN(_)?`VALUE_INVALID`:[`n`,_];default:return`TYPE_INVALID`}}function Fn(e){for(var t=0,n=0;n<e.length;){var r=e.charCodeAt(n);if(r>=48&&r<=57){var i=Number(e.slice(n));return isNaN(i)&&In(e),[i,t]}t*=26,t+=e.charCodeAt(n)-64,n++}In(e)}function In(e){throw Error(`<c r=\"${e}\">`)}function Ln(e,t){return Bn(e)||zn(e,t)||Hn(e,t)||Rn()}function Rn(){throw TypeError(`Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function zn(e,t){var n=e==null?null:typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n!=null){var r,i,a,o,s=[],c=!0,l=!1;try{if(a=(n=n.call(e)).next,t===0){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=a.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){l=!0,i=e}finally{try{if(!c&&n.return!=null&&(o=n.return(),Object(o)!==o))return}finally{if(l)throw i}}return s}}function Bn(e){if(Array.isArray(e))return e}function Vn(e,t){var n=typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n)return(n=n.call(e)).next.bind(n);if(Array.isArray(e)||(n=Hn(e))||t&&e&&typeof e.length==`number`){n&&(e=n);var r=0;return function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}}}throw TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Hn(e,t){if(e){if(typeof e==`string`)return Un(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);if(n===`Object`&&e.constructor&&(n=e.constructor.name),n===`Map`||n===`Set`)return Array.from(e);if(n===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return Un(e,t)}}function Un(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}var Wn=null;function Gn(e,t,n){var r=n.sharedStrings,i=n.styles,a=n.epoch1904,o=n.dateFormatDetectionCache,s=n.options,c=[r,i,a,o,s.dateFormat,s.smartDateParser!==!1,s.parseNumber],l=[],u=[],d=f();return t(e,d,y,b,x,v).then(function(){var e=d.sheetData,t=e.rowCount,n=e.columnCount,r=e.dataRowCount,i=e.dataColumnCount;if(r<t&&(l=l.slice(0,r)),i<n)for(var a=0;a<l.length;)l[a].length>i&&(l[a]=l[a].slice(0,i)),a++;for(var o=Vn(l),s;!(s=o()).done;)for(var c=s.value;c.length<i;)c.push(Wn);return l});function f(){return{dimension:void 0,sheetData:void 0}}function p(e){return e.sheetData.rows}function m(e,t){e.sheetData.rowIndexShift+=e.sheetData.rows.length-t.length,e.sheetData.rows=t}function h(e){return e.sheetData.errors}function g(e,t){e.sheetData.errors=t}function _(e){var t=e.row,n=e.column,r=e.error;throw new Xe(`<c/> at row ${t}, col ${n}: ${r}`)}function v(e){if(d.sheetData){var t=p(d),n=h(d);if(e)l=l.concat(t),u=u.concat(n),u.length>0&&_(u[0]);else if(t.length>1){var r=t.slice(0,-1);l=l.concat(r),u=u.concat(n),m(d,t.slice(-1)),g(d,[])}}}function y(e,t,n){e===`dimension`?n.dimension=S(t.ref):e===`sheetData`?n.sheetData=C():n.sheetData&&w(e,t,n.sheetData)}function b(e,t){t.sheetData&&ee(e,t.sheetData)}function x(e,t){t.sheetData&&T(e,t.sheetData)}function S(e){var t=e.split(`:`).map(Fn);return t.length===1&&(t=[t[0],t[0]]),t}function C(){return{c:void 0,rows:[],row:void 0,rowNumber:void 0,rowIndexShift:0,cursor:[0,0],rowCount:0,columnCount:0,dataRowCount:0,dataColumnCount:0,errors:[]}}function w(e,t,n){e===`row`?(t.r&&(n.rowNumber=Number(t.r)),n.row=[]):e===`c`?(n.c=A(),n.c.attributes=t):n.c&&j(e,t,n.c)}function ee(e,t){if(e===`row`){if(t.rowNumber){var n=t.rowIndexShift+t.rows.length;if(t.rowNumber<=n)throw new Xe(`Out-of-place <row/> number ${t.rowNumber} follows <row/> number ${n}`);for(;t.rowNumber>t.rowIndexShift+t.rows.length+1;)t.rows.push([])}t.rows.push(t.row),t.row.length>0&&(t.dataRowCount=t.rowNumber),t.rowNumber>t.rowCount&&(t.rowCount=t.rowNumber),t.row=void 0,t.rowNumber=void 0}else if(e===`c`){var r=E(t.c);if(r.row<t.cursor[0]||r.row===t.cursor[0]&&r.column<=t.cursor[1])throw new Xe(`Out-of-place <c/> at row ${r.row} col ${r.column} follows <c/> at row ${t.cursor[0]} col ${t.cursor[1]}`);if(t.cursor[0]=r.row,t.cursor[1]=r.column,t.rowNumber||=r.row,r.error)P&&_(r),t.errors.push(r);else if(r.value!==Wn){for(;r.column>t.row.length+1;)t.row.push(Wn);t.row.push(r.value),r.column>t.dataColumnCount&&(t.dataColumnCount=r.column)}r.column>t.columnCount&&(t.columnCount=r.column),t.c=void 0}else t.c&&M(e,t.c)}function T(e,t){t.c&&N(e,t.c)}function E(e){var t=e.attributes,n=e.inlineString,r=e.vText,i=Ln(Fn(t.r),2),a=i[0],o=i[1],l=D(t.t,t.s,r,n,c,s.trim!==!1);return typeof l==`string`?{row:a,column:o,error:l}:{row:a,column:o,value:k(l[1],l[0])}}function D(e,t,n,r,i,a){var o=O(e,t,n,r,i);return Array.isArray(o)&&o[0]===`s`&&(a&&(o[1]=o[1].trim()),o[1]===``)?Nn:o}function O(e,t,n,r,i){var a=Pn(e,t,n,r,i);if(a===`VALUE_MISSING`)switch(e||`n`){case`str`:case`inlineStr`:case`s`:case`b`:return Nn}return e===`e`?Nn:a}function k(e,t){return t===`n`?s.parseNumber?s.parseNumber(e):e:t===`d`?new Date(e):e}function A(){return{v:!1,is:!1,t:!1,r:!1,rPh:!1,vText:void 0,inlineString:void 0,attributes:void 0}}function j(e,t,n){e===`v`?n.v=!0:e===`is`?(n.is=!0,n.inlineString=``):e===`t`?n.t=!0:e===`r`?n.r=!0:e===`rPh`&&(n.rPh=!0)}function M(e,t){e===`v`?(t.v=!1,t.vText||=``):e===`is`?t.is=!1:e===`t`?t.t=!1:e===`r`?t.r=!1:e===`rPh`&&(t.rPh=!1)}function N(e,t){t.v?t.vText=e:t.is&&(t.rPh||t.t&&(t.r?t.inlineString+=e:t.inlineString=e))}var P}function Kn(e){Qt(`convert files to strings`);for(var t={},n=0,r=Object.keys(e);n<r.length;n++){var i=r[n];t[i]=qn(e[i])}return t}function qn(e){return typeof TextDecoder<`u`?new TextDecoder().decode(e):_e(e)}function Jn(e){\"@babel/helpers - typeof\";return Jn=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Jn(e)}function Yn(e){return Jn(e)===`object`&&typeof e.then==`function`}function Xn(e){\"@babel/helpers - typeof\";return Xn=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Xn(e)}function Zn(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,`value`in r&&(r.writable=!0),Object.defineProperty(e,$n(r.key),r)}}function Qn(e,t,n){return t&&Zn(e.prototype,t),n&&Zn(e,n),Object.defineProperty(e,\"prototype\",{writable:!1}),e}function $n(e){var t=er(e,`string`);return Xn(t)===`symbol`?t:String(t)}function er(e,t){if(Xn(e)!==`object`||e===null)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(Xn(r)!==`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function tr(e,t){if(!(e instanceof t))throw TypeError(`Cannot call a class as a function`)}function nr(e,t){if(typeof t!=`function`&&t!==null)throw TypeError(`Super expression must either be null or a function`);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,\"prototype\",{writable:!1}),t&&ur(e,t)}function rr(e){var t=cr();return function(){var n=dr(e),r;if(t){var i=dr(this).constructor;r=Reflect.construct(n,arguments,i)}else r=n.apply(this,arguments);return ir(this,r)}}function ir(e,t){if(t&&(Xn(t)===`object`||typeof t==`function`))return t;if(t!==void 0)throw TypeError(`Derived constructors may only return object or undefined`);return ar(e)}function ar(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function or(e){var t=typeof Map==`function`?/* @__PURE__ */ new Map:void 0;return or=function(e){if(e===null||!lr(e))return e;if(typeof e!=`function`)throw TypeError(`Super expression must either be null or a function`);if(t!==void 0){if(t.has(e))return t.get(e);t.set(e,n)}function n(){return sr(e,arguments,dr(this).constructor)}return n.prototype=Object.create(e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),ur(n,e)},or(e)}function sr(e,t,n){return sr=cr()?Reflect.construct.bind():function(e,t,n){var r=[null];r.push.apply(r,t);var i=new(Function.bind.apply(e,r));return n&&ur(i,n.prototype),i},sr.apply(null,arguments)}function cr(){if(typeof Reflect>`u`||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy==`function`)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}function lr(e){return Function.toString.call(e).indexOf(`[native code]`)!==-1}function ur(e,t){return ur=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},ur(e,t)}function dr(e){return dr=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},dr(e)}var fr=/*#__PURE__*/ function(e){nr(n,e);var t=rr(n);function n(e,r){var i;return tr(this,n),i=t.call(this,`Sheet not found: ${typeof e==`number`?e+`. Sheet count: `+r.length:e+`. Available sheets: `+r.join(`, `)}`),i.name=`SheetNotFoundError`,i.sheet=e,i.sheets=r,i}return Qn(n)}(/*#__PURE__*/ or(Error));function pr(e){\"@babel/helpers - typeof\";return pr=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},pr(e)}function mr(e,t){var n=typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n)return(n=n.call(e)).next.bind(n);if(Array.isArray(e)||(n=hr(e))||t&&e&&typeof e.length==`number`){n&&(e=n);var r=0;return function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}}}throw TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function hr(e,t){if(e){if(typeof e==`string`)return gr(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);if(n===`Object`&&e.constructor&&(n=e.constructor.name),n===`Map`||n===`Set`)return Array.from(e);if(n===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return gr(e,t)}}function gr(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function _r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function vr(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?_r(Object(n),!0).forEach(function(t){yr(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):_r(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function yr(e,t,n){return t=br(t),t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function br(e){var t=xr(e,`string`);return pr(t)===`symbol`?t:String(t)}function xr(e,t){if(pr(e)!==`object`||e===null)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(pr(r)!==`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function Sr(e,t){var n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},r=Kn(t);return Qt(`parse spreadsheet info and file paths`),kr(Er(),r,e).then(function(t){var i=t.spreadsheetInfo,a=t.filePaths;return Qt(`parse \"shared strings\" and \"styles\"`),kr(Dr(a),r,e).then(function(t){var o=t.sharedStrings,s=t.styles,c=n.sheets?n.sheets.map(function(e){return wr(e,i.sheets)}):i.sheets.map(function(e){return e.relationId});return Qt(`parse sheet${c.length===1?``:`s`} data`),kr(Or(a,c,{sharedStrings:o,styles:s,epoch1904:i.epoch1904,dateFormatDetectionCache:[],options:n}),r,e).then(function(e){return Qt(`end`),c.map(function(t){return{sheet:Tr(t,i.sheets),data:e[t]}})})})})}function Cr(e,t,n,r){return r&&r.parseNumber||(r=vr(vr({},r),{},{parseNumber:null})),Sr(t,n,r)}function wr(e,t){if(typeof e==`string`)for(var n=mr(t),r;!(r=n()).done;){var i=r.value;if(i.name===e)return i.relationId}else if(e<=t.length)return t[e-1].relationId;throw new fr(e,t.map(function(e){return e.name}))}function Tr(e,t){for(var n=mr(t),r;!(r=n()).done;){var i=r.value;if(i.relationId===e)return i.name}throw Error(`Sheet relation ID not found: ${e}`)}function Er(){return{\"xl/_rels/workbook.xml.rels\":{name:`filePaths`,parse:rn},\"xl/workbook.xml\":{name:`spreadsheetInfo`,parse:nn}}}function Dr(e){var t={};return yr(t,e.sharedStrings||`xl/sharedStrings.xml`,{name:`sharedStrings`,parse:hn,fallback:Promise.resolve([])}),yr(t,e.styles||`xl/styles.xml`,{name:`styles`,parse:mn,fallback:{}}),t}function Or(e,t,n){return Object.keys(e.sheets).filter(function(e){return t.includes(e)}).reduce(function(t,r){return vr(vr({},t),{},yr({},e.sheets[r],{name:r,parse:function(e,t){return Gn(e,t,n)}}))},{})}function kr(e,t,n){for(var r={},i=function(){var i=o[a],s=e[i];r[s.name]=t[i]===void 0?s.fallback===void 0?function(){throw new Xe(`\"${i}\" file not found inside the \\`.xlsx\\` file`)}():s.fallback:s.parse(t[i],n)},a=0,o=Object.keys(e);a<o.length;a++)i();for(var s=[],c=function(){var e=u[l];Yn(r[e])&&s.push(r[e].then(function(t){r[e]=t}))},l=0,u=Object.keys(r);l<u.length;l++)c();return s.length>0?Promise.all(s).then(function(){return r}):r}var Ar=void 0;function jr(e,t){return en(e).then(function(e){return Cr(Ar,Ze,e,t)})}let Mr=/^([+-]?)(?:(\\d+)(?:\\.(\\d*))?|\\.(\\d+))(?:[eE]([+-]?\\d+))?$/,Nr=10n;function Pr(e){if(e.length>256)throw Error(`Decimal exceeds the supported range.`);let t=Mr.exec(e);if(!t)throw Error(`Enter a finite decimal value.`);let n=Number(t[5]??`0`);if(!Number.isSafeInteger(n)||Math.abs(n)>128)throw Error(`Decimal exponent exceeds the supported range.`);let r=t[3]??t[4]??``;return{coefficient:BigInt(`${t[1]===`-`?`-`:``}${t[2]??`0`}${r}`),scale:r.length-n}}function Fr({coefficient:e,scale:t}){if(e===0n)return`0`;let n=e<0n?`-`:``,r=(e<0n?-e:e).toString();return t<=0?n+r+`0`.repeat(-t):(r=r.padStart(t+1,`0`),(n+r.slice(0,-t)+`.`+r.slice(-t)).replace(/0+$/,``).replace(/\\.$/,``))}function Ir(e){return Fr(Pr(e))}function Lr(e,t){let n=Pr(e),r=Pr(t),i=Math.max(n.scale,r.scale),a=n.coefficient*Nr**BigInt(i-n.scale),o=r.coefficient*Nr**BigInt(i-r.scale);return a<o?-1:+(a>o)}function Rr(e){let t=Ir(e),n=Pr(e);if((n.coefficient<0n?-n.coefficient:n.coefficient).toString().length>34||Lr(t.startsWith(`-`)?t.slice(1):t,`1e30`)>0||n.coefficient!==0n&&Lr(t.startsWith(`-`)?t.slice(1):t,`1e-30`)<0)throw Error(`Financial input exceeds 34 digits or the supported range [1e-30, 1e30].`);return t}let zr={empty:`Enter an amount.`,invalid:`Enter a finite number such as 1,250,000, (1,250,000) or -1,250,000.`,suffix:`Enter the full amount; K, M and B suffixes are not supported.`,exponent:`Enter the full amount without scientific notation.`,grouping:`Use commas only between groups of three digits, such as 1,250,000.`,sign:`Use either a minus sign or parentheses for a negative amount, not both.`,parentheses:`Close the parentheses around a negative amount, such as (58,000).`,percent:`Enter an amount without a percent sign.`,digits:`Use at most 34 significant digits.`,range:`Enter zero or an amount whose magnitude is from 1e-30 to 1e30.`,negative:`Enter zero or a positive amount.`},Br=/^[\\s\xA0  ]+|[\\s\xA0  ]+$/g;function Q(e,t=zr[e]){return{ok:!1,code:e,message:t}}function Vr(e,t={}){let n=e.replace(/−/g,`-`).replace(Br,``);if(!n)return Q(`empty`);if(/%/.test(n))return Q(`percent`);if(/\\d/.test(n)&&/[kmb]{1,2}\\)?$/i.test(n))return Q(`suffix`);if(/\\d/.test(n)&&/e/i.test(n))return Q(`exponent`);if((n.match(/-/g)??[]).length>1||/-\\s*\\(|\\(\\s*-/.test(n))return Q(`sign`);if((n.match(/\\(/g)??[]).length!==(n.match(/\\)/g)??[]).length)return Q(`parentheses`);if((n.match(/\\$/g)??[]).length>(t.currency===!1?0:1))return Q(`invalid`);let r=/^\\$?(\\()?(-)?\\$?(\\d[\\d,]*(?:\\.\\d*)?|\\.\\d+)\\)?$/.exec(n);if(!r)return Q(`invalid`);let[i]=r[3].split(`.`);if(i.includes(`,`)&&!/^\\d{1,3}(?:,\\d{3})+$/.test(i))return Q(`grouping`);let a=!!r[1]||!!r[2],o=r[3].replace(/,/g,``),s=(a?`-`:``)+(o.startsWith(`.`)?`0`+o:o);if(o.replace(`.`,``).replace(/^0+(?=\\d)/,``).length>34)return Q(`digits`);let c;try{c=Rr(s)}catch{return Q(`range`)}return t.allowNegative===!1&&Lr(c,`0`)<0?Q(`negative`):{ok:!0,value:c}}let Hr=`Enter a whole number, such as 120.`;function Ur(e){if(/[$%]/.test(e))return Q(`invalid`,Hr);let t=Vr(e,{currency:!1});return t.ok?/^-?\\d+$/.test(t.value)?t:Q(`invalid`,Hr):Q(t.code,Hr)}function Wr(e,t){let n=typeof t==`string`||typeof t==`number`?String(t):``;if(e.optional&&!n.trim())return null;if(!n.trim())throw Error(`Enter a value for this field.`);if(e.kind===`text`)return n;if(e.kind===`date`){if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(n)||!Number.isFinite(Date.parse(n))||new Date(n).toISOString().slice(0,10)!==n)throw Error(`Enter a valid calendar date, for example 2025-12-31.`);return n}let r=e.kind===`integer`?Ur(n):Vr(n,{currency:e.kind===`money`});if(!r.ok)throw Error(r.message);if(e.min!==void 0&&Lr(r.value,e.min)<0||e.max!==void 0&&Lr(r.value,e.max)>0)throw Error(`Use ${e.min??`the supported minimum`} through ${e.max??`the supported maximum`}.`);if(e.kind!==`integer`)return r.value;let i=Number(r.value);if(!Number.isSafeInteger(i))throw Error(`Enter an exact safe integer.`);return i}let Gr=[{name:`Borrower`,fields:[{label:`Borrower name`,key:`borrower_name`,kind:`text`,helper:`Business name`},{label:`Geography`,key:`geography`,kind:`text`,helper:`Postal code or geography; keep leading zeros`},{label:`Assessment date`,key:`assessment_as_of`,kind:`date`,helper:`Calendar date, YYYY-MM-DD`}],prefix:null,maximum:1},{name:`Financials`,fields:[{label:`Period start`,key:`period_start`,kind:`date`,helper:`First day of a complete fiscal year`},{label:`Period end`,key:`period_end`,kind:`date`,helper:`Last day of the same fiscal year`},{label:`Revenue`,key:`gross_receipts`,kind:`money`,helper:`USD dollars`},{label:`Cost of goods sold`,key:`cogs`,kind:`money`,helper:`USD dollars`},{label:`Operating expense excl. D&A, interest and officer pay`,key:`operating_expense_excl_dna_interest_comp`,kind:`money`,helper:`USD dollars; exclude D&A, interest and officer pay`},{label:`Officer compensation`,key:`officer_compensation`,kind:`money`,helper:`USD dollars`},{label:`Depreciation`,key:`depreciation`,kind:`money`,helper:`USD dollars`},{label:`Amortization`,key:`amortization`,kind:`money`,helper:`USD dollars`},{label:`Interest expense`,key:`interest_expense`,kind:`money`,helper:`USD dollars; zero or positive`,min:`0`},{label:`Section 179 expense`,key:`section_179`,kind:`money`,helper:`USD dollars`},{label:`K-1 distributions`,key:`k1_distribution`,kind:`money`,helper:`USD dollars`}],prefix:`Year`,maximum:10},{name:`Debt and loan`,fields:[{label:`Loan amount`,key:`proposed_loan.amount`,kind:`money`,helper:`USD dollars; zero or positive`,min:`0`},{label:`Annual nominal rate`,key:`proposed_loan.annual_rate`,kind:`rate`,helper:`Decimal fraction 0–1 or a percentage; 0.105 = 10.5%`,min:`0`,max:`1`},{label:`Term months`,key:`proposed_loan.term_months`,kind:`integer`,helper:`Integer from 12 through 12,000`,min:`12`,max:`12000`},{label:`Existing annual principal payments`,key:`existing_debt.cpltd_annual`,kind:`money`,helper:`USD dollars; zero or positive`,min:`0`},{label:`Annual operating lease payments`,key:`existing_debt.operating_lease_annual`,kind:`money`,helper:`USD dollars; zero or positive`,min:`0`}],prefix:null,maximum:1},{name:`Guarantors`,fields:[{label:`Guarantor name`,key:`name`,kind:`text`,helper:`Name`},{label:`Ownership`,key:`ownership_percentage`,kind:`rate`,helper:`Decimal fraction 0–1 or a percentage; 1 = 100%`,min:`0`,max:`1`},{label:`Annual wages`,key:`wages`,kind:`money`,helper:`USD dollars per year`},{label:`Annual interest and dividend income`,key:`interest_dividend_income`,kind:`money`,helper:`USD dollars per year`},{label:`Annual mortgage principal and interest`,key:`mortgage_pi_annual`,kind:`money`,helper:`USD dollars per year; zero or positive`,min:`0`},{label:`Annual auto loan payments`,key:`auto_loan_annual`,kind:`money`,helper:`USD dollars per year; zero or positive`,min:`0`},{label:`Annual credit card minimum payments`,key:`credit_card_min_annual`,kind:`money`,helper:`USD dollars per year; zero or positive`,min:`0`}],prefix:`Guarantor`,maximum:100},{name:`Working capital`,fields:[{label:`Period start`,key:`period_start`,kind:`date`,helper:`Match the latest financial year`},{label:`Period end`,key:`period_end`,kind:`date`,helper:`Match the latest financial year`},{label:`Increase in accounts receivable`,key:`ar_increase`,kind:`money`,helper:`USD dollars; a decrease is negative`},{label:`Increase in inventory`,key:`inventory_increase`,kind:`money`,helper:`USD dollars; a decrease is negative`},{label:`Increase in accounts payable`,key:`ap_increase`,kind:`money`,helper:`USD dollars; a decrease is negative`},{label:`Cash taxes paid`,key:`cash_taxes_paid`,kind:`money`,helper:`USD dollars`}],prefix:null,maximum:1}],Kr=e=>e==null||e===``;function qr(e){let t=``;for(let n=e+1;n>0;n=Math.floor((n-1)/26))t=String.fromCharCode(65+(n-1)%26)+t;return t}function Jr(e){if(e.length!==Gr.length||new Set(e.map(e=>e.sheet)).size!==e.length||e.some(e=>!Gr.some(t=>t.name===e.sheet)))throw Error(`Use the five sheets in the Spreadline Excel template without renaming them.`);let t=[];for(let n of Gr){let r=e.find(e=>e.sheet===n.name).data;if(r[3]?.[1]!==`1`)throw Error(`${n.name}!B4: use template version 1.`);let i=(r[6]??[]).slice();for(;i.length&&Kr(i[i.length-1]);)i.pop();if(i[0]!==`Field`)throw Error(`${n.name}!A7: restore the Field header from the template.`);let a=i.indexOf(`Format`);if(a<2||a!==i.length-1)throw Error(`${n.name}: keep the Format column after the input columns.`);let o=i.slice(1,a);if(o.length>n.maximum||n.prefix===null&&o.length!==1)throw Error(`${n.name}: the number of input columns exceeds the template limit.`);o.forEach((e,t)=>{if(e!==(n.prefix?`${n.prefix} ${t+1}`:`Value`))throw Error(`${n.name}!${qr(t+1)}7: restore the template column heading.`)});let s=/* @__PURE__ */ new Map;for(let e=7;e<r.length;e++){let t=r[e];if(t.every(Kr))continue;let i=t[0];if(typeof i!=`string`||!n.fields.some(e=>e.label===i))throw Error(`${n.name}!A${e+1}: unknown field label. Use the template labels.`);if(s.has(i))throw Error(`${n.name}!A${e+1}: duplicate field label ${i}.`);if(t.slice(a+1).some(e=>!Kr(e)))throw Error(`${n.name}: unexpected data beyond the template columns.`);s.set(i,e)}for(let e of n.fields)if(!s.has(e.label))throw Error(`${n.name}: restore the missing field label ${e.label}.`);let c=o.map((e,t)=>n.fields.some(e=>!Kr(r[s.get(e.label)]?.[t+1]))),l=!1;c.forEach(e=>{if(!e)l=!0;else if(l&&n.prefix)throw Error(`${n.name}: remove empty input columns between populated columns.`)});let u=Math.max(0,c.lastIndexOf(!0));for(let e=0;e<=u;e++)for(let i of n.fields){let a=s.get(i.label),o=r[a]?.[e+1],c=``,l;if(o instanceof Date)!Number.isFinite(o.getTime())||o.getUTCHours()!==0||o.getUTCMinutes()!==0||o.getUTCSeconds()!==0||o.getUTCMilliseconds()!==0?l=`Use a calendar date without a time.`:i.kind===`date`?c=o.toISOString().slice(0,10):l=`This financial cell is formatted as a date. Restore its text format and value.`;else if(typeof o==`string`){if(o.length>2e3)throw Error(`${n.name}!${qr(e+1)}${a+1}: input text exceeds 2,000 characters.`);c=o}else Kr(o)||(l=`Use text or an exact numeric Excel cell, not a boolean or unsupported cell type.`);let u=n.name===`Financials`?`/years/${e}/`:n.name===`Guarantors`?`/guarantors/${e}/`:n.name===`Working capital`?`/working_capital/`:`/`;t.push({...i,pointer:u+i.key.replace(/\\./g,`/`),sheet:n.name,cell:`${qr(e+1)}${a+1}`,group:n.prefix?`${n.prefix} ${e+1}`:n.name,value:c,readError:l})}}return{fields:t}}let Yr=8e6,Xr=2e6,Zr=new TextDecoder(`utf-8`,{fatal:!0});function $(e=`The Excel archive is malformed. Save a fresh .xlsx copy using the template.`){throw Error(e)}let Qr=Uint32Array.from({length:256},(e,t)=>{let n=t;for(let e=0;e<8;e++)n=n&1?3988292384^n>>>1:n>>>1;return n>>>0});function $r(e){e.length>2e6&&$(`Use an .xlsx file no larger than 2 MB (2,000,000 bytes).`),e.length<22&&$(`Use a standard Excel .xlsx archive.`);let t=new DataView(e.buffer,e.byteOffset,e.byteLength);t.getUint32(0,!0)!==67324752&&$(`Use a standard Excel .xlsx file. Legacy .xls and encrypted files are not supported.`);let n=-1;for(let r=e.length-22;r>=Math.max(0,e.length-65557);r--)if(t.getUint32(r,!0)===101010256&&r+22+t.getUint16(r+20,!0)===e.length){n=r;break}n<0&&$();let r=t.getUint16(n+10,!0),i=t.getUint32(n+12,!0),a=t.getUint32(n+16,!0);(r===65535||i===4294967295||a===4294967295)&&$(`ZIP64 archives are unsupported. Save a small template workbook.`),(t.getUint16(n+4,!0)||t.getUint16(n+6,!0)||t.getUint16(n+8,!0)!==r||r<1||r>128||a+i!==n)&&$(`The Excel archive exceeds the entry limit or has an invalid directory.`);let o=/* @__PURE__ */ new Map,s=a,c=0,l=[];for(let i=0;i<r;i++){(s+46>n||t.getUint32(s,!0)!==33639248)&&$();let r=t.getUint16(s+8,!0),i=t.getUint16(s+10,!0),u=t.getUint32(s+20,!0),d=t.getUint32(s+24,!0),f=t.getUint16(s+28,!0),p=t.getUint16(s+30,!0),m=t.getUint16(s+32,!0),h=t.getUint32(s+42,!0);(u===4294967295||d===4294967295||h===4294967295)&&$(`ZIP64 archives are unsupported.`),r&1&&$(`Encrypted workbooks are unsupported. Save an unencrypted template copy.`),(![0,8].includes(i)||s+46+f+p+m>n||h+30>a)&&$();let g=Zr.decode(e.subarray(s+46,s+46+f));(!g||/[\\\\:\\x00]/.test(g)||g.startsWith(`/`)||g.split(`/`).some(e=>[`..`,`.`,`__proto__`,`constructor`,`prototype`].includes(e))||g.includes(`//`)||o.has(g))&&$(`The Excel archive contains a duplicate or invalid part path.`),/vbaProject|externalLinks|embeddings|activeX|\\.bin$/i.test(g)&&$(`Remove macros, external workbook links and embedded objects, then save as .xlsx.`),c+=d,(d>Xr||c>Yr)&&$(`The expanded workbook is too large. Use the small intake template.`),(t.getUint32(h,!0)!==67324752||t.getUint16(h+6,!0)!==r||t.getUint16(h+8,!0)!==i)&&$(`The Excel archive has inconsistent or encrypted headers.`);let _=t.getUint16(h+26,!0),v=t.getUint16(h+28,!0),y=h+30+_+v;(y+u>a||Zr.decode(e.subarray(h+30,h+30+_))!==g)&&$(),r&8||t.getUint32(h+18,!0)===u&&t.getUint32(h+22,!0)===d||$(),l.push([h,y+u]),o.set(g,{size:d,compressed:u,checksum:t.getUint32(s+16,!0),method:i,offset:h}),s+=46+f+p+m}return l.sort((e,t)=>e[0]-t[0]),(s!==n||l.some((e,t)=>t>0&&e[0]<l[t-1][1]))&&$(),o.has(`xl/workbook.xml`)&&o.has(`[Content_Types].xml`)||$(`The archive is not a supported Excel workbook.`),o}function ei(e,t){let n=Object.create(null),r=0,i=/* @__PURE__ */ new Set,a=new De(e=>{let a=t.get(e.name);(!a||i.has(e.name)||a.method!==e.compression)&&$(),i.add(e.name);let o=[],s=0,c=4294967295,l=null,u=t=>{throw l=Error(t),e.terminate(),l};e.ondata=(t,i,d)=>{if(t){if(l)throw l;$(`The Excel archive could not be decompressed. Save a fresh copy.`)}s+=i.length,r+=i.length,(s>a.size||s>Xr||r>Yr)&&u(`The actual expanded workbook exceeds the size limit.`);for(let e of i)c=Qr[(c^e)&255]^c>>>8;if(o.push(i),d){(s!==a.size||(c^4294967295)>>>0!==a.checksum)&&u(`The Excel archive checksum or expanded size is invalid. Save a fresh copy.`);let t=new Uint8Array(s),r=0;for(let e of o)t.set(e,r),r+=e.length;n[e.name]=t}},e.start()});a.register(Ee);for(let t=0;t<e.length;t+=1024)a.push(e.subarray(t,t+1024),t+1024>=e.length);return(i.size!==t.size||Object.keys(n).length!==t.size)&&$(),n}let ti=String.raw`(?:[^\\s<>/:]+:)?`,ni=String.raw`(?:[^\"'<>]|\"[^\"]*\"|'[^']*')*`;function ri(e,t){return e.matchAll(RegExp(`<${ti}${t}(?=[\\\\s/>])${ni}>`,`g`))}function ii(e){let t=Object.create(null);for(let n of e.matchAll(/([^\\s<>=/\"']+)\\s*=\\s*([\"'])(.*?)\\2/gs))Object.prototype.hasOwnProperty.call(t,n[1])&&$(`Duplicate XML attributes are unsupported.`),t[n[1]]=n[3].replace(/&#(x[\\da-f]+|\\d+);|&(amp|quot|apos|lt|gt);/gi,(e,t,n)=>t?String.fromCodePoint(Number(t.startsWith(`x`)?`0`+t:t)):{amp:`&`,quot:`\"`,apos:`'`,lt:`<`,gt:`>`}[n.toLowerCase()]);return t}function ai(e){let t=/^([A-Z]{1,3})([1-9]\\d{0,6})$/.exec(e);t||$(`Invalid worksheet cell coordinates.`);let n=0;for(let e of t[1])n=n*26+e.charCodeAt(0)-64;(n>128||Number(t[2])>256)&&$(`Worksheet dimensions exceed the template limit.`)}function oi(e){let t=0,n=/* @__PURE__ */ new Map;for(let[r,i]of Object.entries(e))if(/\\.xml$|\\.rels$/i.test(r)){let e=Zr.decode(i).replace(/<!--[\\s\\S]*?-->/g,``);if(n.set(r,e),/<!DOCTYPE|<!ENTITY/i.test(e)&&$(`XML document types and entities are unsupported in the intake template.`),/<!\\[CDATA\\[/.test(e)&&$(`Save a fresh .xlsx copy of the Spreadline template using standard Excel values.`),/macroEnabled|vbaProject|oleObject|activeX/i.test(e)&&r===`[Content_Types].xml`&&$(`Use a macro-free .xlsx template workbook.`),r.endsWith(`.rels`)){let t=/* @__PURE__ */ new Set;for(let n of ri(e,`Relationship`)){let e=ii(n[0]);t.has(e.Id)&&$(`Duplicate workbook relationship identifiers are unsupported.`),t.add(e.Id),(e.TargetMode?.toLowerCase()===`external`||/^[a-z]+:/i.test(e.Target??``))&&$(`Remove external workbook links before importing.`)}}if(/^xl\\/worksheets\\/[^/]+\\.xml$/.test(r)){ri(e,`f`).next().done||$(`Formulas are unsupported, including cached results. Copy and paste values before importing.`);for(let t of ri(e,`dimension`))for(let e of(ii(t[0]).ref??``).split(`:`))ai(e);for(let t of ri(e,`row`)){let e=ii(t[0]);e.r!==void 0&&ai(`A`+e.r)}for(let t of ri(e,`col`)){let e=ii(t[0]);(!/^\\d+$/.test(e.min??``)||!/^\\d+$/.test(e.max??``)||Number(e.min)<1||Number(e.max)>128)&&$(`Worksheet column dimensions exceed the template limit.`)}let n=/* @__PURE__ */ new Set;for(let r of ri(e,`c`)){let e=ii(r[0]);ai(e.r??``),n.has(e.r)&&$(`Duplicate worksheet cell coordinates are unsupported.`),n.add(e.r),++t>5e3&&$(`The workbook exceeds the 5,000-cell limit.`),e.t===`e`&&$(`An Excel cell contains an error. Replace errors with reviewed values.`)}}}let r=n.get(`xl/workbook.xml`),i=[...ri(r,`sheet`)],a=i.map(e=>ii(e[0]).name);(a.length!==5||new Set(a).size!==5||a.some(e=>!Gr.some(t=>t.name===e)))&&$(`Use the five sheets in the Spreadline template without renaming them.`),i.some(e=>[`hidden`,`veryHidden`].includes(ii(e[0]).state))&&$(`Unhide the five template sheets before importing.`);let o=new Map([...ri(n.get(`xl/_rels/workbook.xml.rels`)??``,`Relationship`)].map(e=>{let t=ii(e[0]);return[t.Id,t.Target]})),s=i.map(e=>{let t=ii(e[0]),n=Object.entries(t).filter(([e])=>e.endsWith(`:id`));n.length!==1&&$(`The template's worksheet relationship is invalid.`);let r=o.get(n[0][1])??``;return r.startsWith(`/`)?r.slice(1):`xl/`+r});(new Set(s).size!==5||s.some(e=>!/^xl\\/worksheets\\/[^/]+\\.xml$/.test(e)||!n.has(e)))&&$(`Use five distinct worksheets from the Spreadline template.`);let c=ii(ri(r,`workbookPr`).next().value?.[0]??``).date1904;c!==void 0&&![`0`,`1`,`true`,`false`].includes(c)&&$(`The workbook date system is invalid. Save a fresh template copy.`);let l=/* @__PURE__ */ new Map;return s.forEach((e,t)=>{let r=/* @__PURE__ */ new Map;for(let t of n.get(e).matchAll(RegExp(`<${ti}c(?=[\\\\s/>])${ni}(?<!/)>([\\\\s\\\\S]*?)<\\\\/${ti}c>`,`g`))){let e=ri(t[0],`c`).next().value[0],n=ii(e),i=t[1].match(RegExp(`<${ti}v(?=[\\\\s>])${ni}>([^<]*)<\\\\/`))?.[1];i!==void 0&&r.set(n.r,{type:n.t,value:i})}l.set(a[t],r)}),{epoch1904:c===`1`||c===`true`,sheets:l}}function si(e,t){for(let n of e)n.data.forEach((e,r)=>e.forEach((i,a)=>{if(!(i instanceof Date))return;let o=`${qr(a)}${r+1}`,s=t.sheets.get(n.sheet)?.get(o),c=s?.value.trim()??``,l=`${n.sheet}!${o}: use a valid calendar date without a time.`;if(s?.type===`d`){let t=/^(\\d{4}-\\d{2}-\\d{2})(?:T00:00(?::00(?:\\.0+)?)?(?:Z|[+]00:00)?)?$/.exec(c);t||$(l);try{let n=Wr({pointer:``,label:`Date`,kind:`date`},t[1]);e[a]=/* @__PURE__ */ new Date(`${n}T00:00:00Z`)}catch{$(l)}}else{let n=Number(c);try{c&&Number.isSafeInteger(n)&&Lr(c,String(n))===0||$(l)}catch{$(l)}!t.epoch1904&&n===60&&$(`Excel's fictitious 1900-02-29 is not a calendar date. Correct the date cell.`);let r=t.epoch1904?`1904-01-01`:n<60?`1899-12-31`:`1899-12-30`,i=new Date(Date.parse(`${r}T00:00:00Z`)+n*864e5);(!Number.isFinite(i.getTime())||i.getUTCFullYear()<1||i.getUTCFullYear()>9999)&&$(l),e[a]=i}}))}async function ci(e){let t=ei(e,$r(e)),n=oi(t),r=we(t,{level:0}),i;try{i=await jr(r.buffer,{parseNumber:e=>e,trim:!1})}catch{throw Error(`The Excel XML could not be read. Save a fresh .xlsx template copy with values only.`)}return si(i,n),Jr(i)}self.onmessage=async e=>{try{let t=await ci(new Uint8Array(e.data));self.postMessage({review:t})}catch(e){self.postMessage({error:e instanceof Error?e.message:`The workbook could not be read. Use the Spreadline .xlsx template.`})}}})();", Fo = typeof self < "u" && self.Blob && new Blob(["(self.URL || self.webkitURL).revokeObjectURL(self.location.href);", Po], { type: "text/javascript;charset=utf-8" });
function Io(e) {
	let t;
	try {
		if (t = Fo && (self.URL || self.webkitURL).createObjectURL(Fo), !t) throw "";
		let n = new Worker(t, { name: e?.name });
		return n.addEventListener("error", () => {
			(self.URL || self.webkitURL).revokeObjectURL(t);
		}), n;
	} catch {
		return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(Po), { name: e?.name });
	}
}
// src/excel/workbookJob.ts
function Lo(e, t) {
	return new Promise((n, r) => {
		if (t.aborted) {
			r(/* @__PURE__ */ Error("Excel import cancelled."));
			return;
		}
		let i;
		try {
			i = new Io();
		} catch {
			r(/* @__PURE__ */ Error("The browser could not start Excel import. Try again in a supported browser."));
			return;
		}
		let a = !1, o = () => {
			a = !0, clearTimeout(l), t.removeEventListener("abort", c), i.terminate();
		}, s = (e) => {
			a || (o(), r(Error(e)));
		}, c = () => s("Excel import cancelled."), l = setTimeout(() => s("Excel import exceeded its five-second limit. Use a smaller template workbook."), 5e3);
		t.addEventListener("abort", c, { once: !0 }), i.onerror = (e) => {
			e.preventDefault(), s("Excel import failed. Save a fresh .xlsx copy of the template.");
		}, i.onmessageerror = () => s("Excel import returned an unreadable result. Select the workbook again."), i.onmessage = (e) => {
			if (a) return;
			let t = e.data;
			if (!t || typeof t != "object") {
				s("Excel import returned an invalid result.");
				return;
			}
			if ("error" in t) {
				s(typeof t.error == "string" ? t.error : "Excel import failed.");
				return;
			}
			let r = "review" in t ? t.review : null;
			!r || typeof r != "object" || !("fields" in r) || !Array.isArray(r.fields) || !r.fields.length || r.fields.length > 5e3 || !r.fields.every((e) => e && typeof e.pointer == "string" && typeof e.value == "string" && e.value.length <= 2e3 && typeof e.sheet == "string" && typeof e.cell == "string") ? s("Excel import returned invalid fields. Select a template workbook again.") : (o(), n(r));
		}, e.arrayBuffer().then((e) => {
			a || i.postMessage(e, [e]);
		}).catch(() => s("The browser could not read this file. Select it again."));
	});
}
var Ro = [
	{
		name: "Borrower",
		fields: [
			{
				label: "Borrower name",
				key: "borrower_name",
				kind: "text",
				helper: "Business name"
			},
			{
				label: "Geography",
				key: "geography",
				kind: "text",
				helper: "Postal code or geography; keep leading zeros"
			},
			{
				label: "Assessment date",
				key: "assessment_as_of",
				kind: "date",
				helper: "Calendar date, YYYY-MM-DD"
			}
		],
		prefix: null,
		maximum: 1
	},
	{
		name: "Financials",
		fields: [
			{
				label: "Period start",
				key: "period_start",
				kind: "date",
				helper: "First day of a complete fiscal year"
			},
			{
				label: "Period end",
				key: "period_end",
				kind: "date",
				helper: "Last day of the same fiscal year"
			},
			{
				label: "Revenue",
				key: "gross_receipts",
				kind: "money",
				helper: "USD dollars"
			},
			{
				label: "Cost of goods sold",
				key: "cogs",
				kind: "money",
				helper: "USD dollars"
			},
			{
				label: "Operating expense excl. D&A, interest and officer pay",
				key: "operating_expense_excl_dna_interest_comp",
				kind: "money",
				helper: "USD dollars; exclude D&A, interest and officer pay"
			},
			{
				label: "Officer compensation",
				key: "officer_compensation",
				kind: "money",
				helper: "USD dollars"
			},
			{
				label: "Depreciation",
				key: "depreciation",
				kind: "money",
				helper: "USD dollars"
			},
			{
				label: "Amortization",
				key: "amortization",
				kind: "money",
				helper: "USD dollars"
			},
			{
				label: "Interest expense",
				key: "interest_expense",
				kind: "money",
				helper: "USD dollars; zero or positive",
				min: "0"
			},
			{
				label: "Section 179 expense",
				key: "section_179",
				kind: "money",
				helper: "USD dollars"
			},
			{
				label: "K-1 distributions",
				key: "k1_distribution",
				kind: "money",
				helper: "USD dollars"
			}
		],
		prefix: "Year",
		maximum: 10
	},
	{
		name: "Debt and loan",
		fields: [
			{
				label: "Loan amount",
				key: "proposed_loan.amount",
				kind: "money",
				helper: "USD dollars; zero or positive",
				min: "0"
			},
			{
				label: "Annual nominal rate",
				key: "proposed_loan.annual_rate",
				kind: "rate",
				helper: "Decimal fraction 0–1 or a percentage; 0.105 = 10.5%",
				min: "0",
				max: "1"
			},
			{
				label: "Term months",
				key: "proposed_loan.term_months",
				kind: "integer",
				helper: "Integer from 12 through 12,000",
				min: "12",
				max: "12000"
			},
			{
				label: "Existing annual principal payments",
				key: "existing_debt.cpltd_annual",
				kind: "money",
				helper: "USD dollars; zero or positive",
				min: "0"
			},
			{
				label: "Annual operating lease payments",
				key: "existing_debt.operating_lease_annual",
				kind: "money",
				helper: "USD dollars; zero or positive",
				min: "0"
			}
		],
		prefix: null,
		maximum: 1
	},
	{
		name: "Guarantors",
		fields: [
			{
				label: "Guarantor name",
				key: "name",
				kind: "text",
				helper: "Name"
			},
			{
				label: "Ownership",
				key: "ownership_percentage",
				kind: "rate",
				helper: "Decimal fraction 0–1 or a percentage; 1 = 100%",
				min: "0",
				max: "1"
			},
			{
				label: "Annual wages",
				key: "wages",
				kind: "money",
				helper: "USD dollars per year"
			},
			{
				label: "Annual interest and dividend income",
				key: "interest_dividend_income",
				kind: "money",
				helper: "USD dollars per year"
			},
			{
				label: "Annual mortgage principal and interest",
				key: "mortgage_pi_annual",
				kind: "money",
				helper: "USD dollars per year; zero or positive",
				min: "0"
			},
			{
				label: "Annual auto loan payments",
				key: "auto_loan_annual",
				kind: "money",
				helper: "USD dollars per year; zero or positive",
				min: "0"
			},
			{
				label: "Annual credit card minimum payments",
				key: "credit_card_min_annual",
				kind: "money",
				helper: "USD dollars per year; zero or positive",
				min: "0"
			}
		],
		prefix: "Guarantor",
		maximum: 100
	},
	{
		name: "Working capital",
		fields: [
			{
				label: "Period start",
				key: "period_start",
				kind: "date",
				helper: "Match the latest financial year"
			},
			{
				label: "Period end",
				key: "period_end",
				kind: "date",
				helper: "Match the latest financial year"
			},
			{
				label: "Increase in accounts receivable",
				key: "ar_increase",
				kind: "money",
				helper: "USD dollars; a decrease is negative"
			},
			{
				label: "Increase in inventory",
				key: "inventory_increase",
				kind: "money",
				helper: "USD dollars; a decrease is negative"
			},
			{
				label: "Increase in accounts payable",
				key: "ap_increase",
				kind: "money",
				helper: "USD dollars; a decrease is negative"
			},
			{
				label: "Cash taxes paid",
				key: "cash_taxes_paid",
				kind: "money",
				helper: "USD dollars"
			}
		],
		prefix: null,
		maximum: 1
	}
];
// src/excel/workbookModel.ts
function zo(e) {
	if (e.readError) throw Error(e.readError);
	let t = e.value.trim();
	if (t.length > 2e3) throw Error("Use no more than 2,000 characters in an input cell.");
	if (e.kind === "text" || e.kind === "date" || e.kind === "integer") {
		if (e.kind === "date" && t.startsWith("0000-")) throw Error("Use a supported calendar year from 0001 onward.");
		return Hr({
			...e,
			placeholder: void 0
		}, t);
	}
	let n = e.kind === "rate" && t.endsWith("%"), r = n ? t.slice(0, -1).trim() : t, i = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(r) ? ge(r) : Hr({
		...e,
		kind: "money",
		min: void 0,
		max: void 0
	}, r);
	if (n && (i = ge(me(i, -2))), e.min !== void 0 && N(i, e.min) < 0 || e.max !== void 0 && N(i, e.max) > 0) throw Error(`Use ${e.min ?? "the supported minimum"} through ${e.max ?? "the supported maximum"}.`);
	return i;
}
function Bo(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
	for (let t of e.fields) {
		let e = t.sheet + t.group;
		r.set(e, [...r.get(e) ?? [], t]);
	}
	let i = new Set([...r.values()].filter((e) => e[0].sheet === "Guarantors" && e.every((e) => !e.value.trim() && !e.readError)).flatMap((e) => e.map((e) => e.pointer)));
	for (let r of e.fields) if (!i.has(r.pointer)) try {
		n.set(r.pointer, zo(r));
	} catch (e) {
		t.push({
			...r,
			message: e instanceof Error ? e.message : "Review this value."
		});
	}
	let a = (n, r) => {
		let i = e.fields.find((e) => e.pointer === n);
		i && t.push({
			pointer: n,
			sheet: i.sheet,
			cell: i.cell,
			message: r
		});
	}, o;
	for (let e of r.values()) if (e[0].sheet === "Guarantors") {
		if (i.has(e[0].pointer)) o ??= e[0];
		else if (o) {
			a(o.pointer, "Keep populated guarantors together from the first column. Restore this guarantor or move later values into the empty column.");
			break;
		}
	}
	if (t.length) return {
		input: null,
		issues: t
	};
	let s = {
		schema_version: "commercial-assessment-v2",
		units: {
			currency: "USD",
			monetary_unit: "dollars",
			annual_rate_unit: "decimal_nominal"
		},
		years: [],
		guarantors: [],
		proposed_loan: {
			rate_type: "fixed",
			repayment_type: "fully_amortizing",
			payment_frequency: "monthly"
		},
		existing_debt: {},
		working_capital: {}
	};
	for (let [e, t] of n) {
		let n = e.slice(1).split("/"), r = s;
		for (let e of n.slice(0, -1)) r[e] === void 0 && (r[e] = {}), r = r[e];
		r[n[n.length - 1]] = t;
	}
	let c = s;
	for (let e = 0; e < c.years.length; e++) {
		let t = c.years[e], n = /* @__PURE__ */ new Date(`${t.period_start}T00:00:00Z`), r = new Date(n);
		r.setUTCFullYear(n.getUTCFullYear() + 1, n.getUTCMonth(), 0), t.period_start.endsWith("-01") && n.getUTCFullYear() !== 9999 || a(`/years/${e}/period_start`, "Start a complete fiscal year on the first day of a month."), r.toISOString().slice(0, 10) !== t.period_end && a(`/years/${e}/period_end`, "Use twelve complete calendar months for this financial year."), e && t.period_start <= c.years[e - 1].period_end && a(`/years/${e}/period_start`, "List unique, non-overlapping financial years oldest first."), t.period_end > c.assessment_as_of && a(`/years/${e}/period_end`, "The financial year must end on or before the assessment date.");
	}
	let l = c.years[c.years.length - 1];
	for (let e of ["period_start", "period_end"]) c.working_capital[e] !== l[e] && a(`/working_capital/${e}`, "Match the latest financial year's dates.");
	return new TextEncoder().encode(JSON.stringify(c)).length > 1e6 && a("/borrower_name", "The resulting case exceeds the existing request-size limit."), {
		input: t.length ? null : c,
		issues: t
	};
}
// src/excel/templates/spreadline-intake-template-v1.xlsx?url&inline
var Vo = "data:application/octet-stream;base64,UEsDBBQAAAAIAF1bU12Lrs+CLwEAAG4DAAAPAAAAeGwvd29ya2Jvb2sueG1stdM9a8MwEAbgvyK0N7JcxV/ECZTQ0rVL57N0ikX0YSSl8c8vTYtrOnXJdrzD8fBytzvMzpIPjMkE31O+KShBL4My/tTTS9YPDT3sd3N3DfE8hHAms7M+dXNPx5ynjrEkR3SQNmFCPzurQ3SQ0ybEE0tTRFBpRMzOsrIoKubAePq175amZSIeHPb0KcQYrhgpuaWvqqecktgZ1dM3WWotyrapdA2iUJr+WOJ/LEFrI/EY5MWhz9+YiBayCT6NZkqUsL+aZ+PBSwM2rTzl4imxHoZyqOptC6LheHfPEYdMwCtiA/gV6XEhVU3dKjGIBrASXKm7k14uEMHnENcVicXTYlMXNZctrwoB2/tX9B7i2fgTkTCZDHaF2i6oGlox6AoLWXIhgd8BxX4PnP3+zv4TUEsDBBQAAAAIAF1bU13G0A33lwIAAF0WAAANAAAAeGwvc3R5bGVzLnhtbO1YTW+jMBD9K8j3hq+SrKrSbjct0l56aQ97dcCApbGNjNOF/voVNhDSTdrSdLUhai7MjDxv3jD2mMzldcXAeiKypIKHyJ05yCI8FgnlWYjWKj37hq6vLquLUtVAHnJClFUx4OVFFaJcqeLCtss4JwyXM1EQXjFIhWRYlTMhM7ssJMFJ2bgxsD3HmdsMU44aRL5mEVOlFYs1VyHyBkbLPH4mIfIcB1kGcikSEqLvyLL3rHS3V9Z1XZ8xdpYk2sXuQzbuqeCb2HPUmXSqz9YThhC5bhcKM2JMSyyBKtHhdR57PWMBQloyW4UoityFt/Rv/8K8kRTDPsSVWd0Dzz8LuEd0diEG83mwOD+M6s53YH4fpLoT0XGC4OZdVFvBlJ8C9OU/N+WnAM2zwEoRySMKYLXyY12QEHHBSY/YLn7TKZO4dr1gtF8pgCaGV7Yc5uv5/l3gdXgD/0/Cj/xoES1fx28F/SZXQiZEvjjGxthIQFJlaiNplreiEoURVkIpwYycUJwJjqGNvIEYCaY7VYhU3vaZrd1yG9ze3S267IzHK8F7UacaE4CHBv1X2ufr6hhVOmhEumHxXqQArWigWsUEGkJ2IQbonvdR+CrdxNkP4L4DABcF1PdrtiIy0t1Vu2lrJPhQowAb7YcG0/oRUND6DdCMM7IpG+4MzQ2oaNw0jphwRWRXnyp9jbs3Ye7+hLkP9ow3Ne7nX9wP5J4LSZ8FV0P2I/Jpvygn2n222Aenwt7/Yn/4WdDfRKOOwgQOwm+Ji0dSGfAp32ujE9lXEXcSibzrrLjTPCv+6Vfm/3Wx5j/eyPvcPa2dduQJ/ZsCTenaPPKE4M0CtYOHwcxBzyBeDDV6u9WM1UJ031CH7dHCcIRRanUzKL76A1BLAwQUAAAACABdW1Nd+lwBWQMDAADaDQAAEwAAAHhsL3RoZW1lL3RoZW1lMS54bWy9V9tymzAU/BVG7w03c/OEZBLHbh/SaafJD8ggQI0QHkmOnb/vIG4CjOM0duwHS2LP2UXnsMLXt/ucaK+IcVzQEJhXBtAQjYoY0zQEW5F888HtzTWciwzlSKMwRyFYZFB8//0MtH1OKJ/DEGRCbOa6zqMM5ZBfFRtE9zlJCpZDwa8KluoxgztM05zolmG4eg4xBW3eJUE5ooKXCxFhT9EBsvJa/GKWP/yNLwjTXiEJwQ7TuNg9o70AGoFcLAgLgSE/QNNvrvU2ioiJYCVwJT9NYB0Rv1gykKXrNtJYWv7M7BgkgogxcOmX3y6jRMAoQrSWo4JNxzV8qwErqGp4IHvgmfYgQGGwxwyBe2/N+gESVQ1n4xtdBcsHpx8gUdXQGQXcGdZ9YPcDJKoauqOA2fLOs5b9AInKCKYvY7jr+b7bwFtMUpAfB/GB6xreQ4PvYLrSalUCKnqN9ytJcIRk3+Xwb8FWBRWyylBgqom3DUpgVDYoJHjNsPaI00xIHjhH8B1AxI8C9AFnjum7Ao5QHyFt6ToGXd0MuTW5mHwkE0zIk3gj6JFLcbwgOF5hQuRERrWl2GQLwhrCHjBlsBvzOlXKtU3BQ2CAyVzSQTAV1ZrrNU89nJNt/rOI66Y3WzuAcw5Fd8FwFJ9oGeQs5aqGEneyDs+e0NHRDXXYJ+qQd3KyEN/8sJDgqBBdKQ/BVIPlKeHMarvlESQoLgtWJ+iV9SwlDmZTd2R9dmtPKDHPYIyavMaUkqlm67rwDEVWpHj+YSVBMCGk3KpLFFkf2wGh/Zm2K/m95u7+yyw2jIsHyLMKJy+15ytVaALD+QIaq9yZy9Howz1ESYIiMbHSTR+5qLMcvPxZdDkptgKxpyzeaWuyZX9gHALHMx0DaDHmoimAFmPWtc/4/aJbh2STwdrJew9thZfjllMRK+UMpffnteJ1ujrLcfV+1MC1puzWm34SL3A+Bsq5pPhH4H/UUyurPPexqepQ5U0arT0hz76Q0XZd+XWGOmzZ0mOb1zE5G/yBalZu/gFQSwMEFAAAAAgAXVtTXQ0euehlAAAAcwAAABQAAAB4bC9zaGFyZWRTdHJpbmdzLnhtbAXBUQrDIAwA0KtI/mfcPsaQ2p5F2rQKJhaTDY+/95ZtcnM/Glq7JHj6AI5k70eVK8HXzscHtnWZUdXc5CYaZ4JidkdE3QtxVt9vksnt7IOzqe/jQr0H5UMLkXHDVwhv5FwFHK5/UEsDBBQAAAAIAF1bU10iSegT8QIAAJwJAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1slVZhb9owEP0rJ39eE0ggFNZQtUXtpq1Sta6d+GiSg1g4dmQ7QPfrJxtCCxjKPhFf/N69d5x9ubpelRwWqDSTIiXtoEUARSZzJmYpqc304pJcD69Wg6VUc10gGliVXOjBKiWFMdUgDHVWYEl1ICsUq5JPpSqp0YFUs1BXCmnuYCUPo1YrCUvKBLGELvrKcKl3VqALuXxQLP/JBOqUtAjY1BMp5/b199yFwuFV6KW4d9mfFOQ4pTU3v+TyG7JZYVLS7jrcapBJ7gCZ5FAy65pASVfud8lyU6Qk6RAoWJ6jcOmyWhtZ/lm/a7/TrOHRBh5t4XH0H/B4A4+38G7yGTx8d+Fsj6ihdqHkEpTbZB1HSQPe1sCVPrN7btoEtBMdbmO3ntjdx1joUnzIZI2ateHjmSLHEBMwKdFGuTeL4bNrDs4EQibLElXGKAcmDJ2jTbRY23wXF3nERafExeeUIXYMnT1x94xzmPAagYmqNjqAH4gVTBnyHDidINcBvGiEBeU16i8gpAHb+jWnOvDKjz3y41PyO+fI7zQMO/J/Y1lxarA52V5Bfmjbt/euc0po9xyhXW+dbQn1mzAFGpZBTg0FKfhbACNqUEOtEcbj8fji8fFiNPLXteupa/eU3OQcucmRthBUbPrUtgVQhWBwZcBIqBRqVAu0DxmzZV+3yMvzCHLJOVVHOiPxOEhOOehtTl3rlIOeY+gdOECee1X497/a/va2xBF+dwHvAA7kX57zB1w6+vZ+e95KpeQSFQha+q+JDbC3U85NcP8Ouq21HTP6kO1AdP8c0X2/6AeUM0Wr4s0ruO8T3PcLfpLaUA6ZzBGkgllD/BXm9n7iSO3khr+opD7tp906a0i01jr2D8KN1qh1icLYQ+v/Ixpsf3ecbKLJHuMd5Shyqhzflw+n/hMb580677DzTjvfuGu+NZoxW9EZPlI1Y0IDx6lJSSvoEVDrxO7ZyMo9dQlMpDGybFYF0hyVXcUEplKa7WKdcPuhNfwHUEsDBBQAAAAIAF1bU12OY5sjPAQAABcSAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDIueG1snZhdU9s4FIb/yhld7BXNh/NFKKZD8Xa3U3aWgbY7eyns40RTWfJISmL49R0pdiBwYkyuYr3Re3Qefdvnn6pCwhqNFVrFbNgbMECV6kyoRcxWLv9wyj5dnFdnG21+2SWig6qQyp5VMVs6V571+zZdYsFtT5eoqkLm2hTc2Z42i74tDfIs2ArZjwaDab/gQjEfMKg/BW7sXgnsUm/+MiK7FgptzAYMfNP3Wv/yf3/NvOQdJVcI1V0phYvZkMFD/Thj4HR5jbm7Qilj9vmUAU+dWOMNVxize+2cLm7FYukYWMcdxiw3+hEVg/7Fef9ZLvulpzy/BMQbAxnmfCXdrd78jT5gzIaTEKU6S7UMhlRLKITvWgYFr8LvRmRuGbPpmMFSZBmqgJmurNPFf9v/hk9htvaotkc7+yh6h31U20fH2ce1fbyzT6Zv2ftPnRB6LeGO+4LRGzChku+waNqYd10Yhjf1dS6HDGxg7u+0z4R2RWjJc60fmn3Wuod320443HoUIowYuJhZZ8I/64svQnGVCi6tD7vegj6lFxHpEVoStaU36tI5oxBh/Co9KeFerhCEKlfO9uAbYgm5QJmB5PcobQ9+WIQ1lyu0J6C0A79oV5LbHok0IpAILRm1IY27II2bCHtI37EoJXfY7FNkkrR1SNW9GhPJj9uSn3RJfkKOx2WWQaqLUqJDyIVNuYQH5MaegJYZWge5MNb14E/l0ACu0TwAL/RKOXo0JsRoEFoyaQOadgGaHphg9fyvJxhwg+CwcuA0lAYtmjX6h1T4wdpOth93CWRaSm4OzLEpQUVoybSNalav6kEb1SxEmL2iQpmRmdH1/0dugJ5dLYaIMiQHMgqnzJ7hFfBpl2E8DeGHL5fGDRqhM38EGkeCb33R7jAIcJSY1C283imNdZDxB9A5cHIVtOPNu+DNW/FQ0aM6p+AoMZnTcNf8ic0tESwv3kE2HHQ6/gY02y2uUa2QBGs8+2SkmjTqS7Znq/UNjG6n+JDGuNLW+e5baJ1ZsPrAAmzsL4goNWnU44nqm8G49Wbga1FE/5ZouBNqAViVqCwCVqnsQfIHL8qPlycg/CbvN32uMtB5LlI0UPIHGjwiwSk1adQW8I8hmVWG70zndR91up74WmQf1c347QCV5e7Qid4EeIFPqUmjHj/une4nvhbFlGA471pYxiQLpSaNejxLp+uKr0WxXBbaOPHYwjIhWSg1adTjWTrdVHwtiuVrM7/r5UjzTEkeSk0atXWZPaLRoA2U2gr/4vkG4awT4YwmvMPUDxQMZ/N2yBkJSalJox4/aJ3uJb6Wb+blBfPbhyFkwjoj7leejX7PatyTfSBKTRp1ejTQvBNQfX/Yf10lxCtKTPbEJoXmC0Tz9lzyBf7DzUIoCxJzF7NBb8bAbLMJz06X4WnCYPuxoyktkWdofGnEINfa7QrbBnffeC5+A1BLAwQUAAAACABdW1NdMlCK3UgDAABrCwAAGAAAAHhsL3dvcmtzaGVldHMvc2hlZXQzLnhtbK2W227cNhCGX2VAoHeJjqv1IZaD2G7aoClQtEl6zZVmJSI8CCS1q/Sq79A37JMUpKS116bXKpCrFUf6Z/5vNEvq6u0gOOxQG6ZkSdIoIYCyUjWTTUl6u319Tt5eXw2Xe6W/mhbRwiC4NJdDSVpru8s4NlWLgppIdSgHwbdKC2pNpHQTm04jrb1M8DhLknUsKJPEJfTRLwz35mgFplX7nzSrPzKJpiQJAVd6o9RXd/tD7UPx9VUcTPHeV/9NQ41b2nP7u9r/jKxpbUnSwuuGy0pxL6gUB8EcNQFBB/+7Z7VtS7JeEWhZXaP05areWCX+HO+l92lGeTbJs4M8z/6HPJ/k+UFerF+Sx/cUHvuOWuoWWu1B+4cccbaexYce+NZX7pl3KQHjTceH2E0gdvswFvsSDyo5UDsCP18p8xlyArYkxmp/Z3d9hxsLVNbAFZUu827kuneTBdxkp9zkS7hzn2H1yM17xjlseI/AZNdbE8EviB1sGfIaON0gNxF8Ngg7yns0r0AqC27We05NFLSfB+znp+yvlthfzRmO7H9C0XFqcf4rBw2FpWno2dvVKaPFEqNFsM+uhVTKnnLo6DeB0ho/BBT2reL4WvZig9rPBFjUItzaItDa4pTj9RLH62cmQ1JZMcqnyQCqESwOFqyCTqNBvUN3UTHX+XFKPv9xB7XinOpnhmMdIFifIjib/mnJKYIzn+HsCQHyOugi/PwXN+LBqXgmv990jwRP7J8veQHnPn36eEI/umGgQvXSBikm2WFn9Van4ONd58GLeQN/oVagNHTKMMt2eBrhYgnCRRjh3TjyUgkmKQdNbbDBNxchlCn4dAOtmKActppWlikJyb9//5M6Hgod6gqlpQ2+gSRKkwJKSJOo+OE0YposOjmSMOQn1AKEkrY1QbhZd0w3Rx/jfZAWG9Sw1UpAmoFtteqbFtLsVZIkL3AsOwHTMMePAzOWyeawUWkmK9Y92LLCeGkQL/3ug+gML6Abj8p0FR5F1aGmnpIjNfgC2pSrOEabouvviJYvQgscrTeh4O1RcK42fzrOX00dbfBXqhsmDXDc2pIk0RkBPRb211Z1/qogsFHWKjGvWqQ1arfKCWyVsofFWPDw3Xz9H1BLAwQUAAAACABdW1NdOvd2C2sDAAARDQAAGAAAAHhsL3dvcmtzaGVldHMvc2hlZXQ0LnhtbLWX23LbNhCGX2UHM71rxZMOtmM6k9iTtNOk7bRNcr0iVyTGIMABQEnpVd4hb5gn6QASZUuGaHamuTKxxL/7f2scqOuX20bAmrThSuYsmcQMSBaq5LLKWWdXP12wlzfX26uN0vemJrKwbYQ0V9uc1da2V1FkipoaNBPVktw2YqV0g9ZMlK4i02rC0ssaEaVxPI8a5JK5hD76kdPGHI3A1GrzVvPyHZdkchYzcKWXSt2717+UPhTdXEfBFG989T80lLTCTtg/1eZn4lVtc5bMvG57VSjhBYUS0HBHzaDBrf+74aWtczafMqh5WZL05YrOWNV82r1LHtLs5Olenh7kWfof5Nlenh3ks/lz8uiBwmPfoUU30GoD2k9yxOm8Fx964FtfuDmvEgbGm44OsdeB2O3jWORLPKrkQO0O+Hyl1GfIGNicGav9m/XN2w41Squ0cWnXO6gHK2nASjpkJRsDnfkM0xMrb7gQsBQdAZdtZ80EfiVqYcVJlCBwScJM4IMhWKPoyPwIUllwC70TaCZB+1nAfjZkfzrG/rTPcGT/b2pagZb6fRw0FJYmobm30yGjszFGZ8E+vyNcE6AQ+z7DUqC8h01NEmxNmgA1gVRQHdZGuLuzQHdnQ6bnY0zPzywOibLgeDDtPFraWrAKWk2G9JrcQ8Fd83cL5cNfd1AqIfAcwTxAMB8iWOx3WjxEsPAZFk8ISJRBF+H5h50J4eVxpoo/eo8ETyAuxvwbLnz6JD3rSmJDQZy9cnHU1X3w9Pj57TTJE7OXY8xehs3+vpGkTc3boM+9KDnyeRn2eUcFb1DASmNhuZIQf/vyNQGlAaElXZC0WNELSCCHJI5/GGZK4lFXQxymeiVlhwI2WFH40O6Fx2R99BTt0SZxKPCZUD9jf9zNlgza59KSJmMBZQklX/OSZAlcFurMsurznVAl/xtVOooqHaRqlLYVVu4k4rLgLQrP18OGwdIgWDoe7AX8Q1q51dgqwy1fP7OnXNIRqNkgKnZWgVAoocXPDUl7ZjFmQbrsO9KNusTdLOdgGqYrNJXcQoG6dB+IvOmaZzj3+WbHnPvo/HtwzkZxBm7p16Hg7VGwr9Z/4Pffti1W9B51xaUBQSubs3iyYKB3hf2zVa1/mjFYKmtV049qwpK0G2UMVkrZw2BX8PDr5uZfUEsDBBQAAAAIAF1bU102q1IHHwMAACIMAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDUueG1stZZNb9s4EIb/yoCXXnYtS7KVj41TbFN0W7QFit1te6bFsUWEIgVybCv/viBlObFDK+ohJ4lDzsz7kMOPm7dtrWCL1kmjFyydTBmgLo2Qer1gG1r9ecne3t601ztj712FSNDWSrvrdsEqouY6SVxZYc3dxDSo21qtjK05uYmx68Q1FrkIbrVKsum0SGouNfMBg/WHxJ07aoGrzO4fK8UXqdEt2JSBT7005t53fxLBlNzeJNEQH0L2bxYErvhG0b9m9xHluqIFS+fBr70ujQoOpVFQS0/NoOZt+O6koGrBihmDSgqBOqQrN45M/bPrSx/DdO7Z3j07uOfZb7jne/f84D4vXnJPHikC9ntO3Des2YENgzxxVvTOhzkIU1/6MX+nDFwQnRxs7yK2u6e2JKR4ksmDUgd8PlMWIuQMaMEc2dCzvf1p7L3Uayh5I4krH3vbkT3qySJ6siE9+RjyPESYnej5IJWCpdogSN1syE3gM2IDK4lKgOJLVG4C3x3ClqsNuj9AGwJf7RvF3SQqP4/Iz4fkz8bIn/URjuT/j3WjOGG/maOC4q5pbOzdbEjofIzQeXSe/RRSheDFOoKV1FyXkit4QG7fOHDELQHXAlALEH5UfHbnkdmdD4kuxoguzhRHr7IrDuAWgbAlIAONRYd2i/6nlH7yu0L5/t97EEYpbs8QFBGCYojgYr/dpkMEFyHCxTMCVCKqIj7+h6/yaGGciR9O3iOHZ/IvxyzAZQifnhbpN7TSiK46ohidX3Y4X4PWfbDTs+crp7I6X4XDFFdjKK4GKVDHl+IqxnD1CgzpdNQVMY1TfNKlRe78SQm8LM1GkwOLJcotX6po1bzrYx2z9dZTuCdb5y/gILBP6EDjmpPc4guA4+7A9GVAqbeoydiHOFYaxUpfCysbhZX9xro1/OH8omVRuuy16EZd336UT396Rt9xVwHxFj2TjG+w3nd+DLS3FueBboaFj7q4/ajnT66I8e7I2GfrX7z9Y6/ha/zK7VpqBwpXtGDTyQUD2yUO/2Sa8DdnsDREpu5bFXKB1rdyBitj6NDoEh6e+7e/AFBLAwQUAAAAAABdW1NdS5ZZWigBAAAoAQAACwAAAF9yZWxzLy5yZWxz77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48UmVsYXRpb25zaGlwcyB4bWxucz0iaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL3BhY2thZ2UvMjAwNi9yZWxhdGlvbnNoaXBzIj48UmVsYXRpb25zaGlwIFR5cGU9Imh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9vZmZpY2VEb2N1bWVudC8yMDA2L3JlbGF0aW9uc2hpcHMvb2ZmaWNlRG9jdW1lbnQiIFRhcmdldD0iL3hsL3dvcmtib29rLnhtbCIgSWQ9IlJlZDJlN2VjMDIyZGE0Y2NiIiAvPjwvUmVsYXRpb25zaGlwcz5QSwMEFAAAAAgAXVtTXZNtbzpQAQAAbgUAABoAAAB4bC9fcmVscy93b3JrYm9vay54bWwucmVsc83UP27DIBQG8KtY7A2GYsBVnCxduqa5AOCHbcUYy5DWOVuHHqlXqPpHFa46dInkheFD+vTjSY+3l9ftfnZ99gRT6PxQIbLJUQaD8XU3NBU6R3sj0X63PUCvYueH0HZjyGbXD6FCbYzjHcbBtOBU2PgRhtn11k9OxbDxU4NHZU6qAUzznOMp7UDLzux4GeE/jd7azsC9N2cHQ/yjGId46SGg7KimBmKF8Nx/Z5vZ9Sh7qCt00KpkXDKuteZM6xxl+Gqg2IKDpecz+jpJohLGgpRcqIJbpoFfUxVaNUH9GKduaH5PK71KecqwgiptypqzQtBr8p79dAotQFzSfuKPBwDEdHqGWstoKbkViuW1XQGPJjwKQmuquShKxSSBFfBuEx6XoqyZZlIBZ6SuV8BjCa8EKXJBTEl4zlSxhukVi9UombYcckMJM4p88vDi19y9A1BLAwQUAAAACABdW1Nd3zOGgycBAAB3BQAAEwAAAFtDb250ZW50X1R5cGVzXS54bWzNlM9KAzEQh19lyVWadOsfRLrtQb2qoC8QsrO7ockkZKbr9tk8+Ei+gjSVIiIsxQq9ZC6T3/f9LvPx9j5fDt4VPSSyAStRyqkoAE2oLbaVWHMzuRbLxfxlE4GKwTukSnTM8UYpMh14TTJEwMG7JiSvmWRIrYrarHQLajadXikTkAF5wtsMsZjfQaPXjov7gQF32ME7Udzu9raoSugYnTWabUDVY/0DMglNYw3Uwaw9IEuKCXRNHQB7J/OUXls8y8HqV2YCR4dBv1rJBC7vUGcj7RGPPaRkayiedOIH7aESanCKeOOA5JEb5tAxNHfgYfeWfxbIMaNlO52gfuZksT165+/ZYyKvIa3yR1J5lEeW2ecfKjI7FZHzUxG5OBWRy38XUfmMLj4BUEsBAhQDFAAAAAgAXVtTXYuuz4IvAQAAbgMAAA8AAAAAAAAAAAAAAKSBAAAAAHhsL3dvcmtib29rLnhtbFBLAQIUAxQAAAAIAF1bU13G0A33lwIAAF0WAAANAAAAAAAAAAAAAACkgVwBAAB4bC9zdHlsZXMueG1sUEsBAhQDFAAAAAgAXVtTXfpcAVkDAwAA2g0AABMAAAAAAAAAAAAAAKSBHgQAAHhsL3RoZW1lL3RoZW1lMS54bWxQSwECFAMUAAAACABdW1NdDR656GUAAABzAAAAFAAAAAAAAAAAAAAApIFSBwAAeGwvc2hhcmVkU3RyaW5ncy54bWxQSwECFAMUAAAACABdW1NdIknoE/ECAACcCQAAGAAAAAAAAAAAAAAApIHpBwAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1sUEsBAhQDFAAAAAgAXVtTXY5jmyM8BAAAFxIAABgAAAAAAAAAAAAAAKSBEAsAAHhsL3dvcmtzaGVldHMvc2hlZXQyLnhtbFBLAQIUAxQAAAAIAF1bU10yUIrdSAMAAGsLAAAYAAAAAAAAAAAAAACkgYIPAAB4bC93b3Jrc2hlZXRzL3NoZWV0My54bWxQSwECFAMUAAAACABdW1NdOvd2C2sDAAARDQAAGAAAAAAAAAAAAAAApIEAEwAAeGwvd29ya3NoZWV0cy9zaGVldDQueG1sUEsBAhQDFAAAAAgAXVtTXTarUgcfAwAAIgwAABgAAAAAAAAAAAAAAKSBoRYAAHhsL3dvcmtzaGVldHMvc2hlZXQ1LnhtbFBLAQIUAxQAAAAAAF1bU11LlllaKAEAACgBAAALAAAAAAAAAAAAAACkgfYZAABfcmVscy8ucmVsc1BLAQIUAxQAAAAIAF1bU12TbW86UAEAAG4FAAAaAAAAAAAAAAAAAACkgUcbAAB4bC9fcmVscy93b3JrYm9vay54bWwucmVsc1BLAQIUAxQAAAAIAF1bU13fM4aDJwEAAHcFAAATAAAAAAAAAAAAAACkgc8cAABbQ29udGVudF9UeXBlc10ueG1sUEsFBgAAAAAMAAwAGwMAACceAAAAAA==", Ho = "data:application/octet-stream;base64,UEsDBBQAAAAIAF1bU10UOYyWMAEAAG4DAAAPAAAAeGwvd29ya2Jvb2sueG1stdPLasMwEAXQXxHaN/JDfsTECZTQ0m03XY/kUSyih5GUxp9fmhbHdNVNdsNdDIfLzO4wW0M+MUTtXU/zTUYJOukH7U49vST11NLDfjd3Vx/Owvszma1xsZt7OqY0dYxFOaKFuPETutka5YOFFDc+nFicAsIQR8RkDSuyrGYWtKPf+25pXCbiwGJPn30I/oqBklv6NvQ0pyR0eujpO9ai3JaYSYWSFwD01xL+Y/FKaYlHLy8WXfrBBDSQtHdx1FOkhP3VvGgHTmowceUpFo9QVVk3BW5Fo3gp8OGeI4pEwA3EeHArUrmQCtFk7TAUIBvk21Y9nPR6gQAu+bCuiC8enud5zatKtk3LgdcP93z4cNbuRCRMOoFZoaoFVUOeq6wQKGrgvJEPQLH7gbP77+y/AFBLAwQUAAAACABdW1NdxtAN95cCAABdFgAADQAAAHhsL3N0eWxlcy54bWztWE1vozAQ/SvI94avkqyq0m43LdJeemkPe3XAgKWxjYzThf76FTYQ0k3a0nS1IWouzIw8b94w9pjM5XXFwHoisqSCh8idOcgiPBYJ5VmI1io9+4aury6ri1LVQB5yQpRVMeDlRRWiXKniwrbLOCcMlzNREF4xSIVkWJUzITO7LCTBSdm4MbA9x5nbDFOOGkS+ZhFTpRWLNVch8gZGyzx+JiHyHAdZBnIpEhKi78iy96x0t1fWdV2fMXaWJNrF7kM27qngm9hz1Jl0qs/WE4YQuW4XCjNiTEssgSrR4XUeez1jAUJaMluFKIrchbf0b//CvJEUwz7ElVndA88/C7hHdHYhBvN5sDg/jOrOd2B+H6S6E9FxguDmXVRbwZSfAvTlPzflpwDNs8BKEckjCmC18mNdkBBxwUmP2C5+0ymTuHa9YLRfKYAmhle2HObr+f5d4HV4A/9Pwo/8aBEtX8dvBf0mV0ImRL44xsbYSEBSZWojaZa3ohKFEVZCKcGMnFCcCY6hjbyBGAmmO1WIVN72ma3dchvc3t0tuuyMxyvBe1GnGhOAhwb9V9rn6+oYVTpoRLph8V6kAK1ooFrFBBpCdiEG6J73Ufgq3cTZD+C+AwAXBdT3a7YiMtLdVbtpayT4UKMAG+2HBtP6EVDQ+g3QjDOyKRvuDM0NqGjcNI6YcEVkV58qfY27N2Hu/oS5D/aMNzXu51/cD+SeC0mfBVdD9iPyab8oJ9p9ttgHp8Le/2J/+FnQ30SjjsIEDsJviYtHUhnwKd9roxPZVxF3Eom866y40zwr/ulX5v91seY/3sj73D2tnXbkCf2bAk3p2jzyhODNArWDh8HMQc8gXgw1ervVjNVCdN9Qh+3RwnCEUWp1Myi++gNQSwMEFAAAAAgAXVtTXfpcAVkDAwAA2g0AABMAAAB4bC90aGVtZS90aGVtZTEueG1svVfbcpswFPwVRu8NN3PzhGQSx24f0mmnyQ/IIECNEB5Jjp2/7yBuAozjNHbsB0tiz9lF57DC17f7nGiviHFc0BCYVwbQEI2KGNM0BFuRfPPB7c01nIsM5UijMEchWGRQfP/9DLR9TiifwxBkQmzmus6jDOWQXxUbRPc5SQqWQ8GvCpbqMYM7TNOc6JZhuHoOMQVt3iVBOaKClwsRYU/RAbLyWvxilj/8jS8I014hCcEO07jYPaO9ABqBXCwIC4EhP0DTb671NoqIiWAlcCU/TWAdEb9YMpCl6zbSWFr+zOwYJIKIMXDpl98uo0TAKEK0lqOCTcc1fKsBK6hqeCB74Jn2IEBhsMcMgXtvzfoBElUNZ+MbXQXLB6cfIFHV0BkF3BnWfWD3AySqGrqjgNnyzrOW/QCJygimL2O46/m+28BbTFKQHwfxgesa3kOD72C60mpVAip6jfcrSXCEZN/l8G/BVgUVsspQYKqJtw1KYFQ2KCR4zbD2iNNMSB44R/AdQMSPAvQBZ47puwKOUB8hbek6Bl3dDLk1uZh8JBNMyJN4I+iRS3G8IDheYULkREa1pdhkC8Iawh4wZbAb8zpVyrVNwUNggMlc0kEwFdWa6zVPPZyTbf6ziOumN1s7gHMORXfBcBSfaBnkLOWqhhJ3sg7PntDR0Q112CfqkHdyshDf/LCQ4KgQXSkPwVSD5SnhzGq75REkKC4LVifolfUsJQ5mU3dkfXZrTygxz2CMmrzGlJKpZuu68AxFVqR4/mElQTAhpNyqSxRZH9sBof2Ztiv5vebu/sssNoyLB8izCicvtecrVWgCw/kCGqvcmcvR6MM9REmCIjGx0k0fuaizHLz8WXQ5KbYCsacs3mlrsmV/YBwCxzMdA2gx5qIpgBZj1rXP+P2iW4dkk8HayXsPbYWX45ZTESvlDKX357Xidbo6y3H1ftTAtabs1pt+Ei9wPgbKuaT4R+B/1FMrqzz3sanqUOVNGq09Ic++kNF2Xfl1hjps2dJjm9cxORv8gWpWbv4BUEsDBBQAAAAIAF1bU10NHrnoZQAAAHMAAAAUAAAAeGwvc2hhcmVkU3RyaW5ncy54bWwFwVEKwyAMANCrSP5n3D7GkNqeRdq0CiYWkw2Pv/eWbXJzPxpauyR4+gCOZO9HlSvB187HB7Z1mVHV3OQmGmeCYnZHRN0LcVbfb5LJ7eyDs6nv40K9B+VDC5Fxw1cIb+RcBRyuf1BLAwQUAAAACABdW1Ndud4EQRoDAAAOCgAAGAAAAHhsL3dvcmtzaGVldHMvc2hlZXQxLnhtbJVWa2/aMBT9K1f+PBKTQFpYadUWtZu2StX6mLpvJrkQq44d2Q7Q/frJhtCWGsokJOLHueecm2vfnJwtKwFz1IYrOSLdiBJAmauCy9mINHbaOSZnpyfL4ULpZ1MiWlhWQprhckRKa+thHJu8xIqZSNUol5WYKl0xayKlZ7GpNbLCwyoRJ5RmccW4JC6gn33kuDDvRmBKtbjWvPjJJZoRoQQc9USpZ7f8vfBT8elJHAxx5dlvNRQ4ZY2wv9TiG/JZaUek2/e45TBXwgNyJaDizjWBii39/4IXthyRrEeg5EWB0tPljbGq+r1a676GWcGTNTzZwNPkP+DpGp5u4P3sM3j86sLbHjPL3ECrBWi/yTlOsha8yYFPfe72nHcJGC863sxdBOYu387FnuINkzNqV4Z3MyU+QkrAjoix2q/MT+98cQguEXJVVahzzgRwadkzOqL5yuaruCQgLtknLj0kDamP0NsSd8WFgIloELisG2si+IFYw5SjKECwCQoTwYNBmDPRoPkCUllwpd8IZqKg/DQgP90nv3eI/F4b4Z38e6xqwSy2JzsoKAzthvZe9vYJ7R8itB/Ms0uheZG2RMtzKJhloKR4iWDMLBpoDMLT09NT5+amMx6H89oP5LW/T252iNxsR1lIJtd16soCmEawuLRgFdQaDeo5uoecu7SvSuThbgyFEoLpHZWRBRxk+xwcrU8d3efgyEc4+uAARRFUEd7/6Oo7WBI74vsL+B3gg/zjQ17AsQ/f3S7PC6W1WqAGyarwNbEGbgs7F7W7aq7YRPOc2R2H4nKN3r6sLhrj+pH5SPvB3eAQd4Owu2tUM83q8iXobBB2ltGMhk/tIGzmVhnLBOSqQFAaZi3pV3h2l5xA5to//EWtzH6vXXpQp6ErHdun6dwYNKZCad3JD7/NFjvw2GKNTGiSdbq0Q7N7Sof+F1FK/wSz0IbItugvmUBZMO3Jv7y5Zz7xfFh3DbbXYH8NNdj266Zt7DWb4Q3TMy4NCJzaEaHREQG9IvbPVtX+qU9goqxVVTsqkRWo3SglMFXKbgYrws2n3ek/UEsDBBQAAAAIAF1bU11BqIAnpgQAAM0UAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDIueG1spZhtb9s2EMe/yoEv9qqx9aw4rVOk0boV7bAiaTds7xjpZBOlRIGkHSefviAt5cEhFSUNDEQ883+8+5Eiz3z3ftdw2KJUTLRLEs4CAtiWomLtakk2uj46Ju9P3+1OroX8odaIGnYNb9XJbknWWncn87kq19hQNRMdtruG10I2VKuZkKu56iTSysoaPo+CIJs3lLXEOLTWfxheq0ctUGtx/Ydk1RfWolqSgIAZ+kqIH+brT5UxGUVHW4TdZceZXpKQwE3/mBPQovuCtT5HzpfkwzEBWmq2xa+0xSW5ElqL5oKt1pqA0lTjktRS3GJLYH76bv4glset+zg/2hS/SqiwphuuL8T1n2gcLkmYWi+7k1JwKygFh4YZtAQaurP/r1ml10uSJQTWrKqwtWmWG6VF8+/+u/DezV4e9fLoTh5HL5DHvTx+nTzp5cmdPM2ek8/vIVhqBdXUNKS4Bmk7GWBRNojvENrpLU2fs5CAsjnP72wfHLZzh614aJvbYR+MbpLXewj+0SPrISagl0Rpab/Znn5kLW1LRrkybrf7RO/DixzhOWxFNBZePAVObD0kT8LjHK74BoG13UarGXxG7KBmyCvg9Aq5msF3hbClfIPqDbRCg3lpN5yqmTOl2JGSw1bEYyklU1JKBg+PUvqGTcepxmGfcgbploauvueJI/hkLPh0SvCpcz7OqgpK0XQcNULNVEk53CCV6g0IXqHSUDOp9Ax+bzVKwC3KG6CN2LTaPRupYzYctiIdSyibklDmWWD9+u8XGFCJoHGnQQvoJCqUWzQPJTOTtV9s3y8LqATnVHrWWObIymErsrGs8v6tDsayyq2H/ElWyCtnZO7+/yGV4F5dI4LIJSg8EdlT5pHgScLHU6bx2LoPD1+NryiZqMwRKLUz8b0uCq2u6lVRECVHQXgUhN+C4MR+ZkEQ/O8k4fOQTvVQ9LE/3YOl0lDRGxA1UOf7NQ5uMQXcYhQctu71svBiC6OjeAo2n4d0qodi4cb2hd5T02sERZsXMAuDSUd24KZ2gVtsN+hENmjCA028CMyfE5JPk0ReTTFoDrk82J2eQTCtagndCM6F0gb9SohKgRKeDWeQH2YWpbmfhk+Tp34a4a/S6KuoZLSKMr1cNP7uUFLN2hXgrsNWIeCu5DMofqNN9/bsDTBzIJoDkrYViLpmJUro6I0bWuQGkAW5l5lPkviRRc8ie2vT2FT4wkSe0p1UBJpeTrr9MGZrxFZR7aubBgeHFEK7ctzgfJJjP7j4V9fapPrR9HLRKNDWIyMUEndKdgNyQ/ApfNiKQfF6BpPKUNPLxeCsEVKz2xEGqWda/QxeqigGxesZTKpcTS8Xg0/Dm9hvOW4OmTur9NjLwaPIIi+HbMJGcotSgJDQCcXMBcYzZPJJZHI3mUsszcKAMF+Mw8ndqXrAeHqP7LD5ry6QSTWx6WWGOfxx8/kohIopLdnVxvBw/8Yf1OnhaevdAM99knikWukl2atRLCah6MvNx5csDuO5y1g8Mg4hDPdmw51PR1f4F5Ur1irgWOslCWY5AbmPxj5r0dmnlMD+im5orZFWKE0rJlALoe8a+wHvbiZPfwJQSwMEFAAAAAgAXVtTXXc3181eAwAA9gsAABgAAAB4bC93b3Jrc2hlZXRzL3NoZWV0My54bWytlttu2zgQhl9lQGDvWutkOYdGKZqk7RbbBRa7bfealsYSUR4EkrLVXvUd9g37JAUpyUkc2tUC9Y1Fiv/M/41GpK5e9oLDFrVhShYkWcQEUJaqYrIuSGc3z8/Jy+ur/nKn9GfTIFroBZfmsi9IY217GUWmbFBQs1Atyl7wjdKCWrNQuo5Mq5FWXiZ4lMbxKhKUSeIC+tlPDHfm0QhMo3ZvNaveM4mmIDEBl3qt1Gd3+13lp6LrqygY4o3P/peGCje04/ZvtfsdWd3YgiS51/WXpeJeUCoOgjlqAoL2/n/HKtsUZLUk0LCqQunTlZ2xSvw73EvuwwzydJSne3mW/g95NsqzvTxf/Uwe3VN47DtqqRtotQPtFznidDWJ9zXwpS/dmlcJAeNNR/u5m8Dc7cO5yKd4kMmB2gH4eKbUR8gI2IIYq/2d7fUdri1QWQFXVLrI24Hr3k0acJOecpPN4c58hOWBmzeMc1jzDoHJtrNmAX8gtrBhyCvgdI3cLOCjQdhS3qF5BlJZcL3ecWoWQftZwH52yv5yjv3lFOGR/Q8oWk4tTq9y0FBYmoTW3i5PGc3nGM2DdXYlpFJ2lENLvwiU1vgmoLBrFMfnshNr1L4nwKIW4dLmgdLmpxyv5jheHekMSWXJKB87A6hGsNhbsApajQb1Ft1FyVzlhy75+M8dVIpzqo80xypAsDpFcDa+afEpgjMf4ewJAfIq6CK8/pNr8WBXHInvN91Hgif2z+c8gHMfPjns0PeuGahQnbRBilGWHMjy2P2CHKPicEt68NRewFfUCpSGVhlm2RZP813M4bsI870a3gepBJOUg6Y2WP2bizBnvEjiPIg5Cp7uvCUTlMNG09IyJSH+/u2/xLFSaFGXKC2t8QX4wFBAEi/y307jJ/GsIycOF+ADagFCSduYIPikOyRP0vDjndYfgr+TFmvUsNFKQJKCbbTq6gaS9NlhpzwlnHeoJmHC1z0zlsl6v/dpJkvWPtgFw+DJkdY+P9bZk+IXtraDmUE+nMzJMtzcqkVNfQU4UoM/wR5j5Qex0uVR7FGx+oXY2SzswCl/E5q8fTQ5ZZu+YqcPuJbW+CfVNZMGOG5sQeLFGQE9JPbXVrX+KiewVtYqMY0apBVqN8oIbJSy+8GQcP8Jf/0DUEsDBBQAAAAIAF1bU107LXDNigMAANQNAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDQueG1stZfbbuM2EIZfZSCgd1vrZMlONs4im2C3RbcHtHu4HktjiQhFCiRle3vVd+gb9kkK0paTOJSiAt0rixT/mf8bDynp6s2+4bAlpZkUqyCeRQGQKGTJRLUKOrP5fhm8ub7aX+6kutc1kYF9w4W+3K+C2pj2Mgx1UVODeiZbEvuGb6Rq0OiZVFWoW0VYOlnDwySK8rBBJgIb0M1+ZrTTT0aga7l7r1j5gQnSqyAKwKZeS3lvb/9Yuqnw+ir0hnjnsv+moKQNdtz8Lnc/EKtqswrizOn2l4XkTlBIDg2z1AE0uHe/O1aaehXk8wBqVpYkXLqi00Y2Xw734ocwB3lylCcneZr8B3l6lKcneZa/JA8fKBz2HRq0AyV3oNwiS5zkvfhUA1f6wq65iQPQznR4mnvrmbt9PBe6FI8yWVBzAB7OlLgIaQBmFWij3J3t9fsOFQojlbZhtweoByuJx0oyZiWdAp26CPMzK+8Y57DmHQETbWf0DH4iamHDiJfAcU1cz+CTJtgi70i/AiEN2EbvOOqZ137qsZ+O2Z9PsT/vIzyx/5GalqOhfh97DfmlsW/t7XzMaDbFaOat8wfCLQFyfqwzrDmKe9jVJMDUpAhQEQgJ1ak3/NXNPNXNxkznU0znA80hUBQMT6atR0N7A0ZCq0iT2pK9KJgt/qFRPv1xB6XkHIcIcg9BPkawOO60aIxg4SIsnhEQL70u/OtPOxP87TGQxR29TwTPIJZT/oalCx8ng64ENuTFOSrPnd2hQLjhLRNe2e1Rdn5A/XKe5hnOxRScCz/OrztBStes9ZIcRfGk7Xrh939HBWuQw0ZhYZgUEP3z198xSAUILamChMGKXkMMK4ij6Ltx1jia9FCJ/LQ3QnTIYYcV+Y/7XnhOnGdRFHmpe8U59qOtZzHhK6F6AW3a8zIeRWPCkCJtAEUJJduykkQJTBRyoFn7eOfE6SBw/L8BJ5OAk1HgRipTYWWPPiYK1iJ36H0d/MyJnzlZLoegk+nQr+FPUtI2eCs1M2z7wva1QSeUIR0tA3ZGApcooMWvDQkz0N+pn3yRDIGn3xB80suGXWUdzP3ghaKSGShQlfZFljVd80IJjvGy84bPh0pwFOTfogTZpBJ4XjTe+iZvn0z22fpvlP71vMWKfkZVMaGB08asgmi2CEAdErtrI1t3lQWwlsbIph/VhCUpO0oD2EhpToNDwtMH2vW/UEsDBBQAAAAIAF1bU13c8+xPSwMAAO0MAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDUueG1stZfdbts4EIVfZcCb3mwsSrKU2Bun2KbotugWKHb7A+wdLY0tIhQpkLStvH1BynISh1LUiwABIlI8M+cjhxR9/batBexRG67kisQzSgBloUoutyuys5uLK/L25rpdHpS+MxWihbYW0izbFamsbZZRZIoKa2ZmqkHZ1mKjdM2smSm9jUyjkZVeVosooTSPasYlcQF97w+OB/OkBaZSh781L//hEs2KUAIu9VqpO/f6U+m7opvrKBjig8/+VUOJG7YT9l91+Ih8W9kViTOva5eFEl5QKAE1d9QEatb6/wde2mpF8jmBipclSp+u2Bmr6p/du/ghTCdPjvLkJE+T35CnR3l6kmf5S/LogcJjv2eWuYZWB9B+kCNO8l58mgM/9YUb81dMwHjT0anvXaDv9nFf5FM8yuRAbQc8nCnxEVICdkWM1f7N/uan0ndcbqFgDbdMuNj7juzBTxLwk4z5SaeQpz7C/MzPBy4ErMUOgctmZ80MPiM2sOEoShBsjcLM4LtB2DOxQ/MHSGXBVftOMDML2k8D9tMx+/Mp9ud9hCf2v2HdCGax38xBQ2FpHBp7Ox8zmk0xmgXn2U2hrRCcWWNhwyWTBWcC7pHpNwaMZdoCkyWgLKF0o8KzmwVmNxsznU8xnQ8UR++yKw5gGsFia8EqaDQa1Ht0DwV3k98Vyvf/3kOphGB6gCAPEORjBJfH7UbHCC59hMtnBCjKoIvw+B+uyoOFMRDfn7xPBM/sX01ZgCsfPj4v0q+ouSq76ghidLok9rryqEpokl3Q+ILG3yhd+r8ZpfT/INgx8/lB9YXZohou2XHkxRTkxSgyyvC6LQaB4+QinQK8eAXgmE76+NAw8idZaGTGncHAikLtpDWgsUC+Z2sRrMd3faz4/FibU0ppELyXnJM/2rF/AoMSezcGJG6Z5Xt8gX7apzd+mZ7LPUqr9H2YOQ4z58PI8WshJ5OQk99Y8IbdD692EibPhsmT1yKfdNtwo1z680/KLTMVWNai4+XhLd5rszPtIhuEPSryYdjrcahJdxA36vntMdB5+6Szz9Zf3vt7a8O2+IXpLZcGBG7sitDZJQHdJfbPVjX+KSOwVtaqum9VyErUrpUS2ChlT40u4emXy80vUEsDBBQAAAAAAF1bU10y5doWKAEAACgBAAALAAAAX3JlbHMvLnJlbHPvu788P3htbCB2ZXJzaW9uPSIxLjAiIGVuY29kaW5nPSJ1dGYtOCI/PjxSZWxhdGlvbnNoaXBzIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvcGFja2FnZS8yMDA2L3JlbGF0aW9uc2hpcHMiPjxSZWxhdGlvbnNoaXAgVHlwZT0iaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL29mZmljZURvY3VtZW50LzIwMDYvcmVsYXRpb25zaGlwcy9vZmZpY2VEb2N1bWVudCIgVGFyZ2V0PSIveGwvd29ya2Jvb2sueG1sIiBJZD0iUmExZTdmNTJjOTc4ODRjZDUiIC8+PC9SZWxhdGlvbnNoaXBzPlBLAwQUAAAACABdW1NdC9i6NFEBAABuBQAAGgAAAHhsL19yZWxzL3dvcmtib29rLnhtbC5yZWxzzdS/TsMwEAbwV4m8U9vJOUlR0y4srIUXODvnJGoSR7EL6bMx8Ei8AuKPkIsYWCp1ueE76dPPN/jt5XWzW4Y+eaLZd26smFwJltBoXN2NTcWOwd6UbLfd7KnH0LnRt93kk2XoR1+xNoTplnNvWhrQr9xE4zL01s0DBr9yc8MnNAdsiKdC5HyOO9h5Z/J4mug/jc7aztCdM8eBxvBHMffh1JNnySPODYWK8aX/zlbL0LPkvq7YHotSYaZBIVqQClnCLwYKLQ107vmMvqaMVAVqCZpEKWsJJhOXVPkWZ6ofwtyNze9rxauIJ+RaaZsLyBSAtnBJ3rObD74lCue0n/jjAUQhvh7lOltnJIwlAyniFfDSiKetyvIipbUuLGSaroCXRbxUF6Ks6xRNQbAu7RXwIOKBlDIHpUxZlICQXwFPRbwcpbQi1aRzBCjMJ4+f/Zrbd1BLAwQUAAAACABdW1Nd3zOGgycBAAB3BQAAEwAAAFtDb250ZW50X1R5cGVzXS54bWzNlM9KAzEQh19lyVWadOsfRLrtQb2qoC8QsrO7ockkZKbr9tk8+Ei+gjSVIiIsxQq9ZC6T3/f9LvPx9j5fDt4VPSSyAStRyqkoAE2oLbaVWHMzuRbLxfxlE4GKwTukSnTM8UYpMh14TTJEwMG7JiSvmWRIrYrarHQLajadXikTkAF5wtsMsZjfQaPXjov7gQF32ME7Udzu9raoSugYnTWabUDVY/0DMglNYw3Uwaw9IEuKCXRNHQB7J/OUXls8y8HqV2YCR4dBv1rJBC7vUGcj7RGPPaRkayiedOIH7aESanCKeOOA5JEb5tAxNHfgYfeWfxbIMaNlO52gfuZksT165+/ZYyKvIa3yR1J5lEeW2ecfKjI7FZHzUxG5OBWRy38XUfmMLj4BUEsBAhQDFAAAAAgAXVtTXRQ5jJYwAQAAbgMAAA8AAAAAAAAAAAAAAKSBAAAAAHhsL3dvcmtib29rLnhtbFBLAQIUAxQAAAAIAF1bU13G0A33lwIAAF0WAAANAAAAAAAAAAAAAACkgV0BAAB4bC9zdHlsZXMueG1sUEsBAhQDFAAAAAgAXVtTXfpcAVkDAwAA2g0AABMAAAAAAAAAAAAAAKSBHwQAAHhsL3RoZW1lL3RoZW1lMS54bWxQSwECFAMUAAAACABdW1NdDR656GUAAABzAAAAFAAAAAAAAAAAAAAApIFTBwAAeGwvc2hhcmVkU3RyaW5ncy54bWxQSwECFAMUAAAACABdW1Ndud4EQRoDAAAOCgAAGAAAAAAAAAAAAAAApIHqBwAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1sUEsBAhQDFAAAAAgAXVtTXUGogCemBAAAzRQAABgAAAAAAAAAAAAAAKSBOgsAAHhsL3dvcmtzaGVldHMvc2hlZXQyLnhtbFBLAQIUAxQAAAAIAF1bU113N9fNXgMAAPYLAAAYAAAAAAAAAAAAAACkgRYQAAB4bC93b3Jrc2hlZXRzL3NoZWV0My54bWxQSwECFAMUAAAACABdW1NdOy1wzYoDAADUDQAAGAAAAAAAAAAAAAAApIGqEwAAeGwvd29ya3NoZWV0cy9zaGVldDQueG1sUEsBAhQDFAAAAAgAXVtTXdzz7E9LAwAA7QwAABgAAAAAAAAAAAAAAKSBahcAAHhsL3dvcmtzaGVldHMvc2hlZXQ1LnhtbFBLAQIUAxQAAAAAAF1bU10y5doWKAEAACgBAAALAAAAAAAAAAAAAACkgesaAABfcmVscy8ucmVsc1BLAQIUAxQAAAAIAF1bU10L2Lo0UQEAAG4FAAAaAAAAAAAAAAAAAACkgTwcAAB4bC9fcmVscy93b3JrYm9vay54bWwucmVsc1BLAQIUAxQAAAAIAF1bU13fM4aDJwEAAHcFAAATAAAAAAAAAAAAAACkgcUdAABbQ29udGVudF9UeXBlc10ueG1sUEsFBgAAAAAMAAwAGwMAAB0fAAAAAA==", Uo = {
	text: "Enter name or reference",
	date: "2025-12-31",
	integer: "120",
	rate: "0.105 or 10.5%",
	money: "500000.00"
};
function Wo({ onCancel: e }) {
	let [t, n] = (0, A.useState)(0);
	return (0, A.useEffect)(() => {
		let e = setTimeout(() => n(1), 100), t = setTimeout(() => n(2), 1e3);
		return () => {
			clearTimeout(e), clearTimeout(t);
		};
	}, []), t ? /* @__PURE__ */ (0, U.jsxs)("div", {
		role: "status",
		"aria-busy": "true",
		children: [
			"Reading workbook…",
			" ",
			/* @__PURE__ */ (0, U.jsx)("button", {
				type: "button",
				onClick: e,
				children: "Cancel reading workbook"
			}),
			t === 2 && /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "formGrid excelReadingSkeleton",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, U.jsx)("span", {}),
					/* @__PURE__ */ (0, U.jsx)("span", {}),
					/* @__PURE__ */ (0, U.jsx)("span", {}),
					/* @__PURE__ */ (0, U.jsx)("span", {})
				]
			})
		]
	}) : null;
}
function Go({ busy: e, blocked: t, serverErrors: n, serverMessage: r, onEvaluate: i, onClose: a }) {
	let o = (0, A.useId)(), s = (0, A.useRef)(null), c = (0, A.useRef)(null), l = (0, A.useRef)(null), u = (0, A.useRef)(0), d = (0, A.useRef)(!1), [f, p] = (0, A.useState)(null), [m, h] = (0, A.useState)(""), [g, _] = (0, A.useState)(!1), [v, y] = (0, A.useState)(""), [b, x] = (0, A.useState)([]), [S, C] = (0, A.useState)(() => /* @__PURE__ */ new Set());
	(0, A.useEffect)(() => () => {
		u.current++, l.current?.abort();
	}, []), (0, A.useEffect)(() => {
		d.current && (x(n), n.length && Gr(n[0].pointer, s.current));
	}, [n]), (0, A.useEffect)(() => {
		f && c.current?.focus();
	}, [m, !!f]);
	let ee = f ? Bo(f) : {
		input: null,
		issues: []
	}, te = [...ee.issues.filter((e) => S.has(e.pointer)), ...b.map((e) => {
		let t = e.pointer.startsWith("/input/") ? e.pointer.slice(6) : e.pointer, n = f?.fields.find((e) => e.pointer === t) ?? f?.fields.find((e) => e.pointer.startsWith(t + "/"));
		return {
			pointer: n?.pointer ?? t,
			sheet: n?.sheet ?? "Workbook",
			cell: n?.cell ?? "",
			message: `${e.code}: ${e.message}${e.limit === null ? "" : ` · limit ${e.limit}`}`
		};
	})];
	function w(e, t) {
		p((n) => n ? { fields: n.fields.map((n) => n.pointer === e.pointer ? {
			...n,
			value: t,
			readError: void 0
		} : n) } : null), x((t) => t.filter((t) => {
			let n = t.pointer.startsWith("/input/") ? t.pointer.slice(6) : t.pointer;
			return n !== e.pointer && !e.pointer.startsWith(n + "/");
		}));
	}
	async function T(t) {
		if (!t || e) return;
		let n = ++u.current;
		if (l.current?.abort(), p(null), x([]), C(/* @__PURE__ */ new Set()), d.current = !1, h(t.name), y(""), !/\.xlsx$/i.test(t.name)) {
			_(!1), y("Choose an .xlsx workbook. Save legacy .xls or macro-enabled files as a values-only .xlsx copy first.");
			return;
		}
		if (t.size > 2e6) {
			_(!1), y("Choose a workbook no larger than 2 MB (2,000,000 bytes).");
			return;
		}
		let r = new AbortController();
		l.current = r, _(!0);
		try {
			let e = await Lo(t, r.signal);
			n === u.current && !r.signal.aborted && (C(new Set(Bo(e).issues.map((e) => e.pointer))), p(e));
		} catch (e) {
			n === u.current && !r.signal.aborted && y(e instanceof Error ? e.message : "The workbook could not be imported.");
		} finally {
			n === u.current && (l.current = null, _(!1));
		}
	}
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "excelImport panel",
		"aria-label": "Excel intake",
		children: [
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "sectionHeading",
				children: [/* @__PURE__ */ (0, U.jsxs)("div", { children: [/* @__PURE__ */ (0, U.jsx)("p", {
					className: "eyebrow",
					children: "Commercial assessment"
				}), /* @__PURE__ */ (0, U.jsx)("h1", { children: "Import Excel workbook" })] }), /* @__PURE__ */ (0, U.jsx)("button", {
					type: "button",
					disabled: e,
					onClick: a,
					children: "Cancel Excel import"
				})]
			}),
			/* @__PURE__ */ (0, U.jsx)("p", { children: "Use the five-sheet Spreadline template for one to ten complete fiscal years, loan assumptions and optional guarantors. Review all inputs before evaluation. Use synthetic data only." }),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "excelDownloads",
				children: [/* @__PURE__ */ (0, U.jsx)("a", {
					className: "buttonLink",
					href: Vo,
					download: "spreadline-intake-template-v1.xlsx",
					children: "Download blank Excel template"
				}), /* @__PURE__ */ (0, U.jsx)("a", {
					className: "buttonLink",
					href: Ho,
					download: "spreadline-alpine-example-v1.xlsx",
					children: "Download filled Excel example"
				})]
			}),
			/* @__PURE__ */ (0, U.jsx)("p", {
				className: "fine",
				children: "Financial cells in the template use text to preserve precision. The importer reads Excel's stored values and cannot restore digits Excel already rounded. Replace formulas with values. General-purpose workbook layouts require conversion into this template."
			}),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "formField",
				children: [
					/* @__PURE__ */ (0, U.jsx)("label", {
						htmlFor: `${o}-file`,
						children: "Excel workbook"
					}),
					/* @__PURE__ */ (0, U.jsx)("input", {
						id: `${o}-file`,
						type: "file",
						accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
						disabled: e,
						"aria-describedby": `${o}-file-help`,
						onChange: (e) => {
							T(e.target.files?.[0]), e.target.value = "";
						}
					}),
					/* @__PURE__ */ (0, U.jsx)("small", {
						id: `${o}-file-help`,
						children: ".xlsx · maximum 2 MB · five-second import limit · processed in page memory"
					})
				]
			}),
			g && /* @__PURE__ */ (0, U.jsx)(Wo, { onCancel: () => {
				u.current++, l.current?.abort(), l.current = null, _(!1), y("Excel import cancelled. Select a workbook to try again.");
			} }),
			v && /* @__PURE__ */ (0, U.jsx)("p", {
				role: "alert",
				children: v
			}),
			f && /* @__PURE__ */ (0, U.jsxs)("form", {
				className: "guidedForm excelReview",
				ref: s,
				noValidate: !0,
				onSubmit: (n) => {
					n.preventDefault(), !e && (t ? y(t) : ee.input ? (d.current = !0, x([]), y(""), i({
						mode: "dated",
						payload: ee.input,
						filename: m,
						resetHistory: !0
					}).catch((e) => y(e instanceof Error ? e.message : "Evaluation failed. Your workbook inputs are preserved."))) : (C(new Set(ee.issues.map((e) => e.pointer))), Gr(ee.issues[0]?.pointer ?? "", s.current)));
				},
				children: [
					/* @__PURE__ */ (0, U.jsx)("h2", {
						ref: c,
						tabIndex: -1,
						children: "Review Excel inputs"
					}),
					/* @__PURE__ */ (0, U.jsxs)("p", {
						className: "excelFilename",
						children: [m, " · USD dollars · fixed-rate, fully amortizing monthly loan"]
					}),
					/* @__PURE__ */ (0, U.jsx)("p", { children: "Correct inputs here or select a replacement workbook. An entirely blank guarantor column means no guarantor. Evaluation sends only the reviewed assessment fields. Saving is a separate action." }),
					te.length > 0 && /* @__PURE__ */ (0, U.jsxs)("section", {
						className: "validationSummary",
						role: "region",
						"aria-label": "Excel validation summary",
						"aria-live": "polite",
						children: [/* @__PURE__ */ (0, U.jsxs)("h2", { children: [
							"Review ",
							te.length,
							" input",
							" ",
							te.length === 1 ? "issue" : "issues"
						] }), /* @__PURE__ */ (0, U.jsx)("ul", { children: te.map((e, t) => /* @__PURE__ */ (0, U.jsx)("li", { children: /* @__PURE__ */ (0, U.jsxs)("button", {
							type: "button",
							onClick: () => Gr(e.pointer, s.current),
							children: [
								e.sheet,
								e.cell ? `!${e.cell}` : "",
								": ",
								e.message
							]
						}) }, `${e.pointer}:${t}`)) })]
					}),
					Ro.map((t) => /* @__PURE__ */ (0, U.jsxs)("details", {
						className: "excelSheet",
						open: t.name === "Borrower",
						children: [/* @__PURE__ */ (0, U.jsx)("summary", { children: t.name }), /* @__PURE__ */ (0, U.jsx)("div", {
							className: "formGrid",
							children: f.fields.filter((e) => e.sheet === t.name).map((t) => {
								let n = f.fields.indexOf(t), r = `${o}-${n}`, i = te.find((e) => e.pointer === t.pointer);
								return /* @__PURE__ */ (0, U.jsxs)("div", {
									className: "formField",
									children: [
										/* @__PURE__ */ (0, U.jsxs)("label", {
											htmlFor: r,
											children: [
												t.label,
												" · ",
												t.group
											]
										}),
										/* @__PURE__ */ (0, U.jsx)("input", {
											id: r,
											"data-pointer": t.pointer,
											type: "text",
											inputMode: t.kind === "integer" ? "numeric" : ["money", "rate"].includes(t.kind) ? "decimal" : "text",
											value: t.value,
											readOnly: e,
											maxLength: 2e3,
											placeholder: Uo[t.kind],
											"aria-invalid": i ? "true" : void 0,
											"aria-describedby": `${r}-help${i ? ` ${r}-error` : ""}`,
											onBlur: () => C((e) => /* @__PURE__ */ new Set([...e, t.pointer])),
											onChange: (e) => w(t, e.target.value)
										}),
										/* @__PURE__ */ (0, U.jsxs)("small", {
											id: `${r}-help`,
											children: [
												t.sheet,
												"!",
												t.cell,
												" · ",
												t.helper
											]
										}),
										i && /* @__PURE__ */ (0, U.jsx)("span", {
											className: "fieldError",
											id: `${r}-error`,
											children: i.message
										})
									]
								}, t.pointer);
							})
						})]
					}, t.name)),
					t && /* @__PURE__ */ (0, U.jsx)("p", {
						role: "status",
						children: t
					}),
					d.current && r && /* @__PURE__ */ (0, U.jsxs)("p", {
						role: "alert",
						children: [r, " Your Excel review values are preserved."]
					}),
					/* @__PURE__ */ (0, U.jsx)("button", {
						type: "submit",
						className: "primary",
						"aria-busy": e,
						children: e ? "Evaluating…" : "Evaluate Excel inputs"
					})
				]
			})
		]
	});
}
// src/views/AssessmentPreparation.tsx
function Ko({ received: e }) {
	return /* @__PURE__ */ (0, U.jsxs)("section", {
		className: "assessmentPreparation",
		role: "status",
		"aria-label": "Assessment preparation",
		"aria-live": "polite",
		"aria-atomic": "true",
		children: [/* @__PURE__ */ (0, U.jsx)("span", {
			className: "preparationSpinner",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "preparationContent",
			children: [
				/* @__PURE__ */ (0, U.jsx)("strong", { children: "Preparing your assessment" }),
				/* @__PURE__ */ (0, U.jsx)("p", { children: e ? "Calculation received. Preparing your decision summary…" : "Waiting for the calculation service…" }),
				/* @__PURE__ */ (0, U.jsx)("div", {
					className: "preparationTrack",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, U.jsx)("span", { style: { animationDuration: `${to}ms` } })
				}),
				/* @__PURE__ */ (0, U.jsx)("small", { children: "Your recommendation and supporting figures will appear together." })
			]
		})]
	});
}
// src/App.tsx
function qo({ onDisconnect: e }) {
	let t = ao(), n = Lr(t), { state: r, submit: i, demo: a, upload: o } = t, [s, c] = (0, A.useState)("spread"), [l, u] = (0, A.useState)("commercial"), [d, f] = (0, A.useState)(!1), [p, m] = (0, A.useState)("dated"), [h, g] = (0, A.useState)(!1), _ = (0, A.useRef)(null), [v, y] = (0, A.useState)(1), [b, x] = (0, A.useState)(!1), [S, C] = (0, A.useState)(!1), [ee, te] = (0, A.useState)(!1), w = (0, A.useRef)(0);
	(0, A.useLayoutEffect)(() => {
		w.current++;
	}, [
		l,
		d,
		p,
		h,
		S
	]);
	let T = (0, A.useRef)(null), ne = (0, A.useRef)(null), E = j(T, t.edit), D = se(r, !!t.operation), { ready: O, accepted: ie, input: k, assessment: ae, decision: oe } = D, ce = k ? Math.min(v, k.years.length - 1) : 0, le = r.status === "idle";
	(0, A.useEffect)(() => {
		r.status === "evaluating" && (E.dismiss(), x(!1), r.action === "evaluate" && r.draft?.resetHistory && r.draft.mode === "dated" && c("overview")), r.status === "ready" && r.resetPeriod && r.accepted && y(r.accepted.input.years.length - 1), r.status === "ready" && r.saved?.view.compatibility && c("audit");
	}, [
		r.id,
		r.status,
		r.accepted,
		r.resetPeriod
	]);
	let ue = () => {
		g(!1), u("commercial"), f(!1), ne.current?.click();
	}, de = (e) => void t.openSaved(e), fe = t.rejected, M = fe ? JSON.parse(fe.body) : null, pe = r.status === "unavailable" ? r.draft ?? (r.action === "write" ? fe?.kind === "create" && M?.input ? {
		mode: "dated",
		payload: M.input,
		filename: "Rejected saved creation",
		resetHistory: !0
	} : fe?.kind === "edit" && ie && r.saved?.view.snapshot.case_id === fe.caseId && M?.new_value !== void 0 ? {
		mode: ie.mode,
		payload: Rn(ie.input, {
			path: fe.review.path,
			prior: fe.review.value,
			next: M.new_value,
			rationale: M.rationale,
			at: "unverified proposal"
		}),
		filename: "Rejected saved edit"
	} : null : null) : null, me = r.draft ? t.fieldErrors : t.writeError?.fieldErrors ?? [], N = () => {
		g(!0), f(!1), u("commercial"), C(!1);
	};
	return /* @__PURE__ */ (0, U.jsx)(Hi, {
		subject: D.analysisSubject,
		paused: t.inFlight,
		children: /* @__PURE__ */ (0, U.jsxs)("main", {
			className: "analystWorkspace",
			children: [
				/* @__PURE__ */ (0, U.jsxs)(Qi, { children: [!le && l === "commercial" && !d && !h && /* @__PURE__ */ (0, U.jsx)($i, {
					showCases: S,
					canSave: t.canSave,
					onToggleCases: () => C((e) => !e),
					onSave: (e) => {
						T.current = e, x(!0);
					}
				}), /* @__PURE__ */ (0, U.jsx)(ea, {
					onEditDraft: l === "commercial" && !d && !h && !le && ie ? () => {
						m(ie.mode), f(!0);
					} : void 0,
					onExample: (e) => {
						g(!1), u("commercial"), f(!1), a(e);
					},
					onImport: ue,
					onDisconnect: e
				})] }),
				/* @__PURE__ */ (0, U.jsx)(so, { actor: r.saved?.view.snapshot.event.actor }),
				/* @__PURE__ */ (0, U.jsxs)("nav", {
					className: "primaryNavigation",
					"aria-label": "Underwriting workflows",
					children: [
						/* @__PURE__ */ (0, U.jsx)("button", {
							type: "button",
							ref: _,
							"aria-current": h ? "page" : void 0,
							onClick: N,
							children: "Excel intake"
						}),
						/* @__PURE__ */ (0, U.jsx)("button", {
							type: "button",
							"aria-current": l === "commercial" && p === "dated" && !h ? "page" : void 0,
							onClick: () => {
								g(!1), u("commercial"), m("dated"), f(!0), C(!1);
							},
							children: "Commercial Assessment"
						}),
						/* @__PURE__ */ (0, U.jsx)("button", {
							type: "button",
							"aria-current": l === "commercial" && p === "legacy" && !h ? "page" : void 0,
							onClick: () => {
								g(!1), u("commercial"), m("legacy"), f(!0), C(!1);
							},
							children: "Commercial Decision"
						}),
						!re() && /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)("button", {
							type: "button",
							"aria-current": l === "consumer" ? "page" : void 0,
							onClick: () => {
								g(!1), u("consumer"), C(!1);
							},
							children: "Consumer Decision"
						}), /* @__PURE__ */ (0, U.jsx)("button", {
							type: "button",
							"aria-current": l === "sba" ? "page" : void 0,
							onClick: () => {
								g(!1), u("sba"), C(!1);
							},
							children: "SBA Screen"
						})] }),
						/* @__PURE__ */ (0, U.jsx)("button", {
							type: "button",
							"aria-expanded": S,
							onClick: () => {
								g(!1), u("commercial"), f(!1), C(!0);
							},
							children: "Saved Cases"
						})
					]
				}),
				l === "commercial" && t.preparation && /* @__PURE__ */ (0, U.jsx)(Ko, { received: t.preparation.received }, t.preparation.id),
				l === "consumer" ? /* @__PURE__ */ (0, U.jsx)(Oo, {}) : l === "sba" ? /* @__PURE__ */ (0, U.jsx)(Ao, {}) : h ? /* @__PURE__ */ (0, U.jsx)(Go, {
					busy: r.status === "evaluating",
					blocked: t.operation || t.recoveryError || t.conflict || t.inFlight ? "Resolve the saved-write recovery banner before evaluating an imported case." : "",
					serverErrors: t.fieldErrors,
					serverMessage: r.status === "unavailable" ? r.error : "",
					onClose: () => {
						g(!1), _.current?.focus();
					},
					onEvaluate: async (e) => {
						let n = w.current, r = await t.submitImport(e);
						return r && n === w.current && (g(!1), c("spread")), r;
					}
				}) : d ? /* @__PURE__ */ (0, U.jsx)(uo, {
					mode: p,
					initial: ie?.mode === p ? ie.input : void 0,
					serverErrors: t.fieldErrors,
					serverMessage: r.status === "unavailable" ? r.error : "",
					busy: r.status === "evaluating",
					onClose: () => f(!1),
					onEvaluate: async (e) => {
						let t = w.current, n = await i(e);
						return n && t === w.current && (f(!1), c("spread")), n;
					}
				}, p) : le ? /* @__PURE__ */ (0, U.jsx)(na, {
					showCases: S,
					onExample: () => a("dated"),
					onToggleCases: () => C((e) => !e),
					onImport: ue,
					onExcel: N
				}) : /* @__PURE__ */ (0, U.jsx)(ta, {
					view: D,
					filename: r.filename,
					legacy: ie?.mode === "legacy"
				}),
				/* @__PURE__ */ (0, U.jsx)(ra, {}),
				S && l === "commercial" && /* @__PURE__ */ (0, U.jsx)(gr, {
					onOpen: (e) => {
						C(!1), de(e);
					},
					onClose: () => {
						C(!1), Wn("[data-focus-fallback]")?.focus();
					}
				}),
				/* @__PURE__ */ (0, U.jsx)(xr, {
					workspace: t,
					onOpenComparison: (e) => {
						let n = e.record;
						Pr(n.case_id, n.comparison_id), t.openSaved({
							caseId: n.case_id,
							revision: n.baseline_revision
						}).then(() => c("stress")), t.dismissComparisonAck();
					},
					onDiscard: (e) => {
						T.current = e, te(!0);
					},
					onReview: (e) => {
						let n = t.reviewConflict();
						n && E.review(n.field, n.proposal, e);
					}
				}),
				!d && !h && pe && me.length > 0 && /* @__PURE__ */ (0, U.jsx)(No, {
					draft: pe,
					errors: me,
					savedField: fe?.kind === "edit" ? fe.review.path : void 0,
					rationale: M?.rationale,
					onEvaluate: (e) => void i(e),
					onReviewSaved: async (e, n, r) => {
						let i = await t.reviewRejected(e, n);
						i && E.review(i.field, i.proposal, r);
					}
				}, `${r.id}:${fe?.id ?? "draft"}`),
				l === "commercial" && !d && !h && !le && /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
					/* @__PURE__ */ (0, U.jsx)(_a, {
						state: r,
						view: D,
						preparing: !!t.preparation,
						onSubmit: (e) => void i(e),
						onOpen: de
					}),
					/* @__PURE__ */ (0, U.jsx)(aa, { view: D }),
					ae && /* @__PURE__ */ (0, U.jsx)(ga, { assessment: ae }),
					ae && /* @__PURE__ */ (0, U.jsx)(X, { assessment: ae }),
					r.saved && /* @__PURE__ */ (0, U.jsx)(_r, {
						saved: r.saved,
						active: O,
						onOpen: de
					}),
					ae && /* @__PURE__ */ (0, U.jsx)(jo, {}),
					O && r.saved?.view.compatibility && /* @__PURE__ */ (0, U.jsx)(va, { view: r.saved.view }),
					/* @__PURE__ */ (0, U.jsxs)(Wi, {
						label: "Workspace views",
						tabs: ya,
						selected: s,
						onSelect: c,
						children: [
							s === "spread" && /* @__PURE__ */ (0, U.jsx)(Ta, {
								ready: O,
								canEdit: t.canEdit,
								input: k,
								legacy: ie?.mode === "legacy",
								assessment: ae,
								decision: oe,
								index: ce,
								onSelectPeriod: y,
								onEdit: E.open
							}),
							s === "overview" && /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)(Ba, { view: D }), /* @__PURE__ */ (0, U.jsx)(Mo, { kind: "breakevens" })] }),
							s === "debt" && /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)(Ha, {
								ready: O,
								accepted: ie,
								canEdit: t.canEdit,
								onEdit: E.open
							}), /* @__PURE__ */ (0, U.jsx)(Mo, { kind: "schedule" })] }),
							s === "global" && /* @__PURE__ */ (0, U.jsx)(Ua, {
								ready: O,
								accepted: ie,
								canEdit: t.canEdit,
								onEdit: E.open
							}),
							s === "stress" && /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)(Mo, { kind: "grid" }), /* @__PURE__ */ (0, U.jsx)(si, {
								model: n,
								onSaveBaseline: (e) => {
									t.canSave && (T.current = e, x(!0));
								},
								onOpenBaseline: de
							})] }),
							s === "memo" && /* @__PURE__ */ (0, U.jsx)(Ka, { decision: oe }),
							s === "audit" && /* @__PURE__ */ (0, U.jsxs)("div", {
								className: "historyAudit",
								children: [
									/* @__PURE__ */ (0, U.jsx)(qa, {
										saved: r.saved,
										ready: O,
										history: r.history,
										input: k,
										onOpen: de
									}),
									/* @__PURE__ */ (0, U.jsx)(Wa, {
										ready: O,
										input: k,
										assessment: ae,
										decision: oe,
										index: ce
									}),
									/* @__PURE__ */ (0, U.jsx)(gi, {
										view: O ? r.saved?.view ?? null : null,
										selection: r.saved?.selection ?? null,
										headRevision: r.saved?.headRevision ?? null,
										sourceScope: `${r.id}:${r.status}`,
										original: n.original,
										pending: !!(t.operation || t.recoveryError || t.conflict || t.inFlight),
										onOpenBaseline: de
									})
								]
							})
						]
					})
				] }),
				/* @__PURE__ */ (0, U.jsx)("input", {
					ref: ne,
					type: "file",
					accept: ".json,application/json",
					hidden: !0,
					onChange: (e) => {
						o(e.target.files?.[0]), e.target.value = "";
					}
				}),
				E.editing && /* @__PURE__ */ (0, U.jsx)(Zn, {
					restoreFocus: T.current,
					field: E.editing,
					saved: !!r.saved,
					proposal: E.proposal,
					onCancel: E.cancel,
					onSubmit: E.submit
				}, `${E.editing.path}:${r.id}`),
				b && ie?.mode === "dated" && /* @__PURE__ */ (0, U.jsx)(Yn, {
					input: ie.input,
					restoreFocus: T.current,
					onSave: t.save,
					onCancel: () => x(!1)
				}),
				ee && /* @__PURE__ */ (0, U.jsx)(Xn, {
					restoreFocus: T.current,
					onDiscard: t.discardTracking,
					onCancel: () => te(!1)
				}),
				/* @__PURE__ */ (0, U.jsxs)("footer", { children: [
					"Spreadline · Synthetic analyst demonstration ·",
					" ",
					r.saved ? `Saved revisions · recorded credential ${r.saved.view.snapshot.event.actor}` : "Unsaved session workspace"
				] })
			]
		})
	});
}
// src/embeddedTransport.ts
var Jo = 16777216, Yo = class {
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
			t.signal?.aborted ? n(/* @__PURE__ */ Error("Request cancelled.")) : (r = setTimeout(a, 3e4), t.signal?.addEventListener("abort", a, { once: !0 }), this.pending.set(i.id, {
				command: i,
				resolve: e,
				reject: n,
				clean: o
			}), this.flush());
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
					if (!Number.isInteger(n.status) || n.status < 200 || n.status > 599 || typeof n.body != "string" || new TextEncoder().encode(n.body).length > Jo || !n.headers || typeof n.headers != "object" || Object.values(n.headers).some((e) => typeof e != "string")) throw Error("Unreadable embedded response. Review any pending write before retrying.");
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
}, Xo = ":root,.themeRoot{--fs-12:12px;--fs-13:14px;--fs-14:14px;--fs-16:16px;--fs-20:20px;--fs-24:24px;--fs-28:28px;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:20px;--space-6:24px;--space-7:28px;--space-8:32px;--radius-sm:4px;--radius:8px;--radius-lg:12px;--font-sans:Inter, ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;--font-mono:ui-monospace, \"SF Mono\", Menlo, Consolas, monospace;--lightningcss-light:initial;--lightningcss-dark: ;--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;--canvas:#f3f6f4;--surface:#fff;--raised:#fff;--sunken:#eef3f0;--band:#f3f8f5;--text:#14201b;--muted:#4d5b54;--subtle:#56645d;--border:#d3dcd7;--rule:#e1e8e4;--rule-strong:#9fb0a7;--border-strong:#7b8b83;--control:#fff;--control-hover:#eaf1ed;--control-border:#b4c1ba;--control-text:#14201b;--input-bg:#fff;--input-border:#7b8b83;--disabled-bg:#eef2f0;--disabled-text:#5f6c66;--disabled-border:#d3dcd7;--edit-underline:#8a9c93;--accent:#0d6845;--accent-hover:#0a5538;--on-accent:#fff;--accent-soft:#e5f2ea;--accent-border:#93c4aa;--on-accent-soft:#0d6845;--positive:#0d6845;--positive-soft:#e5f2ea;--positive-border:#93c4aa;--positive-muted:#3b5f4f;--caution:#7f5300;--caution-soft:#fbf1da;--caution-border:#d9b86d;--caution-muted:#6a5326;--negative:#a3301c;--negative-soft:#fbebe6;--negative-border:#df9f90;--negative-muted:#7c4136;--info:#2c5683;--info-soft:#e9f0f7;--info-border:#a7bfd9;--info-muted:#3f5671;--focus:#0d6845;--selection:#cbe6d6;--derived:#eef3f0;--derived-label:#3b5f4f;--ebitda-bg:#e5f2ea;--ebitda-text:#0d6845;--shadow-dialog:0 16px 40px #14201b2e, 0 2px 6px #14201b14;--backdrop:#14201b73}@media screen{:root[data-theme=dark],.themeRoot[data-theme=dark]{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--canvas:#0b0d10;--surface:#101419;--raised:#151b22;--sunken:#12191c;--band:#131a20;--text:#eef1f4;--muted:#b5bfc9;--subtle:#a5b2bd;--border:#303b46;--rule:#29333d;--rule-strong:#4a5a68;--border-strong:#556f82;--control:#18212a;--control-hover:#22313c;--control-border:#40515f;--control-text:#d4dee7;--input-bg:#18212a;--input-border:#556f82;--disabled-bg:#141a20;--disabled-text:#8c98a3;--disabled-border:#29333d;--edit-underline:#586c7c;--accent:#8de0bb;--accent-hover:#a2e8c9;--on-accent:#10291f;--accent-soft:#13241c;--accent-border:#437c63;--on-accent-soft:#c6d8cf;--positive:#8de0bb;--positive-soft:#111d18;--positive-border:#375447;--positive-muted:#a9c4b6;--caution:#e0d5a1;--caution-soft:#1d1b12;--caution-border:#6e6339;--caution-muted:#c9c1a0;--negative:#ffb5a7;--negative-soft:#211716;--negative-border:#69473e;--negative-muted:#d6b2aa;--info:#b5c9df;--info-soft:#15202a;--info-border:#4a6074;--info-muted:#aebccb;--focus:#8de0bb;--selection:#2b5543;--derived:#12191c;--derived-label:#98bdaa;--ebitda-bg:#14221b;--ebitda-text:#bce8d2;--shadow-dialog:0 16px 40px #00000080;--backdrop:#000000b8}}*{box-sizing:border-box}body{background:var(--canvas);color:var(--text);margin:0}.themeRoot{font-family:var(--font-sans);font-synthesis:none;font-variant-numeric:tabular-nums;color:var(--text);background:var(--canvas);accent-color:var(--accent);caret-color:var(--accent);scrollbar-color:var(--border-strong) transparent}.themeRoot ::selection{background:var(--selection);color:var(--text)}main{max-width:1280px;padding:var(--space-7);margin:auto}h1{font-size:var(--fs-28);margin:var(--space-1) 0 var(--space-2);letter-spacing:-.025em;overflow-wrap:anywhere}h2{margin:0 0 var(--space-3);font-size:var(--fs-16)}h3{font-size:var(--fs-14);color:var(--accent);margin-top:var(--space-6)}h4{font-size:var(--fs-14)}p{color:var(--muted);line-height:1.6}small{font-size:var(--fs-12)}a{color:var(--accent);text-underline-offset:3px}code{font-family:var(--font-mono);overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}.eyebrow{font-size:var(--fs-12);letter-spacing:.1em;color:var(--accent);font-weight:500}.fine{border-top:1px solid var(--border);margin-top:var(--space-6);padding-top:var(--space-4);font-size:var(--fs-12);overflow-wrap:anywhere}.accessGate{max-width:620px;padding-top:12vh}.accessGate form{gap:var(--space-3);display:grid}.hostingNotice{justify-content:space-between;gap:var(--space-2) var(--space-6);max-width:1280px;padding:var(--space-3) var(--space-7);color:var(--on-accent-soft);background:var(--accent-soft);border-bottom:1px solid var(--accent-border);font-size:var(--fs-12);flex-wrap:wrap;margin:auto;line-height:1.6;display:flex}.hostingNotice>span:first-child{letter-spacing:.08em;font-weight:600}.workspaceBrand{align-items:center;gap:var(--space-3) var(--space-5);padding-bottom:var(--space-4);margin-bottom:var(--space-6);border-bottom:1px solid var(--border);flex-wrap:wrap;display:flex}.wordmark{align-items:center;gap:var(--space-2);font-size:var(--fs-20);letter-spacing:-.03em;font-weight:600;display:flex}.wordmark svg{color:var(--accent);flex-shrink:0}.workspaceType{align-items:center;gap:var(--space-3);color:var(--muted);font-size:var(--fs-13);display:flex}.workspaceType>span{border:1px solid var(--border);border-radius:var(--radius-sm);padding:0 var(--space-2);font-size:var(--fs-12);letter-spacing:.04em}.brandActions{align-items:center;gap:var(--space-2);flex-wrap:wrap;margin-left:auto;display:flex}.caseHeader{margin-bottom:var(--space-4)}.caseHeader h1{margin:0 0 var(--space-2)}.caseMeta{align-items:center;gap:var(--space-2) var(--space-3);font-size:var(--fs-13);color:var(--muted);flex-wrap:wrap;display:flex}.modeBadge,.statusChip{min-height:24px;padding:0 var(--space-2);border-radius:var(--radius-sm);font-size:var(--fs-12);white-space:nowrap;align-items:center;font-weight:600;display:inline-flex}.modeBadge{color:var(--on-accent-soft);background:var(--accent-soft);border:1px solid var(--accent-border)}.statusChip{color:var(--caution);background:var(--caution-soft);border:1px solid var(--caution-border)}.statusChip[data-saved=true]{color:var(--info);background:var(--info-soft);border-color:var(--info-border)}.pendingNote{color:var(--info);font-weight:600}.caseSource{color:var(--subtle);font-size:var(--fs-12);overflow-wrap:anywhere;min-width:0}.legacyNote{margin:var(--space-2) 0 0;font-size:var(--fs-12)}.startScreen{padding:var(--space-4) 0 var(--space-2);margin-bottom:var(--space-6)}.startScreen h1{margin:0 0 var(--space-2)}.startLead{max-width:68ch;margin:0 0 var(--space-6)}.startOptions{gap:var(--space-4);grid-template-columns:repeat(3,minmax(0,1fr));display:grid}.startOption{align-items:flex-start;gap:var(--space-2);min-height:132px;padding:var(--space-5);text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);flex-direction:column;display:flex}@media (hover:hover){.startOption:hover{background:var(--surface);border-color:var(--accent)}}.startOption[aria-expanded=true]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}.startOptionTitle{font-size:var(--fs-16);color:var(--text);font-weight:600}.startOptionDetail{font-size:var(--fs-13);color:var(--muted);line-height:1.6}.startOption.primary .startOptionTitle,.startOption.primary .startOptionDetail{color:var(--on-accent)}.disclosureMenu{position:relative}.menuToggle{align-items:center;gap:var(--space-2);display:inline-flex}.menuToggle svg{transition:transform .12s ease-out}.menuToggle[aria-expanded=true] svg{transform:rotate(180deg)}.moreMenu{right:0;top:calc(100% + var(--space-1));z-index:20;width:244px;max-width:calc(100vw - 32px);padding:var(--space-1) 0;background:var(--raised);border:1px solid var(--border-strong);border-radius:var(--radius);box-shadow:var(--shadow-dialog);position:absolute}.menuGroup{padding:var(--space-1) 0;display:grid}.menuGroup+.menuGroup{border-top:1px solid var(--rule)}.moreMenu button{text-align:left;width:100%;padding:var(--space-2) var(--space-4);font-size:var(--fs-13);background:0 0;border:0;border-radius:0}@media (hover:hover){.moreMenu button:hover{background:var(--control-hover)}}.moreMenu button:focus-visible{outline-offset:-2px}.workspaceTabs{gap:var(--space-6);margin:var(--space-6) 0 var(--space-5);border-bottom:1px solid var(--border);scrollbar-width:thin;display:flex;overflow-x:auto}.workspaceTabs [role=tab]{padding:var(--space-3) 0;color:var(--muted);font-size:var(--fs-14);white-space:nowrap;background:0 0;border:0;border-bottom:2px solid #0000;border-radius:0;flex:none}@media (hover:hover){.workspaceTabs [role=tab]:hover{color:var(--text);background:0 0}}.workspaceTabs [role=tab][aria-selected=true]{color:var(--accent);border-bottom-color:var(--accent);font-weight:600}.workspaceTabs [role=tab]:focus-visible{outline-offset:-2px}.tabPanel:focus-visible{outline:2px solid var(--focus);outline-offset:4px;border-radius:var(--radius-sm)}.context{gap:var(--space-2) var(--space-6);font-size:var(--fs-12);color:var(--muted);margin-top:var(--space-4);flex-wrap:wrap;display:flex}.context>span{flex:240px;line-height:1.7}footer{padding-top:var(--space-6);color:var(--subtle);font-size:var(--fs-12)}.actions{gap:var(--space-2);flex-wrap:wrap;display:flex}button{font:inherit;background:var(--control);border:1px solid var(--control-border);color:var(--control-text);padding:var(--space-2) var(--space-4);border-radius:var(--radius);cursor:pointer;transition:opacity .12s ease-out}@media (hover:hover){button:hover{background:var(--control-hover)}}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible{outline:2px solid var(--focus);outline-offset:3px}button:disabled{background:var(--disabled-bg);border-color:var(--disabled-border);color:var(--disabled-text);cursor:not-allowed}.primary{background:var(--accent);color:var(--on-accent);border-color:var(--accent);font-weight:600}@media (hover:hover){.primary:hover{color:var(--on-accent);background:var(--accent-hover);border-color:var(--accent-hover)}}.primary:disabled{color:var(--disabled-text);background:var(--disabled-bg);border-color:var(--disabled-border)}.active{color:var(--accent);border-color:var(--accent)}.themeToggle{align-items:center;gap:var(--space-2);display:flex}.themeToggle:before{content:\"\";border:2px solid;border-radius:50%;width:10px;height:10px}.themeToggle[aria-pressed=true]{color:var(--accent)}.linkButton{color:var(--accent);font-size:inherit;text-underline-offset:3px;background:0 0;border:0;padding:0;text-decoration:underline;display:inline}@media (hover:hover){.linkButton:hover{color:var(--accent-hover);background:0 0}}.themeToggle[aria-pressed=true]:before{background:currentColor}.accessGate input,dialog input,dialog textarea,.scenarioFields input,.scenarioFields textarea,.scenarioFields select,.scenarioSelect select{width:100%;min-width:0;padding:var(--space-2) var(--space-3);color:var(--text);background:var(--input-bg);border:1px solid var(--input-border);border-radius:var(--radius);font:inherit;display:block}.accessGate input{padding:var(--space-3)}.warning{margin:var(--space-5) 0 var(--space-4);padding:var(--space-3) var(--space-4);border:1px solid var(--caution-border);background:var(--caution-soft);color:var(--caution);border-radius:var(--radius);font-size:var(--fs-13);overflow-wrap:anywhere}.environmentWarning{align-items:baseline;gap:var(--space-1) var(--space-3);margin:0 0 var(--space-4);padding:var(--space-2) var(--space-4);background:var(--sunken);border-color:var(--border);flex-wrap:wrap;display:flex}.environmentWarning .noticeDetail{flex-basis:100%}.environmentWarning>span{font-size:var(--fs-12);color:var(--caution);white-space:nowrap;font-weight:600}.environmentWarning p{color:var(--muted);font-size:var(--fs-12);margin:0;line-height:1.7}.pending{padding:var(--space-4);border:1px solid var(--info-border);border-radius:var(--radius);margin:var(--space-4) 0;background:var(--info-soft);overflow-wrap:anywhere}.pending p{font-size:var(--fs-13);color:var(--info-muted);margin-bottom:0}.writeNotice{border:1px solid var(--accent-border);border-radius:var(--radius);background:var(--accent-soft);color:var(--text);padding:var(--space-2) var(--space-3);font-size:var(--fs-13);overflow-wrap:anywhere}.compatibility{margin:var(--space-4) 0}.decision{align-items:stretch;gap:var(--space-2) var(--space-6);margin:var(--space-4) 0 0;padding:var(--space-4) var(--space-5);border:1px solid var(--positive-border);border-radius:var(--radius);background:var(--positive-soft);overflow-wrap:anywhere;border-left-width:6px;display:flex}.decisionStatus{flex:none;min-width:168px}.decision span,.decision small{color:var(--positive-muted);display:block}.decisionStatus span{font-size:var(--fs-12);margin-bottom:var(--space-1)}.decision strong{font-size:var(--fs-28);letter-spacing:.02em;color:var(--positive);font-weight:600;line-height:1.1;display:block}.decisionReason{flex:1;align-self:center;min-width:0}.decisionReason p{font-size:var(--fs-16);color:var(--text);max-width:70ch;margin:0;line-height:1.5}.decision small{font-size:var(--fs-12);margin-top:var(--space-1);line-height:1.6}.decision .previousResult{font-weight:600}.decision[data-outcome=review]{background:var(--caution-soft);border-color:var(--caution-border)}.decision[data-outcome=review] strong{color:var(--caution)}.decision[data-outcome=review] span,.decision[data-outcome=review] small{color:var(--caution-muted)}.decision[data-outcome=decline]{background:var(--negative-soft);border-color:var(--negative-border)}.decision[data-outcome=decline] strong{color:var(--negative)}.decision[data-outcome=decline] span,.decision[data-outcome=decline] small{color:var(--negative-muted)}.decision[data-outcome=unavailable]{background:var(--info-soft);border-color:var(--info-border)}.decision[data-outcome=unavailable] strong{color:var(--info)}.decision[data-outcome=unavailable] span,.decision[data-outcome=unavailable] small{color:var(--info-muted)}.kpiTiles{margin-top:var(--space-4);border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);grid-template-columns:repeat(6,minmax(0,1fr));display:grid;overflow:hidden}.kpiTile{gap:var(--space-1);min-width:0;padding:var(--space-4);border-left:1px solid var(--border);flex-direction:column;display:flex}.kpiTile:first-child{border-left:0}.kpiLabel{font-size:var(--fs-13);color:var(--muted)}.kpiTile strong{font-size:var(--fs-24);letter-spacing:-.02em;overflow-wrap:anywhere;font-weight:600}.kpiStatus{align-items:flex-start;gap:var(--space-2);font-size:var(--fs-12);color:var(--muted);font-weight:600;display:flex}.kpiStatus:before{content:\"\";background:var(--subtle);border-radius:50%;flex:none;width:8px;height:8px;margin-top:.4em}.kpiTile[data-state=pass] .kpiStatus{color:var(--positive)}.kpiTile[data-state=pass] .kpiStatus:before{background:var(--positive)}.kpiTile[data-state=review] .kpiStatus{color:var(--caution)}.kpiTile[data-state=review] .kpiStatus:before{background:var(--caution)}.kpiTile[data-state=fail] .kpiStatus{color:var(--negative)}.kpiTile[data-state=fail] .kpiStatus:before{background:var(--negative)}.kpiTile small{font-size:var(--fs-12);color:var(--subtle);line-height:1.5}.kpiTile .kpiCushion{padding-top:var(--space-1);color:var(--text);font-variant-numeric:tabular-nums;margin-top:auto}.grid{gap:var(--space-4);grid-template-columns:minmax(0,2.8fr) minmax(260px,1fr);display:grid}.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);min-width:0;padding:var(--space-6)}.panelTitle{justify-content:space-between;align-items:start;gap:var(--space-5);display:flex}.panelTitle span{font-size:var(--fs-12);color:var(--subtle);line-height:1.5}.memo{min-height:300px}.tableScroll{border:1px solid var(--border);border-radius:var(--radius-sm);max-width:100%;overflow-x:auto}.tableScroll:has(tbody th){scroll-padding-inline-start:170px}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:var(--space-3);border-bottom:1px solid var(--rule);font-size:var(--fs-13)}thead th{color:var(--subtle);font-weight:500}tbody th{z-index:1;background:var(--surface);min-width:170px;font-weight:500;position:sticky;left:0}tbody tr:nth-child(2n):not(.derived)>*{background:var(--band)}.num{font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}.rowEdit{font:inherit;text-align:inherit;border-radius:var(--radius-sm);padding:var(--space-1) 0;color:inherit;text-decoration:underline;-webkit-text-decoration-color:var(--edit-underline);text-decoration-color:var(--edit-underline);text-underline-offset:4px;background:0 0;border:0}@media (hover:hover){.rowEdit:hover{background:var(--control-hover);-webkit-text-decoration-color:var(--accent);text-decoration-color:var(--accent)}}.rowEdit:disabled{color:inherit;cursor:default;background:0 0;text-decoration:none}.period{font-size:var(--fs-12);white-space:nowrap;padding:var(--space-2)}.period.active{background:var(--accent-soft)}.derived,.derived th{background:var(--derived)}tbody tr:not(.derived)+.derived>*{border-top:2px solid var(--rule-strong)}.derived[data-fact=ebitda],.derived[data-fact=ebitda] th{background:var(--ebitda-bg);color:var(--ebitda-text)}.derived small{color:var(--derived-label);font-size:var(--fs-12);margin-top:var(--space-1);display:block}.metric{gap:var(--space-2);border-bottom:1px solid var(--rule);padding:var(--space-4) 0;font-size:var(--fs-13);grid-template-columns:1fr auto;display:grid}.metric strong{font-size:var(--fs-20);overflow-wrap:anywhere}.metric>span:before{content:\"\";width:6px;height:6px;margin-right:var(--space-2);background:var(--subtle);vertical-align:middle;border-radius:50%;display:inline-block}.metric[data-state=pass]>span:before{background:var(--positive)}.metric[data-state=fail]>span:before{background:var(--negative)}.metric[data-state=review]>span:before{background:var(--caution)}.metric small{color:var(--muted);grid-column:1/-1;line-height:1.7}.assumptionsGrid{gap:var(--space-4);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.assumption{justify-content:space-between;align-items:start;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid var(--rule);font-size:var(--fs-13);display:flex}.assumption strong{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}details{border:1px solid var(--border);border-radius:var(--radius);margin:var(--space-2) 0;padding:var(--space-3);font-size:var(--fs-13);overflow-wrap:anywhere}summary{cursor:pointer;color:var(--text);line-height:1.5}.operand{gap:var(--space-2);margin:var(--space-3) 0;padding:var(--space-2);border-bottom:1px solid var(--rule);font-size:var(--fs-12);overflow-wrap:anywhere;grid-template-columns:1fr auto;display:grid}.operand small{color:var(--subtle);grid-column:1/-1}.expression{font-family:var(--font-mono);font-size:var(--fs-12)}.audit{gap:var(--space-2);padding:var(--space-4) 0;border-bottom:1px solid var(--rule);overflow-wrap:anywhere;grid-template-columns:1fr auto;display:grid}.audit small{color:var(--muted);grid-column:1/-1}.overviewGrid{gap:var(--space-4);grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);display:grid}.overviewTrends{grid-column:1/-1}.overviewHeadline{font-size:var(--fs-16);color:var(--text);margin-top:0;font-weight:600}.conditionList,.factorList,.constraintList{margin:0;padding:0;list-style:none}.conditionList li,.constraintList li{justify-content:space-between;align-items:baseline;gap:var(--space-4);padding:var(--space-2) 0;border-bottom:1px solid var(--rule);font-size:var(--fs-13);display:flex}.conditionList strong,.constraintList strong{white-space:nowrap;font-variant-numeric:tabular-nums}.constraintList li[data-binding=true]{font-weight:600}.factorList li{padding:var(--space-3) 0;border-bottom:1px solid var(--rule)}.factorList li>div{justify-content:space-between;gap:var(--space-1) var(--space-3);flex-wrap:wrap;display:flex}.factorList p{margin:var(--space-1) 0;font-size:var(--fs-13)}.factorList small{color:var(--subtle)}.factorStatus{font-size:var(--fs-12);color:var(--muted);font-weight:600}.factorList [data-status=meets_approval] .factorStatus{color:var(--positive)}.factorList [data-status=review_band] .factorStatus{color:var(--caution)}.factorList [data-status=below_decline_floor] .factorStatus{color:var(--negative)}.capacityFacts{gap:var(--space-3);margin:0;display:grid}.capacityFacts dt{font-size:var(--fs-12);color:var(--muted)}.capacityFacts dd{margin:var(--space-1) 0 0;font-size:var(--fs-16);font-variant-numeric:tabular-nums;font-weight:600}.analysisNotice{font-size:var(--fs-13)}.analysisNotice p{margin-top:0}.trendGrid{gap:var(--space-6);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.trendChart{min-width:0;margin:0}.trendChart figcaption{font-size:var(--fs-13);margin-bottom:var(--space-2);font-weight:600}.trendChart svg{width:100%;height:64px;display:block}.trendBar{fill:var(--accent)}.trendBar.negative{fill:var(--negative)}.trendBaseline{stroke:var(--rule-strong);stroke-width:1px;vector-effect:non-scaling-stroke}.trendLegend{gap:var(--space-1) var(--space-5);margin:var(--space-2) 0 0;font-size:var(--fs-12);color:var(--muted);flex-wrap:wrap;padding:0;list-style:none;display:flex}.trendLegend strong{margin-left:var(--space-2);color:var(--text);font-variant-numeric:tabular-nums}.historyAudit{gap:var(--space-4);display:grid}.compatibilityJson pre{max-height:600px;overflow-y:auto}.savedContext .recordDetails>span{margin-top:var(--space-2);display:block}.savedContext{align-items:flex-start;gap:var(--space-2);margin:var(--space-4) 0;padding:var(--space-4);border:1px solid var(--accent-border);border-radius:var(--radius);background:var(--accent-soft);font-size:var(--fs-12);overflow-wrap:anywhere;flex-direction:column;display:flex}.caseList{margin:var(--space-4) 0}.caseRow{align-items:center;gap:var(--space-4);padding:var(--space-4) 0;border-bottom:1px solid var(--rule);overflow-wrap:anywhere;flex-wrap:wrap;display:flex}.caseRow>div{flex:1;min-width:180px}.caseRow h3{margin:0 0 var(--space-2)}.caseRow p,.savedEvent p{font-size:var(--fs-12)}.savedEvent{overflow-wrap:anywhere;margin:var(--space-5) 0;border-top:1px solid var(--border)}.scenariosWorkspace{gap:var(--space-4);min-width:0;display:grid}.scenariosWorkspace p,.scenariosWorkspace small{font-size:var(--fs-13)}.scenarioComposer,.originalComparison,.comparisonArchive,.scenarioResult{overflow-wrap:anywhere}.scenarioRow{margin:var(--space-5) 0;padding:var(--space-4);border:1px solid var(--control-border);border-radius:var(--radius);min-width:0}.scenarioRow legend{color:var(--accent);padding:0 var(--space-2)}.scenarioFields{gap:var(--space-4);margin-bottom:var(--space-4);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.scenarioFields label,.scenarioSelect{min-width:0;font-size:var(--fs-13);display:block}.scenarioFields input,.scenarioFields textarea,.scenarioFields select,.scenarioSelect select{margin:var(--space-2) 0}.scenarioFields small{color:var(--subtle);line-height:1.5}.scenarioRationale{grid-column:1/-1}.scenarioOutcome strong{color:var(--positive)}.scenarioOutcome [data-outcome=review]{color:var(--caution)}.scenarioOutcome [data-outcome=decline]{color:var(--negative)}.scenarioFact{padding:var(--space-2) 0;border-bottom:1px solid var(--rule)}.scenarioFact h4{margin:var(--space-2) 0}.scenarioResult td small{white-space:normal;max-width:200px;display:block}.scenarioResult caption{text-align:left;font-size:var(--fs-13);color:var(--muted);padding:var(--space-3) 0}.scenariosWorkspace [role=alert]{color:var(--negative)}.originalComparisonJson pre{max-height:600px;overflow-y:auto}.reviewWorkspace{gap:var(--space-4);display:grid}.reviewWorkspace .panel{overflow-wrap:anywhere;min-width:0;margin-top:0}.reviewFacts{gap:var(--space-3) var(--space-6);grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));display:grid}.reviewFacts div{min-width:0}.reviewFacts dt,.reviewMetrics span{color:var(--muted);font-size:var(--fs-12)}.reviewFacts dd{margin:var(--space-1) 0 0;font-size:var(--fs-13)}.reviewMetrics{gap:var(--space-3);grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));display:grid}.reviewMetrics>div{padding:var(--space-4);border-radius:var(--radius);background:var(--sunken)}.reviewMetrics strong,.reviewMetrics small{margin-top:var(--space-2);display:block}.reviewMetrics small{color:var(--muted)}.reviewInclude{align-items:center;gap:var(--space-2);min-height:44px;margin-top:var(--space-4);display:flex}.reviewInclude input{flex:none;width:18px;height:18px}.reviewDownload{min-width:44px;min-height:44px;color:var(--accent);margin-bottom:var(--space-3);overflow-wrap:anywhere;align-items:center;display:inline-flex}.reviewWorkspace button{white-space:normal;max-width:100%}dialog{color:var(--text);background:var(--raised);border:1px solid var(--border-strong);border-radius:var(--radius-lg);box-shadow:var(--shadow-dialog);padding:var(--space-6);overflow-wrap:anywhere;width:480px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);overflow-y:auto}dialog::backdrop{background:var(--backdrop,#090e0c99)}dialog label{font-size:var(--fs-14);margin:var(--space-4) 0;display:block}dialog input,dialog textarea{margin-top:var(--space-2)}dialog [role=alert]{color:var(--negative);font-size:var(--fs-13)}@media (width<=1200px){.kpiTiles{grid-template-columns:repeat(3,minmax(0,1fr))}.kpiTile:nth-child(4){border-left:0}.kpiTile:nth-child(n+4){border-top:1px solid var(--border)}}@media (width<=900px){main{padding:var(--space-5)}.grid,.overviewGrid,.startOptions{grid-template-columns:1fr}.startOption{min-height:0}.panelTitle{gap:var(--space-1);flex-direction:column}}@media (width<=600px){.workspaceBrand{gap:var(--space-3)}.workspaceType{display:none}.brandActions{width:100%;margin-left:0}.brandActions>.disclosureMenu{margin-left:auto}.workspaceTabs{gap:var(--space-5)}.kpiTiles{grid-template-columns:repeat(2,minmax(0,1fr))}.kpiTile:nth-child(n){border-left:1px solid var(--border);border-top:1px solid var(--border)}.kpiTile:nth-child(odd){border-left:0}.kpiTile:nth-child(-n+2){border-top:0}.kpiTile{padding:var(--space-3)}.kpiTile strong{font-size:var(--fs-20)}.decision{padding:var(--space-4);flex-direction:column}.decision strong{font-size:var(--fs-24)}.trendGrid{grid-template-columns:1fr}.hostingNotice{padding:var(--space-3) var(--space-5)}.scenarioFields{grid-template-columns:1fr}.caseRow>div{flex-basis:100%;min-width:0}h1{font-size:var(--fs-24)}.panel{padding:var(--space-4)}.assumptionsGrid,.operand,.audit{grid-template-columns:1fr}.operand small,.audit small{grid-column:1}.assumption{gap:var(--space-2)}.assumption strong{white-space:normal}.panelTitle span{margin-bottom:var(--space-3)}}@media print{@page{margin:14mm}:root,.themeRoot{--canvas:var(--surface)}.themeRoot{-webkit-print-color-adjust:exact;print-color-adjust:exact}main{max-width:none;padding:0}.brandActions,.workspaceTabs,.moreMenu,.startOptions,.reviewInclude,.reviewDownload,button:not(.period,.rowEdit),dialog{display:none}.period,.rowEdit{color:inherit;background:0 0;border:0;padding:0;text-decoration:none}.panel{margin-top:var(--space-6);border:0;padding:0}.grid,.overviewGrid{grid-template-columns:1fr}.tableScroll{overflow:visible}tbody th{position:static}thead{display:table-header-group}tr,.metric,.assumption,.audit,.decision,.kpiTile,.trendChart{break-inside:avoid}h2,h3{break-after:avoid}}.assessmentPreparation{align-items:flex-start;gap:var(--space-4);padding:var(--space-5);margin-block:var(--space-4);border:1px solid var(--accent-border);border-radius:var(--radius-lg);background:var(--surface);color:var(--text);display:flex}.preparationContent{flex:1;min-width:0}.preparationContent strong{font-size:var(--fs-16)}.preparationContent p{margin:var(--space-2) 0 var(--space-3);color:var(--muted)}.preparationContent small{color:var(--muted)}.preparationSpinner{border:3px solid var(--accent-soft);border-top-color:var(--accent);border-radius:50%;flex:0 0 28px;height:28px;animation:.9s linear infinite preparationSpin}.preparationTrack{border-radius:var(--radius);background:var(--sunken);height:4px;margin-bottom:var(--space-3);overflow:hidden}.preparationTrack span{background:var(--accent);transform-origin:0;width:100%;height:100%;animation:linear forwards preparationFill;display:block}@keyframes preparationSpin{to{transform:rotate(360deg)}}@keyframes preparationFill{0%{transform:scaleX(.03)}to{transform:scaleX(.92)}}@media (prefers-reduced-motion:reduce){.preparationSpinner,.preparationTrack span{animation:none}.preparationTrack span{width:50%}}@media print{.assessmentPreparation{display:none}}@media (prefers-reduced-motion:reduce){*,:before,:after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}:root,.themeRoot{--space-5:24px;--space-7:32px;--space-9:48px;--space-10:64px;--control-border:#7b8b83;--border:#7b8b83}@media screen{:root[data-theme=dark],.themeRoot[data-theme=dark]{--control-border:#7d8d9a;--input-border:#7d8d9a;--border:#7d8d9a}}h1,h2,h3,h4,strong,b,summary{font-weight:600}p{max-width:70ch}button,select,input:not([type=checkbox]),summary{min-height:44px}button{min-width:44px}input[type=checkbox]{flex-shrink:0;width:24px;height:24px}select,input,textarea{font-variant-numeric:tabular-nums}.primaryNavigation{gap:var(--space-2);margin:var(--space-6) 0;flex-wrap:wrap;display:flex}.primaryNavigation button{font-size:var(--fs-14);flex:160px}.primaryNavigation [aria-current=page]{color:var(--accent);border-color:var(--accent);box-shadow:inset 0 -3px 0 var(--accent);font-weight:600}.sessionStatus{align-items:center;gap:var(--space-2) var(--space-4);font-size:var(--fs-12);padding:var(--space-3) 0;color:var(--muted);overflow-wrap:anywhere;flex-wrap:wrap;display:flex}.connectionBadge,.statusBadge,.allocationBadge{border:1px solid var(--border);border-radius:var(--radius-sm);padding:var(--space-1) var(--space-2);color:var(--text);background:var(--sunken);font-size:var(--fs-12);font-weight:600;display:inline-block}.requestDeadline{min-width:0;font-size:var(--fs-12);display:block}.requestSkeleton{background:var(--border);width:180px;max-width:100%;height:8px;margin-top:var(--space-1);opacity:.5;display:block}.composerPanel,.domainWorkspace,.contextPane,.analystWorkspace>*,.formField{min-width:0}.composerPanel h1{font-size:var(--fs-24)}.guidedForm{gap:var(--space-6);display:grid}.guidedForm fieldset{min-width:0;padding:var(--space-4);border:1px solid var(--border);border-radius:var(--radius);margin:0}.guidedForm legend{font-size:var(--fs-14);padding:0 var(--space-2);font-weight:600}.guidedForm details{border:1px solid var(--border);padding:var(--space-4);border-radius:var(--radius)}.guidedForm summary{cursor:pointer;align-items:center;display:flex}.guidedForm details[open]>summary{margin-bottom:var(--space-4)}.formGrid{gap:var(--space-4) var(--space-6);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.formField{align-content:start;gap:var(--space-2);display:grid}.formField label,.sampleSelector,.spreadMode{font-size:var(--fs-14);font-weight:500}.formField input,.formField select,.sampleSelector select,.spreadMode select,.caseFilters input,.caseFilters select{width:100%;min-width:0;padding:var(--space-2) var(--space-3);color:var(--text);background:var(--input-bg);border:1px solid var(--input-border);border-radius:var(--radius-sm);font:inherit;display:block}.formField small{color:var(--muted);font-size:var(--fs-12)}.formField input[aria-invalid=true],.formField select[aria-invalid=true]{border:2px solid var(--negative)}.fieldError{font-size:var(--fs-14);color:var(--negative)}.sampleSelector,.spreadMode{gap:var(--space-2);max-width:540px;margin-bottom:var(--space-6);display:grid}.structuralHints{gap:var(--space-2);flex-wrap:wrap;display:flex}.structuralHints>span{font-size:var(--fs-12);border:1px solid var(--border);padding:var(--space-2);border-radius:var(--radius-sm)}.structuralHints [data-valid=true]{background:var(--accent-soft)}.validationSummary{border:2px solid var(--negative);border-radius:var(--radius);padding:var(--space-4);background:var(--surface)}.validationSummary ul{padding-left:var(--space-6);margin-bottom:0}.validationSummary li small{font-size:var(--fs-12);display:block}.validationSummary button{text-align:left;overflow-wrap:anywhere;background:0 0;border:0;padding-left:0;text-decoration:underline}.checkboxField{align-items:center;gap:var(--space-3);min-height:44px;font-size:var(--fs-14);display:flex}.domainMetrics{gap:var(--space-4);margin:var(--space-6) 0;grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.domainMetrics article{border:1px solid var(--border);padding:var(--space-4);border-radius:var(--radius)}.domainMetrics article h3{margin-top:0}.domainMetrics article>strong{font-size:var(--fs-24);margin-bottom:var(--space-4);display:block}.domainWorkspace{gap:var(--space-6);overflow-wrap:anywhere;display:grid}.modelScope{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:var(--space-4);margin:var(--space-4) 0;font-size:var(--fs-14)}.modelScope p{margin-top:0}.modelScope>p{max-width:70ch}.analysisPanel{margin-top:var(--space-6)}.analysisPanel>summary{cursor:pointer;align-items:center;display:flex}.analysisPanel .tableScroll{margin-top:var(--space-4)}.scheduleScroll{max-height:480px;overflow:auto}.scheduleScroll thead th{z-index:2;background:var(--surface);position:sticky;top:0}.analysisPanel table{min-width:700px}.analysisPanel caption{text-align:left;padding:var(--space-3);font-size:var(--fs-14);font-weight:600}.gridCell{vertical-align:top;min-width:180px}.gridCell>span{font-size:var(--fs-14);text-align:right;margin-top:var(--space-2);display:block}.traceLink{color:inherit;text-underline-offset:3px;font:inherit;padding:var(--space-2) var(--space-1);background:0 0;border:0;text-decoration:underline}.traceFact{margin:var(--space-2) 0;text-align:left;width:100%;display:block}.contextPane{align-content:start;gap:var(--space-4);display:grid}.traceInspector{top:var(--space-4);overflow-wrap:anywhere;max-height:calc(100vh - 32px);position:sticky;overflow:auto}.traceInspector .panelTitle{align-items:flex-start}.traceOperands{padding:0;list-style:none}.traceOperands li{gap:var(--space-2);padding:var(--space-3) 0;border-bottom:1px solid var(--border);display:grid}.traceOperands strong{text-align:right;font-variant-numeric:tabular-nums}.traceOperands code,.traceOperands small{font-size:var(--fs-12)}.traceOperands [data-allocated=true]{background:var(--accent-soft);padding:var(--space-3)}.traceSupplied div{gap:var(--space-3);padding:var(--space-2) 0;grid-template-columns:1fr 1fr;display:grid}.traceSupplied dd{text-align:right;overflow-wrap:anywhere;margin:0}.reconciliationEquation{padding:var(--space-3);background:var(--sunken);border:1px solid var(--border)}.reconciliationEquation small{font-size:var(--fs-12);margin-top:var(--space-2);display:block}.editCompleteDraft{margin-bottom:var(--space-4)}.caseFilters{gap:var(--space-4);margin-bottom:var(--space-6);grid-template-columns:2fr 1fr 1fr;display:grid}.caseFilters label{gap:var(--space-2);font-size:var(--fs-14);min-width:0;display:grid}.scenarioChips{gap:var(--space-2);margin:var(--space-4) 0;flex-wrap:wrap;display:flex}.pendingPayload{white-space:pre-wrap;overflow-wrap:anywhere;max-height:360px;overflow:auto}@media (width<=900px){.traceInspector{max-height:none;position:static}}@media (width<=600px){main{padding:var(--space-4)}.formGrid,.caseFilters,.domainMetrics{grid-template-columns:minmax(0,1fr)}.primaryNavigation button{padding-inline:var(--space-2);flex-basis:calc(50% - 8px)}.composerPanel .panelTitle{flex-direction:column}.traceSupplied div{grid-template-columns:minmax(0,1fr)}}@media print{.primaryNavigation,.sessionStatus,.spreadMode,.editCompleteDraft{display:none}}.excelImport{min-width:0}.excelImport .sectionHeading{justify-content:space-between;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;display:flex}.excelDownloads{gap:var(--space-3);flex-wrap:wrap;margin-block:16px;display:flex}.buttonLink{border:1px solid var(--border-strong);border-radius:4px;justify-content:center;align-items:center;min-height:44px;padding:8px 16px;text-decoration:underline;display:inline-flex}.excelSheet{border:1px solid var(--border-strong);border-radius:4px;margin-block:16px;padding:12px}.excelSheet summary{cursor:pointer;align-content:center;min-height:44px;font-weight:600}.excelSheet .formGrid{margin-top:12px}.excelFilename{overflow-wrap:anywhere}.excelImport input[type=file]{width:100%;max-width:100%}.excelImport .fieldError,.excelImport small,.excelImport label{overflow-wrap:anywhere}.startScreen .startOption:first-child{grid-column:1/-1;min-width:0}.excelReadingSkeleton span{opacity:.45;background:var(--border);border-radius:4px;height:44px;display:block}", Zo = /* @__PURE__ */ new WeakMap(), Qo = ({ parentElement: e, data: t, setStateValue: n }) => {
	let r = Zo.get(e);
	if (r && r.transport.generation !== t.generation && (r.root.unmount(), r.transport.dispose(), Zo.delete(e), r = void 0), !r) {
		let i = e.querySelector(".react-root");
		if (!i) throw Error("Workspace mount unavailable");
		let a = document.createElement("style");
		a.textContent = Xo, e.prepend(a), Un(e);
		let o = new Yo(t.generation, (e) => n("requests", e));
		ne(t.generation, o.request);
		let c = (0, s.createRoot)(i);
		r = {
			root: c,
			transport: o
		}, Zo.set(e, r), c.render(/* @__PURE__ */ (0, U.jsx)(Xi, { children: /* @__PURE__ */ (0, U.jsxs)("div", {
			className: "embeddedWorkspace",
			children: [/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "hostingNotice",
				children: [/* @__PURE__ */ (0, U.jsx)("span", { children: "TESTING WORKSPACE" }), /* @__PURE__ */ (0, U.jsx)("span", { children: "Synthetic data only · saved test cases may reset when the host restarts" })]
			}), /* @__PURE__ */ (0, U.jsx)(qo, {})]
		}) }));
	}
	return r.transport.publish = (e) => n("requests", e), r.transport.accept(t.responses), () => {
		let t = Zo.get(e);
		t?.root.unmount(), t?.transport.dispose(), Zo.delete(e);
	};
};
export { Qo as default };
