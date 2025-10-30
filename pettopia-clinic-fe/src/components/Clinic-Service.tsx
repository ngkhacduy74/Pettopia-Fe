'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { getClinicServices, createClinicService, updateClinicService } from '../services/partner/clinicService';

interface Service {
  _id?: string;
  id?: string;
  clinic_id?: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  is_active: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: Service[];
}

// Xóa bỏ các hàm getServices và upsertService cục bộ vì đã có trong service file

export default function ClinicService() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Service>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
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
      const res = await getClinicServices(page, limit);
      setServices(res.data || []);
      const inferredTotal = res.pagination?.total ?? (res as any).total ?? (res.data?.length || 0);
      setTotal(inferredTotal);
    } catch (e: any) {
      setError(e?.message || 'Failed to load services');
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
    if (!form.name.trim()) {
      setError('Service name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingId && form.id) {
        await updateClinicService(form.id, form);
      } else {
        await createClinicService(form);
      }
      await load();
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      is_active: true,
    });
    setEditingId(null);
  }

  function editService(service: Service) {
    setForm({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      is_active: service.is_active,
    });
    setEditingId(service.id || service._id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Manage Clinic Services</h1>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700 border border-red-200">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-red-900 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 bg-white border rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Service Name *</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Khám tổng quát"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the service..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (VND) *</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              min={0}
              step={1000}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              min={5}
              step={5}
              required
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="active"
              type="checkbox"
              className="h-4 w-4"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-teal-600 text-white rounded-md px-4 py-2 hover:bg-teal-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
          </button>
          {editingId && (
            <button
              type="button"
              className="bg-gray-500 text-white rounded-md px-4 py-2 hover:bg-gray-600"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium">Service Name</th>
              <th className="text-left p-3 font-medium">Description</th>
              <th className="text-right p-3 font-medium">Price</th>
              <th className="text-center p-3 font-medium">Duration</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-center p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && services.length === 0 ? (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={6}>Loading...</td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={6}>No services found</td>
              </tr>
            ) : (
              services.map((s, idx) => (
                <tr 
                  key={s._id || s.id || idx} 
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-gray-600 max-w-xs truncate">{s.description}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(s.price)}</td>
                  <td className="p-3 text-center">{s.duration} min</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      s.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className="text-teal-600 hover:text-teal-800 font-medium"
                      onClick={() => editService(s)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages} ({total} total services)
        </span>
        <div className="flex gap-2">
          <button
            className="border rounded-md px-3 py-1 disabled:opacity-50 hover:bg-gray-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </button>
          <button
            className="border rounded-md px-3 py-1 disabled:opacity-50 hover:bg-gray-50"
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