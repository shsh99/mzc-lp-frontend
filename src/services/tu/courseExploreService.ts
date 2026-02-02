/**
 * 강의 탐색(Course Explore) API 서비스
 */

import axiosInstance from '@/services/common/api/axiosInstance';
import type {
  CourseExploreResponse,
  CourseCategoryResponse,
  CourseExploreFilter,
  CourseExploreItem,
} from '@/types/tu/courseExplore.types';
import type { PageResponse } from '@/types/common';

const BASE_URL = '/courses';

// 백엔드 응답 타입
interface BackendCourseResponse {
  courseId: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  type: 'ONLINE' | 'OFFLINE' | 'BLENDED';
  estimatedHours: number | null;
  categoryId: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Mock 데이터에서 제공하는 추가 필드
  rating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  instructorName?: string;
}

// 백엔드 응답을 프론트엔드 형식으로 변환
const transformCourse = (course: BackendCourseResponse): CourseExploreItem => ({
  id: course.courseId,
  title: course.title,
  instructor: course.instructorName || '강사명',
  originalPrice: 0,
  price: 0,
  image: course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
  discount: 0,
  rating: course.rating ?? 4.5,
  reviewCount: course.reviewCount ?? 0,
  studentCount: course.enrollmentCount ?? 0,
  totalHours: course.estimatedHours || 0,
  category: course.categoryId?.toString() || 'dev',
  level: course.level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
  isNew: new Date(course.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),  // 7일 이내
  isBestseller: false,
  tags: course.tags,
});

export const courseExploreService = {
  /**
   * 강의 목록 조회 (탐색용)
   */
  getCourses: async (filter?: CourseExploreFilter): Promise<CourseExploreResponse> => {
    const params = new URLSearchParams();

    if (filter?.search) {
      params.append('keyword', filter.search);
    }
    if (filter?.category && filter.category !== 'all') {
      params.append('categoryId', filter.category);
    }
    if (filter?.page) {
      params.append('page', String(filter.page));
    }
    if (filter?.pageSize) {
      params.append('size', String(filter.pageSize));
    }

    const query = params.toString();
    const url = query ? `${BASE_URL}?${query}` : BASE_URL;
    const response = await axiosInstance.get<PageResponse<BackendCourseResponse>>(url);

    const pageData = response.data;
    return {
      courses: pageData.content.map(transformCourse),
      totalCount: pageData.totalElements,
      page: pageData.number,
      pageSize: pageData.size,
      totalPages: pageData.totalPages,
    };
  },

  /**
   * 카테고리 목록 조회
   */
  getCategories: async (): Promise<CourseCategoryResponse> => {
    // 카테고리 API가 없으므로 기본 카테고리 반환
    return {
      categories: [
        { id: 'all', name: '전체', count: 0 },
        { id: 'dev', name: '개발', count: 0 },
        { id: 'ai', name: 'AI', count: 0 },
        { id: 'data', name: '데이터', count: 0 },
        { id: 'design', name: '디자인', count: 0 },
      ],
    };
  },

  /**
   * 인기 강의 조회
   */
  getPopularCourses: async (limit?: number): Promise<CourseExploreResponse> => {
    const size = limit || 10;
    const response = await axiosInstance.get<PageResponse<BackendCourseResponse>>(`${BASE_URL}?size=${size}`);
    const pageData = response.data;
    return {
      courses: pageData.content.map(transformCourse),
      totalCount: pageData.totalElements,
      page: pageData.number,
      pageSize: pageData.size,
      totalPages: pageData.totalPages,
    };
  },

  /**
   * 신규 강의 조회
   */
  getNewCourses: async (limit?: number): Promise<CourseExploreResponse> => {
    const size = limit || 10;
    const response = await axiosInstance.get<PageResponse<BackendCourseResponse>>(`${BASE_URL}?size=${size}`);
    const pageData = response.data;
    return {
      courses: pageData.content.map(transformCourse),
      totalCount: pageData.totalElements,
      page: pageData.number,
      pageSize: pageData.size,
      totalPages: pageData.totalPages,
    };
  },

  /**
   * 추천 강의 조회
   */
  getRecommendedCourses: async (limit?: number): Promise<CourseExploreResponse> => {
    const size = limit || 10;
    const response = await axiosInstance.get<PageResponse<BackendCourseResponse>>(`${BASE_URL}?size=${size}`);
    const pageData = response.data;
    return {
      courses: pageData.content.map(transformCourse),
      totalCount: pageData.totalElements,
      page: pageData.number,
      pageSize: pageData.size,
      totalPages: pageData.totalPages,
    };
  },
};
