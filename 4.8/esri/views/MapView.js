// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
require({
    cache: {
        "esri/core/workers": function () {
            define(["require", "exports", "./workers/workers"], function (n, c, e) {
                Object.defineProperty(c, "__esModule", {value: !0});
                for (var a in e) c.hasOwnProperty(a) || (c[a] = e[a])
            })
        }, "esri/core/workers/workers": function () {
            define("require exports dojo/sniff dojo/promise/all ../Logger ../promiseUtils ./Connection ./RemoteClient ./WorkerOwner".split(" "), function (n, c, e, a, l, k, h, g, b) {
                function d() {
                    if (u) return u;
                    for (var d = f + m, h = [], e = function (d) {
                        var a = b.create(d).then(function (b) {
                            return t[d] =
                                b
                        });
                        h.push(a)
                    }, g = 0; g < d; g++) e(g);
                    return u = a(h).then(function () {
                    })
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                c.Connection = h;
                c.RemoteClient = g;
                (h = e("host-browser") ? navigator.hardwareConcurrency : 0) || (h = e("safari") && e("mac") || e("trident") ? 8 : 2);
                var f = e("esri-workers-debug") ? 1 : Math.max(1, Math.ceil(h / 2)),
                    m = e("esri-workers-debug") ? 1 : Math.max(1, Math.floor(h / 2)),
                    q = l.getLogger("esri.core.workers"), p = 0, t = [];
                c.initialize = function () {
                    d()
                };
                c.open = function (b, a, h) {
                    void 0 === a && (a = {});
                    if (Array.isArray(b)) return new c.Connection(b.map(function (b) {
                        return new c.RemoteClient(b,
                            a.client)
                    }));
                    if ("string" !== typeof b) {
                        q.warn("workers-open:signature-deprecated", "DEPRECATED: workers.open() changed signature.");
                        var e = b;
                        b = a;
                        a = {client: e, strategy: h ? "dedicated" : "distributed"}
                    }
                    var g = a.strategy || "distributed";
                    return "local" === g ? k.create(function (a) {
                        n([b], function (b) {
                            a(c.RemoteClient.connect(b))
                        })
                    }).then(function (b) {
                        return new c.Connection([new c.RemoteClient(b, a.client)])
                    }) : d().then(function () {
                        if ("dedicated" === g) {
                            var d = f + p++;
                            p %= m;
                            return t[d].open(b).then(function (b) {
                                return new c.Connection([new c.RemoteClient(b,
                                    a.client)])
                            })
                        }
                        return k.all(t.map(function (a) {
                            return a.open(b)
                        })).then(function (b) {
                            return new c.Connection(b.map(function (b) {
                                return new c.RemoteClient(b, a.client)
                            }))
                        })
                    })
                };
                c.terminate = function () {
                    u && (u.cancel(), u = null);
                    for (var b = 0; b < t.length; b++) t[b] && t[b].terminate();
                    t.length = 0
                };
                var u = null
            })
        }, "esri/core/workers/Connection": function () {
            define(["require", "exports", "../promiseUtils"], function (n, c, e) {
                return function () {
                    function a(a) {
                        this._clientIdx = 0;
                        this._clients = a
                    }

                    a.prototype.broadcast = function (a, e, h) {
                        for (var g =
                            [], b = 0, d = this._clients; b < d.length; b++) g.push(d[b].invoke(a, e, h));
                        return g
                    };
                    a.prototype.close = function () {
                        for (var a = 0, e = this._clients; a < e.length; a++) e[a].close();
                        this._clients = []
                    };
                    a.prototype.invoke = function (a, k, h, g) {
                        var b = g && g.client;
                        if (!this._clients || !this._clients.length) return e.reject(Error("Connection closed"));
                        null != b && -1 !== this._clients.indexOf(b) || this._clients.some(function (a) {
                            return a.isBusy() ? !1 : (b = a, !0)
                        }) || (this._clientIdx = (this._clientIdx + 1) % this._clients.length, b = this._clients[this._clientIdx]);
                        a = b.invoke(a, k, h);
                        g && (g.client = b);
                        return a
                    };
                    a.prototype.openPorts = function () {
                        return e.all(this._clients.map(function (a) {
                            return a.openPort()
                        }))
                    };
                    return a
                }()
            })
        }, "esri/core/workers/RemoteClient": function () {
            define("require exports dojo/Deferred ../Error ../promiseUtils ./utils".split(" "), function (n, c, e, a, l, k) {
                function h(b, a) {
                    b["delete"](a)
                }

                var g = k.MessageType.CLOSE, b = k.MessageType.CANCEL, d = k.MessageType.INVOKE,
                    f = k.MessageType.RESPONSE, m = k.MessageType.OPEN_PORT, q = function () {
                        function b(b) {
                            this._timer =
                                null;
                            this._cancelledJobIds = new Set;
                            this._invokeMessages = [];
                            this._invoke = b;
                            this._timer = null;
                            this._process = this._process.bind(this)
                        }

                        b.prototype.push = function (b) {
                            b.type === k.MessageType.CANCEL ? this._cancelledJobIds.add(b.jobId) : (this._invokeMessages.push(b), null === this._timer && (this._timer = setTimeout(this._process, 0)))
                        };
                        b.prototype.clear = function () {
                            this._invokeMessages.length = 0;
                            this._cancelledJobIds.clear();
                            this._timer = null
                        };
                        b.prototype._process = function () {
                            this._timer = null;
                            for (var b = 0, a = this._invokeMessages; b <
                            a.length; b++) {
                                var d = a[b];
                                this._cancelledJobIds.has(d.jobId) || this._invoke(d)
                            }
                            this._cancelledJobIds.clear();
                            this._invokeMessages.length = 0
                        };
                        return b
                    }();
                return function () {
                    function p(b, a, d) {
                        this._outJobs = new Map;
                        this._inJobs = new Map;
                        this._queue = new q(this._onInvoke.bind(this));
                        this._onMessage = this._onMessage.bind(this);
                        this._client = a;
                        this._port = b;
                        this._port.addEventListener("message", this._onMessage);
                        this._port.start();
                        this._channel = d
                    }

                    p.connect = function (b) {
                        var a = new MessageChannel;
                        b = "function" === typeof b ?
                            new b : "default" in b && "function" === typeof b.default ? new b.default : b;
                        b.remoteClient = new p(a.port1, b, a);
                        return a.port2
                    };
                    p.prototype.close = function () {
                        this._post({type: g});
                        this._close()
                    };
                    p.prototype.isBusy = function () {
                        return 0 < this._outJobs.size
                    };
                    p.prototype.invoke = function (f, m, g) {
                        var r = this;
                        if (!this._port) return l.reject(new a("remote-client:port-closed", "Can't invoke(), port is closed"));
                        var q = k.newJobId(), p = new e(function () {
                            h(r._outJobs, q);
                            r._post({type: b, jobId: q})
                        });
                        this._outJobs.set(q, p);
                        this._post({
                            type: d,
                            jobId: q, methodName: f
                        }, m, g);
                        return p.promise
                    };
                    p.prototype.openPort = function () {
                        var a = this, d = k.newJobId(), f = new e(function () {
                            h(a._outJobs, d);
                            a._post({type: b, jobId: d})
                        });
                        this._outJobs.set(d, f);
                        this._post({type: m, jobId: d});
                        return f.promise
                    };
                    p.prototype._close = function () {
                        this._channel && (this._channel = null);
                        this._port.removeEventListener("message", this._onMessage);
                        this._port.close();
                        this._outJobs.forEach(function (b) {
                            b.cancel()
                        });
                        this._inJobs.clear();
                        this._outJobs.clear();
                        this._queue.clear();
                        this._port = this._client =
                            null
                    };
                    p.prototype._onMessage = function (a) {
                        if (a = k.receiveMessage(a)) switch (a.type) {
                            case f:
                                this._onResponse(a);
                                break;
                            case d:
                                this._queue.push(a);
                                break;
                            case b:
                                this._onCancel(a);
                                break;
                            case g:
                                this._close();
                                break;
                            case m:
                                this._onOpenPort(a)
                        }
                    };
                    p.prototype._onCancel = function (b) {
                        var a = this._inJobs, d = b.jobId, f = a.get(d);
                        this._queue.push(b);
                        f && (h(a, d), f.cancel())
                    };
                    p.prototype._onInvoke = function (b) {
                        var a = this, d = b.methodName, m = b.jobId;
                        b = b.data;
                        var e = this._inJobs, g = this._client, q = g[d], p;
                        try {
                            if (!q && d && -1 !== d.indexOf(".")) for (var t =
                                d.split("."), c = 0; c < t.length - 1; c++) g = g[t[c]], q = g[t[c + 1]];
                            if ("function" !== typeof q) throw new TypeError(d + " is not a function");
                            p = q.call(g, b, this)
                        } catch (C) {
                            this._post({type: f, jobId: m, error: k.toInvokeError(C)});
                            return
                        }
                        l.isThenable(p) ? (e.set(m, p), p.then(function (b) {
                            e.has(m) && (h(e, m), a._post({type: f, jobId: m}, b))
                        }).catch(function (b) {
                            e.has(m) && (h(e, m), b && "cancel" === b.dojoType || a._post({
                                type: f,
                                jobId: m,
                                error: k.toInvokeError(b || {message: "Error encountered at method " + d})
                            }))
                        })) : this._post({type: f, jobId: m}, p)
                    };
                    p.prototype._onOpenPort = function (b) {
                        var a = new MessageChannel;
                        new p(a.port1, this._client);
                        this._post({type: f, jobId: b.jobId}, a.port2, [a.port2])
                    };
                    p.prototype._onResponse = function (b) {
                        var d = b.jobId, f = b.error;
                        b = b.data;
                        var m = this._outJobs;
                        if (m.has(d)) {
                            var e = m.get(d);
                            h(m, d);
                            f ? e.reject(a.fromJSON(JSON.parse(f))) : e.resolve(b)
                        }
                    };
                    p.prototype._post = function (b, a, d) {
                        return k.postMessage(this._port, b, a, d)
                    };
                    return p
                }()
            })
        }, "esri/core/workers/utils": function () {
            define(["require", "exports", "dojo/has"], function (n, c, e) {
                function a(a) {
                    return a &&
                        "object" === typeof a && ("result" in a || "transferList" in a)
                }

                function l(a) {
                    return a instanceof ArrayBuffer || a && a.constructor && "ArrayBuffer" === a.constructor.name
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                (function (a) {
                    a[a.HANDSHAKE = 0] = "HANDSHAKE";
                    a[a.CONFIGURE = 1] = "CONFIGURE";
                    a[a.CONFIGURED = 2] = "CONFIGURED";
                    a[a.OPEN = 3] = "OPEN";
                    a[a.OPENED = 4] = "OPENED";
                    a[a.RESPONSE = 5] = "RESPONSE";
                    a[a.INVOKE = 6] = "INVOKE";
                    a[a.CANCEL = 7] = "CANCEL";
                    a[a.CLOSE = 8] = "CLOSE";
                    a[a.OPEN_PORT = 9] = "OPEN_PORT"
                })(c.MessageType || (c.MessageType =
                    {}));
                var k = 0;
                c.newJobId = function () {
                    return k++
                };
                c.isTranferableResult = a;
                c.toInvokeError = function (a) {
                    return a ? a.toJSON ? JSON.stringify(a) : JSON.stringify({
                        name: a.name,
                        message: a.message,
                        details: a.details,
                        stack: a.stack
                    }) : null
                };
                c.postMessage = function (h, g, b, d) {
                    2 === arguments.length || void 0 === b && void 0 === d ? h.postMessage(g) : (e("esri-workers-supports-transfer-arraybuffer") || (d ? (d = d.filter(function (b) {
                        return !l(b)
                    }), d.length || (d = null)) : a(b) && b.transferList && (b.transferList = b.transferList.filter(function (b) {
                        return !l(b)
                    }),
                    b.transferList.length || (b.transferList = null))), d ? (g.data = b, h.postMessage(g, d)) : a(b) ? (g.data = b.result, b.transferList ? h.postMessage(g, b.transferList) : h.postMessage(g)) : (g.data = b, h.postMessage(g)))
                };
                c.receiveMessage = function (a) {
                    return a ? (a = a.data) ? "string" === typeof a ? JSON.parse(a) : a : null : null
                }
            })
        }, "esri/core/workers/WorkerOwner": function () {
            define("require exports dojo/Deferred ../../kernel ../Error ../Logger ../promiseUtils ./utils ./workerFactory".split(" "), function (n, c, e, a, l, k, h, g, b) {
                var d = k.getLogger("esri.core.workers"),
                    f = g.MessageType.CANCEL, m = g.MessageType.INVOKE, q = g.MessageType.OPEN,
                    p = g.MessageType.OPENED, t = g.MessageType.RESPONSE;
                return function () {
                    function k(b, a) {
                        this._outJobs = new Map;
                        this._inJobs = new Map;
                        this.worker = b;
                        this.id = a;
                        b.addEventListener("message", this._onMessage.bind(this));
                        b.addEventListener("error", function (b) {
                            b.preventDefault();
                            d.error(b)
                        })
                    }

                    k.create = function (a) {
                        return b.createWorker().then(function (b) {
                            return new k(b, a)
                        })
                    };
                    k.prototype.terminate = function () {
                        this.worker.terminate()
                    };
                    k.prototype.open =
                        function (b) {
                            var a = this, d = g.newJobId(), m = new e(function (b) {
                                a._outJobs["delete"](d);
                                a._post({type: f, jobId: d})
                            });
                            this._outJobs.set(d, m);
                            this._post({type: q, jobId: d, modulePath: b});
                            return m.promise
                        };
                    k.prototype._onMessage = function (b) {
                        if (b = g.receiveMessage(b)) switch (b.type) {
                            case p:
                            case t:
                                this._onResponse(b);
                                break;
                            case f:
                                this._onCancel(b);
                                break;
                            case m:
                                this._onInvoke(b)
                        }
                    };
                    k.prototype._onCancel = function (b) {
                        (b = this._inJobs.get(b.jobId)) && b.cancel()
                    };
                    k.prototype._onInvoke = function (b) {
                        var d = this, f = b.methodName,
                            m = b.jobId;
                        b = b.data;
                        var e = this._inJobs, q = a.workerMessages[f], l;
                        try {
                            if ("function" !== typeof q) throw new TypeError(f + " is not a function");
                            l = q.call(null, b)
                        } catch (A) {
                            this._post({type: t, jobId: m, error: g.toInvokeError(A)});
                            return
                        }
                        h.isThenable(l) ? (e.set(m, l), l.then(function (b) {
                            e["delete"](m);
                            d._post({type: t, jobId: m}, b)
                        }).catch(function (b) {
                            e["delete"](m);
                            b || (b = {message: "Error encountered at method" + f});
                            b.dojoType && "cancel" === b.dojoType || d._post({
                                type: t,
                                jobId: m,
                                error: g.toInvokeError(b)
                            })
                        })) : this._post({
                            type: t,
                            jobId: m
                        }, l)
                    };
                    k.prototype._onResponse = function (b) {
                        var a = b.jobId, d = b.error;
                        b = b.data;
                        var f = this._outJobs.get(a);
                        f && (this._outJobs["delete"](a), d ? f.reject(l.fromJSON(JSON.parse(d))) : f.resolve(b))
                    };
                    k.prototype._post = function (b, a, d) {
                        return g.postMessage(this.worker, b, a, d)
                    };
                    return k
                }()
            })
        }, "esri/core/workers/workerFactory": function () {
            define("require exports ../tsSupport/assignHelper dojo/_base/kernel ../../config ../../request ../Logger ../promiseUtils ../sniff ../urlUtils ./loaderConfig ./utils ./WorkerFallback".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q) {
                    function p(d) {
                        return g.create(function (g) {
                            function h(q) {
                                if (q = m.receiveMessage(q)) switch (q.type) {
                                    case w:
                                        q = d;
                                        var p = l.workers.loaderUrl || f.DEFAULT_LOADER_URL, r;
                                        null != l["default"] ? (r = e({}, l), delete r["default"], r = JSON.parse(JSON.stringify(r))) : r = JSON.parse(JSON.stringify(l));
                                        var u = l.workers.loaderConfig, u = f.default({
                                            baseUrl: u.baseUrl,
                                            locale: a.locale,
                                            has: e({
                                                "config-deferredInstrumentation": 0,
                                                "dojo-test-sniff": 0,
                                                "esri-cors": 1,
                                                "esri-secure-context": b("esri-secure-context"),
                                                "esri-workers-supports-transfer-arraybuffer": b("esri-workers-supports-transfer-arraybuffer"),
                                                "events-keypress-typed": 0,
                                                "host-webworker": 1
                                            }, u.has),
                                            map: e({}, u.map),
                                            paths: e({}, u.paths),
                                            packages: u.packages || []
                                        });
                                        q.postMessage({
                                            type: y,
                                            configure: {esriConfig: r, loaderUrl: p, loaderConfig: u}
                                        });
                                        break;
                                    case v:
                                        d.removeEventListener("message", h), d.removeEventListener("error", k), g(d)
                                }
                            }

                            function k(b) {
                                b.preventDefault();
                                d.removeEventListener("message", h);
                                d.removeEventListener("error", k);
                                r.warn("Failed to create Worker. Fallback to execute module in main thread",
                                    b);
                                d = new q;
                                d.addEventListener("message", h);
                                d.addEventListener("error", k)
                            }

                            d.addEventListener("message", h);
                            d.addEventListener("error", k)
                        })
                    }

                    Object.defineProperty(c, "__esModule", {value: !0});
                    var t = d.normalize(n.toUrl("./worker.js")), u = !d.hasSameOrigin(t, location.href),
                        r = h.getLogger("esri.core.workers"), x = null, v = m.MessageType.CONFIGURED,
                        y = m.MessageType.CONFIGURE, w = m.MessageType.HANDSHAKE;
                    c.createWorker = function () {
                        if (!b("esri-workers")) return p(new q);
                        if (!u) {
                            var a = void 0;
                            try {
                                a = new Worker(t)
                            } catch (B) {
                                r.warn("Failed to create Worker. Fallback to execute module in main thread",
                                    event), a = new q
                            }
                            return p(a)
                        }
                        x || (x = k(t, {responseType: "text"}));
                        return x.then(function (b) {
                            return new Worker(URL.createObjectURL(new Blob([b.data], {type: "text/javascript"})))
                        }).catch(function (b) {
                            r.warn("Failed to create Worker. Fallback to execute module in main thread", b);
                            return new q
                        }).then(function (b) {
                            return p(b)
                        })
                    }
                })
        }, "esri/core/workers/loaderConfig": function () {
            define(["require", "exports", "../tsSupport/assignHelper", "dojo/has", "../urlUtils"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule",
                    {value: !0});
                a = a("esri-built") ? "dojo/dojo-lite.js" : "dojo/dojo.js";
                c.DEFAULT_LOADER_URL = l.makeAbsolute(l.removeQueryParameters(n.toUrl(a)));
                c.DEFAULT_CONFIG = {
                    baseUrl: function () {
                        var a = l.removeQueryParameters(n.toUrl("dojo/x.js"));
                        return l.makeAbsolute(a.slice(0, a.length - 5))
                    }(),
                    packages: [{name: "esri"}, {name: "dojo"}, {name: "dojox"}, {name: "dstore"}, {
                        name: "moment",
                        main: "moment"
                    }, {name: "@dojo"}, {name: "cldrjs", main: "dist/cldr"}, {
                        name: "globalize",
                        main: "dist/globalize"
                    }, {name: "maquette", main: "dist/maquette.umd"},
                        {
                            name: "maquette-css-transitions",
                            main: "dist/maquette-css-transitions.umd"
                        }, {name: "maquette-jsx", main: "dist/maquette-jsx.umd"}, {name: "tslib", main: "tslib"}],
                    map: {
                        globalize: {
                            cldr: "cldrjs/dist/cldr",
                            "cldr/event": "cldrjs/dist/cldr/event",
                            "cldr/supplemental": "cldrjs/dist/cldr/supplemental",
                            "cldr/unresolved": "cldrjs/dist/cldr/unresolved"
                        }
                    }
                };
                c.default = function (a) {
                    var h = {
                        async: a.async,
                        isDebug: a.isDebug,
                        locale: a.locale,
                        baseUrl: a.baseUrl,
                        has: e({}, a.has),
                        map: e({}, a.map),
                        packages: a.packages && a.packages.concat() ||
                        [],
                        paths: e({}, a.paths)
                    };
                    a.hasOwnProperty("async") || (h.async = !0);
                    a.hasOwnProperty("isDebug") || (h.isDebug = !1);
                    a.baseUrl || (h.baseUrl = c.DEFAULT_CONFIG.baseUrl);
                    c.DEFAULT_CONFIG.packages.forEach(function (b) {
                        a:{
                            for (var a = h.packages, d = 0; d < a.length; d++) if (a[d].name === b.name) break a;
                            b = e({}, b);
                            d = l.removeQueryParameters(n.toUrl(b.name + "/x.js"));
                            d = d.slice(0, d.length - 5);
                            b.location = l.makeAbsolute(d);
                            a.push(b)
                        }
                    });
                    a = h.map = h.map || {};
                    for (var g = 0, b = Object.keys(c.DEFAULT_CONFIG.map); g < b.length; g++) {
                        var d = b[g];
                        a[d] ||
                        (a[d] = c.DEFAULT_CONFIG.map[d])
                    }
                    return h
                }
            })
        }, "esri/core/workers/WorkerFallback": function () {
            define(["require", "exports", "dojo/has", "../global", "./utils"], function (n, c, e, a, l) {
                var k = function () {
                    return function () {
                        var b = this, a = document.createDocumentFragment();
                        ["addEventListener", "dispatchEvent", "removeEventListener"].forEach(function (d) {
                            b[d] = function () {
                                for (var b = [], f = 0; f < arguments.length; f++) b[f] = arguments[f];
                                return a[d].apply(a, b)
                            }
                        })
                    }
                }(), h = a.MutationObserver || a.WebKitMutationObserver, g = function () {
                    var b;
                    if (a.process && a.process.nextTick) b = function (b) {
                        a.process.nextTick(b)
                    }; else if (a.Promise) b = function (b) {
                        a.Promise.resolve().then(b)
                    }; else if (h) {
                        var d = [], f = document.createElement("div");
                        (new h(function () {
                            for (; 0 < d.length;) d.shift()()
                        })).observe(f, {attributes: !0});
                        b = function (b) {
                            d.push(b);
                            f.setAttribute("queueStatus", "1")
                        }
                    }
                    return b
                }();
                return function () {
                    function b() {
                        this._dispatcher = new k;
                        this._isInitialized = !1;
                        this._workerPostMessage({type: l.MessageType.HANDSHAKE})
                    }

                    b.prototype.terminate = function () {
                    };
                    Object.defineProperty(b.prototype,
                        "onmessage", {
                            get: function () {
                                return this._onmessageHandler
                            }, set: function (b) {
                                this._onmessageHandler && this.removeEventListener("message", this._onmessageHandler);
                                (this._onmessageHandler = b) && this.addEventListener("message", b)
                            }, enumerable: !0, configurable: !0
                        });
                    Object.defineProperty(b.prototype, "onerror", {
                        get: function () {
                            return this._onerrorHandler
                        }, set: function (b) {
                            this._onerrorHandler && this.removeEventListener("error", this._onerrorHandler);
                            (this._onerrorHandler = b) && this.addEventListener("error", b)
                        }, enumerable: !0,
                        configurable: !0
                    });
                    b.prototype.postMessage = function (b, a) {
                        var d = this;
                        g(function () {
                            d._workerMessageHandler(new MessageEvent("message", {data: b}))
                        })
                    };
                    b.prototype.dispatchEvent = function (b) {
                        return this._dispatcher.dispatchEvent(b)
                    };
                    b.prototype.addEventListener = function (b, a, m) {
                        this._dispatcher.addEventListener(b, a, m)
                    };
                    b.prototype.removeEventListener = function (b, a, m) {
                        this._dispatcher.removeEventListener(b, a, m)
                    };
                    b.prototype._workerPostMessage = function (b, a) {
                        var d = this;
                        g(function () {
                            d.dispatchEvent(new MessageEvent("message",
                                {data: b}))
                        })
                    };
                    b.prototype._workerMessageHandler = function (b) {
                        var a = this;
                        if (b = l.receiveMessage(b)) {
                            var d = b.jobId;
                            switch (b.type) {
                                case l.MessageType.CONFIGURE:
                                    this._isInitialized || this._workerPostMessage({type: l.MessageType.CONFIGURED});
                                    break;
                                case l.MessageType.OPEN:
                                    n(["esri/core/workers/RemoteClient", b.modulePath], function (b, f) {
                                        b = b.connect(f);
                                        a._workerPostMessage({type: l.MessageType.OPENED, jobId: d, data: b})
                                    })
                            }
                        }
                    };
                    return b
                }()
            })
        }, "esri/views/BreakpointsOwner": function () {
            define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper ../core/tsSupport/assignHelper dojo/dom-class ../core/Accessor ../core/ArrayPool ../core/Handles ../core/watchUtils ../core/accessorSupport/decorators ./DOMContainer".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m) {
                    var q = {
                        widthBreakpoint: {
                            getValue: function (b) {
                                var a = b.viewSize[0];
                                b = b.breakpoints;
                                var d = this.values;
                                return a <= b.xsmall ? d.xsmall : a <= b.small ? d.small : a <= b.medium ? d.medium : a <= b.large ? d.large : d.xlarge
                            },
                            values: {
                                xsmall: "xsmall",
                                small: "small",
                                medium: "medium",
                                large: "large",
                                xlarge: "xlarge"
                            },
                            valueToClassName: {
                                xsmall: "esri-view-width-xsmall esri-view-width-less-than-small esri-view-width-less-than-medium esri-view-width-less-than-large esri-view-width-less-than-xlarge",
                                small: "esri-view-width-small esri-view-width-greater-than-xsmall esri-view-width-less-than-medium esri-view-width-less-than-large esri-view-width-less-than-xlarge",
                                medium: "esri-view-width-medium esri-view-width-greater-than-xsmall esri-view-width-greater-than-small esri-view-width-less-than-large esri-view-width-less-than-xlarge",
                                large: "esri-view-width-large esri-view-width-greater-than-xsmall esri-view-width-greater-than-small esri-view-width-greater-than-medium esri-view-width-less-than-xlarge",
                                xlarge: "esri-view-width-xlarge esri-view-width-greater-than-xsmall esri-view-width-greater-than-small esri-view-width-greater-than-medium esri-view-width-greater-than-large"
                            }
                        },
                        heightBreakpoint: {
                            getValue: function (b) {
                                var a = b.viewSize[1];
                                b = b.breakpoints;
                                var d = this.values;
                                return a <= b.xsmall ? d.xsmall : a <= b.small ? d.small : a <= b.medium ? d.medium : a <= b.large ? d.large : d.xlarge
                            },
                            values: {
                                xsmall: "xsmall",
                                small: "small",
                                medium: "medium",
                                large: "large",
                                xlarge: "xlarge"
                            },
                            valueToClassName: {
                                xsmall: "esri-view-height-xsmall esri-view-height-less-than-small esri-view-height-less-than-medium esri-view-height-less-than-large esri-view-height-less-than-xlarge",
                                small: "esri-view-height-small esri-view-height-greater-than-xsmall esri-view-height-less-than-medium esri-view-height-less-than-large esri-view-height-less-than-xlarge",
                                medium: "esri-view-height-medium esri-view-height-greater-than-xsmall esri-view-height-greater-than-small esri-view-height-less-than-large esri-view-height-less-than-xlarge",
                                large: "esri-view-height-large esri-view-height-greater-than-xsmall esri-view-height-greater-than-small esri-view-height-greater-than-medium esri-view-height-less-than-xlarge",
                                xlarge: "esri-view-height-xlarge esri-view-height-greater-than-xsmall esri-view-height-greater-than-small esri-view-height-greater-than-medium esri-view-height-greater-than-large"
                            }
                        },
                        orientation: {
                            getValue: function (b) {
                                b = b.viewSize;
                                var a = this.values;
                                return b[1] >= b[0] ? a.portrait : a.landscape
                            },
                            values: {portrait: "portrait", landscape: "landscape"},
                            valueToClassName: {
                                portrait: "esri-view-orientation-portrait",
                                landscape: "esri-view-orientation-landscape"
                            }
                        }
                    }, p = {xsmall: 544, small: 768, medium: 992, large: 1200};
                    return function (m) {
                        function h() {
                            var a = null !== m && m.apply(this, arguments) || this;
                            a._breakpointsHandles = new b;
                            a.breakpoints = p;
                            a.orientation = null;
                            a.widthBreakpoint = null;
                            a.heightBreakpoint = null;
                            return a
                        }

                        e(h, m);
                        h.prototype.initialize = function () {
                            this._breakpointsHandles.add([d.init(this, ["breakpoints", "size"], this._updateClassNames)])
                        };
                        h.prototype.destroy = function () {
                            this.destroyed || (this._removeActiveClassNames(), this._breakpointsHandles.destroy(), this._breakpointsHandles = null)
                        };
                        h.prototype._updateClassNames = function () {
                            if (this.container) {
                                var b = g.acquire(), a = g.acquire(), d = !1, f, m, e;
                                for (f in q) m = this[f], e = q[f].getValue({
                                    viewSize: this.size,
                                    breakpoints: this.breakpoints
                                }), m !== e && (d = !0, this[f] = e, a.push(q[f].valueToClassName[m]),
                                    b.push(q[f].valueToClassName[e]));
                                d && (this._applyClassNameChanges(b, a), g.release(b), g.release(a))
                            }
                        };
                        h.prototype._applyClassNameChanges = function (b, a) {
                            var d = this.container;
                            d && (k.remove(d, a), k.add(d, b))
                        };
                        h.prototype._removeActiveClassNames = function () {
                            var b = this.container;
                            if (b) for (var a in q) k.remove(b, q[a].valueToClassName[this[a]])
                        };
                        a([f.property({
                            set: function (b) {
                                var a = this._get("breakpoints");
                                if (b !== a) {
                                    a = (a = b) && a.xsmall < a.small && a.small < a.medium && a.medium < a.large;
                                    if (!a) {
                                        var d = JSON.stringify(p, null,
                                            2);
                                        console.warn("provided breakpoints are not valid, using defaults:" + d)
                                    }
                                    b = a ? b : p;
                                    this._set("breakpoints", l({}, b))
                                }
                            }
                        })], h.prototype, "breakpoints", void 0);
                        a([f.property()], h.prototype, "orientation", void 0);
                        a([f.property()], h.prototype, "widthBreakpoint", void 0);
                        a([f.property()], h.prototype, "heightBreakpoint", void 0);
                        return h = a([f.subclass("esri.views.BreakpointsOwner")], h)
                    }(f.declared(h, m))
                })
        }, "esri/views/DOMContainer": function () {
            define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper dojo/dom dojo/dom-construct dojo/on ../core/Accessor ../core/Evented ../core/Handles ../core/scheduling ../core/watchUtils ../core/accessorSupport/decorators ./PopupManager ./overlay/ViewOverlay ../widgets/Popup".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u) {
                    var r = [0, 0];
                    return function (b) {
                        function g() {
                            var a = b.call(this) || this;
                            a._domHandles = new d;
                            a._freqInfo = {freq: 16, time: 750};
                            a._overlayRenderTaskHandle = null;
                            a.height = 0;
                            a.popup = new u({view: a});
                            a.position = null;
                            a.resizing = !1;
                            a.root = null;
                            a.surface = null;
                            a.suspended = !0;
                            a.ui = null;
                            a.userContent = null;
                            a.width = 0;
                            a.watch("cursor", function (b) {
                                var d = a.surface;
                                d && d.setAttribute("data-cursor", b)
                            });
                            a.watch("interacting", function (b) {
                                var d = a.surface;
                                d && d.setAttribute("data-interacting",
                                    b.toString())
                            });
                            a._focusEvent = a._focusEvent.bind(a);
                            a._blurEvent = a._blurEvent.bind(a);
                            return a
                        }

                        e(g, b);
                        g.prototype.initialize = function () {
                            this.watch("ui", this._handleUIChange);
                            this._wireUI(this.ui)
                        };
                        g.prototype.destroy = function () {
                            this.ui.destroy();
                            this.popup && !this.popup.destroyed && this.popup.destroy();
                            this.container = null;
                            this._domHandles.destroy()
                        };
                        Object.defineProperty(g.prototype, "container", {
                            set: function (b) {
                                var a = this, d = this._get("container");
                                if (d !== b) {
                                    this._domHandles.remove("dom-size");
                                    this._stopMeasuring();
                                    if (d) {
                                        var g = this.surface;
                                        g && (g.removeEventListener("focus", this._focusEvent), g.removeEventListener("blur", this._blurEvent));
                                        d.classList.remove("esri-view");
                                        this.popupManager.destroy();
                                        this._set("popupManager", null);
                                        this._overlayRenderTaskHandle && (this._overlayRenderTaskHandle.remove(), this._overlayRenderTaskHandle = null);
                                        this.overlay.destroy();
                                        this._set("overlay", null);
                                        k.destroy(this.root);
                                        this._set("root", null);
                                        k.destroy(this.userContent);
                                        this._set("userContent", null)
                                    }
                                    if (b) {
                                        b.classList.add("esri-view");
                                        d = document.createElement("div");
                                        for (d.className = "esri-view-user-storage"; b.hasChildNodes();) d.appendChild(b.firstChild);
                                        b.appendChild(d);
                                        d = document.createElement("div");
                                        d.className = "esri-view-root";
                                        b.insertBefore(d, b.firstChild);
                                        this._set("root", d);
                                        var e = document.createElement("div");
                                        e.className = "esri-view-surface";
                                        e.setAttribute("role", "application");
                                        e.tabIndex = 0;
                                        e.addEventListener("focus", this._focusEvent);
                                        e.addEventListener("blur", this._blurEvent);
                                        l.setSelectable(e, !1);
                                        d.appendChild(e);
                                        this._set("surface",
                                            e);
                                        g = new t;
                                        d.appendChild(g.surface);
                                        this._set("overlay", g);
                                        g.watch("needsRender", function (b) {
                                            b && !a._overlayRenderTaskHandle ? a._overlayRenderTaskHandle = f.addFrameTask({
                                                render: function () {
                                                    a.overlay.render()
                                                }
                                            }) : a._overlayRenderTaskHandle && (a._overlayRenderTaskHandle.remove(), a._overlayRenderTaskHandle = null)
                                        });
                                        this._forceReadyCycle();
                                        this._domHandles.add(m.init(this, "size", function (b) {
                                                var a = b[1];
                                                e.classList.toggle("esri-view-surface--inset-outline", b[0] >= document.body.clientWidth || a >= document.body.clientHeight)
                                            }),
                                            "dom-size");
                                        this._set("container", b);
                                        this._startMeasuring();
                                        b = new p({enabled: !0, view: this});
                                        this._set("popupManager", b)
                                    } else this._set("width", 0), this._set("height", 0), this._set("position", null), this._set("suspended", !0), this._set("surface", null), this._set("container", null)
                                }
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(g.prototype, "focused", {
                            get: function () {
                                return document.activeElement === this.surface
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(g.prototype, "size", {
                            get: function () {
                                return [this.width,
                                    this.height]
                            }, enumerable: !0, configurable: !0
                        });
                        g.prototype.blur = function () {
                            this.surface && this.surface.blur()
                        };
                        g.prototype.focus = function () {
                            this.surface && this.surface.focus()
                        };
                        g.prototype.pageToContainer = function (b, a, d) {
                            var f = this.position;
                            b -= f[0];
                            a -= f[1];
                            d ? (d[0] = b, d[1] = a) : d = [b, a];
                            return d
                        };
                        g.prototype.containerToPage = function (b, a, d) {
                            var f = this.position;
                            b += f[0];
                            a += f[1];
                            d ? (d[0] = b, d[1] = a) : d = [b, a];
                            return d
                        };
                        g.prototype._handleUIChange = function (b, a) {
                            a && (this._domHandles.remove("ui"), a.destroy());
                            b && this._wireUI(b);
                            this._set("ui", b)
                        };
                        g.prototype._wireUI = function (b) {
                            this._domHandles.remove("ui");
                            b && (b.view = this, this._domHandles.add([m.init(this, "root", function (a) {
                                b.container = a ? k.create("div", null, a) : null
                            }), m.init(this, "popup", function (a, d) {
                                d && (b.remove(d, "popup"), d !== a && d.destroy());
                                a && (a.view = b.view, b.add(a, {key: "popup", position: "manual"}))
                            })], "ui"))
                        };
                        g.prototype._focusEvent = function (b) {
                            this.notifyChange("focused");
                            this.emit("focus", {native: b})
                        };
                        g.prototype._blurEvent = function (b) {
                            this.notifyChange("focused");
                            this.emit("blur", {native: b})
                        };
                        g.prototype._stopMeasuring = function () {
                            this._domHandles.remove("measuring");
                            this._get("resizing") && this._set("resizing", !1)
                        };
                        g.prototype._startMeasuring = function () {
                            var b = this, a = this._freqInfo;
                            a.freq = 16;
                            a.time = 750;
                            this._domHandles.add([h(window, "resize", function () {
                                a.freq = 16;
                                a.time = 750
                            }), f.addFrameTask({
                                prepare: function (a) {
                                    var d = b._measure(), f = b._freqInfo;
                                    f.time += a.deltaTime;
                                    d && (f.freq = 16, b._get("resizing") || b._set("resizing", !0));
                                    f.time < f.freq || (f.time = 0, b._position() ||
                                    d ? f.freq = 16 : f.freq = Math.min(750, 2 * f.freq), !d && 512 <= f.freq && b._get("resizing") && b._set("resizing", !1))
                                }
                            })], "measuring");
                            this._measure();
                            this._position()
                        };
                        g.prototype._measure = function () {
                            var b = this.container, a = b ? b.clientWidth : 0, d = b ? b.clientHeight : 0;
                            if (0 === a || 0 === d || "hidden" === window.getComputedStyle(b).visibility) return this.suspended || this._set("suspended", !0), !1;
                            var b = this.width, f = this.height;
                            if (a === b && d === f) return this.suspended && this._set("suspended", !1), !1;
                            this._set("width", a);
                            this._set("height",
                                d);
                            this.suspended && this._set("suspended", !1);
                            this.emit("resize", {oldWidth: b, oldHeight: f, width: a, height: d});
                            return !0
                        };
                        g.prototype._position = function () {
                            var b = this.container, a = this.position,
                                d = (b.ownerDocument || window.document).defaultView, b = b.getBoundingClientRect();
                            r[0] = b.left + d.pageXOffset;
                            r[1] = b.top + d.pageYOffset;
                            return a && r[0] === a[0] && r[1] === a[1] ? !1 : (this._set("position", [r[0], r[1]]), !0)
                        };
                        a([q.property({
                            value: null, cast: function (b) {
                                return l.byId(b)
                            }
                        })], g.prototype, "container", null);
                        a([q.property({
                            readOnly: !0,
                            dependsOn: ["surface"]
                        })], g.prototype, "focused", null);
                        a([q.property({readOnly: !0})], g.prototype, "height", void 0);
                        a([q.property({type: u})], g.prototype, "popup", void 0);
                        a([q.property({type: p})], g.prototype, "popupManager", void 0);
                        a([q.property({type: t})], g.prototype, "overlay", void 0);
                        a([q.property({readOnly: !0})], g.prototype, "position", void 0);
                        a([q.property({readOnly: !0})], g.prototype, "resizing", void 0);
                        a([q.property({readOnly: !0})], g.prototype, "root", void 0);
                        a([q.property({
                            value: null, dependsOn: ["width",
                                "height"], readOnly: !0
                        })], g.prototype, "size", null);
                        a([q.property({readOnly: !0})], g.prototype, "surface", void 0);
                        a([q.property({readOnly: !0})], g.prototype, "suspended", void 0);
                        a([q.property()], g.prototype, "ui", void 0);
                        a([q.property({readOnly: !0})], g.prototype, "userContent", void 0);
                        a([q.property({readOnly: !0})], g.prototype, "width", void 0);
                        return g = a([q.subclass("esri.views.DOMContainer")], g)
                    }(q.declared(g, b))
                })
        }, "esri/views/overlay/ViewOverlay": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper dojo/dom ../../core/Accessor ../../core/Collection ../../core/accessorSupport/decorators maquette".split(" "),
                function (n, c, e, a, l, k, h, g, b) {
                    return function (d) {
                        function f() {
                            var a = null !== d && d.apply(this, arguments) || this;
                            a.items = new h;
                            a._callbacks = new Map;
                            a._projector = b.createProjector();
                            a._hiddenProjector = b.createProjector();
                            return a
                        }

                        e(f, d);
                        Object.defineProperty(f.prototype, "needsRender", {
                            get: function () {
                                return 0 < this.items.length
                            }, enumerable: !0, configurable: !0
                        });
                        f.prototype.initialize = function () {
                            var b = this, a = document.createElement("div");
                            a.className = "esri-overlay-surface";
                            l.setSelectable(a, !1);
                            this._set("surface",
                                a);
                            this._hiddenSurface = document.createElement("div");
                            this._hiddenSurface.setAttribute("style", "visibility: hidden;");
                            a.appendChild(this._hiddenSurface);
                            this._itemsChangeHandle = this.items.on("change", function (a) {
                                a.added.map(function (a) {
                                    var d = function () {
                                        return a.render()
                                    };
                                    b._callbacks.set(a, d);
                                    b._projector.append(b.surface, d)
                                });
                                a.removed.map(function (a) {
                                    var d = b._projector.detach(b._callbacks.get(a));
                                    b.surface.removeChild(d.domNode);
                                    b._callbacks.delete(a)
                                })
                            })
                        };
                        f.prototype.addItem = function (b) {
                            this.items.add(b)
                        };
                        f.prototype.removeItem = function (b) {
                            this.items.remove(b)
                        };
                        f.prototype.destroy = function () {
                            this.items.removeAll();
                            this._itemsChangeHandle.remove();
                            this._projector = this._callbacks = null
                        };
                        f.prototype.render = function () {
                            this._projector.renderNow()
                        };
                        f.prototype.computeBoundingRect = function (b) {
                            var a = this._hiddenSurface, d = this._hiddenProjector, f = null, g = function () {
                                return f = b.render()
                            };
                            d.append(a, g);
                            d.renderNow();
                            var e = {left: 0, top: 0, right: 0, bottom: 0};
                            if (f && f.domNode) {
                                var m = f.domNode.getBoundingClientRect();
                                e.left =
                                    m.left;
                                e.top = m.top;
                                e.right = m.right;
                                e.bottom = m.bottom
                            }
                            for (d.detach(g); a.firstChild;) a.removeChild(a.firstChild);
                            return e
                        };
                        f.prototype.overlaps = function (b, a) {
                            b = this.computeBoundingRect(b);
                            a = this.computeBoundingRect(a);
                            return Math.max(b.left, a.left) <= Math.min(b.right, a.right) && Math.max(b.top, a.top) <= Math.min(b.bottom, a.bottom)
                        };
                        a([g.property({readOnly: !0})], f.prototype, "surface", void 0);
                        a([g.property({readOnly: !0})], f.prototype, "items", void 0);
                        a([g.property({readOnly: !0, dependsOn: ["items.length"]})],
                            f.prototype, "needsRender", null);
                        return f = a([g.subclass("esri.views.overlay.ViewOverlay")], f)
                    }(g.declared(k))
                })
        }, "esri/widgets/Popup": function () {
            define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper ../core/tsSupport/assignHelper dojo/dom-geometry dojo/i18n!./Popup/nls/Popup dojo/keys ../core/Handles ../core/lang ../core/Logger ../core/watchUtils ../core/accessorSupport/decorators ./Feature ./Spinner ./Widget ./Popup/PopupViewModel ../widgets/support/widgetUtils ./support/widget".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u, r, x, v) {
                    function y(b, a) {
                        return void 0 === a ? "esri-popup__" + b : "esri-popup__" + b + "-" + a
                    }

                    var w = n.toUrl("./Popup/images/default-action.svg"),
                        z = {buttonEnabled: !0, position: "auto", breakpoint: {width: 544}},
                        B = f.getLogger("esri.widgets.Popup");
                    return function (f) {
                        function c(a) {
                            a = f.call(this) || this;
                            a._blurContainer = !1;
                            a._containerNode = null;
                            a._mainContainerNode = null;
                            a._featureMenuNode = null;
                            a._focusContainer = !1;
                            a._focusDockButton = !1;
                            a._focusFeatureMenuButton = !1;
                            a._focusFirstFeature =
                                !1;
                            a._handles = new b;
                            a._displayActionTextLimit = 2;
                            a._pointerOffsetInPx = 16;
                            a._spinner = null;
                            a.actions = null;
                            a.alignment = "auto";
                            a.autoCloseEnabled = null;
                            a.content = null;
                            a.collapsed = !1;
                            a.collapseEnabled = !0;
                            a.dockEnabled = !1;
                            a.featureCount = null;
                            a.features = null;
                            a.featureNavigationEnabled = !0;
                            a.goToOverride = null;
                            a.highlightEnabled = null;
                            a.location = null;
                            a.featureWidgets = [];
                            a.promises = null;
                            a.selectedFeature = null;
                            a.selectedFeatureIndex = null;
                            a.selectedFeatureWidget = null;
                            a.spinnerEnabled = !0;
                            a.title = null;
                            a.updateLocationEnabled =
                                null;
                            a.view = null;
                            a.viewModel = new r;
                            a.visible = null;
                            return a
                        }

                        e(c, f);
                        c.prototype.postInitialize = function () {
                            var a = this;
                            this._addSelectedFeatureIndexHandle();
                            this.own(m.watch(this, "viewModel.screenLocation", function () {
                                    return a._positionContainer()
                                }), m.watch(this, ["viewModel.visible", "dockEnabled"], function () {
                                    return a._toggleScreenLocationEnabled()
                                }), m.watch(this, "viewModel.screenLocation", function (b, d) {
                                    !!b !== !!d && a.reposition()
                                }), m.watch(this, "viewModel.features", function (b) {
                                    return a._createFeatureWidgets(b)
                                }),
                                m.watch(this, "viewModel.view.padding viewModel.view.size viewModel.visible viewModel.waitingForResult viewModel.location alignment".split(" "), function () {
                                    return a.reposition()
                                }), m.watch(this, "spinnerEnabled", function (b) {
                                    return a._spinnerEnabledChange(b)
                                }), m.watch(this, "viewModel.view.size", function (b, d) {
                                    return a._updateDockEnabledForViewSize(b, d)
                                }), m.watch(this, "viewModel.view", function (b, d) {
                                    return a._viewChange(b, d)
                                }), m.watch(this, "viewModel.view.ready", function (b, d) {
                                    return a._viewReadyChange(b,
                                        d)
                                }), m.watch(this, ["viewModel.waitingForResult", "viewModel.location"], function () {
                                    return a._displaySpinner()
                                }), m.watch(this, ["featureWidgets", "viewModel.selectedFeatureIndex"], function () {
                                    return a._updateFeatureWidget()
                                }), m.watch(this, "selectedFeatureWidget.viewModel.title", function (b) {
                                    return a._setTitleFromFeatureWidget(b)
                                }), m.watch(this, ["selectedFeatureWidget.viewModel.content", "selectedFeatureWidget.viewModel.waitingForContent"], function () {
                                    return a._setContentFromFeatureWidget()
                                }), m.on(this, "viewModel",
                                    "trigger-action", function (b) {
                                        return a._zoomToAction(b)
                                    }))
                        };
                        c.prototype.destroy = function () {
                            this._destroyFeatureWidgets();
                            this._destroySpinner();
                            this._handles && this._handles.destroy();
                            this._handles = null
                        };
                        Object.defineProperty(c.prototype, "currentAlignment", {
                            get: function () {
                                return this._getCurrentAlignment()
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "currentDockPosition", {
                            get: function () {
                                return this._getCurrentDockPosition()
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype,
                            "dockOptions", {
                                get: function () {
                                    return this._get("dockOptions") || z
                                }, set: function (a) {
                                    var b = l({}, z), d = this.get("viewModel.view.breakpoints"), f = {};
                                    d && (f.width = d.xsmall, f.height = d.xsmall);
                                    a = l({}, b, a);
                                    b = l({}, b.breakpoint, f);
                                    f = a.breakpoint;
                                    !0 === f ? a.breakpoint = b : "object" === typeof f && (a.breakpoint = l({}, b, f));
                                    this._set("dockOptions", a);
                                    this._setCurrentDockPosition();
                                    this.reposition()
                                }, enumerable: !0, configurable: !0
                            });
                        Object.defineProperty(c.prototype, "featureMenuOpen", {
                            get: function () {
                                return this.viewModel.visible ?
                                    this._get("featureMenuOpen") : !1
                            }, set: function (a) {
                                this._set("featureMenuOpen", !!a)
                            }, enumerable: !0, configurable: !0
                        });
                        c.prototype.blur = function () {
                            this.visible || B.warn("Popup cannot be blurred while visible is false");
                            this._blurContainer = !0;
                            this.scheduleRender()
                        };
                        c.prototype.clear = function () {
                        };
                        c.prototype.close = function () {
                            this.visible = !1
                        };
                        c.prototype.focus = function () {
                            this.visible || B.warn("Popup cannot be focused while visible is false");
                            this._focusContainer = !0;
                            this.scheduleRender()
                        };
                        c.prototype.next =
                            function () {
                                return null
                            };
                        c.prototype.open = function (a) {
                            this._handles.remove("selected-index");
                            this.set({featureMenuOpen: a ? !!a.featureMenuOpen : !1});
                            this.viewModel.open(a);
                            this._addSelectedFeatureIndexHandle()
                        };
                        c.prototype.previous = function () {
                            return null
                        };
                        c.prototype.reposition = function () {
                            this.renderNow();
                            this._positionContainer();
                            this._setCurrentAlignment()
                        };
                        c.prototype.triggerAction = function (a) {
                            return null
                        };
                        c.prototype.render = function () {
                            var a, b, f, g, e, m, l, q = this.collapsed, p = this.collapseEnabled, k = this.dockEnabled,
                                c = this.featureMenuOpen, r = this.featureNavigationEnabled, u = this.featureWidgets,
                                t = this.visible, w = this.viewModel, z = w.allActions, B = w.content,
                                n = w.featureCount, A = w.pendingPromisesCount, N = w.selectedFeatureIndex, C = w.title,
                                w = 1 < n && r, r = 1 < n && c, M = p && !r && q, q = z && z.length,
                                H = w && this._getPageText(n, N), R = this._renderContent(), J = x.isRtl(),
                                Q = this.get("selectedFeatureWidget") ? this.get("selectedFeatureWidget.viewModel.waitingForContent") || this.get("selectedFeatureWidget.viewModel.content") : R,
                                V = k ? h.undock : h.dock, n = this.currentAlignment,
                                z = this.currentDockPosition, A = A ? v.tsx("div", {
                                    key: y("loading-container"),
                                    role: "presentation",
                                    class: "esri-popup__loading-container",
                                    "aria-label": h.loading,
                                    title: h.loading
                                }, v.tsx("span", {
                                    "aria-hidden": "true",
                                    class: this.classes("esri-popup__icon", "esri-icon-loading-indicator", "esri-rotating")
                                })) : null, S = (a = {}, a["esri-icon-layer-list"] = !r, a["esri-icon-close"] = r, a);
                            a = v.tsx("span", {"aria-hidden": "true", class: this.classes("esri-popup__icon", S)});
                            S = (b = {}, b["esri-icon-right-triangle-arrow"] = J, b["esri-popup__pagination-previous-icon--rtl"] =
                                J, b["esri-icon-left-triangle-arrow"] = !J, b["esri-popup__pagination-previous-icon"] = !J, b);
                            b = v.tsx("span", {"aria-hidden": "true", class: this.classes("esri-popup__icon", S)});
                            S = v.tsx("div", {
                                role: "button",
                                tabIndex: 0,
                                bind: this,
                                onclick: this._previous,
                                onkeydown: this._previous,
                                class: this.classes("esri-popup__button", "esri-popup__pagination-previous"),
                                "aria-label": h.previous,
                                title: h.previous
                            }, b);
                            b = (f = {}, f["esri-icon-left-triangle-arrow"] = J, f["esri-popup__pagination-next-icon--rtl"] = J, f["esri-icon-right-triangle-arrow"] =
                                !J, f["esri-popup__pagination-next-icon"] = !J, f);
                            f = v.tsx("span", {"aria-hidden": "true", class: this.classes("esri-popup__icon", b)});
                            J = v.tsx("div", {
                                role: "button",
                                tabIndex: 0,
                                bind: this,
                                onclick: this._next,
                                onkeydown: this._next,
                                class: this.classes("esri-popup__button", "esri-popup__pagination-next"),
                                "aria-label": h.next,
                                title: h.next
                            }, f);
                            b = x.cssTransition("enter", "esri-popup--feature-updated");
                            f = this.id + "-feature-menu";
                            c = v.tsx("div", {
                                role: "button",
                                tabIndex: 0,
                                bind: this,
                                onclick: this._toggleFeatureMenu,
                                onkeydown: this._toggleFeatureMenu,
                                afterCreate: this._focusFeatureMenuButtonNode,
                                afterUpdate: this._focusFeatureMenuButtonNode,
                                class: this.classes("esri-popup__button", "esri-popup__feature-menu-button"),
                                "aria-haspopup": "true",
                                "aria-controls": f,
                                "aria-expanded": c,
                                "aria-label": h.menu,
                                title: h.menu
                            }, a);
                            H = v.tsx("div", {class: "esri-popup__pagination-page-text"}, H);
                            c = w ? v.tsx("div", {
                                class: "esri-popup__navigation-buttons",
                                enterAnimation: b
                            }, S, H, J, A || c) : null;
                            H = this._wouldDockTo();
                            H = (g = {}, g["esri-icon-minimize"] = k, g["esri-popup__icon--dock-icon"] =
                                !k, g["esri-icon-dock-right"] = !k && ("top-right" === H || "bottom-right" === H), g["esri-icon-dock-left"] = !k && ("top-left" === H || "bottom-left" === H), g["esri-icon-maximize"] = !k && "top-center" === H, g["esri-icon-dock-bottom"] = !k && "bottom-center" === H, g);
                            g = v.tsx("span", {"aria-hidden": "true", class: this.classes(H, "esri-popup__icon")});
                            g = this.get("dockOptions.buttonEnabled") ? v.tsx("div", {
                                role: "button",
                                "aria-label": V,
                                title: V,
                                tabIndex: 0,
                                bind: this,
                                onclick: this._toggleDockEnabled,
                                onkeydown: this._toggleDockEnabled,
                                afterCreate: this._focusDockButtonNode,
                                afterUpdate: this._focusDockButtonNode,
                                class: this.classes("esri-popup__button", "esri-popup__button--dock")
                            }, g) : null;
                            p = p && C && (Q || q || w);
                            V = (e = {}, e["esri-popup__header-title--button"] = p, e);
                            H = p ? "button" : "heading";
                            A = p ? M ? h.expand : h.collapse : "";
                            e = this.id + "-popup-title";
                            C = C ? v.tsx("h2", {
                                class: this.classes("esri-popup__header-title", V),
                                key: C,
                                enterAnimation: b,
                                id: e,
                                role: H,
                                "aria-label": A,
                                title: A,
                                bind: this,
                                tabIndex: p ? 0 : -1,
                                onclick: this._toggleCollapsed,
                                onkeydown: this._toggleCollapsed,
                                innerHTML: C
                            }) : null;
                            p = v.tsx("span",
                                {"aria-hidden": "true", class: this.classes("esri-popup__icon", "esri-icon-close")});
                            p = v.tsx("div", {
                                role: "button",
                                tabIndex: 0,
                                bind: this,
                                onclick: this._close,
                                onkeydown: this._close,
                                class: "esri-popup__button",
                                "aria-label": h.close,
                                title: h.close
                            }, p);
                            p = v.tsx("header", {class: "esri-popup__header"}, C, v.tsx("div", {class: "esri-popup__header-buttons"}, g, p));
                            g = this.id + "-popup-content";
                            B = Q && !M ? v.tsx("article", {
                                key: B,
                                enterAnimation: b,
                                id: g,
                                class: "esri-popup__content"
                            }, R) : null;
                            R = !M && ("bottom-left" === n || "bottom-center" ===
                                n || "bottom-right" === n || "top-left" === z || "top-center" === z || "top-right" === z);
                            M = !M && ("top-left" === n || "top-center" === n || "top-right" === n || "bottom-left" === z || "bottom-center" === z || "bottom-right" === z);
                            Q = r ? null : v.tsx("div", {
                                key: y("actions"),
                                class: "esri-popup__actions"
                            }, this._renderActions());
                            b = v.tsx("section", {key: y("navigation"), class: "esri-popup__navigation"}, c);
                            w = w || q ? v.tsx("div", {
                                key: y("feature-buttons"),
                                class: "esri-popup__feature-buttons"
                            }, Q, b) : null;
                            N = this._renderFeatureMenuNode(u, N, r, f);
                            u = d.substitute({total: u.length},
                                h.selectedFeatures);
                            f = v.tsx("section", {
                                key: y("menu"),
                                class: "esri-popup__feature-menu"
                            }, v.tsx("h2", {class: "esri-popup__feature-menu-header"}, u), v.tsx("nav", {
                                class: "esri-popup__feature-menu-viewport",
                                afterCreate: this._featureMenuViewportNodeUpdated,
                                afterUpdate: this._featureMenuViewportNodeUpdated
                            }, N));
                            u = k ? null : v.tsx("div", {
                                key: y("pointer"),
                                class: "esri-popup__pointer",
                                role: "presentation"
                            }, v.tsx("div", {class: this.classes("esri-popup__pointer-direction", "esri-popup--shadow")}));
                            N = this.get("selectedFeature.layer.title");
                            q = this.get("selectedFeature.layer.id");
                            Q = (m = {}, m["esri-popup--shadow"] = k, m);
                            m = (l = {}, l["esri-popup--aligned-top-center"] = t && "top-center" === n, l["esri-popup--aligned-bottom-center"] = t && "bottom-center" === n, l["esri-popup--aligned-top-left"] = t && "top-left" === n, l["esri-popup--aligned-bottom-left"] = t && "bottom-left" === n, l["esri-popup--aligned-top-right"] = t && "top-right" === n, l["esri-popup--aligned-bottom-right"] = "bottom-right" === n, l["esri-popup--is-docked"] = t && k, l["esri-popup--shadow"] = t && !k, l["esri-popup--is-docked-top-left"] =
                                t && "top-left" === z, l["esri-popup--is-docked-top-center"] = t && "top-center" === z, l["esri-popup--is-docked-top-right"] = t && "top-right" === z, l["esri-popup--is-docked-bottom-left"] = t && "bottom-left" === z, l["esri-popup--is-docked-bottom-center"] = t && "bottom-center" === z, l["esri-popup--is-docked-bottom-right"] = t && "bottom-right" === z, l["esri-popup--feature-menu-open"] = t && r, l);
                            l = R ? f : null;
                            k = M ? f : null;
                            r = R ? w : null;
                            n = M ? w : null;
                            l = v.tsx("div", {
                                class: this.classes("esri-popup__main-container", "esri-widget", Q),
                                tabIndex: -1,
                                role: "dialog",
                                "aria-labelledby": C ? e : "",
                                "aria-describedby": B ? g : "",
                                bind: this,
                                onkeyup: this._handleMainKeyup,
                                afterCreate: this._mainContainerNodeUpdated,
                                afterUpdate: this._mainContainerNodeUpdated
                            }, r, l, p, B, n, k);
                            return v.tsx("div", {
                                key: y("base"),
                                class: this.classes("esri-popup", m),
                                role: "presentation",
                                "data-layer-title": N,
                                "data-layer-id": q,
                                bind: this,
                                afterCreate: this._positionContainer,
                                afterUpdate: this._positionContainer
                            }, t ? [l, u] : null)
                        };
                        c.prototype._featureMenuOpenChanged = function (a) {
                            a ? this._focusFirstFeature = !0 : this._focusFeatureMenuButton =
                                !0
                        };
                        c.prototype._setTitleFromFeatureWidget = function (a) {
                            this.selectedFeatureWidget && (this.viewModel.title = a || "")
                        };
                        c.prototype._setContentFromFeatureWidget = function () {
                            var a = this.selectedFeatureWidget;
                            a && (this.viewModel.content = a)
                        };
                        c.prototype._handleFeatureMenuKeyup = function (a) {
                            a.keyCode === g.ESCAPE && (a.stopPropagation(), this.featureMenuOpen = !1)
                        };
                        c.prototype._handleFeatureMenuItemKeyup = function (a) {
                            var b = a.keyCode, d = this._featureMenuNode, f = this.get("features.length"),
                                e = a.currentTarget["data-feature-index"];
                            d && (d = d.querySelectorAll("li"), b === g.UP_ARROW ? (a.stopPropagation(), d[(e - 1 + f) % f].focus()) : b === g.DOWN_ARROW ? (a.stopPropagation(), d[(e + 1 + f) % f].focus()) : b === g.HOME ? (a.stopPropagation(), d[0].focus()) : b === g.END && (a.stopPropagation(), d[d.length - 1].focus()))
                        };
                        c.prototype._handleMainKeyup = function (a) {
                            var b = a.keyCode;
                            b === g.LEFT_ARROW && (a.stopPropagation(), this.previous());
                            b === g.RIGHT_ARROW && (a.stopPropagation(), this.next())
                        };
                        c.prototype._zoomToAction = function (a) {
                            a.action && !a.action.disabled && "zoom-to" === a.action.id &&
                            this.viewModel.zoomToLocation()
                        };
                        c.prototype._spinnerEnabledChange = function (a) {
                            this._destroySpinner();
                            a && (a = this.get("viewModel.view"), this._createSpinner(a))
                        };
                        c.prototype._displaySpinner = function () {
                            var a = this._spinner;
                            if (a) {
                                var b = this.viewModel, d = b.location;
                                b.waitingForResult ? a.show({location: d}) : a.hide()
                            }
                        };
                        c.prototype._getIconStyles = function (a) {
                            return {"background-image": a ? "url(" + a + ")" : ""}
                        };
                        c.prototype._renderAction = function (a, b, f, g) {
                            var e = this, l, q,
                                p = m.watch(a, "active className disabled id title image visible".split(" "),
                                    function () {
                                        return e.scheduleRender()
                                    });
                            this._handles.add(p, g);
                            p = this.get("selectedFeature.attributes");
                            "zoom-to" === a.id && (a.title = h.zoom, a.className = "esri-icon-zoom-in-magnifying-glass");
                            g = a.title;
                            var k = a.className, c = a.image || k ? a.image : w;
                            g = g && p ? d.substitute(p, g) : g;
                            k = k && p ? d.substitute(p, k) : k;
                            p = c && p ? d.substitute(p, c) : c;
                            c = (l = {}, l["esri-icon-loading-indicator"] = a.active, l["esri-rotating"] = a.active, l["esri-popup__action-image"] = !a.active && !!p, l);
                            k && (c[k] = !a.active);
                            l = (q = {}, q["esri-popup__action"] = "toggle" !==
                                a.type, q["esri-popup__action-toggle"] = "toggle" === a.type, q["esri-popup__action-toggle--on"] = "toggle" === a.type && a.value, q["esri-popup__button--disabled"] = a.disabled, q);
                            f = f <= this._displayActionTextLimit ? v.tsx("span", {
                                key: "text",
                                class: "esri-popup__action-text"
                            }, g) : null;
                            return a.visible ? v.tsx("div", {
                                key: a,
                                role: "button",
                                tabIndex: 0,
                                title: g,
                                "aria-label": g,
                                class: this.classes("esri-popup__button", l),
                                bind: this,
                                "data-action-index": b,
                                onclick: this._triggerAction,
                                onkeydown: this._triggerAction
                            }, v.tsx("span", {
                                key: "icon",
                                "aria-hidden": "true",
                                class: this.classes("esri-popup__icon", c),
                                styles: this._getIconStyles(p)
                            }), f) : null
                        };
                        c.prototype._renderActions = function () {
                            var a = this;
                            this._handles.remove("actions");
                            var b = this.viewModel.allActions;
                            if (b) {
                                var d = b.length;
                                return b.map(function (b, f) {
                                    return a._renderAction(b, f, d, "actions")
                                }).toArray()
                            }
                        };
                        c.prototype._addSelectedFeatureIndexHandle = function () {
                            var a = this, b = m.watch(this, "viewModel.selectedFeatureIndex", function (b, d) {
                                return a._selectedFeatureIndexUpdated(b, d)
                            });
                            this._handles.add(b,
                                "selected-index")
                        };
                        c.prototype._selectedFeatureIndexUpdated = function (a, b) {
                            var d = this.featureMenuOpen;
                            this.featureCount && d && a !== b && -1 !== a && (this.featureMenuOpen = !1)
                        };
                        c.prototype._updateFeatureWidget = function () {
                            var a = this.featureWidgets[this.viewModel.selectedFeatureIndex] || null;
                            a && !a.contentEnabled && (a.contentEnabled = !0);
                            this._set("selectedFeatureWidget", a)
                        };
                        c.prototype._destroyFeatureWidgets = function () {
                            this.featureWidgets.forEach(function (a) {
                                return a.destroy()
                            });
                            this._set("featureWidgets", [])
                        };
                        c.prototype._createFeatureWidgets =
                            function (a) {
                                var b = this.featureWidgets.slice(0), d = this.get("viewModel.view"), f = [];
                                a.forEach(function (a, g) {
                                    if (a) {
                                        var e = null;
                                        b.some(function (d, f) {
                                            d && d.graphic === a && (e = d, b.splice(f, 1));
                                            return !!e
                                        });
                                        f[g] = e || new p({contentEnabled: !1, graphic: a, view: d})
                                    }
                                });
                                b.forEach(function (a) {
                                    return a && a.destroy()
                                });
                                this._set("featureWidgets", f)
                            };
                        c.prototype._isScreenLocationWithinView = function (a, b) {
                            return -1 < a.x && -1 < a.y && a.x <= b.width && a.y <= b.height
                        };
                        c.prototype._isOutsideView = function (a) {
                            var b = a.popupHeight, d = a.popupWidth,
                                f = a.screenLocation, g = a.side;
                            a = a.view;
                            if (isNaN(d) || isNaN(b) || !a || !f) return !1;
                            var e = a.padding;
                            return "right" === g && f.x + d / 2 > a.width - e.right || "left" === g && f.x - d / 2 < e.left || "top" === g && f.y - b < e.top || "bottom" === g && f.y + b > a.height - e.bottom ? !0 : !1
                        };
                        c.prototype._determineCurrentAlignment = function () {
                            var a = this._pointerOffsetInPx, b = this._containerNode, d = this._mainContainerNode,
                                f = this.viewModel, g = f.screenLocation, f = f.view;
                            if (!g || !f || !b) return "top-center";
                            if (!this._isScreenLocationWithinView(g, f)) return this._get("currentAlignment") ||
                                "top-center";
                            var e = d ? window.getComputedStyle(d, null) : null,
                                d = e ? parseInt(e.getPropertyValue("max-height").replace(/[^-\d\.]/g, ""), 10) : 0,
                                e = e ? parseInt(e.getPropertyValue("height").replace(/[^-\d\.]/g, ""), 10) : 0,
                                m = k.getContentBox(b), b = m.w + a, m = Math.max(m.h, d, e) + a,
                                a = this._isOutsideView({
                                    popupHeight: m,
                                    popupWidth: b,
                                    screenLocation: g,
                                    side: "right",
                                    view: f
                                }), d = this._isOutsideView({
                                    popupHeight: m,
                                    popupWidth: b,
                                    screenLocation: g,
                                    side: "left",
                                    view: f
                                }), e = this._isOutsideView({
                                    popupHeight: m, popupWidth: b, screenLocation: g,
                                    side: "top", view: f
                                }), g = this._isOutsideView({
                                    popupHeight: m,
                                    popupWidth: b,
                                    screenLocation: g,
                                    side: "bottom",
                                    view: f
                                });
                            return d ? e ? "bottom-right" : "top-right" : a ? e ? "bottom-left" : "top-left" : e ? g ? "top-center" : "bottom-center" : "top-center"
                        };
                        c.prototype._getCurrentAlignment = function () {
                            var a = this.alignment;
                            return this.dockEnabled ? null : "auto" === a ? this._determineCurrentAlignment() : "function" === typeof a ? a.call(this) : a
                        };
                        c.prototype._setCurrentAlignment = function () {
                            this._set("currentAlignment", this._getCurrentAlignment())
                        };
                        c.prototype._setCurrentDockPosition = function () {
                            this._set("currentDockPosition", this._getCurrentDockPosition())
                        };
                        c.prototype._getDockPosition = function () {
                            var a = this.get("dockOptions.position");
                            return "auto" === a ? this._determineCurrentDockPosition() : "function" === typeof a ? a.call(this) : a
                        };
                        c.prototype._getCurrentDockPosition = function () {
                            return this.dockEnabled ? this._getDockPosition() : null
                        };
                        c.prototype._wouldDockTo = function () {
                            return this.dockEnabled ? null : this._getDockPosition()
                        };
                        c.prototype._renderFeatureMenuItemNode =
                            function (a, b, d, f) {
                                var g, e = b === d;
                                f = (g = {}, g["esri-popup__feature-menu-item--selected"] = e, g);
                                g = e ? v.tsx("span", {
                                    key: y("feature-menu-selected-feature-" + d),
                                    title: h.selectedFeature,
                                    "aria-label": h.selectedFeature,
                                    class: "esri-icon-check-mark"
                                }) : null;
                                a = v.tsx("span", {innerHTML: a.title || h.untitled});
                                return v.tsx("li", {
                                    role: "menuitem",
                                    tabIndex: -1,
                                    key: y("feature-menu-feature-" + d),
                                    class: this.classes(f, "esri-popup__feature-menu-item"),
                                    bind: this,
                                    "data-feature-index": b,
                                    onkeyup: this._handleFeatureMenuItemKeyup,
                                    onclick: this._selectFeature,
                                    onkeydown: this._selectFeature
                                }, v.tsx("span", {class: "esri-popup__feature-menu-title"}, a, g))
                            };
                        c.prototype._renderFeatureMenuNode = function (a, b, d, f) {
                            var g = this;
                            return 1 < a.length ? v.tsx("ol", {
                                class: "esri-popup__feature-menu-list",
                                id: f,
                                bind: this,
                                afterCreate: this._featureMenuNodeUpdated,
                                afterUpdate: this._featureMenuNodeUpdated,
                                onkeyup: this._handleFeatureMenuKeyup,
                                role: "menu"
                            }, a.map(function (a, f) {
                                return g._renderFeatureMenuItemNode(a, f, b, d)
                            })) : null
                        };
                        c.prototype._determineCurrentDockPosition = function () {
                            var a =
                                this.get("viewModel.view"), b = x.isRtl() ? "top-left" : "top-right";
                            if (!a) return b;
                            var d = a.padding || {left: 0, right: 0, top: 0, bottom: 0}, d = a.width - d.left - d.right;
                            return (a = a.get("breakpoints")) && d <= a.xsmall ? "bottom-center" : b
                        };
                        c.prototype._renderContent = function () {
                            var a = this.get("viewModel.content");
                            if ("string" === typeof a) return v.tsx("div", {key: a, innerHTML: a});
                            if (v.isWidget(a)) return v.tsx("div", {key: a}, a.render());
                            if (a instanceof HTMLElement) return v.tsx("div", {
                                key: a,
                                bind: a,
                                afterCreate: this._attachToNode
                            });
                            if (v.isWidgetBase(a)) return v.tsx("div", {
                                key: a,
                                bind: a.domNode,
                                afterCreate: this._attachToNode
                            })
                        };
                        c.prototype._attachToNode = function (a) {
                            a.appendChild(this)
                        };
                        c.prototype._positionContainer = function (a) {
                            void 0 === a && (a = this._containerNode);
                            a && (this._containerNode = a);
                            if (a) {
                                var b = this.viewModel.screenLocation, d = k.getContentBox(a);
                                if (b = this._calculatePositionStyle(b, d)) a.style.top = b.top, a.style.left = b.left, a.style.bottom = b.bottom, a.style.right = b.right
                            }
                        };
                        c.prototype._calculateFullWidth = function (a) {
                            var b = this.currentAlignment,
                                d = this._pointerOffsetInPx;
                            return "top-left" === b || "bottom-left" === b || "top-right" === b || "bottom-right" === b ? a + d : a
                        };
                        c.prototype._calculateAlignmentPosition = function (a, b, d, f) {
                            var g = this.currentAlignment, e = this._pointerOffsetInPx;
                            f /= 2;
                            var m = d.height - b;
                            d = d.width - a;
                            var h = this.view.padding;
                            if ("bottom-center" === g) return {top: b + e - h.top, left: a - f - h.left};
                            if ("top-left" === g) return {bottom: m + e - h.bottom, right: d + e - h.right};
                            if ("bottom-left" === g) return {top: b + e - h.top, right: d + e - h.right};
                            if ("top-right" === g) return {
                                bottom: m +
                                e - h.bottom, left: a + e - h.left
                            };
                            if ("bottom-right" === g) return {top: b + e - h.top, left: a + e - h.left};
                            if ("top-center" === g) return {bottom: m + e - h.bottom, left: a - f - h.left}
                        };
                        c.prototype._calculatePositionStyle = function (a, b) {
                            var d = this.view;
                            if (d) {
                                if (this.dockEnabled) return {left: "", top: "", right: "", bottom: ""};
                                if (a && b && (b = this._calculateFullWidth(b.w), a = this._calculateAlignmentPosition(a.x, a.y, d, b))) return {
                                    top: void 0 !== a.top ? a.top + "px" : "auto",
                                    left: void 0 !== a.left ? a.left + "px" : "auto",
                                    bottom: void 0 !== a.bottom ? a.bottom + "px" :
                                        "auto",
                                    right: void 0 !== a.right ? a.right + "px" : "auto"
                                }
                            }
                        };
                        c.prototype._viewChange = function (a, b) {
                            a && b && (this.close(), this.clear())
                        };
                        c.prototype._viewReadyChange = function (a, b) {
                            a ? (a = this.get("viewModel.view"), this._wireUpView(a)) : b && (this.close(), this.clear())
                        };
                        c.prototype._wireUpView = function (a) {
                            this._destroySpinner();
                            a && (this.spinnerEnabled && this._createSpinner(a), this._setDockEnabledForViewSize(this.dockOptions))
                        };
                        c.prototype._dockingThresholdCrossed = function (a, b, d) {
                            var f = a[0];
                            a = a[1];
                            var g = b[0];
                            b = b[1];
                            var e = d.width;
                            d = d.height;
                            return f <= e && g > e || f > e && g <= e || a <= d && b > d || a > d && b <= d
                        };
                        c.prototype._updateDockEnabledForViewSize = function (a, b) {
                            if (a && b) {
                                var d = this.get("viewModel.view.padding") || {left: 0, right: 0, top: 0, bottom: 0},
                                    f = d.left + d.right, g = d.top + d.bottom, d = [], e = [];
                                d[0] = a[0] - f;
                                d[1] = a[1] - g;
                                e[0] = b[0] - f;
                                e[1] = b[1] - g;
                                a = this.dockOptions;
                                this._dockingThresholdCrossed(d, e, a.breakpoint) && this._setDockEnabledForViewSize(a);
                                this._setCurrentDockPosition()
                            }
                        };
                        c.prototype._focusDockButtonNode = function (a) {
                            this._focusDockButton &&
                            (this._focusDockButton = !1, a.focus())
                        };
                        c.prototype._mainContainerNodeUpdated = function (a) {
                            this._mainContainerNode = a;
                            this._focusContainer ? (this._focusContainer = !1, a.focus()) : this._blurContainer && (this._blurContainer = !1, a.blur())
                        };
                        c.prototype._featureMenuNodeUpdated = function (a) {
                            (this._featureMenuNode = a) && this._focusFirstFeature && (this._focusFirstFeature = !1, a = a.querySelectorAll("li"), a.length && a[0].focus())
                        };
                        c.prototype._focusFeatureMenuButtonNode = function (a) {
                            this._focusFeatureMenuButton && (this._focusFeatureMenuButton =
                                !1, a.focus())
                        };
                        c.prototype._featureMenuViewportNodeUpdated = function (a) {
                            a && (a.scrollTop = 0)
                        };
                        c.prototype._toggleScreenLocationEnabled = function () {
                            var a = this.dockEnabled, b = this.viewModel;
                            b && (b.screenLocationEnabled = this.visible && !a)
                        };
                        c.prototype._shouldDockAtCurrentViewSize = function (a) {
                            a = a.breakpoint;
                            var b = this.get("viewModel.view.ui"), d = b.width, b = b.height;
                            if (isNaN(d) || isNaN(b)) return !1;
                            d = a.hasOwnProperty("width") && d <= a.width;
                            a = a.hasOwnProperty("height") && b <= a.height;
                            return d || a
                        };
                        c.prototype._setDockEnabledForViewSize =
                            function (a) {
                                a.breakpoint && (this.dockEnabled = this._shouldDockAtCurrentViewSize(a))
                            };
                        c.prototype._getPageText = function (a, b) {
                            return d.substitute({index: b + 1, total: a}, h.pageText)
                        };
                        c.prototype._destroySpinner = function () {
                            var a = this._spinner, b = this.view;
                            a && (b && b.ui.remove(this._spinner, "popup-spinner"), a.destroy(), this._spinner = null)
                        };
                        c.prototype._createSpinner = function (a) {
                            a && (this._spinner = new t({view: a}), a.ui.add(this._spinner, {
                                key: "popup-spinner",
                                position: "manual"
                            }))
                        };
                        c.prototype._toggleCollapsed = function () {
                            this.collapsed =
                                !this.collapsed
                        };
                        c.prototype._close = function () {
                            this.close();
                            this.view && this.view.focus()
                        };
                        c.prototype._toggleDockEnabled = function () {
                            this.dockEnabled = !this.dockEnabled;
                            this._focusDockButton = !0;
                            this.scheduleRender()
                        };
                        c.prototype._toggleFeatureMenu = function () {
                            var a = !this.featureMenuOpen;
                            this._featureMenuOpenChanged(a);
                            this.featureMenuOpen = a
                        };
                        c.prototype._triggerAction = function (a) {
                            a = a.currentTarget["data-action-index"];
                            var b = this.viewModel.allActions.getItemAt(a);
                            b && "toggle" === b.type && (b.value = !b.value);
                            this.viewModel.triggerAction(a)
                        };
                        c.prototype._selectFeature = function (a) {
                            a = a.currentTarget["data-feature-index"];
                            isNaN(a) || (this.viewModel.selectedFeatureIndex = a)
                        };
                        c.prototype._next = function () {
                            this.next()
                        };
                        c.prototype._previous = function () {
                            this.previous()
                        };
                        a([q.aliasOf("viewModel.actions"), v.renderable()], c.prototype, "actions", void 0);
                        a([q.property()], c.prototype, "alignment", void 0);
                        a([q.aliasOf("viewModel.autoCloseEnabled")], c.prototype, "autoCloseEnabled", void 0);
                        a([q.aliasOf("viewModel.content"),
                            v.renderable()], c.prototype, "content", void 0);
                        a([q.property(), v.renderable()], c.prototype, "collapsed", void 0);
                        a([q.property(), v.renderable()], c.prototype, "collapseEnabled", void 0);
                        a([q.property({
                            readOnly: !0,
                            dependsOn: ["dockEnabled", "alignment"]
                        }), v.renderable()], c.prototype, "currentAlignment", null);
                        a([q.property({
                            readOnly: !0,
                            dependsOn: ["viewModel.view.ready", "dockEnabled", "dockOptions"]
                        }), v.renderable()], c.prototype, "currentDockPosition", null);
                        a([q.property(), v.renderable()], c.prototype, "dockOptions",
                            null);
                        a([q.property(), v.renderable()], c.prototype, "dockEnabled", void 0);
                        a([q.aliasOf("viewModel.featureCount"), v.renderable()], c.prototype, "featureCount", void 0);
                        a([q.property({dependsOn: ["viewModel.visible"]}), v.renderable()], c.prototype, "featureMenuOpen", null);
                        a([q.aliasOf("viewModel.features"), v.renderable()], c.prototype, "features", void 0);
                        a([q.property(), v.renderable()], c.prototype, "featureNavigationEnabled", void 0);
                        a([q.aliasOf("viewModel.goToOverride")], c.prototype, "goToOverride", void 0);
                        a([q.aliasOf("viewModel.highlightEnabled")],
                            c.prototype, "highlightEnabled", void 0);
                        a([q.aliasOf("viewModel.location"), v.renderable()], c.prototype, "location", void 0);
                        a([q.property({readOnly: !0}), v.renderable()], c.prototype, "featureWidgets", void 0);
                        a([q.aliasOf("viewModel.promises")], c.prototype, "promises", void 0);
                        a([q.aliasOf("viewModel.selectedFeature"), v.renderable()], c.prototype, "selectedFeature", void 0);
                        a([q.aliasOf("viewModel.selectedFeatureIndex"), v.renderable()], c.prototype, "selectedFeatureIndex", void 0);
                        a([q.property({readOnly: !0}),
                            v.renderable()], c.prototype, "selectedFeatureWidget", void 0);
                        a([q.property()], c.prototype, "spinnerEnabled", void 0);
                        a([q.aliasOf("viewModel.title"), v.renderable()], c.prototype, "title", void 0);
                        a([q.aliasOf("viewModel.updateLocationEnabled")], c.prototype, "updateLocationEnabled", void 0);
                        a([q.aliasOf("viewModel.view")], c.prototype, "view", void 0);
                        a([q.property({type: r}), v.renderable("viewModel.allActions viewModel.screenLocation viewModel.screenLocationEnabled viewModel.state viewModel.pendingPromisesCount viewModel.promiseCount viewModel.waitingForResult".split(" ")),
                            v.vmEvent(["triggerAction", "trigger-action"])], c.prototype, "viewModel", void 0);
                        a([q.aliasOf("viewModel.visible"), v.renderable()], c.prototype, "visible", void 0);
                        a([q.aliasOf("viewModel.clear")], c.prototype, "clear", null);
                        a([q.aliasOf("viewModel.next")], c.prototype, "next", null);
                        a([q.aliasOf("viewModel.previous")], c.prototype, "previous", null);
                        a([q.aliasOf("viewModel.triggerAction")], c.prototype, "triggerAction", null);
                        a([v.accessibleHandler()], c.prototype, "_toggleCollapsed", null);
                        a([v.accessibleHandler()],
                            c.prototype, "_close", null);
                        a([v.accessibleHandler()], c.prototype, "_toggleDockEnabled", null);
                        a([v.accessibleHandler()], c.prototype, "_toggleFeatureMenu", null);
                        a([v.accessibleHandler()], c.prototype, "_triggerAction", null);
                        a([v.accessibleHandler()], c.prototype, "_selectFeature", null);
                        a([v.accessibleHandler()], c.prototype, "_next", null);
                        a([v.accessibleHandler()], c.prototype, "_previous", null);
                        return c = a([q.subclass("esri.widgets.Popup")], c)
                    }(q.declared(u))
                })
        }, "esri/widgets/Feature": function () {
            define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper dojo/i18n!./Feature/nls/Feature dojo/keys ../core/promiseUtils ../core/watchUtils ../core/accessorSupport/decorators ./Widget ./Feature/FeatureViewModel ./Feature/support/attachmentUtils ./support/uriUtils ./support/widget".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p) {
                    function t(a, b) {
                        return void 0 === b ? "esri-feature__" + a : "esri-feature__" + a + "-" + b
                    }

                    return function (d) {
                        function c(a) {
                            a = d.call(this) || this;
                            a._chartMap = new Map;
                            a._activeMediaMap = new Map;
                            a._chartRequirePromise = null;
                            a._refreshTimers = new Map;
                            a._mediaInfo = new Map;
                            a.contentEnabled = null;
                            a.graphic = null;
                            a.title = null;
                            a.view = null;
                            a.viewModel = new f;
                            return a
                        }

                        e(c, d);
                        c.prototype.postInitialize = function () {
                            var a = this;
                            this.own(g.init(this, "viewModel.content", function () {
                                return a._setupMediaRefreshTimers()
                            }))
                        };
                        c.prototype.destroy = function () {
                            this._clearMediaRefreshTimers();
                            this._activeMediaMap.clear();
                            this._activeMediaMap = null;
                            this._cancelChartModules();
                            this._destroyCharts()
                        };
                        c.prototype.render = function () {
                            var a = p.tsx("div", {
                                    key: t("loading-container"),
                                    class: "esri-feature__loading-container"
                                }, p.tsx("span", {class: this.classes("esri-icon-loading-indicator esri-rotating", "esri-feature__loading-spinner")})),
                                a = this.viewModel.waitingForContent ? a : this._renderContent();
                            return p.tsx("div", {class: "esri-feature"}, p.tsx("div",
                                {class: "esri-feature__size-container"}, p.tsx("div", {class: "esri-feature__main-container"}, a)))
                        };
                        c.prototype.goToMedia = function (a, b) {
                            this._setContentElementMedia(a, b)
                        };
                        c.prototype.nextMedia = function (a) {
                            this._pageContentElementMedia(a, "next")
                        };
                        c.prototype.previousMedia = function (a) {
                            this._pageContentElementMedia(a, "previous")
                        };
                        c.prototype._cancelChartModules = function () {
                            var a = this._chartRequirePromise;
                            a && a.cancel();
                            this._chartRequirePromise = null
                        };
                        c.prototype._destroyChart = function (a) {
                            var b = this._chartMap.get(a);
                            b && (b.chart.destroy(), b.tooltip.destroy());
                            this._chartMap.delete(a)
                        };
                        c.prototype._destroyCharts = function () {
                            this._chartMap.forEach(function (a) {
                                a.chart.destroy();
                                a.tooltip.destroy()
                            });
                            this._chartMap.clear()
                        };
                        c.prototype._renderContent = function () {
                            this._destroyCharts();
                            var a = this.viewModel.content;
                            if ("string" === typeof a) return p.tsx("div", {key: t("content-string"), innerHTML: a});
                            if (p.isWidget(a)) return p.tsx("div", {key: t("content-widget")}, a.render());
                            if (a instanceof HTMLElement) return p.tsx("div", {
                                key: t("content-html-element"),
                                bind: a, afterCreate: this._attachToNode
                            });
                            if (p.isWidgetBase(a)) return p.tsx("div", {
                                key: t("content-dijit"),
                                bind: a.domNode,
                                afterCreate: this._attachToNode
                            });
                            if (Array.isArray(a)) return a.length ? p.tsx("div", {key: t("content-content-elements")}, a.map(this._renderContentElement, this)) : null
                        };
                        c.prototype._renderContentElement = function (a, b) {
                            switch (a.type) {
                                case "attachments":
                                    return this._renderAttachments(a, b);
                                case "fields":
                                    return this._renderFields(a, b);
                                case "media":
                                    return this._renderMedia(a, b);
                                case "text":
                                    return this._renderText(a,
                                        b);
                                default:
                                    return null
                            }
                        };
                        c.prototype._renderAttachmentInfo = function (a) {
                            var b, d, f = a.attachmentInfo, g = a.supportsResizeAttachments, e = f.contentType;
                            a = f.name;
                            var h = f.url, c = g && m.isSupportedImage(e), q = -1 === h.indexOf("?") ? "?" : "\x26",
                                e = c ? "" + h + q + "w\x3d48" : m.getIconPath(e),
                                c = (b = {}, b["esri-feature__attachment-item-mask--icon"] = !c, b);
                            b = (d = {}, d["esri-feature__attachments-image--resizable"] = g, d);
                            return p.tsx("li", {class: "esri-feature__attachments-item", key: f}, p.tsx("a", {
                                class: "esri-feature__attachments-item-link",
                                href: h, target: "_blank"
                            }, p.tsx("div", {class: this.classes(c, "esri-feature__attachment-item-mask")}, p.tsx("img", {
                                alt: a,
                                class: this.classes(b, "esri-feature__attachments-image"),
                                title: a,
                                src: e
                            }), p.tsx("span", {class: "esri-feature__attachments-image-overlay"}, p.tsx("span", {
                                "aria-hidden": "true",
                                class: "esri-feature__attachments-link-icon esri-icon-link-external"
                            }))), p.tsx("span", {class: "esri-feature__attachments-filename"}, a || l.noTitle)))
                        };
                        c.prototype._renderAttachments = function (a, b) {
                            var d = this, f, g = a.displayType,
                                e = (b = a.attachmentInfos) && b.length,
                                m = this.get("graphic.layer.capabilities.operations.supportsResizeAttachments"),
                                g = (f = {}, f["esri-feature__attachments--list"] = "preview" !== g, f["esri-feature__attachments--preview"] = "preview" === g, f);
                            return e ? p.tsx("div", {
                                key: t("attachments-element"),
                                class: this.classes("esri-feature__attachments", "esri-feature__content-element", g)
                            }, p.tsx("div", {class: "esri-feature__attachments-title"}, l.attach), p.tsx("ul", {class: "esri-feature__attachments-items"}, b.map(function (b, f) {
                                return d._renderAttachmentInfo({
                                    attachmentInfo: b,
                                    attachmentInfoIndex: f, supportsResizeAttachments: m, contentElement: a
                                })
                            }))) : null
                        };
                        c.prototype._forceLTR = function (a) {
                            return "\x26lrm;" + a
                        };
                        c.prototype._renderFieldInfo = function (a, b) {
                            var d, f = this.viewModel.formattedAttributes, g = f ? f.content[b] || f.global : null,
                                e = a.fieldName, f = a.label || e, g = g ? null == g[e] ? "" : g[e] : "";
                            a = !(!a.format || !a.format.dateFormat);
                            g = "number" !== typeof g || a ? q.autoLink(g) : this._forceLTR(g);
                            a = (d = {}, d["esri-feature__field-data--date"] = a, d);
                            return p.tsx("tr", {key: t("fields-element-info-row", b)},
                                p.tsx("th", {
                                    key: t("fields-element-info-row-header", b),
                                    class: "esri-feature__field-header",
                                    innerHTML: f
                                }), p.tsx("td", {
                                    key: t("fields-element-info-row-data", b),
                                    class: this.classes("esri-feature__field-data", a),
                                    innerHTML: g
                                }))
                        };
                        c.prototype._renderFields = function (a, b) {
                            var d = this;
                            return (a = a.fieldInfos) ? p.tsx("div", {
                                key: t("fields-element", b),
                                class: this.classes("esri-feature__fields", "esri-feature__content-element")
                            }, p.tsx("table", {
                                class: "esri-widget__table", summary: l.fieldsSummary, key: t("fields-element-table",
                                    b)
                            }, p.tsx("tbody", {key: t("fields-element-table-body", b)}, a.map(function (a) {
                                return d._renderFieldInfo(a, b)
                            })))) : null
                        };
                        c.prototype._shouldOpenInNewTab = function (a) {
                            void 0 === a && (a = "");
                            return !/^(?:mailto:|tel:)/.test(a.trim().toLowerCase())
                        };
                        c.prototype._clearMediaRefreshTimers = function () {
                            this._refreshTimers.forEach(function (a) {
                                return clearTimeout(a)
                            });
                            this._refreshTimers.clear()
                        };
                        c.prototype._clearMediaRefreshTimer = function (a) {
                            var b = this._refreshTimers.get(a);
                            b && (clearTimeout(b), this._refreshTimers.delete(a))
                        };
                        c.prototype._getImageSource = function (a, b) {
                            var d = -1 !== a.indexOf("?") ? "\x26" : "?";
                            a = a.split("#");
                            var f = a[1], f = void 0 === f ? "" : f;
                            return "" + a[0] + d + "timestamp\x3d" + b + (f ? "#" : "") + f
                        };
                        c.prototype._setupMediaRefreshTimer = function (a) {
                            var b = this.get("viewModel.content");
                            if (Array.isArray(b) && (b = b[a]) && "media" === b.type) {
                                var d = this._activeMediaMap.get(a);
                                isNaN(d) && (d = 0);
                                (b = b.mediaInfos[d]) && "image" === b.type && b.refreshInterval && this._setRefreshTimeout(a, b)
                            }
                        };
                        c.prototype._setupMediaRefreshTimers = function () {
                            var a = this;
                            this._clearMediaRefreshTimers();
                            var b = this.get("viewModel.content");
                            Array.isArray(b) && b.forEach(function (b, d) {
                                return a._setupMediaRefreshTimer(d)
                            })
                        };
                        c.prototype._updateMediaInfoTimestamp = function (a, b) {
                            var d = Date.now();
                            this._mediaInfo.set(b, {timestamp: d, sourceURL: this._getImageSource(a, d)});
                            this.scheduleRender()
                        };
                        c.prototype._setRefreshTimeout = function (a, b) {
                            var d = this, f = b.refreshInterval, g = b.value;
                            f && (b = 6E4 * f, this._updateMediaInfoTimestamp(g.sourceURL, a), b = setInterval(function () {
                                d._updateMediaInfoTimestamp(g.sourceURL,
                                    a)
                            }, b), this._refreshTimers.set(a, b))
                        };
                        c.prototype._renderMediaInfoType = function (a, b) {
                            var d = a.value, f = a.title, f = void 0 === f ? "" : f, g = a.type, e = a.refreshInterval,
                                m = d.sourceURL, d = d.linkURL;
                            if ("image" === g) return a = this._shouldOpenInNewTab(d) ? "_self" : "_blank", m = (e = e ? this._mediaInfo.get(b) : null) ? e.sourceURL : m, b = p.tsx("img", {
                                alt: f,
                                key: t("media-image-" + (e ? e.timestamp : 0), b),
                                src: m
                            }), (f = d ? p.tsx("a", {title: f, href: d, target: a}, b) : null) ? f : b;
                            if (-1 !== g.indexOf("chart")) return p.tsx("div", {
                                key: t("chart", b),
                                bind: this,
                                "data-media-info": a,
                                "data-content-element-index": b,
                                class: "esri-feature__media-chart",
                                afterCreate: this._getChartDependencies,
                                afterUpdate: this._getChartDependencies
                            })
                        };
                        c.prototype._getChartDependencies = function (a) {
                            var b = this, d = a["data-media-info"], f = a["data-content-element-index"], g = d.value,
                                e = g.theme || "Claro", m = d.type, l = e;
                            "string" === typeof e && (l = e.replace(/\./g, "/"));
                            this._cancelChartModules();
                            this._chartRequirePromise = h.create(function (a) {
                                return n(["dojox/charting/Chart2D", "dojox/charting/action2d/Tooltip", "dojox/charting/themes/" +
                                l], function () {
                                    for (var b = [], d = 0; d < arguments.length; d++) b[d] = arguments[d];
                                    return a(b)
                                })
                            }).then(function (d) {
                                b._renderChart(a, f, m, g, d[0], d[1], d[2]);
                                b._chartRequirePromise = null
                            })
                        };
                        c.prototype._renderChart = function (a, b, d, f, g, e, m) {
                            a = new g(a, {margins: {l: 4, t: 4, r: 4, b: 4}});
                            m && a.setTheme(m);
                            switch (d) {
                                case "pie-chart":
                                    a.addPlot("default", {type: "Pie", labels: !1});
                                    a.addSeries("Series A", f.chartOptions);
                                    break;
                                case "line-chart":
                                    a.addPlot("default", {type: "Markers"});
                                    a.addAxis("x", {
                                        min: 0, majorTicks: !1, minorTicks: !1,
                                        majorLabels: !1, minorLabels: !1
                                    });
                                    a.addAxis("y", {includeZero: !0, vertical: !0, fixUpper: "minor"});
                                    f.chartOptions.forEach(function (a, b) {
                                        a.x = b + 1
                                    });
                                    a.addSeries("Series A", f.chartOptions);
                                    break;
                                case "column-chart":
                                    a.addPlot("default", {type: "Columns", gap: 3});
                                    a.addAxis("y", {includeZero: !0, vertical: !0, fixUpper: "minor"});
                                    a.addSeries("Series A", f.chartOptions);
                                    break;
                                case "bar-chart":
                                    a.addPlot("default", {type: "Bars", gap: 3}), a.addAxis("x", {
                                        includeZero: !0,
                                        fixUpper: "minor",
                                        minorLabels: !1
                                    }), a.addAxis("y", {
                                        vertical: !0,
                                        majorTicks: !1, minorTicks: !1, majorLabels: !1, minorLabels: !1
                                    }), a.addSeries("Series A", f.chartOptions)
                            }
                            d = new e(a);
                            a.render();
                            this._chartMap.set(b, {chart: a, tooltip: d})
                        };
                        c.prototype._renderMediaInfo = function (a, b) {
                            this._destroyChart(b);
                            var d = this._renderMediaInfoType(a, b), f = a.title ? p.tsx("div", {
                                key: t("media-title", b),
                                class: "esri-feature__media-item-title",
                                innerHTML: a.title
                            }) : null;
                            a = a.caption ? p.tsx("div", {
                                key: t("media-caption", b),
                                class: "esri-feature__media-item-caption",
                                innerHTML: a.caption
                            }) : null;
                            return p.tsx("div",
                                {
                                    key: t("media-container", b),
                                    class: "esri-feature__media-item-container"
                                }, p.tsx("div", {
                                    key: t("media-item-container", b),
                                    class: "esri-feature__media-item"
                                }, d), f, a)
                        };
                        c.prototype._renderMediaStatsItem = function (a, b, d) {
                            d = "chart" === d ? this.classes("esri-feature__media-chart-icon", "esri-icon-chart") : this.classes("esri-feature__media-image-icon", "esri-icon-media");
                            return p.tsx("li", {class: "esri-feature__media-image-summary"}, p.tsx("span", {
                                "aria-hidden": "true",
                                class: d
                            }), p.tsx("span", {
                                class: "esri-feature__media-count",
                                "aria-label": a
                            }, "(" + b + ")"))
                        };
                        c.prototype._renderMediaPageButton = function (a, b) {
                            var d = (a = "previous" === a) ? l.previous : l.next,
                                f = a ? this.classes("esri-feature__button", "esri-feature__media-previous") : this.classes("esri-feature__button", "esri-feature__media-next"),
                                g = a ? this.classes("esri-feature__icon", "esri-feature__media-previous-icon", "esri-icon-left-triangle-arrow") : this.classes("esri-feature__icon", "esri-feature__media-next-icon", "esri-icon-right-triangle-arrow"),
                                e = a ? this.classes("esri-feature__icon",
                                    "esri-feature__media-previous-icon--rtl", "esri-icon-right-triangle-arrow") : this.classes("esri-feature__icon", "esri-feature__media-next-icon--rtl", "esri-icon-left-triangle-arrow"),
                                m = a ? this._previousClick : this._nextClick;
                            return p.tsx("div", {
                                key: t(a ? "previous" : "next", b),
                                title: d,
                                tabIndex: 0,
                                role: "button",
                                class: f,
                                "data-content-element-index": b,
                                bind: this,
                                onkeydown: m,
                                onclick: m
                            }, p.tsx("span", {"aria-hidden": "true", class: g}), p.tsx("span", {
                                "aria-hidden": "true",
                                class: e
                            }), p.tsx("span", {class: "esri-icon-font-fallback-text"},
                                d))
                        };
                        c.prototype._handleMediaKeyup = function (a) {
                            var b = a.currentTarget["data-content-element-index"], d = a.keyCode;
                            d === k.LEFT_ARROW && (a.stopPropagation(), this.previousMedia(b));
                            d === k.RIGHT_ARROW && (a.stopPropagation(), this.nextMedia(b))
                        };
                        c.prototype._renderMedia = function (a, b) {
                            var d;
                            a = a.mediaInfos;
                            var f = this._getMediaStats(a), g = f.total,
                                e = (d = {}, d["esri-feature--media-pagination-visible"] = 1 < f.total, d);
                            d = this._renderMediaStatsItem(l.numImages, f.images, "image");
                            var f = this._renderMediaStatsItem(l.numCharts,
                                f.charts, "chart"), m = this._renderMediaPageButton("previous", b),
                                h = this._renderMediaPageButton("next", b), c = this._activeMediaMap.get(b);
                            isNaN(c) && (this._activeMediaMap.set(b, 0), c = 0);
                            return g ? p.tsx("div", {
                                key: t("media-element", b),
                                "data-content-element-index": b,
                                bind: this,
                                onkeyup: this._handleMediaKeyup,
                                class: this.classes("esri-feature__media", "esri-feature__content-element", e)
                            }, p.tsx("ul", {class: "esri-feature__media-summary"}, d, f), p.tsx("div", {
                                    key: t("media-element-container", b),
                                    class: "esri-feature__media-container"
                                },
                                m, this._renderMediaInfo(a[c], b), h)) : null
                        };
                        c.prototype._renderText = function (a, b) {
                            return a.text ? p.tsx("div", {
                                key: t("text-element", b),
                                innerHTML: a.text,
                                class: this.classes("esri-feature__text", "esri-feature__content-element")
                            }) : null
                        };
                        c.prototype._attachToNode = function (a) {
                            a.appendChild(this)
                        };
                        c.prototype._getMediaStats = function (a) {
                            var b = 0, d = 0;
                            a.forEach(function (a) {
                                a = a.type;
                                "image" === a ? b++ : -1 !== a.indexOf("chart") && d++
                            });
                            return {total: d + b, images: b, charts: d}
                        };
                        c.prototype._setContentElementMedia = function (a,
                                                                        b) {
                            this._clearMediaRefreshTimer(a);
                            var d = this.viewModel.content;
                            (d = (d = d && d[a]) && d.mediaInfos) && d.length && (this._activeMediaMap.set(a, (b + d.length) % d.length), this._setupMediaRefreshTimer(a), this.scheduleRender())
                        };
                        c.prototype._pageContentElementMedia = function (a, b) {
                            b = "previous" === b ? -1 : 1;
                            b = this._activeMediaMap.get(a) + b;
                            this._setContentElementMedia(a, b)
                        };
                        c.prototype._previousClick = function (a) {
                            this.previousMedia(a.currentTarget["data-content-element-index"])
                        };
                        c.prototype._nextClick = function (a) {
                            this.nextMedia(a.currentTarget["data-content-element-index"])
                        };
                        a([b.aliasOf("viewModel.contentEnabled")], c.prototype, "contentEnabled", void 0);
                        a([b.aliasOf("viewModel.graphic")], c.prototype, "graphic", void 0);
                        a([b.aliasOf("viewModel.title")], c.prototype, "title", void 0);
                        a([b.aliasOf("viewModel.view")], c.prototype, "view", void 0);
                        a([b.property({type: f}), p.renderable(["viewModel.waitingForContent", "viewModel.content"])], c.prototype, "viewModel", void 0);
                        a([p.accessibleHandler()], c.prototype, "_previousClick", null);
                        a([p.accessibleHandler()], c.prototype, "_nextClick", null);
                        return c = a([b.subclass("esri.widgets.Feature")], c)
                    }(b.declared(d))
                })
        }, "esri/widgets/Feature/FeatureViewModel": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/tsSupport/assignHelper dojo/i18n!dojo/cldr/nls/number ../../Graphic ../../core/date ../../core/Error ../../core/Handles ../../core/lang ../../core/Logger ../../core/promiseUtils ../../core/watchUtils ../../core/accessorSupport/decorators ../../support/arcadeUtils ./support/featureUtils ./support/RelatedFeatures ../support/widget".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u, r, x, v) {
                    function y(a, b) {
                        return a && "feature" === a.type ? a.getField(b) : null
                    }

                    function w(a) {
                        return a.replace(/[\u00A0-\u99999<>\&]/gim, function (a) {
                            return "\x26#" + a.charCodeAt(0) + ";"
                        })
                    }

                    var z = m.getLogger("esri.widgets.FeatureViewModel"), B = /^\s*expression\//i,
                        A = new RegExp("" + k.group, "g"), C = new b("cancelled-query", "cancelled feature query"),
                        D = g.getFormat("short-date-short-time"), E = "DateFormat" + D;
                    return function (b) {
                        function m(a) {
                            a = b.call(this) || this;
                            a._handles = new d;
                            a._featurePromise =
                                void 0;
                            a._layerDateFields = null;
                            a._expressionAttributes = null;
                            a.content = null;
                            a.contentEnabled = !0;
                            a.formattedAttributes = null;
                            a.title = "";
                            a.view = null;
                            return a
                        }

                        e(m, b);
                        m.prototype.destroy = function () {
                            this._clear();
                            this._handles.destroy();
                            this._expressionAttributes = this._layerDateFields = this.graphic = this.view = this._handles = null
                        };
                        Object.defineProperty(m.prototype, "graphic", {
                            get: function () {
                                return this._get("graphic") || null
                            }, set: function (a) {
                                if (a) {
                                    var b = r.getSourceLayer(a);
                                    this._layerDateFields = b ? this._getDateFields(b) :
                                        []
                                }
                                this._set("graphic", a);
                                this._graphicChanged(a)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(m.prototype, "waitingForContent", {
                            get: function () {
                                return !!this._featurePromise
                            }, enumerable: !0, configurable: !0
                        });
                        m.prototype._clear = function () {
                            this._cancelFeatureQuery();
                            this._set("title", "");
                            this._set("content", null);
                            this._set("formattedAttributes", null)
                        };
                        m.prototype._graphicChanged = function (a) {
                            var b = this, d = this._handles;
                            if (d && (d.remove("graphic"), this._clear(), a)) {
                                d.add(p.watch(this, "graphic.sourceLayer.popupTemplate.title graphic.sourceLayer.popupTemplate.content graphic.sourceLayer.popupTemplate.fieldInfos graphic.popupTemplate.title graphic.popupTemplate.content graphic.popupTemplate.fieldInfos contentEnabled".split(" "),
                                    function () {
                                        b._graphicChanged(b.graphic)
                                    }), "graphic");
                                var f = !1;
                                a = this._queryFeature().catch(function (a) {
                                    a !== C && z.error("error", "error loading template", a)
                                }).then(function () {
                                    f = !0;
                                    b._featurePromise = null;
                                    b.notifyChange("waitingForContent")
                                });
                                f || (this._featurePromise = a, this.notifyChange("waitingForContent"))
                            }
                        };
                        m.prototype._cancelFeatureQuery = function () {
                            var a = this._featurePromise;
                            a && "function" === typeof a.cancel && a.cancel(C);
                            this._featurePromise = null;
                            this.notifyChange("waitingForContent")
                        };
                        m.prototype._compileContent =
                            function (a, b) {
                                var d = this;
                                if (a && (a.nodeName || a && v.isWidgetBase(a) || v.isWidget(a))) return a;
                                if ("string" === typeof a) return this._compileText({type: "text", text: a}).text;
                                if (Array.isArray(a)) return a.map(function (a, f) {
                                    f = (f = b && b[f]) && f.value;
                                    var g = a.type;
                                    if ("attachments" === g) return d._compileAttachments(a, f);
                                    if ("fields" === g) return d._compileFields(a);
                                    if ("media" === g) return d._compileMedia(a);
                                    if ("text" === g) return d._compileText(a)
                                });
                                a && z.warn("invalid content type.")
                            };
                        m.prototype._compileFields = function (a) {
                            var b =
                                this, d = this.graphic;
                            a = f.clone(a);
                            var g = (d = d.getEffectivePopupTemplate()) && d.expressionInfos,
                                d = a.fieldInfos ? void 0 : d && d.fieldInfos, d = a.fieldInfos || f.clone(d), e = [];
                            d && d.forEach(function (a) {
                                var d = a.fieldName.toLowerCase();
                                if (!a.hasOwnProperty("visible") || a.visible) d = b._isExpressionField(d) ? b._getExpressionInfo(g, d) : null, a.label = d ? d.title : a.label, e.push(a)
                            });
                            a.fieldInfos = e;
                            return a
                        };
                        m.prototype._setImageValue = function (a) {
                            var b = a.value, d = a.formattedAttributes;
                            a = a.layer;
                            var g = b.linkURL, e = b.sourceURL;
                            e &&
                            (b.sourceURL = f.substitute(d, this._fixTokens(e, a)));
                            g && (b.linkURL = ("" + f.substitute(d, this._fixTokens(g, a))).trim())
                        };
                        m.prototype._compileMedia = function (a) {
                            var b = this, d = this._expressionAttributes, g = this._layerDateFields, e = this.graphic;
                            a = f.clone(a);
                            var m = a.mediaInfos || [], h = l({}, e.attributes, d), c = r.getSourceLayer(e),
                                q = this.formattedAttributes.global, p = {dateFormat: {properties: g, formatter: E}};
                            a.mediaInfos = m.map(function (a) {
                                if (a = f.clone(a)) {
                                    var d = a.value, g = a.type,
                                        e = a.title ? b._processFieldsInLinks(b._fixTokens(a.title,
                                            c), h) : "",
                                        m = a.caption ? b._processFieldsInLinks(b._fixTokens(a.caption, c), h) : "";
                                    a.title = e ? ("" + f.substitute(q, e, p)).trim() : "";
                                    a.caption = m ? ("" + f.substitute(q, m, p)).trim() : "";
                                    if ("image" === g) return b._setImageValue({
                                        value: d,
                                        formattedAttributes: q,
                                        layer: c
                                    }), a.value.sourceURL ? a : void 0;
                                    if ("pie-chart" === g || "line-chart" === g || "column-chart" === g || "bar-chart" === g) return b._setChartValue({
                                        value: d,
                                        attributes: h,
                                        formattedAttributes: q,
                                        layer: c
                                    }), a
                                }
                            }).filter(Boolean);
                            return a
                        };
                        m.prototype._compileText = function (a) {
                            var b =
                                this._expressionAttributes, d = this._layerDateFields, g = this.graphic;
                            if ((a = f.clone(a)) && a.text) {
                                var e = r.getSourceLayer(g), g = l({}, g.attributes, b),
                                    b = this.formattedAttributes.global,
                                    d = {dateFormat: {properties: d, formatter: E}},
                                    e = this._processFieldsInLinks(this._fixTokens(a.text, e), g);
                                a.text = ("" + f.substitute(b, e, d)).trim()
                            }
                            return a
                        };
                        m.prototype._compileTitle = function () {
                            var a = this._expressionAttributes, b = this._layerDateFields, d = this.graphic,
                                g = d.getEffectivePopupTemplate(), g = g && g.title, a = l({}, d.attributes, a),
                                e = r.getSourceLayer(d), b = {dateFormat: {properties: b, formatter: E}},
                                m = this.formattedAttributes.global;
                            return "function" === typeof g ? g.call(null, {graphic: d}) : "string" === typeof g && g ? (d = this._processFieldsInLinks(this._fixTokens(g, e), a), ("" + f.substitute(m, d, b)).trim()) : ""
                        };
                        m.prototype._getExpressionInfo = function (a, b) {
                            if (this._isExpressionField(b)) {
                                var d = b.replace(B, "").toLowerCase(), f;
                                a.some(function (a) {
                                    if (a.name.toLowerCase() === d) return f = a, !0
                                });
                                return f
                            }
                        };
                        m.prototype._fixTokens = function (a, b) {
                            return a.replace(/(\{([^\{\r\n]+)\})/g,
                                function (a, d, f) {
                                    return (a = y(b, f)) ? "{" + a.name + "}" : d
                                })
                        };
                        m.prototype._encodeAttributes = function (a) {
                            var b = a ? f.clone(a) : {};
                            Object.keys(b).forEach(function (a) {
                                var d = b[a];
                                "string" === typeof d && (d = encodeURIComponent(d).replace(/\'/g, "\x26apos;"), b[a] = d)
                            });
                            return b
                        };
                        m.prototype._formatAttributesToFieldInfos = function (a, b, d) {
                            var g = this, e = f.clone(this._layerDateFields);
                            a.forEach(function (f) {
                                var m = g._getFixedFieldName(f.fieldName, b);
                                f.fieldName = m;
                                d[m] = g._formatValue(d[m], {fieldInfos: a, fieldName: m, layer: b});
                                e && f.format &&
                                f.format.dateFormat && (f = e.indexOf(m), -1 < f && e.splice(f, 1))
                            })
                        };
                        m.prototype._getArcadeViewingMode = function (a) {
                            return a && "local" === a.viewingMode ? "localScene" : "globalScene"
                        };
                        m.prototype._getViewInfo = function () {
                            var a = this.view;
                            if (a) {
                                var b = "3d" === a.type ? this._getArcadeViewingMode(a) : "map";
                                return u.getViewInfo({
                                    viewingMode: b,
                                    scale: a.scale,
                                    spatialReference: a.spatialReference
                                })
                            }
                        };
                        m.prototype._formatAttributes = function (a) {
                            var b = this, d = this._expressionAttributes, g = this.graphic, e = g.attributes,
                                g = r.getSourceLayer(g),
                                m = e ? f.clone(e) : {}, h = l({}, m, d);
                            this.addRelatedFeatureAttributes(h);
                            a && this._formatAttributesToFieldInfos(a, g, h);
                            if (g) {
                                var c = g.typeIdField;
                                e && Object.keys(e).forEach(function (a) {
                                    if (!b.isRelatedField(a)) {
                                        var d = e[a];
                                        f.isDefined(d) && (d = b._getDomainName(a, d), f.isDefined(d) ? h[a] = d : a === c && (d = b._getTypeName(), f.isDefined(d) && (h[a] = d)))
                                    }
                                })
                            }
                            return h
                        };
                        m.prototype._formatValue = function (a, b) {
                            var d = {dateFormat: {properties: this._layerDateFields, formatter: E}}, e = b.fieldName,
                                m = this._getFieldInfo(b.fieldInfos, e), h = f.clone(m),
                                m = b.preventPlacesFormatting;
                            (b = y(b.layer, e)) && "date" === b.type && (b = h.format || {}, b.dateFormat = b.dateFormat || "short-date-short-time", h.format = b);
                            e = h && h.format;
                            if (!f.isDefined(a) || !h || !f.isDefined(e)) return a;
                            var c = [], h = e.hasOwnProperty("places") || e.hasOwnProperty("digitSeparator");
                            b = e.hasOwnProperty("digitSeparator") ? e.digitSeparator : !0;
                            m = f.isDefined(e.places) && (!m || 0 < e.places);
                            h && m && c.push("places: " + Number(e.places));
                            m = h ? m ? "NumberFormat(" + c.join(",") + ")" : "NumberFormat" : e.dateFormat ? "DateFormat" + (g.getFormat(e.dateFormat) ||
                                D) : void 0;
                            if (!m) return a;
                            a = f.substitute({myKey: a}, "{myKey:" + m + "}", d) || "";
                            return h && !b && k.group ? a.replace(A, "") : a
                        };
                        m.prototype._getDomainName = function (a, b) {
                            var d = this.graphic, f = r.getSourceLayer(d);
                            return f && "feature" === f.type ? (a = f.getFieldDomain(a, {feature: d})) && "coded-value" === a.type ? a.getName(b) : null : null
                        };
                        m.prototype._getFieldInfo = function (a, b) {
                            if (a && a.length && b) {
                                var d = b.toLowerCase(), f = void 0;
                                a.some(function (a) {
                                    if (a.fieldName && a.fieldName.toLowerCase() === d) return f = a, !0
                                });
                                return f
                            }
                        };
                        m.prototype._getTypeName =
                            function () {
                                var a = this.graphic, b = r.getSourceLayer(a);
                                if (b && "feature" === b.type && (a = b.getFeatureType(a))) return a.name
                            };
                        m.prototype._processFieldsInLinks = function (a, b) {
                            var d = this._encodeAttributes(b), g = /href\s*=\s*(?:\"([^\"]+)\"|\'([^\']+)\')/gi;
                            return a ? a.replace(g, function (a, g, e) {
                                g = ("" + (g || e)).trim();
                                return f.substitute(g && "{" === g[0] ? b : d, a)
                            }) : a
                        };
                        m.prototype._compileAttachments = function (a, b) {
                            a = f.clone(a);
                            if (!b) return a;
                            a.attachmentInfos = b;
                            return a
                        };
                        m.prototype._queryAttachments = function () {
                            var a = this.graphic,
                                b = r.getSourceLayer(a);
                            return b ? (b = "scene" === b.type && b.associatedLayer ? b.associatedLayer : b) && "feature" === b.type ? b.queryFeatureAttachments(a) : q.resolve([]) : q.resolve([])
                        };
                        m.prototype._queryContentElements = function (a) {
                            var b = this;
                            if (!Array.isArray(a)) return q.resolve();
                            var d = {};
                            a.forEach(function (a, f) {
                                "attachments" === a.type && (a = b._queryAttachments()) && (d[f] = a)
                            });
                            return Object.keys(d).length ? q.eachAlways(d) : q.resolve()
                        };
                        m.prototype._getContent = function () {
                            var a = this.graphic;
                            if (!this.contentEnabled) return q.resolve();
                            var b = a.getEffectivePopupTemplate(), b = b && b.content,
                                a = "function" === typeof b ? b.call(null, {graphic: a}) : b;
                            return q.isThenable(a) ? a : q.resolve(a)
                        };
                        m.prototype._queryFeature = function () {
                            var a = this;
                            return this._getContent().then(function (b) {
                                return a._checkForRelatedFeatures(b).then(function () {
                                    a._expressionAttributes = a._createFormattedExpressions();
                                    a._set("formattedAttributes", a._createFormattedAttributes(b));
                                    a._set("title", a._compileTitle());
                                    return a._queryContentElements(b).then(function (d) {
                                        d = a._compileContent(b,
                                            d);
                                        a._set("content", d || null);
                                        return d
                                    })
                                })
                            })
                        };
                        m.prototype._isExpressionField = function (a) {
                            return B.test(a)
                        };
                        m.prototype._createCompiledExpressionDictionary = function (a) {
                            var b = new Map;
                            if (!a) return b;
                            a.forEach(function (a) {
                                return b.set(a.name, u.createFunction(a.expression))
                            });
                            return b
                        };
                        m.prototype._getDateFields = function (a) {
                            return (a = a.fields) ? a.filter(function (a) {
                                return "date" === a.type
                            }).map(function (a) {
                                return a.name
                            }) : []
                        };
                        m.prototype._createFormattedExpressions = function () {
                            var a = this, b = this.graphic, d = b.getEffectivePopupTemplate(),
                                d = d && d.expressionInfos, f = this._createCompiledExpressionDictionary(d), g = {};
                            d && d.forEach(function (d) {
                                var e = "expression/" + d.name;
                                d = f.get(d.name);
                                var m = a._getViewInfo();
                                d = u.executeFunction(d, u.createExecContext(b, m));
                                g[e] = "string" === typeof d ? w(d) : d
                            });
                            return g
                        };
                        m.prototype._createFormattedAttributes = function (a) {
                            var b = this, d = this.graphic.getEffectivePopupTemplate(),
                                f = {global: this._formatAttributes(d && d.fieldInfos), content: []};
                            Array.isArray(a) && a.forEach(function (a, d) {
                                "fields" === a.type && a.fieldInfos && (f.content[d] =
                                    b._formatAttributes(a.fieldInfos))
                            });
                            return f
                        };
                        m.prototype._getAllFieldInfos = function (a) {
                            var b = [], d = this.graphic.getEffectivePopupTemplate();
                            (d = d && d.fieldInfos) && b.push.apply(b, d);
                            if (!a || !Array.isArray(a)) return b;
                            a.forEach(function (a) {
                                b.push.apply(b, a && a.fieldInfos)
                            });
                            return b
                        };
                        m.prototype._checkForRelatedFeatures = function (a) {
                            var b = this.graphic;
                            a = this._getAllFieldInfos(a);
                            return this.queryRelatedInfos(b, a)
                        };
                        m.prototype._getChartOption = function (a) {
                            var b = a.value, d = a.attributes, f = a.formattedAttributes,
                                g = a.fieldName, e = a.relatedFieldName, m = a.fieldInfos;
                            a = r.getSourceLayer(this.graphic);
                            var h = b.normalizeField, c = b.tooltipField,
                                h = h ? this.isRelatedField(h) ? d[this.getRelatedFieldInfo(h).fieldName] : d[h] : null,
                                b = e && void 0 !== d[e] ? d[e] : void 0 !== d[g] ? d[g] : f[g],
                                b = "string" === typeof b && k.group ? parseFloat(b.replace(A, "")) : b,
                                l = void 0 === b ? null : b && h ? b / h : b, b = {y: l};
                            if (this.isRelatedField(g)) return f = this.getRelatedFieldInfo(g), g = (g = this.getRelatedFieldInfo(c)) ? g.fieldName : null, a = this._formatValue(l, {
                                fieldInfos: m, fieldName: e,
                                layer: a, preventPlacesFormatting: !!h
                            }), e = f ? f.label || f.fieldName : e, b.tooltip = (g && void 0 !== d[g] ? d[g] : e) + ": " + a, b;
                            d = this._getFieldInfo(m, g);
                            e = this._getFixedFieldName(g, a);
                            d = d ? d.label || d.fieldName : g;
                            b.tooltip = (c && void 0 !== f[c] ? f[c] : d) + ": " + f[e];
                            return b
                        };
                        m.prototype._getFixedFieldName = function (a, b) {
                            return (b = y(b, a)) ? b.name : a
                        };
                        m.prototype._getFixedFieldNames = function (a, b) {
                            var d = this;
                            return a && a.map(function (a) {
                                return d._getFixedFieldName(a, b)
                            })
                        };
                        m.prototype._setChartValue = function (a) {
                            var b = this, d = a.value,
                                g = a.attributes, e = a.formattedAttributes, m = a.layer, h = this.graphic,
                                c = this.relatedInfoCount;
                            a = d.fields;
                            var l = d.normalizeField;
                            d.fields = this._getFixedFieldNames(a, m);
                            l && (d.normalizeField = this._getFixedFieldName(l, m));
                            if (a.some(function (a) {
                                    return !!(f.isDefined(e[a]) || b.isRelatedField(a) && c)
                                })) {
                                var q = (m = h.getEffectivePopupTemplate()) && m.fieldInfos;
                                d.chartOptions = d.chartOptions || [];
                                a.forEach(function (a) {
                                    b.isRelatedField(a) ? d.chartOptions = d.chartOptions.concat(b._getRelatedChartInfos({
                                        fieldInfos: q, fieldName: a,
                                        formattedAttributes: e, value: d
                                    })) : (a = b._getChartOption({
                                        value: d,
                                        attributes: g,
                                        formattedAttributes: e,
                                        fieldName: a,
                                        fieldInfos: q
                                    }), d.chartOptions.push(a))
                                })
                            }
                        };
                        m.prototype._getRelatedChartInfos = function (a) {
                            var b = this, d = a.fieldInfos, f = a.fieldName, g = a.formattedAttributes, e = a.value,
                                m = [];
                            a = this.getRelatedFieldInfo(f);
                            var h = a.fieldName, c = this.getRelatedInfo(a.layerId);
                            if (!c) return m;
                            a = c.relatedFeatures;
                            c = c.relation;
                            if (!c || !a) return m;
                            c = c.cardinality;
                            a.forEach(function (a) {
                                var c = a.attributes;
                                c && Object.keys(c).forEach(function (a) {
                                    a ===
                                    h && m.push(b._getChartOption({
                                        value: e,
                                        attributes: c,
                                        formattedAttributes: g,
                                        fieldName: f,
                                        relatedFieldName: a,
                                        fieldInfos: d
                                    }))
                                })
                            });
                            return "one-to-many" === c || "many-to-many" === c ? m : [m[0]]
                        };
                        a([t.property({readOnly: !0})], m.prototype, "content", void 0);
                        a([t.property()], m.prototype, "contentEnabled", void 0);
                        a([t.property({readOnly: !0})], m.prototype, "formattedAttributes", void 0);
                        a([t.property({type: h})], m.prototype, "graphic", null);
                        a([t.property({readOnly: !0})], m.prototype, "title", void 0);
                        a([t.property()], m.prototype,
                            "view", void 0);
                        a([t.property({readOnly: !0})], m.prototype, "waitingForContent", null);
                        return m = a([t.subclass("esri.widgets.FeatureViewModel")], m)
                    }(t.declared(x))
                })
        }, "esri/widgets/Feature/support/featureUtils": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.getSourceLayer = function (e) {
                    if (e) return e.get("sourceLayer") || e.get("layer")
                }
            })
        }, "esri/widgets/Feature/support/RelatedFeatures": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../request ../../../core/Accessor ../../../core/Error ../../../core/Logger ../../../core/promiseUtils ../../../core/accessorSupport/decorators ../../../tasks/QueryTask ../../../tasks/support/Query ../../../tasks/support/StatisticDefinition ./featureUtils".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p) {
                    var t = new Map, u = g.getLogger("esri.widgets.Popup.support.RelatedFeatures");
                    return function (g) {
                        function c(a) {
                            a = g.call(this) || this;
                            a.relatedInfoCount = null;
                            a.relatedInfos = new Map;
                            return a
                        }

                        e(c, g);
                        c.prototype.destroy = function () {
                            this.relatedInfos.clear()
                        };
                        c.prototype.addRelatedFeatureAttributes = function (a) {
                            var b = this;
                            this.relatedInfos.forEach(function (d) {
                                return b._addRelatedFeatureAttribute(a, d)
                            })
                        };
                        c.prototype.getRelatedFieldInfo = function (a) {
                            if (-1 === a.indexOf("relationships/")) return null;
                            a = a.split("/").slice(1);
                            return {layerId: a[0], fieldName: a[1]}
                        };
                        c.prototype.getRelatedInfo = function (a) {
                            return this.relatedInfos.get(a.toString())
                        };
                        c.prototype.isRelatedField = function (a) {
                            void 0 === a && (a = "");
                            return a ? -1 !== a.indexOf("relationships/") : !1
                        };
                        c.prototype.queryRelatedInfos = function (a, d) {
                            var f = this;
                            this.relatedInfos.clear();
                            var g = p.getSourceLayer(a);
                            if (!g) return b.resolve();
                            var e = d.filter(function (a) {
                                return a && f.isRelatedField(a.fieldName)
                            });
                            if (!e || !e.length) return b.resolve();
                            this._createRelatedInfos(d,
                                g);
                            return this._queryLayerInfos(g, d).then(function (b) {
                                f._updateRelatedInfoLayerInfos(b);
                                return f._queryRelatedFeatureMap(a).then(function (a) {
                                    Object.keys(a).forEach(function (b) {
                                        f._setRelatedFeatures(a[b], b.toString())
                                    });
                                    return a
                                })
                            })
                        };
                        c.prototype._addRelatedFeatureAttribute = function (a, b) {
                            var d = this;
                            a && b && ("one-to-one" === b.relation.cardinality && b.relatedFeatures && b.relatedFeatures.forEach(function (f) {
                                return d._addAttributesFromFeature(a, f, b)
                            }), b.relatedStatsFeatures && b.relatedStatsFeatures.forEach(function (f) {
                                return d._addAttributesFromFeature(a,
                                    f, b)
                            }))
                        };
                        c.prototype._updateRelatedInfoLayerInfo = function (a, b) {
                            if (a = a.value) this.getRelatedInfo(b).layerInfo = a.data
                        };
                        c.prototype._updateRelatedInfoLayerInfos = function (a) {
                            var b = this;
                            Object.keys(a).forEach(function (d) {
                                return b._updateRelatedInfoLayerInfo(a[d], d.toString())
                            })
                        };
                        c.prototype._addAttributesFromFeature = function (a, b, d) {
                            var f = this;
                            a && b && d && Object.keys(b.attributes).forEach(function (g) {
                                var e = f._relatedFieldInfoToString({layerId: d.relation.id.toString(), fieldName: g});
                                a[e] = b.attributes[g]
                            })
                        };
                        c.prototype._relatedFieldInfoToString = function (a) {
                            return a ? "relationships/" + a.layerId + "/" + a.fieldName : ""
                        };
                        c.prototype._createRelatedInfoForFieldInfo = function (a, b) {
                            var d = this.getRelatedFieldInfo(a.fieldName);
                            if (d) {
                                var f = d.layerId, d = d.fieldName;
                                f && (b = this.getRelatedInfo(f) || this._createRelatedInfo(f, b)) && (b.relatedFields.push(d), a.statisticType && (a = new q({
                                    statisticType: a.statisticType,
                                    onStatisticField: d,
                                    outStatisticFieldName: d
                                }), b.outStatistics.push(a)))
                            }
                        };
                        c.prototype._createRelatedInfos = function (a,
                                                                    b) {
                            var d = this;
                            a.forEach(function (a) {
                                return d._createRelatedInfoForFieldInfo(a, b)
                            })
                        };
                        c.prototype._queryRelatedFeatureMap = function (a) {
                            var d = this, f = {};
                            this.relatedInfos.forEach(function (b, g) {
                                f[g] = d._queryRelatedLayerFeatures(a, b)
                            });
                            return b.eachAlways(f)
                        };
                        c.prototype._queryLayerInfos = function (a, d) {
                            var f = this, g = {};
                            this.relatedInfos.forEach(function (d, e) {
                                d = d.relation;
                                if (!d) return e = new h("relation-required", "A relation is required on a layer to retrieve related records."), u.error(e), b.reject(e);
                                d = d.relatedTableId;
                                if (!d) return e = new h("A related table ID is required on a layer to retrieve related records."), u.error(e), b.reject(e);
                                d = a.url + "/" + d;
                                var m = t.get(d), c = m ? m : f._queryLayerInfo(d);
                                m || t.set(d, c);
                                g[e] = c
                            });
                            return b.eachAlways(g)
                        };
                        c.prototype._queryLayerInfo = function (a) {
                            return l(a, {query: {f: "json"}, callbackParamName: "callback"})
                        };
                        c.prototype._queryRelatedLayerFeatures = function (a, d) {
                            var f = p.getSourceLayer(a).layerId.toString(), g = d.layerInfo, e = d.queryTask,
                                h = d.relation;
                            if (f = this._getDestinationRelation(g, f)) {
                                var h =
                                        h.keyField, c = f.keyField,
                                    f = "string" === this._getDestinationFieldType(g, f) ? c + "\x3d'" + a.attributes[h] + "'" : c + "\x3d" + a.attributes[h];
                                a = e.execute(new m({where: f, outFields: d.relatedFields}));
                                d = d.outStatistics && 0 < d.outStatistics.length && g.supportsStatistics ? e.execute(new m({
                                    where: f,
                                    outFields: d.relatedFields,
                                    outStatistics: d.outStatistics
                                })) : null;
                                return b.eachAlways({features: a, statsFeatures: d ? d : b.resolve()})
                            }
                            return b.resolve()
                        };
                        c.prototype._setRelatedFeatures = function (a, b) {
                            if (b = this.getRelatedInfo(b)) {
                                var d =
                                    a.value;
                                d && (a = d.features, d = d.statsFeatures, a = a && a.value, b.relatedFeatures = a ? a.features : [], a = d && d.value, b.relatedStatsFeatures = a ? a.features : [])
                            }
                        };
                        c.prototype._getRelation = function (a, b) {
                            if ("feature" !== b.type) return null;
                            var d = null;
                            b.relationships.some(function (b) {
                                if (b.id === parseInt(a, 10)) return d = b, !0
                            });
                            return d
                        };
                        c.prototype._createRelatedInfo = function (a, b) {
                            var d = this._getRelation(a, b);
                            if (d) {
                                b = b.url + "/" + d.relatedTableId;
                                var g = new f({url: b}),
                                    d = {url: b, queryTask: g, relation: d, relatedFields: [], outStatistics: []};
                                this.relatedInfos.set(a, d);
                                return d
                            }
                        };
                        c.prototype._getDestinationRelation = function (a, b) {
                            var d;
                            a && a.relationships && a.relationships.some(function (a) {
                                if ("" + a.relatedTableId === b) return d = a, !0
                            });
                            return d
                        };
                        c.prototype._getDestinationFieldType = function (a, b) {
                            var d = void 0;
                            a.fields.some(function (a) {
                                if (a.name === b.keyField) return d = -1 !== ["esriFieldTypeSmallInteger", "esriFieldTypeInteger", "esriFieldTypeSingle", "esriFieldTypeDouble"].indexOf(a.type) ? "number" : "string", !0
                            });
                            return d
                        };
                        a([d.aliasOf("relatedInfos.size")],
                            c.prototype, "relatedInfoCount", void 0);
                        a([d.property()], c.prototype, "relatedInfos", void 0);
                        return c = a([d.subclass("esri.widgets.Popup.support.RelatedFeatures")], c)
                    }(d.declared(k))
                })
        }, "esri/widgets/Feature/support/attachmentUtils": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var e = n.toUrl("../../../themes/base/images/files/");
                c.isSupportedImage = function (a) {
                    a = a.toLowerCase();
                    return "image/bmp" === a || "image/emf" === a || "image/exif" === a || "image/gif" ===
                        a || "image/x-icon" === a || "image/jpeg" === a || "image/png" === a || "image/tiff" === a || "image/x-wmf" === a
                };
                c.getIconPath = function (a) {
                    return "text/plain" === a ? e + "text-32.svg" : "application/pdf" === a ? e + "pdf-32.svg" : "text/csv" === a ? e + "csv-32.svg" : "application/gpx+xml" === a ? e + "gpx-32.svg" : "application/x-dwf" === a ? e + "cad-32.svg" : "application/postscript" === a || "application/json" === a || "text/xml" === a || "model/vrml" === a ? e + "code-32.svg" : "application/x-zip-compressed" === a || "application/x-7z-compressed" === a || "application/x-gzip" ===
                    a || "application/x-tar" === a || "application/x-gtar" === a || "application/x-bzip2" === a || "application/gzip" === a || "application/x-compress" === a || "application/x-apple-diskimage" === a || "application/x-rar-compressed" === a || "application/zip" === a ? e + "zip-32.svg" : -1 !== a.indexOf("image/") ? e + "image-32.svg" : -1 !== a.indexOf("audio/") ? e + "sound-32.svg" : -1 !== a.indexOf("video/") ? e + "video-32.svg" : -1 !== a.indexOf("msexcel") || -1 !== a.indexOf("ms-excel") || -1 !== a.indexOf("spreadsheetml") ? e + "excel-32.svg" : -1 !== a.indexOf("msword") ||
                    -1 !== a.indexOf("ms-word") || -1 !== a.indexOf("wordprocessingml") ? e + "word-32.svg" : -1 !== a.indexOf("powerpoint") || -1 !== a.indexOf("presentationml") ? e + "report-32.svg" : e + "generic-32.svg"
                }
            })
        }, "esri/widgets/support/uriUtils": function () {
            define(["require", "exports", "dojo/i18n!./nls/uriUtils", "../../core/lang"], function (n, c, e, a) {
                function l(a) {
                    var g = null;
                    k.some(function (b) {
                        b.pattern.test(a) && (g = b);
                        return !!g
                    });
                    return g
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                var k = [{
                    id: "http", pattern: /^\s*(https?:\/\/([^\s]+))\s*$/i,
                    target: "_blank", label: e.view
                }, {id: "tel", pattern: /^\s*(tel:([^\s]+))\s*$/i, label: "{hierPart}"}, {
                    id: "mailto",
                    pattern: /^\s*(mailto:([^\s]+))\s*$/i,
                    label: "{hierPart}"
                }, {
                    id: "arcgis-appstudio-player",
                    pattern: /^\s*(arcgis-appstudio-player:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp,
                    appName: "App Studio Player"
                }, {
                    id: "arcgis-collector",
                    pattern: /^\s*(arcgis-collector:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp,
                    appName: "Collector"
                }, {
                    id: "arcgis-explorer", pattern: /^\s*(arcgis-explorer:\/\/([^\s]+))\s*$/i, label: e.openInApp,
                    appName: "Explorer"
                }, {
                    id: "arcgis-navigator",
                    pattern: /^\s*(arcgis-navigator:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp,
                    appName: "Navigator"
                }, {
                    id: "arcgis-survey123",
                    pattern: /^\s*(arcgis-survey123:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp,
                    appName: "Survey123"
                }, {
                    id: "arcgis-trek2there",
                    pattern: /^\s*(arcgis-trek2there:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp,
                    appName: "Trek2There"
                }, {
                    id: "arcgis-workforce",
                    pattern: /^\s*(arcgis-workforce:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp,
                    appName: e.workforce
                }, {
                    id: "iform", pattern: /^\s*(iform:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp, appName: "iForm"
                }, {
                    id: "flow",
                    pattern: /^\s*(flow:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp,
                    appName: "FlowFinity"
                }, {
                    id: "lfmobile",
                    pattern: /^\s*(lfmobile:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp,
                    appName: "Laserfische"
                }, {
                    id: "mspbi",
                    pattern: /^\s*(mspbi:\/\/([^\s]+))\s*$/i,
                    label: e.openInApp,
                    appName: "Microsoft Power Bi"
                }];
                c.autoLink = function (e) {
                    if ("string" !== typeof e || !e) return e;
                    var g = l(e);
                    if (!g) return e;
                    var b = e.match(g.pattern), b = a.substitute({appName: g.appName, hierPart: b && b[2]}, g.label);
                    return e.replace(g.pattern,
                        "\x3ca " + (g.target ? 'target\x3d"' + g.target + '"' : "") + '" href\x3d"$1"\x3e' + b + "\x3c/a\x3e")
                }
            })
        }, "esri/widgets/Spinner": function () {
            define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper ../core/promiseUtils ../core/watchUtils ../core/accessorSupport/decorators ./Widget ./support/AnchorElementViewModel ./support/widget".split(" "), function (n, c, e, a, l, k, h, g, b, d) {
                return function (f) {
                    function g(a) {
                        a = f.call(this) || this;
                        a._animationDelay = 500;
                        a._animationPromise = null;
                        a.location =
                            null;
                        a.view = null;
                        a.visible = !1;
                        a.viewModel = new b;
                        return a
                    }

                    e(g, f);
                    g.prototype.postInitialize = function () {
                        var a = this;
                        this.own([k.watch(this, "visible", function (b) {
                            return a._visibleChange(b)
                        })])
                    };
                    g.prototype.destroy = function () {
                        this._cancelAnimationPromise()
                    };
                    g.prototype.show = function (a) {
                        var b = this, d = a.location;
                        a = a.promise;
                        d && (this.viewModel.location = d);
                        this.visible = !0;
                        d = function () {
                            return b.hide()
                        };
                        a && a.catch(function () {
                        }).then(d)
                    };
                    g.prototype.hide = function () {
                        this.visible = !1
                    };
                    g.prototype.render = function () {
                        var a,
                            b = this.visible, f = !!this.viewModel.screenLocation,
                            b = (a = {}, a["esri-spinner--start"] = b && f, a["esri-spinner--finish"] = !b && f, a);
                        a = this._getPositionStyles();
                        return d.tsx("div", {class: this.classes("esri-spinner", b), styles: a})
                    };
                    g.prototype._cancelAnimationPromise = function () {
                        var a = this._animationPromise;
                        a && a.cancel();
                        this._animationPromise = null
                    };
                    g.prototype._visibleChange = function (a) {
                        var b = this;
                        a ? this.viewModel.screenLocationEnabled = !0 : (this._cancelAnimationPromise(), this._animationPromise = l.after(this._animationDelay).then(function () {
                            b.viewModel.screenLocationEnabled =
                                !1;
                            b._animationPromise = null
                        }))
                    };
                    g.prototype._getPositionStyles = function () {
                        var a = this.viewModel, b = a.screenLocation, a = a.view;
                        if (!a || !b) return {};
                        a = a.padding;
                        return {left: b.x - a.left + "px", top: b.y - a.top + "px"}
                    };
                    a([h.aliasOf("viewModel.location")], g.prototype, "location", void 0);
                    a([h.aliasOf("viewModel.view")], g.prototype, "view", void 0);
                    a([h.property(), d.renderable()], g.prototype, "visible", void 0);
                    a([h.property({type: b}), d.renderable(["viewModel.screenLocation", "viewModel.screenLocationEnabled"])], g.prototype,
                        "viewModel", void 0);
                    return g = a([h.subclass("esri.widgets.Spinner")], g)
                }(h.declared(g))
            })
        }, "esri/widgets/support/AnchorElementViewModel": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/Evented ../../core/Handles ../../core/watchUtils ../../core/watchUtils ../../core/accessorSupport/decorators".split(" "), function (n, c, e, a, l, k, h, g, b, d) {
                return function (f) {
                    function m() {
                        var a = f.call(this) || this;
                        a._anchorHandles =
                            new h;
                        a.location = null;
                        a.screenLocation = null;
                        a.screenLocationEnabled = !1;
                        a.view = null;
                        a._anchorHandles.add([b.watch(a, "screenLocationEnabled,location,view.size", function () {
                            return a._updateScreenPointAndHandle()
                        }), b.watch(a, "view, view.ready", function () {
                            return a._wireUpView()
                        })]);
                        return a
                    }

                    e(m, f);
                    m.prototype.destroy = function () {
                        this.view = null;
                        this._anchorHandles && this._anchorHandles.destroy();
                        this._viewpointHandle = this._anchorHandles = null
                    };
                    m.prototype._wireUpView = function () {
                        var a = this;
                        this._anchorHandles.remove("view");
                        this._viewpointHandle = null;
                        if (this.get("view.ready")) {
                            this._setScreenLocation();
                            var b = this.view, b = g.pausable(b, "3d" === b.type ? "camera" : "viewpoint", function () {
                                return a._viewpointChange()
                            });
                            this._anchorHandles.add(b, "view");
                            this._viewpointHandle = b;
                            this._toggleWatchingViewpoint()
                        }
                    };
                    m.prototype._viewpointChange = function () {
                        this._setScreenLocation();
                        this.emit("view-change")
                    };
                    m.prototype._updateScreenPointAndHandle = function () {
                        this._setScreenLocation();
                        this._toggleWatchingViewpoint()
                    };
                    m.prototype._toggleWatchingViewpoint =
                        function () {
                            var a = this._viewpointHandle, b = this.screenLocationEnabled;
                            a && (this.location && b ? a.resume() : a.pause())
                        };
                    m.prototype._setScreenLocation = function () {
                        var a = this.location, b = this.view, d = this.screenLocationEnabled,
                            f = this.get("view.ready"), a = d && a && f ? b.toScreen(a) : null;
                        this._set("screenLocation", a)
                    };
                    a([d.property()], m.prototype, "location", void 0);
                    a([d.property({readOnly: !0})], m.prototype, "screenLocation", void 0);
                    a([d.property()], m.prototype, "screenLocationEnabled", void 0);
                    a([d.property()], m.prototype,
                        "view", void 0);
                    return m = a([d.subclass("esri.widgets.support.AnchorElementViewModel")], m)
                }(d.declared(l, k))
            })
        }, "esri/widgets/Popup/PopupViewModel": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/tsSupport/assignHelper ../../core/Collection ../../core/Error ../../core/Handles ../../core/Logger ../../core/promiseUtils ../../core/watchUtils ../../core/accessorSupport/decorators ../../geometry/Point ../../geometry/support/webMercatorUtils ../../support/actions/ActionBase ../../support/actions/ActionButton ../../support/actions/ActionToggle ../support/AnchorElementViewModel ../support/GoTo".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u, r, x, v) {
                    function y(a, b) {
                        return b.allLayerViews.find(function (b) {
                            return b.layer === a
                        })
                    }

                    var w = new u({id: "zoom-to"}), z = k.ofType({
                        key: "type",
                        defaultKeyValue: "button",
                        base: t,
                        typeMap: {button: u, toggle: r}
                    }), B = new z([w]), A = b.getLogger("esri.widgets.Popup.PopupViewModel");
                    return function (b) {
                        function c(a) {
                            a = b.call(this) || this;
                            a._handles = new g;
                            a._pendingPromises = new Set;
                            a._zoomToLocation = null;
                            a.actions = B;
                            a.autoCloseEnabled = !1;
                            a.content = null;
                            a.highlightEnabled = !0;
                            a.title =
                                null;
                            a.updateLocationEnabled = !1;
                            a.view = null;
                            a.visible = !1;
                            a.zoomFactor = 4;
                            return a
                        }

                        e(c, b);
                        c.prototype.initialize = function () {
                            var a = this;
                            this._handles.add([this.on("view-change", this._autoClose), f.watch(this, ["highlightEnabled", "selectedFeature", "visible", "view"], this._highlightFeature), f.watch(this, "view.animation.state", function (b) {
                                a._zoomToLocation || (w.disabled = "waiting-for-target" === b)
                            })])
                        };
                        c.prototype.destroy = function () {
                            this._handles.destroy();
                            this._handles = null;
                            this._pendingPromises.clear();
                            this.view =
                                null
                        };
                        Object.defineProperty(c.prototype, "allActions", {
                            get: function () {
                                var a = this._get("allActions") || new z;
                                a.removeAll();
                                var b = this.selectedFeature && ("function" === typeof this.selectedFeature.getEffectivePopupTemplate && this.selectedFeature.getEffectivePopupTemplate() || this.selectedFeature.popupTemplate),
                                    d = b && b.actions;
                                (b = b && b.overwriteActions ? d : this.actions.concat(d)) && b.filter(Boolean).forEach(function (b) {
                                    return a.add(b)
                                });
                                return a
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype,
                            "featureCount", {
                                get: function () {
                                    return this.features.length
                                }, enumerable: !0, configurable: !0
                            });
                        Object.defineProperty(c.prototype, "features", {
                            get: function () {
                                return this._get("features") || []
                            }, set: function (a) {
                                a = a || [];
                                this._set("features", a);
                                var b = this.pendingPromisesCount, d = this.selectedFeatureIndex,
                                    f = this.promiseCount && a.length;
                                f && b && -1 === d ? this.selectedFeatureIndex = 0 : f && -1 !== d || (this.selectedFeatureIndex = a.length ? 0 : -1)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "location", {
                            get: function () {
                                return this._get("location") ||
                                    null
                            }, set: function (a) {
                                var b = this.get("location"), d = this.get("view.spatialReference.isWebMercator");
                                a && a.get("spatialReference.isWGS84") && d && (a = p.geographicToWebMercator(a));
                                this._set("location", a);
                                a !== b && this._centerAtLocation()
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "pendingPromisesCount", {
                            get: function () {
                                return this._pendingPromises.size
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "waitingForResult", {
                            get: function () {
                                return 0 < this.pendingPromisesCount &&
                                    0 === this.featureCount
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "promiseCount", {
                            get: function () {
                                return this.promises.length
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "promises", {
                            get: function () {
                                return this._get("promises") || []
                            }, set: function (a) {
                                var b = this, d = this._get("promises");
                                d && d.forEach(function (a) {
                                    a && "function" === typeof a.cancel && a.cancel()
                                });
                                this._pendingPromises.clear();
                                this.features = [];
                                Array.isArray(a) && a.length ? (this._set("promises", a), a = a.slice(0),
                                    a.forEach(function (a) {
                                        b._pendingPromises.add(a);
                                        a.then(function (d) {
                                            b._updatePendingPromises(a);
                                            b._updateFeatures(d)
                                        }, function () {
                                            return b._updatePendingPromises(a)
                                        })
                                    })) : this._set("promises", []);
                                this.notifyChange("pendingPromisesCount")
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "selectedFeature", {
                            get: function () {
                                var a = this.selectedFeatureIndex;
                                if (-1 === a) return null;
                                a = this.features[a];
                                if (!a) return null;
                                this.updateLocationEnabled && (this.location = this._getPointFromGeometry(a.geometry));
                                return a
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "selectedFeatureIndex", {
                            get: function () {
                                var a = this._get("selectedFeatureIndex");
                                return "number" === typeof a ? a : -1
                            }, set: function (a) {
                                var b = this.featureCount;
                                a = isNaN(a) || -1 > a || !b ? -1 : (a + b) % b;
                                this._set("selectedFeatureIndex", a)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "state", {
                            get: function () {
                                return this.get("view.ready") ? "ready" : "disabled"
                            }, enumerable: !0, configurable: !0
                        });
                        c.prototype.centerAtLocation = function () {
                            var a =
                                this.location, b = this.view;
                            return a && b ? this.callGoTo({
                                target: {
                                    target: a,
                                    scale: b.scale
                                }
                            }) : (a = new h("center-at-location:invalid-location-or-view", "Cannot center at a location without a location and view.", {
                                location: a,
                                view: b
                            }), A.error(a), d.reject(a))
                        };
                        c.prototype.clear = function () {
                            this.set({promises: [], features: [], content: null, title: null, location: null})
                        };
                        c.prototype.open = function (a) {
                            this.set(l({visible: !1}, {updateLocationEnabled: !1, promises: []}, a));
                            this._setVisibleWhenContentExists()
                        };
                        c.prototype.triggerAction =
                            function (a) {
                                (a = this.allActions.getItemAt(a)) && this.emit("trigger-action", {action: a})
                            };
                        c.prototype.next = function () {
                            this.selectedFeatureIndex += 1;
                            return this
                        };
                        c.prototype.previous = function () {
                            --this.selectedFeatureIndex;
                            return this
                        };
                        c.prototype.zoomToLocation = function () {
                            var a = this, b = this.location, f = this.selectedFeature, g = this.view,
                                e = this.zoomFactor;
                            if (!b || !g) return f = new h("zoom-to:invalid-location-or-view", "Cannot zoom to location without a location and view.", {
                                location: b,
                                view: g
                            }), A.error(f), d.reject(f);
                            var e = g.scale / e, m = this.get("selectedFeature.geometry"), g = f && "3d" === g.type,
                                b = (g = m || g) ? f : b, c = g && m && "point" === m.type && this._isScreenSize(f),
                                f = {target: b, scale: c ? e : void 0};
                            w.active = !0;
                            w.disabled = !0;
                            return this._zoomToLocation = f = this.callGoTo({target: f}).then(function () {
                                c && "point" === m.type && (a.location = m);
                                w.active = !1;
                                w.disabled = !1;
                                a._zoomToLocation = null
                            }).catch(function () {
                                w.active = !1;
                                w.disabled = !1;
                                a._zoomToLocation = null
                            })
                        };
                        c.prototype._updatePendingPromises = function (a) {
                            a && this._pendingPromises.has(a) &&
                            (this._pendingPromises.delete(a), this.notifyChange("pendingPromisesCount"))
                        };
                        c.prototype._setVisibleWhenContentExists = function () {
                            var a = this, b = this._handles, d = this.promiseCount;
                            b.remove("pendingVisible");
                            d ? (d = f.init(this, "pendingPromisesCount", function (d) {
                                a.featureCount && (a.set("visible", !0), b.remove("pendingVisible"));
                                d || b.remove("pendingVisible")
                            }), b.add(d, "pendingVisible")) : this.set("visible", !0)
                        };
                        c.prototype._autoClose = function () {
                            this.autoCloseEnabled && (this.visible = !1)
                        };
                        c.prototype._isScreenSize =
                            function (a) {
                                var b = this.view;
                                if ("3d" !== b.type || "esri.Graphic" !== a.declaredClass) return !0;
                                if ((b = b.getViewForGraphic(a)) && b.whenGraphicBounds) {
                                    var d = !1;
                                    b.whenGraphicBounds(a, {useViewElevation: !0}).then(function (a) {
                                        d = !a || !a.boundingBox || a.boundingBox[0] === a.boundingBox[3] && a.boundingBox[1] === a.boundingBox[4] && a.boundingBox[2] === a.boundingBox[5]
                                    });
                                    return d
                                }
                                return !0
                            };
                        c.prototype._getPointFromGeometry = function (a) {
                            return a ? "point" === a.type ? a : "extent" === a.type ? a.center : "polygon" === a.type ? a.centroid : "multipoint" ===
                            a.type || "polyline" === a.type ? a.extent.center : null : null
                        };
                        c.prototype._centerAtLocation = function () {
                            var a = this.location, b = this.updateLocationEnabled, d = this.get("view.extent");
                            b && d && a && !d.contains(a) && this.centerAtLocation()
                        };
                        c.prototype._highlightFeature = function () {
                            this._handles.remove("highlight");
                            var a = this.selectedFeature, b = this.highlightEnabled, d = this.view, f = this.visible;
                            a && d && b && f && (b = a.layer) && (d = y(b, d)) && "function" === typeof d.highlight && (b = b.objectIdField, f = a.attributes, a = d.highlight(f && f[b] ||
                                a, {}), this._handles.add(a, "highlight"))
                        };
                        c.prototype._updateFeatures = function (a) {
                            var b = this.features;
                            a && a.length && (b.length ? (a = a.filter(function (a) {
                                return -1 === b.indexOf(a)
                            }), this.features = b.concat(a)) : this.features = a)
                        };
                        a([m.property({type: z})], c.prototype, "actions", void 0);
                        a([m.property({
                            dependsOn: ["actions.length", "selectedFeature.sourceLayer.popupTemplate.actions.length", "selectedFeature.sourceLayer.popupTemplate.overwriteActions", "selectedFeature.popupTemplate.actions.length", "selectedFeature.popupTemplate.overwriteActions"],
                            readOnly: !0
                        })], c.prototype, "allActions", null);
                        a([m.property()], c.prototype, "autoCloseEnabled", void 0);
                        a([m.property()], c.prototype, "content", void 0);
                        a([m.property({readOnly: !0, dependsOn: ["features"]})], c.prototype, "featureCount", null);
                        a([m.property()], c.prototype, "features", null);
                        a([m.property()], c.prototype, "highlightEnabled", void 0);
                        a([m.property({type: q})], c.prototype, "location", null);
                        a([m.property({
                            readOnly: !0,
                            dependsOn: ["promises"]
                        })], c.prototype, "pendingPromisesCount", null);
                        a([m.property({
                            readOnly: !0,
                            dependsOn: ["featureCount", "pendingPromisesCount"]
                        })], c.prototype, "waitingForResult", null);
                        a([m.property({readOnly: !0, dependsOn: ["promises"]})], c.prototype, "promiseCount", null);
                        a([m.property()], c.prototype, "promises", null);
                        a([m.property({
                            value: null,
                            readOnly: !0,
                            dependsOn: ["features", "selectedFeatureIndex", "updateLocationEnabled"]
                        })], c.prototype, "selectedFeature", null);
                        a([m.property({value: -1})], c.prototype, "selectedFeatureIndex", null);
                        a([m.property({readOnly: !0, dependsOn: ["view.ready"]})], c.prototype,
                            "state", null);
                        a([m.property()], c.prototype, "title", void 0);
                        a([m.property()], c.prototype, "updateLocationEnabled", void 0);
                        a([m.property()], c.prototype, "view", void 0);
                        a([m.property()], c.prototype, "visible", void 0);
                        a([m.property()], c.prototype, "zoomFactor", void 0);
                        a([m.property()], c.prototype, "centerAtLocation", null);
                        a([m.property()], c.prototype, "clear", null);
                        a([m.property()], c.prototype, "triggerAction", null);
                        a([m.property()], c.prototype, "next", null);
                        a([m.property()], c.prototype, "previous", null);
                        a([m.property()],
                            c.prototype, "zoomToLocation", null);
                        return c = a([m.subclass("esri.widgets.Popup.PopupViewModel")], c)
                    }(m.declared(x, v))
                })
        }, "esri/widgets/support/GoTo": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/accessorSupport/decorators".split(" "), function (n, c, e, a, l, k) {
                return function (c) {
                    function g() {
                        var a = null !== c && c.apply(this, arguments) || this;
                        a.goToOverride = null;
                        a.view = null;
                        return a
                    }

                    e(g, c);
                    g.prototype.callGoTo = function (a) {
                        var b =
                            this.view;
                        return this.goToOverride ? this.goToOverride(b, a) : b.goTo(a.target, a.options)
                    };
                    a([k.property()], g.prototype, "goToOverride", void 0);
                    a([k.property()], g.prototype, "view", void 0);
                    return g = a([k.subclass("esri.widgets.support.GoTo")], g)
                }(k.declared(l))
            })
        }, "esri/views/MapViewBase": function () {
            define("require exports ../core/tsSupport/assignHelper ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper ../geometry ../Viewpoint ../core/Error ../core/Handles ../core/Logger ../core/promiseUtils ../core/accessorSupport/decorators ../geometry/support/webMercatorUtils ./View ./ViewAnimation ./2d/AnimationManager ./2d/FrameTask ./2d/LabelManager ./2d/MapViewConstraints ./2d/PaddedViewState ./2d/viewpointUtils".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u, r, x, v, y, w) {
                    var z = d.getLogger("esri.views.MapView");
                    return function (d) {
                        function c(a) {
                            var f = d.call(this, a) || this;
                            f._frameTask = new r.default(f);
                            f._mapViewBaseHandles = new b;
                            f._setup = !1;
                            f.fullOpacity = 1;
                            f.interacting = !1;
                            f.initialExtent = null;
                            f.labelManager = new x.default({view: f});
                            f.resizeAlign = "center";
                            f.type = "2d";
                            f.constraints = new v;
                            f.padding = {top: 0, right: 0, bottom: 0, left: 0};
                            var g = function () {
                                this._set("updating", this.layerViewManager.factory.working || this.allLayerViews.some(function (a) {
                                    return !0 ===
                                        a.updating
                                }))
                            }.bind(f), e = f._mapViewBaseHandles;
                            a = function () {
                                this._set("updating", !0 === this.labelManager.updating)
                            }.bind(f);
                            e.add([f.watch("viewpoint", function (a) {
                                return f._flipStationary()
                            }, !0), f.on("resize", function (a) {
                                return f._resizeHandler(a)
                            }), f.watch("animationManager.animation", function (a) {
                                f.animation = a
                            }), f.allLayerViews.on("change", function () {
                                g();
                                e.remove("layerViewsUpdating");
                                e.add(f.allLayerViews.map(function (a) {
                                    return a.watch("updating", g)
                                }).toArray(), "layerViewsUpdating")
                            }), f.labelManager.watch("updating",
                                a)]);
                            f.watch("ready", function (a) {
                                a ? f._startup() : f._tearDown()
                            });
                            return f
                        }

                        a(c, d);
                        c.prototype.destroy = function () {
                            this.destroyed || (this._set("ready", !1), this.labelManager.destroy(), this._mapViewBaseHandles.removeAll(), this.layerViewManager.clear(), this._frameTask.destroy(), this._tearDown(), this._gotoTask = this._mapViewBaseHandles = this._frameTask = null)
                        };
                        Object.defineProperty(c.prototype, "animation", {
                            set: function (a) {
                                var b = this, d = this._get("animation");
                                a !== d && (d && d.stop(), !a || a.isFulfilled() ? this._set("animation",
                                    null) : (this._set("animation", a), d = function () {
                                    a === b._get("animation") && (b._set("animation", null), b._frameTask.requestFrame())
                                }, a.when(d, d, function (a) {
                                    b.state && (b.state.viewpoint = a)
                                })))
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "center", {
                            get: function () {
                                if (!this._setup) return this._get("center");
                                var a = this.content.center;
                                return new k.Point({x: a[0], y: a[1], spatialReference: this.content.spatialReference})
                            }, set: function (a) {
                                if (null != a) if (this._normalizeInput(a)) if (this._setup) {
                                    var b =
                                        this.viewpoint;
                                    w.centerAt(b, b, a);
                                    this.viewpoint = b
                                } else this._set("center", a), this.notifyChange("initialExtentRequired"); else z.error("#center", "incompatible spatialReference " + JSON.stringify(a.spatialReference) + " with view's spatialReference " + JSON.stringify(this.spatialReference))
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "constraints", {
                            set: function (a) {
                                var b = this, d = this._get("constraints");
                                d && (this._mapViewBaseHandles.remove("constraints"), d.destroy());
                                this._set("constraints",
                                    a);
                                a && (this._setup && (a.view = this, this.state.viewpoint = a.fit(this.content.viewpoint)), this._mapViewBaseHandles.add(a.on("update", function () {
                                    b._setup && b.state && (b.state.viewpoint = a.fit(b.content.viewpoint))
                                }), "constraints"))
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "extent", {
                            get: function () {
                                return this._setup ? this.content.extent.clone() : this._get("extent")
                            }, set: function (a) {
                                if (null != a) {
                                    var b = this._normalizeInput(a);
                                    b ? b.width && b.height ? this._setup ? (a = this.viewpoint, w.setExtent(a,
                                        a, b, this.size, {constraints: this.constraints}), this.viewpoint = a) : (this._set("extent", b), this._set("center", null), this._set("viewpoint", null), this._set("scale", 0), this._set("zoom", -1), this.notifyChange("initialExtentRequired")) : z.error("#extent", "invalid extent size") : z.error("#center", "incompatible spatialReference " + JSON.stringify(a.spatialReference) + " with view's spatialReference " + JSON.stringify(this.spatialReference))
                                }
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "initialExtentRequired",
                            {
                                get: function () {
                                    var a = this.extent, b = this.center, d = this.scale, f = this.viewpoint,
                                        g = this.zoom;
                                    return this.get("map.initialViewProperties.viewpoint") || a || b && (0 !== d || -1 !== g) || f ? !1 : !0
                                }, enumerable: !0, configurable: !0
                            });
                        Object.defineProperty(c.prototype, "padding", {
                            get: function () {
                                return this._setup ? this.state.padding : this._get("padding")
                            }, set: function (a) {
                                this._setup ? (this.state.padding = a, this._set("padding", this.state.padding)) : this._set("padding", a)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype,
                            "rotation", {
                                get: function () {
                                    return this._setup ? this.content.rotation : this._get("rotation")
                                }, set: function (a) {
                                    if (!isNaN(a)) if (this._setup) {
                                        var b = this.viewpoint;
                                        w.rotateTo(b, b, a);
                                        this.viewpoint = b
                                    } else this._set("rotation", a)
                                }, enumerable: !0, configurable: !0
                            });
                        Object.defineProperty(c.prototype, "scale", {
                            get: function () {
                                return this._setup ? this.content.scale : this._get("scale")
                            }, set: function (a) {
                                if (a && !isNaN(a)) if (this._setup) {
                                    var b = this.viewpoint;
                                    w.scaleTo(b, b, a);
                                    this.viewpoint = b
                                } else {
                                    this._set("scale", a);
                                    this._set("zoom",
                                        -1);
                                    if (a = this._get("extent")) this._set("extent", null), this._set("center", a.center);
                                    this.notifyChange("initialExtentRequired")
                                }
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "stationary", {
                            get: function () {
                                return !this.animation && !this.interacting && !this._get("resizing") && !this._stationaryTimer
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "viewpoint", {
                            get: function () {
                                if (!this._setup) return this._get("viewpoint");
                                var a = this.content;
                                return a && a.viewpoint.clone()
                            },
                            set: function (a) {
                                if (null != a) {
                                    var b = this._normalizeInput(a);
                                    b ? this._setup ? (a = w.create(), w.copy(a, b), this.constraints.constrain(a, this.content.viewpoint), this.state.viewpoint = a, this._frameTask.requestFrame(), this._set("viewpoint", a)) : (this._set("viewpoint", b), this._set("extent", null), this._set("center", null), this._set("zoom", -1), this._set("scale", 0), this.notifyChange("initialExtentRequired")) : !a.scale || isNaN(a.scale) ? z.error("#viewpoint", "invalid scale value of " + a.scale) : a.targetGeometry ? z.error("#viewpoint",
                                        "incompatible spatialReference " + JSON.stringify(a.targetGeometry.spatialReference) + " with view's spatialReference " + JSON.stringify(this.spatialReference)) : z.error("#viewpoint", "geometry not defined")
                                }
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "zoom", {
                            get: function () {
                                return this._setup ? this.constraints.scaleToZoom(this.scale) : this._get("zoom")
                            }, set: function (a) {
                                if (null != a) {
                                    if (!this._setup) {
                                        this.notifyChange("initialExtentRequired");
                                        this._set("zoom", a);
                                        this._set("scale", 0);
                                        var b =
                                            this._get("extent");
                                        b && (this._set("extent", null), this._set("center", b.center))
                                    }
                                    this.constraints.effectiveLODs && (b = this.viewpoint, w.scaleTo(b, b, this.constraints.zoomToScale(a)), this.viewpoint = b, this._set("zoom", this.constraints.scaleToZoom(this.scale)))
                                }
                            }, enumerable: !0, configurable: !0
                        });
                        c.prototype.goTo = function (a, b) {
                            this.animation && (this.animation = null);
                            if (this._setup) return b = e({animate: !0}, b), a = w.createAsync(a, this), this._gotoTask = {}, b.animate ? this._gotoAnimated(a, b) : this._gotoImmediate(a, b);
                            z.error("#goTo()",
                                "MapView cannot be used before it is ready")
                        };
                        c.prototype.hitTest = function (a, b) {
                            return f.reject("Should be implemented by subclasses")
                        };
                        c.prototype.toMap = function (a, b, d) {
                            if (!this._setup) return null;
                            a && null != a.x && (d = b, b = a.y, a = a.x);
                            var f = [0, 0];
                            this.state.toMap(f, [a, b]);
                            d = d || new k.Point;
                            d.x = f[0];
                            d.y = f[1];
                            d.spatialReference = this.spatialReference;
                            return d
                        };
                        c.prototype.isTileInfoRequired = function () {
                            return !0
                        };
                        c.prototype.toScreen = function (a, b, d, f) {
                            if (!this._setup) return null;
                            a && "object" === typeof a ? (f = b ||
                                new k.ScreenPoint, a = this._normalizeInput(a), b = a.y, a = a.x) : f = "number" === typeof d || null == d ? f || new k.ScreenPoint : d || new k.ScreenPoint;
                            a = [a, b];
                            this.state.toScreen(a, a);
                            f.x = a[0];
                            f.y = a[1];
                            return f
                        };
                        c.prototype.pixelSizeAt = function (a, b) {
                            if (!this._setup) return NaN;
                            a && null != a.x && (b = a.y, a = a.x);
                            return this.content.pixelSizeAt([a, b])
                        };
                        c.prototype.requestLayerViewUpdate = function (a) {
                            this._setup && this._frameTask.requestLayerViewUpdate(a)
                        };
                        c.prototype.requestUpdate = function (a) {
                            this._setup && this._frameTask.requestUpdate(a)
                        };
                        c.prototype.getDefaultSpatialReference = function () {
                            return this.get("map.initialViewProperties.spatialReference") || this.get("defaultsFromMap.spatialReference") || null
                        };
                        c.prototype.isSpatialReferenceSupported = function (a, b) {
                            if (b || this._get("ready")) return !0;
                            b = this._normalizeInput(this._get("center"), a);
                            var d = this._normalizeInput(this._get("extent"), a),
                                f = this._normalizeInput(this._get("viewpoint"), a), g = this._userSpatialReference,
                                e = null, c = null;
                            (f = f && f.targetGeometry) && ("extent" === f.type ? e = f : "point" === f.type &&
                                (c = f));
                            f = this._normalizeInput(this.get("map.initialViewProperties.viewpoint.targetGeometry.extent"), a);
                            a = this._normalizeInput(this.initialExtent, a);
                            a = d || e || f || a;
                            return b || c || a && a.center ? !0 : (g && z.error("The view could not be initialized with the spatialReference " + g.wkid + ".", "Try specifying an extent or a center and scale"), !1)
                        };
                        c.prototype._createOrReplaceAnimation = function (a) {
                            if (!this.animation || this.animation.done) this.animation = new t;
                            this.animation.update(a);
                            return this.animation
                        };
                        c.prototype._cancellableGoTo =
                            function (a, b, d) {
                                var g = this, e = d.then(function () {
                                    a === g._gotoTask && (g.animation = null)
                                }).catch(function (d) {
                                    a === g._gotoTask && (g.animation = null, b.done || b.stop());
                                    throw d;
                                }), c = f.create(function (a) {
                                    return a(e)
                                }, function () {
                                    a !== g._gotoTask || b.done || b.stop()
                                });
                                b.catch(function () {
                                    a === g._gotoTask && c.cancel()
                                });
                                return c
                            };
                        c.prototype._gotoImmediate = function (a, b) {
                            var d = this, f = this._gotoTask, e = this._createOrReplaceAnimation(a);
                            a = a.then(function (a) {
                                if (f !== d._gotoTask) throw new g("view:goto-interrupted", "Goto was interrupted");
                                d.viewpoint = e.target = a;
                                e.finish()
                            });
                            return this._cancellableGoTo(f, e, a)
                        };
                        c.prototype._gotoAnimated = function (a, b) {
                            var d = this, f = this._gotoTask, e = this._createOrReplaceAnimation(a);
                            a = a.then(function (a) {
                                if (f !== d._gotoTask) throw new g("view:goto-interrupted", "Goto was interrupted");
                                e.update(a);
                                d.animationManager.animate(e, d.viewpoint, b);
                                return e.when().then(function () {
                                })
                            });
                            return this._cancellableGoTo(f, e, a)
                        };
                        c.prototype._resizeHandler = function (a) {
                            var b = this.state;
                            if (b) {
                                var d = this.content.viewpoint, f = this.content.size.concat();
                                b.size = [a.width, a.height];
                                w.resize(d, d, f, this.content.size, this.resizeAlign);
                                d = this.constraints.constrain(d, null);
                                this.state.viewpoint = d
                            }
                        };
                        c.prototype._startup = function () {
                            if (!this._setup) {
                                var a = this.constraints, b = this._get("zoom"), d = this._get("scale"),
                                    f = this._normalizeInput(this._get("center")),
                                    g = this._normalizeInput(this._get("extent")), e = this._get("rotation"),
                                    c = this._normalizeInput(this._get("viewpoint"));
                                a.view = this;
                                a.effectiveLODs ? -1 !== b && (d = a.zoomToScale(b)) : b = -1;
                                var m = null, l = null, k = 0, b = c && c.rotation,
                                    p = c && c.targetGeometry;
                                p && ("extent" === p.type ? m = p : "point" === p.type && (l = p, k = c.scale));
                                c = this._normalizeInput(this.get("map.initialViewProperties.viewpoint.targetGeometry.extent"));
                                p = this._normalizeInput(this.initialExtent);
                                g = g || m || c || p;
                                f = f || l || g && g.center;
                                d = d || k || g && w.extentToScale(g, this.size);
                                e = new h({targetGeometry: f, scale: d, rotation: e || b || 0});
                                a.fit(e);
                                this._set("animationManager", new u);
                                this._set("state", new y({
                                    padding: this._get("padding"),
                                    size: this.size,
                                    viewpoint: e
                                }));
                                this._set("content", this.state.content);
                                this._setup = !0
                            }
                        };
                        c.prototype._tearDown = function () {
                            if (this._setup) {
                                this._setup = !1;
                                this._stationaryTimer && (clearTimeout(this._stationaryTimer), this._stationaryTimer = null, this.notifyChange("stationary"));
                                var a = this._get("content"), b = a.center, d = a.spatialReference,
                                    b = new k.Point({x: b[0], y: b[1], spatialReference: d});
                                this._set("viewpoint", null);
                                this._set("extent", null);
                                this._set("center", b);
                                this._set("zoom", -1);
                                this._set("rotation", a.rotation);
                                this._set("scale", a.scale);
                                this._set("spatialReference", d);
                                this.constraints.view =
                                    null;
                                this.animationManager.destroy();
                                this._set("animationManager", null);
                                this._set("state", null);
                                this._set("content", null);
                                this.animation = null
                            }
                        };
                        c.prototype._flipStationary = function () {
                            var a = this;
                            this._stationaryTimer && clearTimeout(this._stationaryTimer);
                            this._stationaryTimer = setTimeout(function () {
                                a._stationaryTimer = null;
                                a.notifyChange("stationary")
                            }, 160);
                            this.notifyChange("stationary")
                        };
                        c.prototype._normalizeInput = function (a, b) {
                            void 0 === b && (b = this.spatialReference);
                            var d = a && a.targetGeometry || a;
                            return b ?
                                d ? b.equals(d.spatialReference) ? a : q.canProject(d, b) ? a && "esri.Viewpoint" === a.declaredClass ? (a.targetGeometry = q.project(d, b), a) : q.project(d, b) : null : null : a
                        };
                        l([m.property()], c.prototype, "animation", null);
                        l([m.property({readOnly: !0})], c.prototype, "animationManager", void 0);
                        l([m.property({
                            value: null,
                            type: k.Point,
                            dependsOn: ["content.center"]
                        })], c.prototype, "center", null);
                        l([m.property({type: v})], c.prototype, "constraints", null);
                        l([m.property({readOnly: !0})], c.prototype, "content", void 0);
                        l([m.property({
                            value: null,
                            type: k.Extent, dependsOn: ["content.extent"]
                        })], c.prototype, "extent", null);
                        l([m.property()], c.prototype, "fullOpacity", void 0);
                        l([m.property({readOnly: !0})], c.prototype, "interacting", void 0);
                        l([m.property({type: k.Extent})], c.prototype, "initialExtent", void 0);
                        l([m.property({dependsOn: ["map.initialViewProperties.viewpoint"]})], c.prototype, "initialExtentRequired", null);
                        l([m.property()], c.prototype, "labelManager", void 0);
                        l([m.property({
                            value: {top: 0, right: 0, bottom: 0, left: 0}, cast: function (a) {
                                return e({
                                    top: 0,
                                    right: 0, bottom: 0, left: 0
                                }, a)
                            }
                        })], c.prototype, "padding", null);
                        l([m.property()], c.prototype, "resizeAlign", void 0);
                        l([m.property({
                            value: 0,
                            type: Number,
                            dependsOn: ["content.rotation"]
                        })], c.prototype, "rotation", null);
                        l([m.property({
                            value: 0,
                            type: Number,
                            dependsOn: ["content.scale"]
                        })], c.prototype, "scale", null);
                        l([m.property({
                            type: k.SpatialReference,
                            dependsOn: ["map.initialViewProperties.spatialReference", "defaultsFromMap.isSpatialReferenceDone"]
                        })], c.prototype, "spatialReference", void 0);
                        l([m.property({readOnly: !0})],
                            c.prototype, "state", void 0);
                        l([m.property()], c.prototype, "stationary", null);
                        l([m.property({readOnly: !0})], c.prototype, "type", void 0);
                        l([m.property({
                            value: null,
                            type: h,
                            dependsOn: ["content.viewpoint"]
                        })], c.prototype, "viewpoint", null);
                        l([m.property({value: -1, dependsOn: ["content.scale"]})], c.prototype, "zoom", null);
                        return c = l([m.subclass("esri.views.MapViewBase")], c)
                    }(m.declared(p))
                })
        }, "esri/views/2d/AnimationManager": function () {
            define("../../core/Accessor ../../core/scheduling ../../core/now ../ViewAnimation ./unitBezier ./viewpointUtils".split(" "),
                function (n, c, e, a, l, k) {
                    var h = function (a, b, d, f) {
                        var g = a.targetGeometry, e = b.targetGeometry;
                        f ? "string" === typeof f && (f = l.parse(f) || l.ease) : f = l.ease;
                        this.easing = f;
                        this.duration = d;
                        this.sCenterX = g.x;
                        this.sCenterY = g.y;
                        this.sScale = a.scale;
                        this.sRotation = a.rotation;
                        this.tCenterX = e.x;
                        this.tCenterY = e.y;
                        this.tScale = b.scale;
                        this.tRotation = b.rotation;
                        this.dCenterX = this.tCenterX - this.sCenterX;
                        this.dCenterY = this.tCenterY - this.sCenterY;
                        this.dScale = this.tScale - this.sScale;
                        this.dRotation = this.tRotation - this.sRotation;
                        180 < this.dRotation ? this.dRotation -= 360 : -180 > this.dRotation && (this.dRotation += 360)
                    };
                    h.prototype.applyRatio = function (a, b) {
                        var d = this.easing(b), f, g;
                        1 <= b ? (b = this.tCenterX, f = this.tCenterY, g = this.tRotation, d = this.tScale) : (b = this.sCenterX + d * this.dCenterX, f = this.sCenterY + d * this.dCenterY, g = this.sRotation + d * this.dRotation, d = this.sScale + d * this.dScale);
                        a.targetGeometry.x = b;
                        a.targetGeometry.y = f;
                        a.scale = d;
                        a.rotation = g
                    };
                    return n.createSubclass({
                        constructor: function () {
                            this._updateTask = c.addFrameTask({postRender: this._postRender.bind(this)});
                            this._updateTask.pause()
                        },
                        getDefaults: function () {
                            return {viewpoint: k.create()}
                        },
                        properties: {
                            animation: null,
                            duration: {value: 200},
                            transition: {value: null},
                            easing: {value: l.ease},
                            viewpoint: null
                        },
                        animate: function (a, b, d) {
                            this.stop();
                            k.copy(this.viewpoint, b);
                            this.transition = new h(this.viewpoint, a.target, d && d.duration || this.duration, d && d.easing || this.easing);
                            b = function () {
                                this.animation === a && this._updateTask && ("finished" === a.state && (this.transition.applyRatio(this.viewpoint, 1), this.animation._dfd.progress(this.viewpoint)),
                                    this._updateTask.pause(), this.updateFunction = this.animation = null)
                            }.bind(this);
                            a.when(b, b);
                            this._startTime = e();
                            this._updateTask.resume();
                            return this.animation = a
                        },
                        animateContinous: function (g, b) {
                            this.stop();
                            this.updateFunction = b;
                            this.viewpoint = g;
                            var d = new a({target: g.clone()});
                            g = function () {
                                this.animation === d && this._updateTask && (this._updateTask.pause(), this.updateFunction = this.animation = null)
                            }.bind(this);
                            d.when(g, g);
                            this._startTime = e();
                            this._updateTask.resume();
                            return this.animation = d
                        },
                        stop: function () {
                            this.animation &&
                            (this.animation.stop(), this.updateFunction = this.animation = null)
                        },
                        _postRender: function (g) {
                            var b = this.animation;
                            b && b.state !== a.STOPPED ? (this.updateFunction ? this.updateFunction(this.viewpoint, g.deltaTime) : (g = (e() - this._startTime) / this.transition.duration, b = 1 <= g, this.transition.applyRatio(this.viewpoint, g), b && this.animation.finish()), this.animation._dfd.progress(this.viewpoint)) : this._updateTask.pause()
                        }
                    })
                })
        }, "esri/views/2d/unitBezier": function () {
            define([], function () {
                var n = function (e, a, c, k) {
                    function h(a,
                               f) {
                        var e, c, m, h;
                        f = null == f ? 1E-6 : f;
                        m = a;
                        for (c = 0; 8 > c; c++) {
                            h = ((d * m + b) * m + g) * m - a;
                            if (Math.abs(h) < f) return m;
                            e = (3 * d * m + 2 * b) * m + g;
                            if (1E-6 > Math.abs(e)) break;
                            m -= h / e
                        }
                        e = 0;
                        c = 1;
                        m = a;
                        if (m < e) return e;
                        if (m > c) return c;
                        for (; e < c;) {
                            h = ((d * m + b) * m + g) * m;
                            if (Math.abs(h - a) < f) break;
                            a > h ? e = m : c = m;
                            m = .5 * (c - e) + e
                        }
                        return m
                    }

                    var g = 3 * e, b = 3 * (c - e) - g, d = 1 - g - b, f = 3 * a, m = 3 * (k - a) - f, l = 1 - f - m;
                    return function (a, b) {
                        a = h(a, b);
                        return ((l * a + m) * a + f) * a
                    }
                }, c = /^cubic-bezier\((.*)\)/;
                n.parse = function (e) {
                    var a = n[e] || null;
                    !a && (e = c.exec(e)) && (e = e[1].split(",").map(function (a) {
                        return parseFloat(a.trim())
                    }),
                    4 !== e.length || e.some(function (a) {
                        return isNaN(a)
                    }) || (a = n.apply(n, e)));
                    return a
                };
                n.ease = n(.25, .1, .25, 1);
                n.linear = n(0, 0, 1, 1);
                n.easeIn = n["ease-in"] = n(.42, 0, 1, 1);
                n.easeOut = n["ease-out"] = n(0, 0, .58, 1);
                n.easeInOut = n["ease-in-out"] = n(.42, 0, .58, 1);
                return n
            })
        }, "esri/views/2d/viewpointUtils": function () {
            define("require exports ../../Viewpoint ../../core/Error ../../core/promiseUtils ../../geometry/Extent ../../geometry/Geometry ../../geometry/Point ../../geometry/SpatialReference ../../geometry/support/scaleUtils ../../geometry/support/spatialReferenceUtils ../../geometry/support/webMercatorUtils ../../geometry/support/webMercatorUtils ./libs/gl-matrix/common ./libs/gl-matrix/mat2d ./libs/gl-matrix/vec2".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u) {
                    function r(a, b, d, f) {
                        return f && d && !f.equals(d) && m.canProject(f, d) && f.isWebMercator ? (f.isWebMercator ? (d = b[1], 89.99999 < d ? d = 89.99999 : -89.99999 > d && (d = -89.99999), d = Math.sin(p.toRadian(d)), a = u.set(a, 6378137 * p.toRadian(b[0]), 3189068.5 * Math.log((1 + d) / (1 - d)))) : (d = p.toDegree(b[0] / 6378137), a = u.set(a, d - 360 * Math.floor((d + 180) / 360), p.toDegree(.5 * Math.PI - 2 * Math.atan(Math.exp(-1 * b[1] / 6378137))))), a) : u.copy(a, b)
                    }

                    function x(a) {
                        return a.wkid ? a : a.spatialReference || b.WGS84
                    }

                    function v(a,
                               b) {
                        return b.type ? u.set(a, b.x, b.y) : u.copy(a, b)
                    }

                    function y(a, b) {
                        return Math.max(a.width / b[0], a.height / b[1]) * G(a.spatialReference)
                    }

                    function w(a, b, d) {
                        var f;
                        if (!a) return null;
                        if (Array.isArray(a) && 2 === a.length && "number" === typeof a[0] && "number" === typeof a[1]) return new g(a);
                        if (a.reduce) return a.reduce(function (a, d) {
                            return w(d, b, a)
                        }, d);
                        a instanceof h ? f = a : a.geometry && (f = a.geometry);
                        if (!f) return null;
                        a = "point" === f.type ? new k({
                            xmin: f.x,
                            ymin: f.y,
                            xmax: f.x,
                            ymax: f.y,
                            spatialReference: f.spatialReference
                        }) : f.extent;
                        if (!a) return null;
                        f = m.canProject(a, b);
                        if (!a.spatialReference.equals(b) && f) a = m.project(a, b); else if (!f) return null;
                        return d = d ? d.union(a) : a.clone()
                    }

                    function z(a, b) {
                        if (!a) return new e({targetGeometry: new g, scale: 0, rotation: 0});
                        var d = b.spatialReference, f = b.size, c = b.viewpoint, h = b.constraints, l = null;
                        "esri.Viewpoint" === a.declaredClass ? l = a : a.viewpoint ? l = a.viewpoint : a.target && "esri.Viewpoint" === a.target.declaredClass && (l = a.target);
                        var p = null;
                        if (l && l.targetGeometry) p = l.targetGeometry; else if (a instanceof k) p =
                            a; else if (a || a && (a.hasOwnProperty("center") || a.hasOwnProperty("extent") || a.hasOwnProperty("target"))) p = w(a.center, d) || w(a.extent, d) || w(a.target, d) || w(a, d);
                        !p && c && c.targetGeometry ? p = c.targetGeometry : !p && b.extent && (p = b.extent);
                        var t = x(p);
                        d || (d = x(b.spatialReference || b.extent || p));
                        if (!q.canProject(p, d) && t && !t.equals(d)) return null;
                        var z = v(u.create(), p.center ? p.center : p), t = new g(r(z, z, t, d), d), z = null,
                            z = l && l.targetGeometry && "point" === l.targetGeometry.type ? l.scale : a.hasOwnProperty("scale") && a.scale ? a.scale :
                                a.hasOwnProperty("zoom") && -1 !== a.zoom && h && h.effectiveLODs ? h.zoomToScale(a.zoom) : Array.isArray(p) || "point" === p.type || "extent" === p.type && 0 === p.width && 0 === p.height ? b.extent && m.canProject(b.extent, d) ? y(m.project(b.extent, d), f) : b.extent ? y(b.extent, f) : c.scale : m.canProject(p.extent, d) ? y(m.project(p.extent, d), f) : y(p.extent, f);
                        b = 0;
                        l ? b = l.rotation : a.hasOwnProperty("rotation") ? b = a.rotation : c && (b = c.rotation);
                        a = new e({targetGeometry: t, scale: z, rotation: b});
                        h && (a = h.fit(a), h.rotationEnabled || (a.rotation = b));
                        return a
                    }

                    function B(a, b) {
                        var d = a.targetGeometry, f = b.targetGeometry;
                        d.x = f.x;
                        d.y = f.y;
                        d.spatialReference = f.spatialReference;
                        a.scale = b.scale;
                        a.rotation = b.rotation;
                        return a
                    }

                    function A(a, b, d) {
                        return d ? u.set(a, .5 * (b[0] - d.right + d.left), .5 * (b[1] - d.bottom + d.top)) : u.scale(a, b, .5)
                    }

                    function C(a, b, d, f) {
                        c.getTransform(a, b, d, f);
                        return t.invert(a, a)
                    }

                    function D(a, b, d) {
                        var f = p.toRadian(b.rotation) || 0;
                        b = Math.abs(Math.cos(f));
                        f = Math.abs(Math.sin(f));
                        return u.set(a, Math.round(d[1] * f + d[0] * b), Math.round(d[1] * b + d[0] * f))
                    }

                    function E(a) {
                        return a.scale *
                            (1 / (39.37 * d.getMetersPerUnitForSR(a.targetGeometry.spatialReference) * 96))
                    }

                    function G(a) {
                        return 39.37 * d.getMetersPerUnitForSR(a) * 96
                    }

                    function F(a) {
                        return a.isWrappable ? (a = f.getInfo(a), a.valid[1] - a.valid[0]) : 0
                    }

                    function I(a, b) {
                        return Math.round(F(a) / b)
                    }

                    Object.defineProperty(c, "__esModule", {value: !0});
                    var K = 180 / Math.PI;
                    c.extentToScale = y;
                    c.create = z;
                    c.copy = B;
                    c.getAnchor = A;
                    c.getExtent = function () {
                        var a = u.create();
                        return function (b, d, f) {
                            var g = d.targetGeometry;
                            v(a, g);
                            d = .5 * E(d);
                            b.xmin = a[0] - d * f[0];
                            b.ymin = a[1] -
                                d * f[1];
                            b.xmax = a[0] + d * f[0];
                            b.ymax = a[1] + d * f[1];
                            b.spatialReference = g.spatialReference;
                            return b
                        }
                    }();
                    c.setExtent = function (a, b, d, f, g) {
                        c.centerAt(a, b, d.center);
                        a.scale = y(d, f);
                        g && g.constraints && g.constraints.constrain(a);
                        return a
                    };
                    c.getOuterExtent = function () {
                        var a = u.create(), b = u.create();
                        return function (d, f, g) {
                            v(a, f.targetGeometry);
                            D(b, f, g);
                            g = .5 * E(f);
                            d.set({
                                xmin: a[0] - g * b[0],
                                ymin: a[1] - g * b[1],
                                xmax: a[0] + g * b[0],
                                ymax: a[1] + g * b[1],
                                spatialReference: f.targetGeometry.spatialReference
                            });
                            return d
                        }
                    }();
                    c.getClippedExtent =
                        function () {
                            var a = u.create(), b = u.create();
                            return function (d, f, g) {
                                var e = E(f), c = f.targetGeometry.spatialReference, m = I(c, e);
                                v(a, f.targetGeometry);
                                D(b, f, g);
                                c.isWrappable && b[0] > m && (b[0] = m);
                                f = .5 * e;
                                d.set({
                                    xmin: a[0] - f * b[0],
                                    ymin: a[1] - f * b[1],
                                    xmax: a[0] + f * b[0],
                                    ymax: a[1] + f * b[1],
                                    spatialReference: c
                                });
                                return d
                            }
                        }();
                    c.getOuterSize = D;
                    c.getPaddingScreenTranslation = function () {
                        var a = u.create();
                        return function (b, d, f) {
                            return u.sub(b, u.scale(b, d, .5), A(a, d, f))
                        }
                    }();
                    var O = function () {
                        var a = t.create(), b = u.create();
                        return function (d,
                                         f, g, e) {
                            var m = E(f);
                            f = p.toRadian(f.rotation) || 0;
                            u.set(b, m, m);
                            t.fromScaling(a, b);
                            t.rotate(a, a, f);
                            t.translate(a, a, c.getPaddingScreenTranslation(b, g, e));
                            t.translate(a, a, [0, e.top - e.bottom]);
                            return u.set(d, a[4], a[5])
                        }
                    }();
                    c.getResolution = E;
                    c.getResolutionToScaleFactor = G;
                    c.getMatrix = function () {
                        var a = u.create(), b = u.create(), d = u.create();
                        return function (f, g, e, c, m, h) {
                            u.negate(a, g);
                            u.scale(b, e, .5 * h);
                            u.set(d, 1 / c * h, -1 / c * h);
                            t.identity(f);
                            t.translate(f, f, b);
                            m && t.rotate(f, f, m);
                            t.scale(f, f, d);
                            t.translate(f, f, a);
                            return f
                        }
                    }();
                    c.getTransform = function () {
                        var a = u.create();
                        return function (b, d, f, g) {
                            var e = E(d), m = p.toRadian(d.rotation) || 0;
                            v(a, d.targetGeometry);
                            return c.getMatrix(b, a, f, e, m, g)
                        }
                    }();
                    c.getTransformNoRotation = function () {
                        var a = u.create();
                        return function (b, d, f, g) {
                            var e = E(d);
                            v(a, d.targetGeometry);
                            return c.getMatrix(b, a, f, e, 0, g)
                        }
                    }();
                    c.getWorldWidth = F;
                    c.getWorldScreenWidth = I;
                    c.createAsync = function (b, d) {
                        if (b = z(b, d)) return l.resolve(b);
                        b = new a("viewpointUtils-createAsync:different-spatialReference", "Target spatialReference cannot be projected and is different from out spatialReference");
                        return l.reject(b)
                    };
                    c.angleBetween = function () {
                        var a = u.create(), b = u.create(), d = u.create();
                        return function (f, g, e) {
                            u.subtract(a, f, g);
                            u.normalize(a, a);
                            u.subtract(b, f, e);
                            u.normalize(b, b);
                            u.cross(d, a, b);
                            f = Math.acos(u.dot(a, b) / (u.length(a) * u.length(b))) * K;
                            0 > d[2] && (f = -f);
                            isNaN(f) && (f = 0);
                            return f
                        }
                    }();
                    c.addPadding = function () {
                        var a = u.create();
                        return function (b, d, f, g) {
                            var e = b.targetGeometry;
                            B(b, d);
                            O(a, d, f, g);
                            e.x += a[0];
                            e.y += a[1];
                            return b
                        }
                    }();
                    c.removePadding = function () {
                        var a = u.create();
                        return function (b, d, f, g) {
                            var e =
                                b.targetGeometry;
                            B(b, d);
                            O(a, d, f, g);
                            e.x -= a[0];
                            e.y -= a[1];
                            return b
                        }
                    }();
                    c.centerAt = function () {
                        var a = u.create();
                        return function (b, d, f) {
                            B(b, d);
                            d = b.targetGeometry;
                            var g = x(f), e = x(d);
                            v(a, f);
                            r(a, a, g, e);
                            d.x = a[0];
                            d.y = a[1];
                            return b
                        }
                    }();
                    c.pixelSizeAt = function (a, b, d) {
                        return E(b)
                    };
                    c.resize = function () {
                        var a = u.create();
                        return function (b, d, f, g, e) {
                            e || (e = "center");
                            u.sub(a, f, g);
                            u.scale(a, a, .5);
                            f = a[0];
                            g = a[1];
                            switch (e) {
                                case "center":
                                    u.set(a, 0, 0);
                                    break;
                                case "left":
                                    u.set(a, -f, 0);
                                    break;
                                case "top":
                                    u.set(a, 0, g);
                                    break;
                                case "right":
                                    u.set(a,
                                        f, 0);
                                    break;
                                case "bottom":
                                    u.set(a, 0, -g);
                                    break;
                                case "top-left":
                                    u.set(a, -f, g);
                                    break;
                                case "bottom-left":
                                    u.set(a, -f, -g);
                                    break;
                                case "top-right":
                                    u.set(a, f, g);
                                    break;
                                case "bottom-right":
                                    u.set(a, f, -g)
                            }
                            c.translateBy(b, d, a);
                            return b
                        }
                    }();
                    c.rotateBy = function (a, b, d) {
                        B(a, b);
                        a.rotation += d;
                        return a
                    };
                    c.rotateTo = function (a, b, d) {
                        B(a, b);
                        a.rotation = d;
                        return a
                    };
                    c.scaleBy = function () {
                        var a = u.create();
                        return function (b, d, f, g, e) {
                            B(b, d);
                            isNaN(f) || 0 === f || (c.toMap(a, g, d, e), b.scale = d.scale * f, c.toScreen(a, a, b, e), c.translateBy(b,
                                b, u.set(a, a[0] - g[0], g[1] - a[1])));
                            return b
                        }
                    }();
                    c.scaleTo = function (a, b, d) {
                        B(a, b);
                        a.scale = d;
                        return a
                    };
                    c.scaleAndRotateBy = function () {
                        var a = u.create();
                        return function (b, d, f, g, e, m) {
                            B(b, d);
                            isNaN(f) || 0 === f || (c.toMap(a, e, d, m), b.scale = d.scale * f, b.rotation += g, c.toScreen(a, a, b, m), c.translateBy(b, b, u.set(a, a[0] - e[0], e[1] - a[1])));
                            return b
                        }
                    }();
                    c.padAndScaleAndRotateBy = function () {
                        var a = u.create(), b = u.create();
                        return function (d, f, g, e, m, h, l) {
                            c.getPaddingScreenTranslation(b, h, l);
                            u.add(a, m, b);
                            return e ? c.scaleAndRotateBy(d,
                                f, g, e, a, h) : c.scaleBy(d, f, g, a, h)
                        }
                    }();
                    c.toMap = function () {
                        var a = t.create();
                        return function (b, d, f, g) {
                            return u.transformMat2d(b, d, C(a, f, g, 1))
                        }
                    }();
                    c.toScreen = function () {
                        var a = t.create();
                        return function (b, d, f, g) {
                            return u.transformMat2d(b, d, c.getTransform(a, f, g, 1))
                        }
                    }();
                    c.translateBy = function () {
                        var a = u.create(), b = t.create();
                        return function (d, f, g) {
                            B(d, f);
                            var e = E(f), c = d.targetGeometry;
                            t.fromRotation(b, p.toRadian(f.rotation) || 0);
                            t.scale(b, b, u.fromValues(e, e));
                            u.transformMat2d(a, g, b);
                            c.x += a[0];
                            c.y += a[1];
                            return d
                        }
                    }()
                })
        },
        "esri/views/2d/libs/gl-matrix/mat2d": function () {
            define(["./common"], function (n) {
                var c = n.GLMAT_ARRAY_TYPE;
                n = {
                    create: function () {
                        var e = new c(6);
                        e[0] = 1;
                        e[1] = 0;
                        e[2] = 0;
                        e[3] = 1;
                        e[4] = 0;
                        e[5] = 0;
                        return e
                    }, clone: function (e) {
                        var a = new c(6);
                        a[0] = e[0];
                        a[1] = e[1];
                        a[2] = e[2];
                        a[3] = e[3];
                        a[4] = e[4];
                        a[5] = e[5];
                        return a
                    }, copy: function (e, a) {
                        e[0] = a[0];
                        e[1] = a[1];
                        e[2] = a[2];
                        e[3] = a[3];
                        e[4] = a[4];
                        e[5] = a[5];
                        return e
                    }, identity: function (e) {
                        e[0] = 1;
                        e[1] = 0;
                        e[2] = 0;
                        e[3] = 1;
                        e[4] = 0;
                        e[5] = 0;
                        return e
                    }, invert: function (e, a) {
                        var c = a[0], k = a[1], h = a[2],
                            g = a[3], b = a[4];
                        a = a[5];
                        var d = c * g - k * h;
                        if (!d) return null;
                        d = 1 / d;
                        e[0] = g * d;
                        e[1] = -k * d;
                        e[2] = -h * d;
                        e[3] = c * d;
                        e[4] = (h * a - g * b) * d;
                        e[5] = (k * b - c * a) * d;
                        return e
                    }, determinant: function (e) {
                        return e[0] * e[3] - e[1] * e[2]
                    }, multiply: function (e, a, c) {
                        var l = a[0], h = a[1], g = a[2], b = a[3], d = a[4];
                        a = a[5];
                        var f = c[0], m = c[1], q = c[2], p = c[3], t = c[4];
                        c = c[5];
                        e[0] = l * f + g * m;
                        e[1] = h * f + b * m;
                        e[2] = l * q + g * p;
                        e[3] = h * q + b * p;
                        e[4] = l * t + g * c + d;
                        e[5] = h * t + b * c + a;
                        return e
                    }
                };
                n.mul = n.multiply;
                n.rotate = function (e, a, c) {
                    var l = a[0], h = a[1], g = a[2], b = a[3], d = a[4];
                    a = a[5];
                    var f = Math.sin(c);
                    c = Math.cos(c);
                    e[0] = l * c + g * f;
                    e[1] = h * c + b * f;
                    e[2] = l * -f + g * c;
                    e[3] = h * -f + b * c;
                    e[4] = d;
                    e[5] = a;
                    return e
                };
                n.scale = function (e, a, c) {
                    var l = a[1], h = a[2], g = a[3], b = a[4], d = a[5], f = c[0];
                    c = c[1];
                    e[0] = a[0] * f;
                    e[1] = l * f;
                    e[2] = h * c;
                    e[3] = g * c;
                    e[4] = b;
                    e[5] = d;
                    return e
                };
                n.translate = function (e, a, c) {
                    var l = a[0], h = a[1], g = a[2], b = a[3], d = a[4];
                    a = a[5];
                    var f = c[0];
                    c = c[1];
                    e[0] = l;
                    e[1] = h;
                    e[2] = g;
                    e[3] = b;
                    e[4] = l * f + g * c + d;
                    e[5] = h * f + b * c + a;
                    return e
                };
                n.fromRotation = function (e, a) {
                    var c = Math.sin(a);
                    a = Math.cos(a);
                    e[0] = a;
                    e[1] = c;
                    e[2] = -c;
                    e[3] = a;
                    e[4] = 0;
                    e[5] = 0;
                    return e
                };
                n.fromScaling = function (e, a) {
                    e[0] = a[0];
                    e[1] = 0;
                    e[2] = 0;
                    e[3] = a[1];
                    e[4] = 0;
                    e[5] = 0;
                    return e
                };
                n.fromTranslation = function (e, a) {
                    e[0] = 1;
                    e[1] = 0;
                    e[2] = 0;
                    e[3] = 1;
                    e[4] = a[0];
                    e[5] = a[1];
                    return e
                };
                n.str = function (e) {
                    return "mat2d(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ", " + e[4] + ", " + e[5] + ")"
                };
                n.frob = function (e) {
                    return Math.sqrt(Math.pow(e[0], 2) + Math.pow(e[1], 2) + Math.pow(e[2], 2) + Math.pow(e[3], 2) + Math.pow(e[4], 2) + Math.pow(e[5], 2) + 1)
                };
                return n
            })
        }, "esri/views/2d/FrameTask": function () {
            define(["require", "exports", "../../core/scheduling"],
                function (n, c, e) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    n = function () {
                        function a(a) {
                            var e = this;
                            this.view = a;
                            this._frameTaskHandle = null;
                            this.updateEnabled = this.stationary = !0;
                            this.prepare = function () {
                                e._updateParameters.state = e.view.state;
                                e._updateParameters.stationary = e.view.stationary;
                                e._updateParameters.pixelRatio = window.devicePixelRatio
                            };
                            this.update = function () {
                                if (e.updateEnabled) {
                                    for (var a = e.view, g = a.labelManager, b = a.allLayerViews.toArray().filter(function (a) {
                                        return a.isFulfilled() && null ==
                                            a.layerViews
                                    }), d = b.length, f = a.state, c = 0; c < b.length; c++) if (a = b[c], a.attached) {
                                        var l = a.lastUpdateId;
                                        if (null == l || !e.stationary && !a.moving) a.moving = !0, a.moveStart();
                                        l !== f.id && a.viewChange();
                                        e.stationary && a.moving && (a.moving = !1, a.moveEnd());
                                        a.lastUpdateId = f.id
                                    }
                                    g.lastUpdateId !== f.id && (g.viewChange(), g.lastUpdateId = f.id);
                                    g = e._layerViewsTrash;
                                    for (f = 0; f < g.length; f++) a = g[f], e._detachLayerView(a);
                                    for (f = g.length = 0; f < d; f++) a = b[f], a.isFulfilled() && !a.attached && e._attachLayerView(a);
                                    b = e._updateParameters;
                                    d = e._layerViewsToUpdate;
                                    a = d.slice();
                                    d = d.length = 0;
                                    for (f = a; d < f.length; d++) a = f[d], a.processUpdate(b);
                                    d = e._updatablesToUpdate;
                                    a = d.slice();
                                    for (d = d.length = 0; d < a.length; d++) a[d].processUpdate(b);
                                    0 === e._layerViewsToUpdate.length && 0 === e._updatablesToUpdate.length && 0 === g.length && e._frameTaskHandle.pause()
                                }
                            };
                            a.watch("ready", function (a) {
                                a ? e.start() : e.stop()
                            })
                        }

                        a.prototype.destroy = function () {
                            this.stop()
                        };
                        a.prototype.start = function () {
                            var a = this;
                            this._updateParameters = {
                                state: this.view.state,
                                pixelRatio: window.devicePixelRatio,
                                stationary: !0
                            };
                            this._layerViewsTrash = [];
                            this._layerViewsToUpdate = [];
                            this._updatablesToUpdate = [];
                            this._allLayerViewsChangeHandle = this.view.allLayerViews.on("change", function (e) {
                                Array.prototype.push.apply(a._layerViewsTrash, e.removed);
                                a.requestFrame()
                            });
                            this._stationaryHandle = this.view.watch("stationary", function (e) {
                                a.stationary = e;
                                a.requestFrame()
                            });
                            this._frameTaskHandle = e.addFrameTask(this)
                        };
                        a.prototype.stop = function () {
                            var a = this;
                            this._frameTaskHandle && (this.view.allLayerViews.forEach(function (e) {
                                return a._detachLayerView(e)
                            }),
                                this._stationaryHandle.remove(), this._allLayerViewsChangeHandle.remove(), this._frameTaskHandle.remove(), this._updateParameters = this._stationaryHandle = this._allLayerViewsChangeHandle = this._frameTaskHandle = this._layerViewsTrash = this._layerViewsToUpdate = null, this.stationary = !0)
                        };
                        a.prototype.requestLayerViewUpdate = function (a) {
                            this._layerViewsToUpdate.push(a);
                            this.requestFrame()
                        };
                        a.prototype.requestUpdate = function (a) {
                            this._updatablesToUpdate.push(a);
                            this.requestFrame()
                        };
                        a.prototype.requestFrame = function () {
                            this._frameTaskHandle &&
                            this._frameTaskHandle.resume()
                        };
                        a.prototype._attachLayerView = function (a) {
                            a.attached || (a.attached = !0, a.moving = !1, a.attach())
                        };
                        a.prototype._detachLayerView = function (a) {
                            a.attached && (a.detach(), a.attached = !1, a.moving = !1)
                        };
                        return a
                    }();
                    c.default = n
                })
        }, "esri/views/2d/LabelManager": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/Handles ../../core/promiseUtils ../../core/throttle ../../core/accessorSupport/decorators ../../layers/support/TileInfo ./engine/webgl/collisions/CollisionEngine ./engine/webgl/collisions/LayerViewSorter ./tiling/TileInfoView".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    n = function (c) {
                        function l(a) {
                            a = c.call(this) || this;
                            a._handles = new k;
                            a._applyVisivilityPassThrottled = g.throttle(a._applyVisivilityPass, 64, a);
                            a._previousResolution = Number.POSITIVE_INFINITY;
                            a.lastUpdateId = -1;
                            a.updateRequested = !1;
                            a.view = null;
                            return a
                        }

                        e(l, c);
                        l.prototype.initialize = function () {
                            var a = this;
                            this._layerViewSorter = new m.default(function (b, d) {
                                a._getCollisionEngine().then(function (f) {
                                    f.registerLayer(b.layer, d);
                                    (f =
                                        b.get("featuresView.tileRenderer")) && f.forEachTile(function (d) {
                                        d.isDirty = !0;
                                        a.addTile(b.layer.uid, d)
                                    });
                                    a.requestUpdate()
                                })
                            }, function (b) {
                                a._getCollisionEngine().then(function (d) {
                                    d.unregisterLayer(b.layer);
                                    a.requestUpdate()
                                })
                            }, function (a) {
                                (a = a.get("featuresView.tileRenderer.featuresView")) && a.fadeInLabels()
                            });
                            this._handles.add(this.view.allLayerViews.on("change", function (b) {
                                a._layerViewSorter.update(b)
                            }))
                        };
                        l.prototype.destroy = function () {
                            this._layerViewSorter.destroy();
                            this._collisionEngine = this._layerViewSorter =
                                null;
                            this._handles.removeAll()
                        };
                        Object.defineProperty(l.prototype, "updating", {
                            get: function () {
                                return this.updateRequested
                            }, enumerable: !0, configurable: !0
                        });
                        l.prototype.update = function (a) {
                            var b = this._previousResolution, d = a.state.resolution;
                            this._previousResolution = d;
                            d === b && (this._applyVisivilityPassThrottled(a), this.updateRequested = !1, this.notifyChange("updating"))
                        };
                        l.prototype.viewChange = function () {
                            this.requestUpdate()
                        };
                        l.prototype.requestUpdate = function () {
                            this.updateRequested || (this.updateRequested =
                                !0, this.view.requestUpdate(this))
                        };
                        l.prototype.processUpdate = function (a) {
                            this._set("updateParameters", a);
                            this.updateRequested && (this.updateRequested = !1, this.update(a))
                        };
                        l.prototype.addTile = function (a, b) {
                            this._collisionEngine.addTile(a, b)
                        };
                        l.prototype.removeTile = function (a, b) {
                            this._collisionEngine.removeTile(a, b)
                        };
                        l.prototype._getCollisionEngine = function () {
                            var a = this;
                            return this._collisionEngine ? h.resolve(this._collisionEngine) : this.view.when(function () {
                                var b = d.create({
                                    spatialReference: a.view.spatialReference,
                                    size: 512
                                });
                                a._tileInfoView = new q(b);
                                a._collisionEngine = new f.default(b);
                                return a._collisionEngine
                            })
                        };
                        l.prototype._applyVisivilityPass = function (a) {
                            var b = this;
                            this._getCollisionEngine().then(function (d) {
                                var f = b._tileInfoView.getClosestInfoForScale(a.state.scale).level;
                                d.run(a, f)
                            })
                        };
                        a([b.property()], l.prototype, "updateRequested", void 0);
                        a([b.property({readOnly: !0})], l.prototype, "updateParameters", void 0);
                        a([b.property({dependsOn: ["updateRequested"]})], l.prototype, "updating", null);
                        a([b.property()], l.prototype,
                            "view", void 0);
                        return l = a([b.subclass("esri.views.2d.layers.labels.LabelManager")], l)
                    }(b.declared(l));
                    c.default = n
                })
        }, "esri/core/throttle": function () {
            define(["require", "exports"], function (n, c) {
                function e(a, e, c, h) {
                    var g = null, b = 1E3;
                    "number" === typeof e ? (b = e, h = c) : (g = e, b = c);
                    var d = 0, f, m = function () {
                        d = 0;
                        a.apply(h, f)
                    };
                    e = function () {
                        for (var a = [], e = 0; e < arguments.length; e++) a[e] = arguments[e];
                        g && g.apply(h, a);
                        f = a;
                        b ? d || (d = setTimeout(m, b)) : m()
                    };
                    e.remove = function () {
                        d && (clearTimeout(d), d = 0)
                    };
                    e.forceUpdate = function () {
                        d &&
                        (clearTimeout(d), m())
                    };
                    e.hasPendingUpdates = function () {
                        return !!d
                    };
                    return e
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                c.throttle = e;
                c.default = e
            })
        }, "esri/views/2d/engine/webgl/collisions/CollisionEngine": function () {
            define("require exports ../../../../../core/tsSupport/assignHelper @dojo/shim/Map ../../../../../core/Logger ../../../../../core/libs/gl-matrix/mat2d ../../../../../core/libs/gl-matrix/vec2 ../definitions ./CollisionBucket ../util/iterator ../../../../2d/tiling/TileKey ../../../../3d/support/mathUtils ../../../../vectorTiles/GeometryUtils".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    var p = l.getLogger("esri/views/2d/engine/webgl/collisions/CollisionEngine"),
                        t = g.TILE_SIZE / g.COLLISION_BUCKET_SIZE;
                    n = function () {
                        function e(b) {
                            this._layers = new a.default;
                            this._collisionBuckets = new a.default;
                            this._v3Buf1 = h.create();
                            this._v3Buf2 = h.create();
                            this._mat2dBuf = k.create();
                            this._tileInfo = b
                        }

                        e.prototype.registerLayer = function (a, b) {
                            if (a && !this._layers.has(a.uid)) {
                                var d = this._createInfo(b, a.labelingInfo);
                                this._layers.set(a.uid,
                                    d);
                                this._collisionBuckets.forEach(function (a) {
                                    return a.onRegisterLayer(d.index)
                                })
                            }
                        };
                        e.prototype.unregisterLayer = function (a) {
                            var b = this;
                            if (a && this._layers.has(a.uid)) {
                                var d = this._layers.get(a.uid);
                                this._deleteInfo(d);
                                this._layers.delete(a.uid);
                                this._collisionBuckets.forEach(function (a, f) {
                                    var e = a.getTile(d.index);
                                    e && (e.dirty = !1, a.onUnregisterLayer(d.index), a.canDelete() && b._collisionBuckets.delete(f))
                                })
                            }
                        };
                        e.prototype.addTile = function (a, d) {
                            var f = d.key.id;
                            this._layers.has(a) && (this._collisionBuckets.has(f) ||
                            this._collisionBuckets.set(f, new b.default(this._layers.size)), this._collisionBuckets.get(f).getTile(this._getIndex(a)).reference = d)
                        };
                        e.prototype.removeTile = function (a, b) {
                            this._layers.has(a) && this._collisionBuckets.has(b) && (this._collisionBuckets.get(b).getTile(this._getIndex(a)).reference = null)
                        };
                        e.prototype.run = function (a, b) {
                            var e = [], g = f.pool.acquire(0, 0, 0, 0);
                            d.forEachIter(this._collisionBuckets.keys(), function (a) {
                                g.set(a);
                                g.level === b && e.push(a)
                            });
                            f.pool.release(g);
                            for (var e = f.sort(e), c = a.state.rotation,
                                     m = this._checkRotation(c), h = 0, l = e; h < l.length; h++) {
                                var p = l[h];
                                this._computeNeighbors(p)
                            }
                            for (var l = 0, k = e; l < k.length; l++) for (p = k[l], m = m || this._collisionBuckets.get(p).isDirty, h = 0; h < this._layers.size; h++) {
                                var q = this._getCollisionInfo(h);
                                this._resetCollisionBucket(q, p, a, m)
                            }
                            a = 0;
                            for (m = e; a < m.length; a++) for (p = m[a], h = 0; h < this._layers.size; h++) l = this._getCollisionInfo(h).zoomRanges, this._runCollisionBucket(h, p, b, !!c, l);
                            c = 0;
                            for (h = e; c < h.length; c++) p = h[c], this._cleanCollisionBucket(p)
                        };
                        e.prototype._computeNeighbors =
                            function (a) {
                                var b = this._collisionBuckets.get(a);
                                a = f.from(a);
                                b.neighbors = [this._getNeighboringBucket(a, -1, -1), this._getNeighboringBucket(a, 0, -1), this._getNeighboringBucket(a, 1, -1), this._getNeighboringBucket(a, -1, 0), b, this._getNeighboringBucket(a, 1, 0), this._getNeighboringBucket(a, -1, 1), this._getNeighboringBucket(a, 0, 1), this._getNeighboringBucket(a, 1, 1)]
                            };
                        e.prototype._getNeighboringBucket = function (a, b, d) {
                            a = f.getId(a.level, a.row + d, a.col + b, a.world);
                            return this._collisionBuckets.has(a) ? this._collisionBuckets.get(a) :
                                null
                        };
                        e.prototype._checkRotation = function (a) {
                            if (!this._lastRotation) return this._lastRotation = a, !1;
                            var b = a !== this._lastRotation;
                            this._lastRotation = a;
                            return b
                        };
                        e.prototype._collectCollisionInfos = function () {
                            var a = [];
                            d.forEachIter(this._layers.values(), function (b) {
                                return a.push(b)
                            });
                            return a
                        };
                        e.prototype._createInfo = function (a, b) {
                            for (var d = this, f = this._collectCollisionInfos().sort(function (a, b) {
                                return a.order - b.order
                            }), e = !1, g = -1, c = 0; c < f.length; c++) {
                                var m = f[c];
                                !e && m.order > a && (g = m.index, e = !0);
                                e && m.index++
                            }
                            e ||
                            (g = f.length);
                            b = b.map(function (a) {
                                return d._convertLabelClass(a)
                            });
                            return {index: g, order: a, zoomRanges: b}
                        };
                        e.prototype._convertLabelClass = function (a) {
                            var b = !!a.maxScale, d = !!a.minScale && this._tileInfo.scaleToZoom(a.minScale) || 0;
                            a = b && this._tileInfo.scaleToZoom(a.maxScale) || 255;
                            return {minZoom: Math.floor(10 * d), maxZoom: Math.floor(10 * a)}
                        };
                        e.prototype._deleteInfo = function (a) {
                            a = a.order;
                            for (var b = !1, d = 0, f = this._collectCollisionInfos().sort(function (a, b) {
                                return a.order - b.order
                            }); d < f.length; d++) {
                                var e = f[d];
                                e.order >
                                a && (b = !0);
                                b && e.index--
                            }
                        };
                        e.prototype._resetCollisionBucket = function (a, b, d, f) {
                            a = this._collisionBuckets.get(b).getTile(a.index);
                            if (!a) return !1;
                            a = a.reference;
                            if (!a) return !1;
                            b = this._v3Buf1;
                            var e = this._mat2dBuf;
                            d = d.state;
                            d.toScreen(b, a.coords);
                            a.tileTransform.screenCoord[0] = b[0];
                            a.tileTransform.screenCoord[1] = b[1];
                            k.identity(e);
                            k.rotate(e, e, d.rotation * q.C_DEG_TO_RAD);
                            a.tileTransform.screenTransform.set(e);
                            f && (a.isDirty = !0);
                            if (!a.isDirty) return !1;
                            f = 0;
                            for (d = a.displayObjects; f < d.length; f++) for (a = 0, b = d[f].metrics; a <
                            b.length; a++) b[a].maxZoom = 0;
                            return !0
                        };
                        e.prototype._runCollisionBucket = function (a, b, d, f, e) {
                            b = this._collisionBuckets.get(b);
                            var g = b.getTile(a);
                            if (g) {
                                var c = g.reference;
                                if (c && c.isDirty) for (var m = 0; m < c.displayObjects.length; m++) for (var h = c.displayObjects[m], l = h.id, p = 0; p < h.metrics.length; p++) {
                                    var k = h.metrics[p], q = e[k.index],
                                        t = this._computeLabelVisibility(a, m, p, l, b, g, h, h.anchor, k, d, c, f, q);
                                    k.minZoom = t;
                                    k.maxZoom = q.maxZoom;
                                    c.setVisibilityRange(l, p, k.minZoom, k.maxZoom)
                                }
                            }
                        };
                        e.prototype._cleanCollisionBucket = function (a) {
                            this._collisionBuckets.get(a).clean()
                        };
                        e.prototype._computeLabelVisibility = function (a, b, d, f, e, g, c, m, l, p, k, q, u) {
                            b = u.minZoom;
                            d = k.tileTransform.screenTransform;
                            d = q ? h.transformMat2d(this._v3Buf1, m, d) : m;
                            g = l.bounds.center;
                            var r = k.tileTransform.screenCoord;
                            m = d[0] + g[0] + r[0];
                            d = d[1] + g[1] + r[1];
                            g = c.xBucket;
                            var w = c.yBucket, r = c.xOverflow, x = c.yOverflow;
                            c = g - r;
                            g = g + r + 1;
                            r = w + x + 1;
                            for (w -= x; w < r; w++) for (x = c; x < g; x++) if (!(x < -t || w < -t || x > t || w > t)) for (var v = 0; v <= a; v++) {
                                var z = a === v, y = this._getRelativeSubBucket(v, e, k, x, w);
                                if (y) for (var n = y.neighborTile, B = 0, y = y.bucket; B <
                                y.length; B++) {
                                    var A = y[B];
                                    z && A.id === f || (b = Math.max(this._compareLabelToDisplayObject(f, l, m, d, A, p, n, q, u), b))
                                }
                            }
                            return b
                        };
                        e.prototype._getRelativeSubBucket = function (a, b, d, f, e) {
                            var g = m.sign(Math.floor(f / 4)), c = m.sign(Math.floor(e / 4));
                            return (a = this._getNeighboringTile(a, b, d, g, c)) && a.index ? {
                                bucket: a.index[e - 4 * c][f - 4 * g],
                                neighborTile: a.reference
                            } : null
                        };
                        e.prototype._getNeighboringTile = function (a, b, d, f, e) {
                            return (a = (b = b.neighbors[3 * (1 + e) + (1 + f)]) && b.getTile(a)) && a.reference && a.reference.hasData ? a : null
                        };
                        e.prototype._compareLabelToDisplayObject =
                            function (a, b, d, f, e, c, m, l, p) {
                                a = p.minZoom;
                                p = 10 * (c + g.COLLISION_MAX_ZOOM_DELTA);
                                var k = m.tileTransform.screenTransform;
                                l = l ? h.transformMat2d(this._v3Buf2, e.anchor, k) : e.anchor;
                                k = 0;
                                for (e = e.metrics; k < e.length; k++) {
                                    var q = e[k];
                                    if (q.maxZoom && !(q.minZoom > p || a >= q.maxZoom)) {
                                        var t = q.bounds.center, u = m.tileTransform.screenCoord,
                                            t = this._updateMinZoom(d, f, b.bounds, l[0] + t[0] + u[0], l[1] + t[1] + u[1], q.bounds),
                                            t = Math.min(Math.max(Math.ceil(10 * (t + c)), 0), 255);
                                        if (!(q.minZoom >= t)) {
                                            if (255 <= t) {
                                                a = 255;
                                                break
                                            }
                                            a = Math.max(a, t)
                                        }
                                    }
                                }
                                return a
                            };
                        e.prototype._updateMinZoom = function (a, b, d, f, e, g) {
                            return m.log2(Math.min((g.width + d.width) / 2 / Math.abs(f - a), (g.height + d.height) / 2 / Math.abs(e - b)))
                        };
                        e.prototype.onLabelsRendered = function () {
                            this._collisionBuckets.forEach(function (a) {
                                a.onLabelsRendered()
                            })
                        };
                        e.prototype._getIndex = function (a) {
                            return this._layers.get(a).index
                        };
                        e.prototype._getCollisionInfo = function (a) {
                            for (var b = 0, d = this._collectCollisionInfos(); b < d.length; b++) {
                                var f = d[b];
                                if (f.index === a) return f
                            }
                            p.error("Tried to get a LayerCollisionInfo for an index that doesn't exist!");
                            return null
                        };
                        return e
                    }();
                    c.default = n
                })
        }, "@dojo/shim/Map": function () {
            (function (n) {
                "object" === typeof module && "object" === typeof module.exports ? (n = n(require, exports), void 0 !== n && (module.exports = n)) : "function" === typeof define && define.amd && define("require exports tslib ./iterator ./global ./object ./support/has ./Symbol".split(" "), n)
            })(function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var e = n("tslib"), a = n("./iterator"), l = n("./global"), k = n("./object"), h = n("./support/has");
                n("./Symbol");
                c.Map =
                    l.default.Map;
                h.default("es6-map") || (c.Map = (g = function () {
                    function b(b) {
                        this._keys = [];
                        this._values = [];
                        this[Symbol.toStringTag] = "Map";
                        if (b) if (a.isArrayLike(b)) for (var d = 0; d < b.length; d++) {
                            var g = b[d];
                            this.set(g[0], g[1])
                        } else try {
                            for (var d = e.__values(b), c = d.next(); !c.done; c = d.next()) g = c.value, this.set(g[0], g[1])
                        } catch (u) {
                            h = {error: u}
                        } finally {
                            try {
                                c && !c.done && (l = d.return) && l.call(d)
                            } finally {
                                if (h) throw h.error;
                            }
                        }
                        var h, l
                    }

                    b.prototype._indexOfKey = function (a, b) {
                        for (var d = 0, f = a.length; d < f; d++) if (k.is(a[d], b)) return d;
                        return -1
                    };
                    Object.defineProperty(b.prototype, "size", {
                        get: function () {
                            return this._keys.length
                        }, enumerable: !0, configurable: !0
                    });
                    b.prototype.clear = function () {
                        this._keys.length = this._values.length = 0
                    };
                    b.prototype.delete = function (a) {
                        a = this._indexOfKey(this._keys, a);
                        if (0 > a) return !1;
                        this._keys.splice(a, 1);
                        this._values.splice(a, 1);
                        return !0
                    };
                    b.prototype.entries = function () {
                        var b = this, f = this._keys.map(function (a, d) {
                            return [a, b._values[d]]
                        });
                        return new a.ShimIterator(f)
                    };
                    b.prototype.forEach = function (a, b) {
                        for (var d =
                            this._keys, f = this._values, e = 0, g = d.length; e < g; e++) a.call(b, f[e], d[e], this)
                    };
                    b.prototype.get = function (a) {
                        a = this._indexOfKey(this._keys, a);
                        return 0 > a ? void 0 : this._values[a]
                    };
                    b.prototype.has = function (a) {
                        return -1 < this._indexOfKey(this._keys, a)
                    };
                    b.prototype.keys = function () {
                        return new a.ShimIterator(this._keys)
                    };
                    b.prototype.set = function (a, b) {
                        var d = this._indexOfKey(this._keys, a), d = 0 > d ? this._keys.length : d;
                        this._keys[d] = a;
                        this._values[d] = b;
                        return this
                    };
                    b.prototype.values = function () {
                        return new a.ShimIterator(this._values)
                    };
                    b.prototype[Symbol.iterator] = function () {
                        return this.entries()
                    };
                    return b
                }(), g[Symbol.species] = g, g));
                c.default = c.Map;
                var g
            })
        }, "tslib/tslib": function () {
            var n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u, r;
            (function (a) {
                function b(a, b) {
                    a !== d && ("function" === typeof Object.create ? Object.defineProperty(a, "__esModule", {value: !0}) : a.__esModule = !0);
                    return function (d, f) {
                        return a[d] = b ? b(d, f) : f
                    }
                }

                var d = "object" === typeof global ? global : "object" === typeof self ? self : "object" === typeof this ? this : {};
                "function" === typeof define && define.amd ?
                    define("tslib", ["exports"], function (f) {
                        a(b(d, b(f)))
                    }) : "object" === typeof module && "object" === typeof module.exports ? a(b(d, b(module.exports))) : a(b(d))
            })(function (x) {
                var v = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (a, b) {
                    a.__proto__ = b
                } || function (a, b) {
                    for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d])
                };
                n = function (a, b) {
                    function d() {
                        this.constructor = a
                    }

                    v(a, b);
                    a.prototype = null === b ? Object.create(b) : (d.prototype = b.prototype, new d)
                };
                c = Object.assign || function (a) {
                    for (var b, d = 1, f = arguments.length; d <
                    f; d++) {
                        b = arguments[d];
                        for (var e in b) Object.prototype.hasOwnProperty.call(b, e) && (a[e] = b[e])
                    }
                    return a
                };
                e = function (a, b) {
                    var d = {}, f;
                    for (f in a) Object.prototype.hasOwnProperty.call(a, f) && 0 > b.indexOf(f) && (d[f] = a[f]);
                    if (null != a && "function" === typeof Object.getOwnPropertySymbols) {
                        var e = 0;
                        for (f = Object.getOwnPropertySymbols(a); e < f.length; e++) 0 > b.indexOf(f[e]) && (d[f[e]] = a[f[e]])
                    }
                    return d
                };
                a = function (a, b, d, f) {
                    var e = arguments.length,
                        g = 3 > e ? b : null === f ? f = Object.getOwnPropertyDescriptor(b, d) : f, c;
                    if ("object" === typeof Reflect &&
                        "function" === typeof Reflect.decorate) g = Reflect.decorate(a, b, d, f); else for (var m = a.length - 1; 0 <= m; m--) if (c = a[m]) g = (3 > e ? c(g) : 3 < e ? c(b, d, g) : c(b, d)) || g;
                    return 3 < e && g && Object.defineProperty(b, d, g), g
                };
                l = function (a, b) {
                    return function (d, f) {
                        b(d, f, a)
                    }
                };
                k = function (a, b) {
                    if ("object" === typeof Reflect && "function" === typeof Reflect.metadata) return Reflect.metadata(a, b)
                };
                h = function (a, b, d, f) {
                    return new (d || (d = Promise))(function (e, g) {
                        function c(a) {
                            try {
                                h(f.next(a))
                            } catch (I) {
                                g(I)
                            }
                        }

                        function m(a) {
                            try {
                                h(f["throw"](a))
                            } catch (I) {
                                g(I)
                            }
                        }

                        function h(a) {
                            a.done ? e(a.value) : (new d(function (b) {
                                b(a.value)
                            })).then(c, m)
                        }

                        h((f = f.apply(a, b || [])).next())
                    })
                };
                g = function (a, b) {
                    function d(a) {
                        return function (b) {
                            return f([a, b])
                        }
                    }

                    function f(d) {
                        if (g) throw new TypeError("Generator is already executing.");
                        for (; e;) try {
                            if (g = 1, c && (m = c[d[0] & 2 ? "return" : d[0] ? "throw" : "next"]) && !(m = m.call(c, d[1])).done) return m;
                            if (c = 0, m) d = [0, m.value];
                            switch (d[0]) {
                                case 0:
                                case 1:
                                    m = d;
                                    break;
                                case 4:
                                    return e.label++, {value: d[1], done: !1};
                                case 5:
                                    e.label++;
                                    c = d[1];
                                    d = [0];
                                    continue;
                                case 7:
                                    d =
                                        e.ops.pop();
                                    e.trys.pop();
                                    continue;
                                default:
                                    if (!(m = e.trys, m = 0 < m.length && m[m.length - 1]) && (6 === d[0] || 2 === d[0])) {
                                        e = 0;
                                        continue
                                    }
                                    if (3 === d[0] && (!m || d[1] > m[0] && d[1] < m[3])) e.label = d[1]; else if (6 === d[0] && e.label < m[1]) e.label = m[1], m = d; else if (m && e.label < m[2]) e.label = m[2], e.ops.push(d); else {
                                        m[2] && e.ops.pop();
                                        e.trys.pop();
                                        continue
                                    }
                            }
                            d = b.call(a, e)
                        } catch (I) {
                            d = [6, I], c = 0
                        } finally {
                            g = m = 0
                        }
                        if (d[0] & 5) throw d[1];
                        return {value: d[0] ? d[1] : void 0, done: !0}
                    }

                    var e = {
                        label: 0, sent: function () {
                            if (m[0] & 1) throw m[1];
                            return m[1]
                        }, trys: [],
                        ops: []
                    }, g, c, m, h;
                    return h = {
                        next: d(0),
                        "throw": d(1),
                        "return": d(2)
                    }, "function" === typeof Symbol && (h[Symbol.iterator] = function () {
                        return this
                    }), h
                };
                b = function (a, b) {
                    for (var d in a) b.hasOwnProperty(d) || (b[d] = a[d])
                };
                d = function (a) {
                    var b = "function" === typeof Symbol && a[Symbol.iterator], d = 0;
                    return b ? b.call(a) : {
                        next: function () {
                            a && d >= a.length && (a = void 0);
                            return {value: a && a[d++], done: !a}
                        }
                    }
                };
                f = function (a, b) {
                    var d = "function" === typeof Symbol && a[Symbol.iterator];
                    if (!d) return a;
                    a = d.call(a);
                    var f, e = [], g;
                    try {
                        for (; (void 0 ===
                            b || 0 < b--) && !(f = a.next()).done;) e.push(f.value)
                    } catch (D) {
                        g = {error: D}
                    } finally {
                        try {
                            f && !f.done && (d = a["return"]) && d.call(a)
                        } finally {
                            if (g) throw g.error;
                        }
                    }
                    return e
                };
                m = function () {
                    for (var a = [], b = 0; b < arguments.length; b++) a = a.concat(f(arguments[b]));
                    return a
                };
                q = function (a) {
                    return this instanceof q ? (this.v = a, this) : new q(a)
                };
                p = function (a, b, d) {
                    function f(a) {
                        h[a] && (l[a] = function (b) {
                            return new Promise(function (d, f) {
                                1 < p.push([a, b, d, f]) || e(a, b)
                            })
                        })
                    }

                    function e(a, b) {
                        try {
                            var d = h[a](b);
                            d.value instanceof q ? Promise.resolve(d.value.v).then(g,
                                c) : m(p[0][2], d)
                        } catch (W) {
                            m(p[0][3], W)
                        }
                    }

                    function g(a) {
                        e("next", a)
                    }

                    function c(a) {
                        e("throw", a)
                    }

                    function m(a, b) {
                        (a(b), p.shift(), p.length) && e(p[0][0], p[0][1])
                    }

                    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
                    var h = d.apply(a, b || []), l, p = [];
                    return l = {}, f("next"), f("throw"), f("return"), l[Symbol.asyncIterator] = function () {
                        return this
                    }, l
                };
                t = function (a) {
                    function b(b, e) {
                        a[b] && (d[b] = function (d) {
                            return (f = !f) ? {value: q(a[b](d)), done: "return" === b} : e ? e(d) : d
                        })
                    }

                    var d, f;
                    return d = {}, b("next"),
                        b("throw", function (a) {
                            throw a;
                        }), b("return"), d[Symbol.iterator] = function () {
                        return this
                    }, d
                };
                u = function (a) {
                    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
                    var b = a[Symbol.asyncIterator];
                    return b ? b.call(a) : "function" === typeof d ? d(a) : a[Symbol.iterator]()
                };
                r = function (a, b) {
                    Object.defineProperty ? Object.defineProperty(a, "raw", {value: b}) : a.raw = b;
                    return a
                };
                x("__extends", n);
                x("__assign", c);
                x("__rest", e);
                x("__decorate", a);
                x("__param", l);
                x("__metadata", k);
                x("__awaiter", h);
                x("__generator",
                    g);
                x("__exportStar", b);
                x("__values", d);
                x("__read", f);
                x("__spread", m);
                x("__await", q);
                x("__asyncGenerator", p);
                x("__asyncDelegator", t);
                x("__asyncValues", u);
                x("__makeTemplateObject", r)
            })
        }, "@dojo/shim/iterator": function () {
            (function (n) {
                "object" === typeof module && "object" === typeof module.exports ? (n = n(require, exports), void 0 !== n && (module.exports = n)) : "function" === typeof define && define.amd && define(["require", "exports", "./Symbol", "./string"], n)
            })(function (n, c) {
                function e(a) {
                    return a && "function" === typeof a[Symbol.iterator]
                }

                function a(a) {
                    return a && "number" === typeof a.length
                }

                function l(b) {
                    if (e(b)) return b[Symbol.iterator]();
                    if (a(b)) return new g(b)
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                n("./Symbol");
                var k = n("./string"), h = {done: !0, value: void 0}, g = function () {
                    function a(a) {
                        this._nextIndex = -1;
                        e(a) ? this._nativeIterator = a[Symbol.iterator]() : this._list = a
                    }

                    a.prototype.next = function () {
                        return this._nativeIterator ? this._nativeIterator.next() : this._list ? ++this._nextIndex < this._list.length ? {
                                done: !1,
                                value: this._list[this._nextIndex]
                            } :
                            h : h
                    };
                    a.prototype[Symbol.iterator] = function () {
                        return this
                    };
                    return a
                }();
                c.ShimIterator = g;
                c.isIterable = e;
                c.isArrayLike = a;
                c.get = l;
                c.forOf = function (b, d, f) {
                    function e() {
                        g = !0
                    }

                    var g = !1;
                    if (a(b) && "string" === typeof b) for (var c = b.length, h = 0; h < c; ++h) {
                        var u = b[h];
                        if (h + 1 < c) {
                            var r = u.charCodeAt(0);
                            r >= k.HIGH_SURROGATE_MIN && r <= k.HIGH_SURROGATE_MAX && (u += b[++h])
                        }
                        d.call(f, u, b, e);
                        if (g) break
                    } else if (c = l(b)) for (h = c.next(); !h.done;) {
                        d.call(f, h.value, b, e);
                        if (g) break;
                        h = c.next()
                    }
                }
            })
        }, "@dojo/shim/Symbol": function () {
            (function (n) {
                "object" ===
                typeof module && "object" === typeof module.exports ? (n = n(require, exports), void 0 !== n && (module.exports = n)) : "function" === typeof define && define.amd && define(["require", "exports", "./support/has", "./global", "./support/util"], n)
            })(function (n, c) {
                function e(a) {
                    return a && ("symbol" === typeof a || "Symbol" === a["@@toStringTag"]) || !1
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                var a = n("./support/has"), l = n("./global"), k = n("./support/util");
                c.Symbol = l.default.Symbol;
                if (!a.default("es6-symbol")) {
                    var h = function (a) {
                            if (!e(a)) throw new TypeError(a +
                                " is not a symbol");
                            return a
                        }, g = Object.defineProperties, b = Object.defineProperty, d = Object.create, f = Object.prototype,
                        m = {}, q = function () {
                            var a = d(null);
                            return function (d) {
                                for (var e = 0, g; a[String(d) + (e || "")];) ++e;
                                d += String(e || "");
                                a[d] = !0;
                                g = "@@" + d;
                                Object.getOwnPropertyDescriptor(f, g) || b(f, g, {
                                    set: function (a) {
                                        b(this, g, k.getValueDescriptor(a))
                                    }
                                });
                                return g
                            }
                        }(), p = function u(a) {
                            if (this instanceof p) throw new TypeError("TypeError: Symbol is not a constructor");
                            return u(a)
                        };
                    c.Symbol = l.default.Symbol = function r(a) {
                        if (this instanceof
                            r) throw new TypeError("TypeError: Symbol is not a constructor");
                        var b = Object.create(p.prototype);
                        a = void 0 === a ? "" : String(a);
                        return g(b, {__description__: k.getValueDescriptor(a), __name__: k.getValueDescriptor(q(a))})
                    };
                    b(c.Symbol, "for", k.getValueDescriptor(function (a) {
                        return m[a] ? m[a] : m[a] = c.Symbol(String(a))
                    }));
                    g(c.Symbol, {
                        keyFor: k.getValueDescriptor(function (a) {
                            var b;
                            h(a);
                            for (b in m) if (m[b] === a) return b
                        }),
                        hasInstance: k.getValueDescriptor(c.Symbol.for("hasInstance"), !1, !1),
                        isConcatSpreadable: k.getValueDescriptor(c.Symbol.for("isConcatSpreadable"),
                            !1, !1),
                        iterator: k.getValueDescriptor(c.Symbol.for("iterator"), !1, !1),
                        match: k.getValueDescriptor(c.Symbol.for("match"), !1, !1),
                        observable: k.getValueDescriptor(c.Symbol.for("observable"), !1, !1),
                        replace: k.getValueDescriptor(c.Symbol.for("replace"), !1, !1),
                        search: k.getValueDescriptor(c.Symbol.for("search"), !1, !1),
                        species: k.getValueDescriptor(c.Symbol.for("species"), !1, !1),
                        split: k.getValueDescriptor(c.Symbol.for("split"), !1, !1),
                        toPrimitive: k.getValueDescriptor(c.Symbol.for("toPrimitive"), !1, !1),
                        toStringTag: k.getValueDescriptor(c.Symbol.for("toStringTag"),
                            !1, !1),
                        unscopables: k.getValueDescriptor(c.Symbol.for("unscopables"), !1, !1)
                    });
                    g(p.prototype, {
                        constructor: k.getValueDescriptor(c.Symbol),
                        toString: k.getValueDescriptor(function () {
                            return this.__name__
                        }, !1, !1)
                    });
                    g(c.Symbol.prototype, {
                        toString: k.getValueDescriptor(function () {
                            return "Symbol (" + h(this).__description__ + ")"
                        }), valueOf: k.getValueDescriptor(function () {
                            return h(this)
                        })
                    });
                    b(c.Symbol.prototype, c.Symbol.toPrimitive, k.getValueDescriptor(function () {
                        return h(this)
                    }));
                    b(c.Symbol.prototype, c.Symbol.toStringTag,
                        k.getValueDescriptor("Symbol", !1, !1, !0));
                    b(p.prototype, c.Symbol.toPrimitive, k.getValueDescriptor(c.Symbol.prototype[c.Symbol.toPrimitive], !1, !1, !0));
                    b(p.prototype, c.Symbol.toStringTag, k.getValueDescriptor(c.Symbol.prototype[c.Symbol.toStringTag], !1, !1, !0))
                }
                c.isSymbol = e;
                "hasInstance isConcatSpreadable iterator species replace search split match toPrimitive toStringTag unscopables observable".split(" ").forEach(function (a) {
                    c.Symbol[a] || Object.defineProperty(c.Symbol, a, k.getValueDescriptor(c.Symbol.for(a),
                        !1, !1))
                });
                c.default = c.Symbol
            })
        }, "@dojo/shim/support/has": function () {
            (function (n) {
                "object" === typeof module && "object" === typeof module.exports ? (n = n(require, exports), void 0 !== n && (module.exports = n)) : "function" === typeof define && define.amd && define("require exports tslib @dojo/has/has ../global @dojo/has/has".split(" "), n)
            })(function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var e = n("tslib"), a = n("@dojo/has/has"), l = n("../global");
                c.default = a.default;
                e.__exportStar(n("@dojo/has/has"), c);
                a.add("es6-array",
                    function () {
                        return ["from", "of"].every(function (a) {
                            return a in l.default.Array
                        }) && ["findIndex", "find", "copyWithin"].every(function (a) {
                            return a in l.default.Array.prototype
                        })
                    }, !0);
                a.add("es6-array-fill", function () {
                    return "fill" in l.default.Array.prototype ? 1 === [1].fill(9, Number.POSITIVE_INFINITY)[0] : !1
                }, !0);
                a.add("es7-array", function () {
                    return "includes" in l.default.Array.prototype
                }, !0);
                a.add("es6-map", function () {
                    if ("function" === typeof l.default.Map) try {
                        var e = new l.default.Map([[0, 1]]);
                        return e.has(0) &&
                            "function" === typeof e.keys && a.default("es6-symbol") && "function" === typeof e.values && "function" === typeof e.entries
                    } catch (g) {
                    }
                    return !1
                }, !0);
                a.add("es6-math", function () {
                    return "clz32 sign log10 log2 log1p expm1 cosh sinh tanh acosh asinh atanh trunc fround cbrt hypot".split(" ").every(function (a) {
                        return "function" === typeof l.default.Math[a]
                    })
                }, !0);
                a.add("es6-math-imul", function () {
                    return "imul" in l.default.Math ? -5 === Math.imul(4294967295, 5) : !1
                }, !0);
                a.add("es6-object", function () {
                    return a.default("es6-symbol") &&
                        ["assign", "is", "getOwnPropertySymbols", "setPrototypeOf"].every(function (a) {
                            return "function" === typeof l.default.Object[a]
                        })
                }, !0);
                a.add("es2017-object", function () {
                    return ["values", "entries", "getOwnPropertyDescriptors"].every(function (a) {
                        return "function" === typeof l.default.Object[a]
                    })
                }, !0);
                a.add("es-observable", function () {
                    return "undefined" !== typeof l.default.Observable
                }, !0);
                a.add("es6-promise", function () {
                    return "undefined" !== typeof l.default.Promise && a.default("es6-symbol")
                }, !0);
                a.add("es6-set", function () {
                    if ("function" ===
                        typeof l.default.Set) {
                        var e = new l.default.Set([1]);
                        return e.has(1) && "keys" in e && "function" === typeof e.keys && a.default("es6-symbol")
                    }
                    return !1
                }, !0);
                a.add("es6-string", function () {
                    return ["fromCodePoint"].every(function (a) {
                        return "function" === typeof l.default.String[a]
                    }) && "codePointAt normalize repeat startsWith endsWith includes".split(" ").every(function (a) {
                        return "function" === typeof l.default.String.prototype[a]
                    })
                }, !0);
                a.add("es6-string-raw", function () {
                    function a(a) {
                        for (var b = 1; b < arguments.length; b++) ;
                        b = e.__spread(a);
                        b.raw = a.raw;
                        return b
                    }

                    if ("raw" in l.default.String) {
                        var g = a(k || (k = e.__makeTemplateObject(["a\n", ""], ["a\\n", ""])), 1);
                        g.raw = ["a\\n"];
                        return "a:\\n" === l.default.String.raw(g, 42)
                    }
                    return !1
                }, !0);
                a.add("es2017-string", function () {
                    return ["padStart", "padEnd"].every(function (a) {
                        return "function" === typeof l.default.String.prototype[a]
                    })
                }, !0);
                a.add("es6-symbol", function () {
                    return "undefined" !== typeof l.default.Symbol && "symbol" === typeof Symbol()
                }, !0);
                a.add("es6-weakmap", function () {
                    if ("undefined" !== typeof l.default.WeakMap) {
                        var e =
                            {}, g = {}, b = new l.default.WeakMap([[e, 1]]);
                        Object.freeze(e);
                        return 1 === b.get(e) && b.set(g, 2) === b && a.default("es6-symbol")
                    }
                    return !1
                }, !0);
                a.add("microtasks", function () {
                    return a.default("es6-promise") || a.default("host-node") || a.default("dom-mutationobserver")
                }, !0);
                a.add("postmessage", function () {
                    return "undefined" !== typeof l.default.window && "function" === typeof l.default.postMessage
                }, !0);
                a.add("raf", function () {
                    return "function" === typeof l.default.requestAnimationFrame
                }, !0);
                a.add("setimmediate", function () {
                    return "undefined" !==
                        typeof l.default.setImmediate
                }, !0);
                a.add("dom-mutationobserver", function () {
                    if (a.default("host-browser") && (l.default.MutationObserver || l.default.WebKitMutationObserver)) {
                        var e = document.createElement("div"),
                            g = new (l.default.MutationObserver || l.default.WebKitMutationObserver)(function () {
                            });
                        g.observe(e, {attributes: !0});
                        e.style.setProperty("display", "block");
                        return !!g.takeRecords().length
                    }
                    return !1
                }, !0);
                a.add("dom-webanimation", function () {
                    return a.default("host-browser") && void 0 !== l.default.Animation &&
                        void 0 !== l.default.KeyframeEffect
                }, !0);
                var k
            })
        }, "@dojo/has/has": function () {
            (function (n) {
                "object" === typeof module && "object" === typeof module.exports ? (n = n(require, exports), void 0 !== n && (module.exports = n)) : "function" === typeof define && define.amd && define(["require", "exports"], n)
            })(function (n, c) {
                function e(a) {
                    a = a.toLowerCase();
                    return !!(a in g || a in c.testCache || c.testFunctions[a])
                }

                function a(a, d, f) {
                    void 0 === f && (f = !1);
                    var b = a.toLowerCase();
                    if (e(b) && !f && !(b in g)) throw new TypeError('Feature "' + a + '" exists and overwrite not true.');
                    "function" === typeof d ? c.testFunctions[b] = d : d && d.then ? k[a] = d.then(function (b) {
                        c.testCache[a] = b;
                        delete k[a]
                    }, function () {
                        delete k[a]
                    }) : (c.testCache[b] = d, delete c.testFunctions[b])
                }

                function l(a) {
                    var b = a.toLowerCase();
                    if (b in g) a = g[b]; else if (c.testFunctions[b]) a = c.testCache[b] = c.testFunctions[b].call(null), delete c.testFunctions[b]; else if (b in c.testCache) a = c.testCache[b]; else {
                        if (a in k) return !1;
                        throw new TypeError('Attempt to detect unregistered has feature "' + a + '"');
                    }
                    return a
                }

                Object.defineProperty(c,
                    "__esModule", {value: !0});
                c.testCache = {};
                c.testFunctions = {};
                var k = {};
                n = "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : {};
                var h = (n.DojoHasEnvironment || {}).staticFeatures;
                "DojoHasEnvironment" in n && delete n.DojoHasEnvironment;
                var g = h ? "function" === typeof h ? h.apply(n) : h : {};
                c.load = function (a, d, f, e) {
                    a ? d([a], f) : f()
                };
                c.normalize = function (a, d) {
                    function b(a) {
                        var d = e[g++];
                        if (":" === d) return null;
                        if ("?" === e[g++]) {
                            if (!a && l(d)) return b();
                            b(!0);
                            return b(a)
                        }
                        return d
                    }

                    var e = a.match(/[\?:]|[^:\?]*/g) || [], g = 0;
                    return (a = b()) && d(a)
                };
                c.exists = e;
                c.add = a;
                c.default = l;
                a("debug", !0);
                a("host-browser", "undefined" !== typeof document && "undefined" !== typeof location);
                a("host-node", function () {
                    if ("object" === typeof process && process.versions && process.versions.node) return process.versions.node
                })
            })
        }, "@dojo/shim/global": function () {
            (function (n) {
                "object" === typeof module && "object" === typeof module.exports ? (n = n(require, exports), void 0 !== n && (module.exports = n)) : "function" === typeof define && define.amd &&
                    define(["require", "exports"], n)
            })(function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    if ("undefined" !== typeof global) return global;
                    if ("undefined" !== typeof window) return window;
                    if ("undefined" !== typeof self) return self
                }();
                c.default = n
            })
        }, "@dojo/shim/support/util": function () {
            (function (n) {
                "object" === typeof module && "object" === typeof module.exports ? (n = n(require, exports), void 0 !== n && (module.exports = n)) : "function" === typeof define && define.amd && define(["require", "exports"], n)
            })(function (n,
                         c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.getValueDescriptor = function (e, a, c, k) {
                    void 0 === a && (a = !1);
                    void 0 === c && (c = !0);
                    void 0 === k && (k = !0);
                    return {value: e, enumerable: a, writable: c, configurable: k}
                };
                c.wrapNative = function (e) {
                    return function (a) {
                        for (var c = [], k = 1; k < arguments.length; k++) c[k - 1] = arguments[k];
                        return e.apply(a, c)
                    }
                }
            })
        }, "@dojo/shim/string": function () {
            (function (n) {
                "object" === typeof module && "object" === typeof module.exports ? (n = n(require, exports), void 0 !== n && (module.exports = n)) : "function" ===
                    typeof define && define.amd && define("require exports tslib ./global ./support/has ./support/util".split(" "), n)
            })(function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var e = n("tslib"), a = n("./global"), l = n("./support/has");
                n = n("./support/util");
                c.HIGH_SURROGATE_MIN = 55296;
                c.HIGH_SURROGATE_MAX = 56319;
                c.LOW_SURROGATE_MIN = 56320;
                c.LOW_SURROGATE_MAX = 57343;
                if (l.default("es6-string") && l.default("es6-string-raw")) c.fromCodePoint = a.default.String.fromCodePoint, c.raw = a.default.String.raw, c.codePointAt =
                    n.wrapNative(a.default.String.prototype.codePointAt), c.endsWith = n.wrapNative(a.default.String.prototype.endsWith), c.includes = n.wrapNative(a.default.String.prototype.includes), c.normalize = n.wrapNative(a.default.String.prototype.normalize), c.repeat = n.wrapNative(a.default.String.prototype.repeat), c.startsWith = n.wrapNative(a.default.String.prototype.startsWith); else {
                    var k = function (a, e, b, d, f) {
                        void 0 === f && (f = !1);
                        if (null == e) throw new TypeError("string." + a + " requires a valid string to search against.");
                        a =
                            e.length;
                        return [e, String(b), Math.min(Math.max(d !== d ? f ? a : 0 : d, 0), a)]
                    };
                    c.fromCodePoint = function () {
                        for (var a = 0; a < arguments.length; a++) ;
                        a = arguments.length;
                        if (!a) return "";
                        for (var e = String.fromCharCode, b = [], d = -1, f = ""; ++d < a;) {
                            var m = Number(arguments[d]);
                            if (!(isFinite(m) && Math.floor(m) === m && 0 <= m && 1114111 >= m)) throw RangeError("string.fromCodePoint: Invalid code point " + m);
                            65535 >= m ? b.push(m) : (m -= 65536, b.push((m >> 10) + c.HIGH_SURROGATE_MIN, m % 1024 + c.LOW_SURROGATE_MIN));
                            if (d + 1 === a || 16384 < b.length) f += e.apply(null,
                                b), b.length = 0
                        }
                        return f
                    };
                    c.raw = function (a) {
                        for (var e = [], b = 1; b < arguments.length; b++) e[b - 1] = arguments[b];
                        var b = a.raw, d = "", f = e.length;
                        if (null == a || null == a.raw) throw new TypeError("string.raw requires a valid callSite object with a raw value");
                        for (var c = 0, h = b.length; c < h; c++) d += b[c] + (c < f && c < h - 1 ? e[c] : "");
                        return d
                    };
                    c.codePointAt = function (a, e) {
                        void 0 === e && (e = 0);
                        if (null == a) throw new TypeError("string.codePointAt requries a valid string.");
                        var b = a.length;
                        e !== e && (e = 0);
                        if (!(0 > e || e >= b)) {
                            var d = a.charCodeAt(e);
                            return d >=
                            c.HIGH_SURROGATE_MIN && d <= c.HIGH_SURROGATE_MAX && b > e + 1 && (a = a.charCodeAt(e + 1), a >= c.LOW_SURROGATE_MIN && a <= c.LOW_SURROGATE_MAX) ? 1024 * (d - c.HIGH_SURROGATE_MIN) + a - c.LOW_SURROGATE_MIN + 65536 : d
                        }
                    };
                    c.endsWith = function (a, g, b) {
                        null == b && (b = a.length);
                        b = e.__read(k("endsWith", a, g, b, !0), 3);
                        a = b[0];
                        g = b[1];
                        b = b[2];
                        var d = b - g.length;
                        return 0 > d ? !1 : a.slice(d, b) === g
                    };
                    c.includes = function (a, g, b) {
                        void 0 === b && (b = 0);
                        b = e.__read(k("includes", a, g, b), 3);
                        a = b[0];
                        g = b[1];
                        b = b[2];
                        return -1 !== a.indexOf(g, b)
                    };
                    c.repeat = function (a, e) {
                        void 0 === e &&
                        (e = 0);
                        if (null == a) throw new TypeError("string.repeat requires a valid string.");
                        e !== e && (e = 0);
                        if (0 > e || Infinity === e) throw new RangeError("string.repeat requires a non-negative finite count.");
                        for (var b = ""; e;) e % 2 && (b += a), 1 < e && (a += a), e >>= 1;
                        return b
                    };
                    c.startsWith = function (a, g, b) {
                        void 0 === b && (b = 0);
                        g = String(g);
                        b = e.__read(k("startsWith", a, g, b), 3);
                        a = b[0];
                        g = b[1];
                        b = b[2];
                        var d = b + g.length;
                        return d > a.length ? !1 : a.slice(b, d) === g
                    }
                }
                l.default("es2017-string") ? (c.padEnd = n.wrapNative(a.default.String.prototype.padEnd),
                    c.padStart = n.wrapNative(a.default.String.prototype.padStart)) : (c.padEnd = function (a, e, b) {
                    void 0 === b && (b = " ");
                    if (null === a || void 0 === a) throw new TypeError("string.repeat requires a valid string.");
                    if (Infinity === e) throw new RangeError("string.padEnd requires a non-negative finite count.");
                    if (null === e || void 0 === e || 0 > e) e = 0;
                    a = String(a);
                    e -= a.length;
                    0 < e && (a += c.repeat(b, Math.floor(e / b.length)) + b.slice(0, e % b.length));
                    return a
                }, c.padStart = function (a, e, b) {
                    void 0 === b && (b = " ");
                    if (null === a || void 0 === a) throw new TypeError("string.repeat requires a valid string.");
                    if (Infinity === e) throw new RangeError("string.padStart requires a non-negative finite count.");
                    if (null === e || void 0 === e || 0 > e) e = 0;
                    a = String(a);
                    e -= a.length;
                    0 < e && (a = c.repeat(b, Math.floor(e / b.length)) + b.slice(0, e % b.length) + a);
                    return a
                })
            })
        }, "@dojo/shim/object": function () {
            (function (n) {
                "object" === typeof module && "object" === typeof module.exports ? (n = n(require, exports), void 0 !== n && (module.exports = n)) : "function" === typeof define && define.amd && define(["require", "exports", "./global", "./support/has", "./Symbol"], n)
            })(function (n,
                         c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var e = n("./global"), a = n("./support/has"), l = n("./Symbol");
                a.default("es6-object") ? (n = e.default.Object, c.assign = n.assign, c.getOwnPropertyDescriptor = n.getOwnPropertyDescriptor, c.getOwnPropertyNames = n.getOwnPropertyNames, c.getOwnPropertySymbols = n.getOwnPropertySymbols, c.is = n.is, c.keys = n.keys) : (c.keys = function (a) {
                    return Object.keys(a).filter(function (a) {
                        return !a.match(/^@@.+/)
                    })
                }, c.assign = function (a) {
                    for (var e = [], g = 1; g < arguments.length; g++) e[g - 1] = arguments[g];
                    if (null == a) throw new TypeError("Cannot convert undefined or null to object");
                    var b = Object(a);
                    e.forEach(function (a) {
                        a && c.keys(a).forEach(function (d) {
                            b[d] = a[d]
                        })
                    });
                    return b
                }, c.getOwnPropertyDescriptor = function (a, e) {
                    l.isSymbol(e);
                    return Object.getOwnPropertyDescriptor(a, e)
                }, c.getOwnPropertyNames = function (a) {
                    return Object.getOwnPropertyNames(a).filter(function (a) {
                        return !a.match(/^@@.+/)
                    })
                }, c.getOwnPropertySymbols = function (a) {
                    return Object.getOwnPropertyNames(a).filter(function (a) {
                        return !!a.match(/^@@.+/)
                    }).map(function (a) {
                        return Symbol.for(a.substring(2))
                    })
                },
                    c.is = function (a, e) {
                        return a === e ? 0 !== a || 1 / a === 1 / e : a !== a && e !== e
                    });
                a.default("es2017-object") ? (n = e.default.Object, c.getOwnPropertyDescriptors = n.getOwnPropertyDescriptors, c.entries = n.entries, c.values = n.values) : (c.getOwnPropertyDescriptors = function (a) {
                    return c.getOwnPropertyNames(a).reduce(function (e, g) {
                        e[g] = c.getOwnPropertyDescriptor(a, g);
                        return e
                    }, {})
                }, c.entries = function (a) {
                    return c.keys(a).map(function (e) {
                        return [e, a[e]]
                    })
                }, c.values = function (a) {
                    return c.keys(a).map(function (e) {
                        return a[e]
                    })
                })
            })
        }, "esri/core/libs/gl-matrix/mat2d": function () {
            define(["./common"],
                function (n) {
                    var c = {
                        create: function () {
                            var e = new n.ARRAY_TYPE(6);
                            e[0] = 1;
                            e[1] = 0;
                            e[2] = 0;
                            e[3] = 1;
                            e[4] = 0;
                            e[5] = 0;
                            return e
                        }, clone: function (e) {
                            var a = new n.ARRAY_TYPE(6);
                            a[0] = e[0];
                            a[1] = e[1];
                            a[2] = e[2];
                            a[3] = e[3];
                            a[4] = e[4];
                            a[5] = e[5];
                            return a
                        }, copy: function (e, a) {
                            e[0] = a[0];
                            e[1] = a[1];
                            e[2] = a[2];
                            e[3] = a[3];
                            e[4] = a[4];
                            e[5] = a[5];
                            return e
                        }, identity: function (e) {
                            e[0] = 1;
                            e[1] = 0;
                            e[2] = 0;
                            e[3] = 1;
                            e[4] = 0;
                            e[5] = 0;
                            return e
                        }, fromValues: function (e, a, c, k, h, g) {
                            var b = new n.ARRAY_TYPE(6);
                            b[0] = e;
                            b[1] = a;
                            b[2] = c;
                            b[3] = k;
                            b[4] = h;
                            b[5] = g;
                            return b
                        },
                        set: function (e, a, c, k, h, g, b) {
                            e[0] = a;
                            e[1] = c;
                            e[2] = k;
                            e[3] = h;
                            e[4] = g;
                            e[5] = b;
                            return e
                        }, invert: function (e, a) {
                            var c = a[0], k = a[1], h = a[2], g = a[3], b = a[4];
                            a = a[5];
                            var d = c * g - k * h;
                            if (!d) return null;
                            d = 1 / d;
                            e[0] = g * d;
                            e[1] = -k * d;
                            e[2] = -h * d;
                            e[3] = c * d;
                            e[4] = (h * a - g * b) * d;
                            e[5] = (k * b - c * a) * d;
                            return e
                        }, determinant: function (e) {
                            return e[0] * e[3] - e[1] * e[2]
                        }, multiply: function (e, a, c) {
                            var l = a[0], h = a[1], g = a[2], b = a[3], d = a[4];
                            a = a[5];
                            var f = c[0], m = c[1], q = c[2], p = c[3], t = c[4];
                            c = c[5];
                            e[0] = l * f + g * m;
                            e[1] = h * f + b * m;
                            e[2] = l * q + g * p;
                            e[3] = h * q + b * p;
                            e[4] = l * t + g * c +
                                d;
                            e[5] = h * t + b * c + a;
                            return e
                        }
                    };
                    c.mul = c.multiply;
                    c.rotate = function (e, a, c) {
                        var l = a[0], h = a[1], g = a[2], b = a[3], d = a[4];
                        a = a[5];
                        var f = Math.sin(c);
                        c = Math.cos(c);
                        e[0] = l * c + g * f;
                        e[1] = h * c + b * f;
                        e[2] = l * -f + g * c;
                        e[3] = h * -f + b * c;
                        e[4] = d;
                        e[5] = a;
                        return e
                    };
                    c.scale = function (e, a, c) {
                        var l = a[1], h = a[2], g = a[3], b = a[4], d = a[5], f = c[0];
                        c = c[1];
                        e[0] = a[0] * f;
                        e[1] = l * f;
                        e[2] = h * c;
                        e[3] = g * c;
                        e[4] = b;
                        e[5] = d;
                        return e
                    };
                    c.translate = function (e, a, c) {
                        var l = a[0], h = a[1], g = a[2], b = a[3], d = a[4];
                        a = a[5];
                        var f = c[0];
                        c = c[1];
                        e[0] = l;
                        e[1] = h;
                        e[2] = g;
                        e[3] = b;
                        e[4] = l * f + g * c + d;
                        e[5] = h * f + b * c + a;
                        return e
                    };
                    c.fromRotation = function (e, a) {
                        var c = Math.sin(a);
                        a = Math.cos(a);
                        e[0] = a;
                        e[1] = c;
                        e[2] = -c;
                        e[3] = a;
                        e[4] = 0;
                        e[5] = 0;
                        return e
                    };
                    c.fromScaling = function (e, a) {
                        e[0] = a[0];
                        e[1] = 0;
                        e[2] = 0;
                        e[3] = a[1];
                        e[4] = 0;
                        e[5] = 0;
                        return e
                    };
                    c.fromTranslation = function (e, a) {
                        e[0] = 1;
                        e[1] = 0;
                        e[2] = 0;
                        e[3] = 1;
                        e[4] = a[0];
                        e[5] = a[1];
                        return e
                    };
                    c.str = function (e) {
                        return "mat2d(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ", " + e[4] + ", " + e[5] + ")"
                    };
                    c.frob = function (e) {
                        return Math.sqrt(Math.pow(e[0], 2) + Math.pow(e[1], 2) + Math.pow(e[2], 2) + Math.pow(e[3],
                            2) + Math.pow(e[4], 2) + Math.pow(e[5], 2) + 1)
                    };
                    c.add = function (e, a, c) {
                        e[0] = a[0] + c[0];
                        e[1] = a[1] + c[1];
                        e[2] = a[2] + c[2];
                        e[3] = a[3] + c[3];
                        e[4] = a[4] + c[4];
                        e[5] = a[5] + c[5];
                        return e
                    };
                    c.subtract = function (e, a, c) {
                        e[0] = a[0] - c[0];
                        e[1] = a[1] - c[1];
                        e[2] = a[2] - c[2];
                        e[3] = a[3] - c[3];
                        e[4] = a[4] - c[4];
                        e[5] = a[5] - c[5];
                        return e
                    };
                    c.sub = c.subtract;
                    c.multiplyScalar = function (e, a, c) {
                        e[0] = a[0] * c;
                        e[1] = a[1] * c;
                        e[2] = a[2] * c;
                        e[3] = a[3] * c;
                        e[4] = a[4] * c;
                        e[5] = a[5] * c;
                        return e
                    };
                    c.multiplyScalarAndAdd = function (e, a, c, k) {
                        e[0] = a[0] + c[0] * k;
                        e[1] = a[1] + c[1] * k;
                        e[2] =
                            a[2] + c[2] * k;
                        e[3] = a[3] + c[3] * k;
                        e[4] = a[4] + c[4] * k;
                        e[5] = a[5] + c[5] * k;
                        return e
                    };
                    c.exactEquals = function (e, a) {
                        return e[0] === a[0] && e[1] === a[1] && e[2] === a[2] && e[3] === a[3] && e[4] === a[4] && e[5] === a[5]
                    };
                    c.equals = function (e, a) {
                        var c = e[0], k = e[1], h = e[2], g = e[3], b = e[4];
                        e = e[5];
                        var d = a[0], f = a[1], m = a[2], q = a[3], p = a[4];
                        a = a[5];
                        return Math.abs(c - d) <= n.EPSILON * Math.max(1, Math.abs(c), Math.abs(d)) && Math.abs(k - f) <= n.EPSILON * Math.max(1, Math.abs(k), Math.abs(f)) && Math.abs(h - m) <= n.EPSILON * Math.max(1, Math.abs(h), Math.abs(m)) && Math.abs(g -
                            q) <= n.EPSILON * Math.max(1, Math.abs(g), Math.abs(q)) && Math.abs(b - p) <= n.EPSILON * Math.max(1, Math.abs(b), Math.abs(p)) && Math.abs(e - a) <= n.EPSILON * Math.max(1, Math.abs(e), Math.abs(a))
                    };
                    return c
                })
        }, "esri/core/libs/gl-matrix/common": function () {
            define([], function () {
                var n = {EPSILON: 1E-6};
                n.ARRAY_TYPE = "undefined" !== typeof Float32Array ? Float32Array : Array;
                n.RANDOM = Math.random;
                n.ENABLE_SIMD = !1;
                n.SIMD_AVAILABLE = n.ARRAY_TYPE === Float32Array && "SIMD" in this;
                n.USE_SIMD = n.ENABLE_SIMD && n.SIMD_AVAILABLE;
                n.setMatrixArrayType =
                    function (e) {
                        n.ARRAY_TYPE = e
                    };
                var c = Math.PI / 180;
                n.toRadian = function (e) {
                    return e * c
                };
                n.equals = function (e, a) {
                    return Math.abs(e - a) <= n.EPSILON * Math.max(1, Math.abs(e), Math.abs(a))
                };
                return n
            })
        }, "esri/core/libs/gl-matrix/vec2": function () {
            define(["./common"], function (n) {
                var c = {
                    create: function () {
                        var e = new n.ARRAY_TYPE(2);
                        e[0] = 0;
                        e[1] = 0;
                        return e
                    }, clone: function (e) {
                        var a = new n.ARRAY_TYPE(2);
                        a[0] = e[0];
                        a[1] = e[1];
                        return a
                    }, fromValues: function (e, a) {
                        var c = new n.ARRAY_TYPE(2);
                        c[0] = e;
                        c[1] = a;
                        return c
                    }, copy: function (e, a) {
                        e[0] =
                            a[0];
                        e[1] = a[1];
                        return e
                    }, set: function (e, a, c) {
                        e[0] = a;
                        e[1] = c;
                        return e
                    }, add: function (e, a, c) {
                        e[0] = a[0] + c[0];
                        e[1] = a[1] + c[1];
                        return e
                    }, subtract: function (e, a, c) {
                        e[0] = a[0] - c[0];
                        e[1] = a[1] - c[1];
                        return e
                    }
                };
                c.sub = c.subtract;
                c.multiply = function (e, a, c) {
                    e[0] = a[0] * c[0];
                    e[1] = a[1] * c[1];
                    return e
                };
                c.mul = c.multiply;
                c.divide = function (e, a, c) {
                    e[0] = a[0] / c[0];
                    e[1] = a[1] / c[1];
                    return e
                };
                c.div = c.divide;
                c.ceil = function (e, a) {
                    e[0] = Math.ceil(a[0]);
                    e[1] = Math.ceil(a[1]);
                    return e
                };
                c.floor = function (e, a) {
                    e[0] = Math.floor(a[0]);
                    e[1] = Math.floor(a[1]);
                    return e
                };
                c.min = function (e, a, c) {
                    e[0] = Math.min(a[0], c[0]);
                    e[1] = Math.min(a[1], c[1]);
                    return e
                };
                c.max = function (e, a, c) {
                    e[0] = Math.max(a[0], c[0]);
                    e[1] = Math.max(a[1], c[1]);
                    return e
                };
                c.round = function (e, a) {
                    e[0] = Math.round(a[0]);
                    e[1] = Math.round(a[1]);
                    return e
                };
                c.scale = function (e, a, c) {
                    e[0] = a[0] * c;
                    e[1] = a[1] * c;
                    return e
                };
                c.scaleAndAdd = function (e, a, c, k) {
                    e[0] = a[0] + c[0] * k;
                    e[1] = a[1] + c[1] * k;
                    return e
                };
                c.distance = function (e, a) {
                    var c = a[0] - e[0];
                    e = a[1] - e[1];
                    return Math.sqrt(c * c + e * e)
                };
                c.dist = c.distance;
                c.squaredDistance = function (e,
                                              a) {
                    var c = a[0] - e[0];
                    e = a[1] - e[1];
                    return c * c + e * e
                };
                c.sqrDist = c.squaredDistance;
                c.length = function (e) {
                    var a = e[0];
                    e = e[1];
                    return Math.sqrt(a * a + e * e)
                };
                c.len = c.length;
                c.squaredLength = function (e) {
                    var a = e[0];
                    e = e[1];
                    return a * a + e * e
                };
                c.sqrLen = c.squaredLength;
                c.negate = function (e, a) {
                    e[0] = -a[0];
                    e[1] = -a[1];
                    return e
                };
                c.inverse = function (e, a) {
                    e[0] = 1 / a[0];
                    e[1] = 1 / a[1];
                    return e
                };
                c.normalize = function (e, a) {
                    var c = a[0], k = a[1], c = c * c + k * k;
                    0 < c && (c = 1 / Math.sqrt(c), e[0] = a[0] * c, e[1] = a[1] * c);
                    return e
                };
                c.dot = function (e, a) {
                    return e[0] * a[0] +
                        e[1] * a[1]
                };
                c.cross = function (e, a, c) {
                    a = a[0] * c[1] - a[1] * c[0];
                    e[0] = e[1] = 0;
                    e[2] = a;
                    return e
                };
                c.lerp = function (e, a, c, k) {
                    var h = a[0];
                    a = a[1];
                    e[0] = h + k * (c[0] - h);
                    e[1] = a + k * (c[1] - a);
                    return e
                };
                c.random = function (e, a) {
                    a = a || 1;
                    var c = 2 * n.RANDOM() * Math.PI;
                    e[0] = Math.cos(c) * a;
                    e[1] = Math.sin(c) * a;
                    return e
                };
                c.transformMat2 = function (e, a, c) {
                    var k = a[0];
                    a = a[1];
                    e[0] = c[0] * k + c[2] * a;
                    e[1] = c[1] * k + c[3] * a;
                    return e
                };
                c.transformMat2d = function (e, a, c) {
                    var k = a[0];
                    a = a[1];
                    e[0] = c[0] * k + c[2] * a + c[4];
                    e[1] = c[1] * k + c[3] * a + c[5];
                    return e
                };
                c.transformMat3 =
                    function (e, a, c) {
                        var k = a[0];
                        a = a[1];
                        e[0] = c[0] * k + c[3] * a + c[6];
                        e[1] = c[1] * k + c[4] * a + c[7];
                        return e
                    };
                c.transformMat4 = function (e, a, c) {
                    var k = a[0];
                    a = a[1];
                    e[0] = c[0] * k + c[4] * a + c[12];
                    e[1] = c[1] * k + c[5] * a + c[13];
                    return e
                };
                c.forEach = function () {
                    var e = c.create();
                    return function (a, c, k, h, g, b) {
                        c || (c = 2);
                        k || (k = 0);
                        for (h = h ? Math.min(h * c + k, a.length) : a.length; k < h; k += c) e[0] = a[k], e[1] = a[k + 1], g(e, e, b), a[k] = e[0], a[k + 1] = e[1];
                        return a
                    }
                }();
                c.str = function (e) {
                    return "vec2(" + e[0] + ", " + e[1] + ")"
                };
                c.exactEquals = function (e, a) {
                    return e[0] === a[0] &&
                        e[1] === a[1]
                };
                c.equals = function (e, a) {
                    var c = e[0];
                    e = e[1];
                    var k = a[0];
                    a = a[1];
                    return Math.abs(c - k) <= n.EPSILON * Math.max(1, Math.abs(c), Math.abs(k)) && Math.abs(e - a) <= n.EPSILON * Math.max(1, Math.abs(e), Math.abs(a))
                };
                return c
            })
        }, "esri/views/2d/engine/webgl/definitions": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.EXTRUDE_SCALE = 64;
                c.PICTURE_FILL_COLOR = 4294967295;
                c.TILE_SIZE = 512;
                c.ANGLE_FACTOR_256 = 256 / 360;
                c.COLLISION_BUCKET_SIZE = 128;
                c.COLLISION_MAX_ZOOM_DELTA =
                    4;
                c.COLLISION_EARLY_REJECT_BUCKET_SIZE = 32
            })
        }, "esri/views/2d/engine/webgl/collisions/CollisionBucket": function () {
            define(["require", "exports", "./CollisionBucketEntry"], function (n, c, e) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    function a(a) {
                        this.neighbors = null;
                        this._tiles = Array(a);
                        for (var c = 0; c < a; c++) this._tiles[c] = new e.default
                    }

                    Object.defineProperty(a.prototype, "isDirty", {
                        get: function () {
                            for (var a = 0, e = this._tiles; a < e.length; a++) if (e[a].dirty) return !0;
                            return !1
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(a.prototype, "size", {
                        get: function () {
                            return this._tiles.length
                        }, enumerable: !0, configurable: !0
                    });
                    a.prototype.getTile = function (a) {
                        return this._tiles[a]
                    };
                    a.prototype.onRegisterLayer = function (a) {
                        this.invalidateRange(a);
                        this._add(a)
                    };
                    a.prototype.onUnregisterLayer = function (a) {
                        this.invalidateRange(a);
                        this._remove(a)
                    };
                    a.prototype.onLabelsRendered = function () {
                    };
                    a.prototype.invalidateRange = function (a) {
                        for (; a < this._tiles.length; a++) this._tiles[a].dirty = !0
                    };
                    a.prototype.add = function (a) {
                        this._add(a)
                    };
                    a.prototype.remove = function (a) {
                        this._remove(a)
                    };
                    a.prototype.canDelete = function () {
                        return 0 === this._tiles.length
                    };
                    a.prototype.clean = function () {
                        for (var a = 0, e = this._tiles; a < e.length; a++) e[a].dirty = !1
                    };
                    a.prototype._add = function (a) {
                        var c = [];
                        if (a >= this._tiles.length) this._tiles.push(new e.default); else {
                            for (var h = 0; h < this._tiles.length; h++) h === a && c.push(new e.default), c.push(this._tiles[h]);
                            this._tiles = c
                        }
                    };
                    a.prototype._remove = function (a) {
                        for (var e = [], c = 0; c < this._tiles.length; c++) c !== a && e.push(this._tiles[c]);
                        this._tiles = e
                    };
                    return a
                }();
                c.default = n
            })
        }, "esri/views/2d/engine/webgl/collisions/CollisionBucketEntry": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    function e() {
                        this._reference = null
                    }

                    Object.defineProperty(e.prototype, "dirty", {
                        get: function () {
                            return this.reference && this.reference.isDirty
                        }, set: function (a) {
                            this.reference && (this.reference.isDirty = a)
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(e.prototype, "index", {
                        get: function () {
                            return this._reference.labelIndex
                        },
                        enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(e.prototype, "reference", {
                        get: function () {
                            return this._reference
                        }, set: function (a) {
                            this._reference = a
                        }, enumerable: !0, configurable: !0
                    });
                    return e
                }();
                c.default = n
            })
        }, "esri/views/2d/engine/webgl/util/iterator": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.forEachIter = function (e, a) {
                    for (; ;) {
                        var c = e.next();
                        if (c.done) break;
                        a(c.value)
                    }
                }
            })
        }, "esri/views/vectorTiles/GeometryUtils": function () {
            define(["require",
                "exports"], function (n, c) {
                function e(a, e) {
                    a %= e;
                    return 0 <= a ? a : a + e
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                c.C_INFINITY = Number.POSITIVE_INFINITY;
                c.C_PI = Math.PI;
                c.C_2PI = 2 * c.C_PI;
                c.C_PI_BY_2 = c.C_PI / 2;
                c.C_RAD_TO_256 = 128 / c.C_PI;
                c.C_256_TO_RAD = c.C_PI / 128;
                c.C_DEG_TO_256 = 256 / 360;
                c.C_DEG_TO_RAD = c.C_PI / 180;
                c.C_SQRT2 = 1.414213562;
                c.C_SQRT2_INV = 1 / c.C_SQRT2;
                var a = 1 / Math.LN2;
                c.positiveMod = e;
                c.radToByte = function (a) {
                    return e(a * c.C_RAD_TO_256, 256)
                };
                c.degToByte = function (a) {
                    return e(a * c.C_DEG_TO_256, 256)
                };
                c.log2 =
                    function (e) {
                        return Math.log(e) * a
                    };
                c.sqr = function (a) {
                    return a * a
                };
                c.clamp = function (a, e, c) {
                    return Math.min(Math.max(a, e), c)
                };
                c.interpolate = function (a, e, c) {
                    return a * (1 - c) + e * c
                };
                c.between = function (a, e, c) {
                    return a >= e && a <= c || a >= c && a <= e
                }
            })
        }, "esri/views/2d/engine/webgl/collisions/LayerViewSorter": function () {
            define(["require", "exports", "@dojo/shim/Map"], function (n, c, e) {
                function a(a) {
                    return "esri.views.2d.layers.FeatureLayerView2D" === a.declaredClass
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    function c(a,
                               c, g) {
                        void 0 === g && (g = null);
                        this.registerLayer = a;
                        this.unregisterLayer = c;
                        this.onLabelsVisible = g;
                        this._layerViewState = new e.default;
                        this._priorityCounter = 4294967295
                    }

                    c.prototype.update = function (e) {
                        for (var c = e.removed, g = 0, b = e.added; g < b.length; g++) {
                            e = b[g];
                            var d;
                            if (d = a(e)) a:switch (e.get("layer.renderer.type")) {
                                case "class-breaks":
                                case "simple":
                                case "unique-value":
                                    d = !0;
                                    break a;
                                default:
                                    d = !1
                            }
                            d && !this._layerViewState.has(e) && this._createState(e)
                        }
                        for (g = 0; g < c.length; g++) e = c[g], a(e) && this._layerViewState.has(e) &&
                        this._deleteState(e);
                        this._recomputeOrder()
                    };
                    c.prototype.destroy = function () {
                        var a = this;
                        this._layerViewState.forEach(function (e, c) {
                            return a._deleteState(c)
                        })
                    };
                    c.prototype._createState = function (a) {
                        var e = this, c = {
                            enabled: a.labelsVisible,
                            priority: this._priorityCounter--,
                            order: null,
                            handle: null
                        };
                        c.handle = a.watch("labelsVisible", function (a) {
                            c.enabled = a;
                            e._recomputeOrder();
                            e.onLabelsVisible && e._layerViewState.forEach(function (a, b) {
                                return e.onLabelsVisible(b)
                            })
                        });
                        this._layerViewState.set(a, c);
                        return c
                    };
                    c.prototype._deleteState =
                        function (a) {
                            var e = this._layerViewState.get(a);
                            e.handle.remove();
                            e.enabled && this.unregisterLayer(a);
                            this._layerViewState.delete(a)
                        };
                    c.prototype._recomputeOrder = function () {
                        var a = [];
                        this._layerViewState.forEach(function (b, f) {
                            a.push({layerView: f, state: b})
                        });
                        a.sort(function (a, b) {
                            return a.state.priority - b.state.priority
                        });
                        for (var e = 0, c = 0; c < a.length; c++) {
                            var b = a[c];
                            b.state.order !== e && (b.state.order = e, this.unregisterLayer(b.layerView));
                            b.state.enabled ? this.registerLayer(b.layerView, e) : this.unregisterLayer(b.layerView);
                            ++e
                        }
                    };
                    return c
                }();
                c.default = n
            })
        }, "esri/views/2d/MapViewConstraints": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/Evented ../../core/accessorSupport/decorators ../../layers/support/LOD ./constraints/RotationConstraint ./constraints/ZoomConstraint".split(" "), function (n, c, e, a, l, k, h, g, b, d) {
                return function (f) {
                    function c() {
                        var a = null !== f && f.apply(this, arguments) || this;
                        a.enabled = !0;
                        a.lods = null;
                        a.minScale =
                            0;
                        a.maxScale = 0;
                        a.minZoom = -1;
                        a.maxZoom = -1;
                        a.rotationEnabled = !0;
                        a.snapToZoom = !0;
                        return a
                    }

                    e(c, f);
                    c.prototype.initialize = function () {
                        this.watch("_zoom, _rotation", this.emit.bind(this, "update"), !0)
                    };
                    c.prototype.destroy = function () {
                        this.view = null;
                        this._set("_zoom", null);
                        this._set("_rotation", null)
                    };
                    Object.defineProperty(c.prototype, "_rotation", {
                        get: function () {
                            return new b({rotationEnabled: this.rotationEnabled})
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(c.prototype, "_defaultLODs", {
                        get: function () {
                            var a =
                                this.get("view.defaultsFromMap.tileInfo"), b = this.get("view.spatialReference");
                            return a && b && a.spatialReference.equals(b) ? a.lods : null
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(c.prototype, "_zoom", {
                        get: function () {
                            return new d({
                                lods: this.lods || this._defaultLODs,
                                minZoom: this.minZoom,
                                maxZoom: this.maxZoom,
                                minScale: this.minScale,
                                maxScale: this.maxScale,
                                snapToZoom: this.snapToZoom
                            })
                        }, enumerable: !0, configurable: !0
                    });
                    c.prototype.canZoomInTo = function (a) {
                        var b = this.effectiveMaxScale;
                        return 0 === b || a >=
                            b
                    };
                    c.prototype.canZoomOutTo = function (a) {
                        var b = this.effectiveMinScale;
                        return 0 === b || a <= b
                    };
                    c.prototype.constrain = function (a, b) {
                        if (!this.enabled) return a;
                        this._zoom.constrain(a, b);
                        this._rotation.constrain(a, b);
                        return a
                    };
                    c.prototype.fit = function (a) {
                        if (!this.enabled || !this.snapToZoom) return a;
                        this._zoom.fit(a);
                        return a
                    };
                    c.prototype.zoomToScale = function (a) {
                        return this._zoom.zoomToScale(a)
                    };
                    c.prototype.scaleToZoom = function (a) {
                        return this._zoom.scaleToZoom(a)
                    };
                    c.prototype.snapScale = function (a) {
                        return this._zoom.snapToClosestScale(a)
                    };
                    c.prototype.snapToNextScale = function (a) {
                        return this._zoom.snapToNextScale(a)
                    };
                    c.prototype.snapToPreviousScale = function (a) {
                        return this._zoom.snapToPreviousScale(a)
                    };
                    a([h.property({
                        readOnly: !0,
                        aliasOf: "_zoom.effectiveLODs"
                    })], c.prototype, "effectiveLODs", void 0);
                    a([h.property({
                        readOnly: !0,
                        aliasOf: "_zoom.effectiveMinScale"
                    })], c.prototype, "effectiveMinScale", void 0);
                    a([h.property({
                        readOnly: !0,
                        aliasOf: "_zoom.effectiveMaxScale"
                    })], c.prototype, "effectiveMaxScale", void 0);
                    a([h.property({readOnly: !0, aliasOf: "_zoom.effectiveMinZoom"})],
                        c.prototype, "effectiveMinZoom", void 0);
                    a([h.property({
                        readOnly: !0,
                        aliasOf: "_zoom.effectiveMaxZoom"
                    })], c.prototype, "effectiveMaxZoom", void 0);
                    a([h.property()], c.prototype, "enabled", void 0);
                    a([h.property({type: [g]})], c.prototype, "lods", void 0);
                    a([h.property()], c.prototype, "minScale", void 0);
                    a([h.property()], c.prototype, "maxScale", void 0);
                    a([h.property()], c.prototype, "minZoom", void 0);
                    a([h.property()], c.prototype, "maxZoom", void 0);
                    a([h.property()], c.prototype, "rotationEnabled", void 0);
                    a([h.property()],
                        c.prototype, "snapToZoom", void 0);
                    a([h.property()], c.prototype, "view", void 0);
                    a([h.property({type: b, dependsOn: ["rotationEnabled"]})], c.prototype, "_rotation", null);
                    a([h.property({dependsOn: ["view.spatialReference", "view.defaultsFromMap.tileInfo"]})], c.prototype, "_defaultLODs", null);
                    a([h.property({
                        readOnly: !0,
                        type: d,
                        dependsOn: "lods minZoom maxZoom minScale maxScale snapToZoom _defaultLODs".split(" ")
                    })], c.prototype, "_zoom", null);
                    return c = a([h.subclass("esri.views.2d.MapViewConstraints")], c)
                }(h.declared(l,
                    k))
            })
        }, "esri/views/2d/constraints/RotationConstraint": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../core/Accessor ../../../core/accessorSupport/decorators".split(" "), function (n, c, e, a, l, k) {
                return function (c) {
                    function g() {
                        var a = null !== c && c.apply(this, arguments) || this;
                        a.enabled = !0;
                        a.rotationEnabled = !0;
                        return a
                    }

                    e(g, c);
                    b = g;
                    g.prototype.constrain = function (a, b) {
                        if (!this.enabled || !b) return a;
                        this.rotationEnabled || (a.rotation =
                            b.rotation);
                        return a
                    };
                    g.prototype.clone = function () {
                        return new b({enabled: this.enabled, rotationEnabled: this.rotationEnabled})
                    };
                    var b;
                    a([k.property()], g.prototype, "enabled", void 0);
                    a([k.property()], g.prototype, "rotationEnabled", void 0);
                    return g = b = a([k.subclass("esri.views.2d.constraints.RotationConstraint")], g)
                }(k.declared(l))
            })
        }, "esri/views/2d/constraints/ZoomConstraint": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../core/Accessor ../../../core/accessorSupport/decorators ../../../layers/support/LOD".split(" "),
                function (n, c, e, a, l, k, h) {
                    return function (c) {
                        function b() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a._lodByScale = {};
                            a._scales = [];
                            a.effectiveLODs = null;
                            a.effectiveMinZoom = -1;
                            a.effectiveMaxZoom = -1;
                            a.effectiveMinScale = 0;
                            a.effectiveMaxScale = 0;
                            a.enabled = !0;
                            a.lods = null;
                            a.minZoom = -1;
                            a.maxZoom = -1;
                            a.minScale = 0;
                            a.maxScale = 0;
                            a.snapToZoom = !0;
                            return a
                        }

                        e(b, c);
                        d = b;
                        b.prototype.initialize = function () {
                            var a = this, b, d, e = this.lods;
                            d = this.minScale;
                            b = this.maxScale;
                            var c = this.minZoom, g = this.maxZoom, h = -1, k = -1, l = !1, n = !1;
                            0 !== d && 0 !== b && d < b && (b = [b, d], d = b[0], b = b[1]);
                            if (e && e.length) {
                                e = e.map(function (a) {
                                    return a.clone()
                                });
                                e.sort(function (a, b) {
                                    return b.scale - a.scale
                                });
                                e.forEach(function (a, b) {
                                    return a.level = b
                                });
                                for (var w, z = 0, B = e; z < B.length; z++) {
                                    var A = B[z];
                                    !l && 0 < d && d >= A.scale && (h = A.level, l = !0);
                                    !n && 0 < b && b >= A.scale && (k = w ? w.level : -1, n = !0);
                                    w = A
                                }
                                -1 === c && (c = 0 === d ? 0 : h);
                                -1 === g && (g = 0 === b ? e.length - 1 : k);
                                c = Math.max(c, 0);
                                c = Math.min(c, e.length - 1);
                                g = Math.max(g, 0);
                                g = Math.min(g, e.length - 1);
                                c > g && (d = [g, c], c = d[0], g = d[1]);
                                d = e[c].scale;
                                b = e[g].scale;
                                e.splice(0, c);
                                e.splice(g - c + 1, e.length);
                                e.forEach(function (b, d) {
                                    a._lodByScale[b.scale] = b;
                                    a._scales[d] = b.scale
                                });
                                this._set("effectiveLODs", e);
                                this._set("effectiveMinZoom", c);
                                this._set("effectiveMaxZoom", g)
                            }
                            this._set("effectiveMinScale", d);
                            this._set("effectiveMaxScale", b)
                        };
                        b.prototype.constrain = function (a, b) {
                            if (!this.enabled || b && a.scale === b.scale) return a;
                            var d = this.effectiveMinScale, e = this.effectiveMaxScale, f = a.targetGeometry,
                                c = b && b.targetGeometry, g = 0 !== d && a.scale > d;
                            if (0 !== e && a.scale < e || g) d = g ? d : e, c &&
                            (b = (d - b.scale) / (a.scale - b.scale), f.x = c.x + (f.x - c.x) * b, f.y = c.y + (f.y - c.y) * b), a.scale = d;
                            this.snapToZoom && this.effectiveLODs && (a.scale = this._getClosestScale(a.scale));
                            return a
                        };
                        b.prototype.fit = function (a) {
                            if (!this.effectiveLODs) return this.constrain(a, null);
                            var b = a.scale, d = this.scaleToZoom(b);
                            a.scale = .99 < Math.abs(d - Math.round(d)) ? this.snapToPreviousScale(b) : this.zoomToScale(Math.round(d));
                            return a
                        };
                        b.prototype.zoomToScale = function (a) {
                            if (!this.effectiveLODs) return 0;
                            a -= this.effectiveMinZoom;
                            a = Math.max(0,
                                a);
                            var b = this._scales;
                            if (0 >= a) return b[0];
                            if (a >= b.length) return b[b.length - 1];
                            var d = Math.round(a);
                            return b[d] + (d - a) * (b[Math.round(a - .5)] - b[d])
                        };
                        b.prototype.scaleToZoom = function (a) {
                            if (!this.effectiveLODs) return -1;
                            var b = this._scales, d = 0, e = b.length - 1, c, f;
                            for (d; d < e; d++) {
                                c = b[d];
                                f = b[d + 1];
                                if (c <= a) return d + this.effectiveMinZoom;
                                if (f === a) return d + 1 + this.effectiveMinZoom;
                                if (c > a && f < a) return d + 1 - (a - f) / (c - f) + this.effectiveMinZoom
                            }
                            return d
                        };
                        b.prototype.snapToClosestScale = function (a) {
                            if (!this.effectiveLODs) return a;
                            a = this.scaleToZoom(a);
                            return this.zoomToScale(Math.round(a))
                        };
                        b.prototype.snapToNextScale = function (a, b) {
                            void 0 === b && (b = .5);
                            if (!this.effectiveLODs) return a * b;
                            a = Math.round(this.scaleToZoom(a));
                            return this.zoomToScale(a + 1)
                        };
                        b.prototype.snapToPreviousScale = function (a, b) {
                            void 0 === b && (b = 2);
                            if (!this.effectiveLODs) return a * b;
                            a = Math.round(this.scaleToZoom(a));
                            return this.zoomToScale(a - 1)
                        };
                        b.prototype.clone = function () {
                            return new d({
                                enabled: this.enabled, lods: this.lods, minZoom: this.minZoom, maxZoom: this.maxZoom,
                                minScale: this.minScale, maxScale: this.maxScale
                            })
                        };
                        b.prototype._getClosestScale = function (a) {
                            if (this._lodByScale[a]) return this._lodByScale[a].scale;
                            a = this._scales.reduce(function (b, d, e, c) {
                                return Math.abs(d - a) <= Math.abs(b - a) ? d : b
                            }, this._scales[0]);
                            return this._lodByScale[a].scale
                        };
                        var d;
                        a([k.property({readOnly: !0})], b.prototype, "effectiveLODs", void 0);
                        a([k.property({readOnly: !0})], b.prototype, "effectiveMinZoom", void 0);
                        a([k.property({readOnly: !0})], b.prototype, "effectiveMaxZoom", void 0);
                        a([k.property({readOnly: !0})],
                            b.prototype, "effectiveMinScale", void 0);
                        a([k.property({readOnly: !0})], b.prototype, "effectiveMaxScale", void 0);
                        a([k.property()], b.prototype, "enabled", void 0);
                        a([k.property({type: [h]})], b.prototype, "lods", void 0);
                        a([k.property()], b.prototype, "minZoom", void 0);
                        a([k.property()], b.prototype, "maxZoom", void 0);
                        a([k.property()], b.prototype, "minScale", void 0);
                        a([k.property()], b.prototype, "maxScale", void 0);
                        a([k.property()], b.prototype, "snapToZoom", void 0);
                        return b = d = a([k.subclass("esri.views.2d.constraints.ZoomConstraint")],
                            b)
                    }(k.declared(l))
                })
        }, "esri/views/2d/PaddedViewState": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/accessorSupport/decorators ./viewpointUtils ./ViewState ./libs/gl-matrix/common ./libs/gl-matrix/mat2d ./libs/gl-matrix/vec2".split(" "), function (n, c, e, a, l, k, h, g, b, d, f) {
                var m = function (b) {
                    function d() {
                        var a = null !== b && b.apply(this, arguments) || this;
                        a.left = 0;
                        a.top = 0;
                        a.right = 0;
                        a.bottom = 0;
                        return a
                    }

                    e(d, b);
                    a([k.property()],
                        d.prototype, "left", void 0);
                    a([k.property()], d.prototype, "top", void 0);
                    a([k.property()], d.prototype, "right", void 0);
                    a([k.property()], d.prototype, "bottom", void 0);
                    return d = a([k.subclass("esri.views.2d.PaddedViewState.Padding")], d)
                }(k.declared(l));
                return function (c) {
                    function p() {
                        for (var a = [], b = 0; b < arguments.length; b++) a[b] = arguments[b];
                        a = c.apply(this, a) || this;
                        a.content = new g;
                        a.padding = new m;
                        a.size = f.fromValues(0, 0);
                        return a
                    }

                    e(p, c);
                    Object.defineProperty(p.prototype, "clipRect", {
                        get: function () {
                            var a = this.worldScreenWidth;
                            if (!a) return null;
                            var e = b.toRadian(this.rotation),
                                c = this.width * Math.abs(Math.cos(e)) + this.height * Math.abs(Math.sin(e));
                            if (a > c) return null;
                            var g = f.clone(this.screenCenter), m = d.fromTranslation(d.create(), g);
                            d.rotate(m, m, e);
                            f.negate(g, g);
                            d.translate(m, m, g);
                            f.transformMat2d(g, this.paddedScreenCenter, m);
                            return {
                                top: -Math.round(c),
                                left: Math.round(g[0] - .5 * a),
                                right: Math.round(g[0] + .5 * a),
                                bottom: +Math.round(c)
                            }
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(p.prototype, "padding", {
                        set: function (a) {
                            this._set("padding",
                                a || new m);
                            this._updateContent()
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(p.prototype, "size", {
                        set: function (a) {
                            this._set("size", a);
                            this._updateContent()
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(p.prototype, "paddedScreenCenter", {
                        get: function () {
                            var a = this.content.size, b = this.padding, a = f.scale(f.create(), a, .5);
                            a[0] += b.left;
                            a[1] += b.top;
                            return a
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(p.prototype, "viewpoint", {
                        set: function (a) {
                            var b = a.clone();
                            this.content.viewpoint =
                                a;
                            h.addPadding(b, a, this._get("size"), this._get("padding"));
                            this._set("viewpoint", h.addPadding(b.clone(), a, this._get("size"), this._get("padding")))
                        }, enumerable: !0, configurable: !0
                    });
                    p.prototype._updateContent = function () {
                        var a = f.create(), b = this._get("size"), d = this._get("padding");
                        if (b && d) {
                            var e = this.content;
                            f.set(a, d.left + d.right, d.top + d.bottom);
                            f.subtract(a, b, a);
                            e.size = a;
                            if (a = e.viewpoint) this.viewpoint = a
                        }
                    };
                    a([k.shared({transform: {dependsOn: ["padding"]}})], p.prototype, "properties", void 0);
                    a([k.property({
                        dependsOn: ["worldScreenWidth",
                            "rotation", "paddedScreenCenter", "screenCenter"], readOnly: !0
                    })], p.prototype, "clipRect", null);
                    a([k.property()], p.prototype, "content", void 0);
                    a([k.property({type: m})], p.prototype, "padding", null);
                    a([k.property()], p.prototype, "size", null);
                    a([k.property({
                        dependsOn: ["size", "padding"],
                        readOnly: !0
                    })], p.prototype, "paddedScreenCenter", null);
                    a([k.property()], p.prototype, "viewpoint", null);
                    return p = a([k.subclass("esri.views.2d.PaddedViewState")], p)
                }(k.declared(g))
            })
        }, "esri/views/2d/ViewState": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../Viewpoint ../../core/JSONSupport ../../core/accessorSupport/decorators ../../geometry/Extent ./viewpointUtils ./libs/gl-matrix/mat2d ./libs/gl-matrix/vec2".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f) {
                    var m = [0, 0];
                    return function (c) {
                        function p() {
                            for (var a = [], b = 0; b < arguments.length; b++) a[b] = arguments[b];
                            a = c.apply(this, a) || this;
                            a.pixelRatio = 1;
                            a.size = [0, 0];
                            return a
                        }

                        e(p, c);
                        k = p;
                        Object.defineProperty(p.prototype, "center", {
                            get: function () {
                                var a = this.viewpoint.targetGeometry;
                                return f.set(f.create(), a.x, a.y)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "extent", {
                            get: function () {
                                return b.getExtent(new g, this.viewpoint, this.size)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "height", {
                            get: function () {
                                return this.size ? this.size[1] : 0
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "id", {
                            get: function () {
                                return this._get("id") + 1
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "inverseTransform", {
                            get: function () {
                                return d.invert(d.create(), this.transform)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "latitude", {
                            get: function () {
                                return this.viewpoint.targetGeometry.latitude
                            }, enumerable: !0,
                            configurable: !0
                        });
                        Object.defineProperty(p.prototype, "longitude", {
                            get: function () {
                                return this.viewpoint.targetGeometry.longitude
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "resolution", {
                            get: function () {
                                return b.getResolution(this.viewpoint)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "rotation", {
                            get: function () {
                                return this.viewpoint.rotation
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "scale", {
                            get: function () {
                                return this.viewpoint.scale
                            },
                            enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "screenCenter", {
                            get: function () {
                                return f.scale(f.create(), this.size, .5)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "spatialReference", {
                            get: function () {
                                return this.viewpoint.targetGeometry.spatialReference
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "transform", {
                            get: function () {
                                return b.getTransform(d.create(), this.viewpoint, this.size, this.pixelRatio)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype,
                            "transformNoRotation", {
                                get: function () {
                                    return b.getTransformNoRotation(d.create(), this.viewpoint, this.size, this.pixelRatio)
                                }, enumerable: !0, configurable: !0
                            });
                        Object.defineProperty(p.prototype, "clippedExtent", {
                            get: function () {
                                return b.getClippedExtent(new g, this.viewpoint, this.size)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "width", {
                            get: function () {
                                return this.size ? this.size[0] : 0
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "worldScreenWidth", {
                            get: function () {
                                return b.getWorldScreenWidth(this.spatialReference,
                                    this.resolution)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "worldWidth", {
                            get: function () {
                                return b.getWorldWidth(this.spatialReference)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "wrappable", {
                            get: function () {
                                return !!this.spatialReference && this.spatialReference.isWrappable
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "x", {
                            get: function () {
                                return this.center[0]
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(p.prototype, "y", {
                            get: function () {
                                return this.center[1]
                            },
                            enumerable: !0, configurable: !0
                        });
                        p.prototype.copy = function (a) {
                            this.viewpoint && this.size ? (this._set("viewpoint", b.copy(this.viewpoint, a.viewpoint)), this._set("size", f.copy(this.size, a.size))) : (this.viewpoint = a.viewpoint.clone(), f.copy(this.size, a.size));
                            this._set("pixelRatio", a.pixelRatio);
                            return this
                        };
                        p.prototype.clone = function () {
                            return new k({viewpoint: this.viewpoint.clone(), size: f.clone(this.size)})
                        };
                        p.prototype.toMap = function (a, b, d) {
                            if (Array.isArray(b)) return f.transformMat2d(a, b, this.inverseTransform);
                            m[0] = b;
                            m[1] = d;
                            return f.transformMat2d(a, m, this.inverseTransform)
                        };
                        p.prototype.toScreen = function (a, b, d) {
                            if (Array.isArray(b)) return f.transformMat2d(a, b, this.transform);
                            m[0] = b;
                            m[1] = d;
                            return f.transformMat2d(a, m, this.transform)
                        };
                        p.prototype.toScreenNoRotation = function (a, b, d) {
                            if (Array.isArray(b)) return f.transformMat2d(a, b, this.transformNoRotation);
                            m[0] = b;
                            m[1] = d;
                            return f.transformMat2d(a, m, this.transformNoRotation)
                        };
                        p.prototype.pixelSizeAt = function (a) {
                            return b.pixelSizeAt(a, this.viewpoint, this.size)
                        };
                        var k;
                        a([h.property({dependsOn: ["viewpoint"]})], p.prototype, "center", null);
                        a([h.property({readOnly: !0, dependsOn: ["viewpoint", "size"]})], p.prototype, "extent", null);
                        a([h.property({readOnly: !0, dependsOn: ["size"]})], p.prototype, "height", null);
                        a([h.property({value: 0, readOnly: !0, dependsOn: ["transform"]})], p.prototype, "id", null);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["transform"]
                        })], p.prototype, "inverseTransform", null);
                        a([h.property({readOnly: !0, dependsOn: ["viewpoint"]})], p.prototype, "latitude", null);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["viewpoint"]
                        })], p.prototype, "longitude", null);
                        a([h.property({type: Number, json: {write: !0}})], p.prototype, "pixelRatio", void 0);
                        a([h.property({readOnly: !0, dependsOn: ["viewpoint"]})], p.prototype, "resolution", null);
                        a([h.property({readOnly: !0, dependsOn: ["viewpoint"]})], p.prototype, "rotation", null);
                        a([h.property({readOnly: !0, dependsOn: ["viewpoint"]})], p.prototype, "scale", null);
                        a([h.property({readOnly: !0, dependsOn: ["size"]})], p.prototype, "screenCenter", null);
                        a([h.property({json: {write: !0}})], p.prototype,
                            "size", void 0);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["viewpoint"]
                        })], p.prototype, "spatialReference", null);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["viewpoint", "size", "pixelRatio"]
                        })], p.prototype, "transform", null);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["viewpoint", "size", "pixelRatio"]
                        })], p.prototype, "transformNoRotation", null);
                        a([h.property({type: l, json: {write: !0}})], p.prototype, "viewpoint", void 0);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["viewpoint", "size"]
                        })], p.prototype, "clippedExtent", null);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["size"]
                        })], p.prototype, "width", null);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["worldWidth", "resolution"]
                        })], p.prototype, "worldScreenWidth", null);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["spatialReference"]
                        })], p.prototype, "worldWidth", null);
                        a([h.property({
                            readOnly: !0,
                            dependsOn: ["spatialReference"]
                        })], p.prototype, "wrappable", null);
                        a([h.property({readOnly: !0, dependsOn: ["center"]})], p.prototype, "x", null);
                        a([h.property({readOnly: !0, dependsOn: ["center"]})], p.prototype, "y", null);
                        return p = k = a([h.subclass("esri.views.2d.ViewState")],
                            p)
                    }(h.declared(k))
                })
        }, "esri/views/2d/engine/Stage": function () {
            define("require exports ../../../core/tsSupport/extendsHelper ../../../core/Error ../../../core/promiseUtils ../../../core/scheduling ./DOMContainer".split(" "), function (n, c, e, a, l, k, h) {
                function g(a, d) {
                    for (var b = 0; b < d.length; b++) {
                        var e = d[b];
                        "takeScreenshot" in e ? a.push(e) : "children" in e && g(a, e.children)
                    }
                    return a
                }

                return function (b) {
                    function d(a) {
                        var d = b.call(this) || this;
                        d.element = a;
                        d._renderParameters = {
                            state: d.state, pixelRatio: window.devicePixelRatio,
                            stationary: !1
                        };
                        d._renderRequested = !1;
                        d._taskHandle = k.addFrameTask({
                            render: function () {
                                return d.renderFrame()
                            }
                        });
                        d._stationary = !0;
                        d.attached = !0;
                        d._taskHandle.pause();
                        return d
                    }

                    e(d, b);
                    d.prototype.destroy = function () {
                        this.removeAllChildren();
                        this.renderFrame();
                        this._taskHandle.remove();
                        this._taskHandle = null
                    };
                    Object.defineProperty(d.prototype, "state", {
                        get: function () {
                            return this._state
                        }, set: function (a) {
                            this._state = a;
                            this.requestRender()
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(d.prototype, "stationary",
                        {
                            get: function () {
                                return this._stationary
                            }, set: function (a) {
                            this._stationary !== a && (this._stationary = a, this.requestRender())
                        }, enumerable: !0, configurable: !0
                        });
                    d.prototype.start = function () {
                        this._taskHandle.resume()
                    };
                    d.prototype.stop = function () {
                        this._taskHandle.pause()
                    };
                    d.prototype.requestRender = function () {
                        this._renderRequested = !0;
                        this._taskHandle && this._taskHandle.resume()
                    };
                    d.prototype.takeScreenshot = function (b) {
                        var d = g([], this.children);
                        return d ? l.eachAlways(d.map(function (a) {
                            return a.takeScreenshot(b).then(function (a) {
                                return l.create(function (b) {
                                    var d =
                                        document.createElement("img");
                                    d.addEventListener("load", function () {
                                        b(d)
                                    });
                                    d.src = a.dataURL
                                })
                            })
                        })).then(function (a) {
                            var d = document.createElement("canvas"), e = d.getContext("2d");
                            d.width = b.area.width;
                            d.height = b.area.height;
                            a.forEach(function (a) {
                                (a = a.value) && e.drawImage(a, 0, 0)
                            });
                            return {dataURL: d.toDataURL()}
                        }) : l.reject(new a("mapview:take-screenshot-unavailable"))
                    };
                    d.prototype.renderFrame = function () {
                        this._renderRequested && (this._renderRequested = !1, this._renderParameters.state = this._state, this._renderParameters.stationary =
                            this.stationary, this._renderParameters.pixelRatio = window.devicePixelRatio, this.processRender(this._renderParameters));
                        this._renderRequested || this._taskHandle.pause()
                    };
                    return d
                }(h)
            })
        }, "esri/views/2d/engine/DOMContainer": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper", "./Container"], function (n, c, e, a) {
                return function (a) {
                    function c() {
                        return null !== a && a.apply(this, arguments) || this
                    }

                    e(c, a);
                    c.prototype.createElement = function () {
                        var a = document.createElement("div");
                        a.setAttribute("class",
                            "esri-display-object");
                        return a
                    };
                    c.prototype.setElement = function (a) {
                        this.element = a
                    };
                    c.prototype.doRender = function (e) {
                        var c = this.element.style;
                        this.visible ? (c.display = "block", a.prototype.doRender.call(this, e)) : c.display = "none"
                    };
                    c.prototype.prepareChildrenRenderParameters = function (a) {
                        return a
                    };
                    c.prototype.attachChild = function (a, e) {
                        var b = a.element;
                        b || (b = a.createElement(), a.setElement(b));
                        return a.attach(e)
                    };
                    c.prototype.detachChild = function (a, e) {
                        a.detach(e);
                        this.element.contains(a.element) && this.element.removeChild(a.element);
                        a.setElement(null)
                    };
                    c.prototype.renderChildren = function (e) {
                        for (var c = this.children, b = this.element.childNodes, d = 0, f = c.length, m = 0; m < f; m++) if (c[m].attached) {
                            var h = c[m].element;
                            b[d] !== h && (null != b[d + 1] ? this.element.insertBefore(h, b[d]) : this.element.appendChild(h));
                            d += 1
                        }
                        a.prototype.renderChildren.call(this, e)
                    };
                    return c
                }(a)
            })
        }, "esri/views/2d/engine/Container": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper", "./DisplayObject"], function (n, c, e, a) {
                var l;
                (function (a) {
                    a[a.BEFORE =
                        0] = "BEFORE";
                    a[a.ATTACHING = 1] = "ATTACHING";
                    a[a.DETACHING = 2] = "DETACHING";
                    a[a.RENDERING = 3] = "RENDERING";
                    a[a.AFTER = 4] = "AFTER";
                    a[a.DONE = 5] = "DONE"
                })(l || (l = {}));
                return function (a) {
                    function c() {
                        var e = null !== a && a.apply(this, arguments) || this;
                        e._childrenSet = new Set;
                        e._childrenToAttach = [];
                        e._childrenToDetach = [];
                        e._renderPhase = l.DONE;
                        e.children = [];
                        return e
                    }

                    e(c, a);
                    Object.defineProperty(c.prototype, "numChildren", {
                        get: function () {
                            return this.children.length
                        }, enumerable: !0, configurable: !0
                    });
                    c.prototype.detach = function (a) {
                        var b =
                            this.children.concat(this._childrenToDetach);
                        a = this.prepareChildrenRenderParameters(a);
                        for (var d = 0; d < b.length; d++) {
                            var e = b[d];
                            e.attached && (this.detachChild(e, a), e.attached = !1, e.parent = null)
                        }
                    };
                    c.prototype.doRender = function (a) {
                        var b = this.prepareChildrenRenderParameters(a);
                        this._renderPhase = l.BEFORE;
                        this.beforeRenderChildren(a, b);
                        this._renderPhase = l.ATTACHING;
                        this.attachChildren(b);
                        this._renderPhase = l.DETACHING;
                        for (var d = this._childrenToDetach; 0 < d.length;) {
                            var e = d.shift();
                            this.detachChild(e, b);
                            e.attached =
                                !1;
                            e.parent = null
                        }
                        this._renderPhase = l.RENDERING;
                        this.renderChildren(b);
                        this._renderPhase = l.AFTER;
                        this.afterRenderChildren(a, b);
                        this._renderPhase = l.DONE
                    };
                    c.prototype.addChild = function (a) {
                        return this.addChildAt(a, this.children.length)
                    };
                    c.prototype.addChildAt = function (a, b) {
                        void 0 === b && (b = this.numChildren);
                        if (!a || this.contains(a)) return a;
                        var d = a.parent;
                        d && d !== this && d.removeChild(a);
                        b >= this.numChildren ? this.children.push(a) : this.children.splice(b, 0, a);
                        this._childrenSet.add(a);
                        b = this._childrenToDetach.indexOf(a);
                        -1 < b && this._childrenToDetach.splice(b, 1);
                        this._childrenToAttach.push(a);
                        this._renderPhase >= l.RENDERING && this.requestRender();
                        return a
                    };
                    c.prototype.contains = function (a) {
                        return this._childrenSet.has(a)
                    };
                    c.prototype.getChildIndex = function (a) {
                        return this.children.indexOf(a)
                    };
                    c.prototype.getChildAt = function (a) {
                        return 0 > a || a > this.children.length ? null : this.children[a]
                    };
                    c.prototype.removeAllChildren = function () {
                        for (var a = this.numChildren; a--;) this.removeChildAt(0)
                    };
                    c.prototype.removeChild = function (a) {
                        return this.contains(a) ?
                            this.removeChildAt(this.getChildIndex(a)) : a
                    };
                    c.prototype.removeChildAt = function (a) {
                        if (0 > a || a >= this.children.length) return null;
                        a = this.children.splice(a, 1)[0];
                        this._childrenSet["delete"](a);
                        if (a.attached) this._childrenToDetach.push(a), this._renderPhase >= l.RENDERING && this.requestRender(); else {
                            var b = this._childrenToAttach.indexOf(a);
                            -1 < b && this._childrenToAttach.splice(b, 1)
                        }
                        return a
                    };
                    c.prototype.requestChildRender = function (a) {
                        a && a.parent === this && this._renderPhase >= l.RENDERING && this.requestRender()
                    };
                    c.prototype.setChildIndex =
                        function (a, b) {
                            var d = this.getChildIndex(a);
                            -1 < d && (this.children.splice(d, 1), this.children.splice(b, 0, a), this._renderPhase >= l.RENDERING && this.requestRender())
                        };
                    c.prototype.sortChildren = function (a) {
                        this._renderPhase > l.RENDERING && this.requestRender();
                        return this.children.sort(a)
                    };
                    c.prototype.attachChildren = function (a) {
                        var b = this._childrenToAttach;
                        if (0 !== b.length) for (var d = 0, e = !1; !e;) e = b[d], this.attachChild(e, a) ? (e.attached = !0, e.parent = this, b.splice(d, 1)) : ++d, e = b.length === d
                    };
                    c.prototype.renderChildren =
                        function (a) {
                            for (var b = this.children, d = b.length, e = 0; e < d; e++) {
                                var c = b[e];
                                c.attached && this.renderChild(c, a)
                            }
                        };
                    c.prototype.beforeRenderChildren = function (a, b) {
                    };
                    c.prototype.attachChild = function (a, b) {
                        return a.attach(b)
                    };
                    c.prototype.detachChild = function (a, b) {
                        a.detach(b)
                    };
                    c.prototype.renderChild = function (a, b) {
                        a.processRender(b)
                    };
                    c.prototype.afterRenderChildren = function (a, b) {
                    };
                    return c
                }(a)
            })
        }, "esri/views/2d/engine/DisplayObject": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper",
                "./Evented"], function (n, c, e, a) {
                return function (a) {
                    function c() {
                        var e = null !== a && a.apply(this, arguments) || this;
                        e._renderRequestedCalled = !1;
                        e._attached = !1;
                        e._opacity = 1;
                        e.renderRequested = !1;
                        e._visible = !0;
                        return e
                    }

                    e(c, a);
                    Object.defineProperty(c.prototype, "attached", {
                        get: function () {
                            return this._attached
                        }, set: function (a) {
                            this._attached !== a && ((this._attached = a) ? this.hasEventListener("attach") && this.emit("attach") : this.hasEventListener("detach") && this.emit("detach"))
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(c.prototype,
                        "opacity", {
                            get: function () {
                                return this._opacity
                            }, set: function (a) {
                                this._opacity !== a && (this._opacity = a, this.requestRender())
                            }, enumerable: !0, configurable: !0
                        });
                    Object.defineProperty(c.prototype, "visible", {
                        get: function () {
                            return this._visible
                        }, set: function (a) {
                            this._visible !== a && (this._visible = a, this.requestRender())
                        }, enumerable: !0, configurable: !0
                    });
                    c.prototype.attach = function (a) {
                        return !0
                    };
                    c.prototype.detach = function (a) {
                    };
                    c.prototype.processRender = function (a) {
                        this._renderRequestedCalled = !1;
                        this.doRender(a);
                        this._renderRequestedCalled || (this.renderRequested = !1);
                        this.hasEventListener("post-render") && this.emit("post-render")
                    };
                    c.prototype.requestRender = function () {
                        var a = this.renderRequested;
                        this.renderRequested = this._renderRequestedCalled = !0;
                        this.parent && this.parent.requestChildRender(this);
                        a !== this.renderRequested && this.hasEventListener("will-render") && this.emit("will-render")
                    };
                    c.prototype.dispose = function () {
                    };
                    return c
                }(a.Evented)
            })
        }, "esri/views/2d/engine/Evented": function () {
            define(["require", "exports",
                "../../../core/tsSupport/extendsHelper", "dojo/aspect", "dojo/on"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    function e() {
                    }

                    e.prototype.on = function (e, c) {
                        return a.after(this, "on" + e, c, !0)
                    };
                    e.prototype.once = function (a, e) {
                        return l.once(this, a, e)
                    };
                    e.prototype.emit = function (a) {
                        l.emit(this, a, this)
                    };
                    e.prototype.hasEventListener = function (a) {
                        a = "on" + a;
                        return !(!this[a] || !this[a].after)
                    };
                    return e
                }();
                c.Evented = n;
                c.EventedMixin = function (c) {
                    return function (c) {
                        function g() {
                            return null !==
                                c && c.apply(this, arguments) || this
                        }

                        e(g, c);
                        g.prototype.on = function (b, d) {
                            return a.after(this, "on" + b, d, !0)
                        };
                        g.prototype.once = function (a, d) {
                            return l.once(this, a, d)
                        };
                        g.prototype.emit = function (a, d) {
                            l.emit(this, a, d)
                        };
                        g.prototype.hasEventListener = function (a) {
                            a = "on" + a;
                            return !(!this[a] || !this[a].after)
                        };
                        return g
                    }(c)
                }
            })
        }, "esri/views/2d/input/MapViewInputManager": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../core/Accessor ../../../core/Handles ../../../core/watchUtils ../../../core/accessorSupport/decorators ../input/handlers/DoubleClickZoom ../input/handlers/DragPan ../input/handlers/DragRotate ../input/handlers/KeyPan ../input/handlers/KeyRotate ../input/handlers/KeyZoom ../input/handlers/MouseWheelZoom ../input/handlers/PinchAction ../../input/BrowserEventSource ../../input/InputManager ../../input/ViewEvents ../../input/handlers/PreventContextMenu".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u, r, x, v, y) {
                    var w = {left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown"},
                        z = {zoomIn: ["\x3d", "+"], zoomOut: ["-", "_"]}, B = {
                            clockwiseOption1: "a",
                            clockwiseOption2: "A",
                            counterClockwiseOption1: "d",
                            counterClockwiseOption2: "D",
                            resetOption1: "n",
                            resetOption2: "N"
                        };
                    return function (c) {
                        function l() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a._handles = new k;
                            return a
                        }

                        e(l, c);
                        l.prototype.initialize = function () {
                            var a = this;
                            this.viewEvents = new v.ViewEvents(this.view);
                            this._handles.add([h.whenNot(this.view, "ready", function () {
                                return a._disconnect()
                            }), h.when(this.view, "ready", function () {
                                return a._connect()
                            })])
                        };
                        l.prototype.destroy = function () {
                            this._handles && (this._handles.removeAll(), this._handles = null);
                            this._disconnect();
                            this.viewEvents.destroy();
                            this.viewEvents = null
                        };
                        l.prototype._disconnect = function () {
                            this._inputManager && (this.viewEvents.disconnect(), this._source.destroy(), this._inputManager.destroy(), this._inputManager = this._source = null)
                        };
                        l.prototype._connect =
                            function () {
                                var a = new r.BrowserEventSource(this.view.surface), e = new x.InputManager(a);
                                e.installHandlers("prevent-context-menu", [new y.PreventContextMenu]);
                                e.installHandlers("navigation", [new u.PinchRotateAndZoom(this.view), new t.MouseWheelZoom(this.view), new b.DoubleClickZoom(this.view), new d.DragPan(this.view, "primary"), new m.KeyPan(this.view, w), new p.KeyZoom(this.view, z), new q.KeyRotate(this.view, B), new f.DragRotate(this.view, "secondary"), new b.DoubleClickZoom(this.view, ["Ctrl"])]);
                                this.viewEvents.connect(e);
                                this._source = a;
                                this._inputManager = e
                            };
                        a([g.property()], l.prototype, "view", void 0);
                        return l = a([g.subclass("esri.views.2d.input.MapViewInputManager")], l)
                    }(g.declared(l))
                })
        }, "esri/views/2d/input/handlers/DoubleClickZoom": function () {
            define(["require", "exports", "../../../../core/tsSupport/extendsHelper", "../../../input/InputHandler", "../../../input/handlers/support"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (a) {
                    function c(e, b) {
                        var d = a.call(this, !0) || this;
                        d.view = e;
                        d.registerIncoming("double-click",
                            b, function (a) {
                                return d._handleDoubleClick(a, b)
                            });
                        return d
                    }

                    e(c, a);
                    c.prototype._handleDoubleClick = function (a, b) {
                        l.eventMatchesPointerAction(a.data, "primary") && (a.stopPropagation(), b ? this.view.navigation.zoomOut([a.data.x, a.data.y]) : this.view.navigation.zoomIn([a.data.x, a.data.y]))
                    };
                    return c
                }(a.InputHandler);
                c.DoubleClickZoom = n
            })
        }, "esri/views/input/InputHandler": function () {
            define(["require", "exports", "../../core/Logger", "./EventMatch"], function (n, c, e, a) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var l = e.getLogger("esri.views.input.InputHandler");
                n = function () {
                    function e(a) {
                        this._manager = null;
                        this._incoming = {};
                        this._outgoing = {};
                        this._outgoingEventTypes = this._incomingEventTypes = this._incomingEventMatches = null;
                        this._hasSideEffects = a
                    }

                    Object.defineProperty(e.prototype, "incomingEventMatches", {
                        get: function () {
                            if (!this._incomingEventMatches) {
                                this._incomingEventMatches = [];
                                for (var a in this._incoming) for (var d = 0, e = this._incoming[a]; d < e.length; d++) this._incomingEventMatches.push(e[d].match)
                            }
                            return this._incomingEventMatches
                        },
                        enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(e.prototype, "incomingEventTypes", {
                        get: function () {
                            this._incomingEventTypes || (this._incomingEventTypes = this.incomingEventMatches.map(function (a) {
                                return a.eventType
                            }));
                            return this._incomingEventTypes
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(e.prototype, "outgoingEventTypes", {
                        get: function () {
                            this._outgoingEventTypes || (this._outgoingEventTypes = Object.keys(this._outgoing));
                            return this._outgoingEventTypes
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(e.prototype, "hasSideEffects", {
                        get: function () {
                            return this._hasSideEffects
                        }, enumerable: !0, configurable: !0
                    });
                    e.prototype.onInstall = function (a) {
                        var b = this;
                        this._manager ? l.error("This InputHandler has already been registered with an InputManager") : (a.setEventCallback(function (a) {
                            return b._handleEvent(a)
                        }), a.setUninstallCallback(function () {
                            return b._onUninstall()
                        }), this._manager = a)
                    };
                    e.prototype.onUninstall = function () {
                    };
                    e.prototype.registerIncoming = function (b, d, e) {
                        var c = this;
                        "function" ===
                        typeof d ? (e = d, d = []) : d = d || [];
                        b = "string" === typeof b ? new a.EventMatch(b, d) : b;
                        var f = function () {
                            c._incomingEventTypes = null;
                            c._incomingEventMatches = null
                        };
                        d = function (a) {
                            var b = c._incoming[a.match.eventType];
                            b && (a = b.indexOf(a), b.splice(a, 1), f(), c._manager && c._manager.updateDependencies())
                        };
                        e = new k(b, e, {
                            onPause: d, onRemove: d, onResume: function (a) {
                                var b = c._incoming[a.match.eventType];
                                b && -1 === b.indexOf(a) && (b.push(a), f(), c._manager && c._manager.updateDependencies())
                            }
                        });
                        d = this._incoming[b.eventType];
                        d || (d = [], this._incoming[b.eventType] =
                            d);
                        d.push(e);
                        f();
                        this._manager && this._manager.updateDependencies();
                        return e
                    };
                    e.prototype.registerOutgoing = function (a) {
                        var b = this;
                        if (this._outgoing[a]) throw Error("There is already a callback registered for this outgoing InputEvent: " + a);
                        var e = new h(a, {
                            onEmit: function (a, d, e, c) {
                                b._manager.emit(a.eventType, d, e, c)
                            }, onRemove: function (a) {
                                delete b._outgoing[a.eventType];
                                b._manager.updateDependencies()
                            }
                        });
                        this._outgoing[a] = e;
                        this._outgoingEventTypes = null;
                        this._manager && this._manager.updateDependencies();
                        return e
                    };
                    e.prototype.startCapturingPointer = function (a) {
                        this._manager.setPointerCapture(a, !0)
                    };
                    e.prototype.stopCapturingPointer = function (a) {
                        this._manager.setPointerCapture(a, !1)
                    };
                    e.prototype._onUninstall = function () {
                        this._manager ? (this.onUninstall(), this._manager = null) : l.error("This InputHandler is not registered with an InputManager")
                    };
                    e.prototype._handleEvent = function (a) {
                        var b = this._incoming[a.type];
                        if (b) for (var e = 0; e < b.length; e++) {
                            var c = b[e];
                            if (c.match.matches(a) && (c.callback(a), a.shouldStopPropagation())) break
                        }
                    };
                    return e
                }();
                c.InputHandler = n;
                var k = function () {
                    function a(a, d, e) {
                        this.match = a;
                        this._callback = d;
                        this._handler = e
                    }

                    a.prototype.pause = function () {
                        this._handler.onPause(this)
                    };
                    a.prototype.resume = function () {
                        this._handler.onResume(this)
                    };
                    a.prototype.remove = function () {
                        this._handler.onRemove(this)
                    };
                    Object.defineProperty(a.prototype, "callback", {
                        get: function () {
                            return this._callback
                        }, enumerable: !0, configurable: !0
                    });
                    return a
                }(), h = function () {
                    function a(a, d) {
                        this.eventType = a;
                        this._removed = !1;
                        this._handler = d
                    }

                    a.prototype.emit =
                        function (a, d, e) {
                            if (!this._removed) this._handler.onEmit(this, a, d, e)
                        };
                    a.prototype.remove = function () {
                        this._removed = !0;
                        this._handler.onRemove(this)
                    };
                    return a
                }()
            })
        }, "esri/views/input/EventMatch": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    function e(a, e) {
                        void 0 === e && (e = []);
                        this.eventType = a;
                        this.keyModifiers = e
                    }

                    e.prototype.matches = function (a) {
                        if (a.type !== this.eventType) return !1;
                        if (0 === this.keyModifiers.length) return !0;
                        a = a.modifiers;
                        for (var e = 0, c = this.keyModifiers; e < c.length; e++) if (!a.has(c[e])) return !1;
                        return !0
                    };
                    return e
                }();
                c.EventMatch = n
            })
        }, "esri/views/input/handlers/support": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.eventMatchesPointerAction = function (e, a) {
                    switch (a) {
                        case "primary":
                            return "touch" === e.pointerType || 0 === e.button;
                        case "secondary":
                            return "touch" !== e.pointerType && 2 === e.button;
                        case "tertiary":
                            return "touch" !== e.pointerType && 1 === e.button
                    }
                };
                c.eventMatchesMousePointerAction =
                    function (e, a) {
                        if ("touch" === e.pointerType) return !1;
                        switch (a) {
                            case "primary":
                                return 0 === e.button;
                            case "secondary":
                                return 2 === e.button;
                            case "tertiary":
                                return 1 === e.button
                        }
                    }
            })
        }, "esri/views/2d/input/handlers/DragPan": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper ../../../input/DragEventSeparator ../../../input/InputHandler ../../../input/handlers/support".split(" "), function (n, c, e, a, l, k) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function g(b, d, e) {
                        var f =
                            c.call(this, !0) || this;
                        f.view = b;
                        f.pointerAction = d;
                        f.registerIncoming("drag", e, function (a) {
                            return f._handleDrag(a)
                        });
                        f.registerIncoming("pointer-down", function (a) {
                            return f.stopMomentumNavigation()
                        });
                        var g = f.view.navigation;
                        f.dragEventSeparator = new a.DragEventSeparator({
                            start: function (a, b) {
                                g.pan.begin(f.view, b.data);
                                b.stopPropagation()
                            }, update: function (a, b) {
                                g.pan.update(f.view, b.data);
                                b.stopPropagation()
                            }, end: function (a, b) {
                                g.pan.end(f.view, b.data);
                                b.stopPropagation()
                            }, condition: function (a, b) {
                                return 1 ===
                                    a && k.eventMatchesPointerAction(b.data, f.pointerAction)
                            }
                        });
                        return f
                    }

                    e(g, c);
                    g.prototype._handleDrag = function (a) {
                        var b = this.view.navigation;
                        b.pinch.zoomMomentum || b.pinch.rotateMomentum ? this.stopMomentumNavigation() : this.dragEventSeparator.handle(a)
                    };
                    g.prototype.stopMomentumNavigation = function () {
                        this.view.navigation.pan.stopMomentumNavigation()
                    };
                    return g
                }(l.InputHandler);
                c.DragPan = n
            })
        }, "esri/views/input/DragEventSeparator": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c,
                    "__esModule", {value: !0});
                n = function () {
                    function e(a) {
                        this.callbacks = a;
                        this.currentCount = 0;
                        this.callbacks.condition || (this.callbacks.condition = function () {
                            return !0
                        })
                    }

                    e.prototype.handle = function (a) {
                        var e = a.data, c = e.pointers.size;
                        switch (e.action) {
                            case "start":
                                this.currentCount = c;
                                this.emitStart(a);
                                break;
                            case "added":
                                this.emitEnd(this.previousEvent);
                                this.currentCount = c;
                                this.emitStart(a);
                                break;
                            case "update":
                                this.emitUpdate(a);
                                break;
                            case "removed":
                                this.startEvent && this.emitEnd(this.previousEvent);
                                this.currentCount =
                                    c;
                                this.emitStart(a);
                                break;
                            case "end":
                                this.emitEnd(a), this.currentCount = 0
                        }
                        this.previousEvent = a
                    };
                    e.prototype.emitStart = function (a) {
                        this.startEvent = a;
                        this.callbacks.condition(this.currentCount, a) && this.callbacks.start(this.currentCount, a, this.startEvent)
                    };
                    e.prototype.emitUpdate = function (a) {
                        this.callbacks.condition(this.currentCount, a) && this.callbacks.update(this.currentCount, a, this.startEvent)
                    };
                    e.prototype.emitEnd = function (a) {
                        this.callbacks.condition(this.currentCount, a) && this.callbacks.end(this.currentCount,
                            a, this.startEvent);
                        this.startEvent = null
                    };
                    return e
                }();
                c.DragEventSeparator = n
            })
        }, "esri/views/2d/input/handlers/DragRotate": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper ../../../input/DragEventSeparator ../../../input/InputHandler ../../../input/handlers/support".split(" "), function (n, c, e, a, l, k) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function g(b, d, e) {
                        var f = c.call(this, !0) || this;
                        f.view = b;
                        f.pointerAction = d;
                        var g = f.view.navigation;
                        f.dragEventSeparator =
                            new a.DragEventSeparator({
                                start: function (a, b) {
                                    g.rotate.begin(f.view, b.data);
                                    b.stopPropagation()
                                }, update: function (a, b) {
                                    g.rotate.update(f.view, b.data);
                                    b.stopPropagation()
                                }, end: function (a, b) {
                                    g.rotate.end(f.view, b.data);
                                    b.stopPropagation()
                                }, condition: function (a, b) {
                                    return 1 === a && k.eventMatchesPointerAction(b.data, f.pointerAction)
                                }
                            });
                        f.registerIncoming("drag", e, function (a) {
                            return f.dragEventSeparator.handle(a)
                        });
                        return f
                    }

                    e(g, c);
                    return g
                }(l.InputHandler);
                c.DragRotate = n
            })
        }, "esri/views/2d/input/handlers/KeyPan": function () {
            define(["require",
                "exports", "../../../../core/tsSupport/extendsHelper", "../../../input/InputHandler"], function (n, c, e, a) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (a) {
                    function c(e, c, b) {
                        var d, f = a.call(this, !0) || this;
                        f.view = e;
                        f.keys = c;
                        f._keyMap = (d = {}, d[c.left] = "left", d[c.right] = "right", d[c.up] = "up", d[c.down] = "down", d);
                        f.registerIncoming("key-down", b, function (a) {
                            return f._handleKeyDown(a)
                        });
                        f.registerIncoming("key-up", b, function (a) {
                            return f._handleKeyUp(a)
                        });
                        return f
                    }

                    e(c, a);
                    c.prototype._handleKeyDown =
                        function (a) {
                            a.data.repeat || this._handleKey(a, !0)
                        };
                    c.prototype._handleKeyUp = function (a) {
                        this._handleKey(a, !1)
                    };
                    c.prototype._handleKey = function (a, e) {
                        var b = this._keyMap[a.data.key];
                        if (null != b) {
                            if (e) switch (b) {
                                case "left":
                                    this.view.navigation.continousPanLeft();
                                    break;
                                case "right":
                                    this.view.navigation.continousPanRight();
                                    break;
                                case "up":
                                    this.view.navigation.continousPanUp();
                                    break;
                                case "down":
                                    this.view.navigation.continousPanDown()
                            } else this.view.navigation.stop();
                            a.stopPropagation()
                        }
                    };
                    return c
                }(a.InputHandler);
                c.KeyPan = n
            })
        }, "esri/views/2d/input/handlers/KeyRotate": function () {
            define(["require", "exports", "../../../../core/tsSupport/extendsHelper", "../../../input/InputHandler"], function (n, c, e, a) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (a) {
                    function c(e, c, b) {
                        var d, f = a.call(this, !0) || this;
                        f.view = e;
                        f.keys = c;
                        f._keyToDirection = (d = {}, d[c.clockwiseOption1] = "clockwise", d[c.clockwiseOption2] = "clockwise", d[c.counterClockwiseOption1] = "counterClockwise", d[c.counterClockwiseOption2] = "counterClockwise",
                            d[c.resetOption1] = "reset", d[c.resetOption2] = "reset", d);
                        f.registerIncoming("key-down", b, function (a) {
                            return f._handleKeyDown(a)
                        });
                        f.registerIncoming("key-up", b, function (a) {
                            return f._handleKeyUp(a)
                        });
                        return f
                    }

                    e(c, a);
                    c.prototype._handleKeyDown = function (a) {
                        a.data.repeat || this._handleKey(a, !0)
                    };
                    c.prototype._handleKeyUp = function (a) {
                        this._handleKey(a, !1)
                    };
                    c.prototype._handleKey = function (a, e) {
                        var b = a.modifiers;
                        0 < b.size && !b.has("Shift") || !this.view.constraints.rotationEnabled || !(b = this._keyToDirection[a.data.key]) ||
                        (e ? "clockwise" === b ? this.view.navigation.continousRotateClockwise() : "counterClockwise" === b ? this.view.navigation.continousRotateCounterclockwise() : this.view.navigation.resetRotation() : this.view.navigation.stop(), a.stopPropagation())
                    };
                    return c
                }(a.InputHandler);
                c.KeyRotate = n
            })
        }, "esri/views/2d/input/handlers/KeyZoom": function () {
            define(["require", "exports", "../../../../core/tsSupport/extendsHelper", "../../../input/InputHandler"], function (n, c, e, a) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var l;
                (function (a) {
                    a[a.IN =
                        0] = "IN";
                    a[a.OUT = 1] = "OUT"
                })(l || (l = {}));
                n = function (a) {
                    function c(e, b, d) {
                        var c = a.call(this, !0) || this;
                        c.view = e;
                        c.keys = b;
                        c._keysToZoomAction = {};
                        c.registerIncoming("key-down", d, function (a) {
                            return c._handleKeyDown(a)
                        });
                        b.zoomIn.forEach(function (a) {
                            return c._keysToZoomAction[a] = l.IN
                        });
                        b.zoomOut.forEach(function (a) {
                            return c._keysToZoomAction[a] = l.OUT
                        });
                        return c
                    }

                    e(c, a);
                    c.prototype._handleKeyDown = function (a) {
                        this._handleKey(a)
                    };
                    c.prototype._handleKey = function (a) {
                        var b = a.modifiers;
                        0 < b.size && !b.has("Shift") ||
                        (b = this._keysToZoomAction[a.data.key], b === l.IN ? (this.view.navigation.zoomIn(), a.stopPropagation()) : b === l.OUT && (this.view.navigation.zoomOut(), a.stopPropagation()))
                    };
                    return c
                }(a.InputHandler);
                c.KeyZoom = n
            })
        }, "esri/views/2d/input/handlers/MouseWheelZoom": function () {
            define(["require", "exports", "../../../../core/tsSupport/extendsHelper", "../../../input/InputHandler"], function (n, c, e, a) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (a) {
                    function c(e, c) {
                        var b = a.call(this, !0) || this;
                        b.view = e;
                        b._canZoom =
                            !0;
                        b.registerIncoming("mouse-wheel", c, function (a) {
                            return b._handleMouseWheel(a)
                        });
                        return b
                    }

                    e(c, a);
                    c.prototype._handleMouseWheel = function (a) {
                        var e = this;
                        if (this._canZoom) {
                            var b = this.view.navigation, d = a.data;
                            if (d = b.zoom(1 / Math.pow(.6, 1 / 60 * d.deltaY), [d.x, d.y])) this._canZoom = !1, d.always(function () {
                                e._canZoom = !0;
                                b.end()
                            });
                            a.stopPropagation()
                        }
                    };
                    return c
                }(a.InputHandler);
                c.MouseWheelZoom = n
            })
        }, "esri/views/2d/input/handlers/PinchAction": function () {
            define(["require", "exports", "../../../../core/tsSupport/extendsHelper",
                "../../../input/DragEventSeparator", "../../../input/InputHandler"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function h(e) {
                        var b = c.call(this, !0) || this;
                        b.view = e;
                        b.registerIncoming("drag", function (a) {
                            return b._handleDrag(a)
                        });
                        b.registerIncoming("pointer-down", function (a) {
                            return b.stopMomentumNavigation()
                        });
                        var d = b.view.navigation;
                        b.dragEventSeparator = new a.DragEventSeparator({
                            start: function (a, e) {
                                d.pinch.begin(b.view, e.data);
                                e.stopPropagation()
                            }, update: function (a,
                                                 e) {
                                d.pinch.update(b.view, e.data);
                                e.stopPropagation()
                            }, end: function (a, e) {
                                d.pinch.end(b.view, e.data);
                                e.stopPropagation()
                            }, condition: function (a) {
                                return 2 <= a
                            }
                        });
                        return b
                    }

                    e(h, c);
                    h.prototype._handleDrag = function (a) {
                        this.dragEventSeparator.handle(a)
                    };
                    h.prototype.stopMomentumNavigation = function () {
                        this.view.navigation.pinch.stopMomentumNavigation()
                    };
                    return h
                }(l.InputHandler);
                c.PinchRotateAndZoom = n
            })
        }, "esri/views/input/BrowserEventSource": function () {
            define(["require", "exports", "dojo/sniff", "../../core/libs/pep/pep",
                "./keys"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var k = e("trident"), h = e("edge"), g = e("chrome"), b = e("ff"), d = e("safari");
                n = function () {
                    function e(b) {
                        this._active = {};
                        this._activePointerCaptures = new Set;
                        this._keyDownState = new Set;
                        this._element = b;
                        a.applyLocal(b);
                        b.getAttribute("tabindex") || b.setAttribute("tabindex", "0");
                        this._eventHandlers = {
                            "key-down": this._handleKey,
                            "key-up": this._handleKey,
                            "pointer-down": this._handlePointer,
                            "pointer-move": this._handlePointerPreventDefault,
                            "pointer-up": this._handlePointerPreventDefault,
                            "pointer-enter": this._handlePointer,
                            "pointer-leave": this._handlePointer,
                            "pointer-cancel": this._handlePointer,
                            "mouse-wheel": this._handleMouseWheel,
                            "pointer-capture-lost": this._handlePointerCaptureLost
                        };
                        this._initialCssTouchAction = b.style.touchAction;
                        b.style.touchAction = "none";
                        this._element.addEventListener("keydown", this._preventAltKeyDefault)
                    }

                    e.prototype.destroy = function () {
                        var a = this;
                        this.activeEvents = this._callback = null;
                        this._activePointerCaptures.forEach(function (b) {
                            a._element.releasePointerCapture(b)
                        });
                        this._activePointerCaptures = null;
                        this._element.style.touchAction = this._initialCssTouchAction;
                        this._element.removeEventListener("keydown", this._preventAltKeyDefault)
                    };
                    Object.defineProperty(e.prototype, "onEventReceived", {
                        set: function (a) {
                            this._callback = a
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(e.prototype, "activeEvents", {
                        set: function (a) {
                            var b = this, d;
                            for (d in this._active) a && a.has(d) || (this._element.removeEventListener(f[d], this._active[d]), delete this._active[d]);
                            a && a.forEach(function (a) {
                                if (!b._active[a] &&
                                    f[a]) {
                                    var d = (b._eventHandlers[a] || b._handleDefault).bind(b, a);
                                    b._element.addEventListener(f[a], d);
                                    b._active[a] = d
                                }
                            })
                        }, enumerable: !0, configurable: !0
                    });
                    e.prototype.setPointerCapture = function (a, b) {
                        b ? (this._element.setPointerCapture(a.pointerId), this._activePointerCaptures.add(a.pointerId)) : (this._element.releasePointerCapture(a.pointerId), this._activePointerCaptures.delete(a.pointerId))
                    };
                    e.prototype._updateNormalizedPointerLikeEvent = function (a, b) {
                        var d = this._element.getBoundingClientRect();
                        b.x = a.clientX -
                            Math.round(d.left);
                        b.y = a.clientY - Math.round(d.top);
                        return b
                    };
                    e.prototype._handleKey = function (a, b) {
                        var d = l.eventKey(b);
                        d && "key-up" === a && this._keyDownState.delete(d);
                        b = {native: b, key: d, repeat: d && this._keyDownState.has(d)};
                        d && "key-down" === a && this._keyDownState.add(b.key);
                        this._callback(a, b)
                    };
                    e.prototype._handlePointer = function (a, b) {
                        b = this._updateNormalizedPointerLikeEvent(b, {
                            native: b,
                            x: 0,
                            y: 0,
                            pointerType: b.pointerType,
                            button: b.button,
                            buttons: b.buttons
                        });
                        this._callback(a, b)
                    };
                    e.prototype._handlePointerPreventDefault =
                        function (a, b) {
                            var d = this._updateNormalizedPointerLikeEvent(b, {
                                native: b,
                                x: 0,
                                y: 0,
                                pointerType: b.pointerType,
                                button: b.button,
                                buttons: b.buttons
                            });
                            b.preventDefault();
                            this._callback(a, d)
                        };
                    e.prototype._handleMouseWheel = function (a, e) {
                        e.preventDefault();
                        var c = e.deltaY;
                        switch (e.deltaMode) {
                            case 0:
                                if (k || h) c = c / document.documentElement.clientHeight * 600;
                                break;
                            case 1:
                                c *= 30;
                                break;
                            case 2:
                                c *= 900
                        }
                        k || h ? c *= .7 : g || d ? c *= .6 : b && (c *= 1.375);
                        var f = Math.abs(c);
                        100 < f && (c = c / f * 200 / (1 + Math.exp(-.02 * (f - 100))));
                        e = this._updateNormalizedPointerLikeEvent(e,
                            {native: e, x: 0, y: 0, deltaY: c});
                        this._callback(a, e)
                    };
                    e.prototype._handlePointerCaptureLost = function (a, b) {
                        this._activePointerCaptures.delete(b.pointerId);
                        this._handleDefault(a, b)
                    };
                    e.prototype._handleDefault = function (a, b) {
                        var d = {native: b};
                        b.preventDefault();
                        this._callback(a, d)
                    };
                    e.prototype._preventAltKeyDefault = function (a) {
                        "Alt" === a.key && a.preventDefault()
                    };
                    return e
                }();
                c.BrowserEventSource = n;
                var f = {
                    "key-down": "keydown",
                    "key-up": "keyup",
                    "pointer-down": "pointerdown",
                    "pointer-up": "pointerup",
                    "pointer-move": "pointermove",
                    "mouse-wheel": "wheel",
                    "pointer-capture-got": "gotpointercapture",
                    "pointer-capture-lost": "lostpointercapture",
                    "context-menu": "contextmenu",
                    "pointer-enter": "pointerenter",
                    "pointer-leave": "pointerleave",
                    "pointer-cancel": "pointercancel"
                }
            })
        }, "esri/core/libs/pep/pep": function () {
            define(function () {
                function n(a, b) {
                    b = b || Object.create(null);
                    var e = document.createEvent("Event");
                    e.initEvent(a, b.bubbles || !1, b.cancelable || !1);
                    a = 2;
                    for (var c; a < d.length; a++) c = d[a], e[c] = b[c] || f[a];
                    e.buttons = b.buttons || 0;
                    a = 0;
                    a = b.pressure ?
                        b.pressure : e.buttons ? .5 : 0;
                    e.x = e.clientX;
                    e.y = e.clientY;
                    e.pointerId = b.pointerId || 0;
                    e.width = b.width || 0;
                    e.height = b.height || 0;
                    e.pressure = a;
                    e.tiltX = b.tiltX || 0;
                    e.tiltY = b.tiltY || 0;
                    e.pointerType = b.pointerType || "";
                    e.hwTimestamp = b.hwTimestamp || 0;
                    e.isPrimary = b.isPrimary || !1;
                    return e
                }

                function c() {
                    this.array = [];
                    this.size = 0
                }

                function e(a, b, d, e) {
                    this.addCallback = a.bind(e);
                    this.removeCallback = b.bind(e);
                    this.changedCallback = d.bind(e);
                    B && (this.observer = new B(this.mutationWatcher.bind(this)))
                }

                function a(a) {
                    return "body /shadow-deep/ " +
                        l(a)
                }

                function l(a) {
                    return '[touch-action\x3d"' + a + '"]'
                }

                function k(a) {
                    return "{ -ms-touch-action: " + a + "; touch-action: " + a + "; touch-action-delay: none; }"
                }

                function h() {
                    if (E) {
                        C.forEach(function (b) {
                            String(b) === b ? (D += l(b) + k(b) + "\n", G && (D += a(b) + k(b) + "\n")) : (D += b.selectors.map(l) + k(b.rule) + "\n", G && (D += b.selectors.map(a) + k(b.rule) + "\n"))
                        });
                        var b = document.createElement("style");
                        b.textContent = D;
                        document.head.appendChild(b)
                    }
                }

                function g(a) {
                    if (!r.pointermap.has(a)) throw a = Error("InvalidPointerId"), a.name = "InvalidPointerId",
                        a;
                }

                function b(a) {
                    if (!a.ownerDocument.contains(a)) throw a = Error("InvalidStateError"), a.name = "InvalidStateError", a;
                }

                var d = "bubbles cancelable view detail screenX screenY clientX clientY ctrlKey altKey shiftKey metaKey button relatedTarget pageX pageY".split(" "),
                    f = [!1, !1, null, null, 0, 0, 0, 0, !1, !1, !1, !1, 0, null, 0, 0],
                    m = window.Map && window.Map.prototype.forEach ? Map : c;
                c.prototype = {
                    set: function (a, b) {
                        if (void 0 === b) return this.delete(a);
                        this.has(a) || this.size++;
                        this.array[a] = b
                    }, has: function (a) {
                        return void 0 !==
                            this.array[a]
                    }, delete: function (a) {
                        this.has(a) && (delete this.array[a], this.size--)
                    }, get: function (a) {
                        return this.array[a]
                    }, clear: function () {
                        this.size = this.array.length = 0
                    }, forEach: function (a, b) {
                        return this.array.forEach(function (d, e) {
                            a.call(b, d, e, this)
                        }, this)
                    }
                };
                var q = "bubbles cancelable view detail screenX screenY clientX clientY ctrlKey altKey shiftKey metaKey button relatedTarget buttons pointerId width height pressure tiltX tiltY pointerType hwTimestamp isPrimary type target currentTarget which pageX pageY timeStamp".split(" "),
                    p = [!1, !1, null, null, 0, 0, 0, 0, !1, !1, !1, !1, 0, null, 0, 0, 0, 0, 0, 0, 0, "", 0, !1, "", null, null, 0, 0, 0, 0],
                    t = {pointerover: 1, pointerout: 1, pointerenter: 1, pointerleave: 1},
                    u = "undefined" !== typeof SVGElementInstance, r = {
                        pointermap: new m,
                        eventMap: Object.create(null),
                        captureInfo: Object.create(null),
                        eventSources: Object.create(null),
                        eventSourceList: [],
                        registerSource: function (a, b) {
                            var d = b.events;
                            d && (d.forEach(function (a) {
                                b[a] && (this.eventMap[a] = b[a].bind(b))
                            }, this), this.eventSources[a] = b, this.eventSourceList.push(b))
                        },
                        register: function (a) {
                            for (var b =
                                this.eventSourceList.length, d = 0, e; d < b && (e = this.eventSourceList[d]); d++) e.register.call(e, a)
                        },
                        unregister: function (a) {
                            for (var b = this.eventSourceList.length, d = 0, e; d < b && (e = this.eventSourceList[d]); d++) e.unregister.call(e, a)
                        },
                        contains: function (a, b) {
                            try {
                                return a.contains(b)
                            } catch (M) {
                                return !1
                            }
                        },
                        down: function (a) {
                            a.bubbles = !0;
                            this.fireEvent("pointerdown", a)
                        },
                        move: function (a) {
                            a.bubbles = !0;
                            this.fireEvent("pointermove", a)
                        },
                        up: function (a) {
                            a.bubbles = !0;
                            this.fireEvent("pointerup", a)
                        },
                        enter: function (a) {
                            a.bubbles =
                                !1;
                            this.fireEvent("pointerenter", a)
                        },
                        leave: function (a) {
                            a.bubbles = !1;
                            this.fireEvent("pointerleave", a)
                        },
                        over: function (a) {
                            a.bubbles = !0;
                            this.fireEvent("pointerover", a)
                        },
                        out: function (a) {
                            a.bubbles = !0;
                            this.fireEvent("pointerout", a)
                        },
                        cancel: function (a) {
                            a.bubbles = !0;
                            this.fireEvent("pointercancel", a)
                        },
                        leaveOut: function (a) {
                            this.out(a);
                            this.propagate(a, this.leave, !1)
                        },
                        enterOver: function (a) {
                            this.over(a);
                            this.propagate(a, this.enter, !0)
                        },
                        eventHandler: function (a) {
                            if (!a._handledByPE) {
                                var b = a.type;
                                (b = this.eventMap &&
                                    this.eventMap[b]) && b(a);
                                a._handledByPE = !0
                            }
                        },
                        listen: function (a, b) {
                            b.forEach(function (b) {
                                this.addEvent(a, b)
                            }, this)
                        },
                        unlisten: function (a, b) {
                            b.forEach(function (b) {
                                this.removeEvent(a, b)
                            }, this)
                        },
                        addEvent: function (a, b) {
                            a.addEventListener(b, this.boundHandler)
                        },
                        removeEvent: function (a, b) {
                            a.removeEventListener(b, this.boundHandler)
                        },
                        makeEvent: function (a, b) {
                            this.captureInfo[b.pointerId] && (b.relatedTarget = null);
                            a = new n(a, b);
                            b.preventDefault && (a.preventDefault = b.preventDefault);
                            a._target = a._target || b.target;
                            return a
                        },
                        fireEvent: function (a, b) {
                            a = this.makeEvent(a, b);
                            return this.dispatchEvent(a)
                        },
                        cloneEvent: function (a) {
                            for (var b = Object.create(null), d, e = 0; e < q.length; e++) d = q[e], b[d] = a[d] || p[e], u && ("target" === d || "relatedTarget" === d) && b[d] instanceof SVGElementInstance && (b[d] = b[d].correspondingUseElement);
                            a.preventDefault && (b.preventDefault = function () {
                                a.preventDefault()
                            });
                            return b
                        },
                        getTarget: function (a) {
                            var b = this.captureInfo[a.pointerId];
                            if (!b) return a._target;
                            if (a._target === b || !(a.type in t)) return b
                        },
                        propagate: function (a,
                                             b, d) {
                            for (var e = a.target, c = []; !e.contains(a.relatedTarget) && e !== document;) c.push(e), e = e.parentNode;
                            d && c.reverse();
                            c.forEach(function (d) {
                                a.target = d;
                                b.call(this, a)
                            }, this)
                        },
                        setCapture: function (a, b) {
                            this.captureInfo[a] && this.releaseCapture(a);
                            this.captureInfo[a] = b;
                            var d = new n("gotpointercapture");
                            d.pointerId = a;
                            this.implicitRelease = this.releaseCapture.bind(this, a);
                            document.addEventListener("pointerup", this.implicitRelease);
                            document.addEventListener("pointercancel", this.implicitRelease);
                            d._target = b;
                            this.asyncDispatchEvent(d)
                        },
                        releaseCapture: function (a) {
                            var b = this.captureInfo[a];
                            if (b) {
                                var d = new n("lostpointercapture");
                                d.pointerId = a;
                                this.captureInfo[a] = void 0;
                                document.removeEventListener("pointerup", this.implicitRelease);
                                document.removeEventListener("pointercancel", this.implicitRelease);
                                d._target = b;
                                this.asyncDispatchEvent(d)
                            }
                        },
                        dispatchEvent: function (a) {
                            var b = this.getTarget(a);
                            if (b) return b.dispatchEvent(a)
                        },
                        asyncDispatchEvent: function (a) {
                            requestAnimationFrame(this.dispatchEvent.bind(this, a))
                        }
                    };
                r.boundHandler = r.eventHandler.bind(r);
                var x = {
                        shadow: function (a) {
                            if (a) return a.shadowRoot || a.webkitShadowRoot
                        }, canTarget: function (a) {
                            return a && !!a.elementFromPoint
                        }, targetingShadow: function (a) {
                            a = this.shadow(a);
                            if (this.canTarget(a)) return a
                        }, olderShadow: function (a) {
                            var b = a.olderShadowRoot;
                            !b && (a = a.querySelector("shadow")) && (b = a.olderShadowRoot);
                            return b
                        }, allShadows: function (a) {
                            var b = [];
                            for (a = this.shadow(a); a;) b.push(a), a = this.olderShadow(a);
                            return b
                        }, searchRoot: function (a, b, d) {
                            if (a) {
                                var e = a.elementFromPoint(b, d), c;
                                for (c = this.targetingShadow(e); c;) {
                                    if (a =
                                            c.elementFromPoint(b, d)) return e = this.targetingShadow(a), this.searchRoot(e, b, d) || a;
                                    c = this.olderShadow(c)
                                }
                                return e
                            }
                        }, owner: function (a) {
                            for (; a.parentNode;) a = a.parentNode;
                            a.nodeType !== Node.DOCUMENT_NODE && a.nodeType !== Node.DOCUMENT_FRAGMENT_NODE && (a = document);
                            return a
                        }, findTarget: function (a) {
                            var b = a.clientX, d = a.clientY;
                            a = this.owner(a.target);
                            a.elementFromPoint(b, d) || (a = document);
                            return this.searchRoot(a, b, d)
                        }
                    }, v = Array.prototype.forEach.call.bind(Array.prototype.forEach),
                    y = Array.prototype.map.call.bind(Array.prototype.map),
                    w = Array.prototype.slice.call.bind(Array.prototype.slice),
                    z = Array.prototype.filter.call.bind(Array.prototype.filter),
                    B = window.MutationObserver || window.WebKitMutationObserver, A = {
                        subtree: !0,
                        childList: !0,
                        attributes: !0,
                        attributeOldValue: !0,
                        attributeFilter: ["touch-action"]
                    };
                e.prototype = {
                    watchSubtree: function (a) {
                        this.observer && x.canTarget(a) && this.observer.observe(a, A)
                    }, enableOnSubtree: function (a) {
                        this.watchSubtree(a);
                        a === document && "complete" !== document.readyState ? this.installOnLoad() : this.installNewSubtree(a)
                    },
                    installNewSubtree: function (a) {
                        v(this.findElements(a), this.addElement, this)
                    }, findElements: function (a) {
                        return a.querySelectorAll ? a.querySelectorAll("[touch-action]") : []
                    }, removeElement: function (a) {
                        this.removeCallback(a)
                    }, addElement: function (a) {
                        this.addCallback(a)
                    }, elementChanged: function (a, b) {
                        this.changedCallback(a, b)
                    }, concatLists: function (a, b) {
                        return a.concat(w(b))
                    }, installOnLoad: function () {
                        document.addEventListener("readystatechange", function () {
                            "complete" === document.readyState && this.installNewSubtree(document)
                        }.bind(this))
                    },
                    isElement: function (a) {
                        return a.nodeType === Node.ELEMENT_NODE
                    }, flattenMutationTree: function (a) {
                        var b = y(a, this.findElements, this);
                        b.push(z(a, this.isElement));
                        return b.reduce(this.concatLists, [])
                    }, mutationWatcher: function (a) {
                        a.forEach(this.mutationHandler, this)
                    }, mutationHandler: function (a) {
                        "childList" === a.type ? (this.flattenMutationTree(a.addedNodes).forEach(this.addElement, this), this.flattenMutationTree(a.removedNodes).forEach(this.removeElement, this)) : "attributes" === a.type && this.elementChanged(a.target,
                            a.oldValue)
                    }
                };
                var C = ["none", "auto", "pan-x", "pan-y", {
                        rule: "pan-x pan-y",
                        selectors: ["pan-x pan-y", "pan-y pan-x"]
                    }], D = "", E = window.PointerEvent || window.MSPointerEvent,
                    G = !window.ShadowDOMPolyfill && document.head.createShadowRoot, F = r.pointermap,
                    I = [1, 4, 2, 8, 16], K = !1;
                try {
                    K = 1 === (new MouseEvent("test", {buttons: 1})).buttons
                } catch (N) {
                }
                var O = {
                    POINTER_ID: 1,
                    POINTER_TYPE: "mouse",
                    events: ["mousedown", "mousemove", "mouseup", "mouseover", "mouseout"],
                    register: function (a) {
                        r.listen(a, this.events)
                    },
                    unregister: function (a) {
                        r.unlisten(a,
                            this.events)
                    },
                    lastTouches: [],
                    isEventSimulatedFromTouch: function (a) {
                        var b = this.lastTouches, d = a.clientX;
                        a = a.clientY;
                        for (var e = 0, c = b.length, f; e < c && (f = b[e]); e++) {
                            var g = Math.abs(a - f.y);
                            if (25 >= Math.abs(d - f.x) && 25 >= g) return !0
                        }
                    },
                    prepareEvent: function (a) {
                        var b = r.cloneEvent(a), d = b.preventDefault;
                        b.preventDefault = function () {
                            a.preventDefault();
                            d()
                        };
                        b.pointerId = this.POINTER_ID;
                        b.isPrimary = !0;
                        b.pointerType = this.POINTER_TYPE;
                        return b
                    },
                    prepareButtonsForMove: function (a, b) {
                        var d = F.get(this.POINTER_ID);
                        a.buttons = 0 !==
                        b.which && d ? d.buttons : 0;
                        b.buttons = a.buttons
                    },
                    mousedown: function (a) {
                        if (!this.isEventSimulatedFromTouch(a)) {
                            var b = F.get(this.POINTER_ID), d = this.prepareEvent(a);
                            K || (d.buttons = I[d.button], b && (d.buttons |= b.buttons), a.buttons = d.buttons);
                            F.set(this.POINTER_ID, a);
                            b && 0 !== b.buttons ? r.move(d) : r.down(d)
                        }
                    },
                    mousemove: function (a) {
                        if (!this.isEventSimulatedFromTouch(a)) {
                            var b = this.prepareEvent(a);
                            K || this.prepareButtonsForMove(b, a);
                            b.button = -1;
                            F.set(this.POINTER_ID, a);
                            r.move(b)
                        }
                    },
                    mouseup: function (a) {
                        if (!this.isEventSimulatedFromTouch(a)) {
                            var b =
                                F.get(this.POINTER_ID), d = this.prepareEvent(a);
                            if (!K) {
                                var e = I[d.button];
                                d.buttons = b ? b.buttons & ~e : 0;
                                a.buttons = d.buttons
                            }
                            F.set(this.POINTER_ID, a);
                            d.buttons &= ~I[d.button];
                            0 === d.buttons ? r.up(d) : r.move(d)
                        }
                    },
                    mouseover: function (a) {
                        if (!this.isEventSimulatedFromTouch(a)) {
                            var b = this.prepareEvent(a);
                            K || this.prepareButtonsForMove(b, a);
                            b.button = -1;
                            F.set(this.POINTER_ID, a);
                            r.enterOver(b)
                        }
                    },
                    mouseout: function (a) {
                        if (!this.isEventSimulatedFromTouch(a)) {
                            var b = this.prepareEvent(a);
                            K || this.prepareButtonsForMove(b, a);
                            b.button =
                                -1;
                            r.leaveOut(b)
                        }
                    },
                    cancel: function (a) {
                        a = this.prepareEvent(a);
                        r.cancel(a);
                        this.deactivateMouse()
                    },
                    deactivateMouse: function () {
                        F.delete(this.POINTER_ID)
                    }
                }, ba = r.captureInfo, W = x.findTarget.bind(x), X = x.allShadows.bind(x), L = r.pointermap, Y, P = {
                    events: ["touchstart", "touchmove", "touchend", "touchcancel"], register: function (a) {
                        Y.enableOnSubtree(a)
                    }, unregister: function (a) {
                    }, elementAdded: function (a) {
                        var b = a.getAttribute("touch-action"), d = this.touchActionToScrollType(b);
                        d && (a._scrollType = d, r.listen(a, this.events),
                            X(a).forEach(function (a) {
                                a._scrollType = d;
                                r.listen(a, this.events)
                            }, this))
                    }, elementRemoved: function (a) {
                        a._scrollType = void 0;
                        r.unlisten(a, this.events);
                        X(a).forEach(function (a) {
                            a._scrollType = void 0;
                            r.unlisten(a, this.events)
                        }, this)
                    }, elementChanged: function (a, b) {
                        var d = a.getAttribute("touch-action"), e = this.touchActionToScrollType(d);
                        b = this.touchActionToScrollType(b);
                        e && b ? (a._scrollType = e, X(a).forEach(function (a) {
                            a._scrollType = e
                        }, this)) : b ? this.elementRemoved(a) : e && this.elementAdded(a)
                    }, scrollTypes: {
                        EMITTER: "none",
                        XSCROLLER: "pan-x", YSCROLLER: "pan-y", SCROLLER: /^(?:pan-x pan-y)|(?:pan-y pan-x)|auto$/
                    }, touchActionToScrollType: function (a) {
                        var b = this.scrollTypes;
                        if ("none" === a) return "none";
                        if (a === b.XSCROLLER) return "X";
                        if (a === b.YSCROLLER) return "Y";
                        if (b.SCROLLER.exec(a)) return "XY"
                    }, POINTER_TYPE: "touch", firstTouch: null, isPrimaryTouch: function (a) {
                        return this.firstTouch === a.identifier
                    }, setPrimaryTouch: function (a) {
                        if (0 === L.size || 1 === L.size && L.has(1)) this.firstTouch = a.identifier, this.firstXY = {
                            X: a.clientX,
                            Y: a.clientY
                        }, this.scrolling =
                            !1, this.cancelResetClickCount()
                    }, removePrimaryPointer: function (a) {
                        a.isPrimary && (this.firstXY = this.firstTouch = null, this.resetClickCount())
                    }, clickCount: 0, resetId: null, resetClickCount: function () {
                        var a = function () {
                            this.clickCount = 0;
                            this.resetId = null
                        }.bind(this);
                        this.resetId = setTimeout(a, 200)
                    }, cancelResetClickCount: function () {
                        this.resetId && clearTimeout(this.resetId)
                    }, typeToButtons: function (a) {
                        var b = 0;
                        if ("touchstart" === a || "touchmove" === a) b = 1;
                        return b
                    }, touchToPointer: function (a) {
                        var b = this.currentTouchEvent,
                            d = r.cloneEvent(a), e = d.pointerId = a.identifier + 2;
                        d.target = ba[e] || W(d);
                        d.bubbles = !0;
                        d.cancelable = !0;
                        d.detail = this.clickCount;
                        d.button = 0;
                        d.buttons = this.typeToButtons(b.type);
                        d.width = a.radiusX || a.webkitRadiusX || 0;
                        d.height = a.radiusY || a.webkitRadiusY || 0;
                        d.pressure = a.force || a.webkitForce || .5;
                        d.isPrimary = this.isPrimaryTouch(a);
                        d.pointerType = this.POINTER_TYPE;
                        d.altKey = b.altKey;
                        d.ctrlKey = b.ctrlKey;
                        d.metaKey = b.metaKey;
                        d.shiftKey = b.shiftKey;
                        var c = this;
                        d.preventDefault = function () {
                            c.scrolling = !1;
                            c.firstXY = null;
                            b.preventDefault()
                        };
                        return d
                    }, processTouches: function (a, b) {
                        var d = a.changedTouches;
                        this.currentTouchEvent = a;
                        a = 0;
                        for (var e; a < d.length; a++) e = d[a], b.call(this, this.touchToPointer(e))
                    }, shouldScroll: function (a) {
                        if (this.firstXY) {
                            var b;
                            b = a.currentTarget._scrollType;
                            if ("none" === b) b = !1; else if ("XY" === b) b = !0; else {
                                a = a.changedTouches[0];
                                var d = "Y" === b ? "X" : "Y";
                                b = Math.abs(a["client" + b] - this.firstXY[b]) >= Math.abs(a["client" + d] - this.firstXY[d])
                            }
                            this.firstXY = null;
                            return b
                        }
                    }, findTouch: function (a, b) {
                        for (var d = 0, e = a.length,
                                 c; d < e && (c = a[d]); d++) if (c.identifier === b) return !0
                    }, vacuumTouches: function (a) {
                        var b = a.touches;
                        if (L.size >= b.length) {
                            var d = [];
                            L.forEach(function (a, e) {
                                1 === e || this.findTouch(b, e - 2) || d.push(a.out)
                            }, this);
                            d.forEach(this.cancelOut, this)
                        }
                    }, touchstart: function (a) {
                        this.vacuumTouches(a);
                        this.setPrimaryTouch(a.changedTouches[0]);
                        this.dedupSynthMouse(a);
                        this.scrolling || (this.clickCount++, this.processTouches(a, this.overDown))
                    }, overDown: function (a) {
                        L.set(a.pointerId, {target: a.target, out: a, outTarget: a.target});
                        r.enterOver(a);
                        r.down(a)
                    }, touchmove: function (a) {
                        this.scrolling || (this.shouldScroll(a) ? (this.scrolling = !0, this.touchcancel(a)) : (a.preventDefault(), this.processTouches(a, this.moveOverOut)))
                    }, moveOverOut: function (a) {
                        var b = L.get(a.pointerId);
                        if (b) {
                            var d = b.out, e = b.outTarget;
                            r.move(a);
                            d && e !== a.target && (d.relatedTarget = a.target, a.relatedTarget = e, d.target = e, a.target ? (r.leaveOut(d), r.enterOver(a)) : (a.target = e, a.relatedTarget = null, this.cancelOut(a)));
                            b.out = a;
                            b.outTarget = a.target
                        }
                    }, touchend: function (a) {
                        this.dedupSynthMouse(a);
                        this.processTouches(a, this.upOut)
                    }, upOut: function (a) {
                        this.scrolling || (r.up(a), r.leaveOut(a));
                        this.cleanUpPointer(a)
                    }, touchcancel: function (a) {
                        this.processTouches(a, this.cancelOut)
                    }, cancelOut: function (a) {
                        r.cancel(a);
                        r.leaveOut(a);
                        this.cleanUpPointer(a)
                    }, cleanUpPointer: function (a) {
                        L.delete(a.pointerId);
                        this.removePrimaryPointer(a)
                    }, dedupSynthMouse: function (a) {
                        var b = O.lastTouches;
                        a = a.changedTouches[0];
                        this.isPrimaryTouch(a) && (a = {x: a.clientX, y: a.clientY}, b.push(a), b = function (a, b) {
                            b = a.indexOf(b);
                            -1 < b &&
                            a.splice(b, 1)
                        }.bind(null, b, a), setTimeout(b, 2500))
                    }
                };
                Y = new e(P.elementAdded, P.elementRemoved, P.elementChanged, P);
                var Z = r.pointermap,
                    ca = window.MSPointerEvent && "number" === typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE, aa = {
                        events: "MSPointerDown MSPointerMove MSPointerUp MSPointerOut MSPointerOver MSPointerCancel MSGotPointerCapture MSLostPointerCapture".split(" "),
                        register: function (a) {
                            r.listen(a, this.events)
                        },
                        unregister: function (a) {
                            r.unlisten(a, this.events)
                        },
                        POINTER_TYPES: ["", "unavailable", "touch",
                            "pen", "mouse"],
                        prepareEvent: function (a) {
                            var b = a;
                            ca && (b = r.cloneEvent(a), b.pointerType = this.POINTER_TYPES[a.pointerType]);
                            return b
                        },
                        cleanup: function (a) {
                            Z.delete(a)
                        },
                        MSPointerDown: function (a) {
                            Z.set(a.pointerId, a);
                            a = this.prepareEvent(a);
                            r.down(a)
                        },
                        MSPointerMove: function (a) {
                            a = this.prepareEvent(a);
                            r.move(a)
                        },
                        MSPointerUp: function (a) {
                            var b = this.prepareEvent(a);
                            r.up(b);
                            this.cleanup(a.pointerId)
                        },
                        MSPointerOut: function (a) {
                            a = this.prepareEvent(a);
                            r.leaveOut(a)
                        },
                        MSPointerOver: function (a) {
                            a = this.prepareEvent(a);
                            r.enterOver(a)
                        },
                        MSPointerCancel: function (a) {
                            var b = this.prepareEvent(a);
                            r.cancel(b);
                            this.cleanup(a.pointerId)
                        },
                        MSLostPointerCapture: function (a) {
                            a = r.makeEvent("lostpointercapture", a);
                            r.dispatchEvent(a)
                        },
                        MSGotPointerCapture: function (a) {
                            a = r.makeEvent("gotpointercapture", a);
                            r.dispatchEvent(a)
                        }
                    }, T, U;
                window.navigator.msPointerEnabled ? (T = function (a) {
                    g(a);
                    b(this);
                    0 !== r.pointermap.get(a).buttons && this.msSetPointerCapture(a)
                }, U = function (a) {
                    g(a);
                    this.msReleasePointerCapture(a)
                }) : (T = function (a) {
                    g(a);
                    b(this);
                    0 !==
                    r.pointermap.get(a).buttons && r.setCapture(a, this)
                }, U = function (a) {
                    g(a);
                    r.releaseCapture(a, this)
                });
                var da = window.PointerEvent || window.MSPointerEvent;
                return {
                    dispatcher: r,
                    Installer: e,
                    PointerEvent: n,
                    PointerMap: m,
                    targetFinding: x,
                    applyGlobal: function () {
                        h();
                        window.PointerEvent || (window.PointerEvent = n, window.navigator.msPointerEnabled ? (Object.defineProperty(window.navigator, "maxTouchPoints", {
                            value: window.navigator.msMaxTouchPoints,
                            enumerable: !0
                        }), r.registerSource("ms", aa)) : (r.registerSource("mouse", O), void 0 !==
                        window.ontouchstart && r.registerSource("touch", P)), r.register(document));
                        window.Element && !Element.prototype.setPointerCapture && Object.defineProperties(Element.prototype, {
                            setPointerCapture: {value: T},
                            releasePointerCapture: {value: U}
                        })
                    },
                    applyLocal: function (a) {
                        da || (window.PointerEvent || (window.navigator.msPointerEnabled ? r.registerSource("ms", aa) : (r.registerSource("mouse", O), void 0 !== window.ontouchstart && r.registerSource("touch", P)), r.register(document)), window.Element && !Element.prototype.setPointerCapture &&
                        (a.setPointerCapture = T.bind(a), a.releasePointerCapture = U.bind(a)), a.getAttribute("touch-action") || a.setAttribute("touch-action", "none"))
                    }
                }
            })
        }, "esri/views/input/keys": function () {
            define(["require", "exports", "../../core/sniff"], function (n, c, e) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.primaryKey = e("mac") ? "Meta" : "Ctrl";
                var a = {
                    8: "Backspace",
                    9: "Tab",
                    13: "Enter",
                    27: "Escape",
                    33: "PageUp",
                    34: "PageDown",
                    35: "End",
                    36: "Home",
                    37: "ArrowLeft",
                    38: "ArrowUp",
                    39: "ArrowRight",
                    40: "ArrowDown",
                    45: "Insert",
                    46: "Delete"
                };
                for (n = 48; 58 > n; n++) a[n] = String.fromCharCode(n);
                for (n = 1; 25 > n; n++) a[111 + n] = "F" + n;
                for (n = 65; 91 > n; n++) a[n] = [String.fromCharCode(n + 32), String.fromCharCode(n)];
                var l = {Left: "ArrowLeft", Right: "ArrowRight", Up: "ArrowUp", Down: "ArrowDown", Esc: "Escape"};
                c.eventKey = function (e) {
                    if (void 0 !== e.key) return l[e.key] || e.key;
                    var c = a[e.keyCode];
                    return Array.isArray(c) ? e.shiftKey ? c[1] : c[0] : c
                };
                c.isSystemModifier = function (a) {
                    switch (a) {
                        case "Ctrl":
                        case "Alt":
                        case "Shift":
                        case "Meta":
                        case "Primary":
                            return !0
                    }
                }
            })
        }, "esri/views/input/InputManager": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/Logger ../../core/now ../../core/accessorSupport/decorators ./keys ./recognizers ./handlers/LatestPointerType".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    var m = k.getLogger("esri.views.input.InputManager");
                    n = function (c) {
                        function p(a, d) {
                            a = c.call(this) || this;
                            a._pointerCaptures = new Map;
                            a._nameToGroup = {};
                            a._handlers = [];
                            a._currentPropagation = null;
                            a._sourceEvents = new Set;
                            a._keyModifiers = new Set;
                            a._activeKeyModifiers = new Set;
                            a.primaryKey = b.primaryKey;
                            a.latestPointerType = "mouse";
                            a._installRecognizers();
                            return a
                        }

                        e(p, c);
                        p.prototype.normalizeCtorArgs = function (a, b) {
                            this._browserEvents =
                                a;
                            this._browserEvents.onEventReceived = this._onEventReceived.bind(this);
                            this._recognizers = b;
                            this._recognizers || (this._recognizers = d.defaults.map(function (a) {
                                return new a
                            }));
                            return {}
                        };
                        p.prototype.destroy = function () {
                            for (var a = 0, b = Object.keys(this._nameToGroup); a < b.length; a++) this.uninstallHandlers(b[a])
                        };
                        p.prototype.installHandlers = function (a, b) {
                            var d = this;
                            if (this._nameToGroup[a]) m.error("There is already an InputHandler group registered under the name `" + a + "`"); else if (0 === b.length) m.error("Can't register a group of zero handlers");
                            else {
                                var e = {
                                    name: a, handlers: b.map(function (a, b) {
                                        return {
                                            handler: a,
                                            active: !0,
                                            removed: !1,
                                            priorityIndex: 0,
                                            eventCallback: null,
                                            uninstallCallback: null
                                        }
                                    })
                                };
                                this._nameToGroup[a] = e;
                                a = function (a) {
                                    var b = e.handlers[a];
                                    c._handlers.push(b);
                                    b.handler.onInstall({
                                        updateDependencies: function () {
                                            d.updateDependencies()
                                        }, emit: function (a, e, c, f) {
                                            d._emitInputEvent(b.priorityIndex, a, e, c, f)
                                        }, setPointerCapture: function (a, c) {
                                            d._setPointerCapture(e, b, a, c)
                                        }, setEventCallback: function (a) {
                                            b.eventCallback = a
                                        }, setUninstallCallback: function (a) {
                                            b.uninstallCallback =
                                                a
                                        }
                                    })
                                };
                                var c = this;
                                for (b = e.handlers.length - 1; 0 <= b; b--) a(b);
                                this.updateDependencies()
                            }
                        };
                        p.prototype.uninstallHandlers = function (a) {
                            var b = this._nameToGroup[a];
                            b ? (b.handlers.forEach(function (a) {
                                a.removed = !0;
                                a.uninstallCallback()
                            }), delete this._nameToGroup[a], this._currentPropagation ? this._currentPropagation.needsHandlerGarbageCollect = !0 : this._garbageCollectRemovedHandlers()) : m.error("There is no InputHandler group registered under the name `" + a + "`")
                        };
                        p.prototype.hasHandlers = function (a) {
                            return void 0 !==
                                this._nameToGroup[a]
                        };
                        p.prototype.updateDependencies = function () {
                            var a = new Set, d = new Set;
                            this._handlersPriority = [];
                            for (var e = this._handlers.length - 1; 0 <= e; e--) {
                                var c = this._handlers[e];
                                c.priorityIndex = e;
                                this._handlersPriority.push(c)
                            }
                            this._handlersPriority = this._sortHandlersPriority(this._handlersPriority);
                            for (e = this._handlersPriority.length - 1; 0 <= e; e--) {
                                c = this._handlersPriority[e];
                                c.priorityIndex = e;
                                var f = c.handler.hasSideEffects;
                                if (!f) for (var g = 0, m = c.handler.outgoingEventTypes; g < m.length; g++) if (a.has(m[g])) {
                                    f =
                                        !0;
                                    break
                                }
                                if (f) for (g = 0, m = c.handler.incomingEventMatches; g < m.length; g++) {
                                    var h = m[g];
                                    a.add(h.eventType);
                                    for (var p = 0, h = h.keyModifiers; p < h.length; p++) {
                                        var l = h[p];
                                        b.isSystemModifier(l) || d.add(l)
                                    }
                                }
                                c.active = f
                            }
                            this._sourceEvents = a;
                            this._keyModifiers = d;
                            0 < this._pointerCaptures.size && this._sourceEvents.add("pointer-capture-lost");
                            0 < this._keyModifiers.size && (this._sourceEvents.add("key-down"), this._sourceEvents.add("key-up"));
                            this._browserEvents && (this._browserEvents.activeEvents = this._sourceEvents)
                        };
                        p.prototype._setLatestPointerType =
                            function (a) {
                                this._set("latestPointerType", a)
                            };
                        p.prototype._onEventReceived = function (a, b) {
                            "pointer-capture-lost" === a && this._pointerCaptures.delete(b.native.pointerId);
                            this._updateKeyModifiers(a, b);
                            this._emitInputEventFromSource(a, b, b.native.timestamp)
                        };
                        p.prototype._updateKeyModifiers = function (a, b) {
                            var d = this;
                            if (b) {
                                var e = !1, c = function () {
                                    if (!e) {
                                        var a = new Set;
                                        d._activeKeyModifiers.forEach(function (b) {
                                            a.add(b)
                                        });
                                        d._activeKeyModifiers = a;
                                        e = !0
                                    }
                                }, f = function (a, b) {
                                    b && !d._activeKeyModifiers.has(a) ? (c(), d._activeKeyModifiers.add(a)) :
                                        !b && d._activeKeyModifiers.has(a) && (c(), d._activeKeyModifiers.delete(a))
                                };
                                if ("key-down" === a || "key-up" === a) {
                                    var g = b.key;
                                    this._keyModifiers.has(g) && f(g, "key-down" === a)
                                }
                                a = b.native;
                                f("Alt", !(!a || !a.altKey));
                                f("Ctrl", !(!a || !a.ctrlKey));
                                f("Shift", !(!a || !a.shiftKey));
                                f("Meta", !(!a || !a.metaKey));
                                f("Primary", this._activeKeyModifiers.has(this.primaryKey))
                            }
                        };
                        p.prototype._installRecognizers = function () {
                            var a = this;
                            this._latestPointerTypeHandler = new f.LatestPointerType(function (b) {
                                return a._setLatestPointerType(b)
                            });
                            0 < this._recognizers.length && this.installHandlers("default", this._recognizers);
                            this.installHandlers("input-manager-logic", [this._latestPointerTypeHandler])
                        };
                        p.prototype._setPointerCapture = function (a, b, d, e) {
                            a = a.name + "-" + b.priorityIndex;
                            b = this._pointerCaptures.get(d.pointerId) || new Set;
                            this._pointerCaptures.set(d.pointerId, b);
                            e ? (b.add(a), 1 === b.size && this._browserEvents && this._browserEvents.setPointerCapture(d, !0)) : b.has(a) && (b.delete(a), 0 === b.size && (this._pointerCaptures.delete(d.pointerId), this._browserEvents &&
                            this._browserEvents.setPointerCapture(d, !1)))
                        };
                        p.prototype._garbageCollectRemovedHandlers = function () {
                            this._handlers = this._handlers.filter(function (a) {
                                return !a.removed
                            });
                            this.updateDependencies()
                        };
                        p.prototype._emitInputEventFromSource = function (a, b, d) {
                            this._emitInputEvent(0, a, b, d)
                        };
                        p.prototype._emitInputEvent = function (a, b, d, e, c) {
                            e = void 0 !== e ? e : this._currentPropagation ? this._currentPropagation.timestamp : h();
                            b = new q(b, d, e, c || this._activeKeyModifiers);
                            this._currentPropagation ? this._currentPropagation.addedEvents.push(b) :
                                this._doNewPropagation(a, b)
                        };
                        p.prototype._doNewPropagation = function (a, b) {
                            for (a = this._currentPropagation = {
                                events: [b],
                                addedEvents: [],
                                currentHandler: this._handlersPriority[a],
                                needsHandlerGarbageCollect: !1,
                                timestamp: b.timestamp
                            }; a.currentHandler;) {
                                if (a.currentHandler.removed) a.needsHandlerGarbageCollect = !0; else {
                                    b = a.events;
                                    var d = [];
                                    a.addedEvents = [];
                                    for (var e = 0; e < b.length; e++) {
                                        var c = b[e];
                                        a.currentHandler.active && a.currentHandler.eventCallback(c);
                                        c.shouldStopPropagation() || d.push(c)
                                    }
                                    a.events = d.concat(a.addedEvents)
                                }
                                a.currentHandler =
                                    this._handlersPriority[a.currentHandler.priorityIndex + 1]
                            }
                            a.needsHandlerGarbageCollect && this._garbageCollectRemovedHandlers();
                            this._currentPropagation = null
                        };
                        p.prototype._compareHandlerPriority = function (a, b) {
                            if (a.handler.hasSideEffects !== b.handler.hasSideEffects) return a.handler.hasSideEffects ? 1 : -1;
                            for (var d = 0, e = a.handler.incomingEventMatches; d < e.length; d++) for (var c = e[d], f = function (a) {
                                if (c.eventType !== a.eventType) return "continue";
                                var b = c.keyModifiers.filter(function (b) {
                                    return -1 !== a.keyModifiers.indexOf(b)
                                });
                                if (b.length === c.keyModifiers.length !== (b.length === a.keyModifiers.length)) return {value: c.keyModifiers.length > a.keyModifiers.length ? -1 : 1}
                            }, g = 0, m = b.handler.incomingEventMatches; g < m.length; g++) {
                                var h = f(m[g]);
                                if ("object" === typeof h) return h.value
                            }
                            return a.priorityIndex > b.priorityIndex ? -1 : 1
                        };
                        p.prototype._sortHandlersPriority = function (a) {
                            for (var b = [], d = 0; d < a.length; d++) {
                                for (var e = a[d], c = 0; c < b.length && 0 <= this._compareHandlerPriority(e, b[c]);) c++;
                                b.splice(c, 0, e)
                            }
                            return b
                        };
                        a([g.property({readOnly: !0})], p.prototype,
                            "latestPointerType", void 0);
                        return p = a([g.subclass("esri.views.input.InputManager")], p)
                    }(g.declared(l));
                    c.InputManager = n;
                    var q = function () {
                        function a(a, b, d, e) {
                            this.type = a;
                            this.data = b;
                            this.timestamp = d;
                            this.modifiers = e;
                            this._stopPropagation = !1
                        }

                        a.prototype.stopPropagation = function () {
                            this._stopPropagation = !0
                        };
                        a.prototype.shouldStopPropagation = function () {
                            return this._stopPropagation
                        };
                        return a
                    }()
                })
        }, "esri/views/input/recognizers": function () {
            define("require exports ./recognizers/Drag ./recognizers/PointerClickHoldAndDrag ./recognizers/SingleAndDoubleClick ./recognizers/VerticalTwoFingerDrag".split(" "),
                function (n, c, e, a, l, k) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    c.defaults = [a.PointerClickHoldAndDrag, l.SingleAndDoubleClick, e.Drag, k.VerticalTwoFingerDrag]
                })
        }, "esri/views/input/recognizers/Drag": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper", "../InputHandler", "./support"], function (n, c, e, a, l) {
                function k(a) {
                    var b = [];
                    a.forEach(function (a) {
                        b.push(a.event)
                    });
                    return l.fitCircleLSQ(b)
                }

                function h(a) {
                    var d = k(a), e = 0;
                    a.forEach(function (a) {
                        for (var c = b(a, d), c = c - a.lastAngle; c >
                        Math.PI;) c -= 2 * Math.PI;
                        for (; c < -Math.PI;) c += 2 * Math.PI;
                        c = a.lastAngle + c;
                        a.lastAngle = c;
                        e += c - a.initialAngle
                    });
                    e /= a.size || 1;
                    return {angle: e, radius: d.radius, center: d.center}
                }

                function g(a) {
                    var b = new Map;
                    a.forEach(function (a, d) {
                        return b.set(d, a.event)
                    });
                    return b
                }

                function b(a, b) {
                    a = a.event;
                    return Math.atan2(a.y - b.center.y, a.x - b.center.x)
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (a) {
                    function d() {
                        var b = a.call(this, !1) || this;
                        b.startStateModifiers = new Set;
                        b.activePointerMap = new Map;
                        b.isDragging =
                            !1;
                        b.drag = b.registerOutgoing("drag");
                        b.registerIncoming("pointer-drag", b.handlePointerDrag.bind(b));
                        b.registerIncoming("pointer-up", b.handlePointerUpAndPointerLost.bind(b));
                        b.registerIncoming("pointer-capture-lost", b.handlePointerUpAndPointerLost.bind(b));
                        b.registerIncoming("pointer-cancel", b.handlePointerUpAndPointerLost.bind(b));
                        return b
                    }

                    e(d, a);
                    d.prototype.createPayload = function (a, b, d, e) {
                        return {
                            action: a,
                            pointerType: this.pointerType,
                            button: this.mouseButton,
                            buttons: b.buttons,
                            timestamp: e,
                            pointers: g(this.activePointerMap),
                            pointer: b,
                            angle: d.angle,
                            radius: d.radius,
                            center: d.center
                        }
                    };
                    d.prototype.addPointer = function (a) {
                        var d = a.native.pointerId, e = h(this.activePointerMap).angle;
                        a = {event: a, initialAngle: 0, lastAngle: 0};
                        this.activePointerMap.set(d, a);
                        d = b(a, k(this.activePointerMap));
                        a.initialAngle = d;
                        a.lastAngle = d;
                        this.updatePointerAngles(e)
                    };
                    d.prototype.updatePointer = function (a) {
                        if (!a || null != a.x || null != a.y) {
                            var b = this.activePointerMap.get(a.native.pointerId);
                            b ? b.event = a : this.addPointer(a)
                        }
                    };
                    d.prototype.removePointer = function (a) {
                        var b =
                            h(this.activePointerMap).angle;
                        this.activePointerMap.delete(a);
                        this.updatePointerAngles(b)
                    };
                    d.prototype.updatePointerAngles = function (a) {
                        var d = h(this.activePointerMap);
                        this.activePointerMap.forEach(function (e) {
                            e.initialAngle = b(e, d) - a;
                            e.lastAngle = b(e, d) - a
                        })
                    };
                    d.prototype.emitEvent = function (a, b, d) {
                        var e = h(this.activePointerMap);
                        this.drag.emit(this.createPayload(a, b, e, d), void 0, this.startStateModifiers)
                    };
                    d.prototype.handlePointerUpAndPointerLost = function (a) {
                        var b = a.data.native.pointerId, d = a.timestamp;
                        this.activePointerMap.get(b) && (1 === this.activePointerMap.size ? (this.updatePointer(a.data), this.emitEvent("end", a.data, d), this.isDragging = !1, this.removePointer(b)) : (this.removePointer(b), this.emitEvent("removed", a.data, a.timestamp)))
                    };
                    d.prototype.handlePointerDrag = function (a) {
                        var b = a.data, d = b.currentEvent, e = a.timestamp;
                        switch (b.action) {
                            case "start":
                            case "update":
                                this.isDragging ? this.activePointerMap.has(d.native.pointerId) ? (this.updatePointer(d), this.emitEvent("update", d, e)) : (this.addPointer(d), this.emitEvent("added",
                                    d, e)) : (this.updatePointer(d), this.pointerType = a.data.startEvent.pointerType, this.mouseButton = a.data.startEvent.button, this.startStateModifiers = a.modifiers, this.isDragging = !0, this.emitEvent("start", d, e))
                        }
                    };
                    return d
                }(a.InputHandler);
                c.Drag = n;
                (function (a) {
                    a[a.Left = 0] = "Left";
                    a[a.Middle = 1] = "Middle";
                    a[a.Right = 2] = "Right";
                    a[a.Back = 3] = "Back";
                    a[a.Forward = 4] = "Forward";
                    a[a.Undefined = -1] = "Undefined"
                })(c.Button || (c.Button = {}))
            })
        }, "esri/views/input/recognizers/support": function () {
            define(["require", "exports"], function (n,
                                                     c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.manhattanDistance = function (e, a) {
                    return Math.abs(a.x - e.x) + Math.abs(a.y - e.y)
                };
                c.euclideanDistance = function (e, a) {
                    var c = a.x - e.x;
                    e = a.y - e.y;
                    return Math.sqrt(c * c + e * e)
                };
                c.fitCircleLSQ = function (e, a) {
                    a ? (a.radius = 0, a.center.x = 0, a.center.y = 0) : a = {radius: 0, center: {x: 0, y: 0}};
                    if (0 === e.length) return a;
                    if (1 === e.length) return a.center.x = e[0].x, a.center.y = e[0].y, a;
                    if (2 === e.length) {
                        var c = e[0];
                        e = e[1];
                        var k = [e.x - c.x, e.y - c.y], h = k[0], k = k[1];
                        a.radius = Math.sqrt(h * h + k * k) /
                            2;
                        a.center.x = (c.x + e.x) / 2;
                        a.center.y = (c.y + e.y) / 2;
                        return a
                    }
                    for (var g = 0, b = 0, d = 0; d < e.length; d++) g += e[d].x, b += e[d].y;
                    for (var g = g / e.length, b = b / e.length, f = e.map(function (a) {
                        return a.x - g
                    }), m = e.map(function (a) {
                        return a.y - b
                    }), q = c = a = 0, p = 0, t = h = 0, d = k = 0; d < f.length; d++) {
                        var u = f[d], r = m[d], n = u * u, v = r * r;
                        a += n;
                        c += v;
                        q += u * r;
                        p += n * u;
                        h += v * r;
                        t += u * v;
                        k += r * n
                    }
                    d = a;
                    f = q;
                    m = c;
                    p = .5 * (p + t);
                    h = .5 * (h + k);
                    k = d * m - q * f;
                    t = (p * m - h * f) / k;
                    h = (d * h - q * p) / k;
                    return {radius: Math.sqrt(t * t + h * h + (a + c) / e.length), center: {x: t + g, y: h + b}}
                }
            })
        }, "esri/views/input/recognizers/PointerClickHoldAndDrag": function () {
            define(["require",
                "exports", "../../../core/tsSupport/extendsHelper", "../InputHandler", "./support"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.DefaultParameters = {
                    maximumClickDelay: 300,
                    movementUntilMouseDrag: 1.5,
                    movementUntilTouchDrag: 6,
                    holdDelay: 500
                };
                n = function (a) {
                    function h(e, b, d, f) {
                        void 0 === e && (e = c.DefaultParameters.maximumClickDelay);
                        void 0 === b && (b = c.DefaultParameters.movementUntilMouseDrag);
                        void 0 === d && (d = c.DefaultParameters.movementUntilTouchDrag);
                        void 0 === f && (f = c.DefaultParameters.holdDelay);
                        var g = a.call(this, !1) || this;
                        g.maximumClickDelay = e;
                        g.movementUntilMouseDrag = b;
                        g.movementUntilTouchDrag = d;
                        g.holdDelay = f;
                        g._pointerState = new Map;
                        g._pointerDrag = g.registerOutgoing("pointer-drag");
                        g._immediateClick = g.registerOutgoing("immediate-click");
                        g._pointerHold = g.registerOutgoing("hold");
                        g.registerIncoming("pointer-down", g._handlePointerDown.bind(g));
                        g.registerIncoming("pointer-up", function (a) {
                            g._handlePointerLoss(a, "pointer-up")
                        });
                        g.registerIncoming("pointer-capture-lost", function (a) {
                            g._handlePointerLoss(a,
                                "pointer-capture-lost")
                        });
                        g.registerIncoming("pointer-cancel", function (a) {
                            g._handlePointerLoss(a, "pointer-cancel")
                        });
                        g._moveHandle = g.registerIncoming("pointer-move", g._handlePointerMove.bind(g));
                        g._moveHandle.pause();
                        return g
                    }

                    e(h, a);
                    h.prototype.onUninstall = function () {
                        this._pointerState.forEach(function (a) {
                            0 !== a.holdTimeout && (clearTimeout(a.holdTimeout), a.holdTimeout = 0)
                        });
                        a.prototype.onUninstall.call(this)
                    };
                    h.prototype._handlePointerDown = function (a) {
                        var b = this, d = a.data, e = d.native.pointerId, c = 0;
                        0 ===
                        this._pointerState.size && (c = setTimeout(function () {
                            var d = b._pointerState.get(e);
                            d && (d.isDragging || (b._pointerHold.emit(d.previousEvent, void 0, a.modifiers), d.holdEmitted = !0), d.holdTimeout = 0)
                        }, this.holdDelay));
                        c = {
                            startEvent: d,
                            previousEvent: d,
                            startTimestamp: a.timestamp,
                            isDragging: !1,
                            downButton: d.native.button,
                            holdTimeout: c,
                            modifiers: new Set
                        };
                        this._pointerState.set(e, c);
                        this.startCapturingPointer(d.native);
                        this._moveHandle.resume();
                        1 < this._pointerState.size && this.startDragging(a)
                    };
                    h.prototype._createPointerDragData =
                        function (a, b, d) {
                            return {
                                action: a,
                                startEvent: b.startEvent,
                                previousEvent: b.previousEvent,
                                currentEvent: d
                            }
                        };
                    h.prototype._handlePointerMove = function (a) {
                        var b = a.data, d = this._pointerState.get(b.native.pointerId);
                        d && (d.isDragging ? this._pointerDrag.emit(this._createPointerDragData("update", d, b), void 0, d.modifiers) : l.euclideanDistance(b, d.startEvent) > ("touch" === b.native.pointerType ? this.movementUntilTouchDrag : this.movementUntilMouseDrag) && this.startDragging(a), d.previousEvent = b)
                    };
                    h.prototype.startDragging = function (a) {
                        var b =
                            this, d = a.data, e = d.native.pointerId;
                        this._pointerState.forEach(function (c) {
                            0 !== c.holdTimeout && (clearTimeout(c.holdTimeout), c.holdTimeout = 0);
                            c.isDragging || (c.modifiers = a.modifiers, c.isDragging = !0, e === c.startEvent.native.pointerId ? b._pointerDrag.emit(b._createPointerDragData("start", c, d)) : b._pointerDrag.emit(b._createPointerDragData("start", c, c.previousEvent), a.timestamp))
                        })
                    };
                    h.prototype._handlePointerLoss = function (a, b) {
                        var d = a.data, e = d.native.pointerId, c = this._pointerState.get(e);
                        c && (0 !== c.holdTimeout &&
                        clearTimeout(c.holdTimeout), c.isDragging ? this._pointerDrag.emit(this._createPointerDragData("end", c, "pointer-up" === b ? d : c.previousEvent), void 0, c.modifiers) : "pointer-up" === b && c.downButton === d.native.button && a.timestamp - c.startTimestamp <= this.maximumClickDelay && !c.holdEmitted && this._immediateClick.emit(d), this._pointerState.delete(e), this.stopCapturingPointer(d.native), 0 === this._pointerState.size && this._moveHandle.pause())
                    };
                    return h
                }(a.InputHandler);
                c.PointerClickHoldAndDrag = n
            })
        }, "esri/views/input/recognizers/SingleAndDoubleClick": function () {
            define(["require",
                "exports", "../../../core/tsSupport/extendsHelper", "../InputHandler", "./support"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.DefaultParameters = {
                    maximumDoubleClickDelay: 250,
                    maximumDoubleClickDistance: 10,
                    maximumDoubleTouchDelay: 350,
                    maximumDoubleTouchDistance: 35
                };
                n = function (a) {
                    function h(e, b, d, f) {
                        void 0 === e && (e = c.DefaultParameters.maximumDoubleClickDelay);
                        void 0 === b && (b = c.DefaultParameters.maximumDoubleClickDistance);
                        void 0 === d && (d = c.DefaultParameters.maximumDoubleTouchDelay);
                        void 0 === f && (f = c.DefaultParameters.maximumDoubleTouchDistance);
                        var g = a.call(this, !1) || this;
                        g.maximumDoubleClickDelay = e;
                        g.maximumDoubleClickDistance = b;
                        g.maximumDoubleTouchDelay = d;
                        g.maximumDoubleTouchDistance = f;
                        g._pointerState = new Map;
                        g._click = g.registerOutgoing("click");
                        g._doubleClick = g.registerOutgoing("double-click");
                        g.registerIncoming("immediate-click", g._handleImmediateClick.bind(g));
                        return g
                    }

                    e(h, a);
                    h.prototype.onUninstall = function () {
                        this._pointerState.forEach(function (a) {
                            0 !== a.doubleClickTimeout &&
                            (clearTimeout(a.doubleClickTimeout), a.doubleClickTimeout = 0)
                        })
                    };
                    h.prototype._pointerId = function (a) {
                        a = a.native;
                        return "mouse" === a.pointerType ? a.pointerId + ":" + a.button : "" + a.pointerType
                    };
                    h.prototype._handleImmediateClick = function (a) {
                        var b = a.data, d = this._pointerId(b), e = this._pointerState.get(d);
                        if (e) {
                            clearTimeout(e.doubleClickTimeout);
                            e.doubleClickTimeout = 0;
                            var c = "touch" === b.native.pointerType ? this.maximumDoubleTouchDistance : this.maximumDoubleClickDistance;
                            l.manhattanDistance(e.event.data, b) > c ? (this._doubleClickTimeoutExceeded(d),
                                this._startClick(a)) : (this._doubleClick.emit(b, void 0, e.event.modifiers), this._pointerState.delete(d))
                        } else this._startClick(a)
                    };
                    h.prototype._startClick = function (a) {
                        var b = this, d = this._pointerId(a.data);
                        this._pointerState.set(d, {
                            event: a, doubleClickTimeout: setTimeout(function () {
                                return b._doubleClickTimeoutExceeded(d)
                            }, "touch" === a.data.native.pointerType ? this.maximumDoubleTouchDelay : this.maximumDoubleClickDelay)
                        })
                    };
                    h.prototype._doubleClickTimeoutExceeded = function (a) {
                        var b = this._pointerState.get(a);
                        this._click.emit(b.event.data,
                            void 0, b.event.modifiers);
                        b.doubleClickTimeout = 0;
                        this._pointerState.delete(a)
                    };
                    return h
                }(a.InputHandler);
                c.SingleAndDoubleClick = n
            })
        }, "esri/views/input/recognizers/VerticalTwoFingerDrag": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper", "../DragEventSeparator", "../InputHandler"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function h(e, b) {
                        void 0 === e && (e = 20);
                        void 0 === b && (b = 40);
                        var d = c.call(this, !1) || this;
                        d._threshold = e;
                        d._maxDelta = b;
                        d.state = "ready";
                        d.emittedArtificalEnd2 = !1;
                        d._vertical = d.registerOutgoing("vertical-two-finger-drag");
                        d._artificalDrag = d.registerOutgoing("drag");
                        d.dragEventSeparator = new a.DragEventSeparator({
                            start: function (a, b) {
                                return d.observeStart(a, b)
                            }, update: function (a, b, e) {
                                return d.observeUpdate(a, b, e)
                            }, end: function (a, b) {
                                return d.observeEnd(a, b)
                            }
                        });
                        d.registerIncoming("drag", function (a) {
                            return d.dragEventSeparator.handle(a)
                        });
                        return d
                    }

                    e(h, c);
                    Object.defineProperty(h.prototype, "failed", {
                        get: function () {
                            return "failed" ===
                                this.state
                        }, enumerable: !0, configurable: !0
                    });
                    h.prototype.observeStart = function (a, b) {
                        1 === a && this.emittedArtificalEnd2 && (this.emittedArtificalEnd2 = !1, this._artificalDrag.emit({
                            action: "start",
                            button: b.data.button,
                            buttons: b.data.buttons,
                            pointerType: b.data.pointerType,
                            timestamp: b.data.timestamp,
                            pointers: b.data.pointers,
                            pointer: b.data.pointer,
                            angle: b.data.angle,
                            radius: b.data.radius,
                            center: b.data.center,
                            artifical: !0
                        }), b.stopPropagation());
                        this.state = 2 === a ? "ready" : "failed"
                    };
                    h.prototype.observeUpdate = function (a,
                                                          b, d) {
                        "failed" !== this.state && 2 === a && ("active" === this.state ? (this._vertical.emit({
                            delta: b.data.center.y - this._thresholdReachedCenter.y,
                            action: "update"
                        }), b.stopPropagation()) : this.checkMovementWithinLimits(b.data, d.data) ? this.checkVerticalThresholdReached(b.data, d.data) && (this.state = "active", this.emittedArtificalEnd2 = !0, this._thresholdReachedCenter = b.data.center, this._artificalDrag.emit({
                            action: "end",
                            button: b.data.button,
                            buttons: b.data.buttons,
                            pointerType: b.data.pointerType,
                            timestamp: b.data.timestamp,
                            pointers: b.data.pointers,
                            pointer: b.data.pointer,
                            angle: b.data.angle,
                            radius: b.data.radius,
                            center: b.data.center,
                            artifical: !0
                        }), this._vertical.emit({
                            delta: b.data.center.y - this._thresholdReachedCenter.y,
                            action: "begin"
                        }), b.stopPropagation()) : this.state = "failed")
                    };
                    h.prototype.observeEnd = function (a, b) {
                        "active" === this.state && (this._vertical.emit({
                            delta: b.data.center.y - this._thresholdReachedCenter.y,
                            action: "end"
                        }), this.state = "ready", b.stopPropagation())
                    };
                    h.prototype.checkMovementWithinLimits = function (a, b) {
                        var d =
                            -Infinity, e = Infinity, c = -Infinity, g = Infinity;
                        b.pointers.forEach(function (a) {
                            d = Math.max(d, a.x);
                            e = Math.min(e, a.x);
                            c = Math.max(c, a.y);
                            g = Math.min(g, a.y)
                        });
                        var h = -Infinity, l = Infinity, k = -Infinity, r = Infinity;
                        a.pointers.forEach(function (a) {
                            h = Math.max(h, a.x);
                            l = Math.min(l, a.x);
                            k = Math.max(k, a.y);
                            r = Math.min(r, a.y)
                        });
                        return Math.abs(a.center.x - b.center.x) < this._threshold && Math.abs(h - l - (d - e)) <= this._maxDelta && Math.abs(k - r - (c - g)) <= this._maxDelta
                    };
                    h.prototype.checkVerticalThresholdReached = function (a, b) {
                        var d = Math.abs(a.center.y -
                            b.center.y);
                        a.pointers.forEach(function (a, e) {
                            e = b.pointers.get(e);
                            d = Math.min(d, Math.abs(a.y - e.y))
                        });
                        return d >= this._threshold
                    };
                    return h
                }(l.InputHandler);
                c.VerticalTwoFingerDrag = n
            })
        }, "esri/views/input/handlers/LatestPointerType": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper", "../InputHandler"], function (n, c, e, a) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (a) {
                    function c(e) {
                        var c = a.call(this, !0) || this;
                        c._onChange = e;
                        c._value = "mouse";
                        c.registerIncoming("pointer-down",
                            function (a) {
                                c._setValue("touch" === a.data.native.pointerType ? "touch" : "mouse")
                            });
                        c._moveHandler = c.registerIncoming("pointer-move", function (a) {
                            c._setValue("touch" === a.data.native.pointerType ? "touch" : "mouse")
                        });
                        c._moveHandler.pause();
                        return c
                    }

                    e(c, a);
                    c.prototype._setValue = function (a) {
                        a !== this._value && ("touch" === a ? this._moveHandler.resume() : this._moveHandler.pause(), this._value = a, this._onChange(a))
                    };
                    return c
                }(a.InputHandler);
                c.LatestPointerType = n
            })
        }, "esri/views/input/ViewEvents": function () {
            define("require exports ../../core/tsSupport/extendsHelper ../../geometry/ScreenPoint ../3d/support/mathUtils ./InputHandler".split(" "),
                function (n, c, e, a, l, k) {
                    function h(a) {
                        return !!b[a]
                    }

                    function g(a) {
                        for (var b = 0; b < a.length; b++) if (!h(a[b])) return !1;
                        return !0
                    }

                    Object.defineProperty(c, "__esModule", {value: !0});
                    var b = {
                        click: !0,
                        "double-click": !0,
                        "immediate-click": !0,
                        hold: !0,
                        drag: !0,
                        "key-down": !0,
                        "key-up": !0,
                        "pointer-down": !0,
                        "pointer-move": !0,
                        "pointer-up": !0,
                        "pointer-drag": !0,
                        "mouse-wheel": !0,
                        "pointer-enter": !0,
                        "pointer-leave": !0
                    }, d;
                    (function (a) {
                        a[a.Left = 0] = "Left";
                        a[a.Middle = 1] = "Middle";
                        a[a.Right = 2] = "Right"
                    })(d || (d = {}));
                    n = function () {
                        function a(a) {
                            this.handlers =
                                new Map;
                            this.counter = 0;
                            this.handlerCounts = new Map;
                            this.view = a;
                            this.inputManager = null
                        }

                        a.prototype.connect = function (a) {
                            var b = this;
                            a && this.disconnect();
                            this.inputManager = a;
                            this.handlers.forEach(function (a, d) {
                                return b.inputManager.installHandlers(d, [a])
                            })
                        };
                        a.prototype.disconnect = function () {
                            var a = this;
                            this.inputManager && this.handlers.forEach(function (b, d) {
                                return a.inputManager.uninstallHandlers(d)
                            });
                            this.inputManager = null
                        };
                        a.prototype.destroy = function () {
                            this.disconnect();
                            this.handlers.clear();
                            this.view =
                                null
                        };
                        a.prototype.register = function (a, b, d) {
                            var e = this, c = Array.isArray(a) ? a : a.split(",");
                            if (!g(c)) return c.some(h) && console.error("Error: registering input events and other events on the view at the same time is not supported."), null;
                            a = Array.isArray(b) ? b : [];
                            d = Array.isArray(b) ? d : b;
                            var m = this.createUniqueGroupName();
                            b = new f(this.view, c, a, d);
                            this.handlers.set(m, b);
                            for (d = 0; d < c.length; d++) {
                                a = c[d];
                                var p = this.handlerCounts.get(a) || 0;
                                this.handlerCounts.set(a, p + 1)
                            }
                            this.inputManager && this.inputManager.installHandlers(m,
                                [b]);
                            return {
                                remove: function () {
                                    return e.removeHandler(m, c)
                                }
                            }
                        };
                        a.prototype.hasHandler = function (a) {
                            return !!this.handlerCounts.get(a)
                        };
                        a.prototype.removeHandler = function (a, b) {
                            if (this.handlers.has(a)) {
                                this.handlers.delete(a);
                                for (var d = 0; d < b.length; d++) {
                                    var e = b[d], c = this.handlerCounts.get(e);
                                    void 0 === c ? console.error("Trying to remove handler for event that has no handlers registered: ", e) : 1 === c ? this.handlerCounts.delete(e) : this.handlerCounts.set(e, c - 1)
                                }
                            }
                            this.inputManager && this.inputManager.uninstallHandlers(a)
                        };
                        a.prototype.createUniqueGroupName = function () {
                            this.counter += 1;
                            return "viewEvents_" + this.counter
                        };
                        return a
                    }();
                    c.ViewEvents = n;
                    var f = function (b) {
                        function d(a, d, e, c) {
                            var f = b.call(this, !0) || this;
                            f.view = a;
                            for (a = 0; a < d.length; a++) switch (d[a]) {
                                case "click":
                                    f.registerIncoming("click", e, function (a) {
                                        return c(f.wrapClick(a))
                                    });
                                    break;
                                case "double-click":
                                    f.registerIncoming("double-click", e, function (a) {
                                        return c(f.wrapDoubleClick(a))
                                    });
                                    break;
                                case "immediate-click":
                                    f.registerIncoming("immediate-click", e, function (a) {
                                        return c(f.wrapImmediateClick(a))
                                    });
                                    break;
                                case "hold":
                                    f.registerIncoming("hold", e, function (a) {
                                        return c(f.wrapHold(a))
                                    });
                                    break;
                                case "drag":
                                    f.registerIncoming("drag", e, function (a) {
                                        (a = f.wrapDrag(a)) && c(a)
                                    });
                                    break;
                                case "key-down":
                                    f.registerIncoming("key-down", e, function (a) {
                                        return c(f.wrapKeyDown(a))
                                    });
                                    break;
                                case "key-up":
                                    f.registerIncoming("key-up", e, function (a) {
                                        return c(f.wrapKeyUp(a))
                                    });
                                    break;
                                case "pointer-down":
                                    f.registerIncoming("pointer-down", e, function (a) {
                                        return c(f.wrapPointer(a, "pointer-down"))
                                    });
                                    break;
                                case "pointer-move":
                                    f.registerIncoming("pointer-move",
                                        e, function (a) {
                                            return c(f.wrapPointer(a, "pointer-move"))
                                        });
                                    break;
                                case "pointer-up":
                                    f.registerIncoming("pointer-up", e, function (a) {
                                        return c(f.wrapPointer(a, "pointer-up"))
                                    });
                                    break;
                                case "pointer-drag":
                                    f.registerIncoming("pointer-drag", e, function (a) {
                                        return c(f.wrapPointerDrag(a))
                                    });
                                    break;
                                case "mouse-wheel":
                                    f.registerIncoming("mouse-wheel", e, function (a) {
                                        return c(f.wrapMouseWheel(a))
                                    });
                                    break;
                                case "pointer-enter":
                                    f.registerIncoming("pointer-enter", e, function (a) {
                                        return c(f.wrapPointer(a, "pointer-enter"))
                                    });
                                    break;
                                case "pointer-leave":
                                    f.registerIncoming("pointer-leave", e, function (a) {
                                        return c(f.wrapPointer(a, "pointer-leave"))
                                    })
                            }
                            return f
                        }

                        e(d, b);
                        d.prototype.wrapClick = function (b) {
                            var d = b.data, e = d.x, c = d.y;
                            return {
                                type: "click",
                                pointerType: d.pointerType,
                                button: d.button,
                                buttons: d.buttons,
                                x: e,
                                y: c,
                                native: d.native,
                                timestamp: b.timestamp,
                                screenPoint: new a(e, c),
                                mapPoint: this.view.toMap(e, c),
                                stopPropagation: function () {
                                    return b.stopPropagation()
                                }
                            }
                        };
                        d.prototype.wrapDoubleClick = function (a) {
                            var b = a.data, d = b.x, e = b.y;
                            return {
                                type: "double-click",
                                pointerType: b.pointerType,
                                button: b.button,
                                buttons: b.buttons,
                                x: d,
                                y: e,
                                native: b.native,
                                timestamp: a.timestamp,
                                mapPoint: this.view.toMap(d, e),
                                stopPropagation: function () {
                                    return a.stopPropagation()
                                }
                            }
                        };
                        d.prototype.wrapImmediateClick = function (a) {
                            var b = a.data, d = b.x, e = b.y;
                            return {
                                type: "immediate-click",
                                pointerType: b.pointerType,
                                button: b.button,
                                buttons: b.buttons,
                                x: d,
                                y: e,
                                native: b.native,
                                timestamp: a.timestamp,
                                mapPoint: this.view.toMap(d, e),
                                stopPropagation: function () {
                                    return a.stopPropagation()
                                }
                            }
                        };
                        d.prototype.wrapHold =
                            function (a) {
                                var b = a.data, d = b.x, e = b.y;
                                return {
                                    type: "hold",
                                    pointerType: b.pointerType,
                                    button: b.button,
                                    buttons: b.buttons,
                                    x: d,
                                    y: e,
                                    native: b.native,
                                    timestamp: a.timestamp,
                                    mapPoint: this.view.toMap(d, e),
                                    stopPropagation: function () {
                                        return a.stopPropagation()
                                    }
                                }
                            };
                        d.prototype.wrapDrag = function (a) {
                            var b = a.data, d = b.center, e = d.x, d = d.y, c = b.action, f = b.pointerType,
                                g = b.button;
                            "start" === c && (this.latestDragStart = b);
                            if (this.latestDragStart) {
                                var m = b.pointer.native, h = b.buttons, p = a.timestamp, k = {
                                    x: this.latestDragStart.center.x,
                                    y: this.latestDragStart.center.y
                                };
                                "end" === c && (this.latestDragStart = void 0);
                                return {
                                    type: "drag",
                                    action: c,
                                    x: e,
                                    y: d,
                                    origin: k,
                                    pointerType: f,
                                    button: g,
                                    buttons: h,
                                    radius: b.radius,
                                    angle: l.rad2deg(b.angle),
                                    native: m,
                                    timestamp: p,
                                    stopPropagation: function () {
                                        return a.stopPropagation()
                                    }
                                }
                            }
                        };
                        d.prototype.wrapKeyDown = function (a) {
                            var b = a.data;
                            return {
                                type: "key-down",
                                key: b.key,
                                repeat: b.repeat,
                                native: b.native,
                                timestamp: a.timestamp,
                                stopPropagation: function () {
                                    return a.stopPropagation()
                                }
                            }
                        };
                        d.prototype.wrapKeyUp = function (a) {
                            var b =
                                a.data;
                            return {
                                type: "key-up",
                                key: b.key,
                                native: b.native,
                                timestamp: a.timestamp,
                                stopPropagation: function () {
                                    return a.stopPropagation()
                                }
                            }
                        };
                        d.prototype.wrapPointer = function (a, b) {
                            var d = a.data, e = d.native;
                            return {
                                type: b,
                                x: d.x,
                                y: d.y,
                                pointerId: e.pointerId,
                                pointerType: e.pointerType,
                                button: d.button,
                                buttons: d.buttons,
                                native: e,
                                timestamp: a.timestamp,
                                stopPropagation: function () {
                                    return a.stopPropagation()
                                }
                            }
                        };
                        d.prototype.wrapPointerDrag = function (a) {
                            var b = a.data.currentEvent, d = a.data.startEvent.native;
                            return {
                                type: "pointer-drag",
                                x: b.x,
                                y: b.y,
                                pointerId: d.pointerId,
                                pointerType: d.pointerType,
                                button: a.data.startEvent.button,
                                buttons: b.buttons,
                                action: a.data.action,
                                origin: {x: a.data.startEvent.x, y: a.data.startEvent.y},
                                native: b.native,
                                timestamp: a.timestamp,
                                stopPropagation: function () {
                                    return a.stopPropagation()
                                }
                            }
                        };
                        d.prototype.wrapMouseWheel = function (a) {
                            var b = a.data;
                            return {
                                type: "mouse-wheel",
                                x: b.x,
                                y: b.y,
                                deltaY: b.deltaY,
                                native: b.native,
                                timestamp: a.timestamp,
                                stopPropagation: function () {
                                    return a.stopPropagation()
                                }
                            }
                        };
                        return d
                    }(k.InputHandler)
                })
        },
        "esri/views/input/handlers/PreventContextMenu": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper", "../InputHandler"], function (n, c, e, a) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (a) {
                    function c() {
                        var e = a.call(this, !0) || this;
                        e.registerIncoming("context-menu", function (a) {
                            a.data.native.preventDefault()
                        });
                        return e
                    }

                    e(c, a);
                    return c
                }(a.InputHandler);
                c.PreventContextMenu = n;
                c.default = n
            })
        }, "esri/views/2d/layers/support/GraphicsView2D": function () {
            define("require exports ../../../../core/tsSupport/declareExtendsHelper ../../../../core/tsSupport/decorateHelper ../../../../Graphic ../../../../core/Collection ../../../../core/Handles ../../../../core/promiseUtils ../../../../core/accessorSupport/decorators ../../engine/graphics/GFXGroup ../../engine/graphics/GFXObject ../../engine/graphics/GFXSurface ../../../layers/GraphicsView".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q) {
                    return function (c) {
                        function p() {
                            for (var a = [], b = 0; b < arguments.length; b++) a[b] = arguments[b];
                            var e = c.apply(this, a) || this;
                            e._frontGroup = new d;
                            e._handles = new h;
                            e._objects = new Map;
                            e.container = new m;
                            e.container.addChild(e._frontGroup);
                            e.watch("graphics", function () {
                                return e._reset()
                            }, !0);
                            return e
                        }

                        e(p, c);
                        p.prototype.hitTest = function (a, b) {
                            if (!this.view || !this.view.position) return null;
                            a += this.view.position[0] - window.pageXOffset;
                            b += this.view.position[1] - window.pageYOffset;
                            return (a = this.container.hitTest(a, b)) ? g.resolve(a.graphic) : null
                        };
                        p.prototype.graphicUpdateHandler = function (a) {
                            var b = a.graphic, d = a.property;
                            a = a.newValue;
                            if (this._objects.has(b)) {
                                var e = this._objects.get(b);
                                switch (d) {
                                    case "geometry":
                                        e.graphic = b;
                                        break;
                                    case "symbol":
                                        e.renderingInfo = {symbol: a};
                                        break;
                                    case "visible":
                                        e.visible = a
                                }
                            }
                        };
                        p.prototype._reset = function () {
                            var a = this;
                            this._handles.remove("graphics");
                            this._objects.forEach(function (b, d) {
                                a._frontGroup.removeChild(b)
                            });
                            this._objects.clear();
                            this.graphics &&
                            (this.graphics.forEach(this._add, this), this._handles.add(this.graphics.on("change", function (b) {
                                return a._graphicsChangeHandler(b)
                            }), "graphics"))
                        };
                        p.prototype._add = function (a) {
                            if (a && !this._objects.has(a)) {
                                var b = new f;
                                b.graphic = a;
                                b.renderingInfo = {symbol: a.symbol};
                                this._objects.set(a, b);
                                this._frontGroup.addChild(b)
                            }
                        };
                        p.prototype._remove = function (a) {
                            var b = this._objects.get(a);
                            b && (this._objects.delete(a), this._frontGroup.removeChild(b))
                        };
                        p.prototype._graphicsChangeHandler = function (a) {
                            var b = a.added, d = a.removed;
                            a.moved.length && this._reset();
                            for (var e = 0; e < b.length; e++) a = b[e], this._add(a);
                            for (b = 0; b < d.length; b++) a = d[b], this._remove(a)
                        };
                        a([b.property(), b.cast(k.ofType(l))], p.prototype, "graphics", void 0);
                        a([b.property()], p.prototype, "view", void 0);
                        return p = a([b.subclass("esri.views.2d.layers.support.GraphicsView2D")], p)
                    }(b.declared(q))
                })
        }, "esri/views/2d/engine/graphics/GFXGroup": function () {
            define(["require", "exports", "../../../../core/tsSupport/assignHelper", "../../../../core/tsSupport/extendsHelper", "../Container"],
                function (n, c, e, a, l) {
                    return function (c) {
                        function h() {
                            return null !== c && c.apply(this, arguments) || this
                        }

                        a(h, c);
                        h.prototype.attach = function (a) {
                            this.g = a.surface.createGroup();
                            return c.prototype.attach.call(this, a)
                        };
                        h.prototype.detach = function (a) {
                            c.prototype.detach.call(this, a);
                            this.g.destroy();
                            this.g = null
                        };
                        h.prototype.prepareChildrenRenderParameters = function (a) {
                            return e({}, a, {surface: this.g})
                        };
                        h.prototype.detachChild = function (a, b) {
                            return a.detach(b)
                        };
                        h.prototype.attachChild = function (a, b) {
                            return a.attach(b)
                        };
                        h.prototype.renderChild = function (a, b) {
                            return a.processRender(b)
                        };
                        return h
                    }(l)
                })
        }, "esri/views/2d/engine/graphics/GFXObject": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper ../../../../geometry ../../../../geometry/support/spatialReferenceUtils ../../../../geometry/support/webMercatorUtils ../DisplayObject ./gfxUtils".split(" "), function (n, c, e, a, l, k, h, g) {
                var b = new Set, d = [];
                return function (c) {
                    function f() {
                        var a = null !== c && c.apply(this, arguments) || this;
                        a._prevStateId = null;
                        a.visible =
                            !0;
                        return a
                    }

                    e(f, c);
                    Object.defineProperty(f.prototype, "graphic", {
                        get: function () {
                            return this._graphic
                        }, set: function (a) {
                            this._geometry = (this._graphic = a) && a.geometry || null;
                            this._projected = null;
                            this.requestRender()
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(f.prototype, "geometry", {
                        get: function () {
                            return this._geometry
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(f.prototype, "isPolygonMarkerSymbol", {
                        get: function () {
                            var a = this.renderingInfo.symbol.type, b = this.geometry;
                            return b && "polygon" ===
                                b.type && ("simple-marker" === a || "picture-marker" === a || "text" === a)
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(f.prototype, "renderingInfo", {
                        get: function () {
                            return this._renderingInfo
                        }, set: function (a) {
                            this._renderingInfo = a;
                            this.requestRender()
                        }, enumerable: !0, configurable: !0
                    });
                    f.prototype.detach = function () {
                        this._removeShape();
                        this._drawInfo = this._projected = null
                    };
                    f.prototype.doRender = function (a) {
                        var b = a.surface, d = a.state, e = a.projector, c = this._prevStateId !== d.id;
                        if (this.renderRequested || c) if (c &&
                            a.stationary && (this._prevStateId = d.id), this.visible) if (c = this._projectGeometry(this.geometry, a.state.spatialReference), a = this._getScreenOffsets([], a.state), g.isShapeInvalid(this.renderingInfo.symbol, this._shape) && this._removeShape(), a.length) {
                            var f = this._shape, m = c.type;
                            if (!f || this._showRedraw(a, d)) "point" === m ? (f = g.drawPoint(e, b, c, f, this.renderingInfo, d.rotation, a), g.stylePoint(f, this.renderingInfo)) : "multipoint" === m ? (f = g.drawMarkers(e, b, c, f, this.renderingInfo, d.rotation, a, this), g.styleMarkers(f, this.renderingInfo)) :
                                (f = g.drawShape(e, b, c, f, a), g.styleShape(f, this.renderingInfo)), this._shape = f, f.getNode().gfxObject = this
                        } else this._removeShape(); else this._removeShape()
                    };
                    f.prototype._getScreenOffsets = function (a, e) {
                        var c = e.clippedExtent, f = this._projected.outExtent, g = e.spatialReference;
                        a.length = 0;
                        if (!f) return a;
                        if (g.isWrappable) {
                            var g = l.getInfo(g), m = f.cache._partwise, c = c._getParts(g);
                            d.length = 0;
                            if (m && m.length) for (f = 0; f < m.length; f++) d.push.apply(d, m[f]._getParts(g)); else d.push.apply(d, f._getParts(g));
                            e = e.worldScreenWidth;
                            a.length = 0;
                            b.clear();
                            f = d.length;
                            for (g = 0; g < f; g++) for (var h = d[g], m = h.extent, h = h.frameIds, p = h.length, k = c.length, q = 0; q < k; q++) {
                                var n = c[q];
                                if (n.extent.intersects(m)) for (var A = p, C = 0; C < A; C++) {
                                    var D = (n.frameIds[0] - h[C]) * e;
                                    b.has(D) || (a.push(D), b.add(D))
                                }
                            }
                            a.sort()
                        } else c.intersects(f) && a.push(0);
                        return a
                    };
                    f.prototype._projectGeometry = function (a, b) {
                        var d = this._projected;
                        a = this.isPolygonMarkerSymbol ? a.centroid : a;
                        if (d && d.inGeometry === a && d.outSpatialReference === b) return d.outGeometry;
                        a && a.spatialReference.equals(b) ?
                            this._projected = {
                                inGeometry: a,
                                outGeometry: a,
                                outSpatialReference: b,
                                outExtent: this._getExtent(a)
                            } : k.canProject(a, b) ? this._projected = {
                                inGeometry: a,
                                outGeometry: k.project(a, b),
                                outSpatialReference: b,
                                outExtent: this._getExtent(a)
                            } : this._projected = {
                                inGeometry: a,
                                outGeometry: null,
                                outSpatialReference: b,
                                outExtent: null
                            };
                        return this._projected.outGeometry
                    };
                    f.prototype._getExtent = function (b) {
                        var d = b.extent;
                        if (!d) {
                            var e = d = void 0;
                            "esri.geometry.Point" === b.declaredClass ? (d = b.x, e = b.y) : "esri.geometry.Multipoint" === b.declaredClass &&
                                (d = b.points[0][0], e = b.points[0][1]);
                            d = new a.Extent(d, e, d, e, b.spatialReference)
                        }
                        return d
                    };
                    f.prototype._removeShape = function () {
                        var a = this._shape;
                        a && (a.removeShape(), a.getNode().gfxObject = null, a.destroy());
                        this._shape = this._drawInfo = null
                    };
                    f.prototype._showRedraw = function (a, b) {
                        return !0
                    };
                    return f
                }(h)
            })
        }, "esri/views/2d/engine/graphics/gfxUtils": function () {
            define("require exports ../../../../core/tsSupport/assignHelper ../../../../Color ../../../../core/screenUtils ../../../../geometry/Polygon ../../../../symbols/SimpleMarkerSymbol ../../../../symbols/support/gfxUtils ../../libs/gl-matrix/mat2d ../../libs/gl-matrix/mat2dExtras".split(" "),
                function (n, c, e, a, l, k, h, g, b, d) {
                    function f(a, b) {
                        if (!b) return null;
                        b.toRgba ? (a[0] = b.r, a[1] = b.g, a[2] = b.b, a[3] = b.a) : (a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3]);
                        return a
                    }

                    function m(a, b, d) {
                        null != d && (a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = d);
                        return a
                    }

                    function q(a, b, d) {
                        var e = b[0] / b[1];
                        a[0] = a[1] = 1;
                        isNaN(d) || (1 < e ? (a[0] = d / b[0], a[1] = d / e / b[1]) : (a[1] = d / b[1], a[0] = d * e / b[0]));
                        return a
                    }

                    function p(a, e, c, f, m, k, p) {
                        var w = m.symbol;
                        c = a.toScreenPoint(z, c, p[0]);
                        p = [c.x, c.y];
                        a = c.x;
                        c = c.y;
                        var n = m.heading, v = m.size && m.size[0], G, A;
                        b.identity(B);
                        "number" === typeof v && (A = isFinite(v) && v);
                        A = (v = A && isFinite(A) && !isNaN(A)) ? l.pt2px(A) : NaN;
                        k && d.rotategAt(B, B, k, p);
                        n && d.rotategAt(B, B, n, p);
                        k = l.pt2px(w.xoffset);
                        var n = l.pt2px(w.yoffset), F;
                        if (0 !== k || 0 !== n) F = [k, -n];
                        k = null;
                        0 !== w.angle && (k = b.create(), d.rotategAt(k, k, w.angle, p));
                        var E;
                        if ("simple-marker" === w.type) switch (G = w.style, m = Math.round, A = v ? A : l.pt2px(w.size), v = void 0, G) {
                            case h.STYLE_SQUARE:
                            case h.STYLE_CROSS:
                            case h.STYLE_X:
                            case h.STYLE_DIAMOND:
                                v = isNaN(A) ? 16 : .5 * A;
                                G = r(e, f, y(G, a, c, m(a - v), m(a + v), m(c - v), m(c +
                                    v)));
                                break;
                            case h.STYLE_PATH:
                                G = E = r(e, f, w.path);
                                E = E.getBoundingBox();
                                w = q(b.create(), [E.width, E.height], A);
                                1 === w[0] && 1 === w[3] || d.scaleAt(B, B, w, p);
                                E = [-(E.x + .5 * E.width) + a, -(E.y + .5 * E.height) + c];
                                break;
                            default:
                                v = isNaN(A) ? 16 : .5 * A, G = u(e, f, {cx: a, cy: c, r: v})
                        } else if ("picture-marker" === w.type) {
                            p = G = null;
                            var n = l.pt2px(w.width), D = l.pt2px(w.height);
                            v ? (p = A, G = n / D * p) : (G = n, p = D);
                            F && (null != F[0] && (F[0] = F[0] / n * G), null != F[1] && (F[1] = F[1] / D * p));
                            G = t(e, f, {x: a - .5 * G, y: c - .5 * p, width: G, height: p, src: w.url});
                            (A = G.getNode()) && (null !=
                            m.opacity ? A.setAttribute("opacity", m.opacity.toString()) : A.setAttribute("opacity", "1"))
                        } else if ("text" === w.type) {
                            if (m = w.font && w.font.clone()) m.size = v ? A : l.pt2px(m.size);
                            G = x(e, f, {
                                type: "text",
                                text: w.text,
                                x: a,
                                y: c,
                                align: g.getSVGAlign(w),
                                decoration: w.decoration || m && m.decoration,
                                rotated: w.rotated,
                                kerning: w.kerning
                            });
                            m && G.setFont(m);
                            A = G.getNode();
                            e = g.getSVGBaseline(w);
                            w = g.getSVGBaselineShift(w);
                            A && (A.setAttribute("dominant-baseline", e), w && A.setAttribute("baseline-shift", w))
                        }
                        F && b.translate(B, B, F);
                        k && b.multiply(B,
                            B, k);
                        E && b.translate(B, B, E);
                        G.setTransform(B);
                        return G
                    }

                    function t(a, b, d) {
                        return b ? b.setShape(d) : a.createImage(d)
                    }

                    function u(a, b, d) {
                        return b ? b.setShape(d) : a.createCircle(d)
                    }

                    function r(a, b, d) {
                        d = Array.isArray(d) ? d.join(" ") : d;
                        return b ? b.setShape(d) : a.createPath(d)
                    }

                    function x(a, b, d) {
                        return b ? b.setShape(d) : a.createText(d)
                    }

                    function v(a, b) {
                        b = b && b.shape && b.shape.type;
                        var d = a && a.type;
                        a = a && a.style;
                        d && (a = A[d] || a);
                        C[a] && (a = "path");
                        return !(!b || !a || b === a)
                    }

                    function y(a, b, d, e, c, f, g, m) {
                        switch (a) {
                            case h.STYLE_SQUARE:
                                return ["M",
                                    e + "," + f, c + "," + f, c + "," + g, e + "," + g, "Z"];
                            case h.STYLE_CROSS:
                                return ["M", b + "," + f, b + "," + g, "M", e + "," + d, c + "," + d];
                            case h.STYLE_X:
                                return ["M", e + "," + f, c + "," + g, "M", e + "," + g, c + "," + f];
                            case h.STYLE_DIAMOND:
                                return ["M", b + "," + f, c + "," + d, b + "," + g, e + "," + d, "Z"];
                            case h.STYLE_TARGET:
                                return ["M", e + "," + f, c + "," + f, c + "," + g, e + "," + g, e + "," + f, "M", e - m + "," + d, e + "," + d, "M", b + "," + (f - m), b + "," + f, "M", c + m + "," + d, c + "," + d, "M", b + "," + (g + m), b + "," + g]
                        }
                    }

                    function w(a, b) {
                        var d = b.symbol;
                        if ("picture-marker" !== d.type) {
                            var c = g.getFill(d);
                            if ("simple-marker" ===
                                d.type) {
                                var l = d.style, k = (d = g.getStroke(d)) && d.color,
                                    l = l === h.STYLE_X || l === h.STYLE_CROSS, p = b.opacity;
                                (b = b.color || f([0, 0, 0, 0], l ? k : c)) && null != p && (b = m([0, 0, 0, 0], b, p));
                                b && (l ? b !== k && (d = e({}, d), d.color = b) : b !== c && (c = b));
                                a.setFill(c).setStroke(d)
                            } else "text" === d.type && (p = b.opacity, (b = b.color || f([0, 0, 0, 0], c)) && null != p && (b = m([0, 0, 0, 0], b, p)), b && b !== c && (c = b), a.setFill(c))
                        }
                    }

                    Object.defineProperty(c, "__esModule", {value: !0});
                    c.getScalingVector = q;
                    var z = {x: 0, y: 0}, B = b.create();
                    c.drawPoint = p;
                    c.drawMarkers = function (a, b,
                                              d, e, c, f, g, m) {
                        var h = c.symbol;
                        d = d.points;
                        b = e || b.createGroup();
                        e = [0];
                        b.children[0] && v(h, b.children[0]) && b.clear();
                        for (var l = 0, k = d.length, h = 0; h < k; h++) for (var q = d[h], w = g.length, r = 0; r < w; r++) {
                            e[0] = g[r];
                            var u = p(a, b, {x: q[0], y: q[1]}, b.children[l++], c, f, e);
                            u.getNode().gfxObject = m;
                            b.add(u)
                        }
                        a = b.children.length;
                        if (d.length * g.length < a) for (g = d.length * g.length, h = a - 1; h >= g; h--) b.children[h].removeShape();
                        return b
                    };
                    c.drawShape = function (a, b, d, e, c) {
                        var f = [];
                        "extent" === d.type && (d = k.fromExtent(d));
                        if ("polyline" === d.type ||
                            "polygon" === d.type) {
                            for (var g = c.length, m = 0; m < g; m++) f = f.concat(a.toScreenPath(d, c[m]));
                            e = r(b, e, f)
                        }
                        return e
                    };
                    c.drawRect = function (a, b, d) {
                        return b ? b.setShape(d) : a.createRect(d)
                    };
                    c.drawImage = t;
                    c.drawCircle = u;
                    c.drawPath = r;
                    c.drawText = x;
                    var A = {
                        "picture-marker": "image",
                        "picture-fill": "path",
                        "simple-fill": "path",
                        "simple-line": "path",
                        text: "text"
                    }, C = {square: 1, cross: 1, x: 1, diamond: 1, target: 1};
                    c.isShapeInvalid = v;
                    c.smsToPath = y;
                    c.stylePoint = w;
                    c.styleMarkers = function (a, b) {
                        for (var d = a.children.length, e = 0; e < d; e++) w(a.children[e],
                            b)
                    };
                    c.styleShape = function (b, d) {
                        var c = d.symbol, h = d.size, k = d.color, p = d.opacity, q = d.outlineSize;
                        d = g.getStroke(c);
                        var w = g.getFill(c), r = !1, u;
                        "simple-line" === c.type ? (r = !0, u = "none" !== c.style) : u = c.outline && "none" !== c.outline.style;
                        var t, n, v;
                        if (null != h || null != q) if (h = h && isFinite(h[0]) && h[0], q = r ? null : q, null != h || null != q) v = l.pt2px(q || h);
                        h = "picture-fill" === c.type;
                        !k && null == p || h || (r ? (t = k || d && d.color && f([0, 0, 0, 0], d.color)) && null != p && (t = m(t, t, p)) : w && (n = k || f([0, 0, 0, 0], w)) && null != p && (n = m(n, n, p)));
                        !u || null == v && !t ? b.setStroke(d) :
                            b.setStroke(e({}, d, null != v ? {width: v} : null, t && {color: t}));
                        c = k && new a(k) || c.color;
                        w && "pattern" === w.type && c && !h ? g.getPatternUrlWithColor(w.src, c.toCss(!0)).then(function (a) {
                            w.src = a;
                            b.setFill(w)
                        }) : b.setFill(n || w);
                        b.rawNode.setAttribute("vector-effect", "non-scaling-stroke")
                    }
                })
        }, "esri/symbols/support/gfxUtils": function () {
            define("require exports ../../core/tsSupport/assignHelper dojox/gfx/_base ../../Color ../../request ../../core/LRUMap ../../core/promiseUtils ../../core/screenUtils".split(" "), function (n,
                                                                                                                                                                                                        c, e, a, l, k, h, g, b) {
                function d(a) {
                    if (!a) return null;
                    var e, c = a.constructor, f = b.pt2px(a.width);
                    switch (a.type) {
                        case "simple-fill":
                        case "picture-fill":
                        case "simple-marker":
                            e = d(a.outline);
                            break;
                        case "simple-line":
                            a.style !== c.STYLE_NULL && 0 !== f && (e = {
                                color: a.color,
                                style: t(a.style),
                                width: f,
                                cap: a.cap,
                                join: a.join === c.JOIN_MITER ? b.pt2px(a.miterLimit) : a.join
                            });
                            break;
                        default:
                            e = null
                    }
                    return e
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                var f = n.toUrl("../../symbols/patterns/"), m = {
                        left: "start", center: "middle", right: "end",
                        justify: "start"
                    }, q = {top: "text-before-edge", middle: "central", baseline: "alphabetic", bottom: "text-after-edge"},
                    p = new h(1E3);
                c.getSVGAlign = function (a) {
                    return a = (a = a.horizontalAlignment) && m[a.toLowerCase()] || "middle"
                };
                c.getSVGBaseline = function (a) {
                    return (a = a.verticalAlignment) && q[a.toLowerCase()] || "alphabetic"
                };
                c.getSVGBaselineShift = function (a) {
                    return "bottom" === a.verticalAlignment ? "super" : null
                };
                c.getFill = function (d) {
                    var c = d.style, g = null;
                    if (d) {
                        var m = d.constructor;
                        switch (d.type) {
                            case "simple-marker":
                                c !==
                                m.STYLE_CROSS && c !== m.STYLE_X && (g = d.color);
                                break;
                            case "simple-fill":
                                c === m.STYLE_SOLID ? g = d.color : c !== m.STYLE_NULL && (g = e({}, a.defaultPattern, {
                                    src: f + c + ".png",
                                    width: 8,
                                    height: 8
                                }));
                                break;
                            case "picture-fill":
                                g = e({}, a.defaultPattern, {
                                    src: d.url,
                                    width: b.pt2px(d.width) * d.xscale,
                                    height: b.pt2px(d.height) * d.yscale,
                                    x: b.pt2px(d.xoffset),
                                    y: b.pt2px(d.yoffset)
                                });
                                break;
                            case "text":
                                g = d.color
                        }
                    }
                    return g
                };
                c.getPatternUrlWithColor = function (a, b) {
                    var d = a + "-" + b;
                    return p.has(d) ? g.resolve(p.get(d)) : k(a, {
                        responseType: "image",
                        allowImageDataAccess: !0
                    }).then(function (a) {
                        a =
                            a.data;
                        var e = a.naturalWidth, c = a.naturalHeight, f = document.createElement("canvas");
                        f.width = e;
                        f.height = c;
                        var g = f.getContext("2d");
                        g.fillStyle = b;
                        g.fillRect(0, 0, e, c);
                        g.globalCompositeOperation = "destination-in";
                        g.drawImage(a, 0, 0);
                        a = f.toDataURL();
                        p.set(d, a);
                        return a
                    })
                };
                c.getStroke = d;
                c.create2DColorRamp = function (a) {
                    var b = a.colors, d = a.numClasses, e = a.size;
                    a = a.surface.createGroup();
                    for (var e = (e || 75) / d, c = 0; c < d; c++) for (var f = c * e, g = 0; g < d; g++) {
                        var m = b[c][g];
                        a.createRect({x: g * e, y: f, width: e, height: e}).setFill(m).setStroke(null)
                    }
                    return a
                };
                var t = function () {
                    var a = {};
                    return function (b) {
                        if (a[b]) return a[b];
                        var d = b.replace(/-/g, "");
                        return a[b] = d
                    }
                }();
                c.defaultThematicColor = new l([128, 128, 128])
            })
        }, "dojox/gfx/_base": function () {
            define("dojo/_base/kernel dojo/_base/lang dojo/_base/Color dojo/_base/sniff dojo/_base/window dojo/_base/array dojo/dom dojo/dom-construct dojo/dom-geometry".split(" "), function (n, c, e, a, l, k, h, g, b) {
                var d = c.getObject("dojox.gfx", !0), f = d._base = {};
                d._hasClass = function (a, b) {
                    return (a = a.getAttribute("className")) && 0 <= (" " +
                        a + " ").indexOf(" " + b + " ")
                };
                d._addClass = function (a, b) {
                    var d = a.getAttribute("className") || "";
                    (!d || 0 > (" " + d + " ").indexOf(" " + b + " ")) && a.setAttribute("className", d + (d ? " " : "") + b)
                };
                d._removeClass = function (a, b) {
                    var d = a.getAttribute("className");
                    d && a.setAttribute("className", d.replace(new RegExp("(^|\\s+)" + b + "(\\s+|$)"), "$1$2"))
                };
                f._getFontMeasurements = function () {
                    var b = {
                        "1em": 0,
                        "1ex": 0,
                        "100%": 0,
                        "12pt": 0,
                        "16px": 0,
                        "xx-small": 0,
                        "x-small": 0,
                        small: 0,
                        medium: 0,
                        large: 0,
                        "x-large": 0,
                        "xx-large": 0
                    }, d, e;
                    a("ie") && (e = l.doc.documentElement.style.fontSize ||
                        "", e || (l.doc.documentElement.style.fontSize = "100%"));
                    var c = g.create("div", {
                        style: {
                            position: "absolute",
                            left: "0",
                            top: "-100px",
                            width: "30px",
                            height: "1000em",
                            borderWidth: "0",
                            margin: "0",
                            padding: "0",
                            outline: "none",
                            lineHeight: "1",
                            overflow: "hidden"
                        }
                    }, l.body());
                    for (d in b) c.style.fontSize = d, b[d] = 16 * Math.round(12 * c.offsetHeight / 16) / 12 / 1E3;
                    a("ie") && (l.doc.documentElement.style.fontSize = e);
                    l.body().removeChild(c);
                    return b
                };
                var m = null;
                f._getCachedFontMeasurements = function (a) {
                    if (a || !m) m = f._getFontMeasurements();
                    return m
                };
                var q = null, p = {};
                f._getTextBox = function (a, d, e) {
                    var c, f, m = arguments.length, h;
                    q || (q = g.create("div", {
                        style: {
                            position: "absolute",
                            top: "-10000px",
                            left: "0",
                            visibility: "hidden"
                        }
                    }, l.body()));
                    c = q;
                    c.className = "";
                    f = c.style;
                    f.borderWidth = "0";
                    f.margin = "0";
                    f.padding = "0";
                    f.outline = "0";
                    if (1 < m && d) for (h in d) h in p || (f[h] = d[h]);
                    2 < m && e && (c.className = e);
                    c.innerHTML = a;
                    c.getBoundingClientRect ? (f = c.getBoundingClientRect(), f = {
                        l: f.left,
                        t: f.top,
                        w: f.width || f.right - f.left,
                        h: f.height || f.bottom - f.top
                    }) : f = b.getMarginBox(c);
                    c.innerHTML = "";
                    return f
                };
                f._computeTextLocation = function (a, b, d, e) {
                    var c = {};
                    switch (a.align) {
                        case "end":
                            c.x = a.x - b;
                            break;
                        case "middle":
                            c.x = a.x - b / 2;
                            break;
                        default:
                            c.x = a.x
                    }
                    c.y = a.y - d * (e ? .75 : 1);
                    return c
                };
                f._computeTextBoundingBox = function (a) {
                    if (!d._base._isRendered(a)) return {x: 0, y: 0, width: 0, height: 0};
                    var b;
                    b = a.getShape();
                    var e = a.getFont() || d.defaultFont;
                    a = a.getTextWidth();
                    e = d.normalizedLength(e.size);
                    b = f._computeTextLocation(b, a, e, !0);
                    return {x: b.x, y: b.y, width: a, height: e}
                };
                f._isRendered = function (a) {
                    for (a =
                             a.parent; a && a.getParent;) a = a.parent;
                    return null !== a
                };
                var t = 0;
                f._getUniqueId = function () {
                    var a;
                    do a = n._scopeName + "xUnique" + ++t; while (h.byId(a));
                    return a
                };
                var u = a("pointer-events") ? "touchAction" : null;
                f._fixMsTouchAction = u ? function (a) {
                    a.rawNode.style[u] = "none"
                } : function () {
                };
                c.mixin(d, {
                    defaultPath: {type: "path", path: ""},
                    defaultPolyline: {type: "polyline", points: []},
                    defaultRect: {type: "rect", x: 0, y: 0, width: 100, height: 100, r: 0},
                    defaultEllipse: {type: "ellipse", cx: 0, cy: 0, rx: 200, ry: 100},
                    defaultCircle: {
                        type: "circle",
                        cx: 0, cy: 0, r: 100
                    },
                    defaultLine: {type: "line", x1: 0, y1: 0, x2: 100, y2: 100},
                    defaultImage: {type: "image", x: 0, y: 0, width: 0, height: 0, src: ""},
                    defaultText: {
                        type: "text",
                        x: 0,
                        y: 0,
                        text: "",
                        align: "start",
                        decoration: "none",
                        rotated: !1,
                        kerning: !0
                    },
                    defaultTextPath: {
                        type: "textpath",
                        text: "",
                        align: "start",
                        decoration: "none",
                        rotated: !1,
                        kerning: !0
                    },
                    defaultStroke: {type: "stroke", color: "black", style: "solid", width: 1, cap: "butt", join: 4},
                    defaultLinearGradient: {
                        type: "linear", x1: 0, y1: 0, x2: 100, y2: 100, colors: [{offset: 0, color: "black"}, {
                            offset: 1,
                            color: "white"
                        }]
                    },
                    defaultRadialGradient: {
                        type: "radial",
                        cx: 0,
                        cy: 0,
                        r: 100,
                        colors: [{offset: 0, color: "black"}, {offset: 1, color: "white"}]
                    },
                    defaultPattern: {type: "pattern", x: 0, y: 0, width: 0, height: 0, src: ""},
                    defaultFont: {
                        type: "font",
                        style: "normal",
                        variant: "normal",
                        weight: "normal",
                        size: "10pt",
                        family: "serif"
                    },
                    getDefault: function () {
                        var a = {};
                        return function (b) {
                            var e = a[b];
                            if (e) return new e;
                            e = a[b] = new Function;
                            e.prototype = d["default" + b];
                            return new e
                        }
                    }(),
                    normalizeColor: function (a) {
                        return a instanceof e ? a : new e(a)
                    },
                    normalizeParameters: function (a,
                                                   b) {
                        var d;
                        if (b) {
                            var e = {};
                            for (d in a) d in b && !(d in e) && (a[d] = b[d])
                        }
                        return a
                    },
                    makeParameters: function (a, b) {
                        var d = null;
                        if (!b) return c.delegate(a);
                        var e = {};
                        for (d in a) d in e || (e[d] = c.clone(d in b ? b[d] : a[d]));
                        return e
                    },
                    formatNumber: function (a, b) {
                        var d = a.toString();
                        if (0 <= d.indexOf("e")) d = a.toFixed(4); else {
                            var e = d.indexOf(".");
                            0 <= e && 5 < d.length - e && (d = a.toFixed(4))
                        }
                        return 0 > a ? d : b ? " " + d : d
                    },
                    makeFontString: function (a) {
                        return a.style + " " + a.variant + " " + a.weight + " " + a.size + " " + a.family
                    },
                    splitFontString: function (a) {
                        var b =
                            d.getDefault("Font");
                        a = a.split(/\s+/);
                        if (!(5 > a.length)) {
                            b.style = a[0];
                            b.variant = a[1];
                            b.weight = a[2];
                            var e = a[3].indexOf("/");
                            b.size = 0 > e ? a[3] : a[3].substring(0, e);
                            var c = 4;
                            0 > e && ("/" == a[4] ? c = 6 : "/" == a[4].charAt(0) && (c = 5));
                            c < a.length && (b.family = a.slice(c).join(" "))
                        }
                        return b
                    },
                    cm_in_pt: 72 / 2.54,
                    mm_in_pt: 7.2 / 2.54,
                    px_in_pt: function () {
                        return d._base._getCachedFontMeasurements()["12pt"] / 12
                    },
                    pt2px: function (a) {
                        return a * d.px_in_pt()
                    },
                    px2pt: function (a) {
                        return a / d.px_in_pt()
                    },
                    normalizedLength: function (a) {
                        if (0 === a.length) return 0;
                        if (2 < a.length) {
                            var b = d.px_in_pt(), e = parseFloat(a);
                            switch (a.slice(-2)) {
                                case "px":
                                    return e;
                                case "pt":
                                    return e * b;
                                case "in":
                                    return 72 * e * b;
                                case "pc":
                                    return 12 * e * b;
                                case "mm":
                                    return e * d.mm_in_pt * b;
                                case "cm":
                                    return e * d.cm_in_pt * b
                            }
                        }
                        return parseFloat(a)
                    },
                    pathVmlRegExp: /([A-Za-z]+)|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,
                    pathSvgRegExp: /([A-DF-Za-df-z])|([-+]?\d*[.]?\d+(?:[eE][-+]?\d+)?)/g,
                    equalSources: function (a, b) {
                        return a && b && a === b
                    },
                    switchTo: function (a) {
                        var b = "string" == typeof a ? d[a] : a;
                        b && (k.forEach("Group Rect Ellipse Circle Line Polyline Image Text Path TextPath EsriPath Surface createSurface fixTarget".split(" "),
                            function (a) {
                                d[a] = b[a]
                            }), "string" == typeof a ? d.renderer = a : k.some(["svg", "vml", "canvas", "canvasWithEvents", "silverlight"], function (a) {
                            return d.renderer = d[a] && d[a].Surface === d.Surface ? a : null
                        }))
                    }
                });
                return d
            })
        }, "esri/views/2d/libs/gl-matrix/mat2dExtras": function () {
            define(["require", "exports", "./common", "./mat2d", "./vec2"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var k = function () {
                    var e = a.create(), c = l.create();
                    return function (b, d, f) {
                        a.fromTranslation(e, f);
                        a.multiply(b, e, d);
                        l.negate(c,
                            f);
                        a.translate(b, b, c);
                        return b
                    }
                }();
                c.rotategAt = function () {
                    var c = a.create();
                    return function (g, b, d, f) {
                        a.fromRotation(c, e.toRadian(d));
                        k(c, c, f);
                        a.multiply(g, c, b);
                        return g
                    }
                }();
                c.scaleAt = function () {
                    var e = a.create();
                    return function (c, b, d, f) {
                        a.fromScaling(e, d);
                        k(e, e, f);
                        a.multiply(c, e, b);
                        return c
                    }
                }()
            })
        }, "esri/views/2d/engine/graphics/GFXSurface": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper ../../../../core/tsSupport/assignHelper ../../viewpointUtils ../Container ../cssUtils ./Projector ../../libs/gfx ../../libs/gl-matrix/common ../../libs/gl-matrix/mat2d".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f) {
                    var m = f.identity(f.create());
                    return function (c) {
                        function k() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a._transform = f.create();
                            a._projector = new g;
                            a._prevStateId = null;
                            return a
                        }

                        e(k, c);
                        k.prototype.createElement = function () {
                            var a = document.createElement("div");
                            a.setAttribute("class", "esri-display-object");
                            return a
                        };
                        k.prototype.setElement = function (a) {
                            this.surface && (this.surface.destroy(), this.surface = null);
                            if (this.element = a) this.surface = b.createSurface(this.element, 400,
                                400)
                        };
                        k.prototype.doRender = function (a) {
                            var b = this.element.style;
                            if (this.visible) {
                                b.display = "block";
                                b.opacity = "" + Math.min(this.opacity, this.parent.opacity);
                                var e = this._transform, g = a.state, k = this._prevStateId !== g.id;
                                if (this.renderRequested || k) {
                                    if (a.stationary) k && (this._prevStateId = g.id), l.getMatrix(e, g.center, g.size, g.resolution, d.toRadian(g.rotation), 1), this.surface.setDimensions(g.size[0], g.size[1]), this._projector.update(e, g.resolution), this.children.forEach(function (a) {
                                        a.g && a.g.setTransform(m)
                                    }),
                                        c.prototype.doRender.call(this, a); else {
                                        var p = f.invert(f.create(), e);
                                        f.multiply(p, g.transform, p);
                                        this.children.forEach(function (a) {
                                            a.g && a.g.setTransform(p)
                                        })
                                    }
                                    h.clip(b, g.clipRect);
                                    b.transform = h.cssMatrix3d(f.fromRotation(f.create(), d.toRadian(g.rotation)));
                                    this.surface.rawNode.style.transform = h.cssMatrix(f.fromRotation(f.create(), d.toRadian(-g.rotation)))
                                }
                            } else b.display = "none"
                        };
                        k.prototype.hitTest = function (a, b) {
                            if (!this.attached) return null;
                            var d = this.surface.rawNode, d = d.parentElement || d.parentNode;
                            d.style.zIndex = "9000";
                            a = document.elementFromPoint(a, b);
                            d.style.zIndex = "";
                            return a && a.gfxObject || null
                        };
                        k.prototype.prepareChildrenRenderParameters = function (b) {
                            return a({}, b, {projector: this._projector, surface: this.surface})
                        };
                        k.prototype.beforeRenderChildren = function (a, b) {
                            this.surface.openBatch()
                        };
                        k.prototype.attachChild = function (a, b) {
                            return a.attach(b)
                        };
                        k.prototype.detachChild = function (a, b) {
                            return a.detach()
                        };
                        k.prototype.renderChild = function (a, b) {
                            return a.processRender(b)
                        };
                        k.prototype.afterRenderChildren =
                            function (a, b) {
                                this.surface.closeBatch()
                            };
                        return k
                    }(k)
                })
        }, "esri/views/2d/engine/cssUtils": function () {
            define(["require", "exports", "dojo/has"], function (n, c, e) {
                function a(a) {
                    return "matrix3d(\n                    " + a[0].toFixed(10) + ", " + a[1].toFixed(10) + ", 0, 0,\n                    " + a[2].toFixed(10) + ", " + a[3].toFixed(10) + ", 0, 0,\n                    0, 0, 1, 0,\n                    " + Math.round(a[4]).toFixed(10) + ", " + Math.round(a[5]).toFixed(10) + ", 0, 1\n                  )"
                }

                function l(a) {
                    return "translate(" +
                        Math.round(a[0]) + "px, " + Math.round(a[1]) + "px)"
                }

                function k(a) {
                    return "rotateZ( " + a + " deg)"
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                n = e("ff");
                var h = e("ie"), g = e("webkit");
                e = e("opera");
                var b = g && "-webkit-transform" || n && "-moz-transform" || e && "-o-transform" || h && "-ms-transform" || "transform";
                c.clip = function (a, b) {
                    a.clip = b ? "rect( " + b.top + "px, " + b.right + "px, " + b.bottom + "px, " + b.left + "px)" : ""
                };
                c.setTransform = function (d, e) {
                    var c = null;
                    2 === e.length && (c = l(e));
                    6 === e.length && (c = a(e));
                    d.transform = d[b] = c
                };
                c.setOrigin =
                    function (a, b) {
                        a.transformOrigin = b[0] + "px " + b[1] + "px 0"
                    };
                c.cssMatrix = function (a) {
                    return "matrix(\n                  " + a[0].toFixed(10) + ", " + a[1].toFixed(10) + ",\n                  " + a[2].toFixed(10) + ", " + a[3].toFixed(10) + ",\n                  " + a[4] + ", " + a[5] + "\n                )"
                };
                c.cssMatrix3d = a;
                c.translate = l;
                c.rotate = function (a) {
                    return k(a.toFixed(3))
                };
                c.rotateZ = k
            })
        }, "esri/views/2d/engine/graphics/Projector": function () {
            define(["require", "exports"], function (n, c) {
                function e(a, c, b, d, f) {
                    void 0 === d && (d =
                        0);
                    void 0 === f && (f = a.length);
                    for (var g = a[d], h = a[f - 1], p = 0, n = 0, u, r = d + 1; r < f - 1; r++) {
                        var x = a[r];
                        u = x[0];
                        var x = x[1], v = g[0], y = g[1], w = h[0], z = h[1];
                        v === w ? u = l(u - v) : (w = (z - y) / (w - v), u = l(w * u - x + (y - w * v)) / k(w * w + 1));
                        u > p && (n = r, p = u)
                    }
                    p > c ? (e(a, c, b, d, n + 1), e(a, c, b, n, f)) : (b(g[0], g[1]), b(h[0], h[1]))
                }

                var a = Math.round, l = Math.abs, k = Math.sqrt;
                return function () {
                    function c() {
                        this._transform = null
                    }

                    c.prototype.update = function (a, b) {
                        this._transform = a;
                        this._resolution = b
                    };
                    c.prototype.toScreenPoint = function (a, b, d) {
                        this.transformPoint(b.x +
                            d * this._resolution, b.y, function (b, d) {
                            a.x = b;
                            a.y = d
                        });
                        return a
                    };
                    c.prototype.toScreenPath = function (a, b) {
                        var d = this, c = null != a.paths;
                        a = c ? a.paths : a.rings;
                        var g = "", h = function (a, e) {
                            a += b * d._resolution;
                            d.transformPoint(a, e, function (a, b) {
                                isNaN(a) || isNaN(b) || (g += a, g += ",", g += b, g += " ")
                            })
                        };
                        if (a) for (var k = a.length, l = 0; l < k; l++) g += "M ", e(a[l], this._resolution, h), c || (g += "Z ");
                        return g
                    };
                    c.prototype.transformPoint = function (e, b, d) {
                        var c = this._transform, g = c[1], h = c[3], k = c[5];
                        d(a(c[0] * e + c[2] * b + c[4]), a(g * e + h * b + k))
                    };
                    return c
                }()
            })
        },
        "esri/views/2d/libs/gfx": function () {
            define("require exports ./gfx/Circle ./gfx/Group ./gfx/Image ./gfx/Path ./gfx/Rect ./gfx/Shape ./gfx/Surface ./gfx/svgSurface ./gfx/Text".split(" "), function (n, c, e, a, l, k, h, g, b, d, f) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.Circle = e.default;
                c.Group = a.default;
                c.Image = l.default;
                c.Path = k.default;
                c.Rect = h.default;
                c.Shape = g.default;
                c.Surface = b.default;
                c.createSurface = d.createSurface;
                c.Text = f.default
            })
        }, "esri/views/2d/libs/gfx/Circle": function () {
            define(["require",
                "exports", "../../../../core/tsSupport/extendsHelper", "dojox/gfx/_base", "./Shape"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function h(e) {
                        var b = c.call(this) || this;
                        b.shape = a.getDefault("Circle");
                        b.rawNode = e;
                        return b
                    }

                    e(h, c);
                    h.prototype.getBoundingBox = function () {
                        if (!this.bbox) {
                            var a = this.shape;
                            this.bbox = {x: a.cx - a.r, y: a.cy - a.r, width: 2 * a.r, height: 2 * a.r}
                        }
                        return this.bbox
                    };
                    h.nodeType = "circle";
                    return h
                }(l.default);
                c.default = n
            })
        }, "esri/views/2d/libs/gfx/Shape": function () {
            define("require exports dojo/dom dojo/dom-attr dojo/_base/Color dojox/gfx/_base ./svg ../gl-matrix/mat2d".split(" "),
                function (n, c, e, a, l, k, h, g) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    n = function () {
                        function b() {
                            this.parentMatrix = this.parent = this.bbox = this.strokeStyle = this.fillStyle = this.matrix = this.shape = this.rawNode = null
                        }

                        b.prototype.destroy = function () {
                            if (this.fillStyle && "type" in this.fillStyle) {
                                var a = this.rawNode.getAttribute("fill");
                                (a = h.getRef(a)) && a.parentNode.removeChild(a)
                            }
                            this.rawNode && "__gfxObject__" in this.rawNode && (this.rawNode.__gfxObject__ = null);
                            this.rawNode = null
                        };
                        b.prototype.getNode = function () {
                            return this.rawNode
                        };
                        b.prototype.getShape = function () {
                            return this.shape
                        };
                        b.prototype.getTransform = function () {
                            return this.matrix
                        };
                        b.prototype.getFill = function () {
                            return this.fillStyle
                        };
                        b.prototype.getStroke = function () {
                            return this.strokeStyle
                        };
                        b.prototype.getParent = function () {
                            return this.parent
                        };
                        b.prototype.getBoundingBox = function () {
                            return this.bbox
                        };
                        b.prototype.setTransform = function (a) {
                            this.matrix = this.matrix ? g.copy(this.matrix, a) : g.clone(a);
                            return this._applyTransform()
                        };
                        b.prototype.setFill = function (a) {
                            if (!a) return this.fillStyle =
                                null, this.rawNode.setAttribute("fill", "none"), this.rawNode.setAttribute("fill-opacity", 0), this;
                            var b;
                            if ("object" === typeof a && "type" in a) {
                                switch (a.type) {
                                    case "linear":
                                        b = k.makeParameters(k.defaultLinearGradient, a);
                                        a = this._setFillObject(b, "linearGradient");
                                        a.setAttribute("x1", b.x1.toFixed(8));
                                        a.setAttribute("y1", b.y1.toFixed(8));
                                        a.setAttribute("x2", b.x2.toFixed(8));
                                        a.setAttribute("y2", b.y2.toFixed(8));
                                        break;
                                    case "radial":
                                        b = k.makeParameters(k.defaultRadialGradient, a);
                                        a = this._setFillObject(b, "radialGradient");
                                        a.setAttribute("cx", b.cx.toFixed(8));
                                        a.setAttribute("cy", b.cy.toFixed(8));
                                        a.setAttribute("r", b.r.toFixed(8));
                                        break;
                                    case "pattern":
                                        b = k.makeParameters(k.defaultPattern, a), a = this._setFillObject(b, "pattern"), a.setAttribute("x", b.x.toFixed(8)), a.setAttribute("y", b.y.toFixed(8)), a.setAttribute("width", b.width.toFixed(8)), a.setAttribute("height", b.height.toFixed(8))
                                }
                                this.fillStyle = b;
                                return this
                            }
                            this.fillStyle = b = k.normalizeColor(a);
                            this.rawNode.setAttribute("fill", b.toCss());
                            this.rawNode.setAttribute("fill-opacity",
                                b.a);
                            this.rawNode.setAttribute("fill-rule", "evenodd");
                            return this
                        };
                        b.prototype.setStroke = function (a) {
                            var b = this.rawNode;
                            if (!a) return this.strokeStyle = null, b.setAttribute("stroke", "none"), b.setAttribute("stroke-opacity", 0), this;
                            if ("string" === typeof a || Array.isArray(a) || a instanceof l) a = {color: a};
                            a = this.strokeStyle = k.makeParameters(k.defaultStroke, a);
                            a.color = k.normalizeColor(a.color);
                            if (a) {
                                var d = 0 > a.width ? 0 : a.width;
                                b.setAttribute("stroke", a.color.toCss());
                                b.setAttribute("stroke-opacity", a.color.a);
                                b.setAttribute("stroke-width", d);
                                b.setAttribute("stroke-linecap", a.cap);
                                "number" === typeof a.join ? (b.setAttribute("stroke-linejoin", "miter"), b.setAttribute("stroke-miterlimit", a.join)) : b.setAttribute("stroke-linejoin", a.join);
                                var e = a.style.toLowerCase();
                                e in h.dasharray && (e = h.dasharray[e]);
                                if (Array.isArray(e)) {
                                    for (var e = e.slice(0), c = 0; c < e.length; ++c) e[c] *= d;
                                    if ("butt" !== a.cap) {
                                        for (c = 0; c < e.length; c += 2) e[c] -= d, 1 > e[c] && (e[c] = 1);
                                        for (c = 1; c < e.length; c += 2) e[c] += d
                                    }
                                    e = e.join(",")
                                }
                                b.setAttribute("stroke-dasharray",
                                    e);
                                b.setAttribute("dojoGfxStrokeStyle", a.style)
                            }
                            return this
                        };
                        b.prototype._getParentSurface = function () {
                            for (var a = this.parent; a && !a.defNode; a = a.parent) ;
                            return a
                        };
                        b.prototype._setFillObject = function (a, b) {
                            var d = h.xmlns.svg;
                            this.fillStyle = a;
                            var e = this._getParentSurface().defNode, c = this.rawNode.getAttribute("fill");
                            if (c = h.getRef(c)) if (c.tagName.toLowerCase() !== b.toLowerCase()) {
                                var f = c.id;
                                c.parentNode.removeChild(c);
                                c = h._createElementNS(d, b);
                                c.setAttribute("id", f);
                                e.appendChild(c)
                            } else for (; c.childNodes.length;) c.removeChild(c.lastChild);
                            else c = h._createElementNS(d, b), c.setAttribute("id", k._base._getUniqueId()), e.appendChild(c);
                            if ("pattern" === b) c.setAttribute("patternUnits", "userSpaceOnUse"), d = h._createElementNS(d, "image"), d.setAttribute("x", 0), d.setAttribute("y", 0), d.setAttribute("width", (0 > a.width ? 0 : a.width).toFixed(8)), d.setAttribute("height", (0 > a.height ? 0 : a.height).toFixed(8)), h._setAttributeNS(d, h.xmlns.xlink, "xlink:href", a.src), c.appendChild(d); else for (c.setAttribute("gradientUnits", "userSpaceOnUse"), b = 0; b < a.colors.length; ++b) {
                                var e =
                                        a.colors[b], f = h._createElementNS(d, "stop"),
                                    g = e.color = k.normalizeColor(e.color);
                                f.setAttribute("offset", e.offset.toFixed(8));
                                f.setAttribute("stop-color", g.toCss());
                                f.setAttribute("stop-opacity", g.a);
                                c.appendChild(f)
                            }
                            this.rawNode.setAttribute("fill", "url(#" + c.getAttribute("id") + ")");
                            this.rawNode.removeAttribute("fill-opacity");
                            this.rawNode.setAttribute("fill-rule", "evenodd");
                            return c
                        };
                        b.prototype._applyTransform = function () {
                            var a = this.matrix;
                            a ? this.rawNode.setAttribute("transform", "matrix(" + a[0].toFixed(8) +
                                "," + a[1].toFixed(8) + "," + a[2].toFixed(8) + "," + a[3].toFixed(8) + "," + a[4].toFixed(8) + "," + a[5].toFixed(8) + ")") : this.rawNode.removeAttribute("transform");
                            return this
                        };
                        b.prototype.setRawNode = function (a) {
                            a = this.rawNode = a;
                            "image" !== this.shape.type && a.setAttribute("fill", "none");
                            a.setAttribute("fill-opacity", 0);
                            a.setAttribute("stroke", "none");
                            a.setAttribute("stroke-opacity", 0);
                            a.setAttribute("stroke-width", 1);
                            a.setAttribute("stroke-linecap", "butt");
                            a.setAttribute("stroke-linejoin", "miter");
                            a.setAttribute("stroke-miterlimit",
                                4);
                            a.__gfxObject__ = this
                        };
                        b.prototype.setShape = function (a) {
                            this.shape = k.makeParameters(this.shape, a);
                            for (var b in this.shape) if ("type" !== b) {
                                a = this.shape[b];
                                if ("width" === b || "height" === b) a = 0 > a ? 0 : a;
                                this.rawNode.setAttribute(b, a)
                            }
                            this.bbox = null;
                            return this
                        };
                        b.prototype._moveToFront = function () {
                            this.rawNode.parentNode.appendChild(this.rawNode);
                            return this
                        };
                        b.prototype._moveToBack = function () {
                            this.rawNode.parentNode.insertBefore(this.rawNode, this.rawNode.parentNode.firstChild);
                            return this
                        };
                        b.prototype._removeClipNode =
                            function () {
                                var b, c = a.get(this.rawNode, "clip-path");
                                c && (b = e.byId(c.match(/gfx_clip[\d]+/)[0])) && b.parentNode.removeChild(b);
                                return b
                            };
                        b.prototype.moveToFront = function () {
                            var a = this.getParent();
                            a && (a._moveChildToFront(this), this._moveToFront());
                            return this
                        };
                        b.prototype.moveToBack = function () {
                            var a = this.getParent();
                            a && (a._moveChildToBack(this), this._moveToBack());
                            return this
                        };
                        b.prototype.removeShape = function (a) {
                            this.parent && this.parent.remove(this, a);
                            return this
                        };
                        b.prototype._setParent = function (a, b) {
                            this.parent =
                                a;
                            return this._updateParentMatrix(b)
                        };
                        b.prototype._updateParentMatrix = function (a) {
                            this.parentMatrix = a ? g.clone(a) : null;
                            return this._applyTransform()
                        };
                        b.prototype._getRealMatrix = function () {
                            for (var a = g.clone(this.matrix || g.create()), b = this.parent; b;) b.matrix && a && g.multiply(a, b.matrix, a), b = b.parent;
                            return a
                        };
                        return b
                    }();
                    c.default = n
                })
        }, "esri/views/2d/libs/gfx/svg": function () {
            define(["require", "exports", "dojo/dom"], function (n, c, e) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.xmlns = {
                    xlink: "http://www.w3.org/1999/xlink",
                    svg: "http://www.w3.org/2000/svg"
                };
                c.dasharray = {
                    solid: "none",
                    shortdash: [4, 1],
                    shortdot: [1, 1],
                    shortdashdot: [4, 1, 1, 1],
                    shortdashdotdot: [4, 1, 1, 1, 1, 1],
                    dot: [1, 3],
                    dash: [4, 3],
                    longdash: [8, 3],
                    dashdot: [4, 3, 1, 3],
                    longdashdot: [8, 3, 1, 3],
                    longdashdotdot: [8, 3, 1, 3, 1, 3]
                };
                c._createElementNS = function (a, e) {
                    return document.createElementNS ? document.createElementNS(a, e) : document.createElement(e)
                };
                c._setAttributeNS = function (a, e, c, h) {
                    return a.setAttributeNS ? a.setAttributeNS(e, c, h) : a.setAttribute(c, h)
                };
                c._createTextNode = function (a) {
                    return document.createTextNode(a)
                };
                c._createFragment = function () {
                    return document.createDocumentFragment()
                };
                c.getRef = function (a) {
                    return a && "none" !== a ? a.match(/^url\(#.+\)$/) ? e.byId(a.slice(5, -1)) : a.match(/^#dojoUnique\d+$/) ? e.byId(a.slice(1)) : null : null
                }
            })
        }, "esri/views/2d/libs/gfx/Group": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper dojox/gfx/_base ./Circle ./Container ./Image ./Path ./Rect ./svg ./Text".split(" "), function (n, c, e, a, l, k, h, g, b, d, f) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function m() {
                        return null !==
                            c && c.apply(this, arguments) || this
                    }

                    e(m, c);
                    m.prototype.setRawNode = function (a) {
                        this.rawNode = a;
                        this.rawNode.__gfxObject__ = this
                    };
                    m.prototype.destroy = function () {
                        c.prototype.clear.call(this, !0);
                        c.prototype.destroy.call(this)
                    };
                    m.prototype.createShape = function (b) {
                        switch (b.type) {
                            case a.defaultPath.type:
                                return this.createPath(b);
                            case a.defaultRect.type:
                                return this.createRect(b);
                            case a.defaultCircle.type:
                                return this.createCircle(b);
                            case a.defaultImage.type:
                                return this.createImage(b);
                            case a.defaultText.type:
                                return this.createText(b)
                        }
                        console.error("[gfx] unknown shape",
                            b);
                        return null
                    };
                    m.prototype.createGroup = function () {
                        return this.createObject(m)
                    };
                    m.prototype.createRect = function (a) {
                        return this.createObject(b.default, a)
                    };
                    m.prototype.createCircle = function (a) {
                        return this.createObject(l.default, a)
                    };
                    m.prototype.createImage = function (a) {
                        return this.createObject(h.default, a)
                    };
                    m.prototype.createText = function (a) {
                        return this.createObject(f.default, a)
                    };
                    m.prototype.createPath = function (a) {
                        return this.createObject(g.default, a)
                    };
                    m.prototype.createObject = function (a, b) {
                        if (!this.rawNode) return null;
                        var e = new a;
                        a = d._createElementNS(d.xmlns.svg, a.nodeType);
                        e.setRawNode(a);
                        e.setShape(b);
                        this.add(e);
                        return e
                    };
                    m.nodeType = "g";
                    return m
                }(k.default);
                c.default = n
            })
        }, "esri/views/2d/libs/gfx/Container": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper dojox/gfx/matrix ./Shape ./svg".split(" "), function (n, c, e, a, l, k) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function g() {
                        var a = null !== c && c.apply(this, arguments) || this;
                        a.children = [];
                        a._batch = 0;
                        return a
                    }

                    e(g, c);
                    g.prototype.openBatch =
                        function () {
                            this._batch || (this.fragment = k._createFragment());
                            ++this._batch;
                            return this
                        };
                    g.prototype.closeBatch = function () {
                        this._batch = 0 < this._batch ? --this._batch : 0;
                        this.fragment && !this._batch && (this.rawNode.appendChild(this.fragment), this.fragment = null);
                        return this
                    };
                    g.prototype.add = function (a) {
                        if (this === a.getParent()) return this;
                        this.fragment ? this.fragment.appendChild(a.rawNode) : this.rawNode.appendChild(a.rawNode);
                        var b = a.getParent();
                        b && b.remove(a, !0);
                        this.children.push(a);
                        a._setParent(this, this._getRealMatrix());
                        return this
                    };
                    g.prototype.remove = function (a, d) {
                        void 0 === d && (d = !1);
                        if (this !== a.getParent()) return this;
                        this.rawNode === a.rawNode.parentNode && this.rawNode.removeChild(a.rawNode);
                        this.fragment && this.fragment === a.rawNode.parentNode && this.fragment.removeChild(a.rawNode);
                        for (var b = 0; b < this.children.length; ++b) if (this.children[b] === a) {
                            d || (a.parent = null, a.parentMatrix = null);
                            this.children.splice(b, 1);
                            break
                        }
                        return this
                    };
                    g.prototype.clear = function (a) {
                        void 0 === a && (a = !1);
                        for (var b = this.rawNode; b.lastChild;) b.removeChild(b.lastChild);
                        var e = this.defNode;
                        if (e) {
                            for (; e.lastChild;) e.removeChild(e.lastChild);
                            b.appendChild(e)
                        }
                        for (e = 0; e < this.children.length; ++e) b = this.children[e], b.parent = null, b.parentMatrix = null, a && b.destroy();
                        this.children = [];
                        return this
                    };
                    g.prototype.getBoundingBox = function () {
                        if (!this.children) return null;
                        var b = null;
                        this.children.forEach(function (d) {
                            var e = d.getBoundingBox();
                            e && ((d = d.getTransform()) && (e = a.multiplyRectangle(d, e)), b ? (b.x = Math.min(b.x, e.x), b.y = Math.min(b.y, e.y), b.endX = Math.max(b.endX, e.x + e.width), b.endY =
                                Math.max(b.endY, e.y + e.height)) : b = {
                                x: e.x,
                                y: e.y,
                                endX: e.x + e.width,
                                endY: e.y + e.height,
                                width: 0,
                                height: 0
                            })
                        });
                        b && (b.width = b.endX - b.x, b.height = b.endY - b.y);
                        return b
                    };
                    g.prototype._moveChildToFront = function (a) {
                        for (var b = 0; b < this.children.length; ++b) if (this.children[b] === a) {
                            this.children.splice(b, 1);
                            this.children.push(a);
                            break
                        }
                        return this
                    };
                    g.prototype._moveChildToBack = function (a) {
                        for (var b = 0; b < this.children.length; ++b) if (this.children[b] === a) {
                            this.children.splice(b, 1);
                            this.children.unshift(a);
                            break
                        }
                        return this
                    };
                    return g
                }(l.default);
                c.default = n
            })
        }, "dojox/gfx/matrix": function () {
            define(["./_base", "dojo/_base/lang"], function (n, c) {
                var e = n.matrix = {}, a = {};
                e._degToRad = function (e) {
                    return a[e] || (a[e] = Math.PI * e / 180)
                };
                e._radToDeg = function (a) {
                    return a / Math.PI * 180
                };
                e.Matrix2D = function (a) {
                    if (a) if ("number" == typeof a) this.xx = this.yy = a; else if (a instanceof Array) {
                        if (0 < a.length) {
                            for (var k = e.normalize(a[0]), h = 1; h < a.length; ++h) {
                                var g = k, b = e.normalize(a[h]), k = new e.Matrix2D;
                                k.xx = g.xx * b.xx + g.xy * b.yx;
                                k.xy = g.xx * b.xy + g.xy * b.yy;
                                k.yx =
                                    g.yx * b.xx + g.yy * b.yx;
                                k.yy = g.yx * b.xy + g.yy * b.yy;
                                k.dx = g.xx * b.dx + g.xy * b.dy + g.dx;
                                k.dy = g.yx * b.dx + g.yy * b.dy + g.dy
                            }
                            c.mixin(this, k)
                        }
                    } else c.mixin(this, a)
                };
                c.extend(e.Matrix2D, {xx: 1, xy: 0, yx: 0, yy: 1, dx: 0, dy: 0});
                c.mixin(e, {
                    identity: new e.Matrix2D,
                    flipX: new e.Matrix2D({xx: -1}),
                    flipY: new e.Matrix2D({yy: -1}),
                    flipXY: new e.Matrix2D({xx: -1, yy: -1}),
                    translate: function (a, c) {
                        return 1 < arguments.length ? new e.Matrix2D({dx: a, dy: c}) : new e.Matrix2D({
                            dx: a.x,
                            dy: a.y
                        })
                    },
                    scale: function (a, c) {
                        return 1 < arguments.length ? new e.Matrix2D({
                            xx: a,
                            yy: c
                        }) : "number" == typeof a ? new e.Matrix2D({xx: a, yy: a}) : new e.Matrix2D({xx: a.x, yy: a.y})
                    },
                    rotate: function (a) {
                        var c = Math.cos(a);
                        a = Math.sin(a);
                        return new e.Matrix2D({xx: c, xy: -a, yx: a, yy: c})
                    },
                    rotateg: function (a) {
                        return e.rotate(e._degToRad(a))
                    },
                    skewX: function (a) {
                        return new e.Matrix2D({xy: Math.tan(a)})
                    },
                    skewXg: function (a) {
                        return e.skewX(e._degToRad(a))
                    },
                    skewY: function (a) {
                        return new e.Matrix2D({yx: Math.tan(a)})
                    },
                    skewYg: function (a) {
                        return e.skewY(e._degToRad(a))
                    },
                    reflect: function (a, c) {
                        1 == arguments.length &&
                        (c = a.y, a = a.x);
                        var h = a * a, g = c * c, b = h + g, d = 2 * a * c / b;
                        return new e.Matrix2D({xx: 2 * h / b - 1, xy: d, yx: d, yy: 2 * g / b - 1})
                    },
                    project: function (a, c) {
                        1 == arguments.length && (c = a.y, a = a.x);
                        var h = a * a, g = c * c, b = h + g, d = a * c / b;
                        return new e.Matrix2D({xx: h / b, xy: d, yx: d, yy: g / b})
                    },
                    normalize: function (a) {
                        return a instanceof e.Matrix2D ? a : new e.Matrix2D(a)
                    },
                    isIdentity: function (a) {
                        return 1 == a.xx && 0 == a.xy && 0 == a.yx && 1 == a.yy && 0 == a.dx && 0 == a.dy
                    },
                    clone: function (a) {
                        var c = new e.Matrix2D, h;
                        for (h in a) "number" == typeof a[h] && "number" == typeof c[h] && c[h] !=
                        a[h] && (c[h] = a[h]);
                        return c
                    },
                    invert: function (a) {
                        a = e.normalize(a);
                        var c = a.xx * a.yy - a.xy * a.yx;
                        return a = new e.Matrix2D({
                            xx: a.yy / c,
                            xy: -a.xy / c,
                            yx: -a.yx / c,
                            yy: a.xx / c,
                            dx: (a.xy * a.dy - a.yy * a.dx) / c,
                            dy: (a.yx * a.dx - a.xx * a.dy) / c
                        })
                    },
                    _multiplyPoint: function (a, e, c) {
                        return {x: a.xx * e + a.xy * c + a.dx, y: a.yx * e + a.yy * c + a.dy}
                    },
                    multiplyPoint: function (a, c, h) {
                        a = e.normalize(a);
                        return "number" == typeof c && "number" == typeof h ? e._multiplyPoint(a, c, h) : e._multiplyPoint(a, c.x, c.y)
                    },
                    multiplyRectangle: function (a, c) {
                        var h = e.normalize(a);
                        c = c || {
                            x: 0,
                            y: 0, width: 0, height: 0
                        };
                        if (e.isIdentity(h)) return {x: c.x, y: c.y, width: c.width, height: c.height};
                        a = e.multiplyPoint(h, c.x, c.y);
                        var g = e.multiplyPoint(h, c.x, c.y + c.height), b = e.multiplyPoint(h, c.x + c.width, c.y);
                        c = e.multiplyPoint(h, c.x + c.width, c.y + c.height);
                        var h = Math.min(a.x, g.x, b.x, c.x), d = Math.min(a.y, g.y, b.y, c.y);
                        return {
                            x: h,
                            y: d,
                            width: Math.max(a.x, g.x, b.x, c.x) - h,
                            height: Math.max(a.y, g.y, b.y, c.y) - d
                        }
                    },
                    multiply: function (a) {
                        for (var c = e.normalize(a), h = 1; h < arguments.length; ++h) {
                            var g = c, b = e.normalize(arguments[h]),
                                c = new e.Matrix2D;
                            c.xx = g.xx * b.xx + g.xy * b.yx;
                            c.xy = g.xx * b.xy + g.xy * b.yy;
                            c.yx = g.yx * b.xx + g.yy * b.yx;
                            c.yy = g.yx * b.xy + g.yy * b.yy;
                            c.dx = g.xx * b.dx + g.xy * b.dy + g.dx;
                            c.dy = g.yx * b.dx + g.yy * b.dy + g.dy
                        }
                        return c
                    },
                    _sandwich: function (a, c, h) {
                        return e.multiply(e.translate(c, h), a, e.translate(-c, -h))
                    },
                    scaleAt: function (a, c, h, g) {
                        switch (arguments.length) {
                            case 4:
                                return e._sandwich(e.scale(a, c), h, g);
                            case 3:
                                return "number" == typeof h ? e._sandwich(e.scale(a), c, h) : e._sandwich(e.scale(a, c), h.x, h.y)
                        }
                        return e._sandwich(e.scale(a), c.x, c.y)
                    },
                    rotateAt: function (a,
                                        c, h) {
                        return 2 < arguments.length ? e._sandwich(e.rotate(a), c, h) : e._sandwich(e.rotate(a), c.x, c.y)
                    },
                    rotategAt: function (a, c, h) {
                        return 2 < arguments.length ? e._sandwich(e.rotateg(a), c, h) : e._sandwich(e.rotateg(a), c.x, c.y)
                    },
                    skewXAt: function (a, c, h) {
                        return 2 < arguments.length ? e._sandwich(e.skewX(a), c, h) : e._sandwich(e.skewX(a), c.x, c.y)
                    },
                    skewXgAt: function (a, c, h) {
                        return 2 < arguments.length ? e._sandwich(e.skewXg(a), c, h) : e._sandwich(e.skewXg(a), c.x, c.y)
                    },
                    skewYAt: function (a, c, h) {
                        return 2 < arguments.length ? e._sandwich(e.skewY(a),
                            c, h) : e._sandwich(e.skewY(a), c.x, c.y)
                    },
                    skewYgAt: function (a, c, h) {
                        return 2 < arguments.length ? e._sandwich(e.skewYg(a), c, h) : e._sandwich(e.skewYg(a), c.x, c.y)
                    }
                });
                n.Matrix2D = e.Matrix2D;
                return e
            })
        }, "esri/views/2d/libs/gfx/Image": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper dojox/gfx/_base ./Shape ./svg".split(" "), function (n, c, e, a, l, k) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function g(b) {
                        var d = c.call(this) || this;
                        d.shape = a.getDefault("Image");
                        d.rawNode =
                            b;
                        return d
                    }

                    e(g, c);
                    g.prototype.setShape = function (b) {
                        this.shape = a.makeParameters(this.shape, b);
                        this.bbox = null;
                        b = this.rawNode;
                        for (var d in this.shape) if ("type" !== d && "src" !== d) {
                            var c = this.shape[d];
                            if ("width" === d || "height" === d) c = 0 > c ? 0 : c;
                            b.setAttribute(d, c)
                        }
                        b.setAttribute("preserveAspectRatio", "none");
                        k._setAttributeNS(b, k.xmlns.xlink, "xlink:href", this.shape.src);
                        b.__gfxObject__ = this;
                        return this
                    };
                    g.prototype.getBoundingBox = function () {
                        return this.shape
                    };
                    g.prototype.setStroke = function () {
                        return this
                    };
                    g.prototype.setFill =
                        function () {
                            return this
                        };
                    g.nodeType = "image";
                    return g
                }(l.default);
                c.default = n
            })
        }, "esri/views/2d/libs/gfx/Path": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper dojox/gfx/_base dojox/gfx/matrix ../../../../core/lang ./Shape".split(" "), function (n, c, e, a, l, k, h) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function b(b) {
                        var d = c.call(this) || this;
                        d.segments = [];
                        d.tbbox = null;
                        d.absolute = !0;
                        d.last = {};
                        d.segmented = !1;
                        d._validSegments = {
                            m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2,
                            a: 7, z: 0
                        };
                        d._2PI = 2 * Math.PI;
                        d.rawNode = b;
                        d.shape = k.clone(a.defaultPath);
                        return d
                    }

                    e(b, c);
                    b.prototype.setAbsoluteMode = function (a) {
                        this._confirmSegmented();
                        this.absolute = "string" === typeof a ? "absolute" === a : a;
                        return this
                    };
                    b.prototype.getAbsoluteMode = function () {
                        this._confirmSegmented();
                        return this.absolute
                    };
                    b.prototype.getBoundingBox = function () {
                        this._confirmSegmented();
                        return this.bbox && "l" in this.bbox ? {
                            x: this.bbox.l,
                            y: this.bbox.t,
                            width: this.bbox.r - this.bbox.l,
                            height: this.bbox.b - this.bbox.t
                        } : null
                    };
                    b.prototype._getRealBBox =
                        function () {
                            this._confirmSegmented();
                            if (this.tbbox) return this.tbbox;
                            var a = this.bbox, b = this._getRealMatrix();
                            this.bbox = null;
                            for (var c = this.segments.length, e = 0; e < c; ++e) this._updateWithSegment(this.segments[e], b);
                            b = this.bbox;
                            this.bbox = a;
                            return this.tbbox = b ? [{x: b.l, y: b.t}, {x: b.r, y: b.t}, {x: b.r, y: b.b}, {
                                x: b.l,
                                y: b.b
                            }] : null
                        };
                    b.prototype.getLastPosition = function () {
                        this._confirmSegmented();
                        return "x" in this.last ? this.last : null
                    };
                    b.prototype._applyTransform = function () {
                        this.tbbox = null;
                        c.prototype._applyTransform.call(this);
                        return this
                    };
                    b.prototype._updateBBox = function (a, b, c) {
                        c && (b = l.multiplyPoint(c, a, b), a = b.x, b = b.y);
                        this.bbox && "l" in this.bbox ? (this.bbox.l > a && (this.bbox.l = a), this.bbox.r < a && (this.bbox.r = a), this.bbox.t > b && (this.bbox.t = b), this.bbox.b < b && (this.bbox.b = b)) : this.bbox = {
                            l: a,
                            b: b,
                            r: a,
                            t: b
                        }
                    };
                    b.prototype._updateWithSegment = function (b, c) {
                        var d = b.args, e = d.length, f;
                        switch (b.action) {
                            case "M":
                            case "L":
                            case "C":
                            case "S":
                            case "Q":
                            case "T":
                                for (f = 0; f < e; f += 2) this._updateBBox(d[f], d[f + 1], c);
                                this.last.x = d[e - 2];
                                this.last.y = d[e -
                                1];
                                this.absolute = !0;
                                break;
                            case "H":
                                for (f = 0; f < e; ++f) this._updateBBox(d[f], this.last.y, c);
                                this.last.x = d[e - 1];
                                this.absolute = !0;
                                break;
                            case "V":
                                for (f = 0; f < e; ++f) this._updateBBox(this.last.x, d[f], c);
                                this.last.y = d[e - 1];
                                this.absolute = !0;
                                break;
                            case "m":
                                f = 0;
                                "x" in this.last || (this._updateBBox(this.last.x = d[0], this.last.y = d[1], c), f = 2);
                                for (; f < e; f += 2) this._updateBBox(this.last.x += d[f], this.last.y += d[f + 1], c);
                                this.absolute = !1;
                                break;
                            case "l":
                            case "t":
                                for (f = 0; f < e; f += 2) this._updateBBox(this.last.x += d[f], this.last.y +=
                                    d[f + 1], c);
                                this.absolute = !1;
                                break;
                            case "h":
                                for (f = 0; f < e; ++f) this._updateBBox(this.last.x += d[f], this.last.y, c);
                                this.absolute = !1;
                                break;
                            case "v":
                                for (f = 0; f < e; ++f) this._updateBBox(this.last.x, this.last.y += d[f], c);
                                this.absolute = !1;
                                break;
                            case "c":
                                for (f = 0; f < e; f += 6) this._updateBBox(this.last.x + d[f], this.last.y + d[f + 1], c), this._updateBBox(this.last.x + d[f + 2], this.last.y + d[f + 3], c), this._updateBBox(this.last.x += d[f + 4], this.last.y += d[f + 5], c);
                                this.absolute = !1;
                                break;
                            case "s":
                            case "q":
                                for (f = 0; f < e; f += 4) this._updateBBox(this.last.x +
                                    d[f], this.last.y + d[f + 1], c), this._updateBBox(this.last.x += d[f + 2], this.last.y += d[f + 3], c);
                                this.absolute = !1;
                                break;
                            case "A":
                                for (f = 0; f < e; f += 7) this._updateBBox(d[f + 5], d[f + 6], c);
                                this.last.x = d[e - 2];
                                this.last.y = d[e - 1];
                                this.absolute = !0;
                                break;
                            case "a":
                                for (f = 0; f < e; f += 7) this._updateBBox(this.last.x += d[f + 5], this.last.y += d[f + 6], c);
                                this.absolute = !1
                        }
                        b = [b.action];
                        for (f = 0; f < e; ++f) b.push(a.formatNumber(d[f], !0));
                        if ("string" === typeof this.shape.path) this.shape.path += b.join(""); else for (f = 0, e = b.length; f < e; ++f) this.shape.path.push(b[f]);
                        "string" === typeof this.shape.path && this.rawNode.setAttribute("d", this.shape.path)
                    };
                    b.prototype._pushSegment = function (a, b) {
                        this.tbbox = null;
                        var d = this._validSegments[a.toLowerCase()];
                        "number" === typeof d && (d ? b.length >= d && (a = {
                            action: a,
                            args: b.slice(0, b.length - b.length % d)
                        }, this.segments.push(a), this._updateWithSegment(a)) : (a = {
                            action: a,
                            args: []
                        }, this.segments.push(a), this._updateWithSegment(a)))
                    };
                    b.prototype._collectArgs = function (a, b) {
                        for (var d = 0; d < b.length; ++d) {
                            var c = b[d];
                            "boolean" === typeof c ? a.push(c ? 1 :
                                0) : "number" === typeof c ? a.push(c) : c instanceof Array ? this._collectArgs(a, c) : "x" in c && "y" in c && a.push(c.x, c.y)
                        }
                    };
                    b.prototype._confirmSegmented = function () {
                        if (!this.segmented) {
                            var a = this.shape.path;
                            this.shape.path = [];
                            this._setPath(a);
                            this.shape.path = this.shape.path.join("");
                            this.segmented = !0
                        }
                    };
                    b.prototype._setPath = function (b) {
                        b = Array.isArray(b) ? b : b.match(a.pathSvgRegExp);
                        this.segments = [];
                        this.absolute = !0;
                        this.bbox = {};
                        this.last = {};
                        if (b) {
                            for (var d = "", c = [], e = b.length, g = 0; g < e; ++g) {
                                var h = b[g], k = parseFloat(h);
                                isNaN(k) ? (d && this._pushSegment(d, c), c = [], d = h) : c.push(k)
                            }
                            this._pushSegment(d, c)
                        }
                    };
                    b.prototype.setShape = function (a) {
                        c.prototype.setShape.call(this, "string" === typeof a ? {path: a} : a);
                        this.segmented = !1;
                        this.segments = [];
                        this.shape.path ? this.rawNode.setAttribute("d", this.shape.path) : this.rawNode.removeAttribute("d");
                        return this
                    };
                    b.nodeType = "path";
                    return b
                }(h.default);
                c.default = n
            })
        }, "esri/views/2d/libs/gfx/Rect": function () {
            define(["require", "exports", "../../../../core/tsSupport/extendsHelper", "dojox/gfx/_base",
                "./Shape"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function h(e) {
                        var b = c.call(this) || this;
                        b.shape = a.getDefault("Rect");
                        b.rawNode = e;
                        return b
                    }

                    e(h, c);
                    h.prototype.getBoundingBox = function () {
                        return this.shape
                    };
                    h.prototype.setShape = function (c) {
                        this.shape = a.makeParameters(this.shape, c);
                        this.bbox = null;
                        for (var b in this.shape) if ("type" !== b && "r" !== b) {
                            c = this.shape[b];
                            if ("width" === b || "height" === b) c = 0 > c ? 0 : c;
                            this.rawNode.setAttribute(b, c)
                        }
                        null != this.shape.r && (this.rawNode.setAttribute("ry",
                            this.shape.r), this.rawNode.setAttribute("rx", this.shape.r));
                        return this
                    };
                    h.nodeType = "rect";
                    return h
                }(l.default);
                c.default = n
            })
        }, "esri/views/2d/libs/gfx/Text": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper dojo/has dojox/gfx/_base ./Shape ./svg".split(" "), function (n, c, e, a, l, k, h) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var g = a("chrome") ? "auto" : "optimizeLegibility";
                n = function (a) {
                    function b(b) {
                        var d = a.call(this) || this;
                        d.fontStyle = null;
                        d.shape = l.getDefault("Text");
                        d.rawNode = b;
                        return d
                    }

                    e(b, a);
                    b.prototype.getFont = function () {
                        return this.fontStyle
                    };
                    b.prototype.setFont = function (a) {
                        this.fontStyle = "string" === typeof a ? l.splitFontString(a) : l.makeParameters(l.defaultFont, a);
                        this._setFont();
                        return this
                    };
                    b.prototype._setFont = function () {
                        var a = this.fontStyle;
                        this.rawNode.setAttribute("font-style", a.style);
                        this.rawNode.setAttribute("font-weight", a.weight);
                        this.rawNode.setAttribute("font-size", a.size);
                        this.rawNode.setAttribute("font-family", a.family)
                    };
                    b.prototype.setShape =
                        function (a) {
                            this.shape = l.makeParameters(this.shape, a);
                            this.bbox = null;
                            a = this.rawNode;
                            var b = this.shape;
                            a.setAttribute("x", b.x);
                            a.setAttribute("y", b.y);
                            a.setAttribute("text-anchor", b.align);
                            a.setAttribute("text-decoration", b.decoration);
                            a.setAttribute("rotate", b.rotated ? 90 : 0);
                            a.setAttribute("kerning", b.kerning ? "auto" : 0);
                            a.setAttribute("text-rendering", g);
                            a.firstChild ? a.firstChild.nodeValue = b.text : a.appendChild(h._createTextNode(b.text));
                            return this
                        };
                    b.prototype.getTextWidth = function () {
                        var a = this.rawNode,
                            b = a.parentNode, a = a.cloneNode(!0);
                        a.style.visibility = "hidden";
                        var d = 0, c = a.firstChild.nodeValue;
                        b.appendChild(a);
                        if ("" !== c) for (; !d;) d = a.getBBox ? parseInt(a.getBBox().width, 10) : 68;
                        b.removeChild(a);
                        return d
                    };
                    b.prototype.getBoundingBox = function () {
                        var a = null;
                        if (this.getShape().text) try {
                            a = this.rawNode.getBBox()
                        } catch (m) {
                            a = {x: 0, y: 0, width: 0, height: 0}
                        }
                        return a
                    };
                    b.nodeType = "text";
                    return b
                }(k.default);
                c.default = n
            })
        }, "esri/views/2d/libs/gfx/Surface": function () {
            define("require exports ../../../../core/tsSupport/extendsHelper dojo/dom-construct dojo/has dojox/gfx/_base ./Circle ./Container ./Group ./Image ./Path ./Rect ./svg ./Text".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    var t = navigator.userAgent, u = 534 < function () {
                        var a = /WebKit\/(\d*)/.exec(t);
                        return a ? parseInt(a[1], 10) : 0
                    }();
                    n = function (c) {
                        function g() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a.rawNode = null;
                            a._parent = null;
                            a._nodes = [];
                            a._events = [];
                            return a
                        }

                        e(g, c);
                        g.prototype.destroy = function () {
                            this._nodes.forEach(a.destroy);
                            this._nodes = [];
                            this._events.forEach(function (a) {
                                a && a.remove()
                            });
                            this._events = [];
                            this.rawNode = null;
                            if (l("ie")) for (; this._parent.lastChild;) a.destroy(this._parent.lastChild);
                            else this._parent.innerHTML = "";
                            this.defNode = this._parent = null
                        };
                        g.prototype.setDimensions = function (a, b) {
                            if (!this.rawNode) return this;
                            a = 0 > a ? 0 : a;
                            b = 0 > b ? 0 : b;
                            this.rawNode.setAttribute("width", a);
                            this.rawNode.setAttribute("height", b);
                            u && (this.rawNode.style.width = a, this.rawNode.style.height = b);
                            return this
                        };
                        g.prototype.getDimensions = function () {
                            return this.rawNode ? {
                                width: k.normalizedLength(this.rawNode.getAttribute("width")),
                                height: k.normalizedLength(this.rawNode.getAttribute("height"))
                            } : null
                        };
                        g.prototype.getEventSource =
                            function () {
                                return this.rawNode
                            };
                        g.prototype._getRealMatrix = function () {
                            return null
                        };
                        g.prototype.createShape = function (a) {
                            switch (a.type) {
                                case k.defaultPath.type:
                                    return this.createPath(a);
                                case k.defaultRect.type:
                                    return this.createRect(a);
                                case k.defaultCircle.type:
                                    return this.createCircle(a);
                                case k.defaultImage.type:
                                    return this.createImage(a);
                                case k.defaultText.type:
                                    return this.createText(a)
                            }
                            console.error("[gfx] unknown shape", a);
                            return null
                        };
                        g.prototype.createGroup = function () {
                            return this.createObject(b.default)
                        };
                        g.prototype.createRect = function (a) {
                            return this.createObject(m.default, a)
                        };
                        g.prototype.createCircle = function (a) {
                            return this.createObject(h.default, a)
                        };
                        g.prototype.createImage = function (a) {
                            return this.createObject(d.default, a)
                        };
                        g.prototype.createText = function (a) {
                            return this.createObject(p.default, a)
                        };
                        g.prototype.createPath = function (a) {
                            return this.createObject(f.default, a)
                        };
                        g.prototype.createObject = function (a, b) {
                            if (!this.rawNode) return null;
                            var d = new a;
                            a = q._createElementNS(q.xmlns.svg, a.nodeType);
                            d.setRawNode(a);
                            d.setShape(b);
                            this.add(d);
                            return d
                        };
                        return g
                    }(g.default);
                    c.default = n
                })
        }, "esri/views/2d/libs/gfx/svgSurface": function () {
            define(["require", "exports", "dojo/dom", "./Surface", "./svg"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.createSurface = function (c, h, g) {
                    var b = new a.default;
                    b.rawNode = l._createElementNS(l.xmlns.svg, "svg");
                    b.rawNode.setAttribute("overflow", "hidden");
                    h && b.rawNode.setAttribute("width", 0 > h ? 0 : h);
                    g && b.rawNode.setAttribute("height", 0 > g ? 0 : g);
                    h = l._createElementNS(l.xmlns.svg,
                        "defs");
                    b.rawNode.appendChild(h);
                    b.defNode = h;
                    b._parent = e.byId(c);
                    b._parent.appendChild(b.rawNode);
                    return b
                }
            })
        }, "esri/views/layers/GraphicsView": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/accessorSupport/decorators".split(" "), function (n, c, e, a, l, k) {
                return function (c) {
                    function g() {
                        var a = null !== c && c.apply(this, arguments) || this;
                        a.graphics = null;
                        a.renderer = null;
                        a.view = null;
                        return a
                    }

                    e(g, c);
                    a([k.property()],
                        g.prototype, "graphics", void 0);
                    a([k.property()], g.prototype, "renderer", void 0);
                    a([k.property()], g.prototype, "view", void 0);
                    return g = a([k.subclass("esri.views.layers.GraphicsView")], g)
                }(k.declared(l))
            })
        }, "esri/views/2d/navigation/MapViewNavigation": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../Viewpoint ../../../core/Accessor ../../../core/accessorSupport/decorators ../../../geometry/Point ../viewpointUtils ./ZoomBox ./actions/Pan ./actions/Pinch ./actions/Rotate".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q) {
                    var p = new l({targetGeometry: new g}), t = [0, 0];
                    return function (c) {
                        function g(a) {
                            a = c.call(this) || this;
                            a._endTimer = null;
                            a.animationManager = null;
                            return a
                        }

                        e(g, c);
                        g.prototype.initialize = function () {
                            this.pan = new f({navigation: this});
                            this.rotate = new q({navigation: this});
                            this.pinch = new m({navigation: this});
                            this.zoomBox = new d({view: this.view, navigation: this})
                        };
                        g.prototype.destroy = function () {
                            this.zoomBox.destroy();
                            this.animationManager = this.zoomBox = null
                        };
                        g.prototype.begin = function () {
                            this._set("interacting",
                                !0)
                        };
                        g.prototype.end = function () {
                            var a = this;
                            this._endTimer && (clearTimeout(this._endTimer), this._endTimer = 0);
                            this._endTimer = setTimeout(function () {
                                a._set("interacting", !1)
                            }, 0)
                        };
                        g.prototype.zoom = function (a, b) {
                            void 0 === b && (b = this._getDefaultAnchor());
                            this.stop();
                            this.begin();
                            if (this.view.constraints.snapToZoom && this.view.constraints.effectiveLODs) return 1 > a ? this.zoomIn(b) : this.zoomOut(b);
                            this.setViewpoint(b, a, 0)
                        };
                        g.prototype.zoomIn = function (a) {
                            void 0 === a && (a = this._getDefaultAnchor());
                            var b = this.view, d =
                                b.scale, c = b.constraints.snapToNextScale(d);
                            return b.goTo(this._scaleAndRotateViewpoint(p, a, c / d, 0))
                        };
                        g.prototype.zoomOut = function (a) {
                            void 0 === a && (a = this._getDefaultAnchor());
                            var b = this.view, d = b.scale, c = b.constraints.snapToPreviousScale(d);
                            return b.goTo(this._scaleAndRotateViewpoint(p, a, c / d, 0))
                        };
                        g.prototype.setViewpoint = function (a, b, d) {
                            this.begin();
                            this.view.state.viewpoint = this._scaleAndRotateViewpoint(p, a, b, d);
                            this.end()
                        };
                        g.prototype.animateViewpoint = function (a, b, d) {
                            return this.view.goTo(this._scaleAndRotateViewpoint(p,
                                a, b, d))
                        };
                        g.prototype.continousRotateClockwise = function () {
                            var a = this.get("view.viewpoint");
                            this.animationManager.animateContinous(a, function (a) {
                                b.rotateBy(a, a, -1)
                            })
                        };
                        g.prototype.continousRotateCounterclockwise = function () {
                            var a = this.get("view.viewpoint");
                            this.animationManager.animateContinous(a, function (a) {
                                b.rotateBy(a, a, 1)
                            })
                        };
                        g.prototype.resetRotation = function () {
                            this.view.rotation = 0
                        };
                        g.prototype.continousPanLeft = function () {
                            var a = this.get("view.viewpoint");
                            this.animationManager.animateContinous(a, function (a) {
                                b.translateBy(a,
                                    a, [-10, 0])
                            })
                        };
                        g.prototype.continousPanRight = function () {
                            var a = this.get("view.viewpoint");
                            this.animationManager.animateContinous(a, function (a) {
                                b.translateBy(a, a, [10, 0])
                            })
                        };
                        g.prototype.continousPanUp = function () {
                            var a = this.get("view.viewpoint");
                            this.animationManager.animateContinous(a, function (a) {
                                b.translateBy(a, a, [0, 10])
                            })
                        };
                        g.prototype.continousPanDown = function () {
                            var a = this.get("view.viewpoint");
                            this.animationManager.animateContinous(a, function (a) {
                                b.translateBy(a, a, [0, -10])
                            })
                        };
                        g.prototype.stop = function () {
                            this.pan.stopMomentumNavigation();
                            this.animationManager.stop();
                            this.end();
                            this._endTimer && (clearTimeout(this._endTimer), this._endTimer = 0)
                        };
                        g.prototype._getDefaultAnchor = function () {
                            var a = this.view.size;
                            t[0] = .5 * a[0];
                            t[1] = .5 * a[1];
                            return t
                        };
                        g.prototype._scaleAndRotateViewpoint = function (a, d, c, e) {
                            var f = this.view, g = f.size, h = f.padding, m = f.constraints, k = f.viewpoint,
                                l = f.scale * c, f = m.canZoomInTo(l), m = m.canZoomOutTo(l);
                            return 1 > c && !f || 1 < c && !m ? k : b.padAndScaleAndRotateBy(a, k, c, e, d, g, h)
                        };
                        a([h.property()], g.prototype, "animationManager", void 0);
                        a([h.property({
                            type: Boolean,
                            readOnly: !0
                        })], g.prototype, "interacting", void 0);
                        a([h.property()], g.prototype, "pan", void 0);
                        a([h.property()], g.prototype, "pinch", void 0);
                        a([h.property()], g.prototype, "rotate", void 0);
                        a([h.property()], g.prototype, "view", void 0);
                        a([h.property()], g.prototype, "zoomBox", void 0);
                        return g = a([h.subclass("esri.views.2d.navigation.MapViewNavigation")], g)
                    }(h.declared(k))
                })
        }, "esri/views/2d/navigation/ZoomBox": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../core/Accessor ../../../core/accessorSupport/decorators".split(" "),
                function (n, c, e, a, l, k) {
                    return function (c) {
                        function g(a) {
                            a = c.call(this, a) || this;
                            a._container = null;
                            a._overlay = null;
                            a._backgroundShape = null;
                            a._boxShape = null;
                            a._box = {x: 0, y: 0, width: 0, height: 0};
                            a._redraw = a._redraw.bind(a);
                            return a
                        }

                        e(g, c);
                        g.prototype.destroy = function () {
                            this.view = null
                        };
                        Object.defineProperty(g.prototype, "view", {
                            set: function (a) {
                                var b = this;
                                this._handles && this._handles.forEach(function (a) {
                                    a.remove()
                                });
                                this._handles = null;
                                this._destroyOverlay();
                                this._set("view", a);
                                a && (a.on("drag", ["Shift"], function (a) {
                                    return b._handleDrag(a,
                                        1)
                                }), a.on("drag", ["Shift", "Ctrl"], function (a) {
                                    return b._handleDrag(a, -1)
                                }))
                            }, enumerable: !0, configurable: !0
                        });
                        g.prototype._start = function (a, d, c, e) {
                            this._createContainer();
                            this._createOverlay();
                            this.navigation.begin()
                        };
                        g.prototype._update = function (a, d, c, e) {
                            this._box.x = a;
                            this._box.y = d;
                            this._box.width = c;
                            this._box.height = e;
                            this._rafId || (this._rafId = requestAnimationFrame(this._redraw))
                        };
                        g.prototype._end = function (a, d, c, e, g) {
                            var b = this.view;
                            a = b.toMap(a + .5 * c, d + .5 * e);
                            c = Math.max(c / b.width, e / b.height);
                            -1 === g &&
                            (c = 1 / c);
                            this._destroyOverlay();
                            this.navigation.end();
                            b.goTo({center: a, scale: b.scale * c})
                        };
                        g.prototype._updateBox = function (a, d, c, e) {
                            var b = this._boxShape;
                            b.setAttributeNS(null, "x", "" + a);
                            b.setAttributeNS(null, "y", "" + d);
                            b.setAttributeNS(null, "width", "" + c);
                            b.setAttributeNS(null, "height", "" + e);
                            b.setAttributeNS(null, "class", "esri-zoom-box__outline")
                        };
                        g.prototype._updateBackground = function (a, d, c, e) {
                            this._backgroundShape.setAttributeNS(null, "d", this._toSVGPath(a, d, c, e, this.view.width, this.view.height))
                        };
                        g.prototype._createContainer =
                            function () {
                                var a = document.createElement("div");
                                a.className = "esri-zoom-box__container";
                                this.view.root.appendChild(a);
                                this._container = a
                            };
                        g.prototype._createOverlay = function () {
                            var a = this.view.width, d = this.view.height,
                                c = document.createElementNS("http://www.w3.org/2000/svg", "path");
                            c.setAttributeNS(null, "d", "M 0 0 L " + a + " 0 L " + a + " " + d + " L 0 " + d + " Z");
                            c.setAttributeNS(null, "class", "esri-zoom-box__overlay-background");
                            a = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                            d = document.createElementNS("http://www.w3.org/2000/svg",
                                "svg");
                            d.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
                            d.setAttributeNS(null, "class", "esri-zoom-box__overlay");
                            d.appendChild(c);
                            d.appendChild(a);
                            this._container.appendChild(d);
                            this._backgroundShape = c;
                            this._boxShape = a;
                            this._overlay = d
                        };
                        g.prototype._destroyOverlay = function () {
                            this._container && this._container.parentNode && this._container.parentNode.removeChild(this._container);
                            this._container = this._backgroundShape = this._boxShape = this._overlay = null
                        };
                        g.prototype._toSVGPath =
                            function (a, d, c, e, g, h) {
                                c = a + c;
                                e = d + e;
                                return "M 0 0 L " + g + " 0 L " + g + " " + h + " L 0 " + h + " ZM " + a + " " + d + " L " + a + " " + e + " L " + c + " " + e + " L " + c + " " + d + " Z"
                            };
                        g.prototype._handleDrag = function (a, d) {
                            var b = a.x, c = a.y, e = a.origin.x, g = a.origin.y, h;
                            b > e ? (h = e, e = b - e) : (h = b, e -= b);
                            c > g ? (b = g, c -= g) : (b = c, c = g - c);
                            switch (a.action) {
                                case "start":
                                    this._start(h, b, e, c);
                                    break;
                                case "update":
                                    this._update(h, b, e, c);
                                    break;
                                case "end":
                                    this._end(h, b, e, c, d)
                            }
                            a.stopPropagation()
                        };
                        g.prototype._redraw = function () {
                            if (this._rafId && (this._rafId = null, this._overlay)) {
                                var a =
                                    this._box, d = a.x, c = a.y, e = a.width, a = a.height;
                                this._updateBox(d, c, e, a);
                                this._updateBackground(d, c, e, a);
                                this._rafId = requestAnimationFrame(this._redraw)
                            }
                        };
                        a([k.property()], g.prototype, "navigation", void 0);
                        a([k.property()], g.prototype, "view", null);
                        return g = a([k.subclass("esri.views.2d.navigation.ZoomBox")], g)
                    }(k.declared(l))
                })
        }, "esri/views/2d/navigation/actions/Pan": function () {
            define("require exports ../../../../core/tsSupport/declareExtendsHelper ../../../../core/tsSupport/decorateHelper ../../../../core/Accessor ../../../../core/accessorSupport/decorators ../../viewpointUtils ../../../3d/lib/glMatrix ../../../navigation/PanPlanarMomentumEstimator".split(" "),
                function (n, c, e, a, l, k, h, g, b) {
                    return function (d) {
                        function c(a) {
                            var c = d.call(this) || this;
                            c.animationTime = 0;
                            c.momentumEstimator = new b.PanPlanarMomentumEstimator(500, 6, .92);
                            c.momentum = null;
                            c.tmpMomentum = g.vec3.create();
                            c.momentumFinished = !1;
                            c.viewpoint = h.create();
                            c.watch("momentumFinished", function (a) {
                                a && c.navigation.stop()
                            });
                            return c
                        }

                        e(c, d);
                        c.prototype.begin = function (a, b) {
                            this.navigation.begin();
                            this.momentumEstimator.reset();
                            this.addToEstimator(b);
                            this.previousDrag = b
                        };
                        c.prototype.update = function (a, b) {
                            this.addToEstimator(b);
                            var d = b.center.x, c = b.center.y, e = this.previousDrag, d = e ? e.center.x - d : -d,
                                c = e ? c - e.center.y : c;
                            a.viewpoint = h.translateBy(this.viewpoint, a.viewpoint, [d || 0, c || 0]);
                            this.previousDrag = b
                        };
                        c.prototype.end = function (a, b) {
                            this.addToEstimator(b);
                            this.momentum = this.momentumEstimator.evaluateMomentum();
                            this.animationTime = 0;
                            if (this.momentum) this.onAnimationUpdate(a);
                            this.previousDrag = null;
                            this.navigation.end()
                        };
                        c.prototype.addToEstimator = function (a) {
                            var b = g.vec3.createFrom(-a.center.x, a.center.y, 0);
                            this.momentumEstimator.add(b,
                                b, .001 * a.timestamp)
                        };
                        c.prototype.onAnimationUpdate = function (a) {
                            var b = this;
                            this.navigation.animationManager.animateContinous(a.viewpoint, function (d, c) {
                                b.momentumFinished = !b.momentum || b.momentum.isFinished(b.animationTime);
                                c *= .001;
                                if (!b.momentumFinished) {
                                    var e = b.momentum.valueDelta(b.animationTime, c);
                                    g.vec3.scale(b.momentum.direction, e, b.tmpMomentum);
                                    a.viewpoint = h.translateBy(d, d, b.tmpMomentum)
                                }
                                b.animationTime += c
                            })
                        };
                        c.prototype.stopMomentumNavigation = function () {
                            this.momentum && (this.momentumEstimator.reset(),
                                this.momentum = null, this.navigation.stop())
                        };
                        a([k.property()], c.prototype, "momentumFinished", void 0);
                        a([k.property()], c.prototype, "viewpoint", void 0);
                        a([k.property()], c.prototype, "navigation", void 0);
                        return c = a([k.subclass("esri.views.2d.navigation.actions.Pan")], c)
                    }(k.declared(l))
                })
        }, "esri/views/navigation/PanPlanarMomentumEstimator": function () {
            define("require exports ../../core/tsSupport/extendsHelper ../3d/lib/glMatrix ./FilteredFiniteDifference ./Momentum".split(" "), function (n, c, e, a, l, k) {
                Object.defineProperty(c,
                    "__esModule", {value: !0});
                var h = function (a) {
                    function b(b, c, e, g, h) {
                        b = a.call(this, b, c, e) || this;
                        b.sceneVelocity = g;
                        b.direction = h;
                        return b
                    }

                    e(b, a);
                    b.prototype.value = function (b) {
                        return a.prototype.valueFromInitialVelocity.call(this, this.sceneVelocity, b)
                    };
                    return b
                }(k.Momentum);
                c.PanPlanarMomentum = h;
                n = function () {
                    function c(b, c, e) {
                        void 0 === b && (b = 300);
                        void 0 === c && (c = 12);
                        void 0 === e && (e = .84);
                        this.minimumInitialVelocity = b;
                        this.stopVelocity = c;
                        this.friction = e;
                        this.time = new l.FilteredFiniteDifference(.6);
                        this.screen =
                            [new l.FilteredFiniteDifference(.4), new l.FilteredFiniteDifference(.4)];
                        this.scene = [new l.FilteredFiniteDifference(.6), new l.FilteredFiniteDifference(.6), new l.FilteredFiniteDifference(.6)];
                        this.tmpDirection = a.vec3d.create()
                    }

                    c.prototype.add = function (a, c, e) {
                        this.time.hasLastValue && .015 > this.time.computeDelta(e) || (this.screen[0].update(a[0]), this.screen[1].update(a[1]), this.scene[0].update(c[0]), this.scene[1].update(c[1]), this.scene[2].update(c[2]), this.time.update(e))
                    };
                    c.prototype.reset = function () {
                        this.screen[0].reset();
                        this.screen[1].reset();
                        this.scene[0].reset();
                        this.scene[1].reset();
                        this.scene[2].reset();
                        this.time.reset()
                    };
                    c.prototype.evaluateMomentum = function () {
                        if (!this.screen[0].hasFilteredDelta) return null;
                        var a = this.screen[0].filteredDelta, c = this.screen[1].filteredDelta,
                            a = Math.sqrt(a * a + c * c) / this.time.filteredDelta;
                        return Math.abs(a) < this.minimumInitialVelocity ? null : this.createMomentum(a, this.stopVelocity, this.friction)
                    };
                    c.prototype.createMomentum = function (b, c, e) {
                        a.vec3d.set3(this.scene[0].filteredDelta, this.scene[1].filteredDelta,
                            this.scene[2].filteredDelta, this.tmpDirection);
                        var d = a.vec3d.length(this.tmpDirection);
                        0 < d && a.vec3d.scale(this.tmpDirection, 1 / d);
                        return new h(b, c, e, d / this.time.filteredDelta, this.tmpDirection)
                    };
                    return c
                }();
                c.PanPlanarMomentumEstimator = n
            })
        }, "esri/views/navigation/FilteredFiniteDifference": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    function c(a) {
                        this.gain = a
                    }

                    c.prototype.update = function (a) {
                        if (this.hasLastValue) {
                            var c = this.computeDelta(a);
                            this.updateDelta(c)
                        }
                        this.lastValue = a
                    };
                    c.prototype.reset = function () {
                        this.filteredDelta = this.lastValue = void 0
                    };
                    Object.defineProperty(c.prototype, "hasLastValue", {
                        get: function () {
                            return void 0 !== this.lastValue
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(c.prototype, "hasFilteredDelta", {
                        get: function () {
                            return void 0 !== this.filteredDelta
                        }, enumerable: !0, configurable: !0
                    });
                    c.prototype.computeDelta = function (a) {
                        return a - this.lastValue
                    };
                    c.prototype.updateDelta = function (a) {
                        this.filteredDelta = this.hasFilteredDelta ?
                            (1 - this.gain) * this.filteredDelta + this.gain * a : a
                    };
                    return c
                }();
                c.FilteredFiniteDifference = n
            })
        }, "esri/views/navigation/Momentum": function () {
            define(["require", "exports", "../../core/tsSupport/extendsHelper"], function (n, c, e) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    function a(a, c, e) {
                        this._initialVelocity = a;
                        this._stopVelocity = c;
                        this._friction = e;
                        this._duration = Math.abs(Math.log(Math.abs(this._initialVelocity) / this._stopVelocity) / Math.log(1 - this._friction))
                    }

                    Object.defineProperty(a.prototype,
                        "duration", {
                            get: function () {
                                return this._duration
                            }, enumerable: !0, configurable: !0
                        });
                    a.prototype.isFinished = function (a) {
                        return a > this.duration
                    };
                    Object.defineProperty(a.prototype, "friction", {
                        get: function () {
                            return this._friction
                        }, enumerable: !0, configurable: !0
                    });
                    a.prototype.value = function (a) {
                        return this.valueFromInitialVelocity(this._initialVelocity, a)
                    };
                    a.prototype.valueDelta = function (a, c) {
                        var e = this.value(a);
                        return this.value(a + c) - e
                    };
                    a.prototype.valueFromInitialVelocity = function (a, c) {
                        c = Math.min(c, this.duration);
                        var e = 1 - this.friction;
                        return a * (Math.pow(e, c) - 1) / Math.log(e)
                    };
                    return a
                }();
                c.Momentum = n
            })
        }, "esri/views/2d/navigation/actions/Pinch": function () {
            define("require exports ../../../../core/tsSupport/declareExtendsHelper ../../../../core/tsSupport/decorateHelper ../../../../core/Accessor ../../../../core/accessorSupport/decorators ../../viewpointUtils ../../libs/gl-matrix/vec2 ../../../navigation/RotationMomentumEstimator ../../../navigation/ZoomMomentumEstimator".split(" "), function (n, c, e, a, l, k, h, g, b, d) {
                return function (c) {
                    function f(a) {
                        var e =
                            c.call(this, a) || this;
                        e._animationTime = 0;
                        e._momentumFinished = !1;
                        e._rotateMomentumEstimator = new b.RotationMomentumEstimator(.6, .15, .95);
                        e._rotationDirection = 1;
                        e._zoomDirection = 1;
                        e._zoomFirst = null;
                        e._zoomMomentumEstimator = new d.ZoomMomentumEstimator;
                        e.zoomMomentum = null;
                        e.rotateMomentum = null;
                        e.viewpoint = h.create();
                        e.watch("_momentumFinished", function (a) {
                            a && e.navigation.stop()
                        });
                        return e
                    }

                    e(f, c);
                    f.prototype.begin = function (a, b) {
                        this.navigation.begin();
                        this._rotateMomentumEstimator.reset();
                        this._zoomMomentumEstimator.reset();
                        this._previousAngle = this._startAngle = b.angle;
                        this._previousRadius = this._startRadius = b.radius;
                        this._startTimestamp = b.timestamp;
                        a.constraints.rotationEnabled && this.addToRotateEstimator(0, b.timestamp);
                        this.addToZoomEstimator(b, 1)
                    };
                    f.prototype.update = function (a, b) {
                        if (!(100 > b.timestamp - this._startTimestamp)) {
                            var c = b.angle, d = b.radius, e = b.center,
                                f = 180 * Math.abs(c - this._startAngle) / Math.PI, g = Math.abs(d - this._startRadius);
                            if (!(1 >= f && 1 >= g)) {
                                var h = this._startRadius / d;
                                this._previousRadius && (d /= this._previousRadius,
                                    c = 180 * (c - this._previousAngle) / Math.PI, this._rotationDirection = 0 <= c ? 1 : -1, this._zoomDirection = 1 <= d ? 1 : -1, f = g - f, null == this._zoomFirst && (this._zoomFirst = 0 < f ? !0 : !1), this._zoomFirst ? c = 0 : null != this._zoomFirst && a.constraints.rotationEnabled && .5 < Math.abs(c) && this.addToRotateEstimator(b.angle - this._startAngle, b.timestamp), this.addToZoomEstimator(b, h), this._center = e, this.navigation.setViewpoint([e.x, e.y], 1 / d, c));
                                this._previousAngle = b.angle;
                                this._previousRadius = b.radius
                            }
                        }
                    };
                    f.prototype.end = function (a, b) {
                        this._zoomFirst =
                            null;
                        this.rotateMomentum = this._rotateMomentumEstimator.evaluateMomentum();
                        this.zoomMomentum = this._zoomMomentumEstimator.evaluateMomentum();
                        this._animationTime = 0;
                        if (this.rotateMomentum || this.zoomMomentum) this.onAnimationUpdate(a);
                        this.navigation.end()
                    };
                    f.prototype.addToRotateEstimator = function (a, b) {
                        this._rotateMomentumEstimator.add(a, .001 * b)
                    };
                    f.prototype.addToZoomEstimator = function (a, b) {
                        this._zoomMomentumEstimator.add(b, .001 * a.timestamp)
                    };
                    f.prototype.canZoomIn = function (a) {
                        var b = a.scale;
                        a = a.constraints.effectiveMaxScale;
                        return 0 === a || b > a
                    };
                    f.prototype.canZoomOut = function (a) {
                        var b = a.scale;
                        a = a.constraints.effectiveMinScale;
                        return 0 === a || b < a
                    };
                    f.prototype.onAnimationUpdate = function (a) {
                        var b = this;
                        this.navigation.animationManager.animateContinous(a.viewpoint, function (c, d) {
                            var e = !b.canZoomIn(a) && 1 < b._zoomDirection || !b.canZoomOut(a) && 1 > b._zoomDirection,
                                f = !b.rotateMomentum || b.rotateMomentum.isFinished(b._animationTime),
                                e = e || !b.zoomMomentum || b.zoomMomentum.isFinished(b._animationTime);
                            d *= .001;
                            b._momentumFinished = f && e;
                            if (!b._momentumFinished) {
                                var f =
                                        b.rotateMomentum ? Math.abs(b.rotateMomentum.valueDelta(b._animationTime, d)) * b._rotationDirection * 180 / Math.PI : 0,
                                    e = b.zoomMomentum ? Math.abs(b.zoomMomentum.valueDelta(b._animationTime, d)) : 1,
                                    m = g.create(), k = g.create();
                                b._center && (g.set(m, b._center.x, b._center.y), h.getPaddingScreenTranslation(k, a.size, a.padding), g.add(m, m, k), h.scaleAndRotateBy(c, a.viewpoint, e, f, m, a.size))
                            }
                            b._animationTime += d
                        })
                    };
                    f.prototype.stopMomentumNavigation = function () {
                        if (this.rotateMomentum || this.zoomMomentum) this.rotateMomentum && (this._rotateMomentumEstimator.reset(),
                            this.rotateMomentum = null), this.zoomMomentum && (this._zoomMomentumEstimator.reset(), this.zoomMomentum = null), this.navigation.stop()
                    };
                    a([k.property()], f.prototype, "_momentumFinished", void 0);
                    a([k.property()], f.prototype, "viewpoint", void 0);
                    a([k.property()], f.prototype, "navigation", void 0);
                    return f = a([k.subclass("esri.views.2d.navigation.actions.Pinch")], f)
                }(k.declared(l))
            })
        }, "esri/views/navigation/RotationMomentumEstimator": function () {
            define(["require", "exports", "../../core/tsSupport/extendsHelper", "./MomentumEstimator"],
                function (n, c, e, a) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    n = function (a) {
                        function c(c, e, b, d) {
                            void 0 === c && (c = 3);
                            void 0 === e && (e = .01);
                            void 0 === b && (b = .95);
                            void 0 === d && (d = 12);
                            return a.call(this, c, e, b, d) || this
                        }

                        e(c, a);
                        c.prototype.add = function (c, e) {
                            if (this.value.hasLastValue) {
                                var b = this.value.lastValue;
                                for (c -= b; c > Math.PI;) c -= 2 * Math.PI;
                                for (; c < -Math.PI;) c += 2 * Math.PI;
                                c = b + c
                            }
                            a.prototype.add.call(this, c, e)
                        };
                        return c
                    }(a.MomentumEstimator);
                    c.RotationMomentumEstimator = n
                })
        }, "esri/views/navigation/MomentumEstimator": function () {
            define("require exports ../../core/tsSupport/extendsHelper ../3d/support/mathUtils ./FilteredFiniteDifference ./Momentum".split(" "),
                function (n, c, e, a, l, k) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    n = function () {
                        function c(a, b, c, e) {
                            void 0 === a && (a = 2.5);
                            void 0 === b && (b = .01);
                            void 0 === c && (c = .95);
                            void 0 === e && (e = 12);
                            this.minimumInitialVelocity = a;
                            this.stopVelocity = b;
                            this.friction = c;
                            this.maxVelocity = e;
                            this.value = new l.FilteredFiniteDifference(.8);
                            this.time = new l.FilteredFiniteDifference(.3)
                        }

                        c.prototype.add = function (a, b) {
                            if (this.time.hasLastValue) {
                                if (.01 > this.time.computeDelta(b)) return;
                                if (this.value.hasFilteredDelta) {
                                    var c = this.value.computeDelta(a);
                                    0 > this.value.filteredDelta * c && this.value.reset()
                                }
                            }
                            this.time.update(b);
                            this.value.update(a)
                        };
                        c.prototype.reset = function () {
                            this.value.reset();
                            this.time.reset()
                        };
                        c.prototype.evaluateMomentum = function () {
                            if (!this.value.hasFilteredDelta) return null;
                            var c = this.value.filteredDelta / this.time.filteredDelta,
                                c = a.clamp(c, -this.maxVelocity, this.maxVelocity);
                            return Math.abs(c) < this.minimumInitialVelocity ? null : this.createMomentum(c, this.stopVelocity, this.friction)
                        };
                        c.prototype.createMomentum = function (a, b, c) {
                            return new k.Momentum(a,
                                b, c)
                        };
                        return c
                    }();
                    c.MomentumEstimator = n
                })
        }, "esri/views/navigation/ZoomMomentumEstimator": function () {
            define(["require", "exports", "../../core/tsSupport/extendsHelper", "./Momentum", "./MomentumEstimator"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var k = function (a) {
                    function c(b, c, e) {
                        return a.call(this, b, c, e) || this
                    }

                    e(c, a);
                    c.prototype.value = function (b) {
                        b = a.prototype.value.call(this, b);
                        return Math.exp(b)
                    };
                    c.prototype.valueDelta = function (b, c) {
                        var d = a.prototype.value.call(this, b);
                        b = a.prototype.value.call(this, b + c);
                        return Math.exp(b - d)
                    };
                    return c
                }(a.Momentum);
                c.ZoomMomentum = k;
                n = function (a) {
                    function c(b, c, e, g) {
                        void 0 === b && (b = 2.5);
                        void 0 === c && (c = .01);
                        void 0 === e && (e = .95);
                        void 0 === g && (g = 12);
                        return a.call(this, b, c, e, g) || this
                    }

                    e(c, a);
                    c.prototype.add = function (b, c) {
                        a.prototype.add.call(this, Math.log(b), c)
                    };
                    c.prototype.createMomentum = function (a, c, e) {
                        return new k(a, c, e)
                    };
                    return c
                }(l.MomentumEstimator);
                c.ZoomMomentumEstimator = n
            })
        }, "esri/views/2d/navigation/actions/Rotate": function () {
            define("require exports ../../../../core/tsSupport/declareExtendsHelper ../../../../core/tsSupport/decorateHelper ../../../../core/Accessor ../../../../core/accessorSupport/decorators ../../viewpointUtils ../../libs/gl-matrix/vec2".split(" "),
                function (n, c, e, a, l, k, h, g) {
                    return function (b) {
                        function c(a) {
                            a = b.call(this) || this;
                            a.animationTime = 0;
                            a.viewpoint = h.create();
                            return a
                        }

                        e(c, b);
                        c.prototype.begin = function (a, b) {
                            this.navigation.begin();
                            this.previousCenter = b.center
                        };
                        c.prototype.update = function (a, b) {
                            var c = g.create();
                            g.set(c, b.center.x + a.padding.left - a.padding.right, a.height - b.center.y + a.padding.top - a.padding.bottom);
                            var d = g.create();
                            g.set(d, this.previousCenter.x + a.padding.left - a.padding.right, a.height - this.previousCenter.y + a.padding.top - a.padding.bottom);
                            c = h.angleBetween([a.state.paddedScreenCenter[0] + a.padding.left - a.padding.right, a.state.paddedScreenCenter[1]], c, d);
                            a.viewpoint = h.rotateBy(this.viewpoint, a.content.viewpoint, c);
                            this.previousCenter = b.center
                        };
                        c.prototype.end = function (a, b) {
                            this.navigation.end()
                        };
                        a([k.property()], c.prototype, "viewpoint", void 0);
                        a([k.property()], c.prototype, "navigation", void 0);
                        return c = a([k.subclass("esri.views.2d.actions.Rotate")], c)
                    }(k.declared(l))
                })
        }, "esri/views/2d/support/HighlightOptions": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../Color ../../../core/Accessor ../../../core/accessorSupport/decorators".split(" "),
                function (n, c, e, a, l, k, h) {
                    return function (c) {
                        function b() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a.color = new l([0, 255, 255]);
                            a.haloOpacity = 1;
                            a.fillOpacity = .5;
                            return a
                        }

                        e(b, c);
                        a([h.property({type: l})], b.prototype, "color", void 0);
                        a([h.property()], b.prototype, "haloOpacity", void 0);
                        a([h.property()], b.prototype, "fillOpacity", void 0);
                        return b = a([h.subclass("esri.views.2d.support.HighlightOptions")], b)
                    }(h.declared(k))
                })
        }, "esri/views/support/screenshotUtils": function () {
            define(["require", "exports", "../../core/tsSupport/assignHelper"],
                function (n, c, e) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    c.adjustScreenshotSettings = function (a, c) {
                        a = e({format: "png", quality: 100}, a);
                        var k, h;
                        a.includePadding ? (k = c.width, h = c.height) : (k = c.width - c.padding.left - c.padding.right, h = c.height - c.padding.top - c.padding.bottom);
                        var g = k / h;
                        void 0 !== a.width && void 0 === a.height ? a.height = a.width / g : void 0 !== a.height && void 0 === a.width && (a.width = g * a.height);
                        void 0 !== a.height && (a.height = Math.floor(a.height));
                        void 0 !== a.width && (a.width = Math.floor(a.width));
                        a.area ||
                        a.includePadding || (a.area = {x: c.padding.left, y: c.padding.top, width: k, height: h});
                        return a
                    };
                    c.resampleHermite = function (a, c, e, h, g, b, d) {
                        void 0 === d && (d = !0);
                        var f = c / g;
                        e /= b;
                        for (var m = Math.ceil(f / 2), k = Math.ceil(e / 2), l = 0; l < b; l++) for (var n = 0; n < g; n++) {
                            for (var u = 4 * (n + (d ? b - l - 1 : l) * g), r = 0, x = 0, v = 0, y = 0, w = 0, z = 0, B = 0, A = (l + .5) * e, C = Math.floor(l * e); C < (l + 1) * e; C++) for (var D = Math.abs(A - (C + .5)) / k, E = (n + .5) * f, D = D * D, G = Math.floor(n * f); G < (n + 1) * f; G++) {
                                var F = Math.abs(E - (G + .5)) / m, r = Math.sqrt(D + F * F);
                                -1 <= r && 1 >= r && (r = 2 * r * r * r - 3 * r * r + 1, 0 <
                                r && (F = 4 * (G + C * c), B += r * a[F + 3], v += r, 255 > a[F + 3] && (r = r * a[F + 3] / 250), y += r * a[F], w += r * a[F + 1], z += r * a[F + 2], x += r))
                            }
                            h[u] = y / x;
                            h[u + 1] = w / x;
                            h[u + 2] = z / x;
                            h[u + 3] = B / v
                        }
                    }
                })
        }, "esri/views/ui/2d/DefaultUI2D": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../core/accessorSupport/decorators ../DefaultUI".split(" "), function (n, c, e, a, l, k) {
                return function (c) {
                    function g(a) {
                        a = c.call(this) || this;
                        a.components = ["attribution", "zoom"];
                        return a
                    }

                    e(g, c);
                    a([l.property()],
                        g.prototype, "components", void 0);
                    return g = a([l.subclass("esri.views.ui.2d.DefaultUI2D")], g)
                }(l.declared(k))
            })
        }, "esri/views/ui/DefaultUI": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper dojo/dom-geometry ../../core/watchUtils ../../core/accessorSupport/decorators ./Component ./UI ../../widgets/Attribution ../../widgets/Compass ../../widgets/NavigationToggle ../../widgets/Zoom".split(" "), function (n, c, e, a, l, k, h, g, b, d, f, m, q) {
                return function (b) {
                    function c(a) {
                        a =
                            b.call(this) || this;
                        a._defaultPositionLookup = null;
                        a.components = [];
                        return a
                    }

                    e(c, b);
                    c.prototype.initialize = function () {
                        this._handles.add([k.init(this, "components", this._componentsWatcher.bind(this)), k.init(this, "view", this._updateViewAwareWidgets.bind(this))])
                    };
                    c.prototype._findComponentPosition = function (a) {
                        if (!this._defaultPositionLookup) {
                            var b = l.isBodyLtr();
                            this._defaultPositionLookup = {
                                attribution: "manual",
                                compass: b ? "top-left" : "top-right",
                                "navigation-toggle": b ? "top-left" : "top-right",
                                zoom: b ? "top-left" :
                                    "top-right"
                            }
                        }
                        return this._defaultPositionLookup[a]
                    };
                    c.prototype._removeComponents = function (a) {
                        var b = this;
                        a.forEach(function (a) {
                            if (a = b.find(a)) b.remove(a), a.destroy()
                        })
                    };
                    c.prototype._updateViewAwareWidgets = function (a) {
                        var b = this;
                        this.components.forEach(function (c) {
                            (c = (c = b.find(c)) && c.widget) && void 0 !== c.view && c.set("view", a)
                        })
                    };
                    c.prototype._componentsWatcher = function (a, b) {
                        this._removeComponents(b);
                        this._addComponents(a);
                        this._adjustPadding(a)
                    };
                    c.prototype._adjustPadding = function (a) {
                        -1 !== a.indexOf("attribution") ||
                        this._isOverridden("padding") || (this.padding = this.padding.top)
                    };
                    c.prototype._addComponents = function (a) {
                        var b = this;
                        this.initialized && a.forEach(function (a) {
                            return b.add(b._createComponent(a), b._findComponentPosition(a))
                        })
                    };
                    c.prototype._createComponent = function (a) {
                        var b = this._createWidget(a);
                        if (b) return new g({id: a, node: b})
                    };
                    c.prototype._createWidget = function (a) {
                        if ("attribution" === a) return this._createAttribution();
                        if ("compass" === a) return this._createCompass();
                        if ("navigation-toggle" === a) return this._createNavigationToggle();
                        if ("zoom" === a) return this._createZoom()
                    };
                    c.prototype._createAttribution = function () {
                        return new d({view: this.view})
                    };
                    c.prototype._createCompass = function () {
                        return new f({view: this.view})
                    };
                    c.prototype._createNavigationToggle = function () {
                        return new m({view: this.view})
                    };
                    c.prototype._createZoom = function () {
                        return new q({view: this.view})
                    };
                    a([h.property()], c.prototype, "components", void 0);
                    return c = a([h.subclass("esri.views.ui.DefaultUI")], c)
                }(h.declared(b))
            })
        }, "esri/views/ui/Component": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper dojo/dom dojo/dom-class ../../core/Accessor ../../core/accessorSupport/decorators".split(" "),
                function (n, c, e, a, l, k, h, g) {
                    return function (b) {
                        function c() {
                            var a = null !== b && b.apply(this, arguments) || this;
                            a.widget = null;
                            return a
                        }

                        e(c, b);
                        c.prototype.destroy = function () {
                            this.widget && this.widget.destroy();
                            this.node = null
                        };
                        Object.defineProperty(c.prototype, "id", {
                            get: function () {
                                return this._get("id") || this.get("node.id")
                            }, set: function (a) {
                                this._set("id", a)
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(c.prototype, "node", {
                            set: function (a) {
                                var b = this._get("node");
                                a !== b && (a && k.add(a, "esri-component"),
                                b && k.remove(b, "esri-component"), this._set("node", a))
                            }, enumerable: !0, configurable: !0
                        });
                        c.prototype.castNode = function (a) {
                            if (!a) return this._set("widget", null), null;
                            if ("string" === typeof a || a && "nodeType" in a) return this._set("widget", null), l.byId(a);
                            a && "function" === typeof a.render && !a.domNode && (a.domNode = document.createElement("div"));
                            this._set("widget", a);
                            return a.domNode
                        };
                        a([g.property()], c.prototype, "id", null);
                        a([g.property()], c.prototype, "node", null);
                        a([g.cast("node")], c.prototype, "castNode", null);
                        a([g.property({readOnly: !0})], c.prototype, "widget", void 0);
                        return c = a([g.subclass("esri.views.ui.Component")], c)
                    }(g.declared(h))
                })
        }, "esri/views/ui/UI": function () {
            define("require exports ../../core/tsSupport/assignHelper ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper dojo/dom-class dojo/dom-construct dojo/dom-style ../../core/Accessor ../../core/Evented ../../core/Handles ../../core/watchUtils ../../core/accessorSupport/decorators ./Component".split(" "), function (n, c,
                                                                                                                                                                                                                                                                                                                                                              e, a, l, k, h, g, b, d, f, m, q, p) {
                function t(a) {
                    return "object" !== typeof a || a && a.isInstanceOf && a.isInstanceOf(p) || !("component" in a || "index" in a || "position" in a) ? null : a
                }

                var u = {left: 0, top: 0, bottom: 0, right: 0}, r = {bottom: 30, top: 15, right: 15, left: 15};
                return function (b) {
                    function c() {
                        var a = b.call(this) || this;
                        a._cornerNameToContainerLookup = {};
                        a._positionNameToContainerLookup = {};
                        a._components = [];
                        a._handles = new f;
                        a._componentToKey = new Map;
                        a.view = null;
                        a._initContainers();
                        return a
                    }

                    a(c, b);
                    c.prototype.initialize = function () {
                        this._handles.add([m.init(this,
                            "view.padding, container", this._applyViewPadding.bind(this)), m.init(this, "padding", this._applyUIPadding.bind(this))])
                    };
                    c.prototype.destroy = function () {
                        this.container = null;
                        this._components.forEach(function (a) {
                            a.destroy()
                        });
                        this._components.length = 0;
                        this._handles.destroy();
                        this._componentToKey.clear();
                        this._componentToKey = null
                    };
                    Object.defineProperty(c.prototype, "container", {
                        set: function (a) {
                            var b = this._get("container");
                            a !== b && (a && (k.add(a, "esri-ui"), this._attachContainers(a)), b && (k.remove(b, "esri-ui"),
                                g.set(b, {
                                    top: "",
                                    bottom: "",
                                    left: "",
                                    right: ""
                                }), h.empty(b)), this._set("container", a))
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(c.prototype, "height", {
                        get: function () {
                            var a = this.get("view.height") || 0;
                            if (0 === a) return a;
                            var b = this._getViewPadding();
                            return Math.max(a - (b.top + b.bottom), 0)
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(c.prototype, "padding", {
                        get: function () {
                            return this._get("padding")
                        }, set: function (a) {
                            a ? this._override("padding", a) : this._clearOverride("padding")
                        }, enumerable: !0,
                        configurable: !0
                    });
                    c.prototype.castPadding = function (a) {
                        return "number" === typeof a ? {bottom: a, top: a, right: a, left: a} : e({}, r, a)
                    };
                    Object.defineProperty(c.prototype, "width", {
                        get: function () {
                            var a = this.get("view.width") || 0;
                            if (0 === a) return a;
                            var b = this._getViewPadding();
                            return Math.max(a - (b.left + b.right), 0)
                        }, enumerable: !0, configurable: !0
                    });
                    c.prototype.add = function (a, b) {
                        var c = this, d, e;
                        if (Array.isArray(a)) a.forEach(function (a) {
                            return c.add(a, b)
                        }); else {
                            var f = t(a);
                            f && (d = f.index, b = f.position, a = f.component, e = f.key);
                            b && "object" === typeof b && (d = b.index, e = b.key, b = b.position);
                            !a || b && !this._isValidPosition(b) || (a && a.isInstanceOf && a.isInstanceOf(p) || (a = new p({node: a})), this._place({
                                component: a,
                                position: b,
                                index: d
                            }), this._components.push(a), e && this._componentToKey.set(a, e))
                        }
                    };
                    c.prototype.remove = function (a, b) {
                        var c = this;
                        if (a) {
                            if (Array.isArray(a)) return a.map(function (a) {
                                return c.remove(a, b)
                            });
                            var d = this.find(a);
                            if (d) {
                                var e = this._componentToKey;
                                if (!e.has(a) || e.get(a) === b) return e = this._components.indexOf(d), d.node.parentNode &&
                                d.node.parentNode.removeChild(d.node), this._componentToKey.delete(a), this._components.splice(e, 1)[0]
                            }
                        }
                    };
                    c.prototype.empty = function (a) {
                        var b = this;
                        if (Array.isArray(a)) return a.map(function (a) {
                            return b.empty(a)
                        }).reduce(function (a, b) {
                            return a.concat(b)
                        });
                        a = a || "manual";
                        if ("manual" === a) return Array.prototype.slice.call(this._manualContainer.children).filter(function (a) {
                            return !k.contains(a, "esri-ui-corner")
                        }).map(function (a) {
                            return b.remove(a)
                        });
                        if (this._isValidPosition(a)) return Array.prototype.slice.call(this._cornerNameToContainerLookup[a].children).map(this.remove,
                            this)
                    };
                    c.prototype.move = function (a, b) {
                        var c = this;
                        Array.isArray(a) && a.forEach(function (a) {
                            return c.move(a, b)
                        });
                        if (a) {
                            var d, e = t(a) || t(b);
                            e && (d = e.index, b = e.position, a = e.component || a);
                            (!b || this._isValidPosition(b)) && (a = this.remove(a)) && this.add(a, {
                                position: b,
                                index: d
                            })
                        }
                    };
                    c.prototype.find = function (a) {
                        return a ? a && a.isInstanceOf && a.isInstanceOf(p) ? this._findByComponent(a) : "string" === typeof a ? this._findById(a) : this._findByNode(a.domNode || a) : null
                    };
                    c.prototype._getViewPadding = function () {
                        return this.get("view.padding") ||
                            u
                    };
                    c.prototype._attachContainers = function (a) {
                        h.place(this._manualContainer, a);
                        h.place(this._innerContainer, a)
                    };
                    c.prototype._initContainers = function () {
                        var a = h.create("div", {className: "esri-ui-inner-container esri-ui-corner-container"}),
                            b = h.create("div", {className: "esri-ui-inner-container esri-ui-manual-container"}),
                            c = h.create("div", {className: "esri-ui-top-left esri-ui-corner"}, a),
                            d = h.create("div", {className: "esri-ui-top-right esri-ui-corner"}, a),
                            f = h.create("div", {className: "esri-ui-bottom-left esri-ui-corner"},
                                a), g = h.create("div", {className: "esri-ui-bottom-right esri-ui-corner"}, a);
                        this._innerContainer = a;
                        this._manualContainer = b;
                        this._cornerNameToContainerLookup = {
                            "top-left": c,
                            "top-right": d,
                            "bottom-left": f,
                            "bottom-right": g
                        };
                        this._positionNameToContainerLookup = e({manual: b}, this._cornerNameToContainerLookup)
                    };
                    c.prototype._isValidPosition = function (a) {
                        return !!this._positionNameToContainerLookup[a]
                    };
                    c.prototype._place = function (a) {
                        var b = a.component, c = a.index;
                        a = this._positionNameToContainerLookup[a.position || "manual"];
                        var d;
                        -1 < c ? (d = Array.prototype.slice.call(a.children), 0 === c ? this._placeComponent(b, a, "first") : c >= d.length ? this._placeComponent(b, a, "last") : this._placeComponent(b, d[c], "before")) : this._placeComponent(b, a, "last")
                    };
                    c.prototype._placeComponent = function (a, b, c) {
                        var d = a.widget;
                        d && !d._started && "function" === typeof d.postMixInProperties && "function" === typeof d.buildRendering && "function" === typeof d.postCreate && "function" === typeof d.startup && a.widget.startup();
                        h.place(a.node, b, c)
                    };
                    c.prototype._applyViewPadding =
                        function () {
                            var a = this.container;
                            a && g.set(a, this._toPxPosition(this._getViewPadding()))
                        };
                    c.prototype._applyUIPadding = function () {
                        this._innerContainer && g.set(this._innerContainer, this._toPxPosition(this.padding))
                    };
                    c.prototype._toPxPosition = function (a) {
                        return {
                            top: this._toPxUnit(a.top),
                            left: this._toPxUnit(a.left),
                            right: this._toPxUnit(a.right),
                            bottom: this._toPxUnit(a.bottom)
                        }
                    };
                    c.prototype._toPxUnit = function (a) {
                        return 0 === a ? 0 : a + "px"
                    };
                    c.prototype._findByComponent = function (a) {
                        var b = null, c;
                        this._components.some(function (d) {
                            (c =
                                d === a) && (b = d);
                            return c
                        });
                        return b
                    };
                    c.prototype._findById = function (a) {
                        var b = null, c;
                        this._components.some(function (d) {
                            (c = d.id === a) && (b = d);
                            return c
                        });
                        return b
                    };
                    c.prototype._findByNode = function (a) {
                        var b = null, c;
                        this._components.some(function (d) {
                            (c = d.node === a) && (b = d);
                            return c
                        });
                        return b
                    };
                    l([q.property()], c.prototype, "container", null);
                    l([q.property({dependsOn: ["view.height"]})], c.prototype, "height", null);
                    l([q.property({value: r})], c.prototype, "padding", null);
                    l([q.cast("padding")], c.prototype, "castPadding",
                        null);
                    l([q.property()], c.prototype, "view", void 0);
                    l([q.property({dependsOn: ["view.width"]})], c.prototype, "width", null);
                    return c = l([q.subclass("esri.views.ui.UI")], c)
                }(q.declared(b, d))
            })
        }, "esri/widgets/Attribution": function () {
            define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper dojo/i18n!./Attribution/nls/Attribution ../core/watchUtils ../core/accessorSupport/decorators ./Widget ./Attribution/AttributionViewModel ./support/widget".split(" "), function (n, c,
                                                                                                                                                                                                                                                                                              e, a, l, k, h, g, b, d) {
                return function (c) {
                    function f(a) {
                        a = c.call(this) || this;
                        a._isOpen = !1;
                        a._attributionTextOverflowed = !1;
                        a._prevSourceNodeHeight = 0;
                        a.iconClass = "esri-icon-description";
                        a.itemDelimiter = " | ";
                        a.label = l.widgetLabel;
                        a.view = null;
                        a.viewModel = new b;
                        return a
                    }

                    e(f, c);
                    f.prototype.postInitialize = function () {
                        var a = this;
                        this.own(k.on(this, "viewModel.items", "change", function () {
                            return a.scheduleRender()
                        }))
                    };
                    Object.defineProperty(f.prototype, "attributionText", {
                        get: function () {
                            return this.viewModel.items.reduce(function (a,
                                                                         b) {
                                -1 === a.indexOf(b.text) && a.push(b.text);
                                return a
                            }, []).join(this.itemDelimiter)
                        }, enumerable: !0, configurable: !0
                    });
                    f.prototype.render = function () {
                        var a, b = (a = {}, a["esri-attribution--open"] = this._isOpen, a);
                        return d.tsx("div", {
                            bind: this,
                            class: this.classes("esri-attribution esri-widget", b),
                            onclick: this._toggleState,
                            onkeydown: this._toggleState
                        }, this._renderSourcesNode(), d.tsx("div", {class: "esri-attribution__powered-by"}, "Powered by", " ", d.tsx("a", {
                            target: "_blank",
                            href: "http://www.esri.com/",
                            class: this.classes("esri-attribution__link",
                                "esri-widget__anchor")
                        }, "Esri")))
                    };
                    f.prototype._renderSourcesNode = function () {
                        var a, b = this._isOpen, c = this._isInteractive(), e = c ? 0 : -1, f = this.attributionText,
                            g = c ? "button" : void 0,
                            b = (a = {}, a["esri-attribution__sources--open"] = b, a["esri-interactive"] = c, a);
                        return d.tsx("div", {
                            afterCreate: this._afterSourcesNodeCreate,
                            afterUpdate: this._afterSourcesNodeUpdate,
                            bind: this,
                            class: this.classes("esri-attribution__sources", b),
                            innerHTML: f,
                            role: g,
                            tabIndex: e
                        })
                    };
                    f.prototype._afterSourcesNodeCreate = function (a) {
                        this._prevSourceNodeHeight =
                            a.clientWidth
                    };
                    f.prototype._afterSourcesNodeUpdate = function (a) {
                        var b = !1, c = a.clientHeight;
                        a = a.scrollWidth >= a.clientWidth;
                        var d = this._attributionTextOverflowed !== a;
                        this._attributionTextOverflowed = a;
                        d && (b = !0);
                        this._isOpen && (a = c < this._prevSourceNodeHeight, this._prevSourceNodeHeight = c, a && (this._isOpen = !1, b = !0));
                        b && this.scheduleRender()
                    };
                    f.prototype._toggleState = function () {
                        this._isInteractive() && (this._isOpen = !this._isOpen)
                    };
                    f.prototype._isInteractive = function () {
                        return this._isOpen || this._attributionTextOverflowed
                    };
                    a([h.property({
                        dependsOn: ["viewModel.items.length", "itemDelimiter"],
                        readOnly: !0
                    }), d.renderable()], f.prototype, "attributionText", null);
                    a([h.property()], f.prototype, "iconClass", void 0);
                    a([h.property(), d.renderable()], f.prototype, "itemDelimiter", void 0);
                    a([h.property()], f.prototype, "label", void 0);
                    a([h.aliasOf("viewModel.view")], f.prototype, "view", void 0);
                    a([h.property({type: b}), d.renderable(["state", "view.size"])], f.prototype, "viewModel", void 0);
                    a([d.accessibleHandler()], f.prototype, "_toggleState",
                        null);
                    return f = a([h.subclass("esri.widgets.Attribution")], f)
                }(h.declared(g))
            })
        }, "esri/widgets/Attribution/AttributionViewModel": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../geometry ../../core/Accessor ../../core/Collection ../../core/Handles ../../core/watchUtils ../../core/accessorSupport/decorators ../../geometry/support/contains ../../geometry/support/webMercatorUtils".split(" "), function (n, c, e, a, l, k, h, g, b, d, f, m) {
                return function (c) {
                    function k(a) {
                        a =
                            c.call(this, a) || this;
                        a._handles = new g;
                        a._pendingAttributionItemsByLayerId = {};
                        a._attributionDataByLayerId = {};
                        a.items = new h;
                        a.view = null;
                        a._updateAttributionItems = a._updateAttributionItems.bind(a);
                        return a
                    }

                    e(k, c);
                    k.prototype.initialize = function () {
                        this._handles.add(b.init(this, "view", this._viewWatcher))
                    };
                    k.prototype.destroy = function () {
                        this._handles.destroy();
                        this.view = this._handles = null
                    };
                    Object.defineProperty(k.prototype, "state", {
                        get: function () {
                            return this.get("view.ready") ? "ready" : "disabled"
                        }, enumerable: !0,
                        configurable: !0
                    });
                    k.prototype._viewWatcher = function (a) {
                        var c = this, d = this._handles;
                        d && d.remove();
                        a && (d.add([a.allLayerViews.on("change", function (a) {
                            c._addLayerViews(a.added);
                            0 < a.removed.length && (a.removed.forEach(function (a) {
                                d.remove(a.uid)
                            }), c._updateAttributionItems())
                        }), b.init(a, "stationary", this._updateAttributionItems)]), this._addLayerViews(a.allLayerViews))
                    };
                    k.prototype._addLayerViews = function (a) {
                        var c = this;
                        a.forEach(function (a) {
                            c._handles.has(a.uid) || c._handles.add(b.init(a, "suspended", c._updateAttributionItems),
                                a.uid)
                        })
                    };
                    k.prototype._updateAttributionItems = function () {
                        var a = this, b = [];
                        this._getActiveLayerViews().forEach(function (c) {
                            var d = c.layer;
                            if (!d.hasAttributionData) {
                                if (c = d.get("copyright")) {
                                    var e = a._findItem(b, {layer: d, text: c});
                                    e || b.push({text: c, layer: d})
                                }
                            } else if (d && d.tileInfo) {
                                var f = a._attributionDataByLayerId;
                                if (f[d.uid]) {
                                    if (c = a._getDynamicAttribution(f[d.uid], a.view, d)) (e = a._findItem(b, {
                                        layer: d,
                                        text: c
                                    })) || b.push({text: c, layer: d})
                                } else {
                                    var g = a._pendingAttributionItemsByLayerId;
                                    a._inProgress(g[d.uid]) ||
                                    (g[d.uid] = d.fetchAttributionData().then(function (b) {
                                        b = a._createContributionIndex(b, a._isBingLayer(d));
                                        delete g[d.uid];
                                        f[d.uid] = b;
                                        a._updateAttributionItems()
                                    }))
                                }
                            }
                        });
                        this._itemsChanged(this.items, b) && (this.items.removeAll(), this.items.addMany(b))
                    };
                    k.prototype._itemsChanged = function (a, b) {
                        return a.length !== b.length || a.some(function (a, c) {
                            return a.text !== b[c].text
                        })
                    };
                    k.prototype._inProgress = function (a) {
                        return a && !a.isFulfilled()
                    };
                    k.prototype._getActiveLayerViews = function () {
                        return this.get("view.allLayerViews").filter(function (a) {
                            return !a.suspended &&
                                a.get("layer.attributionVisible")
                        })
                    };
                    k.prototype._findItem = function (a, b) {
                        var c = b.layer, d = b.text, e;
                        a.some(function (a) {
                            var b = a.layer === c && a.text === d;
                            b && (e = a);
                            return b
                        });
                        return e
                    };
                    k.prototype._isBingLayer = function (a) {
                        return "bing-maps" === a.type
                    };
                    k.prototype._createContributionIndex = function (a, b) {
                        a = a.contributors;
                        var c = {};
                        if (!a) return c;
                        for (var d = 0; d < a.length; d++) {
                            var e = a[d], f = e.coverageAreas;
                            if (!f) return;
                            for (var g = 0; g < f.length; g++) for (var h = f[g], k = h.bbox, p = h.zoomMin - (b && h.zoomMin ? 1 : 0), n = h.zoomMax - (b &&
                            h.zoomMax ? 1 : 0), h = {
                                extent: m.geographicToWebMercator({
                                    xmin: k[1],
                                    ymin: k[0],
                                    xmax: k[3],
                                    ymax: k[2],
                                    spatialReference: l.SpatialReference.WGS84
                                }), attribution: e.attribution || "", score: null != h.score ? h.score : 100, id: d
                            }; p <= n; p++) c[p] = c[p] || [], c[p].push(h)
                        }
                        c.maxKey = Math.max.apply(null, Object.keys(c));
                        return c
                    };
                    k.prototype._getDynamicAttribution = function (a, b, c) {
                        var d = b.extent;
                        c = c.tileInfo.scaleToZoom(b.scale);
                        c = Math.min(a.maxKey, Math.round(c));
                        if (!d || null == c || -1 >= c) return "";
                        a = a[c];
                        var e = m.project(d.center.clone().normalize(),
                            b.spatialReference), g = {};
                        return a.filter(function (a) {
                            var b = !g[a.id] && e && f.extentContainsPoint(a.extent, e);
                            b && (g[a.id] = !0);
                            return b
                        }).sort(function (a, b) {
                            return b.score - a.score || a.objectId - b.objectId
                        }).map(function (a) {
                            return a.attribution
                        }).join(", ")
                    };
                    a([d.property({readOnly: !0, type: h})], k.prototype, "items", void 0);
                    a([d.property({dependsOn: ["view.ready"], readOnly: !0})], k.prototype, "state", null);
                    a([d.property()], k.prototype, "view", void 0);
                    return k = a([d.subclass("esri.widgets.Attribution.AttributionViewModel")],
                        k)
                }(d.declared(k))
            })
        }, "esri/widgets/Compass": function () {
            define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper dojo/i18n!./Compass/nls/Compass ../core/accessorSupport/decorators ./Widget ./Compass/CompassViewModel ./support/widget".split(" "), function (n, c, e, a, l, k, h, g, b) {
                return function (c) {
                    function d(a) {
                        a = c.call(this) || this;
                        a.activeMode = null;
                        a.goToOverride = null;
                        a.iconClass = "esri-icon-locate-circled";
                        a.label = l.widgetLabel;
                        a.modes = null;
                        a.view = null;
                        a.viewModel =
                            new g;
                        return a
                    }

                    e(d, c);
                    d.prototype.reset = function () {
                    };
                    d.prototype.render = function () {
                        var a, c, d = this.viewModel.orientation, e = this.viewModel.state, f = "disabled" === e,
                            g = "compass" === ("rotation" === e ? "rotation" : "compass"), e = f ? -1 : 0,
                            f = (a = {}, a["esri-disabled"] = f, a["esri-compass--active"] = "device-orientation" === this.viewModel.activeMode, a["esri-interactive"] = !f, a);
                        a = (c = {}, c["esri-icon-compass"] = g, c["esri-icon-dial"] = !g, c);
                        return b.tsx("div", {
                            bind: this,
                            class: this.classes("esri-compass esri-widget--button esri-widget",
                                f),
                            onclick: this._start,
                            onkeydown: this._start,
                            role: "button",
                            tabIndex: e,
                            "aria-label": l.reset,
                            title: l.reset
                        }, b.tsx("span", {
                            "aria-hidden": "true",
                            class: this.classes("esri-compass__icon", a),
                            styles: this._toRotationTransform(d)
                        }), b.tsx("span", {class: "esri-icon-font-fallback-text"}, l.reset))
                    };
                    d.prototype._start = function () {
                        var a = this.viewModel;
                        a.nextMode();
                        a.startMode()
                    };
                    d.prototype._toRotationTransform = function (a) {
                        return {transform: "rotateZ(" + a.z + "deg)"}
                    };
                    a([k.aliasOf("viewModel.activeMode")], d.prototype, "activeMode",
                        void 0);
                    a([k.aliasOf("viewModel.goToOverride")], d.prototype, "goToOverride", void 0);
                    a([k.property()], d.prototype, "iconClass", void 0);
                    a([k.property()], d.prototype, "label", void 0);
                    a([k.aliasOf("viewModel.modes")], d.prototype, "modes", void 0);
                    a([k.aliasOf("viewModel.view")], d.prototype, "view", void 0);
                    a([k.property({type: g}), b.renderable(["viewModel.orientation", "viewModel.state"])], d.prototype, "viewModel", void 0);
                    a([k.aliasOf("viewModel.reset")], d.prototype, "reset", null);
                    a([b.accessibleHandler()], d.prototype,
                        "_start", null);
                    return d = a([k.subclass("esri.widgets.Compass")], d)
                }(k.declared(h))
            })
        }, "esri/widgets/Compass/CompassViewModel": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/Handles ../../core/Logger ../../core/promiseUtils ../../core/watchUtils ../../core/accessorSupport/decorators ../support/GoTo".split(" "), function (n, c, e, a, l, k, h, g, b, d, f) {
                var m = h.getLogger("esri.widgets.CompassViewModel");
                return function (c) {
                    function f(a) {
                        a =
                            c.call(this, a) || this;
                        a._handles = new k;
                        a._eventType = a._getDeviceOrientationEventType();
                        a.canUseHeading = !1;
                        a.orientation = {x: 0, y: 0, z: 0};
                        a.view = null;
                        a._updateForCamera = a._updateForCamera.bind(a);
                        a._updateForRotation = a._updateForRotation.bind(a);
                        a._updateRotationWatcher = a._updateRotationWatcher.bind(a);
                        a._updateViewHeading = a._updateViewHeading.bind(a);
                        a._checkHeadingSupport = a._checkHeadingSupport.bind(a);
                        a._canUseHeading();
                        return a
                    }

                    e(f, c);
                    f.prototype.initialize = function () {
                        this._handles.add(b.init(this,
                            "view", this._updateRotationWatcher))
                    };
                    f.prototype.destroy = function () {
                        this._removeCheckHeadingListener();
                        this._removeOrientationListener();
                        this._handles.destroy();
                        this.view = this._handles = null
                    };
                    Object.defineProperty(f.prototype, "activeMode", {
                        get: function () {
                            var a = this._get("activeMode");
                            return a ? a : (a = this.modes) ? a[0] : "none"
                        }, set: function (a) {
                            this.stopMode();
                            this._override("activeMode", a);
                            void 0 === a && this._clearOverride("activeMode")
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(f.prototype, "canShowNorth",
                        {
                            get: function () {
                                var a = this.get("view.spatialReference");
                                return a && (a.isWebMercator || a.isWGS84)
                            }, enumerable: !0, configurable: !0
                        });
                    Object.defineProperty(f.prototype, "modes", {
                        get: function () {
                            return this._get("modes") || ["reset"]
                        }, set: function (a) {
                            this._set("modes", a);
                            void 0 === a && this._clearOverride("modes")
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(f.prototype, "state", {
                        get: function () {
                            return this.get("view.ready") ? this.canShowNorth ? "compass" : "rotation" : "disabled"
                        }, enumerable: !0, configurable: !0
                    });
                    f.prototype.previousMode = function () {
                        var a = this.modes;
                        2 > a.length || (a = a.indexOf(this.activeMode), this._paginateMode(a - 1))
                    };
                    f.prototype.nextMode = function () {
                        var a = this.modes;
                        2 > a.length || (a = a.indexOf(this.activeMode), this._paginateMode(a + 1))
                    };
                    f.prototype.startMode = function () {
                        var a = this.activeMode;
                        "reset" === a && this.reset();
                        "device-orientation" === a && (this._removeOrientationListener(), this._addOrientationListener())
                    };
                    f.prototype.stopMode = function () {
                        "device-orientation" === this.activeMode && this._removeOrientationListener()
                    };
                    f.prototype.reset = function () {
                        if (this.get("view.ready")) {
                            var a = {};
                            "2d" === this.view.type ? a.rotation = 0 : a.heading = 0;
                            this.callGoTo({target: a})
                        }
                    };
                    f.prototype._getDeviceOrientationEventType = function () {
                        if ("ondeviceorientationabsolute" in window) return "deviceorientationabsolute";
                        if ("ondeviceorientation" in window) return "deviceorientation"
                    };
                    f.prototype._paginateMode = function (a) {
                        var b = this.modes;
                        this.activeMode = b[(a + b.length) % b.length]
                    };
                    f.prototype._supportsHeading = function (a) {
                        var b = a.absolute, c = a.alpha;
                        return "number" ===
                            typeof a.webkitCompassHeading || !!b && "number" === typeof c
                    };
                    f.prototype._getHeading = function (a) {
                        var b = a.alpha, c = a.webkitCompassHeading;
                        if (c) return c;
                        if (a.absolute && "number" === typeof b) return b
                    };
                    f.prototype._removeCheckHeadingListener = function () {
                        var a = this._eventType;
                        a && window.removeEventListener(a, this._checkHeadingSupport)
                    };
                    f.prototype._checkHeadingSupport = function (a) {
                        this._supportsHeading(a) && this._set("canUseHeading", !0);
                        this._removeCheckHeadingListener()
                    };
                    f.prototype._canUseHeading = function () {
                        var a =
                            this, b = this._eventType;
                        b && (window.addEventListener(b, this._checkHeadingSupport), g.after(500).then(function () {
                            a._removeCheckHeadingListener()
                        }))
                    };
                    f.prototype._getHeadingAdjustment = function (a, b) {
                        if ("orientation" in window) {
                            b = window.orientation;
                            if ("number" !== typeof b) return a;
                            a += b;
                            return 360 < a ? a - 360 : 0 > a ? a + 360 : a
                        }
                        return a
                    };
                    f.prototype._updateViewHeading = function (a) {
                        var b = this.view, c = this._getHeading(a);
                        !b || !b.stationary || "number" !== typeof c || 0 > c || 360 < c || (a = this._getHeadingAdjustment(c, a), "3d" === b.type &&
                        (c = b.camera.clone(), c.heading = a, b.camera = c), "2d" === b.type && (b.rotation = a))
                    };
                    f.prototype._removeOrientationListener = function () {
                        this.canUseHeading && window.removeEventListener(this._eventType, this._updateViewHeading)
                    };
                    f.prototype._addOrientationListener = function () {
                        var a = this._eventType, b = this.canShowNorth;
                        this.canUseHeading ? b ? window.addEventListener(a, this._updateViewHeading) : m.warn("device-orientation mode requires 'canShowNorth' to be true") : m.warn("The deviceorientation event is not supported in this browser")
                    };
                    f.prototype._updateForRotation = function (a) {
                        void 0 !== a && null !== a && (this.orientation = {z: a})
                    };
                    f.prototype._updateForCamera = function (a) {
                        a && (this.orientation = {x: 0, y: 0, z: -a.heading})
                    };
                    f.prototype._updateRotationWatcher = function (a) {
                        this._handles.removeAll();
                        a && ("2d" === a.type ? this._handles.add(b.init(this, "view.rotation", this._updateForRotation)) : this._handles.add(b.init(this, "view.camera", this._updateForCamera)))
                    };
                    a([d.property({dependsOn: ["modes"]})], f.prototype, "activeMode", null);
                    a([d.property({
                        dependsOn: ["view.spatialReference.isWebMercator",
                            "view.spatialReference.wkid"], readOnly: !0
                    })], f.prototype, "canShowNorth", null);
                    a([d.property({readOnly: !0})], f.prototype, "canUseHeading", void 0);
                    a([d.property({dependsOn: ["canUseHeading"]})], f.prototype, "modes", null);
                    a([d.property()], f.prototype, "orientation", void 0);
                    a([d.property({
                        dependsOn: ["view.ready", "canShowNorth"],
                        readOnly: !0
                    })], f.prototype, "state", null);
                    a([d.property()], f.prototype, "view", void 0);
                    a([d.property()], f.prototype, "previousMode", null);
                    a([d.property()], f.prototype, "nextMode", null);
                    a([d.property()], f.prototype, "startMode", null);
                    a([d.property()], f.prototype, "stopMode", null);
                    a([d.property()], f.prototype, "reset", null);
                    return f = a([d.subclass("esri.widgets.CompassViewModel")], f)
                }(d.declared(l, f))
            })
        }, "esri/widgets/NavigationToggle": function () {
            define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper dojo/i18n!./NavigationToggle/nls/NavigationToggle ../core/accessorSupport/decorators ./Widget ./NavigationToggle/NavigationToggleViewModel ./support/widget".split(" "),
                function (n, c, e, a, l, k, h, g, b) {
                    return function (c) {
                        function d(a) {
                            a = c.call(this) || this;
                            a.iconClass = "esri-icon-pan2";
                            a.label = l.widgetLabel;
                            a.view = null;
                            a.viewModel = new g;
                            return a
                        }

                        e(d, c);
                        Object.defineProperty(d.prototype, "layout", {
                            set: function (a) {
                                "horizontal" !== a && (a = "vertical");
                                this._set("layout", a)
                            }, enumerable: !0, configurable: !0
                        });
                        d.prototype.toggle = function () {
                        };
                        d.prototype.render = function () {
                            var a, c, d, e = "disabled" === this.get("viewModel.state"),
                                f = "pan" === this.get("viewModel.navigationMode"), g = (a = {}, a["esri-disabled"] =
                                    e, a["esri-navigation-toggle--horizontal"] = "horizontal" === this.layout, a);
                            a = (c = {}, c["esri-navigation-toggle__button--active"] = f, c);
                            c = (d = {}, d["esri-navigation-toggle__button--active"] = !f, d);
                            d = e ? -1 : 0;
                            return b.tsx("div", {
                                bind: this,
                                class: this.classes("esri-navigation-toggle esri-widget", g),
                                onclick: this._toggle,
                                onkeydown: this._toggle,
                                tabIndex: d,
                                "aria-label": l.toggle,
                                title: l.toggle
                            }, b.tsx("div", {
                                class: this.classes("esri-navigation-toggle__button esri-widget--button", "esri-navigation-toggle__button--pan",
                                    a)
                            }, b.tsx("span", {class: "esri-icon-pan"})), b.tsx("div", {class: this.classes("esri-navigation-toggle__button esri-widget--button", "esri-navigation-toggle__button--rotate", c)}, b.tsx("span", {class: "esri-icon-rotate"})))
                        };
                        d.prototype._toggle = function () {
                            this.toggle()
                        };
                        a([k.property()], d.prototype, "iconClass", void 0);
                        a([k.property()], d.prototype, "label", void 0);
                        a([k.property({value: "vertical"}), b.renderable()], d.prototype, "layout", null);
                        a([k.aliasOf("viewModel.view"), b.renderable()], d.prototype, "view", void 0);
                        a([k.property({type: g}), b.renderable(["viewModel.state", "viewModel.navigationMode"])], d.prototype, "viewModel", void 0);
                        a([k.aliasOf("viewModel.toggle")], d.prototype, "toggle", null);
                        a([b.accessibleHandler()], d.prototype, "_toggle", null);
                        return d = a([k.subclass("esri.widgets.NavigationToggle")], d)
                    }(k.declared(h))
                })
        }, "esri/widgets/NavigationToggle/NavigationToggleViewModel": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/Handles ../../core/watchUtils ../../core/accessorSupport/decorators".split(" "),
                function (n, c, e, a, l, k, h, g) {
                    return function (b) {
                        function c(a) {
                            a = b.call(this, a) || this;
                            a._handles = new k;
                            a.navigationMode = "pan";
                            a.view = null;
                            a.toggle = a.toggle.bind(a);
                            return a
                        }

                        e(c, b);
                        c.prototype.initialize = function () {
                            this._handles.add(h.when(this, "view.inputManager", this._setNavigationMode.bind(this)))
                        };
                        c.prototype.destroy = function () {
                            this._handles.destroy();
                            this.view = this._handles = null
                        };
                        Object.defineProperty(c.prototype, "state", {
                            get: function () {
                                return this.get("view.ready") && "3d" === this.view.type ? "ready" :
                                    "disabled"
                            }, enumerable: !0, configurable: !0
                        });
                        c.prototype.toggle = function () {
                            "disabled" !== this.state && (this.navigationMode = "pan" !== this.navigationMode ? "pan" : "rotate", this._setNavigationMode())
                        };
                        c.prototype._setNavigationMode = function () {
                            this.get("view.inputManager").primaryDragAction = "pan" === this.navigationMode ? "pan" : "rotate"
                        };
                        a([g.property({dependsOn: ["view.ready"], readOnly: !0})], c.prototype, "state", null);
                        a([g.property()], c.prototype, "navigationMode", void 0);
                        a([g.property()], c.prototype, "view", void 0);
                        a([g.property()], c.prototype, "toggle", null);
                        return c = a([g.subclass("esri.widgets.NavigationToggleViewModel")], c)
                    }(g.declared(l))
                })
        }, "esri/widgets/Zoom": function () {
            define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper dojo/i18n!./Zoom/nls/Zoom ../core/accessorSupport/decorators ./Widget ./Zoom/IconButton ./Zoom/ZoomViewModel ./support/widget".split(" "), function (n, c, e, a, l, k, h, g, b, d) {
                return function (c) {
                    function f(a) {
                        a = c.call(this) || this;
                        a.iconClass = "esri-icon-zoom-in-magnifying-glass";
                        a.label = l.widgetLabel;
                        a.view = null;
                        a.viewModel = new b;
                        return a
                    }

                    e(f, c);
                    f.prototype.postInitialize = function () {
                        this._zoomInButton = new g({action: this.zoomIn, iconClass: "esri-icon-plus", title: l.zoomIn});
                        this._zoomOutButton = new g({
                            action: this.zoomOut,
                            iconClass: "esri-icon-minus",
                            title: l.zoomOut
                        })
                    };
                    Object.defineProperty(f.prototype, "layout", {
                        set: function (a) {
                            "horizontal" !== a && (a = "vertical");
                            this._set("layout", a)
                        }, enumerable: !0, configurable: !0
                    });
                    f.prototype.render = function () {
                        var a, b = this.viewModel, c = (a = {}, a["esri-zoom--horizontal"] =
                            "horizontal" === this.layout, a);
                        this._zoomInButton.enabled = "ready" === b.state && b.canZoomIn;
                        this._zoomOutButton.enabled = "ready" === b.state && b.canZoomOut;
                        return d.tsx("div", {class: this.classes("esri-zoom esri-widget", c)}, this._zoomInButton.render(), this._zoomOutButton.render())
                    };
                    f.prototype.zoomIn = function () {
                    };
                    f.prototype.zoomOut = function () {
                    };
                    a([k.property()], f.prototype, "iconClass", void 0);
                    a([k.property()], f.prototype, "label", void 0);
                    a([k.property({value: "vertical"}), d.renderable()], f.prototype, "layout",
                        null);
                    a([k.aliasOf("viewModel.view"), d.renderable()], f.prototype, "view", void 0);
                    a([k.property({type: b}), d.renderable(["viewModel.canZoomIn", "viewModel.canZoomOut", "viewModel.state"])], f.prototype, "viewModel", void 0);
                    a([k.aliasOf("viewModel.zoomIn")], f.prototype, "zoomIn", null);
                    a([k.aliasOf("viewModel.zoomOut")], f.prototype, "zoomOut", null);
                    return f = a([k.subclass("esri.widgets.Zoom")], f)
                }(k.declared(h))
            })
        }, "esri/widgets/Zoom/IconButton": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/accessorSupport/decorators ../Widget ../support/widget".split(" "),
                function (n, c, e, a, l, k, h) {
                    return function (c) {
                        function b() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a.enabled = !0;
                            a.iconClass = "";
                            a.title = "";
                            return a
                        }

                        e(b, c);
                        b.prototype.render = function () {
                            var a, b, c = this.enabled ? 0 : -1,
                                e = (a = {}, a["esri-disabled"] = !this.enabled, a["esri-interactive"] = this.enabled, a);
                            a = (b = {}, b[this.iconClass] = !!this.iconClass, b);
                            return h.tsx("div", {
                                bind: this,
                                class: this.classes("esri-widget--button esri-widget", e),
                                onclick: this._triggerAction,
                                onkeydown: this._triggerAction,
                                role: "button",
                                tabIndex: c,
                                title: this.title
                            }, h.tsx("span", {
                                "aria-hidden": "true",
                                role: "presentation",
                                class: this.classes("esri-icon", a)
                            }), h.tsx("span", {class: "esri-icon-font-fallback-text"}, this.title))
                        };
                        b.prototype._triggerAction = function () {
                            this.action.call(this)
                        };
                        a([l.property()], b.prototype, "action", void 0);
                        a([l.property(), h.renderable()], b.prototype, "enabled", void 0);
                        a([l.property({readOnly: !1}), h.renderable()], b.prototype, "iconClass", void 0);
                        a([l.property(), h.renderable()], b.prototype, "title", void 0);
                        a([h.accessibleHandler()],
                            b.prototype, "_triggerAction", null);
                        return b = a([l.subclass("esri.widgets.IconButton")], b)
                    }(l.declared(k))
                })
        }, "esri/widgets/Zoom/ZoomViewModel": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/accessorSupport/decorators ./ZoomConditions2D ./ZoomConditions3D".split(" "), function (n, c, e, a, l, k, h, g) {
                return function (b) {
                    function c(a) {
                        a = b.call(this, a) || this;
                        a.canZoomIn = null;
                        a.canZoomOut = null;
                        a.zoomIn = a.zoomIn.bind(a);
                        a.zoomOut = a.zoomOut.bind(a);
                        return a
                    }

                    e(c, b);
                    c.prototype.destroy = function () {
                        this.view = null
                    };
                    Object.defineProperty(c.prototype, "state", {
                        get: function () {
                            return this.get("view.ready") ? "ready" : "disabled"
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(c.prototype, "view", {
                        set: function (a) {
                            a ? "2d" === a.type ? this._zoomConditions = new h({view: a}) : "3d" === a.type && (this._zoomConditions = new g) : this._zoomConditions = null;
                            this._set("view", a)
                        }, enumerable: !0, configurable: !0
                    });
                    c.prototype.zoomIn = function () {
                        this.canZoomIn &&
                        this._zoomToFactor(.5)
                    };
                    c.prototype.zoomOut = function () {
                        this.canZoomOut && this._zoomToFactor(2)
                    };
                    c.prototype._zoomToFactor = function (a) {
                        if ("ready" === this.state) {
                            var b = this.view;
                            "3d" === this.view.type ? b.goTo({zoomFactor: 1 / a}) : b.goTo({scale: this.get("view.scale") * a})
                        }
                    };
                    a([k.property()], c.prototype, "_zoomConditions", void 0);
                    a([k.property({
                        aliasOf: "_zoomConditions.canZoomIn",
                        readOnly: !0
                    })], c.prototype, "canZoomIn", void 0);
                    a([k.property({aliasOf: "_zoomConditions.canZoomOut", readOnly: !0})], c.prototype, "canZoomOut",
                        void 0);
                    a([k.property({dependsOn: ["view.ready"], readOnly: !0})], c.prototype, "state", null);
                    a([k.property()], c.prototype, "view", null);
                    a([k.property()], c.prototype, "zoomIn", null);
                    a([k.property()], c.prototype, "zoomOut", null);
                    return c = a([k.subclass("esri.widgets.Zoom.ZoomViewModel")], c)
                }(k.declared(l))
            })
        }, "esri/widgets/Zoom/ZoomConditions2D": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/accessorSupport/decorators".split(" "),
                function (n, c, e, a, l, k) {
                    return function (c) {
                        function g() {
                            return null !== c && c.apply(this, arguments) || this
                        }

                        e(g, c);
                        Object.defineProperty(g.prototype, "canZoomIn", {
                            get: function () {
                                var a = this.get("view.scale"), c = this.get("view.constraints.effectiveMaxScale");
                                return 0 === c || a > c
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(g.prototype, "canZoomOut", {
                            get: function () {
                                var a = this.get("view.scale"), c = this.get("view.constraints.effectiveMinScale");
                                return 0 === c || a < c
                            }, enumerable: !0, configurable: !0
                        });
                        a([k.property({
                            dependsOn: ["view.ready",
                                "view.scale"], readOnly: !0
                        })], g.prototype, "canZoomIn", null);
                        a([k.property({
                            dependsOn: ["view.ready", "view.scale"],
                            readOnly: !0
                        })], g.prototype, "canZoomOut", null);
                        a([k.property()], g.prototype, "view", void 0);
                        return g = a([k.subclass("esri.widgets.Zoom.ZoomConditions2D")], g)
                    }(k.declared(l))
                })
        }, "esri/widgets/Zoom/ZoomConditions3D": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/accessorSupport/decorators".split(" "),
                function (n, c, e, a, l, k) {
                    return function (c) {
                        function g() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a.canZoomIn = !0;
                            a.canZoomOut = !0;
                            return a
                        }

                        e(g, c);
                        a([k.property({readOnly: !0})], g.prototype, "canZoomIn", void 0);
                        a([k.property({readOnly: !0})], g.prototype, "canZoomOut", void 0);
                        return g = a([k.subclass("esri.widgets.Zoom.ZoomConditions3D")], g)
                    }(k.declared(l))
                })
        }, "esri/views/2d/layers/GraphicsLayerView2D": function () {
            define("require exports ../../../core/tsSupport/extendsHelper ../../../core/tsSupport/decorateHelper ../../../core/Handles ../../../core/accessorSupport/decorators ./LayerView2D ./support/GraphicsView2D".split(" "),
                function (n, c, e, a, l, k, h, g) {
                    return function (b) {
                        function c() {
                            var a = null !== b && b.apply(this, arguments) || this;
                            a._handles = new l;
                            a.graphicsView = new g;
                            a.container = a.graphicsView.container;
                            return a
                        }

                        e(c, b);
                        c.prototype.hitTest = function (a, b) {
                            return this.graphicsView.hitTest(a, b)
                        };
                        c.prototype.attach = function () {
                            var a = this;
                            this.layer.createGraphicsController({layerView: this}).then(function (b) {
                                a._handles.add(a.layer.on("graphic-update", function (b) {
                                    return a.graphicsView.graphicUpdateHandler(b)
                                }));
                                a.graphicsView.view =
                                    a.view;
                                a.graphicsView.graphics = b.graphics
                            })
                        };
                        c.prototype.detach = function () {
                            this.graphicsView.graphics = null;
                            this._handles.removeAll()
                        };
                        c.prototype.update = function (a) {
                        };
                        c.prototype.moveStart = function () {
                        };
                        c.prototype.viewChange = function () {
                        };
                        c.prototype.moveEnd = function () {
                        };
                        return c = a([k.subclass("esri.views.2d.layers.GraphicsLayerView2D")], c)
                    }(k.declared(h))
                })
        }, "esri/views/2d/layers/LayerView2D": function () {
            define("require exports ../../../core/tsSupport/extendsHelper ../../../core/tsSupport/decorateHelper ../../../core/watchUtils ../../../core/accessorSupport/decorators ../../layers/LayerView".split(" "),
                function (n, c, e, a, l, k, h) {
                    return function (c) {
                        function b() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a.attached = !1;
                            a.lastUpdateId = -1;
                            a.moving = !1;
                            a.updateRequested = !1;
                            return a
                        }

                        e(b, c);
                        b.prototype.initialize = function () {
                            var a = this;
                            this.when(function () {
                                a.requestUpdate()
                            });
                            l.init(this, "suspended", function (b) {
                                a.container.visible = !b;
                                !b && a.updateRequested && a.view.requestLayerViewUpdate(a)
                            }, !0);
                            l.init(this, "fullOpacity", function (b) {
                                a.container.opacity = b
                            }, !0);
                            var b = function () {
                                this.notifyChange("rendering")
                            }.bind(this);
                            this.container.on("post-render", b);
                            this.container.on("will-render", b)
                        };
                        b.prototype.destroy = function () {
                            this.attached && (this.attached = !1, this.detach());
                            this.updateRequested = !1;
                            this.layer = null
                        };
                        Object.defineProperty(b.prototype, "rendering", {
                            get: function () {
                                return this.isRendering()
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(b.prototype, "updating", {
                            get: function () {
                                return !this.suspended && (!this.attached || this.updateRequested || this.isUpdating())
                            }, enumerable: !0, configurable: !0
                        });
                        b.prototype.requestUpdate =
                            function () {
                                this.updateRequested || (this.updateRequested = !0, this.suspended || this.view.requestLayerViewUpdate(this))
                            };
                        b.prototype.processUpdate = function (a) {
                            this.isFulfilled() && !this.isResolved() ? this.updateRequested = !1 : (this._set("updateParameters", a), this.updateRequested && !this.suspended && (this.updateRequested = !1, this.update(a)))
                        };
                        b.prototype.isUpdating = function () {
                            return !1
                        };
                        b.prototype.isRendering = function () {
                            return this.attached && (this.moving || this.container.renderRequested)
                        };
                        b.prototype.canResume =
                            function () {
                                var a = this.inherited(arguments), b = this.layer;
                                if (a && null != b.minScale && null != b.minScale) {
                                    var a = this.view.scale, c = b.minScale, b = b.maxScale, e = !c, g = !b;
                                    !e && a <= c && (e = !0);
                                    !g && a >= b && (g = !0);
                                    a = e && g
                                }
                                return a
                            };
                        a([k.property()], b.prototype, "attached", void 0);
                        a([k.property()], b.prototype, "container", void 0);
                        a([k.property()], b.prototype, "moving", void 0);
                        a([k.property({dependsOn: ["moving"]})], b.prototype, "rendering", null);
                        a([k.property({dependsOn: ["view.scale", "layer.minScale", "layer.maxScale"]})], b.prototype,
                            "suspended", void 0);
                        a([k.property({readOnly: !0})], b.prototype, "updateParameters", void 0);
                        a([k.property()], b.prototype, "updateRequested", void 0);
                        a([k.property({dependsOn: ["updateRequested", "attached"]})], b.prototype, "updating", null);
                        a([k.property()], b.prototype, "view", void 0);
                        return b = a([k.subclass("esri.views.2d.layers.LayerView2D")], b)
                    }(k.declared(h))
                })
        }, "esri/views/2d/layers/FeatureLayerView2D": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../core/tsSupport/paramHelper dojo/has ../../../Graphic ../../../core/Collection ../../../core/Error ../../../core/Handles ../../../core/promiseUtils ../../../core/accessorSupport/decorators ../../../layers/graphics/QueryEngine ../../../layers/graphics/controllers/support/controllerUtils ../engine/DOMContainer ../engine/webgl/rendererInfoUtils ./LayerView2D ./support/FeaturesView2D ../../layers/RefreshableLayerView".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u, r, x, v) {
                    function y(a) {
                        return a && null != a._proxy
                    }

                    function w(a) {
                        return a && null != a.update
                    }

                    return function (c) {
                        function l() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a._handles = new d;
                            a.container = new t;
                            return a
                        }

                        e(l, c);
                        Object.defineProperty(l.prototype, "labelsVisible", {
                            get: function () {
                                return !this.suspended && this.layer.labelingInfo && this.layer.labelsVisible
                            }, enumerable: !0, configurable: !0
                        });
                        l.prototype.highlight = function (a, b) {
                            var c = this;
                            b = this.featuresView;
                            var e;
                            a instanceof
                            h ? e = [a.getAttribute(this.layer.objectIdField)] : "number" === typeof a ? e = [a] : g.isCollection(a) ? e = a.map(function (a) {
                                return a.getAttribute(c.layer.objectIdField)
                            }).toArray() : Array.isArray(a) && 0 < a.length && (e = "number" === typeof a[0] ? a : a.map(function (a) {
                                return a.getAttribute(c.layer.objectIdField)
                            }));
                            return e && e.length && b && null != b.highlight ? b.highlight(e) : {
                                remove: function () {
                                }
                            }
                        };
                        l.prototype.queryGraphics = function () {
                            return this._queryEngine ? this._queryEngine.queryFeatures() : this._rejectQuery()
                        };
                        l.prototype.queryFeatures =
                            function (a) {
                                return y(this.featuresView) ? this.featuresView.queryFeatures(a) : this._queryEngine ? this._queryEngine.queryFeatures(a) : this._rejectQuery()
                            };
                        l.prototype.queryFeaturesJSON = function (a) {
                            return y(this.featuresView) ? this.featuresView.queryFeaturesJSON(a) : this._queryEngine ? this._queryEngine.queryFeatures(a).then(function (a) {
                                return a.toJSON()
                            }) : this._rejectQuery()
                        };
                        l.prototype.queryObjectIds = function (a) {
                            return y(this.featuresView) ? this.featuresView.queryObjectIds(a) : this._queryEngine ? this._queryEngine.queryObjectIds(a) :
                                this._rejectQuery()
                        };
                        l.prototype.queryFeatureCount = function (a) {
                            return y(this.featuresView) ? this.featuresView.queryFeatureCount(a) : this._queryEngine ? this._queryEngine.queryFeatureCount(a) : this._rejectQuery()
                        };
                        l.prototype.queryExtent = function (a) {
                            return y(this.featuresView) ? this.featuresView.queryExtent(a) : this._queryEngine ? this._queryEngine.queryExtent(a) : this._rejectQuery()
                        };
                        l.prototype.hitTest = function (a, b) {
                            return this.suspended || !this.featuresView ? f.resolve() : this.featuresView.hitTest(a, b)
                        };
                        l.prototype.update =
                            function (a) {
                                w(this.controller) ? this.controller.update(a) : w(this.featuresView) && this.featuresView.update(a)
                            };
                        l.prototype.attach = function () {
                            var a = this;
                            this._canUseWebGL() ? f.create(function (a) {
                                return n(["./FeatureLayerView2DWebGL"], a)
                            }).then(function (b) {
                                if (a.attached) return (new b({layer: a.layer, view: a.view})).when()
                            }).then(function (b) {
                                a.featuresView = b;
                                a.container.addChild(b.container);
                                b.attached = !0;
                                b.attach()
                            }) : this.layer.createGraphicsController({layerView: this}).then(function (b) {
                                if (a.attached) {
                                    a._set("controller",
                                        b);
                                    a.requestUpdate();
                                    var c = new x;
                                    c.mapView = a.view;
                                    c.graphics = b.graphics;
                                    c.layer = a.layer;
                                    c.renderer = a.layer.renderer;
                                    a._handles.add(a.layer.watch("renderer", function () {
                                        c.renderer = a.layer.renderer
                                    }));
                                    a._handles.add(a.layer.on("graphic-update", function (a) {
                                        return c.graphicUpdateHandler(a)
                                    }));
                                    a.featuresView = c;
                                    a._queryEngine = new q({
                                        layer: a.layer,
                                        dataSpatialReference: a.view.spatialReference,
                                        objectIdField: a.layer.objectIdField
                                    });
                                    a._queryEngine.features = b.graphics;
                                    a._queryEngine.objectIdField = a.layer.objectIdField;
                                    a.container.addChild(c.container)
                                }
                            })
                        };
                        l.prototype.detach = function () {
                            this.container.removeAllChildren();
                            this._handles.removeAll();
                            this.featuresView && (this.featuresView.destroy(), this.featuresView = null);
                            this.controller && (this.controller.destroy && this.controller.destroy(), this._set("controller", null))
                        };
                        l.prototype.moveStart = function () {
                            this.requestUpdate()
                        };
                        l.prototype.viewChange = function () {
                            this.requestUpdate()
                        };
                        l.prototype.moveEnd = function () {
                            this.requestUpdate()
                        };
                        l.prototype.takeScreenshot = function (a,
                                                               c) {
                            return y(this.featuresView) && this.featuresView.tileRenderer.featuresView ? this.featuresView.tileRenderer.featuresView._stage.takeScreenshot(a) : f.reject(new b("featurelayerview:screenshot-unavailable", "takeScreenshot() is not available"))
                        };
                        l.prototype.doRefresh = function () {
                            this.updateRequested || this.suspended || this.controller && p.isRefreshable(this.controller.activeController) && this.controller.activeController.refresh()
                        };
                        l.prototype.isUpdating = function () {
                            return null == this.featuresView || !0 === this.get("controller.updating") ||
                                !0 === this.featuresView.updateRequested || w(this.featuresView) && this.featuresView.updating
                        };
                        l.prototype._canUseWebGL = function () {
                            return k("esri-featurelayer-webgl") && k("esri-webgl") && u.isRendererWebGLCompatible(this.layer.renderer) && (this.layer.capabilities.query.supportsQuantization && ("polygon" !== this.layer.geometryType || this.layer.capabilities.query.supportsCentroid) || this.layer.source && "esri.layers.graphics.sources.CSVSource" === this.layer.source.declaredClass)
                        };
                        l.prototype._rejectQuery = function () {
                            return f.reject(new b("FeatureLayerView2D",
                                "Not ready to execute query"))
                        };
                        a([m.property({readOnly: !0})], l.prototype, "controller", void 0);
                        a([m.property()], l.prototype, "featuresView", void 0);
                        a([m.property({dependsOn: ["suspended", "layer.labelingInfo", "layer.labelsVisible"]})], l.prototype, "labelsVisible", null);
                        a([m.property({dependsOn: ["controller.updating", "featuresView", "featuresView.updating"]})], l.prototype, "updating", void 0);
                        return l = a([m.subclass("esri.views.2d.layers.FeatureLayerView2D")], l)
                    }(m.declared(r, v))
                })
        }, "esri/layers/graphics/controllers/support/controllerUtils": function () {
            define(["require",
                "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.isRefreshable = function (c) {
                    return c && c.refresh
                }
            })
        }, "esri/views/2d/engine/webgl/rendererInfoUtils": function () {
            define("require exports ../../../../core/tsSupport/assignHelper ../../../../Graphic ../../../../arcade/Feature ../../../../support/arcadeUtils ./enums ./visualVariablesUtils".split(" "), function (n, c, e, a, l, k, h, g) {
                function b(b, c, g) {
                    if (!b) return null;
                    var f = 0, h = {};
                    b = b.clone();
                    var m = b.visualVariables, l = null;
                    if ("simple" !==
                        b.type) {
                        var n = b.valueExpression;
                        if (!b.field && n) {
                            var q = "$$fake" + f++, y = k.createFunction(n);
                            h[q] = function (a, b) {
                                d.repurposeFromGraphicLikeObject(a.geometry, a.attributes, g);
                                return k.executeFunction(y, {
                                    vars: {$feature: d, $view: k.getViewInfo(b)},
                                    spatialReference: c
                                })
                            };
                            b.field = q;
                            b.valueExpression = null;
                            l = function (b, c) {
                                c.attributes[q] = h[q](c);
                                return b.valueExpression ? b.getSymbol(a.fromJSON(c)) : b.getSymbol(c)
                            }
                        }
                    }
                    m && (b.visualVariables = m.map(function (a) {
                        if (a.normalizationField) {
                            var b = a.field, m = a.normalizationField,
                                l = "$$fake" + f++;
                            h[l] = function (a, c) {
                                return a.attributes[b] / a.attributes[m]
                            };
                            a = e({}, a);
                            a.field = l;
                            delete a.normalizationField;
                            return a
                        }
                        if (a.valueExpression && "$view.scale" !== a.valueExpression) {
                            var n = a.valueExpression, l = "$$fake" + f++, p = k.createFunction(n);
                            h[l] = function (a, b) {
                                d.repurposeFromGraphicLikeObject(a.geometry, a.attributes, g);
                                return k.executeFunction(p, {
                                    vars: {$feature: d, $view: k.getViewInfo(b)},
                                    spatialReference: c
                                })
                            };
                            a = e({}, a);
                            a.field = l;
                            delete a.valueExpression
                        }
                        return a
                    }));
                    return {
                        renderer: b, normalizingFunctions: h,
                        getSymbolFunction: l
                    }
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                var d = new l;
                c.createRendererInfo = function (a, c, e) {
                    var d = (c = b(a, c, e) || {
                        renderer: null,
                        normalizingFunctions: null,
                        getSymbolFunction: null
                    }, c.normalizingFunctions), f = c && c.getSymbolFunction;
                    a = c && c.renderer || a;
                    c = g.convertVisualVariables(a.visualVariables);
                    return {
                        renderer: a, vvFields: c.vvFields, vvRanges: c.vvRanges, getValue: function (a, b) {
                            var c = d[b];
                            return c ? c(a) : a.attributes[b]
                        }, getSymbol: function (a) {
                            return f ? f(this.renderer, a) : this.renderer.getSymbol ?
                                this.renderer.getSymbol.call(this.renderer, a) : null
                        }
                    }
                };
                c.getNormalizedRenderer = function (a, c, e) {
                    return (c = b(a, c, e) || {
                        renderer: null,
                        normalizingFunctions: null,
                        getSymbolFunction: null
                    }, c.renderer) || a
                };
                c.getSymbol = function (a, b) {
                    return a.getSymbol(b)
                };
                c.isRendererWebGLCompatible = function (a) {
                    if (!a || -1 === ["simple", "class-breaks", "unique-value", "heatmap"].indexOf(a.type)) return !1;
                    if (a.visualVariables) {
                        var b = 0;
                        for (a = a.visualVariables; b < a.length; b++) {
                            var c = a[b];
                            switch (c.type) {
                                case "color":
                                case "opacity":
                                    if (c.stops &&
                                        8 < c.stops.length) return !1;
                                    break;
                                case "size":
                                    if (g.getTypeOfSizeVisualVariable(c) === h.WGLVVFlag.SIZE_FIELD_STOPS && c.stops && 6 < c.stops.length) return !1
                            }
                        }
                    }
                    return !0
                }
            })
        }, "esri/views/2d/engine/webgl/enums": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                (function (c) {
                    c[c.FILL = 0] = "FILL";
                    c[c.LINE = 1] = "LINE";
                    c[c.MARKER = 2] = "MARKER";
                    c[c.TEXT = 3] = "TEXT";
                    c[c.LABEL = 4] = "LABEL";
                    c[c.NONE = 5] = "NONE";
                    c[c.UNKNOWN = 6] = "UNKNOWN";
                    c[c.COUNT = 7] = "COUNT"
                })(c.WGLGeometryType || (c.WGLGeometryType =
                    {}));
                (function (c) {
                    c[c.SUCCEEDED = 0] = "SUCCEEDED";
                    c[c.FAILED_OUT_OF_MEMORY = 1] = "FAILED_OUT_OF_MEMORY"
                })(c.WGLGeometryTransactionStatus || (c.WGLGeometryTransactionStatus = {}));
                (function (c) {
                    c[c.NONE = 0] = "NONE";
                    c[c.FILL = 1] = "FILL";
                    c[c.LINE = 2] = "LINE";
                    c[c.MARKER = 4] = "MARKER";
                    c[c.TEXT = 8] = "TEXT";
                    c[c.LABEL = 16] = "LABEL";
                    c[c.LABEL_ALPHA = 32] = "LABEL_ALPHA";
                    c[c.HITTEST = 64] = "HITTEST";
                    c[c.HIGHLIGHT = 128] = "HIGHLIGHT";
                    c[c.CLIP = 256] = "CLIP";
                    c[c.DEBUG = 512] = "DEBUG";
                    c[c.NUM_DRAW_PHASES = 12] = "NUM_DRAW_PHASES"
                })(c.WGLDrawPhase || (c.WGLDrawPhase =
                    {}));
                (function (c) {
                    c[c.SIZE = 0] = "SIZE";
                    c[c.COLOR = 1] = "COLOR";
                    c[c.OPACITY = 2] = "OPACITY";
                    c[c.ROTATION = 3] = "ROTATION"
                })(c.VVType || (c.VVType = {}));
                (function (c) {
                    c[c.NONE = 0] = "NONE";
                    c[c.OPACITY = 1] = "OPACITY";
                    c[c.COLOR = 2] = "COLOR";
                    c[c.ROTATION = 4] = "ROTATION";
                    c[c.SIZE_MINMAX_VALUE = 8] = "SIZE_MINMAX_VALUE";
                    c[c.SIZE_SCALE_STOPS = 16] = "SIZE_SCALE_STOPS";
                    c[c.SIZE_FIELD_STOPS = 32] = "SIZE_FIELD_STOPS";
                    c[c.SIZE_UNIT_VALUE = 64] = "SIZE_UNIT_VALUE"
                })(c.WGLVVFlag || (c.WGLVVFlag = {}));
                (function (c) {
                    c[c.MINMAX_TARGETS_OUTLINE = 128] = "MINMAX_TARGETS_OUTLINE";
                    c[c.SCALE_TARGETS_OUTLINE = 256] = "SCALE_TARGETS_OUTLINE";
                    c[c.FIELD_TARGETS_OUTLINE = 512] = "FIELD_TARGETS_OUTLINE";
                    c[c.UNIT_TARGETS_OUTLINE = 1024] = "UNIT_TARGETS_OUTLINE"
                })(c.WGLVVTarget || (c.WGLVVTarget = {}));
                (function (c) {
                    c[c.UNKNOWN = 0] = "UNKNOWN";
                    c[c.BUTT = 1] = "BUTT";
                    c[c.ROUND = 2] = "ROUND";
                    c[c.SQUARE = 3] = "SQUARE"
                })(c.CapType || (c.CapType = {}));
                (function (c) {
                    c[c.UNKNOWN = 0] = "UNKNOWN";
                    c[c.MITER = 1] = "MITER";
                    c[c.BEVEL = 2] = "BEVEL";
                    c[c.ROUND = 3] = "ROUND"
                })(c.JoinType || (c.JoinType = {}));
                (function (c) {
                    c.SIMPLE_MARKER = "esriSMS";
                    c.SIMPLE_LINE = "esriSLS";
                    c.SIMPLE_FILL = "esriSFS";
                    c.PICTURE_MARKER = "esriPMS";
                    c.PICTURE_FILL = "esriPFS";
                    c.TEXT = "esriTS"
                })(c.EsriSymbolType || (c.EsriSymbolType = {}));
                (function (c) {
                    c.SIMPLE_MARKER = "simple-marker";
                    c.SIMPLE_LINE = "simple-line";
                    c.SIMPLE_FILL = "simple-fill";
                    c.PICTURE_MARKER = "picture-marker";
                    c.PICTURE_FILL = "picture-fill";
                    c.TEXT = "text"
                })(c.EsriSymbolTypeKebab || (c.EsriSymbolTypeKebab = {}))
            })
        }, "esri/views/2d/engine/webgl/visualVariablesUtils": function () {
            define("require exports ../../../../core/screenUtils ./color ./enums ./Utils ../../../3d/layers/support/FastSymbolUpdates".split(" "),
                function (n, c, e, a, l, k, h) {
                    function g(a) {
                        return k.isNumber(a.minDataValue) && k.isNumber(a.maxDataValue) && null != a.minSize && null != a.maxSize ? l.WGLVVFlag.SIZE_MINMAX_VALUE : (a.expression && "view.scale" === a.expression || a.valueExpression && "$view.scale" === a.valueExpression) && Array.isArray(a.stops) ? l.WGLVVFlag.SIZE_SCALE_STOPS : (null != a.field || a.expression && "view.scale" !== a.expression || a.valueExpression && "$view.scale" !== a.valueExpression) && Array.isArray(a.stops) ? l.WGLVVFlag.SIZE_FIELD_STOPS : (null != a.field || a.expression &&
                            "view.scale" !== a.expression || a.valueExpression && "$view.scale" !== a.valueExpression) && null != a.valueUnit ? l.WGLVVFlag.SIZE_UNIT_VALUE : l.WGLVVFlag.NONE
                    }

                    function b(a) {
                        return {value: a.value, size: e.toPt(a.size)}
                    }

                    function d(a) {
                        return a.map(function (a) {
                            return b(a)
                        })
                    }

                    function f(a) {
                        return "string" === typeof a || "number" === typeof a ? e.toPt(a) : {
                            type: "size",
                            expression: a.expression,
                            stops: d(a.stops)
                        }
                    }

                    function m(a) {
                        var b = {values: [0, 0, 0, 0, 0, 0, 0, 0], opacities: [0, 0, 0, 0, 0, 0, 0, 0]};
                        if (k.isString(a.field)) if (a.stops) {
                            if (8 < a.stops.length) return null;
                            a = a.stops;
                            for (var c = 0; 8 > c; ++c) {
                                var d = a[Math.min(c, a.length - 1)];
                                b.values[c] = d.value;
                                b.opacities[c] = d.opacity
                            }
                        } else if (a.opacityValues) {
                            if (!k.isDefined(a.minDataValue) || !k.isDefined(a.maxDataValue) || 2 !== a.opacityValues.length) return null;
                            b.values[0] = a.minDataValue;
                            b.opacities[0] = a.opacityValues[0];
                            b.values[1] = a.maxDataValue;
                            b.opacities[1] = a.opacityValues[1];
                            for (c = 2; 8 > c; ++c) b.values[c] = a.maxDataValue, b.opacities[c] = a.opacityValues[1]
                        } else return null; else if (a.stops && 0 <= a.stops.length || a.opacityValues &&
                            0 <= a.opacityValues.length) for (a = a.stops && 0 <= a.stops.length ? a.stops[0].opacity : a.opacityValues[0], c = 0; 8 > c; c++) b.values[c] = Infinity, b.opacities[c] = a; else return null;
                        return b
                    }

                    Object.defineProperty(c, "__esModule", {value: !0});
                    c.getTypeOfSizeVisualVariable = g;
                    c.getVisualVariableSizeValueRepresentationRatio = function (a, b) {
                        if (!a || !b) return a;
                        switch (b) {
                            case "radius":
                            case "distance":
                                return 2 * a;
                            case "area":
                                return Math.sqrt(a)
                        }
                        return a
                    };
                    c.stopToSizeStop = b;
                    c.normalizeSizeStops = d;
                    c.normalizeSizeElement = f;
                    c.getVisualVariablesFields =
                        function (a) {
                            var b = a && 0 < a.length ? {} : null;
                            b && a.forEach(function (a) {
                                var c = a.type;
                                a.field && (b[c] = a.field)
                            });
                            return b
                        };
                    c.convertVisualVariables = function (b) {
                        var c = b && 0 < b.length ? {} : null, k = c ? {} : null;
                        if (!c) return {vvFields: c, vvRanges: k};
                        for (var n = 0; n < b.length; n++) {
                            var r = b[n], q = r.type;
                            r.field && (c[q] = r.field);
                            if ("size" === q) {
                                k.size || (k.size = {});
                                var v = r;
                                switch (g(v)) {
                                    case l.WGLVVFlag.SIZE_MINMAX_VALUE:
                                        k.size.minMaxValue = {
                                            minDataValue: v.minDataValue,
                                            maxDataValue: v.maxDataValue,
                                            minSize: f(v.minSize),
                                            maxSize: f(v.maxSize)
                                        };
                                        break;
                                    case l.WGLVVFlag.SIZE_SCALE_STOPS:
                                        k.size.scaleStops = {stops: d(v.stops)};
                                        break;
                                    case l.WGLVVFlag.SIZE_FIELD_STOPS:
                                        for (var r = [], q = [], v = d(v.stops), y = v.length, w = 0; 6 > w; w++) {
                                            var z = v[Math.min(w, y - 1)];
                                            r.push(z.value);
                                            q.push(e.pt2px(z.size))
                                        }
                                        k.size.fieldStops = {values: r, sizes: q};
                                        break;
                                    case l.WGLVVFlag.SIZE_UNIT_VALUE:
                                        k.size.unitValue = {
                                            unit: v.valueUnit,
                                            valueRepresentation: v.valueRepresentation
                                        }
                                }
                            } else if ("color" === q) for (r = h.convertVisualVariables([r], {
                                modelSize: null,
                                symbolSize: null,
                                unitInMeters: 1,
                                transformation: null
                            }),
                                                               k.color = r.color, w = 0; 32 > w; w += 4) a.premultiplyAlpha(k.color.colors, w, !0); else "opacity" === q ? k.opacity = m(r) : "rotation" === q && (k.rotation = {type: r.rotationType})
                        }
                        return {vvFields: c, vvRanges: k}
                    }
                })
        }, "esri/views/2d/engine/webgl/color": function () {
            define(["require", "exports", "./number"], function (n, c, e) {
                function a(a, c) {
                    Array.isArray(c) ? (a[0] = c[0], a[1] = c[1], a[2] = c[2], a[3] = c[3]) : (a[0] = c.r, a[1] = c.g, a[2] = c.b, a[3] = c.a);
                    return a
                }

                function l(a, c, b) {
                    void 0 === c && (c = 0);
                    void 0 === b && (b = !1);
                    var d = a[c + 3];
                    a[c + 0] *= d;
                    a[c + 1] *= d;
                    a[c +
                    2] *= d;
                    b || (a[c + 3] *= 255);
                    return a
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                c.white = [255, 255, 255, 1];
                var k = [0, 0, 0, 0];
                c.premultiplyAlpha = l;
                c.copyAndPremultiply = function (c) {
                    return l(a([], c))
                };
                c.premultiplyAlphaUint32 = function (c) {
                    l(a(k, c));
                    return e.i8888to32(k[0], k[1], k[2], k[3])
                };
                c.premultiplyAlphaRGBA = function (a) {
                    var c = a.a;
                    return e.i8888to32(a.r * c, a.g * c, a.b * c, 255 * c)
                }
            })
        }, "esri/views/2d/engine/webgl/number": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule",
                    {value: !0});
                var e = new Float32Array(1), a = new Uint32Array(e.buffer);
                c.nextHighestPowerOfTwo = function (a) {
                    a--;
                    a |= a >> 1;
                    a |= a >> 2;
                    a |= a >> 4;
                    a |= a >> 8;
                    a |= a >> 16;
                    a++;
                    return a
                };
                c.toUint32 = function (c) {
                    e[0] = c;
                    return a[0]
                };
                c.i1616to32 = function (a, c) {
                    return 65535 & a | c << 16
                };
                c.i8888to32 = function (a, c, e, g) {
                    return a & 255 | (c & 255) << 8 | (e & 255) << 16 | g << 24
                };
                c.i8816to32 = function (a, c, e) {
                    return a & 255 | (c & 255) << 8 | e << 16
                };
                c.numTo32 = function (a) {
                    return a | 0
                }
            })
        }, "esri/views/2d/engine/webgl/Utils": function () {
            define("require exports ../../../../arcade/Dictionary ../../../../arcade/Feature ../../../../core/Error ../../../../core/Logger ../../../../core/screenUtils ../../../../support/arcadeUtils ./color ./enums ./SymbolProperties".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f) {
                    function m(a) {
                        for (var b = {}, c = 0; c < a.length; c++) {
                            var d = a[c];
                            b[d.name] = d.strideInBytes
                        }
                        return b
                    }

                    function q(a) {
                        switch (a) {
                            case d.WGLGeometryType.MARKER:
                                return B;
                            case d.WGLGeometryType.FILL:
                                return A;
                            case d.WGLGeometryType.LINE:
                                return C;
                            case d.WGLGeometryType.TEXT:
                                return D;
                            case d.WGLGeometryType.LABEL:
                                return E
                        }
                        return null
                    }

                    function p(a) {
                        switch (a) {
                            case "esriSMS":
                                return "simple-marker";
                            case "esriPMS":
                                return "picture-marker";
                            case "esriSLS":
                                return "simple-line";
                            case "esriPLS":
                                return "picture-line";
                            case "esriSFS":
                                return "simple-fill";
                            case "esriPFS":
                                return "picture-fill";
                            case "esriTS":
                                return "text"
                        }
                        return a
                    }

                    function t(a) {
                        if (a = p(a.type)) {
                            switch (a) {
                                case "simple-marker":
                                case "picture-marker":
                                    return !0;
                                case "CIMPointSymbol":
                                    return !0
                            }
                            return !1
                        }
                    }

                    function u(a) {
                        if (a = p(a.type)) {
                            switch (a) {
                                case "simple-fill":
                                case "picture-fill":
                                    return !0;
                                case "CIMPolygonSymbol":
                                    return !0
                            }
                            return !1
                        }
                    }

                    function r(a) {
                        if (a = p(a.type)) {
                            switch (a) {
                                case "simple-line":
                                case "picture-line":
                                    return !0;
                                case "CIMLineSymbol":
                                    return !0
                            }
                            return !1
                        }
                    }

                    function x(a) {
                        if (a =
                                p(a.type)) {
                            switch (a) {
                                case "text":
                                    return !0;
                                case "CIMTextSymbol":
                                    return !0
                            }
                            return !1
                        }
                    }

                    function v(a) {
                        return a && a.length || 0
                    }

                    function y(a) {
                        return "string" === typeof a
                    }

                    Object.defineProperty(c, "__esModule", {value: !0});
                    var w, z = k.getLogger("esri.views.2d.engine.webgl.Utils");
                    c.C_HITTEST_SEARCH_SIZE = 4;
                    c.C_VBO_GEOMETRY = "geometry";
                    c.C_VBO_PERINSTANCE = "per_instance";
                    c.C_VBO_PERINSTANCE_VV = "per_instance_vv";
                    c.C_VBO_VISIBILITY = "visibility";
                    c.C_VBO_VISIBILITY_RANGE = "visibilityRange";
                    c.C_ICON_VERTEX_DEF = [{
                        name: c.C_VBO_GEOMETRY,
                        strideInBytes: 24, divisor: 0
                    }];
                    c.C_ICON_VERTEX_DEF_VV = [{name: c.C_VBO_GEOMETRY, strideInBytes: 40, divisor: 0}];
                    c.C_ICON_HEATMAP = [{name: c.C_VBO_GEOMETRY, strideInBytes: 28, divisor: 0}];
                    c.C_FILL_VERTEX_DEF = [{name: c.C_VBO_GEOMETRY, strideInBytes: 24, divisor: 0}];
                    c.C_FILL_VERTEX_DEF_VV = [{name: c.C_VBO_GEOMETRY, strideInBytes: 32, divisor: 0}];
                    c.C_LINE_VERTEX_DEF = [{name: c.C_VBO_GEOMETRY, strideInBytes: 32, divisor: 0}];
                    c.C_LINE_VERTEX_DEF_VV = [{name: c.C_VBO_GEOMETRY, strideInBytes: 44, divisor: 0}];
                    c.C_TEXT_VERTEX_DEF = [{
                        name: c.C_VBO_GEOMETRY,
                        strideInBytes: 20, divisor: 0
                    }, {name: c.C_VBO_VISIBILITY, strideInBytes: 1, divisor: 0}];
                    c.C_TEXT_VERTEX_DEF_VV = [{
                        name: c.C_VBO_GEOMETRY,
                        strideInBytes: 36,
                        divisor: 0
                    }, {name: c.C_VBO_VISIBILITY, strideInBytes: 1, divisor: 0}];
                    c.C_LABEL_VERTEX_DEF = [{
                        name: c.C_VBO_GEOMETRY,
                        strideInBytes: 20,
                        divisor: 0
                    }, {name: c.C_VBO_VISIBILITY, strideInBytes: 1, divisor: 0}, {
                        name: c.C_VBO_VISIBILITY_RANGE,
                        strideInBytes: 2,
                        divisor: 0
                    }];
                    c.C_ICON_STRIDE_SPEC = m(c.C_ICON_VERTEX_DEF);
                    c.C_ICON_STRIDE_SPEC_VV = m(c.C_ICON_VERTEX_DEF_VV);
                    c.C_ICON_STRIDE_SPEC_HEATMAP =
                        m(c.C_ICON_HEATMAP);
                    c.C_FILL_STRIDE_SPEC = m(c.C_FILL_VERTEX_DEF);
                    c.C_FILL_STRIDE_SPEC_VV = m(c.C_FILL_VERTEX_DEF_VV);
                    c.C_LINE_STRIDE_SPEC = m(c.C_LINE_VERTEX_DEF);
                    c.C_LINE_STRIDE_SPEC_VV = m(c.C_LINE_VERTEX_DEF_VV);
                    c.C_TEXT_STRIDE_SPEC = m(c.C_TEXT_VERTEX_DEF);
                    c.C_TEXT_STRIDE_SPEC_VV = m(c.C_TEXT_VERTEX_DEF_VV);
                    c.C_LABEL_STRIDE_SPEC = m(c.C_LABEL_VERTEX_DEF);
                    c.getStrides = function (a, b, e) {
                        void 0 === e && (e = !1);
                        switch (a) {
                            case d.WGLGeometryType.MARKER:
                                return b ? c.C_ICON_STRIDE_SPEC_VV : e ? c.C_ICON_STRIDE_SPEC_HEATMAP : c.C_ICON_STRIDE_SPEC;
                            case d.WGLGeometryType.FILL:
                                return b ? c.C_FILL_STRIDE_SPEC_VV : c.C_FILL_STRIDE_SPEC;
                            case d.WGLGeometryType.LINE:
                                return b ? c.C_LINE_STRIDE_SPEC_VV : c.C_LINE_STRIDE_SPEC;
                            case d.WGLGeometryType.TEXT:
                                return b ? c.C_TEXT_STRIDE_SPEC_VV : c.C_TEXT_STRIDE_SPEC;
                            case d.WGLGeometryType.LABEL:
                                return c.C_LABEL_STRIDE_SPEC
                        }
                        return null
                    };
                    var B = [c.C_VBO_GEOMETRY], A = [c.C_VBO_GEOMETRY], C = [c.C_VBO_GEOMETRY],
                        D = [c.C_VBO_GEOMETRY, c.C_VBO_VISIBILITY],
                        E = [c.C_VBO_GEOMETRY, c.C_VBO_VISIBILITY, c.C_VBO_VISIBILITY_RANGE];
                    c.getNamedBuffers =
                        q;
                    c.getSymbolGeometryType = function (a) {
                        return t(a) ? d.WGLGeometryType.MARKER : r(a) ? d.WGLGeometryType.LINE : u(a) ? d.WGLGeometryType.FILL : x(a) ? d.WGLGeometryType.TEXT : d.WGLGeometryType.UNKNOWN
                    };
                    c.normalizeSymbolType = p;
                    c.isMarkerSymbol = t;
                    c.isFillSymbol = u;
                    c.isLineSymbol = r;
                    c.isPictureSymbol = function (a) {
                        if (a = p(a.type)) switch (a) {
                            case "picture-marker":
                            case "picture-line":
                            case "picture-fill":
                                return !0
                        }
                        return !1
                    };
                    c.isTextSymbol = x;
                    c.getTextProperties = function (a) {
                        return f.TextProperties.pool.acquire(a.color ? b.copyAndPremultiply(a.color) :
                            [255, 255, 255, 255], a.haloColor ? b.copyAndPremultiply(a.haloColor) : [255, 255, 255, 255], h.pt2px(a.haloSize), h.pt2px(a.font.size), a.angle * Math.PI / 180, a.xoffset / a.font.size, a.yoffset / a.font.size, "left" === a.horizontalAlignment ? 0 : "right" === a.horizontalAlignment ? 1 : .5, "top" === a.verticalAlignment ? 0 : "bottom" === a.verticalAlignment ? 1 : .5)
                    };
                    c.isSameUniformValue = function (a, b) {
                        return !1
                    };
                    c.isSameMaterialInfo = function (a, b) {
                        if (a.materialKey !== b.materialKey || v(a.texBindingInfo) !== v(b.texBindingInfo) || v(a.materialParams) !==
                            v(b.materialParams)) return !1;
                        for (var c = a.texBindingInfo.length, d = 0; d < c; ++d) {
                            var e = a.texBindingInfo[d], f = b.texBindingInfo[d];
                            if (e.unit !== f.unit || e.pageId !== f.pageId || e.semantic !== f.semantic) return !1
                        }
                        a = a.materialParams.length;
                        for (d = 0; d < a;) return !1;
                        return !0
                    };
                    c.serializeString = function (a, b, c) {
                        for (var d = 0, e = a.length, f = 0; f < e; ++f) b && (b[c + d] = a.charCodeAt(f)), ++d;
                        b && (b[c + d] = 0);
                        ++d;
                        return d
                    };
                    c.deserializeString = function (a, b, c) {
                        var d = 0;
                        a.s = "";
                        for (var e = !0; e;) {
                            var f = b[c + d];
                            ++d;
                            0 !== f ? a.s += String.fromCharCode(f) :
                                e = !1
                        }
                        return d
                    };
                    c.isDefined = function (a) {
                        return null !== a && void 0 !== a
                    };
                    c.isNumber = function (a) {
                        return "number" === typeof a
                    };
                    c.isString = y;
                    c.isStringOrNull = function (a) {
                        return null == a || y(a)
                    };
                    c.lerp = function (a, b, c) {
                        return a + (b - a) * c
                    };
                    n = function () {
                        function a() {
                            this._arr = [];
                            this._push = this._push.bind(this)
                        }

                        a.prototype._push = function (a, b) {
                            this._arr.push(b)
                        };
                        a.prototype.getKeys = function (a) {
                            this._arr.length = 0;
                            a && a.forEach(this._push);
                            return this._arr
                        };
                        return a
                    }();
                    c.KeysGetter = n;
                    n = function () {
                        function a() {
                            this._arr =
                                [];
                            this._push = this._push.bind(this)
                        }

                        a.prototype._push = function (a, b) {
                            this._arr.push(a)
                        };
                        a.prototype.getValues = function (a) {
                            this._arr.length = 0;
                            a && a.forEach(this._push);
                            return this._arr
                        };
                        return a
                    }();
                    c.ValuesGetter = n;
                    c.getCapType = function (a) {
                        switch (a) {
                            case "butt":
                                return d.CapType.BUTT;
                            case "round":
                                return d.CapType.ROUND;
                            case "square":
                                return d.CapType.SQUARE;
                            default:
                                return z.error(new l("mapview-invalid-type", "Cap type " + a + " is not a valid option. Defaulting to round")), d.CapType.ROUND
                        }
                    };
                    c.getJoinType =
                        function (a) {
                            switch (a) {
                                case "miter":
                                    return d.JoinType.MITER;
                                case "bevel":
                                    return d.JoinType.BEVEL;
                                case "round":
                                    return d.JoinType.ROUND;
                                default:
                                    return z.error(new l("mapview-invalid-type", "Join type " + a + " is not a valid option. Defaulting to round")), d.JoinType.ROUND
                            }
                        };
                    c.getVVType = function (a) {
                        switch (a) {
                            case "opacity":
                                return d.VVType.OPACITY;
                            case "color":
                                return d.VVType.COLOR;
                            case "rotation":
                                return d.VVType.ROTATION;
                            case "size":
                                return d.VVType.SIZE;
                            default:
                                return z.error("Cannot interpret unknown vv: " +
                                    a), null
                        }
                    };
                    c.createArcadeFunction = function (b, c) {
                        var d = b.spatialReference, f = b.layer, h = g.createFunction(b.valueExpression), k = new a;
                        return function (a, b) {
                            k.repurposeFromGraphicLikeObject(a.geometry, a.attributes, f);
                            a = b && new e({viewingMode: b.viewingMode, scale: b.scale});
                            a = g.executeFunction(h, {vars: {$feature: k, $view: a || {}}, spatialReference: d});
                            return c ? c(a) : a
                        }
                    };
                    c.copyMeshData = function (a, b, c, d, e, f, g) {
                        for (var h in f) for (var k = f[h].stride, m = f[h].data, l = c[h].data, n = k * e.vertexCount / 4, w = k * a / 4, p = k * e.vertexFrom / 4,
                                                  k = 0; k < n; ++k) l[k + w] = m[k + p];
                        c = e.indexCount;
                        for (k = 0; k < c; ++k) d[k + b] = g[k + e.indexFrom] - e.vertexFrom + a
                    };
                    c.C_VBO_INFO = (w = {}, w[c.C_VBO_GEOMETRY] = 35044, w[c.C_VBO_VISIBILITY] = 35044, w[c.C_VBO_VISIBILITY_RANGE] = 35048, w);
                    c.createGeometryData = function (a, b) {
                        for (var c = [], d = 0; 5 > d; ++d) {
                            for (var e = {}, f = 0, g = q(d); f < g.length; f++) {
                                var h = g[f];
                                e[h] = {data: b(d, h)}
                            }
                            c.push({data: a(d), buffers: e})
                        }
                        return c
                    }
                })
        }, "esri/views/2d/engine/webgl/SymbolProperties": function () {
            define(["require", "exports", "../../../../core/ObjectPool"], function (n,
                                                                                    c, e) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    function a() {
                        this.color = [0, 0, 0, 0];
                        this.haloColor = [0, 0, 0, 0];
                        this.haloSize = 0;
                        this.size = 12;
                        this.vAnchor = this.hAnchor = this.offsetY = this.offsetX = this.angle = 0
                    }

                    a.prototype.acquire = function (a, c, e, g, b, d, f, m, n) {
                        this.color = a;
                        this.haloColor = c;
                        this.haloSize = e;
                        this.size = g;
                        this.angle = b;
                        this.offsetX = d;
                        this.offsetY = f;
                        this.hAnchor = m;
                        this.vAnchor = n
                    };
                    a.prototype.release = function () {
                        this.color[0] = this.color[1] = this.color[2] = this.color[3] = 0;
                        this.vAnchor =
                            this.hAnchor = this.offsetY = this.offsetX = this.angle = this.size = this.haloSize = this.haloColor[0] = this.haloColor[1] = this.haloColor[2] = this.haloColor[3] = 0
                    };
                    a.pool = new e(a);
                    return a
                }();
                c.TextProperties = n
            })
        }, "esri/views/3d/layers/support/FastSymbolUpdates": function () {
            define(["require", "exports", "../../../../renderers/support/utils", "../graphics/graphicUtils", "../../lib/glMatrix"], function (n, c, e, a, l) {
                function k(a) {
                    return null !== a && void 0 !== a
                }

                function h(a) {
                    return "number" === typeof a
                }

                function g(a, b) {
                    a && a.push(b)
                }

                function b(a, b, c, f, m) {
                    var l = a.minSize, n = a.maxSize;
                    if (a.expression) return g(m, "Could not convert size info: expression not supported"), !1;
                    if (a.useSymbolValue) return a = f.symbolSize[c], b.minSize[c] = a, b.maxSize[c] = a, b.offset[c] = b.minSize[c], b.factor[c] = 0, b.type[c] = 1, !0;
                    if (k(a.field)) {
                        if (k(a.stops)) {
                            if (2 === a.stops.length && h(a.stops[0].size) && h(a.stops[1].size)) return d(a.stops[0].size, a.stops[1].size, a.stops[0].value, a.stops[1].value, b, c), b.type[c] = 1, !0;
                            g(m, "Could not convert size info: stops only supported with 2 elements");
                            return !1
                        }
                        if (h(l) && h(n) && k(a.minDataValue) && k(a.maxDataValue)) return d(l, n, a.minDataValue, a.maxDataValue, b, c), b.type[c] = 1, !0;
                        if (null != e.meterIn[a.valueUnit]) return b.minSize[c] = -Infinity, b.maxSize[c] = Infinity, b.offset[c] = 0, b.factor[c] = 1 / e.meterIn[a.valueUnit], b.type[c] = 1, !0;
                        "unknown" === a.valueUnit ? g(m, "Could not convert size info: proportional size not supported") : g(m, "Could not convert size info: scale-dependent size not supported");
                        return !1
                    }
                    if (!k(a.field)) {
                        if (a.stops && a.stops[0] && h(a.stops[0].size)) return b.minSize[c] =
                            a.stops[0].size, b.maxSize[c] = a.stops[0].size, b.offset[c] = b.minSize[c], b.factor[c] = 0, b.type[c] = 1, !0;
                        if (h(l)) return b.minSize[c] = l, b.maxSize[c] = l, b.offset[c] = l, b.factor[c] = 0, b.type[c] = 1, !0
                    }
                    g(m, "Could not convert size info: unsupported variant of sizeInfo");
                    return !1
                }

                function d(a, b, c, d, e, f) {
                    d = 0 < Math.abs(d - c) ? (b - a) / (d - c) : 0;
                    e.minSize[f] = 0 < d ? a : b;
                    e.maxSize[f] = 0 < d ? b : a;
                    e.offset[f] = a - c * d;
                    e.factor[f] = d
                }

                function f(a, c, d, e) {
                    if (a.normalizationField || a.valueRepresentation) return g(e, "Could not convert size info: unsupported property"),
                        null;
                    var f = a.field;
                    if (null != f && "string" !== typeof f) return g(e, "Could not convert size info: field is not a string"), null;
                    if (!c.size) c.size = {
                        field: a.field,
                        minSize: [0, 0, 0],
                        maxSize: [0, 0, 0],
                        offset: [0, 0, 0],
                        factor: [0, 0, 0],
                        type: [0, 0, 0]
                    }; else if (a.field) if (!c.size.field) c.size.field = a.field; else if (a.field !== c.size.field) return g(e, "Could not convert size info: multiple fields in use"), null;
                    switch (a.axis) {
                        case "width":
                            return (f = b(a, c.size, 0, d, e)) ? c : null;
                        case "height":
                            return (f = b(a, c.size, 2, d, e)) ? c : null;
                        case "depth":
                            return (f =
                                b(a, c.size, 1, d, e)) ? c : null;
                        case "width-and-depth":
                            return (f = b(a, c.size, 0, d, e)) && b(a, c.size, 1, d, e), f ? c : null;
                        case null:
                        case void 0:
                        case "all":
                            return (f = (f = (f = b(a, c.size, 0, d, e)) && b(a, c.size, 1, d, e)) && b(a, c.size, 2, d, e)) ? c : null;
                        default:
                            return g(e, 'Could not convert size info: unknown axis "' + a.axis + '""'), null
                    }
                }

                function m(a, b, c) {
                    for (var d = 0; 3 > d; ++d) {
                        var e = b.unitInMeters;
                        1 === a.type[d] && (e *= b.modelSize[d], a.type[d] = 2);
                        a.minSize[d] /= e;
                        a.maxSize[d] /= e;
                        a.offset[d] /= e;
                        a.factor[d] /= e
                    }
                    if (0 !== a.type[0]) b = 0; else if (0 !==
                        a.type[1]) b = 1; else if (0 !== a.type[2]) b = 2; else return g(c, "No size axis contains a valid size or scale"), !1;
                    for (d = 0; 3 > d; ++d) 0 === a.type[d] && (a.minSize[d] = a.minSize[b], a.maxSize[d] = a.maxSize[b], a.offset[d] = a.offset[b], a.factor[d] = a.factor[b], a.type[d] = a.type[b]);
                    return !0
                }

                function q(a, b, c) {
                    a[4 * b + 0] = c.r / 255;
                    a[4 * b + 1] = c.g / 255;
                    a[4 * b + 2] = c.b / 255;
                    a[4 * b + 3] = c.a
                }

                function p(a, b, c) {
                    if (a.normalizationField) return g(c, "Could not convert color info: unsupported property"), null;
                    if ("string" === typeof a.field) if (a.stops) {
                        if (8 <
                            a.stops.length) return g(c, "Could not convert color info: too many color stops"), null;
                        b.color = {
                            field: a.field,
                            values: [0, 0, 0, 0, 0, 0, 0, 0],
                            colors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        };
                        a = a.stops;
                        for (c = 0; 8 > c; ++c) {
                            var d = a[Math.min(c, a.length - 1)];
                            b.color.values[c] = d.value;
                            q(b.color.colors, c, d.color)
                        }
                    } else if (a.colors) {
                        if (!k(a.minDataValue) || !k(a.maxDataValue)) return g(c, "Could not convert color info: missing data values"), null;
                        if (2 !== a.colors.length) return g(c, "Could not convert color info: invalid colors array"),
                            null;
                        b.color = {
                            field: a.field,
                            values: [0, 0, 0, 0, 0, 0, 0, 0],
                            colors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        };
                        b.color.values[0] = a.minDataValue;
                        q(b.color.colors, 0, a.colors[0]);
                        b.color.values[1] = a.maxDataValue;
                        q(b.color.colors, 1, a.colors[1]);
                        for (c = 2; 8 > c; ++c) b.color.values[c] = a.maxDataValue, q(b.color.colors, c, a.colors[1])
                    } else return g(c, "Could not convert color info: missing stops or colors"), null; else if (a.stops && 0 <= a.stops.length || a.colors && 0 <= a.colors.length) for (a = a.stops && 0 <= a.stops.length ?
                        a.stops[0].color : a.colors[0], b.color = {
                        field: null,
                        values: [0, 0, 0, 0, 0, 0, 0, 0],
                        colors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    }, c = 0; 8 > c; c++) b.color.values[c] = Infinity, q(b.color.colors, c, a); else return g(c, "Could not convert color info: no field and no colors/stops"), null;
                    return b
                }

                function t(a, b, c, d) {
                    a = 2 === c && "arithmetic" === a.rotationType;
                    b.offset[c] = a ? 90 : 0;
                    b.factor[c] = a ? -1 : 1;
                    b.type[c] = 1
                }

                function u(a, b, c) {
                    if ("string" !== typeof a.field) return g(c, "Could not convert rotation info: field is not a string"),
                        null;
                    if (!b.rotation) b.rotation = {
                        field: a.field,
                        offset: [0, 0, 0],
                        factor: [1, 1, 1],
                        type: [0, 0, 0]
                    }; else if (a.field) if (!b.rotation.field) b.rotation.field = a.field; else if (a.field !== b.rotation.field) return g(c, "Could not convert rotation info: multiple fields in use"), null;
                    switch (a.axis) {
                        case "tilt":
                            return t(a, b.rotation, 0, c), b;
                        case "roll":
                            return t(a, b.rotation, 1, c), b;
                        case null:
                        case void 0:
                        case "heading":
                            return t(a, b.rotation, 2, c), b;
                        default:
                            return g(c, 'Could not convert rotation info: unknown axis "' + a.axis +
                                '""'), null
                    }
                }

                function r(a, b, c) {
                    if (!a) return null;
                    var d = !b.supportedTypes || !!b.supportedTypes.size,
                        e = !b.supportedTypes || !!b.supportedTypes.color,
                        h = !b.supportedTypes || !!b.supportedTypes.rotation;
                    return (a = a.reduce(function (a, k) {
                        if (!a) return a;
                        if (k.valueExpression) return g(c, "Could not convert visual variables: arcade expressions not supported"), null;
                        switch (k.type) {
                            case "size":
                                return d ? f(k, a, b, c) : a;
                            case "color":
                                return e ? p(k, a, c) : a;
                            case "rotation":
                                return h ? u(k, a, c) : a;
                            default:
                                return g(c, "Could not convert visual variables: unsupported type " +
                                    k.type), null
                        }
                    }, {size: null, color: null, rotation: null})) && a.size && !m(a.size, b, c) ? null : a
                }

                function x(a, b, c) {
                    if (!!a !== !!b || a && a.field !== b.field) return !1;
                    if (a && "rotation" === c) for (c = 0; 3 > c; c++) if (a.type[c] !== b.type[c] || a.offset[c] !== b.offset[c] || a.factor[c] !== b.factor[c]) return !1;
                    return !0
                }

                function v(a, b) {
                    var c = {
                            vvSizeEnabled: !1,
                            vvSizeMinSize: null,
                            vvSizeMaxSize: null,
                            vvSizeOffset: null,
                            vvSizeFactor: null,
                            vvSizeValue: null,
                            vvColorEnabled: !1,
                            vvColorValues: null,
                            vvColorColors: null,
                            vvSymbolAnchor: null,
                            vvSymbolRotation: null
                        },
                        d = a && null != a.size;
                    a && a.size ? (c.vvSizeEnabled = !0, c.vvSizeMinSize = a.size.minSize, c.vvSizeMaxSize = a.size.maxSize, c.vvSizeOffset = a.size.offset, c.vvSizeFactor = a.size.factor) : a && d && (c.vvSizeValue = b.transformation.scale);
                    a && d && (c.vvSymbolAnchor = b.transformation.anchor, c.vvSymbolRotation = b.transformation.rotation);
                    a && a.color && (c.vvColorEnabled = !0, c.vvColorValues = a.color.values, c.vvColorColors = a.color.colors);
                    return c
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                c.convertVisualVariables = r;
                c.initFastSymbolUpdatesState =
                    function (a, b, c) {
                        return b && a && !a.disableFastUpdates ? (a = r(a.visualVariables, c)) ? {
                            enabled: !0,
                            visualVariables: a,
                            materialParameters: v(a, c),
                            customTransformation: a && null != a.size
                        } : {enabled: !1} : {enabled: !1}
                    };
                c.updateFastSymbolUpdatesState = function (a, b, c) {
                    if (!b || !a.enabled) return !1;
                    var d = a.visualVariables;
                    b = r(b.visualVariables, c);
                    if (!(b && x(d.size, b.size, "size") && x(d.color, b.color, "color") && x(d.rotation, b.rotation, "rotation"))) return !1;
                    a.visualVariables = b;
                    a.materialParameters = v(b, c);
                    a.customTransformation = b &&
                        null != b.size;
                    return !0
                };
                c.getMaterialParams = v;
                var y;
                (function (b) {
                    var c = l.mat4d, d = l.vec3, e = c.create(), f = d.create();
                    b.evaluateModelTransform = function (b, d, g) {
                        if (!b.vvSizeEnabled) return g;
                        c.set(g, e);
                        a.computeObjectRotation(b.vvSymbolRotation[2], b.vvSymbolRotation[0], b.vvSymbolRotation[1], e);
                        if (b.vvSizeEnabled) {
                            for (g = 0; 3 > g; ++g) {
                                var h = b.vvSizeOffset[g] + d[0] * b.vvSizeFactor[g], k = g;
                                var m = b.vvSizeMinSize[g], l = b.vvSizeMaxSize[g], h = h < m ? m : h > l ? l : h;
                                f[k] = h
                            }
                            c.scale(e, f, e)
                        } else c.scale(e, b.vvSizeValue, e);
                        c.translate(e,
                            b.vvSymbolAnchor, e);
                        return e
                    }
                })(y || (y = {}));
                c.evaluateModelTransform = y.evaluateModelTransform
            })
        }, "esri/views/3d/layers/graphics/graphicUtils": function () {
            define("require exports ../../../../geometry ../../../../geometry/support/aaBoundingBox ../../../../geometry/support/aaBoundingRect ../../../../geometry/support/centroid ../../../../geometry/support/coordsUtils ../../../../geometry/support/webMercatorUtils ../../../../layers/graphics/dehydratedFeatures ../../lib/glMatrix ../../support/mathUtils".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f) {
                    function m(a) {
                        var c = a.paths[0];
                        if (!c || 0 === c.length) return null;
                        c = h.getPointOnPath(c, h.getPathLength(c) / 2);
                        return b.makeDehydratedPoint(c[0], c[1], c[2], a.spatialReference)
                    }

                    function q(a) {
                        if (Array.isArray(a)) {
                            for (var b = 0; b < a.length; b++) if (!q(a[b])) return !1;
                            return !0
                        }
                        return null == a || 0 <= a
                    }

                    Object.defineProperty(c, "__esModule", {value: !0});
                    var p = [1, 1, 1];
                    c.computeCentroid = function (a) {
                        if ("point" === a.type) return a;
                        if (b.isHydratedGeometry(a)) switch (a.type) {
                            case "extent":
                                return a.center;
                            case "polygon":
                                return a.centroid;
                            case "polyline":
                                return m(a);
                            case "mesh":
                                return a.extent.center
                        } else switch (a.type) {
                            case "extent":
                                var c = f.isFinite(a.zmin);
                                return b.makeDehydratedPoint(.5 * (a.xmax + a.xmin), .5 * (a.ymax + a.ymin), c ? .5 * (a.zmax + a.zmin) : void 0, a.spatialReference);
                            case "polygon":
                                return c = k.ringsCentroid(a.rings, b.hasZ(a)), b.makeDehydratedPoint(c[0], c[1], c[2], a.spatialReference);
                            case "polyline":
                                return m(a)
                        }
                    };
                    c.convertPointSR = function (a, b) {
                        var c = a.spatialReference;
                        c.isWebMercator && b.isWGS84 ? (g.xyToLngLat(a.x,
                            a.y, t), a.x = t[0], a.y = t[1], a.spatialReference = e.SpatialReference.WGS84) : b.isWebMercator && c.isWGS84 && (g.lngLatToXY(a.x, a.y, t), a.x = t[0], a.y = t[1], a.spatialReference = e.SpatialReference.WebMercator)
                    };
                    c.enlargeExtent = function (a, b, c) {
                        if (a) {
                            b || (b = l.create());
                            var e = .5 * a.width * (c - 1);
                            c = .5 * a.height * (c - 1);
                            a.width < 1E-7 * a.height ? e += c / 20 : a.height < 1E-7 * a.width && (c += e / 20);
                            d.vec4d.set4(a.xmin - e, a.ymin - c, a.xmax + e, a.ymax + c, b);
                            return b
                        }
                        return null
                    };
                    c.updateVertexAttributeAuxpos1w = function (a, b) {
                        for (var c = 0; c < a.geometries.length; ++c) {
                            var d =
                                a.geometries[c].data.vertexAttributes.auxpos1;
                            d && d.data[3] !== b && (d.data[3] = b, a.geometryVertexAttrsUpdated(c))
                        }
                    };
                    c.mixinColorAndOpacity = function (a, b) {
                        var c = [1, 1, 1, 1];
                        null != a && (c[0] = a[0], c[1] = a[1], c[2] = a[2]);
                        null !== b && void 0 !== b ? c[3] = b : null != a && 3 < a.length && (c[3] = a[3]);
                        return c
                    };
                    c.overrideColor = function (a, b, c, d, e, f) {
                        void 0 === f && (f = [0, 0, 0, 0]);
                        for (var g = 0; 3 > g; ++g) f[g] = a && null != a[g] ? a[g] : c && null != c[g] ? c[g] : e[g];
                        f[3] = null != b ? b : null != d ? d : e[3];
                        return f
                    };
                    c.computeObjectScale = function (a, b, c, d) {
                        void 0 === a && (a =
                            p);
                        void 0 === d && (d = 1);
                        var e = Array(3);
                        if (null == b || null == c) e[0] = 1, e[1] = 1, e[2] = 1; else {
                            for (var f = void 0, g = 0, h = 2; 0 <= h; h--) {
                                var k = a[h], m = void 0, l = null != k, n = 0 === h && !f && !l, q = c[h];
                                "symbolValue" === k || n ? m = 0 !== q ? b[h] / q : 1 : l && "proportional" !== k && isFinite(k) && (m = 0 !== q ? k / q : 1);
                                null != m && (f = e[h] = m, g = Math.max(g, Math.abs(m)))
                            }
                            for (h = 2; 0 <= h; h--) null == e[h] ? e[h] = f : 0 === e[h] && (e[h] = .001 * g)
                        }
                        for (h = 2; 0 <= h; h--) e[h] /= d;
                        return e
                    };
                    c.computeSizeWithResourceSize = function (a, b) {
                        var c = b.width, d = b.depth, e = b.height;
                        b = b.isPrimitive ? 10 : 1;
                        if (null ==
                            c && null == e && null == d) return [b * a[0], b * a[1], b * a[2]];
                        for (var c = [c, d, e], f, d = 0; 3 > d; d++) if (e = c[d], null != e) {
                            f = e / a[d];
                            break
                        }
                        for (d = 0; 3 > d; d++) null == c[d] && (c[d] = a[d] * f);
                        return c
                    };
                    c.validateSymbolLayerSize = function (a) {
                        null != a.isPrimitive && (a = [a.width, a.depth, a.height]);
                        return q(a) ? null : "Symbol sizes may not be negative values"
                    };
                    c.computeObjectRotation = function (a, b, c, e) {
                        void 0 === e && (e = d.mat4d.identity());
                        a = a || 0;
                        b = b || 0;
                        c = c || 0;
                        0 !== a && d.mat4d.rotateZ(e, -a / 180 * Math.PI, e);
                        0 !== b && d.mat4d.rotateX(e, b / 180 * Math.PI, e);
                        0 !==
                        c && d.mat4d.rotateY(e, c / 180 * Math.PI, e);
                        return e
                    };
                    c.demResolutionForBoundingBox = function (b, c) {
                        return null != c.minDemResolution ? c.minDemResolution : a.isPoint(b) ? c.minDemResolutionForPoints : .01 * a.maximumDimension(b)
                    };
                    var t = [0, 0]
                })
        }, "esri/views/2d/layers/support/FeaturesView2D": function () {
            define("require exports ../../../../core/tsSupport/declareExtendsHelper ../../../../core/tsSupport/decorateHelper ../../../../Graphic ../../../../core/Collection ../../../../core/Handles ../../../../core/Logger ../../../../core/promiseUtils ../../../../core/accessorSupport/decorators ../../../../renderers/support/renderingInfoUtils ../../../../symbols/Symbol3D ../../engine/graphics/GFXGroup ../../engine/graphics/GFXObject ../../engine/graphics/GFXSurface ../../../layers/GraphicsView".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u) {
                    var r = g.getLogger("esri.views.2d.layers.support.FeaturesView2D");
                    return function (c) {
                        function g() {
                            for (var a = [], b = 0; b < arguments.length; b++) a[b] = arguments[b];
                            var d = c.apply(this, a) || this;
                            d._handles = new h;
                            d._backgroundGroup = new q;
                            d._frontGroup = new q;
                            d._frontObjects = new Map;
                            d._backgroundObjects = new Map;
                            d._scale = 0;
                            d.container = new t;
                            d.layer = null;
                            d.container.addChild(d._backgroundGroup);
                            d.container.addChild(d._frontGroup);
                            d.watch("graphics", function () {
                                return d._reset()
                            });
                            d.watch("renderer", function () {
                                return d._resymbolize()
                            });
                            d.watch("mapView.scale, mapView.stationary", function () {
                                return d._applyScale()
                            });
                            return d
                        }

                        e(g, c);
                        g.prototype.destroy = function () {
                            this.renderer = this.graphics = null
                        };
                        g.prototype.hitTest = function (a, c) {
                            a += this.mapView.position[0] - window.pageXOffset;
                            c += this.mapView.position[1] - window.pageYOffset;
                            return (a = this.container.hitTest(a, c)) ? b.resolve(a.graphic) : b.resolve()
                        };
                        g.prototype.graphicUpdateHandler = function (a) {
                        };
                        g.prototype._reset = function () {
                            var a = this;
                            this._handles.remove("graphics");
                            this.graphics && (this.graphics.forEach(this._add, this), this._handles.add(this.graphics.on("change", function (b) {
                                return a._graphicsChangeHandler(b)
                            }), "graphics"))
                        };
                        g.prototype._applyScale = function () {
                            var a = this.get("mapView.scale"), b = this.get("mapView.stationary");
                            a !== this._scale && b && (this._scale = a, this._resymbolize())
                        };
                        g.prototype._resymbolize = function () {
                            var a = this;
                            this.graphics && this.graphics.forEach(function (b) {
                                return a._resymbolizeGraphic(b)
                            })
                        };
                        g.prototype._add = function (a) {
                            if (a &&
                                !this._frontObjects.has(a)) {
                                var b = f.getRenderingInfo(a, {
                                    renderer: this.renderer,
                                    viewingMode: "map",
                                    scale: this.mapView.state.scale,
                                    resolution: this.mapView.state.resolution,
                                    spatialReference: this.mapView.spatialReference
                                });
                                if (b) if (b.symbol instanceof m) r.error("3D symbols are not supported with MapView"); else {
                                    var c = new p;
                                    c.graphic = a;
                                    c.renderingInfo = b;
                                    this._frontObjects.set(a, c);
                                    this._frontGroup.addChild(c);
                                    var d = b.renderer && b.renderer.backgroundFillSymbol;
                                    d && c.isPolygonMarkerSymbol && (c = new p, c.graphic =
                                        a, c.renderingInfo = null != b.outlineSize ? {
                                        symbol: d,
                                        size: [b.outlineSize, b.outlineSize, b.outlineSize]
                                    } : {symbol: d}, this._backgroundObjects.set(a, c), this._backgroundGroup.addChild(c))
                                }
                            }
                        };
                        g.prototype._remove = function (a) {
                            var b = this._frontObjects.get(a);
                            b && (this._frontObjects.delete(a), this._frontGroup.removeChild(b), this._backgroundObjects.has(a) && (b = this._backgroundObjects.get(a), this._backgroundObjects.delete(a), this._backgroundGroup.removeChild(b)))
                        };
                        g.prototype._resymbolizeGraphic = function (a) {
                            if (this._frontObjects.has(a)) {
                                var b =
                                    f.getRenderingInfo(a, {
                                        renderer: this.renderer,
                                        viewingMode: "map",
                                        scale: this.mapView.state.scale,
                                        resolution: this.mapView.state.resolution,
                                        spatialReference: this.mapView.spatialReference
                                    });
                                if (b) if (b.symbol instanceof m) r.error("3D symbols are not supported with MapView"); else {
                                    var c = this._frontObjects.get(a);
                                    c && (c.renderingInfo = b);
                                    var d = b.renderer && b.renderer.backgroundFillSymbol,
                                        e = this._backgroundObjects.get(a);
                                    d && c.isPolygonMarkerSymbol ? (e || (e = new p, e.graphic = a, this._backgroundObjects.set(a, e), this._backgroundGroup.addChild(e)),
                                        e.renderingInfo = null != b.outlineSize ? {
                                            symbol: d,
                                            size: [b.outlineSize, b.outlineSize, b.outlineSize]
                                        } : {symbol: d}) : !d && e && (this._backgroundObjects.delete(a), this._backgroundGroup.removeChild(e))
                                }
                            }
                        };
                        g.prototype._graphicsChangeHandler = function (a) {
                            for (var b = a.removed, c = 0, d = a.added; c < d.length; c++) a = d[c], this._add(a);
                            for (c = 0; c < b.length; c++) a = b[c], this._remove(a)
                        };
                        a([d.property()], g.prototype, "container", void 0);
                        a([d.property(), d.cast(k.ofType(l))], g.prototype, "graphics", void 0);
                        a([d.property()], g.prototype, "layer",
                            void 0);
                        a([d.property()], g.prototype, "mapView", void 0);
                        return g = a([d.subclass("esri.views.2d.layers.support.FeaturesView2D")], g)
                    }(d.declared(u))
                })
        }, "esri/renderers/support/renderingInfoUtils": function () {
            define(["require", "exports"], function (n, c) {
                function e(a, c) {
                    if (!a || a.symbol) return null;
                    c = c.renderer;
                    return a && c && c.getObservationRenderer ? c.getObservationRenderer(a) : c
                }

                function a(a, c) {
                    if (a.symbol) return a.symbol;
                    var h = e(a, c);
                    return h && h.getSymbol(a, c)
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                c.getRenderer = e;
                c.getSymbol = a;
                c.getRenderingInfo = function (c, k) {
                    var h = e(c, k), g = a(c, k);
                    if (!g) return null;
                    g = {renderer: h, symbol: g};
                    if (h) {
                        h.colorInfo && (g.color = h.getColor(c).toRgba());
                        if (h.sizeInfo) {
                            var b = h.getSize(c);
                            g.size = [b, b, b]
                        }
                        if (h.visualVariables) {
                            c = h.getVisualVariableValues(c, k);
                            b = ["proportional", "proportional", "proportional"];
                            for (k = 0; k < c.length; k++) {
                                var d = c[k], h = d.variable, f = d.value;
                                "color" === h.type ? g.color = f.toRgba() : "size" === h.type ? "outline" === h.target ? g.outlineSize = f : (d = h.axis, h = h.useSymbolValue ?
                                    "symbolValue" : f, "width" === d ? b[0] = h : "depth" === d ? b[1] = h : "height" === d ? b[2] = h : b[0] = "width-and-depth" === d ? b[1] = h : b[1] = b[2] = h) : "opacity" === h.type ? g.opacity = f : "rotation" === h.type && "tilt" === h.axis ? g.tilt = f : "rotation" === h.type && "roll" === h.axis ? g.roll = f : "rotation" === h.type && (g.heading = f)
                            }
                            if (isFinite(b[0]) || isFinite(b[1]) || isFinite(b[2])) g.size = b
                        }
                    }
                    return g
                }
            })
        }, "esri/views/layers/RefreshableLayerView": function () {
            define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/Accessor ../../core/accessorSupport/decorators".split(" "),
                function (n, c, e, a, l, k) {
                    return function (c) {
                        function g() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a.refreshTimestamp = null;
                            return a
                        }

                        e(g, c);
                        g.prototype.refresh = function (a) {
                            void 0 === a && (a = Date.now());
                            this._set("refreshTimestamp", a);
                            this.doRefresh && this.doRefresh()
                        };
                        a([k.property()], g.prototype, "layer", void 0);
                        a([k.aliasOf("layer.refreshInterval")], g.prototype, "refreshInterval", void 0);
                        a([k.property({readOnly: !0})], g.prototype, "refreshTimestamp", void 0);
                        return g = a([k.subclass("esri.layers.mixins.RefreshableLayerView")],
                            g)
                    }(k.declared(l))
                })
        }, "esri/views/2d/layers/FeatureLayerView2DWebGL": function () {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../core/tsSupport/paramHelper ../../../geometry ../../../Graphic ../../../core/Collection ../../../core/Error ../../../core/promiseUtils ../../../core/watchUtils ../../../core/accessorSupport/decorators ../../../core/accessorSupport/ensureType ../../../layers/support/TileInfo ../../../tasks/support/FeatureSet ../../../tasks/support/Query ../engine/DOMContainer ./LayerView2D ./features/controllers ./features/tileRenderers ./support/FeatureLayerProxy ../tiling/TileInfoView ../tiling/TileStrategy ../../layers/RefreshableLayerView".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u, r, x, v, y, w, z, B, A) {
                    function C(a) {
                        return a && a.highlight
                    }

                    var D = q.ensureType(u);
                    return function (c) {
                        function l() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a._pipelineIsUpdating = !0;
                            a.container = new r;
                            return a
                        }

                        e(l, c);
                        l.prototype.destroy = function () {
                            this._proxy.destroy()
                        };
                        l.prototype.initialize = function () {
                            var a = this, c = this._tileInfo = p.create({
                                spatialReference: this.view.spatialReference,
                                size: 512
                            });
                            this._tileInfoView = new z(c);
                            this._tileStrategy = new B({
                                cachePolicy: "purge",
                                acquireTile: function (b) {
                                    return a._acquireTile(b)
                                }, releaseTile: function (b) {
                                    return a._releaseTile(b)
                                }, tileInfoView: this._tileInfoView, buffer: 0
                            });
                            this._proxy = new w.default({
                                layer: this.layer,
                                tileInfo: c,
                                client: {
                                    executeProcessing: function (c) {
                                        var e = a.layer.processing;
                                        return e ? (c = e.process(c.featureSet, e.options)) ? c : d.reject(new b("FeatureLayer", "invalid processing.process() method, returns nothing")) : c.featureSet
                                    }, setUpdating: function (b) {
                                        a._pipelineIsUpdating = b;
                                        a.notifyChange("updating")
                                    }
                                }
                            });
                            this.addResolvingPromise(d.all([v.getControllerConfiguration(this.layer),
                                this._proxy.when()]).then(function (a) {
                                return a[1].configure({controller: a[0]})
                            }))
                        };
                        Object.defineProperty(l.prototype, "numFeatures", {
                            get: function () {
                                var a = 0;
                                this.attached ? this._tileStrategy.tiles.forEach(function (b) {
                                    a += b.iconDisplayRecords ? b.iconDisplayRecords.length : 0
                                }) : 0;
                                return a
                            }, enumerable: !0, configurable: !0
                        });
                        Object.defineProperty(l.prototype, "renderingConfigHash", {
                            get: function () {
                                if (!this.layer) return null;
                                var a = this.layer, b = a.renderer, c = a.labelingInfo;
                                return JSON.stringify({
                                    definitionExpression: a.definitionExpression,
                                    historicMoment: a.historicMoment,
                                    outFields: a.outFields.slice().sort(),
                                    renderer: b,
                                    labelingInfo: c
                                })
                            }, enumerable: !0, configurable: !0
                        });
                        l.prototype.highlight = function (a, b) {
                            var c = this, d;
                            a instanceof h ? d = [a.getAttribute(this.layer.objectIdField)] : "number" === typeof a ? d = [a] : g.isCollection(a) ? d = a.map(function (a) {
                                return a && a.getAttribute(c.layer.objectIdField)
                            }).toArray() : Array.isArray(a) && 0 < a.length && (d = "number" === typeof a[0] ? a : a.map(function (a) {
                                return a && a.getAttribute(c.layer.objectIdField)
                            }));
                            return (d = d.filter(function (a) {
                                return null !=
                                    a
                            })) && d.length && C(this.tileRenderer) ? this.tileRenderer.highlight(d) : {
                                remove: function () {
                                }
                            }
                        };
                        l.prototype.hitTest = function (a, b) {
                            var c = this;
                            return this.suspended || !this.tileRenderer ? d.resolve(null) : this.tileRenderer.hitTest(a, b).then(function (a) {
                                return 0 === a.length ? null : c._proxy.queryFeatures(new u({
                                    objectIds: a,
                                    outSpatialReference: c.view.spatialReference,
                                    returnGeometry: !0
                                })).then(function (a) {
                                    if (!a.features[0]) return null;
                                    a = h.fromJSON(a.features[0]);
                                    a.layer = c.layer;
                                    a.sourceLayer = c.layer;
                                    a.geometry && (a.geometry.spatialReference =
                                        c.view.spatialReference);
                                    return a
                                })
                            })
                        };
                        l.prototype.queryFeatures = function (a) {
                            var b = this;
                            return this.queryFeaturesJSON(a).then(function (a) {
                                a = t.fromJSON(a);
                                a.features.forEach(function (a) {
                                    a.layer = b.layer;
                                    a.sourceLayer = b.layer
                                });
                                return a
                            })
                        };
                        l.prototype.queryFeaturesJSON = function (a) {
                            return this._proxy.queryFeatures(this._cleanUpQuery(a))
                        };
                        l.prototype.queryObjectIds = function (a) {
                            return this._proxy.queryObjectIds(this._cleanUpQuery(a))
                        };
                        l.prototype.queryFeatureCount = function (a) {
                            return this._proxy.queryFeatureCount(this._cleanUpQuery(a))
                        };
                        l.prototype.queryExtent = function (a) {
                            return this._proxy.queryExtent(this._cleanUpQuery(a)).then(function (a) {
                                return {count: a.count, extent: k.Extent.fromJSON(a.extent)}
                            })
                        };
                        l.prototype.update = function (a) {
                            this.attached && this._tileStrategy && this.tileRenderer && (this._tileStrategy.update(a), this._proxy.setViewState(a.state), this.notifyChange("numFeatures"), this.notifyChange("updating"))
                        };
                        l.prototype.attach = function () {
                            var a = this;
                            this.handles.add([f.init(this, "layer.processing.version", function (b) {
                                a._proxy.redraw()
                            }),
                                f.init(this, "renderingConfigHash", function () {
                                    var b = a._tileRendererPromise = y.createOrReuseTileRenderer(a.tileRenderer, a.layer.renderer, {
                                        layerView: a,
                                        tileInfoView: a._tileInfoView,
                                        layer: a.layer,
                                        highlightOptions: a.view.highlightOptions
                                    }).then(function (c) {
                                        a._tileRendererPromise === b && (a._tileRendererPromise = null, a.tileRenderer !== c && (a._tileStrategy.clear(), a.tileRenderer && (a.tileRenderer.uninstall(a.container), a.tileRenderer.destroy()), (a.tileRenderer = a._proxy.client.tileRenderer = c) && c.install(a.container),
                                            a.requestUpdate()), c = c.getProcessorConfiguration(), a.tileRenderer.needsProcessorReconfiguration(c) ? (a.tileRenderer.applyConfiguration(c, !0), a._proxy.configure({processor: c}), a.requestUpdate()) : a.tileRenderer.applyConfiguration(c, !1))
                                    }, function () {
                                        return a._tileRendererPromise = null
                                    })
                                })])
                        };
                        l.prototype.detach = function () {
                            this.container.removeAllChildren();
                            this.handles.remove(this);
                            this._tileRendererPromise = null;
                            this.tileRenderer && (this.tileRenderer.uninstall(this.container), this.tileRenderer = null);
                            this._tileStrategy &&
                            (this._tileStrategy.destroy(), this._tileStrategy = null)
                        };
                        l.prototype.moveStart = function () {
                            this.requestUpdate()
                        };
                        l.prototype.viewChange = function () {
                            this.requestUpdate()
                        };
                        l.prototype.moveEnd = function () {
                            this.requestUpdate()
                        };
                        l.prototype.doRefresh = function () {
                            this._proxy.refresh()
                        };
                        l.prototype.isUpdating = function () {
                            return null == this.tileRenderer || this._pipelineIsUpdating || this.tileRenderer.updating
                        };
                        l.prototype._cleanUpQuery = function (a) {
                            a = a ? D(a) : new u;
                            a.outSpatialReference || (a.outSpatialReference = this.view.spatialReference);
                            return a
                        };
                        l.prototype._acquireTile = function (a) {
                            var b = this;
                            a = this.tileRenderer.acquireTile(a);
                            a.once("attach", function () {
                                b.requestUpdate()
                            });
                            return a
                        };
                        l.prototype._releaseTile = function (a) {
                            this.tileRenderer.releaseTile(a)
                        };
                        a([m.property()], l.prototype, "numFeatures", null);
                        a([m.property({dependsOn: ["layer.renderer", "layer.outFields", "layer.definitionExpression", "layer.historicMoment", "layer.labelingInfo"]})], l.prototype, "renderingConfigHash", null);
                        a([m.property()], l.prototype, "tileRenderer", void 0);
                        a([m.property({dependsOn: ["tileRenderer.updating"]})],
                            l.prototype, "updating", void 0);
                        return l = a([m.subclass("esri.views.2d.layers.AutoFeatureLayerView2D")], l)
                    }(m.declared(x, A))
                })
        }, "esri/views/2d/layers/features/controllers": function () {
            define(["require", "exports", "../../../../core/tsSupport/assignHelper", "../../../../core/Error", "../../../../core/promiseUtils"], function (n, c, e, a, l) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.getControllerConfiguration = function (c) {
                    var e = c.source;
                    return c.capabilities.operations.supportsQuery ? e && "esri.layers.graphics.sources.CSVSource" ===
                    e.declaredClass ? l.resolve().then(function () {
                        return {type: "memory", processing: c.processing && c.processing.toWorker() || null}
                    }) : l.resolve({
                        type: "on-demand",
                        gdbVersion: c.gdbVersion,
                        historicMoment: c.historicMoment && c.historicMoment.getTime(),
                        processing: c.processing && c.processing.toWorker() || null
                    }) : l.reject(new a("graphicscontroller:query-capability-required", "Service requires query capabilities to be used as a feature layer", {layer: c}))
                };
                c.createController = function (a, c) {
                    return ("memory" === a ? l.create(function (a) {
                        return n(["./controllers/MemoryController"],
                            a)
                    }) : l.create(function (a) {
                        return n(["./controllers/OnDemandController"], a)
                    })).then(function (a) {
                        return a.default
                    }).then(function (a) {
                        return new a(e({}, c.serviceAndViewInfo, {
                            tileStore: c.tileStore,
                            remoteClient: c.remoteClient
                        }))
                    })
                }
            })
        }, "esri/views/2d/layers/features/tileRenderers": function () {
            define("require exports dojo/has ../../../../core/nextTick ../../../../core/promiseUtils ../../engine/webgl/rendererInfoUtils".split(" "), function (n, c, e, a, l, k) {
                Object.defineProperty(c, "__esModule", {value: !0});
                c.createOrReuseTileRenderer =
                    function (c, g, b) {
                        if (c && c.supportsRenderer(g)) return l.create(function (b) {
                            return a(function () {
                                return b(c)
                            })
                        });
                        var d = b.layer,
                            d = e("esri-webgl") && e("esri-featurelayer-webgl") && k.isRendererWebGLCompatible(g) && d.capabilities.query.supportsQuantization;
                        switch (g.type) {
                            case "class-breaks":
                            case "simple":
                            case "unique-value":
                                if (d) return l.create(function (b) {
                                    a(function () {
                                        return n(["./tileRenderers/SymbolTileRenderer"], b)
                                    })
                                }).then(function (a) {
                                    return a.default
                                }).then(function (a) {
                                    return new a(b)
                                });
                                break;
                            case "heatmap":
                                return l.create(function (b) {
                                    a(function () {
                                        return n(["./tileRenderers/HeatmapTileRenderer"],
                                            b)
                                    })
                                }).then(function (a) {
                                    return a.default
                                }).then(function (a) {
                                    return new a(b)
                                })
                        }
                        return l.resolve(null)
                    }
            })
        }, "esri/views/2d/layers/support/FeatureLayerProxy": function () {
            define("require exports ../../../../core/tsSupport/declareExtendsHelper ../../../../core/tsSupport/decorateHelper ../../../../core/tsSupport/assignHelper ../../../../core/Accessor ../../../../core/Promise ../../../../core/promiseUtils ../../../../core/requireUtils ../../../../core/throttle ../../../../core/workers ../../../../core/accessorSupport/decorators ./util module".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    l = function (c) {
                        function h(a) {
                            a = c.call(this, a) || this;
                            a.tileRenderer = null;
                            a.setViewState = d.throttle(a.setViewState, 50, a);
                            return a
                        }

                        e(h, c);
                        h.prototype.initialize = function () {
                            var a = this;
                            this.addResolvingPromise(f.open(b.getAbsMid("../features/Pipeline", n, p), {
                                client: this.client,
                                strategy: "dedicated"
                            }).then(function (b) {
                                a._connection = b;
                                return a._getStartupOptions(a.layer, a.tileInfo)
                            }).then(function (b) {
                                return Array.isArray(b.service.source) ?
                                    a._connection.invoke("startup", b, b.service.source) : a._connection.invoke("startup", b)
                            }))
                        };
                        h.prototype.destroy = function () {
                            this._connection && this._connection.close()
                        };
                        h.prototype.configure = function (a) {
                            return this._connection.invoke("configure", a)
                        };
                        h.prototype.refresh = function () {
                            return this._connection.invoke("controller.refresh")
                        };
                        h.prototype.redraw = function () {
                            return this._connection.invoke("controller.redraw")
                        };
                        h.prototype.setViewState = function (a) {
                            return this._connection.invoke("setViewState", a.toJSON())
                        };
                        h.prototype.queryFeatures = function (a) {
                            return this._connection.invoke("controller.queryFeatures", a.toJSON())
                        };
                        h.prototype.queryObjectIds = function (a) {
                            return this._connection.invoke("controller.queryObjectIds", a.toJSON())
                        };
                        h.prototype.queryFeatureCount = function (a) {
                            return this._connection.invoke("controller.queryFeatureCount", a.toJSON())
                        };
                        h.prototype.queryExtent = function (a) {
                            return this._connection.invoke("controller.queryExtent", a.toJSON())
                        };
                        h.prototype._getStartupOptions = function (a, b) {
                            var c = a.source;
                            return c && "esri.layers.graphics.sources.CSVSource" === c.declaredClass ? c.openPorts().then(function (c) {
                                return {
                                    service: {
                                        capabilities: a.capabilities,
                                        fields: a.fields.map(function (a) {
                                            return a.toJSON()
                                        }),
                                        fullExtent: a.fullExtent.toJSON(),
                                        geometryType: q.toJSONGeometryType(a.geometryType),
                                        objectIdField: a.objectIdField,
                                        source: c
                                    }, tileInfo: b.toJSON()
                                }
                            }) : g.resolve({
                                service: {
                                    capabilities: a.capabilities,
                                    fields: a.fields.map(function (a) {
                                        return a.toJSON()
                                    }),
                                    fullExtent: a.fullExtent.toJSON(),
                                    geometryType: q.toJSONGeometryType(a.geometryType),
                                    objectIdField: a.objectIdField,
                                    source: a.url + "/" + a.layerId
                                }, tileInfo: b.toJSON()
                            })
                        };
                        a([m.property({constructOnly: !0})], h.prototype, "client", void 0);
                        a([m.property({constructOnly: !0})], h.prototype, "layer", void 0);
                        a([m.property({constructOnly: !0})], h.prototype, "tileInfo", void 0);
                        a([m.property()], h.prototype, "tileRenderer", void 0);
                        return h = a([m.subclass()], h)
                    }(m.declared(k, h));
                    c.default = l
                })
        }, "esri/core/requireUtils": function () {
            define(["require", "exports", "dojo/Deferred"], function (n, c, e) {
                function a(c, k) {
                    if (Array.isArray(k)) {
                        var h =
                            new e;
                        c(k, function () {
                            for (var a = [], b = 0; b < arguments.length; b++) a[b] = arguments[b];
                            h.resolve(a)
                        });
                        return h.promise
                    }
                    return a(c, [k]).then(function (a) {
                        return a[0]
                    })
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                c.when = a;
                c.getAbsMid = function (a, c, e) {
                    return c.toAbsMid ? c.toAbsMid(a) : e.id.replace(/\/[^\/]*$/gi, "/") + a
                }
            })
        }, "esri/views/2d/layers/support/util": function () {
            define(["require", "exports", "../../../../core/kebabDictionary"], function (n, c, e) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var a = e({
                    esriGeometryPoint: "point",
                    esriGeometryMultipoint: "multipoint",
                    esriGeometryPolyline: "polyline",
                    esriGeometryPolygon: "polygon",
                    esriGeometryMultiPatch: "multipatch"
                });
                c.toJSONGeometryType = function (c) {
                    return a.toJSON(c)
                }
            })
        }, "esri/views/2d/layers/TiledLayerView2D": function () {
            define("require exports ../../../core/tsSupport/extendsHelper ../../../core/tsSupport/decorateHelper ../../../core/Error ../../../core/promiseUtils ../../../core/accessorSupport/decorators ../engine/BitmapContainer ../engine/BitmapSource ../engine/BitmapTile ../engine/Canvas2DContainer ./LayerView2D ../tiling/enums ../tiling/TileInfoView ../tiling/TileQueue ../tiling/TileStrategy ../../layers/RefreshableLayerView".split(" "),
                function (n, c, e, a, l, k, h, g, b, d, f, m, q, p, t, u, r) {
                    var x = [0, 0];
                    return function (c) {
                        function m() {
                            var a = null !== c && c.apply(this, arguments) || this;
                            a._tileStrategy = null;
                            a._tileInfoView = null;
                            a._fetchQueue = null;
                            a._tileRequests = new Map;
                            a.container = new f;
                            a.layer = null;
                            return a
                        }

                        e(m, c);
                        m.prototype.initialize = function () {
                            var a = this.layer.tileInfo, a = a && a.spatialReference, b;
                            a || (b = new l("layerview:tiling-information-missing", "The layer doesn't provide tiling information", {layer: this.layer}));
                            a.equals(this.view.spatialReference) ||
                            (b = new l("layerview:spatial-reference-incompatible", "The spatial reference of this layer does not meet the requirements of the view", {layer: this.layer}));
                            b && this.addResolvingPromise(k.reject(b))
                        };
                        m.prototype.hitTest = function (a, b) {
                            return null
                        };
                        m.prototype.update = function (a) {
                            this._fetchQueue.pause();
                            this._fetchQueue.state = a.state;
                            this._tileStrategy.update(a);
                            this._fetchQueue.resume();
                            this.notifyChange("updating")
                        };
                        m.prototype.attach = function () {
                            var a = this;
                            this._tileContainer = new g;
                            this.container.addChild(this._tileContainer);
                            this._tileInfoView = new p(this.layer.tileInfo, this.layer.fullExtent);
                            this._fetchQueue = new t({
                                tileInfoView: this._tileInfoView,
                                tileServers: "tileServers" in this.layer ? this.layer.tileServers : null,
                                concurrency: this.layer.url && -1 !== this.layer.url.indexOf("tiles.arcgis.com") ? 12 : 6,
                                process: function (b, c) {
                                    return a.fetchTile(b, c)
                                }
                            });
                            this._tileStrategy = new u({
                                cachePolicy: "keep", acquireTile: function (b) {
                                    return a.acquireTile(b)
                                }, releaseTile: function (b) {
                                    return a.releaseTile(b)
                                }, tileInfoView: this._tileInfoView
                            })
                        };
                        m.prototype.detach =
                            function () {
                                this._tileStrategy.destroy();
                                this._fetchQueue.clear();
                                this.container.removeChild(this._tileContainer);
                                this._fetchQueue = this._tileStrategy = this._tileInfoView = this._tileContainer = null
                            };
                        m.prototype.moveStart = function () {
                            this.requestUpdate()
                        };
                        m.prototype.viewChange = function () {
                            this.requestUpdate()
                        };
                        m.prototype.moveEnd = function () {
                            this.requestUpdate()
                        };
                        m.prototype.doRefresh = function () {
                            var a = this;
                            this.updateRequested || this.suspended || (this._fetchQueue.reset(), this._tileStrategy.tiles.forEach(function (b) {
                                return a._enqueueTileFetch(b)
                            }),
                                this.notifyChange("updating"))
                        };
                        m.prototype.isUpdating = function () {
                            var a = !0;
                            this._tileRequests.forEach(function (b) {
                                a = a && b.isFulfilled()
                            });
                            return !a
                        };
                        m.prototype.getTileBounds = function (a, b) {
                            return this._tileInfoView.getTileBounds(a, b)
                        };
                        m.prototype.getTileCoords = function (a, b) {
                            return this._tileInfoView.getTileCoords(a, b)
                        };
                        m.prototype.getTileResolution = function (a) {
                            return this._tileInfoView.getTileResolution(a)
                        };
                        m.prototype.acquireTile = function (a) {
                            var b = d.default.pool.acquire();
                            b.key.set(a);
                            a = this._tileInfoView.getTileCoords(x,
                                b.key);
                            b.x = a[0];
                            b.y = a[1];
                            b.resolution = this._tileInfoView.getTileResolution(b.key);
                            a = this._tileInfoView.tileInfo.size;
                            b.width = a[0];
                            b.height = a[1];
                            this._enqueueTileFetch(b);
                            this.requestUpdate();
                            return b
                        };
                        m.prototype.releaseTile = function (a) {
                            var b = this, c = this._tileRequests.get(a);
                            c && !c.isFulfilled() && c.cancel();
                            this._tileRequests.delete(a);
                            this._tileContainer.removeChild(a);
                            a.once("detach", function () {
                                d.default.pool.release(a);
                                b.requestUpdate()
                            });
                            this.requestUpdate()
                        };
                        m.prototype.fetchTile = function (a, b) {
                            var c =
                                this;
                            if (b = "tilemapCache" in this.layer ? this.layer.tilemapCache : null) {
                                var d = a.level, e = a.row, f = a.col;
                                return b.fetchAvailabilityUpsample(d, e, f, a).then(function () {
                                    return c._fetchImage(a)
                                }).catch(function () {
                                    a.level = d;
                                    a.row = e;
                                    a.col = f;
                                    return c._fetchImage(a)
                                })
                            }
                            return this._fetchImage(a)
                        };
                        m.prototype._enqueueTileFetch = function (a) {
                            var b = this;
                            if (!this._fetchQueue.has(a.key)) {
                                var c = this._fetchQueue.push(a.key).then(function (c) {
                                    a.status = q.TileStatus.READY;
                                    a.source = c;
                                    a.once("attach", function () {
                                        return b.requestUpdate()
                                    });
                                    b._tileContainer.addChild(a);
                                    b.requestUpdate()
                                });
                                this._tileRequests.set(a, c)
                            }
                        };
                        m.prototype._fetchImage = function (a) {
                            var c = this;
                            return this.layer.fetchTile(a.level, a.row, a.col, {timestamp: this.refreshTimestamp}).then(function (d) {
                                var e = b.default.pool.acquire(d);
                                d = c.getTileCoords(x, a);
                                e.x = d[0];
                                e.y = d[1];
                                e.resolution = c.getTileResolution(a);
                                return e
                            })
                        };
                        return m = a([h.subclass("esri.views.2d.layers.TiledLayerView2D")], m)
                    }(h.declared(m, r))
                })
        }, "esri/views/2d/engine/BitmapContainer": function () {
            define("require exports ../../../core/tsSupport/extendsHelper ../../../core/tsSupport/decorateHelper ../ViewState ../viewStateUtils ./Container".split(" "),
                function (n, c, e, a, l, k, h) {
                    var g = [0, 0];
                    return function (a) {
                        function b() {
                            var b = null !== a && a.apply(this, arguments) || this;
                            b._childrenCanvas = null;
                            b._childrenRenderParameters = {context: null, pixelRatio: 1, state: new l, stationary: !0};
                            return b
                        }

                        e(b, a);
                        b.prototype.attach = function (b) {
                            this._childrenCanvas || (this._childrenCanvas = document.createElement("canvas"), this._childrenRenderParameters.context = this._childrenCanvas.getContext("2d"));
                            return a.prototype.attach.call(this, b)
                        };
                        b.prototype.detach = function (b) {
                            a.prototype.detach.call(this,
                                b);
                            this._childrenCanvas = null;
                            this._childrenRenderParameters.context = null
                        };
                        b.prototype.doRender = function (b) {
                            this.visible && a.prototype.doRender.call(this, b)
                        };
                        b.prototype.prepareChildrenRenderParameters = function (a) {
                            var b = this._childrenCanvas, c = this._childrenRenderParameters, d = a.state,
                                e = d.pixelRatio, f = c.state;
                            f.copy(d);
                            var h = k.getOuterSize(g, d), d = h[0], h = h[1], d = d * e, h = h * e;
                            f.size = g;
                            f.viewpoint.rotation = 0;
                            b.width !== d || b.height !== h ? (b.width = d, b.height = h) : c.context.clearRect(0, 0, d, h);
                            c.pixelRatio = a.pixelRatio;
                            return c
                        };
                        b.prototype.beforeRenderChildren = function (a, b) {
                            this.sortChildren(function (a, b) {
                                return b.resolution - a.resolution
                            })
                        };
                        b.prototype.afterRenderChildren = function (a, b) {
                            var c = a.context;
                            a = a.state;
                            var d = b.context;
                            b = b.state;
                            0 === a.rotation ? c.drawImage(d.canvas, 0, 0) : (c.save(), c.translate(.5 * a.width, .5 * a.height), c.rotate(a.rotation * Math.PI / 180), c.translate(.5 * -a.width, .5 * -a.height), c.drawImage(d.canvas, .5 * (a.width - b.width), .5 * (a.height - b.height)), c.restore())
                        };
                        return b
                    }(h)
                })
        }, "esri/views/2d/viewStateUtils": function () {
            define(["require",
                "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                var e = Math.PI / 180;
                c.snapToPixel = function (a, c, e) {
                    var h = e.resolution;
                    e = e.size;
                    a[0] = h * (Math.round(c[0] / h) + e[0] % 2 * .5);
                    a[1] = h * (Math.round(c[1] / h) + e[1] % 2 * .5);
                    return a
                };
                c.getOuterSize = function (a, c) {
                    var k = c.rotation * e, h = Math.abs(Math.cos(k)), k = Math.abs(Math.sin(k)), g = c.size;
                    c = g[0];
                    g = g[1];
                    a[0] = Math.round(g * k + c * h);
                    a[1] = Math.round(g * h + c * k);
                    return a
                };
                c.getBBox = function (a, c, e, h) {
                    var g = c[0];
                    c = c[1];
                    var b = h[0];
                    h = h[1];
                    e *= .5;
                    a[0] = g - e * b;
                    a[1] =
                        c - e * h;
                    a[2] = g + e * b;
                    a[3] = c + e * h;
                    return a
                };
                c.bboxIntersects = function (a, c) {
                    var e = a[1], h = a[2], g = a[3], b = c[0], d = c[1], f = c[3];
                    return !(a[0] > c[2] || h < b || e > f || g < d)
                }
            })
        }, "esri/views/2d/engine/BitmapSource": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper", "../../../core/ObjectPool", "../support/Evented"], function (n, c, e, a, l) {
                function k(a) {
                    return a && "render" in a
                }

                Object.defineProperty(c, "__esModule", {value: !0});
                n = function (c) {
                    function g(a) {
                        var b = c.call(this) || this;
                        b._height = 0;
                        b.pixelRatio =
                            1;
                        b.resolution = 0;
                        b.rotation = 0;
                        b._width = 0;
                        b.x = 0;
                        b.y = 0;
                        b.data = a;
                        return b
                    }

                    e(g, c);
                    g.prototype.release = function () {
                        this.data = null
                    };
                    Object.defineProperty(g.prototype, "data", {
                        get: function () {
                            return this._data
                        }, set: function (a) {
                            this._data = a;
                            this._width = this._height = 0;
                            a && !k(a) && (a instanceof HTMLImageElement ? (this._width = a.naturalWidth, this._height = a.naturalHeight) : 0 < a.width && 0 < a.height && (this._width = a.width, this._height = a.height))
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(g.prototype, "height", {
                        get: function () {
                            return k(this._data) ?
                                this._data.height : this._height
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(g.prototype, "ready", {
                        get: function () {
                            return k(this._data) ? 0 < this._data.width && 0 < this._data.height : 0 < this._width
                        }, enumerable: !0, configurable: !0
                    });
                    Object.defineProperty(g.prototype, "width", {
                        get: function () {
                            return k(this.data) ? this._data.width : this._width
                        }, enumerable: !0, configurable: !0
                    });
                    g.prototype.draw = function (a, c, e, g, h, l, n, u, r) {
                        if (this.ready) if (k(this._data)) this._data.render(a, c, e, g, h, l, n, u, r); else {
                            var b = this._data;
                            b && !("render" in b) && g && h && u && r && a.drawImage(this._data, c, e, g, h, l, n, u, r)
                        }
                    };
                    g.pool = new a(g, !0);
                    return g
                }(l.default);
                c.default = n
            })
        }, "esri/views/2d/support/Evented": function () {
            define(["require", "exports"], function (n, c) {
                Object.defineProperty(c, "__esModule", {value: !0});
                n = function () {
                    function c() {
                        this._listeners = {}
                    }

                    c.prototype.on = function (a, c) {
                        var e = this;
                        null == this._listeners[a] && (this._listeners[a] = new Map);
                        var h = {};
                        this._listeners[a].set(h, c);
                        return {
                            remove: function () {
                                return e._listeners[a].delete(h)
                            }
                        }
                    };
                    c.prototype.once = function (a, c) {
                        var e = this.on(a, function (a) {
                            e.remove();
                            c(a)
                        });
                        return e
                    };
                    c.prototype.emit = function (a, c) {
                        this.hasEventListener(a) && this._listeners[a].forEach(function (a) {
                            return a(c)
                        })
                    };
                    c.prototype.hasEventListener = function (a) {
                        return null != this._listeners[a] && 0 < this._listeners[a].size
                    };
                    return c
                }();
                c.default = n
            })
        }, "esri/views/2d/engine/BitmapTile": function () {
            define("require exports ../../../core/tsSupport/extendsHelper ../../../core/tsSupport/decorateHelper ../../../core/ObjectPool ../tiling ./Bitmap ./Tiled ../tiling/enums".split(" "),
                function (n, c, e, a, l, k, h, g, b) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    n = function (a) {
                        function c(b) {
                            b = a.call(this, b) || this;
                            b.key = new k.TileKey(0, 0, 0, 0);
                            return b
                        }

                        e(c, a);
                        c.prototype.acquire = function (a) {
                        };
                        c.prototype.release = function () {
                            this.key.set(0, 0, 0, 0);
                            this.status = b.TileStatus.INITIALIZED;
                            this.source = null
                        };
                        c.pool = new l(c, !0);
                        return c
                    }(g(h));
                    c.default = n
                })
        }, "esri/views/2d/tiling": function () {
            define("require exports ./tiling/TileInfoView ./tiling/TileKey ./tiling/TileQueue ./tiling/TileStrategy".split(" "),
                function (n, c, e, a, l, k) {
                    Object.defineProperty(c, "__esModule", {value: !0});
                    c.TileInfoView = e;
                    c.TileKey = a;
                    c.TileQueue = l;
                    c.TileStrategy = k
                })
        }, "esri/views/2d/engine/Bitmap": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper", "./DisplayObject"], function (n, c, e, a) {
                var l = [0, 0];
                return function (a) {
                    function c(c) {
                        var b = a.call(this) || this;
                        b.height = 0;
                        b.resolution = 0;
                        b.rotation = 0;
                        b._source = null;
                        b._sourceHandle = null;
                        b.width = 0;
                        b.x = 0;
                        b.y = 0;
                        b.source = c;
                        b.requestRender = b.requestRender.bind(b);
                        return b
                    }

                    e(c, a);
                    Object.defineProperty(c.prototype, "source", {
                        get: function () {
                            return this._source
                        }, set: function (a) {
                            this._sourceHandle && (this._sourceHandle.remove(), this._sourceHandle = null);
                            if (this._source = a) this._sourceHandle = this._source.on("update", this.requestRender);
                            this.requestRender()
                        }, enumerable: !0, configurable: !0
                    });
                    c.prototype.doRender = function (a) {
                        this.source && this.source.ready && this.renderCanvas2D(a)
                    };
                    c.prototype.renderCanvas2D = function (a) {
                        var b = this.source, c = a.context, e = a.state;
                        a = e.rotation;
                        var g = this.resolution /
                            e.resolution * e.pixelRatio;
                        if (!(.05 > g)) {
                            c.save();
                            var h = e.toScreen(l, this.x, this.y), e = h[0], h = h[1];
                            .99 < g && 1.01 > g ? c.translate(Math.round(e), Math.round(h)) : (c.translate(e, h), c.scale(g, g));
                            a && c.rotate(a * Math.PI / 180);
                            b.rotation && (c.translate(.5 * this.width, .5 * this.height), c.rotate(-b.rotation * Math.PI / 180), c.translate(.5 * -this.width, .5 * -this.height));
                            h = b.resolution || this.resolution;
                            a = (this.x - b.x) / h;
                            g = -(this.y - b.y) / h;
                            e = this.resolution / h * (b.width || this.width);
                            h = this.resolution / h * (b.height || this.height);
                            c.clearRect(0,
                                0, this.width, this.height);
                            b.draw(c, Math.round(a), Math.round(g), Math.round(e), Math.round(h), 0, 0, this.width, this.height);
                            c.restore()
                        }
                    };
                    return c
                }(a)
            })
        }, "esri/views/2d/engine/Tiled": function () {
            define(["require", "exports", "../../../core/tsSupport/extendsHelper", "./Evented", "../tiling/enums"], function (n, c, e, a, l) {
                return function (c) {
                    c = function (a) {
                        function c() {
                            for (var b = 0; b < arguments.length; b++) ;
                            b = a.call(this) || this;
                            b.status = l.TileStatus.INITIALIZED;
                            return b
                        }

                        e(c, a);
                        return c
                    }(c);
                    return a.EventedMixin(c)
                }
            })
        },
        "esri/views/2d/engine/Canvas2DContainer": function () {
            define("require exports ../../../core/tsSupport/extendsHelper ../../../core/promiseUtils ../ViewState ./Container ../../support/screenshotUtils".split(" "), function (n, c, e, a, l, k, h) {
                var g = {png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg"};
                return function (b) {
                    function c() {
                        var a = null !== b && b.apply(this, arguments) || this;
                        a._childrenRenderParameters = {context: null, pixelRatio: 1, state: new l, stationary: !0};
                        a.hidpi = !1;
                        return a
                    }

                    e(c, b);
                    c.prototype.createElement =
                        function () {
                            var a = document.createElement("canvas");
                            a.setAttribute("class", "esri-display-object");
                            return a
                        };
                    c.prototype.setElement = function (a) {
                        this.element = a
                    };
                    c.prototype.takeScreenshot = function (b) {
                        void 0 === b && (b = {});
                        var c = b.pixelRatio || 1, d = {context: null, pixelRatio: c, state: new l, stationary: !0};
                        d.opacity = this._childrenRenderParameters.opacity;
                        d.state.copy(this._childrenRenderParameters.state);
                        var e = Math.round(c * d.state.width), f = Math.round(c * d.state.height), k = 0, n = 0, x = e,
                            v = f, y = e, w = f;
                        if (y = b.area) k = Math.round(c *
                            y.x), n = Math.round(c * y.y), x = Math.round(c * y.width), v = Math.round(c * y.height);
                        void 0 !== b.width && void 0 !== b.height ? (y = b.width / b.height, v * y < x ? (y *= v, k += Math.floor((x - y) / 2), x = Math.floor(y)) : (y = x / y, n += Math.floor((v - y) / 2), v = Math.floor(y)), y = b.width, w = b.height) : (y = x, w = v);
                        var z = document.createElement("canvas"), c = new Uint8Array(x * v * 4);
                        z.width = y;
                        z.height = w;
                        d.context = z.getContext("2d");
                        this.beforeRenderChildren(d, d);
                        if (void 0 !== b.rotation && null !== b.rotation) {
                            var B = d.state, A = B.clone();
                            A.viewpoint.rotation = b.rotation;
                            d.state = A;
                            this.renderChildren(d);
                            d.state = B
                        } else this.renderChildren(d);
                        this.afterRenderChildren(d, d);
                        var C;
                        try {
                            C = d.context.getImageData(0, 0, y, w)
                        } catch (D) {
                            return a.reject(D)
                        }
                        0 === k && 0 === n && x === e && v === f && y === e && w === f || h.resampleHermite(c, x, v, C.data, y, w, !0);
                        d.context.putImageData(C, 0, 0);
                        d = g[b.format ? b.format.toLowerCase() : "png"];
                        d = {
                            dataURL: z.toDataURL(d, null != b.quality ? b.quality / 100 : 1),
                            x: 0,
                            y: 0,
                            width: y,
                            height: w
                        };
                        b.returnByteBuffer && (d.data = c);
                        return a.resolve(d)
                    };
                    c.prototype.doRender = function (a) {
                        var c =
                            this.element, d = c.style;
                        if (this.visible) {
                            var e = a.state, f = a.pixelRatio, g = e.width, e = e.height;
                            c.width = g * (this.hidpi ? f : 1);
                            c.height = e * (this.hidpi ? f : 1);
                            d.display = "block";
                            d.opacity = "" + Math.min(this.opacity, this.parent.opacity);
                            d.width = g + "px";
                            d.height = e + "px";
                            b.prototype.doRender.call(this, a)
                        } else d.display = "none"
                    };
                    c.prototype.prepareChildrenRenderParameters = function (a) {
                        var b = this._childrenRenderParameters;
                        b.context = this.element.getContext("2d");
                        b.pixelRatio = a.pixelRatio;
                        b.state.copy(a.state);
                        b.state.pixelRatio =
                            this.hidpi ? a.pixelRatio : 1;
                        b.stationary = a.stationary;
                        return b
                    };
                    c.prototype.beforeRenderChildren = function (a, b) {
                        a = b.context;
                        var c = b.state;
                        a.save();
                        if (c.spatialReference.isWrappable) {
                            var d = c.width;
                            b = c.height;
                            var e = c.pixelRatio, f = this.hidpi ? e : 1, e = c.rotation * Math.PI / 180,
                                g = Math.round(d * f * Math.abs(Math.cos(e)) + b * f * Math.abs(Math.sin(e))),
                                c = c.worldScreenWidth * f;
                            c < g && (d = d * f * .5, b = b * f * .5, e && (a.translate(d, b), a.rotate(e), a.translate(-d, -b)), a.beginPath(), a.rect(d - .5 * c, b - .5 * g, c, g), a.closePath(), e && (a.translate(d,
                                b), a.rotate(-e), a.translate(-d, -b)), a.clip("evenodd"))
                        }
                    };
                    c.prototype.afterRenderChildren = function (a, b) {
                        b.context.restore()
                    };
                    c.prototype.renderChild = function (a, b) {
                        b.context.save();
                        a.processRender(b);
                        b.context.restore()
                    };
                    return c
                }(k)
            })
        }, "*now": function (n) {
            n(['dojo/i18n!*preload*esri/views/nls/MapView*["ar","ca","cs","da","de","el","en-gb","en-us","es-es","fi-fi","fr-fr","he-il","hu","it-it","ja-jp","ko-kr","nl-nl","nb","pl","pt-br","pt-pt","ru","sk","sl","sv","th","tr","zh-tw","zh-cn","ROOT"]'])
        }, "*noref": 1
    }
});
define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper dojo/promise/all ../core/Handles ../core/promiseUtils ../core/workers ../core/accessorSupport/decorators ../geometry/ScreenPoint ./BreakpointsOwner ./MapViewBase ./2d/engine/Stage ./2d/input/MapViewInputManager ./2d/layers/support/GraphicsView2D ./2d/navigation/MapViewNavigation ./2d/support/HighlightOptions ./support/screenshotUtils ./ui/2d/DefaultUI2D".split(" "), function (n, c, e, a, l, k, h, g, b, d, f, m, q, p,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           t, u, r, x, v) {
    return function (c) {
        function f(a) {
            a = c.call(this, a) || this;
            a._graphicsView = null;
            a._mapViewHandles = new k;
            a._stage = null;
            a.highlightOptions = new r;
            a.inputManager = new p({view: a});
            a.navigation = null;
            a.ui = new v;
            a.rendering = !1;
            g.initialize();
            return a
        }

        e(f, c);
        Object.defineProperty(f.prototype, "interacting", {
            get: function () {
                return this.navigation && this.navigation.interacting || !1
            }, enumerable: !0, configurable: !0
        });
        f.prototype.hitTest = function (a, b) {
            var c;
            c = null != a && a.x ? a : new d({x: a, y: b});
            if (!this._setup ||
                isNaN(c.x) || isNaN(c.y)) return h.resolve({screenPoint: c, results: []});
            var e = this.toMap(c);
            a = [this._graphicsView];
            a.push.apply(a, this.allLayerViews.toArray().reverse());
            return l(a.map(function (a) {
                return a && a.hitTest ? a.hitTest(c.x, c.y) : null
            })).then(function (a) {
                return {
                    screenPoint: c, results: a.filter(function (a) {
                        return null != a
                    }).map(function (a) {
                        return {mapPoint: e, graphic: a}
                    })
                }
            })
        };
        f.prototype.takeScreenshot = function (a) {
            if (!this._setup) return h.reject("Map view cannot be used before it is ready");
            a = x.adjustScreenshotSettings(a,
                this);
            return this._stage.takeScreenshot(a)
        };
        f.prototype.on = function (a, b, c) {
            var d = this.inputManager && this.inputManager.viewEvents.register(a, b, c);
            return d ? d : this.inherited(arguments)
        };
        f.prototype.hasEventListener = function (a) {
            return this.inherited(arguments) || this.inputManager && this.inputManager.viewEvents.hasHandler(a)
        };
        f.prototype.destroyLayerViews = function () {
            this.inherited(arguments);
            this._stage && (this._stage.destroy(), this._stage = null)
        };
        f.prototype._startup = function () {
            var a = this;
            this.inherited(arguments);
            var b = new q(this.surface), c = new t({view: this, graphics: this.graphics}),
                d = new u({view: this, animationManager: this.animationManager});
            this._stage = b;
            this._graphicsView = c;
            this._set("navigation", d);
            this._mapViewHandles.add([this.allLayerViews.on("change", function () {
                return a._updateStageChildren()
            }), b.on("post-render", function () {
                return a._set("rendering", a.allLayerViews.some(function (a) {
                    return !0 === a.rendering
                }))
            }), this.watch("stationary", function (a) {
                return b.stationary = a
            }, !0), this.watch("state.viewpoint",
                function (c) {
                    return b.state = a.state
                }, !0)]);
            b.state = this.state;
            this._updateStageChildren()
        };
        f.prototype._tearDown = function () {
            this._setup && (this._graphicsView.destroy(), this._mapViewHandles.removeAll(), this._stage.destroy(), this.navigation.destroy(), this._graphicsView = this._stage = null, this._set("navigation", null), this.inherited(arguments))
        };
        f.prototype._updateStageChildren = function () {
            var a = this;
            this._stage.removeAllChildren();
            this.allLayerViews.filter(function (a) {
                return null != a.container
            }).forEach(function (b,
                                 c) {
                a._stage.addChildAt(b.container, c)
            });
            this._stage.addChild(this._graphicsView.container)
        };
        a([b.property({type: r})], f.prototype, "highlightOptions", void 0);
        a([b.property({readOnly: !0})], f.prototype, "inputManager", void 0);
        a([b.property({readOnly: !0})], f.prototype, "navigation", void 0);
        a([b.property({dependsOn: ["navigation.interacting"], type: Boolean})], f.prototype, "interacting", null);
        a([b.property({type: v})], f.prototype, "ui", void 0);
        a([b.property({readOnly: !0})], f.prototype, "rendering", void 0);
        return f =
            a([b.subclass("esri.views.MapView")], f)
    }(b.declared(m, f))
});