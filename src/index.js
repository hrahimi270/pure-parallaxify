import {
  css,
  positionProperty,
  lowPassFilter,
  motionType,
  setBackgroundPosition,
  getBackgroundPosition,
  bindMethods,
} from "./utils";

const SECOND = 1000;
const maxFPS = 30;
const defaults = {
  positionProperty: "position",
  horizontalParallax: true,
  verticalParallax: true,
  parallaxBackgrounds: true,
  parallaxElements: true,
  responsive: false,
  useMouseMove: true,
  useGyroscope: true,
  alphaFilter: 0.9, // use Low Pass Filter to smooth sensor readings (1 = no filter)
  motionType: "natural",
  mouseMotionType: "gaussian",
  inputPriority: "mouse", // define which input device has priority over the other 'mouse' or 'gyroscope'
  motionAngleX: 80, // (0 < motionAngle < 90) delta angle that is used to render max parallax in this direction
  motionAngleY: 80,
  adjustBasePosition: true, // using Low Pass Filter to adjust base position
  alphaPosition: 0.05, // alpha for Low Pass Filter used to adjust average position
};

const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    setTimeout(callback, SECOND / maxFPS);
  };

class Parallaxify {
  constructor(options, containerElementQuery) {
    bindMethods.call(this);

    this.elementQuery = containerElementQuery;
    this.options = Object.assign({}, defaults, options);
    this._defaults = defaults;

    this.init();
  }

  init() {
    this.tilt = {
      beta: 0,
      gamma: 0,
    };

    this._defineElements();
    this._defineGetters();
    this._defineSetters();
    this._detectMobile();
    this._detectMotionType();
    this._detectViewport();
    this._handleWindowResize();

    this.refresh({ firstLoad: true });

    this._startAnimation();
  }

  _defineElements() {
    this.element =
      this.elementQuery !== undefined
        ? document.querySelector(this.elementQuery)
        : document.body;
    this.viewportElement = window;
  }

  _defineGetters() {
    // define getters
    // sensor data and mouse move
    // return value is between -1 and +1

    const motionTypeAdapter = motionType[this.options.motionType];
    const mouseMoveAdapter = motionType[this.options.mouseMotionType];

    this._getMoveHorizontal = () => {
      if (
        this.useMouseMove &&
        this.clientX !== null &&
        this.clientX !== this.oldClientX
      ) {
        return mouseMoveAdapter(
          this.options.motionAngleX *
            (1 - (2 * this.clientX) / this.viewportWidth),
          this.options.motionAngleX
        );
      }

      if (this.useSensor && this.beta !== null && this.gamma !== null) {
        // output = 2*gCDFApprox(tilt/180, 0.75*90/(0.5*this.options.motionAngle))-1;
        // -180 < tilt < 180 => multiply beta x 2

        // tilt.gamma and tilt.beta
        var tilt = this.tilt;

        if (this.viewportLandscape) {
          if (this.viewportFlipped) {
            // landscape flipped
            return motionTypeAdapter(-tilt.beta, this.options.motionAngleX);
          } else {
            // landscape regular
            return motionTypeAdapter(tilt.beta, this.options.motionAngleX);
          }
        } else {
          if (this.viewportFlipped) {
            // portrait flipped
            return motionTypeAdapter(-tilt.gamma, this.options.motionAngleX);
          } else {
            // portrait regular
            return motionTypeAdapter(tilt.gamma, this.options.motionAngleX);
          }
        }
      } else {
        this.useSensor = false;
      }

      return mouseMoveAdapter(
        this.options.motionAngleX *
          (1 - (2 * this.oldClientX) / this.viewportWidth),
        this.options.motionAngleX
      );
    };

    this._getMoveVertical = () => {
      if (
        this.options.useMouseMove &&
        this.clientY !== null &&
        this.clientY !== this.oldClientY
      ) {
        return mouseMoveAdapter(
          this.options.motionAngleY *
            (1 - (2 * this.clientY) / this.viewportHeight),
          this.options.motionAngleY
        );
      }

      if (this.useSensor && this.beta !== null && this.gamma !== null) {
        // tilt.gamma and tilt.beta
        var tilt = this.tilt;

        if (this.viewportLandscape) {
          if (this.viewportFlipped) {
            // landscape flipped
            return motionTypeAdapter(-tilt.gamma, this.options.motionAngleY);
          } else {
            // landscape regular
            return motionTypeAdapter(tilt.gamma, this.options.motionAngleY);
          }
        } else {
          if (this.viewportFlipped) {
            // portrait flipped
            return motionTypeAdapter(-tilt.beta, this.options.motionAngleY);
          } else {
            // portrait regular
            return motionTypeAdapter(tilt.beta, this.options.motionAngleY);
          }
        }
      } else {
        this.useSensor = false;
      }

      return mouseMoveAdapter(
        this.options.motionAngleY *
          (1 - (2 * this.oldClientY) / this.viewportHeight),
        this.options.motionAngleY
      );
    };
  }

