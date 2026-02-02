import { useState } from 'react';
import {
  Send,
  Building2,
  CheckCircle,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Pin,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Progress } from '@/components/common/Progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/common/Dialog';
import {
  useDistributionStats,
  useDistributionSummary,
  useDistributionStatsForNotice,
} from '@/hooks/sa';
import type { TenantDistributionInfo } from '@/types/admin';

const typeConfig: Record<string, { label: string; color: string }> = {
  GENERAL: { label: '일반', color: 'bg-gray-100 text-gray-700' },
  UPDATE: { label: '업데이트', color: 'bg-blue-100 text-blue-700' },
  SYSTEM: { label: '시스템', color: 'bg-yellow-100 text-yellow-700' },
  EVENT: { label: '이벤트', color: 'bg-purple-100 text-purple-700' },
};

export function NoticeDistributionPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState<number | null>(null);

  const { data: statsData, isLoading } = useDistributionStats({ page, size: 10 });
  const { data: summary } = useDistributionSummary();
  const { data: noticeDetail } = useDistributionStatsForNotice(selectedNotice || 0);

  const distributions = statsData?.content || [];
  const totalPages = statsData?.totalPages || 0;

  const filteredDistributions = distributions.filter((dist) =>
    dist.noticeTitle.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="공지사항 배포 관리"
        description="공지사항의 테넌트별 배포 현황을 관리합니다"
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 rounded-lg">
                <Send className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.totalDistributions || 0}</p>
                <p className="text-sm text-text-secondary">전체 배포</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.completedCount || 0}</p>
                <p className="text-sm text-text-secondary">발행 완료</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.totalReadCount || 0}</p>
                <p className="text-sm text-text-secondary">총 열람</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Building2 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.totalTenants || 0}</p>
                <p className="text-sm text-text-secondary">대상 테넌트</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Read Rate */}
      {summary && summary.averageReadRate > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">평균 열람율</span>
              <span className="text-sm font-bold">{summary.averageReadRate.toFixed(1)}%</span>
            </div>
            <Progress value={summary.averageReadRate} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Distribution List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>배포 현황</CardTitle>
              <CardDescription>공지사항별 배포 및 열람 현황입니다</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                placeholder="공지 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDistributions.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>배포된 공지사항이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDistributions.map((dist) => {
                const typeConf = typeConfig[dist.noticeType] || typeConfig.GENERAL;
                const sentPercent = dist.totalTenants > 0 ? (dist.sentCount / dist.totalTenants) * 100 : 0;
                const readPercent = dist.sentCount > 0 ? (dist.readCount / dist.sentCount) * 100 : 0;

                return (
                  <div key={dist.noticeId} className="p-4 border rounded-lg hover:bg-bg-secondary">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {dist.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                        <h3 className="font-medium">{dist.noticeTitle}</h3>
                        <Badge className={typeConf.color}>{typeConf.label}</Badge>
                      </div>
                      <span className="text-sm text-text-secondary">
                        {formatDate(dist.publishedAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text-secondary">발송 현황</span>
                          <span>{dist.sentCount} / {dist.totalTenants} 테넌트</span>
                        </div>
                        <Progress value={sentPercent} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text-secondary">열람율</span>
                          <span>{dist.readCount} / {dist.sentCount} ({readPercent.toFixed(0)}%)</span>
                        </div>
                        <Progress value={readPercent} className="h-2" />
                      </div>
                    </div>

                    <div className="flex justify-end mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNotice(dist.noticeId)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        상세 보기
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={selectedNotice !== null} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>배포 상세 현황</DialogTitle>
            <DialogDescription>
              {noticeDetail?.noticeTitle}
            </DialogDescription>
          </DialogHeader>

          {noticeDetail && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-bg-secondary rounded-lg text-center">
                  <p className="text-2xl font-bold">{noticeDetail.sentCount}</p>
                  <p className="text-sm text-text-secondary">배포됨</p>
                </div>
                <div className="p-3 bg-bg-secondary rounded-lg text-center">
                  <p className="text-2xl font-bold">{noticeDetail.readCount}</p>
                  <p className="text-sm text-text-secondary">열람</p>
                </div>
                <div className="p-3 bg-bg-secondary rounded-lg text-center">
                  <p className="text-2xl font-bold">
                    {noticeDetail.sentCount > 0
                      ? ((noticeDetail.readCount / noticeDetail.sentCount) * 100).toFixed(0)
                      : 0}%
                  </p>
                  <p className="text-sm text-text-secondary">열람율</p>
                </div>
              </div>

              {/* Tenant List */}
              <div className="border rounded-lg max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-bg-secondary sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">테넌트</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">코드</th>
                      <th className="px-4 py-2 text-center text-sm font-medium">상태</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">배포일시</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">열람일시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noticeDetail.tenantDistributions.map((tenant: TenantDistributionInfo) => (
                      <tr key={tenant.tenantId} className="border-t">
                        <td className="px-4 py-2 text-sm">{tenant.tenantName}</td>
                        <td className="px-4 py-2 text-sm text-text-secondary">{tenant.tenantCode}</td>
                        <td className="px-4 py-2 text-center">
                          {tenant.isRead ? (
                            <Badge className="bg-green-100 text-green-700">읽음</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600">미읽음</Badge>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">{formatDate(tenant.distributedAt)}</td>
                        <td className="px-4 py-2 text-sm">{formatDate(tenant.readAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
