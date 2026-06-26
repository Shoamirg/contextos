export interface Command<TResult = void> {
  readonly type: string;
  readonly payload: Record<string, unknown>;
}

export interface CommandResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface CommandHandler<TCommand extends Command = Command> {
  handle(command: TCommand): Promise<CommandResult>;
}

export interface CommandMiddleware {
  execute<T extends Command>(
    command: T,
    next: (command: T) => Promise<CommandResult>
  ): Promise<CommandResult>;
}
