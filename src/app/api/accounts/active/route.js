import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const account_id = body.account_id;

    if (!account_id) {
      return NextResponse.json(
        { error: "Missing account_id" },
        { status: 400 }
      );
    }

    const clearResult = await supabase
      .from("accounts")
      .update({ is_active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (clearResult.error) {
      return NextResponse.json(
        { error: clearResult.error.message },
        { status: 500 }
      );
    }

    const setResult = await supabase
      .from("accounts")
      .update({ is_active: true })
      .eq("id", account_id)
      .select()
      .single();

    if (setResult.error) {
      return NextResponse.json(
        { error: setResult.error.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      account: setResult.data,
    });

    response.cookies.set("active_account_id", account_id, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: false,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to switch account" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await supabase
      .from("accounts")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      account: result.data || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load active account" },
      { status: 500 }
    );
  }
}