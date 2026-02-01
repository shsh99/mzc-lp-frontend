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
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourses)));
  }),

  http.get('/api/courses/my', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourses.slice(0, 3))));
  }),

  http.get('/api/courses/:id', async ({ params }) => {
    await delay(30);
    const course = mockCourses.find(c => c.id === Number(params.id));
    return HttpResponse.json(apiResponse(course || mockCourses[0]));
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
    // 상세 정보 반환 (content 추가)
    return HttpResponse.json(apiResponse({
      ...notice,
      content: `<h2>${notice.title}</h2>
<p>안녕하세요, MZC Learn 관리팀입니다.</p>
<p>본 공지사항은 중요한 내용을 담고 있으니 반드시 확인해 주시기 바랍니다.</p>
<h3>주요 내용</h3>
<ul>
  <li>시스템 업데이트 및 새로운 기능 안내</li>
  <li>이용 정책 변경사항</li>
  <li>학습 관련 유용한 팁</li>
</ul>
<p>자세한 내용은 아래를 참고해 주세요.</p>
<p>감사합니다.</p>`,
      attachments: [],
      viewCount: Math.floor(Math.random() * 500) + 50,
    }));
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
  http.get('/api/community/posts', async ({ request }) => {
    await delay(30);
    // 헤더에서 tenantId 추출 (실제로는 토큰에서 추출)
    const authHeader = request.headers.get('Authorization');
    const tokenMatch = authHeader?.match(/mock-access-token-(\d+)-/);
    let tenantId: number | null = null;
    if (tokenMatch) {
      const userId = Number.parseInt(tokenMatch[1], 10);
      const user = mockUserDetails[userId];
      tenantId = user?.tenantId ?? null;
    }
    const posts = getCommunityPostsByTenant(tenantId);
    return HttpResponse.json(apiResponse(paginatedResponse(posts)));
  }),

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

  http.post('/api/community/posts', async ({ request }) => {
    await delay(50);
    const body = await request.json() as { title: string; content: string; boardType?: string };
    const newPost = {
      id: mockCommunityPosts.length + 1,
      tenantId: 1,
      boardType: body.boardType || 'FREE',
      title: body.title,
      content: body.content,
      authorId: 14,
      authorName: '정학습',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isPinned: false,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(apiResponse(newPost), { status: 201 });
  }),

  // 커뮤니티 카테고리 목록
  http.get('/api/community/categories', async () => {
    await delay(20);
    return HttpResponse.json(apiResponse([
      { id: 1, name: '자유게시판', code: 'FREE', description: '자유롭게 이야기를 나눠보세요', postCount: 156 },
      { id: 2, name: '질문과 답변', code: 'QNA', description: '학습 관련 질문을 올려주세요', postCount: 89 },
      { id: 3, name: '스터디 모집', code: 'STUDY', description: '함께 공부할 스터디원을 모집합니다', postCount: 34 },
      { id: 4, name: '취업/이직', code: 'CAREER', description: '취업 및 이직 관련 정보를 공유해요', postCount: 67 },
      { id: 5, name: '후기 공유', code: 'REVIEW', description: '강의 및 학습 후기를 공유해주세요', postCount: 45 },
    ]));
  }),

  // 내가 작성한 게시글
  http.get('/api/community/posts/me', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '10', 10);

    // 현재 사용자가 작성한 게시글만 필터링 (mock에서는 authorId: 14 사용)
    const myPosts = mockCommunityPosts.filter(p => p.authorId === 14);
    return HttpResponse.json(apiResponse(paginatedResponse(myPosts, page, size)));
  }),

  // 내가 댓글 단 게시글
  http.get('/api/community/posts/commented', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '10', 10);

    // mock 데이터: 일부 게시글에 댓글을 단 것으로 처리
    const commentedPosts = mockCommunityPosts.slice(0, 5).map(post => ({
      ...post,
      myCommentCount: Math.floor(Math.random() * 3) + 1,
      lastCommentedAt: '2026-01-28T14:30:00',
    }));
    return HttpResponse.json(apiResponse(paginatedResponse(commentedPosts, page, size)));
  }),

  // 인기 게시글
  http.get('/api/community/posts/popular', async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '10', 10);

    // 좋아요 순으로 정렬
    const popularPosts = [...mockCommunityPosts]
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 20);
    return HttpResponse.json(apiResponse(paginatedResponse(popularPosts, page, size)));
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

  // 게시글 댓글 목록
  http.get('/api/community/posts/:id/comments', async ({ params }) => {
    await delay(30);
    const postId = Number(params.id);
    return HttpResponse.json(apiResponse([
      {
        id: 1,
        postId,
        authorId: 15,
        authorName: '김개발',
        content: '좋은 정보 감사합니다! 많은 도움이 되었어요.',
        likeCount: 5,
        createdAt: '2026-01-28T10:30:00',
        isEdited: false,
      },
      {
        id: 2,
        postId,
        authorId: 16,
        authorName: '이학습',
        content: '저도 같은 고민이 있었는데, 이 글 보고 해결했습니다.',
        likeCount: 3,
        createdAt: '2026-01-28T11:15:00',
        isEdited: false,
      },
      {
        id: 3,
        postId,
        authorId: 14,
        authorName: '정학습',
        content: '댓글 감사합니다! 추가 질문 있으시면 편하게 남겨주세요.',
        likeCount: 2,
        createdAt: '2026-01-28T12:00:00',
        isEdited: true,
      },
    ]));
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
