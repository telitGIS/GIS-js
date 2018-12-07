// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper ../core/JSONSupport ../core/lang ../core/accessorSupport/decorators ./Lighting ./background/utils".split(" "),function(p,q,k,e,l,m,c,f,n){var h=function(c,b,d){return{enabled:!d||!d.isPresentation}};return function(g){function b(a){a=g.call(this,a)||this;a.lighting=new f;a.background=null;a.atmosphereEnabled=!0;a.starsEnabled=!0;return a}k(b,g);d=b;b.prototype.clone=function(){return new d({lighting:f.prototype.clone.call(this.lighting),
background:m.clone(this.background),atmosphereEnabled:this.atmosphereEnabled,starsEnabled:this.starsEnabled})};b.sanitizeJSON=function(a){return{lighting:a.lighting?f.sanitizeJSON(a.lighting):(new f).toJSON(),background:a.background,atmosphereEnabled:a.atmosphereEnabled,starsEnabled:a.starsEnabled}};var d;e([c.property({type:f,json:{write:!0}})],b.prototype,"lighting",void 0);e([c.property(n.backgroundProperty)],b.prototype,"background",void 0);e([c.property({type:Boolean,nonNullable:!0,json:{write:{overridePolicy:h}}})],
b.prototype,"atmosphereEnabled",void 0);e([c.property({type:Boolean,nonNullable:!0,json:{write:{overridePolicy:h}}})],b.prototype,"starsEnabled",void 0);return b=d=e([c.subclass("esri.webscene.Environment")],b)}(c.declared(l))});