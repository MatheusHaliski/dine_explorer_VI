import { getLS, setLS } from '@/app/lib/SafeStorage';
import type { FoodItem } from '@/app/lib/foodItems';

export type MealOccasion = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout' | 'event';

export type SchemeVisibility = 'public' | 'private';

export type SchemeMode = 'manual' | 'ai';

export type BackgroundMode = 'solid' | 'gradient' | 'pattern' | 'image';

export type BackgroundPattern = 'none' | 'dots' | 'mesh' | 'diamond' | 'waves' | 'orb';

export type GradientType = 'linear' | 'radial' | 'conic';

export interface GradientStop {
  color: string;
  position: number;
}

export interface BackgroundConfig {
  mode: BackgroundMode;
  solidColor: string;
  gradient: {
    type: GradientType;
    angle: number;
    intensity: number;
    stops: GradientStop[];
  };
  pattern: BackgroundPattern;
  imageUrl: string;
}

export type ListFormat = 'grid-2' | 'grid-3' | 'stack' | 'plate' | 'magazine' | 'row';

export interface MealSchemeSlot {
  slotId: string;
  label: string;
  foodItemId: string | null;
}

export interface MealScheme {
  id: string;
  name: string;
  description: string;
  occasion: MealOccasion;
  visibility: SchemeVisibility;
  mode: SchemeMode;
  slots: MealSchemeSlot[];
  tags: string[];
  authorEmail?: string;
  palette?: string;
  mood?: string;
  titleFont?: string;
  aiPrompt?: string;
  background?: BackgroundConfig;
  pieceBackgrounds?: Record<string, BackgroundConfig>;
  listFormat?: ListFormat;
  createdAt: number;
}

export const OCCASION_OPTIONS: { value: MealOccasion; label: string }[] = [
  { value: 'breakfast',     label: 'Café da Manhã' },
  { value: 'lunch',         label: 'Almoço' },
  { value: 'dinner',        label: 'Jantar' },
  { value: 'snack',         label: 'Lanche' },
  { value: 'pre-workout',   label: 'Pré-treino' },
  { value: 'post-workout',  label: 'Pós-treino' },
  { value: 'event',         label: 'Evento Especial' },
];

export const DEFAULT_SLOTS: { slotId: string; label: string; icon: string }[] = [
  { slotId: 'main',     label: 'Prato Principal',   icon: '🍽️' },
  { slotId: 'side',     label: 'Acompanhamento',    icon: '🥔' },
  { slotId: 'salad',    label: 'Salada / Vegetal',  icon: '🥗' },
  { slotId: 'sauce',    label: 'Molho / Tempero',   icon: '🥣' },
  { slotId: 'beverage', label: 'Bebida',            icon: '🥤' },
  { slotId: 'dessert',  label: 'Sobremesa',         icon: '🍰' },
];

export const PALETTE_OPTIONS = ['Neutro', 'Quente', 'Fresco', 'Vibrante', 'Terroso', 'Mediterrâneo', 'Tropical'];
export const MOOD_OPTIONS    = ['Confortante', 'Sofisticado', 'Casual', 'Festivo', 'Saudável', 'Indulgente', 'Rústico'];
export const TITLE_FONT_OPTIONS = [
  'Inter, Segoe UI, sans-serif',
  'Georgia, serif',
  'Trebuchet MS, sans-serif',
  'monospace',
  '"Playfair Display", serif',
];

