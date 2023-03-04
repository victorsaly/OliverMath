"use strict";(self["webpackChunkOliverVocabulary"]=self["webpackChunkOliverVocabulary"]||[]).push([[3479],{6837:function(t,e,r){r.d(e,{a:function(){return o},b:function(){return s},c:function(){return i},d:function(){return a},h:function(){return l}});var n={getEngine:function(){var t=window;return t.TapticEngine||t.Capacitor&&t.Capacitor.isPluginAvailable("Haptics")&&t.Capacitor.Plugins.Haptics},available:function(){return!!this.getEngine()},isCordova:function(){return!!window.TapticEngine},isCapacitor:function(){var t=window;return!!t.Capacitor},impact:function(t){var e=this.getEngine();if(e){var r=this.isCapacitor()?t.style.toUpperCase():t.style;e.impact({style:r})}},notification:function(t){var e=this.getEngine();if(e){var r=this.isCapacitor()?t.style.toUpperCase():t.style;e.notification({style:r})}},selection:function(){this.impact({style:"light"})},selectionStart:function(){var t=this.getEngine();t&&(this.isCapacitor()?t.selectionStart():t.gestureSelectionStart())},selectionChanged:function(){var t=this.getEngine();t&&(this.isCapacitor()?t.selectionChanged():t.gestureSelectionChanged())},selectionEnd:function(){var t=this.getEngine();t&&(this.isCapacitor()?t.selectionEnd():t.gestureSelectionEnd())}},i=function(){n.selection()},o=function(){n.selectionStart()},s=function(){n.selectionChanged()},l=function(){n.selectionEnd()},a=function(t){n.impact(t)}},3479:function(t,e,r){r.r(e),r.d(e,{ion_reorder:function(){return c},ion_reorder_group:function(){return u}});var n=r(655),i=r(5121),o=r(3007),s=r(6837),l=":host([slot]){display:none;line-height:0;z-index:100}.reorder-icon{display:block;font-size:22px}.reorder-icon{font-size:34px;opacity:0.4}",a=":host([slot]){display:none;line-height:0;z-index:100}.reorder-icon{display:block;font-size:22px}.reorder-icon{font-size:31px;opacity:0.3}",c=function(){function t(t){(0,i.r)(this,t)}return t.prototype.onClick=function(t){var e=this.el.closest("ion-reorder-group");t.preventDefault(),e&&e.disabled||t.stopImmediatePropagation()},t.prototype.render=function(){var t=(0,o.b)(this),e="ios"===t?"reorder-three-outline":"reorder-two-sharp";return(0,i.h)(i.H,{class:t},(0,i.h)("slot",null,(0,i.h)("ion-icon",{name:e,lazy:!1,class:"reorder-icon",part:"icon"})))},Object.defineProperty(t.prototype,"el",{get:function(){return(0,i.i)(this)},enumerable:!1,configurable:!0}),t}();c.style={ios:l,md:a};var h=".reorder-list-active>*{-webkit-transition:-webkit-transform 300ms;transition:-webkit-transform 300ms;transition:transform 300ms;transition:transform 300ms, -webkit-transform 300ms;will-change:transform}.reorder-enabled{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.reorder-enabled ion-reorder{display:block;cursor:-webkit-grab;cursor:grab;pointer-events:all;-ms-touch-action:none;touch-action:none}.reorder-selected,.reorder-selected ion-reorder{cursor:-webkit-grabbing;cursor:grabbing}.reorder-selected{position:relative;-webkit-transition:none !important;transition:none !important;-webkit-box-shadow:0 0 10px rgba(0, 0, 0, 0.4);box-shadow:0 0 10px rgba(0, 0, 0, 0.4);opacity:0.8;z-index:100}.reorder-visible ion-reorder .reorder-icon{-webkit-transform:translate3d(0,  0,  0);transform:translate3d(0,  0,  0)}",u=function(){function t(t){(0,i.r)(this,t),this.ionItemReorder=(0,i.e)(this,"ionItemReorder",7),this.lastToIndex=-1,this.cachedHeights=[],this.scrollElTop=0,this.scrollElBottom=0,this.scrollElInitial=0,this.containerTop=0,this.containerBottom=0,this.state=0,this.disabled=!0}return t.prototype.disabledChanged=function(){this.gesture&&this.gesture.enable(!this.disabled)},t.prototype.connectedCallback=function(){return(0,n.mG)(this,void 0,void 0,(function(){var t,e,i,o=this;return(0,n.Jh)(this,(function(n){switch(n.label){case 0:return t=this.el.closest("ion-content"),t?(e=this,[4,t.getScrollElement()]):[3,2];case 1:e.scrollEl=n.sent(),n.label=2;case 2:return i=this,[4,Promise.resolve().then(r.bind(r,8224))];case 3:return i.gesture=n.sent().createGesture({el:this.el,gestureName:"reorder",gesturePriority:110,threshold:0,direction:"y",passive:!1,canStart:function(t){return o.canStart(t)},onStart:function(t){return o.onStart(t)},onMove:function(t){return o.onMove(t)},onEnd:function(){return o.onEnd()}}),this.disabledChanged(),[2]}}))}))},t.prototype.disconnectedCallback=function(){this.onEnd(),this.gesture&&(this.gesture.destroy(),this.gesture=void 0)},t.prototype.complete=function(t){return Promise.resolve(this.completeSync(t))},t.prototype.canStart=function(t){if(this.selectedItemEl||0!==this.state)return!1;var e=t.event.target,r=e.closest("ion-reorder");if(!r)return!1;var n=p(r,this.el);return!!n&&(t.data=n,!0)},t.prototype.onStart=function(t){t.event.preventDefault();var e=this.selectedItemEl=t.data,r=this.cachedHeights;r.length=0;var n=this.el,i=n.children;if(i&&0!==i.length){for(var o=0,l=0;l<i.length;l++){var a=i[l];o+=a.offsetHeight,r.push(o),a.$ionIndex=l}var c=n.getBoundingClientRect();if(this.containerTop=c.top,this.containerBottom=c.bottom,this.scrollEl){var h=this.scrollEl.getBoundingClientRect();this.scrollElInitial=this.scrollEl.scrollTop,this.scrollElTop=h.top+f,this.scrollElBottom=h.bottom-f}else this.scrollElInitial=0,this.scrollElTop=0,this.scrollElBottom=0;this.lastToIndex=d(e),this.selectedItemHeight=e.offsetHeight,this.state=1,e.classList.add(m),(0,s.a)()}},t.prototype.onMove=function(t){var e=this.selectedItemEl;if(e){var r=this.autoscroll(t.currentY),n=this.containerTop-r,i=this.containerBottom-r,o=Math.max(n,Math.min(t.currentY,i)),l=r+o-t.startY,a=o-n,c=this.itemIndexForTop(a);if(c!==this.lastToIndex){var h=d(e);this.lastToIndex=c,(0,s.b)(),this.reorderMove(h,c)}e.style.transform="translateY("+l+"px)"}},t.prototype.onEnd=function(){var t=this.selectedItemEl;if(this.state=2,t){var e=this.lastToIndex,r=d(t);e===r?this.completeSync():this.ionItemReorder.emit({from:r,to:e,complete:this.completeSync.bind(this)}),(0,s.h)()}else this.state=0},t.prototype.completeSync=function(t){var e=this.selectedItemEl;if(e&&2===this.state){var r=this.el.children,n=r.length,i=this.lastToIndex,o=d(e);if(i!==o&&(void 0===t||!0===t)){var s=o<i?r[i+1]:r[i];this.el.insertBefore(e,s)}Array.isArray(t)&&(t=v(t,o,i));for(var l=0;l<n;l++)r[l].style["transform"]="";e.style.transition="",e.classList.remove(m),this.selectedItemEl=void 0,this.state=0}return t},t.prototype.itemIndexForTop=function(t){for(var e=this.cachedHeights,r=0;r<e.length;r++)if(e[r]>t)return r;return e.length-1},t.prototype.reorderMove=function(t,e){for(var r=this.selectedItemHeight,n=this.el.children,i=0;i<n.length;i++){var o=n[i].style,s="";i>t&&i<=e?s="translateY("+-r+"px)":i<t&&i>=e&&(s="translateY("+r+"px)"),o["transform"]=s}},t.prototype.autoscroll=function(t){if(!this.scrollEl)return 0;var e=0;return t<this.scrollElTop?e=-g:t>this.scrollElBottom&&(e=g),0!==e&&this.scrollEl.scrollBy(0,e),this.scrollEl.scrollTop-this.scrollElInitial},t.prototype.render=function(){var t,e=(0,o.b)(this);return(0,i.h)(i.H,{class:(t={},t[e]=!0,t["reorder-enabled"]=!this.disabled,t["reorder-list-active"]=0!==this.state,t)})},Object.defineProperty(t.prototype,"el",{get:function(){return(0,i.i)(this)},enumerable:!1,configurable:!0}),Object.defineProperty(t,"watchers",{get:function(){return{disabled:["disabledChanged"]}},enumerable:!1,configurable:!0}),t}(),d=function(t){return t["$ionIndex"]},p=function(t,e){var r;while(t){if(r=t.parentElement,r===e)return t;t=r}},f=60,g=10,m="reorder-selected",v=function(t,e,r){var n=t[e];return t.splice(e,1),t.splice(r,0,n),t.slice()};u.style=h}}]);
//# sourceMappingURL=3479-legacy.3be80b34.js.map