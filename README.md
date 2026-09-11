# democracy.exe

A shared-screen, five-minute science exhibition about picking a school prefect—and the limits of a perfectly fair voting rule. Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn-style button composition, Radix Dialog, and the Vercel AI SDK with Google Gemini. Fonts are bundled locally.

## Run

```sh
bun install
bun run dev
```

Open http://localhost:3000. All voting experiments work without an API key. To enable **Ask the computer**, copy `.env.example` to `.env.local`, set `GOOGLE_GENERATIVE_AI_API_KEY`, and restart the server. The key stays on the server. You can override the model with `GOOGLE_GENERATIVE_AI_MODEL`.

## Visitor journey

1. Predict a prefect. Plurality elects Aarav with 40 of 100 votes. Remove Kabir and Mira wins 60–40: a spoiler effect.
2. Run instant runoff on the original ballots. Kabir’s 25 votes transfer to Mira. Rankings fix this example, not every spoiler effect.
3. Explore Arrow’s conditions and the requirement of a complete, transitive group ranking.
4. Compare a new profile head-to-head. It creates a Condorcet cycle. This illustrates majority rule’s failure of transitivity; it is not a proof of Arrow’s theorem.

Start / Run it again resets the experiment. Ballots are simulated; no visitor votes are collected or persisted. The AI is an optional explainer and never calculates or decides the election. Visitor questions are sent to Google only when configured and submitted. Missing keys and provider failures appear as clear UI messages.

## Validation

```sh
bun run lint
bunx tsc --noEmit
bun run test
bun run build
# With the dev server running:
node scripts/check-exhibit.mjs
```

The AI endpoint limits input size, output tokens and request time, and rejects cross-origin requests. This is a local exhibition prototype; before public deployment, add durable rate limiting and provider budget controls. Live Gemini responses require a valid key and network access.

## Mathematical references

- [Arrow’s theorem — Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/arrows-theorem/)
- [Social choice theory — Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/social-choice/)
- [Vercel AI SDK Google provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)

The headline is a hook: Arrow’s theorem is about the incompatibility of specific ranking conditions for all preference profiles with at least three alternatives. It does not prove that democracy is impossible or that every ranked method is better than every unranked method.
