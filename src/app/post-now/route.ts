import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const twitter = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
});

const client = twitter.readWrite;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftId } = body;

    if (!draftId) {
      return NextResponse.json(
        { error: "draftId is required." },
        { status: 400 }
      );
    }

    const { data: tweet, error: fetchError } = await supabaseAdmin
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (fetchError || !tweet) {
      return NextResponse.json(
        { error: "Tweet not found." },
        { status: 404 }
      );
    }

    const posted = await client.v1.tweet(tweet.tweet_text);

    const { error: updateError } = await supabaseAdmin
      .from("drafts")
      .update({
        status: "posted",
        tweet_id: posted.id_str,
      })
      .eq("id", draftId);

    if (updateError) {
      return NextResponse.json(
        { error: "Tweet posted but database update failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tweet_id: posted.id_str,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.data?.detail || err?.message || "Failed to post tweet now.",
      },
      { status: 500 }
    );
  }
}