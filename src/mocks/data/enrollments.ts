// Mock enrollment data

// ========== 찜 목록 ==========
// WishlistItemResponse 타입에 맞게 플랫 구조로 정의
export const mockWishlist = [
  {
    id: 1,
    courseTimeId: 2,
    courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 1기',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
    level: 'INTERMEDIATE',
    estimatedHours: 24,
    isFree: false,
    price: '129000',
    addedAt: '2026-01-25T10:00:00',
  },
  {
    id: 2,
    courseTimeId: 3,
    courseTimeTitle: 'AWS 클라우드 입문 - 2024년 2기',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    level: 'BEGINNER',
    estimatedHours: 16,
    isFree: false,
    price: '149000',
    addedAt: '2026-01-20T14:30:00',
  },
  {
    id: 3,
    courseTimeId: 4,
    courseTimeTitle: 'Python 데이터 분석 - 무료 체험반',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
    level: 'INTERMEDIATE',
    estimatedHours: 20,
    isFree: true,
    price: null,
    addedAt: '2026-01-18T09:15:00',
  },
];

// ========== 장바구니 ==========
// CartItemResponse 타입에 맞게 플랫 구조로 정의 (cartItemId 사용)
export const mockCart = [
  {
    cartItemId: 1,
    courseTimeId: 2,
    courseTimeTitle: 'TypeScript 마스터 클래스 - 2024년 1기',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
    level: 'INTERMEDIATE',
    estimatedHours: 24,
    isFree: false,
    price: '129000',
    addedAt: '2026-01-28T11:00:00',
  },
  {
    cartItemId: 2,
    courseTimeId: 3,
    courseTimeTitle: 'AWS 클라우드 입문 - 2024년 2기',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    level: 'BEGINNER',
    estimatedHours: 16,
    isFree: false,
    price: '149000',
    addedAt: '2026-01-27T16:30:00',
  },
];

// ========== 수강 내역 ==========
// BackendEnrollmentResponse 형식에 맞게 정의
export const mockEnrollments = [
  {
    id: 1,
    userId: 14,
    courseTimeId: 1,
    enrolledAt: '2026-01-15T10:00:00',
    type: 'SELF',
    status: 'ENROLLED',
    enrollmentMethod: 'FIRST_COME',
    progressPercent: 65,
    score: null,
    completedAt: null,
    actualEndDate: null,
  },
  {
    id: 2,
    userId: 14,
    courseTimeId: 2,
    enrolledAt: '2026-02-01T09:00:00',
    type: 'SELF',
    status: 'ENROLLED',
    enrollmentMethod: 'FIRST_COME',
    progressPercent: 30,
    score: null,
    completedAt: null,
    actualEndDate: null,
  },
  {
    id: 3,
    userId: 14,
    courseTimeId: 3,
    enrolledAt: '2025-12-20T14:00:00',
    type: 'SELF',
    status: 'COMPLETED',
    enrollmentMethod: 'APPROVAL',
    progressPercent: 100,
    score: 92,
    completedAt: '2026-01-25T16:45:00',
    actualEndDate: '2026-01-25',
  },
];

export const mockCertificates = [
  {
    id: 1,
    userId: 1,
    enrollmentId: 3,
    courseName: 'AWS 클라우드 입문',
    certificateNumber: 'CERT-2024-001234',
    issuedAt: '2026-01-25T17:00:00',
    downloadUrl: '/api/certificates/1/download',
  },
];

