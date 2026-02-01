/**
 * Analytics Mock Data
 * 데이터 및 통계 페이지를 위한 다양한 mock 데이터
 */

import type {
  ActivityType,
  ActivityLogResponse,
  ActivityStatsResponse,
  DailyActivityCount,
  HourlyActivityCount
} from '@/services/ta/analyticsService';

// 활동 유형별 라벨
const activityTypeLabels: Record<ActivityType, string> = {
  LOGIN: '로그인',
  LOGOUT: '로그아웃',
  LOGIN_FAILED: '로그인 실패',
  PASSWORD_CHANGE: '비밀번호 변경',
  USER_CREATE: '사용자 생성',
  USER_UPDATE: '사용자 수정',
  USER_DELETE: '사용자 삭제',
  ROLE_CHANGE: '역할 변경',
  COURSE_VIEW: '강좌 조회',
  COURSE_CREATE: '강좌 생성',
  COURSE_UPDATE: '강좌 수정',
  COURSE_DELETE: '강좌 삭제',
  PROGRAM_CREATE: '프로그램 생성',
  PROGRAM_UPDATE: '프로그램 수정',
  PROGRAM_APPROVE: '프로그램 승인',
  PROGRAM_REJECT: '프로그램 반려',
  ENROLLMENT_CREATE: '수강 신청',
  ENROLLMENT_COMPLETE: '수강 완료',
  ENROLLMENT_DROP: '수강 취소',
  CONTENT_VIEW: '콘텐츠 조회',
  CONTENT_COMPLETE: '콘텐츠 완료',
  SETTINGS_UPDATE: '설정 변경',
  TENANT_CREATE: '테넌트 생성',
  TENANT_UPDATE: '테넌트 수정',
  OTHER: '기타',
};

// 활동 유형별 설명 템플릿
const getActivityDescription = (type: ActivityType, userName: string, targetName?: string): string => {
  const descriptions: Record<ActivityType, string> = {
    LOGIN: `${userName}님이 시스템에 로그인했습니다.`,
    LOGOUT: `${userName}님이 시스템에서 로그아웃했습니다.`,
    LOGIN_FAILED: `${userName}님의 로그인 시도가 실패했습니다.`,
    PASSWORD_CHANGE: `${userName}님이 비밀번호를 변경했습니다.`,
    USER_CREATE: `${userName}님이 새 사용자를 생성했습니다.`,
    USER_UPDATE: `${userName}님이 사용자 정보를 수정했습니다.`,
    USER_DELETE: `${userName}님이 사용자를 삭제했습니다.`,
    ROLE_CHANGE: `${userName}님의 역할이 변경되었습니다.`,
    COURSE_VIEW: `${userName}님이 ${targetName || '강좌'}를 조회했습니다.`,
    COURSE_CREATE: `${userName}님이 새 강좌를 생성했습니다.`,
    COURSE_UPDATE: `${userName}님이 ${targetName || '강좌'}를 수정했습니다.`,
    COURSE_DELETE: `${userName}님이 강좌를 삭제했습니다.`,
    PROGRAM_CREATE: `${userName}님이 새 프로그램을 생성했습니다.`,
    PROGRAM_UPDATE: `${userName}님이 ${targetName || '프로그램'}을 수정했습니다.`,
    PROGRAM_APPROVE: `${userName}님이 ${targetName || '프로그램'}을 승인했습니다.`,
    PROGRAM_REJECT: `${userName}님이 ${targetName || '프로그램'}을 반려했습니다.`,
    ENROLLMENT_CREATE: `${userName}님이 ${targetName || '강좌'}에 수강 신청했습니다.`,
    ENROLLMENT_COMPLETE: `${userName}님이 ${targetName || '강좌'}를 수료했습니다.`,
    ENROLLMENT_DROP: `${userName}님이 ${targetName || '강좌'} 수강을 취소했습니다.`,
    CONTENT_VIEW: `${userName}님이 ${targetName || '콘텐츠'}를 시청했습니다.`,
    CONTENT_COMPLETE: `${userName}님이 ${targetName || '콘텐츠'} 시청을 완료했습니다.`,
    SETTINGS_UPDATE: `${userName}님이 시스템 설정을 변경했습니다.`,
    TENANT_CREATE: `새 테넌트가 생성되었습니다.`,
    TENANT_UPDATE: `테넌트 정보가 수정되었습니다.`,
    OTHER: `${userName}님이 기타 활동을 수행했습니다.`,
  };
  return descriptions[type];
};

