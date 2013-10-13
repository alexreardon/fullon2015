//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

	// Baseline setup
	// --------------

	// Establish the root object, `window` in the browser, or `exports` on the server.
	var root = this;

	// Save the previous value of the `_` variable.
	var previousUnderscore = root._;

	// Establish the object that gets returned to break out of a loop iteration.
	var breaker = {};

	// Save bytes in the minified (but not gzipped) version:
	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	// Create quick reference variables for speed access to core prototypes.
	var
		push             = ArrayProto.push,
		slice            = ArrayProto.slice,
		concat           = ArrayProto.concat,
		toString         = ObjProto.toString,
		hasOwnProperty   = ObjProto.hasOwnProperty;

	// All **ECMAScript 5** native function implementations that we hope to use
	// are declared here.
	var
		nativeForEach      = ArrayProto.forEach,
		nativeMap          = ArrayProto.map,
		nativeReduce       = ArrayProto.reduce,
		nativeReduceRight  = ArrayProto.reduceRight,
		nativeFilter       = ArrayProto.filter,
		nativeEvery        = ArrayProto.every,
		nativeSome         = ArrayProto.some,
		nativeIndexOf      = ArrayProto.indexOf,
		nativeLastIndexOf  = ArrayProto.lastIndexOf,
		nativeIsArray      = Array.isArray,
		nativeKeys         = Object.keys,
		nativeBind         = FuncProto.bind;

	// Create a safe reference to the Underscore object for use below.
	var _ = function(obj) {
		if (obj instanceof _) return obj;
		if (!(this instanceof _)) return new _(obj);
		this._wrapped = obj;
	};

	// Export the Underscore object for **Node.js**, with
	// backwards-compatibility for the old `require()` API. If we're in
	// the browser, add `_` as a global object via a string identifier,
	// for Closure Compiler "advanced" mode.
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = _;
		}
		exports._ = _;
	} else {
		root._ = _;
	}

	// Current version.
	_.VERSION = '1.5.1';

	// Collection Functions
	// --------------------

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	var each = _.each = _.forEach = function(obj, iterator, context) {
		if (obj == null) return;
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, length = obj.length; i < length; i++) {
				if (iterator.call(context, obj[i], i, obj) === breaker) return;
			}
		} else {
			var keys = _.keys(obj);
			for (var i = 0, length = keys.length; i < length; i++) {
				if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
			}
		}
	};

	// Return the results of applying the iterator to each element.
	// Delegates to **ECMAScript 5**'s native `map` if available.
	_.map = _.collect = function(obj, iterator, context) {
		var results = [];
		if (obj == null) return results;
		if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
		each(obj, function(value, index, list) {
			results.push(iterator.call(context, value, index, list));
		});
		return results;
	};

	var reduceError = 'Reduce of empty array with no initial value';

	// **Reduce** builds up a single result from a list of values, aka `inject`,
	// or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
	_.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
		var initial = arguments.length > 2;
		if (obj == null) obj = [];
		if (nativeReduce && obj.reduce === nativeReduce) {
			if (context) iterator = _.bind(iterator, context);
			return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
		}
		each(obj, function(value, index, list) {
			if (!initial) {
				memo = value;
				initial = true;
			} else {
				memo = iterator.call(context, memo, value, index, list);
			}
		});
		if (!initial) throw new TypeError(reduceError);
		return memo;
	};

	// The right-associative version of reduce, also known as `foldr`.
	// Delegates to **ECMAScript 5**'s native `reduceRight` if available.
	_.reduceRight = _.foldr = function(obj, iterator, memo, context) {
		var initial = arguments.length > 2;
		if (obj == null) obj = [];
		if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
			if (context) iterator = _.bind(iterator, context);
			return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
		}
		var length = obj.length;
		if (length !== +length) {
			var keys = _.keys(obj);
			length = keys.length;
		}
		each(obj, function(value, index, list) {
			index = keys ? keys[--length] : --length;
			if (!initial) {
				memo = obj[index];
				initial = true;
			} else {
				memo = iterator.call(context, memo, obj[index], index, list);
			}
		});
		if (!initial) throw new TypeError(reduceError);
		return memo;
	};

	// Return the first value which passes a truth test. Aliased as `detect`.
	_.find = _.detect = function(obj, iterator, context) {
		var result;
		any(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list)) {
				result = value;
				return true;
			}
		});
		return result;
	};

	// Return all the elements that pass a truth test.
	// Delegates to **ECMAScript 5**'s native `filter` if available.
	// Aliased as `select`.
	_.filter = _.select = function(obj, iterator, context) {
		var results = [];
		if (obj == null) return results;
		if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
		each(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list)) results.push(value);
		});
		return results;
	};

	// Return all the elements for which a truth test fails.
	_.reject = function(obj, iterator, context) {
		return _.filter(obj, function(value, index, list) {
			return !iterator.call(context, value, index, list);
		}, context);
	};

	// Determine whether all of the elements match a truth test.
	// Delegates to **ECMAScript 5**'s native `every` if available.
	// Aliased as `all`.
	_.every = _.all = function(obj, iterator, context) {
		iterator || (iterator = _.identity);
		var result = true;
		if (obj == null) return result;
		if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
		each(obj, function(value, index, list) {
			if (!(result = result && iterator.call(context, value, index, list))) return breaker;
		});
		return !!result;
	};

	// Determine if at least one element in the object matches a truth test.
	// Delegates to **ECMAScript 5**'s native `some` if available.
	// Aliased as `any`.
	var any = _.some = _.any = function(obj, iterator, context) {
		iterator || (iterator = _.identity);
		var result = false;
		if (obj == null) return result;
		if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
		each(obj, function(value, index, list) {
			if (result || (result = iterator.call(context, value, index, list))) return breaker;
		});
		return !!result;
	};

	// Determine if the array or object contains a given value (using `===`).
	// Aliased as `include`.
	_.contains = _.include = function(obj, target) {
		if (obj == null) return false;
		if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
		return any(obj, function(value) {
			return value === target;
		});
	};

	// Invoke a method (with arguments) on every item in a collection.
	_.invoke = function(obj, method) {
		var args = slice.call(arguments, 2);
		var isFunc = _.isFunction(method);
		return _.map(obj, function(value) {
			return (isFunc ? method : value[method]).apply(value, args);
		});
	};

	// Convenience version of a common use case of `map`: fetching a property.
	_.pluck = function(obj, key) {
		return _.map(obj, function(value){ return value[key]; });
	};

	// Convenience version of a common use case of `filter`: selecting only objects
	// containing specific `key:value` pairs.
	_.where = function(obj, attrs, first) {
		if (_.isEmpty(attrs)) return first ? void 0 : [];
		return _[first ? 'find' : 'filter'](obj, function(value) {
			for (var key in attrs) {
				if (attrs[key] !== value[key]) return false;
			}
			return true;
		});
	};

	// Convenience version of a common use case of `find`: getting the first object
	// containing specific `key:value` pairs.
	_.findWhere = function(obj, attrs) {
		return _.where(obj, attrs, true);
	};

	// Return the maximum element or (element-based computation).
	// Can't optimize arrays of integers longer than 65,535 elements.
	// See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
	_.max = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
			return Math.max.apply(Math, obj);
		}
		if (!iterator && _.isEmpty(obj)) return -Infinity;
		var result = {computed : -Infinity, value: -Infinity};
		each(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			computed > result.computed && (result = {value : value, computed : computed});
		});
		return result.value;
	};

	// Return the minimum element (or element-based computation).
	_.min = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
			return Math.min.apply(Math, obj);
		}
		if (!iterator && _.isEmpty(obj)) return Infinity;
		var result = {computed : Infinity, value: Infinity};
		each(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			computed < result.computed && (result = {value : value, computed : computed});
		});
		return result.value;
	};

	// Shuffle an array.
	_.shuffle = function(obj) {
		var rand;
		var index = 0;
		var shuffled = [];
		each(obj, function(value) {
			rand = _.random(index++);
			shuffled[index - 1] = shuffled[rand];
			shuffled[rand] = value;
		});
		return shuffled;
	};

	// An internal function to generate lookup iterators.
	var lookupIterator = function(value) {
		return _.isFunction(value) ? value : function(obj){ return obj[value]; };
	};

	// Sort the object's values by a criterion produced by an iterator.
	_.sortBy = function(obj, value, context) {
		var iterator = lookupIterator(value);
		return _.pluck(_.map(obj, function(value, index, list) {
			return {
				value: value,
				index: index,
				criteria: iterator.call(context, value, index, list)
			};
		}).sort(function(left, right) {
				var a = left.criteria;
				var b = right.criteria;
				if (a !== b) {
					if (a > b || a === void 0) return 1;
					if (a < b || b === void 0) return -1;
				}
				return left.index - right.index;
			}), 'value');
	};

	// An internal function used for aggregate "group by" operations.
	var group = function(behavior) {
		return function(obj, value, context) {
			var result = {};
			var iterator = value == null ? _.identity : lookupIterator(value);
			each(obj, function(value, index) {
				var key = iterator.call(context, value, index, obj);
				behavior(result, key, value);
			});
			return result;
		};
	};

	// Groups the object's values by a criterion. Pass either a string attribute
	// to group by, or a function that returns the criterion.
	_.groupBy = group(function(result, key, value) {
		(_.has(result, key) ? result[key] : (result[key] = [])).push(value);
	});

	// Indexes the object's values by a criterion, similar to `groupBy`, but for
	// when you know that your index values will be unique.
	_.indexBy = group(function(result, key, value) {
		result[key] = value;
	});

	// Counts instances of an object that group by a certain criterion. Pass
	// either a string attribute to count by, or a function that returns the
	// criterion.
	_.countBy = group(function(result, key, value) {
		_.has(result, key) ? result[key]++ : result[key] = 1;
	});

	// Use a comparator function to figure out the smallest index at which
	// an object should be inserted so as to maintain order. Uses binary search.
	_.sortedIndex = function(array, obj, iterator, context) {
		iterator = iterator == null ? _.identity : lookupIterator(iterator);
		var value = iterator.call(context, obj);
		var low = 0, high = array.length;
		while (low < high) {
			var mid = (low + high) >>> 1;
			iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
		}
		return low;
	};

	// Safely create a real, live array from anything iterable.
	_.toArray = function(obj) {
		if (!obj) return [];
		if (_.isArray(obj)) return slice.call(obj);
		if (obj.length === +obj.length) return _.map(obj, _.identity);
		return _.values(obj);
	};

	// Return the number of elements in an object.
	_.size = function(obj) {
		if (obj == null) return 0;
		return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
	};

	// Array Functions
	// ---------------

	// Get the first element of an array. Passing **n** will return the first N
	// values in the array. Aliased as `head` and `take`. The **guard** check
	// allows it to work with `_.map`.
	_.first = _.head = _.take = function(array, n, guard) {
		if (array == null) return void 0;
		return (n == null) || guard ? array[0] : slice.call(array, 0, n);
	};

	// Returns everything but the last entry of the array. Especially useful on
	// the arguments object. Passing **n** will return all the values in
	// the array, excluding the last N. The **guard** check allows it to work with
	// `_.map`.
	_.initial = function(array, n, guard) {
		return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
	};

	// Get the last element of an array. Passing **n** will return the last N
	// values in the array. The **guard** check allows it to work with `_.map`.
	_.last = function(array, n, guard) {
		if (array == null) return void 0;
		if ((n == null) || guard) {
			return array[array.length - 1];
		} else {
			return slice.call(array, Math.max(array.length - n, 0));
		}
	};

	// Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	// Especially useful on the arguments object. Passing an **n** will return
	// the rest N values in the array. The **guard**
	// check allows it to work with `_.map`.
	_.rest = _.tail = _.drop = function(array, n, guard) {
		return slice.call(array, (n == null) || guard ? 1 : n);
	};

	// Trim out all falsy values from an array.
	_.compact = function(array) {
		return _.filter(array, _.identity);
	};

	// Internal implementation of a recursive `flatten` function.
	var flatten = function(input, shallow, output) {
		if (shallow && _.every(input, _.isArray)) {
			return concat.apply(output, input);
		}
		each(input, function(value) {
			if (_.isArray(value) || _.isArguments(value)) {
				shallow ? push.apply(output, value) : flatten(value, shallow, output);
			} else {
				output.push(value);
			}
		});
		return output;
	};

	// Flatten out an array, either recursively (by default), or just one level.
	_.flatten = function(array, shallow) {
		return flatten(array, shallow, []);
	};

	// Return a version of the array that does not contain the specified value(s).
	_.without = function(array) {
		return _.difference(array, slice.call(arguments, 1));
	};

	// Produce a duplicate-free version of the array. If the array has already
	// been sorted, you have the option of using a faster algorithm.
	// Aliased as `unique`.
	_.uniq = _.unique = function(array, isSorted, iterator, context) {
		if (_.isFunction(isSorted)) {
			context = iterator;
			iterator = isSorted;
			isSorted = false;
		}
		var initial = iterator ? _.map(array, iterator, context) : array;
		var results = [];
		var seen = [];
		each(initial, function(value, index) {
			if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
				seen.push(value);
				results.push(array[index]);
			}
		});
		return results;
	};

	// Produce an array that contains the union: each distinct element from all of
	// the passed-in arrays.
	_.union = function() {
		return _.uniq(_.flatten(arguments, true));
	};

	// Produce an array that contains every item shared between all the
	// passed-in arrays.
	_.intersection = function(array) {
		var rest = slice.call(arguments, 1);
		return _.filter(_.uniq(array), function(item) {
			return _.every(rest, function(other) {
				return _.indexOf(other, item) >= 0;
			});
		});
	};

	// Take the difference between one array and a number of other arrays.
	// Only the elements present in just the first array will remain.
	_.difference = function(array) {
		var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
		return _.filter(array, function(value){ return !_.contains(rest, value); });
	};

	// Zip together multiple lists into a single array -- elements that share
	// an index go together.
	_.zip = function() {
		var length = _.max(_.pluck(arguments, "length").concat(0));
		var results = new Array(length);
		for (var i = 0; i < length; i++) {
			results[i] = _.pluck(arguments, '' + i);
		}
		return results;
	};

	// Converts lists into objects. Pass either a single array of `[key, value]`
	// pairs, or two parallel arrays of the same length -- one of keys, and one of
	// the corresponding values.
	_.object = function(list, values) {
		if (list == null) return {};
		var result = {};
		for (var i = 0, length = list.length; i < length; i++) {
			if (values) {
				result[list[i]] = values[i];
			} else {
				result[list[i][0]] = list[i][1];
			}
		}
		return result;
	};

	// If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
	// we need this function. Return the position of the first occurrence of an
	// item in an array, or -1 if the item is not included in the array.
	// Delegates to **ECMAScript 5**'s native `indexOf` if available.
	// If the array is large and already in sort order, pass `true`
	// for **isSorted** to use binary search.
	_.indexOf = function(array, item, isSorted) {
		if (array == null) return -1;
		var i = 0, length = array.length;
		if (isSorted) {
			if (typeof isSorted == 'number') {
				i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
			} else {
				i = _.sortedIndex(array, item);
				return array[i] === item ? i : -1;
			}
		}
		if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
		for (; i < length; i++) if (array[i] === item) return i;
		return -1;
	};

	// Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
	_.lastIndexOf = function(array, item, from) {
		if (array == null) return -1;
		var hasIndex = from != null;
		if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
			return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
		}
		var i = (hasIndex ? from : array.length);
		while (i--) if (array[i] === item) return i;
		return -1;
	};

	// Generate an integer Array containing an arithmetic progression. A port of
	// the native Python `range()` function. See
	// [the Python documentation](http://docs.python.org/library/functions.html#range).
	_.range = function(start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		}
		step = arguments[2] || 1;

		var length = Math.max(Math.ceil((stop - start) / step), 0);
		var idx = 0;
		var range = new Array(length);

		while(idx < length) {
			range[idx++] = start;
			start += step;
		}

		return range;
	};

	// Function (ahem) Functions
	// ------------------

	// Reusable constructor function for prototype setting.
	var ctor = function(){};

	// Create a function bound to a given object (assigning `this`, and arguments,
	// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	// available.
	_.bind = function(func, context) {
		var args, bound;
		if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!_.isFunction(func)) throw new TypeError;
		args = slice.call(arguments, 2);
		return bound = function() {
			if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
			ctor.prototype = func.prototype;
			var self = new ctor;
			ctor.prototype = null;
			var result = func.apply(self, args.concat(slice.call(arguments)));
			if (Object(result) === result) return result;
			return self;
		};
	};

	// Partially apply a function by creating a version that has had some of its
	// arguments pre-filled, without changing its dynamic `this` context.
	_.partial = function(func) {
		var args = slice.call(arguments, 1);
		return function() {
			return func.apply(this, args.concat(slice.call(arguments)));
		};
	};

	// Bind all of an object's methods to that object. Useful for ensuring that
	// all callbacks defined on an object belong to it.
	_.bindAll = function(obj) {
		var funcs = slice.call(arguments, 1);
		if (funcs.length === 0) throw new Error("bindAll must be passed function names");
		each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
		return obj;
	};

	// Memoize an expensive function by storing its results.
	_.memoize = function(func, hasher) {
		var memo = {};
		hasher || (hasher = _.identity);
		return function() {
			var key = hasher.apply(this, arguments);
			return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
		};
	};

	// Delays a function for the given number of milliseconds, and then calls
	// it with the arguments supplied.
	_.delay = function(func, wait) {
		var args = slice.call(arguments, 2);
		return setTimeout(function(){ return func.apply(null, args); }, wait);
	};

	// Defers a function, scheduling it to run after the current call stack has
	// cleared.
	_.defer = function(func) {
		return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
	};

	// Returns a function, that, when invoked, will only be triggered at most once
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.
	_.throttle = function(func, wait, options) {
		var context, args, result;
		var timeout = null;
		var previous = 0;
		options || (options = {});
		var later = function() {
			previous = options.leading === false ? 0 : new Date;
			timeout = null;
			result = func.apply(context, args);
		};
		return function() {
			var now = new Date;
			if (!previous && options.leading === false) previous = now;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0) {
				clearTimeout(timeout);
				timeout = null;
				previous = now;
				result = func.apply(context, args);
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	};

	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	_.debounce = function(func, wait, immediate) {
		var result;
		var timeout = null;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) result = func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) result = func.apply(context, args);
			return result;
		};
	};

	// Returns a function that will be executed at most one time, no matter how
	// often you call it. Useful for lazy initialization.
	_.once = function(func) {
		var ran = false, memo;
		return function() {
			if (ran) return memo;
			ran = true;
			memo = func.apply(this, arguments);
			func = null;
			return memo;
		};
	};

	// Returns the first function passed as an argument to the second,
	// allowing you to adjust arguments, run code before and after, and
	// conditionally execute the original function.
	_.wrap = function(func, wrapper) {
		return function() {
			var args = [func];
			push.apply(args, arguments);
			return wrapper.apply(this, args);
		};
	};

	// Returns a function that is the composition of a list of functions, each
	// consuming the return value of the function that follows.
	_.compose = function() {
		var funcs = arguments;
		return function() {
			var args = arguments;
			for (var i = funcs.length - 1; i >= 0; i--) {
				args = [funcs[i].apply(this, args)];
			}
			return args[0];
		};
	};

	// Returns a function that will only be executed after being called N times.
	_.after = function(times, func) {
		return function() {
			if (--times < 1) {
				return func.apply(this, arguments);
			}
		};
	};

	// Object Functions
	// ----------------

	// Retrieve the names of an object's properties.
	// Delegates to **ECMAScript 5**'s native `Object.keys`
	_.keys = nativeKeys || function(obj) {
		if (obj !== Object(obj)) throw new TypeError('Invalid object');
		var keys = [];
		for (var key in obj) if (_.has(obj, key)) keys.push(key);
		return keys;
	};

	// Retrieve the values of an object's properties.
	_.values = function(obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var values = new Array(length);
		for (var i = 0; i < length; i++) {
			values[i] = obj[keys[i]];
		}
		return values;
	};

	// Convert an object into a list of `[key, value]` pairs.
	_.pairs = function(obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var pairs = new Array(length);
		for (var i = 0; i < length; i++) {
			pairs[i] = [keys[i], obj[keys[i]]];
		}
		return pairs;
	};

	// Invert the keys and values of an object. The values must be serializable.
	_.invert = function(obj) {
		var result = {};
		var keys = _.keys(obj);
		for (var i = 0, length = keys.length; i < length; i++) {
			result[obj[keys[i]]] = keys[i];
		}
		return result;
	};

	// Return a sorted list of the function names available on the object.
	// Aliased as `methods`
	_.functions = _.methods = function(obj) {
		var names = [];
		for (var key in obj) {
			if (_.isFunction(obj[key])) names.push(key);
		}
		return names.sort();
	};

	// Extend a given object with all the properties in passed-in object(s).
	_.extend = function(obj) {
		each(slice.call(arguments, 1), function(source) {
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		});
		return obj;
	};

	// Return a copy of the object only containing the whitelisted properties.
	_.pick = function(obj) {
		var copy = {};
		var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		each(keys, function(key) {
			if (key in obj) copy[key] = obj[key];
		});
		return copy;
	};

	// Return a copy of the object without the blacklisted properties.
	_.omit = function(obj) {
		var copy = {};
		var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		for (var key in obj) {
			if (!_.contains(keys, key)) copy[key] = obj[key];
		}
		return copy;
	};

	// Fill in a given object with default properties.
	_.defaults = function(obj) {
		each(slice.call(arguments, 1), function(source) {
			if (source) {
				for (var prop in source) {
					if (obj[prop] === void 0) obj[prop] = source[prop];
				}
			}
		});
		return obj;
	};

	// Create a (shallow-cloned) duplicate of an object.
	_.clone = function(obj) {
		if (!_.isObject(obj)) return obj;
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	};

	// Invokes interceptor with the obj, and then returns obj.
	// The primary purpose of this method is to "tap into" a method chain, in
	// order to perform operations on intermediate results within the chain.
	_.tap = function(obj, interceptor) {
		interceptor(obj);
		return obj;
	};

	// Internal recursive comparison function for `isEqual`.
	var eq = function(a, b, aStack, bStack) {
		// Identical objects are equal. `0 === -0`, but they aren't identical.
		// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
		if (a === b) return a !== 0 || 1 / a == 1 / b;
		// A strict comparison is necessary because `null == undefined`.
		if (a == null || b == null) return a === b;
		// Unwrap any wrapped objects.
		if (a instanceof _) a = a._wrapped;
		if (b instanceof _) b = b._wrapped;
		// Compare `[[Class]]` names.
		var className = toString.call(a);
		if (className != toString.call(b)) return false;
		switch (className) {
			// Strings, numbers, dates, and booleans are compared by value.
			case '[object String]':
				// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
				// equivalent to `new String("5")`.
				return a == String(b);
			case '[object Number]':
				// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
				// other numeric values.
				return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
			case '[object Date]':
			case '[object Boolean]':
				// Coerce dates and booleans to numeric primitive values. Dates are compared by their
				// millisecond representations. Note that invalid dates with millisecond representations
				// of `NaN` are not equivalent.
				return +a == +b;
			// RegExps are compared by their source patterns and flags.
			case '[object RegExp]':
				return a.source == b.source &&
					a.global == b.global &&
					a.multiline == b.multiline &&
					a.ignoreCase == b.ignoreCase;
		}
		if (typeof a != 'object' || typeof b != 'object') return false;
		// Assume equality for cyclic structures. The algorithm for detecting cyclic
		// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
		var length = aStack.length;
		while (length--) {
			// Linear search. Performance is inversely proportional to the number of
			// unique nested structures.
			if (aStack[length] == a) return bStack[length] == b;
		}
		// Objects with different constructors are not equivalent, but `Object`s
		// from different frames are.
		var aCtor = a.constructor, bCtor = b.constructor;
		if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
			_.isFunction(bCtor) && (bCtor instanceof bCtor))) {
			return false;
		}
		// Add the first object to the stack of traversed objects.
		aStack.push(a);
		bStack.push(b);
		var size = 0, result = true;
		// Recursively compare objects and arrays.
		if (className == '[object Array]') {
			// Compare array lengths to determine if a deep comparison is necessary.
			size = a.length;
			result = size == b.length;
			if (result) {
				// Deep compare the contents, ignoring non-numeric properties.
				while (size--) {
					if (!(result = eq(a[size], b[size], aStack, bStack))) break;
				}
			}
		} else {
			// Deep compare objects.
			for (var key in a) {
				if (_.has(a, key)) {
					// Count the expected number of properties.
					size++;
					// Deep compare each member.
					if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
				}
			}
			// Ensure that both objects contain the same number of properties.
			if (result) {
				for (key in b) {
					if (_.has(b, key) && !(size--)) break;
				}
				result = !size;
			}
		}
		// Remove the first object from the stack of traversed objects.
		aStack.pop();
		bStack.pop();
		return result;
	};

	// Perform a deep comparison to check if two objects are equal.
	_.isEqual = function(a, b) {
		return eq(a, b, [], []);
	};

	// Is a given array, string, or object empty?
	// An "empty" object has no enumerable own-properties.
	_.isEmpty = function(obj) {
		if (obj == null) return true;
		if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
		for (var key in obj) if (_.has(obj, key)) return false;
		return true;
	};

	// Is a given value a DOM element?
	_.isElement = function(obj) {
		return !!(obj && obj.nodeType === 1);
	};

	// Is a given value an array?
	// Delegates to ECMA5's native Array.isArray
	_.isArray = nativeIsArray || function(obj) {
		return toString.call(obj) == '[object Array]';
	};

	// Is a given variable an object?
	_.isObject = function(obj) {
		return obj === Object(obj);
	};

	// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
	each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
		_['is' + name] = function(obj) {
			return toString.call(obj) == '[object ' + name + ']';
		};
	});

	// Define a fallback version of the method in browsers (ahem, IE), where
	// there isn't any inspectable "Arguments" type.
	if (!_.isArguments(arguments)) {
		_.isArguments = function(obj) {
			return !!(obj && _.has(obj, 'callee'));
		};
	}

	// Optimize `isFunction` if appropriate.
	if (typeof (/./) !== 'function') {
		_.isFunction = function(obj) {
			return typeof obj === 'function';
		};
	}

	// Is a given object a finite number?
	_.isFinite = function(obj) {
		return isFinite(obj) && !isNaN(parseFloat(obj));
	};

	// Is the given value `NaN`? (NaN is the only number which does not equal itself).
	_.isNaN = function(obj) {
		return _.isNumber(obj) && obj != +obj;
	};

	// Is a given value a boolean?
	_.isBoolean = function(obj) {
		return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
	};

	// Is a given value equal to null?
	_.isNull = function(obj) {
		return obj === null;
	};

	// Is a given variable undefined?
	_.isUndefined = function(obj) {
		return obj === void 0;
	};

	// Shortcut function for checking if an object has a given property directly
	// on itself (in other words, not on a prototype).
	_.has = function(obj, key) {
		return hasOwnProperty.call(obj, key);
	};

	// Utility Functions
	// -----------------

	// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	// previous owner. Returns a reference to the Underscore object.
	_.noConflict = function() {
		root._ = previousUnderscore;
		return this;
	};

	// Keep the identity function around for default iterators.
	_.identity = function(value) {
		return value;
	};

	// Run a function **n** times.
	_.times = function(n, iterator, context) {
		var accum = Array(Math.max(0, n));
		for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
		return accum;
	};

	// Return a random integer between min and max (inclusive).
	_.random = function(min, max) {
		if (max == null) {
			max = min;
			min = 0;
		}
		return min + Math.floor(Math.random() * (max - min + 1));
	};

	// List of HTML entities for escaping.
	var entityMap = {
		escape: {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;'
		}
	};
	entityMap.unescape = _.invert(entityMap.escape);

	// Regexes containing the keys and values listed immediately above.
	var entityRegexes = {
		escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
		unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
	};

	// Functions for escaping and unescaping strings to/from HTML interpolation.
	_.each(['escape', 'unescape'], function(method) {
		_[method] = function(string) {
			if (string == null) return '';
			return ('' + string).replace(entityRegexes[method], function(match) {
				return entityMap[method][match];
			});
		};
	});

	// If the value of the named `property` is a function then invoke it with the
	// `object` as context; otherwise, return it.
	_.result = function(object, property) {
		if (object == null) return void 0;
		var value = object[property];
		return _.isFunction(value) ? value.call(object) : value;
	};

	// Add your own custom functions to the Underscore object.
	_.mixin = function(obj) {
		each(_.functions(obj), function(name) {
			var func = _[name] = obj[name];
			_.prototype[name] = function() {
				var args = [this._wrapped];
				push.apply(args, arguments);
				return result.call(this, func.apply(_, args));
			};
		});
	};

	// Generate a unique integer id (unique within the entire client session).
	// Useful for temporary DOM ids.
	var idCounter = 0;
	_.uniqueId = function(prefix) {
		var id = ++idCounter + '';
		return prefix ? prefix + id : id;
	};

	// By default, Underscore uses ERB-style template delimiters, change the
	// following template settings to use alternative delimiters.
	_.templateSettings = {
		evaluate    : /<%([\s\S]+?)%>/g,
		interpolate : /<%=([\s\S]+?)%>/g,
		escape      : /<%-([\s\S]+?)%>/g
	};

	// When customizing `templateSettings`, if you don't want to define an
	// interpolation, evaluation or escaping regex, we need one that is
	// guaranteed not to match.
	var noMatch = /(.)^/;

	// Certain characters need to be escaped so that they can be put into a
	// string literal.
	var escapes = {
		"'":      "'",
		'\\':     '\\',
		'\r':     'r',
		'\n':     'n',
		'\t':     't',
		'\u2028': 'u2028',
		'\u2029': 'u2029'
	};

	var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

	// JavaScript micro-templating, similar to John Resig's implementation.
	// Underscore templating handles arbitrary delimiters, preserves whitespace,
	// and correctly escapes quotes within interpolated code.
	_.template = function(text, data, settings) {
		var render;
		settings = _.defaults({}, settings, _.templateSettings);

		// Combine delimiters into one regular expression via alternation.
		var matcher = new RegExp([
			(settings.escape || noMatch).source,
			(settings.interpolate || noMatch).source,
			(settings.evaluate || noMatch).source
		].join('|') + '|$', 'g');

		// Compile the template source, escaping string literals appropriately.
		var index = 0;
		var source = "__p+='";
		text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
			source += text.slice(index, offset)
				.replace(escaper, function(match) { return '\\' + escapes[match]; });

			if (escape) {
				source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
			}
			if (interpolate) {
				source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
			}
			if (evaluate) {
				source += "';\n" + evaluate + "\n__p+='";
			}
			index = offset + match.length;
			return match;
		});
		source += "';\n";

		// If a variable is not specified, place data values in local scope.
		if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

		source = "var __t,__p='',__j=Array.prototype.join," +
			"print=function(){__p+=__j.call(arguments,'');};\n" +
			source + "return __p;\n";

		try {
			render = new Function(settings.variable || 'obj', '_', source);
		} catch (e) {
			e.source = source;
			throw e;
		}

		if (data) return render(data, _);
		var template = function(data) {
			return render.call(this, data, _);
		};

		// Provide the compiled function source as a convenience for precompilation.
		template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

		return template;
	};

	// Add a "chain" function, which will delegate to the wrapper.
	_.chain = function(obj) {
		return _(obj).chain();
	};

	// OOP
	// ---------------
	// If Underscore is called as a function, it returns a wrapped object that
	// can be used OO-style. This wrapper holds altered versions of all the
	// underscore functions. Wrapped objects may be chained.

	// Helper function to continue chaining intermediate results.
	var result = function(obj) {
		return this._chain ? _(obj).chain() : obj;
	};

	// Add all of the Underscore functions to the wrapper object.
	_.mixin(_);

	// Add all mutator Array functions to the wrapper.
	each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
		var method = ArrayProto[name];
		_.prototype[name] = function() {
			var obj = this._wrapped;
			method.apply(obj, arguments);
			if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
			return result.call(this, obj);
		};
	});

	// Add all accessor Array functions to the wrapper.
	each(['concat', 'join', 'slice'], function(name) {
		var method = ArrayProto[name];
		_.prototype[name] = function() {
			return result.call(this, method.apply(this._wrapped, arguments));
		};
	});

	_.extend(_.prototype, {

		// Start chaining a wrapped Underscore object.
		chain: function() {
			this._chain = true;
			return this;
		},

		// Extracts the result from a wrapped and chained object.
		value: function() {
			return this._wrapped;
		}

	});

}).call(this);
/*

 Copyright (C) 2011 by Yehuda Katz

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 */

