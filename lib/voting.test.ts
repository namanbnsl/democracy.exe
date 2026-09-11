import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { tally, pairwise, spoilerBallots, cycleBallots } from "./voting";
describe("exhibition mathematics", () => {
  test("plurality spoiler flips the winner without changing preferences", () => {
    assert.deepEqual(tally(spoilerBallots), { A: 40, B: 35, C: 25 });
    assert.deepEqual(tally(spoilerBallots, ["A", "B"]), { A: 40, B: 60, C: 0 });
  });
  test("all ballots are complete rankings and both profiles contain 100 voters", () => {
    for (const profile of [spoilerBallots, cycleBallots]) {
      assert.equal(
        profile.reduce((sum, b) => sum + b.count, 0),
        100,
      );
      for (const b of profile)
        assert.deepEqual([...b.ranking].sort(), ["A", "B", "C"]);
    }
  });
  test("majority comparisons form the displayed cycle", () => {
    assert.equal(pairwise(cycleBallots, "A", "B"), 67);
    assert.equal(pairwise(cycleBallots, "B", "C"), 67);
    assert.equal(pairwise(cycleBallots, "C", "A"), 66);
    for (const [a, b] of [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
    ] as const)
      assert.equal(
        pairwise(cycleBallots, a, b) + pairwise(cycleBallots, b, a),
        100,
      );
  });
});
