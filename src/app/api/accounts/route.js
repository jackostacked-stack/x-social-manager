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
      .select("id, username, display_name, avatar_url, is_active, created_at")
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      accounts: data || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load accounts" },
      { status: 500 }
    );
  }
}