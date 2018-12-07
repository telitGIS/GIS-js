// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports","../../lib/glMatrix"],function(n,c,d){function f(a){void 0===a&&(a=c.UP);return[a[0],a[1],a[2],a[3]]}function g(a,b,e){void 0===e&&(e=f());d.vec3d.set(b,e);e[3]=-d.vec3d.dot(b,a);return e}function h(a,b,e,c){void 0===c&&(c=f());d.vec3d.cross(b,a,k);return g(e,d.vec3d.normalize(k),c)}Object.defineProperty(c,"__esModule",{value:!0});c.create=f;c.fromValues=function(a,b,e,c,d){void 0===d&&(d=f());d[0]=a;d[1]=b;d[2]=e;d[3]=c;return d};c.fromNormalAndOffset=function(a,b,e){void 0===
e&&(e=f());d.vec3d.set(a,e);e[3]=b;return e};c.fromPositionAndNormal=g;c.projectVector=function(a,b,e){void 0===e&&(e=b);return d.vec3d.cross(a,d.vec3d.cross(b,a,l),e)};c.distance=function(a,b){return d.vec3d.dot(a,b)+a[3]};c.fromPoints=function(a,b,e,c){void 0===c&&(c=f());return h(d.vec3d.subtract(a,b,m),d.vec3d.subtract(e,b,l),a,c)};c.set=function(a,b){a[0]=b[0];a[1]=b[1];a[2]=b[2];a[3]=b[3];return a};c.negate=function(a,b){void 0===b&&(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=-a[3];return b};
c.fromVectorsAndPoint=h;c.intersectRay=function(a,b,c,f){var e=d.vec3d.dot(a,c);if(0===e)return!1;a=-(d.vec3d.dot(a,b)+a[3])/e;d.vec3d.add(b,d.vec3d.scale(c,a,f),f);return!0};c.UP=[0,0,1,0];var m=d.vec3d.create(),l=d.vec3d.create(),k=d.vec3d.create()});