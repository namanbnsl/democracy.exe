export const candidates = [
  {
    id: "A",
    name: "Aarav",
    pitch: "More sport. More school spirit.",
    role: "The team player",
    color: "blue",
    emoji: "🏀",
  },
  {
    id: "B",
    name: "Mira",
    pitch: "A voice for every student.",
    role: "The people person",
    color: "pink",
    emoji: "🎨",
  },
  {
    id: "C",
    name: "Kabir",
    pitch: "Better clubs. Bigger ideas.",
    role: "The idea machine",
    color: "green",
    emoji: "💡",
  },
] as const;
export type Candidate = "A" | "B" | "C";
export type Ballot = { count: number; ranking: Candidate[] };
export const spoilerBallots: Ballot[] = [
  { count: 40, ranking: ["A", "B", "C"] },
  { count: 35, ranking: ["B", "C", "A"] },
  { count: 25, ranking: ["C", "B", "A"] },
];
export const cycleBallots: Ballot[] = [
  { count: 34, ranking: ["A", "B", "C"] },
  { count: 33, ranking: ["B", "C", "A"] },
  { count: 33, ranking: ["C", "A", "B"] },
];
export function tally(
  ballots: Ballot[],
  active: Candidate[] = ["A", "B", "C"],
) {
  const counts: Record<Candidate, number> = { A: 0, B: 0, C: 0 };
  for (const ballot of ballots) {
    const first = ballot.ranking.find((id) => active.includes(id));
    if (first) counts[first] += ballot.count;
  }
  return counts;
}
export function pairwise(ballots: Ballot[], a: Candidate, b: Candidate) {
  return ballots.reduce(
    (sum, ballot) =>
      sum +
      (ballot.ranking.indexOf(a) < ballot.ranking.indexOf(b)
        ? ballot.count
        : 0),
    0,
  );
}
export const fairness = [
  {
    title: "Every preference counts",
    formal: "Unrestricted domain",
    icon: "01",
    description:
      "The system must accept any combination of valid individual rankings. You don’t get to ban inconvenient opinions.",
    example:
      "Aarav → Mira → Kabir is allowed. So is Kabir → Aarav → Mira. Every student can have their own order.",
  },
  {
    title: "Respect agreement",
    formal: "Unanimity · Pareto",
    icon: "02",
    description:
      "If every student prefers Aarav to Mira, the group must put Aarav above Mira too.",
    example:
      "Everyone agrees on this pair. A fair group ranking should preserve that agreement, even if students disagree about Kabir.",
  },
  {
    title: "No one rules alone",
    formal: "Non-dictatorship",
    icon: "03",
    description:
      "There must not be one fixed student whose preferences always determine the group’s ranking, regardless of everyone else.",
    example:
      "Letting the head student decide every comparison would produce a ranking. But it would make everyone else’s ballot irrelevant.",
  },
  {
    title: "Keep comparisons independent",
    formal: "Independence of irrelevant alternatives",
    icon: "04",
    description:
      "If nobody changes their preference between Aarav and Mira, the group’s order of those two must stay the same—even when opinions about Kabir change.",
    example:
      "This compares two sets of ballots with the same candidates. Moving Kabir around must not reverse the group’s Aarav-versus-Mira order.",
  },
  {
    title: "Make a coherent ranking",
    formal: "Complete and transitive output",
    icon: "05",
    description:
      "The group must be able to compare every pair consistently. If Aarav ranks above Mira and Mira above Kabir, Aarav must rank above Kabir.",
    example:
      "Aarav beats Mira, Mira beats Kabir, and Kabir beats Aarav is a loop. It cannot be a coherent group ranking.",
  },
];
