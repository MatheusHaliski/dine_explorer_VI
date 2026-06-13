'use client';

import { PageBanner } from './MyPantryView';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function AutopilotView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Autopiloto" subtitle="Refeições diárias e planejamento semanal sugeridos por IA." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.75rem' }}>
        {DAYS.map((d) => (
          <div key={d} style={{ background: 'linear-gradient(160deg, rgba(15,23,42,0.6), rgba(15,118,110,0.4))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.85rem', padding: '0.9rem' }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: 'rgba(241,245,249,0.55)' }}>DIA</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{d}</div>
            <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <Slot label="Café" />
              <Slot label="Almoço" />
              <Slot label="Jantar" />
            </div>
            <button type="button" style={{ marginTop: '0.7rem', width: '100%', padding: '0.45rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#16a34a,#0891b2)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              Gerar com IA
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slot({ label }: { label: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.18)', borderRadius: '0.5rem', padding: '0.4rem 0.55rem', fontSize: '0.78rem', color: 'rgba(241,245,249,0.75)' }}>
      {label}: <span style={{ color: 'rgba(241,245,249,0.45)' }}>—</span>
    </div>
  );
}
