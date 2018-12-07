// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports dojo/has ../../core/promiseUtils ../../layers/Layer ../../layers/support/lazyLayerLoader ../PortalItem ./mapNotesUtils ./portalLayers ../../renderers/support/styleUtils".split(" "),function(E,e,F,k,q,h,r,t,u,v){function w(a,b,c){var d,f={};b.itemId&&(f.portalItem={id:b.itemId,portal:c.context.portal});d=new a(f);d.read(b,c.context);return v.loadStyleRenderer(d,c.context).then(function(){return k.resolve(d)})}function m(a,b){return x(a,b).then(function(c){return w(c,a,b)})}
function x(a,b){var c=b.context,d=y(c),f=a.layerType||a.type;!f&&b&&b.defaultLayerType&&(f=b.defaultLayerType);b=(b=d[f])?h.layerLookupMap[b]:h.layerLookupMap.UnknownLayer;if("Feature Collection"===a.type){if(a.itemId)return(new r({id:a.itemId,portal:c&&c.portal})).load().then(u.selectLayerClassPath).then(function(a){return h.layerLookupMap[a.className||"UnknownLayer"]}).then(function(a){return a()})}else"ArcGISFeatureLayer"===f&&t.isMapNotesLayer(a)&&(b=h.layerLookupMap.MapNotesLayer);a.wmtsInfo&&
(b=h.layerLookupMap.WMTSLayer);return b()}function y(a){switch(a.origin){case "web-scene":switch(a.layerContainerType){case "basemap":a=z;break;case "ground":a=A;break;default:a=B}break;default:switch(a.layerContainerType){case "basemap":a=C;break;default:a=D}}return a}function n(a,b,c){return b&&b.filter?c.then(function(a){var c=b.filter(a);return void 0===c?k.resolve(a):c instanceof q?k.resolve(c):c}):c}function l(a,b,c){if(!b)return[];for(var d=[],f=[],e=0;e<b.length;e++){var g=b[e],h=m(g,c);d.push(h);
f.push(null);if("GroupLayer"===g.layerType&&g.layers&&Array.isArray(g.layers)&&0<g.layers.length){g=g.layers.map(function(a){return m(a,c)});d.push.apply(d,g);for(var l=0;l<g.length;l++)f.push(h)}}var p={};return d.map(function(b,d){var e=function(a,b){p[b.id]=d;var c=a.findIndex(function(a){if(!a.id)return!1;a=p[a.id];return void 0===a?!1:d<a});0>c&&(c=void 0);a.add(b,c)};return n(a,c,b).then(function(b){if(null===f[d])e(a,b);else return f[d].then(function(a){e(a.layers,b);return k.resolve(b)});
return k.resolve(b)})})}Object.defineProperty(e,"__esModule",{value:!0});var B={ArcGISFeatureLayer:"FeatureLayer",ArcGISImageServiceLayer:"ImageryLayer",ArcGISMapServiceLayer:"MapImageLayer",PointCloudLayer:"PointCloudLayer",ArcGISSceneServiceLayer:"SceneLayer",IntegratedMeshLayer:"IntegratedMeshLayer",ArcGISTiledElevationServiceLayer:"ElevationLayer",ArcGISTiledImageServiceLayer:"TileLayer",ArcGISTiledMapServiceLayer:"TileLayer",GroupLayer:"GroupLayer",WebTiledLayer:"WebTileLayer",CSV:"CSVLayer",
VectorTileLayer:"VectorTileLayer",WMS:"WMSLayer",DefaultTileLayer:"TileLayer"},A={ArcGISTiledElevationServiceLayer:"ElevationLayer",DefaultTileLayer:"ElevationLayer"},z={ArcGISTiledMapServiceLayer:"TileLayer",ArcGISTiledImageServiceLayer:"TileLayer",OpenStreetMap:"OpenStreetMapLayer",WebTiledLayer:"WebTileLayer",VectorTileLayer:"VectorTileLayer",ArcGISImageServiceLayer:"UnsupportedLayer",WMS:"UnsupportedLayer",ArcGISMapServiceLayer:"UnsupportedLayer",DefaultTileLayer:"TileLayer"},D={ArcGISFeatureLayer:"FeatureLayer",
ArcGISImageServiceLayer:"ImageryLayer",ArcGISImageServiceVectorLayer:"UnsupportedLayer",ArcGISMapServiceLayer:"MapImageLayer",ArcGISStreamLayer:"StreamLayer",ArcGISTiledImageServiceLayer:"TileLayer",ArcGISTiledMapServiceLayer:"TileLayer",VectorTileLayer:"VectorTileLayer",WebTiledLayer:"WebTileLayer",CSV:"CSVLayer",GeoRSS:"GeoRSSLayer",KML:"KMLLayer",WMS:"WMSLayer",BingMapsAerial:"BingMapsLayer",BingMapsRoad:"BingMapsLayer",BingMapsHybrid:"BingMapsLayer",DefaultTileLayer:"TileLayer"},C={ArcGISImageServiceLayer:"ImageryLayer",
ArcGISImageServiceVectorLayer:"UnsupportedLayer",ArcGISMapServiceLayer:"MapImageLayer",ArcGISTiledImageServiceLayer:"TileLayer",ArcGISTiledMapServiceLayer:"TileLayer",OpenStreetMap:"OpenStreetMapLayer",VectorTileLayer:"VectorTileLayer",WebTiledLayer:"WebTileLayer",BingMapsAerial:"BingMapsLayer",BingMapsRoad:"BingMapsLayer",BingMapsHybrid:"BingMapsLayer",WMS:"WMSLayer",DefaultTileLayer:"TileLayer"};e.createLayer=m;e.processLayer=n;e.populateLayers=l;e.populateOperationalLayers=function(a,b,c){return l(a,
b,c)}});