// lib/handlebars/browser-prefix.js
var Handlebars = {};

(function(Handlebars, undefined) {
	;
// lib/handlebars/base.js

	Handlebars.VERSION = "1.0.0";
	Handlebars.COMPILER_REVISION = 4;

	Handlebars.REVISION_CHANGES = {
		1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
		2: '== 1.0.0-rc.3',
		3: '== 1.0.0-rc.4',
		4: '>= 1.0.0'
	};

	Handlebars.helpers  = {};
	Handlebars.partials = {};

	var toString = Object.prototype.toString,
		functionType = '[object Function]',
		objectType = '[object Object]';

	Handlebars.registerHelper = function(name, fn, inverse) {
		if (toString.call(name) === objectType) {
			if (inverse || fn) { throw new Handlebars.Exception('Arg not supported with multiple helpers'); }
			Handlebars.Utils.extend(this.helpers, name);
		} else {
			if (inverse) { fn.not = inverse; }
			this.helpers[name] = fn;
		}
	};

	Handlebars.registerPartial = function(name, str) {
		if (toString.call(name) === objectType) {
			Handlebars.Utils.extend(this.partials,  name);
		} else {
			this.partials[name] = str;
		}
	};

	Handlebars.registerHelper('helperMissing', function(arg) {
		if(arguments.length === 2) {
			return undefined;
		} else {
			throw new Error("Missing helper: '" + arg + "'");
		}
	});

	Handlebars.registerHelper('blockHelperMissing', function(context, options) {
		var inverse = options.inverse || function() {}, fn = options.fn;

		var type = toString.call(context);

		if(type === functionType) { context = context.call(this); }

		if(context === true) {
			return fn(this);
		} else if(context === false || context == null) {
			return inverse(this);
		} else if(type === "[object Array]") {
			if(context.length > 0) {
				return Handlebars.helpers.each(context, options);
			} else {
				return inverse(this);
			}
		} else {
			return fn(context);
		}
	});

	Handlebars.K = function() {};

	Handlebars.createFrame = Object.create || function(object) {
		Handlebars.K.prototype = object;
		var obj = new Handlebars.K();
		Handlebars.K.prototype = null;
		return obj;
	};

	Handlebars.logger = {
		DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

		methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

		// can be overridden in the host environment
		log: function(level, obj) {
			if (Handlebars.logger.level <= level) {
				var method = Handlebars.logger.methodMap[level];
				if (typeof console !== 'undefined' && console[method]) {
					console[method].call(console, obj);
				}
			}
		}
	};

	Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

	Handlebars.registerHelper('each', function(context, options) {
		var fn = options.fn, inverse = options.inverse;
		var i = 0, ret = "", data;

		var type = toString.call(context);
		if(type === functionType) { context = context.call(this); }

		if (options.data) {
			data = Handlebars.createFrame(options.data);
		}

		if(context && typeof context === 'object') {
			if(context instanceof Array){
				for(var j = context.length; i<j; i++) {
					if (data) { data.index = i; }
					ret = ret + fn(context[i], { data: data });
				}
			} else {
				for(var key in context) {
					if(context.hasOwnProperty(key)) {
						if(data) { data.key = key; }
						ret = ret + fn(context[key], {data: data});
						i++;
					}
				}
			}
		}

		if(i === 0){
			ret = inverse(this);
		}

		return ret;
	});

	Handlebars.registerHelper('if', function(conditional, options) {
		var type = toString.call(conditional);
		if(type === functionType) { conditional = conditional.call(this); }

		if(!conditional || Handlebars.Utils.isEmpty(conditional)) {
			return options.inverse(this);
		} else {
			return options.fn(this);
		}
	});

	Handlebars.registerHelper('unless', function(conditional, options) {
		return Handlebars.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn});
	});

	Handlebars.registerHelper('with', function(context, options) {
		var type = toString.call(context);
		if(type === functionType) { context = context.call(this); }

		if (!Handlebars.Utils.isEmpty(context)) return options.fn(context);
	});

	Handlebars.registerHelper('log', function(context, options) {
		var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
		Handlebars.log(level, context);
	});
	;
