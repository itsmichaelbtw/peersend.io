/**
 * A noop is a function that does nothing.
 */
export function noop(): void {}

/**
 * A fatal noop is a function that should never be called.
 */
export function fatalNoop(): void {
	throw new Error("Fatal noop called");
}
