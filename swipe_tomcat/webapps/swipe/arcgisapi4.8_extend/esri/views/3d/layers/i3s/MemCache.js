// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports"],function(d,e){return function(){function b(a){void 0===a&&(a=10);this.maxSize=a;this._db=new Map;this._miss=this._hit=this._age=this._size=0}b.prototype.put=function(a,b,c){!c||0>c?console.warn("Refusing to cache entry with invalid size "+c):(this._db.has(a)?(a=this._db.get(a),this._size+=c-a.sizeMB,a.entry=b,a.lastUsed=this._age,a.sizeMB=c):(this._db.set(a,{entry:b,sizeMB:c,lastUsed:this._age}),this._size+=c),++this._age,this._size>this.maxSize&&this._removeEntries())};
b.prototype.get=function(a){if(this._db.has(a))return a=this._db.get(a),a.lastUsed=this._age,++this._age,++this._hit,a.entry;++this._miss;return null};b.prototype.clear=function(){this._db.clear();this._miss=this._hit=this._age=this._size=0};b.prototype.getSize=function(){return this._size};b.prototype.getHitRate=function(){return this._hit/(this._hit+this._miss)};b.prototype._removeEntries=function(){var a=[];this._db.forEach(function(b,c){a.push([b.lastUsed,c])});a.sort(function(a,b){return a[0]-
b[0]});for(var b=0;b<a.length;b++){var c=a[b];this._size-=this._db.get(c[1]).sizeMB;this._db.delete(c[1]);if(this._size<.9*this.maxSize)break}};return b}()});