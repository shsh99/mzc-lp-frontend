// Mock user data with multi-tenant support

// 공통 비밀번호: 1q2w3e4r!
const COMMON_PASSWORD = '1q2w3e4r!';

// ========== 테넌트 목록 ==========
export const mockTenants = [
  {
    id: 1,
    tenantId: 1,
    code: 'MZC_ACADEMY',
    name: 'MZC 아카데미',
    type: 'B2B' as const,
    subdomain: 'mzc',
    customDomain: null,
    status: 'ACTIVE' as const,
    plan: 'ENTERPRISE' as const,
    userCount: 156,
    maxUsers: 500,
    courseCount: 45,
    storageUsed: 85,
    createdAt: '2025-12-01T00:00:00',
    updatedAt: '2026-01-15T10:30:00',
    branding: {
      primaryColor: '#6778ff',
      secondaryColor: '#a855f7',
      logoUrl: null,
    },
  },
  {
    id: 2,
    tenantId: 2,
    code: 'SAMSUNG_LC',
    name: '삼성 러닝센터',
    type: 'B2B' as const,
    subdomain: 'samsung',
    customDomain: 'learning.samsung.com',
    status: 'ACTIVE' as const,
    plan: 'ENTERPRISE' as const,
    userCount: 345,
    maxUsers: 500,
    courseCount: 78,
    storageUsed: 150,
    createdAt: '2025-12-10T00:00:00',
    updatedAt: '2026-01-01T14:20:00',
    branding: {
      primaryColor: '#1428A0',
      secondaryColor: '#0077B6',
      logoUrl: null,
    },
  },
  {
    id: 3,
    tenantId: 3,
    code: 'HYUNDAI_EDU',
    name: '현대 교육원',
    type: 'B2B' as const,
    subdomain: 'hyundai',
    customDomain: null,
    status: 'ACTIVE' as const,
    plan: 'PRO' as const,
    userCount: 89,
    maxUsers: 200,
    courseCount: 32,
    storageUsed: 25,
    createdAt: '2025-12-15T00:00:00',
    updatedAt: '2026-01-20T09:00:00',
    branding: {
      primaryColor: '#002C5F',
      secondaryColor: '#00AAD2',
      logoUrl: null,
    },
  },
];

// ========== 사용자 상세 정보 타입 ==========
interface MockUserDetail {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  status: string;
  roles: string[];
  currentRole: string;
  tenantId: number | null;
  tenantSubdomain: string | null;
  departmentId: number | null;
  departmentName: string | null;
  position: string;
  createdAt: string;
  updatedAt: string;
}

// ========== 계정 인증 정보 ==========
// 테스트 계정 목록 (비밀번호 공통: 1q2w3e4r!)
//
// [시스템 관리자 - 테넌트 없음]
// sa@demo.com - 시스템 관리자 (SA)
//
// [MZC 아카데미 테넌트 (subdomain: mzc)]
// ta-mzc@demo.com - 테넌트 관리자
// co-mzc@demo.com - 과정 운영자
// instructor-mzc@demo.com - 강사
// designer-mzc@demo.com - 설계자
// user-mzc@demo.com - 일반 사용자
//
// [삼성 러닝센터 테넌트 (subdomain: samsung)]
// ta-samsung@demo.com - 테넌트 관리자
// co-samsung@demo.com - 과정 운영자
// instructor-samsung@demo.com - 강사
// designer-samsung@demo.com - 설계자
// user-samsung@demo.com - 일반 사용자

export const mockCredentials: Record<string, { password: string; userId: number }> = {
  // 시스템 관리자 (테넌트 없음)
  'sa@demo.com': { password: COMMON_PASSWORD, userId: 1 },

  // MZC 아카데미 (tenantId: 1)
  'ta-mzc@demo.com': { password: COMMON_PASSWORD, userId: 10 },
  'co-mzc@demo.com': { password: COMMON_PASSWORD, userId: 11 },
  'instructor-mzc@demo.com': { password: COMMON_PASSWORD, userId: 12 },
  'designer-mzc@demo.com': { password: COMMON_PASSWORD, userId: 13 },
  'user-mzc@demo.com': { password: COMMON_PASSWORD, userId: 14 },

  // 삼성 러닝센터 (tenantId: 2)
  'ta-samsung@demo.com': { password: COMMON_PASSWORD, userId: 20 },
  'co-samsung@demo.com': { password: COMMON_PASSWORD, userId: 21 },
  'instructor-samsung@demo.com': { password: COMMON_PASSWORD, userId: 22 },
  'designer-samsung@demo.com': { password: COMMON_PASSWORD, userId: 23 },
  'user-samsung@demo.com': { password: COMMON_PASSWORD, userId: 24 },
};

