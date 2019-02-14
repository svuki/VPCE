// constructor:
/** Constructor to make objects that represent colors in the HSL format. HSL
 * represents colors as three compoents: hue, saturation, and lightness.
 * To get a feel for this colors, look at a HSL color picker. Loosely,
 *  hue represents the 'color' of the Color (red, blue, green, etc.).
 * Saturation represnts the purity of a color (ie how much 'pigment' there is in it
 * vs filler), and Lightness represnts how far between black and white the color is.
 *
 * @class Color
 * @constructor
 * @param {Number in [0, 360]} hue        The hue value.
 * @param {Number in [0, 100]} saturation The saturation value.
 * @param {Number in [0, 100]} lightness  The lightness value.
 */
function Color(hue, saturation, lightness) {
  // public attributes
  this.hue = hue;
  this.saturation = saturation;
  this.lightness = lightness;
  // methods

  /** Produce a new color by adding some quantity of lightness.
   *
   * @method plusLightness
   * @param {Number} incrementLightness How much to add.
   * @return {Color}
   */
  this.plusLightness = function(incrementLightness) {
    let incremented = incrementLightness + this.lightness;
    let lightness = Math.min(100, Math.max(0, incremented));
    return new Color(this.hue, this.saturation, lightness);
  };
  /** Convert the color to a string usable by the canvas API.
   * For HSL strings, this is a string of the format
   * 'hsl(hue, saturation% ,lightness%)'
   * @method toString
   * @return {String}
   */
  this.toString = function() {
    let hVal = Math.round(this.hue);
    let sVal = Math.round(this.saturation);
    let lVal = Math.round(this.lightness);
    return `hsl(${hVal}, ${sVal}%, ${lVal}%)`;
  };
  /** Produce a new color that is the greyscale equivalent of this color.
   * @method toGrey
   * @return {Color}
   */
  this.toGrey = function() {
    return new Color(0, 0, this.lightness);
  };
}

//well known colors
const colors = {
    RED: new Color(0, 100, 50),
    GREEN: new Color(120, 100, 40),
    BLUE: new Color(240, 100, 50)
}

//functions for generating random colors
function randInt(lim) {
  return Math.round(Math.random() * lim);
}
function randIntIn(low, high) {
  return low + randInt(high - low);
}
/** Generate a random value of gray.
 * @return {Color}
 */
function randomGreyscaleColor() {
  let lightness = randInt(100);
  let color = new Color(0, 0, lightness);
  return color;
}

/**
 * Generate a random color.
 * @return {Color}
 */
function randomColor() {
  let hue = randInt(360);
  let saturation = randInt(100);
  let lightness = randInt(100);
  return new Color(hue, saturation, lightness);
}

/** 
 * Generate a random color within a given set of parameters.
 *
 * The parameters form upper and lower bounds for the components
 * of a hsl color. 
 *
 * @param {Number} hueLow      Lower bound for the hue.
 * @param {Number} hueHigh     Upper bound for the hue.
 * @param {Number} satLow      Lower bound for the saturation.
 * @param {Number} satHigh     Upper bound for the saturation.
 * @param {Number} lightLow    Lower bound for the lightness.
 * @param {Number} lightHight  Upper bound for the lightness.
 * @return {Color}
 */
function randomColorIn(hueLow, hueHigh, satLow, satHigh, lightLow, lightHigh) {
    // the hue is conceptually a circle from 0 -> 360 where 0 and 360 are both red
    // with the modulo 360, we can specify ranges that 'wrap around'.
  let hue = randIntIn(hueLow, hueHigh) % 360;
  let sat = randIntIn(satLow, satHigh);
  let light = randIntIn(lightLow, lightHigh);
  return new Color(hue, sat, light);
}

function randomValueOfColorBetween(hueLow, hueHigh) {
    return randomColorIn(hueLow, hueHigh, 0, 100, 0, 100);
}
    
export {Color,
	randomGreyscaleColor,
	randomColor,
	randomColorIn,
	randomValueOfColorBetween,
	colors };
