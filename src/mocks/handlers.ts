import { http, HttpResponse, delay } from 'msw';
import {
  mockUsers,
  mockAuth,
  mockCredentials,
  mockUserDetails,
  mockCourses,
  mockCourseTimes,
  mockCategories,
  mockTenantSettings,
  mockBanners,
  mockTenantNotices,
  mockEnrollments,
  mockCertificates,
  mockCurriculum,
  mockTADashboard,
  mockSADashboard,
  mockTUDashboard,
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
  http.post('*/api/auth/login', async ({ request }) => {
    await delay(300);

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

      return HttpResponse.json(apiResponse({
        accessToken: `mock-access-token-${user.id}-${Date.now()}`,
        refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
        expiresIn: 900000,
        user,
      }));
    } catch {
      return HttpResponse.json(apiResponse(mockAuth.loginResponse));
    }
  }),

  http.post('*/api/auth/register', async () => {
    await delay(300);
    return HttpResponse.json(apiResponse({ message: '회원가입이 완료되었습니다.' }));
  }),

  http.post('*/api/auth/refresh', async () => {
    await delay(100);
    return HttpResponse.json(apiResponse(mockAuth.loginResponse));
  }),

  http.post('*/api/auth/switch-role', async ({ request }) => {
    await delay(100);
    const body = await request.json() as { role: string };
    return HttpResponse.json(apiResponse({
      ...mockAuth.loginResponse,
      user: { ...mockUsers.currentUser, currentRole: body.role },
    }));
  }),

  // ========== Users ==========
  http.get('*/api/users/me', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockUsers.currentUser));
  }),

  http.get('*/api/users/me/learning-stats', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockUsers.learningStats));
  }),

  http.get('*/api/users/me/enrollments', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockEnrollments)));
  }),

  http.get('*/api/users/me/certificates', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCertificates));
  }),

  http.get('*/api/users', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockUsers.users)));
  }),

  http.get('*/api/users/:id', async ({ params }) => {
    await delay(200);
    const user = mockUsers.users.find(u => u.id === Number(params.id));
    return HttpResponse.json(apiResponse(user || mockUsers.currentUser));
  }),

  // ========== Public APIs ==========
  http.get('*/api/public/tenants/branding', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.branding));
  }),

  http.get('*/api/public/course-times', async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourseTimes)));
  }),

  // ========== Tenant Settings ==========
  http.get('*/api/tenant/settings/branding', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.branding));
  }),

  http.get('*/api/tenant/settings/branding/extended', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.branding));
  }),

  http.get('*/api/tenant/settings/features', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.features));
  }),

  http.get('*/api/tenant/settings/features/public', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.features));
  }),

  http.get('*/api/tenant/settings/layout', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.layout));
  }),

  http.get('*/api/tenant/settings/layout/public', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.layout));
  }),

  http.get('*/api/tenant/settings/navigation', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.navigation));
  }),

  http.get('*/api/tenant/settings/navigation/public', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.navigation));
  }),

  // ========== Banners ==========
  http.get('*/api/banners', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockBanners));
  }),

  http.get('*/api/banners/public/displayable', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockBanners.filter(b => b.isActive)));
  }),

  // ========== Categories ==========
  http.get('*/api/categories', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCategories));
  }),

  http.get('*/api/tenant/categories', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCategories));
  }),

  http.get('*/api/tenant/categories/public', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCategories));
  }),

  // ========== Courses ==========
  http.get('*/api/courses', async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourses)));
  }),

  http.get('*/api/courses/my', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourses.slice(0, 3))));
  }),

  http.get('*/api/courses/:id', async ({ params }) => {
    await delay(200);
    const course = mockCourses.find(c => c.id === Number(params.id));
    return HttpResponse.json(apiResponse(course || mockCourses[0]));
  }),

  // ========== Course Times ==========
  http.get('*/api/times', async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourseTimes)));
  }),

  http.get('*/api/times/:id', async ({ params }) => {
    await delay(200);
    const time = mockCourseTimes.find(t => t.id === Number(params.id));
    return HttpResponse.json(apiResponse(time || mockCourseTimes[0]));
  }),

  // ========== Enrollments ==========
  http.get('*/api/enrollments', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockEnrollments)));
  }),

  http.get('*/api/enrollments/:id', async ({ params }) => {
    await delay(200);
    const enrollment = mockEnrollments.find(e => e.id === Number(params.id));
    return HttpResponse.json(apiResponse(enrollment || mockEnrollments[0]));
  }),

  http.get('*/api/enrollments/:id/curriculum', async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(mockCurriculum));
  }),

  http.post('*/api/enrollments', async () => {
    await delay(300);
    return HttpResponse.json(apiResponse({ id: 100, message: '수강 신청이 완료되었습니다.' }));
  }),

  // ========== Certificates ==========
  http.get('*/api/certificates', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCertificates));
  }),

  // ========== Tenant Notices ==========
  http.get('*/api/tenant/notices', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockTenantNotices)));
  }),

  http.get('*/api/tu/notices', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockTenantNotices)));
  }),

  http.get('*/api/tu/notices/count', async () => {
    await delay(100);
    return HttpResponse.json(apiResponse({ count: mockTenantNotices.length }));
  }),

  // ========== Dashboard ==========
  http.get('*/api/admin/dashboard/kpi', async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(mockTADashboard.kpi));
  }),

  http.get('*/api/sa/dashboard', async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(mockSADashboard));
  }),

  // ========== TU Dashboard ==========
  http.get('*/api/tu/dashboard', async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(mockTUDashboard));
  }),

  http.get('*/api/owners/me/stats', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTUDashboard.myLearning));
  }),

  // ========== Analytics ==========
  http.get('*/api/admin/analytics/logs', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse([])));
  }),

  http.get('*/api/admin/analytics/stats', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse({
      totalViews: 12345,
      uniqueUsers: 567,
      averageSessionTime: 1234,
    }));
  }),

  http.get('*/api/sa/analytics/logs', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse([])));
  }),

  // ========== Wishlist & Cart ==========
  http.get('*/api/wishlist', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse([]));
  }),

  http.get('*/api/wishlist/count', async () => {
    await delay(100);
    return HttpResponse.json(apiResponse({ count: 0 }));
  }),

  http.get('*/api/cart', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse([]));
  }),

  http.get('*/api/cart/count', async () => {
    await delay(100);
    return HttpResponse.json(apiResponse({ count: 0 }));
  }),

  // ========== Departments ==========
  http.get('*/api/departments', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse([
      { id: 1, name: '개발팀', code: 'DEV', memberCount: 15 },
      { id: 2, name: '마케팅팀', code: 'MKT', memberCount: 8 },
      { id: 3, name: '영업팀', code: 'SALES', memberCount: 12 },
      { id: 4, name: '인사팀', code: 'HR', memberCount: 5 },
    ]));
  }),

  http.get('*/api/departments/tree', async () => {
    await delay(200);
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
  http.get('*/api/tenants', async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse([
      { id: 1, name: 'Demo Company', subdomain: 'demo', status: 'ACTIVE', userCount: 1234 },
      { id: 2, name: 'Tech Corp', subdomain: 'tech', status: 'ACTIVE', userCount: 2345 },
      { id: 3, name: 'Edu Institute', subdomain: 'edu', status: 'ACTIVE', userCount: 3456 },
    ])));
  }),
];
