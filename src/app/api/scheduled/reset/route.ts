import { NextResponse } from "next/server";
import { supabaseAdmin, getActiveAccount } from "@/lib/activeAccount";

export const runtime = "nodejs";

export async function POST() {
  try {
    const activeAccount = await getActiveAccount();

    const result = await supabaseAdmin
      .from("drafts")
      .delete()
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
      { error: err?.message || "Failed to reset scheduled drafts" },
      { status: 500 }
    );
  }
}