'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FOOD_CATEGORY_OPTIONS,
  deleteFoodItem,
  loadFoodItems,
  updateFoodItemStatus,
  type FoodItem,
  type FoodStatus,
} from '@/app/lib/foodItems';

type Tab = FoodStatus;

const TABS: { value: Tab; label: string }[] = [
  { value: 'available',   label: 'Disponíveis' },
  { value: 'unavailable', label: 'Indisponíveis' },
  { value: 'favorite',    label: 'Favoritos' },
  { value: 'for-sale',    label: 'Para vender' },
];

export default function MyPantryView() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [tab, setTab] = useState<Tab>('available');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const refresh = () => setItems(loadFoodItems());
    refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('dine-pantry-change', refresh);
      return () => window.removeEventListener('dine-pantry-change', refresh);
    }
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => i.status === tab)
      .filter((i) => (q ? i.name.toLowerCase().includes(q) || i.cuisine.toLowerCase().includes(q) : true));
  }, [items, tab, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner
        title="Minha Despensa"
        subtitle="Classifique seus alimentos como disponíveis, indisponíveis e favoritos."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '14rem 1fr', gap: '1rem' }} className="dine-pantry-grid">
        <aside style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(241,245,249,0.55)', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Despensa</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {TABS.map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value} type="button" onClick={() => setTab(t.value)}
                  style={{
                    textAlign: 'left', padding: '0.55rem 0.75rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: active ? 700 : 500,
                    background: active ? 'linear-gradient(120deg, rgba(34,197,94,0.25), rgba(34,211,238,0.15))' : 'transparent',
                    color: active ? '#fff' : 'rgba(241,245,249,0.75)',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '0.75rem 1rem' }}>
            <span style={{ color: '#a7f3d0' }}>⌕</span>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Busca semântica (ex: pratos proteicos vegetarianos)"
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
            />
            <button
              type="button"
              style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#16a34a,#0891b2)', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >
              Busca IA
            </button>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>Itens {TABS.find((t) => t.value === tab)?.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.6)' }}>Gerencie o status de cada item da despensa.</div>
            </div>

            {visible.length === 0 ? (
              <EmptyState text="Nenhum item nesta seção. Use 'Adicionar Item' no topo." />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                {visible.map((it) => (
                  <PantryCard key={it.id} item={it} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .dine-pantry-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function PantryCard({ item }: { item: FoodItem }) {
  const categoryLabel = FOOD_CATEGORY_OPTIONS.find((c) => c.value === item.category)?.label || item.category;

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.9rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ aspectRatio: '4 / 3', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: 'rgba(241,245,249,0.4)', fontSize: '0.8rem' }}>sem foto</span>
        )}
      </div>
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{categoryLabel} · {item.cuisine}</div>
        </div>
        {item.description && (
          <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.75)' }}>{item.description}</div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.1rem' }}>
          <StatusButton current={item.status} target="available"   label="Disponível"  itemId={item.id} />
          <StatusButton current={item.status} target="unavailable" label="Indisponível" itemId={item.id} />
          <StatusButton current={item.status} target="favorite"    label="★ Favorito"   itemId={item.id} />
          <button
            type="button" onClick={() => { if (confirm(`Remover ${item.name}?`)) deleteFoodItem(item.id); }}
            style={{ padding: '0.3rem 0.6rem', borderRadius: '0.45rem', border: '1px solid rgba(248,113,113,0.4)', background: 'transparent', color: '#fca5a5', cursor: 'pointer', fontSize: '0.72rem' }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusButton({ current, target, label, itemId }: { current: FoodStatus; target: FoodStatus; label: string; itemId: string }) {
  const active = current === target;
  return (
    <button
      type="button" onClick={() => updateFoodItemStatus(itemId, target)}
      style={{
        padding: '0.3rem 0.6rem', borderRadius: '0.45rem', cursor: 'pointer', fontSize: '0.72rem',
        border: `1px solid ${active ? '#34d399' : 'rgba(255,255,255,0.16)'}`,
        background: active ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.04)',
        color: '#fff',
      }}
    >
      {label}
    </button>
  );
}

export function PageBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{
      background: 'linear-gradient(120deg, #7c3aed, #db2777)',
      borderRadius: '1rem', padding: '1.2rem 1.4rem',
      boxShadow: '0 18px 60px rgba(124,58,237,0.35)', color: '#fff',
    }}>
      <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{subtitle}</div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'rgba(241,245,249,0.5)', fontSize: '0.9rem' }}>
      {text}
    </div>
  );
}
