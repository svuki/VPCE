/** A more convenient way of defining a property with a getter/setter
 * on an object. This assumes 'this' is bound to the object we want to
 * define the property on. Note that in a constructor definition, 'this'
 * is bound to object under construction.
 *
 * @param {String} name: the property name
 * @param {Function} getter: how should we compute this property?
 * @param {Function} setter: when passed a value, what should we change?
 * @return undefined
 */
function defProp(obj, name, getter, setter) {
    Object.defineProperty(obj, name, {
	get: getter,
	set: setter
    })
}

/** Calculate an array with values equidistant one from another between 0 and
 *  MAXIMUM. If INCLUDEMAXIMUM is true, then MAXIMUM is included in the array,
 *  otherwise it is not. This is similar to python's range fuction, but instead
 *  of providing a step value, the step value is calculate for us based on the
 *  number of values we'd like.
 * 
 * For exmaple,
 *     stepArray(4, 100, true) ==> [0, 33.3, 66.6, 100]
 *     stepArray(4, 100, false) ==> [0, 25, 50, 75]
 *     stepArray(5, 550, true) ==> [0, 138.75, 277.5, 416.25, 555]
 *
 * @param {Int} numValues How many points
 * @param {Int} maximum The maximum value
 * @param {Bool} includeMaximum (default false), include MAXIMUM in the output?
 * @return {Array of Num} An array of numValues equidants values,
 *      starting from 0.
 */
function stepArray(numValues, maximum, includeMaximum) {
    if (includeMaximum === undefined) {
	includeMaximum = false;
    }
    let stepSize = includeMaximum ?
	maximum / (numValues - 1)
	: maximum / numValues;
    let ret = Array(numValues).fill(1).map((v, n) => n * stepSize);
    return ret;
}

/** Return the closest number in ARR to NUM. Of all the elements that are
 * equidistant from num, return the one with the lowest index. If arr is
 * empty, returns null.
 *
 * For example,
 * closestNumber([1,2,4,8,16], 10) ==> 8
 * closestNumber([100, 10, 4, 101], 100.5) ==> 100
 *
 * @param {Array of Number} arr
 * @param {Int} num
 *
 * @return {Int}
 */
function closestNumber(arr, num) {
    if (arr.length === 0) {
	return null;
    }
    let distances = arr.map(val => Math.abs(val - num));
    let minIdx = distances.indexOf(Math.min(...distances));
    return arr[minIdx];
}

/** Returns an array such that each index i of the output array is equal to
 * the reduction of the array up to index i by the passed function. An example
 * makes things clear:
 *
 * accumulate([1,2,3,4,5]) =>  [1,2,6,10,15]
 * accumulate([1,2,3,4,5], (x, y) => x * y) => [1,2,6,24,120]
 * accumulate([1,2,3,4], f) => [1, f(1, 2), f(f(1, 2), 3), f(f(f(1, 2), 3), 4)]
 *
 * @param {Array}               arr The input array.
 * @param {Function, default +} fn  A bindary function.
 * @result {Array}
 */
function accumulate(arr, func) {
    if (func === undefined) {
	func = (x, y) => x + y
    }
    return arr.map((val, idx) => arr.slice(0, idx + 1).reduce(func));
}


export {defProp, stepArray, closestNumber, accumulate};
