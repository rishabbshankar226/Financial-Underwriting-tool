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
	var ee = /\/+/g;
	function te(e, t) {
		return typeof e == "object" && e && e.key != null ? O("" + e.key) : t.toString(36);
	}
	function ne(e, r, i, a, o) {
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
		if (c) return c = e, o = o(c), e = a === "" ? "." + te(c, 0) : a, x(o) ? (i = "", e != null && (i = e.replace(ee, "$&/") + "/"), ne(o, r, i, "", function(e) {
			return e;
		})) : o != null && (D(o) && (o = E(o, i + (!o.key || c && c.key === o.key ? "" : ("" + o.key).replace(ee, "$&/") + "/") + e)), r.push(o)), 1;
		if (c = 0, a = a === "" ? "." : a + ":", x(e)) for (var l = 0; l < e.length; l++) {
			s = e[l];
			var u = a + te(s, l);
			c += ne(s, r, i, u, o);
		}
		else if (u = p(e), typeof u == "function") for (e = u.call(e), l = 0; !(s = e.next()).done;) s = s.value, u = a + te(s, l++), c += ne(s, r, i, u, o);
		else if (s === "object") throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		return c;
	}
	function re(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ne(e, r, "", "", function(e) {
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
		map: re,
		forEach: function(e, t, n) {
			re(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return re(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return re(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!D(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	}, e.Component = _, e.Fragment = r, e.Profiler = a, e.PureComponent = y, e.StrictMode = i, e.Suspense = l, e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ae, e.act = oe, e.cloneElement = function(e, n, r) {
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
			if (n(c) !== null) m = !0, re(x);
			else {
				var t = n(l);
				t !== null && ie(b, t.startTime - e);
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
				g !== null && ie(b, g.startTime - i), u = !1;
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
				n ? ee() : (S = !1, C = null);
			}
		} else S = !1;
	}
	var ee;
	if (typeof v == "function") ee = function() {
		v(O);
	};
	else if (typeof MessageChannel < "u") {
		var te = new MessageChannel(), ne = te.port2;
		te.port1.onmessage = O, ee = function() {
			ne.postMessage(null);
		};
	} else ee = function() {
		g(O, 0);
	};
	function re(e) {
		C = e, S || (S = !0, ee());
	}
	function ie(t, n) {
		w = g(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_continueExecution = function() {
		m || p || (m = !0, re(x));
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (_(w), w = -1) : h = !0, ie(b, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, re(x))), r;
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
	var C = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, w = Symbol.for("react.element"), T = Symbol.for("react.portal"), E = Symbol.for("react.fragment"), D = Symbol.for("react.strict_mode"), O = Symbol.for("react.profiler"), ee = Symbol.for("react.provider"), te = Symbol.for("react.context"), ne = Symbol.for("react.forward_ref"), re = Symbol.for("react.suspense"), ie = Symbol.for("react.suspense_list"), k = Symbol.for("react.memo"), A = Symbol.for("react.lazy"), ae = Symbol.for("react.offscreen"), oe = Symbol.iterator;
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
	function pe(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case E: return "Fragment";
			case T: return "Portal";
			case O: return "Profiler";
			case D: return "StrictMode";
			case re: return "Suspense";
			case ie: return "SuspenseList";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case te: return (e.displayName || "Context") + ".Consumer";
			case ee: return (e._context.displayName || "Context") + ".Provider";
			case ne:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case k: return t = e.displayName || null, t === null ? pe(e.type) || "Memo" : t;
			case A:
				t = e._payload, e = e._init;
				try {
					return pe(e(t));
				} catch {}
		}
		return null;
	}
	function me(e) {
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
			case 16: return pe(t);
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
	function M(e) {
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
	function P(e) {
		e._valueTracker ||= he(e);
	}
	function ge(e) {
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
		n = M(t.value == null ? n : t.value), e._wrapperState = {
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
		var n = M(t.value), r = t.type;
		if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
		else if (r === "submit" || r === "reset") {
			e.removeAttribute("value");
			return;
		}
		t.hasOwnProperty("value") ? Ce(e, t.type, n) : t.hasOwnProperty("defaultValue") && Ce(e, t.type, M(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
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
			for (n = "" + M(n), t = null, i = 0; i < e.length; i++) {
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
	function F(e, t) {
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
		e._wrapperState = { initialValue: M(n) };
	}
	function I(e, t) {
		var n = M(t.value), r = M(t.defaultValue);
		n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
	}
	function De(e) {
		var t = e.textContent;
		t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
	}
	function L(e) {
		switch (e) {
			case "svg": return "http://www.w3.org/2000/svg";
			case "math": return "http://www.w3.org/1998/Math/MathML";
			default: return "http://www.w3.org/1999/xhtml";
		}
	}
	function Oe(e, t) {
		return e == null || e === "http://www.w3.org/1999/xhtml" ? L(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
	}
	var R, ke = function(e) {
		return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
			MSApp.execUnsafeLocalFunction(function() {
				return e(t, n, r, i);
			});
		} : e;
	}(function(e, t) {
		if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
		else {
			for (R ||= document.createElement("div"), R.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = R.firstChild; e.firstChild;) e.removeChild(e.firstChild);
			for (; t.firstChild;) e.appendChild(t.firstChild);
		}
	});
	function Ae(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var z = {
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
	Object.keys(z).forEach(function(e) {
		je.forEach(function(t) {
			t = t + e.charAt(0).toUpperCase() + e.substring(1), z[t] = z[e];
		});
	});
	function Me(e, t, n) {
		return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || z.hasOwnProperty(e) && z[e] ? ("" + t).trim() : t + "px";
	}
	function B(e, t) {
		for (var n in e = e.style, t) if (t.hasOwnProperty(n)) {
			var r = n.indexOf("--") === 0, i = Me(n, t[n], r);
			n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : e[n] = i;
		}
	}
	var Ne = j({ menuitem: !0 }, {
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
	function Pe(e, t) {
		if (t) {
			if (Ne[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(a(137, e));
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
		if (e = Ri(e)) {
			if (typeof Re != "function") throw Error(a(280));
			var t = e.stateNode;
			t && (t = Bi(t), Re(e.stateNode, e.type, t));
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
		var r = Bi(n);
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
	var V = !1, Qe = null, $e = !1, et = null, tt = { onError: function(e) {
		V = !0, Qe = e;
	} };
	function nt(e, t, n, r, i, a, o, s, c) {
		V = !1, Qe = null, Ze.apply(tt, arguments);
	}
	function rt(e, t, n, r, i, o, s, c, l) {
		if (nt.apply(this, arguments), V) {
			if (V) {
				var u = Qe;
				V = !1, Qe = null;
			} else throw Error(a(198));
			$e || ($e = !0, et = u);
		}
	}
	function it(e) {
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
	function at(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function ot(e) {
		if (it(e) !== e) throw Error(a(188));
	}
	function st(e) {
		var t = e.alternate;
		if (!t) {
			if (t = it(e), t === null) throw Error(a(188));
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
					if (o === n) return ot(i), e;
					if (o === r) return ot(i), t;
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
	function ct(e) {
		return e = st(e), e === null ? null : lt(e);
	}
	function lt(e) {
		if (e.tag === 5 || e.tag === 6) return e;
		for (e = e.child; e !== null;) {
			var t = lt(e);
			if (t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	var ut = r.unstable_scheduleCallback, dt = r.unstable_cancelCallback, ft = r.unstable_shouldYield, pt = r.unstable_requestPaint, H = r.unstable_now, mt = r.unstable_getCurrentPriorityLevel, ht = r.unstable_ImmediatePriority, gt = r.unstable_UserBlockingPriority, _t = r.unstable_NormalPriority, vt = r.unstable_LowPriority, yt = r.unstable_IdlePriority, bt = null, xt = null;
	function St(e) {
		if (xt && typeof xt.onCommitFiberRoot == "function") try {
			xt.onCommitFiberRoot(bt, e, void 0, (e.current.flags & 128) == 128);
		} catch {}
	}
	var Ct = Math.clz32 ? Math.clz32 : Et, wt = Math.log, Tt = Math.LN2;
	function Et(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (wt(e) / Tt | 0) | 0;
	}
	var Dt = 64, Ot = 4194304;
	function kt(e) {
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
	function At(e, t) {
		var n = e.pendingLanes;
		if (n === 0) return 0;
		var r = 0, i = e.suspendedLanes, a = e.pingedLanes, o = n & 268435455;
		if (o !== 0) {
			var s = o & ~i;
			s === 0 ? (a &= o, a !== 0 && (r = kt(a))) : r = kt(s);
		} else o = n & ~i, o === 0 ? a !== 0 && (r = kt(a)) : r = kt(o);
		if (r === 0) return 0;
		if (t !== 0 && t !== r && (t & i) === 0 && (i = r & -r, a = t & -t, i >= a || i === 16 && a & 4194240)) return t;
		if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t;) n = 31 - Ct(t), i = 1 << n, r |= e[n], t &= ~i;
		return r;
	}
	function jt(e, t) {
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
	function Mt(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes; 0 < a;) {
			var o = 31 - Ct(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = jt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
	}
	function Nt(e) {
		return e = e.pendingLanes & -1073741825, e === 0 ? e & 1073741824 ? 1073741824 : 0 : e;
	}
	function Pt() {
		var e = Dt;
		return Dt <<= 1, !(Dt & 4194240) && (Dt = 64), e;
	}
	function Ft(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function It(e, t, n) {
		e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Ct(t), e[t] = n;
	}
	function Lt(e, t) {
		var n = e.pendingLanes & ~t;
		e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
		var r = e.eventTimes;
		for (e = e.expirationTimes; 0 < n;) {
			var i = 31 - Ct(n), a = 1 << i;
			t[i] = 0, r[i] = -1, e[i] = -1, n &= ~a;
		}
	}
	function Rt(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Ct(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	var U = 0;
	function zt(e) {
		return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
	}
	var Bt, Vt, Ht, Ut, Wt, Gt = !1, Kt = [], qt = null, Jt = null, Yt = null, Xt = /* @__PURE__ */ new Map(), Zt = /* @__PURE__ */ new Map(), Qt = [], $t = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
	function en(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				qt = null;
				break;
			case "dragenter":
			case "dragleave":
				Jt = null;
				break;
			case "mouseover":
			case "mouseout":
				Yt = null;
				break;
			case "pointerover":
			case "pointerout":
				Xt.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": Zt.delete(t.pointerId);
		}
	}
	function tn(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Ri(t), t !== null && Vt(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function nn(e, t, n, r, i) {
		switch (t) {
			case "focusin": return qt = tn(qt, e, t, n, r, i), !0;
			case "dragenter": return Jt = tn(Jt, e, t, n, r, i), !0;
			case "mouseover": return Yt = tn(Yt, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return Xt.set(a, tn(Xt.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, Zt.set(a, tn(Zt.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function rn(e) {
		var t = Li(e.target);
		if (t !== null) {
			var n = it(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = at(n), t !== null) {
						e.blockedOn = t, Wt(e.priority, function() {
							Ht(n);
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
	function an(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = gn(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Ie = r, n.target.dispatchEvent(r), Ie = null;
			} else return t = Ri(n), t !== null && Vt(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function on(e, t, n) {
		an(e) && n.delete(t);
	}
	function sn() {
		Gt = !1, qt !== null && an(qt) && (qt = null), Jt !== null && an(Jt) && (Jt = null), Yt !== null && an(Yt) && (Yt = null), Xt.forEach(on), Zt.forEach(on);
	}
	function cn(e, t) {
		e.blockedOn === t && (e.blockedOn = null, Gt || (Gt = !0, r.unstable_scheduleCallback(r.unstable_NormalPriority, sn)));
	}
	function ln(e) {
		function t(t) {
			return cn(t, e);
		}
		if (0 < Kt.length) {
			cn(Kt[0], e);
			for (var n = 1; n < Kt.length; n++) {
				var r = Kt[n];
				r.blockedOn === e && (r.blockedOn = null);
			}
		}
		for (qt !== null && cn(qt, e), Jt !== null && cn(Jt, e), Yt !== null && cn(Yt, e), Xt.forEach(t), Zt.forEach(t), n = 0; n < Qt.length; n++) r = Qt[n], r.blockedOn === e && (r.blockedOn = null);
		for (; 0 < Qt.length && (n = Qt[0], n.blockedOn === null);) rn(n), n.blockedOn === null && Qt.shift();
	}
	var un = C.ReactCurrentBatchConfig, dn = !0;
	function fn(e, t, n, r) {
		var i = U, a = un.transition;
		un.transition = null;
		try {
			U = 1, mn(e, t, n, r);
		} finally {
			U = i, un.transition = a;
		}
	}
	function pn(e, t, n, r) {
		var i = U, a = un.transition;
		un.transition = null;
		try {
			U = 4, mn(e, t, n, r);
		} finally {
			U = i, un.transition = a;
		}
	}
	function mn(e, t, n, r) {
		if (dn) {
			var i = gn(e, t, n, r);
			if (i === null) li(e, t, r, hn, n), en(e, r);
			else if (nn(i, e, t, n, r)) r.stopPropagation();
			else if (en(e, r), t & 4 && -1 < $t.indexOf(e)) {
				for (; i !== null;) {
					var a = Ri(i);
					if (a !== null && Bt(a), a = gn(e, t, n, r), a === null && li(e, t, r, hn, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else li(e, t, r, null, n);
		}
	}
	var hn = null;
	function gn(e, t, n, r) {
		if (hn = null, e = Le(r), e = Li(e), e !== null) {
			if (t = it(e), t === null) e = null;
			else if (n = t.tag, n === 13) {
				if (e = at(t), e !== null) return e;
				e = null;
			} else if (n === 3) {
				if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
				e = null;
			} else t !== e && (e = null);
		}
		return hn = e, null;
	}
	function _n(e) {
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
			case "message": switch (mt()) {
				case ht: return 1;
				case gt: return 4;
				case _t:
				case vt: return 16;
				case yt: return 536870912;
				default: return 16;
			}
			default: return 16;
		}
	}
	var vn = null, yn = null, bn = null;
	function xn() {
		if (bn) return bn;
		var e, t = yn, n = t.length, r, i = "value" in vn ? vn.value : vn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return bn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Sn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Cn() {
		return !0;
	}
	function wn() {
		return !1;
	}
	function Tn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Cn : wn, this.isPropagationStopped = wn, this;
		}
		return j(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Cn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Cn);
			},
			persist: function() {},
			isPersistent: Cn
		}), t;
	}
	var En = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Dn = Tn(En), On = j({}, En, {
		view: 0,
		detail: 0
	}), kn = Tn(On), An, jn, Mn, Nn = j({}, On, {
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
		getModifierState: Wn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Mn && (Mn && e.type === "mousemove" ? (An = e.screenX - Mn.screenX, jn = e.screenY - Mn.screenY) : jn = An = 0, Mn = e), An);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : jn;
		}
	}), Pn = Tn(Nn), Fn = Tn(j({}, Nn, { dataTransfer: 0 })), In = Tn(j({}, On, { relatedTarget: 0 })), Ln = Tn(j({}, En, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Rn = Tn(j({}, En, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), zn = Tn(j({}, En, { data: 0 })), Bn = {
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
	}, Vn = {
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
	}, Hn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Un(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Hn[e]) ? !!t[e] : !1;
	}
	function Wn() {
		return Un;
	}
	var Gn = Tn(j({}, On, {
		key: function(e) {
			if (e.key) {
				var t = Bn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Sn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Vn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: Wn,
		charCode: function(e) {
			return e.type === "keypress" ? Sn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Sn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Kn = Tn(j({}, Nn, {
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
	})), qn = Tn(j({}, On, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Wn
	})), Jn = Tn(j({}, En, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Yn = Tn(j({}, Nn, {
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
		if (ar) return e === "compositionend" || !Zn && rr(e, t) ? (e = xn(), bn = yn = vn = null, ar = !1, e) : null;
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
		He(r), t = di(t, "onChange"), 0 < t.length && (n = new Dn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var dr = null, fr = null;
	function pr(e) {
		ii(e, 0);
	}
	function mr(e) {
		if (ge(zi(e))) return e;
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
			ur(t, fr, e, Le(e)), qe(pr, t);
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
		}), Rr && Or(Rr, r) || (Rr = r, r = di(Lr, "onSelect"), 0 < r.length && (t = new Dn("onSelect", "select", null, t, n), e.push({
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
		e.currentTarget = n, rt(r, t, void 0, e), e.currentTarget = null;
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
		if ($e) throw e = et, $e = !1, et = null, e;
	}
	function W(e, t) {
		var n = t[Pi];
		n === void 0 && (n = t[Pi] = /* @__PURE__ */ new Set());
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
		switch (_n(t)) {
			case 1:
				var i = fn;
				break;
			case 4:
				i = pn;
				break;
			default: i = mn;
		}
		n = i.bind(null, t, n, e), i = void 0, !Ye || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
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
					if (o = Li(s), o === null) return;
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
				var s = Xr.get(e);
				if (s !== void 0) {
					var c = Dn, l = e;
					switch (e) {
						case "keypress": if (Sn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Gn;
							break;
						case "focusin":
							l = "focus", c = In;
							break;
						case "focusout":
							l = "blur", c = In;
							break;
						case "beforeblur":
						case "afterblur":
							c = In;
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
							c = Pn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Fn;
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
							c = Ln;
							break;
						case Yr:
							c = Jn;
							break;
						case "scroll":
							c = kn;
							break;
						case "wheel":
							c = Yn;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Rn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup": c = Kn;
					}
					var u = !!(t & 4), d = !u && e === "scroll", f = u ? s === null ? null : s + "Capture" : s;
					u = [];
					for (var p = r, m; p !== null;) {
						m = p;
						var h = m.stateNode;
						if (m.tag === 5 && h !== null && (m = h, f !== null && (h = Je(p, f), h != null && u.push(ui(p, h, m)))), d) break;
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
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Ie && (l = n.relatedTarget || n.fromElement) && (Li(l) || l[Ni])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Li(l) : null, l !== null && (d = it(l), l !== d || l.tag !== 5 && l.tag !== 6) && (l = null)) : (c = null, l = r), c !== l)) {
						if (u = Pn, h = "onMouseLeave", f = "onMouseEnter", p = "mouse", (e === "pointerout" || e === "pointerover") && (u = Kn, h = "onPointerLeave", f = "onPointerEnter", p = "pointer"), d = c == null ? s : zi(c), m = l == null ? s : zi(l), s = new u(h, p + "leave", c, n, i), s.target = d, s.relatedTarget = m, h = null, Li(i) === r && (u = new u(f, p + "enter", l, n, i), u.target = m, u.relatedTarget = d, h = u), d = h, c && l) b: {
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
					if (s = r ? zi(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var g = hr;
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
				switch (_ = r ? zi(r) : window, e) {
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
				y && (er && n.locale !== "ko" && (ar || y !== "onCompositionStart" ? y === "onCompositionEnd" && ar && (v = xn()) : (vn = i, yn = "value" in vn ? vn.value : vn.textContent, ar = !0)), _ = di(r, y), 0 < _.length && (y = new zn(y, e, null, n, i), o.push({
					event: y,
					listeners: _
				}), v ? y.data = v : (v = ir(n), v !== null && (y.data = v)))), (v = $n ? or(e, n) : sr(e, n)) && (r = di(r, "onBeforeInput"), 0 < r.length && (i = new zn("onBeforeInput", "beforeinput", null, n, i), o.push({
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
			i.tag === 5 && a !== null && (i = a, a = Je(e, n), a != null && r.unshift(ui(e, a, i)), a = Je(e, t), a != null && r.push(ui(e, a, i))), e = e.return;
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
			s.tag === 5 && l !== null && (s = l, i ? (c = Je(n, a), c != null && o.unshift(ui(n, c, s))) : i || (c = Je(n, a), c != null && o.push(ui(n, c, s)))), n = n.return;
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
		return wi.resolve(null).then(e).catch(Ei);
	};
	function Ei(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Di(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$") {
					if (r === 0) {
						e.removeChild(i), ln(t);
						return;
					}
					r--;
				} else n !== "$" && n !== "$?" && n !== "$!" || r++;
			}
			n = i;
		} while (n);
		ln(t);
	}
	function Oi(e) {
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
	var Ai = Math.random().toString(36).slice(2), ji = "__reactFiber$" + Ai, Mi = "__reactProps$" + Ai, Ni = "__reactContainer$" + Ai, Pi = "__reactEvents$" + Ai, Fi = "__reactListeners$" + Ai, Ii = "__reactHandles$" + Ai;
	function Li(e) {
		var t = e[ji];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[Ni] || n[ji]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ki(e); e !== null;) {
					if (n = e[ji]) return n;
					e = ki(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Ri(e) {
		return e = e[ji] || e[Ni], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
	}
	function zi(e) {
		if (e.tag === 5 || e.tag === 6) return e.stateNode;
		throw Error(a(33));
	}
	function Bi(e) {
		return e[Mi] || null;
	}
	var Vi = [], Hi = -1;
	function Ui(e) {
		return { current: e };
	}
	function G(e) {
		0 > Hi || (e.current = Vi[Hi], Vi[Hi] = null, Hi--);
	}
	function K(e, t) {
		Hi++, Vi[Hi] = e.current, e.current = t;
	}
	var Wi = {}, Gi = Ui(Wi), Ki = Ui(!1), qi = Wi;
	function Ji(e, t) {
		var n = e.type.contextTypes;
		if (!n) return Wi;
		var r = e.stateNode;
		if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
		var i = {}, a;
		for (a in n) i[a] = t[a];
		return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = i), i;
	}
	function Yi(e) {
		return e = e.childContextTypes, e != null;
	}
	function Xi() {
		G(Ki), G(Gi);
	}
	function Zi(e, t, n) {
		if (Gi.current !== Wi) throw Error(a(168));
		K(Gi, t), K(Ki, n);
	}
	function Qi(e, t, n) {
		var r = e.stateNode;
		if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
		for (var i in r = r.getChildContext(), r) if (!(i in t)) throw Error(a(108, me(e) || "Unknown", i));
		return j({}, n, r);
	}
	function $i(e) {
		return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Wi, qi = Gi.current, K(Gi, e), K(Ki, Ki.current), !0;
	}
	function ea(e, t, n) {
		var r = e.stateNode;
		if (!r) throw Error(a(169));
		n ? (e = Qi(e, t, qi), r.__reactInternalMemoizedMergedChildContext = e, G(Ki), G(Gi), K(Gi, e)) : G(Ki), K(Ki, n);
	}
	var ta = null, na = !1, ra = !1;
	function ia(e) {
		ta === null ? ta = [e] : ta.push(e);
	}
	function aa(e) {
		na = !0, ia(e);
	}
	function oa() {
		if (!ra && ta !== null) {
			ra = !0;
			var e = 0, t = U;
			try {
				var n = ta;
				for (U = 1; e < n.length; e++) {
					var r = n[e];
					do
						r = r(!0);
					while (r !== null);
				}
				ta = null, na = !1;
			} catch (t) {
				throw ta !== null && (ta = ta.slice(e + 1)), ut(ht, oa), t;
			} finally {
				U = t, ra = !1;
			}
		}
		return null;
	}
	var sa = [], ca = 0, la = null, ua = 0, da = [], fa = 0, pa = null, ma = 1, ha = "";
	function ga(e, t) {
		sa[ca++] = ua, sa[ca++] = la, la = e, ua = t;
	}
	function _a(e, t, n) {
		da[fa++] = ma, da[fa++] = ha, da[fa++] = pa, pa = e;
		var r = ma;
		e = ha;
		var i = 32 - Ct(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Ct(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, ma = 1 << 32 - Ct(t) + i | n << i | r, ha = a + e;
		} else ma = 1 << a | n << i | r, ha = e;
	}
	function va(e) {
		e.return !== null && (ga(e, 1), _a(e, 1, 0));
	}
	function ya(e) {
		for (; e === la;) la = sa[--ca], sa[ca] = null, ua = sa[--ca], sa[ca] = null;
		for (; e === pa;) pa = da[--fa], da[fa] = null, ha = da[--fa], da[fa] = null, ma = da[--fa], da[fa] = null;
	}
	var ba = null, xa = null, q = !1, Sa = null;
	function Ca(e, t) {
		var n = Kl(5, null, null, 0);
		n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
	}
	function wa(e, t) {
		switch (e.tag) {
			case 5:
				var n = e.type;
				return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null && (e.stateNode = t, ba = e, xa = Oi(t.firstChild), !0);
			case 6: return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null && (e.stateNode = t, ba = e, xa = null, !0);
			case 13: return t = t.nodeType === 8 ? t : null, t !== null && (n = pa === null ? null : {
				id: ma,
				overflow: ha
			}, e.memoizedState = {
				dehydrated: t,
				treeContext: n,
				retryLane: 1073741824
			}, n = Kl(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, ba = e, xa = null, !0);
			default: return !1;
		}
	}
	function Ta(e) {
		return !!(e.mode & 1) && !(e.flags & 128);
	}
	function Ea(e) {
		if (q) {
			var t = xa;
			if (t) {
				var n = t;
				if (!wa(e, t)) {
					if (Ta(e)) throw Error(a(418));
					t = Oi(n.nextSibling);
					var r = ba;
					t && wa(e, t) ? Ca(r, n) : (e.flags = e.flags & -4097 | 2, q = !1, ba = e);
				}
			} else {
				if (Ta(e)) throw Error(a(418));
				e.flags = e.flags & -4097 | 2, q = !1, ba = e;
			}
		}
	}
	function Da(e) {
		for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;) e = e.return;
		ba = e;
	}
	function Oa(e) {
		if (e !== ba) return !1;
		if (!q) return Da(e), q = !0, !1;
		var t;
		if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !xi(e.type, e.memoizedProps)), t &&= xa) {
			if (Ta(e)) throw ka(), Error(a(418));
			for (; t;) Ca(e, t), t = Oi(t.nextSibling);
		}
		if (Da(e), e.tag === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(a(317));
			a: {
				for (e = e.nextSibling, t = 0; e;) {
					if (e.nodeType === 8) {
						var n = e.data;
						if (n === "/$") {
							if (t === 0) {
								xa = Oi(e.nextSibling);
								break a;
							}
							t--;
						} else n !== "$" && n !== "$!" && n !== "$?" || t++;
					}
					e = e.nextSibling;
				}
				xa = null;
			}
		} else xa = ba ? Oi(e.stateNode.nextSibling) : null;
		return !0;
	}
	function ka() {
		for (var e = xa; e;) e = Oi(e.nextSibling);
	}
	function Aa() {
		xa = ba = null, q = !1;
	}
	function ja(e) {
		Sa === null ? Sa = [e] : Sa.push(e);
	}
	var Ma = C.ReactCurrentBatchConfig;
	function Na(e, t, n) {
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
	function Pa(e, t) {
		throw e = Object.prototype.toString.call(t), Error(a(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
	}
	function Fa(e) {
		var t = e._init;
		return t(e._payload);
	}
	function Ia(e) {
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
			return a === E ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === A && Fa(a) === t.type) ? (r = i(t, n.props), r.ref = Na(e, t, n), r.return = e, r) : (r = Xl(n.type, n.key, n.props, null, e.mode, r), r.ref = Na(e, t, n), r.return = e, r);
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
					case w: return n = Xl(t.type, t.key, t.props, null, e.mode, n), n.ref = Na(e, null, t), n.return = e, n;
					case T: return t = eu(t, e.mode, n), t.return = e, t;
					case A:
						var r = t._init;
						return f(e, r(t._payload), n);
				}
				if (we(t) || se(t)) return t = Zl(t, e.mode, n, null), t.return = e, t;
				Pa(e, t);
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
					case A: return i = n._init, p(e, t, i(n._payload), r);
				}
				if (we(n) || se(n)) return i === null ? d(e, t, n, r, null) : null;
				Pa(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case w: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case T: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case A:
						var a = r._init;
						return m(e, t, n, a(r._payload), i);
				}
				if (we(r) || se(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				Pa(t, r);
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
			if (h === s.length) return n(i, d), q && ga(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return q && ga(i, h), l;
			}
			for (d = r(i, d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), q && ga(i, h), l;
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
			if (v.done) return n(i, h), q && ga(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return q && ga(i, g), u;
			}
			for (h = r(i, h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), q && ga(i, g), u;
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
									} else if (l.elementType === c || typeof c == "object" && c && c.$$typeof === A && Fa(c) === l.type) {
										n(e, l.sibling), r = i(l, a.props), r.ref = Na(e, l, a), r.return = e, e = r;
										break a;
									}
									n(e, l);
									break;
								}
								t(e, l), l = l.sibling;
							}
							a.type === E ? (r = Zl(a.props.children, e.mode, o, a.key), r.return = e, e = r) : (o = Xl(a.type, a.key, a.props, null, e.mode, o), o.ref = Na(e, r, a), o.return = e, e = o);
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
					case A: return l = a._init, _(e, r, l(a._payload), o);
				}
				if (we(a)) return h(e, r, a, o);
				if (se(a)) return g(e, r, a, o);
				Pa(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), r = i(r, a), r.return = e, e = r) : (n(e, r), r = $l(a, e.mode, o), r.return = e, e = r), s(e)) : n(e, r);
		}
		return _;
	}
	var La = Ia(!0), Ra = Ia(!1), za = Ui(null), Ba = null, Va = null, Ha = null;
	function Ua() {
		Ha = Va = Ba = null;
	}
	function Wa(e) {
		var t = za.current;
		G(za), e._currentValue = t;
	}
	function Ga(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Ka(e, t) {
		Ba = e, Ha = Va = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & t) !== 0 && (Ps = !0), e.firstContext = null);
	}
	function qa(e) {
		var t = e._currentValue;
		if (Ha !== e) {
			if (e = {
				context: e,
				memoizedValue: t,
				next: null
			}, Va === null) {
				if (Ba === null) throw Error(a(308));
				Va = e, Ba.dependencies = {
					lanes: 0,
					firstContext: e
				};
			} else Va = Va.next = e;
		}
		return t;
	}
	var Ja = null;
	function Ya(e) {
		Ja === null ? Ja = [e] : Ja.push(e);
	}
	function Xa(e, t, n, r) {
		var i = t.interleaved;
		return i === null ? (n.next = n, Ya(t)) : (n.next = i.next, i.next = n), t.interleaved = n, Za(e, r);
	}
	function Za(e, t) {
		e.lanes |= t;
		var n = e.alternate;
		for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null;) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
		return n.tag === 3 ? n.stateNode : null;
	}
	var Qa = !1;
	function $a(e) {
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
	function eo(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			effects: e.effects
		});
	}
	function to(e, t) {
		return {
			eventTime: e,
			lane: t,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function no(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, Z & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, Za(e, n);
		}
		return i = r.interleaved, i === null ? (t.next = t, Ya(r)) : (t.next = i.next, i.next = t), r.interleaved = t, Za(e, n);
	}
	function ro(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194240)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Rt(e, n);
		}
	}
	function io(e, t) {
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
	function ao(e, t, n, r) {
		var i = e.updateQueue;
		Qa = !1;
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
							case 2: Qa = !0;
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
	function oo(e, t, n) {
		if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
			var r = e[t], i = r.callback;
			if (i !== null) {
				if (r.callback = null, r = n, typeof i != "function") throw Error(a(191, i));
				i.call(r);
			}
		}
	}
	var so = {}, co = Ui(so), lo = Ui(so), uo = Ui(so);
	function fo(e) {
		if (e === so) throw Error(a(174));
		return e;
	}
	function po(e, t) {
		switch (K(uo, t), K(lo, e), K(co, so), e = t.nodeType, e) {
			case 9:
			case 11:
				t = (t = t.documentElement) ? t.namespaceURI : Oe(null, "");
				break;
			default: e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Oe(t, e);
		}
		G(co), K(co, t);
	}
	function mo() {
		G(co), G(lo), G(uo);
	}
	function ho(e) {
		fo(uo.current);
		var t = fo(co.current), n = Oe(t, e.type);
		t !== n && (K(lo, e), K(co, n));
	}
	function go(e) {
		lo.current === e && (G(co), G(lo));
	}
	var J = Ui(0);
	function _o(e) {
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
	var vo = [];
	function yo() {
		for (var e = 0; e < vo.length; e++) vo[e]._workInProgressVersionPrimary = null;
		vo.length = 0;
	}
	var bo = C.ReactCurrentDispatcher, xo = C.ReactCurrentBatchConfig, So = 0, Y = null, Co = null, wo = null, To = !1, Eo = !1, Do = 0, Oo = 0;
	function ko() {
		throw Error(a(321));
	}
	function Ao(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Dr(e[n], t[n])) return !1;
		return !0;
	}
	function jo(e, t, n, r, i, o) {
		if (So = o, Y = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, bo.current = e === null || e.memoizedState === null ? ms : hs, e = n(r, i), Eo) {
			o = 0;
			do {
				if (Eo = !1, Do = 0, 25 <= o) throw Error(a(301));
				o += 1, wo = Co = null, t.updateQueue = null, bo.current = gs, e = n(r, i);
			} while (Eo);
		}
		if (bo.current = ps, t = Co !== null && Co.next !== null, So = 0, wo = Co = Y = null, To = !1, t) throw Error(a(300));
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
		return wo === null ? Y.memoizedState = wo = e : wo = wo.next = e, wo;
	}
	function Po() {
		if (Co === null) {
			var e = Y.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Co.next;
		var t = wo === null ? Y.memoizedState : wo.next;
		if (t !== null) wo = t, Co = e;
		else {
			if (e === null) throw Error(a(310));
			Co = e, e = {
				memoizedState: Co.memoizedState,
				baseState: Co.baseState,
				baseQueue: Co.baseQueue,
				queue: Co.queue,
				next: null
			}, wo === null ? Y.memoizedState = wo = e : wo = wo.next = e;
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
		var r = Co, i = r.baseQueue, o = n.pending;
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
				if ((So & d) === d) l !== null && (l = l.next = {
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
					l === null ? (c = l = f, s = r) : l = l.next = f, Y.lanes |= d, Yc |= d;
				}
				u = u.next;
			} while (u !== null && u !== o);
			l === null ? s = r : l.next = c, Dr(r, t.memoizedState) || (Ps = !0), t.memoizedState = r, t.baseState = s, t.baseQueue = l, n.lastRenderedState = r;
		}
		if (e = n.interleaved, e !== null) {
			i = e;
			do
				o = i.lane, Y.lanes |= o, Yc |= o, i = i.next;
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
			Dr(o, t.memoizedState) || (Ps = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function Ro() {}
	function zo(e, t) {
		var n = Y, r = Po(), i = t(), o = !Dr(r.memoizedState, i);
		if (o && (r.memoizedState = i, Ps = !0), r = r.queue, Zo(Ho.bind(null, n, r, e), [e]), r.getSnapshot !== t || o || wo !== null && wo.memoizedState.tag & 1) {
			if (n.flags |= 2048, Ko(9, Vo.bind(null, n, r, i, t), void 0, null), Uc === null) throw Error(a(349));
			So & 30 || Bo(n, t, i);
		}
		return i;
	}
	function Bo(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = Y.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, Y.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
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
			return !Dr(e, n);
		} catch {
			return !0;
		}
	}
	function Wo(e) {
		var t = Za(e, 1);
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
		}, t.queue = e, e = e.dispatch = ls.bind(null, Y, e), [t.memoizedState, e];
	}
	function Ko(e, t, n, r) {
		return e = {
			tag: e,
			create: t,
			destroy: n,
			deps: r,
			next: null
		}, t = Y.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, Y.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
	}
	function qo() {
		return Po().memoizedState;
	}
	function Jo(e, t, n, r) {
		var i = No();
		Y.flags |= e, i.memoizedState = Ko(1 | t, n, void 0, r === void 0 ? null : r);
	}
	function Yo(e, t, n, r) {
		var i = Po();
		r = r === void 0 ? null : r;
		var a = void 0;
		if (Co !== null) {
			var o = Co.memoizedState;
			if (a = o.destroy, r !== null && Ao(r, o.deps)) {
				i.memoizedState = Ko(t, n, a, r);
				return;
			}
		}
		Y.flags |= e, i.memoizedState = Ko(1 | t, n, a, r);
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
		return So & 21 ? (Dr(n, t) || (n = Pt(), Y.lanes |= n, Yc |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, Ps = !0), e.memoizedState = n);
	}
	function os(e, t) {
		var n = U;
		U = n !== 0 && 4 > n ? n : 4, e(!0);
		var r = xo.transition;
		xo.transition = {};
		try {
			e(!1), t();
		} finally {
			U = n, xo.transition = r;
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
		else if (n = Xa(e, t, n, r), n !== null) {
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
				if (i.hasEagerState = !0, i.eagerState = s, Dr(s, o)) {
					var c = t.interleaved;
					c === null ? (i.next = i, Ya(t)) : (i.next = c.next, c.next = i), t.interleaved = i;
					return;
				}
			} catch {}
			n = Xa(e, t, i, r), n !== null && (i = pl(), hl(n, e, r, i), fs(n, t, r));
		}
	}
	function us(e) {
		var t = e.alternate;
		return e === Y || t !== null && t === Y;
	}
	function ds(e, t) {
		Eo = To = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function fs(e, t, n) {
		if (n & 4194240) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Rt(e, n);
		}
	}
	var ps = {
		readContext: qa,
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
		readContext: qa,
		useCallback: function(e, t) {
			return No().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: qa,
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
			}, r.queue = e, e = e.dispatch = cs.bind(null, Y, e), [r.memoizedState, e];
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
			var r = Y, i = No();
			if (q) {
				if (n === void 0) throw Error(a(407));
				n = n();
			} else {
				if (n = t(), Uc === null) throw Error(a(349));
				So & 30 || Bo(r, t, n);
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
			if (q) {
				var n = ha, r = ma;
				n = (r & ~(1 << 32 - Ct(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Do++, 0 < n && (t += "H" + n.toString(32)), t += ":";
			} else n = Oo++, t = ":" + t + "r" + n.toString(32) + ":";
			return e.memoizedState = t;
		},
		unstable_isNewReconciler: !1
	}, hs = {
		readContext: qa,
		useCallback: rs,
		useContext: qa,
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
			return as(Po(), Co.memoizedState, e);
		},
		useTransition: function() {
			return [Io(Fo)[0], Po().memoizedState];
		},
		useMutableSource: Ro,
		useSyncExternalStore: zo,
		useId: ss,
		unstable_isNewReconciler: !1
	}, gs = {
		readContext: qa,
		useCallback: rs,
		useContext: qa,
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
			return Co === null ? t.memoizedState = e : as(t, Co.memoizedState, e);
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
			for (var n in t = j({}, t), e = e.defaultProps, e) t[n] === void 0 && (t[n] = e[n]);
			return t;
		}
		return t;
	}
	function vs(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : j({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var ys = {
		isMounted: function(e) {
			return (e = e._reactInternals) ? it(e) === e : !1;
		},
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = pl(), i = ml(e), a = to(r, i);
			a.payload = t, n != null && (a.callback = n), t = no(e, a, i), t !== null && (hl(t, e, i, r), ro(t, e, i));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = pl(), i = ml(e), a = to(r, i);
			a.tag = 1, a.payload = t, n != null && (a.callback = n), t = no(e, a, i), t !== null && (hl(t, e, i, r), ro(t, e, i));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = pl(), r = ml(e), i = to(n, r);
			i.tag = 2, t != null && (i.callback = t), t = no(e, i, r), t !== null && (hl(t, e, r, n), ro(t, e, r));
		}
	};
	function bs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Or(n, r) || !Or(i, a) : !0;
	}
	function xs(e, t, n) {
		var r = !1, i = Wi, a = t.contextType;
		return typeof a == "object" && a ? a = qa(a) : (i = Yi(t) ? qi : Gi.current, r = t.contextTypes, a = (r = r != null) ? Ji(e, i) : Wi), t = new t(n, a), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = ys, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = i, e.__reactInternalMemoizedMaskedChildContext = a), t;
	}
	function Ss(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && ys.enqueueReplaceState(t, t.state, null);
	}
	function Cs(e, t, n, r) {
		var i = e.stateNode;
		i.props = n, i.state = e.memoizedState, i.refs = {}, $a(e);
		var a = t.contextType;
		typeof a == "object" && a ? i.context = qa(a) : (a = Yi(t) ? qi : Gi.current, i.context = Ji(e, a)), i.state = e.memoizedState, a = t.getDerivedStateFromProps, typeof a == "function" && (vs(e, t, a, n), i.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), t !== i.state && ys.enqueueReplaceState(i, i.state, null), ao(e, n, i, r), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.flags |= 4194308);
	}
	function ws(e, t) {
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
		n = to(-1, n), n.tag = 3, n.payload = { element: null };
		var r = t.value;
		return n.callback = function() {
			rl || (rl = !0, il = r), Es(e, t);
		}, n;
	}
	function ks(e, t, n) {
		n = to(-1, n), n.tag = 3;
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
		return e.mode & 1 ? (e.flags |= 65536, e.lanes = i, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = to(-1, 1), t.tag = 2, no(n, t, 1))), n.lanes |= 1), e);
	}
	var Ns = C.ReactCurrentOwner, Ps = !1;
	function Fs(e, t, n, r) {
		t.child = e === null ? Ra(t, null, n, r) : La(t, e.child, n, r);
	}
	function Is(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		return Ka(t, i), r = jo(e, t, n, r, a, i), n = Mo(), e !== null && !Ps ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, nc(e, t, i)) : (q && n && va(t), t.flags |= 1, Fs(e, t, r, i), t.child);
	}
	function Ls(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ql(a) && a.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = a, Rs(e, t, a, r, i)) : (e = Xl(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, (e.lanes & i) === 0) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Or : n, n(o, r) && e.ref === t.ref) return nc(e, t, i);
		}
		return t.flags |= 1, e = Yl(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Rs(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Or(a, r) && e.ref === t.ref) {
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
			}, K(Kc, Gc), Gc |= n;
			else {
				if (!(n & 1073741824)) return e = a === null ? n : a.baseLanes | n, t.lanes = t.childLanes = 1073741824, t.memoizedState = {
					baseLanes: e,
					cachePool: null,
					transitions: null
				}, t.updateQueue = null, K(Kc, Gc), Gc |= e, null;
				t.memoizedState = {
					baseLanes: 0,
					cachePool: null,
					transitions: null
				}, r = a === null ? n : a.baseLanes, K(Kc, Gc), Gc |= r;
			}
		} else a === null ? r = n : (r = a.baseLanes | n, t.memoizedState = null), K(Kc, Gc), Gc |= r;
		return Fs(e, t, i, n), t.child;
	}
	function Bs(e, t) {
		var n = t.ref;
		(e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
	}
	function Vs(e, t, n, r, i) {
		var a = Yi(n) ? qi : Gi.current;
		return a = Ji(t, a), Ka(t, i), n = jo(e, t, n, r, a, i), r = Mo(), e !== null && !Ps ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, nc(e, t, i)) : (q && r && va(t), t.flags |= 1, Fs(e, t, n, i), t.child);
	}
	function Hs(e, t, n, r, i) {
		if (Yi(n)) {
			var a = !0;
			$i(t);
		} else a = !1;
		if (Ka(t, i), t.stateNode === null) tc(e, t), xs(t, n, r), Cs(t, n, r, i), r = !0;
		else if (e === null) {
			var o = t.stateNode, s = t.memoizedProps;
			o.props = s;
			var c = o.context, l = n.contextType;
			typeof l == "object" && l ? l = qa(l) : (l = Yi(n) ? qi : Gi.current, l = Ji(t, l));
			var u = n.getDerivedStateFromProps, d = typeof u == "function" || typeof o.getSnapshotBeforeUpdate == "function";
			d || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== r || c !== l) && Ss(t, o, r, l), Qa = !1;
			var f = t.memoizedState;
			o.state = f, ao(t, r, o, i), c = t.memoizedState, s !== r || f !== c || Ki.current || Qa ? (typeof u == "function" && (vs(t, n, u, r), c = t.memoizedState), (s = Qa || bs(t, n, s, r, f, c, l)) ? (d || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = c), o.props = r, o.state = c, o.context = l, r = s) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			o = t.stateNode, eo(e, t), s = t.memoizedProps, l = t.type === t.elementType ? s : _s(t.type, s), o.props = l, d = t.pendingProps, f = o.context, c = n.contextType, typeof c == "object" && c ? c = qa(c) : (c = Yi(n) ? qi : Gi.current, c = Ji(t, c));
			var p = n.getDerivedStateFromProps;
			(u = typeof p == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== d || f !== c) && Ss(t, o, r, c), Qa = !1, f = t.memoizedState, o.state = f, ao(t, r, o, i);
			var m = t.memoizedState;
			s !== d || f !== m || Ki.current || Qa ? (typeof p == "function" && (vs(t, n, p, r), m = t.memoizedState), (l = Qa || bs(t, n, l, r, f, m, c) || !1) ? (u || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, m, c), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, m, c)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = m), o.props = r, o.state = m, o.context = c, r = l) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return Us(e, t, n, r, a, i);
	}
	function Us(e, t, n, r, i, a) {
		Bs(e, t);
		var o = !!(t.flags & 128);
		if (!r && !o) return i && ea(t, n, !1), nc(e, t, a);
		r = t.stateNode, Ns.current = t;
		var s = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
		return t.flags |= 1, e !== null && o ? (t.child = La(t, e.child, null, a), t.child = La(t, null, s, a)) : Fs(e, t, s, a), t.memoizedState = r.state, i && ea(t, n, !0), t.child;
	}
	function Ws(e) {
		var t = e.stateNode;
		t.pendingContext ? Zi(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Zi(e, t.context, !1), po(e, t.containerInfo);
	}
	function Gs(e, t, n, r, i) {
		return Aa(), ja(i), t.flags |= 256, Fs(e, t, n, r), t.child;
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
		var r = t.pendingProps, i = J.current, a = !1, o = !!(t.flags & 128), s;
		if ((s = o) || (s = e !== null && e.memoizedState === null ? !1 : !!(i & 2)), s ? (a = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (i |= 1), K(J, i & 1), e === null) return Ea(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.lanes = t.mode & 1 ? e.data === "$!" ? 8 : 1073741824 : 1, null) : (o = r.children, e = r.fallback, a ? (r = t.mode, a = t.child, o = {
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
		return r !== null && ja(r), La(t, e.child, null, n), e = Ys(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Zs(e, t, n, r, i, o, s) {
		if (n) return t.flags & 256 ? (t.flags &= -257, r = Ts(Error(a(422))), Xs(e, t, s, r)) : t.memoizedState === null ? (o = r.fallback, i = t.mode, r = Ql({
			mode: "visible",
			children: r.children
		}, i, 0, null), o = Zl(o, i, s, null), o.flags |= 2, r.return = t, o.return = t, r.sibling = o, t.child = r, t.mode & 1 && La(t, e.child, null, s), t.child.memoizedState = qs(s), t.memoizedState = Ks, o) : (t.child = e.child, t.flags |= 128, null);
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
				i = (i & (r.suspendedLanes | s)) === 0 ? i : 0, i !== 0 && i !== o.retryLane && (o.retryLane = i, Za(e, i), hl(r, e, i, -1));
			}
			return kl(), r = Ts(Error(a(421))), Xs(e, t, s, r);
		}
		return i.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Vl.bind(null, e), i._reactRetry = t, null) : (e = o.treeContext, xa = Oi(i.nextSibling), ba = t, q = !0, Sa = null, e !== null && (da[fa++] = ma, da[fa++] = ha, da[fa++] = pa, ma = e.id, ha = e.overflow, pa = t), t = Ys(t, r.children), t.flags |= 4096, t);
	}
	function Qs(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Ga(e.return, t, n);
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
		if (Fs(e, t, r.children, n), r = J.current, r & 2) r = r & 1 | 2, t.flags |= 128;
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
		if (K(J, r), !(t.mode & 1)) t.memoizedState = null;
		else switch (i) {
			case "forwards":
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && _o(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), $s(t, !1, i, n, a);
				break;
			case "backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && _o(e) === null) {
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
				Ws(t), Aa();
				break;
			case 5:
				ho(t);
				break;
			case 1:
				Yi(t.type) && $i(t);
				break;
			case 4:
				po(t, t.stateNode.containerInfo);
				break;
			case 10:
				var r = t.type._context, i = t.memoizedProps.value;
				K(za, r._currentValue), r._currentValue = i;
				break;
			case 13:
				if (r = t.memoizedState, r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (K(J, J.current & 1), e = nc(e, t, n), e === null ? null : e.sibling) : Js(e, t, n) : (K(J, J.current & 1), t.flags |= 128, null);
				K(J, J.current & 1);
				break;
			case 19:
				if (r = (n & t.childLanes) !== 0, e.flags & 128) {
					if (r) return ec(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), K(J, J.current), r) break;
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
			e = t.stateNode, fo(co.current);
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
			Pe(n, r);
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
	}, oc = function(e, t, n, r) {
		n !== r && (t.flags |= 4);
	};
	function sc(e, t) {
		if (!q) switch (e.tailMode) {
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
		switch (ya(t), t.tag) {
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
			case 1: return Yi(t.type) && Xi(), cc(t), null;
			case 3: return r = t.stateNode, mo(), G(Ki), G(Gi), yo(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Oa(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Sa !== null && (yl(Sa), Sa = null))), cc(t), null;
			case 5:
				go(t);
				var i = fo(uo.current);
				if (n = t.type, e !== null && t.stateNode != null) ac(e, t, n, r, i), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(a(166));
						return cc(t), null;
					}
					if (e = fo(co.current), Oa(t)) {
						r = t.stateNode, n = t.type;
						var o = t.memoizedProps;
						switch (r[ji] = t, r[Mi] = o, e = !!(t.mode & 1), n) {
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
							case "textarea": F(r, o), W("invalid", r);
						}
						for (var c in Pe(n, o), i = null, o) if (o.hasOwnProperty(c)) {
							var l = o[c];
							c === "children" ? typeof l == "string" ? r.textContent !== l && (!0 !== o.suppressHydrationWarning && _i(r.textContent, l, e), i = ["children", l]) : typeof l == "number" && r.textContent !== "" + l && (!0 !== o.suppressHydrationWarning && _i(r.textContent, l, e), i = ["children", "" + l]) : s.hasOwnProperty(c) && l != null && c === "onScroll" && W("scroll", r);
						}
						switch (n) {
							case "input":
								P(r), Se(r, o, !0);
								break;
							case "textarea":
								P(r), De(r);
								break;
							case "select":
							case "option": break;
							default: typeof o.onClick == "function" && (r.onclick = vi);
						}
						r = i, t.updateQueue = r, r !== null && (t.flags |= 4);
					} else {
						c = i.nodeType === 9 ? i : i.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = L(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = c.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = c.createElement(n, { is: r.is }) : (e = c.createElement(n), n === "select" && (c = e, r.multiple ? c.multiple = !0 : r.size && (c.size = r.size))) : e = c.createElementNS(e, n), e[ji] = t, e[Mi] = r, ic(e, t, !1, !1), t.stateNode = e;
						a: {
							switch (c = Fe(n, r), n) {
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
									F(e, r), i = Ee(e, r), W("invalid", e);
									break;
								default: i = r;
							}
							for (o in Pe(n, i), l = i, l) if (l.hasOwnProperty(o)) {
								var u = l[o];
								o === "style" ? B(e, u) : o === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && ke(e, u)) : o === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && Ae(e, u) : typeof u == "number" && Ae(e, "" + u) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (s.hasOwnProperty(o) ? u != null && o === "onScroll" && W("scroll", e) : u != null && S(e, o, u, c));
							}
							switch (n) {
								case "input":
									P(e), Se(e, r, !1);
									break;
								case "textarea":
									P(e), De(e);
									break;
								case "option":
									r.value != null && e.setAttribute("value", "" + M(r.value));
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
				return cc(t), null;
			case 6:
				if (e && t.stateNode != null) oc(e, t, e.memoizedProps, r);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(a(166));
					if (n = fo(uo.current), fo(co.current), Oa(t)) {
						if (r = t.stateNode, n = t.memoizedProps, r[ji] = t, (o = r.nodeValue !== n) && (e = ba, e !== null)) switch (e.tag) {
							case 3:
								_i(r.nodeValue, n, !!(e.mode & 1));
								break;
							case 5: !0 !== e.memoizedProps.suppressHydrationWarning && _i(r.nodeValue, n, !!(e.mode & 1));
						}
						o && (t.flags |= 4);
					} else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[ji] = t, t.stateNode = r;
				}
				return cc(t), null;
			case 13:
				if (G(J), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (q && xa !== null && t.mode & 1 && !(t.flags & 128)) ka(), Aa(), t.flags |= 98560, o = !1;
					else if (o = Oa(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!o) throw Error(a(318));
							if (o = t.memoizedState, o = o === null ? null : o.dehydrated, !o) throw Error(a(317));
							o[ji] = t;
						} else Aa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						cc(t), o = !1;
					} else Sa !== null && (yl(Sa), Sa = null), o = !0;
					if (!o) return t.flags & 65536 ? t : null;
				}
				return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || J.current & 1 ? qc === 0 && (qc = 3) : kl())), t.updateQueue !== null && (t.flags |= 4), cc(t), null);
			case 4: return mo(), e === null && si(t.stateNode.containerInfo), cc(t), null;
			case 10: return Wa(t.type._context), cc(t), null;
			case 17: return Yi(t.type) && Xi(), cc(t), null;
			case 19:
				if (G(J), o = t.memoizedState, o === null) return cc(t), null;
				if (r = !!(t.flags & 128), c = o.rendering, c === null) {
					if (r) sc(o, !1);
					else {
						if (qc !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (c = _o(e), c !== null) {
								for (t.flags |= 128, sc(o, !1), r = c.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null;) o = n, e = r, o.flags &= 14680066, c = o.alternate, c === null ? (o.childLanes = 0, o.lanes = e, o.child = null, o.subtreeFlags = 0, o.memoizedProps = null, o.memoizedState = null, o.updateQueue = null, o.dependencies = null, o.stateNode = null) : (o.childLanes = c.childLanes, o.lanes = c.lanes, o.child = c.child, o.subtreeFlags = 0, o.deletions = null, o.memoizedProps = c.memoizedProps, o.memoizedState = c.memoizedState, o.updateQueue = c.updateQueue, o.type = c.type, e = c.dependencies, o.dependencies = e === null ? null : {
									lanes: e.lanes,
									firstContext: e.firstContext
								}), n = n.sibling;
								return K(J, J.current & 1 | 2), t.child;
							}
							e = e.sibling;
						}
						o.tail !== null && H() > tl && (t.flags |= 128, r = !0, sc(o, !1), t.lanes = 4194304);
					}
				} else {
					if (!r) {
						if (e = _o(c), e !== null) {
							if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), sc(o, !0), o.tail === null && o.tailMode === "hidden" && !c.alternate && !q) return cc(t), null;
						} else 2 * H() - o.renderingStartTime > tl && n !== 1073741824 && (t.flags |= 128, r = !0, sc(o, !1), t.lanes = 4194304);
					}
					o.isBackwards ? (c.sibling = t.child, t.child = c) : (n = o.last, n === null ? t.child = c : n.sibling = c, o.last = c);
				}
				return o.tail === null ? (cc(t), null) : (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = H(), t.sibling = null, n = J.current, K(J, r ? n & 1 | 2 : n & 1), t);
			case 22:
			case 23: return Tl(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Gc & 1073741824 && (cc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : cc(t), null;
			case 24: return null;
			case 25: return null;
		}
		throw Error(a(156, t.tag));
	}
	function uc(e, t) {
		switch (ya(t), t.tag) {
			case 1: return Yi(t.type) && Xi(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return mo(), G(Ki), G(Gi), yo(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 5: return go(t), null;
			case 13:
				if (G(J), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(a(340));
					Aa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return G(J), null;
			case 4: return mo(), null;
			case 10: return Wa(t.type._context), null;
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
		if (yi = dn, e = Mr(), Nr(e)) {
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
		}, dn = !1, X = t; X !== null;) if (t = X, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, X = e;
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
		t !== null && (e.alternate = null, xc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[ji], delete t[Mi], delete t[Pi], delete t[Fi], delete t[Ii])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
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
		if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = vi));
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
		if (xt && typeof xt.onCommitFiberUnmount == "function") try {
			xt.onCommitFiberUnmount(bt, n);
		} catch {}
		switch (n.tag) {
			case 5: fc || mc(n, t);
			case 6:
				var r = Ec, i = Dc;
				Ec = null, Oc(e, t, n), Ec = r, Dc = i, Ec !== null && (Dc ? (e = Ec, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : Ec.removeChild(n.stateNode));
				break;
			case 18:
				Ec !== null && (Dc ? (e = Ec, n = n.stateNode, e.nodeType === 8 ? Di(e.parentNode, n) : e.nodeType === 1 && Di(e, n), ln(e)) : Di(Ec, n.stateNode));
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
						Ae(i, "");
					} catch (t) {
						$(e, e.return, t);
					}
				}
				if (r & 4 && (i = e.stateNode, i != null)) {
					var o = e.memoizedProps, s = n === null ? o : n.memoizedProps, c = e.type, l = e.updateQueue;
					if (e.updateQueue = null, l !== null) try {
						c === "input" && o.type === "radio" && o.name != null && be(i, o), Fe(c, s);
						var u = Fe(c, o);
						for (s = 0; s < l.length; s += 2) {
							var d = l[s], f = l[s + 1];
							d === "style" ? B(i, f) : d === "dangerouslySetInnerHTML" ? ke(i, f) : d === "children" ? Ae(i, f) : S(i, d, f, u);
						}
						switch (c) {
							case "input":
								xe(i, o);
								break;
							case "textarea":
								I(i, o);
								break;
							case "select":
								var p = i._wrapperState.wasMultiple;
								i._wrapperState.wasMultiple = !!o.multiple;
								var m = o.value;
								m == null ? p !== !!o.multiple && (o.defaultValue == null ? Te(i, !!o.multiple, o.multiple ? [] : "", !1) : Te(i, !!o.multiple, o.defaultValue, !0)) : Te(i, !!o.multiple, m, !1);
						}
						i[Mi] = o;
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
					ln(t.containerInfo);
				} catch (t) {
					$(e, e.return, t);
				}
				break;
			case 4:
				jc(t, e), Nc(e);
				break;
			case 13:
				jc(t, e), Nc(e), i = e.child, i.flags & 8192 && (o = i.memoizedState !== null, i.stateNode.isHidden = o, !o || i.alternate !== null && i.alternate.memoizedState !== null || (el = H())), r & 4 && Ac(e);
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
						r.flags & 32 && (Ae(i, ""), r.flags &= -33), Tc(e, Cc(e), i);
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
							o !== null && oo(t, o, r);
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
								oo(t, s, n);
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
										f !== null && ln(f);
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
	var zc = Math.ceil, Bc = C.ReactCurrentDispatcher, Vc = C.ReactCurrentOwner, Hc = C.ReactCurrentBatchConfig, Z = 0, Uc = null, Q = null, Wc = 0, Gc = 0, Kc = Ui(0), qc = 0, Jc = null, Yc = 0, Xc = 0, Zc = 0, Qc = null, $c = null, el = 0, tl = Infinity, nl = null, rl = !1, il = null, al = null, ol = !1, sl = null, cl = 0, ll = 0, ul = null, dl = -1, fl = 0;
	function pl() {
		return Z & 6 ? H() : dl === -1 ? dl = H() : dl;
	}
	function ml(e) {
		return e.mode & 1 ? Z & 2 && Wc !== 0 ? Wc & -Wc : Ma.transition === null ? (e = U, e === 0 ? (e = window.event, e = e === void 0 ? 16 : _n(e.type), e) : e) : (fl === 0 && (fl = Pt()), fl) : 1;
	}
	function hl(e, t, n, r) {
		if (50 < ll) throw ll = 0, ul = null, Error(a(185));
		It(e, n, r), (!(Z & 2) || e !== Uc) && (e === Uc && (!(Z & 2) && (Xc |= n), qc === 4 && xl(e, Wc)), gl(e, r), n === 1 && Z === 0 && !(t.mode & 1) && (tl = H() + 500, na && oa()));
	}
	function gl(e, t) {
		var n = e.callbackNode;
		Mt(e, t);
		var r = At(e, e === Uc ? Wc : 0);
		if (r === 0) n !== null && dt(n), e.callbackNode = null, e.callbackPriority = 0;
		else if (t = r & -r, e.callbackPriority !== t) {
			if (n != null && dt(n), t === 1) e.tag === 0 ? aa(Sl.bind(null, e)) : ia(Sl.bind(null, e)), Ti(function() {
				!(Z & 6) && oa();
			}), n = null;
			else {
				switch (zt(r)) {
					case 1:
						n = ht;
						break;
					case 4:
						n = gt;
						break;
					case 16:
						n = _t;
						break;
					case 536870912:
						n = yt;
						break;
					default: n = _t;
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
		var r = At(e, e === Uc ? Wc : 0);
		if (r === 0) return null;
		if (r & 30 || (r & e.expiredLanes) !== 0 || t) t = Al(e, r);
		else {
			t = r;
			var i = Z;
			Z |= 2;
			var o = Ol();
			(Uc !== e || Wc !== t) && (nl = null, tl = H() + 500, El(e, t));
			do
				try {
					Ml();
					break;
				} catch (t) {
					Dl(e, t);
				}
			while (1);
			Ua(), Bc.current = o, Z = i, Q === null ? (Uc = null, Wc = 0, t = qc) : t = 0;
		}
		if (t !== 0) {
			if (t === 2 && (i = Nt(e), i !== 0 && (r = i, t = vl(e, i))), t === 1) throw n = Jc, El(e, 0), xl(e, r), gl(e, H()), n;
			if (t === 6) xl(e, r);
			else {
				if (i = e.current.alternate, !(r & 30) && !bl(i) && (t = Al(e, r), t === 2 && (o = Nt(e), o !== 0 && (r = o, t = vl(e, o))), t === 1)) throw n = Jc, El(e, 0), xl(e, r), gl(e, H()), n;
				switch (e.finishedWork = i, e.finishedLanes = r, t) {
					case 0:
					case 1: throw Error(a(345));
					case 2:
						Fl(e, $c, nl);
						break;
					case 3:
						if (xl(e, r), (r & 130023424) === r && (t = el + 500 - H(), 10 < t)) {
							if (At(e, 0) !== 0) break;
							if (i = e.suspendedLanes, (i & r) !== r) {
								pl(), e.pingedLanes |= e.suspendedLanes & i;
								break;
							}
							e.timeoutHandle = Si(Fl.bind(null, e, $c, nl), t);
							break;
						}
						Fl(e, $c, nl);
						break;
					case 4:
						if (xl(e, r), (r & 4194240) === r) break;
						for (t = e.eventTimes, i = -1; 0 < r;) {
							var s = 31 - Ct(r);
							o = 1 << s, s = t[s], s > i && (i = s), r &= ~o;
						}
						if (r = i, r = H() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * zc(r / 1960)) - r, 10 < r) {
							e.timeoutHandle = Si(Fl.bind(null, e, $c, nl), r);
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
		return gl(e, H()), e.callbackNode === n ? _l.bind(null, e) : null;
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
	function xl(e, t) {
		for (t &= ~Zc, t &= ~Xc, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t;) {
			var n = 31 - Ct(t), r = 1 << n;
			e[n] = -1, t &= ~r;
		}
	}
	function Sl(e) {
		if (Z & 6) throw Error(a(327));
		Ll();
		var t = At(e, 0);
		if (!(t & 1)) return gl(e, H()), null;
		var n = Al(e, t);
		if (e.tag !== 0 && n === 2) {
			var r = Nt(e);
			r !== 0 && (t = r, n = vl(e, r));
		}
		if (n === 1) throw n = Jc, El(e, 0), xl(e, t), gl(e, H()), n;
		if (n === 6) throw Error(a(345));
		return e.finishedWork = e.current.alternate, e.finishedLanes = t, Fl(e, $c, nl), gl(e, H()), null;
	}
	function Cl(e, t) {
		var n = Z;
		Z |= 1;
		try {
			return e(t);
		} finally {
			Z = n, Z === 0 && (tl = H() + 500, na && oa());
		}
	}
	function wl(e) {
		sl !== null && sl.tag === 0 && !(Z & 6) && Ll();
		var t = Z;
		Z |= 1;
		var n = Hc.transition, r = U;
		try {
			if (Hc.transition = null, U = 1, e) return e();
		} finally {
			U = r, Hc.transition = n, Z = t, !(Z & 6) && oa();
		}
	}
	function Tl() {
		Gc = Kc.current, G(Kc);
	}
	function El(e, t) {
		e.finishedWork = null, e.finishedLanes = 0;
		var n = e.timeoutHandle;
		if (n !== -1 && (e.timeoutHandle = -1, Ci(n)), Q !== null) for (n = Q.return; n !== null;) {
			var r = n;
			switch (ya(r), r.tag) {
				case 1:
					r = r.type.childContextTypes, r != null && Xi();
					break;
				case 3:
					mo(), G(Ki), G(Gi), yo();
					break;
				case 5:
					go(r);
					break;
				case 4:
					mo();
					break;
				case 13:
					G(J);
					break;
				case 19:
					G(J);
					break;
				case 10:
					Wa(r.type._context);
					break;
				case 22:
				case 23: Tl();
			}
			n = n.return;
		}
		if (Uc = e, Q = e = Yl(e.current, null), Wc = Gc = t, qc = 0, Jc = null, Zc = Xc = Yc = 0, $c = Qc = null, Ja !== null) {
			for (t = 0; t < Ja.length; t++) if (n = Ja[t], r = n.interleaved, r !== null) {
				n.interleaved = null;
				var i = r.next, a = n.pending;
				if (a !== null) {
					var o = a.next;
					a.next = i, r.next = o;
				}
				n.pending = r;
			}
			Ja = null;
		}
		return e;
	}
	function Dl(e, t) {
		do {
			var n = Q;
			try {
				if (Ua(), bo.current = ps, To) {
					for (var r = Y.memoizedState; r !== null;) {
						var i = r.queue;
						i !== null && (i.pending = null), r = r.next;
					}
					To = !1;
				}
				if (So = 0, wo = Co = Y = null, Eo = !1, Do = 0, Vc.current = null, n === null || n.return === null) {
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
					} else if (q && c.mode & 1) {
						var _ = js(s);
						if (_ !== null) {
							!(_.flags & 65536) && (_.flags |= 256), Ms(_, s, c, o, t), ja(ws(l, c));
							break a;
						}
					}
					o = l = ws(l, c), qc !== 4 && (qc = 2), Qc === null ? Qc = [o] : Qc.push(o), o = s;
					do {
						switch (o.tag) {
							case 3:
								o.flags |= 65536, t &= -t, o.lanes |= t;
								var v = Os(o, l, t);
								io(o, v);
								break a;
							case 1:
								c = l;
								var y = o.type, b = o.stateNode;
								if (!(o.flags & 128) && (typeof y.getDerivedStateFromError == "function" || b !== null && typeof b.componentDidCatch == "function" && (al === null || !al.has(b)))) {
									o.flags |= 65536, t &= -t, o.lanes |= t;
									var x = ks(o, c, t);
									io(o, x);
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
		if (Ua(), Z = n, Bc.current = r, Q !== null) throw Error(a(261));
		return Uc = null, Wc = 0, qc;
	}
	function jl() {
		for (; Q !== null;) Nl(Q);
	}
	function Ml() {
		for (; Q !== null && !ft();) Nl(Q);
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
		var r = U, i = Hc.transition;
		try {
			Hc.transition = null, U = 1, Il(e, t, n, r);
		} finally {
			Hc.transition = i, U = r;
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
		if (Lt(e, o), e === Uc && (Q = Uc = null, Wc = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || ol || (ol = !0, Wl(_t, function() {
			return Ll(), null;
		})), o = !!(n.flags & 15990), n.subtreeFlags & 15990 || o) {
			o = Hc.transition, Hc.transition = null;
			var s = U;
			U = 1;
			var c = Z;
			Z |= 4, Vc.current = null, _c(e, n), Mc(n, e), Pr(bi), dn = !!yi, bi = yi = null, e.current = n, Pc(n, e, i), pt(), Z = c, U = s, Hc.transition = o;
		} else e.current = n;
		if (ol && (ol = !1, sl = e, cl = i), o = e.pendingLanes, o === 0 && (al = null), St(n.stateNode, r), gl(e, H()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) i = t[n], r(i.value, {
			componentStack: i.stack,
			digest: i.digest
		});
		if (rl) throw rl = !1, e = il, il = null, e;
		return cl & 1 && e.tag !== 0 && Ll(), o = e.pendingLanes, o & 1 ? e === ul ? ll++ : (ll = 0, ul = e) : ll = 0, oa(), null;
	}
	function Ll() {
		if (sl !== null) {
			var e = zt(cl), t = Hc.transition, n = U;
			try {
				if (Hc.transition = null, U = 16 > e ? 16 : e, sl === null) var r = !1;
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
					if (Z = i, oa(), xt && typeof xt.onPostCommitFiberRoot == "function") try {
						xt.onPostCommitFiberRoot(bt, e);
					} catch {}
					r = !0;
				}
				return r;
			} finally {
				U = n, Hc.transition = t;
			}
		}
		return !1;
	}
	function Rl(e, t, n) {
		t = ws(n, t), t = Os(e, t, 1), e = no(e, t, 1), t = pl(), e !== null && (It(e, 1, t), gl(e, t));
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
					e = ws(n, e), e = ks(t, e, 1), t = no(t, e, 1), e = pl(), t !== null && (It(t, 1, e), gl(t, e));
					break;
				}
			}
			t = t.return;
		}
	}
	function zl(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), t = pl(), e.pingedLanes |= e.suspendedLanes & n, Uc === e && (Wc & n) === n && (qc === 4 || qc === 3 && (Wc & 130023424) === Wc && 500 > H() - el ? El(e, 0) : Zc |= n), gl(e, t);
	}
	function Bl(e, t) {
		t === 0 && (e.mode & 1 ? (t = Ot, Ot <<= 1, !(Ot & 130023424) && (Ot = 4194304)) : t = 1);
		var n = pl();
		e = Za(e, t), e !== null && (It(e, t, n), gl(e, n));
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
			if (e.memoizedProps !== t.pendingProps || Ki.current) Ps = !0;
			else {
				if ((e.lanes & n) === 0 && !(t.flags & 128)) return Ps = !1, rc(e, t, n);
				Ps = !!(e.flags & 131072);
			}
		} else Ps = !1, q && t.flags & 1048576 && _a(t, ua, t.index);
		switch (t.lanes = 0, t.tag) {
			case 2:
				var r = t.type;
				tc(e, t), e = t.pendingProps;
				var i = Ji(t, Gi.current);
				Ka(t, n), i = jo(null, t, r, e, i, n);
				var o = Mo();
				return t.flags |= 1, typeof i == "object" && i && typeof i.render == "function" && i.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Yi(r) ? (o = !0, $i(t)) : o = !1, t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, $a(t), i.updater = ys, t.stateNode = i, i._reactInternals = t, Cs(t, r, e, n), t = Us(null, t, r, !0, o, n)) : (t.tag = 0, q && o && va(t), Fs(null, t, i, n), t = t.child), t;
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
					r = t.pendingProps, o = t.memoizedState, i = o.element, eo(e, t), ao(t, r, null, n);
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
						for (xa = Oi(t.stateNode.containerInfo.firstChild), ba = t, q = !0, Sa = null, n = Ra(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					} else {
						if (Aa(), r === i) {
							t = nc(e, t, n);
							break a;
						}
						Fs(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 5: return ho(t), e === null && Ea(t), r = t.type, i = t.pendingProps, o = e === null ? null : e.memoizedProps, s = i.children, xi(r, i) ? s = null : o !== null && xi(r, o) && (t.flags |= 32), Bs(e, t), Fs(e, t, s, n), t.child;
			case 6: return e === null && Ea(t), null;
			case 13: return Js(e, t, n);
			case 4: return po(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = La(t, null, r, n) : Fs(e, t, r, n), t.child;
			case 11: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : _s(r, i), Is(e, t, r, i, n);
			case 7: return Fs(e, t, t.pendingProps, n), t.child;
			case 8: return Fs(e, t, t.pendingProps.children, n), t.child;
			case 12: return Fs(e, t, t.pendingProps.children, n), t.child;
			case 10:
				a: {
					if (r = t.type._context, i = t.pendingProps, o = t.memoizedProps, s = i.value, K(za, r._currentValue), r._currentValue = s, o !== null) {
						if (Dr(o.value, s)) {
							if (o.children === i.children && !Ki.current) {
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
											l = to(-1, n & -n), l.tag = 2;
											var u = o.updateQueue;
											if (u !== null) {
												u = u.shared;
												var d = u.pending;
												d === null ? l.next = l : (l.next = d.next, d.next = l), u.pending = l;
											}
										}
										o.lanes |= n, l = o.alternate, l !== null && (l.lanes |= n), Ga(o.return, n, t), c.lanes |= n;
										break;
									}
									l = l.next;
								}
							} else if (o.tag === 10) s = o.type === t.type ? null : o.child;
							else if (o.tag === 18) {
								if (s = o.return, s === null) throw Error(a(341));
								s.lanes |= n, c = s.alternate, c !== null && (c.lanes |= n), Ga(s, n, t), s = o.sibling;
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
			case 9: return i = t.type, r = t.pendingProps.children, Ka(t, n), i = qa(i), r = r(i), t.flags |= 1, Fs(e, t, r, n), t.child;
			case 14: return r = t.type, i = _s(r, t.pendingProps), i = _s(r.type, i), Ls(e, t, r, i, n);
			case 15: return Rs(e, t, t.type, t.pendingProps, n);
			case 17: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : _s(r, i), tc(e, t), t.tag = 1, Yi(r) ? (e = !0, $i(t)) : e = !1, Ka(t, n), xs(t, r, i), Cs(t, r, i, n), Us(null, t, r, !0, e, n);
			case 19: return ec(e, t, n);
			case 22: return zs(e, t, n);
		}
		throw Error(a(156, t.tag));
	};
	function Wl(e, t) {
		return ut(e, t);
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
			if (e = e.$$typeof, e === ne) return 11;
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
			case E: return Zl(n.children, i, o, t);
			case D:
				s = 8, i |= 8;
				break;
			case O: return e = Kl(12, n, t, i | 2), e.elementType = O, e.lanes = o, e;
			case re: return e = Kl(13, n, t, i), e.elementType = re, e.lanes = o, e;
			case ie: return e = Kl(19, n, t, i), e.elementType = ie, e.lanes = o, e;
			case ae: return Ql(n, i, o, t);
			default:
				if (typeof e == "object" && e) switch (e.$$typeof) {
					case ee:
						s = 10;
						break a;
					case te:
						s = 9;
						break a;
					case ne:
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
		this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Ft(0), this.expirationTimes = Ft(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ft(0), this.identifierPrefix = r, this.onRecoverableError = i, this.mutableSourceEagerHydrationData = null;
	}
	function nu(e, t, n, r, i, a, o, s, c) {
		return e = new tu(e, t, n, s, c), t === 1 ? (t = 1, !0 === a && (t |= 8)) : t = 0, a = Kl(3, null, null, t), e.current = a, a.stateNode = e, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: null,
			transitions: null,
			pendingSuspenseBoundaries: null
		}, $a(a), e;
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
		if (!e) return Wi;
		e = e._reactInternals;
		a: {
			if (it(e) !== e || e.tag !== 1) throw Error(a(170));
			var t = e;
			do {
				switch (t.tag) {
					case 3:
						t = t.stateNode.context;
						break a;
					case 1: if (Yi(t.type)) {
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
			if (Yi(n)) return Qi(e, n, t);
		}
		return t;
	}
	function au(e, t, n, r, i, a, o, s, c) {
		return e = nu(n, r, !0, e, i, a, o, s, c), e.context = iu(null), n = e.current, r = pl(), i = ml(n), a = to(r, i), a.callback = t ?? null, no(n, a, i), e.current.lanes = i, It(e, i, r), gl(e, r), e;
	}
	function ou(e, t, n, r) {
		var i = t.current, a = pl(), o = ml(i);
		return n = iu(n), t.context === null ? t.context = n : t.pendingContext = n, t = to(a, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = no(i, t, o), e !== null && (hl(e, i, o, a), ro(e, i, o)), o;
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
			}), t[Ni] = null;
		}
	};
	function pu(e) {
		this._internalRoot = e;
	}
	pu.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Ut();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < Qt.length && t !== 0 && t < Qt[n].priority; n++);
			Qt.splice(n, 0, e), n === 0 && rn(e);
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
			return e._reactRootContainer = o, e[Ni] = o.current, si(e.nodeType === 8 ? e.parentNode : e), wl(), o;
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
		return e._reactRootContainer = c, e[Ni] = c.current, si(e.nodeType === 8 ? e.parentNode : e), wl(function() {
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
	Bt = function(e) {
		switch (e.tag) {
			case 3:
				var t = e.stateNode;
				if (t.current.memoizedState.isDehydrated) {
					var n = kt(t.pendingLanes);
					n !== 0 && (Rt(t, n | 1), gl(t, H()), !(Z & 6) && (tl = H() + 500, oa()));
				}
				break;
			case 13: wl(function() {
				var t = Za(e, 1);
				t !== null && hl(t, e, 1, pl());
			}), lu(e, 1);
		}
	}, Vt = function(e) {
		if (e.tag === 13) {
			var t = Za(e, 134217728);
			t !== null && hl(t, e, 134217728, pl()), lu(e, 134217728);
		}
	}, Ht = function(e) {
		if (e.tag === 13) {
			var t = ml(e), n = Za(e, t);
			n !== null && hl(n, e, t, pl()), lu(e, t);
		}
	}, Ut = function() {
		return U;
	}, Wt = function(e, t) {
		var n = U;
		try {
			return U = e, t();
		} finally {
			U = n;
		}
	}, Re = function(e, t, n) {
		switch (t) {
			case "input":
				if (xe(e, n), t = n.name, n.type === "radio" && t != null) {
					for (n = e; n.parentNode;) n = n.parentNode;
					for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + "][type=\"radio\"]"), t = 0; t < n.length; t++) {
						var r = n[t];
						if (r !== e && r.form === e.form) {
							var i = Bi(r);
							if (!i) throw Error(a(90));
							ge(r), xe(r, i);
						}
					}
				}
				break;
			case "textarea":
				I(e, n);
				break;
			case "select": t = n.value, t != null && Te(e, !!n.multiple, t, !1);
		}
	}, We = Cl, Ge = wl;
	var yu = {
		usingClientEntryPoint: !1,
		Events: [
			Ri,
			zi,
			Bi,
			He,
			Ue,
			Cl
		]
	}, bu = {
		findFiberByHostInstance: Li,
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
			return e = ct(e), e === null ? null : e.stateNode;
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
			bt = Su.inject(xu), xt = Su;
		} catch {}
	}
	e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = yu, e.createPortal = function(e, t) {
		var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!mu(t)) throw Error(a(200));
		return ru(e, t, null, n);
	}, e.createRoot = function(e, t) {
		if (!mu(e)) throw Error(a(299));
		var n = !1, r = "", i = du;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = nu(e, 1, !1, null, null, n, !1, r, i), e[Ni] = t.current, si(e.nodeType === 8 ? e.parentNode : e), new fu(t);
	}, e.findDOMNode = function(e) {
		if (e == null) return null;
		if (e.nodeType === 1) return e;
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(a(188)) : (e = Object.keys(e).join(","), Error(a(268, e)));
		return e = ct(t), e = e === null ? null : e.stateNode, e;
	}, e.flushSync = function(e) {
		return wl(e);
	}, e.hydrate = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !0, n);
	}, e.hydrateRoot = function(e, t, n) {
		if (!mu(e)) throw Error(a(405));
		var r = n != null && n.hydratedSources || null, i = !1, o = "", s = du;
		if (n != null && (!0 === n.unstable_strictMode && (i = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onRecoverableError !== void 0 && (s = n.onRecoverableError)), t = au(t, null, e, 1, n ?? null, i, !1, o, s), e[Ni] = t.current, si(e), r) for (e = 0; e < r.length; e++) n = r[e], i = n._getVersion, i = i(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, i] : t.mutableSourceEagerHydrationData.push(n, i);
		return new pu(t);
	}, e.render = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !1, n);
	}, e.unmountComponentAtNode = function(e) {
		if (!hu(e)) throw Error(a(40));
		return e._reactRootContainer ? (wl(function() {
			vu(null, null, e, !1, function() {
				e._reactRootContainer = null, e[Ni] = null;
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
})), s = /* @__PURE__ */ e(((e) => {
	var t = o();
	e.createRoot = t.createRoot, e.hydrateRoot = t.hydrateRoot;
})), c = n(), l = s();
function u(e, t) {
	let n = e.status === "ready", r = e.accepted, i = r?.input, a = n && r?.mode === "dated" ? r.result : null, o = n && r ? r.mode === "dated" ? r.result.decision : r.result : null, s = e.saved?.view.snapshot.normalized_input.borrower_name, c = e.status === "evaluating";
	return {
		ready: n,
		accepted: r,
		input: i,
		assessment: a,
		decision: o,
		title: n ? i?.borrower_name ?? (typeof s == "string" ? s : "Saved case") : "Assessment workspace",
		subtitle: n ? e.saved ? "Saved dated assessment" : r?.mode === "dated" ? "Dated assessment" : "Legacy · undated input" : c ? e.action === "open" ? "Opening stored revision" : e.action === "write" ? "Waiting for accepted stored receipt" : "Evaluating selected draft" : "Selected input unavailable",
		decisionWord: o ? o.outcome.toUpperCase() : c ? e.action === "open" ? "LOADING" : e.action === "write" ? "SAVING" : "CALCULATING" : "UNAVAILABLE",
		decisionNote: o ? `${o.policy_version} · illustrative score ${o.score}` : "A current accepted calculation is required",
		pendingTitle: c ? e.action === "open" ? "Loading original stored assessment" : e.action === "write" ? "Waiting for saved write confirmation" : "Evaluating draft" : "No current result",
		previousAccepted: r && !e.saved && (e.action === "evaluate" || !t) ? r : null
	};
}
//#endregion
//#region src/useEditController.ts
function d(e, t) {
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
var f = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/, p = 10n;
function m(e) {
	if (e.length > 256) throw Error("Decimal exceeds the supported range.");
	let t = f.exec(e);
	if (!t) throw Error("Enter a finite decimal value.");
	let n = Number(t[5] ?? "0");
	if (!Number.isSafeInteger(n) || Math.abs(n) > 128) throw Error("Decimal exponent exceeds the supported range.");
	let r = t[3] ?? t[4] ?? "";
	return {
		coefficient: BigInt(`${t[1] === "-" ? "-" : ""}${t[2] ?? "0"}${r}`),
		scale: r.length - n
	};
}
function h({ coefficient: e, scale: t }) {
	if (e === 0n) return "0";
	let n = e < 0n ? "-" : "", r = (e < 0n ? -e : e).toString();
	return t <= 0 ? n + r + "0".repeat(-t) : (r = r.padStart(t + 1, "0"), (n + r.slice(0, -t) + "." + r.slice(-t)).replace(/0+$/, "").replace(/\.$/, ""));
}
function g(e) {
	return h(m(e));
}
function _(e) {
	if (typeof e != "string") return !1;
	try {
		return m(e), !0;
	} catch {
		return !1;
	}
}
function v(e) {
	if (typeof e == "number" && Number.isFinite(e)) return g(String(e));
	if (typeof e == "string") return g(e);
	throw Error("Financial values must be finite decimals.");
}
function y(e, t) {
	if (!Number.isSafeInteger(t) || Math.abs(t) > 30) throw Error("Unsupported decimal shift.");
	let n = m(e);
	return h({
		...n,
		scale: n.scale - t
	});
}
function b(e, t) {
	let n = m(e), r = m(t), i = Math.max(n.scale, r.scale), a = n.coefficient * p ** BigInt(i - n.scale), o = r.coefficient * p ** BigInt(i - r.scale);
	return a < o ? -1 : +(a > o);
}
function x(e, t) {
	try {
		return b(v(e), v(t)) === 0;
	} catch {
		return !1;
	}
}
function S(e) {
	let t = g(e), n = m(e);
	if ((n.coefficient < 0n ? -n.coefficient : n.coefficient).toString().length > 34 || b(t.startsWith("-") ? t.slice(1) : t, "1e30") > 0 || n.coefficient !== 0n && b(t.startsWith("-") ? t.slice(1) : t, "1e-30") < 0) throw Error("Financial input exceeds 34 digits or the supported range [1e-30, 1e30].");
	return t;
}
function C(e, t = 2, n = !0) {
	if (!Number.isInteger(t) || t < 0 || t > 30) throw Error("Unsupported display precision.");
	let r = m(e), i = r.coefficient < 0n, a = i ? -r.coefficient : r.coefficient;
	if (r.scale > t) {
		let e = p ** BigInt(r.scale - t), n = a % e;
		a /= e, (n * 2n > e || n * 2n === e && a % 2n == 1n) && a++;
	} else a *= p ** BigInt(t - r.scale);
	let o = a.toString().padStart(t + 1, "0"), s = t ? o.slice(0, -t) : o;
	return n && (s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",")), `${i && a !== 0n ? "-" : ""}${s}${t ? "." + o.slice(-t) : ""}`;
}
function w(e) {
	let [t, n] = g(e).split("."), r = t.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return n === void 0 ? r : `${r}.${n}`;
}
var T = {
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
}, E = /^[\s   ]+|[\s   ]+$/g;
function D(e, t = T[e]) {
	return {
		ok: !1,
		code: e,
		message: t
	};
}
function O(e, t = {}) {
	let n = e.replace(/−/g, "-").replace(E, "");
	if (!n) return D("empty");
	if (/%/.test(n)) return D("percent");
	if (/\d/.test(n) && /[kmb]{1,2}\)?$/i.test(n)) return D("suffix");
	if (/\d/.test(n) && /e/i.test(n)) return D("exponent");
	if ((n.match(/-/g) ?? []).length > 1 || /-\s*\(|\(\s*-/.test(n)) return D("sign");
	if ((n.match(/\(/g) ?? []).length !== (n.match(/\)/g) ?? []).length) return D("parentheses");
	if ((n.match(/\$/g) ?? []).length > (t.currency === !1 ? 0 : 1)) return D("invalid");
	let r = /^\$?(\()?(-)?\$?(\d[\d,]*(?:\.\d*)?|\.\d+)\)?$/.exec(n);
	if (!r) return D("invalid");
	let [i] = r[3].split(".");
	if (i.includes(",") && !/^\d{1,3}(?:,\d{3})+$/.test(i)) return D("grouping");
	let a = !!r[1] || !!r[2], o = r[3].replace(/,/g, ""), s = (a ? "-" : "") + (o.startsWith(".") ? "0" + o : o);
	if (o.replace(".", "").replace(/^0+(?=\d)/, "").length > 34) return D("digits");
	let c;
	try {
		c = S(s);
	} catch {
		return D("range");
	}
	return t.allowNegative === !1 && b(c, "0") < 0 ? D("negative") : {
		ok: !0,
		value: c
	};
}
var ee = "Enter a finite percentage such as 12.5 or 12.5%.";
function te(e, t = {}) {
	let n = e.replace(/−/g, "-").replace(E, "");
	if (!n) return D("empty", "Enter a percentage.");
	if (/\$/.test(n)) return D("invalid", ee);
	let r = /^(.*?)\s*%(\)?)$/.exec(n);
	if (r && (n = r[1] + r[2]), /%/.test(n)) return D("percent", "Use one percent sign, such as 12.5%.");
	let i = O(n, {
		allowNegative: t.allowNegative,
		currency: !1
	});
	if (!i.ok) return i.code === "invalid" ? D("invalid", ee) : i;
	try {
		return {
			ok: !0,
			value: S(y(i.value, -2))
		};
	} catch {
		return D("range");
	}
}
var ne = "Enter a whole number, such as 120.";
function re(e) {
	if (/[$%]/.test(e)) return D("invalid", ne);
	let t = O(e, { currency: !1 });
	return t.ok ? /^-?\d+$/.test(t.value) ? t : D("invalid", ne) : D(t.code, ne);
}
function ie(e) {
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
function k(e, t) {
	return t === "%" ? y(String(e), 2) : String(e);
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
var A = (e) => C(e, 2);
function ae(e) {
	let t = e.raw_value;
	return t === null ? "Not applicable" : _(t) ? e.name === "uca_positive" ? `$${A(t)}` : `${C(t, 4)}x` : String(t);
}
function oe(e, t = !1) {
	let n = e.reported_value ?? e.raw_value;
	return e.status !== "available" || !_(n) ? "Not applicable" : t ? `$${C(n, 2)}` : `${C(n, 4)}x`;
}
//#endregion
//#region src/workspace.ts
var se = {
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
function j(e, t) {
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
function le(e, t) {
	return t === "%" ? `${y(String(e), 2)}%` : t === "months" ? `${e} month${String(e) === "1" ? "" : "s"}` : `$${w(String(e))}`;
}
function ue(e) {
	let { min: t, max: n, unit: r } = e;
	return t !== void 0 && n !== void 0 ? `${le(t, r)} to ${le(n, r)}` : t === void 0 ? `up to ${le(n, r)}` : `${le(t, r)} or more`;
}
function de(e, t, n, r = {}) {
	let i = e.unit === "%" ? te(t) : e.integer ? re(t) : O(t);
	if (!i.ok) throw Error(i.message);
	let a = i.value, o = a;
	if (e.integer) {
		if (!Number.isSafeInteger(Number(a))) throw Error("Enter a safe whole number of months.");
		o = Number(a);
	}
	if (e.min !== void 0 && b(a, String(e.min)) < 0 || e.max !== void 0 && b(a, String(e.max)) > 0) throw Error(`Value is outside the allowed range: ${ue(e)}.`);
	if ((r.requireRationale ?? !0) && !n.trim()) throw Error("A nonblank rationale is required.");
	if (x(o, e.value)) throw Error("Enter a changed value or cancel.");
	return o;
}
//#endregion
//#region src/contracts.ts
var fe = [
	"gross_receipts",
	"cogs",
	"operating_expense_excl_dna_interest_comp",
	"officer_compensation",
	"depreciation",
	"amortization",
	"interest_expense",
	"section_179",
	"k1_distribution"
], pe = [
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
], me = [
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
function M(e, t) {
	if (!e) throw Error(`Incomplete or invalid assessment: ${t}`);
}
function N(e, t) {
	return M(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
function he(e, t) {
	return M(Array.isArray(e), t), e;
}
function P(e) {
	return typeof e == "string" && e.length > 0;
}
function ge(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function _e(e) {
	return typeof e == "string" || typeof e == "boolean";
}
function ve(e) {
	return typeof e == "string" && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e;
}
function ye(e) {
	let t = N(e, "period");
	return M(ve(t.period_start) && ve(t.period_end) && t.period_start <= t.period_end, "period dates"), t;
}
var be = (e, t) => e.period_start === t.period_start && e.period_end === t.period_end;
function xe(e) {
	let t = N(e, "request");
	return "schema_version" in t ? (M(["commercial-assessment-v1", "commercial-assessment-v2"].includes(String(t.schema_version)), "unsupported schema_version"), "dated") : "legacy";
}
function Se(e) {
	let t = N(e, "decision");
	M(t.vertical === "commercial" && [
		"approve",
		"review",
		"decline"
	].includes(String(t.outcome)) && _(t.score) && P(t.policy_version) && P(t.disclaimer), "decision identity");
	let n = he(t.factors, "factors");
	M(n.length === 5, "commercial factors");
	let r = [
		"dscr",
		"fccr",
		"global_dscr",
		"uca_positive",
		"k1_history"
	];
	for (let e of n) {
		let t = N(e, "factor");
		M(P(t.name) && r.includes(t.name) && _e(t.value) && (t.raw_value === null || _e(t.raw_value)) && _(t.weight) && (t.threshold === null || _e(t.threshold)) && (t.passed === null || typeof t.passed == "boolean") && P(t.source) && [
			null,
			">=",
			">",
			"<",
			"=="
		].includes(t.comparison_operator) && (t.decline_threshold === null || _(t.decline_threshold)) && (t.decline_triggered === null || typeof t.decline_triggered == "boolean"), "factor fields");
	}
	M(new Set(n.map((e) => N(e, "factor").name)).size === 5, "unique factors");
	for (let e of he(t.reasons, "reasons")) {
		let t = N(e, "reason");
		M(P(t.code) && P(t.factor) && P(t.message) && _e(t.value), "reason fields");
	}
	return t;
}
function Ce(e) {
	let t = N(e, "legacy input");
	M(P(t.borrower_name) && P(t.geography), "borrower");
	let n = (e, t) => {
		let n = e === void 0 ? t : e;
		return M(n !== void 0 && typeof n != "boolean", "legacy decimal input"), v(n);
	}, r = he(t.years, "years").map((e) => {
		let t = N(e, "year");
		return Object.fromEntries(fe.map((e) => [e, n(t[e], ["section_179", "k1_distribution"].includes(e) ? "0" : void 0)]));
	});
	M(r.length, "years");
	let i = N(t.existing_debt, "debt"), a = N(t.proposed_loan, "loan"), o = N(t.working_capital, "working capital"), s = he(t.guarantors ?? [], "guarantors").map((e) => {
		let t = N(e, "guarantor");
		return M(t.name === void 0 || P(t.name), "guarantor name"), {
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
	}), c = he(t.overrides ?? [], "overrides").map((e) => {
		let t = N(e, "override");
		return M(P(t.field) && P(t.rationale) && P(t.source) && (t.actor === void 0 || P(t.actor)) && (t.at === void 0 || P(t.at)) && "new_value" in t, "override fields"), {
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
				return M(Number.isSafeInteger(e), "integer term months"), e;
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
function we(e) {
	let t = N(e, "normalized input");
	M(t.schema_version === "commercial-assessment-v2" && ve(t.assessment_as_of) && P(t.borrower_name) && P(t.geography), "dated identity");
	let n = N(t.units, "units");
	M(n.currency === "USD" && n.monetary_unit === "dollars" && n.annual_rate_unit === "decimal_nominal", "units");
	let r = he(t.years, "years");
	M(r.length >= 1 && r.length <= 10, "year count");
	let i = "";
	for (let e of r) {
		let n = N(e, "year"), r = ye(n);
		M(r.period_start > i && r.period_end <= t.assessment_as_of, "year order"), i = r.period_end;
		for (let e of fe) M(_(n[e]), `year ${e}`);
	}
	let a = (e, t) => {
		let n = N(e, "assumption");
		for (let e of t) M(_(n[e]), e);
		return n;
	};
	a(t.existing_debt, ["cpltd_annual", "operating_lease_annual"]);
	let o = a(t.proposed_loan, ["amount", "annual_rate"]);
	M(Number.isSafeInteger(o.term_months) && o.rate_type === "fixed" && o.repayment_type === "fully_amortizing" && o.payment_frequency === "monthly", "loan convention"), M(be(ye(a(t.working_capital, [
		"ar_increase",
		"inventory_increase",
		"ap_increase",
		"cash_taxes_paid"
	])), ye(r[r.length - 1])), "working capital period");
	for (let e of he(t.guarantors, "guarantors")) M(P(a(e, [
		"ownership_percentage",
		"wages",
		"interest_dividend_income",
		"mortgage_pi_annual",
		"auto_loan_annual",
		"credit_card_min_annual"
	]).name), "guarantor name");
	return t;
}
function Te(e) {
	let t = N(e, "metric");
	return M(P(t.fact_id) && P(t.unit) && (t.display_precision === null || Number.isInteger(t.display_precision) && Number(t.display_precision) >= 0 && Number(t.display_precision) <= 30) && (t.explanation === null || P(t.explanation)), "metric fields"), M(t.status === "available" ? _(t.raw_value) || t.unit === "category" && P(t.raw_value) : t.status === "not_applicable" && t.raw_value === null && P(t.explanation), "metric status/value"), M(t.status === "not_applicable" ? t.reported_value === null : t.unit === "category" ? t.reported_value === t.raw_value : _(t.reported_value), "reported metric value"), t;
}
function Ee(e) {
	let t = N(e, "assessment");
	M(t.schema_version === "commercial-assessment-v2" && t.calculation_version === "commercial-calculation-v2" && t.serialization_version === "assessment-json-v2" && t.coverage_basis === "current_pro_forma" && P(t.disclaimer), "versions");
	let n = we(t.normalized_input), r = n.years[n.years.length - 1];
	M(be(ye(t.selected_period), r) && t.assumptions_as_of === n.assessment_as_of, "selected period");
	let i = he(t.historical_spread, "spread");
	M(i.length === n.years.length, "spread length");
	let a = [];
	i.forEach((e, t) => {
		let r = N(e, "historical period");
		M(be(ye(r), n.years[t]) && be(ye(r.financials), n.years[t]), "historical period correspondence");
		let i = N(r.financials, "historical financials");
		for (let e of fe) M(i[e] === n.years[t][e], "historical inputs");
		let o = N(r.reported_financials, "reported financials");
		M(be(ye(o), n.years[t]), "reported period");
		for (let e of fe) M(_(o[e]) && /^-?\d+\.\d{2}$/.test(o[e]), "reported source amount");
		for (let e of [
			"gross_profit",
			"ordinary_business_income",
			"ebitda",
			"k1_distribution_ratio"
		]) a.push(Te(r[e]));
	});
	let o = N(t.current_facts, "facts");
	for (let e of pe) {
		let t = Te(o[e]), r = ["ordinary_business_income", "ebitda"].includes(e) ? `years.${n.years.length - 1}.${e}` : `current.${e}`;
		M(t.fact_id === r, "fact identity"), M(e === "k1_history" ? t.status === "available" && [
			"stable",
			"unstable",
			"insufficient_history"
		].includes(String(t.raw_value)) : t.raw_value === null || _(t.raw_value), "fact type"), a.push(t);
	}
	let s = he(t.guarantor_contributions, "contributions");
	M(s.length === n.guarantors.length, "contributions length"), s.forEach((e, t) => {
		let r = N(e, "contribution");
		M(r.guarantor_index === t && r.name === n.guarantors[t].name, "contribution identity");
		for (let e of [
			"business_ebitda",
			"outside_income",
			"personal_debt"
		]) a.push(Te(r[e]));
	});
	let c = he(t.k1_history_periods, "history periods").map(ye);
	M(c.length >= 1 && c.length <= 2 && be(c[c.length - 1], r) && c.every((e) => n.years.some((t) => be(e, t))), "history periods");
	let l = N(t.policy_snapshot, "policy");
	M(P(l.version) && ve(l.sba_sop_8_effective) && ve(l.sba_sop_8_1_effective), "policy identity");
	for (let e of me) M(e === "consumer_min_credit_score" ? Number.isSafeInteger(l[e]) : _(l[e]), `policy ${e}`);
	M(he(l.consumer_required_atr_fields, "ATR fields").every(P), "ATR fields");
	let u = Se(t.decision);
	M(u.policy_version === l.version, "decision policy");
	let d = he(t.calculation_trace, "trace");
	M(d.length > 0, "trace rows");
	let f = /* @__PURE__ */ new Map();
	for (let e of d) {
		let t = N(e, "trace row"), n = Te(t);
		M(P(t.definition_id) && P(t.expression) && !f.has(n.fact_id), "trace identity"), f.set(n.fact_id, n);
		for (let e of he(t.operands, "operands")) {
			let t = N(e, "operand");
			M([
				"input",
				"fact",
				"policy"
			].includes(String(t.reference_type)) && P(t.reference) && P(t.unit) && (t.raw_value === null || ge(t.raw_value) || typeof t.raw_value == "string"), "operand fields"), M(t.reported_value === null || _(t.reported_value) || Number.isSafeInteger(t.reported_value), "reported operand");
		}
	}
	for (let e of d) {
		let t = N(e, "trace row");
		for (let e of he(t.operands, "operands")) {
			let t = N(e, "operand");
			if (t.reference_type === "fact") {
				let e = f.get(String(t.reference));
				M(e && e.raw_value === t.raw_value && e.unit === t.unit, "referenced fact");
			} else {
				let e = String(t.reference).split("/").slice(1), r = t.reference_type === "policy" ? { policy_snapshot: l } : n;
				for (let t of e) M(typeof r == "object" && !!r && Object.prototype.hasOwnProperty.call(r, t), "operand input path"), r = r[t];
				M(r === t.raw_value, "operand input value");
			}
		}
	}
	for (let e of a) {
		let t = f.get(e.fact_id);
		M(t && t.raw_value === e.raw_value && t.reported_value === e.reported_value && t.status === e.status && t.unit === e.unit, "fact/trace correspondence");
	}
	for (let e of u.factors) {
		let t = e.name === "uca_positive" ? "uca_cash_flow" : e.name;
		M(e.raw_value === Te(o[t]).raw_value, "factor/fact correspondence");
	}
	let p = N(t.fingerprint, "fingerprint");
	return M(p.algorithm === "sha256" && typeof p.value == "string" && /^[0-9a-f]{64}$/.test(p.value) && p.content === "normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version", "fingerprint"), t;
}
//#endregion
//#region src/caseContracts.ts
function F(e, t) {
	if (!e) throw Error(`Invalid saved-case response or command: ${t}.`);
}
function I(e, t) {
	return F(typeof e == "object" && !!e && !Array.isArray(e), t), e;
}
var De = (e) => typeof e == "number" && Number.isFinite(e), L = (e) => typeof e == "string", Oe = (e) => L(e) && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(e), R = (e) => L(e) && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(e), ke = (e) => Number.isSafeInteger(e) && Number(e) >= 1, Ae = (e) => L(e) && /^[0-9a-f]{64}$/.test(e), z = (e) => L(e) && /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, je = (e) => L(e) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(e) && z(e.slice(0, 10)) && Number.isFinite(Date.parse(e));
function Me(e, t = 0, n = 64) {
	if (F(t < n, "JSON depth"), !(e === null || L(e) || typeof e == "boolean")) {
		if (typeof e == "number") {
			F(De(e), "finite JSON number");
			return;
		}
		F(typeof e == "object", "JSON value");
		for (let r of Object.values(e)) Me(r, t + 1, n);
	}
}
function B(e, t) {
	if (e === t) return !0;
	if (!e || !t || typeof e != "object" || typeof t != "object" || Array.isArray(e) !== Array.isArray(t)) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.prototype.hasOwnProperty.call(t, n) && B(e[n], t[n]));
}
function Ne(e, t) {
	F(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), "command fields");
}
function Pe(e) {
	return F(L(e) && [...e].length <= 2e3 && e.trim().length > 0, "nonblank rationale, at most 2,000 characters"), e.trim();
}
var Fe = {
	years: fe,
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
function Ie(e) {
	F(L(e) && e.length <= 160 && e.startsWith("/"), "numeric field path");
	let t = e.slice(1).split("/"), n = t[0], r = t[t.length - 1];
	return F(Object.prototype.hasOwnProperty.call(Fe, n) && Fe[n].includes(r), "numeric field allowlist"), F(["years", "guarantors"].includes(n) ? t.length === 3 && /^(?:0|[1-9][0-9]{0,8})$/.test(t[1]) : t.length === 2, "field index"), t;
}
function Le(e, t) {
	let n = Ie(t), r = n[0], i = n[n.length - 1], a = e, o, s = {
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
		F(Array.isArray(e) && Number(n[1]) < e.length, "existing input index"), o = I(e[Number(n[1])], "input row"), r === "guarantors" ? (s.guarantor_index = Number(n[1]), s.guarantor_name = String(o.name)) : s.basis = "annual_financials";
	} else o = I(a[r], "input group"), r === "working_capital" && (s.basis = "working_capital");
	["annual_financials", "working_capital"].includes(s.basis) && (F(z(o.period_start) && z(o.period_end), "input dates"), s.period_start = o.period_start, s.period_end = o.period_end), ["annual_rate", "ownership_percentage"].includes(i) && (s.unit = "decimal fraction"), i === "term_months" && (s.unit = "months");
	let c = o[i];
	return F(i === "term_months" ? Number.isSafeInteger(c) : _(c) || De(c), "numeric input"), {
		value: c,
		context: s
	};
}
function Re(e) {
	let t = I(e, "create command");
	Ne(t, ["input", "rationale"]);
	let n = I(t.input, "create input"), r = n.schema_version === "commercial-assessment-v1";
	if (r) {
		let e = (t, n = "") => typeof t == "number" ? n === "term_months" ? t : v(t) : Array.isArray(t) ? t.map((t) => e(t)) : t && typeof t == "object" ? Object.fromEntries(Object.entries(t).map(([t, n]) => [t, e(n, t)])) : t;
		we({
			...I(e(n), "archived input"),
			schema_version: "commercial-assessment-v2"
		});
	}
	let i = r ? n : we(n);
	Ne(i, [
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
	]), Ne(i.units, [
		"currency",
		"monetary_unit",
		"annual_rate_unit"
	]);
	for (let e of i.years) Ne(e, [
		...fe,
		"period_start",
		"period_end"
	]);
	Ne(i.existing_debt, Fe.existing_debt), Ne(i.proposed_loan, [
		...Fe.proposed_loan,
		"rate_type",
		"repayment_type",
		"payment_frequency"
	]);
	for (let e of i.guarantors) Ne(e, ["name", ...Fe.guarantors]);
	return Ne(i.working_capital, [
		...Fe.working_capital,
		"period_start",
		"period_end"
	]), Me(t), Pe(t.rationale), t;
}
function ze(e) {
	let t = I(e, "edit command");
	return Ne(t, [
		"field_path",
		"new_value",
		"rationale"
	]), Ie(t.field_path), F(_(t.new_value) || De(t.new_value), "finite edit value"), Pe(t.rationale), t.field_path === "/proposed_loan/term_months" && F(De(t.new_value) && Number.isSafeInteger(t.new_value) && t.new_value >= 12 && t.new_value <= 12e3, "whole term months"), t;
}
function Be(e, t) {
	let n = I(e, "snapshot");
	Me(n), F(n.storage_serialization_version === "case-json-v1" && R(n.case_id) && R(n.run_id) && ke(n.revision), "snapshot identity"), F(n.parent_revision === (n.revision === 1 ? null : n.revision - 1) && je(n.recorded_at), "snapshot parent/time"), F(Ae(n.input_hash) && Ae(n.payload_hash), "snapshot hashes"), F(t === `"case-json-v1:${n.case_id}:${n.revision}:${n.payload_hash}"`, "strong ETag");
	let r = I(n.normalized_input, "stored input"), i = I(n.assessment, "stored assessment");
	F(L(i.schema_version) && L(i.calculation_version) && L(i.serialization_version), "assessment versions");
	let a = i.schema_version === "commercial-assessment-v2" && i.calculation_version === "commercial-calculation-v2" && i.serialization_version === "assessment-json-v2", o = a ? Ee(i) : null;
	o && F(B(r, o.normalized_input), "outer normalized input");
	let s = I(n.event, "event"), c = I(s.context, "event context");
	if (F(s.case_id === n.case_id && s.revision === n.revision && s.run_id === n.run_id && s.recorded_at === n.recorded_at && Oe(s.actor), "event identity"), Pe(s.rationale), F(z(c.assessment_as_of), "event as-of"), F(c.period_start === null && c.period_end === null || z(c.period_start) && z(c.period_end) && c.period_start <= c.period_end, "event period"), F(c.guarantor_index === null && c.guarantor_name === null || Number.isSafeInteger(c.guarantor_index) && Number(c.guarantor_index) >= 0 && L(c.guarantor_name), "event guarantor"), n.revision === 1) F(s.kind === "creation" && s.field_path === null && s.before === null && s.after === null && c.basis === "case_creation" && c.unit === null && c.period_start === null && c.guarantor_index === null, "creation event");
	else if (F(s.kind === "edit" && (_(s.before) || De(s.before)) && (_(s.after) || De(s.after)) && !x(s.before, s.after) && L(s.field_path), "edit event"), Ie(s.field_path), F([
		"annual_financials",
		"working_capital",
		"current_assumptions"
	].includes(String(c.basis)) && [
		"USD dollars",
		"decimal fraction",
		"months"
	].includes(String(c.unit)), "edit context"), o) {
		let e = Le(o.normalized_input, s.field_path);
		F(e.value === s.after && B(e.context, c), "server-derived edit context");
	}
	return o && F(c.assessment_as_of === o.normalized_input.assessment_as_of, "event assumptions date"), Ve(n.recording), {
		snapshot: n,
		etag: t,
		assessment: o,
		compatibility: a ? null : `Stored assessment definition: ${i.schema_version} / ${i.calculation_version} / ${i.serialization_version}. Original JSON is available; typed display and editing are unavailable.`
	};
}
function Ve(e) {
	let t = I(e, "recording metadata"), n = I(t.packages, "installed packages");
	F(L(t.python_version) && L(t.sqlite_version) && Ae(t.dependency_baseline_sha256), "recording versions");
	for (let e of [
		"fastapi",
		"pydantic",
		"starlette",
		"uvicorn"
	]) F(L(n[e]) && n[e].length > 0, `installed ${e}`);
	return F(t.source_status === "development_unverified" ? t.source_revision === null : t.source_status === "build_reported" && L(t.source_revision) && /^[0-9a-f]{40}$/.test(t.source_revision), "recorded source"), t;
}
function He(e) {
	let t = I(e, "page");
	return F(Array.isArray(t.items) && t.items.length <= 25, "bounded page items"), F(t.next_cursor === null || L(t.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(t.next_cursor), "page cursor"), t;
}
function Ue(e) {
	let t = I(e, "summary");
	return F(R(t.case_id) && R(t.run_id) && ke(t.revision) && je(t.recorded_at), "summary identity"), t;
}
function We(e) {
	let t = He(e), n = /* @__PURE__ */ new Set();
	for (let e of t.items) {
		let t = Ue(e);
		F(L(t.borrower_name) && je(t.created_at) && !n.has(t.case_id), "case summary"), n.add(t.case_id);
	}
	return t;
}
function Ge(e, t) {
	let n = He(e), r = Infinity;
	for (let e of n.items) {
		let n = Ue(e);
		F(n.case_id === t && n.parent_revision === (n.revision === 1 ? null : Number(n.revision) - 1) && Number(n.revision) < r, "revision summary"), Pe(n.rationale), r = Number(n.revision);
	}
	return n;
}
function Ke(e, t) {
	let n = I(e, "replay"), r = t.snapshot;
	return F(n.case_id === r.case_id && n.revision === r.revision && n.run_id === r.run_id && [
		"matched",
		"mismatch",
		"replay_unavailable"
	].includes(String(n.status)), "replay identity/status"), F(Array.isArray(n.differences) && n.differences.every(L) && L(n.explanation), "replay details"), F(n.status !== "matched" || n.differences.length === 0, "matched replay differences"), n;
}
//#endregion
//#region src/workspaceDom.ts
var qe = document;
function Je(e) {
	qe = e;
}
function Ye(e) {
	return qe.querySelector(e);
}
function Xe(e) {
	let t = e.getRootNode();
	return t instanceof ShadowRoot ? t.activeElement : document.activeElement;
}
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.min.js
var Ze = /* @__PURE__ */ e(((e) => {
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
	t.exports = Ze();
})))();
function Qe(e) {
	e?.isConnected && !(e instanceof HTMLButtonElement && e.disabled) ? e.focus() : Ye("[data-focus-fallback]")?.focus();
}
function $e({ title: e, onCancel: t, restoreFocus: n, children: r }) {
	let i = (0, c.useRef)(null);
	return (0, c.useEffect)(() => {
		let e = i.current;
		return e?.showModal(), () => {
			e?.close(), Qe(n);
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
			e.shiftKey && Xe(e.currentTarget) === n ? (e.preventDefault(), r?.focus()) : !e.shiftKey && Xe(e.currentTarget) === r && (e.preventDefault(), n?.focus());
		},
		children: r
	});
}
function et({ input: e, onSave: t, onCancel: n, restoreFocus: r }) {
	let [i, a] = (0, c.useState)(""), [o, s] = (0, c.useState)("");
	return /* @__PURE__ */ (0, V.jsx)($e, {
		title: "Save dated case",
		onCancel: n,
		restoreFocus: r,
		children: /* @__PURE__ */ (0, V.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				try {
					Pe(i), t(i), n();
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
function tt({ onDiscard: e, onCancel: t, restoreFocus: n }) {
	let [r, i] = (0, c.useState)("");
	return /* @__PURE__ */ (0, V.jsxs)($e, {
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
function nt({ field: e, onCancel: t, onSubmit: n, restoreFocus: r, saved: i = !1, proposal: a }) {
	let o = (0, c.useRef)(null), [s, l] = (0, c.useState)(k(a?.next ?? e.value, e.unit)), [u, d] = (0, c.useState)(a?.rationale ?? ""), [f, p] = (0, c.useState)("");
	return (0, c.useEffect)(() => {
		let e = o.current;
		return e?.showModal(), () => {
			e?.close(), Qe(r);
		};
	}, [r]), /* @__PURE__ */ (0, V.jsx)("dialog", {
		ref: o,
		"aria-labelledby": "edit-title",
		onKeyDown: (e) => {
			if (e.key !== "Tab") return;
			let t = Array.from(e.currentTarget.querySelectorAll("input,textarea,button:not(:disabled)")), n = t[0], r = t[t.length - 1];
			e.shiftKey && Xe(e.currentTarget) === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && Xe(e.currentTarget) === r && (e.preventDefault(), n.focus());
		},
		onCancel: (e) => {
			e.preventDefault(), t();
		},
		children: /* @__PURE__ */ (0, V.jsxs)("form", {
			onSubmit: (t) => {
				t.preventDefault();
				try {
					let t = de(e, s, u);
					i && Pe(u), n({
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
					k(e.value, e.unit)
				] }),
				/* @__PURE__ */ (0, V.jsxs)("label", { children: [
					"New value",
					" ",
					/* @__PURE__ */ (0, V.jsx)("input", {
						autoFocus: !0,
						value: s,
						onChange: (e) => l(e.target.value),
						inputMode: "decimal"
					})
				] }),
				/* @__PURE__ */ (0, V.jsxs)("label", { children: [
					"Rationale",
					" ",
					/* @__PURE__ */ (0, V.jsx)("textarea", {
						value: u,
						onChange: (e) => d(e.target.value),
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
//#region src/AssessmentSummary.tsx
function rt({ assessment: e }) {
	let t = e.current_facts, n = [
		{
			label: "EBITDA",
			value: oe(t.ebitda, !0),
			note: `Operating year ended ${e.selected_period.period_end}`
		},
		{
			label: "Proposed annual service",
			value: oe(t.proposed_annual_payment, !0),
			note: "Fixed rate · monthly repayment"
		},
		{
			label: "Business DSCR",
			value: oe(t.dscr),
			note: `Policy minimum ${e.policy_snapshot.commercial_min_dscr}x`
		},
		{
			label: "Global DSCR",
			value: oe(t.global_dscr),
			note: `Policy minimum ${e.policy_snapshot.commercial_min_global_dscr}x`
		}
	];
	return /* @__PURE__ */ (0, V.jsx)("section", {
		className: "summaryGrid",
		"aria-label": "Assessment overview",
		children: n.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "summaryCard",
			children: [
				/* @__PURE__ */ (0, V.jsx)("span", { children: e.label }),
				/* @__PURE__ */ (0, V.jsx)("strong", { children: e.value }),
				/* @__PURE__ */ (0, V.jsx)("small", { children: e.note })
			]
		}, e.label))
	});
}
//#endregion
//#region src/metricDisplay.ts
function it(e) {
	if (e.status === "not_applicable") return "Not applicable";
	let t = e.reported_value ?? e.raw_value;
	return _(t) ? `${C(t, e.display_precision ?? 0)} ${e.unit}` : String(t);
}
//#endregion
//#region src/authentication.ts
var at = /* @__PURE__ */ new Set(), ot = null, st = 3e4;
function ct(e, t = !1) {
	let n = new URL(e), r = [
		"localhost",
		"127.0.0.1",
		"[::1]"
	].includes(n.hostname);
	if (n.username || n.password || !t && n.search || n.hash || n.protocol !== "https:" && !(n.protocol === "http:" && r)) throw Error("Use an HTTPS API URL, or HTTP on loopback, without credentials or query parameters.");
	return n;
}
function lt(e = "") {
	for (let e of at) e();
}
function ut(e = "") {
	ot?.controller.abort(), ot = null, lt(e);
}
async function dt(e, t, n = fetch) {
	let r = ot;
	if (!r) throw Error("Connect the workspace with an API token before sending requests.");
	if (ct(e, !0).origin !== r.origin) throw Error("The API origin changed. Reconnect before sending a credential.");
	let i = new Headers(t.headers);
	if (i.has("Authorization")) throw Error("Caller-supplied authorization is not accepted.");
	i.set("Authorization", `Bearer ${r.token}`);
	let a = [r.controller.signal, AbortSignal.timeout(st)];
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
	if (r !== ot || r.controller.signal.aborted) throw await o.body?.cancel().catch(() => {}), Error("The API connection changed; review any pending write before retrying.");
	return o.status === 401 && ut("The API rejected the credential. Reconnect to review or retry pending work."), o;
}
//#endregion
//#region src/transport.ts
var ft = "http://localhost:8000".replace(/\/$/, ""), pt = null;
function H(e, t) {
	if (!/^[0-9a-f-]{36}$/.test(e)) throw Error("Invalid testing store identity");
	ft = `streamlit:${window.location.origin}:${e}`, pt = t;
}
function mt() {
	return pt !== null;
}
function ht(e, t, n) {
	return pt ? pt(e, t) : dt(`${ft}${e}`, t, n);
}
var gt = "spreadline.embedded.";
function _t(e, t) {
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
function vt() {
	try {
		let e = window.sessionStorage;
		return pt ? _t(e, gt) : e;
	} catch {
		return null;
	}
}
function yt() {
	try {
		let e = window.localStorage;
		return pt ? _t(e, gt) : e;
	} catch {
		return null;
	}
}
//#endregion
//#region src/api.ts
var bt = (e, t, n = fetch) => ht(e, t, n);
async function xt(e, t, n = fetch) {
	let r = await bt(`/commercial/${e.mode === "dated" ? "assessment" : "decision"}`, {
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
		let t = Ee(i);
		return {
			mode: "dated",
			input: t.normalized_input,
			result: t,
			filename: e.filename
		};
	})() : {
		mode: "legacy",
		input: Ce(e.payload),
		result: Se(i),
		filename: e.filename
	};
}
//#endregion
//#region src/scenarioContracts.ts
var St = [
	"revenue_change",
	"cogs_change",
	"operating_expense_change",
	"proposed_rate_change_bps"
], Ct = "commercial-scenario-preview-v2", wt = "scenario-preview-json-v2";
function Tt(e, t) {
	F(Object.keys(e).length === t.length && t.every((t) => Object.prototype.hasOwnProperty.call(e, t)), "scenario fields");
}
function Et(e, t) {
	F(L(e), "scenario text");
	let n = e.replace(/^[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$/gu, "");
	return F(n.length > 0 && [...n].length <= t, `nonblank scenario text, at most ${t} characters`), n;
}
function Dt(e, t) {
	let n = t ? te(e) : O(e, { currency: !1 });
	F(n.ok, "Enter a finite decimal change");
	let r = n.ok ? n.value : "";
	return F(!t || b(r, "-1") >= 0, "Percentage changes must be at least -100%; all changes must be finite"), r;
}
function Ot(e, t = !1) {
	let n = I(e, "scenario"), r = I(n.assumptions, "shocks");
	F(L(n.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(n.scenario_key), "scenario key"), Tt(r, St);
	for (let e of St) F((_(r[e]) || t && De(r[e])) && (e === "proposed_rate_change_bps" || b(v(r[e]), "-1") >= 0), "finite explicit shock");
	return {
		scenario_key: n.scenario_key,
		name: Et(n.name, 120),
		rationale: Et(n.rationale, 2e3),
		assumptions: r
	};
}
function kt(e) {
	let t = I(e, "scenario command"), n = ["commercial-scenario-comparison-create-v1", "commercial-scenario-comparison-create-v2"].includes(String(t.schema_version)), r = String(t.schema_version).endsWith("-v1");
	F(n || t.schema_version === Ct || t.schema_version === "commercial-scenario-preview-v1", "scenario command version"), Tt(t, [
		"schema_version",
		"baseline_run_id",
		"scenarios",
		...n ? ["expected_preview_fingerprint"] : []
	]), F(R(t.baseline_run_id) && String(t.baseline_run_id).toLowerCase() === t.baseline_run_id, "canonical baseline run"), n && F(Ae(t.expected_preview_fingerprint), "reviewed preview fingerprint"), F(Array.isArray(t.scenarios) && t.scenarios.length >= 1 && t.scenarios.length <= 10, "1–10 scenarios");
	let i = /* @__PURE__ */ new Set();
	for (let e of t.scenarios) {
		Tt(I(e, "scenario command row"), [
			"scenario_key",
			"name",
			"rationale",
			"assumptions"
		]);
		let t = Ot(e, r);
		F(B(t, e) && !i.has(t.scenario_key), "normalized unique scenario command"), i.add(t.scenario_key);
	}
	return t;
}
function At(e) {
	let t = I(e.baseline, "preview baseline");
	return F(Array.isArray(e.scenarios), "preview scenarios"), kt({
		schema_version: e.schema_version,
		baseline_run_id: t.run_id,
		scenarios: e.scenarios.map((t) => Ot(t, e.schema_version === "commercial-scenario-preview-v1"))
	});
}
function jt(e, t) {
	return F(Array.isArray(e), t), e;
}
function Mt(e) {
	return e === null || _(e);
}
function Nt(e) {
	return R(e) && e.toLowerCase() === e;
}
function Pt(e) {
	F((e.schema_version === Ct && e.serialization_version === wt || e.schema_version === "commercial-scenario-preview-v1" && e.serialization_version === "scenario-preview-json-v1") && e.persisted === !1 && L(e.scenario_definition_version) && L(e.calculation_version), "preview envelope versions");
	let t = I(e.baseline, "baseline evidence");
	F(Nt(t.case_id) && Nt(t.run_id) && ke(t.revision) && Ae(t.input_hash) && Ae(t.payload_hash), "baseline evidence identity");
	let n = I(t.assessment, "original assessment"), r = I(e.fingerprint, "preview fingerprint");
	F(r.algorithm === "sha256" && Ae(r.value) && r.content === "baseline_identity+payload_hash+normalized_command+policy_snapshot+versions", "preview fingerprint");
	let i = I(e.selected_period, "selected operating period");
	F(z(i.period_start) && z(i.period_end) && i.period_start <= i.period_end && z(e.assumptions_as_of) && i.period_end <= e.assumptions_as_of, "preview dates"), F(B(e.selected_period, n.selected_period) && e.assumptions_as_of === n.assumptions_as_of && B(e.policy_snapshot, n.policy_snapshot), "baseline period and retained policy");
	let a = I(n.normalized_input, "baseline input");
	return F(B(e.units, a.units), "baseline units"), F(jt(e.held_fixed_assumptions, "held fixed assumptions").length > 0 && e.held_fixed_assumptions.every(L) && L(e.disclaimer), "preview explanation"), At(e), {
		b: t,
		a: n
	};
}
function Ft(e, t, n) {
	let r = I(e, "scenario preview");
	Me(r, 0, 100);
	let { b: i, a } = Pt(r);
	F(r.schema_version === Ct && r.scenario_definition_version === "commercial-scenario-definition-v2" && r.calculation_version === "commercial-calculation-v2", "supported live scenario definition");
	let o = Ee(a);
	t && F(i.case_id === t.snapshot.case_id && i.revision === t.snapshot.revision && i.run_id === t.snapshot.run_id && i.input_hash === t.snapshot.input_hash && i.payload_hash === t.snapshot.payload_hash && B(o, t.snapshot.assessment), "selected original baseline"), n && F(B(At(r), kt(n)), "reviewed normalized command");
	for (let e of r.scenarios) It(e, r, o);
	return r;
}
function It(e, t, n) {
	let r = I(e, "scenario result"), i = Ot(r);
	F(B({
		scenario_key: r.scenario_key,
		name: r.name,
		rationale: r.rationale,
		assumptions: r.assumptions
	}, i) && r.coverage_basis === "stressed_latest_period_current_pro_forma", "normalized projection command/basis");
	let a = I(r.projection_inputs, "projected inputs"), o = n.normalized_input;
	we({
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
	]) F(B(a[e], o[e]), "held-fixed projected inputs");
	let s = I(a.operating, "projected operating"), c = I(a.proposed_loan, "projected loan"), l = o.years[o.years.length - 1];
	for (let e of fe) [
		"gross_receipts",
		"cogs",
		"operating_expense_excl_dna_interest_comp"
	].includes(e) || F(s[e] === l[e], "held-fixed financial lines");
	F(s.period_start === l.period_start && s.period_end === l.period_end, "projected period");
	for (let e of Object.keys(o.proposed_loan)) e !== "annual_rate" && F(c[e] === o.proposed_loan[e], "held-fixed loan");
	let u = I(r.current_facts, "projected facts"), d = [];
	for (let e of pe) {
		let t = Te(u[e]), r = e === "k1_history" || e === "k1_ratio_difference", i = r ? "baseline." + n.current_facts[e].fact_id : ["ordinary_business_income", "ebitda"].includes(e) ? `projection.operating.${e}` : `projection.current.${e}`;
		F(t.fact_id === i && (r ? B(t, {
			...n.current_facts[e],
			fact_id: i
		}) : Mt(t.raw_value)), "projected fact identity/type/observed history"), d.push(t);
	}
	let f = jt(r.guarantor_contributions, "projected guarantors");
	F(f.length === o.guarantors.length, "guarantor count"), f.forEach((e, t) => {
		let n = I(e, "guarantor contribution");
		F(n.guarantor_index === t && n.name === o.guarantors[t].name, "guarantor identity");
		for (let e of [
			"business_ebitda",
			"outside_income",
			"personal_debt"
		]) {
			let r = Te(n[e]);
			F(r.fact_id === `projection.current.guarantors.${t}.${e}` && Mt(r.raw_value), "projected guarantor fact"), d.push(r);
		}
	});
	let p = Se(r.decision);
	F(p.policy_version === n.policy_snapshot.version, "retained decision policy");
	let m = jt(r.calculation_trace, "projection trace"), h = /* @__PURE__ */ new Map();
	for (let e of m) {
		let t = I(e, "trace row"), n = Te(t);
		F(L(t.definition_id) && L(t.expression) && !h.has(n.fact_id), "trace identity"), h.set(n.fact_id, n), jt(t.operands, "trace operands");
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
		F(B(h.get(t.fact_id), t), "retained observed trace identity");
	}
	for (let e of m) for (let n of I(e, "trace row").operands) {
		let e = I(n, "operand");
		if (F(L(e.reference) && L(e.unit) && (e.raw_value === null || De(e.raw_value) || L(e.raw_value)), "operand value"), e.reference_type === "fact") {
			let t = h.get(e.reference);
			F(t && t.raw_value === e.raw_value && t.unit === e.unit, "referenced scenario fact");
		} else {
			F(["input", "policy"].includes(String(e.reference_type)) && e.reference.startsWith("/"), "operand reference");
			let n = {
				...r,
				baseline: t.baseline,
				policy_snapshot: t.policy_snapshot
			};
			for (let t of e.reference.slice(1).split("/")) {
				let e = Lt(n);
				F(Object.prototype.hasOwnProperty.call(e, t), "scenario operand path"), n = e[t];
			}
			F(n === e.raw_value, "scenario operand value");
		}
	}
	for (let e of d) {
		let t = h.get(e.fact_id);
		F(t && [
			"fact_id",
			"raw_value",
			"reported_value",
			"unit",
			"display_precision",
			"status",
			"explanation"
		].every((n) => t[n] === e[n]), "fact/trace fields");
	}
	let g = jt(r.comparisons, "metric comparisons");
	F(g.length === pe.length - 1, "comparison count");
	let v = /* @__PURE__ */ new Set();
	for (let e of g) {
		let t = I(e, "metric comparison");
		F(L(t.metric) && pe.includes(t.metric) && t.metric !== "k1_history" && !v.has(t.metric), "compared metric identity"), v.add(t.metric);
		let r = n.current_facts[t.metric], i = Te(u[t.metric]);
		F(t.baseline_fact_id === "baseline." + r.fact_id && t.projected_fact_id === i.fact_id && t.baseline_value === r.raw_value && t.projected_value === i.raw_value && t.unit === i.unit && Mt(t.delta), "comparison fact links"), F(r.raw_value === null || i.raw_value === null ? t.delta === null && L(t.delta_explanation) : _(t.delta) && t.delta_explanation === null, "comparison availability");
		let a = p.factors.find((e) => e.name === (t.metric === "uca_cash_flow" ? "uca_positive" : t.metric));
		if ([
			"dscr",
			"fccr",
			"global_dscr",
			"uca_cash_flow"
		].includes(t.metric)) {
			let e = I(t.policy_headroom, "policy headroom");
			F(a && e.comparison_operator === a.comparison_operator && e.approval_threshold === a.threshold && e.decline_threshold === a.decline_threshold, "headroom policy");
			for (let t of [
				"baseline_approval",
				"projected_approval",
				"baseline_decline",
				"projected_decline"
			]) F(Mt(e[t]), "finite headroom");
		} else F(t.policy_headroom === null, "non-policy headroom");
	}
	for (let e of p.factors) {
		let t = e.name === "uca_positive" ? "uca_cash_flow" : e.name, r = n.decision.factors.find((t) => t.name === e.name);
		F(e.raw_value === Te(u[t]).raw_value && r && [
			"threshold",
			"decline_threshold",
			"comparison_operator",
			"weight",
			"source"
		].every((t) => e[t] === r[t]), "scenario factor fact and retained policy"), t === "k1_history" && F(B(e, r), "held-fixed observed K-1 factor");
	}
	let y = jt(r.factor_changes, "factor changes");
	F(y.length === p.factors.length, "factor change count");
	let b = /* @__PURE__ */ new Set();
	for (let e of y) {
		let t = I(e, "factor change"), r = n.decision.factors.find((e) => e.name === t.name), i = p.factors.find((e) => e.name === t.name);
		F(L(t.name) && !b.has(t.name) && r && i && B(t.baseline, r) && B(t.projected, i) && t.changed === !B(r, i) && t.basis === (t.name === "k1_history" ? "observed_history" : "projected_current"), "factor change links"), b.add(t.name), F(t.projected_fact_id === Te(u[t.name === "uca_positive" ? "uca_cash_flow" : t.name]).fact_id, "factor projected reference");
	}
	let x = I(r.outcome_change, "outcome change");
	F(x.baseline === n.decision.outcome && x.projected === p.outcome && x.changed === (x.baseline !== x.projected), "outcome change links");
	let S = jt(r.reason_changes, "reason changes"), C = Array.from(new Set([...n.decision.reasons, ...p.reasons].map((e) => e.code))).filter((e) => !B(n.decision.reasons.find((t) => t.code === e) ?? null, p.reasons.find((t) => t.code === e) ?? null));
	F(S.length === C.length, "reason changes count");
	let w = /* @__PURE__ */ new Set();
	for (let e of S) {
		let t = I(e, "reason change"), r = n.decision.reasons.find((e) => e.code === t.code) ?? null, i = p.reasons.find((e) => e.code === t.code) ?? null;
		F(L(t.code) && C.includes(t.code) && !w.has(t.code) && B(t.baseline, r) && B(t.projected, i) && t.change === (r === null ? "added" : i === null ? "removed" : "changed"), "reason change links"), w.add(t.code);
	}
}
function Lt(e) {
	return F(typeof e == "object" && !!e, "operand path object"), e;
}
function Rt(e, t) {
	let n = I(e, "original comparison");
	Me(n, 0, 100), F(["commercial-scenario-comparison-v1", "commercial-scenario-comparison-v2"].includes(String(n.schema_version)) && n.storage_serialization_version === "scenario-comparison-json-v1" && n.persisted === !0 && Nt(n.comparison_id) && Nt(n.case_id) && Nt(n.baseline_run_id) && ke(n.baseline_revision) && Ae(n.payload_hash), "comparison storage identity"), F(je(n.recorded_at) && /^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{6}\+00:00$/.test(n.recorded_at) && Oe(n.actor), "comparison recording time/actor"), Ve(n.recording), F(t === `"scenario-comparison-json-v1:${n.case_id}:${n.comparison_id}:${n.payload_hash}"`, "comparison ETag");
	let r = I(n.preview, "original preview"), { b: i, a } = Pt(r);
	F(i.case_id === n.case_id && i.revision === n.baseline_revision && i.run_id === n.baseline_run_id, "inner/outer original baseline");
	let o = r.schema_version === Ct && r.scenario_definition_version === "commercial-scenario-definition-v2" && r.calculation_version === "commercial-calculation-v2" && a.schema_version === "commercial-assessment-v2" && a.calculation_version === "commercial-calculation-v2" && a.serialization_version === "assessment-json-v2";
	return {
		record: n,
		etag: t,
		preview: o ? Ft(r) : null,
		compatibility: o ? null : `Original definition: ${r.scenario_definition_version} / ${r.calculation_version}; baseline ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON remains available; typed projection and new preview are unavailable.`
	};
}
function U(e, t) {
	let n = I(e, "comparison page");
	Me(n, 0, 100);
	let r = jt(n.items, "comparison summaries");
	F(r.length <= 25 && (n.next_cursor === null || L(n.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(n.next_cursor)), "bounded comparison page/cursor");
	let i = /* @__PURE__ */ new Set();
	for (let e of r) {
		let n = I(e, "comparison summary");
		F(n.case_id === t && Nt(n.comparison_id) && Nt(n.baseline_run_id) && ke(n.baseline_revision) && je(n.recorded_at) && Ae(n.preview_fingerprint) && !i.has(String(n.comparison_id)), "summary identity"), i.add(String(n.comparison_id)), F(["commercial-scenario-comparison-v1", "commercial-scenario-comparison-v2"].includes(String(n.schema_version)) && n.storage_serialization_version === "scenario-comparison-json-v1" && (n.preview_schema_version === Ct && n.preview_serialization_version === wt || n.preview_schema_version === "commercial-scenario-preview-v1" && n.preview_serialization_version === "scenario-preview-json-v1") && L(n.policy_version) && L(n.scenario_definition_version) && L(n.calculation_version), "summary versions");
		let r = jt(n.scenarios, "scenario summaries"), a = /* @__PURE__ */ new Set();
		F(r.length >= 1 && r.length <= 10 && n.scenario_count === r.length, "scenario count");
		for (let e of r) {
			let t = I(e, "scenario summary");
			F(L(t.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(t.scenario_key) && !a.has(t.scenario_key) && Et(t.name, 120) === t.name, "summary command"), a.add(t.scenario_key);
		}
	}
	return n;
}
//#endregion
//#region src/caseRecovery.ts
var zt = "spreadline.pending-write.v1", Bt = "spreadline.case-selection.v1", Vt = 1e6, Ht = 21e5;
function Ut(e, t = ft) {
	let n = I(e, "pending write");
	if (n.version !== "scenario-comparison-write-v1") return qt(e, t);
	F(n.kind === "comparison" && R(n.id) && n.apiBase === t && L(n.body) && Kt(n.body) <= Vt, "comparison recovery envelope");
	let r = kt(JSON.parse(n.body));
	F(["commercial-scenario-comparison-create-v1", "commercial-scenario-comparison-create-v2"].includes(r.schema_version) && JSON.stringify(r) === n.body && R(n.caseId) && ke(n.baselineRevision) && n.baselineRunId === r.baseline_run_id && Ae(n.baselinePayloadHash), "comparison recovery identity/command");
	let i = I(n.context, "comparison recovery context");
	return F(z(i.period_start) && z(i.period_end) && z(i.assessment_as_of) && i.period_start <= i.period_end && i.period_end <= i.assessment_as_of && L(i.policy_version) && L(i.scenario_definition_version) && L(i.calculation_version), "comparison recovery dates/versions"), F(Object.keys(n).length === 10 && [
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
	].every((e) => e in n), "comparison recovery fields"), F(Object.keys(i).length === 6 && [
		"period_start",
		"period_end",
		"assessment_as_of",
		"policy_version",
		"scenario_definition_version",
		"calculation_version"
	].every((e) => e in i), "comparison context fields"), Object.freeze(i), Object.freeze(n);
}
function Wt(e) {
	let t = Ft(e), n = {
		...At(t),
		schema_version: "commercial-scenario-comparison-create-v2",
		expected_preview_fingerprint: t.fingerprint.value
	};
	return Ut({
		version: "scenario-comparison-write-v1",
		kind: "comparison",
		id: crypto.randomUUID(),
		apiBase: ft,
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
function Gt() {
	return vt();
}
function Kt(e) {
	return new TextEncoder().encode(e).length;
}
function qt(e, t = ft) {
	let n = I(e, "recovery operation");
	F(n.version === "case-write-v1" && R(n.id) && n.apiBase === t && L(n.body) && Kt(n.body) <= Vt, "recovery version, backend or size");
	let r = JSON.parse(n.body);
	F(JSON.stringify(r) === n.body, "unchanged canonical browser command");
	let i = [
		"version",
		"id",
		"apiBase",
		"body",
		"kind"
	];
	if (n.kind === "create") Re(r);
	else {
		F(n.kind === "edit" && R(n.caseId) && ke(n.baseRevision), "edit recovery identity"), F(L(n.etag) && RegExp(`^"case-json-v1:${n.caseId}:${n.baseRevision}:[0-9a-f]{64}"$`).test(n.etag), "edit recovery ETag");
		let e = ze(r), t = I(n.review, "review field"), a = I(n.context, "review context");
		F(t.path === e.field_path && L(t.label) && L(t.period) && (_(t.value) || typeof t.value == "number" && Number.isFinite(t.value)) && [
			"USD",
			"%",
			"months"
		].includes(String(t.unit)), "recovery review");
		for (let e of ["min", "max"]) F(t[e] === void 0 || _(t[e]) || typeof t[e] == "number" && Number.isFinite(t[e]), "field range");
		F(t.integer === void 0 || typeof t.integer == "boolean", "field integer"), F(Object.keys(t).every((e) => [
			"path",
			"label",
			"period",
			"value",
			"unit",
			"min",
			"max",
			"integer"
		].includes(e)), "review fields");
		let o = Ie(e.field_path), s = o[0], c = o[o.length - 1], l = ["annual_rate", "ownership_percentage"].includes(c) ? "decimal fraction" : c === "term_months" ? "months" : "USD dollars";
		F(z(a.assessment_as_of) && a.basis === (s === "years" ? "annual_financials" : s === "working_capital" ? "working_capital" : "current_assumptions") && a.unit === l && t.unit === (l === "decimal fraction" ? "%" : l === "months" ? "months" : "USD"), "recovery context"), F(["years", "working_capital"].includes(s) ? z(a.period_start) && z(a.period_end) && a.period_start <= a.period_end && a.period_end <= a.assessment_as_of : a.period_start === null && a.period_end === null, "recovery period"), F(s === "guarantors" ? a.guarantor_index === Number(o[1]) && L(a.guarantor_name) : a.guarantor_index === null && a.guarantor_name === null, "recovery guarantor"), F(Object.keys(a).length === 7 && [
			"basis",
			"assessment_as_of",
			"period_start",
			"period_end",
			"guarantor_index",
			"guarantor_name",
			"unit"
		].every((e) => e in a), "recovery context fields"), i.push("caseId", "baseRevision", "etag", "review", "context");
	}
	F(Object.keys(n).length === i.length && Object.keys(n).every((e) => i.includes(e)), "recovery fields");
	let a = n;
	return a.kind === "edit" && (Object.freeze(a.review), Object.freeze(a.context)), Object.freeze(a);
}
function Jt(e, t) {
	let n = Re({
		input: e,
		rationale: Pe(t)
	});
	return qt({
		version: "case-write-v1",
		id: crypto.randomUUID(),
		apiBase: ft,
		kind: "create",
		body: JSON.stringify(n)
	});
}
function Yt(e, t, n) {
	F(e.assessment, "supported saved assessment");
	let r = Le(e.assessment.normalized_input, t.path);
	F(x(r.value, t.prior) && x(n.value, t.prior) && n.path === t.path && !x(t.next, t.prior), "reviewed base input");
	let i = ze({
		field_path: t.path,
		new_value: t.next,
		rationale: Pe(t.rationale)
	});
	return qt({
		version: "case-write-v1",
		id: crypto.randomUUID(),
		apiBase: ft,
		kind: "edit",
		body: JSON.stringify(i),
		caseId: e.snapshot.case_id,
		baseRevision: e.snapshot.revision,
		etag: e.etag,
		review: { ...n },
		context: r.context
	});
}
function Xt(e, t) {
	try {
		F(e, "browser recovery storage");
		let n = Ut(t), r = e.getItem(zt);
		r && F(B(Ut(JSON.parse(r)), n), "another unresolved operation");
		let i = JSON.stringify(n);
		F(Kt(i) <= Ht, "recovery journal size"), e.setItem(zt, i), F(e.getItem(zt) === i, "persisted recovery record");
	} catch {
		throw Error("This tab could not keep the write for recovery. Nothing was sent. Resolve its pending record or enable browser session storage before saving.");
	}
}
function Zt(e, t = ft) {
	try {
		if (!e) return {
			operation: null,
			error: "This browser cannot keep a saved write for recovery. Saved reads and unsaved assessment remain available."
		};
		let n = e.getItem(zt);
		return n ? (F(Kt(n) <= Ht, "recovery size"), {
			operation: Ut(JSON.parse(n), t),
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
function Qt(e, t) {
	F(e, "browser recovery storage");
	let n = e.getItem(zt);
	n && F(Ut(JSON.parse(n)).id === t, "matching recovery record"), e.removeItem(zt), F(e.getItem(zt) === null, "cleared recovery record");
}
function $t(e) {
	F(e, "browser recovery storage"), e.removeItem(zt), F(e.getItem(zt) === null, "discarded recovery record");
}
function en(e) {
	try {
		let t = e?.getItem(Bt);
		if (!t || t.length > 500) return null;
		let n = I(JSON.parse(t), "saved selection");
		return F(n.version === "case-selection-v1" && n.apiBase === ft && R(n.caseId) && (n.revision === "latest" || ke(n.revision)), "saved selection identity"), F(Object.keys(n).length === 4, "saved selection fields"), {
			caseId: n.caseId,
			revision: n.revision
		};
	} catch {
		return null;
	}
}
function tn(e, t) {
	try {
		t ? e?.setItem(Bt, JSON.stringify({
			version: "case-selection-v1",
			apiBase: ft,
			...t
		})) : e?.removeItem(Bt);
	} catch {}
}
//#endregion
//#region src/caseApi.ts
var nn = class extends Error {
	status;
	code;
	certain;
	retryAfter;
	constructor(e, t = 0, n = "outcome_uncertain", r = !1, i = null) {
		super(e), this.status = t, this.code = n, this.certain = r, this.retryAfter = i, this.name = "CaseApiError";
	}
};
function rn(e) {
	return e instanceof nn ? e : new nn(e instanceof Error ? e.message : String(e));
}
async function an(e, t, n) {
	let r;
	try {
		r = await bt(e, t, n);
	} catch {
		throw new nn("The response was lost or unavailable. Retry the exact saved write if one is pending.");
	}
	let i;
	try {
		i = await r.json();
	} catch {
		throw new nn(`Saved-case service returned an unreadable response (${r.status}).`, r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null, t = "request_failed", n = `Saved-case request failed (${r.status}).`;
		throw e && typeof e == "object" && !Array.isArray(e) ? ("code" in e && typeof e.code == "string" && (t = e.code), "message" in e && typeof e.message == "string" && (n = e.message)) : typeof e == "string" ? n = e : Array.isArray(e) && (n = e.map((e) => e && typeof e == "object" ? `${Array.isArray(e.loc) ? e.loc.join(".") : "input"}: ${String(e.msg ?? "Invalid input")}` : "Invalid input").join("; ")), t === "storage_not_configured" && (n = "Saved cases are not enabled for this local workspace. You can continue with unsaved assessments."), new nn(n, r.status, t, [
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
function on(e, t) {
	return F(R(e) && (t === "latest" || ke(t)), "requested case/revision"), `/cases/${encodeURIComponent(e)}${t === "latest" ? "" : `/revisions/${t}`}`;
}
async function sn(e, t, n, r = fetch) {
	let { response: i, body: a } = await an(on(e, t), { signal: n }, r), o = Be(a, i.headers.get("ETag"));
	return F(o.snapshot.case_id === e && (t === "latest" || o.snapshot.revision === t), "requested snapshot identity"), o;
}
async function cn(e, t, n = fetch) {
	let r = qt(e), i = {
		"Content-Type": "application/json",
		"Idempotency-Key": r.id
	};
	r.kind === "edit" && (i["If-Match"] = r.etag);
	let { response: a, body: o } = await an(r.kind === "create" ? "/cases" : `${on(r.caseId, "latest")}/revisions`, {
		method: "POST",
		headers: i,
		body: r.body,
		signal: t
	}, n);
	try {
		F(a.status === 201 && ["true", "false"].includes(a.headers.get("Idempotency-Replayed") ?? ""), "accepted receipt status/replay header");
		let e = Be(o, a.headers.get("ETag")), t = e.snapshot;
		if (r.kind === "create") {
			let e = Re(JSON.parse(r.body));
			F(t.revision === 1 && t.event.kind === "creation" && t.event.rationale === e.rationale && B(t.normalized_input, e.input), "creation receipt command");
		} else {
			let e = ze(JSON.parse(r.body));
			F(t.case_id === r.caseId && t.parent_revision === r.baseRevision && t.revision === r.baseRevision + 1 && t.event.field_path === e.field_path && t.event.after === e.new_value && t.event.before === r.review.value && t.event.rationale === e.rationale && B(t.event.context, r.context), "edit receipt command"), F(Le(t.normalized_input, e.field_path).value === e.new_value, "accepted edited input");
		}
		return {
			view: e,
			replayed: a.headers.get("Idempotency-Replayed") === "true"
		};
	} catch (e) {
		throw new nn(`The write may be saved, but its receipt could not be verified: ${e instanceof Error ? e.message : String(e)}`, a.status);
	}
}
var ln = (e) => `?${new URLSearchParams({
	limit: "25",
	...e ? { after: e } : {}
})}`;
async function un(e, t, n = fetch) {
	let { body: r } = await an(`/cases${ln(e)}`, { signal: t }, n);
	return We(r);
}
async function dn(e, t, n, r = fetch) {
	let { body: i } = await an(`${on(e, "latest")}/revisions${ln(t)}`, { signal: n }, r);
	return Ge(i, e);
}
async function fn(e, t, n = fetch) {
	let { body: r } = await an(`${on(e.snapshot.case_id, e.snapshot.revision)}/replay`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
		signal: t
	}, n);
	return Ke(r, e);
}
//#endregion
//#region src/SavedCases.tsx
function pn(e, t, n) {
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
				error: rn(e).message
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
function mn({ onOpen: e, onClose: t }) {
	let n = pn("cases", un, (e) => e.case_id);
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel caseList",
		"aria-label": "Saved cases",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "panelTitle",
				children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Saved cases" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "Newest creations first · local saved assessments" })] }), /* @__PURE__ */ (0, V.jsxs)("div", {
					className: "actions",
					children: [/* @__PURE__ */ (0, V.jsx)("button", {
						onClick: n.refresh,
						children: "Refresh saved cases"
					}), /* @__PURE__ */ (0, V.jsx)("button", {
						onClick: t,
						children: "Close saved cases"
					})]
				})]
			}),
			n.loading && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "status",
				children: "Loading saved cases…"
			}),
			n.error && /* @__PURE__ */ (0, V.jsx)("p", {
				role: "alert",
				children: n.error
			}),
			!n.loading && !n.error && !n.items.length && /* @__PURE__ */ (0, V.jsx)("p", { children: "No saved cases yet. Save an accepted dated assessment to begin." }),
			n.items.map((t) => /* @__PURE__ */ (0, V.jsxs)("article", {
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
					] })
				] }), /* @__PURE__ */ (0, V.jsx)("button", {
					"aria-label": `Open ${t.borrower_name} case ${t.case_id}`,
					onClick: () => e({
						caseId: t.case_id,
						revision: "latest"
					}),
					children: "Open case"
				})]
			}, t.case_id)),
			n.next && /* @__PURE__ */ (0, V.jsx)("button", {
				disabled: n.loading,
				onClick: n.more,
				children: "Load more saved cases"
			})
		]
	});
}
function hn({ saved: e, active: t, onOpen: n }) {
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
function gn({ view: e }) {
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
function _n({ saved: e, active: t, onOpen: n }) {
	let r = e.view, i = r.snapshot, a = i.event, o = pn(`${i.case_id}:${i.revision}`, (e, t) => dn(i.case_id, e, t), (e) => String(e.revision)), [s, l] = (0, c.useState)({
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
			let n = await fn(r, e.signal);
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
				error: rn(n).message,
				loading: !1
			});
		} finally {
			u.current === e && (u.current = null);
		}
	}
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel memo",
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
				"Original accepted revisions and server-recorded events. Recorded actor: ",
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
			/* @__PURE__ */ (0, V.jsx)(gn, { view: r })
		]
	});
}
function vn({ operation: e }) {
	let t = JSON.parse(e.body);
	return e.kind === "comparison" ? /* @__PURE__ */ (0, V.jsxs)("p", { children: [
		"Proposed comparison · Case ",
		e.caseId,
		" · revision ",
		e.baselineRevision,
		/* @__PURE__ */ (0, V.jsx)("br", {}),
		"Run ",
		e.baselineRunId,
		" · as of ",
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
function yn({ workspace: e, onDiscard: t, onReview: n, onOpenComparison: r }) {
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
				e.operation && /* @__PURE__ */ (0, V.jsx)(vn, { operation: e.operation }),
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
				/* @__PURE__ */ (0, V.jsx)(vn, { operation: e.conflict.operation }),
				/* @__PURE__ */ (0, V.jsx)("p", { children: "The case changed. Nothing from this proposal was accepted. Review the latest field before submitting a fresh revision." }),
				e.conflict.latest ? /* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Latest stored value:",
					" ",
					Le(e.conflict.latest.snapshot.normalized_input, e.conflict.operation.review.path).value,
					" ",
					"· Revision ",
					e.conflict.latest.snapshot.revision
				] }) : /* @__PURE__ */ (0, V.jsx)("p", {
					role: "status",
					children: e.conflict.error || "Loading latest for review…"
				}),
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
				/* @__PURE__ */ (0, V.jsx)(vn, { operation: e.rejected }),
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
var bn = /* @__PURE__ */ new Set([
	"preview_changed",
	"storage_upgrade_required",
	"baseline_run_mismatch",
	"baseline_unsupported",
	"baseline_replay_mismatch",
	"baseline_replay_unavailable"
]);
function xn(e) {
	return F(R(e), "comparison case locator"), `/cases/${encodeURIComponent(e)}`;
}
function Sn(e, t) {
	return F(ke(t), "comparison revision locator"), `${xn(e)}/revisions/${t}`;
}
async function Cn(e) {
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
async function wn(e, t, n) {
	let r;
	try {
		r = await bt(e, t, n);
	} catch {
		throw new nn("The comparison response was lost or unavailable. Keep and retry the exact pending save if one exists.");
	}
	let i;
	try {
		i = await Cn(r);
	} catch (e) {
		throw new nn(`Comparison response could not be read: ${e instanceof Error ? e.message : String(e)}.`, r.status);
	}
	if (!r.ok) {
		let e = i && typeof i == "object" && "detail" in i ? i.detail : null, t = "request_failed", n = `Comparison request failed (${r.status}).`, a = !1;
		e && typeof e == "object" && !Array.isArray(e) && "code" in e && typeof e.code == "string" && "message" in e && typeof e.message == "string" ? (t = e.code, n = e.message, a = !0) : Array.isArray(e) && (n = e.map((e) => e && typeof e == "object" && "msg" in e ? String(e.msg) : "Invalid scenario input").join("; "), a = !0);
		let o = a && ([
			400,
			404,
			413,
			422
		].includes(r.status) || r.status === 409 && bn.has(t));
		throw new nn(n, r.status, t, o, r.headers.get("Retry-After"));
	}
	return {
		response: r,
		body: i
	};
}
function Tn(e) {
	let t = kt(e), n = JSON.stringify(t);
	return F(new TextEncoder().encode(n).length <= 1e6, "scenario request byte limit"), n;
}
async function En(e, t, n, r = fetch) {
	F(t.schema_version === "commercial-scenario-preview-v2", "preview command version");
	let { response: i, body: a } = await wn(`${Sn(e.snapshot.case_id, e.snapshot.revision)}/scenarios/preview`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: Tn(t),
		signal: n
	}, r);
	return F(i.status === 200, "preview status"), Ft(a, e, t);
}
async function Dn(e, t, n = fetch) {
	let r = Ut(e);
	F(r.kind === "comparison", "comparison operation kind");
	let { response: i, body: a } = await wn(`${Sn(r.caseId, r.baselineRevision)}/scenario-comparisons`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Idempotency-Key": r.id
		},
		body: r.body,
		signal: t
	}, n);
	try {
		F(i.status === 201 && ["true", "false"].includes(i.headers.get("Idempotency-Replayed") ?? ""), "retained receipt status/replay");
		let e = Rt(a, i.headers.get("ETag")), t = e.record, n = t.preview, o = kt(JSON.parse(r.body));
		F(t.case_id === r.caseId && t.baseline_revision === r.baselineRevision && t.baseline_run_id === r.baselineRunId && B(At(n).scenarios, o.scenarios), "original receipt command/baseline");
		let s = n.baseline, c = n.fingerprint;
		return F(s.payload_hash === r.baselinePayloadHash && c.value === o.expected_preview_fingerprint && i.headers.get("Location") === `${xn(t.case_id)}/scenario-comparisons/${t.comparison_id}`, "original receipt fingerprint/location"), {
			view: e,
			replayed: i.headers.get("Idempotency-Replayed") === "true"
		};
	} catch (e) {
		throw new nn(`The comparison may be saved, but its receipt could not be verified: ${e instanceof Error ? e.message : String(e)}`, i.status);
	}
}
async function On(e, t, n, r = fetch) {
	F(R(t), "comparison locator");
	let { response: i, body: a } = await wn(`${xn(e)}/scenario-comparisons/${encodeURIComponent(t)}`, { signal: n }, r);
	F(i.status === 200, "original comparison status");
	let o = Rt(a, i.headers.get("ETag"));
	return F(o.record.case_id === e && o.record.comparison_id === t, "requested original comparison"), o;
}
async function kn(e, t, n, r = fetch) {
	F(t === null || /^[A-Za-z0-9_-]{1,512}$/.test(t), "comparison cursor");
	let i = new URLSearchParams({
		limit: "25",
		...t ? { after: t } : {}
	}), { response: a, body: o } = await wn(`${xn(e)}/scenario-comparisons?${i}`, { signal: n }, r);
	return F(a.status === 200, "comparison page status"), U(o, e);
}
//#endregion
//#region src/scenarioSelection.ts
var An = "spreadline.comparison-selection.v1";
function jn(e) {
	try {
		let t = Gt()?.getItem(An);
		if (!t || t.length > 500) return null;
		let n = JSON.parse(t);
		return Object.keys(n).length !== 4 || n.version !== "comparison-selection-v1" || n.apiBase !== ft || n.caseId !== e || !R(n.comparisonId) ? null : n.comparisonId;
	} catch {
		return null;
	}
}
function Mn(e, t) {
	try {
		let n = Gt();
		t === null ? n?.removeItem(An) : R(e) && R(t) && n?.setItem(An, JSON.stringify({
			version: "comparison-selection-v1",
			apiBase: ft,
			caseId: e,
			comparisonId: t
		}));
	} catch {}
}
//#endregion
//#region src/useScenarioWorkspace.ts
var Nn = {
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
function Pn(e) {
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
function Fn(e) {
	let { state: t } = e, n = t.status === "ready" ? t.saved?.view ?? null : null, r = n?.snapshot, i = `${t.id}:${t.status}:${r?.case_id ?? ""}:${r?.revision ?? ""}:${r?.run_id ?? ""}:${r?.payload_hash ?? ""}`, a = (0, c.useRef)(i);
	a.current = i;
	let o = (0, c.useRef)(0), s = (0, c.useRef)(null), l = (0, c.useRef)(null), u = (0, c.useRef)(0), [d, f] = (0, c.useState)({
		context: i,
		rows: [Pn(1)]
	}), [p, m] = (0, c.useState)(null), h = (0, c.useRef)(p);
	h.current = p;
	let [g, _] = (0, c.useState)(!1), [v, y] = (0, c.useState)(""), [b, x] = (0, c.useState)({
		context: i,
		loading: !1,
		error: "",
		view: null
	}), [S, C] = (0, c.useState)(0), w = (0, c.useRef)(0), T = (0, c.useRef)(null), E = (0, c.useRef)(0), D = d.context === i ? d.rows : [], O = p?.context === i ? p : null, ee = b.context === i ? b : {
		context: i,
		loading: !1,
		error: "",
		view: null
	}, te = !!n?.assessment, ne = !!(e.operation || e.recoveryError || e.conflict || e.inFlight), re = e.inFlight && e.operation?.kind === "comparison", ie = re || !!ee.view || ee.loading;
	function k() {
		o.current++, s.current?.abort(), s.current = null, h.current = null, m(null), _(!1), y(""), e.clearComparisonError();
	}
	function A(e, t) {
		ie || (k(), f((n) => ({
			context: i,
			rows: n.rows.map((n) => n.key === e ? t(n) : n)
		})));
	}
	function ae() {
		if (ie || D.length >= 10) return null;
		k();
		let e = Pn(D.length + 1);
		return f({
			context: i,
			rows: [...D, e]
		}), e.key;
	}
	function oe(e) {
		ie || D.length <= 1 || (k(), f({
			context: i,
			rows: D.filter((t) => t.key !== e)
		}));
	}
	function se(e, t) {
		A(e, (e) => {
			let n = Nn[t];
			return n ? {
				...e,
				preset: t,
				name: n.name,
				shocks: Object.fromEntries(St.map((e, t) => [e, n.values[t]]))
			} : {
				...e,
				preset: "custom"
			};
		});
	}
	async function j() {
		if (!n || !te || ie) return;
		k();
		let e = o.current, t = i, r = new AbortController();
		s.current = r;
		try {
			let i = kt({
				schema_version: "commercial-scenario-preview-v2",
				baseline_run_id: n.snapshot.run_id,
				scenarios: D.map((e) => ({
					scenario_key: e.key,
					name: Et(e.name, 120),
					rationale: Et(e.rationale, 2e3),
					assumptions: Object.fromEntries(St.map((t) => [t, Dt(e.shocks[t], t !== "proposed_rate_change_bps")]))
				}))
			});
			_(!0);
			let s = await En(n, i, r.signal);
			if (t !== a.current || e !== o.current || r.signal.aborted) return;
			let c = {
				context: t,
				generation: e,
				preview: s,
				consumed: !1
			};
			h.current = c, m(c);
		} catch (n) {
			t === a.current && e === o.current && !r.signal.aborted && y(rn(n).message);
		} finally {
			s.current === r && (s.current = null, _(!1));
		}
	}
	function ce() {
		let t = h.current;
		if (!(!t || t.context !== a.current || t.generation !== o.current || t.consumed || ne)) try {
			e.retainComparison(t.preview), T.current = t.generation;
			let n = {
				...t,
				consumed: !0
			};
			h.current = n, m(n), y("");
		} catch (e) {
			y(rn(e).message);
		}
	}
	function le() {
		re || (k(), f({
			context: i,
			rows: [Pn(1)]
		}), l.current?.abort(), u.current++, x({
			context: i,
			loading: !1,
			error: "",
			view: null
		}), r && Mn(r.case_id, null));
	}
	async function ue(e) {
		if (!r) return;
		k(), l.current?.abort();
		let t = new AbortController();
		l.current = t;
		let n = ++u.current, o = i;
		x({
			context: o,
			loading: !0,
			error: "",
			view: null
		});
		try {
			let i = await On(r.case_id, e, t.signal);
			if (o !== a.current || n !== u.current || t.signal.aborted) return;
			x({
				context: o,
				loading: !1,
				error: "",
				view: i
			}), Mn(r.case_id, e);
		} catch (e) {
			o === a.current && n === u.current && !t.signal.aborted && x({
				context: o,
				loading: !1,
				error: rn(e).message,
				view: null
			});
		} finally {
			l.current === t && (l.current = null);
		}
	}
	(0, c.useEffect)(() => {
		k(), T.current = null, E.current = o.current, f({
			context: i,
			rows: [Pn(1)]
		}), x({
			context: i,
			loading: !1,
			error: "",
			view: null
		});
		let e = r && jn(r.case_id);
		return e && ue(e), () => {
			o.current++, s.current?.abort(), u.current++, l.current?.abort();
		};
	}, [i]), (0, c.useEffect)(() => {
		let n = e.comparisonAck;
		if (n && n.serial !== w.current && (w.current = n.serial, n.scope === t.id && r && n.view.record.case_id === r.case_id && n.view.record.baseline_revision === r.revision && n.view.record.baseline_run_id === r.run_id)) {
			if (o.current !== (T.current ?? E.current)) {
				e.deferComparisonAck(n.serial), C((e) => e + 1);
				return;
			}
			l.current?.abort(), u.current++, x({
				context: i,
				loading: !1,
				error: "",
				view: n.view
			}), Mn(r.case_id, n.view.record.comparison_id), C((e) => e + 1);
		}
	}, [e.comparisonAck]);
	let de = e.comparisonError?.scope === t.id ? e.comparisonError : null;
	return {
		context: i,
		baseline: r,
		view: n,
		supported: te,
		rows: D,
		busy: g,
		error: v || de?.message || "",
		errorCode: de?.code,
		canSaveBaseline: e.canSave,
		previewConsumed: !!O?.consumed,
		frozen: re,
		fieldsDisabled: ie,
		writeBlocked: ne,
		previewResult: O?.preview ?? null,
		original: ee,
		refreshSerial: S,
		canRetain: !!O && !O.consumed && O.generation === o.current && !ne && !ie,
		change: A,
		add: ae,
		remove: oe,
		preset: se,
		preview: j,
		retain: ce,
		newDraft: le,
		open: ue
	};
}
//#endregion
//#region src/fieldCatalog.ts
var In = {
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
}, Ln = {
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
}, Rn = ["annual_rate", "ownership_percentage"], zn = [
	"cpltd_annual",
	"operating_lease_annual",
	"amount",
	"annual_rate",
	"ownership_percentage",
	"mortgage_pi_annual",
	"auto_loan_annual",
	"credit_card_min_annual"
], Bn = [
	"gross_profit",
	"ordinary_business_income",
	"ebitda",
	"k1_distribution_ratio"
], Vn = (e, t) => e.period_start && e.period_end ? `${e.period_start} – ${e.period_end}` : `Supplied period ${t + 1}`;
function Hn(e) {
	return "assessment_as_of" in e ? `Assumption as of ${e.assessment_as_of}` : "Legacy annual assumption";
}
function Un(e) {
	let t = e.years.length - 1;
	return `Working capital for ${Vn(e.years[t], t)}`;
}
function Wn(e, t, n) {
	let r = e.years[t];
	return {
		path: `/years/${t}/${n}`,
		label: In[n],
		value: r[n],
		unit: "USD",
		min: n === "interest_expense" ? "0" : void 0,
		period: Vn(r, t)
	};
}
function Gn(e, t, n, r, i, a) {
	let o = Rn.includes(r), s = r === "term_months";
	return {
		path: `${n}/${r}`,
		label: In[r] ?? r,
		value: i,
		unit: o ? "%" : s ? "months" : "USD",
		min: s ? t === "dated" ? 12 : 1 : zn.includes(r) ? 0 : void 0,
		max: r === "ownership_percentage" || r === "annual_rate" && t === "dated" ? 1 : void 0,
		integer: s,
		period: a ?? Hn(e)
	};
}
//#endregion
//#region src/Scenarios.tsx
var Kn = [
	"Revenue change (%)",
	"COGS change (%)",
	"Operating expense change (%)",
	"Proposed rate change (bps)"
];
function qn({ title: e, children: t }) {
	let [n, r] = (0, c.useState)(!1);
	return /* @__PURE__ */ (0, V.jsxs)("details", {
		onToggle: (e) => r(e.currentTarget.open),
		children: [/* @__PURE__ */ (0, V.jsx)("summary", { children: e }), n && t()]
	});
}
function Jn({ rows: e, render: t, label: n }) {
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
function Yn({ value: e }) {
	let t = (0, c.useMemo)(() => {
		let t = new TextEncoder().encode(JSON.stringify(e, null, 2)), n = [], r = new TextDecoder("utf-8", { fatal: !0 });
		for (let e = 0; e < t.length;) {
			let i = Math.min(e + 65536, t.length);
			for (; i < t.length && (t[i] & 192) == 128;) i--;
			n.push(r.decode(t.slice(e, i))), e = i;
		}
		return n;
	}, [e]), [n, r] = (0, c.useState)(0);
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "originalComparisonJson",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				"Original JSON · page ",
				n + 1,
				" of ",
				t.length,
				" · up to 64 KiB of UTF-8 text per page"
			] }),
			/* @__PURE__ */ (0, V.jsx)("pre", { children: t[n] }),
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, V.jsx)("button", {
					disabled: n === 0,
					onClick: () => r(n - 1),
					children: "Previous JSON page"
				}), /* @__PURE__ */ (0, V.jsx)("button", {
					disabled: n + 1 === t.length,
					onClick: () => r(n + 1),
					children: "Next JSON page"
				})]
			})
		]
	});
}
function Xn({ row: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("details", { children: [
		/* @__PURE__ */ (0, V.jsxs)("summary", { children: [
			e.fact_id,
			" · ",
			it(e)
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
function Zn(e) {
	return e === null ? "Not applicable" : String(e);
}
function Qn(e) {
	return e === null ? "Not applicable" : String(e);
}
function $n({ preview: e, result: t }) {
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
					"Baseline ",
					/* @__PURE__ */ (0, V.jsx)("strong", {
						"data-outcome": t.outcome_change.baseline,
						children: t.outcome_change.baseline.toUpperCase()
					}),
					" → Projected ",
					/* @__PURE__ */ (0, V.jsx)("strong", {
						"data-outcome": t.outcome_change.projected,
						children: t.outcome_change.projected.toUpperCase()
					}),
					" · ",
					t.outcome_change.changed ? "Outcome changed" : "Outcome unchanged"
				]
			}),
			/* @__PURE__ */ (0, V.jsxs)("p", { children: [
				"Server score ",
				t.decision.score,
				" · retained policy ",
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
					/* @__PURE__ */ (0, V.jsx)("tbody", { children: pe.map((e) => {
						let r = t.comparisons.find((t) => t.metric === e);
						return /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, V.jsx)("th", {
								scope: "row",
								children: Ln[e]
							}),
							/* @__PURE__ */ (0, V.jsx)("td", {
								className: "num",
								children: it(n.current_facts[e])
							}),
							/* @__PURE__ */ (0, V.jsx)("td", {
								className: "num",
								children: it(t.current_facts[e])
							}),
							/* @__PURE__ */ (0, V.jsxs)("td", {
								className: "num",
								children: [r ? r.delta === null ? "Not applicable" : it({
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
				"K-1 history stays observed: ",
				it(t.current_facts.k1_history),
				". Current shocks do not create a historical operating year."
			] }),
			/* @__PURE__ */ (0, V.jsx)(qn, {
				title: "Raw deltas and policy headroom",
				children: () => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("p", { children: "Values below are the server's raw results. Approval uses the displayed operator; decline floors apply where returned." }), t.comparisons.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
					className: "scenarioFact",
					children: [
						/* @__PURE__ */ (0, V.jsx)("strong", { children: Ln[e.metric] }),
						/* @__PURE__ */ (0, V.jsxs)("p", { children: [
							"Baseline ",
							Zn(e.baseline_value),
							" · projected ",
							Zn(e.projected_value),
							" · delta ",
							Zn(e.delta),
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
							Zn(e.policy_headroom.approval_threshold),
							" · decline floor ",
							Zn(e.policy_headroom.decline_threshold),
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Approval headroom: baseline ",
							Qn(e.policy_headroom.baseline_approval),
							" · projected ",
							Qn(e.policy_headroom.projected_approval),
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Decline headroom: baseline ",
							Qn(e.policy_headroom.baseline_decline),
							" · projected ",
							Qn(e.policy_headroom.projected_decline)
						] })
					]
				}, e.metric))] })
			}),
			/* @__PURE__ */ (0, V.jsx)(qn, {
				title: "Factor and reason changes",
				children: () => /* @__PURE__ */ (0, V.jsxs)("div", { children: [
					t.factor_changes.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
						className: "scenarioFact",
						children: [/* @__PURE__ */ (0, V.jsxs)("h4", { children: [
							Ln[e.name],
							" · ",
							e.changed ? "Changed" : "Unchanged"
						] }), /* @__PURE__ */ (0, V.jsxs)("p", { children: [
							"Baseline raw ",
							Zn(e.baseline.raw_value),
							" → projected raw ",
							Zn(e.projected.raw_value),
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Pass: ",
							Zn(e.baseline.passed),
							" → ",
							Zn(e.projected.passed),
							" · decline triggered: ",
							Zn(e.baseline.decline_triggered),
							" → ",
							Zn(e.projected.decline_triggered),
							/* @__PURE__ */ (0, V.jsx)("br", {}),
							"Operator ",
							e.projected.comparison_operator ?? "Not applicable",
							" · approval ",
							Zn(e.projected.threshold),
							" · decline floor ",
							Zn(e.projected.decline_threshold),
							" · weight ",
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
			/* @__PURE__ */ (0, V.jsx)(qn, {
				title: "Projected inputs and held-fixed assumptions",
				children: () => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify({
					assumptions: t.assumptions,
					operating: t.projection_inputs.operating,
					proposed_loan: t.projection_inputs.proposed_loan,
					existing_debt: t.projection_inputs.existing_debt,
					working_capital: t.projection_inputs.working_capital
				}, null, 2) }), /* @__PURE__ */ (0, V.jsx)("ul", { children: e.held_fixed_assumptions.map((e, t) => /* @__PURE__ */ (0, V.jsx)("li", { children: e }, t)) })] })
			}),
			/* @__PURE__ */ (0, V.jsx)(qn, {
				title: "Projected guarantor contributions",
				children: () => /* @__PURE__ */ (0, V.jsx)(Jn, {
					rows: t.guarantor_contributions,
					label: "guarantors",
					render: (e, n) => /* @__PURE__ */ (0, V.jsxs)("div", {
						className: "scenarioFact",
						children: [
							/* @__PURE__ */ (0, V.jsx)("h4", { children: e.name }),
							/* @__PURE__ */ (0, V.jsxs)("p", { children: [
								"Business EBITDA: ",
								it(e.business_ebitda),
								/* @__PURE__ */ (0, V.jsx)("br", {}),
								"Outside income: ",
								it(e.outside_income),
								/* @__PURE__ */ (0, V.jsx)("br", {}),
								"Personal debt: ",
								it(e.personal_debt)
							] }),
							/* @__PURE__ */ (0, V.jsx)(qn, {
								title: `${e.name} projected inputs`,
								children: () => /* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify(t.projection_inputs.guarantors[n], null, 2) })
							})
						]
					}, n)
				})
			}),
			/* @__PURE__ */ (0, V.jsx)(qn, {
				title: "Calculation trace",
				children: () => /* @__PURE__ */ (0, V.jsx)(Jn, {
					rows: t.calculation_trace,
					label: "trace",
					render: (e) => /* @__PURE__ */ (0, V.jsx)(Xn, { row: e }, e.fact_id)
				})
			})
		]
	});
}
function er({ preview: e }) {
	let [t, n] = (0, c.useState)(0);
	return /* @__PURE__ */ (0, V.jsxs)("div", { children: [
		/* @__PURE__ */ (0, V.jsxs)("label", {
			className: "scenarioSelect",
			children: ["Reviewed scenario ", /* @__PURE__ */ (0, V.jsx)("select", {
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
			})]
		}),
		/* @__PURE__ */ (0, V.jsx)($n, {
			preview: e,
			result: e.scenarios[t]
		}, e.scenarios[t].scenario_key),
		/* @__PURE__ */ (0, V.jsx)("p", {
			className: "fine",
			children: e.disclaimer
		})
	] });
}
function tr({ view: e, onOpen: t }) {
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
						" · baseline revision ",
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
				" · ",
				n.actor === "prototype-demo-unverified" ? "archived demonstration identity" : "configured credential identity",
				" · source status ",
				n.recording.source_status,
				n.recording.source_revision ? ` · ${n.recording.source_revision}` : " · exact build revision not supplied"
			] }),
			e.preview ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Operating period ",
					e.preview.selected_period.period_start,
					" – ",
					e.preview.selected_period.period_end,
					" · assumptions as of ",
					e.preview.assumptions_as_of,
					/* @__PURE__ */ (0, V.jsx)("br", {}),
					"Retained policy ",
					e.preview.policy_snapshot.version,
					" · ",
					e.preview.scenario_definition_version,
					" · ",
					e.preview.calculation_version
				] }),
				/* @__PURE__ */ (0, V.jsx)(qn, {
					title: "Baseline hashes, fingerprint and retained policy",
					children: () => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Input hash ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.preview.baseline.input_hash }),
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Baseline payload hash ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.preview.baseline.payload_hash }),
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Reviewed fingerprint ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.preview.fingerprint.value })
					] }), /* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify({
						units: e.preview.units,
						policy_snapshot: e.preview.policy_snapshot,
						recording: n.recording
					}, null, 2) })] })
				}),
				/* @__PURE__ */ (0, V.jsx)(er, { preview: e.preview }, n.comparison_id)
			] }) : /* @__PURE__ */ (0, V.jsx)("p", {
				className: "compatibility",
				role: "status",
				children: e.compatibility
			}),
			/* @__PURE__ */ (0, V.jsx)(qn, {
				title: "Original comparison JSON",
				children: () => /* @__PURE__ */ (0, V.jsx)(Yn, { value: n })
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
function nr({ caseId: e, scope: t, refresh: n, onOpen: r }) {
	let i = pn(`${t}:${n}`, (t, n) => kn(e, t, n), (e) => e.comparison_id);
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
						" · ",
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
function rr({ model: e, onSaveBaseline: t, onOpenBaseline: n }) {
	let r = (0, c.useRef)(null), [i, a] = (0, c.useState)(null);
	(0, c.useEffect)(() => {
		i && (Ye(`[id="scenario-name-${i}"]`)?.focus(), a(null));
	}, [i]);
	let o = e.view?.assessment;
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "scenariosWorkspace",
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
						" · baseline revision ",
						e.baseline.revision,
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Run ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.baseline.run_id }),
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Payload hash ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.baseline.payload_hash })
					] }),
					o && /* @__PURE__ */ (0, V.jsxs)("p", { children: [
						"Operating period ",
						o.selected_period.period_start,
						" – ",
						o.selected_period.period_end,
						" · assumptions as of ",
						o.assumptions_as_of,
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Retained policy ",
						o.policy_snapshot.version,
						". The spread's selected column does not change this baseline."
					] }),
					e.view ? e.supported ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
						/* @__PURE__ */ (0, V.jsx)("p", { children: "Enter percentage changes as percentages (−10 means −10%). Enter rate changes in basis points; fractional basis points are supported. Each of the four shocks must be explicit. Presets fill the name and shocks; enter your own rationale." }),
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
											}), Object.entries(Nn).map(([e, t]) => /* @__PURE__ */ (0, V.jsx)("option", {
												value: e,
												children: t.name
											}, e))]
										})] }),
										/* @__PURE__ */ (0, V.jsxs)("label", { children: ["Name", /* @__PURE__ */ (0, V.jsx)("input", {
											id: `scenario-name-${t.key}`,
											"aria-label": `Scenario ${n + 1} name`,
											value: t.name,
											onChange: (n) => e.change(t.key, (e) => ({
												...e,
												name: n.target.value
											}))
										})] }),
										/* @__PURE__ */ (0, V.jsxs)("label", {
											className: "scenarioRationale",
											children: [
												"Rationale",
												/* @__PURE__ */ (0, V.jsx)("textarea", {
													"aria-label": `Scenario ${n + 1} rationale`,
													rows: 3,
													value: t.rationale,
													onChange: (n) => e.change(t.key, (e) => ({
														...e,
														rationale: n.target.value
													}))
												}),
												/* @__PURE__ */ (0, V.jsx)("small", { children: "Required · at most 2,000 Unicode characters after trimming; name limit 120." })
											]
										}),
										St.map((r, i) => /* @__PURE__ */ (0, V.jsxs)("label", { children: [Kn[i], /* @__PURE__ */ (0, V.jsx)("input", {
											inputMode: "decimal",
											"aria-label": `Scenario ${n + 1} ${Kn[i]}`,
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
									onClick: () => void e.preview(),
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
						"Retention requires the documented copy upgrade to a separate schema-v2 database. An operator must verify the copy and select it explicitly; opening this view performs no upgrade. See ",
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
						"Reviewed fingerprint ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: e.previewResult.fingerprint.value })
					] }),
					/* @__PURE__ */ (0, V.jsx)(er, { preview: e.previewResult }, e.previewResult.fingerprint.value)
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
			e.original.view && (!e.previewResult || e.previewConsumed) && /* @__PURE__ */ (0, V.jsx)(tr, {
				view: e.original.view,
				onOpen: n
			}),
			e.baseline && /* @__PURE__ */ (0, V.jsx)(nr, {
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
var ir = "Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.";
function ar(e, t) {
	return `spreadline-case-${e.case_id}-r${e.revision}-${e.run_id}${t ? `-comparison-${t.comparison_id}` : ""}.json`;
}
function or(e, t) {
	let n = e.snapshot, r = t.record, i = I(r.preview.baseline, "export comparison baseline");
	F(r.case_id === n.case_id && r.baseline_revision === n.revision && r.baseline_run_id === n.run_id && i.case_id === n.case_id && i.revision === n.revision && i.run_id === n.run_id && i.input_hash === n.input_hash && i.payload_hash === n.payload_hash && B(i.assessment, n.assessment), "retained comparison must match the selected original case, revision, run, hashes and full baseline assessment");
}
//#endregion
//#region src/reviewPackage.worker.ts?worker&inline
var sr = "(function(){let e=/^([+-]?)(?:(\\d+)(?:\\.(\\d*))?|\\.(\\d+))(?:[eE]([+-]?\\d+))?$/,t=10n;function n(t){if(t.length>256)throw Error(`Decimal exceeds the supported range.`);let n=e.exec(t);if(!n)throw Error(`Enter a finite decimal value.`);let r=Number(n[5]??`0`);if(!Number.isSafeInteger(r)||Math.abs(r)>128)throw Error(`Decimal exponent exceeds the supported range.`);let i=n[3]??n[4]??``;return{coefficient:BigInt(`${n[1]===`-`?`-`:``}${n[2]??`0`}${i}`),scale:i.length-r}}function r({coefficient:e,scale:t}){if(e===0n)return`0`;let n=e<0n?`-`:``,r=(e<0n?-e:e).toString();return t<=0?n+r+`0`.repeat(-t):(r=r.padStart(t+1,`0`),(n+r.slice(0,-t)+`.`+r.slice(-t)).replace(/0+$/,``).replace(/\\.$/,``))}function i(e){return r(n(e))}function a(e){if(typeof e!=`string`)return!1;try{return n(e),!0}catch{return!1}}function o(e){if(typeof e==`number`&&Number.isFinite(e))return i(String(e));if(typeof e==`string`)return i(e);throw Error(`Financial values must be finite decimals.`)}function s(e,r){let i=n(e),a=n(r),o=Math.max(i.scale,a.scale),s=i.coefficient*t**BigInt(o-i.scale),c=a.coefficient*t**BigInt(o-a.scale);return s<c?-1:+(s>c)}function c(e,t){try{return s(o(e),o(t))===0}catch{return!1}}let l=[`gross_receipts`,`cogs`,`operating_expense_excl_dna_interest_comp`,`officer_compensation`,`depreciation`,`amortization`,`interest_expense`,`section_179`,`k1_distribution`],u=[`ordinary_business_income`,`ebitda`,`proposed_monthly_payment`,`proposed_annual_payment`,`debt_service`,`fixed_charge_service`,`global_business_ebitda`,`global_outside_income`,`global_personal_debt`,`global_cash_flow`,`global_debt_service`,`dscr`,`fccr`,`global_dscr`,`net_working_capital_increase`,`uca_cash_flow`,`k1_ratio_difference`,`k1_history`],d=[`commercial_min_dscr`,`commercial_min_fccr`,`commercial_min_global_dscr`,`commercial_decline_dscr`,`commercial_decline_fccr`,`commercial_decline_global_dscr`,`commercial_min_uca_cash_flow`,`consumer_review_dti`,`consumer_decline_dti`,`consumer_min_credit_score`,`extraction_confidence_threshold`,`k1_stability_band`,`sba_global_dscr_floor_expansion`,`sba_global_dscr_floor_acquisition`];function f(e,t){if(!e)throw Error(`Incomplete or invalid assessment: ${t}`)}function p(e,t){return f(typeof e==`object`&&!!e&&!Array.isArray(e),t),e}function m(e,t){return f(Array.isArray(e),t),e}function h(e){return typeof e==`string`&&e.length>0}function g(e){return typeof e==`number`&&Number.isFinite(e)}function _(e){return typeof e==`string`||typeof e==`boolean`}function v(e){return typeof e==`string`&&/^\\d{4}-\\d{2}-\\d{2}$/.test(e)&&Number.isFinite(Date.parse(e))&&new Date(e).toISOString().slice(0,10)===e}function y(e){let t=p(e,`period`);return f(v(t.period_start)&&v(t.period_end)&&t.period_start<=t.period_end,`period dates`),t}let b=(e,t)=>e.period_start===t.period_start&&e.period_end===t.period_end;function x(e){let t=p(e,`decision`);f(t.vertical===`commercial`&&[`approve`,`review`,`decline`].includes(String(t.outcome))&&a(t.score)&&h(t.policy_version)&&h(t.disclaimer),`decision identity`);let n=m(t.factors,`factors`);f(n.length===5,`commercial factors`);let r=[`dscr`,`fccr`,`global_dscr`,`uca_positive`,`k1_history`];for(let e of n){let t=p(e,`factor`);f(h(t.name)&&r.includes(t.name)&&_(t.value)&&(t.raw_value===null||_(t.raw_value))&&a(t.weight)&&(t.threshold===null||_(t.threshold))&&(t.passed===null||typeof t.passed==`boolean`)&&h(t.source)&&[null,`>=`,`>`,`<`,`==`].includes(t.comparison_operator)&&(t.decline_threshold===null||a(t.decline_threshold))&&(t.decline_triggered===null||typeof t.decline_triggered==`boolean`),`factor fields`)}f(new Set(n.map(e=>p(e,`factor`).name)).size===5,`unique factors`);for(let e of m(t.reasons,`reasons`)){let t=p(e,`reason`);f(h(t.code)&&h(t.factor)&&h(t.message)&&_(t.value),`reason fields`)}return t}function S(e){let t=p(e,`normalized input`);f(t.schema_version===`commercial-assessment-v2`&&v(t.assessment_as_of)&&h(t.borrower_name)&&h(t.geography),`dated identity`);let n=p(t.units,`units`);f(n.currency===`USD`&&n.monetary_unit===`dollars`&&n.annual_rate_unit===`decimal_nominal`,`units`);let r=m(t.years,`years`);f(r.length>=1&&r.length<=10,`year count`);let i=``;for(let e of r){let n=p(e,`year`),r=y(n);f(r.period_start>i&&r.period_end<=t.assessment_as_of,`year order`),i=r.period_end;for(let e of l)f(a(n[e]),`year ${e}`)}let o=(e,t)=>{let n=p(e,`assumption`);for(let e of t)f(a(n[e]),e);return n};o(t.existing_debt,[`cpltd_annual`,`operating_lease_annual`]);let s=o(t.proposed_loan,[`amount`,`annual_rate`]);f(Number.isSafeInteger(s.term_months)&&s.rate_type===`fixed`&&s.repayment_type===`fully_amortizing`&&s.payment_frequency===`monthly`,`loan convention`);let c=o(t.working_capital,[`ar_increase`,`inventory_increase`,`ap_increase`,`cash_taxes_paid`]);f(b(y(c),y(r[r.length-1])),`working capital period`);for(let e of m(t.guarantors,`guarantors`))f(h(o(e,[`ownership_percentage`,`wages`,`interest_dividend_income`,`mortgage_pi_annual`,`auto_loan_annual`,`credit_card_min_annual`]).name),`guarantor name`);return t}function C(e){let t=p(e,`metric`);return f(h(t.fact_id)&&h(t.unit)&&(t.display_precision===null||Number.isInteger(t.display_precision)&&Number(t.display_precision)>=0&&Number(t.display_precision)<=30)&&(t.explanation===null||h(t.explanation)),`metric fields`),f(t.status===`available`?a(t.raw_value)||t.unit===`category`&&h(t.raw_value):t.status===`not_applicable`&&t.raw_value===null&&h(t.explanation),`metric status/value`),f(t.status===`not_applicable`?t.reported_value===null:t.unit===`category`?t.reported_value===t.raw_value:a(t.reported_value),`reported metric value`),t}function w(e){let t=p(e,`assessment`);f(t.schema_version===`commercial-assessment-v2`&&t.calculation_version===`commercial-calculation-v2`&&t.serialization_version===`assessment-json-v2`&&t.coverage_basis===`current_pro_forma`&&h(t.disclaimer),`versions`);let n=S(t.normalized_input),r=n.years[n.years.length-1];f(b(y(t.selected_period),r)&&t.assumptions_as_of===n.assessment_as_of,`selected period`);let i=m(t.historical_spread,`spread`);f(i.length===n.years.length,`spread length`);let o=[];i.forEach((e,t)=>{let r=p(e,`historical period`);f(b(y(r),n.years[t])&&b(y(r.financials),n.years[t]),`historical period correspondence`);let i=p(r.financials,`historical financials`);for(let e of l)f(i[e]===n.years[t][e],`historical inputs`);let s=p(r.reported_financials,`reported financials`);f(b(y(s),n.years[t]),`reported period`);for(let e of l)f(a(s[e])&&/^-?\\d+\\.\\d{2}$/.test(s[e]),`reported source amount`);for(let e of[`gross_profit`,`ordinary_business_income`,`ebitda`,`k1_distribution_ratio`])o.push(C(r[e]))});let s=p(t.current_facts,`facts`);for(let e of u){let t=C(s[e]),r=[`ordinary_business_income`,`ebitda`].includes(e)?`years.${n.years.length-1}.${e}`:`current.${e}`;f(t.fact_id===r,`fact identity`),f(e===`k1_history`?t.status===`available`&&[`stable`,`unstable`,`insufficient_history`].includes(String(t.raw_value)):t.raw_value===null||a(t.raw_value),`fact type`),o.push(t)}let c=m(t.guarantor_contributions,`contributions`);f(c.length===n.guarantors.length,`contributions length`),c.forEach((e,t)=>{let r=p(e,`contribution`);f(r.guarantor_index===t&&r.name===n.guarantors[t].name,`contribution identity`);for(let e of[`business_ebitda`,`outside_income`,`personal_debt`])o.push(C(r[e]))});let _=m(t.k1_history_periods,`history periods`).map(y);f(_.length>=1&&_.length<=2&&b(_[_.length-1],r)&&_.every(e=>n.years.some(t=>b(e,t))),`history periods`);let w=p(t.policy_snapshot,`policy`);f(h(w.version)&&v(w.sba_sop_8_effective)&&v(w.sba_sop_8_1_effective),`policy identity`);for(let e of d)f(e===`consumer_min_credit_score`?Number.isSafeInteger(w[e]):a(w[e]),`policy ${e}`);f(m(w.consumer_required_atr_fields,`ATR fields`).every(h),`ATR fields`);let T=x(t.decision);f(T.policy_version===w.version,`decision policy`);let E=m(t.calculation_trace,`trace`);f(E.length>0,`trace rows`);let D=/* @__PURE__ */ new Map;for(let e of E){let t=p(e,`trace row`),n=C(t);f(h(t.definition_id)&&h(t.expression)&&!D.has(n.fact_id),`trace identity`),D.set(n.fact_id,n);for(let e of m(t.operands,`operands`)){let t=p(e,`operand`);f([`input`,`fact`,`policy`].includes(String(t.reference_type))&&h(t.reference)&&h(t.unit)&&(t.raw_value===null||g(t.raw_value)||typeof t.raw_value==`string`),`operand fields`),f(t.reported_value===null||a(t.reported_value)||Number.isSafeInteger(t.reported_value),`reported operand`)}}for(let e of E){let t=p(e,`trace row`);for(let e of m(t.operands,`operands`)){let t=p(e,`operand`);if(t.reference_type===`fact`){let e=D.get(String(t.reference));f(e&&e.raw_value===t.raw_value&&e.unit===t.unit,`referenced fact`)}else{let e=String(t.reference).split(`/`).slice(1),r=t.reference_type===`policy`?{policy_snapshot:w}:n;for(let t of e)f(typeof r==`object`&&!!r&&Object.prototype.hasOwnProperty.call(r,t),`operand input path`),r=r[t];f(r===t.raw_value,`operand input value`)}}}for(let e of o){let t=D.get(e.fact_id);f(t&&t.raw_value===e.raw_value&&t.reported_value===e.reported_value&&t.status===e.status&&t.unit===e.unit,`fact/trace correspondence`)}for(let e of T.factors){let t=e.name===`uca_positive`?`uca_cash_flow`:e.name;f(e.raw_value===C(s[t]).raw_value,`factor/fact correspondence`)}let O=p(t.fingerprint,`fingerprint`);return f(O.algorithm===`sha256`&&typeof O.value==`string`&&/^[0-9a-f]{64}$/.test(O.value)&&O.content===`normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version`,`fingerprint`),t}function T(e,t){if(!e)throw Error(`Invalid saved-case response or command: ${t}.`)}function E(e,t){return T(typeof e==`object`&&!!e&&!Array.isArray(e),t),e}let D=e=>typeof e==`number`&&Number.isFinite(e),O=e=>typeof e==`string`,k=e=>O(e)&&/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(e),A=e=>O(e)&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(e),j=e=>Number.isSafeInteger(e)&&Number(e)>=1,M=e=>O(e)&&/^[0-9a-f]{64}$/.test(e),N=e=>O(e)&&/^\\d{4}-\\d{2}-\\d{2}$/.test(e)&&Number.isFinite(Date.parse(e))&&new Date(e).toISOString().slice(0,10)===e,P=e=>O(e)&&/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,6})?(?:Z|\\+00:00)$/.test(e)&&N(e.slice(0,10))&&Number.isFinite(Date.parse(e));function F(e,t=0,n=64){if(T(t<n,`JSON depth`),!(e===null||O(e)||typeof e==`boolean`)){if(typeof e==`number`){T(D(e),`finite JSON number`);return}T(typeof e==`object`,`JSON value`);for(let r of Object.values(e))F(r,t+1,n)}}function I(e,t){if(e===t)return!0;if(!e||!t||typeof e!=`object`||typeof t!=`object`||Array.isArray(e)!==Array.isArray(t))return!1;let n=Object.keys(e),r=Object.keys(t);return n.length===r.length&&n.every(n=>Object.prototype.hasOwnProperty.call(t,n)&&I(e[n],t[n]))}function ee(e){return T(O(e)&&[...e].length<=2e3&&e.trim().length>0,`nonblank rationale, at most 2,000 characters`),e.trim()}let L={years:l,existing_debt:[`cpltd_annual`,`operating_lease_annual`],proposed_loan:[`amount`,`annual_rate`,`term_months`],guarantors:[`ownership_percentage`,`wages`,`interest_dividend_income`,`mortgage_pi_annual`,`auto_loan_annual`,`credit_card_min_annual`],working_capital:[`ar_increase`,`inventory_increase`,`ap_increase`,`cash_taxes_paid`]};function R(e){T(O(e)&&e.length<=160&&e.startsWith(`/`),`numeric field path`);let t=e.slice(1).split(`/`),n=t[0],r=t[t.length-1];return T(Object.prototype.hasOwnProperty.call(L,n)&&L[n].includes(r),`numeric field allowlist`),T([`years`,`guarantors`].includes(n)?t.length===3&&/^(?:0|[1-9][0-9]{0,8})$/.test(t[1]):t.length===2,`field index`),t}function te(e,t){let n=R(t),r=n[0],i=n[n.length-1],o=e,s,c={basis:`current_assumptions`,assessment_as_of:String(o.assessment_as_of),period_start:null,period_end:null,guarantor_index:null,guarantor_name:null,unit:`USD dollars`};if(n.length===3){let e=o[r];T(Array.isArray(e)&&Number(n[1])<e.length,`existing input index`),s=E(e[Number(n[1])],`input row`),r===`guarantors`?(c.guarantor_index=Number(n[1]),c.guarantor_name=String(s.name)):c.basis=`annual_financials`}else s=E(o[r],`input group`),r===`working_capital`&&(c.basis=`working_capital`);[`annual_financials`,`working_capital`].includes(c.basis)&&(T(N(s.period_start)&&N(s.period_end),`input dates`),c.period_start=s.period_start,c.period_end=s.period_end),[`annual_rate`,`ownership_percentage`].includes(i)&&(c.unit=`decimal fraction`),i===`term_months`&&(c.unit=`months`);let l=s[i];return T(i===`term_months`?Number.isSafeInteger(l):a(l)||D(l),`numeric input`),{value:l,context:c}}function ne(e,t){let n=E(e,`snapshot`);F(n),T(n.storage_serialization_version===`case-json-v1`&&A(n.case_id)&&A(n.run_id)&&j(n.revision),`snapshot identity`),T(n.parent_revision===(n.revision===1?null:n.revision-1)&&P(n.recorded_at),`snapshot parent/time`),T(M(n.input_hash)&&M(n.payload_hash),`snapshot hashes`),T(t===`\"case-json-v1:${n.case_id}:${n.revision}:${n.payload_hash}\"`,`strong ETag`);let r=E(n.normalized_input,`stored input`),i=E(n.assessment,`stored assessment`);T(O(i.schema_version)&&O(i.calculation_version)&&O(i.serialization_version),`assessment versions`);let o=i.schema_version===`commercial-assessment-v2`&&i.calculation_version===`commercial-calculation-v2`&&i.serialization_version===`assessment-json-v2`,s=o?w(i):null;s&&T(I(r,s.normalized_input),`outer normalized input`);let l=E(n.event,`event`),u=E(l.context,`event context`);if(T(l.case_id===n.case_id&&l.revision===n.revision&&l.run_id===n.run_id&&l.recorded_at===n.recorded_at&&k(l.actor),`event identity`),ee(l.rationale),T(N(u.assessment_as_of),`event as-of`),T(u.period_start===null&&u.period_end===null||N(u.period_start)&&N(u.period_end)&&u.period_start<=u.period_end,`event period`),T(u.guarantor_index===null&&u.guarantor_name===null||Number.isSafeInteger(u.guarantor_index)&&Number(u.guarantor_index)>=0&&O(u.guarantor_name),`event guarantor`),n.revision===1)T(l.kind===`creation`&&l.field_path===null&&l.before===null&&l.after===null&&u.basis===`case_creation`&&u.unit===null&&u.period_start===null&&u.guarantor_index===null,`creation event`);else if(T(l.kind===`edit`&&(a(l.before)||D(l.before))&&(a(l.after)||D(l.after))&&!c(l.before,l.after)&&O(l.field_path),`edit event`),R(l.field_path),T([`annual_financials`,`working_capital`,`current_assumptions`].includes(String(u.basis))&&[`USD dollars`,`decimal fraction`,`months`].includes(String(u.unit)),`edit context`),s){let e=te(s.normalized_input,l.field_path);T(e.value===l.after&&I(e.context,u),`server-derived edit context`)}return s&&T(u.assessment_as_of===s.normalized_input.assessment_as_of,`event assumptions date`),z(n.recording),{snapshot:n,etag:t,assessment:s,compatibility:o?null:`Stored assessment definition: ${i.schema_version} / ${i.calculation_version} / ${i.serialization_version}. Original JSON is available; typed display and editing are unavailable.`}}function z(e){let t=E(e,`recording metadata`),n=E(t.packages,`installed packages`);T(O(t.python_version)&&O(t.sqlite_version)&&M(t.dependency_baseline_sha256),`recording versions`);for(let e of[`fastapi`,`pydantic`,`starlette`,`uvicorn`])T(O(n[e])&&n[e].length>0,`installed ${e}`);return T(t.source_status===`development_unverified`?t.source_revision===null:t.source_status===`build_reported`&&O(t.source_revision)&&/^[0-9a-f]{40}$/.test(t.source_revision),`recorded source`),t}let B=[`revenue_change`,`cogs_change`,`operating_expense_change`,`proposed_rate_change_bps`],V=`commercial-scenario-preview-v2`;function H(e,t){T(Object.keys(e).length===t.length&&t.every(t=>Object.prototype.hasOwnProperty.call(e,t)),`scenario fields`)}function U(e,t){T(O(e),`scenario text`);let n=e.replace(/^[\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+|[\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+$/gu,``);return T(n.length>0&&[...n].length<=t,`nonblank scenario text, at most ${t} characters`),n}function W(e,t=!1){let n=E(e,`scenario`),r=E(n.assumptions,`shocks`);T(O(n.scenario_key)&&/^[A-Za-z0-9_-]{1,64}$/.test(n.scenario_key),`scenario key`),H(r,B);for(let e of B)T((a(r[e])||t&&D(r[e]))&&(e===`proposed_rate_change_bps`||s(o(r[e]),`-1`)>=0),`finite explicit shock`);return{scenario_key:n.scenario_key,name:U(n.name,120),rationale:U(n.rationale,2e3),assumptions:r}}function G(e){let t=E(e,`scenario command`),n=[`commercial-scenario-comparison-create-v1`,`commercial-scenario-comparison-create-v2`].includes(String(t.schema_version)),r=String(t.schema_version).endsWith(`-v1`);T(n||t.schema_version===V||t.schema_version===`commercial-scenario-preview-v1`,`scenario command version`),H(t,[`schema_version`,`baseline_run_id`,`scenarios`,...n?[`expected_preview_fingerprint`]:[]]),T(A(t.baseline_run_id)&&String(t.baseline_run_id).toLowerCase()===t.baseline_run_id,`canonical baseline run`),n&&T(M(t.expected_preview_fingerprint),`reviewed preview fingerprint`),T(Array.isArray(t.scenarios)&&t.scenarios.length>=1&&t.scenarios.length<=10,`1–10 scenarios`);let i=/* @__PURE__ */ new Set;for(let e of t.scenarios){H(E(e,`scenario command row`),[`scenario_key`,`name`,`rationale`,`assumptions`]);let t=W(e,r);T(I(t,e)&&!i.has(t.scenario_key),`normalized unique scenario command`),i.add(t.scenario_key)}return t}function K(e){let t=E(e.baseline,`preview baseline`);return T(Array.isArray(e.scenarios),`preview scenarios`),G({schema_version:e.schema_version,baseline_run_id:t.run_id,scenarios:e.scenarios.map(t=>W(t,e.schema_version===`commercial-scenario-preview-v1`))})}function q(e,t){return T(Array.isArray(e),t),e}function J(e){return e===null||a(e)}function Y(e){return A(e)&&e.toLowerCase()===e}function X(e){T((e.schema_version===V&&e.serialization_version===`scenario-preview-json-v2`||e.schema_version===`commercial-scenario-preview-v1`&&e.serialization_version===`scenario-preview-json-v1`)&&e.persisted===!1&&O(e.scenario_definition_version)&&O(e.calculation_version),`preview envelope versions`);let t=E(e.baseline,`baseline evidence`);T(Y(t.case_id)&&Y(t.run_id)&&j(t.revision)&&M(t.input_hash)&&M(t.payload_hash),`baseline evidence identity`);let n=E(t.assessment,`original assessment`),r=E(e.fingerprint,`preview fingerprint`);T(r.algorithm===`sha256`&&M(r.value)&&r.content===`baseline_identity+payload_hash+normalized_command+policy_snapshot+versions`,`preview fingerprint`);let i=E(e.selected_period,`selected operating period`);T(N(i.period_start)&&N(i.period_end)&&i.period_start<=i.period_end&&N(e.assumptions_as_of)&&i.period_end<=e.assumptions_as_of,`preview dates`),T(I(e.selected_period,n.selected_period)&&e.assumptions_as_of===n.assumptions_as_of&&I(e.policy_snapshot,n.policy_snapshot),`baseline period and retained policy`);let a=E(n.normalized_input,`baseline input`);return T(I(e.units,a.units),`baseline units`),T(q(e.held_fixed_assumptions,`held fixed assumptions`).length>0&&e.held_fixed_assumptions.every(O)&&O(e.disclaimer),`preview explanation`),K(e),{b:t,a:n}}function re(e,t,n){let r=E(e,`scenario preview`);F(r,0,100);let{b:i,a}=X(r);T(r.schema_version===V&&r.scenario_definition_version===`commercial-scenario-definition-v2`&&r.calculation_version===`commercial-calculation-v2`,`supported live scenario definition`);let o=w(a);t&&T(i.case_id===t.snapshot.case_id&&i.revision===t.snapshot.revision&&i.run_id===t.snapshot.run_id&&i.input_hash===t.snapshot.input_hash&&i.payload_hash===t.snapshot.payload_hash&&I(o,t.snapshot.assessment),`selected original baseline`),n&&T(I(K(r),G(n)),`reviewed normalized command`);for(let e of r.scenarios)ie(e,r,o);return r}function ie(e,t,n){let r=E(e,`scenario result`),i=W(r);T(I({scenario_key:r.scenario_key,name:r.name,rationale:r.rationale,assumptions:r.assumptions},i)&&r.coverage_basis===`stressed_latest_period_current_pro_forma`,`normalized projection command/basis`);let o=E(r.projection_inputs,`projected inputs`),s=n.normalized_input;S({...s,years:[...s.years.slice(0,-1),o.operating],proposed_loan:o.proposed_loan,existing_debt:o.existing_debt,guarantors:o.guarantors,working_capital:o.working_capital});for(let e of[`existing_debt`,`guarantors`,`working_capital`])T(I(o[e],s[e]),`held-fixed projected inputs`);let c=E(o.operating,`projected operating`),d=E(o.proposed_loan,`projected loan`),f=s.years[s.years.length-1];for(let e of l)[`gross_receipts`,`cogs`,`operating_expense_excl_dna_interest_comp`].includes(e)||T(c[e]===f[e],`held-fixed financial lines`);T(c.period_start===f.period_start&&c.period_end===f.period_end,`projected period`);for(let e of Object.keys(s.proposed_loan))e!==`annual_rate`&&T(d[e]===s.proposed_loan[e],`held-fixed loan`);let p=E(r.current_facts,`projected facts`),m=[];for(let e of u){let t=C(p[e]),r=e===`k1_history`||e===`k1_ratio_difference`,i=r?`baseline.`+n.current_facts[e].fact_id:[`ordinary_business_income`,`ebitda`].includes(e)?`projection.operating.${e}`:`projection.current.${e}`;T(t.fact_id===i&&(r?I(t,{...n.current_facts[e],fact_id:i}):J(t.raw_value)),`projected fact identity/type/observed history`),m.push(t)}let h=q(r.guarantor_contributions,`projected guarantors`);T(h.length===s.guarantors.length,`guarantor count`),h.forEach((e,t)=>{let n=E(e,`guarantor contribution`);T(n.guarantor_index===t&&n.name===s.guarantors[t].name,`guarantor identity`);for(let e of[`business_ebitda`,`outside_income`,`personal_debt`]){let r=C(n[e]);T(r.fact_id===`projection.current.guarantors.${t}.${e}`&&J(r.raw_value),`projected guarantor fact`),m.push(r)}});let g=x(r.decision);T(g.policy_version===n.policy_snapshot.version,`retained decision policy`);let _=q(r.calculation_trace,`projection trace`),v=/* @__PURE__ */ new Map;for(let e of _){let t=E(e,`trace row`),n=C(t);T(O(t.definition_id)&&O(t.expression)&&!v.has(n.fact_id),`trace identity`),v.set(n.fact_id,n),q(t.operands,`trace operands`)}for(let e of n.calculation_trace){let t={...e,fact_id:`baseline.`+e.fact_id,operands:e.operands.map(e=>({...e,reference:e.reference_type===`fact`?`baseline.`+e.reference:e.reference_type===`input`?`/baseline/assessment/normalized_input`+e.reference:e.reference}))};T(I(v.get(t.fact_id),t),`retained observed trace identity`)}for(let e of _)for(let n of E(e,`trace row`).operands){let e=E(n,`operand`);if(T(O(e.reference)&&O(e.unit)&&(e.raw_value===null||D(e.raw_value)||O(e.raw_value)),`operand value`),e.reference_type===`fact`){let t=v.get(e.reference);T(t&&t.raw_value===e.raw_value&&t.unit===e.unit,`referenced scenario fact`)}else{T([`input`,`policy`].includes(String(e.reference_type))&&e.reference.startsWith(`/`),`operand reference`);let n={...r,baseline:t.baseline,policy_snapshot:t.policy_snapshot};for(let t of e.reference.slice(1).split(`/`)){let e=ae(n);T(Object.prototype.hasOwnProperty.call(e,t),`scenario operand path`),n=e[t]}T(n===e.raw_value,`scenario operand value`)}}for(let e of m){let t=v.get(e.fact_id);T(t&&[`fact_id`,`raw_value`,`reported_value`,`unit`,`display_precision`,`status`,`explanation`].every(n=>t[n]===e[n]),`fact/trace fields`)}let y=q(r.comparisons,`metric comparisons`);T(y.length===u.length-1,`comparison count`);let b=/* @__PURE__ */ new Set;for(let e of y){let t=E(e,`metric comparison`);T(O(t.metric)&&u.includes(t.metric)&&t.metric!==`k1_history`&&!b.has(t.metric),`compared metric identity`),b.add(t.metric);let r=n.current_facts[t.metric],i=C(p[t.metric]);T(t.baseline_fact_id===`baseline.`+r.fact_id&&t.projected_fact_id===i.fact_id&&t.baseline_value===r.raw_value&&t.projected_value===i.raw_value&&t.unit===i.unit&&J(t.delta),`comparison fact links`),T(r.raw_value===null||i.raw_value===null?t.delta===null&&O(t.delta_explanation):a(t.delta)&&t.delta_explanation===null,`comparison availability`);let o=g.factors.find(e=>e.name===(t.metric===`uca_cash_flow`?`uca_positive`:t.metric));if([`dscr`,`fccr`,`global_dscr`,`uca_cash_flow`].includes(t.metric)){let e=E(t.policy_headroom,`policy headroom`);T(o&&e.comparison_operator===o.comparison_operator&&e.approval_threshold===o.threshold&&e.decline_threshold===o.decline_threshold,`headroom policy`);for(let t of[`baseline_approval`,`projected_approval`,`baseline_decline`,`projected_decline`])T(J(e[t]),`finite headroom`)}else T(t.policy_headroom===null,`non-policy headroom`)}for(let e of g.factors){let t=e.name===`uca_positive`?`uca_cash_flow`:e.name,r=n.decision.factors.find(t=>t.name===e.name);T(e.raw_value===C(p[t]).raw_value&&r&&[`threshold`,`decline_threshold`,`comparison_operator`,`weight`,`source`].every(t=>e[t]===r[t]),`scenario factor fact and retained policy`),t===`k1_history`&&T(I(e,r),`held-fixed observed K-1 factor`)}let w=q(r.factor_changes,`factor changes`);T(w.length===g.factors.length,`factor change count`);let k=/* @__PURE__ */ new Set;for(let e of w){let t=E(e,`factor change`),r=n.decision.factors.find(e=>e.name===t.name),i=g.factors.find(e=>e.name===t.name);T(O(t.name)&&!k.has(t.name)&&r&&i&&I(t.baseline,r)&&I(t.projected,i)&&t.changed===!I(r,i)&&t.basis===(t.name===`k1_history`?`observed_history`:`projected_current`),`factor change links`),k.add(t.name),T(t.projected_fact_id===C(p[t.name===`uca_positive`?`uca_cash_flow`:t.name]).fact_id,`factor projected reference`)}let A=E(r.outcome_change,`outcome change`);T(A.baseline===n.decision.outcome&&A.projected===g.outcome&&A.changed===(A.baseline!==A.projected),`outcome change links`);let j=q(r.reason_changes,`reason changes`),M=Array.from(new Set([...n.decision.reasons,...g.reasons].map(e=>e.code))).filter(e=>!I(n.decision.reasons.find(t=>t.code===e)??null,g.reasons.find(t=>t.code===e)??null));T(j.length===M.length,`reason changes count`);let N=/* @__PURE__ */ new Set;for(let e of j){let t=E(e,`reason change`),r=n.decision.reasons.find(e=>e.code===t.code)??null,i=g.reasons.find(e=>e.code===t.code)??null;T(O(t.code)&&M.includes(t.code)&&!N.has(t.code)&&I(t.baseline,r)&&I(t.projected,i)&&t.change===(r===null?`added`:i===null?`removed`:`changed`),`reason change links`),N.add(t.code)}}function ae(e){return T(typeof e==`object`&&!!e,`operand path object`),e}function oe(e,t){let n=E(e,`original comparison`);F(n,0,100),T([`commercial-scenario-comparison-v1`,`commercial-scenario-comparison-v2`].includes(String(n.schema_version))&&n.storage_serialization_version===`scenario-comparison-json-v1`&&n.persisted===!0&&Y(n.comparison_id)&&Y(n.case_id)&&Y(n.baseline_run_id)&&j(n.baseline_revision)&&M(n.payload_hash),`comparison storage identity`),T(P(n.recorded_at)&&/^\\d{4}-\\d\\d-\\d\\dT(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{6}\\+00:00$/.test(n.recorded_at)&&k(n.actor),`comparison recording time/actor`),z(n.recording),T(t===`\"scenario-comparison-json-v1:${n.case_id}:${n.comparison_id}:${n.payload_hash}\"`,`comparison ETag`);let r=E(n.preview,`original preview`),{b:i,a}=X(r);T(i.case_id===n.case_id&&i.revision===n.baseline_revision&&i.run_id===n.baseline_run_id,`inner/outer original baseline`);let o=r.schema_version===V&&r.scenario_definition_version===`commercial-scenario-definition-v2`&&r.calculation_version===`commercial-calculation-v2`&&a.schema_version===`commercial-assessment-v2`&&a.calculation_version===`commercial-calculation-v2`&&a.serialization_version===`assessment-json-v2`;return{record:n,etag:t,preview:o?re(r):null,compatibility:o?null:`Original definition: ${r.scenario_definition_version} / ${r.calculation_version}; baseline ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON remains available; typed projection and new preview are unavailable.`}}function se(e,t){return`spreadline-case-${e.case_id}-r${e.revision}-${e.run_id}${t?`-comparison-${t.comparison_id}`:``}.json`}function Z(e,t){let n=/* @__PURE__ */ new Set;function r(e,i){if(T(i<t,`export source JSON depth`),e===null||typeof e==`string`||typeof e==`boolean`)return e;if(typeof e==`number`)return T(Number.isFinite(e),`export finite number`),e;T(typeof e==`object`&&!!e,`export JSON value`);let a=e;T(!n.has(a),`export JSON cycle`),T(Object.getOwnPropertySymbols(a).length===0,`export JSON symbol keys`);let o=Array.isArray(a);T(o||Object.getPrototypeOf(a)===Object.prototype||Object.getPrototypeOf(a)===null,`export plain JSON object`);let s=Object.getOwnPropertyNames(a).filter(e=>!o||e!==`length`);o&&T(s.length===a.length&&s.every((e,t)=>e===String(t)),`export dense JSON array`),n.add(a);let c=o?[]:Object.create(null);for(let e of s){let t=Object.getOwnPropertyDescriptor(a,e);T(t.enumerable&&`value`in t,`export plain JSON property`),c[e]=r(t.value,i+1)}return n.delete(a),Object.freeze(c)}return r(e,0)}function ce(e,t){let n=e.snapshot,r=t.record,i=E(r.preview.baseline,`export comparison baseline`);T(r.case_id===n.case_id&&r.baseline_revision===n.revision&&r.baseline_run_id===n.run_id&&i.case_id===n.case_id&&i.revision===n.revision&&i.run_id===n.run_id&&i.input_hash===n.input_hash&&i.payload_hash===n.payload_hash&&I(i.assessment,n.assessment),`retained comparison must match the selected original case, revision, run, hashes and full baseline assessment`)}function le(e,t){let n=Z(e.snapshot,64),r=ne(n,e.etag),i=t===null?null:oe(Z(t.record,100),t.etag);i&&ce(r,i);let a=se(n,i?.record??null);return{package:Object.freeze({schema_version:`spreadline-review-package-v1`,serialization_version:`review-package-json-v1`,scope:`saved_case_revision`,case:Object.freeze({etag:r.etag,snapshot:n}),comparison:i?Object.freeze({etag:i.etag,record:i.record}):null,provenance:Object.freeze({representation:`browser_parsed_json`,actor_status:`prototype_unverified`,integrity_status:`recorded_hashes_not_verified_by_export`}),disclaimer:`Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.`}),filename:a,view:r,comparison:i}}function*Q(e){yield`\"`;for(let t=0;t<e.length;){let n=Math.min(t+4096,e.length);n<e.length&&e.charCodeAt(n-1)>=55296&&e.charCodeAt(n-1)<=56319&&e.charCodeAt(n)>=56320&&e.charCodeAt(n)<=57343&&n--,yield JSON.stringify(e.slice(t,n)).slice(1,-1),t=n}yield`\"`}function*$(e,t=0,n=/* @__PURE__ */ new Set){if(T(t<104,`export envelope JSON depth`),typeof e==`string`){yield*Q(e);return}if(e===null||typeof e==`boolean`){yield String(e);return}if(typeof e==`number`){T(Number.isFinite(e),`export finite number`),yield JSON.stringify(e);return}T(typeof e==`object`&&!!e,`export JSON value`);let r=e,i=Array.isArray(r);T(!n.has(r),`export JSON cycle`),T(Object.getOwnPropertySymbols(r).length===0&&(i||Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null),`export plain JSON object`);let a=Object.getOwnPropertyNames(r).filter(e=>!i||e!==`length`);i?T(a.length===r.length&&a.every((e,t)=>e===String(t)),`export dense JSON array`):a.sort(),n.add(r),yield i?`[`:`{`;for(let e=0;e<a.length;e++){let o=a[e],s=Object.getOwnPropertyDescriptor(r,o);T(s.enumerable&&`value`in s,`export plain JSON property`),yield`${e?`,`:``}\\n${`  `.repeat(t+1)}`,i||(yield*Q(o),yield`: `),yield*$(s.value,t+1,n)}a.length&&(yield`\\n${`  `.repeat(t)}`),yield i?`]`:`}`,n.delete(r)}async function ue(e,t){let n=new TextEncoder,r=[],i=0,a=``,o=0;function s(){if(t?.aborted)throw Error(`Export preparation cancelled.`)}function c(){s();let e=n.encode(a);if(i+e.byteLength>16777216)throw Error(`The complete review package exceeds 16 MiB. No file was prepared. Choose a case-only package explicitly, or a smaller original.`);i+=e.byteLength,o+=e.byteLength,r.push(e),a=``}s();for(let t of $(e))a+=t,a.length>=8192&&c(),o>=131072&&(await new Promise(e=>setTimeout(e,0)),o=0,s());return a+=`\n`,c(),s(),{chunks:r,size:i}}self.onmessage=async e=>{try{let t=le(e.data.view,e.data.comparison),{chunks:n,size:r}=await ue(t.package),i=n.map(e=>e.buffer);self.postMessage({filename:t.filename,buffers:i,size:r},{transfer:i})}catch(e){self.postMessage({error:e instanceof Error?e.message:`Unable to prepare the original review package.`})}}})();", cr = typeof self < "u" && self.Blob && new Blob(["(self.URL || self.webkitURL).revokeObjectURL(self.location.href);", sr], { type: "text/javascript;charset=utf-8" });
function lr(e) {
	let t;
	try {
		if (t = cr && (self.URL || self.webkitURL).createObjectURL(cr), !t) throw "";
		let n = new Worker(t, { name: e?.name });
		return n.addEventListener("error", () => {
			(self.URL || self.webkitURL).revokeObjectURL(t);
		}), n;
	} catch {
		return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(sr), { name: e?.name });
	}
}
//#endregion
//#region src/useReviewDownload.ts
function ur(e) {
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
		let l, u = ar(a.snapshot, c?.record ?? null);
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
				worker: new lr()
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
function dr(e) {
	return typeof e == "string" ? e.length > 240 ? `${e.slice(0, 240)}…` : e : "Unavailable";
}
function fr({ view: e, selection: t, headRevision: n, sourceScope: r, original: i, pending: a, onOpenBaseline: o }) {
	let s = i.loading || i.error ? null : i.view, l = `${r}:${e?.etag ?? ""}:${i.context}:${i.loading}:${s?.etag ?? ""}:${i.error}`, [u, d] = (0, c.useState)({
		source: l,
		included: !1
	}), f = u.source === l && u.included, p = ur(`${l}:${f}`), m = !1;
	if (e && s) try {
		or(e, s), m = !0;
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
						/* @__PURE__ */ (0, V.jsx)("h3", { children: dr(g.normalized_input.borrower_name) }),
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
									dr(g.assessment.schema_version),
									" / ",
									dr(g.assessment.calculation_version),
									" / ",
									dr(g.assessment.serialization_version)
								] })] }),
								/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("dt", { children: "Recording" }), /* @__PURE__ */ (0, V.jsxs)("dd", { children: ["Actor: prototype demo, unverified · ", g.recording.source_status === "build_reported" ? "build revision reported, unverified" : "development build, unverified"] })] })
							]
						}),
						h ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
							/* @__PURE__ */ (0, V.jsxs)("p", { children: [
								"Operating period: ",
								h.selected_period.period_start,
								" – ",
								h.selected_period.period_end,
								" · assumptions as of ",
								h.assumptions_as_of,
								" · USD dollars."
							] }),
							/* @__PURE__ */ (0, V.jsxs)("p", { children: [
								"Original outcome: ",
								/* @__PURE__ */ (0, V.jsx)("strong", { children: h.decision.outcome.toUpperCase() }),
								" · policy ",
								dr(h.policy_snapshot.version),
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
									/* @__PURE__ */ (0, V.jsx)("strong", { children: it(t) }),
									t.explanation && /* @__PURE__ */ (0, V.jsx)("small", { children: dr(t.explanation) })
								] }, e))
							}),
							/* @__PURE__ */ (0, V.jsxs)("p", { children: [
								"Recorded reasons: ",
								h.decision.reasons.length,
								". Inspect factors and calculations in the existing Details and Memo views."
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
						/* @__PURE__ */ (0, V.jsx)("ul", { children: (s?.preview?.scenarios ?? _.preview.scenarios).map((e, t) => /* @__PURE__ */ (0, V.jsx)("li", { children: dr(e.name) }, t)) }),
						/* @__PURE__ */ (0, V.jsxs)("p", {
							className: "reviewHash",
							children: ["Preview fingerprint: ", dr(_.preview.fingerprint?.value)]
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
					] }) : /* @__PURE__ */ (0, V.jsx)("p", { children: "Open a retained original in Scenarios to include its full batch. A live preview or pending save is excluded." }),
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
						children: p.busy && g ? `Preparing ${ar(g, f ? _ ?? null : null)}…` : p.file ? `Prepared ${p.file.filename} (${p.file.size.toLocaleString("en-US")} bytes). The browser handles saving.` : "Maximum complete file: 16 MiB. No evidence is truncated."
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
						children: ir
					})
				]
			})
		]
	});
}
//#endregion
//#region src/ThemeRoot.tsx
var pr = "spreadline.theme.v1";
function mr() {
	try {
		return yt()?.getItem(pr) === "dark" ? "dark" : "light";
	} catch {
		return "light";
	}
}
function hr(e) {
	try {
		yt()?.setItem(pr, e);
	} catch {}
}
var gr = (0, c.createContext)(null);
function _r({ children: e }) {
	let [t, n] = (0, c.useState)(mr);
	(0, c.useLayoutEffect)(() => {
		mt() || (document.documentElement.dataset.theme = t);
	}, [t]);
	function r(e) {
		hr(e), n(e);
	}
	return /* @__PURE__ */ (0, V.jsx)(gr.Provider, {
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
function vr() {
	let e = (0, c.useContext)(gr);
	if (!e) throw Error("useTheme must be used inside ThemeRoot");
	return e;
}
//#endregion
//#region src/views/WorkspaceHeader.tsx
function yr() {
	let { theme: e, setTheme: t } = vr();
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
				children: ["COMMERCIAL UNDERWRITING ", /* @__PURE__ */ (0, V.jsx)("span", { children: "USD" })]
			}),
			/* @__PURE__ */ (0, V.jsx)("button", {
				className: "themeToggle",
				"aria-pressed": e === "dark",
				onClick: () => t(e === "dark" ? "light" : "dark"),
				children: "Dark theme"
			})
		]
	});
}
function br({ view: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("header", { children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [
		/* @__PURE__ */ (0, V.jsx)("div", {
			className: "eyebrow",
			children: "SPREADLINE / CREDIT WORKSPACE"
		}),
		/* @__PURE__ */ (0, V.jsx)("h1", { children: e.title }),
		/* @__PURE__ */ (0, V.jsx)("p", { children: e.subtitle })
	] }), /* @__PURE__ */ (0, V.jsx)(xr, { view: e })] });
}
function xr({ view: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "decision",
		"data-outcome": e.decision?.outcome ?? "unavailable",
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, V.jsx)("span", { children: "Illustrative decision" }),
			/* @__PURE__ */ (0, V.jsx)("strong", { children: e.decisionWord }),
			/* @__PURE__ */ (0, V.jsx)("small", { children: e.decisionNote })
		]
	});
}
//#endregion
//#region src/views/PrototypeNotice.tsx
function Sr() {
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "warning environmentWarning",
		children: [/* @__PURE__ */ (0, V.jsx)("span", { children: "Prototype use" }), /* @__PURE__ */ (0, V.jsx)("p", { children: ir })]
	});
}
//#endregion
//#region src/views/Toolbar.tsx
function Cr({ filename: e, legacy: t, showCases: n, canSave: r, onDemo: i, onToggleCases: a, onSave: o, onUpload: s }) {
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "uploadbar",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "actions",
				children: [
					/* @__PURE__ */ (0, V.jsx)("button", {
						onClick: () => i("dated"),
						children: "Dated Alpine demo"
					}),
					/* @__PURE__ */ (0, V.jsx)("button", {
						onClick: () => i("legacy"),
						children: "Legacy Alpine demo"
					}),
					/* @__PURE__ */ (0, V.jsx)("button", {
						"data-focus-fallback": !0,
						"aria-expanded": n,
						onClick: a,
						children: "Saved cases"
					}),
					/* @__PURE__ */ (0, V.jsx)("button", {
						className: "primary",
						disabled: !r,
						onClick: (e) => o(e.currentTarget),
						children: "Save case"
					})
				]
			}),
			/* @__PURE__ */ (0, V.jsxs)("label", { children: [
				"Import synthetic JSON",
				" ",
				/* @__PURE__ */ (0, V.jsx)("input", {
					type: "file",
					accept: ".json,application/json",
					onChange: (e) => {
						s(e.target.files?.[0]), e.target.value = "";
					}
				})
			] }),
			/* @__PURE__ */ (0, V.jsxs)("span", { children: [e, " · synthetic only"] }),
			t && /* @__PURE__ */ (0, V.jsx)("span", { children: "Saving requires a separately imported dated assessment with explicit dates and units." })
		]
	});
}
//#endregion
//#region src/views/WorkspaceStatus.tsx
function wr({ state: e, view: t, onSubmit: n, onOpen: r }) {
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
function Tr({ view: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel compatibility",
		children: [
			/* @__PURE__ */ (0, V.jsx)("h2", { children: "Original stored assessment" }),
			/* @__PURE__ */ (0, V.jsx)("p", { children: e.compatibility }),
			/* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify(e.snapshot, null, 2) })
		]
	});
}
function Er({ assessment: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "context",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("span", { children: [
				"Assessment as of: ",
				e.assumptions_as_of,
				" · USD · dollars · nominal annual rate"
			] }),
			/* @__PURE__ */ (0, V.jsxs)("span", { children: ["Coverage period: ", Vn(e.selected_period, 0)] }),
			/* @__PURE__ */ (0, V.jsx)("span", { children: "Current pro forma coverage · fixed rate · fully amortizing · monthly payments" })
		]
	});
}
//#endregion
//#region src/views/ViewTabs.tsx
var Dr = [
	"spread",
	"assumptions",
	"details",
	"memo",
	"history",
	"scenarios",
	"review"
];
function Or({ tab: e, onSelect: t }) {
	return /* @__PURE__ */ (0, V.jsx)("nav", {
		className: "workspaceNav",
		"aria-label": "Workspace views",
		children: Dr.map((n) => /* @__PURE__ */ (0, V.jsx)("button", {
			className: e === n ? "active" : "",
			"aria-pressed": e === n,
			"aria-current": e === n ? "page" : void 0,
			onClick: () => t(n),
			children: n === "scenarios" ? "Scenarios" : n === "review" ? "Review" : n
		}, n))
	});
}
//#endregion
//#region src/views/EditButton.tsx
function kr({ field: e, canEdit: t, onEdit: n, label: r, children: i }) {
	return /* @__PURE__ */ (0, V.jsx)("button", {
		className: "rowEdit",
		"aria-label": r,
		disabled: !t,
		onClick: (t) => n(e, t.currentTarget),
		children: i
	});
}
//#endregion
//#region src/views/SpreadView.tsx
function Ar({ ready: e, canEdit: t, input: n, legacy: r, assessment: i, decision: a, index: o, onSelectPeriod: s, onEdit: c }) {
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "grid",
		children: [/* @__PURE__ */ (0, V.jsxs)("div", {
			className: "panel wide",
			children: [
				/* @__PURE__ */ (0, V.jsxs)("div", {
					className: "panelTitle",
					children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Annual financial spread" }), /* @__PURE__ */ (0, V.jsx)("span", { children: e ? t ? "Select a supplied input to edit · derived rows are read-only" : "Original accepted inputs · editing unavailable for this selection" : "Previous accepted inputs · editing unavailable" })]
				}),
				n ? /* @__PURE__ */ (0, V.jsx)("div", {
					className: "tableScroll",
					children: /* @__PURE__ */ (0, V.jsxs)("table", { children: [/* @__PURE__ */ (0, V.jsx)("thead", { children: /* @__PURE__ */ (0, V.jsxs)("tr", { children: [/* @__PURE__ */ (0, V.jsx)("th", { children: "Line item · USD" }), n.years.map((e, t) => /* @__PURE__ */ (0, V.jsx)("th", { children: /* @__PURE__ */ (0, V.jsx)("button", {
						"aria-pressed": o === t,
						className: o === t ? "period active" : "period",
						onClick: () => s(t),
						children: Vn(e, t)
					}) }, t))] }) }), /* @__PURE__ */ (0, V.jsxs)("tbody", { children: [fe.map((e) => /* @__PURE__ */ (0, V.jsxs)("tr", { children: [/* @__PURE__ */ (0, V.jsx)("th", {
						scope: "row",
						children: In[e]
					}), n.years.map((r, a) => /* @__PURE__ */ (0, V.jsx)("td", {
						className: "num",
						children: /* @__PURE__ */ (0, V.jsx)(kr, {
							field: Wn(n, a, e),
							canEdit: t,
							onEdit: c,
							label: `Edit ${In[e]} for ${Vn(r, a)}`,
							children: `$${A(i?.historical_spread[a].reported_financials[e] ?? r[e])}`
						})
					}, a))] }, e)), i && Bn.map((e) => /* @__PURE__ */ (0, V.jsxs)("tr", {
						className: "derived",
						"data-fact": e,
						children: [/* @__PURE__ */ (0, V.jsxs)("th", {
							scope: "row",
							children: [
								In[e] ?? "K-1 distribution ratio",
								" ",
								/* @__PURE__ */ (0, V.jsx)("small", { children: "Calculated" })
							]
						}), i.historical_spread.map((t, n) => /* @__PURE__ */ (0, V.jsx)("td", {
							className: "num",
							children: it(t[e])
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
		}), /* @__PURE__ */ (0, V.jsx)(jr, { decision: a })]
	});
}
function jr({ decision: e }) {
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "panel",
		children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Current coverage" }), e ? e.factors.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "metric",
			"data-state": e.passed === null ? "review" : e.passed ? "pass" : "fail",
			children: [
				/* @__PURE__ */ (0, V.jsx)("span", { children: In[e.name] ?? e.name }),
				/* @__PURE__ */ (0, V.jsx)("strong", { children: ae(e) }),
				/* @__PURE__ */ (0, V.jsxs)("small", { children: [
					e.name === "uca_positive" ? `Must exceed $${A(String(e.threshold))}` : `Policy: ${e.comparison_operator ?? "comparison unavailable"} ${String(e.threshold)}`,
					" ",
					"·",
					" ",
					e.passed === null ? "Review required" : e.passed ? "Pass" : "Below policy",
					e.decline_threshold !== null && ` · decline below ${e.decline_threshold}x`
				] })
			]
		}, e.name)) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No current results. Resolve the selected input and retry." })]
	});
}
//#endregion
//#region src/views/AssumptionsView.tsx
function Mr({ ready: e, accepted: t, canEdit: n, onEdit: r }) {
	return /* @__PURE__ */ (0, V.jsxs)("section", { children: [/* @__PURE__ */ (0, V.jsx)("p", { children: e ? "Annual assumptions used by the backend. Select an amount to propose an edit." : "Previous accepted assumptions; no active recommendation." }), t && /* @__PURE__ */ (0, V.jsx)(Nr, {
		input: t.input,
		mode: t.mode,
		canEdit: n,
		onEdit: r
	})] });
}
function Nr({ input: e, mode: t, canEdit: n, onEdit: r }) {
	function i(i, a, o, s) {
		return /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "panel",
			children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: i }), Object.entries(o).map(([i, o]) => {
				let c = Gn(e, t, a, i, o, s);
				return /* @__PURE__ */ (0, V.jsxs)("div", {
					className: "assumption",
					children: [/* @__PURE__ */ (0, V.jsx)(kr, {
						field: c,
						canEdit: n,
						onEdit: r,
						children: c.label
					}), /* @__PURE__ */ (0, V.jsx)("strong", { children: c.unit === "%" ? `${A(y(String(o), 2))}%` : c.unit === "months" ? `${o} months` : `$${A(String(o))}` })]
				}, i);
			})]
		}, a);
	}
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "assumptionsGrid",
		children: [
			i("Existing debt", "/existing_debt", e.existing_debt),
			i("Proposed fixed monthly loan", "/proposed_loan", {
				amount: e.proposed_loan.amount,
				annual_rate: e.proposed_loan.annual_rate,
				term_months: e.proposed_loan.term_months
			}),
			i("Working capital", "/working_capital", {
				ar_increase: e.working_capital.ar_increase,
				inventory_increase: e.working_capital.inventory_increase,
				ap_increase: e.working_capital.ap_increase,
				cash_taxes_paid: e.working_capital.cash_taxes_paid
			}, Un(e)),
			e.guarantors.map((e, t) => i(e.name, `/guarantors/${t}`, {
				ownership_percentage: e.ownership_percentage,
				wages: e.wages,
				interest_dividend_income: e.interest_dividend_income,
				mortgage_pi_annual: e.mortgage_pi_annual,
				auto_loan_annual: e.auto_loan_annual,
				credit_card_min_annual: e.credit_card_min_annual
			})),
			e.guarantors.length === 0 && /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "panel",
				children: [/* @__PURE__ */ (0, V.jsx)("h2", { children: "Business-only fallback" }), /* @__PURE__ */ (0, V.jsx)("p", { children: "No guarantors supplied. The backend uses full business EBITDA for global coverage." })]
			})
		]
	});
}
//#endregion
//#region src/views/DetailsView.tsx
function Pr({ ready: e, saved: t, input: n, assessment: r, decision: i, index: a }) {
	return /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel",
		children: [
			/* @__PURE__ */ (0, V.jsx)("h2", { children: "Calculation and policy details" }),
			e && t && /* @__PURE__ */ (0, V.jsx)(gn, { view: t.view }),
			r ? /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"Policy version:",
					" ",
					/* @__PURE__ */ (0, V.jsx)("strong", { children: r.policy_snapshot.version })
				] }),
				/* @__PURE__ */ (0, V.jsxs)("p", { children: [
					"K-1 comparison periods:",
					" ",
					r.k1_history_periods.map((e, t) => Vn(e, t)).join(" / ")
				] }),
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "Current facts" }),
				Object.values(r.current_facts).map((e) => /* @__PURE__ */ (0, V.jsx)(Fr, {
					metric: e,
					assessment: r
				}, e.fact_id)),
				/* @__PURE__ */ (0, V.jsxs)("h3", { children: [
					"Selected historical period:",
					" ",
					Vn(n.years[a], a)
				] }),
				Bn.map((e) => /* @__PURE__ */ (0, V.jsx)(Fr, {
					metric: r.historical_spread[a][e],
					assessment: r
				}, e)),
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "Guarantor contributions" }),
				r.guarantor_contributions.length ? r.guarantor_contributions.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h4", { children: e.name }), [
					e.business_ebitda,
					e.outside_income,
					e.personal_debt
				].map((e) => /* @__PURE__ */ (0, V.jsx)(Fr, {
					metric: e,
					assessment: r
				}, e.fact_id))] }, e.guarantor_index)) : /* @__PURE__ */ (0, V.jsx)("p", { children: "Business-only fallback; no guarantor contributions." }),
				/* @__PURE__ */ (0, V.jsxs)("details", { children: [/* @__PURE__ */ (0, V.jsx)("summary", { children: "Complete policy snapshot" }), /* @__PURE__ */ (0, V.jsx)("pre", { children: JSON.stringify(r.policy_snapshot, null, 2) })] }),
				/* @__PURE__ */ (0, V.jsxs)("p", {
					className: "fine",
					children: [
						"Calculation: ",
						r.calculation_version,
						" · serialization:",
						" ",
						r.serialization_version,
						/* @__PURE__ */ (0, V.jsx)("br", {}),
						"Content fingerprint (not document authentication):",
						" ",
						/* @__PURE__ */ (0, V.jsx)("code", { children: r.fingerprint.value })
					]
				})
			] }) : /* @__PURE__ */ (0, V.jsx)("p", { children: e ? "Legacy mode has decision factors but no dated spread or trace." : "No current assessment is available." }),
			i && /* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h3", { children: "Raw policy comparisons" }), i.factors.map((e) => /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "operand",
				children: [
					/* @__PURE__ */ (0, V.jsx)("strong", { children: In[e.name] }),
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
function Fr({ metric: e, assessment: t }) {
	let n = t.calculation_trace.find((t) => t.fact_id === e.fact_id);
	return n ? /* @__PURE__ */ (0, V.jsxs)("details", { children: [
		/* @__PURE__ */ (0, V.jsxs)("summary", { children: [
			e.fact_id,
			" · ",
			it(e)
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
				/* @__PURE__ */ (0, V.jsxs)("small", { children: [e.reference_type, e.reported_value !== null && ` · Reported component: ${C(String(e.reported_value), 2)} ${e.unit}`] })
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
function Ir({ decision: e }) {
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
					In[e.name],
					": ",
					ae(e),
					" —",
					" ",
					e.passed === null ? "manual review required" : e.passed ? "meets configured policy" : "does not meet configured policy"
				] }, e.name)) }),
				/* @__PURE__ */ (0, V.jsx)("h3", { children: "Recorded reasons" }),
				e.reasons.length ? /* @__PURE__ */ (0, V.jsx)("ul", { children: e.reasons.map((e, t) => /* @__PURE__ */ (0, V.jsx)("li", { children: e.message }, t)) }) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No additional reasons returned." })
			] }) : /* @__PURE__ */ (0, V.jsx)("p", { children: "No current decision is available." }),
			/* @__PURE__ */ (0, V.jsx)("p", {
				className: "fine",
				children: ir
			})
		]
	});
}
//#endregion
//#region src/views/HistoryView.tsx
function Lr({ saved: e, ready: t, history: n, input: r, onOpen: i }) {
	return e ? /* @__PURE__ */ (0, V.jsx)(_n, {
		saved: e,
		active: t,
		onOpen: i
	}) : /* @__PURE__ */ (0, V.jsxs)("section", {
		className: "panel memo",
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
var Rr = {
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
}, zr = {
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
}, Br = class {
	storage;
	transport;
	state;
	listeners = /* @__PURE__ */ new Set();
	request = null;
	constructor(e, t = fetch) {
		this.storage = e, this.transport = t;
		let n = Zt(e);
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
		let t = Ut(e);
		if (this.state.operation && !B(this.state.operation, t)) throw Error("The pending operation cannot be replaced.");
		try {
			Xt(this.storage, t);
		} catch (e) {
			let t = Zt(this.storage);
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
			Qt(this.storage, e.id), this.update({
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
				...await Dn(e, t.signal, this.transport)
			} : {
				kind: "case",
				...await cn(e, t.signal, this.transport)
			};
			if (t.signal.aborted) throw new nn("The view closed before acknowledgment. Keep the original operation for exact retry.");
			return this.clear(e), n;
		} catch (t) {
			let n = rn(t);
			throw this.update({ writeError: n }), n.certain && this.clear(e), n;
		} finally {
			this.request === t && (this.request = null, this.update({ inFlight: !1 }));
		}
	}
	discard() {
		if (this.request) throw Error("Wait for the current response before discarding tracking.");
		$t(this.storage), this.update({
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
function Vr() {
	let [e] = (0, c.useState)(() => new Br(Gt())), t = (0, c.useSyncExternalStore)(e.subscribe, e.snapshot);
	return (0, c.useEffect)(() => () => e.abort(), [e]), {
		...t,
		controller: e
	};
}
//#endregion
//#region src/useAnalystWorkspace.ts
function Hr() {
	let [e, t] = (0, c.useReducer)(j, se), n = (0, c.useRef)(e);
	n.current = e;
	let r = (0, c.useRef)(0), i = (0, c.useRef)(null), a = (0, c.useRef)(null), o = (0, c.useRef)(null), s = (0, c.useRef)(!1), l = Vr(), { operation: u, recoveryError: d, inFlight: f, writeError: p } = l, [m, h] = (0, c.useState)(null), [g, _] = (0, c.useState)(null), v = (0, c.useRef)(0), [y, b] = (0, c.useState)(""), [x, S] = (0, c.useState)(null), [C, w] = (0, c.useState)(null), [T, E] = (0, c.useState)(null), D = (0, c.useRef)(T);
	D.current = T;
	function O(e, n, o = "evaluate") {
		let s = ++r.current;
		return i.current?.abort(), a.current?.abort(), i.current = null, a.current = null, t({
			type: "start",
			id: s,
			filename: e,
			draft: n,
			action: o
		}), s;
	}
	async function ee(e, n = O(e.filename, e)) {
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
			let i = await xt(e, a.signal);
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
		tn(Gt(), null), ee({
			mode: e,
			payload: e === "dated" ? zr : Ce(Rr),
			filename: e === "dated" ? "alpine_dated_v2.json" : "alpine.json",
			resetHistory: !0
		});
	}
	async function ne(e) {
		if (!e) return;
		tn(Gt(), null);
		let n = O(e.name, null);
		try {
			if (e.size > 1e6) throw Error("Use a JSON file no larger than 1,000,000 bytes.");
			let t = await e.text();
			if (n !== r.current) return;
			let i = ie(t);
			await ee({
				mode: xe(i),
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
	async function re(e) {
		let n = O(`Saved case ${e.caseId}`, null, "open"), a = new AbortController();
		i.current = a, tn(Gt(), e);
		try {
			let i = await sn(e.caseId, e.revision, a.signal);
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
				error: rn(e).message
			});
		}
	}
	async function k(e, n) {
		let i = new AbortController();
		a.current = i;
		try {
			let a = await sn(e.snapshot.case_id, "latest", i.signal);
			if (n !== r.current || i.signal.aborted) return;
			if (a.snapshot.revision < e.snapshot.revision || a.snapshot.revision === e.snapshot.revision && (a.etag !== e.etag || a.snapshot.run_id !== e.snapshot.run_id)) throw Error("Latest snapshot disagrees with the acknowledged receipt.");
			t({
				type: "head",
				id: n,
				caseId: e.snapshot.case_id,
				revision: e.snapshot.revision,
				headRevision: a.snapshot.revision
			}), tn(Gt(), {
				caseId: e.snapshot.case_id,
				revision: a.snapshot.revision === e.snapshot.revision ? "latest" : e.snapshot.revision
			});
		} catch (e) {
			n === r.current && !i.signal.aborted && b(`Write accepted. Latest could not be confirmed; this original receipt remains read-only. ${rn(e).message}`);
		}
	}
	async function A(e) {
		o.current?.abort();
		let t = new AbortController();
		o.current = t;
		try {
			let n = await sn(e.caseId, "latest", t.signal);
			if (t.signal.aborted || !s.current) return;
			if (!n.assessment || n.snapshot.revision < e.baseRevision || !B(Le(n.snapshot.normalized_input, e.review.path).context, e.context)) throw Error("The latest field's definition/context cannot be reviewed with this proposal.");
			E((t) => t?.operation.id === e.id ? {
				...t,
				latest: n,
				error: ""
			} : t);
		} catch (n) {
			!t.signal.aborted && s.current && E((t) => t?.operation.id === e.id ? {
				...t,
				latest: null,
				error: rn(n).message
			} : t);
		}
	}
	async function ae(e, n, i, a) {
		b("");
		try {
			let e = await a;
			if (e.kind !== "case") throw Error("Unexpected comparison receipt for case write");
			if (!s.current) return;
			w(null), b(`${e.replayed ? "Recovered the original" : "Saved"} revision ${e.view.snapshot.revision}.`), n === r.current ? (t({
				type: "stored-success",
				id: n,
				view: e.view,
				selection: "receipt",
				resetPeriod: i
			}), tn(Gt(), {
				caseId: e.view.snapshot.case_id,
				revision: e.view.snapshot.revision
			}), k(e.view, n)) : S(e.view);
		} catch (i) {
			if (!s.current) return;
			let a = rn(i);
			a.certain && (a.status === 412 && e.kind === "edit" ? (E({
				operation: e,
				latest: null,
				error: ""
			}), A(e)) : w(e)), n === r.current && t({
				type: "failure",
				id: n,
				error: a.message
			});
		}
	}
	function oe(e, t) {
		if (l.controller.snapshot().inFlight || l.controller.snapshot().operation || d || D.current) throw Error("Resolve this tab's existing saved write or proposal first.");
		let n = l.controller.start(e);
		w(null), S(null), ae(e, O(e.kind === "create" ? "Saving dated case" : `Saved case ${e.caseId}`, null, "write"), t, n);
	}
	function le(e) {
		let t = n.current;
		if (t.status !== "ready" || t.accepted?.mode !== "dated" || t.saved) throw Error("Open an accepted unsaved dated input before saving.");
		oe(Jt(t.accepted.input, e), !0);
	}
	function ue(e = n.current) {
		return e.status === "ready" && !!e.accepted && (!e.saved || !l.controller.snapshot().operation && !d && !D.current && !!e.saved.view.assessment && e.saved.selection === "latest" && e.saved.headRevision === e.saved.view.snapshot.revision);
	}
	function de(e, t) {
		let r = n.current;
		if (!ue(r) || !r.accepted) throw Error("Open a supported latest revision and resolve pending work before editing.");
		r.saved ? oe(Yt(r.saved.view, e, t), !1) : ee({
			mode: r.accepted.mode,
			payload: ce(r.accepted.input, e),
			filename: r.accepted.filename,
			edit: e
		});
	}
	function fe() {
		let e = l.controller.snapshot().operation;
		if (!e || f || p?.status === 409 && !p.certain) return;
		let t = l.controller.retry();
		if (e.kind === "comparison") {
			me(e, r.current, t);
			return;
		}
		ae(e, O(e.kind === "create" ? "Recovering saved case" : `Saved case ${e.caseId}`, null, "write"), e.kind === "create", t);
	}
	function pe() {
		l.controller.discard(), b("Local recovery tracking discarded. This does not undo a write that might already be saved.");
	}
	async function me(e, t, n) {
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
				let n = rn(e);
				_({
					scope: t,
					message: n.message,
					code: n.code
				});
			}
		}
	}
	function M(e) {
		let t = n.current, i = e.baseline;
		if (t.status !== "ready" || !t.saved || D.current || t.saved.view.snapshot.case_id !== i.case_id || t.saved.view.snapshot.revision !== i.revision || t.saved.view.snapshot.run_id !== i.run_id || t.saved.view.snapshot.payload_hash !== i.payload_hash) throw Error("Review the currently selected original baseline before saving.");
		let a = Wt(e), o = l.controller.start(a);
		me(a, r.current, o);
	}
	function N(e) {
		let n = O(`Saved case ${e.snapshot.case_id}`, null, "open");
		t({
			type: "stored-success",
			id: n,
			view: e,
			selection: "latest"
		}), tn(Gt(), {
			caseId: e.snapshot.case_id,
			revision: "latest"
		}), o.current?.abort(), E(null), D.current = null, l.controller.clearError();
	}
	function he() {
		let e = D.current;
		if (!e?.latest) return null;
		let t = JSON.parse(e.operation.body), n = Le(e.latest.snapshot.normalized_input, e.operation.review.path).value;
		return N(e.latest), {
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
		let e = D.current;
		e?.latest ? N(e.latest) : (o.current?.abort(), E(null), D.current = null);
	}
	return (0, c.useEffect)(() => {
		s.current = !0;
		let e = l.controller.snapshot().operation;
		if (e && e.kind !== "comparison") {
			let e = O("Pending saved write", null, "write");
			t({
				type: "failure",
				id: e,
				error: "A saved write needs confirmation. Retry the exact write; no proposal is accepted locally yet."
			});
		} else {
			let t = en(Gt());
			t ? re(t) : e?.kind === "comparison" ? re({
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
		upload: ne,
		demo: te,
		save: le,
		edit: de,
		openSaved: re,
		operation: u,
		comparisonAck: m,
		comparisonError: g,
		retainComparison: M,
		inFlight: f,
		writeError: p,
		recoveryError: d,
		notice: y,
		offer: x,
		rejected: C,
		conflict: T,
		canEdit: ue(e),
		canSave: e.status === "ready" && e.accepted?.mode === "dated" && !e.saved && !u && !d && !T,
		retryWrite: fe,
		discardTracking: pe,
		reviewConflict: he,
		cancelConflict: P,
		refreshConflict: () => {
			D.current && A(D.current.operation);
		},
		dismissRejected: () => w(null),
		dismissOffer: () => S(null),
		dismissComparisonAck: () => h(null),
		clearComparisonError: () => _(null),
		deferComparisonAck: (e) => h((t) => t?.serial === e ? {
			...t,
			scope: null
		} : t)
	};
}
//#endregion
//#region src/App.tsx
function Ur() {
	let e = Hr(), t = Fn(e), { state: n, submit: r, demo: i, upload: a } = e, [o, s] = (0, c.useState)("spread"), [l, f] = (0, c.useState)(1), [p, m] = (0, c.useState)(!1), [h, g] = (0, c.useState)(!1), [_, v] = (0, c.useState)(!1), y = (0, c.useRef)(null), b = d(y, e.edit), x = u(n, !!e.operation), { ready: S, accepted: C, input: w, assessment: T, decision: E } = x, D = w ? Math.min(l, w.years.length - 1) : 0;
	return (0, c.useEffect)(() => {
		n.status === "evaluating" && (b.dismiss(), m(!1)), n.status === "ready" && n.resetPeriod && n.accepted && f(n.accepted.input.years.length - 1), n.status === "ready" && n.saved?.view.compatibility && s("history");
	}, [
		n.id,
		n.status,
		n.accepted,
		n.resetPeriod
	]), /* @__PURE__ */ (0, V.jsxs)("main", {
		className: "analystWorkspace",
		children: [
			/* @__PURE__ */ (0, V.jsx)(yr, {}),
			/* @__PURE__ */ (0, V.jsx)(br, { view: x }),
			/* @__PURE__ */ (0, V.jsx)(Sr, {}),
			/* @__PURE__ */ (0, V.jsx)(Cr, {
				filename: n.filename,
				legacy: C?.mode === "legacy",
				showCases: h,
				canSave: e.canSave,
				onDemo: i,
				onToggleCases: () => g((e) => !e),
				onSave: (e) => {
					y.current = e, m(!0);
				},
				onUpload: (e) => void a(e)
			}),
			h && /* @__PURE__ */ (0, V.jsx)(mn, {
				onOpen: (t) => {
					g(!1), e.openSaved(t);
				},
				onClose: () => {
					g(!1), Ye("[data-focus-fallback]")?.focus();
				}
			}),
			/* @__PURE__ */ (0, V.jsx)(yn, {
				workspace: e,
				onOpenComparison: (t) => {
					let n = t.record;
					Mn(n.case_id, n.comparison_id), e.openSaved({
						caseId: n.case_id,
						revision: n.baseline_revision
					}).then(() => s("scenarios")), e.dismissComparisonAck();
				},
				onDiscard: (e) => {
					y.current = e, v(!0);
				},
				onReview: (t) => {
					let n = e.reviewConflict();
					n && b.review(n.field, n.proposal, t);
				}
			}),
			n.saved && /* @__PURE__ */ (0, V.jsx)(hn, {
				saved: n.saved,
				active: S,
				onOpen: (t) => void e.openSaved(t)
			}),
			/* @__PURE__ */ (0, V.jsx)(wr, {
				state: n,
				view: x,
				onSubmit: (e) => void r(e),
				onOpen: (t) => void e.openSaved(t)
			}),
			S && n.saved?.view.compatibility && o !== "review" && /* @__PURE__ */ (0, V.jsx)(Tr, { view: n.saved.view }),
			T && /* @__PURE__ */ (0, V.jsx)(Er, { assessment: T }),
			T && /* @__PURE__ */ (0, V.jsx)(rt, { assessment: T }),
			/* @__PURE__ */ (0, V.jsx)(Or, {
				tab: o,
				onSelect: s
			}),
			o === "scenarios" && /* @__PURE__ */ (0, V.jsx)(rr, {
				model: t,
				onSaveBaseline: (t) => {
					e.canSave && (y.current = t, m(!0));
				},
				onOpenBaseline: (t) => void e.openSaved(t)
			}),
			o === "review" && /* @__PURE__ */ (0, V.jsx)(fr, {
				view: S ? n.saved?.view ?? null : null,
				selection: n.saved?.selection ?? null,
				headRevision: n.saved?.headRevision ?? null,
				sourceScope: `${n.id}:${n.status}`,
				original: t.original,
				pending: !!(e.operation || e.recoveryError || e.conflict || e.inFlight),
				onOpenBaseline: (t) => void e.openSaved(t)
			}),
			o === "spread" && /* @__PURE__ */ (0, V.jsx)(Ar, {
				ready: S,
				canEdit: e.canEdit,
				input: w,
				legacy: C?.mode === "legacy",
				assessment: T,
				decision: E,
				index: D,
				onSelectPeriod: f,
				onEdit: b.open
			}),
			o === "assumptions" && /* @__PURE__ */ (0, V.jsx)(Mr, {
				ready: S,
				accepted: C,
				canEdit: e.canEdit,
				onEdit: b.open
			}),
			o === "details" && /* @__PURE__ */ (0, V.jsx)(Pr, {
				ready: S,
				saved: n.saved,
				input: w,
				assessment: T,
				decision: E,
				index: D
			}),
			o === "memo" && /* @__PURE__ */ (0, V.jsx)(Ir, { decision: E }),
			o === "history" && /* @__PURE__ */ (0, V.jsx)(Lr, {
				saved: n.saved,
				ready: S,
				history: n.history,
				input: w,
				onOpen: (t) => void e.openSaved(t)
			}),
			b.editing && /* @__PURE__ */ (0, V.jsx)(nt, {
				restoreFocus: y.current,
				field: b.editing,
				saved: !!n.saved,
				proposal: b.proposal,
				onCancel: b.cancel,
				onSubmit: b.submit
			}, `${b.editing.path}:${n.id}`),
			p && C?.mode === "dated" && /* @__PURE__ */ (0, V.jsx)(et, {
				input: C.input,
				restoreFocus: y.current,
				onSave: e.save,
				onCancel: () => m(!1)
			}),
			_ && /* @__PURE__ */ (0, V.jsx)(tt, {
				restoreFocus: y.current,
				onDiscard: e.discardTracking,
				onCancel: () => v(!1)
			}),
			/* @__PURE__ */ (0, V.jsxs)("footer", { children: [
				"Spreadline · Synthetic analyst demonstration ·",
				" ",
				n.saved ? `Saved revisions · recorded credential ${n.saved.view.snapshot.event.actor}` : "Unsaved session workspace"
			] })
		]
	});
}
//#endregion
//#region src/embeddedTransport.ts
var Wr = 16777216, Gr = class {
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
					if (!Number.isInteger(n.status) || n.status < 200 || n.status > 599 || typeof n.body != "string" || new TextEncoder().encode(n.body).length > Wr || !n.headers || typeof n.headers != "object" || Object.values(n.headers).some((e) => typeof e != "string")) throw Error("Unreadable embedded response. Review any pending write before retrying.");
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
}, Kr = ":root,.themeRoot{--fs-12:12px;--fs-13:13px;--fs-14:14px;--fs-16:16px;--fs-20:20px;--fs-24:24px;--fs-28:28px;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:20px;--space-6:24px;--space-7:28px;--space-8:32px;--radius-sm:4px;--radius:8px;--radius-lg:12px;--font-sans:Inter, ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;--font-mono:ui-monospace, \"SF Mono\", Menlo, Consolas, monospace;--lightningcss-light:initial;--lightningcss-dark: ;--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;--canvas:#f3f6f4;--surface:#fff;--raised:#fff;--sunken:#eef3f0;--band:#f3f8f5;--text:#14201b;--muted:#4d5b54;--subtle:#56645d;--border:#d3dcd7;--rule:#e1e8e4;--rule-strong:#9fb0a7;--border-strong:#7b8b83;--control:#fff;--control-hover:#eaf1ed;--control-border:#b4c1ba;--control-text:#14201b;--input-bg:#fff;--input-border:#7b8b83;--disabled-bg:#eef2f0;--disabled-text:#5f6c66;--disabled-border:#d3dcd7;--edit-underline:#8a9c93;--accent:#0d6845;--accent-hover:#0a5538;--on-accent:#fff;--accent-soft:#e5f2ea;--accent-border:#93c4aa;--on-accent-soft:#0d6845;--positive:#0d6845;--positive-soft:#e5f2ea;--positive-border:#93c4aa;--positive-muted:#3b5f4f;--caution:#7f5300;--caution-soft:#fbf1da;--caution-border:#d9b86d;--caution-muted:#6a5326;--negative:#a3301c;--negative-soft:#fbebe6;--negative-border:#df9f90;--negative-muted:#7c4136;--info:#2c5683;--info-soft:#e9f0f7;--info-border:#a7bfd9;--info-muted:#3f5671;--focus:#0d6845;--selection:#cbe6d6;--derived:#eef3f0;--derived-label:#3b5f4f;--ebitda-bg:#e5f2ea;--ebitda-text:#0d6845;--shadow-dialog:0 16px 40px #14201b2e, 0 2px 6px #14201b14;--backdrop:#14201b73}@media screen{:root[data-theme=dark],.themeRoot[data-theme=dark]{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--canvas:#0b0d10;--surface:#101419;--raised:#151b22;--sunken:#12191c;--band:#131a20;--text:#eef1f4;--muted:#b5bfc9;--subtle:#a5b2bd;--border:#303b46;--rule:#29333d;--rule-strong:#4a5a68;--border-strong:#556f82;--control:#18212a;--control-hover:#22313c;--control-border:#40515f;--control-text:#d4dee7;--input-bg:#18212a;--input-border:#556f82;--disabled-bg:#141a20;--disabled-text:#8c98a3;--disabled-border:#29333d;--edit-underline:#586c7c;--accent:#8de0bb;--accent-hover:#a2e8c9;--on-accent:#10291f;--accent-soft:#13241c;--accent-border:#437c63;--on-accent-soft:#c6d8cf;--positive:#8de0bb;--positive-soft:#111d18;--positive-border:#375447;--positive-muted:#a9c4b6;--caution:#e0d5a1;--caution-soft:#1d1b12;--caution-border:#6e6339;--caution-muted:#c9c1a0;--negative:#ffb5a7;--negative-soft:#211716;--negative-border:#69473e;--negative-muted:#d6b2aa;--info:#b5c9df;--info-soft:#15202a;--info-border:#4a6074;--info-muted:#aebccb;--focus:#8de0bb;--selection:#2b5543;--derived:#12191c;--derived-label:#98bdaa;--ebitda-bg:#14221b;--ebitda-text:#bce8d2;--shadow-dialog:0 16px 40px #00000080;--backdrop:#000000b8}}*{box-sizing:border-box}body{background:var(--canvas);color:var(--text);margin:0}.themeRoot{font-family:var(--font-sans);font-synthesis:none;font-variant-numeric:tabular-nums;color:var(--text);background:var(--canvas);accent-color:var(--accent);caret-color:var(--accent);scrollbar-color:var(--border-strong) transparent}.themeRoot ::selection{background:var(--selection);color:var(--text)}main{max-width:1480px;padding:var(--space-7);margin:auto}h1{font-size:var(--fs-28);margin:var(--space-1) 0 var(--space-2);letter-spacing:-.025em;overflow-wrap:anywhere}h2{margin:0 0 var(--space-3);font-size:var(--fs-16)}h3{font-size:var(--fs-14);color:var(--accent);margin-top:var(--space-6)}h4{font-size:var(--fs-14)}p{color:var(--muted);line-height:1.6}small{font-size:var(--fs-12)}a{color:var(--accent);text-underline-offset:3px}code{font-family:var(--font-mono);overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}.eyebrow{font-size:var(--fs-12);letter-spacing:.1em;color:var(--accent);font-weight:500}.fine{border-top:1px solid var(--border);margin-top:var(--space-6);padding-top:var(--space-4);font-size:var(--fs-12);overflow-wrap:anywhere}.accessGate{max-width:620px;padding-top:12vh}.accessGate form{gap:var(--space-3);display:grid}.accessBar{justify-content:flex-end;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-8);border-bottom:1px solid var(--border);color:var(--muted);font-size:var(--fs-12);flex-wrap:wrap;display:flex}.hostingNotice{justify-content:space-between;gap:var(--space-2) var(--space-6);max-width:1480px;padding:var(--space-3) var(--space-7);color:var(--on-accent-soft);background:var(--accent-soft);border-bottom:1px solid var(--accent-border);font-size:var(--fs-12);flex-wrap:wrap;margin:auto;line-height:1.6;display:flex}.hostingNotice>span:first-child{letter-spacing:.08em;font-weight:600}.workspaceBrand{align-items:center;gap:var(--space-2) var(--space-5);padding-bottom:var(--space-5);margin-bottom:var(--space-7);border-bottom:1px solid var(--border);display:flex}.wordmark{align-items:center;gap:var(--space-2);font-size:var(--fs-20);letter-spacing:-.03em;font-weight:650;display:flex}.wordmark svg{color:var(--accent);flex-shrink:0}.workspaceType{align-items:center;gap:var(--space-4);color:var(--muted);font-size:var(--fs-12);letter-spacing:.08em;margin-left:auto;display:flex}.workspaceType>span{border:1px solid var(--border);border-radius:var(--radius-sm);padding:var(--space-1) var(--space-2);letter-spacing:.04em}header{justify-content:space-between;gap:var(--space-7);align-items:center;display:flex}header>div:first-child{flex:1;min-width:0}.decision{border:1px solid var(--positive-border);border-radius:var(--radius);padding:var(--space-4) var(--space-5);background:var(--positive-soft);overflow-wrap:anywhere;width:300px;max-width:100%}.decision span,.decision small{color:var(--positive-muted);display:block}.decision strong{font-size:var(--fs-24);letter-spacing:.01em;color:var(--positive);display:block}.decision span{font-size:var(--fs-12);margin-bottom:var(--space-1)}.decision small{font-size:var(--fs-12);margin-top:var(--space-1);line-height:1.6}.decision[data-outcome=review]{background:var(--caution-soft);border-color:var(--caution-border)}.decision[data-outcome=review] strong{color:var(--caution)}.decision[data-outcome=review] span,.decision[data-outcome=review] small{color:var(--caution-muted)}.decision[data-outcome=decline]{background:var(--negative-soft);border-color:var(--negative-border)}.decision[data-outcome=decline] strong{color:var(--negative)}.decision[data-outcome=decline] span,.decision[data-outcome=decline] small{color:var(--negative-muted)}.decision[data-outcome=unavailable]{background:var(--info-soft);border-color:var(--info-border)}.decision[data-outcome=unavailable] strong{color:var(--info)}.decision[data-outcome=unavailable] span,.decision[data-outcome=unavailable] small{color:var(--info-muted)}.uploadbar{gap:var(--space-3);margin:var(--space-4) 0;padding:var(--space-4);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);font-size:var(--fs-12);color:var(--muted);flex-wrap:wrap;align-items:center;display:flex}.uploadbar>label{padding-left:var(--space-4);border-left:1px solid var(--border);margin-left:auto}.uploadbar>span{color:var(--subtle);font-size:var(--fs-12);flex-basis:100%}.uploadbar input{margin-top:var(--space-2);max-width:100%;display:block}.uploadbar label{max-width:100%}.uploadbar span{overflow-wrap:anywhere}.context{gap:var(--space-2) var(--space-6);font-size:var(--fs-12);color:var(--muted);margin-top:var(--space-4);flex-wrap:wrap;display:flex}.context>span{flex:240px;line-height:1.7}nav{gap:var(--space-2);margin:var(--space-5) 0;flex-wrap:wrap;display:flex}nav button{text-transform:capitalize}.workspaceNav{gap:var(--space-6);border-bottom:1px solid var(--border);margin:var(--space-6) 0}.workspaceNav button{padding:var(--space-3) 0;color:var(--muted);font-size:var(--fs-13);background:0 0;border:0;border-bottom:2px solid #0000;border-radius:0}.workspaceNav button:hover{color:var(--text);background:0 0}.workspaceNav button.active{color:var(--accent);border-bottom-color:var(--accent)}footer{padding-top:var(--space-6);color:var(--subtle);font-size:var(--fs-12)}.actions{gap:var(--space-2);flex-wrap:wrap;display:flex}button{font:inherit;background:var(--control);border:1px solid var(--control-border);color:var(--control-text);padding:var(--space-2) var(--space-4);border-radius:var(--radius);cursor:pointer;transition:background-color .12s ease-out,border-color .12s ease-out,color .12s ease-out}button:hover{background:var(--control-hover)}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible{outline:2px solid var(--focus);outline-offset:3px}button:disabled{background:var(--disabled-bg);border-color:var(--disabled-border);color:var(--disabled-text);cursor:not-allowed}.primary{background:var(--accent);color:var(--on-accent);border-color:var(--accent);font-weight:600}.primary:hover{color:var(--on-accent);background:var(--accent-hover);border-color:var(--accent-hover)}.primary:disabled{color:var(--disabled-text);background:var(--disabled-bg);border-color:var(--disabled-border)}.active{color:var(--accent);border-color:var(--accent)}.themeToggle{align-items:center;gap:var(--space-2);padding:var(--space-1) var(--space-3);font-size:var(--fs-12);display:inline-flex}.themeToggle:before{content:\"\";border:2px solid;border-radius:50%;width:10px;height:10px}.themeToggle[aria-pressed=true]{color:var(--accent);border-color:var(--accent)}.themeToggle[aria-pressed=true]:before{background:currentColor}.uploadbar input::file-selector-button{font:inherit;color:var(--control-text);background:var(--control);padding:var(--space-2) var(--space-3);border:1px solid var(--control-border);border-radius:var(--radius-sm);cursor:pointer;margin-right:var(--space-2)}.accessGate input,dialog input,dialog textarea,.scenarioFields input,.scenarioFields textarea,.scenarioFields select,.scenarioSelect select{width:100%;min-width:0;padding:var(--space-2) var(--space-3);color:var(--text);background:var(--input-bg);border:1px solid var(--input-border);border-radius:var(--radius);font:inherit;display:block}.accessGate input{padding:var(--space-3)}.warning{margin:var(--space-5) 0 var(--space-4);padding:var(--space-3) var(--space-4);border:1px solid var(--caution-border);background:var(--caution-soft);color:var(--caution);border-radius:var(--radius);font-size:var(--fs-13);overflow-wrap:anywhere}.environmentWarning{align-items:baseline;gap:var(--space-3);background:var(--sunken);border-color:var(--border);display:flex}.environmentWarning>span{font-size:var(--fs-12);color:var(--caution);white-space:nowrap;font-weight:600}.environmentWarning p{color:var(--muted);font-size:var(--fs-12);margin:0;line-height:1.7}.pending{padding:var(--space-4);border:1px solid var(--info-border);border-radius:var(--radius);margin:var(--space-4) 0;background:var(--info-soft);overflow-wrap:anywhere}.pending p{font-size:var(--fs-13);color:var(--info-muted);margin-bottom:0}.writeNotice{border:1px solid var(--accent-border);border-radius:var(--radius);background:var(--accent-soft);color:var(--text);padding:var(--space-2) var(--space-3);font-size:var(--fs-13);overflow-wrap:anywhere}.compatibility{margin:var(--space-4) 0}.summaryGrid{margin-top:var(--space-5);border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);grid-template-columns:repeat(4,minmax(0,1fr));display:grid;overflow:hidden}.summaryCard{padding:var(--space-5);gap:var(--space-2);flex-direction:column;min-width:0;display:flex}.summaryCard+.summaryCard{border-left:1px solid var(--border)}.summaryCard>span{color:var(--muted);font-size:var(--fs-12)}.summaryCard strong{font-size:var(--fs-24);letter-spacing:-.02em;overflow-wrap:anywhere;font-weight:600}.summaryCard small{font-size:var(--fs-12);color:var(--subtle);line-height:1.6}.grid{gap:var(--space-4);grid-template-columns:minmax(0,2.8fr) minmax(260px,1fr);display:grid}.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);min-width:0;padding:var(--space-6)}.panelTitle{justify-content:space-between;align-items:start;gap:var(--space-5);display:flex}.panelTitle span{font-size:var(--fs-12);color:var(--subtle);line-height:1.5}.memo{min-height:300px}.tableScroll{overflow-x:auto}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:var(--space-3);border-bottom:1px solid var(--rule);font-size:var(--fs-13)}thead th{color:var(--subtle);font-weight:500}tbody th{z-index:1;background:var(--surface);min-width:170px;font-weight:500;position:sticky;left:0}tbody tr:nth-child(2n):not(.derived)>*{background:var(--band)}.num{font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}.rowEdit{font:inherit;text-align:inherit;border-radius:var(--radius-sm);padding:var(--space-1) 0;color:inherit;text-decoration:underline;-webkit-text-decoration-color:var(--edit-underline);text-decoration-color:var(--edit-underline);text-underline-offset:4px;background:0 0;border:0}.rowEdit:hover{background:var(--control-hover);-webkit-text-decoration-color:var(--accent);text-decoration-color:var(--accent)}.rowEdit:disabled{color:inherit;cursor:default;background:0 0;text-decoration:none}.period{font-size:var(--fs-12);white-space:nowrap;padding:var(--space-2)}.period.active{background:var(--accent-soft)}.derived,.derived th{background:var(--derived)}tbody tr:not(.derived)+.derived>*{border-top:2px solid var(--rule-strong)}.derived[data-fact=ebitda],.derived[data-fact=ebitda] th{background:var(--ebitda-bg);color:var(--ebitda-text)}.derived small{color:var(--derived-label);font-size:var(--fs-12);margin-top:var(--space-1);display:block}.metric{gap:var(--space-2);border-bottom:1px solid var(--rule);padding:var(--space-4) 0;font-size:var(--fs-13);grid-template-columns:1fr auto;display:grid}.metric strong{font-size:var(--fs-20);overflow-wrap:anywhere}.metric>span:before{content:\"\";width:6px;height:6px;margin-right:var(--space-2);background:var(--subtle);vertical-align:middle;border-radius:50%;display:inline-block}.metric[data-state=pass]>span:before{background:var(--positive)}.metric[data-state=fail]>span:before{background:var(--negative)}.metric[data-state=review]>span:before{background:var(--caution)}.metric small{color:var(--muted);grid-column:1/-1;line-height:1.7}.assumptionsGrid{gap:var(--space-4);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.assumption{justify-content:space-between;align-items:start;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid var(--rule);font-size:var(--fs-13);display:flex}.assumption strong{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}details{border:1px solid var(--border);border-radius:var(--radius);margin:var(--space-2) 0;padding:var(--space-3);font-size:var(--fs-13);overflow-wrap:anywhere}summary{cursor:pointer;color:var(--text);line-height:1.5}.operand{gap:var(--space-2);margin:var(--space-3) 0;padding:var(--space-2);border-bottom:1px solid var(--rule);font-size:var(--fs-12);overflow-wrap:anywhere;grid-template-columns:1fr auto;display:grid}.operand small{color:var(--subtle);grid-column:1/-1}.expression{font-family:var(--font-mono);font-size:var(--fs-12)}.audit{gap:var(--space-2);padding:var(--space-4) 0;border-bottom:1px solid var(--rule);overflow-wrap:anywhere;grid-template-columns:1fr auto;display:grid}.audit small{color:var(--muted);grid-column:1/-1}.savedContext{align-items:flex-start;gap:var(--space-2);margin:var(--space-4) 0;padding:var(--space-4);border:1px solid var(--accent-border);border-radius:var(--radius);background:var(--accent-soft);font-size:var(--fs-12);overflow-wrap:anywhere;flex-direction:column;display:flex}.caseList{margin:var(--space-4) 0}.caseRow{align-items:center;gap:var(--space-4);padding:var(--space-4) 0;border-bottom:1px solid var(--rule);overflow-wrap:anywhere;flex-wrap:wrap;display:flex}.caseRow>div{flex:1;min-width:180px}.caseRow h3{margin:0 0 var(--space-2)}.caseRow p,.savedEvent p{font-size:var(--fs-12)}.savedEvent{overflow-wrap:anywhere;margin:var(--space-5) 0;border-top:1px solid var(--border)}.scenariosWorkspace{gap:var(--space-4);min-width:0;display:grid}.scenariosWorkspace p,.scenariosWorkspace small{font-size:var(--fs-13)}.scenarioComposer,.originalComparison,.comparisonArchive,.scenarioResult{overflow-wrap:anywhere}.scenarioRow{margin:var(--space-5) 0;padding:var(--space-4);border:1px solid var(--control-border);border-radius:var(--radius);min-width:0}.scenarioRow legend{color:var(--accent);padding:0 var(--space-2)}.scenarioFields{gap:var(--space-4);margin-bottom:var(--space-4);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.scenarioFields label,.scenarioSelect{min-width:0;font-size:var(--fs-13);display:block}.scenarioFields input,.scenarioFields textarea,.scenarioFields select,.scenarioSelect select{margin:var(--space-2) 0}.scenarioFields small{color:var(--subtle);line-height:1.5}.scenarioRationale{grid-column:1/-1}.scenarioOutcome strong{color:var(--positive)}.scenarioOutcome [data-outcome=review]{color:var(--caution)}.scenarioOutcome [data-outcome=decline]{color:var(--negative)}.scenarioFact{padding:var(--space-2) 0;border-bottom:1px solid var(--rule)}.scenarioFact h4{margin:var(--space-2) 0}.scenarioResult td small{white-space:normal;max-width:200px;display:block}.scenarioResult caption{text-align:left;font-size:var(--fs-13);color:var(--muted);padding:var(--space-3) 0}.scenariosWorkspace [role=alert]{color:var(--negative)}.originalComparisonJson pre{max-height:600px;overflow-y:auto}.reviewWorkspace{gap:var(--space-4);display:grid}.reviewWorkspace .panel{overflow-wrap:anywhere;min-width:0;margin-top:0}.reviewFacts{gap:var(--space-3) var(--space-6);grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));display:grid}.reviewFacts div{min-width:0}.reviewFacts dt,.reviewMetrics span{color:var(--muted);font-size:var(--fs-12)}.reviewFacts dd{margin:var(--space-1) 0 0;font-size:var(--fs-13)}.reviewMetrics{gap:var(--space-3);grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));display:grid}.reviewMetrics>div{padding:var(--space-4);border-radius:var(--radius);background:var(--sunken)}.reviewMetrics strong,.reviewMetrics small{margin-top:var(--space-2);display:block}.reviewMetrics small{color:var(--muted)}.reviewInclude{align-items:center;gap:var(--space-2);margin-top:var(--space-4);display:flex}.reviewInclude input{flex:none;width:18px;height:18px}.reviewDownload{color:var(--accent);margin-bottom:var(--space-3);overflow-wrap:anywhere;display:inline-block}.reviewWorkspace button{white-space:normal;max-width:100%}dialog{color:var(--text);background:var(--raised);border:1px solid var(--border-strong);border-radius:var(--radius-lg);box-shadow:var(--shadow-dialog);padding:var(--space-6);overflow-wrap:anywhere;width:480px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);overflow-y:auto}dialog::backdrop{background:var(--backdrop,#090e0c99)}dialog label{font-size:var(--fs-14);margin:var(--space-4) 0;display:block}dialog input,dialog textarea{margin-top:var(--space-2)}dialog [role=alert]{color:var(--negative);font-size:var(--fs-13)}@media (width<=900px){.summaryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.summaryCard:nth-child(3){border-left:0}.summaryCard:nth-child(n+3){border-top:1px solid var(--border)}main{padding:var(--space-5)}.grid{grid-template-columns:1fr}.panelTitle{gap:var(--space-1);flex-direction:column}}@media (width<=600px){.workspaceBrand{gap:var(--space-3);flex-wrap:wrap;align-items:flex-start}.workspaceType{max-width:120px;line-height:1.6}.workspaceType>span{display:none}.workspaceNav{gap:var(--space-3) var(--space-5)}.workspaceNav button{padding:var(--space-2) 0}.summaryCard{padding:var(--space-4)}.summaryCard strong{font-size:var(--fs-20)}.environmentWarning{display:block}.environmentWarning>span{margin-bottom:var(--space-1);display:block}.uploadbar>label{border-left:0;margin-left:0;padding-left:0}.hostingNotice{padding:var(--space-3) var(--space-5)}.decision{width:100%}.scenarioFields{grid-template-columns:1fr}.caseRow>div{flex-basis:100%;min-width:0}header{display:block}h1{font-size:var(--fs-24)}.decision{margin-top:var(--space-4)}.panel{padding:var(--space-4)}.assumptionsGrid,.operand,.audit{grid-template-columns:1fr}.operand small,.audit small{grid-column:1}.assumption{gap:var(--space-2)}.assumption strong{white-space:normal}.uploadbar{align-items:start}.panelTitle span{margin-bottom:var(--space-3)}}@media print{@page{margin:14mm}:root,.themeRoot{--canvas:var(--surface)}.themeRoot{-webkit-print-color-adjust:exact;print-color-adjust:exact}main{max-width:none;padding:0}.accessBar,.uploadbar,.workspaceNav,.reviewInclude,.reviewDownload,button:not(.period,.rowEdit),dialog{display:none}.period,.rowEdit{color:inherit;background:0 0;border:0;padding:0;text-decoration:none}.panel{margin-top:var(--space-6);border:0;padding:0}.grid{grid-template-columns:1fr}.tableScroll{overflow:visible}tbody th{position:static}thead{display:table-header-group}tr,.metric,.assumption,.audit,.decision,.summaryCard{break-inside:avoid}h2,h3{break-after:avoid}}@media (prefers-reduced-motion:reduce){*,:before,:after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}", qr = /* @__PURE__ */ new WeakMap(), Jr = ({ parentElement: e, data: t, setStateValue: n }) => {
	let r = qr.get(e);
	if (r && r.transport.generation !== t.generation && (r.root.unmount(), r.transport.dispose(), qr.delete(e), r = void 0), !r) {
		let i = e.querySelector(".react-root");
		if (!i) throw Error("Workspace mount unavailable");
		let a = document.createElement("style");
		a.textContent = Kr, e.prepend(a), Je(e);
		let o = new Gr(t.generation, (e) => n("requests", e));
		H(t.generation, o.request);
		let s = (0, l.createRoot)(i);
		r = {
			root: s,
			transport: o
		}, qr.set(e, r), s.render(/* @__PURE__ */ (0, V.jsx)(_r, { children: /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "embeddedWorkspace",
			children: [/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "hostingNotice",
				children: [/* @__PURE__ */ (0, V.jsx)("span", { children: "TESTING WORKSPACE" }), /* @__PURE__ */ (0, V.jsx)("span", { children: "Synthetic data only · saved test cases may reset when the host restarts" })]
			}), /* @__PURE__ */ (0, V.jsx)(Ur, {})]
		}) }));
	}
	return r.transport.publish = (e) => n("requests", e), r.transport.accept(t.responses), () => {
		let t = qr.get(e);
		t?.root.unmount(), t?.transport.dispose(), qr.delete(e);
	};
};
//#endregion
export { Jr as default };
