// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports"],function(d,e){Object.defineProperty(e,"__esModule",{value:!0});d=function(){function b(a){this.callbacks=a;this.currentCount=0;this.callbacks.condition||(this.callbacks.condition=function(){return!0})}b.prototype.handle=function(a){var b=a.data,c=b.pointers.size;switch(b.action){case "start":this.currentCount=c;this.emitStart(a);break;case "added":this.emitEnd(this.previousEvent);this.currentCount=c;this.emitStart(a);break;case "update":this.emitUpdate(a);break;case "removed":this.startEvent&&
this.emitEnd(this.previousEvent);this.currentCount=c;this.emitStart(a);break;case "end":this.emitEnd(a),this.currentCount=0}this.previousEvent=a};b.prototype.emitStart=function(a){this.startEvent=a;this.callbacks.condition(this.currentCount,a)&&this.callbacks.start(this.currentCount,a,this.startEvent)};b.prototype.emitUpdate=function(a){this.callbacks.condition(this.currentCount,a)&&this.callbacks.update(this.currentCount,a,this.startEvent)};b.prototype.emitEnd=function(a){this.callbacks.condition(this.currentCount,
a)&&this.callbacks.end(this.currentCount,a,this.startEvent);this.startEvent=null};return b}();e.DragEventSeparator=d});