// lib/handlebars/compiler/parser.js
	/* Jison generated parser */
	var handlebars = (function(){
		var parser = {trace: function trace() { },
			yy: {},
			symbols_: {"error":2,"root":3,"program":4,"EOF":5,"simpleInverse":6,"statements":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"inMustache":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"CLOSE_UNESCAPED":24,"OPEN_PARTIAL":25,"partialName":26,"params":27,"hash":28,"dataName":29,"param":30,"STRING":31,"INTEGER":32,"BOOLEAN":33,"hashSegments":34,"hashSegment":35,"ID":36,"EQUALS":37,"DATA":38,"pathSegments":39,"SEP":40,"$accept":0,"$end":1},
			terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"CLOSE_UNESCAPED",25:"OPEN_PARTIAL",31:"STRING",32:"INTEGER",33:"BOOLEAN",36:"ID",37:"EQUALS",38:"DATA",40:"SEP"},
			productions_: [0,[3,2],[4,2],[4,3],[4,2],[4,1],[4,1],[4,0],[7,1],[7,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,3],[13,4],[6,2],[17,3],[17,2],[17,2],[17,1],[17,1],[27,2],[27,1],[30,1],[30,1],[30,1],[30,1],[30,1],[28,1],[34,2],[34,1],[35,3],[35,3],[35,3],[35,3],[35,3],[26,1],[26,1],[26,1],[29,2],[21,1],[39,3],[39,1]],
			performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

				var $0 = $$.length - 1;
				switch (yystate) {
					case 1: return $$[$0-1];
						break;
					case 2: this.$ = new yy.ProgramNode([], $$[$0]);
						break;
					case 3: this.$ = new yy.ProgramNode($$[$0-2], $$[$0]);
						break;
					case 4: this.$ = new yy.ProgramNode($$[$0-1], []);
						break;
					case 5: this.$ = new yy.ProgramNode($$[$0]);
						break;
					case 6: this.$ = new yy.ProgramNode([], []);
						break;
					case 7: this.$ = new yy.ProgramNode([]);
						break;
					case 8: this.$ = [$$[$0]];
						break;
					case 9: $$[$0-1].push($$[$0]); this.$ = $$[$0-1];
						break;
					case 10: this.$ = new yy.BlockNode($$[$0-2], $$[$0-1].inverse, $$[$0-1], $$[$0]);
						break;
					case 11: this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0-1].inverse, $$[$0]);
						break;
					case 12: this.$ = $$[$0];
						break;
					case 13: this.$ = $$[$0];
						break;
					case 14: this.$ = new yy.ContentNode($$[$0]);
						break;
					case 15: this.$ = new yy.CommentNode($$[$0]);
						break;
					case 16: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]);
						break;
					case 17: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]);
						break;
					case 18: this.$ = $$[$0-1];
						break;
					case 19:
						// Parsing out the '&' escape token at this level saves ~500 bytes after min due to the removal of one parser node.
						this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], $$[$0-2][2] === '&');

						break;
					case 20: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], true);
						break;
					case 21: this.$ = new yy.PartialNode($$[$0-1]);
						break;
					case 22: this.$ = new yy.PartialNode($$[$0-2], $$[$0-1]);
						break;
					case 23:
						break;
					case 24: this.$ = [[$$[$0-2]].concat($$[$0-1]), $$[$0]];
						break;
					case 25: this.$ = [[$$[$0-1]].concat($$[$0]), null];
						break;
					case 26: this.$ = [[$$[$0-1]], $$[$0]];
						break;
					case 27: this.$ = [[$$[$0]], null];
						break;
					case 28: this.$ = [[$$[$0]], null];
						break;
					case 29: $$[$0-1].push($$[$0]); this.$ = $$[$0-1];
						break;
					case 30: this.$ = [$$[$0]];
						break;
					case 31: this.$ = $$[$0];
						break;
					case 32: this.$ = new yy.StringNode($$[$0]);
						break;
					case 33: this.$ = new yy.IntegerNode($$[$0]);
						break;
					case 34: this.$ = new yy.BooleanNode($$[$0]);
						break;
					case 35: this.$ = $$[$0];
						break;
					case 36: this.$ = new yy.HashNode($$[$0]);
						break;
					case 37: $$[$0-1].push($$[$0]); this.$ = $$[$0-1];
						break;
					case 38: this.$ = [$$[$0]];
						break;
					case 39: this.$ = [$$[$0-2], $$[$0]];
						break;
					case 40: this.$ = [$$[$0-2], new yy.StringNode($$[$0])];
						break;
					case 41: this.$ = [$$[$0-2], new yy.IntegerNode($$[$0])];
						break;
					case 42: this.$ = [$$[$0-2], new yy.BooleanNode($$[$0])];
						break;
					case 43: this.$ = [$$[$0-2], $$[$0]];
						break;
					case 44: this.$ = new yy.PartialNameNode($$[$0]);
						break;
					case 45: this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0]));
						break;
					case 46: this.$ = new yy.PartialNameNode(new yy.IntegerNode($$[$0]));
						break;
					case 47: this.$ = new yy.DataNode($$[$0]);
						break;
					case 48: this.$ = new yy.IdNode($$[$0]);
						break;
					case 49: $$[$0-2].push({part: $$[$0], separator: $$[$0-1]}); this.$ = $$[$0-2];
						break;
					case 50: this.$ = [{part: $$[$0]}];
						break;
				}
			},
			table: [{3:1,4:2,5:[2,7],6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],22:[1,14],23:[1,15],25:[1,16]},{1:[3]},{5:[1,17]},{5:[2,6],7:18,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,6],22:[1,14],23:[1,15],25:[1,16]},{5:[2,5],6:20,8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,5],22:[1,14],23:[1,15],25:[1,16]},{17:23,18:[1,22],21:24,29:25,36:[1,28],38:[1,27],39:26},{5:[2,8],14:[2,8],15:[2,8],16:[2,8],19:[2,8],20:[2,8],22:[2,8],23:[2,8],25:[2,8]},{4:29,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],25:[1,16]},{4:30,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],25:[1,16]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],25:[2,12]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],25:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],25:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],25:[2,15]},{17:31,21:24,29:25,36:[1,28],38:[1,27],39:26},{17:32,21:24,29:25,36:[1,28],38:[1,27],39:26},{17:33,21:24,29:25,36:[1,28],38:[1,27],39:26},{21:35,26:34,31:[1,36],32:[1,37],36:[1,28],39:26},{1:[2,1]},{5:[2,2],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,2],22:[1,14],23:[1,15],25:[1,16]},{17:23,21:24,29:25,36:[1,28],38:[1,27],39:26},{5:[2,4],7:38,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,4],22:[1,14],23:[1,15],25:[1,16]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],25:[2,9]},{5:[2,23],14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],25:[2,23]},{18:[1,39]},{18:[2,27],21:44,24:[2,27],27:40,28:41,29:48,30:42,31:[1,45],32:[1,46],33:[1,47],34:43,35:49,36:[1,50],38:[1,27],39:26},{18:[2,28],24:[2,28]},{18:[2,48],24:[2,48],31:[2,48],32:[2,48],33:[2,48],36:[2,48],38:[2,48],40:[1,51]},{21:52,36:[1,28],39:26},{18:[2,50],24:[2,50],31:[2,50],32:[2,50],33:[2,50],36:[2,50],38:[2,50],40:[2,50]},{10:53,20:[1,54]},{10:55,20:[1,54]},{18:[1,56]},{18:[1,57]},{24:[1,58]},{18:[1,59],21:60,36:[1,28],39:26},{18:[2,44],36:[2,44]},{18:[2,45],36:[2,45]},{18:[2,46],36:[2,46]},{5:[2,3],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,3],22:[1,14],23:[1,15],25:[1,16]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],25:[2,17]},{18:[2,25],21:44,24:[2,25],28:61,29:48,30:62,31:[1,45],32:[1,46],33:[1,47],34:43,35:49,36:[1,50],38:[1,27],39:26},{18:[2,26],24:[2,26]},{18:[2,30],24:[2,30],31:[2,30],32:[2,30],33:[2,30],36:[2,30],38:[2,30]},{18:[2,36],24:[2,36],35:63,36:[1,64]},{18:[2,31],24:[2,31],31:[2,31],32:[2,31],33:[2,31],36:[2,31],38:[2,31]},{18:[2,32],24:[2,32],31:[2,32],32:[2,32],33:[2,32],36:[2,32],38:[2,32]},{18:[2,33],24:[2,33],31:[2,33],32:[2,33],33:[2,33],36:[2,33],38:[2,33]},{18:[2,34],24:[2,34],31:[2,34],32:[2,34],33:[2,34],36:[2,34],38:[2,34]},{18:[2,35],24:[2,35],31:[2,35],32:[2,35],33:[2,35],36:[2,35],38:[2,35]},{18:[2,38],24:[2,38],36:[2,38]},{18:[2,50],24:[2,50],31:[2,50],32:[2,50],33:[2,50],36:[2,50],37:[1,65],38:[2,50],40:[2,50]},{36:[1,66]},{18:[2,47],24:[2,47],31:[2,47],32:[2,47],33:[2,47],36:[2,47],38:[2,47]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],25:[2,10]},{21:67,36:[1,28],39:26},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],25:[2,11]},{14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],25:[2,16]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],25:[2,19]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],25:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],25:[2,21]},{18:[1,68]},{18:[2,24],24:[2,24]},{18:[2,29],24:[2,29],31:[2,29],32:[2,29],33:[2,29],36:[2,29],38:[2,29]},{18:[2,37],24:[2,37],36:[2,37]},{37:[1,65]},{21:69,29:73,31:[1,70],32:[1,71],33:[1,72],36:[1,28],38:[1,27],39:26},{18:[2,49],24:[2,49],31:[2,49],32:[2,49],33:[2,49],36:[2,49],38:[2,49],40:[2,49]},{18:[1,74]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],25:[2,22]},{18:[2,39],24:[2,39],36:[2,39]},{18:[2,40],24:[2,40],36:[2,40]},{18:[2,41],24:[2,41],36:[2,41]},{18:[2,42],24:[2,42],36:[2,42]},{18:[2,43],24:[2,43],36:[2,43]},{5:[2,18],14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],25:[2,18]}],
			defaultActions: {17:[2,1]},
			parseError: function parseError(str, hash) {
				throw new Error(str);
			},
			parse: function parse(input) {
				var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
				this.lexer.setInput(input);
				this.lexer.yy = this.yy;
				this.yy.lexer = this.lexer;
				this.yy.parser = this;
				if (typeof this.lexer.yylloc == "undefined")
					this.lexer.yylloc = {};
				var yyloc = this.lexer.yylloc;
				lstack.push(yyloc);
				var ranges = this.lexer.options && this.lexer.options.ranges;
				if (typeof this.yy.parseError === "function")
					this.parseError = this.yy.parseError;
				function popStack(n) {
					stack.length = stack.length - 2 * n;
					vstack.length = vstack.length - n;
					lstack.length = lstack.length - n;
				}
				function lex() {
					var token;
					token = self.lexer.lex() || 1;
					if (typeof token !== "number") {
						token = self.symbols_[token] || token;
					}
					return token;
				}
				var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
				while (true) {
					state = stack[stack.length - 1];
					if (this.defaultActions[state]) {
						action = this.defaultActions[state];
					} else {
						if (symbol === null || typeof symbol == "undefined") {
							symbol = lex();
						}
						action = table[state] && table[state][symbol];
					}
					if (typeof action === "undefined" || !action.length || !action[0]) {
						var errStr = "";
						if (!recovering) {
							expected = [];
							for (p in table[state])
								if (this.terminals_[p] && p > 2) {
									expected.push("'" + this.terminals_[p] + "'");
								}
							if (this.lexer.showPosition) {
								errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
							} else {
								errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
							}
							this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
						}
					}
					if (action[0] instanceof Array && action.length > 1) {
						throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
					}
					switch (action[0]) {
						case 1:
							stack.push(symbol);
							vstack.push(this.lexer.yytext);
							lstack.push(this.lexer.yylloc);
							stack.push(action[1]);
							symbol = null;
							if (!preErrorSymbol) {
								yyleng = this.lexer.yyleng;
								yytext = this.lexer.yytext;
								yylineno = this.lexer.yylineno;
								yyloc = this.lexer.yylloc;
								if (recovering > 0)
									recovering--;
							} else {
								symbol = preErrorSymbol;
								preErrorSymbol = null;
							}
							break;
						case 2:
							len = this.productions_[action[1]][1];
							yyval.$ = vstack[vstack.length - len];
							yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
							if (ranges) {
								yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
							}
							r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
							if (typeof r !== "undefined") {
								return r;
							}
							if (len) {
								stack = stack.slice(0, -1 * len * 2);
								vstack = vstack.slice(0, -1 * len);
								lstack = lstack.slice(0, -1 * len);
							}
							stack.push(this.productions_[action[1]][0]);
							vstack.push(yyval.$);
							lstack.push(yyval._$);
							newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
							stack.push(newState);
							break;
						case 3:
							return true;
					}
				}
				return true;
			}
		};
		/* Jison generated lexer */
		var lexer = (function(){
			var lexer = ({EOF:1,
				parseError:function parseError(str, hash) {
					if (this.yy.parser) {
						this.yy.parser.parseError(str, hash);
					} else {
						throw new Error(str);
					}
				},
				setInput:function (input) {
					this._input = input;
					this._more = this._less = this.done = false;
					this.yylineno = this.yyleng = 0;
					this.yytext = this.matched = this.match = '';
					this.conditionStack = ['INITIAL'];
					this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
					if (this.options.ranges) this.yylloc.range = [0,0];
					this.offset = 0;
					return this;
				},
				input:function () {
					var ch = this._input[0];
					this.yytext += ch;
					this.yyleng++;
					this.offset++;
					this.match += ch;
					this.matched += ch;
					var lines = ch.match(/(?:\r\n?|\n).*/g);
					if (lines) {
						this.yylineno++;
						this.yylloc.last_line++;
					} else {
						this.yylloc.last_column++;
					}
					if (this.options.ranges) this.yylloc.range[1]++;

					this._input = this._input.slice(1);
					return ch;
				},
				unput:function (ch) {
					var len = ch.length;
					var lines = ch.split(/(?:\r\n?|\n)/g);

					this._input = ch + this._input;
					this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
					//this.yyleng -= len;
					this.offset -= len;
					var oldLines = this.match.split(/(?:\r\n?|\n)/g);
					this.match = this.match.substr(0, this.match.length-1);
					this.matched = this.matched.substr(0, this.matched.length-1);

					if (lines.length-1) this.yylineno -= lines.length-1;
					var r = this.yylloc.range;

					this.yylloc = {first_line: this.yylloc.first_line,
						last_line: this.yylineno+1,
						first_column: this.yylloc.first_column,
						last_column: lines ?
							(lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
							this.yylloc.first_column - len
					};

					if (this.options.ranges) {
						this.yylloc.range = [r[0], r[0] + this.yyleng - len];
					}
					return this;
				},
				more:function () {
					this._more = true;
					return this;
				},
				less:function (n) {
					this.unput(this.match.slice(n));
				},
				pastInput:function () {
					var past = this.matched.substr(0, this.matched.length - this.match.length);
					return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
				},
				upcomingInput:function () {
					var next = this.match;
					if (next.length < 20) {
						next += this._input.substr(0, 20-next.length);
					}
					return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
				},
				showPosition:function () {
					var pre = this.pastInput();
					var c = new Array(pre.length + 1).join("-");
					return pre + this.upcomingInput() + "\n" + c+"^";
				},
				next:function () {
					if (this.done) {
						return this.EOF;
					}
					if (!this._input) this.done = true;

					var token,
						match,
						tempMatch,
						index,
						col,
						lines;
					if (!this._more) {
						this.yytext = '';
						this.match = '';
					}
					var rules = this._currentRules();
					for (var i=0;i < rules.length; i++) {
						tempMatch = this._input.match(this.rules[rules[i]]);
						if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
							match = tempMatch;
							index = i;
							if (!this.options.flex) break;
						}
					}
					if (match) {
						lines = match[0].match(/(?:\r\n?|\n).*/g);
						if (lines) this.yylineno += lines.length;
						this.yylloc = {first_line: this.yylloc.last_line,
							last_line: this.yylineno+1,
							first_column: this.yylloc.last_column,
							last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
						this.yytext += match[0];
						this.match += match[0];
						this.matches = match;
						this.yyleng = this.yytext.length;
						if (this.options.ranges) {
							this.yylloc.range = [this.offset, this.offset += this.yyleng];
						}
						this._more = false;
						this._input = this._input.slice(match[0].length);
						this.matched += match[0];
						token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
						if (this.done && this._input) this.done = false;
						if (token) return token;
						else return;
					}
					if (this._input === "") {
						return this.EOF;
					} else {
						return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
							{text: "", token: null, line: this.yylineno});
					}
				},
				lex:function lex() {
					var r = this.next();
					if (typeof r !== 'undefined') {
						return r;
					} else {
						return this.lex();
					}
				},
				begin:function begin(condition) {
					this.conditionStack.push(condition);
				},
				popState:function popState() {
					return this.conditionStack.pop();
				},
				_currentRules:function _currentRules() {
					return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
				},
				topState:function () {
					return this.conditionStack[this.conditionStack.length-2];
				},
				pushState:function begin(condition) {
					this.begin(condition);
				}});
			lexer.options = {};
			lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

				var YYSTATE=YY_START
				switch($avoiding_name_collisions) {
					case 0: yy_.yytext = "\\"; return 14;
						break;
					case 1:
						if(yy_.yytext.slice(-1) !== "\\") this.begin("mu");
						if(yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0,yy_.yyleng-1), this.begin("emu");
						if(yy_.yytext) return 14;

						break;
					case 2: return 14;
						break;
					case 3:
						if(yy_.yytext.slice(-1) !== "\\") this.popState();
						if(yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0,yy_.yyleng-1);
						return 14;

						break;
					case 4: yy_.yytext = yy_.yytext.substr(0, yy_.yyleng-4); this.popState(); return 15;
						break;
					case 5: return 25;
						break;
					case 6: return 16;
						break;
					case 7: return 20;
						break;
					case 8: return 19;
						break;
					case 9: return 19;
						break;
					case 10: return 23;
						break;
					case 11: return 22;
						break;
					case 12: this.popState(); this.begin('com');
						break;
					case 13: yy_.yytext = yy_.yytext.substr(3,yy_.yyleng-5); this.popState(); return 15;
						break;
					case 14: return 22;
						break;
					case 15: return 37;
						break;
					case 16: return 36;
						break;
					case 17: return 36;
						break;
					case 18: return 40;
						break;
					case 19: /*ignore whitespace*/
						break;
					case 20: this.popState(); return 24;
						break;
					case 21: this.popState(); return 18;
						break;
					case 22: yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\"/g,'"'); return 31;
						break;
					case 23: yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\'/g,"'"); return 31;
						break;
					case 24: return 38;
						break;
					case 25: return 33;
						break;
					case 26: return 33;
						break;
					case 27: return 32;
						break;
					case 28: return 36;
						break;
					case 29: yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 36;
						break;
					case 30: return 'INVALID';
						break;
					case 31: return 5;
						break;
				}
			};
			lexer.rules = [/^(?:\\\\(?=(\{\{)))/,/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\{\{>)/,/^(?:\{\{#)/,/^(?:\{\{\/)/,/^(?:\{\{\^)/,/^(?:\{\{\s*else\b)/,/^(?:\{\{\{)/,/^(?:\{\{&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{)/,/^(?:=)/,/^(?:\.(?=[}\/ ]))/,/^(?:\.\.)/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}\}\})/,/^(?:\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=[}\s]))/,/^(?:false(?=[}\s]))/,/^(?:-?[0-9]+(?=[}\s]))/,/^(?:[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.]))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];
			lexer.conditions = {"mu":{"rules":[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],"inclusive":false},"emu":{"rules":[3],"inclusive":false},"com":{"rules":[4],"inclusive":false},"INITIAL":{"rules":[0,1,2,31],"inclusive":true}};
			return lexer;})()
		parser.lexer = lexer;
		function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
		return new Parser;
	})();;
// lib/handlebars/compiler/base.js

	Handlebars.Parser = handlebars;

	Handlebars.parse = function(input) {

		// Just return if an already-compile AST was passed in.
		if(input.constructor === Handlebars.AST.ProgramNode) { return input; }

		Handlebars.Parser.yy = Handlebars.AST;
		return Handlebars.Parser.parse(input);
	};
	;
// lib/handlebars/compiler/ast.js
	Handlebars.AST = {};

	Handlebars.AST.ProgramNode = function(statements, inverse) {
		this.type = "program";
		this.statements = statements;
		if(inverse) { this.inverse = new Handlebars.AST.ProgramNode(inverse); }
	};

	Handlebars.AST.MustacheNode = function(rawParams, hash, unescaped) {
		this.type = "mustache";
		this.escaped = !unescaped;
		this.hash = hash;

		var id = this.id = rawParams[0];
		var params = this.params = rawParams.slice(1);

		// a mustache is an eligible helper if:
		// * its id is simple (a single part, not `this` or `..`)
		var eligibleHelper = this.eligibleHelper = id.isSimple;

		// a mustache is definitely a helper if:
		// * it is an eligible helper, and
		// * it has at least one parameter or hash segment
		this.isHelper = eligibleHelper && (params.length || hash);

		// if a mustache is an eligible helper but not a definite
		// helper, it is ambiguous, and will be resolved in a later
		// pass or at runtime.
	};

	Handlebars.AST.PartialNode = function(partialName, context) {
		this.type         = "partial";
		this.partialName  = partialName;
		this.context      = context;
	};

	Handlebars.AST.BlockNode = function(mustache, program, inverse, close) {
		var verifyMatch = function(open, close) {
			if(open.original !== close.original) {
				throw new Handlebars.Exception(open.original + " doesn't match " + close.original);
			}
		};

		verifyMatch(mustache.id, close);
		this.type = "block";
		this.mustache = mustache;
		this.program  = program;
		this.inverse  = inverse;

		if (this.inverse && !this.program) {
			this.isInverse = true;
		}
	};

	Handlebars.AST.ContentNode = function(string) {
		this.type = "content";
		this.string = string;
	};

	Handlebars.AST.HashNode = function(pairs) {
		this.type = "hash";
		this.pairs = pairs;
	};

	Handlebars.AST.IdNode = function(parts) {
		this.type = "ID";

		var original = "",
			dig = [],
			depth = 0;

		for(var i=0,l=parts.length; i<l; i++) {
			var part = parts[i].part;
			original += (parts[i].separator || '') + part;

			if (part === ".." || part === "." || part === "this") {
				if (dig.length > 0) { throw new Handlebars.Exception("Invalid path: " + original); }
				else if (part === "..") { depth++; }
				else { this.isScoped = true; }
			}
			else { dig.push(part); }
		}

		this.original = original;
		this.parts    = dig;
		this.string   = dig.join('.');
		this.depth    = depth;

		// an ID is simple if it only has one part, and that part is not
		// `..` or `this`.
		this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

		this.stringModeValue = this.string;
	};

	Handlebars.AST.PartialNameNode = function(name) {
		this.type = "PARTIAL_NAME";
		this.name = name.original;
	};

	Handlebars.AST.DataNode = function(id) {
		this.type = "DATA";
		this.id = id;
	};

	Handlebars.AST.StringNode = function(string) {
		this.type = "STRING";
		this.original =
			this.string =
				this.stringModeValue = string;
	};

	Handlebars.AST.IntegerNode = function(integer) {
		this.type = "INTEGER";
		this.original =
			this.integer = integer;
		this.stringModeValue = Number(integer);
	};

	Handlebars.AST.BooleanNode = function(bool) {
		this.type = "BOOLEAN";
		this.bool = bool;
		this.stringModeValue = bool === "true";
	};

	Handlebars.AST.CommentNode = function(comment) {
		this.type = "comment";
		this.comment = comment;
	};
	;
// lib/handlebars/utils.js

	var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

	Handlebars.Exception = function(message) {
		var tmp = Error.prototype.constructor.apply(this, arguments);

		// Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
		for (var idx = 0; idx < errorProps.length; idx++) {
			this[errorProps[idx]] = tmp[errorProps[idx]];
		}
	};
	Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
	Handlebars.SafeString = function(string) {
		this.string = string;
	};
	Handlebars.SafeString.prototype.toString = function() {
		return this.string.toString();
	};

	var escape = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#x27;",
		"`": "&#x60;"
	};

	var badChars = /[&<>"'`]/g;
	var possible = /[&<>"'`]/;

	var escapeChar = function(chr) {
		return escape[chr] || "&amp;";
	};

	Handlebars.Utils = {
		extend: function(obj, value) {
			for(var key in value) {
				if(value.hasOwnProperty(key)) {
					obj[key] = value[key];
				}
			}
		},

		escapeExpression: function(string) {
			// don't escape SafeStrings, since they're already safe
			if (string instanceof Handlebars.SafeString) {
				return string.toString();
			} else if (string == null || string === false) {
				return "";
			}

			// Force a string conversion as this will be done by the append regardless and
			// the regex test will do this transparently behind the scenes, causing issues if
			// an object's to string has escaped characters in it.
			string = string.toString();

			if(!possible.test(string)) { return string; }
			return string.replace(badChars, escapeChar);
		},

		isEmpty: function(value) {
			if (!value && value !== 0) {
				return true;
			} else if(toString.call(value) === "[object Array]" && value.length === 0) {
				return true;
			} else {
				return false;
			}
		}
	};
	;
// lib/handlebars/compiler/compiler.js

	/*jshint eqnull:true*/
	var Compiler = Handlebars.Compiler = function() {};
	var JavaScriptCompiler = Handlebars.JavaScriptCompiler = function() {};

// the foundHelper register will disambiguate helper lookup from finding a
// function in a context. This is necessary for mustache compatibility, which
// requires that context functions in blocks are evaluated by blockHelperMissing,
// and then proceed as if the resulting value was provided to blockHelperMissing.

	Compiler.prototype = {
		compiler: Compiler,

		disassemble: function() {
			var opcodes = this.opcodes, opcode, out = [], params, param;

			for (var i=0, l=opcodes.length; i<l; i++) {
				opcode = opcodes[i];

				if (opcode.opcode === 'DECLARE') {
					out.push("DECLARE " + opcode.name + "=" + opcode.value);
				} else {
					params = [];
					for (var j=0; j<opcode.args.length; j++) {
						param = opcode.args[j];
						if (typeof param === "string") {
							param = "\"" + param.replace("\n", "\\n") + "\"";
						}
						params.push(param);
					}
					out.push(opcode.opcode + " " + params.join(" "));
				}
			}

			return out.join("\n");
		},
		equals: function(other) {
			var len = this.opcodes.length;
			if (other.opcodes.length !== len) {
				return false;
			}

			for (var i = 0; i < len; i++) {
				var opcode = this.opcodes[i],
					otherOpcode = other.opcodes[i];
				if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
					return false;
				}
				for (var j = 0; j < opcode.args.length; j++) {
					if (opcode.args[j] !== otherOpcode.args[j]) {
						return false;
					}
				}
			}

			len = this.children.length;
			if (other.children.length !== len) {
				return false;
			}
			for (i = 0; i < len; i++) {
				if (!this.children[i].equals(other.children[i])) {
					return false;
				}
			}

			return true;
		},

		guid: 0,

		compile: function(program, options) {
			this.children = [];
			this.depths = {list: []};
			this.options = options;

			// These changes will propagate to the other compiler components
			var knownHelpers = this.options.knownHelpers;
			this.options.knownHelpers = {
				'helperMissing': true,
				'blockHelperMissing': true,
				'each': true,
				'if': true,
				'unless': true,
				'with': true,
				'log': true
			};
			if (knownHelpers) {
				for (var name in knownHelpers) {
					this.options.knownHelpers[name] = knownHelpers[name];
				}
			}

			return this.program(program);
		},

		accept: function(node) {
			return this[node.type](node);
		},

		program: function(program) {
			var statements = program.statements, statement;
			this.opcodes = [];

			for(var i=0, l=statements.length; i<l; i++) {
				statement = statements[i];
				this[statement.type](statement);
			}
			this.isSimple = l === 1;

			this.depths.list = this.depths.list.sort(function(a, b) {
				return a - b;
			});

			return this;
		},

		compileProgram: function(program) {
			var result = new this.compiler().compile(program, this.options);
			var guid = this.guid++, depth;

			this.usePartial = this.usePartial || result.usePartial;

			this.children[guid] = result;

			for(var i=0, l=result.depths.list.length; i<l; i++) {
				depth = result.depths.list[i];

				if(depth < 2) { continue; }
				else { this.addDepth(depth - 1); }
			}

			return guid;
		},

		block: function(block) {
			var mustache = block.mustache,
				program = block.program,
				inverse = block.inverse;

			if (program) {
				program = this.compileProgram(program);
			}

			if (inverse) {
				inverse = this.compileProgram(inverse);
			}

			var type = this.classifyMustache(mustache);

			if (type === "helper") {
				this.helperMustache(mustache, program, inverse);
			} else if (type === "simple") {
				this.simpleMustache(mustache);

				// now that the simple mustache is resolved, we need to
				// evaluate it by executing `blockHelperMissing`
				this.opcode('pushProgram', program);
				this.opcode('pushProgram', inverse);
				this.opcode('emptyHash');
				this.opcode('blockValue');
			} else {
				this.ambiguousMustache(mustache, program, inverse);

				// now that the simple mustache is resolved, we need to
				// evaluate it by executing `blockHelperMissing`
				this.opcode('pushProgram', program);
				this.opcode('pushProgram', inverse);
				this.opcode('emptyHash');
				this.opcode('ambiguousBlockValue');
			}

			this.opcode('append');
		},

		hash: function(hash) {
			var pairs = hash.pairs, pair, val;

			this.opcode('pushHash');

			for(var i=0, l=pairs.length; i<l; i++) {
				pair = pairs[i];
				val  = pair[1];

				if (this.options.stringParams) {
					if(val.depth) {
						this.addDepth(val.depth);
					}
					this.opcode('getContext', val.depth || 0);
					this.opcode('pushStringParam', val.stringModeValue, val.type);
				} else {
					this.accept(val);
				}

				this.opcode('assignToHash', pair[0]);
			}
			this.opcode('popHash');
		},

		partial: function(partial) {
			var partialName = partial.partialName;
			this.usePartial = true;

			if(partial.context) {
				this.ID(partial.context);
			} else {
				this.opcode('push', 'depth0');
			}

			this.opcode('invokePartial', partialName.name);
			this.opcode('append');
		},

		content: function(content) {
			this.opcode('appendContent', content.string);
		},

		mustache: function(mustache) {
			var options = this.options;
			var type = this.classifyMustache(mustache);

			if (type === "simple") {
				this.simpleMustache(mustache);
			} else if (type === "helper") {
				this.helperMustache(mustache);
			} else {
				this.ambiguousMustache(mustache);
			}

			if(mustache.escaped && !options.noEscape) {
				this.opcode('appendEscaped');
			} else {
				this.opcode('append');
			}
		},

		ambiguousMustache: function(mustache, program, inverse) {
			var id = mustache.id,
				name = id.parts[0],
				isBlock = program != null || inverse != null;

			this.opcode('getContext', id.depth);

			this.opcode('pushProgram', program);
			this.opcode('pushProgram', inverse);

			this.opcode('invokeAmbiguous', name, isBlock);
		},

		simpleMustache: function(mustache) {
			var id = mustache.id;

			if (id.type === 'DATA') {
				this.DATA(id);
			} else if (id.parts.length) {
				this.ID(id);
			} else {
				// Simplified ID for `this`
				this.addDepth(id.depth);
				this.opcode('getContext', id.depth);
				this.opcode('pushContext');
			}

			this.opcode('resolvePossibleLambda');
		},

		helperMustache: function(mustache, program, inverse) {
			var params = this.setupFullMustacheParams(mustache, program, inverse),
				name = mustache.id.parts[0];

			if (this.options.knownHelpers[name]) {
				this.opcode('invokeKnownHelper', params.length, name);
			} else if (this.options.knownHelpersOnly) {
				throw new Error("You specified knownHelpersOnly, but used the unknown helper " + name);
			} else {
				this.opcode('invokeHelper', params.length, name);
			}
		},

		ID: function(id) {
			this.addDepth(id.depth);
			this.opcode('getContext', id.depth);

			var name = id.parts[0];
			if (!name) {
				this.opcode('pushContext');
			} else {
				this.opcode('lookupOnContext', id.parts[0]);
			}

			for(var i=1, l=id.parts.length; i<l; i++) {
				this.opcode('lookup', id.parts[i]);
			}
		},

		DATA: function(data) {
			this.options.data = true;
			if (data.id.isScoped || data.id.depth) {
				throw new Handlebars.Exception('Scoped data references are not supported: ' + data.original);
			}

			this.opcode('lookupData');
			var parts = data.id.parts;
			for(var i=0, l=parts.length; i<l; i++) {
				this.opcode('lookup', parts[i]);
			}
		},

		STRING: function(string) {
			this.opcode('pushString', string.string);
		},

		INTEGER: function(integer) {
			this.opcode('pushLiteral', integer.integer);
		},

		BOOLEAN: function(bool) {
			this.opcode('pushLiteral', bool.bool);
		},

		comment: function() {},

		// HELPERS
		opcode: function(name) {
			this.opcodes.push({ opcode: name, args: [].slice.call(arguments, 1) });
		},

		declare: function(name, value) {
			this.opcodes.push({ opcode: 'DECLARE', name: name, value: value });
		},

		addDepth: function(depth) {
			if(isNaN(depth)) { throw new Error("EWOT"); }
			if(depth === 0) { return; }

			if(!this.depths[depth]) {
				this.depths[depth] = true;
				this.depths.list.push(depth);
			}
		},

		classifyMustache: function(mustache) {
			var isHelper   = mustache.isHelper;
			var isEligible = mustache.eligibleHelper;
			var options    = this.options;

			// if ambiguous, we can possibly resolve the ambiguity now
			if (isEligible && !isHelper) {
				var name = mustache.id.parts[0];

				if (options.knownHelpers[name]) {
					isHelper = true;
				} else if (options.knownHelpersOnly) {
					isEligible = false;
				}
			}

			if (isHelper) { return "helper"; }
			else if (isEligible) { return "ambiguous"; }
			else { return "simple"; }
		},

		pushParams: function(params) {
			var i = params.length, param;

			while(i--) {
				param = params[i];

				if(this.options.stringParams) {
					if(param.depth) {
						this.addDepth(param.depth);
					}

					this.opcode('getContext', param.depth || 0);
					this.opcode('pushStringParam', param.stringModeValue, param.type);
				} else {
					this[param.type](param);
				}
			}
		},

		setupMustacheParams: function(mustache) {
			var params = mustache.params;
			this.pushParams(params);

			if(mustache.hash) {
				this.hash(mustache.hash);
			} else {
				this.opcode('emptyHash');
			}

			return params;
		},

		// this will replace setupMustacheParams when we're done
		setupFullMustacheParams: function(mustache, program, inverse) {
			var params = mustache.params;
			this.pushParams(params);

			this.opcode('pushProgram', program);
			this.opcode('pushProgram', inverse);

			if(mustache.hash) {
				this.hash(mustache.hash);
			} else {
				this.opcode('emptyHash');
			}

			return params;
		}
	};

	var Literal = function(value) {
		this.value = value;
	};

	JavaScriptCompiler.prototype = {
		// PUBLIC API: You can override these methods in a subclass to provide
		// alternative compiled forms for name lookup and buffering semantics
		nameLookup: function(parent, name /* , type*/) {
			if (/^[0-9]+$/.test(name)) {
				return parent + "[" + name + "]";
			} else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
				return parent + "." + name;
			}
			else {
				return parent + "['" + name + "']";
			}
		},

		appendToBuffer: function(string) {
			if (this.environment.isSimple) {
				return "return " + string + ";";
			} else {
				return {
					appendToBuffer: true,
					content: string,
					toString: function() { return "buffer += " + string + ";"; }
				};
			}
		},

		initializeBuffer: function() {
			return this.quotedString("");
		},

		namespace: "Handlebars",
		// END PUBLIC API

		compile: function(environment, options, context, asObject) {
			this.environment = environment;
			this.options = options || {};

			Handlebars.log(Handlebars.logger.DEBUG, this.environment.disassemble() + "\n\n");

			this.name = this.environment.name;
			this.isChild = !!context;
			this.context = context || {
				programs: [],
				environments: [],
				aliases: { }
			};

			this.preamble();

			this.stackSlot = 0;
			this.stackVars = [];
			this.registers = { list: [] };
			this.compileStack = [];
			this.inlineStack = [];

			this.compileChildren(environment, options);

			var opcodes = environment.opcodes, opcode;

			this.i = 0;

			for(l=opcodes.length; this.i<l; this.i++) {
				opcode = opcodes[this.i];

				if(opcode.opcode === 'DECLARE') {
					this[opcode.name] = opcode.value;
				} else {
					this[opcode.opcode].apply(this, opcode.args);
				}
			}

			return this.createFunctionContext(asObject);
		},

		nextOpcode: function() {
			var opcodes = this.environment.opcodes;
			return opcodes[this.i + 1];
		},

		eat: function() {
			this.i = this.i + 1;
		},

		preamble: function() {
			var out = [];

			if (!this.isChild) {
				var namespace = this.namespace;

				var copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
				if (this.environment.usePartial) { copies = copies + " partials = this.merge(partials, " + namespace + ".partials);"; }
				if (this.options.data) { copies = copies + " data = data || {};"; }
				out.push(copies);
			} else {
				out.push('');
			}

			if (!this.environment.isSimple) {
				out.push(", buffer = " + this.initializeBuffer());
			} else {
				out.push("");
			}

			// track the last context pushed into place to allow skipping the
			// getContext opcode when it would be a noop
			this.lastContext = 0;
			this.source = out;
		},

		createFunctionContext: function(asObject) {
			var locals = this.stackVars.concat(this.registers.list);

			if(locals.length > 0) {
				this.source[1] = this.source[1] + ", " + locals.join(", ");
			}

			// Generate minimizer alias mappings
			if (!this.isChild) {
				for (var alias in this.context.aliases) {
					if (this.context.aliases.hasOwnProperty(alias)) {
						this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
					}
				}
			}

			if (this.source[1]) {
				this.source[1] = "var " + this.source[1].substring(2) + ";";
			}

			// Merge children
			if (!this.isChild) {
				this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
			}

			if (!this.environment.isSimple) {
				this.source.push("return buffer;");
			}

			var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

			for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
				params.push("depth" + this.environment.depths.list[i]);
			}

			// Perform a second pass over the output to merge content when possible
			var source = this.mergeSource();

			if (!this.isChild) {
				var revision = Handlebars.COMPILER_REVISION,
					versions = Handlebars.REVISION_CHANGES[revision];
				source = "this.compilerInfo = ["+revision+",'"+versions+"'];\n"+source;
			}

			if (asObject) {
				params.push(source);

				return Function.apply(this, params);
			} else {
				var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + source + '}';
				Handlebars.log(Handlebars.logger.DEBUG, functionSource + "\n\n");
				return functionSource;
			}
		},
		mergeSource: function() {
			// WARN: We are not handling the case where buffer is still populated as the source should
			// not have buffer append operations as their final action.
			var source = '',
				buffer;
			for (var i = 0, len = this.source.length; i < len; i++) {
				var line = this.source[i];
				if (line.appendToBuffer) {
					if (buffer) {
						buffer = buffer + '\n    + ' + line.content;
					} else {
						buffer = line.content;
					}
				} else {
					if (buffer) {
						source += 'buffer += ' + buffer + ';\n  ';
						buffer = undefined;
					}
					source += line + '\n  ';
				}
			}
			return source;
		},

		// [blockValue]
		//
		// On stack, before: hash, inverse, program, value
		// On stack, after: return value of blockHelperMissing
		//
		// The purpose of this opcode is to take a block of the form
		// `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
		// replace it on the stack with the result of properly
		// invoking blockHelperMissing.
		blockValue: function() {
			this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

			var params = ["depth0"];
			this.setupParams(0, params);

			this.replaceStack(function(current) {
				params.splice(1, 0, current);
				return "blockHelperMissing.call(" + params.join(", ") + ")";
			});
		},

		// [ambiguousBlockValue]
		//
		// On stack, before: hash, inverse, program, value
		// Compiler value, before: lastHelper=value of last found helper, if any
		// On stack, after, if no lastHelper: same as [blockValue]
		// On stack, after, if lastHelper: value
		ambiguousBlockValue: function() {
			this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

			var params = ["depth0"];
			this.setupParams(0, params);

			var current = this.topStack();
			params.splice(1, 0, current);

			// Use the options value generated from the invocation
			params[params.length-1] = 'options';

			this.source.push("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
		},

		// [appendContent]
		//
		// On stack, before: ...
		// On stack, after: ...
		//
		// Appends the string value of `content` to the current buffer
		appendContent: function(content) {
			this.source.push(this.appendToBuffer(this.quotedString(content)));
		},

		// [append]
		//
		// On stack, before: value, ...
		// On stack, after: ...
		//
		// Coerces `value` to a String and appends it to the current buffer.
		//
		// If `value` is truthy, or 0, it is coerced into a string and appended
		// Otherwise, the empty string is appended
		append: function() {
			// Force anything that is inlined onto the stack so we don't have duplication
			// when we examine local
			this.flushInline();
			var local = this.popStack();
			this.source.push("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
			if (this.environment.isSimple) {
				this.source.push("else { " + this.appendToBuffer("''") + " }");
			}
		},

		// [appendEscaped]
		//
		// On stack, before: value, ...
		// On stack, after: ...
		//
		// Escape `value` and append it to the buffer
		appendEscaped: function() {
			this.context.aliases.escapeExpression = 'this.escapeExpression';

			this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
		},

		// [getContext]
		//
		// On stack, before: ...
		// On stack, after: ...
		// Compiler value, after: lastContext=depth
		//
		// Set the value of the `lastContext` compiler value to the depth
		getContext: function(depth) {
			if(this.lastContext !== depth) {
				this.lastContext = depth;
			}
		},

		// [lookupOnContext]
		//
		// On stack, before: ...
		// On stack, after: currentContext[name], ...
		//
		// Looks up the value of `name` on the current context and pushes
		// it onto the stack.
		lookupOnContext: function(name) {
			this.push(this.nameLookup('depth' + this.lastContext, name, 'context'));
		},

		// [pushContext]
		//
		// On stack, before: ...
		// On stack, after: currentContext, ...
		//
		// Pushes the value of the current context onto the stack.
		pushContext: function() {
			this.pushStackLiteral('depth' + this.lastContext);
		},

		// [resolvePossibleLambda]
		//
		// On stack, before: value, ...
		// On stack, after: resolved value, ...
		//
		// If the `value` is a lambda, replace it on the stack by
		// the return value of the lambda
		resolvePossibleLambda: function() {
			this.context.aliases.functionType = '"function"';

			this.replaceStack(function(current) {
				return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
			});
		},

		// [lookup]
		//
		// On stack, before: value, ...
		// On stack, after: value[name], ...
		//
		// Replace the value on the stack with the result of looking
		// up `name` on `value`
		lookup: function(name) {
			this.replaceStack(function(current) {
				return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
			});
		},

		// [lookupData]
		//
		// On stack, before: ...
		// On stack, after: data[id], ...
		//
		// Push the result of looking up `id` on the current data
		lookupData: function(id) {
			this.push('data');
		},

		// [pushStringParam]
		//
		// On stack, before: ...
		// On stack, after: string, currentContext, ...
		//
		// This opcode is designed for use in string mode, which
		// provides the string value of a parameter along with its
		// depth rather than resolving it immediately.
		pushStringParam: function(string, type) {
			this.pushStackLiteral('depth' + this.lastContext);

			this.pushString(type);

			if (typeof string === 'string') {
				this.pushString(string);
			} else {
				this.pushStackLiteral(string);
			}
		},

		emptyHash: function() {
			this.pushStackLiteral('{}');

			if (this.options.stringParams) {
				this.register('hashTypes', '{}');
				this.register('hashContexts', '{}');
			}
		},
		pushHash: function() {
			this.hash = {values: [], types: [], contexts: []};
		},
		popHash: function() {
			var hash = this.hash;
			this.hash = undefined;

			if (this.options.stringParams) {
				this.register('hashContexts', '{' + hash.contexts.join(',') + '}');
				this.register('hashTypes', '{' + hash.types.join(',') + '}');
			}
			this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
		},

		// [pushString]
		//
		// On stack, before: ...
		// On stack, after: quotedString(string), ...
		//
		// Push a quoted version of `string` onto the stack
		pushString: function(string) {
			this.pushStackLiteral(this.quotedString(string));
		},

		// [push]
		//
		// On stack, before: ...
		// On stack, after: expr, ...
		//
		// Push an expression onto the stack
		push: function(expr) {
			this.inlineStack.push(expr);
			return expr;
		},

		// [pushLiteral]
		//
		// On stack, before: ...
		// On stack, after: value, ...
		//
		// Pushes a value onto the stack. This operation prevents
		// the compiler from creating a temporary variable to hold
		// it.
		pushLiteral: function(value) {
			this.pushStackLiteral(value);
		},

		// [pushProgram]
		//
		// On stack, before: ...
		// On stack, after: program(guid), ...
		//
		// Push a program expression onto the stack. This takes
		// a compile-time guid and converts it into a runtime-accessible
		// expression.
		pushProgram: function(guid) {
			if (guid != null) {
				this.pushStackLiteral(this.programExpression(guid));
			} else {
				this.pushStackLiteral(null);
			}
		},

		// [invokeHelper]
		//
		// On stack, before: hash, inverse, program, params..., ...
		// On stack, after: result of helper invocation
		//
		// Pops off the helper's parameters, invokes the helper,
		// and pushes the helper's return value onto the stack.
		//
		// If the helper is not found, `helperMissing` is called.
		invokeHelper: function(paramSize, name) {
			this.context.aliases.helperMissing = 'helpers.helperMissing';

			var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
			var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');

			this.push(helper.name + ' || ' + nonHelper);
			this.replaceStack(function(name) {
				return name + ' ? ' + name + '.call(' +
					helper.callParams + ") " + ": helperMissing.call(" +
					helper.helperMissingParams + ")";
			});
		},

		// [invokeKnownHelper]
		//
		// On stack, before: hash, inverse, program, params..., ...
		// On stack, after: result of helper invocation
		//
		// This operation is used when the helper is known to exist,
		// so a `helperMissing` fallback is not required.
		invokeKnownHelper: function(paramSize, name) {
			var helper = this.setupHelper(paramSize, name);
			this.push(helper.name + ".call(" + helper.callParams + ")");
		},

		// [invokeAmbiguous]
		//
		// On stack, before: hash, inverse, program, params..., ...
		// On stack, after: result of disambiguation
		//
		// This operation is used when an expression like `{{foo}}`
		// is provided, but we don't know at compile-time whether it
		// is a helper or a path.
		//
		// This operation emits more code than the other options,
		// and can be avoided by passing the `knownHelpers` and
		// `knownHelpersOnly` flags at compile-time.
		invokeAmbiguous: function(name, helperCall) {
			this.context.aliases.functionType = '"function"';

			this.pushStackLiteral('{}');    // Hash value
			var helper = this.setupHelper(0, name, helperCall);

			var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

			var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
			var nextStack = this.nextStack();

			this.source.push('if (' + nextStack + ' = ' + helperName + ') { ' + nextStack + ' = ' + nextStack + '.call(' + helper.callParams + '); }');
			this.source.push('else { ' + nextStack + ' = ' + nonHelper + '; ' + nextStack + ' = typeof ' + nextStack + ' === functionType ? ' + nextStack + '.apply(depth0) : ' + nextStack + '; }');
		},

		// [invokePartial]
		//
		// On stack, before: context, ...
		// On stack after: result of partial invocation
		//
		// This operation pops off a context, invokes a partial with that context,
		// and pushes the result of the invocation back.
		invokePartial: function(name) {
			var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];

			if (this.options.data) {
				params.push("data");
			}

			this.context.aliases.self = "this";
			this.push("self.invokePartial(" + params.join(", ") + ")");
		},

		// [assignToHash]
		//
		// On stack, before: value, hash, ...
		// On stack, after: hash, ...
		//
		// Pops a value and hash off the stack, assigns `hash[key] = value`
		// and pushes the hash back onto the stack.
		assignToHash: function(key) {
			var value = this.popStack(),
				context,
				type;

			if (this.options.stringParams) {
				type = this.popStack();
				context = this.popStack();
			}

			var hash = this.hash;
			if (context) {
				hash.contexts.push("'" + key + "': " + context);
			}
			if (type) {
				hash.types.push("'" + key + "': " + type);
			}
			hash.values.push("'" + key + "': (" + value + ")");
		},

		// HELPERS

		compiler: JavaScriptCompiler,

		compileChildren: function(environment, options) {
			var children = environment.children, child, compiler;

			for(var i=0, l=children.length; i<l; i++) {
				child = children[i];
				compiler = new this.compiler();

				var index = this.matchExistingProgram(child);

				if (index == null) {
					this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
					index = this.context.programs.length;
					child.index = index;
					child.name = 'program' + index;
					this.context.programs[index] = compiler.compile(child, options, this.context);
					this.context.environments[index] = child;
				} else {
					child.index = index;
					child.name = 'program' + index;
				}
			}
		},
		matchExistingProgram: function(child) {
			for (var i = 0, len = this.context.environments.length; i < len; i++) {
				var environment = this.context.environments[i];
				if (environment && environment.equals(child)) {
					return i;
				}
			}
		},

		programExpression: function(guid) {
			this.context.aliases.self = "this";

			if(guid == null) {
				return "self.noop";
			}

			var child = this.environment.children[guid],
				depths = child.depths.list, depth;

			var programParams = [child.index, child.name, "data"];

			for(var i=0, l = depths.length; i<l; i++) {
				depth = depths[i];

				if(depth === 1) { programParams.push("depth0"); }
				else { programParams.push("depth" + (depth - 1)); }
			}

			return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
		},

		register: function(name, val) {
			this.useRegister(name);
			this.source.push(name + " = " + val + ";");
		},

		useRegister: function(name) {
			if(!this.registers[name]) {
				this.registers[name] = true;
				this.registers.list.push(name);
			}
		},

		pushStackLiteral: function(item) {
			return this.push(new Literal(item));
		},

		pushStack: function(item) {
			this.flushInline();

			var stack = this.incrStack();
			if (item) {
				this.source.push(stack + " = " + item + ";");
			}
			this.compileStack.push(stack);
			return stack;
		},

		replaceStack: function(callback) {
			var prefix = '',
				inline = this.isInline(),
				stack;

			// If we are currently inline then we want to merge the inline statement into the
			// replacement statement via ','
			if (inline) {
				var top = this.popStack(true);

				if (top instanceof Literal) {
					// Literals do not need to be inlined
					stack = top.value;
				} else {
					// Get or create the current stack name for use by the inline
					var name = this.stackSlot ? this.topStackName() : this.incrStack();

					prefix = '(' + this.push(name) + ' = ' + top + '),';
					stack = this.topStack();
				}
			} else {
				stack = this.topStack();
			}

			var item = callback.call(this, stack);

			if (inline) {
				if (this.inlineStack.length || this.compileStack.length) {
					this.popStack();
				}
				this.push('(' + prefix + item + ')');
			} else {
				// Prevent modification of the context depth variable. Through replaceStack
				if (!/^stack/.test(stack)) {
					stack = this.nextStack();
				}

				this.source.push(stack + " = (" + prefix + item + ");");
			}
			return stack;
		},

		nextStack: function() {
			return this.pushStack();
		},

		incrStack: function() {
			this.stackSlot++;
			if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
			return this.topStackName();
		},
		topStackName: function() {
			return "stack" + this.stackSlot;
		},
		flushInline: function() {
			var inlineStack = this.inlineStack;
			if (inlineStack.length) {
				this.inlineStack = [];
				for (var i = 0, len = inlineStack.length; i < len; i++) {
					var entry = inlineStack[i];
					if (entry instanceof Literal) {
						this.compileStack.push(entry);
					} else {
						this.pushStack(entry);
					}
				}
			}
		},
		isInline: function() {
			return this.inlineStack.length;
		},

		popStack: function(wrapped) {
			var inline = this.isInline(),
				item = (inline ? this.inlineStack : this.compileStack).pop();

			if (!wrapped && (item instanceof Literal)) {
				return item.value;
			} else {
				if (!inline) {
					this.stackSlot--;
				}
				return item;
			}
		},

		topStack: function(wrapped) {
			var stack = (this.isInline() ? this.inlineStack : this.compileStack),
				item = stack[stack.length - 1];

			if (!wrapped && (item instanceof Literal)) {
				return item.value;
			} else {
				return item;
			}
		},

		quotedString: function(str) {
			return '"' + str
				.replace(/\\/g, '\\\\')
				.replace(/"/g, '\\"')
				.replace(/\n/g, '\\n')
				.replace(/\r/g, '\\r')
				.replace(/\u2028/g, '\\u2028')   // Per Ecma-262 7.3 + 7.8.4
				.replace(/\u2029/g, '\\u2029') + '"';
		},

		setupHelper: function(paramSize, name, missingParams) {
			var params = [];
			this.setupParams(paramSize, params, missingParams);
			var foundHelper = this.nameLookup('helpers', name, 'helper');

			return {
				params: params,
				name: foundHelper,
				callParams: ["depth0"].concat(params).join(", "),
				helperMissingParams: missingParams && ["depth0", this.quotedString(name)].concat(params).join(", ")
			};
		},

		// the params and contexts arguments are passed in arrays
		// to fill in
		setupParams: function(paramSize, params, useRegister) {
			var options = [], contexts = [], types = [], param, inverse, program;

			options.push("hash:" + this.popStack());

			inverse = this.popStack();
			program = this.popStack();

			// Avoid setting fn and inverse if neither are set. This allows
			// helpers to do a check for `if (options.fn)`
			if (program || inverse) {
				if (!program) {
					this.context.aliases.self = "this";
					program = "self.noop";
				}

				if (!inverse) {
					this.context.aliases.self = "this";
					inverse = "self.noop";
				}

				options.push("inverse:" + inverse);
				options.push("fn:" + program);
			}

			for(var i=0; i<paramSize; i++) {
				param = this.popStack();
				params.push(param);

				if(this.options.stringParams) {
					types.push(this.popStack());
					contexts.push(this.popStack());
				}
			}

			if (this.options.stringParams) {
				options.push("contexts:[" + contexts.join(",") + "]");
				options.push("types:[" + types.join(",") + "]");
				options.push("hashContexts:hashContexts");
				options.push("hashTypes:hashTypes");
			}

			if(this.options.data) {
				options.push("data:data");
			}

			options = "{" + options.join(",") + "}";
			if (useRegister) {
				this.register('options', options);
				params.push('options');
			} else {
				params.push(options);
			}
			return params.join(", ");
		}
	};

	var reservedWords = (
		"break else new var" +
			" case finally return void" +
			" catch for switch while" +
			" continue function this with" +
			" default if throw" +
			" delete in try" +
			" do instanceof typeof" +
			" abstract enum int short" +
			" boolean export interface static" +
			" byte extends long super" +
			" char final native synchronized" +
			" class float package throws" +
			" const goto private transient" +
			" debugger implements protected volatile" +
			" double import public let yield"
		).split(" ");

	var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

	for(var i=0, l=reservedWords.length; i<l; i++) {
		compilerWords[reservedWords[i]] = true;
	}

	JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
		if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)) {
			return true;
		}
		return false;
	};

	Handlebars.precompile = function(input, options) {
		if (input == null || (typeof input !== 'string' && input.constructor !== Handlebars.AST.ProgramNode)) {
			throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
		}

		options = options || {};
		if (!('data' in options)) {
			options.data = true;
		}
		var ast = Handlebars.parse(input);
		var environment = new Compiler().compile(ast, options);
		return new JavaScriptCompiler().compile(environment, options);
	};

	Handlebars.compile = function(input, options) {
		if (input == null || (typeof input !== 'string' && input.constructor !== Handlebars.AST.ProgramNode)) {
			throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
		}

		options = options || {};
		if (!('data' in options)) {
			options.data = true;
		}
		var compiled;
		function compile() {
			var ast = Handlebars.parse(input);
			var environment = new Compiler().compile(ast, options);
			var templateSpec = new JavaScriptCompiler().compile(environment, options, undefined, true);
			return Handlebars.template(templateSpec);
		}

		// Template is only compiled on first use and cached after that point.
		return function(context, options) {
			if (!compiled) {
				compiled = compile();
			}
			return compiled.call(this, context, options);
		};
	};

	;
// lib/handlebars/runtime.js

	Handlebars.VM = {
		template: function(templateSpec) {
			// Just add water
			var container = {
				escapeExpression: Handlebars.Utils.escapeExpression,
				invokePartial: Handlebars.VM.invokePartial,
				programs: [],
				program: function(i, fn, data) {
					var programWrapper = this.programs[i];
					if(data) {
						programWrapper = Handlebars.VM.program(i, fn, data);
					} else if (!programWrapper) {
						programWrapper = this.programs[i] = Handlebars.VM.program(i, fn);
					}
					return programWrapper;
				},
				merge: function(param, common) {
					var ret = param || common;

					if (param && common) {
						ret = {};
						Handlebars.Utils.extend(ret, common);
						Handlebars.Utils.extend(ret, param);
					}
					return ret;
				},
				programWithDepth: Handlebars.VM.programWithDepth,
				noop: Handlebars.VM.noop,
				compilerInfo: null
			};

			return function(context, options) {
				options = options || {};
				var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);

				var compilerInfo = container.compilerInfo || [],
					compilerRevision = compilerInfo[0] || 1,
					currentRevision = Handlebars.COMPILER_REVISION;

				if (compilerRevision !== currentRevision) {
					if (compilerRevision < currentRevision) {
						var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision],
							compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
						throw "Template was precompiled with an older version of Handlebars than the current runtime. "+
							"Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").";
					} else {
						// Use the embedded version info since the runtime doesn't know about this revision yet
						throw "Template was precompiled with a newer version of Handlebars than the current runtime. "+
							"Please update your runtime to a newer version ("+compilerInfo[1]+").";
					}
				}

				return result;
			};
		},

		programWithDepth: function(i, fn, data /*, $depth */) {
			var args = Array.prototype.slice.call(arguments, 3);

			var program = function(context, options) {
				options = options || {};

				return fn.apply(this, [context, options.data || data].concat(args));
			};
			program.program = i;
			program.depth = args.length;
			return program;
		},
		program: function(i, fn, data) {
			var program = function(context, options) {
				options = options || {};

				return fn(context, options.data || data);
			};
			program.program = i;
			program.depth = 0;
			return program;
		},
		noop: function() { return ""; },
		invokePartial: function(partial, name, context, helpers, partials, data) {
			var options = { helpers: helpers, partials: partials, data: data };

			if(partial === undefined) {
				throw new Handlebars.Exception("The partial " + name + " could not be found");
			} else if(partial instanceof Function) {
				return partial(context, options);
			} else if (!Handlebars.compile) {
				throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
			} else {
				partials[name] = Handlebars.compile(partial, {data: data !== undefined});
				return partials[name](context, options);
			}
		}
	};

	Handlebars.template = Handlebars.VM.template;
	;
// lib/handlebars/browser-suffix.js
})(Handlebars);
;
//     Backbone.js 1.0.0

