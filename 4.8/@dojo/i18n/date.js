//>>built
(function(a){"object"===typeof module&&"object"===typeof module.exports?(a=a(require,exports),void 0!==a&&(module.exports=a)):"function"===typeof define&&define.amd&&define("require exports globalize globalize/dist/globalize/date globalize/dist/globalize/relative-time ./util/globalize".split(" "),a)})(function(a,b){Object.defineProperty(b,"__esModule",{value:!0});a("globalize");a("globalize/dist/globalize/date");a("globalize/dist/globalize/relative-time");var d=a("./util/globalize");b.formatDate=
function(e,c,a){return d.globalizeDelegator("formatDate",{locale:a,optionsOrLocale:c,value:e})};b.formatRelativeTime=function(a,c,b,g){return d.globalizeDelegator("formatRelativeTime",{locale:g,optionsOrLocale:b,unit:c,value:a})};b.getDateFormatter=function(a,c){return d.globalizeDelegator("dateFormatter",{locale:c,optionsOrLocale:a})};b.getDateParser=function(a,c){return d.globalizeDelegator("dateParser",{locale:c,optionsOrLocale:a})};b.getRelativeTimeFormatter=function(a,c,b){return d.globalizeDelegator("relativeTimeFormatter",
{locale:b,optionsOrLocale:c,unit:a})};b.parseDate=function(a,b,f){return d.globalizeDelegator("parseDate",{locale:f,optionsOrLocale:b,value:a})}});