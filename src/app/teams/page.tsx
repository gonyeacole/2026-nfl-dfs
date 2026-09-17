import { getTeams } from "@/lib/queries";
import { addTeam, deleteTeam } from "@/lib/actions";
import { Card } from "@/components/ui";

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Teams</h1>

      <Card title="Add a Team">
        <form action={addTeam} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Team name
            </label>
            <input
              id="name"
              name="name"
              required
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="owner" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Owner (optional)
            </label>
            <input
              id="owner"
              name="owner"
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Team
          </button>
        </form>
      </Card>

      <Card title={`Teams (${teams.length})`}>
        {teams.length === 0 ? (
          <p className="text-sm text-zinc-500">No teams yet. Add your league&rsquo;s teams above.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {teams.map((team) => (
              <li key={team.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{team.name}</p>
                  {team.owner && <p className="text-xs text-zinc-500">{team.owner}</p>}
                </div>
                <form action={deleteTeam}>
                  <input type="hidden" name="id" value={team.id} />
                  <button
                    type="submit"
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
