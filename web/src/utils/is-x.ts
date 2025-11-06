const toString = Object.prototype.toString.bind(Object.prototype);

/**
 *
 * @param value Any value
 * @returns The string representation of the value
 */
export function asStringPrototype(value: unknown): string {
	return toString.call(value);
}

/**
 *
 * @param value Any value
 * @returns If the value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
	return toString.call(value) === "[object Array]";
}

/**
 *
 * @param value Any value
 * @returns If the value is a pure object
 */
export function isObject(value: unknown): value is object {
	return toString.call(value) === "[object Object]";
}
