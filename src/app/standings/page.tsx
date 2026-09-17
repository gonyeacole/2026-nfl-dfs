import Link from "next/link";
import { getLeague, getTeams, getAllScores } from "@/lib/queries";
import { computeWeeklyRecord, computeSeasonStandings, computeWeeklyMostPF } from "@/lib/standings";
import { formatCurrency, formatPercent, formatScore } from "@/lib/format";
import { Card, Table } from "@/components/ui";

export default async function StandingsPage(props: PageProps<"/standings">) {
  const searchParams = await props.searchParams;
  const league = await getLeague();
  const teams = await getTeams();
  const scores = await getAllScores();

  const weekParam = Number(searchParams.week);
  const week =
    Number.isInteger(weekParam) && weekParam >= 1 && weekParam <= league.regularSeasonWeeks
      ? weekParam
      : league.regularSeasonWeeks;

  const weeklyRecord = computeWeeklyRecord(teams, scores, week);
  const seasonStandings = computeSeasonStandings(teams, scores, week);
  const weeklyMostPF = computeWeeklyMostPF(teams, scores, week);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Standings</h1>

      <Card title="Regular Season Week">
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: league.regularSeasonWeeks }, (_, i) => i + 1).map((w) => (
            <Link
              key={w}
              href={`/standings?week=${w}`}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                w === week
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              Wk {w}
            </Link>
          ))}
        </div>
      </Card>

      <Card title={`Week ${week} Record (vs. All)`}>
        {weeklyRecord.length === 0 ? (
          <p className="text-sm text-zinc-500">No scores entered for Week {week} yet.</p>
        ) : (
          <>
            <Table
              head={["Rank", "Team", "Score", "Record"]}
              rows={weeklyRecord.map((r) => [
                String(r.rank),
                r.teamName,
                formatScore(r.score),
                `${r.wins}-${r.losses}${r.ties ? `-${r.ties}` : ""}`,
              ])}
            />
            {weeklyMostPF.length > 0 && (
              <p className="mt-3 text-xs text-zinc-500">
                Weekly Most PF ({formatCurrency(league.weeklyMostPfPayout)}):{" "}
                {weeklyMostPF.map((t) => t.teamName).join(", ")}
              </p>
            )}
          </>
        )}
      </Card>

      <Card title={`Season Standings (through Week ${week})`}>
        {seasonStandings.every((r) => r.gamesPlayed === 0) ? (
          <p className="text-sm text-zinc-500">No scores entered yet.</p>
        ) : (
          <Table
            head={["Rank", "Team", "Record", "Win %", "PF"]}
            rows={seasonStandings.map((r) => [
              String(r.rank),
              r.teamName,
              `${r.wins}-${r.losses}${r.ties ? `-${r.ties}` : ""}`,
              formatPercent(r.winPct),
              formatScore(r.pointsFor),
            ])}
          />
        )}
      </Card>
    </div>
  );
}
