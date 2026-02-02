import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  PlayCircle,
  Clock,
  Monitor,
  RefreshCw,
  Loader2,
  Search,
  Download,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  Calendar,
  User,
  Filter,
  X,
  LogIn,
  BookOpen,
  GraduationCap,
  FileText,
  Settings,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Badge } from '@/components/common/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { useActivityStats, useRecentActivities, useSearchActivityLogs } from '@/hooks/ta';
import type { ActivityType, ReportType, ExportFormat, ReportPeriod } from '@/services/ta/analyticsService';
import { analyticsService } from '@/services/ta/analyticsService';
import { useUsers } from '@/hooks/ta/useUserQueries';
import { designTokens } from '@/styles/admin-design-tokens';

// ============== 실시간 현황 관련 ==============

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

// ============== 로그 관리 관련 ==============

type CategoryKey = 'all' | 'auth' | 'user' | 'course' | 'enrollment' | 'content' | 'settings';

interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: React.ElementType;
  types: ActivityType[];
  color: string;
}

const categories: CategoryConfig[] = [
  { key: 'all', label: '전체', icon: FileText, types: [], color: 'bg-gray-100 text-gray-700' },
  { key: 'auth', label: '인증', icon: LogIn, types: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE'], color: 'bg-purple-100 text-purple-700' },
  { key: 'user', label: '사용자', icon: Users, types: ['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CHANGE'], color: 'bg-indigo-100 text-indigo-700' },
  { key: 'course', label: '강좌', icon: BookOpen, types: ['COURSE_VIEW', 'COURSE_CREATE', 'COURSE_UPDATE', 'COURSE_DELETE'], color: 'bg-cyan-100 text-cyan-700' },
  { key: 'enrollment', label: '수강', icon: GraduationCap, types: ['ENROLLMENT_CREATE', 'ENROLLMENT_COMPLETE', 'ENROLLMENT_DROP'], color: 'bg-emerald-100 text-emerald-700' },
  { key: 'content', label: '콘텐츠', icon: FileText, types: ['CONTENT_VIEW', 'CONTENT_COMPLETE', 'PROGRAM_CREATE', 'PROGRAM_UPDATE', 'PROGRAM_APPROVE', 'PROGRAM_REJECT'], color: 'bg-orange-100 text-orange-700' },
  { key: 'settings', label: '설정', icon: Settings, types: ['SETTINGS_UPDATE', 'TENANT_CREATE', 'TENANT_UPDATE', 'OTHER'], color: 'bg-slate-100 text-slate-700' },
];

const getLogLevel = (activityType: ActivityType): 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' => {
  const errorTypes: ActivityType[] = ['LOGIN_FAILED'];
  const successTypes: ActivityType[] = ['ENROLLMENT_COMPLETE', 'CONTENT_COMPLETE', 'PROGRAM_APPROVE'];
  const warnTypes: ActivityType[] = ['USER_DELETE', 'COURSE_DELETE', 'ENROLLMENT_DROP', 'PROGRAM_REJECT'];

  if (errorTypes.includes(activityType)) return 'ERROR';
  if (successTypes.includes(activityType)) return 'SUCCESS';
  if (warnTypes.includes(activityType)) return 'WARN';
  return 'INFO';
};

const getCategory = (activityType: ActivityType): CategoryConfig => {
  for (const cat of categories) {
    if (cat.types.includes(activityType)) {
      return cat;
    }
  }
  return categories[0];
};

const levelConfig = {
  INFO: {
    icon: Info,
    badgeStyle: { backgroundColor: designTokens.badge.blue.bg, color: designTokens.badge.blue.text },
  },
  WARN: {
    icon: AlertTriangle,
    badgeStyle: { backgroundColor: designTokens.status.warning_background, color: designTokens.status.warning_text },
  },
  ERROR: {
    icon: AlertCircle,
    badgeStyle: { backgroundColor: designTokens.status.error_background, color: designTokens.status.error_text },
  },
  SUCCESS: {
    icon: CheckCircle,
    badgeStyle: { backgroundColor: designTokens.status.success_background, color: designTokens.status.success_text },
  },
};

