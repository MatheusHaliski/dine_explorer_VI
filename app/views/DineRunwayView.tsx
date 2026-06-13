'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadFoodItems, type FoodItem } from '@/app/lib/foodItems';
import { loadMealSchemes, OCCASION_OPTIONS, summarizeScheme, type MealScheme } from '@/app/lib/mealSchemes';
import { PageBanner, EmptyState } from './MyPantryView';

export default function DineRunwayView() {
  const [schemes, setSchemes] = useState<MealScheme[]>([]);
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    const refresh = () => {
      setSchemes(loadMealSchemes().filter((s) => s.visibility === 'public'));
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Dine Runway" subtitle="O feed social com as melhores combinações da comunidade Dine." />

      {schemes.length === 0 ? (
        <EmptyState text="Ainda não há posts públicos. Publique um esquema público em 'Criar Esquema'." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1rem' }}>
          {schemes.map((s) => (
            <article key={s.id} style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
              <header style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', padding: '0.85rem 1rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{OCCASION_OPTIONS.find((o) => o.value === s.occasion)?.label} · por {s.authorEmail || 'anônimo'}</div>
              </header>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem' }}>{summarizeScheme(s, byId)}</div>
                {s.description && <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.7)' }}>{s.description}</div>}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <Action label="Curtir" />
                  <Action label="Comentar" />
                  <Action label="Remixar" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Action({ label }: { label: string }) {
  return (
    <button type="button" style={{ padding: '0.35rem 0.7rem', borderRadius: '0.45rem', border: '1px solid rgba(255,255,255,0.16)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>{label}</button>
  );
}
