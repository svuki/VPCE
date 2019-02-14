import {ExerciseProto} from "./exercise.js"
import {ValueScaleExercise} from "./grayscale_exercise.js"
import {LayeredCanvas} from "./multiCanvas.js"
import {Color, randomGreyscaleColor, randomColor, randomColorIn} from "./color.js"

function VSExerciseRunner(numValues, swatchColor) {
    let exercise = null;
    let inputListener = null;
    let layeredCanvas = null;
    let parentDiv = null;

    let continuation = null; 
    let onExerciseCompletion = function(summary) {
	this.end(summary);
    }

    this.begin = function(div, passedContinuation) {
	continuation = passedContinuation;
	layeredCanvas = new LayeredCanvas(div);
	exercise = new ValueScaleExercise(layeredCanvas, numValues, swatchColor);
	exercise.onCompletion = onExerciseCompletion.bind(this);
	exercise.drawAll();
	inputListener = document.addEventListener("keydown", function(keypress) {
	    exercise.handleUserInput(keypress);
	});	   
    }
    this.end = function(summary) {
	if (!layeredCanvas) {
	    console.error("[VSExerciseRunner] end() called but layeredCanvas is null.")
	}
	else {
	    layeredCanvas.destory();
	}
	if (!inputListener) {
	    console.error("[VSExerciseRunner] end() called but inputListener is null.");
	}
	else {
	    document.removeEventListener(inputListener);
	}
	if (!continuation) {
	    console.error("[VSExerciseRunner] end() called but no continuation is null.");
	}
	else {
	    continuation(summary);
	}
    }

    this.handleUserInput = function(event) {
	exercise.handleUserInput(event);
    };
}
VSExerciseRunner.prototype = ExerciseProto;

/**
 * Generate repeated value scale exercises. When on ends, another is
 * spawned in its place.
 *
 * The value scale exercise generated is parameterized by the number of
 * values involved in the exercises (ie, how many values we compare the swatch
 * against) and the color's generated. This function will spawn a promise and 
 * pass the promises' resolve function to the exercise. When the exercise finishes
 * it will resolves the promise with a summary object for the exercise. The function
 * then recurses, generating a new exercise and spawning it.
 *
 * @param {HTMLDiv}  mainDiv        
 * @param {Number}   numValues
 * @param {Function} colorGenerator
 * @return {undefined}
 */
function repeatVSExercise(mainDiv, numValues, colorGenerator) {
    let color = colorGenerator();
    let exerciseRunner = new VSExerciseRunner(numValues, color);
    let promise = new Promise(function(resolve, reject) {
	console.log('promised');
	exerciseRunner.begin(mainDiv, resolve);
    });
    // TODO: nothing is done with the summary here
    promise.then((summary) => repeatVSExercise(mainDiv, numValues, colorGenerator));
};
		
			      
function repeatGreyScaleTwo(maindDiv) {
    repeatVSExercise(mainDiv, 2, randomGreyscaleColor);
}
function repeatGreyScaleFour(mainDiv) {
    repeatVSExercise(mainDiv, 4, randomGreyscaleColor);
}
function repeatGreyScaleEight(mainDiv) {
    repeatVSExercise(mainDiv, 8, randomGreyscaleColor);
}
function repeatColorTwo(mainDiv) {
    repeatVSExercise(mainDiv, 2, randomColor);
}
function repeatColorFour(mainDiv) {
    repeatVSExercise(mainDiv, 4, randomColor);
}
function repeatColorEight(mainDiv) {
    repeatVSExercise(mainDiv, 8, randomColor);
}

// For the following, the exact color range isn't specific, there is not
// easy formula for breaking up HSL colors into the rainbow. Green and blue,
// for example, occupy a much wider range than do Yellow and Red. The division
// below was done by hand.
function repeatRedEight(mainDiv) {
    repeatVSExercise(mainDiv, 8, () => randomValueOfColorIn(330, 370));
}
function repeatOrangeEight(mainDiv) {
    repeatVSExercise(mainDiv, 8, () => randomValueOfColorIn(10, 40));
}
function repeatYellowEight(mainDiv) {
    repeatVSEXercise(mainDiv, 8, () => randomValueOfColorIn(40, 85));
}
function repeatGreenEight(mainDiv) {
    repeatVSExercise(mainDiv, 8, () => randomValueOfColorIn(85, 160));
}
function repeatBlueEight(mainDiv) {
    repeatVSExercise(mainDiv, 8, () => randomValueOfColorIn(160, 250));
}
function repeatPurpleEight(mainDiv) {
    repeatVSExercise(mainDiv, 8, () => randomValueOfColorIn(250, 330));
}

let valueScaleExercises = {
    repeatGreyScaleTwo : repeatGreyScaleTwo,
    repeatGreyScaleFour : repeatGreyScaleFour,
    repeatGreyScaleEight : repeatGreyScaleEight,
    repeatColorTwo : repeatColorTwo,
    repeatColorFour : repeatColorFour,
    repeatColorEight : repeatColorEight,
    repeatRedEight : repeatRedEight,
    repeatOrangeEight : repeatOrangeEight,
    repeatYellowEight : repeatYellowEight,
    repeatGreenEight : repeatGreenEight,
    repeatBlueEight : repeatBlueEight,
    repeatPurpleEight : repeatPurpleEight
}
export {repeatVSExercise, valueScaleExercises};
    
