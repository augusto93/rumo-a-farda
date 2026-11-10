"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { LES, SUBJ, QUESTIONS, lessonsOf, shuffle, ytUrl } from "@/lib/catalog";
import { newExam } from "@/lib/exam";
import { Icon } from "@/components/Icons";
import { MobileTop } from "@/components/Shell";
import { SubjChip } from "@/components/ui";

export default function LessonView({ id }: { id: string }) {
  const { state, update } = useStore();
  const router = useRouter();
  const l = LES[id], s = SUBJ[l.s];
  const sib = lessonsOf(l.s), idx = sib.findIndex(x => x.id === id);
  const prev = sib[idx - 1], next = sib[idx + 1];
  const qids = QUESTIONS.map((_, i) => i).filter(i => QUESTIONS[i].l === id);
  const done = !!state.done[id];
  // conteúdo estático das aulas (escrito por nós), por isso é seguro injetar o HTML
  const body = l.body.replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, "</table></div>");

  const toggle = () => update(st => {
    const d = { ...st.done };
    if (d[id]) delete d[id]; else d[id] = Date.now();
    return { ...st, done: d };
  });
  const practice = () => {
    update(st => ({ ...st, exam: newExam(shuffle(qids), { title: "Treino: " + l.t, mode: "treino", timer: false }) }));
    router.push("/simulado");
  };

  return (
    <>
      <MobileTop title={s.short} />
      <div><Link className="btn ghost" href={`/aulas?m=${l.s}`} style={{ paddingLeft: 6 }}><Icon.left />Aulas</Link></div>
      <div className="reader">
        <article className="article">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <div className="row" style={{ gap: 8 }}><SubjChip s={l.s} /><span className="chip">Aula {idx + 1} de {sib.length}</span><span className="chip">~{l.min} min</span></div>
            <h1>{l.t}</h1>
            <p className="muted" style={{ fontSize: ".9rem" }}>Base: {l.src}</p>
          </div>
          <div className="article-body" dangerouslySetInnerHTML={{ __html: body }} />
          <div className="qnav" style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            {prev ? <Link className="btn" href={`/aulas/${prev.id}`}><Icon.left />Anterior</Link> : <span />}
            {next && <Link className="btn" href={`/aulas/${next.id}`}>Próxima<Icon.right /></Link>}
          </div>
        </article>
        <aside className="aside">
          <div className="card video-card">
            <div className="eyebrow">Videoaulas</div>
            <a className="play" href={ytUrl(l.yt)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir videoaulas sobre ${l.t} no YouTube`}><span><Icon.play /></span></a>
            <p className="muted" style={{ fontSize: ".88rem" }}>Abre no YouTube uma seleção de aulas gratuitas sobre este tema.</p>
            <a className="btn" href={ytUrl(l.yt)} target="_blank" rel="noopener noreferrer">Assistir no YouTube</a>
          </div>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button type="button" className={`btn ${done ? "" : "primary"}`} onClick={toggle}>{done ? "✓ Aula concluída" : "Marcar como concluída"}</button>
            <button type="button" className="btn" onClick={practice} disabled={!qids.length}>Treinar {qids.length} questões desta aula</button>
          </div>
        </aside>
      </div>
    </>
  );
}
