import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Tags,
  Check,
  X,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Switch } from '@/components/common/Switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/Dialog';
import {
  useTenantCategories,
  useCreateTenantCategory,
  useUpdateTenantCategory,
  useDeleteTenantCategory,
  useReorderTenantCategories,
} from '@/hooks/ta';
import type { TenantCategoryResponse, TenantCategoryRequest } from '@/services/ta/tenantCategoryService';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const initialFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  enabled: true,
};

export function TenantCategoryPage() {
  const { data: categories, isLoading } = useTenantCategories();
  const createMutation = useCreateTenantCategory();
  const updateMutation = useUpdateTenantCategory();
  const deleteMutation = useDeleteTenantCategory();
  const reorderMutation = useReorderTenantCategories();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TenantCategoryResponse | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<TenantCategoryResponse | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  // 드래그 앤 드롭 상태
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (category: TenantCategoryResponse) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      enabled: category.enabled,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (category: TenantCategoryResponse) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData(initialFormData);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  const handleSave = async () => {
    const request: TenantCategoryRequest = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      icon: formData.icon || null,
      enabled: formData.enabled,
    };

    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory.id, request });
    } else {
      await createMutation.mutateAsync(request);
    }
    handleCloseDialog();
  };

  const handleDelete = async () => {
    if (deletingCategory) {
      await deleteMutation.mutateAsync(deletingCategory.id);
      handleCloseDeleteDialog();
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // 새로 만들 때만 slug 자동 생성
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === targetIndex || !categories) return;

    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedItem, 1);
    newCategories.splice(targetIndex, 0, removed);

    const categoryIds = newCategories.map((c) => c.id);
    await reorderMutation.mutateAsync(categoryIds);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="카테고리 관리"
        description="테넌트의 커스텀 강의 카테고리를 관리합니다"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            카테고리 추가
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-brand-primary" />
            <CardTitle>카테고리 목록</CardTitle>
          </div>
          <CardDescription>
            드래그 앤 드롭으로 카테고리 순서를 변경할 수 있습니다.
            활성화된 카테고리만 사용자에게 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-move transition-all ${
                    draggedItem === index
                      ? 'opacity-50 border-brand-primary bg-brand-primary/5'
                      : 'hover:bg-gray-50'
                  } ${!category.enabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-gray-500">({category.slug})</span>
                        {!category.enabled && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            비활성
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-text-secondary mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDelete(category)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Tags className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">아직 생성된 카테고리가 없습니다</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                첫 카테고리 만들기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 생성/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? '카테고리 정보를 수정합니다'
                : '새로운 강의 카테고리를 추가합니다'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">카테고리 이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="예: 프로그래밍"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">슬러그 (URL 경로) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="예: programming"
              />
              <p className="text-xs text-gray-500">
                URL에 사용되는 고유 식별자입니다. 영문, 숫자, 하이픈만 사용 가능합니다.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="카테고리에 대한 간단한 설명"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">아이콘</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="예: code, book, star"
              />
              <p className="text-xs text-gray-500">
                Lucide 아이콘 이름을 입력하세요.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>활성화</Label>
                <p className="text-sm text-gray-500">
                  비활성화된 카테고리는 사용자에게 표시되지 않습니다
                </p>
              </div>
              <Switch
                checked={formData.enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enabled: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="mr-2 h-4 w-4" />
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.name ||
                !formData.slug ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              <Check className="mr-2 h-4 w-4" />
              {createMutation.isPending || updateMutation.isPending
                ? '저장 중...'
                : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 삭제</DialogTitle>
            <DialogDescription>
              &quot;{deletingCategory?.name}&quot; 카테고리를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteDialog}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
