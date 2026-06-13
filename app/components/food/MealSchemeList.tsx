'use client';

import { CSSProperties } from 'react';
import type { FoodItem } from '@/app/lib/foodItems';
import type {
  BackgroundConfig,
  ListFormat,
  MealSchemeSlot,
} from '@/app/lib/mealSchemes';
import { buildBackgroundStyle, DEFAULT_BACKGROUND } from '@/app/lib/mealSchemes';

interface MealSchemeListProps {
  slots: MealSchemeSlot[];
  byId: Record<string, FoodItem>;
  format: ListFormat;
  pieceBackgrounds?: Record<string, BackgroundConfig>;
  onSlotClick?: (slotId: string) => void;
  activeSlotId?: string;
  compact?: boolean;
}

export default function MealSchemeList({
  slots, byId, format, pieceBackgrounds, onSlotClick, activeSlotId, compact,
}: MealSchemeListProps) {
  if (format === 'plate') return <PlateLayout {...{ slots, byId, pieceBackgrounds, onSlotClick, activeSlotId }} />;
  if (format === 'stack') return <StackLayout {...{ slots, byId, pieceBackgrounds, onSlotClick, activeSlotId, compact }} />;
  if (format === 'magazine') return <MagazineLayout {...{ slots, byId, pieceBackgrounds, onSlotClick, activeSlotId }} />;
  if (format === 'row') return <RowLayout {...{ slots, byId, pieceBackgrounds, onSlotClick, activeSlotId }} />;

  const columns = format === 'grid-3' ? 3 : 2;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},1fr)`, gap: '0.7rem' }}>
      {slots.map((s) => (
        <SlotCard
          key={s.slotId} slot={s}
          item={s.foodItemId ? byId[s.foodItemId] : null}
          bg={pieceBackgrounds?.[s.slotId] || DEFAULT_BACKGROUND}
          active={activeSlotId === s.slotId}
          onClick={() => onSlotClick?.(s.slotId)}
        />
      ))}
    </div>
  );
}

function StackLayout({ slots, byId, pieceBackgrounds, onSlotClick, activeSlotId, compact }: Omit<MealSchemeListProps, 'format'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      {slots.map((s, idx) => {
        const item = s.foodItemId ? byId[s.foodItemId] : null;
        const bg = pieceBackgrounds?.[s.slotId] || DEFAULT_BACKGROUND;
        const active = activeSlotId === s.slotId;
        return (
          <button
            key={s.slotId} type="button" onClick={() => onSlotClick?.(s.slotId)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.6rem 0.75rem', borderRadius: '0.7rem', cursor: 'pointer', textAlign: 'left',
              border: `1px solid ${active ? '#22d3ee' : 'rgba(255,255,255,0.12)'}`,
              ...buildBackgroundStyle(bg),
              color: '#fff',
            }}
          >
            <div style={{ width: '1.6rem', height: '1.6rem', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{idx + 1}</div>
            <div style={{ width: compact ? '2.6rem' : '3.4rem', height: compact ? '2.6rem' : '3.4rem', borderRadius: '0.45rem', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
              {item?.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{s.label}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item?.name || 'vazio'}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PlateLayout({ slots, byId, pieceBackgrounds, onSlotClick, activeSlotId }: Omit<MealSchemeListProps, 'format'>) {
  const radius = 130;
  const center = 160;
  const angleStep = (2 * Math.PI) / slots.length;
  return (
    <div style={{ position: 'relative', width: 320, height: 320, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: '20%', borderRadius: '50%', background: 'radial-gradient(circle, #f8fafc, #cbd5e1)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', inset: '28%', borderRadius: '50%', border: '2px dashed rgba(15,23,42,0.25)' }} />
      {slots.map((s, idx) => {
        const angle = idx * angleStep - Math.PI / 2;
        const x = center + radius * Math.cos(angle) - 36;
        const y = center + radius * Math.sin(angle) - 36;
        const item = s.foodItemId ? byId[s.foodItemId] : null;
        const bg = pieceBackgrounds?.[s.slotId] || DEFAULT_BACKGROUND;
        const active = activeSlotId === s.slotId;
        return (
          <button
            key={s.slotId} type="button" onClick={() => onSlotClick?.(s.slotId)}
            title={`${s.label}: ${item?.name || 'vazio'}`}
            style={{
              position: 'absolute', left: x, top: y, width: 72, height: 72,
              borderRadius: '50%', overflow: 'hidden', cursor: 'pointer',
              border: `2px solid ${active ? '#22d3ee' : 'rgba(255,255,255,0.5)'}`,
              boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
              ...buildBackgroundStyle(bg),
              padding: 0,
            }}
          >
            {item?.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '0.2rem' }}>{s.label}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MagazineLayout({ slots, byId, pieceBackgrounds, onSlotClick, activeSlotId }: Omit<MealSchemeListProps, 'format'>) {
  const [hero, ...rest] = slots;
  if (!hero) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '0.7rem' }}>
      <SlotCard
        slot={hero} item={hero.foodItemId ? byId[hero.foodItemId] : null}
        bg={pieceBackgrounds?.[hero.slotId] || DEFAULT_BACKGROUND}
        active={activeSlotId === hero.slotId}
        onClick={() => onSlotClick?.(hero.slotId)}
        large
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {rest.map((s) => (
          <SlotCard
            key={s.slotId} slot={s}
            item={s.foodItemId ? byId[s.foodItemId] : null}
            bg={pieceBackgrounds?.[s.slotId] || DEFAULT_BACKGROUND}
            active={activeSlotId === s.slotId}
            onClick={() => onSlotClick?.(s.slotId)}
            compact
          />
        ))}
      </div>
    </div>
  );
}

function RowLayout({ slots, byId, pieceBackgrounds, onSlotClick, activeSlotId }: Omit<MealSchemeListProps, 'format'>) {
  return (
    <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
      {slots.map((s) => (
        <div key={s.slotId} style={{ minWidth: 160 }}>
          <SlotCard
            slot={s} item={s.foodItemId ? byId[s.foodItemId] : null}
            bg={pieceBackgrounds?.[s.slotId] || DEFAULT_BACKGROUND}
            active={activeSlotId === s.slotId}
            onClick={() => onSlotClick?.(s.slotId)}
          />
        </div>
      ))}
    </div>
  );
}

function SlotCard({
  slot, item, bg, active, onClick, large, compact,
}: {
  slot: MealSchemeSlot;
  item: FoodItem | null;
  bg: BackgroundConfig;
  active?: boolean;
  onClick?: () => void;
  large?: boolean;
  compact?: boolean;
}) {
  const aspect = large ? '4 / 5' : compact ? '4 / 2' : '4 / 3';
  return (
    <button
      type="button" onClick={onClick}
      style={{
        width: '100%', padding: 0, borderRadius: '0.7rem', overflow: 'hidden',
        cursor: 'pointer', textAlign: 'left',
        border: `1px solid ${active ? '#22d3ee' : 'rgba(255,255,255,0.12)'}`,
        ...buildBackgroundStyle(bg),
        color: '#fff',
      } as CSSProperties}
    >
      <div style={{ aspectRatio: aspect, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {item?.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>vazio</span>
        )}
      </div>
      <div style={{ padding: '0.5rem 0.6rem', background: 'rgba(0,0,0,0.45)' }}>
        <div style={{ fontSize: '0.68rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{slot.label}</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item?.name || '—'}</div>
      </div>
    </button>
  );
}
