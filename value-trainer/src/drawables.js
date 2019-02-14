import {defProp, stepArray} from "./utils.js";
import * as color from "./color.js";

// We'll have to talk about the position of rectangles as arrays of
// [X, Y, WIDTH, HEIGHT]. This is how the canvas API does it, so we
// define constants for these index values.
const XCOORD = 0
const YCOORD = 1
const WIDTH = 2
const HEIGHT = 3
const test = 0;
/** A drawn rectange represents a rectange drawn to a canvas. We provide
 * methods for redrawing the rectangle, recalculating the drawn rectangle
 * based on changes in the canvas shape, and easily manipulating the rectangle.
 *
 * @param {HTML Canvas} canv: the canvas we're drawing on
 * @param {Array of 4 Numbers} coordinates: the [left, top, width, height]
 *     coordinates of the rectangle.
 * @param {Color} color: an hsl color
 */
function DrawnRectangle(xCoord, yCoord, width, height, color) {
    this.color = color;
    let coordinates = [xCoord, yCoord, width, height]
    defProp(this,
	    "xCoord",
	    () => coordinates[XCOORD],
	    (val) => coordinates[XCOORD] = val)
    defProp(this,
	    "yCoord",
	    () => coordinates[YCOORD],
	    (val) => coordinates[YCOORD] = val)
    defProp(this,
	    "width",
	    () => coordinates[WIDTH],
	    (val) => coordinates[WIDTH] = val)
    defProp(this,
	    "height",
	    () => coordinates[HEIGHT],
	    (val) => coordinates[HEIGHT])
    defProp(this,
	    "coordinates",
	    () => coordinates,
	    function (newValue) {
		if (newValue instanceof Array && newValue.length === 4) {
		    coordinates = newValue;
		}
		else {
		    console.error("Attempted to set DrawnRectangle coordinates"
				  + "to" + newValue + ". Expecting an array of"
				  + " length four");
		}
	    });
    // In some cases we'll want to deal with the rectangle's center point.
    defProp(this,
	    "center",
	    function() {
		let centerX = this.xCoord + this.width / 2;
		let centerY = this.yCoord + this.height / 2;
		return [centerX, centerY];
	    },
	    function(center) {
		let centerX = center[XCOORD];
		let centerY = center[YCOORD];
		let newX = centerX - this.width / 2;
		let newY = centerY - this.height / 2;
		this.xCoord = newX;
		this.yCoord = newY;
	    });
    this.draw = function(canvas) {
	let ctx = canvas.getContext("2d");
	ctx.fillStyle = this.color.toString();
	ctx.fillRect(...this.coordinates);
    }
    /** Temporarily recolor the square before restoring the original color.
     * This method returns a promise that will resolve once the entire flashing
     * sequence is complete. The flashing sequence consists of two phases: (1)
     * the color change and (2) a period of settling back to the old color.
     *
     * @param {Color} flashColor   The color to flash.
     * @param {Int}   flashLength  How long, in ms, to flash for.
     * @param {Int}   settleLength How long, in ms, after flashing to show the
     *                             original color.
     *
     * @return {Promise} A promise that resolves once the flash has complete.
     */
    this.flash = function(canvas, flashColor, flashLength, settleLength) {
	let self = this;
	let oldColor = this.color;
	let settleFunction = function(resolve) {
	    self.color = oldColor;
	    self.draw(canvas);
	    setTimeout(() => resolve(), settleLength);
	}
	return new Promise(function(resolve, reject) {
	    self.color = flashColor;
	    self.draw(canvas);
	    setTimeout(() => settleFunction(resolve), flashLength);
	})
    };
}


// In the base ValueScale exercise, a colored swatch and a value scale is drawn
// onto the canvas. The user can then move the swatch around and when the user
// is satisfied that the swatch is over the correct value, they may make their
// guess.

/** A ValueScale is a drawing of a collection of rectanges, each with
 * a specified value. A ValueScale can be drawn for any N >= 2. The lowest
 * value, 0, is drawn on the left, and then the values proceed left to right
 * the the highest value. The lowest value is pure white and the highest value
 * is pure black.
 *
 * @param {HTMLCanvas} canvas: the canvas to draw on
 * @param {Int} numValues: the number of values to draw
 */
