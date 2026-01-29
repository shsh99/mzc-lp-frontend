// Mock user data

// 테스트 계정 목록 (비밀번호 공통: 1q2w3e4r!)
// admin@demo.com - 일반 관리자
// user@demo.com - 일반 사용자
// ta@demo.com - 테넌트 관리자 (TA)
// sa@demo.com - 시스템 관리자 (SA)

const COMMON_PASSWORD = '1q2w3e4r!';

export const mockCredentials: Record<string, { password: string; userId: number }> = {
  'admin@demo.com': { password: COMMON_PASSWORD, userId: 1 },
  'user@demo.com': { password: COMMON_PASSWORD, userId: 2 },
  'ta@demo.com': { password: COMMON_PASSWORD, userId: 3 },
  'sa@demo.com': { password: COMMON_PASSWORD, userId: 4 },
};

// 사용자 상세 정보 타입
interface MockUserDetail {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  status: string;
  roles: string[];
  currentRole: string;
  tenantId: number | null;
  departmentId: number | null;
  departmentName: string | null;
  position: string;
  createdAt: string;
  updatedAt: string;
}

export const mockUserDetails: Record<number, MockUserDetail> = {
  1: {
    id: 1,
    email: 'admin@demo.com',
    name: '관리자',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['TENANT_ADMIN', 'OPERATOR', 'USER'],
    currentRole: 'USER',
    tenantId: 1,
    departmentId: 1,
    departmentName: '개발팀',
    position: '팀장',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
  2: {
    id: 2,
    email: 'user@demo.com',
    name: '홍길동',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['USER'],
    currentRole: 'USER',
    tenantId: 1,
    departmentId: 2,
    departmentName: '마케팅팀',
    position: '사원',
    createdAt: '2024-01-02T00:00:00',
    updatedAt: '2024-01-02T00:00:00',
  },
  3: {
    id: 3,
    email: 'ta@demo.com',
    name: '테넌트 관리자',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['TENANT_ADMIN'],
    currentRole: 'TENANT_ADMIN',
    tenantId: 1,
    departmentId: 1,
    departmentName: '개발팀',
    position: '관리자',
    createdAt: '2024-01-03T00:00:00',
    updatedAt: '2024-01-03T00:00:00',
  },
  4: {
    id: 4,
    email: 'sa@demo.com',
    name: '시스템 관리자',
    profileImageUrl: null,
    status: 'ACTIVE',
    roles: ['SYSTEM_ADMIN'],
    currentRole: 'SYSTEM_ADMIN',
    tenantId: null, // SA는 tenantId가 없음
    departmentId: null,
    departmentName: null,
    position: '시스템 관리자',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
};

// 사용자 목록 타입
interface MockUserListItem {
  id: number;
  email: string;
  name: string;
  status: string;
  roles: string[];
  departmentName: string | null;
  createdAt: string;
}

export const mockUsers = {
  currentUser: mockUserDetails[1],
  users: [
    {
      id: 1,
      email: 'admin@demo.com',
      name: '관리자',
      status: 'ACTIVE',
      roles: ['TENANT_ADMIN'],
      departmentName: '개발팀',
      createdAt: '2024-01-01T00:00:00',
    },
    {
      id: 2,
      email: 'user@demo.com',
      name: '홍길동',
      status: 'ACTIVE',
      roles: ['USER'],
      departmentName: '마케팅팀',
      createdAt: '2024-01-02T00:00:00',
    },
    {
      id: 3,
      email: 'ta@demo.com',
      name: '테넌트 관리자',
      status: 'ACTIVE',
      roles: ['TENANT_ADMIN'],
      departmentName: '개발팀',
      createdAt: '2024-01-03T00:00:00',
    },
    {
      id: 4,
      email: 'sa@demo.com',
      name: '시스템 관리자',
      status: 'ACTIVE',
      roles: ['SYSTEM_ADMIN'],
      departmentName: null,
      createdAt: '2024-01-01T00:00:00',
    },
  ] as MockUserListItem[],
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
    accessToken: 'mock-access-token-12345',
    refreshToken: 'mock-refresh-token-67890',
    expiresIn: 900000,
    user: mockUserDetails[1],
  },
};
