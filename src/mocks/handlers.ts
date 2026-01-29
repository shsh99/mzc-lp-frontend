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

  http.get('/api/public/course-times', async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourseTimes)));
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
    return HttpResponse.json(apiResponse(time || mockCourseTimes[0]));
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
  http.get('/api/wishlist', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse([]));
  }),

  http.get('/api/wishlist/count', async () => {
    await delay(10);
    return HttpResponse.json(apiResponse({ count: 0 }));
  }),

  http.get('/api/cart', async () => {
    await delay(30);
    return HttpResponse.json(apiResponse([]));
  }),

  http.get('/api/cart/count', async () => {
    await delay(10);
    return HttpResponse.json(apiResponse({ count: 0 }));
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
