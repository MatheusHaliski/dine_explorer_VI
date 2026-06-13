'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ContentRouter from './ContentRouter';
import AddFoodItemModal from '@/app/components/food/AddFoodItemModal';
import { AppRoute, NAV_ITEMS, PATH_TO_ROUTE, ROUTE_TITLES } from '@/app/lib/dining-shell';
import { getAuthSessionToken } from '@/app/lib/authSession';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
  </svg>
);
const PantryIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);
const CreateIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);
const FeedIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 14h6" />
  </svg>
);
const AIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l2 5h5l-4 3 1.5 5L12 12l-4.5 3L9 10 5 7h5z" />
  </svg>
);
const PublicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" />
  </svg>
);
const PhotosIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 18-6-6-9 9" />
  </svg>
);
const MaisonIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="10" rx="1" /><path d="M12 2l9 9H3z" />
  </svg>
);
const FutureIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" />
  </svg>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2m-4.22 7.78-1.42-1.42M5.64 5.64 4.22 4.22" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2m-4.22 7.78-1.42-1.42M5.64 5.64 4.22 4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
const SparkLogo = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
  </svg>
);

interface SidebarItem {
  route: AppRoute;
  label: string;
  icon: ReactNode;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { route: 'home',               label: 'Procurar Restaurantes', icon: <HomeIcon /> },
  { route: 'my-pantry',          label: 'Minha Despensa',        icon: <PantryIcon /> },
  { route: 'create-meal-scheme', label: 'Criar Esquema',         icon: <CreateIcon /> },
  { route: 'saved-meals',        label: 'Esquemas Salvos',       icon: <HeartIcon /> },
  { route: 'feed',               label: 'Dine Runway',           icon: <FeedIcon /> },
  { route: 'autopilot',          label: 'Autopiloto',            icon: <AIIcon /> },
  { route: 'public-items',       label: 'Itens Públicos',        icon: <PublicIcon /> },
  { route: 'search-meals',       label: 'Buscar',                icon: <SearchIcon /> },
  { route: 'my-photos',          label: 'Minhas Fotos',          icon: <PhotosIcon /> },
  { route: 'maison',             label: 'Cozinhas',              icon: <MaisonIcon /> },
  { route: 'future-topics',      label: 'Temas Futuros',         icon: <FutureIcon /> },
  { route: 'profile',            label: 'Perfil',                icon: <ProfileIcon /> },
  { route: 'profile-settings',   label: 'Configurações',         icon: <SettingsIcon /> },
];

const THEME_KEY = 'dine-shell-theme';

function readTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(THEME_KEY);
  return saved === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-dine-theme', theme);
}

