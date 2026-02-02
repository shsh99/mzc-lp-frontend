import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, Heart, Calendar, X, Star, Users } from 'lucide-react';
import { useThemeStore } from '@/store/common/themeStore';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { useCourseTimeCatalog, useCheckWishlistStatus, useToggleWishlist } from '@/hooks/tu';
import { useAuthStore } from '@/store/common/authStore';
import { useSubdomainPath } from '@/hooks/common';
import { toast } from 'sonner';
import { getLoginPath } from '@/utils/tenantUtils';
import type {
  CourseTimeCatalogResponse,
  CourseTimeCatalogParams,
  DeliveryType,
} from '@/types/tu/courseTimeCatalog.types';
import {
  DELIVERY_TYPE_LABELS,
  PROGRAM_LEVEL_LABELS,
} from '@/types/tu/courseTimeCatalog.types';

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

// 운영 방식 필터 옵션
const DELIVERY_TYPE_OPTIONS: { value: DeliveryType | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'ONLINE', label: '온라인' },
  { value: 'OFFLINE', label: '오프라인' },
  { value: 'BLENDED', label: '블렌디드' },
  { value: 'LIVE', label: '실시간' },
];

// 정렬 옵션
type SortOption = 'enrollEndDate,asc' | 'classStartDate,asc' | 'createdAt,desc' | 'price,asc' | 'price,desc';
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'enrollEndDate,asc', label: '마감임박순' },
  { value: 'classStartDate,asc', label: '개강일순' },
  { value: 'createdAt,desc', label: '최신순' },
  { value: 'price,asc', label: '가격 낮은순' },
  { value: 'price,desc', label: '가격 높은순' },
];

interface CourseTimeCardProps {
  courseTime: CourseTimeCatalogResponse;
  isDark: boolean;
}

/**
 * 날짜 포맷팅 (MM/DD)
 */
function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * CourseTime 카드 컴포넌트
 * 기존 CourseCard 디자인 유지 + CourseTime 정보 추가
 */
