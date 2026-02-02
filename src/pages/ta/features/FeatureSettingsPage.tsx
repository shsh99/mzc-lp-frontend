import { useEffect, useState } from 'react';
import {
  Save,
  RotateCcw,
  ToggleRight,
  MessageCircle,
  BookOpen,
  ShoppingCart,
  Heart,
  GraduationCap,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/common/Button';
import { Switch } from '@/components/common/Switch';
import { useTenantFeatures, useUpdateTenantFeatures } from '@/hooks/ta';
import type { UpdateTenantFeaturesRequest } from '@/services/ta/tenantFeaturesService';

interface FeatureItem {
  key: keyof UpdateTenantFeaturesRequest;
  label: string;
  description: string;
  icon: React.ElementType;
}

const FEATURES: FeatureItem[] = [
  {
    key: 'communityEnabled',
    label: '커뮤니티 기능',
    description: '사용자들이 커뮤니티에서 질문하고 토론할 수 있습니다',
    icon: MessageCircle,
  },
  {
    key: 'userCourseCreationEnabled',
    label: '사용자 강좌 생성',
    description: '일반 사용자가 직접 강좌를 생성할 수 있습니다',
    icon: BookOpen,
  },
  {
    key: 'cartEnabled',
    label: '장바구니 기능',
    description: '사용자가 강좌를 장바구니에 담을 수 있습니다',
    icon: ShoppingCart,
  },
  {
    key: 'wishlistEnabled',
    label: '찜하기 기능',
    description: '사용자가 강좌를 찜 목록에 추가할 수 있습니다',
    icon: Heart,
  },
  {
    key: 'instructorTabEnabled',
    label: '강사 탭 표시',
    description: '강좌 상세에서 강사 정보 탭을 표시합니다',
    icon: GraduationCap,
  },
];

export function FeatureSettingsPage() {
  const { data: features, isLoading } = useTenantFeatures();
  const updateMutation = useUpdateTenantFeatures();

  const [formData, setFormData] = useState<UpdateTenantFeaturesRequest>({
    communityEnabled: true,
    userCourseCreationEnabled: false,
    cartEnabled: true,
    wishlistEnabled: true,
    instructorTabEnabled: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (features) {
      setFormData({
        communityEnabled: features.communityEnabled,
        userCourseCreationEnabled: features.userCourseCreationEnabled,
        cartEnabled: features.cartEnabled,
        wishlistEnabled: features.wishlistEnabled,
        instructorTabEnabled: features.instructorTabEnabled,
      });
    }
  }, [features]);

  useEffect(() => {
    if (features) {
      const changed =
        formData.communityEnabled !== features.communityEnabled ||
        formData.userCourseCreationEnabled !== features.userCourseCreationEnabled ||
        formData.cartEnabled !== features.cartEnabled ||
        formData.wishlistEnabled !== features.wishlistEnabled ||
        formData.instructorTabEnabled !== features.instructorTabEnabled;
      setHasChanges(changed);
    }
  }, [formData, features]);

  const handleToggle = (key: keyof UpdateTenantFeaturesRequest, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync(formData);
  };

  const handleReset = () => {
    if (features) {
      setFormData({
        communityEnabled: features.communityEnabled,
        userCourseCreationEnabled: features.userCourseCreationEnabled,
        cartEnabled: features.cartEnabled,
        wishlistEnabled: features.wishlistEnabled,
        instructorTabEnabled: features.instructorTabEnabled,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <AdminPageHeader
        title="기능 On/Off"
        description="테넌트에서 사용할 기능을 활성화하거나 비활성화합니다"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending || !hasChanges}>
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ToggleRight className="h-5 w-5 text-brand-primary" />
            <CardTitle>기능 설정</CardTitle>
          </div>
          <CardDescription>
            각 기능의 토글 스위치를 사용하여 테넌트에서 해당 기능을 활성화하거나 비활성화할 수 있습니다.
            변경 사항은 저장 후 즉시 적용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              const isEnabled = formData[feature.key] ?? false;
              return (
                <div key={feature.key}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          isEnabled
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{feature.label}</p>
                        <p className="text-sm text-text-secondary">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleToggle(feature.key, checked)}
                    />
                  </div>
                  {index < FEATURES.length - 1 && <hr className="border-gray-100" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            변경 사항이 있습니다. 저장 버튼을 눌러 변경 사항을 적용하세요.
          </p>
        </div>
      )}
    </div>
  );
}
