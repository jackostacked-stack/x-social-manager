import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getActiveAccount } from "@/lib/activeAccount";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const activeAccount = await getActiveAccount();
    const body = await req.json();
    const scope = body.scope;

    if (!scope) {
      return NextResponse.json(
        { error: "Missing scope" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from("drafts")
      .delete()
      .eq("account_id", activeAccount.id);

    if (scope === "manager") {
      query = query.in("status", ["pending", "rejected"]);
    } else if (scope === "queue") {
      query = query.eq("status", "approved");
    } else {
      return NextResponse.json(
        { error: "Invalid scope" },
        { status: 400 }
      );
    }

    const result = await query;

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to reset drafts" },
      { status: 500 }
    );
  }
}