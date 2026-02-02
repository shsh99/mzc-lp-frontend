import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Users,
  UserPlus,
  X,
  FileDown,
} from 'lucide-react';
import { designTokens } from '@/styles/admin-design-tokens';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Progress,
} from '@/components/common';
import { userService } from '@/services/ta/userService';
import type { BulkCreateUsersResponse } from '@/types/admin';

// 업로드 결과 타입
interface UploadResult {
  total: number;
  success: number;
  failed: number;
  autoLinked: number;              // 임직원 자동 연동된 개수
  errors: { row: number; email: string; error: string }[];
  preview: AccountPreview[];
}

interface AccountPreview {
  email: string;
  name: string;
  department?: string;
  role?: string;
  status: 'valid' | 'duplicate' | 'error';
  errorMessage?: string;
  employeeLinked?: boolean;        // 임직원 연동 여부
  employeeInfo?: {                 // 연동된 임직원 정보
    employeeId: string;
    department: string;
    position: string;
    rank: string;
  };
}

/**
 * TA 단체 계정 생성 페이지
 * - Excel/CSV 파일 업로드
 * - 일괄 계정 생성
 * - 오류 확인 및 수정
 */
export const BulkAccountCreationPage = () => {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // API 응답을 UploadResult 형식으로 변환
  const convertApiResponse = (response: BulkCreateUsersResponse): UploadResult => {
    const preview: AccountPreview[] = response.createdUsers.slice(0, 5).map((user) => {
      const linkedInfo = response.autoLinkedUsers?.find((linked) => linked.userId === user.id);
      return {
        email: user.email,
        name: user.name,
        status: 'valid' as const,
        employeeLinked: user.employeeLinked || false,
        employeeInfo: linkedInfo
          ? {
              employeeId: linkedInfo.employeeNumber || String(linkedInfo.employeeId),
              department: linkedInfo.department || '',
              position: linkedInfo.position || '',
              rank: linkedInfo.jobTitle || '',
            }
          : undefined,
      };
    });

    // 실패 항목도 preview에 추가
    response.failedUsers.slice(0, Math.max(0, 5 - preview.length)).forEach((failed) => {
      preview.push({
        email: failed.email,
        name: '',
        status: 'error' as const,
        errorMessage: failed.reason,
        employeeLinked: false,
      });
    });

    return {
      total: response.totalRequested,
      success: response.successCount,
      failed: response.failedCount,
      autoLinked: response.autoLinkedCount || 0,
      errors: response.failedUsers.map((failed, index) => ({
        row: index + 1,
        email: failed.email,
        error: failed.reason,
      })),
      preview,
    };
  };

  // 파일 드롭존
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    try {
      setProcessingProgress(30);

      // 실제 API 호출
      const response = await userService.fileBulkCreateUsers(file, {
        autoLinkEmployees: true,
      });

      setProcessingProgress(100);
      setUploadResult(convertApiResponse(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 업로드에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // 계정 생성 완료 확인
  const handleConfirm = () => {
    // 이미 API 호출로 계정이 생성되었으므로 결과만 알림
    toast.success(`${uploadResult?.success}개의 계정이 생성되었습니다.`);
    handleReset();
  };

  // 다시 업로드
  const handleReset = () => {
    setUploadResult(null);
    setProcessingProgress(0);
    setError(null);
  };

  // 템플릿 다운로드
  const handleDownloadTemplate = () => {
    // TODO: 실제로는 서버에서 템플릿 파일 다운로드
    toast.info('템플릿 다운로드 기능이 준비 중입니다.');
  };

  const statusColors: Record<AccountPreview['status'], 'green' | 'yellow' | 'red'> = {
    valid: 'green',
    duplicate: 'yellow',
    error: 'red',
  };

  const statusLabels: Record<AccountPreview['status'], string> = {
    valid: '정상',
    duplicate: '중복',
    error: '오류',
  };

  return (
    <div
      className="p-10 min-h-full"
      style={{ backgroundColor: designTokens.bg.app_default }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-[28px] font-semibold mb-2"
            style={{ color: designTokens.text.primary }}
          >
            단체 계정 생성
          </h1>
          <p className="text-sm" style={{ color: designTokens.text.secondary }}>
            Excel 또는 CSV 파일을 업로드하여 여러 계정을 한 번에 생성합니다.
          </p>
        </div>

        {!uploadResult ? (
          <>
            {/* 업로드 영역 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>파일 업로드</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: isDragActive ? designTokens.button.brand_default : designTokens.bg.border,
                    backgroundColor: isDragActive
                      ? `${designTokens.button.brand_default}08`
                      : designTokens.bg.secondary,
                  }}
                >
                  <input {...getInputProps()} />
                  {isProcessing ? (
                    <div className="space-y-4">
                      <FileSpreadsheet
                        className="w-16 h-16 mx-auto animate-pulse"
                        style={{ color: designTokens.button.brand_default }}
                      />
                      <p
                        className="text-lg font-medium"
                        style={{ color: designTokens.text.primary }}
                      >
                        파일 처리 중...
                      </p>
                      <div className="max-w-md mx-auto">
                        <Progress value={processingProgress} />
                        <p
                          className="text-sm mt-2"
                          style={{ color: designTokens.text.secondary }}
                        >
                          {processingProgress}%
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload
                        className="w-16 h-16 mx-auto mb-4"
                        style={{ color: designTokens.text.placeholder }}
                      />
                      <p
                        className="text-lg font-medium mb-2"
                        style={{ color: designTokens.text.primary }}
                      >
                        {isDragActive
                          ? '여기에 파일을 놓으세요'
                          : 'Excel 또는 CSV 파일을 드래그하거나 클릭하여 업로드'}
                      </p>
                      <p
                        className="text-sm mb-4"
                        style={{ color: designTokens.text.placeholder }}
                      >
                        .xlsx, .xls, .csv (최대 10MB)
                      </p>
                      <Button variant="outline">파일 선택</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 에러 메시지 */}
            {error && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div
                    className="flex items-center gap-3 p-4 rounded-lg"
                    style={{ backgroundColor: designTokens.status.error_background }}
                  >
                    <AlertCircle
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: designTokens.status.error_text }}
                    />
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: designTokens.status.error_text }}
                      >
                        파일 업로드 실패
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: designTokens.status.error_text }}
                      >
                        {error}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setError(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 템플릿 다운로드 */}
            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: designTokens.bg.secondary }}
                    >
                      <FileDown
                        className="w-6 h-6"
                        style={{ color: designTokens.button.brand_default }}
                      />
                    </div>
                    <div>
                      <p
                        className="font-medium mb-1"
                        style={{ color: designTokens.text.primary }}
                      >
                        템플릿 다운로드
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: designTokens.text.secondary }}
                      >
                        계정 생성에 필요한 양식을 다운로드하세요
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                    <Download className="w-4 h-4" />
                    템플릿 다운로드
                  </Button>
                </div>

                {/* 필수 컬럼 안내 */}
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{ backgroundColor: designTokens.bg.secondary }}
                >
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: designTokens.text.primary }}
                  >
                    필수 컬럼
                  </p>
                  <ul className="space-y-1">
                    <li className="text-sm" style={{ color: designTokens.text.secondary }}>
                      • <strong>email</strong>: 이메일 주소 (중복 불가)
                    </li>
                    <li className="text-sm" style={{ color: designTokens.text.secondary }}>
                      • <strong>name</strong>: 사용자 이름
                    </li>
                    <li className="text-sm" style={{ color: designTokens.text.secondary }}>
                      • department: 부서 (선택사항)
                    </li>
                    <li className="text-sm" style={{ color: designTokens.text.secondary }}>
                      • role: 역할 (USER, DESIGNER, INSTRUCTOR) (선택사항, 기본값: USER)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 업로드 결과 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: designTokens.text.secondary }}>
                        전체
                      </p>
                      <p
                        className="text-2xl font-semibold mt-1"
                        style={{ color: designTokens.text.primary }}
                      >
                        {uploadResult.total}
                      </p>
                    </div>
                    <Users className="w-8 h-8" style={{ color: designTokens.text.placeholder }} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: designTokens.text.secondary }}>
                        성공
                      </p>
                      <p
                        className="text-2xl font-semibold mt-1"
                        style={{ color: designTokens.status.success_text }}
                      >
                        {uploadResult.success}
                      </p>
                    </div>
                    <CheckCircle2
                      className="w-8 h-8"
                      style={{ color: designTokens.status.success_text }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: designTokens.text.secondary }}>
                        임직원 연동
                      </p>
                      <p
                        className="text-2xl font-semibold mt-1"
                        style={{ color: designTokens.badge.blue.text }}
                      >
                        {uploadResult.autoLinked}
                      </p>
                    </div>
                    <UserPlus
                      className="w-8 h-8"
                      style={{ color: designTokens.badge.blue.text }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: designTokens.text.secondary }}>
                        실패
                      </p>
                      <p
                        className="text-2xl font-semibold mt-1"
                        style={{ color: uploadResult.failed > 0 ? designTokens.status.error_text : designTokens.text.primary }}
                      >
                        {uploadResult.failed}
                      </p>
                    </div>
                    <AlertCircle
                      className="w-8 h-8"
                      style={{ color: uploadResult.failed > 0 ? designTokens.status.error_text : designTokens.text.placeholder }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 오류 목록 */}
            {uploadResult.errors.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      className="w-5 h-5"
                      style={{ color: designTokens.status.error_text }}
                    />
                    <CardTitle style={{ color: designTokens.status.error_text }}>
                      {uploadResult.errors.length}개의 오류 발견
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {uploadResult.errors.map((error, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: designTokens.status.error_background }}
                      >
                        <p
                          className="text-sm font-medium"
                          style={{ color: designTokens.status.error_text }}
                        >
                          행 {error.row}: {error.email}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: designTokens.status.error_text }}
                        >
                          {error.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 미리보기 테이블 */}
            <Card>
              <CardHeader>
                <CardTitle>데이터 미리보기 (상위 5건)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이메일</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>부서</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>임직원 연동</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadResult.preview.map((account, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <span style={{ color: designTokens.text.secondary }}>
                            {account.email}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ color: designTokens.text.primary }}>
                            {account.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          {account.department && <Badge variant="gray">{account.department}</Badge>}
                        </TableCell>
                        <TableCell>
                          <span style={{ color: designTokens.text.secondary }}>
                            {account.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          {account.employeeLinked ? (
                            <div>
                              <Badge variant="blue" className="mb-1">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                연동됨
                              </Badge>
                              {account.employeeInfo && (
                                <p className="text-xs mt-1" style={{ color: designTokens.text.secondary }}>
                                  {account.employeeInfo.rank} · {account.employeeInfo.position}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="gray">미연동</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[account.status]}>
                            {statusLabels[account.status]}
                          </Badge>
                          {account.errorMessage && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: designTokens.status.error_text }}
                            >
                              {account.errorMessage}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <X className="w-4 h-4" />
                취소
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={uploadResult.failed > 0}
                className="gap-2"
                style={{
                  backgroundColor: uploadResult.failed > 0 ? designTokens.bg.border : designTokens.button.brand_default,
                  color: designTokens.button.brand_text,
                }}
              >
                <UserPlus className="w-4 h-4" />
                {uploadResult.success}개 계정 생성
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
