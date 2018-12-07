// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../core/tsSupport/assignHelper ../core/tsSupport/declareExtendsHelper ../core/tsSupport/decorateHelper ../core/JSONSupport ../core/kebabDictionary ../core/Warning ../core/accessorSupport/decorators ./support/scaleUtils".split(" "),function(v,w,q,r,f,t,g,l,d,m){function n(d,a){return new l("height-unit:unsupported","Height unit of value '"+d+"' is not supported",a)}function u(d,a){return new l("height-model:unsupported","Height model of value '"+d+"' is not supported",a)}var p=
g({orthometric:"gravity-related-height",gravity_related_height:"gravity-related-height",ellipsoidal:"ellipsoidal"},{ignoreUnknown:!0}),k=g({meter:"meters",foot:"feet","us-foot":"us-feet","clarke-foot":"clarke-feet","clarke-yard":"clarke-yards","clarke-link":"clarke-links","sears-yard":"sears-yards","sears-foot":"sears-feet","sears-chain":"sears-chains","benoit-1895-b-chain":"benoit-1895-b-chains","indian-yard":"indian-yards","indian-1937-yard":"indian-1937-yards","gold-coast-foot":"gold-coast-feet",
"sears-1922-truncated-chain":"sears-1922-truncated-chains","50-kilometers":"50-kilometers","150-kilometers":"150-kilometers"},{ignoreUnknown:!0});return function(g){function a(e){e=g.call(this)||this;e.heightModel="gravity-related-height";e.heightUnit="meters";e.vertCRS=null;return e}r(a,g);h=a;a.prototype.writeHeightModel=function(e,a,c){return p.write(e,a,c)};a.prototype.readHeightModel=function(e,a,c){if(a=p.read(e))return a;c&&c.messages&&c.messages.push(u(e,{context:c}));return null};a.prototype.readHeightUnit=
function(e,a,c){if(a=k.read(e))return a;c&&c.messages&&c.messages.push(n(e,{context:c}));return null};a.prototype.readHeightUnitService=function(a,b,c){if(b=m.unitFromRESTJSON(a)||k.read(a))return b;c&&c.messages&&c.messages.push(n(a,{context:c}));return null};a.prototype.readVertCRS=function(a,b){return b.vertCRS||b.ellipsoid||b.geoid};a.prototype.clone=function(){return new h({heightModel:this.heightModel,heightUnit:this.heightUnit,vertCRS:this.vertCRS})};a.prototype.equals=function(a){return a?
this===a?!0:this.heightModel===a.heightModel&&this.heightUnit===a.heightUnit&&this.vertCRS===a.vertCRS:!1};a.deriveUnitFromSR=function(a,b){b=m.getVerticalUnitStringForSR(b);return new h({heightModel:a.heightModel,heightUnit:b,vertCRS:a.vertCRS})};a.prototype.write=function(a,b){b=q({origin:"web-scene"},b);return this.inherited(arguments,[a,b])};a.fromJSON=function(a){if(!a)return null;var b=new h;b.read(a,{origin:"web-scene"});return b};var h;f([d.property({type:String,constructOnly:!0})],a.prototype,
"heightModel",void 0);f([d.writer("web-scene","heightModel")],a.prototype,"writeHeightModel",null);f([d.reader(["web-scene","service"],"heightModel")],a.prototype,"readHeightModel",null);f([d.property({type:String,constructOnly:!0,json:{origins:{"web-scene":{write:k.write}}}})],a.prototype,"heightUnit",void 0);f([d.reader("web-scene","heightUnit")],a.prototype,"readHeightUnit",null);f([d.reader("service","heightUnit")],a.prototype,"readHeightUnitService",null);f([d.property({type:String,constructOnly:!0,
json:{origins:{"web-scene":{write:!0}}}})],a.prototype,"vertCRS",void 0);f([d.reader("service","vertCRS",["vertCRS","ellipsoid","geoid"])],a.prototype,"readVertCRS",null);return a=h=f([d.subclass("esri.geometry.HeightModelInfo")],a)}(d.declared(t))});