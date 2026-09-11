"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Monitor,
  Sparkles,
  X,
  Check,
  ChevronRight,
  Send,
  FlaskConical,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  candidates,
  spoilerBallots,
  cycleBallots,
  tally,
  pairwise,
  fairness,
  type Candidate,
  type Ballot,
} from "@/lib/voting";
import logo from "@/logo.png";

const chapters = [
  "welcome",
  "spoiler",
  "ranked",
  "fairness",
  "paradox",
] as const;
const chapterNames = [
  "Welcome",
  "The spoiler effect",
  "Rank your vote",
  "The fairness checklist",
  "The impossible result",
];

function WindowBar({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="window-bar">
      <span className="window-title">
        <Monitor size={15} />
        {children}
      </span>
      {onClose ? (
        <button
          className="window-control"
          aria-label="Close window"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
function Artwork() {
  return <div className="original-artwork"><Image src={logo} alt="democracy.exe: the original blue, pink and green impossible-triangle ballot box" priority sizes="(max-width: 650px) 90vw, 540px" /></div>;
}
function Ballots({ ballots }: { ballots: Ballot[] }) {
  return (
    <details className="ballot-details"><summary>See how the 100 students ranked their choices</summary><div className="ballot-groups">
      {ballots.map((b, i) => (
        <div className="ballot-group" key={i}>
          <strong>{b.count} students</strong>
          <div>
            {b.ranking.map((id, index) => (
              <span key={id}>
                <span
                  className={`candidate-chip ${candidates.find((c) => c.id === id)!.color}`}
                >
                  {candidates.find((c) => c.id === id)!.name}
                </span>
                {index < 2 && <ChevronRight size={13} />}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div></details>
  );
}

export function DemocracyDesktop() {
  const [step, setStep] = useState(0);
  const [removed, setRemoved] = useState(false);
  const [transferred, setTransferred] = useState(false);
  const [selectedFairness, setSelectedFairness] = useState(0);
  const [pair, setPair] = useState(0);
  const [prediction, setPrediction] = useState<Candidate | null>(null);
  const [dialog, setDialog] = useState<"ai" | "about" | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestPending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const counts = tally(
    spoilerBallots,
    removed || (step === 2 && transferred) ? ["A", "B"] : ["A", "B", "C"],
  );
  const go = (index: number) => {
    setStep(index);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const reset = () => {
    setRemoved(false);
    setTransferred(false);
    setPrediction(null);
    setPair(0);
    setSelectedFairness(0);
    setQuestion("");
    setAnswer("");
    setError("");
    go(0);
  };
  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (!question.trim() || requestPending.current) return;
    requestPending.current = true;
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, chapter: chapters[step] }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Please try again.");
      setAnswer(data.text);
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "TimeoutError"
          ? e.message
          : "The computer took too long. Please try again.",
      );
    } finally {
      setLoading(false);
      requestPending.current = false;
    }
  }
  const pairs: [Candidate, Candidate][] = [
    ["A", "B"],
    ["B", "C"],
    ["C", "A"],
  ];
  const currentPair = pairs[pair];
  return (
    <div className="desktop">
      <header className="desktop-header">
        <button onClick={reset} className="brand">democracy.exe</button>
        <div className="header-actions">
          {step > 0 && <button onClick={reset}>Start over</button>}
          <button className="about-link" onClick={() => setDialog("about")}>About</button>
        </div>
      </header>
      <main className="main-desktop">
        <section className={`main-window ${step === 0 ? "intro-window" : ""}`}>
          {step === 0 ? (
            <div className="welcome-content">
              <div className="hero">
                <div className="hero-copy">
                  <p className="eyebrow">A FIVE-MINUTE VOTING EXPERIMENT</p>
                  <h1 ref={heading} tabIndex={-1}>Can we choose<br/>a prefect fairly?</h1>
                  <p className="hero-description">Three candidates. One school prefect.<br/>Let’s find out what makes an election fair.</p>
                  <Button variant="primary" onClick={() => go(1)}>Run the experiment <ArrowRight size={19}/></Button>
                </div>
                <Artwork />
              </div>
            </div>
          ) : (
            <div className="experiment-content">
              <div className="chapter-heading">
                <p className="eyebrow">{step} OF 4 · {chapterNames[step]}</p>
                <h1 ref={heading} tabIndex={-1}>
                  {step === 1
                    ? "Meet your next prefect."
                    : step === 2
                      ? "What if we ranked them?"
                      : step === 3
                        ? "Sounds fair. Can we have it all?"
                        : "A beats B. B beats C. C beats… A?"}
                </h1>
                <p>
                  {step === 1
                    ? "100 students are choosing a prefect. These are their honest preferences."
                    : step === 2
                      ? "Same 100 students. Same preferences. This time, second choices count."
                      : step === 3
                        ? "Before building the perfect voting system, decide what it should promise."
                        : "A new class, a new set of preferences. Let’s compare candidates two at a time."}
                </p>
              </div>
              {step === 1 && (
                <>
                  <div className="candidate-cards">
                    {candidates.map((c) => (
                      <button
                        key={c.id}
                        aria-pressed={prediction === c.id}
                        className={`candidate-card ${c.color} ${prediction === c.id ? "chosen" : ""}`}
                        onClick={() => setPrediction(c.id)}
                      >
                        <span className="candidate-avatar">{c.emoji}</span>
                        <span className="candidate-id">CANDIDATE {c.id}</span>
                        <h2>
                          {c.name}
                          {prediction === c.id && <Check size={18} />}
                        </h2>
                        <p>{c.pitch}</p>
                      </button>
                    ))}
                  </div>
                  <p className="prediction-note">
                    {prediction
                      ? `Your pick: ${candidates.find((c) => c.id === prediction)!.name}. Now watch what the voting rule does.`
                      : "Make a prediction: tap the candidate you think should win."}
                  </p>
                  <Ballots ballots={spoilerBallots} />
                  <div className="results-layout">
                    <div className="result-panel">
                      <div className="panel-label">
                        FIRST-PAST-THE-POST <span>First choices only</span>
                      </div>
                      {candidates.map((c) => (
                        <div className="bar-row" key={c.id}>
                          <span>{c.name}</span>
                          <div className="bar-track">
                            <div
                              className={`vote-bar ${c.color}`}
                              style={{ width: `${counts[c.id]}%` }}
                            />
                          </div>
                          <strong>{counts[c.id]}</strong>
                        </div>
                      ))}
                      <p className="winner-line" aria-live="polite">
                        ★{" "}
                        {removed
                          ? "Mira wins with 60 votes."
                          : "Aarav wins with 40 votes."}
                      </p>
                    </div>
                    <div className="insight-panel">
                      <h3>
                        {removed
                          ? "Same people. A different winner."
                          : "Try removing a candidate."}
                      </h3>
                      <p>
                        {removed
                          ? "Kabir’s 25 voters prefer Mira next. She now wins 60–40, although nobody changed their mind about Aarav versus Mira. Kabir split the vote."
                          : "Kabir comes last. Surely removing him shouldn’t change who wins? Click below and find out."}
                      </p>
                      <Button onClick={() => setRemoved(!removed)}>
                        {removed ? <RotateCcw size={16} /> : <X size={16} />}{" "}
                        {removed ? "Bring Kabir back" : "Remove Kabir"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <Ballots ballots={spoilerBallots} />
                  <div className="results-layout ranked-layout">
                    <div className="result-panel">
                      <div className="panel-label">
                        INSTANT-RUNOFF VOTING{" "}
                        <span>Round {transferred ? "2" : "1"} of 2</span>
                      </div>
                      {candidates.map((c) => (
                        <div className="bar-row" key={c.id}>
                          <span>{c.name}</span>
                          <div className="bar-track">
                            <div
                              className={`vote-bar ${c.color}`}
                              style={{
                                width: `${(transferred ? tally(spoilerBallots, ["A", "B"]) : tally(spoilerBallots))[c.id]}%`,
                              }}
                            />
                          </div>
                          <strong>
                            {
                              (transferred
                                ? tally(spoilerBallots, ["A", "B"])
                                : tally(spoilerBallots))[c.id]
                            }
                          </strong>
                        </div>
                      ))}
                      <p className="winner-line" aria-live="polite">
                        {transferred
                          ? "★ Mira wins: 60 votes. A majority!"
                          : "No majority yet. Kabir has the fewest votes."}
                      </p>
                    </div>
                    <div className="insight-panel">
                      <h3>
                        {transferred
                          ? "Your next choice still has a voice."
                          : "Eliminate. Transfer. Count again."}
                      </h3>
                      <p>
                        {transferred
                          ? "All 25 Kabir-first ballots move to Mira, their next remaining choice. Mira’s 35 becomes 60. The ranking rescued votes that plurality ignored."
                          : "Nobody has more than 50 votes. Eliminate Kabir and transfer each of his ballots to its next remaining candidate."}
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => setTransferred(!transferred)}
                      >
                        {transferred ? "Replay the count" : "Transfer 25 votes"}{" "}
                        {transferred ? (
                          <RotateCcw size={16} />
                        ) : (
                          <ArrowRight size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="thought-note">
                    <span>PATCH NOTES</span>
                    <h3>One bug fixed. Is the whole system fixed?</h3>
                    <p>
                      Ranked ballots give us more information. Instant runoff
                      fixes this particular spoiler example, but it can still
                      have spoiler effects in other elections. “Ranked”
                      describes a ballot; the counting rule still matters.
                    </p>
                  </div>
                </>
              )}
              {step === 3 && (
                <div className="fairness-layout">
                  <div className="fairness-list">
                    {fairness.map((item, i) => (
                      <button
                        key={item.title}
                        aria-pressed={selectedFairness === i}
                        onClick={() => setSelectedFairness(i)}
                        className={selectedFairness === i ? "selected" : ""}
                      >
                        <span>{item.icon}</span>
                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.formal}</small>
                        </div>
                        <ChevronRight size={18} />
                      </button>
                    ))}
                  </div>
                  <div className="fairness-detail" aria-live="polite">
                    <span className="large-number">
                      0{selectedFairness + 1}
                    </span>
                    <h2>{fairness[selectedFairness].title}</h2>
                    <p>{fairness[selectedFairness].description}</p>
                    <div className="example-box">
                      <span>IN OUR SCHOOL</span>
                      <p>{fairness[selectedFairness].example}</p>
                    </div>
                    <small>
                      With three or more candidates, Arrow proved that no rule
                      can guarantee all of these for every possible preference
                      profile.
                    </small>
                  </div>
                </div>
              )}
              {step === 4 && (
                <>
                  <Ballots ballots={cycleBallots} />
                  <div className="cycle-layout">
                    <div className="cycle-panel">
                      <div className="panel-label">
                        HEAD-TO-HEAD / MAJORITY RULE
                      </div>
                      <div className="cycle-choices">
                        {pairs.map(([a, b], i) => (
                          <button
                            key={a}
                            className={pair === i ? "active" : ""}
                            onClick={() => setPair(i)}
                          >
                            {a} vs {b}
                          </button>
                        ))}
                      </div>
                      <div className="pair-result" aria-live="polite">
                        <div>
                          <span
                            className={`candidate-chip ${candidates.find((c) => c.id === currentPair[0])!.color}`}
                          >
                            {
                              candidates.find((c) => c.id === currentPair[0])!
                                .name
                            }
                          </span>
                          <strong>
                            {pairwise(cycleBallots, ...currentPair)}
                          </strong>
                        </div>
                        <span>beats</span>
                        <div>
                          <span
                            className={`candidate-chip ${candidates.find((c) => c.id === currentPair[1])!.color}`}
                          >
                            {
                              candidates.find((c) => c.id === currentPair[1])!
                                .name
                            }
                          </span>
                          <strong>
                            {100 - pairwise(cycleBallots, ...currentPair)}
                          </strong>
                        </div>
                      </div>
                      <p>
                        Read each ballot from left to right.
                        <br />
                        Whichever name appears first wins that group’s votes.
                      </p>
                      <div className="cycle-summary">
                        A <ArrowRight size={15} /> B <ArrowRight size={15} /> C{" "}
                        <ArrowRight size={15} /> A{" "}
                        <span>…and around we go.</span>
                      </div>
                    </div>
                    <div className="theorem-panel">
                      <span className="error-label">
                        ! THE CONDORCET PARADOX
                      </span>
                      <h2>
                        Everyone is consistent.
                        <br />
                        The group isn’t.
                      </h2>
                      <p>
                        A majority prefers Aarav to Mira, Mira to Kabir, and
                        Kabir to Aarav. Majority comparisons form a loop.
                      </p>
                      <p>
                        This shows majority rule failing transitivity. It’s an
                        illustration of a problem—not a proof of Arrow’s more
                        general theorem.
                      </p>
                    </div>
                  </div>
                  <div className="final-reveal">
                    <span className="eyebrow">
                      SO, IS DEMOCRACY IMPOSSIBLE?
                    </span>
                    <h2>A perfect rule is. A better choice isn’t.</h2>
                    <p>
                      Arrow’s theorem rules out a ranked aggregation system that
                      always satisfies every condition we just explored. It
                      doesn’t rule out democracy. It asks us to choose which
                      trade-offs we can live with.
                    </p>
                    <a
                      href="https://plato.stanford.edu/entries/arrows-theorem/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read the theorem · Stanford Encyclopedia of Philosophy ↗
                    </a>
                  </div>
                </>
              )}
              <div className="chapter-footer">
                <Button onClick={() => go(step - 1)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <span>{step} / 4</span>
                <Button
                  variant="primary"
                  onClick={() => (step === 4 ? reset() : go(step + 1))}
                >
                  {step === 1
                    ? "Can rankings fix this?"
                    : step === 2
                      ? "Define a fair system"
                      : step === 3
                        ? "Put it to the test"
                        : "Run it again"}
                  {step === 4 ? (
                    <RotateCcw size={16} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </Button>
              </div>
            </div>
          )}
        </section>
        <footer className="exhibit-footer">
          <span>100 simulated voters. Real mathematics.</span>
          <button onClick={() => setDialog("ai")}><Sparkles size={16}/> Ask AI</button>
        </footer>
      </main>
      <Dialog.Root
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-window">
            <WindowBar onClose={() => setDialog(null)}>
              {dialog === "ai" ? "ask_the_computer.exe" : "readme.txt"}
            </WindowBar>
            <div className="dialog-body">
              <Dialog.Title>
                {dialog === "ai"
                  ? "A little confused? Good."
                  : "Hello, curious human."}
              </Dialog.Title>
              <Dialog.Description>
                {dialog === "ai"
                  ? "Ask about the experiment, a voting rule, or why fairness is so complicated."
                  : "democracy.exe is an interactive science exhibition about the mathematics of collective choice."}
              </Dialog.Description>
              {dialog === "ai" ? (
                <>
                  <div className="suggestions">
                    {[
                      "Why does the winner change?",
                      "Does Arrow mean voting is pointless?",
                    ].map((q) => (
                      <button key={q} onClick={() => setQuestion(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={ask}>
                    <label htmlFor="question">Your question</label>
                    <textarea
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      maxLength={500}
                      placeholder="Can any voting system be perfectly fair?"
                      required
                    />
                    <div className="ai-form-footer">
                      <small>Powered by Gemini · AI can make mistakes</small>
                      <Button
                        variant="primary"
                        disabled={loading || !question.trim()}
                        type="submit"
                      >
                        {loading ? "Thinking…" : "Ask"}
                        <Send size={15} />
                      </Button>
                    </div>
                  </form>
                  {loading && <p role="status">The computer is thinking…</p>}
                  {error && (
                    <p className="ai-error" role="alert">
                      {error}
                    </p>
                  )}
                  {answer && (
                    <div className="ai-answer" role="status">
                      {answer}
                    </div>
                  )}
                  <p className="ai-footnote">
                    Your question is sent to Google Gemini when connected. No
                    names or personal details needed.
                  </p>
                </>
              ) : (
                <>
                  <Image
                    src={logo}
                    alt="Original democracy.exe artwork with a pastel impossible triangle ballot box on a retro desktop"
                    className="about-logo"
                  />
                  <p>
                    Choose a prefect, uncover the spoiler effect, try instant
                    runoff, and explore the limits of a perfectly fair ranking.
                  </p>
                  <p>
                    The election data is simulated and the vote counts are
                    calculated locally. AI is an optional explainer, never the
                    judge.
                  </p>
                  <Button
                    onClick={() => {
                      setDialog(null);
                      go(1);
                    }}
                  >
                    Let’s experiment <FlaskConical size={16} />
                  </Button>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
