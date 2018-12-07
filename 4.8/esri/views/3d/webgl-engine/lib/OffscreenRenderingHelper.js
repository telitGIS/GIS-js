// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
require({cache:{"url:esri/views/3d/webgl-engine/materials/internal/offscreen.xml":'\x3c?xml version\x3d"1.0" encoding\x3d"UTF-8"?\x3e\r\n\r\n\x3csnippets\x3e\r\n\r\n\x3csnippet name\x3d"vsOffscreenRenderer"\x3e\x3c![CDATA[\r\n  $vsprecisionf\r\n\r\n  attribute vec2 $position;\r\n  varying vec2 vtc;\r\n\r\n  void main(void) {\r\n    gl_Position \x3d vec4($position.xy, 0.0, 1.0);\r\n    vtc \x3d $position.xy * 0.5 + 0.5;\r\n  }\r\n]]\x3e\x3c/snippet\x3e\r\n\r\n\x3csnippet name\x3d"fsOffscreenRenderer"\x3e\x3c![CDATA[\r\n  $fsprecisionf\r\n\r\n  uniform sampler2D tex;\r\n\r\n  varying vec2 vtc;\r\n\r\n  void main() {\r\n    gl_FragColor \x3d texture2D(tex, vtc);\r\n  }\r\n]]\x3e\x3c/snippet\x3e\r\n\r\n\x3csnippet name\x3d"fsOffscreenRendererTransparentToHUDVisibility"\x3e\x3c![CDATA[\r\n  $fsprecisionf\r\n\r\n  uniform sampler2D tex;\r\n\r\n  varying vec2 vtc;\r\n\r\n  void main() {\r\n    gl_FragColor \x3d vec4(1.0 - texture2D(tex, vtc).a);\r\n  }\r\n]]\x3e\x3c/snippet\x3e\r\n\r\n\r\n\r\n\x3c/snippets\x3e\r\n'}});
define("require exports dojo/text!../materials/internal/offscreen.xml ./DefaultVertexAttributeLocations ./glUtil3D ./RenderTargetHelper ./Util ../../../webgl/Program ../../../webgl/Util".split(" "),function(u,v,m,h,n,p,q,k,l){var r=[0,0,0,0],t=[0,1,0,1];return function(){function c(a,b){this.dimensions={width:4,height:4};this._enabled=!1;this._background={type:"color",color:[0,0,0,1]};this._programRep=a;this._rctx=b;a=this.renderTargetHelper=new p.RenderTargetHelper(b);this.mainColor=a.registerColorTarget({name:"mainColor"});
this.mainDepth=a.registerDepthTarget({name:"mainDepth"});this.hudVisibility=a.registerColorTarget({name:"hudVisibility",dataType:32819});this.tmpColor=a.registerColorTarget({name:"tmpColor"});this.tmpDepth=a.registerDepthTarget({name:"tmpDepth"})}c.loadShaders=function(a,b,c){a._parse(m);var e=new k(c,a.vsOffscreenRenderer,a.fsOffscreenRenderer,h.Default3D);b.add("offscreenProgram",e);a=new k(c,a.vsOffscreenRenderer,a.fsOffscreenRendererTransparentToHUDVisibility,h.Default3D);b.add("transparentToHUDVisibility",
a)};Object.defineProperty(c.prototype,"width",{get:function(){return this.dimensions.width},enumerable:!0,configurable:!0});Object.defineProperty(c.prototype,"height",{get:function(){return this.dimensions.height},enumerable:!0,configurable:!0});Object.defineProperty(c.prototype,"enabled",{get:function(){return this._enabled},set:function(a){a?this.enable():this.disable()},enumerable:!0,configurable:!0});Object.defineProperty(c.prototype,"background",{get:function(){return this._background},set:function(a){this._background=
a},enumerable:!0,configurable:!0});Object.defineProperty(c.prototype,"framebuffer",{get:function(){return this.renderTargetHelper.getFramebuffer(this.dimensions,this.mainColor,this.mainDepth)},enumerable:!0,configurable:!0});Object.defineProperty(c.prototype,"colorTexture",{get:function(){return this.framebuffer.colorTexture},enumerable:!0,configurable:!0});Object.defineProperty(c.prototype,"depthTexture",{get:function(){return this.renderTargetHelper.getDepthTexture(this.mainDepth,this.dimensions)},
enumerable:!0,configurable:!0});Object.defineProperty(c.prototype,"hudVisibilityTexture",{get:function(){return this.getColorTexture(this.hudVisibility)},enumerable:!0,configurable:!0});c.prototype.initializeFrame=function(a){q.assert(this.enabled);var b=this._rctx,c=b.gl;a=a.fullViewport;this.dimensions.width=a[2];this.dimensions.height=a[3];this.bindTarget(this.mainColor,this.mainDepth);b.setClearStencil(0);a=this._background.color;b.setClearColor(a[0]*a[3],a[1]*a[3],a[2]*a[3],a[3]);b.clear(c.COLOR_BUFFER_BIT|
c.DEPTH_BUFFER_BIT|c.STENCIL_BUFFER_BIT)};c.prototype.renderSeparateAndComposite=function(a,b,c){void 0===b&&(b=r);void 0===c&&(c="none");this.renderToTargets(a,this.tmpColor,this.mainDepth,b);this.composite(this.getColorTexture(this.tmpColor),this.framebuffer,c)};c.prototype.renderHUDVisibility=function(a){this.renderToTargets(a,this.hudVisibility,this.mainDepth,t)};c.prototype.compositeTransparentTerrainOntoHUDVisibility=function(){var a=this,b=this._rctx;this.renderToTargets(function(){var c=a._programRep.get("transparentToHUDVisibility");
b.bindProgram(c);c.setUniform1i("tex",1);b.bindTexture(a.getColorTexture(a.tmpColor),1);b.setDepthTestEnabled(!1);b.setBlendingEnabled(!1);b.setColorMask(!1,!0,!1,!1);b.bindVAO(a.quadVAO);b.drawArrays(5,0,l.vertexCount(a.quadVAO,"geometry"));b.setColorMask(!0,!0,!0,!0);b.setDepthTestEnabled(!0)},this.hudVisibility,this.mainDepth)};c.prototype.compositeTransparentTerrainOntoMain=function(){this.composite(this.getColorTexture(this.tmpColor),this.framebuffer,"premultiplied-alpha")};c.prototype.bindFramebuffer=
function(){this._rctx.bindFramebuffer(this.framebuffer)};c.prototype.renderDepthDetached=function(a){this.bindTarget(this.mainColor);a();this.bindTarget(this.mainColor,this.mainDepth)};c.prototype.composite=function(a,c,d){void 0===a&&(a=this.framebuffer.colorTexture);void 0===c&&(c=null);void 0===d&&(d="none");var b=this._rctx,f=this._programRep.get("offscreenProgram");b.bindFramebuffer(c);b.setDepthTestEnabled(!1);b.bindProgram(f);f.setUniform1i("tex",1);b.bindTexture(a,1);switch(d){case "none":b.setBlendingEnabled(!1);
break;case "alpha":b.setBlendFunctionSeparate(770,771,1,771);b.setBlendingEnabled(!0);break;case "premultiplied-alpha":b.setBlendFunction(1,771),b.setBlendingEnabled(!0)}b.bindVAO(this.quadVAO);b.drawArrays(5,0,l.vertexCount(this.quadVAO,"geometry"));b.setDepthTestEnabled(!0);b.setBlendingEnabled(!1)};c.prototype.enable=function(){this.enabled||(this._enabled=!0,this.quadVAO=n.createQuadVAO(this._rctx))};c.prototype.disable=function(){this.enabled&&(this._enabled=!1,this.renderTargetHelper.disposeAllResource(),
this.quadVAO.dispose(!0),this.quadVAO=null)};c.prototype.renderToTargets=function(a,b,c,e,f){var d=this._rctx,g=d.gl;this.bindTarget(b,c);b=0;e&&(d.setClearColor(e[0],e[1],e[2],Math.max(1E-13,e[3])),b|=g.COLOR_BUFFER_BIT);f&&(b|=g.DEPTH_BUFFER_BIT);d.clear(b);a();g.flush();this.bindTarget(this.mainColor,this.mainDepth)};c.prototype.bindTarget=function(a,b){a=this.renderTargetHelper.getFramebuffer(this.dimensions,a,b);this._rctx.bindFramebuffer(a)};c.prototype.getColorTexture=function(a){return this.renderTargetHelper.getColorTexture(a,
this.dimensions)};return c}()});