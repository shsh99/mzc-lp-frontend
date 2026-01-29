// Mock dashboard data
export const mockTADashboard = {
  kpi: {
    totalUsers: 1234,
    activeUsers: 856,
    totalCourses: 45,
    totalEnrollments: 3456,
    completionRate: 72.5,
    averageRating: 4.6,
    revenueThisMonth: 12500000,
    newUsersThisMonth: 156,
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

export const mockSADashboard = {
  totalTenants: 12,
  activeTenants: 10,
  totalUsers: 15678,
  totalCourses: 456,
  totalRevenue: 125000000,
  tenantStats: [
    { tenantId: 1, name: 'Demo Company', users: 1234, courses: 45, status: 'ACTIVE' },
    { tenantId: 2, name: 'Tech Corp', users: 2345, courses: 67, status: 'ACTIVE' },
    { tenantId: 3, name: 'Edu Institute', users: 3456, courses: 89, status: 'ACTIVE' },
  ],
  systemHealth: {
    apiLatency: 45,
    errorRate: 0.02,
    uptime: 99.98,
    activeConnections: 234,
  },
};

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
    { enrollmentId: 1, courseName: 'React 기초부터 실전까지', deadline: '2026-02-31', daysLeft: 64 },
    { enrollmentId: 2, courseName: 'TypeScript 마스터 클래스', deadline: '2026-03-15', daysLeft: 79 },
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
