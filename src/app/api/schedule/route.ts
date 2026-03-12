import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function randomTimes(count: number) {
  const start = 13 * 60; // 13:00
  const end = 24 * 60;   // 00:00
  const minGap = 45;

  const times: number[] = [];

  while (times.length < count) {
    const t = Math.floor(Math.random() * (end - start)) + start;

    if (times.every((x) => Math.abs(x - t) >= minGap)) {
      times.push(t);
    }
  }

  return times.sort((a, b) => a - b);
}

export async function POST() {
  try {
    const { data: drafts, error } = await supabaseAdmin
      .from("drafts")
      .select("*")
      .eq("status", "approved");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch approved tweets." },
        { status: 500 }
      );
    }

    if (!drafts || drafts.length === 0) {
      return NextResponse.json({ success: true, drafts: [] });
    }

    const times = randomTimes(drafts.length);
    const now = new Date();

    for (let i = 0; i < drafts.length; i++) {
      const minutes = times[i];
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      const date = new Date(now);
      date.setHours(hour, minute, 0, 0);

      await supabaseAdmin
        .from("drafts")
        .update({
          scheduled_for: date.toISOString(),
          status: "scheduled",
        })
        .eq("id", drafts[i].id);
    }

    const { data: updatedDrafts } = await supabaseAdmin
      .from("drafts")
      .select("*")
      .order("id", { ascending: false });

    return NextResponse.json({
      success: true,
      drafts: updatedDrafts,
    });
  } catch {
    return NextResponse.json(
      { error: "Scheduling failed." },
      { status: 500 }
    );
  }
}