//     (c) 2010-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

	// Initial Setup
	// -------------

	// Save a reference to the global object (`window` in the browser, `exports`
	// on the server).
	var root = this;

	// Save the previous value of the `Backbone` variable, so that it can be
	// restored later on, if `noConflict` is used.
	var previousBackbone = root.Backbone;

	// Create local references to array methods we'll want to use later.
	var array = [];
	var push = array.push;
	var slice = array.slice;
	var splice = array.splice;

	// The top-level namespace. All public Backbone classes and modules will
	// be attached to this. Exported for both the browser and the server.
	var Backbone;
	if (typeof exports !== 'undefined') {
		Backbone = exports;
	} else {
		Backbone = root.Backbone = {};
	}

	// Current version of the library. Keep in sync with `package.json`.
	Backbone.VERSION = '1.0.0';

	// Require Underscore, if we're on the server, and it's not already present.
	var _ = root._;
	if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

	// For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
	// the `$` variable.
	Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;

	// Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
	// to its previous owner. Returns a reference to this Backbone object.
	Backbone.noConflict = function() {
		root.Backbone = previousBackbone;
		return this;
	};

	// Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
	// will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
	// set a `X-Http-Method-Override` header.
	Backbone.emulateHTTP = false;

	// Turn on `emulateJSON` to support legacy servers that can't deal with direct
	// `application/json` requests ... will encode the body as
	// `application/x-www-form-urlencoded` instead and will send the model in a
	// form param named `model`.
	Backbone.emulateJSON = false;

	// Backbone.Events
	// ---------------

	// A module that can be mixed in to *any object* in order to provide it with
	// custom events. You may bind with `on` or remove with `off` callback
	// functions to an event; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = {};
	//     _.extend(object, Backbone.Events);
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//
	var Events = Backbone.Events = {

		// Bind an event to a `callback` function. Passing `"all"` will bind
		// the callback to all events fired.
		on: function(name, callback, context) {
			if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
			this._events || (this._events = {});
			var events = this._events[name] || (this._events[name] = []);
			events.push({callback: callback, context: context, ctx: context || this});
			return this;
		},

		// Bind an event to only be triggered a single time. After the first time
		// the callback is invoked, it will be removed.
		once: function(name, callback, context) {
			if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
			var self = this;
			var once = _.once(function() {
				self.off(name, once);
				callback.apply(this, arguments);
			});
			once._callback = callback;
			return this.on(name, once, context);
		},

		// Remove one or many callbacks. If `context` is null, removes all
		// callbacks with that function. If `callback` is null, removes all
		// callbacks for the event. If `name` is null, removes all bound
		// callbacks for all events.
		off: function(name, callback, context) {
			var retain, ev, events, names, i, l, j, k;
			if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
			if (!name && !callback && !context) {
				this._events = {};
				return this;
			}

			names = name ? [name] : _.keys(this._events);
			for (i = 0, l = names.length; i < l; i++) {
				name = names[i];
				if (events = this._events[name]) {
					this._events[name] = retain = [];
					if (callback || context) {
						for (j = 0, k = events.length; j < k; j++) {
							ev = events[j];
							if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
								(context && context !== ev.context)) {
								retain.push(ev);
							}
						}
					}
					if (!retain.length) delete this._events[name];
				}
			}

			return this;
		},

		// Trigger one or many events, firing all bound callbacks. Callbacks are
		// passed the same arguments as `trigger` is, apart from the event name
		// (unless you're listening on `"all"`, which will cause your callback to
		// receive the true name of the event as the first argument).
		trigger: function(name) {
			if (!this._events) return this;
			var args = slice.call(arguments, 1);
			if (!eventsApi(this, 'trigger', name, args)) return this;
			var events = this._events[name];
			var allEvents = this._events.all;
			if (events) triggerEvents(events, args);
			if (allEvents) triggerEvents(allEvents, arguments);
			return this;
		},

		// Tell this object to stop listening to either specific events ... or
		// to every object it's currently listening to.
		stopListening: function(obj, name, callback) {
			var listeners = this._listeners;
			if (!listeners) return this;
			var deleteListener = !name && !callback;
			if (typeof name === 'object') callback = this;
			if (obj) (listeners = {})[obj._listenerId] = obj;
			for (var id in listeners) {
				listeners[id].off(name, callback, this);
				if (deleteListener) delete this._listeners[id];
			}
			return this;
		}

	};

	// Regular expression used to split event strings.
	var eventSplitter = /\s+/;

	// Implement fancy features of the Events API such as multiple event
	// names `"change blur"` and jQuery-style event maps `{change: action}`
	// in terms of the existing API.
	var eventsApi = function(obj, action, name, rest) {
		if (!name) return true;

		// Handle event maps.
		if (typeof name === 'object') {
			for (var key in name) {
				obj[action].apply(obj, [key, name[key]].concat(rest));
			}
			return false;
		}

		// Handle space separated event names.
		if (eventSplitter.test(name)) {
			var names = name.split(eventSplitter);
			for (var i = 0, l = names.length; i < l; i++) {
				obj[action].apply(obj, [names[i]].concat(rest));
			}
			return false;
		}

		return true;
	};

	// A difficult-to-believe, but optimized internal dispatch function for
	// triggering events. Tries to keep the usual cases speedy (most internal
	// Backbone events have 3 arguments).
	var triggerEvents = function(events, args) {
		var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
		switch (args.length) {
			case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
			case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
			case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
			case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
			default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
		}
	};

	var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

	// Inversion-of-control versions of `on` and `once`. Tell *this* object to
	// listen to an event in another object ... keeping track of what it's
	// listening to.
	_.each(listenMethods, function(implementation, method) {
		Events[method] = function(obj, name, callback) {
			var listeners = this._listeners || (this._listeners = {});
			var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
			listeners[id] = obj;
			if (typeof name === 'object') callback = this;
			obj[implementation](name, callback, this);
			return this;
		};
	});

	// Aliases for backwards compatibility.
	Events.bind   = Events.on;
	Events.unbind = Events.off;

	// Allow the `Backbone` object to serve as a global event bus, for folks who
	// want global "pubsub" in a convenient place.
	_.extend(Backbone, Events);

	// Backbone.Model
	// --------------

	// Backbone **Models** are the basic data object in the framework --
	// frequently representing a row in a table in a database on your server.
	// A discrete chunk of data and a bunch of useful, related methods for
	// performing computations and transformations on that data.

	// Create a new model with the specified attributes. A client id (`cid`)
	// is automatically generated and assigned for you.
	var Model = Backbone.Model = function(attributes, options) {
		var defaults;
		var attrs = attributes || {};
		options || (options = {});
		this.cid = _.uniqueId('c');
		this.attributes = {};
		_.extend(this, _.pick(options, modelOptions));
		if (options.parse) attrs = this.parse(attrs, options) || {};
		if (defaults = _.result(this, 'defaults')) {
			attrs = _.defaults({}, attrs, defaults);
		}
		this.set(attrs, options);
		this.changed = {};
		this.initialize.apply(this, arguments);
	};

	// A list of options to be attached directly to the model, if provided.
	var modelOptions = ['url', 'urlRoot', 'collection'];

	// Attach all inheritable methods to the Model prototype.
	_.extend(Model.prototype, Events, {

		// A hash of attributes whose current and previous value differ.
		changed: null,

		// The value returned during the last failed validation.
		validationError: null,

		// The default name for the JSON `id` attribute is `"id"`. MongoDB and
		// CouchDB users may want to set this to `"_id"`.
		idAttribute: 'id',

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// Return a copy of the model's `attributes` object.
		toJSON: function(options) {
			return _.clone(this.attributes);
		},

		// Proxy `Backbone.sync` by default -- but override this if you need
		// custom syncing semantics for *this* particular model.
		sync: function() {
			return Backbone.sync.apply(this, arguments);
		},

		// Get the value of an attribute.
		get: function(attr) {
			return this.attributes[attr];
		},

		// Get the HTML-escaped value of an attribute.
		escape: function(attr) {
			return _.escape(this.get(attr));
		},

		// Returns `true` if the attribute contains a value that is not null
		// or undefined.
		has: function(attr) {
			return this.get(attr) != null;
		},

		// Set a hash of model attributes on the object, firing `"change"`. This is
		// the core primitive operation of a model, updating the data and notifying
		// anyone who needs to know about the change in state. The heart of the beast.
		set: function(key, val, options) {
			var attr, attrs, unset, changes, silent, changing, prev, current;
			if (key == null) return this;

			// Handle both `"key", value` and `{key: value}` -style arguments.
			if (typeof key === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			options || (options = {});

			// Run validation.
			if (!this._validate(attrs, options)) return false;

			// Extract attributes and options.
			unset           = options.unset;
			silent          = options.silent;
			changes         = [];
			changing        = this._changing;
			this._changing  = true;

			if (!changing) {
				this._previousAttributes = _.clone(this.attributes);
				this.changed = {};
			}
			current = this.attributes, prev = this._previousAttributes;

			// Check for changes of `id`.
			if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

			// For each `set` attribute, update or delete the current value.
			for (attr in attrs) {
				val = attrs[attr];
				if (!_.isEqual(current[attr], val)) changes.push(attr);
				if (!_.isEqual(prev[attr], val)) {
					this.changed[attr] = val;
				} else {
					delete this.changed[attr];
				}
				unset ? delete current[attr] : current[attr] = val;
			}

			// Trigger all relevant attribute changes.
			if (!silent) {
				if (changes.length) this._pending = true;
				for (var i = 0, l = changes.length; i < l; i++) {
					this.trigger('change:' + changes[i], this, current[changes[i]], options);
				}
			}

			// You might be wondering why there's a `while` loop here. Changes can
			// be recursively nested within `"change"` events.
			if (changing) return this;
			if (!silent) {
				while (this._pending) {
					this._pending = false;
					this.trigger('change', this, options);
				}
			}
			this._pending = false;
			this._changing = false;
			return this;
		},

		// Remove an attribute from the model, firing `"change"`. `unset` is a noop
		// if the attribute doesn't exist.
		unset: function(attr, options) {
			return this.set(attr, void 0, _.extend({}, options, {unset: true}));
		},

		// Clear all attributes on the model, firing `"change"`.
		clear: function(options) {
			var attrs = {};
			for (var key in this.attributes) attrs[key] = void 0;
			return this.set(attrs, _.extend({}, options, {unset: true}));
		},

		// Determine if the model has changed since the last `"change"` event.
		// If you specify an attribute name, determine if that attribute has changed.
		hasChanged: function(attr) {
			if (attr == null) return !_.isEmpty(this.changed);
			return _.has(this.changed, attr);
		},

		// Return an object containing all the attributes that have changed, or
		// false if there are no changed attributes. Useful for determining what
		// parts of a view need to be updated and/or what attributes need to be
		// persisted to the server. Unset attributes will be set to undefined.
		// You can also pass an attributes object to diff against the model,
		// determining if there *would be* a change.
		changedAttributes: function(diff) {
			if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
			var val, changed = false;
			var old = this._changing ? this._previousAttributes : this.attributes;
			for (var attr in diff) {
				if (_.isEqual(old[attr], (val = diff[attr]))) continue;
				(changed || (changed = {}))[attr] = val;
			}
			return changed;
		},

		// Get the previous value of an attribute, recorded at the time the last
		// `"change"` event was fired.
		previous: function(attr) {
			if (attr == null || !this._previousAttributes) return null;
			return this._previousAttributes[attr];
		},

		// Get all of the attributes of the model at the time of the previous
		// `"change"` event.
		previousAttributes: function() {
			return _.clone(this._previousAttributes);
		},

		// Fetch the model from the server. If the server's representation of the
		// model differs from its current attributes, they will be overridden,
		// triggering a `"change"` event.
		fetch: function(options) {
			options = options ? _.clone(options) : {};
			if (options.parse === void 0) options.parse = true;
			var model = this;
			var success = options.success;
			options.success = function(resp) {
				if (!model.set(model.parse(resp, options), options)) return false;
				if (success) success(model, resp, options);
				model.trigger('sync', model, resp, options);
			};
			wrapError(this, options);
			return this.sync('read', this, options);
		},

		// Set a hash of model attributes, and sync the model to the server.
		// If the server returns an attributes hash that differs, the model's
		// state will be `set` again.
		save: function(key, val, options) {
			var attrs, method, xhr, attributes = this.attributes;

			// Handle both `"key", value` and `{key: value}` -style arguments.
			if (key == null || typeof key === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			// If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
			if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;

			options = _.extend({validate: true}, options);

			// Do not persist invalid models.
			if (!this._validate(attrs, options)) return false;

			// Set temporary attributes if `{wait: true}`.
			if (attrs && options.wait) {
				this.attributes = _.extend({}, attributes, attrs);
			}

			// After a successful server-side save, the client is (optionally)
			// updated with the server-side state.
			if (options.parse === void 0) options.parse = true;
			var model = this;
			var success = options.success;
			options.success = function(resp) {
				// Ensure attributes are restored during synchronous saves.
				model.attributes = attributes;
				var serverAttrs = model.parse(resp, options);
				if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
				if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
					return false;
				}
				if (success) success(model, resp, options);
				model.trigger('sync', model, resp, options);
			};
			wrapError(this, options);

			method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
			if (method === 'patch') options.attrs = attrs;
			xhr = this.sync(method, this, options);

			// Restore attributes.
			if (attrs && options.wait) this.attributes = attributes;

			return xhr;
		},

		// Destroy this model on the server if it was already persisted.
		// Optimistically removes the model from its collection, if it has one.
		// If `wait: true` is passed, waits for the server to respond before removal.
		destroy: function(options) {
			options = options ? _.clone(options) : {};
			var model = this;
			var success = options.success;

			var destroy = function() {
				model.trigger('destroy', model, model.collection, options);
			};

			options.success = function(resp) {
				if (options.wait || model.isNew()) destroy();
				if (success) success(model, resp, options);
				if (!model.isNew()) model.trigger('sync', model, resp, options);
			};

			if (this.isNew()) {
				options.success();
				return false;
			}
			wrapError(this, options);

			var xhr = this.sync('delete', this, options);
			if (!options.wait) destroy();
			return xhr;
		},

		// Default URL for the model's representation on the server -- if you're
		// using Backbone's restful methods, override this to change the endpoint
		// that will be called.
		url: function() {
			var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
			if (this.isNew()) return base;
			return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
		},

		// **parse** converts a response into the hash of attributes to be `set` on
		// the model. The default implementation is just to pass the response along.
		parse: function(resp, options) {
			return resp;
		},

		// Create a new model with identical attributes to this one.
		clone: function() {
			return new this.constructor(this.attributes);
		},

		// A model is new if it has never been saved to the server, and lacks an id.
		isNew: function() {
			return this.id == null;
		},

		// Check if the model is currently in a valid state.
		isValid: function(options) {
			return this._validate({}, _.extend(options || {}, { validate: true }));
		},

		// Run validation against the next complete set of model attributes,
		// returning `true` if all is well. Otherwise, fire an `"invalid"` event.
		_validate: function(attrs, options) {
			if (!options.validate || !this.validate) return true;
			attrs = _.extend({}, this.attributes, attrs);
			var error = this.validationError = this.validate(attrs, options) || null;
			if (!error) return true;
			this.trigger('invalid', this, error, _.extend(options || {}, {validationError: error}));
			return false;
		}

	});

	// Underscore methods that we want to implement on the Model.
	var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

	// Mix in each Underscore method as a proxy to `Model#attributes`.
	_.each(modelMethods, function(method) {
		Model.prototype[method] = function() {
			var args = slice.call(arguments);
			args.unshift(this.attributes);
			return _[method].apply(_, args);
		};
	});

	// Backbone.Collection
	// -------------------

	// If models tend to represent a single row of data, a Backbone Collection is
	// more analagous to a table full of data ... or a small slice or page of that
	// table, or a collection of rows that belong together for a particular reason
	// -- all of the messages in this particular folder, all of the documents
	// belonging to this particular author, and so on. Collections maintain
	// indexes of their models, both in order, and for lookup by `id`.

	// Create a new **Collection**, perhaps to contain a specific type of `model`.
	// If a `comparator` is specified, the Collection will maintain
	// its models in sort order, as they're added and removed.
	var Collection = Backbone.Collection = function(models, options) {
		options || (options = {});
		if (options.url) this.url = options.url;
		if (options.model) this.model = options.model;
		if (options.comparator !== void 0) this.comparator = options.comparator;
		this._reset();
		this.initialize.apply(this, arguments);
		if (models) this.reset(models, _.extend({silent: true}, options));
	};

	// Default options for `Collection#set`.
	var setOptions = {add: true, remove: true, merge: true};
	var addOptions = {add: true, merge: false, remove: false};

	// Define the Collection's inheritable methods.
	_.extend(Collection.prototype, Events, {

		// The default model for a collection is just a **Backbone.Model**.
		// This should be overridden in most cases.
		model: Model,

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// The JSON representation of a Collection is an array of the
		// models' attributes.
		toJSON: function(options) {
			return this.map(function(model){ return model.toJSON(options); });
		},

		// Proxy `Backbone.sync` by default.
		sync: function() {
			return Backbone.sync.apply(this, arguments);
		},

		// Add a model, or list of models to the set.
		add: function(models, options) {
			return this.set(models, _.defaults(options || {}, addOptions));
		},

		// Remove a model, or a list of models from the set.
		remove: function(models, options) {
			models = _.isArray(models) ? models.slice() : [models];
			options || (options = {});
			var i, l, index, model;
			for (i = 0, l = models.length; i < l; i++) {
				model = this.get(models[i]);
				if (!model) continue;
				delete this._byId[model.id];
				delete this._byId[model.cid];
				index = this.indexOf(model);
				this.models.splice(index, 1);
				this.length--;
				if (!options.silent) {
					options.index = index;
					model.trigger('remove', model, this, options);
				}
				this._removeReference(model);
			}
			return this;
		},

		// Update a collection by `set`-ing a new list of models, adding new ones,
		// removing models that are no longer present, and merging models that
		// already exist in the collection, as necessary. Similar to **Model#set**,
		// the core operation for updating the data contained by the collection.
		set: function(models, options) {
			options = _.defaults(options || {}, setOptions);
			if (options.parse) models = this.parse(models, options);
			if (!_.isArray(models)) models = models ? [models] : [];
			var i, l, model, attrs, existing, sort;
			var at = options.at;
			var sortable = this.comparator && (at == null) && options.sort !== false;
			var sortAttr = _.isString(this.comparator) ? this.comparator : null;
			var toAdd = [], toRemove = [], modelMap = {};

			// Turn bare objects into model references, and prevent invalid models
			// from being added.
			for (i = 0, l = models.length; i < l; i++) {
				if (!(model = this._prepareModel(models[i], options))) continue;

				// If a duplicate is found, prevent it from being added and
				// optionally merge it into the existing model.
				if (existing = this.get(model)) {
					if (options.remove) modelMap[existing.cid] = true;
					if (options.merge) {
						existing.set(model.attributes, options);
						if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
					}

					// This is a new model, push it to the `toAdd` list.
				} else if (options.add) {
					toAdd.push(model);

					// Listen to added models' events, and index models for lookup by
					// `id` and by `cid`.
					model.on('all', this._onModelEvent, this);
					this._byId[model.cid] = model;
					if (model.id != null) this._byId[model.id] = model;
				}
			}

			// Remove nonexistent models if appropriate.
			if (options.remove) {
				for (i = 0, l = this.length; i < l; ++i) {
					if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
				}
				if (toRemove.length) this.remove(toRemove, options);
			}

			// See if sorting is needed, update `length` and splice in new models.
			if (toAdd.length) {
				if (sortable) sort = true;
				this.length += toAdd.length;
				if (at != null) {
					splice.apply(this.models, [at, 0].concat(toAdd));
				} else {
					push.apply(this.models, toAdd);
				}
			}

			// Silently sort the collection if appropriate.
			if (sort) this.sort({silent: true});

			if (options.silent) return this;

			// Trigger `add` events.
			for (i = 0, l = toAdd.length; i < l; i++) {
				(model = toAdd[i]).trigger('add', model, this, options);
			}

			// Trigger `sort` if the collection was sorted.
			if (sort) this.trigger('sort', this, options);
			return this;
		},

		// When you have more items than you want to add or remove individually,
		// you can reset the entire set with a new list of models, without firing
		// any granular `add` or `remove` events. Fires `reset` when finished.
		// Useful for bulk operations and optimizations.
		reset: function(models, options) {
			options || (options = {});
			for (var i = 0, l = this.models.length; i < l; i++) {
				this._removeReference(this.models[i]);
			}
			options.previousModels = this.models;
			this._reset();
			this.add(models, _.extend({silent: true}, options));
			if (!options.silent) this.trigger('reset', this, options);
			return this;
		},

		// Add a model to the end of the collection.
		push: function(model, options) {
			model = this._prepareModel(model, options);
			this.add(model, _.extend({at: this.length}, options));
			return model;
		},

		// Remove a model from the end of the collection.
		pop: function(options) {
			var model = this.at(this.length - 1);
			this.remove(model, options);
			return model;
		},

		// Add a model to the beginning of the collection.
		unshift: function(model, options) {
			model = this._prepareModel(model, options);
			this.add(model, _.extend({at: 0}, options));
			return model;
		},

		// Remove a model from the beginning of the collection.
		shift: function(options) {
			var model = this.at(0);
			this.remove(model, options);
			return model;
		},

		// Slice out a sub-array of models from the collection.
		slice: function(begin, end) {
			return this.models.slice(begin, end);
		},

		// Get a model from the set by id.
		get: function(obj) {
			if (obj == null) return void 0;
			return this._byId[obj.id != null ? obj.id : obj.cid || obj];
		},

		// Get the model at the given index.
		at: function(index) {
			return this.models[index];
		},

		// Return models with matching attributes. Useful for simple cases of
		// `filter`.
		where: function(attrs, first) {
			if (_.isEmpty(attrs)) return first ? void 0 : [];
			return this[first ? 'find' : 'filter'](function(model) {
				for (var key in attrs) {
					if (attrs[key] !== model.get(key)) return false;
				}
				return true;
			});
		},

		// Return the first model with matching attributes. Useful for simple cases
		// of `find`.
		findWhere: function(attrs) {
			return this.where(attrs, true);
		},

		// Force the collection to re-sort itself. You don't need to call this under
		// normal circumstances, as the set will maintain sort order as each item
		// is added.
		sort: function(options) {
			if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
			options || (options = {});

			// Run sort based on type of `comparator`.
			if (_.isString(this.comparator) || this.comparator.length === 1) {
				this.models = this.sortBy(this.comparator, this);
			} else {
				this.models.sort(_.bind(this.comparator, this));
			}

			if (!options.silent) this.trigger('sort', this, options);
			return this;
		},

		// Figure out the smallest index at which a model should be inserted so as
		// to maintain order.
		sortedIndex: function(model, value, context) {
			value || (value = this.comparator);
			var iterator = _.isFunction(value) ? value : function(model) {
				return model.get(value);
			};
			return _.sortedIndex(this.models, model, iterator, context);
		},

		// Pluck an attribute from each model in the collection.
		pluck: function(attr) {
			return _.invoke(this.models, 'get', attr);
		},

		// Fetch the default set of models for this collection, resetting the
		// collection when they arrive. If `reset: true` is passed, the response
		// data will be passed through the `reset` method instead of `set`.
		fetch: function(options) {
			options = options ? _.clone(options) : {};
			if (options.parse === void 0) options.parse = true;
			var success = options.success;
			var collection = this;
			options.success = function(resp) {
				var method = options.reset ? 'reset' : 'set';
				collection[method](resp, options);
				if (success) success(collection, resp, options);
				collection.trigger('sync', collection, resp, options);
			};
			wrapError(this, options);
			return this.sync('read', this, options);
		},

		// Create a new instance of a model in this collection. Add the model to the
		// collection immediately, unless `wait: true` is passed, in which case we
		// wait for the server to agree.
		create: function(model, options) {
			options = options ? _.clone(options) : {};
			if (!(model = this._prepareModel(model, options))) return false;
			if (!options.wait) this.add(model, options);
			var collection = this;
			var success = options.success;
			options.success = function(resp) {
				if (options.wait) collection.add(model, options);
				if (success) success(model, resp, options);
			};
			model.save(null, options);
			return model;
		},

		// **parse** converts a response into a list of models to be added to the
		// collection. The default implementation is just to pass it through.
		parse: function(resp, options) {
			return resp;
		},

		// Create a new collection with an identical list of models as this one.
		clone: function() {
			return new this.constructor(this.models);
		},

		// Private method to reset all internal state. Called when the collection
		// is first initialized or reset.
		_reset: function() {
			this.length = 0;
			this.models = [];
			this._byId  = {};
		},

		// Prepare a hash of attributes (or other model) to be added to this
		// collection.
		_prepareModel: function(attrs, options) {
			if (attrs instanceof Model) {
				if (!attrs.collection) attrs.collection = this;
				return attrs;
			}
			options || (options = {});
			options.collection = this;
			var model = new this.model(attrs, options);
			if (!model._validate(attrs, options)) {
				this.trigger('invalid', this, attrs, options);
				return false;
			}
			return model;
		},

		// Internal method to sever a model's ties to a collection.
		_removeReference: function(model) {
			if (this === model.collection) delete model.collection;
			model.off('all', this._onModelEvent, this);
		},

		// Internal method called every time a model in the set fires an event.
		// Sets need to update their indexes when models change ids. All other
		// events simply proxy through. "add" and "remove" events that originate
		// in other collections are ignored.
		_onModelEvent: function(event, model, collection, options) {
			if ((event === 'add' || event === 'remove') && collection !== this) return;
			if (event === 'destroy') this.remove(model, options);
			if (model && event === 'change:' + model.idAttribute) {
				delete this._byId[model.previous(model.idAttribute)];
				if (model.id != null) this._byId[model.id] = model;
			}
			this.trigger.apply(this, arguments);
		}

	});

	// Underscore methods that we want to implement on the Collection.
	// 90% of the core usefulness of Backbone Collections is actually implemented
	// right here:
	var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
		'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
		'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
		'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
		'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
		'isEmpty', 'chain'];

	// Mix in each Underscore method as a proxy to `Collection#models`.
	_.each(methods, function(method) {
		Collection.prototype[method] = function() {
			var args = slice.call(arguments);
			args.unshift(this.models);
			return _[method].apply(_, args);
		};
	});

	// Underscore methods that take a property name as an argument.
	var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

	// Use attributes instead of properties.
	_.each(attributeMethods, function(method) {
		Collection.prototype[method] = function(value, context) {
			var iterator = _.isFunction(value) ? value : function(model) {
				return model.get(value);
			};
			return _[method](this.models, iterator, context);
		};
	});

	// Backbone.View
	// -------------

	// Backbone Views are almost more convention than they are actual code. A View
	// is simply a JavaScript object that represents a logical chunk of UI in the
	// DOM. This might be a single item, an entire list, a sidebar or panel, or
	// even the surrounding frame which wraps your whole app. Defining a chunk of
	// UI as a **View** allows you to define your DOM events declaratively, without
	// having to worry about render order ... and makes it easy for the view to
	// react to specific changes in the state of your models.

	// Creating a Backbone.View creates its initial element outside of the DOM,
	// if an existing element is not provided...
	var View = Backbone.View = function(options) {
		this.cid = _.uniqueId('view');
		this._configure(options || {});
		this._ensureElement();
		this.initialize.apply(this, arguments);
		this.delegateEvents();
	};

	// Cached regex to split keys for `delegate`.
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	// List of view options to be merged as properties.
	var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

	// Set up all inheritable **Backbone.View** properties and methods.
	_.extend(View.prototype, Events, {

		// The default `tagName` of a View's element is `"div"`.
		tagName: 'div',

		// jQuery delegate for element lookup, scoped to DOM elements within the
		// current view. This should be prefered to global lookups where possible.
		$: function(selector) {
			return this.$el.find(selector);
		},

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// **render** is the core function that your view should override, in order
		// to populate its element (`this.el`), with the appropriate HTML. The
		// convention is for **render** to always return `this`.
		render: function() {
			return this;
		},

		// Remove this view by taking the element out of the DOM, and removing any
		// applicable Backbone.Events listeners.
		remove: function() {
			this.$el.remove();
			this.stopListening();
			return this;
		},

		// Change the view's element (`this.el` property), including event
		// re-delegation.
		setElement: function(element, delegate) {
			if (this.$el) this.undelegateEvents();
			this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
			this.el = this.$el[0];
			if (delegate !== false) this.delegateEvents();
			return this;
		},

		// Set callbacks, where `this.events` is a hash of
		//
		// *{"event selector": "callback"}*
		//
		//     {
		//       'mousedown .title':  'edit',
		//       'click .button':     'save'
		//       'click .open':       function(e) { ... }
		//     }
		//
		// pairs. Callbacks will be bound to the view, with `this` set properly.
		// Uses event delegation for efficiency.
		// Omitting the selector binds the event to `this.el`.
		// This only works for delegate-able events: not `focus`, `blur`, and
		// not `change`, `submit`, and `reset` in Internet Explorer.
		delegateEvents: function(events) {
			if (!(events || (events = _.result(this, 'events')))) return this;
			this.undelegateEvents();
			for (var key in events) {
				var method = events[key];
				if (!_.isFunction(method)) method = this[events[key]];
				if (!method) continue;

				var match = key.match(delegateEventSplitter);
				var eventName = match[1], selector = match[2];
				method = _.bind(method, this);
				eventName += '.delegateEvents' + this.cid;
				if (selector === '') {
					this.$el.on(eventName, method);
				} else {
					this.$el.on(eventName, selector, method);
				}
			}
			return this;
		},

		// Clears all callbacks previously bound to the view with `delegateEvents`.
		// You usually don't need to use this, but may wish to if you have multiple
		// Backbone views attached to the same DOM element.
		undelegateEvents: function() {
			this.$el.off('.delegateEvents' + this.cid);
			return this;
		},

		// Performs the initial configuration of a View with a set of options.
		// Keys with special meaning *(e.g. model, collection, id, className)* are
		// attached directly to the view.  See `viewOptions` for an exhaustive
		// list.
		_configure: function(options) {
			if (this.options) options = _.extend({}, _.result(this, 'options'), options);
			_.extend(this, _.pick(options, viewOptions));
			this.options = options;
		},

		// Ensure that the View has a DOM element to render into.
		// If `this.el` is a string, pass it through `$()`, take the first
		// matching element, and re-assign it to `el`. Otherwise, create
		// an element from the `id`, `className` and `tagName` properties.
		_ensureElement: function() {
			if (!this.el) {
				var attrs = _.extend({}, _.result(this, 'attributes'));
				if (this.id) attrs.id = _.result(this, 'id');
				if (this.className) attrs['class'] = _.result(this, 'className');
				var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
				this.setElement($el, false);
			} else {
				this.setElement(_.result(this, 'el'), false);
			}
		}

	});

	// Backbone.sync
	// -------------

	// Override this function to change the manner in which Backbone persists
	// models to the server. You will be passed the type of request, and the
	// model in question. By default, makes a RESTful Ajax request
	// to the model's `url()`. Some possible customizations could be:
	//
	// * Use `setTimeout` to batch rapid-fire updates into a single request.
	// * Send up the models as XML instead of JSON.
	// * Persist models via WebSockets instead of Ajax.
	//
	// Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
	// as `POST`, with a `_method` parameter containing the true HTTP method,
	// as well as all requests with the body as `application/x-www-form-urlencoded`
	// instead of `application/json` with the model in a param named `model`.
	// Useful when interfacing with server-side languages like **PHP** that make
	// it difficult to read the body of `PUT` requests.
	Backbone.sync = function(method, model, options) {
		var type = methodMap[method];

		// Default options, unless specified.
		_.defaults(options || (options = {}), {
			emulateHTTP: Backbone.emulateHTTP,
			emulateJSON: Backbone.emulateJSON
		});

		// Default JSON-request options.
		var params = {type: type, dataType: 'json'};

		// Ensure that we have a URL.
		if (!options.url) {
			params.url = _.result(model, 'url') || urlError();
		}

		// Ensure that we have the appropriate request data.
		if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
			params.contentType = 'application/json';
			params.data = JSON.stringify(options.attrs || model.toJSON(options));
		}

		// For older servers, emulate JSON by encoding the request into an HTML-form.
		if (options.emulateJSON) {
			params.contentType = 'application/x-www-form-urlencoded';
			params.data = params.data ? {model: params.data} : {};
		}

		// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
		// And an `X-HTTP-Method-Override` header.
		if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
			params.type = 'POST';
			if (options.emulateJSON) params.data._method = type;
			var beforeSend = options.beforeSend;
			options.beforeSend = function(xhr) {
				xhr.setRequestHeader('X-HTTP-Method-Override', type);
				if (beforeSend) return beforeSend.apply(this, arguments);
			};
		}

		// Don't process data on a non-GET request.
		if (params.type !== 'GET' && !options.emulateJSON) {
			params.processData = false;
		}

		// If we're sending a `PATCH` request, and we're in an old Internet Explorer
		// that still has ActiveX enabled by default, override jQuery to use that
		// for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
		if (params.type === 'PATCH' && window.ActiveXObject &&
			!(window.external && window.external.msActiveXFilteringEnabled)) {
			params.xhr = function() {
				return new ActiveXObject("Microsoft.XMLHTTP");
			};
		}

		// Make the request, allowing the user to override any Ajax options.
		var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
		model.trigger('request', model, xhr, options);
		return xhr;
	};

	// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	var methodMap = {
		'create': 'POST',
		'update': 'PUT',
		'patch':  'PATCH',
		'delete': 'DELETE',
		'read':   'GET'
	};

	// Set the default implementation of `Backbone.ajax` to proxy through to `$`.
	// Override this if you'd like to use a different library.
	Backbone.ajax = function() {
		return Backbone.$.ajax.apply(Backbone.$, arguments);
	};

	// Backbone.Router
	// ---------------

	// Routers map faux-URLs to actions, and fire events when routes are
	// matched. Creating a new one sets its `routes` hash, if not set statically.
	var Router = Backbone.Router = function(options) {
		options || (options = {});
		if (options.routes) this.routes = options.routes;
		this._bindRoutes();
		this.initialize.apply(this, arguments);
	};

	// Cached regular expressions for matching named param parts and splatted
	// parts of route strings.
	var optionalParam = /\((.*?)\)/g;
	var namedParam    = /(\(\?)?:\w+/g;
	var splatParam    = /\*\w+/g;
	var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

	// Set up all inheritable **Backbone.Router** properties and methods.
	_.extend(Router.prototype, Events, {

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// Manually bind a single named route to a callback. For example:
		//
		//     this.route('search/:query/p:num', 'search', function(query, num) {
		//       ...
		//     });
		//
		route: function(route, name, callback) {
			if (!_.isRegExp(route)) route = this._routeToRegExp(route);
			if (_.isFunction(name)) {
				callback = name;
				name = '';
			}
			if (!callback) callback = this[name];
			var router = this;
			Backbone.history.route(route, function(fragment) {
				var args = router._extractParameters(route, fragment);
				callback && callback.apply(router, args);
				router.trigger.apply(router, ['route:' + name].concat(args));
				router.trigger('route', name, args);
				Backbone.history.trigger('route', router, name, args);
			});
			return this;
		},

		// Simple proxy to `Backbone.history` to save a fragment into the history.
		navigate: function(fragment, options) {
			Backbone.history.navigate(fragment, options);
			return this;
		},

		// Bind all defined routes to `Backbone.history`. We have to reverse the
		// order of the routes here to support behavior where the most general
		// routes can be defined at the bottom of the route map.
		_bindRoutes: function() {
			if (!this.routes) return;
			this.routes = _.result(this, 'routes');
			var route, routes = _.keys(this.routes);
			while ((route = routes.pop()) != null) {
				this.route(route, this.routes[route]);
			}
		},

		// Convert a route string into a regular expression, suitable for matching
		// against the current location hash.
		_routeToRegExp: function(route) {
			route = route.replace(escapeRegExp, '\\$&')
				.replace(optionalParam, '(?:$1)?')
				.replace(namedParam, function(match, optional){
					return optional ? match : '([^\/]+)';
				})
				.replace(splatParam, '(.*?)');
			return new RegExp('^' + route + '$');
		},

		// Given a route, and a URL fragment that it matches, return the array of
		// extracted decoded parameters. Empty or unmatched parameters will be
		// treated as `null` to normalize cross-browser behavior.
		_extractParameters: function(route, fragment) {
			var params = route.exec(fragment).slice(1);
			return _.map(params, function(param) {
				return param ? decodeURIComponent(param) : null;
			});
		}

	});

	// Backbone.History
	// ----------------

	// Handles cross-browser history management, based on either
	// [pushState](http://diveintohtml5.info/history.html) and real URLs, or
	// [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
	// and URL fragments. If the browser supports neither (old IE, natch),
	// falls back to polling.
	var History = Backbone.History = function() {
		this.handlers = [];
		_.bindAll(this, 'checkUrl');

		// Ensure that `History` can be used outside of the browser.
		if (typeof window !== 'undefined') {
			this.location = window.location;
			this.history = window.history;
		}
	};

	// Cached regex for stripping a leading hash/slash and trailing space.
	var routeStripper = /^[#\/]|\s+$/g;

	// Cached regex for stripping leading and trailing slashes.
	var rootStripper = /^\/+|\/+$/g;

	// Cached regex for detecting MSIE.
	var isExplorer = /msie [\w.]+/;

	// Cached regex for removing a trailing slash.
	var trailingSlash = /\/$/;

	// Has the history handling already been started?
	History.started = false;

	// Set up all inheritable **Backbone.History** properties and methods.
	_.extend(History.prototype, Events, {

		// The default interval to poll for hash changes, if necessary, is
		// twenty times a second.
		interval: 50,

		// Gets the true hash value. Cannot use location.hash directly due to bug
		// in Firefox where location.hash will always be decoded.
		getHash: function(window) {
			var match = (window || this).location.href.match(/#(.*)$/);
			return match ? match[1] : '';
		},

		// Get the cross-browser normalized URL fragment, either from the URL,
		// the hash, or the override.
		getFragment: function(fragment, forcePushState) {
			if (fragment == null) {
				if (this._hasPushState || !this._wantsHashChange || forcePushState) {
					fragment = this.location.pathname;
					var root = this.root.replace(trailingSlash, '');
					if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
				} else {
					fragment = this.getHash();
				}
			}
			return fragment.replace(routeStripper, '');
		},

		// Start the hash change handling, returning `true` if the current URL matches
		// an existing route, and `false` otherwise.
		start: function(options) {
			if (History.started) throw new Error("Backbone.history has already been started");
			History.started = true;

			// Figure out the initial configuration. Do we need an iframe?
			// Is pushState desired ... is it available?
			this.options          = _.extend({}, {root: '/'}, this.options, options);
			this.root             = this.options.root;
			this._wantsHashChange = this.options.hashChange !== false;
			this._wantsPushState  = !!this.options.pushState;
			this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
			var fragment          = this.getFragment();
			var docMode           = document.documentMode;
			var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

			// Normalize root to always include a leading and trailing slash.
			this.root = ('/' + this.root + '/').replace(rootStripper, '/');

			if (oldIE && this._wantsHashChange) {
				this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
				this.navigate(fragment);
			}

			// Depending on whether we're using pushState or hashes, and whether
			// 'onhashchange' is supported, determine how we check the URL state.
			if (this._hasPushState) {
				Backbone.$(window).on('popstate', this.checkUrl);
			} else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
				Backbone.$(window).on('hashchange', this.checkUrl);
			} else if (this._wantsHashChange) {
				this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
			}

			// Determine if we need to change the base url, for a pushState link
			// opened by a non-pushState browser.
			this.fragment = fragment;
			var loc = this.location;
			var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

			// If we've started off with a route from a `pushState`-enabled browser,
			// but we're currently in a browser that doesn't support it...
			if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
				this.fragment = this.getFragment(null, true);
				this.location.replace(this.root + this.location.search + '#' + this.fragment);
				// Return immediately as browser will do redirect to new url
				return true;

				// Or if we've started out with a hash-based route, but we're currently
				// in a browser where it could be `pushState`-based instead...
			} else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
				this.fragment = this.getHash().replace(routeStripper, '');
				this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
			}

			if (!this.options.silent) return this.loadUrl();
		},

		// Disable Backbone.history, perhaps temporarily. Not useful in a real app,
		// but possibly useful for unit testing Routers.
		stop: function() {
			Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
			clearInterval(this._checkUrlInterval);
			History.started = false;
		},

		// Add a route to be tested when the fragment changes. Routes added later
		// may override previous routes.
		route: function(route, callback) {
			this.handlers.unshift({route: route, callback: callback});
		},

		// Checks the current URL to see if it has changed, and if it has,
		// calls `loadUrl`, normalizing across the hidden iframe.
		checkUrl: function(e) {
			var current = this.getFragment();
			if (current === this.fragment && this.iframe) {
				current = this.getFragment(this.getHash(this.iframe));
			}
			if (current === this.fragment) return false;
			if (this.iframe) this.navigate(current);
			this.loadUrl() || this.loadUrl(this.getHash());
		},

		// Attempt to load the current URL fragment. If a route succeeds with a
		// match, returns `true`. If no defined routes matches the fragment,
		// returns `false`.
		loadUrl: function(fragmentOverride) {
			var fragment = this.fragment = this.getFragment(fragmentOverride);
			var matched = _.any(this.handlers, function(handler) {
				if (handler.route.test(fragment)) {
					handler.callback(fragment);
					return true;
				}
			});
			return matched;
		},

		// Save a fragment into the hash history, or replace the URL state if the
		// 'replace' option is passed. You are responsible for properly URL-encoding
		// the fragment in advance.
		//
		// The options object can contain `trigger: true` if you wish to have the
		// route callback be fired (not usually desirable), or `replace: true`, if
		// you wish to modify the current URL without adding an entry to the history.
		navigate: function(fragment, options) {
			if (!History.started) return false;
			if (!options || options === true) options = {trigger: options};
			fragment = this.getFragment(fragment || '');
			if (this.fragment === fragment) return;
			this.fragment = fragment;
			var url = this.root + fragment;

			// If pushState is available, we use it to set the fragment as a real URL.
			if (this._hasPushState) {
				this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

				// If hash changes haven't been explicitly disabled, update the hash
				// fragment to store history.
			} else if (this._wantsHashChange) {
				this._updateHash(this.location, fragment, options.replace);
				if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
					// Opening and closing the iframe tricks IE7 and earlier to push a
					// history entry on hash-tag change.  When replace is true, we don't
					// want this.
					if(!options.replace) this.iframe.document.open().close();
					this._updateHash(this.iframe.location, fragment, options.replace);
				}

				// If you've told us that you explicitly don't want fallback hashchange-
				// based history, then `navigate` becomes a page refresh.
			} else {
				return this.location.assign(url);
			}
			if (options.trigger) this.loadUrl(fragment);
		},

		// Update the hash location, either replacing the current entry, or adding
		// a new one to the browser history.
		_updateHash: function(location, fragment, replace) {
			if (replace) {
				var href = location.href.replace(/(javascript:|#).*$/, '');
				location.replace(href + '#' + fragment);
			} else {
				// Some browsers require that `hash` contains a leading #.
				location.hash = '#' + fragment;
			}
		}

	});

	// Create the default Backbone.history.
	Backbone.history = new History;

	// Helpers
	// -------

	// Helper function to correctly set up the prototype chain, for subclasses.
	// Similar to `goog.inherits`, but uses a hash of prototype properties and
	// class properties to be extended.
	var extend = function(protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && _.has(protoProps, 'constructor')) {
			child = protoProps.constructor;
		} else {
			child = function(){ return parent.apply(this, arguments); };
		}

		// Add static properties to the constructor function, if supplied.
		_.extend(child, parent, staticProps);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) _.extend(child.prototype, protoProps);

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		return child;
	};

	// Set up inheritance for the model, collection, router, view and history.
	Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

	// Throw an error when a URL is needed, and none is supplied.
	var urlError = function() {
		throw new Error('A "url" property or function must be specified');
	};

	// Wrap an optional error callback with a fallback error event.
	var wrapError = function (model, options) {
		var error = options.error;
		options.error = function(resp) {
			if (error) error(model, resp, options);
			model.trigger('error', model, resp, options);
		};
	};

}).call(this);//     Backbone.js 1.0.0