export const mockCurriculum = {
  enrollmentId: 1,
  courseName: 'React 기초부터 실전까지',
  totalItems: 24,
  completedItems: 16,
  folders: [
    {
      id: 1,
      name: '1장. React 소개',
      order: 1,
      items: [
        { id: 1, name: 'React란 무엇인가?', type: 'VIDEO', duration: 600, isCompleted: true },
        { id: 2, name: 'React의 특징', type: 'VIDEO', duration: 480, isCompleted: true },
        { id: 3, name: '개발 환경 설정', type: 'VIDEO', duration: 720, isCompleted: true },
        { id: 4, name: '1장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: true },
      ],
    },
    {
      id: 2,
      name: '2장. JSX와 컴포넌트',
      order: 2,
      items: [
        { id: 5, name: 'JSX 기초', type: 'VIDEO', duration: 540, isCompleted: true },
        { id: 6, name: '함수형 컴포넌트', type: 'VIDEO', duration: 600, isCompleted: true },
        { id: 7, name: 'Props 전달하기', type: 'VIDEO', duration: 660, isCompleted: true },
        { id: 8, name: '2장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: true },
      ],
    },
    {
      id: 3,
      name: '3장. State와 이벤트',
      order: 3,
      items: [
        { id: 9, name: 'useState Hook', type: 'VIDEO', duration: 720, isCompleted: true },
        { id: 10, name: '이벤트 핸들링', type: 'VIDEO', duration: 600, isCompleted: true },
        { id: 11, name: '조건부 렌더링', type: 'VIDEO', duration: 540, isCompleted: true },
        { id: 12, name: '3장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: true },
      ],
    },
    {
      id: 4,
      name: '4장. 리스트와 폼',
      order: 4,
      items: [
        { id: 13, name: '리스트 렌더링', type: 'VIDEO', duration: 600, isCompleted: true },
        { id: 14, name: '폼 처리', type: 'VIDEO', duration: 720, isCompleted: true },
        { id: 15, name: '제어 컴포넌트', type: 'VIDEO', duration: 540, isCompleted: true },
        { id: 16, name: '4장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: true },
      ],
    },
    {
      id: 5,
      name: '5장. 고급 훅',
      order: 5,
      items: [
        { id: 17, name: 'useEffect', type: 'VIDEO', duration: 780, isCompleted: false },
        { id: 18, name: 'useContext', type: 'VIDEO', duration: 660, isCompleted: false },
        { id: 19, name: 'useReducer', type: 'VIDEO', duration: 720, isCompleted: false },
        { id: 20, name: '5장 퀴즈', type: 'QUIZ', duration: 300, isCompleted: false },
      ],
    },
    {
      id: 6,
      name: '6장. 실전 프로젝트',
      order: 6,
      items: [
        { id: 21, name: '프로젝트 소개', type: 'VIDEO', duration: 300, isCompleted: false },
        { id: 22, name: '프로젝트 구현', type: 'VIDEO', duration: 1800, isCompleted: false },
        { id: 23, name: '배포하기', type: 'VIDEO', duration: 600, isCompleted: false },
        { id: 24, name: '최종 평가', type: 'EXAM', duration: 600, isCompleted: false },
      ],
    },
  ],
};

// ========== 알림 ==========
// NotificationItem 타입에 맞게 정의
export const mockNotifications = [
  {
    id: 1,
    type: 'COURSE' as const,
    title: '수강신청 승인',
    message: 'TypeScript 마스터 클래스 - 2024년 1기 수강신청이 승인되었습니다.',
    isRead: false,
    createdAt: '2026-01-30T09:00:00',
    referenceId: 1,
    referenceType: 'ENROLLMENT',
    metadata: {
      courseName: 'TypeScript 마스터 클래스',
      courseTimeId: 2,
      enrollmentStatus: 'APPROVED' as const,
    },
  },
  {
    id: 2,
    type: 'SYSTEM' as const,
    title: '새로운 공지사항',
    message: '2월 시스템 점검 안내가 등록되었습니다.',
    isRead: false,
    createdAt: '2026-01-29T14:30:00',
    referenceId: 1,
    referenceType: 'NOTICE',
    metadata: {
      noticeCategory: '시스템',
    },
  },
  {
    id: 3,
    type: 'COMMENT' as const,
    title: '새 댓글',
    message: '김학습님이 회원님의 게시글에 댓글을 남겼습니다.',
    isRead: false,
    createdAt: '2026-01-29T11:20:00',
    referenceId: 5,
    referenceType: 'POST',
    actorId: 15,
    actorName: '김학습',
    metadata: {
      postTitle: 'React 상태 관리 질문입니다',
      postId: 5,
    },
  },
  {
    id: 4,
    type: 'LIKE' as const,
    title: '좋아요',
    message: '이개발님이 회원님의 게시글을 좋아합니다.',
    isRead: true,
    createdAt: '2026-01-28T16:45:00',
    referenceId: 3,
    referenceType: 'POST',
    actorId: 16,
    actorName: '이개발',
    metadata: {
      postTitle: 'AWS 자격증 취득 후기',
      postId: 3,
    },
  },
  {
    id: 5,
    type: 'COURSE' as const,
    title: '강의 시작 안내',
    message: 'React 기초부터 실전까지 강의가 시작되었습니다. 지금 바로 학습을 시작해보세요!',
    isRead: true,
    createdAt: '2026-01-28T10:00:00',
    referenceId: 1,
    referenceType: 'COURSE_TIME',
    metadata: {
      courseName: 'React 기초부터 실전까지',
      courseTimeId: 1,
    },
  },
  {
    id: 6,
    type: 'ASSIGNMENT' as const,
    title: '새 과제 등록',
    message: 'React 컴포넌트 만들기 과제가 출제되었습니다. 마감일: 2026-02-15',
    isRead: true,
    createdAt: '2026-01-27T09:00:00',
    referenceId: 1,
    referenceType: 'ASSIGNMENT',
    metadata: {
      assignmentName: 'React 컴포넌트 만들기',
      assignmentId: 1,
      dueDate: '2026-02-15',
    },
  },
  {
    id: 7,
    type: 'SYSTEM' as const,
    title: '환영합니다!',
    message: 'MZC Learn Platform에 오신 것을 환영합니다. 다양한 강의를 둘러보세요!',
    isRead: true,
    createdAt: '2026-01-15T10:00:00',
  },
  {
    id: 8,
    type: 'COURSE' as const,
    title: '수강 완료 축하드립니다!',
    message: 'AWS 클라우드 입문 강의를 완료하셨습니다. 수료증을 확인해보세요!',
    isRead: true,
    createdAt: '2026-01-25T17:00:00',
    referenceId: 3,
    referenceType: 'ENROLLMENT',
    metadata: {
      courseName: 'AWS 클라우드 입문',
      courseTimeId: 3,
    },
  },
];
