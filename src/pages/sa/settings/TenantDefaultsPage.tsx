import { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  Users,
  BookOpen,
  HardDrive,
  Palette,
  Loader2,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Switch } from '@/components/common/Switch';
import { useTenantDefaults, useUpdateTenantDefaults } from '@/hooks/sa';
import type { UpdateTenantDefaultsRequest } from '@/services/sa/systemSettingsService';

// 로컬 설정 타입
interface LocalDefaults {
  limits: {
    maxUsers: number;
    maxCourses: number;
    maxStorage: number;
    maxAdmins: number;
  };
  features: {
    customDomain: boolean;
    ssoIntegration: boolean;
    apiAccess: boolean;
    whiteLabeling: boolean;
    advancedAnalytics: boolean;
  };
  branding: {
    allowCustomLogo: boolean;
    allowCustomColors: boolean;
    allowCustomFonts: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
}

// 기본 설정값
const defaultSettings: LocalDefaults = {
  limits: {
    maxUsers: 100,
    maxCourses: 50,
    maxStorage: 50,
    maxAdmins: 5,
  },
  features: {
    customDomain: false,
    ssoIntegration: false,
    apiAccess: false,
    whiteLabeling: false,
    advancedAnalytics: false,
  },
  branding: {
    allowCustomLogo: true,
    allowCustomColors: true,
    allowCustomFonts: false,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
  },
};

export function TenantDefaultsPage() {
  const [defaults, setDefaults] = useState<LocalDefaults>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: serverDefaults, isLoading } = useTenantDefaults();
  const updateDefaults = useUpdateTenantDefaults();

  // 서버 데이터로 초기화
  useEffect(() => {
    if (serverDefaults) {
      setDefaults({
        limits: {
          maxUsers: serverDefaults.limits.maxUsers,
          maxCourses: serverDefaults.limits.maxCourses,
          maxStorage: serverDefaults.limits.maxStorage,
          maxAdmins: serverDefaults.limits.maxAdmins,
        },
        features: {
          customDomain: serverDefaults.features.customDomain,
          ssoIntegration: serverDefaults.features.ssoIntegration,
          apiAccess: serverDefaults.features.apiAccess,
          whiteLabeling: serverDefaults.features.whiteLabeling,
          advancedAnalytics: serverDefaults.features.advancedAnalytics,
        },
        branding: {
          allowCustomLogo: serverDefaults.branding.allowCustomLogo,
          allowCustomColors: serverDefaults.branding.allowCustomColors,
          allowCustomFonts: serverDefaults.branding.allowCustomFonts,
        },
        notifications: {
          emailNotifications: serverDefaults.notifications.emailNotifications,
          pushNotifications: serverDefaults.notifications.pushNotifications,
          smsNotifications: serverDefaults.notifications.smsNotifications,
        },
      });
      setHasChanges(false);
    }
  }, [serverDefaults]);

  const handleReset = () => {
    if (serverDefaults) {
      setDefaults({
        limits: {
          maxUsers: serverDefaults.limits.maxUsers,
          maxCourses: serverDefaults.limits.maxCourses,
          maxStorage: serverDefaults.limits.maxStorage,
          maxAdmins: serverDefaults.limits.maxAdmins,
        },
        features: {
          customDomain: serverDefaults.features.customDomain,
          ssoIntegration: serverDefaults.features.ssoIntegration,
          apiAccess: serverDefaults.features.apiAccess,
          whiteLabeling: serverDefaults.features.whiteLabeling,
          advancedAnalytics: serverDefaults.features.advancedAnalytics,
        },
        branding: {
          allowCustomLogo: serverDefaults.branding.allowCustomLogo,
          allowCustomColors: serverDefaults.branding.allowCustomColors,
          allowCustomFonts: serverDefaults.branding.allowCustomFonts,
        },
        notifications: {
          emailNotifications: serverDefaults.notifications.emailNotifications,
          pushNotifications: serverDefaults.notifications.pushNotifications,
          smsNotifications: serverDefaults.notifications.smsNotifications,
        },
      });
      setHasChanges(false);
    }
  };

