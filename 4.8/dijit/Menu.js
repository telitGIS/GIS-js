//>>built
define("require dojo/_base/array dojo/_base/declare dojo/dom dojo/dom-attr dojo/dom-geometry dojo/dom-style dojo/keys dojo/_base/lang dojo/on dojo/sniff dojo/_base/window dojo/window ./popup ./DropDownMenu dojo/ready".split(" "), function (u, n, v, p, f, q, t, k, l, g, m, h, w, r, x, y) {
    m("dijit-legacy-requires") && y(0, function () {
        u(["dijit/MenuItem", "dijit/PopupMenuItem", "dijit/CheckedMenuItem", "dijit/MenuSeparator"])
    });
    return v("dijit.Menu", x, {
        constructor: function () {
            this._bindings = []
        }, targetNodeIds: [], selector: "",
        contextMenuForWindow: !1, leftClickToOpen: !1, refocus: !0, postCreate: function () {
            this.contextMenuForWindow ? this.bindDomNode(this.ownerDocumentBody) : n.forEach(this.targetNodeIds, this.bindDomNode, this);
            this.inherited(arguments)
        }, _iframeContentWindow: function (a) {
            return w.get(this._iframeContentDocument(a)) || this._iframeContentDocument(a).__parent__ || a.name && document.frames[a.name] || null
        }, _iframeContentDocument: function (a) {
            return a.contentDocument || a.contentWindow && a.contentWindow.document || a.name && document.frames[a.name] &&
                document.frames[a.name].document || null
        }, bindDomNode: function (a) {
            a = p.byId(a, this.ownerDocument);
            var d;
            if ("iframe" == a.tagName.toLowerCase()) {
                var e = a;
                d = this._iframeContentWindow(e);
                d = h.body(d.document)
            } else d = a == h.body(this.ownerDocument) ? this.ownerDocument.documentElement : a;
            var b = {node: a, iframe: e};
            f.set(a, "_dijitMenu" + this.id, this._bindings.push(b));
            var c = l.hitch(this, function (a) {
                var b = this.selector, c = b ? function (a) {
                    return g.selector(b, a)
                } : function (a) {
                    return a
                }, d = this;
                return [g(a, c(this.leftClickToOpen ?
                    "click" : "contextmenu"), function (a) {
                    a.stopPropagation();
                    a.preventDefault();
                    (new Date).getTime() < d._lastKeyDown + 500 || d._scheduleOpen(this, e, {
                        x: a.pageX,
                        y: a.pageY
                    }, a.target)
                }), g(a, c("keydown"), function (a) {
                    if (93 == a.keyCode || a.shiftKey && a.keyCode == k.F10 || d.leftClickToOpen && a.keyCode == k.SPACE) a.stopPropagation(), a.preventDefault(), d._scheduleOpen(this, e, null, a.target), d._lastKeyDown = (new Date).getTime()
                })]
            });
            b.connects = d ? c(d) : [];
            e && (b.onloadHandler = l.hitch(this, function () {
                var a = this._iframeContentWindow(e),
                    a = h.body(a.document);
                b.connects = c(a)
            }), e.addEventListener ? e.addEventListener("load", b.onloadHandler, !1) : e.attachEvent("onload", b.onloadHandler))
        }, unBindDomNode: function (a) {
            var d;
            try {
                d = p.byId(a, this.ownerDocument)
            } catch (z) {
                return
            }
            a = "_dijitMenu" + this.id;
            if (d && f.has(d, a)) {
                for (var e = f.get(d, a) - 1, b = this._bindings[e], c; c = b.connects.pop();) c.remove();
                (c = b.iframe) && (c.removeEventListener ? c.removeEventListener("load", b.onloadHandler, !1) : c.detachEvent("onload", b.onloadHandler));
                f.remove(d, a);
                delete this._bindings[e]
            }
        },
        _scheduleOpen: function (a, d, e, b) {
            this._openTimer || (this._openTimer = this.defer(function () {
                delete this._openTimer;
                this._openMyself({target: b, delegatedTarget: a, iframe: d, coords: e})
            }, 1))
        }, _openMyself: function (a) {
            function d() {
                k.refocus && l && l.focus();
                r.close(k)
            }

            var e = a.target, b = a.iframe, c = a.coords, f = !c;
            this.currentTarget = a.delegatedTarget;
            if (c) {
                if (b) {
                    a = q.position(b, !0);
                    var e = this._iframeContentWindow(b), e = q.docScroll(e.document), g = t.getComputedStyle(b),
                        h = t.toPixelValue, n = (m("ie"), h(b, g.paddingLeft)) + (m("ie"),
                            0), b = (m("ie"), h(b, g.paddingTop)) + (m("ie"), 0);
                    c.x += a.x + n - e.x;
                    c.y += a.y + b - e.y
                }
            } else c = q.position(e, !0), c.x += 10, c.y += 10;
            var k = this, b = this._focusManager.get("prevNode");
            a = this._focusManager.get("curNode");
            var l = !a || p.isDescendant(a, this.domNode) ? b : a;
            r.open({popup: this, x: c.x, y: c.y, onExecute: d, onCancel: d, orient: this.isLeftToRight() ? "L" : "R"});
            this.focus();
            f || this.defer(function () {
                this._cleanUp(!0)
            });
            this._onBlur = function () {
                this.inherited("_onBlur", arguments);
                r.close(this)
            }
        }, destroy: function () {
            n.forEach(this._bindings,
                function (a) {
                    a && this.unBindDomNode(a.node)
                }, this);
            this.inherited(arguments)
        }
    })
});