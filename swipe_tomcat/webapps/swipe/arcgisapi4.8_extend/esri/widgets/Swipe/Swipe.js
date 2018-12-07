define("require exports ../../Map ../../views/MapView ../../core/watchUtils ../../../dojo/touch ../../../dojo/dom-style ../../../dojo/dom ../../core/tsSupport/decorateHelper ../../core/tsSupport/declareExtendsHelper ../../core/Accessor ../../core/Handles ../../core/accessorSupport/decorators".split(" "),
    function (n, p,map,mapView,watchUtils,touch,domStyle,dom,decorateHelper, declareExtendsHelper, accessor, handles, decorators) {
    return function (e) {
        function Swipe(a) {
            a == e.call(this) || this;
            return a;
        }

        declareExtendsHelper(Swipe, e);

        Swipe.prototype.initial =function () {
            var bodyH = document.body.clientHeight;
            var bodyW = document.body.clientWidth;

            dojo.addClass(this.view1.container, "swipe_Map1");
            dojo.addClass(this.view2.container, "swipe_Map2");

            var mytype=this.type;
            var map1toplayerdiv = map1toplayerdiv ? map1toplayerdiv : dom.byId(this.view2.container);
            switch (mytype){
                case "circle":{
                    domStyle.set(map1toplayerdiv, '-webkit-clip-path', 'circle(111px at 600px 500px)');
                } break;
                case "vertical":{
                    domStyle.set(map1toplayerdiv,'clip','rect(0px,300px,'+bodyH+'px,0px)');
                } break;
                case "horizontal":{
                    domStyle.set(map1toplayerdiv,'clip','rect(0px,'+bodyW+'px,300px,0px)');
                } break;
                default:{}
            }

            var imageLoc = dom.byId(this.container);
            changeImageXY(mytype,this.container);

            this.view1.on('pointer-move', function (e) {
                pointMove(e)
            });
            this.view2.on('pointer-move', function (e) {
                pointMove(e)
            });

            var drag;
            touch.press(dojo.byId(this.container), function(e){
                drag=true;
            })
            touch.release(dojo.byId(this.container), function(e){
                drag=false;
            })

            var circle_drag;
            touch.press(dojo.byId(this.view2.container), function(e){
                circle_drag=true;
            })
            touch.release(dojo.byId(this.view2.container), function(e){
                circle_drag=false;
            })

            function pointMove(e) {
                      e.stopPropagation();
                map1toplayerdiv = map1toplayerdiv ? map1toplayerdiv : dom.byId(this.view2.container);
                var offsetX = e.x;
                var offsetY = e.y;
                switch (mytype){
                    case "circle":{
                        if(circle_drag){
                            domStyle.set(map1toplayerdiv, '-webkit-clip-path', 'circle(111px at ' + offsetX + 'px ' + offsetY + 'px');
                            domStyle.set(imageLoc, "left", (offsetX - 125) + 'px ');
                            domStyle.set(imageLoc, "top", (offsetY - 125) + 'px ');
                        }
                    } break;
                    case "vertical":{
                        if(drag){
                            domStyle.set(map1toplayerdiv,'clip','rect(0px,'+offsetX+'px,'+bodyH+'px,0px)')
                            domStyle.set(imageLoc, "left", (offsetX-5) + 'px ');
                        }

                    } break;
                    case "horizontal":{
                        if(drag) {
                            domStyle.set(map1toplayerdiv, 'clip', 'rect(0px,' + bodyW + 'px,' + offsetY + 'px,0px)')
                            domStyle.set(imageLoc, "top", (offsetY-5) + 'px ');
                        } } break;
                    default:{}
                }

            }

            function changeImageXY(type,id){
                switch (type){
                    case "circle":{
                        dojo.addClass(id, "swipe_Circle");
                    } break;
                    case "vertical":{
                        dojo.addClass(id, "swipe_Vertical");
                    } break;
                    case "horizontal":{
                        dojo.addClass(id, "swipe_Horizontal");
                    } break;
                    default:{}
                }
            }

            var a = this;
            if(mytype==="circle"){
                watchUtils.init(this, "view.ready", function () {
                    watchUtils.when(a.view2, "scale", function () {
                        a.view1.scale = a.view2.scale;
                    });
                    watchUtils.when(a.view2, "center", function () {
                        a.view2.center = a.view1.center;
                    });
                });
                watchUtils.init(this, "view.ready", function () {
                    watchUtils.when(a.view1, "scale", function () {
                        a.view2.scale = a.view1.scale;
                    });
                    watchUtils.when(a.view1, "center", function () {
                        a.view2.center = a.view1.center;
                    });
                });
            }else {
                watchUtils.init(this, "view.ready", function () {
                    watchUtils.when(a.view2, "scale", function () {
                        a.view1.scale = a.view2.scale;
                    });
                    watchUtils.when(a.view2, "center", function () {
                        a.view1.center = a.view2.center;
                    });
                });
                watchUtils.init(this, "view.ready", function () {
                    watchUtils.when(a.view1, "scale", function () {
                        a.view2.scale = a.view1.scale;
                    });
                    watchUtils.when(a.view1, "center", function () {
                        a.view2.center = a.view1.center;
                    });
                });
            }

        };

        var sign=0;
        Swipe.prototype.swip_Toggle = function () {
            var mapdiv1=dojo.byId(this.view1.container.id);
            var mapdiv2=dojo.byId(this.view2.container.id);
            var imagediv=dojo.byId(this.container);
            if(sign===0){
                this.initial();
                if(this.type==="circle"){
                    domStyle.set(mapdiv1, "z-index", '0');
                    domStyle.set(imagediv, "z-index", '1');
                    domStyle.set(mapdiv2, "z-index", '2');
                }
                sign=1;
            }else {
                if(mapdiv2.style.visibility === "hidden"){
                    mapdiv2.style.visibility = "visible";
                    imagediv.style.visibility = "visible";
                    if(this.type==="circle"){
                        domStyle.set(mapdiv1, "z-index", '0');
                        domStyle.set(imagediv, "z-index", '1');
                        domStyle.set(mapdiv2, "z-index", '2');
                    }else {
                        domStyle.set(mapdiv1, "z-index", '0');
                    }
                }else {
                    mapdiv2.style.visibility = "hidden";
                    imagediv.style.visibility = "hidden";
                    domStyle.set(mapdiv1, "z-index", '2');
                }
            }
        };

        return decorateHelper([decorators.subclass("esri.widgets.Swipe.Swipe")], Swipe)
    }(decorators.declared(accessor))
});