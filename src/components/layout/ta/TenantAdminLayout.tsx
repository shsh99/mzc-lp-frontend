import { type ReactNode, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { TenantAdminSidebar } from './TenantAdminSidebar';
import { SystemNoticePopup } from '@/components/domain/admin';
import { designTokens } from '@/styles/admin-design-tokens';
import { tenantAdminMenuData } from '@/config/sidebar-menus';
import { useUIStore, useIsDarkMode } from '@/store/common/uiStore';

interface TenantAdminLayoutProps {
  children: ReactNode;
}

export function TenantAdminLayout({ children }: TenantAdminLayoutProps) {
  const navigate = useNavigate();
  const { subdomain } = useParams<{ subdomain: string }>();
  const { isSidebarExpanded, language, toggleSidebar } = useUIStore();
  const isDarkMode = useIsDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 서브도메인이 있으면 경로에 프리픽스 추가
  const prefixPath = (path: string) => {
    if (subdomain) {
      return `/${subdomain}${path}`;
    }
    return path;
  };

  const handleMenuItemClick = (itemId: string) => {
    // Check top-level menu items
    const menuItem = tenantAdminMenuData.find((item) => item.id === itemId);
    if (menuItem?.path) {
      navigate(prefixPath(menuItem.path));
      setIsMobileMenuOpen(false);
      return;
    }

    // Check subItems
    for (const item of tenantAdminMenuData) {
      const subItem = item.subItems?.find((sub) => sub.id === itemId);
      if (subItem?.path) {
        navigate(prefixPath(subItem.path));
        setIsMobileMenuOpen(false);
        return;
      }
    }
  };

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: designTokens.bg.app_default }}
    >
      {/* 모바일 메뉴 토글 버튼 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 shadow-md'
        }`}
        aria-label="메뉴 열기"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* 모바일 오버레이 */}
      {isMobileMenuOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 bg-black/50 z-30 cursor-default"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="메뉴 닫기"
        />
      )}

      {/* 사이드바 - 모바일에서는 오버레이, 데스크톱에서는 고정 */}
      <div className={`
        fixed lg:relative z-40 h-full transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <TenantAdminSidebar
          isExpanded={isSidebarExpanded}
          onToggle={toggleSidebar}
          onMenuItemClick={handleMenuItemClick}
          isDarkMode={isDarkMode}
          language={language}
        />
      </div>

      <main className="flex-1 overflow-auto pt-14 lg:pt-0">{children}</main>

      {/* SA 시스템 공지 팝업 */}
      <SystemNoticePopup />
    </div>
  );
}
