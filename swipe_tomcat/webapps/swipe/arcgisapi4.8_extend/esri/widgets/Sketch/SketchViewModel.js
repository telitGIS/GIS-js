// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../geometry ../../Graphic ../../core/Accessor ../../core/Evented ../../core/Handles ../../core/watchUtils ../../core/accessorSupport/decorators ../../layers/GraphicsLayer ../../symbols/SimpleFillSymbol ../../symbols/SimpleLineSymbol ../../symbols/SimpleMarkerSymbol ../../views/2d/draw/Draw ../../views/2d/draw/support/Box ../../views/2d/draw/support/GraphicMover ../../views/2d/draw/support/Reshape ./support/sketchUtils".split(" "),
    function (da, ea, B, q, r, m, C, D, S, E, p, T, A, F, v, U, G, V, H, n) {
        var I = function (f) {
                function d() {
                    return null !== f && f.apply(this, arguments) || this
                }

                B(d, f);
                q([p.property()], d.prototype, "reset", void 0);
                return d = q([p.subclass()], d)
            }(p.declared(C, D)), u = function (f) {
                function d() {
                    var c = null !== f && f.apply(this, arguments) || this;
                    c.type = null;
                    return c
                }

                B(d, f);
                q([p.property()], d.prototype, "type", void 0);
                q([p.property()], d.prototype, "complete", void 0);
                q([p.property()], d.prototype, "cancel", void 0);
                return d = q([p.subclass()], d)
            }(p.declared(C,
            D)), W = function () {
                return function (f) {
                    this.tool = f;
                    this.type = "create-init"
                }
            }(), w = function () {
                return function (f, d) {
                    this.tool = f;
                    this.geometry = d;
                    this.type = "create-start"
                }
            }(), t = function () {
                return function (f, d) {
                    this.tool = f;
                    this.geometry = d;
                    this.type = "create"
                }
            }(), X = function () {
                return function (f) {
                    this.tool = f;
                    this.type = "create-cancel"
                }
            }(), Y = function () {
                return function (f, d) {
                    this.tool = f;
                    this.geometry = d;
                    this.type = "create-complete"
                }
            }(), Z = function () {
                return function (f, d) {
                    this.geometry = f;
                    this.graphic = d;
                    this.type = "update-init"
                }
            }(),
            aa = function () {
                return function (f, d) {
                    this.geometry = f;
                    this.graphic = d;
                    this.type = "update-cancel"
                }
            }(), ba = function () {
                return function (f, d) {
                    this.geometry = f;
                    this.graphic = d;
                    this.type = "update-complete"
                }
            }(), ca = function () {
                return function () {
                    this.type = "reset"
                }
            }(), J = function () {
                return function (f, d, c) {
                    this.geometry = f;
                    this.angle = d;
                    this.graphic = c;
                    this.type = "rotate-start"
                }
            }(), K = function () {
                return function (f, d, c) {
                    this.geometry = f;
                    this.angle = d;
                    this.graphic = c;
                    this.type = "rotate"
                }
            }(), L = function () {
                return function (f, d, c) {
                    this.geometry =
                        f;
                    this.angle = d;
                    this.graphic = c;
                    this.type = "rotate-complete"
                }
            }(), M = function () {
                return function (f, d, c, a) {
                    this.geometry = f;
                    this.xScale = d;
                    this.yScale = c;
                    this.graphic = a;
                    this.type = "scale-start"
                }
            }(), N = function () {
                return function (f, d, c, a) {
                    this.geometry = f;
                    this.xScale = d;
                    this.yScale = c;
                    this.graphic = a;
                    this.type = "scale"
                }
            }(), O = function () {
                return function (f, d, c, a) {
                    this.geometry = f;
                    this.xScale = d;
                    this.yScale = c;
                    this.graphic = a;
                    this.type = "scale-complete"
                }
            }(), x = function () {
                return function (f, d, c, a) {
                    this.geometry = f;
                    this.dx = d;
                    this.dy =
                        c;
                    this.graphic = a;
                    this.type = "move-start"
                }
            }(), y = function () {
                return function (f, d, c, a) {
                    this.geometry = f;
                    this.dx = d;
                    this.dy = c;
                    this.graphic = a;
                    this.type = "move"
                }
            }(), z = function () {
                return function (f, d, c, a) {
                    this.geometry = f;
                    this.dx = d;
                    this.dy = c;
                    this.graphic = a;
                    this.type = "move-complete"
                }
            }(), P = function () {
                return function (f, d) {
                    this.geometry = f;
                    this.graphic = d;
                    this.type = "reshape-start"
                }
            }(), Q = function () {
                return function (f, d) {
                    this.geometry = f;
                    this.graphic = d;
                    this.type = "reshape"
                }
            }(), R = function () {
                return function (f, d) {
                    this.geometry =
                        f;
                    this.graphic = d;
                    this.type = "reshape-complete"
                }
            }();
        return function (f) {
            function d(c) {
                c = f.call(this, c) || this;
                c._activeLineGraphic = null;
                c._centerGraphic = null;
                c._centerSymbol = new v({
                    type: "simple-marker",
                    style: "circle",
                    size: 3,
                    color: [255, 255, 255],
                    outline: {color: [100, 100, 100]}
                });
                c._defaultGraphicsLayer = new T({listMode: "hide"});
                c._defaultSegmentOffset = 48;
                c._handles = new S;
                c._layer = null;
                c._lineGraphic = null;
                c._operationHandle = null;
                c._targetGraphic = null;
                c._updatePolygonBoxSymbol = new A({
                    type: "simple-fill", color: [0,
                        200, 255, .5], outline: {join: "round", color: [0, 12, 255], width: 2}
                });
                c._vertexGraphics = [];
                c.activeFillSymbol = new A({
                    type: "simple-fill",
                    style: "solid",
                    color: [150, 150, 150, .2],
                    outline: {color: [0, 0, 0, 0]}
                });
                c.activeLineSymbol = new F({type: "simple-line", color: [12, 207, 255, 1], width: 2, style: "dash"});
                c.activePointSymbol = new v({
                    type: "simple-marker",
                    style: "circle",
                    size: 6,
                    color: [12, 207, 255],
                    outline: {color: [50, 50, 50], width: 1}
                });
                c.draw = null;
                c.graphic = null;
                c.hoverVertexSymbol = new v({
                    type: "simple-marker", style: "circle", size: 8,
                    color: [33, 205, 255], outline: {color: [0, 12, 255], width: 1}
                });
                c.layer = null;
                c.pointSymbol = new v({
                    type: "simple-marker",
                    style: "circle",
                    size: 6,
                    color: [255, 255, 255],
                    outline: {color: [50, 50, 50], width: 1}
                });
                c.polygonSymbol = new A({
                    type: "simple-fill",
                    color: [150, 150, 150, .2],
                    outline: {color: [50, 50, 50], width: 2}
                });
                c.polylineSymbol = new F({type: "simple-line", color: [130, 130, 130], width: 2});
                c.selectedVertexSymbol = new v({
                    type: "simple-marker",
                    style: "circle",
                    size: 8,
                    color: [255, 255, 255],
                    outline: {color: [0, 12, 255], width: 1}
                });
                c.updatePointSymbol =
                    new v({
                        type: "simple-marker",
                        size: 10,
                        color: [0, 200, 255, .5],
                        outline: {color: "black", width: 1}
                    });
                c.updatePolygonSymbol = new A({
                    type: "simple-fill",
                    color: [12, 207, 255, .2],
                    outline: {join: "round", color: [12, 207, 255], width: 2}
                });
                c.updatePolylineSymbol = new F({type: "simple-line", color: [12, 207, 255], width: 2});
                c.vertexSymbol = new v({
                    type: "simple-marker",
                    style: "circle",
                    size: 6,
                    color: [33, 205, 255],
                    outline: {color: [0, 12, 255], width: 1}
                });
                c.view = null;
                return c
            }

            B(d, f);
            d.prototype.initialize = function () {
                var c = this;
                this._handles.add([E.whenOnce(this,
                    "view.ready", function () {
                        c._set("draw", new U({view: c.view}))
                    }), E.when(this, "layer", function () {
                    c.view && c.view.map.remove(c._defaultGraphicsLayer);
                    c._layer = c.layer
                }), E.whenNot(this, "layer", function () {
                    c.view && c.view.map.add(c._defaultGraphicsLayer);
                    c._layer = c._defaultGraphicsLayer
                })])
            };
            d.prototype.destroy = function () {
                this.reset();
                this._handles.removeAll();
                this._handles = null;
                this.view && this.view.map.remove(this._defaultGraphicsLayer);
                this._defaultGraphicsLayer.destroy();
                this._layer = this._defaultGraphicsLayer =
                    null;
                this.draw && this.draw.destroy();
                this._set("draw", null);
                this._set("view", null);
                this.emit("destroy")
            };
            Object.defineProperty(d.prototype, "state", {
                get: function () {
                    var c = !!this.get("view.ready"), a = this._operationHandle;
                    return c && a ? "create" === a.type ? "creating" : "updating" : c ? "ready" : "disabled"
                }, enumerable: !0, configurable: !0
            });
            d.prototype.complete = function () {
                this._operationHandle && this._operationHandle.complete();
                this.draw.reset()
            };
            d.prototype.create = function (c, a) {
                var b = this;
                this._operationHandle && this._operationHandle.cancel();
                this._operationHandle = null;
                var k;
                switch (c) {
                    case "point":
                        k = this._createPointOperation(a);
                        break;
                    case "polygon":
                        k = this._createPolygonOperation(a);
                        break;
                    case "polyline":
                        k = this._createPolylineOperation(a);
                        break;
                    case "multipoint":
                        k = this._createMultipointOperation(a);
                        break;
                    case "rectangle":
                        k = this._createRectangleOperation(a);
                        break;
                    case "circle":
                        k = this._createCircleOperation(a);
                        break;
                    case "ellipse":
                        k = this._createEllipseOperation(a);
                        break;
                    case "triangle":
                        k = this._createTriangleOperation(a)
                }
                if (k) return k.on("complete",
                    function () {
                        k === b._operationHandle && (b._operationHandle = null, b.emit("create-complete", new Y(c, b.graphic.geometry.clone())))
                    }), k.on("cancel", function () {
                    k === b._operationHandle && (b._operationHandle = null, b.emit("create-cancel", new X(c)))
                }), this._operationHandle = k, this.emit("create-init", new W(c)), k
            };
            d.prototype.reset = function () {
                this._clearGraphics();
                this._operationHandle && this._operationHandle.cancel();
                this._operationHandle = null;
                this.view.container.style.cursor = "default";
                this.graphic && this._layer.remove(this.graphic);
                this._set("graphic", null);
                this.draw.reset();
                this.emit("reset", new ca)
            };
            d.prototype.update = function (c, a) {
                var b = this;
                this._operationHandle && this._operationHandle.cancel();
                this._operationHandle = null;
                if (c && c.geometry) {
                    var k;
                    switch (c.geometry.type) {
                        case "point":
                            k = this._updatePointOperation(c, a);
                            break;
                        case "polyline":
                            k = this._updatePolylineOperation(c, a);
                            break;
                        case "polygon":
                            k = this._updatePolygonOperation(c, a)
                    }
                    if (k) return k.on("complete", function () {
                        k === b._operationHandle && (b._operationHandle = null, b.emit("update-complete",
                            new ba(b.graphic.geometry, c)))
                    }), k.on("cancel", function () {
                        k === b._operationHandle && (b._operationHandle = null, b.emit("update-cancel", new aa(b.graphic.geometry, c)))
                    }), this._operationHandle = k, this.emit("update-init", new Z(this.graphic.geometry, c)), k
                }
            };
            d.prototype._createPointOperation = function (c) {
                var a = this;
                c = this.draw.create("point", c);
                var b = null, k = [c.on("cursor-update", function (c) {
                    b = a._displayCrosshairCursor()
                }), c.on("draw-complete", function (b) {
                    a._layer.remove(a.graphic);
                    b = b.coordinates;
                    a._set("graphic",
                        new m(new r.Point({
                            x: b[0],
                            y: b[1],
                            spatialReference: a.view.spatialReference
                        }), a.pointSymbol));
                    e && e.complete()
                })], e = new u({
                    type: "create", complete: function () {
                        a._layer.remove(a.graphic);
                        b && b.reset();
                        k.forEach(function (a) {
                            return a.remove()
                        });
                        a.draw.reset();
                        e.emit("complete")
                    }, cancel: function () {
                        a._layer.remove(a.graphic);
                        b && b.reset();
                        k.forEach(function (a) {
                            return a.remove()
                        });
                        a.draw.reset();
                        e.emit("cancel")
                    }
                });
                return e
            };
            d.prototype._createPolygonOperation = function (c) {
                var a = this, b = this.draw.create("polygon",
                    c), k = new r.Point, e = null, g = null, d = !1, h = [b.on("vertex-add", function (b) {
                    var c = b.vertices;
                    g = b;
                    d && a._snapLastVertexToAxis(c);
                    a._showPolygonGraphic(c, !1);
                    1 === c.length ? a.emit("create-start", new w("polygon", a.graphic.geometry)) : a.emit("create", new t("polygon", a.graphic.geometry))
                }), b.on("vertex-remove", function (b) {
                    var c = b.vertices;
                    g = b;
                    d && a._snapLastVertexToAxis(c);
                    a._showPolygonGraphic(c, !1);
                    a.emit("create", new t("polygon", a.graphic.geometry))
                }), b.on("vertex-update", function (b) {
                    var c = b.vertices;
                    g = b;
                    d && a._snapLastVertexToAxis(c);
                    a._showPolygonGraphic(c, !1);
                    a.emit("create", new t("polyline", a.graphic.geometry))
                }), b.on("cursor-update", function (b) {
                    var c = b.vertices, l = b.native;
                    g = b;
                    a.view.toMap(l.x, l.y, k);
                    d && a._snapLastVertexToAxis(c);
                    a._showPolygonGraphic(c, !0)
                }), b.on("draw-complete", function (b) {
                    a._layer.remove(a.graphic);
                    a._set("graphic", new m(n.createPolygon([b.vertices], a.view), a.polygonSymbol));
                    l && l.complete()
                }), b.on("undo", function (b) {
                    b = b.vertices;
                    var c = g && "cursor-update" === g.type;
                    b.length ? (d && a._snapLastVertexToAxis(b), a._showPolygonGraphic(b,
                        c)) : a._clearGraphics()
                }), b.on("redo", function (b) {
                    b = b.vertices;
                    var c = g && "cursor-update" === g.type;
                    d && a._snapLastVertexToAxis(b);
                    a._showPolygonGraphic(b, c)
                }), this.view.on("key-down", function (c) {
                    var h = b.vertices.slice(0), e = g && "cursor-update" === g.type;
                    "Control" !== c.key || d ? "z" === c.key ? (c.stopPropagation(), b.canUndo() && b.undo()) : "r" === c.key ? (c.stopPropagation(), b.canRedo() && b.redo()) : "Escape" === c.key && l && l.cancel() : (d = !0, e && a._snapLastVertexToAxis(h), a._showPolygonGraphic(h, e))
                }), this.view.on("key-up", function (c) {
                    var l =
                        b.vertices.slice(0), h = g && "cursor-update" === g.type;
                    "Control" === c.key && (d = !1, l.pop(), l.push([k.x, k.y]), a._showPolygonGraphic(l, h))
                }), this.view.on("pointer-down", function (b) {
                    a.view.hitTest(b).then(function (c) {
                        c = c.results;
                        c.length && c[0].graphic && 0 === a._vertexGraphics.indexOf(c[0].graphic) && b.stopPropagation()
                    })
                }), this.view.on("click", function (c) {
                    a.view.hitTest(c).then(function (l) {
                        l = l.results;
                        l.length && l[0].graphic && 0 === a._vertexGraphics.indexOf(l[0].graphic) && 2 < a._vertexGraphics.length && (c.stopPropagation(),
                        g && "cursor-update" === g.type && b.vertices.pop(), b.complete())
                    })
                }), this.view.on("pointer-move", function (b) {
                    a.view.hitTest(b).then(function (b) {
                        e = a._displayCrosshairCursor()
                    })
                })], l = new u({
                    type: "create", complete: function () {
                        a._clearGraphics();
                        a._layer.remove(a.graphic);
                        e && e.reset();
                        h.forEach(function (a) {
                            return a.remove()
                        });
                        a.draw.reset();
                        l.emit("complete")
                    }, cancel: function () {
                        a._clearGraphics();
                        a._layer.remove(a.graphic);
                        e && e.reset();
                        h.forEach(function (a) {
                            return a.remove()
                        });
                        a.draw.reset();
                        l.emit("cancel")
                    }
                });
                return l
            };
            d.prototype._createPolylineOperation = function (c) {
                var a = this, b = this.draw.create("polyline", c), k = new r.Point, e = null, g = null, d = !1,
                    h = [b.on("vertex-add", function (b) {
                        var c = b.vertices;
                        e = b;
                        d && a._snapLastVertexToAxis(c);
                        a._showPolylineGraphic(c, !1);
                        1 === c.length ? a.emit("create-start", new w("polyline", a.graphic.geometry)) : a.emit("create", new t("polyline", a.graphic.geometry))
                    }), b.on("vertex-remove", function (b) {
                        var c = b.vertices;
                        e = b;
                        d && a._snapLastVertexToAxis(c);
                        a._showPolylineGraphic(c, !1);
                        a.emit("create",
                            new t("polyline", a.graphic.geometry))
                    }), b.on("vertex-update", function (b) {
                        var c = b.vertices;
                        e = b;
                        d && a._snapLastVertexToAxis(c);
                        a._showPolylineGraphic(c, !1);
                        a.emit("create", new t("polyline", a.graphic.geometry))
                    }), b.on("cursor-update", function (b) {
                        var c = b.vertices, l = b.native;
                        e = b;
                        a.view.toMap(l.x, l.y, k);
                        d && a._snapLastVertexToAxis(c);
                        a._showPolylineGraphic(c, !0)
                    }), b.on("draw-complete", function (b) {
                        a._layer.remove(a.graphic);
                        a._set("graphic", new m(n.createPolyline([b.vertices], a.view), a.polylineSymbol));
                        l &&
                        l.complete()
                    }), b.on("undo", function (b) {
                        b = b.vertices;
                        var c = e && "cursor-update" === e.type;
                        b.length ? (d && a._snapLastVertexToAxis(b), a._showPolylineGraphic(b, c)) : a._clearGraphics()
                    }), b.on("redo", function (b) {
                        b = b.vertices;
                        var c = e && "cursor-update" === e.type;
                        d && a._snapLastVertexToAxis(b);
                        a._showPolylineGraphic(b, c)
                    }), this.view.on("key-down", function (c) {
                        var h = b.vertices.slice(0), k = e && "cursor-update" === e.type;
                        "Control" !== c.key || d ? "z" === c.key ? (c.stopPropagation(), b.canUndo() && b.undo()) : "r" === c.key ? (c.stopPropagation(),
                        b.canRedo() && b.redo()) : "Escape" === c.key && l && l.cancel() : (d = !0, k && a._snapLastVertexToAxis(h), a._showPolylineGraphic(h, k))
                    }), this.view.on("key-up", function (c) {
                        var l = b.vertices.slice(0), h = e && "cursor-update" === e.type;
                        "Control" === c.key && (d = !1, l.pop(), l.push([k.x, k.y]), a._showPolylineGraphic(l, h))
                    }), this.view.on("pointer-move", function (b) {
                        a.view.hitTest(b).then(function (b) {
                            g = a._displayCrosshairCursor()
                        })
                    })], l = new u({
                        type: "create", complete: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            g && g.reset();
                            h.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            l.emit("complete")
                        }, cancel: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            g && g.reset();
                            h.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            l.emit("cancel")
                        }
                    });
                return l
            };
            d.prototype._createRectangleOperation = function (c) {
                var a = this, b = this.draw.create("rectangle", c), k = null, e = !1, g = !1,
                    d = [b.on("vertex-add", function (b) {
                        b = b.vertices;
                        a._showRectangleGraphic(b, g, e);
                        1 === b.length ? a.emit("create-start", new w("rectangle", a.graphic.geometry)) :
                            a.emit("create", new t("rectangle", a.graphic.geometry))
                    }), b.on("cursor-update", function (b) {
                        a._showRectangleGraphic(b.vertices, g, e)
                    }), b.on("draw-complete", function (b) {
                        a._layer.remove(a.graphic);
                        b = b.vertices.slice(0);
                        if (1 === b.length) {
                            g = e = !1;
                            var c = a.view.toScreen(b[0][0], b[0][1], null);
                            b = a.view.toMap(c.x - a._defaultSegmentOffset, c.y + a._defaultSegmentOffset);
                            c = a.view.toMap(c.x + a._defaultSegmentOffset, c.y - a._defaultSegmentOffset);
                            b = [[b.x, b.y], [c.x, c.y]]
                        }
                        b = e ? n.createSquare(b, a.view, g) : n.createRectangle(b,
                            a.view, g);
                        a._set("graphic", new m(b, a.polygonSymbol));
                        h && h.complete()
                    }), this.view.on("key-down", function (c) {
                        "Control" !== c.key || e ? "Alt" !== c.key || g ? "Escape" === c.key && h && h.cancel() : (g = !0, a._showRectangleGraphic(b.vertices, g, e)) : (e = !0, a._showRectangleGraphic(b.vertices, g, e))
                    }), this.view.on("key-up", function (c) {
                        "Control" === c.key ? (e = !1, a._showRectangleGraphic(b.vertices, g, e)) : "Alt" === c.key && (g = !1, a._showRectangleGraphic(b.vertices, g, e))
                    }), this.view.on("pointer-move", function (b) {
                        a.view.hitTest(b).then(function (b) {
                            k =
                                a._displayCrosshairCursor()
                        })
                    })], h = new u({
                        type: "create", complete: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            k && k.reset();
                            d.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            h.emit("complete")
                        }, cancel: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            k && k.reset();
                            d.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            h.emit("cancel")
                        }
                    });
                return h
            };
            d.prototype._createMultipointOperation = function (c) {
                var a = this;
                c = this.draw.create("multipoint", c);
                var b = null, k = [c.on("vertex-add",
                    function (b) {
                        b = b.vertices;
                        a._showMultipointGraphic(b);
                        1 === b.length ? a.emit("create-start", new w("multipoint", a.graphic.geometry)) : a.emit("create", new t("multipoint", a.graphic.geometry))
                    }), c.on("vertex-remove", function (b) {
                    a._showMultipointGraphic(b.vertices);
                    a.emit("create", new t("multipoint", a.graphic.geometry))
                }), c.on("vertex-update", function (b) {
                    a._showMultipointGraphic(b.vertices);
                    a.emit("create", new t("multipoint", a.graphic.geometry))
                }), c.on("cursor-update", function (b) {
                    a._showMultipointGraphic(b.vertices)
                }),
                    c.on("draw-complete", function (b) {
                        a._layer.remove(a.graphic);
                        a._set("graphic", new m(n.createMultipoint(b.vertices, a.view), a.pointSymbol));
                        e && e.complete()
                    }), this.view.on("pointer-move", function (c) {
                        a.view.hitTest(c).then(function (c) {
                            b = a._displayCrosshairCursor()
                        })
                    }), this.view.on("key-down", function (b) {
                        "Escape" === b.key && e && e.cancel()
                    })], e = new u({
                    type: "create", complete: function () {
                        a._clearGraphics();
                        a._layer.remove(a.graphic);
                        b && b.reset();
                        k.forEach(function (b) {
                            return b.remove()
                        });
                        a.draw.reset();
                        e.emit("complete")
                    },
                    cancel: function () {
                        a._clearGraphics();
                        a._layer.remove(a.graphic);
                        b && b.reset();
                        k.forEach(function (b) {
                            return b.remove()
                        });
                        a.draw.reset();
                        e.emit("cancel")
                    }
                });
                return e
            };
            d.prototype._createCircleOperation = function (c) {
                var a = this, b = this.draw.create("circle", c), k = null, e = !1, d = !1,
                    f = [b.on("vertex-add", function (b) {
                        b = b.vertices;
                        a._showCircleGraphic(b, d, e);
                        1 === b.length ? a.emit("create-start", new w("circle", a.graphic.geometry)) : a.emit("create", new t("circle", a.graphic.geometry))
                    }), b.on("cursor-update", function (b) {
                        a._showCircleGraphic(b.vertices,
                            d, e)
                    }), b.on("draw-complete", function (c) {
                        a._layer.remove(a.graphic);
                        c = c.vertices.slice(0);
                        if (1 === c.length) {
                            e = !1;
                            d = !0;
                            var l = a.view.toScreen(c[0][0], c[0][1], null),
                                l = new r.ScreenPoint({x: l.x + a._defaultSegmentOffset, y: l.y});
                            c.push(b.getCoordsFromScreenPoint(l))
                        }
                        c = e ? n.createEllipse(c, a.view, d) : n.createCircle(c, a.view, d);
                        a._set("graphic", new m(c, a.polygonSymbol));
                        h && h.complete()
                    }), this.view.on("key-down", function (c) {
                        "Control" !== c.key || e ? "Alt" !== c.key || d ? "Escape" === c.key && h && h.cancel() : (d = !0, a._showCircleGraphic(b.vertices,
                            d, e)) : (e = !0, a._showCircleGraphic(b.vertices, d, e))
                    }), this.view.on("key-up", function (c) {
                        "Control" === c.key ? (e = !1, a._showCircleGraphic(b.vertices, d, e)) : "Alt" === c.key && (d = !1, a._showCircleGraphic(b.vertices, d, e))
                    }), this.view.on("pointer-move", function (b) {
                        a.view.hitTest(b).then(function (b) {
                            k = a._displayCrosshairCursor()
                        })
                    })], h = new u({
                        type: "create", complete: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            k && k.reset();
                            f.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            h.emit("complete")
                        }, cancel: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            k && k.reset();
                            f.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            h.emit("cancel")
                        }
                    });
                return h
            };
            d.prototype._createEllipseOperation = function (c) {
                var a = this, b = this.draw.create("ellipse", c), d = null, e = !1, g = !1,
                    f = [b.on("vertex-add", function (b) {
                        var c = b.vertices;
                        a._showEllipseGraphic(b.vertices, g, e);
                        1 === c.length ? a.emit("create-start", new w("ellipse", a.graphic.geometry)) : a.emit("create", new t("ellipse", a.graphic.geometry))
                    }), b.on("cursor-update", function (b) {
                        a._showEllipseGraphic(b.vertices,
                            g, e)
                    }), b.on("draw-complete", function (c) {
                        a._layer.remove(a.graphic);
                        c = c.vertices.slice(0);
                        if (1 === c.length) {
                            g = e = !0;
                            var d = a.view.toScreen(c[0][0], c[0][1], null),
                                d = new r.ScreenPoint({x: d.x + a._defaultSegmentOffset, y: d.y});
                            c.push(b.getCoordsFromScreenPoint(d))
                        }
                        c = e ? n.createCircle(c, a.view, g) : n.createEllipse(c, a.view, g);
                        a._set("graphic", new m(c, a.polygonSymbol));
                        h && h.complete()
                    }), this.view.on("key-down", function (c) {
                        "Control" !== c.key || e ? "Alt" !== c.key || g ? "Escape" === c.key && h && h.cancel() : (g = !0, a._showEllipseGraphic(b.vertices,
                            g, e)) : (e = !0, a._showEllipseGraphic(b.vertices, g, e))
                    }), this.view.on("key-up", function (c) {
                        "Control" === c.key ? (e = !1, a._showEllipseGraphic(b.vertices, g, e)) : "Alt" === c.key && (g = !1, a._showEllipseGraphic(b.vertices, g, e))
                    }), this.view.on("pointer-move", function (b) {
                        a.view.hitTest(b).then(function (b) {
                            d = a._displayCrosshairCursor()
                        })
                    })], h = new u({
                        type: "create", complete: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            d && d.reset();
                            f.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            h.emit("complete")
                        },
                        cancel: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            d && d.reset();
                            f.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            h.emit("cancel")
                        }
                    });
                return h
            };
            d.prototype._createTriangleOperation = function (c) {
                var a = this, b = this.draw.create("triangle", c), d = null, e = !1, g = !1,
                    f = [b.on("vertex-add", function (b) {
                        var c = b.vertices;
                        a._showTriangleGraphic(b.vertices, g, e);
                        1 === c.length ? a.emit("create-start", new w("triangle", a.graphic.geometry)) : a.emit("create", new t("triangle", a.graphic.geometry))
                    }), b.on("cursor-update",
                        function (b) {
                            a._showTriangleGraphic(b.vertices, g, e)
                        }), b.on("draw-complete", function (c) {
                        a._layer.remove(a.graphic);
                        c = c.vertices.slice(0);
                        if (1 === c.length) {
                            g = e = !0;
                            var d = a.view.toScreen(c[0][0], c[0][1], null),
                                d = new r.ScreenPoint({x: d.x + a._defaultSegmentOffset, y: d.y});
                            c.push(b.getCoordsFromScreenPoint(d))
                        }
                        a._set("graphic", new m(n.createTriangle(c, a.view, g, e), a.polygonSymbol));
                        h && h.complete()
                    }), this.view.on("key-down", function (c) {
                        "Control" !== c.key || e ? "Alt" !== c.key || g ? "Escape" === c.key && h && h.cancel() : (g = !0,
                            a._showTriangleGraphic(b.vertices, g, e)) : (e = !0, a._showTriangleGraphic(b.vertices, g, e))
                    }), this.view.on("key-up", function (c) {
                        "Control" === c.key ? (e = !1, a._showTriangleGraphic(b.vertices, g, e)) : "Alt" === c.key && (g = !1, a._showTriangleGraphic(b.vertices, g, e))
                    }), this.view.on("pointer-move", function (b) {
                        a.view.hitTest(b).then(function (b) {
                            d = a._displayCrosshairCursor()
                        })
                    })], h = new u({
                        type: "create", complete: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            d && d.reset();
                            f.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            h.emit("complete")
                        }, cancel: function () {
                            a._clearGraphics();
                            a._layer.remove(a.graphic);
                            d && d.reset();
                            f.forEach(function (b) {
                                return b.remove()
                            });
                            a.draw.reset();
                            h.emit("cancel")
                        }
                    });
                return h
            };
            d.prototype._updatePointOperation = function (c, a) {
                var b = this, d = null, e = new m(c.geometry, this.updatePointSymbol);
                this._layer.add(e);
                this._set("graphic", e.clone());
                var g = [this.view.on("click", function (a) {
                    b.view.hitTest(a).then(function (b) {
                        b = b.results;
                        b.length && b[0].graphic && b[0].graphic === e || (e.geometry !==
                        c.geometry ? h && h.complete() : h && h.cancel())
                    })
                }), this.view.on("key-down", function (a) {
                    "Escape" === a.key && (b.graphic.geometry !== c.geometry ? h && h.complete() : h && h.cancel())
                })], f = new V({
                    graphics: [e], view: this.view, callbacks: {
                        onGraphicMoveStart: function (a) {
                            b.emit("move-start", new x(b.graphic.geometry, a.dx, a.dy, c))
                        }, onGraphicMove: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("move", new y(b.graphic.geometry, a.dx, a.dy, c))
                        }, onGraphicMoveStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("move-complete", new z(b.graphic.geometry,
                                a.dx, a.dy, c))
                        }, onGraphicPointerOver: function (c) {
                            d = b._displayPointerCursor()
                        }, onGraphicPointerOut: function (b) {
                            d && d.reset();
                            d = null
                        }
                    }
                }), h = new u({
                    type: "update", complete: function () {
                        f.destroy();
                        b._layer.remove(e);
                        g.forEach(function (b) {
                            return b.remove()
                        });
                        d && d.reset();
                        b.draw.reset();
                        b.graphic.set("geometry", e.geometry);
                        h.emit("complete")
                    }, cancel: function () {
                        f.destroy();
                        b._layer.remove(e);
                        g.forEach(function (b) {
                            return b.remove()
                        });
                        d && d.reset();
                        b.draw.reset();
                        b.graphic.set("geometry", e.geometry);
                        h.emit("cancel")
                    }
                });
                return h
            };
            d.prototype._updatePolygonOperation = function (c, a) {
                var b = this;
                this._set("graphic", new m(c.geometry, this.updatePolygonSymbol));
                this._layer.add(this.graphic);
                var d = new G({
                    graphic: this.graphic, view: this.view, callbacks: {
                        onMoveStart: function (a) {
                            b.emit("move-start", new x(b.graphic.geometry, a.dx, a.dy, c))
                        }, onMove: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("move", new y(b.graphic.geometry, a.dx, a.dy, c))
                        }, onMoveStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("move-complete", new z(b.graphic.geometry,
                                a.dx, a.dy, c))
                        }, onScaleStart: function (a) {
                            b.emit("scale-start", new M(b.graphic.geometry, a.xScale, a.yScale, c))
                        }, onScale: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("scale", new N(b.graphic.geometry, a.xScale, a.yScale, c))
                        }, onScaleStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("scale-complete", new O(b.graphic.geometry, a.xScale, a.yScale, c))
                        }, onRotateStart: function (a) {
                            b.emit("rotate-start", new J(b.graphic.geometry, a.angle, c))
                        }, onRotate: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("rotate", new K(b.graphic.geometry,
                                a.angle, c))
                        }, onRotateStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("rotate-complete", new L(b.graphic.geometry, a.angle, c))
                        }
                    }
                }), e = new H({
                    graphic: null, view: this.view, callbacks: {
                        onReshapeStart: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("reshape-start", new P(b.graphic.geometry, c))
                        }, onReshape: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("reshape", new Q(b.graphic.geometry, c))
                        }, onReshapeStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("reshape-complete", new R(b.graphic.geometry, c))
                        }, onMoveStart: function (a) {
                            b.emit("move-start",
                                new x(b.graphic.geometry, a.dx, a.dy, c))
                        }, onMove: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("move", new y(b.graphic.geometry, a.dx, a.dy, c))
                        }, onMoveStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("move-complete", new z(b.graphic.geometry, a.dx, a.dy, c))
                        }
                    }
                }), g = [this.view.on("click", function (a) {
                    b.view.hitTest(a).then(function (a) {
                        if (a.results.length && a.results[0].graphic) {
                            a = a.results[0].graphic;
                            if (d && (-1 < d.handleGraphics.indexOf(a) || a === d.rotateGraphic) || e && -1 < e.handleGraphics.indexOf(a)) return;
                            if (a ===
                                d.boxGraphic) {
                                b.graphic.set("symbol", b._updatePolygonBoxSymbol);
                                d.graphic = null;
                                e.graphic = b.graphic;
                                return
                            }
                            if (a === b.graphic) {
                                b.graphic.set("symbol", b.updatePolygonSymbol);
                                e.graphic = null;
                                d.graphic = b.graphic;
                                return
                            }
                        }
                        b.graphic.geometry !== c.geometry ? f && f.complete() : f && f.cancel()
                    })
                }), this.view.on("key-down", function (a) {
                    "Escape" === a.key ? b.graphic.geometry !== c.geometry ? f && f.complete() : f && f.cancel() : "Control" === a.key && d && !a.repeat && d.set("uniformScaling", !0)
                }), this.view.on("key-up", function (b) {
                    "Control" ===
                    b.key && d && d.set("uniformScaling", !1)
                })], f = new u({
                    type: "update", complete: function () {
                        d && d.destroy();
                        e && e.destroy();
                        b._layer.remove(b.graphic);
                        g.forEach(function (b) {
                            return b.remove()
                        });
                        var a = n.createPolygon(b.graphic.geometry.rings, b.view);
                        b.graphic.set("geometry", a);
                        f.emit("complete")
                    }, cancel: function () {
                        d && d.destroy();
                        e && e.destroy();
                        b._layer.remove(b.graphic);
                        g.forEach(function (b) {
                            return b.remove()
                        });
                        f.emit("cancel")
                    }
                });
                return f
            };
            d.prototype._updatePolylineOperation = function (c, a) {
                var b = this;
                this._set("graphic",
                    new m(c.geometry, this.updatePolylineSymbol));
                this._layer.add(this.graphic);
                var d = new G({
                    graphic: this.graphic, view: this.view, callbacks: {
                        onMoveStart: function (a) {
                            b.emit("move-start", new x(b.graphic.geometry, a.dx, a.dy, c))
                        }, onMove: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("move", new y(b.graphic.geometry, a.dx, a.dy, c))
                        }, onMoveStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("move-complete", new z(b.graphic.geometry, a.dx, a.dy, c))
                        }, onScaleStart: function (a) {
                            b.emit("scale-start", new M(b.graphic.geometry,
                                a.xScale, a.yScale, c))
                        }, onScale: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("scale", new N(b.graphic.geometry, a.xScale, a.yScale, c))
                        }, onScaleStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("scale-complete", new O(b.graphic.geometry, a.xScale, a.yScale, c))
                        }, onRotateStart: function (a) {
                            b.emit("rotate-start", new J(b.graphic.geometry, a.angle, c))
                        }, onRotate: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("rotate", new K(b.graphic.geometry, a.angle, c))
                        }, onRotateStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("rotate-complete",
                                new L(b.graphic.geometry, a.angle, c))
                        }
                    }
                }), e = new H({
                    graphic: null, view: this.view, callbacks: {
                        onReshapeStart: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("reshape-start", new P(b.graphic.geometry, c))
                        }, onReshape: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("reshape", new Q(b.graphic.geometry, c))
                        }, onReshapeStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("reshape-complete", new R(b.graphic.geometry, c))
                        }, onMoveStart: function (a) {
                            b.emit("move-start", new x(b.graphic.geometry, a.dx, a.dy, c))
                        }, onMove: function (a) {
                            b._set("graphic",
                                a.graphic);
                            b.emit("move", new y(b.graphic.geometry, a.dx, a.dy, c))
                        }, onMoveStop: function (a) {
                            b._set("graphic", a.graphic);
                            b.emit("move-complete", new z(b.graphic.geometry, a.dx, a.dy, c))
                        }
                    }
                }), g = [this.view.on("click", function (a) {
                    b.view.hitTest(a).then(function (a) {
                        if (a.results.length && a.results[0].graphic) {
                            a = a.results[0].graphic;
                            if (d && (-1 < d.handleGraphics.indexOf(a) || a === d.rotateGraphic) || e && -1 < e.handleGraphics.indexOf(a)) return;
                            if (a === d.boxGraphic) {
                                b.graphic.set("symbol", b.updatePolylineSymbol);
                                d.graphic = null;
                                e.graphic = b.graphic;
                                return
                            }
                            if (a === b.graphic) {
                                b.graphic.set("symbol", b.updatePolylineSymbol);
                                e.graphic = null;
                                d.graphic = b.graphic;
                                return
                            }
                        }
                        b.graphic.geometry !== c.geometry ? f && f.complete() : f && f.cancel()
                    })
                }), this.view.on("key-down", function (a) {
                    "Escape" === a.key ? b.graphic.geometry !== c.geometry ? f && f.complete() : f && f.cancel() : "Control" === a.key && d && !a.repeat && d.set("uniformScaling", !0)
                }), this.view.on("key-up", function (a) {
                    "Control" === a.key && d && d.set("uniformScaling", !1)
                })], f = new u({
                    type: "update", complete: function () {
                        d &&
                        d.destroy();
                        e && e.destroy();
                        b._layer.remove(b.graphic);
                        g.forEach(function (a) {
                            return a.remove()
                        });
                        f.emit("complete")
                    }, cancel: function () {
                        d && d.destroy();
                        e && e.destroy();
                        b._layer.remove(b.graphic);
                        g.forEach(function (a) {
                            return a.remove()
                        });
                        f.emit("cancel")
                    }
                });
                return f
            };
            d.prototype._showPolygonGraphic = function (c, a) {
                var b = this;
                this._layer.remove(this.graphic);
                this._clearGraphics();
                if (1 === c.length) {
                    var d = c[0],
                        d = new m(new r.Point(d[0], d[1], this.view.spatialReference), this.activePointSymbol);
                    a || (this._vertexGraphics.push(d),
                        this._layer.add(d));
                    this._set("graphic", d)
                } else {
                    var e;
                    2 === c.length ? (d = n.createPolyline([c], this.view), e = this.polylineSymbol) : (d = n.createPolygon([c], this.view), e = this.polygonSymbol, this._targetGraphic = new m(d, this.activeFillSymbol), this._layer.add(this._targetGraphic));
                    this._set("graphic", new m(d, e));
                    if (a) {
                        var f = c.map(function (a) {
                            return Array.apply([], a)
                        });
                        a = f.pop();
                        a = [f[f.length - 1], a];
                        this._lineGraphic = new m(n.createPolyline([f], this.view), this.polylineSymbol);
                        this._layer.add(this._lineGraphic);
                        this._activeLineGraphic =
                            new m(n.createPolyline(a, this.view), this.activeLineSymbol);
                        this._layer.add(this._activeLineGraphic);
                        f.forEach(function (a, c) {
                            c = c === f.length - 1 ? b.activePointSymbol : b.pointSymbol;
                            a = new m({
                                geometry: new r.Point({
                                    x: a[0],
                                    y: a[1],
                                    spatialReference: b.view.spatialReference
                                }), symbol: c
                            });
                            b._vertexGraphics.push(a);
                            b._layer.add(a)
                        })
                    } else this._lineGraphic = new m(n.createPolyline([c], this.view), this.polylineSymbol), this._layer.add(this._lineGraphic), c.forEach(function (a, d) {
                        d = d === c.length - 1 ? b.activePointSymbol : b.pointSymbol;
                        a = new m({
                            geometry: new r.Point({x: a[0], y: a[1], spatialReference: b.view.spatialReference}),
                            symbol: d
                        });
                        b._vertexGraphics.push(a);
                        b._layer.add(a)
                    })
                }
            };
            d.prototype._showPolylineGraphic = function (c, a) {
                var b = this;
                this._layer.remove(this.graphic);
                this._clearGraphics();
                if (1 === c.length) a = c[0], this._set("graphic", new m(new r.Point(a[0], a[1], this.view.spatialReference), this.pointSymbol)); else if (this._set("graphic", new m(n.createPolyline([c], this.view), this.polylineSymbol)), a) {
                    var d = c.map(function (a) {
                        return Array.apply([],
                            a)
                    });
                    a = d.pop();
                    a = [d[d.length - 1], a];
                    this._lineGraphic = new m(n.createPolyline(d, this.view), this.polylineSymbol);
                    this._layer.add(this._lineGraphic);
                    this._activeLineGraphic = new m(n.createPolyline(a, this.view), this.activeLineSymbol);
                    this._layer.add(this._activeLineGraphic);
                    d.forEach(function (a, c) {
                        c = c === d.length - 1 ? b.activePointSymbol : b.pointSymbol;
                        a = new m({
                            geometry: new r.Point({x: a[0], y: a[1], spatialReference: b.view.spatialReference}),
                            symbol: c
                        });
                        b._vertexGraphics.push(a);
                        b._layer.add(a)
                    })
                } else this._lineGraphic =
                    new m(n.createPolyline([c], this.view), this.polylineSymbol), this._layer.add(this._lineGraphic), c.forEach(function (a, d) {
                    d = d === c.length - 1 ? b.activePointSymbol : b.pointSymbol;
                    a = new m({
                        geometry: new r.Point({x: a[0], y: a[1], spatialReference: b.view.spatialReference}),
                        symbol: d
                    });
                    b._vertexGraphics.push(a);
                    b._layer.add(a)
                })
            };
            d.prototype._showRectangleGraphic = function (c, a, b) {
                this._layer.remove(this.graphic);
                this._clearGraphics();
                1 === c.length ? (c = c[0], this._set("graphic", new m(new r.Point(c[0], c[1], this.view.spatialReference),
                    this.pointSymbol))) : (c = b ? n.createSquare(c, this.view, a) : n.createRectangle(c, this.view, a), this._toggleCenterGraphic(c), this._set("graphic", new m(c, this.polygonSymbol)), this._layer.add(this.graphic))
            };
            d.prototype._showMultipointGraphic = function (c) {
                this._layer.remove(this.graphic);
                this._set("graphic", new m(n.createMultipoint(c, this.view), this.pointSymbol));
                this._layer.add(this.graphic)
            };
            d.prototype._showCircleGraphic = function (c, a, b) {
                this._layer.remove(this.graphic);
                this._clearGraphics();
                1 === c.length ?
                    (c = c[0], this._set("graphic", new m(new r.Point(c[0], c[1], this.view.spatialReference), this.pointSymbol))) : (c = b ? n.createEllipse(c, this.view, a) : n.createCircle(c, this.view, a), this._toggleCenterGraphic(c), this._set("graphic", new m(c, this.polygonSymbol)), this._layer.add(this.graphic))
            };
            d.prototype._showEllipseGraphic = function (c, a, b) {
                this._layer.remove(this.graphic);
                this._clearGraphics();
                1 === c.length ? (c = c[0], this._set("graphic", new m(new r.Point(c[0], c[1], this.view.spatialReference), this.pointSymbol))) : (c =
                    b ? n.createCircle(c, this.view, a) : n.createEllipse(c, this.view, a), this._toggleCenterGraphic(c), this._set("graphic", new m(c, this.polygonSymbol)), this._layer.add(this.graphic))
            };
            d.prototype._showTriangleGraphic = function (c, a, b) {
                this._layer.remove(this.graphic);
                this._clearGraphics();
                1 === c.length ? (c = c[0], this._set("graphic", new m(new r.Point(c[0], c[1], this.view.spatialReference), this.pointSymbol))) : (c = n.createTriangle(c, this.view, a, b), this._toggleCenterGraphic(c), this._set("graphic", new m(c, this.polygonSymbol)),
                    this._layer.add(this.graphic))
            };
            d.prototype._toggleCenterGraphic = function (c) {
                this._layer.remove(this._centerGraphic);
                this._centerGraphic = null;
                c && c.extent && c.extent.center && (this._centerGraphic = new m(c.extent.center, this._centerSymbol), this._layer.add(this._centerGraphic))
            };
            d.prototype._clearGraphics = function () {
                this._toggleCenterGraphic();
                this._layer.remove(this._targetGraphic);
                this._targetGraphic = null;
                this._layer.remove(this._lineGraphic);
                this._lineGraphic = null;
                this._layer.remove(this._activeLineGraphic);
                this._activeLineGraphic = null;
                this._layer.removeMany(this._vertexGraphics);
                this._vertexGraphics = []
            };
            d.prototype._snapLastVertexToAxis = function (c) {
                if (!(2 > c.length)) {
                    var a = c.pop(), b = c[c.length - 1], a = this.view.toScreen(a[0], a[1], null),
                        b = this.view.toScreen(b[0], b[1], null), d = Math.abs(a.x - b.x), e = Math.abs(a.y - b.y),
                        a = this.view.toMap(d > e ? a.x : b.x, d > e ? b.y : a.y);
                    c.push([a.x, a.y])
                }
            };
            d.prototype._displayCrosshairCursor = function () {
                var c = this;
                "crosshair" !== this.view.container.style.cursor && (this.view.container.style.cursor =
                    "crosshair");
                return new I({
                    reset: function () {
                        "default" !== c.view.container.style.cursor && (c.view.container.style.cursor = "default")
                    }
                })
            };
            d.prototype._displayPointerCursor = function () {
                var c = this;
                "pointer" !== this.view.container.style.cursor && (this.view.container.style.cursor = "pointer");
                return new I({
                    reset: function () {
                        "default" !== c.view.container.style.cursor && (c.view.container.style.cursor = "default")
                    }
                })
            };
            q([p.property()], d.prototype, "_operationHandle", void 0);
            q([p.property()], d.prototype, "activeFillSymbol",
                void 0);
            q([p.property()], d.prototype, "activeLineSymbol", void 0);
            q([p.property()], d.prototype, "activePointSymbol", void 0);
            q([p.property({readOnly: !0})], d.prototype, "draw", void 0);
            q([p.property({readOnly: !0})], d.prototype, "graphic", void 0);
            q([p.property()], d.prototype, "hoverVertexSymbol", void 0);
            q([p.property()], d.prototype, "layer", void 0);
            q([p.property()], d.prototype, "pointSymbol", void 0);
            q([p.property()], d.prototype, "polygonSymbol", void 0);
            q([p.property()], d.prototype, "polylineSymbol", void 0);
            q([p.property()],
                d.prototype, "selectedVertexSymbol", void 0);
            q([p.property({dependsOn: ["view.ready", "_operationHandle"], readOnly: !0})], d.prototype, "state", null);
            q([p.property()], d.prototype, "view", void 0);
            return d = q([p.subclass("esri.widgets.Sketch.SketchViewModel")], d)
        }(p.declared(C, D))
    });