function CourseTimeCard({ courseTime, isDark }: CourseTimeCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { prefixPath } = useSubdomainPath();

  // 찜 상태 확인 및 토글
  const { data: isWishlisted = false, isLoading: isWishlistChecking } = useCheckWishlistStatus(
    courseTime.id,
    isAuthenticated
  );
  const { toggle: toggleWishlist, isLoading: isWishlistToggling } = useToggleWishlist();

  const isWishlistLoading = isWishlistChecking || isWishlistToggling;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      navigate(getLoginPath(), { state: { from: prefixPath(`/tu/b2c/times/${courseTime.id}`) } });
      return;
    }

    try {
      await toggleWishlist(courseTime.id, isWishlisted);
      toast.success(isWishlisted ? '찜 목록에서 제거되었습니다.' : '찜 목록에 추가되었습니다.');
    } catch {
      toast.error('찜 목록 변경에 실패했습니다.');
    }
  };

  // 태그 생성 (무료 태그 제거, 유료는 금액 표시)
  const tags: string[] = [];
  // 선발제 태그 (INVITE_ONLY)
  if (courseTime.enrollmentMethod === 'INVITE_ONLY') {
    tags.push('선발');
  }
  if (courseTime.isOnDemand) {
    tags.push('상시모집');
  } else if (courseTime.status === 'RECRUITING') {
    tags.push('모집중');
  } else if (courseTime.status === 'ONGOING') {
    tags.push('진행중');
  }

  // 주강사 찾기
  const mainInstructor = courseTime.instructors.find((i) => i.role === 'MAIN');
  const instructorName = mainInstructor?.name || courseTime.instructors[0]?.name || '';

  // 가격 표시: 유료 → 금액, 무료 → 표시 안함
  const price = parseFloat(courseTime.price);
  const priceDisplay = (!courseTime.isFree && price > 0) ? `₩${price.toLocaleString()}` : null;

  // 썸네일
  const thumbnailUrl =
    courseTime.program?.thumbnailUrl ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';

  // 레벨 라벨
  const levelLabel = courseTime.program?.level
    ? PROGRAM_LEVEL_LABELS[courseTime.program.level]
    : null;

  return (
    <Link to={prefixPath(`/tu/b2c/courses/${courseTime.id}`)} className="group block h-full">
      <div
        className={`h-full card-hover rounded-xl overflow-hidden border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={courseTime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg ${
                    tag === '선발'
                      ? 'bg-gradient-to-r from-[#a855f7] to-[#6778ff]'
                      : tag === '상시모집'
                        ? 'bg-gradient-to-r from-[#70f2a0] to-[#6bc2f0]'
                        : tag === '모집중'
                          ? 'bg-gradient-to-r from-[#6778ff] to-[#a855f7]'
                          : 'bg-gray-500'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 찜 버튼 */}
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 disabled:opacity-50 ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-black/50 text-white hover:bg-red-500'
            }`}
            aria-label={isWishlisted ? '찜 해제' : '찜하기'}
          >
            {isWishlistLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            )}
          </button>
        </div>

        {/* 정보 영역 */}
        <div className="p-4 space-y-2">
          {/* 제목 (2줄 말줄임) */}
          <h3
            className={`font-bold line-clamp-2 text-[15px] transition-colors h-11 ${
              isDark
                ? 'text-white group-hover:text-[#6bc2f0]'
                : 'text-gray-900 group-hover:text-[#6778ff]'
            }`}
          >
            {courseTime.title}
          </h3>

          {/* 강사명 */}
          {instructorName && (
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {instructorName}
            </div>
          )}

          {/* 별점 + 리뷰 수 (항상 표시) */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>4.5</span>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>({courseTime.currentEnrollment.toLocaleString()})</span>
          </div>

          {/* 메타 정보 (운영방식 · 레벨) */}
          <div className="flex items-center gap-2 text-xs">
            {/* 운영 방식 */}
            <span
              className={`px-2 py-0.5 rounded ${
                isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {DELIVERY_TYPE_LABELS[courseTime.deliveryType]}
            </span>

            {/* 레벨 */}
            {levelLabel && (
              <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{levelLabel}</span>
            )}
          </div>

          {/* 개강일 및 잔여석 (상시모집이 아닌 경우만) */}
          {!courseTime.isOnDemand && (
            <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3" />
              <span>
                {formatShortDate(courseTime.classStartDate)} 개강
              </span>
              {courseTime.availableSeats !== null && courseTime.availableSeats !== undefined && (
                <span className="ml-2 text-orange-500 font-medium">
                  잔여 {courseTime.availableSeats}석
                </span>
              )}
            </div>
          )}
        </div>

        {/* 하단 푸터 (가격 + 참여자 수) */}
        <div className="px-4 pb-4 flex items-center justify-between">
          {priceDisplay ? (
            <span className={`font-bold text-lg ${isDark ? 'text-[#6bc2f0]' : 'text-[#6778ff]'}`}>
              {priceDisplay}
            </span>
          ) : (
            <span />
          )}
          <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Users className="w-3.5 h-3.5" />
            <span>{courseTime.currentEnrollment.toLocaleString()}명</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CoursesExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<DeliveryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('enrollEndDate,asc');
  const [isFreeFilter, setIsFreeFilter] = useState<boolean | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // API 파라미터 구성
  const params: CourseTimeCatalogParams = {
    status: ['RECRUITING', 'ONGOING'], // 모집중, 진행중만 표시
    deliveryType: deliveryTypeFilter !== 'all' ? deliveryTypeFilter : undefined,
    isFree: isFreeFilter,
    keyword: searchQuery || undefined,
    categoryId: activeCategoryId ?? undefined,
    sort: sortBy,
    size: 20,
  };

  const { data, isLoading, error } = useCourseTimeCatalog(params);

  const courseTimes = data?.content || [];
  const totalCount = data?.totalElements || 0;

  // 활성화된 필터 개수 계산
  const activeFilterCount = [
    deliveryTypeFilter !== 'all',
    isFreeFilter !== undefined,
  ].filter(Boolean).length;

  // URL에서 검색어 및 카테고리 가져오기
  useEffect(() => {
    const search = searchParams.get('search');
    const categoryCode = searchParams.get('category');
    if (search) {
      setSearchQuery(search);
    }
    if (categoryCode) {
      const category = CATEGORY_OPTIONS.find((c) => c.code === categoryCode);
      if (category) {
        setActiveCategoryId(category.id);
      }
    }
  }, [searchParams]);

  // 검색어 변경 시 URL 업데이트
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setDeliveryTypeFilter('all');
    setIsFreeFilter(undefined);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'landing-dark bg-[#1e1e1e]' : 'landing-light bg-gray-50'}`}>
        <LandingHeader />
        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="flex items-center justify-center py-10 sm:py-12 md:py-16 lg:py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#6778ff]" />
            <span className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              강의를 불러오는 중...
            </span>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'landing-dark bg-[#1e1e1e]' : 'landing-light bg-gray-50'}`}>
        <LandingHeader />
        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="text-center py-10 sm:py-12 md:py-16 lg:py-20">
            <p className={`text-lg ${isDark ? 'text-red-400' : 'text-red-500'}`}>
              강의를 불러오는데 실패했습니다.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 landing-btn-primary rounded-full text-white"
            >
              다시 시도
            </button>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'landing-dark bg-[#1e1e1e]' : 'landing-light bg-gray-50'}`}>
      <LandingHeader />

      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 lg:py-12">
        {/* Page Title */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            전체 강의
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            원하는 강의를 찾아보세요
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="강의명으로 검색"
              className={`w-full rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6778ff] focus:border-transparent transition-all ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                  : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={`rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6778ff] cursor-pointer ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-3 transition-colors ${
                isFilterOpen || activeFilterCount > 0
                  ? 'bg-gradient-to-r from-[#6778ff] to-[#a855f7] text-white'
                  : isDark
                    ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              필터
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div
            className={`mb-8 p-6 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                필터
              </h3>
              <button
                onClick={handleResetFilters}
                className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                초기화
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 운영 방식 필터 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  운영 방식
                </label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDeliveryTypeFilter(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        deliveryTypeFilter === option.value
                          ? 'bg-[#6778ff] text-white'
                          : isDark
                            ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 무료/유료 필터 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  가격
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsFreeFilter(undefined)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isFreeFilter === undefined
                        ? 'bg-[#6778ff] text-white'
                        : isDark
                          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setIsFreeFilter(true)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isFreeFilter === true
                        ? 'bg-[#6778ff] text-white'
                        : isDark
                          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    무료
                  </button>
                  <button
                    onClick={() => setIsFreeFilter(false)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isFreeFilter === false
                        ? 'bg-[#6778ff] text-white'
                        : isDark
                          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    유료
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-10">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategoryId === cat.id
                  ? 'bg-gradient-to-r from-[#6778ff] to-[#a855f7] text-white shadow-lg shadow-[#6778ff]/25'
                  : isDark
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              적용된 필터:
            </span>
            {deliveryTypeFilter !== 'all' && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {DELIVERY_TYPE_OPTIONS.find((o) => o.value === deliveryTypeFilter)?.label}
                <button
                  onClick={() => setDeliveryTypeFilter('all')}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {isFreeFilter !== undefined && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isFreeFilter ? '무료' : '유료'}
                <button
                  onClick={() => setIsFreeFilter(undefined)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          총{' '}
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totalCount}
          </span>
          개의 강의
        </p>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {courseTimes.length > 0 ? (
            courseTimes.map((courseTime) => (
              <CourseTimeCard key={courseTime.id} courseTime={courseTime} isDark={isDark} />
            ))
          ) : (
            <p className={`col-span-full text-center py-10 sm:py-12 md:py-16 lg:py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              검색 결과가 없습니다.
            </p>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
