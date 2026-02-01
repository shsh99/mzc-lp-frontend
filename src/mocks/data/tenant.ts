// Mock tenant data
export const mockTenantSettings = {
  branding: {
    id: 1,
    tenantId: 1,
    siteName: 'MZC LMS',
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    headerBackgroundColor: '#FFFFFF',
    headerTextColor: '#1F2937',
    footerBackgroundColor: '#1F2937',
    footerTextColor: '#FFFFFF',
    footerText: '(c) 2026 MZC LMS. All rights reserved.',
    customCss: null,
  },
  features: {
    id: 1,
    tenantId: 1,
    enableCommunity: true,
    enableRoadmap: true,
    enableCertificate: true,
    enableReview: true,
    enableWishlist: true,
    enableCart: true,
    enablePayment: false,
    enableSocialLogin: false,
    enableMultiLanguage: false,
    defaultLanguage: 'ko',
  },
  layout: {
    id: 1,
    tenantId: 1,
    headerLayout: 'DEFAULT',
    footerLayout: 'DEFAULT',
    sidebarPosition: 'LEFT',
    showBreadcrumb: true,
    showQuickMenu: true,
  },
  navigation: [
    { id: 1, label: '홈', path: '/tu/b2c', icon: 'Home', order: 1, isActive: true },
    { id: 2, label: '과정 탐색', path: '/tu/b2c/courses', icon: 'BookOpen', order: 2, isActive: true },
    { id: 3, label: '커뮤니티', path: '/tu/b2c/community', icon: 'Users', order: 3, isActive: true },
  ],
};

export const mockBanners = [
  {
    id: 1,
    title: '신규 과정 오픈!',
    subtitle: 'React 19 마스터 클래스',
    description: '최신 React 19 버전의 모든 것을 학습하세요',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=400&fit=crop',
    linkUrl: '/tu/b2c/times/1',
    linkTarget: '_self',
    isActive: true,
    order: 1,
    startDate: '2025-12-01',
    endDate: '2026-06-30',
  },
  {
    id: 2,
    title: '클라우드 자격증 준비',
    subtitle: 'AWS Solutions Architect',
    description: 'AWS 자격증 시험을 완벽하게 준비하세요',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=400&fit=crop',
    linkUrl: '/tu/b2c/times/3',
    linkTarget: '_self',
    isActive: true,
    order: 2,
    startDate: '2025-12-01',
    endDate: '2026-06-30',
  },
  {
    id: 3,
    title: '무료 체험 이벤트',
    subtitle: '7일간 무료로 학습하세요',
    description: '모든 과정을 7일간 무료로 체험해보세요',
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=400&fit=crop',
    linkUrl: '/tu/b2c/courses',
    linkTarget: '_self',
    isActive: true,
    order: 3,
    startDate: '2025-12-01',
    endDate: '2026-06-30',
  },
];

