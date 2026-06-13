export type AppRoute =
  | 'home'
  | 'my-pantry'
  | 'create-meal-scheme'
  | 'saved-meals'
  | 'feed'
  | 'autopilot'
  | 'search-meals'
  | 'public-items'
  | 'my-photos'
  | 'maison'
  | 'future-topics'
  | 'profile'
  | 'profile-settings';

export interface NavItem {
  route: AppRoute;
  label: string;
  helperText: string;
  icon: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { route: 'home',               label: 'Procurar Restaurantes', helperText: 'Catálogo de restaurantes e filtros',         icon: '⌂', path: '/home' },
  { route: 'my-pantry',          label: 'Minha Despensa',        helperText: 'Itens disponíveis, indisponíveis e favoritos', icon: '⌂', path: '/my-pantry' },
  { route: 'create-meal-scheme', label: 'Criar Esquema',         helperText: 'Monte uma refeição manualmente ou com IA',   icon: '✦', path: '/create-meal-scheme' },
  { route: 'saved-meals',        label: 'Esquemas Salvos',       helperText: 'Gerencie refeições por ocasião',             icon: '◍', path: '/saved-meals' },
  { route: 'feed',               label: 'Dine Runway',           helperText: 'Feed social da comunidade Dine',             icon: '◈', path: '/feed' },
  { route: 'autopilot',          label: 'Autopiloto',            helperText: 'Refeições diárias e plano semanal',          icon: '◎', path: '/autopilot' },
  { route: 'public-items',       label: 'Itens Públicos',        helperText: 'Descubra itens de outros usuários',          icon: '⊞', path: '/public-items' },
  { route: 'search-meals',       label: 'Buscar',                helperText: 'Encontre usuários e esquemas',               icon: '⌕', path: '/search-meals' },
  { route: 'my-photos',          label: 'Minhas Fotos',          helperText: 'Galeria de itens e refeições',               icon: '⬡', path: '/my-photos' },
  { route: 'maison',             label: 'Cozinhas',              helperText: 'Perfil de marcas e cozinhas parceiras',      icon: '◆', path: '/maison' },
  { route: 'future-topics',      label: 'Temas Futuros',         helperText: 'Funcionalidades planejadas',                 icon: '◇', path: '/future-topics' },
  { route: 'profile',            label: 'Perfil',                helperText: 'Gerencie sua conta',                         icon: '◉', path: '/profile' },
  { route: 'profile-settings',   label: 'Configurações',         helperText: 'Preferências e privacidade',                 icon: '⚙', path: '/profile/settings' },
];

export const ROUTE_TITLES: Record<AppRoute, string> = {
  home: 'Procurar Restaurantes',
  'my-pantry': 'Minha Despensa',
  'create-meal-scheme': 'Criar Esquema de Alimentação',
  'saved-meals': 'Esquemas Salvos',
  feed: 'Dine Runway',
  autopilot: 'Autopiloto',
  'search-meals': 'Buscar',
  'public-items': 'Itens Públicos',
  'my-photos': 'Minhas Fotos',
  maison: 'Cozinhas',
  'future-topics': 'Temas Futuros',
  profile: 'Perfil',
  'profile-settings': 'Configurações',
};

export const PATH_TO_ROUTE: Record<string, AppRoute> = {
  '/': 'home',
  '/home': 'home',
  '/my-pantry': 'my-pantry',
  '/create-meal-scheme': 'create-meal-scheme',
  '/saved-meals': 'saved-meals',
  '/feed': 'feed',
  '/autopilot': 'autopilot',
  '/search-meals': 'search-meals',
  '/public-items': 'public-items',
  '/my-photos': 'my-photos',
  '/maison': 'maison',
  '/future-topics': 'future-topics',
  '/profile': 'profile',
  '/profile/settings': 'profile-settings',
  '/restaurantcardspage': 'home',
};
