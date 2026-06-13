'use client';

import { PageBanner } from './MyPantryView';

const KITCHENS = [
  { name: 'Outback Steakhouse', tagline: 'Cortes premium · Argentine grill', color: '#16a34a' },
  { name: 'Casa Bauducco',      tagline: 'Padaria & Café',                    color: '#db2777' },
  { name: 'Sushi Yassu',        tagline: 'Cozinha Japonesa',                  color: '#0891b2' },
  { name: 'La Pasta Gialla',    tagline: 'Italiana & Pizza',                  color: '#f59e0b' },
  { name: 'Verde Cozinha',      tagline: 'Vegana e Plant-based',              color: '#22c55e' },
];

export default function MaisonView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Cozinhas" subtitle="Perfis de marcas e cozinhas parceiras com identidade própria." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
        {KITCHENS.map((k) => (
          <article key={k.name} style={{ background: `linear-gradient(135deg, ${k.color}, rgba(15,23,42,0.7))`, borderRadius: '1rem', padding: '1.1rem', color: '#fff', minHeight: '12rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', opacity: 0.8, textTransform: 'uppercase' }}>Cozinha</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>{k.name}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{k.tagline}</div>
            </div>
            <button type="button" style={{ alignSelf: 'flex-start', padding: '0.45rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
              Ver perfil
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
