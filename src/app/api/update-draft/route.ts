import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getActiveAccount } from "@/lib/activeAccount";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const activeAccount = await getActiveAccount();
    const body = await req.json();

    const draftId = body.draftId;
    const tweet_text = body.tweet_text;

    if (!draftId || !tweet_text) {
      return NextResponse.json(
        { error: "Missing draftId or tweet_text" },
        { status: 400 }
      );
    }

    const result = await supabaseAdmin
      .from("drafts")
      .update({ tweet_text })
      .eq("id", draftId)
      .eq("account_id", activeAccount.id)
      .select()
      .single();

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update draft" },
      { status: 500 }
    );
  }
}