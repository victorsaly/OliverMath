"use strict";(self["webpackChunkOliverMath"]=self["webpackChunkOliverMath"]||[]).push([[8014],{8014:function(t,i,o){o.r(i),o.d(i,{ion_img:function(){return s}});var n=o(5121),e=o(3007),r=":host{display:block;-o-object-fit:contain;object-fit:contain}img{display:block;width:100%;height:100%;-o-object-fit:inherit;object-fit:inherit;-o-object-position:inherit;object-position:inherit}",s=function(){function t(t){var i=this;(0,n.r)(this,t),this.ionImgWillLoad=(0,n.e)(this,"ionImgWillLoad",7),this.ionImgDidLoad=(0,n.e)(this,"ionImgDidLoad",7),this.ionError=(0,n.e)(this,"ionError",7),this.onLoad=function(){i.ionImgDidLoad.emit()},this.onError=function(){i.ionError.emit()}}return t.prototype.srcChanged=function(){this.addIO()},t.prototype.componentDidLoad=function(){this.addIO()},t.prototype.addIO=function(){var t=this;void 0!==this.src&&("undefined"!==typeof window&&"IntersectionObserver"in window&&"IntersectionObserverEntry"in window&&"isIntersecting"in window.IntersectionObserverEntry.prototype?(this.removeIO(),this.io=new IntersectionObserver((function(i){i[i.length-1].isIntersecting&&(t.load(),t.removeIO())})),this.io.observe(this.el)):setTimeout((function(){return t.load()}),200))},t.prototype.load=function(){this.loadError=this.onError,this.loadSrc=this.src,this.ionImgWillLoad.emit()},t.prototype.removeIO=function(){this.io&&(this.io.disconnect(),this.io=void 0)},t.prototype.render=function(){return(0,n.h)(n.H,{class:(0,e.b)(this)},(0,n.h)("img",{decoding:"async",src:this.loadSrc,alt:this.alt,onLoad:this.onLoad,onError:this.loadError,part:"image"}))},Object.defineProperty(t.prototype,"el",{get:function(){return(0,n.i)(this)},enumerable:!1,configurable:!0}),Object.defineProperty(t,"watchers",{get:function(){return{src:["srcChanged"]}},enumerable:!1,configurable:!0}),t}();s.style=r}}]);
//# sourceMappingURL=8014.92e73399.js.map