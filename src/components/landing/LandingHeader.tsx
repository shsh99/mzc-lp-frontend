import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Bell, Menu, X, LogOut, User, Sun, Moon, BookOpen, PlusCircle, Shield, Globe, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/common/auth';
import { useMyProfile, useSubdomainPath } from '@/hooks/common';
import { useThemeStore } from '@/store/common/themeStore';
import { useTranslation } from '@/store/common/languageStore';
import { useUnreadNotificationCount, useLatestUserNotice, usePublicNavigation, usePublicLayout } from '@/hooks/tu';
import { useTenantBranding } from '@/contexts/TenantBrandingContext';
import { useTenantFeatures } from '@/contexts/TenantFeaturesContext';
import type { NavigationItemResponse } from '@/types/tu/branding.types';

// 기본 네비게이션 메뉴 (fallback)
const DEFAULT_NAV_ITEMS: NavigationItemResponse[] = [
  { id: 1, label: '강의 탐색', icon: 'BookOpen', path: '/tu/b2c/courses', enabled: true, displayOrder: 1, target: null, createdAt: '', updatedAt: '' },
  { id: 2, label: '로드맵', icon: 'Map', path: '/tu/b2c/roadmaps', enabled: true, displayOrder: 2, target: null, createdAt: '', updatedAt: '' },
  { id: 3, label: '커뮤니티', icon: 'Users', path: '/tu/b2c/community', enabled: true, displayOrder: 3, target: null, createdAt: '', updatedAt: '' },
];

const BANNER_DISMISSED_KEY = 'tu_top_banner_dismissed';
const DISMISSED_NOTICE_ID_KEY = 'tu_dismissed_notice_id';

