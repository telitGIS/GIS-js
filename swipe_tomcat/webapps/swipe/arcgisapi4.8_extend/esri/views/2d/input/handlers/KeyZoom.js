// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports","../../../../core/tsSupport/extendsHelper","../../../input/InputHandler"],function(g,h,k,l){Object.defineProperty(h,"__esModule",{value:!0});var e;(function(d){d[d.IN=0]="IN";d[d.OUT=1]="OUT"})(e||(e={}));g=function(d){function f(b,a,f){var c=d.call(this,!0)||this;c.view=b;c.keys=a;c._keysToZoomAction={};c.registerIncoming("key-down",f,function(a){return c._handleKeyDown(a)});a.zoomIn.forEach(function(a){return c._keysToZoomAction[a]=e.IN});a.zoomOut.forEach(function(a){return c._keysToZoomAction[a]=
e.OUT});return c}k(f,d);f.prototype._handleKeyDown=function(b){this._handleKey(b)};f.prototype._handleKey=function(b){var a=b.modifiers;0<a.size&&!a.has("Shift")||(a=this._keysToZoomAction[b.data.key],a===e.IN?(this.view.navigation.zoomIn(),b.stopPropagation()):a===e.OUT&&(this.view.navigation.zoomOut(),b.stopPropagation()))};return f}(l.InputHandler);h.KeyZoom=g});