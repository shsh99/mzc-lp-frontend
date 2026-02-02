import { AdminPageHeader } from '@/components/domain/admin';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { Building2, CreditCard } from 'lucide-react';
import { TenantsContent } from './TenantsPage';
import { BillingContent } from '../billing/BillingPage';

/**
 * 테넌트 관리 통합 페이지
 * - 테넌트 목록 탭: 테넌트 CRUD + 현황 통계
 * - 구독 관리 탭: 결제 및 구독 관리
 */
export function TenantManagementPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="테넌트 관리"
        description="테넌트 목록과 구독을 한 곳에서 관리합니다"
      />

      <Tabs defaultValue="tenants" className="mt-6">
        <TabsList>
          <TabsTrigger value="tenants" className="gap-2">
            <Building2 className="h-4 w-4" />
            테넌트 목록
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            구독 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="mt-6">
          <TenantsContent />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
