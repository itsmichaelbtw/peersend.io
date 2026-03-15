/**
 * No-op logger mock for unit tests.
 *
 * Replaces @/utils/logger via the tsconfig path alias so that classes like
 * ProgressThrottler and FileStorage can be imported in the Playwright Node
 * runner without pulling in @/config/constants (which uses import.meta.env).
 */

const noop = (..._args: unknown[]): void => {};

export function createLogger(_scope: string): {
	info: (...args: unknown[]) => void;
	success: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	debug: (...args: unknown[]) => void;
} {
	return { info: noop, success: noop, warn: noop, error: noop, debug: noop };
}