const activityTypeOptions: { value: ActivityType; label: string; category: CategoryKey }[] = [
  { value: 'LOGIN', label: '로그인', category: 'auth' },
  { value: 'LOGOUT', label: '로그아웃', category: 'auth' },
  { value: 'LOGIN_FAILED', label: '로그인 실패', category: 'auth' },
  { value: 'PASSWORD_CHANGE', label: '비밀번호 변경', category: 'auth' },
  { value: 'USER_CREATE', label: '사용자 생성', category: 'user' },
  { value: 'USER_UPDATE', label: '사용자 수정', category: 'user' },
  { value: 'USER_DELETE', label: '사용자 삭제', category: 'user' },
  { value: 'ROLE_CHANGE', label: '역할 변경', category: 'user' },
  { value: 'COURSE_VIEW', label: '강좌 조회', category: 'course' },
  { value: 'COURSE_CREATE', label: '강좌 생성', category: 'course' },
  { value: 'COURSE_UPDATE', label: '강좌 수정', category: 'course' },
  { value: 'COURSE_DELETE', label: '강좌 삭제', category: 'course' },
  { value: 'ENROLLMENT_CREATE', label: '수강 신청', category: 'enrollment' },
  { value: 'ENROLLMENT_COMPLETE', label: '수강 완료', category: 'enrollment' },
  { value: 'ENROLLMENT_DROP', label: '수강 취소', category: 'enrollment' },
  { value: 'CONTENT_VIEW', label: '콘텐츠 조회', category: 'content' },
  { value: 'CONTENT_COMPLETE', label: '콘텐츠 완료', category: 'content' },
];

// ============== 실시간 현황 탭 컴포넌트 ==============

