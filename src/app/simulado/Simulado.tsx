"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { SUBJECTS, SUBJ, TARGETS, QUESTIONS, LES, LETTERS, PMERJ_MODEL, allocate, qsOf, pct, fmtTime, fmtDate } from "@/lib/catalog";
import { buildIds, newExam, finish, type Setup } from "@/lib/exam";
import { Icon } from "@/components/Icons";
import { MobileTop } from "@/components/Shell";
import { SubjChip, BreakRow, scoreColor } from "@/components/ui";
import { History } from "@/components/History";
import type { SubjectId, TargetId } from "@/lib/types";

export default function Simulado() {
  const { state, ready } = useStore();
  if (!ready) return null;
  if (!state.exam) return <SetupView />;
  if (state.exam.finished) return <ResultView />;
  return <RunView />;
}

const top = () => window.scrollTo(0, 0);

/* ---------------- montar ---------------- */
function SetupView() {
  const { state, update } = useStore();
  const [cfg, setCfg] = useState<Setup>(() => ({
    subjects: Object.keys(TARGETS[state.target].w) as SubjectId[], n: 20, mode: "prova", timer: true, mix: false, onlyDone: false, model: false
  }));
  const set = (p: Partial<Setup>) => setCfg(c => ({ ...c, ...p }));
  const avail = cfg.subjects.reduce((a, s) => a + qsOf(s).length, 0);
  const nEff = cfg.model ? 50 : Math.min(cfg.n, avail);
  const alloc = cfg.model ? PMERJ_MODEL : allocate(cfg.subjects, nEff, TARGETS[state.target].w);
  const setTarget = (k: TargetId) => { update(s => ({ ...s, target: k })); set({ subjects: Object.keys(TARGETS[k].w) as SubjectId[] }); };
  const toggleSubj = (id: SubjectId, on: boolean) => set({ subjects: on ? [...cfg.subjects, id] : cfg.subjects.filter(x => x !== id) });
  const generate = () => {
    const ids = buildIds({ ...cfg, n: nEff }, state);
    update(s => ({ ...s, exam: newExam(ids, { title: cfg.model ? "Prova modelo PMERJ" : "Simulado " + TARGETS[s.target].short, mode: cfg.mode, timer: cfg.timer }) }));
    top();
  };

  return (
    <>
      <MobileTop title="Simulado" />
      <div className="sec-head">
        <div><div className="eyebrow">Gerador de simulados</div><h1>Monte seu simulado</h1></div>
        <p className="muted">Cada geração sorteia questões e alternativas diferentes.</p>
      </div>
      <div className="setup">
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <label className="toggle model-toggle">
            <input type="checkbox" id="opt-model" checked={cfg.model} onChange={e => set({ model: e.target.checked })} />
            <span><b>Prova modelo PMERJ — 50 questões</b><br /><span className="muted" style={{ fontSize: ".9rem" }}>Mesma estrutura dos simulados PMERJ: 10 Português, 10 Matemática/Lógica, 10 Direitos Humanos, 5 Administrativo, 5 Legislação, 5 Penal e 5 Processo Penal. Tempo: 2h30 (3 min por questão).</span></span>
          </label>
          <fieldset disabled={cfg.model} style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 22, minWidth: 0, opacity: cfg.model ? 0.5 : 1 }}>
            <div className="field"><span className="lbl">Concurso</span>
              <div className="seg" role="group" aria-label="Concurso">
                {(Object.keys(TARGETS) as TargetId[]).map(k => <button key={k} type="button" aria-pressed={state.target === k} onClick={() => setTarget(k)}>{TARGETS[k].short}</button>)}
              </div>
            </div>
            <div className="field"><span className="lbl">Matérias</span>
              <div className="pick">
                {SUBJECTS.map(s => (
                  <label key={s.id}>
                    <input type="checkbox" id={`sj-${s.id}`} checked={cfg.subjects.includes(s.id)} onChange={e => toggleSubj(s.id, e.target.checked)} />
                    <span className="dot" style={{ background: s.color }} />{s.short}<small className="num">{qsOf(s.id).length}</small>
                  </label>
                ))}
              </div>
            </div>
            <div className="field"><span className="lbl">Número de questões</span>
              <div className="seg" role="group" aria-label="Número de questões">
                {[10, 20, 30, 40, 60].map(n => <button key={n} type="button" aria-pressed={cfg.n === n} onClick={() => set({ n })}>{n}</button>)}
              </div>
            </div>
          </fieldset>
          <div className="field"><span className="lbl">Modo</span>
            <div className="seg" role="group" aria-label="Modo">
              <button type="button" aria-pressed={cfg.mode === "prova"} onClick={() => set({ mode: "prova" })}>Prova (gabarito no fim)</button>
              <button type="button" aria-pressed={cfg.mode === "treino"} onClick={() => set({ mode: "treino" })}>Treino (corrige na hora)</button>
            </div>
          </div>
          <div className="field" style={{ gap: 14 }}>
            <Toggle id="opt-timer" on={cfg.timer} set={v => set({ timer: v })} title="Cronômetro" desc="3 minutos por questão, como na prova." />
            <Toggle id="opt-mix" on={cfg.mix} set={v => set({ mix: v })} title="Misturar matérias" desc="Desligado, as questões vêm agrupadas por disciplina." />
            <Toggle id="opt-done" on={cfg.onlyDone} set={v => set({ onlyDone: v })} title="Só aulas que já estudei" desc="Prioriza questões das aulas marcadas como concluídas." />
          </div>
        </div>
        <div className="card summary">
          <div className="eyebrow">Resumo</div>
          <h2 className="num">{nEff} questões</h2>
          <ul>
            {SUBJECTS.filter(s => alloc[s.id]).map(s => (
              <li key={s.id}><span className="row" style={{ gap: 8 }}><span className="dot" style={{ background: s.color }} />{s.short}</span><b className="num">{alloc[s.id]}</b></li>
            ))}
            {!nEff && <li className="muted">Escolha ao menos uma matéria.</li>}
          </ul>
          <p className="muted num" style={{ fontSize: ".88rem" }}>{cfg.timer ? "Tempo: " + fmtTime(nEff * 180) : "Sem limite de tempo"} · {cfg.mode === "prova" ? "gabarito ao final" : "correção imediata"}</p>
          {!cfg.model && nEff < cfg.n && cfg.subjects.length > 0 && <p className="muted" style={{ fontSize: ".85rem" }}>Há {avail} questões nas matérias escolhidas.</p>}
          <button type="button" className="btn primary" disabled={!nEff} onClick={generate}><Icon.shuffle />Gerar simulado</button>
        </div>
      </div>
      <History max={5} />
    </>
  );
}

