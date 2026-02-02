import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Save,
  BookOpen,
  Clock,
  Award,
  User,
  Mail,
  Building,
  Calendar,
  Activity,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { designTokens } from '@/styles/admin-design-tokens';
import {
  AdminPageHeader,
  StatusBadge,
  RoleBadge,
} from '@/components/domain/admin';
import { Button } from '@/components/common/Button';
import { BackButton } from '@/components/common/BackButton';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/Avatar';
import { Progress } from '@/components/common/Progress';
import { Skeleton } from '@/components/common/Skeleton';
import { Checkbox } from '@/components/common/Checkbox';
import { useUser, useUpdateUser, useUpdateUserRoles, useDeleteUser, useUserRoles } from '@/hooks/ta';
import type { UserStatus, SystemRole, UserDetail, UserEnrollment, UserActivityLog } from '@/types/admin';

// 역할 정의 (우선순위 순)
const SYSTEM_ROLES: { value: SystemRole; label: string; description: string }[] = [
  { value: 'TENANT_ADMIN', label: '테넌트 관리자', description: '테넌트의 모든 설정과 사용자를 관리' },
  { value: 'OPERATOR', label: '운영자', description: '과정 및 차수 운영 관리' },
  { value: 'DESIGNER', label: '강의 개설자', description: '강의 콘텐츠 제작 및 관리' },
  { value: 'INSTRUCTOR', label: '강사', description: '배정된 강의 진행 및 학습자 관리' },
  { value: 'USER', label: '일반 사용자', description: '기본 학습자 역할' },
];

// Mock 데이터
const MOCK_USER: UserDetail = {
  id: 1,
  email: 'minsu.kim@company.com',
  name: '김민수',
  status: 'ACTIVE',
  systemRole: 'OPERATOR',
  courseRoles: [],
  tenantId: 1,
  organizationName: '개발팀',
  createdAt: '2025-01-15',
  updatedAt: '2025-01-15',
  lastLoginAt: '2025-12-29',
  phone: '010-1234-5678',
  department: '개발팀',
  position: '시니어 개발자',
  stats: {
    totalCourses: 12,
    completedCourses: 8,
    inProgressCourses: 3,
    totalLearningTime: 45,
    averageScore: 87,
  },
  enrollments: [
    { id: 1, courseTitle: 'AWS 기초 마스터', progress: 100, status: 'COMPLETED', enrolledAt: '2025-01-20', completedAt: '2025-02-15' },
    { id: 2, courseTitle: 'React 실전 프로젝트', progress: 75, status: 'IN_PROGRESS', enrolledAt: '2025-02-01' },
    { id: 3, courseTitle: 'TypeScript 완벽 가이드', progress: 60, status: 'IN_PROGRESS', enrolledAt: '2025-02-10' },
    { id: 4, courseTitle: 'Docker & Kubernetes', progress: 100, status: 'COMPLETED', enrolledAt: '2025-01-10', completedAt: '2025-01-25' },
    { id: 5, courseTitle: 'Python 데이터 분석', progress: 0, status: 'NOT_STARTED', enrolledAt: '2025-12-20' },
  ],
  activityLogs: [
    { id: 1, action: '로그인', description: '시스템에 로그인했습니다.', timestamp: '2025-12-29 09:15:00', type: 'login' },
    { id: 2, action: '강의 수강', description: 'React 실전 프로젝트 - 챕터 5 완료', timestamp: '2025-12-29 10:30:00', type: 'course' },
    { id: 3, action: '평가 완료', description: 'TypeScript 중간 테스트 완료 (85점)', timestamp: '2025-12-28 14:20:00', type: 'assessment' },
    { id: 4, action: '프로필 수정', description: '프로필 정보를 업데이트했습니다.', timestamp: '2025-12-27 16:45:00', type: 'profile' },
  ],
};

// 폼 상태용 로컬 타입
interface UserFormState {
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: UserStatus;
  systemRole: SystemRole;
  systemRoles: SystemRole[];  // 다중 역할 지원
  createdAt: string;
  lastLoginAt: string;
  stats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLearningTime: number;
    averageScore: number;
  };
  enrollments: UserEnrollment[];
  activityLogs: UserActivityLog[];
}

// API 데이터를 폼 상태로 변환
const toFormState = (data: UserDetail, roles?: SystemRole[]): UserFormState => ({
  name: data.name,
  email: data.email,
  phone: data.phone || '',
  department: data.department || '',
  position: data.position || '',
  status: data.status,
  systemRole: data.systemRole,
  systemRoles: roles || [data.systemRole],  // API에서 받은 roles 또는 기본 역할
  createdAt: data.createdAt,
  lastLoginAt: data.lastLoginAt || '',
  stats: data.stats || {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalLearningTime: 0,
    averageScore: 0,
  },
  enrollments: data.enrollments || [],
  activityLogs: data.activityLogs || [],
});

