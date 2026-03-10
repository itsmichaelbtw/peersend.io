/**
 * No-op logger mock for unit tests.
 *
 * Replaces @/utils/logger via the tsconfig path alias so that classes like
 * ProgressThrottler and FileStorage can be imported in the Playwright Node
 * runner without pulling in @/config/constants (which uses import.meta.env).
 */

const noop = (): void => {};

export function createLogger(_scope: string) {
  return { info: noop, success: noop, warn: noop, error: noop, debug: noop };
}
