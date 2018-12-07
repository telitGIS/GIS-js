// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper ../../core/JSONSupport ../../core/lang ../../core/Logger ../../core/accessorSupport/decorators".split(" "),function(l,g,p,d,q,m,r,b){function n(c,a,e,f){var b=a.loggerTag;a=a.stride;return 0!==c.length%a?(f.error(b,"Invalid array length, expected a multiple of "+a),new e([])):c}function h(c,a,e,f,b){if(!c)return c;if(c instanceof a)return n(c,f,a,b);for(var d=0;d<e.length;d++)if(c instanceof e[d])return n(new a(c),
f,a,b);if(Array.isArray(c))return n(new a(c),f,a,b);e=e.map(function(a){return"'"+a.name+"'"});b.error("Failed to set property, expected one of "+e+", but got "+c.constructor.name);return new a([])}Object.defineProperty(g,"__esModule",{value:!0});var k=r.getLogger("esri.geometry.support.MeshVertexAttributes");l=function(c){function a(a){a=c.call(this)||this;a.position=null;a.uv=null;a.normal=null;return a}p(a,c);e=a;a.prototype.castPosition=function(a){a&&a instanceof Float32Array&&k.warn(".position\x3d",
"Setting position attribute from a Float32Array may cause precision problems. Consider storing data in a Float64Array or a regular number array");return h(a,Float64Array,[Float32Array],{loggerTag:".position\x3d",stride:3},k)};a.prototype.castUv=function(a){return h(a,Float32Array,[Float64Array],{loggerTag:".uv\x3d",stride:2},k)};a.prototype.castNormal=function(a){return h(a,Float32Array,[Float64Array],{loggerTag:".normal\x3d",stride:3},k)};a.prototype.clone=function(){return new e({position:m.clone(this.position),
uv:m.clone(this.uv),normal:m.clone(this.normal)})};var e;d([b.property({json:{write:!0}})],a.prototype,"position",void 0);d([b.cast("position")],a.prototype,"castPosition",null);d([b.property({json:{write:!0}})],a.prototype,"uv",void 0);d([b.cast("uv")],a.prototype,"castUv",null);d([b.property({json:{write:!0}})],a.prototype,"normal",void 0);d([b.cast("normal")],a.prototype,"castNormal",null);return a=e=d([b.subclass("esri.geometry.support.MeshVertexAttributes")],a)}(b.declared(q));g.MeshVertexAttributes=
l;g.castArray=h;g.default=l});