import React, { useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const api = import.meta.env.PROD ? '' : 'http://localhost:5001';
const actionLabels = { whatsapp_draft: 'WhatsApp taslağı', reminder: 'Hatırlatma', score_adjust: 'Skor güncelleme' };

export default function FollowUpPlanPanel({ leadId, token }) {
  const [planId, setPlanId] = useState('');
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };
  const { data: plans = [] } = useQuery({ queryKey: ['follow-up-plans'], queryFn: () => axios.get(`${api}/api/follow-up-plans`, { headers }).then(r => r.data) });
  const { data: active } = useQuery({ queryKey: ['lead-follow-up', leadId], queryFn: () => axios.get(`${api}/api/follow-up-plans/lead/${leadId}`, { headers }).then(r => r.data), enabled: !!leadId });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['lead-follow-up', leadId] });
  const assign = useMutation({ mutationFn: () => axios.post(`${api}/api/follow-up-plans/assign`, { lead_id: leadId, plan_id: planId }, { headers }), onSuccess: refresh });
  const act = useMutation({ mutationFn: action => axios.patch(`${api}/api/follow-up-plans/active/${active.id}`, { action }, { headers }), onSuccess: refresh });

  return <section className="bg-surface-container/80 border border-outline/50 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3"><span className="material-symbols-outlined text-primary">schedule_send</span><h4 className="text-sm font-bold text-on-surface">Otomatik takip planı</h4></div>
    {active ? <div className="space-y-3">
      <div className="text-sm text-on-surface"><strong>{active.plan_name}</strong><p className="text-xs text-on-surface-variant mt-1">Adım {active.current_step}: {actionLabels[active.current_action] || active.current_action}</p><p className="text-xs text-on-surface-variant">{active.next_run_at ? `Sonraki çalışma: ${new Date(active.next_run_at).toLocaleString('tr-TR')}` : active.pause_reason || 'Plan tamamlandı'}</p></div>
      <div className="flex gap-2">{active.status === 'active' ? <button onClick={() => act.mutate('pause')} className="px-3 py-2 text-xs rounded bg-surface-container-high text-on-surface">Duraklat</button> : active.status === 'paused' ? <button onClick={() => act.mutate('resume')} className="px-3 py-2 text-xs rounded bg-primary text-on-primary">Devam ettir</button> : null}{active.status !== 'completed' && <button onClick={() => act.mutate('skip')} className="px-3 py-2 text-xs rounded border border-outline text-on-surface">Adımı atla</button>}</div>
    </div> : <div className="flex gap-2">
      <select aria-label="Takip planı" value={planId} onChange={e => setPlanId(e.target.value)} className="min-w-0 flex-1 bg-surface-container-high border border-outline rounded-lg px-3 py-2 text-sm text-on-surface"><option value="">Plan seçin</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <button disabled={!planId || assign.isPending} onClick={() => assign.mutate()} className="px-3 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold disabled:opacity-50">Ata</button>
    </div>}
    {(assign.error || act.error) && <p className="text-xs text-error mt-2">{assign.error?.response?.data?.message || act.error?.response?.data?.message}</p>}
  </section>;
}
