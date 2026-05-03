import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '@/api/auth.api';
import { toast } from '@/hooks/useToast';

export const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const userId = params.get('userId') ?? '';
  const [otp, setOtp] = useState(params.get('code') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) { setError('Invalid verification link — userId is missing'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.verifyEmail({ userId, code: otp });
      toast.success('Email verified! You can now sign in.');
      navigate('/login');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid or expired code');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-slate-100 mb-1">Verify your email</h2>
      <p className="text-sm text-slate-400 mb-6">Enter the 6-digit code we sent to your email address</p>
      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Verification code"
          type="text"
          required
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-[0.5em] font-mono"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        />
        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Verify email
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already verified?{' '}
        <a href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</a>
      </p>
    </AuthLayout>
  );
};
