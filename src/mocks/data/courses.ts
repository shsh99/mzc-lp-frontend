// Mock course data with multi-tenant support

// ========== MZC 아카데미 (tenantId: 1) 강의 ==========
const mzcCourses = [
  {
    id: 1,
    tenantId: 1,
    title: 'React 기초부터 실전까지',
    description: 'React의 기초 개념부터 실전 프로젝트까지 학습합니다.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    status: 'PUBLISHED',
    categoryId: 1,
    categoryName: '개발',
    instructorId: 12,
    instructorName: '박강사',
    duration: 1200,
    totalItems: 24,
    level: 'BEGINNER',
    price: 99000,
    rating: 4.8,
    reviewCount: 156,
    enrollmentCount: 1234,
    createdAt: '2025-12-01T00:00:00',
  },
  {
    id: 2,
    tenantId: 1,
    title: 'TypeScript 마스터 클래스',
    description: 'TypeScript를 활용한 타입 안전한 개발 방법을 학습합니다.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
    status: 'PUBLISHED',
    categoryId: 1,
    categoryName: '개발',
    instructorId: 12,
    instructorName: '박강사',
    duration: 900,
    totalItems: 18,
    level: 'INTERMEDIATE',
    price: 129000,
    rating: 4.9,
    reviewCount: 89,
    enrollmentCount: 567,
    createdAt: '2025-12-15T00:00:00',
  },
  {
    id: 3,
    tenantId: 1,
    title: 'AWS 클라우드 입문',
    description: 'AWS 클라우드 서비스의 기초를 학습합니다.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    status: 'PUBLISHED',
    categoryId: 2,
    categoryName: '클라우드',
    instructorId: 12,
    instructorName: '박강사',
    duration: 1500,
    totalItems: 30,
    level: 'BEGINNER',
    price: 149000,
    rating: 4.7,
    reviewCount: 234,
    enrollmentCount: 890,
    createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 4,
    tenantId: 1,
    title: 'Python 데이터 분석',
    description: 'Python을 활용한 데이터 분석 기법을 학습합니다.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
    status: 'PUBLISHED',
    categoryId: 3,
    categoryName: '데이터',
    instructorId: 12,
    instructorName: '박강사',
    duration: 1800,
    totalItems: 36,
    level: 'INTERMEDIATE',
    price: 179000,
    rating: 4.6,
    reviewCount: 178,
    enrollmentCount: 456,
    createdAt: '2026-01-15T00:00:00',
  },
];

// ========== 삼성 러닝센터 (tenantId: 2) 강의 ==========
const samsungCourses = [
  {
    id: 101,
    tenantId: 2,
    title: '삼성 리더십 과정',
    description: '삼성의 리더십 원칙과 실무 적용 방법을 학습합니다.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    status: 'PUBLISHED',
    categoryId: 5,
    categoryName: '비즈니스',
    instructorId: 22,
    instructorName: '윤강사',
    duration: 960,
    totalItems: 16,
    level: 'INTERMEDIATE',
    price: 0,
    rating: 4.9,
    reviewCount: 567,
    enrollmentCount: 2345,
    createdAt: '2025-12-10T00:00:00',
  },
  {
    id: 102,
    tenantId: 2,
    title: '디지털 트랜스포메이션 기초',
    description: '디지털 전환의 핵심 개념과 전략을 학습합니다.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    status: 'PUBLISHED',
    categoryId: 6,
    categoryName: 'DX',
    instructorId: 22,
    instructorName: '윤강사',
    duration: 720,
    totalItems: 12,
    level: 'BEGINNER',
    price: 0,
    rating: 4.7,
    reviewCount: 234,
    enrollmentCount: 1890,
    createdAt: '2025-12-20T00:00:00',
  },
  {
    id: 103,
    tenantId: 2,
    title: '반도체 공정 이해',
    description: '반도체 제조 공정의 전반적인 이해를 돕는 과정입니다.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    status: 'PUBLISHED',
    categoryId: 7,
    categoryName: '기술',
    instructorId: 22,
    instructorName: '윤강사',
    duration: 1440,
    totalItems: 24,
    level: 'ADVANCED',
    price: 0,
    rating: 4.8,
    reviewCount: 456,
    enrollmentCount: 3456,
    createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 104,
    tenantId: 2,
    title: '글로벌 비즈니스 커뮤니케이션',
    description: '글로벌 환경에서의 효과적인 비즈니스 커뮤니케이션을 학습합니다.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
    status: 'PUBLISHED',
    categoryId: 8,
    categoryName: '커뮤니케이션',
    instructorId: 22,
    instructorName: '윤강사',
    duration: 600,
    totalItems: 10,
    level: 'INTERMEDIATE',
    price: 0,
    rating: 4.5,
    reviewCount: 189,
    enrollmentCount: 1234,
    createdAt: '2026-01-15T00:00:00',
  },
];

