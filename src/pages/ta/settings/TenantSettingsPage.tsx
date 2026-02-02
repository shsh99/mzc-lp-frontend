import { useEffect, useState } from 'react';
import {
  Save,
  RotateCcw,
  Palette,
  Users,
  Settings2,
  Gauge,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Switch } from '@/components/common/Switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import {
  useTenantSettings,
  useUpdateTenantSettings,
} from '@/hooks/ta';
import type { UpdateTenantSettingsRequest } from '@/types/admin';

export function TenantSettingsPage() {
  const { data: settings, isLoading } = useTenantSettings();
  const updateMutation = useUpdateTenantSettings();

  const [formData, setFormData] = useState<UpdateTenantSettingsRequest>({
    logoUrl: null,
    faviconUrl: null,
    primaryColor: null,
    secondaryColor: null,
    allowSelfRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: 'USER',
    maxUsers: null,
    maxStorage: null,
    maxCourses: null,
    enableDiscussions: true,
    enableCertificates: true,
    enableAnalytics: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        allowSelfRegistration: settings.allowSelfRegistration,
        requireEmailVerification: settings.requireEmailVerification,
        defaultUserRole: settings.defaultUserRole,
        maxUsers: settings.maxUsers,
        maxStorage: settings.maxStorage,
        maxCourses: settings.maxCourses,
        enableDiscussions: settings.enableDiscussions,
        enableCertificates: settings.enableCertificates,
        enableAnalytics: settings.enableAnalytics,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateMutation.mutateAsync(formData);
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        allowSelfRegistration: settings.allowSelfRegistration,
        requireEmailVerification: settings.requireEmailVerification,
        defaultUserRole: settings.defaultUserRole,
        maxUsers: settings.maxUsers,
        maxStorage: settings.maxStorage,
        maxCourses: settings.maxCourses,
        enableDiscussions: settings.enableDiscussions,
        enableCertificates: settings.enableCertificates,
        enableAnalytics: settings.enableAnalytics,
      });
    }
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
        title="테넌트 설정"
        description="테넌트 전반적인 설정을 관리합니다"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Branding Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-brand-primary" />
              <CardTitle>브랜딩 설정</CardTitle>
            </div>
            <CardDescription>로고와 색상을 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>로고 URL</Label>
                <Input
                  value={formData.logoUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    logoUrl: e.target.value || null,
                  })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label>파비콘 URL</Label>
                <Input
                  value={formData.faviconUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    faviconUrl: e.target.value || null,
                  })}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>기본 색상</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.primaryColor || '#4C2D9A'}
                    onChange={(e) => setFormData({
                      ...formData,
                      primaryColor: e.target.value,
                    })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.primaryColor || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      primaryColor: e.target.value || null,
                    })}
                    placeholder="#4C2D9A"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>보조 색상</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.secondaryColor || '#3D2478'}
                    onChange={(e) => setFormData({
                      ...formData,
                      secondaryColor: e.target.value,
                    })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.secondaryColor || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      secondaryColor: e.target.value || null,
                    })}
                    placeholder="#3D2478"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-primary" />
              <CardTitle>사용자 관리</CardTitle>
            </div>
            <CardDescription>사용자 등록 및 인증 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">자체 회원가입 허용</p>
                <p className="text-sm text-text-secondary">사용자가 직접 계정을 생성할 수 있습니다</p>
              </div>
              <Switch
                checked={formData.allowSelfRegistration}
                onCheckedChange={(v) => setFormData({
                  ...formData,
                  allowSelfRegistration: v,
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">이메일 인증 필수</p>
                <p className="text-sm text-text-secondary">가입 시 이메일 인증을 요구합니다</p>
              </div>
              <Switch
                checked={formData.requireEmailVerification}
                onCheckedChange={(v) => setFormData({
                  ...formData,
                  requireEmailVerification: v,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>기본 사용자 역할</Label>
              <Select
                value={formData.defaultUserRole}
                onValueChange={(v) => setFormData({
                  ...formData,
                  defaultUserRole: v,
                })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">일반 사용자</SelectItem>
                  <SelectItem value="OPERATOR">운영자</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Limits */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-brand-primary" />
                <CardTitle>제한 설정</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>최대 사용자 수</Label>
                <Input
                  type="number"
                  value={formData.maxUsers || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    maxUsers: e.target.value ? Number(e.target.value) : null,
                  })}
                  placeholder="무제한"
                />
              </div>
              <div className="space-y-2">
                <Label>최대 저장 용량 (GB)</Label>
                <Input
                  type="number"
                  value={formData.maxStorage || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    maxStorage: e.target.value ? Number(e.target.value) : null,
                  })}
                  placeholder="무제한"
                />
              </div>
              <div className="space-y-2">
                <Label>최대 강좌 수</Label>
                <Input
                  type="number"
                  value={formData.maxCourses || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    maxCourses: e.target.value ? Number(e.target.value) : null,
                  })}
                  placeholder="무제한"
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-brand-primary" />
                <CardTitle>기능 설정</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">토론 기능</span>
                <Switch
                  checked={formData.enableDiscussions}
                  onCheckedChange={(v) => setFormData({
                    ...formData,
                    enableDiscussions: v,
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">수료증 발급</span>
                <Switch
                  checked={formData.enableCertificates}
                  onCheckedChange={(v) => setFormData({
                    ...formData,
                    enableCertificates: v,
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">분석 기능</span>
                <Switch
                  checked={formData.enableAnalytics}
                  onCheckedChange={(v) => setFormData({
                    ...formData,
                    enableAnalytics: v,
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