export const LIST_FORMAT_OPTIONS: { value: ListFormat; label: string; description: string; preview: string }[] = [
  { value: 'grid-2',  label: 'Grade 2 colunas', description: 'Cartões médios em duas colunas — equilibrado.', preview: '▦▦' },
  { value: 'grid-3',  label: 'Grade 3 colunas', description: 'Cartões compactos em três colunas — denso.', preview: '▦▦▦' },
  { value: 'stack',   label: 'Pilha vertical',  description: 'Itens empilhados em ordem cronológica do prato.', preview: '☰' },
  { value: 'plate',   label: 'Prato circular',  description: 'Slots arranjados em volta de um prato central.', preview: '◯' },
  { value: 'magazine',label: 'Editorial revista',description: 'Item principal grande + complementos menores.', preview: '▮▦' },
  { value: 'row',     label: 'Linha horizontal',description: 'Carrossel horizontal com todos os itens.',  preview: '◤◤◤' },
];

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  mode: 'gradient',
  solidColor: '#0f172a',
  gradient: {
    type: 'linear',
    angle: 135,
    intensity: 100,
    stops: [
      { color: '#0f172a', position: 0 },
      { color: '#7c3aed', position: 100 },
    ],
  },
  pattern: 'orb',
  imageUrl: '',
};

export const GRADIENT_PRESETS: { label: string; config: BackgroundConfig }[] = [
  {
    label: 'Pôr-do-Sol Editorial',
    config: { mode: 'gradient', solidColor: '#7c2d12', pattern: 'orb', imageUrl: '',
      gradient: { type: 'linear', angle: 150, intensity: 105,
        stops: [{ color: '#7c2d12', position: 0 }, { color: '#f97316', position: 60 }, { color: '#fde68a', position: 100 }] } },
  },
  {
    label: 'Brilho Esmeralda',
    config: { mode: 'gradient', solidColor: '#064e3b', pattern: 'mesh', imageUrl: '',
      gradient: { type: 'radial', angle: 135, intensity: 115,
        stops: [{ color: '#6ee7b7', position: 0 }, { color: '#059669', position: 45 }, { color: '#064e3b', position: 100 }] } },
  },
  {
    label: 'Bordô Premium',
    config: { mode: 'gradient', solidColor: '#450a0a', pattern: 'diamond', imageUrl: '',
      gradient: { type: 'linear', angle: 125, intensity: 100,
        stops: [{ color: '#450a0a', position: 0 }, { color: '#7f1d1d', position: 60 }, { color: '#fda4af', position: 100 }] } },
  },
  {
    label: 'Mediterrâneo Frio',
    config: { mode: 'gradient', solidColor: '#1e3a8a', pattern: 'waves', imageUrl: '',
      gradient: { type: 'linear', angle: 120, intensity: 105,
        stops: [{ color: '#1e3a8a', position: 0 }, { color: '#0891b2', position: 60 }, { color: '#a7f3d0', position: 100 }] } },
  },
  {
    label: 'Café com Leite',
    config: { mode: 'gradient', solidColor: '#3f2d1a', pattern: 'none', imageUrl: '',
      gradient: { type: 'linear', angle: 145, intensity: 95,
        stops: [{ color: '#3f2d1a', position: 0 }, { color: '#92724e', position: 55 }, { color: '#f7eddb', position: 100 }] } },
  },
  {
    label: 'Açaí Profundo',
    config: { mode: 'gradient', solidColor: '#2e1065', pattern: 'orb', imageUrl: '',
      gradient: { type: 'radial', angle: 135, intensity: 110,
        stops: [{ color: '#2e1065', position: 0 }, { color: '#7c3aed', position: 55 }, { color: '#c4b5fd', position: 100 }] } },
  },
  {
    label: 'Noite Gastronômica',
    config: { mode: 'gradient', solidColor: '#020617', pattern: 'diamond', imageUrl: '',
      gradient: { type: 'conic', angle: 180, intensity: 100,
        stops: [{ color: '#020617', position: 0 }, { color: '#0f172a', position: 45 }, { color: '#7e22ce', position: 100 }] } },
  },
  {
    label: 'Trigo & Mel',
    config: { mode: 'gradient', solidColor: '#78350f', pattern: 'mesh', imageUrl: '',
      gradient: { type: 'linear', angle: 130, intensity: 100,
        stops: [{ color: '#78350f', position: 0 }, { color: '#f59e0b', position: 55 }, { color: '#fef3c7', position: 100 }] } },
  },
];

