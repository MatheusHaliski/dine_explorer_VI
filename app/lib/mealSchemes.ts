import { getLS, setLS } from '@/app/lib/SafeStorage';
import type { FoodItem } from '@/app/lib/foodItems';

export type MealOccasion = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout' | 'event';

export type SchemeVisibility = 'public' | 'private';

export type SchemeMode = 'manual' | 'ai';

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

export const DEFAULT_SLOTS: { slotId: string; label: string }[] = [
  { slotId: 'main',     label: 'Prato Principal' },
  { slotId: 'side',     label: 'Acompanhamento' },
  { slotId: 'salad',    label: 'Salada / Vegetal' },
  { slotId: 'sauce',    label: 'Molho / Tempero' },
  { slotId: 'beverage', label: 'Bebida' },
  { slotId: 'dessert',  label: 'Sobremesa' },
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
