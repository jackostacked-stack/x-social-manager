import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TwitterApi } from "twitter-api-v2";

const twitter = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
});

const client = twitter.readWrite;

export async function POST() {
  try {
    const now = new Date().toISOString();

    const { data: tweets } = await supabaseAdmin
      .from("drafts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_for", now);

    if (!tweets || tweets.length === 0) {
      return NextResponse.json({ message: "No tweets to post." });
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Posting failed." },
      { status: 500 }
    );
  }
}