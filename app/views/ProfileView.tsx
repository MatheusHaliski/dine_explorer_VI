'use client';

import { useEffect, useState } from 'react';
import { getAuthSessionProfile, type AuthSessionProfile } from '@/app/lib/authSession';
import { loadFoodItems, type FoodItem } from '@/app/lib/foodItems';
import { loadMealSchemes, type MealScheme } from '@/app/lib/mealSchemes';
import { PageBanner } from './MyPantryView';

export default function ProfileView() {
  const [profile, setProfile] = useState<AuthSessionProfile | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [schemes, setSchemes] = useState<MealScheme[]>([]);

  useEffect(() => {
    setProfile(getAuthSessionProfile());
    const refresh = () => {
      setItems(loadFoodItems());
      setSchemes(loadMealSchemes());
    };
    refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('dine-pantry-change', refresh);
      window.addEventListener('dine-schemes-change', refresh);
      return () => {
        window.removeEventListener('dine-pantry-change', refresh);
        window.removeEventListener('dine-schemes-change', refresh);
      };
    }
  }, []);

  const email = profile?.email || 'visitante@dine.app';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Perfil" subtitle="Gerencie suas preferências e veja seu acervo gastronômico." />

      <div style={{ display: 'grid', gridTemplateColumns: '20rem 1fr', gap: '1rem' }} className="dine-profile-grid">
        <aside style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'linear-gradient(135deg,#22d3ee,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem' }}>
            {initials}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>{email}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.6)' }}>Membro Dine Explorer</div>
          </div>
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem' }}>
            <Stat label="Itens cadastrados" value={items.length} />
            <Stat label="Esquemas salvos" value={schemes.length} />
            <Stat label="Esquemas públicos" value={schemes.filter((s) => s.visibility === 'public').length} />
            <Stat label="Favoritos" value={items.filter((i) => i.status === 'favorite').length} />
          </div>

          <div style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.1rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(241,245,249,0.55)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Configurações</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(241,245,249,0.75)' }}>
              Preferências de privacidade, notificações e idioma estarão disponíveis em breve.
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 900px) { .dine-profile-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: 'linear-gradient(160deg, rgba(15,23,42,0.6), rgba(15,118,110,0.4))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.85rem', padding: '0.85rem' }}>
      <div style={{ fontSize: '1.45rem', fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}
