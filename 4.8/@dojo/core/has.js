//>>built
(function(a){"object"===typeof module&&"object"===typeof module.exports?(a=a(require,exports),void 0!==a&&(module.exports=a)):"function"===typeof define&&define.amd&&define("require exports tslib @dojo/shim/global @dojo/shim/support/has @dojo/shim/support/has".split(" "),a)})(function(a,d){Object.defineProperty(d,"__esModule",{value:!0});var e=a("tslib"),b=a("@dojo/shim/global"),c=a("@dojo/shim/support/has");e.__exportStar(a("@dojo/shim/support/has"),d);d.default=c.default;c.add("object-assign","function"===
typeof b.default.Object.assign,!0);c.add("arraybuffer","undefined"!==typeof b.default.ArrayBuffer,!0);c.add("formdata","undefined"!==typeof b.default.FormData,!0);c.add("filereader","undefined"!==typeof b.default.FileReader,!0);c.add("xhr","undefined"!==typeof b.default.XMLHttpRequest,!0);c.add("xhr2",c.default("xhr")&&"responseType"in b.default.XMLHttpRequest.prototype,!0);c.add("blob",function(){if(!c.default("xhr2"))return!1;var a=new b.default.XMLHttpRequest;a.open("GET",b.default.location.protocol+
"//www.google.com",!0);a.responseType="blob";a.abort();return"blob"===a.responseType},!0);c.add("node-buffer","Buffer"in b.default&&"function"===typeof b.default.Buffer,!0);c.add("fetch","fetch"in b.default&&"function"===typeof b.default.fetch,!0);c.add("web-worker-xhr-upload",new Promise(function(a){try{if(void 0!==b.default.Worker&&b.default.URL&&b.default.URL.createObjectURL){var c=new Blob(["(function () {\nself.addEventListener('message', function () {\n\tvar xhr \x3d new XMLHttpRequest();\n\ttry {\n\t\txhr.upload;\n\t\tpostMessage('true');\n\t} catch (e) {\n\t\tpostMessage('false');\n\t}\n});\n\t\t})()"],
{type:"application/javascript"}),d=new Worker(URL.createObjectURL(c));d.addEventListener("message",function(b){a("true"===b.data)});d.postMessage({})}else a(!1)}catch(f){a(!1)}}),!0)});