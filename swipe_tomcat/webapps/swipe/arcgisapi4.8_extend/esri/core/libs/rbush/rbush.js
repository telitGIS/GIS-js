// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["../quickselect/quickselect"],function(C){function t(a,b){if(!(this instanceof t))return new t(a,b);this._maxEntries=Math.max(4,a||9);this._minEntries=Math.max(2,Math.ceil(.4*this._maxEntries));b&&("function"===typeof b?this.toBBox=b:this._initFormat(b));this.clear()}function l(a,b){q(a,0,a.children.length,b,a)}function q(a,b,c,e,d){d||(d=p(null));d.minX=Infinity;d.minY=Infinity;d.maxX=-Infinity;d.maxY=-Infinity;for(var f;b<c;b++)f=a.children[b],r(d,a.leaf?e(f):f);return d}function r(a,b){a.minX=
Math.min(a.minX,b.minX);a.minY=Math.min(a.minY,b.minY);a.maxX=Math.max(a.maxX,b.maxX);a.maxY=Math.max(a.maxY,b.maxY);return a}function z(a,b){return a.minX-b.minX}function A(a,b){return a.minY-b.minY}function w(a){return(a.maxX-a.minX)*(a.maxY-a.minY)}function u(a){return a.maxX-a.minX+(a.maxY-a.minY)}function x(a,b){return a.minX<=b.minX&&a.minY<=b.minY&&b.maxX<=a.maxX&&b.maxY<=a.maxY}function v(a,b){return b.minX<=a.maxX&&b.minY<=a.maxY&&b.maxX>=a.minX&&b.maxY>=a.minY}function p(a){return{children:a,
height:1,leaf:!0,minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity}}function B(a,b,c,e,d){for(var f=[b,c],g;f.length;)c=f.pop(),b=f.pop(),c-b<=e||(g=b+Math.ceil((c-b)/e/2)*e,C(a,g,b,c,d),f.push(b,g,g,c))}t.prototype={all:function(){return this._all(this.data,[])},search:function(a){var b=this.data,c=[],e=this.toBBox;if(!v(a,b))return c;for(var d=[],f,g,h,k;b;){f=0;for(g=b.children.length;f<g;f++)h=b.children[f],k=b.leaf?e(h):h,v(a,k)&&(b.leaf?c.push(h):x(a,k)?this._all(h,c):d.push(h));b=d.pop()}return c},
collides:function(a){var b=this.data,c=this.toBBox;if(!v(a,b))return!1;for(var e=[],d,f,g,h;b;){d=0;for(f=b.children.length;d<f;d++)if(g=b.children[d],h=b.leaf?c(g):g,v(a,h)){if(b.leaf||x(a,h))return!0;e.push(g)}b=e.pop()}return!1},load:function(a){if(!a||!a.length)return this;if(a.length<this._minEntries){for(var b=0,c=a.length;b<c;b++)this.insert(a[b]);return this}a=this._build(a.slice(),0,a.length-1,0);this.data.children.length?this.data.height===a.height?this._splitRoot(this.data,a):(this.data.height<
a.height&&(b=this.data,this.data=a,a=b),this._insert(a,this.data.height-a.height-1,!0)):this.data=a;return this},insert:function(a){a&&this._insert(a,this.data.height-1);return this},clear:function(){this.data=p([]);return this},remove:function(a,b){if(!a)return this;for(var c=this.data,e=this.toBBox(a),d=[],f=[],g,h,k,m;c||d.length;){c||(c=d.pop(),h=d[d.length-1],g=f.pop(),m=!0);if(c.leaf){a:{k=a;var y=c.children,n=b;if(n){for(var l=0;l<y.length;l++)if(n(k,y[l])){k=l;break a}k=-1}else k=y.indexOf(k)}if(-1!==
k){c.children.splice(k,1);d.push(c);this._condense(d);break}}m||c.leaf||!x(c,e)?h?(g++,c=h.children[g],m=!1):c=null:(d.push(c),f.push(g),g=0,h=c,c=c.children[0])}return this},toBBox:function(a){return a},compareMinX:z,compareMinY:A,toJSON:function(){return this.data},fromJSON:function(a){this.data=a;return this},_all:function(a,b){for(var c=[];a;)a.leaf?b.push.apply(b,a.children):c.push.apply(c,a.children),a=c.pop();return b},_build:function(a,b,c,e){var d=c-b+1,f=this._maxEntries,g;if(d<=f)return g=
p(a.slice(b,c+1)),l(g,this.toBBox),g;e||(e=Math.ceil(Math.log(d)/Math.log(f)),f=Math.ceil(d/Math.pow(f,e-1)));g=p([]);g.leaf=!1;g.height=e;var d=Math.ceil(d/f),f=d*Math.ceil(Math.sqrt(f)),h,k,m;for(B(a,b,c,f,this.compareMinX);b<=c;b+=f)for(k=Math.min(b+f-1,c),B(a,b,k,d,this.compareMinY),h=b;h<=k;h+=d)m=Math.min(h+d-1,k),g.children.push(this._build(a,h,m,e-1));l(g,this.toBBox);return g},_chooseSubtree:function(a,b,c,e){for(var d,f,g,h,k,m,l,n;;){e.push(b);if(b.leaf||e.length-1===c)break;l=n=Infinity;
d=0;for(f=b.children.length;d<f;d++)g=b.children[d],k=w(g),m=(Math.max(g.maxX,a.maxX)-Math.min(g.minX,a.minX))*(Math.max(g.maxY,a.maxY)-Math.min(g.minY,a.minY))-k,m<n?(n=m,l=k<l?k:l,h=g):m===n&&k<l&&(l=k,h=g);b=h||b.children[0]}return b},_insert:function(a,b,c){var e=this.toBBox;c=c?a:e(a);var e=[],d=this._chooseSubtree(c,this.data,b,e);d.children.push(a);for(r(d,c);0<=b;)if(e[b].children.length>this._maxEntries)this._split(e,b),b--;else break;this._adjustParentBBoxes(c,e,b)},_split:function(a,b){var c=
a[b],e=c.children.length,d=this._minEntries;this._chooseSplitAxis(c,d,e);e=this._chooseSplitIndex(c,d,e);e=p(c.children.splice(e,c.children.length-e));e.height=c.height;e.leaf=c.leaf;l(c,this.toBBox);l(e,this.toBBox);b?a[b-1].children.push(e):this._splitRoot(c,e)},_splitRoot:function(a,b){this.data=p([a,b]);this.data.height=a.height+1;this.data.leaf=!1;l(this.data,this.toBBox)},_chooseSplitIndex:function(a,b,c){var e,d,f,g,h,k,l;h=k=Infinity;for(e=b;e<=c-b;e++)d=q(a,0,e,this.toBBox),f=q(a,e,c,this.toBBox),
g=Math.max(0,Math.min(d.maxX,f.maxX)-Math.max(d.minX,f.minX))*Math.max(0,Math.min(d.maxY,f.maxY)-Math.max(d.minY,f.minY)),d=w(d)+w(f),g<h?(h=g,l=e,k=d<k?d:k):g===h&&d<k&&(k=d,l=e);return l},_chooseSplitAxis:function(a,b,c){var e=a.leaf?this.compareMinX:z,d=a.leaf?this.compareMinY:A,f=this._allDistMargin(a,b,c,e);b=this._allDistMargin(a,b,c,d);f<b&&a.children.sort(e)},_allDistMargin:function(a,b,c,e){a.children.sort(e);e=this.toBBox;var d=q(a,0,b,e),f=q(a,c-b,c,e),g=u(d)+u(f),h,k;for(h=b;h<c-b;h++)k=
a.children[h],r(d,a.leaf?e(k):k),g+=u(d);for(h=c-b-1;h>=b;h--)k=a.children[h],r(f,a.leaf?e(k):k),g+=u(f);return g},_adjustParentBBoxes:function(a,b,c){for(;0<=c;c--)r(b[c],a)},_condense:function(a){for(var b=a.length-1,c;0<=b;b--)0===a[b].children.length?0<b?(c=a[b-1].children,c.splice(c.indexOf(a[b]),1)):this.clear():l(a[b],this.toBBox)},_initFormat:function(a){var b=["return a"," - b",";"];this.compareMinX=new Function("a","b",b.join(a[0]));this.compareMinY=new Function("a","b",b.join(a[1]));this.toBBox=
new Function("a","return {minX: a"+a[0]+", minY: a"+a[1]+", maxX: a"+a[2]+", maxY: a"+a[3]+"};")}};return t});