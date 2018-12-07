// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../../geometry/support/scaleUtils ../lib/glMatrix ../support/earthUtils ../support/mathUtils".split(" "),function(A,q,v,g,r,n){Object.defineProperty(q,"__esModule",{value:!0});q.createNearFarHeuristic=function(g,c,e){return"global"===g?new w:new x(c,e)};var x=function(){function d(c,e){this.elevationProvider=c;this.unitInMeters=v.getMetersPerUnitForSR(e)}d.prototype.compute=function(c,e,a,m,b){b||(b={maxFarNearRatio:0,distance:0,minNearDistance:0});var d=r.earthRadius;b.maxFarNearRatio=
t;b.minNearDistance=u/this.unitInMeters;var f=c[2]*this.unitInMeters,h=f;m=f-m;var p=this.elevationProvider?this.elevationProvider.getElevationBounds():null;p&&(f=0<=m?h-this.unitInMeters*p[0]:this.unitInMeters*p[1]-h);h=Math.max(a.xmax-a.xmin,a.ymax-a.ymin,4*Math.max(a.xmax-a.xmin,a.ymax-a.ymin));g.vec3d.subtract(e,c,k);l[0]=0<k[0]?a.xmax:a.xmin;l[1]=0<k[1]?a.ymax:a.ymin;l[2]=0<k[2]?h/2:-h/2;g.vec3d.subtract(l,c);g.vec3d.normalize(k);c=1.1*g.vec3d.dot(l,k)*this.unitInMeters;d=Math.sqrt(f*(f+2*d));
a=Math.max(a.xmax-a.xmin,a.ymax-a.ymin);e=a*y*this.unitInMeters;f=n.clamp((f-e)/(a*z*this.unitInMeters-e),0,1);b.distance=n.lerp(d,c,f*f*f);b.distance*=Math.max(Math.log(Math.abs(m)),1);b.distance=Math.min(b.distance,Math.max(34064E4,h));b.distance/=this.unitInMeters;return b};return d}(),w=function(){function d(){}d.prototype.compute=function(c,e,a,d,b){b||(b={maxFarNearRatio:0,minNearDistance:0,distance:0});e=r.earthRadius;c=g.vec3d.length(c)-e;b.maxFarNearRatio=t;b.minNearDistance=u/1;c=Math.max(Math.abs(c-
d),Math.abs(c));d=Math.sqrt(c*(c+2*(e+Math.min(0,d))));b.maxFarNearRatio=n.clamp(2E4-(Math.log(c)-7.983)/9.011*19E3,1E3,2E4);b.distance=1.2*d/1;return b};return d}(),t=2E4,u=2,z=.001,y=1E-4,l=g.vec3d.create(),k=g.vec3d.create()});