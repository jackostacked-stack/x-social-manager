import { createClient } from "@supabase/supabase-js";
import { TwitterApi } from "twitter-api-v2";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getActiveAccount() {
  const { data, error } = await supabaseAdmin
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

export function getTwitterClientForAccount(account) {
  return new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: account.oauth_token,
    accessSecret: account.oauth_token_secret,
  });
}