  const handleSave = () => {
    const request: UpdateTenantDefaultsRequest = {
      maxUsers: defaults.limits.maxUsers,
      maxCourses: defaults.limits.maxCourses,
      maxStorage: defaults.limits.maxStorage,
      maxAdmins: defaults.limits.maxAdmins,
      customDomain: defaults.features.customDomain,
      ssoIntegration: defaults.features.ssoIntegration,
      apiAccess: defaults.features.apiAccess,
      whiteLabeling: defaults.features.whiteLabeling,
      advancedAnalytics: defaults.features.advancedAnalytics,
      allowCustomLogo: defaults.branding.allowCustomLogo,
      allowCustomColors: defaults.branding.allowCustomColors,
      allowCustomFonts: defaults.branding.allowCustomFonts,
      emailNotifications: defaults.notifications.emailNotifications,
      pushNotifications: defaults.notifications.pushNotifications,
      smsNotifications: defaults.notifications.smsNotifications,
    };

    updateDefaults.mutate(request, {
      onSuccess: () => {
        setHasChanges(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="테넌트 기본값 설정"
        description="새 테넌트 생성 시 적용되는 기본값을 설정합니다"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || updateDefaults.isPending}>
              {updateDefaults.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              저장
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Resource Limits */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-primary" />
              <CardTitle>리소스 제한</CardTitle>
            </div>
            <CardDescription>테넌트별 기본 리소스 제한입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                최대 사용자 수
              </Label>
              <Input
                type="number"
                value={defaults.limits.maxUsers}
                onChange={(e) => {
                  setDefaults({
                    ...defaults,
                    limits: { ...defaults.limits, maxUsers: Number(e.target.value) },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                최대 강좌 수
              </Label>
              <Input
                type="number"
                value={defaults.limits.maxCourses}
                onChange={(e) => {
                  setDefaults({
                    ...defaults,
                    limits: { ...defaults.limits, maxCourses: Number(e.target.value) },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                스토리지 용량 (GB)
              </Label>
              <Input
                type="number"
                value={defaults.limits.maxStorage}
                onChange={(e) => {
                  setDefaults({
                    ...defaults,
                    limits: { ...defaults.limits, maxStorage: Number(e.target.value) },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>최대 관리자 수</Label>
              <Input
                type="number"
                value={defaults.limits.maxAdmins}
                onChange={(e) => {
                  setDefaults({
                    ...defaults,
                    limits: { ...defaults.limits, maxAdmins: Number(e.target.value) },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>기능 활성화</CardTitle>
            <CardDescription>기본으로 활성화되는 기능입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">커스텀 도메인</p>
                <p className="text-sm text-text-secondary">자체 도메인 연결 허용</p>
              </div>
              <Switch
                checked={defaults.features.customDomain}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    features: { ...defaults.features, customDomain: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SSO 연동</p>
                <p className="text-sm text-text-secondary">Single Sign-On 통합</p>
              </div>
              <Switch
                checked={defaults.features.ssoIntegration}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    features: { ...defaults.features, ssoIntegration: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">API 접근</p>
                <p className="text-sm text-text-secondary">REST API 사용 허용</p>
              </div>
              <Switch
                checked={defaults.features.apiAccess}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    features: { ...defaults.features, apiAccess: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">화이트 라벨링</p>
                <p className="text-sm text-text-secondary">브랜드 커스터마이징</p>
              </div>
              <Switch
                checked={defaults.features.whiteLabeling}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    features: { ...defaults.features, whiteLabeling: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">고급 분석</p>
                <p className="text-sm text-text-secondary">상세 분석 리포트</p>
              </div>
              <Switch
                checked={defaults.features.advancedAnalytics}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    features: { ...defaults.features, advancedAnalytics: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding Permissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-brand-primary" />
              <CardTitle>브랜딩 권한</CardTitle>
            </div>
            <CardDescription>테넌트별 브랜딩 커스터마이징 권한입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">커스텀 로고</p>
                <p className="text-sm text-text-secondary">자체 로고 업로드 허용</p>
              </div>
              <Switch
                checked={defaults.branding.allowCustomLogo}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    branding: { ...defaults.branding, allowCustomLogo: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">커스텀 색상</p>
                <p className="text-sm text-text-secondary">색상 테마 변경 허용</p>
              </div>
              <Switch
                checked={defaults.branding.allowCustomColors}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    branding: { ...defaults.branding, allowCustomColors: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">커스텀 폰트</p>
                <p className="text-sm text-text-secondary">폰트 변경 허용</p>
              </div>
              <Switch
                checked={defaults.branding.allowCustomFonts}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    branding: { ...defaults.branding, allowCustomFonts: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Defaults */}
        <Card>
          <CardHeader>
            <CardTitle>알림 기본값</CardTitle>
            <CardDescription>기본 알림 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">이메일 알림</p>
                <p className="text-sm text-text-secondary">이메일로 알림 발송</p>
              </div>
              <Switch
                checked={defaults.notifications.emailNotifications}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    notifications: { ...defaults.notifications, emailNotifications: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">푸시 알림</p>
                <p className="text-sm text-text-secondary">브라우저 푸시 알림</p>
              </div>
              <Switch
                checked={defaults.notifications.pushNotifications}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    notifications: { ...defaults.notifications, pushNotifications: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS 알림</p>
                <p className="text-sm text-text-secondary">문자 메시지 알림</p>
              </div>
              <Switch
                checked={defaults.notifications.smsNotifications}
                onCheckedChange={(v) => {
                  setDefaults({
                    ...defaults,
                    notifications: { ...defaults.notifications, smsNotifications: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