function ValueScale(scaleWidth, scaleHeight, numValues) {
    // Now we create the colored rectangles of the value scale

    let colors = stepArray(numValues, 100, true)
	.map(value => new color.Color(0, 0, value));;
    // We will set this later in a call to .resize()
    let width = null;
    let height = null;
    let xCoordinates = null;
    let xCenters = null;
    this.valueRectangles = null;
    defProp(this, "rectangleWidth", () => Math.ceil(width / numValues));
    defProp(this, "rectangleHeight", () => height);
    /** Resize the scale according to this new width and height.
     *
     * @method resize
     * @param {Number} newWidth The new width.
     * @param {Number} newHeight The new height.
     * @return undefined
     */
    this.resize = function(newWidth, newHeight) {
	width = newWidth;
	height = newHeight;
	xCoordinates = stepArray(numValues, newWidth, false);
	xCenters = xCoordinates.map((xCoord) => xCoord
				    + this.rectangleWidth / 2);
	this.valueRectangles = xCoordinates.map(
	    (xCoord, idx) =>  new DrawnRectangle(xCoord,
						 0,
						 this.rectangleWidth,
						 this.rectangleHeight,
						 colors[idx]));
    }
    // This call will setup the null values related to the positioning
    // of the various value rectangles.
    this.resize(scaleWidth, scaleHeight);
    this.draw = function(canvas) {
	this.valueRectangles.forEach(vRect => vRect.draw(canvas));
    }

    /** Find the closest value center to the X coordinate
     * if we're equidistant from two values, we'll return
     *  a value + .5.
     *
     * @param {Int} centerX The center x-coordinate we wan to find the value of
     *
     * @return {Number} The value at the coordinate. If this number is of the
     * form X.5, then we are equidistant between the values X and X + 1.
     */
    this.valueAt = function(centerX) {
	let distances = xCenters.map(value => Math.abs(centerX - value));
	// need to make sure we're not equidistant from two values
	let valueFromLeft = distances.indexOf(Math.min(...distances));
	let valueFromRight = (distances.length - 1)
	    - distances.slice().reverse().indexOf(Math.min(...distances));
	// If they agree, then it can only be one
	if (valueFromLeft === valueFromRight) {
	    return valueFromLeft;
	}
	// There are two minimums, return the value between them
	else {
	    return valueFromLeft + 0.5;
	}
    };

    /** Given a color, return its value according to this value scale.
     *
     * @param {Color} color The color to find the value of.
     *
     * @return {Int} The value of the color.
     */
    this.valueOf = function(color) {
	//Compute the value bin that this should go into
	let values = stepArray(numValues, 100, true);
	let distances = values.map((val) => Math.abs(color.lightness - val));
	return distances.indexOf(Math.min(...distances));
    }
}

// For the basic value scale exercises, we'll provide a swatch of color that the
// user can move around. At first, the user must be able to compare the color
// directly against the value by overlaying them. At more complex exercises,
// we'll change where the swatch is displayed and what the user can do with the
// swatch.

/** A swatch is a colored rectangle that we can move around.
 *
 * @class Swatch
 * @param {Int} xCoord: the swatch's initial x coordinate.
 * @param {Int} yCoord: the swatch's initial y coordinate.
 * @param {Int} height: the swatch height
 * @param {Int} width: the swatch width
 * @param {Color} color: the swatch color
 */
function Swatch(xCoord, yCoord, width, height, color) {
    // get all the drawnRectangle stuff setup
    DrawnRectangle.bind(this)(xCoord, yCoord, width, height, color);
    this.shiftXCenter = function(units, min, max) {
	let oldXCenter = this.center[0];
	let newXCenter = oldXCenter + units;
	if (max !== undefined) {
	    newXCenter = Math.min(newXCenter, max);
	}
	if (min !== undefined) {
	    newXCenter = Math.max(newXCenter, min);
	}
	this.center = [newXCenter, this.center[YCOORD]];
    }
    this.resize = (newWidth, newHeight, oldWidth, oldHeight) => {
	let newSwatchWidth = newWidth * (this.width / oldWidth);
	let newSwatchHeight = newHeight / 2;
	let newX = this.x
	let newY = newHeight / 2;
    }
}

export {DrawnRectangle, ValueScale, Swatch};
