export class Workspace {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string = '',
    public readonly color: string = '#888888',
    public readonly archived: boolean = false,
    public readonly createdAt: number = Date.now(),
    public readonly updatedAt: number = Date.now(),
  ) {}

  with(partial: Partial<Workspace>): Workspace {
    return new Workspace(
      partial.id ?? this.id,
      partial.name ?? this.name,
      partial.description ?? this.description,
      partial.color ?? this.color,
      partial.archived ?? this.archived,
      partial.createdAt ?? this.createdAt,
      partial.updatedAt ?? this.updatedAt,
    );
  }
}
