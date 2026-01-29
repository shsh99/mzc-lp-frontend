import { http, HttpResponse, delay } from 'msw';
import {
  mockUsers,
  mockAuth,
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

const API_BASE = '/api';

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

export const handlers = [
  // ========== Auth ==========
  http.post(`${API_BASE}/auth/login`, async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(mockAuth.loginResponse));
  }),

  http.post(`${API_BASE}/auth/register`, async () => {
    await delay(300);
    return HttpResponse.json(apiResponse({ message: '회원가입이 완료되었습니다.' }));
  }),

  http.post(`${API_BASE}/auth/refresh`, async () => {
    await delay(100);
    return HttpResponse.json(apiResponse(mockAuth.loginResponse));
  }),

  http.post(`${API_BASE}/auth/switch-role`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as { role: string };
    return HttpResponse.json(apiResponse({
      ...mockAuth.loginResponse,
      user: { ...mockUsers.currentUser, currentRole: body.role },
    }));
  }),

  // ========== Users ==========
  http.get(`${API_BASE}/users/me`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockUsers.currentUser));
  }),

  http.get(`${API_BASE}/users/me/learning-stats`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockUsers.learningStats));
  }),

  http.get(`${API_BASE}/users/me/enrollments`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockEnrollments)));
  }),

  http.get(`${API_BASE}/users/me/certificates`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCertificates));
  }),

  http.get(`${API_BASE}/users`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockUsers.users)));
  }),

  http.get(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(200);
    const user = mockUsers.users.find(u => u.id === Number(params.id));
    return HttpResponse.json(apiResponse(user || mockUsers.currentUser));
  }),

  // ========== Tenant Settings ==========
  http.get(`${API_BASE}/tenant/settings/branding`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.branding));
  }),

  http.get(`${API_BASE}/tenant/settings/branding/extended`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.branding));
  }),

  http.get(`${API_BASE}/tenant/settings/features`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.features));
  }),

  http.get(`${API_BASE}/tenant/settings/features/public`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.features));
  }),

  http.get(`${API_BASE}/tenant/settings/layout`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.layout));
  }),

  http.get(`${API_BASE}/tenant/settings/layout/public`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.layout));
  }),

  http.get(`${API_BASE}/tenant/settings/navigation`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.navigation));
  }),

  http.get(`${API_BASE}/tenant/settings/navigation/public`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTenantSettings.navigation));
  }),

  // ========== Banners ==========
  http.get(`${API_BASE}/banners`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockBanners));
  }),

  http.get(`${API_BASE}/banners/public/displayable`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockBanners.filter(b => b.isActive)));
  }),

  // ========== Categories ==========
  http.get(`${API_BASE}/categories`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCategories));
  }),

  http.get(`${API_BASE}/tenant/categories`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCategories));
  }),

  http.get(`${API_BASE}/tenant/categories/public`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCategories));
  }),

  // ========== Courses ==========
  http.get(`${API_BASE}/courses`, async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourses)));
  }),

  http.get(`${API_BASE}/courses/my`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourses.slice(0, 3))));
  }),

  http.get(`${API_BASE}/courses/:id`, async ({ params }) => {
    await delay(200);
    const course = mockCourses.find(c => c.id === Number(params.id));
    return HttpResponse.json(apiResponse(course || mockCourses[0]));
  }),

  // ========== Course Times ==========
  http.get(`${API_BASE}/times`, async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(paginatedResponse(mockCourseTimes)));
  }),

  http.get(`${API_BASE}/times/:id`, async ({ params }) => {
    await delay(200);
    const time = mockCourseTimes.find(t => t.id === Number(params.id));
    return HttpResponse.json(apiResponse(time || mockCourseTimes[0]));
  }),

  // ========== Enrollments ==========
  http.get(`${API_BASE}/enrollments`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockEnrollments)));
  }),

  http.get(`${API_BASE}/enrollments/:id`, async ({ params }) => {
    await delay(200);
    const enrollment = mockEnrollments.find(e => e.id === Number(params.id));
    return HttpResponse.json(apiResponse(enrollment || mockEnrollments[0]));
  }),

  http.get(`${API_BASE}/enrollments/:id/curriculum`, async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(mockCurriculum));
  }),

  http.post(`${API_BASE}/enrollments`, async () => {
    await delay(300);
    return HttpResponse.json(apiResponse({ id: 100, message: '수강 신청이 완료되었습니다.' }));
  }),

  // ========== Certificates ==========
  http.get(`${API_BASE}/certificates`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockCertificates));
  }),

  // ========== Tenant Notices ==========
  http.get(`${API_BASE}/tenant/notices`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockTenantNotices)));
  }),

  http.get(`${API_BASE}/tu/notices`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse(mockTenantNotices)));
  }),

  http.get(`${API_BASE}/tu/notices/count`, async () => {
    await delay(100);
    return HttpResponse.json(apiResponse({ count: mockTenantNotices.length }));
  }),

  // ========== Dashboard ==========
  http.get(`${API_BASE}/admin/dashboard/kpi`, async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(mockTADashboard.kpi));
  }),

  http.get(`${API_BASE}/sa/dashboard`, async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(mockSADashboard));
  }),

  // ========== TU Dashboard ==========
  http.get(`${API_BASE}/tu/dashboard`, async () => {
    await delay(300);
    return HttpResponse.json(apiResponse(mockTUDashboard));
  }),

  http.get(`${API_BASE}/owners/me/stats`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(mockTUDashboard.myLearning));
  }),

  // ========== Analytics ==========
  http.get(`${API_BASE}/admin/analytics/logs`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse([])));
  }),

  http.get(`${API_BASE}/admin/analytics/stats`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse({
      totalViews: 12345,
      uniqueUsers: 567,
      averageSessionTime: 1234,
    }));
  }),

  http.get(`${API_BASE}/sa/analytics/logs`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse([])));
  }),

  // ========== Wishlist & Cart ==========
  http.get(`${API_BASE}/wishlist`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse([]));
  }),

  http.get(`${API_BASE}/wishlist/count`, async () => {
    await delay(100);
    return HttpResponse.json(apiResponse({ count: 0 }));
  }),

  http.get(`${API_BASE}/cart`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse([]));
  }),

  http.get(`${API_BASE}/cart/count`, async () => {
    await delay(100);
    return HttpResponse.json(apiResponse({ count: 0 }));
  }),

  // ========== Departments ==========
  http.get(`${API_BASE}/departments`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse([
      { id: 1, name: '개발팀', code: 'DEV', memberCount: 15 },
      { id: 2, name: '마케팅팀', code: 'MKT', memberCount: 8 },
      { id: 3, name: '영업팀', code: 'SALES', memberCount: 12 },
      { id: 4, name: '인사팀', code: 'HR', memberCount: 5 },
    ]));
  }),

  http.get(`${API_BASE}/departments/tree`, async () => {
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
  http.get(`${API_BASE}/tenants`, async () => {
    await delay(200);
    return HttpResponse.json(apiResponse(paginatedResponse([
      { id: 1, name: 'Demo Company', subdomain: 'demo', status: 'ACTIVE', userCount: 1234 },
      { id: 2, name: 'Tech Corp', subdomain: 'tech', status: 'ACTIVE', userCount: 2345 },
      { id: 3, name: 'Edu Institute', subdomain: 'edu', status: 'ACTIVE', userCount: 3456 },
    ])));
  }),

  // ========== Fallback for unhandled requests ==========
  http.all('*', async ({ request }) => {
    console.log(`[MSW] Unhandled ${request.method} request to ${request.url}`);
    await delay(100);
    return HttpResponse.json(apiResponse(null));
  }),
];
