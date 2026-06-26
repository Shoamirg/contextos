import type { Command, CommandResult, CommandHandler, CommandMiddleware } from './Command';

export class CommandBus {
  private handlers = new Map<string, CommandHandler>();
  private middleware: CommandMiddleware[] = [];

  register<T extends Command>(type: string, handler: CommandHandler<T>) {
    this.handlers.set(type, handler as CommandHandler);
  }

  use(middleware: CommandMiddleware) {
    this.middleware.push(middleware);
  }

  async dispatch<T extends Command>(command: T): Promise<CommandResult> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      return { success: false, error: `No handler registered for command: ${command.type}` };
    }

    // Build middleware pipeline.
    const pipeline = this.middleware.reduceRight<
      (cmd: T) => Promise<CommandResult>
    >(
      (next, mw) => (cmd) => mw.execute(cmd, next),
      (cmd) => (handler as CommandHandler<T>).handle(cmd)
    );

    return pipeline(command);
  }

  clear() {
    this.handlers.clear();
    this.middleware = [];
  }
}

export const commandBus = new CommandBus();
