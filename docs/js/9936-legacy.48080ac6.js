"use strict";(self["webpackChunkOliverVocabulary"]=self["webpackChunkOliverVocabulary"]||[]).push([[9936],{6755:function(t,n,e){e.d(n,{g:function(){return i}});var i=function(t,n,e,i,a){return r(t[1],n[1],e[1],i[1],a).map((function(r){return o(t[0],n[0],e[0],i[0],r)}))},o=function(t,n,e,i,o){var r=3*n*Math.pow(o-1,2),a=-3*e*o+3*e+i*o,s=t*Math.pow(o-1,3);return o*(r+o*a)-s},r=function(t,n,e,i,o){t-=o,n-=o,e-=o,i-=o;var r=s(i-3*e+3*n-t,3*e-6*n+3*t,3*n-3*t,t);return r.filter((function(t){return t>=0&&t<=1}))},a=function(t,n,e){var i=n*n-4*t*e;return i<0?[]:[(-n+Math.sqrt(i))/(2*t),(-n-Math.sqrt(i))/(2*t)]},s=function(t,n,e,i){if(0===t)return a(n,e,i);n/=t,e/=t,i/=t;var o=(3*e-n*n)/3,r=(2*n*n*n-9*n*e+27*i)/27;if(0===o)return[Math.pow(-r,1/3)];if(0===r)return[Math.sqrt(-o),-Math.sqrt(-o)];var s=Math.pow(r/2,2)+Math.pow(o/3,3);if(0===s)return[Math.pow(r/2,.5)-n/3];if(s>0)return[Math.pow(-r/2+Math.sqrt(s),1/3)-Math.pow(r/2+Math.sqrt(s),1/3)-n/3];var h=Math.sqrt(Math.pow(-o/3,3)),d=Math.acos(-r/(2*Math.sqrt(Math.pow(-o/3,3)))),u=2*Math.pow(h,1/3);return[u*Math.cos(d/3)-n/3,u*Math.cos((d+2*Math.PI)/3)-n/3,u*Math.cos((d+4*Math.PI)/3)-n/3]}},9936:function(t,n,e){e.r(n),e.d(n,{ion_menu:function(){return v},ion_menu_button:function(){return S},ion_menu_toggle:function(){return M}});var i=e(655),o=e(5121),r=e(3007),a=e(6755),s=e(6221),h=e(8840),d=e(2110),u=e(3262),l=":host{--width:304px;--min-width:auto;--max-width:auto;--height:100%;--min-height:auto;--max-height:auto;--background:var(--ion-background-color, #fff);left:0;right:0;top:0;bottom:0;display:none;position:absolute;contain:strict}:host(.show-menu){display:block}.menu-inner{left:0;right:auto;top:0;bottom:0;-webkit-transform:translate3d(-9999px,  0,  0);transform:translate3d(-9999px,  0,  0);display:-ms-flexbox;display:flex;position:absolute;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:justify;justify-content:space-between;width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);background:var(--background);contain:strict}[dir=rtl] .menu-inner,:host-context([dir=rtl]) .menu-inner{left:unset;right:unset;left:auto;right:0}[dir=rtl] .menu-inner,:host-context([dir=rtl]) .menu-inner{-webkit-transform:translate3d(calc(-1 * -9999px),  0,  0);transform:translate3d(calc(-1 * -9999px),  0,  0)}:host(.menu-side-start) .menu-inner{--ion-safe-area-right:0px;right:auto;left:0}:host(.menu-side-end) .menu-inner{--ion-safe-area-left:0px;right:0;left:auto;}ion-backdrop{display:none;opacity:0.01;z-index:-1}@media (max-width: 340px){.menu-inner{--width:264px}}:host(.menu-type-reveal){z-index:0}:host(.menu-type-reveal.show-menu) .menu-inner{-webkit-transform:translate3d(0,  0,  0);transform:translate3d(0,  0,  0)}:host(.menu-type-overlay){z-index:1000}:host(.menu-type-overlay) .show-backdrop{display:block;cursor:pointer}:host(.menu-pane-visible){width:var(--width);min-width:var(--min-width);max-width:var(--max-width)}:host(.menu-pane-visible) .menu-inner{left:0;right:0;width:auto;-webkit-transform:none !important;transform:none !important;-webkit-box-shadow:none !important;box-shadow:none !important}:host(.menu-pane-visible) ion-backdrop{display:hidden !important;}:host(.menu-type-push){z-index:1000}:host(.menu-type-push) .show-backdrop{display:block}",c=":host{--width:304px;--min-width:auto;--max-width:auto;--height:100%;--min-height:auto;--max-height:auto;--background:var(--ion-background-color, #fff);left:0;right:0;top:0;bottom:0;display:none;position:absolute;contain:strict}:host(.show-menu){display:block}.menu-inner{left:0;right:auto;top:0;bottom:0;-webkit-transform:translate3d(-9999px,  0,  0);transform:translate3d(-9999px,  0,  0);display:-ms-flexbox;display:flex;position:absolute;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:justify;justify-content:space-between;width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);background:var(--background);contain:strict}[dir=rtl] .menu-inner,:host-context([dir=rtl]) .menu-inner{left:unset;right:unset;left:auto;right:0}[dir=rtl] .menu-inner,:host-context([dir=rtl]) .menu-inner{-webkit-transform:translate3d(calc(-1 * -9999px),  0,  0);transform:translate3d(calc(-1 * -9999px),  0,  0)}:host(.menu-side-start) .menu-inner{--ion-safe-area-right:0px;right:auto;left:0}:host(.menu-side-end) .menu-inner{--ion-safe-area-left:0px;right:0;left:auto;}ion-backdrop{display:none;opacity:0.01;z-index:-1}@media (max-width: 340px){.menu-inner{--width:264px}}:host(.menu-type-reveal){z-index:0}:host(.menu-type-reveal.show-menu) .menu-inner{-webkit-transform:translate3d(0,  0,  0);transform:translate3d(0,  0,  0)}:host(.menu-type-overlay){z-index:1000}:host(.menu-type-overlay) .show-backdrop{display:block;cursor:pointer}:host(.menu-pane-visible){width:var(--width);min-width:var(--min-width);max-width:var(--max-width)}:host(.menu-pane-visible) .menu-inner{left:0;right:0;width:auto;-webkit-transform:none !important;transform:none !important;-webkit-box-shadow:none !important;box-shadow:none !important}:host(.menu-pane-visible) ion-backdrop{display:hidden !important;}:host(.menu-type-overlay) .menu-inner{-webkit-box-shadow:4px 0px 16px rgba(0, 0, 0, 0.18);box-shadow:4px 0px 16px rgba(0, 0, 0, 0.18)}",p="cubic-bezier(0.32,0.72,0,1)",m="cubic-bezier(0.0,0.0,0.2,1)",f="cubic-bezier(1, 0, 0.68, 0.28)",b="cubic-bezier(0.4, 0, 0.6, 1)",g='[tabindex]:not([tabindex^="-"]), input:not([type=hidden]):not([tabindex^="-"]), textarea:not([tabindex^="-"]), button:not([tabindex^="-"]), select:not([tabindex^="-"]), .ion-focusable:not([tabindex^="-"])',v=function(){function t(t){var n=this;(0,o.r)(this,t),this.ionWillOpen=(0,o.e)(this,"ionWillOpen",7),this.ionWillClose=(0,o.e)(this,"ionWillClose",7),this.ionDidOpen=(0,o.e)(this,"ionDidOpen",7),this.ionDidClose=(0,o.e)(this,"ionDidClose",7),this.ionMenuChange=(0,o.e)(this,"ionMenuChange",7),this.lastOnEnd=0,this.blocker=s.G.createBlocker({disableScroll:!0}),this.isAnimating=!1,this._isOpen=!1,this.inheritedAttributes={},this.handleFocus=function(t){return n.trapKeyboardFocus(t,document)},this.isPaneVisible=!1,this.isEndSide=!1,this.disabled=!1,this.side="start",this.swipeGesture=!0,this.maxEdgeStart=50}return t.prototype.typeChanged=function(t,n){var e=this.contentEl;e&&(void 0!==n&&e.classList.remove("menu-content-"+n),e.classList.add("menu-content-"+t),e.removeAttribute("style")),this.menuInnerEl&&this.menuInnerEl.removeAttribute("style"),this.animation=void 0},t.prototype.disabledChanged=function(){this.updateState(),this.ionMenuChange.emit({disabled:this.disabled,open:this._isOpen})},t.prototype.sideChanged=function(){this.isEndSide=(0,h.m)(this.side)},t.prototype.swipeGestureChanged=function(){this.updateState()},t.prototype.connectedCallback=function(){return(0,i.mG)(this,void 0,void 0,(function(){var t,n,o,a,s=this;return(0,i.Jh)(this,(function(i){switch(i.label){case 0:return void 0===this.type&&(this.type=r.c.get("menuType","overlay")),t=this.el,n=t.parentNode,void 0===this.contentId&&console.warn('[DEPRECATED][ion-menu] Using the [main] attribute is deprecated, please use the "contentId" property instead:\nBEFORE:\n  <ion-menu>...</ion-menu>\n  <div main>...</div>\n\nAFTER:\n  <ion-menu contentId="main-content"></ion-menu>\n  <div id="main-content">...</div>\n'),o=void 0!==this.contentId?document.getElementById(this.contentId):n&&n.querySelector&&n.querySelector("[main]"),o&&o.tagName?(this.contentEl=o,o.classList.add("menu-content"),this.typeChanged(this.type,void 0),this.sideChanged(),d.m._register(this),a=this,[4,Promise.resolve().then(e.bind(e,8224))]):(console.error('Menu: must have a "content" element to listen for drag events on.'),[2]);case 1:return a.gesture=i.sent().createGesture({el:document,gestureName:"menu-swipe",gesturePriority:30,threshold:10,blurOnStart:!0,canStart:function(t){return s.canStart(t)},onWillStart:function(){return s.onWillStart()},onStart:function(){return s.onStart()},onMove:function(t){return s.onMove(t)},onEnd:function(t){return s.onEnd(t)}}),this.updateState(),[2]}}))}))},t.prototype.componentWillLoad=function(){this.inheritedAttributes=(0,h.i)(this.el,["aria-label"])},t.prototype.componentDidLoad=function(){return(0,i.mG)(this,void 0,void 0,(function(){return(0,i.Jh)(this,(function(t){return this.ionMenuChange.emit({disabled:this.disabled,open:this._isOpen}),this.updateState(),[2]}))}))},t.prototype.disconnectedCallback=function(){this.blocker.destroy(),d.m._unregister(this),this.animation&&this.animation.destroy(),this.gesture&&(this.gesture.destroy(),this.gesture=void 0),this.animation=void 0,this.contentEl=this.backdropEl=this.menuInnerEl=void 0},t.prototype.onSplitPaneChanged=function(t){this.isPaneVisible=t.detail.isPane(this.el),this.updateState()},t.prototype.onBackdropClick=function(t){if(this._isOpen&&this.lastOnEnd<t.timeStamp-100){var n=!!t.composedPath&&!t.composedPath().includes(this.menuInnerEl);n&&(t.preventDefault(),t.stopPropagation(),this.close())}},t.prototype.onKeydown=function(t){"Escape"===t.key&&this.close()},t.prototype.isOpen=function(){return Promise.resolve(this._isOpen)},t.prototype.isActive=function(){return Promise.resolve(this._isActive())},t.prototype.open=function(t){return void 0===t&&(t=!0),this.setOpen(!0,t)},t.prototype.close=function(t){return void 0===t&&(t=!0),this.setOpen(!1,t)},t.prototype.toggle=function(t){return void 0===t&&(t=!0),this.setOpen(!this._isOpen,t)},t.prototype.setOpen=function(t,n){return void 0===n&&(n=!0),d.m._setOpen(this,t,n)},t.prototype.focusFirstDescendant=function(){var t=this.el,n=t.querySelector(g);n?n.focus():t.focus()},t.prototype.focusLastDescendant=function(){var t=this.el,n=Array.from(t.querySelectorAll(g)),e=n.length>0?n[n.length-1]:null;e?e.focus():t.focus()},t.prototype.trapKeyboardFocus=function(t,n){var e=t.target;e&&(this.el.contains(e)?this.lastFocus=e:(this.focusFirstDescendant(),this.lastFocus===n.activeElement&&this.focusLastDescendant()))},t.prototype._setOpen=function(t,n){return void 0===n&&(n=!0),(0,i.mG)(this,void 0,void 0,(function(){return(0,i.Jh)(this,(function(e){switch(e.label){case 0:return!this._isActive()||this.isAnimating||t===this._isOpen?[2,!1]:(this.beforeAnimation(t),[4,this.loadAnimation()]);case 1:return e.sent(),[4,this.startAnimation(t,n)];case 2:return e.sent(),this.afterAnimation(t),[2,!0]}}))}))},t.prototype.loadAnimation=function(){return(0,i.mG)(this,void 0,void 0,(function(){var t,n;return(0,i.Jh)(this,(function(e){switch(e.label){case 0:return t=this.menuInnerEl.offsetWidth,t===this.width&&void 0!==this.animation?[2]:(this.width=t,this.animation&&(this.animation.destroy(),this.animation=void 0),n=this,[4,d.m._createAnimation(this.type,this)]);case 1:return n.animation=e.sent(),r.c.getBoolean("animated",!0)||this.animation.duration(0),this.animation.fill("both"),[2]}}))}))},t.prototype.startAnimation=function(t,n){return(0,i.mG)(this,void 0,void 0,(function(){var e,o,a,s,h;return(0,i.Jh)(this,(function(i){switch(i.label){case 0:return e=!t,o=(0,r.b)(this),a="ios"===o?p:m,s="ios"===o?f:b,h=this.animation.direction(e?"reverse":"normal").easing(e?s:a).onFinish((function(){"reverse"===h.getDirection()&&h.direction("normal")})),n?[4,h.play()]:[3,2];case 1:return i.sent(),[3,3];case 2:h.play({sync:!0}),i.label=3;case 3:return[2]}}))}))},t.prototype._isActive=function(){return!this.disabled&&!this.isPaneVisible},t.prototype.canSwipe=function(){return this.swipeGesture&&!this.isAnimating&&this._isActive()},t.prototype.canStart=function(t){var n=!!document.querySelector("ion-modal.show-modal");return!(n||!this.canSwipe())&&(!!this._isOpen||!d.m._getOpenSync()&&w(window,t.currentX,this.isEndSide,this.maxEdgeStart))},t.prototype.onWillStart=function(){return this.beforeAnimation(!this._isOpen),this.loadAnimation()},t.prototype.onStart=function(){this.isAnimating&&this.animation?this.animation.progressStart(!0,this._isOpen?1:0):(0,h.l)(!1,"isAnimating has to be true")},t.prototype.onMove=function(t){if(this.isAnimating&&this.animation){var n=y(t.deltaX,this._isOpen,this.isEndSide),e=n/this.width;this.animation.progressStep(this._isOpen?1-e:e)}else(0,h.l)(!1,"isAnimating has to be true")},t.prototype.onEnd=function(t){var n=this;if(this.isAnimating&&this.animation){var e=this._isOpen,i=this.isEndSide,o=y(t.deltaX,e,i),r=this.width,s=o/r,d=t.velocityX,u=r/2,l=d>=0&&(d>.2||t.deltaX>u),c=d<=0&&(d<-.2||t.deltaX<-u),p=e?i?l:c:i?c:l,m=!e&&p;e&&!p&&(m=!0),this.lastOnEnd=t.currentTime;var f=p?.001:-.001,b=s<0?.01:s;f+=(0,a.g)([0,0],[.4,0],[.6,1],[1,1],(0,h.j)(0,b,.9999))[0]||0;var g=this._isOpen?!p:p;this.animation.easing("cubic-bezier(0.4, 0.0, 0.6, 1)").onFinish((function(){return n.afterAnimation(m)}),{oneTimeCallback:!0}).progressEnd(g?1:0,this._isOpen?1-f:f,300)}else(0,h.l)(!1,"isAnimating has to be true")},t.prototype.beforeAnimation=function(t){(0,h.l)(!this.isAnimating,"_before() should not be called while animating"),this.el.classList.add(x),this.el.setAttribute("tabindex","0"),this.backdropEl&&this.backdropEl.classList.add(k),this.blocker.block(),this.isAnimating=!0,t?this.ionWillOpen.emit():this.ionWillClose.emit()},t.prototype.afterAnimation=function(t){(0,h.l)(this.isAnimating,"_before() should be called while animating"),this._isOpen=t,this.isAnimating=!1,this._isOpen||this.blocker.unblock(),t?(this.contentEl&&(this.contentEl.classList.add(A),this.contentEl.setAttribute("aria-hidden","true")),this.ionDidOpen.emit(),this.menuInnerEl&&this.focusFirstDescendant(),document.addEventListener("focus",this.handleFocus,!0)):(this.el.classList.remove(x),this.el.removeAttribute("tabindex"),this.contentEl&&(this.contentEl.classList.remove(A),this.contentEl.removeAttribute("aria-hidden")),this.backdropEl&&this.backdropEl.classList.remove(k),this.animation&&this.animation.stop(),this.ionDidClose.emit(),document.removeEventListener("focus",this.handleFocus,!0))},t.prototype.updateState=function(){var t=this._isActive();this.gesture&&this.gesture.enable(t&&this.swipeGesture),!t&&this._isOpen&&this.forceClosing(),this.disabled||d.m._setActiveMenu(this),(0,h.l)(!this.isAnimating,"can not be animating")},t.prototype.forceClosing=function(){(0,h.l)(this._isOpen,"menu cannot be closed"),this.isAnimating=!0;var t=this.animation.direction("reverse");t.play({sync:!0}),this.afterAnimation(!1)},t.prototype.render=function(){var t,n=this,e=this,i=e.isEndSide,a=e.type,s=e.disabled,h=e.isPaneVisible,d=e.inheritedAttributes,u=(0,r.b)(this);return(0,o.h)(o.H,{role:"navigation","aria-label":d["aria-label"]||"menu",class:(t={},t[u]=!0,t["menu-type-"+a]=!0,t["menu-enabled"]=!s,t["menu-side-end"]=i,t["menu-side-start"]=!i,t["menu-pane-visible"]=h,t)},(0,o.h)("div",{class:"menu-inner",part:"container",ref:function(t){return n.menuInnerEl=t}},(0,o.h)("slot",null)),(0,o.h)("ion-backdrop",{ref:function(t){return n.backdropEl=t},class:"menu-backdrop",tappable:!1,stopPropagation:!1,part:"backdrop"}))},Object.defineProperty(t.prototype,"el",{get:function(){return(0,o.i)(this)},enumerable:!1,configurable:!0}),Object.defineProperty(t,"watchers",{get:function(){return{type:["typeChanged"],disabled:["disabledChanged"],side:["sideChanged"],swipeGesture:["swipeGestureChanged"]}},enumerable:!1,configurable:!0}),t}(),y=function(t,n,e){return Math.max(0,n!==e?-t:t)},w=function(t,n,e,i){return e?n>=t.innerWidth-i:n<=i},x="show-menu",k="show-backdrop",A="menu-content-open";v.style={ios:l,md:c};var E=function(t){return(0,i.mG)(void 0,void 0,void 0,(function(){var n,e;return(0,i.Jh)(this,(function(i){switch(i.label){case 0:return[4,d.m.get(t)];case 1:return n=i.sent(),e=n,e?[4,n.isActive()]:[3,3];case 2:e=i.sent(),i.label=3;case 3:return[2,!!e]}}))}))},C=':host{--background:transparent;--color-focused:currentColor;--border-radius:initial;--padding-top:0;--padding-bottom:0;color:var(--color);text-align:center;text-decoration:none;text-overflow:ellipsis;text-transform:none;white-space:nowrap;-webkit-font-kerning:none;font-kerning:none}.button-native{border-radius:var(--border-radius);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:100%;height:100%;border:0;outline:none;background:var(--background);line-height:1;cursor:pointer;overflow:hidden;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:0;-webkit-appearance:none;-moz-appearance:none;appearance:none}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.button-native{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.button-inner{display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:100%;height:100%;z-index:1}ion-icon{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;pointer-events:none}:host(.menu-button-hidden){display:none}:host(.menu-button-disabled){cursor:default;opacity:0.5;pointer-events:none}:host(.ion-focused) .button-native{color:var(--color-focused)}:host(.ion-focused) .button-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}.button-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}@media (any-hover: hover){:host(:hover) .button-native{color:var(--color-hover)}:host(:hover) .button-native::after{background:var(--background-hover);opacity:var(--background-hover-opacity, 0)}}:host(.ion-color) .button-native{color:var(--ion-color-base)}:host(.in-toolbar:not(.in-toolbar-color)){color:var(--ion-toolbar-color, var(--color))}:host{--background-focused:currentColor;--background-focused-opacity:.1;--border-radius:4px;--color:var(--ion-color-primary, #3880ff);--padding-start:5px;--padding-end:5px;height:32px;font-size:31px}:host(.ion-activated){opacity:0.4}@media (any-hover: hover){:host(:hover){opacity:0.6}}',O=':host{--background:transparent;--color-focused:currentColor;--border-radius:initial;--padding-top:0;--padding-bottom:0;color:var(--color);text-align:center;text-decoration:none;text-overflow:ellipsis;text-transform:none;white-space:nowrap;-webkit-font-kerning:none;font-kerning:none}.button-native{border-radius:var(--border-radius);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:100%;height:100%;border:0;outline:none;background:var(--background);line-height:1;cursor:pointer;overflow:hidden;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:0;-webkit-appearance:none;-moz-appearance:none;appearance:none}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.button-native{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.button-inner{display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:100%;height:100%;z-index:1}ion-icon{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;pointer-events:none}:host(.menu-button-hidden){display:none}:host(.menu-button-disabled){cursor:default;opacity:0.5;pointer-events:none}:host(.ion-focused) .button-native{color:var(--color-focused)}:host(.ion-focused) .button-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}.button-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}@media (any-hover: hover){:host(:hover) .button-native{color:var(--color-hover)}:host(:hover) .button-native::after{background:var(--background-hover);opacity:var(--background-hover-opacity, 0)}}:host(.ion-color) .button-native{color:var(--ion-color-base)}:host(.in-toolbar:not(.in-toolbar-color)){color:var(--ion-toolbar-color, var(--color))}:host{--background-focused:currentColor;--background-focused-opacity:.12;--background-hover:currentColor;--background-hover-opacity:.04;--border-radius:50%;--color:initial;--padding-start:8px;--padding-end:8px;width:48px;height:48px;font-size:24px}:host(.ion-color.ion-focused)::after{background:var(--ion-color-base)}@media (any-hover: hover){:host(.ion-color:hover) .button-native::after{background:var(--ion-color-base)}}',S=function(){function t(t){var n=this;(0,o.r)(this,t),this.inheritedAttributes={},this.visible=!1,this.disabled=!1,this.autoHide=!0,this.type="button",this.onClick=function(){return(0,i.mG)(n,void 0,void 0,(function(){return(0,i.Jh)(this,(function(t){return[2,d.m.toggle(this.menu)]}))}))}}return t.prototype.componentWillLoad=function(){this.inheritedAttributes=(0,h.i)(this.el,["aria-label"])},t.prototype.componentDidLoad=function(){this.visibilityChanged()},t.prototype.visibilityChanged=function(){return(0,i.mG)(this,void 0,void 0,(function(){var t;return(0,i.Jh)(this,(function(n){switch(n.label){case 0:return t=this,[4,E(this.menu)];case 1:return t.visible=n.sent(),[2]}}))}))},t.prototype.render=function(){var t,n=this,e=n.color,i=n.disabled,a=n.inheritedAttributes,s=(0,r.b)(this),h=r.c.get("menuIcon","ios"===s?"menu-outline":"menu-sharp"),d=this.autoHide&&!this.visible,l={type:this.type},c=a["aria-label"]||"menu";return(0,o.h)(o.H,{onClick:this.onClick,"aria-disabled":i?"true":null,"aria-hidden":d?"true":null,class:(0,u.c)(e,(t={},t[s]=!0,t["button"]=!0,t["menu-button-hidden"]=d,t["menu-button-disabled"]=i,t["in-toolbar"]=(0,u.h)("ion-toolbar",this.el),t["in-toolbar-color"]=(0,u.h)("ion-toolbar[color]",this.el),t["ion-activatable"]=!0,t["ion-focusable"]=!0,t))},(0,o.h)("button",Object.assign({},l,{disabled:i,class:"button-native",part:"native","aria-label":c}),(0,o.h)("span",{class:"button-inner"},(0,o.h)("slot",null,(0,o.h)("ion-icon",{part:"icon",icon:h,mode:s,lazy:!1,"aria-hidden":"true"}))),"md"===s&&(0,o.h)("ion-ripple-effect",{type:"unbounded"})))},Object.defineProperty(t.prototype,"el",{get:function(){return(0,o.i)(this)},enumerable:!1,configurable:!0}),t}();S.style={ios:C,md:O};var _=":host(.menu-toggle-hidden){display:none}",M=function(){function t(t){var n=this;(0,o.r)(this,t),this.visible=!1,this.autoHide=!0,this.onClick=function(){return d.m.toggle(n.menu)}}return t.prototype.connectedCallback=function(){this.visibilityChanged()},t.prototype.visibilityChanged=function(){return(0,i.mG)(this,void 0,void 0,(function(){var t;return(0,i.Jh)(this,(function(n){switch(n.label){case 0:return t=this,[4,E(this.menu)];case 1:return t.visible=n.sent(),[2]}}))}))},t.prototype.render=function(){var t,n=(0,r.b)(this),e=this.autoHide&&!this.visible;return(0,o.h)(o.H,{onClick:this.onClick,"aria-hidden":e?"true":null,class:(t={},t[n]=!0,t["menu-toggle-hidden"]=e,t)},(0,o.h)("slot",null))},t}();M.style=_},3262:function(t,n,e){e.d(n,{c:function(){return r},g:function(){return s},h:function(){return o},o:function(){return d}});var i=e(655),o=function(t,n){return null!==n.closest(t)},r=function(t,n){var e;return"string"===typeof t&&t.length>0?Object.assign((e={"ion-color":!0},e["ion-color-"+t]=!0,e),n):n},a=function(t){if(void 0!==t){var n=Array.isArray(t)?t:t.split(" ");return n.filter((function(t){return null!=t})).map((function(t){return t.trim()})).filter((function(t){return""!==t}))}return[]},s=function(t){var n={};return a(t).forEach((function(t){return n[t]=!0})),n},h=/^[a-z][a-z0-9+\-.]*:/,d=function(t,n,e,o){return(0,i.mG)(void 0,void 0,void 0,(function(){var r;return(0,i.Jh)(this,(function(i){return null!=t&&"#"!==t[0]&&!h.test(t)&&(r=document.querySelector("ion-router"),r)?(null!=n&&n.preventDefault(),[2,r.push(t,e,o)]):[2,!1]}))}))}}}]);
//# sourceMappingURL=9936-legacy.48080ac6.js.map