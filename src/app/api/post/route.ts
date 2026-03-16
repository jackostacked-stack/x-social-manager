import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { TwitterApi } from "twitter-api-v2";
import { supabaseAdmin } from "@/lib/activeAccount";

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

export async function POST() {
  try {
    const nowIso = new Date().toISOString();

    const draftsResult = await supabaseAdmin
      .from("drafts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_for", nowIso)
      .not("account_id", "is", null)
      .order("scheduled_for", { ascending: true });

    if (draftsResult.error) {
      return NextResponse.json(
        { error: draftsResult.error.message },
        { status: 500 }
      );
    }

    const drafts = draftsResult.data || [];

    if (drafts.length === 0) {
      return NextResponse.json({
        success: true,
        posted: 0,
        failed: 0,
        results: [],
      });
    }

    const results: Array<{
      draftId: number;
      success: boolean;
      tweetId?: string;
      error?: string;
    }> = [];

    for (const draft of drafts) {
      try {
        const accountResult = await supabaseAdmin
          .from("accounts")
          .select("*")
          .eq("id", draft.account_id)
          .single();

        if (accountResult.error || !accountResult.data) {
          results.push({
            draftId: draft.id,
            success: false,
            error: "Account not found for draft",
          });
          continue;
        }

        const account = accountResult.data;
        const twitter = getTwitterClientForAccount(account);

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
          .eq("id", draft.id);

        if (updateResult.error) {
          results.push({
            draftId: draft.id,
            success: false,
            error: updateResult.error.message,
          });
          continue;
        }

        results.push({
          draftId: draft.id,
          success: true,
          tweetId: tweetResult.data.id,
        });
      } catch (err: any) {
        results.push({
          draftId: draft.id,
          success: false,
          error: err?.message || "Failed to post scheduled draft",
        });
      }
    }

    return NextResponse.json({
      success: true,
      posted: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to process scheduled tweets" },
      { status: 500 }
    );
  }
}