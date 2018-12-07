// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper dojo/i18n!./nls/Search ../../core/accessorSupport/decorators ../Widget ./SearchViewModel ../support/widget".split(" "),function(r,t,n,h,l,k,p,q,c){return function(m){function b(a){a=m.call(this)||this;a.showMoreResultsOpen=!1;a.viewModel=null;return a}n(b,m);b.prototype.render=function(){var a=this,b,d=this.get("viewModel.selectedResult"),e=this.get("viewModel.results"),d=d&&d.name||"",f=1<this._countResults(e),
g=f&&e.map(function(b){return a._moreResultsList(b)}),e=f?c.tsx("div",{key:"esri-search-renderer__more-results-button",class:"esri-search-result-renderer__more-results-item"},c.tsx("a",{class:"esri-widget__anchor",href:"#",bind:this,onclick:this._showMoreResultsClick,onkeydown:this._showMoreResultsClick},this.showMoreResultsOpen?l.hideMoreResults:l.showMoreResults)):null,f=f?c.tsx("div",{key:"esri-search-renderer__more-results-container",class:"esri-search-result-renderer__more-results-list"},g):
null,g=(b={},b["esri-search-result-renderer__more-results--show-more-results"]=this.showMoreResultsOpen,b);return c.tsx("div",{class:"esri-search-result-renderer esri-widget"},c.tsx("div",{key:"esri-search-renderer__container",class:this.classes("esri-search-result-renderer__more-results",g)},c.tsx("div",{key:"esri-search-renderer__result-name",class:"esri-search-result-renderer__more-results-item"},d),c.tsx("div",{key:"esri-search-renderer__more-results"},e,f)))};b.prototype._showMoreResultsClick=
function(a){a.preventDefault();this.showMoreResultsOpen=!this.showMoreResultsOpen;(a=this.get("viewModel.view.popup"))&&a.reposition()};b.prototype._selectResultClick=function(a){a.preventDefault();a=a.currentTarget["data-result"];this.viewModel&&this.viewModel.select(a)};b.prototype._moreResultsList=function(a){var b=this,d=a.results,e=d.length,f=!!e,g=this.get("viewModel.selectedResult"),e=1===e&&d[0]===g,g=this._getSourceName(a.source,a.sourceIndex),g=1<this.get("viewModel.results").length&&!e?
c.tsx("div",{key:"esri-search-result-renderer__header-"+a.sourceIndex,class:"esri-search-result-renderer__more-results-list-header"},g):null,d=f&&d.map(function(a,c){return b._moreResultsListItem(a,c)}),d=f&&!e?c.tsx("ul",{key:"esri-search-result-renderer__list-"+a.sourceIndex},d):null;return f?c.tsx("div",{key:"esri-search-result-renderer__results-"+a.sourceIndex},g,d):null};b.prototype._moreResultsListItem=function(a,b){var d=this.get("viewModel.selectedResult");return a!==d?c.tsx("li",{key:"esri-search-result-renderer__list-item-"+
b},c.tsx("a",{class:"esri-widget__anchor",href:"#",tabindex:"0",bind:this,"data-result":a,onclick:this._selectResultClick,onkeydown:this._selectResultClick},a.name)):null};b.prototype._getSourceName=function(a,b){return b===q.ALL_INDEX?l.all:a.name};b.prototype._countResults=function(a){return a?a.reduce(function(a,b){return a+b.results.length},0):0};h([c.renderable(),k.property()],b.prototype,"showMoreResultsOpen",void 0);h([k.property(),c.renderable(["viewModel.results","viewModel.selectedResult"])],
b.prototype,"viewModel",void 0);h([c.accessibleHandler()],b.prototype,"_showMoreResultsClick",null);h([c.accessibleHandler()],b.prototype,"_selectResultClick",null);return b=h([k.subclass("esri.widgets.Search.SearchResultRenderer")],b)}(k.declared(p))});