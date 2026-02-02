/**
 * CourseTime 카탈로그 관련 타입 정의
 * 학습자용 Public API 응답 타입 (백엔드 스펙 기반)
 */

// ============================================
// Enums (Union Types)
// ============================================

/** 차수 상태 */
export type CourseTimeStatus =
  | 'DRAFT' // 초안 (수정 가능, 수강 신청 불가)
  | 'RECRUITING' // 모집 중 (수강 신청 가능)
  | 'ONGOING' // 진행 중 (학습 진행)
  | 'CLOSED' // 종료 (신규 신청 불가, 기존 수강생 접근 가능)
  | 'ARCHIVED'; // 보관 (관리자 전용)

/** 운영 방식 */
export type DeliveryType =
  | 'ONLINE' // 온라인 비대면
  | 'OFFLINE' // 오프라인 대면
  | 'BLENDED' // 혼합 (온/오프라인 병행)
  | 'LIVE'; // 실시간 라이브

/** 수강신청 방식 */
export type EnrollmentMethod =
  | 'FIRST_COME' // 선착순
  | 'APPROVAL' // 승인제
  | 'INVITE_ONLY'; // 초대 전용

/** 강사 역할 */
export type CatalogInstructorRole =
  | 'MAIN' // 주강사
  | 'SUB' // 보조강사
  | 'ASSISTANT'; // 조교

/** 프로그램 레벨 */
export type ProgramLevel =
  | 'BEGINNER' // 입문
  | 'INTERMEDIATE' // 중급
  | 'ADVANCED'; // 고급

/** 프로그램 타입 */
export type ProgramType =
  | 'ONLINE' // 온라인 (비대면)
  | 'OFFLINE' // 오프라인 (대면)
  | 'BLENDED'; // 블렌디드 (혼합)

// ============================================
// Response Types
// ============================================

/** 프로그램 요약 응답 */
export interface ProgramSummaryResponse {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  level: ProgramLevel | null;
  type: ProgramType | null;
  estimatedHours: number | null;
  categoryId: number | null;
  categoryName: string | null;
}

/** 강사 요약 응답 */
export interface InstructorSummaryResponse {
  id: number;
  name: string;
  role: CatalogInstructorRole;
  profileImageUrl: string | null;
}

/** 커리큘럼 아이템 응답 (트리 구조) */
export interface CurriculumItemResponse {
  id: number;
  itemName: string;
  itemType: string;
  isFolder: boolean;
  duration: number | null;
  children: CurriculumItemResponse[];
}

/** 차수 목록 응답 (카탈로그) */
export interface CourseTimeCatalogResponse {
  id: number;
  title: string;
  status: CourseTimeStatus;
  deliveryType: DeliveryType;
  enrollmentMethod: EnrollmentMethod;
  isOnDemand: boolean;
  enrollStartDate: string;
  enrollEndDate: string;
  classStartDate: string;
  classEndDate: string;
  capacity: number | null;
  currentEnrollment: number;
  availableSeats: number;
  price: string;
  isFree: boolean;
  program: ProgramSummaryResponse | null;
  instructors: InstructorSummaryResponse[];
  // 수강평 관련 (Mock 데이터용)
  rating?: number;
  reviewCount?: number;
}

/** 강의(Course) 요약 응답 */
export interface CourseSummaryResponse {
  id: number;
  title: string;
  description: string | null;
}

/** 차수 상세 응답 */
export interface CourseTimePublicDetailResponse {
  id: number;
  title: string;
  status: CourseTimeStatus;
  deliveryType: DeliveryType;
  isOnDemand: boolean;
  enrollStartDate: string;
  enrollEndDate: string;
  classStartDate: string;
  classEndDate: string;
  capacity: number | null;
  currentEnrollment: number;
  availableSeats: number;
  price: string;
  isFree: boolean;
  enrollmentMethod: EnrollmentMethod;
  allowLateEnrollment: boolean;
  minProgressForCompletion: number | null;
  locationInfo: string | null;
  program: ProgramSummaryResponse | null;
  course: CourseSummaryResponse | null;
  curriculum: CurriculumItemResponse[];
  instructors: InstructorSummaryResponse[];
}

// ============================================
// Request Types (검색/필터 파라미터)
// ============================================

/** 카탈로그 검색 파라미터 */
export interface CourseTimeCatalogParams {
  status?: CourseTimeStatus[];
  deliveryType?: DeliveryType;
  programId?: number;
  isFree?: boolean;
  keyword?: string;
  categoryId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

// ============================================
// Utility Types & Constants
// ============================================

/** CourseTimeStatus 라벨 맵 */
export const COURSE_TIME_STATUS_LABELS: Record<CourseTimeStatus, string> = {
  DRAFT: '준비 중',
  RECRUITING: '모집 중',
  ONGOING: '진행 중',
  CLOSED: '종료',
  ARCHIVED: '보관',
};

/** DeliveryType 라벨 맵 */
export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  BLENDED: '블렌디드',
  LIVE: '실시간',
};

/** EnrollmentMethod 라벨 맵 */
export const ENROLLMENT_METHOD_LABELS: Record<EnrollmentMethod, string> = {
  FIRST_COME: '선착순',
  APPROVAL: '승인제',
  INVITE_ONLY: '초대 전용',
};

/** InstructorRole 라벨 맵 */
export const CATALOG_INSTRUCTOR_ROLE_LABELS: Record<CatalogInstructorRole, string> = {
  MAIN: '주강사',
  SUB: '보조강사',
  ASSISTANT: '조교',
};

/** ProgramLevel 라벨 맵 */
export const PROGRAM_LEVEL_LABELS: Record<ProgramLevel, string> = {
  BEGINNER: '입문',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
};

/** ProgramType 라벨 맵 */
export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  BLENDED: '블렌디드',
};

/** CourseTimeStatus 색상 맵 (B2C 스타일) */
export const COURSE_TIME_STATUS_COLORS: Record<CourseTimeStatus, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  RECRUITING: { bg: 'bg-green-500/20', text: 'text-green-400' },
  ONGOING: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  CLOSED: { bg: 'bg-red-500/20', text: 'text-red-400' },
  ARCHIVED: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
};
