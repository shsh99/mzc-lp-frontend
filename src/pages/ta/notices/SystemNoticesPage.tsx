import { useState } from 'react';
import {
  Bell,
  Pin,
  Eye,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/common/Dialog';
import {
  useSystemNotices,
  useSystemNotice,
  useMarkSystemNoticeAsRead,
} from '@/hooks/ta/useSystemNoticeQueries';
import type { Notice } from '@/types/admin';

const typeConfig: Record<string, { label: string; color: string }> = {
  GENERAL: { label: '일반', color: 'bg-gray-100 text-gray-700' },
  UPDATE: { label: '업데이트', color: 'bg-blue-100 text-blue-700' },
  SYSTEM: { label: '시스템', color: 'bg-yellow-100 text-yellow-700' },
  EVENT: { label: '이벤트', color: 'bg-purple-100 text-purple-700' },
};

// 탭용 콘텐츠 컴포넌트 (NoticeAndNotificationPage에서 사용)
export function SystemNoticesContent() {
  const [page, setPage] = useState(0);
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);

  const { data: noticesData, isLoading } = useSystemNotices({ page, size: 10 });
  const { data: selectedNotice } = useSystemNotice(selectedNoticeId || 0);
  const markAsReadMutation = useMarkSystemNoticeAsRead();

  const notices = noticesData?.content || [];
  const totalPages = noticesData?.totalPages || 0;
  const totalElements = noticesData?.totalElements || 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewNotice = (notice: Notice) => {
    setSelectedNoticeId(notice.id);
    // 읽음 처리
    markAsReadMutation.mutate(notice.id);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle>공지사항 목록</CardTitle>
                <CardDescription>전체 {totalElements}개의 공지사항</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>배포된 시스템 공지사항이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((notice) => {
                const typeConf = typeConfig[notice.type] || typeConfig.GENERAL;

                return (
                  <div
                    key={notice.id}
                    className="p-4 border rounded-lg hover:bg-bg-secondary cursor-pointer transition-colors"
                    onClick={() => handleViewNotice(notice)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {notice.isPinned && (
                            <Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          )}
                          <h3 className="font-medium">{notice.title}</h3>
                          <Badge className={typeConf.color}>{typeConf.label}</Badge>
                        </div>
                        <p className="text-sm text-text-secondary line-clamp-2">
                          {notice.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(notice.publishedAt)}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          보기
                        </Button>
                      </div>
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
      <Dialog open={selectedNoticeId !== null} onOpenChange={() => setSelectedNoticeId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedNotice?.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
              <DialogTitle>{selectedNotice?.title}</DialogTitle>
            </div>
            <DialogDescription className="flex items-center gap-3">
              {selectedNotice && (
                <>
                  <Badge className={typeConfig[selectedNotice.type]?.color || typeConfig.GENERAL.color}>
                    {typeConfig[selectedNotice.type]?.label || '일반'}
                  </Badge>
                  <span className="text-xs">
                    {formatDate(selectedNotice.publishedAt)}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedNotice && (
            <div className="mt-4">
              {/* Expiry Warning */}
              {selectedNotice.expiredAt && new Date(selectedNotice.expiredAt) < new Date() && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">이 공지사항은 만료되었습니다.</span>
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedNotice.content }}
              />

              {/* Footer */}
              <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  읽음
                </div>
                {selectedNotice.expiredAt && (
                  <span>만료일: {formatDate(selectedNotice.expiredAt)}</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// 독립 페이지 컴포넌트
export function SystemNoticesPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="시스템 공지사항"
        description="시스템 관리자가 배포한 공지사항입니다"
      />
      <div className="mt-6">
        <SystemNoticesContent />
      </div>
    </div>
  );
}
