// An abstract exercise takes is an object with methods
// spawn(canvas, ...) -> setup the exercise and prepare a case. When this method completes its work,
//            the user should have a fully prepared exercise
// teardown() -> release any assets owned by the exercise, after this is called, we
//               should be able to 
// newCase() -> produce a new case for the exercise. This should take care to remove the
//              old test case, if it still exists, and put a new one in its place, if applicable.
//              This should have the same semantics as tearing down an exercise and then
//              spawning it again.
// handleUserInput(event) -> all keypress and mouse click events will be handled by this
//                           event.

// Exercises will be managed by some external manager that handles the actual logic
// of which exercise to use, when to spawn a new use case, how to route user input, etc.

/**
 * An Exercise is an interaction with the user that involves three steps:
 * 
 * (1) An initial setup phase, during which the exercise displays relevant 
 *     information to the user. The exercise is passed a div which contains the
 *     space to set up in. Once the setup phase is done, the user should be
 *     able to interact with the exercise. For example, in a value scale exercise,
 *     the setup phase will spawn a canvas, draw a value scale onto that canvas, and
 *     draw the colored swatch onto the canvas. 
 * (2) Interaction stage. This stage is defined by the user observing the exercise
 *     and possibly manipulating certain portions of it. For example, in a value scale
 *     exercise, the user moves the swatch from value to value.
 * (3) Judging stage. In this stage the user has inputted some value(s) as the solution
 *     to the exercise. The user's input is judged and a summary is produced. The summary
 *     contains information about the specific parameters of the exercise and the user's
 *     input. 
 *
 * In addition to these 3 core steps, we add two sequencing steps: 
 *
 * (0) Begin, which receives a continuation object and triggers the setup phase.
 * (4) End, which calls the continuation object with the value of the summary. 
 *
 * These two phases allow us to effectively sequence exercises.
 */
function Exercise() {
    this.begin = function(div, continuation) {
	this.saveContinuation(continuation);
	this.spawn(div);
    }
    this.saveContinuation = function(continuation) {
	this.continuation = continuation;
    }
    this.end = function() {
	this.continuation(this.summary);
    }
    this.spawn = (div) => console.error("Exercise does not implement spawn.");
    this.teardown = () => console.error("Exercise does not implement teardown.");
    this.onCompletion = function(summary) {
	this.completionCallbacks.forEach(fn => fn(summary));
    };	
    this.addCompletionCallback = function(callback) {
	this.completionCallbacks.push(callback);
    };
    this.handleUserInput = (event) => console.error("Exercise does not implement handleUserInput");
}

let ExerciseProto = new Exercise();
export {ExerciseProto};
