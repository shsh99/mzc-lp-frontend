import { useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Pin,
  Calendar,
  Send,
  Archive,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Label } from '@/components/common/Label';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import { Switch } from '@/components/common/Switch';
import {
  useTenantNotices,
  useCreateTenantNotice,
  useUpdateTenantNotice,
  useDeleteTenantNotice,
  usePublishTenantNotice,
  useArchiveTenantNotice,
} from '@/hooks/ta/useTenantNoticeQueries';
import type {
  TenantNotice,
  TenantNoticeType,
  TenantNoticeStatus,
  CreateTenantNoticeRequest,
  UpdateTenantNoticeRequest,
} from '@/types/ta/tenantNotice.types';

const typeConfig: Record<TenantNoticeType, { label: string; color: string }> = {
  GENERAL: { label: '일반', color: 'bg-gray-100 text-gray-700' },
  IMPORTANT: { label: '중요', color: 'bg-blue-100 text-blue-700' },
  URGENT: { label: '긴급', color: 'bg-red-100 text-red-700' },
  EVENT: { label: '이벤트', color: 'bg-purple-100 text-purple-700' },
};

const statusConfig: Record<TenantNoticeStatus, { label: string; color: string }> = {
  DRAFT: { label: '초안', color: 'bg-gray-100 text-gray-600' },
  PUBLISHED: { label: '게시됨', color: 'bg-green-100 text-green-700' },
  ARCHIVED: { label: '보관됨', color: 'bg-orange-100 text-orange-700' },
};

export function OperatorNoticesPage() {
  const [statusFilter, setStatusFilter] = useState<TenantNoticeStatus | 'ALL'>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<TenantNotice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenantNotice | null>(null);
  const [viewingNotice, setViewingNotice] = useState<TenantNotice | null>(null);

  // Form state - TO는 USER 대상으로만 작성 가능
  const [formData, setFormData] = useState<CreateTenantNoticeRequest>({
    title: '',
    content: '',
    type: 'GENERAL',
    targetAudience: 'USER',
    isPinned: false,
  });

  // API Hooks - USER 대상 공지만 조회
  const { data: noticesData, isLoading } = useTenantNotices({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    targetAudience: 'USER',
  });
  const createMutation = useCreateTenantNotice();
  const updateMutation = useUpdateTenantNotice();
  const deleteMutation = useDeleteTenantNotice();
  const publishMutation = usePublishTenantNotice();
  const archiveMutation = useArchiveTenantNotice();

  const notices = noticesData?.content || [];
  const totalNotices = noticesData?.totalElements || 0;

  const handleCreateOpen = () => {
    setFormData({
      title: '',
      content: '',
      type: 'GENERAL',
      targetAudience: 'USER',
      isPinned: false,
    });
    setIsCreateOpen(true);
  };

  const handleEditOpen = (notice: TenantNotice) => {
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      targetAudience: 'USER',
      isPinned: notice.isPinned,
    });
    setEditingNotice(notice);
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    try {
      await createMutation.mutateAsync({
        ...formData,
        targetAudience: 'USER',
      });
      toast.success('공지사항이 생성되었습니다.');
      setIsCreateOpen(false);
    } catch (error) {
      toast.error('공지사항 생성에 실패했습니다.');
    }
  };

  const handleUpdate = async () => {
    if (!editingNotice || !formData.title.trim() || !formData.content.trim()) return;
    const request: UpdateTenantNoticeRequest = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      targetAudience: 'USER',
      isPinned: formData.isPinned,
    };
    try {
      await updateMutation.mutateAsync({ id: editingNotice.id, request });
      toast.success('공지사항이 수정되었습니다.');
      setEditingNotice(null);
    } catch (error) {
      toast.error('공지사항 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('공지사항이 삭제되었습니다.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error('공지사항 삭제에 실패했습니다.');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishMutation.mutateAsync(id);
      toast.success('공지사항이 발행되었습니다.');
    } catch (error) {
      toast.error('공지사항 발행에 실패했습니다.');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await archiveMutation.mutateAsync(id);
      toast.success('공지사항이 보관되었습니다.');
    } catch (error) {
      toast.error('공지사항 보관에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">공지사항 관리</h1>
          <p className="text-sm text-text-secondary mt-1">
            학습자에게 전달할 공지사항을 관리합니다
          </p>
        </div>
        <Button onClick={handleCreateOpen}>
          <Plus className="mr-2 h-4 w-4" />
          공지 작성
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>공지사항 목록</CardTitle>
              <CardDescription>전체 {totalNotices}개의 공지사항</CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as TenantNoticeStatus | 'ALL')}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체 상태</SelectItem>
                <SelectItem value="DRAFT">초안</SelectItem>
                <SelectItem value="PUBLISHED">게시됨</SelectItem>
                <SelectItem value="ARCHIVED">보관됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notices.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                등록된 공지사항이 없습니다
              </div>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-bg-secondary"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {notice.isPinned && <Pin className="h-4 w-4 text-brand-primary mt-1 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">{notice.title}</h3>
                        <Badge className={typeConfig[notice.type].color}>
                          {typeConfig[notice.type].label}
                        </Badge>
                        <Badge className={statusConfig[notice.status].color}>
                          {statusConfig[notice.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                        {notice.status === 'PUBLISHED' && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            조회 {notice.viewCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingNotice(notice)}
                      title="미리보기"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {notice.status === 'DRAFT' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePublish(notice.id)}
                        disabled={publishMutation.isPending}
                        title="발행"
                      >
                        <Send className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {notice.status === 'PUBLISHED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(notice.id)}
                        disabled={archiveMutation.isPending}
                        title="보관"
                      >
                        <Archive className="h-4 w-4 text-orange-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditOpen(notice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => setDeleteTarget(notice)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 공지사항 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>제목 *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>유형</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as TenantNoticeType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">일반</SelectItem>
                    <SelectItem value="IMPORTANT">중요</SelectItem>
                    <SelectItem value="URGENT">긴급</SelectItem>
                    <SelectItem value="EVENT">이벤트</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(v) => setFormData({ ...formData, isPinned: v })}
                />
                <Label htmlFor="isPinned">상단 고정</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>내용 *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.title.trim() || !formData.content.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingNotice} onOpenChange={() => setEditingNotice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>제목 *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>유형</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as TenantNoticeType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">일반</SelectItem>
                    <SelectItem value="IMPORTANT">중요</SelectItem>
                    <SelectItem value="URGENT">긴급</SelectItem>
                    <SelectItem value="EVENT">이벤트</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="isPinnedEdit"
                  checked={formData.isPinned}
                  onCheckedChange={(v) => setFormData({ ...formData, isPinned: v })}
                />
                <Label htmlFor="isPinnedEdit">상단 고정</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>내용 *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNotice(null)}>
              취소
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.title.trim() || !formData.content.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공지사항 삭제</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            "{deleteTarget?.title}" 공지사항을 삭제하시겠습니까?
            <br />
            <span className="text-sm text-text-secondary">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
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

      {/* Preview Dialog */}
      <Dialog open={!!viewingNotice} onOpenChange={() => setViewingNotice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingNotice?.isPinned && <Pin className="h-4 w-4 text-brand-primary" />}
              {viewingNotice?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              {viewingNotice && (
                <>
                  <Badge className={typeConfig[viewingNotice.type].color}>
                    {typeConfig[viewingNotice.type].label}
                  </Badge>
                  <span className="text-sm text-text-secondary">
                    {new Date(viewingNotice.createdAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {viewingNotice?.content}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingNotice(null)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
