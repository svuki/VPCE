import * as color from "./color.js";
import {LayeredCanvas} from "./multiCanvas.js";
import {defProp, stepArray, closestNumber, accumulate} from "./utils.js";
import {DrawnRectange, ValueScale, Swatch} from "./drawables.js";
import {ExerciseProto} from "./exercise.js"

// These are originally used in "./drawables.js" but upon refactoring we
// need them here to. Should see if there is a way to not use them here.
const XCOORD = 0;
const YCOORD = 1;

// constructor
/**
 * In a value scale exercise the user is presented with a value scale drawn on
 * a canvas and a swatch that they can move around. The goal is to move the 
 * swatch over the closest value. The number of values may vary. The color
 * of the swatch is specified by one of the constructor's parameters, so this
 * can generate a variety of exercises depending on what kind of colors we want.
 *
 * @constructor
 * @param {LayeredCanvas} layeredCanvas        The layeredCanvas to use.
 * @param {Number}        numValues            The number of values to draw.
 * @param {Function}      swatchColorGenerator On call, produces a swatch.
 */
function ValueScaleExercise(layeredCanvas, numValues, swatchColor) {
    // Setup the value scale on its own layer in the canvas
    let valueScaleLayer = layeredCanvas.newLayer();
    let swatchLayer = layeredCanvas.newLayer();
    let valueScale = new ValueScale(layeredCanvas.width,
				    layeredCanvas.height,
				    numValues);
    valueScaleLayer.addDrawable(valueScale);
    // Setup the swatch on its own layer in the canvas
    let swatchWidth = valueScale.rectangleWidth / 2;
    let swatchHeight = layeredCanvas.height / 2.5;
    let swatch =  new Swatch(layeredCanvas.width / 2 - (swatchWidth / 2),
			     layeredCanvas.height / 2 - (swatchHeight / 2),
			     swatchWidth,
			     swatchHeight,
			     swatchColor);
    swatchLayer.addDrawable(swatch);

    // Exercise API functions
    this.onCompletion = () => undefined;  // this gets overrided

    // Other functions
    this.clear = () => layeredCanvas.clear();
    this.drawAll = () => layeredCanvas.draw();
    this.redrawAll = function() {
	this.clear();
	this.drawAll();
    };
    this.redrawSwatch = () => swatchLayer.redraw();

    this.score = function() {
	if (this.guessedValue == this.trueValue) {
	    return 1;
	}
	let diff = Math.abs(this.guessedValue - this.trueValue);
	// for ever value we are off, the penalty is this.
	// This allows us to capture a notion of how "close" something
	// was which can be useful for distinguishing between "we need
	// fine tuned exercises" vs we are failing in general. The simplest
	// way to do this is to say that the penalty is how far from the true
	// value we are, but dividing the number of values by two ensure that
	// we can assign a score of 0 to any (guess, trueValue) pair instead of
	// just those cases when guess - trueValue == numValues. 
	let penalty = 1 / (numValues / 2);
	return Math.max(0, 1 - diff * penalty);
    }
	
    this.summarize = function() {
	return {"exercise" : "ValueScale",
		"params" : {
		    "numValues" : numValues,
		    "swatchColor" : swatch.color.toString
		},
		"expected" : this.trueValue,
		"guess" : this.guessedValue,
		"score" : this.score()
	       }
    };		
    defProp(this,
	    "trueValue",
	    () => valueScale.valueOf(swatch.color));
    defProp(this,
	    "guessedValue",
	    () => valueScale.valueAt(swatch.center[XCOORD]));
    this.moveSwatch = function(valueRectWidths) {
	let shiftIncrement = valueScale.rectangleWidth;
	let shiftAmount = shiftIncrement * valueRectWidths;
	let minPosition = valueScale.rectangleWidth / 2;
	let maxPosition = layeredCanvas.width - valueScale.rectangleWidth / 2;
	let oldCenterX = swatch.center[0];
	swatch.shiftXCenter(shiftAmount, minPosition, maxPosition)
	let newCenterX = swatch.center[0];
	this.redrawSwatch();
	return oldCenterX !== newCenterX;
    };

    // Members related to bouncing functionality.

    // When the swatch bounces, it moves across the value scale from
    // one side to another. This is useful because the apparent value
    // of the swatch will appear to change is it travels accross the value
    // scale. The inflecion point of this change marks the true value.
    // This is especially useful for cases where the swatch has some hue
    // and is not greyscale.

    let isBouncing = false; // are we already boucing?
    // this will be the inerval object we're bouncing
    // we can stop bouncing by clearing the inverval
    // TODO: use an animation frame instead of an interval
    let bouncingInterval = null;
    this.toggleBounce = function() {
	if (isBouncing) {
	    this.stopBouncing();
	}
	else {
	    this.startBouncing();
	}
    }
    this.startBouncing = function() {
	if (isBouncing) {
	    return;
	}
	this.bounceSwatch(layeredCanvas.width / 50, 25);
    }
    this.stopBouncing = function() {
	if (!isBouncing) {
	    return;
	}
	isBouncing = false;
	window.clearInterval(bouncingInterval);
	// Snap the swatch to the nearest centered position:
	// first we compute all the valid positions in the array
	// these are the (numValues - 1) positions between two values
	// and the numValues positions over the values themself.
	// The distance between each of these positions in valueScale.
	// rectangleWidth / 2.
	let validPositions = accumulate(Array(numValues * 2 - 1)
					.fill(valueScale.rectangleWidth / 2));
	console.log(validPositions);
	let newXPosition = closestNumber(validPositions, swatch.center[XCOORD]);
	swatch.center = [newXPosition, swatch.center[YCOORD]];
	swatchLayer.redraw();
    }
    this.bounceSwatch = function(units, incrementTime) {
	if (isBouncing) {
	    return;
	}
	isBouncing = true;
	let increment = units;
	let minPosition = valueScale.rectangleWidth / 2;
	let maxPosition = layeredCanvas.width - valueScale.rectangleWidth / 2;
	let moveSwatch = () => {
	    let lastPosition = swatch.center[0];
	    swatch.shiftXCenter(increment, minPosition, maxPosition);
	    this.redrawSwatch();
	    let newPosition = swatch.center[0];
	    if (newPosition === lastPosition) {
		increment = -increment;
	    }
	}
	bouncingInterval = window.setInterval(moveSwatch, incrementTime);
    }
    /** Determine whether the swatch is on the correct value or not. If it is,
     * flash the correct value green. If it is not, flash the correct value red.
     * 
     * @method enterGuess
     * @return {Promise} Resolves after the rectangle flashes the proper color.
     */
    this.enterGuess = function() {
	let trueValueRect = valueScale.valueRectangles[this.trueValue];
	let flash;
	if (this.trueValue == this.guessedValue) {
	    flash = trueValueRect.flash(valueScaleLayer.canvas,
					color.colors.GREEN, 100, 50);
	}
	else {
	    flash = trueValueRect.flash(valueScaleLayer.canvas,
					color.colors.RED, 100, 50);
	}
	let ret = flash.then((value) => {
	    return this.trueValue === this.guessedValue;
	});
	ret.then(() => this.onCompletion(this.summarize()));
    }
    /** Method to hold any final cleanup actions. It is assumed that after
     * calling this method we will not use the exercise again.
     * @method finish
     * @return {undefined}
     */
    this.finish = function() {
	this.stopBouncing();
	this.clear();
    }
    /** These specify the controls for the greyscale exercise. When the exercise
     * is loaded, keypresses & mouseclicks will be divereted to this controller.
     * @method handleUserInput
     * @param Event event The input event, either a keypress or mouse click.
     * @return {undefined} 
     */
    this.handleUserInput = function(event) {
	if (event.type === "keydown") {
	    switch (event.key) {
	    case "ArrowLeft":
		this.stopBouncing();
		this.moveSwatch(-0.5);
		break;
	    case "ArrowRight":
		this.stopBouncing();
		this.moveSwatch(0.5);
		break;
	    case "Enter":
		this.stopBouncing();
		this.enterGuess();
		break;
	    case "b":
		this.toggleBounce();
		break;
	    }
	}			
    }
}
ValueScale.proto = ExerciseProto;

export { ValueScaleExercise };
