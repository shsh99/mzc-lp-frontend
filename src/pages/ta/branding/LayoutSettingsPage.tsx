import { useState } from 'react';
import {
  Save,
  RotateCcw,
  Loader2,
  Palette,
  Image,
  PanelTop,
  PanelBottom,
  Sidebar,
  FolderTree,
  Upload,
  Code,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
  ImageIcon,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Search,
  Heart,
  ShoppingCart,
  Bell,
  FileText,
  Home,
  LayoutDashboard,
  BookOpen,
  BookCheck,
  PenTool,
  Users,
  User,
  Settings,
  FolderEdit,
  Calendar,
  Briefcase,
  Package,
  Database,
  FileEdit,
  Layers,
  Shield,
  Award,
  TrendingUp,
  Activity,
  MessageSquare,
  Star,
  CheckSquare,
  CheckCircle,
  Circle,
  Square,
  type LucideIcon,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Label } from '@/components/common/Label';
import { Switch } from '@/components/common/Switch';
import { Input } from '@/components/common/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';

// 아이콘 문자열 -> 컴포넌트 매핑
const iconMap: Record<string, LucideIcon> = {
  'home': Home,
  'layout-dashboard': LayoutDashboard,
  'book-open': BookOpen,
  'book-check': BookCheck,
  'pen-tool': PenTool,
  'users': Users,
  'user': User,
  'settings': Settings,
  'search': Search,
  'folder-tree': FolderTree,
  'folder-edit': FolderEdit,
  'calendar': Calendar,
  'briefcase': Briefcase,
  'package': Package,
  'database': Database,
  'file-text': FileText,
  'file-edit': FileEdit,
  'layers': Layers,
  'shield': Shield,
  'award': Award,
  'trending-up': TrendingUp,
  'activity': Activity,
  'message-square': MessageSquare,
  'bell': Bell,
  'heart': Heart,
  'star': Star,
  'check-square': CheckSquare,
  'check-circle': CheckCircle,
  'circle': Circle,
  'square': Square,
};

// 사용 가능한 아이콘 목록
const availableIcons = [
  { value: 'home', label: 'Home' },
  { value: 'layout-dashboard', label: 'Dashboard' },
  { value: 'book-open', label: 'Book Open' },
  { value: 'book-check', label: 'Book Check' },
  { value: 'pen-tool', label: 'Pen Tool' },
  { value: 'users', label: 'Users' },
  { value: 'user', label: 'User' },
  { value: 'settings', label: 'Settings' },
  { value: 'search', label: 'Search' },
  { value: 'folder-tree', label: 'Folder Tree' },
  { value: 'folder-edit', label: 'Folder Edit' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'package', label: 'Package' },
  { value: 'database', label: 'Database' },
  { value: 'file-text', label: 'File Text' },
  { value: 'file-edit', label: 'File Edit' },
  { value: 'layers', label: 'Layers' },
  { value: 'shield', label: 'Shield' },
  { value: 'award', label: 'Award' },
  { value: 'trending-up', label: 'Trending Up' },
  { value: 'activity', label: 'Activity' },
  { value: 'message-square', label: 'Message' },
  { value: 'bell', label: 'Bell' },
  { value: 'heart', label: 'Heart' },
  { value: 'star', label: 'Star' },
  { value: 'check-square', label: 'Check Square' },
  { value: 'check-circle', label: 'Check Circle' },
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
];

// 브랜딩 설정 타입
interface BrandingSettings {
  category: {
    enabled: boolean;
    items: string[];
    sectionTitle: string; // "카테고리" 섹션 제목
  };
  courseSections: {
    enabled: boolean;
    items: {
      id: string;
      title: string;
    }[];
  };
  company: {
    enabled: boolean;
    name: string;
  };
  logo: {
    enabled: boolean;
    lightUrl: string | null;
    lightPreview: string | null;
    darkUrl: string | null;
    darkPreview: string | null;
    faviconUrl: string | null;
    faviconPreview: string | null;
  };
  colors: {
    enabled: boolean;
    primary: string;
    secondary: string;
  };
  banner: {
    enabled: boolean;
    items: {
      id: string;
      type: 'image' | 'code';
      imageUrl: string | null;
      imagePreview: string | null;
      code: string;
      title: string;
    }[];
  };
  footer: {
    enabled: boolean;
    companyInfo: {
      ceo: string;
      businessNo: string;
      address: string;
      phone: string;
    };
    socialLinks: {
      facebook: { enabled: boolean; url: string };
      twitter: { enabled: boolean; url: string };
      youtube: { enabled: boolean; url: string };
      instagram: { enabled: boolean; url: string };
      linkedin: { enabled: boolean; url: string };
      github: { enabled: boolean; url: string };
    };
    legalLinks: { label: string; url: string }[];
    copyright: string;
  };
  header: {
    enabled: boolean;
    showLogo: boolean;
    showSearch: boolean;
    showThemeToggle: boolean;
    showCart: boolean;
    showWishlist: boolean;
    showNotifications: boolean;
    navLinks: { label: string; url: string; visible: boolean }[];
  };
  sidebarTU: {
    enabled: boolean;
    items: {
      id: string;
      label: string;
      url: string;
      icon: string;
      visible: boolean;
      children?: {
        id: string;
        label: string;
        url: string;
        icon?: string; // 서브메뉴에 선택적으로 아이콘 추가 가능
        visible: boolean;
      }[];
    }[];
  };
  sidebarCO: {
    enabled: boolean;
    items: {
      id: string;
      label: string;
      url: string;
      icon: string;
      visible: boolean;
      children?: {
        id: string;
        label: string;
        url: string;
        icon?: string; // 서브메뉴에 선택적으로 아이콘 추가 가능
        visible: boolean;
      }[];
    }[];
  };
}

// 기본 설정값
const defaultBrandingSettings: BrandingSettings = {
  category: {
    enabled: true,
    items: ['개발', '디자인', '마케팅', '비즈니스', '데이터'],
    sectionTitle: '카테고리',
  },
  courseSections: {
    enabled: true,
    items: [
      { id: '1', title: '인기 강의' },
      { id: '2', title: '추천 강의' },
      { id: '3', title: '신규 강의' },
    ],
  },
  company: {
    enabled: true,
    name: 'MZC Learn Platform',
  },
  logo: {
    enabled: true,
    lightUrl: null,
    lightPreview: null,
    darkUrl: null,
    darkPreview: null,
    faviconUrl: null,
    faviconPreview: null,
  },
  colors: {
    enabled: true,
    primary: '#4C2D9A',
    secondary: '#3D2478',
  },
  banner: {
    enabled: true,
    items: [
      {
        id: '1',
        type: 'image',
        imageUrl: null,
        imagePreview: '/placeholder-banner-1.jpg',
        code: '',
        title: '메인 배너',
      },
      {
        id: '2',
        type: 'image',
        imageUrl: null,
        imagePreview: '/placeholder-banner-2.jpg',
        code: '',
        title: '프로모션 배너',
      },
    ],
  },
  footer: {
    enabled: true,
    companyInfo: {
      ceo: '이주완',
      businessNo: '114-86-16505',
      address: '서울특별시 강남구 논현로 508 (역삼동) GS타워 22층',
      phone: '1644-2243',
    },
    socialLinks: {
      facebook: { enabled: false, url: '' },
      twitter: { enabled: false, url: '' },
      youtube: { enabled: false, url: '' },
      instagram: { enabled: false, url: '' },
      linkedin: { enabled: false, url: '' },
      github: { enabled: false, url: '' },
    },
    legalLinks: [
      { label: '개인정보처리방침', url: '/privacy' },
      { label: '이용약관', url: '/terms' },
      { label: '이메일무단수집거부', url: '/email-policy' },
    ],
    copyright: '© 2024 MEGAZONECLOUD Corp. All rights reserved.',
  },
  header: {
    enabled: true,
    showLogo: true,
    showSearch: true,
    showThemeToggle: true,
    showCart: true,
    showWishlist: true,
    showNotifications: true,
    navLinks: [
      { label: '강의 탐색', url: '/courses', visible: true },
      { label: '로드맵', url: '/roadmaps', visible: true },
      { label: '커뮤니티', url: '/community', visible: true },
    ],
  },
  sidebarTU: {
    enabled: true,
    items: [
      { id: 'tu-1', label: '마이페이지', url: '/tu/b2c/mypage', icon: 'home', visible: true },
      {
        id: 'tu-2',
        label: '내 수강 강의',
        url: '',
        icon: 'book-open',
        visible: true,
        children: [
          { id: 'tu-2-1', label: '수강 중인 강의', url: '/tu/b2c/mypage/learning', visible: true },
          { id: 'tu-2-2', label: '완료한 강의', url: '/tu/b2c/mypage/completed', visible: true },
          { id: 'tu-2-3', label: '수료증', url: '/tu/b2c/mypage/certificates', visible: true },
        ],
      },
      {
        id: 'tu-3',
        label: '내 강의 관리',
        url: '',
        icon: 'pen-tool',
        visible: true,
        children: [
          { id: 'tu-3-1', label: '내 강의', url: '/tu/b2c/mypage/teaching', visible: true },
          { id: 'tu-3-2', label: '강의 개설하기', url: '/tu/teaching/courses/create', visible: true },
          { id: 'tu-3-3', label: '내 강의 통계', url: '/tu/b2c/mypage/teaching/stats', visible: true },
        ],
      },
      {
        id: 'tu-4',
        label: '커뮤니티 활동',
        url: '',
        icon: 'users',
        visible: true,
        children: [
          { id: 'tu-4-1', label: '내 게시글', url: '/tu/b2c/mypage/posts', visible: true },
          { id: 'tu-4-2', label: '내 댓글', url: '/tu/b2c/mypage/comments', visible: true },
        ],
      },
      {
        id: 'tu-5',
        label: '설정',
        url: '',
        icon: 'settings',
        visible: true,
        children: [
          { id: 'tu-5-1', label: '프로필 및 보안', url: '/tu/b2c/mypage/settings/security', visible: true },
          { id: 'tu-5-2', label: '언어 및 지역', url: '/tu/b2c/mypage/settings/language', visible: true },
          { id: 'tu-5-3', label: '알림', url: '/tu/b2c/mypage/settings/notifications', visible: true },
        ],
      },
    ],
  },
  sidebarCO: {
    enabled: true,
    items: [
      { id: 'co-1', label: '대시보드', url: '/co/dashboard', icon: 'layout-dashboard', visible: true },
      {
        id: 'co-2',
        label: '교육 과정 탐색',
        url: '',
        icon: 'search',
        visible: true,
        children: [
          { id: 'co-2-1', label: '과정 검색 및 상세 조회', url: '/co/courses', visible: true },
          { id: 'co-2-2', label: '과정 등록/수정', url: '/co/courses/pending', visible: true },
        ],
      },
      {
        id: 'co-3',
        label: '교육 운영 관리',
        url: '',
        icon: 'calendar',
        visible: true,
        children: [
          { id: 'co-3-1', label: '차수 운영', url: '/co/times', visible: true },
          { id: 'co-3-2', label: '강사 배정 관리', url: '/co/instructors', visible: true },
        ],
      },
      {
        id: 'co-4',
        label: '콘텐츠 관리',
        url: '',
        icon: 'database',
        visible: false,
        children: [
          { id: 'co-4-1', label: '콘텐츠 풀', url: '/co/content', visible: true },
          { id: 'co-4-2', label: '학습객체', url: '/co/learning-objects', visible: true },
        ],
      },
      { id: 'co-5', label: '사용자 관리', url: '/co/users', icon: 'users', visible: true },
      { id: 'co-6', label: '설정', url: '/co/settings', icon: 'settings', visible: true },
    ],
  },
};

