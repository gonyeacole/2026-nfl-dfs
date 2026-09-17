import { getLeague } from "@/lib/queries";
import { updateLeagueSettings } from "@/lib/actions";
import { Card } from "@/components/ui";

function Field({ label, name, defaultValue, step }: { label: string; name: string; defaultValue: number; step?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      <input
        type="number"
        name={name}
        step={step ?? "1"}
        defaultValue={defaultValue}
        required
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </label>
  );
}

export default async function SettingsPage() {
  const league = await getLeague();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">League Settings</h1>

      <Card title="League Setup & Payouts">
        <form action={updateLeagueSettings} className="grid gap-4 sm:grid-cols-2">
          <Field label="Number of Teams" name="numTeams" defaultValue={league.numTeams} />
          <Field label="Buy In ($)" name="buyIn" defaultValue={league.buyIn} step="0.01" />
          <Field label="Playoff Teams" name="playoffTeams" defaultValue={league.playoffTeams} />
          <Field label="Regular Season Weeks" name="regularSeasonWeeks" defaultValue={league.regularSeasonWeeks} />
          <Field
            label="Weekly Most PF Payout ($/wk)"
            name="weeklyMostPfPayout"
            defaultValue={league.weeklyMostPfPayout}
            step="0.01"
          />
          <Field
            label="Season Most PF Payout ($)"
            name="seasonMostPfPayout"
            defaultValue={league.seasonMostPfPayout}
            step="0.01"
          />
          <Field label="Season 1st Payout ($)" name="season1stPayout" defaultValue={league.season1stPayout} step="0.01" />
          <Field label="Season 2nd Payout ($)" name="season2ndPayout" defaultValue={league.season2ndPayout} step="0.01" />
          <Field label="Season 3rd Payout ($)" name="season3rdPayout" defaultValue={league.season3rdPayout} step="0.01" />

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Save Settings
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
