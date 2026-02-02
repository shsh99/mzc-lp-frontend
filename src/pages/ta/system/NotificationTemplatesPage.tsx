import { useState } from 'react';
import {
  Bell,
  Plus,
  Search,
  Edit,
  Eye,
  Power,
  PowerOff,
  Trash2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/common/Dialog';
import { Label } from '@/components/common/Label';
import { Textarea } from '@/components/common/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/Select';
import { toast } from 'sonner';
import {
  useNotificationTemplates,
  useCreateNotificationTemplate,
  useUpdateNotificationTemplate,
  useDeleteNotificationTemplate,
  useActivateNotificationTemplate,
  useDeactivateNotificationTemplate,
  useInitializeDefaultTemplates,
  useTriggerTypes,
} from '@/hooks/ta/useNotificationTemplateQueries';
import type {
  NotificationTemplateResponse,
  NotificationCategory,
  NotificationTrigger,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
} from '@/types/ta/notificationTemplate.types';
import { CATEGORY_CONFIG, TRIGGER_VARIABLES } from '@/types/ta/notificationTemplate.types';

// 탭용 콘텐츠 컴포넌트 (NoticeAndNotificationPage에서 사용)
export function NotificationTemplatesContent() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplateResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    triggerType: NotificationTrigger | '';
    name: string;
    titleTemplate: string;
    messageTemplate: string;
    description: string;
  }>({
    triggerType: '',
    name: '',
    titleTemplate: '',
    messageTemplate: '',
    description: '',
  });

  // Queries
  const category = categoryFilter === 'all' ? undefined : (categoryFilter as NotificationCategory);
  const { data: templates = [], isLoading } = useNotificationTemplates(category);
  const { data: triggerTypes = [] } = useTriggerTypes();

  // Mutations
  const createMutation = useCreateNotificationTemplate();
  const updateMutation = useUpdateNotificationTemplate();
  const deleteMutation = useDeleteNotificationTemplate();
  const activateMutation = useActivateNotificationTemplate();
  const deactivateMutation = useDeactivateNotificationTemplate();
  const initializeMutation = useInitializeDefaultTemplates();

  // Filter templates by search keyword
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      template.triggerType.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesSearch;
  });

  // 이미 사용된 트리거 타입
  const usedTriggers = new Set(templates.map((t) => t.triggerType));

  // 사용 가능한 트리거 타입 (아직 생성되지 않은 것들)
  const availableTriggers = triggerTypes.filter((t) => !usedTriggers.has(t.value));

  const handleOpenCreateDialog = () => {
    setFormData({
      triggerType: '',
      name: '',
      titleTemplate: '',
      messageTemplate: '',
      description: '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (template: NotificationTemplateResponse) => {
    setSelectedTemplate(template);
    setFormData({
      triggerType: template.triggerType,
      name: template.name,
      titleTemplate: template.titleTemplate,
      messageTemplate: template.messageTemplate,
      description: template.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenViewDialog = (template: NotificationTemplateResponse) => {
    setSelectedTemplate(template);
    setIsViewDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.triggerType || !formData.name || !formData.titleTemplate || !formData.messageTemplate) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }

    try {
      await createMutation.mutateAsync({
        triggerType: formData.triggerType as NotificationTrigger,
        name: formData.name,
        titleTemplate: formData.titleTemplate,
        messageTemplate: formData.messageTemplate,
        description: formData.description || undefined,
      } as CreateNotificationTemplateRequest);
      toast.success('템플릿이 생성되었습니다');
      setIsCreateDialogOpen(false);
    } catch {
      toast.error('템플릿 생성에 실패했습니다');
    }
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;
    if (!formData.name || !formData.titleTemplate || !formData.messageTemplate) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedTemplate.id,
        request: {
          name: formData.name,
          titleTemplate: formData.titleTemplate,
          messageTemplate: formData.messageTemplate,
          description: formData.description || undefined,
        } as UpdateNotificationTemplateRequest,
      });
      toast.success('템플릿이 수정되었습니다');
      setIsEditDialogOpen(false);
    } catch {
      toast.error('템플릿 수정에 실패했습니다');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('템플릿이 삭제되었습니다');
    } catch {
      toast.error('템플릿 삭제에 실패했습니다');
    }
  };

  const handleToggleActive = async (template: NotificationTemplateResponse) => {
    try {
      if (template.isActive) {
        await deactivateMutation.mutateAsync(template.id);
        toast.success('템플릿이 비활성화되었습니다');
      } else {
        await activateMutation.mutateAsync(template.id);
        toast.success('템플릿이 활성화되었습니다');
      }
    } catch {
      toast.error('상태 변경에 실패했습니다');
    }
  };

  const handleInitialize = async () => {
    if (!confirm('기본 템플릿을 초기화하시겠습니까? 존재하지 않는 트리거 타입의 템플릿만 생성됩니다.')) return;

    try {
      await initializeMutation.mutateAsync();
      toast.success('기본 템플릿이 초기화되었습니다');
    } catch {
      toast.error('초기화에 실패했습니다');
    }
  };

  // 트리거 타입 선택 시 기본값 설정
  const handleTriggerChange = (value: string) => {
    const trigger = triggerTypes.find((t) => t.value === value);
    if (trigger) {
      setFormData((prev) => ({
        ...prev,
        triggerType: value as NotificationTrigger,
        name: prev.name || trigger.label,
      }));
    }
  };

  // 사용 가능한 변수 표시
  const getAvailableVariables = (trigger: NotificationTrigger | '') => {
    if (!trigger) return [];
    return TRIGGER_VARIABLES[trigger] || [];
  };

  return (
    <div>
      {/* 액션 버튼 영역 */}
      <div className="flex justify-end gap-2 mb-6">
        <Button variant="outline" onClick={handleInitialize} disabled={initializeMutation.isPending}>
          <RefreshCw className="mr-2 h-4 w-4" />
          기본 템플릿 초기화
        </Button>
        <Button onClick={handleOpenCreateDialog} disabled={availableTriggers.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          템플릿 추가
        </Button>
      </div>

      <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="AUTH">인증</TabsTrigger>
          <TabsTrigger value="NOTIFICATION">알림</TabsTrigger>
          <TabsTrigger value="MARKETING">마케팅</TabsTrigger>
          <TabsTrigger value="SYSTEM">시스템</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="템플릿 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-text-secondary" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>등록된 템플릿이 없습니다.</p>
          <p className="text-sm mt-2">기본 템플릿 초기화 버튼을 클릭하여 템플릿을 생성하세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const categoryConfig = CATEGORY_CONFIG[template.category];
            return (
              <Card key={template.id} className={!template.isActive ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-bg-secondary rounded-lg">
                        <Bell className="h-4 w-4 text-text-secondary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <code className="text-xs text-text-secondary">{template.triggerType}</code>
                      </div>
                    </div>
                    <Badge className={categoryConfig.color}>{categoryConfig.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {template.description || template.titleTemplate}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      수정: {new Date(template.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenViewDialog(template)}
                        title="미리보기"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditDialog(template)}
                        title="수정"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(template)}
                        title={template.isActive ? '비활성화' : '활성화'}
                      >
                        {template.isActive ? (
                          <PowerOff className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Power className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>알림 템플릿 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>트리거 타입 *</Label>
              <Select value={formData.triggerType} onValueChange={handleTriggerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="트리거 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableTriggers.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label} ({trigger.categoryLabel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>템플릿 이름 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="회원가입 환영"
              />
            </div>
            <div className="space-y-2">
              <Label>제목 템플릿 *</Label>
              <Input
                value={formData.titleTemplate}
                onChange={(e) => setFormData((prev) => ({ ...prev, titleTemplate: e.target.value }))}
                placeholder="회원가입을 환영합니다!"
              />
            </div>
            <div className="space-y-2">
              <Label>메시지 템플릿 *</Label>
              <Textarea
                value={formData.messageTemplate}
                onChange={(e) => setFormData((prev) => ({ ...prev, messageTemplate: e.target.value }))}
                placeholder="{{userName}}님, 가입을 환영합니다!"
                rows={4}
              />
              {formData.triggerType && getAvailableVariables(formData.triggerType).length > 0 && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Info className="h-3 w-3" />
                  사용 가능한 변수: {getAvailableVariables(formData.triggerType).map((v) => `{{${v}}}`).join(', ')}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="새 사용자 회원가입 시 발송"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>알림 템플릿 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>트리거 타입</Label>
              <Input value={selectedTemplate?.triggerDisplayName || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>템플릿 이름 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>제목 템플릿 *</Label>
              <Input
                value={formData.titleTemplate}
                onChange={(e) => setFormData((prev) => ({ ...prev, titleTemplate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>메시지 템플릿 *</Label>
              <Textarea
                value={formData.messageTemplate}
                onChange={(e) => setFormData((prev) => ({ ...prev, messageTemplate: e.target.value }))}
                rows={4}
              />
              {formData.triggerType && getAvailableVariables(formData.triggerType).length > 0 && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Info className="h-3 w-3" />
                  사용 가능한 변수: {getAvailableVariables(formData.triggerType).map((v) => `{{${v}}}`).join(', ')}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 미리보기 다이얼로그 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>템플릿 미리보기</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-bg-secondary rounded-lg space-y-3">
                <div>
                  <span className="text-xs text-text-secondary">트리거 타입</span>
                  <p className="font-medium">{selectedTemplate.triggerDisplayName}</p>
                </div>
                <div>
                  <span className="text-xs text-text-secondary">제목</span>
                  <p className="font-medium">{selectedTemplate.titleTemplate}</p>
                </div>
                <div>
                  <span className="text-xs text-text-secondary">메시지</span>
                  <p className="whitespace-pre-wrap">{selectedTemplate.messageTemplate}</p>
                </div>
                {selectedTemplate.description && (
                  <div>
                    <span className="text-xs text-text-secondary">설명</span>
                    <p>{selectedTemplate.description}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span>상태: {selectedTemplate.isActive ? '활성' : '비활성'}</span>
                <span>생성: {new Date(selectedTemplate.createdAt).toLocaleString()}</span>
                <span>수정: {new Date(selectedTemplate.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 기존 NotificationTemplatesPage - 호환성 유지용 (독립 페이지로 사용 시)
export function NotificationTemplatesPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="알림 템플릿 관리"
        description="시스템에서 발송되는 알림 템플릿을 관리합니다"
      />
      <div className="mt-6">
        <NotificationTemplatesContent />
      </div>
    </div>
  );
}
