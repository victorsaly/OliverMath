"use strict";(self["webpackChunkOliverVocabulary"]=self["webpackChunkOliverVocabulary"]||[]).push([[3954],{3954:function(n,t,e){e.r(t),e.d(t,{startFocusVisible:function(){return r}});var o="ion-focused",s="ion-focusable",i=["Tab","ArrowDown","Space","Escape"," ","Shift","Enter","ArrowLeft","ArrowRight","ArrowUp"],r=function(){var n=[],t=!0,e=document,r=function(t){n.forEach((function(n){return n.classList.remove(o)})),t.forEach((function(n){return n.classList.add(o)})),n=t},c=function(){t=!1,r([])};e.addEventListener("keydown",(function(n){t=i.includes(n.key),t||r([])})),e.addEventListener("focusin",(function(n){if(t&&n.composedPath){var e=n.composedPath().filter((function(n){return!!n.classList&&n.classList.contains(s)}));r(e)}})),e.addEventListener("focusout",(function(){e.activeElement===e.body&&r([])})),e.addEventListener("touchstart",c),e.addEventListener("mousedown",c)}}}]);
//# sourceMappingURL=3954.7168a0ed.js.map