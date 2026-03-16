import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { TwitterApi } from "twitter-api-v2";
import { supabaseAdmin, getActiveAccount } from "@/lib/activeAccount";

export const runtime = "nodejs";

function getTwitterClientForAccount(account: any) {
  return new TwitterApi({
    appKey: process.env.X_API_KEY as string,
    appSecret: process.env.X_API_SECRET as string,
    accessToken: account.oauth_token,
    accessSecret: account.oauth_token_secret,
  });
}

async function uploadMediaFromUrl(client: TwitterApi, url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to download media");
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const mediaId = await client.v1.uploadMedia(buffer);
  return mediaId;
}

export async function POST(req: NextRequest) {
  try {
    const activeAccount = await getActiveAccount();
    const body = await req.json();
    const draftId = body.draftId;

    if (!draftId) {
      return NextResponse.json(
        { error: "Missing draftId" },
        { status: 400 }
      );
    }

    const draftResult = await supabaseAdmin
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .eq("account_id", activeAccount.id)
      .single();

    if (draftResult.error || !draftResult.data) {
      return NextResponse.json(
        { error: "Draft not found for active account" },
        { status: 404 }
      );
    }

    const draft = draftResult.data;
    const twitter = getTwitterClientForAccount(activeAccount);

    let tweetResult: any;

    if (draft.media_url) {
      const mediaId = await uploadMediaFromUrl(twitter, draft.media_url);

      tweetResult = await twitter.v2.tweet({
        text: draft.tweet_text,
        media: {
          media_ids: [mediaId],
        },
      });
    } else {
      tweetResult = await twitter.v2.tweet({
        text: draft.tweet_text,
      });
    }

    const updateResult = await supabaseAdmin
      .from("drafts")
      .update({
        status: "posted",
        tweet_id: tweetResult.data.id,
      })
      .eq("id", draftId)
      .eq("account_id", activeAccount.id);

    if (updateResult.error) {
      return NextResponse.json(
        { error: updateResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Tweet failed to send" },
      { status: 500 }
    );
  }
}