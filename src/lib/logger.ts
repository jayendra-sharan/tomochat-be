import * as Sentry from "@sentry/node";

type LogLevel = "info" | "warn" | "error" | "debug";

const isProd = process.env.NODE_ENV === "production";

function format(level: LogLevel, message: string, context?: any) {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` | ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`;
}

export const logger = {
  info: (msg: string, ctx?: any) => {
    console.log(format("info", msg, ctx));
  },

  warn: (msg: string, ctx?: any) => {
    console.warn(format("warn", msg, ctx));
    if (isProd) Sentry.captureMessage(msg, { level: "warning", extra: ctx });
  },

  error: (err: unknown, ctx?: any) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(format("error", message, ctx));
    if (isProd) {
      if (err instanceof Error) {
        Sentry.captureException(err, { extra: ctx });
      } else {
        Sentry.captureMessage(message, { level: "error", extra: ctx });
      }
    }
  },

  debug: (msg: string, ctx?: any) => {
    console.debug(format("debug", msg, ctx));
  },
};
