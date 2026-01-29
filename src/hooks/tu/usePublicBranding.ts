import { useQuery } from '@tanstack/react-query';
import { publicBrandingService } from '@/services/tu/publicBrandingService';
import type { PublicBrandingResponse } from '@/types/tu/branding.types';

export const publicBrandingKeys = {
  all: ['publicBranding'] as const,
  byIdentifier: (identifier: string, type: string) =>
    [...publicBrandingKeys.all, identifier, type] as const,
};

/**
 * 공개 브랜딩 정보 조회 Hook
 *
 * @param identifier - subdomain 또는 customDomain 값
 * @param type - 'subdomain' 또는 'customDomain'
 */
export function usePublicBranding(
  identifier: string | null | undefined,
  type: 'subdomain' | 'customDomain' = 'subdomain'
) {
  return useQuery({
    queryKey: publicBrandingKeys.byIdentifier(identifier || '', type),
    queryFn: (): Promise<PublicBrandingResponse> => {
      if (!identifier) {
        // identifier가 없으면 기본 브랜딩 사용
        return Promise.resolve({
          tenantName: 'MZC LMS',
          logoUrl: null,
          darkLogoUrl: null,
          faviconUrl: null,
          primaryColor: '#6778ff',
          secondaryColor: '#a855f7',
          accentColor: '#10B981',
          headingFont: 'Pretendard',
          bodyFont: 'Pretendard',
        });
      }
      return publicBrandingService.getPublicBranding(identifier, type);
    },
    staleTime: 1000 * 60 * 30, // 30분 캐싱
    gcTime: 1000 * 60 * 60, // 1시간 가비지 컬렉션
    retry: 1,
    enabled: true, // 항상 활성화
  });
}