function Toggle({ id, on, set, title, desc }: { id: string; on: boolean; set: (v: boolean) => void; title: string; desc: string }) {
  return (
    <label className="toggle">
      <input type="checkbox" id={id} checked={on} onChange={e => set(e.target.checked)} />
      <span><b>{title}</b><br /><span className="muted" style={{ fontSize: ".9rem" }}>{desc}</span></span>
    </label>
  );
}

/* ---------------- responder ---------------- */
function RunView() {
  const { state, update } = useStore();
  const ex = state.exam!;
  const it = ex.items[ex.cur], q = QUESTIONS[it.q];
  const answered = ex.items.filter(x => x.ans !== null).length;
  const showFb = ex.mode === "treino" && it.ans !== null;
  const [confirm, setConfirm] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!ex.limit) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [ex.limit]);
  const left = ex.limit ? ex.limit - (now - ex.start) / 1000 : Infinity;
  useEffect(() => { if (left <= 0) { update(finish); top(); } }, [left, update]);

  const setEx = (p: Partial<typeof ex>) => update(s => ({ ...s, exam: { ...s.exam!, ...p } }));
  const answer = (k: number) => {
    if (showFb) return;
    update(s => { const items = s.exam!.items.slice(); items[s.exam!.cur] = { ...items[s.exam!.cur], ans: k }; return { ...s, exam: { ...s.exam!, items } }; });
  };
  const goTo = (i: number) => { setEx({ cur: i }); top(); };
  const doFinish = () => { update(finish); top(); };
  const askFinish = () => { setConfirm(true); top(); };

  return (
    <>
      <div className="exam-top">
        <div style={{ minWidth: 0 }}><div className="eyebrow">{ex.title}</div><b className="num">Questão {ex.cur + 1} de {ex.items.length}</b></div>
        <div className="row" style={{ gap: 8 }}>
          {ex.limit > 0 && <span className={`timer ${left < 300 ? "low" : ""}`}><Icon.clock /><span>{fmtTime(left)}</span></span>}
          <button type="button" className="btn" onClick={askFinish}>Finalizar</button>
        </div>
      </div>
      <div className="bar" aria-hidden="true"><i style={{ width: pct(answered, ex.items.length) + "%" }} /></div>
      {confirm && (
        <div className="confirm" role="alert">
          <b>Finalizar o simulado?</b>
          <span>{answered} de {ex.items.length} respondidas. As questões em branco contam como erro.</span>
          <div className="row">
            <button type="button" className="btn primary" onClick={doFinish}>Sim, ver resultado</button>
            <button type="button" className="btn" onClick={() => setConfirm(false)}>Continuar respondendo</button>
            <button type="button" className="btn ghost" onClick={() => update(s => ({ ...s, exam: null }))}>Descartar simulado</button>
          </div>
        </div>
      )}
      <div className="card qcard">
        <div className="row" style={{ gap: 8 }}><SubjChip s={q.s} /><span className="chip">{LES[q.l].t}</span></div>
        <p className="qtext">{q.q}</p>
        <ul className="opts">
          {it.perm.map((k, pos) => {
            let cls = "";
            if (showFb) { if (k === q.a) cls = "right"; else if (k === it.ans) cls = "wrong"; }
            else if (k === it.ans) cls = "sel";
            return (
              <li key={k}>
                <button type="button" className={`opt ${cls}`} disabled={showFb} onClick={() => answer(k)}>
                  <span className="let">{LETTERS[pos]}</span><span>{q.o[k]}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {showFb && (
          <div className={`explain ${it.ans === q.a ? "" : "no"}`}>
            <b>{it.ans === q.a ? "Correto." : `Resposta: ${LETTERS[it.perm.indexOf(q.a)]}.`}</b> {q.e}
          </div>
        )}
        <div className="qnav">
          <button type="button" className="btn" disabled={ex.cur === 0} onClick={() => goTo(ex.cur - 1)}><Icon.left />Anterior</button>
          {ex.cur < ex.items.length - 1
            ? <button type="button" className="btn primary" onClick={() => goTo(ex.cur + 1)}>Próxima<Icon.right /></button>
            : <button type="button" className="btn primary" onClick={askFinish}>Ver resultado</button>}
        </div>
      </div>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="sec-head"><span className="eyebrow">Mapa de questões</span><span className="muted num" style={{ fontSize: ".85rem" }}>{answered} respondidas</span></div>
        <div className="qgrid">
          {ex.items.map((x, i) => {
            let c = x.ans !== null ? "done" : "";
            if (ex.mode === "treino" && x.ans !== null) c = x.ans === QUESTIONS[x.q].a ? "r" : "w";
            return <button key={i} type="button" className={`${c} ${i === ex.cur ? "cur" : ""}`} aria-label={`Questão ${i + 1}`} onClick={() => goTo(i)}>{i + 1}</button>;
          })}
        </div>
      </div>
    </>
  );
}

/* ---------------- resultado ---------------- */
function ResultView() {
  const { state, update } = useStore();
  const ex = state.exam!;
  const [onlyWrong, setOnlyWrong] = useState(false);
  const p = pct(ex.c || 0, ex.items.length);
  const R = 62, C = 2 * Math.PI * R;
  const verdict = p >= 70 ? "Ótimo desempenho. Mantenha o ritmo." : p >= 50 ? "Bom caminho. Revise os temas com mais erros." : "Revise as aulas indicadas abaixo e tente outro simulado.";
  const wrongLessons = useMemo(() => [...new Set(ex.items.filter(x => x.ans !== QUESTIONS[x.q].a).map(x => QUESTIONS[x.q].l))], [ex]);
  const again = () => { update(s => ({ ...s, exam: null })); top(); };

  return (
    <>
      <MobileTop title="Resultado" />
      <div className="sec-head">
        <div><div className="eyebrow">{ex.title} · {fmtDate(ex.end!)}</div><h1>Resultado</h1></div>
        <button type="button" className="btn" onClick={again}><Icon.shuffle />Novo simulado</button>
      </div>
      <section className="card score">
        <div className="ring" role="img" aria-label={`${p}% de acerto`}>
          <svg viewBox="0 0 150 150">
            <circle cx="75" cy="75" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
            {p > 0 && <circle cx="75" cy="75" r={R} fill="none" stroke={scoreColor(p)} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(C * p) / 100} ${C}`} />}
          </svg>
          <div className="val"><div><b className="num">{p}%</b><span className="muted num" style={{ fontSize: ".85rem" }}>{ex.c}/{ex.items.length}</span></div></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, width: "100%" }}>
          <p><b>{verdict}</b> <span className="muted num">Tempo: {fmtTime((ex.end! - ex.start) / 1000)}.</span></p>
          <div className="breakdown">
            {SUBJECTS.filter(s => ex.by?.[s.id]).map(s => <BreakRow key={s.id} s={s.id} c={ex.by![s.id]![0]} t={ex.by![s.id]![1]} />)}
          </div>
        </div>
      </section>
      {wrongLessons.length > 0 && (
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="eyebrow">Revise estas aulas</div>
          <div className="row" style={{ gap: 8 }}>
            {wrongLessons.map(id => (
              <Link key={id} className="chip" style={{ textDecoration: "none", padding: "6px 12px" }} href={`/aulas/${id}`}>
                <span className="dot" style={{ background: SUBJ[LES[id].s].color }} />{LES[id].t}
              </Link>
            ))}
          </div>
        </section>
      )}
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="sec-head">
          <h2>Gabarito comentado</h2>
          <div className="seg" role="group" aria-label="Filtrar gabarito">
            <button type="button" aria-pressed={!onlyWrong} onClick={() => setOnlyWrong(false)}>Todas</button>
            <button type="button" aria-pressed={onlyWrong} onClick={() => setOnlyWrong(true)}>Só erros</button>
          </div>
        </div>
        <div className="review">
          {ex.items.map((x, i) => {
            const q = QUESTIONS[x.q], ok = x.ans === q.a;
            if (onlyWrong && ok) return null;
            const yours = x.ans === null ? "em branco" : `${LETTERS[x.perm.indexOf(x.ans)]}) ${q.o[x.ans]}`;
            return (
              <div key={i} className="rv">
                <div className="rv-head">
                  <b className="num">{i + 1}.</b><SubjChip s={q.s} />
                  <span className="chip" style={{ background: ok ? "var(--ok-soft)" : "var(--bad-soft)", color: ok ? "var(--ok)" : "var(--bad)" }}>{ok ? "Acertou" : "Errou"}</span>
                </div>
                <p>{q.q}</p>
                <div className="ans">
                  {!ok && <span className="muted">Sua resposta: {yours}</span>}
                  <span><b>Correta: {LETTERS[x.perm.indexOf(q.a)]}) {q.o[q.a]}</b></span>
                </div>
                <div className={`explain ${ok ? "" : "no"}`}>{q.e}</div>
              </div>
            );
          })}
          {onlyWrong && ex.c === ex.items.length && <div className="empty">Nenhum erro neste simulado.</div>}
        </div>
      </section>
    </>
  );
}
