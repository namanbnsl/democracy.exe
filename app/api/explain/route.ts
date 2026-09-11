import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
export const maxDuration = 30;
const schema = z.object({
  question: z.string().trim().min(1).max(500),
  chapter: z.enum(["welcome", "spoiler", "ranked", "fairness", "paradox"]),
});
export async function POST(request: Request) {
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== new URL(request.url).origin
  )
    return Response.json(
      { error: "Please ask from the exhibit." },
      { status: 403 },
    );
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 4000)
      return Response.json(
        { error: "Please keep your question short." },
        { status: 413 },
      );
    body = schema.safeParse(JSON.parse(raw));
  } catch {
    return Response.json(
      { error: "Please send a valid question." },
      { status: 400 },
    );
  }
  if (!body.success)
    return Response.json(
      { error: "Ask a question of 1–500 characters." },
      { status: 400 },
    );
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    return Response.json(
      {
        error:
          "AI is not connected yet. You can still explore every experiment and the built-in explanations.",
      },
      { status: 503 },
    );
  try {
    const { text } = await generateText({
      model: google(
        process.env.GOOGLE_GENERATIVE_AI_MODEL || "gemini-2.5-flash",
      ),
      system: `You are the friendly computer in democracy.exe, a school science exhibition. Answer only questions about voting, this exhibit, social choice and Arrow's theorem. Use plain text, at most 120 words, for ages 12+. No partisan persuasion. Explain mechanisms clearly. Exhibit candidates: Aarav A, Mira B, Kabir C. Spoiler profile: 40 A>B>C, 35 B>C>A, 25 C>B>A. Plurality A40 B35 C25. Remove C: A40 B60. Instant runoff eliminates C and transfers 25 to B, who wins 60 to 40. Cycle profile: 34 A>B>C, 33 B>C>A, 33 C>A>B. Pairwise A beats B 67:33, B beats C 67:33, C beats A 66:34. This cycle illustrates majority rule's intransitivity, not a proof of Arrow. Arrow: with 3+ alternatives and unrestricted valid individual rankings, no aggregation rule yielding a complete transitive social ranking can satisfy Pareto, IIA and non-dictatorship for every profile. IIA fixes pairwise individual preferences while other rankings change on the same candidate set. Do not equate Arrow with democracy being impossible or all ranked methods being superior. Visitor chapter: ${body.data.chapter}.`,
      prompt: body.data.question,
      maxOutputTokens: 500,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(25000),
    });
    return Response.json({ text });
  } catch {
    return Response.json(
      {
        error:
          "The computer could not reach Gemini. Please try again, or use the built-in explanations.",
      },
      { status: 502 },
    );
  }
}
