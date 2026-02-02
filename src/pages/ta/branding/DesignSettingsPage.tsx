import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Loader2 } from 'lucide-react';
import { useUpdateDesignSettings, useTenantSettings } from '@/hooks/ta/useTenantSettingsQueries';

/**
 * TA 디자인/브랜딩 설정 페이지
 */
export function DesignSettingsPage() {
  const { data: settings, isLoading } = useTenantSettings();
  const updateMutation = useUpdateDesignSettings();

  const [formData, setFormData] = useState({
    logoUrl: '',
    darkLogoUrl: '',
    faviconUrl: '',
    primaryColor: '#4C2D9A',
    secondaryColor: '#3D2478',
    accentColor: '#10B981',
    headingFont: 'Pretendard',
    bodyFont: 'Pretendard',
  });

  // 설정 로드 시 폼 데이터 초기화
  useEffect(() => {
    if (settings) {
      setFormData({
        logoUrl: settings.logoUrl || '',
        darkLogoUrl: settings.darkLogoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        primaryColor: settings.primaryColor || '#4C2D9A',
        secondaryColor: settings.secondaryColor || '#3D2478',
        accentColor: settings.accentColor || '#10B981',
        headingFont: settings.headingFont || 'Pretendard',
        bodyFont: settings.bodyFont || 'Pretendard',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      toast.success('디자인 설정이 저장되었습니다.');
    } catch {
      toast.error('디자인 설정 저장에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="디자인 설정"
        description="테넌트의 로고, 색상, 폰트 등 브랜딩을 설정합니다."
        breadcrumb={[
          { label: '홈', href: '/ta' },
          { label: '브랜딩', href: '/ta/branding' },
          { label: '디자인 설정' },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* 로고 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>로고 설정</CardTitle>
            <CardDescription>
              테넌트의 로고를 설정합니다. URL 형식으로 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">로고 URL (라이트 모드)</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="darkLogoUrl">로고 URL (다크 모드)</Label>
              <Input
                id="darkLogoUrl"
                value={formData.darkLogoUrl}
                onChange={(e) => setFormData({ ...formData, darkLogoUrl: e.target.value })}
                placeholder="https://example.com/logo-dark.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                value={formData.faviconUrl}
                onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </CardContent>
        </Card>

        {/* 색상 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>색상 설정</CardTitle>
            <CardDescription>
              테넌트의 브랜드 색상을 설정합니다. HEX 코드로 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder="#4C2D9A"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  placeholder="#3D2478"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  placeholder="#10B981"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 폰트 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>폰트 설정</CardTitle>
            <CardDescription>
              테넌트에서 사용할 폰트를 설정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headingFont">제목 폰트</Label>
              <Input
                id="headingFont"
                value={formData.headingFont}
                onChange={(e) => setFormData({ ...formData, headingFont: e.target.value })}
                placeholder="Pretendard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyFont">본문 폰트</Label>
              <Input
                id="bodyFont"
                value={formData.bodyFont}
                onChange={(e) => setFormData({ ...formData, bodyFont: e.target.value })}
                placeholder="Pretendard"
              />
            </div>
          </CardContent>
        </Card>

        {/* 미리보기 */}
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
            <CardDescription>
              설정한 색상과 폰트가 어떻게 보이는지 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: formData.primaryColor + '20',
                borderColor: formData.primaryColor,
              }}
            >
              <h3
                className="text-2xl font-bold mb-2"
                style={{
                  color: formData.primaryColor,
                  fontFamily: formData.headingFont,
                }}
              >
                제목 예시
              </h3>
              <p
                className="text-base"
                style={{
                  color: formData.secondaryColor,
                  fontFamily: formData.bodyFont,
                }}
              >
                본문 예시 텍스트입니다. 이렇게 표시됩니다.
              </p>
              <button
                className="mt-4 px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: formData.accentColor }}
              >
                버튼 예시
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          size="lg"
        >
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          저장
        </Button>
      </div>
    </div>
  );
}
