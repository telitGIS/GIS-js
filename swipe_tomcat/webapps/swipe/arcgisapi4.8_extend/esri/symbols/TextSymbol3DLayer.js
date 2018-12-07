// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper ../core/tsSupport/assignHelper ../core/lang ../core/accessorSupport/decorators ./Font ./Symbol3DLayer ./support/materialUtils ./support/Symbol3DHalo".split(" "),function(p,q,g,b,h,e,c,k,l,m,n){return function(f){function a(a){a=f.call(this)||this;a.font=null;a.halo=null;a.material=null;a.size=9;a.text=void 0;a.type="text";return a}g(a,f);d=a;a.prototype.writeFont=function(a,c,b,d){b=h({},d,{textSymbol3D:!0});
c.font=a.write({},b)};a.prototype.clone=function(){return new d({enabled:this.enabled,elevationInfo:this.elevationInfo&&this.elevationInfo.clone(),font:this.font&&e.clone(this.font),halo:this.halo&&e.clone(this.halo),material:this.material&&this.material.clone(),size:this.size,text:this.text})};var d;b([c.property({type:k,json:{write:!0}})],a.prototype,"font",void 0);b([c.writer("font")],a.prototype,"writeFont",null);b([c.property({type:n.default,json:{write:!0}})],a.prototype,"halo",void 0);b([c.property()],
a.prototype,"material",void 0);b([c.property(m.screenSizeProperty)],a.prototype,"size",void 0);b([c.property({type:String,json:{write:!0}})],a.prototype,"text",void 0);b([c.property()],a.prototype,"type",void 0);return a=d=b([c.subclass("esri.symbols.TextSymbol3DLayer")],a)}(c.declared(l))});