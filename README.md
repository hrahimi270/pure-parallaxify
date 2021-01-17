# Pure Parallaxify

**Add depth to your project!**
**pure parallaxify** is a vanilla js plugin that adds parallax effects to elements and backgrounds based on mouse movement.

## Download

You can install this plugin using `npm` or `yarn`:

```
npm install pure-parallaxify
or
yarn add pure-parallaxify
```

Or you can use the CDN in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/pure-parallaxify@0.0.3/dist/pure.parallaxify.js"></script>
```

## Get things going

In order to add a parallax effect to any element you can run `new Parallaxify()` on the wrapper of an element or run it globally on `window`:

```js
// Run it on single element
new Parallaxify({}, "#my-wrapper");

// or globally
new Parallaxify();
```

But, first, you need to add one of these attributes to your tags to detected by Parallaxify:

- `data-parallaxify-range`
- `data-parallaxify-range-x`
- `data-parallaxify-range-y`

```html
<div data-parallaxify-range-x="50" data-parallaxify-range-y="100"></div>
```

## Customize the plugin

**Pure Parallaxify** exposes a variety of options that let you influence how element positioning is achieved, configure filtering of sensor data, configure the movement algorithm, and change general plugin settings.

```js
new Parallaxify({
  // enable parallax effect for horizontal, vertical or both directions
  horizontalParallax: true,
  verticalParallax: true,

  // enable or disable parallax effect for elements or backgrounds
  parallaxBackgrounds: true,
  parallaxElements: true,

  // set which positioning property is to be used
  // options include 'position' or 'transform' using css transformations
  positionProperty: "position",

  // enable for responsive layouts
  // (upon orientation changes or window resizing element positions are reevaluated
  responsive: false,

  // enable or disable mouse or gyroscope data as input for the plugin
  useMouseMove: true,
  useGyroscope: true,

  // use a Low Pass Filter to smooth sensor readings (1 = no filter)
  alphaFilter: 0.9,

  // set which motion type algorithm is to be used
  // options include 'natural', 'linear', 'gaussian', or 'performance'
  motionType: "natural",
  mouseMotionType: "gaussian",

  // define which sensor input has priority over the other
  // options are either 'mouse' or 'gyroscope'
  inputPriority: "mouse",

  // define the delta angle (0 < motionAngle < 90)
  // that is used to render max parallax in this direction
  motionAngleX: 80,
  motionAngleY: 80,

  // enable of adjustment of base position (using a Low Pass Filter)
  // (adapting to device usage while plugin is running)
  adjustBasePosition: true,
  // alpha for Low Pass Filter used to adjust average position
  alphaPosition: 0.05,
});
```

## License

Released under the [MIT license](https://mit-license.org).

## Thanks

I have used Felix Pflaum's [Parallaxify plugin for jQuery](https://github.com/hwthorn/parallaxify). So I did refactored some parts and published it for vanilla js to be used in other frameworks too.
