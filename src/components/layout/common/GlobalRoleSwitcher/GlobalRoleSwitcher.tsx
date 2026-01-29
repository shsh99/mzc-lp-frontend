import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Shield, Briefcase, BookOpen, GraduationCap, Loader2, Pencil } from 'lucide-react';
import type { SidebarColors } from '@/types';
import type { TenantRole } from '@/types/common/auth.types';
import { cn } from '@/utils/cn';
import { useSubdomainPath } from '@/hooks/common';
import { useAuthStore } from '@/store/common/authStore';
import { authService } from '@/services/common/authService';

// 글로벌 역할 타입 (TA, CO, TU, DS, USER)
export type GlobalRole = 'TA' | 'CO' | 'TU' | 'DS' | 'USER';

interface GlobalRoleSwitcherProps {
  currentRole: GlobalRole;
  isExpanded: boolean;
  language: 'ko' | 'en';
  colors: SidebarColors;
  isDarkMode?: boolean;
}

// 역할별 아이콘
const roleIcons: Record<GlobalRole, typeof Shield> = {
  TA: Shield,
  CO: Briefcase,
  TU: BookOpen,
  DS: Pencil,
  USER: GraduationCap,
};

// 역할별 라벨
const roleLabels: Record<GlobalRole, { ko: string; en: string }> = {
  TA: { ko: '관리자', en: 'Admin' },
  CO: { ko: '교육 운영자', en: 'Course Operator' },
  TU: { ko: '강사', en: 'Instructor' },
  DS: { ko: '강사', en: 'Instructor' },
  USER: { ko: '학습자', en: 'Learner' },
};

// 역할별 기본 경로
const roleDefaultPaths: Record<Exclude<GlobalRole, 'USER'>, string> = {
  TA: '/ta/dashboard',
  CO: '/co/dashboard',
  TU: '/tu/dashboard',
  DS: '/tu/dashboard',
};

// GlobalRole → TenantRole 매핑
const globalRoleToTenantRole: Record<GlobalRole, TenantRole> = {
  TA: 'TENANT_ADMIN',
  CO: 'OPERATOR',
  TU: 'INSTRUCTOR',
  DS: 'DESIGNER',
  USER: 'USER',
};

