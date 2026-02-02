import { useState } from 'react';
import { Users, BookOpen, TrendingUp, GraduationCap, AlertCircle, UserPlus, FileText, CheckCircle } from 'lucide-react';
import { designTokens } from '@/styles/admin-design-tokens';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AdminPageHeader,
  AdminStatsCard,
  AdminStatsGrid,
} from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Progress } from '@/components/common/Progress';
import { Skeleton } from '@/components/common/Skeleton';
import { NoDataEmpty } from '@/components/common/EmptyState';
import { useTaKpiDashboard } from '@/hooks/ta';
import type { DashboardPeriod } from '@/services/ta';

type DateRange = DashboardPeriod;

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '이번 달' },
];

export function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const { data, isLoading, error } = useTaKpiDashboard(dateRange);

  // 선택된 기간 라벨 가져오기
  const selectedRangeLabel = DATE_RANGE_OPTIONS.find((opt) => opt.value === dateRange)?.label ?? '';

  if (error) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <AdminPageHeader
          title="대시보드"
          description="테넌트 현황을 한눈에 확인합니다"
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

  const defaultUserStats = { total: 0, active: 0, inactive: 0, suspended: 0, withdrawn: 0, newInPeriod: 0 };
  const defaultProgramStats = { total: 0, draft: 0, pending: 0, approved: 0, rejected: 0, closed: 0 };
  const defaultEnrollmentStats = { totalEnrollments: 0, byStatus: { enrolled: 0, completed: 0, dropped: 0, failed: 0 }, completionRate: 0 };

  const userStats = { ...defaultUserStats, ...data?.userStats };
  const programStats = { ...defaultProgramStats, ...data?.programStats };
  const enrollmentStats = { ...defaultEnrollmentStats, ...data?.enrollmentStats, byStatus: { ...defaultEnrollmentStats.byStatus, ...data?.enrollmentStats?.byStatus } };
  const dailyTrend = data?.dailyTrend ?? [];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="대시보드"
        description={`테넌트 현황을 한눈에 확인합니다 • ${selectedRangeLabel} 기준`}
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
              title="전체 사용자"
              value={userStats.total.toLocaleString()}
              subtitle={`활성 ${userStats.active.toLocaleString()}명`}
              icon={Users}
              variant="primary"
            />
            <AdminStatsCard
              title="이번 달 신규"
              value={userStats.newInPeriod.toLocaleString()}
              subtitle="신규 가입자"
              icon={UserPlus}
              variant="success"
            />
            <AdminStatsCard
              title="전체 과정"
              value={programStats.total.toLocaleString()}
              subtitle={`승인 ${programStats.approved}개`}
              icon={BookOpen}
              variant="warning"
            />
            <AdminStatsCard
              title="수강 완료율"
              value={`${enrollmentStats.completionRate}%`}
              subtitle={`전체 ${enrollmentStats.totalEnrollments.toLocaleString()}건`}
              icon={GraduationCap}
              variant="default"
            />
          </>
        )}
      </AdminStatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                <Skeleton className="h-6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">활성</span>
                  <div className="flex items-center gap-2">
                    <Progress value={userStats.total > 0 ? (userStats.active / userStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-16">{userStats.active.toLocaleString()}명</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">비활성</span>
                  <div className="flex items-center gap-2">
                    <Progress value={userStats.total > 0 ? (userStats.inactive / userStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-16">{userStats.inactive.toLocaleString()}명</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">정지</span>
                  <div className="flex items-center gap-2">
                    <Progress value={userStats.total > 0 ? (userStats.suspended / userStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-16">{userStats.suspended.toLocaleString()}명</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">탈퇴</span>
                  <div className="flex items-center gap-2">
                    <Progress value={userStats.total > 0 ? (userStats.withdrawn / userStats.total) * 100 : 0} className="w-32" />
                    <span className="text-sm font-medium w-16">{userStats.withdrawn.toLocaleString()}명</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 과정 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>과정 현황</CardTitle>
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
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm">작성중</span>
                  </div>
                  <span className="text-sm font-medium">{programStats.draft}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-warning" />
                    <span className="text-sm">검토 대기</span>
                  </div>
                  <span className="text-sm font-medium">{programStats.pending}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">승인됨</span>
                  </div>
                  <span className="text-sm font-medium">{programStats.approved}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm">반려됨</span>
                  </div>
                  <span className="text-sm font-medium">{programStats.rejected}개</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 수강 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>수강 현황</CardTitle>
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
                  <span className="text-sm">수강 중</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={enrollmentStats.totalEnrollments > 0 ? (enrollmentStats.byStatus.enrolled / enrollmentStats.totalEnrollments) * 100 : 0}
                      className="w-32"
                    />
                    <span className="text-sm font-medium w-16">{enrollmentStats.byStatus.enrolled.toLocaleString()}건</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">수료</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={enrollmentStats.totalEnrollments > 0 ? (enrollmentStats.byStatus.completed / enrollmentStats.totalEnrollments) * 100 : 0}
                      className="w-32"
                    />
                    <span className="text-sm font-medium w-16">{enrollmentStats.byStatus.completed.toLocaleString()}건</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">중도 포기</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={enrollmentStats.totalEnrollments > 0 ? (enrollmentStats.byStatus.dropped / enrollmentStats.totalEnrollments) * 100 : 0}
                      className="w-32"
                    />
                    <span className="text-sm font-medium w-16">{enrollmentStats.byStatus.dropped.toLocaleString()}건</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">미수료</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={enrollmentStats.totalEnrollments > 0 ? (enrollmentStats.byStatus.failed / enrollmentStats.totalEnrollments) * 100 : 0}
                      className="w-32"
                    />
                    <span className="text-sm font-medium w-16">{enrollmentStats.byStatus.failed.toLocaleString()}건</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 일별 수강 추이 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>일별 수강 추이</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : dailyTrend.length === 0 ? (
              <NoDataEmpty
                title="데이터가 없습니다"
                description="선택한 기간에 수강 데이터가 없습니다."
                className="h-64"
              />
            ) : (
              <div className="w-full" style={{ minHeight: 256 }}>
                <ResponsiveContainer width="100%" height={256}>
                  <AreaChart
                    data={dailyTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      {/* 수강 신청: indigo (브랜드 컬러) - 낮은 투명도 */}
                      <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={designTokens.badge.indigo.text} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={designTokens.badge.indigo.text} stopOpacity={0.02} />
                      </linearGradient>
                      {/* 수료: green (성공 컬러) - 낮은 투명도 */}
                      <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={designTokens.badge.green.text} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={designTokens.badge.green.text} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickFormatter={(value: string) => {
                        const [, month, day] = value.split('-');
                        return `${parseInt(month)}/${parseInt(day)}`;
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value: string) => {
                        const [year, month, day] = value.split('-');
                        return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
                      }}
                    />
                    <Legend />
                    {/* 수강 신청을 먼저 그려서 뒤에 배치 (값이 보통 더 큼) */}
                    <Area
                      type="monotone"
                      dataKey="enrollments"
                      name="수강 신청"
                      stroke={designTokens.badge.indigo.text}
                      strokeWidth={2}
                      fill="url(#enrollmentGradient)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2 }}
                    />
                    {/* 수료를 나중에 그려서 앞에 배치 */}
                    <Area
                      type="monotone"
                      dataKey="completions"
                      name="수료"
                      stroke={designTokens.badge.green.text}
                      strokeWidth={2}
                      fill="url(#completionGradient)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
