import { HFA_ROUND1, HFA_ROUND2 } from "@/lib/league-defaults";

export interface TeamInfo {
  id: string;
  name: string;
  owner?: string | null;
}

export interface ScoreEntry {
  teamId: string;
  week: number;
  score: number;
}

export interface WeeklyRecordRow {
  teamId: string;
  teamName: string;
  score: number;
  wins: number;
  losses: number;
  ties: number;
  rank: number;
}

export interface SeasonStandingRow {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  pointsFor: number;
  gamesPlayed: number;
  rank: number;
}

function scoreFor(scores: ScoreEntry[], teamId: string, week: number): number | undefined {
  return scores.find((s) => s.teamId === teamId && s.week === week)?.score;
}

/** "Vs. all" weekly record: a team beats every other team it outscores that week. */
export function computeWeeklyRecord(teams: TeamInfo[], scores: ScoreEntry[], week: number): WeeklyRecordRow[] {
  const weekScores = teams
    .map((team) => ({ team, score: scoreFor(scores, team.id, week) }))
    .filter((row): row is { team: TeamInfo; score: number } => row.score !== undefined);

  const rows = weekScores.map(({ team, score }) => {
    let wins = 0;
    let losses = 0;
    let ties = 0;
    for (const other of weekScores) {
      if (other.team.id === team.id) continue;
      if (score > other.score) wins++;
      else if (score < other.score) losses++;
      else ties++;
    }
    return { teamId: team.id, teamName: team.name, score, wins, losses, ties };
  });

  rows.sort((a, b) => b.score - a.score);
  return rows.map((row, i) => ({ ...row, rank: i + 1 }));
}

/** Season standings through a given week, using vs.-all weekly records. Tiebreaker: total points for. */
export function computeSeasonStandings(
  teams: TeamInfo[],
  scores: ScoreEntry[],
  throughWeek: number,
): SeasonStandingRow[] {
  const totals = new Map<string, { wins: number; losses: number; ties: number; pointsFor: number; gamesPlayed: number }>();
  for (const team of teams) {
    totals.set(team.id, { wins: 0, losses: 0, ties: 0, pointsFor: 0, gamesPlayed: 0 });
  }

  for (let week = 1; week <= throughWeek; week++) {
    const weekRows = computeWeeklyRecord(teams, scores, week);
    for (const row of weekRows) {
      const t = totals.get(row.teamId)!;
      t.wins += row.wins;
      t.losses += row.losses;
      t.ties += row.ties;
      t.pointsFor += row.score;
      t.gamesPlayed += row.wins + row.losses + row.ties;
    }
  }

  const rows = teams.map((team) => {
    const t = totals.get(team.id)!;
    const winPct = t.gamesPlayed > 0 ? (t.wins + 0.5 * t.ties) / t.gamesPlayed : 0;
    return { teamId: team.id, teamName: team.name, ...t, winPct };
  });

  rows.sort((a, b) => b.winPct - a.winPct || b.pointsFor - a.pointsFor);
  return rows.map((row, i) => ({ ...row, rank: i + 1 }));
}

export interface PlayoffTeam {
  teamId: string;
  teamName: string;
  seed: number;
}

export interface PlayoffMatchResult extends PlayoffTeam {
  rawScore?: number;
  hfaBonus: number | "bye";
  adjustedScore?: number;
  advanced?: boolean;
}

export interface PlayoffBracket {
  round1: { week: number; teams: PlayoffMatchResult[]; complete: boolean };
  round2: { week: number; teams: PlayoffMatchResult[]; complete: boolean };
  finals: { week: number; teams: PlayoffMatchResult[]; complete: boolean; championId?: string };
}

