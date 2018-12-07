// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../core/tsSupport/declareExtendsHelper ../../core/tsSupport/decorateHelper dojo/i18n!./nls/RasterSymbologyEditor ../../core/Accessor ../../core/colorUtils ../../core/lang ../../core/promiseUtils ../../core/accessorSupport/decorators ../../layers/support/RasterFunction".split(" "),function(B,C,w,p,x,y,t,z,A,q,l){return function(u){function c(){var a=null!==u&&u.apply(this,arguments)||this;a.renderParameters={};a.stretchTypes=[{name:"none",filterType:0},{name:"minMax",filterType:5},
{name:"percentClip",filterType:6},{name:"standardDeviation",filterType:3}];a._cachedKeyProperties={};a._defaultRenderParameters={minPercent:2,maxPercent:2,discreteNColors:256,uniqueValuesColorRampId:"uniqueValueColorRamp_default",uniqueValueColorRampType:"multipart",colorRamp:"blackToWhite_predefined",numberOfStandardDeviations:2,gamma:1.1,dra:!0,uniqueValueField:"Value",selectedBand:0};return a}w(c,u);e=c;c.prototype.getSymbologyTypes=function(){var a=[e.SymbologyTypes.none,e.SymbologyTypes.stretch],
b=this.layer,d=b.bandCount,k=b.hasRasterAttributeTable,b=b.pixelType;3<=d&&a.push(e.SymbologyTypes.rgb);k&&1===d&&a.push(e.SymbologyTypes.uniqueValue);1===d&&b&&"u8"===b.toLowerCase()&&a.push(e.SymbologyTypes.discrete);return a};c.prototype.isStretchColorRampApplicable=function(a){return a!==this.getStretchFilterType(e.StretchTypeNames.none)||this.layer.pixelType&&"u8"===this.layer.pixelType.toLowerCase()};c.prototype.getStretchFilterType=function(a){var b=0;this.stretchTypes.some(function(d){if(d.name===
a)return b=d.filterType,!0});return b};c.prototype.getDefaultRenderParameters=function(){var a={},b=this.layer;if(this.layer){var d=this._getRenderingRuleArguments("stretch")||{},k=this._getRenderingRuleArguments("colormap")||{},c={},r=this.layer.pixelType&&"u8"!==this.layer.pixelType.toLowerCase()?e.StretchTypeNames.minMax:e.StretchTypeNames.none,f,h;this.stretchTypes.some(function(a){if(a.name===r)return h=a.filterType,!0});a.symbologyType=this._getDefaultSymbologyType();a.selectedBand=this._defaultRenderParameters.selectedBand;
a.stretchType=d.stretchType||h;a.minPercent=d.MinPercent||this._defaultRenderParameters.minPercent;a.maxPercent=d.MaxPercent||this._defaultRenderParameters.maxPercent;a.numberOfStandardDeviations=d.NumberOfStandardDeviations||this._defaultRenderParameters.numberOfStandardDeviations;a.gamma=d.Gamma||this._defaultRenderParameters.gamma;a.dra=d.DRA||this._defaultRenderParameters.dra;a.colorRamp=k.colorRamp||this._defaultRenderParameters.colorRamp;b.bandIds&&(a.bandIds=b.bandIds);b.hasRasterAttributeTable&&
b.rasterAttributeTable&&b.rasterAttributeTable.features&&b.rasterAttributeTable.features.length&&b.rasterAttributeTable.features[0].attributes.Red&&b.rasterAttributeTable.features[0].attributes.Green&&b.rasterAttributeTable.features[0].attributes.Blue&&(c.id=this._defaultRenderParameters.uniqueValuesColorRampId,c.type=this._defaultRenderParameters.uniqueValueColorRampType,c.colorRamps=[],b.rasterAttributeTable.features.forEach(function(a){f=a.attributes;c.colorRamps.push({fromColor:[f.Red,f.Green,
f.Blue],toColor:[f.Red,f.Green,f.Blue]})}),a.uniqueValuesColorRamp=c,a.uniqueValuesField=b.rasterAttributeTable.features[0].attributes.Value?this._defaultRenderParameters.uniqueValueField:null);b.bandCount&&1===b.bandCount&&b.pixelType&&"u8"===b.pixelType.toLowerCase()&&(a.discreteNColors=this._defaultRenderParameters.discreteNColors,a.discreteColorRamp=this._defaultRenderParameters.colorRamp);return a}};c.prototype.getUniqueValueFields=function(){if(this.layer.hasRasterAttributeTable&&this.layer.rasterAttributeTable&&
this.layer.rasterAttributeTable.fields&&this.layer.rasterAttributeTable.fields.length)return this.layer.rasterAttributeTable.fields.filter(function(a){if("esriFieldTypeOID"!==a.type)return!0})};c.prototype.getBandData=function(){var a=this;if(this.layer){var b=this.layer.bandCount,d,k,c=this.layer.id;if(!this._cachedKeyProperties[c]&&1<b)return this.layer.fetchKeyProperties().then(function(b){a._cachedKeyProperties[c]=b;d=a._createBandLists();k=a._getBandCombinationPresets();return{presets:k,lists:d}});
d=this._createBandLists();k=this._getBandCombinationPresets();return A.resolve({lists:d,presets:k})}};c.prototype.getUniqueValueGridData=function(a,b){var d=this;if(this.layer.hasRasterAttributeTable&&this.layer.rasterAttributeTable&&a&&b){for(var k=this.layer.rasterAttributeTable.features,c=a.colorRamps?a.colorRamps.length:1,e=[],f=[],k=this._sortFeatures(k,b),h,m,v,n,l,g=b=0,g=0;g<c;g++)e[g]={},e[g].start=b,e[g].end=b+1/c,b=e[g].end;k.forEach(function(b,c){n=(c+.5)/k.length;e.forEach(function(k,
c){n>=k.start&&n<k.end&&(l=(n-k.start)/(k.end-k.start),1<e.length?(h=d._getColorRGB(a.colorRamps[c].fromColor),m=d._getColorRGB(a.colorRamps[c].toColor)):(h=d._getColorRGB(a.fromColor),m=d._getColorRGB(a.toColor)),v=d._interpolateLab(h,m,l),f.push({esriRasterSymbologyEditorUniqueValueSymbol:d._correctRgbLimits(v),esriRasterSymbologyEditorUniqueValueValue:b.value,pixelValues:b.pixelValues,id:c+1}))})});return f}};c.prototype.updateRendering=function(a){a.symbologyType&&(a.symbologyType===e.SymbologyTypes.none?
this._clearRendering():a.symbologyType===e.SymbologyTypes.stretch?this._applyStretchSingleBand(a):a.symbologyType===e.SymbologyTypes.rgb?this._applyStretchRgb(a):a.symbologyType!==e.SymbologyTypes.uniqueValue&&a.symbologyType!==e.SymbologyTypes.discrete||this._applyColormap(a))};c.prototype._sortFeatures=function(a,b){if(a&&b){a=z.clone(a);var d=[];a.sort(function(a,d){return"string"===typeof a.attributes[b]?a.attributes[b]<d.attributes[b]?-1:1:a.attributes[b]-d.attributes[b]});a.forEach(function(c,
e){0<e&&c.attributes[b]===a[e-1].attributes[b]?d[d.length-1].pixelValues.push(c.attributes.Value):d.push({value:c.attributes[b],pixelValues:[c.attributes.Value]})});return d}};c.prototype._getDefaultSymbologyType=function(){if(this.layer&&this.layer.renderingRule&&this.layer.renderingRule.functionName){var a=this.layer.renderingRule,b=a.functionName,a=a.functionArguments;return b.toLowerCase()===e.RenderingRuleTypeNames.extractband||b.toLowerCase()===e.RenderingRuleTypeNames.stretch&&this.layer.bandCount&&
1===this.layer.bandCount||b.toLowerCase()===e.RenderingRuleTypeNames.colormap&&a&&a.colorRamp&&this.layer.bandCount&&1===this.layer.bandCount?e.SymbologyTypes.stretch:3<=this.layer.bandCount&&b.toLowerCase()===e.RenderingRuleTypeNames.stretch?e.SymbologyTypes.rgb:e.SymbologyTypes.none}return e.SymbologyTypes.none};c.prototype._getRenderingRuleArguments=function(a){if(this.layer&&this.layer.renderingRule&&a){var b=this.layer.renderingRule;return b.functionName&&b.functionName.toLowerCase()===a?b.functionArguments:
b.functionArguments&&b.functionArguments.Raster&&b.functionArguments.Raster.functionName&&b.functionArguments.Raster.functionName===a?b.functionArguments.Raster.functionArguments:null}};c.prototype._getBandCombinationPresets=function(){var a=this._cachedKeyProperties[this.layer.id];if(a){var b;e.bandCombinationPresets.forEach(function(d){if(d.bandDefinitionKeyword===a.BandDefinitionKeyword)return b=d.presets,!0});if(b)return b}};c.prototype._validateProps=function(a){if(null===a.stretchType||void 0===
a.stretchType||6===a.stretchType&&(isNaN(a.minPercent)||isNaN(a.maxPercent))||3===a.stretchType&&isNaN(a.numberOfStandardDeviations))return!1;if(!a.noData||isNaN(a.noData))a.noData=0;this.renderParameters=a;return!0};c.prototype._clearRendering=function(){this.layer.bandIds=null;this.layer.noData=null;this.layer.renderingRule=null};c.prototype._applyStretchSingleBand=function(a){if(this._validateProps(a)){this.layer.noData=a.noData;this.layer.bandIds=null;var b=this._getStretchRasterFunctionArguments(a,
1);if(1<this.layer.bandCount){var d={BandIDs:[a.selectedBand]},c=new l;c.functionArguments=d;c.functionName="ExtractBand";b.Raster=c}d=new l;d.functionName="Stretch";d.functionArguments=b;a.colorRampName&&"none"!==a.colorRampName?(b=new l,b.functionName="Colormap",b.functionArguments={colorRamp:a.colorRampName,Raster:d},this.layer.renderingRule=b):this.layer.renderingRule=d}};c.prototype._applyStretchRgb=function(a){if(this._validateProps(a)){this.layer.noData=a.noData;this.layer.bandIds=a.bandIds;
a=this._getStretchRasterFunctionArguments(a,3);var b=new l;b.functionName="Stretch";b.functionArguments=a;this.layer.renderingRule=b}};c.prototype._getStretchRasterFunctionArguments=function(a,b){var d={DRA:a.dra,StretchType:a.stretchType,useGamma:!0};0!==a.stretchType&&(d.MinPercent=a.minPercent,d.MaxPercent=a.maxPercent,1===b?d.Gamma=[a.gamma]:3===b&&(d.Gamma=[a.gamma,a.gamma,a.gamma]),d.NumberOfStandardDeviations=a.numberOfStandardDeviations);return d};c.prototype._getDiscreteColormap=function(a,
b){var d=this;if(a&&b){for(var c=a.colorRamps?a.colorRamps.length:1,e=[],r=[],f=[],h,m,l,n,q,g=0,p=0,g=0;g<c;g++)e[g]={},e[g].start=p,e[g].end=p+1/c,p=e[g].end;for(g=0;g<b;g++)n=(g+.5)/b,e.forEach(function(b,c){n>=b.start&&n<b.end&&(q=(n-b.start)/(b.end-b.start),1<e.length?(h=d._getColorRGB(a.colorRamps[c].fromColor),m=d._getColorRGB(a.colorRamps[c].toColor)):(h=d._getColorRGB(a.fromColor),m=d._getColorRGB(a.toColor)),l=d._interpolateLab(h,m,q),f.push(l))});for(g=0;256>g;g++)c=f[g%b],r.push([g,c.r,
c.g,c.b]);return r}};c.prototype._getColorRGB=function(a){return{r:a[0],g:a[1],b:a[2]}};c.prototype._applyColormap=function(a){var b=new l;b.functionName="Colormap";b.functionArguments={};a.symbologyType===e.SymbologyTypes.uniqueValue?b.functionArguments.Colormap=this._getUniqueValuesColormap(a.uniqueValuesSymbolData):a.symbologyType===e.SymbologyTypes.discrete&&(b.functionArguments.Colormap=this._getDiscreteColormap(a.discreteColorRamp,a.discreteNColors));b.variableName="Raster";this.layer.noData=
a.noData;this.layer.renderingRule=b};c.prototype._getUniqueValuesColormap=function(a){var b=[];a.forEach(function(a){a.pixelValues.forEach(function(d){b.push([d,a.esriRasterSymbologyEditorUniqueValueSymbol.r,a.esriRasterSymbologyEditorUniqueValueSymbol.g,a.esriRasterSymbologyEditorUniqueValueSymbol.b])})});return b};c.prototype._createBandLists=function(){var a=this;if(this.layer){var b=this.layer.id,d=this.layer.bandCount,c=this._cachedKeyProperties[b],e=this.layer.bandIds||[0,1,2],l=[],f=["red",
"green","blue"],h;c&&c.BandProperties&&0<c.BandProperties.length&&(h=c.BandProperties);e.forEach(function(b,c){h&&h[0].hasOwnProperty("BandName")?l.push(a._getBandIdList(d,h,a._getBandIndex(h,f[c]))):l.push(a._getBandIdList(d,h,b))});this._cachedKeyProperties[b]=c;return l}};c.prototype._getBandIndex=function(a,b){if(!this.layer||!a)return 0;var c;for(c=0;c<a.length;c++)if(a[c]&&a[c].hasOwnProperty("BandName")&&a[c].BandName.toLowerCase()===b)return c;return 0};c.prototype._getBandIdList=function(a,
b,c){if(this.layer){var d=[],e={},l=!1;b&&a===b.length&&(l=!0);var f;for(f=0;f<a;f++){var h=f.toString(),m=f.toString(),h=l&&b[f]&&b[f].BandName?b[f].BandName:x.bandPrefix+"_"+(f+1),e={};c===f&&(e.selected=!0);e.name=h;e.index=m;d.push(e)}return d}};c.prototype._interpolateLab=function(a,b,c){a=t.toLAB(a);b=t.toLAB(b);return t.toRGB({l:a.l*(1-c)+c*b.l,a:a.a*(1-c)+c*b.a,b:a.b*(1-c)+c*b.b})};c.prototype._correctRgbLimits=function(a){var b=[a.r,a.g,a.b];b.forEach(function(a,c){0>b[c]?b[c]=0:255<b[c]&&
(b[c]=255);b[c]=Math.floor(b[c])});return{r:b[0],g:b[1],b:b[2]}};var e;c.bandCombinationPresets=[{bandDefinitionKeyword:"LandsatTM",presets:[{NaturalColor:[3,2,1]},{ColorInfrared:[4,3,2]},{Landuse:[4,3,1]},{LandWater:[7,5,4]},{Vegetation:[5,4,3]}]},{bandDefinitionKeyword:"Landsat 8",presets:[{NaturalColor:[4,3,2]},{ColorInfrared:[5,4,3]},{Landuse:[5,4,2]},{LandWater:[7,6,5]},{Vegetation:[6,5,4]},{ShallowBathymetric:[3,2,1]}]},{bandDefinitionKeyword:"IKONOS",presets:[{NaturalColor:[3,2,1]},{ColorInfrared:[4,
3,2]},{Landuse:[4,3,1]}]},{bandDefinitionKeyword:"QuickBird",presets:[{NaturalColor:[3,2,1]},{ColorInfrared:[4,3,2]},{Landuse:[4,3,1]}]},{bandDefinitionKeyword:"Pleiades",presets:[{NaturalColor:[1,2,3]},{ColorInfrared:[4,1,2]},{Landuse:[4,1,3]}]},{bandDefinitionKeyword:"GeoEye",presets:[{NaturalColor:[3,2,1]},{ColorInfrared:[4,3,2]},{Landuse:[4,3,1]}]},{bandDefinitionKeyword:"OrbView",presets:[{NaturalColor:[3,2,1]},{ColorInfrared:[4,3,2]},{Landuse:[4,3,1]}]},{bandDefinitionKeyword:"LandsatMSS",presets:[{ColorInfrared:[4,
3,2]}]},{bandDefinitionKeyword:"SPOT6",presets:[{NaturalColor:[1,2,3]},{ColorInfrared:[4,1,2]},{Landuse:[4,1,3]}]},{bandDefinitionKeyword:"FORMOSTAT",presets:[{NaturalColor:[1,2,3]},{ColorInfrared:[4,1,2]},{Landuse:[4,1,3]}]},{bandDefinitionKeyword:"SPOT1",presets:[{ColorInfrared:[1,2,3]},{Vegetation:[2,3,4]}]},{bandDefinitionKeyword:"WorldView",presets:[{NaturalColor:[5,3,2]},{ColorInfrared:[7,5,3]},{Landuse:[7,5,2]},{LandWater:[8,7,6]},{Vegetation:[7,6,5]},{ShallowBathymetric:[3,2,1]}]},{bandDefinitionKeyword:"RapidEye",
presets:[{NaturalColor:[3,2,1]},{ColorInfrared:[5,3,2]},{Landuse:[5,3,1]},{Vegetation:[5,4,3]}]},{bandDefinitionKeyword:"DMCii",presets:[{ColorInfrared:[1,2,3]}]}];c.StretchTypeNames={none:"none",minMax:"minMax",percentClip:"percentClip",standardDeviation:"standardDeviation"};c.RenderingRuleTypeNames={extractband:"extractband",colormap:"colormap",stretch:"stretch"};c.SymbologyTypes={none:"none",stretch:"stretch",rgb:"rgb",uniqueValue:"unique-value",discrete:"discrete"};p([q.property()],c.prototype,
"layer",void 0);p([q.property()],c.prototype,"renderParameters",void 0);return c=e=p([q.subclass("esri.widgets.RasterSymbologyEditor.RasterSymbologyEditorViewModel")],c)}(q.declared(y))});