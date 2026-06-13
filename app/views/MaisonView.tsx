'use client';

import {
  FILTER_GLOW_BAR,
  FILTER_GLOW_LINE,
  GLOW_BAR,
  GLOW_LINE,
} from '@/app/lib/uiToken';

type KitchenCampaign = {
  name: string;
  cuisine: string;
  window: string;
  schemeHook: string;
  action: string;
  match: string;
  image: string;
  accent: string;
};

const KITCHEN_CAMPAIGNS: KitchenCampaign[] = [
  {
    name: 'Outback Steakhouse',
    cuisine: 'Cortes premium · Argentine grill',
    window: 'Premium drop · 72h',
    schemeHook: 'Esquemas ricos em proteina viram uma trilha de cortes, acompanhamentos e reserva com horario sugerido.',
    action: 'Ativar mesa proteica',
    match: '91% com seus esquemas salvos',
    image: '/60E7FCD8-D92C-49FF-A9D9-53EFF9737671Copia(2).png',
    accent: '#f97316',
  },
  {
    name: 'Sushi Yassu',
    cuisine: 'Cozinha Japonesa',
    window: 'Menu limitado · jantar',
    schemeHook: 'Pecas leves da despensa conectam combinados, restricoes e horarios de menor lotacao.',
    action: 'Montar omakase pessoal',
    match: '87% com itens favoritos',
    image: '/B269115E-1246-4965-A561-43E3603A146B_1_105_c.jpeg',
    accent: '#06b6d4',
  },
  {
    name: 'Verde Cozinha',
    cuisine: 'Vegana e plant-based',
    window: 'Clube sazonal · 5 dias',
    schemeHook: 'Esquemas plant-based geram packs de refeicoes, reposicao de despensa e sugestao de pedido recorrente.',
    action: 'Sincronizar plano verde',
    match: '94% com rotina semanal',
    image: '/C38E8955-A618-43EE-931F-71E84DC14161.png',
    accent: '#22c55e',
  },
  {
    name: 'Casa Bauducco',
    cuisine: 'Padaria & Cafe',
    window: 'Oferta relampago · manha',
    schemeHook: 'Cafes da manha salvos viram combos com retirada rapida e sugestao de bebida por ocasiao.',
    action: 'Reservar cafe da semana',
    match: '82% com ocasioes recentes',
    image: '/9E143867-75FF-4C66-818F-E84B5465ADBC.png',
    accent: '#db2777',
  },
];

const FLOW_STEPS = [
  'Esquema de alimentacao',
  'Pecas de alimento',
  'Cozinha parceira',
  'Oferta acionavel',
];

export default function MaisonView() {
  return (
    <div className="relative font-sharetech text-white">
      <header
        className={[
          'relative flex flex-col gap-5 px-6 py-5',
          'rounded-3xl border border-white/25',
          GLOW_BAR,
          GLOW_LINE,
        ].join(' ')}
      >
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/30 via-white/0 to-black/0 opacity-40" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
              Cozinhas Premium
            </div>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">
              Cozinhas conectadas aos seus esquemas
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
              A aba deixa de ser um perfil social estatico: cada cozinha usa seus esquemas e pecas de alimento para abrir menus por tempo limitado, reservas inteligentes e combos realmente compraveis.
            </p>
          </div>

          <div className="rounded-2xl border-4 border-amber-300 bg-white px-4 py-3 text-right text-slate-950 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
              Live concept
            </div>
            <div className="mt-1 text-lg font-semibold">Scheme Commerce</div>
            <div className="text-xs text-slate-600">premium · limitado · contextual</div>
          </div>
        </div>

        <section
          className={[
            'relative z-10 rounded-3xl px-5 py-4',
            FILTER_GLOW_BAR,
            'border border-white/18',
            FILTER_GLOW_LINE,
          ].join(' ')}
        >
          <div className="grid gap-3 md:grid-cols-4">
            {FLOW_STEPS.map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/16 bg-white/10 px-4 py-3">
                <div className="text-xs font-semibold text-cyan-100/75">0{index + 1}</div>
                <div className="mt-1 text-sm font-semibold text-white">{step}</div>
              </div>
            ))}
          </div>
        </section>
      </header>

      <section className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 justify-items-center">
        {KITCHEN_CAMPAIGNS.map((kitchen) => (
          <article
            key={kitchen.name}
            className={[
              'group relative w-full max-w-[340px] overflow-hidden rounded-3xl',
              'border-4 border-yellow-200',
              'shadow-[0_0_0_1px_rgba(249,115,22,0.55),0_18px_60px_rgba(249,115,22,0.36)]',
              GLOW_BAR,
              'transition duration-200',
            ].join(' ')}
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18),rgba(255,255,255,0)_45%)]" />

            <div className="relative">
              <img
                src={kitchen.image}
                alt={kitchen.name}
                loading="lazy"
                decoding="async"
                className="block h-44 w-full rounded-t-3xl object-cover opacity-95"
              />
              <div className="absolute left-3 top-3 rounded-xl border border-white/30 bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
                {kitchen.window}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
            </div>

            <div className="relative p-4">
              <div className="rounded-2xl border-4 border-yellow-200 bg-white px-4 py-3 text-center text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <div
                  className="mx-auto mb-3 h-1.5 w-16 rounded-full"
                  style={{ background: kitchen.accent }}
                />
                <h2 className="text-lg font-semibold leading-tight">{kitchen.name}</h2>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-black/60">
                  {kitchen.cuisine}
                </div>

                <div className="my-3 h-px w-full bg-black/15" />

                <p className="text-sm leading-5 text-black">{kitchen.schemeHook}</p>

                <div className="mt-3 rounded-xl border border-black/10 bg-slate-50 px-3 py-2 text-xs font-semibold text-black/70">
                  {kitchen.match}
                </div>

                <button
                  type="button"
                  className="mt-3 h-10 w-full rounded-xl border border-black/10 bg-black px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  {kitchen.action}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
