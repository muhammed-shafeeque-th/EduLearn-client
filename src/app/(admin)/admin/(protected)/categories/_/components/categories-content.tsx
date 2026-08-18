'use client';

import { useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  FolderOpen,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';

import { getCategoryIcon } from '@/lib/icons/category-icons';
import { Category } from '@/types/category';
import { cn, getErrorMessage } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryStatus,
  useRestoreCategory,
} from '@/states/server/category';

/* Types                                                                      */

type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  parentId: string | null;
};

type CategoryModal =
  | {
      type: 'create';
      parentId: string | null;
    }
  | {
      type: 'edit';
      category: Category;
    }
  | {
      type: 'delete';
      category: Category;
    }
  | null;

/* Constants                                                                  */

const CATEGORY_ICONS = [
  // Web Development
  'Code',
  'FileCode',
  'Terminal',
  'Globe',
  'Layout',
  'Braces',
  'Workflow',
  'GitBranch',
  'Server',
  'Layers',
  'Boxes',
  'Component',

  // Mobile Development
  'Smartphone',
  'Tablet',
  'AppWindow',
  'MonitorSmartphone',
  'Devices',
  'BatteryCharging',
  'Touchpad',
  'Wifi',
  'Bluetooth',

  // AI
  'Brain',
  'Bot',
  'Cpu',
  'Network',
  'Sparkles',
  'Binary',
  'CircuitBoard',
  'Activity',
  'Database',
  'ChartScatter',

  // Data Science
  'BarChart',
  'PieChart',
  'LineChart',
  'ChartColumn',
  'ChartBar',
  'Table',
  'Calculator',
  'TrendingUp',

  // Cloud
  'Cloud',
  'Container',
  'Settings',
  'ShieldCheck',
  'Lock',
  'HardDrive',

  // Cyber Security
  'Shield',
  'Key',
  'Fingerprint',
  'EyeOff',
  'Bug',
  'AlertTriangle',

  // Business
  'Briefcase',
  'Building',
  'Target',
  'Wallet',
  'Handshake',
  'Presentation',
  'BarChart3',

  // Personal Development
  'User',
  'Heart',
  'Star',
  'Award',
  'Smile',
  'Sun',
  'BookOpen',

  // Design / UI / UX
  'Palette',
  'PenTool',
  'Figma',
  'Image',
  'Paintbrush',
  'Shapes',
  'Frame',
] as const;

/**
 * Ensures SelectItem never receives duplicate keys/values.
 */
const UNIQUE_CATEGORY_ICONS = [...new Set(CATEGORY_ICONS)];

/* Helpers                                                                    */

function createDefaultForm(parentId: string | null = null): CategoryFormData {
  return {
    name: '',
    slug: '',
    description: '',
    icon: 'FolderOpen',
    color: '#3B82F6',
    parentId,
  };
}

/* Component                                                                  */

