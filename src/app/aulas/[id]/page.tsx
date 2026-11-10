import { notFound } from "next/navigation";
import { LESSONS, LES } from "@/lib/catalog";
import LessonView from "./LessonView";

export function generateStaticParams() {
  return LESSONS.map(l => ({ id: l.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: LES[id]?.t ?? "Aula" };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!LES[id]) notFound();
  return <LessonView id={id} />;
}
