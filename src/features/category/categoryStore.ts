import { create } from 'zustand';
import type { Category } from '@types/index';
import { commandBus } from '@/core/commands/CommandBus';
import type { AssignCategoryCommand } from '@/core/commands';

interface CategoryState {
  categories: Category[];
  loadCategories: (workspaceId: string) => Promise<void>;
  addCategory: (workspaceId: string, name: string, color?: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  assignCategory: (resourceId: string, categoryId: string | null) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loadCategories: async (workspaceId) => {
    const { getCategories } = await import('./repository');
    const items = await getCategories(workspaceId);
    set({ categories: items });
  },
  addCategory: async (workspaceId, name, color) => {
    const { createCategory } = await import('./repository');
    await createCategory(workspaceId, name, color);
    // Refresh list.
    const { getCategories } = await import('./repository');
    const items = await getCategories(workspaceId);
    set({ categories: items });
  },
  removeCategory: async (id) => {
    const { deleteCategory } = await import('./repository');
    await deleteCategory(id);
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },
  assignCategory: async (resourceId, categoryId) => {
    const result = await commandBus.dispatch(
      new AssignCategoryCommand({ resourceId, categoryId })
    );
    if (!result.success) throw new Error(result.error || 'Failed to assign category');
    // Category list not affected, but listener could refresh resources.
  },
}));