export function LandingHeader() {
  // 배너 닫힘 상태를 localStorage에서 읽어서 초기화
  const [showBanner, setShowBanner] = useState(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    return dismissed !== 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const { prefixPath } = useSubdomainPath();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: profile } = useMyProfile();
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const { data: unreadCountData } = useUnreadNotificationCount(isAuthenticated);
  const unreadCount = unreadCountData?.count || 0;
  const { data: latestNotice } = useLatestUserNotice(isAuthenticated);

  // 새 공지가 오면 배너를 다시 표시 (이전에 닫은 공지 ID와 다르면)
  useEffect(() => {
    if (latestNotice?.id) {
      const dismissedNoticeId = localStorage.getItem(DISMISSED_NOTICE_ID_KEY);
      if (dismissedNoticeId !== String(latestNotice.id)) {
        // 새 공지가 왔으므로 배너 다시 표시
        setShowBanner(true);
        localStorage.removeItem(BANNER_DISMISSED_KEY);
      }
    }
  }, [latestNotice?.id]);

  const { branding } = useTenantBranding();
  const { data: navigationItems } = usePublicNavigation();
  const { data: layoutData } = usePublicLayout();
  const { isFeatureEnabled } = useTenantFeatures();

  // 네비게이션 메뉴 (TA 설정 또는 기본값)
  // headerSettings.navLinks가 있으면 그것을 사용 (visible 필터링), 없으면 API 데이터 사용
  const headerNavLinks = (layoutData?.headerSettings as { navLinks?: Array<{ label: string; url: string; visible: boolean }> })?.navLinks;

  // URL 정규화: /courses -> /tu/b2c/courses (외부 링크는 제외)
  const normalizeNavUrl = (url: string) => {
    if (url.startsWith('http') || url.startsWith('/tu/')) return url;
    return `/tu/b2c${url.startsWith('/') ? url : `/${url}`}`;
  };

  const navItems = headerNavLinks && headerNavLinks.length > 0
    ? headerNavLinks
        .filter(link => link.visible)
        .map((link, index) => ({
          id: index + 1,
          label: link.label,
          icon: 'BookOpen',
          path: normalizeNavUrl(link.url),
          enabled: true,
          displayOrder: index + 1,
          target: null,
          createdAt: '',
          updatedAt: '',
        }))
    : (navigationItems && navigationItems.length > 0 ? navigationItems : DEFAULT_NAV_ITEMS);

  // 헤더 설정 (로고, 검색, 알림 표시 여부 등)
  const headerSettings = layoutData?.headerSettings;
  const headerEnabled = headerSettings?.enabled !== false; // 헤더 전체 on/off (기본값 true)
  const showLogo = headerSettings?.showLogo !== false; // 기본값 true
  const showSearch = headerSettings?.showSearch !== false; // 기본값 true
  const showNotifications = headerSettings?.showNotifications !== false; // 기본값 true
  const showThemeToggle = headerSettings?.showThemeToggle !== false; // 기본값 true
  // 유료 모드 확인
  const paidModeEnabled = isFeatureEnabled('paidModeEnabled');
  // 장바구니/위시리스트: 레이아웃 설정 + 기능 설정 + 유료모드 모두 확인
  // 무료 모드(paidModeEnabled=false)면 장바구니 숨김
  const showCart = (headerSettings?.showCart !== false) && isFeatureEnabled('cartEnabled') && paidModeEnabled;
  const showWishlist = (headerSettings?.showWishlist !== false) && isFeatureEnabled('wishlistEnabled');
  // 커뮤니티 기능 확인
  const communityEnabled = isFeatureEnabled('communityEnabled');
  // 사용자 강의 생성 기능 확인
  const userCourseCreationEnabled = isFeatureEnabled('userCourseCreationEnabled');

  // API Base URL
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '');

  // 프로필 이미지 URL 생성
  const profileImageUrl = profile?.profileImageUrl
    ? profile.profileImageUrl.startsWith('http')
      ? profile.profileImageUrl
      : `${apiBaseUrl}${profile.profileImageUrl}`
    : null;

  // 로고 URL 계산 (다크모드 우선)
  const logoUrl = isDark
    ? (branding?.darkLogoUrl || branding?.logoUrl)
    : branding?.logoUrl;

  const fullLogoUrl = logoUrl
    ? (logoUrl.startsWith('http') ? logoUrl : `${apiBaseUrl}${logoUrl}`)
    : null;

  const tenantName = branding?.tenantName || 'MZC Learn';

  // 상단 배너 설정 (TA에서 설정 가능)
  const topBannerSettings = (layoutData?.headerSettings as { topBanner?: { enabled?: boolean; text?: string; linkUrl?: string; linkText?: string } })?.topBanner;
  const topBannerEnabled = topBannerSettings?.enabled !== false; // 기본값 true

  // 최신 공지사항이 있으면 공지 내용을 표시, 없으면 기본 배너 텍스트 사용
  const topBannerText = latestNotice
    ? `📢 ${latestNotice.title}`
    : (topBannerSettings?.text || t.landing.banner);
  // 공지사항 클릭 시 알림 페이지 공지사항 탭으로 이동
  const topBannerLinkUrl = latestNotice ? `/tu/b2c/notifications?tab=SYSTEM` : topBannerSettings?.linkUrl;
  const topBannerLinkText = latestNotice ? '자세히 보기' : topBannerSettings?.linkText;

  // 배너 닫기 핸들러 (localStorage에 저장 + 공지 ID 기록)
  const handleCloseBanner = useCallback(() => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    // 공지사항이 있으면 해당 공지 ID를 저장 (새 공지가 오면 다시 표시)
    if (latestNotice?.id) {
      localStorage.setItem(DISMISSED_NOTICE_ID_KEY, String(latestNotice.id));
    }
    setShowBanner(false);
  }, [latestNotice?.id]);

  const handleLogout = () => {
    // 로그아웃 시 배너 닫힘 상태 리셋
    localStorage.removeItem(BANNER_DISMISSED_KEY);
    localStorage.removeItem(DISMISSED_NOTICE_ID_KEY);
    logout();
    setShowDropdown(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(prefixPath(`/tu/b2c/search?search=${encodeURIComponent(searchQuery.trim())}`));
    }
  };

  return (
    <header className="w-full flex flex-col">
      {/* Top Notification Banner - Gradient */}
      {showBanner && topBannerEnabled && (
        <div className="bg-gradient-to-r from-[#6778ff] via-[#a855f7] to-[#6bc2f0] text-white text-xs md:text-sm py-2.5 px-4 text-center font-medium flex justify-center items-center gap-2 relative">
          <span>{topBannerText}</span>
          {topBannerLinkUrl && topBannerLinkText && (
            topBannerLinkUrl.startsWith('http') ? (
              <a
                href={topBannerLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline ml-1"
              >
                {topBannerLinkText}
              </a>
            ) : (
              <Link
                to={prefixPath(topBannerLinkUrl)}
                className="underline hover:no-underline ml-1"
              >
                {topBannerLinkText}
              </Link>
            )
          )}
          <button
            onClick={handleCloseBanner}
            className="absolute right-4 text-white/70 hover:text-white text-lg transition-colors"
            aria-label={t.landing.closeBanner}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navigation - headerEnabled 설정에 따라 표시 */}
      {headerEnabled && (
        <div className={`w-full sticky top-0 z-50 border-b ${isDark ? 'glass-dark border-white/10' : 'border-gray-200'}`} style={{ backgroundColor: isDark ? undefined : '#fafafa' }}>
          <div className="w-full px-3 sm:px-4 md:px-8 lg:px-12 xl:px-16 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
            {/* Left: Logo & Menu */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-8 ml-0 md:ml-4">
              {/* Logo - showLogo 설정에 따라 표시 */}
              {showLogo && (
              <Link to={prefixPath('/tu/b2c')} className={`flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl tracking-tight ${isDark ? '' : 'text-gray-900'}`}>
                {fullLogoUrl ? (
                  <img src={fullLogoUrl} alt={tenantName} className="h-6 sm:h-8 object-contain" />
                ) : (
                  <>
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#6778ff] via-[#a855f7] to-[#6bc2f0] flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <span className="text-white font-bold text-sm sm:text-lg">M</span>
                    </div>
                    <span className="gradient-text font-bold hidden xs:inline">{tenantName}</span>
                  </>
                )}
              </Link>
            )}

            {/* Desktop Nav Links */}
            <nav className={`hidden md:flex items-center gap-8 font-medium text-[15px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {navItems
                .filter((item) => {
                  // 커뮤니티 링크는 communityEnabled가 false면 숨김
                  if (item.path.includes('/community') && !communityEnabled) {
                    return false;
                  }
                  return true;
                })
                .map((item) => {
                const isExternal = item.path.startsWith('http');
                const linkPath = isExternal ? item.path : prefixPath(item.path);

                return isExternal ? (
                  <a
                    key={item.id}
                    href={linkPath}
                    target={item.target || '_blank'}
                    rel="noopener noreferrer"
                    className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    to={linkPath}
                    className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center: Search Bar - showSearch 설정에 따라 표시 */}
          {showSearch && (
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.landing.searchPlaceholder}
                className={`w-full rounded-full pl-5 pr-12 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6778ff] focus:border-[#6778ff] transition-all ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                    : 'border border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                style={{ backgroundColor: isDark ? undefined : '#fafafa' }}
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#6778ff] to-[#a855f7] hover:from-[#8b99ff] hover:to-[#c084fc] w-9 h-9 flex items-center justify-center transition-colors"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </form>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 mr-0 md:mr-4">
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              {/* Theme Toggle Button - showThemeToggle 설정에 따라 표시 */}
              {showThemeToggle && (
                <button
                  onClick={toggleTheme}
                  className={`p-2.5 sm:p-2 rounded-lg transition-colors min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label={isDark ? t.landing.switchToLight : t.landing.switchToDark}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}
              {/* 장바구니 아이콘 - showCart 설정에 따라 표시 */}
              {showCart && (
                <Link
                  to={prefixPath('/tu/b2c/cart')}
                  className={`p-2.5 sm:p-2 rounded-lg transition-colors relative min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              )}
              {/* 위시리스트 아이콘 - showWishlist 설정에 따라 표시 */}
              {showWishlist && (
                <Link
                  to={prefixPath('/tu/b2c/wishlist')}
                  className={`p-2.5 sm:p-2 rounded-lg transition-colors relative min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                </Link>
              )}
              {/* 알림 아이콘 - showNotifications 설정에 따라 표시 */}
              {showNotifications && (
                <Link
                  to={prefixPath('/tu/b2c/notifications')}
                  className={`p-2.5 sm:p-2 rounded-lg transition-colors relative min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-gradient-to-r from-[#6778ff] to-[#a855f7] rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
              {isAuthenticated && user ? (
                /* Logged in state */
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                      isDark
                        ? 'bg-white/5 hover:bg-white/10'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6778ff] to-[#a855f7] flex items-center justify-center overflow-hidden">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`text-sm font-medium max-w-[100px] truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className={`absolute right-0 top-12 w-64 rounded-xl p-4 shadow-xl border ${
                      isDark
                        ? 'bg-[#151515] border-white/10'
                        : 'bg-white border-gray-200'
                    }`}>
                      {/* 프로필 정보 */}
                      <div className={`flex items-center gap-3 pb-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6778ff] to-[#a855f7] flex items-center justify-center overflow-hidden">
                          {profileImageUrl ? (
                            <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                          <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                        </div>
                      </div>

                      {/* 메뉴 항목들 */}
                      <div className="py-2 space-y-1">
                        <Link
                          to={prefixPath('/tu/b2c/mypage')}
                          onClick={() => setShowDropdown(false)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                            isDark
                              ? 'text-gray-300 hover:text-white hover:bg-white/10'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          {t.landing.mypage}
                        </Link>
                        {userCourseCreationEnabled && (
                          <Link
                            to={prefixPath('/tu/b2c/mypage/teaching')}
                            onClick={() => setShowDropdown(false)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                              isDark
                                ? 'text-gray-300 hover:text-white hover:bg-white/10'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <PlusCircle className="w-4 h-4" />
                            {t.landing.createCourse}
                          </Link>
                        )}
                      </div>

                      {/* 설정 메뉴 */}
                      <div className={`py-2 border-t space-y-1 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <p className={`px-3 py-1 text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t.landing.settings}</p>
                        <Link
                          to={prefixPath('/tu/b2c/mypage/profile')}
                          onClick={() => setShowDropdown(false)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            isDark
                              ? 'text-gray-300 hover:text-white hover:bg-white/10'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                          {t.landing.profileSecurity}
                        </Link>
                        <Link
                          to={prefixPath('/tu/b2c/mypage/notifications')}
                          onClick={() => setShowDropdown(false)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            isDark
                              ? 'text-gray-300 hover:text-white hover:bg-white/10'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                          {t.landing.notifications}
                        </Link>
                        <Link
                          to={prefixPath('/tu/b2c/mypage/language')}
                          onClick={() => setShowDropdown(false)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            isDark
                              ? 'text-gray-300 hover:text-white hover:bg-white/10'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <Globe className="w-4 h-4" />
                          {t.landing.languageRegion}
                        </Link>
                      </div>

                      {/* 로그아웃 */}
                      <div className={`pt-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                            isDark
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <LogOut className="w-4 h-4" />
                          {t.common.logout}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged out state */
                <>
                  <Link
                    to="/login"
                    className={`hidden md:flex px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isDark
                        ? 'landing-btn-outline text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t.common.login}
                  </Link>
                  <Link
                    to="/register"
                    className="hidden md:flex px-4 py-2 landing-btn-primary text-white font-bold rounded-full text-sm"
                  >
                    {t.common.signup}
                  </Link>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`p-2.5 md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg ${isDark ? 'text-gray-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}
                aria-label={t.landing.openMenu}
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {showMobileMenu && (
          <div className={`md:hidden border-t ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="px-4 py-3 space-y-1">
              {/* 네비게이션 링크 */}
              {navItems
                .filter((item) => !item.path.includes('/community') || communityEnabled)
                .map((item) => {
                  const isExternal = item.path.startsWith('http');
                  const linkPath = isExternal ? item.path : prefixPath(item.path);

                  return isExternal ? (
                    <a
                      key={item.id}
                      href={linkPath}
                      target={item.target || '_blank'}
                      rel="noopener noreferrer"
                      onClick={() => setShowMobileMenu(false)}
                      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.id}
                      to={linkPath}
                      onClick={() => setShowMobileMenu(false)}
                      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

              {/* 검색창 (모바일) */}
              {showSearch && (
                <form onSubmit={(e) => { handleSearch(e); setShowMobileMenu(false); }} className="pt-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.landing.searchPlaceholder}
                      className={`w-full rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6778ff] ${
                        isDark
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                          : 'border border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-gradient-to-r from-[#6778ff] to-[#a855f7]"
                    >
                      <Search className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </form>
              )}

              {/* 로그인/회원가입 버튼 (모바일) */}
              {!isAuthenticated && (
                <div className={`pt-3 mt-2 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className={`block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.common.login}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#6778ff] to-[#a855f7] hover:opacity-90"
                  >
                    {t.common.signup}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}
    </header>
  );
}
