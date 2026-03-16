import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const tweet_ids = body.tweet_ids;
    const start_time = body.start_time;

    if (!tweet_ids || !start_time) {
      return NextResponse.json(
        { error: "Missing tweet_ids or start_time" },
        { status: 400 }
      );
    }

    // load scheduler preset
    const { data: settings } = await supabase
      .from("scheduler_settings")
      .select("*")
      .limit(1)
      .single();

    const minDelay = settings?.min_delay_minutes ?? 35;
    const maxDelay = settings?.max_delay_minutes ?? 55;

    let currentTime = new Date(start_time);

    for (const tweetId of tweet_ids) {
      const { error } = await supabase
        .from("drafts")
        .update({
          status: "scheduled",
          scheduled_for: currentTime.toISOString(),
        })
        .eq("id", tweetId);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      const delayMinutes = randomDelay(minDelay, maxDelay);

      currentTime = new Date(
        currentTime.getTime() + delayMinutes * 60000
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { error: "Failed to schedule tweets" },
      { status: 500 }
    );
  }
}