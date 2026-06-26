export class Category {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly color: string = '#888888',
    public readonly createdAt: number = Date.now(),
    public readonly updatedAt: number = Date.now(),
  ) {}

  with(partial: Partial<Category>): Category {
    return new Category(
      partial.id ?? this.id,
      partial.workspaceId ?? this.workspaceId,
      partial.name ?? this.name,
      partial.color ?? this.color,
      partial.createdAt ?? this.createdAt,
      partial.updatedAt ?? this.updatedAt,
    );
  }
}
