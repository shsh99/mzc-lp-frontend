import { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { usePublicBranding } from '@/hooks/tu/usePublicBranding';
import { useBrandingApply } from '@/hooks/tu/useBrandingApply';
import { extractTenantIdentifier } from '@/utils/tenantUtils';
import { useAuthStore } from '@/store/common/authStore';
import { tenantSettingsService } from '@/services/ta/tenantSettingsService';
import type { PublicBrandingResponse } from '@/types/tu/branding.types';
import { designTokens } from '@/styles/admin-design-tokens';

interface TenantBrandingContextValue {
  branding: PublicBrandingResponse | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

const TenantBrandingContext = createContext<TenantBrandingContextValue | undefined>(undefined);

/** 기본 브랜딩 (SA 등 tenantId가 없는 사용자용) */
const DEFAULT_BRANDING: PublicBrandingResponse = {
  tenantName: 'MZC LMS',
  primaryColor: designTokens.button.brand_default,
  secondaryColor: designTokens.button.brand_hover,
  logoUrl: null,
  darkLogoUrl: null,
  faviconUrl: null,
  accentColor: null,
  headingFont: null,
  bodyFont: null,
};

/**
 * 인증된 사용자용 브랜딩 조회 Hook
 */
function useAuthenticatedBranding(enabled: boolean) {
  return useQuery({
    queryKey: ['tenant-branding', 'authenticated'],
    queryFn: () => tenantSettingsService.getBranding(),
    enabled,
    staleTime: 1000 * 60 * 30, // 30분 캐싱
    gcTime: 1000 * 60 * 60, // 1시간 가비지 컬렉션
    retry: 1,
  });
}

export function TenantBrandingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  // 경로 변경 시 tenant identifier 재추출 (useMemo로 경로 기반 재계산)
  const tenantIdentifier = useMemo(() => {
    return extractTenantIdentifier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // SA 사용자인지 확인 (tenantId가 없는 인증된 사용자)
  const isSystemAdmin = isAuthenticated && !user?.tenantId;

  // SA에서 "사이트 열기"로 접근한 경우 자동 로그아웃
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasFromSaParam = params.get('from_sa') === 'true';

    console.log('[TenantBranding] from_sa check:', {
      hasFromSaParam,
      isSystemAdmin,
      isAuthenticated,
      userTenantId: user?.tenantId,
      locationSearch: location.search,
    });

    if (hasFromSaParam && isSystemAdmin) {
      console.log('[TenantBranding] SA accessed from domain management, logging out...');

      // 토큰 백업
      const { accessToken, refreshToken, user: currentUser } = useAuthStore.getState();
      if (accessToken && refreshToken && currentUser) {
        sessionStorage.setItem('sa_backup_token', JSON.stringify({
          accessToken,
          refreshToken,
          user: currentUser,
        }));
        console.log('[TenantBranding] Token backed up to sessionStorage');
      }

      logout();
      console.log('[TenantBranding] Logged out');

      // URL에서 from_sa 파라미터 제거
      params.delete('from_sa');
      const newSearch = params.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, isSystemAdmin, isAuthenticated, user?.tenantId, logout]);

  // SA가 다른 테넌트 경로로 이동하면 자동 로그아웃 (토큰 백업)
  useEffect(() => {
    console.log('[TenantBranding] Logout check:', {
      isSystemAdmin,
      tenantIdentifier,
      pathname: location.pathname,
      startsWithSa: location.pathname.startsWith('/sa'),
    });

    if (isSystemAdmin && tenantIdentifier && !location.pathname.startsWith('/sa')) {
      console.log('[TenantBranding] Logging out SA and backing up token...');
      // SA가 특정 테넌트 경로로 이동하면 토큰 백업 후 로그아웃
      const { accessToken, refreshToken, user: currentUser } = useAuthStore.getState();
      if (accessToken && refreshToken && currentUser) {
        // sessionStorage에 토큰 백업
        sessionStorage.setItem('sa_backup_token', JSON.stringify({
          accessToken,
          refreshToken,
          user: currentUser,
        }));
        console.log('[TenantBranding] Token backed up to sessionStorage');
      }
      logout();
      console.log('[TenantBranding] Logged out');
    }
  }, [isSystemAdmin, tenantIdentifier, location.pathname, logout]);

  // SA가 /sa로 돌아오면 백업된 토큰 자동 복원
  useEffect(() => {
    const backupData = sessionStorage.getItem('sa_backup_token');
    if (backupData && location.pathname.startsWith('/sa') && !isAuthenticated) {
      try {
        const { accessToken, refreshToken, user: backupUser } = JSON.parse(backupData);
        const { setAuth } = useAuthStore.getState();
        setAuth(backupUser, accessToken, refreshToken);
        // 복원 후 백업 데이터 삭제
        sessionStorage.removeItem('sa_backup_token');
      } catch (error) {
        console.error('Failed to restore SA session:', error);
        sessionStorage.removeItem('sa_backup_token');
      }
    }
  }, [location.pathname, isAuthenticated]);

  // 1. 인증된 사용자(tenantId 있음): tenantId 기반 브랜딩 조회
  const {
    data: authBranding,
    isLoading: authLoading,
    error: authError,
  } = useAuthenticatedBranding(isAuthenticated && !!user?.tenantId);

  // 2. 비로그인 사용자: 도메인 기반 브랜딩 조회
  const {
    data: publicBranding,
    isLoading: publicLoading,
    error: publicError,
  } = usePublicBranding(
    tenantIdentifier?.identifier,
    tenantIdentifier?.type
  );

  // 브랜딩 결정 로직
  const { branding, isLoading, error } = useMemo(() => {
    // SA 사용자가 /sa 경로에 있는 경우: 기본 브랜딩 사용
    if (isSystemAdmin && location.pathname.startsWith('/sa')) {
      return { branding: DEFAULT_BRANDING, isLoading: false, error: null };
    }
    // SA 사용자가 특정 테넌트 경로에 있는 경우: 해당 테넌트 브랜딩 사용
    if (isSystemAdmin && tenantIdentifier) {
      return { branding: publicBranding, isLoading: publicLoading, error: publicError };
    }
    // SA 사용자이지만 tenantIdentifier가 없는 경우: 기본 브랜딩
    if (isSystemAdmin) {
      return { branding: DEFAULT_BRANDING, isLoading: false, error: null };
    }
    // 인증된 사용자(tenantId 있음): authBranding 사용
    if (isAuthenticated && user?.tenantId) {
      return { branding: authBranding, isLoading: authLoading, error: authError };
    }
    // 비로그인 사용자: publicBranding 사용
    return { branding: publicBranding, isLoading: publicLoading, error: publicError };
  }, [isSystemAdmin, location.pathname, tenantIdentifier, isAuthenticated, user?.tenantId, authBranding, authLoading, authError, publicBranding, publicLoading, publicError]);

  // 브랜딩을 전역 CSS 변수로 적용
  useBrandingApply(branding);

  return (
    <TenantBrandingContext.Provider value={{ branding, isLoading, error }}>
      {children}
    </TenantBrandingContext.Provider>
  );
}

export function useTenantBranding() {
  const context = useContext(TenantBrandingContext);
  if (context === undefined) {
    throw new Error('useTenantBranding must be used within TenantBrandingProvider');
  }
  return context;
}
