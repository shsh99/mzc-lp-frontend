import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Shield,
  Database,
  Mail,
  Loader2,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
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
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/sa';
import type { UpdateSystemSettingsRequest } from '@/services/sa/systemSettingsService';

// 로컬 설정 타입
interface LocalSettings {
  general: {
    platformName: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordExpiry: number;
    mfaRequired: boolean;
    ipWhitelist: string;
  };
  storage: {
    maxUploadSize: number;
    allowedFormats: string;
    autoCleanup: boolean;
    cleanupDays: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    useTls: boolean;
  };
}

// 기본 설정값
const defaultSettings: LocalSettings = {
  general: {
    platformName: 'MZC Learn Platform',
    timezone: 'Asia/Seoul',
    language: 'ko',
    maintenanceMode: false,
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    mfaRequired: false,
    ipWhitelist: '',
  },
  storage: {
    maxUploadSize: 500,
    allowedFormats: 'mp4,webm,pdf,pptx,docx',
    autoCleanup: true,
    cleanupDays: 30,
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    useTls: true,
  },
};

export function SystemSettingsPage() {
  const [settings, setSettings] = useState<LocalSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: serverSettings, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();

  // 서버 데이터로 초기화
  useEffect(() => {
    if (serverSettings) {
      setSettings({
        general: {
          platformName: serverSettings.general.platformName,
          timezone: serverSettings.general.timezone,
          language: serverSettings.general.language,
          maintenanceMode: serverSettings.general.maintenanceMode,
        },
        security: {
          sessionTimeout: serverSettings.security.sessionTimeout,
          maxLoginAttempts: serverSettings.security.maxLoginAttempts,
          passwordExpiry: serverSettings.security.passwordExpiry,
          mfaRequired: serverSettings.security.mfaRequired,
          ipWhitelist: serverSettings.security.ipWhitelist || '',
        },
        storage: {
          maxUploadSize: serverSettings.storage.maxUploadSize,
          allowedFormats: serverSettings.storage.allowedFormats,
          autoCleanup: serverSettings.storage.autoCleanup,
          cleanupDays: serverSettings.storage.cleanupDays,
        },
        email: {
          smtpHost: serverSettings.email.smtpHost || '',
          smtpPort: serverSettings.email.smtpPort,
          smtpUser: serverSettings.email.smtpUser || '',
          useTls: serverSettings.email.useTls,
        },
      });
      setHasChanges(false);
    }
  }, [serverSettings]);

  const handleReset = () => {
    if (serverSettings) {
      setSettings({
        general: {
          platformName: serverSettings.general.platformName,
          timezone: serverSettings.general.timezone,
          language: serverSettings.general.language,
          maintenanceMode: serverSettings.general.maintenanceMode,
        },
        security: {
          sessionTimeout: serverSettings.security.sessionTimeout,
          maxLoginAttempts: serverSettings.security.maxLoginAttempts,
          passwordExpiry: serverSettings.security.passwordExpiry,
          mfaRequired: serverSettings.security.mfaRequired,
          ipWhitelist: serverSettings.security.ipWhitelist || '',
        },
        storage: {
          maxUploadSize: serverSettings.storage.maxUploadSize,
          allowedFormats: serverSettings.storage.allowedFormats,
          autoCleanup: serverSettings.storage.autoCleanup,
          cleanupDays: serverSettings.storage.cleanupDays,
        },
        email: {
          smtpHost: serverSettings.email.smtpHost || '',
          smtpPort: serverSettings.email.smtpPort,
          smtpUser: serverSettings.email.smtpUser || '',
          useTls: serverSettings.email.useTls,
        },
      });
      setHasChanges(false);
    }
  };

  const handleSave = () => {
    const request: UpdateSystemSettingsRequest = {
      platformName: settings.general.platformName,
      timezone: settings.general.timezone,
      language: settings.general.language,
      maintenanceMode: settings.general.maintenanceMode,
      sessionTimeout: settings.security.sessionTimeout,
      maxLoginAttempts: settings.security.maxLoginAttempts,
      passwordExpiry: settings.security.passwordExpiry,
      mfaRequired: settings.security.mfaRequired,
      ipWhitelist: settings.security.ipWhitelist || null,
      maxUploadSize: settings.storage.maxUploadSize,
      allowedFormats: settings.storage.allowedFormats,
      autoCleanup: settings.storage.autoCleanup,
      cleanupDays: settings.storage.cleanupDays,
      smtpHost: settings.email.smtpHost || null,
      smtpPort: settings.email.smtpPort,
      smtpUser: settings.email.smtpUser || null,
      useTls: settings.email.useTls,
    };

    updateSettings.mutate(request, {
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
        title="시스템 설정"
        description="플랫폼 전역 시스템 설정을 관리합니다"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || updateSettings.isPending}>
              {updateSettings.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              저장
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-brand-primary" />
              <CardTitle>일반 설정</CardTitle>
            </div>
            <CardDescription>기본 플랫폼 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>플랫폼 이름</Label>
                <Input
                  value={settings.general.platformName}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      general: { ...settings.general, platformName: e.target.value },
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>타임존</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(v) => {
                    setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: v },
                    });
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Seoul">Asia/Seoul (KST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">유지보수 모드</p>
                <p className="text-sm text-text-secondary">활성화 시 관리자만 접근 가능합니다</p>
              </div>
              <Switch
                checked={settings.general.maintenanceMode}
                onCheckedChange={(v) => {
                  setSettings({
                    ...settings,
                    general: { ...settings.general, maintenanceMode: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-primary" />
              <CardTitle>보안 설정</CardTitle>
            </div>
            <CardDescription>인증 및 보안 관련 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>세션 타임아웃 (분)</Label>
                <Input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: Number(e.target.value) },
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>최대 로그인 시도</Label>
                <Input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: Number(e.target.value) },
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>비밀번호 만료일 (일)</Label>
                <Input
                  type="number"
                  value={settings.security.passwordExpiry}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      security: { ...settings.security, passwordExpiry: Number(e.target.value) },
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>IP 화이트리스트</Label>
              <Input
                placeholder="예: 192.168.1.0/24, 10.0.0.1"
                value={settings.security.ipWhitelist}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    security: { ...settings.security, ipWhitelist: e.target.value },
                  });
                  setHasChanges(true);
                }}
              />
              <p className="text-xs text-text-secondary">비워두면 모든 IP에서 접근 가능합니다</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">MFA 필수 적용</p>
                <p className="text-sm text-text-secondary">모든 사용자에게 다중 인증을 요구합니다</p>
              </div>
              <Switch
                checked={settings.security.mfaRequired}
                onCheckedChange={(v) => {
                  setSettings({
                    ...settings,
                    security: { ...settings.security, mfaRequired: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-brand-primary" />
              <CardTitle>스토리지 설정</CardTitle>
            </div>
            <CardDescription>파일 업로드 및 저장소 관련 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>최대 업로드 크기 (MB)</Label>
                <Input
                  type="number"
                  value={settings.storage.maxUploadSize}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      storage: { ...settings.storage, maxUploadSize: Number(e.target.value) },
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>자동 정리 기간 (일)</Label>
                <Input
                  type="number"
                  value={settings.storage.cleanupDays}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      storage: { ...settings.storage, cleanupDays: Number(e.target.value) },
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>허용 파일 형식</Label>
              <Input
                value={settings.storage.allowedFormats}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    storage: { ...settings.storage, allowedFormats: e.target.value },
                  });
                  setHasChanges(true);
                }}
              />
              <p className="text-xs text-text-secondary">쉼표로 구분하여 입력</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">자동 정리 활성화</p>
                <p className="text-sm text-text-secondary">사용하지 않는 파일을 자동으로 정리합니다</p>
              </div>
              <Switch
                checked={settings.storage.autoCleanup}
                onCheckedChange={(v) => {
                  setSettings({
                    ...settings,
                    storage: { ...settings.storage, autoCleanup: v },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-primary" />
              <CardTitle>이메일 설정</CardTitle>
            </div>
            <CardDescription>SMTP 서버 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SMTP 호스트</Label>
                <Input
                  value={settings.email.smtpHost}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpHost: e.target.value },
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP 포트</Label>
                <Input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPort: Number(e.target.value) },
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>SMTP 사용자</Label>
              <Input
                value={settings.email.smtpUser}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    email: { ...settings.email, smtpUser: e.target.value },
                  });
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">TLS 사용</p>
                <p className="text-sm text-text-secondary">보안 연결을 사용합니다</p>
              </div>
              <Switch
                checked={settings.email.useTls}
                onCheckedChange={(v) => {
                  setSettings({
                    ...settings,
                    email: { ...settings.email, useTls: v },
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
