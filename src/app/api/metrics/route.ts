export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TwitterApi } from "twitter-api-v2";

const twitter = new TwitterApi(process.env.X_BEARER_TOKEN!);

type PublicMetrics = {
  like_count: number;
  retweet_count: number;
  reply_count: number;
};

async function runMetrics() {
  const { data: tweets, error } = await supabaseAdmin
    .from("drafts")
    .select("*")
    .eq("status", "posted");

  if (error || !tweets) {
    return { error: "Failed to fetch tweets." };
  }

  if (tweets.length === 0) {
    return { success: true };
  }

  for (const tweet of tweets) {
    if (!tweet.tweet_id) continue;

    const metrics = await twitter.v2.singleTweet(tweet.tweet_id, {
      "tweet.fields": "public_metrics",
    });

    const m = metrics.data.public_metrics as PublicMetrics;

    await supabaseAdmin
      .from("drafts")
      .update({
        likes: m.like_count,
        reposts: m.retweet_count,
        replies: m.reply_count,
        impressions: 0,
        metrics_updated_at: new Date().toISOString(),
      })
      .eq("id", tweet.id);
  }

  return { success: true };
}

export async function POST() {
  try {
    const result = await runMetrics();
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Metrics update failed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await runMetrics();
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Metrics update failed." },
      { status: 500 }
    );
  }
}