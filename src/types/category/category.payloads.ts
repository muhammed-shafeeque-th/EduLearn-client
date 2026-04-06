export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order?: number;
}
