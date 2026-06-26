export class Resource {
  constructor(
    public readonly resourceId: string,
    public readonly url: string,
    public readonly title: string,
    public readonly favicon?: string,
    public readonly workspaceId?: string,
    public readonly categoryId?: string,
    public readonly tags: string[] = [],
    public readonly duplicateOf?: string,
    public readonly lastAccessedAt: number = Date.now(),
    public readonly createdAt: number = Date.now(),
    public readonly updatedAt: number = Date.now(),
  ) {}

  with(partial: Partial<Resource>): Resource {
    return new Resource(
      partial.resourceId ?? this.resourceId,
      partial.url ?? this.url,
      partial.title ?? this.title,
      partial.favicon ?? this.favicon,
      partial.workspaceId ?? this.workspaceId,
      partial.categoryId ?? this.categoryId,
      partial.tags ?? this.tags,
      partial.duplicateOf ?? this.duplicateOf,
      partial.lastAccessedAt ?? this.lastAccessedAt,
      partial.createdAt ?? this.createdAt,
      partial.updatedAt ?? this.updatedAt,
    );
  }
}
