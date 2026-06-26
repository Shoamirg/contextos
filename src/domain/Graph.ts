export class GraphNode {
  constructor(
    public readonly id: string,
    public readonly type: 'resource' | 'workspace' | 'category' | 'session',
    public readonly label: string,
    public readonly properties: Record<string, unknown> = {},
  ) {}
}

export class GraphEdge {
  constructor(
    public readonly id: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly relation: string,
    public readonly weight: number = 1,
  ) {}
}

export class Graph {
  constructor(
    public readonly nodes: GraphNode[] = [],
    public readonly edges: GraphEdge[] = [],
  ) {}

  addNode(node: GraphNode): Graph {
    return new Graph([...this.nodes, node], this.edges);
  }

  addEdge(edge: GraphEdge): Graph {
    return new Graph(this.nodes, [...this.edges, edge]);
  }
}
