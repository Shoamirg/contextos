import { db } from '@storage/database';
import type { Category, Workspace } from '@types/index';

export async function createCategory(
  workspaceId: string,
  name: string,
  color?: string
): Promise<Category> {
  const category: Category = {
    id: crypto.randomUUID(),
    workspaceId,
    name,
    order: Date.now(),
    color,
  };
  await db.categories.add(category);
  // Update workspace timestamp
  await db.workspaces.update(workspaceId, { updatedAt: Date.now() });
  return category;
}

export async function updateCategory(
  id: string,
  patch: Partial<Category>
): Promise<void> {
  await db.categories.update(id, patch);
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await db.categories.get(id);
  if (!category) return;
  await db.resources.where('categoryId').equals(id).modify({ categoryId: null, updatedAt: Date.now() });
  await db.categories.delete(id);
  await db.workspaces.update(category.workspaceId, { updatedAt: Date.now() });
}

export async function getCategories(workspaceId: string): Promise<Category[]> {
  return db.categories.where('workspaceId').equals(workspaceId).sortBy('order');
}

export async function moveResourceToCategory(
  resourceId: string,
  categoryId: string | null
): Promise<void> {
  await db.resources.update(resourceId, {
    categoryId,
    updatedAt: Date.now(),
  });
}
