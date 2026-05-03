import { useState } from 'react';
import { User } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge, roleBadge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { userApi } from '@/api/user.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/useToast';

export const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await userApi.updateMe({ name: name || undefined });
      setUser(res.data.data);
      toast.success('Profile updated');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout title="Profile">
      <div className="max-w-lg space-y-5">
        <Card header={<span className="text-sm font-semibold text-slate-200">Account info</span>}>
          <dl className="divide-y divide-slate-700/50">
            <div className="flex py-3 gap-4">
              <dt className="w-32 text-sm text-slate-400 shrink-0">Email</dt>
              <dd className="text-sm text-slate-200">{user?.email}</dd>
            </div>
            <div className="flex py-3 gap-4">
              <dt className="w-32 text-sm text-slate-400 shrink-0">Role</dt>
              <dd>{user && <Badge variant={roleBadge(user.role)}>{user.role}</Badge>}</dd>
            </div>
            <div className="flex py-3 gap-4">
              <dt className="w-32 text-sm text-slate-400 shrink-0">Member since</dt>
              <dd className="text-sm text-slate-200">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </dd>
            </div>
            <div className="flex py-3 gap-4">
              <dt className="w-32 text-sm text-slate-400 shrink-0">Email status</dt>
              <dd>
                <Badge variant={user?.isEmailVerified ? 'green' : 'yellow'}>
                  {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card>

        <Card header={<span className="text-sm font-semibold text-slate-200">Edit profile</span>}>
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              icon={<User size={15} />}
              placeholder="Optional"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" isLoading={loading}>Save changes</Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};
