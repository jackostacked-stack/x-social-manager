export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TwitterApi } from "twitter-api-v2";

const twitter = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
});

const client = twitter.readOnly;

type Metrics = {
  like_count: number;
  retweet_count: number;
  reply_count: number;
  quote_count?: number;
  impression_count?: number;
};

async function runMetrics() {
  const { data: tweets, error } = await supabaseAdmin
    .from("drafts")
    .select("*")
    .eq("status", "posted")
    .not("tweet_id", "is", null);

  if (error || !tweets) {
    return { error: "Failed to fetch posted tweets." };
  }

  let updated = 0;

  for (const tweet of tweets) {
    if (!tweet.tweet_id) continue;

    try {
      const res = await client.v2.singleTweet(tweet.tweet_id, {
        "tweet.fields": "public_metrics",
      });

      const metrics = res.data.public_metrics as Metrics;

      const { error: updateError } = await supabaseAdmin
        .from("drafts")
        .update({
          likes: metrics.like_count,
          reposts: metrics.retweet_count,
          replies: metrics.reply_count,
          views: metrics.impression_count ?? 0,
          metrics_updated_at: new Date().toISOString(),
        })
        .eq("id", tweet.id);

      if (!updateError) updated++;
    } catch {
      // skip errors so one tweet failing doesn't break everything
    }
  }

  return { success: true, updated };
}

export async function POST() {
  const result = await runMetrics();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await runMetrics();
  return NextResponse.json(result);
}