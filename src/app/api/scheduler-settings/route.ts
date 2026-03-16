import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function getActiveAccount() {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("No active account selected");
  }

  return data;
}

export async function GET() {
  try {
    const activeAccount = await getActiveAccount();

    const { data, error } = await supabase
      .from("account_scheduler_settings")
      .select("*")
      .eq("account_id", activeAccount.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from("account_scheduler_settings")
        .insert({
          account_id: activeAccount.id,
          min_delay_minutes: 35,
          max_delay_minutes: 55,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ settings: inserted });
    }

    return NextResponse.json({ settings: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load scheduler settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const activeAccount = await getActiveAccount();
    const body = await req.json();

    const min_delay = body.min_delay;
    const max_delay = body.max_delay;

    if (min_delay == null || max_delay == null) {
      return NextResponse.json(
        { error: "Missing min_delay or max_delay" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("account_scheduler_settings")
      .upsert(
        {
          account_id: activeAccount.id,
          min_delay_minutes: min_delay,
          max_delay_minutes: max_delay,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "account_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to save scheduler settings" },
      { status: 500 }
    );
  }
}