const toString = Object.prototype.toString;

/**
 *
 * @param value Any value
 * @returns The string representation of the value
 */
export function asStringPrototype(value: any): string {
  return toString.call(value);
}

/**
 *
 * @param value Any value
 * @returns If the value is an array
 */
export function isArray<T = any>(value: any): value is T[] {
  return toString.call(value) === "[object Array]";
}

/**
 *
 * @param value Any value
 * @returns If the value is a pure object
 */
export function isObject(value: any): value is object {
  return toString.call(value) === "[object Object]";
}
