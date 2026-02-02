import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, ArrowRight, Loader2 } from 'lucide-react';
import {
  LandingHeader,
  HeroSection,
  LandingCourseCard,
  LandingFooter,
} from '@/components/landing';
import { useThemeStore } from '@/store/common/themeStore';
import { useTranslation } from '@/store/common/languageStore';
import { usePopularInstructors, useCourseTimeCatalog, usePublicLayout } from '@/hooks/tu';
import { useTenantBranding } from '@/contexts/TenantBrandingContext';
import { useTenantFeatures } from '@/contexts/TenantFeaturesContext';
import { useBrandingApply } from '@/hooks/tu/useBrandingApply';
import { useAuth } from '@/hooks/common/auth/useAuth';
import { useSubdomainPath } from '@/hooks/common';
import type { InstructorSummary } from '@/types/tu';
import type { CourseTimeCatalogResponse } from '@/types/tu/courseTimeCatalog.types';
import { DELIVERY_TYPE_LABELS, PROGRAM_LEVEL_LABELS } from '@/types/tu/courseTimeCatalog.types';

// API 사용 여부 플래그
const USE_INSTRUCTOR_API = false; // 강사 API 연동 시 true로 변경

// 더미 인기 강사 데이터
const dummyPopularInstructors: InstructorSummary[] = [
  {
    id: 1,
    name: '김클라우드',
    slug: 'kim-cloud',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    specialty: 'AWS / 클라우드 아키텍처',
    studentCount: 15420,
    courseCount: 8,
    rating: 4.9,
    description: 'AWS 공인 솔루션스 아키텍트. 10년간 엔터프라이즈 클라우드 구축 경험',
  },
  {
    id: 2,
    name: '이에이아이',
    slug: 'lee-ai',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    specialty: 'AI / 머신러닝',
    studentCount: 12350,
    courseCount: 6,
    rating: 4.8,
    description: 'OpenAI 공식 파트너사 AI 엔지니어. GPT, LLM 전문가',
  },
  {
    id: 3,
    name: '강리액트',
    slug: 'kang-react',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    specialty: 'React / TypeScript',
    studentCount: 18900,
    courseCount: 12,
    rating: 4.9,
    description: '네이버 시니어 프론트엔드 개발자 출신. React 생태계 전문가',
  },
  {
    id: 4,
    name: '박데이터',
    slug: 'park-data',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop',
    specialty: '데이터 분석 / Python',
    studentCount: 9870,
    courseCount: 5,
    rating: 4.7,
    description: '카카오 데이터 사이언티스트 출신. 실무 데이터 분석 전문',
  },
];

// 카테고리 옵션 (백엔드 카테고리 ID와 매핑)
// TODO: 추후 /api/public/categories API로 동적으로 변경
interface CategoryOption {
  id: number | null; // null은 전체
  name: string;
  code: string; // URL 파라미터용
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: null, name: '전체', code: 'all' },
  { id: 1, name: '개발', code: 'dev' },
  { id: 2, name: '클라우드', code: 'cloud' },
  { id: 3, name: '데이터', code: 'data' },
  { id: 4, name: '디자인', code: 'design' },
  { id: 5, name: '비즈니스', code: 'business' },
  { id: 6, name: 'DX', code: 'dx' },
  { id: 7, name: '기술', code: 'tech' },
  { id: 8, name: '커뮤니케이션', code: 'communication' },
];

/**
 * CourseTime 데이터를 LandingCourseCard props로 변환
 * @param courseTime CourseTime 데이터
 * @param paidModeEnabled 유료 모드 활성화 여부 (false면 가격 숨김)
 */
function convertCourseTimeToCardProps(courseTime: CourseTimeCatalogResponse, paidModeEnabled: boolean = true) {
  // 주강사 찾기
  const mainInstructor = courseTime.instructors.find((i) => i.role === 'MAIN');
  const instructorName = mainInstructor?.name || courseTime.instructors[0]?.name || '';

  // 가격 포맷팅 (유료 모드 + 유료 강의 → 금액, 그 외 → 표시 안함)
  const price = courseTime.isFree ? 0 : parseFloat(courseTime.price);
  const priceDisplay = (paidModeEnabled && !courseTime.isFree && price > 0) ? `₩${price.toLocaleString()}` : null;

  // 태그 생성 (무료 태그 제거)
  const tags: string[] = [];
  if (courseTime.isOnDemand) {
    tags.push('상시모집');
  } else if (courseTime.status === 'RECRUITING') {
    tags.push('모집중');
  } else if (courseTime.status === 'ONGOING') {
    tags.push('진행중');
  }

  // 썸네일
  const thumbnailUrl =
    courseTime.program?.thumbnailUrl ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';

  return {
    id: courseTime.id,
    title: courseTime.title,
    instructor: instructorName,
    price: priceDisplay,
    rating: courseTime.rating ?? 4.5,
    reviewCount: courseTime.reviewCount ?? courseTime.currentEnrollment,
    studentCount: courseTime.currentEnrollment, // 참여자 수
    image: thumbnailUrl,
    tags,
    category: courseTime.program?.categoryName || 'all',
    // 추가 정보
    deliveryType: DELIVERY_TYPE_LABELS[courseTime.deliveryType] || courseTime.deliveryType,
    level: courseTime.program?.level ? PROGRAM_LEVEL_LABELS[courseTime.program.level] : undefined,
    classStartDate: courseTime.classStartDate,
    availableSeats: courseTime.availableSeats,
    isOnDemand: courseTime.isOnDemand,
  };
}

