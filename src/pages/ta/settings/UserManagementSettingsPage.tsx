import { useState } from 'react';
import {
  Users,
  Save,
  RotateCcw,
  UserPlus,
  Upload,
  Mail,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Switch } from '@/components/common/Switch';
import { Textarea } from '@/components/common/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';

// Mock 데이터
const mockUserSettings = {
  registration: {
    allowSelfRegistration: true,
    requireApproval: false,
    defaultRole: 'LEARNER',
    allowedDomains: 'megazone.com, mzcloud.com',
  },
  profile: {
    requiredFields: ['name', 'email', 'phone'],
    allowProfileEdit: true,
    allowAvatarUpload: true,
  },
  invitation: {
    enableInvitation: true,
    expirationDays: 7,
    maxInvitationsPerDay: 50,
    customMessage: '안녕하세요! MZC Learn 플랫폼에 초대합니다.',
  },
  bulkImport: {
    enabled: true,
    autoSendWelcomeEmail: true,
    defaultPassword: 'temp',
    forcePasswordChange: true,
  },
};

export function UserManagementSettingsPage() {
  const [settings, setSettings] = useState(mockUserSettings);

  const handleReset = () => {
    setSettings(mockUserSettings);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="사용자 관리 설정"
        description="사용자 등록 및 관리 정책을 설정합니다"
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

      <div className="grid grid-cols-2 gap-6">
        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-brand-primary" />
              <CardTitle>가입 설정</CardTitle>
            </div>
            <CardDescription>사용자 가입 관련 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">자체 회원가입 허용</p>
                <p className="text-sm text-text-secondary">사용자가 직접 가입 가능</p>
              </div>
              <Switch
                checked={settings.registration.allowSelfRegistration}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  registration: { ...settings.registration, allowSelfRegistration: v },
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">가입 승인 필요</p>
                <p className="text-sm text-text-secondary">관리자 승인 후 계정 활성화</p>
              </div>
              <Switch
                checked={settings.registration.requireApproval}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  registration: { ...settings.registration, requireApproval: v },
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>기본 역할</Label>
              <Select
                value={settings.registration.defaultRole}
                onValueChange={(v) => setSettings({
                  ...settings,
                  registration: { ...settings.registration, defaultRole: v },
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEARNER">학습자</SelectItem>
                  <SelectItem value="INSTRUCTOR">강사</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>허용 이메일 도메인</Label>
              <Input
                value={settings.registration.allowedDomains}
                onChange={(e) => setSettings({
                  ...settings,
                  registration: { ...settings.registration, allowedDomains: e.target.value },
                })}
                placeholder="예: company.com, domain.co.kr"
              />
              <p className="text-xs text-text-secondary">쉼표로 구분. 비워두면 모든 도메인 허용</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-primary" />
              <CardTitle>프로필 설정</CardTitle>
            </div>
            <CardDescription>사용자 프로필 관련 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>필수 입력 항목</Label>
              <div className="space-y-2">
                {['이름', '이메일', '전화번호', '부서', '직급'].map((field) => (
                  <label key={field} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      defaultChecked={['이름', '이메일', '전화번호'].includes(field)}
                    />
                    <span className="text-sm">{field}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">프로필 수정 허용</p>
                <p className="text-sm text-text-secondary">사용자가 직접 프로필 수정 가능</p>
              </div>
              <Switch
                checked={settings.profile.allowProfileEdit}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  profile: { ...settings.profile, allowProfileEdit: v },
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">아바타 업로드 허용</p>
                <p className="text-sm text-text-secondary">프로필 사진 업로드 가능</p>
              </div>
              <Switch
                checked={settings.profile.allowAvatarUpload}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  profile: { ...settings.profile, allowAvatarUpload: v },
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invitation Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-primary" />
              <CardTitle>초대 설정</CardTitle>
            </div>
            <CardDescription>사용자 초대 관련 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">초대 기능 사용</p>
                <p className="text-sm text-text-secondary">이메일로 사용자 초대 가능</p>
              </div>
              <Switch
                checked={settings.invitation.enableInvitation}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  invitation: { ...settings.invitation, enableInvitation: v },
                })}
              />
            </div>
            {settings.invitation.enableInvitation && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>초대 만료 기간 (일)</Label>
                    <Input
                      type="number"
                      value={settings.invitation.expirationDays}
                      onChange={(e) => setSettings({
                        ...settings,
                        invitation: { ...settings.invitation, expirationDays: Number(e.target.value) },
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>일일 최대 초대 수</Label>
                    <Input
                      type="number"
                      value={settings.invitation.maxInvitationsPerDay}
                      onChange={(e) => setSettings({
                        ...settings,
                        invitation: { ...settings.invitation, maxInvitationsPerDay: Number(e.target.value) },
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>초대 메시지</Label>
                  <Textarea
                    value={settings.invitation.customMessage}
                    onChange={(e) => setSettings({
                      ...settings,
                      invitation: { ...settings.invitation, customMessage: e.target.value },
                    })}
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bulk Import Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-brand-primary" />
              <CardTitle>일괄 등록 설정</CardTitle>
            </div>
            <CardDescription>CSV/Excel 일괄 등록 관련 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">일괄 등록 기능</p>
                <p className="text-sm text-text-secondary">파일로 사용자 일괄 등록 가능</p>
              </div>
              <Switch
                checked={settings.bulkImport.enabled}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  bulkImport: { ...settings.bulkImport, enabled: v },
                })}
              />
            </div>
            {settings.bulkImport.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">환영 이메일 자동 발송</p>
                    <p className="text-sm text-text-secondary">등록 완료 시 이메일 발송</p>
                  </div>
                  <Switch
                    checked={settings.bulkImport.autoSendWelcomeEmail}
                    onCheckedChange={(v) => setSettings({
                      ...settings,
                      bulkImport: { ...settings.bulkImport, autoSendWelcomeEmail: v },
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>기본 비밀번호 방식</Label>
                  <Select
                    value={settings.bulkImport.defaultPassword}
                    onValueChange={(v) => setSettings({
                      ...settings,
                      bulkImport: { ...settings.bulkImport, defaultPassword: v },
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temp">임시 비밀번호 생성</SelectItem>
                      <SelectItem value="email">이메일 앞부분</SelectItem>
                      <SelectItem value="phone">전화번호 뒷자리</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">첫 로그인 시 비밀번호 변경 필수</p>
                    <p className="text-sm text-text-secondary">보안을 위해 비밀번호 변경 요구</p>
                  </div>
                  <Switch
                    checked={settings.bulkImport.forcePasswordChange}
                    onCheckedChange={(v) => setSettings({
                      ...settings,
                      bulkImport: { ...settings.bulkImport, forcePasswordChange: v },
                    })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
