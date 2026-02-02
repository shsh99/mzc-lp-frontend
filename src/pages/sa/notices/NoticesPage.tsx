import { AdminPageHeader } from '@/components/domain/admin';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { NoticesContent } from './NoticesContent';
import { NoticeDistributionContent } from './NoticeDistributionContent';

export function NoticesPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="공지사항 관리"
        description="전체 테넌트에 공지사항을 관리하고 배포 현황을 확인합니다"
      />

      <Tabs defaultValue="notices" className="mt-6">
        <TabsList>
          <TabsTrigger value="notices">공지사항</TabsTrigger>
          <TabsTrigger value="distribution">배포 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="notices" className="mt-6">
          <NoticesContent />
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <NoticeDistributionContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
