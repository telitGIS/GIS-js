//>>built
define(["../_base"],function(a){var b={className:"comment",begin:"\x3c!--",end:"--\x3e"},c={className:"attribute",begin:" [a-zA-Z-]+\\s*\x3d\\s*",end:"^",contains:["value"]},d={className:"value",begin:'"',end:'"'};a.languages.xml={defaultMode:{contains:["pi","comment","cdata","tag"]},case_insensitive:!0,modes:[{className:"pi",begin:"\x3c\\?",end:"\\?\x3e",relevance:10},b,{className:"cdata",begin:"\x3c\\!\\[CDATA\\[",end:"\\]\\]\x3e"},{className:"tag",begin:"\x3c/?",end:"\x3e",contains:["title","tag_internal"],
relevance:1.5},{className:"title",begin:"[A-Za-z:_][A-Za-z0-9\\._:-]+",end:"^",relevance:0},{className:"tag_internal",begin:"^",endsWithParent:!0,contains:["attribute"],relevance:0,illegal:"[\\+\\.]"},c,d],XML_COMMENT:b,XML_ATTR:c,XML_VALUE:d};return a.languages.xml});