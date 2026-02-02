import { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Label } from '@/components/common/Label';
import { Badge } from '@/components/common/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import {
  analyticsService,
  type ReportType,
  type ExportFormat,
  type ReportPeriod,
} from '@/services/ta/analyticsService';

// 리포트 타입 데이터
const reportTypes: { id: ReportType; name: string; description: string }[] = [
  { id: 'USERS', name: '사용자 현황', description: '등록된 사용자 목록 및 상태' },
  { id: 'COURSES', name: '강좌 현황', description: '강좌 목록 및 수강 통계' },
  { id: 'LEARNING', name: '학습 진도', description: '사용자별 학습 진행 현황' },
  { id: 'COMPLETION', name: '수료 현황', description: '강좌별 수료자 통계' },
  { id: 'ENGAGEMENT', name: '참여도 분석', description: '사용자 활동 및 참여 지표' },
];

// 기간 옵션 매핑
const periodMap: Record<string, ReportPeriod> = {
  week: 'WEEK',
  month: 'MONTH',
  quarter: 'QUARTER',
  year: 'YEAR',
  all: 'ALL',
};

// 포맷 옵션 매핑
const formatMap: Record<string, ExportFormat> = {
  xlsx: 'XLSX',
  csv: 'CSV',
  pdf: 'PDF',
};

const statusConfig = {
  COMPLETED: { label: '완료', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  PROCESSING: { label: '처리중', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  FAILED: { label: '실패', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
};

// 내보내기 이력 타입
interface ExportHistoryItem {
  id: number;
  reportType: string;
  format: string;
  period: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  createdAt: string;
}

const EXPORT_HISTORY_KEY = 'ta_export_history';

// localStorage에서 내보내기 이력 로드
const loadExportHistory = (): ExportHistoryItem[] => {
  try {
    const saved = localStorage.getItem(EXPORT_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// localStorage에 내보내기 이력 저장
const saveExportHistory = (history: ExportHistoryItem[]) => {
  try {
    localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch {
    // localStorage 저장 실패 시 무시
  }
};

export function ExportPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | ''>('');
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<ExportHistoryItem[]>(() => loadExportHistory());

  // 내보내기 이력이 변경될 때 localStorage에 저장
  useEffect(() => {
    saveExportHistory(recentExports);
  }, [recentExports]);

  const handleExport = async () => {
    if (!selectedReport) return;

    setIsExporting(true);
    setExportError(null);

    // 내보내기 시작 시 이력에 추가
    const newExport = {
      id: Date.now(),
      reportType: reportTypes.find(r => r.id === selectedReport)?.name || selectedReport,
      format: selectedFormat.toUpperCase(),
      period: selectedPeriod,
      status: 'PROCESSING' as const,
      createdAt: new Date().toLocaleString('ko-KR'),
    };
    setRecentExports(prev => [newExport, ...prev.slice(0, 9)]);

    try {
      await analyticsService.exportReport({
        reportType: selectedReport,
        format: formatMap[selectedFormat],
        period: periodMap[selectedPeriod],
      });

      // 성공 시 상태 업데이트
      setRecentExports(prev =>
        prev.map(exp =>
          exp.id === newExport.id ? { ...exp, status: 'COMPLETED' as const } : exp
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '리포트 생성에 실패했습니다.';
      setExportError(message);

      // 실패 시 상태 업데이트
      setRecentExports(prev =>
        prev.map(exp =>
          exp.id === newExport.id ? { ...exp, status: 'FAILED' as const } : exp
        )
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = async (reportType: ReportType, format: ExportFormat = 'XLSX') => {
    setIsExporting(true);
    setExportError(null);

    try {
      await analyticsService.exportReport({
        reportType,
        format,
        period: 'MONTH',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '리포트 생성에 실패했습니다.';
      setExportError(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="통계 조회 및 내보내기"
        description="분석 데이터를 다양한 형식으로 내보낼 수 있습니다"
      />

      {exportError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {exportError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Export Form */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>리포트 생성</CardTitle>
              <CardDescription>내보내기할 리포트 유형과 옵션을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type Selection */}
              <div className="space-y-2">
                <Label>리포트 유형</Label>
                <div className="grid grid-cols-2 gap-3">
                  {reportTypes.map((report) => {
                    const isSelected = selectedReport === report.id;
                    return (
                      <div
                        key={report.id}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20'
                            : 'border-border-primary hover:bg-bg-secondary hover:border-border-secondary'
                        }`}
                        onClick={() => setSelectedReport(report.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <p className={`font-medium ${isSelected ? 'text-brand-primary' : ''}`}>
                          {report.name}
                        </p>
                        <p className="text-sm text-text-secondary">{report.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>파일 형식</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>기간</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">최근 1주</SelectItem>
                      <SelectItem value="month">최근 1개월</SelectItem>
                      <SelectItem value="quarter">최근 분기</SelectItem>
                      <SelectItem value="year">최근 1년</SelectItem>
                      <SelectItem value="all">전체</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                disabled={!selectedReport || isExporting}
                className="w-full"
                onClick={handleExport}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    리포트 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export History */}
          <Card>
            <CardHeader>
              <CardTitle>내보내기 이력</CardTitle>
              <CardDescription>최근 생성한 리포트 목록입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {recentExports.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  아직 내보내기 이력이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExports.map((item) => {
                    const config = statusConfig[item.status];
                    const StatusIcon = config.icon;

                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-bg-secondary rounded-lg">
                            {item.format === 'XLSX' ? (
                              <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            ) : item.format === 'CSV' ? (
                              <FileText className="h-5 w-5 text-blue-600" />
                            ) : (
                              <FileText className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.reportType}</p>
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <span>{item.format}</span>
                              <span>-</span>
                              <span>{item.period}</span>
                              <span>-</span>
                              <span>{item.createdAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={config.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>빠른 내보내기</CardTitle>
              <CardDescription>자주 사용하는 리포트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={isExporting}
                onClick={() => handleQuickExport('LEARNING')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                이번 달 학습 현황
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={isExporting}
                onClick={() => handleQuickExport('USERS')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                전체 사용자 목록
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={isExporting}
                onClick={() => handleQuickExport('COMPLETION')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                수료 현황 요약
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>리포트 안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-text-secondary">
              <div>
                <p className="font-medium text-text-primary mb-1">사용자 현황</p>
                <p>등록된 모든 사용자의 ID, 이름, 이메일, 역할, 상태, 가입일</p>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-1">강좌 현황</p>
                <p>생성된 강좌 목록과 기본 정보</p>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-1">학습 진도</p>
                <p>사용자별 수강 현황과 진도율</p>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-1">수료 현황</p>
                <p>수료 완료된 수강 내역과 점수</p>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-1">참여도 분석</p>
                <p>사용자별 총 수강, 완료, 진행중 현황과 평균 진도율</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
