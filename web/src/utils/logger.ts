type LogLevel = "info" | "success" | "warn" | "error" | "debug";

const levelStyles: Record<LogLevel, string> = {
  info: "color: dodgerblue; font-weight: bold",
  success: "color: mediumseagreen; font-weight: bold",
  warn: "color: orange; font-weight: bold",
  error: "color: crimson; font-weight: bold",
  debug: "color: gray; font-weight: bold"
};

function log(scope: string, level: LogLevel, ...args: unknown[]) {
  const style = levelStyles[level];
  const prefix = `%c[${scope}] - ${level.toUpperCase()}`;
  console.log(prefix, style, ...args);
}

export function createLogger(scope: string) {
  return {
    info: (...args: unknown[]) => log(scope, "info", ...args),
    success: (...args: unknown[]) => log(scope, "success", ...args),
    warn: (...args: unknown[]) => log(scope, "warn", ...args),
    error: (...args: unknown[]) => log(scope, "error", ...args),
    debug: (...args: unknown[]) => log(scope, "debug", ...args)
  };
}
