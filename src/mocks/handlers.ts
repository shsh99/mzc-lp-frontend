import { http, HttpResponse, delay } from 'msw';
import {
  mockUsers,
  mockAuth,
  mockCredentials,
  mockUserDetails,
  mockTenants,
  getUsersByTenant,
  mockCourses,
  mockCourseTimes,
  mockCategories,
  mockCommunityPosts,
  getCommunityPostsByTenant,
  mockCourseReviews,
  getCourseReviewsByTenant,
  getCourseReviewsByCourse,
  mockTenantSettings,
  mockBanners,
  mockTenantNotices,
  mockEnrollments,
  mockCertificates,
  mockCurriculum,
  mockWishlist,
  mockCart,
  mockNotifications,
  mockTUDashboard,
  mockSADashboard,
  mockCODashboardByPeriod,
  mockTADashboardByPeriod,
} from './data';
import {
  mockActivityLogs,
  mockRecentActivities,
  mockActivityStatsByDays,
  searchActivityLogs,
} from './data/analytics';
import type { ActivityType } from '@/services/ta/analyticsService';

// Helper to wrap response in ApiResponse format
const apiResponse = <T>(data: T) => ({
  success: true,
  data,
  error: null,
});

// Helper for paginated response
const paginatedResponse = <T>(items: T[], page = 0, size = 10) => {
  const start = page * size;
  const end = start + size;
  const content = items.slice(start, end);
  return {
    content,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    size,
    number: page,
    first: page === 0,
    last: end >= items.length,
    empty: content.length === 0,
  };
};

// Error response helper
const errorResponse = (message: string, code: string = 'ERROR') => ({
  success: false,
  data: null,
  error: { code, message },
});

// 과정별 운영 중인 차수 수를 계산하는 헬퍼
const getRunningTimeCount = (courseId: number) => {
  // course.id와 program.id가 일치하는 차수 중 RECRUITING 또는 ONGOING 상태인 것을 카운트
  return mockCourseTimes.filter(
    time => time.program?.id === courseId &&
    (time.status === 'RECRUITING' || time.status === 'ONGOING')
  ).length;
};

// 과정별 운영 기간을 계산하는 헬퍼 (가장 빠른 시작일 ~ 가장 늦은 종료일)
const getCoursePeriod = (courseId: number) => {
  const courseTimes = mockCourseTimes.filter(time => time.program?.id === courseId);
  if (courseTimes.length === 0) {
    return { startDate: null, endDate: null };
  }

  const startDates = courseTimes.map(t => t.classStartDate).filter(Boolean).sort();
  const endDates = courseTimes.map(t => t.classEndDate).filter(Boolean).sort();

  return {
    startDate: startDates.length > 0 ? startDates[0] : null,
    endDate: endDates.length > 0 ? endDates[endDates.length - 1] : null,
  };
};

// Course 백엔드 응답 형식으로 변환하는 헬퍼
const transformCourseToBackend = (course: (typeof mockCourses)[0]) => {
  const period = getCoursePeriod(course.id);
  return {
    id: course.id, // CourseRegistrationResponse의 id 필드
    courseId: course.id,
    title: course.title,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl,
    level: course.level,
    type: 'ONLINE',
    estimatedHours: Math.floor(course.duration / 60),
    categoryId: course.categoryId,
    categoryName: course.categoryName, // 카테고리명 추가
    status: 'REGISTERED', // 승인된 과정 상태
    creatorId: course.instructorId, // 생성자 ID
    creatorName: course.instructorName, // 생성자명 추가
    ownerId: course.instructorId,
    ownerName: course.instructorName,
    ownerEmail: null,
    snapshotId: null,
    courseStartDate: period.startDate, // 운영 시작일
    courseEndDate: period.endDate, // 운영 종료일
    timeCount: getRunningTimeCount(course.id), // 운영 중인 차수 수 추가
    tags: [],
    createdAt: course.createdAt,
    updatedAt: course.createdAt,
    // Mock 추가 필드 (프론트엔드에서 활용)
    rating: course.rating,
    reviewCount: course.reviewCount,
    enrollmentCount: course.enrollmentCount,
    instructorId: course.instructorId,
    instructorName: course.instructorName,
  };
};

