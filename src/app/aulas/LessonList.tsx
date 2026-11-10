"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { LESSONS, SUBJECTS, SUBJ, LES, QUESTIONS, INITIALS } from "@/lib/catalog";
import { Icon } from "@/components/Icons";
import { MobileTop } from "@/components/Shell";
import type { SubjectId } from "@/lib/types";

export default function LessonList() {
  const { state } = useStore();
  const router = useRouter();
  const m = useSearchParams().get("m") as SubjectId | null;
  const filter = m && SUBJ[m] ? m : "all";
  const list = filter === "all" ? LESSONS : LESSONS.filter(l => l.s === filter);
  const setFilter = (f: string) => router.replace(f === "all" ? "/aulas" : `/aulas?m=${f}`, { scroll: false });
  return (
    <>
      <MobileTop title="Aulas" />
      <div className="sec-head">
        <div><div className="eyebrow">Aulas online</div><h1>Conteúdo das apostilas</h1></div>
        <p className="muted num">{Object.keys(state.done).filter(k => LES[k]).length} de {LESSONS.length} concluídas</p>
      </div>
      <div className="filters" role="group" aria-label="Filtrar por matéria">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Todas</button>
        {SUBJECTS.map(s => (
          <button key={s.id} type="button" aria-pressed={filter === s.id} onClick={() => setFilter(s.id)}>
            <span className="dot" style={{ background: s.color }} />{s.short}
          </button>
        ))}
      </div>
      <div className="lesson-list">
        {list.map(l => {
          const done = !!state.done[l.id];
          return (
            <Link key={l.id} className="lesson" href={`/aulas/${l.id}`}>
              <div className="ico" style={{ background: `color-mix(in srgb, ${SUBJ[l.s].color} 16%, transparent)`, color: SUBJ[l.s].color }}>{INITIALS[l.s]}</div>
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                <h3>{l.t}</h3>
                <div className="lesson-meta"><span>{SUBJ[l.s].short}</span><span>~{l.min} min</span><span>{QUESTIONS.filter(q => q.l === l.id).length} questões</span></div>
              </div>
              <span className={`check ${done ? "on" : ""}`} aria-label={done ? "Concluída" : "Não concluída"}>{done && <Icon.check />}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
