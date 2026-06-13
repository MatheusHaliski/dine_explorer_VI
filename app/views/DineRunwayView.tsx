'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadFoodItems, type FoodItem } from '@/app/lib/foodItems';
import {
  DEFAULT_BACKGROUND,
  LIST_FORMAT_OPTIONS,
  OCCASION_OPTIONS,
  buildBackgroundStyle,
  loadMealSchemes,
  summarizeScheme,
  type MealScheme,
} from '@/app/lib/mealSchemes';
import MealSchemeList from '@/app/components/food/MealSchemeList';
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1rem' }}>
          {schemes.map((s) => {
            const bg = s.background || DEFAULT_BACKGROUND;
            const format = s.listFormat || 'grid-2';
            return (
              <article key={s.id} style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
                <header style={{ padding: '0.95rem 1rem', ...buildBackgroundStyle(bg) }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: s.titleFont }}>{s.name}</div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>{OCCASION_OPTIONS.find((o) => o.value === s.occasion)?.label} · por {s.authorEmail || 'anônimo'}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.15rem' }}>Formato: {LIST_FORMAT_OPTIONS.find((o) => o.value === format)?.label}</div>
                </header>
                <div style={{ padding: '0.95rem', background: 'rgba(15,23,42,0.65)', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <MealSchemeList slots={s.slots} byId={byId} format={format} pieceBackgrounds={s.pieceBackgrounds} compact />
                  <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>{summarizeScheme(s, byId)}</div>
                  {s.description && <div style={{ fontSize: '0.76rem', opacity: 0.75 }}>{s.description}</div>}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <Action label="Curtir" />
                    <Action label="Comentar" />
                    <Action label="Remixar" />
                  </div>
                </div>
              </article>
            );
          })}
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
