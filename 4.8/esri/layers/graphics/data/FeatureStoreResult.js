// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports @dojo/shim/Set ../../../core/promiseUtils ../../../geometry/support/quantizationUtils ../../../geometry/support/spatialReferenceUtils ../optimizedFeatures ./AttributesBuilder ./attributeSupport ./FeatureStoreItem ./projectionSupport".split(" "),function(t,u,x,r,v,y,z,w,A,B,C){function D(e){return e?JSON.parse(JSON.stringify(e,["latestWkid","wkid","wkt"])):e}Object.defineProperty(u,"__esModule",{value:!0});t=function(){function e(a,b){this.items=a;this.definitionExpression=
b.definitionExpression;this.geometryType=b.geometryType;this.hasM=b.hasM;this.hasZ=b.hasZ;this.objectIdField=b.objectIdField;this.spatialReference=b.spatialReference;this.fieldsMap=b.fieldsMap}Object.defineProperty(e.prototype,"size",{get:function(){return this.items.length},enumerable:!0,configurable:!0});e.prototype.createQueryResponse=function(a){return a.outStatistics?this._createStatisticsQueryResponse(a):this._createFeatureQueryResponse(a)};e.prototype.executeAttributesQuery=function(a){var b=
A.getWhereClause(a.where);if(!b)return r.resolve(this);if(b.isStandardized()){for(var g=0,f=[],d=0,c=this.items;d<c.length;d++){var l=c[d];b.testFeature(l.getAttributes())&&(f[g++]=l)}b=this._createNew(f);b.definitionExpression=a.where;return r.resolve(b)}return r.reject(new TypeError("Where clause is not standardized"))};e.prototype.executeObjectIdsQuery=function(a){if(!a.objectIds||!a.objectIds.length)return r.resolve(this);var b=new x.default(a.objectIds);return r.resolve(this._createNew(this.items.filter(function(a){return b.has(a.oid)})))};
e.prototype.project=function(a){var b=this;return!a||y.equals(this.spatialReference,a)?r.resolve(this):C.projectMany(this.items.map(function(a){return a.getGeometry()}),this.spatialReference,a).then(function(g){for(var f=[],d=0;d<b.items.length;d++)f[d]={attributes:b.items[d].getAttributes(),geometry:g[d]};g=[];d=0;for(f=z.convertFromFeatures(f,b.geometryType,b.hasZ,b.hasM);d<f.length;d++)g.push(B.default.acquire(f[d],b));return new e(g,{definitionExpression:b.definitionExpression,geometryType:b.geometryType,
hasM:b.hasM,hasZ:b.hasZ,objectIdField:b.objectIdField,spatialReference:a,fieldsMap:b.fieldsMap})})};e.prototype._createFeatureQueryResponse=function(a){var b=this,g=this.items,f=this.geometryType,d=this.hasM,c=this.hasZ,l=this.objectIdField,h=this.spatialReference,e=a.outFields,k=a.outSpatialReference,p=a.quantizationParameters,m=!1;if(null!=a.num&&null!=a.start)var q=a.start+a.num,m=g.length>q,g=g.slice(a.start,Math.min(g.length,q));return{exceededTransferLimit:m,features:this._createFeatures(a,
g),fields:e&&e.map(function(a){return b.fieldsMap.get(a)}),geometryType:f,hasM:d,hasZ:c,objectIdFieldName:l,spatialReference:D(k?k.toJSON():h),transform:p&&v.toTransform(p)}};e.prototype._createFeatures=function(a,b){var g=new w.default(a,this.fieldsMap),f=a.quantizationParameters,d=a.returnGeometry,c=a.returnCentroid,l=a.orderByFields;a=[];var h=0;if(b.length&&l&&l.length){var l=l[0].split(" "),e=l[0],k="DESC"===l[1];b.sort(function(a,b){a=g.getFieldAttribute(a,e);b=g.getFieldAttribute(b,e);if("number"===
typeof a&&"number"===typeof b)return k?b-a:a-b;if("string"===typeof a&&"string"===typeof b)return a=a.toUpperCase(),b=b.toUpperCase(),(k?a>b:a<b)?-1:(k?a<b:a>b)?1:0})}if(d||c)if(f)if(f=v.toTransform(f),d&&!c)for(c=0;c<b.length;c++)d=b[c],a[h++]={attributes:g.getAttributes(d),geometry:d.getGeometryQuantized(f)};else if(!d&&c)for(c=0;c<b.length;c++)d=b[c],a[h++]={attributes:g.getAttributes(d),centroid:d.getCentroidQuantized(f)};else for(c=0;c<b.length;c++)d=b[c],a[h++]={attributes:g.getAttributes(d),
centroid:d.getCentroidQuantized(f),geometry:d.getGeometryQuantized(f)};else if(d&&!c)for(c=0;c<b.length;c++)d=b[c],a[h++]={attributes:g.getAttributes(d),geometry:d.getGeometry()};else if(!d&&c)for(c=0;c<b.length;c++)d=b[c],a[h++]={attributes:g.getAttributes(d),centroid:d.getCentroid()};else for(c=0;c<b.length;c++)d=b[c],a[h++]={attributes:g.getAttributes(d),centroid:d.getCentroid(),geometry:d.getGeometry()};else for(c=0;c<b.length;c++)d=b[c],(d=g.getAttributes(d))&&(a[h++]={attributes:d});return a};
e.prototype._createNew=function(a){return new e(a,this)};e.prototype._createStatisticsQueryResponse=function(a){var b=new w.default(a,this.fieldsMap),g=a.outStatistics,f=[],d=[];if(a.groupByFieldsForStatistics&&a.groupByFieldsForStatistics.length)for(var c={},e=0;e<g.length;e++){var h=g[e];a=h.onStatisticField;var n=h.outStatisticFieldName,h=h.statisticType;if("count"===h){c[a]||(c[a]=this._calculateUniqueValues(b,a));var h=c[a],k;for(k in h){var p=h[k],m={attributes:{}};m.attributes[n]=p.count;m.attributes[a]=
p.data;f.push(m)}d.push({name:n,alias:n,type:"esriFieldTypeString"})}}else{k={};c={attributes:{}};for(e=0;e<g.length;e++)h=g[e],a=h.onStatisticField,n=h.outStatisticFieldName,h=h.statisticType,k[a]||(k[a]=this._calculateStatistics(b,a)),c.attributes[n]=k[a]["var"===h?"variance":h],d.push({name:n,alias:n,type:"esriFieldTypeDouble"});f.push(c)}return{fields:d,features:f}};e.prototype._calculateStatistics=function(a,b){for(var g=this.items,f=g.length,d=Number.POSITIVE_INFINITY,c=Number.NEGATIVE_INFINITY,
e=null,h=null,n=null,k=null,p=[],m=0;m<f;m++)var q=p[m]=a.getFieldAttribute(g[m],b),e=e+q,d=Math.min(d,q),c=Math.max(c,q);if(f){h=e/f;for(b=a=0;b<p.length;b++)q=p[b],a+=Math.pow(q-h,2);k=1<f?a/(f-1):0;n=Math.sqrt(k)}else c=d=null;return{avg:h,count:f,max:c,min:d,stddev:n,sum:e,variance:k}};e.prototype._calculateUniqueValues=function(a,b){for(var e={},f=0,d=this.items;f<d.length;f++){var c=a.getFieldAttribute(d[f],b);if(null==c||"string"===typeof c&&""===c.trim())c=null;null==e[c]?e[c]={count:1,data:c}:
e[c].count++}return e};return e}();u.default=t});