// 사용자 목록 (활동 로그용) - users.ts의 MZC 아카데미 사용자와 일치
const mockUsers = [
  { id: 2, name: '김테넌트', email: 'ta-mzc@demo.com' },
  { id: 3, name: '이운영', email: 'operator-mzc@demo.com' },
  { id: 4, name: '박강사', email: 'instructor-mzc@demo.com' },
  { id: 5, name: '최설계', email: 'designer-mzc@demo.com' },
  { id: 10, name: '정학습', email: 'user-mzc@demo.com' },
  { id: 15, name: '김개발', email: 'user2-mzc@demo.com' },
  { id: 16, name: '이학습', email: 'user3-mzc@demo.com' },
  { id: 18, name: '최운영', email: 'operator2-mzc@demo.com' },
  { id: 19, name: '한강사', email: 'instructor2-mzc@demo.com' },
  { id: 30, name: '윤경영', email: 'admin1-mzc@demo.com' },
  { id: 31, name: '장총무', email: 'admin2-mzc@demo.com' },
  { id: 32, name: '서운영', email: 'ops1-mzc@demo.com' },
  { id: 33, name: '오관리', email: 'ops2-mzc@demo.com' },
  { id: 34, name: '조콘텐츠', email: 'dev1-mzc@demo.com' },
  { id: 35, name: '배강사', email: 'instructor3-mzc@demo.com' },
  { id: 36, name: '송개발', email: 'dev2-mzc@demo.com' },
  { id: 37, name: '임프론트', email: 'dev3-mzc@demo.com' },
  { id: 38, name: '권백엔드', email: 'dev4-mzc@demo.com' },
  { id: 39, name: '남마케터', email: 'mkt1-mzc@demo.com' },
  { id: 40, name: '문홍보', email: 'mkt2-mzc@demo.com' },
];

// 강좌 목록 (타겟용)
const mockCourses = [
  { id: 1, name: 'AWS Solutions Architect 자격증 준비' },
  { id: 2, name: 'Kubernetes 기초부터 실전까지' },
  { id: 3, name: 'Azure 클라우드 입문' },
  { id: 4, name: 'GCP 데이터 엔지니어링' },
  { id: 5, name: 'DevOps 파이프라인 구축' },
  { id: 6, name: '클라우드 보안 실무' },
  { id: 7, name: 'Terraform으로 배우는 IaC' },
  { id: 8, name: 'Docker & 컨테이너 기초' },
  { id: 9, name: 'MSA 아키텍처 설계' },
  { id: 10, name: 'AI/ML on Cloud' },
];

// 콘텐츠 목록 (타겟용)
const mockContents = [
  { id: 1, name: 'EC2 인스턴스 생성하기' },
  { id: 2, name: 'VPC 네트워크 구성' },
  { id: 3, name: 'IAM 권한 관리' },
  { id: 4, name: 'S3 버킷 정책 설정' },
  { id: 5, name: 'Lambda 함수 배포' },
  { id: 6, name: 'RDS 데이터베이스 설정' },
  { id: 7, name: 'EKS 클러스터 생성' },
  { id: 8, name: 'CloudWatch 모니터링' },
  { id: 9, name: 'Route 53 DNS 설정' },
  { id: 10, name: 'CloudFront CDN 구성' },
];

// IP 주소 목록
const ipAddresses = [
  '192.168.1.100',
  '192.168.1.101',
  '192.168.1.102',
  '10.0.0.50',
  '10.0.0.51',
  '172.16.0.10',
  '172.16.0.11',
  '203.252.123.45',
  '211.234.56.78',
  '118.222.33.44',
];

// 날짜 생성 유틸
const getRandomDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return date.toISOString();
};

const getRecentDate = (minutesAgo: number): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
};

// 활동 유형 가중치 (빈도 반영)
const activityTypeWeights: { type: ActivityType; weight: number }[] = [
  { type: 'LOGIN', weight: 25 },
  { type: 'LOGOUT', weight: 20 },
  { type: 'COURSE_VIEW', weight: 18 },
  { type: 'CONTENT_VIEW', weight: 15 },
  { type: 'CONTENT_COMPLETE', weight: 8 },
  { type: 'ENROLLMENT_CREATE', weight: 5 },
  { type: 'ENROLLMENT_COMPLETE', weight: 3 },
  { type: 'USER_UPDATE', weight: 2 },
  { type: 'PASSWORD_CHANGE', weight: 1 },
  { type: 'LOGIN_FAILED', weight: 1 },
  { type: 'COURSE_CREATE', weight: 0.5 },
  { type: 'COURSE_UPDATE', weight: 0.5 },
  { type: 'PROGRAM_CREATE', weight: 0.3 },
  { type: 'PROGRAM_APPROVE', weight: 0.2 },
  { type: 'SETTINGS_UPDATE', weight: 0.1 },
  { type: 'USER_CREATE', weight: 0.1 },
  { type: 'ROLE_CHANGE', weight: 0.1 },
];