export function CategoriesContent() {
  /* Server state                                                             */

  const {
    categories = [],
    isLoading,
    isError,
    refetch: refetchCategories,
  } = useAdminCategories(true);

  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();

  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleCategoryStatus();

  const { mutateAsync: restoreCategory, isPending: isRestoring } = useRestoreCategory();

  /* UI state                                                                 */

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  /**
   * One modal state instead of:
   *
   * showCreateDialog
   * showEditDialog
   * showDeleteDialog
   *
   * This guarantees only one modal can exist at a time.
   */
  const [modal, setModal] = useState<CategoryModal>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState<CategoryFormData>(createDefaultForm());

  /* Derived state                                                            */

  const isAnyMutationPending = isCreating || isUpdating || isDeleting || isToggling || isRestoring;

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch = !query || category.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && category.isActive) ||
        (statusFilter === 'inactive' && !category.isActive);

      /**
       * Keep deleted categories hidden because your original component
       * currently has showDeleted permanently set to false.
       */
      const matchesDeleted = !category.deletedAt;

      return matchesSearch && matchesStatus && matchesDeleted;
    });
  }, [categories, searchQuery, statusFilter]);

  /* Form helpers                                                             */

  const resetForm = (parentId: string | null = null) => {
    setFormData(createDefaultForm(parentId));
  };

  const closeModal = () => {
    /**
     * Do not close while a mutation is running.
     *
     * This prevents:
     *
     * mutation -> close -> query invalidation -> rerender
     *
     * from racing with Dialog/AlertDialog lifecycle.
     */
    if (isAnyMutationPending) {
      return;
    }

    setModal(null);
    resetForm();
  };

  /* Category expansion                                                       */

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((previous) => {
      const next = new Set(previous);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };

  /* Modal open helpers                                                       */

  const openCreateDialog = (parentId: string | null = null) => {
    if (isAnyMutationPending) {
      return;
    }

    resetForm(parentId);

    setModal({
      type: 'create',
      parentId,
    });
  };

  const openEditDialog = (category: Category) => {
    if (isAnyMutationPending) {
      return;
    }

    setSelectedCategoryForEdit(category);

    setFormData({
      name: category.name ?? '',
      slug: category.slug ?? '',
      description: category.description ?? '',
      icon: category.icon || 'FolderOpen',
      color: category.color || '#3B82F6',
      parentId: category.parentId ?? null,
    });

    setModal({
      type: 'edit',
      category,
    });
  };

  const openDeleteDialog = (category: Category) => {
    if (isAnyMutationPending) {
      return;
    }

    setModal({
      type: 'delete',
      category,
    });
  };

  /**
   * Keeping the selected edit category in the modal itself means we don't
   * actually need a separate selectedCategory state.
   *
   * This helper exists only to make the transition explicit and safe.
   */
  const setSelectedCategoryForEdit = (_category: Category) => {
    // Intentionally empty.
    //
    // The selected category is stored in:
    //
    // modal = { type: 'edit', category }
    //
    // This avoids duplicated state.
  };

  /* CREATE                                                                   */

  const handleCreateCategory = async () => {
    if (isCreating) {
      return;
    }

    const name = formData.name.trim();

    if (!name) {
      toast.error({
        title: 'Category name is required',
      });

      return;
    }

    try {
      await createCategory({
        name,
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim() || undefined,
        icon: formData.icon,
        color: formData.color,
        parentId: formData.parentId || undefined,
      });

      toast.success({
        title: 'Category created successfully',
      });

      /**
       * Only close after successful mutation.
       */
      setModal(null);
      resetForm();
    } catch (error) {
      toast.error({
        title: 'Failed to create category',
        description: getErrorMessage(error),
      });
    }
  };

  /* UPDATE                                                                   */

  const handleUpdateCategory = async () => {
    if (isUpdating) {
      return;
    }

    if (modal?.type !== 'edit') {
      return;
    }

    const category = modal.category;

    const name = formData.name.trim();

    if (!name) {
      toast.error({
        title: 'Category name is required',
      });

      return;
    }

    try {
      await updateCategory({
        id: category.id,
        data: {
          name,
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          icon: formData.icon,
          color: formData.color,
        },
      });

      toast.success({
        title: 'Category updated successfully',
      });

      setModal(null);
      resetForm();
    } catch (error) {
      toast.error({
        title: 'Failed to update category',
        description: getErrorMessage(error),
      });
    }
  };

  /* DELETE                                                                   */

  const handleSoftDelete = async () => {
    if (isDeleting) {
      return;
    }

    if (modal?.type !== 'delete') {
      return;
    }

    const category = modal.category;

    try {
      await deleteCategory(category.id);

      toast.success({
        title: 'Category deleted successfully',
      });

      setModal(null);
      resetForm();
    } catch (error) {
      toast.error({
        title: 'Failed to delete category',
        description: getErrorMessage(error),
      });
    }
  };

  /* RESTORE                                                                  */

  const handleRestore = async (category: Category) => {
    if (isRestoring) {
      return;
    }

    try {
      await restoreCategory(category.id);

      toast.success({
        title: 'Category restored successfully',
      });
    } catch (error) {
      toast.error({
        title: 'Failed to restore category',
        description: getErrorMessage(error),
      });
    }
  };

  /* TOGGLE STATUS                                                            */

  const handleToggleStatus = async (category: Category) => {
    if (isToggling) {
      return;
    }

    try {
      await toggleStatus(category.id);

      toast.success({
        title: `Category ${category.isActive ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error) {
      toast.error({
        title: 'Failed to update category status',
        description: getErrorMessage(error),
      });
    }
  };

  /* Recursive category renderer                                              */

  const renderCategory = (category: Category, level = 0): React.ReactNode => {
    const hasSubcategories =
      Array.isArray(category.subcategories) && category.subcategories.length > 0;

    const isExpanded = expandedCategories.has(category.id);

    const isDeleted = Boolean(category.deletedAt);

    const Icon = getCategoryIcon(category.icon || 'FolderOpen');

    return (
      <div key={category.id} className={cn('mb-2', level > 0 && 'ml-8')}>
        {/* Category row */}
        <div
          className={cn(
            'flex items-center justify-between gap-4 p-4 border rounded-lg',
            'hover:shadow-sm transition-shadow',
            isDeleted && 'opacity-50 bg-muted'
          )}
        >
          {/* Left side */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {hasSubcategories ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => toggleCategory(category.id)}
                aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-9 shrink-0" />
            )}

            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: category.color || '#3B82F6',
              }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium truncate">{category.name}</h4>

                <Badge variant={category.isActive ? 'default' : 'secondary'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>

                {level > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Subcategory
                  </Badge>
                )}

                {isDeleted && (
                  <Badge variant="destructive" className="text-xs">
                    Deleted
                  </Badge>
                )}
              </div>

              {category.description && (
                <p className="text-sm text-muted-foreground truncate">{category.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span>{category.courseCount} courses</span>

                <span>•</span>

                <span>Updated {new Date(category.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isDeleted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isAnyMutationPending}
                    aria-label={`Actions for ${category.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  onCloseAutoFocus={(event) => {
                    /**
                     * When a dialog is opened from a menu, Dialog should
                     * control focus instead of the menu trying to restore
                     * focus to its trigger.
                     *
                     * This prevents DropdownMenu/Dialog focus fighting.
                     */
                    if (modal !== null) {
                      event.preventDefault();
                    }
                  }}
                >
                  {/* EDIT */}
                  <DropdownMenuItem onSelect={() => openEditDialog(category)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Category
                  </DropdownMenuItem>

                  {/* TOGGLE */}
                  <DropdownMenuItem
                    disabled={isToggling}
                    onSelect={() => handleToggleStatus(category)}
                  >
                    {category.isActive ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>

                  {/* ADD SUBCATEGORY */}
                  {!category.parentId && level === 0 && (
                    <DropdownMenuItem onSelect={() => openCreateDialog(category.id)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subcategory
                    </DropdownMenuItem>
                  )}

                  {/* DELETE */}
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onSelect={() => openDeleteDialog(category)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRestore(category)}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                Restore
              </Button>
            )}
          </div>
        </div>

        {/* Subcategories */}
        {isExpanded && hasSubcategories && (
          <div className="mt-2">
            {category.subcategories!.map((subCategory) => renderCategory(subCategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  /* Loading                                                                   */

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  /* Error                                                                     */

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">Failed to load categories.</div>

          <Button type="button" variant="outline" onClick={() => refetchCategories()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* Main UI                                                                   */

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>All Categories</CardTitle>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Status */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as 'all' | 'active' | 'inactive');
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>

                  <SelectItem value="active">Active</SelectItem>

                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

                <h3 className="text-lg font-semibold mb-2">No categories found</h3>

                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Get started by creating your first category'}
                </p>

                <Button type="button" onClick={() => openCreateDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              </div>
            ) : (
              <>
                {filteredCategories.map((category) => renderCategory(category))}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={() => openCreateDialog()}
                    disabled={isAnyMutationPending}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      {/* CREATE DIALOG                                                     */}
      <Dialog
        open={modal?.type === 'create'}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>

            <DialogDescription>
              Add a new category or subcategory to organize your courses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label className="mb-2" htmlFor="create-name">
                Category Name *
              </Label>

              <Input
                id="create-name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g., Web Development"
                disabled={isCreating}
              />
            </div>

            {/* Slug */}
            <div>
              <Label className="mb-2" htmlFor="create-slug">
                Slug
              </Label>

              <Input
                id="create-slug"
                value={formData.slug}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    slug: event.target.value,
                  }))
                }
                placeholder="web-development"
                disabled={isCreating}
              />
            </div>

            {/* Description */}
            <div>
              <Label className="mb-2" htmlFor="create-description">
                Description
              </Label>

              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Brief description of the category"
                rows={3}
                disabled={isCreating}
              />
            </div>

            {/* Icon / Color */}
            <div className="grid grid-cols-2 gap-4">
              {/* Icon */}
              <div>
                <Label className="mb-2" htmlFor="create-icon">
                  Icon
                </Label>

                <Select
                  value={formData.icon}
                  onValueChange={(value) =>
                    setFormData((previous) => ({
                      ...previous,
                      icon: value,
                    }))
                  }
                  disabled={isCreating}
                >
                  <SelectTrigger id="create-icon">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>

                  <SelectContent>
                    {UNIQUE_CATEGORY_ICONS.map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        {iconName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color */}
              <div>
                <Label className="mb-2" htmlFor="create-color">
                  Color
                </Label>

                <div className="flex items-center gap-2">
                  <Input
                    id="create-color"
                    type="color"
                    value={formData.color}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        color: event.target.value,
                      }))
                    }
                    className="w-20 h-10"
                    disabled={isCreating}
                  />

                  <Input
                    value={formData.color}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        color: event.target.value,
                      }))
                    }
                    placeholder="#3B82F6"
                    disabled={isCreating}
                  />
                </div>
              </div>
            </div>

            {/* Parent */}
            <div>
              <Label className="mb-2" htmlFor="create-parent">
                Parent Category
              </Label>

              <Select
                value={formData.parentId || 'none'}
                onValueChange={(value) =>
                  setFormData((previous) => ({
                    ...previous,
                    parentId: value === 'none' ? null : value,
                  }))
                }
                disabled={isCreating}
              >
                <SelectTrigger id="create-parent">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">None (Main Category)</SelectItem>

                  {categories
                    .filter((category) => !category.deletedAt && !category.parentId)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal} disabled={isCreating}>
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleCreateCategory}
              disabled={!formData.name.trim() || isCreating}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {isCreating ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* EDIT DIALOG                                                       */}
      <Dialog
        open={modal?.type === 'edit'}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>

            <DialogDescription>Update category information.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name / Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="edit-name">
                  Category Name *
                </Label>

                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  disabled={isUpdating}
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="edit-slug">
                  Slug
                </Label>

                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      slug: event.target.value,
                    }))
                  }
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="mb-2" htmlFor="edit-description">
                Description
              </Label>

              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                rows={3}
                disabled={isUpdating}
              />
            </div>

            {/* Icon / Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="edit-icon">
                  Icon
                </Label>

                <Select
                  value={formData.icon}
                  onValueChange={(value) =>
                    setFormData((previous) => ({
                      ...previous,
                      icon: value,
                    }))
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger id="edit-icon">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>

                  <SelectContent>
                    {UNIQUE_CATEGORY_ICONS.map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        {iconName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2" htmlFor="edit-color">
                  Color
                </Label>

                <div className="flex items-center gap-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={formData.color}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        color: event.target.value,
                      }))
                    }
                    className="w-20 h-10"
                    disabled={isUpdating}
                  />

                  <Input
                    value={formData.color}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        color: event.target.value,
                      }))
                    }
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal} disabled={isUpdating}>
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleUpdateCategory}
              disabled={!formData.name.trim() || isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {isUpdating ? 'Updating...' : 'Update Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* DELETE DIALOG                                                     */}
      <AlertDialog
        open={modal?.type === 'delete'}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{modal?.type === 'delete' ? modal.category.name : ''}</strong>
              ?
              <br />
              <br />
              This action will soft delete the category and it can be restored later. All associated
              courses will remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                /**
                 * Keep the AlertDialog open until the
                 * mutation finishes successfully.
                 */
                event.preventDefault();

                if (!isDeleting) {
                  void handleSoftDelete();
                }
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {isDeleting ? 'Deleting...' : 'Delete Category'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
