import { QUESTIONS, SUBJECTS, TARGETS, PMERJ_MODEL, allocate, qsOf, shuffle } from "./catalog";
import type { Exam, HistoryEntry, StudyState, SubjectId } from "./types";

export interface Setup {
  subjects: SubjectId[]; n: number; mode: "prova" | "treino"; timer: boolean; mix: boolean; onlyDone: boolean; model: boolean;
}

/** Sorteia as questões: prioriza as menos vistas, embaralhando dentro de cada matéria. */
export function buildIds(cfg: Setup, st: StudyState): number[] {
  const alloc = cfg.model ? PMERJ_MODEL : allocate(cfg.subjects, cfg.n, TARGETS[st.target].w);
  let ids: number[] = [];
  SUBJECTS.forEach(s => {
    const k = alloc[s.id]; if (!k) return;
    let cand = qsOf(s.id);
    if (cfg.onlyDone) { const f = cand.filter(i => st.done[QUESTIONS[i].l]); if (f.length >= k) cand = f; }
    cand = shuffle(cand).sort((a, b) => (st.seen[a] || 0) - (st.seen[b] || 0));
    ids = ids.concat(shuffle(cand.slice(0, k)));
  });
  return cfg.mix ? shuffle(ids) : ids;
}

export function newExam(ids: number[], opts: { title: string; mode: "prova" | "treino"; timer: boolean }): Exam {
  return {
    title: opts.title, mode: opts.mode,
    items: ids.map(i => ({ q: i, perm: shuffle(QUESTIONS[i].o.map((_, k) => k)), ans: null })),
    cur: 0, start: Date.now(), limit: opts.timer ? ids.length * 180 : 0, finished: false
  };
}

export function finish(st: StudyState): StudyState {
  const ex = st.exam; if (!ex || ex.finished) return st;
  const end = Date.now();
  const by: Exam["by"] = {}; let c = 0;
  const seen = { ...st.seen };
  ex.items.forEach(x => {
    const q = QUESTIONS[x.q];
    const b = (by[q.s] = by[q.s] || [0, 0]); b[1]++;
    if (x.ans === q.a) { b[0]++; c++; }
    seen[x.q] = (seen[x.q] || 0) + 1;
  });
  const h: HistoryEntry = { at: end, title: ex.title, n: ex.items.length, c, by, secs: Math.round((end - ex.start) / 1000), target: st.target };
  return { ...st, seen, exam: { ...ex, finished: true, end, c, by }, history: [h, ...st.history].slice(0, 100) };
}
