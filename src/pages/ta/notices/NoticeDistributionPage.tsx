import { useState } from 'react';
import {
  Send,
  Users,
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
  useTenantNoticeDistributionStats,
  useTenantNoticeDistributionSummary,
  useTenantNoticeDistributionDetail,
} from '@/hooks/ta/useTenantNoticeQueries';
import type { TenantNoticeType, NoticeTargetAudience } from '@/types/ta/tenantNotice.types';

const typeConfig: Record<TenantNoticeType, { label: string; color: string }> = {
  GENERAL: { label: '일반', color: 'bg-gray-100 text-gray-700' },
  IMPORTANT: { label: '중요', color: 'bg-blue-100 text-blue-700' },
  URGENT: { label: '긴급', color: 'bg-red-100 text-red-700' },
  EVENT: { label: '이벤트', color: 'bg-purple-100 text-purple-700' },
};

const audienceConfig: Record<NoticeTargetAudience, string> = {
  ALL: '전체',
  OPERATOR: '운영자',
  USER: '사용자',
  DESIGNER: '설계자',
  INSTRUCTOR: '강사',
};

// 탭용 콘텐츠 컴포넌트 (NoticeAndNotificationPage에서 사용)
export function DistributionContent() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState<number | null>(null);

  const { data: statsData, isLoading } = useTenantNoticeDistributionStats({ page, size: 10 });
  const { data: summary } = useTenantNoticeDistributionSummary();
  const { data: noticeDetail } = useTenantNoticeDistributionDetail(selectedNotice || 0);

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
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.totalTargetUsers || 0}</p>
                <p className="text-sm text-text-secondary">대상 사용자</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>배포 현황</CardTitle>
              <CardDescription>공지사항별 배포 현황입니다</CardDescription>
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
                const sentPercent = dist.totalUsers > 0 ? (dist.sentCount / dist.totalUsers) * 100 : 0;

                return (
                  <div key={dist.noticeId} className="p-4 border rounded-lg hover:bg-bg-secondary">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {dist.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                        <h3 className="font-medium">{dist.noticeTitle}</h3>
                        <Badge className={typeConf.color}>{typeConf.label}</Badge>
                        <Badge variant="outline">{audienceConfig[dist.targetAudience]}</Badge>
                      </div>
                      <span className="text-sm text-text-secondary">
                        {formatDate(dist.publishedAt)}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">발송 현황</span>
                        <span>{dist.sentCount} / {dist.totalUsers} 명</span>
                      </div>
                      <Progress value={sentPercent} className="h-2" />
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
              <div className="flex justify-center">
                <div className="p-4 bg-bg-secondary rounded-lg text-center min-w-[200px]">
                  <p className="text-3xl font-bold">{noticeDetail.sentCount}</p>
                  <p className="text-sm text-text-secondary mt-1">배포 완료</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 기존 NoticeDistributionPage - 호환성 유지용 (독립 페이지로 사용 시)
export function NoticeDistributionPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="공지사항 배포 관리"
        description="공지사항의 사용자별 배포 현황을 관리합니다"
      />
      <div className="mt-6">
        <DistributionContent />
      </div>
    </div>
  );
}
