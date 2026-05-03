import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '@/api/auth.api';
import { toast } from '@/hooks/useToast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [userId, setUserId] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    try {
      const res = await authApi.register({ email: form.email, password: form.password, name: form.name || undefined });
      setUserId(res.data.data.userId);
      setStep('verify');
      toast.info('Check your email for a 6-digit verification code');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.verifyEmail({ userId, code: otp });
      toast.success('Email verified! You can now sign in.');
      navigate('/login');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid code');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      {step === 'form' ? (
        <>
          <h2 className="text-xl font-semibold text-slate-100 mb-1">Create account</h2>
          <p className="text-sm text-slate-400 mb-6">Start protecting your users today</p>
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleRegister} className="space-y-4">
            <Input label="Full name" type="text" icon={<User size={15} />}
              placeholder="Optional" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email address" type="email" required icon={<Mail size={15} />}
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Password" type="password" required icon={<Lock size={15} />}
              hint="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Input label="Confirm password" type="password" required icon={<Lock size={15} />}
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            <Button type="submit" className="w-full mt-2" size="lg" isLoading={loading}>Create account</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-slate-100 mb-1">Verify your email</h2>
          <p className="text-sm text-slate-400 mb-6">
            We sent a 6-digit code to <span className="text-slate-200 font-medium">{form.email}</span>
          </p>
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleVerify} className="space-y-4">
            <Input label="Verification code" type="text" required maxLength={6}
              placeholder="000000" className="text-center text-2xl tracking-[0.5em] font-mono"
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
            <Button type="submit" className="w-full" size="lg" isLoading={loading}>Verify email</Button>
          </form>
          <button onClick={() => setStep('form')} className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors w-full text-center">
            ← Back
          </button>
        </>
      )}
    </AuthLayout>
  );
};
