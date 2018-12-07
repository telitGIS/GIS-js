/*define("require exports   ../../core/accessorSupport/decorators ../../core/Accessor ../../core/tsSupport/declareExtendsHelper".split(" "), function (n, p, g, d, h, k, l,de,ac,deh) {
    return function (e) {
        function swipe() {
            var a = null !== e && e.apply(this, arguments) || this;
            debugger;
            a._handles = new k;
            a.view = null;
            a.tool = null;
            a.plane = null;
            return a
        }
        deh(swipe,e);
        swipe.prototype.initialize =
            function () {
                var a = this;
                this._handles.add(l.init(this, "view.ready", function () {
                    var b = a.view && a.view.ready;
                    b && !a.tool && a._set("tool", new m({view: a.view}));
                    f.toggle(a.view, a.tool);
                    b || a._set("tool", null)
                }))
            };
    }(de.declared(ac))
});*/

define("require exports ../../Map ../../views/MapView ../../core/watchUtils ../../../dojo/dom-style ../../../dojo/dom ../../core/tsSupport/decorateHelper ../../core/tsSupport/declareExtendsHelper ../../core/Accessor ../../core/Handles ../../core/accessorSupport/decorators".split(" "),
    function (n, p,map,mapView,watchUtils,domStyle,dom,decorateHelper, declareExtendsHelper, accessor, handles, decorators) {
    return function (e) {
        function Swipe(a) {
            a = e.call(this) || this;
            a.view1=null;
            a.view2=null;
            a.map1=a.view1.container;
            a.map2=a.view2.container;
            /*this.view1 = arguments[0].view1;
            this.view2 = arguments[0].view2;
            this.map2 = arguments[0].view2.container;*/
            return a;
        }

        declareExtendsHelper(Swipe, e);

        Swipe.prototype.initialize =function () {


        };
        Swipe.prototype.startup = function(){

            var map1toplayerdiv=map1toplayerdiv?map1toplayerdiv:dom.byId('map2');

            domStyle.set(map1toplayerdiv,'-webkit-clip-path','circle(110px at 600px 500px)');
            var imageLoc=dom.byId("image_XY");
            this.view1.on('pointer-move',function(e){
                e.stopPropagation();
                map1toplayerdiv=map1toplayerdiv?map1toplayerdiv:dom.byId('map2');
                var  offsetX=e.x;
                var  offsetY=e.y;
                domStyle.set(map1toplayerdiv,'-webkit-clip-path','circle(110px at '+offsetX+'px '+offsetY+'px');
                domStyle.set(imageLoc,"left", (offsetX-125)+'px ');
                domStyle.set(imageLoc, "top", (offsetY-125)+'px ');
            });
            this.view2.on('pointer-move',function(e){
                e.stopPropagation();
                map1toplayerdiv=map1toplayerdiv?map1toplayerdiv:dom.byId('map2');
                var  offsetX=e.x;
                var  offsetY=e.y;
                domStyle.set(map1toplayerdiv,'-webkit-clip-path','circle(110px at '+offsetX+'px '+offsetY+'px');
                domStyle.set(imageLoc,"left", (offsetX-125)+'px ');
                domStyle.set(imageLoc, "top", (offsetY-125)+'px ');
            });

            watchUtils.when(this.view2, "scale", function () {
                this.view1.scale=this.view2.scale;
            });
            watchUtils.when(this.view2, "center", function () {
                this.view1.center= this.view2.center;
            });
            debugger;
        }
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
        return Swipe = decorateHelper([decorators.subclass("esri.widgets.Swipe.Swipe")], Swipe)
    }(decorators.declared(accessor))
});