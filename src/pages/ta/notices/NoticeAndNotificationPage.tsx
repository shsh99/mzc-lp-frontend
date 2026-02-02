import { AdminPageHeader } from '@/components/domain/admin';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { Megaphone, Send, Bell, Globe } from 'lucide-react';
import { NoticesContent } from './TenantNoticesPage';
import { DistributionContent } from './NoticeDistributionPage';
import { SystemNoticesContent } from './SystemNoticesPage';
import { NotificationTemplatesContent } from '../system/NotificationTemplatesPage';

/**
 * 공지 및 알림 관리 통합 페이지
 * - 공지사항 탭: 공지사항 작성/관리
 * - 시스템 공지 탭: SA가 배포한 시스템 공지사항 조회
 * - 배포 관리 탭: 공지 배포 현황
 * - 알림 템플릿 탭: 시스템 알림 템플릿 관리
 */
export function NoticeAndNotificationPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="공지 및 알림 관리"
        description="공지사항, 배포 현황, 알림 템플릿을 한 곳에서 관리합니다"
      />

      <Tabs defaultValue="notices" className="mt-6">
        <TabsList>
          <TabsTrigger value="notices" className="gap-2">
            <Megaphone className="h-4 w-4" />
            공지사항
          </TabsTrigger>
          <TabsTrigger value="system-notices" className="gap-2">
            <Globe className="h-4 w-4" />
            시스템 공지
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2">
            <Send className="h-4 w-4" />
            배포 관리
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Bell className="h-4 w-4" />
            알림 템플릿
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notices" className="mt-6">
          <NoticesContent />
        </TabsContent>

        <TabsContent value="system-notices" className="mt-6">
          <SystemNoticesContent />
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <DistributionContent />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <NotificationTemplatesContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
