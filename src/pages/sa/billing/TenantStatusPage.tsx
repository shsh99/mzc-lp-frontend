import { useState } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  HardDrive,
  Search,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { AdminPageHeader, AdminStatsCard, AdminStatsGrid, StatusBadge, PlanBadge } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import { Progress } from '@/components/common/Progress';
import type { TenantStatus, PlanType } from '@/types/admin';

// Mock 데이터
const mockOverallStats = {
  totalTenants: 24,
  totalUsers: 12500,
  totalCourses: 456,
  totalStorage: 2.4, // TB
};

const mockTenantStatus: {
  id: number;
  name: string;
  code: string;
  status: TenantStatus;
  plan: PlanType;
  users: { current: number; max: number };
  courses: { current: number; max: number };
  storage: { current: number; max: number }; // GB
  lastActivity: string;
  trend: 'up' | 'down' | 'stable';
}[] = [
  { id: 1, name: '메가존클라우드', code: 'mzc', status: 'ACTIVE', plan: 'ENTERPRISE', users: { current: 250, max: 500 }, courses: { current: 45, max: 100 }, storage: { current: 85, max: 200 }, lastActivity: '2025-12-30 09:15', trend: 'up' },
  { id: 2, name: '삼성전자', code: 'samsung', status: 'ACTIVE', plan: 'ENTERPRISE', users: { current: 480, max: 500 }, courses: { current: 78, max: 100 }, storage: { current: 156, max: 200 }, lastActivity: '2025-12-30 10:22', trend: 'up' },
  { id: 3, name: '네이버', code: 'naver', status: 'PENDING', plan: 'PRO', users: { current: 45, max: 200 }, courses: { current: 12, max: 50 }, storage: { current: 15, max: 50 }, lastActivity: '2025-12-29 14:30', trend: 'stable' },
  { id: 4, name: '카카오', code: 'kakao', status: 'ACTIVE', plan: 'PRO', users: { current: 180, max: 200 }, courses: { current: 42, max: 50 }, storage: { current: 38, max: 50 }, lastActivity: '2025-12-30 08:45', trend: 'up' },
  { id: 5, name: '라인', code: 'line', status: 'SUSPENDED', plan: 'BASIC', users: { current: 25, max: 50 }, courses: { current: 8, max: 20 }, storage: { current: 5, max: 10 }, lastActivity: '2025-12-15 11:20', trend: 'down' },
  { id: 6, name: 'SK텔레콤', code: 'skt', status: 'ACTIVE', plan: 'ENTERPRISE', users: { current: 320, max: 500 }, courses: { current: 55, max: 100 }, storage: { current: 120, max: 200 }, lastActivity: '2025-12-30 11:00', trend: 'up' },
];

// 탭용 콘텐츠 컴포넌트 (TenantManagementPage에서 사용)
export function TenantStatusContent() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const filteredTenants = mockTenantStatus.filter((tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      tenant.code.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getUsageColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <span className="h-4 w-4 text-gray-400">-</span>;
  };

  return (
    <div>
      {/* Overall Stats */}
      <AdminStatsGrid columns={4} className="mb-6">
        <AdminStatsCard
          title="전체 테넌트"
          value={mockOverallStats.totalTenants}
          icon={Building2}
          variant="primary"
        />
        <AdminStatsCard
          title="전체 사용자"
          value={mockOverallStats.totalUsers.toLocaleString()}
          icon={Users}
          variant="success"
        />
        <AdminStatsCard
          title="전체 강좌"
          value={mockOverallStats.totalCourses}
          icon={BookOpen}
          variant="default"
        />
        <AdminStatsCard
          title="전체 스토리지"
          value={`${mockOverallStats.totalStorage} TB`}
          icon={HardDrive}
          variant="warning"
        />
      </AdminStatsGrid>

      {/* Tenant Status List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>테넌트별 현황</CardTitle>
              <CardDescription>각 테넌트의 리소스 사용량을 확인합니다</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="테넌트 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="ACTIVE">활성</SelectItem>
                  <SelectItem value="INACTIVE">비활성</SelectItem>
                  <SelectItem value="PENDING">대기</SelectItem>
                  <SelectItem value="SUSPENDED">정지</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="p-4 border rounded-lg hover:bg-bg-secondary transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{tenant.name}</h3>
                        <TrendIcon trend={tenant.trend} />
                      </div>
                      <p className="text-sm text-text-secondary">{tenant.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={tenant.status} />
                    <PlanBadge plan={tenant.plan} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Users */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-secondary">사용자</span>
                      <span className={`text-sm font-medium ${getUsageColor(tenant.users.current, tenant.users.max)}`}>
                        {tenant.users.current} / {tenant.users.max}
                      </span>
                    </div>
                    <Progress value={(tenant.users.current / tenant.users.max) * 100} />
                  </div>

                  {/* Courses */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-secondary">강좌</span>
                      <span className={`text-sm font-medium ${getUsageColor(tenant.courses.current, tenant.courses.max)}`}>
                        {tenant.courses.current} / {tenant.courses.max}
                      </span>
                    </div>
                    <Progress value={(tenant.courses.current / tenant.courses.max) * 100} />
                  </div>

                  {/* Storage */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-secondary">스토리지</span>
                      <span className={`text-sm font-medium ${getUsageColor(tenant.storage.current, tenant.storage.max)}`}>
                        {tenant.storage.current} GB / {tenant.storage.max} GB
                      </span>
                    </div>
                    <Progress value={(tenant.storage.current / tenant.storage.max) * 100} />
                  </div>
                </div>

                <div className="mt-3 text-xs text-text-secondary">
                  최근 활동: {tenant.lastActivity}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 기존 TenantStatusPage - 호환성 유지용 (독립 페이지로 사용 시)
export function TenantStatusPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="전체 현황 조회"
        description="모든 테넌트의 사용 현황을 모니터링합니다"
      />
      <div className="mt-6">
        <TenantStatusContent />
      </div>
    </div>
  );
}