// ========== 사용자 상세 정보 ==========
export const mockUserDetails: Record<number, MockUserDetail> = {
  // ===== 시스템 관리자 (테넌트 없음) =====
  1: {
    id: 1,
    email: 'sa@demo.com',
    name: '시스템 관리자',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['SYSTEM_ADMIN'],
    currentRole: 'SYSTEM_ADMIN',
    tenantId: null, // SA는 테넌트가 없음
    tenantSubdomain: null,
    departmentId: null,
    departmentName: null,
    position: '시스템 관리자',
    createdAt: '2025-12-01T00:00:00',
    updatedAt: '2025-12-01T00:00:00',
  },

  // ===== MZC 아카데미 (tenantId: 1, subdomain: mzc) =====
  10: {
    id: 10,
    email: 'ta-mzc@demo.com',
    name: '김테넌트',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['TENANT_ADMIN'],
    currentRole: 'TENANT_ADMIN',
    tenantId: 1,
    tenantSubdomain: 'mzc',
    departmentId: 1,
    departmentName: '경영지원팀',
    position: '팀장',
    createdAt: '2025-12-02T00:00:00',
    updatedAt: '2025-12-02T00:00:00',
  },
  11: {
    id: 11,
    email: 'co-mzc@demo.com',
    name: '이운영',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['OPERATOR'],
    currentRole: 'OPERATOR',
    tenantId: 1,
    tenantSubdomain: 'mzc',
    departmentId: 2,
    departmentName: '교육운영팀',
    position: '과장',
    createdAt: '2025-12-03T00:00:00',
    updatedAt: '2025-12-03T00:00:00',
  },
  12: {
    id: 12,
    email: 'instructor-mzc@demo.com',
    name: '박강사',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['INSTRUCTOR'],
    currentRole: 'INSTRUCTOR',
    tenantId: 1,
    tenantSubdomain: 'mzc',
    departmentId: 3,
    departmentName: '교육개발팀',
    position: '수석강사',
    createdAt: '2025-12-04T00:00:00',
    updatedAt: '2025-12-04T00:00:00',
  },
  13: {
    id: 13,
    email: 'designer-mzc@demo.com',
    name: '최설계',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['DESIGNER'],
    currentRole: 'DESIGNER',
    tenantId: 1,
    tenantSubdomain: 'mzc',
    departmentId: 3,
    departmentName: '교육개발팀',
    position: '대리',
    createdAt: '2025-12-05T00:00:00',
    updatedAt: '2025-12-05T00:00:00',
  },
  14: {
    id: 14,
    email: 'user-mzc@demo.com',
    name: '정학습',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['USER'],
    currentRole: 'USER',
    tenantId: 1,
    tenantSubdomain: 'mzc',
    departmentId: 4,
    departmentName: '개발팀',
    position: '사원',
    createdAt: '2025-12-06T00:00:00',
    updatedAt: '2025-12-06T00:00:00',
  },

  // ===== 삼성 러닝센터 (tenantId: 2, subdomain: samsung) =====
  20: {
    id: 20,
    email: 'ta-samsung@demo.com',
    name: '강관리',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['TENANT_ADMIN'],
    currentRole: 'TENANT_ADMIN',
    tenantId: 2,
    tenantSubdomain: 'samsung',
    departmentId: 10,
    departmentName: 'HR팀',
    position: '부장',
    createdAt: '2025-12-10T00:00:00',
    updatedAt: '2025-12-10T00:00:00',
  },
  21: {
    id: 21,
    email: 'co-samsung@demo.com',
    name: '오운영',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['OPERATOR'],
    currentRole: 'OPERATOR',
    tenantId: 2,
    tenantSubdomain: 'samsung',
    departmentId: 11,
    departmentName: '교육센터',
    position: '과장',
    createdAt: '2025-12-11T00:00:00',
    updatedAt: '2025-12-11T00:00:00',
  },
  22: {
    id: 22,
    email: 'instructor-samsung@demo.com',
    name: '윤강사',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['INSTRUCTOR'],
    currentRole: 'INSTRUCTOR',
    tenantId: 2,
    tenantSubdomain: 'samsung',
    departmentId: 11,
    departmentName: '교육센터',
    position: '수석',
    createdAt: '2025-12-12T00:00:00',
    updatedAt: '2025-12-12T00:00:00',
  },
  23: {
    id: 23,
    email: 'designer-samsung@demo.com',
    name: '장설계',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['DESIGNER'],
    currentRole: 'DESIGNER',
    tenantId: 2,
    tenantSubdomain: 'samsung',
    departmentId: 12,
    departmentName: '콘텐츠팀',
    position: '대리',
    createdAt: '2025-12-13T00:00:00',
    updatedAt: '2025-12-13T00:00:00',
  },
  24: {
    id: 24,
    email: 'user-samsung@demo.com',
    name: '한학습',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['USER'],
    currentRole: 'USER',
    tenantId: 2,
    tenantSubdomain: 'samsung',
    departmentId: 13,
    departmentName: '무선사업부',
    position: '사원',
    createdAt: '2025-12-14T00:00:00',
    updatedAt: '2025-12-14T00:00:00',
  },
};

// ========== 하위 호환용 exports ==========

// 사용자 목록 타입
interface MockUserListItem {
  id: number;
  email: string;
  name: string;
  status: string;
  roles: string[];
  tenantId: number | null;
  departmentName: string | null;
  createdAt: string;
}

// 전체 사용자 목록 (목록 조회용)
const allUsersList: MockUserListItem[] = Object.values(mockUserDetails).map(user => ({
  id: user.id,
  email: user.email,
  name: user.name,
  status: user.status,
  roles: user.roles,
  tenantId: user.tenantId,
  departmentName: user.departmentName,
  createdAt: user.createdAt,
}));

// 테넌트별 사용자 필터링 헬퍼
export const getUsersByTenant = (tenantId: number | null): MockUserListItem[] => {
  if (tenantId === null) {
    // SA는 모든 사용자 조회 가능
    return allUsersList;
  }
  return allUsersList.filter(user => user.tenantId === tenantId);
};

export const mockUsers = {
  // 기본 사용자 (하위 호환용 - MZC 테넌트 관리자)
  currentUser: mockUserDetails[10],
  users: allUsersList,
  learningStats: {
    totalEnrollments: 15,
    completedCourses: 8,
    inProgressCourses: 5,
    totalLearningMinutes: 2400,
    averageScore: 85.5,
    certificatesEarned: 6,
  },
};

export const mockAuth = {
  loginResponse: {
    accessToken: 'mock-access-token-10-12345',
    refreshToken: 'mock-refresh-token-10-67890',
    expiresIn: 900000,
    user: mockUserDetails[10],
  },
};
