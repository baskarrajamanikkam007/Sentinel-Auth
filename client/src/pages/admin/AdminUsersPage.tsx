import { useEffect, useState, useCallback } from 'react';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table';
import { adminApi } from '@/api/admin.api';
import { formatDate } from '@/utils/device';
import { toast } from '@/hooks/useToast';
import type { UserProfile } from '@/types';

const ROLES = ['USER', 'MODERATOR', 'ADMIN'] as const;

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [lockTarget, setLockTarget] = useState<UserProfile | null>(null);
  const [lockMins, setLockMins] = useState('60');
  const [locking, setLocking] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers(page, limit);
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (id: string, role: string) => {
    setActionId(id);
    try {
      const res = await adminApi.updateRole(id, role);
      setUsers((prev) => prev.map((u) => u.id === id ? res.data.data : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
    finally { setActionId(null); }
  };

  const openLock = (user: UserProfile) => {
    setLockTarget(user);
    setLockMins('60');
  };

  const confirmLock = async () => {
    if (!lockTarget) return;
    setLocking(true);
    try {
      await adminApi.lockUser(lockTarget.id, Number(lockMins));
      setUsers((prev) => prev.map((u) => u.id === lockTarget.id ? { ...u, isActive: false } : u));
      toast.success(`${lockTarget.email} locked for ${lockMins} minutes`);
      setLockTarget(null);
    } catch { toast.error('Failed to lock user'); }
    finally { setLocking(false); }
  };

  const unlock = async (id: string) => {
    setActionId(id);
    try {
      await adminApi.unlockUser(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: true } : u));
      toast.success('User unlocked');
    } catch { toast.error('Failed to unlock user'); }
    finally { setActionId(null); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AppLayout title="Users">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-400">{total} total user{total !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No users" description="No users found." />
      ) : (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Verified</Th>
                <Th>Last login</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td>
                    <div className="font-medium text-slate-200">{u.name ?? '—'}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </Td>
                  <Td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      disabled={actionId === u.id}
                      className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Td>
                  <Td><Badge variant={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Locked'}</Badge></Td>
                  <Td><Badge variant={u.isEmailVerified ? 'green' : 'yellow'}>{u.isEmailVerified ? 'Yes' : 'No'}</Badge></Td>
                  <Td className="text-xs">{formatDate(u.lastLoginAt)}</Td>
                  <Td>
                    {u.isActive ? (
                      <Button size="sm" variant="danger" isLoading={actionId === u.id} onClick={() => openLock(u)}>
                        Lock
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" isLoading={actionId === u.id} onClick={() => unlock(u.id)}>
                        Unlock
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft size={15} />
                </Button>
                <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!lockTarget} onClose={() => setLockTarget(null)} title="Lock user">
        <p className="text-sm text-slate-400 mb-4">
          Lock <span className="text-slate-200 font-medium">{lockTarget?.email}</span> for how long?
        </p>
        <Input
          label="Duration (minutes)"
          type="number"
          min="1"
          value={lockMins}
          onChange={(e) => setLockMins(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setLockTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" isLoading={locking} onClick={confirmLock}>Lock</Button>
        </div>
      </Modal>
    </AppLayout>
  );
};