export const COLOR_SWATCHES = [
  '#0a0a0a', '#ffffff', '#c0c0c0', '#2e1065', '#047857',
  '#7c2d12', '#1e3a8a', '#f97316', '#fff8dc', '#16a34a',
  '#db2777', '#0891b2',
];

export const PATTERN_OPTIONS: { value: BackgroundPattern; label: string }[] = [
  { value: 'none',    label: 'Nenhum' },
  { value: 'dots',    label: 'Pontos' },
  { value: 'mesh',    label: 'Malha' },
  { value: 'diamond', label: 'Diamantes' },
  { value: 'waves',   label: 'Ondas' },
  { value: 'orb',     label: 'Esferas' },
];

const STORAGE_KEY = 'dine_meal_schemes_v1';

export function loadMealSchemes(): MealScheme[] {
  try {
    const raw = getLS(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MealScheme[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMealSchemes(schemes: MealScheme[]): void {
  setLS(STORAGE_KEY, JSON.stringify(schemes));
}

export function addMealScheme(scheme: Omit<MealScheme, 'id' | 'createdAt'>): MealScheme {
  const schemes = loadMealSchemes();
  const next: MealScheme = {
    ...scheme,
    id: `scheme_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  schemes.unshift(next);
  saveMealSchemes(schemes);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dine-schemes-change'));
  }
  return next;
}

export function deleteMealScheme(id: string): void {
  const schemes = loadMealSchemes().filter((s) => s.id !== id);
  saveMealSchemes(schemes);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dine-schemes-change'));
  }
}

export function summarizeScheme(scheme: MealScheme, byId: Record<string, FoodItem>): string {
  const filled = scheme.slots.filter((s) => s.foodItemId && byId[s.foodItemId]);
  if (filled.length === 0) return 'Esquema vazio';
  return filled.map((s) => byId[s.foodItemId as string].name).join(' · ');
}

export function buildBackgroundStyle(config: BackgroundConfig): React.CSSProperties {
  if (config.mode === 'solid') {
    return { background: config.solidColor };
  }
  if (config.mode === 'image' && config.imageUrl) {
    return {
      backgroundImage: `url(${config.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  if (config.mode === 'pattern') {
    return { background: config.solidColor, ...buildPatternStyle(config.pattern, '#ffffff') };
  }
  const stops = config.gradient.stops.map((s) => `${s.color} ${s.position}%`).join(', ');
  if (config.gradient.type === 'radial') {
    return { backgroundImage: `radial-gradient(circle, ${stops})` };
  }
  if (config.gradient.type === 'conic') {
    return { backgroundImage: `conic-gradient(from ${config.gradient.angle}deg, ${stops})` };
  }
  return { backgroundImage: `linear-gradient(${config.gradient.angle}deg, ${stops})` };
}

export function buildPatternStyle(pattern: BackgroundPattern, color: string): React.CSSProperties {
  const c = `${color}33`;
  switch (pattern) {
    case 'dots':
      return { backgroundImage: `radial-gradient(${c} 1.5px, transparent 1.5px)`, backgroundSize: '16px 16px' };
    case 'mesh':
      return {
        backgroundImage:
          `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      };
    case 'diamond':
      return {
        backgroundImage:
          `linear-gradient(45deg, ${c} 12%, transparent 12%), linear-gradient(-45deg, ${c} 12%, transparent 12%)`,
        backgroundSize: '36px 36px',
      };
    case 'waves':
      return {
        backgroundImage:
          `repeating-radial-gradient(circle at 50% 100%, ${c} 0 8px, transparent 8px 24px)`,
      };
    case 'orb':
      return {
        backgroundImage:
          `radial-gradient(circle at 18% 30%, ${c}, transparent 44%), radial-gradient(circle at 80% 70%, ${c}, transparent 38%)`,
      };
    default:
      return {};
  }
}
