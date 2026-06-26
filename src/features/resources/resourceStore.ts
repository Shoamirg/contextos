import { create } from 'zustand';
import type { Resource, Workspace, Category } from '@types/index';

interface ResourceState {
  resources: Resource[];
  selectedWorkspace: Workspace | null;
  selectedCategory: Category | null;
  searchQuery: string;
  selectedResource: Resource | null;
  setResources: (items: Resource[]) => void;
  setSelectedWorkspace: (ws: Workspace | null) => void;
  setSelectedCategory: (cat: Category | null) => void;
  setSearchQuery: (q: string) => void;
  setSelectedResource: (item: Resource | null) => void;
}

export const useResourceStore = create<ResourceState>((set) => ({
  resources: [],
  selectedWorkspace: null,
  selectedCategory: null,
  searchQuery: '',
  selectedResource: null,
  setResources: (items) => set({ resources: items }),
  setSelectedWorkspace: (ws) => set({ selectedWorkspace: ws }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedResource: (item) => set({ selectedResource: item }),
}));