export function GlobalRoleSwitcher({
  currentRole,
  isExpanded,
  language,
  colors,
  isDarkMode = true,
}: GlobalRoleSwitcherProps) {
  const navigate = useNavigate();
  const { prefixPath } = useSubdomainPath();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 사용자의 역할 가져오기
  const userRole = useAuthStore((state) => state.user?.role);
  const userRolesRaw = useAuthStore((state) => state.user?.roles);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setCurrentRole = useAuthStore((state) => state.setCurrentRole);
  // Set이나 배열 모두 처리 가능하도록 Array.from 사용
  const userRoles = userRolesRaw ? Array.from(userRolesRaw) as string[] : undefined;

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 사용자가 가진 역할만 표시 (순서: 학습자 → 설계자 → 강사 → 교육 운영자 → 관리자)
  const availableRoles: GlobalRole[] = (() => {
    const roles: GlobalRole[] = [];

    // roles 배열 또는 단일 role을 기반으로 체크할 역할 목록 결정
    const rolesToCheck = userRoles && userRoles.length > 0
      ? userRoles
      : (userRole ? [userRole] : []);

    // SYSTEM_ADMIN은 역할 스위처 사용 불가 (SA 전용 페이지만 사용)
    if (rolesToCheck.includes('SYSTEM_ADMIN')) {
      return roles; // 빈 배열 반환
    }

    // 부여받은 역할만 표시 (USER 역할도 부여받은 경우에만)
    if (rolesToCheck.includes('USER')) {
      roles.push('USER');
    }
    // DESIGNER와 INSTRUCTOR를 하나의 TU로 통합
    if (rolesToCheck.includes('DESIGNER') || rolesToCheck.includes('INSTRUCTOR')) {
      roles.push('TU');
    }
    if (rolesToCheck.includes('OPERATOR')) {
      roles.push('CO');
    }
    if (rolesToCheck.includes('TENANT_ADMIN')) {
      roles.push('TA');
    }

    return roles;
  })();

  const CurrentIcon = roleIcons[currentRole];

  // 역할이 1개 이하면 스위처를 표시하지 않음
  if (availableRoles.length <= 1) {
    return null;
  }

  const handleRoleChange = async (role: GlobalRole) => {
    if (role === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      // 역할 전환 API 호출
      // TU 선택 시: INSTRUCTOR 우선, 없으면 DESIGNER
      const rolesToCheck = userRoles && userRoles.length > 0
        ? userRoles
        : (userRole ? [userRole] : []);

      let targetRole: TenantRole;
      if (role === 'TU') {
        targetRole = rolesToCheck.includes('INSTRUCTOR') ? 'INSTRUCTOR' : 'DESIGNER';
      } else {
        targetRole = globalRoleToTenantRole[role];
      }

      const response = await authService.switchRole({ targetRole });

      // 새 토큰 저장
      setTokens(response.accessToken, response.refreshToken, response.expiresIn);
      setCurrentRole(targetRole);

      // 페이지 이동
      if (role === 'USER') {
        navigate(prefixPath('/tu/b2c/mypage'));
      } else {
        navigate(prefixPath(roleDefaultPaths[role]));
      }
    } catch (error) {
      console.error('Role switch failed:', error);
      // TODO: 에러 토스트 표시
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  // 접힌 상태 - 아이콘만 표시
  if (!isExpanded) {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          disabled={isLoading}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            color: colors.textPrimary,
            opacity: isLoading ? 0.7 : 1,
          }}
          title={roleLabels[currentRole][language]}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CurrentIcon className="w-5 h-5" />}
        </button>

        {/* 드롭다운 메뉴 (접힌 상태) */}
        {isOpen && (
          <div
            className="absolute left-full top-0 ml-2 z-50 min-w-[180px] py-2 rounded-xl shadow-lg border"
            style={{
              backgroundColor: colors.tooltipBg,
              borderColor: colors.border,
            }}
          >
            <div
              className="px-3 py-1.5 text-xs border-b mb-1"
              style={{
                color: colors.textSecondary,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.border,
              }}
            >
              {language === 'ko' ? '역할 전환' : 'Switch Role'}
            </div>
            {availableRoles.map((role) => {
              const Icon = roleIcons[role];
              const isActive = currentRole === role;

              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 transition-all text-sm"
                  style={{
                    backgroundColor: isActive ? colors.activeBg : 'transparent',
                    color: isActive ? colors.activeText : colors.textPrimary,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = colors.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? colors.activeText : colors.textSecondary }} />
                  <span>{roleLabels[role][language]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 펼친 상태 - 드롭다운 버튼
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
          'border'
        )}
        style={{
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          color: colors.textPrimary,
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: colors.textSecondary }} />
        ) : (
          <CurrentIcon className="w-5 h-5" style={{ color: colors.textSecondary }} />
        )}
        <span className="flex-1 text-left text-sm font-medium">
          {isLoading ? (language === 'ko' ? '전환 중...' : 'Switching...') : roleLabels[currentRole][language]}
        </span>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')}
          style={{ color: colors.textSecondary }}
        />
      </button>

      {/* 드롭다운 메뉴 (펼친 상태) */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50 py-1 rounded-xl shadow-lg border"
          style={{
            backgroundColor: colors.tooltipBg,
            borderColor: colors.border,
          }}
        >
          {availableRoles.map((role) => {
            const Icon = roleIcons[role];
            const isActive = currentRole === role;

            return (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all text-sm"
                style={{
                  backgroundColor: isActive ? colors.activeBg : 'transparent',
                  color: isActive ? colors.activeText : colors.textPrimary,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = colors.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: isActive ? colors.activeText : colors.textSecondary }}
                />
                <span className="flex-1 text-left font-medium">
                  {roleLabels[role][language]}
                </span>
                {isActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    backgroundColor: isDarkMode ? 'rgba(124, 92, 191, 0.3)' : 'rgba(76, 45, 154, 0.1)',
                    color: isDarkMode ? '#C4B5FD' : '#4C2D9A',
                  }}>
                    {language === 'ko' ? '현재' : 'Current'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
