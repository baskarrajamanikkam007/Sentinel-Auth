import { useEffect, useState, useCallback } from 'react';
import { MonitorSmartphone, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table';
import { sessionApi } from '@/api/session.api';
import { parseUserAgent, formatDate } from '@/utils/device';
import { toast } from '@/hooks/useToast';
import type { SessionItem } from '@/types';

export const SessionsPage = () => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sessionApi.getSessions();
      setSessions(res.data.data);
    } catch { toast.error('Failed to load sessions'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const revoke = async (id: string) => {
    setRevoking(id);
    try {
      await sessionApi.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Session revoked');
    } catch { toast.error('Failed to revoke session'); }
    finally { setRevoking(null); }
  };

  const revokeAll = async () => {
    setRevoking('all');
    try {
      await sessionApi.revokeAllSessions();
      setSessions([]);
      toast.success('All sessions revoked');
    } catch { toast.error('Failed to revoke sessions'); }
    finally { setRevoking(null); }
  };

  const active = sessions.filter((s) => !s.isRevoked);

  return (
    <AppLayout title="Sessions">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-400">{active.length} active session{active.length !== 1 ? 's' : ''}</p>
        {active.length > 0 && (
          <Button variant="danger" size="sm" isLoading={revoking === 'all'} onClick={revokeAll}>
            Revoke all
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : active.length === 0 ? (
        <EmptyState icon={<MonitorSmartphone size={28} />} title="No active sessions" description="All sessions have been revoked." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Device</Th>
              <Th>IP address</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th>Expires</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {active.map((s) => (
              <Tr key={s.id}>
                <Td>
                  <div className="font-medium text-slate-200">{parseUserAgent(s.userAgent)}</div>
                  {s.userAgent && (
                    <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{s.userAgent}</div>
                  )}
                </Td>
                <Td>{s.ip ?? '—'}</Td>
                <Td><Badge variant="green">Active</Badge></Td>
                <Td>{formatDate(s.createdAt)}</Td>
                <Td>{formatDate(s.expiresAt)}</Td>
                <Td>
                  <button
                    onClick={() => revoke(s.id)}
                    disabled={revoking === s.id}
                    className="text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Revoke session"
                  >
                    {revoking === s.id ? <Spinner size="sm" /> : <Trash2 size={15} />}
                  </button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </AppLayout>
  );
};
