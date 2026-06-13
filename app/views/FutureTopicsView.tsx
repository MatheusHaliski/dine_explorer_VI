'use client';

import { PageBanner } from './MyPantryView';

const TOPICS = [
  { title: 'IA de Combinações Nutricionais', desc: 'Sugestões baseadas em metas e biometria.' },
  { title: 'Provador de Pratos 3D',          desc: 'Visualize o prato montado em 3D antes de pedir.' },
  { title: 'Reservas Inteligentes',          desc: 'Reserva sincronizada com cozinhas parceiras.' },
  { title: 'Roteiros Gastronômicos',         desc: 'Trilhas curadas de bairros e cidades.' },
  { title: 'Análise por Wearable',           desc: 'BioDine analisando sinais durante a refeição.' },
];

export default function FutureTopicsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageBanner title="Temas Futuros" subtitle="Funcionalidades planejadas para os próximos sprints." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
        {TOPICS.map((t) => (
          <div key={t.title} style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.1rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{t.title}</div>
            <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'rgba(241,245,249,0.7)' }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
