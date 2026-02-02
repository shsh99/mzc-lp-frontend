import { useState } from 'react';
import {
  Palette,
  Upload,
  Trash2,
  Save,
  RotateCcw,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Tabs, TabsList, TabsTrigger } from '@/components/common/Tabs';

// Mock 데이터
const mockBranding = {
  logo: {
    lightUrl: '',
    darkUrl: '',
  },
  favicon: '',
  colors: {
    primary: '#4C2D9A',
    secondary: '#3D2478',
    accent: '#10B981',
    background: '#FFFFFF',
    text: '#1F2937',
  },
  fonts: {
    heading: 'Pretendard',
    body: 'Pretendard',
  },
  customCss: '',
};

export function BrandingSettingsPage() {
  const [branding, setBranding] = useState(mockBranding);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  const handleColorChange = (key: string, value: string) => {
    setBranding({
      ...branding,
      colors: { ...branding.colors, [key]: value },
    });
  };

  const handleReset = () => {
    setBranding(mockBranding);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="글로벌 브랜딩 설정"
        description="플랫폼 전체에 적용되는 브랜딩을 설정합니다"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo & Favicon */}
          <Card>
            <CardHeader>
              <CardTitle>로고 및 파비콘</CardTitle>
              <CardDescription>플랫폼에 표시되는 로고와 파비콘을 설정합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Light Logo */}
                <div>
                  <Label>라이트 모드 로고</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center bg-white">
                    {branding.logo.lightUrl ? (
                      <img src={branding.logo.lightUrl} alt="Light Logo" className="max-h-16 mx-auto" />
                    ) : (
                      <div className="text-text-secondary">
                        <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">로고 없음</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      업로드
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Dark Logo */}
                <div>
                  <Label>다크 모드 로고</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center bg-gray-900">
                    {branding.logo.darkUrl ? (
                      <img src={branding.logo.darkUrl} alt="Dark Logo" className="max-h-16 mx-auto" />
                    ) : (
                      <div className="text-gray-400">
                        <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">로고 없음</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      업로드
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <Label>파비콘</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center bg-bg-secondary">
                    {branding.favicon ? (
                      <img src={branding.favicon} alt="Favicon" className="w-8 h-8" />
                    ) : (
                      <Palette className="h-6 w-6 text-text-secondary opacity-50" />
                    )}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      업로드
                    </Button>
                    <p className="text-xs text-text-secondary mt-1">권장: 32x32px, ICO 또는 PNG</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>색상 설정</CardTitle>
              <CardDescription>플랫폼의 주요 색상을 설정합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(branding.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">
                      {key === 'primary' ? '주 색상' :
                       key === 'secondary' ? '보조 색상' :
                       key === 'accent' ? '강조 색상' :
                       key === 'background' ? '배경 색상' :
                       key === 'text' ? '텍스트 색상' : key}
                    </Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-lg border cursor-pointer"
                        style={{ backgroundColor: value }}
                      />
                      <Input
                        id={key}
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fonts */}
          <Card>
            <CardHeader>
              <CardTitle>폰트 설정</CardTitle>
              <CardDescription>플랫폼에서 사용할 폰트를 설정합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>제목 폰트</Label>
                  <Input value={branding.fonts.heading} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>본문 폰트</Label>
                  <Input value={branding.fonts.body} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>미리보기</CardTitle>
                <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'light' | 'dark')}>
                  <TabsList>
                    <TabsTrigger value="light">라이트</TabsTrigger>
                    <TabsTrigger value="dark">다크</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg overflow-hidden border"
                style={{
                  backgroundColor: previewMode === 'dark' ? '#1F2937' : branding.colors.background,
                }}
              >
                {/* Header Preview */}
                <div
                  className="p-4"
                  style={{ backgroundColor: branding.colors.primary }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">MZC Learn</span>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-white/20 rounded" />
                      <div className="w-6 h-6 bg-white/20 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="p-4 space-y-4">
                  <h3
                    className="font-semibold"
                    style={{ color: previewMode === 'dark' ? '#F9FAFB' : branding.colors.text }}
                  >
                    제목 텍스트
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: previewMode === 'dark' ? '#9CA3AF' : '#6B7280' }}
                  >
                    본문 텍스트 예시입니다.
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: branding.colors.primary }}
                    >
                      주 버튼
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: branding.colors.secondary }}
                    >
                      보조 버튼
                    </button>
                  </div>
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: branding.colors.accent + '20',
                      color: branding.colors.accent,
                    }}
                  >
                    강조 메시지
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
