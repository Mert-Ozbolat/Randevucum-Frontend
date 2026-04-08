'use client';

import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Business {
  _id: string;
}
interface Staff {
  _id: string;
  name: string;
  title?: string;
  phone?: string;
  email?: string;
}

export default function StaffPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', phone: '', email: '' });

  useEffect(() => {
    api
      .get<{ data: Business[] }>('/business')
      .then((res) => {
        const list = res.data.data || [];
        if (list[0]) {
          setBusinessId(list[0]._id);
          return api.get<{ data: Staff[] }>(`/staff/business/${list[0]._id}`);
        }
        return null;
      })
      .then((res) => {
        if (res) setStaff(res.data.data || []);
      })
      .catch(() => setError('Yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setError('');
    try {
      const { data } = await api.post<{ data: Staff }>('/staff', { businessId, ...form });
      setStaff((s) => [...s, data.data]);
      setShowForm(false);
      setForm({ name: '', title: '', phone: '', email: '' });
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
        <h1 className="text-2xl font-bold text-neutral-900">Personel</h1>
        <Button onClick={() => setShowForm(true)}>Yeni Personel</Button>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {showForm && businessId && (
        <Card>
          <h2 className="font-semibold text-neutral-900">Yeni personel ekle</h2>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <Input label="Ad Soyad" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <Input label="Ünvan" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Input label="Telefon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <Input label="E-posta" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <div className="flex gap-2">
              <Button type="submit">Ekle</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
            </div>
          </form>
        </Card>
      )}
      <Card>
        {staff.length === 0 ? (
          <p className="text-neutral-500">Henüz personel yok.</p>
        ) : (
          <ul className="space-y-3">
            {staff.map((s) => (
              <li key={s._id} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3">
                <div>
                  <p className="font-medium text-neutral-900">{s.name}</p>
                  {s.title && <p className="text-sm text-neutral-500">{s.title}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
