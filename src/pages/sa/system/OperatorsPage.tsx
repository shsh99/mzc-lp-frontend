import { useState, useMemo } from 'react';
import {
  UserCog,
  Search,
  Mail,
  Phone,
  Shield,
  Plus,
} from 'lucide-react';
import { AdminPageHeader, StatusBadge, RoleBadge } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/Avatar';
import { Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/common/Button';
import { useSystemAdmins, useCreateSystemAdmin } from '@/hooks/sa';
import { CreateSystemAdminDialog } from './CreateSystemAdminDialog';
import { toast } from 'sonner';

export function OperatorsPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // API 호출
  const { data: adminsData, isLoading, isError } = useSystemAdmins({
    keyword: searchKeyword || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    size: 20,
  });

  // Create mutation
  const createSystemAdmin = useCreateSystemAdmin();

  const admins = adminsData?.content || [];

  // 통계 계산
  const stats = useMemo(() => {
    return {
      total: adminsData?.totalElements || 0,
      active: admins.filter((a) => a.status === 'ACTIVE').length,
    };
  }, [admins, adminsData?.totalElements]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <AdminPageHeader
          title="운영자 관리"
          description="시스템 운영자(SYSTEM_ADMIN)를 관리합니다"
        />
        <div className="space-y-4 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <AdminPageHeader
          title="운영자 관리"
          description="시스템 운영자(SYSTEM_ADMIN)를 관리합니다"
        />
        <div className="text-center py-12 text-text-secondary">
          <p>운영자 목록을 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  const handleCreateSystemAdmin = async (data: any) => {
    try {
      await createSystemAdmin.mutateAsync(data);
      toast.success('시스템 관리자가 생성되었습니다.');
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '시스템 관리자 생성에 실패했습니다.');
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="운영자 관리"
        description="시스템 운영자(SYSTEM_ADMIN)를 관리합니다"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            운영자 추가
          </Button>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 rounded-lg">
                <UserCog className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-text-secondary">전체 운영자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-text-secondary">시스템 관리자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <UserCog className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-text-secondary">활성 운영자</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operators List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>운영자 목록</CardTitle>
              <CardDescription>SYSTEM_ADMIN 권한을 가진 사용자 목록입니다</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="이름, 이메일 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="ACTIVE">활성</SelectItem>
                  <SelectItem value="INACTIVE">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>등록된 운영자가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.userId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          admin.profileImageUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${admin.name}`
                        }
                      />
                      <AvatarFallback>{admin.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{admin.name}</p>
                        <RoleBadge role={admin.role} />
                        <StatusBadge status={admin.status} />
                      </div>
                      {admin.department && (
                        <p className="text-sm text-text-secondary">{admin.department}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-text-secondary">
                        <Mail className="h-3 w-3" />
                        {admin.email}
                      </div>
                      {admin.phone && (
                        <div className="flex items-center gap-1 text-text-secondary mt-1">
                          <Phone className="h-3 w-3" />
                          {admin.phone}
                        </div>
                      )}
                    </div>
                    {admin.lastLoginAt && (
                      <div className="text-right text-sm">
                        <p className="text-text-secondary">최근 로그인</p>
                        <p>{new Date(admin.lastLoginAt).toLocaleString('ko-KR')}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {adminsData && adminsData.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                className="px-4 py-2 border rounded disabled:opacity-50"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </button>
              <span className="flex items-center px-4 text-sm text-text-secondary">
                {page + 1} / {adminsData.totalPages}
              </span>
              <button
                className="px-4 py-2 border rounded disabled:opacity-50"
                disabled={page >= adminsData.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateSystemAdminDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSystemAdmin}
      />
    </div>
  );
}
