import { useState } from 'react';
import { Globe, ExternalLink, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { useTenants, useDeleteCustomDomain } from '@/hooks/sa';
import { toast } from 'sonner';

export function DomainSettingsPage() {
  const [deletingDomainId, setDeletingDomainId] = useState<number | null>(null);

  // 모든 테넌트 조회 (페이지네이션 없이)
  const { data: tenantsData, isLoading, isError } = useTenants({ size: 1000 });
  const deleteCustomDomain = useDeleteCustomDomain();

  const tenants = tenantsData?.content || [];

  // 도메인 목록 생성 (subdomain + customDomain)
  const domains = tenants.flatMap((tenant) => {
    const domainList = [];

    // 기본 서브도메인 (항상 존재)
    domainList.push({
      id: `${tenant.tenantId}-subdomain`,
      tenantId: tenant.tenantId,
      subdomain: tenant.subdomain,
      domain: `${tenant.subdomain}.mzc-lp.com`,
      type: 'SUBDOMAIN' as const,
      tenantName: tenant.name,
      tenantCode: tenant.code,
      createdAt: tenant.createdAt,
    });

    // 커스텀 도메인 (있는 경우에만)
    if (tenant.customDomain) {
      domainList.push({
        id: `${tenant.tenantId}-custom`,
        tenantId: tenant.tenantId,
        subdomain: tenant.subdomain,
        domain: tenant.customDomain,
        type: 'CUSTOM' as const,
        tenantName: tenant.name,
        tenantCode: tenant.code,
        createdAt: tenant.createdAt,
      });
    }

    return domainList;
  });

  // DNS 검증 상태 확인 (간단하게: 커스텀 도메인은 확인 필요로 표시)
  const getDnsStatus = (domain: typeof domains[0]) => {
    if (domain.type === 'SUBDOMAIN') {
      return { status: 'verified', label: '검증됨', icon: CheckCircle2, color: 'bg-green-100 text-green-700' };
    }
    // 커스텀 도메인은 DNS 확인 필요
    return { status: 'pending', label: 'DNS 확인 필요', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700' };
  };

  // 커스텀 도메인 삭제
  const handleDeleteCustomDomain = async (tenantId: number, domainName: string) => {
    if (!confirm(`정말로 "${domainName}" 커스텀 도메인을 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingDomainId(tenantId);
    try {
      await deleteCustomDomain.mutateAsync(tenantId);
      toast.success('커스텀 도메인이 삭제되었습니다.');
    } catch (error) {
      toast.error('커스텀 도메인 삭제에 실패했습니다.');
      console.error('Delete custom domain error:', error);
    } finally {
      setDeletingDomainId(null);
    }
  };

  return (
    <div className="p-6">
      <AdminPageHeader
        title="도메인 관리"
        description="시스템에 등록된 테넌트 도메인을 관리합니다"
      />

      {/* Domain List */}
      <Card>
        <CardHeader>
          <CardTitle>등록된 도메인</CardTitle>
          <CardDescription>
            각 테넌트의 서브도메인과 커스텀 도메인 목록입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={`skeleton-${i}`} className="h-48 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-text-secondary">
              <p>도메인 목록을 불러오는데 실패했습니다.</p>
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>등록된 도메인이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {domains.map((domain) => {
                const dnsStatus = getDnsStatus(domain);
                const DnsIcon = dnsStatus.icon;
                const isDeleting = deletingDomainId === domain.tenantId;

                return (
                  <Card key={domain.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-brand-primary/10 rounded-lg">
                          <Globe className="h-6 w-6 text-brand-primary" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={domain.type === 'SUBDOMAIN' ? 'default' : 'secondary'}>
                            {domain.type === 'SUBDOMAIN' ? '서브도메인' : '커스텀'}
                          </Badge>
                          {/* DNS 상태 배지 */}
                          <div className="flex items-center gap-1">
                            <DnsIcon className="h-3 w-3" />
                            <Badge className={dnsStatus.color}>{dnsStatus.label}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-lg break-all">{domain.domain}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-text-secondary">{domain.tenantName}</p>
                            <span className="text-xs text-text-tertiary">({domain.tenantCode})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <a
                            href={`https://mzc-lp-frontend.vercel.app/${domain.type === 'CUSTOM' ? domain.domain : domain.subdomain}/tu/b2c?from_sa=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-brand-primary hover:underline font-medium"
                          >
                            사이트 열기
                            <ExternalLink className="h-4 w-4" />
                          </a>

                          {/* 커스텀 도메인 삭제 버튼 */}
                          {domain.type === 'CUSTOM' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteCustomDomain(domain.tenantId, domain.domain)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
