// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define(["require","exports"],function(e,f){return function(){function a(c,b,a){this._clientType=c;this._loader=b;this._activeRequests=null;a&&a.trackRequests&&(this._activeRequests=new Map)}a.prototype.request=function(c,b){var a=this;b=this._loader.request(c,b,this._clientType);if(this._activeRequests){this._activeRequests.set(c,b);var d=function(){a._activeRequests.delete(c)};b.then(d,d)}return b};a.prototype.cancelRequest=function(a){this._loader.cancel(a)};a.prototype.cancelAll=function(){var a=
this;this._activeRequests&&(this._activeRequests.forEach(function(b){a._loader.cancel(b)}),this._activeRequests.clear())};a.prototype.hasPendingDownloads=function(){return this._loader.hasPendingDownloads()};return a}()});