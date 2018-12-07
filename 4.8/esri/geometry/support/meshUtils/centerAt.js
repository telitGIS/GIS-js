// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../../core/Logger ./projection ../../../views/3d/lib/glMatrix ../../../views/3d/support/projectionUtils".split(" "),function(w,r,v,l,h,d){Object.defineProperty(r,"__esModule",{value:!0});var n=v.getLogger("esri.geometry.support.meshUtils.centerAt");r.centerAt=function(b,a,c){if(b.vertexAttributes&&b.vertexAttributes.position){var f=b.spatialReference,e=c&&c.origin||b.extent.center;if(f.isWGS84||f.isWebMercator&&(!c||!1!==c.geographic)){c=b.spatialReference;var f=t,g=u;if(d.pointToVector(a,
g,d.SphericalECEFSpatialReference)){d.pointToVector(e,f,d.SphericalECEFSpatialReference)||d.pointToVector(b.extent.center,f,d.SphericalECEFSpatialReference);e=b.vertexAttributes.position;a=b.vertexAttributes.normal;var m=new Float64Array(e.length),p=new Float32Array(a?a.length:0);l.projectToECEF(e,c,m);a&&l.projectNormalToECEF(a,e,m,c,p);d.computeLinearTransformation(d.SphericalECEFSpatialReference,f,q,d.SphericalECEFSpatialReference);d.computeLinearTransformation(d.SphericalECEFSpatialReference,
g,k,d.SphericalECEFSpatialReference);h.mat4d.inverse(q);h.mat4d.multiply(k,q,k);l.transformBufferInPlace(m,k);h.mat4d.inverse(k);h.mat4d.transpose(k);a&&l.transformBufferInPlace(p,k,!0);l.projectFromECEF(m,e,c);a&&l.projectNormalFromECEF(p,e,m,c,a);b.clearCache()}else n.error("Failed to project centerAt location (wkid:"+a.spatialReference.wkid+") to ECEF")}else if(c=t,f=u,d.pointToVector(a,f,b.spatialReference)){d.pointToVector(e,c,b.spatialReference)||(a=b.extent.center,c[0]=a.x,c[1]=a.y,c[2]=a.z,
n.error("Failed to project specified origin (wkid:"+e.spatialReference.wkid+") to mesh spatial reference (wkid:"+b.spatialReference.wkid+"). Using mesh extent.center instead"));if(e=b.vertexAttributes.position)for(a=0;a<e.length;a+=3)for(g=0;3>g;g++)e[a+g]+=f[g]-c[g];b.clearCache()}else n.error("Failed to project centerAt location (wkid:"+a.spatialReference.wkid+") to mesh spatial reference (wkid:"+b.spatialReference.wkid+")")}};var u=h.vec3d.create(),t=h.vec3d.create(),q=h.mat4d.create(),k=h.mat4d.create()});