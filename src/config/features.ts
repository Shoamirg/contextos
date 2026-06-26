/**
 * Architecture-level and runtime feature flags.
 * Use this to safely gate V1 vs V2 capabilities.
 */

export const FEATURES = {
  analytics: true,
  staleDetection: true,
  exportImport: true,
  backup: true,
  healthMonitoring: true,
  sessionEngine: true,

  ai: false,
  embeddings: false,
  knowledgeGraph: false,
  reactFlowGraph: false,
  semanticSearch: false,
  integrations: false, // GitHub, Notion, Jira, VS Code collectors
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature] === true;
}
