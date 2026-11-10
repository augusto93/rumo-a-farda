import { SUBJECTS, LESSONS, QUESTIONS } from "@/data/content";
import type { SubjectId, TargetId } from "./types";

export { SUBJECTS, LESSONS, QUESTIONS };
export const SUBJ = Object.fromEntries(SUBJECTS.map(s => [s.id, s])) as Record<SubjectId, (typeof SUBJECTS)[number]>;
export const LES = Object.fromEntries(LESSONS.map(l => [l.id, l]));
export const LETTERS = "ABCDE";

export const TARGETS: Record<TargetId, { name: string; short: string; w: Partial<Record<SubjectId, number>> }> = {
  pmerj: { name: "PMERJ — Soldado", short: "PMERJ", w: { pt: 20, mat: 12, log: 8, dh: 16, const: 4, adm: 10, leg: 10, pen: 10, pp: 10 } },
  marica: { name: "Guarda Municipal de Maricá", short: "Guarda de Maricá", w: { pt: 25, mat: 10, log: 10, adm: 18, const: 12, leg: 10, pen: 7, dh: 5, pp: 3 } }
};
/** Estrutura dos simulados PMERJ: 50 questões */
export const PMERJ_MODEL: Partial<Record<SubjectId, number>> = { pt: 10, mat: 6, log: 4, dh: 8, const: 2, adm: 5, leg: 5, pen: 5, pp: 5 };

export const INITIALS: Record<SubjectId, string> = { pt: "PT", mat: "MAT", log: "LÓG", pen: "PEN", pp: "PP", adm: "ADM", const: "CF", dh: "DH", leg: "LEG" };

export const lessonsOf = (s: SubjectId) => LESSONS.filter(l => l.s === s);
export const qsOf = (s: SubjectId) => QUESTIONS.map((_, i) => i).filter(i => QUESTIONS[i].s === s);
export const pct = (a: number, b: number) => (b ? Math.round((a * 100) / b) : 0);
export const fmtTime = (s: number) => {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(ss).padStart(2, "0");
};
export const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " · " +
  new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
export const ytUrl = (q: string) => "https://www.youtube.com/results?search_query=" + encodeURIComponent("videoaula " + q);

/* ---------- aleatoriedade ---------- */
export const rnd = () => {
  try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; } catch { return Math.random(); }
};
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function allocate(subjects: SubjectId[], n: number, weights: Partial<Record<SubjectId, number>>) {
  const pool: Partial<Record<SubjectId, number>> = {};
  subjects.forEach(s => (pool[s] = qsOf(s).length));
  const totalW = subjects.reduce((a, s) => a + (weights[s] || 5), 0);
  const alloc: Partial<Record<SubjectId, number>> = {};
  let used = 0;
  const rema = subjects
    .map(s => { const ex = (n * (weights[s] || 5)) / totalW; alloc[s] = Math.min(Math.floor(ex), pool[s]!); used += alloc[s]!; return [s, ex - Math.floor(ex)] as const; })
    .sort((a, b) => b[1] - a[1]);
  let guard = 0;
  while (used < n && guard++ < 500) {
    let moved = false;
    for (const [s] of rema) { if (used >= n) break; if (alloc[s]! < pool[s]!) { alloc[s] = alloc[s]! + 1; used++; moved = true; } }
    if (!moved) break;
  }
  return alloc;
}
