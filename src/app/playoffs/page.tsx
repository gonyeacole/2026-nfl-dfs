import { getLeague, getTeams, getAllScores } from "@/lib/queries";
import { computeSeasonStandings, computePlayoffBracket, type PlayoffTeam } from "@/lib/standings";
import { formatPercent, formatScore } from "@/lib/format";
import { Card, Table } from "@/components/ui";

export default async function PlayoffsPage() {
  const league = await getLeague();
  const teams = await getTeams();
  const scores = await getAllScores();

  const seasonStandings = computeSeasonStandings(teams, scores, league.regularSeasonWeeks);
  const hasSeasonData = seasonStandings.some((r) => r.gamesPlayed > 0);
  const seeds: PlayoffTeam[] = seasonStandings
    .slice(0, league.playoffTeams)
    .map((r) => ({ teamId: r.teamId, teamName: r.teamName, seed: r.rank }));

  // The bracket format (byes for seeds 1-2, Round 1 for seeds 3-6) is fixed for a 6-team playoff.
  const bracket =
    league.playoffTeams === 6 && seeds.length === 6
      ? computePlayoffBracket(seeds, scores, league.regularSeasonWeeks)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Playoffs</h1>

      <Card title="Playoff Seeds (Final Regular Season Standings)">
        {!hasSeasonData || seeds.length < league.playoffTeams ? (
          <p className="text-sm text-zinc-500">
            Not enough regular season data yet. Enter scores through Week {league.regularSeasonWeeks} on the{" "}
            <a href="/scores" className="underline">
              Scores
            </a>{" "}
            page.
          </p>
        ) : (
          <Table
            head={["Seed", "Team", "Record", "Win %", "PF"]}
            rows={seeds.map((s) => {
              const r = seasonStandings.find((x) => x.teamId === s.teamId)!;
              return [
                String(s.seed),
                s.teamName,
                `${r.wins}-${r.losses}${r.ties ? `-${r.ties}` : ""}`,
                formatPercent(r.winPct),
                formatScore(r.pointsFor),
              ];
            })}
          />
        )}
      </Card>

      {!bracket && hasSeasonData && seeds.length === league.playoffTeams && league.playoffTeams !== 6 && (
        <Card title="Bracket">
          <p className="text-sm text-zinc-500">
            The playoff bracket format (byes for seeds 1-2, Round 1 for seeds 3-6) is defined for a 6-team playoff. Set
            Playoff Teams to 6 in <a href="/settings" className="underline">Settings</a> to see the bracket.
          </p>
        </Card>
      )}

      {bracket && (
        <>
          <Card title={`Round 1 — Week ${bracket.round1.week}`}>
            <p className="mb-3 text-xs text-zinc-500">Seeds 1-2 bye directly to Round 2.</p>
            <Table
              head={["Seed", "Team", "Score", "HFA", "Adj. Score", "Result"]}
              rows={bracket.round1.teams.map((t) => [
                String(t.seed),
                t.teamName,
                t.rawScore !== undefined ? formatScore(t.rawScore) : "—",
                typeof t.hfaBonus === "number" ? `+${t.hfaBonus}` : "—",
                t.adjustedScore !== undefined ? formatScore(t.adjustedScore) : "—",
                t.advanced === undefined ? "Pending" : t.advanced ? "Advances" : "Eliminated",
              ])}
            />
          </Card>

          <Card title={`Round 2 — Week ${bracket.round2.week}`}>
            {bracket.round2.teams.length === 0 ? (
              <p className="text-sm text-zinc-500">Waiting on Round 1 results.</p>
            ) : (
              <Table
                head={["Seed", "Team", "Score", "HFA", "Adj. Score", "Result"]}
                rows={bracket.round2.teams.map((t) => [
                  String(t.seed),
                  t.teamName,
                  t.rawScore !== undefined ? formatScore(t.rawScore) : "—",
                  `+${t.hfaBonus}`,
                  t.adjustedScore !== undefined ? formatScore(t.adjustedScore) : "—",
                  t.advanced === undefined ? "Pending" : t.advanced ? "Advances" : "Eliminated",
                ])}
              />
            )}
          </Card>

          <Card title={`Finals — Week ${bracket.finals.week}`}>
            {bracket.finals.teams.length === 0 ? (
              <p className="text-sm text-zinc-500">Waiting on Round 2 results.</p>
            ) : (
              <>
                <Table
                  head={["Team", "Week Score", "Result"]}
                  rows={bracket.finals.teams.map((t) => [
                    t.teamName,
                    t.rawScore !== undefined ? formatScore(t.rawScore) : "—",
                    bracket.finals.championId === t.teamId
                      ? "🏆 Champion"
                      : bracket.finals.complete
                        ? "Runner-up"
                        : "Pending",
                  ])}
                />
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
