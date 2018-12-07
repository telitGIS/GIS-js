// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../lib/glMatrix ./TerrainConst ../webgl-engine/lib/DefaultVertexAttributeLocations ../webgl-engine/lib/DefaultVertexBufferLayouts ../webgl-engine/lib/glUtil3D ../../vectorTiles/tileRendererHelper3D ../../vectorTiles/VectorTileDisplayObject ../../webgl/BufferObject ../../webgl/FramebufferObject ../../webgl/Texture ../../webgl/Util ../../webgl/VertexArrayObject".split(" "),function(J,K,t,w,C,D,x,E,F,G,H,v,A,I){function y(e){return e instanceof HTMLImageElement||e instanceof HTMLCanvasElement}
var B=Array(20),z=[0,0];return function(){function e(b,a,c,d,h){this._blackTex=this._backgroundTex=null;this.tileSize=256;this._context=b;this.tileSize=a;this._resourceCounter=d;this._setNeedsRender=h;b.capabilities.textureFilterAnisotropic&&(this._maxAnisotropy=Math.min(8,b.parameters.maxMaxAnisotropy));a=new Float32Array(20);a[0]=-1;a[1]=-1;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=-1;a[7]=0;a[8]=1;a[9]=0;a[10]=-1;a[11]=1;a[12]=0;a[13]=0;a[14]=1;a[15]=1;a[16]=1;a[17]=0;a[18]=1;a[19]=1;this._vaoQuad=new I(b,
C.Default3D,{geometry:D.Pos3Tex},{geometry:G.createVertex(b,35044,a)});this._blendLayersProgram=c.get("blendLayers");this._blackTex=x.createColorTexture(this._context,[0,0,0,1])}e.prototype.dispose=function(){this._fbo&&(this._fbo.dispose(),this._fbo=null);this._vaoQuad&&(this._vaoQuad.dispose(),this._vaoQuad=null);this._backgroundTex&&(this._backgroundTex.dispose(),this._backgroundTex=null);this._blackTex&&(this._blackTex.dispose(),this._blackTex=null);this._blendLayersProgram&&(this._blendLayersProgram.dispose(),
this._blendLayersProgram=null);this._context&&(this._context=null)};e.prototype.updateTileTexture=function(b){for(var a=w.LayerClass.MAP,c=b.layerInfo[a],d=0;d<c.length;d++)c[d].pendingUpdates&=~w.TileUpdateTypes.UPDATE_TEXTURE;if(b.renderData){for(var d=b.renderData,h=b.parentSurface,e=h.baseOpacity,u=0,f=!1,k=c.length-1,l=c.length,n=0;n<c.length;n++){var g=c[n],r=h.layerViewByIndex(n,a),m=r.fullOpacity;B[n]=m;this._isBaseLayer(r.layer)&&l>=c.length&&(l=n);if(g.data||g.upsampleFromTile)if(u++,r.isOpaque&&
1===m){f=!0;k=n;break}}var p,h=e;0===u&&this._backgroundTex?(d.textureReference=this._backgroundTex,t.vec4d.set4(0,0,1,1,d.texOffsetAndScale)):1===u&&f?(g=c[k],g.data?(a=g,t.vec4d.set4(0,0,1,1,d.texOffsetAndScale)):(p=g.upsampleFromTile,a=p.tile.layerInfo[a][k],t.vec4d.set4(p.offset[0],p.offset[1],p.scale,p.scale,d.texOffsetAndScale)),a&&(y(a.data)&&(a.data=this._buildTexture(a.data),p?p.tile.updateMemoryUsed():b.updateMemoryUsed()),a.data instanceof v&&(d.textureReference=a.data))):(h=this._composeMapLayers(b,
c,k,l,f,B),d.textureReference=null,t.vec4d.set4(0,0,1,1,d.texOffsetAndScale));d.opacity=h;this._setNeedsRender()}};e.prototype.setBackground=function(b){y(b)?this._backgroundTex=this._buildTexture(b):this._backgroundTex=x.createColorTexture(this._context,b||[0,0,0,0])};e.prototype._buildTexture=function(b){var a={target:3553,pixelFormat:6408,dataType:5121,wrapMode:33071,samplingMode:9729,maxAnisotropy:this._maxAnisotropy,flipped:!0,hasMipmap:!0},c=this._context,d;if(b)try{d=new v(c,a,b)}catch(h){d=
x.createEmptyTexture(c),console.warn("TileRenderer: failed to execute 'texImage2D', cross-origin image may not be loaded.")}else a.width=a.height=this.tileSize,d=new v(c,a);c.bindTexture(d);d.generateMipmap();return d};e.prototype._drawRasterData=function(b,a,c,d){void 0===d&&(d=1);var h=this._context,e=this._blendLayersProgram,u=this._vaoQuad;h.bindProgram(e);h.bindVAO(u);A.assertCompatibleVertexAttributeLocations(u,e);h.bindTexture(b,0);e.setUniform1i("tex",0);e.setUniform1f("scale",a);e.setUniform2f("offset",
c[0],c[1]);e.setUniform1f("opacity",d);h.drawArrays(5,0,A.vertexCount(u,"geometry"))};e.prototype._composeMapLayers=function(b,a,c,d,e,t){var h=w.LayerClass.MAP,f=this._context;b.renderData.texture||(b.renderData.texture=this._buildTexture(),b.updateMemoryUsed());var k=b.renderData.texture,l=this._fbo;l&&l.width===k.descriptor.width&&l.height===k.descriptor.height||(this._fbo=l=H.create(f,{colorTarget:0,depthStencilTarget:1,width:k.descriptor.width,height:k.descriptor.height}));var n=f.gl;f.bindFramebuffer(l);
f.setViewport(0,0,this.tileSize,this.tileSize);f.setClearColor(0,0,0,0);f.setClearDepth(1);f.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT);f.setDepthTestEnabled(!1);f.setBlendFunction(1,771);f.setBlendEquation(32774);f.setBlendingEnabled(!0);var g,r,m,p;!e&&this._backgroundTex&&this._drawRasterData(this._backgroundTex,1,z);e=b.parentSurface.baseOpacity;for(l=!1;0<=c;c--){var q=null;g=a[c];g.data?(q=g,r=z,m=1):g.upsampleFromTile&&(m=g.upsampleFromTile,q=m.tile.layerInfo[h][c],p=m.tile.lij[0],r=[m.offset[0],
m.offset[1]],m=m.scale);q&&(c<d&&1>e&&!l&&(f.setBlendFunction(0,770),this._drawRasterData(this._blackTex,1,z,e),f.setBlendFunction(1,771),l=!0),q.data instanceof F?(g=b.parentSurface.layerViewByIndex(c,h),E(this._context,b.lij,q.data,g.renderer,g.schemeHelper,b.lij[0],k.descriptor.width,k.descriptor.height,0,m,r,p,t[c])):(y(q.data)&&(q.data=this._buildTexture(q.data),q===g?b.updateMemoryUsed():g.upsampleFromTile.tile.updateMemoryUsed()),q.data instanceof v&&this._drawRasterData(q.data,m,r,t[c])))}f.bindTexture(k);
n.copyTexImage2D(f.gl.TEXTURE_2D,0,k.descriptor.pixelFormat,0,0,k.descriptor.width,k.descriptor.height,0);k.generateMipmap();f.bindFramebuffer(null);f.setBlendFunctionSeparate(770,771,1,771);f.setBlendingEnabled(!1);this._resourceCounter.incrementNumTileTexturesComposited();return l?1:e};e.prototype._isBaseLayer=function(b){return b.parent&&"esri.Basemap"===b.parent.declaredClass&&-1<b.parent.baseLayers.indexOf(b)};return e}()});