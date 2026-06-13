'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadFoodItems, type FoodItem } from '@/app/lib/foodItems';
import {
  DEFAULT_BACKGROUND,
  LIST_FORMAT_OPTIONS,
  OCCASION_OPTIONS,
  buildBackgroundStyle,
  deleteMealScheme,
  loadMealSchemes,
  summarizeScheme,
  type MealScheme,
} from '@/app/lib/mealSchemes';
import MealSchemeList from '@/app/components/food/MealSchemeList';
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1rem' }}>
          {visible.map((s) => {
            const bg = s.background || DEFAULT_BACKGROUND;
            const format = s.listFormat || 'grid-2';
            return (
              <article key={s.id} style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', boxShadow: '0 18px 50px rgba(0,0,0,0.3)' }}>
                <header style={{ padding: '1rem 1.1rem', ...buildBackgroundStyle(bg) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: s.titleFont }}>{s.name}</div>
                      <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>{OCCASION_OPTIONS.find((o) => o.value === s.occasion)?.label} · {s.visibility === 'public' ? 'Público' : 'Privado'}</div>
                      {(s.palette || s.mood) && (
                        <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.15rem' }}>{[s.palette, s.mood].filter(Boolean).join(' · ')}</div>
                      )}
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.15rem' }}>Formato: {LIST_FORMAT_OPTIONS.find((o) => o.value === format)?.label}</div>
                    </div>
                    <button type="button" onClick={() => { if (confirm('Excluir esse esquema?')) deleteMealScheme(s.id); }}
                      style={{ padding: '0.3rem 0.55rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.7rem' }}>
                      Excluir
                    </button>
                  </div>
                </header>
                <div style={{ padding: '0.85rem', background: 'rgba(15,23,42,0.6)' }}>
                  <MealSchemeList slots={s.slots} byId={byId} format={format} pieceBackgrounds={s.pieceBackgrounds} compact />
                  <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', opacity: 0.85 }}>{summarizeScheme(s, byId)}</div>
                  {s.description && <div style={{ marginTop: '0.4rem', fontSize: '0.76rem', opacity: 0.75 }}>{s.description}</div>}
                </div>
              </article>
            );
          })}
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
