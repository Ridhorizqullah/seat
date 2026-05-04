type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    return {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data })
    }
  }

  info(message: string, data?: any) {
    console.log(JSON.stringify(this.formatMessage('info', message, data)))
  }

  warn(message: string, data?: any) {
    console.warn(JSON.stringify(this.formatMessage('warn', message, data)))
  }

  error(message: string, error?: any) {
    // If error is an instance of Error, extract its message and stack
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error

    console.error(JSON.stringify(this.formatMessage('error', message, errorData)))
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(JSON.stringify(this.formatMessage('debug', message, data)))
    }
  }
}

export const logger = new Logger()
