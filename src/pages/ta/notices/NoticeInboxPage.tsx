import { useState } from 'react';
import { toast } from 'sonner';
import {
  Bell,
  Pin,
  Eye,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  Inbox,
  Send,
  Plus,
  Edit,
  Trash2,
  Archive,
  Users,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Textarea } from '@/components/common/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { Switch } from '@/components/common/Switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import {
  useSystemNotices,
  useMarkSystemNoticeAsRead,
} from '@/hooks/ta/useSystemNoticeQueries';
import {
  useTenantNotices,
  useCreateTenantNotice,
  useUpdateTenantNotice,
  useDeleteTenantNotice,
  usePublishTenantNotice,
  useArchiveTenantNotice,
} from '@/hooks/ta/useTenantNoticeQueries';
import type { Notice } from '@/types/admin';
import type {
  TenantNotice,
  TenantNoticeType,
  TenantNoticeStatus,
  NoticeTargetAudience,
  CreateTenantNoticeRequest,
  UpdateTenantNoticeRequest,
} from '@/types/ta/tenantNotice.types';

// SA 공지 타입 설정
const systemTypeConfig: Record<string, { label: string; color: string }> = {
  GENERAL: { label: '일반', color: 'bg-gray-100 text-gray-700' },
  UPDATE: { label: '업데이트', color: 'bg-blue-100 text-blue-700' },
  SYSTEM: { label: '시스템', color: 'bg-yellow-100 text-yellow-700' },
  EVENT: { label: '이벤트', color: 'bg-purple-100 text-purple-700' },
};