// 전체 강의 목록
export const mockCourses = [...mzcCourses, ...samsungCourses];

// 테넌트별 강의 필터링 헬퍼
export const getCoursesByTenant = (tenantId: number | null) => {
  if (tenantId === null) {
    return mockCourses; // SA는 전체 조회
  }
  return mockCourses.filter(course => course.tenantId === tenantId);
};

// ========== MZC 아카데미 차시 ==========
const mzcCourseTimes = [
  {
    id: 1,
    tenantId: 1,
    title: 'React 기초부터 실전까지 - 2024년 1기',
    status: 'RECRUITING',
    deliveryType: 'ONLINE',
    enrollmentMethod: 'FIRST_COME',
    isOnDemand: false,
    enrollStartDate: '2026-01-01',
    enrollEndDate: '2026-01-31',
    classStartDate: '2026-02-01',
    classEndDate: '2026-02-31',
    capacity: 50,
    currentEnrollment: 35,
    availableSeats: 15,
    price: '99000',
    isFree: false,
    program: {
      id: 1,
      title: 'React 기초부터 실전까지',
      description: 'React의 기초 개념부터 실전 프로젝트까지 학습합니다.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
      level: 'BEGINNER',
      type: 'ONLINE',
      estimatedHours: 20,
      categoryId: 1,
      categoryName: '개발',
    },
    instructors: [
      {
        id: 12,
        name: '박강사',
        role: 'MAIN',
        profileImageUrl: 'https://picsum.photos/seed/instructor1/100/100',
      },
    ],
  },
  {
    id: 2,
    tenantId: 1,
    title: 'TypeScript 마스터 클래스 - 2024년 1기',
    status: 'RECRUITING',
    deliveryType: 'ONLINE',
    enrollmentMethod: 'FIRST_COME',
    isOnDemand: false,
    enrollStartDate: '2026-01-15',
    enrollEndDate: '2026-02-10',
    classStartDate: '2026-02-15',
    classEndDate: '2026-03-15',
    capacity: 40,
    currentEnrollment: 28,
    availableSeats: 12,
    price: '129000',
    isFree: false,
    program: {
      id: 2,
      title: 'TypeScript 마스터 클래스',
      description: 'TypeScript를 활용한 타입 안전한 개발 방법을 학습합니다.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
      level: 'INTERMEDIATE',
      type: 'ONLINE',
      estimatedHours: 15,
      categoryId: 1,
      categoryName: '개발',
    },
    instructors: [
      {
        id: 12,
        name: '박강사',
        role: 'MAIN',
        profileImageUrl: 'https://picsum.photos/seed/instructor2/100/100',
      },
    ],
  },
  {
    id: 3,
    tenantId: 1,
    title: 'AWS 클라우드 입문 - 2024년 2기',
    status: 'ONGOING',
    deliveryType: 'BLENDED',
    enrollmentMethod: 'APPROVAL',
    isOnDemand: false,
    enrollStartDate: '2026-02-01',
    enrollEndDate: '2026-02-30',
    classStartDate: '2026-02-01',
    classEndDate: '2026-03-31',
    capacity: 60,
    currentEnrollment: 42,
    availableSeats: 18,
    price: '149000',
    isFree: false,
    program: {
      id: 3,
      title: 'AWS 클라우드 입문',
      description: 'AWS 클라우드 서비스의 기초를 학습합니다.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
      level: 'BEGINNER',
      type: 'BLENDED',
      estimatedHours: 25,
      categoryId: 2,
      categoryName: '클라우드',
    },
    instructors: [
      {
        id: 12,
        name: '박강사',
        role: 'MAIN',
        profileImageUrl: 'https://picsum.photos/seed/instructor3/100/100',
      },
    ],
  },
  {
    id: 4,
    tenantId: 1,
    title: 'Python 데이터 분석 - 무료 체험반',
    status: 'RECRUITING',
    deliveryType: 'ONLINE',
    enrollmentMethod: 'FIRST_COME',
    isOnDemand: true,
    enrollStartDate: '2025-12-01',
    enrollEndDate: '2026-06-31',
    classStartDate: '2025-12-01',
    classEndDate: '2026-06-31',
    capacity: null,
    currentEnrollment: 456,
    availableSeats: 999,
    price: '0',
    isFree: true,
    program: {
      id: 4,
      title: 'Python 데이터 분석',
      description: 'Python을 활용한 데이터 분석 기법을 학습합니다.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
      level: 'INTERMEDIATE',
      type: 'ONLINE',
      estimatedHours: 30,
      categoryId: 3,
      categoryName: '데이터',
    },
    instructors: [
      {
        id: 12,
        name: '박강사',
        role: 'MAIN',
        profileImageUrl: 'https://picsum.photos/seed/instructor5/100/100',
      },
    ],
  },
];

