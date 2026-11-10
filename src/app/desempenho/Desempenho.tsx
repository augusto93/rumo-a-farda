"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { SUBJECTS, pct } from "@/lib/catalog";
import { Icon } from "@/components/Icons";
import { MobileTop } from "@/components/Shell";
import { BreakRow } from "@/components/ui";
import { History } from "@/components/History";

export default function Desempenho() {
  const { state, reset } = useStore();
  const [confirm, setConfirm] = useState(false);
  const H = state.history.slice(0, 12).reverse();
  const W = 600, Hh = 180, pad = 30;
  const pts = H.map((h, i) => [
    pad + (H.length === 1 ? (W - 2 * pad) / 2 : (i * (W - 2 * pad)) / (H.length - 1)),
    Hh - pad - (pct(h.c, h.n) / 100) * (Hh - 2 * pad)
  ]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = pts.length ? `${line} L${pts[pts.length - 1][0].toFixed(1)} ${Hh - pad} L${pts[0][0].toFixed(1)} ${Hh - pad} Z` : "";
  const ranked = SUBJECTS.map(s => {
    let c = 0, t = 0;
    state.history.forEach(h => { const b = h.by?.[s.id]; if (b) { c += b[0]; t += b[1]; } });
    return { s, c, t };
  }).filter(x => x.t).sort((a, b) => a.c / a.t - b.c / b.t);

  return (
    <>
      <MobileTop title="Desempenho" />
      <div><div className="eyebrow">Acompanhamento</div><h1>Seu desempenho</h1></div>
      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="sec-head"><h2>Evolução nos simulados</h2><span className="muted" style={{ fontSize: ".85rem" }}>últimos {H.length}</span></div>
        {H.length ? (
          <div style={{ overflowX: "auto" }}>
            <svg viewBox={`0 0 ${W} ${Hh}`} style={{ width: "100%", minWidth: 320, height: "auto" }} role="img" aria-label="Percentual de acerto por simulado">
              {[0, 50, 100].map(v => {
                const y = Hh - pad - (v / 100) * (Hh - 2 * pad);
                return <g key={v}><line x1={pad} x2={W - pad} y1={y} y2={y} stroke="var(--line)" strokeDasharray={v ? "3 4" : undefined} /><text x={pad - 6} y={y + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)">{v}%</text></g>;
              })}
              <path d={area} fill="var(--accent-soft)" />
              <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
              {pts.map((p, i) => {
                const last = i === pts.length - 1;
                return <circle key={i} cx={p[0]} cy={p[1]} r={last ? 5.5 : 3.5} fill={last ? "var(--accent)" : "var(--surface)"} stroke="var(--accent)" strokeWidth="2" />;
              })}
              <text x={pts[pts.length - 1][0]} y={pts[pts.length - 1][1] - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">
                {pct(H[H.length - 1].c, H[H.length - 1].n)}%
              </text>
            </svg>
          </div>
        ) : (
          <div className="empty"><b>Sem dados ainda</b><span>Faça um simulado para ver sua evolução.</span><Link className="btn primary" href="/simulado"><Icon.shuffle />Gerar simulado</Link></div>
        )}
      </section>
      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="sec-head"><h2>Acerto por matéria</h2><span className="muted" style={{ fontSize: ".85rem" }}>da mais fraca para a mais forte</span></div>
        {ranked.length ? (
          <>
            <div className="breakdown">{ranked.map(x => <BreakRow key={x.s.id} s={x.s.id} c={x.c} t={x.t} showPct />)}</div>
            <p className="muted" style={{ fontSize: ".92rem" }}>Sugestão: reforce <b>{ranked[0].s.name}</b> — {ranked[0].c} acertos em {ranked[0].t} questões.</p>
          </>
        ) : <p className="muted">Aparece depois do primeiro simulado.</p>}
      </section>
      <History max={100} />
      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h3>Zerar progresso</h3>
        <p className="muted" style={{ fontSize: ".92rem" }}>Apaga aulas concluídas e histórico de simulados.</p>
        <div className="row">
          {confirm ? (
            <>
              <span><b>Tem certeza?</b> Isso não pode ser desfeito.</span>
              <button type="button" className="btn" style={{ borderColor: "var(--bad)", color: "var(--bad)" }} onClick={() => { reset(); setConfirm(false); }}>Sim, zerar</button>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>Cancelar</button>
            </>
          ) : <button type="button" className="btn" onClick={() => setConfirm(true)}>Zerar tudo</button>}
        </div>
      </section>
    </>
  );
}
