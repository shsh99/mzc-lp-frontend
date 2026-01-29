// Mock dashboard data

// ========== SA Dashboard (SYSTEM_ADMIN) ==========
// GET /api/sa/dashboard
export const mockSADashboard = {
  tenantStats: {
    total: 3,
    active: 3,
    pending: 0,
    suspended: 0,
    terminated: 0,
    byPlan: {
      BASIC: 0,
      PRO: 1,
      ENTERPRISE: 2,
    },
  },
  userStats: {
    total: 590,
    active: 580,
    suspended: 5,
    withdrawn: 5,
  },
  recentTenants: [
    {
      id: 3,
      code: 'HYUNDAI_EDU',
      name: '현대 교육원',
      status: 'ACTIVE',
      plan: 'PRO',
      createdAt: '2025-12-15T00:00:00',
    },
    {
      id: 2,
      code: 'SAMSUNG_LC',
      name: '삼성 러닝센터',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      createdAt: '2025-12-10T00:00:00',
    },
    {
      id: 1,
      code: 'MZC_ACADEMY',
      name: 'MZC 아카데미',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      createdAt: '2025-12-01T00:00:00',
    },
  ],
};

// ========== TA Dashboard (TENANT_ADMIN) ==========
// GET /api/admin/dashboard/kpi
export const mockTADashboard = {
  userStats: {
    total: 156,
    active: 142,
    inactive: 8,
    suspended: 3,
    withdrawn: 3,
    newInPeriod: 12,
  },
  programStats: {
    total: 45,
    draft: 5,
    pending: 3,
    approved: 35,
    rejected: 1,
    closed: 1,
  },
  enrollmentStats: {
    totalEnrollments: 1234,
    byStatus: {
      enrolled: 456,
      completed: 678,
      dropped: 45,
      failed: 55,
    },
    completionRate: 72.5,
  },
  dailyTrend: [
    { date: '2026-01-24', enrollments: 15, completions: 8 },
    { date: '2026-01-25', enrollments: 22, completions: 12 },
    { date: '2026-01-26', enrollments: 18, completions: 10 },
    { date: '2026-01-27', enrollments: 25, completions: 15 },
    { date: '2026-01-28', enrollments: 30, completions: 18 },
    { date: '2026-01-29', enrollments: 28, completions: 20 },
    { date: '2026-01-30', enrollments: 35, completions: 22 },
  ],
  // 하위 호환용 (기존 코드에서 사용하는 경우)
  kpi: {
    totalUsers: 156,
    activeUsers: 142,
    totalCourses: 45,
    totalEnrollments: 1234,
    completionRate: 72.5,
    averageRating: 4.6,
    revenueThisMonth: 12500000,
    newUsersThisMonth: 12,
  },
  recentActivities: [
    { id: 1, type: 'ENROLLMENT', message: '홍길동님이 React 기초부터 실전까지 과정에 등록했습니다.', createdAt: '2026-01-28T15:30:00' },
    { id: 2, type: 'COMPLETION', message: '김철수님이 AWS 클라우드 입문 과정을 수료했습니다.', createdAt: '2026-01-28T14:20:00' },
    { id: 3, type: 'REVIEW', message: '이영희님이 TypeScript 마스터 클래스 과정에 5점 리뷰를 남겼습니다.', createdAt: '2026-01-28T12:10:00' },
    { id: 4, type: 'ENROLLMENT', message: '박민수님이 Python 데이터 분석 과정에 등록했습니다.', createdAt: '2026-01-28T11:00:00' },
    { id: 5, type: 'USER', message: '새로운 사용자 정다은님이 가입했습니다.', createdAt: '2026-01-28T10:30:00' },
  ],
  courseStats: [
    { courseId: 1, courseName: 'React 기초부터 실전까지', enrollments: 234, completions: 156, rating: 4.8 },
    { courseId: 2, courseName: 'TypeScript 마스터 클래스', enrollments: 189, completions: 98, rating: 4.9 },
    { courseId: 3, courseName: 'AWS 클라우드 입문', enrollments: 312, completions: 245, rating: 4.7 },
    { courseId: 4, courseName: 'Python 데이터 분석', enrollments: 145, completions: 67, rating: 4.6 },
    { courseId: 5, courseName: 'UX/UI 디자인 기초', enrollments: 98, completions: 45, rating: 4.5 },
  ],
};

// ========== CO Dashboard (OPERATOR) ==========
// GET /api/operator/dashboard/tasks
export const mockCODashboard = {
  pendingTasks: {
    programsPendingApproval: 3,
    courseTimesNeedingInstructor: 2,
  },
  courseTimeStats: {
    byStatus: {
      draft: 5,
      recruiting: 8,
      ongoing: 12,
      closed: 15,
      archived: 5,
    },
    byDeliveryType: {
      online: 20,
      offline: 10,
      blended: 8,
      live: 7,
    },
    freeVsPaid: {
      free: 15,
      paid: 30,
    },
    total: 45,
  },
  enrollmentStats: {
    totalEnrollments: 1234,
    byStatus: {
      enrolled: 456,
      completed: 678,
      dropped: 45,
      failed: 55,
    },
    byType: {
      voluntary: 800,
      mandatory: 434,
    },
    completionRate: 72.5,
    averageCapacityUtilization: 78.3,
  },
  dailyTrend: [
    { date: '2026-01-24', enrollments: 15 },
    { date: '2026-01-25', enrollments: 22 },
    { date: '2026-01-26', enrollments: 18 },
    { date: '2026-01-27', enrollments: 25 },
    { date: '2026-01-28', enrollments: 30 },
    { date: '2026-01-29', enrollments: 28 },
    { date: '2026-01-30', enrollments: 35 },
  ],
};

// ========== TU Dashboard (USER) ==========
export const mockTUDashboard = {
  myLearning: {
    inProgressCourses: 3,
    completedCourses: 8,
    totalLearningHours: 45,
    certificatesEarned: 6,
    averageScore: 85,
  },
  recentCourses: [
    {
      enrollmentId: 1,
      courseName: 'React 기초부터 실전까지',
      thumbnailUrl: 'https://picsum.photos/seed/react/400/300',
      progress: 65,
      lastAccessedAt: '2026-01-28T15:30:00',
    },
    {
      enrollmentId: 2,
      courseName: 'TypeScript 마스터 클래스',
      thumbnailUrl: 'https://picsum.photos/seed/typescript/400/300',
      progress: 30,
      lastAccessedAt: '2026-01-27T11:20:00',
    },
  ],
  upcomingDeadlines: [
    { enrollmentId: 1, courseName: 'React 기초부터 실전까지', deadline: '2026-02-28', daysLeft: 29 },
    { enrollmentId: 2, courseName: 'TypeScript 마스터 클래스', deadline: '2026-03-15', daysLeft: 44 },
  ],
  recommendedCourses: [
    {
      id: 4,
      title: 'Python 데이터 분석',
      thumbnailUrl: 'https://picsum.photos/seed/python/400/300',
      rating: 4.6,
      enrollmentCount: 456,
    },
    {
      id: 5,
      title: 'UX/UI 디자인 기초',
      thumbnailUrl: 'https://picsum.photos/seed/uxui/400/300',
      rating: 4.5,
      enrollmentCount: 234,
    },
  ],
};
