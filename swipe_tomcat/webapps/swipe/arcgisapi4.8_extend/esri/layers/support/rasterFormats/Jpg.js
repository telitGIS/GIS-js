// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define([],function(){return function(){function H(){}function N(b,d){for(var r=0,k=[],a,y,m=16;0<m&&!b[m-1];)m--;k.push({children:[],index:0});var c=k[0],f;for(a=0;a<m;a++){for(y=0;y<b[a];y++){c=k.pop();for(c.children[c.index]=d[r];0<c.index;)c=k.pop();c.index++;for(k.push(c);k.length<=a;)k.push(f={children:[],index:0}),c.children[c.index]=f.children,c=f;r++}a+1<m&&(k.push(f={children:[],index:0}),c.children[c.index]=f.children,c=f)}return k[0].children}function O(b,d,r,k,a,y,m,c,f){function l(){if(0<
z)return z--,A>>z&1;A=b[d++];if(255===A){var a=b[d++];if(a)throw"unexpected marker: "+(A<<8|a).toString(16);}z=7;return A>>>7}function w(a){for(;;){a=a[l()];if("number"===typeof a)return a;if("object"!==typeof a)throw"invalid huffman sequence";}}function t(a){for(var b=0;0<a;)b=b<<1|l(),a--;return b}function g(a){if(1===a)return 1===l()?1:-1;var b=t(a);return b>=1<<a-1?b:b+(-1<<a)+1}function e(a,b){var c=w(a.huffmanTableDC),c=0===c?0:g(c);a.blockData[b]=a.pred+=c;for(c=1;64>c;){var d=w(a.huffmanTableAC),
e=d&15,d=d>>4;if(0===e){if(15>d)break;c+=16}else c+=d,a.blockData[b+I[c]]=g(e),c++}}function v(a,b){var c=w(a.huffmanTableDC),c=0===c?0:g(c)<<f;a.blockData[b]=a.pred+=c}function p(a,b){a.blockData[b]|=l()<<f}function n(a,b){if(0<u)u--;else for(var c=y;c<=m;){var d=w(a.huffmanTableAC),e=d&15,d=d>>4;if(0===e){if(15>d){u=t(d)+(1<<d)-1;break}c+=16}else c+=d,a.blockData[b+I[c]]=g(e)*(1<<f),c++}}function q(a,b){for(var c=y,d=0,e;c<=m;){e=I[c];switch(D){case 0:d=w(a.huffmanTableAC);e=d&15;d>>=4;if(0===e)15>
d?(u=t(d)+(1<<d),D=4):(d=16,D=1);else{if(1!==e)throw"invalid ACn encoding";C=g(e);D=d?2:3}continue;case 1:case 2:a.blockData[b+e]?a.blockData[b+e]+=l()<<f:(d--,0===d&&(D=2===D?3:0));break;case 3:a.blockData[b+e]?a.blockData[b+e]+=l()<<f:(a.blockData[b+e]=C<<f,D=0);break;case 4:a.blockData[b+e]&&(a.blockData[b+e]+=l()<<f)}c++}4===D&&(u--,0===u&&(D=0))}var h=r.mcusPerLine,x=d,A=0,z=0,u=0,D=0,C,J=k.length,B,E,K,L,G;c=r.progressive?0===y?0===c?v:p:0===c?n:q:e;var F=0;r=1===J?k[0].blocksPerLine*k[0].blocksPerColumn:
h*r.mcusPerColumn;a||(a=r);for(var H,M;F<r;){for(E=0;E<J;E++)k[E].pred=0;u=0;if(1===J)for(B=k[0],G=0;G<a;G++)c(B,64*((B.blocksPerLine+1)*(F/B.blocksPerLine|0)+F%B.blocksPerLine)),F++;else for(G=0;G<a;G++){for(E=0;E<J;E++)for(B=k[E],H=B.h,M=B.v,K=0;K<M;K++)for(L=0;L<H;L++)c(B,64*((B.blocksPerLine+1)*((F/h|0)*B.v+K)+(F%h*B.h+L)));F++}z=0;B=b[d]<<8|b[d+1];if(65280>=B)throw"marker was not found";if(65488<=B&&65495>=B)d+=2;else break}return d-x}function P(b,d){b=d.blocksPerLine;for(var r=d.blocksPerColumn,
k=new Int16Array(64),a=0;a<r;a++)for(var y=0;y<b;y++){for(var m=64*((d.blocksPerLine+1)*a+y),c=k,f=d.quantizationTable,l=d.blockData,w=void 0,t=void 0,g=void 0,e=void 0,v=void 0,p=void 0,n=void 0,q=void 0,h=void 0,x=q=void 0,A=n=t=p=void 0,z=void 0,h=void 0,u=0;64>u;u+=8)h=l[m+u],q=l[m+u+1],x=l[m+u+2],p=l[m+u+3],t=l[m+u+4],n=l[m+u+5],A=l[m+u+6],z=l[m+u+7],h*=f[u],0===(q|x|p|t|n|A|z)?(h=5793*h+512>>10,c[u]=h,c[u+1]=h,c[u+2]=h,c[u+3]=h,c[u+4]=h,c[u+5]=h,c[u+6]=h,c[u+7]=h):(q*=f[u+1],x*=f[u+2],p*=f[u+
3],t*=f[u+4],n*=f[u+5],A*=f[u+6],z*=f[u+7],w=5793*h+128>>8,t=5793*t+128>>8,g=x,e=A,v=2896*(q-z)+128>>8,q=2896*(q+z)+128>>8,p<<=4,n<<=4,w=w+t+1>>1,t=w-t,h=3784*g+1567*e+128>>8,g=1567*g-3784*e+128>>8,e=h,v=v+n+1>>1,n=v-n,q=q+p+1>>1,p=q-p,w=w+e+1>>1,e=w-e,t=t+g+1>>1,g=t-g,h=2276*v+3406*q+2048>>12,v=3406*v-2276*q+2048>>12,q=h,h=799*p+4017*n+2048>>12,p=4017*p-799*n+2048>>12,n=h,c[u]=w+q,c[u+7]=w-q,c[u+1]=t+n,c[u+6]=t-n,c[u+2]=g+p,c[u+5]=g-p,c[u+3]=e+v,c[u+4]=e-v);for(f=0;8>f;++f)h=c[f],q=c[f+8],x=c[f+
16],p=c[f+24],t=c[f+32],n=c[f+40],A=c[f+48],z=c[f+56],0===(q|x|p|t|n|A|z)?(h=5793*h+8192>>14,h=-2040>h?0:2024<=h?255:h+2056>>4,l[m+f]=h,l[m+f+8]=h,l[m+f+16]=h,l[m+f+24]=h,l[m+f+32]=h,l[m+f+40]=h,l[m+f+48]=h,l[m+f+56]=h):(w=5793*h+2048>>12,t=5793*t+2048>>12,g=x,e=A,v=2896*(q-z)+2048>>12,q=2896*(q+z)+2048>>12,w=(w+t+1>>1)+4112,t=w-t,h=3784*g+1567*e+2048>>12,g=1567*g-3784*e+2048>>12,e=h,v=v+n+1>>1,n=v-n,q=q+p+1>>1,p=q-p,w=w+e+1>>1,e=w-e,t=t+g+1>>1,g=t-g,h=2276*v+3406*q+2048>>12,v=3406*v-2276*q+2048>>
12,q=h,h=799*p+4017*n+2048>>12,p=4017*p-799*n+2048>>12,n=h,h=w+q,z=w-q,q=t+n,A=t-n,x=g+p,n=g-p,p=e+v,t=e-v,h=16>h?0:4080<=h?255:h>>4,q=16>q?0:4080<=q?255:q>>4,x=16>x?0:4080<=x?255:x>>4,p=16>p?0:4080<=p?255:p>>4,t=16>t?0:4080<=t?255:t>>4,n=16>n?0:4080<=n?255:n>>4,A=16>A?0:4080<=A?255:A>>4,z=16>z?0:4080<=z?255:z>>4,l[m+f]=h,l[m+f+8]=q,l[m+f+16]=x,l[m+f+24]=p,l[m+f+32]=t,l[m+f+40]=n,l[m+f+48]=A,l[m+f+56]=z)}return d.blockData}function C(b){return 0>=b?0:255<=b?255:b}var I=new Uint8Array([0,1,8,16,9,
2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63]);H.prototype={parse:function(b){function d(){var c=b[a]<<8|b[a+1];a+=2;return c}function r(){var c=d(),c=b.subarray(a,a+c-2);a+=c.length;return c}function k(a){for(var b=Math.ceil(a.samplesPerLine/8/a.maxH),c=Math.ceil(a.scanLines/8/a.maxV),d=0;d<a.components.length;d++){x=a.components[d];var e=Math.ceil(Math.ceil(a.samplesPerLine/
8)*x.h/a.maxH),f=Math.ceil(Math.ceil(a.scanLines/8)*x.v/a.maxV);x.blockData=new Int16Array(64*c*x.v*(b*x.h+1));x.blocksPerLine=e;x.blocksPerColumn=f}a.mcusPerLine=b;a.mcusPerColumn=c}var a=0,y=null,m=null,c,f,l=[],w=[],t=[],g=d();if(65496!==g)throw"SOI not found";for(g=d();65497!==g;){var e,v;switch(g){case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:case 65534:e=r();65504===
g&&74===e[0]&&70===e[1]&&73===e[2]&&70===e[3]&&0===e[4]&&(y={version:{major:e[5],minor:e[6]},densityUnits:e[7],xDensity:e[8]<<8|e[9],yDensity:e[10]<<8|e[11],thumbWidth:e[12],thumbHeight:e[13],thumbData:e.subarray(14,14+3*e[12]*e[13])});65518===g&&65===e[0]&&100===e[1]&&111===e[2]&&98===e[3]&&101===e[4]&&(m={version:e[5]<<8|e[6],flags0:e[7]<<8|e[8],flags1:e[9]<<8|e[10],transformCode:e[11]});break;case 65499:for(var g=d()+a-2,p;a<g;){var n=b[a++],q=new Uint16Array(64);if(0===n>>4)for(e=0;64>e;e++)p=
I[e],q[p]=b[a++];else if(1===n>>4)for(e=0;64>e;e++)p=I[e],q[p]=d();else throw"DQT: invalid table spec";l[n&15]=q}break;case 65472:case 65473:case 65474:if(c)throw"Only single frame JPEGs supported";d();c={};c.extended=65473===g;c.progressive=65474===g;c.precision=b[a++];c.scanLines=d();c.samplesPerLine=d();c.components=[];c.componentIds={};e=b[a++];for(g=q=n=0;g<e;g++){p=b[a];v=b[a+1]>>4;var h=b[a+1]&15;n<v&&(n=v);q<h&&(q=h);v=c.components.push({h:v,v:h,quantizationTable:l[b[a+2]]});c.componentIds[p]=
v-1;a+=3}c.maxH=n;c.maxV=q;k(c);break;case 65476:p=d();for(g=2;g<p;){n=b[a++];q=new Uint8Array(16);for(e=v=0;16>e;e++,a++)v+=q[e]=b[a];h=new Uint8Array(v);for(e=0;e<v;e++,a++)h[e]=b[a];g+=17+v;(0===n>>4?t:w)[n&15]=N(q,h)}break;case 65501:d();f=d();break;case 65498:d();p=b[a++];e=[];for(var x,g=0;g<p;g++)n=c.componentIds[b[a++]],x=c.components[n],n=b[a++],x.huffmanTableDC=t[n>>4],x.huffmanTableAC=w[n&15],e.push(x);g=b[a++];p=b[a++];n=b[a++];g=O(b,a,c,e,f,g,p,n>>4,n&15);a+=g;break;case 65535:255!==
b[a]&&a--;break;default:if(255===b[a-3]&&192<=b[a-2]&&254>=b[a-2])a-=3;else throw"unknown JPEG marker "+g.toString(16);}g=d()}this.width=c.samplesPerLine;this.height=c.scanLines;this.jfif=y;this.eof=a;this.adobe=m;this.components=[];for(g=0;g<c.components.length;g++)x=c.components[g],this.components.push({output:P(c,x),scaleX:x.h/c.maxH,scaleY:x.v/c.maxV,blocksPerLine:x.blocksPerLine,blocksPerColumn:x.blocksPerColumn});this.numComponents=this.components.length},_getLinearizedBlockData:function(b,
d){var r=this.width/b,k=this.height/d,a,y,m,c,f,l,w=0,t,g=this.components.length,e=b*d*g,v=new Uint8Array(e),p=new Uint32Array(b);for(l=0;l<g;l++){a=this.components[l];y=a.scaleX*r;m=a.scaleY*k;w=l;t=a.output;c=a.blocksPerLine+1<<3;for(f=0;f<b;f++)a=0|f*y,p[f]=(a&4294967288)<<3|a&7;for(y=0;y<d;y++)for(a=0|y*m,a=c*(a&4294967288)|(a&7)<<3,f=0;f<b;f++)v[w]=t[a+p[f]],w+=g}if(d=this.decodeTransform)for(l=0;l<e;)for(b=a=0;a<g;a++,l++,b+=2)v[l]=(v[l]*d[b]>>8)+d[b+1];return v},_isColorConversionNeeded:function(){return this.adobe&&
this.adobe.transformCode?!0:3===this.numComponents?!0:!1},_convertYccToRgb:function(b){for(var d,r,k,a=0,y=b.length;a<y;a+=3)d=b[a],r=b[a+1],k=b[a+2],b[a]=C(d-179.456+1.402*k),b[a+1]=C(d+135.459-.344*r-.714*k),b[a+2]=C(d-226.816+1.772*r);return b},_convertYcckToRgb:function(b){for(var d,r,k,a,y=0,m=0,c=b.length;m<c;m+=4){d=b[m];r=b[m+1];k=b[m+2];a=b[m+3];var f=-122.67195406894+r*(-6.60635669420364E-5*r+4.37130475926232E-4*k-5.4080610064599E-5*d+4.8449797120281E-4*a-.154362151871126)+k*(-9.57964378445773E-4*
k+8.17076911346625E-4*d-.00477271405408747*a+1.53380253221734)+d*(9.61250184130688E-4*d-.00266257332283933*a+.48357088451265)+a*(-3.36197177618394E-4*a+.484791561490776),l=107.268039397724+r*(2.19927104525741E-5*r-6.40992018297945E-4*k+6.59397001245577E-4*d+4.26105652938837E-4*a-.176491792462875)+k*(-7.78269941513683E-4*k+.00130872261408275*d+7.70482631801132E-4*a-.151051492775562)+d*(.00126935368114843*d-.00265090189010898*a+.25802910206845)+a*(-3.18913117588328E-4*a-.213742400323665);d=-20.810012546947+
r*(-5.70115196973677E-4*r-2.63409051004589E-5*k+.0020741088115012*d-.00288260236853442*a+.814272968359295)+k*(-1.53496057440975E-5*k-1.32689043961446E-4*d+5.60833691242812E-4*a-.195152027534049)+d*(.00174418132927582*d-.00255243321439347*a+.116935020465145)+a*(-3.43531996510555E-4*a+.24165260232407);b[y++]=C(f);b[y++]=C(l);b[y++]=C(d)}return b},_convertYcckToCmyk:function(b){for(var d,r,k,a=0,y=b.length;a<y;a+=4)d=b[a],r=b[a+1],k=b[a+2],b[a]=C(434.456-d-1.402*k),b[a+1]=C(119.541-d+.344*r+.714*k),
b[a+2]=C(481.816-d-1.772*r);return b},_convertCmykToRgb:function(b){for(var d,r,k,a,y=0,m=1/255/255,c=0,f=b.length;c<f;c+=4){d=b[c];r=b[c+1];k=b[c+2];a=b[c+3];var l=d*(-4.387332384609988*d+54.48615194189176*r+18.82290502165302*k+212.25662451639585*a-72734.4411664936)+r*(1.7149763477362134*r-5.6096736904047315*k-17.873870861415444*a-1401.7366389350734)+k*(-2.5217340131683033*k-21.248923337353073*a+4465.541406466231)-a*(21.86122147463605*a+48317.86113160301),w=d*(8.841041422036149*d+60.118027045597366*
r+6.871425592049007*k+31.159100130055922*a-20220.756542821975)+r*(-15.310361306967817*r+17.575251261109482*k+131.35250912493976*a-48691.05921601825)+k*(4.444339102852739*k+9.8632861493405*a-6341.191035517494)-a*(20.737325471181034*a+47890.15695978492);d=d*(.8842522430003296*d+8.078677503112928*r+30.89978309703729*k-.23883238689178934*a-3616.812083916688)+r*(10.49593273432072*r+63.02378494754052*k+50.606957656360734*a-28620.90484698408)+k*(.03296041114873217*k+115.60384449646641*a-49363.43385999684)-
a*(22.33816807309886*a+45932.16563550634);b[y++]=0<=l?255:-16581375>=l?0:255+l*m|0;b[y++]=0<=w?255:-16581375>=w?0:255+w*m|0;b[y++]=0<=d?255:-16581375>=d?0:255+d*m|0}return b},getData:function(b,d,r){if(4<this.numComponents)throw"Unsupported color mode";b=this._getLinearizedBlockData(b,d);if(3===this.numComponents)return this._convertYccToRgb(b);if(4===this.numComponents){if(this._isColorConversionNeeded())return r?this._convertYcckToRgb(b):this._convertYcckToCmyk(b);if(r)return this._convertCmykToRgb(b)}return b}};
return H}()});