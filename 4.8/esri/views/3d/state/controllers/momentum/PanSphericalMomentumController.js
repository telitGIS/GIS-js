// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports","../../../../../core/tsSupport/extendsHelper","./MomentumController","../../utils/navigationUtils"],function(b,d,e,f,g){Object.defineProperty(d,"__esModule",{value:!0});var h=[0,0,0];b=function(b){function c(a,c){a=b.call(this,a,4)||this;a.momentum=c;return a}e(c,b);c.prototype.momentumStep=function(a,b){a=this.momentum.value(a);g.applyRotation(b,h,this.momentum.axis,a)};return c}(f.MomentumController);d.PanSphericalMomentumController=b});