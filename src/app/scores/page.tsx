import Link from "next/link";
import { getLeague, getTeams, getScoresForWeek } from "@/lib/queries";
import { upsertWeeklyScores } from "@/lib/actions";
import { Card } from "@/components/ui";

export default async function ScoresPage(props: PageProps<"/scores">) {
  const searchParams = await props.searchParams;
  const league = await getLeague();
  const teams = await getTeams();

  const totalWeeks = league.regularSeasonWeeks + 3;
  const weekParam = Number(searchParams.week);
  const week = Number.isInteger(weekParam) && weekParam >= 1 && weekParam <= totalWeeks ? weekParam : 1;

  const scores = await getScoresForWeek(week);
  const scoreByTeam = new Map(scores.map((s) => [s.teamId, s.score]));

  const isPlayoffWeek = week > league.regularSeasonWeeks;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Weekly Scores</h1>

      <Card title="Select Week">
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
            <Link
              key={w}
              href={`/scores?week=${w}`}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                w === week
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {w > league.regularSeasonWeeks
                ? ["Rd 1", "Rd 2", "Finals"][w - league.regularSeasonWeeks - 1]
                : `Wk ${w}`}
            </Link>
          ))}
        </div>
      </Card>

      <Card title={`Week ${week} DFS Scores${isPlayoffWeek ? " (Playoffs)" : ""}`}>
        {teams.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No teams yet. Add teams on the <Link href="/teams" className="underline">Teams</Link> page first.
          </p>
        ) : (
          <form action={upsertWeeklyScores} className="flex flex-col gap-3">
            <input type="hidden" name="week" value={week} />
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th className="py-2 pr-3">Team</th>
                  <th className="py-2">DFS Score</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                    <td className="py-2 pr-3 text-zinc-800 dark:text-zinc-200">
                      <input type="hidden" name="teamId" value={team.id} />
                      {team.name}
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="0.01"
                        name={`score-${team.id}`}
                        defaultValue={scoreByTeam.get(team.id) ?? ""}
                        placeholder="—"
                        className="w-28 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="submit"
              className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Save Week {week} Scores
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
