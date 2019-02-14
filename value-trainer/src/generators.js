// These functions use the base exercise API to produce sequences of exercises

function sendSummaryToServer(summary) {
    return fetch("/exercise_log", {
	method: "POST",
	mode: "cors",
	cache: "no-cache",
	credentials: "same-origin",
	headers: {
	    "Content-Type": "application/json"
	},
	redirect: "follow",
	referrer: "no-referrer",
	body: JSON.stringify(summary),
    })
}

/** 
 * Spawn the exercises in EXERCISES one after the other, looping back to the
 * begining when done.
 * @function cycle
 * @param {DOMElement} div       The div to spawn the exercises under.
 * @param {Array}      exercises An array of exercises.
 * @return undefined
 */
function cycle(div, exercises) {
    let idx = 0;
    function exercise() {
	return exercises[idx];
    };
    function nextExercise() {
	if (idx === exercises.length) {
	    idx = 0;
	}
	else {
	    idx++;
	}
    };
  
    function spawnExercise() {
	let exercise = exercise();
	function completionCallback(summary) {
	    sendSummaryToServer(summary);
	    exercise.teardown();
	    nextExercise();
	    spawnExercise();
	}
	exercise.spawn(div, completionCallback);
    }
}
	
   
