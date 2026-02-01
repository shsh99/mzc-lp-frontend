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
  mockTADashboard,
  mockSADashboard,
  mockTUDashboard,
  mockCODashboard,
} from './data';

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

// Course 백엔드 응답 형식으로 변환하는 헬퍼
const transformCourseToBackend = (course: (typeof mockCourses)[0]) => ({
  courseId: course.id,
  title: course.title,
  description: course.description,
  thumbnailUrl: course.thumbnailUrl,
  level: course.level,
  type: 'ONLINE',
  estimatedHours: Math.floor(course.duration / 60),
  categoryId: course.categoryId,
  tags: [],
  createdAt: course.createdAt,
  updatedAt: course.createdAt,
  // Mock 추가 필드 (프론트엔드에서 활용)
  rating: course.rating,
  reviewCount: course.reviewCount,
  enrollmentCount: course.enrollmentCount,
  instructorId: course.instructorId,
  instructorName: course.instructorName,
});

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

  http.get('/api/users', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse(mockUsers.users)));
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
  http.get('/api/courses', async () => {
    await delay(50);
    const transformedCourses = mockCourses.map(transformCourseToBackend);
    return HttpResponse.json(apiResponse(paginatedResponse(transformedCourses)));
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

  // ========== Course Times ==========
  http.get('/api/times', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourseTimes)));
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
    // BackendCourseTimeResponse 형식으로 반환
    return HttpResponse.json(apiResponse({
      id: time.id,
      title: time.title,
      programId: time.program?.id ?? null,
      programName: time.program?.title ?? null,
      classStartDate: time.classStartDate,
      classEndDate: time.classEndDate,
      snapshotId: time.id, // mock에서는 id를 사용
      courseTitle: time.program?.title ?? null,
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
  http.get('/api/admin/dashboard/kpi', async () => {
    await delay(50);
    // 새 구조 응답: userStats, programStats, enrollmentStats, dailyTrend
    return HttpResponse.json(apiResponse({
      userStats: mockTADashboard.userStats,
      programStats: mockTADashboard.programStats,
      enrollmentStats: mockTADashboard.enrollmentStats,
      dailyTrend: mockTADashboard.dailyTrend,
    }));
  }),

  // SA Dashboard (SYSTEM_ADMIN)
  http.get('/api/sa/dashboard', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(mockSADashboard));
  }),

  // CO Dashboard (OPERATOR)
  http.get('/api/operator/dashboard/tasks', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(mockCODashboard));
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
  http.get('/api/admin/analytics/logs', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse([])));
  }),

  http.get('/api/admin/analytics/stats', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse({
      totalViews: 12345,
      uniqueUsers: 567,
      averageSessionTime: 1234,
    }));
  }),

  http.get('/api/admin/analytics/recent', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse([]));
  }),

  http.get('/api/sa/analytics/logs', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse([])));
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
    return HttpResponse.json(apiResponse([
      { id: 1, name: '개발팀', code: 'DEV', memberCount: 15 },
      { id: 2, name: '마케팅팀', code: 'MKT', memberCount: 8 },
      { id: 3, name: '영업팀', code: 'SALES', memberCount: 12 },
      { id: 4, name: '인사팀', code: 'HR', memberCount: 5 },
    ]));
  }),

  http.get('/api/departments/tree', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse([
      {
        id: 1,
        name: '개발팀',
        code: 'DEV',
        children: [
          { id: 5, name: '프론트엔드팀', code: 'FE', children: [] },
          { id: 6, name: '백엔드팀', code: 'BE', children: [] },
        ],
      },
      { id: 2, name: '마케팅팀', code: 'MKT', children: [] },
      { id: 3, name: '영업팀', code: 'SALES', children: [] },
      { id: 4, name: '인사팀', code: 'HR', children: [] },
    ]));
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
];
