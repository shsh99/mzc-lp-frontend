import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  FolderTree,
  UserPlus,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/domain/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Label } from '@/components/common/Label';
import { Textarea } from '@/components/common/Textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/Dialog';
import { Checkbox } from '@/components/common/Checkbox';
import { Avatar, AvatarFallback } from '@/components/common/Avatar';
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useUsers,
} from '@/hooks/ta';
import type { UserGroup, CreateUserGroupRequest, UpdateUserGroupRequest } from '@/types/admin';

export function GroupsPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserGroup | null>(null);
  const [managingGroup, setManagingGroup] = useState<UserGroup | null>(null);
  const [memberSearchKeyword, setMemberSearchKeyword] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  // Form state
  const [formData, setFormData] = useState<CreateUserGroupRequest>({
    name: '',
    description: '',
  });

  // API Hooks
  const { data: groupsData, isLoading } = useGroups({ keyword: searchKeyword || undefined });
  const { data: usersData } = useUsers({ search: memberSearchKeyword || undefined, size: 100 });
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();

  const groups = groupsData?.content || [];
  const totalGroups = groupsData?.totalElements || 0;
  const activeGroups = groups.filter(g => g.isActive).length;
  const totalMembers = groups.reduce((sum, g) => sum + g.memberCount, 0);

  const handleCreateOpen = () => {
    setFormData({ name: '', description: '' });
    setIsCreateOpen(true);
  };

  const handleEditOpen = (group: UserGroup) => {
    setFormData({ name: group.name, description: group.description || '' });
    setEditingGroup(group);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    await createMutation.mutateAsync(formData);
    setIsCreateOpen(false);
    setFormData({ name: '', description: '' });
  };

  const handleUpdate = async () => {
    if (!editingGroup || !formData.name.trim()) return;
    const request: UpdateUserGroupRequest = {
      name: formData.name,
      description: formData.description,
    };
    await updateMutation.mutateAsync({ id: editingGroup.id, request });
    setEditingGroup(null);
    setFormData({ name: '', description: '' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleManageMembersOpen = (group: UserGroup) => {
    setManagingGroup(group);
    setSelectedUserIds(new Set());
    setMemberSearchKeyword('');
    // TODO: 실제로는 그룹의 현재 멤버 ID를 가져와서 setSelectedUserIds에 설정
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSaveMembers = async () => {
    if (!managingGroup) return;
    // TODO: API 호출하여 그룹 멤버 업데이트
    setManagingGroup(null);
  };

  const availableUsers = usersData?.content || [];

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
        title="사용자 그룹 관리"
        description="사용자 그룹을 생성하고 관리합니다"
        actions={
          <Button onClick={handleCreateOpen}>
            <Plus className="mr-2 h-4 w-4" />
            그룹 추가
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 rounded-lg">
                <FolderTree className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGroups}</p>
                <p className="text-sm text-text-secondary">전체 그룹</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FolderTree className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeGroups}</p>
                <p className="text-sm text-text-secondary">활성 그룹</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMembers.toLocaleString()}</p>
                <p className="text-sm text-text-secondary">총 멤버 수</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Group List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>그룹 목록</CardTitle>
              <CardDescription>전체 {totalGroups}개의 그룹</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                placeholder="그룹 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                {searchKeyword ? '검색 결과가 없습니다' : '등록된 그룹이 없습니다'}
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                      <FolderTree className="h-4 w-4 text-brand-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{group.name}</p>
                        <Badge variant={group.isActive ? 'default' : 'secondary'}>
                          {group.isActive ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {group.description || '설명 없음'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{group.memberCount}명</Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageMembersOpen(group)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        멤버 관리
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOpen(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => setDeleteTarget(group)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 그룹 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>그룹 이름 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="그룹 이름을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="그룹에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>그룹 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>그룹 이름 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="그룹 이름을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="그룹에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGroup(null)}>
              취소
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>그룹 삭제</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            "{deleteTarget?.name}" 그룹을 삭제하시겠습니까?
            <br />
            <span className="text-sm text-text-secondary">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={!!managingGroup} onOpenChange={() => setManagingGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]" aria-describedby="member-management-description">
          <DialogHeader>
            <DialogTitle>멤버 관리 - {managingGroup?.name}</DialogTitle>
            <DialogDescription id="member-management-description">
              그룹에 추가할 사용자를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                placeholder="사용자 검색..."
                value={memberSearchKeyword}
                onChange={(e) => setMemberSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 선택된 멤버 수 */}
            <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
              <span className="text-sm text-text-secondary">선택된 멤버</span>
              <Badge>{selectedUserIds.size}명</Badge>
            </div>

            {/* 사용자 목록 */}
            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              {availableUsers.length === 0 ? (
                <div className="p-8 text-center text-text-secondary">
                  사용자가 없습니다
                </div>
              ) : (
                <div className="divide-y">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-bg-secondary cursor-pointer"
                      onClick={() => handleToggleUser(user.id)}
                    >
                      <Checkbox
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={() => handleToggleUser(user.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.department && (
                          <Badge variant="secondary" className="text-xs">
                            {user.department}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {user.systemRole}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManagingGroup(null)}>
              취소
            </Button>
            <Button onClick={handleSaveMembers}>
              <Users className="h-4 w-4 mr-2" />
              {selectedUserIds.size}명 저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
