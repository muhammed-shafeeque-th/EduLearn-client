/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
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

type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  parentId: string | null;
};

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
  //Mobile Development
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
  'Database',
  'Table',
  'Calculator',
  'TrendingUp',
  // Cloud
  'Cloud',
  'Server',
  'GitBranch',
  'Container',
  'Settings',
  'Workflow',
  'ShieldCheck',
  'Lock',
  'Boxes',
  'HardDrive',
  // Cyber Security
  'Shield',
  'ShieldCheck',
  'Lock',
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
  'TrendingUp',
  'BarChart3',
  // Personal Development
  'User',
  'Heart',
  'Star',
  'Award',
  'Sparkles',
  'Smile',
  'Sun',
  'Activity',
  'BookOpen',
  // Design UI/UX
  'Palette',
  'PenTool',
  'Figma',
  'Image',
  'Layers',
  'Paintbrush',
  'Shapes',
  'Frame',
  // Marketing
];

const DEFAULT_FORM: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  icon: 'FolderOpen',
  color: '#3B82F6',
  parentId: null,
};

export function CategoriesContent() {
  const { categories, isLoading, isError, refetch: refetchCategories } = useAdminCategories(true);

  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleCategoryStatus();
  const { mutateAsync: restoreCategory, isPending: isRestoring } = useRestoreCategory();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDeleted] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_FORM);

  // const [iconNames, setIconNames] = useState<string[]>([]);

  // useEffect(() => {
  //   import('lucide-react').then((mod) => {
  //     setIconNames(
  //       Object.keys(mod).filter(
  //         (key) => /^[A-Z]/.test(key) && !['Icon', 'Icons', 'LucideProps'].includes(key)
  //       )
  //     );
  //   });
  // }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) newExpanded.delete(categoryId);
    else newExpanded.add(categoryId);
    setExpandedCategories(newExpanded);
  };

  const resetForm = () => setFormData(DEFAULT_FORM);

  //  CREATE
  const handleCreateCategory = async () => {
    try {
      await createCategory({
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        icon: formData.icon,
        color: formData.color,
        parentId: formData.parentId || undefined,
      });
      toast.success({ title: 'Category created successfully' });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast.error({ title: 'Failed to create category', description: getErrorMessage(error) });
    }
  };

  //  UPDATE
  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    try {
      await updateCategory({
        id: selectedCategory.id,
        data: {
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || undefined,
          icon: formData.icon,
          color: formData.color,
        },
      });
      toast.success({ title: 'Category updated successfully' });
      setShowEditDialog(false);
      setSelectedCategory(null);
      resetForm();
    } catch (error) {
      toast.error({ title: 'Failed to update category', description: getErrorMessage(error) });
    }
  };

  //  DELETE
  const handleSoftDelete = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      toast.success({ title: 'Category deleted successfully' });
      setShowDeleteDialog(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error({ title: 'Failed to delete category', description: getErrorMessage(error) });
    }
  };

  //  RESTORE
  const handleRestore = async (category: Category) => {
    try {
      await restoreCategory(category.id);
      toast.success({ title: 'Category restored successfully' });
    } catch (error) {
      toast.error({ title: 'Failed to restore category', description: getErrorMessage(error) });
    }
  };

  //  TOGGLE STATUS
  const handleToggleStatus = async (category: Category) => {
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

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon || 'FolderOpen',
      color: category.color || '#3B82F6',
      parentId: category.parentId,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && category.isActive) ||
      (statusFilter === 'inactive' && !category.isActive);
    const matchesDeleted = showDeleted ? true : !category.deletedAt;
    return matchesSearch && matchesStatus && matchesDeleted;
  });

  const renderCategory = (category: Category, level: number = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isDeleted = !!category.deletedAt;
    const Icon = getCategoryIcon(category.icon);

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn('mb-2', level > 0 && 'ml-8')}
      >
        <div
          className={cn(
            'flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all',
            isDeleted && 'opacity-50 bg-muted'
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasSubcategories && (
              <Button variant="ghost" size="sm" onClick={() => toggleCategory(category.id)}>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
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
              <p className="text-sm text-muted-foreground truncate">{category.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span>{category.courseCount} courses</span>
                <span>•</span>
                <span>Updated {new Date(category.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isDeleted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      openEditDialog(category);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Category
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(category)}
                    disabled={isToggling}
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
                  {!category.parentId && level === 0 && (
                    <DropdownMenuItem
                      onClick={() => {
                        setFormData({
                          ...DEFAULT_FORM,
                          parentId: category.id,
                        });
                        setShowCreateDialog(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subcategory
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => openDeleteDialog(category)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
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

        <AnimatePresence>
          {isExpanded && hasSubcategories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2"
            >
              {category.subcategories?.map((sub) => renderCategory(sub, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          Failed to load categories. Please try refreshing.
          <button onClick={() => refetchCategories()}>Retry</button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>All Categories</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {/* <Button
                variant={showDeleted ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowDeleted(!showDeleted)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
              </Button> */}
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
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              </div>
            ) : (
              <>
                {filteredCategories.map((category) => renderCategory(category))}
                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setShowCreateDialog(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category or subcategory to organize your courses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="name">
                Category Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Web Development"
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the category"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="icon">
                  Icon
                </Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger id="icon">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ICONS.map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        {iconName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="color">
                  Color
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="mb-2" htmlFor="parent">
                Parent Category
              </Label>
              <Select
                value={formData.parentId || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value === 'none' ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Main Category)</SelectItem>
                  {categories
                    .filter((c) => !c.deletedAt && !c.parentId)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={!formData.name || isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Category Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="edit-icon">
                  Icon
                </Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger id="edit-icon">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ICONS.map((iconName) => (
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
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedCategory(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={!formData.name || isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;? This action will
              soft delete the category and it can be restored later. All associated courses will
              remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCategory(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCategory && handleSoftDelete(selectedCategory)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
