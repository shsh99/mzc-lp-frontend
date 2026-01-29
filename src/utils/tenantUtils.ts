/**
 * 테넌트 식별 유틸리티
 *
 * 도메인 구조:
 * - Subdomain: {subdomain}.mzclearn.com
 * - Custom Domain: company.com
 * - Path-based (개발): localhost:3000/{subdomain}/tu/*
 */

export interface TenantIdentifier {
  type: 'subdomain' | 'customDomain';
  identifier: string;
}

/**
 * URL 경로에서 서브도메인 추출 (개발 환경용)
 * 경로 패턴: /{subdomain}/tu/* 또는 /{subdomain}/ta/* 또는 /{subdomain}/login 등
 *
 * @example
 * /mzc/tu/b2c/courses → 'mzc'
 * /samsung/ta/dashboard → 'samsung'
 * /mzc/login → 'mzc'
 * /mzc/register → 'mzc'
 * /mzc/admin/login → 'mzc'
 * /mzc/select-role → 'mzc'
 */
export function extractSubdomainFromPath(): string | null {
  const pathname = window.location.pathname;

  // 경로 기반 서브도메인 패턴: /{subdomain}/(tu|ta|co|admin|login|register|select-role)/...
  const regex = /^\/([^/]+)\/(tu|ta|co|admin|login|register|select-role)(\/|$)/;
  const match = regex.exec(pathname);
  const subdomain = match?.[1];

  if (subdomain) {
    // 시스템 경로는 제외 (admin은 서브도메인으로 허용 - /{subdomain}/admin/login 패턴)
    if (['sa', 'auth', 'public'].includes(subdomain)) {
      return null;
    }
    // admin만 단독으로 오는 경우 (/admin/login)는 서브도메인이 아님
    if (subdomain === 'admin') {
      return null;
    }
    return subdomain;
  }

  return null;
}

/**
 * 플랫폼 도메인 목록 (테넌트로 인식하지 않음)
 * Vercel, Netlify 등 배포 플랫폼 도메인 포함
 */
const PLATFORM_DOMAINS = [
  'vercel.app',
  'netlify.app',
  'pages.dev',  // Cloudflare Pages
  'github.io',
];

/**
 * 현재 호스트네임 또는 경로에서 테넌트 식별자 추출
 *
 * 예시:
 * - samsung.mzclearn.com → { type: 'subdomain', identifier: 'samsung' }
 * - company.com → { type: 'customDomain', identifier: 'company.com' }
 * - localhost:3000/mzc/tu/b2c → { type: 'subdomain', identifier: 'mzc' } (경로 기반)
 * - localhost:3000 → null (개발 환경, 기본 테넌트)
 * - xxx.vercel.app → null (Vercel 배포, 기본 테넌트)
 */
export function extractTenantIdentifier(): TenantIdentifier | null {
  const hostname = window.location.hostname;

  // 로컬 개발 환경 - 경로 기반 서브도메인 또는 커스텀 도메인 확인
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const pathSubdomain = extractSubdomainFromPath();
    if (pathSubdomain) {
      // 도메인 형태인지 확인 (.com, .net, .org 등 포함)
      const isCustomDomain = /\.[a-z]{2,}$/i.test(pathSubdomain);
      return {
        type: isCustomDomain ? 'customDomain' : 'subdomain',
        identifier: pathSubdomain
      };
    }
    return null; // 기본 브랜딩 사용
  }

  // 플랫폼 도메인 (Vercel, Netlify 등) - 기본 브랜딩 사용
  const isPlatformDomain = PLATFORM_DOMAINS.some(domain => hostname.endsWith(`.${domain}`));
  if (isPlatformDomain) {
    // 경로 기반 서브도메인 확인 (예: /mzc/tu/b2c)
    const pathSubdomain = extractSubdomainFromPath();
    if (pathSubdomain) {
      return { type: 'subdomain', identifier: pathSubdomain };
    }
    return null; // 기본 브랜딩 사용
  }

  // 메인 도메인 패턴 (예: mzclearn.com)
  const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || 'mzclearn.com';

  // Subdomain 확인
  if (hostname.endsWith(`.${mainDomain}`)) {
    const subdomain = hostname.replace(`.${mainDomain}`, '');
    // www는 메인 도메인으로 처리
    if (subdomain === 'www' || subdomain === '') {
      return null;
    }
    return { type: 'subdomain', identifier: subdomain };
  }

  // 메인 도메인 자체 (mzclearn.com)
  if (hostname === mainDomain || hostname === `www.${mainDomain}`) {
    return null;
  }

  // Custom Domain
  return { type: 'customDomain', identifier: hostname };
}

/**
 * 서브도메인을 유지하는 로그인 경로 반환
 * @example
 * /mzc/tu/b2c → '/mzc/login'
 * /samsung/ta/dashboard → '/samsung/login'
 * /login → '/login'
 */
export function getLoginPath(): string {
  const subdomain = extractSubdomainFromPath();
  return subdomain ? `/${subdomain}/login` : '/login';
}

/**
 * 서브도메인을 유지하는 회원가입 경로 반환
 */
export function getRegisterPath(): string {
  const subdomain = extractSubdomainFromPath();
  return subdomain ? `/${subdomain}/register` : '/register';
}

/**
 * 서브도메인을 유지하는 홈 경로 반환
 */
export function getHomePath(): string {
  const subdomain = extractSubdomainFromPath();
  return subdomain ? `/${subdomain}/tu/b2c` : '/';
}

/**
 * 서브도메인을 유지하는 어드민 로그인 경로 반환
 * @example
 * /mzc/ta/dashboard → '/mzc/admin/login'
 * /ta/dashboard → '/admin/login'
 */
export function getAdminLoginPath(): string {
  const subdomain = extractSubdomainFromPath();
  return subdomain ? `/${subdomain}/admin/login` : '/admin/login';
}
