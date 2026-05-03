import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { setTokens } from '@/utils/token';
import { toast } from '@/hooks/useToast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const tokens = res.data.data;
      setTokens(tokens.accessToken, tokens.refreshToken);
      const meRes = await authApi.getMe();
      login(tokens, meRes.data.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; code?: string };
      const msg = e?.response?.data?.message
        ?? (e?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Make sure it is running on port 5000.' : 'Invalid credentials');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-slate-100 mb-1">Sign in</h2>
      <p className="text-sm text-slate-400 mb-6">Enter your credentials to access your account</p>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email" required autoComplete="email"
          icon={<Mail size={15} />}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'} required
          icon={<Lock size={15} />}
          rightIcon={
            <button type="button" onClick={() => setShowPw((v) => !v)} className="text-slate-400 hover:text-slate-200 transition-colors">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};
