import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

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

export async function POST() {
  try {
    const activeAccount = await getActiveAccount();

    const exampleTweets = [
      "Nobody talks about how expensive it is just to exist anymore.",
      "Wild how everyone is hiring but nobody's actually hiring.",
      "If you're not building something on the side that compounds, you're just running in place forever.",
      "Most people don't need more motivation. They need better systems.",
      "The real flex is having time freedom, not fake status.",
    ];

    const rows = exampleTweets.map((tweetText) => ({
      tweet_text: tweetText,
      status: "pending",
      account_id: activeAccount.id,
    }));

    const { data, error } = await supabase
      .from("drafts")
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      drafts: data || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to generate tweets" },
      { status: 500 }
    );
  }
}