/** Builds the 6-seed playoff bracket (bye for 1-2, Round 1 for 3-6, reseeded Round 2, HFA-free Finals). */
export function computePlayoffBracket(
  seeds: PlayoffTeam[],
  scores: ScoreEntry[],
  regularSeasonWeeks: number,
): PlayoffBracket {
  const playoffWeeks = {
    round1: regularSeasonWeeks + 1,
    round2: regularSeasonWeeks + 2,
    finals: regularSeasonWeeks + 3,
  };
  const bySeed = new Map(seeds.map((s) => [s.seed, s]));

  // Round 1: seeds 3-6 play, HFA applied.
  const round1Teams: PlayoffMatchResult[] = [3, 4, 5, 6]
    .map((seed) => bySeed.get(seed))
    .filter((t): t is PlayoffTeam => !!t)
    .map((t) => {
      const rawScore = scoreFor(scores, t.teamId, playoffWeeks.round1);
      const hfaBonus = HFA_ROUND1[t.seed] ?? 0;
      const adjustedScore = rawScore !== undefined && typeof hfaBonus === "number" ? rawScore + hfaBonus : undefined;
      return { ...t, rawScore, hfaBonus, adjustedScore };
    });

  const round1Complete = round1Teams.length === 4 && round1Teams.every((t) => t.adjustedScore !== undefined);
  let round1Winners: PlayoffTeam[] = [];
  if (round1Complete) {
    const ranked = [...round1Teams].sort((a, b) => (b.adjustedScore ?? 0) - (a.adjustedScore ?? 0));
    round1Winners = ranked.slice(0, 2).map((t) => ({ teamId: t.teamId, teamName: t.teamName, seed: t.seed }));
    for (const t of round1Teams) {
      t.advanced = round1Winners.some((w) => w.teamId === t.teamId);
    }
  }

  // Round 2: seeds 1-2 + the two Round 1 winners, reseeded by original regular-season seed.
  const seedsOneTwo = [1, 2].map((seed) => bySeed.get(seed)).filter((t): t is PlayoffTeam => !!t);
  const round2Field = round1Complete ? [...seedsOneTwo, ...round1Winners].sort((a, b) => a.seed - b.seed) : [];
  const round2Teams: PlayoffMatchResult[] = round2Field.map((t, i) => {
    const newSeed = i + 1;
    const rawScore = scoreFor(scores, t.teamId, playoffWeeks.round2);
    const hfaBonus = HFA_ROUND2[newSeed] ?? 0;
    const adjustedScore = rawScore !== undefined ? rawScore + hfaBonus : undefined;
    return { teamId: t.teamId, teamName: t.teamName, seed: newSeed, rawScore, hfaBonus, adjustedScore };
  });

  const round2Complete = round2Teams.length === 4 && round2Teams.every((t) => t.adjustedScore !== undefined);
  let round2Winners: PlayoffTeam[] = [];
  if (round2Complete) {
    const ranked = [...round2Teams].sort((a, b) => (b.adjustedScore ?? 0) - (a.adjustedScore ?? 0));
    round2Winners = ranked.slice(0, 2).map((t) => ({ teamId: t.teamId, teamName: t.teamName, seed: t.seed }));
    for (const t of round2Teams) {
      t.advanced = round2Winners.some((w) => w.teamId === t.teamId);
    }
  }

  // Finals: no HFA.
  const finalsTeams: PlayoffMatchResult[] = round2Complete
    ? round2Winners.map((t) => {
        const rawScore = scoreFor(scores, t.teamId, playoffWeeks.finals);
        return { ...t, rawScore, hfaBonus: 0, adjustedScore: rawScore };
      })
    : [];
  const finalsComplete = finalsTeams.length === 2 && finalsTeams.every((t) => t.rawScore !== undefined);
  let championId: string | undefined;
  if (finalsComplete) {
    championId = [...finalsTeams].sort((a, b) => (b.rawScore ?? 0) - (a.rawScore ?? 0))[0].teamId;
  }

  return {
    round1: { week: playoffWeeks.round1, teams: round1Teams, complete: round1Complete },
    round2: { week: playoffWeeks.round2, teams: round2Teams, complete: round2Complete },
    finals: { week: playoffWeeks.finals, teams: finalsTeams, complete: finalsComplete, championId },
  };
}

/** The Weekly Most PF winner for a given week (ties split the payout). */
export function computeWeeklyMostPF(teams: TeamInfo[], scores: ScoreEntry[], week: number) {
  const weekRows = computeWeeklyRecord(teams, scores, week);
  if (weekRows.length === 0) return [];
  const top = weekRows[0].score;
  return weekRows.filter((r) => r.score === top);
}
