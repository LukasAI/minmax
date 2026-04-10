"use client";

import { useState } from "react";
import { BodyMap } from "@/components/body-map";

export default function BodyMapPage() {
  const [selected, setSelected] = useState("chest");
  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Body map</h1>
      <BodyMap onSelect={setSelected} />
      <div className="rounded-2xl bg-white p-4 text-sm">Selected: <span className="font-semibold">{selected}</span></div>
    </main>
  );
}
