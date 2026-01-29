// Mock user data
export const mockUsers = {
  currentUser: {
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
      email: 'user1@demo.com',
      name: '홍길동',
      status: 'ACTIVE',
      roles: ['USER'],
      departmentName: '마케팅팀',
      createdAt: '2024-01-02T00:00:00',
    },
    {
      id: 3,
      email: 'user2@demo.com',
      name: '김철수',
      status: 'ACTIVE',
      roles: ['USER'],
      departmentName: '영업팀',
      createdAt: '2024-01-03T00:00:00',
    },
  ],
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
    user: mockUsers.currentUser,
  },
};