function RealtimeTab() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useActivityStats(1);
  const { data: recentActivities, isLoading: activitiesLoading, refetch: refetchActivities } = useRecentActivities();

  const isLoading = statsLoading || activitiesLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), refetchActivities()]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchActivities();
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchStats, refetchActivities]);

  const todayActivities = stats?.todayActivities || 0;
  const activeUsers = stats?.activeUsers || 0;
  const loginCount = stats?.byActivityType?.LOGIN || 0;
  const contentViewCount = stats?.byActivityType?.CONTENT_VIEW || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-secondary">
          마지막 업데이트: {lastUpdate.toLocaleTimeString()}
        </p>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {isLoading && !recentActivities ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      ) : (
        <>
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

// ============== 로그 관리 탭 컴포넌트 ==============

function LogsTab() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<ActivityType | undefined>(undefined);
  const [userFilter, setUserFilter] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryTab, setCategoryTab] = useState<CategoryKey>('all');

  const { data: logsData, isLoading, error } = useSearchActivityLogs({
    userId: userFilter,
    type: typeFilter,
    startDate: startDate ? new Date(startDate).toISOString() : undefined,
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
    page,
    size: 50,
  });
  const { data: stats } = useActivityStats(30);
  const { data: usersData } = useUsers({ page: 0, size: 100 });

  const users = useMemo(() => usersData?.content || [], [usersData]);

  const handleExport = async () => {
    try {
      await analyticsService.exportLogs({
        userId: userFilter,
        type: typeFilter,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
    } catch (error) {
      console.error('Export failed:', error);
      const message = error instanceof Error ? error.message : 'CSV 내보내기에 실패했습니다.';
      alert(message);
    }
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setLevelFilter('all');
    setTypeFilter(undefined);
    setUserFilter(undefined);
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const activeFilterCount = [
    levelFilter !== 'all',
    typeFilter !== undefined,
    userFilter !== undefined,
    startDate !== '',
    endDate !== '',
  ].filter(Boolean).length;

  const logs = logsData?.content || [];

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      all: logs.length, auth: 0, user: 0, course: 0, enrollment: 0, content: 0, settings: 0,
    };
    logs.forEach((log) => {
      const cat = getCategory(log.activityType);
      if (cat.key !== 'all') counts[cat.key]++;
    });
    return counts;
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (categoryTab !== 'all') {
        const cat = getCategory(log.activityType);
        if (cat.key !== categoryTab) return false;
      }
      const matchesSearch = !searchKeyword ||
        log.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        log.activityTypeLabel?.toLowerCase().includes(searchKeyword.toLowerCase());
      const logLevel = getLogLevel(log.activityType);
      const matchesLevel = levelFilter === 'all' || logLevel === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [logs, categoryTab, searchKeyword, levelFilter]);

  const levelCounts = useMemo(() => ({
    INFO: logs.filter(l => getLogLevel(l.activityType) === 'INFO').length,
    SUCCESS: logs.filter(l => getLogLevel(l.activityType) === 'SUCCESS').length,
    WARN: logs.filter(l => getLogLevel(l.activityType) === 'WARN').length,
    ERROR: logs.filter(l => getLogLevel(l.activityType) === 'ERROR').length,
  }), [logs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const filteredTypeOptions = useMemo(() => {
    if (categoryTab === 'all') return activityTypeOptions;
    return activityTypeOptions.filter(opt => opt.category === categoryTab);
  }, [categoryTab]);

  return (
    <div>
      {/* 필터 버튼 & 내보내기 */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="relative">
          <Filter className="mr-2 h-4 w-4" />
          필터
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-brand-primary text-white">{activeFilterCount}</Badge>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          CSV 내보내기
        </Button>
      </div>

      {/* 고급 필터 */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">고급 필터</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                초기화
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">사용자</label>
                <Select value={userFilter?.toString() || 'all'} onValueChange={(v) => { setUserFilter(v === 'all' ? undefined : Number(v)); setPage(0); }}>
                  <SelectTrigger><SelectValue placeholder="사용자 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 사용자</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>{user.name} ({user.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">활동 유형</label>
                <Select value={typeFilter || 'all'} onValueChange={(v) => { setTypeFilter(v === 'all' ? undefined : v as ActivityType); setPage(0); }}>
                  <SelectTrigger><SelectValue placeholder="활동 유형" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {filteredTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">시작일</label>
                <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">종료일</label>
                <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: designTokens.badge.blue.bg }}>
                <Info className="h-5 w-5" style={{ color: designTokens.badge.blue.text }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalActivities || logs.length}</p>
                <p className="text-sm text-text-secondary">전체 활동</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: designTokens.badge.green.bg }}>
                <CheckCircle className="h-5 w-5" style={{ color: designTokens.badge.green.text }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.todayActivities || 0}</p>
                <p className="text-sm text-text-secondary">오늘 활동</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: designTokens.badge.yellow.bg }}>
                <AlertTriangle className="h-5 w-5" style={{ color: designTokens.badge.yellow.text }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{levelCounts.WARN}</p>
                <p className="text-sm text-text-secondary">경고</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: designTokens.badge.red.bg }}>
                <AlertCircle className="h-5 w-5" style={{ color: designTokens.badge.red.text }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{levelCounts.ERROR}</p>
                <p className="text-sm text-text-secondary">오류</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리 탭 */}
      <Tabs value={categoryTab} onValueChange={(v) => { setCategoryTab(v as CategoryKey); setPage(0); }}>
        <TabsList className="mb-4 flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.key} value={cat.key} className="gap-2">
                <Icon className="h-4 w-4" />
                {cat.label}
                <Badge variant="secondary" className="ml-1 text-xs">{categoryCounts[cat.key]}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.key} value={cat.key}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <cat.icon className="h-5 w-5" />
                      {cat.label} 로그
                    </CardTitle>
                    <CardDescription>
                      {cat.key === 'all' ? '테넌트 내 모든 활동 기록입니다' : `${cat.label} 관련 활동 기록입니다`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                      <Input placeholder="검색..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="pl-9 w-64" />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-28"><SelectValue placeholder="레벨" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="INFO">정보</SelectItem>
                        <SelectItem value="SUCCESS">성공</SelectItem>
                        <SelectItem value="WARN">경고</SelectItem>
                        <SelectItem value="ERROR">오류</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: designTokens.button.brand_default }} />
                  </div>
                ) : error ? (
                  <div className="text-center py-12" style={{ color: designTokens.status.error_text }}>
                    데이터를 불러오는 중 오류가 발생했습니다.
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-text-secondary">
                    {cat.key === 'all' ? '활동 로그가 없습니다.' : `${cat.label} 관련 로그가 없습니다.`}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredLogs.map((log) => {
                      const level = getLogLevel(log.activityType);
                      const logCategory = getCategory(log.activityType);
                      const config = levelConfig[level];
                      const LevelIcon = config.icon;
                      const CategoryIcon = logCategory.icon;

                      return (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                          <div className="shrink-0 px-2 py-1 rounded text-xs font-medium flex items-center gap-1" style={config.badgeStyle}>
                            <LevelIcon className="h-3 w-3" />
                            {level}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`${logCategory.color} shrink-0`}>
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {logCategory.label}
                              </Badge>
                              <span className="font-medium">{log.activityTypeLabel}</span>
                              {log.userName && (
                                <span className="text-sm text-text-secondary flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {log.userName}
                                </span>
                              )}
                            </div>
                            <p className="text-sm mt-1">{log.description}</p>
                            {log.targetName && (
                              <p className="text-xs mt-1 text-text-secondary">대상: {log.targetType} - {log.targetName}</p>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(log.createdAt)}
                              </span>
                              {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {logsData && logsData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={logsData.first}>
                      이전
                    </Button>
                    <span className="text-sm text-text-secondary">{logsData.number + 1} / {logsData.totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={logsData.last}>
                      다음
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// ============== 통계 내보내기 탭 컴포넌트 ==============

const reportTypes: { id: ReportType; name: string; description: string }[] = [
  { id: 'USERS', name: '사용자 현황', description: '등록된 사용자 목록 및 상태' },
  { id: 'COURSES', name: '강좌 현황', description: '강좌 목록 및 수강 통계' },
  { id: 'LEARNING', name: '학습 진도', description: '사용자별 학습 진행 현황' },
  { id: 'COMPLETION', name: '수료 현황', description: '강좌별 수료자 통계' },
  { id: 'ENGAGEMENT', name: '참여도 분석', description: '사용자 활동 및 참여 지표' },
];

const periodMap: Record<string, ReportPeriod> = {
  week: 'WEEK', month: 'MONTH', quarter: 'QUARTER', year: 'YEAR', all: 'ALL',
};

const formatMap: Record<string, ExportFormat> = {
  xlsx: 'XLSX', csv: 'CSV', pdf: 'PDF',
};

const exportStatusConfig = {
  COMPLETED: { label: '완료', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  PROCESSING: { label: '처리중', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  FAILED: { label: '실패', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
};

interface ExportHistoryItem {
  id: number;
  reportType: string;
  format: string;
  period: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  createdAt: string;
}

const EXPORT_HISTORY_KEY = 'ta_export_history';

const loadExportHistory = (): ExportHistoryItem[] => {
  try {
    const saved = localStorage.getItem(EXPORT_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveExportHistory = (history: ExportHistoryItem[]) => {
  try { localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(history.slice(0, 10))); }
  catch { /* ignore */ }
};

function ExportTab() {
  const [selectedReport, setSelectedReport] = useState<ReportType | ''>('');
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<ExportHistoryItem[]>(() => loadExportHistory());

  useEffect(() => { saveExportHistory(recentExports); }, [recentExports]);

  const handleExport = async () => {
    if (!selectedReport) return;
    setIsExporting(true);
    setExportError(null);

    const newExport: ExportHistoryItem = {
      id: Date.now(),
      reportType: reportTypes.find(r => r.id === selectedReport)?.name || selectedReport,
      format: selectedFormat.toUpperCase(),
      period: selectedPeriod,
      status: 'PROCESSING',
      createdAt: new Date().toLocaleString('ko-KR'),
    };
    setRecentExports(prev => [newExport, ...prev.slice(0, 9)]);

    try {
      await analyticsService.exportReport({
        reportType: selectedReport,
        format: formatMap[selectedFormat],
        period: periodMap[selectedPeriod],
      });
      setRecentExports(prev => prev.map(exp => exp.id === newExport.id ? { ...exp, status: 'COMPLETED' as const } : exp));
    } catch (error) {
      const message = error instanceof Error ? error.message : '리포트 생성에 실패했습니다.';
      setExportError(message);
      setRecentExports(prev => prev.map(exp => exp.id === newExport.id ? { ...exp, status: 'FAILED' as const } : exp));
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = async (reportType: ReportType) => {
    setIsExporting(true);
    setExportError(null);
    try {
      await analyticsService.exportReport({ reportType, format: 'XLSX', period: 'MONTH' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '리포트 생성에 실패했습니다.';
      setExportError(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {exportError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{exportError}</div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>리포트 생성</CardTitle>
              <CardDescription>내보내기할 리포트 유형과 옵션을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>리포트 유형</Label>
                <div className="grid grid-cols-2 gap-3">
                  {reportTypes.map((report) => {
                    const isSelected = selectedReport === report.id;
                    return (
                      <div
                        key={report.id}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20' : 'border-border-primary hover:bg-bg-secondary hover:border-border-secondary'
                        }`}
                        onClick={() => setSelectedReport(report.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <p className={`font-medium ${isSelected ? 'text-brand-primary' : ''}`}>{report.name}</p>
                        <p className="text-sm text-text-secondary">{report.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>파일 형식</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>기간</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">최근 1주</SelectItem>
                      <SelectItem value="month">최근 1개월</SelectItem>
                      <SelectItem value="quarter">최근 분기</SelectItem>
                      <SelectItem value="year">최근 1년</SelectItem>
                      <SelectItem value="all">전체</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button disabled={!selectedReport || isExporting} className="w-full" onClick={handleExport}>
                {isExporting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />생성 중...</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" />리포트 생성</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>내보내기 이력</CardTitle>
              <CardDescription>최근 생성한 리포트 목록입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {recentExports.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">아직 내보내기 이력이 없습니다.</div>
              ) : (
                <div className="space-y-3">
                  {recentExports.map((item) => {
                    const config = exportStatusConfig[item.status];
                    const StatusIcon = config.icon;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-bg-secondary rounded-lg">
                            {item.format === 'XLSX' ? <FileSpreadsheet className="h-5 w-5 text-green-600" />
                              : item.format === 'CSV' ? <FileText className="h-5 w-5 text-blue-600" />
                              : <FileText className="h-5 w-5 text-red-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{item.reportType}</p>
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <span>{item.format}</span><span>-</span><span>{item.period}</span><span>-</span><span>{item.createdAt}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={config.color}><StatusIcon className="h-3 w-3 mr-1" />{config.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>빠른 내보내기</CardTitle>
              <CardDescription>자주 사용하는 리포트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled={isExporting} onClick={() => handleQuickExport('LEARNING')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />이번 달 학습 현황
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled={isExporting} onClick={() => handleQuickExport('USERS')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />전체 사용자 목록
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled={isExporting} onClick={() => handleQuickExport('COMPLETION')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />수료 현황 요약
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>리포트 안내</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-text-secondary">
              <div><p className="font-medium text-text-primary mb-1">사용자 현황</p><p>등록된 모든 사용자의 ID, 이름, 이메일, 역할, 상태, 가입일</p></div>
              <div><p className="font-medium text-text-primary mb-1">강좌 현황</p><p>생성된 강좌 목록과 기본 정보</p></div>
              <div><p className="font-medium text-text-primary mb-1">학습 진도</p><p>사용자별 수강 현황과 진도율</p></div>
              <div><p className="font-medium text-text-primary mb-1">수료 현황</p><p>수료 완료된 수강 내역과 점수</p></div>
              <div><p className="font-medium text-text-primary mb-1">참여도 분석</p><p>사용자별 총 수강, 완료, 진행중 현황과 평균 진도율</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============== 메인 컴포넌트 ==============

export function DataAnalyticsPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="데이터 및 통계"
        description="실시간 현황, 활동 로그, 통계 내보내기를 한 곳에서 관리합니다"
      />

      <Tabs defaultValue="realtime" className="mt-6">
        <TabsList>
          <TabsTrigger value="realtime" className="gap-2">
            <Activity className="h-4 w-4" />
            실시간 현황
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="h-4 w-4" />
            이력 및 로그
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            통계 내보내기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="mt-6">
          <RealtimeTab />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <LogsTab />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ExportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
