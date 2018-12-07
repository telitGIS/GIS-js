// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../../../core/screenUtils ./color ./enums ./Utils ../../../3d/layers/support/FastSymbolUpdates".split(" "),function(w,d,p,t,e,k,u){function r(a){return k.isNumber(a.minDataValue)&&k.isNumber(a.maxDataValue)&&null!=a.minSize&&null!=a.maxSize?e.WGLVVFlag.SIZE_MINMAX_VALUE:(a.expression&&"view.scale"===a.expression||a.valueExpression&&"$view.scale"===a.valueExpression)&&Array.isArray(a.stops)?e.WGLVVFlag.SIZE_SCALE_STOPS:(null!=a.field||a.expression&&"view.scale"!==a.expression||
a.valueExpression&&"$view.scale"!==a.valueExpression)&&Array.isArray(a.stops)?e.WGLVVFlag.SIZE_FIELD_STOPS:(null!=a.field||a.expression&&"view.scale"!==a.expression||a.valueExpression&&"$view.scale"!==a.valueExpression)&&null!=a.valueUnit?e.WGLVVFlag.SIZE_UNIT_VALUE:e.WGLVVFlag.NONE}function m(a){return{value:a.value,size:p.toPt(a.size)}}function n(a){return a.map(function(a){return m(a)})}function q(a){return"string"===typeof a||"number"===typeof a?p.toPt(a):{type:"size",expression:a.expression,
stops:n(a.stops)}}function v(a){var c={values:[0,0,0,0,0,0,0,0],opacities:[0,0,0,0,0,0,0,0]};if(k.isString(a.field))if(a.stops){if(8<a.stops.length)return null;a=a.stops;for(var b=0;8>b;++b){var e=a[Math.min(b,a.length-1)];c.values[b]=e.value;c.opacities[b]=e.opacity}}else if(a.opacityValues){if(!k.isDefined(a.minDataValue)||!k.isDefined(a.maxDataValue)||2!==a.opacityValues.length)return null;c.values[0]=a.minDataValue;c.opacities[0]=a.opacityValues[0];c.values[1]=a.maxDataValue;c.opacities[1]=a.opacityValues[1];
for(b=2;8>b;++b)c.values[b]=a.maxDataValue,c.opacities[b]=a.opacityValues[1]}else return null;else if(a.stops&&0<=a.stops.length||a.opacityValues&&0<=a.opacityValues.length)for(a=a.stops&&0<=a.stops.length?a.stops[0].opacity:a.opacityValues[0],b=0;8>b;b++)c.values[b]=Infinity,c.opacities[b]=a;else return null;return c}Object.defineProperty(d,"__esModule",{value:!0});d.getTypeOfSizeVisualVariable=r;d.getVisualVariableSizeValueRepresentationRatio=function(a,c){if(!a||!c)return a;switch(c){case "radius":case "distance":return 2*
a;case "area":return Math.sqrt(a)}return a};d.stopToSizeStop=m;d.normalizeSizeStops=n;d.normalizeSizeElement=q;d.getVisualVariablesFields=function(a){var c=a&&0<a.length?{}:null;c&&a.forEach(function(a){var b=a.type;a.field&&(c[b]=a.field)});return c};d.convertVisualVariables=function(a){var c=a&&0<a.length?{}:null,b=c?{}:null;if(!c)return{vvFields:c,vvRanges:b};for(var d=0;d<a.length;d++){var f=a[d],h=f.type;f.field&&(c[h]=f.field);if("size"===h){b.size||(b.size={});var g=f;switch(r(g)){case e.WGLVVFlag.SIZE_MINMAX_VALUE:b.size.minMaxValue=
{minDataValue:g.minDataValue,maxDataValue:g.maxDataValue,minSize:q(g.minSize),maxSize:q(g.maxSize)};break;case e.WGLVVFlag.SIZE_SCALE_STOPS:b.size.scaleStops={stops:n(g.stops)};break;case e.WGLVVFlag.SIZE_FIELD_STOPS:for(var f=[],h=[],g=n(g.stops),k=g.length,l=0;6>l;l++){var m=g[Math.min(l,k-1)];f.push(m.value);h.push(p.pt2px(m.size))}b.size.fieldStops={values:f,sizes:h};break;case e.WGLVVFlag.SIZE_UNIT_VALUE:b.size.unitValue={unit:g.valueUnit,valueRepresentation:g.valueRepresentation}}}else if("color"===
h)for(f=u.convertVisualVariables([f],{modelSize:null,symbolSize:null,unitInMeters:1,transformation:null}),b.color=f.color,l=0;32>l;l+=4)t.premultiplyAlpha(b.color.colors,l,!0);else"opacity"===h?b.opacity=v(f):"rotation"===h&&(b.rotation={type:f.rotationType})}return{vvFields:c,vvRanges:b}}});