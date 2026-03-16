import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getActiveAccount } from "@/lib/activeAccount";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const activeAccount = await getActiveAccount();
    const body = await req.json();

    const draftId = body.draftId;
    const scheduled_for = body.scheduled_for;

    if (!draftId || !scheduled_for) {
      return NextResponse.json(
        { error: "Missing draftId or scheduled_for" },
        { status: 400 }
      );
    }

    const iso = new Date(scheduled_for).toISOString();

    const result = await supabaseAdmin
      .from("drafts")
      .update({ scheduled_for: iso })
      .eq("id", draftId)
      .eq("account_id", activeAccount.id)
      .eq("status", "scheduled")
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
      { error: err?.message || "Failed to update scheduled draft" },
      { status: 500 }
    );
  }
}