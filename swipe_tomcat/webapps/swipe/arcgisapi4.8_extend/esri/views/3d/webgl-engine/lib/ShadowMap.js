// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../../../core/Logger ./Camera ./DefaultVertexAttributeLocations ./DefaultVertexBufferLayouts ./gl-matrix ./glUtil3D ./Util ../../../webgl/BufferObject ../../../webgl/FramebufferObject ../../../webgl/Texture ../../../webgl/Util ../../../webgl/VertexArrayObject".split(" "),function(Q,D,ga,ha,ia,ja,a,ka,m,la,ma,na,R,oa){function p(b,g){a.vec3d.set3(b[g],b[g+3],b[g+6],S);return S}var pa=ga.getLogger("esri.views.3d.webgl-engine.lib.ShadowMap"),qa=function(){return function(){this.camera=
new ha;this.lightMat=a.mat4d.create()}}();Q=function(){function d(a,b){this.doShadowMapMipmapsWork=!1;this.textureRes=4096;this.numCascades=1;this.maxNumCascades=2;this.cascadeDistances=[0,0,0,0,0];this.cascades=[];this.programRep=a;this.rctx=b;this.emptyTexture=ka.createEmptyTexture(b);for(a=0;4>a;++a)this.cascades.push(new qa)}d.prototype.dispose=function(){this.emptyTexture.dispose();this.emptyTexture=null};Object.defineProperty(d.prototype,"isSupported",{get:function(){return this.rctx.capabilities.standardDerivatives},
enumerable:!0,configurable:!0});Object.defineProperty(d.prototype,"textureResolution",{get:function(){return this.textureRes},set:function(a){this.textureRes=a},enumerable:!0,configurable:!0});Object.defineProperty(d.prototype,"maxCascades",{get:function(){return this.maxNumCascades},set:function(a){this.maxNumCascades=m.clamp(Math.floor(a),1,4)},enumerable:!0,configurable:!0});Object.defineProperty(d.prototype,"enabled",{get:function(){return!!this.depthTexture},set:function(a){a?this.enable():this.disable()},
enumerable:!0,configurable:!0});d.prototype.getDepthTexture=function(){return this.depthTexture};d.prototype.getCascades=function(){for(var a=0;a<this.numCascades;++a)P[a]=this.cascades[a];P.length=this.numCascades;return P};d.prototype.prepare=function(g,t,G,l){m.assert(this.enabled);a.mat4d.multiply(g.projectionMatrix,g.viewMatrix,T);var c=l.near,d=l.far;2>c&&(c=2);2>d&&(d=2);c>=d&&(c=2,d=4);this.numCascades=Math.min(1+Math.floor(m.logWithBase(d/c,4)),this.maxNumCascades);G=Math.pow(d/c,1/this.numCascades);
for(l=0;l<this.numCascades+1;++l)this.cascadeDistances[l]=c*Math.pow(G,l);a.mat4d.inverse(T,U);a.mat4d.lookAt([0,0,0],[-t[0],-t[1],-t[2]],[0,1,0],V);G=g.viewMatrix;g=g.projectionMatrix;for(l=0;l<this.numCascades;++l){var q=this.cascades[l],d=-this.cascadeDistances[l],c=-this.cascadeDistances[l+1],d=(g[10]*d+g[14])/Math.abs(g[11]*d+g[15]),c=(g[10]*c+g[14])/Math.abs(g[11]*c+g[15]);m.assert(d<c);for(var e=0;8>e;++e){a.vec4d.set4(0===e%4||3===e%4?-1:1,0===e%4||1===e%4?-1:1,4>e?d:c,1,W);a.mat4d.multiplyVec4(U,
W,r[e]);for(var f=0;3>f;++f)r[e][f]/=r[e][3]}a.vec3d.negate(r[0],X);a.mat4d.translate(V,X,Y);q.camera.viewMatrix=Y;for(e=0;8>e;++e)a.mat4d.multiplyVec3(q.camera.viewMatrix,r[e]);a.vec3d.set(r[0],z);a.vec3d.set(r[0],A);for(e=1;8>e;++e)for(f=0;3>f;++f)z[f]=Math.min(z[f],r[e][f]),A[f]=Math.max(A[f],r[e][f]);z[2]-=200;A[2]+=200;q.camera.near=-A[2];q.camera.far=-z[2];c=1/r[0][3];d=1/r[4][3];m.assert(c<d);var f=c+Math.sqrt(c*d),e=Math.sin(Math.acos(G[2]*t[0]+G[6]*t[1]+G[10]*t[2])),f=f/e,c=r,K=f,E=e,e=Z,
u=aa,k=ra,x=ba,f=ca;a.vec2d.set2(0,0,w);for(var h=0;4>h;++h)a.vec2d.add(w,c[h],w);a.vec2d.scale(w,.25);a.vec2d.set2(0,0,L);for(h=4;8>h;++h)a.vec2d.add(L,c[h],L);a.vec2d.scale(L,.25);a.vec2d.lerp(c[4],c[5],.5,F[0]);a.vec2d.lerp(c[5],c[6],.5,F[1]);a.vec2d.lerp(c[6],c[7],.5,F[2]);a.vec2d.lerp(c[7],c[4],.5,F[3]);for(var B=0,y=a.vec2d.dist2(F[0],w),h=1;4>h;++h){var H=a.vec2d.dist2(F[h],w);H<y&&(y=H,B=h)}a.vec2d.subtract(F[B],c[B+4],n);h=n[0];n[0]=-n[1];n[1]=h;a.vec2d.subtract(L,w,da);a.vec2d.lerp(n,da,
E);a.vec2d.normalize(n);B=E=void 0;E=B=a.vec2d.dot(a.vec2d.subtract(c[0],w,C),n);for(h=1;8>h;++h)y=a.vec2d.dot(a.vec2d.subtract(c[h],w,C),n),y<E?E=y:y>B&&(B=y);a.vec2d.set(w,e);a.vec2d.scale(n,E-K,C);a.vec2d.add(e,C,e);for(var H=-1,D=1,h=K=y=0;8>h;++h){a.vec2d.subtract(c[h],e,N);a.vec2d.normalize(N);var M=n[0]*N[1]-n[1]*N[0];0<M?M>H&&(H=M,y=h):M<D&&(D=M,K=h)}m.verify(0<H,"leftArea");m.verify(0>D,"rightArea");a.vec2d.scale(n,E,I);a.vec2d.add(I,w,I);a.vec2d.scale(n,B,J);a.vec2d.add(J,w,J);O[0]=-n[1];
O[1]=n[0];u=m.rayRay2D(e,c[K],J,a.vec2d.add(J,O,C),1,u);k=m.rayRay2D(e,c[y],J,C,1,k);x=m.rayRay2D(e,c[y],I,a.vec2d.add(I,O,C),1,x);c=m.rayRay2D(e,c[K],I,C,1,f);m.verify(u,"rayRay");m.verify(k,"rayRay");m.verify(x,"rayRay");m.verify(c,"rayRay");k=Z;c=aa;e=ba;x=ca;f=q.camera.projectionMatrix;a.vec2d.scale(a.vec2d.subtract(e,x,v),.5);b[0]=v[0];b[1]=v[1];b[2]=0;b[3]=v[1];b[4]=-v[0];b[5]=0;b[6]=v[0]*v[0]+v[1]*v[1];b[7]=v[0]*v[1]-v[1]*v[0];b[8]=1;b[6]=-a.vec2d.dot(p(b,0),k);b[7]=-a.vec2d.dot(p(b,1),k);
k=a.vec2d.dot(p(b,0),e)+b[6];u=a.vec2d.dot(p(b,1),e)+b[7];h=a.vec2d.dot(p(b,0),x)+b[6];x=a.vec2d.dot(p(b,1),x)+b[7];k=-(k+h)/(u+x);b[0]+=b[1]*k;b[3]+=b[4]*k;b[6]+=b[7]*k;k=1/(a.vec2d.dot(p(b,0),e)+b[6]);u=1/(a.vec2d.dot(p(b,1),e)+b[7]);b[0]*=k;b[3]*=k;b[6]*=k;b[1]*=u;b[4]*=u;b[7]*=u;b[2]=b[1];b[5]=b[4];b[8]=b[7];b[7]+=1;k=a.vec2d.dot(p(b,1),c)+b[7];u=a.vec2d.dot(p(b,2),c)+b[8];h=a.vec2d.dot(p(b,1),e)+b[7];x=a.vec2d.dot(p(b,2),e)+b[8];k=-.5*(k/u+h/x);b[1]+=b[2]*k;b[4]+=b[5]*k;b[7]+=b[8]*k;k=a.vec2d.dot(p(b,
1),c)+b[7];u=a.vec2d.dot(p(b,2),c)+b[8];h=-u/k;b[1]*=h;b[4]*=h;b[7]*=h;f[0]=b[0];f[1]=b[1];f[2]=0;f[3]=b[2];f[4]=b[3];f[5]=b[4];f[6]=0;f[7]=b[5];f[8]=0;f[9]=0;f[10]=1;f[11]=0;f[12]=b[6];f[13]=b[7];f[14]=0;f[15]=b[8];q.camera.projectionMatrix[10]=2/(z[2]-A[2]);q.camera.projectionMatrix[14]=-(z[2]+A[2])/(z[2]-A[2]);a.mat4d.multiply(q.camera.projectionMatrix,q.camera.viewMatrix,q.lightMat);c=this.textureRes/2;q.camera.viewport[0]=0===l%2?0:c;q.camera.viewport[1]=0===Math.floor(l/2)?0:c;q.camera.viewport[2]=
c;q.camera.viewport[3]=c}this.lastOrigin=null;this.cascadeDistances[this.numCascades]=100*d;t=this.rctx;l=t.gl;t.bindFramebuffer(this.fbo);t.bindTexture(null,7);t.setClearColor(1,1,1,1);t.clear(l.COLOR_BUFFER_BIT|l.DEPTH_BUFFER_BIT);t.setBlendingEnabled(!1)};d.prototype.finish=function(a){m.assert(this.enabled);this.rctx.bindFramebuffer(a);this.doShadowMapMipmapsWork&&this.depthTexture.generateMipmap()};d.prototype.bind=function(a){var b=this.rctx,d=this.enabled;b.bindTexture(d?this.depthTexture:
this.emptyTexture,7);b.bindProgram(a);a.setUniform1i("depthTex",7);a.setUniform1f("depthHalfPixelSz",d?.5/this.textureRes:-1);a.setUniform1i("shadowMapNum",this.numCascades);a.setUniform4f("shadowMapDistance",this.cascadeDistances[0],this.cascadeDistances[1],this.cascadeDistances[2],this.cascadeDistances[3])};d.prototype.bindAll=function(a){a=a.getProgramsUsingUniform("shadowMapDistance");for(var b=0;b<a.length;b++)this.bind(a[b])};d.prototype.bindView=function(b,d){if(this.enabled){var g=this.lastOrigin;
if(!g||g[0]!==d[0]||g[1]!==d[1]||g[2]!==d[2])for(this.lastOrigin=this.lastOrigin||a.vec3d.create(),a.vec3d.set(d,this.lastOrigin),g=0;g<this.numCascades;++g){a.mat4d.translate(this.cascades[g].lightMat,d,ea);for(var l=0;16>l;++l)fa[16*g+l]=ea[l]}b.setUniformMatrix4fv("shadowMapMatrix",fa)}};d.prototype.drawDebugQuad=function(a){m.assert(this.enabled);var b=this.rctx,d=b.gl;if(!this.debugQuadVAO){var g=new Float32Array([0,0,0,0,256,0,1,0,0,256,0,1,256,256,1,1]);this.debugQuadVAO=new oa(b,ia.Default3D,
{geometry:ja.Pos2Tex},{geometry:la.createVertex(b,d.STATIC_DRAW,g)})}var g=this.programRep.get("showDepth"),c=this.debugQuadVAO;b.setDepthTestEnabled(!1);b.bindProgram(g);g.setUniformMatrix4fv("proj",a);g.setUniform1i("depthTex",0);b.bindTexture(this.depthTexture,0);b.bindVAO(c);R.assertCompatibleVertexAttributeLocations(c,g);b.drawArrays(d.TRIANGLE_STRIP,0,R.vertexCount(c,"geometry"));b.setDepthTestEnabled(!0)};d.prototype.enable=function(){if(!this.enabled)if(this.isSupported){var a=this.rctx.gl;
this.depthTexture=new na(this.rctx,{target:a.TEXTURE_2D,pixelFormat:a.RGBA,dataType:a.UNSIGNED_BYTE,wrapMode:a.CLAMP_TO_EDGE,samplingMode:a.NEAREST,flipped:!0,width:this.textureRes,height:this.textureRes});this.fbo=ma.createWithAttachments(this.rctx,this.depthTexture,{colorTarget:0,depthStencilTarget:1,width:this.textureRes,height:this.textureRes})}else pa.warn("Shadow maps are not supported for this browser or hardware")};d.prototype.disable=function(){this.enabled&&this.fbo&&(this.fbo.dispose(),
this.depthTexture=this.fbo=null)};return d}();var Y=a.mat4d.create(),T=a.mat4d.create(),U=a.mat4d.create(),W=a.vec4d.create(),r=[];for(D=0;8>D;++D)r.push(a.vec4d.create());var z=a.vec3d.create(),A=a.vec3d.create(),Z=a.vec2d.create(),aa=a.vec2d.create(),ra=a.vec2d.create(),ba=a.vec2d.create(),ca=a.vec2d.create(),V=a.mat4d.create(),X=a.vec3d.create(),P=[],ea=a.mat4d.create(),fa=new Float32Array(64),w=a.vec2d.create(),L=a.vec2d.create(),F=[a.vec2d.create(),a.vec2d.create(),a.vec2d.create(),a.vec2d.create()],
n=a.vec2d.create(),da=a.vec2d.create(),C=a.vec2d.create(),N=a.vec2d.create(),I=a.vec2d.create(),J=a.vec2d.create(),O=a.vec2d.create(),S=a.vec3d.create(),v=a.vec2d.create(),b=a.mat3d.create();return Q});