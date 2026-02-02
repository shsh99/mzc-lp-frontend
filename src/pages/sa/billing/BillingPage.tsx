import { useState } from 'react';
import {
  CreditCard,
  Download,
  Filter,
  Search,
  Building2,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { AdminPageHeader, AdminStatsCard, AdminStatsGrid, PlanBadge } from '@/components/domain/admin';
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
import { Badge } from '@/components/common/Badge';
import type { PlanType } from '@/types/admin';

// Mock 데이터
const mockBillingStats = {
  totalRevenue: 125000000,
  monthlyRevenue: 12500000,
  activeLicenses: 24,
  pendingPayments: 3,
};

const mockBillingHistory: {
  id: number;
  tenantName: string;
  tenantCode: string;
  plan: PlanType;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  billingDate: string;
  dueDate: string;
}[] = [
  { id: 1, tenantName: '메가존클라우드', tenantCode: 'mzc', plan: 'ENTERPRISE', amount: 5000000, status: 'PAID', billingDate: '2025-12-01', dueDate: '2025-12-15' },
  { id: 2, tenantName: '삼성전자', tenantCode: 'samsung', plan: 'ENTERPRISE', amount: 5000000, status: 'PAID', billingDate: '2025-12-01', dueDate: '2025-12-15' },
  { id: 3, tenantName: '네이버', tenantCode: 'naver', plan: 'PRO', amount: 1500000, status: 'PENDING', billingDate: '2025-12-01', dueDate: '2025-12-31' },
  { id: 4, tenantName: '카카오', tenantCode: 'kakao', plan: 'PRO', amount: 1500000, status: 'PAID', billingDate: '2025-12-01', dueDate: '2025-12-15' },
  { id: 5, tenantName: '라인', tenantCode: 'line', plan: 'BASIC', amount: 500000, status: 'OVERDUE', billingDate: '2025-11-01', dueDate: '2025-11-15' },
];

const billingStatusLabels = {
  PAID: '결제완료',
  PENDING: '대기중',
  OVERDUE: '연체',
};

const billingStatusColors = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

// 탭용 콘텐츠 컴포넌트 (TenantManagementPage에서 사용)
export function BillingContent() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBilling = mockBillingHistory.filter((item) => {
    const matchesSearch = item.tenantName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.tenantCode.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  return (
    <div>
      {/* 액션 버튼 */}
      <div className="flex justify-end mb-6">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          내보내기
        </Button>
      </div>

      {/* Stats */}
      <AdminStatsGrid columns={4} className="mb-6">
        <AdminStatsCard
          title="총 매출"
          value={formatCurrency(mockBillingStats.totalRevenue)}
          icon={DollarSign}
          variant="primary"
        />
        <AdminStatsCard
          title="월 매출"
          value={formatCurrency(mockBillingStats.monthlyRevenue)}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 15, label: '전월 대비' }}
        />
        <AdminStatsCard
          title="활성 라이선스"
          value={mockBillingStats.activeLicenses}
          icon={Building2}
          variant="default"
        />
        <AdminStatsCard
          title="결제 대기"
          value={mockBillingStats.pendingPayments}
          icon={CreditCard}
          variant="warning"
        />
      </AdminStatsGrid>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>결제 내역</CardTitle>
              <CardDescription>테넌트별 결제 현황을 확인합니다</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="테넌트 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="PAID">결제완료</SelectItem>
                  <SelectItem value="PENDING">대기중</SelectItem>
                  <SelectItem value="OVERDUE">연체</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">테넌트</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">플랜</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">금액</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">결제일</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">만료일</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">상태</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredBilling.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0 hover:bg-bg-secondary">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{item.tenantName}</p>
                        <p className="text-sm text-text-secondary">{item.tenantCode}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <PlanBadge plan={item.plan} />
                    </td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(item.amount)}</td>
                    <td className="py-3 px-4 text-text-secondary">{item.billingDate}</td>
                    <td className="py-3 px-4 text-text-secondary">{item.dueDate}</td>
                    <td className="py-3 px-4">
                      <Badge className={billingStatusColors[item.status]}>
                        {billingStatusLabels[item.status]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">상세</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 기존 BillingPage - 호환성 유지용 (독립 페이지로 사용 시)
export function BillingPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="구독 관리"
        description="테넌트 구독 및 결제 현황을 관리합니다"
      />
      <div className="mt-6">
        <BillingContent />
      </div>
    </div>
  );
}