// TA 공지 타입 설정
const tenantTypeConfig: Record<TenantNoticeType, { label: string; color: string }> = {
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

const audienceConfig: Record<NoticeTargetAudience, { label: string }> = {
  ALL: { label: '전체' },
  OPERATOR: { label: '운영자' },
  USER: { label: '사용자' },
  DESIGNER: { label: '설계자' },
  INSTRUCTOR: { label: '강사' },
};

export function NoticeInboxPage() {
  const [activeTab, setActiveTab] = useState('inbox');

  // 받은공지 상태
  const [inboxPage, setInboxPage] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // 보낸공지 상태
  const [statusFilter, setStatusFilter] = useState<TenantNoticeStatus | 'ALL'>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<NoticeTargetAudience | 'ALL'>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<TenantNotice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenantNotice | null>(null);
  const [viewingNotice, setViewingNotice] = useState<TenantNotice | null>(null);
  const [formData, setFormData] = useState<CreateTenantNoticeRequest>({
    title: '',
    content: '',
    type: 'GENERAL',
    targetAudience: 'USER',
    isPinned: false,
  });

  // API Hooks - 받은공지
  const { data: systemNoticesData, isLoading: isSystemLoading } = useSystemNotices({ page: inboxPage, size: 10 });
  const markAsReadMutation = useMarkSystemNoticeAsRead();

  // API Hooks - 보낸공지
  const { data: tenantNoticesData, isLoading: isTenantLoading } = useTenantNotices({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    targetAudience: audienceFilter !== 'ALL' ? audienceFilter : undefined,
  });
  const createMutation = useCreateTenantNotice();
  const updateMutation = useUpdateTenantNotice();
  const deleteMutation = useDeleteTenantNotice();
  const publishMutation = usePublishTenantNotice();
  const archiveMutation = useArchiveTenantNotice();

  // 받은공지 데이터
  const systemNotices = systemNoticesData?.content || [];
  const totalPages = systemNoticesData?.totalPages || 0;
  const totalSystemElements = systemNoticesData?.totalElements || 0;

  // 보낸공지 데이터
  const tenantNotices = tenantNoticesData?.content || [];
  const totalTenantElements = tenantNoticesData?.totalElements || 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 받은공지 핸들러
  const handleViewSystemNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    markAsReadMutation.mutate(notice.id);
  };

  // 보낸공지 핸들러
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
      targetAudience: notice.targetAudience,
      isPinned: notice.isPinned,
    });
    setEditingNotice(notice);
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    try {
      await createMutation.mutateAsync(formData);
      toast.success('공지사항이 생성되었습니다.');
      setIsCreateOpen(false);
    } catch {
      toast.error('공지사항 생성에 실패했습니다.');
    }
  };

  const handleUpdate = async () => {
    if (!editingNotice || !formData.title.trim() || !formData.content.trim()) return;
    const request: UpdateTenantNoticeRequest = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      targetAudience: formData.targetAudience,
      isPinned: formData.isPinned,
    };
    try {
      await updateMutation.mutateAsync({ id: editingNotice.id, request });
      toast.success('공지사항이 수정되었습니다.');
      setEditingNotice(null);
    } catch {
      toast.error('공지사항 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('공지사항이 삭제되었습니다.');
      setDeleteTarget(null);
    } catch {
      toast.error('공지사항 삭제에 실패했습니다.');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishMutation.mutateAsync(id);
      toast.success('공지사항이 발행되었습니다.');
    } catch {
      toast.error('공지사항 발행에 실패했습니다.');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await archiveMutation.mutateAsync(id);
      toast.success('공지사항이 보관되었습니다.');
    } catch {
      toast.error('공지사항 보관에 실패했습니다.');
    }
  };

  const isLoading = isSystemLoading || isTenantLoading;

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
      <AdminPageHeader
        title="공지사항"
        description="시스템 공지를 확인하고 운영자/사용자에게 공지를 발송합니다"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            받은 공지
            {totalSystemElements > 0 && (
              <Badge variant="secondary" className="ml-1">{totalSystemElements}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outbox" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            보낸 공지
            {totalTenantElements > 0 && (
              <Badge variant="secondary" className="ml-1">{totalTenantElements}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* 받은 공지 탭 */}
        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-brand-primary" />
                <div>
                  <CardTitle>시스템 공지사항</CardTitle>
                  <CardDescription>시스템 관리자로부터 받은 공지사항입니다</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {systemNotices.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>받은 공지사항이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {systemNotices.map((notice) => {
                    const typeConf = systemTypeConfig[notice.type] || systemTypeConfig.GENERAL;

                    return (
                      <div
                        key={notice.id}
                        role="button"
                        tabIndex={0}
                        className="p-4 border rounded-lg hover:bg-bg-secondary cursor-pointer transition-colors"
                        onClick={() => handleViewSystemNotice(notice)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleViewSystemNotice(notice);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {notice.isPinned && (
                                <Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                              )}
                              <h3 className="font-medium">{notice.title}</h3>
                              <Badge className={typeConf.color}>{typeConf.label}</Badge>
                            </div>
                            <p className="text-sm text-text-secondary line-clamp-2">
                              {notice.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <span className="text-xs text-text-secondary flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(notice.publishedAt)}
                            </span>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              보기
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={inboxPage === 0}
                    onClick={() => setInboxPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {inboxPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={inboxPage >= totalPages - 1}
                    onClick={() => setInboxPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 보낸 공지 탭 */}
        <TabsContent value="outbox">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-brand-primary" />
                  <div>
                    <CardTitle>발송한 공지사항</CardTitle>
                    <CardDescription>운영자와 사용자에게 발송한 공지사항입니다</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={audienceFilter}
                    onValueChange={(v) => setAudienceFilter(v as NoticeTargetAudience | 'ALL')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체 대상</SelectItem>
                      <SelectItem value="OPERATOR">운영자</SelectItem>
                      <SelectItem value="USER">사용자</SelectItem>
                      <SelectItem value="DESIGNER">설계자</SelectItem>
                      <SelectItem value="INSTRUCTOR">강사</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Button onClick={handleCreateOpen}>
                    <Plus className="mr-2 h-4 w-4" />
                    공지 작성
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenantNotices.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>발송한 공지사항이 없습니다</p>
                  </div>
                ) : (
                  tenantNotices.map((notice) => (
                    <div
                      key={notice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-bg-secondary"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {notice.isPinned && <Pin className="h-4 w-4 text-brand-primary mt-1 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium truncate">{notice.title}</h3>
                            <Badge className={tenantTypeConfig[notice.type].color}>
                              {tenantTypeConfig[notice.type].label}
                            </Badge>
                            <Badge className={statusConfig[notice.status].color}>
                              {statusConfig[notice.status].label}
                            </Badge>
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {audienceConfig[notice.targetAudience].label}
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
        </TabsContent>
      </Tabs>

      {/* 받은공지 상세 Dialog */}
      <Dialog open={selectedNotice !== null} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedNotice?.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
              <DialogTitle>{selectedNotice?.title}</DialogTitle>
            </div>
            <DialogDescription className="flex items-center gap-3">
              {selectedNotice && (
                <>
                  <Badge className={systemTypeConfig[selectedNotice.type]?.color || systemTypeConfig.GENERAL.color}>
                    {systemTypeConfig[selectedNotice.type]?.label || '일반'}
                  </Badge>
                  <span className="text-xs">
                    {formatDate(selectedNotice.publishedAt)}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedNotice && (
            <div className="mt-4">
              {selectedNotice.expiredAt && new Date(selectedNotice.expiredAt) < new Date() && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">이 공지사항은 만료되었습니다.</span>
                </div>
              )}

              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedNotice.content }}
              />

              <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  읽음
                </div>
                {selectedNotice.expiredAt && (
                  <span>만료일: {formatDate(selectedNotice.expiredAt)}</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 보낸공지 작성 Dialog */}
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
            <div className="grid grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label>대상</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(v) => setFormData({ ...formData, targetAudience: v as NoticeTargetAudience })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="USER">사용자</SelectItem>
                    <SelectItem value="OPERATOR">운영자</SelectItem>
                    <SelectItem value="DESIGNER">설계자</SelectItem>
                    <SelectItem value="INSTRUCTOR">강사</SelectItem>
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

      {/* 보낸공지 수정 Dialog */}
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
            <div className="grid grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label>대상</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(v) => setFormData({ ...formData, targetAudience: v as NoticeTargetAudience })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="USER">사용자</SelectItem>
                    <SelectItem value="OPERATOR">운영자</SelectItem>
                    <SelectItem value="DESIGNER">설계자</SelectItem>
                    <SelectItem value="INSTRUCTOR">강사</SelectItem>
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

      {/* 보낸공지 삭제 확인 Dialog */}
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

      {/* 보낸공지 미리보기 Dialog */}
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
                  <Badge className={tenantTypeConfig[viewingNotice.type].color}>
                    {tenantTypeConfig[viewingNotice.type].label}
                  </Badge>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {audienceConfig[viewingNotice.targetAudience].label}
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
