import type { Command, CommandResult } from '../Command';
import { logger } from '../../features/observability/logger';

export const LoggingMiddleware = {
  async execute<T extends Command>(
    command: T,
    next: (command: T) => Promise<CommandResult>
  ): Promise<CommandResult> {
    const start = Date.now();
    logger.debug('commands', `Dispatching ${command.type}`, { payload: command.payload });

    try {
      const result = await next(command);
      const durationMs = Date.now() - start;
      if (result.success) {
        logger.info('commands', `${command.type} completed in ${durationMs}ms`);
      } else {
        logger.warn('commands', `${command.type} failed in ${durationMs}ms`, { error: result.error });
      }
      return result;
    } catch (error) {
      logger.error('commands', error, `${command.type} threw`);
      return { success: false, error: (error as Error).message };
    }
  },
};
