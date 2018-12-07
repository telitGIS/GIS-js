// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports"],function(e,f){return function(){function d(){this.items=[]}d.prototype.addObject=function(a,b){this.items.push({type:"object",highlightId:b,object:a})};d.prototype.addRenderGeometry=function(a,b,c){this.items.push({type:"renderGeometry",highlightId:c,renderGeometry:a,renderer:b})};d.prototype.addExternal=function(a,b){this.items.push({type:"external",highlightId:b,remove:a})};d.prototype.remove=function(a){for(var b=this.items.length-1;0<=b;--b){var c=this.items[b];c.highlightId===
a&&(this.removeHighlight(c),this.items.splice(b,1))}};d.prototype.removeObject=function(a){for(var b=this.items.length-1;0<=b;--b){var c=this.items[b];"object"===c.type&&c.object===a&&(this.removeHighlight(c),this.items.splice(b,1))}};d.prototype.removeRenderGeometry=function(a){for(var b=this.items.length-1;0<=b;--b){var c=this.items[b];"renderGeometry"===c.type&&c.renderGeometry===a&&(this.removeHighlight(c),this.items.splice(b,1))}};d.prototype.removeAll=function(){var a=this;this.items.forEach(function(b){a.removeHighlight(b)});
this.items=[]};d.prototype.removeHighlight=function(a){switch(a.type){case "object":a.object.removeHighlights(a.highlightId);break;case "renderGeometry":a.renderer.removeRenderGeometryHighlight(a.renderGeometry,a.highlightId);break;case "external":a.remove(a.highlightId)}};return d}()});