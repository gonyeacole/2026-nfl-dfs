import "server-only";
import { prisma } from "@/lib/prisma";
import { LEAGUE_DEFAULTS } from "@/lib/league-defaults";
import type { ScoreEntry, TeamInfo } from "@/lib/standings";

export async function getLeague() {
  const league = await prisma.league.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...LEAGUE_DEFAULTS },
  });
  return {
    ...league,
    buyIn: Number(league.buyIn),
    weeklyMostPfPayout: Number(league.weeklyMostPfPayout),
    seasonMostPfPayout: Number(league.seasonMostPfPayout),
    season1stPayout: Number(league.season1stPayout),
    season2ndPayout: Number(league.season2ndPayout),
    season3rdPayout: Number(league.season3rdPayout),
  };
}

export async function getTeams(): Promise<TeamInfo[]> {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  return teams.map((t) => ({ id: t.id, name: t.name, owner: t.owner }));
}

export async function getAllScores(): Promise<ScoreEntry[]> {
  const scores = await prisma.weeklyScore.findMany();
  return scores.map((s) => ({ teamId: s.teamId, week: s.week, score: Number(s.dfsScore) }));
}

export async function getScoresForWeek(week: number): Promise<ScoreEntry[]> {
  const scores = await prisma.weeklyScore.findMany({ where: { week } });
  return scores.map((s) => ({ teamId: s.teamId, week: s.week, score: Number(s.dfsScore) }));
}
