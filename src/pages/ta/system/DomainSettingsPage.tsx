import { useState, useEffect } from 'react';
import {
  Globe,
  ExternalLink,
  Save,
  Trash2,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Switch } from '@/components/common/Switch';
import { domainSettingsService } from '@/services/ta/domainSettingsService';
import type { TenantDomainSettings } from '@/types/admin/domain.types';

const SUBDOMAIN_SITE_BASE_URL = 'https://mzc-lp-frontend.vercel.app';

export function DomainSettingsPage() {
  const [settings, setSettings] = useState<TenantDomainSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 커스텀 도메인 입력 상태
  const [customDomainEnabled, setCustomDomainEnabled] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');

  // 개발 환경 여부 확인
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // 표시할 도메인 URL 계산
  const getDisplayUrl = () => {
    if (!settings) return '';
    if (isDev) {
      // 개발 환경: localhost:3000/subdomain 형식
      return `${window.location.origin}/${settings.subdomain}`;
    }
    // 운영 환경: subdomain.basedomain.com 형식
    return settings.fullSubdomainUrl;
  };

  const getResolvedSubdomain = () => {
    if (!settings) return '';

    const subdomain = settings.subdomain?.trim();
    if (subdomain) return subdomain;

    return settings.fullSubdomainUrl?.split('.')[0] ?? '';
  };

  // 사이트 열기 URL (홈 화면으로 이동)
  const getSiteUrl = () => {
    if (!settings) return '';
    const subdomain = getResolvedSubdomain();
    if (isDev) {
      // 개발 환경: localhost:3000/subdomain/tu/b2c/
      return subdomain ? `${window.location.origin}/${subdomain}/tu/b2c/` : '';
    }
    // 운영 환경: subdomain.basedomain.com/tu/b2c/
    if (!subdomain) return '';
    return new URL(`/${subdomain}/tu/b2c/`, SUBDOMAIN_SITE_BASE_URL).toString();
  };

  // 커스텀 도메인 사이트 열기 URL
  const getCustomDomainSiteUrl = () => {
    if (!settings?.customDomain) return '';
    if (isDev) {
      // 개발 환경: localhost:3000/customDomain/tu/b2c/
      return `${window.location.origin}/${settings.customDomain}/tu/b2c/`;
    }
    // 운영 환경: customdomain.com/tu/b2c/
    return `https://${settings.customDomain}/tu/b2c/`;
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await domainSettingsService.getSettings();
      setSettings(data);
      setCustomDomainEnabled(data.customDomainEnabled);
      setCustomDomainInput(data.customDomain || '');
    } catch (error) {
      console.error('Failed to fetch domain settings:', error);
      toast.error('도메인 설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 커스텀 도메인 저장
  const handleSaveCustomDomain = async () => {
    if (!customDomainInput.trim()) {
      toast.error('도메인 주소를 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      const data = await domainSettingsService.updateCustomDomain({
        customDomain: customDomainInput.trim(),
      });
      setSettings(data);
      toast.success('커스텀 도메인이 저장되었습니다.');
    } catch (error: unknown) {
      console.error('Failed to save custom domain:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || '커스텀 도메인 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 커스텀 도메인 삭제
  const handleDeleteCustomDomain = async () => {
    if (!confirm('커스텀 도메인을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      await domainSettingsService.deleteCustomDomain();
      setSettings((prev) => prev ? {
        ...prev,
        customDomain: null,
        customDomainEnabled: false,
        dnsInstructions: null,
      } : null);
      setCustomDomainEnabled(false);
      setCustomDomainInput('');
      toast.success('커스텀 도메인이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete custom domain:', error);
      toast.error('커스텀 도메인 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  // 커스텀 도메인 활성화/비활성화 토글
  const handleToggleCustomDomain = (enabled: boolean) => {
    setCustomDomainEnabled(enabled);
    if (!enabled && settings?.customDomain) {
      // 비활성화 시 삭제 확인
      handleDeleteCustomDomain();
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <AdminPageHeader
          title="도메인 설정"
          description="테넌트 도메인을 관리합니다"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <AdminPageHeader
          title="도메인 설정"
          description="테넌트 도메인을 관리합니다"
        />
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            도메인 설정을 불러올 수 없습니다.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="도메인 설정"
        description="테넌트 도메인을 관리합니다"
      />

      <div className="space-y-6">
        {/* 기본 도메인 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 도메인</CardTitle>
            <CardDescription>테넌트에 할당된 기본 도메인입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-brand-primary" />
                <span className="font-medium">서브도메인</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{getDisplayUrl()}</p>
              <a
                href={getSiteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-primary flex items-center gap-1 mt-2 hover:underline"
              >
                사이트 열기 <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 커스텀 도메인 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>커스텀 도메인</CardTitle>
                <CardDescription>자체 도메인을 연결하여 사용할 수 있습니다</CardDescription>
              </div>
              <Switch
                checked={customDomainEnabled}
                onCheckedChange={handleToggleCustomDomain}
              />
            </div>
          </CardHeader>
          {customDomainEnabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>도메인 주소</Label>
                <div className="flex gap-2">
                  <Input
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder="learn.example.com"
                    disabled={saving || deleting}
                  />
                  <Button
                    onClick={handleSaveCustomDomain}
                    disabled={saving || deleting || !customDomainInput.trim()}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        저장
                      </>
                    )}
                  </Button>
                  {settings.customDomain && (
                    <Button
                      variant="outline"
                      onClick={handleDeleteCustomDomain}
                      disabled={saving || deleting}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* DNS 설정 안내 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">DNS 설정 안내</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      커스텀 도메인을 사용하려면 DNS 관리자에서 다음 레코드를 추가하세요:
                    </p>
                    <div className="space-y-2 text-sm font-mono bg-white p-3 rounded border border-blue-200">
                      <div className="flex gap-4">
                        <span className="text-gray-500 w-16">Type:</span>
                        <span className="font-semibold">CNAME</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-500 w-16">Name:</span>
                        <span className="font-semibold">{customDomainInput || 'your-domain.com'}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-500 w-16">Value:</span>
                        <span className="font-semibold">{settings.fullSubdomainUrl}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 현재 설정된 커스텀 도메인 표시 */}
              {settings.customDomain && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">
                      현재 설정된 커스텀 도메인: <strong>{settings.customDomain}</strong>
                    </span>
                  </div>
                  <a
                    href={getCustomDomainSiteUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 flex items-center gap-1 mt-2 ml-7 hover:underline"
                  >
                    사이트 열기 <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
