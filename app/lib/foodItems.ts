import { getLS, setLS } from '@/app/lib/SafeStorage';

export type FoodStatus = 'available' | 'unavailable' | 'favorite' | 'for-sale';

export type FoodCategory =
  | 'protein'
  | 'carb'
  | 'vegetable'
  | 'fruit'
  | 'sauce'
  | 'dairy'
  | 'beverage'
  | 'dessert'
  | 'snack'
  | 'other';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  cuisine: string;
  description: string;
  brand: string;
  imageUrl: string;
  status: FoodStatus;
  tags: string[];
  calories?: number;
  createdAt: number;
}

export const FOOD_CATEGORY_OPTIONS: { value: FoodCategory; label: string }[] = [
  { value: 'protein',   label: 'Proteína' },
  { value: 'carb',      label: 'Carboidrato' },
  { value: 'vegetable', label: 'Vegetal' },
  { value: 'fruit',     label: 'Fruta' },
  { value: 'sauce',     label: 'Molho/Tempero' },
  { value: 'dairy',     label: 'Laticínio' },
  { value: 'beverage',  label: 'Bebida' },
  { value: 'dessert',   label: 'Sobremesa' },
  { value: 'snack',     label: 'Snack' },
  { value: 'other',     label: 'Outro' },
];

export const CUISINE_OPTIONS = [
  'Brasileira', 'Italiana', 'Japonesa', 'Mexicana', 'Árabe',
  'Argentina', 'Vegana', 'Frutos do Mar', 'Mediterrânea', 'Fast Food',
  'Doces/Confeitaria', 'Padaria/Café', 'Bar', 'Chicken Shop', 'Sandwich Shop',
  'Açaí & Bowls', 'Barbeque',
];

export const DIET_TAG_OPTIONS = [
  'Vegano', 'Vegetariano', 'Sem Glúten', 'Low Carb', 'Cetogênica',
  'Sem Lactose', 'Orgânico', 'Light', 'Proteico', 'Picante', 'Doce', 'Salgado',
];

const STORAGE_KEY = 'dine_pantry_items_v1';

export function loadFoodItems(): FoodItem[] {
  try {
    const raw = getLS(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FoodItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFoodItems(items: FoodItem[]): void {
  setLS(STORAGE_KEY, JSON.stringify(items));
}

export function addFoodItem(item: Omit<FoodItem, 'id' | 'createdAt'>): FoodItem {
  const items = loadFoodItems();
  const next: FoodItem = {
    ...item,
    id: `food_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  items.unshift(next);
  saveFoodItems(items);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dine-pantry-change'));
  }
  return next;
}

export function updateFoodItemStatus(id: string, status: FoodStatus): void {
  const items = loadFoodItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], status };
  saveFoodItems(items);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dine-pantry-change'));
  }
}

export function deleteFoodItem(id: string): void {
  const items = loadFoodItems().filter((i) => i.id !== id);
  saveFoodItems(items);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dine-pantry-change'));
  }
}
