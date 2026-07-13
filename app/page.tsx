import type { Metadata } from "next";
import TuesdayApp from "./tuesday-app";

export const metadata: Metadata = {
  title: { absolute: "The Plan That Survives Tuesday" },
  description: "A clinician-guided AI reality layer that turns medically sound advice into a week a real person can live.",
};

export default function Home() {
  return <TuesdayApp />;
}
