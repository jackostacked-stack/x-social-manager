import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Missing accountId" },
        { status: 400 }
      );
    }

    // deactivate all accounts
    await supabase
      .from("accounts")
      .update({ is_active: false })
      .neq("id", "");

    // activate selected account
    await supabase
      .from("accounts")
      .update({ is_active: true })
      .eq("id", accountId);

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to switch account" },
      { status: 500 }
    );
  }
}