/**
 * 랜딩 페이지 - 다크/라이트 테마 LMS 메인
 */
export function LandingPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { prefixPath } = useSubdomainPath();
  const isDark = theme === 'dark';
  const { branding } = useTenantBranding();

  // 기능 설정
  const { isFeatureEnabled } = useTenantFeatures();
  const paidModeEnabled = isFeatureEnabled('paidModeEnabled');

  // 브랜딩 CSS 적용
  useBrandingApply(branding);

  // 레이아웃 설정 (카테고리 등) - 항상 호출 (공개 API, X-Subdomain 헤더로 테넌트 식별)
  const { data: layoutData } = usePublicLayout();
  const landingPageSettings = layoutData?.landingPageSettings;
  const landingCategory = landingPageSettings?.landingCategory;

  // TA에서 설정한 카테고리가 있으면 사용, 없으면 기본 카테고리 사용
  const categoryOptions: CategoryOption[] = landingCategory?.enabled && landingCategory?.items?.length > 0
    ? [
        { id: null, name: '전체', code: 'all' },
        ...landingCategory.items.map((name, index) => ({
          id: index + 1,
          name,
          code: name.toLowerCase().replace(/\s+/g, '-'),
        })),
      ]
    : CATEGORY_OPTIONS;

  // CourseTime API로 강의 데이터 로드 (모집중/진행중, 카테고리 필터 적용)
  const { data: courseTimeData, isLoading: isCoursesLoading } = useCourseTimeCatalog({
    status: ['RECRUITING', 'ONGOING'],
    categoryId: activeCategoryId ?? undefined,
    size: 20,
    sort: 'createdAt,desc',
  });

  // 인기 강사 데이터 로드
  const { data: instructorsData, isLoading: isInstructorsLoading } = usePopularInstructors(4, USE_INSTRUCTOR_API);
  const popularInstructors = USE_INSTRUCTOR_API ? (instructorsData?.instructors ?? []) : dummyPopularInstructors;

  // CourseTime 데이터를 카드 props로 변환 (paidModeEnabled 전달)
  const courseTimes = courseTimeData?.content || [];
  const courses = courseTimes.map((ct) => convertCourseTimeToCardProps(ct, paidModeEnabled));

  // 현재 선택된 카테고리 정보 가져오기
  const activeCategory = categoryOptions.find((c) => c.id === activeCategoryId);

  // API에서 이미 categoryId로 필터링됨, 추가 클라이언트 필터링 불필요
  const filteredCourses = courses;

  // 최신 강의 (createdAt 기준 정렬이므로 처음 5개)
  const newCourses = courses.slice(0, 5);

  // 추천 강의 (상시모집 우선)
  const featuredCourses = courses
    .filter((c) => c.tags.includes('상시모집'))
    .slice(0, 5);
  const recommendedCourses = featuredCourses.length > 0 ? featuredCourses : courses.slice(0, 5);

  return (
    <div className={`min-h-screen dark-scrollbar tu-landing ${isDark ? 'landing-dark' : 'landing-light'}`}>
      <LandingHeader />

      <main>
        {/* Hero Section (TA 배너 + 기본 슬라이드 통합) */}
        <HeroSection />

        {/* Search/Category Bar */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 lg:py-12">
          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {categoryOptions.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300
                  ${
                    activeCategoryId === cat.id
                      ? 'landing-btn-primary shadow-lg'
                      : 'landing-chip-inactive'
                  }
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Section 1: User's choice */}
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-10 sm:pb-12 md:pb-16 lg:pb-20">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold landing-text-primary">
                {activeCategoryId === null
                  ? t.landing.featuredCourses
                  : `${activeCategory?.name ?? ''} ${t.landing.relatedCourses}`}
              </h2>
              <p className="landing-text-muted text-sm mt-2">{t.landing.featuredCoursesDesc}</p>
            </div>
            <Link
              to={prefixPath('/tu/b2c/courses')}
              className="text-sm landing-text-secondary hover:opacity-80 flex items-center gap-1 transition-colors"
            >
              {t.landing.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isCoursesLoading ? (
            <div className="flex justify-center items-center py-10 sm:py-12 md:py-16 lg:py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#6778ff]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.slice(0, 10).map((course) => <LandingCourseCard key={course.id} {...course} />)
              ) : (
                <p className="col-span-5 text-center landing-text-muted py-10">
                  {t.landing.noCoursesInCategory}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Featured Section 2: New Arrivals */}
        <section className="landing-section-alt py-10 sm:py-12 md:py-16 lg:py-20">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold landing-text-primary">{t.landing.newCourses}</h2>
                <p className="landing-text-muted text-sm mt-2">{t.landing.newCoursesDesc}</p>
              </div>
              <a
                href="/tu/b2c/courses"
                className="text-sm landing-text-secondary hover:opacity-80 flex items-center gap-1 transition-colors"
              >
                {t.landing.viewAll} <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {isCoursesLoading ? (
              <div className="flex justify-center items-center py-10 sm:py-12 md:py-16 lg:py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#6778ff]" />
              </div>
            ) : newCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {newCourses.map((course) => (
                  <LandingCourseCard key={`new-${course.id}`} {...course} />
                ))}
              </div>
            ) : (
              <p className="col-span-5 text-center landing-text-muted py-10">
                해당 카테고리에 강의가 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* Featured Section 3: Recommendation */}
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-10 sm:py-12 md:py-16 lg:py-20">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold landing-text-primary">{t.landing.beginnerCourses}</h2>
              <p className="landing-text-muted text-sm mt-2">{t.landing.beginnerCoursesDesc}</p>
            </div>
            <Link
              to={prefixPath('/tu/b2c/courses')}
              className="text-sm landing-text-secondary hover:opacity-80 flex items-center gap-1 transition-colors"
            >
              {t.landing.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {isCoursesLoading ? (
            <div className="flex justify-center items-center py-10 sm:py-12 md:py-16 lg:py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#6778ff]" />
            </div>
          ) : recommendedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {recommendedCourses.map((course) => (
                <LandingCourseCard key={`rec-${course.id}`} {...course} />
              ))}
            </div>
          ) : (
            <p className="col-span-5 text-center landing-text-muted py-10">
              해당 카테고리에 강의가 없습니다.
            </p>
          )}
        </section>

        {/* Popular Instructors Section */}
        <section className="landing-section-alt py-10 sm:py-12 md:py-16 lg:py-20">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold landing-text-primary">
                  인기 강사
                </h2>
                <p className="landing-text-muted text-sm mt-2">
                  수강생들이 가장 많이 찾는 검증된 전문가들을 만나보세요
                </p>
              </div>
            </div>

            {isInstructorsLoading ? (
              <div className="flex justify-center items-center py-10 sm:py-12 md:py-16 lg:py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#6778ff]" />
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularInstructors.map((instructor) => (
                <Link
                  key={instructor.id}
                  to={prefixPath(`/tu/b2c/instructors/${instructor.id}`)}
                  className={`group block rounded-2xl p-6 transition-all duration-300 border ${
                    isDark
                      ? 'glass border-white/10 hover:border-[#6778ff]/50'
                      : 'bg-white border-gray-200 hover:border-[#6778ff] hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={instructor.profileImage}
                      alt={instructor.name}
                      className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-white/20 group-hover:ring-[#6778ff]/30 transition-all"
                    />
                    <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {instructor.name}
                    </h3>
                    <p className="text-[#6778ff] text-sm font-medium mb-2">
                      {instructor.specialty}
                    </p>
                    <p className={`text-xs mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {instructor.description}
                    </p>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {instructor.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="text-center">
                        <span className={`font-semibold block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {instructor.studentCount.toLocaleString()}
                        </span>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>수강생</p>
                      </div>
                      <div className="text-center">
                        <span className={`font-semibold block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {instructor.courseCount}
                        </span>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>강의</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
        </section>

        {/* Become Instructor CTA Section */}
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-10 sm:py-12 md:py-16 lg:py-20">
          <div className={`relative overflow-hidden rounded-3xl ${
            isDark
              ? 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23]'
              : 'bg-gradient-to-br from-[#6778ff] via-[#8b5cf6] to-[#6366f1]'
          }`}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                  당신의 지식을 나누어 보세요
                </h2>
                <p className="text-white/80 text-lg max-w-xl">
                  전문 지식을 가진 분들을 위한 강사 프로그램에 참여하세요.
                  수천 명의 수강생들에게 영감을 주고, 수익도 창출하세요.
                </p>
              </div>
              <Link
                to={isAuthenticated ? prefixPath("/tu/b2c/mypage/teaching") : "/login"}
                className="flex items-center gap-2 px-8 py-4 bg-white text-[#6778ff] font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                강사 시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