// 색상 미리보기 컴포넌트
function ColorPreview({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg border border-border-default shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-text-secondary uppercase">{color}</p>
      </div>
    </div>
  );
}

// 브랜딩 카드 컴포넌트
function BrandingCard({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Card className={`h-full transition-opacity ${!enabled ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-brand-primary/10' : 'bg-gray-100'}`}>
              <Icon className={`h-5 w-5 ${enabled ? 'text-brand-primary' : 'text-gray-400'}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggle} className="data-[state=unchecked]:bg-gray-300" />
        </div>
      </CardHeader>
      <CardContent className={!enabled ? 'pointer-events-none' : ''}>
        {children}
      </CardContent>
    </Card>
  );
}

export function LayoutSettingsPage() {
  const [settings, setSettings] = useState<BrandingSettings>(defaultBrandingSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedBannerId, setDraggedBannerId] = useState<string | null>(null);
  const [dragOverBannerId, setDragOverBannerId] = useState<string | null>(null);
  const [expandedSidebarItems, setExpandedSidebarItems] = useState<Set<string>>(new Set(['tu-2', 'tu-3', 'tu-4', 'tu-5', 'co-2', 'co-3', 'co-4']));
  const [draggedNavLinkIndex, setDraggedNavLinkIndex] = useState<number | null>(null);
  const [dragOverNavLinkIndex, setDragOverNavLinkIndex] = useState<number | null>(null);
  const [draggedLegalLinkIndex, setDraggedLegalLinkIndex] = useState<number | null>(null);
  const [dragOverLegalLinkIndex, setDragOverLegalLinkIndex] = useState<number | null>(null);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);
  const [dragOverCategoryIndex, setDragOverCategoryIndex] = useState<number | null>(null);
  const [draggedCourseSectionIndex, setDraggedCourseSectionIndex] = useState<number | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [previewBannerIndex, setPreviewBannerIndex] = useState(0);
  const [expandedMenuItems, setExpandedMenuItems] = useState<Set<string>>(new Set(['mypage-home']));

  // 카테고리 업데이트
  const updateCategory = (key: keyof BrandingSettings['category'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      category: { ...prev.category, [key]: value },
    }));
    setHasChanges(true);
  };

  // 회사 정보 업데이트
  const updateCompany = (key: keyof BrandingSettings['company'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      company: { ...prev.company, [key]: value },
    }));
    setHasChanges(true);
  };

  // 로고 업데이트
  const updateLogo = (key: keyof BrandingSettings['logo'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      logo: { ...prev.logo, [key]: value },
    }));
    setHasChanges(true);
  };

  // 색상 업데이트
  const updateColor = (key: keyof BrandingSettings['colors'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
    setHasChanges(true);
  };

  // 배너 업데이트
  const updateBanner = (key: keyof BrandingSettings['banner'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      banner: { ...prev.banner, [key]: value },
    }));
    setHasChanges(true);
  };

  // 푸터 업데이트
  const updateFooter = (key: keyof BrandingSettings['footer'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      footer: { ...prev.footer, [key]: value },
    }));
    setHasChanges(true);
  };

  // 헤더 업데이트
  const updateHeader = (key: keyof BrandingSettings['header'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      header: { ...prev.header, [key]: value },
    }));
    setHasChanges(true);
  };

  // TU 사이드바 업데이트
  const updateSidebarTU = (key: keyof BrandingSettings['sidebarTU'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      sidebarTU: { ...prev.sidebarTU, [key]: value },
    }));
    setHasChanges(true);
  };

  // CO 사이드바 업데이트
  const updateSidebarCO = (key: keyof BrandingSettings['sidebarCO'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      sidebarCO: { ...prev.sidebarCO, [key]: value },
    }));
    setHasChanges(true);
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'lightLogo' | 'darkLogo' | 'favicon'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'lightLogo') {
          updateLogo('lightPreview', reader.result as string);
        } else if (type === 'darkLogo') {
          updateLogo('darkPreview', reader.result as string);
        } else if (type === 'favicon') {
          updateLogo('faviconPreview', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 배너 파일 업로드 핸들러
  const handleBannerFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    bannerId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItems = settings.banner.items.map((item) =>
          item.id === bannerId
            ? { ...item, imagePreview: reader.result as string }
            : item
        );
        updateBanner('items', newItems);
      };
      reader.readAsDataURL(file);
    }
  };

  // 배너 항목 추가
  const addBannerItem = () => {
    const newId = Date.now().toString();
    const newItems = [
      ...settings.banner.items,
      {
        id: newId,
        type: 'image' as const,
        imageUrl: null,
        imagePreview: null,
        code: '',
        title: `배너 ${settings.banner.items.length + 1}`,
      },
    ];
    updateBanner('items', newItems);
  };

  // 배너 항목 삭제
  const removeBannerItem = (bannerId: string) => {
    const newItems = settings.banner.items.filter((item) => item.id !== bannerId);
    updateBanner('items', newItems);
  };

  // 배너 항목 업데이트
  const updateBannerItem = (
    bannerId: string,
    key: keyof BrandingSettings['banner']['items'][0],
    value: unknown
  ) => {
    const newItems = settings.banner.items.map((item) =>
      item.id === bannerId ? { ...item, [key]: value } : item
    );
    updateBanner('items', newItems);
  };

  // 배너 순서 변경
  const moveBannerItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newItems = [...settings.banner.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    updateBanner('items', newItems);
  };

  // 드래그 앤 드롭 핸들러 (범용)
  const handleDragStart = (e: React.DragEvent, indexOrId: number | string, type: 'banner' | 'navLink' | 'legalLink' | 'category' | 'courseSection') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(indexOrId));

    if (type === 'banner') {
      setDraggedBannerId(indexOrId as string);
    } else if (type === 'navLink') {
      setDraggedNavLinkIndex(indexOrId as number);
    } else if (type === 'legalLink') {
      setDraggedLegalLinkIndex(indexOrId as number);
    } else if (type === 'category') {
      setDraggedCategoryIndex(indexOrId as number);
    } else if (type === 'courseSection') {
      setDraggedCourseSectionIndex(indexOrId as number);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDragOverBannerId(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndexOrId: number | string, type: 'banner' | 'navLink' | 'legalLink' | 'category' | 'courseSection') => {
    e.preventDefault();

    if (type === 'banner') {
      if (!draggedBannerId || draggedBannerId === targetIndexOrId) return;
      const fromIndex = settings.banner.items.findIndex((item) => item.id === draggedBannerId);
      const toIndex = settings.banner.items.findIndex((item) => item.id === targetIndexOrId);
      if (fromIndex !== -1 && toIndex !== -1) {
        moveBannerItem(fromIndex, toIndex);
      }
      setDraggedBannerId(null);
    } else if (type === 'navLink') {
      if (draggedNavLinkIndex === null || draggedNavLinkIndex === targetIndexOrId) return;
      const newLinks = [...settings.header.navLinks];
      const [movedItem] = newLinks.splice(draggedNavLinkIndex, 1);
      newLinks.splice(targetIndexOrId as number, 0, movedItem);
      updateHeader('navLinks', newLinks);
      setDraggedNavLinkIndex(null);
    } else if (type === 'legalLink') {
      if (draggedLegalLinkIndex === null || draggedLegalLinkIndex === targetIndexOrId) return;
      const newLinks = [...settings.footer.legalLinks];
      const [movedItem] = newLinks.splice(draggedLegalLinkIndex, 1);
      newLinks.splice(targetIndexOrId as number, 0, movedItem);
      updateFooter('legalLinks', newLinks);
      setDraggedLegalLinkIndex(null);
    } else if (type === 'category') {
      if (draggedCategoryIndex === null || draggedCategoryIndex === targetIndexOrId) return;
      const newItems = [...settings.category.items];
      const [movedItem] = newItems.splice(draggedCategoryIndex, 1);
      newItems.splice(targetIndexOrId as number, 0, movedItem);
      updateCategory('items', newItems);
      setDraggedCategoryIndex(null);
    } else if (type === 'courseSection') {
      if (draggedCourseSectionIndex === null || draggedCourseSectionIndex === targetIndexOrId) return;
      const newItems = [...settings.courseSections.items];
      const [movedItem] = newItems.splice(draggedCourseSectionIndex, 1);
      newItems.splice(targetIndexOrId as number, 0, movedItem);
      setSettings((prev) => ({
        ...prev,
        courseSections: { ...prev.courseSections, items: newItems },
      }));
      setHasChanges(true);
      setDraggedCourseSectionIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedBannerId(null);
    setDragOverBannerId(null);
    setDraggedNavLinkIndex(null);
    setDraggedLegalLinkIndex(null);
    setDraggedCategoryIndex(null);
    setDraggedCourseSectionIndex(null);
  };

  // 초기화
  const handleReset = () => {
    setSettings(defaultBrandingSettings);
    setHasChanges(false);
  };

  // 저장
  const handleSave = async () => {
    setIsSaving(true);
    // TODO: API 호출
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="브랜딩 설정"
        description="플랫폼의 브랜드 아이덴티티와 레이아웃을 커스터마이징합니다"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              저장
            </Button>
          </div>
        }
      />

      {/* 2열 그리드 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* 1. 메인 컬러 */}
        <BrandingCard
          icon={Palette}
          title="메인 컬러"
          description="브랜드 색상을 설정합니다"
          enabled={settings.colors.enabled}
          onToggle={(enabled) => updateColor('enabled', enabled)}
        >
          <div className="space-y-4">
            {/* 브랜드 컬러 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">주 색상 (Primary)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.colors.primary}
                    onChange={(e) => updateColor('primary', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-border-default"
                  />
                  <Input
                    value={settings.colors.primary}
                    onChange={(e) => updateColor('primary', e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">보조 색상 (Secondary)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.colors.secondary}
                    onChange={(e) => updateColor('secondary', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-border-default"
                  />
                  <Input
                    value={settings.colors.secondary}
                    onChange={(e) => updateColor('secondary', e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 미리보기 */}
            <div className="pt-3 border-t border-border-default">
              <p className="text-sm text-text-secondary mb-3">미리보기</p>
              <div className="grid grid-cols-2 gap-3">
                <ColorPreview color={settings.colors.primary} label="주 색상" />
                <ColorPreview color={settings.colors.secondary} label="보조 색상" />
              </div>
            </div>
          </div>
        </BrandingCard>

        {/* 2. 회사 & 로고 설정 */}
        <BrandingCard
          icon={ImageIcon}
          title="회사 & 로고"
          description="회사명과 로고를 설정합니다"
          enabled={settings.logo.enabled}
          onToggle={(enabled) => updateLogo('enabled', enabled)}
        >
          <div className="space-y-4">
            {/* 회사명 */}
            <div>
              <Label>회사명</Label>
              <Input
                value={settings.company.name}
                onChange={(e) => updateCompany('name', e.target.value)}
                placeholder="회사명을 입력하세요"
                className="mt-1.5"
              />
            </div>

            {/* 라이트 모드 로고 */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sun className="h-4 w-4 text-amber-500" />
                <Label>라이트 모드 로고</Label>
              </div>
              <div className="border-2 border-dashed border-border-default rounded-lg p-4 text-center bg-white hover:border-brand-primary transition-colors">
                {settings.logo.lightPreview ? (
                  <div className="space-y-2">
                    <img
                      src={settings.logo.lightPreview}
                      alt="Light Logo"
                      className="max-h-16 mx-auto"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateLogo('lightPreview', null)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="h-6 w-6 mx-auto text-text-tertiary mb-1" />
                    <p className="text-xs text-text-secondary">라이트 모드 로고 업로드</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'lightLogo')}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 다크 모드 로고 */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Moon className="h-4 w-4 text-indigo-400" />
                <Label>다크 모드 로고</Label>
              </div>
              <div className="border-2 border-dashed border-border-default rounded-lg p-4 text-center bg-gray-900 hover:border-brand-primary transition-colors">
                {settings.logo.darkPreview ? (
                  <div className="space-y-2">
                    <img
                      src={settings.logo.darkPreview}
                      alt="Dark Logo"
                      className="max-h-16 mx-auto"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300"
                      onClick={() => updateLogo('darkPreview', null)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="h-6 w-6 mx-auto text-gray-500 mb-1" />
                    <p className="text-xs text-gray-400">다크 모드 로고 업로드</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'darkLogo')}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 파비콘 */}
            <div>
              <Label>파비콘</Label>
              <div className="flex items-center gap-4 mt-1.5">
                <div className="w-14 h-14 border-2 border-dashed border-border-default rounded-lg flex items-center justify-center bg-bg-secondary">
                  {settings.logo.faviconPreview ? (
                    <img
                      src={settings.logo.faviconPreview}
                      alt="Favicon"
                      className="w-8 h-8"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-text-tertiary" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        업로드
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*,.ico"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                    />
                  </label>
                  <p className="text-xs text-text-tertiary mt-1">권장: 32x32px, ICO 또는 PNG</p>
                </div>
                {settings.logo.faviconPreview && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateLogo('faviconPreview', null)}
                  >
                    <Trash2 className="h-4 w-4 text-status-error" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </BrandingCard>

        {/* 3. 배너 */}
        <BrandingCard
          icon={Image}
          title="배너"
          description="메인 페이지 배너를 설정합니다"
          enabled={settings.banner.enabled}
          onToggle={(enabled) => updateBanner('enabled', enabled)}
        >
          <div className="space-y-4">
            {/* 배너 목록 */}
            <div className="space-y-3">
              {settings.banner.items.map((banner, index) => (
                <div
                  key={banner.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, banner.id, 'banner')}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, banner.id, 'banner')}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-all cursor-grab active:cursor-grabbing ${
                    draggedBannerId === banner.id
                      ? 'opacity-50 border-brand-primary bg-brand-primary/5'
                      : dragOverBannerId === banner.id
                        ? 'border-brand-primary border-2 bg-brand-primary/10'
                        : 'border-border-default bg-bg-secondary hover:border-brand-primary'
                  }`}
                >
                  {/* 드래그 핸들 */}
                  <div className="flex items-center text-text-tertiary">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* 미리보기 썸네일 */}
                  <div className="w-24 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-border-default">
                    {banner.imagePreview ? (
                      <img
                        src={banner.imagePreview}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* 배너 정보 */}
                  <div className="flex-1 min-w-0" onDragStart={(e) => e.stopPropagation()} draggable={false}>
                    <Input
                      value={banner.title}
                      onChange={(e) => updateBannerItem(banner.id, 'title', e.target.value)}
                      placeholder="배너 제목"
                      className="h-8 text-sm mb-1"
                      draggable={false}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-tertiary">#{index + 1}</span>
                      <div className="flex gap-1">
                        <Button
                          variant={banner.type === 'image' ? 'default' : 'ghost'}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => updateBannerItem(banner.id, 'type', 'image')}
                        >
                          이미지
                        </Button>
                        <Button
                          variant={banner.type === 'code' ? 'default' : 'ghost'}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => updateBannerItem(banner.id, 'type', 'code')}
                        >
                          HTML
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 업로드/수정 버튼 */}
                  <div className="flex items-center gap-1">
                    {banner.type === 'image' ? (
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4" />
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleBannerFileUpload(e, banner.id)}
                        />
                      </label>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const code = prompt('HTML 코드를 입력하세요:', banner.code);
                          if (code !== null) {
                            updateBannerItem(banner.id, 'code', code);
                          }
                        }}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBannerItem(banner.id)}
                      className="text-status-error hover:text-status-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 배너 추가 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={addBannerItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              배너 추가
            </Button>

            <p className="text-xs text-text-tertiary">
              드래그하여 배너 순서를 변경할 수 있습니다. 권장 이미지 크기: 1920x400px
            </p>
          </div>
        </BrandingCard>

        {/* 4. 강의 섹션 제목 */}
        <BrandingCard
          icon={FileText}
          title="강의 섹션 제목"
          description="메인 페이지에 표시될 강의 섹션 제목들을 관리합니다"
          enabled={settings.courseSections.enabled}
          onToggle={(enabled) => {
            setSettings((prev) => ({
              ...prev,
              courseSections: { ...prev.courseSections, enabled },
            }));
            setHasChanges(true);
          }}
        >
          <div className="space-y-4">
            {/* 섹션 항목 */}
            <div>
              <Label>섹션 제목 목록</Label>
              <div className="space-y-2 mt-2">
                {settings.courseSections.items.map((section, index) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index, 'courseSection')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index, 'courseSection')}
                    className="flex items-center gap-2 p-2 border rounded-lg bg-white hover:bg-gray-50 transition cursor-move"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        const newItems = [...settings.courseSections.items];
                        newItems[index] = { ...newItems[index], title: e.target.value };
                        setSettings((prev) => ({
                          ...prev,
                          courseSections: { ...prev.courseSections, items: newItems },
                        }));
                        setHasChanges(true);
                      }}
                      className="flex-1"
                      placeholder="섹션 제목"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newItems = settings.courseSections.items.filter((_, i) => i !== index);
                        setSettings((prev) => ({
                          ...prev,
                          courseSections: { ...prev.courseSections, items: newItems },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  const newSection = {
                    id: Date.now().toString(),
                    title: '새 섹션',
                  };
                  setSettings((prev) => ({
                    ...prev,
                    courseSections: {
                      ...prev.courseSections,
                      items: [...prev.courseSections.items, newSection],
                    },
                  }));
                  setHasChanges(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                섹션 추가
              </Button>
            </div>
          </div>
        </BrandingCard>

        {/* 5. 카테고리 */}
        <BrandingCard
          icon={FolderTree}
          title="카테고리"
          description="강의 카테고리를 관리합니다"
          enabled={settings.category.enabled}
          onToggle={(enabled) => updateCategory('enabled', enabled)}
        >
          <div className="space-y-4">
            {/* 섹션 제목 */}
            <div>
              <Label>섹션 제목</Label>
              <Input
                value={settings.category.sectionTitle}
                onChange={(e) => updateCategory('sectionTitle', e.target.value)}
                placeholder="카테고리"
                className="mt-1.5"
              />
            </div>

            {/* 카테고리 항목 */}
            <div className="space-y-2">
              <Label>카테고리 항목</Label>
              {settings.category.items.map((item, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => {
                    setDraggedCategoryIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (draggedCategoryIndex !== index) {
                      setDragOverCategoryIndex(index);
                    }
                  }}
                  onDragLeave={() => setDragOverCategoryIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedCategoryIndex !== null && draggedCategoryIndex !== index) {
                      const newItems = [...settings.category.items];
                      const [movedItem] = newItems.splice(draggedCategoryIndex, 1);
                      newItems.splice(index, 0, movedItem);
                      updateCategory('items', newItems);
                    }
                    setDraggedCategoryIndex(null);
                    setDragOverCategoryIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggedCategoryIndex(null);
                    setDragOverCategoryIndex(null);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                    draggedCategoryIndex === index
                      ? 'opacity-50 border-brand-primary bg-brand-primary/5'
                      : dragOverCategoryIndex === index
                        ? 'border-brand-primary border-2 bg-brand-primary/10'
                        : 'border-transparent hover:bg-bg-secondary'
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...settings.category.items];
                      newItems[index] = e.target.value;
                      updateCategory('items', newItems);
                    }}
                    className="flex-1"
                    draggable={false}
                    onDragStart={(e) => e.stopPropagation()}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newItems = settings.category.items.filter((_, i) => i !== index);
                      updateCategory('items', newItems);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-status-error" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCategory('items', [...settings.category.items, ''])}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              카테고리 추가
            </Button>
          </div>
        </BrandingCard>

        {/* 5. 헤더 */}
        <BrandingCard
          icon={PanelTop}
          title="헤더"
          description="상단 헤더 영역을 설정합니다"
          enabled={settings.header.enabled}
          onToggle={(enabled) => updateHeader('enabled', enabled)}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">로고 표시</span>
                <Switch
                  checked={settings.header.showLogo}
                  onCheckedChange={(checked) => updateHeader('showLogo', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">검색 표시</span>
                <Switch
                  checked={settings.header.showSearch}
                  onCheckedChange={(checked) => updateHeader('showSearch', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">테마 토글 표시</span>
                <Switch
                  checked={settings.header.showThemeToggle}
                  onCheckedChange={(checked) => updateHeader('showThemeToggle', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">장바구니 표시</span>
                <Switch
                  checked={settings.header.showCart}
                  onCheckedChange={(checked) => updateHeader('showCart', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">위시리스트 표시</span>
                <Switch
                  checked={settings.header.showWishlist}
                  onCheckedChange={(checked) => updateHeader('showWishlist', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">알림 표시</span>
                <Switch
                  checked={settings.header.showNotifications}
                  onCheckedChange={(checked) => updateHeader('showNotifications', checked)}
                />
              </div>
            </div>
            <div className="pt-3 border-t border-border-default">
              <Label>내비게이션 링크</Label>
              <div className="space-y-2 mt-1.5">
                {settings.header.navLinks.map((item, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => {
                      setDraggedNavLinkIndex(index);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (draggedNavLinkIndex !== index) {
                        setDragOverNavLinkIndex(index);
                      }
                    }}
                    onDragLeave={() => setDragOverNavLinkIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedNavLinkIndex !== null && draggedNavLinkIndex !== index) {
                        const newItems = [...settings.header.navLinks];
                        const [movedItem] = newItems.splice(draggedNavLinkIndex, 1);
                        newItems.splice(index, 0, movedItem);
                        updateHeader('navLinks', newItems);
                      }
                      setDraggedNavLinkIndex(null);
                      setDragOverNavLinkIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedNavLinkIndex(null);
                      setDragOverNavLinkIndex(null);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                      draggedNavLinkIndex === index
                        ? 'opacity-50 border-brand-primary bg-brand-primary/5'
                        : dragOverNavLinkIndex === index
                          ? 'border-brand-primary border-2 bg-brand-primary/10'
                          : 'border-transparent hover:bg-bg-secondary'
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const newItems = [...settings.header.navLinks];
                        newItems[index].visible = !newItems[index].visible;
                        updateHeader('navLinks', newItems);
                      }}
                    >
                      {item.visible ? (
                        <Eye className="h-4 w-4 text-status-success" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-text-tertiary" />
                      )}
                    </Button>
                    <Input
                      value={item.label}
                      onChange={(e) => {
                        const newItems = [...settings.header.navLinks];
                        newItems[index].label = e.target.value;
                        updateHeader('navLinks', newItems);
                      }}
                      placeholder="메뉴명"
                      className="flex-1"
                      draggable={false}
                      onDragStart={(e) => e.stopPropagation()}
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => {
                        const newItems = [...settings.header.navLinks];
                        newItems[index].url = e.target.value;
                        updateHeader('navLinks', newItems);
                      }}
                      placeholder="/url"
                      className="flex-1"
                      draggable={false}
                      onDragStart={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newItems = settings.header.navLinks.filter((_, i) => i !== index);
                        updateHeader('navLinks', newItems);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-status-error" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateHeader('navLinks', [
                      ...settings.header.navLinks,
                      { label: '', url: '', visible: true },
                    ]);
                  }}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  링크 추가
                </Button>
              </div>
            </div>
          </div>
        </BrandingCard>

        {/* 6. 푸터 */}
        <BrandingCard
          icon={PanelBottom}
          title="푸터"
          description="하단 영역을 설정합니다"
          enabled={settings.footer.enabled}
          onToggle={(enabled) => updateFooter('enabled', enabled)}
        >
          <div className="space-y-4">
            {/* 회사 정보 */}
            <div>
              <p className="text-sm font-medium text-text-secondary mb-3">회사 정보</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">대표자</Label>
                  <Input
                    value={settings.footer.companyInfo.ceo}
                    onChange={(e) => {
                      updateFooter('companyInfo', {
                        ...settings.footer.companyInfo,
                        ceo: e.target.value,
                      });
                    }}
                    placeholder="대표자명"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">사업자등록번호</Label>
                  <Input
                    value={settings.footer.companyInfo.businessNo}
                    onChange={(e) => {
                      updateFooter('companyInfo', {
                        ...settings.footer.companyInfo,
                        businessNo: e.target.value,
                      });
                    }}
                    placeholder="000-00-00000"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">주소</Label>
                  <Input
                    value={settings.footer.companyInfo.address}
                    onChange={(e) => {
                      updateFooter('companyInfo', {
                        ...settings.footer.companyInfo,
                        address: e.target.value,
                      });
                    }}
                    placeholder="회사 주소"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">연락처</Label>
                  <Input
                    value={settings.footer.companyInfo.phone}
                    onChange={(e) => {
                      updateFooter('companyInfo', {
                        ...settings.footer.companyInfo,
                        phone: e.target.value,
                      });
                    }}
                    placeholder="0000-0000"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* 소셜 미디어 링크 */}
            <div className="pt-3 border-t border-border-default">
              <p className="text-sm font-medium text-text-secondary mb-3">소셜 미디어</p>
              <div className="space-y-3">
                {/* Facebook */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-100 border border-gray-200">
                  <Switch
                    checked={settings.footer.socialLinks.facebook.enabled}
                    onCheckedChange={(checked) => {
                      updateFooter('socialLinks', {
                        ...settings.footer.socialLinks,
                        facebook: { ...settings.footer.socialLinks.facebook, enabled: checked },
                      });
                    }}
                    className="mt-1 data-[state=unchecked]:bg-gray-300"
                  />
                  <div className="flex-1">
                    <Label className="text-xs font-medium">Facebook</Label>
                    <Input
                      value={settings.footer.socialLinks.facebook.url}
                      onChange={(e) => {
                        updateFooter('socialLinks', {
                          ...settings.footer.socialLinks,
                          facebook: { ...settings.footer.socialLinks.facebook, url: e.target.value },
                        });
                      }}
                      placeholder="https://facebook.com/..."
                      className="mt-1.5"
                      disabled={!settings.footer.socialLinks.facebook.enabled}
                    />
                  </div>
                </div>

                {/* Twitter/X */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-100 border border-gray-200">
                  <Switch
                    checked={settings.footer.socialLinks.twitter.enabled}
                    onCheckedChange={(checked) => {
                      updateFooter('socialLinks', {
                        ...settings.footer.socialLinks,
                        twitter: { ...settings.footer.socialLinks.twitter, enabled: checked },
                      });
                    }}
                    className="mt-1 data-[state=unchecked]:bg-gray-300"
                  />
                  <div className="flex-1">
                    <Label className="text-xs font-medium">X (Twitter)</Label>
                    <Input
                      value={settings.footer.socialLinks.twitter.url}
                      onChange={(e) => {
                        updateFooter('socialLinks', {
                          ...settings.footer.socialLinks,
                          twitter: { ...settings.footer.socialLinks.twitter, url: e.target.value },
                        });
                      }}
                      placeholder="https://x.com/..."
                      className="mt-1.5"
                      disabled={!settings.footer.socialLinks.twitter.enabled}
                    />
                  </div>
                </div>

                {/* YouTube */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-100 border border-gray-200">
                  <Switch
                    checked={settings.footer.socialLinks.youtube.enabled}
                    onCheckedChange={(checked) => {
                      updateFooter('socialLinks', {
                        ...settings.footer.socialLinks,
                        youtube: { ...settings.footer.socialLinks.youtube, enabled: checked },
                      });
                    }}
                    className="mt-1 data-[state=unchecked]:bg-gray-300"
                  />
                  <div className="flex-1">
                    <Label className="text-xs font-medium">YouTube</Label>
                    <Input
                      value={settings.footer.socialLinks.youtube.url}
                      onChange={(e) => {
                        updateFooter('socialLinks', {
                          ...settings.footer.socialLinks,
                          youtube: { ...settings.footer.socialLinks.youtube, url: e.target.value },
                        });
                      }}
                      placeholder="https://youtube.com/..."
                      className="mt-1.5"
                      disabled={!settings.footer.socialLinks.youtube.enabled}
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-100 border border-gray-200">
                  <Switch
                    checked={settings.footer.socialLinks.instagram.enabled}
                    onCheckedChange={(checked) => {
                      updateFooter('socialLinks', {
                        ...settings.footer.socialLinks,
                        instagram: { ...settings.footer.socialLinks.instagram, enabled: checked },
                      });
                    }}
                    className="mt-1 data-[state=unchecked]:bg-gray-300"
                  />
                  <div className="flex-1">
                    <Label className="text-xs font-medium">Instagram</Label>
                    <Input
                      value={settings.footer.socialLinks.instagram.url}
                      onChange={(e) => {
                        updateFooter('socialLinks', {
                          ...settings.footer.socialLinks,
                          instagram: { ...settings.footer.socialLinks.instagram, url: e.target.value },
                        });
                      }}
                      placeholder="https://instagram.com/..."
                      className="mt-1.5"
                      disabled={!settings.footer.socialLinks.instagram.enabled}
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-100 border border-gray-200">
                  <Switch
                    checked={settings.footer.socialLinks.linkedin.enabled}
                    onCheckedChange={(checked) => {
                      updateFooter('socialLinks', {
                        ...settings.footer.socialLinks,
                        linkedin: { ...settings.footer.socialLinks.linkedin, enabled: checked },
                      });
                    }}
                    className="mt-1 data-[state=unchecked]:bg-gray-300"
                  />
                  <div className="flex-1">
                    <Label className="text-xs font-medium">LinkedIn</Label>
                    <Input
                      value={settings.footer.socialLinks.linkedin.url}
                      onChange={(e) => {
                        updateFooter('socialLinks', {
                          ...settings.footer.socialLinks,
                          linkedin: { ...settings.footer.socialLinks.linkedin, url: e.target.value },
                        });
                      }}
                      placeholder="https://linkedin.com/..."
                      className="mt-1.5"
                      disabled={!settings.footer.socialLinks.linkedin.enabled}
                    />
                  </div>
                </div>

                {/* GitHub */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-100 border border-gray-200">
                  <Switch
                    checked={settings.footer.socialLinks.github.enabled}
                    onCheckedChange={(checked) => {
                      updateFooter('socialLinks', {
                        ...settings.footer.socialLinks,
                        github: { ...settings.footer.socialLinks.github, enabled: checked },
                      });
                    }}
                    className="mt-1 data-[state=unchecked]:bg-gray-300"
                  />
                  <div className="flex-1">
                    <Label className="text-xs font-medium">GitHub</Label>
                    <Input
                      value={settings.footer.socialLinks.github.url}
                      onChange={(e) => {
                        updateFooter('socialLinks', {
                          ...settings.footer.socialLinks,
                          github: { ...settings.footer.socialLinks.github, url: e.target.value },
                        });
                      }}
                      placeholder="https://github.com/..."
                      className="mt-1.5"
                      disabled={!settings.footer.socialLinks.github.enabled}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 법적 링크 */}
            <div className="pt-3 border-t border-border-default">
              <p className="text-sm font-medium text-text-secondary mb-3">법적 고지 링크</p>
              <div className="space-y-2">
                {settings.footer.legalLinks.map((link, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => {
                      setDraggedLegalLinkIndex(index);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (draggedLegalLinkIndex !== index) {
                        setDragOverLegalLinkIndex(index);
                      }
                    }}
                    onDragLeave={() => setDragOverLegalLinkIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedLegalLinkIndex !== null && draggedLegalLinkIndex !== index) {
                        const newLinks = [...settings.footer.legalLinks];
                        const [movedItem] = newLinks.splice(draggedLegalLinkIndex, 1);
                        newLinks.splice(index, 0, movedItem);
                        updateFooter('legalLinks', newLinks);
                      }
                      setDraggedLegalLinkIndex(null);
                      setDragOverLegalLinkIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedLegalLinkIndex(null);
                      setDragOverLegalLinkIndex(null);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                      draggedLegalLinkIndex === index
                        ? 'opacity-50 border-brand-primary bg-brand-primary/5'
                        : dragOverLegalLinkIndex === index
                          ? 'border-brand-primary border-2 bg-brand-primary/10'
                          : 'border-transparent hover:bg-bg-secondary'
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                    <Input
                      value={link.label}
                      onChange={(e) => {
                        const newLinks = [...settings.footer.legalLinks];
                        newLinks[index].label = e.target.value;
                        updateFooter('legalLinks', newLinks);
                      }}
                      placeholder="링크 이름"
                      className="flex-1"
                      draggable={false}
                      onDragStart={(e) => e.stopPropagation()}
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...settings.footer.legalLinks];
                        newLinks[index].url = e.target.value;
                        updateFooter('legalLinks', newLinks);
                      }}
                      placeholder="/url"
                      className="flex-1"
                      draggable={false}
                      onDragStart={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newLinks = settings.footer.legalLinks.filter((_, i) => i !== index);
                        updateFooter('legalLinks', newLinks);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-status-error" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateFooter('legalLinks', [...settings.footer.legalLinks, { label: '', url: '' }]);
                  }}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  링크 추가
                </Button>
              </div>
            </div>

            {/* 저작권 표시 */}
            <div className="pt-3 border-t border-border-default">
              <Label>저작권 표시</Label>
              <Input
                value={settings.footer.copyright}
                onChange={(e) => updateFooter('copyright', e.target.value)}
                placeholder="© 2024 Company. All rights reserved."
                className="mt-1.5"
              />
            </div>
          </div>
        </BrandingCard>

        {/* 7. 사이드바 (마이페이지) */}
        <BrandingCard
          icon={Sidebar}
          title="사이드바 (마이페이지)"
          description="마이페이지 사이드바 메뉴를 설정합니다"
          enabled={settings.sidebarTU.enabled}
          onToggle={(enabled) => updateSidebarTU('enabled', enabled)}
        >
          <div className="space-y-4">
            <div>
              <Label>사이드바 항목</Label>
              <div className="space-y-1 mt-1.5">
                {settings.sidebarTU.items.map((item, index) => (
                  <div key={item.id} className="space-y-1">
                    {/* 부모 항목 */}
                    <div className={`flex items-center gap-2 p-2 rounded-lg border ${item.children && item.children.length > 0 ? 'bg-bg-secondary' : ''} border-border-default`}>
                      {/* 펼치기/접기 버튼 */}
                      {item.children && item.children.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setExpandedSidebarItems((prev) => {
                              const newSet = new Set(prev);
                              if (newSet.has(item.id)) {
                                newSet.delete(item.id);
                              } else {
                                newSet.add(item.id);
                              }
                              return newSet;
                            });
                          }}
                        >
                          {expandedSidebarItems.has(item.id) ? (
                            <ChevronDown className="h-4 w-4 text-text-secondary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-text-secondary" />
                          )}
                        </Button>
                      ) : (
                        <div className="w-7" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newItems = [...settings.sidebarTU.items];
                          newItems[index].visible = !newItems[index].visible;
                          updateSidebarTU('items', newItems);
                        }}
                      >
                        {item.visible ? (
                          <Eye className="h-4 w-4 text-status-success" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-text-tertiary" />
                        )}
                      </Button>
                      <select
                        value={item.icon}
                        onChange={(e) => {
                          const newItems = [...settings.sidebarTU.items];
                          newItems[index].icon = e.target.value;
                          updateSidebarTU('items', newItems);
                        }}
                        className="h-8 px-2 border border-border-default rounded-md text-sm bg-white"
                        title="아이콘"
                      >
                        {availableIcons.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const newItems = [...settings.sidebarTU.items];
                          newItems[index].label = e.target.value;
                          updateSidebarTU('items', newItems);
                        }}
                        placeholder="항목명"
                        className="flex-1 h-8"
                      />
                      <Input
                        value={item.url}
                        onChange={(e) => {
                          const newItems = [...settings.sidebarTU.items];
                          newItems[index].url = e.target.value;
                          updateSidebarTU('items', newItems);
                        }}
                        placeholder="/url"
                        className="flex-1 h-8"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newItems = [...settings.sidebarTU.items];
                          if (!newItems[index].children) {
                            newItems[index].children = [];
                          }
                          newItems[index].children!.push({
                            id: `${item.id}-${Date.now()}`,
                            label: '',
                            url: '',
                            visible: true,
                          });
                          updateSidebarTU('items', newItems);
                          setExpandedSidebarItems((prev) => new Set([...prev, item.id]));
                        }}
                        title="하위 항목 추가"
                      >
                        <Plus className="h-4 w-4 text-brand-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newItems = settings.sidebarTU.items.filter((_, i) => i !== index);
                          updateSidebarTU('items', newItems);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-status-error" />
                      </Button>
                    </div>

                    {/* 자식 항목들 */}
                    {item.children && item.children.length > 0 && expandedSidebarItems.has(item.id) && (
                      <div className="ml-9 space-y-1 border-l-2 border-border-default pl-3">
                        {item.children.map((child, childIndex) => (
                          <div key={child.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-bg-secondary">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const newItems = [...settings.sidebarTU.items];
                                newItems[index].children![childIndex].visible = !newItems[index].children![childIndex].visible;
                                updateSidebarTU('items', newItems);
                              }}
                            >
                              {child.visible ? (
                                <Eye className="h-3 w-3 text-status-success" />
                              ) : (
                                <EyeOff className="h-3 w-3 text-text-tertiary" />
                              )}
                            </Button>
                            <select
                              value={child.icon || ''}
                              onChange={(e) => {
                                const newItems = [...settings.sidebarTU.items];
                                newItems[index].children![childIndex].icon = e.target.value || undefined;
                                updateSidebarTU('items', newItems);
                              }}
                              className="h-7 px-2 border border-border-default rounded-md text-xs bg-white"
                              title="아이콘 (선택사항)"
                            >
                              <option value="">아이콘 없음</option>
                              {availableIcons.map((icon) => (
                                <option key={icon.value} value={icon.value}>
                                  {icon.label}
                                </option>
                              ))}
                            </select>
                            <Input
                              value={child.label}
                              onChange={(e) => {
                                const newItems = [...settings.sidebarTU.items];
                                newItems[index].children![childIndex].label = e.target.value;
                                updateSidebarTU('items', newItems);
                              }}
                              placeholder="하위 항목명"
                              className="flex-1 h-7 text-sm"
                            />
                            <Input
                              value={child.url}
                              onChange={(e) => {
                                const newItems = [...settings.sidebarTU.items];
                                newItems[index].children![childIndex].url = e.target.value;
                                updateSidebarTU('items', newItems);
                              }}
                              placeholder="/url"
                              className="flex-1 h-7 text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const newItems = [...settings.sidebarTU.items];
                                newItems[index].children = newItems[index].children!.filter((_, i) => i !== childIndex);
                                updateSidebarTU('items', newItems);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-status-error" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateSidebarTU('items', [
                      ...settings.sidebarTU.items,
                      { id: `tu-${Date.now()}`, label: '', url: '', icon: '', visible: true },
                    ]);
                  }}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  항목 추가
                </Button>
              </div>
            </div>
          </div>
        </BrandingCard>

        {/* 8. 사이드바 (TO - 테넌트 관리자) */}
        <BrandingCard
          icon={Sidebar}
          title="사이드바 (TO)"
          description="테넌트 관리자용 사이드바 메뉴를 설정합니다"
          enabled={settings.sidebarCO.enabled}
          onToggle={(enabled) => updateSidebarCO('enabled', enabled)}
        >
          <div className="space-y-4">
            <div>
              <Label>사이드바 항목</Label>
              <div className="space-y-1 mt-1.5">
                {settings.sidebarCO.items.map((item, index) => (
                  <div key={item.id} className="space-y-1">
                    {/* 부모 항목 */}
                    <div className={`flex items-center gap-2 p-2 rounded-lg border ${item.children && item.children.length > 0 ? 'bg-bg-secondary' : ''} border-border-default`}>
                      {/* 펼치기/접기 버튼 */}
                      {item.children && item.children.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setExpandedSidebarItems((prev) => {
                              const newSet = new Set(prev);
                              if (newSet.has(item.id)) {
                                newSet.delete(item.id);
                              } else {
                                newSet.add(item.id);
                              }
                              return newSet;
                            });
                          }}
                        >
                          {expandedSidebarItems.has(item.id) ? (
                            <ChevronDown className="h-4 w-4 text-text-secondary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-text-secondary" />
                          )}
                        </Button>
                      ) : (
                        <div className="w-7" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newItems = [...settings.sidebarCO.items];
                          newItems[index].visible = !newItems[index].visible;
                          updateSidebarCO('items', newItems);
                        }}
                      >
                        {item.visible ? (
                          <Eye className="h-4 w-4 text-status-success" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-text-tertiary" />
                        )}
                      </Button>
                      <select
                        value={item.icon}
                        onChange={(e) => {
                          const newItems = [...settings.sidebarCO.items];
                          newItems[index].icon = e.target.value;
                          updateSidebarCO('items', newItems);
                        }}
                        className="h-8 px-2 border border-border-default rounded-md text-sm bg-white"
                        title="아이콘"
                      >
                        {availableIcons.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const newItems = [...settings.sidebarCO.items];
                          newItems[index].label = e.target.value;
                          updateSidebarCO('items', newItems);
                        }}
                        placeholder="항목명"
                        className="flex-1 h-8"
                      />
                      <Input
                        value={item.url}
                        onChange={(e) => {
                          const newItems = [...settings.sidebarCO.items];
                          newItems[index].url = e.target.value;
                          updateSidebarCO('items', newItems);
                        }}
                        placeholder="/url"
                        className="flex-1 h-8"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newItems = [...settings.sidebarCO.items];
                          if (!newItems[index].children) {
                            newItems[index].children = [];
                          }
                          newItems[index].children!.push({
                            id: `${item.id}-${Date.now()}`,
                            label: '',
                            url: '',
                            visible: true,
                          });
                          updateSidebarCO('items', newItems);
                          setExpandedSidebarItems((prev) => new Set([...prev, item.id]));
                        }}
                        title="하위 항목 추가"
                      >
                        <Plus className="h-4 w-4 text-brand-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newItems = settings.sidebarCO.items.filter((_, i) => i !== index);
                          updateSidebarCO('items', newItems);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-status-error" />
                      </Button>
                    </div>

                    {/* 자식 항목들 */}
                    {item.children && item.children.length > 0 && expandedSidebarItems.has(item.id) && (
                      <div className="ml-9 space-y-1 border-l-2 border-border-default pl-3">
                        {item.children.map((child, childIndex) => (
                          <div key={child.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-bg-secondary">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const newItems = [...settings.sidebarCO.items];
                                newItems[index].children![childIndex].visible = !newItems[index].children![childIndex].visible;
                                updateSidebarCO('items', newItems);
                              }}
                            >
                              {child.visible ? (
                                <Eye className="h-3 w-3 text-status-success" />
                              ) : (
                                <EyeOff className="h-3 w-3 text-text-tertiary" />
                              )}
                            </Button>
                            <select
                              value={child.icon || ''}
                              onChange={(e) => {
                                const newItems = [...settings.sidebarCO.items];
                                newItems[index].children![childIndex].icon = e.target.value || undefined;
                                updateSidebarCO('items', newItems);
                              }}
                              className="h-7 px-2 border border-border-default rounded-md text-xs bg-white"
                              title="아이콘 (선택사항)"
                            >
                              <option value="">아이콘 없음</option>
                              {availableIcons.map((icon) => (
                                <option key={icon.value} value={icon.value}>
                                  {icon.label}
                                </option>
                              ))}
                            </select>
                            <Input
                              value={child.label}
                              onChange={(e) => {
                                const newItems = [...settings.sidebarCO.items];
                                newItems[index].children![childIndex].label = e.target.value;
                                updateSidebarCO('items', newItems);
                              }}
                              placeholder="하위 항목명"
                              className="flex-1 h-7 text-sm"
                            />
                            <Input
                              value={child.url}
                              onChange={(e) => {
                                const newItems = [...settings.sidebarCO.items];
                                newItems[index].children![childIndex].url = e.target.value;
                                updateSidebarCO('items', newItems);
                              }}
                              placeholder="/url"
                              className="flex-1 h-7 text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const newItems = [...settings.sidebarCO.items];
                                newItems[index].children = newItems[index].children!.filter((_, i) => i !== childIndex);
                                updateSidebarCO('items', newItems);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-status-error" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateSidebarCO('items', [
                      ...settings.sidebarCO.items,
                      { id: `to-${Date.now()}`, label: '', url: '', icon: '', visible: true },
                    ]);
                  }}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  항목 추가
                </Button>
              </div>
            </div>
          </div>
        </BrandingCard>
      </div>

      {/* 미리보기 섹션 */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>미리보기</CardTitle>
              <CardDescription>설정한 브랜딩이 어떻게 보이는지 확인합니다</CardDescription>
            </div>
            <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-lg">
              <Button
                variant={previewTheme === 'light' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => setPreviewTheme('light')}
              >
                <Sun className="h-4 w-4 mr-1" />
                라이트
              </Button>
              <Button
                variant={previewTheme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => setPreviewTheme('dark')}
              >
                <Moon className="h-4 w-4 mr-1" />
                다크
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tu-main" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="tu-main">TU 메인</TabsTrigger>
              <TabsTrigger value="tu-mypage">마이페이지</TabsTrigger>
              <TabsTrigger value="to">TO (관리자)</TabsTrigger>
            </TabsList>

            {/* TU 메인 미리보기 */}
            <TabsContent value="tu-main">
              <div className={`border rounded-lg overflow-hidden ${previewTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                {/* 브라우저 탭 시뮬레이션 (파비콘 미리보기) */}
                <div className={`flex items-center gap-2 px-3 py-2 border-b ${previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-t-md text-xs ${previewTheme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-600'}`}>
                    {settings.logo.faviconPreview ? (
                      <img src={settings.logo.faviconPreview} alt="Favicon" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-gray-300" />
                    )}
                    <span className="truncate max-w-[120px]">{settings.company.name || '사이트 제목'}</span>
                  </div>
                </div>

                {/* 상단 알림 배너 */}
                {settings.colors.enabled && (
                  <div
                    className="text-white text-xs py-2 px-4 text-center font-medium cursor-pointer hover:opacity-90 transition"
                    style={{
                      background: `linear-gradient(to right, ${settings.colors.primary}, ${settings.colors.secondary})`
                    }}
                  >
                    🎉 신규 강의 오픈! 지금 가입하고 20% 할인 받으세요
                  </div>
                )}

                {/* 헤더 */}
                {settings.header.enabled && (
                  <div className={`h-16 border-b flex items-center justify-between px-6 ${
                    previewTheme === 'dark' ? 'bg-gray-900/95 border-gray-700 backdrop-blur' : 'bg-gray-50/95 border-gray-200 backdrop-blur'
                  }`}>
                    <div className="flex items-center gap-8">
                      {settings.header.showLogo && (
                        <div className="flex items-center gap-2">
                          {(settings.logo.lightPreview || settings.logo.darkPreview) && (
                            <img
                              src={(previewTheme === 'dark' ? settings.logo.darkPreview : settings.logo.lightPreview) || settings.logo.lightPreview || settings.logo.darkPreview!}
                              alt="Logo"
                              className="h-8 object-contain"
                            />
                          )}
                          <span className="font-bold text-xl tracking-tight" style={{ color: settings.colors.primary }}>
                            {settings.company.name || 'Logo'}
                          </span>
                        </div>
                      )}
                      <div className={`hidden md:flex gap-6 text-sm font-medium ${previewTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {settings.header.navLinks.filter(l => l.visible).map((link, i) => (
                          <span
                            key={i}
                            className="hover:opacity-80 cursor-pointer transition-all relative group/link"
                            style={i === 0 ? { color: settings.colors.primary } : {}}
                          >
                            {link.label}
                            {i === 0 && (
                              <span
                                className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                                style={{ backgroundColor: settings.colors.primary }}
                              />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {settings.header.showSearch && (
                        <div className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105 ${previewTheme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white border text-gray-500 hover:border-gray-300'}`}>
                          <Search className="w-4 h-4" />
                          <span className="text-xs">검색</span>
                        </div>
                      )}
                      {settings.header.showWishlist && (
                        <Heart className={`w-5 h-5 cursor-pointer transition-all hover:scale-110 ${previewTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} />
                      )}
                      {settings.header.showCart && (
                        <ShoppingCart className={`w-5 h-5 cursor-pointer transition-all hover:scale-110 ${previewTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} />
                      )}
                      {settings.header.showNotifications && (
                        <Bell className={`w-5 h-5 cursor-pointer transition-all hover:scale-110 ${previewTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} />
                      )}
                      {settings.header.showThemeToggle && (
                        <button
                          onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 ${previewTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white border hover:border-gray-300'}`}
                        >
                          {previewTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </button>
                      )}
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{
                          background: `linear-gradient(to bottom right, ${settings.colors.primary}, ${settings.colors.secondary})`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 배너 */}
                {settings.banner.enabled && settings.banner.items.length > 0 && (
                  <div className="relative h-40 flex items-center justify-center text-white overflow-hidden group">
                    {/* 배경 이미지 또는 그라데이션 */}
                    {settings.banner.items[previewBannerIndex]?.imagePreview ? (
                      <>
                        <img
                          src={settings.banner.items[previewBannerIndex].imagePreview || ''}
                          alt={settings.banner.items[previewBannerIndex].title}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                      </>
                    ) : (
                      <>
                        <div
                          className="absolute inset-0 transition-all duration-500"
                          style={{
                            background: `linear-gradient(to right, ${settings.colors.primary}, ${settings.colors.secondary})`
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20" />
                      </>
                    )}

                    {/* 배너 텍스트 */}
                    <div className="relative z-10 text-center px-4">
                      <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">{settings.banner.items[previewBannerIndex]?.title || '배너 제목'}</h2>
                      <p className="text-sm text-white/90 drop-shadow">지금 시작하고 새로운 기술을 배워보세요</p>
                    </div>

                    {/* 배너 네비게이션 (2개 이상일 때만 표시) */}
                    {settings.banner.items.length > 1 && (
                      <>
                        <button
                          onClick={() => setPreviewBannerIndex((prev) => (prev > 0 ? prev - 1 : settings.banner.items.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <button
                          onClick={() => setPreviewBannerIndex((prev) => (prev < settings.banner.items.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                          {settings.banner.items.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setPreviewBannerIndex(idx)}
                              className={`w-2 h-2 rounded-full transition ${
                                idx === previewBannerIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {/* 컨텐츠 영역 */}
                <div className={`px-6 py-8 min-h-[300px] ${previewTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                  {/* 카테고리 */}
                  {settings.category.enabled && (
                    <div className="mb-8">
                      <h3 className={`text-sm font-semibold mb-3 ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{settings.category.sectionTitle}</h3>
                      <div className="flex gap-2 flex-wrap">
                        {settings.category.items.map((cat, i) => (
                          <span
                            key={i}
                            className={`px-4 py-2 text-sm rounded-full font-medium transition-colors cursor-pointer ${
                              i === 0
                                ? 'text-white'
                                : previewTheme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={i === 0 ? { backgroundColor: settings.colors.primary } : {}}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 강의 섹션들 */}
                  {settings.courseSections.enabled && settings.courseSections.items.map((section, sectionIndex) => (
                    <div key={section.id} className={sectionIndex > 0 ? 'mt-8' : ''}>
                      <h3 className={`text-lg font-bold mb-4 ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{section.title}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`rounded-xl overflow-hidden border transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer group ${
                            previewTheme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}>
                            <div
                              className="w-full h-32 relative overflow-hidden"
                              style={{
                                background: `linear-gradient(to bottom right, ${settings.colors.primary}, ${settings.colors.secondary})`
                              }}
                            >
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <div className="p-3">
                              <div className={`h-4 rounded w-full mb-2 ${previewTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                              <div className={`h-3 rounded w-3/4 mb-3 ${previewTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`} />
                              <div className="flex items-center justify-between">
                                <div className={`h-3 rounded w-16 ${previewTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                <div className={`h-3 rounded w-12 ${previewTheme === 'dark' ? 'bg-yellow-800' : 'bg-yellow-100'}`} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 푸터 */}
                {settings.footer.enabled && (
                  <div className={`px-6 py-8 border-t ${previewTheme === 'dark' ? 'bg-gray-950 border-gray-800 text-gray-400' : 'bg-gray-900 border-gray-800 text-gray-400'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <div className="text-white font-bold text-lg mb-2">{settings.company.name}</div>
                        <p className="text-sm">{settings.footer.copyright}</p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {settings.footer.legalLinks.map((link, i) => (
                          <span key={i} className="text-sm hover:text-white cursor-pointer transition-colors">{link.label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {settings.footer.socialLinks.facebook.enabled && (
                        <a
                          href={settings.footer.socialLinks.facebook.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${previewTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                          style={{ color: 'white' }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      {settings.footer.socialLinks.twitter.enabled && (
                        <a
                          href={settings.footer.socialLinks.twitter.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${previewTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                          style={{ color: 'white' }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                      {settings.footer.socialLinks.youtube.enabled && (
                        <a
                          href={settings.footer.socialLinks.youtube.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${previewTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                          style={{ color: 'white' }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      )}
                      {settings.footer.socialLinks.instagram.enabled && (
                        <a
                          href={settings.footer.socialLinks.instagram.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${previewTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                          style={{ color: 'white' }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {settings.footer.socialLinks.linkedin.enabled && (
                        <a
                          href={settings.footer.socialLinks.linkedin.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${previewTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                          style={{ color: 'white' }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {settings.footer.socialLinks.github.enabled && (
                        <a
                          href={settings.footer.socialLinks.github.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${previewTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                          style={{ color: 'white' }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 마이페이지 미리보기 */}
            <TabsContent value="tu-mypage">
              <div className={`border rounded-lg overflow-hidden ${previewTheme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
                {/* 브라우저 탭 시뮬레이션 (파비콘 미리보기) */}
                <div className={`flex items-center gap-2 px-3 py-2 border-b ${previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-t-md text-xs ${previewTheme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-600'}`}>
                    {settings.logo.faviconPreview ? (
                      <img src={settings.logo.faviconPreview} alt="Favicon" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-gray-300" />
                    )}
                    <span className="truncate max-w-[120px]">{settings.company.name || '사이트 제목'}</span>
                  </div>
                </div>

                {/* 헤더 */}
                <div className={`h-16 border-b flex items-center px-6 ${
                  previewTheme === 'dark' ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {(settings.logo.lightPreview || settings.logo.darkPreview) && (
                      <img
                        src={(previewTheme === 'dark' ? settings.logo.darkPreview : settings.logo.lightPreview) || settings.logo.lightPreview || settings.logo.darkPreview!}
                        alt="Logo"
                        className="h-8 object-contain"
                      />
                    )}
                    <span className="font-bold text-xl tracking-tight" style={{ color: settings.colors.primary }}>
                      {settings.company.name || 'Logo'}
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <Bell className={`w-5 h-5 ${previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        background: `linear-gradient(to bottom right, ${settings.colors.primary}, ${settings.colors.secondary})`
                      }}
                    />
                  </div>
                </div>

                {/* 사이드바 + 컨텐츠 레이아웃 */}
                <div className="flex">
                  {/* 사이드바 (마이페이지 스타일) */}
                  {settings.sidebarTU.enabled && (
                    <div className={`w-56 border-r p-4 min-h-[600px] ${
                      previewTheme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-[#f9fafb] border-gray-200'
                    }`}>
                      {/* 모드 전환 탭 */}
                      <div className={`flex gap-1 mb-4 p-1 rounded-lg ${
                        previewTheme === 'dark' ? 'bg-white/5' : 'bg-gray-200'
                      }`}>
                        <button className={`flex-1 px-3 py-2 text-xs rounded-md transition-all hover:scale-[1.02] ${
                          previewTheme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                        }`}>
                          강사
                        </button>
                        <button
                          className="flex-1 px-3 py-2 text-xs rounded-md transition-all text-white font-medium hover:scale-[1.02] shadow-sm"
                          style={{
                            background: `linear-gradient(to right, ${settings.colors.primary}, ${settings.colors.secondary})`
                          }}
                        >
                          학습자
                        </button>
                      </div>

                      {/* 메뉴 아이템 */}
                      {settings.sidebarTU.items.filter(item => item.visible).map((item, idx) => {
                        const isExpanded = expandedMenuItems.has(item.id);
                        const hasChildren = item.children && item.children.length > 0;
                        const IconComponent = item.icon ? iconMap[item.icon] : null;
                        return (
                          <div key={item.id} className="mb-1">
                            <div
                              onClick={() => {
                                if (hasChildren) {
                                  setExpandedMenuItems(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(item.id)) {
                                      newSet.delete(item.id);
                                    } else {
                                      newSet.add(item.id);
                                    }
                                    return newSet;
                                  });
                                }
                              }}
                              className={`px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center gap-2 transition-all ${
                                idx === 0
                                  ? previewTheme === 'dark'
                                    ? 'bg-[#2d2d30] text-white'
                                    : 'bg-gray-200 text-gray-900 font-medium'
                                  : previewTheme === 'dark'
                                    ? 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                                    : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {IconComponent && <IconComponent className="w-4 h-4 flex-shrink-0" />}
                              <span className={`truncate ${!item.label ? 'italic opacity-50' : ''}`}>
                                {item.label || '(새 항목)'}
                              </span>
                              {hasChildren && (
                                <ChevronDown
                                  className={`ml-auto w-3 h-3 flex-shrink-0 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  } ${previewTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                                />
                              )}
                            </div>
                            {hasChildren && isExpanded && (
                              <div className="ml-4 mt-1 space-y-1">
                                {item.children!.filter(child => child.visible).map((child) => {
                                  const ChildIconComponent = child.icon ? iconMap[child.icon] : null;
                                  return (
                                    <div
                                      key={child.id}
                                      className={`px-3 py-1.5 text-xs rounded-md cursor-pointer transition-all hover:translate-x-1 flex items-center gap-2 ${
                                        previewTheme === 'dark'
                                          ? 'text-gray-500 hover:bg-white/5 hover:text-gray-400'
                                          : 'text-gray-500 hover:bg-gray-50'
                                      }`}
                                    >
                                      {ChildIconComponent && <ChildIconComponent className="w-3 h-3 flex-shrink-0" />}
                                      <span className={`truncate ${!child.label ? 'italic opacity-50' : ''}`}>
                                        {child.label || '(새 항목)'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 컨텐츠 영역 */}
                  <div className={`flex-1 p-6 ${previewTheme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
                    {/* 프로필 섹션 */}
                    <div className={`rounded-2xl p-6 mb-6 ${
                      previewTheme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white shadow-sm border border-gray-200'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-full flex-shrink-0"
                          style={{
                            background: `linear-gradient(to bottom right, ${settings.colors.primary}, ${settings.colors.secondary})`
                          }}
                        />
                        <div className="flex-1">
                          <h1 className={`text-xl font-bold mb-1 ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            홍길동님 안녕하세요!
                          </h1>
                          <p className={`text-sm ${previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            user@example.com
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 학습 통계 */}
                    <h2 className={`text-base font-semibold mb-3 ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      학습 현황
                    </h2>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {[
                        { label: '수강 중', value: '0' },
                        { label: '완료한 강의', value: '0' },
                        { label: '중도 포기', value: '0' },
                        { label: '전체', value: '0' },
                      ].map((stat, i) => (
                        <div key={i} className={`p-4 rounded-xl ${
                          previewTheme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
                        }`}>
                          <p className={`text-xs mb-2 ${previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {stat.label}
                          </p>
                          <p className={`text-2xl font-bold ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* 최근 학습 (빈 상태) */}
                    <h2 className={`text-base font-semibold mb-3 ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      최근 학습
                    </h2>
                    <div className={`rounded-xl p-8 mb-6 text-center ${
                      previewTheme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
                    }`}>
                      <p className={`text-sm ${previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        수강 중인 강의가 없습니다
                      </p>
                    </div>

                    {/* 빠른 메뉴 */}
                    <h2 className={`text-base font-semibold mb-3 ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      빠른 메뉴
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {['내 수강 강의', '수료증'].map((label, i) => (
                        <div key={i} className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                          previewTheme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 shadow-sm hover:bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `linear-gradient(to bottom right, ${settings.colors.primary}, ${settings.colors.secondary})`
                              }}
                            />
                            <span className={`text-sm font-medium ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TO 미리보기 */}
            <TabsContent value="to">
              <div className={`border rounded-lg overflow-hidden ${previewTheme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
                {/* 브라우저 탭 시뮬레이션 (파비콘 미리보기) */}
                <div className={`flex items-center gap-2 px-3 py-2 border-b ${previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-t-md text-xs ${previewTheme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-600'}`}>
                    {settings.logo.faviconPreview ? (
                      <img src={settings.logo.faviconPreview} alt="Favicon" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-gray-300" />
                    )}
                    <span className="truncate max-w-[120px]">{settings.company.name || '사이트 제목'}</span>
                  </div>
                </div>

                {/* 헤더 */}
                <div className={`h-16 border-b flex items-center px-6 ${
                  previewTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {(settings.logo.lightPreview || settings.logo.darkPreview) && (
                      <img
                        src={(previewTheme === 'dark' ? settings.logo.darkPreview : settings.logo.lightPreview) || settings.logo.lightPreview || settings.logo.darkPreview!}
                        alt="Logo"
                        className="h-8 object-contain"
                      />
                    )}
                    <span className={`font-bold text-xl ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {settings.company.name || 'Logo'}
                    </span>
                  </div>
                  <span
                    className="ml-3 text-sm px-2 py-1 rounded-full cursor-pointer transition-all hover:scale-105"
                    style={{
                      backgroundColor: previewTheme === 'dark' ? `${settings.colors.primary}33` : `${settings.colors.primary}15`,
                      color: settings.colors.primary
                    }}
                  >
                    테넌트 관리자
                  </span>
                  <div className="ml-auto flex items-center gap-3">
                    <Bell className={`w-5 h-5 cursor-pointer transition-all hover:scale-110 ${previewTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} />
                    <div
                      className="w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110"
                      style={{
                        background: `linear-gradient(to bottom right, ${settings.colors.primary}, ${settings.colors.secondary})`
                      }}
                    />
                  </div>
                </div>
                <div className="flex">
                  {/* 사이드바 */}
                  {settings.sidebarCO.enabled && (
                    <div className={`w-64 border-r p-4 min-h-[400px] ${
                      previewTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                      <div className={`text-xs font-semibold mb-3 px-2 ${previewTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>관리 메뉴</div>
                      {settings.sidebarCO.items.filter(item => item.visible).map((item, idx) => {
                        const isExpanded = expandedMenuItems.has(item.id);
                        const hasChildren = item.children && item.children.length > 0;
                        const IconComponent = item.icon ? iconMap[item.icon] : null;
                        return (
                          <div key={item.id} className="mb-1">
                            <div
                              onClick={() => {
                                if (hasChildren) {
                                  setExpandedMenuItems(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(item.id)) {
                                      newSet.delete(item.id);
                                    } else {
                                      newSet.add(item.id);
                                    }
                                    return newSet;
                                  });
                                }
                              }}
                              className={`px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center gap-2 transition-all ${
                                idx === 0
                                  ? ''
                                  : previewTheme === 'dark' ? 'text-gray-300 hover:bg-gray-900' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              style={idx === 0 ? {
                                backgroundColor: previewTheme === 'dark' ? `${settings.colors.primary}33` : `${settings.colors.primary}15`,
                                color: settings.colors.primary
                              } : {}}
                            >
                              {IconComponent && <IconComponent className="w-4 h-4 flex-shrink-0" />}
                              <span className={`font-medium flex-1 ${!item.label ? 'italic opacity-50' : ''}`}>
                                {item.label || '(새 항목)'}
                              </span>
                              {hasChildren && (
                                <ChevronDown
                                  className={`h-4 w-4 flex-shrink-0 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  } ${previewTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                                />
                              )}
                            </div>
                            {hasChildren && isExpanded && (
                              <div className="ml-4 mt-1 space-y-1">
                                {item.children!.filter(c => c.visible).map((child) => {
                                  const ChildIconComponent = child.icon ? iconMap[child.icon] : null;
                                  return (
                                    <div
                                      key={child.id}
                                      className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all hover:translate-x-1 flex items-center gap-2 ${
                                        previewTheme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                      }`}
                                    >
                                      {ChildIconComponent && <ChildIconComponent className="w-3 h-3 flex-shrink-0" />}
                                      <span className={`truncate ${!child.label ? 'italic opacity-50' : ''}`}>
                                        {child.label || '(새 항목)'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* 컨텐츠 영역 */}
                  <div className={`flex-1 p-6 ${previewTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <h2 className={`text-2xl font-bold mb-6 ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>대시보드</h2>

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: '전체 사용자', value: '1,234', icon: '👥' },
                        { label: '활성 강의', value: '89', icon: '📚' },
                        { label: '이번 달 매출', value: '₩45.2M', icon: '💰' },
                        { label: '완료율', value: '87%', icon: '✅' },
                      ].map((stat, i) => (
                        <div key={i} className={`rounded-xl p-4 border ${
                          previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{stat.icon}</span>
                          </div>
                          <div className={`text-sm mb-1 ${previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                          <div className={`text-xl font-bold ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* 차트 영역 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`rounded-xl p-6 border ${
                        previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}>
                        <h3 className={`font-semibold mb-4 ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>사용자 증가 추이</h3>
                        <div className={`h-32 rounded-lg flex items-end gap-2 px-4 ${previewTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                            <div key={i} className="flex-1 relative">
                              <div
                                className="w-full rounded-t"
                                style={{
                                  height: `${height}%`,
                                  backgroundColor: settings.colors.primary
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={`rounded-xl p-6 border ${
                        previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}>
                        <h3 className={`font-semibold mb-4 ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>최근 활동</h3>
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                                previewTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}>
                                A{i}
                              </div>
                              <div className="flex-1">
                                <div className={`h-3 rounded w-3/4 mb-1.5 ${previewTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                <div className={`h-2 rounded w-1/2 ${previewTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
