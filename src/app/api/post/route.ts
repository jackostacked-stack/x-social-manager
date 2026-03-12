import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";

const twitter = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
});

const client = twitter.readWrite;

async function runPostJob() {
  const now = new Date().toISOString();

  const { data: tweets, error } = await supabaseAdmin
    .from("drafts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_for", now);

  if (error) {
    return { error: error.message };
  }

  if (!tweets || tweets.length === 0) {
    return { success: true, message: "No tweets ready to post." };
  }

  for (const tweet of tweets) {
    const posted = await client.v2.tweet(tweet.tweet_text);

    await supabaseAdmin
      .from("drafts")
      .update({
        status: "posted",
        tweet_id: posted.data.id,
      })
      .eq("id", tweet.id);
  }

  return {
    success: true,
    posted: tweets.length,
  };
}

export async function POST() {
  const result = await runPostJob();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await runPostJob();
  return NextResponse.json(result);
}