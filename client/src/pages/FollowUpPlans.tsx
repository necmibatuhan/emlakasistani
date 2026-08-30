import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const api = import.meta.env.PROD ? '' : 'http://localhost:5001';
const blankStep = { delay_minutes: 1440, action_type: 'whatsapp_draft', action_params: {} };
const labels = { whatsapp_draft: 'WhatsApp taslağı hazırla', reminder: 'Danışmana hatırlat', score_adjust: 'Lead skorunu değiştir' };

export default function FollowUpPlans() {
  const { token } = useContext(AuthContext);
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', steps: [{ ...blankStep }] });
  const { data: plans = [] } = useQuery({ queryKey: ['follow-up-plans'], queryFn: () => axios.get(`${api}/api/follow-up-plans`, { headers }).then(r => r.data) });
  const save = useMutation({ mutationFn: payload => editingId ? axios.put(`${api}/api/follow-up-plans/${editingId}`, payload, { headers }) : axios.post(`${api}/api/follow-up-plans`, payload, { headers }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['follow-up-plans'] }); setEditingId(null); setForm({ name: '', description: '', steps: [{ ...blankStep }] }); } });
  const edit = plan => { setEditingId(plan.id); setForm({ name: plan.name, description: plan.description || '', steps: plan.steps.map(s => ({ delay_minutes: s.delay_minutes, action_type: s.action_type, action_params: s.action_params || {} })) }); };
  const updateStep = (index, key, value) => setForm(f => ({ ...f, steps: f.steps.map((s, i) => i === index ? { ...s, [key]: value } : s) }));

  return <div className="flex min-h-screen bg-[#0A0B0D]"><Sidebar/><main className="lg:ml-[240px] flex-1"><Header/><div className="max-w-6xl mx-auto p-4 md:p-8">
    <div className="mb-8"><h1 className="text-2xl font-bold text-[#F1F2F4]">Takip planları</h1><p className="text-[#7C8090] mt-1">Lead’lerin zamanında takip edilmesini sağlayan, insan onaylı otomasyonlar.</p></div>
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
      <section className="space-y-3">{plans.map(plan => <button key={plan.id} onClick={() => edit(plan)} className="w-full text-left bg-[#16181D] border border-[#2A2D35] hover:border-[#F5A623] rounded-xl p-4"><div className="flex justify-between"><strong className="text-[#F1F2F4]">{plan.name}</strong><span className="text-xs text-[#F5A623]">{plan.steps.length} adım</span></div><p className="text-sm text-[#7C8090] mt-2">{plan.description || 'Açıklama yok'}</p></button>)}{!plans.length && <p className="text-[#7C8090]">Henüz şablon yok. İlk planınızı oluşturun.</p>}</section>
      <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="bg-[#16181D] border border-[#2A2D35] rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[#F1F2F4]">{editingId ? 'Planı düzenle' : 'Yeni plan şablonu'}</h2>
        <input required aria-label="Plan adı" placeholder="Örn. Yeni lead – 7 günlük takip" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-lg p-3 text-[#F1F2F4]"/>
        <textarea aria-label="Plan açıklaması" placeholder="Planın amacı" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-lg p-3 text-[#F1F2F4]"/>
        <div className="space-y-3">{form.steps.map((step, index) => <div key={index} className="bg-[#0A0B0D] border border-[#2A2D35] rounded-lg p-3"><div className="text-xs text-[#7C8090] mb-2">ADIM {index + 1}</div><div className="grid sm:grid-cols-[120px_1fr_auto] gap-2"><label className="text-xs text-[#7C8090]">Gecikme (gün)<input type="number" min="0" step="0.25" value={step.delay_minutes / 1440} onChange={e => updateStep(index, 'delay_minutes', Math.round(Number(e.target.value) * 1440))} className="mt-1 w-full bg-[#16181D] border border-[#2A2D35] rounded p-2 text-[#F1F2F4]"/></label><label className="text-xs text-[#7C8090]">Aksiyon<select value={step.action_type} onChange={e => updateStep(index, 'action_type', e.target.value)} className="mt-1 w-full bg-[#16181D] border border-[#2A2D35] rounded p-2 text-[#F1F2F4]">{Object.entries(labels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>{form.steps.length > 1 && <button type="button" aria-label="Adımı sil" onClick={() => setForm(f => ({ ...f, steps: f.steps.filter((_, i) => i !== index) }))} className="self-end p-2 text-red-400">Sil</button>}</div>{step.action_type === 'reminder' && <input placeholder="Hatırlatma metni" value={step.action_params.message || ''} onChange={e => updateStep(index, 'action_params', { message: e.target.value })} className="mt-2 w-full bg-[#16181D] border border-[#2A2D35] rounded p-2 text-[#F1F2F4]"/>}{step.action_type === 'score_adjust' && <input type="number" min="-9" max="9" value={step.action_params.delta ?? -1} onChange={e => updateStep(index, 'action_params', { delta: Number(e.target.value) })} className="mt-2 w-28 bg-[#16181D] border border-[#2A2D35] rounded p-2 text-[#F1F2F4]"/>}</div>)}</div>
        <button type="button" onClick={() => setForm(f => ({ ...f, steps: [...f.steps, { ...blankStep }] }))} className="text-sm text-[#F5A623]">+ Adım ekle</button>
        {save.error && <p className="text-sm text-red-400">{save.error.response?.data?.message || 'Plan kaydedilemedi'}</p>}
        <button disabled={save.isPending} className="w-full bg-[#F5A623] text-black font-bold p-3 rounded-lg">{save.isPending ? 'Kaydediliyor…' : 'Planı kaydet'}</button>
      </form>
    </div>
  </div></main></div>;
}