export default function DiningShell() {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const currentRoute: AppRoute = PATH_TO_ROUTE[pathname]
    ?? (pathname.startsWith('/profile/')
      ? (pathname.endsWith('/settings') ? 'profile-settings' : 'profile')
      : 'home');

  const [mounted, setMounted] = useState(false);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(currentRoute);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => { setActiveRoute(currentRoute); }, [currentRoute]);

  useEffect(() => {
    setMounted(true);
    const token = getAuthSessionToken();
    if (!token) {
      router.replace('/authview');
      return;
    }
    const saved = readTheme();
    applyTheme(saved);
    setIsDark(saved === 'dark');
  }, [router]);

  const handleRoute = (route: AppRoute) => {
    setActiveRoute(route);
    const path = NAV_ITEMS.find((i) => i.route === route)?.path;
    if (path) router.push(path);
    setMobileOpen(false);
  };

  const toggleDark = () => {
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    setIsDark(!isDark);
    if (typeof window !== 'undefined') localStorage.setItem(THEME_KEY, next);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    router.replace('/authview');
  };

  const sidebarBackground = isDark
    ? 'linear-gradient(170deg, #0b3d2e 0%, #0f5c68 50%, #14855f 100%)'
    : 'linear-gradient(170deg, #ecfeff 0%, #d1fae5 50%, #ffedd5 100%)';
  const topbarBackground = isDark
    ? 'linear-gradient(90deg, rgba(16,21,48,0.95), rgba(15,92,104,0.95), rgba(20,133,95,0.95))'
    : 'linear-gradient(90deg, #f1f5f9, #ecfeff, #f7fee7)';
  const sidebarTextColor = isDark ? '#fff' : '#0b1220';
  const sidebarMutedColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.75)';
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.12)';
  const mainBackground = isDark
    ? 'linear-gradient(160deg, #0b1220 0%, #0f172a 60%, #112d3a 100%)'
    : 'linear-gradient(160deg, #f8fafc 0%, #ecfeff 60%, #f0fdf4 100%)';
  const mainColor = isDark ? '#f1f5f9' : '#0b1220';

  if (!mounted) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: mainBackground }}>
        <aside style={{ width: '16rem', background: sidebarBackground }} />
        <main style={{ flex: 1 }} />
      </div>
    );
  }

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem 1rem', color: sidebarTextColor }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${sidebarBorder}` }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: sidebarTextColor }}>
          <SparkLogo />
        </div>
        <div>
          <div style={{ color: sidebarTextColor, fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>Dine Explorer</div>
          <div style={{ color: sidebarMutedColor, fontSize: '0.75rem' }}>Seu concierge gastronômico</div>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem', overflowY: 'auto' }}>
        {SIDEBAR_ITEMS.map((item) => {
          const active = activeRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => handleRoute(item.route)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.9rem', borderRadius: '0.75rem', border: 'none',
                cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
                background: active ? 'linear-gradient(120deg,rgba(255,255,255,0.28),rgba(255,255,255,0.12))' : 'transparent',
                color: active ? sidebarTextColor : sidebarMutedColor,
                boxShadow: active ? '0 2px 12px rgba(0,0,0,0.18)' : 'none',
                borderLeft: active ? `3px solid ${sidebarTextColor}` : '3px solid transparent',
              }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: active ? 700 : 500 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: `1px solid ${sidebarBorder}`, paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <button
          onClick={toggleDark}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.9rem', borderRadius: '0.75rem', border: 'none', background: 'transparent', color: sidebarMutedColor, cursor: 'pointer', width: '100%', textAlign: 'left' }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          <span style={{ fontSize: '0.85rem' }}>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.9rem', borderRadius: '0.75rem', border: 'none', background: 'transparent', color: 'rgba(248,113,113,0.95)', cursor: 'pointer', width: '100%', textAlign: 'left' }}
        >
          <LogOutIcon />
          <span style={{ fontSize: '0.85rem' }}>Sair da Conta</span>
        </button>
      </div>
    </div>
  );

  const title = ROUTE_TITLES[activeRoute];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: mainBackground, color: mainColor }}>
      <aside
        className="dine-sidebar-desktop"
        style={{ width: '16rem', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 30, background: sidebarBackground, boxShadow: '0 18px 60px rgba(0,0,0,0.35)' }}
      >
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            style={{ width: '16rem', height: '100%', position: 'absolute', left: 0, top: 0, background: sidebarBackground, boxShadow: '0 18px 60px rgba(0,0,0,0.45)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ background: topbarBackground, padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 8px 30px rgba(0,0,0,0.20)' }}>
            <button
              onClick={() => setMobileOpen(true)}
              className="dine-hamburger-mobile"
              style={{ display: 'none', padding: '0.375rem', borderRadius: '0.5rem', border: 'none', background: 'rgba(255,255,255,0.15)', color: mainColor, cursor: 'pointer' }}
            >
              <MenuIcon />
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, flex: 1, margin: 0, color: mainColor }}>{title}</h2>
            <button
              onClick={() => setAddOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#16a34a,#0891b2)', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <span style={{ fontSize: '1.1rem' }}>+</span>
              Adicionar Item
            </button>
          </div>
        </div>

        <section style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <ContentRouter route={activeRoute} />
        </section>
      </main>

      <AddFoodItemModal open={addOpen} onClose={() => setAddOpen(false)} />

      <style jsx global>{`
        @media (max-width: 1023px) {
          .dine-sidebar-desktop { display: none !important; }
          .dine-hamburger-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
