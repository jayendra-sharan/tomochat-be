import * as Sentry from "@sentry/node";

type LogLevel = "info" | "warn" | "error" | "debug";
const isProd = process.env.NODE_ENV === "production";

function format(level: LogLevel, message: string, context?: any) {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` | ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`;
}

export const logger = {
  info: (msg: string, ctx?: Record<string, any>) => {
    console.log(format("info", msg, ctx));

    if (isProd) {
      Sentry.captureMessage(msg, {
        level: "info",
        extra: ctx,
        tags: { kind: "handled" },
      });
    }
  },

  warn: (msg: string, ctx?: Record<string, any>) => {
    console.warn(format("warn", msg, ctx));

    if (isProd) {
      Sentry.captureMessage(msg, {
        level: "warning",
        extra: ctx,
        tags: { kind: "handled" },
      });
    }
  },

  error: (err: unknown, ctx?: Record<string, any>) => {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Unknown error";

    console.error(format("error", message, ctx));

    if (isProd) {
      // Report with proper classification
      if (err instanceof Error) {
        Sentry.captureException(err, { extra: ctx });
      } else {
        Sentry.captureMessage(String(err), {
          level: "error",
          extra: ctx,
          tags: { kind: "unstructured" },
        });
      }
    }
  },

  debug: (msg: string, ctx?: Record<string, any>) => {
    if (!isProd) {
      console.debug(format("debug", msg, ctx));
    }
    // No Sentry logging for debug
  },
};
