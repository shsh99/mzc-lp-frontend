import { useState } from 'react';
import { Building2, Users, AlertCircle, Clock } from 'lucide-react';
import {
  AdminPageHeader,
  AdminStatsCard,
  AdminStatsGrid,
  StatusBadge,
  PlanBadge,
} from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Progress } from '@/components/common/Progress';
import { Skeleton } from '@/components/common/Skeleton';
import { NoDataEmpty } from '@/components/common/EmptyState';
import { useSaDashboard } from '@/hooks/sa';
import type { TenantStatus, PlanType } from '@/types/admin';
import type { DashboardPeriod } from '@/services/sa';

type DateRange = DashboardPeriod;

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '이번 달' },
];

export function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const { data, isLoading, error } = useSaDashboard(dateRange);

  // 선택된 기간 라벨 가져오기
  const selectedRangeLabel = DATE_RANGE_OPTIONS.find((opt) => opt.value === dateRange)?.label ?? '';

  if (error) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <AdminPageHeader
          title="대시보드"
          description="시스템 전체 현황을 확인합니다"
        />
        <Card className="mt-6">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-medium text-text-primary">데이터를 불러올 수 없습니다</p>
              <p className="text-sm text-text-secondary mt-1">잠시 후 다시 시도해주세요</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tenantStats = data?.tenantStats ?? { total: 0, active: 0, pending: 0, suspended: 0, terminated: 0 };
  const userStats = data?.userStats ?? { total: 0, active: 0, suspended: 0, withdrawn: 0 };
  const recentTenants = data?.recentTenants ?? [];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="대시보드"
        description={`시스템 전체 현황을 확인합니다 • ${selectedRangeLabel} 기준`}
        actions={
          <div className="flex gap-1">
            {DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Stats Grid */}
      <AdminStatsGrid columns={4} className="mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <AdminStatsCard
              title="전체 테넌트"
              value={tenantStats.total}
              subtitle={`활성 ${tenantStats.active}개`}
              icon={Building2}
              variant="primary"
            />
            <AdminStatsCard
              title="전체 사용자"
              value={userStats.total.toLocaleString()}
              subtitle={`활성 ${userStats.active.toLocaleString()}명`}
              icon={Users}
              variant="success"
            />
            <AdminStatsCard
              title="대기 중 테넌트"
              value={tenantStats.pending}
              subtitle="승인 대기"
              icon={Clock}
              variant="warning"
            />
            <AdminStatsCard
              title="정지된 테넌트"
              value={tenantStats.suspended}
              subtitle={`종료 ${tenantStats.terminated}개`}
              icon={AlertCircle}
              variant="error"
            />
          </>
        )}
      </AdminStatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 테넌트 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>테넌트 현황</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">활성</span>
                  <div className="flex items-center gap-2">
                    <Progress value={tenantStats.total > 0 ? (tenantStats.active / tenantStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-8">{tenantStats.active}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">대기</span>
                  <div className="flex items-center gap-2">
                    <Progress value={tenantStats.total > 0 ? (tenantStats.pending / tenantStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-8">{tenantStats.pending}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">정지</span>
                  <div className="flex items-center gap-2">
                    <Progress value={tenantStats.total > 0 ? (tenantStats.suspended / tenantStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-8">{tenantStats.suspended}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">종료</span>
                  <div className="flex items-center gap-2">
                    <Progress value={tenantStats.total > 0 ? (tenantStats.terminated / tenantStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-8">{tenantStats.terminated}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 사용자 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 현황</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">활성</span>
                  <div className="flex items-center gap-2">
                    <Progress value={userStats.total > 0 ? (userStats.active / userStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-12">{userStats.active.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">정지</span>
                  <div className="flex items-center gap-2">
                    <Progress value={userStats.total > 0 ? (userStats.suspended / userStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-12">{userStats.suspended.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">탈퇴</span>
                  <div className="flex items-center gap-2">
                    <Progress value={userStats.total > 0 ? (userStats.withdrawn / userStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-12">{userStats.withdrawn.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 생성된 테넌트 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>최근 생성된 테넌트</CardTitle>
            <a href="/sa/tenants" className="text-sm text-brand-primary hover:underline">
              전체 보기
            </a>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : recentTenants.length === 0 ? (
              <NoDataEmpty
                title="최근 생성된 테넌트가 없습니다"
                description="새로운 테넌트가 등록되면 여기에 표시됩니다."
                className="py-8"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">테넌트명</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">코드</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">상태</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">플랜</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">생성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b last:border-b-0 hover:bg-bg-secondary">
                        <td className="py-3 px-4 font-medium">{tenant.name}</td>
                        <td className="py-3 px-4 text-text-secondary">{tenant.code}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={tenant.status as TenantStatus} />
                        </td>
                        <td className="py-3 px-4">
                          <PlanBadge plan={tenant.plan as PlanType} />
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {new Date(tenant.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
