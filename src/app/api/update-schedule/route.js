import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req, Request) {
  try {
    const body = await req.json();
    const { tweet_ids, start_time } = body;

    if (!tweet_ids || !start_time) {
      return NextResponse.json(
        { error: "Missing tweet_ids or start_time" },
        { status: 400 }
      );
    }

    let current = new Date(start_time);

    for (const id of tweet_ids) {
      await supabase
        .from("drafts")
        .update({
          status: "scheduled",
          scheduled_for: current.toISOString(),
        })
        .eq("id", id);

      current = new Date(current.getTime() + 30 * 60000); // fallback delay
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}