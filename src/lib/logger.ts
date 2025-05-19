type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function format(level: LogLevel, message: string, context?: any) {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`;
}

export const logger = {
  info: (msg: string, ctx?: any) => console.log(format('info', msg, ctx)),
  warn: (msg: string, ctx?: any) => console.warn(format('warn', msg, ctx)),
  error: (msg: string, ctx?: any) => console.error(format('error', msg, ctx)),
  debug: (msg: string, ctx?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(format('debug', msg, ctx));
    }
  },
};
