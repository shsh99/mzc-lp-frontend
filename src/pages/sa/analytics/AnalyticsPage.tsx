import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, X } from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useTenants } from '@/hooks/sa';
import { UsageContent } from './UsageContent';
import { ActivityContent } from './ActivityContent';
import { LogsContent } from './LogsContent';

export function AnalyticsPage() {
  const [searchParams] = useSearchParams();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({ size: 100 });

  // URL 쿼리 파라미터에서 tenantId 읽기
  useEffect(() => {
    const tenantIdParam = searchParams.get('tenantId');
    if (tenantIdParam) {
      setSelectedTenantId(Number(tenantIdParam));
    }
  }, [searchParams]);

  const tenants = tenantsData?.content || [];
  const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="데이터 및 로그 분석"
        description="플랫폼 전체 사용량, 활동 현황 및 시스템 로그를 분석합니다"
      />

      {/* 테넌트 선택 영역 */}
      <div className="mt-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">테넌트 선택</h3>
          {selectedTenantId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTenantId(null)}
            >
              <X className="h-4 w-4 mr-1" />
              전체 보기
            </Button>
          )}
        </div>

        {!tenantsLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 전체 보기 카드 */}
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTenantId === null ? 'ring-2 ring-brand-primary' : ''
              }`}
              onClick={() => setSelectedTenantId(null)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">전체</p>
                    <p className="text-xs text-text-secondary">{tenants.length}개</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 테넌트 카드들 */}
            {tenants.slice(0, 11).map((tenant) => (
              <Card
                key={tenant.tenantId}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTenantId === tenant.tenantId ? 'ring-2 ring-brand-primary' : ''
                }`}
                onClick={() => setSelectedTenantId(tenant.tenantId)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium truncate max-w-full" title={tenant.name}>
                        {tenant.name}
                      </p>
                      <p className="text-xs text-text-secondary">{tenant.code}</p>
                      <Badge
                        variant={tenant.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {tenant.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTenant && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">{selectedTenant.name}</span> 테넌트의 데이터를 조회합니다
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue="usage" className="mt-6">
        <TabsList>
          <TabsTrigger value="usage">사용량 통계</TabsTrigger>
          <TabsTrigger value="activity">활동 분석</TabsTrigger>
          <TabsTrigger value="logs">로그 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="mt-6">
          <UsageContent tenantId={selectedTenantId} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityContent tenantId={selectedTenantId} />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <LogsContent tenantId={selectedTenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
