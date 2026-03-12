import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function generateTimes(count: number) {
  const startHour = 13;
  const endHour = 24;
  const minGap = 60;

  const now = new Date();

  const start = new Date(now);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(now);
  end.setHours(endHour, 0, 0, 0);

  const startMinutes = start.getHours() * 60;
  const endMinutes = end.getHours() * 60;

  const times: number[] = [];

  while (times.length < count) {
    const t =
      Math.floor(Math.random() * (endMinutes - startMinutes)) + startMinutes;

    if (times.every((x) => Math.abs(x - t) >= minGap)) {
      times.push(t);
    }
  }

  return times.sort((a, b) => a - b);
}

export async function POST() {
  const { data: drafts } = await supabaseAdmin
    .from("drafts")
    .select("*")
    .eq("status", "approved");

  if (!drafts || drafts.length === 0) {
    return NextResponse.json({ success: true });
  }

  const times = generateTimes(drafts.length);

  const now = new Date();

  for (let i = 0; i < drafts.length; i++) {
    const minutes = times[i];
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const date = new Date();

    date.setHours(hour, minute, 0, 0);

    if (date < now) {
      date.setDate(date.getDate() + 1);
    }

    await supabaseAdmin
      .from("drafts")
      .update({
        status: "scheduled",
        scheduled_for: date.toISOString(),
      })
      .eq("id", drafts[i].id);
  }

  return NextResponse.json({ success: true });
}