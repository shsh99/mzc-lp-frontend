import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Building2, Loader2, Users, BookOpen, HardDrive, BarChart3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminStatsCard,
  AdminStatsGrid,
  StatusBadge,
  PlanBadge,
} from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Progress } from '@/components/common/Progress';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/common/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/common/AlertDialog';
import { Label } from '@/components/common/Label';
import { Skeleton } from '@/components/common/Skeleton';
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
} from '@/hooks/sa';
import type { Tenant, TenantStatus, PlanType, CreateTenantRequest, UpdateTenantDetailRequest } from '@/types/admin';

interface TenantFormData {
  code: string;
  name: string;
  type: 'B2C' | 'B2B';
  plan: PlanType;
  subdomain: string;
  adminEmail: string;
  adminName: string;
  status?: TenantStatus;
}

interface CreatedTenantInfo {
  tenantName: string;
  adminEmail: string;
  adminName: string;
  tempPassword: string;
}

// 탭용 콘텐츠 컴포넌트 (TenantManagementPage에서 사용)
export function TenantsContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);
  const [createdTenantInfo, setCreatedTenantInfo] = useState<CreatedTenantInfo | null>(null);

  // API Hooks
  const { data: tenantsData, isLoading, isError } = useTenants({
    keyword: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    plan: planFilter !== 'all' ? planFilter : undefined,
    page,
    size: 10,
  });

  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();
  const deleteMutation = useDeleteTenant();

  const { register, handleSubmit, reset, setValue, watch } = useForm<TenantFormData>({
    defaultValues: {
      code: '',
      name: '',
      type: 'B2B',
      plan: 'BASIC',
      subdomain: '',
      adminEmail: '',
      adminName: '',
      status: 'ACTIVE',
    },
  });

  const tenants = tenantsData?.content || [];

  // 전체 통계 계산
  const totalStats = useMemo(() => {
    const totalUsers = tenants.reduce((sum, t) => sum + (t.userCount || 0), 0);
    const totalCourses = tenants.reduce((sum, t) => sum + (t.courseCount || 0), 0);
    const totalStorage = tenants.reduce((sum, t) => sum + (t.storageUsed || 0), 0);
    return { totalUsers, totalCourses, totalTenants: tenantsData?.totalElements || tenants.length, totalStorage };
  }, [tenants, tenantsData]);

  // 플랜별 최대 한도
  const getPlanLimits = (plan: PlanType) => {
    const limits = {
      BASIC: { users: 50, courses: 20, storage: 10 },
      PRO: { users: 200, courses: 50, storage: 50 },
      ENTERPRISE: { users: 500, courses: 100, storage: 200 },
    };
    return limits[plan] || limits.BASIC;
  };

  // 사용량 색상
  const getUsageColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleViewDetail = (tenant: Tenant) => {
    navigate(`/sa/tenants/${tenant.tenantId}`);
  };

  const handleViewAnalytics = (tenant: Tenant) => {
    navigate(`/sa/analytics?tenantId=${tenant.tenantId}`);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setValue('name', tenant.name);
    setValue('code', tenant.code);
    setValue('plan', tenant.plan);
    setValue('status', tenant.status);
    setValue('type', tenant.type);
    setValue('subdomain', tenant.subdomain);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.tenantId);
      toast.success(`'${deleteTarget.name}' 테넌트가 삭제되었습니다.`);
      setDeleteTarget(null);
    } catch {
      toast.error('테넌트 삭제에 실패했습니다.');
    }
  };

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    reset({
      type: 'B2B',
      plan: 'BASIC',
      status: 'ACTIVE',
      code: '',
      name: '',
      subdomain: '',
      adminEmail: '',
      adminName: '',
    });
    setIsCreateDialogOpen(true);
  };

  const onSubmit = async (data: TenantFormData) => {
    console.log('[TenantsPage] onSubmit called:', data);
    console.log('[TenantsPage] selectedTenant:', selectedTenant);
    try {
      if (selectedTenant) {
        // 수정
        const updateData: UpdateTenantDetailRequest = {
          name: data.name,
          status: data.status,
          plan: data.plan,
        };
        console.log('[TenantsPage] updateData:', updateData);
        await updateMutation.mutateAsync({ id: selectedTenant.tenantId, request: updateData });
        toast.success('테넌트가 수정되었습니다.');
        setIsCreateDialogOpen(false);
      } else {
        // 생성
        const createData: CreateTenantRequest = {
          code: data.code.toUpperCase(),
          name: data.name,
          type: data.type,
          plan: data.plan,
          subdomain: data.subdomain,
          adminEmail: data.adminEmail,
          adminName: data.adminName,
        };
        console.log('[TenantsPage] createData:', createData);
        const result = await createMutation.mutateAsync(createData);
        setIsCreateDialogOpen(false);
        // 생성 성공 시 관리자 정보 다이얼로그 표시
        setCreatedTenantInfo({
          tenantName: result.name,
          adminEmail: result.admin.email,
          adminName: result.admin.name,
          tempPassword: result.admin.tempPassword,
        });
      }
      reset();
    } catch (error) {
      console.error('[TenantsPage] onSubmit error:', error);
      toast.error(selectedTenant ? '테넌트 수정에 실패했습니다.' : '테넌트 생성에 실패했습니다.');
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">테넌트 목록을 불러오는데 실패했습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* 전체 통계 카드 */}
      <AdminStatsGrid columns={4} className="mb-6">
        <AdminStatsCard
          title="전체 테넌트"
          value={totalStats.totalTenants}
          icon={Building2}
          variant="primary"
        />
        <AdminStatsCard
          title="전체 사용자"
          value={totalStats.totalUsers.toLocaleString()}
          icon={Users}
          variant="success"
        />
        <AdminStatsCard
          title="전체 강좌"
          value={totalStats.totalCourses}
          icon={BookOpen}
          variant="default"
        />
        <AdminStatsCard
          title="전체 스토리지"
          value={`${(totalStats.totalStorage / 1024).toFixed(1)} GB`}
          icon={HardDrive}
          variant="warning"
        />
      </AdminStatsGrid>

      {/* 테넌트 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>테넌트 목록</CardTitle>
              <CardDescription>각 테넌트의 리소스 사용량을 확인합니다</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="테넌트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter || 'all'} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="ACTIVE">활성</SelectItem>
                  <SelectItem value="PENDING">대기</SelectItem>
                  <SelectItem value="SUSPENDED">정지</SelectItem>
                  <SelectItem value="TERMINATED">종료</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter || 'all'} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="플랜" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 플랜</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateTenant}>
                <Plus className="mr-2 h-4 w-4" />
                테넌트 추가
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>테넌트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tenants.map((tenant) => {
                const limits = getPlanLimits(tenant.plan);
                const userCount = tenant.userCount || 0;
                const courseCount = tenant.courseCount || 0;
                const storageUsed = tenant.storageUsed || 0;

                return (
                  <div key={tenant.tenantId} className="p-4 border rounded-lg hover:bg-bg-secondary transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{tenant.name}</h3>
                          </div>
                          <p className="text-sm text-text-secondary">{tenant.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={tenant.status} />
                        <PlanBadge plan={tenant.plan} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(tenant)}>
                              <Eye className="mr-2 h-4 w-4" />
                              상세 보기
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewAnalytics(tenant)}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              활동 분석
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(tenant)}>
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(tenant)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Users */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-secondary">사용자</span>
                          <span className={`text-sm font-medium ${getUsageColor(userCount, limits.users)}`}>
                            {userCount} / {limits.users}
                          </span>
                        </div>
                        <Progress value={(userCount / limits.users) * 100} />
                      </div>

                      {/* Courses */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-secondary">강좌</span>
                          <span className={`text-sm font-medium ${getUsageColor(courseCount, limits.courses)}`}>
                            {courseCount} / {limits.courses}
                          </span>
                        </div>
                        <Progress value={(courseCount / limits.courses) * 100} />
                      </div>

                      {/* Storage */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-secondary">스토리지</span>
                          <span className={`text-sm font-medium ${getUsageColor(storageUsed, limits.storage)}`}>
                            {storageUsed} GB / {limits.storage} GB
                          </span>
                        </div>
                        <Progress value={(storageUsed / limits.storage) * 100} />
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-text-secondary">
                      생성일: {new Date(tenant.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 페이지네이션 */}
          {tenantsData && tenantsData.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </Button>
              <span className="flex items-center px-4 text-sm text-text-secondary">
                {page + 1} / {tenantsData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= tenantsData.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 테넌트 생성/수정 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTenant ? '테넌트 수정' : '테넌트 추가'}</DialogTitle>
            <DialogDescription>
              {selectedTenant ? '테넌트 정보를 수정합니다.' : '새로운 테넌트를 생성합니다.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">테넌트명</Label>
                <Input
                  id="name"
                  placeholder="테넌트명을 입력하세요"
                  {...register('name', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">테넌트 코드</Label>
                <Input
                  id="code"
                  placeholder="예: TENANT_01"
                  {...register('code', { required: !selectedTenant })}
                  disabled={!!selectedTenant}
                  className="uppercase"
                />
                <p className="text-xs text-text-secondary">대문자, 숫자, 언더스코어(_)만 허용</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">플랜</Label>
                <Select
                  value={watch('plan')}
                  onValueChange={(v) => setValue('plan', v as PlanType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="플랜 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="PRO">Pro</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedTenant && (
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(v) => setValue('status', v as TenantStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">활성</SelectItem>
                      <SelectItem value="PENDING">대기</SelectItem>
                      <SelectItem value="SUSPENDED">정지</SelectItem>
                      <SelectItem value="TERMINATED">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!selectedTenant && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">서브도메인</Label>
                    <Input
                      id="subdomain"
                      placeholder="example"
                      {...register('subdomain', { required: true })}
                    />
                    <p className="text-xs text-text-secondary">example.mzclearn.com</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">테넌트 유형</Label>
                    <Select
                      value={watch('type')}
                      onValueChange={(v) => setValue('type', v as 'B2C' | 'B2B')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B2B">B2B (기업)</SelectItem>
                        <SelectItem value="B2C">B2C (개인)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">관리자 이메일</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@example.com"
                      {...register('adminEmail', { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminName">관리자명</Label>
                    <Input
                      id="adminName"
                      placeholder="관리자 이름"
                      {...register('adminName', { required: true })}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                취소
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedTenant ? '수정' : '생성'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && !deleteMutation.isPending && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>테넌트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              '{deleteTarget?.name}' 테넌트를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없으며, 테넌트의 모든 데이터가 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>취소</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              삭제
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 테넌트 생성 완료 다이얼로그 (관리자 계정 정보 표시) */}
      <Dialog open={!!createdTenantInfo} onOpenChange={() => setCreatedTenantInfo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>테넌트 생성 완료</DialogTitle>
            <DialogDescription>
              '{createdTenantInfo?.tenantName}' 테넌트가 생성되었습니다.
              <br />
              아래 관리자 계정 정보를 안전하게 보관하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-3">
                임시 비밀번호는 이 창을 닫으면 다시 볼 수 없습니다.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">관리자명:</span>
                  <span className="font-medium">{createdTenantInfo?.adminName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">이메일:</span>
                  <span className="font-medium">{createdTenantInfo?.adminEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">임시 비밀번호:</span>
                  <code className="px-2 py-1 bg-white border rounded font-mono text-sm">
                    {createdTenantInfo?.tempPassword}
                  </code>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (createdTenantInfo?.tempPassword) {
                  navigator.clipboard.writeText(createdTenantInfo.tempPassword);
                  toast.success('임시 비밀번호가 클립보드에 복사되었습니다.');
                }
              }}
            >
              비밀번호 복사
            </Button>
            <Button onClick={() => setCreatedTenantInfo(null)}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 기존 TenantsPage - 호환성 유지용 (독립 페이지로 사용 시)
export function TenantsPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="테넌트 관리"
        description="시스템에 등록된 테넌트를 관리합니다"
      />
      <div className="mt-6">
        <TenantsContent />
      </div>
    </div>
  );
}
