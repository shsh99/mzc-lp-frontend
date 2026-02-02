import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Save,
  Upload,
  Trash2,
  Settings,
  Palette,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  AdminPageHeader,
  StatusBadge,
  PlanBadge,
} from '@/components/domain/admin';
import { Button } from '@/components/common/Button';
import { BackButton } from '@/components/common/BackButton';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import { Switch } from '@/components/common/Switch';
import { Skeleton } from '@/components/common/Skeleton';
import { useTenant, useUpdateTenant, useDeleteTenant } from '@/hooks/sa';
import type { TenantStatus, PlanType, TenantDetail } from '@/types/admin';

// Mock 데이터
const MOCK_TENANT: TenantDetail = {
  tenantId: 1,
  code: 'mzc',
  name: '메가존클라우드',
  type: 'B2B',
  status: 'ACTIVE',
  plan: 'ENTERPRISE',
  subdomain: 'mzc',
  customDomain: 'learn.megazone.com',
  userCount: 250,
  courseCount: 45,
  createdAt: '2025-01-15',
  updatedAt: '2025-01-15',
  adminEmail: 'admin@megazone.com',
  adminName: '김관리자',
  branding: {
    tenantId: 1,
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#4C2D9A',
    secondaryColor: '#3D2478',
  },
  settings: {
    tenantId: 1,
    allowSelfRegistration: true,
    requireEmailVerification: true,
    defaultLanguage: 'ko',
    timezone: 'Asia/Seoul',
    maxStorageGB: 50,
    maxUsersCount: 500,
    maxCourses: 100,
    allowCustomDomain: true,
    allowCustomBranding: true,
    ssoEnabled: true,
    apiAccessEnabled: true,
  },
};

// 폼 상태용 로컬 타입
interface TenantFormState {
  name: string;
  code: string;
  status: TenantStatus;
  plan: PlanType;
  customDomain: string;
  createdAt: string;
  adminName: string;
  adminEmail: string;
  userCount: number;
  courseCount: number;
  branding: {
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    faviconUrl: string;
  };
  settings: {
    maxUsersCount: number;
    maxCourses: number;
    maxStorageGB: number;
    allowCustomDomain: boolean;
    allowCustomBranding: boolean;
    ssoEnabled: boolean;
    apiAccessEnabled: boolean;
  };
}

// API 데이터를 폼 상태로 변환
const toFormState = (data: TenantDetail): TenantFormState => ({
  name: data.name,
  code: data.code,
  status: data.status,
  plan: data.plan,
  customDomain: data.customDomain || '',
  createdAt: data.createdAt,
  adminName: data.adminName,
  adminEmail: data.adminEmail,
  userCount: data.userCount || 0,
  courseCount: data.courseCount || 0,
  branding: {
    logoUrl: data.branding?.logoUrl || '',
    primaryColor: data.branding?.primaryColor || '#4C2D9A',
    secondaryColor: data.branding?.secondaryColor || '#3D2478',
    faviconUrl: data.branding?.faviconUrl || '',
  },
  settings: {
    maxUsersCount: data.settings?.maxUsersCount || 100,
    maxCourses: data.settings?.maxCourses || 50,
    maxStorageGB: data.settings?.maxStorageGB || 10,
    allowCustomDomain: data.settings?.allowCustomDomain || false,
    allowCustomBranding: data.settings?.allowCustomBranding || false,
    ssoEnabled: data.settings?.ssoEnabled || false,
    apiAccessEnabled: data.settings?.apiAccessEnabled || false,
  },
});

