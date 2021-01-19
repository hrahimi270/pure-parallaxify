// jQUery like css function
export const css = (el, rule, value) => {
  if (!value) {
    return getComputedStyle(el)[rule];
  }

  return (el.style[rule] = value);
};

// Returns a function which adds a vendor prefix to any CSS property name
export const vendorPrefix = () => {
  var prefixes = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
    style = document.documentElement.style,
    prefix = "",
    prop;

  for (prop in style) {
    if (prefixes.test(prop)) {
      prefix = prop.match(prefixes)[0];
      break;
    }
  }

  if ("WebkitOpacity" in style) {
    prefix = "Webkit";
  }
  if ("KhtmlOpacity" in style) {
    prefix = "Khtml";
  }

  return function (property) {
    return (
      prefix +
      (prefix.length > 0
        ? property.charAt(0).toUpperCase() + property.slice(1)
        : property)
    );
  };
};

// Options for positioning of elements
// e.g. using css positioning with top and left
// or using css transforms
const prefixedTransform = vendorPrefix()("transform");
export const positionProperty = {
  position: {
    setLeft: function (el, left) {
      css(el, "left", `${left}px`);
    },
    setTop: function (el, top) {
      css(el, "top", `${top}px`);
    },
  },
  transform: {
    setPosition: function (element, left, originalLeft, top, originalTop) {
      css(
        element,
        prefixedTransform,
        `translate3d(${left - originalLeft}px, ${top - originalTop}px, 0)`
      );
    },
  },
};

// approximation of Gaussian cumulative distribution function
// with parameter a to influence standard deviation sigma
export const gCDFApprox = (x, a) => {
  return 1 / (1 + Math.exp(-(0.07056 * a * (x ^ 3)) - 1.5976 * a * x));
};

// low pass filter for motion events (http://en.wikipedia.org/wiki/Low-pass_filter)
export const lowPassFilter = (curSignal, prevSignal, alpha) => {
  if (prevSignal === null) return curSignal;
  if (typeof alpha === "undefined") alpha = 0.5;
  return alpha * curSignal + (1 - alpha) * prevSignal;
};

// Options for calculating the parallax effect
// naturally a tangent is used, alternatively a Gaussian cumulative distribution function can be used
const factorCache = []; // cached variable to speed up motionTypes
export const motionType = {
  linear: function (delta, deltaMax) {
    if (delta <= -deltaMax) return 1;
    if (delta >= deltaMax) return -1;
    return -delta / deltaMax;
  },
  natural: function (delta, deltaMax) {
    if (delta <= -deltaMax) return 1;
    if (delta >= deltaMax) return -1;
    if (factorCache["n" + deltaMax] === undefined)
      factorCache["n" + deltaMax] = Math.tan(deltaMax * 0.01745);
    return -Math.tan(delta * 0.01745) / factorCache["n" + deltaMax];
  },
  performance: function (delta, deltaMax) {
    if (delta <= -deltaMax) return 1;
    if (delta >= deltaMax) return -1;
    if (factorCache["p" + deltaMax] === undefined)
      factorCache["p" + deltaMax] =
        deltaMax / 90 + 4.2 * Math.pow(deltaMax / 90, 7);
    return (
      -(delta / 90 + 4.2 * Math.pow(delta / 90, 7)) /
      factorCache["p" + deltaMax]
    );
  },
  gaussian: function (delta, deltaMax) {
    return 1 - 2 * gCDFApprox(delta / 90, 135 / deltaMax);
  },
};

// set and get background position of element
const supportsBackgroundPositionXY =
  css(document.documentElement, "backgroundPositionX") !== undefined;
export const setBackgroundPosition = (el, x, y) => {
  if (supportsBackgroundPositionXY) {
    css(el, "backgroundPositionX", x);
    css(el, "backgroundPositionY", y);
  } else {
    css(el, "backgroundPosition", `${x} ${y}`);
  }
};
export const getBackgroundPosition = (el) => {
  if (supportsBackgroundPositionXY) {
    return [css(el, "backgroundPositionX"), css(el, "backgroundPositionY")];
  } else {
    return css(el, "backgroundPosition").split(" ");
  }
};

// bind methods of a class to the 'this' keyword
export function bindMethods() {
  Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((key) => {
    if (this[key] instanceof Function && key !== "constructor")
      this[key] = this[key].bind(this);
  });
}
