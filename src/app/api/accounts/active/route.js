import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("id, username, display_name, avatar_url, is_active")
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      account: data || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load active account" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json(
        { error: "Missing account_id" },
        { status: 400 }
      );
    }

    await supabase
      .from("accounts")
      .update({ is_active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    const { error } = await supabase
      .from("accounts")
      .update({ is_active: true })
      .eq("id", accountId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("active_account_id", accountId, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: false,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to switch active account" },
      { status: 500 }
    );
  }
}