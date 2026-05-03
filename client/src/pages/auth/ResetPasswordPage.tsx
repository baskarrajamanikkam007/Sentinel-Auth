import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '@/api/auth.api';
import { toast } from '@/hooks/useToast';

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const userId = params.get('userId') ?? '';
  const [form, setForm] = useState({ code: params.get('code') ?? '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!userId) { setError('Invalid reset link — userId is missing'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword({ userId, code: form.code, newPassword: form.password });
      toast.success('Password reset successfully. Please sign in.');
      navigate('/login');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-slate-100 mb-1">Set new password</h2>
      <p className="text-sm text-slate-400 mb-6">Enter the code from your email and choose a new password</p>
      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Reset code"
          type="text"
          required
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-[0.5em] font-mono"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '') })}
        />
        <Input
          label="New password"
          type="password"
          required
          icon={<Lock size={15} />}
          hint="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Input
          label="Confirm new password"
          type="password"
          required
          icon={<Lock size={15} />}
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Reset password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