// 로딩 스켈레톤
function TenantDetailSkeleton() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// 에러 UI
function TenantDetailError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">데이터를 불러올 수 없습니다</h3>
            <p className="text-text-secondary mb-4">{message}</p>
            <Button onClick={onRetry}>다시 시도</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantId = Number(id);

  // 데모 모드 체크 (?demo=true)
  const isDemoMode = searchParams.get('demo') === 'true';

  // API 호출 (데모 모드가 아닐 때만)
  const { data: tenantData, isLoading, isError, error, refetch } = useTenant(tenantId);
  const updateMutation = useUpdateTenant();
  const deleteMutation = useDeleteTenant();

  // 실제 데이터 또는 Mock 데이터
  const effectiveData = useMemo(() => {
    if (isDemoMode) return MOCK_TENANT;
    return tenantData;
  }, [isDemoMode, tenantData]);

  // 폼 상태
  const [formState, setFormState] = useState<TenantFormState | null>(null);

  // 데이터 로드 시 폼 상태 초기화
  useEffect(() => {
    if (effectiveData) {
      setFormState(toFormState(effectiveData));
    }
  }, [effectiveData]);

  const handleSave = async () => {
    if (!formState) return;

    try {
      // 백엔드 UpdateTenantRequest DTO에 맞는 필드만 전송
      await updateMutation.mutateAsync({
        id: tenantId,
        request: {
          name: formState.name,
          status: formState.status,
          plan: formState.plan,
          customDomain: formState.customDomain || undefined,
        },
      });
      toast.success('테넌트 정보가 수정되었습니다.');
    } catch (err) {
      console.error('Failed to save tenant:', err);
      toast.error('테넌트 정보 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 테넌트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(tenantId);
      toast.success('테넌트가 삭제되었습니다.');
      navigate('/sa/tenants');
    } catch (err) {
      console.error('Failed to delete tenant:', err);
      toast.error('테넌트 삭제에 실패했습니다.');
    }
  };

  const handleStatusChange = (status: TenantStatus) => {
    if (formState) setFormState({ ...formState, status });
  };

  const handlePlanChange = (plan: PlanType) => {
    if (formState) setFormState({ ...formState, plan });
  };

  const handleBrandingChange = (key: keyof TenantFormState['branding'], value: string) => {
    if (formState) {
      setFormState({
        ...formState,
        branding: { ...formState.branding, [key]: value },
      });
    }
  };

  const handleSettingChange = (key: keyof TenantFormState['settings'], value: boolean | number) => {
    if (formState) {
      setFormState({
        ...formState,
        settings: { ...formState.settings, [key]: value },
      });
    }
  };

  // 로딩 상태 (데모 모드가 아닐 때만)
  if (!isDemoMode && isLoading) {
    return <TenantDetailSkeleton />;
  }

  // 에러 상태 (데모 모드가 아닐 때만)
  if (!isDemoMode && isError) {
    return (
      <TenantDetailError
        message={error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
        onRetry={() => refetch()}
      />
    );
  }

  // 데이터 없음
  if (!formState) {
    return <TenantDetailSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title={formState.name}
        description={`테넌트 코드: ${formState.code}`}
        breadcrumb={[
          { label: '테넌트 관리', href: '/sa/tenants' },
          { label: formState.name },
        ]}
        actions={
          <div className="flex gap-2">
            <BackButton onClick={() => navigate('/sa/tenants')} />
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              저장
            </Button>
          </div>
        }
      />

      {/* 상태 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">상태</p>
                <div className="mt-1">
                  <StatusBadge status={formState.status} />
                </div>
              </div>
              <Building2 className="h-8 w-8 text-text-secondary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">플랜</p>
                <div className="mt-1">
                  <PlanBadge plan={formState.plan} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-text-secondary">사용자</p>
              <p className="text-2xl font-bold mt-1">
                {formState.userCount.toLocaleString()}
                <span className="text-sm font-normal text-text-secondary ml-1">
                  / {formState.settings.maxUsersCount.toLocaleString()}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-text-secondary">강좌</p>
              <p className="text-2xl font-bold mt-1">
                {formState.courseCount}
                <span className="text-sm font-normal text-text-secondary ml-1">
                  / {formState.settings.maxCourses}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">
            <Info className="w-4 h-4 mr-2" />
            기본 정보
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="w-4 h-4 mr-2" />
            브랜딩 설정
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            테넌트 설정
          </TabsTrigger>
        </TabsList>

        {/* 기본 정보 탭 */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>테넌트의 기본 정보를 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">테넌트명</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">테넌트 코드</Label>
                  <Input
                    id="code"
                    value={formState.code}
                    disabled
                    className="bg-bg-secondary"
                  />
                  <p className="text-xs text-text-secondary">테넌트 코드는 변경할 수 없습니다.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select value={formState.status || ''} onValueChange={(v) => handleStatusChange(v as TenantStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">활성</SelectItem>
                      <SelectItem value="SUSPENDED">정지</SelectItem>
                      <SelectItem value="PENDING">대기</SelectItem>
                      <SelectItem value="TERMINATED">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">플랜</Label>
                  <Select value={formState.plan || ''} onValueChange={(v) => handlePlanChange(v as PlanType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">커스텀 도메인</Label>
                  <Input
                    id="domain"
                    value={formState.customDomain}
                    onChange={(e) => setFormState({ ...formState, customDomain: e.target.value })}
                    placeholder="learn.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createdAt">생성일</Label>
                  <Input
                    id="createdAt"
                    value={formState.createdAt}
                    disabled
                    className="bg-bg-secondary"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">관리자 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">관리자명</Label>
                    <Input
                      id="adminName"
                      value={formState.adminName}
                      onChange={(e) => setFormState({ ...formState, adminName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">관리자 이메일</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={formState.adminEmail}
                      onChange={(e) => setFormState({ ...formState, adminEmail: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 브랜딩 설정 탭 */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>브랜딩 설정</CardTitle>
              <CardDescription>테넌트의 로고, 색상 등 브랜딩을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 로고 업로드 */}
              <div className="space-y-4">
                <Label>로고</Label>
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-bg-secondary">
                    {formState.branding.logoUrl ? (
                      <img
                        src={formState.branding.logoUrl}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-text-secondary" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      로고 업로드
                    </Button>
                    {formState.branding.logoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleBrandingChange('logoUrl', '')}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </Button>
                    )}
                    <p className="text-xs text-text-secondary">
                      권장 크기: 200x200px, PNG 또는 SVG
                    </p>
                  </div>
                </div>
              </div>

              {/* 파비콘 업로드 */}
              <div className="space-y-4">
                <Label>파비콘</Label>
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center bg-bg-secondary">
                    {formState.branding.faviconUrl ? (
                      <img
                        src={formState.branding.faviconUrl}
                        alt="Favicon"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-text-secondary" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      파비콘 업로드
                    </Button>
                    <p className="text-xs text-text-secondary">
                      권장 크기: 32x32px, ICO 또는 PNG
                    </p>
                  </div>
                </div>
              </div>

              {/* 색상 설정 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">주 색상 (Primary)</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-lg border cursor-pointer"
                      style={{ backgroundColor: formState.branding.primaryColor }}
                    />
                    <Input
                      id="primaryColor"
                      value={formState.branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                      placeholder="#4C2D9A"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">보조 색상 (Secondary)</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-lg border cursor-pointer"
                      style={{ backgroundColor: formState.branding.secondaryColor }}
                    />
                    <Input
                      id="secondaryColor"
                      value={formState.branding.secondaryColor}
                      onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                      placeholder="#3D2478"
                    />
                  </div>
                </div>
              </div>

              {/* 미리보기 */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">미리보기</h4>
                <div className="p-4 border rounded-lg">
                  <div
                    className="h-12 rounded-lg flex items-center px-4 text-white font-medium"
                    style={{ backgroundColor: formState.branding.primaryColor }}
                  >
                    {formState.name} 학습 플랫폼
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="px-4 py-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: formState.branding.primaryColor }}
                    >
                      주 버튼
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: formState.branding.secondaryColor }}
                    >
                      보조 버튼
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 테넌트 설정 탭 */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>테넌트 설정</CardTitle>
              <CardDescription>테넌트의 기능 제한 및 권한을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 제한 설정 */}
              <div>
                <h4 className="font-medium mb-4">리소스 제한</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxUsers">최대 사용자 수</Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      value={formState.settings.maxUsersCount}
                      onChange={(e) => handleSettingChange('maxUsersCount', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-text-secondary">
                      현재: {formState.userCount}명 사용 중
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCourses">최대 강좌 수</Label>
                    <Input
                      id="maxCourses"
                      type="number"
                      value={formState.settings.maxCourses}
                      onChange={(e) => handleSettingChange('maxCourses', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-text-secondary">
                      현재: {formState.courseCount}개 사용 중
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStorage">최대 저장 용량 (GB)</Label>
                    <Input
                      id="maxStorage"
                      type="number"
                      value={formState.settings.maxStorageGB}
                      onChange={(e) => handleSettingChange('maxStorageGB', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* 기능 설정 */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">기능 설정</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">커스텀 도메인</p>
                      <p className="text-sm text-text-secondary">
                        자체 도메인으로 학습 플랫폼 접속 허용
                      </p>
                    </div>
                    <Switch
                      checked={formState.settings.allowCustomDomain}
                      onCheckedChange={(checked) => handleSettingChange('allowCustomDomain', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">커스텀 브랜딩</p>
                      <p className="text-sm text-text-secondary">
                        로고, 색상 등 브랜딩 커스터마이징 허용
                      </p>
                    </div>
                    <Switch
                      checked={formState.settings.allowCustomBranding}
                      onCheckedChange={(checked) => handleSettingChange('allowCustomBranding', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">SSO (Single Sign-On)</p>
                      <p className="text-sm text-text-secondary">
                        SAML, OAuth 등 SSO 연동 허용
                      </p>
                    </div>
                    <Switch
                      checked={formState.settings.ssoEnabled}
                      onCheckedChange={(checked) => handleSettingChange('ssoEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">API 접근</p>
                      <p className="text-sm text-text-secondary">
                        REST API를 통한 데이터 접근 허용
                      </p>
                    </div>
                    <Switch
                      checked={formState.settings.apiAccessEnabled}
                      onCheckedChange={(checked) => handleSettingChange('apiAccessEnabled', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* 위험 영역 */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4 text-red-600">위험 영역</h4>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-600">테넌트 삭제</p>
                      <p className="text-sm text-text-secondary">
                        이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      테넌트 삭제
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