// 가중치 기반 랜덤 활동 유형 선택
const getRandomActivityType = (): ActivityType => {
  const totalWeight = activityTypeWeights.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of activityTypeWeights) {
    random -= item.weight;
    if (random <= 0) return item.type;
  }
  return 'LOGIN';
};

// 타겟 정보 생성
const getTargetInfo = (type: ActivityType): { targetType: string | null; targetId: number | null; targetName: string | null } => {
  const courseTypes: ActivityType[] = ['COURSE_VIEW', 'COURSE_CREATE', 'COURSE_UPDATE', 'COURSE_DELETE', 'ENROLLMENT_CREATE', 'ENROLLMENT_COMPLETE', 'ENROLLMENT_DROP'];
  const contentTypes: ActivityType[] = ['CONTENT_VIEW', 'CONTENT_COMPLETE'];
  const programTypes: ActivityType[] = ['PROGRAM_CREATE', 'PROGRAM_UPDATE', 'PROGRAM_APPROVE', 'PROGRAM_REJECT'];

  if (courseTypes.includes(type)) {
    const course = mockCourses[Math.floor(Math.random() * mockCourses.length)];
    return { targetType: 'COURSE', targetId: course.id, targetName: course.name };
  }
  if (contentTypes.includes(type)) {
    const content = mockContents[Math.floor(Math.random() * mockContents.length)];
    return { targetType: 'CONTENT', targetId: content.id, targetName: content.name };
  }
  if (programTypes.includes(type)) {
    const course = mockCourses[Math.floor(Math.random() * mockCourses.length)];
    return { targetType: 'PROGRAM', targetId: course.id, targetName: course.name };
  }
  return { targetType: null, targetId: null, targetName: null };
};

// ============================================
// 활동 로그 생성
// ============================================

const generateActivityLog = (id: number, daysAgo: number = 30): ActivityLogResponse => {
  const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const activityType = getRandomActivityType();
  const target = getTargetInfo(activityType);

  return {
    id,
    tenantId: 1,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    activityType,
    activityTypeLabel: activityTypeLabels[activityType],
    description: getActivityDescription(activityType, user.name, target.targetName || undefined),
    targetType: target.targetType,
    targetId: target.targetId,
    targetName: target.targetName,
    ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
    createdAt: getRandomDate(daysAgo),
  };
};

// 최근 활동 생성 (1시간 이내)
const generateRecentActivity = (id: number, minutesAgo: number): ActivityLogResponse => {
  const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const activityType = getRandomActivityType();
  const target = getTargetInfo(activityType);

  return {
    id,
    tenantId: 1,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    activityType,
    activityTypeLabel: activityTypeLabels[activityType],
    description: getActivityDescription(activityType, user.name, target.targetName || undefined),
    targetType: target.targetType,
    targetId: target.targetId,
    targetName: target.targetName,
    ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
    createdAt: getRecentDate(minutesAgo),
  };
};

// ============================================
// 활동 로그 목록 (200개)
// ============================================

export const mockActivityLogs: ActivityLogResponse[] = Array.from({ length: 200 }, (_, i) =>
  generateActivityLog(i + 1, 30)
).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// ============================================
// 최근 활동 목록 (20개, 최근 2시간 이내)
// ============================================

export const mockRecentActivities: ActivityLogResponse[] = Array.from({ length: 20 }, (_, i) =>
  generateRecentActivity(1000 + i, Math.floor(Math.random() * 120))
).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// ============================================
// 일별 활동 트렌드 (30일)
// ============================================

const generateDailyTrend = (days: number): DailyActivityCount[] => {
  const trend: DailyActivityCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // 주말은 활동이 적음
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseCount = isWeekend ? 30 : 80;
    const variance = Math.floor(Math.random() * 40) - 20;

    trend.push({
      date: date.toISOString().split('T')[0],
      count: Math.max(10, baseCount + variance),
    });
  }
  return trend;
};

// ============================================
// 시간대별 활동 트렌드 (24시간)
// ============================================

const generateHourlyTrend = (): HourlyActivityCount[] => {
  const trend: HourlyActivityCount[] = [];
  for (let hour = 0; hour < 24; hour++) {
    // 업무 시간(9-18시) 활동이 많음
    let baseCount: number;
    if (hour >= 9 && hour <= 18) {
      baseCount = 40 + Math.floor(Math.random() * 20);
    } else if (hour >= 6 && hour <= 22) {
      baseCount = 15 + Math.floor(Math.random() * 15);
    } else {
      baseCount = 2 + Math.floor(Math.random() * 5);
    }

    trend.push({ hour, count: baseCount });
  }
  return trend;
};

