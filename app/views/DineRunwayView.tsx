'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_BACKGROUND,
  OCCASION_OPTIONS,
  buildBackgroundStyle,
} from '@/app/lib/mealSchemes';
import {
  getActorEmail,
  getFeed,
  likeScheme,
  saveScheme,
  follow as followUser,
  unfollow as unfollowUser,
  getUserProfile,
  getSchemeComments,
  addSchemeComment,
  type FeedScheme,
} from '@/app/lib/social/socialClient';
import type { SchemeComment } from '@/app/lib/social/socialModel';
import { PageBanner, EmptyState } from './MyPantryView';

type Scope = 'all' | 'following';

export default function DineRunwayView() {
  const [scope, setScope] = useState<Scope>('all');
  const [schemes, setSchemes] = useState<FeedScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const actor = useMemo(() => getActorEmail(), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await getFeed(scope);
    setSchemes(list);
    setLoading(false);
  }, [scope]);

  useEffect(() => { void refresh(); }, [refresh]);

  // Carrega quem o usuário segue (para os botões "Seguir / Seguindo").
  useEffect(() => {
    if (!actor) return;
    getUserProfile(actor).then((res) => {
      if (res) setFollowingSet(new Set(res.following));
    });
  }, [actor]);

  const handleLike = async (s: FeedScheme) => {
    if (!actor) return;
    const next = !s.liked;
    setSchemes((prev) => prev.map((x) => (x.id === s.id ? { ...x, liked: next, likesCount: Math.max(0, x.likesCount + (next ? 1 : -1)) } : x)));
    const res = await likeScheme(s.id, next);
    if (res) setSchemes((prev) => prev.map((x) => (x.id === s.id ? { ...x, liked: res.liked, likesCount: res.likesCount } : x)));
  };

  const handleSave = async (s: FeedScheme) => {
    if (!actor) return;
    const next = !s.saved;
    setSchemes((prev) => prev.map((x) => (x.id === s.id ? { ...x, saved: next, savesCount: Math.max(0, x.savesCount + (next ? 1 : -1)) } : x)));
    const res = await saveScheme(s.id, next);
    if (res) setSchemes((prev) => prev.map((x) => (x.id === s.id ? { ...x, saved: res.saved, savesCount: res.savesCount } : x)));
  };

  const handleToggleFollow = async (authorEmail: string) => {
    if (!actor || authorEmail === actor) return;
    const isFollowing = followingSet.has(authorEmail);
    setFollowingSet((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(authorEmail); else next.add(authorEmail);
      return next;
    });
    if (isFollowing) await unfollowUser(authorEmail); else await followUser(authorEmail);
    if (scope === 'following') void refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Dine Runway" subtitle="O feed social com as melhores combinações da comunidade Dine." />

      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <TabBtn active={scope === 'all'} label="Tudo" onClick={() => setScope('all')} />
        <TabBtn active={scope === 'following'} label="Seguindo" onClick={() => setScope('following')} />
      </div>

      {loading ? (
        <EmptyState text="Carregando feed…" />
      ) : schemes.length === 0 ? (
        <EmptyState
          text={scope === 'following'
            ? 'Você ainda não segue ninguém com esquemas públicos. Siga usuários em "Buscar".'
            : 'Ainda não há esquemas públicos. Publique um esquema público em "Criar Esquema".'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1rem' }}>
          {schemes.map((s) => (
            <FeedCard
              key={s.id}
              scheme={s}
              actor={actor}
              isFollowing={followingSet.has(s.authorEmail)}
              onLike={() => handleLike(s)}
              onSave={() => handleSave(s)}
              onToggleFollow={() => handleToggleFollow(s.authorEmail)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedCard({
  scheme: s,
  actor,
  isFollowing,
  onLike,
  onSave,
  onToggleFollow,
}: {
  scheme: FeedScheme;
  actor: string;
  isFollowing: boolean;
  onLike: () => void;
  onSave: () => void;
  onToggleFollow: () => void;
}) {
  const bg = s.background || DEFAULT_BACKGROUND;
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<SchemeComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const filledPieces = s.pieces.filter((p) => p.name);
  const isSelf = actor && s.authorEmail === actor;

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      setLoadingComments(true);
      const res = await getSchemeComments(s.id);
      setComments(res?.comments ?? []);
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text || !actor) return;
    setCommentText('');
    const created = await addSchemeComment(s.id, text);
    if (created) setComments((prev) => [created, ...prev]);
  };

  return (
    <article style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
      <header style={{ padding: '0.95rem 1rem', ...buildBackgroundStyle(bg) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: s.titleFont || undefined }}>{s.name}</div>
            <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>
              {OCCASION_OPTIONS.find((o) => o.value === s.occasion)?.label || s.occasion} · por {s.authorDisplayName || s.authorEmail}
            </div>
          </div>
          {!isSelf && actor ? (
            <button
              type="button"
              onClick={onToggleFollow}
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
        {s.restaurantName ? (
          <div style={{ marginTop: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.55rem', borderRadius: '999px', background: 'rgba(0,0,0,0.35)', fontSize: '0.7rem', fontWeight: 700 }}>
            🍱 {s.restaurantName}
          </div>
        ) : null}
      </header>

      <div style={{ padding: '0.95rem', background: 'rgba(15,23,42,0.65)', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {/* Peças de alimento desnormalizadas */}
        {filledPieces.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(72px,1fr))', gap: '0.4rem' }}>
            {filledPieces.map((p) => (
              <div key={p.slotId} style={{ borderRadius: '0.5rem', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ aspectRatio: '1 / 1', background: 'rgba(255,255,255,0.04)' }}>
                  {p.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.imageUrl} alt={p.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div style={{ padding: '0.25rem 0.35rem', fontSize: '0.62rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>{filledPieces.map((p) => p.name).join(' · ') || 'Esquema vazio'}</div>
        {s.description ? <div style={{ fontSize: '0.76rem', opacity: 0.75 }}>{s.description}</div> : null}

        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
          <Action label={`${s.liked ? '❤️' : '🤍'} ${s.likesCount}`} active={!!s.liked} onClick={onLike} disabled={!actor} />
          <Action label={`💬 ${s.commentsCount}`} onClick={toggleComments} />
          <Action label={`${s.saved ? '🔖' : '📑'} ${s.savesCount}`} active={!!s.saved} onClick={onSave} disabled={!actor} />
        </div>

        {showComments ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.6rem' }}>
            {actor ? (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void submitComment(); }}
                  placeholder="Escreva um comentário…"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.8rem', padding: '0.4rem 0.6rem', outline: 'none' }}
                />
                <button type="button" onClick={() => void submitComment()} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#16a34a,#0891b2)', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>Enviar</button>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Faça login para comentar.</div>
            )}

            {loadingComments ? (
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Carregando comentários…</div>
            ) : comments.length === 0 ? (
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Sem comentários ainda.</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '0.4rem 0.6rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.72rem', opacity: 0.85 }}>{c.authorDisplayName || c.authorEmail}</div>
                  <div>{c.text}</div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Action({ label, onClick, active, disabled }: { label: string; onClick?: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.35rem 0.7rem', borderRadius: '0.45rem', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '0.75rem', flex: 1,
        border: `1px solid ${active ? '#34d399' : 'rgba(255,255,255,0.16)'}`,
        background: active ? 'rgba(52,211,153,0.18)' : 'transparent', color: '#fff', opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        padding: '0.5rem 1rem', borderRadius: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: active ? 700 : 500,
        border: `1px solid ${active ? '#34d399' : 'rgba(255,255,255,0.16)'}`,
        background: active ? 'rgba(52,211,153,0.18)' : 'transparent', color: '#fff',
      }}
    >
      {label}
    </button>
  );
}
