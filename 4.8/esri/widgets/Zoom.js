// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper dojo/i18n!./Zoom/nls/Zoom ../core/accessorSupport/decorators ./Widget ./Zoom/IconButton ./Zoom/ZoomViewModel ./support/widget".split(" "),function(m,n,k,c,e,b,l,f,g,d){return function(h){function a(a){a=h.call(this)||this;a.iconClass="esri-icon-zoom-in-magnifying-glass";a.label=e.widgetLabel;a.view=null;a.viewModel=new g;return a}k(a,h);a.prototype.postInitialize=function(){this._zoomInButton=new f({action:this.zoomIn,
iconClass:"esri-icon-plus",title:e.zoomIn});this._zoomOutButton=new f({action:this.zoomOut,iconClass:"esri-icon-minus",title:e.zoomOut})};Object.defineProperty(a.prototype,"layout",{set:function(a){"horizontal"!==a&&(a="vertical");this._set("layout",a)},enumerable:!0,configurable:!0});a.prototype.render=function(){var a,b=this.viewModel,c=(a={},a["esri-zoom--horizontal"]="horizontal"===this.layout,a);this._zoomInButton.enabled="ready"===b.state&&b.canZoomIn;this._zoomOutButton.enabled="ready"===b.state&&
b.canZoomOut;return d.tsx("div",{class:this.classes("esri-zoom esri-widget",c)},this._zoomInButton.render(),this._zoomOutButton.render())};a.prototype.zoomIn=function(){};a.prototype.zoomOut=function(){};c([b.property()],a.prototype,"iconClass",void 0);c([b.property()],a.prototype,"label",void 0);c([b.property({value:"vertical"}),d.renderable()],a.prototype,"layout",null);c([b.aliasOf("viewModel.view"),d.renderable()],a.prototype,"view",void 0);c([b.property({type:g}),d.renderable(["viewModel.canZoomIn",
"viewModel.canZoomOut","viewModel.state"])],a.prototype,"viewModel",void 0);c([b.aliasOf("viewModel.zoomIn")],a.prototype,"zoomIn",null);c([b.aliasOf("viewModel.zoomOut")],a.prototype,"zoomOut",null);return a=c([b.subclass("esri.widgets.Zoom")],a)}(b.declared(l))});