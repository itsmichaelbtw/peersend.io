type LogLevel = "info" | "success" | "warn" | "error" | "debug";

interface LoggerLevels {
	info(...args: unknown[]): void;
	success(...args: unknown[]): void;
	warn(...args: unknown[]): void;
	error(...args: unknown[]): void;
	debug(...args: unknown[]): void;
}

const levelStyles: Record<LogLevel, string> = {
	info: "color: dodgerblue; font-weight: bold",
	success: "color: mediumseagreen; font-weight: bold",
	warn: "color: orange; font-weight: bold",
	error: "color: crimson; font-weight: bold",
	debug: "color: gray; font-weight: bold"
};

function getLoggerFn(level: LogLevel): (...args: unknown[]) => void {
	switch (level) {
		case "info":
			// eslint-disable-next-line no-console
			return console.info;
		case "success":
			// eslint-disable-next-line no-console
			return console.log;
		case "warn":
			// eslint-disable-next-line no-console
			return console.warn;
		case "error":
			// eslint-disable-next-line no-console
			return console.error;
		case "debug":
			// eslint-disable-next-line no-console
			return console.debug;
		default:
			// eslint-disable-next-line no-console
			return console.log;
	}
}

function log(scope: string, level: LogLevel, ...args: unknown[]): void {
	const style = levelStyles[level];
	const prefix = `%c[${scope}] - ${level.toUpperCase()}`;

	getLoggerFn(level)(prefix, style, ...args);
}

export function createLogger(scope: string): LoggerLevels {
	return {
		info: (...args: unknown[]) => log(scope, "info", ...args),
		success: (...args: unknown[]) => log(scope, "success", ...args),
		warn: (...args: unknown[]) => log(scope, "warn", ...args),
		error: (...args: unknown[]) => log(scope, "error", ...args),
		debug: (...args: unknown[]) => log(scope, "debug", ...args)
	};
}
