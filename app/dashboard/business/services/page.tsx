'use client';

import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '@/lib/api';
import { formatServicePriceLabel } from '@/lib/servicePrice';
import { dispatchBusinessSetupRefresh } from '@/lib/businessSetupRefresh';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Business {
  _id: string;
}
interface StaffRow {
  _id: string;
  name: string;
}
interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  price?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string;
  description?: string;
  staffIds?: string[];
}

function optPositiveNum(raw: string): number | undefined {
  const t = raw.trim();
  if (t === '') return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

function buildServicePayload(
  base: { name: string; durationMinutes: number; description?: string },
  priceMinStr: string,
  priceMaxStr: string,
  staffIds: string[]
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: base.name,
    durationMinutes: base.durationMinutes,
    staffIds,
  };
  if (base.description?.trim()) payload.description = base.description.trim();
  const pMin = optPositiveNum(priceMinStr);
  const pMax = optPositiveNum(priceMaxStr);
  if (pMin !== undefined) payload.priceMin = pMin;
  if (pMax !== undefined) payload.priceMax = pMax;
  return payload;
}

export default function ServicesPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [team, setTeam] = useState<StaffRow[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    durationMinutes: 30,
    priceMin: '',
    priceMax: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    durationMinutes: 30,
    priceMin: '',
    priceMax: '',
    description: '',
  });
  const [formStaffIds, setFormStaffIds] = useState<string[]>([]);
  const [editStaffIds, setEditStaffIds] = useState<string[]>([]);

  useEffect(() => {
    api
      .get<{ data: Business[] }>('/business')
      .then((res) => {
        const list = res.data.data || [];
        if (list[0]) {
          setBusinessId(list[0]._id);
          return Promise.all([
            api.get<{ data: Service[] }>(`/services/business/${list[0]._id}`),
            api.get<{ data: StaffRow[] }>(`/staff/business/${list[0]._id}`).catch(() => ({
              data: { data: [] as StaffRow[] },
            })),
          ]);
        }
        return null;
      })
      .then((res) => {
        if (res) {
          const [svcRes, staffRes] = res;
          setServices(svcRes.data.data || []);
          setTeam(Array.isArray(staffRes.data.data) ? staffRes.data.data : []);
        }
      })
      .catch(() => setError('Yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setError('');
    try {
      const payload = {
        businessId,
        ...buildServicePayload(form, form.priceMin, form.priceMax, formStaffIds),
      };
      const { data } = await api.post<{ data: Service }>('/services', payload);
      setServices((s) => [...s, data.data]);
      setShowForm(false);
      setForm({ name: '', durationMinutes: 30, priceMin: '', priceMax: '', description: '' });
      setFormStaffIds([]);
      dispatchBusinessSetupRefresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleEdit = (s: Service) => {
    setEditing(s._id);
    const legacyMin =
      s.priceMin != null
        ? String(s.priceMin)
        : s.price != null && s.price > 0
          ? String(s.price)
          : '';
    setEditForm({
      name: s.name,
      durationMinutes: s.durationMinutes,
      priceMin: legacyMin,
      priceMax: s.priceMax != null ? String(s.priceMax) : '',
      description: s.description || '',
    });
    setEditStaffIds(Array.isArray(s.staffIds) ? [...s.staffIds] : []);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError('');
    setSaving(true);
    try {
      const payload = buildServicePayload(editForm, editForm.priceMin, editForm.priceMax, editStaffIds);
      const { data } = await api.put<{ data: Service }>(`/services/${editing}`, payload);
      setServices((s) => s.map((x) => (x._id === editing ? data.data : x)));
      setEditing(null);
      dispatchBusinessSetupRefresh();
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
      dispatchBusinessSetupRefresh();
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
          <p className="mt-1 text-sm text-neutral-600">
            Fiyat için sabit tutar yerine <strong>minimum ve/veya maksimum</strong> girebilirsiniz; işlem içeriğine göre
            değişen ücretler için uygundur.
          </p>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Fiyat — minimum (TRY)"
                type="number"
                min={0}
                step={1}
                placeholder="Örn. 500"
                value={form.priceMin}
                onChange={(e) => setForm((f) => ({ ...f, priceMin: e.target.value }))}
              />
              <Input
                label="Fiyat — maksimum (TRY)"
                type="number"
                min={0}
                step={1}
                placeholder="Örn. 1200"
                value={form.priceMax}
                onChange={(e) => setForm((f) => ({ ...f, priceMax: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
                Açıklama (isteğe bağlı)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500"
                placeholder="Ne dahil, ek ücretler vb."
              />
            </div>
            {team.length > 0 && (
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                  Bu hizmeti yapabilecek personeller
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Kimseyi seçmezseniz, personel sayfasındaki hizmet atamasına göre uygunluk belirlenir. Seçerseniz
                  yalnızca işaretlenen personel bu hizmet için randevu alır.
                </p>
                <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-600 dark:bg-neutral-900/50">
                  {team.map((m) => (
                    <li key={m._id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          checked={formStaffIds.includes(m._id)}
                          onChange={() =>
                            setFormStaffIds((prev) =>
                              prev.includes(m._id) ? prev.filter((id) => id !== m._id) : [...prev, m._id]
                            )
                          }
                        />
                        {m.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit">Ekle</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm({ name: '', durationMinutes: 30, priceMin: '', priceMax: '', description: '' });
                  setFormStaffIds([]);
                }}
              >
                Temizle
              </Button>
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
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card dark:border-neutral-700 dark:bg-neutral-900/40"
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Fiyat — minimum (TRY)"
                        type="number"
                        min={0}
                        step={1}
                        value={editForm.priceMin}
                        onChange={(e) => setEditForm((f) => ({ ...f, priceMin: e.target.value }))}
                      />
                      <Input
                        label="Fiyat — maksimum (TRY)"
                        type="number"
                        min={0}
                        step={1}
                        value={editForm.priceMax}
                        onChange={(e) => setEditForm((f) => ({ ...f, priceMax: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
                        Açıklama
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        rows={2}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500"
                      />
                    </div>
                    {team.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                          Bu hizmeti yapabilecek personeller
                        </p>
                        <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-600 dark:bg-neutral-900/50">
                          {team.map((m) => (
                            <li key={m._id}>
                              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
                                <input
                                  type="checkbox"
                                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                  checked={editStaffIds.includes(m._id)}
                                  onChange={() =>
                                    setEditStaffIds((prev) =>
                                      prev.includes(m._id)
                                        ? prev.filter((id) => id !== m._id)
                                        : [...prev, m._id]
                                    )
                                  }
                                />
                                {m.name}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button type="submit" loading={saving}>
                        Kaydet
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                        İptal
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{s.name}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {s.durationMinutes} dk
                        {(() => {
                          const label = formatServicePriceLabel(s);
                          return label ? ` · ${label}` : '';
                        })()}
                      </p>
                      {s.description?.trim() && (
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{s.description}</p>
                      )}
                      {s.staffIds && s.staffIds.length > 0 && (
                        <p className="mt-1 text-sm text-primary-700 dark:text-primary-300">
                          Personel:{' '}
                          {s.staffIds
                            .map((id) => team.find((t) => t._id === id)?.name)
                            .filter(Boolean)
                            .join(', ') || `${s.staffIds.length} kişi`}
                        </p>
                      )}
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
