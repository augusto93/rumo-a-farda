"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { LESSONS, SUBJECTS, TARGETS, LES, SUBJ, lessonsOf, qsOf, pct, fmtDate } from "@/lib/catalog";
import { Icon } from "@/components/Icons";
import { MobileTop } from "@/components/Shell";
import { Bar } from "@/components/ui";
import type { SubjectId, TargetId } from "@/lib/types";

export default function Home() {
  const { state, update } = useStore();
  const doneL = Object.keys(state.done).filter(k => LES[k]).length;
  const last = state.history[0];
  const allC = state.history.reduce((a, h) => a + h.c, 0);
  const allT = state.history.reduce((a, h) => a + h.n, 0);
  const next = LESSONS.find(l => !state.done[l.id]);
  const t = TARGETS[state.target];
  const subjStats = (s: SubjectId) => {
    let c = 0, n = 0;
    state.history.forEach(h => { const b = h.by?.[s]; if (b) { c += b[0]; n += b[1]; } });
    return { c, n };
  };

  return (
    <>
      <MobileTop title="Rumo à Farda" />
      <section className="hero">
        <div className="hero-main">
          <svg className="stripes" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#fff" strokeWidth="6"><path d="M10 30 50 10l40 20" /><path d="M10 50 50 30l40 20" /><path d="M10 70 50 50l40 20" /></g></svg>
          <div className="eyebrow">Preparação · {t.name}</div>
          <h1>{next ? "Continue de onde parou" : "Todas as aulas concluídas. Hora de treinar."}</h1>
          <p>{next ? <>Próxima aula: <b>{next.t}</b> ({SUBJ[next.s].short}, ~{next.min} min).</> : "Gere simulados aleatórios e revise as matérias em que você mais erra."}</p>
          <div className="row">
            {next && <Link className="btn" href={`/aulas/${next.id}`}><Icon.book />Estudar agora</Link>}
            <Link className={`btn ${next ? "alt" : ""}`} href="/simulado"
              onClick={() => { if (state.exam?.finished) update(s => ({ ...s, exam: null })); }}><Icon.shuffle />Gerar simulado</Link>
          </div>
        </div>
        <div className="stats">
          <div className="stat"><span>Aulas concluídas</span><b className="num">{doneL}/{LESSONS.length}</b><Bar value={pct(doneL, LESSONS.length)} /></div>
          <div className="stat"><span>Simulados feitos</span><b className="num">{state.history.length}</b><span>{allT} questões respondidas</span></div>
          <div className="stat"><span>Aproveitamento geral</span><b className="num">{allT ? pct(allC, allT) + "%" : "—"}</b><span>{allT ? allC + " acertos" : "Faça o primeiro simulado"}</span></div>
          <div className="stat"><span>Último simulado</span><b className="num">{last ? pct(last.c, last.n) + "%" : "—"}</b><span>{last ? `${last.c}/${last.n} · ${fmtDate(last.at).split(" · ")[0]}` : "Nenhum ainda"}</span></div>
        </div>
      </section>

      <section className="card target">
        <div><div className="eyebrow">Seu concurso</div><h2>Para qual prova você está estudando?</h2></div>
        <div className="seg" role="group" aria-label="Concurso">
          {(Object.keys(TARGETS) as TargetId[]).map(k => (
            <button key={k} type="button" aria-pressed={state.target === k} onClick={() => update(s => ({ ...s, target: k }))}>{TARGETS[k].short}</button>
          ))}
        </div>
        <p className="muted" style={{ fontSize: ".92rem" }}>
          O foco ajusta a distribuição do simulado: {Object.entries(t.w).sort((a, b) => b[1]! - a[1]!).map(([s, w]) => `${SUBJ[s as SubjectId].short} ${w}%`).join(" · ")}. Confira sempre o conteúdo programático do edital.
        </p>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="sec-head">
          <div><div className="eyebrow">Matérias</div><h2>Seu progresso por disciplina</h2></div>
          <Link className="btn ghost" href="/aulas">Ver todas as aulas <Icon.right /></Link>
        </div>
        <div className="subj-grid">
          {SUBJECTS.map(s => {
            const n = lessonsOf(s.id).length, d = lessonsOf(s.id).filter(l => state.done[l.id]).length, st = subjStats(s.id);
            return (
              <Link key={s.id} className="subj" href={`/aulas?m=${s.id}`}>
                <div className="subj-top"><span className="dot" style={{ background: s.color, width: 10, height: 10 }} /><small className="num">{qsOf(s.id).length} questões</small></div>
                <h3>{s.name}</h3>
                <Bar value={pct(d, n)} color={s.color} />
                <small className="num">{d}/{n} aulas · {st.n ? pct(st.c, st.n) + "% de acerto" : "sem simulados"}</small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card install">
        <div className="install-ico"><Icon.phone /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h3>Instale como app no celular</h3>
          <p className="muted" style={{ fontSize: ".95rem" }}>
            No iPhone: <b>Compartilhar → Adicionar à Tela de Início</b>. No Android: <b>⋮ → Instalar app</b>. O ícone abre a plataforma em tela cheia, com a barra de navegação embaixo.
          </p>
        </div>
      </section>
    </>
  );
}
