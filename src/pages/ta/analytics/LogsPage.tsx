import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  Calendar,
  User,
  Loader2,
  Filter,
  X,
  LogIn,
  Users,
  BookOpen,
  GraduationCap,
  FileText,
  Settings,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { useSearchActivityLogs, useActivityStats } from '@/hooks/ta';
import type { ActivityType } from '@/services/ta/analyticsService';
import { analyticsService } from '@/services/ta/analyticsService';
import { useUsers } from '@/hooks/ta/useUserQueries';
import { designTokens } from '@/styles/admin-design-tokens';

// 카테고리 정의
type CategoryKey = 'all' | 'auth' | 'user' | 'course' | 'enrollment' | 'content' | 'settings';

interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: React.ElementType;
  types: ActivityType[];
  color: string;
}

const categories: CategoryConfig[] = [
  {
    key: 'all',
    label: '전체',
    icon: FileText,
    types: [],
    color: 'bg-gray-100 text-gray-700',
  },
  {
    key: 'auth',
    label: '인증',
    icon: LogIn,
    types: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE'],
    color: 'bg-purple-100 text-purple-700',
  },
  {
    key: 'user',
    label: '사용자',
    icon: Users,
    types: ['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CHANGE'],
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    key: 'course',
    label: '강좌',
    icon: BookOpen,
    types: ['COURSE_VIEW', 'COURSE_CREATE', 'COURSE_UPDATE', 'COURSE_DELETE'],
    color: 'bg-cyan-100 text-cyan-700',
  },
  {
    key: 'enrollment',
    label: '수강',
    icon: GraduationCap,
    types: ['ENROLLMENT_CREATE', 'ENROLLMENT_COMPLETE', 'ENROLLMENT_DROP'],
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'content',
    label: '콘텐츠',
    icon: FileText,
    types: ['CONTENT_VIEW', 'CONTENT_COMPLETE', 'PROGRAM_CREATE', 'PROGRAM_UPDATE', 'PROGRAM_APPROVE', 'PROGRAM_REJECT'],
    color: 'bg-orange-100 text-orange-700',
  },
  {
    key: 'settings',
    label: '설정',
    icon: Settings,
    types: ['SETTINGS_UPDATE', 'TENANT_CREATE', 'TENANT_UPDATE', 'OTHER'],
    color: 'bg-slate-100 text-slate-700',
  },
];

// 활동 타입별 레벨 매핑
const getLogLevel = (activityType: ActivityType): 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' => {
  const errorTypes: ActivityType[] = ['LOGIN_FAILED'];
  const successTypes: ActivityType[] = ['ENROLLMENT_COMPLETE', 'CONTENT_COMPLETE', 'PROGRAM_APPROVE'];
  const warnTypes: ActivityType[] = ['USER_DELETE', 'COURSE_DELETE', 'ENROLLMENT_DROP', 'PROGRAM_REJECT'];

  if (errorTypes.includes(activityType)) return 'ERROR';
  if (successTypes.includes(activityType)) return 'SUCCESS';
  if (warnTypes.includes(activityType)) return 'WARN';
  return 'INFO';
};

// 활동 타입별 카테고리 매핑
const getCategory = (activityType: ActivityType): CategoryConfig => {
  for (const cat of categories) {
    if (cat.types.includes(activityType)) {
      return cat;
    }
  }
  return categories[0]; // 기본: 전체
};