//     (c) 2010-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

	// Initial Setup
	// -------------

	// Save a reference to the global object (`window` in the browser, `exports`
	// on the server).
	var root = this;

	// Save the previous value of the `Backbone` variable, so that it can be
	// restored later on, if `noConflict` is used.
	var previousBackbone = root.Backbone;

	// Create local references to array methods we'll want to use later.
	var array = [];
	var push = array.push;
	var slice = array.slice;
	var splice = array.splice;

	// The top-level namespace. All public Backbone classes and modules will
	// be attached to this. Exported for both the browser and the server.
	var Backbone;
	if (typeof exports !== 'undefined') {
		Backbone = exports;
	} else {
		Backbone = root.Backbone = {};
	}

	// Current version of the library. Keep in sync with `package.json`.
	Backbone.VERSION = '1.0.0';

	// Require Underscore, if we're on the server, and it's not already present.
	var _ = root._;
	if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

	// For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
	// the `$` variable.
	Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;

	// Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
	// to its previous owner. Returns a reference to this Backbone object.
	Backbone.noConflict = function() {
		root.Backbone = previousBackbone;
		return this;
	};

	// Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
	// will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
	// set a `X-Http-Method-Override` header.
	Backbone.emulateHTTP = false;

	// Turn on `emulateJSON` to support legacy servers that can't deal with direct
	// `application/json` requests ... will encode the body as
	// `application/x-www-form-urlencoded` instead and will send the model in a
	// form param named `model`.
	Backbone.emulateJSON = false;

	// Backbone.Events
	// ---------------

	// A module that can be mixed in to *any object* in order to provide it with
	// custom events. You may bind with `on` or remove with `off` callback
	// functions to an event; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = {};
	//     _.extend(object, Backbone.Events);
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//
	var Events = Backbone.Events = {

		// Bind an event to a `callback` function. Passing `"all"` will bind
		// the callback to all events fired.
		on: function(name, callback, context) {
			if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
			this._events || (this._events = {});
			var events = this._events[name] || (this._events[name] = []);
			events.push({callback: callback, context: context, ctx: context || this});
			return this;
		},

		// Bind an event to only be triggered a single time. After the first time
		// the callback is invoked, it will be removed.
		once: function(name, callback, context) {
			if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
			var self = this;
			var once = _.once(function() {
				self.off(name, once);
				callback.apply(this, arguments);
			});
			once._callback = callback;
			return this.on(name, once, context);
		},

		// Remove one or many callbacks. If `context` is null, removes all
		// callbacks with that function. If `callback` is null, removes all
		// callbacks for the event. If `name` is null, removes all bound
		// callbacks for all events.
		off: function(name, callback, context) {
			var retain, ev, events, names, i, l, j, k;
			if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
			if (!name && !callback && !context) {
				this._events = {};
				return this;
			}

			names = name ? [name] : _.keys(this._events);
			for (i = 0, l = names.length; i < l; i++) {
				name = names[i];
				if (events = this._events[name]) {
					this._events[name] = retain = [];
					if (callback || context) {
						for (j = 0, k = events.length; j < k; j++) {
							ev = events[j];
							if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
								(context && context !== ev.context)) {
								retain.push(ev);
							}
						}
					}
					if (!retain.length) delete this._events[name];
				}
			}

			return this;
		},

		// Trigger one or many events, firing all bound callbacks. Callbacks are
		// passed the same arguments as `trigger` is, apart from the event name
		// (unless you're listening on `"all"`, which will cause your callback to
		// receive the true name of the event as the first argument).
		trigger: function(name) {
			if (!this._events) return this;
			var args = slice.call(arguments, 1);
			if (!eventsApi(this, 'trigger', name, args)) return this;
			var events = this._events[name];
			var allEvents = this._events.all;
			if (events) triggerEvents(events, args);
			if (allEvents) triggerEvents(allEvents, arguments);
			return this;
		},

		// Tell this object to stop listening to either specific events ... or
		// to every object it's currently listening to.
		stopListening: function(obj, name, callback) {
			var listeners = this._listeners;
			if (!listeners) return this;
			var deleteListener = !name && !callback;
			if (typeof name === 'object') callback = this;
			if (obj) (listeners = {})[obj._listenerId] = obj;
			for (var id in listeners) {
				listeners[id].off(name, callback, this);
				if (deleteListener) delete this._listeners[id];
			}
			return this;
		}

	};

	// Regular expression used to split event strings.
	var eventSplitter = /\s+/;

	// Implement fancy features of the Events API such as multiple event
	// names `"change blur"` and jQuery-style event maps `{change: action}`
	// in terms of the existing API.
	var eventsApi = function(obj, action, name, rest) {
		if (!name) return true;

		// Handle event maps.
		if (typeof name === 'object') {
			for (var key in name) {
				obj[action].apply(obj, [key, name[key]].concat(rest));
			}
			return false;
		}

		// Handle space separated event names.
		if (eventSplitter.test(name)) {
			var names = name.split(eventSplitter);
			for (var i = 0, l = names.length; i < l; i++) {
				obj[action].apply(obj, [names[i]].concat(rest));
			}
			return false;
		}

		return true;
	};

	// A difficult-to-believe, but optimized internal dispatch function for
	// triggering events. Tries to keep the usual cases speedy (most internal
	// Backbone events have 3 arguments).
	var triggerEvents = function(events, args) {
		var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
		switch (args.length) {
			case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
			case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
			case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
			case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
			default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
		}
	};

	var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

	// Inversion-of-control versions of `on` and `once`. Tell *this* object to
	// listen to an event in another object ... keeping track of what it's
	// listening to.
	_.each(listenMethods, function(implementation, method) {
		Events[method] = function(obj, name, callback) {
			var listeners = this._listeners || (this._listeners = {});
			var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
			listeners[id] = obj;
			if (typeof name === 'object') callback = this;
			obj[implementation](name, callback, this);
			return this;
		};
	});

	// Aliases for backwards compatibility.
	Events.bind   = Events.on;
	Events.unbind = Events.off;

	// Allow the `Backbone` object to serve as a global event bus, for folks who
	// want global "pubsub" in a convenient place.
	_.extend(Backbone, Events);

	// Backbone.Model
	// --------------

	// Backbone **Models** are the basic data object in the framework --
	// frequently representing a row in a table in a database on your server.
	// A discrete chunk of data and a bunch of useful, related methods for
	// performing computations and transformations on that data.

	// Create a new model with the specified attributes. A client id (`cid`)
	// is automatically generated and assigned for you.
	var Model = Backbone.Model = function(attributes, options) {
		var defaults;
		var attrs = attributes || {};
		options || (options = {});
		this.cid = _.uniqueId('c');
		this.attributes = {};
		_.extend(this, _.pick(options, modelOptions));
		if (options.parse) attrs = this.parse(attrs, options) || {};
		if (defaults = _.result(this, 'defaults')) {
			attrs = _.defaults({}, attrs, defaults);
		}
		this.set(attrs, options);
		this.changed = {};
		this.initialize.apply(this, arguments);
	};

	// A list of options to be attached directly to the model, if provided.
	var modelOptions = ['url', 'urlRoot', 'collection'];

	// Attach all inheritable methods to the Model prototype.
	_.extend(Model.prototype, Events, {

		// A hash of attributes whose current and previous value differ.
		changed: null,

		// The value returned during the last failed validation.
		validationError: null,

		// The default name for the JSON `id` attribute is `"id"`. MongoDB and
		// CouchDB users may want to set this to `"_id"`.
		idAttribute: 'id',

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// Return a copy of the model's `attributes` object.
		toJSON: function(options) {
			return _.clone(this.attributes);
		},

		// Proxy `Backbone.sync` by default -- but override this if you need
		// custom syncing semantics for *this* particular model.
		sync: function() {
			return Backbone.sync.apply(this, arguments);
		},

		// Get the value of an attribute.
		get: function(attr) {
			return this.attributes[attr];
		},

		// Get the HTML-escaped value of an attribute.
		escape: function(attr) {
			return _.escape(this.get(attr));
		},

		// Returns `true` if the attribute contains a value that is not null
		// or undefined.
		has: function(attr) {
			return this.get(attr) != null;
		},

		// Set a hash of model attributes on the object, firing `"change"`. This is
		// the core primitive operation of a model, updating the data and notifying
		// anyone who needs to know about the change in state. The heart of the beast.
		set: function(key, val, options) {
			var attr, attrs, unset, changes, silent, changing, prev, current;
			if (key == null) return this;

			// Handle both `"key", value` and `{key: value}` -style arguments.
			if (typeof key === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			options || (options = {});

			// Run validation.
			if (!this._validate(attrs, options)) return false;

			// Extract attributes and options.
			unset           = options.unset;
			silent          = options.silent;
			changes         = [];
			changing        = this._changing;
			this._changing  = true;

			if (!changing) {
				this._previousAttributes = _.clone(this.attributes);
				this.changed = {};
			}
			current = this.attributes, prev = this._previousAttributes;

			// Check for changes of `id`.
			if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

			// For each `set` attribute, update or delete the current value.
			for (attr in attrs) {
				val = attrs[attr];
				if (!_.isEqual(current[attr], val)) changes.push(attr);
				if (!_.isEqual(prev[attr], val)) {
					this.changed[attr] = val;
				} else {
					delete this.changed[attr];
				}
				unset ? delete current[attr] : current[attr] = val;
			}

			// Trigger all relevant attribute changes.
			if (!silent) {
				if (changes.length) this._pending = true;
				for (var i = 0, l = changes.length; i < l; i++) {
					this.trigger('change:' + changes[i], this, current[changes[i]], options);
				}
			}

			// You might be wondering why there's a `while` loop here. Changes can
			// be recursively nested within `"change"` events.
			if (changing) return this;
			if (!silent) {
				while (this._pending) {
					this._pending = false;
					this.trigger('change', this, options);
				}
			}
			this._pending = false;
			this._changing = false;
			return this;
		},

		// Remove an attribute from the model, firing `"change"`. `unset` is a noop
		// if the attribute doesn't exist.
		unset: function(attr, options) {
			return this.set(attr, void 0, _.extend({}, options, {unset: true}));
		},

		// Clear all attributes on the model, firing `"change"`.
		clear: function(options) {
			var attrs = {};
			for (var key in this.attributes) attrs[key] = void 0;
			return this.set(attrs, _.extend({}, options, {unset: true}));
		},

		// Determine if the model has changed since the last `"change"` event.
		// If you specify an attribute name, determine if that attribute has changed.
		hasChanged: function(attr) {
			if (attr == null) return !_.isEmpty(this.changed);
			return _.has(this.changed, attr);
		},

		// Return an object containing all the attributes that have changed, or
		// false if there are no changed attributes. Useful for determining what
		// parts of a view need to be updated and/or what attributes need to be
		// persisted to the server. Unset attributes will be set to undefined.
		// You can also pass an attributes object to diff against the model,
		// determining if there *would be* a change.
		changedAttributes: function(diff) {
			if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
			var val, changed = false;
			var old = this._changing ? this._previousAttributes : this.attributes;
			for (var attr in diff) {
				if (_.isEqual(old[attr], (val = diff[attr]))) continue;
				(changed || (changed = {}))[attr] = val;
			}
			return changed;
		},

		// Get the previous value of an attribute, recorded at the time the last
		// `"change"` event was fired.
		previous: function(attr) {
			if (attr == null || !this._previousAttributes) return null;
			return this._previousAttributes[attr];
		},

		// Get all of the attributes of the model at the time of the previous
		// `"change"` event.
		previousAttributes: function() {
			return _.clone(this._previousAttributes);
		},

		// Fetch the model from the server. If the server's representation of the
		// model differs from its current attributes, they will be overridden,
		// triggering a `"change"` event.
		fetch: function(options) {
			options = options ? _.clone(options) : {};
			if (options.parse === void 0) options.parse = true;
			var model = this;
			var success = options.success;
			options.success = function(resp) {
				if (!model.set(model.parse(resp, options), options)) return false;
				if (success) success(model, resp, options);
				model.trigger('sync', model, resp, options);
			};
			wrapError(this, options);
			return this.sync('read', this, options);
		},

		// Set a hash of model attributes, and sync the model to the server.
		// If the server returns an attributes hash that differs, the model's
		// state will be `set` again.
		save: function(key, val, options) {
			var attrs, method, xhr, attributes = this.attributes;

			// Handle both `"key", value` and `{key: value}` -style arguments.
			if (key == null || typeof key === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			// If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
			if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;

			options = _.extend({validate: true}, options);

			// Do not persist invalid models.
			if (!this._validate(attrs, options)) return false;

			// Set temporary attributes if `{wait: true}`.
			if (attrs && options.wait) {
				this.attributes = _.extend({}, attributes, attrs);
			}

			// After a successful server-side save, the client is (optionally)
			// updated with the server-side state.
			if (options.parse === void 0) options.parse = true;
			var model = this;
			var success = options.success;
			options.success = function(resp) {
				// Ensure attributes are restored during synchronous saves.
				model.attributes = attributes;
				var serverAttrs = model.parse(resp, options);
				if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
				if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
					return false;
				}
				if (success) success(model, resp, options);
				model.trigger('sync', model, resp, options);
			};
			wrapError(this, options);

			method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
			if (method === 'patch') options.attrs = attrs;
			xhr = this.sync(method, this, options);

			// Restore attributes.
			if (attrs && options.wait) this.attributes = attributes;

			return xhr;
		},

		// Destroy this model on the server if it was already persisted.
		// Optimistically removes the model from its collection, if it has one.
		// If `wait: true` is passed, waits for the server to respond before removal.
		destroy: function(options) {
			options = options ? _.clone(options) : {};
			var model = this;
			var success = options.success;

			var destroy = function() {
				model.trigger('destroy', model, model.collection, options);
			};

			options.success = function(resp) {
				if (options.wait || model.isNew()) destroy();
				if (success) success(model, resp, options);
				if (!model.isNew()) model.trigger('sync', model, resp, options);
			};

			if (this.isNew()) {
				options.success();
				return false;
			}
			wrapError(this, options);

			var xhr = this.sync('delete', this, options);
			if (!options.wait) destroy();
			return xhr;
		},

		// Default URL for the model's representation on the server -- if you're
		// using Backbone's restful methods, override this to change the endpoint
		// that will be called.
		url: function() {
			var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
			if (this.isNew()) return base;
			return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
		},

		// **parse** converts a response into the hash of attributes to be `set` on
		// the model. The default implementation is just to pass the response along.
		parse: function(resp, options) {
			return resp;
		},

		// Create a new model with identical attributes to this one.
		clone: function() {
			return new this.constructor(this.attributes);
		},

		// A model is new if it has never been saved to the server, and lacks an id.
		isNew: function() {
			return this.id == null;
		},

		// Check if the model is currently in a valid state.
		isValid: function(options) {
			return this._validate({}, _.extend(options || {}, { validate: true }));
		},

		// Run validation against the next complete set of model attributes,
		// returning `true` if all is well. Otherwise, fire an `"invalid"` event.
		_validate: function(attrs, options) {
			if (!options.validate || !this.validate) return true;
			attrs = _.extend({}, this.attributes, attrs);
			var error = this.validationError = this.validate(attrs, options) || null;
			if (!error) return true;
			this.trigger('invalid', this, error, _.extend(options || {}, {validationError: error}));
			return false;
		}

	});

	// Underscore methods that we want to implement on the Model.
	var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

	// Mix in each Underscore method as a proxy to `Model#attributes`.
	_.each(modelMethods, function(method) {
		Model.prototype[method] = function() {
			var args = slice.call(arguments);
			args.unshift(this.attributes);
			return _[method].apply(_, args);
		};
	});

	// Backbone.Collection
	// -------------------

	// If models tend to represent a single row of data, a Backbone Collection is
	// more analagous to a table full of data ... or a small slice or page of that
	// table, or a collection of rows that belong together for a particular reason
	// -- all of the messages in this particular folder, all of the documents
	// belonging to this particular author, and so on. Collections maintain
	// indexes of their models, both in order, and for lookup by `id`.

	// Create a new **Collection**, perhaps to contain a specific type of `model`.
	// If a `comparator` is specified, the Collection will maintain
	// its models in sort order, as they're added and removed.
	var Collection = Backbone.Collection = function(models, options) {
		options || (options = {});
		if (options.url) this.url = options.url;
		if (options.model) this.model = options.model;
		if (options.comparator !== void 0) this.comparator = options.comparator;
		this._reset();
		this.initialize.apply(this, arguments);
		if (models) this.reset(models, _.extend({silent: true}, options));
	};

	// Default options for `Collection#set`.
	var setOptions = {add: true, remove: true, merge: true};
	var addOptions = {add: true, merge: false, remove: false};

	// Define the Collection's inheritable methods.
	_.extend(Collection.prototype, Events, {

		// The default model for a collection is just a **Backbone.Model**.
		// This should be overridden in most cases.
		model: Model,

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// The JSON representation of a Collection is an array of the
		// models' attributes.
		toJSON: function(options) {
			return this.map(function(model){ return model.toJSON(options); });
		},

		// Proxy `Backbone.sync` by default.
		sync: function() {
			return Backbone.sync.apply(this, arguments);
		},

		// Add a model, or list of models to the set.
		add: function(models, options) {
			return this.set(models, _.defaults(options || {}, addOptions));
		},

		// Remove a model, or a list of models from the set.
		remove: function(models, options) {
			models = _.isArray(models) ? models.slice() : [models];
			options || (options = {});
			var i, l, index, model;
			for (i = 0, l = models.length; i < l; i++) {
				model = this.get(models[i]);
				if (!model) continue;
				delete this._byId[model.id];
				delete this._byId[model.cid];
				index = this.indexOf(model);
				this.models.splice(index, 1);
				this.length--;
				if (!options.silent) {
					options.index = index;
					model.trigger('remove', model, this, options);
				}
				this._removeReference(model);
			}
			return this;
		},

		// Update a collection by `set`-ing a new list of models, adding new ones,
		// removing models that are no longer present, and merging models that
		// already exist in the collection, as necessary. Similar to **Model#set**,
		// the core operation for updating the data contained by the collection.
		set: function(models, options) {
			options = _.defaults(options || {}, setOptions);
			if (options.parse) models = this.parse(models, options);
			if (!_.isArray(models)) models = models ? [models] : [];
			var i, l, model, attrs, existing, sort;
			var at = options.at;
			var sortable = this.comparator && (at == null) && options.sort !== false;
			var sortAttr = _.isString(this.comparator) ? this.comparator : null;
			var toAdd = [], toRemove = [], modelMap = {};

			// Turn bare objects into model references, and prevent invalid models
			// from being added.
			for (i = 0, l = models.length; i < l; i++) {
				if (!(model = this._prepareModel(models[i], options))) continue;

				// If a duplicate is found, prevent it from being added and
				// optionally merge it into the existing model.
				if (existing = this.get(model)) {
					if (options.remove) modelMap[existing.cid] = true;
					if (options.merge) {
						existing.set(model.attributes, options);
						if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
					}

					// This is a new model, push it to the `toAdd` list.
				} else if (options.add) {
					toAdd.push(model);

					// Listen to added models' events, and index models for lookup by
					// `id` and by `cid`.
					model.on('all', this._onModelEvent, this);
					this._byId[model.cid] = model;
					if (model.id != null) this._byId[model.id] = model;
				}
			}

			// Remove nonexistent models if appropriate.
			if (options.remove) {
				for (i = 0, l = this.length; i < l; ++i) {
					if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
				}
				if (toRemove.length) this.remove(toRemove, options);
			}

			// See if sorting is needed, update `length` and splice in new models.
			if (toAdd.length) {
				if (sortable) sort = true;
				this.length += toAdd.length;
				if (at != null) {
					splice.apply(this.models, [at, 0].concat(toAdd));
				} else {
					push.apply(this.models, toAdd);
				}
			}

			// Silently sort the collection if appropriate.
			if (sort) this.sort({silent: true});

			if (options.silent) return this;

			// Trigger `add` events.
			for (i = 0, l = toAdd.length; i < l; i++) {
				(model = toAdd[i]).trigger('add', model, this, options);
			}

			// Trigger `sort` if the collection was sorted.
			if (sort) this.trigger('sort', this, options);
			return this;
		},

		// When you have more items than you want to add or remove individually,
		// you can reset the entire set with a new list of models, without firing
		// any granular `add` or `remove` events. Fires `reset` when finished.
		// Useful for bulk operations and optimizations.
		reset: function(models, options) {
			options || (options = {});
			for (var i = 0, l = this.models.length; i < l; i++) {
				this._removeReference(this.models[i]);
			}
			options.previousModels = this.models;
			this._reset();
			this.add(models, _.extend({silent: true}, options));
			if (!options.silent) this.trigger('reset', this, options);
			return this;
		},

		// Add a model to the end of the collection.
		push: function(model, options) {
			model = this._prepareModel(model, options);
			this.add(model, _.extend({at: this.length}, options));
			return model;
		},

		// Remove a model from the end of the collection.
		pop: function(options) {
			var model = this.at(this.length - 1);
			this.remove(model, options);
			return model;
		},

		// Add a model to the beginning of the collection.
		unshift: function(model, options) {
			model = this._prepareModel(model, options);
			this.add(model, _.extend({at: 0}, options));
			return model;
		},

		// Remove a model from the beginning of the collection.
		shift: function(options) {
			var model = this.at(0);
			this.remove(model, options);
			return model;
		},

		// Slice out a sub-array of models from the collection.
		slice: function(begin, end) {
			return this.models.slice(begin, end);
		},

		// Get a model from the set by id.
		get: function(obj) {
			if (obj == null) return void 0;
			return this._byId[obj.id != null ? obj.id : obj.cid || obj];
		},

		// Get the model at the given index.
		at: function(index) {
			return this.models[index];
		},

		// Return models with matching attributes. Useful for simple cases of
		// `filter`.
		where: function(attrs, first) {
			if (_.isEmpty(attrs)) return first ? void 0 : [];
			return this[first ? 'find' : 'filter'](function(model) {
				for (var key in attrs) {
					if (attrs[key] !== model.get(key)) return false;
				}
				return true;
			});
		},

		// Return the first model with matching attributes. Useful for simple cases
		// of `find`.
		findWhere: function(attrs) {
			return this.where(attrs, true);
		},

		// Force the collection to re-sort itself. You don't need to call this under
		// normal circumstances, as the set will maintain sort order as each item
		// is added.
		sort: function(options) {
			if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
			options || (options = {});

			// Run sort based on type of `comparator`.
			if (_.isString(this.comparator) || this.comparator.length === 1) {
				this.models = this.sortBy(this.comparator, this);
			} else {
				this.models.sort(_.bind(this.comparator, this));
			}

			if (!options.silent) this.trigger('sort', this, options);
			return this;
		},

		// Figure out the smallest index at which a model should be inserted so as
		// to maintain order.
		sortedIndex: function(model, value, context) {
			value || (value = this.comparator);
			var iterator = _.isFunction(value) ? value : function(model) {
				return model.get(value);
			};
			return _.sortedIndex(this.models, model, iterator, context);
		},

		// Pluck an attribute from each model in the collection.
		pluck: function(attr) {
			return _.invoke(this.models, 'get', attr);
		},

		// Fetch the default set of models for this collection, resetting the
		// collection when they arrive. If `reset: true` is passed, the response
		// data will be passed through the `reset` method instead of `set`.
		fetch: function(options) {
			options = options ? _.clone(options) : {};
			if (options.parse === void 0) options.parse = true;
			var success = options.success;
			var collection = this;
			options.success = function(resp) {
				var method = options.reset ? 'reset' : 'set';
				collection[method](resp, options);
				if (success) success(collection, resp, options);
				collection.trigger('sync', collection, resp, options);
			};
			wrapError(this, options);
			return this.sync('read', this, options);
		},

		// Create a new instance of a model in this collection. Add the model to the
		// collection immediately, unless `wait: true` is passed, in which case we
		// wait for the server to agree.
		create: function(model, options) {
			options = options ? _.clone(options) : {};
			if (!(model = this._prepareModel(model, options))) return false;
			if (!options.wait) this.add(model, options);
			var collection = this;
			var success = options.success;
			options.success = function(resp) {
				if (options.wait) collection.add(model, options);
				if (success) success(model, resp, options);
			};
			model.save(null, options);
			return model;
		},

		// **parse** converts a response into a list of models to be added to the
		// collection. The default implementation is just to pass it through.
		parse: function(resp, options) {
			return resp;
		},

		// Create a new collection with an identical list of models as this one.
		clone: function() {
			return new this.constructor(this.models);
		},

		// Private method to reset all internal state. Called when the collection
		// is first initialized or reset.
		_reset: function() {
			this.length = 0;
			this.models = [];
			this._byId  = {};
		},

		// Prepare a hash of attributes (or other model) to be added to this
		// collection.
		_prepareModel: function(attrs, options) {
			if (attrs instanceof Model) {
				if (!attrs.collection) attrs.collection = this;
				return attrs;
			}
			options || (options = {});
			options.collection = this;
			var model = new this.model(attrs, options);
			if (!model._validate(attrs, options)) {
				this.trigger('invalid', this, attrs, options);
				return false;
			}
			return model;
		},

		// Internal method to sever a model's ties to a collection.
		_removeReference: function(model) {
			if (this === model.collection) delete model.collection;
			model.off('all', this._onModelEvent, this);
		},

		// Internal method called every time a model in the set fires an event.
		// Sets need to update their indexes when models change ids. All other
		// events simply proxy through. "add" and "remove" events that originate
		// in other collections are ignored.
		_onModelEvent: function(event, model, collection, options) {
			if ((event === 'add' || event === 'remove') && collection !== this) return;
			if (event === 'destroy') this.remove(model, options);
			if (model && event === 'change:' + model.idAttribute) {
				delete this._byId[model.previous(model.idAttribute)];
				if (model.id != null) this._byId[model.id] = model;
			}
			this.trigger.apply(this, arguments);
		}

	});

	// Underscore methods that we want to implement on the Collection.
	// 90% of the core usefulness of Backbone Collections is actually implemented
	// right here:
	var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
		'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
		'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
		'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
		'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
		'isEmpty', 'chain'];

	// Mix in each Underscore method as a proxy to `Collection#models`.
	_.each(methods, function(method) {
		Collection.prototype[method] = function() {
			var args = slice.call(arguments);
			args.unshift(this.models);
			return _[method].apply(_, args);
		};
	});

	// Underscore methods that take a property name as an argument.
	var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

	// Use attributes instead of properties.
	_.each(attributeMethods, function(method) {
		Collection.prototype[method] = function(value, context) {
			var iterator = _.isFunction(value) ? value : function(model) {
				return model.get(value);
			};
			return _[method](this.models, iterator, context);
		};
	});

	// Backbone.View
	// -------------

	// Backbone Views are almost more convention than they are actual code. A View
	// is simply a JavaScript object that represents a logical chunk of UI in the
	// DOM. This might be a single item, an entire list, a sidebar or panel, or
	// even the surrounding frame which wraps your whole app. Defining a chunk of
	// UI as a **View** allows you to define your DOM events declaratively, without
	// having to worry about render order ... and makes it easy for the view to
	// react to specific changes in the state of your models.

	// Creating a Backbone.View creates its initial element outside of the DOM,
	// if an existing element is not provided...
	var View = Backbone.View = function(options) {
		this.cid = _.uniqueId('view');
		this._configure(options || {});
		this._ensureElement();
		this.initialize.apply(this, arguments);
		this.delegateEvents();
	};

	// Cached regex to split keys for `delegate`.
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	// List of view options to be merged as properties.
	var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

	// Set up all inheritable **Backbone.View** properties and methods.
	_.extend(View.prototype, Events, {

		// The default `tagName` of a View's element is `"div"`.
		tagName: 'div',

		// jQuery delegate for element lookup, scoped to DOM elements within the
		// current view. This should be prefered to global lookups where possible.
		$: function(selector) {
			return this.$el.find(selector);
		},

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// **render** is the core function that your view should override, in order
		// to populate its element (`this.el`), with the appropriate HTML. The
		// convention is for **render** to always return `this`.
		render: function() {
			return this;
		},

		// Remove this view by taking the element out of the DOM, and removing any
		// applicable Backbone.Events listeners.
		remove: function() {
			this.$el.remove();
			this.stopListening();
			return this;
		},

		// Change the view's element (`this.el` property), including event
		// re-delegation.
		setElement: function(element, delegate) {
			if (this.$el) this.undelegateEvents();
			this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
			this.el = this.$el[0];
			if (delegate !== false) this.delegateEvents();
			return this;
		},

		// Set callbacks, where `this.events` is a hash of
		//
		// *{"event selector": "callback"}*
		//
		//     {
		//       'mousedown .title':  'edit',
		//       'click .button':     'save'
		//       'click .open':       function(e) { ... }
		//     }
		//
		// pairs. Callbacks will be bound to the view, with `this` set properly.
		// Uses event delegation for efficiency.
		// Omitting the selector binds the event to `this.el`.
		// This only works for delegate-able events: not `focus`, `blur`, and
		// not `change`, `submit`, and `reset` in Internet Explorer.
		delegateEvents: function(events) {
			if (!(events || (events = _.result(this, 'events')))) return this;
			this.undelegateEvents();
			for (var key in events) {
				var method = events[key];
				if (!_.isFunction(method)) method = this[events[key]];
				if (!method) continue;

				var match = key.match(delegateEventSplitter);
				var eventName = match[1], selector = match[2];
				method = _.bind(method, this);
				eventName += '.delegateEvents' + this.cid;
				if (selector === '') {
					this.$el.on(eventName, method);
				} else {
					this.$el.on(eventName, selector, method);
				}
			}
			return this;
		},

		// Clears all callbacks previously bound to the view with `delegateEvents`.
		// You usually don't need to use this, but may wish to if you have multiple
		// Backbone views attached to the same DOM element.
		undelegateEvents: function() {
			this.$el.off('.delegateEvents' + this.cid);
			return this;
		},

		// Performs the initial configuration of a View with a set of options.
		// Keys with special meaning *(e.g. model, collection, id, className)* are
		// attached directly to the view.  See `viewOptions` for an exhaustive
		// list.
		_configure: function(options) {
			if (this.options) options = _.extend({}, _.result(this, 'options'), options);
			_.extend(this, _.pick(options, viewOptions));
			this.options = options;
		},

		// Ensure that the View has a DOM element to render into.
		// If `this.el` is a string, pass it through `$()`, take the first
		// matching element, and re-assign it to `el`. Otherwise, create
		// an element from the `id`, `className` and `tagName` properties.
		_ensureElement: function() {
			if (!this.el) {
				var attrs = _.extend({}, _.result(this, 'attributes'));
				if (this.id) attrs.id = _.result(this, 'id');
				if (this.className) attrs['class'] = _.result(this, 'className');
				var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
				this.setElement($el, false);
			} else {
				this.setElement(_.result(this, 'el'), false);
			}
		}

	});

	// Backbone.sync
	// -------------

	// Override this function to change the manner in which Backbone persists
	// models to the server. You will be passed the type of request, and the
	// model in question. By default, makes a RESTful Ajax request
	// to the model's `url()`. Some possible customizations could be:
	//
	// * Use `setTimeout` to batch rapid-fire updates into a single request.
	// * Send up the models as XML instead of JSON.
	// * Persist models via WebSockets instead of Ajax.
	//
	// Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
	// as `POST`, with a `_method` parameter containing the true HTTP method,
	// as well as all requests with the body as `application/x-www-form-urlencoded`
	// instead of `application/json` with the model in a param named `model`.
	// Useful when interfacing with server-side languages like **PHP** that make
	// it difficult to read the body of `PUT` requests.
	Backbone.sync = function(method, model, options) {
		var type = methodMap[method];

		// Default options, unless specified.
		_.defaults(options || (options = {}), {
			emulateHTTP: Backbone.emulateHTTP,
			emulateJSON: Backbone.emulateJSON
		});

		// Default JSON-request options.
		var params = {type: type, dataType: 'json'};

		// Ensure that we have a URL.
		if (!options.url) {
			params.url = _.result(model, 'url') || urlError();
		}

		// Ensure that we have the appropriate request data.
		if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
			params.contentType = 'application/json';
			params.data = JSON.stringify(options.attrs || model.toJSON(options));
		}

		// For older servers, emulate JSON by encoding the request into an HTML-form.
		if (options.emulateJSON) {
			params.contentType = 'application/x-www-form-urlencoded';
			params.data = params.data ? {model: params.data} : {};
		}

		// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
		// And an `X-HTTP-Method-Override` header.
		if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
			params.type = 'POST';
			if (options.emulateJSON) params.data._method = type;
			var beforeSend = options.beforeSend;
			options.beforeSend = function(xhr) {
				xhr.setRequestHeader('X-HTTP-Method-Override', type);
				if (beforeSend) return beforeSend.apply(this, arguments);
			};
		}

		// Don't process data on a non-GET request.
		if (params.type !== 'GET' && !options.emulateJSON) {
			params.processData = false;
		}

		// If we're sending a `PATCH` request, and we're in an old Internet Explorer
		// that still has ActiveX enabled by default, override jQuery to use that
		// for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
		if (params.type === 'PATCH' && window.ActiveXObject &&
			!(window.external && window.external.msActiveXFilteringEnabled)) {
			params.xhr = function() {
				return new ActiveXObject("Microsoft.XMLHTTP");
			};
		}

		// Make the request, allowing the user to override any Ajax options.
		var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
		model.trigger('request', model, xhr, options);
		return xhr;
	};

	// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	var methodMap = {
		'create': 'POST',
		'update': 'PUT',
		'patch':  'PATCH',
		'delete': 'DELETE',
		'read':   'GET'
	};

	// Set the default implementation of `Backbone.ajax` to proxy through to `$`.
	// Override this if you'd like to use a different library.
	Backbone.ajax = function() {
		return Backbone.$.ajax.apply(Backbone.$, arguments);
	};

	// Backbone.Router
	// ---------------

	// Routers map faux-URLs to actions, and fire events when routes are
	// matched. Creating a new one sets its `routes` hash, if not set statically.
	var Router = Backbone.Router = function(options) {
		options || (options = {});
		if (options.routes) this.routes = options.routes;
		this._bindRoutes();
		this.initialize.apply(this, arguments);
	};

	// Cached regular expressions for matching named param parts and splatted
	// parts of route strings.
	var optionalParam = /\((.*?)\)/g;
	var namedParam    = /(\(\?)?:\w+/g;
	var splatParam    = /\*\w+/g;
	var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

	// Set up all inheritable **Backbone.Router** properties and methods.
	_.extend(Router.prototype, Events, {

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// Manually bind a single named route to a callback. For example:
		//
		//     this.route('search/:query/p:num', 'search', function(query, num) {
		//       ...
		//     });
		//
		route: function(route, name, callback) {
			if (!_.isRegExp(route)) route = this._routeToRegExp(route);
			if (_.isFunction(name)) {
				callback = name;
				name = '';
			}
			if (!callback) callback = this[name];
			var router = this;
			Backbone.history.route(route, function(fragment) {
				var args = router._extractParameters(route, fragment);
				callback && callback.apply(router, args);
				router.trigger.apply(router, ['route:' + name].concat(args));
				router.trigger('route', name, args);
				Backbone.history.trigger('route', router, name, args);
			});
			return this;
		},

		// Simple proxy to `Backbone.history` to save a fragment into the history.
		navigate: function(fragment, options) {
			Backbone.history.navigate(fragment, options);
			return this;
		},

		// Bind all defined routes to `Backbone.history`. We have to reverse the
		// order of the routes here to support behavior where the most general
		// routes can be defined at the bottom of the route map.
		_bindRoutes: function() {
			if (!this.routes) return;
			this.routes = _.result(this, 'routes');
			var route, routes = _.keys(this.routes);
			while ((route = routes.pop()) != null) {
				this.route(route, this.routes[route]);
			}
		},

		// Convert a route string into a regular expression, suitable for matching
		// against the current location hash.
		_routeToRegExp: function(route) {
			route = route.replace(escapeRegExp, '\\$&')
				.replace(optionalParam, '(?:$1)?')
				.replace(namedParam, function(match, optional){
					return optional ? match : '([^\/]+)';
				})
				.replace(splatParam, '(.*?)');
			return new RegExp('^' + route + '$');
		},

		// Given a route, and a URL fragment that it matches, return the array of
		// extracted decoded parameters. Empty or unmatched parameters will be
		// treated as `null` to normalize cross-browser behavior.
		_extractParameters: function(route, fragment) {
			var params = route.exec(fragment).slice(1);
			return _.map(params, function(param) {
				return param ? decodeURIComponent(param) : null;
			});
		}

	});

	// Backbone.History
	// ----------------

	// Handles cross-browser history management, based on either
	// [pushState](http://diveintohtml5.info/history.html) and real URLs, or
	// [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
	// and URL fragments. If the browser supports neither (old IE, natch),
	// falls back to polling.
	var History = Backbone.History = function() {
		this.handlers = [];
		_.bindAll(this, 'checkUrl');

		// Ensure that `History` can be used outside of the browser.
		if (typeof window !== 'undefined') {
			this.location = window.location;
			this.history = window.history;
		}
	};

	// Cached regex for stripping a leading hash/slash and trailing space.
	var routeStripper = /^[#\/]|\s+$/g;

	// Cached regex for stripping leading and trailing slashes.
	var rootStripper = /^\/+|\/+$/g;

	// Cached regex for detecting MSIE.
	var isExplorer = /msie [\w.]+/;

	// Cached regex for removing a trailing slash.
	var trailingSlash = /\/$/;

	// Has the history handling already been started?
	History.started = false;

	// Set up all inheritable **Backbone.History** properties and methods.
	_.extend(History.prototype, Events, {

		// The default interval to poll for hash changes, if necessary, is
		// twenty times a second.
		interval: 50,

		// Gets the true hash value. Cannot use location.hash directly due to bug
		// in Firefox where location.hash will always be decoded.
		getHash: function(window) {
			var match = (window || this).location.href.match(/#(.*)$/);
			return match ? match[1] : '';
		},

		// Get the cross-browser normalized URL fragment, either from the URL,
		// the hash, or the override.
		getFragment: function(fragment, forcePushState) {
			if (fragment == null) {
				if (this._hasPushState || !this._wantsHashChange || forcePushState) {
					fragment = this.location.pathname;
					var root = this.root.replace(trailingSlash, '');
					if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
				} else {
					fragment = this.getHash();
				}
			}
			return fragment.replace(routeStripper, '');
		},

		// Start the hash change handling, returning `true` if the current URL matches
		// an existing route, and `false` otherwise.
		start: function(options) {
			if (History.started) throw new Error("Backbone.history has already been started");
			History.started = true;

			// Figure out the initial configuration. Do we need an iframe?
			// Is pushState desired ... is it available?
			this.options          = _.extend({}, {root: '/'}, this.options, options);
			this.root             = this.options.root;
			this._wantsHashChange = this.options.hashChange !== false;
			this._wantsPushState  = !!this.options.pushState;
			this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
			var fragment          = this.getFragment();
			var docMode           = document.documentMode;
			var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

			// Normalize root to always include a leading and trailing slash.
			this.root = ('/' + this.root + '/').replace(rootStripper, '/');

			if (oldIE && this._wantsHashChange) {
				this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
				this.navigate(fragment);
			}

			// Depending on whether we're using pushState or hashes, and whether
			// 'onhashchange' is supported, determine how we check the URL state.
			if (this._hasPushState) {
				Backbone.$(window).on('popstate', this.checkUrl);
			} else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
				Backbone.$(window).on('hashchange', this.checkUrl);
			} else if (this._wantsHashChange) {
				this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
			}

			// Determine if we need to change the base url, for a pushState link
			// opened by a non-pushState browser.
			this.fragment = fragment;
			var loc = this.location;
			var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

			// If we've started off with a route from a `pushState`-enabled browser,
			// but we're currently in a browser that doesn't support it...
			if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
				this.fragment = this.getFragment(null, true);
				this.location.replace(this.root + this.location.search + '#' + this.fragment);
				// Return immediately as browser will do redirect to new url
				return true;

				// Or if we've started out with a hash-based route, but we're currently
				// in a browser where it could be `pushState`-based instead...
			} else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
				this.fragment = this.getHash().replace(routeStripper, '');
				this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
			}

			if (!this.options.silent) return this.loadUrl();
		},

		// Disable Backbone.history, perhaps temporarily. Not useful in a real app,
		// but possibly useful for unit testing Routers.
		stop: function() {
			Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
			clearInterval(this._checkUrlInterval);
			History.started = false;
		},

		// Add a route to be tested when the fragment changes. Routes added later
		// may override previous routes.
		route: function(route, callback) {
			this.handlers.unshift({route: route, callback: callback});
		},

		// Checks the current URL to see if it has changed, and if it has,
		// calls `loadUrl`, normalizing across the hidden iframe.
		checkUrl: function(e) {
			var current = this.getFragment();
			if (current === this.fragment && this.iframe) {
				current = this.getFragment(this.getHash(this.iframe));
			}
			if (current === this.fragment) return false;
			if (this.iframe) this.navigate(current);
			this.loadUrl() || this.loadUrl(this.getHash());
		},

		// Attempt to load the current URL fragment. If a route succeeds with a
		// match, returns `true`. If no defined routes matches the fragment,
		// returns `false`.
		loadUrl: function(fragmentOverride) {
			var fragment = this.fragment = this.getFragment(fragmentOverride);
			var matched = _.any(this.handlers, function(handler) {
				if (handler.route.test(fragment)) {
					handler.callback(fragment);
					return true;
				}
			});
			return matched;
		},

		// Save a fragment into the hash history, or replace the URL state if the
		// 'replace' option is passed. You are responsible for properly URL-encoding
		// the fragment in advance.
		//
		// The options object can contain `trigger: true` if you wish to have the
		// route callback be fired (not usually desirable), or `replace: true`, if
		// you wish to modify the current URL without adding an entry to the history.
		navigate: function(fragment, options) {
			if (!History.started) return false;
			if (!options || options === true) options = {trigger: options};
			fragment = this.getFragment(fragment || '');
			if (this.fragment === fragment) return;
			this.fragment = fragment;
			var url = this.root + fragment;

			// If pushState is available, we use it to set the fragment as a real URL.
			if (this._hasPushState) {
				this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

				// If hash changes haven't been explicitly disabled, update the hash
				// fragment to store history.
			} else if (this._wantsHashChange) {
				this._updateHash(this.location, fragment, options.replace);
				if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
					// Opening and closing the iframe tricks IE7 and earlier to push a
					// history entry on hash-tag change.  When replace is true, we don't
					// want this.
					if(!options.replace) this.iframe.document.open().close();
					this._updateHash(this.iframe.location, fragment, options.replace);
				}

				// If you've told us that you explicitly don't want fallback hashchange-
				// based history, then `navigate` becomes a page refresh.
			} else {
				return this.location.assign(url);
			}
			if (options.trigger) this.loadUrl(fragment);
		},

		// Update the hash location, either replacing the current entry, or adding
		// a new one to the browser history.
		_updateHash: function(location, fragment, replace) {
			if (replace) {
				var href = location.href.replace(/(javascript:|#).*$/, '');
				location.replace(href + '#' + fragment);
			} else {
				// Some browsers require that `hash` contains a leading #.
				location.hash = '#' + fragment;
			}
		}

	});

	// Create the default Backbone.history.
	Backbone.history = new History;

	// Helpers
	// -------

	// Helper function to correctly set up the prototype chain, for subclasses.
	// Similar to `goog.inherits`, but uses a hash of prototype properties and
	// class properties to be extended.
	var extend = function(protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && _.has(protoProps, 'constructor')) {
			child = protoProps.constructor;
		} else {
			child = function(){ return parent.apply(this, arguments); };
		}

		// Add static properties to the constructor function, if supplied.
		_.extend(child, parent, staticProps);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) _.extend(child.prototype, protoProps);

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		return child;
	};

	// Set up inheritance for the model, collection, router, view and history.
	Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

	// Throw an error when a URL is needed, and none is supplied.
	var urlError = function() {
		throw new Error('A "url" property or function must be specified');
	};

	// Wrap an optional error callback with a fallback error event.
	var wrapError = function (model, options) {
		var error = options.error;
		options.error = function(resp) {
			if (error) error(model, resp, options);
			model.trigger('error', model, resp, options);
		};
	};

}).call(this);
//! moment.js
//! version : 2.2.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {

	/************************************
	 Constants
	 ************************************/

	var moment,
		VERSION = "2.2.1",
		round = Math.round, i,
	// internal storage for language config files
		languages = {},

	// check for nodeJS
		hasModule = (typeof module !== 'undefined' && module.exports),

	// ASP.NET json date format regex
		aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
		aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)\:(\d+)\.?(\d{3})?/,

	// format tokens
		formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,
		localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

	// parsing token regexes
		parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
		parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
		parseTokenThreeDigits = /\d{3}/, // 000 - 999
		parseTokenFourDigits = /\d{1,4}/, // 0 - 9999
		parseTokenSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
		parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
		parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
		parseTokenT = /T/i, // T (ISO seperator)
		parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

	// preliminary iso regex
	// 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
		isoRegex = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
		isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

	// iso time formats and regexes
		isoTimes = [
			['HH:mm:ss.S', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/],
			['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
			['HH:mm', /(T| )\d\d:\d\d/],
			['HH', /(T| )\d\d/]
		],

	// timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
		parseTimezoneChunker = /([\+\-]|\d\d)/gi,

	// getter and setter names
		proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
		unitMillisecondFactors = {
			'Milliseconds' : 1,
			'Seconds' : 1e3,
			'Minutes' : 6e4,
			'Hours' : 36e5,
			'Days' : 864e5,
			'Months' : 2592e6,
			'Years' : 31536e6
		},

		unitAliases = {
			ms : 'millisecond',
			s : 'second',
			m : 'minute',
			h : 'hour',
			d : 'day',
			w : 'week',
			W : 'isoweek',
			M : 'month',
			y : 'year'
		},

	// format function strings
		formatFunctions = {},

	// tokens to ordinalize and pad
		ordinalizeTokens = 'DDD w W M D d'.split(' '),
		paddedTokens = 'M D H h m s w W'.split(' '),

		formatTokenFunctions = {
			M    : function () {
				return this.month() + 1;
			},
			MMM  : function (format) {
				return this.lang().monthsShort(this, format);
			},
			MMMM : function (format) {
				return this.lang().months(this, format);
			},
			D    : function () {
				return this.date();
			},
			DDD  : function () {
				return this.dayOfYear();
			},
			d    : function () {
				return this.day();
			},
			dd   : function (format) {
				return this.lang().weekdaysMin(this, format);
			},
			ddd  : function (format) {
				return this.lang().weekdaysShort(this, format);
			},
			dddd : function (format) {
				return this.lang().weekdays(this, format);
			},
			w    : function () {
				return this.week();
			},
			W    : function () {
				return this.isoWeek();
			},
			YY   : function () {
				return leftZeroFill(this.year() % 100, 2);
			},
			YYYY : function () {
				return leftZeroFill(this.year(), 4);
			},
			YYYYY : function () {
				return leftZeroFill(this.year(), 5);
			},
			gg   : function () {
				return leftZeroFill(this.weekYear() % 100, 2);
			},
			gggg : function () {
				return this.weekYear();
			},
			ggggg : function () {
				return leftZeroFill(this.weekYear(), 5);
			},
			GG   : function () {
				return leftZeroFill(this.isoWeekYear() % 100, 2);
			},
			GGGG : function () {
				return this.isoWeekYear();
			},
			GGGGG : function () {
				return leftZeroFill(this.isoWeekYear(), 5);
			},
			e : function () {
				return this.weekday();
			},
			E : function () {
				return this.isoWeekday();
			},
			a    : function () {
				return this.lang().meridiem(this.hours(), this.minutes(), true);
			},
			A    : function () {
				return this.lang().meridiem(this.hours(), this.minutes(), false);
			},
			H    : function () {
				return this.hours();
			},
			h    : function () {
				return this.hours() % 12 || 12;
			},
			m    : function () {
				return this.minutes();
			},
			s    : function () {
				return this.seconds();
			},
			S    : function () {
				return ~~(this.milliseconds() / 100);
			},
			SS   : function () {
				return leftZeroFill(~~(this.milliseconds() / 10), 2);
			},
			SSS  : function () {
				return leftZeroFill(this.milliseconds(), 3);
			},
			Z    : function () {
				var a = -this.zone(),
					b = "+";
				if (a < 0) {
					a = -a;
					b = "-";
				}
				return b + leftZeroFill(~~(a / 60), 2) + ":" + leftZeroFill(~~a % 60, 2);
			},
			ZZ   : function () {
				var a = -this.zone(),
					b = "+";
				if (a < 0) {
					a = -a;
					b = "-";
				}
				return b + leftZeroFill(~~(10 * a / 6), 4);
			},
			z : function () {
				return this.zoneAbbr();
			},
			zz : function () {
				return this.zoneName();
			},
			X    : function () {
				return this.unix();
			}
		};

	function padToken(func, count) {
		return function (a) {
			return leftZeroFill(func.call(this, a), count);
		};
	}
	function ordinalizeToken(func, period) {
		return function (a) {
			return this.lang().ordinal(func.call(this, a), period);
		};
	}

	while (ordinalizeTokens.length) {
		i = ordinalizeTokens.pop();
		formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
	}
	while (paddedTokens.length) {
		i = paddedTokens.pop();
		formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
	}
	formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


	/************************************
	 Constructors
	 ************************************/

	function Language() {

	}

	// Moment prototype object
	function Moment(config) {
		extend(this, config);
	}

	// Duration Constructor
	function Duration(duration) {
		var years = duration.years || duration.year || duration.y || 0,
			months = duration.months || duration.month || duration.M || 0,
			weeks = duration.weeks || duration.week || duration.w || 0,
			days = duration.days || duration.day || duration.d || 0,
			hours = duration.hours || duration.hour || duration.h || 0,
			minutes = duration.minutes || duration.minute || duration.m || 0,
			seconds = duration.seconds || duration.second || duration.s || 0,
			milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;

		// store reference to input for deterministic cloning
		this._input = duration;

		// representation for dateAddRemove
		this._milliseconds = +milliseconds +
			seconds * 1e3 + // 1000
			minutes * 6e4 + // 1000 * 60
			hours * 36e5; // 1000 * 60 * 60
		// Because of dateAddRemove treats 24 hours as different from a
		// day when working around DST, we need to store them separately
		this._days = +days +
			weeks * 7;
		// It is impossible translate months into days without knowing
		// which months you are are talking about, so we have to store
		// it separately.
		this._months = +months +
			years * 12;

		this._data = {};

		this._bubble();
	}


	/************************************
	 Helpers
	 ************************************/


	function extend(a, b) {
		for (var i in b) {
			if (b.hasOwnProperty(i)) {
				a[i] = b[i];
			}
		}
		return a;
	}

	function absRound(number) {
		if (number < 0) {
			return Math.ceil(number);
		} else {
			return Math.floor(number);
		}
	}

	// left zero fill a number
	// see http://jsperf.com/left-zero-filling for performance comparison
	function leftZeroFill(number, targetLength) {
		var output = number + '';
		while (output.length < targetLength) {
			output = '0' + output;
		}
		return output;
	}

	// helper function for _.addTime and _.subtractTime
	function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
		var milliseconds = duration._milliseconds,
			days = duration._days,
			months = duration._months,
			minutes,
			hours;

		if (milliseconds) {
			mom._d.setTime(+mom._d + milliseconds * isAdding);
		}
		// store the minutes and hours so we can restore them
		if (days || months) {
			minutes = mom.minute();
			hours = mom.hour();
		}
		if (days) {
			mom.date(mom.date() + days * isAdding);
		}
		if (months) {
			mom.month(mom.month() + months * isAdding);
		}
		if (milliseconds && !ignoreUpdateOffset) {
			moment.updateOffset(mom);
		}
		// restore the minutes and hours after possibly changing dst
		if (days || months) {
			mom.minute(minutes);
			mom.hour(hours);
		}
	}

	// check if is an array
	function isArray(input) {
		return Object.prototype.toString.call(input) === '[object Array]';
	}

	// compare two arrays, return the number of differences
	function compareArrays(array1, array2) {
		var len = Math.min(array1.length, array2.length),
			lengthDiff = Math.abs(array1.length - array2.length),
			diffs = 0,
			i;
		for (i = 0; i < len; i++) {
			if (~~array1[i] !== ~~array2[i]) {
				diffs++;
			}
		}
		return diffs + lengthDiff;
	}

	function normalizeUnits(units) {
		return units ? unitAliases[units] || units.toLowerCase().replace(/(.)s$/, '$1') : units;
	}


	/************************************
	 Languages
	 ************************************/


	extend(Language.prototype, {

		set : function (config) {
			var prop, i;
			for (i in config) {
				prop = config[i];
				if (typeof prop === 'function') {
					this[i] = prop;
				} else {
					this['_' + i] = prop;
				}
			}
		},

		_months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
		months : function (m) {
			return this._months[m.month()];
		},

		_monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
		monthsShort : function (m) {
			return this._monthsShort[m.month()];
		},

		monthsParse : function (monthName) {
			var i, mom, regex;

			if (!this._monthsParse) {
				this._monthsParse = [];
			}

			for (i = 0; i < 12; i++) {
				// make the regex if we don't have it already
				if (!this._monthsParse[i]) {
					mom = moment.utc([2000, i]);
					regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
					this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
				}
				// test the regex
				if (this._monthsParse[i].test(monthName)) {
					return i;
				}
			}
		},

		_weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
		weekdays : function (m) {
			return this._weekdays[m.day()];
		},

		_weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
		weekdaysShort : function (m) {
			return this._weekdaysShort[m.day()];
		},

		_weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
		weekdaysMin : function (m) {
			return this._weekdaysMin[m.day()];
		},

		weekdaysParse : function (weekdayName) {
			var i, mom, regex;

			if (!this._weekdaysParse) {
				this._weekdaysParse = [];
			}

			for (i = 0; i < 7; i++) {
				// make the regex if we don't have it already
				if (!this._weekdaysParse[i]) {
					mom = moment([2000, 1]).day(i);
					regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
					this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
				}
				// test the regex
				if (this._weekdaysParse[i].test(weekdayName)) {
					return i;
				}
			}
		},

		_longDateFormat : {
			LT : "h:mm A",
			L : "MM/DD/YYYY",
			LL : "MMMM D YYYY",
			LLL : "MMMM D YYYY LT",
			LLLL : "dddd, MMMM D YYYY LT"
		},
		longDateFormat : function (key) {
			var output = this._longDateFormat[key];
			if (!output && this._longDateFormat[key.toUpperCase()]) {
				output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
					return val.slice(1);
				});
				this._longDateFormat[key] = output;
			}
			return output;
		},

		isPM : function (input) {
			// IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
			// Using charAt should be more compatible.
			return ((input + '').toLowerCase().charAt(0) === 'p');
		},

		_meridiemParse : /[ap]\.?m?\.?/i,
		meridiem : function (hours, minutes, isLower) {
			if (hours > 11) {
				return isLower ? 'pm' : 'PM';
			} else {
				return isLower ? 'am' : 'AM';
			}
		},

		_calendar : {
			sameDay : '[Today at] LT',
			nextDay : '[Tomorrow at] LT',
			nextWeek : 'dddd [at] LT',
			lastDay : '[Yesterday at] LT',
			lastWeek : '[Last] dddd [at] LT',
			sameElse : 'L'
		},
		calendar : function (key, mom) {
			var output = this._calendar[key];
			return typeof output === 'function' ? output.apply(mom) : output;
		},

		_relativeTime : {
			future : "in %s",
			past : "%s ago",
			s : "a few seconds",
			m : "a minute",
			mm : "%d minutes",
			h : "an hour",
			hh : "%d hours",
			d : "a day",
			dd : "%d days",
			M : "a month",
			MM : "%d months",
			y : "a year",
			yy : "%d years"
		},
		relativeTime : function (number, withoutSuffix, string, isFuture) {
			var output = this._relativeTime[string];
			return (typeof output === 'function') ?
				output(number, withoutSuffix, string, isFuture) :
				output.replace(/%d/i, number);
		},
		pastFuture : function (diff, output) {
			var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
			return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
		},

		ordinal : function (number) {
			return this._ordinal.replace("%d", number);
		},
		_ordinal : "%d",

		preparse : function (string) {
			return string;
		},

		postformat : function (string) {
			return string;
		},

		week : function (mom) {
			return weekOfYear(mom, this._week.dow, this._week.doy).week;
		},
		_week : {
			dow : 0, // Sunday is the first day of the week.
			doy : 6  // The week that contains Jan 1st is the first week of the year.
		}
	});

	// Loads a language definition into the `languages` cache.  The function
	// takes a key and optionally values.  If not in the browser and no values
	// are provided, it will load the language file module.  As a convenience,
	// this function also returns the language values.
	function loadLang(key, values) {
		values.abbr = key;
		if (!languages[key]) {
			languages[key] = new Language();
		}
		languages[key].set(values);
		return languages[key];
	}

	// Remove a language from the `languages` cache. Mostly useful in tests.
	function unloadLang(key) {
		delete languages[key];
	}

	// Determines which language definition to use and returns it.
	//
	// With no parameters, it will return the global language.  If you
	// pass in a language key, such as 'en', it will return the
	// definition for 'en', so long as 'en' has already been loaded using
	// moment.lang.
	function getLangDefinition(key) {
		if (!key) {
			return moment.fn._lang;
		}
		if (!languages[key] && hasModule) {
			try {
				require('./lang/' + key);
			} catch (e) {
				// call with no params to set to default
				return moment.fn._lang;
			}
		}
		return languages[key] || moment.fn._lang;
	}


	/************************************
	 Formatting
	 ************************************/


	function removeFormattingTokens(input) {
		if (input.match(/\[.*\]/)) {
			return input.replace(/^\[|\]$/g, "");
		}
		return input.replace(/\\/g, "");
	}

	function makeFormatFunction(format) {
		var array = format.match(formattingTokens), i, length;

		for (i = 0, length = array.length; i < length; i++) {
			if (formatTokenFunctions[array[i]]) {
				array[i] = formatTokenFunctions[array[i]];
			} else {
				array[i] = removeFormattingTokens(array[i]);
			}
		}

		return function (mom) {
			var output = "";
			for (i = 0; i < length; i++) {
				output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
			}
			return output;
		};
	}

	// format date using native date object
	function formatMoment(m, format) {

		format = expandFormat(format, m.lang());

		if (!formatFunctions[format]) {
			formatFunctions[format] = makeFormatFunction(format);
		}

		return formatFunctions[format](m);
	}

	function expandFormat(format, lang) {
		var i = 5;

		function replaceLongDateFormatTokens(input) {
			return lang.longDateFormat(input) || input;
		}

		while (i-- && (localFormattingTokens.lastIndex = 0,
			localFormattingTokens.test(format))) {
			format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
		}

		return format;
	}


	/************************************
	 Parsing
	 ************************************/


		// get the regex to find the next token
	function getParseRegexForToken(token, config) {
		switch (token) {
			case 'DDDD':
				return parseTokenThreeDigits;
			case 'YYYY':
				return parseTokenFourDigits;
			case 'YYYYY':
				return parseTokenSixDigits;
			case 'S':
			case 'SS':
			case 'SSS':
			case 'DDD':
				return parseTokenOneToThreeDigits;
			case 'MMM':
			case 'MMMM':
			case 'dd':
			case 'ddd':
			case 'dddd':
				return parseTokenWord;
			case 'a':
			case 'A':
				return getLangDefinition(config._l)._meridiemParse;
			case 'X':
				return parseTokenTimestampMs;
			case 'Z':
			case 'ZZ':
				return parseTokenTimezone;
			case 'T':
				return parseTokenT;
			case 'MM':
			case 'DD':
			case 'YY':
			case 'HH':
			case 'hh':
			case 'mm':
			case 'ss':
			case 'M':
			case 'D':
			case 'd':
			case 'H':
			case 'h':
			case 'm':
			case 's':
				return parseTokenOneOrTwoDigits;
			default :
				return new RegExp(token.replace('\\', ''));
		}
	}

	function timezoneMinutesFromString(string) {
		var tzchunk = (parseTokenTimezone.exec(string) || [])[0],
			parts = (tzchunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
			minutes = +(parts[1] * 60) + ~~parts[2];

		return parts[0] === '+' ? -minutes : minutes;
	}

	// function to convert string input to date
	function addTimeToArrayFromToken(token, input, config) {
		var a, datePartArray = config._a;

		switch (token) {
			// MONTH
			case 'M' : // fall through to MM
			case 'MM' :
				if (input != null) {
					datePartArray[1] = ~~input - 1;
				}
				break;
			case 'MMM' : // fall through to MMMM
			case 'MMMM' :
				a = getLangDefinition(config._l).monthsParse(input);
				// if we didn't find a month name, mark the date as invalid.
				if (a != null) {
					datePartArray[1] = a;
				} else {
					config._isValid = false;
				}
				break;
			// DAY OF MONTH
			case 'D' : // fall through to DD
			case 'DD' :
				if (input != null) {
					datePartArray[2] = ~~input;
				}
				break;
			// DAY OF YEAR
			case 'DDD' : // fall through to DDDD
			case 'DDDD' :
				if (input != null) {
					datePartArray[1] = 0;
					datePartArray[2] = ~~input;
				}
				break;
			// YEAR
			case 'YY' :
				datePartArray[0] = ~~input + (~~input > 68 ? 1900 : 2000);
				break;
			case 'YYYY' :
			case 'YYYYY' :
				datePartArray[0] = ~~input;
				break;
			// AM / PM
			case 'a' : // fall through to A
			case 'A' :
				config._isPm = getLangDefinition(config._l).isPM(input);
				break;
			// 24 HOUR
			case 'H' : // fall through to hh
			case 'HH' : // fall through to hh
			case 'h' : // fall through to hh
			case 'hh' :
				datePartArray[3] = ~~input;
				break;
			// MINUTE
			case 'm' : // fall through to mm
			case 'mm' :
				datePartArray[4] = ~~input;
				break;
			// SECOND
			case 's' : // fall through to ss
			case 'ss' :
				datePartArray[5] = ~~input;
				break;
			// MILLISECOND
			case 'S' :
			case 'SS' :
			case 'SSS' :
				datePartArray[6] = ~~ (('0.' + input) * 1000);
				break;
			// UNIX TIMESTAMP WITH MS
			case 'X':
				config._d = new Date(parseFloat(input) * 1000);
				break;
			// TIMEZONE
			case 'Z' : // fall through to ZZ
			case 'ZZ' :
				config._useUTC = true;
				config._tzm = timezoneMinutesFromString(input);
				break;
		}

		// if the input is null, the date is not valid
		if (input == null) {
			config._isValid = false;
		}
	}

	// convert an array to a date.
	// the array should mirror the parameters below
	// note: all values past the year are optional and will default to the lowest possible value.
	// [year, month, day , hour, minute, second, millisecond]
	function dateFromArray(config) {
		var i, date, input = [], currentDate;

		if (config._d) {
			return;
		}

		// Default to current date.
		// * if no year, month, day of month are given, default to today
		// * if day of month is given, default month and year
		// * if month is given, default only year
		// * if year is given, don't default anything
		currentDate = currentDateArray(config);
		for (i = 0; i < 3 && config._a[i] == null; ++i) {
			config._a[i] = input[i] = currentDate[i];
		}

		// Zero out whatever was not defaulted, including time
		for (; i < 7; i++) {
			config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
		}

		// add the offsets to the time to be parsed so that we can have a clean array for checking isValid
		input[3] += ~~((config._tzm || 0) / 60);
		input[4] += ~~((config._tzm || 0) % 60);

		date = new Date(0);

		if (config._useUTC) {
			date.setUTCFullYear(input[0], input[1], input[2]);
			date.setUTCHours(input[3], input[4], input[5], input[6]);
		} else {
			date.setFullYear(input[0], input[1], input[2]);
			date.setHours(input[3], input[4], input[5], input[6]);
		}

		config._d = date;
	}

	function dateFromObject(config) {
		var o = config._i;

		if (config._d) {
			return;
		}

		config._a = [
			o.years || o.year || o.y,
			o.months || o.month || o.M,
			o.days || o.day || o.d,
			o.hours || o.hour || o.h,
			o.minutes || o.minute || o.m,
			o.seconds || o.second || o.s,
			o.milliseconds || o.millisecond || o.ms
		];

		dateFromArray(config);
	}

	function currentDateArray(config) {
		var now = new Date();
		if (config._useUTC) {
			return [
				now.getUTCFullYear(),
				now.getUTCMonth(),
				now.getUTCDate()
			];
		} else {
			return [now.getFullYear(), now.getMonth(), now.getDate()];
		}
	}

	// date from string and format string
	function makeDateFromStringAndFormat(config) {
		// This array is used to make a Date, either with `new Date` or `Date.UTC`
		var lang = getLangDefinition(config._l),
			string = '' + config._i,
			i, parsedInput, tokens;

		tokens = expandFormat(config._f, lang).match(formattingTokens);

		config._a = [];

		for (i = 0; i < tokens.length; i++) {
			parsedInput = (getParseRegexForToken(tokens[i], config).exec(string) || [])[0];
			if (parsedInput) {
				string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
			}
			// don't parse if its not a known token
			if (formatTokenFunctions[tokens[i]]) {
				addTimeToArrayFromToken(tokens[i], parsedInput, config);
			}
		}

		// add remaining unparsed input to the string
		if (string) {
			config._il = string;
		}

		// handle am pm
		if (config._isPm && config._a[3] < 12) {
			config._a[3] += 12;
		}
		// if is 12 am, change hours to 0
		if (config._isPm === false && config._a[3] === 12) {
			config._a[3] = 0;
		}
		// return
		dateFromArray(config);
	}

	// date from string and array of format strings
	function makeDateFromStringAndArray(config) {
		var tempConfig,
			tempMoment,
			bestMoment,

			scoreToBeat = 99,
			i,
			currentScore;

		for (i = 0; i < config._f.length; i++) {
			tempConfig = extend({}, config);
			tempConfig._f = config._f[i];
			makeDateFromStringAndFormat(tempConfig);
			tempMoment = new Moment(tempConfig);

			currentScore = compareArrays(tempConfig._a, tempMoment.toArray());

			// if there is any input that was not parsed
			// add a penalty for that format
			if (tempMoment._il) {
				currentScore += tempMoment._il.length;
			}

			if (currentScore < scoreToBeat) {
				scoreToBeat = currentScore;
				bestMoment = tempMoment;
			}
		}

		extend(config, bestMoment);
	}

	// date from iso format
	function makeDateFromString(config) {
		var i,
			string = config._i,
			match = isoRegex.exec(string);

		if (match) {
			// match[2] should be "T" or undefined
			config._f = 'YYYY-MM-DD' + (match[2] || " ");
			for (i = 0; i < 4; i++) {
				if (isoTimes[i][1].exec(string)) {
					config._f += isoTimes[i][0];
					break;
				}
			}
			if (parseTokenTimezone.exec(string)) {
				config._f += " Z";
			}
			makeDateFromStringAndFormat(config);
		} else {
			config._d = new Date(string);
		}
	}

	function makeDateFromInput(config) {
		var input = config._i,
			matched = aspNetJsonRegex.exec(input);

		if (input === undefined) {
			config._d = new Date();
		} else if (matched) {
			config._d = new Date(+matched[1]);
		} else if (typeof input === 'string') {
			makeDateFromString(config);
		} else if (isArray(input)) {
			config._a = input.slice(0);
			dateFromArray(config);
		} else if (input instanceof Date) {
			config._d = new Date(+input);
		} else if (typeof(input) === 'object') {
			dateFromObject(config);
		} else {
			config._d = new Date(input);
		}
	}


	/************************************
	 Relative Time
	 ************************************/


		// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
		return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	}

	function relativeTime(milliseconds, withoutSuffix, lang) {
		var seconds = round(Math.abs(milliseconds) / 1000),
			minutes = round(seconds / 60),
			hours = round(minutes / 60),
			days = round(hours / 24),
			years = round(days / 365),
			args = seconds < 45 && ['s', seconds] ||
				minutes === 1 && ['m'] ||
				minutes < 45 && ['mm', minutes] ||
				hours === 1 && ['h'] ||
				hours < 22 && ['hh', hours] ||
				days === 1 && ['d'] ||
				days <= 25 && ['dd', days] ||
				days <= 45 && ['M'] ||
				days < 345 && ['MM', round(days / 30)] ||
				years === 1 && ['y'] || ['yy', years];
		args[2] = withoutSuffix;
		args[3] = milliseconds > 0;
		args[4] = lang;
		return substituteTimeAgo.apply({}, args);
	}


	/************************************
	 Week of Year
	 ************************************/


		// firstDayOfWeek       0 = sun, 6 = sat
		//                      the day of the week that starts the week
		//                      (usually sunday or monday)
		// firstDayOfWeekOfYear 0 = sun, 6 = sat
		//                      the first week is the week that contains the first
		//                      of this day of the week
		//                      (eg. ISO weeks use thursday (4))
	function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
		var end = firstDayOfWeekOfYear - firstDayOfWeek,
			daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
			adjustedMoment;


		if (daysToDayOfWeek > end) {
			daysToDayOfWeek -= 7;
		}

		if (daysToDayOfWeek < end - 7) {
			daysToDayOfWeek += 7;
		}

		adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
		return {
			week: Math.ceil(adjustedMoment.dayOfYear() / 7),
			year: adjustedMoment.year()
		};
	}


	/************************************
	 Top Level Functions
	 ************************************/

	function makeMoment(config) {
		var input = config._i,
			format = config._f;

		if (input === null || input === '') {
			return null;
		}

		if (typeof input === 'string') {
			config._i = input = getLangDefinition().preparse(input);
		}

		if (moment.isMoment(input)) {
			config = extend({}, input);
			config._d = new Date(+input._d);
		} else if (format) {
			if (isArray(format)) {
				makeDateFromStringAndArray(config);
			} else {
				makeDateFromStringAndFormat(config);
			}
		} else {
			makeDateFromInput(config);
		}

		return new Moment(config);
	}

	moment = function (input, format, lang) {
		return makeMoment({
			_i : input,
			_f : format,
			_l : lang,
			_isUTC : false
		});
	};

	// creating with utc
	moment.utc = function (input, format, lang) {
		return makeMoment({
			_useUTC : true,
			_isUTC : true,
			_l : lang,
			_i : input,
			_f : format
		}).utc();
	};

	// creating with unix timestamp (in seconds)
	moment.unix = function (input) {
		return moment(input * 1000);
	};

	// duration
	moment.duration = function (input, key) {
		var isDuration = moment.isDuration(input),
			isNumber = (typeof input === 'number'),
			duration = (isDuration ? input._input : (isNumber ? {} : input)),
			matched = aspNetTimeSpanJsonRegex.exec(input),
			sign,
			ret;

		if (isNumber) {
			if (key) {
				duration[key] = input;
			} else {
				duration.milliseconds = input;
			}
		} else if (matched) {
			sign = (matched[1] === "-") ? -1 : 1;
			duration = {
				y: 0,
				d: ~~matched[2] * sign,
				h: ~~matched[3] * sign,
				m: ~~matched[4] * sign,
				s: ~~matched[5] * sign,
				ms: ~~matched[6] * sign
			};
		}

		ret = new Duration(duration);

		if (isDuration && input.hasOwnProperty('_lang')) {
			ret._lang = input._lang;
		}

		return ret;
	};

	// version number
	moment.version = VERSION;

	// default format
	moment.defaultFormat = isoFormat;

	// This function will be called whenever a moment is mutated.
	// It is intended to keep the offset in sync with the timezone.
	moment.updateOffset = function () {};

	// This function will load languages and then set the global language.  If
	// no arguments are passed in, it will simply return the current global
	// language key.
	moment.lang = function (key, values) {
		if (!key) {
			return moment.fn._lang._abbr;
		}
		key = key.toLowerCase();
		key = key.replace('_', '-');
		if (values) {
			loadLang(key, values);
		} else if (values === null) {
			unloadLang(key);
			key = 'en';
		} else if (!languages[key]) {
			getLangDefinition(key);
		}
		moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
	};

	// returns language data
	moment.langData = function (key) {
		if (key && key._lang && key._lang._abbr) {
			key = key._lang._abbr;
		}
		return getLangDefinition(key);
	};

	// compare moment object
	moment.isMoment = function (obj) {
		return obj instanceof Moment;
	};

	// for typechecking Duration objects
	moment.isDuration = function (obj) {
		return obj instanceof Duration;
	};


	/************************************
	 Moment Prototype
	 ************************************/


	extend(moment.fn = Moment.prototype, {

		clone : function () {
			return moment(this);
		},

		valueOf : function () {
			return +this._d + ((this._offset || 0) * 60000);
		},

		unix : function () {
			return Math.floor(+this / 1000);
		},

		toString : function () {
			return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
		},

		toDate : function () {
			return this._offset ? new Date(+this) : this._d;
		},

		toISOString : function () {
			return formatMoment(moment(this).utc(), 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
		},

		toArray : function () {
			var m = this;
			return [
				m.year(),
				m.month(),
				m.date(),
				m.hours(),
				m.minutes(),
				m.seconds(),
				m.milliseconds()
			];
		},

		isValid : function () {
			if (this._isValid == null) {
				if (this._a) {
					this._isValid = !compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray());
				} else {
					this._isValid = !isNaN(this._d.getTime());
				}
			}
			return !!this._isValid;
		},

		invalidAt: function () {
			var i, arr1 = this._a, arr2 = (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray();
			for (i = 6; i >= 0 && arr1[i] === arr2[i]; --i) {
				// empty loop body
			}
			return i;
		},

		utc : function () {
			return this.zone(0);
		},

		local : function () {
			this.zone(0);
			this._isUTC = false;
			return this;
		},

		format : function (inputString) {
			var output = formatMoment(this, inputString || moment.defaultFormat);
			return this.lang().postformat(output);
		},

		add : function (input, val) {
			var dur;
			// switch args to support add('s', 1) and add(1, 's')
			if (typeof input === 'string') {
				dur = moment.duration(+val, input);
			} else {
				dur = moment.duration(input, val);
			}
			addOrSubtractDurationFromMoment(this, dur, 1);
			return this;
		},

		subtract : function (input, val) {
			var dur;
			// switch args to support subtract('s', 1) and subtract(1, 's')
			if (typeof input === 'string') {
				dur = moment.duration(+val, input);
			} else {
				dur = moment.duration(input, val);
			}
			addOrSubtractDurationFromMoment(this, dur, -1);
			return this;
		},

		diff : function (input, units, asFloat) {
			var that = this._isUTC ? moment(input).zone(this._offset || 0) : moment(input).local(),
				zoneDiff = (this.zone() - that.zone()) * 6e4,
				diff, output;

			units = normalizeUnits(units);

			if (units === 'year' || units === 'month') {
				// average number of days in the months in the given dates
				diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
				// difference in months
				output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
				// adjust by taking difference in days, average number of days
				// and dst in the given months.
				output += ((this - moment(this).startOf('month')) -
					(that - moment(that).startOf('month'))) / diff;
				// same as above but with zones, to negate all dst
				output -= ((this.zone() - moment(this).startOf('month').zone()) -
					(that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
				if (units === 'year') {
					output = output / 12;
				}
			} else {
				diff = (this - that);
				output = units === 'second' ? diff / 1e3 : // 1000
					units === 'minute' ? diff / 6e4 : // 1000 * 60
						units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
							units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
								units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
									diff;
			}
			return asFloat ? output : absRound(output);
		},

		from : function (time, withoutSuffix) {
			return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
		},

		fromNow : function (withoutSuffix) {
			return this.from(moment(), withoutSuffix);
		},

		calendar : function () {
			var diff = this.diff(moment().zone(this.zone()).startOf('day'), 'days', true),
				format = diff < -6 ? 'sameElse' :
					diff < -1 ? 'lastWeek' :
						diff < 0 ? 'lastDay' :
							diff < 1 ? 'sameDay' :
								diff < 2 ? 'nextDay' :
									diff < 7 ? 'nextWeek' : 'sameElse';
			return this.format(this.lang().calendar(format, this));
		},

		isLeapYear : function () {
			var year = this.year();
			return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
		},

		isDST : function () {
			return (this.zone() < this.clone().month(0).zone() ||
				this.zone() < this.clone().month(5).zone());
		},

		day : function (input) {
			var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
			if (input != null) {
				if (typeof input === 'string') {
					input = this.lang().weekdaysParse(input);
					if (typeof input !== 'number') {
						return this;
					}
				}
				return this.add({ d : input - day });
			} else {
				return day;
			}
		},

		month : function (input) {
			var utc = this._isUTC ? 'UTC' : '',
				dayOfMonth;

			if (input != null) {
				if (typeof input === 'string') {
					input = this.lang().monthsParse(input);
					if (typeof input !== 'number') {
						return this;
					}
				}

				dayOfMonth = this.date();
				this.date(1);
				this._d['set' + utc + 'Month'](input);
				this.date(Math.min(dayOfMonth, this.daysInMonth()));

				moment.updateOffset(this);
				return this;
			} else {
				return this._d['get' + utc + 'Month']();
			}
		},

		startOf: function (units) {
			units = normalizeUnits(units);
			// the following switch intentionally omits break keywords
			// to utilize falling through the cases.
			switch (units) {
				case 'year':
					this.month(0);
				/* falls through */
				case 'month':
					this.date(1);
				/* falls through */
				case 'week':
				case 'isoweek':
				case 'day':
					this.hours(0);
				/* falls through */
				case 'hour':
					this.minutes(0);
				/* falls through */
				case 'minute':
					this.seconds(0);
				/* falls through */
				case 'second':
					this.milliseconds(0);
				/* falls through */
			}

			// weeks are a special case
			if (units === 'week') {
				this.weekday(0);
			} else if (units === 'isoweek') {
				this.isoWeekday(1);
			}

			return this;
		},

		endOf: function (units) {
			units = normalizeUnits(units);
			return this.startOf(units).add((units === 'isoweek' ? 'week' : units), 1).subtract('ms', 1);
		},

		isAfter: function (input, units) {
			units = typeof units !== 'undefined' ? units : 'millisecond';
			return +this.clone().startOf(units) > +moment(input).startOf(units);
		},

		isBefore: function (input, units) {
			units = typeof units !== 'undefined' ? units : 'millisecond';
			return +this.clone().startOf(units) < +moment(input).startOf(units);
		},

		isSame: function (input, units) {
			units = typeof units !== 'undefined' ? units : 'millisecond';
			return +this.clone().startOf(units) === +moment(input).startOf(units);
		},

		min: function (other) {
			other = moment.apply(null, arguments);
			return other < this ? this : other;
		},

		max: function (other) {
			other = moment.apply(null, arguments);
			return other > this ? this : other;
		},

		zone : function (input) {
			var offset = this._offset || 0;
			if (input != null) {
				if (typeof input === "string") {
					input = timezoneMinutesFromString(input);
				}
				if (Math.abs(input) < 16) {
					input = input * 60;
				}
				this._offset = input;
				this._isUTC = true;
				if (offset !== input) {
					addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
				}
			} else {
				return this._isUTC ? offset : this._d.getTimezoneOffset();
			}
			return this;
		},

		zoneAbbr : function () {
			return this._isUTC ? "UTC" : "";
		},

		zoneName : function () {
			return this._isUTC ? "Coordinated Universal Time" : "";
		},

		hasAlignedHourOffset : function (input) {
			if (!input) {
				input = 0;
			}
			else {
				input = moment(input).zone();
			}

			return (this.zone() - input) % 60 === 0;
		},

		daysInMonth : function () {
			return moment.utc([this.year(), this.month() + 1, 0]).date();
		},

		dayOfYear : function (input) {
			var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
			return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
		},

		weekYear : function (input) {
			var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
			return input == null ? year : this.add("y", (input - year));
		},

		isoWeekYear : function (input) {
			var year = weekOfYear(this, 1, 4).year;
			return input == null ? year : this.add("y", (input - year));
		},

		week : function (input) {
			var week = this.lang().week(this);
			return input == null ? week : this.add("d", (input - week) * 7);
		},

		isoWeek : function (input) {
			var week = weekOfYear(this, 1, 4).week;
			return input == null ? week : this.add("d", (input - week) * 7);
		},

		weekday : function (input) {
			var weekday = (this._d.getDay() + 7 - this.lang()._week.dow) % 7;
			return input == null ? weekday : this.add("d", input - weekday);
		},

		isoWeekday : function (input) {
			// behaves the same as moment#day except
			// as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
			// as a setter, sunday should belong to the previous week.
			return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
		},

		get : function (units) {
			units = normalizeUnits(units);
			return this[units.toLowerCase()]();
		},

		set : function (units, value) {
			units = normalizeUnits(units);
			this[units.toLowerCase()](value);
		},

		// If passed a language key, it will set the language for this
		// instance.  Otherwise, it will return the language configuration
		// variables for this instance.
		lang : function (key) {
			if (key === undefined) {
				return this._lang;
			} else {
				this._lang = getLangDefinition(key);
				return this;
			}
		}
	});

	// helper for adding shortcuts
	function makeGetterAndSetter(name, key) {
		moment.fn[name] = moment.fn[name + 's'] = function (input) {
			var utc = this._isUTC ? 'UTC' : '';
			if (input != null) {
				this._d['set' + utc + key](input);
				moment.updateOffset(this);
				return this;
			} else {
				return this._d['get' + utc + key]();
			}
		};
	}

	// loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
	for (i = 0; i < proxyGettersAndSetters.length; i ++) {
		makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
	}

	// add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
	makeGetterAndSetter('year', 'FullYear');

	// add plural methods
	moment.fn.days = moment.fn.day;
	moment.fn.months = moment.fn.month;
	moment.fn.weeks = moment.fn.week;
	moment.fn.isoWeeks = moment.fn.isoWeek;

	// add aliased format methods
	moment.fn.toJSON = moment.fn.toISOString;

	/************************************
	 Duration Prototype
	 ************************************/


	extend(moment.duration.fn = Duration.prototype, {

		_bubble : function () {
			var milliseconds = this._milliseconds,
				days = this._days,
				months = this._months,
				data = this._data,
				seconds, minutes, hours, years;

			// The following code bubbles up values, see the tests for
			// examples of what that means.
			data.milliseconds = milliseconds % 1000;

			seconds = absRound(milliseconds / 1000);
			data.seconds = seconds % 60;

			minutes = absRound(seconds / 60);
			data.minutes = minutes % 60;

			hours = absRound(minutes / 60);
			data.hours = hours % 24;

			days += absRound(hours / 24);
			data.days = days % 30;

			months += absRound(days / 30);
			data.months = months % 12;

			years = absRound(months / 12);
			data.years = years;
		},

		weeks : function () {
			return absRound(this.days() / 7);
		},

		valueOf : function () {
			return this._milliseconds +
				this._days * 864e5 +
				(this._months % 12) * 2592e6 +
				~~(this._months / 12) * 31536e6;
		},

		humanize : function (withSuffix) {
			var difference = +this,
				output = relativeTime(difference, !withSuffix, this.lang());

			if (withSuffix) {
				output = this.lang().pastFuture(difference, output);
			}

			return this.lang().postformat(output);
		},

		add : function (input, val) {
			// supports only 2.0-style add(1, 's') or add(moment)
			var dur = moment.duration(input, val);

			this._milliseconds += dur._milliseconds;
			this._days += dur._days;
			this._months += dur._months;

			this._bubble();

			return this;
		},

		subtract : function (input, val) {
			var dur = moment.duration(input, val);

			this._milliseconds -= dur._milliseconds;
			this._days -= dur._days;
			this._months -= dur._months;

			this._bubble();

			return this;
		},

		get : function (units) {
			units = normalizeUnits(units);
			return this[units.toLowerCase() + 's']();
		},

		as : function (units) {
			units = normalizeUnits(units);
			return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
		},

		lang : moment.fn.lang
	});

	function makeDurationGetter(name) {
		moment.duration.fn[name] = function () {
			return this._data[name];
		};
	}

	function makeDurationAsGetter(name, factor) {
		moment.duration.fn['as' + name] = function () {
			return +this / factor;
		};
	}

	for (i in unitMillisecondFactors) {
		if (unitMillisecondFactors.hasOwnProperty(i)) {
			makeDurationAsGetter(i, unitMillisecondFactors[i]);
			makeDurationGetter(i.toLowerCase());
		}
	}

	makeDurationAsGetter('Weeks', 6048e5);
	moment.duration.fn.asMonths = function () {
		return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
	};


	/************************************
	 Default Lang
	 ************************************/


		// Set default language, other languages will inherit from English.
	moment.lang('en', {
		ordinal : function (number) {
			var b = number % 10,
				output = (~~ (number % 100 / 10) === 1) ? 'th' :
					(b === 1) ? 'st' :
						(b === 2) ? 'nd' :
							(b === 3) ? 'rd' : 'th';
			return number + output;
		}
	});

	/* EMBED_LANGUAGES */

	/************************************
	 Exposing Moment
	 ************************************/


	// CommonJS module is defined
	if (hasModule) {
		module.exports = moment;
	}
	/*global ender:false */
	if (typeof ender === 'undefined') {
		// here, `this` means `window` in the browser, or `global` on the server
		// add `moment` as a global object via a string identifier,
		// for Closure Compiler "advanced" mode
		this['moment'] = moment;
	}
	/*global define:false */
	if (typeof define === "function" && define.amd) {
		define("moment", [], function () {
			return moment;
		});
	}
}).call(this);
/* ========================================================================
 * Bootstrap: collapse.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#collapse
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd otransitionend'
    , 'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(window.jQuery);

/* =========================================================
 * bootstrap-datepicker.js
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 * Improvements by Andrew Rowls
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

(function( $ ) {

	var $window = $(window);

	function UTCDate(){
		return new Date(Date.UTC.apply(Date, arguments));
	}
	function UTCToday(){
		var today = new Date();
		return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
	}


	// Picker object

	var Datepicker = function(element, options) {
		var that = this;

		this._process_options(options);

		this.element = $(element);
		this.isInline = false;
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on, .btn') : false;
		this.hasInput = this.component && this.element.find('input').length;
		if(this.component && this.component.length === 0)
			this.component = false;

		this.picker = $(DPGlobal.template);
		this._buildEvents();
		this._attachEvents();

		if(this.isInline) {
			this.picker.addClass('datepicker-inline').appendTo(this.element);
		} else {
			this.picker.addClass('datepicker-dropdown dropdown-menu');
		}

		if (this.o.rtl){
			this.picker.addClass('datepicker-rtl');
			this.picker.find('.prev i, .next i')
						.toggleClass('icon-arrow-left icon-arrow-right');
		}


		this.viewMode = this.o.startView;

		if (this.o.calendarWeeks)
			this.picker.find('tfoot th.today')
						.attr('colspan', function(i, val){
							return parseInt(val) + 1;
						});

		this._allow_update = false;

		this.setStartDate(this._o.startDate);
		this.setEndDate(this._o.endDate);
		this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);

		this.fillDow();
		this.fillMonths();

		this._allow_update = true;

		this.update();
		this.showMode();

		if(this.isInline) {
			this.show();
		}
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		_process_options: function(opts){
			// Store raw options for reference
			this._o = $.extend({}, this._o, opts);
			// Processed options
			var o = this.o = $.extend({}, this._o);

			// Check if "de-DE" style date is available, if not language should
			// fallback to 2 letter code eg "de"
			var lang = o.language;
			if (!dates[lang]) {
				lang = lang.split('-')[0];
				if (!dates[lang])
					lang = defaults.language;
			}
			o.language = lang;

			switch(o.startView){
				case 2:
				case 'decade':
					o.startView = 2;
					break;
				case 1:
				case 'year':
					o.startView = 1;
					break;
				default:
					o.startView = 0;
			}

			switch (o.minViewMode) {
				case 1:
				case 'months':
					o.minViewMode = 1;
					break;
				case 2:
				case 'years':
					o.minViewMode = 2;
					break;
				default:
					o.minViewMode = 0;
			}

			o.startView = Math.max(o.startView, o.minViewMode);

			o.weekStart %= 7;
			o.weekEnd = ((o.weekStart + 6) % 7);

			var format = DPGlobal.parseFormat(o.format);
			if (o.startDate !== -Infinity) {
				if (!!o.startDate) {
					if (o.startDate instanceof Date)
						o.startDate = this._local_to_utc(this._zero_time(o.startDate));
					else
						o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
				} else {
					o.startDate = -Infinity;
				}
			}
			if (o.endDate !== Infinity) {
				if (!!o.endDate) {
					if (o.endDate instanceof Date)
						o.endDate = this._local_to_utc(this._zero_time(o.endDate));
					else
						o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
				} else {
					o.endDate = Infinity;
				}
			}

			o.daysOfWeekDisabled = o.daysOfWeekDisabled||[];
			if (!$.isArray(o.daysOfWeekDisabled))
				o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
			o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function (d) {
				return parseInt(d, 10);
			});

			var plc = String(o.orientation).toLowerCase().split(/\s+/g),
				_plc = o.orientation.toLowerCase();
			plc = $.grep(plc, function(word){
				return (/^auto|left|right|top|bottom$/).test(word);
			});
			o.orientation = {x: 'auto', y: 'auto'};
			if (!_plc || _plc === 'auto')
				; // no action
			else if (plc.length === 1){
				switch(plc[0]){
					case 'top':
					case 'bottom':
						o.orientation.y = plc[0];
						break;
					case 'left':
					case 'right':
						o.orientation.x = plc[0];
						break;
				}
			}
			else {
				_plc = $.grep(plc, function(word){
					return (/^left|right$/).test(word);
				});
				o.orientation.x = _plc[0] || 'auto';

				_plc = $.grep(plc, function(word){
					return (/^top|bottom$/).test(word);
				});
				o.orientation.y = _plc[0] || 'auto';
			}
		},
		_events: [],
		_secondaryEvents: [],
		_applyEvents: function(evs){
			for (var i=0, el, ev; i<evs.length; i++){
				el = evs[i][0];
				ev = evs[i][1];
				el.on(ev);
			}
		},
		_unapplyEvents: function(evs){
			for (var i=0, el, ev; i<evs.length; i++){
				el = evs[i][0];
				ev = evs[i][1];
				el.off(ev);
			}
		},
		_buildEvents: function(){
			if (this.isInput) { // single input
				this._events = [
					[this.element, {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(this.update, this),
						keydown: $.proxy(this.keydown, this)
					}]
				];
			}
			else if (this.component && this.hasInput){ // component: input + button
				this._events = [
					// For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(this.update, this),
						keydown: $.proxy(this.keydown, this)
					}],
					[this.component, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			else if (this.element.is('div')) {  // inline datepicker
				this.isInline = true;
			}
			else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this)
					}]
				];
			}

			this._secondaryEvents = [
				[this.picker, {
					click: $.proxy(this.click, this)
				}],
				[$(window), {
					resize: $.proxy(this.place, this)
				}],
				[$(document), {
					mousedown: $.proxy(function (e) {
						// Clicked outside the datepicker, hide it
						if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).length ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).length
						)) {
							this.hide();
						}
					}, this)
				}]
			];
		},
		_attachEvents: function(){
			this._detachEvents();
			this._applyEvents(this._events);
		},
		_detachEvents: function(){
			this._unapplyEvents(this._events);
		},
		_attachSecondaryEvents: function(){
			this._detachSecondaryEvents();
			this._applyEvents(this._secondaryEvents);
		},
		_detachSecondaryEvents: function(){
			this._unapplyEvents(this._secondaryEvents);
		},
		_trigger: function(event, altdate){
			var date = altdate || this.date,
				local_date = this._utc_to_local(date);

			this.element.trigger({
				type: event,
				date: local_date,
				format: $.proxy(function(altformat){
					var format = altformat || this.o.format;
					return DPGlobal.formatDate(date, format, this.o.language);
				}, this)
			});
		},

		show: function(e) {
			if (!this.isInline)
				this.picker.appendTo('body');
			this.picker.show();
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			this.place();
			this._attachSecondaryEvents();
			if (e) {
				e.preventDefault();
			}
			this._trigger('show');
		},

		hide: function(e){
			if(this.isInline) return;
			if (!this.picker.is(':visible')) return;
			this.picker.hide().detach();
			this._detachSecondaryEvents();
			this.viewMode = this.o.startView;
			this.showMode();

			if (
				this.o.forceParse &&
				(
					this.isInput && this.element.val() ||
					this.hasInput && this.element.find('input').val()
				)
			)
				this.setValue();
			this._trigger('hide');
		},

		remove: function() {
			this.hide();
			this._detachEvents();
			this._detachSecondaryEvents();
			this.picker.remove();
			delete this.element.data().datepicker;
			if (!this.isInput) {
				delete this.element.data().date;
			}
		},

		_utc_to_local: function(utc){
			return new Date(utc.getTime() + (utc.getTimezoneOffset()*60000));
		},
		_local_to_utc: function(local){
			return new Date(local.getTime() - (local.getTimezoneOffset()*60000));
		},
		_zero_time: function(local){
			return new Date(local.getFullYear(), local.getMonth(), local.getDate());
		},
		_zero_utc_time: function(utc){
			return new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
		},

		getDate: function() {
			return this._utc_to_local(this.getUTCDate());
		},

		getUTCDate: function() {
			return this.date;
		},

		setDate: function(d) {
			this.setUTCDate(this._local_to_utc(d));
		},

		setUTCDate: function(d) {
			this.date = d;
			this.setValue();
		},

		setValue: function() {
			var formatted = this.getFormattedDate();
			if (!this.isInput) {
				if (this.component){
					this.element.find('input').val(formatted).change();
				}
			} else {
				this.element.val(formatted).change();
			}
		},

		getFormattedDate: function(format) {
			if (format === undefined)
				format = this.o.format;
			return DPGlobal.formatDate(this.date, format, this.o.language);
		},

		setStartDate: function(startDate){
			this._process_options({startDate: startDate});
			this.update();
			this.updateNavArrows();
		},

		setEndDate: function(endDate){
			this._process_options({endDate: endDate});
			this.update();
			this.updateNavArrows();
		},

		setDaysOfWeekDisabled: function(daysOfWeekDisabled){
			this._process_options({daysOfWeekDisabled: daysOfWeekDisabled});
			this.update();
			this.updateNavArrows();
		},

		place: function(){
						if(this.isInline) return;
			var calendarWidth = this.picker.outerWidth(),
				calendarHeight = this.picker.outerHeight(),
				visualPadding = 10,
				windowWidth = $window.width(),
				windowHeight = $window.height(),
				scrollTop = $window.scrollTop();

			var zIndex = parseInt(this.element.parents().filter(function() {
							return $(this).css('z-index') != 'auto';
						}).first().css('z-index'))+10;
			var offset = this.component ? this.component.parent().offset() : this.element.offset();
			var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
			var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
			var left = offset.left,
				top = offset.top;

			this.picker.removeClass(
				'datepicker-orient-top datepicker-orient-bottom '+
				'datepicker-orient-right datepicker-orient-left'
			);

			if (this.o.orientation.x !== 'auto') {
				this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
				if (this.o.orientation.x === 'right')
					left -= calendarWidth - width;
			}
			// auto x orientation is best-placement: if it crosses a window
			// edge, fudge it sideways
			else {
				// Default to left
				this.picker.addClass('datepicker-orient-left');
				if (offset.left < 0)
					left -= offset.left - visualPadding;
				else if (offset.left + calendarWidth > windowWidth)
					left = windowWidth - calendarWidth - visualPadding;
			}

			// auto y orientation is best-situation: top or bottom, no fudging,
			// decision based on which shows more of the calendar
			var yorient = this.o.orientation.y,
				top_overflow, bottom_overflow;
			if (yorient === 'auto') {
				top_overflow = -scrollTop + offset.top - calendarHeight;
				bottom_overflow = scrollTop + windowHeight - (offset.top + height + calendarHeight);
				if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
					yorient = 'top';
				else
					yorient = 'bottom';
			}
			this.picker.addClass('datepicker-orient-' + yorient);
			if (yorient === 'top')
				top += height;
			else
				top -= calendarHeight + parseInt(this.picker.css('padding-top'));

			this.picker.css({
				top: top,
				left: left,
				zIndex: zIndex
			});
		},

		_allow_update: true,
		update: function(){
			if (!this._allow_update) return;

			var oldDate = new Date(this.date),
				date, fromArgs = false;
			if(arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
				date = arguments[0];
				if (date instanceof Date)
					date = this._local_to_utc(date);
				fromArgs = true;
			} else {
				date = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
				delete this.element.data().date;
			}

			this.date = DPGlobal.parseDate(date, this.o.format, this.o.language);

			if (fromArgs) {
				// setting date by clicking
				this.setValue();
			} else if (date) {
				// setting date by typing
				if (oldDate.getTime() !== this.date.getTime())
					this._trigger('changeDate');
			} else {
				// clearing date
				this._trigger('clearDate');
			}

			if (this.date < this.o.startDate) {
				this.viewDate = new Date(this.o.startDate);
				this.date = new Date(this.o.startDate);
			} else if (this.date > this.o.endDate) {
				this.viewDate = new Date(this.o.endDate);
				this.date = new Date(this.o.endDate);
			} else {
				this.viewDate = new Date(this.date);
				this.date = new Date(this.date);
			}
			this.fill();
		},

		fillDow: function(){
			var dowCnt = this.o.weekStart,
			html = '<tr>';
			if(this.o.calendarWeeks){
				var cell = '<th class="cw">&nbsp;</th>';
				html += cell;
				this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
			}
			while (dowCnt < this.o.weekStart + 7) {
				html += '<th class="dow">'+dates[this.o.language].daysMin[(dowCnt++)%7]+'</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},

		fillMonths: function(){
			var html = '',
			i = 0;
			while (i < 12) {
				html += '<span class="month">'+dates[this.o.language].monthsShort[i++]+'</span>';
			}
			this.picker.find('.datepicker-months td').html(html);
		},

		setRange: function(range){
			if (!range || !range.length)
				delete this.range;
			else
				this.range = $.map(range, function(d){ return d.valueOf(); });
			this.fill();
		},

		getClassNames: function(date){
			var cls = [],
				year = this.viewDate.getUTCFullYear(),
				month = this.viewDate.getUTCMonth(),
				currentDate = this.date.valueOf(),
				today = new Date();
			if (date.getUTCFullYear() < year || (date.getUTCFullYear() == year && date.getUTCMonth() < month)) {
				cls.push('old');
			} else if (date.getUTCFullYear() > year || (date.getUTCFullYear() == year && date.getUTCMonth() > month)) {
				cls.push('new');
			}
			// Compare internal UTC date with local today, not UTC today
			if (this.o.todayHighlight &&
				date.getUTCFullYear() == today.getFullYear() &&
				date.getUTCMonth() == today.getMonth() &&
				date.getUTCDate() == today.getDate()) {
				cls.push('today');
			}
			if (currentDate && date.valueOf() == currentDate) {
				cls.push('active');
			}
			if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
				$.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1) {
				cls.push('disabled');
			}
			if (this.range){
				if (date > this.range[0] && date < this.range[this.range.length-1]){
					cls.push('range');
				}
				if ($.inArray(date.valueOf(), this.range) != -1){
					cls.push('selected');
				}
			}
			return cls;
		},

		fill: function() {
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
				endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
				endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
				currentDate = this.date && this.date.valueOf(),
				tooltip;
			this.picker.find('.datepicker-days thead th.datepicker-switch')
						.text(dates[this.o.language].months[month]+' '+year);
			this.picker.find('tfoot th.today')
						.text(dates[this.o.language].today)
						.toggle(this.o.todayBtn !== false);
			this.picker.find('tfoot th.clear')
						.text(dates[this.o.language].clear)
						.toggle(this.o.clearBtn !== false);
			this.updateNavArrows();
			this.fillMonths();
			var prevMonth = UTCDate(year, month-1, 28,0,0,0,0),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
			prevMonth.setUTCDate(day);
			prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName;
			while(prevMonth.valueOf() < nextMonth) {
				if (prevMonth.getUTCDay() == this.o.weekStart) {
					html.push('<tr>');
					if(this.o.calendarWeeks){
						// ISO 8601: First week contains first thursday.
						// ISO also states week starts on Monday, but we can be more abstract here.
						var
							// Start of current week: based on weekstart/current date
							ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
							// Thursday of this week
							th = new Date(+ws + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
							// First Thursday of year, year from thursday
							yth = new Date(+(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay())%7*864e5),
							// Calendar week: ms between thursdays, div ms per day, div 7 days
							calWeek =  (th - yth) / 864e5 / 7 + 1;
						html.push('<td class="cw">'+ calWeek +'</td>');

					}
				}
				clsName = this.getClassNames(prevMonth);
				clsName.push('day');

				if (this.o.beforeShowDay !== $.noop){
					var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
					if (before === undefined)
						before = {};
					else if (typeof(before) === 'boolean')
						before = {enabled: before};
					else if (typeof(before) === 'string')
						before = {classes: before};
					if (before.enabled === false)
						clsName.push('disabled');
					if (before.classes)
						clsName = clsName.concat(before.classes.split(/\s+/));
					if (before.tooltip)
						tooltip = before.tooltip;
				}

				clsName = $.unique(clsName);
				html.push('<td class="'+clsName.join(' ')+'"' + (tooltip ? ' title="'+tooltip+'"' : '') + '>'+prevMonth.getUTCDate() + '</td>');
				if (prevMonth.getUTCDay() == this.o.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate()+1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
			var currentYear = this.date && this.date.getUTCFullYear();

			var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');
			if (currentYear && currentYear == year) {
				months.eq(this.date.getUTCMonth()).addClass('active');
			}
			if (year < startYear || year > endYear) {
				months.addClass('disabled');
			}
			if (year == startYear) {
				months.slice(0, startMonth).addClass('disabled');
			}
			if (year == endYear) {
				months.slice(endMonth+1).addClass('disabled');
			}

			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			for (var i = -1; i < 11; i++) {
				html += '<span class="year'+(i == -1 ? ' old' : i == 10 ? ' new' : '')+(currentYear == year ? ' active' : '')+(year < startYear || year > endYear ? ' disabled' : '')+'">'+year+'</span>';
				year += 1;
			}
			yearCont.html(html);
		},

		updateNavArrows: function() {
			if (!this._allow_update) return;

			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
			switch (this.viewMode) {
				case 0:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()) {
						this.picker.find('.prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()) {
						this.picker.find('.next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
				case 1:
				case 2:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()) {
						this.picker.find('.prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()) {
						this.picker.find('.next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
			}
		},

		click: function(e) {
			e.preventDefault();
			var target = $(e.target).closest('span, td, th');
			if (target.length == 1) {
				switch(target[0].nodeName.toLowerCase()) {
					case 'th':
						switch(target[0].className) {
							case 'datepicker-switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'prev' ? -1 : 1);
								switch(this.viewMode){
									case 0:
										this.viewDate = this.moveMonth(this.viewDate, dir);
										this._trigger('changeMonth', this.viewDate);
										break;
									case 1:
									case 2:
										this.viewDate = this.moveYear(this.viewDate, dir);
										if (this.viewMode === 1)
											this._trigger('changeYear', this.viewDate);
										break;
								}
								this.fill();
								break;
							case 'today':
								var date = new Date();
								date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

								this.showMode(-2);
								var which = this.o.todayBtn == 'linked' ? null : 'view';
								this._setDate(date, which);
								break;
							case 'clear':
								var element;
								if (this.isInput)
									element = this.element;
								else if (this.component)
									element = this.element.find('input');
								if (element)
									element.val("").change();
								this._trigger('changeDate');
								this.update();
								if (this.o.autoclose)
									this.hide();
								break;
						}
						break;
					case 'span':
						if (!target.is('.disabled')) {
							this.viewDate.setUTCDate(1);
							if (target.is('.month')) {
								var day = 1;
								var month = target.parent().find('span').index(target);
								var year = this.viewDate.getUTCFullYear();
								this.viewDate.setUTCMonth(month);
								this._trigger('changeMonth', this.viewDate);
								if (this.o.minViewMode === 1) {
									this._setDate(UTCDate(year, month, day,0,0,0,0));
								}
							} else {
								var year = parseInt(target.text(), 10)||0;
								var day = 1;
								var month = 0;
								this.viewDate.setUTCFullYear(year);
								this._trigger('changeYear', this.viewDate);
								if (this.o.minViewMode === 2) {
									this._setDate(UTCDate(year, month, day,0,0,0,0));
								}
							}
							this.showMode(-1);
							this.fill();
						}
						break;
					case 'td':
						if (target.is('.day') && !target.is('.disabled')){
							var day = parseInt(target.text(), 10)||1;
							var year = this.viewDate.getUTCFullYear(),
								month = this.viewDate.getUTCMonth();
							if (target.is('.old')) {
								if (month === 0) {
									month = 11;
									year -= 1;
								} else {
									month -= 1;
								}
							} else if (target.is('.new')) {
								if (month == 11) {
									month = 0;
									year += 1;
								} else {
									month += 1;
								}
							}
							this._setDate(UTCDate(year, month, day,0,0,0,0));
						}
						break;
				}
			}
		},

		_setDate: function(date, which){
			if (!which || which == 'date')
				this.date = new Date(date);
			if (!which || which  == 'view')
				this.viewDate = new Date(date);
			this.fill();
			this.setValue();
			this._trigger('changeDate');
			var element;
			if (this.isInput) {
				element = this.element;
			} else if (this.component){
				element = this.element.find('input');
			}
			if (element) {
				element.change();
			}
			if (this.o.autoclose && (!which || which == 'date')) {
				this.hide();
			}
		},

		moveMonth: function(date, dir){
			if (!dir) return date;
			var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
			dir = dir > 0 ? 1 : -1;
			if (mag == 1){
				test = dir == -1
					// If going back one month, make sure month is not current month
					// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function(){ return new_date.getUTCMonth() == month; }
					// If going forward one month, make sure month is as expected
					// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function(){ return new_date.getUTCMonth() != new_month; };
				new_month = month + dir;
				new_date.setUTCMonth(new_month);
				// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
				if (new_month < 0 || new_month > 11)
					new_month = (new_month + 12) % 12;
			} else {
				// For magnitudes >1, move one month at a time...
				for (var i=0; i<mag; i++)
					// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
					new_date = this.moveMonth(new_date, dir);
				// ...then reset the day, keeping it in the new month
				new_month = new_date.getUTCMonth();
				new_date.setUTCDate(day);
				test = function(){ return new_month != new_date.getUTCMonth(); };
			}
			// Common date-resetting loop -- if date is beyond end of month, make it
			// end of month
			while (test()){
				new_date.setUTCDate(--day);
				new_date.setUTCMonth(new_month);
			}
			return new_date;
		},

		moveYear: function(date, dir){
			return this.moveMonth(date, dir*12);
		},

		dateWithinRange: function(date){
			return date >= this.o.startDate && date <= this.o.endDate;
		},

		keydown: function(e){
			if (this.picker.is(':not(:visible)')){
				if (e.keyCode == 27) // allow escape to hide and re-show picker
					this.show();
				return;
			}
			var dateChanged = false,
				dir, day, month,
				newDate, newViewDate;
			switch(e.keyCode){
				case 27: // escape
					this.hide();
					e.preventDefault();
					break;
				case 37: // left
				case 39: // right
					if (!this.o.keyboardNavigation) break;
					dir = e.keyCode == 37 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.date, dir);
						newViewDate = this.moveYear(this.viewDate, dir);
						this._trigger('changeYear', this.viewDate);
					} else if (e.shiftKey){
						newDate = this.moveMonth(this.date, dir);
						newViewDate = this.moveMonth(this.viewDate, dir);
						this._trigger('changeMonth', this.viewDate);
					} else {
						newDate = new Date(this.date);
						newDate.setUTCDate(this.date.getUTCDate() + dir);
						newViewDate = new Date(this.viewDate);
						newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir);
					}
					if (this.dateWithinRange(newDate)){
						this.date = newDate;
						this.viewDate = newViewDate;
						this.setValue();
						this.update();
						e.preventDefault();
						dateChanged = true;
					}
					break;
				case 38: // up
				case 40: // down
					if (!this.o.keyboardNavigation) break;
					dir = e.keyCode == 38 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.date, dir);
						newViewDate = this.moveYear(this.viewDate, dir);
						this._trigger('changeYear', this.viewDate);
					} else if (e.shiftKey){
						newDate = this.moveMonth(this.date, dir);
						newViewDate = this.moveMonth(this.viewDate, dir);
						this._trigger('changeMonth', this.viewDate);
					} else {
						newDate = new Date(this.date);
						newDate.setUTCDate(this.date.getUTCDate() + dir * 7);
						newViewDate = new Date(this.viewDate);
						newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir * 7);
					}
					if (this.dateWithinRange(newDate)){
						this.date = newDate;
						this.viewDate = newViewDate;
						this.setValue();
						this.update();
						e.preventDefault();
						dateChanged = true;
					}
					break;
				case 13: // enter
					this.hide();
					e.preventDefault();
					break;
				case 9: // tab
					this.hide();
					break;
			}
			if (dateChanged){
				this._trigger('changeDate');
				var element;
				if (this.isInput) {
					element = this.element;
				} else if (this.component){
					element = this.element.find('input');
				}
				if (element) {
					element.change();
				}
			}
		},

		showMode: function(dir) {
			if (dir) {
				this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
			}
			/*
				vitalets: fixing bug of very special conditions:
				jquery 1.7.1 + webkit + show inline datepicker in bootstrap popover.
				Method show() does not set display css correctly and datepicker is not shown.
				Changed to .css('display', 'block') solve the problem.
				See https://github.com/vitalets/x-editable/issues/37

				In jquery 1.7.2+ everything works fine.
			*/
			//this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
			this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
			this.updateNavArrows();
		}
	};

	var DateRangePicker = function(element, options){
		this.element = $(element);
		this.inputs = $.map(options.inputs, function(i){ return i.jquery ? i[0] : i; });
		delete options.inputs;

		$(this.inputs)
			.datepicker(options)
			.bind('changeDate', $.proxy(this.dateUpdated, this));

		this.pickers = $.map(this.inputs, function(i){ return $(i).data('datepicker'); });
		this.updateDates();
	};
	DateRangePicker.prototype = {
		updateDates: function(){
			this.dates = $.map(this.pickers, function(i){ return i.date; });
			this.updateRanges();
		},
		updateRanges: function(){
			var range = $.map(this.dates, function(d){ return d.valueOf(); });
			$.each(this.pickers, function(i, p){
				p.setRange(range);
			});
		},
		dateUpdated: function(e){
			var dp = $(e.target).data('datepicker'),
				new_date = dp.getUTCDate(),
				i = $.inArray(e.target, this.inputs),
				l = this.inputs.length;
			if (i == -1) return;

			if (new_date < this.dates[i]){
				// Date being moved earlier/left
				while (i>=0 && new_date < this.dates[i]){
					this.pickers[i--].setUTCDate(new_date);
				}
			}
			else if (new_date > this.dates[i]){
				// Date being moved later/right
				while (i<l && new_date > this.dates[i]){
					this.pickers[i++].setUTCDate(new_date);
				}
			}
			this.updateDates();
		},
		remove: function(){
			$.map(this.pickers, function(p){ p.remove(); });
			delete this.element.data().datepicker;
		}
	};

	function opts_from_el(el, prefix){
		// Derive options from element data-attrs
		var data = $(el).data(),
			out = {}, inkey,
			replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])'),
			prefix = new RegExp('^' + prefix.toLowerCase());
		for (var key in data)
			if (prefix.test(key)){
				inkey = key.replace(replace, function(_,a){ return a.toLowerCase(); });
				out[inkey] = data[key];
			}
		return out;
	}

	function opts_from_locale(lang){
		// Derive options from locale plugins
		var out = {};
		// Check if "de-DE" style date is available, if not language should
		// fallback to 2 letter code eg "de"
		if (!dates[lang]) {
			lang = lang.split('-')[0]
			if (!dates[lang])
				return;
		}
		var d = dates[lang];
		$.each(locale_opts, function(i,k){
			if (k in d)
				out[k] = d[k];
		});
		return out;
	}

	var old = $.fn.datepicker;
	$.fn.datepicker = function ( option ) {
		var args = Array.apply(null, arguments);
		args.shift();
		var internal_return,
			this_return;
		this.each(function () {
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option == 'object' && option;
			if (!data) {
				var elopts = opts_from_el(this, 'date'),
					// Preliminary otions
					xopts = $.extend({}, defaults, elopts, options),
					locopts = opts_from_locale(xopts.language),
					// Options priority: js args, data-attrs, locales, defaults
					opts = $.extend({}, defaults, locopts, elopts, options);
				if ($this.is('.input-daterange') || opts.inputs){
					var ropts = {
						inputs: opts.inputs || $this.find('input').toArray()
					};
					$this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
				}
				else{
					$this.data('datepicker', (data = new Datepicker(this, opts)));
				}
			}
			if (typeof option == 'string' && typeof data[option] == 'function') {
				internal_return = data[option].apply(data, args);
				if (internal_return !== undefined)
					return false;
			}
		});
		if (internal_return !== undefined)
			return internal_return;
		else
			return this;
	};

	var defaults = $.fn.datepicker.defaults = {
		autoclose: false,
		beforeShowDay: $.noop,
		calendarWeeks: false,
		clearBtn: false,
		daysOfWeekDisabled: [],
		endDate: Infinity,
		forceParse: true,
		format: 'mm/dd/yyyy',
		keyboardNavigation: true,
		language: 'en',
		minViewMode: 0,
		orientation: "auto",
		rtl: false,
		startDate: -Infinity,
		startView: 0,
		todayBtn: false,
		todayHighlight: false,
		weekStart: 0
	};
	var locale_opts = $.fn.datepicker.locale_opts = [
		'format',
		'rtl',
		'weekStart'
	];
	$.fn.datepicker.Constructor = Datepicker;
	var dates = $.fn.datepicker.dates = {
		en: {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			today: "Today",
			clear: "Clear"
		}
	};

	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		isLeapYear: function (year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
		},
		getDaysInMonth: function (year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
		},
		validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
		nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
		parseFormat: function(format){
			// IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length === 0){
				throw new Error("Invalid date format.");
			}
			return {separators: separators, parts: parts};
		},
		parseDate: function(date, format, language) {
			if (date instanceof Date) return date;
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
				var part_re = /([\-+]\d+)([dmwy])/,
					parts = date.match(/([\-+]\d+)([dmwy])/g),
					part, dir;
				date = new Date();
				for (var i=0; i<parts.length; i++) {
					part = part_re.exec(parts[i]);
					dir = parseInt(part[1]);
					switch(part[2]){
						case 'd':
							date.setUTCDate(date.getUTCDate() + dir);
							break;
						case 'm':
							date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
							break;
						case 'w':
							date.setUTCDate(date.getUTCDate() + dir * 7);
							break;
						case 'y':
							date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
							break;
					}
				}
				return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
			}
			var parts = date && date.match(this.nonpunctuation) || [],
				date = new Date(),
				parsed = {},
				setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
				setters_map = {
					yyyy: function(d,v){ return d.setUTCFullYear(v); },
					yy: function(d,v){ return d.setUTCFullYear(2000+v); },
					m: function(d,v){
						if (isNaN(d))
							return d;
						v -= 1;
						while (v<0) v += 12;
						v %= 12;
						d.setUTCMonth(v);
						while (d.getUTCMonth() != v)
							d.setUTCDate(d.getUTCDate()-1);
						return d;
					},
					d: function(d,v){ return d.setUTCDate(v); }
				},
				val, filtered, part;
			setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
			setters_map['dd'] = setters_map['d'];
			date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
			var fparts = format.parts.slice();
			// Remove noop parts
			if (parts.length != fparts.length) {
				fparts = $(fparts).filter(function(i,p){
					return $.inArray(p, setters_order) !== -1;
				}).toArray();
			}
			// Process remainder
			if (parts.length == fparts.length) {
				for (var i=0, cnt = fparts.length; i < cnt; i++) {
					val = parseInt(parts[i], 10);
					part = fparts[i];
					if (isNaN(val)) {
						switch(part) {
							case 'MM':
								filtered = $(dates[language].months).filter(function(){
									var m = this.slice(0, parts[i].length),
										p = parts[i].slice(0, m.length);
									return m == p;
								});
								val = $.inArray(filtered[0], dates[language].months) + 1;
								break;
							case 'M':
								filtered = $(dates[language].monthsShort).filter(function(){
									var m = this.slice(0, parts[i].length),
										p = parts[i].slice(0, m.length);
									return m == p;
								});
								val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
								break;
						}
					}
					parsed[part] = val;
				}
				for (var i=0, _date, s; i<setters_order.length; i++){
					s = setters_order[i];
					if (s in parsed && !isNaN(parsed[s])){
						_date = new Date(date);
						setters_map[s](_date, parsed[s]);
						if (!isNaN(_date))
							date = _date;
					}
				}
			}
			return date;
		},
		formatDate: function(date, format, language){
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var val = {
				d: date.getUTCDate(),
				D: dates[language].daysShort[date.getUTCDay()],
				DD: dates[language].days[date.getUTCDay()],
				m: date.getUTCMonth() + 1,
				M: dates[language].monthsShort[date.getUTCMonth()],
				MM: dates[language].months[date.getUTCMonth()],
				yy: date.getUTCFullYear().toString().substring(2),
				yyyy: date.getUTCFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			var date = [],
				seps = $.extend([], format.separators);
			for (var i=0, cnt = format.parts.length; i <= cnt; i++) {
				if (seps.length)
					date.push(seps.shift());
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		headTemplate: '<thead>'+
							'<tr>'+
								'<th class="prev">&laquo;</th>'+
								'<th colspan="5" class="datepicker-switch"></th>'+
								'<th class="next">&raquo;</th>'+
							'</tr>'+
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr><tr><th colspan="7" class="clear"></th></tr></tfoot>'
	};
	DPGlobal.template = '<div class="datepicker">'+
							'<div class="datepicker-days">'+
								'<table class=" table-condensed">'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-months">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-years">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
						'</div>';

	$.fn.datepicker.DPGlobal = DPGlobal;


	/* DATEPICKER NO CONFLICT
	* =================== */

	$.fn.datepicker.noConflict = function(){
		$.fn.datepicker = old;
		return this;
	};


	/* DATEPICKER DATA-API
	* ================== */

	$(document).on(
		'focus.datepicker.data-api click.datepicker.data-api',
		'[data-provide="datepicker"]',
		function(e){
			var $this = $(this);
			if ($this.data('datepicker')) return;
			e.preventDefault();
			// component click requires us to explicitly show it
			$this.datepicker('show');
		}
	);
	$(function(){
		$('[data-provide="datepicker-inline"]').datepicker();
	});

}( window.jQuery ));