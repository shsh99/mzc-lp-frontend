// Mock enrollment data

// ========== 찜 목록 ==========
// WishlistItemResponse 타입에 맞게 플랫 구조로 정의
export const mockWishlist = [
  {
    id: 1,
    courseTimeId: 2,
    courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 1기',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
    level: 'INTERMEDIATE',
    estimatedHours: 24,
    isFree: false,
    price: '129000',
    addedAt: '2026-01-25T10:00:00',
  },
  {
    id: 2,
    courseTimeId: 3,
    courseTimeTitle: 'AWS 클라우드 입문 - 2024년 2기',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    level: 'BEGINNER',
    estimatedHours: 16,
    isFree: false,
    price: '149000',
    addedAt: '2026-01-20T14:30:00',
  },
  {
    id: 3,
    courseTimeId: 4,
    courseTimeTitle: 'Python 데이터 분석 - 무료 체험반',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
    level: 'INTERMEDIATE',
    estimatedHours: 20,
    isFree: true,
    price: null,
    addedAt: '2026-01-18T09:15:00',
  },
];

// ========== 장바구니 ==========
// CartItemResponse 타입에 맞게 플랫 구조로 정의 (cartItemId 사용)
export const mockCart = [
  {
    cartItemId: 1,
    courseTimeId: 2,
    courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 1기',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
    level: 'INTERMEDIATE',
    estimatedHours: 24,
    isFree: false,
    price: '129000',
    addedAt: '2026-01-28T11:00:00',
  },
  {
    cartItemId: 2,
    courseTimeId: 3,
    courseTimeTitle: 'AWS 클라우드 입문 - 2024년 2기',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    level: 'BEGINNER',
    estimatedHours: 16,
    isFree: false,
    price: '149000',
    addedAt: '2026-01-27T16:30:00',
  },
];

// ========== 수강 내역 ==========
// BackendEnrollmentResponse 형식에 맞게 정의
// 차수별 currentEnrollment 수치에 맞춰 생성

// MZC 아카데미 사용자 (USER 역할): 14, 15, 16, 30, 31, 33, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
// 삼성 러닝센터 사용자 (USER 역할): 24, 25, 26, 27, 28, 29, 60, 61, 62, 63, 64

