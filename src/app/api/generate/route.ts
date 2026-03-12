import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

type ExampleTweetRow = {
  tweet_text: string;
  notes: string | null;
};

type StyleGuideRow = {
  brand_voice: string | null;
  dos: string | null;
  donts: string | null;
  topics: string | null;
};

type ClaudeTweet = {
  tweet_text: string;
};

function extractJsonArray(text: string): string {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON array found in Claude response.");
  }

  return text.slice(start, end + 1);
}

export async function POST() {
  try {
    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("*")
      .eq("x_username", "Rozer_")
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: "Account not found in accounts table." },
        { status: 404 }
      );
    }

    const { data: styleGuide, error: styleError } = await supabaseAdmin
      .from("style_guides")
      .select("brand_voice, dos, donts, topics")
      .eq("account_id", account.id)
      .single<StyleGuideRow>();

    if (styleError || !styleGuide) {
      return NextResponse.json(
        { error: "Style guide not found for this account." },
        { status: 404 }
      );
    }

    const { data: examples, error: examplesError } = await supabaseAdmin
      .from("example_tweets")
      .select("tweet_text, notes")
      .eq("account_id", account.id)
      .limit(20)
      .returns<ExampleTweetRow[]>();

    if (examplesError || !examples || examples.length === 0) {
      return NextResponse.json(
        { error: "No example tweets found for this account." },
        { status: 404 }
      );
    }

    const exampleText = examples
      .map((example, index) => `${index + 1}. ${example.tweet_text}`)
      .join("\n\n");

    const prompt = `
You are a social media writer for the X account @${account.x_username}.

Style guide:
Brand voice: ${styleGuide.brand_voice || ""}
Do: ${styleGuide.dos || ""}
Do not: ${styleGuide.donts || ""}
Topics: ${styleGuide.topics || ""}

Example tweets:
${exampleText}

Write 10 original tweet drafts for today.

Tweet format mix:
- 5 short punchy tweets (1–2 lines)
- 3 medium tweets (3–5 lines)
- 2 longer relatable commentary tweets (5–8 lines)

Short tweets should feel sharp and punchy.

Medium tweets should feel insightful or contrarian.

Long tweets should feel like real observations about the economy, jobs, money, or modern life.

WRITING RULES
- Write like a real sharp human, not a motivational bot
- Avoid generic “get rich” language
- Avoid unrealistic claims
- Avoid cringe inspiration
- Avoid repetitive structure
- Make tweets believable and relatable
- Some tweets should feel like real observations about society
- Use line breaks naturally
- No hashtags
- No emojis

Return ONLY raw JSON.
Do NOT include markdown.
Do NOT include explanation text.
Do NOT include text before or after the JSON.

The output must be a JSON array in exactly this format:
[
  { "tweet_text": "tweet one here" },
  { "tweet_text": "tweet two here" },
  { "tweet_text": "tweet three here" }
]
`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textBlock = msg.content.find((block) => block.type === "text");

    if (!textBlock || !("text" in textBlock)) {
      return NextResponse.json(
        { error: "Claude did not return text output." },
        { status: 500 }
      );
    }

    const rawText = textBlock.text.trim();

    let parsedTweets: ClaudeTweet[];

    try {
      const jsonText = extractJsonArray(rawText);
      parsedTweets = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        {
          error: "Claude returned invalid JSON.",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    const cleanedTweets = parsedTweets.filter(
      (tweet) =>
        tweet &&
        typeof tweet.tweet_text === "string" &&
        tweet.tweet_text.trim().length > 0
    );

    if (cleanedTweets.length === 0) {
      return NextResponse.json(
        { error: "Claude returned no usable tweets.", raw: rawText },
        { status: 500 }
      );
    }

    const draftsToInsert = cleanedTweets.map((tweet, index) => ({
      account_id: account.id,
      tweet_text: tweet.tweet_text.trim(),
      status: "pending",
      inspiration_note: `AI generated draft ${index + 1}`,
      scheduled_for: null,
    }));

    const { data: insertedDrafts, error: insertError } = await supabaseAdmin
      .from("drafts")
      .insert(draftsToInsert)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to save drafts.", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      drafts: insertedDrafts,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong while generating drafts." },
      { status: 500 }
    );
  }
}