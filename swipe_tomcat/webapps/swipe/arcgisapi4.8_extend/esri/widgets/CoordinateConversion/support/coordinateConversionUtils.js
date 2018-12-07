// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../../core/tsSupport/assignHelper dojo/i18n dojo/i18n!../nls/CoordinateConversion dojo/number dojo/_base/config ../../../geometry ../../../core/Error ../../../core/promiseUtils ../../../geometry/support/webMercatorUtils ./Format".split(" "),function(N,g,G,H,c,D,I,x,y,z,J,k){function E(b,a){a=F(a);return[b[0].toFixed(a),b[1].toFixed(a)]}function F(b){return 500<=b?6:500>b&&50<=b?7:50>b&&5<=b?8:9}function u(b){return"number"===typeof b&&isFinite(b)}function A(b){return b&&
u(b.x)&&u(b.y)}function v(b,a){return b.spatialReference.isGeographic&&a?(b=E([b.x,b.y],a),b[0]+", "+b[1]):b.x.toFixed(3)+", "+b.y.toFixed(3)}function e(b){var a=b.match(K),a=a?a[0]:"",c=0<=b.indexOf(".")?b.split(".")[1].length:0;return a+D.format(Number(b),{pattern:"###0.###",places:c,round:-1})}function f(b){return D.parse(b)}Object.defineProperty(g,"__esModule",{value:!0});var M={utm:{conversionMode:"utmDefault",addSpaces:!0},usng:{numOfDigits:5,rounding:!1,addSpaces:!1},mgrs:{rounding:!1}},r=
Array(3),q=H.getLocalization("dojo.cldr","number",I.locale).decimal,l=c.abbreviatedDirections.north,m=c.abbreviatedDirections.south,n=c.abbreviatedDirections.east,p=c.abbreviatedDirections.west,t={N:"north",S:"south",E:"east",W:"west"},h={};h[l]="N";h[m]="S";h[n]="E";h[p]="W";var w=new RegExp("-?\\d+[\\.|\\"+q+"]?\\d*"),B=new RegExp("N|S|"+l+"|"+m,"i"),C=new RegExp("E|W|"+n+"|"+p,"i"),K=/^[\\0]+(?=\d)/;g.clipLonLat=E;g.getDegreePrecision=F;g.debounceDeferred=function(b,a,c){var d,e;return function(){d&&
(clearTimeout(d),d=null);e&&e.cancel(null);var f=arguments;return e=z.create(function(e,L){d=setTimeout(function(){d=null;b.apply(a,f).then(function(a){return e(a)}).catch(function(a){return L(a)})},c)})}};g.fromGeoCoordinateString=function(b){var a=b.coordinate,c=b.spatialReference,d=b.formatName;return b.geometryServicePromise.then(function(b){return b.fromGeoCoordinateString({strings:[a],sr:c,conversionType:d}).then(function(a){var b=new x.Point({x:a[0][0],y:a[0][1],spatialReference:c});if(!A(b))throw a;
return b}).catch(function(a){throw new y("coordinate-conversion:from-geo-coordinate-string-failed","Failed to convert coordinate notation",{notationResult:a});})})};g.fromXY=function(b,a){var c=0<=b.indexOf(",")?",":" ",d=b.split(c).map(function(a){return(a=a.trim())?Number(a):null});b=d[0];c=d[1];d=d[2];if(!u(b)||!u(c))return null;a=new x.Point({x:b,y:c,spatialReference:a||x.SpatialReference.WGS84});d&&(a.z=d,a.hasZ=!0);return a};g.generateDefaultFormats=function(b){return[new k({name:"basemap",
coordinateSegments:[{alias:"X",description:"easting",searchPattern:w,substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:"Y",description:"northing",searchPattern:w,substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}}],defaultPattern:"X, Y",viewModel:b}),new k({name:"dd",coordinateSegments:[{alias:"Y",description:"degrees latitude",searchPattern:new RegExp("\\d{1,2}[\\.|\\"+q+"]?\\d*(?\x3d\\D*?[N|S|"+l+"|"+m+"])","i"),substitution:{input:function(a){return f(a)},
output:function(a){return e(a)}}},{alias:c.abbreviatedDirections.north,description:"north/south indicator",searchPattern:B,substitution:{input:function(a){return h[a]},output:function(a){return c.abbreviatedDirections[t[a]]}}},{alias:"X",description:"degrees longitude",searchPattern:new RegExp("\\d{1,3}[\\.|\\"+q+"]?\\d*(?\x3d\\D*?[E|W|"+n+"|"+p+"])","i"),substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:c.abbreviatedDirections.east,description:"east/west indicator",
searchPattern:C,substitution:{input:function(a){return h[a]},output:function(a){return c.abbreviatedDirections[t[a]]}}}],defaultPattern:"Y\u00b0"+c.abbreviatedDirections.north+", X\u00b0"+c.abbreviatedDirections.east,viewModel:b}),new k({name:"ddm",coordinateSegments:[{alias:"Y",description:"degrees latitude",searchPattern:new RegExp("\\d{1,2}(?\x3d.*?\\s+.*?[N|S|"+l+"|"+m+"])","i"),substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:"A",description:"minutes latitude",
searchPattern:new RegExp("\\d{1,2}[\\.\\"+q+"]?\\d*(?\x3d.*?[N|S|"+l+"||"+m+"])","i"),substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:c.abbreviatedDirections.north,description:"north/south indicator",searchPattern:B,substitution:{input:function(a){return h[a]},output:function(a){return c.abbreviatedDirections[t[a]]}}},{alias:"X",description:"degrees longitude",searchPattern:new RegExp("\\d{1,3}(?\x3d\\D*?\\s+.*?[E|W|"+n+"|"+p+"])","i"),substitution:{input:function(a){return f(a)},
output:function(a){return e(a)}}},{alias:"B",description:"minutes longitude",searchPattern:new RegExp("\\d{1,2}[\\.|\\|"+q+"]?\\d*(?\x3d.*?[E|W|"+n+"|"+p+"])","i"),substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:c.abbreviatedDirections.east,description:"east/west indicator",searchPattern:C,substitution:{input:function(a){return h[a]},output:function(a){return c.abbreviatedDirections[t[a]]}}}],defaultPattern:"Y\u00b0 A'"+c.abbreviatedDirections.north+", X\u00b0 B'"+
c.abbreviatedDirections.east,viewModel:b}),new k({name:"dms",coordinateSegments:[{alias:"Y",description:"degrees latitude",searchPattern:new RegExp("\\d{1,2}(?\x3d.*?\\s+.*?[N|S|"+l+"|"+m+"])","i"),substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:"A",description:"minutes latitude",searchPattern:new RegExp("\\d{1,2}(?\x3d.*?[N|S|"+l+"|"+m+"])","i"),substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:"B",description:"seconds latitude",
searchPattern:new RegExp("\\d{1,2}[\\.|\\"+q+"]?\\d*(?\x3d.*?[N|S|"+l+"|"+m+"])","i"),substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:c.abbreviatedDirections.north,description:"north/south indicator",searchPattern:B,substitution:{input:function(a){return h[a]},output:function(a){return c.abbreviatedDirections[t[a]]}}},{alias:"X",description:"degrees longitude",searchPattern:new RegExp("\\d{1,3}(?\x3d.*?\\s+.*?[E|W|"+n+"|"+p+"])","i"),substitution:{input:function(a){return f(a)},
output:function(a){return e(a)}}},{alias:"C",description:"minutes longitude",searchPattern:new RegExp("\\d{1,2}(?\x3d.*?[E|W|"+n+"|"+p+"])","i"),substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:"D",description:"seconds longitude",searchPattern:new RegExp("\\d{1,2}[\\.|\\"+q+"]?\\d*(?\x3d.*?[E|W|"+n+"|"+p+"])","i"),substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:c.abbreviatedDirections.east,description:"east/west indicator",
searchPattern:C,substitution:{input:function(a){return h[a]},output:function(a){return c.abbreviatedDirections[t[a]]}}}],defaultPattern:"Y\u00b0 A' B\""+c.abbreviatedDirections.north+", X\u00b0 C' D\""+c.abbreviatedDirections.east,viewModel:b}),new k({name:"xy",coordinateSegments:[{alias:"X",description:"longitude",searchPattern:w,substitution:{input:function(a){return f(a)},output:function(a){return e(a)}}},{alias:"Y",description:"latitude",searchPattern:w,substitution:{input:function(a){return f(a)},
output:function(a){return e(a)}}}],defaultPattern:"X\u00b0, Y\u00b0",viewModel:b}),new k({name:"mgrs",coordinateSegments:[{alias:"Z",description:"grid zone",searchPattern:/\d{1,2}\w|[abyz]/i},{alias:"S",description:"grid square",searchPattern:/\w{2}/},{alias:"X",description:"easting",searchPattern:/^\d{5}(?=.?\d{5}$)|^\d{4}(?=.?\d{4}$)|^\d{3}(?=.?\d{3}$)|^\d{2}(?=.?\d{2}$)|^\d(?=.?\d$)/},{alias:"Y",description:"northing",searchPattern:/^\d{1,5}/}],defaultPattern:"Z S X Y",viewModel:b}),new k({name:"usng",
coordinateSegments:[{alias:"Z",description:"grid zone",searchPattern:/\d{1,2}\w|[abyz]/i},{alias:"S",description:"grid square",searchPattern:/\w{2}/},{alias:"X",description:"easting",searchPattern:/^\d{5}(?=.?\d{5}$)|^\d{4}(?=.?\d{4}$)|^\d{3}(?=.?\d{3}$)|^\d{2}(?=.?\d{2}$)|^\d(?=.?\d$)/},{alias:"Y",description:"northing",searchPattern:/^\d{1,5}/}],defaultPattern:"Z S X Y",viewModel:b}),new k({name:"utm",coordinateSegments:[{alias:"Z",description:"zone number",searchPattern:/\d{1,2}|[abyz]/i},{alias:"B",
description:"latitude band",searchPattern:/^\D/},{alias:"X",description:"easting",searchPattern:/\d{1,7}(?=\s*\d{7}$)/},{alias:"Y",description:"northing",searchPattern:/\d{1,7}/}],defaultPattern:"ZB X Y",viewModel:b})]};g.isValidPoint=A;g.pointToCoordinate=v;g.project=function(b){var a=b.spatialReference,c=b.geometryServicePromise,d=b.location,e=b.scale;if(!a||d.spatialReference.wkid===a.wkid)return z.resolve({location:d,coordinate:v(d,e)});if((d.spatialReference.isWGS84||d.spatialReference.isWebMercator)&&
(a.isWGS84||a.isWebMercator))return z.resolve({location:J.project(d,a),coordinate:v(d,e)});if(r[0]===d&&r[1]===a.wkid)return r[2];r[0]=d;r[1]=a.wkid;b=c.then(function(b){return b.project({geometries:[d],outSpatialReference:a}).then(function(a){if(!A(a[0]))throw a[0];return{location:a[0],coordinate:v(a[0],e)}}).catch(function(a){throw new y("coordinate-conversion:projection-failed","Failed to project point",{projectionResult:a});})});return r[2]=b};g.toGeoCoordinateString=function(b){var a=b.formatName,
c=b.location;b=b.geometryServicePromise;var d=G({coordinates:[[c.x,c.y]],sr:c.spatialReference,conversionType:a},M[a]||{});return b.then(function(a){return a.toGeoCoordinateString(d).then(function(a){var b=a[0];if(!b)throw a;return b}).catch(function(a){throw new y("coordinate-conversion:to-geo-coordinate-string-failed","Failed to convert coordinate notation",{notationResult:a});})})};g.isSupportedNotation=function(b){return"dd"===b||"dms"===b||"ddm"===b||"mgrs"===b||"usng"===b||"utm"===b}});