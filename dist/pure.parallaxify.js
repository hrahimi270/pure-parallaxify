parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"FOZT":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.bindMethods=d,exports.getBackgroundPosition=exports.setBackgroundPosition=exports.motionType=exports.lowPassFilter=exports.gCDFApprox=exports.positionProperty=exports.vendorPrefix=exports.css=void 0;var t=function(t,o,n){return n?t.style[o]=n:getComputedStyle(t)[o]};exports.css=t;var o=function(){var t,o=/^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,n=document.documentElement.style,r="";for(t in n)if(o.test(t)){r=t.match(o)[0];break}return"WebkitOpacity"in n&&(r="Webkit"),"KhtmlOpacity"in n&&(r="Khtml"),function(t){return r+(r.length>0?t.charAt(0).toUpperCase()+t.slice(1):t)}};exports.vendorPrefix=o;var n=o()("transform"),r={position:{setLeft:function(o,n){t(o,"left","".concat(n,"px"))},setTop:function(o,n){t(o,"top","".concat(n,"px"))}},transform:{setPosition:function(o,r,e,i,s){t(o,n,"translate3d(".concat(r-e,"px, ").concat(i-s,"px, 0)"))}}};exports.positionProperty=r;var e=function(t,o){return 1/(1+Math.exp(-.07056*o*(3^t)-1.5976*o*t))};exports.gCDFApprox=e;var i=function(t,o,n){return null===o?t:(void 0===n&&(n=.5),n*t+(1-n)*o)};exports.lowPassFilter=i;var s=[],c={linear:function(t,o){return t<=-o?1:t>=o?-1:-t/o},natural:function(t,o){return t<=-o?1:t>=o?-1:(void 0===s["n"+o]&&(s["n"+o]=Math.tan(.01745*o)),-Math.tan(.01745*t)/s["n"+o])},performance:function(t,o){return t<=-o?1:t>=o?-1:(void 0===s["p"+o]&&(s["p"+o]=o/90+4.2*Math.pow(o/90,7)),-(t/90+4.2*Math.pow(t/90,7))/s["p"+o])},gaussian:function(t,o){return 1-2*e(t/90,135/o)}};exports.motionType=c;var a=void 0!==t(document.documentElement,"backgroundPositionX"),p=function(o,n,r){a?(t(o,"backgroundPositionX",n),t(o,"backgroundPositionY",r)):t(o,"backgroundPosition","".concat(n," ").concat(r))};exports.setBackgroundPosition=p;var u=function(o){return a?[t(o,"backgroundPositionX"),t(o,"backgroundPositionY")]:t(o,"backgroundPosition").split(" ")};function d(){var t=this;Object.getOwnPropertyNames(Object.getPrototypeOf(this)).map(function(o){t[o]instanceof Function&&"constructor"!==o&&(t[o]=t[o].bind(t))})}exports.getBackgroundPosition=u;
},{}],"Focm":[function(require,module,exports) {
"use strict";var t=require("./utils");function i(t,i){if(!(t instanceof i))throw new TypeError("Cannot call a class as a function")}function a(t,i){for(var e=0;e<i.length;e++){var a=i[e];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}function o(t,i,e){return i&&a(t.prototype,i),e&&a(t,e),t}var n=1e3,s=30,r={positionProperty:"position",horizontalParallax:!0,verticalParallax:!0,parallaxBackgrounds:!0,parallaxElements:!0,responsive:!1,useMouseMove:!0,useGyroscope:!0,alphaFilter:.9,motionType:"natural",mouseMotionType:"gaussian",inputPriority:"mouse",motionAngleX:80,motionAngleY:80,adjustBasePosition:!0,alphaPosition:.05},l=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){setTimeout(t,n/s)},u=function(){function a(e,o){i(this,a),t.bindMethods.call(this),this.elementQuery=o,this.options=Object.assign({},r,e),this._defaults=r,this.init()}return o(a,[{key:"init",value:function(){this.tilt={beta:0,gamma:0},this._defineElements(),this._defineGetters(),this._defineSetters(),this._detectMobile(),this._detectMotionType(),this._detectViewport(),this._handleWindowResize(),this.refresh({firstLoad:!0}),this._startAnimation()}},{key:"_defineElements",value:function(){this.element=void 0!==this.elementQuery?document.querySelector(this.elementQuery):document.body,this.viewportElement=window}},{key:"_defineGetters",value:function(){var i=this,e=t.motionType[this.options.motionType],a=t.motionType[this.options.mouseMotionType];this._getMoveHorizontal=function(){if(i.useMouseMove&&null!==i.clientX&&i.clientX!==i.oldClientX)return a(i.options.motionAngleX*(1-2*i.clientX/i.viewportWidth),i.options.motionAngleX);if(i.useSensor&&null!==i.beta&&null!==i.gamma){var t=i.tilt;return i.viewportLandscape?i.viewportFlipped?e(-t.beta,i.options.motionAngleX):e(t.beta,i.options.motionAngleX):i.viewportFlipped?e(-t.gamma,i.options.motionAngleX):e(t.gamma,i.options.motionAngleX)}return i.useSensor=!1,a(i.options.motionAngleX*(1-2*i.oldClientX/i.viewportWidth),i.options.motionAngleX)},this._getMoveVertical=function(){if(i.options.useMouseMove&&null!==i.clientY&&i.clientY!==i.oldClientY)return a(i.options.motionAngleY*(1-2*i.clientY/i.viewportHeight),i.options.motionAngleY);if(i.useSensor&&null!==i.beta&&null!==i.gamma){var t=i.tilt;return i.viewportLandscape?i.viewportFlipped?e(-t.gamma,i.options.motionAngleY):e(t.gamma,i.options.motionAngleY):i.viewportFlipped?e(-t.beta,i.options.motionAngleY):e(t.beta,i.options.motionAngleY)}return i.useSensor=!1,a(i.options.motionAngleY*(1-2*i.oldClientY/i.viewportHeight),i.options.motionAngleY)}}},{key:"_defineSetters",value:function(){var i=t.positionProperty[this.options.positionProperty];this._setPosition=i.setPosition||function(t,e,a,o,n){this.options.horizontalParallax&&i.setLeft(t,e,a),this.options.verticalParallax&&i.setTop(t,o,n)}}},{key:"refresh",value:function(t){t&&t.firstLoad||this._reset(),this._findElements(),this._findBackgrounds(),t&&t.firstLoad&&/WebKit/.test(navigator.userAgent)&&window.addEventListener("DOMContentLoaded",function(){var t=document.body,i=t.scrollLeft,e=t.scrollTop;t.scrollLeft=i+1,t.scrollTop=e+1,t.scrollLeft=i,t.scrollTop=e})}},{key:"_detectViewport",value:function(){this.viewportWidth=this.viewportElement.innerWidth,this.viewportHeight=this.viewportElement.innerHeight,this.useSensor&&(this.viewportFlipped=180===window.orientation,this.viewportLandscape=90===Math.abs(window.orientation))}},{key:"_detectMobile",value:function(){var t=navigator.userAgent||navigator.vendor||window.opera;this.isMobile=/(bb\d+|meego).+mobile|android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|playbook|plucker|pocket|psp|series(4|6)0|silk|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4))}},{key:"_detectMotionType",value:function(){this.useSensor=!1,this.useSensorWebkit=!1,this.useSensorMoz=!1,this.useMouseMove=!1,this.options.useGyroscope&&(this.isMobile||"gyroscope"===this.options.inputPriority)&&(this.useSensorWebkit=void 0!==window.DeviceOrientationEvent,this.useSensorMoz=void 0!==window.OrientationEvent,this.useSensor=this.useSensorWebkit||this.useSensorMoz),this.options.useMouseMove&&!this.isMobile&&(this.useMouseMove=!0)}},{key:"_findElements",value:function(){var i=this;if(this.elements=[],this.options.parallaxElements){var e=this.element.querySelectorAll("[data-parallaxify-range],[data-parallaxify-range-x],[data-parallaxify-range-y]");Array.from(e).forEach(function(e){if(!e.getAttribute("data-parallaxify-ElementIsActive")){e.setAttribute("data-parallaxify-ElementIsActive",""),e.getAttribute("data-parralaxify-originalLeft")?((0,t.css)(e,"left",e.getAttribute("data-parallaxify-originalLeft")),(0,t.css)(e,"top",e.getAttribute("data-parallaxify-originalTop"))):(e.setAttribute("data-parallaxify-originalLeft",(0,t.css)(e,"left")),e.setAttribute("data-parallaxify-originalTop",(0,t.css)(e,"top")));var a=e.getBoundingClientRect();i.elements.push({$element:e,originalPositionLeft:e.offsetLeft,originalPositionTop:e.offsetTop,parallaxDistanceX:e.getAttribute("data-parallaxify-range-x")?e.getAttribute("data-parallaxify-range-x"):e.getAttribute("data-parallaxify-range")?e.getAttribute("data-parallaxify-range"):0,parallaxDistanceY:e.getAttribute("data-parallaxify-range-y")?e.getAttribute("data-parallaxify-range-y"):e.getAttribute("data-parallaxify-range")?e.getAttribute("data-parallaxify-range"):0,width:a.width,height:a.height})}})}}},{key:"_findBackgrounds",value:function(){var i,e=this;this.backgrounds=[],this.options.parallaxBackgrounds&&(i=Array.from(this.element.querySelectorAll("[data-parallaxify-background-range],[data-parallaxify-background-range-x],[data-parallaxify-background-range-y]")),(this.element.getAttribute("data-parallaxify-background-range")||this.element.getAttribute("data-parallaxify-background-range-x")||this.element.getAttribute("data-parallaxify-background-range-y"))&&i.push(this.element),i.forEach(function(i){var a=(0,t.getBackgroundPosition)(i);if(i.getAttribute("data-parallaxify-backgroundIsActive")){if(i.getAttribute("parallaxify-backgroundIsActive"))return}else i.setAttribute("data-parallaxify-backgroundIsActive","");i.getAttribute("data-parralaxify-backgroundOriginalLeft")?(0,t.setBackgroundPosition)(i,i.getAttribute("data-parallaxify-backgroundOriginalLeft"),i.getAttribute("data-parallaxify-backgroundOriginalTop")):(i.setAttribute("data-parallaxify-backgroundOriginalLeft",a[0]),i.setAttribute("data-parallaxify-backgroundOriginalTop",a[1])),e.backgrounds.push({$element:i,originalValueLeft:a[0],originalValueTop:a[1],originalBackgroundPositionLeft:isNaN(parseInt(a[0],10))?0:parseInt(a[0],10),originalBackgroundPositionTop:isNaN(parseInt(a[1],10))?0:parseInt(a[1],10),originalPositionLeft:i.offsetLeft,originalPositionTop:i.offsetTop,parallaxDistanceX:i.getAttribute("data-parallaxify-background-range-x")?i.getAttribute("data-parallaxify-background-range-x"):i.getAttribute("data-parallaxify-background-range")?i.getAttribute("data-parallaxify-background-range"):0,parallaxDistanceY:i.getAttribute("data-parallaxify-background-range-y")?i.getAttribute("data-parallaxify-background-range-y"):i.getAttribute("data-parallaxify-background-range")?i.getAttribute("data-parallaxify-background-range"):0})}))}},{key:"_reset",value:function(){var i,e,a=this;this.elements.forEach(function(t){i=t.$element.getAttribute("data-parallaxify-originalLeft"),e=t.$element.getAttribute("data-parallaxify-originalTop"),a._setPosition(t.$element,i,i,e,e),t.$element.setAttribute("data-parallaxify-originalLeft",null),t.$element.setAttribute("data-parallaxify-originalLeft",null),t.$element.setAttribute("data-parallaxify-elementIsActive",null),t.$element.setAttribute("data-parallaxify-backgroundIsActive",null)}),this.backgrounds.forEach(function(i){i.$element.setAttribute("data-parallaxify-backgroundOriginalLeft",null),i.$element.setAttribute("data-parallaxify-backgroundOriginalTop",null),i.$element.setAttribute("data-parallaxify-backgroundIsActive",null),(0,t.setBackgroundPosition)(i.$element,i.originalValueLeft,i.originalValueTop)})}},{key:"destroy",value:function(){this._reset(),this.useMouseMove&&this.viewportElement.removeEventListener("mousemove",this._handleMouseMove),this.useSensorWebkit&&window.removeEventListener("deviceorientation",this._handleSensorWebkit,!1),this.useSensorMoz&&window.removeEventListener("MozOrientation",this._handleSensorMoz,!1),window.removeEventListener("DOMContentLoaded",this.refresh),window.removeEventListener("resize",this.refresh),window.removeEventListener("orientationchange",this.refresh)}},{key:"_processSensorData",value:function(){if(this.useSensor){var i=this.beta,e=this.gamma,a=0,o=0;i>90&&(i-=180),e>180&&(e-=360),void 0===this.initialBeta&&null!==i&&(this.initialBeta=i,this.useSensor&&"gyroscope"===this.options.inputPriority&&(this.useMouseMove=!1,this.useMouseMove&&this.viewportElement.removeEventListener("mousemove",this.name))),void 0===this.initialGamma&&null!==e&&(this.initialGamma=e,this.useSensor&&"gyroscope"===this.options.inputPriority&&(this.useMouseMove=!1,this.useMouseMove&&this.viewportElement.removeEventListener("mousemove",this.name))),this.options.adjustBasePosition&&void 0!==this.initialGamma&&void 0!==this.initialBeta&&(e-this.initialGamma<-180?this.initialGamma=(0,t.lowPassFilter)(e+360,this.initialGamma,this.options.alphaPosition):e-this.initialGamma>180?this.initialGamma=(0,t.lowPassFilter)(e-360,this.initialGamma,this.options.alphaPosition):this.initialGamma=(0,t.lowPassFilter)(e,this.initialGamma,this.options.alphaPosition),i-this.initialBeta<-90?this.initialBeta=(0,t.lowPassFilter)(i+180,this.initialBeta,this.options.alphaPosition):i-this.initialBeta>90?this.initialBeta=(0,t.lowPassFilter)(i-180,this.initialBeta,this.options.alphaPosition):this.initialBeta=(0,t.lowPassFilter)(i,this.initialBeta,this.options.alphaPosition)),(a=void 0!==this.initialBeta?i-this.initialBeta:i)>100?a-=180:a<-100&&(a+=180),(o=void 0!==this.initialGamma?e-this.initialGamma:e)>200?o-=360:o<-200&&(o+=360),a=(0,t.lowPassFilter)(a,this.tilt.beta,this.options.alphaFilter),o=(0,t.lowPassFilter)(o,this.tilt.gamma,this.options.alphaFilter),this.tilt.beta=a,this.tilt.gamma=o}}},{key:"_repositionElements",value:function(){var i,e,a,o,n=this,s=this._getMoveHorizontal(),r=this._getMoveVertical();this.currentMoveHorizontal===s&&this.currentMoveVertical===r&&this.currentWidth===this.viewportWidth&&this.currentHeight===this.viewportHeight||(this.currentMoveHorizontal=s,this.currentMoveVertical=r,this.currentWidth=this.viewportWidth,this.currentHeight=this.viewportHeight,this.elements.forEach(function(t){a=n.options.horizontalParallax?Math.floor(s*t.parallaxDistanceX/2)+t.originalPositionLeft:t.originalPositionLeft,o=n.options.verticalParallax?Math.floor(r*t.parallaxDistanceY/2)+t.originalPositionTop:t.originalPositionTop,n._setPosition(t.$element,a,t.originalPositionLeft,o,t.originalPositionTop)}),this.backgrounds.forEach(function(a){i=n.options.horizontalParallax?Math.floor(s*a.parallaxDistanceX/2)+a.originalBackgroundPositionLeft+"px":a.originalValueLeft,e=n.options.verticalParallax?Math.floor(r*a.parallaxDistanceY/2)+a.originalBackgroundPositionTop+"px":a.originalValueTop,(0,t.setBackgroundPosition)(a.$element,i,e)}))}},{key:"_handleWindowResize",value:function(){var t=this;window.addEventListener("resize",function(){t._detectViewport(),t.options.responsive&&t.refresh()}),window.addEventListener("orientationchange",function(){t._detectViewport(),t.options.responsive&&t.refresh()})}},{key:"_handleSensorWebkit",value:function(){this.gamma=e.gamma,this.beta=e.beta,this.requestTick()}},{key:"_handleSensorMoz",value:function(){this.gamma=180*e.x,this.beta=-90*e.y,this.requestTick()}},{key:"_handleMouseMove",value:function(t){this.oldClientX=this.clientX,this.oldClientY=this.clientY,void 0!==t.clientX?this.clientX=t.clientX:this.clientX=t.pageX,void 0!==t.clientY?this.clientY=t.clientY:this.clientY=t.pageY,this.requestTick()}},{key:"_startAnimation",value:function(){this.ticking=!1,this.beta=0,this.gamma=0,this.clientX=this.oldClientX=Math.round(this.viewportWidth/2),this.clientY=this.oldClientY=Math.round(this.viewportHeight/2),this.useSensorWebkit?window.addEventListener("deviceorientation",this._handleSensorWebkit,!1):this.useSensorMoz&&window.addEventListener("MozOrientation",this._handleSensorMoz,!1),this.useMouseMove&&window.addEventListener("mousemove",this._handleMouseMove),this.requestTick()}},{key:"update",value:function(){this._processSensorData(),this._repositionElements(),this.ticking=!1}},{key:"requestTick",value:function(){this.ticking||(l(this.update),this.ticking=!0)}}]),a}();window.Parallaxify=u;
},{"./utils":"FOZT"}]},{},["Focm"], null)