import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getActiveAccount } from "@/lib/activeAccount";

export const runtime = "nodejs";

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

    const result = await supabaseAdmin
      .from("drafts")
      .delete()
      .eq("id", draftId)
      .eq("account_id", activeAccount.id)
      .eq("status", "scheduled");

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete scheduled draft" },
      { status: 500 }
    );
  }
}