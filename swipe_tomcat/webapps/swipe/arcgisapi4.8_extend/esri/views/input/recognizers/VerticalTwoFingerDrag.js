// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports","../../../core/tsSupport/extendsHelper","../DragEventSeparator","../InputHandler"],function(e,m,n,p,q){Object.defineProperty(m,"__esModule",{value:!0});e=function(e){function d(c,a){void 0===c&&(c=20);void 0===a&&(a=40);var b=e.call(this,!1)||this;b._threshold=c;b._maxDelta=a;b.state="ready";b.emittedArtificalEnd2=!1;b._vertical=b.registerOutgoing("vertical-two-finger-drag");b._artificalDrag=b.registerOutgoing("drag");b.dragEventSeparator=new p.DragEventSeparator({start:function(a,
c){return b.observeStart(a,c)},update:function(a,c,d){return b.observeUpdate(a,c,d)},end:function(a,c){return b.observeEnd(a,c)}});b.registerIncoming("drag",function(a){return b.dragEventSeparator.handle(a)});return b}n(d,e);Object.defineProperty(d.prototype,"failed",{get:function(){return"failed"===this.state},enumerable:!0,configurable:!0});d.prototype.observeStart=function(c,a){1===c&&this.emittedArtificalEnd2&&(this.emittedArtificalEnd2=!1,this._artificalDrag.emit({action:"start",button:a.data.button,
buttons:a.data.buttons,pointerType:a.data.pointerType,timestamp:a.data.timestamp,pointers:a.data.pointers,pointer:a.data.pointer,angle:a.data.angle,radius:a.data.radius,center:a.data.center,artifical:!0}),a.stopPropagation());this.state=2===c?"ready":"failed"};d.prototype.observeUpdate=function(c,a,b){"failed"!==this.state&&2===c&&("active"===this.state?(this._vertical.emit({delta:a.data.center.y-this._thresholdReachedCenter.y,action:"update"}),a.stopPropagation()):this.checkMovementWithinLimits(a.data,
b.data)?this.checkVerticalThresholdReached(a.data,b.data)&&(this.state="active",this.emittedArtificalEnd2=!0,this._thresholdReachedCenter=a.data.center,this._artificalDrag.emit({action:"end",button:a.data.button,buttons:a.data.buttons,pointerType:a.data.pointerType,timestamp:a.data.timestamp,pointers:a.data.pointers,pointer:a.data.pointer,angle:a.data.angle,radius:a.data.radius,center:a.data.center,artifical:!0}),this._vertical.emit({delta:a.data.center.y-this._thresholdReachedCenter.y,action:"begin"}),
a.stopPropagation()):this.state="failed")};d.prototype.observeEnd=function(c,a){"active"===this.state&&(this._vertical.emit({delta:a.data.center.y-this._thresholdReachedCenter.y,action:"end"}),this.state="ready",a.stopPropagation())};d.prototype.checkMovementWithinLimits=function(c,a){var b=-Infinity,d=Infinity,f=-Infinity,e=Infinity;a.pointers.forEach(function(a){b=Math.max(b,a.x);d=Math.min(d,a.x);f=Math.max(f,a.y);e=Math.min(e,a.y)});var g=-Infinity,h=Infinity,k=-Infinity,l=Infinity;c.pointers.forEach(function(a){g=
Math.max(g,a.x);h=Math.min(h,a.x);k=Math.max(k,a.y);l=Math.min(l,a.y)});return Math.abs(c.center.x-a.center.x)<this._threshold&&Math.abs(g-h-(b-d))<=this._maxDelta&&Math.abs(k-l-(f-e))<=this._maxDelta};d.prototype.checkVerticalThresholdReached=function(c,a){var b=Math.abs(c.center.y-a.center.y);c.pointers.forEach(function(c,d){d=a.pointers.get(d);b=Math.min(b,Math.abs(c.y-d.y))});return b>=this._threshold};return d}(q.InputHandler);m.VerticalTwoFingerDrag=e});