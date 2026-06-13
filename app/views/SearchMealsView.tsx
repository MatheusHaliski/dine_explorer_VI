'use client';

import { useEffect, useMemo, useState } from 'react';
import { OCCASION_OPTIONS } from '@/app/lib/mealSchemes';
import {
  getActorEmail,
  getFeed,
  getUserProfile,
  follow as followUser,
  unfollow as unfollowUser,
  type FeedScheme,
} from '@/app/lib/social/socialClient';
import { PageBanner, EmptyState } from './MyPantryView';

type Tab = 'users' | 'schemes';

export default function SearchMealsView() {
  const [tab, setTab] = useState<Tab>('users');
  const [query, setQuery] = useState('');
  const [schemes, setSchemes] = useState<FeedScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const actor = useMemo(() => getActorEmail(), []);

  useEffect(() => {
    getFeed('all').then((list) => { setSchemes(list); setLoading(false); });
    if (actor) getUserProfile(actor).then((res) => { if (res) setFollowingSet(new Set(res.following)); });
  }, [actor]);

  const users = useMemo(() => {
    const map: Record<string, { email: string; displayName: string; schemes: FeedScheme[] }> = {};
    schemes.forEach((s) => {
      const key = s.authorEmail || 'anônimo';
      if (!map[key]) map[key] = { email: key, displayName: s.authorDisplayName || key, schemes: [] };
      map[key].schemes.push(s);
    });
    return Object.values(map);
  }, [schemes]);

  const q = query.trim().toLowerCase();
  const filteredUsers = q ? users.filter((u) => u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)) : users;
  const filteredSchemes = q
    ? schemes.filter((s) => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
    : schemes;

  const handleToggleFollow = async (target: string) => {
    if (!actor || target === actor) return;
    const isFollowing = followingSet.has(target);
    setFollowingSet((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(target); else next.add(target);
      return next;
    });
    if (isFollowing) await unfollowUser(target); else await followUser(target);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Buscar" subtitle="Encontre usuários e seus esquemas de alimentação públicos. Siga quem você curte." />

      <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ color: '#a7f3d0' }}>⌕</span>
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === 'users' ? 'Buscar usuário (email)' : 'Buscar esquema por nome ou descrição'}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.9rem' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <TabBtn active={tab === 'users'} label="Usuários" onClick={() => setTab('users')} />
        <TabBtn active={tab === 'schemes'} label="Esquemas Públicos" onClick={() => setTab('schemes')} />
      </div>

      {loading ? (
        <EmptyState text="Carregando…" />
      ) : tab === 'users' ? (
        filteredUsers.length === 0 ? (
          <EmptyState text="Nenhum usuário público encontrado." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {filteredUsers.map((u) => {
              const isFollowing = followingSet.has(u.email);
              const isSelf = u.email === actor;
              return (
                <div key={u.email} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.6rem' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg,#22d3ee,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {u.email.slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.6)' }}>{u.schemes.length} esquema(s) público(s)</div>
                    </div>
                    {!isSelf && actor ? (
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(u.email)}
                        style={{
                          flexShrink: 0, padding: '0.3rem 0.7rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
                          border: `1px solid ${isFollowing ? 'rgba(255,255,255,0.4)' : '#34d399'}`,
                          background: isFollowing ? 'rgba(255,255,255,0.12)' : 'rgba(52,211,153,0.25)', color: '#fff',
                        }}
                      >
                        {isFollowing ? 'Seguindo' : '+ Seguir'}
                      </button>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {u.schemes.slice(0, 3).map((s) => (
                      <div key={s.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.55rem', padding: '0.5rem 0.65rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(241,245,249,0.6)' }}>{s.pieces.filter((p) => p.name).map((p) => p.name).join(' · ') || 'Esquema vazio'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        filteredSchemes.length === 0 ? (
          <EmptyState text="Nenhum esquema público encontrado." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
            {filteredSchemes.map((s) => (
              <article key={s.id} style={{ background: 'linear-gradient(135deg,#0891b2,#16a34a)', borderRadius: '1rem', padding: '1rem', color: '#fff' }}>
                <div style={{ fontSize: '1.02rem', fontWeight: 800 }}>{s.name}</div>
                <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>{OCCASION_OPTIONS.find((o) => o.value === s.occasion)?.label || s.occasion} · por {s.authorDisplayName || s.authorEmail}</div>
                {s.restaurantName ? <div style={{ marginTop: '0.3rem', fontSize: '0.72rem', fontWeight: 700 }}>🍱 {s.restaurantName}</div> : null}
                <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', opacity: 0.95 }}>{s.pieces.filter((p) => p.name).map((p) => p.name).join(' · ') || 'Esquema vazio'}</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', opacity: 0.85 }}>❤️ {s.likesCount} · 💬 {s.commentsCount} · 🔖 {s.savesCount}</div>
              </article>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        padding: '0.5rem 1rem', borderRadius: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: active ? 700 : 500,
        border: `1px solid ${active ? '#34d399' : 'rgba(255,255,255,0.16)'}`,
        background: active ? 'rgba(52,211,153,0.18)' : 'transparent',
        color: '#fff',
      }}
    >
      {label}
    </button>
  );
}
