import { useEffect, useState, useCallback } from 'react';
import { FileText, ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, actionBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table';
import { adminApi } from '@/api/admin.api';
import { formatDate } from '@/utils/device';
import { toast } from '@/hooks/useToast';
import type { AuditLog } from '@/types';

const MetaCell = ({ meta }: { meta: Record<string, unknown> | null }) => {
  const [open, setOpen] = useState(false);
  if (!meta || !Object.keys(meta).length) return <span className="text-slate-600">—</span>;
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
        View <ChevronDown size={12} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      {open && (
        <pre className="mt-1 text-xs bg-slate-900 rounded p-2 text-slate-300 max-w-xs overflow-auto">
          {JSON.stringify(meta, null, 2)}
        </pre>
      )}
    </div>
  );
};

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [filterInput, setFilterInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs(page, limit, userId || undefined);
      setLogs(res.data.data.logs);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  }, [page, userId]);

  useEffect(() => { load(); }, [load]);

  const applyFilter = () => {
    setPage(1);
    setUserId(filterInput.trim());
  };

  const clearFilter = () => {
    setFilterInput('');
    setPage(1);
    setUserId('');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AppLayout title="Audit Logs">
      <div className="flex items-end gap-3 mb-5">
        <div className="flex-1 max-w-sm">
          <Input
            label="Filter by user ID"
            type="text"
            placeholder="Paste a user ID…"
            icon={<Search size={15} />}
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
          />
        </div>
        <Button onClick={applyFilter} size="sm">Filter</Button>
        {userId && <Button onClick={clearFilter} size="sm" variant="ghost">Clear</Button>}
        <p className="text-sm text-slate-400 ml-auto">{total} event{total !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : logs.length === 0 ? (
        <EmptyState icon={<FileText size={28} />} title="No audit logs" description={userId ? 'No events for this user.' : 'No events recorded yet.'} />
      ) : (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>Time</Th>
                <Th>Action</Th>
                <Th>Resource</Th>
                <Th>IP</Th>
                <Th>Metadata</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => (
                <Tr key={log.id}>
                  <Td className="text-xs whitespace-nowrap">{formatDate(log.createdAt)}</Td>
                  <Td>
                    <Badge variant={actionBadge(log.action)}>{log.action}</Badge>
                  </Td>
                  <Td className="text-xs">
                    {log.resource && (
                      <span className="text-slate-300">{log.resource}</span>
                    )}
                    {log.resourceId && (
                      <span className="text-slate-500 block font-mono">{log.resourceId.slice(0, 12)}…</span>
                    )}
                    {!log.resource && !log.resourceId && <span className="text-slate-600">—</span>}
                  </Td>
                  <Td className="text-xs font-mono">{log.ip ?? '—'}</Td>
                  <Td><MetaCell meta={log.metadata} /></Td>
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
    </AppLayout>
  );
};
