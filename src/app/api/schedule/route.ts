import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function randomDelay(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getActiveAccount() {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("No active account selected");
  }

  return data;
}

export async function POST(req: NextRequest) {
  try {
    const activeAccount = await getActiveAccount();
    const body = await req.json();

    const tweet_ids = body.tweet_ids as number[];
    const start_time = body.start_time as string;

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

    const { data: settings, error: settingsError } = await supabase
      .from("account_scheduler_settings")
      .select("*")
      .eq("account_id", activeAccount.id)
      .maybeSingle();

    if (settingsError) {
      return NextResponse.json(
        { error: settingsError.message },
        { status: 500 }
      );
    }

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
        .eq("id", tweetId)
        .eq("account_id", activeAccount.id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      const delayMinutes = randomDelay(minDelay, maxDelay);
      currentTime = new Date(currentTime.getTime() + delayMinutes * 60000);
    }

    return NextResponse.json({
      success: true,
      scheduled: tweet_ids.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to schedule tweets." },
      { status: 500 }
    );
  }
}