const levelConfig = {
  INFO: {
    icon: Info,
    badgeStyle: { backgroundColor: designTokens.badge.blue.bg, color: designTokens.badge.blue.text },
    iconContainerStyle: { backgroundColor: designTokens.badge.blue.bg },
    iconStyle: { color: designTokens.badge.blue.text },
  },
  WARN: {
    icon: AlertTriangle,
    badgeStyle: { backgroundColor: designTokens.status.warning_background, color: designTokens.status.warning_text },
    iconContainerStyle: { backgroundColor: designTokens.badge.yellow.bg },
    iconStyle: { color: designTokens.badge.yellow.text },
  },
  ERROR: {
    icon: AlertCircle,
    badgeStyle: { backgroundColor: designTokens.status.error_background, color: designTokens.status.error_text },
    iconContainerStyle: { backgroundColor: designTokens.badge.red.bg },
    iconStyle: { color: designTokens.badge.red.text },
  },
  SUCCESS: {
    icon: CheckCircle,
    badgeStyle: { backgroundColor: designTokens.status.success_background, color: designTokens.status.success_text },
    iconContainerStyle: { backgroundColor: designTokens.badge.green.bg },
    iconStyle: { color: designTokens.badge.green.text },
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

export function LogsPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<ActivityType | undefined>(undefined);
  const [userFilter, setUserFilter] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryTab, setCategoryTab] = useState<CategoryKey>('all');

  // 검색 파라미터 - 날짜 미지정 시 undefined로 전달하여 전체 조회
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

  // 사용자 목록
  const users = useMemo(() => usersData?.content || [], [usersData]);

  // 내보내기 핸들러
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

  // 필터 초기화
  const clearFilters = () => {
    setSearchKeyword('');
    setLevelFilter('all');
    setTypeFilter(undefined);
    setUserFilter(undefined);
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  // 활성 필터 개수
  const activeFilterCount = [
    levelFilter !== 'all',
    typeFilter !== undefined,
    userFilter !== undefined,
    startDate !== '',
    endDate !== '',
  ].filter(Boolean).length;

  const logs = logsData?.content || [];

  // 카테고리별 로그 카운트
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      all: logs.length,
      auth: 0,
      user: 0,
      course: 0,
      enrollment: 0,
      content: 0,
      settings: 0,
    };

    logs.forEach((log) => {
      const cat = getCategory(log.activityType);
      if (cat.key !== 'all') {
        counts[cat.key]++;
      }
    });

    return counts;
  }, [logs]);

  // 클라이언트 사이드 필터링 (검색어, 레벨, 카테고리)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 카테고리 필터
      if (categoryTab !== 'all') {
        const cat = getCategory(log.activityType);
        if (cat.key !== categoryTab) return false;
      }

      // 검색어 필터
      const matchesSearch = !searchKeyword ||
        log.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        log.activityTypeLabel?.toLowerCase().includes(searchKeyword.toLowerCase());

      // 레벨 필터
      const logLevel = getLogLevel(log.activityType);
      const matchesLevel = levelFilter === 'all' || logLevel === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [logs, categoryTab, searchKeyword, levelFilter]);

  // 레벨별 카운트
  const levelCounts = useMemo(() => ({
    INFO: logs.filter(l => getLogLevel(l.activityType) === 'INFO').length,
    SUCCESS: logs.filter(l => getLogLevel(l.activityType) === 'SUCCESS').length,
    WARN: logs.filter(l => getLogLevel(l.activityType) === 'WARN').length,
    ERROR: logs.filter(l => getLogLevel(l.activityType) === 'ERROR').length,
  }), [logs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 현재 카테고리에 해당하는 활동 유형 옵션
  const filteredTypeOptions = useMemo(() => {
    if (categoryTab === 'all') return activityTypeOptions;
    return activityTypeOptions.filter(opt => opt.category === categoryTab);
  }, [categoryTab]);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="이력 분석 및 로그 관리"
        description="테넌트 활동 로그를 조회하고 분석합니다"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="mr-2 h-4 w-4" />
              필터
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-brand-primary text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              CSV 내보내기
            </Button>
          </div>
        }
      />

      {/* 고급 필터 섹션 */}
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
              {/* 사용자 필터 */}
              <div>
                <label className="text-sm font-medium mb-1 block">사용자</label>
                <Select
                  value={userFilter?.toString() || 'all'}
                  onValueChange={(v) => {
                    setUserFilter(v === 'all' ? undefined : Number(v));
                    setPage(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="사용자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 사용자</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 활동 유형 필터 */}
              <div>
                <label className="text-sm font-medium mb-1 block">활동 유형</label>
                <Select
                  value={typeFilter || 'all'}
                  onValueChange={(v) => {
                    setTypeFilter(v === 'all' ? undefined : v as ActivityType);
                    setPage(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="활동 유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {filteredTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 시작일 */}
              <div>
                <label className="text-sm font-medium mb-1 block">시작일</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              {/* 종료일 */}
              <div>
                <label className="text-sm font-medium mb-1 block">종료일</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: designTokens.badge.blue.bg }}>
                <Info className="h-5 w-5" style={{ color: designTokens.badge.blue.text }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: designTokens.text.primary }}>
                  {stats?.totalActivities || logs.length}
                </p>
                <p className="text-sm" style={{ color: designTokens.text.secondary }}>전체 활동</p>
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
                <p className="text-2xl font-bold" style={{ color: designTokens.text.primary }}>
                  {stats?.todayActivities || 0}
                </p>
                <p className="text-sm" style={{ color: designTokens.text.secondary }}>오늘 활동</p>
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
                <p className="text-2xl font-bold" style={{ color: designTokens.text.primary }}>
                  {levelCounts.WARN}
                </p>
                <p className="text-sm" style={{ color: designTokens.text.secondary }}>경고</p>
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
                <p className="text-2xl font-bold" style={{ color: designTokens.text.primary }}>
                  {levelCounts.ERROR}
                </p>
                <p className="text-sm" style={{ color: designTokens.text.secondary }}>오류</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리별 탭 */}
      <Tabs value={categoryTab} onValueChange={(v) => { setCategoryTab(v as CategoryKey); setPage(0); }}>
        <TabsList className="mb-4 flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.key} value={cat.key} className="gap-2">
                <Icon className="h-4 w-4" />
                {cat.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {categoryCounts[cat.key]}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* 모든 카테고리에 동일한 콘텐츠 렌더링 */}
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
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                        style={{ color: designTokens.text.secondary }}
                      />
                      <Input
                        placeholder="검색..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="레벨" />
                      </SelectTrigger>
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
                  <div className="text-center py-12" style={{ color: designTokens.text.secondary }}>
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
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                          style={{
                            border: `1px solid ${designTokens.bg.border}`,
                            backgroundColor: designTokens.bg.default,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = designTokens.bg.secondary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = designTokens.bg.default;
                          }}
                        >
                          <div
                            className="shrink-0 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                            style={config.badgeStyle}
                          >
                            <LevelIcon className="h-3 w-3" />
                            {level}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`${logCategory.color} shrink-0`}>
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {logCategory.label}
                              </Badge>
                              <span className="font-medium" style={{ color: designTokens.text.primary }}>
                                {log.activityTypeLabel}
                              </span>
                              {log.userName && (
                                <span className="text-sm flex items-center gap-1" style={{ color: designTokens.text.secondary }}>
                                  <User className="h-3 w-3" />
                                  {log.userName}
                                </span>
                              )}
                            </div>
                            <p className="text-sm mt-1" style={{ color: designTokens.text.primary }}>
                              {log.description}
                            </p>
                            {log.targetName && (
                              <p className="text-xs mt-1" style={{ color: designTokens.text.secondary }}>
                                대상: {log.targetType} - {log.targetName}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: designTokens.text.secondary }}>
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

                {/* Pagination */}
                {logsData && logsData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={logsData.first}
                      style={logsData.first ? {
                        backgroundColor: designTokens.status.neutral_disabled_bg,
                        color: designTokens.status.neutral_disabled_text,
                        cursor: 'not-allowed',
                        opacity: 0.6,
                      } : undefined}
                    >
                      이전
                    </Button>
                    <span className="text-sm" style={{ color: designTokens.text.secondary }}>
                      {logsData.number + 1} / {logsData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={logsData.last}
                      style={logsData.last ? {
                        backgroundColor: designTokens.status.neutral_disabled_bg,
                        color: designTokens.status.neutral_disabled_text,
                        cursor: 'not-allowed',
                        opacity: 0.6,
                      } : undefined}
                    >
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
