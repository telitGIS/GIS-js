// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["../../Graphic","../../core/JSONSupport","../../geometry/SpatialReference","./DirectionsFeatureSet","./NAMessage"],function(c,b,d,e,f){return b.createSubclass({declaredClass:"esri.tasks.support.ClosestFacilitySolveResult",properties:{directions:{value:null,type:[e]},facilities:{value:null,json:{read:function(a){return a&&this._graphicsFromJson(a)}}},incidents:{value:null,json:{read:function(a){return a&&this._graphicsFromJson(a)}}},messages:{value:null,type:[f]},pointBarriers:{value:null,
json:{read:function(a){return a&&this._graphicsFromJson(a)}}},polylineBarriers:{value:null,json:{read:function(a){return a&&this._graphicsFromJson(a)}}},polygonBarriers:{value:null,json:{read:function(a){return a&&this._graphicsFromJson(a)}}},routes:{value:null,json:{read:function(a){return a&&this._graphicsFromJson(a)}}}},_graphicsFromJson:function(a){var b=d.fromJSON(a.spatialReference);return(a.features||[]).map(function(a){a=c.fromJSON(a);a.geometry.set("spatialReference",b);return a})}})});