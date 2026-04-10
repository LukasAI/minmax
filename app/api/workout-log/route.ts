import { NextResponse } from "next/server";
import { entrySchema } from "@/lib/validators";

export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = entrySchema.array().safeParse(payload.entries ?? []);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  return NextResponse.json({ ok: true, autosaveState: "Saved" });
}
