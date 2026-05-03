import { useState } from 'react';
import { Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '@/api/auth.api';
import { toast } from '@/hooks/useToast';

export const ChangePasswordPage = () => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const score = strength(form.next);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.next.length < 8) { setError('New password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.changePassword({ currentPassword: form.current, newPassword: form.next });
      toast.success('Password changed successfully');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout title="Change password">
      <div className="max-w-md">
        <Card header={<span className="text-sm font-semibold text-slate-200">Update your password</span>}>
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              required
              icon={<Lock size={15} />}
              value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })}
            />
            <div>
              <Input
                label="New password"
                type="password"
                required
                icon={<Lock size={15} />}
                hint="At least 8 characters"
                value={form.next}
                onChange={(e) => setForm({ ...form, next: e.target.value })}
              />
              {form.next && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= score ? strengthColor[score] : 'bg-slate-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{strengthLabel[score]}</p>
                </div>
              )}
            </div>
            <Input
              label="Confirm new password"
              type="password"
              required
              icon={<Lock size={15} />}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
            <Button type="submit" isLoading={loading} className="w-full">
              Change password
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};
