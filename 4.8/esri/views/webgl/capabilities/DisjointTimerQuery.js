// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports","./isWebGL2Context"],function(f,c,d){Object.defineProperty(c,"__esModule",{value:!0});c.load=function(b,c){if(c.disjointTimerQuery)return null;var a=b.getExtension("EXT_disjoint_timer_query")||b.getExtension("EXT_disjoint_timer_query_webgl2");return a?d.default(b)?{createQuery:function(){return b.createQuery()},resultAvailable:function(a){return b.getQueryParameter(a,b.QUERY_RESULT_AVAILABLE)},getResult:function(a){return b.getQueryParameter(a,b.QUERY_RESULT)},disjoint:function(){return b.getParameter(a.GPU_DISJOINT_EXT)},
beginTimeElapsed:function(e){return b.beginQuery(a.TIME_ELAPSED_EXT,e)},endTimeElapsed:function(){return b.endQuery(a.TIME_ELAPSED_EXT)},createTimestamp:function(b){return a.queryCounterEXT(b,a.TIMESTAMP_EXT)},timestampBits:function(){return b.getQuery(a.TIMESTAMP_EXT,a.QUERY_COUNTER_BITS_EXT)}}:{createQuery:function(){return a.createQueryEXT()},resultAvailable:function(b){return a.getQueryObjectEXT(b,a.QUERY_RESULT_AVAILABLE_EXT)},getResult:function(b){return a.getQueryObjectEXT(b,a.QUERY_RESULT_EXT)},
disjoint:function(){return b.getParameter(a.GPU_DISJOINT_EXT)},beginTimeElapsed:function(b){return a.beginQueryEXT(a.TIME_ELAPSED_EXT,b)},endTimeElapsed:function(){return a.endQueryEXT(a.TIME_ELAPSED_EXT)},createTimestamp:function(b){return a.queryCounterEXT(b,a.TIMESTAMP_EXT)},timestampBits:function(){return a.getQueryEXT(a.TIMESTAMP_EXT,a.QUERY_COUNTER_BITS_EXT)}}:null}});