// 오늘 활동 필터링
const getTodayLogs = (logs: ActivityLogResponse[]): ActivityLogResponse[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return logs.filter(log => new Date(log.createdAt) >= today);
};

// ============================================
// 활동 통계 (30일 기준)
// ============================================

export const mockActivityStats: ActivityStatsResponse = {
  totalActivities: mockActivityLogs.length,
  todayActivities: getTodayLogs(mockActivityLogs).length + 45, // 오늘 활동 추가
  activeUsers: 28,
  byActivityType: {
    LOGIN: 156,
    LOGOUT: 142,
    COURSE_VIEW: 234,
    CONTENT_VIEW: 412,
    CONTENT_COMPLETE: 89,
    ENROLLMENT_CREATE: 45,
    ENROLLMENT_COMPLETE: 23,
    USER_UPDATE: 12,
    PASSWORD_CHANGE: 8,
    LOGIN_FAILED: 5,
    COURSE_CREATE: 3,
    COURSE_UPDATE: 7,
    PROGRAM_CREATE: 2,
    PROGRAM_APPROVE: 4,
    SETTINGS_UPDATE: 2,
  },
  dailyTrend: generateDailyTrend(30),
  hourlyTrend: generateHourlyTrend(),
};

// ============================================
// 1일 기준 활동 통계 (실시간 현황용)
// ============================================

export const mockTodayActivityStats: ActivityStatsResponse = {
  totalActivities: 187,
  todayActivities: 187,
  activeUsers: 42,
  byActivityType: {
    LOGIN: 38,
    LOGOUT: 31,
    COURSE_VIEW: 45,
    CONTENT_VIEW: 52,
    CONTENT_COMPLETE: 12,
    ENROLLMENT_CREATE: 5,
    ENROLLMENT_COMPLETE: 2,
    USER_UPDATE: 1,
    PASSWORD_CHANGE: 1,
  },
  dailyTrend: generateDailyTrend(1),
  hourlyTrend: generateHourlyTrend(),
};

// ============================================
// 기간별 활동 통계
// ============================================

export const mockActivityStatsByDays: Record<number, ActivityStatsResponse> = {
  1: mockTodayActivityStats,
  7: {
    totalActivities: 892,
    todayActivities: 187,
    activeUsers: 67,
    byActivityType: {
      LOGIN: 245,
      LOGOUT: 220,
      COURSE_VIEW: 178,
      CONTENT_VIEW: 156,
      CONTENT_COMPLETE: 45,
      ENROLLMENT_CREATE: 28,
      ENROLLMENT_COMPLETE: 12,
      USER_UPDATE: 5,
      PASSWORD_CHANGE: 3,
    },
    dailyTrend: generateDailyTrend(7),
    hourlyTrend: generateHourlyTrend(),
  },
  30: mockActivityStats,
};

// ============================================
// 특정 사용자별 활동 로그 필터 함수
// ============================================

export const filterLogsByUser = (userId: number): ActivityLogResponse[] => {
  return mockActivityLogs.filter(log => log.userId === userId);
};

// ============================================
// 활동 유형별 필터 함수
// ============================================

export const filterLogsByType = (type: ActivityType): ActivityLogResponse[] => {
  return mockActivityLogs.filter(log => log.activityType === type);
};

// ============================================
// 기간별 필터 함수
// ============================================

export const filterLogsByDateRange = (startDate: string, endDate: string): ActivityLogResponse[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return mockActivityLogs.filter(log => {
    const logDate = new Date(log.createdAt);
    return logDate >= start && logDate <= end;
  });
};

// ============================================
// 검색 필터 함수 (복합 필터링)
// ============================================

export const searchActivityLogs = (params: {
  userId?: number;
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}): ActivityLogResponse[] => {
  let result = [...mockActivityLogs];

  if (params.userId) {
    result = result.filter(log => log.userId === params.userId);
  }

  if (params.type) {
    result = result.filter(log => log.activityType === params.type);
  }

  if (params.startDate) {
    const start = new Date(params.startDate);
    result = result.filter(log => new Date(log.createdAt) >= start);
  }

  if (params.endDate) {
    const end = new Date(params.endDate);
    result = result.filter(log => new Date(log.createdAt) <= end);
  }

  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    result = result.filter(log =>
      log.description?.toLowerCase().includes(keyword) ||
      log.userName?.toLowerCase().includes(keyword) ||
      log.activityTypeLabel?.toLowerCase().includes(keyword) ||
      log.targetName?.toLowerCase().includes(keyword)
    );
  }

  return result;
};
