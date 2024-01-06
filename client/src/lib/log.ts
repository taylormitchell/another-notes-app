type LogFunction = typeof console.log;

function createLogger() {
  function getNamespacedLogger(namespace: string): {
    info: LogFunction;
    warn: LogFunction;
    error: LogFunction;
  } {
    return {
      info: (msg, ...params) => console.log(`[${namespace}]:`, msg, ...params),
      warn: (msg, ...params) => console.warn(`[${namespace}]:`, msg, ...params),
      error: (msg, ...params) => console.error(`[${namespace}]:`, msg, ...params),
    };
  }

  const baseLoggers: { info: LogFunction; warn: LogFunction; error: LogFunction } = {
    info: (msg, ...params) => console.log(msg, ...params),
    warn: (msg, ...params) => console.warn(msg, ...params),
    error: (msg, ...params) => console.error(msg, ...params),
  };

  const logger = (namespace: string) => getNamespacedLogger(namespace);
  logger.info = baseLoggers.info;
  logger.warn = baseLoggers.warn;
  logger.error = baseLoggers.error;

  return logger;
}

export const log = createLogger();
