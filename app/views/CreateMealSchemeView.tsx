'use client';

import { CSSProperties, useEffect, useMemo, useState } from 'react';
import {
  loadFoodItems,
  FOOD_CATEGORY_OPTIONS,
  type FoodItem,
} from '@/app/lib/foodItems';
import {
  DEFAULT_BACKGROUND,
  DEFAULT_SLOTS,
  LIST_FORMAT_OPTIONS,
  MOOD_OPTIONS,
  OCCASION_OPTIONS,
  PALETTE_OPTIONS,
  TITLE_FONT_OPTIONS,
  addMealScheme,
  buildBackgroundStyle,
  buildPublicSchemePayload,
  type BackgroundConfig,
  type ListFormat,
  type MealOccasion,
  type MealSchemeSlot,
  type SchemeMode,
  type SchemeVisibility,
} from '@/app/lib/mealSchemes';
import { getAuthSessionProfile } from '@/app/lib/authSession';
import { getActorEmail, publishScheme } from '@/app/lib/social/socialClient';
import MealBackgroundStudioModal from '@/app/components/food/MealBackgroundStudioModal';
import MealSchemeList from '@/app/components/food/MealSchemeList';
import { PageBanner, EmptyState } from './MyPantryView';

type StepId = 'basics' | 'build' | 'ai' | 'review' | 'format' | 'background' | 'save';

interface Step {
  id: StepId;
  label: string;
  icon: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 'basics',     label: 'Dados Básicos',  icon: '📋', description: 'Nome, ocasião, paleta e identidade do esquema.' },
  { id: 'build',      label: 'Montar Refeição', icon: '🍴', description: 'Atribua um item de alimento a cada slot da refeição.' },
  { id: 'ai',         label: 'Assistente IA',  icon: '✨', description: 'Use IA para sugerir combinações criativas.' },
  { id: 'review',     label: 'Revisão dos Slots', icon: '🔍', description: 'Confira cada peça antes de avançar.' },
  { id: 'format',     label: 'Formato da Lista', icon: '🧩', description: 'Escolha o layout visual do esquema.' },
  { id: 'background', label: 'Arte de Fundo',  icon: '🎨', description: 'Configure o fundo do esquema e de cada peça.' },
  { id: 'save',       label: 'Salvar & Publicar', icon: '💾', description: 'Revise o resumo e publique seu esquema.' },
];