export const mockTenantNotices = [
  {
    id: 1,
    tenantId: 1,
    title: '시스템 정기 점검 안내',
    content: `<h2>시스템 정기 점검 안내</h2>
<p>안녕하세요, MZC Learn 관리팀입니다.</p>
<p>2026년 2월 1일 새벽 2시부터 4시까지 시스템 정기 점검이 진행됩니다.</p>
<h3>점검 내용</h3>
<ul>
  <li>서버 성능 최적화</li>
  <li>보안 패치 적용</li>
  <li>데이터베이스 정비</li>
</ul>
<p>해당 시간에는 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.</p>
<p>감사합니다.</p>`,
    type: 'URGENT' as const,
    status: 'PUBLISHED' as const,
    targetAudience: 'ALL' as const,
    creatorRole: 'TENANT_ADMIN',
    isPinned: true,
    publishedAt: '2026-01-25T10:00:00',
    expiredAt: null,
    createdBy: 10,
    viewCount: 234,
    createdAt: '2026-01-25T10:00:00',
    updatedAt: '2026-01-25T10:00:00',
  },
  {
    id: 2,
    tenantId: 1,
    title: '신규 과정 오픈 안내',
    content: `<h2>신규 과정 오픈 안내</h2>
<p>안녕하세요, MZC Learn 관리팀입니다.</p>
<p>React 19 마스터 클래스가 새롭게 오픈되었습니다!</p>
<h3>과정 특징</h3>
<ul>
  <li>최신 React 19 버전 완벽 정리</li>
  <li>Server Components 실전 활용법</li>
  <li>실무 프로젝트 기반 학습</li>
</ul>
<p>최신 기술 트렌드를 학습하고 실무 역량을 키워보세요.</p>`,
    type: 'IMPORTANT' as const,
    status: 'PUBLISHED' as const,
    targetAudience: 'USER' as const,
    creatorRole: 'TENANT_ADMIN',
    isPinned: false,
    publishedAt: '2026-01-20T14:00:00',
    expiredAt: null,
    createdBy: 10,
    viewCount: 156,
    createdAt: '2026-01-20T14:00:00',
    updatedAt: '2026-01-20T14:00:00',
  },
  {
    id: 3,
    tenantId: 1,
    title: '무료 체험 기간 연장 이벤트',
    content: `<h2>무료 체험 기간 연장 이벤트</h2>
<p>좋은 소식을 전해드립니다!</p>
<p>무료 체험 기간이 <strong>14일</strong>로 연장되었습니다.</p>
<h3>이벤트 기간</h3>
<p>2026년 1월 15일 ~ 2026년 2월 28일</p>
<h3>참여 방법</h3>
<ol>
  <li>회원가입 후 무료 체험 시작</li>
  <li>14일간 모든 과정 무료 수강</li>
  <li>마음에 드는 과정 정식 구매</li>
</ol>
<p>이 기회를 놓치지 마세요!</p>`,
    type: 'EVENT' as const,
    status: 'PUBLISHED' as const,
    targetAudience: 'ALL' as const,
    creatorRole: 'TENANT_ADMIN',
    isPinned: false,
    publishedAt: '2026-01-15T09:00:00',
    expiredAt: '2026-02-28T23:59:59',
    createdBy: 10,
    viewCount: 89,
    createdAt: '2026-01-15T09:00:00',
    updatedAt: '2026-01-15T09:00:00',
  },
  {
    id: 4,
    tenantId: 1,
    title: '2월 교육 일정 안내',
    content: `<h2>2026년 2월 교육 일정</h2>
<p>안녕하세요, MZC Learn 관리팀입니다.</p>
<p>2026년 2월 교육 일정을 안내드립니다.</p>
<h3>신규 오픈 과정</h3>
<ul>
  <li>2/1 - TypeScript 심화 과정</li>
  <li>2/10 - AWS 자격증 대비반</li>
  <li>2/15 - Python 데이터 분석 입문</li>
</ul>
<p>자세한 내용은 교육 탐색 메뉴에서 확인해주세요.</p>`,
    type: 'GENERAL' as const,
    status: 'PUBLISHED' as const,
    targetAudience: 'USER' as const,
    creatorRole: 'OPERATOR',
    isPinned: false,
    publishedAt: '2026-01-10T11:00:00',
    expiredAt: null,
    createdBy: 11,
    viewCount: 45,
    createdAt: '2026-01-10T11:00:00',
    updatedAt: '2026-01-10T11:00:00',
  },
  {
    id: 5,
    tenantId: 1,
    title: '운영자 교육 안내',
    content: `<h2>운영자 교육 안내</h2>
<p>운영자를 위한 시스템 사용 교육이 예정되어 있습니다.</p>
<h3>교육 일정</h3>
<p>추후 공지 예정</p>`,
    type: 'GENERAL' as const,
    status: 'DRAFT' as const,
    targetAudience: 'OPERATOR' as const,
    creatorRole: 'TENANT_ADMIN',
    isPinned: false,
    publishedAt: null,
    expiredAt: null,
    createdBy: 10,
    viewCount: 0,
    createdAt: '2026-01-05T09:00:00',
    updatedAt: '2026-01-05T09:00:00',
  },
];
