import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function randomDelay(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tweet_ids, start_time } = body;

    if (!tweet_ids || tweet_ids.length === 0) {
      return NextResponse.json(
        { error: "No tweets selected." },
        { status: 400 }
      );
    }

    if (!start_time) {
      return NextResponse.json(
        { error: "Start time required." },
        { status: 400 }
      );
    }

    // Load preset
    const { data: settings } = await supabaseAdmin
      .from("scheduler_settings")
      .select("*")
      .eq("id", 1)
      .single();

    const minDelay = settings?.min_delay_minutes ?? 35;
    const maxDelay = settings?.max_delay_minutes ?? 55;

    let currentTime = new Date(start_time);

    const updates = [];

    for (const id of tweet_ids) {
      updates.push({
        id,
        scheduled_for: currentTime.toISOString(),
        status: "scheduled",
      });

      const delay = randomDelay(minDelay, maxDelay);

      currentTime = new Date(
        currentTime.getTime() + delay * 60000
      );
    }

    for (const update of updates) {
      await supabaseAdmin
        .from("drafts")
        .update({
          scheduled_for: update.scheduled_for,
          status: update.status,
        })
        .eq("id", update.id);
    }

    return NextResponse.json({
      success: true,
      scheduled: updates.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to schedule tweets." },
      { status: 500 }
    );
  }
}