// ========== 삼성 러닝센터 차시 ==========
const samsungCourseTimes = [
  {
    id: 101,
    tenantId: 2,
    title: '삼성 리더십 과정 - 2024년 상반기',
    status: 'RECRUITING',
    deliveryType: 'BLENDED',
    enrollmentMethod: 'APPROVAL',
    isOnDemand: false,
    enrollStartDate: '2026-01-01',
    enrollEndDate: '2026-01-20',
    classStartDate: '2026-02-01',
    classEndDate: '2026-03-30',
    capacity: 100,
    currentEnrollment: 78,
    availableSeats: 22,
    price: '0',
    isFree: true,
    program: {
      id: 101,
      title: '삼성 리더십 과정',
      description: '삼성의 리더십 원칙과 실무 적용 방법을 학습합니다.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      level: 'INTERMEDIATE',
      type: 'BLENDED',
      estimatedHours: 16,
      categoryId: 5,
      categoryName: '비즈니스',
    },
    instructors: [
      {
        id: 22,
        name: '윤강사',
        role: 'MAIN',
        profileImageUrl: 'https://picsum.photos/seed/samsung1/100/100',
      },
    ],
  },
  {
    id: 102,
    tenantId: 2,
    title: '디지털 트랜스포메이션 기초 - 상시',
    status: 'RECRUITING',
    deliveryType: 'ONLINE',
    enrollmentMethod: 'FIRST_COME',
    isOnDemand: true,
    enrollStartDate: '2025-12-01',
    enrollEndDate: '2026-06-31',
    classStartDate: '2025-12-01',
    classEndDate: '2026-06-31',
    capacity: null,
    currentEnrollment: 1890,
    availableSeats: 999,
    price: '0',
    isFree: true,
    program: {
      id: 102,
      title: '디지털 트랜스포메이션 기초',
      description: '디지털 전환의 핵심 개념과 전략을 학습합니다.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      level: 'BEGINNER',
      type: 'ONLINE',
      estimatedHours: 12,
      categoryId: 6,
      categoryName: 'DX',
    },
    instructors: [
      {
        id: 22,
        name: '윤강사',
        role: 'MAIN',
        profileImageUrl: 'https://picsum.photos/seed/samsung2/100/100',
      },
    ],
  },
  {
    id: 103,
    tenantId: 2,
    title: '반도체 공정 이해 - 2024년 1기',
    status: 'ONGOING',
    deliveryType: 'OFFLINE',
    enrollmentMethod: 'APPROVAL',
    isOnDemand: false,
    enrollStartDate: '2026-01-01',
    enrollEndDate: '2026-01-28',
    classStartDate: '2026-01-01',
    classEndDate: '2026-02-31',
    capacity: 30,
    currentEnrollment: 30,
    availableSeats: 0,
    price: '0',
    isFree: true,
    program: {
      id: 103,
      title: '반도체 공정 이해',
      description: '반도체 제조 공정의 전반적인 이해를 돕는 과정입니다.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
      level: 'ADVANCED',
      type: 'OFFLINE',
      estimatedHours: 24,
      categoryId: 7,
      categoryName: '기술',
    },
    instructors: [
      {
        id: 22,
        name: '윤강사',
        role: 'MAIN',
        profileImageUrl: 'https://picsum.photos/seed/samsung3/100/100',
      },
    ],
  },
  {
    id: 104,
    tenantId: 2,
    title: '글로벌 비즈니스 커뮤니케이션 - Live',
    status: 'RECRUITING',
    deliveryType: 'LIVE',
    enrollmentMethod: 'FIRST_COME',
    isOnDemand: false,
    enrollStartDate: '2026-02-01',
    enrollEndDate: '2026-02-15',
    classStartDate: '2026-02-01',
    classEndDate: '2026-02-31',
    capacity: 50,
    currentEnrollment: 32,
    availableSeats: 18,
    price: '0',
    isFree: true,
    program: {
      id: 104,
      title: '글로벌 비즈니스 커뮤니케이션',
      description: '글로벌 환경에서의 효과적인 비즈니스 커뮤니케이션을 학습합니다.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
      level: 'INTERMEDIATE',
      type: 'ONLINE',
      estimatedHours: 10,
      categoryId: 8,
      categoryName: '커뮤니케이션',
    },
    instructors: [
      {
        id: 22,
        name: '윤강사',
        role: 'MAIN',
        profileImageUrl: 'https://picsum.photos/seed/samsung4/100/100',
      },
    ],
  },
];

