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

export async function POST(req: NextRequest) {
  try {
    const activeAccount = await getActiveAccount();
    const body = await req.json();
    const tweet_text = body.tweet_text;

    if (!tweet_text) {
      return NextResponse.json(
        { error: "tweet_text is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("drafts")
      .insert({
        tweet_text,
        status: "approved",
        account_id: activeAccount.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}