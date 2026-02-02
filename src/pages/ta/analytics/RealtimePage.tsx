import { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  PlayCircle,
  Clock,
  Monitor,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useActivityStats, useRecentActivities } from '@/hooks/ta';
import type { ActivityType } from '@/services/ta/analyticsService';

// 활동 타입별 아이콘/색상
const getActivityDisplay = (type: ActivityType) => {
  const config: Record<string, { activity: string; color: string }> = {
    LOGIN: { activity: '로그인', color: 'text-blue-600' },
    LOGOUT: { activity: '로그아웃', color: 'text-gray-600' },
    COURSE_VIEW: { activity: '강좌 조회', color: 'text-green-600' },
    CONTENT_VIEW: { activity: '콘텐츠 시청', color: 'text-purple-600' },
    CONTENT_COMPLETE: { activity: '콘텐츠 완료', color: 'text-emerald-600' },
    ENROLLMENT_CREATE: { activity: '수강 신청', color: 'text-orange-600' },
    ENROLLMENT_COMPLETE: { activity: '수강 완료', color: 'text-teal-600' },
  };
  return config[type] || { activity: type, color: 'text-gray-600' };
};

// 상대 시간 포맷
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${Math.floor(diffHours / 24)}일 전`;
};

export function RealtimePage() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useActivityStats(1); // 오늘 데이터
  const { data: recentActivities, isLoading: activitiesLoading, refetch: refetchActivities } = useRecentActivities();

  const isLoading = statsLoading || activitiesLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), refetchActivities()]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  // 30초마다 자동 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchActivities();
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchStats, refetchActivities]);

  // 활동 유형별 카운트
  const todayActivities = stats?.todayActivities || 0;
  const activeUsers = stats?.activeUsers || 0;
  const loginCount = stats?.byActivityType?.LOGIN || 0;
  const contentViewCount = stats?.byActivityType?.CONTENT_VIEW || 0;

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="실시간 데이터 현황"
        description="현재 플랫폼 사용 현황을 실시간으로 모니터링합니다"
        actions={
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        }
      />

      <p className="text-sm text-text-secondary mb-6">
        마지막 업데이트: {lastUpdate.toLocaleTimeString()}
      </p>

      {isLoading && !recentActivities ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      ) : (
        <>
          {/* Realtime Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <div className="relative">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeUsers}</p>
                    <p className="text-sm text-text-secondary">활성 사용자</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{todayActivities}</p>
                    <p className="text-sm text-text-secondary">오늘 활동</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PlayCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{contentViewCount}</p>
                    <p className="text-sm text-text-secondary">콘텐츠 조회</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loginCount}</p>
                    <p className="text-sm text-text-secondary">오늘 로그인</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>실시간 사용자 활동 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.slice(0, 10).map((activity) => {
                      const display = getActivityDisplay(activity.activityType);
                      return (
                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-brand-primary">
                                {activity.userName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{activity.userName || '알 수 없음'}</p>
                              <p className="text-xs text-text-secondary">
                                {activity.activityTypeLabel || display.activity}
                                {activity.targetName && ` - ${activity.targetName}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatRelativeTime(activity.createdAt)}
                            </Badge>
                            <Monitor className="h-4 w-4 text-text-secondary" />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      최근 활동이 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>활동 유형별 현황</CardTitle>
                <CardDescription>오늘의 활동 유형 분포</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.byActivityType && Object.entries(stats.byActivityType).length > 0 ? (
                    Object.entries(stats.byActivityType)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 8)
                      .map(([type, count], index) => {
                        const display = getActivityDisplay(type as ActivityType);
                        const maxCount = Math.max(...Object.values(stats.byActivityType));
                        const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;

                        return (
                          <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-50 text-gray-500'
                              }`}>
                                {index + 1}
                              </span>
                              <span className="font-medium">{display.activity}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-gray-100 rounded">
                                <div
                                  className="h-full bg-brand-primary rounded"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-12 text-right">
                                {count}건
                              </span>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      오늘 활동 데이터가 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
