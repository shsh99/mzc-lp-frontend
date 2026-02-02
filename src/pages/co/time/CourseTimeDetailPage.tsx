import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubdomainPath } from '@/hooks/common';
import { toast } from 'sonner';
import {
  Edit,
  Copy,
  Trash2,
  Play,
  Square,
  Archive,
  Users,
  Calendar,
  Clock,
  Loader2,
  Save,
  X,
  UserPlus,
  FileText,
  BookOpen,
  User,
  CheckCircle2,
  FileEdit,
  Megaphone,
  GraduationCap,
  Lock,
  Package,
  Zap,
  ClipboardList,
  BarChart3,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { CloneCourseTimeDialog } from '@/components/domain/co';
import { cn } from '@/utils/cn';
import {
  Button,
  Badge,
  Input,
  NativeSelect,
  Card,
  BackButton,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/common';
import {
  useTime,
  useUpdateTime,
  useDeleteTime,
  useOpenTime,
  useStartTime,
  useCloseTime,
  useArchiveTime,
} from '@/hooks/co/useTimeQueries';
import type { CourseTimeStatus, UpdateCourseTimeRequest, DeliveryType, EnrollmentMethod, DurationType } from '@/types/co/time.types';
import {
  COURSE_TIME_STATUS_LABELS,
  DELIVERY_TYPE_LABELS,
  ENROLLMENT_METHOD_LABELS,
  COURSE_TIME_STATUS_TRANSITIONS,
  DURATION_TYPE_LABELS,
  DAY_OF_WEEK_LABELS,
  COURSE_DIFFICULTY_LABELS,
  COURSE_DIFFICULTY_COLORS,
} from '@/types/co/time.types';

interface CourseTimeDetailPageProps {
  language?: 'ko' | 'en';
}

const t = {
  title: { ko: '차수 상세', en: 'Course Time Detail' },
  back: { ko: '목록으로', en: 'Back to List' },
  edit: { ko: '수정', en: 'Edit' },
  save: { ko: '저장', en: 'Save' },
  cancel: { ko: '취소', en: 'Cancel' },
  clone: { ko: '복제', en: 'Clone' },
  delete: { ko: '삭제', en: 'Delete' },
  // Status Actions
  openRecruiting: { ko: '모집 시작', en: 'Start Recruiting' },
  startLearning: { ko: '학습 시작', en: 'Start Learning' },
  closeCourse: { ko: '종료', en: 'Close' },
  archiveCourse: { ko: '보관', en: 'Archive' },
  // Sections
  basicInfo: { ko: '기본 정보', en: 'Basic Information' },
  timeTitle: { ko: '차수명', en: 'Title' },
  status: { ko: '상태', en: 'Status' },
  description: { ko: '설명', en: 'Description' },
  courseInfo: { ko: '과정 정보', en: 'Course Information' },
  courseId: { ko: '과정 ID', en: 'Course ID' },
  courseTitle: { ko: '과정명', en: 'Course Title' },
  deliveryInfo: { ko: '진행 정보', en: 'Delivery Information' },
  deliveryType: { ko: '진행 방식', en: 'Delivery Type' },
  enrollmentMethod: { ko: '수강 신청 방식', en: 'Enrollment Method' },
  location: { ko: '장소', en: 'Location' },
  periodInfo: { ko: '기간 정보', en: 'Period Information' },
  enrollmentPeriod: { ko: '모집 기간', en: 'Enrollment Period' },
  learningPeriod: { ko: '학습 기간', en: 'Learning Period' },
  durationType: { ko: '학습 기간 유형', en: 'Duration Type' },
  durationDays: { ko: '수강 일수', en: 'Duration Days' },
  capacityInfo: { ko: '정원 및 수강', en: 'Capacity & Enrollment' },
  capacity: { ko: '정원', en: 'Capacity' },
  currentEnrollment: { ko: '현재 수강 인원', en: 'Current Enrollment' },
  availableSeats: { ko: '잔여 좌석', en: 'Available Seats' },
  price: { ko: '가격', en: 'Price' },
  unlimited: { ko: '무제한', en: 'Unlimited' },
  free: { ko: '무료', en: 'Free' },
  instructors: { ko: '강사 정보', en: 'Instructors' },
  noInstructors: { ko: '배정된 강사가 없습니다.', en: 'No instructors assigned.' },
  addInstructor: { ko: '강사 추가', en: 'Add Instructor' },
  // Instructor Roles
  MAIN: { ko: '메인 강사', en: 'Main Instructor' },
  SUB: { ko: '서브 강사', en: 'Sub Instructor' },
  ASSISTANT: { ko: '조교', en: 'Assistant' },
  // Messages
  loading: { ko: '로딩 중...', en: 'Loading...' },
  error: { ko: '오류가 발생했습니다.', en: 'An error occurred.' },
  notFound: { ko: '차수를 찾을 수 없습니다.', en: 'Course time not found.' },
  confirmDelete: { ko: '차수 삭제', en: 'Delete Course Time' },
  confirmDeleteDesc: { ko: '이 차수를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.', en: 'Are you sure you want to delete this course time? This action cannot be undone.' },
  confirmStatusChange: { ko: '상태 변경', en: 'Change Status' },
  confirmStatusChangeDesc: { ko: '상태를 변경하시겠습니까? 이 작업은 취소할 수 없습니다.', en: 'Are you sure you want to change the status? This action cannot be undone.' },
  confirm: { ko: '확인', en: 'Confirm' },
  updateSuccess: { ko: '수정되었습니다.', en: 'Updated successfully.' },
  updateError: { ko: '수정에 실패했습니다.', en: 'Failed to update.' },
  deleteSuccess: { ko: '삭제되었습니다.', en: 'Deleted successfully.' },
  statusChangeError: { ko: '상태 변경에 실패했습니다.', en: 'Failed to change status.' },
  noDescription: { ko: '설명 없음', en: 'No description' },
  noLocation: { ko: '장소 미지정', en: 'No location' },
  // Additional Info
  createdAt: { ko: '생성일', en: 'Created' },
  allowLateEnrollment: { ko: '중간 합류', en: 'Late Enrollment' },
  allowLateEnrollmentYes: { ko: '허용', en: 'Allowed' },
  allowLateEnrollmentNo: { ko: '비허용', en: 'Not Allowed' },
  minProgressForCompletion: { ko: '수료 기준', en: 'Completion Criteria' },
  alwaysOpen: { ko: '수시 모집', en: 'Rolling Admission' },
  // Quick Actions
  quickActions: { ko: '빠른 작업', en: 'Quick Actions' },
  viewEnrollments: { ko: '수강생 목록', en: 'View Enrollments' },
  viewEnrollmentsDesc: { ko: '수강 신청 현황 보기', en: 'View enrollment status' },
  attendanceManagement: { ko: '출결 관리', en: 'Attendance' },
  attendanceManagementDesc: { ko: '출석 현황 관리', en: 'Manage attendance' },
  gradeManagement: { ko: '성적 관리', en: 'Grades' },
  gradeManagementDesc: { ko: '성적 및 수료 관리', en: 'Manage grades' },
  comingSoon: { ko: '준비 중', en: 'Coming Soon' },
};

// 백엔드 에러 코드 → 사용자 친화적 메시지 매핑
const ERROR_MESSAGES: Record<string, { ko: string; en: string }> = {
  TS001: { ko: '차수를 찾을 수 없습니다.', en: 'Course time not found.' },
  TS002: { ko: '유효하지 않은 상태 전환입니다.', en: 'Invalid status transition.' },
  TS003: { ko: '정원이 초과되었습니다.', en: 'Capacity exceeded.' },
  TS004: { ko: '유효하지 않은 기간입니다.', en: 'Invalid date range.' },
  TS005: { ko: '오프라인/블렌디드 과정은 장소 정보가 필요합니다.', en: 'Location info required for offline/blended courses.' },
  TS006: { ko: '현재 상태에서는 차수를 수정할 수 없습니다.', en: 'Course time is not modifiable in current status.' },
  TS007: { ko: '진행 중인 과정에서는 메인 강사를 삭제할 수 없습니다.', en: 'Cannot delete main instructor while course is ongoing.' },
  TS008: { ko: '모집을 시작하려면 메인 강사를 먼저 배정해야 합니다.', en: 'Main instructor must be assigned before starting recruitment.' },
  TS009: { ko: '이 차수에 접근할 권한이 없습니다.', en: 'Not authorized to access this course time.' },
};

const statusBadgeVariant: Record<CourseTimeStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  DRAFT: 'secondary',
  RECRUITING: 'default',
  ONGOING: 'success',
  CLOSED: 'warning',
  ARCHIVED: 'destructive',
};

export function CourseTimeDetailPage({ language = 'ko' }: Readonly<CourseTimeDetailPageProps>) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { prefixPath } = useSubdomainPath();
  const timeId = parseInt(id || '0');

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateCourseTimeRequest>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);

  const getText = (key: keyof typeof t) => (language === 'ko' ? t[key].ko : t[key].en);

  // React Query Hooks
  const { data: courseTime, isLoading, error } = useTime(timeId);
  const updateTime = useUpdateTime();
  const deleteTime = useDeleteTime();
  const openTime = useOpenTime();
  const startTime = useStartTime();
  const closeTime = useCloseTime();
  const archiveTime = useArchiveTime();

  // 날짜만 표시 (시간 제외)
  const formatDate = (dateStr: string) => {
    // 상시모집 날짜인 경우
    if (dateStr === '9999-12-31') {
      return getText('alwaysOpen');
    }
    return new Date(dateStr).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 날짜+시간 표시 (생성일 등에 사용)
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: string | null, isFree: boolean) => {
    if (isFree || price === null || price === '0') return getText('free');
    const numPrice = parseFloat(price);
    return language === 'ko' ? `${numPrice.toLocaleString()}원` : `$${numPrice.toLocaleString()}`;
  };

  const handleEdit = () => {
    if (courseTime) {
      setEditData({
        title: courseTime.title,
        deliveryType: courseTime.deliveryType,
        enrollmentMethod: courseTime.enrollmentMethod,
        location: courseTime.locationInfo || '',
        capacity: courseTime.capacity,
        price: courseTime.price ? parseFloat(courseTime.price) : null,
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSave = async () => {
    try {
      await updateTime.mutateAsync({ id: timeId, request: editData });
      setIsEditing(false);
      toast.success(getText('updateSuccess'));
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(getText('updateError'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTime.mutateAsync(timeId);
      setDeleteDialogOpen(false);
      toast.success(getText('deleteSuccess'));
      navigate(prefixPath('/co/times'));
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(getText('statusChangeError'));
    }
  };

  const getErrorMessage = (err: unknown): string => {
    // Axios 에러 응답에서 에러 코드 추출
    const errorResponse = (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response?.data?.error;
    const errorCode = errorResponse?.code;

    if (errorCode && ERROR_MESSAGES[errorCode]) {
      return language === 'ko' ? ERROR_MESSAGES[errorCode].ko : ERROR_MESSAGES[errorCode].en;
    }

    // 백엔드 메시지가 있으면 사용
    if (errorResponse?.message) {
      return errorResponse.message;
    }

    return getText('statusChangeError');
  };

  const handleStatusTransition = async () => {
    if (!courseTime) return;

    try {
      switch (courseTime.status) {
        case 'DRAFT':
          await openTime.mutateAsync(timeId);
          break;
        case 'RECRUITING':
          await startTime.mutateAsync(timeId);
          break;
        case 'ONGOING':
          await closeTime.mutateAsync(timeId);
          break;
        case 'CLOSED':
          await archiveTime.mutateAsync(timeId);
          break;
      }
      setStatusChangeDialogOpen(false);
    } catch (err) {
      console.error('Status transition failed:', err);
      toast.error(getErrorMessage(err));
    }
  };

  const getStatusActionButton = () => {
    if (!courseTime) return null;
    const nextStatus = COURSE_TIME_STATUS_TRANSITIONS[courseTime.status];
    if (!nextStatus) return null;

    const actionMap: Record<CourseTimeStatus, { label: keyof typeof t; icon: React.ReactNode }> = {
      DRAFT: { label: 'openRecruiting', icon: <Play size={16} /> },
      RECRUITING: { label: 'startLearning', icon: <Clock size={16} /> },
      ONGOING: { label: 'closeCourse', icon: <Square size={16} /> },
      CLOSED: { label: 'archiveCourse', icon: <Archive size={16} /> },
      ARCHIVED: { label: 'archiveCourse', icon: <Archive size={16} /> },
    };

    const action = actionMap[courseTime.status];
    const isLoading = openTime.isPending || startTime.isPending || closeTime.isPending || archiveTime.isPending;

    return (
      <Button onClick={() => setStatusChangeDialogOpen(true)} disabled={isLoading} variant="brand">
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : action.icon}
        <span>{getText(action.label)}</span>
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-app">
        <Loader2 size={32} className="animate-spin text-text-secondary" />
        <span className="ml-2 text-text-secondary">{getText('loading')}</span>
      </div>
    );
  }

  if (error || !courseTime) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-app">
        <div className="text-center">
          <Calendar size={48} className="mx-auto mb-3 text-text-placeholder" />
          <p className="text-text-secondary">{error ? getText('error') : getText('notFound')}</p>
          <BackButton
            onClick={() => navigate(prefixPath('/co/times'))}
            label={getText('back')}
            className="mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-app">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-app border-b border-border">
        <div className="p-6 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton
                onClick={() => navigate(prefixPath('/co/times'))}
                label={getText('back')}
              />
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <Input
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="text-xl font-bold h-auto py-1 min-w-[300px]"
                  />
                ) : (
                  <h1 className="text-text-primary mb-0">{courseTime.title}</h1>
                )}
                <Badge variant={statusBadgeVariant[courseTime.status]}>
                  {COURSE_TIME_STATUS_LABELS[courseTime.status]}
                </Badge>
                <span className="text-text-placeholder text-xs">
                  ID: {courseTime.id}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" onClick={handleCancelEdit}>
                    <X size={20} />
                    <span>{getText('cancel')}</span>
                  </Button>
                  <Button onClick={handleSave} disabled={updateTime.isPending}>
                    {updateTime.isPending ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Save size={20} />
                    )}
                    <span>{getText('save')}</span>
                  </Button>
                </>
              ) : (
                <>
                  {courseTime.status === 'DRAFT' && (
                    <Button variant="ghost" onClick={handleEdit}>
                      <Edit size={20} />
                      <span>{getText('edit')}</span>
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setCloneDialogOpen(true)}>
                    <Copy size={20} />
                    <span>{getText('clone')}</span>
                  </Button>
                  {courseTime.status === 'DRAFT' && (
                    <Button variant="ghost" onClick={() => setDeleteDialogOpen(true)} disabled={deleteTime.isPending}>
                      <Trash2 size={20} className="text-status-error" />
                      <span className="text-status-error">{getText('delete')}</span>
                    </Button>
                  )}
                  {getStatusActionButton()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Status Stepper */}
        <div className="px-8 py-4 border-b border-border bg-bg-primary">
          <div className="max-w-4xl mx-auto">
            {(() => {
              const statusOrder: CourseTimeStatus[] = ['DRAFT', 'RECRUITING', 'ONGOING', 'CLOSED', 'ARCHIVED'];
              const currentIndex = statusOrder.indexOf(courseTime.status);
              const statusIcons: Record<CourseTimeStatus, React.ReactNode> = {
                DRAFT: <FileEdit size={16} />,
                RECRUITING: <Megaphone size={16} />,
                ONGOING: <GraduationCap size={16} />,
                CLOSED: <Lock size={16} />,
                ARCHIVED: <Package size={16} />,
              };

              return (
                <div className="flex items-center justify-between">
                  {statusOrder.map((status, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isUpcoming = index > currentIndex;

                    return (
                      <div key={status} className="flex items-center flex-1">
                        {/* Step */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                              isCompleted && 'bg-status-success text-white',
                              isCurrent && 'bg-action-primary text-white ring-4 ring-action-primary/20',
                              isUpcoming && 'bg-bg-secondary text-text-placeholder'
                            )}
                          >
                            {isCompleted ? <CheckCircle2 size={20} /> : statusIcons[status]}
                          </div>
                          <span
                            className={cn(
                              'text-xs mt-2 font-medium',
                              isCompleted && 'text-status-success',
                              isCurrent && 'text-action-primary',
                              isUpcoming && 'text-text-placeholder'
                            )}
                          >
                            {COURSE_TIME_STATUS_LABELS[status]}
                          </span>
                        </div>
                        {/* Connector Line */}
                        {index < statusOrder.length - 1 && (
                          <div
                            className={cn(
                              'flex-1 h-0.5 mx-2',
                              index < currentIndex ? 'bg-status-success' : 'bg-border'
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        {(
          <div className="p-6 px-8 max-w-6xl">
            {/* Bento Grid 레이아웃 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 기본 정보 (2열 차지) */}
              <Card className="p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-text-secondary" />
                  {getText('basicInfo')}
                </h2>
                <div className="flex gap-6">
                  {/* 썸네일 이미지 */}
                  <div className="shrink-0">
                    {courseTime.courseThumbnailUrl ? (
                      <img
                        src={courseTime.courseThumbnailUrl}
                        alt={courseTime.courseTitle || ''}
                        className="w-32 h-24 object-cover rounded-lg bg-bg-secondary"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={cn(
                      'w-32 h-24 rounded-lg bg-indigo-100 flex items-center justify-center',
                      courseTime.courseThumbnailUrl && 'hidden'
                    )}>
                      <BookOpen size={40} className="text-indigo-400" />
                    </div>
                  </div>
                  {/* 2열 그리드 레이아웃 */}
                  <div className="flex-1 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
                    {/* 과정 */}
                    <span className="text-sm text-text-secondary self-start pt-0.5">{getText('courseTitle')}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(prefixPath(`/co/courses/${courseTime.courseId}`))}
                        className="group flex items-center gap-1.5 hover:text-action-primary transition-colors"
                      >
                        <span className="text-sm font-medium text-text-primary group-hover:text-action-primary">
                          {courseTime.courseTitle || '-'}
                        </span>
                        <ExternalLink size={12} className="text-text-placeholder group-hover:text-action-primary" />
                      </button>
                      {/* 카테고리 (있을 때만) */}
                      {courseTime.courseCategory && (
                        <span className="text-xs text-text-secondary">
                          · {courseTime.courseCategory}
                        </span>
                      )}
                      {/* 난이도 뱃지 (있을 때만) */}
                      {courseTime.courseDifficulty && (
                        <Badge
                          className={cn(
                            COURSE_DIFFICULTY_COLORS[courseTime.courseDifficulty].bg,
                            COURSE_DIFFICULTY_COLORS[courseTime.courseDifficulty].text,
                            COURSE_DIFFICULTY_COLORS[courseTime.courseDifficulty].border
                          )}
                        >
                          {COURSE_DIFFICULTY_LABELS[courseTime.courseDifficulty]}
                        </Badge>
                      )}
                    </div>

                    {/* 설명 - 위계 구분 전략 */}
                    {(() => {
                      const hasTimeDesc = !!courseTime.description;
                      const hasCourseDesc = !!courseTime.courseDescription;
                      const isSameContent = hasTimeDesc && hasCourseDesc &&
                        courseTime.description?.trim() === courseTime.courseDescription?.trim();

                      // 둘 다 없으면 표시 안함
                      if (!hasTimeDesc && !hasCourseDesc) return null;

                      // 내용이 같으면 하나만 표시
                      if (isSameContent) {
                        return (
                          <>
                            <span className="text-sm text-text-secondary self-start pt-0.5">{getText('description')}</span>
                            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                              {courseTime.description}
                            </p>
                          </>
                        );
                      }

                      // 둘 다 있고 내용이 다르면 위계 구분하여 표시
                      if (hasTimeDesc && hasCourseDesc) {
                        return (
                          <>
                            <span className="text-sm text-text-secondary self-start pt-0.5">{getText('description')}</span>
                            <div className="space-y-3">
                              {/* 과정 설명 (Base) */}
                              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                                {courseTime.courseDescription}
                              </p>
                              {/* 차수 설명 (Override) */}
                              <div className="relative pl-0 py-1 before:absolute before:left-[-12px] before:top-0 before:bottom-0 before:w-0.5 before:bg-amber-400">
                                <p className="text-xs font-medium text-amber-700 mb-1">
                                  {language === 'ko' ? '차수 설명' : 'Session Description'}
                                </p>
                                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                                  {courseTime.description}
                                </p>
                              </div>
                            </div>
                          </>
                        );
                      }

                      // 차수 설명만 있을 때
                      if (hasTimeDesc) {
                        return (
                          <>
                            <span className="text-sm text-text-secondary self-start pt-0.5">{getText('description')}</span>
                            <div className="relative pl-0 py-1 before:absolute before:left-[-12px] before:top-0 before:bottom-0 before:w-0.5 before:bg-amber-400">
                              <p className="text-xs font-medium text-amber-700 mb-1">
                                {language === 'ko' ? '차수 설명' : 'Session Description'}
                              </p>
                              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                                {courseTime.description}
                              </p>
                            </div>
                          </>
                        );
                      }

                      // 과정 설명만 있을 때 (Fallback)
                      return (
                        <>
                          <span className="text-sm text-text-secondary self-start pt-0.5">{getText('description')}</span>
                          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                            {courseTime.courseDescription}
                          </p>
                        </>
                      );
                    })()}

                    {/* 생성일 */}
                    <span className="text-sm text-text-secondary self-start pt-0.5">{getText('createdAt')}</span>
                    <span className="text-sm text-text-primary">
                      {formatDateTime(courseTime.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* 정원 현황 */}
              <Card className="p-3 sm:p-4 md:p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Users size={18} className="text-text-secondary" />
                  {getText('capacityInfo')}
                </h2>
                {(() => {
                  const isUnlimited = !courseTime.capacity || courseTime.capacity >= 2147483647;
                  const isUnlimitedSeats = courseTime.availableSeats === null || courseTime.availableSeats >= 2147483647;
                  const capacity = courseTime.capacity ?? 1;
                  const fillPercentage = isUnlimited ? 0 : (courseTime.currentEnrollment / capacity) * 100;

                  return (
                    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
                      {/* 정원 */}
                      <span className="text-sm text-text-secondary">{getText('capacity')}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {isUnlimited ? getText('unlimited') : `${courseTime.capacity}${language === 'ko' ? '명' : ''}`}
                      </span>

                      {/* 현재 수강 */}
                      <span className="text-sm text-text-secondary">{getText('currentEnrollment')}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {courseTime.currentEnrollment}{language === 'ko' ? '명' : ''}
                      </span>

                      {/* 잔여석 (제한된 경우만) */}
                      {!isUnlimited && (
                        <>
                          <span className="text-sm text-text-secondary">{getText('availableSeats')}</span>
                          <span className={cn(
                            'text-sm font-medium',
                            (courseTime.availableSeats ?? 0) === 0 ? 'text-status-error' : 'text-status-success'
                          )}>
                            {isUnlimitedSeats
                              ? getText('unlimited')
                              : (courseTime.availableSeats ?? 0) === 0
                                ? (language === 'ko' ? '마감' : 'Full')
                                : `${courseTime.availableSeats}${language === 'ko' ? '명' : ''}`
                            }
                          </span>
                        </>
                      )}

                      {/* Progress Bar (제한된 경우만) */}
                      {!isUnlimited && (
                        <>
                          <span className="text-sm text-text-secondary self-center">
                            {language === 'ko' ? '모집률' : 'Fill Rate'}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-bg-secondary rounded-full h-2 overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-500',
                                  fillPercentage >= 90
                                    ? 'bg-status-error'
                                    : fillPercentage >= 70
                                    ? 'bg-status-warning'
                                    : 'bg-status-success'
                                )}
                                style={{ width: `${Math.min(100, fillPercentage)}%` }}
                              />
                            </div>
                            <span className="text-sm text-text-secondary w-12">
                              {Math.round(fillPercentage)}%
                            </span>
                          </div>
                        </>
                      )}

                      {/* 구분선 */}
                      <div className="col-span-2 border-t border-border my-1" />

                      {/* 가격 */}
                      <span className="text-sm text-text-secondary">{getText('price')}</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData.price ?? ''}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              price: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          placeholder="0 = 무료"
                          className="w-32"
                        />
                      ) : (
                        <span className="text-sm font-medium text-text-primary">
                          {formatPrice(courseTime.price, courseTime.isFree)}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </Card>

              {/* 기간 정보 */}
              <Card className="p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-text-secondary" />
                  {getText('periodInfo')}
                </h2>

                {/* 2단 분할 레이아웃 */}
                <div className="flex gap-6">
                  {/* 좌측: 모집 기간 */}
                  <div className="flex-1 space-y-2">
                    {/* 헤더 + 뱃지 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-text-secondary">
                        {getText('enrollmentPeriod')}
                      </h3>
                      {(() => {
                        const today = new Date();
                        const enrollStart = new Date(courseTime.enrollStartDate);
                        const enrollEnd = new Date(courseTime.enrollEndDate);
                        const classStart = new Date(courseTime.classStartDate);
                        const dayBeforeClassStart = new Date(classStart);
                        dayBeforeClassStart.setDate(dayBeforeClassStart.getDate() - 1);
                        const isAlwaysOpen = courseTime.enrollEndDate === '9999-12-31' ||
                          enrollEnd.toDateString() === dayBeforeClassStart.toDateString();

                        if (isAlwaysOpen) {
                          return <Badge variant="success">{getText('alwaysOpen')}</Badge>;
                        } else if (today < enrollStart) {
                          const daysUntil = Math.ceil((enrollStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              {language === 'ko' ? `모집 예정 (D-${daysUntil})` : `Upcoming (D-${daysUntil})`}
                            </Badge>
                          );
                        } else if (today <= enrollEnd) {
                          const daysLeft = Math.ceil((enrollEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          if (daysLeft <= 3) {
                            return <Badge variant="destructive">{language === 'ko' ? `마감 임박 (D-${daysLeft})` : `Closing Soon (D-${daysLeft})`}</Badge>;
                          } else if (daysLeft <= 7) {
                            return <Badge variant="warning">{language === 'ko' ? `모집 중 (D-${daysLeft})` : `Open (D-${daysLeft})`}</Badge>;
                          }
                          return <Badge variant="success">{language === 'ko' ? `모집 중 (D-${daysLeft})` : `Open (D-${daysLeft})`}</Badge>;
                        } else {
                          return <Badge variant="destructive">{language === 'ko' ? '모집 종료' : 'Closed'}</Badge>;
                        }
                      })()}
                    </div>
                    {/* 날짜 데이터 */}
                    <p className="text-sm font-medium text-text-primary">
                      {(() => {
                        const classStart = new Date(courseTime.classStartDate);
                        const enrollEnd = new Date(courseTime.enrollEndDate);
                        const dayBeforeClassStart = new Date(classStart);
                        dayBeforeClassStart.setDate(dayBeforeClassStart.getDate() - 1);
                        const isAlwaysOpen = courseTime.enrollEndDate === '9999-12-31' ||
                          enrollEnd.toDateString() === dayBeforeClassStart.toDateString();

                        if (isAlwaysOpen) {
                          return `${formatDate(courseTime.enrollStartDate)} ~`;
                        }
                        return `${formatDate(courseTime.enrollStartDate)} ~ ${formatDate(courseTime.enrollEndDate)}`;
                      })()}
                    </p>
                  </div>

                  {/* 수직 구분선 */}
                  <div className="w-px bg-border" />

                  {/* 우측: 학습 기간 */}
                  <div className="flex-1 space-y-2">
                    {/* 헤더 + 뱃지 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-text-secondary">
                        {getText('learningPeriod')}
                      </h3>
                      {courseTime.durationType && (
                        <Badge variant="secondary">
                          {DURATION_TYPE_LABELS[courseTime.durationType as DurationType]}
                        </Badge>
                      )}
                    </div>
                    {/* 날짜 데이터 */}
                    <div className="space-y-1">
                      {/* FIXED: 시작일 ~ 종료일 */}
                      {courseTime.durationType === 'FIXED' && (
                        <p className="text-sm font-medium text-text-primary">
                          {formatDate(courseTime.classStartDate)} ~ {formatDate(courseTime.classEndDate || '')}
                        </p>
                      )}
                      {/* RELATIVE: 수강 신청일로부터 N일간 */}
                      {courseTime.durationType === 'RELATIVE' && (
                        <>
                          <p className="text-sm text-text-primary">
                            {language === 'ko' ? '수강 신청일로부터 ' : 'From enrollment, '}
                            <span className="font-bold text-indigo-600">
                              {courseTime.durationDays}{language === 'ko' ? '일간' : ' days'}
                            </span>
                          </p>
                          <p className="text-xs text-text-secondary">
                            ({formatDate(courseTime.classStartDate)} {language === 'ko' ? '부터 수강 가능' : 'onwards'})
                          </p>
                        </>
                      )}
                      {/* UNLIMITED: 시작일부터 무제한 */}
                      {courseTime.durationType === 'UNLIMITED' && (
                        <p className="text-sm font-medium text-text-primary">
                          {formatDate(courseTime.classStartDate)} ~
                        </p>
                      )}
                      {/* durationType이 없는 경우 */}
                      {!courseTime.durationType && (
                        <p className="text-sm font-medium text-text-primary">
                          {formatDate(courseTime.classStartDate)} ~ {formatDate(courseTime.classEndDate || '')}
                        </p>
                      )}
                    </div>

                    {/* 정기 수업 일정 */}
                    {courseTime.recurringSchedule && (
                      <div className="pt-2 mt-2 border-t border-border">
                        <p className="text-xs text-text-secondary mb-1.5">
                          {language === 'ko' ? '정기 수업' : 'Schedule'}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex gap-1">
                            {courseTime.recurringSchedule.daysOfWeek.map((day) => (
                              <Badge key={day} className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                                {DAY_OF_WEEK_LABELS[day]}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-sm text-text-primary">
                            {courseTime.recurringSchedule.startTime} ~ {courseTime.recurringSchedule.endTime}
                          </span>
                        </div>
                        {courseTime.recurringSchedule.excludeHolidays && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {language === 'ko' ? '공휴일 제외' : 'Excl. Holidays'}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 하단: 공통 메타 정보 */}
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 flex-wrap">
                  {/* 중간 합류 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">{getText('allowLateEnrollment')}</span>
                    {(() => {
                      const isUnlimitedWithNoCapacity = courseTime.durationType === 'UNLIMITED' &&
                        (!courseTime.capacity || courseTime.capacity >= 2147483647);
                      const isAllowed = isUnlimitedWithNoCapacity || courseTime.allowLateEnrollment;
                      return (
                        <Badge variant={isAllowed ? 'success' : 'secondary'}>
                          {isAllowed ? getText('allowLateEnrollmentYes') : getText('allowLateEnrollmentNo')}
                        </Badge>
                      );
                    })()}
                  </div>

                  {/* 세로 구분선 */}
                  {courseTime.minProgressForCompletion && (
                    <div className="h-4 w-px bg-border" />
                  )}

                  {/* 수료 기준 */}
                  {courseTime.minProgressForCompletion && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">{getText('minProgressForCompletion')}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {courseTime.minProgressForCompletion}%
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* 진행 정보 */}
              <Card className="p-3 sm:p-4 md:p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Play size={18} className="text-text-secondary" />
                  {getText('deliveryInfo')}
                </h2>
                <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
                  {/* 진행 방식 */}
                  <span className="text-sm text-text-secondary">{getText('deliveryType')}</span>
                  {isEditing ? (
                    <NativeSelect
                      value={editData.deliveryType || courseTime.deliveryType}
                      onChange={(e) =>
                        setEditData({ ...editData, deliveryType: e.target.value as DeliveryType })
                      }
                      options={Object.entries(DELIVERY_TYPE_LABELS).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {DELIVERY_TYPE_LABELS[courseTime.deliveryType]}
                    </span>
                  )}

                  {/* 수강 신청 방식 */}
                  <span className="text-sm text-text-secondary">{getText('enrollmentMethod')}</span>
                  {isEditing ? (
                    <NativeSelect
                      value={editData.enrollmentMethod || courseTime.enrollmentMethod}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          enrollmentMethod: e.target.value as EnrollmentMethod,
                        })
                      }
                      options={Object.entries(ENROLLMENT_METHOD_LABELS).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {ENROLLMENT_METHOD_LABELS[courseTime.enrollmentMethod]}
                    </span>
                  )}

                  {/* 장소 */}
                  <span className="text-sm text-text-secondary">{getText('location')}</span>
                  {isEditing ? (
                    <Input
                      value={editData.location || ''}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    />
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {courseTime.locationInfo || getText('noLocation')}
                    </span>
                  )}
                </div>
              </Card>

              {/* 강사 정보 (전체 너비) */}
              <Card className="p-6 lg:col-span-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <User size={18} className="text-text-secondary" />
                    {getText('instructors')}
                  </h2>
                  {courseTime.status === 'DRAFT' && (
                    <Button variant="ghost" size="sm">
                      <UserPlus size={16} />
                      <span>{getText('addInstructor')}</span>
                    </Button>
                  )}
                </div>
                {courseTime.instructors && courseTime.instructors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {courseTime.instructors.map((instructor) => (
                      <div
                        key={instructor.id}
                        className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg"
                      >
                        {/* 이니셜 아바타 */}
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shrink-0',
                          instructor.role === 'MAIN' ? 'bg-action-primary' : 'bg-text-secondary'
                        )}>
                          {instructor.userName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        {/* 이름 + 배지 + 이메일 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-text-primary font-medium truncate">{instructor.userName}</p>
                            <Badge variant={instructor.role === 'MAIN' ? 'default' : 'secondary'} className="shrink-0">
                              {getText(instructor.role)}
                            </Badge>
                          </div>
                          <p className="text-text-secondary text-sm truncate">{instructor.userEmail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-4">{getText('noInstructors')}</p>
                )}
              </Card>

              {/* Quick Actions (전체 너비) */}
              <Card className="p-6 lg:col-span-3">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-text-secondary" />
                  {getText('quickActions')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 수강생 목록 */}
                  <button
                    onClick={() => navigate(prefixPath(`/co/users?courseId=${courseTime.courseId}&timeId=${timeId}`))}
                    className="flex items-center gap-4 p-4 bg-bg-secondary rounded-lg hover:bg-bg-secondary/80 transition-colors text-left group"
                  >
                    <div className="w-12 h-12 rounded-full bg-action-primary/10 flex items-center justify-center shrink-0">
                      <Users size={24} className="text-action-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-medium">{getText('viewEnrollments')}</p>
                      <p className="text-text-secondary text-sm">{getText('viewEnrollmentsDesc')}</p>
                    </div>
                    <ChevronRight size={20} className="text-text-placeholder group-hover:text-text-secondary transition-colors" />
                  </button>

                  {/* 출결 관리 */}
                  <button
                    disabled={!['ONGOING'].includes(courseTime.status)}
                    onClick={() => toast.info(getText('comingSoon'))}
                    className={cn(
                      'flex items-center gap-4 p-4 bg-bg-secondary rounded-lg transition-colors text-left group',
                      ['ONGOING'].includes(courseTime.status)
                        ? 'hover:bg-bg-secondary/80 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                      ['ONGOING'].includes(courseTime.status)
                        ? 'bg-status-success/10'
                        : 'bg-bg-primary'
                    )}>
                      <ClipboardList size={24} className={cn(
                        ['ONGOING'].includes(courseTime.status)
                          ? 'text-status-success'
                          : 'text-text-placeholder'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-text-primary font-medium">{getText('attendanceManagement')}</p>
                        <Badge variant="secondary" className="text-xs">{getText('comingSoon')}</Badge>
                      </div>
                      <p className="text-text-secondary text-sm">{getText('attendanceManagementDesc')}</p>
                    </div>
                    <ChevronRight size={20} className="text-text-placeholder" />
                  </button>

                  {/* 성적 관리 */}
                  <button
                    disabled={!['ONGOING', 'CLOSED'].includes(courseTime.status)}
                    onClick={() => toast.info(getText('comingSoon'))}
                    className={cn(
                      'flex items-center gap-4 p-4 bg-bg-secondary rounded-lg transition-colors text-left group',
                      ['ONGOING', 'CLOSED'].includes(courseTime.status)
                        ? 'hover:bg-bg-secondary/80 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                      ['ONGOING', 'CLOSED'].includes(courseTime.status)
                        ? 'bg-status-warning/10'
                        : 'bg-bg-primary'
                    )}>
                      <BarChart3 size={24} className={cn(
                        ['ONGOING', 'CLOSED'].includes(courseTime.status)
                          ? 'text-status-warning'
                          : 'text-text-placeholder'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-text-primary font-medium">{getText('gradeManagement')}</p>
                        <Badge variant="secondary" className="text-xs">{getText('comingSoon')}</Badge>
                      </div>
                      <p className="text-text-secondary text-sm">{getText('gradeManagementDesc')}</p>
                    </div>
                    <ChevronRight size={20} className="text-text-placeholder" />
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 size={20} className="text-status-error" />
              {getText('confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getText('confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{getText('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-status-error hover:bg-status-error/90"
            >
              {deleteTime.isPending ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              {getText('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getText('confirmStatusChange')}</AlertDialogTitle>
            <AlertDialogDescription>
              {getText('confirmStatusChangeDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{getText('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusTransition}>
              {(openTime.isPending || startTime.isPending || closeTime.isPending || archiveTime.isPending) ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              {getText('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clone Course Time Dialog */}
      <CloneCourseTimeDialog
        open={cloneDialogOpen}
        onOpenChange={setCloneDialogOpen}
        courseTime={courseTime}
        language={language}
      />
    </div>
  );
}