export default function CreateMealSchemeView() {
  const [pantry, setPantry] = useState<FoodItem[]>([]);

  const [currentStep, setCurrentStep] = useState<StepId>('basics');

  const [name, setName] = useState('Meu Novo Esquema');
  const [description, setDescription] = useState('');
  const [occasion, setOccasion] = useState<MealOccasion>('lunch');
  const [visibility, setVisibility] = useState<SchemeVisibility>('public');
  const [mode, setMode] = useState<SchemeMode>('manual');
  const [palette, setPalette] = useState<string>(PALETTE_OPTIONS[0]);
  const [mood, setMood] = useState<string>(MOOD_OPTIONS[0]);
  const [titleFont, setTitleFont] = useState<string>(TITLE_FONT_OPTIONS[0]);
  const [aiPrompt, setAiPrompt] = useState('');

  // [SOCIAL] Vínculo opcional com um restaurante do catálogo (selo restaurante + esquema + peças).
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [restaurantQuery, setRestaurantQuery] = useState('');
  const [restaurantOptions, setRestaurantOptions] = useState<{ id: string; name: string }[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  const loadRestaurantOptions = async () => {
    if (restaurantOptions.length || loadingRestaurants) return;
    setLoadingRestaurants(true);
    try {
      const collected: { id: string; name: string }[] = [];
      let cursor: string | null = null;
      let pages = 0;
      do {
        const params = new URLSearchParams({ limit: '50' });
        if (cursor) params.set('cursor', cursor);
        const res = await fetch(`/api/restaurants/catalog?${params.toString()}`);
        if (!res.ok) break;
        const data = (await res.json()) as { catalog: { id: string; name?: string }[]; nextCursor: string | null };
        data.catalog.forEach((r) => collected.push({ id: r.id, name: r.name || 'Sem nome' }));
        cursor = data.nextCursor;
        pages += 1;
      } while (cursor && pages < 8); // limita a ~400 restaurantes para o seletor
      collected.sort((a, b) => a.name.localeCompare(b.name));
      setRestaurantOptions(collected);
    } catch {
      /* silencioso — seletor de restaurante é opcional */
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const [slots, setSlots] = useState<MealSchemeSlot[]>(
    DEFAULT_SLOTS.map((s) => ({ slotId: s.slotId, label: s.label, foodItemId: null }))
  );
  const [activeSlot, setActiveSlot] = useState<string>(DEFAULT_SLOTS[0].slotId);

  const [listFormat, setListFormat] = useState<ListFormat>('grid-2');
  const [background, setBackground] = useState<BackgroundConfig>(DEFAULT_BACKGROUND);
  const [pieceBackgrounds, setPieceBackgrounds] = useState<Record<string, BackgroundConfig>>(
    Object.fromEntries(DEFAULT_SLOTS.map((s) => [s.slotId, DEFAULT_BACKGROUND]))
  );

  const [studioFor, setStudioFor] = useState<'scheme' | string | null>(null);

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
    const m: Record<string, FoodItem> = {};
    pantry.forEach((i) => { m[i.id] = i; });
    return m;
  }, [pantry]);

  const availableItems = useMemo(
    () => pantry.filter((i) => i.status === 'available' || i.status === 'favorite'),
    [pantry]
  );

  const filledCount = useMemo(() => slots.filter((s) => s.foodItemId).length, [slots]);

  const completedSteps = useMemo<StepId[]>(() => {
    const done: StepId[] = [];
    if (name.trim()) done.push('basics');
    if (filledCount > 0) done.push('build');
    if (aiPrompt.trim() || mode === 'manual') done.push('ai');
    if (filledCount === slots.length) done.push('review');
    if (listFormat) done.push('format');
    if (background.mode) done.push('background');
    return done;
  }, [name, filledCount, slots.length, aiPrompt, mode, listFormat, background.mode]);

  const handlePick = (slotId: string, foodItemId: string | null) => {
    setSlots((prev) => prev.map((s) => (s.slotId === slotId ? { ...s, foodItemId } : s)));
  };

  const goNext = () => {
    const i = STEPS.findIndex((s) => s.id === currentStep);
    if (i < STEPS.length - 1) setCurrentStep(STEPS[i + 1].id);
  };
  const goPrev = () => {
    const i = STEPS.findIndex((s) => s.id === currentStep);
    if (i > 0) setCurrentStep(STEPS[i - 1].id);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedFeedback('');
    try {
      const profile = getAuthSessionProfile();
      const saved = addMealScheme({
        name: name.trim() || 'Esquema sem nome',
        description: description.trim(),
        occasion, visibility, mode, slots,
        tags: [],
        authorEmail: profile.email || undefined,
        palette, mood, titleFont,
        aiPrompt: aiPrompt.trim() || undefined,
        background,
        pieceBackgrounds,
        listFormat,
        restaurantId: restaurantId || undefined,
        restaurantName: restaurantName || undefined,
      });

      // [SOCIAL] Esquemas públicos são publicados no Firestore para outros usuários verem,
      // curtirem, comentarem e salvarem.
      if (visibility === 'public') {
        const actor = getActorEmail();
        if (actor) {
          const payload = buildPublicSchemePayload(saved, byId, {
            email: actor,
            displayName: profile.email || actor,
          });
          const published = await publishScheme(payload as unknown as Record<string, unknown>);
          setSavedFeedback(
            published
              ? 'Esquema salvo e publicado no feed social (Dine Runway).'
              : 'Esquema salvo localmente. Não foi possível publicar agora.'
          );
        } else {
          setSavedFeedback('Esquema salvo. Faça login para publicá-lo no feed social.');
        }
      } else {
        setSavedFeedback('Esquema salvo em "Esquemas Salvos".');
      }
    } catch (err) {
      console.error(err);
      setSavedFeedback('Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const progress = Math.round((completedSteps.length / STEPS.length) * 100);
  const currentStepData = STEPS.find((s) => s.id === currentStep)!;
  const activeSlotData = slots.find((s) => s.slotId === activeSlot);
  const activePicked = activeSlotData?.foodItemId ? byId[activeSlotData.foodItemId] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner
        title="Criar Esquema de Alimentação"
        subtitle="Fluxo guiado em 7 etapas — do básico até a arte de fundo e a publicação."
      />

      {/* Stepper */}
      <section style={{ background: 'linear-gradient(120deg, rgba(124,58,237,0.35), rgba(219,39,119,0.25))', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '1rem', padding: '1rem 1.1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Crie seu Card de Refeição</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Progresso {progress}%</div>
          </div>
          <div style={{ height: '0.5rem', flex: '1 1 280px', maxWidth: '320px', borderRadius: '999px', background: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#34d399,#fde68a)', transition: 'width 0.3s' }} />
          </div>
        </div>
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(135px,1fr))', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
          {STEPS.map((s, idx) => {
            const active = currentStep === s.id;
            const done = completedSteps.includes(s.id);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '0.55rem 0.7rem', borderRadius: '0.7rem', cursor: 'pointer', fontSize: '0.78rem',
                    border: `1px solid ${active ? '#a7f3d0' : 'rgba(255,255,255,0.22)'}`,
                    background: active ? '#fff' : done ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                    color: active ? '#0b1220' : '#fff',
                  }}
                >
                  <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{idx + 1}. {s.label}</span>
                    {done && <span>✓</span>}
                  </div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.8, marginTop: '0.15rem' }}>{s.icon} {s.description}</div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Main step content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 24rem', gap: '1rem' }} className="dine-create-grid">
        <section style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(241,245,249,0.6)' }}>Etapa</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{currentStepData.icon} {currentStepData.label}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(241,245,249,0.65)' }}>{currentStepData.description}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <button type="button" onClick={goPrev} disabled={currentStep === STEPS[0].id} style={btnSecondary}>← Voltar</button>
              <button type="button" onClick={goNext} disabled={currentStep === STEPS[STEPS.length - 1].id} style={btnPrimary}>Avançar →</button>
            </div>
          </div>

          {currentStep === 'basics' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.85rem' }}>
              <Field label="Nome do esquema"><input value={name} onChange={(e) => setName(e.target.value)} style={input} /></Field>
              <Field label="Ocasião">
                <select value={occasion} onChange={(e) => setOccasion(e.target.value as MealOccasion)} style={input}>
                  {OCCASION_OPTIONS.map((o) => <option key={o.value} value={o.value} style={{ color: '#000' }}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Visibilidade">
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Chip active={visibility === 'public'} label="Público"  onClick={() => setVisibility('public')} />
                  <Chip active={visibility === 'private'} label="Privado" onClick={() => setVisibility('private')} />
                </div>
              </Field>
              <Field label="Paleta">
                <select value={palette} onChange={(e) => setPalette(e.target.value)} style={input}>
                  {PALETTE_OPTIONS.map((o) => <option key={o} value={o} style={{ color: '#000' }}>{o}</option>)}
                </select>
              </Field>
              <Field label="Mood">
                <select value={mood} onChange={(e) => setMood(e.target.value)} style={input}>
                  {MOOD_OPTIONS.map((o) => <option key={o} value={o} style={{ color: '#000' }}>{o}</option>)}
                </select>
              </Field>
              <Field label="Fonte do título">
                <select value={titleFont} onChange={(e) => setTitleFont(e.target.value)} style={input}>
                  {TITLE_FONT_OPTIONS.map((o) => <option key={o} value={o} style={{ color: '#000', fontFamily: o }}>{o}</option>)}
                </select>
              </Field>
              <Field label="Descrição">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...input, resize: 'vertical', gridColumn: '1 / -1' }} />
              </Field>

              {/* [SOCIAL] Vincular restaurante — cria o selo restaurante + esquema + peças */}
              <Field label="Vincular restaurante (opcional)">
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {restaurantId ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.5rem 0.7rem', borderRadius: '0.55rem', border: '1px solid rgba(52,211,153,0.6)', background: 'rgba(52,211,153,0.14)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>🍱 {restaurantName}</span>
                      <button type="button" onClick={() => { setRestaurantId(''); setRestaurantName(''); }} style={btnSecondary}>Remover</button>
                    </div>
                  ) : (
                    <>
                      <input
                        value={restaurantQuery}
                        onFocus={loadRestaurantOptions}
                        onChange={(e) => setRestaurantQuery(e.target.value)}
                        placeholder={loadingRestaurants ? 'Carregando restaurantes…' : 'Buscar restaurante por nome'}
                        style={input}
                      />
                      {restaurantQuery.trim() && (
                        <div style={{ maxHeight: '10rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '0.55rem', border: '1px solid rgba(255,255,255,0.1)', padding: '0.3rem', background: 'rgba(15,23,42,0.6)' }}>
                          {restaurantOptions
                            .filter((r) => r.name.toLowerCase().includes(restaurantQuery.trim().toLowerCase()))
                            .slice(0, 20)
                            .map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => { setRestaurantId(r.id); setRestaurantName(r.name); setRestaurantQuery(''); }}
                                style={{ textAlign: 'left', padding: '0.4rem 0.6rem', borderRadius: '0.45rem', border: 'none', cursor: 'pointer', background: 'transparent', color: '#fff', fontSize: '0.82rem' }}
                              >
                                {r.name}
                              </button>
                            ))}
                          {restaurantOptions.filter((r) => r.name.toLowerCase().includes(restaurantQuery.trim().toLowerCase())).length === 0 && (
                            <div style={{ fontSize: '0.78rem', opacity: 0.6, padding: '0.3rem 0.6rem' }}>Nenhum restaurante encontrado.</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Field>
            </div>
          )}

          {currentStep === 'build' && (
            <div style={{ display: 'grid', gridTemplateColumns: '14rem 1fr', gap: '1rem' }} className="dine-build-grid">
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(241,245,249,0.55)', marginBottom: '0.3rem' }}>Slots</div>
                {slots.map((s) => {
                  const it = s.foodItemId ? byId[s.foodItemId] : null;
                  const active = activeSlot === s.slotId;
                  return (
                    <button key={s.slotId} type="button" onClick={() => setActiveSlot(s.slotId)}
                      style={{
                        textAlign: 'left', padding: '0.55rem 0.7rem', borderRadius: '0.6rem',
                        border: 'none', cursor: 'pointer', color: '#fff',
                        background: active ? 'linear-gradient(120deg, rgba(124,58,237,0.3), rgba(219,39,119,0.18))' : 'rgba(255,255,255,0.04)',
                      }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.label}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>{it ? it.name : 'vazio'}</div>
                    </button>
                  );
                })}
              </aside>

              <div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.65)', marginBottom: '0.5rem' }}>
                  Itens disponíveis da despensa para preencher <strong>{activeSlotData?.label}</strong>
                </div>
                {availableItems.length === 0 ? (
                  <EmptyState text="Nenhum item disponível. Clique em 'Adicionar Item' no topo." />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.6rem' }}>
                    {availableItems.map((it) => {
                      const isPicked = activeSlotData?.foodItemId === it.id;
                      return (
                        <button key={it.id} type="button" onClick={() => handlePick(activeSlot, isPicked ? null : it.id)}
                          style={{
                            padding: '0.45rem', borderRadius: '0.65rem', cursor: 'pointer', textAlign: 'left',
                            background: isPicked ? 'rgba(34,211,238,0.18)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isPicked ? '#22d3ee' : 'rgba(255,255,255,0.1)'}`, color: '#fff',
                          }}>
                          <div style={{ aspectRatio: '4 / 3', borderRadius: '0.4rem', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', marginBottom: '0.35rem' }}>
                            {it.imageUrl && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={it.imageUrl} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{it.name}</div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.65 }}>{FOOD_CATEGORY_OPTIONS.find((c) => c.value === it.category)?.label}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button type="button" onClick={() => setMode('manual')}
                  style={{ padding: '0.9rem', borderRadius: '0.85rem', cursor: 'pointer', textAlign: 'left',
                    border: `1px solid ${mode === 'manual' ? '#34d399' : 'rgba(255,255,255,0.14)'}`,
                    background: mode === 'manual' ? 'linear-gradient(135deg,rgba(52,211,153,0.18),rgba(34,211,238,0.12))' : 'rgba(255,255,255,0.04)', color: '#fff' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>🎛️ Modo Manual</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>Você escolhe cada peça. Controle total.</div>
                </button>
                <button type="button" onClick={() => setMode('ai')}
                  style={{ padding: '0.9rem', borderRadius: '0.85rem', cursor: 'pointer', textAlign: 'left',
                    border: `1px solid ${mode === 'ai' ? '#a78bfa' : 'rgba(255,255,255,0.14)'}`,
                    background: mode === 'ai' ? 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(219,39,119,0.18))' : 'rgba(255,255,255,0.04)', color: '#fff' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>✨ Assistente IA</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>A IA sugere combinações com base no seu prompt.</div>
                </button>
              </div>

              {mode === 'ai' && (
                <Field label="Prompt para a IA">
                  <textarea
                    value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: refeição leve, mediterrânea, com proteína vegetal e bebida sem álcool"
                    rows={4} style={{ ...input, resize: 'vertical' }}
                  />
                </Field>
              )}

              <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.6)' }}>
                Avance para a próxima etapa para revisar como cada peça vai aparecer no esquema.
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {slots.map((s) => {
                const it = s.foodItemId ? byId[s.foodItemId] : null;
                return (
                  <div key={s.slotId} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '3.6rem', height: '3.6rem', borderRadius: '0.55rem', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                      {it?.imageUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={it.imageUrl} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(241,245,249,0.55)' }}>{s.label}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{it?.name || 'vazio'}</div>
                      {it && <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>{FOOD_CATEGORY_OPTIONS.find((c) => c.value === it.category)?.label} · {it.cuisine}</div>}
                    </div>
                    <button type="button" onClick={() => { setCurrentStep('build'); setActiveSlot(s.slotId); }} style={btnSecondary}>Editar</button>
                  </div>
                );
              })}
            </div>
          )}

          {currentStep === 'format' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.65rem' }}>
              {LIST_FORMAT_OPTIONS.map((o) => {
                const active = listFormat === o.value;
                return (
                  <button key={o.value} type="button" onClick={() => setListFormat(o.value)}
                    style={{ padding: '0.85rem', borderRadius: '0.85rem', cursor: 'pointer', textAlign: 'left',
                      border: `1px solid ${active ? '#22d3ee' : 'rgba(255,255,255,0.14)'}`,
                      background: active ? 'linear-gradient(135deg,rgba(34,211,238,0.18),rgba(124,58,237,0.18))' : 'rgba(255,255,255,0.04)', color: '#fff' }}>
                    <div style={{ fontSize: '1.5rem' }}>{o.preview}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '0.3rem' }}>{o.label}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>{o.description}</div>
                  </button>
                );
              })}
            </div>
          )}

          {currentStep === 'background' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button type="button" onClick={() => setStudioFor('scheme')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem', borderRadius: '0.85rem', cursor: 'pointer', textAlign: 'left',
                  border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: '#fff', width: '100%' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '0.55rem', border: '1px solid rgba(255,255,255,0.18)', ...buildBackgroundStyle(background) }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(241,245,249,0.55)' }}>Fundo do esquema</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Abrir Estúdio de Fundo</div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.75 }}>Modo atual: {background.mode}</div>
                </div>
                <span style={{ fontSize: '1.4rem' }}>🎨</span>
              </button>

              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(241,245,249,0.55)', marginBottom: '0.5rem' }}>Fundo por peça</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.6rem' }}>
                  {slots.map((s) => {
                    const it = s.foodItemId ? byId[s.foodItemId] : null;
                    const cfg = pieceBackgrounds[s.slotId] || DEFAULT_BACKGROUND;
                    return (
                      <button key={s.slotId} type="button" onClick={() => setStudioFor(s.slotId)}
                        style={{ padding: 0, borderRadius: '0.7rem', overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
                          border: '1px solid rgba(255,255,255,0.14)', color: '#fff' }}>
                        <div style={{ height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', ...buildBackgroundStyle(cfg) }}>
                          {it?.imageUrl && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={it.imageUrl} alt={it.name} style={{ maxHeight: '4rem', borderRadius: '0.3rem' }} />
                          )}
                        </div>
                        <div style={{ padding: '0.5rem 0.6rem', background: 'rgba(0,0,0,0.45)' }}>
                          <div style={{ fontSize: '0.68rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{it?.name || 'vazio'}</div>
                          <div style={{ fontSize: '0.68rem', opacity: 0.7, marginTop: '0.15rem' }}>Editar fundo · {cfg.mode}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'save' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ borderRadius: '1rem', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', ...buildBackgroundStyle(background) }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: titleFont }}>{name}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{OCCASION_OPTIONS.find((o) => o.value === occasion)?.label} · {palette} · {mood}</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '0.2rem' }}>{visibility === 'public' ? 'Público' : 'Privado'} · {mode === 'ai' ? 'IA' : 'Manual'} · Formato {LIST_FORMAT_OPTIONS.find((o) => o.value === listFormat)?.label}</div>
                {description && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>{description}</div>}
              </div>

              <button type="button" onClick={handleSave} disabled={saving}
                style={{ ...btnPrimary, padding: '0.7rem 1.1rem', fontSize: '0.95rem', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Salvando...' : '💾 Salvar Esquema'}
              </button>
              {savedFeedback && <div style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>{savedFeedback}</div>}
            </div>
          )}
        </section>

        {/* Side preview */}
        <aside style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(241,245,249,0.55)' }}>Pré-visualização ao vivo</div>

          <div style={{ borderRadius: '0.9rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' }}>
            <div style={{ padding: '0.95rem 1rem', ...buildBackgroundStyle(background), color: '#fff' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: titleFont }}>{name || 'Esquema sem nome'}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{OCCASION_OPTIONS.find((o) => o.value === occasion)?.label} · {palette} · {mood}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.2rem' }}>{filledCount}/{slots.length} preenchidos · {LIST_FORMAT_OPTIONS.find((o) => o.value === listFormat)?.label}</div>
            </div>
            <div style={{ padding: '0.85rem', background: 'rgba(15,23,42,0.6)' }}>
              <MealSchemeList
                slots={slots} byId={byId} format={listFormat}
                pieceBackgrounds={pieceBackgrounds}
                activeSlotId={activeSlot}
                onSlotClick={(id) => setActiveSlot(id)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Stat label="Etapa atual" value={`${STEPS.findIndex((s) => s.id === currentStep) + 1} / ${STEPS.length}`} />
            <Stat label="Slots preenchidos" value={`${filledCount} / ${slots.length}`} />
            <Stat label="Formato" value={LIST_FORMAT_OPTIONS.find((o) => o.value === listFormat)?.label || ''} />
            <Stat label="Fundo do esquema" value={background.mode} />
          </div>
        </aside>
      </div>

      {studioFor && (
        <MealBackgroundStudioModal
          open={!!studioFor}
          title={studioFor === 'scheme' ? 'Estúdio de Fundo — Esquema' : `Estúdio de Fundo — ${slots.find((s) => s.slotId === studioFor)?.label}`}
          subtitle={studioFor === 'scheme' ? 'Cor, gradiente, padrão ou imagem para o card principal.' : 'Personalize o fundo desta peça de alimento.'}
          initialConfig={studioFor === 'scheme' ? background : (pieceBackgrounds[studioFor] || DEFAULT_BACKGROUND)}
          previewName={studioFor === 'scheme' ? name : slots.find((s) => s.slotId === studioFor)?.label}
          previewImageUrl={
            studioFor === 'scheme'
              ? undefined
              : (() => {
                  const slot = slots.find((s) => s.slotId === studioFor);
                  return slot?.foodItemId ? byId[slot.foodItemId]?.imageUrl : undefined;
                })()
          }
          onApply={(cfg) => {
            if (studioFor === 'scheme') {
              setBackground(cfg);
            } else {
              setPieceBackgrounds((prev) => ({ ...prev, [studioFor as string]: cfg }));
            }
            setStudioFor(null);
          }}
          onClose={() => setStudioFor(null)}
        />
      )}

      <style jsx>{`
        @media (max-width: 1100px) { .dine-create-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px)  { .dine-build-grid  { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
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

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: '0.4rem 0.85rem', borderRadius: '999px', fontSize: '0.78rem', cursor: 'pointer',
        border: `1px solid ${active ? '#34d399' : 'rgba(255,255,255,0.18)'}`,
        background: active ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.04)', color: '#fff' }}>
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.7rem', borderRadius: '0.55rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem' }}>
      <span style={{ color: 'rgba(241,245,249,0.6)' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

const input: CSSProperties = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.55rem',
  border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.85rem', outline: 'none',
};
const btnPrimary: CSSProperties = {
  padding: '0.5rem 1rem', borderRadius: '0.55rem', border: 'none',
  background: 'linear-gradient(135deg,#16a34a,#0891b2)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
};
const btnSecondary: CSSProperties = {
  padding: '0.5rem 0.9rem', borderRadius: '0.55rem',
  border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.82rem',
};
