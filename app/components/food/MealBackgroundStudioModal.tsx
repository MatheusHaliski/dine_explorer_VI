'use client';

import { useEffect, useMemo, useState, ChangeEvent, CSSProperties } from 'react';
import {
  BackgroundConfig,
  BackgroundMode,
  BackgroundPattern,
  COLOR_SWATCHES,
  DEFAULT_BACKGROUND,
  GRADIENT_PRESETS,
  GradientStop,
  GradientType,
  PATTERN_OPTIONS,
  buildBackgroundStyle,
} from '@/app/lib/mealSchemes';

interface MealBackgroundStudioModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  initialConfig: BackgroundConfig;
  previewName?: string;
  previewImageUrl?: string;
  onApply: (config: BackgroundConfig) => void;
  onClose: () => void;
}

type Tab = BackgroundMode;

const TAB_LABELS: Record<Tab, string> = {
  solid:    'Cor sólida',
  gradient: 'Gradiente',
  pattern:  'Padrão',
  image:    'Imagem',
};
const TABS: Tab[] = ['solid', 'gradient', 'pattern', 'image'];

const GRADIENT_TYPES: { value: GradientType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic',  label: 'Cônico' },
];

export default function MealBackgroundStudioModal({
  open, title, subtitle, initialConfig, previewName, previewImageUrl, onApply, onClose,
}: MealBackgroundStudioModalProps) {
  const [config, setConfig] = useState<BackgroundConfig>(initialConfig || DEFAULT_BACKGROUND);
  const [tab, setTab] = useState<Tab>((initialConfig?.mode as Tab) || 'gradient');

  useEffect(() => {
    if (open) {
      setConfig(initialConfig || DEFAULT_BACKGROUND);
      setTab((initialConfig?.mode as Tab) || 'gradient');
    }
  }, [open, initialConfig]);

  const previewStyle = useMemo<CSSProperties>(() => buildBackgroundStyle(config), [config]);

  if (!open) return null;

  const setMode = (mode: BackgroundMode) => setConfig((prev) => ({ ...prev, mode }));

  const switchTab = (next: Tab) => {
    setTab(next);
    setMode(next);
  };

  const updateGradientStop = (idx: number, patch: Partial<GradientStop>) => {
    setConfig((prev) => ({
      ...prev,
      gradient: {
        ...prev.gradient,
        stops: prev.gradient.stops.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
      },
    }));
  };

  const addGradientStop = () => {
    setConfig((prev) => ({
      ...prev,
      gradient: {
        ...prev.gradient,
        stops: [...prev.gradient.stops, { color: '#ffffff', position: 100 }],
      },
    }));
  };

  const removeGradientStop = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      gradient: {
        ...prev.gradient,
        stops: prev.gradient.stops.filter((_, i) => i !== idx),
      },
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      setConfig((prev) => ({ ...prev, imageUrl: url, mode: 'image' }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(6px)', padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: '72rem', maxHeight: '92vh', overflowY: 'auto',
          background: 'linear-gradient(160deg, #0f172a, #134e4a, #0b3d2e)',
          color: '#f1f5f9', borderRadius: '1.4rem',
          border: '1px solid rgba(255,255,255,0.14)', padding: '1.4rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{title}</h2>
            {subtitle && <p style={{ fontSize: '0.85rem', color: 'rgba(241,245,249,0.7)', margin: '0.25rem 0 0 0' }}>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} style={btnSecondary}>Fechar</button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 22rem', gap: '1.25rem' }} className="dine-studio-grid">
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <nav style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {TABS.map((t) => (
                <button
                  key={t} type="button" onClick={() => switchTab(t)}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '0.6rem', cursor: 'pointer', fontSize: '0.85rem',
                    fontWeight: tab === t ? 700 : 500,
                    border: `1px solid ${tab === t ? '#34d399' : 'rgba(255,255,255,0.16)'}`,
                    background: tab === t ? 'rgba(52,211,153,0.18)' : 'transparent', color: '#fff',
                  }}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </nav>

            {tab === 'solid' && (
              <div style={panel}>
                <PanelTitle>Cor sólida</PanelTitle>
                <input
                  type="color" value={config.solidColor}
                  onChange={(e) => setConfig((p) => ({ ...p, mode: 'solid', solidColor: e.target.value }))}
                  style={{ width: '100%', height: '3rem', borderRadius: '0.55rem', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent' }}
                />
                <input
                  type="text" value={config.solidColor}
                  onChange={(e) => setConfig((p) => ({ ...p, mode: 'solid', solidColor: e.target.value }))}
                  style={{ ...input, marginTop: '0.5rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.4rem', marginTop: '0.6rem' }}>
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c} type="button"
                      onClick={() => setConfig((p) => ({ ...p, mode: 'solid', solidColor: c }))}
                      style={{ height: '2rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.18)', background: c, cursor: 'pointer' }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}

            {tab === 'gradient' && (
              <div style={panel}>
                <PanelTitle>Gradiente</PanelTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <Field label="Tipo">
                    <select
                      value={config.gradient.type}
                      onChange={(e) => setConfig((p) => ({ ...p, mode: 'gradient', gradient: { ...p.gradient, type: e.target.value as GradientType } }))}
                      style={input}
                    >
                      {GRADIENT_TYPES.map((g) => <option key={g.value} value={g.value} style={{ color: '#000' }}>{g.label}</option>)}
                    </select>
                  </Field>
                  <Field label={`Ângulo (${config.gradient.angle}°)`}>
                    <input
                      type="range" min={0} max={360}
                      value={config.gradient.angle}
                      onChange={(e) => setConfig((p) => ({ ...p, mode: 'gradient', gradient: { ...p.gradient, angle: Number(e.target.value) } }))}
                    />
                  </Field>
                </div>

                <div style={{ marginTop: '0.7rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(241,245,249,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Stops</div>
                  {config.gradient.stops.map((s, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3rem 1fr 5rem 2rem', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <input type="color" value={s.color} onChange={(e) => updateGradientStop(idx, { color: e.target.value })}
                        style={{ width: '100%', height: '2.3rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent' }}
                      />
                      <input type="text" value={s.color} onChange={(e) => updateGradientStop(idx, { color: e.target.value })} style={input} />
                      <input type="number" min={0} max={100} value={s.position}
                        onChange={(e) => updateGradientStop(idx, { position: Number(e.target.value) })}
                        style={input}
                      />
                      <button type="button" onClick={() => removeGradientStop(idx)} disabled={config.gradient.stops.length <= 2}
                        style={{ ...btnSecondary, padding: '0.35rem 0.45rem' }}>×</button>
                    </div>
                  ))}
                  <button type="button" onClick={addGradientStop} style={{ ...btnSecondary, marginTop: '0.3rem' }}>+ Adicionar stop</button>
                </div>

                <div style={{ marginTop: '0.9rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(241,245,249,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Presets</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.5rem' }}>
                    {GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.label} type="button"
                        onClick={() => setConfig({ ...p.config, mode: 'gradient' })}
                        style={{ padding: 0, borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer', overflow: 'hidden', textAlign: 'left' }}
                      >
                        <div style={{ height: '3rem', ...buildBackgroundStyle(p.config) }} />
                        <div style={{ padding: '0.4rem 0.55rem', fontSize: '0.72rem', background: 'rgba(0,0,0,0.4)', color: '#fff' }}>{p.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'pattern' && (
              <div style={panel}>
                <PanelTitle>Padrão geométrico</PanelTitle>
                <Field label="Cor base">
                  <input type="color" value={config.solidColor}
                    onChange={(e) => setConfig((p) => ({ ...p, mode: 'pattern', solidColor: e.target.value }))}
                    style={{ width: '100%', height: '2.6rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent' }} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '0.5rem', marginTop: '0.6rem' }}>
                  {PATTERN_OPTIONS.map((p) => {
                    const active = config.pattern === p.value && config.mode === 'pattern';
                    return (
                      <button
                        key={p.value} type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, mode: 'pattern', pattern: p.value as BackgroundPattern }))}
                        style={{ padding: 0, borderRadius: '0.55rem', overflow: 'hidden', cursor: 'pointer',
                          border: `1px solid ${active ? '#22d3ee' : 'rgba(255,255,255,0.14)'}` }}
                      >
                        <div style={{ height: '3rem', background: config.solidColor, ...buildBackgroundStyle({ ...config, mode: 'pattern', pattern: p.value }) }} />
                        <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.72rem', background: 'rgba(0,0,0,0.45)', color: '#fff' }}>{p.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === 'image' && (
              <div style={panel}>
                <PanelTitle>Imagem de fundo</PanelTitle>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...input, padding: '0.4rem' }} />
                <input
                  type="text" placeholder="ou cole uma URL"
                  value={config.imageUrl}
                  onChange={(e) => setConfig((p) => ({ ...p, mode: 'image', imageUrl: e.target.value }))}
                  style={{ ...input, marginTop: '0.4rem' }}
                />
                {config.imageUrl && (
                  <div style={{ marginTop: '0.6rem', borderRadius: '0.55rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={config.imageUrl} alt="prévia" style={{ width: '100%', maxHeight: '14rem', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            )}
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(241,245,249,0.6)', textTransform: 'uppercase' }}>Pré-visualização</div>
            <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', minHeight: '14rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', ...previewStyle }}>
              {previewImageUrl && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewImageUrl} alt={previewName} style={{ maxHeight: '8rem', borderRadius: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }} />
                </div>
              )}
              <div style={{ padding: '0.85rem', background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{previewName || 'Pré-visualização'}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)' }}>{TAB_LABELS[tab]}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={btnSecondary}>Cancelar</button>
              <button type="button" onClick={() => onApply(config)} style={btnPrimary}>Aplicar fundo</button>
            </div>
          </aside>
        </div>

        <style jsx>{`
          @media (max-width: 960px) { .dine-studio-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    </div>
  );
}

const input: CSSProperties = {
  width: '100%', padding: '0.5rem 0.7rem', borderRadius: '0.5rem',
  border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.85rem', outline: 'none',
};
const panel: CSSProperties = {
  background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '0.85rem', padding: '0.9rem',
};
const btnPrimary: CSSProperties = {
  padding: '0.55rem 1.1rem', borderRadius: '0.55rem', border: 'none',
  background: 'linear-gradient(135deg,#16a34a,#0891b2)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
};
const btnSecondary: CSSProperties = {
  padding: '0.45rem 0.85rem', borderRadius: '0.55rem',
  border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.82rem',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(241,245,249,0.6)' }}>{label}</span>
      {children}
    </label>
  );
}
function PanelTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.55rem' }}>{children}</div>;
}