export const handlers = [
  // ========== Auth ==========
  http.post('/api/auth/login', async ({ request }) => {
    await delay(50);

    try {
      const body = await request.json() as { email: string; password: string };
      const { email, password } = body;

      // 계정 검증
      const credential = mockCredentials[email];
      if (!credential || credential.password !== password) {
        return HttpResponse.json(
          errorResponse('이메일 또는 비밀번호가 올바르지 않습니다.', 'INVALID_CREDENTIALS'),
          { status: 401 }
        );
      }

      // 사용자 정보 조회
      const user = mockUserDetails[credential.userId];
      if (!user) {
        return HttpResponse.json(
          errorResponse('사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND'),
          { status: 404 }
        );
      }

      const token = `mock-access-token-${user.id}-${Date.now()}`;
      console.log('[MSW] Login success - User:', user.email, 'Role:', user.currentRole, 'Token:', token);

      return HttpResponse.json(apiResponse({
        accessToken: token,
        refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
        expiresIn: 900000,
        user,
      }));
    } catch (error) {
      console.error('[MSW] Login error:', error);
      return HttpResponse.json(
        errorResponse('로그인 처리 중 오류가 발생했습니다.', 'LOGIN_ERROR'),
        { status: 500 }
      );
    }
  }),

  http.post('/api/auth/register', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse({ message: '회원가입이 완료되었습니다.' }));
  }),

  http.post('/api/auth/refresh', async () => {
    await delay(10);
    return HttpResponse.json(apiResponse(mockAuth.loginResponse));
  }),

  http.post('/api/auth/switch-role', async ({ request }) => {
    await delay(10);
    const body = await request.json() as { role: string };
    return HttpResponse.json(apiResponse({
      ...mockAuth.loginResponse,
      user: { ...mockUsers.currentUser, currentRole: body.role },
    }));
  }),

  // ========== Users ==========
  http.get('/api/users/me', async ({ request }) => {
    await delay(30);

    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization');
    console.log('[MSW] /api/users/me - Authorization:', authHeader);

    // 토큰 형식: mock-access-token-{userId}-{timestamp}
    const tokenMatch = authHeader?.match(/mock-access-token-(\d+)-/);
    console.log('[MSW] /api/users/me - Token match:', tokenMatch);

    if (tokenMatch) {
      const userId = parseInt(tokenMatch[1], 10);
      const user = mockUserDetails[userId];
      console.log('[MSW] /api/users/me - Found user:', user?.email, 'role:', user?.currentRole);

      if (user) {
        // API 응답 형식에 맞게 변환 (userId 필드 사용)
        return HttpResponse.json(apiResponse({
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.currentRole,
          roles: user.roles,
          status: user.status,
          profileImageUrl: user.profileImageUrl,
          tenantId: user.tenantId,
          tenantSubdomain: user.tenantSubdomain,
          departmentId: user.departmentId,
          departmentName: user.departmentName,
          position: user.position,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }));
      }
    }

    // 토큰이 없거나 파싱 실패시 기본 사용자 반환
    console.log('[MSW] /api/users/me - Fallback to default user:', mockUsers.currentUser.email);
    return HttpResponse.json(apiResponse({
      userId: mockUsers.currentUser.id,
      email: mockUsers.currentUser.email,
      name: mockUsers.currentUser.name,
      role: mockUsers.currentUser.currentRole,
      roles: mockUsers.currentUser.roles,
      status: mockUsers.currentUser.status,
      profileImageUrl: mockUsers.currentUser.profileImageUrl,
      tenantId: mockUsers.currentUser.tenantId,
      tenantSubdomain: mockUsers.currentUser.tenantSubdomain,
      departmentId: mockUsers.currentUser.departmentId,
      departmentName: mockUsers.currentUser.departmentName,
      position: mockUsers.currentUser.position,
      createdAt: mockUsers.currentUser.createdAt,
      updatedAt: mockUsers.currentUser.updatedAt,
    }));
  }),

  http.get('/api/users/me/learning-stats', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockUsers.learningStats));
  }),

  http.get('/api/users/me/enrollments', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse(mockEnrollments)));
  }),

  http.get('/api/users/me/certificates', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockCertificates));
  }),

  http.get('/api/users', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const roleParam = url.searchParams.get('role');
    const statusParam = url.searchParams.get('status');
    const keywordParam = url.searchParams.get('keyword');
    const page = Number(url.searchParams.get('page') || '0');
    const size = Number(url.searchParams.get('size') || '10');

    let filteredUsers = [...mockUsers.users];

    // 역할 필터
    if (roleParam) {
      filteredUsers = filteredUsers.filter(user => user.roles.includes(roleParam));
    }

    // 상태 필터
    if (statusParam) {
      filteredUsers = filteredUsers.filter(user => user.status === statusParam);
    }

    // 키워드 검색 (이름, 이메일)
    if (keywordParam) {
      const keyword = keywordParam.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      );
    }

    return HttpResponse.json(apiResponse(paginatedResponse(filteredUsers, page, size)));
  }),

  http.get('/api/users/:id', async ({ params }) => {
    await delay(30);
    const userId = Number(params.id);
    const user = mockUserDetails[userId];
    if (user) {
      return HttpResponse.json(apiResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        systemRole: user.currentRole,
        courseRoles: [],
        tenantId: user.tenantId,
        organizationName: user.departmentName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: '2026-01-28T10:00:00',
        phone: '010-1234-5678',
        department: user.departmentName,
        position: user.position,
        stats: {
          totalCourses: 12,
          completedCourses: 8,
          inProgressCourses: 3,
          totalLearningTime: 45,
          averageScore: 87,
        },
        enrollments: [
          { id: 1, courseTitle: 'React 기초부터 실전까지', progress: 100, status: 'COMPLETED', enrolledAt: '2025-12-20', completedAt: '2026-01-15' },
          { id: 2, courseTitle: 'TypeScript 마스터 클래스', progress: 75, status: 'IN_PROGRESS', enrolledAt: '2026-01-01' },
        ],
        activityLogs: [
          { id: 1, action: '로그인', description: '시스템에 로그인했습니다.', timestamp: '2026-01-28 09:15:00', type: 'login' },
          { id: 2, action: '강의 수강', description: 'React 실전 프로젝트 - 챕터 5 완료', timestamp: '2026-01-28 10:30:00', type: 'course' },
        ],
      }));
    }
    const fallbackUser = mockUsers.users.find((u: { id: number }) => u.id === userId);
    return HttpResponse.json(apiResponse(fallbackUser || mockUsers.currentUser));
  }),

  // User roles
  http.get('/api/users/:id/roles', async ({ params }) => {
    await delay(30);
    const userId = Number(params.id);
    const user = mockUserDetails[userId];
    return HttpResponse.json(apiResponse(user?.roles || ['USER']));
  }),

  // 사용자별 수강 통계 조회
  http.get('/api/users/:id/enrollments/stats', async ({ params }) => {
    await delay(30);
    const userId = Number(params.id);

    // 해당 사용자의 수강 이력 조회
    const userEnrollments = mockEnrollments.filter(e => e.userId === userId);

    const totalEnrollments = userEnrollments.length;
    const completedCount = userEnrollments.filter(e => e.status === 'COMPLETED').length;
    const inProgressCount = userEnrollments.filter(e => e.status === 'ENROLLED').length;
    const droppedCount = userEnrollments.filter(e => e.status === 'DROPPED').length;
    const failedCount = userEnrollments.filter(e => e.status === 'FAILED').length;

    const completionRate = totalEnrollments > 0
      ? Math.round((completedCount / totalEnrollments) * 100)
      : 0;

    const enrollmentsWithProgress = userEnrollments.filter(e => e.progressPercent !== undefined);
    const averageProgress = enrollmentsWithProgress.length > 0
      ? Math.round(enrollmentsWithProgress.reduce((sum, e) => sum + (e.progressPercent || 0), 0) / enrollmentsWithProgress.length)
      : 0;

    const enrollmentsWithScore = userEnrollments.filter(e => e.score !== null && e.score !== undefined);
    const averageScore = enrollmentsWithScore.length > 0
      ? Math.round(enrollmentsWithScore.reduce((sum, e) => sum + (e.score || 0), 0) / enrollmentsWithScore.length)
      : 0;

    return HttpResponse.json(apiResponse({
      userId,
      totalEnrollments,
      completedCount,
      inProgressCount,
      droppedCount,
      failedCount,
      completionRate,
      averageScore,
      averageProgress,
    }));
  }),

  // 사용자별 수강 이력 조회
  http.get('/api/users/:id/enrollments', async ({ params, request }) => {
    await delay(50);
    const userId = Number(params.id);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;
    const status = url.searchParams.get('status') || '';

    let userEnrollments = mockEnrollments.filter(e => e.userId === userId);

    // 상태 필터링
    if (status) {
      userEnrollments = userEnrollments.filter(e => e.status === status);
    }

    const totalElements = userEnrollments.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const paged = userEnrollments.slice(start, start + size);

    // 과정 정보 추가
    const content = paged.map(e => {
      const courseTime = mockCourseTimes.find(ct => ct.id === e.courseTimeId);
      return {
        ...e,
        courseTitle: courseTime?.program?.title || `Course ${e.courseTimeId}`,
        courseTimeName: courseTime?.title || `차수 ${e.courseTimeId}`,
      };
    });

    return HttpResponse.json(apiResponse({
      content,
      totalElements,
      totalPages,
      size,
      number: page,
    }));
  }),

  // Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    await delay(50);
    const userId = Number(params.id);
    const body = (await request.json()) as Record<string, unknown>;
    const user = mockUserDetails[userId];
    if (!user) {
      return HttpResponse.json(
        errorResponse('사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({ ...user, ...body, updatedAt: new Date().toISOString() }));
  }),

  // Update user roles
  http.put('/api/users/:id/roles', async ({ params, request }) => {
    await delay(50);
    const userId = Number(params.id);
    const body = (await request.json()) as { roles: string[] };
    const user = mockUserDetails[userId];
    if (!user) {
      return HttpResponse.json(
        errorResponse('사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({ ...user, roles: body.roles }));
  }),

  // Delete user
  http.delete('/api/users/:id', async ({ params }) => {
    await delay(50);
    const userId = Number(params.id);
    const user = mockUserDetails[userId];
    if (!user) {
      return HttpResponse.json(
        errorResponse('사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({ message: '사용자가 삭제되었습니다.' }));
  }),

  // ========== Public APIs ==========
  http.get('/api/public/tenants/branding', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTenantSettings.branding));
  }),

  http.get('/api/public/course-times', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);

    // 필터 파라미터 파싱
    const categoryId = url.searchParams.get('categoryId');
    const statusParams = url.searchParams.getAll('status');
    const deliveryType = url.searchParams.get('deliveryType');
    const isFree = url.searchParams.get('isFree');
    const keyword = url.searchParams.get('keyword');
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '10', 10);

    let filteredCourseTimes = [...mockCourseTimes];

    // 카테고리 필터링
    if (categoryId) {
      const catId = parseInt(categoryId, 10);
      filteredCourseTimes = filteredCourseTimes.filter(
        ct => ct.program?.categoryId === catId
      );
    }

    // 상태 필터링
    if (statusParams.length > 0) {
      filteredCourseTimes = filteredCourseTimes.filter(
        ct => statusParams.includes(ct.status)
      );
    }

    // 운영 방식 필터링
    if (deliveryType) {
      filteredCourseTimes = filteredCourseTimes.filter(
        ct => ct.deliveryType === deliveryType
      );
    }

    // 무료/유료 필터링
    if (isFree !== null && isFree !== undefined) {
      const isFreeValue = isFree === 'true';
      filteredCourseTimes = filteredCourseTimes.filter(
        ct => ct.isFree === isFreeValue
      );
    }

    // 키워드 검색
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredCourseTimes = filteredCourseTimes.filter(
        ct => ct.title.toLowerCase().includes(lowerKeyword) ||
              ct.program?.title?.toLowerCase().includes(lowerKeyword)
      );
    }

    return HttpResponse.json(apiResponse(paginatedResponse(filteredCourseTimes, page, size)));
  }),

  // 차수 상세 조회 (Public)
  http.get('/api/public/course-times/:id', async ({ params }) => {
    await delay(30);
    const courseTimeId = Number(params.id);
    const courseTime = mockCourseTimes.find(ct => ct.id === courseTimeId);

    if (!courseTime) {
      return HttpResponse.json(
        errorResponse('강의를 찾을 수 없습니다.', 'COURSE_TIME_NOT_FOUND'),
        { status: 404 }
      );
    }

    // CourseTimePublicDetailResponse 형식으로 변환
    const detailResponse = {
      id: courseTime.id,
      title: courseTime.title,
      status: courseTime.status,
      deliveryType: courseTime.deliveryType,
      isOnDemand: courseTime.isOnDemand,
      enrollStartDate: courseTime.enrollStartDate,
      enrollEndDate: courseTime.enrollEndDate,
      classStartDate: courseTime.classStartDate,
      classEndDate: courseTime.classEndDate,
      capacity: courseTime.capacity,
      currentEnrollment: courseTime.currentEnrollment,
      availableSeats: courseTime.availableSeats,
      price: courseTime.price,
      isFree: courseTime.isFree,
      enrollmentMethod: courseTime.enrollmentMethod,
      allowLateEnrollment: false,
      minProgressForCompletion: 80,
      locationInfo: courseTime.deliveryType === 'OFFLINE' || courseTime.deliveryType === 'BLENDED'
        ? '서울시 강남구 테헤란로 123, MZC 빌딩 3층'
        : null,
      program: courseTime.program,
      course: courseTime.program ? {
        id: courseTime.program.id,
        title: courseTime.program.title,
        description: courseTime.program.description,
      } : null,
      curriculum: [
        {
          id: 1,
          itemName: '1장. 기초 개념',
          itemType: 'FOLDER',
          isFolder: true,
          duration: null,
          children: [
            { id: 2, itemName: '강의 소개', itemType: 'VIDEO', isFolder: false, duration: 600, children: [] },
            { id: 3, itemName: '핵심 개념 이해', itemType: 'VIDEO', isFolder: false, duration: 900, children: [] },
            { id: 4, itemName: '개념 퀴즈', itemType: 'QUIZ', isFolder: false, duration: 300, children: [] },
          ],
        },
        {
          id: 5,
          itemName: '2장. 심화 학습',
          itemType: 'FOLDER',
          isFolder: true,
          duration: null,
          children: [
            { id: 6, itemName: '고급 기능', itemType: 'VIDEO', isFolder: false, duration: 1200, children: [] },
            { id: 7, itemName: '실습 과제', itemType: 'ASSIGNMENT', isFolder: false, duration: 1800, children: [] },
          ],
        },
        {
          id: 8,
          itemName: '3장. 프로젝트',
          itemType: 'FOLDER',
          isFolder: true,
          duration: null,
          children: [
            { id: 9, itemName: '프로젝트 소개', itemType: 'VIDEO', isFolder: false, duration: 600, children: [] },
            { id: 10, itemName: '최종 평가', itemType: 'EXAM', isFolder: false, duration: 3600, children: [] },
          ],
        },
      ],
      instructors: courseTime.instructors,
    };

    return HttpResponse.json(apiResponse(detailResponse));
  }),

  // ========== Tenant Settings ==========
  http.get('/api/tenant/settings/branding', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTenantSettings.branding));
  }),

  http.get('/api/tenant/settings/branding/extended', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTenantSettings.branding));
  }),

  http.get('/api/tenant/settings/features', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTenantSettings.features));
  }),

  http.get('/api/tenant/settings/features/public', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTenantSettings.features));
  }),

  http.get('/api/tenant/settings/layout', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTenantSettings.layout));
  }),

  http.get('/api/tenant/settings/layout/public', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTenantSettings.layout));
  }),

  http.get('/api/tenant/settings/navigation', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTenantSettings.navigation));
  }),

  http.get('/api/tenant/settings/navigation/public', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTenantSettings.navigation));
  }),

  // Tenant Settings - PUT (수정)
  http.put('/api/tenant/settings/branding', async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(apiResponse({ ...mockTenantSettings.branding, ...body }));
  }),

  http.put('/api/tenant/settings/branding/extended', async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(apiResponse({ ...mockTenantSettings.branding, ...body }));
  }),

  http.put('/api/tenant/settings/design', async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(apiResponse({ ...mockTenantSettings.branding, ...body }));
  }),

  // TA Domain Settings
  http.get('/api/ta/domain-settings', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({
      subdomain: 'mzc',
      fullSubdomainUrl: 'mzc.mzclearn.com',
      customDomain: null,
      customDomainEnabled: false,
      dnsInstructions: null,
    }));
  }),

  http.put('/api/ta/domain-settings/custom', async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as Record<string, unknown>;
    const customDomain = (body.customDomain as string) || null;
    return HttpResponse.json(apiResponse({
      subdomain: 'mzc',
      fullSubdomainUrl: 'mzc.mzclearn.com',
      customDomain,
      customDomainEnabled: !!customDomain,
      dnsInstructions: customDomain ? {
        recordType: 'CNAME',
        recordName: customDomain,
        recordValue: 'mzc.mzclearn.com',
      } : null,
    }));
  }),

  http.delete('/api/ta/domain-settings/custom', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse({
      subdomain: 'mzc',
      fullSubdomainUrl: 'mzc.mzclearn.com',
      customDomain: null,
      customDomainEnabled: false,
      dnsInstructions: null,
    }));
  }),

  http.put('/api/tenant/settings/features', async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(apiResponse({ ...mockTenantSettings.features, ...body }));
  }),

  http.put('/api/tenant/settings/layout', async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(apiResponse({ ...mockTenantSettings.layout, ...body }));
  }),

  http.put('/api/tenant/settings/navigation', async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as Record<string, unknown>[];
    return HttpResponse.json(apiResponse(body));
  }),

  // ========== Banners ==========
  http.get('/api/banners', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockBanners));
  }),

  http.get('/api/banners/public/displayable', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockBanners.filter(b => b.isActive)));
  }),

  // ========== Categories ==========
  http.get('/api/categories', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockCategories));
  }),

  http.get('/api/tenant/categories', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockCategories));
  }),

  http.get('/api/tenant/categories/public', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockCategories));
  }),

  // ========== Courses ==========
  http.get('/api/courses', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');
    const categoryId = url.searchParams.get('categoryId');
    const level = url.searchParams.get('level');
    const type = url.searchParams.get('type');
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;

    // 필터링
    let filteredCourses = [...mockCourses];

    // 키워드 검색 (제목, 설명, 생성자명)
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(lowerKeyword) ||
        course.description?.toLowerCase().includes(lowerKeyword) ||
        course.instructorName?.toLowerCase().includes(lowerKeyword)
      );
    }

    // 카테고리 필터
    if (categoryId) {
      filteredCourses = filteredCourses.filter(course =>
        course.categoryId === Number(categoryId)
      );
    }

    // 레벨 필터
    if (level) {
      filteredCourses = filteredCourses.filter(course =>
        course.level === level
      );
    }

    // 타입 필터 (현재 mock 데이터에는 type이 없으므로 ONLINE으로 가정)
    if (type && type !== 'ONLINE') {
      filteredCourses = []; // ONLINE이 아닌 타입은 빈 배열
    }

    const transformedCourses = filteredCourses.map(transformCourseToBackend);
    return HttpResponse.json(apiResponse(paginatedResponse(transformedCourses, page, size)));
  }),

  http.get('/api/courses/my', async () => {
    await delay(30);
    const transformedCourses = mockCourses.slice(0, 3).map(transformCourseToBackend);
    return HttpResponse.json(apiResponse(paginatedResponse(transformedCourses)));
  }),

  http.get('/api/courses/:id', async ({ params }) => {
    await delay(30);
    const course = mockCourses.find(c => c.id === Number(params.id));
    const baseCourse = course || mockCourses[0];
    return HttpResponse.json(apiResponse({
      ...transformCourseToBackend(baseCourse),
      items: [],
      itemCount: baseCourse.totalItems || 0,
      startDate: null,
      endDate: null,
    }));
  }),

  // 과정 커리큘럼 계층 구조 조회
  http.get('/api/courses/:courseId/items/hierarchy', async ({ params }) => {
    await delay(30);
    const courseId = Number(params.courseId);

    // 과정별 커리큘럼 데이터
    const curriculumMap: Record<number, Array<{
      itemId: number;
      itemName: string;
      depth: number;
      learningObjectId: number | null;
      isFolder: boolean;
      displayName: string | null;
      description: string | null;
      children: Array<{
        itemId: number;
        itemName: string;
        depth: number;
        learningObjectId: number | null;
        isFolder: boolean;
        displayName: string | null;
        description: string | null;
        children: never[];
      }>;
    }>> = {
      // React 기초부터 실전까지
      1: [
        {
          itemId: 101,
          itemName: '1. React 기초',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: 'React 기초',
          description: 'React의 기본 개념을 학습합니다.',
          children: [
            { itemId: 111, itemName: 'React란 무엇인가?', depth: 1, learningObjectId: 1001, isFolder: false, displayName: null, description: 'React 프레임워크 소개', children: [] },
            { itemId: 112, itemName: 'JSX 문법 이해하기', depth: 1, learningObjectId: 1002, isFolder: false, displayName: null, description: 'JSX 기본 문법 학습', children: [] },
            { itemId: 113, itemName: '컴포넌트의 이해', depth: 1, learningObjectId: 1003, isFolder: false, displayName: null, description: '함수형 컴포넌트와 클래스 컴포넌트', children: [] },
          ],
        },
        {
          itemId: 102,
          itemName: '2. React Hooks',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: 'React Hooks',
          description: 'React Hooks를 활용한 상태 관리',
          children: [
            { itemId: 121, itemName: 'useState 훅', depth: 1, learningObjectId: 1004, isFolder: false, displayName: null, description: '상태 관리의 기초', children: [] },
            { itemId: 122, itemName: 'useEffect 훅', depth: 1, learningObjectId: 1005, isFolder: false, displayName: null, description: '사이드 이펙트 처리', children: [] },
            { itemId: 123, itemName: 'Custom Hooks 만들기', depth: 1, learningObjectId: 1006, isFolder: false, displayName: null, description: '재사용 가능한 로직 분리', children: [] },
          ],
        },
        {
          itemId: 103,
          itemName: '3. 실전 프로젝트',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '실전 프로젝트',
          description: '배운 내용을 활용한 프로젝트',
          children: [
            { itemId: 131, itemName: 'Todo 앱 만들기', depth: 1, learningObjectId: 1007, isFolder: false, displayName: null, description: 'CRUD 기능 구현', children: [] },
            { itemId: 132, itemName: '날씨 앱 만들기', depth: 1, learningObjectId: 1008, isFolder: false, displayName: null, description: 'API 연동 실습', children: [] },
          ],
        },
      ],
      // TypeScript 마스터 클래스
      2: [
        {
          itemId: 201,
          itemName: '1. TypeScript 기초',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: 'TypeScript 기초',
          description: 'TypeScript의 기본 개념',
          children: [
            { itemId: 211, itemName: '타입 시스템 이해', depth: 1, learningObjectId: 2001, isFolder: false, displayName: null, description: '기본 타입과 타입 추론', children: [] },
            { itemId: 212, itemName: '인터페이스와 타입', depth: 1, learningObjectId: 2002, isFolder: false, displayName: null, description: '인터페이스 정의와 활용', children: [] },
          ],
        },
        {
          itemId: 202,
          itemName: '2. 고급 타입',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '고급 타입',
          description: 'TypeScript 고급 기능',
          children: [
            { itemId: 221, itemName: '제네릭 활용', depth: 1, learningObjectId: 2003, isFolder: false, displayName: null, description: '재사용 가능한 타입 정의', children: [] },
            { itemId: 222, itemName: '유틸리티 타입', depth: 1, learningObjectId: 2004, isFolder: false, displayName: null, description: 'Partial, Pick, Omit 등', children: [] },
            { itemId: 223, itemName: '조건부 타입', depth: 1, learningObjectId: 2005, isFolder: false, displayName: null, description: '타입 레벨 프로그래밍', children: [] },
          ],
        },
      ],
      // AWS 클라우드 입문
      3: [
        {
          itemId: 301,
          itemName: '1. AWS 소개',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: 'AWS 소개',
          description: 'AWS 클라우드 서비스 개요',
          children: [
            { itemId: 311, itemName: 'AWS란 무엇인가?', depth: 1, learningObjectId: 3001, isFolder: false, displayName: null, description: 'AWS 클라우드 소개', children: [] },
            { itemId: 312, itemName: 'AWS 계정 생성', depth: 1, learningObjectId: 3002, isFolder: false, displayName: null, description: '계정 생성 및 설정', children: [] },
          ],
        },
        {
          itemId: 302,
          itemName: '2. 핵심 서비스',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '핵심 서비스',
          description: 'AWS 주요 서비스 학습',
          children: [
            { itemId: 321, itemName: 'EC2 인스턴스', depth: 1, learningObjectId: 3003, isFolder: false, displayName: null, description: '가상 서버 운영', children: [] },
            { itemId: 322, itemName: 'S3 스토리지', depth: 1, learningObjectId: 3004, isFolder: false, displayName: null, description: '객체 스토리지 활용', children: [] },
            { itemId: 323, itemName: 'RDS 데이터베이스', depth: 1, learningObjectId: 3005, isFolder: false, displayName: null, description: '관계형 DB 서비스', children: [] },
          ],
        },
      ],
      // Python 데이터 분석
      4: [
        {
          itemId: 401,
          itemName: '1. Python 기초',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: 'Python 기초',
          description: '데이터 분석을 위한 Python',
          children: [
            { itemId: 411, itemName: 'Python 환경 설정', depth: 1, learningObjectId: 4001, isFolder: false, displayName: null, description: 'Anaconda 설치', children: [] },
            { itemId: 412, itemName: '기본 문법 복습', depth: 1, learningObjectId: 4002, isFolder: false, displayName: null, description: 'Python 기본 문법', children: [] },
          ],
        },
        {
          itemId: 402,
          itemName: '2. 데이터 분석 라이브러리',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '데이터 분석 라이브러리',
          description: 'pandas, numpy 활용',
          children: [
            { itemId: 421, itemName: 'NumPy 기초', depth: 1, learningObjectId: 4003, isFolder: false, displayName: null, description: '배열 연산', children: [] },
            { itemId: 422, itemName: 'Pandas DataFrame', depth: 1, learningObjectId: 4004, isFolder: false, displayName: null, description: '데이터 조작', children: [] },
            { itemId: 423, itemName: '데이터 시각화', depth: 1, learningObjectId: 4005, isFolder: false, displayName: null, description: 'Matplotlib, Seaborn', children: [] },
          ],
        },
      ],
      // ========== 삼성 러닝센터 과정 ==========
      // 삼성 리더십 과정
      101: [
        {
          itemId: 10101,
          itemName: '1. 리더십 기초',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '리더십 기초',
          description: '리더십의 기본 개념과 원칙',
          children: [
            { itemId: 10111, itemName: '리더십이란 무엇인가?', depth: 1, learningObjectId: 101001, isFolder: false, displayName: null, description: '리더십 개념 이해', children: [] },
            { itemId: 10112, itemName: '삼성 리더십 원칙', depth: 1, learningObjectId: 101002, isFolder: false, displayName: null, description: '삼성의 핵심 가치', children: [] },
            { itemId: 10113, itemName: '셀프 리더십', depth: 1, learningObjectId: 101003, isFolder: false, displayName: null, description: '자기 관리의 중요성', children: [] },
          ],
        },
        {
          itemId: 10102,
          itemName: '2. 팀 리더십',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '팀 리더십',
          description: '효과적인 팀 이끌기',
          children: [
            { itemId: 10121, itemName: '팀 빌딩', depth: 1, learningObjectId: 101004, isFolder: false, displayName: null, description: '효과적인 팀 구성', children: [] },
            { itemId: 10122, itemName: '동기 부여', depth: 1, learningObjectId: 101005, isFolder: false, displayName: null, description: '팀원 동기 부여 전략', children: [] },
            { itemId: 10123, itemName: '갈등 관리', depth: 1, learningObjectId: 101006, isFolder: false, displayName: null, description: '팀 내 갈등 해결', children: [] },
          ],
        },
      ],
      // 디지털 트랜스포메이션 기초
      102: [
        {
          itemId: 10201,
          itemName: '1. DX 개요',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: 'DX 개요',
          description: '디지털 전환의 이해',
          children: [
            { itemId: 10211, itemName: 'DX란 무엇인가?', depth: 1, learningObjectId: 102001, isFolder: false, displayName: null, description: '디지털 전환 개념', children: [] },
            { itemId: 10212, itemName: 'DX 성공 사례', depth: 1, learningObjectId: 102002, isFolder: false, displayName: null, description: '글로벌 DX 사례 분석', children: [] },
          ],
        },
        {
          itemId: 10202,
          itemName: '2. DX 전략',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: 'DX 전략',
          description: '디지털 전환 전략 수립',
          children: [
            { itemId: 10221, itemName: 'DX 로드맵', depth: 1, learningObjectId: 102003, isFolder: false, displayName: null, description: '전환 로드맵 설계', children: [] },
            { itemId: 10222, itemName: '조직 변화 관리', depth: 1, learningObjectId: 102004, isFolder: false, displayName: null, description: '변화 관리 전략', children: [] },
            { itemId: 10223, itemName: 'DX 기술 트렌드', depth: 1, learningObjectId: 102005, isFolder: false, displayName: null, description: 'AI, 클라우드, 데이터', children: [] },
          ],
        },
      ],
      // 반도체 공정 이해
      103: [
        {
          itemId: 10301,
          itemName: '1. 반도체 기초',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '반도체 기초',
          description: '반도체의 기본 원리',
          children: [
            { itemId: 10311, itemName: '반도체란?', depth: 1, learningObjectId: 103001, isFolder: false, displayName: null, description: '반도체 기본 개념', children: [] },
            { itemId: 10312, itemName: '반도체 종류', depth: 1, learningObjectId: 103002, isFolder: false, displayName: null, description: '메모리, 비메모리', children: [] },
            { itemId: 10313, itemName: '반도체 산업 동향', depth: 1, learningObjectId: 103003, isFolder: false, displayName: null, description: '글로벌 시장 분석', children: [] },
          ],
        },
        {
          itemId: 10302,
          itemName: '2. 반도체 공정',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '반도체 공정',
          description: '제조 공정 이해',
          children: [
            { itemId: 10321, itemName: '웨이퍼 제조', depth: 1, learningObjectId: 103004, isFolder: false, displayName: null, description: '웨이퍼 생산 과정', children: [] },
            { itemId: 10322, itemName: '포토리소그래피', depth: 1, learningObjectId: 103005, isFolder: false, displayName: null, description: '노광 공정', children: [] },
            { itemId: 10323, itemName: '에칭과 증착', depth: 1, learningObjectId: 103006, isFolder: false, displayName: null, description: '식각 및 증착 공정', children: [] },
            { itemId: 10324, itemName: '패키징', depth: 1, learningObjectId: 103007, isFolder: false, displayName: null, description: '후공정 이해', children: [] },
          ],
        },
      ],
      // 글로벌 비즈니스 커뮤니케이션
      104: [
        {
          itemId: 10401,
          itemName: '1. 비즈니스 영어',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '비즈니스 영어',
          description: '업무용 영어 커뮤니케이션',
          children: [
            { itemId: 10411, itemName: '이메일 작성법', depth: 1, learningObjectId: 104001, isFolder: false, displayName: null, description: '효과적인 영문 이메일', children: [] },
            { itemId: 10412, itemName: '회의 영어', depth: 1, learningObjectId: 104002, isFolder: false, displayName: null, description: '미팅 진행 표현', children: [] },
          ],
        },
        {
          itemId: 10402,
          itemName: '2. 프레젠테이션',
          depth: 0,
          learningObjectId: null,
          isFolder: true,
          displayName: '프레젠테이션',
          description: '효과적인 발표 기술',
          children: [
            { itemId: 10421, itemName: '발표 구조화', depth: 1, learningObjectId: 104003, isFolder: false, displayName: null, description: '논리적 발표 구성', children: [] },
            { itemId: 10422, itemName: '시각 자료 활용', depth: 1, learningObjectId: 104004, isFolder: false, displayName: null, description: '효과적인 슬라이드', children: [] },
            { itemId: 10423, itemName: 'Q&A 대응', depth: 1, learningObjectId: 104005, isFolder: false, displayName: null, description: '질의응답 전략', children: [] },
          ],
        },
      ],
    };

    const curriculum = curriculumMap[courseId] || [];
    return HttpResponse.json(apiResponse(curriculum));
  }),

  // ========== Course Times ==========
  http.get('/api/times', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const courseIdParam = url.searchParams.get('courseId');
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;

    // courseId가 제공된 경우 해당 과정의 차수만 필터링
    let filteredTimes = mockCourseTimes;
    if (courseIdParam) {
      const courseId = Number(courseIdParam);
      filteredTimes = mockCourseTimes.filter(time => time.program?.id === courseId);
    }

    // CourseTimeResponse 형식으로 변환 (courseTitle, instructors 변환)
    const transformedTimes = filteredTimes.map(time => ({
      ...time,
      courseTitle: time.program?.title ?? null,
      instructors: time.instructors?.map(instructor => ({
        ...instructor,
        userName: instructor.name,
        status: 'ACTIVE' as const,
      })) ?? [],
    }));

    return HttpResponse.json(apiResponse(paginatedResponse(transformedTimes, page, size)));
  }),

  http.get('/api/times/:id', async ({ params }) => {
    await delay(30);
    const time = mockCourseTimes.find(t => t.id === Number(params.id));
    if (!time) {
      return HttpResponse.json(
        errorResponse('차수를 찾을 수 없습니다.', 'COURSE_TIME_NOT_FOUND'),
        { status: 404 }
      );
    }
    // CourseTimeResponse 형식으로 반환 (상세 페이지용)
    return HttpResponse.json(apiResponse({
      id: time.id,
      title: time.title,
      status: time.status,
      programId: time.program?.id ?? null,
      programName: time.program?.title ?? null,
      courseId: time.program?.id ?? null,
      courseTitle: time.program?.title ?? null,
      courseThumbnailUrl: time.program?.thumbnailUrl ?? null,
      courseDescription: time.program?.description ?? null,
      courseCategory: time.program?.categoryName ?? null,
      courseDifficulty: time.program?.level ?? null,
      deliveryType: time.deliveryType,
      enrollmentMethod: time.enrollmentMethod,
      locationInfo: null,
      capacity: time.capacity,
      currentEnrollment: time.currentEnrollment,
      availableSeats: time.availableSeats,
      price: time.price,
      isFree: time.isFree,
      enrollStartDate: time.enrollStartDate,
      enrollEndDate: time.enrollEndDate,
      classStartDate: time.classStartDate,
      classEndDate: time.classEndDate,
      durationType: 'FIXED',
      durationDays: null,
      allowLateEnrollment: false,
      minProgressForCompletion: 80,
      recurringSchedule: null,
      instructors: time.instructors?.map(instructor => ({
        id: instructor.id,
        userName: instructor.name,
        userEmail: `instructor${instructor.id}@demo.com`,
        role: instructor.role,
        status: 'ACTIVE',
        profileImageUrl: instructor.profileImageUrl,
      })) ?? [],
      snapshotId: time.id,
      createdAt: '2026-01-15T09:00:00',
      description: null,
    }));
  }),

  // ========== Course Reviews ==========
  // 강의별 수강평 데이터
  // courseTimeId별 리뷰 데이터
  // 리뷰 통계 (stats 먼저 - 정적 경로)
  http.get('/api/times/:timeId/reviews/stats', async ({ params }) => {
    await delay(30);
    const timeId = Number(params.timeId);

    // 강의별 통계 데이터 (실제 리뷰 개수와 일치)
    // 1: 6개 리뷰 (5,5,5,4,5,4) 평균 4.7
    // 2: 5개 리뷰 (5,4,4,5,3) 평균 4.2
    // 3: 6개 리뷰 (5,5,4,4,5,4) 평균 4.5
    // 4: 4개 리뷰 (4,4,5,3) 평균 4.0
    // 5: 5개 리뷰 (5,5,5,4,5) 평균 4.8
    const statsMap: Record<number, { averageRating: number; totalReviews: number; ratingDistribution: Record<number, number> }> = {
      // React 기초부터 실전까지 - 2024년 1기
      1: {
        averageRating: 4.7,
        totalReviews: 6,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 4 },
      },
      // TypeScript 마스터 클래스 - 2024년 1기
      2: {
        averageRating: 4.2,
        totalReviews: 5,
        ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 },
      },
      // AWS 클라우드 입문 - 2024년 2기
      3: {
        averageRating: 4.5,
        totalReviews: 6,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 3 },
      },
      // Python 데이터 분석 - 무료 체험반
      4: {
        averageRating: 4.0,
        totalReviews: 4,
        ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 1 },
      },
      // Next.js 실전 프로젝트
      5: {
        averageRating: 4.8,
        totalReviews: 5,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 4 },
      },
    };

    const stats = statsMap[timeId] || {
      averageRating: 4.3,
      totalReviews: 3,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 1 },
    };

    return HttpResponse.json(apiResponse(stats));
  }),

  // 내 리뷰 조회 (my 먼저 - 정적 경로)
  http.get('/api/times/:timeId/reviews/my', async ({ params }) => {
    await delay(30);
    const timeId = Number(params.timeId);

    // timeId 3 (AWS 클라우드 입문)에서만 사용자가 리뷰를 작성한 것으로 설정
    if (timeId === 3) {
      return HttpResponse.json(apiResponse({
        reviewId: 999,
        courseTimeId: 3,
        userId: 14,
        userName: '정학습',
        userProfileImageUrl: null,
        rating: 5,
        content: 'AWS 기초 개념을 탄탄하게 잡을 수 있었습니다. 실습 환경도 잘 구성되어 있어서 따라하기 쉬웠어요. 덕분에 자격증 준비도 수월하게 할 수 있을 것 같습니다!',
        completionRate: 100,
        createdAt: '2026-01-25T16:30:00',
        updatedAt: '2026-01-25T16:30:00',
        isMyReview: true,
      }));
    }

    return HttpResponse.json(apiResponse(null));
  }),

  // 리뷰 목록 조회
  http.get('/api/times/:timeId/reviews', async ({ params, request }) => {
    await delay(50);
    const timeId = Number(params.timeId);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;

    // 강의별 리뷰 데이터
    const reviewsMap: Record<number, Array<{
      reviewId: number;
      courseTimeId: number;
      userId: number;
      userName: string;
      userProfileImageUrl: string | null;
      rating: number;
      content: string;
      completionRate: number;
      createdAt: string;
      updatedAt: string;
      isMyReview: boolean;
    }>> = {
      // React 기초부터 실전까지 - 2024년 1기
      1: [
        { reviewId: 101, courseTimeId: 1, userId: 15, userName: '김개발', userProfileImageUrl: null, rating: 5, content: '정말 체계적인 커리큘럼이었습니다. React의 기초부터 실전까지 꼼꼼하게 배울 수 있었어요. 특히 실습 예제가 실무에 바로 적용할 수 있을 정도로 실용적이었습니다.', completionRate: 100, createdAt: '2026-01-28T10:00:00', updatedAt: '2026-01-28T10:00:00', isMyReview: false },
        { reviewId: 102, courseTimeId: 1, userId: 16, userName: '이학습', userProfileImageUrl: null, rating: 5, content: 'hooks 부분이 특히 좋았습니다. useState, useEffect, useContext 등 실제로 많이 쓰이는 훅들을 깊이 있게 다뤄줘서 좋았어요.', completionRate: 100, createdAt: '2026-01-27T14:30:00', updatedAt: '2026-01-27T14:30:00', isMyReview: false },
        { reviewId: 103, courseTimeId: 1, userId: 17, userName: '박코딩', userProfileImageUrl: null, rating: 5, content: '비전공자인데도 쉽게 따라갈 수 있었습니다. 강사님의 설명이 정말 친절하고 이해하기 쉬워요. 강력 추천합니다!', completionRate: 85, createdAt: '2026-01-26T09:15:00', updatedAt: '2026-01-26T09:15:00', isMyReview: false },
        { reviewId: 104, courseTimeId: 1, userId: 18, userName: '최프론트', userProfileImageUrl: null, rating: 4, content: '전반적으로 만족스러운 강의였습니다. 다만 조금 더 심화 내용이 포함되면 좋겠어요. 기초를 다지기에는 최고의 강의입니다!', completionRate: 100, createdAt: '2026-01-25T16:00:00', updatedAt: '2026-01-25T16:00:00', isMyReview: false },
        { reviewId: 105, courseTimeId: 1, userId: 19, userName: '정리액트', userProfileImageUrl: null, rating: 5, content: '회사에서 React 프로젝트를 맡게 되어 급하게 들었는데, 덕분에 무사히 프로젝트를 완수할 수 있었습니다.', completionRate: 100, createdAt: '2026-01-24T11:20:00', updatedAt: '2026-01-24T11:20:00', isMyReview: false },
        { reviewId: 106, courseTimeId: 1, userId: 20, userName: '한개발자', userProfileImageUrl: null, rating: 4, content: '기초 강의로는 완벽합니다. 다음에 심화 과정도 수강할 예정이에요.', completionRate: 100, createdAt: '2026-01-23T13:45:00', updatedAt: '2026-01-23T13:45:00', isMyReview: false },
      ],
      // TypeScript 마스터 클래스 - 2024년 1기
      2: [
        { reviewId: 201, courseTimeId: 2, userId: 21, userName: '타입왕', userProfileImageUrl: null, rating: 5, content: '제네릭 부분이 정말 명확하게 설명되어 있어서 좋았습니다. 그동안 애매하게 알고 있던 개념들이 확실하게 정리되었어요.', completionRate: 100, createdAt: '2026-01-29T11:00:00', updatedAt: '2026-01-29T11:00:00', isMyReview: false },
        { reviewId: 202, courseTimeId: 2, userId: 22, userName: '스크립터', userProfileImageUrl: null, rating: 4, content: '타입 시스템에 대한 이해도가 확 올라갔습니다. 다만 실습 프로젝트가 좀 더 다양했으면 좋겠어요.', completionRate: 90, createdAt: '2026-01-28T15:30:00', updatedAt: '2026-01-28T15:30:00', isMyReview: false },
        { reviewId: 203, courseTimeId: 2, userId: 23, userName: '코드장인', userProfileImageUrl: null, rating: 4, content: '유틸리티 타입 챕터가 특히 유용했습니다. 실무에서 바로 활용하고 있어요.', completionRate: 100, createdAt: '2026-01-27T09:00:00', updatedAt: '2026-01-27T09:00:00', isMyReview: false },
        { reviewId: 204, courseTimeId: 2, userId: 15, userName: '김개발', userProfileImageUrl: null, rating: 5, content: 'any 타입 지옥에서 벗어날 수 있게 해준 강의입니다. 이제 타입 에러가 두렵지 않아요!', completionRate: 100, createdAt: '2026-01-26T14:20:00', updatedAt: '2026-01-26T14:20:00', isMyReview: false },
        { reviewId: 205, courseTimeId: 2, userId: 16, userName: '이학습', userProfileImageUrl: null, rating: 3, content: '내용은 좋지만 진도가 너무 빨라서 따라가기 힘들었어요. 기초 강의를 먼저 듣고 오시는 걸 추천합니다.', completionRate: 75, createdAt: '2026-01-25T10:00:00', updatedAt: '2026-01-25T10:00:00', isMyReview: false },
      ],
      // AWS 클라우드 입문 - 2024년 2기
      3: [
        { reviewId: 301, courseTimeId: 3, userId: 24, userName: '클라우드러버', userProfileImageUrl: null, rating: 5, content: 'AWS 서비스들의 관계와 사용 시나리오가 명확하게 정리되어 있어요. 자격증 준비에도 큰 도움이 됩니다!', completionRate: 100, createdAt: '2026-01-30T10:00:00', updatedAt: '2026-01-30T10:00:00', isMyReview: false },
        { reviewId: 302, courseTimeId: 3, userId: 25, userName: '서버리스맨', userProfileImageUrl: null, rating: 5, content: 'EC2, S3, RDS 실습이 특히 좋았습니다. 실제 환경에서 직접 구축해보니 이해가 확 되더라고요.', completionRate: 100, createdAt: '2026-01-29T16:30:00', updatedAt: '2026-01-29T16:30:00', isMyReview: false },
        { reviewId: 303, courseTimeId: 3, userId: 26, userName: '데브옵스초보', userProfileImageUrl: null, rating: 4, content: '입문자에게 딱 맞는 난이도입니다. Lambda와 API Gateway 부분이 특히 실용적이었어요.', completionRate: 95, createdAt: '2026-01-28T11:20:00', updatedAt: '2026-01-28T11:20:00', isMyReview: false },
        { reviewId: 304, courseTimeId: 3, userId: 17, userName: '박코딩', userProfileImageUrl: null, rating: 4, content: '비용 최적화 파트가 실무에서 정말 유용합니다. 회사에서 바로 적용해봤어요.', completionRate: 100, createdAt: '2026-01-27T09:45:00', updatedAt: '2026-01-27T09:45:00', isMyReview: false },
        { reviewId: 305, courseTimeId: 3, userId: 27, userName: '인프라지망생', userProfileImageUrl: null, rating: 5, content: 'VPC 네트워크 구성 부분이 가장 도움이 많이 되었습니다. 그림과 함께 설명해주셔서 이해하기 쉬웠어요.', completionRate: 100, createdAt: '2026-01-26T14:00:00', updatedAt: '2026-01-26T14:00:00', isMyReview: false },
        { reviewId: 306, courseTimeId: 3, userId: 28, userName: '클라우드뉴비', userProfileImageUrl: null, rating: 4, content: 'SAA 자격증 취득에 많은 도움이 되었습니다. 감사합니다!', completionRate: 100, createdAt: '2026-01-25T08:30:00', updatedAt: '2026-01-25T08:30:00', isMyReview: false },
      ],
      // Python 데이터 분석 - 무료 체험반
      4: [
        { reviewId: 401, courseTimeId: 4, userId: 29, userName: '데이터사이언티스트', userProfileImageUrl: null, rating: 4, content: 'pandas와 numpy 기초를 잡기 좋은 강의입니다. 실습 데이터셋도 현실적이에요.', completionRate: 100, createdAt: '2026-01-28T13:00:00', updatedAt: '2026-01-28T13:00:00', isMyReview: false },
        { reviewId: 402, courseTimeId: 4, userId: 30, userName: '분석초보', userProfileImageUrl: null, rating: 4, content: '무료 체험인데도 내용이 알찹니다. 정규 과정도 수강할 예정이에요.', completionRate: 80, createdAt: '2026-01-27T16:45:00', updatedAt: '2026-01-27T16:45:00', isMyReview: false },
        { reviewId: 403, courseTimeId: 4, userId: 31, userName: '파이썬러버', userProfileImageUrl: null, rating: 5, content: '시각화 부분이 특히 좋았어요. matplotlib, seaborn 사용법을 제대로 배웠습니다.', completionRate: 100, createdAt: '2026-01-26T10:30:00', updatedAt: '2026-01-26T10:30:00', isMyReview: false },
        { reviewId: 404, courseTimeId: 4, userId: 32, userName: '엑셀탈출러', userProfileImageUrl: null, rating: 3, content: '엑셀에서 파이썬으로 넘어가려는 분들께 추천합니다. 다만 속도가 조금 느린 편이에요.', completionRate: 65, createdAt: '2026-01-25T14:15:00', updatedAt: '2026-01-25T14:15:00', isMyReview: false },
      ],
      // Next.js 실전 프로젝트
      5: [
        { reviewId: 501, courseTimeId: 5, userId: 33, userName: '풀스택지망', userProfileImageUrl: null, rating: 5, content: 'App Router 기반의 최신 Next.js를 제대로 배울 수 있었습니다. Server Actions까지 다뤄줘서 정말 좋았어요!', completionRate: 100, createdAt: '2026-01-29T09:00:00', updatedAt: '2026-01-29T09:00:00', isMyReview: false },
        { reviewId: 502, courseTimeId: 5, userId: 34, userName: '리액트마스터', userProfileImageUrl: null, rating: 5, content: 'React를 어느 정도 아는 상태에서 들으면 정말 좋습니다. SSR/SSG 개념이 확실히 잡혔어요.', completionRate: 100, createdAt: '2026-01-28T14:30:00', updatedAt: '2026-01-28T14:30:00', isMyReview: false },
        { reviewId: 503, courseTimeId: 5, userId: 35, userName: '프론트엔드장인', userProfileImageUrl: null, rating: 5, content: '실전 프로젝트 중심이라 포트폴리오에 바로 넣을 수 있어요. 강력 추천합니다!', completionRate: 95, createdAt: '2026-01-27T11:20:00', updatedAt: '2026-01-27T11:20:00', isMyReview: false },
        { reviewId: 504, courseTimeId: 5, userId: 15, userName: '김개발', userProfileImageUrl: null, rating: 4, content: '배포 파트가 특히 유용했습니다. Vercel 배포부터 도메인 연결까지 한번에 배웠네요.', completionRate: 100, createdAt: '2026-01-26T16:00:00', updatedAt: '2026-01-26T16:00:00', isMyReview: false },
        { reviewId: 505, courseTimeId: 5, userId: 36, userName: '웹개발러', userProfileImageUrl: null, rating: 5, content: 'ISR 개념이 명쾌하게 설명되어 있어서 좋았습니다. 블로그 만들기 프로젝트로 실습하니 이해가 잘 되더라고요.', completionRate: 100, createdAt: '2026-01-25T09:30:00', updatedAt: '2026-01-25T09:30:00', isMyReview: false },
      ],
    };

    const reviews = reviewsMap[timeId] || [
      { reviewId: 901, courseTimeId: timeId, userId: 15, userName: '김개발', userProfileImageUrl: null, rating: 4, content: '유익한 강의였습니다. 기초를 다지기에 좋아요.', completionRate: 100, createdAt: '2026-01-27T10:00:00', updatedAt: '2026-01-27T10:00:00', isMyReview: false },
      { reviewId: 902, courseTimeId: timeId, userId: 16, userName: '이학습', userProfileImageUrl: null, rating: 4, content: '설명이 친절해서 따라가기 쉬웠습니다.', completionRate: 90, createdAt: '2026-01-26T15:00:00', updatedAt: '2026-01-26T15:00:00', isMyReview: false },
      { reviewId: 903, courseTimeId: timeId, userId: 17, userName: '박코딩', userProfileImageUrl: null, rating: 5, content: '실습 예제가 실무에서 바로 쓸 수 있어서 좋았어요.', completionRate: 100, createdAt: '2026-01-25T11:00:00', updatedAt: '2026-01-25T11:00:00', isMyReview: false },
    ];

    const startIndex = page * size;
    const paginatedReviews = reviews.slice(startIndex, startIndex + size);

    // 평균 평점 계산
    const avgRating = reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 0;

    return HttpResponse.json(apiResponse({
      reviews: paginatedReviews,
      totalElements: reviews.length,
      totalPages: Math.ceil(reviews.length / size),
      currentPage: page,
      pageSize: size,
      averageRating: avgRating,
      reviewCount: reviews.length,
    }));
  }),

  // 리뷰 작성
  http.post('/api/times/:timeId/reviews', async ({ params, request }) => {
    await delay(50);
    const body = await request.json() as { rating: number; content: string };
    const newReview = {
      reviewId: 100,
      courseTimeId: Number(params.timeId),
      userId: 14,
      userName: '정학습',
      userProfileImageUrl: null,
      rating: body.rating,
      content: body.content,
      completionRate: 65,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMyReview: true,
    };
    return HttpResponse.json(apiResponse(newReview), { status: 201 });
  }),

  // 리뷰 수정
  http.patch('/api/times/:timeId/reviews/:reviewId', async ({ params, request }) => {
    await delay(50);
    const body = await request.json() as { rating: number; content: string };
    const updatedReview = {
      reviewId: Number(params.reviewId),
      courseTimeId: Number(params.timeId),
      userId: 14,
      userName: '정학습',
      userProfileImageUrl: null,
      rating: body.rating,
      content: body.content,
      completionRate: 65,
      createdAt: '2026-01-20T10:00:00',
      updatedAt: new Date().toISOString(),
      isMyReview: true,
    };
    return HttpResponse.json(apiResponse(updatedReview));
  }),

  // 리뷰 삭제
  http.delete('/api/times/:timeId/reviews/:reviewId', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse({ success: true }));
  }),

  // ========== Course Community (강의별 커뮤니티) ==========
  // 강의별 커뮤니티 게시글 목록
  http.get('/api/times/:timeId/community/posts', async ({ params, request }) => {
    await delay(50);
    const timeId = Number(params.timeId);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    // 강의별 커뮤니티 게시글 데이터
    const communityPostsMap: Record<number, Array<{
      id: number;
      courseTimeId: number;
      type: 'question' | 'discussion' | 'tip' | 'review' | 'announcement';
      title: string;
      content: string;
      excerpt: string;
      author: { id: number; name: string; avatar: string | null };
      category: string;
      tags: string[];
      viewCount: number;
      likeCount: number;
      commentCount: number;
      isLiked: boolean;
      isPinned: boolean;
      isSolved?: boolean;
      createdAt: string;
      updatedAt: string;
    }>> = {
      // React 기초부터 실전까지 - 2024년 1기
      1: [
        { id: 1001, courseTimeId: 1, type: 'question', title: 'useEffect 무한 루프 해결 방법', content: 'useEffect 안에서 state를 업데이트하면 무한 루프가 발생하는데 어떻게 해결할 수 있나요?', excerpt: 'useEffect 안에서 state를 업데이트하면 무한 루프가 발생하는데...', author: { id: 15, name: '김개발', avatar: null }, category: 'qna', tags: ['React', 'useEffect'], viewCount: 156, likeCount: 12, commentCount: 8, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-30T10:00:00', updatedAt: '2026-01-30T10:00:00' },
        { id: 1002, courseTimeId: 1, type: 'tip', title: 'useState 초기값 설정 팁', content: '복잡한 초기값은 함수로 전달하면 성능이 개선됩니다. useState(() => computeInitialValue())', excerpt: '복잡한 초기값은 함수로 전달하면 성능이 개선됩니다...', author: { id: 16, name: '이학습', avatar: null }, category: 'tip', tags: ['React', 'useState', '성능'], viewCount: 234, likeCount: 45, commentCount: 5, isLiked: true, isPinned: true, createdAt: '2026-01-29T14:30:00', updatedAt: '2026-01-29T14:30:00' },
        { id: 1003, courseTimeId: 1, type: 'discussion', title: '5주차 과제 같이 풀어보실 분!', content: '5주차 과제가 어려운데 같이 화면공유하면서 풀어보실 분 계신가요?', excerpt: '5주차 과제가 어려운데 같이 화면공유하면서 풀어보실 분...', author: { id: 17, name: '박코딩', avatar: null }, category: 'study', tags: ['스터디', '과제'], viewCount: 89, likeCount: 8, commentCount: 12, isLiked: false, isPinned: false, createdAt: '2026-01-28T09:00:00', updatedAt: '2026-01-28T09:00:00' },
        { id: 1004, courseTimeId: 1, type: 'question', title: 'props drilling 해결법이 궁금합니다', content: '컴포넌트 depth가 깊어지면서 props를 계속 내려주는 게 불편한데 좋은 방법이 있을까요?', excerpt: '컴포넌트 depth가 깊어지면서 props를 계속 내려주는 게...', author: { id: 18, name: '최프론트', avatar: null }, category: 'qna', tags: ['React', 'Context', 'props'], viewCount: 198, likeCount: 23, commentCount: 15, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-27T16:00:00', updatedAt: '2026-01-27T16:00:00' },
        { id: 1005, courseTimeId: 1, type: 'tip', title: 'React DevTools 활용 꿀팁', content: 'React DevTools의 Profiler 기능을 활용하면 렌더링 성능을 쉽게 분석할 수 있습니다.', excerpt: 'React DevTools의 Profiler 기능을 활용하면...', author: { id: 14, name: '정학습', avatar: null }, category: 'tip', tags: ['React', 'DevTools', '디버깅'], viewCount: 312, likeCount: 56, commentCount: 7, isLiked: true, isPinned: false, createdAt: '2026-01-26T11:00:00', updatedAt: '2026-01-26T11:00:00' },
      ],
      // TypeScript 마스터 클래스 - 2024년 1기
      2: [
        { id: 2001, courseTimeId: 2, type: 'question', title: '제네릭 타입 추론이 안되는 경우', content: '함수에서 제네릭을 사용했는데 타입이 자동으로 추론이 안됩니다. 어떻게 해야 하나요?', excerpt: '함수에서 제네릭을 사용했는데 타입이 자동으로 추론이...', author: { id: 21, name: '타입왕', avatar: null }, category: 'qna', tags: ['TypeScript', '제네릭'], viewCount: 145, likeCount: 18, commentCount: 11, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-30T11:00:00', updatedAt: '2026-01-30T11:00:00' },
        { id: 2002, courseTimeId: 2, type: 'tip', title: 'Utility Types 정리', content: 'Partial, Required, Pick, Omit 등 자주 사용하는 유틸리티 타입을 정리해봤습니다.', excerpt: 'Partial, Required, Pick, Omit 등 자주 사용하는...', author: { id: 22, name: '스크립터', avatar: null }, category: 'tip', tags: ['TypeScript', 'UtilityTypes'], viewCount: 456, likeCount: 89, commentCount: 14, isLiked: true, isPinned: true, createdAt: '2026-01-29T09:30:00', updatedAt: '2026-01-29T09:30:00' },
        { id: 2003, courseTimeId: 2, type: 'discussion', title: 'any vs unknown 언제 사용해야 할까요?', content: 'any와 unknown의 차이는 알겠는데, 실무에서 unknown을 언제 사용해야 하는지 궁금합니다.', excerpt: 'any와 unknown의 차이는 알겠는데, 실무에서...', author: { id: 15, name: '김개발', avatar: null }, category: 'discussion', tags: ['TypeScript', 'any', 'unknown'], viewCount: 234, likeCount: 34, commentCount: 23, isLiked: false, isPinned: false, createdAt: '2026-01-28T14:00:00', updatedAt: '2026-01-28T14:00:00' },
        { id: 2004, courseTimeId: 2, type: 'question', title: 'tsconfig strict 모드 관련 질문', content: 'strict 모드를 켜면 에러가 너무 많이 나는데, 하나씩 켜는 게 좋을까요?', excerpt: 'strict 모드를 켜면 에러가 너무 많이 나는데...', author: { id: 23, name: '코드장인', avatar: null }, category: 'qna', tags: ['TypeScript', 'tsconfig'], viewCount: 167, likeCount: 21, commentCount: 9, isLiked: false, isPinned: false, isSolved: false, createdAt: '2026-01-27T10:00:00', updatedAt: '2026-01-27T10:00:00' },
      ],
      // AWS 클라우드 입문 - 2024년 2기
      3: [
        { id: 3001, courseTimeId: 3, type: 'question', title: 'EC2 인스턴스 SSH 접속 오류', content: 'EC2 인스턴스에 SSH 접속이 안되는데 보안그룹 설정은 맞는 것 같습니다. 확인해볼 부분이 있을까요?', excerpt: 'EC2 인스턴스에 SSH 접속이 안되는데 보안그룹 설정은...', author: { id: 24, name: '클라우드러버', avatar: null }, category: 'qna', tags: ['AWS', 'EC2', 'SSH'], viewCount: 189, likeCount: 15, commentCount: 12, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-30T09:00:00', updatedAt: '2026-01-30T09:00:00' },
        { id: 3002, courseTimeId: 3, type: 'tip', title: 'AWS 프리티어 비용 절약 팁', content: '프리티어 사용 시 예상치 못한 비용이 발생하지 않도록 알람 설정하는 방법을 공유합니다.', excerpt: '프리티어 사용 시 예상치 못한 비용이 발생하지 않도록...', author: { id: 25, name: '서버리스맨', avatar: null }, category: 'tip', tags: ['AWS', '프리티어', '비용'], viewCount: 567, likeCount: 123, commentCount: 18, isLiked: true, isPinned: true, createdAt: '2026-01-29T15:00:00', updatedAt: '2026-01-29T15:00:00' },
        { id: 3003, courseTimeId: 3, type: 'discussion', title: 'SAA 자격증 스터디 모집', content: 'AWS Solutions Architect Associate 자격증 준비하시는 분들 같이 스터디 하실래요?', excerpt: 'AWS Solutions Architect Associate 자격증 준비하시는 분들...', author: { id: 14, name: '정학습', avatar: null }, category: 'study', tags: ['AWS', '자격증', 'SAA'], viewCount: 234, likeCount: 45, commentCount: 28, isLiked: false, isPinned: false, createdAt: '2026-01-28T11:00:00', updatedAt: '2026-01-28T11:00:00' },
        { id: 3004, courseTimeId: 3, type: 'question', title: 'S3 버킷 정책 설정 문의', content: '특정 IP에서만 S3 버킷에 접근하도록 설정하고 싶은데 버킷 정책 예시 있을까요?', excerpt: '특정 IP에서만 S3 버킷에 접근하도록 설정하고 싶은데...', author: { id: 26, name: '데브옵스초보', avatar: null }, category: 'qna', tags: ['AWS', 'S3', '보안'], viewCount: 145, likeCount: 12, commentCount: 7, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-27T14:30:00', updatedAt: '2026-01-27T14:30:00' },
        { id: 3005, courseTimeId: 3, type: 'tip', title: 'Lambda 콜드 스타트 줄이는 방법', content: 'Provisioned Concurrency 외에 콜드 스타트를 줄이는 실용적인 방법들을 정리했습니다.', excerpt: 'Provisioned Concurrency 외에 콜드 스타트를 줄이는...', author: { id: 17, name: '박코딩', avatar: null }, category: 'tip', tags: ['AWS', 'Lambda', '성능'], viewCount: 378, likeCount: 67, commentCount: 11, isLiked: true, isPinned: false, createdAt: '2026-01-26T10:00:00', updatedAt: '2026-01-26T10:00:00' },
      ],
      // Python 데이터 분석 - 무료 체험반
      4: [
        { id: 4001, courseTimeId: 4, type: 'question', title: 'pandas DataFrame merge 관련 질문', content: 'left join과 inner join의 차이가 헷갈립니다. 예시와 함께 설명해주실 수 있나요?', excerpt: 'left join과 inner join의 차이가 헷갈립니다...', author: { id: 29, name: '데이터사이언티스트', avatar: null }, category: 'qna', tags: ['Python', 'pandas', 'merge'], viewCount: 123, likeCount: 8, commentCount: 6, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-29T10:00:00', updatedAt: '2026-01-29T10:00:00' },
        { id: 4002, courseTimeId: 4, type: 'tip', title: 'matplotlib 한글 깨짐 해결법', content: 'matplotlib에서 한글이 깨질 때 폰트 설정하는 방법을 공유합니다.', excerpt: 'matplotlib에서 한글이 깨질 때 폰트 설정하는 방법을...', author: { id: 30, name: '분석초보', avatar: null }, category: 'tip', tags: ['Python', 'matplotlib', '한글'], viewCount: 345, likeCount: 56, commentCount: 9, isLiked: true, isPinned: true, createdAt: '2026-01-28T14:00:00', updatedAt: '2026-01-28T14:00:00' },
        { id: 4003, courseTimeId: 4, type: 'discussion', title: '데이터 분석 실무에서 많이 쓰는 라이브러리', content: '실무에서 pandas, numpy 외에 어떤 라이브러리를 많이 사용하시나요?', excerpt: '실무에서 pandas, numpy 외에 어떤 라이브러리를...', author: { id: 31, name: '파이썬러버', avatar: null }, category: 'discussion', tags: ['Python', '라이브러리', '실무'], viewCount: 198, likeCount: 23, commentCount: 15, isLiked: false, isPinned: false, createdAt: '2026-01-27T09:00:00', updatedAt: '2026-01-27T09:00:00' },
      ],
      // Next.js 실전 프로젝트
      5: [
        { id: 5001, courseTimeId: 5, type: 'question', title: 'App Router에서 loading.tsx가 안보여요', content: 'loading.tsx 파일을 만들었는데 로딩 UI가 안보입니다. 뭐가 문제일까요?', excerpt: 'loading.tsx 파일을 만들었는데 로딩 UI가 안보입니다...', author: { id: 33, name: '풀스택지망', avatar: null }, category: 'qna', tags: ['Next.js', 'AppRouter', 'loading'], viewCount: 167, likeCount: 14, commentCount: 9, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-30T10:30:00', updatedAt: '2026-01-30T10:30:00' },
        { id: 5002, courseTimeId: 5, type: 'tip', title: 'Server Actions 실전 패턴', content: 'Server Actions를 폼 처리에 활용하는 실전 패턴을 정리했습니다.', excerpt: 'Server Actions를 폼 처리에 활용하는 실전 패턴을...', author: { id: 34, name: '리액트마스터', avatar: null }, category: 'tip', tags: ['Next.js', 'ServerActions', '폼'], viewCount: 456, likeCount: 89, commentCount: 12, isLiked: true, isPinned: true, createdAt: '2026-01-29T11:00:00', updatedAt: '2026-01-29T11:00:00' },
        { id: 5003, courseTimeId: 5, type: 'discussion', title: 'Vercel vs AWS 어디에 배포하시나요?', content: '개인 프로젝트 배포할 때 Vercel과 AWS 중 어디를 선호하시나요?', excerpt: '개인 프로젝트 배포할 때 Vercel과 AWS 중 어디를...', author: { id: 35, name: '프론트엔드장인', avatar: null }, category: 'discussion', tags: ['Next.js', '배포', 'Vercel', 'AWS'], viewCount: 289, likeCount: 34, commentCount: 28, isLiked: false, isPinned: false, createdAt: '2026-01-28T15:00:00', updatedAt: '2026-01-28T15:00:00' },
        { id: 5004, courseTimeId: 5, type: 'question', title: 'ISR revalidate 시간 설정 기준', content: 'ISR에서 revalidate 시간을 어떤 기준으로 설정하시나요? 콘텐츠 유형별로 권장 값이 있을까요?', excerpt: 'ISR에서 revalidate 시간을 어떤 기준으로 설정하시나요...', author: { id: 15, name: '김개발', avatar: null }, category: 'qna', tags: ['Next.js', 'ISR', '캐싱'], viewCount: 198, likeCount: 21, commentCount: 11, isLiked: false, isPinned: false, isSolved: false, createdAt: '2026-01-27T10:00:00', updatedAt: '2026-01-27T10:00:00' },
        { id: 5005, courseTimeId: 5, type: 'tip', title: 'Next.js + Prisma 연동 가이드', content: 'Next.js 프로젝트에서 Prisma ORM을 설정하고 사용하는 방법을 정리했습니다.', excerpt: 'Next.js 프로젝트에서 Prisma ORM을 설정하고 사용하는...', author: { id: 36, name: '웹개발러', avatar: null }, category: 'tip', tags: ['Next.js', 'Prisma', 'ORM'], viewCount: 345, likeCount: 67, commentCount: 8, isLiked: true, isPinned: false, createdAt: '2026-01-26T14:00:00', updatedAt: '2026-01-26T14:00:00' },
      ],
    };

    const posts = communityPostsMap[timeId] || [
      { id: 9001, courseTimeId: timeId, type: 'question' as const, title: '강의 관련 질문입니다', content: '이 부분이 이해가 안되는데 설명 부탁드립니다.', excerpt: '이 부분이 이해가 안되는데...', author: { id: 15, name: '김개발', avatar: null }, category: 'qna', tags: ['질문'], viewCount: 45, likeCount: 3, commentCount: 2, isLiked: false, isPinned: false, isSolved: false, createdAt: '2026-01-28T10:00:00', updatedAt: '2026-01-28T10:00:00' },
      { id: 9002, courseTimeId: timeId, type: 'tip' as const, title: '강의 수강 팁 공유', content: '이렇게 하면 더 효율적으로 학습할 수 있어요.', excerpt: '이렇게 하면 더 효율적으로 학습할 수...', author: { id: 16, name: '이학습', avatar: null }, category: 'tip', tags: ['팁'], viewCount: 78, likeCount: 12, commentCount: 4, isLiked: true, isPinned: false, createdAt: '2026-01-27T14:00:00', updatedAt: '2026-01-27T14:00:00' },
    ];

    const startIndex = page * pageSize;
    const paginatedPosts = posts.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json(apiResponse({
      posts: paginatedPosts,
      totalCount: posts.length,
      page,
      pageSize,
      totalPages: Math.ceil(posts.length / pageSize),
    }));
  }),

  // 강의별 커뮤니티 게시글 상세
  http.get('/api/times/:timeId/community/posts/:postId', async ({ params }) => {
    await delay(30);
    const postId = Number(params.postId);
    const timeId = Number(params.timeId);

    // 게시글 상세 데이터 (목록과 동일한 데이터 + 전체 content)
    const postDetailMap: Record<number, {
      id: number;
      courseTimeId: number;
      type: 'question' | 'discussion' | 'tip' | 'review' | 'announcement';
      title: string;
      content: string;
      author: { id: number; name: string; avatar: string | null };
      category: string;
      tags: string[];
      viewCount: number;
      likeCount: number;
      commentCount: number;
      isLiked: boolean;
      isPinned: boolean;
      isSolved?: boolean;
      createdAt: string;
      updatedAt: string;
    }> = {
      // React 기초 강의 커뮤니티
      1001: { id: 1001, courseTimeId: 1, type: 'question', title: 'useEffect 무한 루프 해결 방법', content: `useEffect 안에서 state를 업데이트하면 무한 루프가 발생하는데 어떻게 해결할 수 있나요?

예를 들어 아래 코드에서 무한 루프가 발생합니다:

\`\`\`jsx
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(count + 1);
}, [count]);
\`\`\`

의존성 배열을 비우면 되긴 하는데, 그러면 count 값을 제대로 사용할 수 없을 것 같아서요.
어떻게 해결해야 할까요?`, author: { id: 15, name: '김개발', avatar: null }, category: 'qna', tags: ['React', 'useEffect'], viewCount: 156, likeCount: 12, commentCount: 8, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-30T10:00:00', updatedAt: '2026-01-30T10:00:00' },
      1002: { id: 1002, courseTimeId: 1, type: 'tip', title: 'useState 초기값 설정 팁', content: `복잡한 초기값은 함수로 전달하면 성능이 개선됩니다!

## 일반적인 방식 (매 렌더링마다 실행)
\`\`\`jsx
const [items, setItems] = useState(expensiveComputation());
\`\`\`

## 권장 방식 (최초 렌더링에만 실행)
\`\`\`jsx
const [items, setItems] = useState(() => expensiveComputation());
\`\`\`

이렇게 하면 초기 렌더링 시에만 함수가 실행되어 성능이 개선됩니다.
특히 localStorage에서 데이터를 읽어올 때 유용해요!`, author: { id: 16, name: '이학습', avatar: null }, category: 'tip', tags: ['React', 'useState', '성능'], viewCount: 234, likeCount: 45, commentCount: 5, isLiked: true, isPinned: true, createdAt: '2026-01-29T14:30:00', updatedAt: '2026-01-29T14:30:00' },
      1003: { id: 1003, courseTimeId: 1, type: 'discussion', title: '5주차 과제 같이 풀어보실 분!', content: `5주차 과제가 어려운데 같이 화면공유하면서 풀어보실 분 계신가요?

## 과제 내용
- Todo 앱 만들기
- CRUD 기능 구현
- localStorage 연동

## 스터디 정보
- 일시: 이번 주 토요일 오후 2시
- 방식: 디스코드 화면공유
- 인원: 3~4명

관심 있으시면 댓글 남겨주세요!`, author: { id: 17, name: '박코딩', avatar: null }, category: 'study', tags: ['스터디', '과제'], viewCount: 89, likeCount: 8, commentCount: 12, isLiked: false, isPinned: false, createdAt: '2026-01-28T09:00:00', updatedAt: '2026-01-28T09:00:00' },
      1004: { id: 1004, courseTimeId: 1, type: 'question', title: 'props drilling 해결법이 궁금합니다', content: `컴포넌트 depth가 깊어지면서 props를 계속 내려주는 게 불편한데 좋은 방법이 있을까요?

현재 구조가 이런 식입니다:
App → Layout → Sidebar → Menu → MenuItem

MenuItem에서 App의 state를 사용하려면 모든 중간 컴포넌트에 props를 전달해야 해서 코드가 지저분해지네요.

Context API를 사용하면 된다고 들었는데, 언제 Context를 쓰고 언제 props를 써야 할지 기준이 궁금합니다.`, author: { id: 18, name: '최프론트', avatar: null }, category: 'qna', tags: ['React', 'Context', 'props'], viewCount: 198, likeCount: 23, commentCount: 15, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-27T16:00:00', updatedAt: '2026-01-27T16:00:00' },
      1005: { id: 1005, courseTimeId: 1, type: 'tip', title: 'React DevTools 활용 꿀팁', content: `React DevTools의 Profiler 기능을 활용하면 렌더링 성능을 쉽게 분석할 수 있습니다!

## Profiler 사용법
1. React DevTools 설치
2. Profiler 탭 선택
3. Record 버튼 클릭
4. 앱 조작
5. Stop 버튼 클릭

## 확인할 수 있는 정보
- 각 컴포넌트의 렌더링 시간
- 불필요한 리렌더링 발생 여부
- 렌더링 원인 (props 변경, state 변경 등)

특히 "Highlight updates when components render" 옵션을 켜면 어떤 컴포넌트가 리렌더링되는지 시각적으로 확인할 수 있어요!`, author: { id: 14, name: '정학습', avatar: null }, category: 'tip', tags: ['React', 'DevTools', '디버깅'], viewCount: 312, likeCount: 56, commentCount: 7, isLiked: true, isPinned: false, createdAt: '2026-01-26T11:00:00', updatedAt: '2026-01-26T11:00:00' },

      // TypeScript 마스터 클래스 커뮤니티
      2001: { id: 2001, courseTimeId: 2, type: 'question', title: '제네릭 타입 추론이 안되는 경우', content: `함수에서 제네릭을 사용했는데 타입이 자동으로 추론이 안됩니다.

\`\`\`typescript
function getValue<T>(obj: object, key: string): T {
  return obj[key];
}

const result = getValue(user, 'name'); // result가 unknown으로 추론됨
\`\`\`

T가 자동으로 string으로 추론되길 원하는데, 어떻게 해야 하나요?`, author: { id: 21, name: '타입왕', avatar: null }, category: 'qna', tags: ['TypeScript', '제네릭'], viewCount: 145, likeCount: 18, commentCount: 11, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-30T11:00:00', updatedAt: '2026-01-30T11:00:00' },
      2002: { id: 2002, courseTimeId: 2, type: 'tip', title: 'Utility Types 정리', content: `Partial, Required, Pick, Omit 등 자주 사용하는 유틸리티 타입을 정리해봤습니다.

## Partial<T>
모든 프로퍼티를 optional로 만듦
\`\`\`typescript
type PartialUser = Partial<User>; // { name?: string; age?: number; }
\`\`\`

## Required<T>
모든 프로퍼티를 required로 만듦

## Pick<T, K>
특정 프로퍼티만 선택
\`\`\`typescript
type UserName = Pick<User, 'name'>; // { name: string; }
\`\`\`

## Omit<T, K>
특정 프로퍼티 제외
\`\`\`typescript
type UserWithoutAge = Omit<User, 'age'>; // { name: string; }
\`\`\`

실무에서 정말 자주 사용하니 꼭 익혀두세요!`, author: { id: 22, name: '스크립터', avatar: null }, category: 'tip', tags: ['TypeScript', 'UtilityTypes'], viewCount: 456, likeCount: 89, commentCount: 14, isLiked: true, isPinned: true, createdAt: '2026-01-29T09:30:00', updatedAt: '2026-01-29T09:30:00' },
      2003: { id: 2003, courseTimeId: 2, type: 'discussion', title: 'any vs unknown 언제 사용해야 할까요?', content: `any와 unknown의 차이는 알겠는데, 실무에서 unknown을 언제 사용해야 하는지 궁금합니다.

## 제가 이해한 차이점
- any: 타입 체크 완전 무시
- unknown: 타입 체크는 하지만 사용 전 타입 좁히기 필요

## 궁금한 점
1. API 응답을 받을 때 unknown을 쓰면 매번 타입 가드를 해야 하는데, 번거롭지 않나요?
2. 실무에서 unknown을 적극적으로 사용하시나요?
3. any를 써야만 하는 상황이 있나요?

여러분의 경험을 공유해주세요!`, author: { id: 15, name: '김개발', avatar: null }, category: 'discussion', tags: ['TypeScript', 'any', 'unknown'], viewCount: 234, likeCount: 34, commentCount: 23, isLiked: false, isPinned: false, createdAt: '2026-01-28T14:00:00', updatedAt: '2026-01-28T14:00:00' },
      2004: { id: 2004, courseTimeId: 2, type: 'question', title: 'tsconfig strict 모드 관련 질문', content: `strict 모드를 켜면 에러가 너무 많이 나는데, 하나씩 켜는 게 좋을까요?

현재 레거시 프로젝트에 TypeScript를 도입하려고 하는데요.
strict: true로 설정하면 에러가 500개 넘게 나옵니다...

점진적으로 마이그레이션하려면 어떤 순서로 옵션을 켜는 게 좋을까요?

\`\`\`json
{
  "compilerOptions": {
    "strict": false, // 일단 false로 시작
    "noImplicitAny": true, // 이것부터?
    "strictNullChecks": true, // 아니면 이것부터?
  }
}
\`\`\``, author: { id: 23, name: '코드장인', avatar: null }, category: 'qna', tags: ['TypeScript', 'tsconfig'], viewCount: 167, likeCount: 21, commentCount: 9, isLiked: false, isPinned: false, isSolved: false, createdAt: '2026-01-27T10:00:00', updatedAt: '2026-01-27T10:00:00' },

      // AWS 클라우드 입문 커뮤니티
      3001: { id: 3001, courseTimeId: 3, type: 'question', title: 'EC2 인스턴스 SSH 접속 오류', content: `EC2 인스턴스에 SSH 접속이 안되는데 보안그룹 설정은 맞는 것 같습니다.

## 현재 상황
- 인바운드 규칙: SSH (22번 포트) - 0.0.0.0/0 허용
- 키 페어: 다운로드 받은 .pem 파일 사용

## 에러 메시지
\`\`\`
Permission denied (publickey).
\`\`\`

## 시도해본 것
- 보안그룹 규칙 확인 ✓
- 퍼블릭 IP 확인 ✓
- 인스턴스 상태 running 확인 ✓

혹시 확인해볼 부분이 더 있을까요?`, author: { id: 24, name: '클라우드러버', avatar: null }, category: 'qna', tags: ['AWS', 'EC2', 'SSH'], viewCount: 189, likeCount: 15, commentCount: 12, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-30T09:00:00', updatedAt: '2026-01-30T09:00:00' },
      3002: { id: 3002, courseTimeId: 3, type: 'tip', title: 'AWS 프리티어 비용 절약 팁', content: `프리티어 사용 시 예상치 못한 비용이 발생하지 않도록 알람 설정하는 방법을 공유합니다!

## 1. 예산 알림 설정
AWS Budgets에서 월 예산을 $0으로 설정하고 알림을 받으세요.

## 2. 프리티어 사용량 모니터링
Billing Dashboard → Free Tier에서 사용량 확인

## 3. 주의해야 할 서비스들
- **EBS**: EC2 중지해도 스토리지 비용 발생!
- **Elastic IP**: 사용 안 하면 비용 청구
- **NAT Gateway**: 프리티어 아님, 시간당 과금
- **RDS**: Multi-AZ 옵션 비활성화 확인

## 4. 꿀팁
실습 후 리소스는 꼭 삭제하세요. CloudFormation 사용하면 한번에 정리 가능!`, author: { id: 25, name: '서버리스맨', avatar: null }, category: 'tip', tags: ['AWS', '프리티어', '비용'], viewCount: 567, likeCount: 123, commentCount: 18, isLiked: true, isPinned: true, createdAt: '2026-01-29T15:00:00', updatedAt: '2026-01-29T15:00:00' },
      3003: { id: 3003, courseTimeId: 3, type: 'discussion', title: 'SAA 자격증 스터디 모집', content: `AWS Solutions Architect Associate 자격증 준비하시는 분들 같이 스터디 하실래요?

## 스터디 계획
- 기간: 4주 (2월 한 달)
- 방식: 주 2회 온라인 미팅
- 교재: 강의 내용 + Examtopics

## 진행 방식
1. 각자 해당 주차 범위 공부
2. 모의고사 풀이
3. 오답 토론

## 모집 인원
5명 (현재 2명)

관심 있으시면 댓글 남겨주세요!
오픈채팅방 링크 공유드릴게요.`, author: { id: 14, name: '정학습', avatar: null }, category: 'study', tags: ['AWS', '자격증', 'SAA'], viewCount: 234, likeCount: 45, commentCount: 28, isLiked: false, isPinned: false, createdAt: '2026-01-28T11:00:00', updatedAt: '2026-01-28T11:00:00' },

      // Python 데이터 분석 커뮤니티
      4001: { id: 4001, courseTimeId: 4, type: 'question', title: 'pandas DataFrame merge 관련 질문', content: `left join과 inner join의 차이가 헷갈립니다.

\`\`\`python
df1 = pd.DataFrame({'key': ['A', 'B', 'C'], 'value1': [1, 2, 3]})
df2 = pd.DataFrame({'key': ['A', 'B', 'D'], 'value2': [4, 5, 6]})

# 이 두 가지의 차이가 뭔가요?
pd.merge(df1, df2, on='key', how='left')
pd.merge(df1, df2, on='key', how='inner')
\`\`\`

예시와 함께 설명해주실 수 있나요?`, author: { id: 29, name: '데이터사이언티스트', avatar: null }, category: 'qna', tags: ['Python', 'pandas', 'merge'], viewCount: 123, likeCount: 8, commentCount: 6, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-29T10:00:00', updatedAt: '2026-01-29T10:00:00' },
      4002: { id: 4002, courseTimeId: 4, type: 'tip', title: 'matplotlib 한글 깨짐 해결법', content: `matplotlib에서 한글이 깨질 때 폰트 설정하는 방법을 공유합니다!

## Windows
\`\`\`python
import matplotlib.pyplot as plt
plt.rc('font', family='Malgun Gothic')
plt.rcParams['axes.unicode_minus'] = False
\`\`\`

## Mac
\`\`\`python
plt.rc('font', family='AppleGothic')
plt.rcParams['axes.unicode_minus'] = False
\`\`\`

## Colab
\`\`\`python
!apt-get install fonts-nanum
plt.rc('font', family='NanumGothic')
\`\`\`

이 코드를 노트북 상단에 한 번만 실행하면 됩니다!`, author: { id: 30, name: '분석초보', avatar: null }, category: 'tip', tags: ['Python', 'matplotlib', '한글'], viewCount: 345, likeCount: 56, commentCount: 9, isLiked: true, isPinned: true, createdAt: '2026-01-28T14:00:00', updatedAt: '2026-01-28T14:00:00' },

      // Next.js 실전 프로젝트 커뮤니티
      5001: { id: 5001, courseTimeId: 5, type: 'question', title: 'App Router에서 loading.tsx가 안보여요', content: `loading.tsx 파일을 만들었는데 로딩 UI가 안보입니다.

## 파일 구조
\`\`\`
app/
  dashboard/
    page.tsx
    loading.tsx
\`\`\`

## loading.tsx
\`\`\`tsx
export default function Loading() {
  return <div>로딩 중...</div>
}
\`\`\`

page.tsx에서 데이터를 fetch하는데, loading.tsx가 표시되지 않고 바로 페이지가 나타납니다.
뭐가 문제일까요?`, author: { id: 33, name: '풀스택지망', avatar: null }, category: 'qna', tags: ['Next.js', 'AppRouter', 'loading'], viewCount: 167, likeCount: 14, commentCount: 9, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-30T10:30:00', updatedAt: '2026-01-30T10:30:00' },
      5002: { id: 5002, courseTimeId: 5, type: 'tip', title: 'Server Actions 실전 패턴', content: `Server Actions를 폼 처리에 활용하는 실전 패턴을 정리했습니다!

## 기본 패턴
\`\`\`tsx
// actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  // DB 저장 로직
  revalidatePath('/posts');
}
\`\`\`

## 폼 컴포넌트
\`\`\`tsx
export function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
\`\`\`

## useFormStatus 활용
\`\`\`tsx
'use client'
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>
    {pending ? '저장 중...' : '저장'}
  </button>;
}
\`\`\`

JavaScript 없이도 폼이 동작하니 접근성도 좋아요!`, author: { id: 34, name: '리액트마스터', avatar: null }, category: 'tip', tags: ['Next.js', 'ServerActions', '폼'], viewCount: 456, likeCount: 89, commentCount: 12, isLiked: true, isPinned: true, createdAt: '2026-01-29T11:00:00', updatedAt: '2026-01-29T11:00:00' },
      5003: { id: 5003, courseTimeId: 5, type: 'discussion', title: 'Vercel vs AWS 어디에 배포하시나요?', content: `개인 프로젝트 배포할 때 Vercel과 AWS 중 어디를 선호하시나요?

## Vercel 장점
- Next.js와 완벽한 통합
- 간편한 배포 (Git push만 하면 자동 배포)
- 무료 티어가 넉넉함

## AWS 장점
- 더 많은 커스터마이징 가능
- 다른 AWS 서비스와 연동 쉬움
- 대규모 서비스에 적합

여러분은 어떤 것을 선호하시나요? 이유도 함께 공유해주세요!`, author: { id: 35, name: '프론트엔드장인', avatar: null }, category: 'discussion', tags: ['Next.js', '배포', 'Vercel', 'AWS'], viewCount: 289, likeCount: 34, commentCount: 28, isLiked: false, isPinned: false, createdAt: '2026-01-28T15:00:00', updatedAt: '2026-01-28T15:00:00' },
      5004: { id: 5004, courseTimeId: 5, type: 'question', title: 'ISR revalidate 시간 설정 기준', content: `ISR에서 revalidate 시간을 어떤 기준으로 설정하시나요?

\`\`\`tsx
export const revalidate = 60; // 60초마다 재생성
\`\`\`

콘텐츠 유형별로 권장 값이 있을까요?

예를 들어:
- 블로그 포스트: ?
- 상품 목록: ?
- 사용자 프로필: ?

실무에서 어떻게 설정하시는지 궁금합니다.`, author: { id: 15, name: '김개발', avatar: null }, category: 'qna', tags: ['Next.js', 'ISR', '캐싱'], viewCount: 198, likeCount: 21, commentCount: 11, isLiked: false, isPinned: false, isSolved: false, createdAt: '2026-01-27T10:00:00', updatedAt: '2026-01-27T10:00:00' },
      5005: { id: 5005, courseTimeId: 5, type: 'tip', title: 'Next.js + Prisma 연동 가이드', content: `Next.js 프로젝트에서 Prisma ORM을 설정하고 사용하는 방법을 정리했습니다!

## 1. 설치
\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

## 2. 스키마 정의 (prisma/schema.prisma)
\`\`\`prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  createdAt DateTime @default(now())
}
\`\`\`

## 3. DB 마이그레이션
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

## 4. Prisma Client 사용
\`\`\`tsx
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Server Component에서 사용
const posts = await prisma.post.findMany()
\`\`\`

Server Components와 함께 사용하면 정말 편해요!`, author: { id: 36, name: '웹개발러', avatar: null }, category: 'tip', tags: ['Next.js', 'Prisma', 'ORM'], viewCount: 345, likeCount: 67, commentCount: 8, isLiked: true, isPinned: false, createdAt: '2026-01-26T14:00:00', updatedAt: '2026-01-26T14:00:00' },

      // AWS 클라우드 입문 - 추가 게시글
      3004: { id: 3004, courseTimeId: 3, type: 'question', title: 'S3 버킷 정책 설정 문의', content: `특정 IP에서만 S3 버킷에 접근하도록 설정하고 싶은데 버킷 정책 예시 있을까요?

현재 상황:
- S3 버킷에 정적 파일들을 업로드해놨습니다
- 회사 IP에서만 접근 가능하게 하고 싶어요

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "123.456.789.0/24"
        }
      }
    }
  ]
}
\`\`\`

이런 식으로 설정하면 되는 건가요?`, author: { id: 26, name: '데브옵스초보', avatar: null }, category: 'qna', tags: ['AWS', 'S3', '보안'], viewCount: 145, likeCount: 12, commentCount: 7, isLiked: false, isPinned: false, isSolved: true, createdAt: '2026-01-27T14:30:00', updatedAt: '2026-01-27T14:30:00' },
      3005: { id: 3005, courseTimeId: 3, type: 'tip', title: 'Lambda 콜드 스타트 줄이는 방법', content: `Provisioned Concurrency 외에 콜드 스타트를 줄이는 실용적인 방법들을 정리했습니다!

## 1. 패키지 크기 줄이기
- 불필요한 dependencies 제거
- Lambda Layer 활용
- webpack/esbuild로 번들링

## 2. 런타임 선택
- Python, Node.js가 Java보다 콜드 스타트가 빠름
- ARM64 (Graviton2) 사용하면 x86보다 빠름

## 3. 메모리 늘리기
- 메모리를 늘리면 CPU도 함께 올라감
- 128MB → 512MB로만 올려도 체감됨

## 4. VPC 피하기 (가능하다면)
- VPC 연결 시 ENI 생성으로 시간 소요
- 꼭 필요한 경우가 아니면 VPC 밖에서 실행

실제로 패키지 크기만 줄여도 2-3초 → 0.5초로 개선된 경험이 있어요!`, author: { id: 17, name: '박코딩', avatar: null }, category: 'tip', tags: ['AWS', 'Lambda', '성능'], viewCount: 378, likeCount: 67, commentCount: 11, isLiked: true, isPinned: false, createdAt: '2026-01-26T10:00:00', updatedAt: '2026-01-26T10:00:00' },

      // Python 데이터 분석 - 추가 게시글
      4003: { id: 4003, courseTimeId: 4, type: 'discussion', title: '데이터 분석 실무에서 많이 쓰는 라이브러리', content: `실무에서 pandas, numpy 외에 어떤 라이브러리를 많이 사용하시나요?

제가 알고 있는 것들:
- **시각화**: matplotlib, seaborn, plotly
- **머신러닝**: scikit-learn, xgboost
- **딥러닝**: tensorflow, pytorch

실무에서 많이 쓰이는데 저는 모르는 라이브러리가 있을 것 같아서요.
추천해주시면 공부해보려고 합니다!

특히 데이터 전처리나 EDA 할 때 편리한 라이브러리가 있으면 알려주세요.`, author: { id: 31, name: '파이썬러버', avatar: null }, category: 'discussion', tags: ['Python', '라이브러리', '실무'], viewCount: 198, likeCount: 23, commentCount: 15, isLiked: false, isPinned: false, createdAt: '2026-01-27T09:00:00', updatedAt: '2026-01-27T09:00:00' },

      // 기본 게시글 (timeId가 매칭되지 않는 강의용)
      9001: { id: 9001, courseTimeId: 0, type: 'question', title: '강의 관련 질문입니다', content: `이 부분이 이해가 안되는데 설명 부탁드립니다.

강의 3장에서 나온 내용 중에서 잘 모르겠는 부분이 있어요.

혹시 비슷한 고민 하신 분 계신가요?
같이 토론하면서 이해해보면 좋겠습니다.`, author: { id: 15, name: '김개발', avatar: null }, category: 'qna', tags: ['질문'], viewCount: 45, likeCount: 3, commentCount: 2, isLiked: false, isPinned: false, isSolved: false, createdAt: '2026-01-28T10:00:00', updatedAt: '2026-01-28T10:00:00' },
      9002: { id: 9002, courseTimeId: 0, type: 'tip', title: '강의 수강 팁 공유', content: `이렇게 하면 더 효율적으로 학습할 수 있어요!

## 제가 사용하는 학습 방법
1. 강의를 1.5배속으로 먼저 쭉 듣기
2. 이해 안 되는 부분만 다시 정상 속도로 듣기
3. 실습은 직접 코드 치면서 따라하기
4. 배운 내용 노션에 정리하기

이 방법으로 학습 시간을 많이 줄일 수 있었어요!`, author: { id: 16, name: '이학습', avatar: null }, category: 'tip', tags: ['팁'], viewCount: 78, likeCount: 12, commentCount: 4, isLiked: true, isPinned: false, createdAt: '2026-01-27T14:00:00', updatedAt: '2026-01-27T14:00:00' },
    };

    const post = postDetailMap[postId];

    if (post) {
      return HttpResponse.json(apiResponse({ ...post, comments: [] }));
    }

    // 찾지 못한 경우 기본 데이터 반환
    return HttpResponse.json(apiResponse({
      id: postId,
      courseTimeId: timeId,
      type: 'question' as const,
      title: '강의 내용 관련 질문입니다',
      content: `안녕하세요, 강의를 듣다가 궁금한 점이 생겨서 질문 드립니다.

이번 강의에서 배운 내용 중에 이해가 잘 안 되는 부분이 있는데요.

혹시 비슷한 경험이 있으신 분 계신가요?
같이 이야기 나눠보면 좋겠습니다.

감사합니다!`,
      author: { id: 15, name: '김개발', avatar: null },
      category: 'qna',
      tags: ['질문', '강의'],
      viewCount: 100,
      likeCount: 10,
      commentCount: 5,
      isLiked: false,
      isPinned: false,
      isSolved: false,
      createdAt: '2026-01-28T10:00:00',
      updatedAt: '2026-01-28T10:00:00',
      comments: [],
    }));
  }),

  // 강의별 커뮤니티 게시글 작성
  http.post('/api/times/:timeId/community/posts', async ({ params, request }) => {
    await delay(50);
    const body = await request.json() as { type: string; title: string; content: string; category: string; tags?: string[] };
    const newPost = {
      id: Date.now(),
      courseTimeId: Number(params.timeId),
      type: body.type,
      title: body.title,
      content: body.content,
      excerpt: body.content.slice(0, 100),
      author: { id: 14, name: '정학습', avatar: null },
      category: body.category,
      tags: body.tags || [],
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(apiResponse(newPost), { status: 201 });
  }),

  // 강의별 커뮤니티 게시글 좋아요
  http.post('/api/times/:timeId/community/posts/:postId/like', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ success: true }));
  }),

  http.delete('/api/times/:timeId/community/posts/:postId/like', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ success: true }));
  }),

  // 강의별 커뮤니티 댓글 목록
  http.get('/api/times/:timeId/community/posts/:postId/comments', async ({ params }) => {
    await delay(30);
    const postId = Number(params.postId);

    // postId 기반으로 다른 댓글 데이터 반환
    const commentsMap: Record<number, Array<{
      id: number;
      postId: number;
      author: { id: number; name: string; avatar: string | null };
      content: string;
      likeCount: number;
      createdAt: string;
      isEdited: boolean;
    }>> = {
      1001: [
        { id: 1, postId: 1001, author: { id: 16, name: '이학습', avatar: null }, content: '의존성 배열에 state를 넣지 않으면 해결됩니다!', likeCount: 5, createdAt: '2026-01-30T11:00:00', isEdited: false },
        { id: 2, postId: 1001, author: { id: 14, name: '정학습', avatar: null }, content: '또는 useCallback으로 함수를 메모이제이션 하는 방법도 있어요.', likeCount: 3, createdAt: '2026-01-30T12:00:00', isEdited: false },
      ],
      1002: [
        { id: 3, postId: 1002, author: { id: 15, name: '김개발', avatar: null }, content: '좋은 팁 감사합니다! 바로 적용해봐야겠어요.', likeCount: 2, createdAt: '2026-01-29T15:00:00', isEdited: false },
      ],
      2001: [
        { id: 4, postId: 2001, author: { id: 22, name: '스크립터', avatar: null }, content: 'extends 키워드로 타입 제약을 걸어보세요.', likeCount: 8, createdAt: '2026-01-30T12:00:00', isEdited: false },
      ],
      3001: [
        { id: 5, postId: 3001, author: { id: 25, name: '서버리스맨', avatar: null }, content: '키 페어 권한(chmod 400)을 확인해보세요!', likeCount: 6, createdAt: '2026-01-30T10:00:00', isEdited: false },
        { id: 6, postId: 3001, author: { id: 24, name: '클라우드러버', avatar: null }, content: '해결했습니다! 권한 문제였네요. 감사합니다!', likeCount: 2, createdAt: '2026-01-30T11:00:00', isEdited: false },
      ],
    };

    const comments = commentsMap[postId] || [];

    return HttpResponse.json(apiResponse({
      comments,
      totalCount: comments.length,
      page: 0,
      pageSize: 20,
      totalPages: 1,
    }));
  }),

  // 강의별 커뮤니티 댓글 작성
  http.post('/api/times/:timeId/community/posts/:postId/comments', async ({ params, request }) => {
    await delay(50);
    const body = await request.json() as { content: string };
    const newComment = {
      id: Date.now(),
      postId: Number(params.postId),
      author: { id: 14, name: '정학습', avatar: null },
      content: body.content,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      isEdited: false,
    };
    return HttpResponse.json(apiResponse(newComment), { status: 201 });
  }),

  // ========== Enrollments ==========
  http.get('/api/enrollments', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse(mockEnrollments)));
  }),

  http.get('/api/enrollments/:id', async ({ params }) => {
    await delay(30);
    const enrollment = mockEnrollments.find(e => e.id === Number(params.id));
    return HttpResponse.json(apiResponse(enrollment || mockEnrollments[0]));
  }),

  http.get('/api/enrollments/:id/curriculum', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(mockCurriculum));
  }),

  http.post('/api/enrollments', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse({ id: 100, message: '수강 신청이 완료되었습니다.' }));
  }),

  // 차수별 수강생 목록 조회 (관리자용)
  http.get('/api/times/:id/enrollments', async ({ params, request }) => {
    await delay(50);
    const courseTimeId = Number(params.id);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;
    const keyword = url.searchParams.get('keyword') || '';
    const status = url.searchParams.get('status') || '';

    // 해당 차수의 수강생 필터링
    let filtered = mockEnrollments.filter(e => e.courseTimeId === courseTimeId);

    // 키워드 검색 (유저 이름, 이메일)
    if (keyword) {
      filtered = filtered.filter(e => {
        const user = mockUsers.users.find((u: { id: number }) => u.id === e.userId);
        if (!user) return false;
        return user.name.toLowerCase().includes(keyword.toLowerCase()) ||
               user.email.toLowerCase().includes(keyword.toLowerCase());
      });
    }

    // 상태 필터
    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }

    // 페이지네이션
    const start = page * size;
    const paged = filtered.slice(start, start + size);

    // 유저 정보 조인
    const content = paged.map(e => {
      const user = mockUsers.users.find((u: { id: number }) => u.id === e.userId);
      return {
        ...e,
        userName: user?.name || `User ${e.userId}`,
        userEmail: user?.email || `user${e.userId}@example.com`,
      };
    });

    return HttpResponse.json(apiResponse({
      content,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      size,
      number: page,
    }));
  }),

  // 차수별 수강 통계 조회
  http.get('/api/times/:id/enrollments/stats', async ({ params }) => {
    await delay(30);
    const courseTimeId = Number(params.id);
    const enrollments = mockEnrollments.filter(e => e.courseTimeId === courseTimeId);

    const totalEnrollments = enrollments.length;
    const enrolledCount = enrollments.filter(e => e.status === 'ENROLLED').length;
    const completedCount = enrollments.filter(e => e.status === 'COMPLETED').length;
    const droppedCount = enrollments.filter(e => e.status === 'DROPPED').length;
    const pendingCount = enrollments.filter(e => e.status === 'PENDING').length;
    const completionRate = totalEnrollments > 0 ? (completedCount / totalEnrollments) * 100 : 0;
    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + (e.progressPercent || 0), 0) / enrollments.length
      : 0;

    return HttpResponse.json(apiResponse({
      totalEnrollments,
      enrolledCount,
      completedCount,
      droppedCount,
      pendingCount,
      completionRate,
      averageProgress: avgProgress,
    }));
  }),

  // 차수별 수강 신청 (CourseTime enrollment)
  http.post('/api/times/:id/enrollments', async ({ params }) => {
    await delay(50);
    const courseTimeId = Number(params.id);
    const newEnrollment = {
      id: mockEnrollments.length + 1,
      userId: 14,
      courseTimeId,
      enrolledAt: new Date().toISOString(),
      type: 'SELF',
      status: 'ENROLLED',
      enrollmentMethod: 'FIRST_COME',
      progressPercent: 0,
      score: null,
      completedAt: null,
      actualEndDate: null,
    };
    return HttpResponse.json(apiResponse(newEnrollment), { status: 201 });
  }),

  // 일괄 수강 신청
  http.post('/api/enrollments/bulk', async ({ request }) => {
    await delay(50);
    const body = await request.json() as { courseTimeIds: number[] };
    const results = body.courseTimeIds.map((courseTimeId, index) => ({
      courseTimeId,
      success: true,
      enrollmentId: 100 + index,
    }));
    return HttpResponse.json(apiResponse({
      results,
      successCount: results.length,
      failureCount: 0,
    }));
  }),

  // 수강 신청 취소
  http.post('/api/enrollments/:id/cancel', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ message: '수강 신청이 취소되었습니다.' }));
  }),

  // 학습 플레이어용 enrollment 데이터
  http.get('/api/enrollments/:id/player', async ({ params }) => {
    await delay(30);
    const enrollmentId = Number(params.id);
    const enrollment = mockEnrollments.find(e => e.id === enrollmentId);
    if (!enrollment) {
      return HttpResponse.json(
        errorResponse('수강 정보를 찾을 수 없습니다.', 'ENROLLMENT_NOT_FOUND'),
        { status: 404 }
      );
    }
    const courseTime = mockCourseTimes.find(ct => ct.id === enrollment.courseTimeId);
    return HttpResponse.json(apiResponse({
      enrollmentId: enrollment.id,
      userId: enrollment.userId,
      courseTimeId: enrollment.courseTimeId,
      courseTimeName: courseTime?.title ?? '',
      programId: courseTime?.program?.id ?? 0,
      programTitle: courseTime?.program?.title ?? '',
      snapshotId: enrollment.courseTimeId, // mock에서는 courseTimeId를 snapshotId로 사용
      status: enrollment.status,
      progressPercent: enrollment.progressPercent ?? 0,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      classStartDate: courseTime?.classStartDate ?? '',
      classEndDate: courseTime?.classEndDate ?? '',
    }));
  }),

  // 학습 항목 진도 조회
  http.get('/api/enrollments/:id/items/progress', async () => {
    await delay(30);
    // 완료된 항목 목록 반환
    return HttpResponse.json(apiResponse({
      completedItemIds: [2, 3, 4, 6], // 일부 항목 완료 상태
      progressByItem: {
        2: { completed: true, completedAt: '2026-01-20T10:00:00' },
        3: { completed: true, completedAt: '2026-01-21T11:00:00' },
        4: { completed: true, completedAt: '2026-01-22T09:00:00' },
        6: { completed: true, completedAt: '2026-01-25T14:00:00' },
      },
    }));
  }),

  // 학습 항목 완료 처리
  http.post('/api/enrollments/:enrollmentId/items/:itemId/complete', async ({ params }) => {
    await delay(30);
    const itemId = Number(params.itemId);
    return HttpResponse.json(apiResponse({
      itemId,
      completed: true,
      completedAt: new Date().toISOString(),
    }));
  }),

  // 학습 진도 업데이트
  http.patch('/api/enrollments/:id/progress', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ message: '진도가 업데이트되었습니다.' }));
  }),

  // ========== Snapshots (학습 플레이어용) ==========
  // 스냅샷 항목 목록
  http.get('/api/snapshots/:id/items', async () => {
    await delay(30);
    // 트리 구조의 학습 항목
    return HttpResponse.json(apiResponse([
      {
        id: 1,
        name: '1장. 기초 개념',
        type: 'FOLDER',
        parentId: null,
        order: 1,
        children: [
          { id: 2, name: '강의 소개', type: 'VIDEO', parentId: 1, order: 1, duration: 600, learningObjectId: 101 },
          { id: 3, name: '핵심 개념 이해', type: 'VIDEO', parentId: 1, order: 2, duration: 900, learningObjectId: 102 },
          { id: 4, name: '개념 퀴즈', type: 'QUIZ', parentId: 1, order: 3, duration: 300, learningObjectId: 103 },
        ],
      },
      {
        id: 5,
        name: '2장. 심화 학습',
        type: 'FOLDER',
        parentId: null,
        order: 2,
        children: [
          { id: 6, name: '고급 기능', type: 'VIDEO', parentId: 5, order: 1, duration: 1200, learningObjectId: 104 },
          { id: 7, name: '실습 과제', type: 'ASSIGNMENT', parentId: 5, order: 2, duration: 1800, learningObjectId: 105 },
        ],
      },
      {
        id: 8,
        name: '3장. 프로젝트',
        type: 'FOLDER',
        parentId: null,
        order: 3,
        children: [
          { id: 9, name: '프로젝트 소개', type: 'VIDEO', parentId: 8, order: 1, duration: 600, learningObjectId: 106 },
          { id: 10, name: '최종 평가', type: 'EXAM', parentId: 8, order: 2, duration: 3600, learningObjectId: 107 },
        ],
      },
    ]));
  }),

  // 스냅샷 순서 정보
  http.get('/api/snapshots/:id/relations/ordered', async () => {
    await delay(30);
    // 플랫한 순서 목록 (학습 순서대로)
    return HttpResponse.json(apiResponse([
      { id: 2, name: '강의 소개', type: 'VIDEO', order: 1, duration: 600, learningObjectId: 101 },
      { id: 3, name: '핵심 개념 이해', type: 'VIDEO', order: 2, duration: 900, learningObjectId: 102 },
      { id: 4, name: '개념 퀴즈', type: 'QUIZ', order: 3, duration: 300, learningObjectId: 103 },
      { id: 6, name: '고급 기능', type: 'VIDEO', order: 4, duration: 1200, learningObjectId: 104 },
      { id: 7, name: '실습 과제', type: 'ASSIGNMENT', order: 5, duration: 1800, learningObjectId: 105 },
      { id: 9, name: '프로젝트 소개', type: 'VIDEO', order: 6, duration: 600, learningObjectId: 106 },
      { id: 10, name: '최종 평가', type: 'EXAM', order: 7, duration: 3600, learningObjectId: 107 },
    ]));
  }),

  // ========== Certificates ==========
  http.get('/api/certificates', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockCertificates));
  }),

  // ========== Tenant Notices ==========
  http.get('/api/tenant/notices', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse(mockTenantNotices)));
  }),

  http.get('/api/ta/notices', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse(mockTenantNotices)));
  }),

  http.get('/api/tu/notices', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse(mockTenantNotices)));
  }),

  http.get('/api/tu/notices/count', async () => {
    await delay(10);
    return HttpResponse.json(apiResponse({ count: mockTenantNotices.length }));
  }),

  // 공지사항 상세 조회
  http.get('/api/tu/notices/:id', async ({ params }) => {
    await delay(30);
    const noticeId = Number(params.id);
    const notice = mockTenantNotices.find(n => n.id === noticeId);
    if (!notice) {
      return HttpResponse.json(
        errorResponse('공지사항을 찾을 수 없습니다.', 'NOTICE_NOT_FOUND'),
        { status: 404 }
      );
    }
    // 상세 정보 반환 (mock 데이터에 content 포함되어 있음)
    return HttpResponse.json(apiResponse(notice));
  }),

  // ========== Dashboard ==========
  // TA Dashboard (TENANT_ADMIN)
  http.get('/api/admin/dashboard/kpi', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const periodParam = url.searchParams.get('period');
    // 프론트엔드 period ('7d', '30d', 없음=all) → mock 데이터 키 매핑
    const periodMap: Record<string, keyof typeof mockTADashboardByPeriod> = {
      '7d': 'WEEK',
      '30d': 'MONTH',
    };
    const periodKey = periodParam ? (periodMap[periodParam] || 'ALL') : 'ALL';
    const dashboardData = mockTADashboardByPeriod[periodKey];
    // 새 구조 응답: userStats, programStats, enrollmentStats, dailyTrend
    return HttpResponse.json(apiResponse({
      userStats: dashboardData.userStats,
      programStats: dashboardData.programStats,
      enrollmentStats: dashboardData.enrollmentStats,
      dailyTrend: dashboardData.dailyTrend,
    }));
  }),

  // SA Dashboard (SYSTEM_ADMIN)
  http.get('/api/sa/dashboard', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(mockSADashboard));
  }),

  // CO Dashboard (OPERATOR) - 기간별 필터링 지원
  http.get('/api/operator/dashboard/tasks', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const periodParam = url.searchParams.get('period');

    // 프론트엔드 파라미터를 mock 데이터 키로 매핑
    const periodMap: Record<string, keyof typeof mockCODashboardByPeriod> = {
      '7d': 'WEEK',
      '30d': 'MONTH',
    };

    const periodKey = periodParam ? (periodMap[periodParam] || 'ALL') : 'ALL';
    const dashboardData = mockCODashboardByPeriod[periodKey];

    return HttpResponse.json(apiResponse(dashboardData));
  }),

  // ========== TU Dashboard ==========
  http.get('/api/tu/dashboard', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(mockTUDashboard));
  }),

  http.get('/api/owners/me/stats', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockTUDashboard.myLearning));
  }),

  // ========== Analytics ==========
  // 활동 로그 목록 조회
  http.get('/api/admin/analytics/logs', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '50', 10);
    const type = url.searchParams.get('type') || undefined;

    let filteredLogs = [...mockActivityLogs];
    if (type) {
      filteredLogs = filteredLogs.filter(log => log.activityType === type);
    }

    return HttpResponse.json(apiResponse(paginatedResponse(filteredLogs, page, size)));
  }),

  // 활동 로그 검색
  http.get('/api/admin/analytics/logs/search', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '50', 10);
    const userId = url.searchParams.get('userId');
    const type = url.searchParams.get('type') || undefined;
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;
    const keyword = url.searchParams.get('keyword') || undefined;

    const filteredLogs = searchActivityLogs({
      userId: userId ? parseInt(userId, 10) : undefined,
      type: type as ActivityType | undefined,
      startDate,
      endDate,
      keyword,
    });

    return HttpResponse.json(apiResponse(paginatedResponse(filteredLogs, page, size)));
  }),

  // 활동 통계 조회
  http.get('/api/admin/analytics/stats', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30', 10);

    // 1, 7, 30일 기준 통계 반환
    const stats = mockActivityStatsByDays[days] || mockActivityStatsByDays[30];
    return HttpResponse.json(apiResponse(stats));
  }),

  // 최근 활동 조회
  http.get('/api/admin/analytics/recent', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockRecentActivities));
  }),

  // 특정 사용자 활동 로그 조회
  http.get('/api/admin/analytics/logs/users/:userId', async ({ params, request }) => {
    await delay(30);
    const userId = Number(params.userId);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '20', 10);

    const userLogs = mockActivityLogs.filter(log => log.userId === userId);
    return HttpResponse.json(apiResponse(paginatedResponse(userLogs, page, size)));
  }),

  // 활동 유형 목록 조회
  http.get('/api/admin/analytics/types', async () => {
    await delay(30);
    const activityTypes = [
      { type: 'LOGIN', description: '로그인' },
      { type: 'LOGOUT', description: '로그아웃' },
      { type: 'LOGIN_FAILED', description: '로그인 실패' },
      { type: 'PASSWORD_CHANGE', description: '비밀번호 변경' },
      { type: 'USER_CREATE', description: '사용자 생성' },
      { type: 'USER_UPDATE', description: '사용자 수정' },
      { type: 'USER_DELETE', description: '사용자 삭제' },
      { type: 'ROLE_CHANGE', description: '역할 변경' },
      { type: 'COURSE_VIEW', description: '강좌 조회' },
      { type: 'COURSE_CREATE', description: '강좌 생성' },
      { type: 'COURSE_UPDATE', description: '강좌 수정' },
      { type: 'COURSE_DELETE', description: '강좌 삭제' },
      { type: 'ENROLLMENT_CREATE', description: '수강 신청' },
      { type: 'ENROLLMENT_COMPLETE', description: '수강 완료' },
      { type: 'ENROLLMENT_DROP', description: '수강 취소' },
      { type: 'CONTENT_VIEW', description: '콘텐츠 조회' },
      { type: 'CONTENT_COMPLETE', description: '콘텐츠 완료' },
    ];
    return HttpResponse.json(apiResponse(activityTypes));
  }),

  // 활동 로그 내보내기 (CSV)
  http.get('/api/admin/analytics/logs/export', async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const type = url.searchParams.get('type') || undefined;
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;

    const filteredLogs = searchActivityLogs({
      userId: userId ? parseInt(userId, 10) : undefined,
      type: type as ActivityType | undefined,
      startDate,
      endDate,
    });

    // CSV 생성
    const headers = ['ID', '사용자', '이메일', '활동 유형', '설명', 'IP 주소', '생성일시'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.userName || '',
      log.userEmail || '',
      log.activityTypeLabel,
      log.description,
      log.ipAddress || '',
      log.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    return new HttpResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="activity_logs_${Date.now()}.csv"`,
      },
    });
  }),

  // 리포트 유형 목록
  http.get('/api/admin/analytics/reports/types', async () => {
    await delay(30);
    const reportTypes = [
      { type: 'USERS', name: '사용자 현황', description: '등록된 사용자 목록 및 상태' },
      { type: 'COURSES', name: '강좌 현황', description: '강좌 목록 및 수강 통계' },
      { type: 'LEARNING', name: '학습 진도', description: '사용자별 학습 진행 현황' },
      { type: 'COMPLETION', name: '수료 현황', description: '강좌별 수료자 통계' },
      { type: 'ENGAGEMENT', name: '참여도 분석', description: '사용자 활동 및 참여 지표' },
    ];
    return HttpResponse.json(apiResponse(reportTypes));
  }),

  // 리포트 내보내기
  http.get('/api/admin/analytics/reports/export', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const reportType = url.searchParams.get('reportType') || 'USERS';
    const format = url.searchParams.get('format') || 'CSV';

    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'CSV') {
      mimeType = 'text/csv';
      extension = 'csv';
      // CSV 데이터 생성
      if (reportType === 'USERS') {
        content = 'ID,이름,이메일,역할,상태,가입일\n1,김관리,admin@mzcacademy.com,TENANT_ADMIN,ACTIVE,2024-01-15\n2,이운영,operator@mzcacademy.com,TENANT_OPERATOR,ACTIVE,2024-02-01';
      } else if (reportType === 'COURSES') {
        content = 'ID,강좌명,카테고리,수강생,완료율\n1,AWS Solutions Architect,클라우드,45,78%\n2,Kubernetes 기초,DevOps,32,65%';
      } else if (reportType === 'LEARNING') {
        content = 'ID,사용자,강좌,진도율,최근학습일\n1,박수강,AWS Solutions Architect,85%,2025-01-28\n2,정학습,Kubernetes 기초,60%,2025-01-27';
      } else if (reportType === 'COMPLETION') {
        content = 'ID,사용자,강좌,수료일,점수\n1,박수강,AWS Solutions Architect,2025-01-25,92\n2,최개발,Kubernetes 기초,2025-01-20,88';
      } else {
        content = 'ID,사용자,총수강,완료,진행중,평균진도율\n1,박수강,5,3,2,75%\n2,정학습,4,2,2,60%';
      }
    } else if (format === 'XLSX') {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      extension = 'xlsx';
      // 간단한 XLSX 데이터 (실제로는 라이브러리 필요)
      content = 'XLSX_MOCK_DATA';
    } else {
      mimeType = 'application/pdf';
      extension = 'pdf';
      content = 'PDF_MOCK_DATA';
    }

    return new HttpResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${reportType.toLowerCase()}_report.${extension}"`,
      },
    });
  }),

  // 내보내기 이력 조회
  http.get('/api/admin/analytics/reports/history', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const history = [
      { id: 1, reportType: '사용자 현황', format: 'XLSX', period: 'MONTH', status: 'COMPLETED', createdAt: '2025-01-28 14:30:00', fileSize: '24KB' },
      { id: 2, reportType: '학습 진도', format: 'CSV', period: 'WEEK', status: 'COMPLETED', createdAt: '2025-01-27 10:15:00', fileSize: '12KB' },
      { id: 3, reportType: '수료 현황', format: 'PDF', period: 'MONTH', status: 'COMPLETED', createdAt: '2025-01-26 16:45:00', fileSize: '156KB' },
      { id: 4, reportType: '참여도 분석', format: 'XLSX', period: 'QUARTER', status: 'COMPLETED', createdAt: '2025-01-25 09:20:00', fileSize: '48KB' },
      { id: 5, reportType: '강좌 현황', format: 'CSV', period: 'ALL', status: 'COMPLETED', createdAt: '2025-01-24 11:00:00', fileSize: '8KB' },
    ].slice(0, limit);

    return HttpResponse.json(apiResponse(history));
  }),

  // 내보내기 통계
  http.get('/api/admin/analytics/reports/stats', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({
      monthlyCount: 23,
      totalSize: '1.2MB',
      mostPopular: '사용자 현황',
    }));
  }),

  http.get('/api/sa/analytics/logs', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '50', 10);
    return HttpResponse.json(apiResponse(paginatedResponse(mockActivityLogs, page, size)));
  }),

  // ========== Wishlist & Cart ==========
  // 찜 목록 조회 (페이지네이션)
  http.get('/api/wishlist', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '20', 10);
    return HttpResponse.json(apiResponse(paginatedResponse(mockWishlist, page, size)));
  }),

  http.get('/api/wishlist/count', async () => {
    await delay(10);
    return HttpResponse.json(apiResponse({ count: mockWishlist.length }));
  }),

  http.post('/api/wishlist', async ({ request }) => {
    await delay(30);
    const body = await request.json() as { courseTimeId: number };
    // WishlistItemResponse 형식으로 반환
    const newItem = {
      id: mockWishlist.length + 1,
      courseTimeId: body.courseTimeId,
      courseTimeTitle: '새로 추가된 강의',
      thumbnailUrl: null,
      level: null,
      estimatedHours: null,
      isFree: false,
      price: null,
      addedAt: new Date().toISOString(),
    };
    return HttpResponse.json(apiResponse(newItem), { status: 201 });
  }),

  // /api/wishlist/course-times/:courseTimeId 경로로 삭제
  http.delete('/api/wishlist/course-times/:courseTimeId', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ message: '찜 목록에서 삭제되었습니다.' }));
  }),

  http.get('/api/wishlist/course-times/:courseTimeId/check', async ({ params }) => {
    await delay(10);
    const courseTimeId = Number(params.courseTimeId);
    const isWishlisted = mockWishlist.some(w => w.courseTimeId === courseTimeId);
    return HttpResponse.json(apiResponse(isWishlisted));
  }),

  // 찜 여부 일괄 확인
  http.post('/api/wishlist/check', async ({ request }) => {
    await delay(20);
    const body = await request.json() as { courseTimeIds: number[] };
    const wishlistStatus: Record<number, boolean> = {};
    body.courseTimeIds.forEach(id => {
      wishlistStatus[id] = mockWishlist.some(w => w.courseTimeId === id);
    });
    return HttpResponse.json(apiResponse({ wishlistStatus }));
  }),

  // 장바구니 조회 (배열 직접 반환)
  http.get('/api/cart', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(mockCart));
  }),

  http.get('/api/cart/count', async () => {
    await delay(10);
    return HttpResponse.json(apiResponse({ count: mockCart.length }));
  }),

  // /api/cart/items 경로로 추가
  http.post('/api/cart/items', async ({ request }) => {
    await delay(30);
    const body = await request.json() as { courseTimeId: number };
    // CartItemResponse 형식으로 반환
    const newItem = {
      cartItemId: mockCart.length + 1,
      courseTimeId: body.courseTimeId,
      courseTimeTitle: '새로 추가된 강의',
      thumbnailUrl: null,
      level: null,
      estimatedHours: null,
      isFree: false,
      price: null,
      addedAt: new Date().toISOString(),
    };
    return HttpResponse.json(apiResponse(newItem), { status: 201 });
  }),

  // /api/cart/items/:courseTimeId 경로로 삭제
  http.delete('/api/cart/items/:courseTimeId', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ message: '장바구니에서 삭제되었습니다.' }));
  }),

  // 장바구니 일괄 삭제
  http.delete('/api/cart/items', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ message: '선택한 항목이 삭제되었습니다.' }));
  }),

  // 장바구니 여부 확인
  http.get('/api/cart/items/:courseTimeId/check', async ({ params }) => {
    await delay(10);
    const courseTimeId = Number(params.courseTimeId);
    const isInCart = mockCart.some(c => c.courseTimeId === courseTimeId);
    return HttpResponse.json(apiResponse(isInCart));
  }),

  // ========== Notifications (알림) ==========
  // 알림 목록 조회
  http.get('/api/tu/notifications', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const type = url.searchParams.get('type');
    const isReadParam = url.searchParams.get('isRead');

    let filteredNotifications = [...mockNotifications];

    // 타입 필터링
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }

    // 읽음 상태 필터링
    if (isReadParam !== null) {
      const isRead = isReadParam === 'true';
      filteredNotifications = filteredNotifications.filter(n => n.isRead === isRead);
    }

    // 페이지네이션
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedNotifications = filteredNotifications.slice(start, end);
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;

    return HttpResponse.json(apiResponse({
      notifications: paginatedNotifications,
      totalCount: filteredNotifications.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredNotifications.length / pageSize),
      unreadCount,
    }));
  }),

  // 알림 상세 조회
  http.get('/api/tu/notifications/:id', async ({ params }) => {
    await delay(20);
    const notificationId = Number(params.id);
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (!notification) {
      return HttpResponse.json(
        errorResponse('알림을 찾을 수 없습니다.', 'NOTIFICATION_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse(notification));
  }),

  // 읽지 않은 알림 개수 조회
  http.get('/api/tu/notifications/unread-count', async () => {
    await delay(10);
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    return HttpResponse.json(apiResponse({ count: unreadCount }));
  }),

  // 알림 읽음 처리
  http.patch('/api/tu/notifications/:id/read', async ({ params }) => {
    await delay(20);
    const notificationId = Number(params.id);
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (!notification) {
      return HttpResponse.json(
        errorResponse('알림을 찾을 수 없습니다.', 'NOTIFICATION_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({ message: '알림을 읽음 처리했습니다.' }));
  }),

  // 모든 알림 읽음 처리
  http.patch('/api/tu/notifications/read-all', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ message: '모든 알림을 읽음 처리했습니다.' }));
  }),

  // 알림 삭제
  http.delete('/api/tu/notifications/:id', async ({ params }) => {
    await delay(20);
    const notificationId = Number(params.id);
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (!notification) {
      return HttpResponse.json(
        errorResponse('알림을 찾을 수 없습니다.', 'NOTIFICATION_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({ message: '알림이 삭제되었습니다.' }));
  }),

  // 읽은 알림 전체 삭제
  http.delete('/api/tu/notifications/read', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ message: '읽은 알림이 모두 삭제되었습니다.' }));
  }),

  // ========== Community (테넌트별) ==========
  // 커뮤니티 카테고리 목록 (CommunityCategoryResponse 형식)
  http.get('/api/community/categories', async () => {
    await delay(20);
    return HttpResponse.json(apiResponse({
      categories: [
        { id: 'free', name: '자유게시판', description: '자유롭게 이야기를 나눠보세요', count: 156, icon: 'MessageSquare' },
        { id: 'qna', name: '질문과 답변', description: '학습 관련 질문을 올려주세요', count: 89, icon: 'HelpCircle' },
        { id: 'study', name: '스터디 모집', description: '함께 공부할 스터디원을 모집합니다', count: 34, icon: 'Users' },
        { id: 'career', name: '취업/이직', description: '취업 및 이직 관련 정보를 공유해요', count: 67, icon: 'Briefcase' },
        { id: 'review', name: '후기 공유', description: '강의 및 학습 후기를 공유해주세요', count: 45, icon: 'Star' },
      ],
    }));
  }),

  // 내가 작성한 게시글 (정적 경로 - 동적 경로보다 먼저 정의)
  http.get('/api/community/posts/my', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);

    // 현재 사용자가 작성한 게시글만 필터링 (mock에서는 authorId: 14 사용)
    const myPosts = mockCommunityPosts.filter(p => p.authorId === 14);
    const start = page * pageSize;
    const end = start + pageSize;

    return HttpResponse.json(apiResponse({
      posts: myPosts.slice(start, end),
      totalCount: myPosts.length,
      page,
      pageSize,
      totalPages: Math.ceil(myPosts.length / pageSize),
    }));
  }),

  // 내가 댓글 단 게시글 (정적 경로 - 동적 경로보다 먼저 정의)
  http.get('/api/community/posts/commented', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);

    // mock 데이터: 다른 사람의 게시글 중 일부에 댓글을 단 것으로 처리 (본인 게시글 제외)
    const otherPosts = mockCommunityPosts.filter(p => p.authorId !== 14);
    const commentedPosts = otherPosts.slice(0, 4).map(post => ({
      ...post,
      myCommentCount: Math.floor(Math.random() * 3) + 1,
      lastCommentedAt: '2026-01-28T14:30:00',
    }));

    const start = page * pageSize;
    const end = start + pageSize;

    return HttpResponse.json(apiResponse({
      posts: commentedPosts.slice(start, end),
      totalCount: commentedPosts.length,
      page,
      pageSize,
      totalPages: Math.ceil(commentedPosts.length / pageSize),
    }));
  }),

  // 인기 게시글 (정적 경로 - 동적 경로보다 먼저 정의)
  // 원래 MOCK_POPULAR_POSTS 스타일의 인기글 데이터 반환
  http.get('/api/community/posts/popular', async () => {
    await delay(30);

    // 프론트엔드 MOCK_POPULAR_POSTS와 유사한 형식의 인기글 데이터
    // 날짜를 오늘로 설정하여 "오늘의 인기글" 필터에 걸리도록 함
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const popularPosts = [
      // 오늘의 인기글 (왼쪽)
      { id: 1001, type: 'discussion', title: '퇴사를 마음먹었습니다.', content: '5년차 개발자입니다...', excerpt: '5년차 개발자입니다...', author: { id: 101, name: '익명', avatar: null }, category: 'free', tags: ['퇴사', '고민'], viewCount: 1234, likeCount: 89, commentCount: 7, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      { id: 1002, type: 'discussion', title: '이직하고 싶은 물경력 개발자', content: '3년차인데 경력이 애매합니다...', excerpt: '3년차인데 경력이 애매합니다...', author: { id: 102, name: '고민개발자', avatar: null }, category: 'free', tags: ['이직', '커리어'], viewCount: 2341, likeCount: 156, commentCount: 15, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      { id: 1003, type: 'tip', title: '승진했습니다', content: '드디어 시니어로 승진했어요!', excerpt: '드디어 시니어로 승진했어요!', author: { id: 103, name: '행복한개발자', avatar: null }, category: 'free', tags: ['승진', '축하'], viewCount: 567, likeCount: 234, commentCount: 4, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      { id: 1004, type: 'discussion', title: '바이브 코딩의 도입의 문제점이 있는것 같아요', content: 'AI 코딩 도구를 사용하면서 느낀점...', excerpt: 'AI 코딩 도구를 사용하면서 느낀점...', author: { id: 104, name: 'AI회의론자', avatar: null }, category: 'qna', tags: ['AI', '코딩'], viewCount: 890, likeCount: 67, commentCount: 11, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      { id: 1005, type: 'question', title: '4년차의 개발 방향성과 이직 고려', content: '프론트엔드에서 풀스택으로 전환...', excerpt: '프론트엔드에서 풀스택으로 전환...', author: { id: 105, name: '방황중', avatar: null }, category: 'career', tags: ['커리어', '이직'], viewCount: 1567, likeCount: 123, commentCount: 11, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      // 오늘의 인기글 (오른쪽)
      { id: 1006, type: 'tip', title: '조폭 말투로 AI 쓰면 빡쳐요', content: 'ChatGPT한테 반말하면 진짜...', excerpt: 'ChatGPT한테 반말하면 진짜...', author: { id: 106, name: 'AI사용자', avatar: null }, category: 'free', tags: ['AI', '유머'], viewCount: 345, likeCount: 45, commentCount: 2, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      { id: 1007, type: 'discussion', title: '커밋이력 없다고 일이 없냐 + 일 하기 싫고 추가 계약...', content: '프리랜서 생활의 현실...', excerpt: '프리랜서 생활의 현실...', author: { id: 107, name: '프리랜서A', avatar: null }, category: 'free', tags: ['프리랜서', '현실'], viewCount: 678, likeCount: 56, commentCount: 4, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      { id: 1008, type: 'question', title: '초보자 PM역할을 맡았습니다. ㅠㅠ 개발자님들 도와주...', content: '갑자기 PM을 맡게 되었는데...', excerpt: '갑자기 PM을 맡게 되었는데...', author: { id: 108, name: '신입PM', avatar: null }, category: 'qna', tags: ['PM', '도움요청'], viewCount: 456, likeCount: 34, commentCount: 4, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      { id: 1009, type: 'discussion', title: '동생의 처남 결혼식 참석하는게 맞을까요?', content: '경조사 범위가 너무 넓어지는것 같아서...', excerpt: '경조사 범위가 너무 넓어지는것 같아서...', author: { id: 109, name: '고민중', avatar: null }, category: 'free', tags: ['일상', '고민'], viewCount: 789, likeCount: 78, commentCount: 10, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      { id: 1010, type: 'discussion', title: '퀀트 개발해도 망할 것 같음..', content: '금융권 개발 현실...', excerpt: '금융권 개발 현실...', author: { id: 110, name: '퀀트개발자', avatar: null }, category: 'free', tags: ['퀀트', '금융'], viewCount: 234, likeCount: 23, commentCount: 2, isLiked: false, isPinned: false, createdAt: today, updatedAt: today },
      // 이번주 인기글
      { id: 1011, type: 'tip', title: '주니어 개발자가 알아야 할 것들 정리', content: '신입 개발자를 위한 가이드...', excerpt: '신입 개발자를 위한 가이드...', author: { id: 111, name: '시니어개발자', avatar: null }, category: 'free', tags: ['주니어', '팁'], viewCount: 5678, likeCount: 456, commentCount: 45, isLiked: false, isPinned: false, createdAt: yesterday, updatedAt: yesterday },
      { id: 1012, type: 'discussion', title: 'React vs Vue 2024 비교', content: '프레임워크 선택 가이드...', excerpt: '프레임워크 선택 가이드...', author: { id: 112, name: '프론트전문가', avatar: null }, category: 'qna', tags: ['React', 'Vue'], viewCount: 3456, likeCount: 345, commentCount: 32, isLiked: false, isPinned: false, createdAt: yesterday, updatedAt: yesterday },
      { id: 1013, type: 'review', title: '면접 후기 공유합니다', content: '대기업 면접 후기...', excerpt: '대기업 면접 후기...', author: { id: 113, name: '취준생', avatar: null }, category: 'career', tags: ['면접', '후기'], viewCount: 2345, likeCount: 234, commentCount: 28, isLiked: false, isPinned: false, createdAt: twoDaysAgo, updatedAt: twoDaysAgo },
      { id: 1014, type: 'tip', title: '재택근무 꿀팁 모음', content: '집에서 생산성 높이는 방법...', excerpt: '집에서 생산성 높이는 방법...', author: { id: 114, name: '재택러', avatar: null }, category: 'free', tags: ['재택', '팁'], viewCount: 1890, likeCount: 189, commentCount: 24, isLiked: false, isPinned: false, createdAt: twoDaysAgo, updatedAt: twoDaysAgo },
      { id: 1015, type: 'discussion', title: '연봉 협상 성공 후기', content: '연봉 협상 노하우 공유...', excerpt: '연봉 협상 노하우 공유...', author: { id: 115, name: '연봉협상가', avatar: null }, category: 'career', tags: ['연봉', '협상'], viewCount: 6789, likeCount: 678, commentCount: 67, isLiked: false, isPinned: false, createdAt: twoDaysAgo, updatedAt: twoDaysAgo },
    ];

    return HttpResponse.json(apiResponse({
      posts: popularPosts,
      totalCount: popularPosts.length,
      page: 0,
      pageSize: 15,
      totalPages: 1,
    }));
  }),

  // 게시글 목록 조회
  http.get('/api/community/posts', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    // 헤더에서 tenantId 추출 (실제로는 토큰에서 추출)
    const authHeader = request.headers.get('Authorization');
    const tokenMatch = authHeader?.match(/mock-access-token-(\d+)-/);
    let tenantId: number | null = null;
    if (tokenMatch) {
      const userId = Number.parseInt(tokenMatch[1], 10);
      const user = mockUserDetails[userId];
      tenantId = user?.tenantId ?? null;
    }
    let posts = getCommunityPostsByTenant(tenantId);

    // 카테고리 필터링
    if (category && category !== 'all') {
      posts = posts.filter(p => p.category === category);
    }

    // 검색어 필터링
    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower)
      );
    }

    // CommunityPostListResponse 형식으로 반환
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedPosts = posts.slice(start, end);

    return HttpResponse.json(apiResponse({
      posts: paginatedPosts,
      totalCount: posts.length,
      page,
      pageSize,
      totalPages: Math.ceil(posts.length / pageSize),
    }));
  }),

  // 게시글 상세 조회 (동적 경로 - 정적 경로보다 나중에 정의)
  http.get('/api/community/posts/:id', async ({ params }) => {
    await delay(30);
    const post = mockCommunityPosts.find(p => p.id === Number(params.id));
    if (!post) {
      return HttpResponse.json(
        errorResponse('게시글을 찾을 수 없습니다.', 'POST_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse(post));
  }),

  // 게시글 작성
  http.post('/api/community/posts', async ({ request }) => {
    await delay(50);
    const body = await request.json() as { title: string; content: string; type?: string; category?: string; tags?: string[] };
    const newPost = {
      id: mockCommunityPosts.length + 1,
      tenantId: 1,
      type: body.type || 'discussion',
      title: body.title,
      content: body.content,
      excerpt: body.content.substring(0, 100),
      author: { id: 14, name: '정학습', avatar: null },
      category: body.category || 'free',
      tags: body.tags || [],
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(apiResponse(newPost), { status: 201 });
  }),

  // 게시글 좋아요
  http.post('/api/community/posts/:id/like', async ({ params }) => {
    await delay(20);
    const postId = Number(params.id);
    const post = mockCommunityPosts.find(p => p.id === postId);
    if (!post) {
      return HttpResponse.json(
        errorResponse('게시글을 찾을 수 없습니다.', 'POST_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({
      postId,
      liked: true,
      likeCount: post.likeCount + 1
    }));
  }),

  // 게시글 좋아요 취소
  http.delete('/api/community/posts/:id/like', async ({ params }) => {
    await delay(20);
    const postId = Number(params.id);
    const post = mockCommunityPosts.find(p => p.id === postId);
    if (!post) {
      return HttpResponse.json(
        errorResponse('게시글을 찾을 수 없습니다.', 'POST_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({
      postId,
      liked: false,
      likeCount: Math.max(0, post.likeCount - 1)
    }));
  }),

  // 게시글 댓글 목록 (게시글별로 다른 댓글)
  http.get('/api/community/posts/:id/comments', async ({ params }) => {
    await delay(30);
    const postId = Number(params.id);

    // 게시글별 맞춤 댓글 데이터
    const commentsByPost: Record<number, Array<{
      id: number;
      postId: number;
      author: { id: number; name: string; avatar: string | null };
      content: string;
      likeCount: number;
      createdAt: string;
      isEdited: boolean;
    }>> = {
      // Post 1: React 학습 팁 공유합니다 (정학습 작성)
      1: [
        {
          id: 1,
          postId: 1,
          author: { id: 15, name: '김개발', avatar: null },
          content: '좋은 정보 감사합니다! React 처음 배우는데 정말 도움이 많이 됐어요.',
          likeCount: 8,
          createdAt: '2026-01-20T14:30:00',
          isEdited: false,
        },
        {
          id: 2,
          postId: 1,
          author: { id: 16, name: '이학습', avatar: null },
          content: 'useEffect 의존성 배열 부분 정말 공감합니다. 저도 처음에 무한 루프 때문에 고생했어요.',
          likeCount: 5,
          createdAt: '2026-01-20T15:20:00',
          isEdited: false,
        },
        {
          id: 3,
          postId: 1,
          author: { id: 14, name: '정학습', avatar: null },
          content: '댓글 감사합니다! 추가로 궁금한 점 있으시면 편하게 질문해주세요 :)',
          likeCount: 3,
          createdAt: '2026-01-20T16:00:00',
          isEdited: false,
        },
      ],
      // Post 2: TypeScript 제네릭 관련 질문입니다 (정학습 작성)
      2: [
        {
          id: 4,
          postId: 2,
          author: { id: 16, name: '이학습', avatar: null },
          content: 'extends 키워드를 사용해서 타입을 제한하시면 됩니다. 예를 들어 function example<T extends string | number>(arg: T) 이런 식으로요.',
          likeCount: 12,
          createdAt: '2026-01-19T15:00:00',
          isEdited: false,
        },
        {
          id: 5,
          postId: 2,
          author: { id: 15, name: '김개발', avatar: null },
          content: '저도 비슷한 문제로 고민했었는데, 이학습님 답변이 도움이 되네요!',
          likeCount: 3,
          createdAt: '2026-01-19T16:30:00',
          isEdited: false,
        },
        {
          id: 6,
          postId: 2,
          author: { id: 14, name: '정학습', avatar: null },
          content: '이학습님 답변 감사합니다! 덕분에 해결했습니다.',
          likeCount: 2,
          createdAt: '2026-01-19T17:00:00',
          isEdited: false,
        },
      ],
      // Post 3: AWS 스터디 그룹 모집합니다 (정학습 작성)
      3: [
        {
          id: 7,
          postId: 3,
          author: { id: 17, name: '박코딩', avatar: null },
          content: '저도 참여하고 싶습니다! AWS 자격증 준비 중인데 같이 공부하면 좋겠어요.',
          likeCount: 4,
          createdAt: '2026-01-18T10:00:00',
          isEdited: false,
        },
        {
          id: 8,
          postId: 3,
          author: { id: 15, name: '김개발', avatar: null },
          content: '스터디 일정이 어떻게 되나요? 평일 저녁이면 참여 가능합니다.',
          likeCount: 2,
          createdAt: '2026-01-18T11:30:00',
          isEdited: false,
        },
        {
          id: 9,
          postId: 3,
          author: { id: 14, name: '정학습', avatar: null },
          content: '신청 감사합니다! 평일 저녁 8시로 진행 예정이에요. 곧 오픈채팅방 링크 공유드릴게요.',
          likeCount: 3,
          createdAt: '2026-01-18T12:00:00',
          isEdited: false,
        },
      ],
      // Post 4: React 기초 과정 수강 후기 (정학습 작성)
      4: [
        {
          id: 10,
          postId: 4,
          author: { id: 15, name: '김개발', avatar: null },
          content: '저도 이 과정 듣고 있는데 정말 좋아요! 후기 공감합니다.',
          likeCount: 6,
          createdAt: '2026-01-15T17:30:00',
          isEdited: false,
        },
        {
          id: 11,
          postId: 4,
          author: { id: 16, name: '이학습', avatar: null },
          content: '심화 내용은 React 고급 과정에서 다룬다고 하더라고요. 추천드려요!',
          likeCount: 4,
          createdAt: '2026-01-15T18:00:00',
          isEdited: false,
        },
      ],
      // Post 5: 프론트엔드 개발자 면접 준비 팁 (정학습 작성)
      5: [
        {
          id: 12,
          postId: 5,
          author: { id: 16, name: '이학습', avatar: null },
          content: '면접 준비에 큰 도움이 되었습니다! 특히 기술 면접 부분 정리가 좋네요.',
          likeCount: 15,
          createdAt: '2026-01-10T14:00:00',
          isEdited: false,
        },
        {
          id: 13,
          postId: 5,
          author: { id: 17, name: '박코딩', avatar: null },
          content: '과제 전형 팁도 공유해주실 수 있나요?',
          likeCount: 7,
          createdAt: '2026-01-10T15:30:00',
          isEdited: false,
        },
        {
          id: 14,
          postId: 5,
          author: { id: 14, name: '정학습', avatar: null },
          content: '과제 전형 팁은 따로 글 작성해볼게요! 관심 가져주셔서 감사합니다.',
          likeCount: 5,
          createdAt: '2026-01-10T16:00:00',
          isEdited: false,
        },
      ],
      // Post 6: Next.js 13 App Router 사용 후기 (김개발 작성)
      6: [
        {
          id: 15,
          postId: 6,
          author: { id: 14, name: '정학습', avatar: null },
          content: '저도 App Router 사용 중인데, 서버 컴포넌트 개념이 처음엔 어렵더라고요.',
          likeCount: 4,
          createdAt: '2026-01-25T10:30:00',
          isEdited: false,
        },
        {
          id: 16,
          postId: 6,
          author: { id: 16, name: '이학습', avatar: null },
          content: 'use client 지시어 사용할 때 팁이 있을까요?',
          likeCount: 2,
          createdAt: '2026-01-25T11:00:00',
          isEdited: false,
        },
      ],
      // Post 7: Zustand vs Redux 질문 (이학습 작성)
      7: [
        {
          id: 17,
          postId: 7,
          author: { id: 14, name: '정학습', avatar: null },
          content: '프로젝트 규모가 작으면 Zustand, 크고 복잡하면 Redux Toolkit 추천드려요!',
          likeCount: 18,
          createdAt: '2026-01-24T15:00:00',
          isEdited: false,
        },
        {
          id: 18,
          postId: 7,
          author: { id: 15, name: '김개발', avatar: null },
          content: '저희 팀은 Zustand로 마이그레이션했는데 코드량이 확 줄었어요.',
          likeCount: 10,
          createdAt: '2026-01-24T16:00:00',
          isEdited: false,
        },
      ],
      // Post 8: TypeScript 스터디 모집 (박코딩 작성)
      8: [
        {
          id: 19,
          postId: 8,
          author: { id: 14, name: '정학습', avatar: null },
          content: '참여 희망합니다! TypeScript 고급 패턴 같이 공부하고 싶어요.',
          likeCount: 3,
          createdAt: '2026-01-23T11:00:00',
          isEdited: false,
        },
        {
          id: 20,
          postId: 8,
          author: { id: 16, name: '이학습', avatar: null },
          content: '아직 자리 있나요? 저도 신청하고 싶습니다.',
          likeCount: 2,
          createdAt: '2026-01-23T13:00:00',
          isEdited: false,
        },
      ],
    };

    const comments = commentsByPost[postId] || [
      {
        id: 100,
        postId,
        author: { id: 15, name: '김개발', avatar: null },
        content: '좋은 글 감사합니다!',
        likeCount: 2,
        createdAt: '2026-01-28T10:00:00',
        isEdited: false,
      },
    ];

    // CommentListResponse 형식으로 반환
    return HttpResponse.json(apiResponse({
      comments,
      totalCount: comments.length,
      page: 0,
      pageSize: 20,
      totalPages: 1,
    }));
  }),

  // 댓글 작성
  http.post('/api/community/posts/:id/comments', async ({ params, request }) => {
    await delay(30);
    const postId = Number(params.id);
    const body = await request.json() as { content: string };
    return HttpResponse.json(apiResponse({
      id: 100,
      postId,
      authorId: 14,
      authorName: '정학습',
      content: body.content,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      isEdited: false,
    }), { status: 201 });
  }),

  // ========== Course Reviews (수강평) ==========
  http.get('/api/reviews', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');

    // 헤더에서 tenantId 추출
    const authHeader = request.headers.get('Authorization');
    const tokenMatch = authHeader?.match(/mock-access-token-(\d+)-/);
    let tenantId: number | null = null;
    if (tokenMatch) {
      const userId = Number.parseInt(tokenMatch[1], 10);
      const user = mockUserDetails[userId];
      tenantId = user?.tenantId ?? null;
    }

    let reviews = getCourseReviewsByTenant(tenantId);
    if (courseId) {
      reviews = reviews.filter(r => r.courseId === Number(courseId));
    }
    return HttpResponse.json(apiResponse(paginatedResponse(reviews)));
  }),

  http.get('/api/reviews/:id', async ({ params }) => {
    await delay(30);
    const review = mockCourseReviews.find(r => r.id === Number(params.id));
    if (!review) {
      return HttpResponse.json(
        errorResponse('수강평을 찾을 수 없습니다.', 'REVIEW_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse(review));
  }),

  http.get('/api/courses/:courseId/reviews', async ({ params }) => {
    await delay(30);
    const courseId = Number(params.courseId);
    const reviews = getCourseReviewsByCourse(courseId);
    return HttpResponse.json(apiResponse(paginatedResponse(reviews)));
  }),

  http.post('/api/reviews', async ({ request }) => {
    await delay(50);
    const body = await request.json() as {
      courseId: number;
      courseTimeId: number;
      rating: number;
      title: string;
      content: string;
    };
    const newReview = {
      id: mockCourseReviews.length + 1,
      tenantId: 1,
      courseId: body.courseId,
      courseTimeId: body.courseTimeId,
      courseTitle: 'React 기초부터 실전까지',
      userId: 14,
      userName: '정학습',
      userProfileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=정학습',
      rating: body.rating,
      title: body.title,
      content: body.content,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(apiResponse(newReview), { status: 201 });
  }),

  http.put('/api/reviews/:id', async ({ params, request }) => {
    await delay(50);
    const reviewId = Number(params.id);
    const body = await request.json() as { rating?: number; title?: string; content?: string };
    const review = mockCourseReviews.find(r => r.id === reviewId);
    if (!review) {
      return HttpResponse.json(
        errorResponse('수강평을 찾을 수 없습니다.', 'REVIEW_NOT_FOUND'),
        { status: 404 }
      );
    }
    const updatedReview = {
      ...review,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(apiResponse(updatedReview));
  }),

  http.delete('/api/reviews/:id', async ({ params }) => {
    await delay(50);
    const reviewId = Number(params.id);
    const review = mockCourseReviews.find(r => r.id === reviewId);
    if (!review) {
      return HttpResponse.json(
        errorResponse('수강평을 찾을 수 없습니다.', 'REVIEW_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({ message: '수강평이 삭제되었습니다.' }));
  }),

  // 수강평 도움됨
  http.post('/api/reviews/:id/helpful', async ({ params }) => {
    await delay(30);
    const reviewId = Number(params.id);
    const review = mockCourseReviews.find(r => r.id === reviewId);
    if (!review) {
      return HttpResponse.json(
        errorResponse('수강평을 찾을 수 없습니다.', 'REVIEW_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({ helpful: true, helpfulCount: review.helpfulCount + 1 }));
  }),

  // ========== Departments ==========
  http.get('/api/departments', async () => {
    await delay(30);
    const departments = [
      { id: 1, name: '경영지원팀', code: 'MGT', description: '경영 지원 업무', parentId: null, parentName: null, managerId: 10, managerName: '김테넌트', sortOrder: 1, isActive: true, memberCount: 3, children: [], createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00' },
      { id: 2, name: '교육운영팀', code: 'EDU_OPS', description: '교육 과정 운영', parentId: null, parentName: null, managerId: 11, managerName: '이운영', sortOrder: 2, isActive: true, memberCount: 4, children: [], createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00' },
      { id: 3, name: '교육개발팀', code: 'EDU_DEV', description: '교육 콘텐츠 개발', parentId: null, parentName: null, managerId: 12, managerName: '박강사', sortOrder: 3, isActive: true, memberCount: 5, children: [], createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00' },
      { id: 4, name: '개발팀', code: 'DEV', description: '시스템 개발', parentId: null, parentName: null, managerId: 17, managerName: '박코딩', sortOrder: 4, isActive: true, memberCount: 6, children: [], createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00' },
      { id: 5, name: '마케팅팀', code: 'MKT', description: '마케팅 및 홍보', parentId: null, parentName: null, managerId: 39, managerName: '남마케터', sortOrder: 5, isActive: true, memberCount: 3, children: [], createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00' },
    ];
    return HttpResponse.json(apiResponse(departments));
  }),

  http.get('/api/departments/tree', async () => {
    await delay(30);
    const departmentTree = [
      {
        id: 1, name: '경영지원팀', code: 'MGT', description: '경영 지원 업무', parentId: null, parentName: null, managerId: 10, managerName: '김테넌트', sortOrder: 1, isActive: true, memberCount: 3, createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00',
        children: [],
      },
      {
        id: 2, name: '교육운영팀', code: 'EDU_OPS', description: '교육 과정 운영', parentId: null, parentName: null, managerId: 11, managerName: '이운영', sortOrder: 2, isActive: true, memberCount: 4, createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00',
        children: [],
      },
      {
        id: 3, name: '교육개발팀', code: 'EDU_DEV', description: '교육 콘텐츠 개발', parentId: null, parentName: null, managerId: 12, managerName: '박강사', sortOrder: 3, isActive: true, memberCount: 5, createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00',
        children: [],
      },
      {
        id: 4, name: '개발팀', code: 'DEV', description: '시스템 개발', parentId: null, parentName: null, managerId: 17, managerName: '박코딩', sortOrder: 4, isActive: true, memberCount: 6, createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00',
        children: [
          { id: 6, name: '프론트엔드팀', code: 'FE', description: '프론트엔드 개발', parentId: 4, parentName: '개발팀', managerId: null, managerName: null, sortOrder: 1, isActive: true, memberCount: 3, children: [], createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00' },
          { id: 7, name: '백엔드팀', code: 'BE', description: '백엔드 개발', parentId: 4, parentName: '개발팀', managerId: null, managerName: null, sortOrder: 2, isActive: true, memberCount: 3, children: [], createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00' },
        ],
      },
      {
        id: 5, name: '마케팅팀', code: 'MKT', description: '마케팅 및 홍보', parentId: null, parentName: null, managerId: 39, managerName: '남마케터', sortOrder: 5, isActive: true, memberCount: 3, createdAt: '2025-12-01T00:00:00', updatedAt: '2025-12-01T00:00:00',
        children: [],
      },
    ];
    return HttpResponse.json(apiResponse(departmentTree));
  }),

  // 부서 멤버 조회
  http.get('/api/departments/:id/members', async ({ params }) => {
    await delay(30);
    const departmentId = Number(params.id);
    // mockUserDetails에서 해당 부서 사용자 필터링
    const members = Object.values(mockUserDetails)
      .filter(user => user.departmentId === departmentId && user.tenantId === 1)
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: null,
        position: user.position,
        role: user.currentRole,
      }));
    return HttpResponse.json(apiResponse(members));
  }),

  // 부서에 배정 가능한 멤버 조회
  http.get('/api/departments/:id/available-members', async ({ params }) => {
    await delay(30);
    const departmentId = Number(params.id);
    // mockUserDetails에서 다른 부서 또는 부서 없는 사용자 필터링
    const availableMembers = Object.values(mockUserDetails)
      .filter(user => user.departmentId !== departmentId && user.tenantId === 1)
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: null,
        position: user.position,
        role: user.currentRole,
      }));
    return HttpResponse.json(apiResponse(availableMembers));
  }),

  // ========== Tenants (SA) ==========
  http.get('/api/tenants', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse(mockTenants)));
  }),

  http.get('/api/tenants/:id', async ({ params }) => {
    await delay(30);
    const tenant = mockTenants.find(t => t.id === Number(params.id));
    if (!tenant) {
      return HttpResponse.json(
        errorResponse('테넌트를 찾을 수 없습니다.', 'TENANT_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse(tenant));
  }),

  http.post('/api/tenants', async ({ request }) => {
    await delay(50);
    const body = await request.json() as { name: string; subdomain: string; plan?: string };
    const newTenant = {
      id: mockTenants.length + 1,
      name: body.name,
      subdomain: body.subdomain,
      customDomain: null,
      status: 'ACTIVE',
      plan: body.plan || 'BASIC',
      userCount: 0,
      maxUsers: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branding: {
        primaryColor: '#6778ff',
        secondaryColor: '#a855f7',
        logoUrl: null,
      },
    };
    return HttpResponse.json(apiResponse(newTenant), { status: 201 });
  }),

  http.put('/api/tenants/:id', async ({ params, request }) => {
    await delay(30);
    const tenant = mockTenants.find(t => t.id === Number(params.id));
    if (!tenant) {
      return HttpResponse.json(
        errorResponse('테넌트를 찾을 수 없습니다.', 'TENANT_NOT_FOUND'),
        { status: 404 }
      );
    }
    const body = await request.json() as Partial<typeof tenant>;
    const updatedTenant = { ...tenant, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(apiResponse(updatedTenant));
  }),

  http.delete('/api/tenants/:id', async ({ params }) => {
    await delay(30);
    const tenant = mockTenants.find(t => t.id === Number(params.id));
    if (!tenant) {
      return HttpResponse.json(
        errorResponse('테넌트를 찾을 수 없습니다.', 'TENANT_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({ message: '테넌트가 삭제되었습니다.' }));
  }),

  // 테넌트별 사용자 목록 (SA용)
  http.get('/api/tenants/:id/users', async ({ params }) => {
    await delay(30);
    const tenantId = Number(params.id);
    const users = getUsersByTenant(tenantId);
    return HttpResponse.json(apiResponse(paginatedResponse(users)));
  }),

  // 테넌트 통계 (SA용)
  http.get('/api/tenants/:id/stats', async ({ params }) => {
    await delay(30);
    const tenant = mockTenants.find(t => t.id === Number(params.id));
    if (!tenant) {
      return HttpResponse.json(
        errorResponse('테넌트를 찾을 수 없습니다.', 'TENANT_NOT_FOUND'),
        { status: 404 }
      );
    }
    return HttpResponse.json(apiResponse({
      userCount: tenant.userCount,
      maxUsers: tenant.maxUsers,
      courseCount: 12,
      activeEnrollments: 89,
      completionRate: 72.5,
    }));
  }),

  // ========== Instructor Assignments (강사 배정 관리) ==========

  // 전체 강사 배정 목록 조회 (TO용)
  http.get('/api/instructor-assignments', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;
    const keyword = url.searchParams.get('keyword') || '';
    const role = url.searchParams.get('role') || '';
    const status = url.searchParams.get('status') || '';

    // Mock 강사 배정 데이터 생성
    // MZC 강사: 12(박강사), 13(최설계), 34(조콘텐츠), 35(배강사)
    // Samsung 강사: 22(윤강사), 23(장설계)
    const mockInstructorAssignments = [
      // MZC 아카데미 배정
      { id: 1, instructorId: 12, courseTimeId: 1, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-10T10:00:00', createdAt: '2026-01-10T10:00:00' },
      { id: 2, instructorId: 13, courseTimeId: 1, role: 'SUB' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-10T11:00:00', createdAt: '2026-01-10T11:00:00' },
      { id: 3, instructorId: 12, courseTimeId: 2, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-12T09:00:00', createdAt: '2026-01-12T09:00:00' },
      { id: 4, instructorId: 35, courseTimeId: 3, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-13T10:00:00', createdAt: '2026-01-13T10:00:00' },
      { id: 5, instructorId: 34, courseTimeId: 3, role: 'ASSISTANT' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-13T10:30:00', createdAt: '2026-01-13T10:30:00' },
      { id: 6, instructorId: 12, courseTimeId: 4, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-14T09:00:00', createdAt: '2026-01-14T09:00:00' },
      { id: 7, instructorId: 13, courseTimeId: 5, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-15T10:00:00', createdAt: '2026-01-15T10:00:00' },
      { id: 8, instructorId: 35, courseTimeId: 6, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-16T09:00:00', createdAt: '2026-01-16T09:00:00' },
      { id: 9, instructorId: 12, courseTimeId: 7, role: 'MAIN' as const, status: 'REPLACED' as const, assignedAt: '2025-12-01T10:00:00', createdAt: '2025-12-01T10:00:00' },
      { id: 10, instructorId: 35, courseTimeId: 7, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-05T10:00:00', createdAt: '2026-01-05T10:00:00' },
      { id: 11, instructorId: 34, courseTimeId: 8, role: 'MAIN' as const, status: 'CANCELLED' as const, assignedAt: '2025-11-20T10:00:00', createdAt: '2025-11-20T10:00:00' },
      // Samsung 러닝센터 배정
      { id: 12, instructorId: 22, courseTimeId: 101, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-08T09:00:00', createdAt: '2026-01-08T09:00:00' },
      { id: 13, instructorId: 23, courseTimeId: 101, role: 'SUB' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-08T09:30:00', createdAt: '2026-01-08T09:30:00' },
      { id: 14, instructorId: 22, courseTimeId: 102, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-09T10:00:00', createdAt: '2026-01-09T10:00:00' },
      { id: 15, instructorId: 23, courseTimeId: 103, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-10T09:00:00', createdAt: '2026-01-10T09:00:00' },
      { id: 16, instructorId: 22, courseTimeId: 104, role: 'MAIN' as const, status: 'ACTIVE' as const, assignedAt: '2026-01-11T09:00:00', createdAt: '2026-01-11T09:00:00' },
    ];

    // 강사 정보, 차수 정보, 프로그램 정보 추가
    let assignments = mockInstructorAssignments.map(a => {
      const instructor = mockUserDetails[a.instructorId];
      const courseTime = mockCourseTimes.find(ct => ct.id === a.courseTimeId);
      return {
        id: a.id,
        instructor: instructor ? {
          id: instructor.id,
          name: instructor.name,
          email: instructor.email,
        } : { id: a.instructorId, name: `강사 ${a.instructorId}`, email: '' },
        courseTime: courseTime ? {
          id: courseTime.id,
          title: courseTime.title,
          startDate: courseTime.classStartDate,
          endDate: courseTime.classEndDate,
        } : { id: a.courseTimeId, title: `차수 ${a.courseTimeId}`, startDate: '', endDate: '' },
        program: courseTime?.program ? {
          id: courseTime.program.id,
          title: courseTime.program.title,
        } : { id: 0, title: '알 수 없음' },
        role: a.role,
        status: a.status,
        assignedAt: a.assignedAt,
        createdAt: a.createdAt,
      };
    });

    // 키워드 검색 (강사명, 차수명, 과정명)
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      assignments = assignments.filter(a =>
        a.instructor.name.toLowerCase().includes(lowerKeyword) ||
        a.courseTime.title.toLowerCase().includes(lowerKeyword) ||
        a.program.title.toLowerCase().includes(lowerKeyword)
      );
    }

    // 역할 필터
    if (role) {
      assignments = assignments.filter(a => a.role === role);
    }

    // 상태 필터
    if (status) {
      assignments = assignments.filter(a => a.status === status);
    }

    // 페이지네이션
    const totalElements = assignments.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const content = assignments.slice(start, start + size);

    return HttpResponse.json(apiResponse({
      content,
      totalElements,
      totalPages,
      size,
      number: page,
    }));
  }),

  // 강사 배정 생성
  http.post('/api/times/:timeId/instructors', async ({ params, request }) => {
    await delay(50);
    const timeId = Number(params.timeId);
    const body = await request.json() as { userId: number; role: string; forceAssign?: boolean };

    const instructor = mockUserDetails[body.userId];
    const courseTime = mockCourseTimes.find(ct => ct.id === timeId);

    const newAssignment = {
      id: Date.now(),
      timeId,
      userId: body.userId,
      userName: instructor?.name || `사용자 ${body.userId}`,
      userEmail: instructor?.email || '',
      role: body.role,
      status: 'ACTIVE',
      assignedAt: new Date().toISOString(),
      courseTimeTitle: courseTime?.title || '',
    };

    return HttpResponse.json(apiResponse(newAssignment), { status: 201 });
  }),

  // 차수별 강사 목록 조회
  http.get('/api/times/:timeId/instructors', async ({ params }) => {
    await delay(30);
    const timeId = Number(params.timeId);

    // 해당 차수에 배정된 강사 mock 데이터
    const assignmentsByTime: Record<number, Array<{ id: number; userId: number; role: string; status: string; assignedAt: string }>> = {
      1: [
        { id: 1, userId: 12, role: 'MAIN', status: 'ACTIVE', assignedAt: '2026-01-10T10:00:00' },
        { id: 2, userId: 13, role: 'SUB', status: 'ACTIVE', assignedAt: '2026-01-10T11:00:00' },
      ],
      2: [
        { id: 3, userId: 12, role: 'MAIN', status: 'ACTIVE', assignedAt: '2026-01-12T09:00:00' },
      ],
      3: [
        { id: 4, userId: 35, role: 'MAIN', status: 'ACTIVE', assignedAt: '2026-01-13T10:00:00' },
        { id: 5, userId: 34, role: 'ASSISTANT', status: 'ACTIVE', assignedAt: '2026-01-13T10:30:00' },
      ],
      101: [
        { id: 12, userId: 22, role: 'MAIN', status: 'ACTIVE', assignedAt: '2026-01-08T09:00:00' },
        { id: 13, userId: 23, role: 'SUB', status: 'ACTIVE', assignedAt: '2026-01-08T09:30:00' },
      ],
      102: [
        { id: 14, userId: 22, role: 'MAIN', status: 'ACTIVE', assignedAt: '2026-01-09T10:00:00' },
      ],
    };

    const assignments = assignmentsByTime[timeId] || [];

    const result = assignments.map(a => {
      const instructor = mockUserDetails[a.userId];
      return {
        id: a.id,
        timeId,
        userId: a.userId,
        userName: instructor?.name || `사용자 ${a.userId}`,
        userEmail: instructor?.email || '',
        role: a.role,
        status: a.status,
        assignedAt: a.assignedAt,
      };
    });

    return HttpResponse.json(apiResponse(result));
  }),

  // ========== Member Pools (회원 풀 관리) ==========

  // 전체 회원 풀 목록 조회
  http.get('/api/member-pools', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const isActive = url.searchParams.get('isActive');

    // Mock 회원 풀 데이터
    const mockMemberPools = [
      {
        id: 1,
        name: '전체 개발팀',
        description: '개발 관련 모든 직원을 대상으로 하는 회원 풀입니다.',
        conditions: {
          departmentIds: [3, 4],
          positions: [],
          jobTitles: ['개발자', '시니어 개발자', '주니어 개발자'],
          employeeStatuses: ['ACTIVE'],
        },
        memberCount: 25,
        isActive: true,
        sortOrder: 1,
        createdAt: '2026-01-05T10:00:00',
        updatedAt: '2026-01-20T14:30:00',
      },
      {
        id: 2,
        name: '신입사원 온보딩',
        description: '입사 1년 미만 신입사원 대상 교육 풀',
        conditions: {
          departmentIds: [],
          positions: ['사원'],
          jobTitles: [],
          employeeStatuses: ['ACTIVE'],
        },
        memberCount: 12,
        isActive: true,
        sortOrder: 2,
        createdAt: '2026-01-08T09:00:00',
        updatedAt: '2026-01-18T11:00:00',
      },
      {
        id: 3,
        name: '팀장/파트장급',
        description: '리더십 교육 대상자 풀',
        conditions: {
          departmentIds: [],
          positions: ['팀장', '파트장', '부장'],
          jobTitles: [],
          employeeStatuses: ['ACTIVE'],
        },
        memberCount: 8,
        isActive: true,
        sortOrder: 3,
        createdAt: '2026-01-10T15:00:00',
        updatedAt: '2026-01-15T09:30:00',
      },
      {
        id: 4,
        name: '클라우드 전환 대상',
        description: '클라우드 교육이 필요한 인프라/개발 담당자',
        conditions: {
          departmentIds: [4],
          positions: [],
          jobTitles: ['인프라 엔지니어', '백엔드 개발자', 'DevOps'],
          employeeStatuses: ['ACTIVE'],
        },
        memberCount: 15,
        isActive: true,
        sortOrder: 4,
        createdAt: '2026-01-12T11:00:00',
        updatedAt: '2026-01-22T16:45:00',
      },
      {
        id: 5,
        name: '마케팅팀 전체',
        description: '마케팅팀 소속 전 직원',
        conditions: {
          departmentIds: [5],
          positions: [],
          jobTitles: [],
          employeeStatuses: ['ACTIVE', 'ON_LEAVE'],
        },
        memberCount: 10,
        isActive: false,
        sortOrder: 5,
        createdAt: '2025-12-20T10:00:00',
        updatedAt: '2026-01-05T14:00:00',
      },
      {
        id: 6,
        name: '휴직자 복귀 대상',
        description: '복귀 예정 휴직자 교육 대상',
        conditions: {
          departmentIds: [],
          positions: [],
          jobTitles: [],
          employeeStatuses: ['ON_LEAVE'],
        },
        memberCount: 3,
        isActive: false,
        sortOrder: 6,
        createdAt: '2025-12-15T09:00:00',
        updatedAt: '2025-12-28T17:00:00',
      },
    ];

    let filtered = mockMemberPools;

    // 검색 필터
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(pool =>
        pool.name.toLowerCase().includes(lowerSearch) ||
        (pool.description && pool.description.toLowerCase().includes(lowerSearch))
      );
    }

    // 활성화 상태 필터
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filtered = filtered.filter(pool => pool.isActive === (isActive === 'true'));
    }

    return HttpResponse.json(apiResponse(filtered));
  }),

  // 회원 풀 상세 조회
  http.get('/api/member-pools/:id', async ({ params }) => {
    await delay(30);
    const poolId = Number(params.id);

    const mockMemberPools: Record<number, {
      id: number;
      name: string;
      description: string;
      conditions: { departmentIds: number[]; positions: string[]; jobTitles: string[]; employeeStatuses: string[] };
      memberCount: number;
      isActive: boolean;
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
    }> = {
      1: {
        id: 1,
        name: '전체 개발팀',
        description: '개발 관련 모든 직원을 대상으로 하는 회원 풀입니다.',
        conditions: {
          departmentIds: [3, 4],
          positions: [],
          jobTitles: ['개발자', '시니어 개발자', '주니어 개발자'],
          employeeStatuses: ['ACTIVE'],
        },
        memberCount: 25,
        isActive: true,
        sortOrder: 1,
        createdAt: '2026-01-05T10:00:00',
        updatedAt: '2026-01-20T14:30:00',
      },
      2: {
        id: 2,
        name: '신입사원 온보딩',
        description: '입사 1년 미만 신입사원 대상 교육 풀',
        conditions: {
          departmentIds: [],
          positions: ['사원'],
          jobTitles: [],
          employeeStatuses: ['ACTIVE'],
        },
        memberCount: 12,
        isActive: true,
        sortOrder: 2,
        createdAt: '2026-01-08T09:00:00',
        updatedAt: '2026-01-18T11:00:00',
      },
      3: {
        id: 3,
        name: '팀장/파트장급',
        description: '리더십 교육 대상자 풀',
        conditions: {
          departmentIds: [],
          positions: ['팀장', '파트장', '부장'],
          jobTitles: [],
          employeeStatuses: ['ACTIVE'],
        },
        memberCount: 8,
        isActive: true,
        sortOrder: 3,
        createdAt: '2026-01-10T15:00:00',
        updatedAt: '2026-01-15T09:30:00',
      },
      4: {
        id: 4,
        name: '클라우드 전환 대상',
        description: '클라우드 교육이 필요한 인프라/개발 담당자',
        conditions: {
          departmentIds: [4],
          positions: [],
          jobTitles: ['인프라 엔지니어', '백엔드 개발자', 'DevOps'],
          employeeStatuses: ['ACTIVE'],
        },
        memberCount: 15,
        isActive: true,
        sortOrder: 4,
        createdAt: '2026-01-12T11:00:00',
        updatedAt: '2026-01-22T16:45:00',
      },
      5: {
        id: 5,
        name: '마케팅팀 전체',
        description: '마케팅팀 소속 전 직원',
        conditions: {
          departmentIds: [5],
          positions: [],
          jobTitles: [],
          employeeStatuses: ['ACTIVE', 'ON_LEAVE'],
        },
        memberCount: 10,
        isActive: false,
        sortOrder: 5,
        createdAt: '2025-12-20T10:00:00',
        updatedAt: '2026-01-05T14:00:00',
      },
      6: {
        id: 6,
        name: '휴직자 복귀 대상',
        description: '복귀 예정 휴직자 교육 대상',
        conditions: {
          departmentIds: [],
          positions: [],
          jobTitles: [],
          employeeStatuses: ['ON_LEAVE'],
        },
        memberCount: 3,
        isActive: false,
        sortOrder: 6,
        createdAt: '2025-12-15T09:00:00',
        updatedAt: '2025-12-28T17:00:00',
      },
    };

    const pool = mockMemberPools[poolId];
    if (!pool) {
      return HttpResponse.json(
        errorResponse('회원 풀을 찾을 수 없습니다.', 'MEMBER_POOL_NOT_FOUND'),
        { status: 404 }
      );
    }

    return HttpResponse.json(apiResponse(pool));
  }),

  // 회원 풀 멤버 목록 조회
  http.get('/api/member-pools/:id/members', async ({ params, request }) => {
    await delay(50);
    const poolId = Number(params.id);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;

    // 풀별 멤버 mock 데이터 (MZC 아카데미 사용자 기반)
    const membersByPool: Record<number, Array<{
      id: number;
      name: string;
      email: string;
      employeeNumber: string;
      departmentName: string;
      position: string;
      jobTitle: string;
      status: string;
    }>> = {
      1: [ // 전체 개발팀
        { id: 36, name: '송개발', email: 'dev2-mzc@demo.com', employeeNumber: 'MZC-036', departmentName: '개발팀', position: '사원', jobTitle: '백엔드 개발자', status: 'ACTIVE' },
        { id: 37, name: '윤풀스택', email: 'dev3-mzc@demo.com', employeeNumber: 'MZC-037', departmentName: '개발팀', position: '대리', jobTitle: '풀스택 개발자', status: 'ACTIVE' },
        { id: 38, name: '장데브옵스', email: 'dev4-mzc@demo.com', employeeNumber: 'MZC-038', departmentName: '개발팀', position: '과장', jobTitle: 'DevOps 엔지니어', status: 'ACTIVE' },
        { id: 39, name: '임인프라', email: 'dev5-mzc@demo.com', employeeNumber: 'MZC-039', departmentName: '개발팀', position: '대리', jobTitle: '인프라 엔지니어', status: 'ACTIVE' },
        { id: 40, name: '한클라우드', email: 'dev6-mzc@demo.com', employeeNumber: 'MZC-040', departmentName: '개발팀', position: '사원', jobTitle: '클라우드 엔지니어', status: 'ACTIVE' },
        { id: 34, name: '조콘텐츠', email: 'dev1-mzc@demo.com', employeeNumber: 'MZC-034', departmentName: '교육개발팀', position: '사원', jobTitle: '콘텐츠 개발자', status: 'ACTIVE' },
        { id: 13, name: '최설계', email: 'designer-mzc@demo.com', employeeNumber: 'MZC-013', departmentName: '교육개발팀', position: '대리', jobTitle: '교육 설계자', status: 'ACTIVE' },
      ],
      2: [ // 신입사원 온보딩
        { id: 36, name: '송개발', email: 'dev2-mzc@demo.com', employeeNumber: 'MZC-036', departmentName: '개발팀', position: '사원', jobTitle: '백엔드 개발자', status: 'ACTIVE' },
        { id: 40, name: '한클라우드', email: 'dev6-mzc@demo.com', employeeNumber: 'MZC-040', departmentName: '개발팀', position: '사원', jobTitle: '클라우드 엔지니어', status: 'ACTIVE' },
        { id: 43, name: '나프론트', email: 'user7-mzc@demo.com', employeeNumber: 'MZC-043', departmentName: '개발팀', position: '사원', jobTitle: '프론트엔드 개발자', status: 'ACTIVE' },
        { id: 34, name: '조콘텐츠', email: 'dev1-mzc@demo.com', employeeNumber: 'MZC-034', departmentName: '교육개발팀', position: '사원', jobTitle: '콘텐츠 개발자', status: 'ACTIVE' },
      ],
      3: [ // 팀장/파트장급
        { id: 11, name: '김운영', email: 'co-mzc@demo.com', employeeNumber: 'MZC-011', departmentName: '교육운영팀', position: '과장', jobTitle: '운영 관리자', status: 'ACTIVE' },
        { id: 44, name: '도백엔드', email: 'user8-mzc@demo.com', employeeNumber: 'MZC-044', departmentName: '개발팀', position: '과장', jobTitle: '백엔드 리드', status: 'ACTIVE' },
        { id: 45, name: '라기획', email: 'user9-mzc@demo.com', employeeNumber: 'MZC-045', departmentName: '마케팅팀', position: '과장', jobTitle: '기획 관리자', status: 'ACTIVE' },
      ],
      4: [ // 클라우드 전환 대상
        { id: 38, name: '장데브옵스', email: 'dev4-mzc@demo.com', employeeNumber: 'MZC-038', departmentName: '개발팀', position: '과장', jobTitle: 'DevOps 엔지니어', status: 'ACTIVE' },
        { id: 39, name: '임인프라', email: 'dev5-mzc@demo.com', employeeNumber: 'MZC-039', departmentName: '개발팀', position: '대리', jobTitle: '인프라 엔지니어', status: 'ACTIVE' },
        { id: 40, name: '한클라우드', email: 'dev6-mzc@demo.com', employeeNumber: 'MZC-040', departmentName: '개발팀', position: '사원', jobTitle: '클라우드 엔지니어', status: 'ACTIVE' },
        { id: 36, name: '송개발', email: 'dev2-mzc@demo.com', employeeNumber: 'MZC-036', departmentName: '개발팀', position: '사원', jobTitle: '백엔드 개발자', status: 'ACTIVE' },
      ],
      5: [ // 마케팅팀 전체
        { id: 45, name: '라기획', email: 'user9-mzc@demo.com', employeeNumber: 'MZC-045', departmentName: '마케팅팀', position: '과장', jobTitle: '기획 관리자', status: 'ACTIVE' },
        { id: 46, name: '마디자인', email: 'user10-mzc@demo.com', employeeNumber: 'MZC-046', departmentName: '마케팅팀', position: '대리', jobTitle: '디자이너', status: 'ACTIVE' },
      ],
      6: [], // 휴직자 복귀 대상 - 비어있음
    };

    const members = membersByPool[poolId] || [];
    const totalElements = members.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const content = members.slice(start, start + size);

    return HttpResponse.json(apiResponse({
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
      empty: content.length === 0,
    }));
  }),

  // 회원 풀 생성
  http.post('/api/member-pools', async ({ request }) => {
    await delay(50);
    const body = await request.json() as { name: string; description?: string; conditions: object; sortOrder?: number };

    const newPool = {
      id: Date.now(),
      name: body.name,
      description: body.description || '',
      conditions: body.conditions,
      memberCount: Math.floor(Math.random() * 20) + 5,
      isActive: true,
      sortOrder: body.sortOrder || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(apiResponse(newPool), { status: 201 });
  }),

  // 회원 풀 수정
  http.put('/api/member-pools/:id', async ({ params, request }) => {
    await delay(50);
    const poolId = Number(params.id);
    const body = await request.json() as { name?: string; description?: string; conditions?: object; sortOrder?: number };

    const updatedPool = {
      id: poolId,
      name: body.name || '회원 풀',
      description: body.description || '',
      conditions: body.conditions || { departmentIds: [], positions: [], jobTitles: [], employeeStatuses: [] },
      memberCount: Math.floor(Math.random() * 20) + 5,
      isActive: true,
      sortOrder: body.sortOrder || 0,
      createdAt: '2026-01-05T10:00:00',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(apiResponse(updatedPool));
  }),

  // 회원 풀 삭제
  http.delete('/api/member-pools/:id', async ({ params }) => {
    await delay(30);
    const poolId = Number(params.id);
    console.log('Deleting member pool:', poolId);
    return HttpResponse.json(apiResponse({ message: '회원 풀이 삭제되었습니다.' }));
  }),

  // 회원 풀 활성화
  http.post('/api/member-pools/:id/activate', async ({ params }) => {
    await delay(30);
    const poolId = Number(params.id);

    return HttpResponse.json(apiResponse({
      id: poolId,
      name: '회원 풀',
      description: '',
      conditions: { departmentIds: [], positions: [], jobTitles: [], employeeStatuses: [] },
      memberCount: 10,
      isActive: true,
      sortOrder: 0,
      createdAt: '2026-01-05T10:00:00',
      updatedAt: new Date().toISOString(),
    }));
  }),

  // 회원 풀 비활성화
  http.post('/api/member-pools/:id/deactivate', async ({ params }) => {
    await delay(30);
    const poolId = Number(params.id);

    return HttpResponse.json(apiResponse({
      id: poolId,
      name: '회원 풀',
      description: '',
      conditions: { departmentIds: [], positions: [], jobTitles: [], employeeStatuses: [] },
      memberCount: 10,
      isActive: false,
      sortOrder: 0,
      createdAt: '2026-01-05T10:00:00',
      updatedAt: new Date().toISOString(),
    }));
  }),

  // 멤버 미리보기
  http.post('/api/member-pools/preview', async ({ request }) => {
    await delay(50);
    const body = await request.json() as { condition: object; page?: number; size?: number };
    const page = body.page || 0;
    const size = body.size || 10;

    // 조건에 상관없이 기본 멤버 목록 반환
    const mockMembers = [
      { id: 36, name: '송개발', email: 'dev2-mzc@demo.com', employeeNumber: 'MZC-036', departmentName: '개발팀', position: '사원', jobTitle: '백엔드 개발자', status: 'ACTIVE' },
      { id: 37, name: '윤풀스택', email: 'dev3-mzc@demo.com', employeeNumber: 'MZC-037', departmentName: '개발팀', position: '대리', jobTitle: '풀스택 개발자', status: 'ACTIVE' },
      { id: 38, name: '장데브옵스', email: 'dev4-mzc@demo.com', employeeNumber: 'MZC-038', departmentName: '개발팀', position: '과장', jobTitle: 'DevOps 엔지니어', status: 'ACTIVE' },
    ];

    return HttpResponse.json(apiResponse({
      content: mockMembers.slice(page * size, (page + 1) * size),
      totalElements: mockMembers.length,
      totalPages: Math.ceil(mockMembers.length / size),
      size,
      number: page,
      first: page === 0,
      last: page >= Math.ceil(mockMembers.length / size) - 1,
      empty: mockMembers.length === 0,
    }));
  }),

  // 회원 풀 매칭 카운트
  http.get('/api/member-pools/:id/match-count', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ count: Math.floor(Math.random() * 30) + 5 }));
  }),

  // ========== Auto Enrollment Rules (자동 입과 규칙) ==========

  // 자동 입과 규칙 목록 조회 (페이지네이션)
  http.get('/api/auto-enrollment-rules', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;
    const keyword = url.searchParams.get('keyword') || '';
    const isActive = url.searchParams.get('isActive');
    const trigger = url.searchParams.get('trigger');

    // Mock 자동 입과 규칙 데이터
    const mockAutoEnrollmentRules = [
      {
        id: 1,
        name: '신입사원 필수 교육 자동 배정',
        description: '신규 입사자에게 온보딩 과정을 자동으로 배정합니다.',
        trigger: 'USER_JOIN' as const,
        departmentId: null,
        departmentName: null,
        courseTimeId: 2,
        courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 1기',
        isActive: true,
        sortOrder: 1,
        createdAt: '2026-01-05T10:00:00',
        updatedAt: '2026-01-20T14:30:00',
      },
      {
        id: 2,
        name: '개발팀 배정 시 React 교육',
        description: '개발팀 배정 시 React 기초 과정을 자동 배정합니다.',
        trigger: 'DEPARTMENT_ASSIGN' as const,
        departmentId: 4,
        departmentName: '개발팀',
        courseTimeId: 1,
        courseTimeTitle: 'React 기초부터 실전까지 - 2024년 1기',
        isActive: true,
        sortOrder: 2,
        createdAt: '2026-01-08T09:00:00',
        updatedAt: '2026-01-18T11:00:00',
      },
      {
        id: 3,
        name: '교육개발팀 배정 시 콘텐츠 제작 교육',
        description: '교육개발팀 배정자에게 콘텐츠 제작 과정을 배정합니다.',
        trigger: 'DEPARTMENT_ASSIGN' as const,
        departmentId: 3,
        departmentName: '교육개발팀',
        courseTimeId: 5,
        courseTimeTitle: 'React 기초부터 실전까지 - 2024년 3기',
        isActive: true,
        sortOrder: 3,
        createdAt: '2026-01-10T15:00:00',
        updatedAt: '2026-01-15T09:30:00',
      },
      {
        id: 4,
        name: '리더 승진 시 리더십 교육',
        description: '팀장/파트장 역할 변경 시 리더십 과정을 배정합니다.',
        trigger: 'ROLE_CHANGE' as const,
        departmentId: null,
        departmentName: null,
        courseTimeId: 3,
        courseTimeTitle: 'AWS 클라우드 입문 - 2024년 1기',
        isActive: true,
        sortOrder: 4,
        createdAt: '2026-01-12T11:00:00',
        updatedAt: '2026-01-22T16:45:00',
      },
      {
        id: 5,
        name: '마케팅팀 필수 교육',
        description: '마케팅팀 배정 시 마케팅 기초 과정을 배정합니다.',
        trigger: 'DEPARTMENT_ASSIGN' as const,
        departmentId: 5,
        departmentName: '마케팅팀',
        courseTimeId: 4,
        courseTimeTitle: 'Python 데이터 분석 - 2024년 1기',
        isActive: false,
        sortOrder: 5,
        createdAt: '2025-12-20T10:00:00',
        updatedAt: '2026-01-05T14:00:00',
      },
      {
        id: 6,
        name: '전사원 보안 교육',
        description: '신규 입사자에게 정보보안 교육을 필수로 배정합니다.',
        trigger: 'USER_JOIN' as const,
        departmentId: null,
        departmentName: null,
        courseTimeId: 6,
        courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 2기',
        isActive: false,
        sortOrder: 6,
        createdAt: '2025-12-15T09:00:00',
        updatedAt: '2025-12-28T17:00:00',
      },
    ];

    let filtered = mockAutoEnrollmentRules;

    // 키워드 검색
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(rule =>
        rule.name.toLowerCase().includes(lowerKeyword) ||
        (rule.description && rule.description.toLowerCase().includes(lowerKeyword))
      );
    }

    // 활성화 상태 필터
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filtered = filtered.filter(rule => rule.isActive === (isActive === 'true'));
    }

    // 트리거 필터
    if (trigger) {
      filtered = filtered.filter(rule => rule.trigger === trigger);
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const content = filtered.slice(start, start + size);

    return HttpResponse.json(apiResponse({
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
      empty: content.length === 0,
    }));
  }),

  // 활성 자동 입과 규칙 조회
  http.get('/api/auto-enrollment-rules/active', async () => {
    await delay(30);

    const activeRules = [
      {
        id: 1,
        name: '신입사원 필수 교육 자동 배정',
        description: '신규 입사자에게 온보딩 과정을 자동으로 배정합니다.',
        trigger: 'USER_JOIN',
        departmentId: null,
        departmentName: null,
        courseTimeId: 2,
        courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 1기',
        isActive: true,
        sortOrder: 1,
        createdAt: '2026-01-05T10:00:00',
        updatedAt: '2026-01-20T14:30:00',
      },
      {
        id: 2,
        name: '개발팀 배정 시 React 교육',
        description: '개발팀 배정 시 React 기초 과정을 자동 배정합니다.',
        trigger: 'DEPARTMENT_ASSIGN',
        departmentId: 4,
        departmentName: '개발팀',
        courseTimeId: 1,
        courseTimeTitle: 'React 기초부터 실전까지 - 2024년 1기',
        isActive: true,
        sortOrder: 2,
        createdAt: '2026-01-08T09:00:00',
        updatedAt: '2026-01-18T11:00:00',
      },
      {
        id: 3,
        name: '교육개발팀 배정 시 콘텐츠 제작 교육',
        description: '교육개발팀 배정자에게 콘텐츠 제작 과정을 배정합니다.',
        trigger: 'DEPARTMENT_ASSIGN',
        departmentId: 3,
        departmentName: '교육개발팀',
        courseTimeId: 5,
        courseTimeTitle: 'React 기초부터 실전까지 - 2024년 3기',
        isActive: true,
        sortOrder: 3,
        createdAt: '2026-01-10T15:00:00',
        updatedAt: '2026-01-15T09:30:00',
      },
      {
        id: 4,
        name: '리더 승진 시 리더십 교육',
        description: '팀장/파트장 역할 변경 시 리더십 과정을 배정합니다.',
        trigger: 'ROLE_CHANGE',
        departmentId: null,
        departmentName: null,
        courseTimeId: 3,
        courseTimeTitle: 'AWS 클라우드 입문 - 2024년 1기',
        isActive: true,
        sortOrder: 4,
        createdAt: '2026-01-12T11:00:00',
        updatedAt: '2026-01-22T16:45:00',
      },
    ];

    return HttpResponse.json(apiResponse(activeRules));
  }),

  // 트리거별 자동 입과 규칙 조회
  http.get('/api/auto-enrollment-rules/trigger/:trigger', async ({ params }) => {
    await delay(30);
    const trigger = params.trigger as string;

    const allRules = [
      { id: 1, name: '신입사원 필수 교육 자동 배정', trigger: 'USER_JOIN', courseTimeId: 2, courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 1기', isActive: true },
      { id: 2, name: '개발팀 배정 시 React 교육', trigger: 'DEPARTMENT_ASSIGN', departmentId: 4, departmentName: '개발팀', courseTimeId: 1, courseTimeTitle: 'React 기초부터 실전까지 - 2024년 1기', isActive: true },
      { id: 3, name: '교육개발팀 배정 시 콘텐츠 제작 교육', trigger: 'DEPARTMENT_ASSIGN', departmentId: 3, departmentName: '교육개발팀', courseTimeId: 5, courseTimeTitle: 'React 기초부터 실전까지 - 2024년 3기', isActive: true },
      { id: 4, name: '리더 승진 시 리더십 교육', trigger: 'ROLE_CHANGE', courseTimeId: 3, courseTimeTitle: 'AWS 클라우드 입문 - 2024년 1기', isActive: true },
      { id: 5, name: '마케팅팀 필수 교육', trigger: 'DEPARTMENT_ASSIGN', departmentId: 5, departmentName: '마케팅팀', courseTimeId: 4, courseTimeTitle: 'Python 데이터 분석 - 2024년 1기', isActive: false },
      { id: 6, name: '전사원 보안 교육', trigger: 'USER_JOIN', courseTimeId: 6, courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 2기', isActive: false },
    ];

    const filtered = allRules.filter(rule => rule.trigger === trigger);
    return HttpResponse.json(apiResponse(filtered));
  }),

  // 자동 입과 규칙 상세 조회
  http.get('/api/auto-enrollment-rules/:id', async ({ params }) => {
    await delay(30);
    const ruleId = Number(params.id);

    const mockRules: Record<number, {
      id: number;
      name: string;
      description: string | null;
      trigger: string;
      departmentId: number | null;
      departmentName: string | null;
      courseTimeId: number;
      courseTimeTitle: string;
      isActive: boolean;
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
    }> = {
      1: { id: 1, name: '신입사원 필수 교육 자동 배정', description: '신규 입사자에게 온보딩 과정을 자동으로 배정합니다.', trigger: 'USER_JOIN', departmentId: null, departmentName: null, courseTimeId: 2, courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 1기', isActive: true, sortOrder: 1, createdAt: '2026-01-05T10:00:00', updatedAt: '2026-01-20T14:30:00' },
      2: { id: 2, name: '개발팀 배정 시 React 교육', description: '개발팀 배정 시 React 기초 과정을 자동 배정합니다.', trigger: 'DEPARTMENT_ASSIGN', departmentId: 4, departmentName: '개발팀', courseTimeId: 1, courseTimeTitle: 'React 기초부터 실전까지 - 2024년 1기', isActive: true, sortOrder: 2, createdAt: '2026-01-08T09:00:00', updatedAt: '2026-01-18T11:00:00' },
      3: { id: 3, name: '교육개발팀 배정 시 콘텐츠 제작 교육', description: '교육개발팀 배정자에게 콘텐츠 제작 과정을 배정합니다.', trigger: 'DEPARTMENT_ASSIGN', departmentId: 3, departmentName: '교육개발팀', courseTimeId: 5, courseTimeTitle: 'React 기초부터 실전까지 - 2024년 3기', isActive: true, sortOrder: 3, createdAt: '2026-01-10T15:00:00', updatedAt: '2026-01-15T09:30:00' },
      4: { id: 4, name: '리더 승진 시 리더십 교육', description: '팀장/파트장 역할 변경 시 리더십 과정을 배정합니다.', trigger: 'ROLE_CHANGE', departmentId: null, departmentName: null, courseTimeId: 3, courseTimeTitle: 'AWS 클라우드 입문 - 2024년 1기', isActive: true, sortOrder: 4, createdAt: '2026-01-12T11:00:00', updatedAt: '2026-01-22T16:45:00' },
      5: { id: 5, name: '마케팅팀 필수 교육', description: '마케팅팀 배정 시 마케팅 기초 과정을 배정합니다.', trigger: 'DEPARTMENT_ASSIGN', departmentId: 5, departmentName: '마케팅팀', courseTimeId: 4, courseTimeTitle: 'Python 데이터 분석 - 2024년 1기', isActive: false, sortOrder: 5, createdAt: '2025-12-20T10:00:00', updatedAt: '2026-01-05T14:00:00' },
      6: { id: 6, name: '전사원 보안 교육', description: '신규 입사자에게 정보보안 교육을 필수로 배정합니다.', trigger: 'USER_JOIN', departmentId: null, departmentName: null, courseTimeId: 6, courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 2기', isActive: false, sortOrder: 6, createdAt: '2025-12-15T09:00:00', updatedAt: '2025-12-28T17:00:00' },
    };

    const rule = mockRules[ruleId];
    if (!rule) {
      return HttpResponse.json(
        errorResponse('자동 입과 규칙을 찾을 수 없습니다.', 'AUTO_ENROLLMENT_RULE_NOT_FOUND'),
        { status: 404 }
      );
    }

    return HttpResponse.json(apiResponse(rule));
  }),

  // 자동 입과 규칙 생성
  http.post('/api/auto-enrollment-rules', async ({ request }) => {
    await delay(50);
    const body = await request.json() as {
      name: string;
      description?: string;
      trigger: string;
      departmentId?: number;
      courseTimeId: number;
      sortOrder?: number;
    };

    const courseTime = mockCourseTimes.find(ct => ct.id === body.courseTimeId);

    const newRule = {
      id: Date.now(),
      name: body.name,
      description: body.description || null,
      trigger: body.trigger,
      departmentId: body.departmentId || null,
      departmentName: body.departmentId ? '개발팀' : null, // 간단히 처리
      courseTimeId: body.courseTimeId,
      courseTimeTitle: courseTime?.title || `차수 ${body.courseTimeId}`,
      isActive: true,
      sortOrder: body.sortOrder || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(apiResponse(newRule), { status: 201 });
  }),

  // 자동 입과 규칙 수정
  http.put('/api/auto-enrollment-rules/:id', async ({ params, request }) => {
    await delay(50);
    const ruleId = Number(params.id);
    const body = await request.json() as {
      name?: string;
      description?: string;
      trigger?: string;
      departmentId?: number;
      courseTimeId?: number;
      sortOrder?: number;
    };

    const courseTime = body.courseTimeId ? mockCourseTimes.find(ct => ct.id === body.courseTimeId) : null;

    const updatedRule = {
      id: ruleId,
      name: body.name || '자동 입과 규칙',
      description: body.description || null,
      trigger: body.trigger || 'USER_JOIN',
      departmentId: body.departmentId || null,
      departmentName: body.departmentId ? '개발팀' : null,
      courseTimeId: body.courseTimeId || 1,
      courseTimeTitle: courseTime?.title || '차수',
      isActive: true,
      sortOrder: body.sortOrder || 0,
      createdAt: '2026-01-05T10:00:00',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(apiResponse(updatedRule));
  }),

  // 자동 입과 규칙 삭제
  http.delete('/api/auto-enrollment-rules/:id', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({ message: '자동 입과 규칙이 삭제되었습니다.' }));
  }),

  // 자동 입과 규칙 활성화
  http.post('/api/auto-enrollment-rules/:id/activate', async ({ params }) => {
    await delay(30);
    const ruleId = Number(params.id);

    return HttpResponse.json(apiResponse({
      id: ruleId,
      name: '자동 입과 규칙',
      description: null,
      trigger: 'USER_JOIN',
      departmentId: null,
      departmentName: null,
      courseTimeId: 1,
      courseTimeTitle: 'React 기초부터 실전까지 - 2024년 1기',
      isActive: true,
      sortOrder: 0,
      createdAt: '2026-01-05T10:00:00',
      updatedAt: new Date().toISOString(),
    }));
  }),

  // 자동 입과 규칙 비활성화
  http.post('/api/auto-enrollment-rules/:id/deactivate', async ({ params }) => {
    await delay(30);
    const ruleId = Number(params.id);

    return HttpResponse.json(apiResponse({
      id: ruleId,
      name: '자동 입과 규칙',
      description: null,
      trigger: 'USER_JOIN',
      departmentId: null,
      departmentName: null,
      courseTimeId: 1,
      courseTimeTitle: 'React 기초부터 실전까지 - 2024년 1기',
      isActive: false,
      sortOrder: 0,
      createdAt: '2026-01-05T10:00:00',
      updatedAt: new Date().toISOString(),
    }));
  }),
];
