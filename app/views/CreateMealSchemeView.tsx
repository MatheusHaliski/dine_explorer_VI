'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  loadFoodItems,
  FOOD_CATEGORY_OPTIONS,
  type FoodItem,
} from '@/app/lib/foodItems';
import {
  DEFAULT_SLOTS,
  OCCASION_OPTIONS,
  addMealScheme,
  type MealOccasion,
  type SchemeMode,
  type SchemeVisibility,
  type MealSchemeSlot,
} from '@/app/lib/mealSchemes';
import { getAuthSessionProfile } from '@/app/lib/authSession';
import { PageBanner, EmptyState } from './MyPantryView';

export default function CreateMealSchemeView() {
  const [pantry, setPantry] = useState<FoodItem[]>([]);
  const [name, setName] = useState('Meu Novo Esquema');
  const [description, setDescription] = useState('');
  const [occasion, setOccasion] = useState<MealOccasion>('lunch');
  const [visibility, setVisibility] = useState<SchemeVisibility>('public');
  const [mode, setMode] = useState<SchemeMode>('manual');
  const [slots, setSlots] = useState<MealSchemeSlot[]>(
    DEFAULT_SLOTS.map((s) => ({ ...s, foodItemId: null }))
  );
  const [activeSlot, setActiveSlot] = useState<string>(DEFAULT_SLOTS[0].slotId);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState('');

  useEffect(() => {
    const refresh = () => setPantry(loadFoodItems());
    refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('dine-pantry-change', refresh);
      return () => window.removeEventListener('dine-pantry-change', refresh);
    }
  }, []);

  const byId = useMemo(() => {
    const map: Record<string, FoodItem> = {};
    pantry.forEach((i) => { map[i.id] = i; });
    return map;
  }, [pantry]);

  const availableForActive = useMemo(() => {
    return pantry.filter((i) => i.status === 'available' || i.status === 'favorite');
  }, [pantry]);

  const handlePick = (slotId: string, foodItemId: string | null) => {
    setSlots((prev) => prev.map((s) => (s.slotId === slotId ? { ...s, foodItemId } : s)));
  };

  const filledCount = slots.filter((s) => s.foodItemId).length;

  const handleSave = () => {
    setSaving(true);
    setSavedFeedback('');
    try {
      const profile = getAuthSessionProfile();
      addMealScheme({
        name: name.trim() || 'Esquema sem nome',
        description: description.trim(),
        occasion, visibility, mode, slots, tags,
        authorEmail: profile.email || undefined,
      });
      setSavedFeedback('Esquema salvo em "Esquemas Salvos".');
      setSlots(DEFAULT_SLOTS.map((s) => ({ ...s, foodItemId: null })));
      setName('Meu Novo Esquema');
      setDescription('');
      setTags([]);
    } catch (err) {
      console.error(err);
      setSavedFeedback('Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const activeSlotData = slots.find((s) => s.slotId === activeSlot);
  const activePicked = activeSlotData?.foodItemId ? byId[activeSlotData.foodItemId] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner
        title="Criar Esquema de Alimentação"
        subtitle="Monte sua refeição peça por peça — manualmente ou com sugestões de IA."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '18rem 1fr 22rem', gap: '1rem' }} className="dine-create-grid">
        <aside style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(241,245,249,0.55)', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Slots da Refeição</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {slots.map((s) => {
              const item = s.foodItemId ? byId[s.foodItemId] : null;
              const active = activeSlot === s.slotId;
              return (
                <button
                  key={s.slotId} type="button" onClick={() => setActiveSlot(s.slotId)}
                  style={{
                    textAlign: 'left', padding: '0.65rem 0.75rem', borderRadius: '0.7rem', border: 'none', cursor: 'pointer',
                    background: active ? 'linear-gradient(120deg, rgba(124,58,237,0.3), rgba(219,39,119,0.18))' : 'rgba(255,255,255,0.04)',
                    color: '#fff',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.7)' }}>{item ? item.name : 'vazio'}</div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(241,245,249,0.55)', textTransform: 'uppercase' }}>Modo de Criação</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <ModeChip label="Manual" active={mode === 'manual'} onClick={() => setMode('manual')} />
              <ModeChip label="IA" active={mode === 'ai'} onClick={() => setMode('ai')} />
            </div>
          </div>
        </aside>

        <section style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>Slot atual: {activeSlotData?.label}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.65)' }}>
              Escolha uma peça de alimento da sua despensa para preencher este slot.
            </div>
          </div>

          {activePicked && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.8rem', padding: '0.75rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '0.6rem', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                {activePicked.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activePicked.imageUrl} alt={activePicked.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{activePicked.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.65)' }}>
                  {FOOD_CATEGORY_OPTIONS.find((c) => c.value === activePicked.category)?.label} · {activePicked.cuisine}
                </div>
              </div>
              <button
                type="button" onClick={() => handlePick(activeSlot, null)}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(248,113,113,0.45)', background: 'transparent', color: '#fca5a5', cursor: 'pointer', fontSize: '0.78rem' }}
              >
                Remover
              </button>
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.65)', marginBottom: '0.5rem' }}>Itens disponíveis da sua despensa</div>
            {availableForActive.length === 0 ? (
              <EmptyState text="Nenhum item disponível ainda. Clique em 'Adicionar Item' no topo." />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '0.65rem' }}>
                {availableForActive.map((it) => {
                  const isPicked = activeSlotData?.foodItemId === it.id;
                  return (
                    <button
                      key={it.id} type="button" onClick={() => handlePick(activeSlot, it.id)}
                      style={{
                        padding: '0.5rem', borderRadius: '0.7rem', cursor: 'pointer', textAlign: 'left',
                        background: isPicked ? 'rgba(34,211,238,0.18)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isPicked ? '#22d3ee' : 'rgba(255,255,255,0.1)'}`,
                        color: '#fff',
                      }}
                    >
                      <div style={{ aspectRatio: '4 / 3', borderRadius: '0.45rem', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', marginBottom: '0.4rem' }}>
                        {it.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.imageUrl} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{it.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(241,245,249,0.6)' }}>{it.cuisine}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(241,245,249,0.55)', textTransform: 'uppercase' }}>Pré-visualização</div>

          <div style={{
            background: 'linear-gradient(135deg,#7c3aed,#db2777)',
            borderRadius: '0.85rem', padding: '1rem', boxShadow: '0 18px 50px rgba(124,58,237,0.35)',
          }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{name || 'Esquema sem nome'}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '0.2rem' }}>
              {OCCASION_OPTIONS.find((o) => o.value === occasion)?.label} · {visibility === 'public' ? 'Público' : 'Privado'}
            </div>
            <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', opacity: 0.95 }}>
              {filledCount} de {slots.length} slots preenchidos
            </div>
          </div>

          <Field label="Nome do esquema">
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Ocasião">
            <select value={occasion} onChange={(e) => setOccasion(e.target.value as MealOccasion)} style={inputStyle}>
              {OCCASION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ color: '#000' }}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Visibilidade">
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <ModeChip label="Público" active={visibility === 'public'} onClick={() => setVisibility('public')} />
              <ModeChip label="Privado" active={visibility === 'private'} onClick={() => setVisibility('private')} />
            </div>
          </Field>

          <Field label="Descrição">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          <div>
            <button
              type="button" onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '0.65rem', border: 'none', background: 'linear-gradient(135deg,#16a34a,#0891b2)', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Salvando...' : 'Salvar Esquema'}
            </button>
            {savedFeedback && <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#a7f3d0' }}>{savedFeedback}</div>}
          </div>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          .dine-create-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function ModeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        padding: '0.4rem 0.9rem', borderRadius: '999px', fontSize: '0.78rem', cursor: 'pointer',
        border: `1px solid ${active ? '#34d399' : 'rgba(255,255,255,0.18)'}`,
        background: active ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.04)',
        color: '#fff',
      }}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.55)' }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.55rem',
  border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.85rem', outline: 'none',
};
