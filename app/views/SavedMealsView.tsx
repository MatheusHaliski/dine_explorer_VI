'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadFoodItems, type FoodItem } from '@/app/lib/foodItems';
import { loadMealSchemes, deleteMealScheme, OCCASION_OPTIONS, summarizeScheme, type MealScheme } from '@/app/lib/mealSchemes';
import { PageBanner, EmptyState } from './MyPantryView';

export default function SavedMealsView() {
  const [schemes, setSchemes] = useState<MealScheme[]>([]);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const refresh = () => {
      setSchemes(loadMealSchemes());
      setItems(loadFoodItems());
    };
    refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('dine-schemes-change', refresh);
      window.addEventListener('dine-pantry-change', refresh);
      return () => {
        window.removeEventListener('dine-schemes-change', refresh);
        window.removeEventListener('dine-pantry-change', refresh);
      };
    }
  }, []);

  const byId = useMemo(() => {
    const map: Record<string, FoodItem> = {};
    items.forEach((i) => { map[i.id] = i; });
    return map;
  }, [items]);

  const visible = useMemo(() => {
    if (filter === 'all') return schemes;
    return schemes.filter((s) => s.occasion === filter);
  }, [schemes, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Esquemas Salvos" subtitle="Refeições montadas por você — organize por ocasião." />

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Chip active={filter === 'all'} label="Todos" onClick={() => setFilter('all')} />
        {OCCASION_OPTIONS.map((o) => (
          <Chip key={o.value} active={filter === o.value} label={o.label} onClick={() => setFilter(o.value)} />
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState text="Nenhum esquema salvo ainda. Vá em 'Criar Esquema' para montar um." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
          {visible.map((s) => (
            <article key={s.id} style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', borderRadius: '1rem', padding: '1.1rem', color: '#fff', boxShadow: '0 18px 50px rgba(124,58,237,0.30)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{OCCASION_OPTIONS.find((o) => o.value === s.occasion)?.label} · {s.visibility === 'public' ? 'Público' : 'Privado'}</div>
                </div>
                <button
                  type="button" onClick={() => { if (confirm('Excluir esse esquema?')) deleteMealScheme(s.id); }}
                  style={{ padding: '0.3rem 0.55rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.7rem' }}
                >
                  Excluir
                </button>
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.95 }}>{summarizeScheme(s, byId)}</div>
              {s.description && <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', opacity: 0.85 }}>{s.description}</div>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        padding: '0.4rem 0.85rem', borderRadius: '999px', fontSize: '0.78rem', cursor: 'pointer',
        border: `1px solid ${active ? '#34d399' : 'rgba(255,255,255,0.18)'}`,
        background: active ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.04)',
        color: '#fff',
      }}
    >
      {label}
    </button>
  );
}
