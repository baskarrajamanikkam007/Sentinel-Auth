import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '@/api/auth.api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
    } catch { /* ignore — always show success to prevent enumeration */ }
    setSent(true);
    setLoading(false);
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-slate-100 mb-1">Reset your password</h2>
      <p className="text-sm text-slate-400 mb-6">Enter your email and we'll send you a reset code</p>

      {sent ? (
        <Alert type="success">
          If that email exists, a reset code has been sent. Check your inbox and spam folder.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            icon={<Mail size={15} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Send reset code
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
