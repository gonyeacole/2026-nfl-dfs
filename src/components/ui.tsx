export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</h2>
      {children}
    </div>
  );
}

export function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <table className="w-full border-collapse overflow-hidden rounded-md border border-zinc-200 text-sm dark:border-zinc-800">
      <thead>
        <tr className="bg-zinc-900 text-white dark:bg-zinc-800">
          {head.map((h) => (
            <th key={h} className="border border-zinc-700 px-3 py-2 text-left font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-950 dark:even:bg-zinc-900">
            {row.map((cell, j) => (
              <td key={j} className="border border-zinc-200 px-3 py-2 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
