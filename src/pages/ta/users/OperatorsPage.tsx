import { useState, useMemo } from 'react';
import {
  UserCog,
  Plus,
  Search,
  MoreVertical,
  Mail,
  Loader2,
  Shield,
} from 'lucide-react';
import { designTokens } from '@/styles/admin-design-tokens';
import { AdminPageHeader, StatusBadge } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/Avatar';
import { useUsers } from '@/hooks/ta';
import type { SystemRole } from '@/types/admin';

const roleLabels: Record<SystemRole, string> = {
  SYSTEM_ADMIN: '시스템 관리자',
  TENANT_ADMIN: '테넌트 관리자',
  OPERATOR: '운영자',
  DESIGNER: '강의 개설자',
  INSTRUCTOR: '강사',
  USER: '일반 사용자',
};

const roleColorStyles: Record<SystemRole, { bg: string; text: string }> = {
  SYSTEM_ADMIN: { bg: designTokens.badge.purple.bg, text: designTokens.badge.purple.text },
  TENANT_ADMIN: { bg: designTokens.badge.blue.bg, text: designTokens.badge.blue.text },
  OPERATOR: { bg: designTokens.badge.green.bg, text: designTokens.badge.green.text },
  DESIGNER: { bg: designTokens.badge.orange.bg, text: designTokens.badge.orange.text },
  INSTRUCTOR: { bg: designTokens.badge.green.bg, text: designTokens.badge.green.text },
  USER: { bg: designTokens.badge.gray.bg, text: designTokens.badge.gray.text },
};

export function OperatorsPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // TENANT_ADMIN 사용자 조회
  const { data: tenantAdmins, isLoading: isLoadingTA } = useUsers({
    systemRole: 'TENANT_ADMIN',
    search: searchKeyword || undefined,
    size: 100,
  });

  // OPERATOR 사용자 조회
  const { data: operators, isLoading: isLoadingOp } = useUsers({
    systemRole: 'OPERATOR',
    search: searchKeyword || undefined,
    size: 100,
  });

  const isLoading = isLoadingTA || isLoadingOp;

  // 두 결과를 합침
  const allOperators = useMemo(() => {
    const taUsers = tenantAdmins?.content ?? [];
    const opUsers = operators?.content ?? [];
    return [...taUsers, ...opUsers];
  }, [tenantAdmins, operators]);

  // 역할 필터 적용
  const filteredOperators = useMemo(() => {
    if (roleFilter === 'all') return allOperators;
    return allOperators.filter(op => op.systemRole === roleFilter);
  }, [allOperators, roleFilter]);

  // 역할별 카운트
  const roleCounts = useMemo(() => {
    return {
      total: allOperators.length,
      TENANT_ADMIN: allOperators.filter(o => o.systemRole === 'TENANT_ADMIN').length,
      OPERATOR: allOperators.filter(o => o.systemRole === 'OPERATOR').length,
    };
  }, [allOperators]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="운영자 관리"
        description="테넌트 운영자를 관리합니다"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
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
                <p className="text-2xl font-bold">{roleCounts.total}</p>
                <p className="text-sm text-text-secondary">전체 운영자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleCounts.TENANT_ADMIN}</p>
                <p className="text-sm text-text-secondary">테넌트 관리자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCog className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleCounts.OPERATOR}</p>
                <p className="text-sm text-text-secondary">운영자</p>
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
              <CardDescription>테넌트에 등록된 운영자를 관리합니다</CardDescription>
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
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 역할</SelectItem>
                  <SelectItem value="TENANT_ADMIN">테넌트 관리자</SelectItem>
                  <SelectItem value="OPERATOR">운영자</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOperators.length > 0 ? (
            <div className="space-y-3">
              {filteredOperators.map((operator) => (
                <div key={operator.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-bg-secondary transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={operator.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${operator.name}`} />
                      <AvatarFallback>{operator.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{operator.name}</p>
                        <span
                          className="px-2 py-0.5 text-xs rounded"
                          style={{ backgroundColor: roleColorStyles[operator.systemRole].bg, color: roleColorStyles[operator.systemRole].text }}
                        >
                          {roleLabels[operator.systemRole]}
                        </span>
                        <StatusBadge status={operator.status} />
                      </div>
                      {operator.organizationName && (
                        <p className="text-sm text-text-secondary">{operator.organizationName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-text-secondary">
                        <Mail className="h-3 w-3" />
                        {operator.email}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-text-secondary">최근 로그인</p>
                      <p>{operator.lastLoginAt ? new Date(operator.lastLoginAt).toLocaleDateString('ko-KR') : '-'}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary">
              {searchKeyword ? '검색 결과가 없습니다.' : '등록된 운영자가 없습니다.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
