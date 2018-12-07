// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports","../../../geometry","./georeference","../../../views/3d/lib/glMatrix"],function(C,u,A,B,x){Object.defineProperty(u,"__esModule",{value:!0});u.createUnitSizeBox=function(){for(var a=z.faceDescriptions,e=z.faceVertexOffsets,k=z.uvScales,b=4*a.length,f=new Float64Array(3*b),c=new Float32Array(3*b),b=new Float32Array(2*b),h=new Uint32Array(6*a.length),v=0,p=0,g=0,d=0,n=0;n<a.length;n++){for(var t=a[n],m=v/3,r=0,q=e;r<q.length;r++){var l=q[r];h[d++]=m+l}m=t.corners;for(r=0;4>
r;r++){q=m[r];l=0;b[g++]=.25*k[r][0]+t.uvOrigin[0];b[g++]=t.uvOrigin[1]-.25*k[r][1];for(var w=0;3>w;w++)0!==t.axis[w]?(f[v++]=.5*t.axis[w],c[p++]=t.axis[w]):(f[v++]=.5*q[l++],c[p++]=0)}}return{position:f,normal:c,uv:b,faces:h}};u.createUnitSizeSphere=function(a){void 0===a&&(a=0);a=Math.round(8*Math.pow(2,a));for(var e=2*a,k=(a-1)*(e+1)+2*e,b=new Float64Array(3*k),f=new Float32Array(3*k),k=new Float32Array(2*k),c=new Uint32Array((a-1)*e*6),m=0,v=0,p=0,g=0,d=0,n=0;n<=a;n++){var t=n/a*Math.PI+.5*Math.PI,
u=Math.cos(t);h[2]=Math.sin(t);for(var r=(t=0===n||n===a)?e-1:e,q=0;q<=r;q++){var l=q/r*2*Math.PI;h[0]=-Math.sin(l)*u;h[1]=Math.cos(l)*u;for(l=0;3>l;l++)b[m++]=.5*h[l],f[v++]=h[l];k[p++]=(q+(t?.5:0))/e;k[p++]=n/a;0!==n&&q!==e&&(n!==a&&(c[g++]=d,c[g++]=d+1,c[g++]=d-e),1!==n&&(c[g++]=d,c[g++]=d-e,c[g++]=d-e-1));d++}}return{position:b,normal:f,uv:k,faces:c}};u.createUnitSizeCylinder=function(a){void 0===a&&(a=0);a=Math.round(16*Math.pow(2,a));for(var e=4*(a+1)+2*a,k=new Float64Array(3*e),b=new Float32Array(3*
e),e=new Float32Array(2*e),f=new Uint32Array(12*a),c=0,m=0,v=0,p=0,g=0,d=0;5>=d;d++)for(var n=0===d||5===d,t=1>=d||4<=d,u=2===d||4===d,r=n?a-1:a,q=0;q<=r;q++){var l=q/r*2*Math.PI,w=n?0:.5;h[0]=w*Math.sin(l);h[1]=w*-Math.cos(l);h[2]=2>=d?.5:-.5;for(l=0;3>l;l++)k[c++]=h[l],t?b[m++]=2===l?1>=d?1:-1:0:b[m++]=2===l?0:h[l]/w;e[v++]=(q+(n?.5:0))/a;1>=d?e[v++]=1*d/3:3>=d?e[v++]=1*(d-2)/3+1/3:e[v++]=1*(d-4)/3+2/3;u||0===d||q===a||(5!==d&&(f[p++]=g,f[p++]=g+1,f[p++]=g-a),1!==d&&(f[p++]=g,f[p++]=g-a,f[p++]=
g-a-1));g++}return{position:k,normal:b,uv:e,faces:f}};u.createUnitSizePlane=function(a){a=y.facingAxisOrderSwap[a];for(var e=y.position,k=y.normal,b=new Float64Array(e.length),f=new Float32Array(k.length),c=0,h=0;4>h;h++)for(var m=c,p=0;3>p;p++){var g=a[p],d=Math.abs(g)-1,g=0<=g?1:-1;b[c]=e[m+d]*g;f[c]=k[m+d]*g;c++}return{position:b,normal:f,uv:new Float32Array(y.uv),faces:new Uint32Array(y.faces)}};var y={position:[-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],normal:[0,0,1,0,0,1,0,0,1,0,0,1],uv:[0,1,1,1,
1,0,0,0],faces:[0,1,2,0,2,3],facingAxisOrderSwap:{east:[3,1,2],west:[-3,-1,2],north:[-1,3,2],south:[1,-3,2],up:[1,2,3],down:[1,-2,-3]}};u.convertUnitGeometry=function(a,e,k){for(var b=0;b<a.position.length;b+=3)a.position[b+2]+=.5;b=k&&k.size;if(null!=b){b="number"===typeof b?[b,b,b]:[null!=b.width?b.width:1,null!=b.depth?b.depth:1,null!=b.height?b.height:1];m[0]=b[0];m[4]=b[1];m[8]=b[2];for(var f=0;f<a.position.length;f+=3){for(var c=0;3>c;c++)h[c]=a.position[f+c];x.mat3d.multiplyVec3(m,h);for(c=
0;3>c;c++)a.position[f+c]=h[c]}if(b[0]!==b[1]||b[1]!==b[2])for(m[0]=1/b[0],m[4]=1/b[1],m[8]=1/b[2],f=0;f<a.normal.length;f+=3){for(c=0;3>c;c++)h[c]=a.normal[f+c];x.mat3d.multiplyVec3(m,h);x.vec3d.normalize(h);for(c=0;3>c;c++)a.normal[f+c]=h[c]}}b=B.georeference(a,e,k);return new A.Mesh({vertexAttributes:{position:b.position,normal:b.normal,uv:a.uv},components:[{faces:a.faces,material:k&&k.material||null}],spatialReference:e.spatialReference})};var z={faceDescriptions:[{axis:[0,-1,0],uvOrigin:[0,.625],
corners:[[-1,-1],[1,-1],[1,1],[-1,1]]},{axis:[1,0,0],uvOrigin:[.25,.625],corners:[[-1,-1],[1,-1],[1,1],[-1,1]]},{axis:[0,1,0],uvOrigin:[.5,.625],corners:[[1,-1],[-1,-1],[-1,1],[1,1]]},{axis:[-1,0,0],uvOrigin:[.75,.625],corners:[[1,-1],[-1,-1],[-1,1],[1,1]]},{axis:[0,0,1],uvOrigin:[0,.375],corners:[[-1,-1],[1,-1],[1,1],[-1,1]]},{axis:[0,0,-1],uvOrigin:[0,.875],corners:[[-1,1],[1,1],[1,-1],[-1,-1]]}],uvScales:[[0,0],[1,0],[1,1],[0,1]],faceVertexOffsets:[0,1,2,0,2,3]};u.boxFaceOrder={south:0,east:1,
north:2,west:3,up:4,down:5};var h=x.vec3d.create(),m=x.mat3d.identity()});