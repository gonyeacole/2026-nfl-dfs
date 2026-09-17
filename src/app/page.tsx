import { getLeague } from "@/lib/queries";
import { formatCurrency, formatPercent } from "@/lib/format";
import { HFA_ROUND1, HFA_ROUND2 } from "@/lib/league-defaults";
import { Card, Table } from "@/components/ui";

export default async function Home() {
  const league = await getLeague();
  const totalPrizePool = league.numTeams * league.buyIn;

  // Weekly Most PF pays out every week of the season, including the 3 playoff weeks.
  const totalSeasonWeeks = league.regularSeasonWeeks + 3;
  const weeklyMostPfTotal = league.weeklyMostPfPayout * totalSeasonWeeks;
  const payoutRows = [
    {
      award: "Weekly Most PF",
      payout: `${formatCurrency(league.weeklyMostPfPayout)}/wk (${formatCurrency(weeklyMostPfTotal)})`,
      pct: weeklyMostPfTotal / totalPrizePool,
    },
    { award: "Season Most PF", payout: formatCurrency(league.seasonMostPfPayout), pct: league.seasonMostPfPayout / totalPrizePool },
    { award: "Season 1st", payout: formatCurrency(league.season1stPayout), pct: league.season1stPayout / totalPrizePool },
    { award: "Season 2nd", payout: formatCurrency(league.season2ndPayout), pct: league.season2ndPayout / totalPrizePool },
    { award: "Season 3rd", payout: formatCurrency(league.season3rdPayout), pct: league.season3rdPayout / totalPrizePool },
  ];

  const gamesPerWeek = league.numTeams - 1;
  const weeklyRecordExamples = [
    { label: "1st", wins: gamesPerWeek, losses: 0 },
    { label: "2nd", wins: gamesPerWeek - 1, losses: 1 },
    { label: "3rd", wins: gamesPerWeek - 2, losses: 2 },
  ];

  const round1Week = league.regularSeasonWeeks + 1;
  const round2Week = league.regularSeasonWeeks + 2;
  const finalsWeek = league.regularSeasonWeeks + 3;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{league.name}</h1>
      </div>

      <section className="grid gap-6 sm:grid-cols-2">
        <Card title="League Setup">
          <Table
            head={["Teams", "Buy In", "Total Prize Pool", "Playoff Teams"]}
            rows={[[String(league.numTeams), formatCurrency(league.buyIn), formatCurrency(totalPrizePool), String(league.playoffTeams)]]}
          />
        </Card>

        <Card title="Payouts">
          <Table
            head={["Award", "Payout", "% of Prize Pool"]}
            rows={payoutRows.map((r) => [r.award, r.payout, formatPercent(r.pct)])}
          />
        </Card>
      </section>

      <Card title="Regular Season">
        <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            Each week, build a DFS lineup in the corresponding DraftKings contest using the provided player pool and a
            $50,000 salary cap.
          </li>
          <li>
            Weekly records are determined using a vs. all format, meaning each team is matched against every other team
            each week and a win is awarded for every team you outscore that week, while a loss is recorded for every
            team that outscores you.
          </li>
          <li>Season standings are determined by Win Percentage. Tiebreaker: Total Points For.</li>
        </ul>

        <div className="mt-4 max-w-xs">
          <Table
            head={[`Weekly Record (Ex: ${league.numTeams} Teams)`, ""]}
            rows={[
              ...weeklyRecordExamples.map((r) => [r.label, `${r.wins}-${r.losses}`]),
              ["...", "..."],
              ["Last", `0-${gamesPerWeek}`],
            ]}
          />
        </div>
      </Card>

      <Card title="Playoffs">
        <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Round 1 — Week {round1Week}</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Seeds 1-2 receive a bye and automatically advance to Round 2.</li>
              <li>Seeds 3-6 compete.</li>
              <li>Each team receives a Home Field Advantage (HFA) bonus based on its playoff seed.</li>
              <li>The HFA bonus is added directly to the team&rsquo;s Week {round1Week} DFS score.</li>
              <li>The 2 highest-scoring teams after HFA is applied advance to Round 2.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Round 2 — Week {round2Week}</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>The 2 first-round winners join Seeds 1-2.</li>
              <li>The 4 remaining teams are reseeded according to their final regular-season standings.</li>
              <li>HFA bonuses are adjusted based on the team&rsquo;s new playoff seed.</li>
              <li>The 2 highest-scoring teams after HFA is applied advance to the Finals.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Finals — Week {finalsWeek}</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>The 2 remaining teams compete for the championship.</li>
              <li>No HFA bonus is applied.</li>
              <li>The team with the highest Week {finalsWeek} DFS score wins the championship.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <Table
            head={["Seed", `Rd 1 (Week ${round1Week})`, `Rd 2 (Week ${round2Week})`, `Finals (Week ${finalsWeek})`]}
            rows={[1, 2, 3, 4, 5, 6].map((seed) => [
              String(seed),
              HFA_ROUND1[seed] === "bye" ? "Bye" : `+${HFA_ROUND1[seed]}`,
              seed in HFA_ROUND2 ? `+${HFA_ROUND2[seed]}` : "—",
              seed <= 2 ? "+0" : "—",
            ])}
          />
        </div>
      </Card>
    </div>
  );
}
