import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { designTokens } from '@/styles/admin-design-tokens';
import { superAdminMenuData } from '@/config/sidebar-menus';
import { useUIStore, useIsDarkMode } from '@/store/common/uiStore';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const navigate = useNavigate();
  const { isSidebarExpanded, language, toggleSidebar } = useUIStore();
  const isDarkMode = useIsDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuItemClick = (itemId: string) => {
    // Check top-level menu items
    const menuItem = superAdminMenuData.find((item) => item.id === itemId);
    if (menuItem?.path) {
      navigate(menuItem.path);
      setIsMobileMenuOpen(false);
      return;
    }

    // Check subItems
    for (const item of superAdminMenuData) {
      const subItem = item.subItems?.find((sub) => sub.id === itemId);
      if (subItem?.path) {
        navigate(subItem.path);
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
        <SuperAdminSidebar
          isExpanded={isSidebarExpanded}
          onToggle={toggleSidebar}
          onMenuItemClick={handleMenuItemClick}
          isDarkMode={isDarkMode}
          language={language}
        />
      </div>

      <main className="flex-1 overflow-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
