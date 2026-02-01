import axiosInstance from '@/services/common/api/axiosInstance';
import type {
  CourseDetail,
  CourseCard,
  CourseFilterParams,
  CurriculumSection,
  CourseCategory,
} from '@/types/tu';
import type { PageResponse } from '@/services/tu/catalogService';

/**
 * 강의 상세 서비스
 * 강의 상세 정보 조회 및 관련 API 호출
 */

// 백엔드 CourseItem 응답 타입
interface BackendCourseItemResponse {
  itemId: number;
  itemName: string;
  depth: number;
  parentId: number | null;
  learningObjectId: number | null;
  isFolder: boolean;
  displayName: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// 백엔드 강의 상세 응답 타입
interface BackendCourseDetailResponse {
  courseId: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  type: 'ONLINE' | 'OFFLINE' | 'BLENDED';
  estimatedHours: number | null;
  categoryId: number | null;
  startDate: string | null;
  endDate: string | null;
  tags: string[];
  items: BackendCourseItemResponse[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  // Mock 데이터에서 제공하는 추가 필드
  rating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  instructorId?: number;
  instructorName?: string;
}

// 레벨 변환 매핑
const LEVEL_MAP: Record<string, string> = {
  BEGINNER: '입문',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
};

// 카테고리 변환 (categoryId → CourseCategory)
const getCategoryFromId = (categoryId: number | null): CourseCategory => {
  const categoryMap: Record<number, CourseCategory> = {
    1: 'dev',
    2: 'ai',
    3: 'cloud',
    4: 'data',
    5: 'design',
    6: 'business',
  };
  return categoryMap[categoryId || 0] || 'other';
};

// 백엔드 items를 커리큘럼 섹션으로 변환
const transformItemsToCurriculum = (items: BackendCourseItemResponse[]): CurriculumSection[] => {
  // 폴더(섹션)와 강의 아이템 분리
  const folders = items.filter(item => item.isFolder);
  const lectures = items.filter(item => !item.isFolder);

  // 폴더가 없으면 기본 섹션 하나 생성
  if (folders.length === 0) {
    return [{
      id: 1,
      title: '강의 목록',
      lectures: lectures.map((item, index) => ({
        id: item.itemId,
        title: item.displayName || item.itemName,
        duration: '00:00',
        isPreview: index === 0,
      })),
    }];
  }

  // 폴더별로 강의 그룹화
  return folders.map((folder, index) => ({
    id: folder.itemId,
    title: folder.displayName || folder.itemName,
    lectures: lectures
      .filter(lecture => lecture.parentId === folder.itemId)
      .map((lecture, lectureIndex) => ({
        id: lecture.itemId,
        title: lecture.displayName || lecture.itemName,
        duration: '00:00',
        isPreview: index === 0 && lectureIndex === 0,
      })),
  }));
};

// 백엔드 응답을 프론트엔드 CourseDetail로 변환
const transformCourseDetail = (backend: BackendCourseDetailResponse): CourseDetail => ({
  id: backend.courseId,
  title: backend.title,
  description: backend.description,
  thumbnailUrl: backend.thumbnailUrl || undefined,
  promoVideoUrl: undefined,
  category: getCategoryFromId(backend.categoryId),
  tags: backend.tags?.length > 0 ? backend.tags as CourseDetail['tags'] : [],

  // 가격 정보 (백엔드에 없으므로 기본값)
  price: 0,
  originalPrice: 0,
  discountRate: 0,

  // 통계 정보 (Mock 데이터에서 제공하면 사용)
  rating: backend.rating ?? 4.5,
  reviewCount: backend.reviewCount ?? 0,
  studentCount: backend.enrollmentCount ?? 0,

  // 강의 정보
  totalHours: backend.estimatedHours || 0,
  totalLectures: backend.itemCount,
  level: LEVEL_MAP[backend.level] || backend.level,
  lastUpdated: backend.updatedAt,

  // 상세 내용 (백엔드에 없으므로 기본값)
  whatYouLearn: [
    '이 강의의 핵심 개념을 이해합니다',
    '실무에 바로 적용할 수 있는 기술을 습득합니다',
    '프로젝트를 통해 실전 경험을 쌓습니다',
  ],
  requirements: [
    '기본적인 프로그래밍 지식',
    '학습에 대한 열정',
  ],

  // 커리큘럼
  curriculum: transformItemsToCurriculum(backend.items || []),

  // 강사 정보 (Mock 데이터에서 제공하면 사용)
  instructor: {
    id: backend.instructorId ?? 1,
    name: backend.instructorName || '강사',
    bio: '전문 강사입니다.',
    profileImage: undefined,
    courseCount: 1,
    studentCount: backend.enrollmentCount ?? 0,
    rating: backend.rating ?? 4.5,
  },

  // 메타 정보
  hasCertificate: true,
  isLifetimeAccess: true,
  createdAt: backend.createdAt,
  updatedAt: backend.updatedAt,
});

/**
 * 강의 상세 서비스
 */
export const courseDetailService = {
  /**
   * 강의 상세 조회
   * @param id 강의 ID
   */
  getCourseDetail: async (id: number): Promise<CourseDetail> => {
    const response = await axiosInstance.get<BackendCourseDetailResponse>(
      `/courses/${id}`
    );
    return transformCourseDetail(response.data);
  },

  /**
   * 강의 목록 조회 (카드 정보)
   * @param params 필터 파라미터
   */
  getCourses: async (params?: CourseFilterParams): Promise<PageResponse<CourseCard>> => {
    const response = await axiosInstance.get<PageResponse<CourseCard>>(
      '/courses/explore',
      { params }
    );
    return response.data;
  },

  /**
   * 인기 강의 조회
   * @param limit 조회 개수
   */
  getPopularCourses: async (limit: number = 10): Promise<CourseCard[]> => {
    const response = await axiosInstance.get<CourseCard[]>(
      '/courses/popular',
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * 추천 강의 조회
   * @param limit 조회 개수
   */
  getRecommendedCourses: async (limit: number = 10): Promise<CourseCard[]> => {
    const response = await axiosInstance.get<CourseCard[]>(
      '/courses/recommended',
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * 관련 강의 조회
   * @param courseId 기준 강의 ID
   * @param limit 조회 개수
   */
  getRelatedCourses: async (courseId: number, limit: number = 4): Promise<CourseCard[]> => {
    const response = await axiosInstance.get<CourseCard[]>(
      `/courses/${courseId}/related`,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * 강의 찜하기
   * @param courseId 강의 ID
   */
  addToWishlist: async (courseId: number): Promise<void> => {
    await axiosInstance.post(`/courses/${courseId}/wishlist`);
  },

  /**
   * 강의 찜하기 해제
   * @param courseId 강의 ID
   */
  removeFromWishlist: async (courseId: number): Promise<void> => {
    await axiosInstance.delete(`/courses/${courseId}/wishlist`);
  },

  /**
   * 장바구니에 강의 추가
   * @param courseId 강의 ID
   */
  addToCart: async (courseId: number): Promise<void> => {
    await axiosInstance.post('/cart/items', { courseId });
  },
};

export default courseDetailService;
