import { useEffect, useState, useCallback } from 'react';
import { KeyRound, Copy, Check, Trash2, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table';
import { apiKeyApi } from '@/api/apiKey.api';
import { formatDate } from '@/utils/device';
import { toast } from '@/hooks/useToast';
import type { ApiKey, ApiKeyCreated } from '@/types';

const PERMISSIONS = ['read:profile', 'read:sessions', 'write:sessions', 'read:keys', 'write:keys'];

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} className="ml-2 text-slate-400 hover:text-slate-200 transition-colors" title="Copy">
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
};

export const ApiKeysPage = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newKey, setNewKey] = useState<ApiKeyCreated | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({ name: '', permissions: [] as string[], expiresAt: '' });
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiKeyApi.listKeys();
      setKeys(res.data.data);
    } catch { toast.error('Failed to load API keys'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ name: '', permissions: [], expiresAt: '' });
    setNewKey(null);
    setCreateError('');
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setCreateError('Key name is required'); return; }
    setCreateError(''); setCreating(true);
    try {
      const res = await apiKeyApi.createKey({
        name: form.name,
        permissions: form.permissions.length ? form.permissions : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setNewKey(res.data.data);
      setKeys((prev) => [res.data.data, ...prev]);
    } catch (err: unknown) {
      setCreateError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create key');
    } finally { setCreating(false); }
  };

  const togglePerm = (p: string) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p],
    }));

  const revoke = async (id: string) => {
    setRevoking(id);
    try {
      await apiKeyApi.revokeKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success('API key revoked');
    } catch { toast.error('Failed to revoke key'); }
    finally { setRevoking(null); }
  };

  const active = keys;

  return (
    <AppLayout title="API Keys">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-400">{active.length} active key{active.length !== 1 ? 's' : ''}</p>
        <Button onClick={openCreate} icon={<Plus size={15} />}>Create API key</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : keys.length === 0 ? (
        <EmptyState
          icon={<KeyRound size={28} />}
          title="No API keys"
          description="Create a key to access the API programmatically."
          action={<Button onClick={openCreate} icon={<Plus size={15} />}>Create API key</Button>}
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Prefix</Th>
              <Th>Permissions</Th>
              <Th>Last used</Th>
              <Th>Expires</Th>
              <Th>Status</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {keys.map((k) => (
              <Tr key={k.id}>
                <Td><span className="font-medium text-slate-200">{k.name}</span></Td>
                <Td><code className="text-xs font-mono text-slate-300">{k.prefix}…</code></Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {k.permissions.length ? k.permissions.map((p) => (
                      <Badge key={p} variant="blue">{p}</Badge>
                    )) : <span className="text-xs text-slate-500">all</span>}
                  </div>
                </Td>
                <Td>{formatDate(k.lastUsedAt)}</Td>
                <Td>{formatDate(k.expiresAt)}</Td>
                <Td><Badge variant="green">Active</Badge></Td>
                <Td>
                  {k.isActive && (
                    <button
                      onClick={() => revoke(k.id)}
                      disabled={revoking === k.id}
                      className="text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Revoke key"
                    >
                      {revoking === k.id ? <Spinner size="sm" /> : <Trash2 size={15} />}
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal isOpen={modalOpen} onClose={() => { if (!newKey) setModalOpen(false); }} title={newKey ? 'Key created' : 'Create API key'}>
        {newKey ? (
          <div className="space-y-4">
            <Alert type="warning">
              Copy this key now — it will not be shown again.
            </Alert>
            <div className="bg-slate-900 rounded-lg p-3 flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-green-300 break-all">{newKey.key}</code>
              <CopyButton text={newKey.key} />
            </div>
            <Button className="w-full" onClick={() => setModalOpen(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            {createError && <Alert type="error">{createError}</Alert>}
            <Input
              label="Key name"
              type="text"
              required
              placeholder="e.g. My integration"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Permissions</label>
              <div className="space-y-2">
                {PERMISSIONS.map((p) => (
                  <label key={p} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(p)}
                      onChange={() => togglePerm(p)}
                      className="rounded border-slate-600 bg-slate-700 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-slate-200 font-mono">{p}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">Leave all unchecked to grant full access.</p>
            </div>
            <Input
              label="Expiry date (optional)"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" isLoading={creating}>Create</Button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  );
};
