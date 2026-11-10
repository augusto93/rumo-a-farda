export type SubjectId = "pt" | "mat" | "log" | "pen" | "pp" | "adm" | "const" | "dh" | "leg";

export interface Subject { id: SubjectId; name: string; short: string; color: string }
export interface Lesson { id: string; s: SubjectId; t: string; min: number; src: string; yt: string; body: string }
/** a = índice da alternativa correta (antes do embaralhamento) */
export interface Question { s: SubjectId; l: string; q: string; o: string[]; a: number; e: string }

export type TargetId = "pmerj" | "marica";

export interface ExamItem { q: number; perm: number[]; ans: number | null }
export interface Exam {
  title: string;
  mode: "prova" | "treino";
  items: ExamItem[];
  cur: number;
  start: number;
  end?: number;
  limit: number; // segundos; 0 = sem cronômetro
  finished: boolean;
  c?: number;
  by?: Partial<Record<SubjectId, [number, number]>>;
}
export interface HistoryEntry {
  at: number; title: string; n: number; c: number; secs: number; target: TargetId;
  by: Partial<Record<SubjectId, [number, number]>>;
}
export interface StudyState {
  done: Record<string, number>;
  seen: Record<string, number>;
  history: HistoryEntry[];
  target: TargetId;
  exam: Exam | null;
  updatedAt: number;
}
