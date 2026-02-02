import { AdminPageHeader } from '@/components/domain/admin';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { Users, Building2 } from 'lucide-react';
import { UsersContent } from './UsersPage';
import { DepartmentsContent } from './DepartmentManagementPage';

/**
 * 사용자 및 부서 관리 통합 페이지
 * - 사용자 관리 탭: 사용자 목록, 역할 관리, 초대, 단체 계정 생성
 * - 부서 관리 탭: 부서 구조 관리, 부서별 인원 관리
 */
export function UserAndDepartmentPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="사용자 및 부서 관리"
        description="테넌트 내 사용자와 부서 구조를 관리합니다"
      />

      <Tabs defaultValue="users" className="mt-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            사용자 관리
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Building2 className="h-4 w-4" />
            부서 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UsersContent />
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <DepartmentsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
