// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports dojo/has ../../core/ArrayPool ../../core/Logger maquette-css-transitions".split(" "),function(k,a,l,f,h,d){Object.defineProperty(a,"__esModule",{value:!0});h.getLogger("esri.widgets.support.widgetUtils");a.join=function(){for(var e=[],b=0;b<arguments.length;b++)e[b]=arguments[b];return e.join(" ")};a.classes=function(e){for(var b=f.acquire(),a=0;a<arguments.length;a++){var c=arguments[a],d=typeof c;if("string"===d)b.push(c);else if(Array.isArray(c))b.push.apply(b,c);else if("object"===
d)for(var g in c)c[g]&&b.push(g)}a=b.join(" ");f.release(b);return a};a.isRtl=function(){return"rtl"===document.dir};a.storeNode=function(a){this[a.getAttribute("data-node-ref")]=a};a.cssTransition=function(a,b){return("enter"===a?d.createEnterCssTransition:d.createExitCssTransition)(b)}});