// 전체 차시 목록
export const mockCourseTimes = [...mzcCourseTimes, ...samsungCourseTimes];

// 테넌트별 차시 필터링 헬퍼
export const getCourseTimesByTenant = (tenantId: number | null) => {
  if (tenantId === null) {
    return mockCourseTimes; // SA는 전체 조회
  }
  return mockCourseTimes.filter(time => time.tenantId === tenantId);
};

// ========== MZC 아카데미 카테고리 (프론트엔드와 일치) ==========
const mzcCategories = [
  { id: 1, tenantId: 1, name: '개발', courseCount: 45 },
  { id: 2, tenantId: 1, name: '클라우드', courseCount: 23 },
  { id: 3, tenantId: 1, name: '데이터', courseCount: 18 },
  { id: 4, tenantId: 1, name: '디자인', courseCount: 12 },
];

// ========== 삼성 러닝센터 카테고리 (프론트엔드와 일치) ==========
const samsungCategories = [
  { id: 5, tenantId: 2, name: '비즈니스', courseCount: 34 },
  { id: 6, tenantId: 2, name: 'DX', courseCount: 28 },
  { id: 7, tenantId: 2, name: '기술', courseCount: 56 },
  { id: 8, tenantId: 2, name: '커뮤니케이션', courseCount: 19 },
];

// 전체 카테고리
export const mockCategories = [...mzcCategories, ...samsungCategories];

// 테넌트별 카테고리 필터링 헬퍼
export const getCategoriesByTenant = (tenantId: number | null) => {
  if (tenantId === null) {
    return mockCategories; // SA는 전체 조회
  }
  return mockCategories.filter(cat => cat.tenantId === tenantId);
};

