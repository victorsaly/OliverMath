"use strict";(self["webpackChunkOliverMath"]=self["webpackChunkOliverMath"]||[]).push([[6048],{1616:function(e,t,r){r.r(t),r.d(t,{scopeCss:function(){return N}});var n=r(655),c=function(e){var t,r=[],n=0;e=e.replace(/(\[[^\]]*\])/g,(function(e,t){var c="__ph-"+n+"__";return r.push(t),n++,c})),t=e.replace(/(:nth-[-\w]+)(\([^)]+\))/g,(function(e,t,c){var s="__ph-"+n+"__";return r.push(c),n++,t+s}));var c={content:t,placeholders:r};return c},s=function(e,t){return t.replace(/__ph-(\d+)__/g,(function(t,r){return e[+r]}))},o="-shadowcsshost",i="-shadowcssslotted",a="-shadowcsscontext",u=")(?:\\(((?:\\([^)(]*\\)|[^)(]*)+?)\\))?([^,{]*)",l=new RegExp("("+o+u,"gim"),f=new RegExp("("+a+u,"gim"),p=new RegExp("("+i+u,"gim"),h=o+"-no-combinator",g=/-shadowcsshost-no-combinator([^\s]*)/,v=[/::shadow/g,/::content/g],d="([>\\s~+[.,{:][\\s\\S]*)?$",m=/-shadowcsshost/gim,x=/:host/gim,_=/::slotted/gim,w=/:host-context/gim,b=/\/\*\s*[\s\S]*?\*\//g,S=function(e){return e.replace(b,"")},O=/\/\*\s*#\s*source(Mapping)?URL=[\s\S]+?\*\//g,W=function(e){return e.match(O)||[]},k=/(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g,j=/([{}])/g,E="{",R="}",C="%BLOCK%",T=function(e,t){var r=L(e),n=0;return r.escapedString.replace(k,(function(){for(var e=[],c=0;c<arguments.length;c++)e[c]=arguments[c];var s=e[2],o="",i=e[4],a="";i&&i.startsWith("{"+C)&&(o=r.blocks[n++],i=i.substring(C.length+1),a="{");var u={selector:s,content:o},l=t(u);return""+e[1]+l.selector+e[3]+a+l.content+i}))},L=function(e){for(var t=e.split(j),r=[],n=[],c=0,s=[],o=0;o<t.length;o++){var i=t[o];i===R&&c--,c>0?s.push(i):(s.length>0&&(n.push(s.join("")),r.push(C),s=[]),r.push(i)),i===E&&c++}s.length>0&&(n.push(s.join("")),r.push(C));var a={escapedString:r.join(""),blocks:n};return a},M=function(e){return e=e.replace(w,a).replace(x,o).replace(_,i),e},B=function(e,t,r){return e.replace(t,(function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];if(e[2]){for(var n=e[2].split(","),c=[],s=0;s<n.length;s++){var o=n[s].trim();if(!o)break;c.push(r(h,o,e[3]))}return c.join(",")}return h+e[3]}))},I=function(e,t,r){return e+t.replace(o,"")+r},K=function(e){return B(e,l,I)},$=function(e,t,r){return t.indexOf(o)>-1?I(e,t,r):e+t+r+", "+t+" "+e+r},U=function(e,t){var r="."+t+" > ",n=[];return e=e.replace(p,(function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];if(e[2]){for(var c=e[2].trim(),s=e[3],o=r+c+s,i="",a=e[4]-1;a>=0;a--){var u=e[5][a];if("}"===u||","===u)break;i=u+i}var l=i+o,f=""+i.trimRight()+o.trim();if(l.trim()!==f.trim()){var p=f+", "+l;n.push({orgSelector:l,updatedSelector:p})}return o}return h+e[3]})),{selectors:n,cssText:e}},q=function(e){return B(e,f,$)},y=function(e){return v.reduce((function(e,t){return e.replace(t," ")}),e)},z=function(e){var t=/\[/g,r=/\]/g;return e=e.replace(t,"\\[").replace(r,"\\]"),new RegExp("^("+e+")"+d,"m")},A=function(e,t){var r=z(t);return!r.test(e)},D=function(e,t,r){if(m.lastIndex=0,m.test(e)){var n="."+r;return e.replace(g,(function(e,t){return t.replace(/([^:]*)(:*)(.*)/,(function(e,t,r,c){return t+n+r+c}))})).replace(m,n+" ")}return t+" "+e},F=function(e,t,r){var n=/\[is=([^\]]*)\]/g;t=t.replace(n,(function(e){for(var t=[],r=1;r<arguments.length;r++)t[r-1]=arguments[r];return t[0]}));var o="."+t,i=function(e){var n=e.trim();if(!n)return"";if(e.indexOf(h)>-1)n=D(e,t,r);else{var c=e.replace(m,"");if(c.length>0){var s=c.match(/([^:]*)(:*)(.*)/);s&&(n=s[1]+o+s[2]+s[3])}}return n},a=c(e);e=a.content;var u,l="",f=0,p=/( |>|\+|~(?!=))\s*/g,g=e.indexOf(h)>-1,v=!g;while(null!==(u=p.exec(e))){var d=u[1],x=e.slice(f,u.index).trim();v=v||x.indexOf(h)>-1;var _=v?i(x):x;l+=_+" "+d+" ",f=p.lastIndex}var w=e.substring(f);return v=v||w.indexOf(h)>-1,l+=v?i(w):w,s(a.placeholders,l)},G=function(e,t,r,n){return e.split(",").map((function(e){return n&&e.indexOf("."+n)>-1?e.trim():A(e,t)?F(e,t,r).trim():e.trim()})).join(", ")},H=function(e,t,r,n,c){return T(e,(function(e){var c=e.selector,s=e.content;"@"!==e.selector[0]?c=G(e.selector,t,r,n):(e.selector.startsWith("@media")||e.selector.startsWith("@supports")||e.selector.startsWith("@page")||e.selector.startsWith("@document"))&&(s=H(e.content,t,r,n));var o={selector:c.replace(/\s{2,}/g," ").trim(),content:s};return o}))},J=function(e,t,r,n,c){e=M(e),e=K(e),e=q(e);var s=U(e,n);return e=s.cssText,e=y(e),t&&(e=H(e,t,r,n)),e=e.replace(/-shadowcsshost-no-combinator/g,"."+r),e=e.replace(/>\s*\*\s+([^{, ]+)/gm," $1 "),{cssText:e.trim(),slottedSelectors:s.selectors}},N=function(e,t,r){var c=t+"-h",s=t+"-s",o=W(e);e=S(e);var i=[];if(r){var a=function(e){var t="/*!@___"+i.length+"___*/",r="/*!@"+e.selector+"*/";return i.push({placeholder:t,comment:r}),e.selector=t+e.selector,e};e=T(e,(function(e){return"@"!==e.selector[0]?a(e):e.selector.startsWith("@media")||e.selector.startsWith("@supports")||e.selector.startsWith("@page")||e.selector.startsWith("@document")?(e.content=T(e.content,a),e):e}))}var u=J(e,t,c,s);return e=(0,n.ev)([u.cssText],o).join("\n"),r&&i.forEach((function(t){var r=t.placeholder,n=t.comment;e=e.replace(r,n)})),u.slottedSelectors.forEach((function(t){e=e.replace(t.orgSelector,t.updatedSelector)})),e};
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * This file is a port of shadowCSS from webcomponents.js to TypeScript.
 * https://github.com/webcomponents/webcomponentsjs/blob/4efecd7e0e/src/ShadowCSS/ShadowCSS.js
 * https://github.com/angular/angular/blob/master/packages/compiler/src/shadow_css.ts
 */}}]);
//# sourceMappingURL=6048-legacy.1d2e9ccd.js.map