const courseStatusLabels = {
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  NOT_STARTED: '미시작',
};

const courseStatusColors = {
  IN_PROGRESS: 'text-blue-600 bg-blue-50',
  COMPLETED: 'text-green-600 bg-green-50',
  NOT_STARTED: 'text-gray-600 bg-gray-50',
};

const activityIcons = {
  login: Clock,
  course: BookOpen,
  assessment: Award,
  profile: User,
};

// 로딩 스켈레톤
function UserDetailSkeleton() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6 text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// 에러 UI
function UserDetailError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">데이터를 불러올 수 없습니다</h3>
            <p className="text-text-secondary mb-4">{message}</p>
            <Button onClick={onRetry}>다시 시도</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = Number(id);

  // 데모 모드 체크 (?demo=true)
  const isDemoMode = searchParams.get('demo') === 'true';

  // API 호출
  const { data: userData, isLoading, isError, error, refetch } = useUser(userId);
  const { data: userRolesData, refetch: refetchRoles } = useUserRoles(userId);
  const updateMutation = useUpdateUser();
  const updateRoleMutation = useUpdateUserRoles();
  const deleteMutation = useDeleteUser();

  // 실제 데이터 또는 Mock 데이터
  const effectiveData = useMemo(() => {
    if (isDemoMode) return MOCK_USER;
    return userData;
  }, [isDemoMode, userData]);

  // 폼 상태
  const [formState, setFormState] = useState<UserFormState | null>(null);

  // 데이터 로드 시 폼 상태 초기화
  useEffect(() => {
    if (effectiveData) {
      setFormState(toFormState(effectiveData, userRolesData));
    }
  }, [effectiveData, userRolesData]);

  const handleSave = async () => {
    if (!formState) return;

    try {
      await updateMutation.mutateAsync({
        id: userId,
        request: {
          name: formState.name,
          phone: formState.phone || undefined,
          department: formState.department || undefined,
          position: formState.position || undefined,
          status: formState.status,
          systemRole: formState.systemRole,
        },
      });
    } catch {
      toast.error('사용자 저장에 실패했습니다.');
    }
  };

  const handleStatusChange = (status: UserStatus) => {
    if (formState) setFormState({ ...formState, status });
  };

  // 역할 토글 핸들러 (체크박스용)
  const handleRoleToggle = async (role: SystemRole, checked: boolean) => {
    if (!formState) return;

    const previousRoles = [...formState.systemRoles];
    let newRoles: SystemRole[];

    if (checked) {
      // 역할 추가
      newRoles = [...formState.systemRoles, role];
    } else {
      // 역할 제거 (최소 1개는 유지)
      if (formState.systemRoles.length <= 1) {
        toast.error('최소 하나의 역할이 필요합니다.');
        return;
      }
      newRoles = formState.systemRoles.filter(r => r !== role);
    }

    // 낙관적 업데이트
    setFormState({ ...formState, systemRoles: newRoles });

    try {
      await updateRoleMutation.mutateAsync({
        id: userId,
        request: { roles: newRoles },
      });
      toast.success('역할이 성공적으로 변경되었습니다.');
      refetch();
      refetchRoles();
    } catch {
      // 실패 시 롤백
      setFormState({ ...formState, systemRoles: previousRoles });
      toast.error('역할 변경에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(userId);
      navigate('/ta/users');
    } catch {
      toast.error('사용자 삭제에 실패했습니다.');
    }
  };

  // 로딩 상태 (데모 모드가 아닐 때만)
  if (!isDemoMode && isLoading) {
    return <UserDetailSkeleton />;
  }

  // 에러 상태 (데모 모드가 아닐 때만)
  if (!isDemoMode && isError) {
    return (
      <UserDetailError
        message={error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
        onRetry={() => refetch()}
      />
    );
  }

  // 데이터 없음
  if (!formState) {
    return <UserDetailSkeleton />;
  }

  const isSaving = updateMutation.isPending || updateRoleMutation.isPending;

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title={formState.name}
        description={formState.email}
        breadcrumb={[
          { label: '사용자 관리', href: '/ta/users' },
          { label: formState.name },
        ]}
        actions={
          <div className="flex gap-2">
            <BackButton onClick={() => navigate('/ta/users')} />
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              저장
            </Button>
          </div>
        }
      />

      {/* 사용자 프로필 카드 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${formState.name}`} />
              <AvatarFallback className="text-2xl">{formState.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-xl font-bold">{formState.name}</h2>
                <StatusBadge status={formState.status} />
                {formState.systemRoles.map((role) => (
                  <RoleBadge key={role} role={role} />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="h-4 w-4" />
                  {formState.email}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Building className="h-4 w-4" />
                  {formState.department || '-'} {formState.position && `/ ${formState.position}`}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="h-4 w-4" />
                  가입일: {formState.createdAt}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Activity className="h-4 w-4" />
                  최근 활동: {formState.lastLoginAt || '-'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 학습 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-brand-primary">{formState.stats.totalCourses}</p>
            <p className="text-sm text-text-secondary">전체 강좌</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold" style={{ color: designTokens.badge.green.text }}>{formState.stats.completedCourses}</p>
            <p className="text-sm text-text-secondary">완료</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold" style={{ color: designTokens.badge.blue.text }}>{formState.stats.inProgressCourses}</p>
            <p className="text-sm text-text-secondary">진행 중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{formState.stats.totalLearningTime}h</p>
            <p className="text-sm text-text-secondary">총 학습 시간</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold" style={{ color: designTokens.badge.yellow.text }}>{formState.stats.averageScore}</p>
            <p className="text-sm text-text-secondary">평균 점수</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">
            <User className="w-4 h-4 mr-2" />
            기본 정보
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="w-4 h-4 mr-2" />
            수강 현황
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="w-4 h-4 mr-2" />
            활동 이력
          </TabsTrigger>
        </TabsList>

        {/* 기본 정보 탭 */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>사용자의 기본 정보를 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formState.email}
                    disabled
                    className="bg-bg-secondary"
                  />
                  <p className="text-xs text-text-secondary">이메일은 변경할 수 없습니다.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="010-0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">부서</Label>
                  <Input
                    id="department"
                    value={formState.department}
                    onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">직책</Label>
                  <Input
                    id="position"
                    value={formState.position}
                    onChange={(e) => setFormState({ ...formState, position: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select value={formState.status} onValueChange={(v) => handleStatusChange(v as UserStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">활성</SelectItem>
                      <SelectItem value="INACTIVE">비활성</SelectItem>
                      <SelectItem value="PENDING">대기</SelectItem>
                      <SelectItem value="BLOCKED">차단</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">권한 설정</h4>
                <p className="text-sm text-text-secondary mb-4">
                  사용자에게 여러 역할을 부여할 수 있습니다. 역할에 따라 접근 가능한 기능이 달라집니다.
                </p>
                <div className="space-y-3">
                  {SYSTEM_ROLES.map((role) => (
                    <div
                      key={role.value}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-bg-secondary transition-colors"
                    >
                      <Checkbox
                        id={`role-${role.value}`}
                        checked={formState.systemRoles.includes(role.value)}
                        onCheckedChange={(checked) => handleRoleToggle(role.value, checked === true)}
                        disabled={updateRoleMutation.isPending}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`role-${role.value}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {role.label}
                        </label>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {updateRoleMutation.isPending && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    역할 변경 중...
                  </div>
                )}
              </div>

              {/* 위험 영역 */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4" style={{ color: designTokens.status.error_text }}>위험 영역</h4>
                <div className="p-4 rounded-lg" style={{ backgroundColor: designTokens.status.error_background, border: `1px solid ${designTokens.status.error_text}30` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: designTokens.status.error_text }}>사용자 삭제</p>
                      <p className="text-sm text-text-secondary">
                        이 작업은 되돌릴 수 없습니다. 사용자의 모든 데이터가 삭제됩니다.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <AlertCircle className="mr-2 h-4 w-4" />
                      )}
                      사용자 삭제
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 수강 현황 탭 */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>수강 현황</CardTitle>
              <CardDescription>사용자가 등록한 강좌와 진도율을 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {formState.enrollments.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  수강 중인 강좌가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {formState.enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-bg-secondary transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{enrollment.courseTitle}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${courseStatusColors[enrollment.status]}`}>
                            {courseStatusLabels[enrollment.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>등록일: {enrollment.enrolledAt}</span>
                          {enrollment.completedAt && <span>완료일: {enrollment.completedAt}</span>}
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 활동 이력 탭 */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>활동 이력</CardTitle>
              <CardDescription>사용자의 최근 활동 내역을 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {formState.activityLogs.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  활동 이력이 없습니다.
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-6">
                    {formState.activityLogs.map((log) => {
                      const Icon = activityIcons[log.type];
                      return (
                        <div key={log.id} className="relative flex gap-4 pl-10">
                          {/* Timeline dot */}
                          <div className="absolute left-0 w-8 h-8 rounded-full bg-bg-secondary border-2 border-border flex items-center justify-center">
                            <Icon className="w-4 h-4 text-text-secondary" />
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{log.action}</h4>
                              <span className="text-sm text-text-secondary">{log.timestamp}</span>
                            </div>
                            <p className="text-sm text-text-secondary mt-1">{log.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
