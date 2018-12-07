define("require exports ../../Map ../../views/MapView ../../core/watchUtils ../../../dojo/dom-style ../../../dojo/dom ../../core/tsSupport/decorateHelper ../../core/tsSupport/declareExtendsHelper ../../core/Accessor ../../core/Handles ../../core/accessorSupport/decorators".split(" "),
    function (n, p,map,mapView,watchUtils,domStyle,dom,decorateHelper, declareExtendsHelper, accessor, handles, decorators) {
    return function (e) {
        function Swipe(a) {
            // a = null !== e && e.apply(this, arguments) || this;
            a == e.call(this) || this;
            return a;
        }

        declareExtendsHelper(Swipe, e);

        /*Swipe.prototype.initialize =
            function () {
                var a = this;
                this._handles.add(watchUtils.init(this, "view.ready", function () {
                    watchUtils.when(a.view2, "scale", function () {
                        a.view1.scale=a.view2.scale;
                    });
                    watchUtils.when(a.view2, "center", function () {
                        a.view1.center= a.view2.center;
                    });

                }))
            };*/
        /*Object.defineProperty(Swipe.prototype, "view2", {
            set: function (a) {
                this._set("view2",a)
            }, enumerable: !0, configurable: !0
        });

        Object.defineProperty(Swipe.prototype, "view1", {
            set: function (a) {
                this._set("view1",a)
            }, enumerable: !0, configurable: !0
        });

        Object.defineProperty(Swipe.prototype, "container", {
            set: function (a) {
                this._set("container",a)
            }, enumerable: !0, configurable: !0
        });*/
        Swipe.prototype.startup = function() {
            var map1toplayerdiv = map1toplayerdiv ? map1toplayerdiv : dom.byId(this.view2.container);

            domStyle.set(map1toplayerdiv, '-webkit-clip-path', 'circle(110px at 600px 500px)');
            var imageLoc = dom.byId(this.container);
            this.view1.on('pointer-move', function (e) {
                pointMove(e)
            });
            this.view2.on('pointer-move', function (e) {
                pointMove(e)
            });
            var a = this;
            watchUtils.init(this, "view.ready", function () {
                watchUtils.when(a.view2, "scale", function () {
                    a.view1.scale = a.view2.scale;
                });
                watchUtils.when(a.view2, "center", function () {
                    a.view1.center = a.view2.center;
                });
            });
            function pointMove(e) {
                e.stopPropagation();
                map1toplayerdiv = map1toplayerdiv ? map1toplayerdiv : dom.byId(this.view2.container);
                var offsetX = e.x;
                var offsetY = e.y;
                var bodyH = document.body.clientHeight;
                var bodyW = document.body.clientWidth;
                domStyle.set(map1toplayerdiv, '-webkit-clip-path', 'circle(110px at ' + offsetX + 'px ' + offsetY + 'px');
                domStyle.set(imageLoc, "left", (offsetX - 125) + 'px ');
                domStyle.set(imageLoc, "top", (offsetY - 125) + 'px ');
            }
        };

        Swipe.prototype.destroy = function () {
          /*  f.toggle(this.view, this.tool, !1);
            this._set("tool", null);
            this.view = null;
            this._handles.destroy();
            this._handles = null*/
        };
       /* d([c.property()], b.prototype, "view", void 0);
        d([c.property({readOnly: !0})], b.prototype, "tool", void 0);
        d([c.aliasOf("tool.plane")], b.prototype, "plane", void 0);*/
        return decorateHelper([decorators.subclass("esri.widgets.Swipe.Swipe")], Swipe)
    }(decorators.declared(accessor))
});