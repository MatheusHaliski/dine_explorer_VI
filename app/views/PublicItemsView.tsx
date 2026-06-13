'use client';

import { useEffect, useState } from 'react';
import { loadFoodItems, FOOD_CATEGORY_OPTIONS, type FoodItem } from '@/app/lib/foodItems';
import { PageBanner, EmptyState } from './MyPantryView';

export default function PublicItemsView() {
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(loadFoodItems().filter((i) => i.status === 'for-sale' || i.status === 'favorite'));
    refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('dine-pantry-change', refresh);
      return () => window.removeEventListener('dine-pantry-change', refresh);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Itens Públicos" subtitle="Descubra itens de alimentação compartilhados pela comunidade." />

      {items.length === 0 ? (
        <EmptyState text="Nenhum item público no momento. Marque seus itens como 'Para vender' para aparecerem aqui." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
          {items.map((it) => (
            <div key={it.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.9rem', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '4 / 3', background: 'rgba(255,255,255,0.04)' }}>
                {it.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imageUrl} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ padding: '0.7rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{it.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.55)' }}>
                  {FOOD_CATEGORY_OPTIONS.find((c) => c.value === it.category)?.label} · {it.cuisine}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
