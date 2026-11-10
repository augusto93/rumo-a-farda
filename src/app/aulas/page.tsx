import { Suspense } from "react";
import LessonList from "./LessonList";

export const metadata = { title: "Aulas" };
export default function Page() {
  return <Suspense><LessonList /></Suspense>;
}