  _defineSetters() {
    // define setters
    // set position of elements

    const positionPropertyAdapter =
      positionProperty[this.options.positionProperty];

    // use .setPosition or if not available use .setLeft and .setTop
    this._setPosition =
      positionPropertyAdapter.setPosition ||
      function ($element, left, originalLeft, top, originalTop) {
        if (this.options.horizontalParallax) {
          positionPropertyAdapter.setLeft($element, left, originalLeft);
        }
        if (this.options.verticalParallax) {
          positionPropertyAdapter.setTop($element, top, originalTop);
        }
      };
  }

  refresh(options) {
    if (!options || !options.firstLoad) {
      this._reset();
    }

    this._findElements();
    this._findBackgrounds();

    // Fix for WebKit background rendering bug
    if (options && options.firstLoad && /WebKit/.test(navigator.userAgent)) {
      window.addEventListener("DOMContentLoaded", () => {
        let body = document.body;
        let oldLeft = body.scrollLeft;
        let oldTop = body.scrollTop;

        body.scrollLeft = oldLeft + 1;
        body.scrollTop = oldTop + 1;

        body.scrollLeft = oldLeft;
        body.scrollTop = oldTop;
      });
    }
  }

  _detectViewport() {
    this.viewportWidth = this.viewportElement.innerWidth;
    this.viewportHeight = this.viewportElement.innerHeight;
    if (this.useSensor) {
      this.viewportFlipped = window.orientation === 180;
      this.viewportLandscape = Math.abs(window.orientation) === 90;
    }
  }

