import {
  Users,
  BookOpen,
  FileText,
  Settings,
  BarChart3,
  Shield,
  Info,
} from 'lucide-react';
import { designTokens } from '@/styles/admin-design-tokens';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import { useState } from 'react';

// 역할 정의
const systemRoles = [
  { id: 'TENANT_ADMIN', name: '테넌트 관리자', description: '테넌트 전체 관리 권한' },
  { id: 'OPERATOR', name: '운영자', description: '운영 관련 기능 접근 권한' },
  { id: 'USER', name: '일반 사용자', description: '학습 및 기본 기능 접근 권한' },
];

// 권한 매트릭스 (시스템에서 정의된 권한)
const permissionMatrix: {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  items: {
    id: string;
    name: string;
    description: string;
    roles: Record<string, boolean>;
  }[];
}[] = [
  {
    category: '사용자 관리',
    icon: Users,
    items: [
      { id: 'users.view', name: '사용자 조회', description: '사용자 목록 및 상세 정보 조회', roles: { TENANT_ADMIN: true, OPERATOR: true, USER: false } },
      { id: 'users.create', name: '사용자 생성', description: '새 사용자 계정 생성', roles: { TENANT_ADMIN: true, OPERATOR: false, USER: false } },
      { id: 'users.edit', name: '사용자 수정', description: '사용자 정보 수정', roles: { TENANT_ADMIN: true, OPERATOR: false, USER: false } },
      { id: 'users.delete', name: '사용자 삭제', description: '사용자 계정 삭제', roles: { TENANT_ADMIN: true, OPERATOR: false, USER: false } },
      { id: 'users.role', name: '역할 변경', description: '사용자 역할 변경', roles: { TENANT_ADMIN: true, OPERATOR: false, USER: false } },
    ],
  },
  {
    category: '강좌 관리',
    icon: BookOpen,
    items: [
      { id: 'courses.view', name: '강좌 조회', description: '모든 강좌 목록 조회', roles: { TENANT_ADMIN: true, OPERATOR: true, USER: true } },
      { id: 'courses.create', name: '강좌 생성', description: '새 강좌 생성', roles: { TENANT_ADMIN: true, OPERATOR: true, USER: false } },
      { id: 'courses.edit', name: '강좌 수정', description: '강좌 정보 수정', roles: { TENANT_ADMIN: true, OPERATOR: true, USER: false } },
      { id: 'courses.delete', name: '강좌 삭제', description: '강좌 삭제', roles: { TENANT_ADMIN: true, OPERATOR: false, USER: false } },
      { id: 'programs.approve', name: '과정 승인', description: '과정 승인/반려', roles: { TENANT_ADMIN: true, OPERATOR: true, USER: false } },
    ],
  },
  {
    category: '콘텐츠 관리',
    icon: FileText,
    items: [
      { id: 'content.view', name: '콘텐츠 조회', description: '콘텐츠 목록 조회', roles: { TENANT_ADMIN: true, OPERATOR: true, USER: true } },
      { id: 'content.upload', name: '콘텐츠 업로드', description: '영상, 문서 등 콘텐츠 업로드', roles: { TENANT_ADMIN: true, OPERATOR: true, USER: false } },
      { id: 'content.delete', name: '콘텐츠 삭제', description: '업로드된 콘텐츠 삭제', roles: { TENANT_ADMIN: true, OPERATOR: true, USER: false } },
    ],
  },
  {
    category: '분석 및 리포트',
    icon: BarChart3,
    items: [
      { id: 'analytics.view', name: '통계 조회', description: '학습 분석 및 통계 조회', roles: { TENANT_ADMIN: true, OPERATOR: true, USER: false } },
      { id: 'analytics.export', name: '리포트 내보내기', description: '분석 리포트 다운로드', roles: { TENANT_ADMIN: true, OPERATOR: false, USER: false } },
    ],
  },
  {
    category: '테넌트 설정',
    icon: Settings,
    items: [
      { id: 'settings.view', name: '설정 조회', description: '테넌트 설정 조회', roles: { TENANT_ADMIN: true, OPERATOR: false, USER: false } },
      { id: 'settings.edit', name: '설정 수정', description: '테넌트 설정 변경', roles: { TENANT_ADMIN: true, OPERATOR: false, USER: false } },
      { id: 'settings.branding', name: '브랜딩 설정', description: '로고, 색상 등 브랜딩 변경', roles: { TENANT_ADMIN: true, OPERATOR: false, USER: false } },
    ],
  },
];

export function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filteredMatrix = selectedRole === 'all'
    ? permissionMatrix
    : permissionMatrix.map(category => ({
        ...category,
        items: category.items.filter(item => item.roles[selectedRole]),
      })).filter(category => category.items.length > 0);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="접근 권한 안내"
        description="역할별 시스템 접근 권한을 확인합니다"
      />

      {/* Info Banner */}
      <Card className="mb-6" style={{ backgroundColor: designTokens.badge.blue.bg, borderColor: `${designTokens.badge.blue.text}30` }}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5" style={{ color: designTokens.badge.blue.text }} />
            <div>
              <p className="font-medium" style={{ color: designTokens.badge.blue.text }}>권한 안내</p>
              <p className="text-sm" style={{ color: designTokens.badge.blue.text }}>
                아래는 각 역할별로 접근 가능한 기능 목록입니다. 권한은 시스템에서 관리되며,
                역할 변경은 사용자 관리 페이지에서 가능합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {systemRoles.map((role) => (
          <Card key={role.id} className={selectedRole === role.id ? 'ring-2 ring-brand-primary' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-medium">{role.name}</p>
                  <p className="text-sm text-text-secondary">{role.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="font-medium">역할 필터:</span>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 보기</SelectItem>
                {systemRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-text-secondary">
              {selectedRole === 'all' ? '모든 권한을 표시합니다' : `${systemRoles.find(r => r.id === selectedRole)?.name}의 권한만 표시합니다`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <div className="space-y-6">
        {filteredMatrix.map((category) => {
          const IconComponent = category.icon;

          return (
            <Card key={category.category}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-brand-primary" />
                  <CardTitle>{category.category}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-bg-secondary/50">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-text-secondary">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {systemRoles.map((role) => (
                          item.roles[role.id] && (
                            <span
                              key={role.id}
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: designTokens.badge.green.bg, color: designTokens.badge.green.text }}
                            >
                              {role.name}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>권한 요약표</CardTitle>
          <CardDescription>각 역할별 전체 권한 현황입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-bg-secondary">
                  <th className="text-left p-3 font-medium">기능</th>
                  {systemRoles.map((role) => (
                    <th key={role.id} className="text-center p-3 font-medium">{role.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionMatrix.flatMap((category) =>
                  category.items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-bg-secondary/30'}>
                      <td className="p-3">
                        <span className="text-text-secondary text-xs">[{category.category}]</span>
                        <br />
                        {item.name}
                      </td>
                      {systemRoles.map((role) => (
                        <td key={role.id} className="text-center p-3">
                          {item.roles[role.id] ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                              style={{ backgroundColor: designTokens.badge.green.bg, color: designTokens.badge.green.text }}
                            >
                              ✓
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                              style={{ backgroundColor: designTokens.badge.gray.bg, color: designTokens.badge.gray.text }}
                            >
                              -
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
