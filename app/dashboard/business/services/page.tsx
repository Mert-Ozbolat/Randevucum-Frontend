'use client';

import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Business {
  _id: string;
}
interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  price?: number;
  currency?: string;
  description?: string;
}

export default function ServicesPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', durationMinutes: 30, price: 0 });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', durationMinutes: 30, price: 0, description: '' });

  useEffect(() => {
    api
      .get<{ data: Business[] }>('/business')
      .then((res) => {
        const list = res.data.data || [];
        if (list[0]) {
          setBusinessId(list[0]._id);
          return api.get<{ data: Service[] }>(`/services/business/${list[0]._id}`);
        }
        return null;
      })
      .then((res) => {
        if (res) setServices(res.data.data || []);
      })
      .catch(() => setError('Yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setError('');
    try {
      const { data } = await api.post<{ data: Service }>('/services', {
        businessId,
        ...form,
      });
      setServices((s) => [...s, data.data]);
      setShowForm(false);
      setForm({ name: '', durationMinutes: 30, price: 0, description: '' });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleEdit = (s: Service) => {
    setEditing(s._id);
    setEditForm({ name: s.name, durationMinutes: s.durationMinutes, price: s.price ?? 0 });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError('');
    setSaving(true);
    try {
      const { data } = await api.put<{ data: Service }>(`/services/${editing}`, editForm);
      setServices((s) => s.map((x) => (x._id === editing ? data.data : x)));
      setEditing(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/services/${id}`);
      setServices((s) => s.filter((x) => x._id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Hizmetler</h1>
        <Button onClick={() => setShowForm(true)}>Yeni Hizmet</Button>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {showForm && businessId && (
        <Card>
          <h2 className="font-semibold text-neutral-900">Yeni hizmet ekle</h2>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <Input
              label="Hizmet adı"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Süre (dakika)"
              type="number"
              min={5}
              max={480}
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
            />
            <Input
              label="Fiyat (TRY)"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            />
            <div className="flex gap-2">
              <Button type="submit">Ekle</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card>
        {services.length === 0 ? (
          <p className="text-neutral-500">Henüz hizmet yok. Yeni hizmet ekleyin.</p>
        ) : (
          <ul className="space-y-3">
            {services.map((s) => (
              <li
                key={s._id}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card"
              >
                {editing === s._id ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <Input
                      label="Hizmet adı"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                    <Input
                      label="Süre (dakika)"
                      type="number"
                      min={5}
                      max={480}
                      value={editForm.durationMinutes}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))
                      }
                    />
                    <Input
                      label="Fiyat (TRY)"
                      type="number"
                      min={0}
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, price: Number(e.target.value) }))
                      }
                    />
                    <div className="flex gap-2">
                      <Button type="submit" loading={saving}>
                        Kaydet
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditing(null)}
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-neutral-900">{s.name}</p>
                      <p className="text-sm text-neutral-500">
                        {s.durationMinutes} dk
                        {s.price != null && s.price > 0 && ` • ${s.price} TRY`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>
                        Düzenle
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(s._id)}>
                        Sil
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
