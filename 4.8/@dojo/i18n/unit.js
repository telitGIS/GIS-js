//>>built
(function(a){"object"===typeof module&&"object"===typeof module.exports?(a=a(require,exports),void 0!==a&&(module.exports=a)):"function"===typeof define&&define.amd&&define(["require","exports","globalize","globalize/dist/globalize/unit","./util/globalize"],a)})(function(a,b){Object.defineProperty(b,"__esModule",{value:!0});a("globalize");a("globalize/dist/globalize/unit");var d=a("./util/globalize");b.formatUnit=function(a,b,c,e){return d.globalizeDelegator("formatUnit",{locale:e,optionsOrLocale:c,
unit:b,value:a})};b.getUnitFormatter=function(a,b,c){return d.globalizeDelegator("unitFormatter",{locale:c,optionsOrLocale:b,unit:a})}});