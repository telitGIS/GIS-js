// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../../core/tsSupport/extendsHelper ../../../core/tsSupport/decorateHelper ../../../core/Handles ../../../core/ObjectPool ../../../core/accessorSupport/decorators ../../../geometry/support/webMercatorUtils ../engine/Bitmap ../engine/BitmapContainer ../engine/BitmapSource ../engine/Canvas2DContainer ../engine/Tiled ./LayerView2D ../tiling/TileInfoView ../tiling/TileKey ../tiling/TileQueue ../tiling/TileStrategy ../../layers/RefreshableLayerView".split(" "),function(D,E,h,
k,l,m,g,n,p,q,r,t,u,v,w,x,y,z,A){var B=function(e){function c(a){a=e.call(this,a)||this;a.key=new x(0,0,0,0);return a}h(c,e);c.prototype.acquire=function(a){};c.prototype.release=function(){this.key.set(0,0,0,0)};c.pool=new m(c,!0);return c}(u(p)),C=[102113,102100,3857,3785,900913];return function(e){function c(){var a=null!==e&&e.apply(this,arguments)||this;a._handles=new l;a._tileStrategy=null;a._tileInfoView=null;a._fetchQueue=null;a._tileRequests=new Map;a.container=new t;a.layer=null;return a}
h(c,e);c.prototype.hitTest=function(a,d){return null};c.prototype.update=function(a){this._fetchQueue.pause();this._fetchQueue.state=a.state;this._tileStrategy.update(a);this._fetchQueue.resume();this.notifyChange("updating")};c.prototype.attach=function(){var a=this,d=this.layer.activeLayer,b;d.tileMatrixSetId?b=d.tileMatrixSet:(b=this._getTileMatrixSetBySpatialReference(d),d.tileMatrixSetId=b.id);var c=b.tileInfo.spatialReference,f=d.fullExtent&&d.fullExtent.clone();c.isWebMercator?f=n.geographicToWebMercator(f):
c.isWGS84||(f=b.fullExtent);this._tileContainer=new q;this.container.addChild(this._tileContainer);this._tileInfoView=new w(b.tileInfo,f);this._fetchQueue=new y({tileInfoView:this._tileInfoView,process:function(b){return a.fetchTile(b)}});this._tileStrategy=new z({cachePolicy:"keep",acquireTile:function(b){return a.acquireTile(b)},releaseTile:function(b){return a.releaseTile(b)},tileInfoView:this._tileInfoView});this._handles.add(d.watch("styleId",function(b){a._refresh()}));this._handles.add(this.layer.watch("activeLayer",
function(b){if(!b.tileMatrixSetId){var d=a._getTileMatrixSetBySpatialReference(a.layer.activeLayer);b.tileMatrixSetId=d.id}a._refresh()}))};c.prototype.detach=function(){this._handles.removeAll();this._tileStrategy.destroy();this._fetchQueue.clear();this.container.removeChild(this._tileContainer);this._fetchQueue=this._tileStrategy=this._tileInfoView=this._tileContainer=null};c.prototype.moveStart=function(){this.requestUpdate()};c.prototype.viewChange=function(){this.requestUpdate()};c.prototype.moveEnd=
function(){this.requestUpdate()};c.prototype.doRefresh=function(){this.updateRequested||this.suspended||this._refresh()};c.prototype.isUpdating=function(){var a=!0;this._tileRequests.forEach(function(d){a=a&&d.isFulfilled()});return!a};c.prototype.acquireTile=function(a){var d=this,b=B.pool.acquire();b.key.set(a);b.resolution=this._tileInfoView.getTileResolution(b.key);a=this._tileInfoView.tileInfo.size;b.width=a[0];b.height=a[1];this._tileInfoView.getTileCoords(b,b.key);a=this._fetchQueue.push(b.key).then(function(a){b.source=
a;b.once("attach",function(){return d.requestUpdate()});d._tileContainer.addChild(b)});this._tileRequests.set(b,a);this.requestUpdate();return b};c.prototype.releaseTile=function(a){var d=this._tileRequests.get(a);d.isFulfilled()||d.cancel();this._tileRequests.delete(a);this._tileContainer.removeChild(a);this.requestUpdate()};c.prototype.fetchTile=function(a){var d=this;return this.layer.fetchTile(a.level,a.row,a.col).then(function(b){b=r.default.pool.acquire(b);d._tileInfoView.getTileCoords(b,a);
b.resolution=d._tileInfoView.getTileResolution(a);return b})};c.prototype._refresh=function(){var a=this;this._fetchQueue.reset();this._tileStrategy.tiles.forEach(function(d){if(d.source){d.source=null;var b=a._fetchQueue.push(d.key).then(function(b){d.source=b;d.requestRender();a.notifyChange("updating")});a._tileRequests.set(d,b)}});this.notifyChange("updating")};c.prototype._getTileMatrixSetBySpatialReference=function(a){var d=this.view.spatialReference,b=d.wkid,c=a.tileMatrixSets.find(function(a){return a.tileInfo.spatialReference.wkid===
b});!c&&d.isWebMercator&&(c=a.tileMatrixSets.find(function(a){return-1<C.indexOf(a.tileInfo.spatialReference.wkid)}));return c};k([g.property({dependsOn:["updateRequested","attached"]})],c.prototype,"updating",void 0);return c=k([g.subclass("esri.views.2d.layers.WMTSLayerView2D")],c)}(g.declared(v,A))});