'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadFoodItems, type FoodItem } from '@/app/lib/foodItems';
import { PageBanner, EmptyState } from './MyPantryView';

export default function MyPhotosView() {
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(loadFoodItems());
    refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('dine-pantry-change', refresh);
      return () => window.removeEventListener('dine-pantry-change', refresh);
    }
  }, []);

  const photos = useMemo(() => items.filter((i) => Boolean(i.imageUrl)), [items]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Minhas Fotos" subtitle="Galeria com fotos dos seus itens e refeições." />

      {photos.length === 0 ? (
        <EmptyState text="Nenhuma foto ainda. Adicione itens com foto pela ação 'Adicionar Item'." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.75rem' }}>
          {photos.map((p) => (
            <div key={p.id} style={{ aspectRatio: '1 / 1', borderRadius: '0.85rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0.45rem 0.6rem', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)', fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                {p.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