export const mockEnrollments = [
  // ========== MZC 아카데미 차수 ==========

  // 차수 1: React 기초 1기 (8명, RECRUITING, FIRST_COME)
  { id: 1, userId: 14, courseTimeId: 1, enrolledAt: '2026-01-15T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 65, score: null, completedAt: null, actualEndDate: null },
  { id: 2, userId: 15, courseTimeId: 1, enrolledAt: '2026-01-15T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 45, score: null, completedAt: null, actualEndDate: null },
  { id: 3, userId: 36, courseTimeId: 1, enrolledAt: '2026-01-16T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 30, score: null, completedAt: null, actualEndDate: null },
  { id: 4, userId: 37, courseTimeId: 1, enrolledAt: '2026-01-16T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 55, score: null, completedAt: null, actualEndDate: null },
  { id: 5, userId: 41, courseTimeId: 1, enrolledAt: '2026-01-17T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 20, score: null, completedAt: null, actualEndDate: null },
  { id: 6, userId: 42, courseTimeId: 1, enrolledAt: '2026-01-18T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 40, score: null, completedAt: null, actualEndDate: null },
  { id: 7, userId: 43, courseTimeId: 1, enrolledAt: '2026-01-19T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 15, score: null, completedAt: null, actualEndDate: null },
  { id: 8, userId: 44, courseTimeId: 1, enrolledAt: '2026-01-20T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 25, score: null, completedAt: null, actualEndDate: null },

  // 차수 2: TypeScript 1기 (6명, RECRUITING, INVITE_ONLY)
  { id: 9, userId: 14, courseTimeId: 2, enrolledAt: '2026-01-20T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 30, score: null, completedAt: null, actualEndDate: null },
  { id: 10, userId: 15, courseTimeId: 2, enrolledAt: '2026-01-20T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 25, score: null, completedAt: null, actualEndDate: null },
  { id: 11, userId: 16, courseTimeId: 2, enrolledAt: '2026-01-21T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 40, score: null, completedAt: null, actualEndDate: null },
  { id: 12, userId: 38, courseTimeId: 2, enrolledAt: '2026-01-21T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 20, score: null, completedAt: null, actualEndDate: null },
  { id: 13, userId: 45, courseTimeId: 2, enrolledAt: '2026-01-22T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 15, score: null, completedAt: null, actualEndDate: null },
  { id: 14, userId: 46, courseTimeId: 2, enrolledAt: '2026-01-22T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 35, score: null, completedAt: null, actualEndDate: null },

  // 차수 3: AWS 클라우드 2기 (10명, ONGOING, APPROVAL)
  { id: 15, userId: 14, courseTimeId: 3, enrolledAt: '2026-01-10T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 75, score: null, completedAt: null, actualEndDate: null },
  { id: 16, userId: 16, courseTimeId: 3, enrolledAt: '2026-01-10T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 60, score: null, completedAt: null, actualEndDate: null },
  { id: 17, userId: 30, courseTimeId: 3, enrolledAt: '2026-01-11T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 55, score: null, completedAt: null, actualEndDate: null },
  { id: 18, userId: 31, courseTimeId: 3, enrolledAt: '2026-01-11T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 70, score: null, completedAt: null, actualEndDate: null },
  { id: 19, userId: 33, courseTimeId: 3, enrolledAt: '2026-01-12T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 45, score: null, completedAt: null, actualEndDate: null },
  { id: 20, userId: 39, courseTimeId: 3, enrolledAt: '2026-01-12T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 80, score: null, completedAt: null, actualEndDate: null },
  { id: 21, userId: 40, courseTimeId: 3, enrolledAt: '2026-01-13T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 50, score: null, completedAt: null, actualEndDate: null },
  { id: 22, userId: 47, courseTimeId: 3, enrolledAt: '2026-01-13T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 65, score: null, completedAt: null, actualEndDate: null },
  { id: 23, userId: 48, courseTimeId: 3, enrolledAt: '2026-01-14T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 40, score: null, completedAt: null, actualEndDate: null },
  { id: 24, userId: 49, courseTimeId: 3, enrolledAt: '2026-01-14T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 35, score: null, completedAt: null, actualEndDate: null },

  // 차수 4: Python 무료 체험반 (15명, on-demand, FIRST_COME)
  { id: 25, userId: 14, courseTimeId: 4, enrolledAt: '2025-12-10T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 85, score: null, completedAt: null, actualEndDate: null },
  { id: 26, userId: 15, courseTimeId: 4, enrolledAt: '2025-12-11T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 70, score: null, completedAt: null, actualEndDate: null },
  { id: 27, userId: 16, courseTimeId: 4, enrolledAt: '2025-12-12T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 60, score: null, completedAt: null, actualEndDate: null },
  { id: 28, userId: 30, courseTimeId: 4, enrolledAt: '2025-12-13T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 45, score: null, completedAt: null, actualEndDate: null },
  { id: 29, userId: 31, courseTimeId: 4, enrolledAt: '2025-12-14T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 55, score: null, completedAt: null, actualEndDate: null },
  { id: 30, userId: 33, courseTimeId: 4, enrolledAt: '2025-12-15T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 30, score: null, completedAt: null, actualEndDate: null },
  { id: 31, userId: 36, courseTimeId: 4, enrolledAt: '2025-12-16T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 40, score: null, completedAt: null, actualEndDate: null },
  { id: 32, userId: 37, courseTimeId: 4, enrolledAt: '2025-12-17T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 25, score: null, completedAt: null, actualEndDate: null },
  { id: 33, userId: 38, courseTimeId: 4, enrolledAt: '2025-12-18T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 50, score: null, completedAt: null, actualEndDate: null },
  { id: 34, userId: 39, courseTimeId: 4, enrolledAt: '2025-12-19T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 35, score: null, completedAt: null, actualEndDate: null },
  { id: 35, userId: 40, courseTimeId: 4, enrolledAt: '2025-12-20T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 20, score: null, completedAt: null, actualEndDate: null },
  { id: 36, userId: 41, courseTimeId: 4, enrolledAt: '2025-12-21T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 65, score: null, completedAt: null, actualEndDate: null },
  { id: 37, userId: 42, courseTimeId: 4, enrolledAt: '2025-12-22T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 15, score: null, completedAt: null, actualEndDate: null },
  { id: 38, userId: 43, courseTimeId: 4, enrolledAt: '2025-12-23T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 10, score: null, completedAt: null, actualEndDate: null },
  { id: 39, userId: 44, courseTimeId: 4, enrolledAt: '2025-12-24T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 5, score: null, completedAt: null, actualEndDate: null },

  // 차수 5: React 2기 (12명, ONGOING, FIRST_COME)
  { id: 40, userId: 14, courseTimeId: 5, enrolledAt: '2025-12-20T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 90, score: null, completedAt: null, actualEndDate: null },
  { id: 41, userId: 15, courseTimeId: 5, enrolledAt: '2025-12-20T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 85, score: null, completedAt: null, actualEndDate: null },
  { id: 42, userId: 16, courseTimeId: 5, enrolledAt: '2025-12-21T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 80, score: null, completedAt: null, actualEndDate: null },
  { id: 43, userId: 30, courseTimeId: 5, enrolledAt: '2025-12-21T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 75, score: null, completedAt: null, actualEndDate: null },
  { id: 44, userId: 36, courseTimeId: 5, enrolledAt: '2025-12-22T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 70, score: null, completedAt: null, actualEndDate: null },
  { id: 45, userId: 37, courseTimeId: 5, enrolledAt: '2025-12-22T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 65, score: null, completedAt: null, actualEndDate: null },
  { id: 46, userId: 38, courseTimeId: 5, enrolledAt: '2025-12-23T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 60, score: null, completedAt: null, actualEndDate: null },
  { id: 47, userId: 45, courseTimeId: 5, enrolledAt: '2025-12-23T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 55, score: null, completedAt: null, actualEndDate: null },
  { id: 48, userId: 46, courseTimeId: 5, enrolledAt: '2025-12-24T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 50, score: null, completedAt: null, actualEndDate: null },
  { id: 49, userId: 47, courseTimeId: 5, enrolledAt: '2025-12-24T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 45, score: null, completedAt: null, actualEndDate: null },
  { id: 50, userId: 48, courseTimeId: 5, enrolledAt: '2025-12-25T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 40, score: null, completedAt: null, actualEndDate: null },
  { id: 51, userId: 50, courseTimeId: 5, enrolledAt: '2025-12-25T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 35, score: null, completedAt: null, actualEndDate: null },

  // 차수 6: TypeScript 2기 (5명, RECRUITING, INVITE_ONLY)
  { id: 52, userId: 31, courseTimeId: 6, enrolledAt: '2026-02-05T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 10, score: null, completedAt: null, actualEndDate: null },
  { id: 53, userId: 39, courseTimeId: 6, enrolledAt: '2026-02-05T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 5, score: null, completedAt: null, actualEndDate: null },
  { id: 54, userId: 41, courseTimeId: 6, enrolledAt: '2026-02-06T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 15, score: null, completedAt: null, actualEndDate: null },
  { id: 55, userId: 43, courseTimeId: 6, enrolledAt: '2026-02-06T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 0, score: null, completedAt: null, actualEndDate: null },
  { id: 56, userId: 49, courseTimeId: 6, enrolledAt: '2026-02-07T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 8, score: null, completedAt: null, actualEndDate: null },

  // 차수 7: React 3기 (7명, RECRUITING, APPROVAL)
  { id: 57, userId: 15, courseTimeId: 7, enrolledAt: '2026-02-05T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 5, score: null, completedAt: null, actualEndDate: null },
  { id: 58, userId: 33, courseTimeId: 7, enrolledAt: '2026-02-05T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 10, score: null, completedAt: null, actualEndDate: null },
  { id: 59, userId: 40, courseTimeId: 7, enrolledAt: '2026-02-06T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 0, score: null, completedAt: null, actualEndDate: null },
  { id: 60, userId: 42, courseTimeId: 7, enrolledAt: '2026-02-06T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 8, score: null, completedAt: null, actualEndDate: null },
  { id: 61, userId: 44, courseTimeId: 7, enrolledAt: '2026-02-07T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 3, score: null, completedAt: null, actualEndDate: null },
  { id: 62, userId: 46, courseTimeId: 7, enrolledAt: '2026-02-07T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 12, score: null, completedAt: null, actualEndDate: null },
  { id: 63, userId: 50, courseTimeId: 7, enrolledAt: '2026-02-08T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 0, score: null, completedAt: null, actualEndDate: null },

  // 차수 8: AWS 1기 (15명, CLOSED, APPROVAL) - 모두 완료
  { id: 64, userId: 14, courseTimeId: 8, enrolledAt: '2025-09-05T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 95, completedAt: '2025-11-28T16:00:00', actualEndDate: '2025-11-28' },
  { id: 65, userId: 15, courseTimeId: 8, enrolledAt: '2025-09-05T10:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 88, completedAt: '2025-11-27T15:00:00', actualEndDate: '2025-11-27' },
  { id: 66, userId: 16, courseTimeId: 8, enrolledAt: '2025-09-06T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 92, completedAt: '2025-11-29T14:00:00', actualEndDate: '2025-11-29' },
  { id: 67, userId: 30, courseTimeId: 8, enrolledAt: '2025-09-06T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 85, completedAt: '2025-11-28T10:00:00', actualEndDate: '2025-11-28' },
  { id: 68, userId: 31, courseTimeId: 8, enrolledAt: '2025-09-07T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 90, completedAt: '2025-11-26T16:00:00', actualEndDate: '2025-11-26' },
  { id: 69, userId: 33, courseTimeId: 8, enrolledAt: '2025-09-07T11:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 87, completedAt: '2025-11-29T11:00:00', actualEndDate: '2025-11-29' },
  { id: 70, userId: 36, courseTimeId: 8, enrolledAt: '2025-09-08T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 91, completedAt: '2025-11-27T09:00:00', actualEndDate: '2025-11-27' },
  { id: 71, userId: 37, courseTimeId: 8, enrolledAt: '2025-09-08T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 83, completedAt: '2025-11-28T14:00:00', actualEndDate: '2025-11-28' },
  { id: 72, userId: 38, courseTimeId: 8, enrolledAt: '2025-09-09T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 89, completedAt: '2025-11-29T16:00:00', actualEndDate: '2025-11-29' },
  { id: 73, userId: 39, courseTimeId: 8, enrolledAt: '2025-09-09T10:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 94, completedAt: '2025-11-25T15:00:00', actualEndDate: '2025-11-25' },
  { id: 74, userId: 40, courseTimeId: 8, enrolledAt: '2025-09-10T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 86, completedAt: '2025-11-28T11:00:00', actualEndDate: '2025-11-28' },
  { id: 75, userId: 41, courseTimeId: 8, enrolledAt: '2025-09-10T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 93, completedAt: '2025-11-27T14:00:00', actualEndDate: '2025-11-27' },
  { id: 76, userId: 42, courseTimeId: 8, enrolledAt: '2025-09-11T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 88, completedAt: '2025-11-29T10:00:00', actualEndDate: '2025-11-29' },
  { id: 77, userId: 43, courseTimeId: 8, enrolledAt: '2025-09-11T11:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 90, completedAt: '2025-11-28T09:00:00', actualEndDate: '2025-11-28' },
  { id: 78, userId: 44, courseTimeId: 8, enrolledAt: '2025-09-12T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'APPROVAL', progressPercent: 100, score: 87, completedAt: '2025-11-30T15:00:00', actualEndDate: '2025-11-30' },

  // 차수 9: TypeScript 2023 하반기 (12명, CLOSED, INVITE_ONLY) - 모두 완료
  { id: 79, userId: 14, courseTimeId: 9, enrolledAt: '2025-10-05T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 96, completedAt: '2025-12-14T16:00:00', actualEndDate: '2025-12-14' },
  { id: 80, userId: 15, courseTimeId: 9, enrolledAt: '2025-10-05T10:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 91, completedAt: '2025-12-13T15:00:00', actualEndDate: '2025-12-13' },
  { id: 81, userId: 16, courseTimeId: 9, enrolledAt: '2025-10-06T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 89, completedAt: '2025-12-14T10:00:00', actualEndDate: '2025-12-14' },
  { id: 82, userId: 30, courseTimeId: 9, enrolledAt: '2025-10-06T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 93, completedAt: '2025-12-12T14:00:00', actualEndDate: '2025-12-12' },
  { id: 83, userId: 31, courseTimeId: 9, enrolledAt: '2025-10-07T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 87, completedAt: '2025-12-15T09:00:00', actualEndDate: '2025-12-15' },
  { id: 84, userId: 33, courseTimeId: 9, enrolledAt: '2025-10-07T11:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 90, completedAt: '2025-12-14T11:00:00', actualEndDate: '2025-12-14' },
  { id: 85, userId: 36, courseTimeId: 9, enrolledAt: '2025-10-08T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 94, completedAt: '2025-12-13T16:00:00', actualEndDate: '2025-12-13' },
  { id: 86, userId: 37, courseTimeId: 9, enrolledAt: '2025-10-08T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 88, completedAt: '2025-12-14T14:00:00', actualEndDate: '2025-12-14' },
  { id: 87, userId: 38, courseTimeId: 9, enrolledAt: '2025-10-09T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 92, completedAt: '2025-12-12T16:00:00', actualEndDate: '2025-12-12' },
  { id: 88, userId: 39, courseTimeId: 9, enrolledAt: '2025-10-09T10:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 95, completedAt: '2025-12-13T10:00:00', actualEndDate: '2025-12-13' },
  { id: 89, userId: 40, courseTimeId: 9, enrolledAt: '2025-10-10T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 86, completedAt: '2025-12-15T11:00:00', actualEndDate: '2025-12-15' },
  { id: 90, userId: 41, courseTimeId: 9, enrolledAt: '2025-10-10T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 100, score: 91, completedAt: '2025-12-14T09:00:00', actualEndDate: '2025-12-14' },

  // 차수 10: React 2023 상반기 (16명, ARCHIVED, FIRST_COME) - 모두 완료
  { id: 91, userId: 14, courseTimeId: 10, enrolledAt: '2025-03-05T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 97, completedAt: '2025-05-30T16:00:00', actualEndDate: '2025-05-30' },
  { id: 92, userId: 15, courseTimeId: 10, enrolledAt: '2025-03-05T10:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 92, completedAt: '2025-05-29T15:00:00', actualEndDate: '2025-05-29' },
  { id: 93, userId: 16, courseTimeId: 10, enrolledAt: '2025-03-06T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 88, completedAt: '2025-05-31T10:00:00', actualEndDate: '2025-05-31' },
  { id: 94, userId: 30, courseTimeId: 10, enrolledAt: '2025-03-06T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 94, completedAt: '2025-05-28T14:00:00', actualEndDate: '2025-05-28' },
  { id: 95, userId: 31, courseTimeId: 10, enrolledAt: '2025-03-07T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 89, completedAt: '2025-05-30T09:00:00', actualEndDate: '2025-05-30' },
  { id: 96, userId: 33, courseTimeId: 10, enrolledAt: '2025-03-07T11:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 91, completedAt: '2025-05-29T11:00:00', actualEndDate: '2025-05-29' },
  { id: 97, userId: 36, courseTimeId: 10, enrolledAt: '2025-03-08T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 93, completedAt: '2025-05-28T16:00:00', actualEndDate: '2025-05-28' },
  { id: 98, userId: 37, courseTimeId: 10, enrolledAt: '2025-03-08T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 86, completedAt: '2025-05-31T14:00:00', actualEndDate: '2025-05-31' },
  { id: 99, userId: 38, courseTimeId: 10, enrolledAt: '2025-03-09T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 90, completedAt: '2025-05-27T16:00:00', actualEndDate: '2025-05-27' },
  { id: 100, userId: 39, courseTimeId: 10, enrolledAt: '2025-03-09T10:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 95, completedAt: '2025-05-30T10:00:00', actualEndDate: '2025-05-30' },
  { id: 101, userId: 40, courseTimeId: 10, enrolledAt: '2025-03-10T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 87, completedAt: '2025-05-29T09:00:00', actualEndDate: '2025-05-29' },
  { id: 102, userId: 41, courseTimeId: 10, enrolledAt: '2025-03-10T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 92, completedAt: '2025-05-31T11:00:00', actualEndDate: '2025-05-31' },
  { id: 103, userId: 42, courseTimeId: 10, enrolledAt: '2025-03-11T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 88, completedAt: '2025-05-28T10:00:00', actualEndDate: '2025-05-28' },
  { id: 104, userId: 43, courseTimeId: 10, enrolledAt: '2025-03-11T11:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 96, completedAt: '2025-05-30T14:00:00', actualEndDate: '2025-05-30' },
  { id: 105, userId: 44, courseTimeId: 10, enrolledAt: '2025-03-12T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 84, completedAt: '2025-05-29T16:00:00', actualEndDate: '2025-05-29' },
  { id: 106, userId: 45, courseTimeId: 10, enrolledAt: '2025-03-12T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 91, completedAt: '2025-05-31T09:00:00', actualEndDate: '2025-05-31' },

  // 차수 11: Python 2023 (14명, ARCHIVED, FIRST_COME) - 모두 완료
  { id: 107, userId: 14, courseTimeId: 11, enrolledAt: '2025-01-05T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 93, completedAt: '2025-03-30T16:00:00', actualEndDate: '2025-03-30' },
  { id: 108, userId: 15, courseTimeId: 11, enrolledAt: '2025-01-05T10:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 89, completedAt: '2025-03-29T15:00:00', actualEndDate: '2025-03-29' },
  { id: 109, userId: 16, courseTimeId: 11, enrolledAt: '2025-01-06T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 91, completedAt: '2025-03-31T10:00:00', actualEndDate: '2025-03-31' },
  { id: 110, userId: 30, courseTimeId: 11, enrolledAt: '2025-01-06T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 87, completedAt: '2025-03-28T14:00:00', actualEndDate: '2025-03-28' },
  { id: 111, userId: 31, courseTimeId: 11, enrolledAt: '2025-01-07T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 94, completedAt: '2025-03-30T09:00:00', actualEndDate: '2025-03-30' },
  { id: 112, userId: 33, courseTimeId: 11, enrolledAt: '2025-01-07T11:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 88, completedAt: '2025-03-29T11:00:00', actualEndDate: '2025-03-29' },
  { id: 113, userId: 36, courseTimeId: 11, enrolledAt: '2025-01-08T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 92, completedAt: '2025-03-28T16:00:00', actualEndDate: '2025-03-28' },
  { id: 114, userId: 37, courseTimeId: 11, enrolledAt: '2025-01-08T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 85, completedAt: '2025-03-31T14:00:00', actualEndDate: '2025-03-31' },
  { id: 115, userId: 38, courseTimeId: 11, enrolledAt: '2025-01-09T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 90, completedAt: '2025-03-27T16:00:00', actualEndDate: '2025-03-27' },
  { id: 116, userId: 39, courseTimeId: 11, enrolledAt: '2025-01-09T10:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 96, completedAt: '2025-03-30T10:00:00', actualEndDate: '2025-03-30' },
  { id: 117, userId: 40, courseTimeId: 11, enrolledAt: '2025-01-10T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 83, completedAt: '2025-03-29T09:00:00', actualEndDate: '2025-03-29' },
  { id: 118, userId: 41, courseTimeId: 11, enrolledAt: '2025-01-10T14:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 91, completedAt: '2025-03-31T11:00:00', actualEndDate: '2025-03-31' },
  { id: 119, userId: 42, courseTimeId: 11, enrolledAt: '2025-01-11T09:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 87, completedAt: '2025-03-28T10:00:00', actualEndDate: '2025-03-28' },
  { id: 120, userId: 43, courseTimeId: 11, enrolledAt: '2025-01-11T11:00:00', type: 'VOLUNTARY', status: 'COMPLETED', enrollmentMethod: 'FIRST_COME', progressPercent: 100, score: 95, completedAt: '2025-03-30T14:00:00', actualEndDate: '2025-03-30' },

  // 차수 12: AI/ML 양성과정 (0명, RECRUITING, INVITE_ONLY - 아직 선발 전)
  // 수강생 없음

  // ========== 삼성 러닝센터 차수 ==========

  // 차수 101: 리더십 과정 (8명, RECRUITING, APPROVAL)
  { id: 121, userId: 24, courseTimeId: 101, enrolledAt: '2026-01-10T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 45, score: null, completedAt: null, actualEndDate: null },
  { id: 122, userId: 25, courseTimeId: 101, enrolledAt: '2026-01-10T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 35, score: null, completedAt: null, actualEndDate: null },
  { id: 123, userId: 26, courseTimeId: 101, enrolledAt: '2026-01-11T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 50, score: null, completedAt: null, actualEndDate: null },
  { id: 124, userId: 27, courseTimeId: 101, enrolledAt: '2026-01-11T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 40, score: null, completedAt: null, actualEndDate: null },
  { id: 125, userId: 28, courseTimeId: 101, enrolledAt: '2026-01-12T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 55, score: null, completedAt: null, actualEndDate: null },
  { id: 126, userId: 29, courseTimeId: 101, enrolledAt: '2026-01-12T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 30, score: null, completedAt: null, actualEndDate: null },
  { id: 127, userId: 60, courseTimeId: 101, enrolledAt: '2026-01-13T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 60, score: null, completedAt: null, actualEndDate: null },
  { id: 128, userId: 61, courseTimeId: 101, enrolledAt: '2026-01-13T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 25, score: null, completedAt: null, actualEndDate: null },

  // 차수 102: DX 기초 상시 (10명, on-demand, FIRST_COME)
  { id: 129, userId: 24, courseTimeId: 102, enrolledAt: '2025-12-15T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 80, score: null, completedAt: null, actualEndDate: null },
  { id: 130, userId: 25, courseTimeId: 102, enrolledAt: '2025-12-16T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 65, score: null, completedAt: null, actualEndDate: null },
  { id: 131, userId: 26, courseTimeId: 102, enrolledAt: '2025-12-17T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 70, score: null, completedAt: null, actualEndDate: null },
  { id: 132, userId: 27, courseTimeId: 102, enrolledAt: '2025-12-18T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 55, score: null, completedAt: null, actualEndDate: null },
  { id: 133, userId: 28, courseTimeId: 102, enrolledAt: '2025-12-19T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 45, score: null, completedAt: null, actualEndDate: null },
  { id: 134, userId: 29, courseTimeId: 102, enrolledAt: '2025-12-20T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 35, score: null, completedAt: null, actualEndDate: null },
  { id: 135, userId: 60, courseTimeId: 102, enrolledAt: '2025-12-21T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 90, score: null, completedAt: null, actualEndDate: null },
  { id: 136, userId: 61, courseTimeId: 102, enrolledAt: '2025-12-22T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 25, score: null, completedAt: null, actualEndDate: null },
  { id: 137, userId: 62, courseTimeId: 102, enrolledAt: '2025-12-23T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 50, score: null, completedAt: null, actualEndDate: null },
  { id: 138, userId: 63, courseTimeId: 102, enrolledAt: '2025-12-24T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'FIRST_COME', progressPercent: 40, score: null, completedAt: null, actualEndDate: null },

  // 차수 103: 반도체 공정 (9명, ONGOING, APPROVAL)
  { id: 139, userId: 24, courseTimeId: 103, enrolledAt: '2026-01-05T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 70, score: null, completedAt: null, actualEndDate: null },
  { id: 140, userId: 25, courseTimeId: 103, enrolledAt: '2026-01-05T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 65, score: null, completedAt: null, actualEndDate: null },
  { id: 141, userId: 26, courseTimeId: 103, enrolledAt: '2026-01-06T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 75, score: null, completedAt: null, actualEndDate: null },
  { id: 142, userId: 27, courseTimeId: 103, enrolledAt: '2026-01-06T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 60, score: null, completedAt: null, actualEndDate: null },
  { id: 143, userId: 28, courseTimeId: 103, enrolledAt: '2026-01-07T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 80, score: null, completedAt: null, actualEndDate: null },
  { id: 144, userId: 60, courseTimeId: 103, enrolledAt: '2026-01-07T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 55, score: null, completedAt: null, actualEndDate: null },
  { id: 145, userId: 61, courseTimeId: 103, enrolledAt: '2026-01-08T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 50, score: null, completedAt: null, actualEndDate: null },
  { id: 146, userId: 62, courseTimeId: 103, enrolledAt: '2026-01-08T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 45, score: null, completedAt: null, actualEndDate: null },
  { id: 147, userId: 63, courseTimeId: 103, enrolledAt: '2026-01-09T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'APPROVAL', progressPercent: 40, score: null, completedAt: null, actualEndDate: null },

  // 차수 104: 글로벌 커뮤니케이션 (6명, RECRUITING, INVITE_ONLY)
  { id: 148, userId: 24, courseTimeId: 104, enrolledAt: '2026-02-05T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 15, score: null, completedAt: null, actualEndDate: null },
  { id: 149, userId: 25, courseTimeId: 104, enrolledAt: '2026-02-05T10:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 10, score: null, completedAt: null, actualEndDate: null },
  { id: 150, userId: 29, courseTimeId: 104, enrolledAt: '2026-02-06T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 20, score: null, completedAt: null, actualEndDate: null },
  { id: 151, userId: 62, courseTimeId: 104, enrolledAt: '2026-02-06T14:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 5, score: null, completedAt: null, actualEndDate: null },
  { id: 152, userId: 63, courseTimeId: 104, enrolledAt: '2026-02-07T09:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 12, score: null, completedAt: null, actualEndDate: null },
  { id: 153, userId: 64, courseTimeId: 104, enrolledAt: '2026-02-07T11:00:00', type: 'VOLUNTARY', status: 'ENROLLED', enrollmentMethod: 'INVITE_ONLY', progressPercent: 8, score: null, completedAt: null, actualEndDate: null },
];

export const mockCertificates = [
  {
    id: 1,
    userId: 1,
    enrollmentId: 3,
    courseName: 'AWS 클라우드 입문',
    certificateNumber: 'CERT-2024-001234',
    issuedAt: '2026-01-25T17:00:00',
    downloadUrl: '/api/certificates/1/download',
  },
];

export const mockCurriculum = {
  enrollmentId: 1,
  courseName: 'React 기초부터 실전까지',
  totalItems: 24,
  completedItems: 16,
  folders: [
    {
      id: 1,
      name: '1장. React 소개',
      order: 1,
      items: [
        { id: 1, name: 'React란 무엇인가?', type: 'VIDEO', duration: 600, isCompleted: true },
        { id: 2, name: 'React의 특징', type: 'VIDEO', duration: 480, isCompleted: true },
        { id: 3, name: '개발 환경 설정', type: 'VIDEO', duration: 720, isCompleted: true },
        { id: 4, name: '1장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: true },
      ],
    },
    {
      id: 2,
      name: '2장. JSX와 컴포넌트',
      order: 2,
      items: [
        { id: 5, name: 'JSX 기초', type: 'VIDEO', duration: 540, isCompleted: true },
        { id: 6, name: '함수형 컴포넌트', type: 'VIDEO', duration: 600, isCompleted: true },
        { id: 7, name: 'Props 전달하기', type: 'VIDEO', duration: 660, isCompleted: true },
        { id: 8, name: '2장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: true },
      ],
    },
    {
      id: 3,
      name: '3장. State와 이벤트',
      order: 3,
      items: [
        { id: 9, name: 'useState Hook', type: 'VIDEO', duration: 720, isCompleted: true },
        { id: 10, name: '이벤트 핸들링', type: 'VIDEO', duration: 600, isCompleted: true },
        { id: 11, name: '조건부 렌더링', type: 'VIDEO', duration: 540, isCompleted: true },
        { id: 12, name: '3장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: true },
      ],
    },
    {
      id: 4,
      name: '4장. 리스트와 폼',
      order: 4,
      items: [
        { id: 13, name: '리스트 렌더링', type: 'VIDEO', duration: 600, isCompleted: true },
        { id: 14, name: '폼 처리', type: 'VIDEO', duration: 720, isCompleted: true },
        { id: 15, name: '제어 컴포넌트', type: 'VIDEO', duration: 540, isCompleted: true },
        { id: 16, name: '4장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: true },
      ],
    },
    {
      id: 5,
      name: '5장. 고급 훅',
      order: 5,
      items: [
        { id: 17, name: 'useEffect', type: 'VIDEO', duration: 780, isCompleted: false },
        { id: 18, name: 'useContext', type: 'VIDEO', duration: 660, isCompleted: false },
        { id: 19, name: 'useReducer', type: 'VIDEO', duration: 720, isCompleted: false },
        { id: 20, name: '5장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: false },
      ],
    },
    {
      id: 6,
      name: '6장. 실전 프로젝트',
      order: 6,
      items: [
        { id: 21, name: '프로젝트 소개', type: 'VIDEO', duration: 300, isCompleted: false },
        { id: 22, name: '프로젝트 구현', type: 'VIDEO', duration: 1800, isCompleted: false },
        { id: 23, name: '배포하기', type: 'VIDEO', duration: 600, isCompleted: false },
        { id: 24, name: '최종 평가', type: 'EXAM', duration: 600, isCompleted: false },
      ],
    },
  ],
};

// ========== 알림 ==========
// NotificationItem 타입에 맞게 정의
// 커뮤니티 게시글 연동 (authorId: 14 = 정학습의 게시글)
// - id 1: 'React 학습 팁 공유합니다'
// - id 2: 'TypeScript 제네릭 관련 질문입니다'
// - id 3: 'AWS 스터디 그룹 모집합니다'
// - id 4: 'React 기초 과정 수강 후기'
// - id 5: '프론트엔드 개발자 면접 준비 팁'
export const mockNotifications = [
  {
    id: 1,
    type: 'COURSE' as const,
    title: '수강신청 승인',
    message: 'TypeScript 마스터 클래스 - 2024년 1기 수강신청이 승인되었습니다.',
    isRead: false,
    createdAt: '2026-01-30T09:00:00',
    referenceId: 1,
    referenceType: 'ENROLLMENT',
    metadata: {
      courseName: 'TypeScript 마스터 클래스',
      courseTimeId: 2,
      enrollmentStatus: 'APPROVED' as const,
    },
  },
  {
    id: 2,
    type: 'COMMENT' as const,
    title: '새 댓글',
    message: '김개발님이 회원님의 게시글에 댓글을 남겼습니다: "좋은 정보 감사합니다!"',
    isRead: false,
    createdAt: '2026-01-29T11:20:00',
    referenceId: 1,
    referenceType: 'POST',
    actorId: 15,
    actorName: '김개발',
    metadata: {
      postTitle: 'React 학습 팁 공유합니다',
      postId: 1,
    },
  },
  {
    id: 3,
    type: 'COMMENT' as const,
    title: '새 댓글',
    message: '이학습님이 회원님의 질문에 답변을 남겼습니다.',
    isRead: false,
    createdAt: '2026-01-29T10:15:00',
    referenceId: 2,
    referenceType: 'POST',
    actorId: 16,
    actorName: '이학습',
    metadata: {
      postTitle: 'TypeScript 제네릭 관련 질문입니다',
      postId: 2,
    },
  },
  {
    id: 4,
    type: 'LIKE' as const,
    title: '좋아요',
    message: '박코딩님이 회원님의 게시글을 좋아합니다.',
    isRead: false,
    createdAt: '2026-01-28T16:45:00',
    referenceId: 3,
    referenceType: 'POST',
    actorId: 17,
    actorName: '박코딩',
    metadata: {
      postTitle: 'AWS 스터디 그룹 모집합니다',
      postId: 3,
    },
  },
  {
    id: 5,
    type: 'LIKE' as const,
    title: '좋아요',
    message: '김개발님이 회원님의 후기를 좋아합니다.',
    isRead: true,
    createdAt: '2026-01-28T14:30:00',
    referenceId: 4,
    referenceType: 'POST',
    actorId: 15,
    actorName: '김개발',
    metadata: {
      postTitle: 'React 기초 과정 수강 후기',
      postId: 4,
    },
  },
  {
    id: 6,
    type: 'COMMENT' as const,
    title: '새 댓글',
    message: '이학습님이 회원님의 게시글에 댓글을 남겼습니다: "면접 준비에 큰 도움이 되었습니다!"',
    isRead: true,
    createdAt: '2026-01-28T11:00:00',
    referenceId: 5,
    referenceType: 'POST',
    actorId: 16,
    actorName: '이학습',
    metadata: {
      postTitle: '프론트엔드 개발자 면접 준비 팁',
      postId: 5,
    },
  },
  {
    id: 7,
    type: 'COURSE' as const,
    title: '강의 시작 안내',
    message: 'React 기초부터 실전까지 강의가 시작되었습니다. 지금 바로 학습을 시작해보세요!',
    isRead: true,
    createdAt: '2026-01-28T10:00:00',
    referenceId: 1,
    referenceType: 'COURSE_TIME',
    metadata: {
      courseName: 'React 기초부터 실전까지',
      courseTimeId: 1,
    },
  },
  {
    id: 8,
    type: 'SYSTEM' as const,
    title: '새로운 공지사항',
    message: '시스템 정기 점검 안내가 등록되었습니다.',
    isRead: true,
    createdAt: '2026-01-27T14:30:00',
    referenceId: 1,
    referenceType: 'NOTICE',
    metadata: {
      noticeCategory: '시스템',
    },
  },
  {
    id: 9,
    type: 'COURSE' as const,
    title: '수강 완료 축하드립니다!',
    message: 'AWS 클라우드 입문 강의를 완료하셨습니다. 수료증을 확인해보세요!',
    isRead: true,
    createdAt: '2026-01-25T17:00:00',
    referenceId: 3,
    referenceType: 'ENROLLMENT',
    metadata: {
      courseName: 'AWS 클라우드 입문',
      courseTimeId: 3,
    },
  },
  {
    id: 10,
    type: 'SYSTEM' as const,
    title: '환영합니다!',
    message: 'MZC Learn Platform에 오신 것을 환영합니다. 다양한 강의를 둘러보세요!',
    isRead: true,
    createdAt: '2026-01-15T10:00:00',
  },
];
