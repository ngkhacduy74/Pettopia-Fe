'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { getClinicShifts, upsertClinicShift, type ClinicShift } from '@/services/partner/shiftService';

export default function ClinicShift() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<ClinicShift[]>([]);

  const [form, setForm] = useState<ClinicShift>({
    shift: 'Morning',
    max_slot: 20,
    start_time: '07:30',
    end_time: '11:30',
    is_active: true,
  });

  const totalPages = useMemo(() => {
    if (!total) return 1;
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getClinicShifts(page, limit);
      setShifts(res.data || []);
      const inferredTotal = res.pagination?.total ?? (res as any).total ?? (res.data?.length || 0);
      setTotal(inferredTotal);
    } catch (e: any) {
      setError(e?.message || 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await upsertClinicShift(form);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save shift');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Clinic Shifts</h1>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700 border border-red-200">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Shift</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={form.shift}
            onChange={(e) => setForm({ ...form, shift: e.target.value })}
          >
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max slot</label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.max_slot}
            onChange={(e) => setForm({ ...form, max_slot: Number(e.target.value) })}
            min={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start time</label>
          <input
            type="time"
            className="w-full border rounded-md px-3 py-2"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End time</label>
          <input
            type="time"
            className="w-full border rounded-md px-3 py-2"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            className="h-4 w-4"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          <label htmlFor="active" className="text-sm">Active</label>
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white rounded-md px-4 py-2 hover:bg-teal-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Create / Update'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Shift</th>
              <th className="text-left p-3">Max slot</th>
              <th className="text-left p-3">Start</th>
              <th className="text-left p-3">End</th>
              <th className="text-left p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading && shifts.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>Loading...</td>
              </tr>
            ) : shifts.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>No shifts found</td>
              </tr>
            ) : (
              shifts.map((s, idx) => (
                <tr key={(s._id || s.shift) + idx} className="border-t">
                  <td className="p-3">{s.shift}</td>
                  <td className="p-3">{s.max_slot}</td>
                  <td className="p-3">{s.start_time}</td>
                  <td className="p-3">{s.end_time}</td>
                  <td className="p-3">{s.is_active ? 'Yes' : 'No'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="border rounded-md px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </button>
          <button
            className="border rounded-md px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}