// ========== 커뮤니티 게시판 (테넌트별) ==========
// CommunityPost 타입에 맞게 구성
export const mockCommunityPosts = [
  // MZC 아카데미 게시글 - 정학습(authorId: 14) 작성
  {
    id: 1,
    tenantId: 1,
    type: 'tip' as const,
    title: 'React 학습 팁 공유합니다',
    content: `React를 처음 배우시는 분들께 도움이 될 만한 팁을 공유합니다.

1. useState vs useReducer
간단한 상태는 useState, 복잡한 상태 로직은 useReducer를 사용하세요.

2. useEffect 의존성 배열
의존성 배열을 잘 관리해야 무한 루프를 방지할 수 있습니다.

3. 컴포넌트 분리
하나의 컴포넌트는 하나의 역할만 담당하도록 분리하세요.`,
    excerpt: 'React를 처음 배우시는 분들께 도움이 될 만한 팁을 공유합니다.',
    author: { id: 14, name: '정학습', avatar: null },
    category: 'free',
    tags: ['React', '프론트엔드', '학습팁'],
    viewCount: 234,
    likeCount: 45,
    commentCount: 12,
    isLiked: false,
    isPinned: false,
    createdAt: '2026-02-01T10:00:00',
    updatedAt: '2026-02-01T10:00:00',
    authorId: 14,
    boardType: 'FREE',
  },
  {
    id: 2,
    tenantId: 1,
    type: 'question' as const,
    title: 'TypeScript 제네릭 관련 질문입니다',
    content: `제네릭을 사용할 때 타입 추론이 잘 안되는 경우가 있는데요.

function example<T>(arg: T): T {
  return arg;
}

위 코드에서 T가 특정 타입으로 제한되지 않을 때 어떻게 처리하면 좋을까요?`,
    excerpt: '제네릭을 사용할 때 타입 추론이 잘 안되는 경우가 있는데요.',
    author: { id: 14, name: '정학습', avatar: null },
    category: 'qna',
    tags: ['TypeScript', '제네릭'],
    viewCount: 156,
    likeCount: 23,
    commentCount: 8,
    isLiked: true,
    isPinned: false,
    isSolved: false,
    createdAt: '2026-01-31T14:30:00',
    updatedAt: '2026-01-31T14:30:00',
    authorId: 14,
    boardType: 'QNA',
  },
  {
    id: 3,
    tenantId: 1,
    type: 'discussion' as const,
    title: 'AWS 스터디 그룹 모집합니다',
    content: `AWS 자격증 준비하실 분들 같이 스터디 하실래요?

[스터디 정보]
- 대상: AWS Solutions Architect Associate
- 기간: 4주
- 방식: 온라인 (주 2회)
- 인원: 5명

댓글로 신청해주세요!`,
    excerpt: 'AWS 자격증 준비하실 분들 같이 스터디 하실래요?',
    author: { id: 14, name: '정학습', avatar: null },
    category: 'study',
    tags: ['AWS', '스터디', '자격증'],
    viewCount: 89,
    likeCount: 15,
    commentCount: 6,
    isLiked: false,
    isPinned: true,
    createdAt: '2026-01-30T09:00:00',
    updatedAt: '2026-01-30T09:00:00',
    authorId: 14,
    boardType: 'STUDY',
  },
  {
    id: 4,
    tenantId: 1,
    type: 'review' as const,
    title: 'React 기초 과정 수강 후기',
    content: `React 기초부터 실전까지 과정을 완강했습니다!

[좋았던 점]
- 체계적인 커리큘럼
- 실무 예제 중심 학습
- 친절한 강사님 설명

[아쉬운 점]
조금 더 심화 내용이 있으면 좋겠습니다.

전체적으로 만족스러운 과정이었습니다.`,
    excerpt: 'React 기초부터 실전까지 과정을 완강했습니다!',
    author: { id: 14, name: '정학습', avatar: null },
    category: 'review',
    tags: ['React', '수강후기'],
    viewCount: 312,
    likeCount: 67,
    commentCount: 15,
    isLiked: true,
    isPinned: false,
    createdAt: '2026-01-29T16:00:00',
    updatedAt: '2026-01-29T16:00:00',
    authorId: 14,
    boardType: 'REVIEW',
  },
  {
    id: 5,
    tenantId: 1,
    type: 'tip' as const,
    title: '프론트엔드 개발자 면접 준비 팁',
    content: `최근 프론트엔드 개발자로 이직을 준비하면서 정리한 면접 팁입니다.

[기술 면접]
- JavaScript 핵심 개념 (클로저, 프로토타입, 이벤트 루프)
- React 동작 원리 (Virtual DOM, Reconciliation)
- 상태 관리 패턴

[과제 전형]
클린 코드, 컴포넌트 설계, 테스트 코드 작성이 중요합니다.`,
    excerpt: '최근 프론트엔드 개발자로 이직을 준비하면서 정리한 면접 팁입니다.',
    author: { id: 14, name: '정학습', avatar: null },
    category: 'career',
    tags: ['면접', '이직', '프론트엔드'],
    viewCount: 445,
    likeCount: 89,
    commentCount: 23,
    isLiked: false,
    isPinned: false,
    createdAt: '2026-01-28T11:00:00',
    updatedAt: '2026-01-28T11:00:00',
    authorId: 14,
    boardType: 'CAREER',
  },
  // 다른 사용자 게시글
  {
    id: 6,
    tenantId: 1,
    type: 'discussion' as const,
    title: 'Next.js 13 App Router 사용 후기',
    content: `Next.js 13의 App Router를 프로젝트에 적용해봤습니다.
서버 컴포넌트와 클라이언트 컴포넌트의 구분이 중요하더라고요.`,
    excerpt: 'Next.js 13의 App Router를 프로젝트에 적용해봤습니다.',
    author: { id: 15, name: '김개발', avatar: null },
    category: 'free',
    tags: ['Next.js', 'React'],
    viewCount: 178,
    likeCount: 34,
    commentCount: 7,
    isLiked: false,
    isPinned: false,
    createdAt: '2026-01-27T09:00:00',
    updatedAt: '2026-01-27T09:00:00',
    authorId: 15,
    boardType: 'FREE',
  },
  {
    id: 7,
    tenantId: 1,
    type: 'question' as const,
    title: 'Zustand vs Redux 어떤 걸 선택해야 할까요?',
    content: `새 프로젝트를 시작하는데 상태 관리 라이브러리 선택에서 고민 중입니다.
Zustand와 Redux 중 어떤 것을 추천하시나요?`,
    excerpt: '새 프로젝트를 시작하는데 상태 관리 라이브러리 선택에서 고민 중입니다.',
    author: { id: 16, name: '이학습', avatar: null },
    category: 'qna',
    tags: ['Zustand', 'Redux', '상태관리'],
    viewCount: 223,
    likeCount: 28,
    commentCount: 19,
    isLiked: true,
    isPinned: false,
    isSolved: true,
    createdAt: '2026-01-26T14:00:00',
    updatedAt: '2026-01-26T14:00:00',
    authorId: 16,
    boardType: 'QNA',
  },
  {
    id: 8,
    tenantId: 1,
    type: 'discussion' as const,
    title: 'TypeScript 스터디 멤버 모집 (마감임박)',
    content: `TypeScript 기초부터 고급까지 함께 공부하실 분을 모집합니다.
현재 3/5명 모집완료!`,
    excerpt: 'TypeScript 기초부터 고급까지 함께 공부하실 분을 모집합니다.',
    author: { id: 17, name: '박코딩', avatar: null },
    category: 'study',
    tags: ['TypeScript', '스터디'],
    viewCount: 156,
    likeCount: 22,
    commentCount: 11,
    isLiked: false,
    isPinned: false,
    createdAt: '2026-01-25T10:00:00',
    updatedAt: '2026-01-25T10:00:00',
    authorId: 17,
    boardType: 'STUDY',
  },
  // 삼성 러닝센터 게시글
  {
    id: 101,
    tenantId: 2,
    type: 'review' as const,
    title: '리더십 과정 후기입니다',
    content: `이번 리더십 과정을 수료하고 느낀 점을 공유합니다.
팀을 이끄는 방법에 대해 많이 배웠습니다.`,
    excerpt: '이번 리더십 과정을 수료하고 느낀 점을 공유합니다.',
    author: { id: 24, name: '한학습', avatar: null },
    category: 'free',
    tags: ['리더십', '수강후기'],
    viewCount: 567,
    likeCount: 89,
    commentCount: 23,
    isLiked: false,
    isPinned: false,
    createdAt: '2026-01-31T11:00:00',
    updatedAt: '2026-01-31T11:00:00',
    authorId: 24,
    boardType: 'FREE',
  },
  {
    id: 102,
    tenantId: 2,
    type: 'question' as const,
    title: 'DX 과정 관련 문의드립니다',
    content: `디지털 트랜스포메이션 과정 수강 전 필요한 사전 지식이 있을까요?
IT 비전공자도 수강 가능한지 궁금합니다.`,
    excerpt: '디지털 트랜스포메이션 과정 수강 전 필요한 사전 지식이 있을까요?',
    author: { id: 24, name: '한학습', avatar: null },
    category: 'qna',
    tags: ['DX', '디지털전환'],
    viewCount: 234,
    likeCount: 12,
    commentCount: 5,
    isLiked: false,
    isPinned: false,
    isSolved: false,
    createdAt: '2026-01-30T15:00:00',
    updatedAt: '2026-01-30T15:00:00',
    authorId: 24,
    boardType: 'QNA',
  },
];

// 테넌트별 커뮤니티 게시글 필터링 헬퍼
export const getCommunityPostsByTenant = (tenantId: number | null) => {
  if (tenantId === null) {
    return mockCommunityPosts;
  }
  return mockCommunityPosts.filter(post => post.tenantId === tenantId);
};
