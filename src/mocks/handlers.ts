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