  _detectMobile() {
    // see http://detectmobilebrowser.com/mobile
    var browser = navigator.userAgent || navigator.vendor || window.opera;
    this.isMobile =
      /(bb\d+|meego).+mobile|android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|playbook|plucker|pocket|psp|series(4|6)0|silk|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        browser
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        browser.substr(0, 4)
      );
  }

  _detectMotionType() {
    this.useSensor = false;
    this.useSensorWebkit = false;
    this.useSensorMoz = false;
    this.useMouseMove = false;

    if (
      this.options.useGyroscope &&
      (this.isMobile || this.options.inputPriority === "gyroscope")
    ) {
      // Webkit uses deviceorientation (DeviceOrientationEvent)
      this.useSensorWebkit = window.DeviceOrientationEvent !== undefined;
      // Mozilla uses MozOrientation (OrientationEvent)
      this.useSensorMoz = window.OrientationEvent !== undefined;
      this.useSensor = this.useSensorWebkit || this.useSensorMoz;
    }

    if (this.options.useMouseMove && !this.isMobile) {
      this.useMouseMove = true;
    }
  }

  _findElements() {
    this.elements = [];

    if (!this.options.parallaxElements) return;

    var _elements = this.element.querySelectorAll(
      "[data-parallaxify-range],[data-parallaxify-range-x],[data-parallaxify-range-y]"
    );

    Array.from(_elements).forEach((elem) => {
      if (!elem.getAttribute("data-parallaxify-ElementIsActive")) {
        elem.setAttribute("data-parallaxify-ElementIsActive", "");
      } else {
        return;
      }

      // saving/restoring original positions
      if (!elem.getAttribute("data-parralaxify-originalLeft")) {
        elem.setAttribute("data-parallaxify-originalLeft", css(elem, "left"));
        elem.setAttribute("data-parallaxify-originalTop", css(elem, "top"));
      } else {
        css(elem, "left", elem.getAttribute("data-parallaxify-originalLeft"));
        css(elem, "top", elem.getAttribute("data-parallaxify-originalTop"));
      }

      // adding objects to element collection
      var rect = elem.getBoundingClientRect();
      this.elements.push({
        $element: elem,
        originalPositionLeft: elem.offsetLeft,
        originalPositionTop: elem.offsetTop,
        parallaxDistanceX: elem.getAttribute("data-parallaxify-range-x")
          ? elem.getAttribute("data-parallaxify-range-x")
          : elem.getAttribute("data-parallaxify-range")
          ? elem.getAttribute("data-parallaxify-range")
          : 0,
        parallaxDistanceY: elem.getAttribute("data-parallaxify-range-y")
          ? elem.getAttribute("data-parallaxify-range-y")
          : elem.getAttribute("data-parallaxify-range")
          ? elem.getAttribute("data-parallaxify-range")
          : 0,
        width: rect.width,
        height: rect.height,
      });
    });
  }

  _findBackgrounds() {
    var $backgroundElements;

    this.backgrounds = [];

    if (!this.options.parallaxBackgrounds) return;

    $backgroundElements = Array.from(
      this.element.querySelectorAll(
        "[data-parallaxify-background-range],[data-parallaxify-background-range-x],[data-parallaxify-background-range-y]"
      )
    );

    if (
      this.element.getAttribute("data-parallaxify-background-range") ||
      this.element.getAttribute("data-parallaxify-background-range-x") ||
      this.element.getAttribute("data-parallaxify-background-range-y")
    ) {
      $backgroundElements.push(this.element);
    }

    $backgroundElements.forEach((bgElem) => {
      var backgroundPosition = getBackgroundPosition(bgElem);

      if (!bgElem.getAttribute("data-parallaxify-backgroundIsActive")) {
        bgElem.setAttribute("data-parallaxify-backgroundIsActive", "");
      } else if (bgElem.getAttribute("parallaxify-backgroundIsActive")) {
        return;
      }

      // saving/restoring original background positions
      if (!bgElem.getAttribute("data-parralaxify-backgroundOriginalLeft")) {
        bgElem.setAttribute(
          "data-parallaxify-backgroundOriginalLeft",
          backgroundPosition[0]
        );
        bgElem.setAttribute(
          "data-parallaxify-backgroundOriginalTop",
          backgroundPosition[1]
        );
      } else {
        setBackgroundPosition(
          bgElem,
          bgElem.getAttribute("data-parallaxify-backgroundOriginalLeft"),
          bgElem.getAttribute("data-parallaxify-backgroundOriginalTop")
        );
      }

      this.backgrounds.push({
        $element: bgElem,
        originalValueLeft: backgroundPosition[0],
        originalValueTop: backgroundPosition[1],
        originalBackgroundPositionLeft: isNaN(
          parseInt(backgroundPosition[0], 10)
        )
          ? 0
          : parseInt(backgroundPosition[0], 10),
        originalBackgroundPositionTop: isNaN(
          parseInt(backgroundPosition[1], 10)
        )
          ? 0
          : parseInt(backgroundPosition[1], 10),
        originalPositionLeft: bgElem.offsetLeft,
        originalPositionTop: bgElem.offsetTop,
        parallaxDistanceX: bgElem.getAttribute(
          "data-parallaxify-background-range-x"
        )
          ? bgElem.getAttribute("data-parallaxify-background-range-x")
          : bgElem.getAttribute("data-parallaxify-background-range")
          ? bgElem.getAttribute("data-parallaxify-background-range")
          : 0,
        parallaxDistanceY: bgElem.getAttribute(
          "data-parallaxify-background-range-y"
        )
          ? bgElem.getAttribute("data-parallaxify-background-range-y")
          : bgElem.getAttribute("data-parallaxify-background-range")
          ? bgElem.getAttribute("data-parallaxify-background-range")
          : 0,
      });
    });
  }

  _reset() {
    let originalPositionLeft, originalPositionTop;

    this.elements.forEach((element) => {
      originalPositionLeft = element.$element.getAttribute(
        "data-parallaxify-originalLeft"
      );
      originalPositionTop = element.$element.getAttribute(
        "data-parallaxify-originalTop"
      );

      this._setPosition(
        element.$element,
        originalPositionLeft,
        originalPositionLeft,
        originalPositionTop,
        originalPositionTop
      );

      element.$element.setAttribute("data-parallaxify-originalLeft", null);
      element.$element.setAttribute("data-parallaxify-originalLeft", null);
      element.$element.setAttribute("data-parallaxify-elementIsActive", null);
      element.$element.setAttribute(
        "data-parallaxify-backgroundIsActive",
        null
      );
    });

    this.backgrounds.forEach((background) => {
      background.$element.setAttribute(
        "data-parallaxify-backgroundOriginalLeft",
        null
      );
      background.$element.setAttribute(
        "data-parallaxify-backgroundOriginalTop",
        null
      );
      background.$element.setAttribute(
        "data-parallaxify-backgroundIsActive",
        null
      );

      setBackgroundPosition(
        background.$element,
        background.originalValueLeft,
        background.originalValueTop
      );
    });
  }

  destroy() {
    this._reset();

    if (this.useMouseMove) {
      this.viewportElement.removeEventListener(
        "mousemove",
        this._handleMouseMove
      );
    }

    if (this.useSensorWebkit) {
      window.removeEventListener(
        "deviceorientation",
        this._handleSensorWebkit,
        false
      );
    }

    if (this.useSensorMoz) {
      window.removeEventListener(
        "MozOrientation",
        this._handleSensorMoz,
        false
      );
    }

    window.removeEventListener("DOMContentLoaded", this.refresh);
    window.removeEventListener("resize", this.refresh);
    window.removeEventListener("orientationchange", this.refresh);
  }

  _processSensorData() {
    if (!this.useSensor) return;

    // beta is device pitch (moving up - down)
    // values are from -90 to 90
    // gamma is device roll (moving left right)
    // values are from -180 to 180

    var beta = this.beta,
      gamma = this.gamma,
      deltaBeta = 0,
      deltaGamma = 0;

    // counteract some bugs on Android where return values are 270 upon flipping the device
    if (beta > 90) beta = beta - 180;
    if (gamma > 180) gamma = gamma - 360;

    if (this.initialBeta === undefined && beta !== null) {
      this.initialBeta = beta;
      if (this.useSensor && this.options.inputPriority === "gyroscope") {
        this.useMouseMove = false;
        if (this.useMouseMove)
          this.viewportElement.removeEventListener("mousemove", this.name);
      }
    }

    if (this.initialGamma === undefined && gamma !== null) {
      this.initialGamma = gamma;
      if (this.useSensor && this.options.inputPriority === "gyroscope") {
        this.useMouseMove = false;
        if (this.useMouseMove)
          this.viewportElement.removeEventListener("mousemove", this.name);
      }
    }

    if (
      this.options.adjustBasePosition &&
      this.initialGamma !== undefined &&
      this.initialBeta !== undefined
    ) {
      // adjust positions (accepting position out of range to smooth laying device upside down)
      if (gamma - this.initialGamma < -180) {
        this.initialGamma = lowPassFilter(
          gamma + 360,
          this.initialGamma,
          this.options.alphaPosition
        );
      } else if (gamma - this.initialGamma > 180) {
        this.initialGamma = lowPassFilter(
          gamma - 360,
          this.initialGamma,
          this.options.alphaPosition
        );
      } else {
        this.initialGamma = lowPassFilter(
          gamma,
          this.initialGamma,
          this.options.alphaPosition
        );
      }

      if (beta - this.initialBeta < -90) {
        this.initialBeta = lowPassFilter(
          beta + 180,
          this.initialBeta,
          this.options.alphaPosition
        );
      } else if (beta - this.initialBeta > 90) {
        this.initialBeta = lowPassFilter(
          beta - 180,
          this.initialBeta,
          this.options.alphaPosition
        );
      } else {
        this.initialBeta = lowPassFilter(
          beta,
          this.initialBeta,
          this.options.alphaPosition
        );
      }
    }

    deltaBeta = this.initialBeta !== undefined ? beta - this.initialBeta : beta;
    deltaGamma =
      this.initialGamma !== undefined ? gamma - this.initialGamma : gamma;

    if (deltaBeta > 100) {
      deltaBeta = deltaBeta - 180;
    } else if (deltaBeta < -100) {
      deltaBeta = deltaBeta + 180;
    }

    if (deltaGamma > 200) {
      deltaGamma = deltaGamma - 360;
    } else if (deltaGamma < -200) {
      deltaGamma = deltaGamma + 360;
    }

    // use low pass filter on signal
    deltaBeta = lowPassFilter(
      deltaBeta,
      this.tilt.beta,
      this.options.alphaFilter
    );
    deltaGamma = lowPassFilter(
      deltaGamma,
      this.tilt.gamma,
      this.options.alphaFilter
    );

    this.tilt.beta = deltaBeta;
    this.tilt.gamma = deltaGamma;
  }

  _repositionElements() {
    let moveHorizontal = this._getMoveHorizontal(),
      moveVertical = this._getMoveVertical(),
      bgLeft,
      bgTop,
      newPositionLeft,
      newPositionTop;

    if (
      this.currentMoveHorizontal === moveHorizontal &&
      this.currentMoveVertical === moveVertical &&
      this.currentWidth === this.viewportWidth &&
      this.currentHeight === this.viewportHeight
    ) {
      return;
    } else {
      this.currentMoveHorizontal = moveHorizontal;
      this.currentMoveVertical = moveVertical;
      this.currentWidth = this.viewportWidth;
      this.currentHeight = this.viewportHeight;
    }

    // Reposition elements
    this.elements.forEach((element) => {
      // New positions
      if (this.options.horizontalParallax) {
        newPositionLeft =
          Math.floor((moveHorizontal * element.parallaxDistanceX) / 2) +
          element.originalPositionLeft;
      } else {
        newPositionLeft = element.originalPositionLeft;
      }

      if (this.options.verticalParallax) {
        newPositionTop =
          Math.floor((moveVertical * element.parallaxDistanceY) / 2) +
          element.originalPositionTop;
      } else {
        newPositionTop = element.originalPositionTop;
      }

      this._setPosition(
        element.$element,
        newPositionLeft,
        element.originalPositionLeft,
        newPositionTop,
        element.originalPositionTop
      );
    });

    // Reposition backgrounds
    this.backgrounds.forEach((background) => {
      bgLeft = this.options.horizontalParallax
        ? Math.floor((moveHorizontal * background.parallaxDistanceX) / 2) +
          background.originalBackgroundPositionLeft +
          "px"
        : background.originalValueLeft;
      bgTop = this.options.verticalParallax
        ? Math.floor((moveVertical * background.parallaxDistanceY) / 2) +
          background.originalBackgroundPositionTop +
          "px"
        : background.originalValueTop;

      setBackgroundPosition(background.$element, bgLeft, bgTop);
    });
  }

  _handleWindowResize() {
    window.addEventListener("resize", () => {
      this._detectViewport();

      if (this.options.responsive) {
        this.refresh();
      }
    });

    window.addEventListener("orientationchange", () => {
      this._detectViewport();

      if (this.options.responsive) {
        this.refresh();
      }
    });
  }

  _handleSensorWebkit() {
    // gamma is device roll (moving left right)
    // values are from -180 to 180
    this.gamma = e.gamma;

    // beta is device pitch (moving up - down)
    // values are from -90 to 90
    this.beta = e.beta;

    this.requestTick();
  }

  _handleSensorMoz() {
    // x is device roll (moving left right)
    // values are from -1 to 1
    this.gamma = e.x * 180;

    // y is device pitch (moving up - down)
    // values are from +1 to -1
    this.beta = e.y * -90;

    this.requestTick();
  }

  _handleMouseMove(e) {
    this.oldClientX = this.clientX;
    this.oldClientY = this.clientY;
    e.clientX !== undefined
      ? (this.clientX = e.clientX)
      : (this.clientX = e.pageX);
    e.clientY !== undefined
      ? (this.clientY = e.clientY)
      : (this.clientY = e.pageY);

    this.requestTick();
  }

  _startAnimation() {
    this.ticking = false;

    this.beta = 0;
    this.gamma = 0;
    this.clientX = this.oldClientX = Math.round(this.viewportWidth / 2);
    this.clientY = this.oldClientY = Math.round(this.viewportHeight / 2);

    // bind sensor events to updates
    if (this.useSensorWebkit) {
      window.addEventListener(
        "deviceorientation",
        this._handleSensorWebkit,
        false
      );
    } else if (this.useSensorMoz) {
      window.addEventListener("MozOrientation", this._handleSensorMoz, false);
    }

    // bind mouse move event
    if (this.useMouseMove) {
      window.addEventListener("mousemove", this._handleMouseMove);
    }

    this.requestTick();
  }

  update() {
    this._processSensorData();
    this._repositionElements();
    this.ticking = false;
  }

  requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(this.update);
      this.ticking = true;
    }
  }
}

window.Parallaxify = Parallaxify;
