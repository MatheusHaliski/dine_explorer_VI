'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import {
  addFoodItem,
  FOOD_CATEGORY_OPTIONS,
  CUISINE_OPTIONS,
  DIET_TAG_OPTIONS,
  type FoodCategory,
  type FoodStatus,
} from '@/app/lib/foodItems';

interface AddFoodItemModalProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: FoodStatus; label: string }[] = [
  { value: 'available', label: 'Disponível' },
  { value: 'unavailable', label: 'Indisponível' },
  { value: 'favorite', label: 'Favorito' },
  { value: 'for-sale', label: 'Para vender' },
];

export default function AddFoodItemModal({ open, onClose }: AddFoodItemModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('protein');
  const [cuisine, setCuisine] = useState<string>(CUISINE_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [calories, setCalories] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<FoodStatus>('available');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
      setCategory('protein');
      setCuisine(CUISINE_OPTIONS[0]);
      setDescription('');
      setBrand('');
      setCalories('');
      setImageUrl('');
      setStatus('available');
      setSelectedTags([]);
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) {
      setError('Dê um nome ao item.');
      return;
    }
    setSubmitting(true);
    try {
      addFoodItem({
        name: name.trim(),
        category,
        cuisine,
        description: description.trim(),
        brand: brand.trim(),
        imageUrl: imageUrl.trim(),
        status,
        tags: selectedTags,
        calories: calories ? Number(calories) : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Falha ao salvar o item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2, 6, 23, 0.78)', backdropFilter: 'blur(6px)', padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: '60rem', maxHeight: '92vh', overflowY: 'auto',
          borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.14)',
          background: 'linear-gradient(160deg, #0f172a, #134e4a, #0b3d2e)',
          color: '#f1f5f9', padding: '1.5rem',
          boxShadow: '0 20px 80px rgba(0,0,0,0.55)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Adicionar Item de Alimento</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(241,245,249,0.7)', margin: '0.25rem 0 0 0' }}>
              Cadastre uma peça de alimento que compõe uma refeição.
            </p>
          </div>
          <button
            type="button" onClick={onClose}
            style={{ padding: '0.4rem 0.85rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Fechar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ aspectRatio: '4 / 5', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="prévia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'rgba(241,245,249,0.55)', fontSize: '0.85rem', textAlign: 'center', padding: '0 1rem' }}>Adicione uma foto do alimento</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ marginTop: '0.6rem', width: '100%', padding: '0.6rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              {imageUrl ? 'Trocar foto' : 'Carregar foto'}
            </button>
            <input
              type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="ou cole uma URL"
              style={{ marginTop: '0.5rem', width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.55rem', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.8rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Field label="Nome do item">
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Filé Mignon Grelhado"
                style={inputStyle}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <Field label="Categoria">
                <select value={category} onChange={(e) => setCategory(e.target.value as FoodCategory)} style={inputStyle}>
                  {FOOD_CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} style={{ color: '#000' }}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Cozinha / Estilo">
                <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} style={inputStyle}>
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c} style={{ color: '#000' }}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <Field label="Marca / Restaurante (opcional)">
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex: Outback" style={inputStyle} />
              </Field>
              <Field label="Calorias (opcional)">
                <input
                  type="number" value={calories} onChange={(e) => setCalories(e.target.value)}
                  placeholder="kcal"
                  style={inputStyle}
                />
              </Field>
            </div>

            <Field label="Status">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value} type="button" onClick={() => setStatus(s.value)}
                    style={{
                      padding: '0.4rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem',
                      border: `1px solid ${status === s.value ? '#34d399' : 'rgba(255,255,255,0.18)'}`,
                      background: status === s.value ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.04)',
                      color: '#fff', cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Descrição (opcional)">
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Notas, preparo, ingredientes..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '4.5rem' }}
              />
            </Field>

            <Field label="Tags / Dieta">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {DIET_TAG_OPTIONS.map((t) => {
                  const active = selectedTags.includes(t);
                  return (
                    <button
                      key={t} type="button" onClick={() => toggleTag(t)}
                      style={{
                        padding: '0.35rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem',
                        border: `1px solid ${active ? '#22d3ee' : 'rgba(255,255,255,0.16)'}`,
                        background: active ? 'rgba(34,211,238,0.18)' : 'rgba(255,255,255,0.04)',
                        color: '#fff', cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.45)', color: '#fecaca', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
          <button
            type="button" onClick={onClose} disabled={submitting}
            style={{ padding: '0.6rem 1.1rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.88rem' }}
          >
            Cancelar
          </button>
          <button
            type="button" onClick={handleSubmit} disabled={submitting}
            style={{ padding: '0.6rem 1.4rem', borderRadius: '0.6rem', border: 'none', background: 'linear-gradient(135deg,#16a34a,#0891b2)', color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Salvando...' : 'Adicionar Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: '0.6rem',
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: '0.88rem',
  outline: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(241,245,249,0.6)' }}>{label}</span>
      {children}
    </label>
  );
}
