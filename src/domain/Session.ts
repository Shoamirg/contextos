export class Session {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly resourceIds: string[] = [],
    public readonly name: string = 'Session',
    public readonly createdAt: number = Date.now(),
    public readonly updatedAt: number = Date.now(),
  ) {}

  with(partial: Partial<Session>): Session {
    return new Session(
      partial.id ?? this.id,
      partial.workspaceId ?? this.workspaceId,
      partial.resourceIds ?? this.resourceIds,
      partial.name ?? this.name,
      partial.createdAt ?? this.createdAt,
      partial.updatedAt ?? this.updatedAt,
    );
  }
}
